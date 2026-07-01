# Routing System

This document explains the application's routing architecture: the centralised path catalogue, the two-shell auth/app layout split, lazy loading at every level, the feature route trees (deputy + dev-sandbox), and the guards/resolvers that gate navigation.

For layout flex behaviour, scroll handling, and shell composition, see [Layout System](./layout-system.md).

---

## Overview

The routing tree has three concentric layers:

```
APP_ROUTES (app.routes.ts)
├── ''            → redirect to /stellvertreter
├── 'anmelden'    → AuthLayout shell  (loginGuard)
│                     └── Login
└── ''            → AppLayout shell   (authGuard)
        ├── 'stellvertreter' → DEPUTY_ROUTES   (lazy loadChildren)
        ├── 'dev-sandbox'    → DEV_SANDBOX_ROUTES (lazy loadChildren)
        └── '**'             → PageNotFound
```

- **Outer**: top-level redirect + the two layout shells.
- **Middle**: each shell is a lazy `loadComponent` whose children are the protected feature areas or the login page.
- **Inner**: each feature exposes its own `Routes` array via `loadChildren`, with another `loadComponent`-based feature outlet at the root.

Every routed component — shell, feature outlet, page — is loaded via dynamic `import()`. There is no eager component registration in `APP_ROUTES`.

---

## Path Catalogue (`app.paths.ts`)

All static URL segments live in a single `APP_PATHS` const, used as the single source of truth by route configs, guards, resolvers, interceptors, and any component performing imperative navigation.

```typescript
export const APP_PATHS = {
    ROOT: '/',
    LOGIN: 'anmelden',
    FEATURE: {
        DEPUTY: 'stellvertreter',
        DEV_SANDBOX: 'dev-sandbox',
    },
    SECTION: {
        LIST: 'alle',
        DETAIL: 'detail',
        ROLES: 'rollen',
        CREATE: 'erstellen',
        UPDATE: 'aktualisieren',
        READONLY: 'nur-lesen',
    },
} as const;
```

### Conventions

- **German segments.** User-visible URLs are in German (`anmelden`, `stellvertreter`, `erstellen`, `aktualisieren`, `nur-lesen`, `rollen`, `alle`). Only internal/developer routes use English (`dev-sandbox`).
- **Three tiers.** `LOGIN` / `ROOT` are top-level. `FEATURE.*` are feature roots mounted under the `AppLayout` shell. `SECTION.*` are sub-routes inside a feature.
- **No leading slash on segments.** `APP_PATHS.LOGIN` is `'anmelden'`, not `'/anmelden'` — slashes are added by the router or by callers as needed (`navigateByUrl(APP_PATHS.ROOT)` is the only consumer of the literal slash).
- **`as const`.** The whole object is frozen so values are literal string types — refactors that change a segment fail at the call site rather than silently routing wrong.

### Where `APP_PATHS` is consumed

| Concern | Consumer | Usage |
| --- | --- | --- |
| Route declarations | `app.routes.ts`, `deputy.routes.ts` | `path:`, `redirectTo:` |
| Auth guards | `auth.guard.ts`, `login.guard.ts` | `router.createUrlTree([...])` |
| HTTP interceptor | `auth.interceptor.ts` | `router.navigate([APP_PATHS.LOGIN])` on 401 |
| Resolver fallback | `deputy.resolver.ts` | `router.navigate([` /${APP_PATHS.FEATURE.DEPUTY}` ])` on error |
| Imperative navigation | `deputy-list.ts`, `user-menu.ts`, `page-not-found.ts`, `back-button.ts` | `router.navigate([...])`, `router.navigateByUrl(...)` |
| Template links | `header.ts` (`rootPath`), `dev-sandbox-nav.ts` (`basePath`) | bound to `routerLink` |

`dev-sandbox.routes.ts` is the one exception — its child paths (`components`, `typography`, `colours`, …) are inline string literals rather than `APP_PATHS.SECTION.*` entries, on the basis that they're developer-only screens and don't share segments with the production feature areas.

---

## Router Providers (`app.config.ts`)

```typescript
provideRouter(
    APP_ROUTES,
    withComponentInputBinding(),
    withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
),
```

| Feature | Effect |
| --- | --- |
| `withComponentInputBinding()` | Route params, query params, and `data` are bound directly to component `input()` signals matching the param name — no `ActivatedRoute` plumbing required. |
| `withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })` | Browser restores scroll position on back/forward navigation. |
| `Scroll` event subscriber (in a `provideEnvironmentInitializer`) | For forward navigations (no stored position), scrolls the desktop scroll container (`main.main-content > *:not(router-outlet)`) to top. See [Layout System](./layout-system.md#scroll-reset). |

---

## Auth Shells

The two shells are siblings at the top level. The router picks one based on which guard passes — they are mutually exclusive in practice.

### `AuthLayout` — unauthenticated shell

`core/layout/auth-layout.ts`. Mounted at `path: APP_PATHS.LOGIN` (`/anmelden`). Renders a router-outlet + footer only — no header, no sidebar. Protected by `loginGuard`, which **redirects authenticated users away** to the deputy feature, ensuring the login page is never shown when a session already exists.

```typescript
{
    path: APP_PATHS.LOGIN,
    canActivate: [loginGuard],
    loadComponent: () => import('./core/layout/auth-layout').then((m) => m.AuthLayout),
    children: [
        { path: '', loadComponent: () => import('./core/auth/login/login').then((m) => m.Login) },
    ],
}
```

The shell itself is also lazy-loaded — the login bundle (shell + page) is only fetched when an anonymous user lands on `/anmelden`.

### `AppLayout` — authenticated shell

`core/layout/app-layout.ts`. Mounted at `path: ''` and contains the header, sidebar, main content area, and footer. Protected by `authGuard`, which **redirects unauthenticated users to login**.

```typescript
{
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/app-layout').then((m) => m.AppLayout),
    children: [
        { path: APP_PATHS.FEATURE.DEPUTY, loadChildren: () => import('./features/deputy/deputy.routes')... },
        { path: APP_PATHS.FEATURE.DEV_SANDBOX, loadChildren: () => import('./features/dev-sandbox/dev-sandbox.routes')... },
        { path: '**', loadComponent: () => import('./core/layout/page-not-found/page-not-found')... },
    ],
}
```

All authenticated routes live as **children** of this shell, so the shell's router-outlet hosts the routed feature view. The shell mounts once and stays mounted across feature navigations — only the inner outlet changes.

### Guard semantics

Both guards consult the same `AuthState` singleton, which fetches the session user once and caches the signal:

| Guard | File | Allow when | Otherwise redirect to |
| --- | --- | --- | --- |
| `authGuard` | `core/guards/auth.guard.ts` | `AuthState.checkAuth()` resolves to a non-null user | `/anmelden` |
| `loginGuard` | `core/guards/login.guard.ts` | `AuthState.checkAuth()` resolves to `null` | `/stellvertreter` |

Both return a `UrlTree` for the redirect path (via `router.createUrlTree([...])`) rather than triggering a separate navigation — the router merges this into the current activation.

The `authInterceptor` (registered in `app.config.ts` HTTP chain) complements the guard: if any in-flight HTTP request returns 401, it triggers `router.navigate([APP_PATHS.LOGIN])`, recovering from a mid-session expiry.

---

## Lazy Loading

The app lazy-loads at three granularities:

1. **Shells** via `loadComponent` — `AuthLayout` and `AppLayout` are dynamic imports.
2. **Feature route trees** via `loadChildren` — `DEPUTY_ROUTES`, `DEV_SANDBOX_ROUTES` are imported only when their feature root is hit.
3. **Pages inside a feature** via `loadComponent` — every child route (list, details form, roles form, sandbox pages) is its own dynamic import.

There is no preloading strategy configured — pages are fetched on first activation only. The webpack chunk graph therefore mirrors the route tree almost 1:1.

Every dynamic import follows the same pattern:

```typescript
loadComponent: () => import('./path/to/component').then((m) => m.ComponentName)
```

```typescript
loadChildren: () => import('./feature.routes').then((m) => m.FEATURE_ROUTES)
```

This keeps the initial bundle to: `App` + `app.config.ts` providers + `APP_ROUTES` (just the route metadata) + the two guards + `AuthState`. Everything else streams in on navigation.

---

## Feature Routes

### Deputy (`features/deputy/deputy.routes.ts`)

The deputy feature is the production feature. Its routes mount under `/stellvertreter` and use a feature outlet to give the feature its own router-outlet scope.

```
/stellvertreter
└── DeputyFeatureOutlet          (loadComponent — just a <router-outlet />)
    ├── ''                          → redirect to 'alle'
    ├── 'alle'                      → DeputyList                          (LIST)
    ├── 'erstellen'                 → DeputyDetailsForm (FormMode.CREATE) (CREATE; canDeactivate)
    ├── 'aktualisieren/:deputyId'   → DeputyDetailsForm (FormMode.UPDATE) (UPDATE; canDeactivate + resolver)
    ├── 'nur-lesen/:deputyId'       → DeputyDetailsForm (FormMode.READONLY) (READONLY; resolver)
    └── 'rollen/:deputyId'          → DeputyRolesForm                      (ROLES)
```

**Why the feature outlet?** `DeputyFeatureOutlet` is a one-line component (`<router-outlet />` only) that gives the feature its own outlet scope inside the `AppLayout` shell. Without it, every child path would need to be declared inline in `app.routes.ts`, defeating the purpose of `loadChildren`.

**Three modes, one form component.** `DeputyDetailsForm` is reused across `CREATE`, `UPDATE`, and `READONLY`. The mode is passed via the route's `data` object:

```typescript
{
    path: APP_PATHS.SECTION.CREATE,
    loadComponent: () => import('./deputy-details-form/deputy-details-form').then((m) => m.DeputyDetailsForm),
    canDeactivate: [formDeactivateGuard],
    data: { formMode: FormMode.CREATE },
}
```

With `withComponentInputBinding()` enabled, the component reads `formMode` as a typed signal `input()`. No `ActivatedRoute.data` subscription is required.

**Resolver.** Both the UPDATE and READONLY paths attach a `deputyDetailsResolver` (`features/deputy/deputy.resolver.ts`) that:

- Reads `:deputyId` from `route.paramMap`.
- Calls `UsersService.getUserById(...)` (auto-generated).
- Pipes through `withMinDuration()` to floor the latency at a minimum display time, preventing a flash of the loading indicator.
- On error, navigates to the deputy feature root and swallows the error to `EMPTY` (the `httpErrorInterceptor` already surfaces a dialog).

The resolved `deputy` becomes available to the routed component as an `input()` via component input binding.

**Form deactivation.** Both CREATE and UPDATE paths attach `formDeactivateGuard` (`core/guards/form-deactivate.guard.ts`). The guard expects the component to implement `HasUnsavedChanges`, checks `component.hasUnsavedChanges()`, and if true, calls `DialogService.confirm({...})` to prompt the user before allowing navigation away.

### Dev Sandbox (`features/dev-sandbox/dev-sandbox.routes.ts`)

Developer-facing screens for inspecting components, typography, colours, tables, spinners, CSS vars, icons, elevation, dialogs, toasts, tabs, and tooltips. Mounted under `/dev-sandbox`.

```
/dev-sandbox
└── DevSandbox                   (loadComponent — feature shell with internal nav)
    ├── ''            → redirect to 'components'
    ├── 'components'
    ├── 'typography'
    ├── 'colours'
    ├── 'tables'
    ├── 'spinners'
    ├── 'css-vars'
    ├── 'icons'
    ├── 'elevation'
    ├── 'dialogs'
    ├── 'toasts'
    ├── 'tabs'
    └── 'tooltips'
```

Unlike the deputy feature, the sandbox root component (`DevSandbox`) is itself the feature shell — it contains both the navigation (`DevSandboxNav`) and the `<router-outlet>`. Each sub-page is its own lazy-loaded component.

Sub-page paths are inline string literals (not `APP_PATHS.SECTION.*`) since they don't share segments with production paths and aren't referenced from anywhere outside the sandbox.

---

## Wildcard / Page Not Found

The `'**'` wildcard is the last child of `AppLayout`, so 404s render **inside** the authenticated shell (with header, sidebar, footer all intact). Anonymous 404s would be intercepted by `authGuard` and redirected to login first.

```typescript
{
    path: '**',
    loadComponent: () => import('./core/layout/page-not-found/page-not-found').then((m) => m.PageNotFound),
}
```

`PageNotFound` captures `router.url` into a `signal` so the not-found view can display the offending path, and exposes a `navigateHome()` that calls `router.navigateByUrl(APP_PATHS.ROOT, { replaceUrl: true })` — `replaceUrl: true` keeps the bad URL out of history so back-button doesn't loop the user back into the 404.

---

## Navigation Patterns

### Imperative navigation

Components and services compose paths from `APP_PATHS` and pass them as array segments to `router.navigate(...)`:

```typescript
// deputy-list.ts
this.router.navigate([APP_PATHS.FEATURE.DEPUTY, APP_PATHS.SECTION.CREATE]);
this.router.navigate([APP_PATHS.FEATURE.DEPUTY, APP_PATHS.SECTION.UPDATE, id]);
this.router.navigate([APP_PATHS.FEATURE.DEPUTY, APP_PATHS.SECTION.ROLES, id]);
```

Use `router.navigate([...])` for relative or composed paths, and `router.navigateByUrl(literal)` only for full string URLs (e.g. `APP_PATHS.ROOT`).

### Template links

Templates use `[routerLink]` bound to a property that holds a path composed from `APP_PATHS`:

```typescript
// header.ts
readonly rootPath = APP_PATHS.ROOT;

// dev-sandbox-nav.ts
protected readonly basePath = `/${APP_PATHS.FEATURE.DEV_SANDBOX}`;
```

### Back navigation

`BackButton` (`shared/components/back-button/back-button.ts`) is history-aware:

- If there is a previous navigation in the SPA's history (`window.history.state?.navigationId > 1`), it calls `Location.back()`.
- Otherwise — e.g. when a user lands on a deep-linked detail page — it falls back to `router.navigateByUrl(APP_PATHS.ROOT)`.

This avoids the common pitfall of `location.back()` taking the user out of the app entirely on a fresh load.

---

## Component Input Binding

`withComponentInputBinding()` makes the router populate component `input()` signals from three sources:

- **Route params** (`:deputyId` → `input<string>('deputyId')`)
- **Query params**
- **`data` payload** (`data: { formMode }` → `input<FormMode>('formMode')`)
- **Resolver results** (`resolve: { deputy }` → `input<UserDto>('deputy')`)

This removes nearly all `ActivatedRoute` injection from page components. The deputy details form, for example, receives `formMode`, `deputyId`, and the resolved `deputy` as plain signal inputs — no manual subscription, no `takeUntilDestroyed`, no `paramMap.pipe(...)` boilerplate.

---

## Adding a New Route

A checklist for adding a new screen under an existing feature:

1. **Add the segment to `APP_PATHS`.** Put it under `SECTION` if it's a sub-route, or under `FEATURE` if it's a new feature root. Use German for user-visible URLs.
2. **Add the route entry** to the relevant feature `Routes` array. Use `loadComponent` (or `loadChildren` for a nested route tree).
3. **Wire any guards / resolvers / data.** `canActivate`, `canDeactivate`, `resolve`, `data` — all attach at the route level.
4. **Navigate via `APP_PATHS`.** Never hard-code the URL segment at the call site.

A checklist for adding a new **feature** (a new sibling of `deputy`):

1. Add `APP_PATHS.FEATURE.<NAME>` and the section segments it needs.
2. Create `features/<name>/<name>.routes.ts` exporting `<NAME>_ROUTES: Routes`.
3. Create a one-line `<name>.outlet.ts` (`<router-outlet />`) if the feature has child pages.
4. Add a child entry under the `AppLayout` shell in `app.routes.ts` using `loadChildren`.
5. Add any feature-specific guards/resolvers under `core/guards/` or `features/<name>/`.

---

## Summary

| Concern | Where it lives |
| --- | --- |
| Static path segments | `app.paths.ts` (`APP_PATHS`) |
| Top-level route tree | `app.routes.ts` |
| Router providers | `app.config.ts` (`provideRouter`, scroll handling) |
| Auth shells | `core/layout/auth-layout.ts`, `core/layout/app-layout.ts` |
| Auth guards | `core/guards/auth.guard.ts`, `core/guards/login.guard.ts` |
| Form-leave guard | `core/guards/form-deactivate.guard.ts` |
| Auth state | `core/auth/auth-state.ts` |
| 401 redirect | `core/interceptors/auth.interceptor.ts` |
| Deputy feature routes | `features/deputy/deputy.routes.ts` |
| Deputy feature outlet | `features/deputy/deputy.outlet.ts` |
| Deputy details resolver | `features/deputy/deputy.resolver.ts` |
| Dev sandbox routes | `features/dev-sandbox/dev-sandbox.routes.ts` |
| Wildcard / 404 | `core/layout/page-not-found/page-not-found.ts` |

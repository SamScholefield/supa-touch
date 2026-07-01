# Layout System

This document explains the application's responsive layout architecture, including the router-driven layout shells, the flex-based page structure, the breakpoint system, and the media queries that control header and footer behaviour.

---

## Route-Driven Layouts

The application uses two layout shell components, selected by the router based on authentication state. The `App` root component renders only a `<router-outlet>` and `<app-toast-container>` — all structural layout is delegated to these shells.

### AppLayout (`core/layout/app-layout.ts`)

The authenticated layout. Rendered when `authGuard` passes. Contains the header, sidebar, main content area, and footer.

```
<app-root>                  ← flex column, full viewport height
  <router-outlet>
  <app-layout>              ← flex column, flex: 1
    <app-header>            ← fixed height (--header-height)
    <div.content-area>      ← flex row, flex: 1
      <app-sidebar>         ← persistent on desktop, offcanvas on tablet/mobile
      <main.main-content>   ← fills remaining space, max-width 1440px, centred
        <router-outlet>
        <routed-component>  ← flex: 1 inside main-content
      </main>
    </div>
    <app-footer>            ← variable height per breakpoint
  </app-layout>
  <app-toast-container>     ← position: fixed, outside layout flow
</app-root>
```

### AuthLayout (`core/layout/auth-layout.ts`)

The unauthenticated layout. Rendered at the `/login` route when `loginGuard` passes (user is not authenticated). Contains only a router-outlet (for the Login page) and the footer — no header.

```
<app-root>
  <router-outlet>
  <app-auth-layout>         ← flex column, flex: 1
    <router-outlet>
    <app-login>             ← flex: 1, fills available space
    <app-footer>
  </app-auth-layout>
  <app-toast-container>
</app-root>
```

Both layout components are single-file components with inline template and styles. Both set `:host { display: flex; flex-direction: column; flex: 1; min-height: 0 }` to maintain the flex chain from `app-root`.

### Route Guards

| Guard | Location | Purpose |
| --- | --- | --- |
| `authGuard` | `core/guards/auth.guard.ts` | Checks auth via `AuthState.checkAuth()`; redirects to `/login` if unauthenticated |
| `loginGuard` | `core/guards/login.guard.ts` | Checks auth via `AuthState.checkAuth()`; redirects to `/stellvertrater` if already authenticated |

### Route Structure

```
''              → redirectTo: 'stellvertrater'
'anmelden'      → AuthLayout (loginGuard)
                    '' → Login
''              → AppLayout (authGuard)
                    'stellvertrater' → lazy DeputyRoutes
                    'dev-sandbox' → lazy DevSandboxRoutes
```

### Scroll Reset

Forward navigations (imperative triggers like `router.navigate()` or `routerLink` clicks) reset scroll to top on both the window and the desktop scroll container. Back/forward (popstate) navigations preserve scroll position. Configured in `app.config.ts` via a `NavigationStart`/`NavigationEnd` pair filtered by `navigationTrigger === 'imperative'`.

---

## CSS Custom Properties

Defined in `_aek-layout.scss` on `:root`:

| Variable                 | Desktop             | Tablet                     | Mobile                     |
| ------------------------ | ------------------- | -------------------------- | -------------------------- |
| `--header-height`        | `4rem`              | `4rem`                     | `4rem`                     |
| `--sidebar-width`        | `280px`             | `280px`                    | `280px`                    |
| `--footer-height`        | `2.5rem`            | —                          | —                          |
| `--footer-height-tablet` | —                   | `7rem`                     | —                          |
| `--footer-height-mobile` | —                   | —                          | `10rem`                    |
| `--active-footer-height` | `= --footer-height` | `= --footer-height-tablet` | `= --footer-height-mobile` |

`--active-footer-height` is swapped via media queries in `:root`. The main content area uses `flex: 1` to fill remaining space, so no height calculation is needed.

---

## Flex Layout Rules

### App Root (`app.scss`)

```scss
:host {
    display: flex;
    flex-direction: column;
    height: 100vh; // locks to viewport on desktop
}
```

The root is a flex column spanning the full viewport. The layout shell component fills the remaining space via `flex: 1`.

### Layout Shells (`app-layout.ts`, `auth-layout.ts`)

```scss
:host {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
}
```

Each layout shell fills `app-root`'s remaining space and passes flex-column context to its children (header, main, footer).

### Main Content (`_aek-layout.scss`)

```scss
main.main-content {
    flex: 1; // fills remaining space between header and footer
    min-height: 0; // allows flex item to shrink below content size
    overflow: hidden; // page content scrolls internally
    max-width: 1440px; // content width cap
    margin: 0 auto; // centred horizontally

    > *:not(router-outlet) {
        // targets the routed component host
        display: flex;
        flex-direction: column;
        flex: 1; // fills main-content
        overflow: auto; // scrollbar appears here
    }
}
```

The `max-width: 1440px` with `margin: 0 auto` centres content on wide viewports. The header and footer span the full viewport width; only the main content area is capped.

On desktop, the page is viewport-locked:

- The app root is exactly `100vh`
- The layout shell fills remaining space via `flex: 1`
- `.main-content` fills remaining space within the layout shell via `flex: 1` (with `min-height: 0` to allow shrinking)
- The routed component fills `.main-content` via `flex: 1`
- Overflow scrolls **inside** the routed component (`overflow: auto`), keeping header and footer fixed in place

This `> *:not(router-outlet)` rule eliminates the need for `:host` boilerplate in every page component's SCSS.

---

## Routed Component Sizing & Overflow

Routed components (pages rendered via `<router-outlet>`) do **not** need any `:host` styles to fill the available space. The global `> *:not(router-outlet)` rule in `_aek-layout.scss` handles it automatically.

### How It Works

Angular renders the routed component's host element as a sibling of `<router-outlet>` inside `.main-content`:

```html
<main class="main-content">
    <router-outlet></router-outlet>
    <app-deputy-list></app-deputy-list> ← this is the host element
</main>
```

The global rule targets that host element:

```scss
main.main-content > *:not(router-outlet) {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    overflow: auto; // desktop only — removed below 992px
}
```

This means every routed component automatically:

- Is a flex column container (`display: flex; flex-direction: column`)
- Fills the available height (`flex: 1`)
- Spans the full width (`width: 100%`)
- Scrolls internally on desktop (`overflow: auto`)

### Page Template (`shared/templates/page-template/`)

The `PageTemplate` component provides a consistent page structure with a sticky toolbar, content area, and back-to-top button:

```html
<app-page-template>
    <span pageTitle>Page Title</span>
    <div pageToolbarNav><!-- optional nav content (breadcrumbs, tab links) --></div>
    <div pageToolbarPageControls><!-- optional view controls (search, sort, filters) --></div>
    <div pageToolbarPageActions><!-- optional actions (add, export buttons) --></div>

    <!-- page body content -->
</app-page-template>
```

**Toolbar sections:**

| Slot | Grid area | Purpose | Built-in content |
|---|---|---|---|
| `pageTitle` | `title` | Page heading | `<h1>` wrapper |
| `pageToolbarNav` | `nav` | In-page navigation | Back button |
| `pageToolbarPageControls` | `controls` | View manipulation | Sidebar filter toggle |
| `pageToolbarPageActions` | `actions` | Entity/page actions | *(none)* |

**Structure:**

```
<app-page-template>
  <div.page-toolbar>       ← sticky, padded (0.75rem 1rem 0), grid layout with 4 areas
  <div.page-body>          ← flex: 1, margin (0 1rem 2.5rem), holds projected content
  <app-back-to-top>        ← sticky floating button, bottom-right
</app-page-template>
```

Page margins and spacing are handled entirely within the component's SCSS — no global utility classes needed.

**Page Toolbar** is `position: sticky; top: 0` within the scroll container. On tablet/mobile, it sits below the header (`top: var(--header-height)`) and transitions to `top: 0` when the header auto-hides, coordinated via the `HeaderVisibility` service.

**Inputs:**

| Input               | Type      | Default | Description                               |
| ------------------- | --------- | ------- | ----------------------------------------- |
| `displayBackButton` | `boolean` | `true`  | Show/hide the back navigation button      |
| `displayBackToTop`  | `boolean` | `true`  | Show/hide the back-to-top floating button |

### Back to Top (`shared/components/back-to-top/`)

A floating button that appears after 200px of scroll and smooth-scrolls the content container back to top. Automatically included in every page via `PageTemplate`.

- Walks up the DOM to find the nearest scrollable ancestor (the routed component host with `overflow: auto`)
- Uses `position: sticky; bottom: 1rem` with `margin-left: auto` to sit at the bottom-right
- Fades in/out with a 0.2s opacity + translateY transition
- Listens to scroll events passively, cleaned up via `DestroyRef`

### HeaderVisibility Service (`core/utils/header-visibility.ts`)

A `providedIn: 'root'` singleton that coordinates header hide/show state between the header component and the page toolbar:

```typescript
@Injectable({ providedIn: 'root' })
export class HeaderVisibility {
    readonly isHidden = signal(false);
}
```

The header sets `isHidden` based on scroll direction. The page toolbar reads it to adjust its sticky `top` offset, ensuring it slides up to `top: 0` when the header hides.

### Desktop vs Tablet/Mobile Overflow

The overflow model changes by breakpoint:

| Concern                     | Desktop (`≥ 992px`)                             | Tablet & Mobile (`< 992px`)                  |
| --------------------------- | ----------------------------------------------- | -------------------------------------------- |
| Routed component `overflow` | `auto` — scrollbar appears inside the component | `visible` — no internal scrollbar            |
| What scrolls                | The routed component's content area             | The browser window                           |
| Footer position             | Fixed at viewport bottom (never moves)          | Pushed below content (scrolls with page)     |
| Page height                 | Fills remaining space via `flex: 1`             | At least remaining space, grows with content |

On **desktop**, the routed component acts as the scroll container. The header and footer remain fixed in the viewport because `.main-content` has `overflow: hidden` and the routed component has `overflow: auto`. Content scrolls within the page area only.

On **tablet/mobile**, overflow is set to `visible` at both the `.main-content` and routed component level. The entire document scrolls via the browser window, which is what allows the header auto-hide and the footer to be pushed off-screen by long content.

---

## Breakpoint System

### Tiers

| Tier    | Range              | Bootstrap equivalents |
| ------- | ------------------ | --------------------- |
| Mobile  | `< 576px`          | xs                    |
| Tablet  | `576px – 991.98px` | sm + md               |
| Desktop | `≥ 992px`          | lg + xl + xxl         |

### Breakpoint Service (`core/utils/breakpoint.ts`)

A `providedIn: 'root'` service using `@angular/cdk/layout` `BreakpointObserver`, exposing reactive signals:

| Signal      | Type              | Description                           |
| ----------- | ----------------- | ------------------------------------- |
| `isMobile`  | `Signal<boolean>` | True when `< 576px`                   |
| `isTablet`  | `Signal<boolean>` | True when `576px – 991.98px`          |
| `isDesktop` | `Signal<boolean>` | True when `≥ 992px`                   |
| `layout`    | `Signal<Layout>`  | Current layout as `Layout` enum value |

The `Layout` enum (`shared/enums/layout.ts`) provides `Layout.Mobile`, `Layout.Tablet`, `Layout.Desktop`.

**Usage:**

```typescript
readonly breakpoint = inject(Breakpoint);

// in template
@if (breakpoint.layout() === Layout.Mobile) {
  <mobile-view />
}
```

Use the `Breakpoint` service for programmatic/template logic. Use CSS media queries for style-only concerns. Both use the same breakpoint values for consistency.

---

## Sidebar (`core/layout/sidebar/`)

The sidebar operates in two modes — persistent on desktop, offcanvas on tablet/mobile — and supports dynamic content injection via `SidebarState.content`. For full documentation including state management, the `SidebarContentTemplate`, result passing, and scrollbar handling, see [Sidebar System](./sidebar-system.md).

### Content Area Wrapper

The `.content-area` div in `AppLayout` wraps the sidebar and main content:

```scss
.content-area {
    display: flex;
    flex-direction: row;
    flex: 1;
    min-height: 0;
}
```

This ensures the sidebar sits beside the main content on desktop, and the combined area fills the space between header and footer via `flex: 1`. On desktop, the sidebar takes `--sidebar-width` (280px) and sits outside the main content's `max-width: 1440px` constraint.

---

## Responsive Behaviour

### Below Desktop (`max-width: 991.98px`) — Tablet & Mobile

Three coordinated changes allow page content to push the footer off-screen:

**1. App root switches to `min-height`** (`app.scss`):

```scss
@media (max-width: 991.98px) {
    height: auto;
    min-height: 100vh;
}
```

The root can now grow beyond the viewport.

**2. Main content switches to `overflow: visible`** (`_aek-layout.scss`):

```scss
@media (max-width: 991.98px) {
    overflow: visible;

    > *:not(router-outlet) {
        overflow: visible;
    }
}
```

- `flex: 1` on main content (from the base rule) still fills the remaining space, and the root's `min-height: 100vh` ensures it grows with content
- `overflow: visible` removes the internal scrollbar — the whole page scrolls natively via the window

**3. Footer uses `--active-footer-height`** (`footer.scss`):

```scss
footer {
    min-height: var(--active-footer-height);
}
```

The footer's `min-height` ensures it takes a consistent minimum height at each breakpoint.

**Result:** Short pages fill the viewport with the footer at the bottom. Long pages push the footer below the fold, and the user scrolls the window to reach it.

### Header Responsive Padding

The header uses the `Breakpoint` service to apply responsive horizontal padding via class bindings in the template:

- **Desktop (`≥ 992px`):** `px-5` (3rem)
- **Tablet & Mobile (`< 992px`):** `px-3` (1rem)

### Header Auto-Hide (`header.ts` + `header.scss`)

Below desktop, the header becomes sticky and hides on scroll-down:

**CSS** (`header.scss`):

```scss
@media (max-width: 991.98px) {
    :host {
        position: sticky;
        top: 0;
        z-index: 1030;
        background-color: var(--bs-body-bg);
        transition: transform 0.3s ease;
    }

    :host(.header-hidden) {
        transform: translateY(-100%);
    }
}
```

**TypeScript** (`header.ts`):

- A `window` scroll listener (registered in `afterNextRender`, passive, throttled with `requestAnimationFrame`) tracks scroll direction
- When scrolling **down** past 50px: sets `isHidden` signal to `true`, which applies `.header-hidden` via host class binding, sliding the header up
- When scrolling **up**: sets `isHidden` to `false`, sliding the header back
- On **desktop**: the listener short-circuits (`isDesktop()` check), so the header stays in normal document flow
- The listener is cleaned up via `DestroyRef`

---

## Key Relationships

```
app-root (flex column, 100vh)
  └── app-layout (flex column, flex: 1)        ← authenticated shell
        ├── app-header              ← natural height (--header-height)
        ├── div.content-area        ← flex row, flex: 1
        │     ├── app-sidebar       ← persistent (desktop) or offcanvas (tablet/mobile)
        │     └── main.main-content ← flex: 1, fills remaining space
        │           └── routed component  ← flex: 1, overflow: auto (desktop)
        └── app-footer              ← min-height: --active-footer-height
```

The layout is purely flex-based. The layout shell sits between `app-root` and the structural elements, maintaining the flex chain via `flex: 1`. `--active-footer-height` updates per breakpoint to give the footer the correct minimum height; the main content area fills whatever space remains via `flex: 1`.

### Layout-Aware Overlay Components

Two fixed/sticky overlay components detect the footer's position via `getBoundingClientRect()` and adjust their `bottom` offset to avoid overlap:

- **`BackToTop`** — adjusts on tablet/mobile when the footer scrolls into view
- **`ToastContainer`** — adjusts bottom-positioned toasts when the footer is in view

Both use the same pattern: a passive window scroll listener checks `footer.getBoundingClientRect().top` against `window.innerHeight` and sets `style.bottom` to the visible footer height. See [Dialog & Toast System](./dialog-and-toast-system.md) for toast positioning details.

---

## Summary of Media Queries

| File                                 | Breakpoint   | What it does                                          |
| ------------------------------------ | ------------ | ----------------------------------------------------- |
| `_aek-layout.scss` `:root`           | `≤ 991.98px` | Switches `--active-footer-height` to tablet value     |
| `_aek-layout.scss` `:root`           | `≤ 575.98px` | Switches `--active-footer-height` to mobile value     |
| `_aek-layout.scss` `.main-content`   | `≤ 991.98px` | Switches to `overflow: visible`                       |
| `app.scss` `:host`                   | `≤ 991.98px` | Switches app root to `min-height: 100vh`              |
| `header.scss`                        | `≤ 991.98px` | Makes header sticky with auto-hide transition         |
| `page-template.scss` `.page-toolbar` | `≤ 991.98px` | Offsets sticky top below header, animates with header |

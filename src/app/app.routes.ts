import { Routes } from '@angular/router';

import { APP_PATHS } from './app.paths';
import { authGuard, guestGuard, systemAdminGuard } from './core/auth/auth-guard';

export const APP_ROUTES: Routes = [
  // Public area (no auth) — will host fixtures/results pages.
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: APP_PATHS.FEATURES.TABLES,
        loadComponent: () => import('./features/tables/tables').then((m) => m.Tables),
      },
      {
        path: APP_PATHS.FEATURES.FIXTURES,
        loadComponent: () => import('./features/fixtures/fixtures').then((m) => m.Fixtures),
      },
    ],
  },
  // Auth pages (chrome-less shell). guestGuard redirects signed-in users to /admin.
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () => import('./core/layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: APP_PATHS.FEATURES.LOGIN,
        loadComponent: () => import('./core/auth/login/login').then((m) => m.Login),
      },
      {
        path: APP_PATHS.FEATURES.CONFIRM_EMAIL,
        loadComponent: () =>
          import('./core/auth/confirm-email/confirm-email').then((m) => m.ConfirmEmail),
      },
    ],
  },
  // Authenticated admin area (header + sidebar + footer).
  {
    path: APP_PATHS.FEATURES.ADMIN,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./core/layout/app-layout/app-layout').then((m) => m.AppLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: APP_PATHS.FEATURES.TEAMS,
        loadChildren: () =>
          import('./features/teams/teams-feature.routes').then((m) => m.TEAMS_ROUTES),
      },
      {
        path: APP_PATHS.FEATURES.USERS,
        canActivate: [systemAdminGuard],
        loadChildren: () =>
          import('./features/users/users-feature.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: APP_PATHS.FEATURES.GROUPS,
        loadChildren: () =>
          import('./features/groups/groups-feature.routes').then((m) => m.GROUPS_ROUTES),
      },
      {
        path: APP_PATHS.FEATURES.RULES,
        loadChildren: () =>
          import('./features/rules/rules-feature.routes').then((m) => m.RULES_ROUTES),
      },
      {
        path: APP_PATHS.FEATURES.PROFILE,
        loadChildren: () =>
          import('./features/profile/profile-feature.routes').then((m) => m.PROFILE_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

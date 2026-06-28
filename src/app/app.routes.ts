import { Routes } from '@angular/router';

import { APP_PATHS } from './app.paths';
import { authGuard, guestGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  // Public area (no auth) — will host fixtures/results pages.
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/public-dashboard/public-dashboard').then((m) => m.PublicDashboard),
      },
    ],
  },
  // Auth pages (chrome-less shell). guestGuard redirects signed-in users to /admin.
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./core/layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: APP_PATHS.LOGIN,
        loadComponent: () => import('./features/login/login').then((m) => m.Login),
      },
      {
        path: APP_PATHS.CONFIRM_EMAIL,
        loadComponent: () =>
          import('./features/confirm-email/confirm-email').then((m) => m.ConfirmEmail),
      },
    ],
  },
  // Authenticated admin area (header + sidebar + footer).
  {
    path: APP_PATHS.ADMIN,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./core/layout/app-layout/app-layout').then((m) => m.AppLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

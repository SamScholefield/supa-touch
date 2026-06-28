import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-shell/public-shell').then((m) => m.PublicShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/public-dashboard/public-dashboard').then(
            (m) => m.PublicDashboard,
          ),
      },
    ],
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'confirm-email',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/confirm-email/confirm-email').then((m) => m.ConfirmEmail),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./layouts/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/admin-dashboard/admin-dashboard').then(
            (m) => m.AdminDashboard,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

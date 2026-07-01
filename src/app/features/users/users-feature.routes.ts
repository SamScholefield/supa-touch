import { Routes } from '@angular/router';
import { APP_PATHS } from '../../app.paths';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./users-feature-outlet').then((m) => m.UsersFeatureOutlet),
    children: [
      {
        path: '',
        redirectTo: APP_PATHS.SECTIONS.LIST,
        pathMatch: 'full',
      },
      {
        path: APP_PATHS.SECTIONS.LIST,
        loadComponent: () => import('./users-list/users-list').then((m) => m.UsersList),
      },
      {
        path: `${APP_PATHS.SECTIONS.EDIT}/:id`,
        loadComponent: () => import('./users-form/users-form').then((m) => m.UsersForm),
      },
    ],
  },
];

import { Routes } from '@angular/router';
import { APP_PATHS } from '../../app.paths';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile-feature-outlet').then((m) => m.ProfileFeatureOutlet),
    children: [
      {
        path: '',
        redirectTo: APP_PATHS.SECTIONS.DETAIL,
        pathMatch: 'full',
      },
      {
        path: APP_PATHS.SECTIONS.DETAIL,
        loadComponent: () => import('./profile-detail/profile-detail').then((m) => m.ProfileDetail),
      },
      {
        path: APP_PATHS.SECTIONS.EDIT,
        loadComponent: () => import('./profile-edit/profile-edit').then((m) => m.ProfileEdit),
      },
    ],
  },
];

import { Routes } from '@angular/router';
import { APP_PATHS } from '../../app.paths';

export const GROUPS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./groups-feature-outlet').then((m) => m.GroupsFeatureOutlet),
    children: [
      {
        path: '',
        redirectTo: APP_PATHS.SECTIONS.LIST,
        pathMatch: 'full',
      },
      {
        path: APP_PATHS.SECTIONS.LIST,
        loadComponent: () => import('./groups-list/groups-list').then((m) => m.GroupsList),
      },
      {
        path: APP_PATHS.SECTIONS.CREATE,
        loadComponent: () => import('./groups-form/groups-form').then((m) => m.GroupsForm),
      },
    ],
  },
];

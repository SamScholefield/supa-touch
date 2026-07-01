import { Routes } from '@angular/router';
import { APP_PATHS } from '../../app.paths';

export const TEAMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./teams-feature-outlet').then((m) => m.TeamsFeatureOutlet),
    children: [
      {
        path: '',
        redirectTo: APP_PATHS.SECTIONS.LIST,
        pathMatch: 'full',
      },
      {
        path: APP_PATHS.SECTIONS.LIST,
        loadComponent: () => import('./teams-list/teams-list').then((m) => m.TeamsList),
      },
      {
        path: APP_PATHS.SECTIONS.CREATE,
        loadComponent: () => import('./teams-form/teams-form').then((m) => m.TeamsForm),
      },
    ],
  },
];

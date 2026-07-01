import { Routes } from '@angular/router';
import { APP_PATHS } from '../../app.paths';

export const RULES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./rules-feature-outlet').then((m) => m.RulesFeatureOutlet),
    children: [
      {
        path: '',
        redirectTo: APP_PATHS.SECTIONS.DETAIL,
        pathMatch: 'full',
      },
      {
        path: APP_PATHS.SECTIONS.DETAIL,
        loadComponent: () => import('./rules-detail/rules-detail').then((m) => m.RulesDetail),
      },
    ],
  },
];

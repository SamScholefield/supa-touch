import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { APP_PATHS } from '../../app.paths';
import { Auth } from './auth';

/** Gates the authenticated (admin) area. Redirects guests to /login. */
export const authGuard: CanActivateFn & CanActivateChildFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isAuthenticated() ? true : router.createUrlTree([APP_PATHS.FEATURES.LOGIN]);
};

/** Keeps already-authenticated users out of /login, sending them to /admin. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isAuthenticated() ? router.createUrlTree([APP_PATHS.FEATURES.ADMIN]) : true;
};

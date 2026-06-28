import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { Auth } from './core/auth/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Restore any persisted Supabase session before the router activates, so route guards
    // evaluate against the real auth state on a hard refresh.
    provideAppInitializer(() => inject(Auth).restoreSession()),
  ],
};

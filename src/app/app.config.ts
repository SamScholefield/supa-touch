import { DOCUMENT } from '@angular/common';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
} from '@angular/core';
import {
  provideRouter,
  Router,
  Scroll,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { filter } from 'rxjs';

import { routes } from './app.routes';
import { Auth } from './core/auth/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Bind route params, query params, data and resolved values straight to component input()s.
      withComponentInputBinding(),
      // Restore scroll position on back/forward navigation.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    // Restore any persisted Supabase session before the router activates, so route guards
    // evaluate against the real auth state on a hard refresh.
    provideAppInitializer(() => inject(Auth).restoreSession()),
    // Forward navigations have no stored scroll position: reset the desktop scroll container
    // (the routed component host) to the top. Back/forward keeps its restored position.
    provideEnvironmentInitializer(() => {
      const router = inject(Router);
      const document = inject(DOCUMENT);
      router.events.pipe(filter((e): e is Scroll => e instanceof Scroll)).subscribe((e) => {
        if (e.position) {
          return;
        }
        document.querySelector('main.main-content > *:not(router-outlet)')?.scrollTo({ top: 0 });
      });
    }),
  ],
};

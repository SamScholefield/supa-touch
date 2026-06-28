import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, inject, Service, signal } from '@angular/core';

export enum Layout {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Desktop = 'desktop',
}

/**
 * Reactive viewport tier via `matchMedia` — no @angular/cdk dependency. Tiers match the layout
 * media queries: mobile `< 576px`, tablet `576–991.98px`, desktop `≥ 992px`.
 */
@Service()
export class Breakpoint {
  private readonly view = inject(DOCUMENT).defaultView;

  private readonly tabletQuery = this.view?.matchMedia('(min-width: 576px) and (max-width: 991.98px)');
  private readonly desktopQuery = this.view?.matchMedia('(min-width: 992px)');

  readonly isTablet = signal(this.tabletQuery?.matches ?? false);
  readonly isDesktop = signal(this.desktopQuery?.matches ?? true);
  readonly isMobile = computed(() => !this.isTablet() && !this.isDesktop());

  readonly layout = computed<Layout>(() =>
    this.isDesktop() ? Layout.Desktop : this.isTablet() ? Layout.Tablet : Layout.Mobile,
  );

  constructor() {
    const onTablet = (e: MediaQueryListEvent) => this.isTablet.set(e.matches);
    const onDesktop = (e: MediaQueryListEvent) => this.isDesktop.set(e.matches);
    this.tabletQuery?.addEventListener('change', onTablet);
    this.desktopQuery?.addEventListener('change', onDesktop);
    inject(DestroyRef).onDestroy(() => {
      this.tabletQuery?.removeEventListener('change', onTablet);
      this.desktopQuery?.removeEventListener('change', onDesktop);
    });
  }
}

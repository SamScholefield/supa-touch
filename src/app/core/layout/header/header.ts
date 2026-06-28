import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { APP_PATHS } from '../../../app.paths';
import { Auth } from '../../auth/auth';
import { Breakpoint } from '../../breakpoint/breakpoint';
import { Theme } from '../../theme/theme';
import { HeaderVisibility } from '../header-visibility';
import { SidebarState } from '../sidebar-state';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    '[class.header-hidden]': 'headerVisibility.isHidden()',
  },
})
export class Header {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly destroyRef = inject(DestroyRef);
  protected readonly theme = inject(Theme);
  protected readonly breakpoint = inject(Breakpoint);
  protected readonly sidebar = inject(SidebarState);
  protected readonly headerVisibility = inject(HeaderVisibility);

  /** Show the sidebar toggle button (AppLayout only). */
  readonly showMenu = input(false);

  protected readonly paths = APP_PATHS;
  protected readonly loginLink = `/${APP_PATHS.LOGIN}`;
  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly user = this.auth.user;

  private lastScrollY = 0;

  constructor() {
    // Below desktop, hide the header on scroll-down and reveal it on scroll-up.
    afterNextRender(() => {
      const view = this.view;
      if (!view) {
        return;
      }
      let ticking = false;
      const onScroll = () => {
        if (ticking) {
          return;
        }
        ticking = true;
        view.requestAnimationFrame(() => {
          this.updateVisibility(view.scrollY);
          ticking = false;
        });
      };
      view.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => view.removeEventListener('scroll', onScroll));
    });
  }

  protected async logout(): Promise<void> {
    await this.auth.signOut();
    this.router.navigate([APP_PATHS.ROOT]);
  }

  private updateVisibility(scrollY: number): void {
    if (this.breakpoint.isDesktop()) {
      this.headerVisibility.isHidden.set(false);
      this.lastScrollY = scrollY;
      return;
    }
    const goingDown = scrollY > this.lastScrollY;
    if (goingDown && scrollY > 50) {
      this.headerVisibility.isHidden.set(true);
    } else if (!goingDown) {
      this.headerVisibility.isHidden.set(false);
    }
    this.lastScrollY = scrollY;
  }
}

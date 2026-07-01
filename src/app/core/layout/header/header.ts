import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
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
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscape()',
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
  protected readonly loginLink = `/${APP_PATHS.FEATURES.LOGIN}`;
  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly user = this.auth.user;

  /**
   * The brand returns signed-in users to the admin shell (which owns the persistent sidebar);
   * anonymous visitors go to the public root. Prevents logging-in users from being stranded on
   * the sidebar-less public layout with no route back into the app.
   */
  protected readonly brandLink = computed(() =>
    this.isAuthenticated() ? `/${APP_PATHS.FEATURES.ADMIN}` : APP_PATHS.FEATURES.ROOT,
  );

  /** "Person" dropdown holding the theme switch, username and sign-out. */
  protected readonly menuOpen = signal(false);
  private readonly menuRoot = viewChild<ElementRef<HTMLElement>>('menuRoot');
  private readonly menuTrigger = viewChild<ElementRef<HTMLElement>>('menuTrigger');

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

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected onEscape(): void {
    if (this.menuOpen()) {
      this.closeMenu();
      this.menuTrigger()?.nativeElement.focus();
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen() && !this.menuRoot()?.nativeElement.contains(event.target as Node)) {
      this.closeMenu();
    }
  }

  protected async logout(): Promise<void> {
    this.closeMenu();
    await this.auth.signOut();
    this.router.navigate([APP_PATHS.FEATURES.ROOT]);
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

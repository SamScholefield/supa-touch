import { Component, computed, effect, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { APP_PATHS } from '../../../app.paths';
import { CurrentProfile } from '../../auth/current-profile';
import { Breakpoint } from '../../breakpoint/breakpoint';
import { SidebarState } from '../sidebar-state';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  host: {
    '[class.open]': 'state.isOpen()',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class Sidebar {
  protected readonly state = inject(SidebarState);
  protected readonly breakpoint = inject(Breakpoint);
  private readonly router = inject(Router);
  private readonly currentProfile = inject(CurrentProfile);

  protected readonly adminLink = `/${APP_PATHS.FEATURES.ADMIN}`;

  private readonly allLinks = [
    { label: 'Teams', path: `${this.adminLink}/${APP_PATHS.FEATURES.TEAMS}` },
    { label: 'Users', path: `${this.adminLink}/${APP_PATHS.FEATURES.USERS}`, systemAdmin: true },
    { label: 'Groups', path: `${this.adminLink}/${APP_PATHS.FEATURES.GROUPS}` },
    { label: 'Rules', path: `${this.adminLink}/${APP_PATHS.FEATURES.RULES}` },
    { label: 'Profile', path: `${this.adminLink}/${APP_PATHS.FEATURES.PROFILE}` },
  ];

  // System-admin-only entries (Users) are hidden from everyone else.
  protected readonly navLinks = computed(() =>
    this.allLinks.filter((link) => !link.systemAdmin || this.currentProfile.isSystemAdmin()),
  );

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    // Reaching desktop turns the offcanvas into a persistent rail; drop the open state.
    effect(() => {
      if (this.breakpoint.isDesktop()) {
        this.state.close();
      }
    });
    // Move focus into the panel when it opens as an offcanvas dialog.
    effect(() => {
      if (this.state.isOpen() && !this.breakpoint.isDesktop()) {
        this.panel()?.nativeElement.focus();
      }
    });
    // Close after navigating to a sidebar link.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.state.close());
  }

  protected onEscape(): void {
    if (this.state.isOpen()) {
      this.state.close();
    }
  }
}

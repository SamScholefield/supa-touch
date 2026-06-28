import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { APP_PATHS } from '../../../app.paths';
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

  protected readonly adminLink = `/${APP_PATHS.ADMIN}`;

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

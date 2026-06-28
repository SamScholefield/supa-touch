import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Breakpoint } from '../../breakpoint/breakpoint';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { SidebarState } from '../sidebar-state';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, Header, Footer, Sidebar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  private readonly sidebar = inject(SidebarState);
  private readonly breakpoint = inject(Breakpoint);

  /** Block interaction with the page behind the offcanvas sidebar (modal behaviour). */
  protected readonly contentInert = computed(
    () => this.sidebar.isOpen() && !this.breakpoint.isDesktop(),
  );
}

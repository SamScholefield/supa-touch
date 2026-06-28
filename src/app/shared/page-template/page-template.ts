import { DOCUMENT, Location } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { APP_PATHS } from '../../app.paths';
import { Breakpoint } from '../../core/breakpoint/breakpoint';
import { HeaderVisibility } from '../../core/layout/header-visibility';
import { BackToTop } from '../back-to-top/back-to-top';

@Component({
  selector: 'app-page-template',
  imports: [BackToTop],
  templateUrl: './page-template.html',
  styleUrl: './page-template.scss',
})
export class PageTemplate {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly breakpoint = inject(Breakpoint);
  private readonly headerVisibility = inject(HeaderVisibility);

  readonly displayBackButton = input(true);
  readonly displayBackToTop = input(true);

  /** Sticky toolbar offset: flush on desktop; below the header on mobile unless it auto-hid. */
  protected readonly toolbarTop = computed(() =>
    this.breakpoint.isDesktop() || this.headerVisibility.isHidden() ? '0' : 'var(--header-height)',
  );

  protected goBack(): void {
    if ((this.view?.history.length ?? 0) > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl(APP_PATHS.ROOT);
    }
  }
}

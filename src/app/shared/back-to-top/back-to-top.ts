import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';

type ScrollTarget = HTMLElement | Window;

@Component({
  selector: 'app-back-to-top',
  templateUrl: './back-to-top.html',
  styleUrl: './back-to-top.scss',
  host: {
    '[class.visible]': 'visible()',
  },
})
export class BackToTop {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly view = inject(DOCUMENT).defaultView;

  protected readonly visible = signal(false);
  private target: ScrollTarget | null = null;

  constructor() {
    afterNextRender(() => {
      this.target = this.findScrollContainer() ?? this.view;
      if (!this.target) {
        return;
      }
      const onScroll = () => this.visible.set(this.scrollTop() > 200);
      this.target.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => this.target?.removeEventListener('scroll', onScroll));
    });
  }

  protected scrollToTop(): void {
    this.target?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private scrollTop(): number {
    return this.target instanceof HTMLElement ? this.target.scrollTop : (this.view?.scrollY ?? 0);
  }

  /** Nearest scrollable ancestor (the routed component host on desktop), or null → window. */
  private findScrollContainer(): HTMLElement | null {
    let el = this.host.nativeElement.parentElement;
    while (el) {
      const overflowY = this.view?.getComputedStyle(el).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }
}

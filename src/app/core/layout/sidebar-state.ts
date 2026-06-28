import { Service, signal } from '@angular/core';

/** Open/closed state for the offcanvas sidebar (tablet/mobile). */
@Service()
export class SidebarState {
  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((open) => !open);
  }
}

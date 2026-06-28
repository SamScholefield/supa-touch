import { DOCUMENT } from '@angular/common';
import { effect, inject, Service, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'supa-touch-theme';

@Service()
export class Theme {
  private readonly document = inject(DOCUMENT);

  /** Active theme. Dark is the default (matches the bare :root tokens). */
  readonly mode = signal<ThemeMode>(this.readStored());

  constructor() {
    // Reflect the theme onto <html data-theme> and persist it.
    effect(() => {
      const mode = this.mode();
      this.document.documentElement.setAttribute('data-theme', mode);
      this.document.defaultView?.localStorage?.setItem(STORAGE_KEY, mode);
    });
  }

  toggle(): void {
    this.mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  private readStored(): ThemeMode {
    const stored = this.document.defaultView?.localStorage?.getItem(STORAGE_KEY);
    return stored === 'light' ? 'light' : 'dark';
  }
}

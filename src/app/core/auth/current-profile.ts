import { computed, effect, inject, Service, signal } from '@angular/core';

import { SUPABASE_CLIENT } from '../supabase/supabase-client';
import { Auth } from './auth';
import { Profile } from './profile.model';

/**
 * Loads and exposes the signed-in user's `profiles` row (including the
 * `is_system_admin` role). The `Auth` service only knows the auth user (email);
 * this adds the app-level profile/role. Kept in sync with sign-in/out via an
 * effect; `ensureLoaded()` lets guards await the first load deterministically.
 */
@Service()
export class CurrentProfile {
  private readonly supabase = inject(SUPABASE_CLIENT);
  private readonly auth = inject(Auth);

  private readonly _profile = signal<Profile | null>(null);
  readonly profile = this._profile.asReadonly();
  readonly isSystemAdmin = computed(() => this._profile()?.is_system_admin ?? false);
  readonly displayName = computed(() => this._profile()?.display_name ?? null);

  private loadedUserId: string | null = null;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    // React to login/logout/token refresh so the role signal stays fresh for nav.
    effect(() => {
      const id = this.auth.user()?.id ?? null;
      if (id !== this.loadedUserId) this.refresh(id);
    });
  }

  /** Awaits the current (or a fresh) profile load; used by systemAdminGuard. */
  async ensureLoaded(): Promise<Profile | null> {
    const id = this.auth.user()?.id ?? null;
    if (id !== this.loadedUserId || !this.loadPromise) this.refresh(id);
    await this.loadPromise;
    return this._profile();
  }

  private refresh(id: string | null): void {
    this.loadedUserId = id;
    this.loadPromise = this.load(id);
  }

  private async load(id: string | null): Promise<void> {
    if (!id) {
      this._profile.set(null);
      return;
    }
    const { data } = await this.supabase.from('profiles').select('*').eq('id', id).single();
    this._profile.set((data as Profile | null) ?? null);
  }
}

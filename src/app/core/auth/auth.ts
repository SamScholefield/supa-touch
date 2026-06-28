import { DOCUMENT } from '@angular/common';
import { computed, inject, Service, signal } from '@angular/core';
import type { AuthResponse, Session, User } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '../supabase/supabase-client';

@Service()
export class Auth {
  private readonly supabase = inject(SUPABASE_CLIENT);
  private readonly document = inject(DOCUMENT);

  /** Where Supabase sends users after they click an email confirmation link. */
  private get emailRedirectTo(): string {
    return `${this.document.location.origin}/admin`;
  }

  private readonly _session = signal<Session | null>(null);

  /** Current Supabase session, or null when signed out. */
  readonly session = this._session.asReadonly();
  /** The authenticated user, or null. */
  readonly user = computed<User | null>(() => this._session()?.user ?? null);
  /** Whether a user is currently signed in. */
  readonly isAuthenticated = computed(() => this._session() !== null);

  constructor() {
    // Keep the session signal in sync with sign-in/out, token refresh, and cross-tab changes.
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
    });
  }

  /**
   * Loads the persisted session once at startup. Run from an app initializer so guards see the
   * correct auth state on a hard refresh instead of bouncing to /login.
   */
  async restoreSession(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    this._session.set(data.session);
  }

  signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signUp(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: this.emailRedirectTo },
    });
  }

  /** Re-sends the sign-up confirmation email for a not-yet-confirmed address. */
  resendConfirmation(email: string) {
    return this.supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: this.emailRedirectTo },
    });
  }

  signOut(): Promise<{ error: Error | null }> {
    return this.supabase.auth.signOut();
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { email, form, FormField, minLength, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';

import { APP_PATHS } from '../../../app.paths';
import { Auth } from '../auth';
import { SignupFlow } from '../signup-flow';

type Mode = 'signin' | 'signup';

@Component({
  selector: 'app-login',
  imports: [FormField],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly signupFlow = inject(SignupFlow);

  protected readonly mode = signal<Mode>('signin');
  protected readonly pending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly heading = computed(() =>
    this.mode() === 'signin' ? 'Sign in' : 'Create account',
  );
  protected readonly submitLabel = computed(() =>
    this.mode() === 'signin' ? 'Sign in' : 'Sign up',
  );
  protected readonly toggleLabel = computed(() =>
    this.mode() === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in',
  );

  protected readonly model = signal({ email: '', password: '', displayName: '' });

  protected readonly loginForm = form(this.model, (path) => {
    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Enter a valid email address' });
    required(path.password, { message: 'Password is required' });
    minLength(path.password, 6, { message: 'Password must be at least 6 characters' });
    // Display name is only collected (and required) when creating an account.
    required(path.displayName, {
      message: 'Display name is required',
      when: () => this.mode() === 'signup',
    });
  });

  protected toggleMode(): void {
    this.mode.update((m) => (m === 'signin' ? 'signup' : 'signin'));
    this.errorMessage.set(null);
  }

  protected onSubmit(): void {
    this.errorMessage.set(null);

    submit(this.loginForm, async () => {
      this.pending.set(true);
      const { email, password, displayName } = this.model();
      try {
        if (this.mode() === 'signin') {
          const { error } = await this.auth.signInWithPassword(email, password);
          if (error) {
            this.errorMessage.set(error.message);
            return;
          }
          await this.router.navigate([APP_PATHS.ADMIN]);
        } else {
          const { data, error } = await this.auth.signUp(email, password, displayName);
          if (error) {
            this.errorMessage.set(error.message);
            return;
          }
          // When email confirmation is enabled, no session is returned until the user confirms.
          if (data.session) {
            await this.router.navigate([APP_PATHS.ADMIN]);
          } else {
            this.signupFlow.pendingEmail.set(email);
            await this.router.navigate([APP_PATHS.CONFIRM_EMAIL]);
          }
        }
      } finally {
        this.pending.set(false);
      }
    });
  }
}

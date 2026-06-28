import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Auth } from '../../core/auth/auth';
import { SignupFlow } from '../../core/auth/signup-flow';

@Component({
  selector: 'app-confirm-email',
  imports: [RouterLink],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.scss',
})
export class ConfirmEmail {
  private readonly auth = inject(Auth);

  /** Email captured during sign-up; null on a direct visit / hard refresh. */
  protected readonly email = inject(SignupFlow).pendingEmail;

  protected readonly resending = signal(false);
  protected readonly resendMessage = signal<string | null>(null);
  protected readonly resendError = signal<string | null>(null);

  protected async resend(): Promise<void> {
    const email = this.email();
    if (!email) {
      return;
    }

    this.resendMessage.set(null);
    this.resendError.set(null);
    this.resending.set(true);
    try {
      const { error } = await this.auth.resendConfirmation(email);
      if (error) {
        this.resendError.set(error.message);
      } else {
        this.resendMessage.set('Confirmation email sent again. Check your inbox.');
      }
    } finally {
      this.resending.set(false);
    }
  }
}

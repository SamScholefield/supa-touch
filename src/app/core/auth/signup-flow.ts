import { Service, signal } from '@angular/core';

/**
 * Carries the just-registered email from the login page to the confirm-email page so it can show
 * the address and offer a resend. In-memory only — on a hard refresh of /confirm-email the email is
 * gone and the page degrades to generic copy.
 */
@Service()
export class SignupFlow {
  readonly pendingEmail = signal<string | null>(null);
}

import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Auth } from '../../core/auth/auth';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
})
export class AdminShell {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    await this.auth.signOut();
    this.router.navigate(['/']);
  }
}

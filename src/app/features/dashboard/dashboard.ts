import { Component, computed, inject } from '@angular/core';

import { Auth } from '../../core/auth/auth';
import { PageTemplate } from '../../shared/page-template/page-template';

@Component({
  selector: 'app-dashboard',
  imports: [PageTemplate],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly auth = inject(Auth);

  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly user = this.auth.user;
  protected readonly title = computed(() =>
    this.isAuthenticated() ? 'Dashboard' : 'Welcome to supa-touch',
  );
}

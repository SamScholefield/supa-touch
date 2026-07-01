import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_PATHS } from '../../app.paths';
import { Auth } from '../../core/auth/auth';
import { PageTemplate } from '../../shared/page-template/page-template';

interface DashCard {
  label: string;
  link: string;
  /** Selects the inline SVG in the template's @switch. */
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [PageTemplate, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly auth = inject(Auth);
  private readonly admin = `/${APP_PATHS.FEATURES.ADMIN}`;

  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly user = this.auth.user;
  protected readonly title = computed(() =>
    this.isAuthenticated() ? 'Dashboard' : 'Welcome to supa-touch',
  );

  /** Public tiles, shown to everyone. */
  private readonly publicCards: DashCard[] = [
    { label: 'Fixtures', link: `/${APP_PATHS.FEATURES.FIXTURES}`, icon: 'fixtures' },
    { label: 'Tables', link: `/${APP_PATHS.FEATURES.TABLES}`, icon: 'tables' },
  ];

  /** One tile per admin feature; appended only when signed in. */
  private readonly featureCards: DashCard[] = [
    { label: 'Teams', link: `${this.admin}/${APP_PATHS.FEATURES.TEAMS}`, icon: 'teams' },
    { label: 'Users', link: `${this.admin}/${APP_PATHS.FEATURES.USERS}`, icon: 'users' },
    { label: 'Groups', link: `${this.admin}/${APP_PATHS.FEATURES.GROUPS}`, icon: 'groups' },
    { label: 'Rules', link: `${this.admin}/${APP_PATHS.FEATURES.RULES}`, icon: 'rules' },
    { label: 'Profile', link: `${this.admin}/${APP_PATHS.FEATURES.PROFILE}`, icon: 'profile' },
  ];

  protected readonly cards = computed<DashCard[]>(() =>
    this.isAuthenticated() ? [...this.publicCards, ...this.featureCards] : this.publicCards,
  );
}

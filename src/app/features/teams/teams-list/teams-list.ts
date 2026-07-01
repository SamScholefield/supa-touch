import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_PATHS } from '../../../app.paths';
import { Auth } from '../../../core/auth/auth';
import { PageTemplate } from '../../../shared/page-template/page-template';
import { TeamMembership } from '../team.model';
import { Teams } from '../teams';

@Component({
  selector: 'app-teams-list',
  imports: [PageTemplate, RouterLink],
  templateUrl: './teams-list.html',
  styleUrl: './teams-list.scss',
})
export class TeamsList {
  private readonly teams = inject(Teams);
  private readonly auth = inject(Auth);

  private readonly base = ['/', APP_PATHS.FEATURES.ADMIN, APP_PATHS.FEATURES.TEAMS];
  protected readonly createLink = [...this.base, APP_PATHS.SECTIONS.CREATE];

  protected readonly memberships = signal<TeamMembership[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  protected editLink(teamId: string): string[] {
    return [...this.base, APP_PATHS.SECTIONS.EDIT, teamId];
  }

  private async load(): Promise<void> {
    const profileId = this.auth.user()?.id;
    if (!profileId) {
      this.loading.set(false);
      return;
    }
    const { data, error } = await this.teams.listMyTeams(profileId);
    if (error) {
      this.error.set(error.message);
    } else {
      this.memberships.set(data ?? []);
    }
    this.loading.set(false);
  }
}

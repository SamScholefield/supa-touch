import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_PATHS } from '../../../app.paths';
import { Auth } from '../../../core/auth/auth';
import { PageTemplate } from '../../../shared/page-template/page-template';
import { Team } from '../team.model';
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

  protected readonly paths = APP_PATHS;
  private readonly base = ['/', APP_PATHS.FEATURES.ADMIN, APP_PATHS.FEATURES.TEAMS];
  protected readonly createLink = [...this.base, APP_PATHS.SECTIONS.CREATE];

  protected readonly list = signal<Team[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly email = computed(() => this.auth.user()?.email?.toLowerCase() ?? '');

  constructor() {
    void this.load();
  }

  protected isAdmin(team: Team): boolean {
    return team.admins.some((a) => a.toLowerCase() === this.email());
  }

  protected editLink(team: Team): string[] {
    return [...this.base, APP_PATHS.SECTIONS.EDIT, team.id];
  }

  private async load(): Promise<void> {
    const { data, error } = await this.teams.listMyTeams();
    if (error) {
      this.error.set(error.message);
    } else {
      this.list.set(data ?? []);
    }
    this.loading.set(false);
  }
}

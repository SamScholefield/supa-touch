import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_PATHS } from '../../../app.paths';
import { Profile } from '../../../core/auth/profile.model';
import { PageTemplate } from '../../../shared/page-template/page-template';
import { Users } from '../users';

@Component({
  selector: 'app-users-list',
  imports: [PageTemplate, RouterLink],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList {
  private readonly users = inject(Users);

  private readonly base = ['/', APP_PATHS.FEATURES.ADMIN, APP_PATHS.FEATURES.USERS];

  protected readonly list = signal<Profile[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  protected editLink(id: string): string[] {
    return [...this.base, APP_PATHS.SECTIONS.EDIT, id];
  }

  protected name(user: Profile): string {
    return user.display_name ?? user.email ?? 'Unknown';
  }

  private async load(): Promise<void> {
    const { data, error } = await this.users.listUsers();
    if (error) {
      this.error.set(error.message);
    } else {
      this.list.set(data ?? []);
    }
    this.loading.set(false);
  }
}

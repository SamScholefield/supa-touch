import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { form, FormField, maxLength, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';

import { APP_PATHS } from '../../../app.paths';
import { Profile } from '../../../core/auth/profile.model';
import { PageTemplate } from '../../../shared/page-template/page-template';
import { mapUserError } from '../user-errors';
import { Users } from '../users';

@Component({
  selector: 'app-users-form',
  imports: [PageTemplate, FormField],
  templateUrl: './users-form.html',
  styleUrl: './users-form.scss',
})
export class UsersForm implements OnInit {
  private readonly users = inject(Users);
  private readonly router = inject(Router);

  /** Route param `:id` (the profile being edited). */
  readonly id = input<string>();

  protected readonly loading = signal(true);
  protected readonly pending = signal(false);
  protected readonly togglingAdmin = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly user = signal<Profile | null>(null);
  protected readonly isSystemAdmin = signal(false);
  protected readonly email = computed(() => this.user()?.email ?? '');

  protected readonly model = signal({ display_name: '' });
  protected readonly userForm = form(this.model, (path) => {
    required(path.display_name, { message: 'Name is required' });
    maxLength(path.display_name, 120, { message: '120 characters max' });
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      void this.toList();
      return;
    }
    void this.load(id);
  }

  private async load(id: string): Promise<void> {
    const { data, error } = await this.users.getUser(id);
    if (error || !data) {
      await this.toList();
      return;
    }
    this.user.set(data);
    this.model.set({ display_name: data.display_name ?? '' });
    this.isSystemAdmin.set(data.is_system_admin);
    this.loading.set(false);
  }

  protected onSubmit(): void {
    this.errorMessage.set(null);
    submit(this.userForm, async () => {
      this.pending.set(true);
      try {
        const { error } = await this.users.updateUser(this.id()!, {
          display_name: this.model().display_name.trim(),
        });
        if (error) {
          this.errorMessage.set(mapUserError(error));
          return;
        }
        await this.toList();
      } finally {
        this.pending.set(false);
      }
    });
  }

  protected async toggleSystemAdmin(): Promise<void> {
    const id = this.id();
    if (!id) return;
    this.errorMessage.set(null);
    this.togglingAdmin.set(true);
    const next = !this.isSystemAdmin();
    try {
      const { error } = await this.users.setSystemAdmin(id, next);
      if (error) {
        this.errorMessage.set(mapUserError(error));
        return;
      }
      this.isSystemAdmin.set(next);
    } finally {
      this.togglingAdmin.set(false);
    }
  }

  private toList(): Promise<boolean> {
    return this.router.navigate(['/', APP_PATHS.FEATURES.ADMIN, APP_PATHS.FEATURES.USERS]);
  }
}

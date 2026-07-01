import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { form, FormField, maxLength, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';

import { APP_PATHS } from '../../../app.paths';
import { Auth } from '../../../core/auth/auth';
import { PageTemplate } from '../../../shared/page-template/page-template';
import { mapTeamError } from '../team-errors';
import { Teams } from '../teams';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-teams-form',
  imports: [PageTemplate, FormField],
  templateUrl: './teams-form.html',
  styleUrl: './teams-form.scss',
})
export class TeamsForm implements OnInit {
  private readonly teams = inject(Teams);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  /** Route param `:id`; undefined in create mode (withComponentInputBinding). */
  readonly id = input<string>();

  protected readonly isEdit = computed(() => !!this.id());
  protected readonly title = computed(() => (this.isEdit() ? 'Edit Team' : 'New Team'));

  /** The signed-in user's email, lowercased — an admin cannot remove themselves. */
  protected readonly currentEmail = computed(() => this.auth.user()?.email?.toLowerCase() ?? '');

  protected readonly loading = signal(false);
  protected readonly pending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly confirmingDelete = signal(false);
  protected readonly deleting = signal(false);

  protected readonly model = signal({ name: '' });
  protected readonly teamForm = form(this.model, (path) => {
    required(path.name, { message: 'Team name is required' });
    maxLength(path.name, 80, { message: '80 characters max' });
  });

  // Members are edited as a plain signal array, not a form field.
  protected readonly members = signal<string[]>([]);
  protected readonly memberInput = signal('');
  protected readonly memberError = signal<string | null>(null);

  ngOnInit(): void {
    const teamId = this.id();
    if (!teamId) return;
    this.loading.set(true);
    void this.load(teamId);
  }

  private async load(teamId: string): Promise<void> {
    const { data, error } = await this.teams.getTeam(teamId);
    const email = this.auth.user()?.email?.toLowerCase() ?? '';
    // Missing team, read error, or not an admin -> bounce back to the list (admins only).
    if (error || !data || !data.admins.some((a) => a.toLowerCase() === email)) {
      await this.toList();
      return;
    }
    this.model.set({ name: data.name });
    this.members.set(data.members);
    this.loading.set(false);
  }

  protected addMember(): void {
    const email = this.memberInput().trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      this.memberError.set('Enter a valid email address');
      return;
    }
    if (this.members().some((m) => m.toLowerCase() === email)) {
      this.memberError.set('That member is already on the team');
      return;
    }
    this.members.update((list) => [...list, email]);
    this.memberInput.set('');
    this.memberError.set(null);
  }

  /** Whether a member row may be removed — admins cannot remove themselves. */
  protected canRemove(email: string): boolean {
    return email.toLowerCase() !== this.currentEmail();
  }

  protected removeMember(email: string): void {
    if (!this.canRemove(email)) return;
    this.members.update((list) => list.filter((m) => m !== email));
  }

  protected requestDelete(): void {
    this.confirmingDelete.set(true);
  }

  protected cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  protected async confirmDelete(): Promise<void> {
    const teamId = this.id();
    if (!teamId) return;
    this.errorMessage.set(null);
    this.deleting.set(true);
    try {
      const { error } = await this.teams.deleteTeam(teamId);
      if (error) {
        this.errorMessage.set(mapTeamError(error));
        this.confirmingDelete.set(false);
        return;
      }
      await this.toList();
    } finally {
      this.deleting.set(false);
    }
  }

  protected onSubmit(): void {
    this.errorMessage.set(null);

    submit(this.teamForm, async () => {
      this.pending.set(true);
      try {
        const name = this.model().name.trim();
        const teamId = this.id();
        const { error } = teamId
          ? await this.teams.updateTeam(teamId, name, this.members())
          : await this.teams.createTeam(name);
        if (error) {
          this.errorMessage.set(mapTeamError(error));
          return;
        }
        await this.toList();
      } finally {
        this.pending.set(false);
      }
    });
  }

  private toList(): Promise<boolean> {
    return this.router.navigate(['/', APP_PATHS.FEATURES.ADMIN, APP_PATHS.FEATURES.TEAMS]);
  }
}

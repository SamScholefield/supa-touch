import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { form, FormField, maxLength, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';

import { APP_PATHS } from '../../../app.paths';
import { Auth } from '../../../core/auth/auth';
import { PageTemplate } from '../../../shared/page-template/page-template';
import { mapTeamError } from '../team-errors';
import { isRegistered, memberName, TeamMember } from '../team.model';
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

  // Template helpers.
  protected readonly memberName = memberName;
  protected readonly isRegistered = isRegistered;

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

  // Members are managed via granular RPCs; the list is refetched after each change.
  protected readonly members = signal<TeamMember[]>([]);
  protected readonly newName = signal('');
  protected readonly newEmail = signal('');
  protected readonly memberError = signal<string | null>(null);
  protected readonly addingMember = signal(false);

  private readonly currentProfileId = computed(() => this.auth.user()?.id ?? null);

  ngOnInit(): void {
    const teamId = this.id();
    if (!teamId) return;
    this.loading.set(true);
    void this.load(teamId);
  }

  private async load(teamId: string): Promise<void> {
    const [{ data: team, error: teamErr }, { data: members }] = await Promise.all([
      this.teams.getTeam(teamId),
      this.teams.listMembers(teamId),
    ]);
    const mine = (members ?? []).find((m) => m.profile_id === this.currentProfileId());
    // Missing team, read error, or not a team admin -> bounce back to the list.
    if (teamErr || !team || !mine?.is_admin) {
      await this.toList();
      return;
    }
    this.model.set({ name: team.name });
    this.members.set(members ?? []);
    this.loading.set(false);
  }

  private async refreshMembers(): Promise<void> {
    const teamId = this.id();
    if (!teamId) return;
    const { data } = await this.teams.listMembers(teamId);
    if (data) this.members.set(data);
  }

  protected async addMember(): Promise<void> {
    const name = this.newName().trim();
    const email = this.newEmail().trim();
    if (!name) {
      this.memberError.set('Enter a name');
      return;
    }
    if (email && !EMAIL_RE.test(email)) {
      this.memberError.set('Enter a valid email address');
      return;
    }
    this.memberError.set(null);
    this.addingMember.set(true);
    try {
      const { error } = await this.teams.addMember(this.id()!, name, email || null);
      if (error) {
        this.memberError.set(mapTeamError(error));
        return;
      }
      this.newName.set('');
      this.newEmail.set('');
      await this.refreshMembers();
    } finally {
      this.addingMember.set(false);
    }
  }

  protected async removeMember(member: TeamMember): Promise<void> {
    this.errorMessage.set(null);
    const { error } = await this.teams.removeMember(member.id);
    if (error) {
      this.errorMessage.set(mapTeamError(error));
      return;
    }
    await this.refreshMembers();
  }

  protected async toggleAdmin(member: TeamMember): Promise<void> {
    this.errorMessage.set(null);
    const { error } = await this.teams.setMemberAdmin(member.id, !member.is_admin);
    if (error) {
      this.errorMessage.set(mapTeamError(error));
      return;
    }
    await this.refreshMembers();
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

  /** Create a new team (then jump to edit to manage members) or rename an existing one. */
  protected onSubmit(): void {
    this.errorMessage.set(null);

    submit(this.teamForm, async () => {
      this.pending.set(true);
      try {
        const name = this.model().name.trim();
        if (this.isEdit()) {
          const { error } = await this.teams.renameTeam(this.id()!, name);
          if (error) {
            this.errorMessage.set(mapTeamError(error));
            return;
          }
          await this.toList();
        } else {
          const { data, error } = await this.teams.createTeam(name);
          if (error) {
            this.errorMessage.set(mapTeamError(error));
            return;
          }
          const created = data as { id: string } | null;
          if (created?.id) {
            await this.router.navigate([...this.base, APP_PATHS.SECTIONS.EDIT, created.id]);
          } else {
            await this.toList();
          }
        }
      } finally {
        this.pending.set(false);
      }
    });
  }

  private readonly base = ['/', APP_PATHS.FEATURES.ADMIN, APP_PATHS.FEATURES.TEAMS];

  private toList(): Promise<boolean> {
    return this.router.navigate(this.base);
  }
}

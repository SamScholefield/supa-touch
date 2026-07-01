import { inject, Service } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '../../core/supabase/supabase-client';
import { Team, TeamMember, TeamMembership } from './team.model';

type Result<T> = { data: T | null; error: PostgrestError | null };

/**
 * Data access for teams and membership. Reads go through PostgREST (RLS-gated);
 * every write goes through a security-definer RPC. Methods return the Supabase
 * `{ data, error }` result for the caller to inspect (the `Auth` convention).
 */
@Service()
export class Teams {
  private readonly supabase = inject(SUPABASE_CLIENT);

  /** Teams the given profile belongs to, with the caller's role in each. */
  async listMyTeams(profileId: string): Promise<Result<TeamMembership[]>> {
    const { data, error } = await this.supabase
      .from('team_members')
      .select('is_admin, team:teams(*)')
      .eq('profile_id', profileId);
    return { data: data as TeamMembership[] | null, error };
  }

  async getTeam(id: string): Promise<Result<Team>> {
    const { data, error } = await this.supabase.from('teams').select('*').eq('id', id).single();
    return { data: data as Team | null, error };
  }

  async listMembers(teamId: string): Promise<Result<TeamMember[]>> {
    const { data, error } = await this.supabase
      .from('team_members')
      .select('*, profile:profiles(display_name, email)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true });
    return { data: data as TeamMember[] | null, error };
  }

  createTeam(name: string) {
    return this.supabase.rpc('create_team', { team_name: name });
  }

  renameTeam(id: string, name: string) {
    return this.supabase.rpc('rename_team', { p_team_id: id, p_name: name });
  }

  deleteTeam(id: string) {
    return this.supabase.rpc('delete_team', { p_team_id: id });
  }

  addMember(teamId: string, name: string, email: string | null) {
    return this.supabase.rpc('add_team_member', {
      p_team_id: teamId,
      p_name: name,
      p_email: email,
    });
  }

  removeMember(memberId: string) {
    return this.supabase.rpc('remove_team_member', { p_member_id: memberId });
  }

  setMemberAdmin(memberId: string, isAdmin: boolean) {
    return this.supabase.rpc('set_team_member_admin', {
      p_member_id: memberId,
      p_is_admin: isAdmin,
    });
  }
}

import { inject, Service } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '../../core/supabase/supabase-client';
import { Team } from './team.model';

type Result<T> = { data: T | null; error: PostgrestError | null };

/**
 * Data access for teams. Follows the `Auth` convention: methods return the
 * Supabase `{ data, error }` result and let callers inspect `error`.
 *
 * Creation and editing go through security-definer RPCs (`create_team` /
 * `update_team`) so the team write and the `profiles.teams` reverse-index update
 * happen atomically. The client is untyped, so reads are cast to `Team`.
 */
@Service()
export class Teams {
  private readonly supabase = inject(SUPABASE_CLIENT);

  createTeam(name: string) {
    return this.supabase.rpc('create_team', { team_name: name });
  }

  updateTeam(id: string, name: string, members: string[]) {
    return this.supabase.rpc('update_team', {
      team_id: id,
      team_name: name,
      team_members: members,
    });
  }

  deleteTeam(id: string) {
    return this.supabase.rpc('delete_team', { team_id: id });
  }

  async getTeam(id: string): Promise<Result<Team>> {
    const { data, error } = await this.supabase.from('teams').select('*').eq('id', id).single();
    return { data: data as Team | null, error };
  }

  async listMyTeams(): Promise<Result<Team[]>> {
    const { data, error } = await this.supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data as Team[] | null, error };
  }
}

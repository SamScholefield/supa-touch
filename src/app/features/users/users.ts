import { inject, Service } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';

import { Profile } from '../../core/auth/profile.model';
import { SUPABASE_CLIENT } from '../../core/supabase/supabase-client';

type Result<T> = { data: T | null; error: PostgrestError | null };

/**
 * System-admin data access over the profiles table. RLS restricts every method
 * to system admins (or the owner); the guard trigger enforces the role rules.
 */
@Service()
export class Users {
  private readonly supabase = inject(SUPABASE_CLIENT);

  async listUsers(): Promise<Result<Profile[]>> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .order('display_name', { nullsFirst: false });
    return { data: data as Profile[] | null, error };
  }

  async getUser(id: string): Promise<Result<Profile>> {
    const { data, error } = await this.supabase.from('profiles').select('*').eq('id', id).single();
    return { data: data as Profile | null, error };
  }

  updateUser(id: string, patch: { display_name: string }) {
    return this.supabase.from('profiles').update(patch).eq('id', id);
  }
}

import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Turns a Supabase/Postgres error from the team RPCs into a user-facing message.
 * `23505` is the case-insensitive unique-name violation; `42501` is raised by the
 * RPCs for unauthenticated/non-admin callers.
 */
export function mapTeamError(error: PostgrestError): string {
  switch (error.code) {
    case '23505':
      return 'A team with that name already exists.';
    case '42501':
      return 'Only team admins can make changes.';
    case 'PT001':
      return "You can't remove yourself. Delete the team instead.";
    default:
      return error.message;
  }
}

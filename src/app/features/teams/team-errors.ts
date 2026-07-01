import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Turns a Postgres error from the team RPCs into a user-facing message.
 *  - 23505: duplicate team name (unique index on lower(name)), or a member
 *    already on the team.
 *  - 42501: unauthenticated / not a team admin.
 *  - PT001: would remove/demote the last admin.
 *  - PT003: a guest was added without a name.
 *  - PT004: tried to make a name-only guest an admin.
 */
export function mapTeamError(error: PostgrestError): string {
  switch (error.code) {
    case '23505':
      return error.message.includes('team_members')
        ? 'That person is already on the team.'
        : 'A team with that name already exists.';
    case '42501':
      return 'Only team admins can make changes.';
    case 'PT001':
      return 'A team must keep at least one admin. Delete the team instead.';
    case 'PT003':
      return 'Enter a name for this member.';
    case 'PT004':
      return 'Only members with an account can be made admins.';
    default:
      return error.message;
  }
}

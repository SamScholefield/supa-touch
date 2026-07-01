import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Maps a Postgres error from the profiles updates into a user-facing message.
 *  - PT002: attempt to demote the last remaining system admin.
 *  - 42501: caller isn't a system admin.
 */
export function mapUserError(error: PostgrestError): string {
  switch (error.code) {
    case 'PT002':
      return "You can't remove the last system admin.";
    case '42501':
      return 'Only system admins can make this change.';
    default:
      return error.message;
  }
}

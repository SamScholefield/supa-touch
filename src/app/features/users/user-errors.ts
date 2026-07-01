import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Maps a Postgres error from the profiles updates into a user-facing message.
 * `42501` means the caller isn't a system admin (RLS). System-admin status
 * itself is not editable in-app, so there's no case for it here.
 */
export function mapUserError(error: PostgrestError): string {
  switch (error.code) {
    case '42501':
      return 'Only system admins can make this change.';
    default:
      return error.message;
  }
}

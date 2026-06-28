import { InjectionToken } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';

/**
 * The single, app-wide Supabase browser client.
 *
 * Created with the project's new-style PUBLISHABLE key (`sb_publishable_...`) — the
 * low-privilege, RLS-protected replacement for the legacy `anon` key. `@supabase/supabase-js`
 * sends it on the `apikey` header automatically. Default auth options persist the session in
 * localStorage and auto-refresh tokens, which is what we want for this SPA.
 */
export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>('SUPABASE_CLIENT', {
  providedIn: 'root',
  factory: () =>
    createClient(environment.supabaseUrl, environment.supabasePublishableKey),
});

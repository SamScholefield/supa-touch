/** A row from public.profiles (one per auth user). */
export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_system_admin: boolean;
  created_at: string;
  updated_at: string;
}

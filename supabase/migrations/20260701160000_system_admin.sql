-- SYSTEM_ADMIN role wiring. The is_system_admin column + is_system_admin() helper
-- were added in 20260701150000_team_members.sql; this migration adds the
-- privilege guard, opens profiles RLS to system admins, and grants the table
-- privileges the USERS console needs.

-- is_system_admin is NOT an application concern: it can only be changed out of
-- band (Supabase SQL editor / service role, where auth.uid() is null). Any
-- in-app caller (a JWT is present) is rejected — including system admins — so no
-- UI path can grant or revoke the role.
create function public.guard_profile_privilege()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_system_admin is distinct from old.is_system_admin and auth.uid() is not null then
    raise exception 'system admin status can only be changed by an administrator'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_privilege
  before update on public.profiles
  for each row execute function public.guard_profile_privilege();

-- Profiles are now readable/updatable by the owner OR a system admin (for the
-- USERS console). The guard trigger still prevents non-admins from flipping the
-- role bit.
drop policy "Profiles are viewable by the owner" on public.profiles;
drop policy "Profiles are updatable by the owner" on public.profiles;

create policy "profiles readable by owner or sysadmin"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id or public.is_system_admin());

create policy "profiles updatable by owner or sysadmin"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id or public.is_system_admin())
  with check ((select auth.uid()) = id or public.is_system_admin());

-- The client now reads/writes profiles directly (current profile + USERS console).
grant select, update on public.profiles to authenticated;

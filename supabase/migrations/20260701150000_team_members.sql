-- Membership redesign: replace the email arrays (teams.members/admins) and the
-- profiles.teams reverse index with a normalized team_members join table that can
-- represent both registered users (profile_id) and name-only guests
-- (display_name), each with a per-team is_admin flag.
--
-- Also introduces the global SYSTEM_ADMIN flag + helper here (used by the new RLS
-- policies); the escalation guard and profiles RLS land in the Phase 2 migration.

-- 1. Global system-admin flag + helper -------------------------------------------

alter table public.profiles
  add column is_system_admin boolean not null default false;

-- security definer + owned by postgres => reads bypass RLS, so policies that call
-- these helpers never recurse into the table's own RLS.
create function public.is_system_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and is_system_admin
  );
$$;

grant execute on function public.is_system_admin() to authenticated;

-- 2. team_members ----------------------------------------------------------------

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete cascade, -- null = guest
  display_name text, -- guests: their name; registered: optional, falls back to profile
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  constraint team_members_identity check (profile_id is not null or display_name is not null)
);

comment on table public.team_members is 'Team membership; profile_id null means an unregistered guest.';

-- One membership per registered user per team; guests deduped by name per team.
create unique index team_members_team_profile_idx
  on public.team_members (team_id, profile_id) where profile_id is not null;
create unique index team_members_team_guest_idx
  on public.team_members (team_id, lower(display_name)) where profile_id is null;
create index team_members_profile_idx on public.team_members (profile_id);
create index team_members_team_idx on public.team_members (team_id);

create function public.is_team_member(p_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id and profile_id = auth.uid()
  );
$$;

create function public.is_team_admin(p_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id and profile_id = auth.uid() and is_admin
  );
$$;

grant execute on function public.is_team_member(uuid) to authenticated;
grant execute on function public.is_team_admin(uuid) to authenticated;

-- 3. Backfill from the old email arrays ------------------------------------------

-- Registered members: email matches a profile.
insert into public.team_members (team_id, profile_id, display_name, is_admin)
select t.id, p.id, p.display_name, (m.email = any (t.admins))
from public.teams t
cross join lateral unnest(t.members) as m(email)
join public.profiles p on lower(p.email) = lower(m.email)
on conflict do nothing;

-- Guests: no matching profile — keep the email string as the display name.
insert into public.team_members (team_id, profile_id, display_name, is_admin)
select t.id, null, m.email, (m.email = any (t.admins))
from public.teams t
cross join lateral unnest(t.members) as m(email)
where not exists (select 1 from public.profiles p where lower(p.email) = lower(m.email))
on conflict do nothing;

-- 4. Drop the old model ----------------------------------------------------------

drop policy "Teams are viewable by members" on public.teams;
drop policy "Teams are updatable by admins" on public.teams;
drop policy "Teams are deletable by admins" on public.teams;

drop function public.create_team(text);
drop function public.update_team(uuid, text, text[]);
drop function public.delete_team(uuid);

alter table public.teams drop column members, drop column admins;

drop index public.profiles_teams_idx;
alter table public.profiles
  drop constraint profiles_teams_unique,
  drop column teams;
drop function public.has_unique_elements(uuid[]);

-- 5. New RLS ---------------------------------------------------------------------

alter table public.team_members enable row level security;

create policy "team_members readable by team members"
  on public.team_members for select to authenticated
  using (public.is_team_member(team_id) or public.is_system_admin());

grant select on public.team_members to authenticated;

create policy "teams readable by members"
  on public.teams for select to authenticated
  using (public.is_team_member(id) or public.is_system_admin());

-- 6. Membership RPCs (security definer; writes go only through these) -------------

-- Create a team with the caller as its sole admin member.
create function public.create_team(team_name text)
returns public.teams
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  new_team public.teams;
begin
  if caller_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  insert into public.teams (name) values (team_name) returning * into new_team;

  -- Registered member: display_name stays null and the label comes from the profile.
  insert into public.team_members (team_id, profile_id, display_name, is_admin)
  values (new_team.id, caller_id, null, true);

  return new_team;
end;
$$;

create function public.rename_team(p_team_id uuid, p_name text)
returns public.teams
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated public.teams;
begin
  if not public.is_team_admin(p_team_id) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  update public.teams set name = p_name where id = p_team_id returning * into updated;
  return updated;
end;
$$;

create function public.delete_team(p_team_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_team_admin(p_team_id) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  delete from public.teams where id = p_team_id; -- team_members cascade
end;
$$;

-- Add a member: registered if the email matches a profile, else a guest.
create function public.add_team_member(p_team_id uuid, p_name text, p_email text default null)
returns public.team_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched_id uuid;
  new_member public.team_members;
begin
  if not public.is_team_admin(p_team_id) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_email is not null and length(trim(p_email)) > 0 then
    select id into matched_id from public.profiles where lower(email) = lower(trim(p_email));
  end if;

  if matched_id is null and (p_name is null or length(trim(p_name)) = 0) then
    raise exception 'a name is required for guests' using errcode = 'PT003';
  end if;

  insert into public.team_members (team_id, profile_id, display_name, is_admin)
  values (
    p_team_id,
    matched_id,
    -- keep a guest's typed name; registered members are labelled from their profile
    case when matched_id is null then nullif(trim(coalesce(p_name, '')), '') else null end,
    false
  )
  returning * into new_member;

  return new_member;
end;
$$;

create function public.remove_team_member(p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.team_members;
  admin_count int;
begin
  select * into target from public.team_members where id = p_member_id;
  if not found then
    raise exception 'member not found' using errcode = 'P0002';
  end if;
  if not public.is_team_admin(target.team_id) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if target.is_admin then
    select count(*) into admin_count from public.team_members
      where team_id = target.team_id and is_admin;
    if admin_count <= 1 then
      raise exception 'cannot remove the last admin; delete the team instead'
        using errcode = 'PT001';
    end if;
  end if;

  delete from public.team_members where id = p_member_id;
end;
$$;

create function public.set_team_member_admin(p_member_id uuid, p_is_admin boolean)
returns public.team_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.team_members;
  admin_count int;
  updated public.team_members;
begin
  select * into target from public.team_members where id = p_member_id;
  if not found then
    raise exception 'member not found' using errcode = 'P0002';
  end if;
  if not public.is_team_admin(target.team_id) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_is_admin and target.profile_id is null then
    raise exception 'guests without an account cannot be admins' using errcode = 'PT004';
  end if;

  if target.is_admin and not p_is_admin then
    select count(*) into admin_count from public.team_members
      where team_id = target.team_id and is_admin;
    if admin_count <= 1 then
      raise exception 'cannot demote the last admin; delete the team instead'
        using errcode = 'PT001';
    end if;
  end if;

  update public.team_members set is_admin = p_is_admin
    where id = p_member_id returning * into updated;
  return updated;
end;
$$;

grant execute on function public.create_team(text) to authenticated;
grant execute on function public.rename_team(uuid, text) to authenticated;
grant execute on function public.delete_team(uuid) to authenticated;
grant execute on function public.add_team_member(uuid, text, text) to authenticated;
grant execute on function public.remove_team_member(uuid) to authenticated;
grant execute on function public.set_team_member_admin(uuid, boolean) to authenticated;

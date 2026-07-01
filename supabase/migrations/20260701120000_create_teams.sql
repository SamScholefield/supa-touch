-- Teams: one row per team. members/admins hold user emails ("email as id").
--
-- * Created only via create_team() (security definer) so the team insert and the
--   append to the creator's profiles.teams happen in one transaction.
-- * Edited only via update_team() (security definer) so member add/remove can also
--   reconcile the reverse index (profiles.teams) for members that have accounts,
--   which owner-scoped profile RLS would otherwise forbid.

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  members text[] not null default '{}',
  admins  text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.teams is 'Teams; members/admins are user emails.';

-- Case-insensitive unique name. A duplicate raises SQLSTATE 23505, which the
-- client maps to a friendly "name already exists" message.
create unique index teams_name_lower_idx on public.teams (lower(name));

-- Row Level Security -------------------------------------------------------------

alter table public.teams enable row level security;

-- Members (admins are members too) may read the team. auth.jwt() is wrapped in a
-- subselect so it is evaluated once per query rather than per row.
create policy "Teams are viewable by members"
  on public.teams
  for select
  to authenticated
  using ((select auth.jwt() ->> 'email') = any (members));

-- Only admins may update or delete.
create policy "Teams are updatable by admins"
  on public.teams
  for update
  to authenticated
  using ((select auth.jwt() ->> 'email') = any (admins))
  with check ((select auth.jwt() ->> 'email') = any (admins));

create policy "Teams are deletable by admins"
  on public.teams
  for delete
  to authenticated
  using ((select auth.jwt() ->> 'email') = any (admins));

-- No INSERT policy: rows are created only by create_team() below (security
-- definer), never directly by clients.

-- Keep updated_at current on every update (moddatetime extension already installed
-- by the profiles migration).
create trigger teams_set_updated_at
  before update on public.teams
  for each row
  execute function extensions.moddatetime (updated_at);

-- Create a team ------------------------------------------------------------------
-- Inserts the team with the caller as sole admin + member, then links the new id
-- into the caller's profile. security definer so both writes commit together and
-- the profile update bypasses the owner-only profiles UPDATE policy.

create function public.create_team(team_name text)
returns public.teams
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_email text := auth.jwt() ->> 'email';
  new_team public.teams;
begin
  if caller_id is null or caller_email is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  insert into public.teams (name, members, admins)
  values (team_name, array[caller_email], array[caller_email])
  returning * into new_team;

  update public.profiles
    set teams = array_append(teams, new_team.id)
    where id = caller_id;

  return new_team;
end;
$$;

grant execute on function public.create_team(text) to authenticated;

-- Update a team ------------------------------------------------------------------
-- Admins only. Updates name + members, prunes admins to those still members, and
-- reconciles profiles.teams for members added/removed who have an account.

create function public.update_team(team_id uuid, team_name text, team_members text[])
returns public.teams
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_email text := auth.jwt() ->> 'email';
  existing public.teams;
  updated public.teams;
  removed text[];
  added text[];
begin
  select * into existing from public.teams where id = team_id;
  if not found then
    raise exception 'team not found' using errcode = 'P0002';
  end if;
  if caller_email is null or not (caller_email = any (existing.admins)) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.teams
     set name = team_name,
         members = team_members,
         -- an admin removed from members loses admin on this team
         admins = array(select unnest(existing.admins) intersect select unnest(team_members))
   where id = team_id
   returning * into updated;

  removed := array(select unnest(existing.members) except select unnest(team_members));
  added   := array(select unnest(team_members)   except select unnest(existing.members));

  -- Drop the team from the reverse index of removed members.
  update public.profiles
     set teams = array_remove(teams, team_id)
   where email = any (removed);

  -- Add it for newly added members that have an account (guard preserves the
  -- profiles_teams_unique check).
  update public.profiles
     set teams = array_append(teams, team_id)
   where email = any (added) and not (team_id = any (teams));

  return updated;
end;
$$;

grant execute on function public.update_team(uuid, text, text[]) to authenticated;

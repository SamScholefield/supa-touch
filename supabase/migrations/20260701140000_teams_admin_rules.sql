-- Admin lifecycle rules:
--  * An admin cannot remove themselves from a team via update_team.
--  * Because the caller must be an admin and must remain a member, at least one
--    admin always survives an edit — i.e. the last admin can never be removed.
--    To get rid of a team, delete it (delete_team) instead.

-- Re-create update_team with the self-removal guard. (Body is otherwise identical
-- to 20260701120000_create_teams.sql.)
create or replace function public.update_team(team_id uuid, team_name text, team_members text[])
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

  -- An admin may not remove themselves; delete the team instead. This also
  -- guarantees the team keeps at least one admin (the caller stays a member, and
  -- admins are the admins still present in members).
  if not (caller_email = any (team_members)) then
    raise exception 'admins cannot remove themselves; delete the team instead'
      using errcode = 'PT001';
  end if;

  update public.teams
     set name = team_name,
         members = team_members,
         admins = array(select unnest(existing.admins) intersect select unnest(team_members))
   where id = team_id
   returning * into updated;

  removed := array(select unnest(existing.members) except select unnest(team_members));
  added   := array(select unnest(team_members)   except select unnest(existing.members));

  update public.profiles
     set teams = array_remove(teams, team_id)
   where email = any (removed);

  update public.profiles
     set teams = array_append(teams, team_id)
   where email = any (added) and not (team_id = any (teams));

  return updated;
end;
$$;

-- Delete a team (admins only). Cleans the team id out of every member's reverse
-- index first, then removes the row.
create function public.delete_team(team_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_email text := auth.jwt() ->> 'email';
  existing public.teams;
begin
  select * into existing from public.teams where id = team_id;
  if not found then
    raise exception 'team not found' using errcode = 'P0002';
  end if;
  if caller_email is null or not (caller_email = any (existing.admins)) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.profiles
     set teams = array_remove(teams, team_id)
   where email = any (existing.members);

  delete from public.teams where id = team_id;
end;
$$;

grant execute on function public.delete_team(uuid) to authenticated;

-- Profiles: rename full_name -> display_name and add a `teams` array.
-- Forward migration on top of 20260628122630_create_profiles.sql (already applied).

-- 1. Rename the column (existing values are preserved).
alter table public.profiles rename column full_name to display_name;

-- 2. Re-create the signup trigger function so it targets display_name. The previous
--    body is stored as text and still references full_name; a rename does not rewrite
--    it, so the next signup would fail without this.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

-- 3. Array-element uniqueness helper. A CHECK constraint cannot contain a subquery,
--    so the dedupe test lives in an immutable function the constraint calls.
create function public.has_unique_elements(arr uuid[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select cardinality(arr) = (select count(distinct e) from unnest(arr) as t(e));
$$;

-- 4. Add the teams array: uuid ids, unique per profile, no duplicate memberships.
--    not null default '{}' backfills existing rows to an empty list. No FK yet — the
--    teams table is a later feature.
alter table public.profiles
  add column teams uuid[] not null default '{}',
  add constraint profiles_teams_unique check (public.has_unique_elements(teams));

-- 5. GIN index for future membership lookups, e.g. where teams @> array[:id]::uuid[].
create index profiles_teams_idx on public.profiles using gin (teams);

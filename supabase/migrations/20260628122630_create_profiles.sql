-- Profiles: one row per auth user.
--
-- * Auto-created by a trigger when a new auth.users row is inserted (signup). The
--   trigger fires inside the same transaction as the user insert, so signup and
--   profile creation commit or roll back together — no orphaned users or profiles.
-- * `on delete cascade` ties the profile lifetime to the auth user: deleting a user
--   from auth.users removes their profile in the same transaction.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile data, one row per auth user.';

-- Row Level Security -------------------------------------------------------------

alter table public.profiles enable row level security;

-- Owners may read their own profile. auth.uid() is wrapped in a subselect so it is
-- evaluated once per query (cached) rather than per row.
create policy "Profiles are viewable by the owner"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Owners may update their own profile.
create policy "Profiles are updatable by the owner"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No INSERT/DELETE policies: rows are created by the signup trigger below (security
-- definer) and deleted via the auth.users cascade, never directly by clients.

-- Auto-create a profile on signup ------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill profiles for any users that already exist (e.g. created before this
-- migration). Idempotent: re-running skips users that already have a profile.
insert into public.profiles (id, email, full_name, avatar_url)
select
  id,
  email,
  raw_user_meta_data ->> 'full_name',
  raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;

-- Keep updated_at current on every update.
create extension if not exists moddatetime schema extensions;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function extensions.moddatetime (updated_at);

-- PostgREST roles need table-level privileges in addition to RLS policies. Tables
-- created via SQL migration (unlike tables created through the dashboard) do not
-- get these grants automatically, so `authenticated` hits "permission denied for
-- table teams" on select before RLS is even evaluated.
--
-- Only SELECT is granted: the client only reads teams directly (list / get). All
-- writes go through create_team()/update_team() (security definer), so INSERT,
-- UPDATE and DELETE stay ungranted and row access remains gated by the RLS
-- policies in 20260701120000_create_teams.sql.
grant select on public.teams to authenticated;

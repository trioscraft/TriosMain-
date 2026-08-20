-- ============================================
-- 016: Portfolio projects RLS policies
-- ============================================
-- The `portfolio_projects` table is created by migration 013 without RLS, but
-- if it was created in the Supabase dashboard (or RLS was enabled afterwards)
-- every anon read on the public site and every admin write silently fails.
-- Add policies matching how the app uses the table:
--   - public (anon): read published projects on the marketing site
--   - authenticated: full management from the admin portal (both use the
--     same anon-key client from lib/supabase.ts, distinguished by session)

alter table public.portfolio_projects enable row level security;

drop policy if exists "Public can read portfolio projects" on public.portfolio_projects;
create policy "Public can read portfolio projects"
  on public.portfolio_projects
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can manage portfolio projects" on public.portfolio_projects;
create policy "Authenticated can manage portfolio projects"
  on public.portfolio_projects
  for all
  to authenticated
  using (true)
  with check (true);
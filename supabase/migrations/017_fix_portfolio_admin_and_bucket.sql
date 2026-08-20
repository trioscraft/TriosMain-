-- ============================================
-- 017: Fix admin portfolio writes + media upload
-- ============================================
-- Two things break the admin "Portfolio" page on databases where migrations
-- 013/016 were never applied:
--   1) `portfolio_projects` has RLS enabled but no INSERT/UPDATE/DELETE policy,
--      so the admin form fails with "new row violates row-level security policy".
--   2) The `portfolio-images` storage bucket does not exist, so image upload
--      fails with "Make sure the 'portfolio-images' bucket exists".
-- This migration is safe to run multiple times.

-- ------------------------------
-- 1) RLS policies for portfolio_projects
-- ------------------------------
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

-- ------------------------------
-- 2) Ensure the media bucket exists and is public
-- ------------------------------
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do update set public = true;

-- Public read access to portfolio images (harmless for a public bucket).
drop policy if exists "Public read portfolio images" on storage.objects;
create policy "Public read portfolio images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'portfolio-images');
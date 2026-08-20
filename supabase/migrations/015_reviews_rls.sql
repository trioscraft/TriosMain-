-- ============================================
-- 015: Reviews RLS policies
-- ============================================
-- The `reviews` table was created in the Supabase dashboard with RLS enabled
-- but no policies, so the admin portal could read reviews but every UPDATE
-- (approve/hide, reply, delete) silently affected 0 rows. Add policies that
-- match how the app uses the table:
--   - public (anon): read reviews on the marketing site + submit a review
--     via the /api/reviews route (both use the anon key)
--   - authenticated: full management (toggle approval, reply, delete)

alter table public.reviews enable row level security;

drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews"
  on public.reviews
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can insert reviews" on public.reviews;
create policy "Public can insert reviews"
  on public.reviews
  for insert
  to anon
  with check (true);

drop policy if exists "Authenticated can manage reviews" on public.reviews;
create policy "Authenticated can manage reviews"
  on public.reviews
  for all
  to authenticated
  using (true)
  with check (true);

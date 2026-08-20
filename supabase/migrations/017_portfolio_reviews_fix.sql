-- 017: Fix missing portfolio_projects table + reviews reply RLS
-- Run this in the Supabase Dashboard > SQL Editor, then click "Run".
-- Safe/idempotent: uses IF NOT EXISTS / DROP POLICY IF EXISTS.

-- ============================================================
-- 1) portfolio_projects table (fixes "PGRST205 ... not found")
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tagline text,
  description text,
  category text,
  tech text[] not null default '{}',
  image text,
  video_url text,
  demo_url text,
  github_url text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_projects_published_idx on public.portfolio_projects (published);
create index if not exists portfolio_projects_featured_idx on public.portfolio_projects (featured);
create index if not exists portfolio_projects_created_at_idx on public.portfolio_projects (created_at desc);

drop trigger if exists portfolio_projects_touch_updated_at on public.portfolio_projects;
create trigger portfolio_projects_touch_updated_at
  before update on public.portfolio_projects
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 2) reviews: ensure reply columns exist
-- ============================================================
alter table public.reviews add column if not exists reply text;
alter table public.reviews add column if not exists replied_at timestamptz;

-- ============================================================
-- 3) reviews RLS (THIS is why admin replies never saved)
--    The "Authenticated can manage reviews" policy was missing,
--    so an authenticated admin UPDATE silently affected 0 rows.
-- ============================================================
alter table public.reviews enable row level security;

drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews"
  on public.reviews for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can insert reviews" on public.reviews;
create policy "Public can insert reviews"
  on public.reviews for insert
  to anon
  with check (true);

drop policy if exists "Authenticated can manage reviews" on public.reviews;
create policy "Authenticated can manage reviews"
  on public.reviews for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- 4) storage bucket for portfolio media (optional, harmless)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

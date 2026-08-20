-- ============================================
-- 013: Portfolio Projects + Review Replies
-- ============================================
-- Adds:
--  1) `portfolio_projects` — public marketing-site projects that admins
--     manage from the admin portal (image, video, demo/github links, etc).
--  2) `reply` / `replied_at` columns on `reviews` so admins can reply to
--     reviews, with the reply shown on the marketing site.
--  3) A public storage bucket `portfolio-images` for uploaded project media.

-- ------------------------------
-- portfolio_projects
-- ------------------------------
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

-- Keep updated_at fresh on edits.
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

drop trigger if exists portfolio_projects_touch_updated_at on public.portfolio_projects;
create trigger portfolio_projects_touch_updated_at
  before update on public.portfolio_projects
  for each row execute function public.touch_updated_at();

-- Intentionally left WITHOUT row level security, matching the other open
-- management tables in this project; access is enforced by client-side guards.

-- ------------------------------
-- reviews: admin reply columns
-- ------------------------------
-- The `reviews` table is normally created in the Supabase dashboard, but we
-- also create it here if missing so a fresh database gets a working table.
-- `create table if not exists` makes this a no-op when the dashboard table
-- already exists; the ALTER below then only adds the reply columns.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text default '',
  rating integer not null default 5,
  comment text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.reviews
  add column if not exists reply text,
  add column if not exists replied_at timestamptz;

-- ------------------------------
-- Public storage bucket for portfolio media
-- ------------------------------
-- NOTE: bucket creation via SQL works; object access policies (insert/select)
-- must still be added in the Dashboard under Storage -> portfolio-images if the
-- service-role upload path is not used. The admin upload route uses the
-- service-role key which bypasses storage RLS.
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;
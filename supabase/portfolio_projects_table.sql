-- Create the missing portfolio_projects table.
-- Paste into: Supabase Dashboard -> SQL Editor -> Run.
-- Project must be: vwmbvksgdcsoyzotmkmg.supabase.co (the one in your .env.local)
-- Idempotent: safe to run multiple times.

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
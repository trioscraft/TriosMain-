-- 0000_auth_schema.sql
-- Profiles + client_users for the TriosFlow management area.
-- Auth model (client-side guards in the app):
--   - profiles.id  = auth.users.id, role in ('admin','member','client')
--   - client_users.id = auth.users.id (portal login for a client of a project)
-- NOTE: the API route handlers call Supabase with the anon key and
-- supabase.auth.getUser() returns null server-side. These two tables are left
-- WITHOUT row level security (matching the rest of the "open" management API);
-- the app enforces access via client-side guards. Tighten later with @supabase/ssr
-- server sessions + stricter policies if needed.
--
-- clients is created here (first) so that client_users.client_id and the
-- later core/relation migrations can reference it.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  role text not null default 'member' check (role in ('admin','member','client')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_users (
  id uuid primary key references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  email text,
  name text,
  role text not null default 'client' check (role = 'client'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
-- Wrapped in EXCEPTION handling on purpose: a failure here must NEVER break
-- sign-up / sign-in (a common root cause of "Database error querying schema").
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    'member'
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- These tables are intentionally left WITHOUT RLS (open, like the management
-- API). Drop any prior policies and explicitly disable RLS in case an earlier
-- run enabled it.
drop policy if exists "profiles_all" on public.profiles;
drop policy if exists "client_users_all" on public.client_users;
alter table public.profiles disable row level security;
alter table public.client_users disable row level security;

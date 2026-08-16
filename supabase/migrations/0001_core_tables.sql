-- 0001_core_tables.sql
-- Core operational tables that the app reads/writes and that later migrations
-- reference via foreign keys (expenses/invoices/files/conversations/wiki all
-- reference projects(id); expenses/invoices/files reference profiles(id), which
-- is created in 0000_auth_schema.sql).
--
-- NOTE: clients is created in 0000_auth_schema.sql (first), so projects.client_id
-- and client_messages.client_id foreign keys resolve. 003's
-- "create table if not exists clients" then becomes a no-op and only its ALTER
-- statements apply.

-- ------------------------------
-- projects
-- ------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  budget numeric not null default 0,
  progress numeric not null default 0,
  status text not null default 'active',
  client_id uuid references public.clients(id) on delete set null,
  start_date date,
  due_date date,
  created_at timestamptz not null default now()
);

-- ------------------------------
-- tasks
-- ------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  progress numeric not null default 0,
  assigned_to uuid references public.profiles(id) on delete set null,
  due_date date,
  created_at timestamptz not null default now()
);

-- ------------------------------
-- time_entries
-- ------------------------------
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  project_id uuid references public.projects(id) on delete cascade,
  start_time timestamptz,
  end_time timestamptz,
  total_hours numeric not null default 0,
  hourly_rate numeric default 0,
  amount numeric default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------
-- active_sessions (timer)
-- ------------------------------
create table if not exists public.active_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  project_id uuid references public.projects(id) on delete cascade,
  started_at timestamptz not null default now()
);

-- ------------------------------
-- client_messages (client portal chat)
-- ------------------------------
create table if not exists public.client_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  client_user_id uuid references public.client_users(id) on delete set null,
  sender text not null default 'client',
  body text not null,
  reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------
-- indexes
-- ------------------------------
create index if not exists clients_email_idx on public.clients (email);
create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);
create index if not exists time_entries_project_id_idx on public.time_entries (project_id);
create index if not exists time_entries_user_id_idx on public.time_entries (user_id);
create index if not exists active_sessions_user_id_idx on public.active_sessions (user_id);
create index if not exists client_messages_client_id_idx on public.client_messages (client_id);

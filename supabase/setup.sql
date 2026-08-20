-- ============================================================
-- TriosFlow + Trios Craft - Combined Supabase setup
-- Paste this entire file into the Supabase SQL Editor and click Run.
-- Idempotent: tables IF NOT EXISTS; policies & triggers DROP IF EXISTS; profiles/client_users RLS off.
-- (storage.objects policies are Dashboard-only - see runbook.)
-- ============================================================

-- ------------------------------------------------------------
-- 0000_auth_schema.sql
-- ------------------------------------------------------------
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


-- ------------------------------------------------------------
-- 0001_core_tables.sql
-- ------------------------------------------------------------
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
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  progress numeric not null default 0,
  assigned_to uuid references public.profiles(id) on delete set null,
  due_date date,
  created_at timestamptz not null default now()
);

-- Supabase enables RLS by default on new tables; without a policy every
-- insert/update is denied. Allow authenticated users (admins + members) to
-- manage tasks — admins create/assign, members update their own task progress.
alter table public.tasks enable row level security;

drop policy if exists "Authenticated can manage tasks" on public.tasks;
create policy "Authenticated can manage tasks"
  on public.tasks
  for all
  to authenticated
  using (true)
  with check (true);

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


-- ------------------------------------------------------------
-- 001_create_activities_table.sql
-- ------------------------------------------------------------
-- Migration: create activities table
-- Run this SQL in your Supabase database or with your migration tooling.

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  project_id uuid NOT NULL,
  project_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activities_project_id_idx ON activities (project_id);
CREATE INDEX IF NOT EXISTS activities_user_id_idx ON activities (user_id);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON activities (created_at DESC);


-- ------------------------------------------------------------
-- 002_create_expenses_table.sql
-- ------------------------------------------------------------
-- Migration: create expenses table
-- Run this SQL in your Supabase database or with your migration tooling.

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expenses_project_id_idx ON expenses (project_id);
CREATE INDEX IF NOT EXISTS expenses_created_by_idx ON expenses (created_by);
CREATE INDEX IF NOT EXISTS expenses_created_at_idx ON expenses (created_at DESC);

-- Enable Row Level Security for expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Allow admins to do everything
drop policy if exists "Admins can do everything with expenses" on expenses;
CREATE POLICY "Admins can do everything with expenses" ON expenses
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));


-- ------------------------------------------------------------
-- 003_create_clients_and_project_client_relation.sql
-- ------------------------------------------------------------
-- Create clients table and add client relationship to projects

create table if not exists clients (
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

alter table if exists projects
  add column if not exists client_id uuid references clients(id) on delete set null;

alter table if exists activities
  add column if not exists client_id uuid;

alter table if exists activities
  add column if not exists client_name text;


-- ------------------------------------------------------------
-- 004_create_invoices_quotations_tables.sql
-- ------------------------------------------------------------
-- Migration: Create Invoices & Quotations System
-- This migration adds complete invoicing and quotation functionality

-- ============================================
-- QUOTATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  quotation_number text NOT NULL UNIQUE,
  title text,
  description text,
  services text,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  terms text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quotations_client_id_idx ON quotations (client_id);
CREATE INDEX IF NOT EXISTS quotations_project_id_idx ON quotations (project_id);
CREATE INDEX IF NOT EXISTS quotations_status_idx ON quotations (status);
CREATE INDEX IF NOT EXISTS quotations_created_at_idx ON quotations (created_at DESC);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  quotation_id uuid REFERENCES quotations(id) ON DELETE SET NULL,
  invoice_number text NOT NULL UNIQUE,
  title text,
  amount numeric NOT NULL DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_date date,
  notes text,
  terms text,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invoices_client_id_idx ON invoices (client_id);
CREATE INDEX IF NOT EXISTS invoices_project_id_idx ON invoices (project_id);
CREATE INDEX IF NOT EXISTS invoices_quotation_id_idx ON invoices (quotation_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices (status);
CREATE INDEX IF NOT EXISTS invoices_due_date_idx ON invoices (due_date);
CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON invoices (created_at DESC);

-- ============================================
-- INVOICE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON invoice_items (invoice_id);

-- ============================================
-- QUOTATION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quotation_items_quotation_id_idx ON quotation_items (quotation_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

-- Quotations policies
drop policy if exists "Admins can do everything with quotations" on quotations;
CREATE POLICY "Admins can do everything with quotations" ON quotations
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

drop policy if exists "Members can view quotations" on quotations;
CREATE POLICY "Members can view quotations" ON quotations
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'member')
  ));

-- Invoices policies
drop policy if exists "Admins can do everything with invoices" on invoices;
CREATE POLICY "Admins can do everything with invoices" ON invoices
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

drop policy if exists "Members can view invoices" on invoices;
CREATE POLICY "Members can view invoices" ON invoices
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'member')
  ));

-- Invoice items policies
drop policy if exists "Admins can do everything with invoice_items" on invoice_items;
CREATE POLICY "Admins can do everything with invoice_items" ON invoice_items
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

drop policy if exists "Members can view invoice_items" on invoice_items;
CREATE POLICY "Members can view invoice_items" ON invoice_items
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'member')
  ));

-- Quotation items policies
drop policy if exists "Admins can do everything with quotation_items" on quotation_items;
CREATE POLICY "Admins can do everything with quotation_items" ON quotation_items
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

drop policy if exists "Members can view quotation_items" on quotation_items;
CREATE POLICY "Members can view quotation_items" ON quotation_items
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'member')
  ));

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for quotations
drop trigger if exists update_quotations_updated_at on quotations;
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for invoices
drop trigger if exists update_invoices_updated_at on invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ACTIVITY FEED COLUMN UPDATES
-- ============================================

-- Add quotation_id and invoice_id to activities table
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS quotation_id uuid,
  ADD COLUMN IF NOT EXISTS invoice_id uuid;


-- ------------------------------------------------------------
-- 004_create_notifications_table.sql
-- ------------------------------------------------------------
-- Create notifications table for user alerts and system events
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  related_id text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);


-- ------------------------------------------------------------
-- 005_create_project_files_table.sql
-- ------------------------------------------------------------
-- ============================================
-- PROJECT FILES (Document Center)
-- ============================================

-- Table: files
-- Stores metadata for objects in Supabase Storage bucket: project-files

CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  uploaded_by uuid NOT NULL REFERENCES profiles(id),

  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_type text,

  category text NOT NULL CHECK (
    category IN (
      'Contracts',
      'Designs',
      'Source Code',
      'Invoices',
      'Reports',
      'Assets',
      'Other'
    )
  ),

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS files_project_id_idx ON files (project_id);
CREATE INDEX IF NOT EXISTS files_uploaded_by_idx ON files (uploaded_by);
CREATE INDEX IF NOT EXISTS files_category_idx ON files (category);
CREATE INDEX IF NOT EXISTS files_created_at_idx ON files (created_at DESC);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Admins: full access
drop policy if exists "Admins can do everything with files" on files;
CREATE POLICY "Admins can do everything with files"
  ON files
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Members: can view files; can upload (no delete policy)
-- Assumption (based on existing schema): members can access any project.
drop policy if exists "Members can view files" on files;
CREATE POLICY "Members can view files"
  ON files
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin','member')
    )
  );

drop policy if exists "Members can insert files" on files;
CREATE POLICY "Members can insert files"
  ON files
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin','member')
    )
  );

-- Clients: can only view files for the project they belong to,
-- and only certain categories.
-- Assumptions:
-- 1) Client auth role is stored in client_users table (as in getCurrentUserRole).
-- 2) projects.client_id points to clients(id).
-- 3) client_users.id matches auth user id.
-- If your schema differs, adjust the join.

drop policy if exists "Clients can view allowed project files" on files;
CREATE POLICY "Clients can view allowed project files"
  ON files
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT cu.id
      FROM client_users cu
      WHERE cu.role = 'client'
    )
    AND project_id IN (
      SELECT p.id
      FROM projects p
      JOIN clients c ON c.id = p.client_id
      JOIN client_users cu ON cu.id = c.id
      WHERE cu.role = 'client'
    )
    AND category IN ('Contracts','Reports','Invoices')
  );


-- ------------------------------------------------------------
-- 006_configure_project_files_storage.sql
-- ------------------------------------------------------------
-- ============================================
-- PROJECT FILES: Supabase Storage setup
-- ============================================

-- NOTE:
-- Supabase storage buckets are stored in the "storage" schema.
-- This migration creates bucket `project-files` if it doesn't exist
-- and configures permissive RLS-like policies via storage RBAC.
-- You may need to run this in the Supabase SQL editor with access
-- to storage tables.

-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage folder convention
-- We will store uploaded objects under:
--   project-files/project_<projectId>/<categoryFolder>/<generated_uuid>_<original_file_name>
-- Example:
--   project-files/project_123/contracts/contract.pdf
--
-- Where categoryFolder is:
--   contracts, reports, invoices, designs, assets, source-code, other

-- ============================================
-- Storage object access policies
-- ============================================
-- NOTE: Supabase Storage policies live on `storage.objects`, which the SQL
-- Editor role does NOT own, so they CANNOT be applied via raw SQL here
-- (ERROR: 42501 must be owner of table objects). The bucket is created below;
-- the access policies must be added in the Dashboard instead:
--   Storage -> project-files -> Policies
-- Add (using the "Create policy" UI / "For full customization use the
-- SQL editor inside the policy editor"):
--   1) Admins: full access  (bucket_id = 'project-files' AND auth.uid() IN
--      (SELECT id FROM profiles WHERE role = 'admin'))
--   2) Members: select + insert (auth.uid() IN
--      (SELECT id FROM profiles WHERE role IN ('admin','member')))
--   3) Clients: select where bucket_id='project-files' AND auth.uid() IN
--      (SELECT id FROM client_users WHERE role='client') AND path matches
--      project_<projectId>/... and category in contracts/reports/invoices.


-- ------------------------------------------------------------
-- 007_create_team_chat_tables.sql
-- ------------------------------------------------------------
-- ============================================================
-- TriosFlow Team Chat & Mentions (Unified conversations system)
-- ============================================================

-- ------------------------------
-- Helper: user role checks
-- ------------------------------
-- Assumptions:
-- - Admin/member roles live in `profiles.role`
-- - Client role lives in `client_users.role` and `client_users.id = auth.uid()`
-- - RLS uses auth.uid()

-- ------------------------------
-- conversations
-- ------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  conversation_type text NOT NULL CHECK (conversation_type IN ('team','client')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversations_project_id_idx ON conversations(project_id);
CREATE INDEX IF NOT EXISTS conversations_type_idx ON conversations(conversation_type);

-- ------------------------------
-- messages
-- ------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id),
  sender_role text NOT NULL CHECK (sender_role IN ('admin','member','client')),
  message text NOT NULL,
  edited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);

-- ------------------------------
-- message_mentions
-- ------------------------------
CREATE TABLE IF NOT EXISTS message_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  mentioned_user_id uuid NOT NULL REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS message_mentions_message_id_idx ON message_mentions(message_id);
CREATE INDEX IF NOT EXISTS message_mentions_mentioned_user_id_idx ON message_mentions(mentioned_user_id);

-- ------------------------------
-- message_reactions
-- ------------------------------
CREATE TABLE IF NOT EXISTS message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  reaction text NOT NULL CHECK (reaction IN ('ðŸ‘','â¤ï¸','ðŸš€','ðŸ‘€')),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS message_reactions_message_id_idx ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS message_reactions_user_id_idx ON message_reactions(user_id);

-- ------------------------------
-- message_files
-- ------------------------------
CREATE TABLE IF NOT EXISTS message_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS message_files_message_id_idx ON message_files(message_id);
CREATE INDEX IF NOT EXISTS message_files_file_id_idx ON message_files(file_id);

-- ------------------------------
-- Enable RLS
-- ------------------------------
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_files ENABLE ROW LEVEL SECURITY;

-- ------------------------------
-- RLS: conversations
-- ------------------------------

-- Admin: full access
drop policy if exists "admin_conversations_all" on conversations;
CREATE POLICY "admin_conversations_all"
  ON conversations
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Members: only team conversations
drop policy if exists "member_conversations_select_team" on conversations;
CREATE POLICY "member_conversations_select_team"
  ON conversations
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND conversation_type = 'team'
  );

drop policy if exists "member_conversations_insert_team" on conversations;
CREATE POLICY "member_conversations_insert_team"
  ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND conversation_type = 'team'
  );

drop policy if exists "member_conversations_update_team" on conversations;
CREATE POLICY "member_conversations_update_team"
  ON conversations
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND conversation_type = 'team'
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND conversation_type = 'team'
  );

-- Clients: only client conversations
drop policy if exists "client_conversations_select_client" on conversations;
CREATE POLICY "client_conversations_select_client"
  ON conversations
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND conversation_type = 'client'
  );

drop policy if exists "client_conversations_insert_client" on conversations;
CREATE POLICY "client_conversations_insert_client"
  ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND conversation_type = 'client'
  );

drop policy if exists "client_conversations_update_client" on conversations;
CREATE POLICY "client_conversations_update_client"
  ON conversations
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND conversation_type = 'client'
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND conversation_type = 'client'
  );

-- ------------------------------
-- RLS: messages
-- ------------------------------

-- Admin: full access
drop policy if exists "admin_messages_all" on messages;
CREATE POLICY "admin_messages_all"
  ON messages
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Member: read team messages only
drop policy if exists "member_messages_select_team" on messages;
CREATE POLICY "member_messages_select_team"
  ON messages
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'team'
    )
    AND messages.deleted_at IS NULL
  );

-- Client: read client messages only
drop policy if exists "client_messages_select_client" on messages;
CREATE POLICY "client_messages_select_client"
  ON messages
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'client'
    )
    AND messages.deleted_at IS NULL
  );

-- Member: insert messages only into team conversations
drop policy if exists "member_messages_insert_team" on messages;
CREATE POLICY "member_messages_insert_team"
  ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'team'
    )
  );

-- Client: insert messages only into client conversations
drop policy if exists "client_messages_insert_client" on messages;
CREATE POLICY "client_messages_insert_client"
  ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'client'
    )
  );

-- Member: edit own messages in team conversations
drop policy if exists "member_messages_update_own" on messages;
CREATE POLICY "member_messages_update_own"
  ON messages
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'team'
    )
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'team'
    )
  );

-- Client: edit own messages in client conversations
drop policy if exists "client_messages_update_own" on messages;
CREATE POLICY "client_messages_update_own"
  ON messages
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'client'
    )
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'client'
    )
  );

-- Member: delete own messages (soft delete via deleted_at)
drop policy if exists "member_messages_soft_delete_own" on messages;
CREATE POLICY "member_messages_soft_delete_own"
  ON messages
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'team'
    )
  );

-- Client: delete own messages (soft delete via deleted_at)
drop policy if exists "client_messages_soft_delete_own" on messages;
CREATE POLICY "client_messages_soft_delete_own"
  ON messages
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.conversation_type = 'client'
    )
  );

-- ------------------------------
-- RLS: message_mentions
-- ------------------------------

-- Admin: full access
drop policy if exists "admin_message_mentions_all" on message_mentions;
CREATE POLICY "admin_message_mentions_all"
  ON message_mentions
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Member: can read mentions for messages they can read
drop policy if exists "member_message_mentions_select" on message_mentions;
CREATE POLICY "member_message_mentions_select"
  ON message_mentions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_mentions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'team'
    )
  );

-- Client: can read mentions for messages they can read (client conversations only)
drop policy if exists "client_message_mentions_select" on message_mentions;
CREATE POLICY "client_message_mentions_select"
  ON message_mentions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_mentions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'client'
    )
  );

-- Insert mentions allowed for users who can insert messages into the related conversation
drop policy if exists "member_message_mentions_insert" on message_mentions;
CREATE POLICY "member_message_mentions_insert"
  ON message_mentions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_mentions.message_id
        AND c.conversation_type = 'team'
    )
  );

drop policy if exists "client_message_mentions_insert" on message_mentions;
CREATE POLICY "client_message_mentions_insert"
  ON message_mentions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_mentions.message_id
        AND c.conversation_type = 'client'
    )
  );

-- ------------------------------
-- RLS: message_reactions
-- ------------------------------

-- Admin: full access (moderate reactions)
drop policy if exists "admin_message_reactions_all" on message_reactions;
CREATE POLICY "admin_message_reactions_all"
  ON message_reactions
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Everyone with access to the message can select reactions
drop policy if exists "member_message_reactions_select" on message_reactions;
CREATE POLICY "member_message_reactions_select"
  ON message_reactions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'team'
    )
    AND message_reactions.deleted_at IS NULL
  );

drop policy if exists "client_message_reactions_select" on message_reactions;
CREATE POLICY "client_message_reactions_select"
  ON message_reactions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'client'
    )
    AND message_reactions.deleted_at IS NULL
  );

-- Member: create own reaction on team message
drop policy if exists "member_message_reactions_insert_own" on message_reactions;
CREATE POLICY "member_message_reactions_insert_own"
  ON message_reactions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'team'
    )
  );

-- Client: create own reaction on client message
drop policy if exists "client_message_reactions_insert_own" on message_reactions;
CREATE POLICY "client_message_reactions_insert_own"
  ON message_reactions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'client'
    )
  );

-- Member: delete own reaction
drop policy if exists "member_message_reactions_delete_own" on message_reactions;
CREATE POLICY "member_message_reactions_delete_own"
  ON message_reactions
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'team'
    )
  );

-- Client: delete own reaction
drop policy if exists "client_message_reactions_delete_own" on message_reactions;
CREATE POLICY "client_message_reactions_delete_own"
  ON message_reactions
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'client'
    )
  );

-- ------------------------------
-- RLS: message_files
-- ------------------------------

-- Admin: full access
drop policy if exists "admin_message_files_all" on message_files;
CREATE POLICY "admin_message_files_all"
  ON message_files
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Members: can attach/read files only in team message contexts and only to files they can access
drop policy if exists "member_message_files_select" on message_files;
CREATE POLICY "member_message_files_select"
  ON message_files
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_files.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'team'
    )
    AND EXISTS (
      SELECT 1 FROM files f WHERE f.id = message_files.file_id
    )
  );

drop policy if exists "member_message_files_insert" on message_files;
CREATE POLICY "member_message_files_insert"
  ON message_files
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'member')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_files.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'team'
    )
    AND EXISTS (
      SELECT 1 FROM files f WHERE f.id = message_files.file_id
    )
  );

-- Clients: can only attach/read file links for client conversations.
-- Additionally, file access is already enforced by `files` RLS + policies.
drop policy if exists "client_message_files_select" on message_files;
CREATE POLICY "client_message_files_select"
  ON message_files
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_files.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'client'
    )
    AND EXISTS (
      SELECT 1 FROM files f WHERE f.id = message_files.file_id
    )
  );

drop policy if exists "client_message_files_insert" on message_files;
CREATE POLICY "client_message_files_insert"
  ON message_files
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_files.message_id
        AND m.deleted_at IS NULL
        AND c.conversation_type = 'client'
    )
    AND EXISTS (
      SELECT 1 FROM files f WHERE f.id = message_files.file_id
    )
  );


-- ------------------------------------------------------------
-- 008_create_project_wiki_tables.sql
-- ------------------------------------------------------------
-- ============================================
-- PROJECT WIKI TABLES
-- ============================================

-- PHASE 1: project_wiki_pages
CREATE TABLE IF NOT EXISTS project_wiki_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_wiki_pages_project_id_idx
  ON project_wiki_pages (project_id);

-- PHASE 2: project_wiki_versions
CREATE TABLE IF NOT EXISTS project_wiki_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES project_wiki_pages(id) ON DELETE CASCADE,
  old_content text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_wiki_versions_page_id_idx
  ON project_wiki_versions (page_id);

-- ============================================
-- RLS + POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE project_wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_wiki_versions ENABLE ROW LEVEL SECURITY;

-- Admins: full access
drop policy if exists "Admins can do everything with project_wiki_pages" on project_wiki_pages;
CREATE POLICY "Admins can do everything with project_wiki_pages"
  ON project_wiki_pages
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

drop policy if exists "Admins can do everything with project_wiki_versions" on project_wiki_versions;
CREATE POLICY "Admins can do everything with project_wiki_versions"
  ON project_wiki_versions
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Members: read + create/update/delete pages within any project
-- (Matches existing repo assumption for member visibility)
drop policy if exists "Members can view project wiki pages" on project_wiki_pages;
CREATE POLICY "Members can view project wiki pages"
  ON project_wiki_pages
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  );

drop policy if exists "Members can insert project wiki pages" on project_wiki_pages;
CREATE POLICY "Members can insert project wiki pages"
  ON project_wiki_pages
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  );

drop policy if exists "Members can update project wiki pages" on project_wiki_pages;
CREATE POLICY "Members can update project wiki pages"
  ON project_wiki_pages
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  );

drop policy if exists "Members can delete project wiki pages" on project_wiki_pages;
CREATE POLICY "Members can delete project wiki pages"
  ON project_wiki_pages
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  );

-- Versions access: members can view versions for pages they can view
drop policy if exists "Members can view project wiki versions" on project_wiki_versions;
CREATE POLICY "Members can view project wiki versions"
  ON project_wiki_versions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  );

drop policy if exists "Members can insert project wiki versions" on project_wiki_versions;
CREATE POLICY "Members can insert project wiki versions"
  ON project_wiki_versions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  );

-- Clients: read-only for pages that belong to their project (selected pages can be added later)
drop policy if exists "Clients can view project wiki pages in their projects" on project_wiki_pages;
CREATE POLICY "Clients can view project wiki pages in their projects"
  ON project_wiki_pages
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND project_id IN (
      SELECT p.id
      FROM projects p
      JOIN clients c ON c.id = p.client_id
      JOIN client_users cu ON cu.id = c.id
      WHERE cu.id = auth.uid()
        AND cu.role = 'client'
    )
  );

-- Versions: clients can view versions for pages in their projects
drop policy if exists "Clients can view project wiki versions in their projects" on project_wiki_versions;
CREATE POLICY "Clients can view project wiki versions in their projects"
  ON project_wiki_versions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM client_users WHERE role = 'client')
    AND page_id IN (
      SELECT wp.id
      FROM project_wiki_pages wp
      JOIN projects p ON p.id = wp.project_id
      JOIN clients c ON c.id = p.client_id
      JOIN client_users cu ON cu.id = c.id
      WHERE cu.id = auth.uid()
        AND cu.role = 'client'
    )
  );

-- ==================================================
-- updated_at trigger for wiki pages
-- ==================================================

CREATE OR REPLACE FUNCTION update_updated_at_column_wiki()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_project_wiki_pages_updated_at ON project_wiki_pages;
drop trigger if exists update_project_wiki_pages_updated_at on project_wiki_pages;
CREATE TRIGGER update_project_wiki_pages_updated_at
  BEFORE UPDATE ON project_wiki_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column_wiki();



-- ============================================================
-- ADMIN APPLICATION SETTINGS (singleton row, id = 1)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.settings (
  id                 integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name       text NOT NULL DEFAULT 'Trios Craft',
  business_email     text NOT NULL DEFAULT '',
  phone              text NOT NULL DEFAULT '',
  address            text NOT NULL DEFAULT '',
  currency           text NOT NULL DEFAULT 'INR',
  timezone           text NOT NULL DEFAULT 'Asia/Kolkata',
  date_format        text NOT NULL DEFAULT 'DD MMM YYYY',
  sender_name        text NOT NULL DEFAULT 'Trios Craft',
  sender_email       text NOT NULL DEFAULT '',
  notify_new_client      boolean NOT NULL DEFAULT true,
  notify_project_updates boolean NOT NULL DEFAULT true,
  notify_invoice_paid    boolean NOT NULL DEFAULT true,
  notify_reviews         boolean NOT NULL DEFAULT true,
  notify_mentions        boolean NOT NULL DEFAULT true,
  maintenance_mode   boolean NOT NULL DEFAULT false,
  updated_at         timestamptz NOT NULL DEFAULT now(),
  updated_by         uuid
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_read_authenticated" ON public.settings;
CREATE POLICY "settings_read_authenticated" ON public.settings
  FOR SELECT USING (auth.role() = 'authenticated');

INSERT INTO public.settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

-- Per-panel maintenance controls (client / member / both, with a timer).
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS maintenance_scope text NOT NULL DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS maintenance_type text NOT NULL DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS maintenance_message text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS maintenance_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS maintenance_reopen_at timestamptz,
  ADD COLUMN IF NOT EXISTS maintenance_started_at timestamptz;

ALTER TABLE public.settings
  DROP CONSTRAINT IF EXISTS settings_maintenance_scope_check;
ALTER TABLE public.settings
  ADD CONSTRAINT settings_maintenance_scope_check
  CHECK (maintenance_scope IN ('client', 'member', 'both'));

ALTER TABLE public.settings
  DROP CONSTRAINT IF EXISTS settings_maintenance_type_check;
ALTER TABLE public.settings
  ADD CONSTRAINT settings_maintenance_type_check
  CHECK (maintenance_type IN ('scheduled', 'emergency', 'updating'));


-- ============================================================
-- BOOTSTRAP ADMIN USER: trioscraft2025@gmail.com / QWERTY
-- Inserts the auth user (bcrypt password) and promotes the
-- auto-created profile to role='admin'.
-- email_confirmed_at is set so no email confirmation is required.
-- (No ON CONFLICT on email - auth.users.email has no single-col unique index.)
-- ============================================================
create extension if not exists pgcrypto;

do $$
declare
  admin_id uuid;
begin
  select id into admin_id from auth.users where email = 'trioscraft2025@gmail.com';
  if admin_id is null then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'trioscraft2025@gmail.com',
      crypt('QWERTY', gen_salt('bf')),
      now(), now(), now()
    )
    returning id into admin_id;
  end if;

  insert into public.profiles (id, email, name, role)
  values (admin_id, 'trioscraft2025@gmail.com', 'Admin', 'admin')
  on conflict (id) do update set role = 'admin', email = excluded.email;
end $$;

-- Re-promote anytime (safe no-op if already admin):
-- UPDATE public.profiles SET role='admin' WHERE email='trioscraft2025@gmail.com';

-- ============================================================
-- MAINTENANCE HISTORY: rolling log of the last 30 sessions.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.maintenance_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  started_at timestamptz NOT NULL,
  ended_at timestamptz NOT NULL,
  scope text NOT NULL DEFAULT 'both',
  type text NOT NULL DEFAULT 'scheduled',
  message text,
  reopen_minutes integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read maintenance history"
  ON public.maintenance_history;
CREATE POLICY "Authenticated can read maintenance history"
  ON public.maintenance_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.trim_maintenance_history()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.maintenance_history
  WHERE id IN (
    SELECT id FROM public.maintenance_history
    ORDER BY ended_at DESC, id DESC
    OFFSET 30
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_trim_maintenance_history
  ON public.maintenance_history;
CREATE TRIGGER trg_trim_maintenance_history
  AFTER INSERT ON public.maintenance_history
  FOR EACH ROW
  EXECUTE FUNCTION public.trim_maintenance_history();


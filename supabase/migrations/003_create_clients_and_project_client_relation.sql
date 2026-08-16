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

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
CREATE POLICY "Admins can do everything with expenses" ON expenses
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

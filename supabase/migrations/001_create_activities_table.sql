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

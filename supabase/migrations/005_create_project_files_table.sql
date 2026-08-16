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
CREATE POLICY "Members can view files"
  ON files
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin','member')
    )
  );

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


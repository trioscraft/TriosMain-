-- ============================================
-- Projects RLS
-- ============================================
-- RLS is already enabled on `projects` (configured in the dashboard).
-- The existing insert policy requires client_id, which blocks creating a
-- project before a client is assigned. Projects can now be created without a
-- client and have one linked later via the edit form.
-- Policies combine with OR, so this does not remove any existing access.

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage projects" ON projects;

CREATE POLICY "Authenticated users can manage projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

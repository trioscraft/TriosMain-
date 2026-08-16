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
CREATE POLICY "Admins can do everything with project_wiki_pages"
  ON project_wiki_pages
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

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
CREATE POLICY "Members can view project wiki pages"
  ON project_wiki_pages
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  );

CREATE POLICY "Members can insert project wiki pages"
  ON project_wiki_pages
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  );

CREATE POLICY "Members can update project wiki pages"
  ON project_wiki_pages
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  );

CREATE POLICY "Members can delete project wiki pages"
  ON project_wiki_pages
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  );

-- Versions access: members can view versions for pages they can view
CREATE POLICY "Members can view project wiki versions"
  ON project_wiki_versions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  );

CREATE POLICY "Members can insert project wiki versions"
  ON project_wiki_versions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin','member'))
  );

-- Clients: read-only for pages that belong to their project (selected pages can be added later)
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
CREATE TRIGGER update_project_wiki_pages_updated_at
  BEFORE UPDATE ON project_wiki_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column_wiki();


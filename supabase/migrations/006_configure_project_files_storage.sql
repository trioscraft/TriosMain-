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


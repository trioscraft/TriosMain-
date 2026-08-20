-- ============================================
-- 014: Activities table — allow non-project actions
-- ============================================
-- Migration 001 created `activities` with project_id / project_name NOT NULL,
-- but the app now logs actions without a project context (review replies,
-- client management, invoices, quotations, portfolio edits). Relax the
-- NOT NULL constraints so those rows can be written. project_id is used as
-- a lookup/foreign-key column, so keep it indexed and FK-constrained.

alter table public.activities
  alter column project_id drop not null,
  alter column project_name drop not null;

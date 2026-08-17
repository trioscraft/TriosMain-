-- ============================================
-- Ensure tasks.priority exists
-- ============================================
-- The calendar (and task forms) reference tasks.priority, but the column is
-- missing from the live database. Add it to match the migrations/setup schema.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS priority text not null default 'medium'
  check (priority in ('low','medium','high','urgent'));

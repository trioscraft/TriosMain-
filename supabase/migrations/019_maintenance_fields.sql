-- ============================================================
-- 019_maintenance_fields.sql
-- Adds per-panel scope, type, message and an end timestamp so
-- maintenance mode can target client/member/both and run on a timer.
-- ============================================================

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS maintenance_scope text NOT NULL DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS maintenance_type text NOT NULL DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS maintenance_message text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS maintenance_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS maintenance_reopen_at timestamptz,
  ADD COLUMN IF NOT EXISTS maintenance_started_at timestamptz;

-- Keep scope/type within allowed values.
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

-- ============================================================
-- 020_maintenance_history.sql
-- Logs each completed maintenance session so admins can review
-- what happened. Only the latest 30 entries are kept — the
-- trigger below deletes the oldest rows one by one as new ones
-- are inserted.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.maintenance_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  started_at timestamptz NOT NULL,
  ended_at timestamptz NOT NULL,
  scope text NOT NULL DEFAULT 'both',
  type text NOT NULL DEFAULT 'scheduled',
  message text,
  reopen_minutes integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read maintenance history"
  ON public.maintenance_history;
CREATE POLICY "Authenticated can read maintenance history"
  ON public.maintenance_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Keep only the most recent 30 records. When a new row is inserted
-- any row beyond the latest 30 (oldest first) is removed.
CREATE OR REPLACE FUNCTION public.trim_maintenance_history()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.maintenance_history
  WHERE id IN (
    SELECT id FROM public.maintenance_history
    ORDER BY ended_at DESC, id DESC
    OFFSET 30
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_trim_maintenance_history
  ON public.maintenance_history;
CREATE TRIGGER trg_trim_maintenance_history
  AFTER INSERT ON public.maintenance_history
  FOR EACH ROW
  EXECUTE FUNCTION public.trim_maintenance_history();

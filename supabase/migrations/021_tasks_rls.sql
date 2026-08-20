-- ============================================================
-- 021_tasks_rls.sql
-- Supabase enables RLS by default on new tables, but `tasks` had no
-- policy, so every insert/update was denied ("new row violates row-level
-- security policy"). Allow authenticated users (admins + members) to
-- manage tasks.
-- ============================================================

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage tasks" ON public.tasks;
CREATE POLICY "Authenticated can manage tasks"
  ON public.tasks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

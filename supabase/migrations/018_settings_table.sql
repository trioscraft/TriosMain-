-- ============================================================
-- 018_settings_table.sql
-- Admin application settings stored as a singleton row (id = 1)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.settings (
  id                 integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name       text NOT NULL DEFAULT 'Trios Craft',
  business_email     text NOT NULL DEFAULT '',
  phone              text NOT NULL DEFAULT '',
  address            text NOT NULL DEFAULT '',
  currency           text NOT NULL DEFAULT 'INR',
  timezone           text NOT NULL DEFAULT 'Asia/Kolkata',
  date_format        text NOT NULL DEFAULT 'DD MMM YYYY',
  sender_name        text NOT NULL DEFAULT 'Trios Craft',
  sender_email       text NOT NULL DEFAULT '',
  notify_new_client      boolean NOT NULL DEFAULT true,
  notify_project_updates boolean NOT NULL DEFAULT true,
  notify_invoice_paid    boolean NOT NULL DEFAULT true,
  notify_reviews         boolean NOT NULL DEFAULT true,
  notify_mentions        boolean NOT NULL DEFAULT true,
  maintenance_mode   boolean NOT NULL DEFAULT false,
  updated_at         timestamptz NOT NULL DEFAULT now(),
  updated_by         uuid
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read the (single) settings row.
DROP POLICY IF EXISTS "settings_read_authenticated" ON public.settings;
CREATE POLICY "settings_read_authenticated" ON public.settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Writes are performed via the service-role key (bypasses RLS) from the
-- admin API, so no public write policy is needed.

-- Seed the singleton row.
INSERT INTO public.settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

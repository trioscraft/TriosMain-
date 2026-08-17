-- ============================================
-- Activities & Notifications RLS
-- ============================================
-- RLS is enabled on these tables in the dashboard, which blocks the app from
-- inserting activity rows and admin notifications (notifications are written
-- for every admin, not just the current user). Add permissive policies for
-- authenticated users. Policies combine with OR, so existing access is kept.

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage activities" ON activities;
CREATE POLICY "Authenticated users can manage activities"
  ON activities
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage notifications" ON notifications;
CREATE POLICY "Authenticated users can manage notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

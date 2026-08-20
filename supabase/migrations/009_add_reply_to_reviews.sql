-- Adds an admin-reply field to reviews so ReviewCard's reply box has data
-- to display. Safe to run multiple times.

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS reply text;

CREATE INDEX IF NOT EXISTS reviews_approved_idx ON reviews (approved);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews (created_at DESC);

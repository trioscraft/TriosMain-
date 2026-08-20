-- ============================================
-- 018: Portfolio project gallery + videos
-- ============================================
-- Adds multi-image and multi-video support to `portfolio_projects`.
--   - gallery text[]: additional images shown in the front-end slider
--     (the existing `image` column remains the cover / first slide)
--   - videos text[]: video URLs (YouTube/Vimeo embeds or direct .mp4/.webm)
--     shown as slides in the same slider

alter table public.portfolio_projects
  add column if not exists gallery text[] not null default '{}',
  add column if not exists videos text[] not null default '{}';
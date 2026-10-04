-- ============================================================
-- NISQ Vanguard
-- Migration: Profile Active Status
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE public.profiles
SET is_active = TRUE
WHERE is_active IS NULL;

CREATE INDEX IF NOT EXISTS profiles_is_active_idx
ON public.profiles(is_active);
-- ============================================================
-- NISQ VANGUARD ACADEMY
-- SECURITY HARDENING
-- REMOVE DIRECT PUBLIC CERTIFICATE ACCESS
-- ============================================================

-- Public certificate verification must happen through the
-- controlled verify_certificate(TEXT) RPC.
--
-- The previous SELECT policy allowed anonymous clients to query
-- every valid certificate row directly. That exposed internal
-- certificate fields unnecessarily.
--
-- Authenticated students retain access to their own certificates
-- through the existing "Students can view their certificates"
-- policy.
--
-- Public visitors continue to use:
--
--   verify_certificate(TEXT)
--
-- which exposes only the intended verification fields.

DROP POLICY IF EXISTS "Public certificate verification"
ON public.certificates;
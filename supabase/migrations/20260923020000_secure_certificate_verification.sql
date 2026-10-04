-- ============================================================
-- NISQ VANGUARD ACADEMY
-- PUBLIC CERTIFICATE VERIFICATION
-- ============================================================

-- ============================================================
-- SECURE PUBLIC VERIFICATION FUNCTION
--
-- Anonymous visitors should be able to verify a certificate
-- without receiving raw student identifiers or direct access
-- to private profile information.
-- ============================================================

CREATE OR REPLACE FUNCTION public.verify_certificate(
  p_certificate_id TEXT
)
RETURNS TABLE (
  certificate_id TEXT,
  student_name TEXT,
  course_title TEXT,
  issued_at TIMESTAMPTZ,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_certificate_id IS NULL
     OR length(trim(p_certificate_id)) = 0 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    c.certificate_id,
    COALESCE(
      NULLIF(trim(p.full_name), ''),
      'NISQ Vanguard Learner'
    ) AS student_name,
    COALESCE(
      NULLIF(trim(co.title), ''),
      'NISQ Vanguard Academy Course'
    ) AS course_title,
    c.issued_at,
    c.is_valid
  FROM public.certificates c
  LEFT JOIN public.profiles p
    ON p.id = c.student_id
  LEFT JOIN public.courses co
    ON co.id = c.course_id
  WHERE c.certificate_id = trim(p_certificate_id)
  LIMIT 1;
END;
$$;


-- ============================================================
-- FUNCTION SECURITY
-- ============================================================

REVOKE ALL
ON FUNCTION public.verify_certificate(TEXT)
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.verify_certificate(TEXT)
FROM authenticated;

GRANT EXECUTE
ON FUNCTION public.verify_certificate(TEXT)
TO anon;

GRANT EXECUTE
ON FUNCTION public.verify_certificate(TEXT)
TO authenticated;
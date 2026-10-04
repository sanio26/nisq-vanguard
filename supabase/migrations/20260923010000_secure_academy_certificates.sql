-- ============================================================
-- NISQ VANGUARD ACADEMY
-- SECURE CERTIFICATE ISSUANCE
-- ============================================================

-- Students must not be able to create, modify, or delete
-- certificates directly through the Supabase client.
REVOKE INSERT, UPDATE, DELETE
ON public.certificates
FROM anon, authenticated;


-- Prevent duplicate certificates for the same student/course.
CREATE UNIQUE INDEX IF NOT EXISTS certificates_student_course_unique
ON public.certificates (student_id, course_id);


-- Certificate IDs must also remain unique.
CREATE UNIQUE INDEX IF NOT EXISTS certificates_certificate_id_unique
ON public.certificates (certificate_id);


-- ============================================================
-- SECURE CERTIFICATE ISSUANCE
-- ============================================================

CREATE OR REPLACE FUNCTION public.issue_course_certificate(
  p_course_id UUID
)
RETURNS TABLE (
  id UUID,
  certificate_id TEXT,
  course_id UUID,
  student_id UUID,
  issued_at TIMESTAMPTZ,
  certificate_url TEXT,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_certificate_uuid UUID;
  v_certificate_code TEXT;
  v_certificate_url TEXT;
  v_certificate_enabled BOOLEAN;
  v_completion_percentage NUMERIC;
  v_passed_quiz_exists BOOLEAN;
BEGIN
  -- ----------------------------------------------------------
  -- 1. Authentication
  -- ----------------------------------------------------------

  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;


  -- ----------------------------------------------------------
  -- 2. Course validation
  -- ----------------------------------------------------------

  SELECT c.certificate_enabled
  INTO v_certificate_enabled
  FROM public.courses c
  WHERE c.id = p_course_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

  IF v_certificate_enabled = FALSE THEN
    RAISE EXCEPTION 'Certificates are not enabled for this course';
  END IF;


  -- ----------------------------------------------------------
  -- 3. Enrollment validation
  -- ----------------------------------------------------------

  SELECT e.completion_percentage
  INTO v_completion_percentage
  FROM public.enrollments e
  WHERE e.course_id = p_course_id
    AND e.student_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You must be enrolled in this course';
  END IF;


  -- ----------------------------------------------------------
  -- 4. Course completion validation
  -- ----------------------------------------------------------

  IF COALESCE(v_completion_percentage, 0) < 100 THEN
    RAISE EXCEPTION 'Course must be completed before a certificate can be issued';
  END IF;


  -- ----------------------------------------------------------
  -- 5. Assessment validation
  --
  -- A certificate requires at least one passed quiz attempt
  -- belonging to the selected course.
  -- ----------------------------------------------------------

  SELECT EXISTS (
    SELECT 1
    FROM public.quiz_attempts qa
    JOIN public.quizzes q
      ON q.id = qa.quiz_id
    WHERE qa.student_id = v_user_id
      AND q.course_id = p_course_id
      AND qa.passed = TRUE
  )
  INTO v_passed_quiz_exists;

  IF NOT v_passed_quiz_exists THEN
    RAISE EXCEPTION 'You must pass the course assessment before a certificate can be issued';
  END IF;


  -- ----------------------------------------------------------
  -- 6. Return an existing valid certificate if one exists.
  -- This makes certificate issuance idempotent.
  -- ----------------------------------------------------------

  RETURN QUERY
  SELECT
    c.id,
    c.certificate_id,
    c.course_id,
    c.student_id,
    c.issued_at,
    c.certificate_url,
    c.is_valid
  FROM public.certificates c
  WHERE c.course_id = p_course_id
    AND c.student_id = v_user_id
    AND c.is_valid = TRUE
  ORDER BY c.issued_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN;
  END IF;


  -- ----------------------------------------------------------
  -- 7. Generate certificate identifier
  -- ----------------------------------------------------------

  v_certificate_uuid := gen_random_uuid();

  v_certificate_code :=
    'NV-' ||
    UPPER(REPLACE(v_certificate_uuid::TEXT, '-', ''));


  -- Keep URL generation separate from certificate issuance.
  -- The frontend can construct the verification route using
  -- certificate_id.
  v_certificate_url := NULL;


  -- ----------------------------------------------------------
  -- 8. Create certificate
  -- ----------------------------------------------------------

  INSERT INTO public.certificates (
    certificate_id,
    student_id,
    course_id,
    certificate_url,
    is_valid
  )
  VALUES (
    v_certificate_code,
    v_user_id,
    p_course_id,
    v_certificate_url,
    TRUE
  )
  RETURNING
    public.certificates.id,
    public.certificates.certificate_id,
    public.certificates.course_id,
    public.certificates.student_id,
    public.certificates.issued_at,
    public.certificates.certificate_url,
    public.certificates.is_valid
  INTO
    id,
    certificate_id,
    course_id,
    student_id,
    issued_at,
    certificate_url,
    is_valid;


  RETURN NEXT;

END;
$$;


-- ============================================================
-- FUNCTION SECURITY
-- ============================================================

REVOKE ALL
ON FUNCTION public.issue_course_certificate(UUID)
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.issue_course_certificate(UUID)
FROM anon;

GRANT EXECUTE
ON FUNCTION public.issue_course_certificate(UUID)
TO authenticated;
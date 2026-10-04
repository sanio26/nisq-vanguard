-- ============================================================
-- NISQ VANGUARD ACADEMY
-- SECURITY HARDENING
-- HARDEN ENROLLMENT OWNERSHIP
-- ============================================================

-- Students may create enrollments only for themselves and only
-- when the referenced course exists.

DROP POLICY IF EXISTS "Students can create their enrollments"
ON public.enrollments;

CREATE POLICY "Students can create their enrollments"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = course_id
  )
);


-- Students may update only their own enrollment rows.
-- The WITH CHECK also prevents changing the enrollment ownership
-- to another student.

DROP POLICY IF EXISTS "Students can update their enrollments"
ON public.enrollments;

CREATE POLICY "Students can update their enrollments"
ON public.enrollments
FOR UPDATE
TO authenticated
USING (
  student_id = auth.uid()
  OR is_admin()
)
WITH CHECK (
  (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = course_id
    )
  )
  OR is_admin()
);
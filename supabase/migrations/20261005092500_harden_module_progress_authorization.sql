-- ============================================================
-- NISQ VANGUARD ACADEMY
-- SECURITY HARDENING
-- MODULE PROGRESS AUTHORIZATION
-- ============================================================

-- Students may only create or update module progress when:
--   1. student_id belongs to the authenticated user
--   2. the referenced module exists
--   3. the module belongs to a course
--   4. the authenticated user is enrolled in that course
--
-- Administrators retain access through is_admin().

DROP POLICY IF EXISTS "Students can create module progress"
ON public.module_progress;

CREATE POLICY "Students can create module progress"
ON public.module_progress
FOR INSERT
TO authenticated
WITH CHECK (
  (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.course_modules cm
      INNER JOIN public.enrollments e
        ON e.course_id = cm.course_id
       AND e.student_id = auth.uid()
      WHERE cm.id = module_progress.module_id
    )
  )
  OR is_admin()
);


DROP POLICY IF EXISTS "Students can update module progress"
ON public.module_progress;

CREATE POLICY "Students can update module progress"
ON public.module_progress
FOR UPDATE
TO authenticated
USING (
  (student_id = auth.uid())
  OR is_admin()
)
WITH CHECK (
  (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.course_modules cm
      INNER JOIN public.enrollments e
        ON e.course_id = cm.course_id
       AND e.student_id = auth.uid()
      WHERE cm.id = module_progress.module_id
    )
  )
  OR is_admin()
);
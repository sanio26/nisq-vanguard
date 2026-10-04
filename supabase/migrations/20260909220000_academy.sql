-- ============================================================
-- NISQ Vanguard Academy
-- Migration: 20260909220000_academy.sql
-- ============================================================

-- ------------------------------------------------------------
-- COURSE STATUS
-- ------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'course_status'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.course_status AS ENUM (
      'DRAFT',
      'PUBLISHED',
      'ARCHIVED'
    );
  END IF;
END
$$;


-- ------------------------------------------------------------
-- COURSES
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,

  thumbnail_url TEXT,

  duration_hours NUMERIC(6,2),
  difficulty TEXT,

  status public.course_status NOT NULL DEFAULT 'DRAFT',

  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  certificate_enabled BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT courses_duration_positive
    CHECK (duration_hours IS NULL OR duration_hours >= 0),

  CONSTRAINT courses_difficulty_valid
    CHECK (
      difficulty IS NULL
      OR difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')
    )
);

CREATE INDEX IF NOT EXISTS courses_status_idx
ON public.courses(status);

CREATE INDEX IF NOT EXISTS courses_instructor_idx
ON public.courses(instructor_id);

CREATE INDEX IF NOT EXISTS courses_created_at_idx
ON public.courses(created_at DESC);


-- ------------------------------------------------------------
-- COURSE MODULES
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  course_id UUID NOT NULL
    REFERENCES public.courses(id)
    ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  module_order INTEGER NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT course_modules_order_positive
    CHECK (module_order > 0),

  CONSTRAINT course_modules_unique_order
    UNIQUE (course_id, module_order)
);

CREATE INDEX IF NOT EXISTS course_modules_course_idx
ON public.course_modules(course_id);

CREATE INDEX IF NOT EXISTS course_modules_order_idx
ON public.course_modules(course_id, module_order);


-- ------------------------------------------------------------
-- LESSONS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  module_id UUID NOT NULL
    REFERENCES public.course_modules(id)
    ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  content TEXT,

  video_url TEXT,
  resource_url TEXT,

  duration_minutes INTEGER,

  lesson_order INTEGER NOT NULL,

  is_preview BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT lessons_duration_positive
    CHECK (
      duration_minutes IS NULL
      OR duration_minutes >= 0
    ),

  CONSTRAINT lessons_order_positive
    CHECK (lesson_order > 0),

  CONSTRAINT lessons_unique_order
    UNIQUE (module_id, lesson_order)
);

CREATE INDEX IF NOT EXISTS lessons_module_idx
ON public.lessons(module_id);

CREATE INDEX IF NOT EXISTS lessons_order_idx
ON public.lessons(module_id, lesson_order);


-- ------------------------------------------------------------
-- ENROLLMENTS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  course_id UUID NOT NULL
    REFERENCES public.courses(id)
    ON DELETE CASCADE,

  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  completed_at TIMESTAMPTZ,

  completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,

  CONSTRAINT enrollments_unique_student_course
    UNIQUE (student_id, course_id),

  CONSTRAINT enrollments_completion_valid
    CHECK (
      completion_percentage >= 0
      AND completion_percentage <= 100
    ),

  CONSTRAINT enrollments_completion_date_valid
    CHECK (
      completed_at IS NULL
      OR completed_at >= enrolled_at
    )
);

CREATE INDEX IF NOT EXISTS enrollments_student_idx
ON public.enrollments(student_id);

CREATE INDEX IF NOT EXISTS enrollments_course_idx
ON public.enrollments(course_id);

CREATE INDEX IF NOT EXISTS enrollments_student_course_idx
ON public.enrollments(student_id, course_id);


-- ------------------------------------------------------------
-- MODULE PROGRESS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  module_id UUID NOT NULL
    REFERENCES public.course_modules(id)
    ON DELETE CASCADE,

  completed BOOLEAN NOT NULL DEFAULT FALSE,

  completed_at TIMESTAMPTZ,

  last_lesson_id UUID
    REFERENCES public.lessons(id)
    ON DELETE SET NULL,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT module_progress_unique_student_module
    UNIQUE (student_id, module_id)
);

CREATE INDEX IF NOT EXISTS module_progress_student_idx
ON public.module_progress(student_id);

CREATE INDEX IF NOT EXISTS module_progress_module_idx
ON public.module_progress(module_id);


-- ------------------------------------------------------------
-- QUIZZES
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  course_id UUID NOT NULL
    REFERENCES public.courses(id)
    ON DELETE CASCADE,

  module_id UUID
    REFERENCES public.course_modules(id)
    ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  passing_score NUMERIC(5,2) NOT NULL DEFAULT 70,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT quizzes_passing_score_valid
    CHECK (
      passing_score >= 0
      AND passing_score <= 100
    )
);

CREATE INDEX IF NOT EXISTS quizzes_course_idx
ON public.quizzes(course_id);

CREATE INDEX IF NOT EXISTS quizzes_module_idx
ON public.quizzes(module_id);


-- ------------------------------------------------------------
-- QUIZ QUESTIONS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  quiz_id UUID NOT NULL
    REFERENCES public.quizzes(id)
    ON DELETE CASCADE,

  question TEXT NOT NULL,

  options JSONB NOT NULL DEFAULT '[]'::jsonb,

  correct_answer TEXT NOT NULL,

  question_order INTEGER NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT quiz_questions_order_positive
    CHECK (question_order > 0),

  CONSTRAINT quiz_questions_unique_order
    UNIQUE (quiz_id, question_order)
);

CREATE INDEX IF NOT EXISTS quiz_questions_quiz_idx
ON public.quiz_questions(quiz_id);


-- ------------------------------------------------------------
-- QUIZ ATTEMPTS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  quiz_id UUID NOT NULL
    REFERENCES public.quizzes(id)
    ON DELETE CASCADE,

  student_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  score NUMERIC(5,2) NOT NULL,

  passed BOOLEAN NOT NULL DEFAULT FALSE,

  answers JSONB NOT NULL DEFAULT '{}'::jsonb,

  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT quiz_attempts_score_valid
    CHECK (
      score >= 0
      AND score <= 100
    )
);

CREATE INDEX IF NOT EXISTS quiz_attempts_student_idx
ON public.quiz_attempts(student_id);

CREATE INDEX IF NOT EXISTS quiz_attempts_quiz_idx
ON public.quiz_attempts(quiz_id);


-- ------------------------------------------------------------
-- ASSIGNMENTS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  course_id UUID NOT NULL
    REFERENCES public.courses(id)
    ON DELETE CASCADE,

  module_id UUID
    REFERENCES public.course_modules(id)
    ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  due_days INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT assignments_due_days_valid
    CHECK (
      due_days IS NULL
      OR due_days >= 0
    )
);

CREATE INDEX IF NOT EXISTS assignments_course_idx
ON public.assignments(course_id);

CREATE INDEX IF NOT EXISTS assignments_module_idx
ON public.assignments(module_id);


-- ------------------------------------------------------------
-- CERTIFICATES
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  certificate_id TEXT NOT NULL UNIQUE,

  student_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  course_id UUID NOT NULL
    REFERENCES public.courses(id)
    ON DELETE CASCADE,

  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  certificate_url TEXT,

  is_valid BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS certificates_student_idx
ON public.certificates(student_id);

CREATE INDEX IF NOT EXISTS certificates_course_idx
ON public.certificates(course_id);

CREATE INDEX IF NOT EXISTS certificates_verification_idx
ON public.certificates(certificate_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- COURSES
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Published courses are publicly readable"
ON public.courses;

CREATE POLICY "Published courses are publicly readable"
ON public.courses
FOR SELECT
TO anon, authenticated
USING (
  status = 'PUBLISHED'
  OR public.is_admin()
  OR instructor_id = auth.uid()
);


-- ------------------------------------------------------------
-- COURSE MODULES
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Course modules are readable for visible courses"
ON public.course_modules;

CREATE POLICY "Course modules are readable for visible courses"
ON public.course_modules
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = course_modules.course_id
      AND (
        c.status = 'PUBLISHED'
        OR public.is_admin()
        OR c.instructor_id = auth.uid()
      )
  )
);


-- ------------------------------------------------------------
-- LESSONS
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Lessons are readable for visible courses"
ON public.lessons;

CREATE POLICY "Lessons are readable for visible courses"
ON public.lessons
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.course_modules cm
    JOIN public.courses c
      ON c.id = cm.course_id
    WHERE cm.id = lessons.module_id
      AND (
        c.status = 'PUBLISHED'
        OR public.is_admin()
        OR c.instructor_id = auth.uid()
      )
  )
);


-- ------------------------------------------------------------
-- ENROLLMENTS
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Students can view their enrollments"
ON public.enrollments;

CREATE POLICY "Students can view their enrollments"
ON public.enrollments
FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = enrollments.course_id
      AND c.instructor_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Students can create their enrollments"
ON public.enrollments;

CREATE POLICY "Students can create their enrollments"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid()
);

DROP POLICY IF EXISTS "Students can update their enrollments"
ON public.enrollments;

CREATE POLICY "Students can update their enrollments"
ON public.enrollments
FOR UPDATE
TO authenticated
USING (
  student_id = auth.uid()
  OR public.is_admin()
)
WITH CHECK (
  student_id = auth.uid()
  OR public.is_admin()
);


-- ------------------------------------------------------------
-- MODULE PROGRESS
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Students can view their module progress"
ON public.module_progress;

CREATE POLICY "Students can view their module progress"
ON public.module_progress
FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Students can create module progress"
ON public.module_progress;

CREATE POLICY "Students can create module progress"
ON public.module_progress
FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid()
);

DROP POLICY IF EXISTS "Students can update module progress"
ON public.module_progress;

CREATE POLICY "Students can update module progress"
ON public.module_progress
FOR UPDATE
TO authenticated
USING (
  student_id = auth.uid()
  OR public.is_admin()
)
WITH CHECK (
  student_id = auth.uid()
  OR public.is_admin()
);


-- ------------------------------------------------------------
-- QUIZZES
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Quizzes are readable for visible courses"
ON public.quizzes;

CREATE POLICY "Quizzes are readable for visible courses"
ON public.quizzes
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = quizzes.course_id
      AND (
        c.status = 'PUBLISHED'
        OR public.is_admin()
        OR c.instructor_id = auth.uid()
      )
  )
);


-- ------------------------------------------------------------
-- QUIZ QUESTIONS
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Quiz questions are readable for visible quizzes"
ON public.quiz_questions;

CREATE POLICY "Quiz questions are readable for visible quizzes"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.quizzes q
    JOIN public.courses c
      ON c.id = q.course_id
    WHERE q.id = quiz_questions.quiz_id
      AND (
        c.status = 'PUBLISHED'
        OR public.is_admin()
        OR c.instructor_id = auth.uid()
      )
  )
);


-- ------------------------------------------------------------
-- QUIZ ATTEMPTS
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Students can view their quiz attempts"
ON public.quiz_attempts;

CREATE POLICY "Students can view their quiz attempts"
ON public.quiz_attempts
FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Students can create quiz attempts"
ON public.quiz_attempts;

CREATE POLICY "Students can create quiz attempts"
ON public.quiz_attempts
FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid()
);


-- ------------------------------------------------------------
-- ASSIGNMENTS
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Assignments are readable for visible courses"
ON public.assignments;

CREATE POLICY "Assignments are readable for visible courses"
ON public.assignments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = assignments.course_id
      AND (
        c.status = 'PUBLISHED'
        OR public.is_admin()
        OR c.instructor_id = auth.uid()
      )
  )
);


-- ------------------------------------------------------------
-- CERTIFICATES
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Students can view their certificates"
ON public.certificates;

CREATE POLICY "Students can view their certificates"
ON public.certificates
FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Public certificate verification"
ON public.certificates;

CREATE POLICY "Public certificate verification"
ON public.certificates
FOR SELECT
TO anon, authenticated
USING (
  is_valid = TRUE
);


-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_academy_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS courses_updated_at
ON public.courses;

CREATE TRIGGER courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_academy_updated_at();


DROP TRIGGER IF EXISTS course_modules_updated_at
ON public.course_modules;

CREATE TRIGGER course_modules_updated_at
BEFORE UPDATE ON public.course_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_academy_updated_at();


DROP TRIGGER IF EXISTS lessons_updated_at
ON public.lessons;

CREATE TRIGGER lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_academy_updated_at();


DROP TRIGGER IF EXISTS quizzes_updated_at
ON public.quizzes;

CREATE TRIGGER quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_academy_updated_at();


DROP TRIGGER IF EXISTS assignments_updated_at
ON public.assignments;

CREATE TRIGGER assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_academy_updated_at();

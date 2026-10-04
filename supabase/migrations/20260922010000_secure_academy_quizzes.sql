-- ============================================================
-- NISQ VANGUARD ACADEMY
-- SECURE QUIZ FOUNDATION
-- ============================================================

DROP POLICY IF EXISTS "Quiz questions are readable for visible quizzes"
ON public.quiz_questions;

CREATE OR REPLACE FUNCTION public.get_quiz_questions(
  p_quiz_id UUID
)
RETURNS TABLE (
  id UUID,
  question TEXT,
  options JSONB,
  question_order INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_course_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT q.course_id
  INTO v_course_id
  FROM public.quizzes q
  WHERE q.id = p_quiz_id;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Quiz not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.enrollments e
    WHERE e.course_id = v_course_id
      AND e.student_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You must be enrolled in this course to take this quiz';
  END IF;

  RETURN QUERY
  SELECT
    qq.id,
    qq.question,
    qq.options,
    qq.question_order
  FROM public.quiz_questions qq
  WHERE qq.quiz_id = p_quiz_id
  ORDER BY qq.question_order ASC;
END;
$$;


CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_quiz_id UUID,
  p_answers JSONB
)
RETURNS TABLE (
  attempt_id UUID,
  score NUMERIC(5,2),
  passed BOOLEAN,
  total_questions INTEGER,
  correct_answers INTEGER,
  passing_score NUMERIC(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_course_id UUID;
  v_passing_score NUMERIC(5,2);

  v_total_questions INTEGER;
  v_correct_answers INTEGER;

  v_score NUMERIC(5,2);
  v_passed BOOLEAN;

  v_attempt_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'Answers must be a JSON object';
  END IF;

  SELECT
    q.course_id,
    q.passing_score
  INTO
    v_course_id,
    v_passing_score
  FROM public.quizzes q
  WHERE q.id = p_quiz_id;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Quiz not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.enrollments e
    WHERE e.course_id = v_course_id
      AND e.student_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You must be enrolled in this course to submit this quiz';
  END IF;

  SELECT COUNT(*)
  INTO v_total_questions
  FROM public.quiz_questions qq
  WHERE qq.quiz_id = p_quiz_id;

  IF v_total_questions = 0 THEN
    RAISE EXCEPTION 'This quiz has no questions';
  END IF;

  SELECT COUNT(*)
  INTO v_correct_answers
  FROM public.quiz_questions qq
  JOIN jsonb_each_text(p_answers) submitted
    ON submitted.key = qq.id::TEXT
  WHERE qq.quiz_id = p_quiz_id
    AND submitted.value = qq.correct_answer;

  v_score :=
    ROUND(
      (
        v_correct_answers::NUMERIC
        / v_total_questions::NUMERIC
      ) * 100,
      2
    );

  v_passed := v_score >= v_passing_score;

  INSERT INTO public.quiz_attempts (
    quiz_id,
    student_id,
    score,
    passed,
    answers
  )
  VALUES (
    p_quiz_id,
    v_user_id,
    v_score,
    v_passed,
    p_answers
  )
  RETURNING id INTO v_attempt_id;

  RETURN QUERY
  SELECT
    v_attempt_id,
    v_score,
    v_passed,
    v_total_questions,
    v_correct_answers,
    v_passing_score;
END;
$$;


REVOKE ALL
ON FUNCTION public.get_quiz_questions(UUID)
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.get_quiz_questions(UUID)
FROM anon;

GRANT EXECUTE
ON FUNCTION public.get_quiz_questions(UUID)
TO authenticated;


REVOKE ALL
ON FUNCTION public.submit_quiz_attempt(UUID, JSONB)
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.submit_quiz_attempt(UUID, JSONB)
FROM anon;

GRANT EXECUTE
ON FUNCTION public.submit_quiz_attempt(UUID, JSONB)
TO authenticated;


DROP POLICY IF EXISTS "Students can create quiz attempts"
ON public.quiz_attempts;

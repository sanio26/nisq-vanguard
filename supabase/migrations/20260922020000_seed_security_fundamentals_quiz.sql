-- ============================================================
-- NISQ VANGUARD ACADEMY
-- SECURITY FUNDAMENTALS QUIZ SEED
-- ============================================================

DO $$
DECLARE
  v_course_id UUID;
  v_module_id UUID;
  v_quiz_id UUID;
BEGIN

  -- ==========================================================
  -- Resolve Cybersecurity Foundations course
  -- ==========================================================

  SELECT id
  INTO v_course_id
  FROM public.courses
  WHERE slug = 'cybersecurity-foundations'
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Cybersecurity Foundations course not found';
  END IF;


  -- ==========================================================
  -- Resolve Security Fundamentals module
  -- ==========================================================

  SELECT id
  INTO v_module_id
  FROM public.course_modules
  WHERE course_id = v_course_id
    AND module_order = 1
  LIMIT 1;

  IF v_module_id IS NULL THEN
    RAISE EXCEPTION 'Security Fundamentals module not found';
  END IF;


  -- ==========================================================
  -- Prevent duplicate quiz creation
  -- ==========================================================

  SELECT id
  INTO v_quiz_id
  FROM public.quizzes
  WHERE course_id = v_course_id
    AND module_id = v_module_id
    AND title = 'Security Fundamentals Assessment'
  LIMIT 1;

  IF v_quiz_id IS NOT NULL THEN
    RAISE NOTICE 'Quiz already exists: %', v_quiz_id;
    RETURN;
  END IF;


  -- ==========================================================
  -- Create quiz
  -- ==========================================================

  INSERT INTO public.quizzes (
    course_id,
    module_id,
    title,
    description,
    passing_score
  )
  VALUES (
    v_course_id,
    v_module_id,
    'Security Fundamentals Assessment',
    'Assess your understanding of cybersecurity foundations, the CIA triad, threats, vulnerabilities, and risk.',
    70
  )
  RETURNING id INTO v_quiz_id;


  -- ==========================================================
  -- Question 1
  -- ==========================================================

  INSERT INTO public.quiz_questions (
    quiz_id,
    question,
    options,
    correct_answer,
    question_order
  )
  VALUES (
    v_quiz_id,
    'Which security objective focuses on preventing unauthorized people from accessing information?',
    '[
      "Confidentiality",
      "Integrity",
      "Availability",
      "Non-repudiation"
    ]'::jsonb,
    'Confidentiality',
    1
  );


  -- ==========================================================
  -- Question 2
  -- ==========================================================

  INSERT INTO public.quiz_questions (
    quiz_id,
    question,
    options,
    correct_answer,
    question_order
  )
  VALUES (
    v_quiz_id,
    'Which CIA triad objective is primarily concerned with preventing unauthorized modification of information?',
    '[
      "Confidentiality",
      "Integrity",
      "Availability",
      "Authentication"
    ]'::jsonb,
    'Integrity',
    2
  );


  -- ==========================================================
  -- Question 3
  -- ==========================================================

  INSERT INTO public.quiz_questions (
    quiz_id,
    question,
    options,
    correct_answer,
    question_order
  )
  VALUES (
    v_quiz_id,
    'A critical application becomes unavailable to legitimate users because its server has been disrupted. Which CIA triad objective is most directly affected?',
    '[
      "Confidentiality",
      "Integrity",
      "Availability",
      "Authorization"
    ]'::jsonb,
    'Availability',
    3
  );


  -- ==========================================================
  -- Question 4
  -- ==========================================================

  INSERT INTO public.quiz_questions (
    quiz_id,
    question,
    options,
    correct_answer,
    question_order
  )
  VALUES (
    v_quiz_id,
    'Which statement best describes a vulnerability in cybersecurity?',
    '[
      "A weakness that could be exploited",
      "A security objective that must always be preserved",
      "A person who uses a computer system",
      "A completed security incident"
    ]'::jsonb,
    'A weakness that could be exploited',
    4
  );


  -- ==========================================================
  -- Question 5
  -- ==========================================================

  INSERT INTO public.quiz_questions (
    quiz_id,
    question,
    options,
    correct_answer,
    question_order
  )
  VALUES (
    v_quiz_id,
    'Which statement best describes a cybersecurity threat?',
    '[
      "A potential cause of harm to a system or organization",
      "A guaranteed successful attack",
      "A software feature that prevents attacks",
      "A record of a completed security assessment"
    ]'::jsonb,
    'A potential cause of harm to a system or organization',
    5
  );


  -- ==========================================================
  -- Question 6
  -- ==========================================================

  INSERT INTO public.quiz_questions (
    quiz_id,
    question,
    options,
    correct_answer,
    question_order
  )
  VALUES (
    v_quiz_id,
    'An organization discovers a weakness in an internet-facing application that an attacker could exploit. What has the organization identified?',
    '[
      "A vulnerability",
      "An availability objective",
      "A completed incident",
      "A confidentiality control"
    ]'::jsonb,
    'A vulnerability',
    6
  );


  -- ==========================================================
  -- Question 7
  -- ==========================================================

  INSERT INTO public.quiz_questions (
    quiz_id,
    question,
    options,
    correct_answer,
    question_order
  )
  VALUES (
    v_quiz_id,
    'An attacker changes transaction records without authorization. Which CIA triad property has been directly violated?',
    '[
      "Integrity",
      "Availability",
      "Confidentiality",
      "Authentication"
    ]'::jsonb,
    'Integrity',
    7
  );


  -- ==========================================================
  -- Question 8
  -- ==========================================================

  INSERT INTO public.quiz_questions (
    quiz_id,
    question,
    options,
    correct_answer,
    question_order
  )
  VALUES (
    v_quiz_id,
    'A security team evaluates how a potential threat could exploit an existing weakness and cause harm. Which cybersecurity concept is being assessed?',
    '[
      "Risk",
      "Availability",
      "Confidentiality",
      "Encryption"
    ]'::jsonb,
    'Risk',
    8
  );


  -- ==========================================================
  -- Question 9
  -- ==========================================================

  INSERT INTO public.quiz_questions (
    quiz_id,
    question,
    options,
    correct_answer,
    question_order
  )
  VALUES (
    v_quiz_id,
    'A database remains accessible to authorized users, but an attacker secretly changes stored values. Which security property requires attention?',
    '[
      "Integrity",
      "Availability",
      "Confidentiality",
      "Identification"
    ]'::jsonb,
    'Integrity',
    9
  );


  -- ==========================================================
  -- Question 10
  -- ==========================================================

  INSERT INTO public.quiz_questions (
    quiz_id,
    question,
    options,
    correct_answer,
    question_order
  )
  VALUES (
    v_quiz_id,
    'Which combination correctly represents the three objectives of the CIA triad?',
    '[
      "Confidentiality, Integrity, Availability",
      "Confidentiality, Identification, Authorization",
      "Control, Integrity, Authentication",
      "Confidentiality, Inspection, Access"
    ]'::jsonb,
    'Confidentiality, Integrity, Availability',
    10
  );


  -- ==========================================================
  -- Completion message
  -- ==========================================================

  RAISE NOTICE 'Security Fundamentals Assessment created successfully: %', v_quiz_id;

END;
$$;
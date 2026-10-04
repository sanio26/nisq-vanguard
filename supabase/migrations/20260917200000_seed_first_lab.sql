-- ============================================================
-- NISQ Vanguard
-- Seed Lab 01: HTTP Header Investigation
-- ============================================================

DO $$
DECLARE
  v_lab_id UUID := '7b4c2e91-3c4d-4f6b-9a21-81d5c7e41001';

  v_challenge_1 UUID := '7b4c2e91-3c4d-4f6b-9a21-81d5c7e42001';
  v_challenge_2 UUID := '7b4c2e91-3c4d-4f6b-9a21-81d5c7e42002';
  v_challenge_3 UUID := '7b4c2e91-3c4d-4f6b-9a21-81d5c7e42003';
  v_challenge_4 UUID := '7b4c2e91-3c4d-4f6b-9a21-81d5c7e42004';

BEGIN

  -- ==========================================================
  -- LAB
  -- ==========================================================

  INSERT INTO public.labs (
    id,
    title,
    slug,
    short_description,
    description,
    category,
    difficulty,
    estimated_minutes,
    objectives,
    instructions,
    status
  )
  VALUES (
    v_lab_id,
    'HTTP Header Investigation',
    'http-header-investigation',

    'Analyze controlled HTTP evidence and identify security-relevant headers, authentication schemes, and defensive controls.',

    'You are reviewing a controlled HTTP response captured during an internal security assessment. Your objective is to identify important HTTP headers, recognize authentication mechanisms, and determine which defensive controls should be recommended.

This laboratory uses static evidence rather than live targets. Each challenge provides a small piece of HTTP evidence and asks you to extract or identify a security-relevant detail.',

    'CYBERSECURITY',
    'BEGINNER',
    20,

    ARRAY[
      'Understand the security role of common HTTP headers',
      'Identify authentication schemes from HTTP evidence',
      'Recognize missing web security controls',
      'Practice extracting security-relevant information from HTTP traffic'
    ],

    'Read each evidence block carefully.

Submit only the information requested by each challenge whenever the challenge asks for a specific value.

The lab uses server-side validation. Your browser does not determine whether an answer is correct or how many points you receive.',

    'PUBLISHED'
  )
  ON CONFLICT (slug)
  DO UPDATE SET
    title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    difficulty = EXCLUDED.difficulty,
    estimated_minutes = EXCLUDED.estimated_minutes,
    objectives = EXCLUDED.objectives,
    instructions = EXCLUDED.instructions,
    status = EXCLUDED.status;


  -- ==========================================================
  -- CHALLENGE 1
  -- ==========================================================

  INSERT INTO public.lab_challenges (
    id,
    lab_id,
    title,
    prompt,
    challenge_order,
    points,
    hints,
    starter_code,
    submission_type
  )
  VALUES (
    v_challenge_1,
    v_lab_id,

    'Identify the Content Type',

    $challenge$
You intercepted the following controlled HTTP response:

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 184

Question:

What MIME type is returned by the service?

Submit only the MIME type.

Example format:
application/json
$challenge$,

    1,
    10,

    ARRAY[
      'Look at the value before the character set declaration.',
      'The MIME type identifies the format of the response body.'
    ],

    NULL,
    'TEXT'
  )
  ON CONFLICT (id)
  DO UPDATE SET
    prompt = EXCLUDED.prompt,
    challenge_order = EXCLUDED.challenge_order,
    points = EXCLUDED.points,
    hints = EXCLUDED.hints,
    submission_type = EXCLUDED.submission_type;


  -- ==========================================================
  -- CHALLENGE 2
  -- ==========================================================

  INSERT INTO public.lab_challenges (
    id,
    lab_id,
    title,
    prompt,
    challenge_order,
    points,
    hints,
    starter_code,
    submission_type
  )
  VALUES (
    v_challenge_2,
    v_lab_id,

    'Identify the Missing HTTPS Control',

    $challenge$
The following response was observed during a controlled security review:

HTTP/1.1 200 OK
Server: nginx
Content-Type: text/html

The application is intended to enforce HTTPS for future browser connections.

Question:

Which HTTP response header should be recommended to instruct browsers to enforce HTTPS?

Submit the header name only.

Example format:
Strict-Transport-Security
$challenge$,

    2,
    15,

    ARRAY[
      'Think about a browser security policy that forces HTTPS.',
      'The header is commonly abbreviated as HSTS.'
    ],

    NULL,
    'TEXT'
  )
  ON CONFLICT (id)
  DO UPDATE SET
    prompt = EXCLUDED.prompt,
    challenge_order = EXCLUDED.challenge_order,
    points = EXCLUDED.points,
    hints = EXCLUDED.hints,
    submission_type = EXCLUDED.submission_type;


  -- ==========================================================
  -- CHALLENGE 3
  -- ==========================================================

  INSERT INTO public.lab_challenges (
    id,
    lab_id,
    title,
    prompt,
    challenge_order,
    points,
    hints,
    starter_code,
    submission_type
  )
  VALUES (
    v_challenge_3,
    v_lab_id,

    'Recognize the Authentication Scheme',

    $challenge$
During the assessment, the following request header was captured:

Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.example.signature

Question:

Which authentication scheme is being used?

Submit only the authentication scheme.

Example format:
Bearer
$challenge$,

    3,
    15,

    ARRAY[
      'Look at the word immediately following Authorization.',
      'The token format is commonly associated with a token-based authentication mechanism.'
    ],

    NULL,
    'TEXT'
  )
  ON CONFLICT (id)
  DO UPDATE SET
    prompt = EXCLUDED.prompt,
    challenge_order = EXCLUDED.challenge_order,
    points = EXCLUDED.points,
    hints = EXCLUDED.hints,
    submission_type = EXCLUDED.submission_type;


  -- ==========================================================
  -- CHALLENGE 4
  -- ==========================================================

  INSERT INTO public.lab_challenges (
    id,
    lab_id,
    title,
    prompt,
    challenge_order,
    points,
    hints,
    starter_code,
    submission_type
  )
  VALUES (
    v_challenge_4,
    v_lab_id,

    'Extract the Source IPv4 Address',

    $challenge$
The following HTTP request metadata was recorded:

GET /api/profile HTTP/1.1
Host: training.nisq-vanguard.local
X-Forwarded-For: 203.0.113.42
User-Agent: SecurityAssessmentClient/1.0

Question:

Extract the IPv4 address contained in the X-Forwarded-For header.

Submit only the IPv4 address.

Example format:
203.0.113.42
$challenge$,

    4,
    20,

    ARRAY[
      'Locate the X-Forwarded-For header.',
      'The value after the colon is the address you need.'
    ],

    NULL,
    'TEXT'
  )
  ON CONFLICT (id)
  DO UPDATE SET
    prompt = EXCLUDED.prompt,
    challenge_order = EXCLUDED.challenge_order,
    points = EXCLUDED.points,
    hints = EXCLUDED.hints,
    submission_type = EXCLUDED.submission_type;


  -- ==========================================================
  -- PRIVATE VALIDATORS
  -- ==========================================================

  INSERT INTO private.lab_challenge_validators (
    challenge_id,
    validator_type,
    validation_config
  )
  VALUES
  (
    v_challenge_1,
    'EXACT_TEXT',
    jsonb_build_object(
      'expected', 'application/json',
      'case_sensitive', false,
      'trim', true
    )
  ),

  (
    v_challenge_2,
    'EXACT_TEXT',
    jsonb_build_object(
      'expected', 'Strict-Transport-Security',
      'case_sensitive', false,
      'trim', true
    )
  ),

  (
    v_challenge_3,
    'EXACT_TEXT',
    jsonb_build_object(
      'expected', 'Bearer',
      'case_sensitive', false,
      'trim', true
    )
  ),

  (
    v_challenge_4,
    'REGEX',
    jsonb_build_object(
      'pattern', '^203\.0\.113\.42$',
      'case_sensitive', true,
      'trim', true
    )
  )

  ON CONFLICT (challenge_id)
  DO UPDATE SET
    validator_type = EXCLUDED.validator_type,
    validation_config = EXCLUDED.validation_config;

END $$;


-- ============================================================
-- VERIFICATION
-- ============================================================

COMMENT ON TABLE public.labs IS
'NISQ Vanguard interactive cybersecurity laboratory catalogue.';

COMMENT ON TABLE private.lab_challenge_validators IS
'Private server-side validation configuration. Never expose through the client Data API.';
-- ============================================================
-- NISQ Vanguard - Secure Campus Submission
-- Migration: 20260912210000_campus_submission_rpc
-- ============================================================

-- Remove the previous public INSERT policy and trigger.
DROP POLICY IF EXISTS "Public can submit campus requests"
ON public.campus_requests;

DROP TRIGGER IF EXISTS campus_request_create_lead
ON public.campus_requests;

DROP FUNCTION IF EXISTS public.create_lead_from_campus_request();

-- The public should never directly insert into the CRM/request table.
-- Submission is handled through the SECURITY DEFINER RPC below.

-- Remove the constraint that conflicts with the database-side
-- creation of the lead_id.
ALTER TABLE public.campus_requests
DROP CONSTRAINT IF EXISTS campus_requests_lead_public_insert;

-- ============================================================
-- Secure public submission function
-- ============================================================

CREATE OR REPLACE FUNCTION public.submit_campus_request(
  p_college_name TEXT,
  p_contact_person TEXT,
  p_designation TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_number_of_students INTEGER,
  p_program_required TEXT,
  p_preferred_date DATE,
  p_venue TEXT,
  p_requirements TEXT
)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_lead_id UUID;
  new_request_id UUID;
BEGIN
  -- Basic server-side validation.
  IF NULLIF(TRIM(p_college_name), '') IS NULL THEN
    RAISE EXCEPTION 'Invalid campus request';
  END IF;

  IF NULLIF(TRIM(p_contact_person), '') IS NULL THEN
    RAISE EXCEPTION 'Invalid campus request';
  END IF;

  IF NULLIF(TRIM(p_designation), '') IS NULL THEN
    RAISE EXCEPTION 'Invalid campus request';
  END IF;

  IF NULLIF(TRIM(p_email), '') IS NULL THEN
    RAISE EXCEPTION 'Invalid campus request';
  END IF;

  IF p_number_of_students IS NULL OR p_number_of_students <= 0 THEN
    RAISE EXCEPTION 'Invalid campus request';
  END IF;

  IF NULLIF(TRIM(p_program_required), '') IS NULL THEN
    RAISE EXCEPTION 'Invalid campus request';
  END IF;

  -- Create the protected CRM lead.
  INSERT INTO public.leads (
    name,
    email,
    phone,
    organization,
    designation,
    source,
    status,
    notes
  )
  VALUES (
    TRIM(p_contact_person),
    TRIM(p_email),
    NULLIF(TRIM(p_phone), ''),
    TRIM(p_college_name),
    TRIM(p_designation),
    'WEBSITE_CAMPUS',
    'NEW',
    CONCAT(
      'Program: ', TRIM(p_program_required),
      E'\nStudents: ', p_number_of_students,
      E'\nPreferred Date: ',
        COALESCE(p_preferred_date::TEXT, 'Not specified'),
      E'\nVenue: ',
        COALESCE(NULLIF(TRIM(p_venue), ''), 'Not specified'),
      E'\nRequirements: ',
        COALESCE(NULLIF(TRIM(p_requirements), ''), 'Not specified')
    )
  )
  RETURNING id INTO new_lead_id;

  -- Create the campus request and connect it to the CRM lead.
  INSERT INTO public.campus_requests (
    college_name,
    contact_person,
    designation,
    email,
    phone,
    number_of_students,
    program_required,
    preferred_date,
    venue,
    requirements,
    lead_id
  )
  VALUES (
    TRIM(p_college_name),
    TRIM(p_contact_person),
    TRIM(p_designation),
    TRIM(p_email),
    NULLIF(TRIM(p_phone), ''),
    p_number_of_students,
    TRIM(p_program_required),
    p_preferred_date,
    NULLIF(TRIM(p_venue), ''),
    NULLIF(TRIM(p_requirements), ''),
    new_lead_id
  )
  RETURNING id INTO new_request_id;

  RETURN new_request_id;
END;
$$;

-- Only the public submission function is exposed.
GRANT EXECUTE ON FUNCTION public.submit_campus_request(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  INTEGER,
  TEXT,
  DATE,
  TEXT,
  TEXT
) TO anon, authenticated;

-- Explicitly revoke direct table insertion from public roles.
REVOKE INSERT ON public.campus_requests FROM anon;
REVOKE INSERT ON public.campus_requests FROM authenticated;

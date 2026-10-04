-- ============================================================
-- NISQ Vanguard - Campus Request Security
-- Migration: 20260912200000_campus_security
-- ============================================================

CREATE TABLE public.campus_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  college_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  designation TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  number_of_students INTEGER NOT NULL,

  program_required TEXT NOT NULL,

  preferred_date DATE,
  venue TEXT,
  requirements TEXT,

  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT campus_requests_students_positive
    CHECK (number_of_students > 0),

  CONSTRAINT campus_requests_lead_public_insert
    CHECK (lead_id IS NULL)
);

CREATE INDEX campus_requests_email_idx
  ON public.campus_requests(email);

CREATE INDEX campus_requests_created_at_idx
  ON public.campus_requests(created_at DESC);

CREATE INDEX campus_requests_lead_id_idx
  ON public.campus_requests(lead_id);

ALTER TABLE public.campus_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.create_lead_from_campus_request()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    NEW.contact_person,
    NEW.email,
    NEW.phone,
    NEW.college_name,
    NEW.designation,
    'WEBSITE_CAMPUS',
    'NEW',
    CONCAT(
      'Program: ', NEW.program_required,
      E'\nStudents: ', NEW.number_of_students,
      E'\nPreferred Date: ',
        COALESCE(NEW.preferred_date::TEXT, 'Not specified'),
      E'\nVenue: ',
        COALESCE(NEW.venue, 'Not specified'),
      E'\nRequirements: ',
        COALESCE(NEW.requirements, 'Not specified')
    )
  )
  RETURNING id INTO NEW.lead_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER campus_request_create_lead
  BEFORE INSERT ON public.campus_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lead_from_campus_request();

CREATE POLICY "Public can submit campus requests"
ON public.campus_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  lead_id IS NULL
);

CREATE POLICY "Admins can manage campus requests"
ON public.campus_requests
FOR ALL
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

CREATE OR REPLACE FUNCTION public.update_campus_request_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER campus_requests_updated_at
BEFORE UPDATE ON public.campus_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_campus_request_updated_at();

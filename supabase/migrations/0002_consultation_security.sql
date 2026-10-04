-- ============================================================
-- NISQ Vanguard - Consultation Security
-- Migration: 0002_consultation_security
-- ============================================================

-- ============================================================
-- 1. Automatically create a CRM lead whenever a new
--    consultation is submitted.
--
-- The function runs with database privileges, so a public
-- website visitor does NOT need direct INSERT permission
-- on the leads table.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_lead_from_consultation()
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
    status
  )
  VALUES (
    NEW.name,
    NEW.email,
    NEW.phone,
    NEW.organization,
    NEW.designation,
    'WEBSITE_CONSULTATION',
    'NEW'
  )
  RETURNING id INTO NEW.lead_id;

  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. Create the lead BEFORE the consultation row is inserted.
-- ============================================================

CREATE TRIGGER consultation_create_lead
  BEFORE INSERT ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lead_from_consultation();

-- ============================================================
-- 3. Public consultation submission policy.
--
-- Anonymous visitors may submit a consultation.
-- They cannot read, update, or delete consultations.
--
-- lead_id MUST be NULL when submitted from the public website.
-- The secure trigger above creates the lead.
-- ============================================================

CREATE POLICY "Public can submit consultations"
ON public.consultations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  consent = TRUE
  AND lead_id IS NULL
);

-- ============================================================
-- 4. Explicitly prevent anonymous access to CRM leads.
--
-- There is intentionally NO anon SELECT/UPDATE/DELETE policy
-- on leads.
-- ============================================================

-- ============================================================
-- 5. Explicitly prevent anonymous access to consultation data.
--
-- There is intentionally NO anon SELECT/UPDATE/DELETE policy
-- on consultations.
-- ============================================================

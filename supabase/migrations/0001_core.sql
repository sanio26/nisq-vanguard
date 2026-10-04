-- ============================================================
-- NISQ Vanguard - Core Database Migration
-- Migration: 0001_core
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================

CREATE TYPE public.app_role AS ENUM (
  'SUPER_ADMIN',
  'ADMIN',
  'CONSULTANT',
  'ANALYST',
  'SALES',
  'INSTRUCTOR',
  'CLIENT',
  'STUDENT'
);

CREATE TYPE public.lead_status AS ENUM (
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL SENT',
  'NEGOTIATION',
  'WON',
  'LOST'
);

-- ============================================================
-- 2. PROFILES
-- Extends Supabase Auth users with application information.
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  organization TEXT,
  designation TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profiles_organization_idx
  ON public.profiles(organization);

-- ============================================================
-- 3. USER ROLES
-- Stores application roles separately from auth credentials.
-- ============================================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_roles_user_role_unique
    UNIQUE (user_id, role)
);

CREATE INDEX user_roles_user_id_idx
  ON public.user_roles(user_id);

CREATE INDEX user_roles_role_idx
  ON public.user_roles(role);

-- ============================================================
-- 4. LEADS
-- CRM records generated from consultations and other sources.
-- ============================================================

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  designation TEXT,

  source TEXT NOT NULL DEFAULT 'WEBSITE',
  status public.lead_status NOT NULL DEFAULT 'NEW',

  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  notes TEXT,
  follow_up_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX leads_email_idx
  ON public.leads(email);

CREATE INDEX leads_status_idx
  ON public.leads(status);

CREATE INDEX leads_assigned_to_idx
  ON public.leads(assigned_to);

CREATE INDEX leads_created_at_idx
  ON public.leads(created_at DESC);

-- ============================================================
-- 5. CONSULTATIONS
-- Website consultation requests.
-- ============================================================

CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  organization TEXT,
  designation TEXT,
  organization_type TEXT,

  service TEXT NOT NULL,

  preferred_date DATE,
  preferred_time TIME,

  message TEXT,

  consent BOOLEAN NOT NULL DEFAULT FALSE,

  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT consultations_consent_required
    CHECK (consent = TRUE)
);

CREATE INDEX consultations_email_idx
  ON public.consultations(email);

CREATE INDEX consultations_service_idx
  ON public.consultations(service);

CREATE INDEX consultations_created_at_idx
  ON public.consultations(created_at DESC);

CREATE INDEX consultations_lead_id_idx
  ON public.consultations(lead_id);

-- ============================================================
-- 6. ROLE CHECKING FUNCTION
--
-- SECURITY DEFINER allows the database to safely check roles
-- without exposing unrestricted access to user_roles.
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_role(
  requested_role public.app_role
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = requested_role
  );
$$;

-- ============================================================
-- 7. ADMIN CHECKING FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'ADMIN')
  );
$$;

-- ============================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. PROFILE POLICIES
-- ============================================================

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- ============================================================
-- 10. USER ROLE POLICIES
-- ============================================================

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 11. LEAD POLICIES
-- ============================================================

CREATE POLICY "Admins can manage all leads"
ON public.leads
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Sales can view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  public.has_role('SALES')
  OR public.is_admin()
);

CREATE POLICY "Consultants can view assigned leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  assigned_to = auth.uid()
  OR public.is_admin()
);

-- ============================================================
-- 12. CONSULTATION POLICIES
-- ============================================================

CREATE POLICY "Admins can manage consultations"
ON public.consultations
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Sales can view consultations"
ON public.consultations
FOR SELECT
TO authenticated
USING (
  public.has_role('SALES')
  OR public.is_admin()
);

CREATE POLICY "Consultants can view consultations"
ON public.consultations
FOR SELECT
TO authenticated
USING (
  public.has_role('CONSULTANT')
  OR public.is_admin()
);

-- ============================================================
-- 13. PROFILE CREATION TRIGGER
--
-- Automatically creates a profile when a new Supabase Auth
-- user signs up.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      ''
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 14. UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
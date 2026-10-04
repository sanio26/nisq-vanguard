-- ============================================================
-- NISQ Vanguard
-- Migration: Authentication Integration
--
-- This migration extends the existing authentication schema
-- created by 0001_core.sql.
--
-- IMPORTANT:
-- profiles and user_roles already exist.
-- We do NOT recreate them.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Add email to profiles
-- ------------------------------------------------------------

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;


-- ------------------------------------------------------------
-- 2. Index profile email
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS profiles_email_idx
ON public.profiles(email);


-- ------------------------------------------------------------
-- 3. Synchronize existing profile emails
-- ------------------------------------------------------------
-- Existing Auth users may already have profiles created by
-- the original signup trigger. Populate their email field
-- from Supabase Auth.

UPDATE public.profiles AS p
SET email = u.email
FROM auth.users AS u
WHERE p.id = u.id
  AND (
    p.email IS NULL
    OR p.email <> u.email
  );


-- ------------------------------------------------------------
-- 4. Ensure existing Auth users have a profile
-- ------------------------------------------------------------
-- This is safe for existing users because profile IDs are
-- unique and existing profiles are ignored.

INSERT INTO public.profiles (
  id,
  full_name,
  email
)
SELECT
  u.id,
  NULLIF(
    TRIM(
      COALESCE(
        u.raw_user_meta_data ->> 'full_name',
        ''
      )
    ),
    ''
  ),
  u.email
FROM auth.users AS u
WHERE NOT EXISTS (
  SELECT 1
  FROM public.profiles AS p
  WHERE p.id = u.id
);


-- ------------------------------------------------------------
-- 5. Ensure existing Auth users have a default role
-- ------------------------------------------------------------
-- New users receive STUDENT automatically unless an
-- administrator later changes their role.

INSERT INTO public.user_roles (
  user_id,
  role
)
SELECT
  u.id,
  'STUDENT'::public.app_role
FROM auth.users AS u
WHERE NOT EXISTS (
  SELECT 1
  FROM public.user_roles AS ur
  WHERE ur.user_id = u.id
);


-- ------------------------------------------------------------
-- 6. Replace the Auth signup handler
-- ------------------------------------------------------------
-- Supabase Auth remains responsible for authentication.
-- This trigger only creates application-level records.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

  -- Create or update the application profile.
  INSERT INTO public.profiles (
    id,
    full_name,
    email
  )
  VALUES (
    NEW.id,
    NULLIF(
      TRIM(
        COALESCE(
          NEW.raw_user_meta_data ->> 'full_name',
          ''
        )
      ),
      ''
    ),
    NEW.email
  )
  ON CONFLICT (id)
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();


  -- Every newly registered account starts as STUDENT.
  INSERT INTO public.user_roles (
    user_id,
    role
  )
  VALUES (
    NEW.id,
    'STUDENT'::public.app_role
  )
  ON CONFLICT (user_id, role)
  DO NOTHING;


  RETURN NEW;
END;
$$;


-- ------------------------------------------------------------
-- 7. Recreate the Auth signup trigger
-- ------------------------------------------------------------
-- Recreating it ensures the database uses the updated
-- handle_new_user() implementation.

DROP TRIGGER IF EXISTS on_auth_user_created
ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------------------------
-- 8. Ensure profile RLS remains enabled
-- ------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- 9. Ensure user-role RLS remains enabled
-- ------------------------------------------------------------

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- Migration complete
-- ------------------------------------------------------------
-- ============================================================
-- NISQ VANGUARD
-- Events / Event Registrations
-- ============================================================

-- ------------------------------------------------------------
-- Shared updated_at trigger function
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ------------------------------------------------------------
-- Events
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,
  description TEXT,

  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,

  venue TEXT,
  speaker TEXT,

  image_url TEXT,

  registration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  registration_url TEXT,

  status TEXT NOT NULL DEFAULT 'UPCOMING'
    CHECK (status IN ('UPCOMING', 'PAST', 'CANCELLED')),

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- Event registrations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  event_id UUID NOT NULL
    REFERENCES public.events(id)
    ON DELETE CASCADE,

  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,

  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT event_registrations_event_email_unique
    UNIQUE (event_id, email)
);


-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS events_event_date_idx
ON public.events(event_date);

CREATE INDEX IF NOT EXISTS events_status_idx
ON public.events(status);

CREATE INDEX IF NOT EXISTS events_created_by_idx
ON public.events(created_by);

CREATE INDEX IF NOT EXISTS event_registrations_event_id_idx
ON public.event_registrations(event_id);

CREATE INDEX IF NOT EXISTS event_registrations_user_id_idx
ON public.event_registrations(user_id);

CREATE INDEX IF NOT EXISTS event_registrations_email_idx
ON public.event_registrations(email);


-- ------------------------------------------------------------
-- Updated-at triggers
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS events_updated_at
ON public.events;

CREATE TRIGGER events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


DROP TRIGGER IF EXISTS event_registrations_updated_at
ON public.event_registrations;

CREATE TRIGGER event_registrations_updated_at
BEFORE UPDATE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- Public event visibility
-- Only upcoming/past/cancelled event information is public.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view events"
ON public.events;

CREATE POLICY "Public can view events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (TRUE);


-- ------------------------------------------------------------
-- Admin event management
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can insert events"
ON public.events;

CREATE POLICY "Admins can insert events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
);


DROP POLICY IF EXISTS "Admins can update events"
ON public.events;

CREATE POLICY "Admins can update events"
ON public.events
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);


DROP POLICY IF EXISTS "Admins can delete events"
ON public.events;

CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);


-- ------------------------------------------------------------
-- Event registrations
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own registrations"
ON public.event_registrations;

CREATE POLICY "Users can view own registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);


DROP POLICY IF EXISTS "Users can register for events"
ON public.event_registrations;

CREATE POLICY "Users can register for events"
ON public.event_registrations
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);


DROP POLICY IF EXISTS "Users can update own registrations"
ON public.event_registrations;

CREATE POLICY "Users can update own registrations"
ON public.event_registrations
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);


DROP POLICY IF EXISTS "Users can cancel own registrations"
ON public.event_registrations;

CREATE POLICY "Users can cancel own registrations"
ON public.event_registrations
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);


-- ------------------------------------------------------------
-- Admin registration visibility
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view event registrations"
ON public.event_registrations;

CREATE POLICY "Admins can view event registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);


-- ------------------------------------------------------------
-- Comments
-- ------------------------------------------------------------
COMMENT ON TABLE public.events IS
'NISQ Vanguard events including upcoming and past events.';

COMMENT ON TABLE public.event_registrations IS
'Registrations for NISQ Vanguard events.';
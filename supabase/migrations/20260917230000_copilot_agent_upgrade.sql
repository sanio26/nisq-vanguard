-- ============================================================
-- NISQ Vanguard
-- AI Co-Pilot Agent Upgrade
-- ============================================================

-- ============================================================
-- TOOL EXECUTION LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS public.copilot_tool_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  conversation_id UUID
    REFERENCES public.copilot_conversations(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  tool_name TEXT NOT NULL,

  tool_input JSONB NOT NULL DEFAULT '{}'::jsonb,

  tool_output JSONB NOT NULL DEFAULT '{}'::jsonb,

  status TEXT NOT NULL DEFAULT 'SUCCESS'
    CHECK (
      status IN (
        'SUCCESS',
        'REJECTED',
        'ERROR'
      )
    ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- LAB TUTOR SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lab_tutor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  lab_id UUID NOT NULL
    REFERENCES public.labs(id)
    ON DELETE CASCADE,

  attempt_id UUID
    REFERENCES public.lab_attempts(id)
    ON DELETE SET NULL,

  challenge_id UUID
    REFERENCES public.lab_challenges(id)
    ON DELETE SET NULL,

  mode TEXT NOT NULL DEFAULT 'HINT'
    CHECK (
      mode IN (
        'HINT',
        'EXPLANATION',
        'CONCEPT',
        'REVIEW'
      )
    ),

  hints_used INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- CO-PILOT FEEDBACK
-- ============================================================

CREATE TABLE IF NOT EXISTS public.copilot_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  message_id UUID NOT NULL
    REFERENCES public.copilot_messages(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  rating TEXT NOT NULL
    CHECK (
      rating IN (
        'HELPFUL',
        'NOT_HELPFUL'
      )
    ),

  feedback_text TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(message_id, user_id)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_copilot_tool_calls_conversation
ON public.copilot_tool_calls(conversation_id);

CREATE INDEX IF NOT EXISTS idx_copilot_tool_calls_user
ON public.copilot_tool_calls(user_id);

CREATE INDEX IF NOT EXISTS idx_lab_tutor_sessions_user
ON public.lab_tutor_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_lab_tutor_sessions_lab
ON public.lab_tutor_sessions(lab_id);

CREATE INDEX IF NOT EXISTS idx_lab_tutor_sessions_attempt
ON public.lab_tutor_sessions(attempt_id);

CREATE INDEX IF NOT EXISTS idx_copilot_feedback_message
ON public.copilot_feedback(message_id);


-- ============================================================
-- UPDATED_AT
-- ============================================================

DROP TRIGGER IF EXISTS trg_lab_tutor_sessions_updated_at
ON public.lab_tutor_sessions;

CREATE TRIGGER trg_lab_tutor_sessions_updated_at
BEFORE UPDATE ON public.lab_tutor_sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_copilot_updated_at();


-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.copilot_tool_calls
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lab_tutor_sessions
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.copilot_feedback
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- TOOL CALL POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users read own tool calls"
ON public.copilot_tool_calls;

CREATE POLICY "Users read own tool calls"
ON public.copilot_tool_calls
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);


-- Tool calls are created by the trusted Edge Function.
-- There is intentionally no authenticated INSERT policy.


-- ============================================================
-- LAB TUTOR POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users read own tutor sessions"
ON public.lab_tutor_sessions;

CREATE POLICY "Users read own tutor sessions"
ON public.lab_tutor_sessions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);


DROP POLICY IF EXISTS "Users create own tutor sessions"
ON public.lab_tutor_sessions;

CREATE POLICY "Users create own tutor sessions"
ON public.lab_tutor_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);


DROP POLICY IF EXISTS "Users update own tutor sessions"
ON public.lab_tutor_sessions;

CREATE POLICY "Users update own tutor sessions"
ON public.lab_tutor_sessions
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);


-- ============================================================
-- FEEDBACK POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users read own copilot feedback"
ON public.copilot_feedback;

CREATE POLICY "Users read own copilot feedback"
ON public.copilot_feedback
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);


DROP POLICY IF EXISTS "Users create own copilot feedback"
ON public.copilot_feedback;

CREATE POLICY "Users create own copilot feedback"
ON public.copilot_feedback
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);


-- ============================================================
-- SECURITY
-- ============================================================

REVOKE ALL
ON public.copilot_tool_calls
FROM anon;

REVOKE ALL
ON public.lab_tutor_sessions
FROM anon;

REVOKE ALL
ON public.copilot_feedback
FROM anon;


COMMENT ON TABLE public.copilot_tool_calls IS
'Server-generated audit trail of AI Co-Pilot tool execution.';

COMMENT ON TABLE public.lab_tutor_sessions IS
'State for AI-assisted cybersecurity lab tutoring.';

COMMENT ON TABLE public.copilot_feedback IS
'User feedback used to evaluate AI Co-Pilot response quality.';
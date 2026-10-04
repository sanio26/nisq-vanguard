-- ============================================================
-- NISQ Vanguard
-- AI Co-Pilot / RAG Foundation
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;


-- ============================================================
-- KNOWLEDGE DOCUMENTS
--
-- High-level sources used by the AI Co-Pilot.
-- Examples:
--   website pages
--   service descriptions
--   course information
--   lab documentation
--   research material
--   organizational documents
-- ============================================================

CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,

  slug TEXT NOT NULL UNIQUE,

  source_type TEXT NOT NULL DEFAULT 'INTERNAL',

  source_url TEXT,

  description TEXT,

  content TEXT NOT NULL,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  is_published BOOLEAN NOT NULL DEFAULT FALSE,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- KNOWLEDGE CHUNKS
--
-- Small searchable pieces of knowledge.
--
-- Gemini Embedding 2 will generate 768-dimensional vectors
-- for the initial RAG implementation.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  document_id UUID NOT NULL
    REFERENCES public.knowledge_documents(id)
    ON DELETE CASCADE,

  chunk_index INTEGER NOT NULL,

  content TEXT NOT NULL,

  embedding VECTOR(768),

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(document_id, chunk_index)
);


-- ============================================================
-- CONVERSATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.copilot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  title TEXT,

  page_path TEXT,

  page_title TEXT,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- MESSAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.copilot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  conversation_id UUID NOT NULL
    REFERENCES public.copilot_conversations(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  role TEXT NOT NULL
    CHECK (role IN ('USER', 'ASSISTANT', 'SYSTEM')),

  content TEXT NOT NULL,

  citations JSONB NOT NULL DEFAULT '[]'::jsonb,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_published
ON public.knowledge_documents(is_published);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_source_type
ON public.knowledge_documents(source_type);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document
ON public.knowledge_chunks(document_id);

CREATE INDEX IF NOT EXISTS idx_copilot_conversations_user
ON public.copilot_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_copilot_messages_conversation
ON public.copilot_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_copilot_messages_user
ON public.copilot_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding
ON public.knowledge_chunks
USING hnsw (embedding vector_cosine_ops);


-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_copilot_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS trg_knowledge_documents_updated_at
ON public.knowledge_documents;

CREATE TRIGGER trg_knowledge_documents_updated_at
BEFORE UPDATE ON public.knowledge_documents
FOR EACH ROW
EXECUTE FUNCTION public.set_copilot_updated_at();


DROP TRIGGER IF EXISTS trg_copilot_conversations_updated_at
ON public.copilot_conversations;

CREATE TRIGGER trg_copilot_conversations_updated_at
BEFORE UPDATE ON public.copilot_conversations
FOR EACH ROW
EXECUTE FUNCTION public.set_copilot_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.knowledge_documents
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.knowledge_chunks
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.copilot_conversations
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.copilot_messages
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- KNOWLEDGE DOCUMENT POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Published knowledge is publicly readable"
ON public.knowledge_documents;

CREATE POLICY "Published knowledge is publicly readable"
ON public.knowledge_documents
FOR SELECT
TO anon, authenticated
USING (
  is_published = TRUE
);


DROP POLICY IF EXISTS "Admins manage knowledge documents"
ON public.knowledge_documents;

CREATE POLICY "Admins manage knowledge documents"
ON public.knowledge_documents
FOR ALL
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);


-- ============================================================
-- KNOWLEDGE CHUNK POLICIES
--
-- Chunks are intentionally NOT publicly readable.
--
-- Retrieval will happen server-side through the Edge Function.
-- ============================================================

DROP POLICY IF EXISTS "Admins manage knowledge chunks"
ON public.knowledge_chunks;

CREATE POLICY "Admins manage knowledge chunks"
ON public.knowledge_chunks
FOR ALL
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);


-- ============================================================
-- COPILOT CONVERSATION POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users read own copilot conversations"
ON public.copilot_conversations;

CREATE POLICY "Users read own copilot conversations"
ON public.copilot_conversations
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);


DROP POLICY IF EXISTS "Users create own copilot conversations"
ON public.copilot_conversations;

CREATE POLICY "Users create own copilot conversations"
ON public.copilot_conversations
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);


DROP POLICY IF EXISTS "Users update own copilot conversations"
ON public.copilot_conversations;

CREATE POLICY "Users update own copilot conversations"
ON public.copilot_conversations
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);


DROP POLICY IF EXISTS "Users delete own copilot conversations"
ON public.copilot_conversations;

CREATE POLICY "Users delete own copilot conversations"
ON public.copilot_conversations
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);


-- ============================================================
-- COPILOT MESSAGE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users read own copilot messages"
ON public.copilot_messages;

CREATE POLICY "Users read own copilot messages"
ON public.copilot_messages
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);


DROP POLICY IF EXISTS "Users create own copilot messages"
ON public.copilot_messages;

CREATE POLICY "Users create own copilot messages"
ON public.copilot_messages
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);


-- ============================================================
-- SERVER-SIDE VECTOR SEARCH
--
-- This function is deliberately not exposed to anon/authenticated.
-- The Edge Function will perform retrieval server-side.
-- ============================================================

CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding VECTOR(768),
  match_count INTEGER DEFAULT 6
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  document_title TEXT,
  content TEXT,
  source_url TEXT,
  similarity DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    kc.id AS chunk_id,
    kd.id AS document_id,
    kd.title AS document_title,
    kc.content,
    kd.source_url,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  INNER JOIN public.knowledge_documents kd
    ON kd.id = kc.document_id
  WHERE
    kd.is_published = TRUE
    AND kc.embedding IS NOT NULL
  ORDER BY
    kc.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 12);
$$;


-- ============================================================
-- IMPORTANT SECURITY BOUNDARY
-- ============================================================

REVOKE ALL
ON FUNCTION public.match_knowledge_chunks(VECTOR(768), INTEGER)
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.match_knowledge_chunks(VECTOR(768), INTEGER)
FROM anon;

REVOKE ALL
ON FUNCTION public.match_knowledge_chunks(VECTOR(768), INTEGER)
FROM authenticated;


COMMENT ON FUNCTION public.match_knowledge_chunks(VECTOR(768), INTEGER)
IS
'Private semantic retrieval function for the NISQ Vanguard AI Co-Pilot. Called only by trusted server-side infrastructure.';


-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.knowledge_documents IS
'Approved NISQ Vanguard knowledge sources used by the AI Co-Pilot.';

COMMENT ON TABLE public.knowledge_chunks IS
'Chunked and embedded knowledge used for semantic RAG retrieval.';

COMMENT ON TABLE public.copilot_conversations IS
'Authenticated user conversation sessions with the NISQ Vanguard AI Co-Pilot.';

COMMENT ON TABLE public.copilot_messages IS
'Individual AI Co-Pilot conversation messages and grounded citations.';
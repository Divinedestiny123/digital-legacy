-- Migration: 07_update_embedding_dimension.sql
-- Description: Alters the memories table to use a 384-dimensional vector to match the Xenova/all-MiniLM-L6-v2 local model.

-- First, drop the index that depends on the embedding column
DROP INDEX IF EXISTS memories_embedding_idx;

-- Alter the column type to vector(384)
ALTER TABLE memories ALTER COLUMN embedding TYPE vector(384);

-- Recreate the index
CREATE INDEX memories_embedding_idx ON memories USING hnsw (embedding vector_cosine_ops);

-- Also update the match_memories function to take a 384-dimensional vector
DROP FUNCTION IF EXISTS match_memories(vector(1536), double precision, integer, uuid);

CREATE OR REPLACE FUNCTION match_memories (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  target_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content_chunk text,
  context_type text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    memories.id,
    memories.content_chunk,
    memories.context_type,
    1 - (memories.embedding <=> query_embedding) as similarity
  FROM memories
  WHERE memories.user_id::text = target_user_id::text
    -- Only return matches above the threshold
    AND 1 - (memories.embedding <=> query_embedding) > match_threshold
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_count;
$$;

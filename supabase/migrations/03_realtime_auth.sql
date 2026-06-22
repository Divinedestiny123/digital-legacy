-- Change embedding dimensions from 1536 (OpenAI) to 384 (Xenova)
-- We need to drop the table or recreate the column to change dimensions
-- Warning: This will wipe existing memories

ALTER TABLE memories DROP COLUMN embedding;
ALTER TABLE memories ADD COLUMN embedding vector(384);

-- Drop the old function first since the return type and parameter types have changed
DROP FUNCTION IF EXISTS match_memories(vector(1536), float, int, uuid);
DROP FUNCTION IF EXISTS match_memories(vector(1536), float, int, text);
DROP FUNCTION IF EXISTS match_memories(vector(384), float, int, text);

-- Recreate the match_memories function to use 384 dimensions
CREATE OR REPLACE FUNCTION match_memories (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  target_user_id text
)
RETURNS TABLE (
  id uuid,
  content_chunk text,
  context_type text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memories.id,
    memories.content_chunk,
    memories.context_type,
    1 - (memories.embedding <=> query_embedding) AS similarity
  FROM memories
  WHERE memories.user_id = target_user_id
    AND 1 - (memories.embedding <=> query_embedding) > match_threshold
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

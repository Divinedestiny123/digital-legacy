-- 0. Drop all policies that depend on user_id
drop policy if exists "Users can view their own memories." on memories;
drop policy if exists "Users can insert their own memories." on memories;
drop policy if exists "Users can update their own memories." on memories;

drop policy if exists "Users can view their own chat messages." on chat_messages;
drop policy if exists "Users can insert their own chat messages." on chat_messages;

drop policy if exists "Users can view their own assets." on user_assets;
drop policy if exists "Users can insert their own assets." on user_assets;

-- 1. Disable Row Level Security so the demo frontend can insert without authenticating
alter table memories disable row level security;
alter table chat_messages disable row level security;
alter table user_assets disable row level security;

-- 2. Drop foreign key constraints and alter user_id columns to accept the "demo-user-id" string
alter table memories drop constraint if exists memories_user_id_fkey;
alter table memories alter column user_id type text;

alter table chat_messages drop constraint if exists chat_messages_user_id_fkey;
alter table chat_messages alter column user_id type text;

alter table user_assets drop constraint if exists user_assets_user_id_fkey;
alter table user_assets alter column user_id type text;

-- 3. Update the RAG retrieval function to accept a text ID instead of a UUID
drop function if exists match_memories;
create or replace function match_memories (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  target_user_id text
)
returns table (
  id uuid,
  content_chunk text,
  context_type text,
  similarity float
)
language sql stable
as $$
  select
    memories.id,
    memories.content_chunk,
    memories.context_type,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where memories.user_id = target_user_id
    and 1 - (memories.embedding <=> query_embedding) > match_threshold
  order by memories.embedding <=> query_embedding
  limit match_count;
$$;

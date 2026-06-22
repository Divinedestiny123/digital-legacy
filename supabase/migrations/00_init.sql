-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the user_profiles table
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  encrypted_asset_hash text, -- 0G Storage rootHash of the encrypted seed phrase
  authorized_claimant text,  -- Name/Email of the relative allowed to claim
  last_active_timestamp timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create the memories table for the RAG Knowledge Base
create table memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  content_chunk text not null,       -- The text of the user's response/memory
  context_type text not null,        -- Label e.g., 'tone_rant', 'wisdom_advice', 'verification_gatekeeper'
  embedding vector(1536) not null,   -- The embedding vector for semantic search
  created_at timestamp with time zone default now()
);

-- Index the embedding column for faster semantic search using HNSW (Hierarchical Navigable Small World)
create index on memories using hnsw (embedding vector_cosine_ops);

-- Create a Postgres function to search for matching memories (The RAG retrieval logic)
create or replace function match_memories (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  target_user_id uuid
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
    -- Only return matches above the threshold
    and 1 - (memories.embedding <=> query_embedding) > match_threshold
  order by memories.embedding <=> query_embedding
  limit match_count;
$$;

-- Set up Row Level Security (RLS)
alter table user_profiles enable row level security;
alter table memories enable row level security;

-- Policies for user_profiles
create policy "Users can view their own profile."
  on user_profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on user_profiles for update
  using ( auth.uid() = id );

-- Policies for memories
create policy "Users can view their own memories."
  on memories for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own memories."
  on memories for insert
  with check ( auth.uid() = user_id );

-- Create the chat_messages table
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  phase text not null,
  created_at timestamp with time zone default now()
);

-- Create the user_assets table
create table user_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  asset_name text not null,
  asset_type text not null check (asset_type in ('seed_phrase', 'video_message')),
  root_hash text not null,
  created_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table chat_messages enable row level security;
alter table user_assets enable row level security;

-- Policies for chat_messages
create policy "Users can view their own chat messages."
  on chat_messages for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own chat messages."
  on chat_messages for insert
  with check ( auth.uid() = user_id );

-- Policies for user_assets
create policy "Users can view their own assets."
  on user_assets for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own assets."
  on user_assets for insert
  with check ( auth.uid() = user_id );

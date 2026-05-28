-- Run this in Supabase SQL Editor

-- Reading progress
create table if not exists reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_index integer not null,
  completed boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, chapter_index)
);
alter table reading_progress enable row level security;
create policy "Users manage own progress" on reading_progress
  for all using (auth.uid() = user_id);

-- Notes
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_index integer not null,
  content text,
  updated_at timestamptz default now(),
  unique(user_id, chapter_index)
);
alter table notes enable row level security;
create policy "Users manage own notes" on notes
  for all using (auth.uid() = user_id);

-- Bookmarks
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_index integer not null,
  created_at timestamptz default now(),
  unique(user_id, chapter_index)
);
alter table bookmarks enable row level security;
create policy "Users manage own bookmarks" on bookmarks
  for all using (auth.uid() = user_id);

-- Checklist steps
create table if not exists checklist_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  step_number integer not null,
  completed boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, step_number)
);
alter table checklist_steps enable row level security;
create policy "Users manage own checklist" on checklist_steps
  for all using (auth.uid() = user_id);

-- Saved ideas
create table if not exists saved_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  tag text,
  source text default 'manual',
  created_at timestamptz default now()
);
alter table saved_ideas enable row level security;
create policy "Users manage own ideas" on saved_ideas
  for all using (auth.uid() = user_id);

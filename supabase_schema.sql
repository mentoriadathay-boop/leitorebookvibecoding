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

-- Saved news
create table if not exists saved_news (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  news_date date not null,
  article jsonb not null,
  saved_at timestamptz default now()
);
alter table saved_news enable row level security;
create policy "Users manage own saved news" on saved_news
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Platform notifications (admin publica, usuários leem)
create table if not exists platform_notifications (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text default '',
  type        text not null default 'feature' check (type in ('feature', 'update', 'news', 'alert')),
  published   boolean default true,
  email_sent  boolean default false,
  created_at  timestamptz default now()
);
alter table platform_notifications enable row level security;

-- Todos os usuários autenticados podem ler notificações publicadas
create policy "Authenticated read notifications" on platform_notifications
  for select to authenticated using (published = true);

-- Apenas admins podem criar/editar/deletar
create policy "Admin manages notifications" on platform_notifications
  for all to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Registro de notificações lidas por usuário
create table if not exists notification_reads (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  notification_id uuid references platform_notifications(id) on delete cascade not null,
  read_at         timestamptz default now(),
  unique(user_id, notification_id)
);
alter table notification_reads enable row level security;
create policy "Users manage own reads" on notification_reads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Newsletter / Email Marketing
create table if not exists email_marketing (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subject     text not null,
  body        text not null,
  category    text not null default 'newsletter',
  published   boolean default true,
  sent        boolean default false,
  sent_at     timestamptz,
  sent_count  integer default 0,
  created_at  timestamptz default now()
);
alter table email_marketing enable row level security;
create policy "Users read published emails" on email_marketing
  for select to authenticated using (published = true);
create policy "Admins manage emails" on email_marketing
  for all to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

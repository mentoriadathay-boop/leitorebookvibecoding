-- ============================================================
-- ADMIN SCHEMA — Rodar no Supabase SQL Editor
-- ============================================================

-- 1. Tabela profiles
create table if not exists profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  display_name  text,
  role          text not null default 'user'   check (role in ('user', 'admin')),
  plan_type     text not null default 'free'   check (plan_type in ('free', 'monthly', 'annual', 'lifetime')),
  plan_started_at  timestamptz,
  plan_expires_at  timestamptz,
  status        text not null default 'active' check (status in ('active', 'blocked')),
  created_at    timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users update own profile" on profiles
  for update using (auth.uid() = id);

-- 2. Trigger: cria profile automaticamente ao registrar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Criar profiles para usuários já existentes (rodar uma vez)
insert into profiles (id, display_name)
select id, coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;

-- 4. Tabela chapters (conteúdo dinâmico)
create table if not exists chapters (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  content        text default '',
  page           integer default 1,
  reading_time   integer default 5,
  glossary_terms text[] default '{}',
  quiz_questions jsonb default '[]',
  order_index    integer not null default 0,
  group_label    text default 'Módulo 1',
  published      boolean default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table chapters enable row level security;

create policy "Authenticated reads published chapters" on chapters
  for select to authenticated using (published = true);

-- ============================================================
-- DEFINIR mentoriadathay@gmail.com COMO ADMIN
-- ============================================================
insert into profiles (id, display_name, role)
select id, coalesce(raw_user_meta_data->>'display_name', email), 'admin'
from auth.users
where email = 'mentoriadathay@gmail.com'
on conflict (id) do update set role = 'admin';

-- Verificar se deu certo:
-- select id, display_name, role from profiles where role = 'admin';

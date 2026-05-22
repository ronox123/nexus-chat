-- ============================================================================
-- Nexus Chat — Initial schema
-- Tables: profiles, chats, messages, user_settings, attachments
-- Security: Row Level Security enabled on every table; owner-scoped policies.
-- ============================================================================

-- Required extensions ---------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles : 1:1 with auth.users, holds public-facing user data
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- chats : a conversation thread owned by a user
-- ----------------------------------------------------------------------------
create table if not exists public.chats (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null default 'New chat',
  model       text not null default 'gpt-4o-mini',
  pinned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists chats_user_id_idx on public.chats (user_id);
create index if not exists chats_updated_at_idx on public.chats (updated_at desc);

-- ----------------------------------------------------------------------------
-- messages : individual turns within a chat
-- ----------------------------------------------------------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  chat_id     uuid not null references public.chats (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null check (role in ('user', 'assistant', 'system')),
  content     text not null default '',
  model       text,
  created_at  timestamptz not null default now()
);
create index if not exists messages_chat_id_idx on public.messages (chat_id, created_at);

-- ----------------------------------------------------------------------------
-- user_settings : per-user preferences
-- ----------------------------------------------------------------------------
create table if not exists public.user_settings (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  theme          text not null default 'dark',
  default_model  text not null default 'gpt-4o-mini',
  system_prompt  text,
  send_on_enter  boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- attachments : files/images linked to a message (future-ready)
-- ----------------------------------------------------------------------------
create table if not exists public.attachments (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid references public.messages (id) on delete cascade,
  chat_id     uuid not null references public.chats (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  file_name   text not null,
  mime_type   text,
  size_bytes  bigint,
  created_at  timestamptz not null default now()
);
create index if not exists attachments_message_id_idx on public.attachments (message_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.chats         enable row level security;
alter table public.messages      enable row level security;
alter table public.user_settings enable row level security;
alter table public.attachments   enable row level security;

-- profiles --------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- chats -----------------------------------------------------------------------
drop policy if exists "chats_all_own" on public.chats;
create policy "chats_all_own" on public.chats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- messages --------------------------------------------------------------------
drop policy if exists "messages_all_own" on public.messages;
create policy "messages_all_own" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_settings ---------------------------------------------------------------
drop policy if exists "settings_all_own" on public.user_settings;
create policy "settings_all_own" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- attachments -----------------------------------------------------------------
drop policy if exists "attachments_all_own" on public.attachments;
create policy "attachments_all_own" on public.attachments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Triggers : auto-create profile + settings on signup, maintain updated_at
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists chats_touch on public.chats;
create trigger chats_touch before update on public.chats
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- Storage bucket for attachments (future-ready)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

drop policy if exists "attachments_storage_own" on storage.objects;
create policy "attachments_storage_own" on storage.objects
  for all using (
    bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]
  );

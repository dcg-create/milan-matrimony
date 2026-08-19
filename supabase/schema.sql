-- Run this in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  gender text,
  date_of_birth date,
  city text,
  state text,
  education text,
  profession text,
  income text,
  community text,
  mother_tongue text,
  bio text,
  photo_url text,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  min_age int,
  max_age int,
  preferred_city text,
  preferred_education text,
  preferred_profession text,
  preferred_community text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists interests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz default now(),
  unique(sender_id, receiver_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  body text not null check (char_length(body) <= 2000),
  created_at timestamptz default now()
);

create table if not exists blocks (
  blocker_id uuid references profiles(id) on delete cascade,
  blocked_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key(blocker_id, blocked_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) on delete cascade,
  reported_id uuid references profiles(id) on delete cascade,
  reason text not null,
  notes text,
  status text default 'open',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table preferences enable row level security;
alter table interests enable row level security;
alter table messages enable row level security;
alter table blocks enable row level security;
alter table reports enable row level security;

create policy "profiles readable to signed in users" on profiles for select to authenticated using (true);
create policy "users create own profile" on profiles for insert to authenticated with check (auth.uid() = id);
create policy "users update own profile" on profiles for update to authenticated using (auth.uid() = id);
create policy "own preferences" on preferences for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "interests visible to participants" on interests for select to authenticated using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "send interest" on interests for insert to authenticated with check (auth.uid() = sender_id);
create policy "receiver/sender updates interest" on interests for update to authenticated using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "messages visible to participants" on messages for select to authenticated using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "send messages" on messages for insert to authenticated with check (auth.uid() = sender_id);
create policy "manage own blocks" on blocks for all to authenticated using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);
create policy "create reports" on reports for insert to authenticated with check (auth.uid() = reporter_id);

-- Realtime chat
alter publication supabase_realtime add table messages;

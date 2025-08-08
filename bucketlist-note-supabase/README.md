# Bucketlist Note (MVP)
Simple social app for **Did / Doing / Want** notes with cheers and profiles.

## Supabase SQL (paste in SQL Editor)
```sql
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  name text,
  bio text,
  location text,
  created_at timestamp with time zone default now()
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('Did','Doing','Want')),
  content text not null,
  tags text[] default '{}',
  privacy text not null default 'public' check (privacy in ('public','friends','private')),
  created_at timestamp with time zone default now()
);

create table public.cheers (
  user_id uuid not null references public.profiles(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, note_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
alter table public.notes enable row level security;
alter table public.cheers enable row level security;
alter table public.comments enable row level security;

create policy "read profiles" on public.profiles for select using (true);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

create policy "read public notes" on public.notes for select using (privacy = 'public');
create policy "insert own notes" on public.notes for insert with check (auth.uid() = user_id);
create policy "update own notes" on public.notes for update using (auth.uid() = user_id);
create policy "delete own notes" on public.notes for delete using (auth.uid() = user_id);

create policy "read cheers" on public.cheers for select using (true);
create policy "insert cheers as self" on public.cheers for insert with check (auth.uid() = user_id);
create policy "delete own cheers" on public.cheers for delete using (auth.uid() = user_id);

create policy "read comments" on public.comments for select using (true);
create policy "insert comments as self" on public.comments for insert with check (auth.uid() = user_id);
create policy "delete own comments" on public.comments for delete using (auth.uid() = user_id);
```

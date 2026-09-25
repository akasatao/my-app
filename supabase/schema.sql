-- Supabase SQL Editor で実行してください。
-- 招待 Cookie によるアプリ側の認証前提で、anon キーから CRUD できるようにしています。

create table if not exists public.threads (
  id text primary key,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  post_count integer not null default 1
);

create table if not exists public.posts (
  id text primary key,
  thread_id text not null references public.threads (id) on delete cascade,
  res_number integer not null,
  name text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  poster_id text not null,
  author_key text not null default '',
  edited_at timestamptz,
  deleted_at timestamptz,
  reply_to integer,
  media_url text,
  media_type text,
  unique (thread_id, res_number)
);

create index if not exists posts_thread_id_res_number_idx
  on public.posts (thread_id, res_number);

alter table public.threads enable row level security;
alter table public.posts enable row level security;

drop policy if exists threads_all on public.threads;
create policy threads_all on public.threads
  for all
  using (true)
  with check (true);

drop policy if exists posts_all on public.posts;
create policy posts_all on public.posts
  for all
  using (true)
  with check (true);

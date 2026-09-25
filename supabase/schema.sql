-- 既存の threads / posts 定義に合わせた参照用スキーマです。
-- すでにテーブルがある場合は SQL Editor で再作成しないでください。

create table if not exists public.threads (
  id text primary key,
  title text not null,
  created_at timestamp not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  thread_id text not null references public.threads (id) on delete cascade,
  no integer not null,
  name text not null,
  body text not null default '',
  media_url text,
  media_type text,
  reply_to_no integer,
  reply_to_name text,
  reply_to_body text,
  user_id text,
  created_at timestamp not null default now(),
  unique (thread_id, no)
);

create index if not exists posts_thread_id_no_idx
  on public.posts (thread_id, no);

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

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read
  on storage.objects
  for select
  using (bucket_id = 'media');

drop policy if exists media_public_insert on storage.objects;
create policy media_public_insert
  on storage.objects
  for insert
  with check (bucket_id = 'media');


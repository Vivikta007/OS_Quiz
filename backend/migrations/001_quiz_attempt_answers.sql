-- Run once in Supabase Dashboard -> SQL Editor.
-- Safe to run again: every statement checks whether it already exists.

-- 1. Store each question + chosen answer, so old attempts can be reviewed.
alter table public.quiz_attempts
  add column if not exists answers jsonb not null default '[]'::jsonb;

-- 2. A random ID the app creates for each quiz. If the app retries a
--    submission after a network error, the same ID is sent again and the
--    unique index stops a duplicate row being saved.
alter table public.quiz_attempts
  add column if not exists client_attempt_id uuid;

create unique index if not exists quiz_attempts_user_client_attempt_key
  on public.quiz_attempts (user_id, client_attempt_id);

-- 3. Speeds up "my attempts, newest first" (the History screen).
create index if not exists quiz_attempts_user_created_idx
  on public.quiz_attempts (user_id, created_at desc);

-- 4. Tell Supabase's API about the new columns straight away
--    (otherwise: "Could not find the 'answers' column ... in the schema cache").
notify pgrst, 'reload schema';

-- 5. Show the RLS status and policies so we can check them.
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('profiles', 'quiz_attempts');

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, cmd;

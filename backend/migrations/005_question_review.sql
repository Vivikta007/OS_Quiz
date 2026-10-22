-- Run once in Supabase Dashboard -> SQL Editor (after 004).
-- Adds what the admin "generate with AI -> approve / edit / reject" flow needs.
-- Safe to run again.

-- Only 'active' questions appear in quizzes. AI-generated questions start
-- as 'pending' until an admin approves them. Rejected ones are kept (not
-- deleted) so the same question isn't generated and reviewed twice.
alter table public.questions
  add column if not exists status text not null default 'active',
  add column if not exists source text not null default 'manual',
  add column if not exists explanation text,
  -- Why a question needs a closer look, e.g. the AI checker disagreed
  add column if not exists review_note text,
  add column if not exists reviewed_at timestamptz;

alter table public.questions
  drop constraint if exists questions_status_check,
  add constraint questions_status_check
    check (status in ('pending', 'active', 'rejected'));

alter table public.questions
  drop constraint if exists questions_source_check,
  add constraint questions_source_check
    check (source in ('manual', 'ai'));

create index if not exists questions_status_idx
  on public.questions (status);

-- ---------------------------------------------------------------------------
-- Make yourself an admin (replace the email, then run this line).
-- app_metadata can only be changed with the secret key or here in the
-- dashboard - users can't give themselves the admin role from the app.
-- The backend reads the role fresh from Supabase on every request, so it
-- takes effect immediately (no need to log out).
-- ---------------------------------------------------------------------------
-- update auth.users
-- set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
-- where email = 'you@example.com';

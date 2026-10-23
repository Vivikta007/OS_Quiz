-- Run once in Supabase Dashboard -> SQL Editor (after 005).
-- Stops two admins from silently overwriting each other's edits.
-- Safe to run again.
--
-- Optimistic locking: every question has a version number that goes up by
-- one on every change. The app sends back the version it opened; the
-- backend updates the row only "where id = ... and version = <that number>".
-- If another admin saved in between, the version no longer matches, no row
-- is updated, and the backend answers 409 Conflict instead of overwriting.

alter table public.questions
  add column if not exists version integer not null default 1;

-- Bump the version inside the same UPDATE statement, so it can't be
-- forgotten or skipped by any code path (backend, dashboard, SQL editor).
create or replace function public.bump_question_version()
returns trigger
language plpgsql
as $$
begin
  new.version := old.version + 1;
  return new;
end;
$$;

drop trigger if exists questions_bump_version on public.questions;
create trigger questions_bump_version
  before update on public.questions
  for each row
  execute function public.bump_question_version();

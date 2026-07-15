-- SEC-D FAIL #2: throttling błędnych haseł portalu klienta (wfa-portal + wfa-test-chat).
-- Licznik prób per-token (unique_token projektu). Po N błędnych w oknie -> lockout z rosnącym
-- backoffem; reset po poprawnym haśle. Dostęp WYŁĄCZNIE service-role (edge) — zero polityk RLS,
-- revoke dla anon/authenticated (wzorzec wfa_* = tylko team/edge).
create table if not exists public.wfa_auth_attempts (
  token              text primary key,
  fail_count         integer     not null default 0,
  lock_count         integer     not null default 0,
  window_started_at  timestamptz not null default now(),
  locked_until       timestamptz,
  updated_at         timestamptz not null default now()
);

alter table public.wfa_auth_attempts enable row level security;
revoke all on public.wfa_auth_attempts from anon, authenticated;

comment on table public.wfa_auth_attempts is
  'SEC-D throttling logowania portalu klienta (wfa-portal/wfa-test-chat). Klucz = unique_token projektu. Tylko service-role.';

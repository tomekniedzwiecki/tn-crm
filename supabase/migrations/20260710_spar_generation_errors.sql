-- 20260710_spar_generation_errors.sql
-- Trwały stempel błędu generacji artefaktów sparingu (/aplikacja).
--
-- Kontekst: reveale (spar_reveals) potrafiły utknąć w statusie 'generating' w
-- nieskończoność — spar-drip odpalał generację (spar-economics/gtm/landing/...),
-- ale generator odrzucał wywołanie (bramka właściciela vs. klucz serwisowy = 403)
-- albo cicho padał; nic tego nie wykrywało, artefakt nigdy nie powstawał, maile
-- odsłon nie szły. Te kolumny dają recovery (licznik prób → 'failed' po N), alerty
-- Slack (dedup po statusie 'failed') oraz „zdrowie generacji" w karcie leada.
--
-- Kolumny addytywne, wszystkie z DEFAULT — bezpieczne dla działającego kodu.

alter table public.spar_reveals
  add column if not exists error_count   int not null default 0,
  add column if not exists last_error    text,
  add column if not exists last_error_at timestamptz;

-- Licznik padów generacji na poziomie sesji (widoczny jako badge zdrowia w panelu).
alter table public.spar_sessions
  add column if not exists gen_error_count int not null default 0;

comment on column public.spar_reveals.error_count   is 'Liczba nieudanych prób doprowadzenia artefaktu do gotowości (spar-drip). Po 3 → status ''failed'' + alert Slack.';
comment on column public.spar_reveals.last_error     is 'Ostatni komunikat błędu generacji (np. 403 owner-gate, 502 openai, stale).';
comment on column public.spar_reveals.last_error_at  is 'Kiedy odnotowano ostatni błąd generacji.';
comment on column public.spar_sessions.gen_error_count is 'Ile artefaktów tej sesji definitywnie padło (status ''failed'' w spar_reveals).';

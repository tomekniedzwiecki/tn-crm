-- Reset hasła portalu klienta TN App (wfa) — self-service przez link mailowy.
-- Wzorzec = stary portal workflow (password-reset fn), ale token resetu trzymamy jako SHA-256
-- (w bazie NIGDY plaintext; link zna tylko skrzynka klienta). TTL egzekwuje edge wfa-portal.
alter table public.wfa_projects
  add column if not exists password_reset_token_hash text,
  add column if not exists password_reset_expires timestamptz;

comment on column public.wfa_projects.password_reset_token_hash is
  'SHA-256 jednorazowego tokenu resetu hasła portalu (mail na customer_email); NULL = brak aktywnego resetu';
comment on column public.wfa_projects.password_reset_expires is
  'Ważność tokenu resetu (60 min od wysyłki); cooldown wysyłki liczony jako expires-55min';

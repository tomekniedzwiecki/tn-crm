-- Mail "przekazanie dostępu" do portalu klienta: wysyłka AUTOMATYCZNA przez Resend
-- (edge wfa-progress-drip, faza 0 — przed mailami o kamieniach). Dedup per projekt.
-- Zaaplikowane na prod 12.07.2026.
alter table public.wfa_projects
  add column if not exists access_mail_sent_at timestamptz;

-- Zero maili wstecz: projekt Tomka Jankowiaka (utworzony przed mechanizmem, bez nazwy
-- aplikacji, kontakt prowadzony ręcznie) oznaczamy jako obsłużony. Fachmat celowo BEZ
-- stempla — dostanie mail dostępu z automatu przy pierwszym przebiegu.
update public.wfa_projects
  set access_mail_sent_at = now()
  where id = '858427d1-107f-48a9-9b91-3fe4999702e0';

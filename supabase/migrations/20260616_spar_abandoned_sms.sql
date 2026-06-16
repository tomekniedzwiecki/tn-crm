-- Sekwencja powrotu zyskuje JEDEN SMS (kadencja: ~+50h po ostatniej aktywności,
-- po serii 3 maili, tylko gdy lead dalej milczy). SMS pre-generowany RAZEM z
-- mailami (ten sam prompt GPT) i zapisany 1:1 jako „do wysłania" — podgląd w
-- panelu, wysyłka dokładnie zapisanej treści. SMS to osobny wiersz w tej samej
-- tabeli: kind='abandoned_sms', seq=4, treść w kolumnie `sms` (subject/html puste).
alter table public.spar_abandoned_emails
  add column if not exists sms text;
alter table public.spar_abandoned_emails alter column subject drop not null;
alter table public.spar_abandoned_emails alter column html drop not null;

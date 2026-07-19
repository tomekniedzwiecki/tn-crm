-- Presence rozmowy /rozmowa: front pinguje (tylko gdy karta widoczna) → lead.html
-- pokazuje przy transkrypcji, czy lead jest teraz online (last_seen_at <= 90 s).
alter table talk_sessions add column if not exists last_seen_at timestamptz;

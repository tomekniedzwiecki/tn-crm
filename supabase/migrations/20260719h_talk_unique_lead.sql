-- Fix race podwójnego init (2 karty naraz → 2 sesje / podwójne otwarcie i koszt OpenAI):
-- jedna sesja rozmowy per lead, egzekwowana przez bazę. Edge łapie 23505 i re-selectuje.
create unique index if not exists uq_talk_sessions_lead on talk_sessions(lead_id);

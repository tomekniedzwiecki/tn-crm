-- Transkrypcja rozmowy AI do wątku Slack pod powiadomieniem o leadzie.
-- leads.slack_ts/slack_channel: wiadomość-kotwica wątku (zapisywane przez slack-notify,
-- gdy skonfigurowany SLACK_BOT_TOKEN — incoming webhooki NIE zwracają ts i nie dają wątków).
-- talk_sessions.slack_transcript_*: idempotencja + dosyłki „ciąg dalszy" po kolejnej ciszy.
alter table leads add column if not exists slack_ts text;
alter table leads add column if not exists slack_channel text;
alter table talk_sessions add column if not exists slack_transcript_at timestamptz;
alter table talk_sessions add column if not exists slack_transcript_count int not null default 0;

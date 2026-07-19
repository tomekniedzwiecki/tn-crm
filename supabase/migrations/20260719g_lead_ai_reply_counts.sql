-- Kolumna „Rozmowa AI" na /leads: ile odpowiedzi (wiadomości leada) padło w rozmowach AI
-- — łącznie z nowej rozmowy /rozmowa (talk_*) i lejka /sklep (bud_*).
-- SECURITY INVOKER: authenticated ma SELECT na talk_*/bud_* (RLS), anon nie przejdzie.
create or replace function lead_ai_reply_counts(p_lead_ids uuid[])
returns table(lead_id uuid, replies bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select x.lead_id, sum(x.c)::bigint as replies
  from (
    select ts.lead_id, count(tm.id) as c
    from talk_sessions ts
    join talk_messages tm on tm.session_id = ts.id and tm.role = 'user'
    where ts.lead_id = any(p_lead_ids)
    group by ts.lead_id
    union all
    select bs.lead_id, count(bm.id)
    from bud_sessions bs
    join bud_messages bm on bm.session_id = bs.id and bm.role = 'user'
    where bs.lead_id = any(p_lead_ids)
    group by bs.lead_id
  ) x
  group by x.lead_id
$$;

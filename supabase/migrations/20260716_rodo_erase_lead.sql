-- RODO: trwałe usunięcie wszystkich danych leada (prawo do bycia zapomnianym)
-- Funkcja usuwa dane po lead_id + e-mailu + telefonie ze wszystkich tabel CRM
-- (lejek bud_*/spar_*, maile, SMS-y, WhatsApp, tracking, oferty, audyt).
-- Gate: wyłącznie team_members (authenticated ≠ admin!) lub service_role.
-- p_dry_run=true (default) -> tylko raport liczności, ZERO usuwania.
-- p_suppress=true (default) -> e-mail ląduje w email_suppressions (reason=rodo_erasure),
--   żeby żaden cron/followup nie wysłał nic w przyszłości; false -> czyści też suppressions.
-- BLOKADY (bez p_force zwraca blocked=true, nic nie usuwa): opłacone zamówienia,
-- harmonogramy rat, workflowy, projekty wf2/wfa, opłacone sesje bud/spar
-- (obowiązki księgowe / aktywna umowa — decyzja ręczna).

create or replace function public.rodo_erase_lead(
  p_lead_id uuid,
  p_dry_run boolean default true,
  p_suppress boolean default true,
  p_force boolean default false
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead leads%rowtype;
  v_email text;
  v_phone9 text;
  v_bud_ids uuid[] := '{}';
  v_spar_ids uuid[] := '{}';
  v_contact_ids uuid[] := '{}';
  v_zwolnie_ids uuid[] := '{}';
  v_blockers text[] := '{}';
  v_counts jsonb := '{}'::jsonb;
  v_files text[] := '{}';
  n bigint;
begin
  if not (
    coalesce(auth.role(), '') = 'service_role'
    or exists (select 1 from team_members tm where tm.user_id = auth.uid())
    or session_user in ('postgres', 'supabase_admin')
  ) then
    raise exception 'Brak uprawnień — funkcja tylko dla team_members';
  end if;

  select * into v_lead from leads where id = p_lead_id;
  if not found then
    return jsonb_build_object('error', 'Lead nie istnieje');
  end if;

  v_email := nullif(lower(trim(coalesce(v_lead.email, ''))), '');
  v_phone9 := right(regexp_replace(coalesce(v_lead.phone, ''), '\D', '', 'g'), 9);
  if v_phone9 is null or length(v_phone9) < 9 then v_phone9 := null; end if;

  -- sesje lejków (po lead_id / e-mailu / telefonie)
  select coalesce(array_agg(id), '{}') into v_bud_ids from bud_sessions
    where lead_id = p_lead_id
       or (v_email is not null and lower(coalesce(email, '')) = v_email)
       or (v_phone9 is not null and right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 9) = v_phone9);
  select coalesce(array_agg(id), '{}') into v_spar_ids from spar_sessions
    where lead_id = p_lead_id
       or (v_email is not null and lower(coalesce(email, '')) = v_email)
       or (v_phone9 is not null and right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 9) = v_phone9);
  select coalesce(array_agg(id), '{}') into v_contact_ids from outreach_contacts
    where (v_email is not null and lower(coalesce(email, '')) = v_email)
       or (v_phone9 is not null and right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 9) = v_phone9);
  select coalesce(array_agg(id), '{}') into v_zwolnie_ids from zwolnie_leads
    where (v_email is not null and lower(coalesce(contact_email, '')) = v_email)
       or (v_phone9 is not null and right(regexp_replace(coalesce(contact_phone, ''), '\D', '', 'g'), 9) = v_phone9);

  -- blokady: dane objęte obowiązkiem księgowym / aktywną współpracą
  if exists (select 1 from orders where (lead_id = p_lead_id or (v_email is not null and lower(coalesce(customer_email, '')) = v_email)) and paid_at is not null) then
    v_blockers := v_blockers || 'opłacone zamówienia (orders)';
  end if;
  if exists (select 1 from payment_schedules where lead_id = p_lead_id) then
    v_blockers := v_blockers || 'harmonogram płatności (payment_schedules)';
  end if;
  if v_email is not null and exists (select 1 from workflows where lower(coalesce(customer_email, '')) = v_email) then
    v_blockers := v_blockers || 'workflow klienta (workflows)';
  end if;
  if exists (select 1 from wf2_projects where lead_id = p_lead_id or (v_email is not null and lower(coalesce(customer_email, '')) = v_email)) then
    v_blockers := v_blockers || 'projekt wspólnego biznesu (wf2_projects)';
  end if;
  if exists (select 1 from wfa_projects where lead_id = p_lead_id or (v_email is not null and lower(coalesce(customer_email, '')) = v_email)) then
    v_blockers := v_blockers || 'projekt aplikacji (wfa_projects)';
  end if;
  if exists (select 1 from bud_sessions where id = any(v_bud_ids) and (paid_at is not null or full_paid_at is not null)) then
    v_blockers := v_blockers || 'opłacona sesja /zbuduje (bud_sessions)';
  end if;
  if exists (select 1 from spar_sessions where id = any(v_spar_ids) and (paid_at is not null or full_paid_at is not null)) then
    v_blockers := v_blockers || 'opłacona sesja /stworze (spar_sessions)';
  end if;

  if array_length(v_blockers, 1) is not null and not p_force then
    return jsonb_build_object('blocked', true, 'blockers', to_jsonb(v_blockers));
  end if;

  -- pliki w Storage do ręcznego sprzątnięcia (raportowane, nie usuwane tutaj)
  select coalesce(array_agg(f), '{}') into v_files from (
    select file_path as f from bud_knowhow_items where file_path is not null and (lead_id = p_lead_id or session_id = any(v_bud_ids))
    union all
    select file_path from spar_knowhow_items where file_path is not null and (lead_id = p_lead_id or session_id = any(v_spar_ids))
    union all
    select storage_path from zwolnie_lead_attachments where lead_id = any(v_zwolnie_ids)
  ) q;

  -- liczności (raport — te same warunki co DELETE niżej)
  select count(*) into n from bud_messages where session_id = any(v_bud_ids); v_counts := v_counts || jsonb_build_object('bud_messages', n);
  select count(*) into n from bud_usage where session_id = any(v_bud_ids); v_counts := v_counts || jsonb_build_object('bud_usage', n);
  select count(*) into n from bud_reveals where session_id = any(v_bud_ids); v_counts := v_counts || jsonb_build_object('bud_reveals', n);
  select count(*) into n from bud_events where session_id = any(v_bud_ids); v_counts := v_counts || jsonb_build_object('bud_events', n);
  select count(*) into n from bud_short_links where session_id = any(v_bud_ids); v_counts := v_counts || jsonb_build_object('bud_short_links', n);
  select count(*) into n from bud_abandoned_emails where session_id = any(v_bud_ids); v_counts := v_counts || jsonb_build_object('bud_abandoned_emails', n);
  select count(*) into n from bud_feedback where session_id = any(v_bud_ids); v_counts := v_counts || jsonb_build_object('bud_feedback', n);
  select count(*) into n from bud_emails where session_id = any(v_bud_ids) or (v_email is not null and lower(coalesce(email, '')) = v_email); v_counts := v_counts || jsonb_build_object('bud_emails', n);
  select count(*) into n from bud_sms where session_id = any(v_bud_ids) or (v_phone9 is not null and right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 9) = v_phone9); v_counts := v_counts || jsonb_build_object('bud_sms', n);
  select count(*) into n from bud_knowhow_items where lead_id = p_lead_id or session_id = any(v_bud_ids); v_counts := v_counts || jsonb_build_object('bud_knowhow_items', n);
  select count(*) into n from bud_knowhow_summary where lead_id = p_lead_id or session_id = any(v_bud_ids); v_counts := v_counts || jsonb_build_object('bud_knowhow_summary', n);
  select count(*) into n from bud_sessions where id = any(v_bud_ids); v_counts := v_counts || jsonb_build_object('bud_sessions', n);

  select count(*) into n from spar_messages where session_id = any(v_spar_ids); v_counts := v_counts || jsonb_build_object('spar_messages', n);
  select count(*) into n from spar_usage where session_id = any(v_spar_ids); v_counts := v_counts || jsonb_build_object('spar_usage', n);
  select count(*) into n from spar_reveals where session_id = any(v_spar_ids); v_counts := v_counts || jsonb_build_object('spar_reveals', n);
  select count(*) into n from spar_short_links where session_id = any(v_spar_ids); v_counts := v_counts || jsonb_build_object('spar_short_links', n);
  select count(*) into n from spar_abandoned_emails where session_id = any(v_spar_ids); v_counts := v_counts || jsonb_build_object('spar_abandoned_emails', n);
  select count(*) into n from spar_feedback where session_id = any(v_spar_ids); v_counts := v_counts || jsonb_build_object('spar_feedback', n);
  select count(*) into n from spar_emails where session_id = any(v_spar_ids) or (v_email is not null and lower(coalesce(email, '')) = v_email); v_counts := v_counts || jsonb_build_object('spar_emails', n);
  select count(*) into n from spar_sms where session_id = any(v_spar_ids) or (v_phone9 is not null and right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 9) = v_phone9); v_counts := v_counts || jsonb_build_object('spar_sms', n);
  select count(*) into n from spar_knowhow_items where lead_id = p_lead_id or session_id = any(v_spar_ids); v_counts := v_counts || jsonb_build_object('spar_knowhow_items', n);
  select count(*) into n from spar_knowhow_summary where lead_id = p_lead_id or session_id = any(v_spar_ids); v_counts := v_counts || jsonb_build_object('spar_knowhow_summary', n);
  select count(*) into n from spar_sessions where id = any(v_spar_ids); v_counts := v_counts || jsonb_build_object('spar_sessions', n);

  select count(*) into n from email_messages where lead_id = p_lead_id or (v_email is not null and lower(coalesce(to_email, '')) = v_email); v_counts := v_counts || jsonb_build_object('email_messages', n);
  select count(*) into n from scheduled_emails where lead_id = p_lead_id; v_counts := v_counts || jsonb_build_object('scheduled_emails', n);
  select count(*) into n from whatsapp_messages where lead_id = p_lead_id or (v_phone9 is not null and right(regexp_replace(coalesce(phone_number, ''), '\D', '', 'g'), 9) = v_phone9); v_counts := v_counts || jsonb_build_object('whatsapp_messages', n);
  select count(*) into n from whatsapp_followups where lead_id = p_lead_id or (v_phone9 is not null and right(regexp_replace(coalesce(phone_number, ''), '\D', '', 'g'), 9) = v_phone9); v_counts := v_counts || jsonb_build_object('whatsapp_followups', n);
  select count(*) into n from followup_queue where lead_id = p_lead_id or (v_phone9 is not null and right(regexp_replace(coalesce(phone_number, ''), '\D', '', 'g'), 9) = v_phone9); v_counts := v_counts || jsonb_build_object('followup_queue', n);
  select count(*) into n from whatsapp_sync_status where (v_phone9 is not null and right(regexp_replace(coalesce(phone_number, ''), '\D', '', 'g'), 9) = v_phone9); v_counts := v_counts || jsonb_build_object('whatsapp_sync_status', n);
  select count(*) into n from calendar_events where lead_id = p_lead_id; v_counts := v_counts || jsonb_build_object('calendar_events', n);
  select count(*) into n from booking_links where lead_id = p_lead_id; v_counts := v_counts || jsonb_build_object('booking_links', n);
  select count(*) into n from client_offers where lead_id = p_lead_id; v_counts := v_counts || jsonb_build_object('client_offers', n);
  select count(*) into n from lead_activities where lead_id = p_lead_id; v_counts := v_counts || jsonb_build_object('lead_activities', n);
  select count(*) into n from lead_tracking where lead_id = p_lead_id; v_counts := v_counts || jsonb_build_object('lead_tracking', n);
  select count(*) into n from orders where (lead_id = p_lead_id or (v_email is not null and lower(coalesce(customer_email, '')) = v_email)) and paid_at is null; v_counts := v_counts || jsonb_build_object('orders_nieoplacone', n);
  select count(*) into n from outreach_sends where contact_id = any(v_contact_ids); v_counts := v_counts || jsonb_build_object('outreach_sends', n);
  select count(*) into n from outreach_contacts where id = any(v_contact_ids); v_counts := v_counts || jsonb_build_object('outreach_contacts', n);
  select count(*) into n from zwolnie_lead_attachments where lead_id = any(v_zwolnie_ids); v_counts := v_counts || jsonb_build_object('zwolnie_lead_attachments', n);
  select count(*) into n from zwolnie_leads where id = any(v_zwolnie_ids); v_counts := v_counts || jsonb_build_object('zwolnie_leads', n);
  select count(*) into n from client_knowledge where v_email is not null and lower(coalesce(customer_email, '')) = v_email; v_counts := v_counts || jsonb_build_object('client_knowledge', n);
  select count(*) into n from automation_executions where entity_id = p_lead_id or entity_id = any(v_bud_ids) or entity_id = any(v_spar_ids) or (v_email is not null and context::text ilike '%' || v_email || '%'); v_counts := v_counts || jsonb_build_object('automation_executions', n);
  select count(*) into n from audit_log where entity_id = p_lead_id or entity_id = any(v_bud_ids) or entity_id = any(v_spar_ids)
    or (v_email is not null and (lower(coalesce(entity_identifier, '')) = v_email or old_value::text ilike '%' || v_email || '%' or new_value::text ilike '%' || v_email || '%'));
  v_counts := v_counts || jsonb_build_object('audit_log', n);
  select count(*) into n from email_suppressions where v_email is not null and lower(email) = v_email; v_counts := v_counts || jsonb_build_object('email_suppressions_istniejace', n);
  v_counts := v_counts || jsonb_build_object('leads', 1);

  if p_dry_run then
    return jsonb_build_object(
      'dry_run', true,
      'lead_id', p_lead_id,
      'counts', v_counts,
      'storage_files', to_jsonb(v_files),
      'forced', p_force and array_length(v_blockers, 1) is not null,
      'blockers', to_jsonb(v_blockers)
    );
  end if;

  -- USUWANIE (dzieci przed rodzicami)
  delete from bud_messages where session_id = any(v_bud_ids);
  delete from bud_usage where session_id = any(v_bud_ids);
  delete from bud_reveals where session_id = any(v_bud_ids);
  delete from bud_events where session_id = any(v_bud_ids);
  delete from bud_short_links where session_id = any(v_bud_ids);
  delete from bud_abandoned_emails where session_id = any(v_bud_ids);
  delete from bud_feedback where session_id = any(v_bud_ids);
  delete from bud_emails where session_id = any(v_bud_ids) or (v_email is not null and lower(coalesce(email, '')) = v_email);
  delete from bud_sms where session_id = any(v_bud_ids) or (v_phone9 is not null and right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 9) = v_phone9);
  delete from bud_knowhow_items where lead_id = p_lead_id or session_id = any(v_bud_ids);
  delete from bud_knowhow_summary where lead_id = p_lead_id or session_id = any(v_bud_ids);
  delete from bud_sessions where id = any(v_bud_ids);

  delete from spar_messages where session_id = any(v_spar_ids);
  delete from spar_usage where session_id = any(v_spar_ids);
  delete from spar_reveals where session_id = any(v_spar_ids);
  delete from spar_short_links where session_id = any(v_spar_ids);
  delete from spar_abandoned_emails where session_id = any(v_spar_ids);
  delete from spar_feedback where session_id = any(v_spar_ids);
  delete from spar_emails where session_id = any(v_spar_ids) or (v_email is not null and lower(coalesce(email, '')) = v_email);
  delete from spar_sms where session_id = any(v_spar_ids) or (v_phone9 is not null and right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 9) = v_phone9);
  delete from spar_knowhow_items where lead_id = p_lead_id or session_id = any(v_spar_ids);
  delete from spar_knowhow_summary where lead_id = p_lead_id or session_id = any(v_spar_ids);
  delete from spar_sessions where id = any(v_spar_ids);

  delete from email_messages where lead_id = p_lead_id or (v_email is not null and lower(coalesce(to_email, '')) = v_email);
  delete from scheduled_emails where lead_id = p_lead_id;
  delete from whatsapp_messages where lead_id = p_lead_id or (v_phone9 is not null and right(regexp_replace(coalesce(phone_number, ''), '\D', '', 'g'), 9) = v_phone9);
  delete from whatsapp_followups where lead_id = p_lead_id or (v_phone9 is not null and right(regexp_replace(coalesce(phone_number, ''), '\D', '', 'g'), 9) = v_phone9);
  delete from followup_queue where lead_id = p_lead_id or (v_phone9 is not null and right(regexp_replace(coalesce(phone_number, ''), '\D', '', 'g'), 9) = v_phone9);
  delete from whatsapp_sync_status where (v_phone9 is not null and right(regexp_replace(coalesce(phone_number, ''), '\D', '', 'g'), 9) = v_phone9);
  delete from calendar_events where lead_id = p_lead_id;
  delete from booking_links where lead_id = p_lead_id;
  delete from client_offers where lead_id = p_lead_id;
  delete from lead_activities where lead_id = p_lead_id;
  delete from lead_tracking where lead_id = p_lead_id;
  delete from orders where (lead_id = p_lead_id or (v_email is not null and lower(coalesce(customer_email, '')) = v_email)) and paid_at is null;
  delete from outreach_sends where contact_id = any(v_contact_ids);
  delete from outreach_contacts where id = any(v_contact_ids);
  delete from zwolnie_lead_attachments where lead_id = any(v_zwolnie_ids);
  delete from zwolnie_leads where id = any(v_zwolnie_ids);
  delete from client_knowledge where v_email is not null and lower(coalesce(customer_email, '')) = v_email;
  delete from automation_executions where entity_id = p_lead_id or entity_id = any(v_bud_ids) or entity_id = any(v_spar_ids) or (v_email is not null and context::text ilike '%' || v_email || '%');
  delete from audit_log where entity_id = p_lead_id or entity_id = any(v_bud_ids) or entity_id = any(v_spar_ids)
    or (v_email is not null and (lower(coalesce(entity_identifier, '')) = v_email or old_value::text ilike '%' || v_email || '%' or new_value::text ilike '%' || v_email || '%'));

  if p_suppress then
    if v_email is not null and not exists (select 1 from email_suppressions where lower(email) = v_email) then
      insert into email_suppressions (email, reason, source) values (v_email, 'rodo_erasure', 'panel-rodo');
    end if;
  else
    delete from email_suppressions where v_email is not null and lower(email) = v_email;
  end if;

  delete from leads where id = p_lead_id;

  -- ślad wykonania BEZ danych osobowych (dowód realizacji żądania RODO)
  insert into audit_log (action_type, entity_type, entity_id, entity_identifier, performed_by, performed_by_name, metadata)
  values ('rodo_erase', 'lead', p_lead_id, '[dane usunięte — RODO]', auth.uid(),
          coalesce((select tm.name from team_members tm where tm.user_id = auth.uid()), 'system'),
          jsonb_build_object('counts', v_counts, 'suppressed', p_suppress, 'forced', p_force));

  return jsonb_build_object(
    'dry_run', false,
    'lead_id', p_lead_id,
    'counts', v_counts,
    'storage_files', to_jsonb(v_files),
    'suppressed', p_suppress
  );
end;
$$;

revoke all on function public.rodo_erase_lead(uuid, boolean, boolean, boolean) from public;
revoke all on function public.rodo_erase_lead(uuid, boolean, boolean, boolean) from anon;
grant execute on function public.rodo_erase_lead(uuid, boolean, boolean, boolean) to authenticated, service_role;

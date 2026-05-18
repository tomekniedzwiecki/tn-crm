-- ============================================================================
-- Anon SELECT na świeżo wstawione lead'y — niezbędne żeby PostgREST
-- mógł zwrócić id+token po INSERT (return=representation).
-- Window: 5 minut. Po tym czasie rekord niedostępny dla anon.
-- ============================================================================

create policy ze_leads_anon_select_recent on ze_leads
    for select to anon
    using (
        created_at > now() - interval '5 minutes'
        and source = 'zwolnie_form'
    );

-- Analogicznie dla ze_lead_attachments — anon musi móc odczytać
-- własną świeżą wpis (przy INSERT z .select)
create policy ze_lead_attachments_anon_select_recent on ze_lead_attachments
    for select to anon
    using (
        created_at > now() - interval '5 minutes'
        and uploaded_by_role = 'anon'
    );

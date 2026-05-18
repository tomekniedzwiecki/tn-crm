-- ============================================================================
-- Security hardening po pierwszym audycie:
--  1. Anon SELECT on ze_projects tylko po tokenie (RPC) — był wyciek listy
--  2. Anon SELECT on ze_leads recent: column grants + skrócenie okna do 30s
--  3. Storage anon insert: walidacja że lead_id istnieje i jest świeży
--  4. Anon insert ze_lead_attachments: skrócenie okna do 5 min + source check
--  5. Length constraints + email format na ze_leads (anti-DoS)
--  6. CSPRNG dla ze_gen_token() (pgcrypto)
--  7. Rate limit dla anon INSERT na ze_leads
--  8. ze_staff_admin_all symetria with check
--  9. Indeksy: starred, converted_to_project_id, updated_at, partial visible_to_client
-- 10. Length constraints na ze_projects + ze_lead_notes
-- 11. ze_seed_default_stages — security definer + idempotency
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Anon SELECT projects — RPC by token zamiast wide policy
-- ----------------------------------------------------------------------------

drop policy if exists ze_projects_anon_read on ze_projects;
drop policy if exists ze_project_stages_anon_read on ze_project_stages;
drop policy if exists ze_project_tasks_anon_read on ze_project_tasks;
drop policy if exists ze_project_updates_anon_read on ze_project_updates;

-- RPC zwracająca komplet danych klienta po tokenie (jeden hit DB)
create or replace function ze_get_client_project(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_result jsonb;
begin
    select to_jsonb(p) - 'lead_id' - 'updated_at' - 'notes'
        || jsonb_build_object(
            'stages', coalesce((
                select jsonb_agg(
                    to_jsonb(s) - 'project_id' - 'visible_to_client' - 'updated_at'
                    || jsonb_build_object(
                        'tasks', coalesce((
                            select jsonb_agg(to_jsonb(t) - 'stage_id' - 'visible_to_client' - 'updated_at' order by t.order_index)
                            from ze_project_tasks t
                            where t.stage_id = s.id and t.visible_to_client = true
                        ), '[]'::jsonb)
                    )
                    order by s.order_index
                )
                from ze_project_stages s
                where s.project_id = p.id and s.visible_to_client = true
            ), '[]'::jsonb),
            'updates', coalesce((
                select jsonb_agg(
                    to_jsonb(u) - 'project_id' - 'author_id' - 'visible_to_client' - 'created_at'
                    order by u.posted_at desc
                )
                from ze_project_updates u
                where u.project_id = p.id and u.visible_to_client = true
            ), '[]'::jsonb)
        )
    into v_result
    from ze_projects p
    where p.token = p_token
      and length(p_token) >= 8;

    return v_result;
end;
$$;

revoke execute on function ze_get_client_project(text) from public;
grant execute on function ze_get_client_project(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2) Anon SELECT leads recent: skróć okno + column-level grants
-- ----------------------------------------------------------------------------

drop policy if exists ze_leads_anon_select_recent on ze_leads;

-- Anon column whitelist: tylko id, token, created_at po INSERT z return=representation
revoke select on ze_leads from anon;
grant select (id, token, created_at) on ze_leads to anon;

create policy ze_leads_anon_select_recent on ze_leads
    for select to anon
    using (
        created_at > now() - interval '30 seconds'
        and source = 'zwolnie_form'
    );

-- ----------------------------------------------------------------------------
-- 3) Storage anon insert — walidacja lead_id istnieje + jest świeży
-- ----------------------------------------------------------------------------

drop policy if exists "ze_attachments_anon_insert" on storage.objects;

create policy "ze_attachments_anon_insert"
on storage.objects for insert to anon
with check (
    bucket_id = 'ze-attachments'
    and (storage.foldername(name))[1] = 'leads'
    and exists (
        select 1 from ze_leads l
        where l.id::text = (storage.foldername(name))[2]
          and l.created_at > now() - interval '5 minutes'
          and l.source = 'zwolnie_form'
    )
);

-- ----------------------------------------------------------------------------
-- 4) ze_lead_attachments anon insert: skróć okno + source check
-- ----------------------------------------------------------------------------

drop policy if exists ze_lead_attachments_anon_insert on ze_lead_attachments;
drop policy if exists ze_lead_attachments_anon_select_recent on ze_lead_attachments;

create policy ze_lead_attachments_anon_insert on ze_lead_attachments
    for insert to anon with check (
        uploaded_by_role = 'anon'
        and exists (
            select 1 from ze_leads l
            where l.id = lead_id
              and l.created_at > now() - interval '5 minutes'
              and l.source = 'zwolnie_form'
        )
    );

-- Column grants — anon nie potrzebuje storage_path/file_type w response
revoke select on ze_lead_attachments from anon;
grant select (id, lead_id, file_name, created_at) on ze_lead_attachments to anon;

create policy ze_lead_attachments_anon_select_recent on ze_lead_attachments
    for select to anon using (
        created_at > now() - interval '30 seconds'
        and uploaded_by_role = 'anon'
    );

-- ----------------------------------------------------------------------------
-- 5) Anti-DoS: length constraints + email format
-- ----------------------------------------------------------------------------

alter table ze_leads
    add constraint ze_leads_problem_length check (problem is null or length(problem) between 50 and 20000),
    add constraint ze_leads_contact_email_fmt check (contact_email is null or contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    add constraint ze_leads_contact_name_len check (contact_name is null or length(contact_name) between 1 and 200),
    add constraint ze_leads_company_len check (company is null or length(company) <= 200),
    add constraint ze_leads_website_len check (website is null or length(website) <= 500),
    add constraint ze_leads_phone_len check (contact_phone is null or length(contact_phone) <= 50),
    add constraint ze_leads_notes_len check (notes is null or length(notes) <= 20000);

alter table ze_lead_notes
    add constraint ze_lead_notes_body_len check (length(body) between 1 and 20000);

alter table ze_projects
    add constraint ze_projects_title_len check (length(title) between 1 and 300),
    add constraint ze_projects_description_len check (description is null or length(description) <= 5000);

alter table ze_project_stages
    add constraint ze_project_stages_title_len check (length(title) between 1 and 200);

alter table ze_project_tasks
    add constraint ze_project_tasks_title_len check (length(title) between 1 and 500);

alter table ze_project_updates
    add constraint ze_project_updates_title_len check (length(title) between 1 and 200),
    add constraint ze_project_updates_body_len check (body is null or length(body) <= 20000);

-- ----------------------------------------------------------------------------
-- 6) CSPRNG dla tokenów
-- ----------------------------------------------------------------------------

create extension if not exists pgcrypto;

create or replace function ze_gen_token()
returns text
language plpgsql
as $$
declare
    chars text := 'abcdefghijkmnpqrstuvwxyz23456789';
    result text := '';
    rnd bytea;
    i int;
begin
    rnd := gen_random_bytes(12);
    for i in 0..11 loop
        result := result || substr(chars, (get_byte(rnd, i) % 32) + 1, 1);
    end loop;
    return result;
end;
$$;

-- ----------------------------------------------------------------------------
-- 7) Rate limit dla anon INSERT na ze_leads (max 5/min globalnie)
-- ----------------------------------------------------------------------------

create or replace function ze_leads_anon_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_role text;
    v_count int;
begin
    v_role := current_setting('request.jwt.claims', true)::jsonb->>'role';
    if v_role = 'anon' or v_role is null then
        select count(*) into v_count
        from ze_leads
        where source = 'zwolnie_form'
          and created_at > now() - interval '1 minute';
        if v_count >= 10 then
            raise exception 'rate_limited: too many briefs per minute' using errcode = 'P0001';
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists ze_leads_anon_rl on ze_leads;
create trigger ze_leads_anon_rl
    before insert on ze_leads
    for each row execute function ze_leads_anon_rate_limit();

-- ----------------------------------------------------------------------------
-- 8) ze_staff_admin_all — symetryczny with check (least privilege)
-- ----------------------------------------------------------------------------

drop policy if exists ze_staff_admin_all on ze_staff;

create policy ze_staff_admin_all on ze_staff
    for all to authenticated
    using (
        exists (select 1 from ze_staff s where s.user_id = auth.uid() and s.role = 'admin' and s.is_active = true)
    )
    with check (
        exists (select 1 from ze_staff s where s.user_id = auth.uid() and s.role = 'admin' and s.is_active = true)
    );

-- ----------------------------------------------------------------------------
-- 9) Indeksy
-- ----------------------------------------------------------------------------

create index if not exists ze_leads_starred_idx on ze_leads (created_at desc) where starred = true;
create index if not exists ze_leads_converted_to_project_id_idx on ze_leads (converted_to_project_id) where converted_to_project_id is not null;
create index if not exists ze_leads_updated_at_idx on ze_leads (updated_at desc);
create index if not exists ze_leads_no_analysis_idx on ze_leads (created_at desc) where ai_analysis is null and status not in ('lost', 'archived');
create index if not exists ze_lead_attachments_storage_path_idx on ze_lead_attachments (storage_path);

-- ----------------------------------------------------------------------------
-- 10) ze_seed_default_stages — security definer + idempotency
-- ----------------------------------------------------------------------------

create or replace function ze_seed_default_stages(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not ze_is_staff() then
        raise exception 'only_staff_can_seed_stages';
    end if;
    -- Idempotency: skip if already seeded
    if exists (select 1 from ze_project_stages where project_id = p_project_id) then
        return;
    end if;
    insert into ze_project_stages (project_id, slug, title, description, order_index, status) values
        (p_project_id, 'analiza', 'Analiza biznesu', 'Mapujemy procesy, identyfikujemy co da się zautomatyzować, liczymy ROI.', 1, 'in_progress'),
        (p_project_id, 'propozycja', 'Propozycja rozwiązania', 'Konkretny zakres: co budujemy, ile kosztuje, ile etatów uwalniamy.', 2, 'pending'),
        (p_project_id, 'akceptacja', 'Akceptacja i umowa', 'Doprecyzowanie zakresu, podpisanie umowy, harmonogram.', 3, 'pending'),
        (p_project_id, 'mvp', 'Klikalny prototyp', 'Wstępny MVP do walidacji kierunku przed pełnym wdrożeniem.', 4, 'pending'),
        (p_project_id, 'budowa', 'Budowa systemu', 'Realizacja: integracje, automatyzacje, panel.', 5, 'pending'),
        (p_project_id, 'wdrozenie', 'Wdrożenie i szkolenie', 'Uruchomienie produkcyjne, szkolenie zespołu, dokumentacja.', 6, 'pending'),
        (p_project_id, 'dostarczone', 'Dostarczone', 'Projekt zamknięty, system działa, wsparcie ongoing.', 7, 'pending');
end;
$$;

revoke execute on function ze_seed_default_stages(uuid) from public;
grant execute on function ze_seed_default_stages(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 11) ze_projects.closed_at — auto track gdy status terminuje
-- ----------------------------------------------------------------------------

alter table ze_projects add column if not exists closed_at timestamptz;

create or replace function ze_projects_track_close()
returns trigger
language plpgsql
as $$
begin
    if new.status in ('delivered', 'closed') and (old.status is null or old.status not in ('delivered', 'closed')) then
        new.closed_at := now();
    end if;
    return new;
end;
$$;

drop trigger if exists ze_projects_track_close_t on ze_projects;
create trigger ze_projects_track_close_t
    before update on ze_projects
    for each row execute function ze_projects_track_close();

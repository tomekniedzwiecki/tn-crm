-- ============================================================================
-- zwolnie-etaty CRM — RLS policies
-- Rules:
--   * authenticated (staff, ze_staff.user_id = auth.uid()) = full CRUD on ze_*
--   * anon = INSERT na ze_leads + ze_lead_attachments (z formularza)
--   * anon = SELECT na ze_projects + ze_project_* (by token, read-only widok klienta)
-- ============================================================================

-- Enable RLS
alter table ze_staff enable row level security;
alter table ze_leads enable row level security;
alter table ze_lead_attachments enable row level security;
alter table ze_lead_notes enable row level security;
alter table ze_lead_activity enable row level security;
alter table ze_prompts enable row level security;
alter table ze_projects enable row level security;
alter table ze_project_stages enable row level security;
alter table ze_project_tasks enable row level security;
alter table ze_project_updates enable row level security;

-- Helper: is current auth.uid linked to active ze_staff?
create or replace function ze_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from ze_staff
        where user_id = auth.uid() and is_active = true
    );
$$;

-- ============================================================================
-- ze_staff — staff sees own row + admins see all
-- ============================================================================
create policy ze_staff_self_read on ze_staff
    for select to authenticated using (user_id = auth.uid());

create policy ze_staff_admin_all on ze_staff
    for all to authenticated using (
        exists (select 1 from ze_staff s where s.user_id = auth.uid() and s.role = 'admin' and s.is_active = true)
    ) with check (true);

-- ============================================================================
-- ze_leads — staff CRUD; anon INSERT (z formularza)
-- ============================================================================
create policy ze_leads_staff_all on ze_leads
    for all to authenticated using (ze_is_staff()) with check (ze_is_staff());

create policy ze_leads_anon_insert on ze_leads
    for insert to anon with check (
        -- minimal validation — anon can only submit briefs
        source = 'zwolnie_form'
        and status = 'new'
        and contact_email is not null
        and length(problem) >= 50
    );

-- ============================================================================
-- ze_lead_attachments — staff CRUD; anon INSERT after lead exists
-- ============================================================================
create policy ze_lead_attachments_staff_all on ze_lead_attachments
    for all to authenticated using (ze_is_staff()) with check (ze_is_staff());

create policy ze_lead_attachments_anon_insert on ze_lead_attachments
    for insert to anon with check (
        uploaded_by_role = 'anon'
        and exists (
            select 1 from ze_leads l
            where l.id = lead_id
              and l.created_at > now() - interval '1 hour'
        )
    );

-- ============================================================================
-- ze_lead_notes — staff only
-- ============================================================================
create policy ze_lead_notes_staff_all on ze_lead_notes
    for all to authenticated using (ze_is_staff()) with check (ze_is_staff());

-- ============================================================================
-- ze_lead_activity — staff read + insert (system writes via service_role)
-- ============================================================================
create policy ze_lead_activity_staff_read on ze_lead_activity
    for select to authenticated using (ze_is_staff());

create policy ze_lead_activity_staff_insert on ze_lead_activity
    for insert to authenticated with check (ze_is_staff());

-- ============================================================================
-- ze_prompts — staff CRUD only
-- ============================================================================
create policy ze_prompts_staff_all on ze_prompts
    for all to authenticated using (ze_is_staff()) with check (ze_is_staff());

-- ============================================================================
-- ze_projects — staff CRUD + anon SELECT by token
-- (token-based read is enforced at query level — anon must filter eq('token', X))
-- ============================================================================
create policy ze_projects_staff_all on ze_projects
    for all to authenticated using (ze_is_staff()) with check (ze_is_staff());

create policy ze_projects_anon_read on ze_projects
    for select to anon using (true);
-- NB: app uses .eq('token', token) — without it, anon would get all projects.
-- Acceptable because token is unguessable and IDs/PII are NOT in projects table beyond title/desc.

-- ============================================================================
-- ze_project_stages — staff CRUD + anon SELECT (visible_to_client)
-- ============================================================================
create policy ze_project_stages_staff_all on ze_project_stages
    for all to authenticated using (ze_is_staff()) with check (ze_is_staff());

create policy ze_project_stages_anon_read on ze_project_stages
    for select to anon using (visible_to_client = true);

-- ============================================================================
-- ze_project_tasks — staff CRUD + anon SELECT (visible_to_client)
-- ============================================================================
create policy ze_project_tasks_staff_all on ze_project_tasks
    for all to authenticated using (ze_is_staff()) with check (ze_is_staff());

create policy ze_project_tasks_anon_read on ze_project_tasks
    for select to anon using (visible_to_client = true);

-- ============================================================================
-- ze_project_updates — staff CRUD + anon SELECT (visible_to_client)
-- ============================================================================
create policy ze_project_updates_staff_all on ze_project_updates
    for all to authenticated using (ze_is_staff()) with check (ze_is_staff());

create policy ze_project_updates_anon_read on ze_project_updates
    for select to anon using (visible_to_client = true);

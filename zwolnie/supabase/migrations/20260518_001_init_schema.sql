-- ============================================================================
-- zwolnie-etaty CRM — initial schema
-- Prefix: ze_*
-- Created: 2026-05-18
-- ============================================================================

-- Helper: short random token for leads/projects (URL-safe, 12 chars)
create or replace function ze_gen_token()
returns text
language plpgsql
as $$
declare
    chars text := 'abcdefghijkmnpqrstuvwxyz23456789';
    result text := '';
    i int;
begin
    for i in 1..12 loop
        result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
    end loop;
    return result;
end;
$$;

-- Helper: updated_at trigger
create or replace function ze_set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

-- ============================================================================
-- ze_staff — admins (Tomek; tabela rozbudowywalna)
-- ============================================================================
create table ze_staff (
    id uuid primary key default gen_random_uuid(),
    user_id uuid unique references auth.users(id) on delete cascade,
    email text not null unique,
    name text,
    role text not null default 'admin' check (role in ('admin', 'agent', 'viewer')),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger ze_staff_updated_at before update on ze_staff
    for each row execute function ze_set_updated_at();

-- ============================================================================
-- ze_leads — main lead table
-- ============================================================================
create table ze_leads (
    id uuid primary key default gen_random_uuid(),
    token text not null unique default ze_gen_token(),
    -- pipeline status
    status text not null default 'new' check (status in (
        'new', 'analyzing', 'analyzed', 'proposal_sent', 'negotiation', 'won', 'lost', 'archived'
    )),
    source text not null default 'zwolnie_form',
    -- contact
    contact_name text,
    contact_email text,
    contact_phone text,
    -- company
    company text,
    website text,
    industry text,
    team_size text,
    payroll text,
    budget text,
    problem text,
    -- AI artifacts (manually pasted by Tomek from Claude Code)
    ai_analysis jsonb,
    ai_analysis_published_at timestamptz,
    mvp_html text,
    mvp_published_at timestamptz,
    -- pipeline ops
    lead_value numeric(12,2),
    assigned_to uuid references ze_staff(id) on delete set null,
    notes text,
    last_contacted_at timestamptz,
    -- conversion
    converted_to_project_id uuid,
    -- metadata
    starred boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index ze_leads_status_idx on ze_leads (status);
create index ze_leads_created_at_idx on ze_leads (created_at desc);
create index ze_leads_assigned_to_idx on ze_leads (assigned_to);
create index ze_leads_token_idx on ze_leads (token);

create trigger ze_leads_updated_at before update on ze_leads
    for each row execute function ze_set_updated_at();

-- ============================================================================
-- ze_lead_attachments — załączniki z briefa
-- ============================================================================
create table ze_lead_attachments (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null references ze_leads(id) on delete cascade,
    file_name text not null,
    file_type text,
    file_size bigint,
    storage_path text not null,
    uploaded_by_role text not null default 'anon' check (uploaded_by_role in ('anon', 'staff')),
    created_at timestamptz not null default now()
);

create index ze_lead_attachments_lead_id_idx on ze_lead_attachments (lead_id);

-- ============================================================================
-- ze_lead_notes — notatki w panelu (Tomek)
-- ============================================================================
create table ze_lead_notes (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null references ze_leads(id) on delete cascade,
    author_id uuid references ze_staff(id) on delete set null,
    body text not null,
    created_at timestamptz not null default now()
);

create index ze_lead_notes_lead_id_idx on ze_lead_notes (lead_id, created_at desc);

-- ============================================================================
-- ze_lead_activity — audit log
-- ============================================================================
create table ze_lead_activity (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null references ze_leads(id) on delete cascade,
    actor_id uuid references ze_staff(id) on delete set null,
    action text not null,
    details jsonb,
    created_at timestamptz not null default now()
);

create index ze_lead_activity_lead_id_idx on ze_lead_activity (lead_id, created_at desc);

-- ============================================================================
-- ze_prompts — prompt templates do AI (edytowane w panelu, kopiowane do Claude Code)
-- ============================================================================
create table ze_prompts (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    title text not null,
    description text,
    template text not null,
    -- variables available in template: {{contact_name}}, {{company}}, {{industry}}, {{team_size}}, {{payroll}}, {{budget}}, {{problem}}, {{website}}
    expected_output text,
    -- 'json' | 'html' | 'markdown' — hint dla Tomka czego oczekiwać po wklejeniu w Claude Code
    output_format text not null default 'markdown',
    updated_by uuid references ze_staff(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger ze_prompts_updated_at before update on ze_prompts
    for each row execute function ze_set_updated_at();

-- ============================================================================
-- ze_projects — projekty po WON
-- ============================================================================
create table ze_projects (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null unique references ze_leads(id) on delete restrict,
    token text not null unique default ze_gen_token(),
    status text not null default 'planning' check (status in (
        'planning', 'building', 'delivered', 'on_hold', 'closed'
    )),
    title text not null,
    description text,
    -- snapshot of clickable MVP at conversion time
    mvp_html text,
    mvp_published_at timestamptz,
    -- timeline
    kickoff_at timestamptz,
    delivery_at timestamptz,
    -- meta
    notes text,
    starred boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index ze_projects_status_idx on ze_projects (status);
create index ze_projects_token_idx on ze_projects (token);

create trigger ze_projects_updated_at before update on ze_projects
    for each row execute function ze_set_updated_at();

-- FK from leads.converted_to_project_id (set after creating ze_projects)
alter table ze_leads
    add constraint ze_leads_converted_to_project_fk
    foreign key (converted_to_project_id) references ze_projects(id) on delete set null;

-- ============================================================================
-- ze_project_stages — etapy widoczne dla klienta
-- ============================================================================
create table ze_project_stages (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references ze_projects(id) on delete cascade,
    slug text not null,
    title text not null,
    description text,
    status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'skipped')),
    order_index int not null default 0,
    started_at timestamptz,
    completed_at timestamptz,
    notes text,
    visible_to_client boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (project_id, slug)
);

create index ze_project_stages_project_id_idx on ze_project_stages (project_id, order_index);

create trigger ze_project_stages_updated_at before update on ze_project_stages
    for each row execute function ze_set_updated_at();

-- ============================================================================
-- ze_project_tasks — zadania w stage'ach
-- ============================================================================
create table ze_project_tasks (
    id uuid primary key default gen_random_uuid(),
    stage_id uuid not null references ze_project_stages(id) on delete cascade,
    title text not null,
    description text,
    completed boolean not null default false,
    completed_at timestamptz,
    order_index int not null default 0,
    visible_to_client boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index ze_project_tasks_stage_id_idx on ze_project_tasks (stage_id, order_index);

create trigger ze_project_tasks_updated_at before update on ze_project_tasks
    for each row execute function ze_set_updated_at();

-- ============================================================================
-- ze_project_updates — changelog widoczny dla klienta
-- ============================================================================
create table ze_project_updates (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references ze_projects(id) on delete cascade,
    author_id uuid references ze_staff(id) on delete set null,
    title text not null,
    body text,
    posted_at timestamptz not null default now(),
    visible_to_client boolean not null default true,
    created_at timestamptz not null default now()
);

create index ze_project_updates_project_id_idx on ze_project_updates (project_id, posted_at desc);

-- ============================================================================
-- Default stage template helper — wywołane przy konwersji lead→project
-- ============================================================================
create or replace function ze_seed_default_stages(p_project_id uuid)
returns void
language plpgsql
as $$
begin
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

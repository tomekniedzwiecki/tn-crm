-- ============================================================================
-- Status tracking: kiedy lead wszedł w obecny status (dla urgency badge w UI)
-- ============================================================================

alter table ze_leads add column if not exists status_changed_at timestamptz not null default now();

-- Trigger: aktualizuj status_changed_at gdy status się zmienia
create or replace function ze_leads_track_status_change()
returns trigger
language plpgsql
as $$
begin
    if tg_op = 'UPDATE' and new.status is distinct from old.status then
        new.status_changed_at := now();
    end if;
    return new;
end;
$$;

drop trigger if exists ze_leads_track_status on ze_leads;
create trigger ze_leads_track_status
    before update on ze_leads
    for each row execute function ze_leads_track_status_change();

-- Backfill: dla istniejących wierszy, ustaw status_changed_at na last activity 'status_changed' lub created_at
update ze_leads l
set status_changed_at = coalesce(
    (select max(a.created_at) from ze_lead_activity a where a.lead_id = l.id and a.action = 'status_changed'),
    l.created_at
);

create index if not exists ze_leads_status_changed_idx on ze_leads (status_changed_at desc);

-- =============================================
-- DROP UNIQUE constraint na automation_executions
-- =============================================
-- UNIQUE (flow_id, entity_type, entity_id) blokowal INSERT drugiej execution
-- dla flow z allow_repeat=true (admin cofa wielokrotnie aktywacje TakeDrop,
-- klient ponownie sklada legal_data, etc).
--
-- Dedupe przenosimy do logiki automation-trigger:
--   - flow.allow_repeat = false  -> pre-SELECT, skip jesli execution istnieje
--   - flow.allow_repeat = true   -> plain INSERT zawsze

ALTER TABLE automation_executions
DROP CONSTRAINT IF EXISTS automation_executions_flow_id_entity_type_entity_id_key;

-- Indeks zostawiamy (juz bez UNIQUE) bo query dedupe sie po tym filtruje.
CREATE INDEX IF NOT EXISTS automation_executions_flow_entity_idx
ON automation_executions (flow_id, entity_type, entity_id);

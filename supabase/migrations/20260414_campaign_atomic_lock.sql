-- Atomic lock for campaign pipeline — prevents double Manus task creation
-- Also resets stale data when re-running

CREATE OR REPLACE FUNCTION acquire_campaign_lock(p_workflow_id uuid)
RETURNS TABLE (acquired boolean, existing_task_id text, existing_status text) AS $$
DECLARE
  v_stale_threshold timestamptz := NOW() - interval '30 minutes';
  v_rows_affected int;
BEGIN
  -- Try atomic UPDATE — only if not currently running (or running but stale >30min)
  UPDATE workflow_ads
  SET
    campaign_pipeline_status = 'running',
    campaign_pipeline_step = 'manus_full_starting',
    campaign_pipeline_started_at = NOW(),
    campaign_pipeline_completed_at = NULL,
    -- Reset all old output for clean re-run
    competitor_research = NULL,
    competitor_research_at = NULL,
    competitor_research_task_id = NULL,
    competitor_research_status = 'idle',
    ad_copies = NULL,
    ad_copies_generated_at = NULL,
    ad_creatives = NULL,
    ad_creatives_generated_at = NULL,
    manus_full_task_id = NULL,
    manus_full_completed_at = NULL
  WHERE workflow_ads.workflow_id = p_workflow_id
    AND (
      workflow_ads.campaign_pipeline_status IS NULL
      OR workflow_ads.campaign_pipeline_status != 'running'
      OR workflow_ads.campaign_pipeline_started_at < v_stale_threshold
    );

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  IF v_rows_affected > 0 THEN
    -- Lock acquired via update
    RETURN QUERY SELECT true, NULL::text, 'running'::text;
    RETURN;
  END IF;

  -- No row updated — either row doesn't exist yet, or it's currently running
  -- Check which case
  IF EXISTS (SELECT 1 FROM workflow_ads WHERE workflow_id = p_workflow_id) THEN
    -- Row exists and is running (fresh) — return existing task_id
    RETURN QUERY
    SELECT false,
           workflow_ads.manus_full_task_id,
           workflow_ads.campaign_pipeline_status
    FROM workflow_ads
    WHERE workflow_ads.workflow_id = p_workflow_id
    LIMIT 1;
    RETURN;
  END IF;

  -- Row doesn't exist — try to insert (race-safe via unique constraint)
  BEGIN
    INSERT INTO workflow_ads (
      workflow_id, is_active, activated_at,
      campaign_pipeline_status, campaign_pipeline_step, campaign_pipeline_started_at
    ) VALUES (
      p_workflow_id, true, NOW(),
      'running', 'manus_full_starting', NOW()
    );
    RETURN QUERY SELECT true, NULL::text, 'running'::text;
  EXCEPTION WHEN unique_violation THEN
    -- Concurrent insert won the race — return their task_id
    RETURN QUERY
    SELECT false,
           workflow_ads.manus_full_task_id,
           workflow_ads.campaign_pipeline_status
    FROM workflow_ads
    WHERE workflow_ads.workflow_id = p_workflow_id
    LIMIT 1;
  END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION acquire_campaign_lock IS 'Atomic lock for campaign pipeline. Returns acquired=true if caller should proceed with Manus task creation. Also resets stale output data when re-running.';

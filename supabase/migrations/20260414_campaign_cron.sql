-- Add include_creatives preference for pipeline
ALTER TABLE workflow_ads
ADD COLUMN IF NOT EXISTS campaign_pipeline_include_creatives BOOLEAN DEFAULT TRUE;

-- Cron: check campaign pipeline progress every 2 minutes
SELECT cron.schedule(
  'campaign-check-progress',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/campaign-check-progress',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

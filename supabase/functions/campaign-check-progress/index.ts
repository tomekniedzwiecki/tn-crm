import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * CRON: Sprawdza oba typy pending pipelines:
 *  A) manus_full_task_id — pełna kampania przez Manusa (research + copy + grafiki w jednym task)
 *  B) competitor_research_task_id — legacy flow (tylko research przez Manusa)
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    if (!MANUS_API_KEY) return err('No MANUS_API_KEY', 500)

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // A) FULL MANUS — research + copy + creatives w jednym task
    const { data: fullPending } = await supabase
      .from('workflow_ads')
      .select('workflow_id, manus_full_task_id, campaign_pipeline_started_at')
      .eq('campaign_pipeline_status', 'running')
      .eq('campaign_pipeline_step', 'manus_full')
      .not('manus_full_task_id', 'is', null)

    // B) LEGACY — research only
    const { data: researchPending } = await supabase
      .from('workflow_ads')
      .select('workflow_id, competitor_research_task_id, campaign_pipeline_started_at, campaign_pipeline_include_creatives')
      .eq('campaign_pipeline_status', 'running')
      .eq('campaign_pipeline_step', 'research')
      .not('competitor_research_task_id', 'is', null)

    let fullCompleted = 0
    let legacyCompleted = 0

    // ===== A) FULL MANUS =====
    for (const row of fullPending || []) {
      try {
        if (await checkTimeout(supabase, row)) continue
        const done = await handleFullManusTask(supabase, MANUS_API_KEY, SUPABASE_URL, row.workflow_id, row.manus_full_task_id)
        if (done) fullCompleted++
      } catch (e) {
        console.error(`[full] ${row.workflow_id}:`, e.message)
      }
    }

    // ===== B) LEGACY RESEARCH =====
    for (const row of researchPending || []) {
      try {
        if (await checkTimeout(supabase, row)) continue
        const done = await handleLegacyResearchTask(supabase, MANUS_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, row)
        if (done) legacyCompleted++
      } catch (e) {
        console.error(`[legacy] ${row.workflow_id}:`, e.message)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      full_checked: fullPending?.length || 0,
      full_completed: fullCompleted,
      legacy_checked: researchPending?.length || 0,
      legacy_completed: legacyCompleted
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('[campaign-check] Fatal:', error)
    return err(error.message, 500)
  }
})

function err(msg: string, status = 500) {
  return new Response(JSON.stringify({ success: false, error: msg }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

async function checkTimeout(supabase: any, row: any): Promise<boolean> {
  const startedAt = new Date(row.campaign_pipeline_started_at).getTime()
  if (Date.now() - startedAt > 30 * 60 * 1000) {
    console.log(`[timeout] ${row.workflow_id}`)
    await supabase.from('workflow_ads').update({
      campaign_pipeline_status: 'failed',
      campaign_pipeline_step: 'timeout'
    }).eq('workflow_id', row.workflow_id)
    return true
  }
  return false
}

// ===== FULL MANUS HANDLER =====

async function handleFullManusTask(supabase: any, apiKey: string, supabaseUrl: string, workflowId: string, taskId: string): Promise<boolean> {
  const headers = { 'x-manus-api-key': apiKey, 'Content-Type': 'application/json' }

  // Status
  const detailRes = await fetch(`https://api.manus.ai/v2/task.detail?task_id=${taskId}`, { headers })
  const detail = await detailRes.json()
  if (!detailRes.ok || !detail.ok) {
    if (detail?.error?.code === 'not_found') {
      await supabase.from('workflow_ads').update({
        campaign_pipeline_status: 'failed',
        campaign_pipeline_step: 'task_expired'
      }).eq('workflow_id', workflowId)
    }
    return false
  }

  const task = detail.task || detail
  if (!['completed', 'done', 'stopped'].includes(task.status)) return false

  console.log(`[full] Manus task done for ${workflowId}, fetching messages + attachments`)

  // Pobierz wszystkie wiadomości
  const msgRes = await fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}&limit=100`, { headers })
  const msgData = await msgRes.json()
  const messages = msgData.messages || []

  // Zbierz wszystkie attachments (obrazy + pliki)
  const allAttachments: any[] = []
  let lastAssistantText = ''

  for (const m of messages) {
    if (m.type !== 'assistant_message') continue
    const am = m.assistant_message
    if (typeof am === 'string') {
      lastAssistantText = am
      continue
    }
    if (typeof am === 'object') {
      lastAssistantText = am.content || am.text || lastAssistantText
      if (am.attachments) {
        for (const a of am.attachments) {
          allAttachments.push(a)
        }
      }
    }
  }

  const images = allAttachments.filter((a: any) => a.type === 'image')
  const jsonFiles = allAttachments.filter((a: any) => a.type === 'file' && a.content_type === 'application/json')

  console.log(`[full] ${workflowId}: ${images.length} images, ${jsonFiles.length} JSON files`)

  // === 1. Parsuj JSON z campaign data (research + copy) ===
  let campaignData: any = null
  if (jsonFiles.length > 0) {
    try {
      const jsonRes = await fetch(jsonFiles[0].url)
      if (jsonRes.ok) campaignData = await jsonRes.json()
    } catch (e) {
      console.error('[full] JSON fetch failed:', e.message)
    }
  }
  // Fallback: szukaj JSON w tekście wiadomości
  if (!campaignData) {
    for (const m of [...messages].reverse()) {
      if (m.type !== 'assistant_message') continue
      const am = m.assistant_message
      const txt = typeof am === 'string' ? am : (am?.content || am?.text || '')
      if (txt.includes('"research"') || txt.includes('"copy"')) {
        try {
          const jsonMatch = txt.match(/\{[\s\S]*\}/)
          if (jsonMatch) { campaignData = JSON.parse(jsonMatch[0]); break }
        } catch {}
      }
    }
  }

  // === 2. Pobierz obrazy i uploaduj do Supabase Storage ===
  const creatives: any[] = []
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    try {
      const imgRes = await fetch(img.url)
      if (!imgRes.ok) { console.error(`[full] Image ${i} fetch failed: ${imgRes.status}`); continue }
      const buf = await imgRes.arrayBuffer()
      const ext = img.content_type?.includes('png') ? 'png' : 'jpg'
      const filename = `ai-generated/${workflowId}/manus_${Date.now()}_${i}.${ext}`
      const { error: upErr } = await supabase.storage.from('attachments').upload(filename, buf, {
        contentType: img.content_type || 'image/png',
        upsert: false
      })
      if (upErr) { console.error(`[full] Upload ${i} failed:`, upErr.message); continue }
      const { data: pub } = supabase.storage.from('attachments').getPublicUrl(filename)
      if (pub?.publicUrl) {
        // Wyciągnij angle z nazwy pliku: ad_1_speed.png -> speed
        const angleMatch = img.filename?.match(/ad_\d+_([a-z_]+)\.png/i)
        const angle = angleMatch ? angleMatch[1] : `ad_${i + 1}`
        creatives.push({
          type: angle,
          url: pub.publicUrl,
          filename: img.filename,
          generated_at: new Date().toISOString()
        })
      }
    } catch (e) {
      console.error(`[full] Image ${i} error:`, e.message)
    }
  }

  // === 3. Zapisz wszystko do bazy ===
  // Sprawdź czy Manus realnie coś zrobił — inaczej oznacz jako failed
  const hasRealOutput = !!campaignData?.copy || !!campaignData?.research || creatives.length > 0
  const finalStatus = hasRealOutput ? 'completed' : 'failed'
  const finalStep = hasRealOutput ? 'done' : 'no_output'

  const updates: any = {
    campaign_pipeline_status: finalStatus,
    campaign_pipeline_step: finalStep,
    campaign_pipeline_completed_at: new Date().toISOString(),
    manus_full_completed_at: new Date().toISOString()
  }

  if (campaignData?.research) {
    updates.competitor_research = campaignData.research
    updates.competitor_research_at = new Date().toISOString()
    updates.competitor_research_status = 'completed'
  }
  if (campaignData?.copy) {
    updates.ad_copies = campaignData.copy
    updates.ad_copies_generated_at = new Date().toISOString()
  }
  if (creatives.length > 0) {
    updates.ad_creatives = creatives
    updates.ad_creatives_generated_at = new Date().toISOString()
  }

  if (!hasRealOutput) {
    console.warn(`[full] ${workflowId} — Manus task stopped with NO output (copy/research/creatives all empty), marked as failed`)
  }

  await supabase.from('workflow_ads').update(updates).eq('workflow_id', workflowId)

  console.log(`[full] ${workflowId} done: research=${!!campaignData?.research}, copy=${!!campaignData?.copy}, creatives=${creatives.length}`)
  return true
}

// ===== LEGACY HANDLER =====

async function handleLegacyResearchTask(supabase: any, apiKey: string, supabaseUrl: string, serviceKey: string, row: any): Promise<boolean> {
  const headers = { 'x-manus-api-key': apiKey, 'Content-Type': 'application/json' }
  const taskId = row.competitor_research_task_id

  const detailRes = await fetch(`https://api.manus.ai/v2/task.detail?task_id=${taskId}`, { headers })
  const detailData = await detailRes.json()
  if (!detailRes.ok || !detailData.ok) {
    if (detailData?.error?.code === 'not_found') {
      await supabase.from('workflow_ads').update({
        competitor_research_status: 'expired',
        campaign_pipeline_status: 'failed',
        campaign_pipeline_step: 'error'
      }).eq('workflow_id', row.workflow_id)
    }
    return false
  }

  const task = detailData.task || detailData
  if (!['completed', 'done', 'stopped'].includes(task.status)) return false

  const msgRes = await fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}&limit=50`, { headers })
  const msgData = await msgRes.json()
  const messages = msgData.messages || []

  let result = ''
  for (const msg of [...messages].reverse()) {
    if (msg.type !== 'assistant_message') continue
    const content = typeof msg.assistant_message === 'string' ? msg.assistant_message
      : msg.assistant_message?.content || msg.assistant_message?.text || ''
    if (content.includes('{') && (content.includes('"competitors"') || content.includes('"gaps"'))) {
      result = content
      break
    }
  }

  let researchData = null
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (jsonMatch) researchData = JSON.parse(jsonMatch[0])
  } catch {}

  await supabase.from('workflow_ads').update({
    competitor_research: researchData || { raw_result: result?.substring(0, 2000), parse_error: true },
    competitor_research_at: new Date().toISOString(),
    competitor_research_status: 'completed'
  }).eq('workflow_id', row.workflow_id)

  // Continue legacy pipeline (copy + creatives via Gemini)
  await fetch(`${supabaseUrl}/functions/v1/generate-campaign-batch`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflow_id: row.workflow_id,
      include_creatives: row.campaign_pipeline_include_creatives !== false,
      continue_pipeline: true
    })
  })

  return true
}

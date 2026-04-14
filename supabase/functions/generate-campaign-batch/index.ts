import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const { workflow_id, include_creatives = true } = await req.json()

    if (!workflow_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'workflow_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[campaign-batch] Starting for workflow ${workflow_id}, creatives: ${include_creatives}`)

    // Oznacz że pipeline jest w toku
    await upsertAds(supabase, workflow_id, {
      campaign_pipeline_status: 'running',
      campaign_pipeline_started_at: new Date().toISOString(),
      campaign_pipeline_step: 'research'
    })

    // ===== Pobierz dane workflow =====
    const [brandingRes, productsRes, workflowRes] = await Promise.all([
      supabase.from('workflow_branding').select('type, value').eq('workflow_id', workflow_id).eq('type', 'brand_info'),
      supabase.from('workflow_products').select('name, description, image_url').eq('workflow_id', workflow_id),
      supabase.from('workflows').select('id, offer_name, landing_page_url').eq('id', workflow_id).single()
    ])

    const brandInfo = brandingRes.data?.[0]
    let brandVal: any = {}
    if (brandInfo?.value) {
      brandVal = typeof brandInfo.value === 'string' ? JSON.parse(brandInfo.value) : brandInfo.value
    }
    const product = productsRes.data?.[0] || {} as any
    const landingUrl = workflowRes.data?.landing_page_url || ''
    const brandName = brandVal.name || product.name || ''
    const productName = product.name || brandVal.name || ''
    const productDescription = product.description || brandVal.description || ''

    // ===== STEP 1: RESEARCH =====
    // Sprawdź czy research już jest
    const { data: existingAds } = await supabase
      .from('workflow_ads')
      .select('competitor_research')
      .eq('workflow_id', workflow_id)
      .maybeSingle()

    let researchData = existingAds?.competitor_research
    const hasValidResearch = researchData && !researchData.parse_error && researchData.competitors?.length

    if (!hasValidResearch && MANUS_API_KEY) {
      console.log('[campaign-batch] Starting Manus research...')
      await upsertAds(supabase, workflow_id, { campaign_pipeline_step: 'research' })

      try {
        researchData = await runManusResearch(MANUS_API_KEY, supabase, workflow_id, productName, productDescription, brandVal.description, brandName)
      } catch (err) {
        console.error('[campaign-batch] Research failed:', err.message)
        // Continue without research — copy will still work
      }
    } else {
      console.log('[campaign-batch] Using existing research')
    }

    // ===== STEP 2: COPY =====
    console.log('[campaign-batch] Generating ad copy...')
    await upsertAds(supabase, workflow_id, { campaign_pipeline_step: 'copy' })

    try {
      await generateCopy(ANTHROPIC_API_KEY!, supabase, workflow_id, brandVal, product, researchData, landingUrl)
    } catch (err) {
      console.error('[campaign-batch] Copy generation failed:', err.message)
    }

    // ===== STEP 3: CREATIVES =====
    if (include_creatives) {
      console.log('[campaign-batch] Generating creatives...')
      await upsertAds(supabase, workflow_id, { campaign_pipeline_step: 'creatives' })

      try {
        await generateCreatives(supabase, SUPABASE_URL!, workflow_id, productName, productDescription, product.image_url)
      } catch (err) {
        console.error('[campaign-batch] Creatives generation failed:', err.message)
      }
    }

    // ===== DONE =====
    await upsertAds(supabase, workflow_id, {
      campaign_pipeline_status: 'completed',
      campaign_pipeline_step: 'done',
      campaign_pipeline_completed_at: new Date().toISOString()
    })

    console.log('[campaign-batch] Pipeline completed!')

    return new Response(
      JSON.stringify({ success: true, status: 'completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[campaign-batch] Fatal error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ===== HELPERS =====

async function upsertAds(supabase: any, workflowId: string, fields: any) {
  const { data } = await supabase
    .from('workflow_ads')
    .update(fields)
    .eq('workflow_id', workflowId)
    .select()

  if (!data?.length) {
    await supabase
      .from('workflow_ads')
      .insert({ workflow_id: workflowId, is_active: true, activated_at: new Date().toISOString(), ...fields })
  }
}

// ===== MANUS RESEARCH =====

async function runManusResearch(apiKey: string, supabase: any, workflowId: string, productName: string, productDescription: string, brandDescription: string, brandName: string): Promise<any> {
  const category = productName || brandName || 'produkt'

  const instruction = `
Przeszukaj Facebook Ad Library (https://www.facebook.com/ads/library/) dla reklam w Polsce.

Produkt: "${category}"
${productDescription ? `Opis: ${productDescription}` : ''}

ZADANIE:
1. Wejdź na facebook.com/ads/library
2. Filtr: Kraj=Polska, Kategoria=Wszystkie
3. Szukaj fraz: nazwa produktu, kategoria, synonimy
4. Zbierz 5-8 aktywnych reklam konkurencji (nie więcej)

Na końcu zwróć wynik jako JSON. Struktura:

{"category":"${category}","competitors":[{"brand":"nazwa","ad_text":"tekst reklamy (max 200 znaków)","headline":"nagłówek","format":"image lub video","angle":"pain_point lub transformation lub social_proof lub urgency lub curiosity","ad_url":"https://www.facebook.com/ads/library/?id=XXXXXXXXX"}],"gaps":["czego nie mówi konkurencja"],"recommendations":["rekomendacja dla ${brandName || 'marki'}"]}

Dla każdej reklamy podaj link z Ad Library (ad_url). Skróć ad_text do max 200 znaków.
Zwróć TYLKO JSON bez dodatkowego tekstu.
`.trim()

  // Create task
  const createRes = await fetch('https://api.manus.ai/v2/task.create', {
    method: 'POST',
    headers: { 'x-manus-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { content: instruction } })
  })

  const createData = await createRes.json()
  if (!createRes.ok || !createData.ok) throw new Error('Manus task creation failed')

  const taskId = createData.task_id
  console.log(`[campaign-batch] Manus task created: ${taskId}`)

  await upsertAds(supabase, workflowId, {
    competitor_research_task_id: taskId,
    competitor_research_status: 'pending'
  })

  // Poll for completion (max 15 min)
  const maxWait = 15 * 60 * 1000
  const startTime = Date.now()

  while (Date.now() - startTime < maxWait) {
    await new Promise(r => setTimeout(r, 20000)) // 20 sec

    const detailRes = await fetch(`https://api.manus.ai/v2/task.detail?task_id=${taskId}`, {
      headers: { 'x-manus-api-key': apiKey, 'Content-Type': 'application/json' }
    })

    const detailData = await detailRes.json()
    if (!detailRes.ok || !detailData.ok) continue

    const task = detailData.task || detailData
    const isFinished = ['completed', 'done', 'stopped'].includes(task.status)
    if (!isFinished) continue

    // Get messages
    const msgRes = await fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}&limit=50`, {
      headers: { 'x-manus-api-key': apiKey, 'Content-Type': 'application/json' }
    })
    const msgData = await msgRes.json()
    const messages = msgData.messages || msgData.data || []

    // Find JSON in assistant messages
    let result = ''
    for (const msg of [...messages].reverse()) {
      if (msg.type !== 'assistant_message') continue
      const content = typeof msg.assistant_message === 'string'
        ? msg.assistant_message
        : msg.assistant_message?.content || msg.assistant_message?.text || ''
      if (content.includes('{') && (content.includes('"competitors"') || content.includes('"gaps"'))) {
        result = content
        break
      }
    }

    // Parse JSON
    let researchData = null
    try {
      let depth = 0, start = -1, end = -1
      for (let i = 0; i < result.length; i++) {
        if (result[i] === '{') { if (depth === 0) start = i; depth++ }
        else if (result[i] === '}') { depth--; if (depth === 0 && start !== -1) { end = i + 1; break } }
      }
      if (start !== -1 && end !== -1) {
        researchData = JSON.parse(result.substring(start, end))
      }
    } catch (e) {
      console.error('[campaign-batch] Research JSON parse error:', e.message)
    }

    // Save
    await upsertAds(supabase, workflowId, {
      competitor_research: researchData || { raw_result: result, parse_error: true },
      competitor_research_at: new Date().toISOString(),
      competitor_research_status: 'completed'
    })

    return researchData
  }

  throw new Error('Manus research timeout (15 min)')
}

// ===== CLAUDE COPY =====

async function generateCopy(apiKey: string, supabase: any, workflowId: string, brand: any, product: any, research: any, landingUrl: string) {
  const brandName = brand.name || product.name || ''
  const productName = product.name || brand.name || ''

  let prompt = `MARKA: ${brandName}
TAGLINE: ${brand.tagline || ''}
OPIS: ${brand.description || product.description || ''}
PRODUKT: ${productName}${product.description ? '\nOPIS PRODUKTU: ' + product.description : ''}
LANDING PAGE: ${landingUrl || 'brak'}`

  if (research && !research.parse_error && research.competitors?.length) {
    const topAds = research.competitors.slice(0, 5)
    prompt += `\n\n===== REKLAMY KONKURENCJI =====\n`
    topAds.forEach((c: any, i: number) => {
      prompt += `[${i + 1}] ${c.brand || '?'} (${c.format || '?'}, kąt: ${c.angle || '?'})\nHeadline: ${c.headline || '-'}\nTekst: ${c.ad_text || '-'}\n\n`
    })
    if (research.gaps?.length) prompt += `LUKI:\n${research.gaps.map((g: string) => '- ' + g).join('\n')}\n`
    if (research.recommendations?.length) prompt += `REKOMENDACJE:\n${research.recommendations.map((r: string) => '- ' + r).join('\n')}\n`
  }

  prompt += `\n===== ZADANIE =====
Wygeneruj 5 wersji copy Meta Ads. Dobierz kąty na podstawie LUK konkurencji.
Primary Text: hook w pierwszych 125 znakach. Headline: 27-40 znaków. Description: 25-30 znaków.
NIE podawaj cen. CTA: "Sprawdź szczegóły" / "Zobacz opinie". Ton: bezpośredni, ciepły, polski rynek.

JSON: {"wow_factor":"...","target_group":"...","product_name":"${productName}","landing_url":"${landingUrl}","versions":[{"angle":"...","primary_text":"...","headline":"...","description":"...","cta":"..."}]}
Zwróć TYLKO JSON.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      system: `Jesteś ekspertem od reklam Meta Ads na polskim rynku e-commerce. WOW FACTOR w pierwszym zdaniu. Emocjonalna konkretność > generyki. Liczby > przymiotniki. Każdy kąt NAPRAWDĘ inny. Zwracaj TYLKO czysty JSON.`
    })
  })

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`)

  const data = await response.json()
  const content = data.content?.[0]?.text || ''

  // Parse JSON
  let adCopies = null
  let depth = 0, start = -1, end = -1
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') { if (depth === 0) start = i; depth++ }
    else if (content[i] === '}') { depth--; if (depth === 0 && start !== -1) { end = i + 1; break } }
  }
  if (start !== -1 && end !== -1) {
    adCopies = JSON.parse(content.substring(start, end))
  } else {
    throw new Error('No JSON in Claude response')
  }

  await upsertAds(supabase, workflowId, {
    ad_copies: adCopies,
    ad_copies_generated_at: new Date().toISOString()
  })

  console.log(`[campaign-batch] Copy generated: ${adCopies.versions?.length || 0} versions`)
}

// ===== GEMINI CREATIVES =====

async function generateCreatives(supabase: any, supabaseUrl: string, workflowId: string, productName: string, productDescription: string, refImageUrl?: string) {
  const types = [
    { type: 'lifestyle', prompt: `A person happily using ${productName} in a modern home interior. The product is clearly visible. Lifestyle advertising photography, warm natural lighting, photorealistic. No text, no captions, no watermarks.` },
    { type: 'problem', prompt: `A frustrated person struggling with a problem that ${productName} solves. ${productDescription ? 'Context: ' + productDescription : ''} Documentary style, natural lighting. No text, no captions, no watermarks.` },
    { type: 'before_after', prompt: `Split view: LEFT shows problematic situation, RIGHT shows perfect result after using ${productName}. Dramatic difference. Professional advertising photography. No text, no captions, no watermarks.` },
    { type: 'closeup', prompt: `Detailed close-up of ${productName}. ${productDescription || 'Premium product'}. Studio product photography, soft lighting, premium aesthetic. No text, no captions, no watermarks.` },
    { type: 'bundle', prompt: `Complete product set of ${productName} with accessories neatly arranged. Premium unboxing aesthetic. Studio photography, e-commerce style. No text, no captions, no watermarks.` }
  ]

  const creatives: any[] = []
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  for (const ct of types) {
    try {
      const body: any = { prompt: ct.prompt, count: 1, workflow_id: workflowId, type: `ad_${ct.type}` }
      if (refImageUrl) body.reference_images = [{ url: refImageUrl, type: 'product' }]

      const res = await fetch(`${supabaseUrl}/functions/v1/generate-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data?.images?.[0]?.url) {
        creatives.push({ type: ct.type, url: data.images[0].url, generated_at: new Date().toISOString() })
        console.log(`[campaign-batch] Creative ${ct.type} done`)
      }
    } catch (err) {
      console.error(`[campaign-batch] Creative ${ct.type} failed:`, err.message)
    }
  }

  if (creatives.length > 0) {
    await upsertAds(supabase, workflowId, {
      ad_creatives: creatives,
      ad_creatives_generated_at: new Date().toISOString()
    })
  }

  console.log(`[campaign-batch] ${creatives.length} creatives generated`)
}

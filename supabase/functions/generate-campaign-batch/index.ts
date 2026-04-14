import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * FAZA 1: Instant start — tworzy Manus task (jeśli potrzebny) i wraca od razu.
 * Jeśli research już jest → odpala FAZĘ 2 inline (copy + creatives, ~2 min).
 * Ciężkie przetwarzanie (Manus polling) robi campaign-check-progress (cron).
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let supabase: any = null
  let workflow_id: string = ''

  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const body = await req.json()
    workflow_id = body.workflow_id
    const include_creatives = body.include_creatives !== false

    if (!workflow_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'workflow_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Guard: nie odpala jeśli pipeline już działa
    const { data: current } = await supabase
      .from('workflow_ads')
      .select('campaign_pipeline_status, competitor_research')
      .eq('workflow_id', workflow_id)
      .maybeSingle()

    if (current?.campaign_pipeline_status === 'running') {
      return new Response(
        JSON.stringify({ success: true, status: 'already_running' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[campaign-batch] Starting for workflow ${workflow_id}`)

    // Sprawdź czy research istnieje
    const existingResearch = current?.competitor_research
    const hasValidResearch = existingResearch && !existingResearch.parse_error && existingResearch.competitors?.length

    if (hasValidResearch) {
      // Research jest → od razu copy + creatives (mieści się w timeout)
      await upsertAds(supabase, workflow_id, {
        campaign_pipeline_status: 'running',
        campaign_pipeline_started_at: new Date().toISOString(),
        campaign_pipeline_step: 'copy',
        campaign_pipeline_include_creatives: include_creatives
      })

      await runCopyAndCreatives(supabase, SUPABASE_URL, ANTHROPIC_API_KEY, workflow_id, include_creatives, existingResearch)

      return new Response(
        JSON.stringify({ success: true, status: 'completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Research nie ma → tworzymy Manus task i wracamy od razu
    // Cron (campaign-check-progress) będzie pollował i odpali copy+creatives gdy gotowy
    await upsertAds(supabase, workflow_id, {
      campaign_pipeline_status: 'running',
      campaign_pipeline_started_at: new Date().toISOString(),
      campaign_pipeline_step: 'research',
      campaign_pipeline_include_creatives: include_creatives
    })

    if (MANUS_API_KEY) {
      const taskId = await createManusResearchTask(MANUS_API_KEY, supabase, workflow_id)
      console.log(`[campaign-batch] Manus task created: ${taskId}, cron will poll`)
    } else {
      // Brak Manusa → od razu copy bez researchu
      await runCopyAndCreatives(supabase, SUPABASE_URL, ANTHROPIC_API_KEY, workflow_id, include_creatives, null)
    }

    return new Response(
      JSON.stringify({ success: true, status: 'started', has_research: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[campaign-batch] Fatal error:', error)
    // Ustaw status failed w bazie
    if (supabase && workflow_id) {
      try {
        await upsertAds(supabase, workflow_id, { campaign_pipeline_status: 'failed', campaign_pipeline_step: 'error' })
      } catch (_) {}
    }
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
    .upsert({ workflow_id: workflowId, ...fields }, { onConflict: 'workflow_id' })
    .select()
  return data
}

async function createManusResearchTask(apiKey: string, supabase: any, workflowId: string): Promise<string> {
  // Pobierz dane produktu
  const [brandingRes, productsRes] = await Promise.all([
    supabase.from('workflow_branding').select('type, value').eq('workflow_id', workflowId).eq('type', 'brand_info'),
    supabase.from('workflow_products').select('name, description').eq('workflow_id', workflowId)
  ])

  const brandInfo = brandingRes.data?.[0]
  let brandVal: any = {}
  if (brandInfo?.value) {
    brandVal = typeof brandInfo.value === 'string' ? JSON.parse(brandInfo.value) : brandInfo.value
  }
  const product = productsRes.data?.[0] || {} as any
  const brandName = brandVal.name || product.name || ''
  const productName = product.name || brandVal.name || ''
  const productDescription = product.description || brandVal.description || ''
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

  const createRes = await fetch('https://api.manus.ai/v2/task.create', {
    method: 'POST',
    headers: { 'x-manus-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { content: instruction } })
  })

  const createData = await createRes.json()
  if (!createRes.ok || !createData.ok) throw new Error('Manus task creation failed')

  await upsertAds(supabase, workflowId, {
    competitor_research_task_id: createData.task_id,
    competitor_research_status: 'pending'
  })

  return createData.task_id
}

// ===== COPY + CREATIVES (runs within timeout) =====

async function runCopyAndCreatives(supabase: any, supabaseUrl: string, anthropicKey: string, workflowId: string, includeCreatives: boolean, research: any) {
  // Pobierz dane
  const [brandingRes, productsRes, workflowRes] = await Promise.all([
    supabase.from('workflow_branding').select('type, value').eq('workflow_id', workflowId).eq('type', 'brand_info'),
    supabase.from('workflow_products').select('name, description, image_url').eq('workflow_id', workflowId),
    supabase.from('workflows').select('id, offer_name, landing_page_url').eq('id', workflowId).single()
  ])

  const brandInfo = brandingRes.data?.[0]
  let brandVal: any = {}
  if (brandInfo?.value) {
    brandVal = typeof brandInfo.value === 'string' ? JSON.parse(brandInfo.value) : brandInfo.value
  }
  const product = productsRes.data?.[0] || {} as any
  const landingUrl = workflowRes.data?.landing_page_url || ''
  const productName = product.name || brandVal.name || ''
  const productDescription = product.description || brandVal.description || ''

  // COPY
  await upsertAds(supabase, workflowId, { campaign_pipeline_step: 'copy' })
  try {
    await generateCopy(anthropicKey, supabase, workflowId, brandVal, product, research, landingUrl)
  } catch (err) {
    console.error('[campaign] Copy failed:', err.message)
  }

  // CREATIVES
  if (includeCreatives) {
    await upsertAds(supabase, workflowId, { campaign_pipeline_step: 'creatives' })
    try {
      await generateCreatives(supabase, supabaseUrl, workflowId, productName, productDescription, product.image_url)
    } catch (err) {
      console.error('[campaign] Creatives failed:', err.message)
    }
  }

  // DONE
  await upsertAds(supabase, workflowId, {
    campaign_pipeline_status: 'completed',
    campaign_pipeline_step: 'done',
    campaign_pipeline_completed_at: new Date().toISOString()
  })
  console.log('[campaign] Pipeline completed!')
}

// ===== CLAUDE COPY =====

async function generateCopy(apiKey: string, supabase: any, workflowId: string, brand: any, product: any, research: any, landingUrl: string) {
  const brandName = brand.name || product.name || ''
  const productName = product.name || brand.name || ''

  let prompt = `MARKA: ${brandName}\nTAGLINE: ${brand.tagline || ''}\nOPIS: ${brand.description || product.description || ''}\nPRODUKT: ${productName}${product.description ? '\nOPIS PRODUKTU: ' + product.description : ''}\nLANDING PAGE: ${landingUrl || 'brak'}`

  if (research && !research.parse_error && research.competitors?.length) {
    const topAds = research.competitors.slice(0, 5)
    prompt += `\n\n===== REKLAMY KONKURENCJI =====\n`
    topAds.forEach((c: any, i: number) => {
      prompt += `[${i + 1}] ${c.brand || '?'} (${c.format || '?'}, kąt: ${c.angle || '?'})\nHeadline: ${c.headline || '-'}\nTekst: ${c.ad_text || '-'}\n\n`
    })
    if (research.gaps?.length) prompt += `LUKI:\n${research.gaps.map((g: string) => '- ' + g).join('\n')}\n`
    if (research.recommendations?.length) prompt += `REKOMENDACJE:\n${research.recommendations.map((r: string) => '- ' + r).join('\n')}\n`
  }

  prompt += `\n===== ZADANIE =====\nWygeneruj 5 wersji copy Meta Ads. Dobierz kąty na podstawie LUK konkurencji.\nPrimary Text: hook w pierwszych 125 znakach. Headline: 27-40 znaków. Description: 25-30 znaków.\nNIE podawaj cen. CTA: "Sprawdź szczegóły" / "Zobacz opinie". Ton: bezpośredni, ciepły, polski rynek.\n\nJSON: {"wow_factor":"...","target_group":"...","product_name":"${productName}","landing_url":"${landingUrl}","versions":[{"angle":"...","primary_text":"...","headline":"...","description":"...","cta":"..."}]}\nZwróć TYLKO JSON.`

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

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in Claude response')
  const adCopies = JSON.parse(jsonMatch[0])

  await upsertAds(supabase, workflowId, { ad_copies: adCopies, ad_copies_generated_at: new Date().toISOString() })
  console.log(`[campaign] Copy: ${adCopies.versions?.length || 0} versions`)
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
      }
    } catch (err) {
      console.error(`[campaign] Creative ${ct.type} failed:`, err.message)
    }
  }

  if (creatives.length > 0) {
    await upsertAds(supabase, workflowId, { ad_creatives: creatives, ad_creatives_generated_at: new Date().toISOString() })
  }
  console.log(`[campaign] ${creatives.length} creatives`)
}

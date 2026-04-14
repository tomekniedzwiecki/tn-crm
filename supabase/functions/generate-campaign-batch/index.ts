import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Campaign pipeline: instant start.
 * If research exists → runs copy + creatives inline (~40s).
 * If not → creates Manus task, returns. Cron continues later.
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
    const continue_pipeline = body.continue_pipeline === true

    if (!workflow_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'workflow_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Guard: concurrent check
    const { data: current } = await supabase
      .from('workflow_ads')
      .select('campaign_pipeline_status, campaign_pipeline_step, competitor_research')
      .eq('workflow_id', workflow_id)
      .maybeSingle()

    if (current?.campaign_pipeline_status === 'running' && !continue_pipeline) {
      return new Response(
        JSON.stringify({ success: true, status: 'already_running' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[campaign] Start workflow=${workflow_id} continue=${continue_pipeline}`)

    const existingResearch = current?.competitor_research
    const hasValidResearch = existingResearch && !existingResearch.parse_error && existingResearch.competitors?.length

    if (hasValidResearch || continue_pipeline) {
      // Research gotowy (lub cron kontynuuje) → copy + creatives
      await upsertAds(supabase, workflow_id, {
        campaign_pipeline_status: 'running',
        campaign_pipeline_started_at: new Date().toISOString(),
        campaign_pipeline_step: 'copy',
        campaign_pipeline_include_creatives: include_creatives
      })

      await runCopyAndCreatives(supabase, SUPABASE_URL, ANTHROPIC_API_KEY, workflow_id, include_creatives, hasValidResearch ? existingResearch : null)

      return new Response(
        JSON.stringify({ success: true, status: 'completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Brak researchu → tworzymy Manus task, cron dopilnuje reszty
    await upsertAds(supabase, workflow_id, {
      campaign_pipeline_status: 'running',
      campaign_pipeline_started_at: new Date().toISOString(),
      campaign_pipeline_step: 'research',
      campaign_pipeline_include_creatives: include_creatives
    })

    if (MANUS_API_KEY) {
      const taskId = await createManusResearchTask(MANUS_API_KEY, supabase, workflow_id)
      console.log(`[campaign] Manus task: ${taskId}`)
    } else {
      // Brak Manusa → copy bez researchu
      await runCopyAndCreatives(supabase, SUPABASE_URL, ANTHROPIC_API_KEY, workflow_id, include_creatives, null)
    }

    return new Response(
      JSON.stringify({ success: true, status: 'started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[campaign] Fatal:', error)
    if (supabase && workflow_id) {
      try { await upsertAds(supabase, workflow_id, { campaign_pipeline_status: 'failed', campaign_pipeline_step: 'error' }) } catch (_) {}
    }
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ===== HELPERS =====

async function upsertAds(supabase: any, workflowId: string, fields: any) {
  await supabase
    .from('workflow_ads')
    .upsert({ workflow_id: workflowId, ...fields }, { onConflict: 'workflow_id' })
}

// ===== MANUS RESEARCH TASK =====

async function createManusResearchTask(apiKey: string, supabase: any, workflowId: string): Promise<string> {
  const [brandingRes, productsRes] = await Promise.all([
    supabase.from('workflow_branding').select('type, value').eq('workflow_id', workflowId).eq('type', 'brand_info'),
    supabase.from('workflow_products').select('name, description').eq('workflow_id', workflowId)
  ])

  const brandInfo = brandingRes.data?.[0]
  let brandVal: any = {}
  if (brandInfo?.value) brandVal = typeof brandInfo.value === 'string' ? JSON.parse(brandInfo.value) : brandInfo.value
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

  const res = await fetch('https://api.manus.ai/v2/task.create', {
    method: 'POST',
    headers: { 'x-manus-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { content: instruction } })
  })
  const data = await res.json()
  if (!res.ok || !data.ok) throw new Error('Manus task creation failed')

  await upsertAds(supabase, workflowId, {
    competitor_research_task_id: data.task_id,
    competitor_research_status: 'pending'
  })
  return data.task_id
}

// ===== COPY + CREATIVES =====

async function runCopyAndCreatives(supabase: any, supabaseUrl: string, anthropicKey: string, workflowId: string, includeCreatives: boolean, research: any) {
  const [brandingRes, productsRes, workflowRes] = await Promise.all([
    supabase.from('workflow_branding').select('type, value').eq('workflow_id', workflowId).eq('type', 'brand_info'),
    supabase.from('workflow_products').select('name, description, image_url').eq('workflow_id', workflowId),
    supabase.from('workflows').select('id, offer_name, landing_page_url').eq('id', workflowId).single()
  ])

  const brandInfo = brandingRes.data?.[0]
  let brandVal: any = {}
  if (brandInfo?.value) brandVal = typeof brandInfo.value === 'string' ? JSON.parse(brandInfo.value) : brandInfo.value
  const product = productsRes.data?.[0] || {} as any
  const landingUrl = workflowRes.data?.landing_page_url || ''
  const productName = product.name || brandVal.name || ''
  const productDescription = product.description || brandVal.description || ''
  const refImageUrl = product.image_url || null

  // COPY (Claude generuje copy + prompty do zdjęć)
  await upsertAds(supabase, workflowId, { campaign_pipeline_step: 'copy' })
  let adCopies: any = null
  try {
    adCopies = await generateCopy(anthropicKey, supabase, workflowId, brandVal, product, research, landingUrl)
  } catch (err) {
    console.error('[campaign] Copy failed:', err.message)
  }

  // CREATIVES (użyj promptów z copy)
  if (includeCreatives) {
    await upsertAds(supabase, workflowId, { campaign_pipeline_step: 'creatives' })
    try {
      await generateCreatives(supabase, supabaseUrl, workflowId, adCopies, productName, productDescription, refImageUrl)
    } catch (err) {
      console.error('[campaign] Creatives failed:', err.message)
    }
  }

  await upsertAds(supabase, workflowId, {
    campaign_pipeline_status: 'completed',
    campaign_pipeline_step: 'done',
    campaign_pipeline_completed_at: new Date().toISOString()
  })
  console.log('[campaign] Pipeline completed!')
}

// ===== CLAUDE: COPY + IMAGE PROMPTS =====

async function generateCopy(apiKey: string, supabase: any, workflowId: string, brand: any, product: any, research: any, landingUrl: string): Promise<any> {
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
Wygeneruj 5 wersji reklamy Meta Ads. Każda wersja zawiera COPY + PROMPT DO ZDJĘCIA.

Dobierz kąty na podstawie LUK konkurencji.

COPY:
- Primary Text: hook w pierwszych 125 znakach. Headline: 27-40 znaków. Description: 25-30 znaków.
- NIE podawaj cen. CTA: "Sprawdź szczegóły" / "Zobacz opinie". Ton: bezpośredni, ciepły, polski rynek.

IMAGE PROMPT (dla każdej wersji):
- Napisz szczegółowy prompt do wygenerowania zdjęcia reklamowego przez AI (Gemini)
- Zdjęcie MUSI pasować do kąta i przekazu copy
- Format: kwadrat (1:1), do reklamy na Facebooku/Instagramie
- Styl: profesjonalna fotografia reklamowa, nie stockowa
- Pokazuj PRODUKT w użyciu lub w kontekście problemu/rozwiązania
- Osoby na zdjęciu: realistyczne, dopasowane do grupy docelowej (wiek, płeć)
- ZAWSZE kończ promptem: "Professional advertising photography for Facebook/Instagram ad. Square format 1:1. Photorealistic. No text, no captions, no labels, no watermarks, no logos."
- NIE opisuj elementów produktu których nie znasz — to zrobi referencyjne zdjęcie

JSON:
{"wow_factor":"...","target_group":"...","product_name":"${productName}","landing_url":"${landingUrl}","versions":[{"angle":"nazwa kąta","primary_text":"...","headline":"...","description":"...","cta":"...","image_prompt":"szczegółowy prompt do zdjęcia reklamowego, dopasowany do tego kąta"}]}
Zwróć TYLKO JSON.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
      system: `Jesteś ekspertem od reklam Meta Ads na polskim rynku e-commerce.

COPY: WOW FACTOR w pierwszym zdaniu. Emocjonalna konkretność > generyki. Liczby > przymiotniki. Każdy kąt NAPRAWDĘ inny.

IMAGE PROMPTS: Tworzysz prompty do generowania zdjęć reklamowych przez AI.
- Myśl jak art director kampanii na Facebooku
- Zdjęcie musi zatrzymać scroll — mocna kompozycja, emocja, kontrast
- Dostosuj scenę do kąta: pain point = frustracja/problem, transformation = efekt wow, social proof = realna osoba z produktem, curiosity = intrygujący close-up
- Grupa docelowa musi się rozpoznać na zdjęciu (odpowiedni wiek, styl życia, otoczenie)
- Produkt jest WIDOCZNY ale naturalny w scenie (nie packshot)
- Oświetlenie, kolory, nastrój dopasowane do przekazu

Zwracaj TYLKO czysty JSON.`
    })
  })

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`)

  const data = await response.json()
  const content = data.content?.[0]?.text || ''

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in Claude response')
  const adCopies = JSON.parse(jsonMatch[0])

  await upsertAds(supabase, workflowId, { ad_copies: adCopies, ad_copies_generated_at: new Date().toISOString() })
  console.log(`[campaign] Copy: ${adCopies.versions?.length || 0} versions with image prompts`)

  return adCopies
}

// ===== GEMINI CREATIVES =====

async function generateCreatives(supabase: any, supabaseUrl: string, workflowId: string, adCopies: any, productName: string, productDescription: string, refImageUrl: string | null) {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Pobierz prompty z wygenerowanego copy (Claude je napisał)
  let imagePrompts: { angle: string, prompt: string }[] = []

  if (adCopies?.versions?.length) {
    imagePrompts = adCopies.versions
      .filter((v: any) => v.image_prompt)
      .map((v: any) => ({ angle: v.angle || 'ad', prompt: v.image_prompt }))
  }

  // Fallback: jeśli Claude nie wygenerował promptów, użyj generycznych
  if (imagePrompts.length === 0) {
    imagePrompts = [
      { angle: 'lifestyle', prompt: `A person using ${productName} in daily life. ${productDescription || ''}. Professional advertising photography for Facebook/Instagram ad. Square format 1:1. Photorealistic. No text, no captions, no labels, no watermarks, no logos.` },
      { angle: 'product', prompt: `${productName} product shot, premium aesthetic. ${productDescription || ''}. Studio product photography for e-commerce ad. Square format 1:1. No text, no captions, no labels, no watermarks, no logos.` },
      { angle: 'benefit', prompt: `Visual representation of the main benefit of ${productName}. ${productDescription || ''}. Professional advertising photography for Facebook/Instagram ad. Square format 1:1. Photorealistic. No text, no captions, no labels, no watermarks, no logos.` }
    ]
  }

  // Generuj równolegle
  const results = await Promise.allSettled(imagePrompts.map(async (ip) => {
    const body: any = {
      prompt: ip.prompt,
      count: 1,
      workflow_id: workflowId,
      type: `ad_${ip.angle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    }

    // ZAWSZE dodaj zdjęcie referencyjne produktu jeśli jest
    if (refImageUrl) {
      body.reference_images = [{ url: refImageUrl, type: 'product' }]
    }

    const res = await fetch(`${supabaseUrl}/functions/v1/generate-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await res.json()
    if (data?.images?.[0]?.url) {
      return { type: ip.angle, url: data.images[0].url, prompt: ip.prompt, generated_at: new Date().toISOString() }
    }
    return null
  }))

  const creatives = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)

  if (creatives.length > 0) {
    await upsertAds(supabase, workflowId, { ad_creatives: creatives, ad_creatives_generated_at: new Date().toISOString() })
  }
  console.log(`[campaign] ${creatives.length} creatives generated`)
}

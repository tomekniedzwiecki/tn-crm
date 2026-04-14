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
  const [brandingRes, workflowRes] = await Promise.all([
    supabase.from('workflow_branding').select('type, value').eq('workflow_id', workflowId).eq('type', 'brand_info'),
    supabase.from('workflows').select('id, offer_name, landing_page_url, selected_product_id').eq('id', workflowId).single()
  ])

  const brandInfo = brandingRes.data?.[0]
  let brandVal: any = {}
  if (brandInfo?.value) brandVal = typeof brandInfo.value === 'string' ? JSON.parse(brandInfo.value) : brandInfo.value
  const landingUrl = workflowRes.data?.landing_page_url || ''
  const selectedProductId = workflowRes.data?.selected_product_id

  // Pobierz produkt — najpierw selected_product_id (globalny katalog), potem workflow_products
  let product: any = {}
  if (selectedProductId) {
    const { data: p } = await supabase.from('workflow_products')
      .select('name, description, image_url').eq('id', selectedProductId).maybeSingle()
    if (p) product = p
  }
  if (!product.image_url) {
    const { data: wp } = await supabase.from('workflow_products')
      .select('name, description, image_url').eq('workflow_id', workflowId).maybeSingle()
    if (wp) product = wp
  }

  const productName = product.name || brandVal.name || ''
  const productDescription = product.description || brandVal.description || ''

  // Fallback: mockup/logo jeśli brak zdjęcia produktu
  let refImageUrl = product.image_url || null
  if (!refImageUrl) {
    const { data: mockups } = await supabase.from('workflow_branding')
      .select('type, file_url').eq('workflow_id', workflowId).in('type', ['mockup', 'logo'])
      .not('file_url', 'is', null).limit(5)
    refImageUrl = mockups?.find((m: any) => m.type === 'mockup')?.file_url
      || mockups?.find((m: any) => m.type === 'logo')?.file_url
      || null
  }

  if (refImageUrl) {
    console.log(`[campaign] Reference image: ${refImageUrl.substring(0, 80)}`)
  } else {
    console.log('[campaign] WARNING: No reference image found!')
  }

  // COPY (Claude generuje copy + prompty do zdjęć)
  await upsertAds(supabase, workflowId, { campaign_pipeline_step: 'copy' })
  let adCopies: any = null
  try {
    adCopies = await generateCopy(anthropicKey, supabase, workflowId, brandVal, product, research, landingUrl, refImageUrl)
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

async function generateCopy(apiKey: string, supabase: any, workflowId: string, brand: any, product: any, research: any, landingUrl: string, refImageUrl: string | null): Promise<any> {
  const brandName = brand.name || product.name || ''
  const productName = product.name || brand.name || ''

  let textPrompt = `MARKA: ${brandName}
TAGLINE: ${brand.tagline || ''}
OPIS: ${brand.description || product.description || ''}
PRODUKT: ${productName}${product.description ? '\nOPIS PRODUKTU: ' + product.description : ''}
LANDING PAGE: ${landingUrl || 'brak'}`

  if (refImageUrl) {
    textPrompt += `\n\nZDJĘCIE REFERENCYJNE PRODUKTU: Przesyłam Ci zdjęcie produktu. DOKŁADNIE opisz go w image_prompt — kolor, kształt, materiał, detale. Generator obrazów dostanie to samo zdjęcie jako referencję + Twój prompt.`
  }

  if (research && !research.parse_error && research.competitors?.length) {
    const topAds = research.competitors.slice(0, 5)
    textPrompt += `\n\n===== REKLAMY KONKURENCJI =====\n`
    topAds.forEach((c: any, i: number) => {
      textPrompt += `[${i + 1}] ${c.brand || '?'} (${c.format || '?'}, kąt: ${c.angle || '?'})\nHeadline: ${c.headline || '-'}\nTekst: ${c.ad_text || '-'}\n\n`
    })
    if (research.gaps?.length) textPrompt += `LUKI:\n${research.gaps.map((g: string) => '- ' + g).join('\n')}\n`
    if (research.recommendations?.length) textPrompt += `REKOMENDACJE:\n${research.recommendations.map((r: string) => '- ' + r).join('\n')}\n`
  }

  textPrompt += `\n===== ZADANIE =====
Wygeneruj 5 wersji reklamy Meta Ads. Każda wersja = COPY + IMAGE PROMPT.

COPY:
- Primary Text: hook w pierwszych 125 znakach. Headline: 27-40 znaków. Description: 25-30 znaków.
- NIE podawaj cen. CTA: "Sprawdź szczegóły" / "Zobacz opinie". Ton: bezpośredni, ciepły, polski rynek.
- Dobierz kąty na podstawie LUK konkurencji.

IMAGE PROMPT (dla każdej wersji):
Generator obrazów (Gemini 3) dostanie ZDJĘCIE REFERENCYJNE produktu + Twój prompt. Produkt będzie wklejony 1:1 z referencji. TWOJA ROBOTA: napisać prompt scenariusza jak SCENARZYSTA REKLAMY.

NIE OPISUJ PRODUKTU:
- ŹLE: "black hydrogen bottle with SPE technology"
- DOBRZE: "the product from reference image" / "the bottle"
Generator widzi referencję — opisywanie produktu słowami psuje rezultat.

STRUKTURA DOBREGO IMAGE_PROMPT (5 elementów):

1. KADR I KOMPOZYCJA (zdanie 1):
"Close-up shot" / "Medium shot" / "Split-screen" / "Over-the-shoulder" / "POV shot" / "Flat lay"
Konkretna kompozycja, nie "a photo of..."

2. GŁÓWNY BOHATER + EMOCJA (zdanie 2):
Kto jest w kadrze, w jakim stanie emocjonalnym. KONKRETNY wiek, etnografia, ubiór, poza.
Nie "happy woman" — "a 38-year-old woman in a cream linen shirt, mid-laugh, caught off-guard"

3. AKCJA Z PRODUKTEM (zdanie 3):
Co robi z produktem. Produkt MUSI być w akcji, nie "held".
"pouring water from the bottle into a clear glass" > "holding the bottle"

4. SCENERIA I ŚWIATŁO (zdanie 4):
Konkretne miejsce + konkretne światło.
"Sun-drenched Scandinavian kitchen with white oak counters, soft window light from left, 85mm lens, shallow depth of field"

5. STYL FOTOGRAFII (zdanie 5):
Referencja do realnej estetyki, nie "professional photography":
- "Shot like an Apple iPhone ad — minimal, premium, cinematic"
- "UGC Instagram Reel aesthetic — slightly grainy, authentic, iPhone 15 Pro"
- "Patagonia outdoor campaign style — natural, weathered, honest"
- "Aesop skincare editorial — soft, moody, refined"
- "Kinfolk magazine still life — calm, intentional, natural materials"

ZAWSZE KOŃCZ TYM BLOKIEM:
"The product must be rendered exactly as shown in the reference image. Composite the reference product into this scene realistically. 1080x1080 square format. NOT a stock photo. NOT corporate. Natural skin texture, real film grain, authentic imperfections. No text, no captions, no logos, no watermarks, no overlays."

PRZYKŁAD IDEALNY (scroll-stopper na FB):

"Extreme close-up, macro lens. A woman's hand (natural unmanicured nails, visible pores on skin) tilting the product from reference image — stream of water catching morning light, micro-bubbles visible mid-pour. Soft gold-hour window light from camera-right, out-of-focus kitchen greenery in background (bokeh). Shot like a Le Labo product editorial — sensory, intimate, high craft. Composite the reference product into this scene. 1080x1080 square. NOT a stock photo. Natural skin texture, subtle film grain. No text, no logos, no watermarks."

TYPY SCEN WG KĄTA (wybierz BARDZO różne dla 5 wersji):

- Myth-busting: Split-screen composite. LEFT: blurred photo of generic competitor bottle with PPM meter reading "0.2" in red. RIGHT: sharp photo of product from reference with PPM meter reading "1.2" in green. Kitchen countertop. Dramatic lighting contrast.

- Transformation: Two-panel diptych. TOP: tired 42-year-old man in gym clothes, slumped posture, bad morning light. BOTTOM: same man 2 hours later, energized, drinking from product from reference, bright window light. Documentary style.

- Social proof / UGC: iPhone selfie angle, slightly tilted. 29-year-old woman in pajamas, messy bun, genuine surprised smile, holding product from reference in one hand while looking at it. Unmade bed visible. Authentic morning moment. iPhone 15 Pro photo aesthetic.

- Pain point: Medium shot. 45-year-old man at office desk, head in hands, empty coffee mug, afternoon slump, cold fluorescent office light. NO product visible. Documentary tension.

- Technologia / Curiosity: Extreme macro close-up. The product from reference image shown partially — just the activation button and LED indicator glowing blue. Micro-bubbles rising in water. Soft black velvet background. High-end product editorial, like Apple keynote product reveal.

- Authority: Over-the-shoulder shot of a 50-year-old doctor in white coat examining the product from reference on a clinical desk. Medical instruments in bokeh background. Clinical trust lighting.

JSON:
{"wow_factor":"...","target_group":"konkretna persona z wiekiem, płcią, stylem życia","product_name":"${productName}","landing_url":"${landingUrl}","versions":[{"angle":"...","primary_text":"...","headline":"...","description":"...","cta":"...","image_prompt":"5-zdaniowy prompt z kadrem, bohaterem, akcją, scenerią, stylem + finalny blok zamykający"}]}
Zwróć TYLKO JSON.`

  // Buduj messages — z obrazem jeśli jest
  const userContent: any[] = []

  if (refImageUrl) {
    try {
      // Pobierz obraz i przekaż do Claude Vision
      const imgRes = await fetch(refImageUrl)
      if (imgRes.ok) {
        const imgBuffer = await imgRes.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)))
        const mimeType = imgRes.headers.get('content-type') || 'image/jpeg'

        userContent.push({
          type: 'image',
          source: { type: 'base64', media_type: mimeType, data: base64 }
        })
        console.log(`[campaign] Product image loaded for Claude Vision (${mimeType}, ${base64.length} chars)`)
      }
    } catch (err) {
      console.error('[campaign] Failed to load product image for Claude:', err.message)
    }
  }

  userContent.push({ type: 'text', text: textPrompt })

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: userContent }],
      system: `Jesteś art directorem i copywriterem kampanii Meta Ads na polskim rynku e-commerce.

COPY:
- WOW FACTOR w pierwszym zdaniu każdego Primary Text
- Emocjonalna konkretność > generyki. "3 minuty do pełnej mocy" > "szybko działa"
- Liczby > przymiotniki. Każdy kąt NAPRAWDĘ inny.
- Polski rynek: bezpośredni ale ciepły. Nie "KUP TERAZ" — "Sprawdź szczegóły"

IMAGE PROMPTS — jesteś SCENARZYSTĄ REKLAMY, nie opisywaczem produktu:

Twoje prompty idą do Gemini 3 Pro Image + zdjęcie referencyjne. Produkt jest wklejany 1:1 z referencji.
NIE opisuj produktu (kolor, kształt, branding) — psujesz rezultat. Pisz "the product from reference image".

ART DIRECTOR MINDSET — używaj REALNYCH referencji estetycznych:
- "Shot like Apple iPhone ad" — minimalizm, cinematic, premium
- "UGC Instagram Reel, iPhone 15 Pro aesthetic" — authentic, grainy, raw
- "Patagonia outdoor campaign" — natural, honest, weathered
- "Aesop editorial" — soft, moody, refined
- "Kinfolk magazine" — calm, intentional
- "Le Labo product photography" — sensory, intimate
- "Nike Run Club ad" — dynamic, emotional, documentary
NIE: "professional photography", "high quality" — to produkuje AI slop.

5-ZDANIOWA STRUKTURA IMAGE_PROMPT (obowiązkowa):
1. Kadr (close-up macro / medium / split-screen / POV / over-the-shoulder)
2. Bohater z konkretną emocją (wiek, ubiór, poza, mimika — NIE "happy person")
3. Akcja z produktem (pouring, tilting, examining — NIE "holding")
4. Sceneria + światło (konkretne miejsce + konkretny typ światła, np. "window light 85mm shallow DOF")
5. Styl referencji (jak "Le Labo editorial" / "Apple ad" / "UGC iPhone selfie")

ANTY-WZORCE (nigdy nie używaj):
- "happy woman smiling at camera" → stockowa generyka, scroll-ignored
- "white background studio" → wygląda jak Allegro
- "professional advertising photo" → AI slop, idealnie pikselowe
- "diverse group of happy people" → corporate stock
- "modern minimalist kitchen" → za ogólne, zero klimatu

ZAWSZE DODAJ: "Composite the product from reference into this scene. NOT a stock photo. Natural skin texture, real film grain, authentic imperfections. No text, no logos, no watermarks."

Każda z 5 wersji musi mieć BARDZO różny kadr i scenę — nie 5 wariantów tego samego.

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

  console.log(`[campaign] Generating ${imagePrompts.length} creatives with refImageUrl=${refImageUrl ? 'YES' : 'NO'}`)
  if (refImageUrl) console.log(`[campaign] Reference: ${refImageUrl.substring(0, 100)}`)

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
      console.log(`[campaign] Sending generate-image with product reference for angle=${ip.angle}`)
    } else {
      console.warn(`[campaign] NO REFERENCE IMAGE for angle=${ip.angle}`)
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

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
Generator obrazów (Gemini Nano Banana) dostanie referencyjne zdjęcie produktu + Twój prompt.
MODEL DYFUZYJNY reaguje źle na negacje i długie instrukcje — pisz KRÓTKO i POZYTYWNIE.

FORMUŁA (wg oficjalnego guide Google Cloud dla Nano Banana):
[Scena jednym zdaniem]. [Parametry kamery]. [Nastrój/color grade]. [Opcjonalnie: tekst na obrazie].

NIE używaj: "NOT", "DO NOT", "NO stock photo", "IGNORE X" — to zwiększa prawdopodobieństwo tych artefaktów.
NIE opisuj produktu — model widzi go na referencji. Używaj "the product" / "it".

STRUKTURA 3-4 ZDAŃ (max 60 słów):

Zdanie 1 — AKCJA I SCENA:
"The product resting on wet concrete in a dimly lit workshop."
"A 34-year-old woman in grey hoodie holding the product on a messy kitchen counter."
"The product partially submerged in glass of water, micro-bubbles rising."

Zdanie 2 — KAMERA (konkretne parametry):
"Shot on iPhone 15 Pro, slightly overexposed, direct flash."
"Sony A7 IV, 50mm lens, f/2.0, shallow depth of field."
"Shot on Canon 5D Mark IV, 35mm, natural window light."

Zdanie 3 — NASTRÓJ / COLOR GRADE:
"Cinematic color grade, teal shadows, warm highlights."
"Soft golden hour light, pastel tones."
"Raw documentary style, natural color."

Zdanie 4 (OPCJONALNIE) — TEKST NA OBRAZIE:
Gemini świetnie renderuje tekst. Dla formatów FB ads dodaj:
"Bold white sans-serif text at top: 'KAŻDA BUTELKA JEST INNA'."
"Text overlay in black: '2/10 butelek to tylko marketing'."

6 FORMATÓW FB ADS KTÓRE KONWERTUJĄ (wybierz różne dla 5 wersji):

1. **UGC iPhone selfie** — "amateur-looking" by specjalnie, zatrzymuje scroll bo nie wygląda jak reklama:
"A 29-year-old woman in pajamas holding the product, iPhone selfie angle, messy bedroom background. Shot on iPhone 15 Pro, slightly overexposed, direct flash."

2. **With vs Without (split-screen)** — kontrast który AI robi najlepiej:
"Split-screen image. Left side: dark dirty pipe interior. Right side: same pipe but clean and clear, with the product visible. Shot cinematically, dramatic lighting."

3. **Myth vs Fact z tekstem** — tekst na obrazie to driver CTR na FB:
"The product on a marble counter, soft natural light. Bold black sans-serif text overlay top: 'MYTH: wszystkie butelki są takie same'. White text bottom: 'FACT: tylko 2/10 działa'."

4. **Problem Visualization (bez produktu)** — pokaż ból, nie rozwiązanie:
"A dark corroded pipe interior, visible rust and buildup, single LED light illuminating damage. Shot with macro lens, documentary style, harsh realistic lighting."

5. **Product in messy real context** — anti-stockowe:
"The product on a cluttered kitchen counter next to half-eaten breakfast and open laptop. Shot on iPhone, natural morning window light, authentic imperfect framing."

6. **Process close-up** — produkt w akcji, buduje zaufanie:
"Extreme macro close-up. A hand pouring water from the product into a glass, stream catching light, micro-bubbles visible. Sony A7 IV, 85mm macro, f/2.8."

ZASADY KOŃCOWE:
- NIE dodawaj "1080x1080", "No watermarks" itp. — zbędne negacje
- NIE pisz "professional photography" — to produkuje AI slop
- Zdania konkretne, nie opisowe
- Max 60 słów na image_prompt
- Jeśli dodajesz tekst na obrazie, pisz PO POLSKU (to reklama dla Polaków)

JSON:
{"wow_factor":"...","target_group":"konkretna persona","product_name":"${productName}","landing_url":"${landingUrl}","versions":[{"angle":"...","primary_text":"...","headline":"...","description":"...","cta":"...","image_prompt":"krótki prompt 3-4 zdania, max 60 słów, dopasowany format z listy 6"}]}
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

IMAGE PROMPTS — pisz dla Gemini Nano Banana, nie dla człowieka:

MODEL DYFUZYJNY — REGUŁY NAUKOWE (nie opinia):
1. Negacje ("NOT", "DO NOT", "no stock photo") ZWIĘKSZAJĄ prawdopodobieństwo tych artefaktów w output. Pisz tylko pozytywnie.
2. Długie prompty (>80 słów) rozpraszają uwagę modelu. Max 60 słów.
3. Opisywanie produktu tekstem konfliktuje z referencją obrazową. Pisz "the product", nie "the black bottle with logo".
4. "Professional photography" / "high quality" = AI slop. Używaj konkretnych parametrów: "Shot on iPhone 15 Pro", "Sony A7 IV 50mm f/2".

FORMATY FB ADS 2026 (wg research Meta):
- UGC iPhone selfie (amatorskie) → bije stock 3x w CTR
- With vs Without (split-screen) → AI świetne w kontraście
- Myth vs Fact z tekstem na obrazie → tekst to driver CTR
- Problem Visualization bez produktu → pokaż ból, nie rozwiązanie
- Messy real context → anti-stockowe
- Ugly Ad aesthetic → "overexposed flash", "slightly blurry"

Tekst na obrazie: pisz PO POLSKU (to reklamy dla Polaków). Gemini świetnie renderuje polski tekst sans-serif.

KAŻDA z 5 wersji = INNY z powyższych formatów. Nie powtarzaj.

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

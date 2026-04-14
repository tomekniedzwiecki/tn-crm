import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Full campaign via single Manus task (single message, full context).
 * Manus robi wszystko w jednym przebiegu:
 *   1. Research konkurencji na Facebook Ad Library
 *   2. Copy reklamowe 5 wersji
 *   3. 5 kreacji graficznych z użyciem zdjęcia referencyjnego produktu
 *
 * Zwraca task_id; cron (campaign-check-progress) poluje i pobiera attachments
 * gdy Manus skończy.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let supabase: any = null
  let workflow_id: string = ''

  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')!
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const body = await req.json()
    workflow_id = body.workflow_id
    const continue_pipeline = body.continue_pipeline === true

    if (!workflow_id) {
      return new Response(JSON.stringify({ success: false, error: 'workflow_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Guard — nie odpalaj ponownie jeśli już działa
    const { data: current } = await supabase
      .from('workflow_ads')
      .select('campaign_pipeline_status, manus_full_task_id')
      .eq('workflow_id', workflow_id)
      .maybeSingle()

    if (current?.campaign_pipeline_status === 'running' && !continue_pipeline) {
      return new Response(JSON.stringify({ success: true, status: 'already_running', task_id: current.manus_full_task_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Pobierz pełny kontekst — branding, produkt, raporty
    const [brandingRes, workflowRes, reportsRes] = await Promise.all([
      supabase.from('workflow_branding').select('type, value').eq('workflow_id', workflow_id).eq('type', 'brand_info'),
      supabase.from('workflows').select('id, offer_name, landing_page_url, selected_product_id, customer_name').eq('id', workflow_id).single(),
      supabase.from('workflow_reports').select('title, type, file_url').eq('workflow_id', workflow_id).not('file_url', 'is', null).limit(10)
    ])

    const brandInfo = brandingRes.data?.[0]
    let brandVal: any = {}
    if (brandInfo?.value) brandVal = typeof brandInfo.value === 'string' ? JSON.parse(brandInfo.value) : brandInfo.value

    let product: any = {}
    if (workflowRes.data?.selected_product_id) {
      const { data: p } = await supabase.from('workflow_products')
        .select('name, description, image_url, source_url, price, currency, wholesale_price').eq('id', workflowRes.data.selected_product_id).maybeSingle()
      if (p) product = p
    }

    const brandName = brandVal.name || product.name || ''
    const productName = product.name || brandVal.name || ''
    const productDescription = product.description || brandVal.description || ''
    const landingUrl = workflowRes.data?.landing_page_url || ''
    const productImageUrl = product.image_url || ''

    // Lista raportów z linkami (PDF, infografika, analiza)
    const reportsList = (reportsRes.data || [])
      .map((r: any) => `- ${r.title} (${r.type}): ${r.file_url}`)
      .join('\n')

    // Buduj JEDEN kompletny prompt — Manus robi wszystko sam
    const instruction = `
Jesteś full-stack marketerem. Wykonasz KOMPLETNY materiał reklamowy Meta Ads dla polskiej marki e-commerce w jednym zrywie. Masz pełny kontekst — używaj raportów i zdjęcia referencyjnego.

=== KONTEKST KAMPANII ===

**MARKA:** ${brandName}
${brandVal.tagline ? `**TAGLINE:** ${brandVal.tagline}\n` : ''}**OPIS MARKI:** ${brandVal.description || '(brak)'}

**PRODUKT:** ${productName}
**OPIS PRODUKTU:** ${productDescription || '(brak)'}
${product.source_url ? `**Link do produktu u dostawcy:** ${product.source_url}` : ''}

${productImageUrl ? `**ZDJĘCIE REFERENCYJNE PRODUKTU (UŻYWAJ GO W KREACJACH 1:1):**
${productImageUrl}

Pobierz to zdjęcie i używaj dokładnie tego produktu w grafikach — zachowaj kształt, kolor, branding. To konkretny fizyczny produkt który sprzedajemy.
` : '(brak zdjęcia — wygeneruj produkt na podstawie opisu)'}

**LANDING PAGE:** ${landingUrl || '(brak)'}

${reportsList ? `**RAPORTY I ANALIZA PRODUKTU (pobierz i wykorzystaj dla kontekstu):**
${reportsList}

W raportach znajdziesz: grupę docelową, USP, analizę rynku, strategię marki. Wykorzystaj to zwłaszcza do copy.` : ''}

=== ZADANIA (wszystko w jednym przebiegu) ===

**1. RESEARCH KONKURENCJI**
Wejdź na Facebook Ad Library (https://www.facebook.com/ads/library/), filtr kraj=Polska. Znajdź 5-8 aktywnych reklam konkurencji dla tego typu produktu. Zanotuj: marka, tekst reklamy (max 200 znaków), headline, format, kąt. Zidentyfikuj luki i rekomendacje.

**2. COPY REKLAMOWE META ADS (5 wersji, polski rynek)**
Na podstawie researchu i raportów napisz 5 reklam z RÓŻNYMI kątami (myth-busting, transformation, social proof, curiosity, authority/technology).

Każda wersja:
- Primary Text: WOW factor w pierwszych 125 znakach (99% nie klika "See more")
- Headline: 27-40 znaków optimum (>50 = -30% CTR)
- Description: 25-30 znaków
- CTA: "Sprawdź szczegóły" / "Zobacz opinie" (NIE "Kup teraz")

Zasady: konkretne liczby > przymiotniki, emocjonalna konkretność, NIE podawaj cen, ton bezpośredni ale ciepły. Wykorzystaj LUKI konkurencji.

**3. 5 KREACJI GRAFICZNYCH FACEBOOK ADS**
Format: kwadrat 1080x1080 (1:1). Użyj DOKŁADNIE produktu ze zdjęcia referencyjnego — nie zmieniaj jego wyglądu.

Zrób 5 różnych formatów (każdy inny):

- **Kreacja 1 — Clean product + polski hook text**
  Produkt na ciemnym/gradientowym tle, wielki polski tekst hook (np. "3 MINUTY.", "95% BUTELEK NIE DZIAŁA"). Minimalistyczny, premium look. Branding marki widoczny.

- **Kreacja 2 — Lifestyle / UGC**
  Realna polska osoba (dopasowana persona z raportów) używa produktu w naturalnym otoczeniu. iPhone-style photo, ciepłe światło, autentyczne. Bez stockowego uśmiechu.

- **Kreacja 3 — Before/After lub Myth vs Fact**
  Split-screen lub dwa panele kontrastujące. Tekst polski: "MIT: ... / FAKT: ...". Mocny kontrast wizualny.

- **Kreacja 4 — Problem visualization**
  Pokazujesz BÓL / problem który produkt rozwiązuje (np. zmęczenie, źle wyglądająca skóra, nieczyste). Realistyczna dokumentalna foto. Może być z produktem jako rozwiązanie, może być bez.

- **Kreacja 5 — Authority / Social proof**
  Close-up produktu + element zaufania (cytat klienta, liczba sprzedanych szt., certyfikat). Lub scenariusz ekspert/lekarz/specjalista z produktem. Premium look.

ZASADY grafik:
- Polski tekst na obrazach (Nano Banana renderuje polskie znaki OK)
- Branding ${brandName} widoczny (logo w corner lub na produkcie)
- Ciepłe/jasne oświetlenie (ciemne/mroczne = niższy CTR)
- NIE białe tło studio (to wygląda jak Allegro)
- Produkt 1:1 z referencji — żadnej reimaginacji

=== OUTPUT ===

Na końcu zwróć:

1. **Plik JSON** "campaign.json" z research + copy:
\`\`\`json
{
  "research": {
    "competitors": [{"brand":"...","ad_text":"...","headline":"...","format":"...","angle":"...","ad_url":"..."}],
    "gaps": ["..."],
    "recommendations": ["..."]
  },
  "copy": {
    "wow_factor": "...",
    "target_group": "...",
    "versions": [
      {"angle":"...","primary_text":"...","headline":"...","description":"...","cta":"..."}
    ]
  }
}
\`\`\`

2. **5 obrazów PNG** jako attachments nazwane: ad_1_[angle].png, ad_2_[angle].png, ..., ad_5_[angle].png

3. Krótkie (3-5 zdań) podsumowanie co zrobiłeś.

Zacznij teraz. Pracuj samodzielnie aż skończysz wszystkie 3 zadania — nie pytaj o nic w międzyczasie. Jeśli czegoś brakuje, załóż sensowne defaulty i kontynuuj.
`.trim()

    // Utwórz task w Manus
    const createRes = await fetch('https://api.manus.ai/v2/task.create', {
      method: 'POST',
      headers: { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { content: instruction } })
    })
    const createData = await createRes.json()
    if (!createRes.ok || !createData.ok) {
      throw new Error('Manus task creation failed: ' + JSON.stringify(createData))
    }

    await supabase.from('workflow_ads').upsert({
      workflow_id,
      is_active: true,
      activated_at: new Date().toISOString(),
      manus_full_task_id: createData.task_id,
      campaign_pipeline_status: 'running',
      campaign_pipeline_step: 'manus_full',
      campaign_pipeline_started_at: new Date().toISOString()
    }, { onConflict: 'workflow_id' })

    console.log(`[manus-full] Task created: ${createData.task_id}`)

    return new Response(JSON.stringify({
      success: true,
      status: 'started',
      task_id: createData.task_id,
      manus_url: `https://manus.im/app/${createData.task_id}`
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('[manus-full] Error:', error)
    if (supabase && workflow_id) {
      try { await supabase.from('workflow_ads').update({ campaign_pipeline_status: 'failed' }).eq('workflow_id', workflow_id) } catch {}
    }
    return new Response(JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

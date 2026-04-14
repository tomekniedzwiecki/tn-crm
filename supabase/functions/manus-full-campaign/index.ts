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

    // REST API helpers — bezpieczniej niż JS SDK dla edge functions
    const restHeaders = {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
    const restGet = async (path: string) => {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: restHeaders })
      if (!r.ok) { console.error(`REST ${path} failed: ${r.status}`); return [] }
      return await r.json()
    }

    // ATOMIC LOCK: UPSERT z warunkiem — jeśli status = 'running', ten UPSERT zablokuje
    // równoległy request przez constraint UNIQUE(workflow_id).
    // Zamiast tego: najpierw sprawdzamy, potem atomic update z warunkiem WHERE status != 'running'
    if (!continue_pipeline) {
      // Próbuj atomic UPDATE: oznacz jako 'running' TYLKO jeśli obecnie nie jest 'running'
      const lockRes = await fetch(
        `${SUPABASE_URL}/rest/v1/workflow_ads?workflow_id=eq.${workflow_id}&campaign_pipeline_status=neq.running&select=workflow_id,manus_full_task_id`,
        {
          method: 'PATCH',
          headers: { ...restHeaders, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
          body: JSON.stringify({
            campaign_pipeline_status: 'running',
            campaign_pipeline_step: 'manus_full_starting',
            campaign_pipeline_started_at: new Date().toISOString()
          })
        }
      )
      const lockResult = lockRes.ok ? await lockRes.json() : []

      if (Array.isArray(lockResult) && lockResult.length === 0) {
        // Żaden rekord się nie zaktualizował — albo już running, albo nie istnieje
        // Sprawdźmy który to przypadek
        const checkArr = await restGet(`workflow_ads?workflow_id=eq.${workflow_id}&select=campaign_pipeline_status,manus_full_task_id`)
        const existing = Array.isArray(checkArr) && checkArr[0]
        if (existing?.campaign_pipeline_status === 'running') {
          console.log(`[manus-full] Already running — returning existing task ${existing.manus_full_task_id}`)
          return new Response(JSON.stringify({
            success: true,
            status: 'already_running',
            task_id: existing.manus_full_task_id
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        // Rekord nie istnieje — stwórz nowy z lockiem
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/workflow_ads`, {
          method: 'POST',
          headers: { ...restHeaders, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            workflow_id,
            is_active: true,
            activated_at: new Date().toISOString(),
            campaign_pipeline_status: 'running',
            campaign_pipeline_step: 'manus_full_starting',
            campaign_pipeline_started_at: new Date().toISOString()
          })
        })
        if (!insertRes.ok && insertRes.status !== 409) {
          // 409 = conflict (unique constraint) — znaczy że inny request właśnie go stworzył
          const errText = await insertRes.text()
          console.error(`[manus-full] Insert failed: ${insertRes.status} ${errText}`)
        }
        if (insertRes.status === 409) {
          // Inny request nas wyprzedził
          const reCheck = await restGet(`workflow_ads?workflow_id=eq.${workflow_id}&select=manus_full_task_id`)
          return new Response(JSON.stringify({
            success: true, status: 'already_running',
            task_id: reCheck?.[0]?.manus_full_task_id || null
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
      } else {
        console.log(`[manus-full] Acquired lock for ${workflow_id}`)
      }
    }

    // Pobierz pełny kontekst przez REST API
    const [brandingArr, workflowArr, reportsArr] = await Promise.all([
      restGet(`workflow_branding?workflow_id=eq.${workflow_id}&type=eq.brand_info&select=type,value`),
      restGet(`workflows?id=eq.${workflow_id}&select=id,offer_name,sales_page_url,selected_product_id,customer_name`),
      restGet(`workflow_reports?workflow_id=eq.${workflow_id}&file_url=not.is.null&select=title,type,file_url&limit=10`)
    ])

    // Stub "res.data" interface for rest of code
    const brandingRes = { data: brandingArr }
    const workflowRes = { data: Array.isArray(workflowArr) && workflowArr.length > 0 ? workflowArr[0] : null }
    const reportsRes = { data: reportsArr }

    console.log(`[manus-full] workflow found=${!!workflowRes.data}, selected_product_id=${workflowRes.data?.selected_product_id}`)

    const brandInfo = brandingRes.data?.[0]
    let brandVal: any = {}
    if (brandInfo?.value) brandVal = typeof brandInfo.value === 'string' ? JSON.parse(brandInfo.value) : brandInfo.value

    // Pobierz produkt — bezpośrednio przez REST API (bezpieczniej niż JS SDK)
    let product: any = {}
    const selectedProductId = workflowRes.data?.selected_product_id
    console.log(`[manus-full] selected_product_id=${selectedProductId}`)

    if (selectedProductId) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/workflow_products?id=eq.${selectedProductId}&select=name,description,image_url,source_url,price,currency,wholesale_price`,
          { headers: restHeaders }
        )
        if (res.ok) {
          const arr = await res.json()
          if (Array.isArray(arr) && arr.length > 0) {
            product = arr[0]
            console.log(`[manus-full] product loaded via REST: name="${product.name}", has_image=${!!product.image_url}`)
          } else {
            console.warn(`[manus-full] product ${selectedProductId} not found (empty array)`)
          }
        } else {
          console.error(`[manus-full] product REST fetch failed: ${res.status}`)
        }
      } catch (e) {
        console.error('[manus-full] product REST error:', e.message)
      }
    }
    // Fallback: workflow_products by workflow_id
    if (!product.image_url) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/workflow_products?workflow_id=eq.${workflow_id}&image_url=not.is.null&select=name,description,image_url,source_url&limit=1`,
          { headers: restHeaders }
        )
        if (res.ok) {
          const arr = await res.json()
          if (Array.isArray(arr) && arr.length > 0) {
            product = arr[0]
            console.log(`[manus-full] product via workflow_id fallback: ${product.name}`)
          }
        }
      } catch (e) {}
    }

    const brandName = brandVal.name || product.name || ''
    const productName = product.name || brandVal.name || ''
    const productDescription = product.description || brandVal.description || ''
    const landingUrl = workflowRes.data?.sales_page_url || ''
    const productImageUrl = product.image_url || ''
    const productSourceUrl = product.source_url || ''

    console.log(`[manus-full] final context: brand=${brandName}, product=${productName}, image=${productImageUrl ? 'YES' : 'NO'}`)

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

=== MATERIAŁY DO POBRANIA I WYKORZYSTANIA ===

${productImageUrl ? `🎯 **ZDJĘCIE PRODUKTU — TEN PRODUKT MA BYĆ NA WSZYSTKICH BANERACH REKLAMOWYCH:**
${productImageUrl}

⚠️ **KROK ZEROWY (zrób TERAZ, przed wszystkim innym):**
1. Pobierz to zdjęcie używając swojego narzędzia do pobierania plików (curl, wget, shell tool lub download)
2. Zapisz do katalogu roboczego jako "product_reference.jpg"
3. Przeanalizuj wizualnie — jaki jest kształt, kolor, materiał, branding produktu
4. Potwierdź w kolejnej wiadomości: "Pobrałem zdjęcie, widzę [opis]" — DOPIERO POTEM przechodź do zadań 1-3

To jest FIZYCZNY PRODUKT który sprzedajemy. W KAŻDEJ z 5 kreacji graficznych używaj DOKŁADNIE tego produktu ze zdjęcia — zachowaj kształt, kolor, materiał, branding. NIE wymyślaj innego wariantu.
` : '⚠️ BRAK zdjęcia produktu w bazie — wygeneruj produkt wizualnie na podstawie opisu.'}
${productSourceUrl ? `
📦 **Link do produktu u dostawcy (dodatkowe zdjęcia, opis techniczny):**
${productSourceUrl}
` : ''}
${landingUrl ? `
🌐 **Landing page marki (copy, ton komunikacji, branding):**
${landingUrl}
` : ''}
${reportsList ? `
📊 **RAPORTY I ANALIZY (pobierz — zawierają grupę docelową, USP, analizę rynku):**
${reportsList}

W raportach PDF znajdziesz szczegółową analizę: kim jest typowy klient (wiek, płeć, problemy), jakie ma pragnienia, czego się obawia, jakie są główne USP produktu, kto jest konkurencją. Wykorzystaj te dane szczególnie do copy i doboru persony na grafikach lifestyle.` : ''}

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

    // Utwórz task w Manus — ze zdjęciem produktu jako attachment (tak jak ręczny upload)
    const messagePayload: any = { content: instruction }
    if (productImageUrl) {
      // Określ content_type z rozszerzenia URL
      const urlLower = productImageUrl.toLowerCase()
      let ct = 'image/jpeg'
      if (urlLower.includes('.png')) ct = 'image/png'
      else if (urlLower.includes('.webp')) ct = 'image/webp'
      else if (urlLower.includes('.avif')) ct = 'image/avif'

      messagePayload.attachments = [{
        type: 'image',
        content_type: ct,
        filename: 'product_reference.' + (ct.split('/')[1] || 'jpg'),
        url: productImageUrl
      }]
      console.log(`[manus-full] Attaching product image: ${productImageUrl.substring(0, 80)}`)
    }

    const createRes = await fetch('https://api.manus.ai/v2/task.create', {
      method: 'POST',
      headers: { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messagePayload })
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

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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!MANUS_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'MANUS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { workflow_id } = await req.json()

    if (!workflow_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'workflow_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Pobierz dane workflow: branding, produkt, raporty
    const { data: brandingData } = await supabase
      .from('workflow_branding')
      .select('type, value, title, notes')
      .eq('workflow_id', workflow_id)
      .in('type', ['brand_info', 'ai_prompt'])

    const { data: workflowData } = await supabase
      .from('workflows')
      .select('id, offer_name, landing_page_url')
      .eq('id', workflow_id)
      .single()

    const { data: productsData } = await supabase
      .from('workflow_products')
      .select('name, description')
      .eq('workflow_id', workflow_id)

    // Wyciągnij brand info
    const brandInfo = brandingData?.find(b => b.type === 'brand_info')
    let brandName = ''
    let brandDescription = ''
    let productName = ''
    let productDescription = ''

    if (brandInfo?.value) {
      const val = typeof brandInfo.value === 'string' ? JSON.parse(brandInfo.value) : brandInfo.value
      brandName = val.name || ''
      brandDescription = val.description || ''
    }

    if (productsData?.length) {
      productName = productsData[0].name || ''
      productDescription = productsData[0].description || ''
    }

    // Wyciągnij kategorię produktu z opisu
    const category = productName || brandName || workflowData?.offer_name || 'produkt'

    const instruction = `
Przeszukaj Facebook Ad Library (https://www.facebook.com/ads/library/) dla reklam w Polsce.

Szukaj reklam dla produktów podobnych do: "${productName || category}"
${productDescription ? `Opis produktu: ${productDescription}` : ''}
${brandDescription ? `Opis marki: ${brandDescription}` : ''}

ZADANIE:
1. Wejdź na Facebook Ad Library
2. Ustaw filtr: Kraj = Polska, Kategoria = Wszystkie reklamy
3. Wyszukaj frazy związane z produktem (nazwa produktu, kategoria, synonimy)
4. Znajdź 10-15 AKTYWNYCH reklam konkurencji
5. Dla każdej reklamy zanotuj: tekst reklamy, typ formatu (obraz/karuzela/video), główny hook

ZWRÓĆ WYNIK W FORMACIE JSON:
{
  "category": "${category}",
  "search_queries": ["fraza1", "fraza2", "fraza3"],
  "competitors": [
    {
      "brand": "nazwa marki",
      "ad_text": "pełny tekst reklamy (primary text)",
      "headline": "nagłówek reklamy",
      "format": "image|carousel|video",
      "angle": "pain_point|transformation|social_proof|urgency|curiosity",
      "hook_type": "question|number|contrast|testimonial|myth_busting",
      "estimated_duration": "active since X days/weeks"
    }
  ],
  "common_angles": ["najczęściej używane kąty reklamowe"],
  "common_hooks": ["najczęściej używane typy hooków"],
  "gaps": ["Czego NIE mówi konkurencja - luki do wykorzystania"],
  "recommendations": [
    "Konkretna rekomendacja dla ${brandName || 'tej marki'} - jaki kąt wybrać i dlaczego",
    "Jaki hook będzie najskuteczniejszy na tle konkurencji"
  ]
}

WAŻNE:
- Szukaj TYLKO aktywnych reklam (nie archiwalnych)
- Skup się na polskim rynku
- Jeśli nie znajdziesz dokładnych reklam, szukaj w szerszej kategorii
- Zwróć TYLKO JSON, bez dodatkowego tekstu
`.trim()

    // Utwórz task w Manus
    const manusResponse = await fetch('https://api.manus.ai/v2/task.create', {
      method: 'POST',
      headers: {
        'x-manus-api-key': MANUS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: { content: instruction }
      })
    })

    const manusData = await manusResponse.json()

    if (!manusResponse.ok || !manusData.ok) {
      console.error('Manus API error:', manusData)
      return new Response(
        JSON.stringify({ success: false, error: 'Manus API error', details: manusData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Zapisz task ID w workflow_ads (upsert pattern)
    const { data: updateResult } = await supabase
      .from('workflow_ads')
      .update({
        competitor_research_task_id: manusData.task_id,
        competitor_research_status: 'pending'
      })
      .eq('workflow_id', workflow_id)
      .select()

    if (!updateResult?.length) {
      // Nie ma jeszcze rekordu - utwórz
      await supabase
        .from('workflow_ads')
        .insert({
          workflow_id,
          is_active: true,
          activated_at: new Date().toISOString(),
          competitor_research_task_id: manusData.task_id,
          competitor_research_status: 'pending'
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Research task created',
        task_id: manusData.task_id,
        status: 'pending'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

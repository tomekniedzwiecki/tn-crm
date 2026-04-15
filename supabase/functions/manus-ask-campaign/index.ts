import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Dogenerowanie campaign_spec do istniejącego wątku Manus.
 * Używane dla workflows które mają content (copy+kreacje) ale nie mają jeszcze
 * specyfikacji kampanii (bo Manus wygenerował je przed rozszerzeniem promptu).
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')!
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { workflow_id } = await req.json()
    if (!workflow_id) {
      return new Response(JSON.stringify({ ok: false, error: 'workflow_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Pobierz dane workflow_ads + workflow (sales_page_url, nazwa)
    const { data: ads } = await supabase.from('workflow_ads')
      .select('manus_full_task_id, ad_copies, ad_creatives').eq('workflow_id', workflow_id).maybeSingle()
    const { data: wf } = await supabase.from('workflows')
      .select('sales_page_url, customer_name, offer_name').eq('id', workflow_id).maybeSingle()

    if (!ads?.manus_full_task_id) {
      return new Response(JSON.stringify({ ok: false, error: 'Brak manus_full_task_id — workflow nie ma wątku w Manusie' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const landingUrl = wf?.sales_page_url || ''
    const brandName = wf?.customer_name || wf?.offer_name || 'marka'

    const content = `
Dogeneruj SPECYFIKACJĘ KAMPANII META ADS na podstawie researchu, copy i kreacji które już zrobiłeś w tym wątku.

WYMAGANIA:
- Jedna kampania z celem OUTCOME_SALES (Sprzedaż/Purchase)
- Budżet dzienny 10 zł na poziomie kampanii (CBO — Campaign Budget Optimization, NIE per ad set)
- Optymalizacja: OFFSITE_CONVERSIONS (Purchase z pikseli Mety)
- Placement: Advantage+ (automatyczne)
- Status: PAUSED (do sprawdzenia przez admina)
- Landing URL: ${landingUrl}

2 ad sety — różne persony (NIE duplikat!). Dobierz na bazie wcześniejszej analizy z tego wątku. Każda grupa:
- name: opisowa nazwa (np. "Mamy alergików 28-45")
- age_min, age_max, gender ("all" | "female" | "male")
- interests: 3-6 konkretnych po angielsku zgodnie z katalogiem Mety
- behaviors: opcjonalnie ("Online shoppers" itd.)
- creatives: ZAWSZE [0,1,2,3,4] — każda grupa dostaje WSZYSTKIE 5 kreacji (Meta sama zoptymalizuje, pełen A/B test)
- rationale: 1 zdanie — dlaczego ta persona

=== WYMAGANY OUTPUT ===

Zwróć TYLKO czysty JSON (bez fence \`\`\`), dokładnie taki:

{
  "campaign_spec": {
    "campaign": {
      "name": "${brandName} — Launch",
      "objective": "OUTCOME_SALES",
      "daily_budget_total": 10,
      "optimization_goal": "OFFSITE_CONVERSIONS",
      "placement": "advantage_plus",
      "status": "PAUSED",
      "landing_url": "${landingUrl}"
    },
    "ad_sets": [
      {"name":"...","age_min":25,"age_max":45,"gender":"all","interests":["..."],"behaviors":["..."],"creatives":[0,1,2,3,4],"rationale":"..."},
      {"name":"...","age_min":30,"age_max":55,"gender":"female","interests":["..."],"behaviors":["..."],"creatives":[0,1,2,3,4],"rationale":"..."}
    ]
  }
}

Nie dodawaj komentarza, nie generuj grafik, nie pisz wstępu. Tylko JSON powyżej.
`.trim()

    // Wyślij follow-up
    const sendRes = await fetch('https://api.manus.ai/v2/task.sendMessage', {
      method: 'POST',
      headers: { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: ads.manus_full_task_id, message: { content } })
    })
    const sendData = await sendRes.json()
    if (!sendRes.ok || sendData.ok === false) {
      return new Response(JSON.stringify({ ok: false, error: 'Manus sendMessage failed', details: sendData }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Zapisz znacznik czasu (tolerancyjnie — kolumna może jeszcze nie istnieć)
    try {
      await supabase.from('workflow_ads').update({
        campaign_spec_requested_at: new Date().toISOString()
      }).eq('workflow_id', workflow_id)
    } catch (e) { console.warn('campaign_spec_requested_at column missing', e) }

    return new Response(JSON.stringify({ ok: true, task_id: ads.manus_full_task_id, sent: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

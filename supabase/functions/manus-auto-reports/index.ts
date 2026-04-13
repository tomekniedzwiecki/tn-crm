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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')
    const META_ADS_CONNECTOR_UUID = Deno.env.get('MANUS_META_ADS_CONNECTOR_UUID')

    if (!MANUS_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'MANUS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Znajdź workflow z włączonymi auto-raportami
    const { data: workflowsToReport, error: fetchError } = await supabase
      .from('workflow_ads')
      .select(`
        id,
        workflow_id,
        ad_account_id,
        auto_reports_enabled,
        auto_reports_interval_days,
        last_auto_report_at,
        workflows!inner(id, name, client_email)
      `)
      .eq('auto_reports_enabled', true)
      .not('ad_account_id', 'is', null)

    if (fetchError) {
      console.error('Error fetching workflows:', fetchError)
      throw fetchError
    }

    console.log(`Found ${workflowsToReport?.length || 0} workflows with auto-reports enabled`)

    const results: any[] = []
    const now = new Date()

    for (const ads of workflowsToReport || []) {
      const intervalDays = ads.auto_reports_interval_days || 7
      const lastReport = ads.last_auto_report_at ? new Date(ads.last_auto_report_at) : null

      // Pobierz ostatni raport z historii żeby znać datę końcową
      const { data: lastReportRecord } = await supabase
        .from('workflow_ad_reports')
        .select('period_to')
        .eq('workflow_id', ads.workflow_id)
        .order('period_to', { ascending: false })
        .limit(1)
        .maybeSingle()

      const lastReportEndDate = lastReportRecord?.period_to ? new Date(lastReportRecord.period_to) : null

      // Sprawdź czy minęło wystarczająco dużo czasu od ostatniego raportu
      if (lastReportEndDate) {
        const daysSinceLastReportEnd = Math.floor((now.getTime() - lastReportEndDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceLastReportEnd < intervalDays) {
          console.log(`Skipping ${ads.workflow_id}: only ${daysSinceLastReportEnd} days since last report end (need ${intervalDays})`)
          continue
        }
      }

      // Oblicz daty - ciągłość bez nakładania się
      // dateFrom = dzień po ostatnim raporcie (lub 7 dni wstecz jeśli pierwszy raport)
      // dateTo = wczoraj (żeby mieć pełne dane)
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const dateTo = yesterday.toISOString().split('T')[0]

      let dateFrom: string
      if (lastReportEndDate) {
        // Dzień po ostatnim raporcie
        const dayAfterLast = new Date(lastReportEndDate.getTime() + 24 * 60 * 60 * 1000)
        dateFrom = dayAfterLast.toISOString().split('T')[0]
      } else {
        // Pierwszy raport - ostatnie 7 dni
        dateFrom = new Date(now.getTime() - intervalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      // Sprawdź czy mamy co raportować (dateFrom musi być przed dateTo)
      if (dateFrom >= dateTo) {
        console.log(`Skipping ${ads.workflow_id}: no date range to report (${dateFrom} >= ${dateTo})`)
        continue
      }

      console.log(`Generating report for workflow ${ads.workflow_id}: ${dateFrom} - ${dateTo}`)

      // Wywołaj Manus
      const instruction = `
Pobierz statystyki kampanii reklamowych z Meta Ads dla konta: ${ads.ad_account_id}

Okres: od ${dateFrom} do ${dateTo}

Zwróć dane w formacie JSON:
{
  "period": { "from": "${dateFrom}", "to": "${dateTo}" },
  "spend": [całkowite wydatki w PLN],
  "impressions": [liczba wyświetleń],
  "clicks": [liczba kliknięć],
  "ctr": [CTR w procentach],
  "cpc": [koszt za kliknięcie w PLN],
  "add_to_cart": [liczba zdarzeń AddToCart],
  "initiate_checkout": [liczba zdarzeń InitiateCheckout],
  "purchases": [liczba zakupów/konwersji Purchase],
  "conversion_rate": [współczynnik konwersji zakupów w %],
  "cost_per_purchase": [koszt za zakup w PLN],
  "revenue": [przychód z zakupów w PLN, jeśli dostępny],
  "roas": [ROAS = revenue/spend],
  "funnel": {
    "clicks_to_cart_rate": [% kliknięć które dodały do koszyka],
    "cart_to_checkout_rate": [% koszyków które przeszły do kasy],
    "checkout_to_purchase_rate": [% kas które zakończyły zakup]
  },
  "campaigns": [
    { "name": "nazwa kampanii", "spend": X, "purchases": Y, "impressions": Z, "add_to_cart": A, "initiate_checkout": B }
  ]
}

Pobierz eventy konwersji: AddToCart, InitiateCheckout, Purchase.
Jeśli nie ma danych, ustaw na 0.
Zwróć TYLKO JSON, bez dodatkowego tekstu.
`.trim()

      const requestBody: any = {
        message: {
          content: instruction
        }
      }

      if (META_ADS_CONNECTOR_UUID) {
        requestBody.message.connectors = [META_ADS_CONNECTOR_UUID]
      }

      try {
        const manusResponse = await fetch('https://api.manus.ai/v2/task.create', {
          method: 'POST',
          headers: {
            'x-manus-api-key': MANUS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        const manusData = await manusResponse.json()

        if (manusResponse.ok && manusData.ok) {
          // Zaktualizuj last_auto_report_at
          await supabase
            .from('workflow_ads')
            .update({
              last_auto_report_at: now.toISOString(),
              manus_task_id: manusData.task_id,
              manus_task_status: 'pending',
              manus_task_created_at: now.toISOString()
            })
            .eq('id', ads.id)

          results.push({
            workflow_id: ads.workflow_id,
            status: 'task_created',
            task_id: manusData.task_id,
            period: { from: dateFrom, to: dateTo }
          })
        } else {
          console.error(`Manus error for ${ads.workflow_id}:`, manusData)
          results.push({
            workflow_id: ads.workflow_id,
            status: 'error',
            error: manusData
          })
        }
      } catch (manusErr) {
        console.error(`Error calling Manus for ${ads.workflow_id}:`, manusErr)
        results.push({
          workflow_id: ads.workflow_id,
          status: 'error',
          error: manusErr.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
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

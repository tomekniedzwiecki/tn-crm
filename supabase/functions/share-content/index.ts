import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Admin ręcznie udostępnia content klientowi.
 * 1. Ustawia content_shared_with_client = true + content_shared_at = NOW()
 * 2. Wysyła email content_ready do klienta
 * 3. Triggeruje automation 'content_ready'
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { workflow_id } = await req.json()
    if (!workflow_id) {
      return new Response(JSON.stringify({ success: false, error: 'workflow_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Sprawdź czy content jest ready + pobierz dane klienta
    const { data: ads } = await supabase
      .from('workflow_ads')
      .select('content_ready, content_shared_with_client, ad_creatives')
      .eq('workflow_id', workflow_id)
      .maybeSingle()

    if (!ads?.content_ready || !ads?.ad_creatives?.length) {
      return new Response(JSON.stringify({ success: false, error: 'Content nie jest jeszcze gotowy' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: workflow } = await supabase
      .from('workflows')
      .select('id, customer_name, customer_email, unique_token, offer_name')
      .eq('id', workflow_id)
      .maybeSingle()

    if (!workflow?.customer_email) {
      return new Response(JSON.stringify({ success: false, error: 'Brak email klienta' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const alreadyShared = !!ads.content_shared_with_client
    const forceResend = !!(req.headers.get('x-force-resend')) // optional resend
    // `body.force_email === true` re-sends email even if already shared
    let forceEmailFromBody = false
    try {
      const b = await req.clone().json()
      forceEmailFromBody = !!b.force_email
    } catch {}
    const shouldSendEmail = !alreadyShared || forceResend || forceEmailFromBody

    // Ustaw flag
    await supabase
      .from('workflow_ads')
      .update({
        content_shared_with_client: true,
        content_shared_at: new Date().toISOString()
      })
      .eq('workflow_id', workflow_id)

    const clientName = (workflow.customer_name || 'Kliencie').split(' ')[0]
    const projectUrl = `https://crm.tomekniedzwiecki.pl/projekt/${workflow.unique_token}`

    // Wyślij email (pierwsze udostępnienie lub wymuszone)
    if (shouldSendEmail) {
      // 1. Automation trigger
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/automation-trigger`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            trigger_type: 'content_ready',
            entity_type: 'workflow',
            entity_id: workflow_id,
            context: {
              clientName,
              projectUrl,
              brandName: workflow.offer_name || '',
              creatives_count: ads.ad_creatives.length
            }
          })
        })
      } catch (e) { console.error('[share-content] automation-trigger failed:', (e as Error).message) }

      // Email obsługuje automatyzacja (trigger content_ready), nie wysyłamy bezpośrednio
    }

    return new Response(JSON.stringify({
      success: true,
      already_shared: alreadyShared,
      email_sent: shouldSendEmail
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('[share-content] Error:', error)
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

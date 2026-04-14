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
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { workflow_id, prompt } = await req.json()

    if (!workflow_id || !prompt) {
      return new Response(
        JSON.stringify({ success: false, error: 'workflow_id and prompt are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Wywołaj Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }],
        system: `Jesteś ekspertem od reklam Meta Ads na polskim rynku e-commerce.
Generujesz copy reklamowe które zatrzymują scroll i konwertują.

KLUCZOWE ZASADY:
- WOW FACTOR musi być w pierwszym zdaniu każdego Primary Text
- Primary Text: hook w pierwszych 125 znakach (99% nie klika "See more")
- Headline: 27-40 znaków optimal (max 50, >50 = -30% CTR)
- Description: 25-30 znaków
- NIE podawaj cen (zmieniają się, reklamy zostają)
- Ton: bezpośredni ale ciepły, polski rynek
- Każda wersja = NAPRAWDĘ inny kąt (nie parafrazuj)
- CTA: "Sprawdź szczegóły", "Zobacz opinie" (nie "Kup teraz")
- Konkretne liczby > przymiotniki
- Emocjonalna konkretność > generyczne opisy

Zwracaj TYLKO czysty JSON bez markdown, bez komentarzy.`
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error:', errorText)
      return new Response(
        JSON.stringify({ success: false, error: 'Claude API error', details: errorText }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const claudeData = await response.json()
    const content = claudeData.content?.[0]?.text || ''

    // Parsuj JSON z odpowiedzi
    let adCopies = null
    try {
      // Znajdź JSON w odpowiedzi
      let depth = 0, start = -1, end = -1
      for (let i = 0; i < content.length; i++) {
        if (content[i] === '{') { if (depth === 0) start = i; depth++ }
        else if (content[i] === '}') { depth--; if (depth === 0 && start !== -1) { end = i + 1; break } }
      }

      if (start !== -1 && end !== -1) {
        adCopies = JSON.parse(content.substring(start, end))
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseErr) {
      console.error('Parse error:', parseErr, 'Content:', content.substring(0, 500))
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse Claude response', raw: content.substring(0, 1000) }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Zapisz do bazy (upsert pattern)
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const now = new Date().toISOString()

    const { data: updateResult } = await supabase
      .from('workflow_ads')
      .update({
        ad_copies: adCopies,
        ad_copies_generated_at: now
      })
      .eq('workflow_id', workflow_id)
      .select()

    if (!updateResult?.length) {
      await supabase
        .from('workflow_ads')
        .insert({
          workflow_id,
          is_active: true,
          activated_at: now,
          ad_copies: adCopies,
          ad_copies_generated_at: now
        })
    }

    return new Response(
      JSON.stringify({ success: true, ad_copies: adCopies }),
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

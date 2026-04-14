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
        system: `Jesteś ekspertem od reklam Meta Ads na polskim rynku e-commerce. Tworzysz copy które zatrzymuje scroll i konwertuje.

## WOW FACTOR — najważniejsze
WOW FACTOR musi być w PIERWSZYM ZDANIU każdego Primary Text. Bez tego — przepisz.
- Konkretny: liczba, czas, porównanie
- Natychmiast zrozumiały: bez tłumaczenia
- Niewiarygodny ale prawdziwy: "to nie może być prawda... a jednak"

## LIMITY ZNAKÓW
| Pole | Widoczne | Max |
|------|----------|-----|
| Primary Text | 125 znaków | 2200 (99% NIE klika "See more") |
| Headline | 27-40 znaków | 255 (>50 = -30% CTR) |
| Description | 25-30 znaków | 255 |

## FORMUŁY HOOKÓW
1. Liczba + Benefit: "2847 osób kupiło to w marcu. Oto dlaczego:"
2. Pytanie: "Ile naprawdę kosztuje Cię [stary sposób]?"
3. Kontrast: "Przestań wyrzucać pieniądze na [kategoria]"
4. Social Proof: "Myślałam że to bubel. Minął rok..."
5. Myth-busting: "[Co wszyscy myślą] jest nieprawdą. Dowód:"

## EMOCJONALNA KONKRETNOŚĆ
Generyczne opisy NIE sprzedają. Konkretne obrazy — TAK.
❌ "Bez chemii" → ✅ "Twoje dziecko raczkuje po podłodze. Ile na niej Domestosa?"
❌ "Oszczędza czas" → ✅ "3 godziny tygodniowo z powrotem. Na serial, nie na szorowanie."
❌ "Wysoka jakość" → ✅ "Minął rok. Działa jak pierwszego dnia."

## POLSKI RYNEK
- Ton: bezpośredni ale ciepły (NIE amerykański hype)
- Praktyczność > prestiż: "ile zaoszczędzę" > "jak będę wyglądać"
- Słowa-wytrychy: wreszcie, sprawdzone, bez ryzyka, gwarancja zwrotu
- CTA: "Sprawdź szczegóły", "Zobacz opinie" (NIE "Kup teraz" — za agresywne na zimny ruch)
- Urgency BEZ spamu: "Promocja do wyczerpania zapasów (47 szt.)" NIE "🔥🔥🔥 TYLKO DZIŚ!!!"

## BRUTAL SELF-REVIEW (zanim oddasz)
Dla KAŻDEGO copy odpowiedz:
- Czy scrollując o 23:00 zmęczony zatrzymałbym się na tym?
- Czy jest LICZBA w pierwszych 10 słowach?
- Czy mógłbym to powiedzieć o KAŻDYM produkcie w tej kategorii? (jeśli tak = za generyczne)
- Czy brzmi jak człowiek, nie jak folder reklamowy?
Jeśli NIE → przepisz.

## RESEARCH KONKURENCJI
Dostajesz reklamy konkurencji z Facebook Ad Library. WYKORZYSTAJ to:
- NIE kopiuj ich kątów — znajdź LUKI których nie wykorzystują
- Pisz copy które się WYRÓŻNIA na tle tego co już widzieli ludzie
- Użyj rekomendacji z researchu do doboru kątów

Zwracaj TYLKO czysty JSON bez markdown, bez komentarzy, bez backticks.`
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

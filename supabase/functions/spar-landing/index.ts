// spar-landing — generacja DZIAŁAJĄCEGO landinga HTML dla projektu z lejka
// "Aplikacja" (tomekniedzwiecki.pl/aplikacja). Następny poziom po statycznych
// podglądach spar-image: gpt-5.5 pisze kompletny, samowystarczalny plik HTML
// (copy direct-response + design z brief.design + cennik z business_plan),
// zapisywany w publicznym Storage → link live do oglądania i udostępniania.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy spar-landing --no-verify-jwt
//
// STATUS: PILOT (2026-06-12) — wywołanie wymaga nagłówka x-admin-secret równego
// env SPAR_CRON_SECRET (admin-only; bez tego każdy mógłby palić tokeny gpt-5.5
// naszym kluczem). Przed podpięciem do frontendu sparingu: zamienić gate na
// sesyjny (wymóg preview_brief + werdykt zielony) + limity per sesja/IP jak
// w spar-image.
//
// Flow: POST {sessionId} → 202 {status:'started', url} natychmiast; generacja
// (1-4 min) leci w tle przez EdgeRuntime.waitUntil — bramka Supabase ucina
// bezczynne odpowiedzi po ~150 s, a klient i tak nie powinien wisieć. Gotowość
// sprawdzasz: HEAD na zwrócony url (200 = plik jest) albo wpis w spar_usage
// (kind='landing', meta.url).
//
// OGLĄDANIE: ⚠️ cała domena *.supabase.co neutralizuje HTML (anty-phishing):
// Storage public URL ORAZ odpowiedzi edge functions dostają wymuszone
// Content-Type: text/plain + CSP "default-src 'none'; sandbox" — przeglądarka
// pokazuje surowy kod (sprawdzone empirycznie 2026-06-12, GET handler tutaj
// nie pomógł i został usunięty). Landing renderuje strona-wrapper na NASZEJ
// domenie: https://tomekniedzwiecki.pl/aplikacja/podglad/?sid=<uuid>&t=<ts>
// (fetch ze Storage — CORS '*' — i render w sandboxowanym iframe srcdoc).
//
// Koszty: spar_usage kind='landing' (tokeny + cost_usd wg cennika modelu) —
// panel TN Aplikacje liczy z tego PLN jak dla chat/plan/image.
//
// Sekrety:
//   OPENAI_API_KEY      — klucz OpenAI (już ustawiony)
//   SPAR_LANDING_MODEL  — opcjonalny override modelu (default gpt-5.5;
//                         decyzja Tomka 2026-06-12: jakość > koszt)
//   SPAR_CRON_SECRET    — sekret admina (współdzielony ze spar-followups)

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
  'https://crm.tomekniedzwiecki.pl',
  'https://tn-crm.vercel.app',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

const LANDING_MODEL = Deno.env.get('SPAR_LANDING_MODEL') || 'gpt-5.5'
// HTML landinga to 15-25k tokenów + reasoning; 3000 ze spar-chat by ucięło plik
const MAX_COMPLETION_TOKENS = 40000
const MAX_LANDINGS_PER_SESSION = 3
const STORAGE_BUCKET = 'attachments'

// Cennik USD per 1M tokenów (jak w spar-chat) — do logu kosztów w spar_usage
const PRICING: Record<string, { input: number; cached: number; output: number }> = {
  'gpt-5.5': { input: 5.0, cached: 0.5, output: 30.0 },
  'gpt-5.1': { input: 1.25, cached: 0.125, output: 10.0 },
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ── Prompt ──────────────────────────────────────────────────────────────────
// Esencja wytycznych z docs/landing/ (copy.md: hero headline + anty-AI-poetic;
// 04-design.md: dokładnie 3 wow momenty hero/mid/conversion) przeniesiona do
// kontekstu "landing SaaS-u, który jeszcze nie istnieje" — bez reguł
// e-commerce (COD/wysyłka/testimoniale nie dotyczą podglądu koncepcyjnego).
const SYSTEM_PROMPT = `Jesteś zespołem w jednej osobie: senior front-end designer (poziom top shotów Dribbble, ale produkcyjny kod) + polski copywriter direct response z 15-letnim doświadczeniem. Piszesz JEDEN kompletny plik HTML — landing page narzędzia SaaS, które JESZCZE NIE ISTNIEJE. To podgląd koncepcyjny dla osoby, która wymyśliła to narzędzie: ma zobaczyć swoją wizję jako gotową, profesjonalną stronę sprzedażową i pomyśleć "to wygląda jak prawdziwy produkt".

FORMAT ODPOWIEDZI (bezwzględne):
- Zwróć WYŁĄCZNIE czysty HTML: od <!DOCTYPE html> do </html>. Zero markdownu, zero \`\`\`, zero komentarza przed ani po.
- Jeden samowystarczalny plik: cały CSS w <style>, cały JS w <script> na końcu <body>. ŻADNYCH zewnętrznych bibliotek, frameworków, obrazków (<img> z URL-ami = zakaz). Jedyny dozwolony zasób zewnętrzny: Google Fonts.
- Fonty: wybierz 1-2 z PEŁNĄ obsługą polskich znaków (np. Inter, Sora, Manrope, Outfit, Space Grotesk, Fraunces, Instrument Serif). Dobierz charakter fontu do charakteru produktu.
- Wszystkie wizualizacje produktu (mockup telefonu, okno aplikacji, dymki czatu, wykresy) budujesz czystym HTML/CSS — wypełnione realistycznymi POLSKIMI danymi wynikającymi z briefu (prawdziwie brzmiące imiona, daty, kwoty w zł). Zero lorem ipsum, zero angielskich placeholderów.

JĘZYK I COPY (najważniejsza część — to odróżnia profesjonalny landing od ładnego szablonu):
- Bezbłędna polszczyzna z pełnymi znakami diakrytycznymi.
- NAGŁÓWEK HERO: trafia w konkretny ból grupy docelowej + obiecuje rozwiązanie, maks 10 słów, działa nawet bez nazwy marki. Subheadline dodaje mechanizm działania (jak to robi) w 1-2 zdaniach.
- ANTY-AI-POETIC — pięć grzechów, których NIE WOLNO popełnić:
  1. Personifikacja przedmiotów ("aplikacja, która rozumie Twoje poranki") — przedmioty robią rzeczy fizyczne, nie ludzkie.
  2. "Oddaje/zwraca/przywraca Ci [wieczór/spokój/kontrolę]" — zamiast metafory wymiany podaj konkret: liczbę godzin, czynność, moment.
  3. Imperatyw "wracaj do X / odkupuj X" — brzmi jak coach motywacyjny.
  4. Pisanie co użytkownik ma POCZUĆ zamiast co produkt ROBI — zawsze akcja + liczba.
  5. Puste frazy: "innowacyjna technologia", "najlepszy na rynku", "wysoka jakość w przystępnej cenie".
- Nagłówki sekcji: konkretne, mówią co user zyskuje albo co produkt robi. Body text krótki, ścinany do esencji.
- ZAKAZ sekcji z opiniami klientów / liczbą użytkowników / logo firm — produkt nie istnieje, zmyślony social proof podważa wiarygodność całego podglądu. Zamiast tego: scenariusz użycia, liczby z mechaniki produktu, sekcja "dla kogo".

STRUKTURA (8-10 sekcji, kolejność dobierz pod projekt):
sticky nav (logo tekstowe + 2-3 kotwice + CTA) → hero z mockupem produktu w akcji → pasek 3 konkretnych liczb → problem (z perspektywy grupy docelowej, ich językiem) → jak działa (3 kroki) → pokaz głównej funkcji Z INTERAKCJĄ (patrz niżej) → co dostajesz (funkcje z briefu) → cennik (DOKŁADNIE liczby z briefu — karta główna + kontekst) → FAQ 4-5 pytań, które naprawdę zadałaby grupa docelowa → finalne CTA → stopka.

3 WOW MOMENTY (dokładnie trzy, po jednym na strefę; element, który pomysłodawca opisze znajomym "ten z..."):
- HERO: np. mockup z animowanym scenariuszem użycia (elementy wjeżdżają sekwencyjnie jak żywa aplikacja), oversized stat 120px+ z narracją, split-screen 60/40 z edge-to-edge mockupem.
- MID: np. interaktywny pokaz funkcji (taby/przełącznik/suwak zmieniający zawartość mockupu), porównanie "dziś vs z narzędziem" jako wertykalna oś czasu, pull-quote full-bleed z bólem klienta.
- CONVERSION: np. animowany gradient-beam wokół karty cennika, FAQ jako rozmowa z personą, finalne CTA z gigantycznym numerem/statem w tle.
NIE liczą się jako wow: fade-iny, countery, accordion, sticky CTA, bento grid — to baseline, który i tak masz zrobić porządnie.

INTERAKTYWNOŚĆ (vanilla JS, krótki i niezawodny):
- Reveal-on-scroll przez IntersectionObserver (subtelny, 0.6s).
- MINIMUM jedna realna interakcja pokazująca produkt: np. klikalne taby szablonów/funkcji zmieniające zawartość mockupu, przełącznik scenariuszy, symulacja "dnia z narzędziem".
- Smooth scroll do kotwic. Wszystko działa bez konsoli błędów.

DESIGN:
- Jeśli brief zawiera obiekt "design" (hexy tła/akcentów, geometria, typografia, podpis) — odwzoruj go DOKŁADNIE, to design system tego projektu spójny z resztą podglądów. Pole "styl" (życzenia klienta) ma najwyższy priorytet.
- Jakość: czysta siatka, świadoma hierarchia typograficzna (clamp), dużo światła, cienie miękkie i oszczędne, spójne zaokrąglenia. Strona ma wyglądać jak produkt zaprojektowany przez studio, nie jak szablon.
- Pełna responsywność: na 375px wszystko czytelne, grid łamie się sensownie, mockup nie wystaje poza viewport.

KONTEKST PODGLĄDU:
- Wszystkie CTA prowadzą do "#" (strona koncepcyjna).
- W stopce dyskretny dopisek: "Podgląd koncepcyjny — projekt powstał w tomekniedzwiecki.pl/aplikacja" (link do https://tomekniedzwiecki.pl/aplikacja/).`

function buildUserPrompt(
  brief: Record<string, unknown>,
  plan: Record<string, unknown> | null,
): string {
  // Brief przekazujemy w całości (bez pól technicznych) — model ma widzieć
  // wszystko, co ustalono w rozmowie; plan dostarcza realne liczby do cennika.
  const briefClean = { ...brief }
  delete briefClean.zmien
  const parts = [
    `BRIEF PROJEKTU (ustalenia z rozmowy z pomysłodawcą — jedyne źródło prawdy o produkcie):`,
    JSON.stringify(briefClean, null, 1),
  ]
  if (plan) {
    const p = plan as Record<string, unknown>
    parts.push(
      `PLAN PRZYCHODU (źródło liczb do sekcji cennika — cena i model rozliczenia MUSZĄ się zgadzać):`,
      JSON.stringify({
        cena: p.cena,
        cena_jednostka: p.cena_jednostka,
        model_przychodu: p.model_przychodu,
        cena_uzasadnienie: p.cena_uzasadnienie,
      }, null, 1),
    )
  }
  parts.push(`Wygeneruj kompletny landing page tego narzędzia zgodnie ze wszystkimi zasadami.`)
  return parts.join('\n\n')
}

// Model potrafi mimo zakazu owinąć odpowiedź w ```html — zdejmujemy płotki
// i ucinamy wszystko przed <!DOCTYPE / po </html>.
function extractHtml(raw: string): string | null {
  let text = raw.trim()
  text = text.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/, '')
  const start = text.search(/<!DOCTYPE html/i)
  const end = text.lastIndexOf('</html>')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + '</html>'.length)
}

function landingCostUsd(model: string, input: number, cached: number, output: number): number {
  const p = PRICING[model]
  if (!p) {
    console.warn(`[spar-landing] nieznany cennik modelu ${model} — koszt 0`)
    return 0
  }
  const fresh = Math.max(0, input - cached)
  return (fresh * p.input + cached * p.cached + output * p.output) / 1_000_000
}

// Właściwa generacja — odpalana w tle przez EdgeRuntime.waitUntil (pełny
// landing to 1-4 min; bramka Supabase nie utrzyma tak długiego requestu).
async function generateAndStore(
  supabase: ReturnType<typeof createClient>,
  apiKey: string,
  sessionId: string,
  brief: Record<string, unknown>,
  plan: Record<string, unknown> | null,
  storagePath: string,
  viewUrl: string,
): Promise<void> {
  const startedAt = Date.now()
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: LANDING_MODEL,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(brief, plan) },
        ],
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error(`[spar-landing] OpenAI error:`, res.status, errText.slice(0, 500))
      return
    }
    const data = await res.json()
    const raw = data?.choices?.[0]?.message?.content
    if (!raw || typeof raw !== 'string') {
      console.error('[spar-landing] pusta odpowiedź modelu', JSON.stringify(data?.choices?.[0]?.finish_reason))
      return
    }
    const html = extractHtml(raw)
    if (!html) {
      console.error('[spar-landing] odpowiedź bez kompletnego HTML, finish_reason:',
        data?.choices?.[0]?.finish_reason, 'len:', raw.length)
      return
    }

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, new TextEncoder().encode(html), {
        contentType: 'text/html; charset=utf-8',
        upsert: true,
      })
    if (uploadError) {
      console.error('[spar-landing] upload error:', uploadError)
      return
    }
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)

    // Log kosztów → panel TN Aplikacje (zakładka Koszty / szczegół sesji)
    const usage = data?.usage || {}
    const input = usage.prompt_tokens ?? 0
    const cached = usage.prompt_tokens_details?.cached_tokens ?? 0
    const output = usage.completion_tokens ?? 0
    const { error: usageErr } = await supabase.from('spar_usage').insert({
      session_id: sessionId,
      kind: 'landing',
      model: LANDING_MODEL,
      input_tokens: input,
      cached_tokens: cached,
      output_tokens: output,
      cost_usd: landingCostUsd(LANDING_MODEL, input, cached, output),
      meta: {
        url: viewUrl,
        storage_url: pub?.publicUrl || null,
        path: storagePath,
        html_bytes: html.length,
        duration_ms: Date.now() - startedAt,
        finish_reason: data?.choices?.[0]?.finish_reason || null,
      },
    })
    if (usageErr) console.error('[spar-landing] usage insert error:', usageErr)
    console.log(`[spar-landing] OK ${sessionId} ${storagePath} ${html.length}B ${Date.now() - startedAt}ms`)
  } catch (err) {
    console.error('[spar-landing] background ERROR:', err instanceof Error ? err.message : String(err))
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'metoda_niedozwolona' }, 405, corsHeaders)
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const ADMIN_SECRET = Deno.env.get('SPAR_CRON_SECRET')
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_SECRET) {
      console.error('[spar-landing] brak konfiguracji')
      return jsonResponse({ error: 'brak_konfiguracji' }, 500, corsHeaders)
    }

    // PILOT: tylko admin (patrz nagłówek pliku)
    if (req.headers.get('x-admin-secret') !== ADMIN_SECRET) {
      return jsonResponse({ error: 'brak_dostepu' }, 401, corsHeaders)
    }

    let body: { sessionId?: string }
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ error: 'nieprawidlowy_json' }, 400, corsHeaders)
    }
    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, corsHeaders)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: session, error: sessionError } = await supabase
      .from('spar_sessions')
      .select('id, preview_brief, business_plan')
      .eq('id', sessionId)
      .maybeSingle()
    if (sessionError) {
      console.error('[spar-landing] session fetch error:', sessionError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }
    if (!session) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, corsHeaders)
    }
    const brief = session.preview_brief as Record<string, unknown> | null
    if (!brief) {
      return jsonResponse({ error: 'brak_projektu' }, 400, corsHeaders)
    }

    const { count: landingCount, error: countErr } = await supabase
      .from('spar_usage')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('kind', 'landing')
    if (countErr) {
      console.error('[spar-landing] usage count error:', countErr)
    } else if ((landingCount ?? 0) >= MAX_LANDINGS_PER_SESSION) {
      return jsonResponse({ error: 'limit_landingow' }, 429, corsHeaders)
    }

    const ts = Date.now()
    const storagePath = `spar/${sessionId}/landing-${ts}.html`
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
    // Link do OGLĄDANIA — wrapper na naszej domenie (patrz nagłówek pliku)
    const viewUrl = `https://tomekniedzwiecki.pl/aplikacja/podglad/?sid=${sessionId}&t=${ts}`

    const task = generateAndStore(
      supabase, OPENAI_API_KEY, sessionId,
      brief, session.business_plan as Record<string, unknown> | null,
      storagePath, viewUrl,
    )
    // deno-lint-ignore no-explicit-any
    const runtime = (globalThis as any).EdgeRuntime
    if (runtime?.waitUntil) runtime.waitUntil(task)
    else task.catch(() => {})

    return jsonResponse({ status: 'started', viewUrl, url: pub?.publicUrl || null, path: storagePath, model: LANDING_MODEL }, 202, corsHeaders)
  } catch (error) {
    console.error('[spar-landing] ERROR:', error instanceof Error ? error.message : String(error))
    return jsonResponse({ error: 'blad_serwera' }, 502, corsHeaders)
  }
})

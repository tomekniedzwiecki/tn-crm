// spar-prototype — generacja DZIAŁAJĄCEGO, KLIKALNEGO prototypu narzędzia dla
// projektu z lejka "Aplikacja" (tomekniedzwiecki.pl/aplikacja). Następny poziom
// po landingu (spar-landing): tam gpt-5.5 pisze stronę SPRZEDAŻOWĄ narzędzia,
// tu pisze SAMO NARZĘDZIE — interaktywny prototyp głównej funkcji, w którym
// pomysłodawca może kliknąć, wpisać dane i zobaczyć reakcję. Moment "to działa,
// to jest moje" — najmocniejszy bodziec do rezerwacji rozmowy.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy spar-prototype --no-verify-jwt
//
// DOSTĘP (wzorzec spar-landing):
//   - sesyjny: sesja musi mieć preview_brief ORAZ zielony werdykt (prototyp to
//     element pakietu po domkniętej rozmowie); limity: 3/sesja (z spar_usage
//     kind='prototype') + 5/dobę/IP — endpoint publiczny, ~$0.45 na gpt-5.5
//   - admin: nagłówek x-admin-secret == SPAR_CRON_SECRET omija werdykt i limit
//     IP (rerolle z panelu / testy)
//
// STAN bez migracji: w przeciwieństwie do landinga (kolumna landing_url)
// prototyp NIE dostaje kolumny w spar_sessions — gotowość i URL żyją w
// spar_usage (kind='prototype', meta.url). Frontend pyta tę funkcję
// (action:'status') zamiast spar-project. Mniejszy ślad, zero ryzyka PostgREST.
//
// Flow: POST {sessionId} → 202 {status:'started'} natychmiast; generacja
// (1-4 min) leci w tle przez EdgeRuntime.waitUntil. Gotowość:
//   POST {sessionId, action:'status'} → {viewUrl|null}
// albo HEAD na storage url. Powrót na czystym urządzeniu: POST {sessionId} →
// {status:'exists', viewUrl} (bez kosztu).
//
// OGLĄDANIE: ten sam wrapper co landing —
//   https://tomekniedzwiecki.pl/aplikacja/podglad/?sid=<uuid>&t=<ts>&k=prototyp
// (fetch ze Storage + render w sandboxowanym iframe srcdoc; *.supabase.co
// neutralizuje HTML anty-phishingiem, więc renderuje NASZA domena).
// ⚠️ Sandbox to 'allow-scripts' BEZ allow-same-origin → localStorage/cookies
// RZUCAJĄ wyjątkiem; prototyp MUSI trzymać stan w pamięci JS (wymuszone w prompcie).
//
// Sekrety: OPENAI_API_KEY, SPAR_PROTOTYPE_MODEL (opc., default gpt-5.5),
//          SPAR_CRON_SECRET (admin, współdzielony ze spar-landing/followups).

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied, isTrustedInternalCall } from "../_shared/spar-owner.ts";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

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

const PROTOTYPE_MODEL = Deno.env.get('SPAR_PROTOTYPE_MODEL') || 'gpt-5.6-sol'
// gpt-5.5 to model rozumujący — tokeny reasoningu liczą się DO max_completion_tokens.
// Przy 40000 większe apki nie miały budżetu na dokończenie HTML (reasoning zjadał pulę
// → output bez </html> → walidacja odrzucała → cichy brak prototypu). Udane buildy
// historycznie miały 56–61k completion. Podbite, żeby reasoning + pełny HTML się mieściły.
const MAX_COMPLETION_TOKENS = parseInt(Deno.env.get('SPAR_PROTOTYPE_MAX_TOKENS') || '64000', 10)
const MAX_PROTOTYPES_PER_SESSION = 3
const MAX_PROTOTYPES_PER_IP_PER_DAY = parseInt(Deno.env.get('SPAR_PROTOTYPE_IP_DAILY') || '5', 10)
const STORAGE_BUCKET = 'attachments'

const PRICING: Record<string, { input: number; cached: number; output: number }> = {
  'gpt-5.6-sol': { input: 5.0, cached: 0.5, output: 30.0 },
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
// To NIE jest landing. Model buduje SAMO NARZĘDZIE w działaniu — aplikację,
// którą da się kliknąć i poużywać. Wow = "wpisałem coś i zareagowało jak
// prawdziwa apka", nie "ładna strona o aplikacji".
let SYSTEM_PROMPT = ''

// Archetypy interakcji — model wybiera pasujący. Tasujemy kolejność, żeby nie
// zbiegały do pierwszego z brzegu (lekcja z HERO_VARIANTS w spar-landing).
const ARCHETYPES: { id: string; opis: string }[] = [
  { id: 'lista-crm', opis: 'Lista/CRM: rekordy (klienci, zadania, zgłoszenia) z tagami statusu; dodawanie przez formularz, filtr/taby u góry, akcja per rekord (napisz, oznacz, otwórz szczegół w modalu/drugim ekranie).' },
  { id: 'generator', opis: 'Generator: pole/formularz wejścia → przycisk „Generuj" → spinner 600-900 ms → wynik złożony lokalnie z szablonu na danych wejścia (wiadomość, plan, opis, oferta); pod spodem historia wygenerowanych pozycji do podejrzenia.' },
  { id: 'dashboard-tracker', opis: 'Dashboard/tracker: kafle metryk + prosty wykres słupkowy/liniowy zbudowany w CSS/SVG; dodanie wpisu aktualizuje metryki i wykres na żywo; oznaczanie postępu (pasek, checkboxy).' },
  { id: 'kanban-workflow', opis: 'Kanban/workflow: 3 kolumny etapów, karty z polskimi danymi; klik (lub przyciski ◀▶) przesuwa kartę między etapami i aktualizuje liczniki kolumn; dodanie karty do pierwszej kolumny.' },
  { id: 'katalog-marketplace', opis: 'Katalog/marketplace: siatka kart (oferty, produkty, profile) + wyszukiwarka i filtry zmieniające widoczne karty; klik w kartę → ekran szczegółu z akcją (zarezerwuj, zapisz, kontakt).' },
  { id: 'konfigurator-kalkulator', opis: 'Konfigurator/kalkulator: suwaki i pola wejścia → wynik (cena, wycena, plan, dopasowanie) przeliczany na żywo przy każdej zmianie; podsumowanie z rozbiciem i przyciskiem akcji.' },
  { id: 'asystent-czat', opis: 'Asystent/czat: interfejs rozmowy z narzędziem; user klika gotowe podpowiedzi albo wpisuje, „asystent" po krótkim „pisze…" odpowiada treścią złożoną z szablonu na danych briefu; boczny panel z kontekstem/wynikami.' },
]

function shuffledPick<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

function archetypesBlock(): string {
  // pokazujemy wszystkie, ale w losowej kolejności — wybór ma wynikać z dopasowania
  return shuffledPick(ARCHETYPES, ARCHETYPES.length)
    .map((a) => `- [${a.id}] ${a.opis}`)
    .join('\n')
}

// Twarde walidacje — grep-checki; problemy wchodzą jako poprawki do krytyka.
function validateHtml(html: string, brief: Record<string, unknown>): string[] {
  const issues: string[] = []
  const diacritics = (html.match(/[ąćęłńóśźż]/gi) || []).length
  if (diacritics < 20) issues.push(`Podejrzanie mało polskich znaków diakrytycznych (${diacritics}) — popraw całą polszczyznę w UI i danych.`)
  if (/lorem ipsum/i.test(html)) issues.push('W treści jest „lorem ipsum" — zastąp realistyczną polską treścią.')
  if (/<img[^>]+src=["']https?:/i.test(html)) issues.push('Prototyp ładuje zewnętrzne obrazki <img> — usuń, wszystko buduj w HTML/CSS.')
  if (/<script[^>]+src=/i.test(html)) issues.push('Prototyp ładuje zewnętrzny skrypt — cały JS ma być inline.')
  if (/<link[^>]+href=["']https?:\/\/(?!fonts\.googleapis\.com|fonts\.gstatic\.com)/i.test(html)) {
    issues.push('Prototyp linkuje zewnętrzny zasób inny niż Google Fonts — usuń.')
  }
  // ⛔ najważniejsze: storage w sandboxie = biały ekran
  if (/\b(localStorage|sessionStorage|indexedDB)\b/.test(html) || /document\.cookie/.test(html)) {
    issues.push('Prototyp używa localStorage/sessionStorage/cookies/indexedDB — w sandboxie iframe to RZUCA WYJĄTEK i wywala apkę. Przenieś cały stan do zmiennych JS w pamięci, usuń każde odwołanie do storage.')
  }
  if (!/name=["']viewport["']/i.test(html)) issues.push('Brak meta viewport — prototyp nie będzie działał na telefonie.')
  if (/```/.test(html)) issues.push('W pliku zostały płotki markdown ``` — usuń.')
  if (/\b(TODO|PLACEHOLDER|Get started|Sign up|Add new|Submit|Search\.\.\.)\b/.test(html)) {
    issues.push('W treści są angielskie frazy albo placeholdery — przepisz na polski.')
  }
  const nazwa = typeof brief.nazwa === 'string' ? brief.nazwa.trim() : ''
  if (nazwa && !html.includes(nazwa)) issues.push(`Nazwa narzędzia „${nazwa}" nie pojawia się w interfejsie.`)
  if (!/addEventListener|onclick/i.test(html)) issues.push('Brak realnej interakcji w JS — prototyp ma reagować na kliknięcia, nie być statycznym obrazkiem.')
  // ⛔ deklaracja globala okna na najwyższym poziomie = „Identifier already declared" → biały ekran
  if (/^\s*(?:const|let|var)\s+(top|name|status|length|parent|self|closed|origin|event)\b/m.test(html)) {
    issues.push('Deklaracja zmiennej o nazwie globala okna (top/name/status/length/parent/self…) — w globalnym zakresie rzuca wyjątek i wywala apkę. Owiń cały JS w IIFE i/lub zmień nazwę.')
  }
  return issues
}

// Krytyk — drugi przebieg: lead product designer podnosi prototyp.
let CRITIC_SYSTEM = ''

function buildUserPrompt(brief: Record<string, unknown>, hasImages: boolean): string {
  const briefClean = { ...brief }
  delete briefClean.zmien
  const parts: string[] = []
  if (hasImages) {
    parts.push(`ZAŁĄCZONE GRAFIKI EKRANÓW (poniżej) = zatwierdzony design referencyjny tego narzędzia: pulpit, ekran głównej funkcji i ekran wspierający. Odtwórz je wiernie jako jeden, klikalny, działający produkt (kolejność = nawigacja między widokami).`)
  }
  parts.push(
    `BRIEF PROJEKTU (ustalenia z rozmowy z pomysłodawcą — źródło prawdy o nazwie, danych i funkcjach):`,
    JSON.stringify(briefClean, null, 1),
    `ARCHETYPY INTERAKCJI (wybierz dominujący, najlepiej pasujący do tego narzędzia i do tego, co widać na ekranach — możesz złączyć dwa):\n${archetypesBlock()}`,
    `Zbuduj kompletny, działający prototyp tego narzędzia zgodnie ze wszystkimi zasadami${hasImages ? ' i WIERNIE wg załączonych ekranów' : ''}. Klik ma coś robić — to ma wyglądać jak żywa aplikacja, nie obrazek.`,
  )
  return parts.join('\n\n')
}

function buildCriticUser(html: string, brief: Record<string, unknown>, issues: string[], hasImages: boolean): string {
  const briefClean = { ...brief }
  delete briefClean.zmien
  const parts: string[] = []
  if (hasImages) parts.push(`ZAŁĄCZONE GRAFIKI = zatwierdzony design referencyjny narzędzia. Prototyp ma wyglądać jak ich działająca wersja — sprawdź spójność i dociągnij.`)
  parts.push(`BRIEF PROJEKTU:\n${JSON.stringify(briefClean, null, 1)}`)
  if (issues.length) {
    parts.push(`WYKRYTE AUTOMATYCZNIE PROBLEMY (NAPRAW WSZYSTKIE, obowiązkowo):\n- ${issues.join('\n- ')}`)
  }
  parts.push(`PLIK DO PODNIESIENIA JAKOŚCI:\n${html}`)
  return parts.join('\n\n')
}

// Ekrany aplikacji z preview_images — design referencyjny dla prototypu.
// Tylko widoki UI narzędzia (pulpit/główna/wspierająca); pomijamy marketing
// (landing/sklep/telefon) i infografikę (podsumowanie).
function appScreenUrls(previewImages: Record<string, unknown> | null): string[] {
  if (!previewImages || typeof previewImages !== 'object') return []
  const order = ['panel', 'glowna', 'dodatkowa']
  const urls: string[] = []
  for (const k of order) {
    const v = previewImages[k]
    if (typeof v === 'string' && /^https?:\/\//.test(v)) urls.push(v)
  }
  return urls
}

async function openaiChat(
  apiKey: string,
  system: string,
  user: string,
  reasoningEffort: string | null,
  images: string[] = [],
): Promise<{ content: string | null; finish: string | null; input: number; cached: number; output: number }> {
  // Vision: grafiki ekranów wchodzą jako image_url w wiadomości usera —
  // gpt-5.5 „widzi" zatwierdzony design i odtwarza go jako działający produkt.
  const userContent: unknown = images.length
    ? [
        { type: 'text', text: user },
        ...images.map((url) => ({ type: 'image_url', image_url: { url, detail: 'high' } })),
      ]
    : user
  const body: Record<string, unknown> = {
    model: PROTOTYPE_MODEL,
    max_completion_tokens: MAX_COMPLETION_TOKENS,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userContent },
    ],
  }
  if (reasoningEffort) body.reasoning_effort = reasoningEffort
  const res = await openaiFetchRetry('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error('[spar-prototype] OpenAI error:', res.status, errText.slice(0, 500))
    return { content: null, finish: null, input: 0, cached: 0, output: 0 }
  }
  const data = await res.json()
  const usage = data?.usage || {}
  return {
    content: typeof data?.choices?.[0]?.message?.content === 'string' ? data.choices[0].message.content : null,
    finish: data?.choices?.[0]?.finish_reason || null,
    input: usage.prompt_tokens ?? 0,
    cached: usage.prompt_tokens_details?.cached_tokens ?? 0,
    output: usage.completion_tokens ?? 0,
  }
}

function extractHtml(raw: string): string | null {
  let text = raw.trim()
  text = text.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/, '')
  const start = text.search(/<!DOCTYPE html/i)
  const end = text.lastIndexOf('</html>')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + '</html>'.length)
}

function protoCostUsd(model: string, input: number, cached: number, output: number): number {
  const p = PRICING[model]
  if (!p) { console.warn(`[spar-prototype] nieznany cennik modelu ${model}`); return 0 }
  const fresh = Math.max(0, input - cached)
  return (fresh * p.input + cached * p.cached + output * p.output) / 1_000_000
}

// Najnowszy gotowy prototyp sesji (meta.url) z spar_usage — strona odczytu bez
// kolumny w spar_sessions. null = jeszcze nie ma (poll trwa).
async function latestPrototypeUrl(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('spar_usage')
    .select('meta, created_at')
    .eq('session_id', sessionId)
    .eq('kind', 'prototype')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) { console.error('[spar-prototype] latestPrototypeUrl error:', error); return null }
  const url = data?.meta && typeof (data.meta as Record<string, unknown>).url === 'string'
    ? (data.meta as Record<string, unknown>).url as string : null
  return url || null
}

// Trwały ślad NIEUDANEJ generacji (kind='prototype_error' — osobny kind, NIE koliduje
// z latestPrototypeUrl). Bez tego awarie były całkowicie ciche: kafel wisiał „Buduję…",
// a w bazie zero sygnału. reason: no_content | incomplete_html | upload | exception
async function recordPrototypeFail(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  reason: string,
  detail: Record<string, unknown>,
): Promise<void> {
  try {
    await supabase.from('spar_usage').insert({
      session_id: sessionId,
      kind: 'prototype_error',
      model: PROTOTYPE_MODEL,
      meta: { reason, ...detail },
    })
    console.error('[spar-prototype] FAIL', reason, JSON.stringify(detail))
  } catch (e) { console.error('[spar-prototype] recordPrototypeFail error:', e) }
}

// ── Generacja w tle (2-pass, wzorzec spar-landing) ──
async function generateAndStore(
  supabase: ReturnType<typeof createClient>,
  apiKey: string,
  sessionId: string,
  brief: Record<string, unknown>,
  screens: string[],
  storagePath: string,
  viewUrl: string,
): Promise<void> {
  const startedAt = Date.now()
  const releaseLock = async () => {
    const { error } = await supabase.rpc('spar_release_lock', { p_session: sessionId, p_key: 'prototype' })
    if (error) console.error('[spar-prototype] release lock error:', error)
  }
  try {
    // pass1 reasoning DOMYŚLNY (null) — sprawdzona, niecięta konfiguracja
    // ('high'/'medium' przy 48k zjadały budżet na reasoning → pusty output bez
    // </html>). Skok jakości daje design-first prompt + krytyk 'medium'.
    if (!SYSTEM_PROMPT) { try { const { data: __pd } = await supabase.from('settings').select('key, value').in('key', ['aplikacja_prompt_prototype_system', 'aplikacja_prompt_prototype_critic']); const __pv = (k: string) => ((__pd || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''; SYSTEM_PROMPT = __pv('aplikacja_prompt_prototype_system'); CRITIC_SYSTEM = __pv('aplikacja_prompt_prototype_critic') } catch (_e) { /* fallback: puste prompty */ } }
    const gen = await openaiChat(apiKey, SYSTEM_PROMPT, buildUserPrompt(brief, screens.length > 0), null, screens)
    if (!gen.content) {
      await recordPrototypeFail(supabase, sessionId, 'no_content', { finish: gen.finish, output_tokens: gen.output, duration_ms: Date.now() - startedAt })
      await releaseLock(); return
    }
    const html1 = extractHtml(gen.content)
    if (!html1) {
      console.error('[spar-prototype] pass1 bez kompletnego HTML, finish:', gen.finish, 'len:', gen.content.length)
      await recordPrototypeFail(supabase, sessionId, 'incomplete_html', { finish: gen.finish, content_len: gen.content.length, output_tokens: gen.output, duration_ms: Date.now() - startedAt })
      await releaseLock()
      return
    }
    const issues = validateHtml(html1, brief)
    if (issues.length) console.log('[spar-prototype] pass1 issues:', JSON.stringify(issues))

    const { error: upErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, new TextEncoder().encode(html1), {
        contentType: 'text/html; charset=utf-8',
        upsert: true,
      })
    if (upErr) { console.error('[spar-prototype] upload error:', upErr); await recordPrototypeFail(supabase, sessionId, 'upload', { error: String((upErr as { message?: string }).message || upErr), duration_ms: Date.now() - startedAt }); await releaseLock(); return }
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)

    // Publikacja wersji 1: wpis usage z meta.url = sygnał gotowości dla frontendu
    const { error: usageErr } = await supabase.from('spar_usage').insert({
      session_id: sessionId,
      kind: 'prototype',
      model: PROTOTYPE_MODEL,
      input_tokens: gen.input,
      cached_tokens: gen.cached,
      output_tokens: gen.output,
      cost_usd: protoCostUsd(PROTOTYPE_MODEL, gen.input, gen.cached, gen.output),
      meta: {
        url: viewUrl,
        storage_url: pub?.publicUrl || null,
        path: storagePath,
        html_bytes: html1.length,
        duration_ms: Date.now() - startedAt,
        finish_reason: gen.finish,
        hard_issues: issues.length,
        critic: 'pending',
      },
    })
    if (usageErr) console.error('[spar-prototype] usage insert error:', usageErr)
    await releaseLock()
    console.log(`[spar-prototype] pass1 OK ${sessionId} ${html1.length}B ${Date.now() - startedAt}ms`)

    // Pass 2 (krytyk) w osobnej inwokacji — pełne 400 s
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const ADMIN_SECRET = Deno.env.get('SPAR_CRON_SECRET')
    if (SUPABASE_URL && ADMIN_SECRET) {
      try {
        const trig = await fetch(`${SUPABASE_URL}/functions/v1/spar-prototype`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
          body: JSON.stringify({ action: 'critic', sessionId, path: storagePath }),
        })
        if (!trig.ok) console.error('[spar-prototype] critic trigger error:', trig.status, await trig.text().catch(() => ''))
      } catch (trigErr) {
        console.error('[spar-prototype] critic trigger fetch error:', trigErr)
      }
    }
  } catch (err) {
    console.error('[spar-prototype] background ERROR:', err instanceof Error ? err.message : String(err))
    await recordPrototypeFail(supabase, sessionId, 'exception', { error: err instanceof Error ? err.message : String(err), duration_ms: Date.now() - startedAt })
    await releaseLock()
  }
}

async function runCriticTask(
  supabase: ReturnType<typeof createClient>,
  apiKey: string,
  sessionId: string,
  storagePath: string,
): Promise<void> {
  const startedAt = Date.now()
  try {
    const { data: session, error: sErr } = await supabase
      .from('spar_sessions')
      .select('id, preview_brief, preview_images')
      .eq('id', sessionId)
      .maybeSingle()
    if (sErr || !session || !session.preview_brief) {
      console.error('[spar-prototype] critic: brak sesji/briefu', sErr); return
    }
    const brief = session.preview_brief as Record<string, unknown>
    const screens = appScreenUrls(session.preview_images as Record<string, unknown> | null)

    const { data: file, error: dlErr } = await supabase.storage.from(STORAGE_BUCKET).download(storagePath)
    if (dlErr || !file) { console.error('[spar-prototype] critic: download error', dlErr); return }
    const html1 = await file.text()
    const issues = validateHtml(html1, brief)

    let criticStatus = 'api_error'
    let finalLen = html1.length
    const critic = await openaiChat(apiKey, CRITIC_SYSTEM, buildCriticUser(html1, brief, issues, screens.length > 0), 'medium', screens)
    if (critic.content) {
      const candidate = extractHtml(critic.content)
      if (candidate && candidate.length >= html1.length * 0.6) {
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, new TextEncoder().encode(candidate), {
            contentType: 'text/html; charset=utf-8',
            upsert: true,
          })
        if (!upErr) {
          criticStatus = 'applied'
          finalLen = candidate.length
          const issues2 = validateHtml(candidate, brief)
          if (issues2.length) console.log('[spar-prototype] critic remaining issues:', JSON.stringify(issues2))
        } else {
          console.error('[spar-prototype] critic upload error:', upErr)
          criticStatus = 'upload_failed'
        }
      } else {
        console.error('[spar-prototype] critic odrzucony, len:', candidate ? candidate.length : null, 'finish:', critic.finish)
        criticStatus = 'rejected'
      }
    }

    const { data: usageRow, error: findErr } = await supabase
      .from('spar_usage')
      .select('id, input_tokens, cached_tokens, output_tokens, meta')
      .eq('session_id', sessionId)
      .eq('kind', 'prototype')
      .eq('meta->>path', storagePath)
      .maybeSingle()
    if (findErr || !usageRow) {
      console.error('[spar-prototype] critic: brak wpisu usage do aktualizacji', findErr)
    } else {
      const totalIn = (usageRow.input_tokens || 0) + critic.input
      const totalCached = (usageRow.cached_tokens || 0) + critic.cached
      const totalOut = (usageRow.output_tokens || 0) + critic.output
      const { error: updErr } = await supabase.from('spar_usage').update({
        input_tokens: totalIn,
        cached_tokens: totalCached,
        output_tokens: totalOut,
        cost_usd: protoCostUsd(PROTOTYPE_MODEL, totalIn, totalCached, totalOut),
        meta: {
          ...(usageRow.meta as Record<string, unknown> || {}),
          critic: criticStatus,
          html_bytes: finalLen,
          critic_ms: Date.now() - startedAt,
        },
      }).eq('id', usageRow.id)
      if (updErr) console.error('[spar-prototype] critic usage update error:', updErr)
    }
    console.log(`[spar-prototype] critic ${criticStatus} ${sessionId} ${finalLen}B ${Date.now() - startedAt}ms`)
  } catch (err) {
    console.error('[spar-prototype] critic ERROR:', err instanceof Error ? err.message : String(err))
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405, corsHeaders)

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const ADMIN_SECRET = Deno.env.get('SPAR_CRON_SECRET')
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_SECRET) {
      console.error('[spar-prototype] brak konfiguracji')
      return jsonResponse({ error: 'brak_konfiguracji' }, 500, corsHeaders)
    }

    let isAdmin = req.headers.get('x-admin-secret') === ADMIN_SECRET
    // Panel TN Aplikacje (przeglądarka) nie zna sekretu — autoryzuje się JWT
    // zalogowanego admina. Samo zalogowanie NIE wystarcza: publiczna rejestracja
    // w sparingu daje rolę authenticated każdemu z internetu, więc wymagamy
    // wpisu w team_members (wzorzec invoice-pdf). Admin omija werdykt i limity.
    if (!isAdmin) {
      const auth = req.headers.get('Authorization') || ''
      if (auth.startsWith('Bearer ')) {
        try {
          const ANON = Deno.env.get('SUPABASE_ANON_KEY') || SUPABASE_SERVICE_ROLE_KEY
          const uResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: { Authorization: auth, apikey: ANON },
          })
          if (uResp.ok) {
            const u = await uResp.json().catch(() => null)
            if (u?.id) {
              const tmResp = await fetch(
                `${SUPABASE_URL}/rest/v1/team_members?select=user_id&user_id=eq.${u.id}`,
                { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } },
              )
              const tm = await tmResp.json().catch(() => [])
              if (Array.isArray(tm) && tm.length > 0) isAdmin = true
            }
          }
        } catch { /* nie-admin — lecimy ścieżką sesyjną */ }
      }
    }

    let body: { sessionId?: string; action?: string; path?: string }
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

    // Bramka właściciela (PRZED 'status'/budową; admin omija — panel TN Aplikacje
    // generuje na żądanie): sesja przypięta do konta wymaga JWT tego konta,
    // link ?id= przestaje działać jak hasło (lustrzane odbicie spar-chat).
    if (!isAdmin && !isTrustedInternalCall(req)) {
      const authUser = await verifyAuthUser(req, supabase)
      const { data: own } = await supabase.from('spar_sessions').select('auth_user_id').eq('id', sessionId).maybeSingle()
      if (own && ownerDenied(own.auth_user_id as string | null, authUser)) {
        return jsonResponse({ error: 'wymagane_logowanie' }, 403, corsHeaders)
      }
    }

    // ── action 'status': frontend poll o gotowy URL ──
    if (body.action === 'status') {
      const viewUrl = await latestPrototypeUrl(supabase, sessionId)
      return jsonResponse({ viewUrl: viewUrl || null }, 200, corsHeaders)
    }

    // ── action 'critic': pass 2 w osobnej inwokacji ──
    if (body.action === 'critic') {
      if (!isAdmin) return jsonResponse({ error: 'brak_dostepu' }, 401, corsHeaders)
      const path = (body.path || '').trim()
      const file = path.split('/').pop() || ''
      if (path !== `spar/${sessionId}/${file}` || !/^prototyp-\d{10,16}\.html$/.test(file)) {
        return jsonResponse({ error: 'nieprawidlowa_sciezka' }, 400, corsHeaders)
      }
      const criticTask = runCriticTask(supabase, OPENAI_API_KEY, sessionId, path)
      // deno-lint-ignore no-explicit-any
      const rt = (globalThis as any).EdgeRuntime
      if (rt?.waitUntil) rt.waitUntil(criticTask)
      else criticTask.catch(() => {})
      return jsonResponse({ status: 'critic_started', path }, 202, corsHeaders)
    }

    const { data: session, error: sessionError } = await supabase
      .from('spar_sessions')
      .select('id, preview_brief, preview_images, verdict')
      .eq('id', sessionId)
      .maybeSingle()
    if (sessionError) {
      console.error('[spar-prototype] session fetch error:', sessionError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }
    if (!session) return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, corsHeaders)
    const brief = session.preview_brief as Record<string, unknown> | null
    if (!brief) return jsonResponse({ error: 'brak_projektu' }, 400, corsHeaders)
    if (!isAdmin && session.verdict !== 'zielony') {
      return jsonResponse({ error: 'brak_werdyktu' }, 400, corsHeaders)
    }

    // Istniejący prototyp wraca bez generacji (powrót na czystym urządzeniu;
    // wyścig ensure* paliłby ~$0.45/wywołanie). Reroll wymusza tylko admin.
    if (!isAdmin) {
      const existing = await latestPrototypeUrl(supabase, sessionId)
      if (existing) return jsonResponse({ status: 'exists', viewUrl: existing }, 200, corsHeaders)
    }

    const { count: protoCount, error: countErr } = await supabase
      .from('spar_usage')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('kind', 'prototype')
    if (countErr) {
      console.error('[spar-prototype] usage count error:', countErr)
    } else if ((protoCount ?? 0) >= MAX_PROTOTYPES_PER_SESSION) {
      return jsonResponse({ error: 'limit_prototypow' }, 429, corsHeaders)
    }

    // Lock — reload/drugi tab nie odpala duplikatu (~$0.55/budowa)
    const { data: genLock } = await supabase.rpc('spar_claim_lock', { p_session: sessionId, p_key: 'prototype', p_ttl_sec: 480 })
    if (!genLock) return jsonResponse({ status: 'pending' }, 202, corsHeaders)

    // Limit dzienny per IP (wzorzec spar-image/landing)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    if (!isAdmin && ip) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: ipSessions, error: ipErr } = await supabase
        .from('spar_sessions')
        .select('id')
        .eq('ip', ip)
      if (ipErr) {
        console.error('[spar-prototype] ip sessions query error:', ipErr)
      } else if (ipSessions && ipSessions.length) {
        const { count: ipCount, error: ipUsageErr } = await supabase
          .from('spar_usage')
          .select('id', { count: 'exact', head: true })
          .eq('kind', 'prototype')
          .in('session_id', ipSessions.map((r) => r.id))
          .gte('created_at', dayAgo)
        if (ipUsageErr) {
          console.error('[spar-prototype] ip usage count error:', ipUsageErr)
        } else if ((ipCount ?? 0) >= MAX_PROTOTYPES_PER_IP_PER_DAY) {
          return jsonResponse({ error: 'limit_prototypow_dzienny' }, 429, corsHeaders)
        }
      }
    }

    const screens = appScreenUrls(session.preview_images as Record<string, unknown> | null)

    const ts = Date.now()
    const storagePath = `spar/${sessionId}/prototyp-${ts}.html`
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
    const viewUrl = `https://tomekniedzwiecki.pl/aplikacja/podglad/?sid=${sessionId}&t=${ts}&k=prototyp`

    const task = generateAndStore(supabase, OPENAI_API_KEY, sessionId, brief, screens, storagePath, viewUrl)
    // deno-lint-ignore no-explicit-any
    const runtime = (globalThis as any).EdgeRuntime
    if (runtime?.waitUntil) runtime.waitUntil(task)
    else task.catch(() => {})

    return jsonResponse({ status: 'started', viewUrl, url: pub?.publicUrl || null, path: storagePath, model: PROTOTYPE_MODEL }, 202, corsHeaders)
  } catch (error) {
    console.error('[spar-prototype] ERROR:', error instanceof Error ? error.message : String(error))
    return jsonResponse({ error: 'blad_serwera' }, 502, corsHeaders)
  }
})

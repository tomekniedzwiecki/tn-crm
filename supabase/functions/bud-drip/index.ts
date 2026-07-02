// bud-drip — „sekwencja odkrywania" lejka /sklep „Zbuduję": progresywne odkrywanie
// artefaktów REALNIE zbudowanych dla leada (raport rynkowy → makiety → reklamy →
// strona → rezerwacja) rozłożone w czasie i bramkowane ZAANGAŻOWANIEM (wejścia do
// panelu) ORAZ ISTNIENIEM ARTEFAKTU (pole `requires` w REVEAL_PLAN). Zamiast wysypać
// wszystko naraz — odkrywamy po kolei, każdy = mail-„wow" z linkiem do panelu + CTA
// rezerwacji 500 zł (zwrotnej). Zimny lead → pauza (nie palimy kasy/czasu).
//
// FORK silnika spar-drip (Aplikacja) na lejek /sklep. Tabele bud_* są lustrem spar_*
// (te same kolumny, tylko prefiks). Różnice merytoryczne: artefakty /sklep (market_report,
// ustalenia, mockups, session_ads, landing_html) zamiast app-owych (rynek/economics/gtm/
// prototyp); pole `requires` w planie; model gpt-5.5; flaga BUD_FOLLOWUPS_ENABLED przed
// KAŻDĄ realną wysyłką (maila i SMS) — generowanie/preview/seed działają bez wysyłki.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt:
//   npx supabase functions deploy bud-drip --no-verify-jwt
//
// AKCJE (POST JSON):
//   {} (cron, x-cron-secret)         → seed + przetwórz due reveale (gate + requires)
//   { action:'status', sessionId }   → plan reveali + zaangażowanie (panel admina)
//   { action:'seed', sessionId }     → utwórz wiersze planu (idempotentne)
//   { action:'fire', sessionId, key?, send? } → ADMIN TEST: podgląd (send:false) lub
//                                       wymuszenie odsłony teraz (send:true), z pominięciem bramki/due
//   { action:'cancel'|'resume', sessionId }   → ręczne wstrzymanie/wznowienie sekwencji
//   { action:'templates' }           → galeria statycznych szablonów (dane przykładowe)
//   wszystkie akcje admina wymagają nagłówka x-admin-secret == SPAR_CRON_SECRET (współdzielony).

import { createClient } from "jsr:@supabase/supabase-js@2";
import { REVEAL_PLAN, PANEL_VISITS_GATE } from "../_shared/bud-reveal-plan.ts";

const PANEL_URL = 'https://tomekniedzwiecki.pl/sklep/'
const CHECKOUT_URL = 'https://crm.tomekniedzwiecki.pl/checkout/v2/'
const OFFER_ID = Deno.env.get('BUD_OFFER_ID') || ''
const FN = (name: string) => `${Deno.env.get('SUPABASE_URL')}/functions/v1/${name}`

// Kadencja sekwencji + bramki = JEDNO źródło w ../_shared/bud-reveal-plan.ts (import wyżej).
// Tu już NIE definiujemy planu — rozjazd kopii był źródłem bugów w spar.
const ENGAGE_WINDOW_DAYS = 3    // brak aktywności dłużej niż to → PAUZA kolejnych odsłon (odwracalne)
const LOST_WINDOW_DAYS = 7      // brak aktywności dłużej niż to → PRZEGRANY (twardy koniec)
// Min. odstęp między DWOMA odsłonami tej samej sesji — bezpiecznik na „nadrabianie"
// wielu zaległych due naraz (lead z nocy: raport/makiety/reklamy wpadają rano w jedno okno).
const REVEAL_MIN_GAP_MS = 90 * 60 * 1000
const MAX_FIRES_PER_RUN = 12

// FLAGA BEZPIECZEŃSTWA — realna wysyłka maila/SMS TYLKO gdy BUD_FOLLOWUPS_ENABLED==='1'.
// Gdy off: generowanie/preview/seed działają normalnie (da się smoke'ować bez wysyłki),
// ale realna wysyłka jest pomijana (log + status zostaje pending/nie-wysłany).
function followupsEnabled(): boolean { return (Deno.env.get('BUD_FOLLOWUPS_ENABLED') || '') === '1' }

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}
// Koszt SMS = segmenty (points z SMSAPI) × 0,10 zł, przeliczone na USD bieżącym kursem
// settings.usd_pln_rate (bud_usage trzyma USD; panel wyświetla tym samym kursem).
const SMS_PLN_PER_POINT = 0.10
let _usdPln: number | null = null
async function usdPlnRate(supabase: ReturnType<typeof createClient>): Promise<number> {
  if (_usdPln != null) return _usdPln
  try {
    const { data } = await supabase.from('settings').select('value').eq('key', 'usd_pln_rate').maybeSingle()
    const v = data && (data as { value?: unknown }).value
    _usdPln = v ? Number(v) : 4.0
  } catch { _usdPln = 4.0 }
  return _usdPln && _usdPln > 0 ? _usdPln : 4.0
}
function warsawHour(): number {
  return parseInt(new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', hour: 'numeric', hour12: false }).format(new Date()), 10)
}
function panelLink(sid: string, campaign: string, hash = ''): string {
  return `${PANEL_URL}?id=${sid}&utm_source=email&utm_medium=drip&utm_campaign=${campaign}${hash}`
}
function checkoutLink(leadId: string | null): string {
  const offer = OFFER_ID ? `offer=${OFFER_ID}&` : ''
  return `${CHECKOUT_URL}?${offer}${leadId ? `lead=${encodeURIComponent(leadId)}&` : ''}utm_source=email&utm_medium=drip`
}
// Model do personalizacji treści maili. /sklep = gpt-5.5 (NIE 5.1 — 5.1 psuł treści sklepowe).
const OPENAI_MODEL = Deno.env.get('BUD_EMAIL_MODEL') || 'gpt-5.5'
const PRICES: Record<string, { i: number; c: number; o: number }> = { 'gpt-5.5': { i: 5, c: 0.5, o: 30 }, 'gpt-5.1': { i: 1.25, c: 0.125, o: 10 }, 'gpt-4o': { i: 2.5, c: 1.25, o: 10 }, 'gpt-4o-mini': { i: 0.15, c: 0.075, o: 0.6 } }

// Prompty dripu: JEDNO źródło = settings. SITUATION + SYSTEM + cele ładowane raz na
// cold-start (ensureDripPrompts). W szablonie SYSTEM placeholdery {{SYTUACJA}} i
// {{MODEL_BLOCK}} podstawiane przy budowie promptu. Pusty fallback = bezpiecznik
// (→ statyczny reveal), NIE kopia treści.
let DRIP_SITUATION = ''
let DRIP_SYSTEM = ''
let DRIP_CELE: Record<string, string> = {}
async function ensureDripPrompts(supabase: ReturnType<typeof createClient>): Promise<void> {
  if (DRIP_SYSTEM) return
  try {
    const { data } = await supabase.from('settings').select('key, value')
      .in('key', ['budowanie_mail_sytuacja', 'budowanie_drip_system', 'budowanie_mail_cele'])
    const ev = (k: string) => ((data || []) as Array<{ key: string; value: string }>).find((r) => r.key === k)?.value || ''
    DRIP_SITUATION = ev('budowanie_mail_sytuacja')
    DRIP_SYSTEM = ev('budowanie_drip_system')
    try { DRIP_CELE = JSON.parse(ev('budowanie_mail_cele') || '{}') } catch (pErr) { console.error('[bud-drip] cele JSON parse:', pErr); DRIP_CELE = {} }
  } catch (_e) { /* fallback: puste → statyczny reveal (bezpiecznik) */ }
}

// Model biznesowy — JEDNO źródło (settings.budowanie_mail_email_system), ładowane raz w handlerze.
let MODEL_BLOCK = ''

function escHtml(s: string): string { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

// Body od GPT (zwykły tekst) -> minimalny HTML „jak pisany w skrzynce".
// Linki TYLKO przez tokeny [tekst](LINK_VIEW)/[tekst](LINK_RESERVE) — żadnych
// wymyślonych adresów, żadnych buttonów. Podpis dokleja send-email.
// Grafiki artefaktu WSTAWIONE w treść maila (email-safe: tabela 2-up, inline style, absolutne URL-e
// Storage). Lead widzi REALNE banery/makiety/podgląd sklepu W MAILU, nie tylko link do panelu.
// Wstępny biznesplan w mailu (req Tomka) — email-safe (light, tabela). Pokazuje
// horyzonty 3/6/12/24 i ile KLIENTOWI zostaje na czysto. Dokładany do maila REZERWACJI
// (zamknięcie). Renderowany tylko gdy plan istnieje (sesje po zielonym werdykcie).
// deno-lint-ignore no-explicit-any
function bizplanEmailHtml(plan: any): string {
  if (!plan || typeof plan !== 'object') return ''
  // deno-lint-ignore no-explicit-any
  const H = Array.isArray(plan.horyzonty) ? plan.horyzonty.filter((h: any) => h && typeof h.mies === 'number') : []
  if (!H.length) return ''
  const fmt = (n: unknown) => (typeof n === 'number' ? String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : escHtml(String(n || '')))
  // deno-lint-ignore no-explicit-any
  const rows = H.map((h: any) => `<tr>` +
    `<td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:700;color:#1a1a1a;font-size:13px;">${escHtml(h.tytul || ('Miesiąc ' + h.mies))}</td>` +
    `<td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;color:#555;font-size:12.5px;white-space:nowrap;">${fmt(h.zamowienia_mies)} zam./mies.</td>` +
    `<td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:800;color:#15a34a;font-size:14px;white-space:nowrap;">${fmt(h.zysk_klienta_mies)} zł<span style="font-weight:400;color:#999;font-size:11px;"> na czysto</span></td>` +
    `</tr>`).join('')
  const why = (typeof plan.dlaczego_realne === 'string' && plan.dlaczego_realne.trim())
    ? `<p style="margin:10px 0 0;font-size:12.5px;color:#666;line-height:1.5;">${escHtml(plan.dlaczego_realne)}</p>` : ''
  return `<div style="margin:22px 0 6px;">` +
    `<div style="font-size:14px;color:#1a1a1a;margin:0 0 4px;font-weight:700;">Twój wstępny biznesplan</div>` +
    `<div style="font-size:12.5px;color:#666;margin:0 0 10px;line-height:1.5;">Prognoza specjalisty osadzona w Twoim produkcie i rynku — ile realnie zostaje Tobie na czysto (po koszcie towaru, wysyłki, reklamy i po 10% Tomka od przychodu):</div>` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:540px;border-collapse:collapse;background:#fafafa;border:1px solid #ececec;border-radius:12px;overflow:hidden;">${rows}</table>` +
    why +
    `</div>`
}

// deno-lint-ignore no-explicit-any
function artifactImagesHtml(s: any, key: string, viewUrl: string): string {
  let urls: string[] = []
  let caption = ''
  const mocks = Array.isArray(s.mockups) ? s.mockups : []
  const ads = Array.isArray(s.session_ads) ? s.session_ads : []
  const chosenMock = mocks.filter((m: any) => m && m.style === s.chosen_style)[0] || mocks[0]
  if (key === 'makiety') {
    urls = mocks.map((m: any) => m && m.url).filter(Boolean).slice(0, 4)
    caption = 'Makiety Twojego sklepu:'
  } else if (key === 'reklamy') {
    urls = ads.map((a: any) => a && (a.image_url || a.url)).filter(Boolean).slice(0, 4)
    caption = 'Gotowe kreacje reklamowe:'
  } else if (key === 'strona') {
    if (chosenMock && chosenMock.url) urls = [chosenMock.url]
    caption = 'Tak wygląda Twój sklep:'
  } else if (key === 'rezerwacja') {
    const firstAd = ads.map((a: any) => a && (a.image_url || a.url)).filter(Boolean)[0]
    urls = [chosenMock && chosenMock.url, firstAd].filter(Boolean).slice(0, 2) as string[]
    caption = 'Komplet, który dla Ciebie zebraliśmy:'
  }
  // Biznesplan dokładamy do maila REZERWACJI (zamknięcie) — także gdy nie ma obrazków.
  const extra = key === 'rezerwacja' ? bizplanEmailHtml(s.business_plan) : ''
  if (!urls.length) return extra
  const single = urls.length === 1
  const cell = (u: string) => `<td style="padding:5px;${single ? '' : 'width:50%;'}vertical-align:top;"><a href="${viewUrl}" target="_blank" style="text-decoration:none;"><img src="${u}" alt="${escHtml(caption)}" width="100%" style="display:block;width:100%;max-width:${single ? '460' : '260'}px;border-radius:12px;border:1px solid #ececec;" /></a></td>`
  let rows = ''
  for (let i = 0; i < urls.length; i += (single ? 1 : 2)) {
    const a = cell(urls[i])
    const b = !single ? (urls[i + 1] ? cell(urls[i + 1]) : '<td style="width:50%;"></td>') : ''
    rows += `<tr>${a}${b}</tr>`
  }
  return `<div style="margin:18px 0 6px;"><div style="font-size:13px;color:#555;margin:0 0 8px;font-weight:600;">${escHtml(caption)}</div><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:540px;border-collapse:collapse;">${rows}</table></div>` + extra
}

function mdToHtml(body: string, viewUrl: string, reserveUrl: string | null, imagesHtml = ''): string {
  let t = escHtml(body || '')
  t = t.replace(/\[([^\]]+)\]\(LINK_VIEW\)/g, (_m, l) => `<a href="${viewUrl}" style="color:#2563eb;">${l}</a>`)
  t = t.replace(/\[([^\]]+)\]\(LINK_RESERVE\)/g, (_m, l) => reserveUrl ? `<a href="${reserveUrl}" style="color:#2563eb;">${l}</a>` : String(l))
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // resztki markdown -> sam tekst
  if (t.indexOf(viewUrl) < 0) t += `\n\nZobacz tutaj: <a href="${viewUrl}" style="color:#2563eb;">${viewUrl}</a>`
  const paras = t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const inner = paras.map((p) => `<p style="margin:0 0 14px;">${p.replace(/\n/g, '<br>')}</p>`).join('')
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">${inner}${imagesHtml || ''}</div>`
}

// deno-lint-ignore no-explicit-any
function firstName(s: any): string { return (s.name || '').trim().split(' ')[0] || '' }
// Nazwa produktu/marki: ustalenia.nazwa → market_report.naglowek → preview_brief.nazwa
// → karta projektu (problem_summary). Fallback: „Twój sklep".
// deno-lint-ignore no-explicit-any
function productName(s: any): string {
  const u = s.ustalenia && typeof s.ustalenia === 'object' ? s.ustalenia as Record<string, unknown> : {}
  if (typeof u.nazwa === 'string' && u.nazwa.trim()) return u.nazwa.trim()
  const r = s.market_report && typeof s.market_report === 'object' ? s.market_report as Record<string, unknown> : {}
  if (typeof r.naglowek === 'string' && r.naglowek.trim()) return r.naglowek.trim()
  const b = s.preview_brief && typeof s.preview_brief === 'object' ? s.preview_brief as Record<string, unknown> : {}
  if (typeof b.nazwa === 'string' && b.nazwa.trim()) return b.nazwa.trim()
  const k = s.problem_summary && typeof s.problem_summary === 'object' ? s.problem_summary as Record<string, unknown> : {}
  if (typeof k.nazwa === 'string' && (k.nazwa as string).trim()) return (k.nazwa as string).trim()
  if (typeof k.produkt === 'string' && (k.produkt as string).trim()) return (k.produkt as string).trim()
  return 'Twój sklep'
}

// ── Czy artefakt danej odsłony JUŻ ISTNIEJE (== pole bud_sessions z `requires`) ──
// Pole `requires` z REVEAL_PLAN wskazuje kolumnę, która musi być nie-pusta, by odsłona
// miała sens. requires:null (rezerwacja) → zawsze gotowa.
// deno-lint-ignore no-explicit-any
function hasArtifact(s: any, field: string | null): boolean {
  if (!field) return true
  const v = s[field]
  if (v == null) return false
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'string') return v.trim().length > 0
  if (typeof v === 'object') return Object.keys(v).length > 0
  return !!v
}

// Adres podglądu artefaktu (link „zobacz" w mailu) — zawsze do panelu /sklep z kotwicą.
// deno-lint-ignore no-explicit-any
function revealView(s: any, key: string): string {
  const hash: Record<string, string> = {
    raport: '#raport', makiety: '#makiety', reklamy: '#reklamy',
    strona: '#strona', rezerwacja: '#rezerwacja',
  }
  return panelLink(s.id, `reveal_${key}`, hash[key] || '')
}

function clipText(t: unknown, n: number): string {
  const s = typeof t === 'string' ? t : (t == null ? '' : String(t))
  return s.replace(/\s+/g, ' ').trim().slice(0, n)
}
function clipJson(o: unknown, n: number): string { try { const t = JSON.stringify(o); return t && t !== '{}' && t !== 'null' && t !== '[]' ? t.slice(0, n) : '' } catch { return '' } }

// Znajdź sekcję raportu po fragmencie tytułu (case-insensitive, dowolny z aliasów).
// deno-lint-ignore no-explicit-any
function findSection(report: any, aliases: string[]): { tytul: string; tresc: string } | null {
  const sekcje = report && Array.isArray(report.sekcje) ? report.sekcje as Array<Record<string, unknown>> : []
  for (const sec of sekcje) {
    const tytul = typeof sec.tytul === 'string' ? sec.tytul : ''
    const low = tytul.toLowerCase()
    if (aliases.some((a) => low.includes(a.toLowerCase()))) {
      return { tytul, tresc: typeof sec.tresc === 'string' ? sec.tresc : '' }
    }
  }
  return null
}

// Cel maila + PRAWDZIWE dane z tego etapu (z artefaktów /sklep, by GPT cytował konkrety).
// deno-lint-ignore no-explicit-any
function revealBrief(s: any, key: string): { goal: string; facts: string } {
  const nazwa = productName(s)
  const ust = (s.ustalenia && typeof s.ustalenia === 'object') ? s.ustalenia as Record<string, unknown> : {}
  const dlaKogo = typeof ust.dla_kogo === 'string' ? ust.dla_kogo : ''
  const ton = typeof ust.ton_marki === 'string' ? ust.ton_marki : ''
  const kat = typeof ust.kat === 'string' ? ust.kat : ''
  const korzysci = Array.isArray(ust.korzysci) ? (ust.korzysci as unknown[]).map((x) => typeof x === 'string' ? x : '').filter(Boolean).slice(0, 5) : []
  const goal = DRIP_CELE[`reveal_${key}`] || DRIP_CELE[key] || ''

  if (key === 'raport') {
    const r = s.market_report || {}
    const sekProd = findSection(r, ['Produkt i potencjał', 'potencjał rynkowy', 'Produkt'])
    const sekGrupa = findSection(r, ['Grupa docelowa', 'avatar', 'Marka i pozycjonowanie', 'Marka'])
    const parts: Record<string, unknown> = { nazwa, kategoria: kat, dla_kogo: dlaKogo }
    if (sekProd) parts.sekcja_produkt = { tytul: sekProd.tytul, tresc: clipText(sekProd.tresc, 400) }
    if (sekGrupa) parts.sekcja_grupa = { tytul: sekGrupa.tytul, tresc: clipText(sekGrupa.tresc, 400) }
    if (typeof r.lead === 'string') parts.lead_raportu = clipText(r.lead, 240)
    return { goal, facts: clipJson(parts, 2600) }
  }
  if (key === 'makiety') {
    const mk = Array.isArray(s.mockups) ? s.mockups as Array<Record<string, unknown>> : []
    const style = mk.map((m) => (typeof m.style === 'string' && m.style) || (typeof m.label === 'string' && m.label) || '').filter(Boolean).slice(0, 4)
    return { goal, facts: clipJson({ nazwa, liczba_makiet: mk.length, style, chosen_style: s.chosen_style || null, ton_marki: ton, dla_kogo: dlaKogo }, 2200) }
  }
  if (key === 'reklamy') {
    const hooks = extractHooks(s.session_ads).slice(0, 2)
    return { goal, facts: clipJson({ nazwa, hooki: hooks, korzysci, dla_kogo: dlaKogo, ton_marki: ton }, 2200) }
  }
  if (key === 'strona') {
    return { goal, facts: clipJson({ nazwa, strona_gotowa: true, dla_kogo: dlaKogo, ton_marki: ton, kategoria: kat }, 1400) }
  }
  // rezerwacja — recap które artefakty istnieją
  const recap = {
    nazwa, dla_kogo: dlaKogo,
    masz_juz: {
      raport: hasArtifact(s, 'market_report'),
      makiety: hasArtifact(s, 'mockups'),
      reklamy: hasArtifact(s, 'session_ads'),
      strona: hasArtifact(s, 'landing_html'),
    },
  }
  return { goal, facts: clipJson(recap, 1600) }
}

// Wyciągnij hooki z session_ads (obsługa formatu obiektowego {creative_1:{hook,...}} i tablicy).
// deno-lint-ignore no-explicit-any
function extractHooks(ads: any): string[] {
  if (!ads) return []
  const out: string[] = []
  const pull = (o: unknown) => {
    if (o && typeof o === 'object') {
      const r = o as Record<string, unknown>
      const h = (typeof r.hook === 'string' && r.hook) || (typeof r.naglowek === 'string' && r.naglowek) || (typeof r.headline === 'string' && r.headline) || ''
      if (h) out.push(clipText(h, 160))
    }
  }
  if (Array.isArray(ads)) { for (const a of ads) pull(a) }
  else if (typeof ads === 'object') { for (const k of Object.keys(ads)) pull((ads as Record<string, unknown>)[k]) }
  return out.filter(Boolean)
}

// Ostatnie ~6 wiadomości rozmowy (role user/assistant) — krótki kontekst dla GPT.
async function recentMessages(supabase: ReturnType<typeof createClient>, sid: string): Promise<string> {
  try {
    const { data } = await supabase.from('bud_messages').select('role, content')
      .eq('session_id', sid).order('created_at', { ascending: false }).limit(6)
    const rows = (data as Array<{ role: string; content: string }> | null) || []
    if (!rows.length) return ''
    return rows.reverse().map((m) => `${m.role === 'user' ? 'Klient' : 'Tomek'}: ${clipText(m.content, 220)}`).join('\n')
  } catch { return '' }
}

// Statyczny fallback (plain, „z palca") — gdy GPT niedostępny + do galerii szablonów.
// deno-lint-ignore no-explicit-any
function staticReveal(s: any, key: string, viewUrl: string, reserveUrl: string | null): { subject: string; html: string } {
  const im = firstName(s) ? ` ${firstName(s)}` : ''
  const n = productName(s)
  const M: Record<string, { subject: string; body: string }> = {
    raport: { subject: `${n}: sprawdziłem Twój rynek`, body: `Cześć${im}!\n\nSprawdziłem rynek wokół ${n} — naprawdę, w internecie, nie „z głowy": produkt, potencjał, kto jest grupą docelową i jak najlepiej ustawić markę. Wszystko z linkami do źródeł.\n\nCały raport masz [tutaj](LINK_VIEW). Ciekaw jestem, co o nim powiesz.` },
    makiety: { subject: `${n}: zobacz makiety swojego sklepu`, body: `Cześć${im}!\n\nPrzygotowałem makiety sklepu ${n} w kilku wariantach stylu — żebyś zobaczył, jak realnie może wyglądać i wybrał kierunek, który najbardziej Ci pasuje.\n\n[Otwórz makiety tutaj](LINK_VIEW) i daj znać, który styl czujesz.` },
    reklamy: { subject: `${n}: gotowe reklamy do startu`, body: `Cześć${im}!\n\nDo ${n} przygotowałem warianty reklam z gotowymi hookami — tak, żebyś od pierwszego dnia wiedział, czym przyciągniesz pierwszych klientów.\n\nMożesz [zobaczyć je tutaj](LINK_VIEW).` },
    strona: { subject: `${n} ma już działającą stronę`, body: `Cześć${im}!\n\nZbudowała się działająca strona sprzedażowa ${n} — to prawdziwa strona w przeglądarce, nie grafika.\n\n[Otwórz ją tutaj](LINK_VIEW), przewiń, możesz nawet pokazać komuś i zapytać, co myśli.` },
    rezerwacja: { subject: `${n}: zarezerwujesz budowę?`, body: `Cześć${im}!\n\nPrzeszliśmy przez raport rynku, makiety, reklamy i stronę ${n} — masz komplet, na którym widać, jak to realnie wygląda.\n\nJeśli chcesz, żebym zbudował to na serio, [zarezerwuj miejsce](LINK_RESERVE). Rezerwacja jest zwrotna — to tylko zaklepanie terminu, nie zobowiązanie.` },
  }
  const m = M[key] || M.raport
  return { subject: m.subject, html: mdToHtml(m.body, viewUrl, reserveUrl, artifactImagesHtml(s, key, viewUrl)) }
}

// GPT-personalizowany mail (zwraca null przy błędzie -> fallback statyczny)
// deno-lint-ignore no-explicit-any
async function generateRevealEmail(supabase: ReturnType<typeof createClient>, s: any, key: string, viewUrl: string, reserveUrl: string | null): Promise<{ subject: string; html: string; sms: string | null; usage: { i: number; c: number; o: number } | null } | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return null
  if (!DRIP_SYSTEM) return null // prompt z settings nie załadowany → statyczny reveal (bezpiecznik)
  const brief = revealBrief(s, key)
  const ust = (s.ustalenia && typeof s.ustalenia === 'object') ? s.ustalenia as Record<string, unknown> : {}
  const karta = (s.problem_summary || {}) as Record<string, unknown>
  const kartaTxt = clipJson(karta, 800)
  const rozmowa = await recentMessages(supabase, s.id)
  const ctx = [
    `Produkt/marka: ${productName(s)}`,
    typeof ust.dla_kogo === 'string' && ust.dla_kogo && `Dla kogo: ${ust.dla_kogo}`,
    typeof ust.kat === 'string' && ust.kat && `Kategoria: ${ust.kat}`,
    typeof ust.ton_marki === 'string' && ust.ton_marki && `Ton marki: ${ust.ton_marki}`,
    kartaTxt && `Karta projektu (problem, klienci, zakres): ${kartaTxt}`,
    firstName(s) && `Imię odbiorcy: ${firstName(s)}`,
    rozmowa && `Fragment rozmowy z leadem (ostatnie wiadomości):\n${rozmowa}`,
  ].filter(Boolean).join('\n')
  // SYSTEM z settings (budowanie_drip_system) — placeholdery podstawiane literalnie (bez $-magii replace).
  const SYSTEM = DRIP_SYSTEM.split('{{SYTUACJA}}').join(DRIP_SITUATION).split('{{MODEL_BLOCK}}').join(MODEL_BLOCK)
  const imgHint = key === 'reklamy' ? 'banery reklamowe' : key === 'makiety' ? 'makiety sklepu' : key === 'strona' ? 'podgląd Twojego sklepu' : key === 'rezerwacja' ? 'podgląd makiety i reklamy' : ''
  const user = `DANE TEGO LEADA I JEGO SKLEPU:\n${ctx}\n\nPRAWDZIWE DANE Z TEGO ETAPU (cytuj stąd konkrety):\n${brief.facts || '(brak dodatkowych — oprzyj się na produkcie i karcie projektu)'}\n\nCEL TEGO MAILA: ${brief.goal}${imgHint ? `\n\nWAŻNE: pod treścią maila system AUTOMATYCZNIE wstawi GRAFIKI (${imgHint}). Odwołaj się do nich naturalnie („poniżej", „pod spodem zobaczysz"), ale NIE wstawiaj sam żadnych adresów URL ani obrazków w treści — zrobi to system.` : ''}`
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }], response_format: { type: 'json_object' }, max_completion_tokens: 1200, reasoning_effort: 'low' }),
    })
    if (!res.ok) { console.error('[bud-drip] email openai', res.status, (await res.text().catch(() => '')).slice(0, 300)); return null }
    const data = await res.json()
    const u = data?.usage || {}
    const usage = { i: u.prompt_tokens || 0, c: u.prompt_tokens_details?.cached_tokens || 0, o: u.completion_tokens || 0 }
    const obj = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
    const subject = typeof obj.subject === 'string' && obj.subject.trim() ? obj.subject.trim() : null
    const body = typeof obj.body === 'string' && obj.body.trim() ? obj.body.trim() : null
    const sms = typeof obj.sms === 'string' && obj.sms.trim() ? obj.sms.trim() : null
    if (!subject || !body) return null
    return { subject, html: mdToHtml(body, viewUrl, reserveUrl, artifactImagesHtml(s, key, viewUrl)), sms, usage }
  } catch (e) { console.error('[bud-drip] email gen error:', e instanceof Error ? e.message : String(e)); return null }
}

// Brandowany KRÓTKI link do panelu: tomekniedzwiecki.pl/b/{code} (rewrite Vercel
// → edge fn bud-go → 302 do panelu /sklep). Krótko, marka, zero UUID i utm w treści SMS
// (utm dokleja bud-go server-side). Kod = jeden na sesję (bud_short_links).
const SHORT_BASE = 'https://tomekniedzwiecki.pl'
function shortLink(code: string): string { return `${SHORT_BASE}/b/${code}` }
// Kod bez mylących znaków (0/O/1/l/I). 7 znaków z 54-znakowego alfabetu ≈ 1e12.
function randCode(len = 7): string {
  const a = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
  const buf = new Uint8Array(len); crypto.getRandomValues(buf)
  let out = ''; for (let i = 0; i < len; i++) out += a[buf[i] % a.length]
  return out
}
// Pobierz/utwórz krótki kod dla sesji (idempotentne, odporne na równoległy insert).
async function getOrCreateShortCode(supabase: ReturnType<typeof createClient>, sid: string): Promise<string> {
  const { data: ex } = await supabase.from('bud_short_links').select('code').eq('session_id', sid).maybeSingle()
  if (ex && ex.code) return ex.code as string
  for (let i = 0; i < 3; i++) {
    const code = randCode()
    const { error } = await supabase.from('bud_short_links').insert({ code, session_id: sid })
    if (!error) return code
    const { data: again } = await supabase.from('bud_short_links').select('code').eq('session_id', sid).maybeSingle()
    if (again && again.code) return again.code as string   // równoległy insert — użyj istniejącego
  }
  return randCode()   // skrajna ostateczność
}
// Statyczny fallback SMS (gdy GPT nie dał pola sms) — bez polskich znaków.
// deno-lint-ignore no-explicit-any
function staticSms(s: any, key: string): string {
  const imie = firstName(s)
  const co: Record<string, string> = {
    raport: 'raport Twojego rynku', makiety: 'makiety Twojego sklepu',
    reklamy: 'gotowe reklamy', strona: 'Twoja strona sprzedazowa', rezerwacja: 'rezerwacja budowy',
  }
  const what = co[key] || 'nowy material'
  return `${imie ? 'Czesc ' + imie + '! ' : 'Czesc! '}W panelu czeka ${what} przygotowane pod Twoj sklep - zerknij, jest na co popatrzec. ~Tomek`
}
// GSM-7 safe: transliteruje znaki spoza podstawowego GSM (polskie diakrytyki,
// typograficzne cudzysłowy, myślniki, wielokropek), które inaczej wymuszają UCS-2.
const GSM_MAP: Record<string, string> = {
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
  '„': '"', '”': '"', '“': '"', '‟': '"', '«': '"', '»': '"',
  '‚': "'", '’': "'", '‘': "'", '‛': "'", '–': '-', '—': '-', '‑': '-', '…': '...',
}
function gsmSafe(str: string): string {
  return String(str || '').split('').map((c) => (c in GSM_MAP ? GSM_MAP[c] : c)).join('')
}
// Złóż finalny SMS: tekst (GPT lub statyczny), GSM-safe, + krótki link w nowej linii.
function composeSms(text: string, code: string): string {
  const link = shortLink(code)
  const max = 306 - link.length - 1
  const clean = gsmSafe((text || '').trim()).replace(/\s+$/g, '').slice(0, max)
  return `${clean}\n${link}`
}

// Mail reveala: cache w bud_reveals.meta.email -> GPT (raz) -> fallback statyczny.
// Dzięki cache podgląd == wysyłka i koszt GPT pada tylko raz na odsłonę.
// Przy okazji jednego strzału GPT cache'ujemy też SMS reaktywacyjny (meta.sms).
// deno-lint-ignore no-explicit-any
async function getRevealEmail(supabase: ReturnType<typeof createClient>, reveal: any, s: any): Promise<{ subject: string; html: string }> {
  const cached = reveal && reveal.meta && reveal.meta.email
  if (cached && typeof cached.subject === 'string' && typeof cached.html === 'string') return { subject: cached.subject, html: cached.html }
  const key = reveal.key
  const viewUrl = revealView(s, key)
  const reserveUrl = s.email ? checkoutLink(s.lead_id || null) : null
  let email: { subject: string; html: string }
  let model: string | null = null
  let smsText: string
  const gen = await generateRevealEmail(supabase, s, key, viewUrl, reserveUrl)
  if (gen) {
    email = { subject: gen.subject, html: gen.html }; model = OPENAI_MODEL
    smsText = gen.sms || staticSms(s, key)
    if (gen.usage) { try { const p = PRICES[OPENAI_MODEL] || PRICES['gpt-5.5']; await supabase.from('bud_usage').insert({ session_id: s.id, kind: 'email', model: OPENAI_MODEL, input_tokens: gen.usage.i, cached_tokens: gen.usage.c, output_tokens: gen.usage.o, cost_usd: (Math.max(0, gen.usage.i - gen.usage.c) * p.i + gen.usage.c * p.c + gen.usage.o * p.o) / 1_000_000, meta: { view: 'reveal_email', key } }) } catch (uErr) { console.error('[bud-drip] email usage insert:', uErr) } }
  } else {
    email = staticReveal(s, key, viewUrl, reserveUrl)
    smsText = staticSms(s, key)
  }
  const code = await getOrCreateShortCode(supabase, s.id)
  const sms = composeSms(smsText, code)
  try { if (reveal.id) await supabase.from('bud_reveals').update({ meta: { ...(reveal.meta || {}), email: { subject: email.subject, html: email.html, model, at: new Date().toISOString() }, sms: { text: sms, model: gen && gen.sms ? model : null, at: new Date().toISOString() } }, updated_at: new Date().toISOString() }).eq('id', reveal.id) } catch (cErr) { console.error('[bud-drip] email cache:', cErr) }
  return email
}

// Treść SMS reaktywacyjnego dla danej odsłony: cache meta.sms (złożony przy mailu)
// -> fallback statyczny. SMS leci +24h po mailu, więc meta.sms zwykle już istnieje.
// deno-lint-ignore no-explicit-any
async function getRevealSms(supabase: ReturnType<typeof createClient>, reveal: any, s: any): Promise<string> {
  const cached = reveal && reveal.meta && reveal.meta.sms
  if (cached && typeof cached.text === 'string' && cached.text.trim()) return cached.text
  const key = (reveal && reveal.key) || 'raport'
  const code = await getOrCreateShortCode(supabase, s.id)
  return composeSms(staticSms(s, key), code)
}

// T5+T10: sweepy generatorów — wywoływane w KAŻDYM przebiegu crona, także w quiet hours
// (audyt regresji #5: nie wysyłają maili, więc okno 8–23 ich nie dotyczy; wyniki tasków
// Manus i martwe locki nie mogą czekać do rana).
// (5) watchdog Manus: dociąga wyniki reklam dla sesji z zamkniętą kartą (bud-ads sweep;
//     tam też timeout >40 min + alert). (6) martwe locki: lock claimowany, grace minął,
//     artefaktu brak = genTask umarł na cicho → release + JEDEN alert (dedup bud_usage kind='alert').
// deno-lint-ignore no-explicit-any
async function runGenSweeps(supabase: any, SUPABASE_URL: string, CRON_SECRET: string): Promise<Record<string, unknown> | null> {
  let adsSweep: Record<string, unknown> | null = null
  if (CRON_SECRET) {
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/bud-ads`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': CRON_SECRET },
        body: JSON.stringify({ sweep: true }),
      })
      adsSweep = r.ok ? await r.json().catch(() => null) : { error: r.status }
    } catch (e) { console.error('[bud-drip] ads sweep err:', e) }
  }
  try {
    const twoDaysAgo = new Date(Date.now() - 48 * 3600000).toISOString()
    const { data: lockedSessions } = await supabase.from('bud_sessions')
      .select('id, gen_locks, mockups, landing_html, market_report, session_ads, ads_manus_status')
      .not('gen_locks', 'is', null).eq('is_test', false).is('archived_at', null)
      .is('paid_at', null).gte('updated_at', twoDaysAgo).limit(100)
    // deno-lint-ignore no-explicit-any
    const CHECKS: Array<{ key: string; stage: string; missing: (s: any) => boolean; graceMs: number }> = [
      { key: 'raport', stage: 'raport rynku (martwy lock — sweep)', missing: (s) => !s.market_report, graceMs: 30 * 60000 },
      { key: 'mockups', stage: 'makiety (martwy lock — sweep)', missing: (s) => !(Array.isArray(s.mockups) && s.mockups.length), graceMs: 30 * 60000 },
      { key: 'landing', stage: 'strona sklepu (martwy lock — sweep)', missing: (s) => !s.landing_html, graceMs: 30 * 60000 },
      { key: 'ads', stage: 'reklamy (martwy lock — sweep)', missing: (s) => !(Array.isArray(s.session_ads) && s.session_ads.length) && s.ads_manus_status !== 'running', graceMs: 60 * 60000 },
    ]
    for (const s of lockedSessions || []) {
      const locks = (s.gen_locks && typeof s.gen_locks === 'object' && !Array.isArray(s.gen_locks)) ? s.gen_locks as Record<string, string> : {}
      for (const chk of CHECKS) {
        const at = locks[chk.key] ? Date.parse(locks[chk.key]) : 0
        if (!at || Date.now() - at < chk.graceMs || !chk.missing(s)) continue
        // zwolnij martwy lock niezależnie od alertu — user po powrocie generuje od razu
        try { await supabase.rpc('bud_release_lock', { p_session: s.id, p_key: chk.key }) } catch { /* */ }
        const { count: alerted, error: alertCntErr } = await supabase.from('bud_usage')
          .select('id', { count: 'exact', head: true })
          .eq('session_id', s.id).eq('kind', 'alert').eq('meta->>gen_key', chk.key)
        if (alertCntErr) { console.error('[bud-drip] alert dedup err (pomijam alert):', alertCntErr); continue }
        if (alerted) continue
        try { await supabase.from('bud_usage').insert({ session_id: s.id, kind: 'alert', cost_usd: 0, meta: { gen_key: chk.key, type: 'stalled_gen' } }) } catch (mErr) { console.error('[bud-drip] alert marker err:', mErr) }
        await postSlackSparing('bud_gen_error', { session_id: s.id as string, stage: chk.stage, error: `lock '${chk.key}' z ${new Date(at).toISOString()} bez artefaktu — generacja umarła na cicho; lock zwolniony` })
      }
    }
  } catch (e) { console.error('[bud-drip] stalled sweep err:', e) }
  // (7) AUTO-PREWARM raportów (decyzja Tomka 2026-07-02): każdy zaakceptowany produkt
  // radaru dostaje raport do cache Z AUTOMATU (2/przebieg co 30 min — koszt kapie powoli,
  // ~0,63 USD/szt.). Bez tego pierwszy user nowego produktu czekał ~2,5 min i uciekał;
  // z cache raport jest w ~25 s. Claim per produkt (bud_claim_product_gen) deduplikuje
  // z ręcznymi prewarmami i generacjami userów.
  if (CRON_SECRET) {
    try {
      const { data: fresh } = await supabase
        .from('bud_tt_products')
        .select('id, pl_name, category')
        .eq('status', 'approved')
        .order('updated_at', { ascending: false })
        .limit(60)
      let warmed = 0
      for (const p of fresh || []) {
        if (warmed >= 2) break
        const { data: pkg } = await supabase.from('bud_product_packages').select('report, generating_at').eq('product_key', String(p.id)).maybeSingle()
        if (pkg && (pkg.report || pkg.generating_at)) continue
        try {
          const r = await fetch(`${SUPABASE_URL}/functions/v1/bud-raport`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': CRON_SECRET },
            body: JSON.stringify({ prewarm: true, product: { id: p.id, name: p.pl_name, category: p.category } }),
          })
          if (r.ok || r.status === 202) warmed++
        } catch (e) { console.error('[bud-drip] auto-prewarm err:', p.id, e) }
      }
      if (warmed) console.log('[bud-drip] auto-prewarm:', warmed)
    } catch (e) { console.error('[bud-drip] auto-prewarm sweep err:', e) }
  }
  return adsSweep
}

// T10: alert #sparing (wzorzec 1:1 z bud-image) — sweep martwych generacji.
async function postSlackSparing(type: string, data: Record<string, unknown>): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) { console.error('[bud-drip] slack-notify: brak SUPABASE_URL/KEY'); return }
    const res = await fetch(`${url}/functions/v1/slack-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ type, data }),
    })
    if (!res.ok) console.error(`[bud-drip] slack-notify ${type} HTTP`, res.status, await res.text())
  } catch (err) {
    console.error(`[bud-drip] slack-notify ${type} exception:`, err)
  }
}

// Wyślij SMS przez funkcję send-sms (autoryzacja x-cron-secret). Zwraca wynik JSON.
async function sendSms(CRON_SECRET: string, to: string, message: string): Promise<{ ok?: boolean; id?: string; points?: number; status?: string; error?: unknown } | null> {
  try {
    const r = await fetch(FN('send-sms'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-cron-secret': CRON_SECRET },
      body: JSON.stringify({ action: 'send', to, message }),
    })
    return await r.json().catch(() => null)
  } catch (e) { console.error('[bud-drip] sms send error:', e instanceof Error ? e.message : String(e)); return null }
}

// Przykładowa sesja do PODGLĄDU szablonów (bez realnego leada).
// deno-lint-ignore no-explicit-any
function sampleSession(): any {
  return {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'przyklad@email.pl', name: 'Anna Kowalska', lead_id: null, paid_at: null,
    ustalenia: { nazwa: 'TwójSklep', dla_kogo: 'kobiety 25-40 dbające o dom', kat: 'wyposażenie wnętrz', ton_marki: 'ciepły, naturalny', korzysci: ['szybka wysyłka', 'estetyka skandynawska'] },
    market_report: { naglowek: 'TwójSklep', lead: 'Nisza realna, konkurencja rozdrobniona.', sekcje: [{ tytul: 'Produkt i potencjał rynkowy', tresc: 'Produkt trafia w rosnący trend...' }, { tytul: 'Grupa docelowa — avatar', tresc: 'Kobiety 25-40, miasto, dom...' }] },
    mockups: [{ label: 'Minimal', style: 'minimal', url: '' }, { label: 'Bold', style: 'bold', url: '' }, { label: 'Editorial', style: 'editorial', url: '' }, { label: 'Warm', style: 'warm', url: '' }],
    session_ads: { creative_1: { hook: 'Twój dom zasługuje na lepsze', body: '...', cta: 'Kup teraz' } },
    landing_html: '<html>...</html>', chosen_style: 'warm',
  }
}

const SESSION_COLS = 'id, email, name, verdict, paid_at, full_paid_at, preview_brief, problem_summary, ustalenia, chosen_style, market_report, mockups, session_ads, landing_html, business_plan, lead_id, last_user_at, last_panel_at, panel_visits, seen_landing_at, sequence_cancelled_at, created_at, is_test'

// Najświeższy sygnał aktywności leada (ms): wejście do panelu albo aktywność w rozmowie.
// Otwarcia maili celowo pominięte (wyłączone w Resend / niewiarygodne).
// deno-lint-ignore no-explicit-any
async function lastActivityMs(_supabase: ReturnType<typeof createClient>, s: any): Promise<number> {
  const lp = s.last_panel_at ? Date.parse(s.last_panel_at) : 0
  const lu = s.last_user_at ? Date.parse(s.last_user_at) : 0
  return Math.max(lp || 0, lu || 0)
}
// deno-lint-ignore no-explicit-any
async function isEngaged(supabase: ReturnType<typeof createClient>, s: any): Promise<boolean> {
  return (Date.now() - await lastActivityMs(supabase, s)) < ENGAGE_WINDOW_DAYS * 86400000
}
// Czas ostatniej WYSŁANEJ odsłony tej sesji (ms) — do wymuszenia min. odstępu (anti-burst).
async function lastRevealSentMs(supabase: ReturnType<typeof createClient>, sid: string): Promise<number> {
  const { data } = await supabase.from('bud_reveals').select('sent_at')
    .eq('session_id', sid).eq('status', 'sent').not('sent_at', 'is', null)
    .order('sent_at', { ascending: false }).limit(1)
  return data && data[0] && data[0].sent_at ? Date.parse(data[0].sent_at as string) : 0
}
// Bramka MIĘDZY-KANAŁOWA: czas ostatniego dotyku z INNEGO kanału (mail abandoned / SMS).
const CROSS_CHANNEL_GAP_MS = 10 * 3600 * 1000
async function recentNonRevealTouchMs(supabase: ReturnType<typeof createClient>, sid: string): Promise<number> {
  const since = new Date(Date.now() - CROSS_CHANNEL_GAP_MS).toISOString()
  const [em, sm] = await Promise.all([
    supabase.from('bud_emails').select('sent_at').eq('session_id', sid).not('kind', 'like', 'reveal_%').gte('sent_at', since).order('sent_at', { ascending: false }).limit(1),
    supabase.from('bud_sms').select('created_at').eq('session_id', sid).gte('created_at', since).order('created_at', { ascending: false }).limit(1),
  ])
  let m = 0
  const e = (em.data as { sent_at: string }[] | null)?.[0]?.sent_at
  const c = (sm.data as { created_at: string }[] | null)?.[0]?.created_at
  if (e) m = Math.max(m, Date.parse(e))
  if (c) m = Math.max(m, Date.parse(c))
  return m
}
// Zamknij leada-przegranego: wszystkie nie-wysłane odsłony → 'skipped'. Idempotentne.
async function closeLost(supabase: ReturnType<typeof createClient>, sid: string, nowIso: string): Promise<void> {
  await supabase.from('bud_reveals').update({ status: 'skipped', updated_at: nowIso })
    .eq('session_id', sid).in('status', ['pending', 'generating', 'paused'])
}

// Utwórz wiersze planu dla sesji (idempotentne)
async function seedReveals(supabase: ReturnType<typeof createClient>, sid: string, baseAt: number): Promise<void> {
  const rows = REVEAL_PLAN.map((r) => ({
    session_id: sid, key: r.key, seq: r.seq, email_kind: r.emailKind,
    due_at: new Date(baseAt + r.h * 3600000).toISOString(), status: 'pending',
  }))
  await supabase.from('bud_reveals').upsert(rows, { onConflict: 'session_id,key', ignoreDuplicates: true })
}

// Podgląd 1:1 — składa finalny HTML (z doklejoną stopką) przez send-email (preview), bez wysyłki.
async function withSignature(SUPABASE_URL: string, SERVICE_KEY: string, subject: string, html: string, to: string | null): Promise<string> {
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ to: to || 'podglad@example.com', subject, html, preview: true }),
    })
    if (r.ok) { const j = await r.json(); if (j && typeof j.html === 'string') return j.html }
  } catch { /* ignore */ }
  return html
}

// Wyślij reveal-mail (idempotentnie przez bud_emails). Zwraca true gdy poszedł (lub był wysłany).
// FLAGA: realny POST do send-email tylko gdy followupsEnabled(); inaczej log + brak wysyłki.
// deno-lint-ignore no-explicit-any
async function sendReveal(supabase: ReturnType<typeof createClient>, SUPABASE_URL: string, SERVICE_KEY: string, reveal: any, s: any): Promise<boolean> {
  if (!s.email) return false
  if (!followupsEnabled()) { console.log('[bud-drip] BUD_FOLLOWUPS_ENABLED off — skip send (email)', reveal.email_kind, s.id); return false }
  const emailKind = reveal.email_kind
  const { data: claim, error: claimErr } = await supabase.from('bud_emails')
    .upsert([{ session_id: s.id, kind: emailKind, email: s.email }], { onConflict: 'session_id,kind', ignoreDuplicates: true }).select('id')
  if (claimErr) { console.error('[bud-drip] claim error:', claimErr); return false }
  if (!claim || !claim.length) return true // już wysłany
  const { subject, html } = await getRevealEmail(supabase, reveal, s)
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ to: s.email, subject, html, lead_id: s.lead_id || undefined }),
    })
    if (!res.ok) throw new Error(`send-email ${res.status}`)
    try { const j = await res.json(); const rid = j?.id || j?.resend_id || j?.data?.id; if (rid) await supabase.from('bud_emails').update({ resend_id: rid }).eq('session_id', s.id).eq('kind', emailKind) } catch { /* ignoruj */ }
    return true
  } catch (e) {
    console.error('[bud-drip] send error:', e instanceof Error ? e.message : String(e))
    await supabase.from('bud_emails').delete().eq('session_id', s.id).eq('kind', emailKind)
    return false
  }
}

// Przetwórz jeden reveal: wyślij gdy gotowy. (Artefakty /sklep generuje pipeline — bud-drip
// ich NIE odpala; jeśli artefakt jeszcze nie istnieje, odsłona czeka — patrz `requires`.)
// deno-lint-ignore no-explicit-any
async function processReveal(supabase: ReturnType<typeof createClient>, SUPABASE_URL: string, SERVICE_KEY: string, s: any, reveal: any): Promise<string> {
  if (!reveal.generated_at) await supabase.from('bud_reveals').update({ generated_at: new Date().toISOString() }).eq('id', reveal.id)
  const ok = await sendReveal(supabase, SUPABASE_URL, SERVICE_KEY, reveal, s)
  if (ok) { await supabase.from('bud_reveals').update({ status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', reveal.id); return 'sent' }
  return 'ready'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return jsonResponse({ error: 'metoda_niedozwolona' }, 405)
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL'); const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const CRON_SECRET = Deno.env.get('SPAR_CRON_SECRET')
    if (!SUPABASE_URL || !SERVICE_KEY) return jsonResponse({ error: 'brak_konfiguracji' }, 500)
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    if (!MODEL_BLOCK) { try { const { data: mb } = await supabase.from('settings').select('value').eq('key', 'budowanie_mail_email_system').single(); MODEL_BLOCK = (mb as { value?: string } | null)?.value || '' } catch (_e) { /* fallback: pusty blok */ } }
    await ensureDripPrompts(supabase) // SITUATION/SYSTEM/cele dripu z settings (raz na cold-start)

    let body: { action?: string; sessionId?: string; key?: string; send?: boolean } = {}
    try { body = await req.json() } catch { /* cron bez body */ }
    let isAdmin = !!(CRON_SECRET && req.headers.get('x-admin-secret') === CRON_SECRET)
    const isCron = !!(CRON_SECRET && req.headers.get('x-cron-secret') === CRON_SECRET)
    // Fallback dla panelu admina (przeglądarka): zalogowany użytkownik CRM (JWT z Authorization).
    if (!isAdmin && !isCron) {
      const auth = req.headers.get('Authorization') || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
      if (token && token !== SERVICE_KEY) {
        try { const { data: u } = await supabase.auth.getUser(token); if (u?.user?.id) isAdmin = true } catch { /* nie-admin */ }
      }
    }

    // ── action: status (panel admina) ──
    if (body.action === 'status') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sid = (body.sessionId || '').trim()
      const { data: s } = await supabase.from('bud_sessions').select(SESSION_COLS).eq('id', sid).maybeSingle()
      const { data: reveals } = await supabase.from('bud_reveals').select('*').eq('session_id', sid).order('seq')
      const { data: emails } = await supabase.from('bud_emails').select('kind, sent_at, opened_at, clicked_at').eq('session_id', sid).like('kind', 'reveal_%')
      const engaged = s ? await isEngaged(supabase, s) : false
      return jsonResponse({ session: s ? { email: s.email, name: s.name, last_panel_at: s.last_panel_at, last_user_at: s.last_user_at, panel_visits: s.panel_visits, seen_landing_at: s.seen_landing_at, verdict: s.verdict, paid_at: s.paid_at, sequence_cancelled_at: s.sequence_cancelled_at, engaged } : null, reveals: reveals || [], emails: emails || [], plan: REVEAL_PLAN, followups_enabled: followupsEnabled() }, 200)
    }

    // ── action: seed ──
    if (body.action === 'seed') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sid = (body.sessionId || '').trim()
      const { data: s } = await supabase.from('bud_sessions').select('id, created_at, verdict').eq('id', sid).maybeSingle()
      if (!s) return jsonResponse({ error: 'brak_sesji' }, 404)
      await seedReveals(supabase, sid, Date.parse(s.created_at as string) || Date.now())
      return jsonResponse({ ok: true, seeded: REVEAL_PLAN.length }, 200)
    }

    // ── action: fire (ADMIN TEST — wymuś odsłonę teraz, bez bramki/due) ──
    //    domyślnie PODGLĄD (zwraca HTML maila bez wysyłki); send:true wysyła (wymaga BUD_FOLLOWUPS_ENABLED)
    if (body.action === 'fire') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sid = (body.sessionId || '').trim()
      const { data: s } = await supabase.from('bud_sessions').select(SESSION_COLS).eq('id', sid).maybeSingle()
      if (!s) return jsonResponse({ error: 'brak_sesji' }, 404)
      await seedReveals(supabase, sid, Date.parse(s.created_at as string) || Date.now())
      const { data: reveals } = await supabase.from('bud_reveals').select('*').eq('session_id', sid).order('seq')
      const target = (reveals || []).find((r) => body.key ? r.key === body.key : r.status !== 'sent')
      if (!target) return jsonResponse({ ok: true, info: 'brak reveala do odpalenia' }, 200)
      const step = REVEAL_PLAN.find((p) => p.key === target.key)
      // Informacyjnie: gdy artefakt nie istnieje, podgląd użyje fallbacku statycznego.
      const ready = step ? hasArtifact(s, step.requires) : true
      if (body.send) {
        const result = await processReveal(supabase, SUPABASE_URL, SERVICE_KEY, s, target)
        return jsonResponse({ ok: true, key: target.key, result, sent: result === 'sent', followups_enabled: followupsEnabled() }, 200)
      }
      // podgląd bez wysyłki — ten sam mail, który pójdzie (cache w meta) + stopka 1:1
      const { subject, html } = await getRevealEmail(supabase, target, s)
      const finalHtml = await withSignature(SUPABASE_URL, SERVICE_KEY, subject, html, s.email)
      return jsonResponse({ ok: true, key: target.key, result: 'preview', artifact_ready: ready, preview: { subject, html: finalHtml, to: s.email } }, 200)
    }

    // ── action: cancel / resume (ADMIN — ręczne wstrzymanie/wznowienie automatu) ──
    if (body.action === 'cancel' || body.action === 'resume') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sid = (body.sessionId || '').trim()
      if (!sid) return jsonResponse({ error: 'brak_sesji' }, 400)
      const nowIso = new Date().toISOString()
      if (body.action === 'cancel') {
        await supabase.from('bud_sessions').update({ sequence_cancelled_at: nowIso, updated_at: nowIso }).eq('id', sid)
        await closeLost(supabase, sid, nowIso)
        return jsonResponse({ ok: true, cancelled: true }, 200)
      }
      await supabase.from('bud_sessions').update({ sequence_cancelled_at: null, updated_at: nowIso }).eq('id', sid)
      await supabase.from('bud_reveals').update({ status: 'pending', updated_at: nowIso }).eq('session_id', sid).eq('status', 'skipped')
      return jsonResponse({ ok: true, cancelled: false }, 200)
    }

    // ── action: templates (ADMIN — galeria szablonów reveali, dane przykładowe) ──
    if (body.action === 'templates') {
      if (!isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
      const sample = sampleSession()
      const out: { group: string; kind: string; key: string; seq: number; subject: string; html: string }[] = []
      for (const r of REVEAL_PLAN) {
        const viewUrl = revealView(sample, r.key)
        const { subject, html } = staticReveal(sample, r.key, viewUrl, checkoutLink(null))
        out.push({ group: 'drip', kind: r.emailKind, key: r.key, seq: r.seq, subject, html: await withSignature(SUPABASE_URL, SERVICE_KEY, subject, html, null) })
      }
      return jsonResponse({ templates: out }, 200)
    }

    // ── CRON RUN ──
    if (!isCron && !isAdmin) return jsonResponse({ error: 'unauthorized' }, 401)
    const hour = warsawHour()
    // SEED 24/7 (plan reveali + bramki działają też w nocy), WYSYŁKA tylko w oknie 8–23 PL.
    const inWindow = hour >= 8 && hour < 23

    // 1) seed: sesje z RAPORTEM bez planu. market_report NOT NULL (po raporcie); sesje PRZED
    //    raportem obsługuje bud-followups (porzucona rozmowa) — gate market_report rozdziela
    //    oba silniki, żeby się NIE nakładały. + email NOT NULL, niepłacące, nie-test,
    //    nie-anulowane, nie-zarchiwizowane (archived_at = skasowana rozmowa).
    const { data: green } = await supabase.from('bud_sessions')
      .select('id, created_at').eq('is_test', false).not('email', 'is', null).not('market_report', 'is', null).is('archived_at', null).is('paid_at', null).is('full_paid_at', null).is('sequence_cancelled_at', null).limit(200)
    for (const g of green || []) {
      const { count } = await supabase.from('bud_reveals').select('id', { count: 'exact', head: true }).eq('session_id', g.id)
      if (!count) await seedReveals(supabase, g.id, Date.parse(g.created_at as string) || Date.now())
    }

    // Poza oknem 8–23: plan zaseedowany, nic nie WYSYŁAMY do rana — ale sweepy generatorów
    // biegną 24/7 (nie wysyłają maili do leadów; audyt regresji #5).
    if (!inWindow) {
      const adsSweepQ = await runGenSweeps(supabase, SUPABASE_URL, CRON_SECRET || '')
      return jsonResponse({ ok: true, quiet_hours: true, seeded: (green || []).length, adsSweep: adsSweepQ }, 200)
    }

    // 2) przetwórz due reveale (pending/generating, due_at<=now) z bramką + `requires`
    const nowIso = new Date().toISOString()
    const { data: due } = await supabase.from('bud_reveals')
      .select('*').in('status', ['pending', 'generating']).lte('due_at', nowIso).order('due_at').order('seq').limit(120)
    let fired = 0
    const processed: Record<string, number> = {}
    const lostNow = new Set<string>()
    const sentThisRun = new Set<string>()   // max 1 odsłona / sesję / przebieg
    for (const rv of due || []) {
      if (fired >= MAX_FIRES_PER_RUN) break
      if (lostNow.has(rv.session_id)) continue
      const { data: s } = await supabase.from('bud_sessions').select(SESSION_COLS).eq('id', rv.session_id).maybeSingle()
      if (!s || s.is_test || !s.email || s.paid_at || s.full_paid_at || s.sequence_cancelled_at) continue
      const step = REVEAL_PLAN.find((p) => p.key === rv.key)
      // ── `requires`: artefakt jeszcze nie istnieje → odsłona NIE idzie w tym przebiegu.
      //    Zostaw status pending (NIE oznaczaj sent), przejdź dalej. requires:null
      //    (rezerwacja) jest zawsze kwalifikowana, gdy due.
      if (step && step.requires && !hasArtifact(s, step.requires)) continue
      // ── Bramka między-kanałowa: świeży dotyk mailem/SMS z innego kanału → odpuść przebieg.
      const xTouch = await recentNonRevealTouchMs(supabase, s.id)
      if (xTouch && Date.now() - xTouch < CROSS_CHANNEL_GAP_MS) continue
      // ── Bramka zaangażowania per reveal (strona = visits2). Brak → zostaw pending;
      //    twardo zimny po LOST_WINDOW → zamknij sesję.
      const gate = step ? step.gate : 'none'
      if (gate !== 'none') {
        const inactive = Date.now() - await lastActivityMs(supabase, s)
        if (inactive >= LOST_WINDOW_DAYS * 86400000) { await closeLost(supabase, s.id, nowIso); lostNow.add(s.id); continue }
        if (gate === 'visits2' && (s.panel_visits || 0) < PANEL_VISITS_GATE) continue
        if (gate === 'seen_landing' && !s.seen_landing_at) continue
      }
      // ── Anti-burst: jedna odsłona / sesję / przebieg + min. odstęp od poprzedniej wysłanej.
      if (sentThisRun.has(rv.session_id)) continue
      const lastRev = await lastRevealSentMs(supabase, s.id)
      if (lastRev && Date.now() - lastRev < REVEAL_MIN_GAP_MS) continue
      const result = await processReveal(supabase, SUPABASE_URL, SERVICE_KEY, s, rv)
      processed[result] = (processed[result] || 0) + 1
      if (result === 'sent') { fired++; sentThisRun.add(rv.session_id) }
    }

    // 3) zapauzowane reveale: wznów (wrócił), zamknij (przegrany) albo zostaw
    const { data: paused } = await supabase.from('bud_reveals').select('*').eq('status', 'paused').limit(120)
    const closedLost = new Set<string>()
    for (const rv of paused || []) {
      if (closedLost.has(rv.session_id)) continue
      const { data: s } = await supabase.from('bud_sessions').select(SESSION_COLS).eq('id', rv.session_id).maybeSingle()
      if (!s || s.paid_at || s.full_paid_at || s.sequence_cancelled_at) continue
      const inactive = Date.now() - await lastActivityMs(supabase, s)
      if (inactive >= LOST_WINDOW_DAYS * 86400000) {
        await closeLost(supabase, s.id, nowIso); closedLost.add(s.id)
      } else if (inactive < ENGAGE_WINDOW_DAYS * 86400000) {
        await supabase.from('bud_reveals').update({ status: 'pending', due_at: nowIso, updated_at: nowIso }).eq('id', rv.id)
      }
    }

    // 4) SMS reaktywacyjny: mail odsłony sprzed >24h, lead nie-przegrany, z numerem + zgodą,
    //    SMS jeszcze nie poszedł → wyślij. Cały przebieg za flagą BUD_FOLLOWUPS_ENABLED && SMS_ENABLED.
    const SMS_ENABLED = (Deno.env.get('SMS_ENABLED') || '') === '1'
    let smsSent = 0
    if (followupsEnabled() && SMS_ENABLED && CRON_SECRET) {
      const dayAgo = new Date(Date.now() - 86400000).toISOString()
      const { data: unopened } = await supabase.from('bud_emails')
        .select('session_id, kind, sent_at')
        .like('kind', 'reveal_%').lte('sent_at', dayAgo)
        .order('sent_at', { ascending: false }).limit(80)
      for (const em of unopened || []) {
        if (smsSent >= MAX_FIRES_PER_RUN) break
        const { count: smsDone } = await supabase.from('bud_sms').select('id', { count: 'exact', head: true }).eq('session_id', em.session_id).eq('kind', em.kind)
        if (smsDone) continue
        const { count: recentSms } = await supabase.from('bud_sms').select('id', { count: 'exact', head: true }).eq('session_id', em.session_id).gte('created_at', new Date(Date.now() - 2 * 86400000).toISOString())
        if (recentSms) continue
        const { data: s } = await supabase.from('bud_sessions').select('id, name, email, phone, verdict, paid_at, full_paid_at, is_test, last_user_at, last_panel_at, sms_consent_at, sms_opt_out, sequence_cancelled_at').eq('id', em.session_id).maybeSingle()
        if (!s || s.is_test || s.paid_at || s.full_paid_at || s.sequence_cancelled_at) continue
        if (!s.phone || !s.sms_consent_at || s.sms_opt_out) continue
        const inactive = Date.now() - await lastActivityMs(supabase, s)
        if (inactive < 86400000) continue
        if (inactive >= LOST_WINDOW_DAYS * 86400000) continue
        const { data: rv } = await supabase.from('bud_reveals').select('key, meta').eq('session_id', em.session_id).eq('email_kind', em.kind).maybeSingle()
        const text = await getRevealSms(supabase, rv || { key: (em.kind as string).replace('reveal_', ''), meta: null }, s)
        const res = await sendSms(CRON_SECRET, s.phone as string, text)
        await supabase.from('bud_sms').insert({
          session_id: s.id, kind: em.kind, phone: s.phone, message: text,
          smsapi_id: res && res.id ? res.id : null,
          points: res && typeof res.points === 'number' ? res.points : null,
          status: res && res.ok ? (res.status || 'SENT') : 'ERROR',
          meta: res && res.ok ? null : { error: res ? res.error : 'no_response' },
        })
        if (res && res.ok) {
          // KOSZT SMS → bud_usage (widoczny przy leadzie i w zakładce Koszty)
          try {
            const pts = typeof res.points === 'number' && res.points > 0 ? res.points : 1
            const rate = await usdPlnRate(supabase)
            const pln = pts * SMS_PLN_PER_POINT
            await supabase.from('bud_usage').insert({
              session_id: s.id, kind: 'sms', model: 'smsapi', input_tokens: 0, cached_tokens: 0, output_tokens: 0, images: 0,
              cost_usd: pln / rate, meta: { view: 'sms', kind: em.kind, points: pts, pln, rate },
            })
          } catch (uErr) { console.error('[bud-drip] sms usage insert:', uErr) }
          smsSent++
        }
      }
    }

    // 5+6) sweepy generatorów (patrz runGenSweeps) — tu dla przebiegów w oknie wysyłki.
    const adsSweep = await runGenSweeps(supabase, SUPABASE_URL, CRON_SECRET || '')

    return jsonResponse({ ok: true, processed, fired, smsSent, adsSweep, followups_enabled: followupsEnabled() }, 200)
  } catch (e) {
    console.error('[bud-drip] ERROR:', e)
    return jsonResponse({ error: 'blad_serwera' }, 500)
  }
})

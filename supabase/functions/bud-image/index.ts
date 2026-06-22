// bud-image — podgląd graficzny SKLEPU/PRODUKTU dla lejka „Zbuduję" (AWE, e-commerce fizyczny).
//
// Fork spar-image: zamiast makiet SaaS (panel/glowna/dodatkowa/landing) generujemy
// MAKIETY E-COMMERCE realnego sklepu z produktem fizycznym.
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (frontend wywołuje bez tokena JWT):
//   npx supabase functions deploy bud-image --no-verify-jwt
//
// Flow: bud-chat zapisuje brief z markera <projekt> w bud_sessions.preview_brief
// + (osobno) bud-brand zapisuje markę w bud_sessions.brand. Frontend woła ten
// endpoint po jednym widoku ({sessionId, view}) -> generujemy obraz (OpenAI Images
// API), wrzucamy do storage i zapisujemy atomowo przez RPC bud_record_image
// (równoległe wywołania nie mogą się ścigać na image_count/preview_images).
//
// WIDOKI:
//   'sklep'         — witryna sklepu internetowego (strona główna). PULA image_count.
//   'karta_produktu'— strona produktu (galeria, cena zł, „Do koszyka", opinie). PULA image_count.
//   'logo'          — znak marki (fallback; markę robi bud-brand). EXTRA (poza pulą).
//   'lifestyle'     — fotorealistyczny packshot/produkt w użyciu (grupa docelowa). EXTRA.
//   'podsumowanie'  — infografika pitch e-com (po werdykcie). EXTRA.
//
// Limity: 16 obrazów/sesja (4 startowe + 12 poprawek) na widoki z puli; widoki EXTRA
// mają własny limit 3 wersji/sesja per widok i nie zużywają puli image_count
// (RPC bud_record_image pomija inkrement dla logo/lifestyle/telefon/podsumowanie/marka).
//
// Sekrety:
//   OPENAI_API_KEY     — klucz OpenAI (już ustawiony)
//   BUD_IMAGE_MODEL    — opcjonalny override modelu (default gpt-image-2;
//                        przy błędzie "model not found" automatyczny fallback gpt-image-1)
//   BUD_IMAGE_QUALITY  — opcjonalny override jakości (default 'medium')
//   BUD_IMG_IP_DAILY / BUD_IMG_USER_DAILY — limity dzienne

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied } from "../_shared/bud-owner.ts";

const ALLOWED_ORIGINS = [
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5503',
  'http://127.0.0.1:5503',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

const IMAGE_MODEL = Deno.env.get('BUD_IMAGE_MODEL') || 'gpt-image-2'
const IMAGE_MODEL_FALLBACK = 'gpt-image-1'
// Koszt USD jednego obrazu 1536x1024 per quality (logowanie do bud_usage)
const IMAGE_COST_USD: Record<string, number> = { low: 0.011, medium: 0.041, high: 0.167 }
const MAX_IMAGES_PER_SESSION = 16    // widoki startowe + poprawki (~3 rundy poprawek wizualnych)
const STARTOWE_VIEWS = 2             // pierwsze makiety (sklep + karta_produktu) = moment „wow" lejka —
                                     // NIGDY nie blokuj ich dziennym capem IP/konta (patrz niżej)
// Dzienny limit per IP (anty-abuse). UWAGA: cap zlicza obrazy ze WSZYSTKICH sesji
// dzielących IP, więc za współdzielonym NAT-em realni userzy się kumulują —
// NIE ustawiać zbyt nisko.
const MAX_IMAGES_PER_IP_PER_DAY = parseInt(Deno.env.get('BUD_IMG_IP_DAILY') || '120', 10)
// Dzienny limit per KONTO (auth_user_id) — IP łatwo zmienić, konto trudniej.
const MAX_IMAGES_PER_USER_PER_DAY = parseInt(Deno.env.get('BUD_IMG_USER_DAILY') || '200', 10)
const STORAGE_BUCKET = 'attachments'

const VIEWS = ['sklep', 'karta_produktu', 'logo', 'lifestyle', 'podsumowanie'] as const
type ViewKey = typeof VIEWS[number]
// Widoki EXTRA nie zużywają puli image_count (RPC bud_record_image pomija inkrement
// dla logo/lifestyle/telefon/podsumowanie/marka), każdy ma własny limit wersji per sesja:
//   'logo'         — znak marki (fallback względem bud-brand)
//   'lifestyle'    — packshot/produkt w użyciu (grupa docelowa)
//   'podsumowanie' — infografika pitch e-com (wymaga karty/werdyktu)
const EXTRA_VIEWS: readonly ViewKey[] = ['logo', 'lifestyle', 'podsumowanie']
const MAX_EXTRA_VERSIONS = 3

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

// Wspólny design system dla WSZYSTKICH widoków jednej sesji — to on trzyma
// spójność między obrazami (gpt-image nie ma seedów; spójność = identyczny,
// bardzo konkretny opis stylu w każdym prompcie).
//
// Źródłem PRIORYTETOWYM jest bud_sessions.brand (nazwa + paleta + fonty od bud-brand) —
// żeby sklep, karta i logo trzymały JEDNĄ tożsamość marki. Gdy brak brand → fallback
// na brief.design / brief.styl (jak w sparingu).
function buildStyleBlock(brief: Record<string, unknown>, brand: Record<string, unknown> | null): string {
  const s = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
  const arr = (v: unknown, n = 6) => Array.isArray(v)
    ? v.filter((x) => typeof x === 'string').slice(0, n).map((x) => (x as string).trim()).filter(Boolean)
    : []

  // 1) MARKA z bud-brand — najsilniejsze źródło spójności (nazwa/paleta/fonty)
  if (brand) {
    const nazwa = s(brand.nazwa, 80)
    const paleta = arr(brand.paleta, 6)
    const fonty = arr(brand.fonty ?? brand.typografia, 3)
    if (nazwa || paleta.length) {
      const parts: string[] = []
      if (nazwa) parts.push(`nazwa marki (umieszczana w headerze/logo, dokładnie tak zapisana): „${nazwa}"`)
      if (s(brand.tagline, 120)) parts.push(`hasło marki: „${s(brand.tagline, 120)}"`)
      if (paleta.length) parts.push(`paleta marki (użyj DOKŁADNIE tych kolorów — tło, akcenty, przyciski): ${paleta.join(', ')}`)
      if (fonty.length) parts.push(`typografia marki: ${fonty.join(', ')}`)
      const base = `TOŻSAMOŚĆ MARKI TEGO SKLEPU (odwzoruj DOKŁADNIE i IDENTYCZNIE na wszystkich widokach — sklep, karta produktu, logo i lifestyle MUSZĄ wyglądać jak jedna marka): ${parts.join('; ')}. Jakość premium e-commerce: czysta nowoczesna witryna, spójna paleta wyprowadzona z powyższych kolorów, dużo światła, profesjonalne zdjęcia produktowe, spójny zestaw ikon.`
      const styl = s((brief.styl as string), 400)
      return styl
        ? `${base} WYTYCZNE KLIENTA (PRIORYTET — w razie konfliktu nadpisują markę): ${styl}.`
        : base
    }
  }

  // 2) FALLBACK: brief.design (decyzje projektowe AI) — jak w sparingu, przeramowane na e-com
  const styl = s((brief.styl as string), 500)
  const design = (brief.design && typeof brief.design === 'object' && !Array.isArray(brief.design))
    ? brief.design as Record<string, unknown>
    : null
  const d = (k: string, max = 200) =>
    (design && typeof design[k] === 'string' ? (design[k] as string).trim().slice(0, max) : '')

  if (design && d('tlo') && d('akcent')) {
    const parts: string[] = []
    if (d('kierunek')) parts.push(`charakter marki: ${d('kierunek')}`)
    parts.push(`tło witryny: ${d('tlo')}`)
    if (d('powierzchnia')) parts.push(`karty produktów i sekcje: ${d('powierzchnia')}`)
    parts.push(`kolor akcji (przyciski „Do koszyka", CTA): ${d('akcent')}`)
    if (d('akcent2')) parts.push(`drugi akcent (promocje, etykiety): ${d('akcent2')}`)
    if (d('geometria')) parts.push(`geometria: ${d('geometria')}`)
    if (d('typografia')) parts.push(`typografia: ${d('typografia')}`)
    const base = `DESIGN SYSTEM TEGO SKLEPU (odwzoruj DOKŁADNIE i IDENTYCZNIE na wszystkich widokach): ${parts.join('; ')}. Jakość premium e-commerce: czysta siatka produktów, jedna spójna paleta, dużo światła, profesjonalne packshoty, spójny zestaw ikon.`
    return styl
      ? `${base} WYTYCZNE KLIENTA (PRIORYTET — w razie konfliktu nadpisują design system): ${styl}.`
      : base
  }

  // 3) FALLBACK: same wytyczne klienta
  if (styl) {
    return `DESIGN SYSTEM SKLEPU (IDENTYCZNY na wszystkich widokach — wytyczne klienta mają PRIORYTET): ${styl}. Niezależnie utrzymaj jakość premium e-commerce: czysta siatka produktów, jedna spójna paleta, zaokrąglenia 10-14px, dużo światła, profesjonalne zdjęcia produktowe, nowoczesna typografia sans-serif, spójny zestaw ikon liniowych.`
  }

  // 4) Domyślny — gdy nic nie wiemy
  return 'DESIGN SYSTEM SKLEPU (IDENTYCZNY na wszystkich widokach): nowoczesny, czysty sklep internetowy klasy premium — jasne tło, jeden wyraźny kolor akcentu na przyciskach „Do koszyka"/CTA, profesjonalne zdjęcia produktowe na neutralnym tle, czysta siatka produktów, zaokrąglenia 10-14px, dużo światła, nowoczesna typografia sans-serif, spójny zestaw ikon liniowych.'
}

// Kontekst produktu/marki — wspólny dla wszystkich promptów.
function productContext(brief: Record<string, unknown>, brand: Record<string, unknown> | null): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const nazwa = (brand && typeof brand.nazwa === 'string' && brand.nazwa.trim())
    ? brand.nazwa.trim().slice(0, 80)
    : (s(brief.nazwa, 80) || 'Sklep')
  const produkt = s(brief.produkt) || s(brief.opis) || s(brief.nisza)
  const dlaKogo = s(brief.dla_kogo)
  const parts = [`Marka/sklep: „${nazwa}".`]
  if (produkt) parts.push(`Sprzedaje: ${produkt}.`)
  if (s(brief.nisza)) parts.push(`Nisza: ${s(brief.nisza)}.`)
  if (dlaKogo) parts.push(`Dla kogo: ${dlaKogo}.`)
  if (s(brief.problem)) parts.push(`Obietnica/problem: ${s(brief.problem)}.`)
  return parts.join(' ')
}

// Wspólny blok jakości tekstu/grafiki (polski z diakrytykami, mało tekstu).
const JAKOSC = 'TYPOGRAFIA I TEKST (kluczowe): MAŁO tekstu, DUŻE czytelne etykiety; nazwy produktów i hasła krótkie (2-5 słów); ceny zawsze w złotówkach w formacie „79 zł" / „129,99 zł"; bezbłędna polszczyzna z poprawnymi znakami diakrytycznymi (ą, ć, ę, ł, ń, ó, ś, ź, ż); zero lorem ipsum, zero angielskich słów. TREŚCI: realistyczne polskie nazwy produktów i opinie. JAKOŚĆ: dopracowanie jak top shot z Dribbble/Behance, pixel-perfect, miękkie cienie i głębia, bez logotypów firm trzecich, bez znaków wodnych.'

// ── Widok: SKLEP — strona główna witryny e-commerce ─────────────────────────
function buildStorePrompt(brief: Record<string, unknown>, brand: Record<string, unknown> | null): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const widoki = (brief.widoki && typeof brief.widoki === 'object') ? brief.widoki as Record<string, unknown> : {}
  const opisSklep = s(widoki.sklep, 700)
  return [
    `Pełnoekranowy zrzut STRONY GŁÓWNEJ nowoczesnego SKLEPU INTERNETOWEGO (witryna e-commerce) — widok wprost, full-bleed, BEZ ramki przeglądarki i bez tła dookoła. To realny wygląd działającego sklepu, NIE dashboard ani panel administracyjny.`,
    productContext(brief, brand),
    opisSklep
      ? `UKŁAD STRONY (z ustaleń z klientem — odwzoruj wiernie): ${opisSklep}`
      : `UKŁAD STRONY: górny pasek z nazwą/logo marki po lewej, prostą nawigacją (Sklep, Bestsellery, Kontakt) i ikoną koszyka po prawej; pod nim duża sekcja HERO z głównym produktem i krótkim polskim hasłem-obietnicą oraz przyciskiem „Kup teraz"; niżej SIATKA 3-4 produktów (zdjęcie produktu na neutralnym tle, krótka nazwa, cena w zł, mały przycisk „Do koszyka"); na dole pasek zaufania (np. „Płatność przy odbiorze", „Zwrot 14 dni", „Wysyłka 48h") z ikonami.`,
    `KADR: pokaż GÓRNĄ część strony — header + hero + początek siatki produktów. NIE ściskaj całej długiej strony w jeden kadr; większa typografia, mniej elementów.`,
    buildStyleBlock(brief, brand),
    JAKOSC,
  ].join(' ')
}

// ── Widok: KARTA PRODUKTU — strona pojedynczego produktu ────────────────────
function buildProductPagePrompt(brief: Record<string, unknown>, brand: Record<string, unknown> | null): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const widoki = (brief.widoki && typeof brief.widoki === 'object') ? brief.widoki as Record<string, unknown> : {}
  const opisKarta = s(widoki.karta_produktu, 700) || s(widoki.produkt, 700)
  return [
    `Pełnoekranowy zrzut STRONY PRODUKTU w sklepie internetowym (karta produktu) — widok wprost, full-bleed, BEZ ramki przeglądarki. To realny wygląd działającego sklepu.`,
    productContext(brief, brand),
    opisKarta
      ? `UKŁAD KARTY (z ustaleń z klientem — odwzoruj wiernie): ${opisKarta}`
      : `UKŁAD KARTY: po lewej DUŻE zdjęcie produktu (na neutralnym/jasnym tle) z rzędem 3-4 miniatur galerii pod spodem; po prawej nazwa produktu, gwiazdki oceny z liczbą opinii, DUŻA cena w zł, krótkie wypunktowanie 3 korzyści, wyraźny przycisk „Do koszyka" + drugorzędny „Kup teraz"; niżej krótki opis produktu po polsku i sekcja 2-3 opinii klientów (imię, gwiazdki, krótki cytat). Górny pasek z nazwą/logo marki i koszykiem.`,
    buildStyleBlock(brief, brand),
    JAKOSC,
  ].join(' ')
}

// ── Widok: LOGO — znak marki (fallback względem bud-brand) ──────────────────
function buildLogoPrompt(brief: Record<string, unknown>, brand: Record<string, unknown> | null): string {
  const s = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '')
  const nazwa = (brand && typeof brand.nazwa === 'string' && brand.nazwa.trim())
    ? brand.nazwa.trim().slice(0, 80)
    : (s(brief.nazwa, 80) || 'Marka')
  const paleta = (brand && Array.isArray(brand.paleta))
    ? (brand.paleta as unknown[]).filter((x) => typeof x === 'string').slice(0, 4).join(', ')
    : ''
  return [
    `Profesjonalne LOGO marki e-commerce „${nazwa}" — czysty, nowoczesny znak na jednolitym, neutralnym tle (białe lub bardzo jasne). Wektorowy, minimalistyczny charakter: prosty symbol/sygnet + nazwa „${nazwa}" zapisana czytelnym, zapamiętywalnym krojem.`,
    `Marka sprzedaje: ${s(brief.produkt) || s(brief.nisza) || s(brief.opis)}. Logo ma pasować do tego produktu i grupy docelowej.`,
    paleta ? `Kolory logo z palety marki: ${paleta}.` : '',
    `Nazwa „${nazwa}" musi być napisana DOKŁADNIE tak, bezbłędnie, z poprawnymi polskimi znakami jeśli występują. JAKOŚĆ: pixel-perfect, ostre krawędzie, bez efektu zdjęcia, bez znaków wodnych, bez logotypów firm trzecich, bez dodatkowego tekstu poza nazwą marki.`,
  ].filter(Boolean).join(' ')
}

// ── Widok: LIFESTYLE — fotorealistyczny produkt w użyciu ────────────────────
function buildLifestylePrompt(brief: Record<string, unknown>, brand: Record<string, unknown> | null): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  return [
    `Fotorealistyczne zdjęcie packshot / lifestyle: PRODUKT marki sprzedawany w tym sklepie pokazany w naturalnym użyciu przez grupę docelową (${s(brief.dla_kogo) || 'typowy klient sklepu'}). Edytorialna jakość fotografii produktowej, naturalne światło, płytka głębia ostrości (bokeh).`,
    `Produkt: ${s(brief.produkt) || s(brief.opis) || s(brief.nisza)}. Pokaż go atrakcyjnie, w realistycznym kontekście, w jakim klient go używa.`,
    `TŁO: autentyczne, dopasowane do produktu i grupy; produkt jest bohaterem kadru, ostry i wyeksponowany.`,
    buildStyleBlock(brief, brand),
    `JAKOŚĆ: realizm fotografii edytorialnej (NIE render 3D), poprawna anatomia (jeśli widać dłonie — pięć palców), naturalne kolory, bez tekstu na grafice, bez logotypów firm trzecich, bez znaków wodnych. BRAK interfejsu/UI — to czyste zdjęcie produktowe.`,
  ].join(' ')
}

// ── Widok: PODSUMOWANIE — infografika pitch e-com ───────────────────────────
function buildSummaryPrompt(
  brief: Record<string, unknown>,
  karta: Record<string, unknown>,
  brand: Record<string, unknown> | null,
): string {
  const s = (v: unknown, max = 220) => (typeof v === 'string' ? v.slice(0, max) : '')
  const list = (v: unknown, n = 4) => Array.isArray(v)
    ? v.filter((x) => typeof x === 'string').slice(0, n).join(', ')
    : ''
  const nazwa = (brand && typeof brand.nazwa === 'string' && brand.nazwa.trim())
    ? brand.nazwa.trim().slice(0, 80)
    : (s(brief.nazwa, 80) || 'Sklep')
  const fakty: string[] = []
  if (karta.produkt || brief.produkt) fakty.push(`PRODUKT (główny hook, wyróżnij): "${s(karta.produkt) || s(brief.produkt)}"`)
  if (karta.problem) fakty.push(`POTRZEBA / PROBLEM: ${s(karta.problem)}`)
  if (karta.dla_kogo || karta.profesja) fakty.push(`DLA KOGO: ${s(karta.dla_kogo) || s(karta.profesja)}`)
  if (karta.cena_detaliczna || karta.cena) fakty.push(`CENA: ${s(karta.cena_detaliczna) || s(karta.cena)}`)
  if (karta.marza || karta.sygnal_budzetu) fakty.push(`MARŻA / OPŁACALNOŚĆ: ${s(karta.marza) || s(karta.sygnal_budzetu)}`)
  if (list(karta.kanaly_dystrybucji, 3) || karta.dosiegalnosc) fakty.push(`KANAŁ DOTARCIA: ${list(karta.kanaly_dystrybucji, 3) || s(karta.dosiegalnosc)}`)
  if (karta.konkurencja) fakty.push(`KONKURENCJA: ${s(karta.konkurencja)}`)
  return [
    `Elegancka POZIOMA INFOGRAFIKA podsumowująca projekt sklepu internetowego „${nazwa}" — one-pager w stylu premium pitch-deck slide / business canvas. Pełny kadr, bez ramki przeglądarki.`,
    `UKŁAD: duży tytuł „${nazwa}" u góry; pod nim wyeksponowany produkt/obietnica; reszta jako siatka 4-6 zwięzłych kart z ikonami liniowymi i KRÓTKIMI etykietami (nagłówek karty 1-3 słowa + treść maks 6-8 słów). To podsumowanie BIZNESOWE — żadnych zrzutów sklepu, wykresów-ozdobników ani ludzi.`,
    `TREŚĆ KART (odwzoruj wiernie, skracaj mądrze): ${fakty.join('; ')}.`,
    buildStyleBlock(brief, brand),
    JAKOSC,
  ].join(' ')
}

// Wywołanie OpenAI Images API; przy błędzie nieznanego modelu — fallback.
// Zwraca też model FAKTYCZNIE użyty (po fallbacku) — do logu kosztów.
async function generateImage(apiKey: string, prompt: string): Promise<{ bytes: Uint8Array; usedModel: string }> {
  const TRANSIENT = new Set([429, 500, 502, 503, 504])
  const call = async (model: string): Promise<Response> => {
    const ctrl = new AbortController()
    const to = setTimeout(() => ctrl.abort(), 120000) // twardy timeout — request nie może wisieć w nieskończoność
    try {
      return await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          prompt,
          size: '1536x1024',
          quality: Deno.env.get('BUD_IMAGE_QUALITY') || 'medium',
          n: 1,
        }),
        signal: ctrl.signal,
      })
    } finally { clearTimeout(to) }
  }
  // Retry na błędy PRZEJŚCIOWE (429/5xx/sieć/timeout) — samoleczenie blipów OpenAI.
  const callRetry = async (model: string): Promise<Response> => {
    let last: Response | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1200 * attempt))
      try {
        const r = await call(model)
        if (r.ok || !TRANSIENT.has(r.status)) return r
        last = r
        console.error(`[bud-image] ${model} przejściowy ${r.status}, próba ${attempt + 1}/3`)
      } catch (e) {
        console.error(`[bud-image] ${model} sieć/timeout, próba ${attempt + 1}/3:`, e)
        if (attempt === 2) throw new Error('openai_images_error')
      }
    }
    return last as Response
  }

  let usedModel = IMAGE_MODEL
  let res = await callRetry(IMAGE_MODEL)
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    const modelProblem = res.status === 400 || res.status === 404
    console.error(`[bud-image] ${IMAGE_MODEL} error:`, res.status, errText.slice(0, 500))
    if (modelProblem && IMAGE_MODEL !== IMAGE_MODEL_FALLBACK && /model/i.test(errText)) {
      console.log(`[bud-image] fallback na ${IMAGE_MODEL_FALLBACK}`)
      res = await callRetry(IMAGE_MODEL_FALLBACK)
      usedModel = IMAGE_MODEL_FALLBACK
      if (!res.ok) {
        const fbText = await res.text().catch(() => '')
        console.error(`[bud-image] fallback error:`, res.status, fbText.slice(0, 500))
        throw new Error('openai_images_error')
      }
    } else {
      throw new Error('openai_images_error')
    }
  }

  const data = await res.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64 || typeof b64 !== 'string') {
    console.error('[bud-image] brak b64_json w odpowiedzi')
    throw new Error('openai_images_error')
  }
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return { bytes, usedModel }
}

// ── Powiadomienie #sparing: galeria gotowych makiet (raz na sesję) ───────────
// Wzorzec 1:1 ze spar-image (postSlackSparing). Błąd Slacka NIGDY nie wywraca
// generacji obrazka — tylko logujemy.
async function postSlackSparing(type: string, data: Record<string, unknown>): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) { console.error('[bud-image] slack-notify: brak SUPABASE_URL/KEY'); return }
    const res = await fetch(`${url}/functions/v1/slack-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ type, data }),
    })
    if (!res.ok) console.error(`[bud-image] slack-notify ${type} HTTP`, res.status, await res.text())
  } catch (err) {
    console.error(`[bud-image] slack-notify ${type} exception:`, err)
  }
}

// Po skompletowaniu startowego zestawu makiet → JEDNA wiadomość-galeria na
// #sparing. Atomowy claim na slack_preview_notified_at domyka równoległe
// generacje (tylko jeden request wygra wiersz). is_test pomijane.
async function maybeNotifyPreviewSlack(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
): Promise<void> {
  try {
    const { data: claimed, error } = await supabase
      .from('bud_sessions')
      .update({ slack_preview_notified_at: new Date().toISOString() })
      .eq('id', sessionId)
      .is('slack_preview_notified_at', null)
      .eq('is_test', false)
      .select('id, name, email, phone, preview_brief, preview_images, brand, landing_url')
    if (error) { console.error('[bud-image] preview slack claim error:', error); return }
    if (!claimed || !claimed.length) return
    const s = claimed[0] as Record<string, unknown>
    const brief = (s.preview_brief && typeof s.preview_brief === 'object') ? s.preview_brief as Record<string, unknown> : null
    const brand = (s.brand && typeof s.brand === 'object') ? s.brand as Record<string, unknown> : null
    const imgsObj = (s.preview_images && typeof s.preview_images === 'object') ? s.preview_images as Record<string, unknown> : {}
    // Kolejność: makiety sklepu, potem widoki extra (jeśli już istnieją)
    const order = ['sklep', 'karta_produktu', 'logo', 'lifestyle', 'podsumowanie']
    const images = order
      .filter((v) => typeof imgsObj[v] === 'string' && imgsObj[v])
      .map((v) => ({ view: v, url: imgsObj[v] as string }))
    await postSlackSparing('bud_preview', {
      session_id: sessionId,
      name: s.name ?? null,
      email: s.email ?? null,
      phone: s.phone ?? null,
      project_name: (brand && typeof brand.nazwa === 'string' && brand.nazwa) ? brand.nazwa : (brief?.nazwa ?? null),
      images,
      landing_url: (typeof s.landing_url === 'string' && s.landing_url) ? s.landing_url : null,
    })
  } catch (err) {
    console.error('[bud-image] maybeNotifyPreviewSlack exception:', err)
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
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[bud-image] brak konfiguracji')
      return jsonResponse({ error: 'brak_konfiguracji' }, 500, corsHeaders)
    }

    let body: { sessionId?: string; view?: string; force?: boolean }
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ error: 'nieprawidlowy_json' }, 400, corsHeaders)
    }
    const sessionId = (body.sessionId || '').trim()
    if (!sessionId || !UUID_RE.test(sessionId)) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 400, corsHeaders)
    }
    // Brak/nieznany view (stare frontendy) -> 'sklep'
    const view: ViewKey = (VIEWS as readonly string[]).includes(body.view || '')
      ? body.view as ViewKey
      : 'sklep'

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: session, error: sessionError } = await supabase
      .from('bud_sessions')
      .select('id, preview_brief, brand, image_count, preview_images, preview_history, problem_summary, auth_user_id')
      .eq('id', sessionId)
      .maybeSingle()

    if (sessionError) {
      console.error('[bud-image] session fetch error:', sessionError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }
    if (!session) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, corsHeaders)
    }
    // Bramka właściciela: sesja przypięta do konta wymaga JWT tego konta
    // (link ?id= przestaje działać jak hasło — lustrzane odbicie bud-chat).
    {
      const authUser = await verifyAuthUser(req, supabase)
      if (ownerDenied(session.auth_user_id as string | null, authUser)) {
        return jsonResponse({ error: 'wymagane_logowanie' }, 403, corsHeaders)
      }
    }
    const brief = session.preview_brief as Record<string, unknown> | null
    if (!brief) {
      // brief zapisuje bud-chat z markera <projekt> — bez niego nie generujemy
      // (endpoint publiczny: bez tego gate'u każdy mógłby palić obrazki naszym kluczem)
      return jsonResponse({ error: 'brak_projektu' }, 400, corsHeaders)
    }
    const brand = (session.brand && typeof session.brand === 'object' && !Array.isArray(session.brand))
      ? session.brand as Record<string, unknown>
      : null
    const imageCount = (session.image_count as number | null) ?? 0
    const karta = session.problem_summary as Record<string, unknown> | null
    if (EXTRA_VIEWS.includes(view)) {
      // Widoki extra: własny limit wersji per widok — nie zjadają puli makiet
      // (RPC nie inkrementuje image_count). 'podsumowanie' dodatkowo wymaga karty.
      if (view === 'podsumowanie' && !karta) {
        return jsonResponse({ error: 'brak_karty' }, 400, corsHeaders)
      }
      const histObj = (session.preview_history || {}) as Record<string, unknown>
      const histLen = Array.isArray(histObj[view]) ? (histObj[view] as unknown[]).length : 0
      const imgsObj = (session.preview_images || {}) as Record<string, unknown>
      const hasCurrent = typeof imgsObj[view] === 'string' ? 1 : 0
      // Bez force: istniejący obraz wraca z cache — frontend na czystym urządzeniu
      // woła ensure* zanim sync przyniesie URL-e (wyścig paliłby wersje). Regeneracja = force:true.
      if (!body.force && hasCurrent) {
        return jsonResponse({
          url: imgsObj[view] as string, view, archived: null,
          remaining: Math.max(0, MAX_IMAGES_PER_SESSION - imageCount), cached: true,
        }, 200, corsHeaders)
      }
      if (histLen + hasCurrent >= MAX_EXTRA_VERSIONS) {
        return jsonResponse({ error: 'limit_podsumowan' }, 429, corsHeaders)
      }
    } else if (imageCount >= MAX_IMAGES_PER_SESSION) {
      return jsonResponse({ error: 'limit_podgladow' }, 429, corsHeaders)
    }

    // Limit dzienny per IP — liczymy obrazy WYGENEROWANE w ostatnich 24 h
    // (bud_usage.created_at) dla wszystkich sesji tego IP.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    // Pierwsze STARTOWE_VIEWS makiety sesji (moment „wow") są spod capu IP wyłączone.
    if (ip && imageCount >= STARTOWE_VIEWS) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: ipSessions, error: ipError } = await supabase
        .from('bud_sessions')
        .select('id')
        .eq('ip', ip)
      if (ipError) {
        console.error('[bud-image] ip sessions query error:', ipError)
      } else if (ipSessions && ipSessions.length) {
        const { count: imgCount, error: usageErr2 } = await supabase
          .from('bud_usage')
          .select('id', { count: 'exact', head: true })
          .eq('kind', 'image')
          .in('session_id', ipSessions.map((r) => r.id))
          .gte('created_at', dayAgo)
        if (usageErr2) {
          console.error('[bud-image] ip usage count error:', usageErr2)
        } else if ((imgCount ?? 0) >= MAX_IMAGES_PER_IP_PER_DAY) {
          return jsonResponse({ error: 'limit_podgladow_dzienny' }, 429, corsHeaders)
        }
      }
    }

    // Limit dzienny per KONTO — obrazy z 24 h zliczane po WSZYSTKICH sesjach
    // przypiętych do auth_user_id (nowa rozmowa nie resetuje puli konta)
    const ownerId = (session.auth_user_id as string | null) || null
    if (ownerId && imageCount >= STARTOWE_VIEWS) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: ownerSessions, error: ownerErr } = await supabase
        .from('bud_sessions')
        .select('id')
        .eq('auth_user_id', ownerId)
      if (ownerErr) {
        console.error('[bud-image] owner sessions query error:', ownerErr)
      } else if (ownerSessions && ownerSessions.length) {
        const { count: ownerImgCount, error: ownerUsageErr } = await supabase
          .from('bud_usage')
          .select('id', { count: 'exact', head: true })
          .eq('kind', 'image')
          .in('session_id', ownerSessions.map((r) => r.id))
          .gte('created_at', dayAgo)
        if (ownerUsageErr) {
          console.error('[bud-image] owner usage count error:', ownerUsageErr)
        } else if ((ownerImgCount ?? 0) >= MAX_IMAGES_PER_USER_PER_DAY) {
          return jsonResponse({ error: 'limit_podgladow_dzienny' }, 429, corsHeaders)
        }
      }
    }

    const prompt = view === 'podsumowanie'
      ? buildSummaryPrompt(brief, karta as Record<string, unknown>, brand)
      : view === 'karta_produktu'
        ? buildProductPagePrompt(brief, brand)
        : view === 'logo'
          ? buildLogoPrompt(brief, brand)
          : view === 'lifestyle'
            ? buildLifestylePrompt(brief, brand)
            : buildStorePrompt(brief, brand)
    const { bytes, usedModel } = await generateImage(OPENAI_API_KEY, prompt)

    // Nazwa pliku per widok + timestamp wersji
    const path = `bud/${sessionId}/podglad-${view}-${Date.now()}.png`
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, bytes, { contentType: 'image/png', upsert: true })
    if (uploadError) {
      console.error('[bud-image] upload error:', uploadError)
      return jsonResponse({ error: 'blad_zapisu' }, 500, corsHeaders)
    }
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    const url = pub?.publicUrl
    if (!url) {
      return jsonResponse({ error: 'blad_zapisu' }, 500, corsHeaders)
    }

    // Koszt obrazu → bud_usage (panel TN Aplikacje liczy z tego PLN)
    const quality = Deno.env.get('BUD_IMAGE_QUALITY') || 'medium'
    const { error: usageErr } = await supabase.from('bud_usage').insert({
      session_id: sessionId,
      kind: 'image',
      model: usedModel,
      images: 1,
      cost_usd: IMAGE_COST_USD[quality] ?? IMAGE_COST_USD.medium,
      meta: { view, quality },
    })
    if (usageErr) console.error('[bud-image] usage insert error:', usageErr)

    // Atomowy zapis (równoległe generacje — bez wyścigu na read-modify-write);
    // RPC przenosi poprzednią wersję widoku do preview_history (nic nie przepada)
    const { data: newCount, error: rpcError } = await supabase
      .rpc('bud_record_image', { p_session: sessionId, p_view: view, p_url: url })
    if (rpcError) console.error('[bud-image] rpc bud_record_image error:', rpcError)
    const count = typeof newCount === 'number' ? newCount : imageCount + 1

    // Komplet makiet sklepu gotowy → jedna galeria na #sparing (dedup w
    // maybeNotifyPreviewSlack). waitUntil — powiadomienie nie może opóźnić
    // odpowiedzi do frontu ani zginąć po zwróceniu response.
    if (count >= STARTOWE_VIEWS) {
      const notifyTask = maybeNotifyPreviewSlack(supabase, sessionId)
      // deno-lint-ignore no-explicit-any
      const rt = (globalThis as any).EdgeRuntime
      if (rt?.waitUntil) rt.waitUntil(notifyTask)
      else await notifyTask.catch(() => {})
    }

    // archived: URL zastąpionej wersji — frontend dopisuje ją do lokalnego archiwum
    const prevImages = (session.preview_images || {}) as Record<string, unknown>
    const prevUrl = typeof prevImages[view] === 'string' && prevImages[view] !== url
      ? prevImages[view] as string
      : null

    // remaining = ile obrazów-poprawek zostało w puli sesji
    return jsonResponse({ url, view, archived: prevUrl, remaining: Math.max(0, MAX_IMAGES_PER_SESSION - count) }, 200, corsHeaders)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[bud-image] ERROR:', msg)
    return jsonResponse({ error: msg === 'openai_images_error' ? 'blad_generowania' : 'blad_serwera' }, 502, corsHeaders)
  }
})

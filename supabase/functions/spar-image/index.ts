// spar-image — podgląd graficzny narzędzia dla lejka "Stworzę" (tomekniedzwiecki.pl/aplikacja)
//
// ⚠️ DEPLOY: ZAWSZE z flagą --no-verify-jwt (frontend wywołuje bez tokena JWT):
//   npx supabase functions deploy spar-image --no-verify-jwt
//
// Flow v2 (4 WIDOKI): spar-chat zapisuje brief z markera <projekt> (z polem
// "widoki": panel/glowna/dodatkowa/landing) w spar_sessions.preview_brief i
// emituje event spar_projekt -> frontend woła ten endpoint RÓWNOLEGLE po jednym
// widoku ({sessionId, view}) -> generujemy obraz (OpenAI Images API), wrzucamy
// do storage i zapisujemy atomowo przez RPC spar_record_image (równoległe
// wywołania nie mogą się ścigać na image_count/preview_images).
//
// Limity: 8 obrazów/sesja = 4 startowe widoki + 4 poprawki; 20/dobę/IP.
// Widoki extra ('podsumowanie' — infografika karty; 'sklep' i 'telefon' —
// zestaw "marka istnieje") mają osobny limit 3 wersji/sesja per widok
// i nie zużywają puli image_count.
//
// Sekrety:
//   OPENAI_API_KEY     — klucz OpenAI (już ustawiony)
//   SPAR_IMAGE_MODEL   — opcjonalny override modelu (default gpt-image-2;
//                        przy błędzie "model not found" automatyczny fallback gpt-image-1)

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthUser, ownerDenied } from "../_shared/spar-owner.ts";

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

const IMAGE_MODEL = Deno.env.get('SPAR_IMAGE_MODEL') || 'gpt-image-2'
const IMAGE_MODEL_FALLBACK = 'gpt-image-1'
// Koszt USD jednego obrazu 1536x1024 per quality (logowanie do spar_usage)
const IMAGE_COST_USD: Record<string, number> = { low: 0.011, medium: 0.041, high: 0.167 }
const MAX_IMAGES_PER_SESSION = 16    // 4 widoki startowe + 12 poprawek (~3 rundy poprawek
                                     // wizualnych; jedna uwaga „zrób cieplej" regeneruje 4 widoki)
const STARTOWE_VIEWS = 4             // pierwsze 4 makiety = moment „wow" lejka — NIGDY nie blokuj
                                     // ich dziennym capem IP/konta (patrz niżej)
// Dzienny limit per IP (anty-abuse). UWAGA: cap zlicza obrazy ze WSZYSTKICH sesji
// dzielących IP, więc za współdzielonym NAT-em (mobile/biuro/szkoła) realni userzy
// się kumulują — NIE ustawiać zbyt nisko (20 było za mało; ~120 znosi normalny ruch).
// Pierwsze STARTOWE_VIEWS makiety sesji są spod tego capu wyłączone.
const MAX_IMAGES_PER_IP_PER_DAY = parseInt(Deno.env.get('SPAR_IMG_IP_DAILY') || '120', 10)
// Dzienny limit per KONTO (auth_user_id) — IP łatwo zmienić, konto trudniej.
// Na czas testów default 200; PRZED kampanią ustawić env SPAR_IMG_USER_DAILY=20.
const MAX_IMAGES_PER_USER_PER_DAY = parseInt(Deno.env.get('SPAR_IMG_USER_DAILY') || '200', 10)
const STORAGE_BUCKET = 'attachments'

const VIEWS = ['panel', 'glowna', 'dodatkowa', 'landing', 'podsumowanie', 'sklep', 'telefon'] as const
type ViewKey = typeof VIEWS[number]
// Widoki EXTRA nie zużywają puli image_count (RPC pomija inkrement),
// każdy ma własny limit wersji per sesja:
//   'podsumowanie' — infografika karty projektu (wymaga karty/werdyktu)
//   'sklep'        — zestaw "marka istnieje": karta aplikacji w sklepie
//   'telefon'      — zestaw "marka istnieje": lifestyle shot z telefonem w dłoni
const EXTRA_VIEWS: readonly ViewKey[] = ['podsumowanie', 'sklep', 'telefon']
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
// Źródłem jest brief.design — obiekt z decyzjami projektowymi, które model
// czatu PROJEKTUJE indywidualnie pod każdy projekt na podstawie rozmowy
// (tło/akcenty z hexami, geometria, typografia, element podpisowy). Bez tego
// obiektu wszystkie podglądy zbiegały do jednego wzorca „granatowy SaaS na
// bieli" — projekty społeczności są oglądane obok siebie, muszą się różnić.
// brief.styl = życzenia wizualne KLIENTA (priorytet nad designem od AI).
function buildStyleBlock(brief: Record<string, unknown>): string {
  const styl = typeof brief.styl === 'string' ? brief.styl.trim().slice(0, 500) : ''
  const design = (brief.design && typeof brief.design === 'object' && !Array.isArray(brief.design))
    ? brief.design as Record<string, unknown>
    : null
  const d = (k: string, max = 200) =>
    (design && typeof design[k] === 'string' ? (design[k] as string).trim().slice(0, max) : '')

  if (design && d('tlo') && d('akcent')) {
    const parts: string[] = []
    if (d('kierunek')) parts.push(`charakter: ${d('kierunek')}`)
    parts.push(`tło aplikacji: ${d('tlo')}`)
    if (d('powierzchnia')) parts.push(`karty i panele: ${d('powierzchnia')}`)
    parts.push(`kolor akcji (przyciski, aktywne elementy): ${d('akcent')}`)
    if (d('akcent2')) parts.push(`drugi akcent (statusy, wyróżnienia): ${d('akcent2')}`)
    if (d('geometria')) parts.push(`geometria: ${d('geometria')}`)
    if (d('typografia')) parts.push(`typografia: ${d('typografia')}`)
    if (d('podpis')) parts.push(`element podpisowy tego narzędzia (musi być widoczny): ${d('podpis')}`)
    const base = `DESIGN SYSTEM TEGO NARZĘDZIA (zaprojektowany indywidualnie — odwzoruj DOKŁADNIE i IDENTYCZNIE na wszystkich widokach): ${parts.join('; ')}. Jakość premium: czysta siatka, jedna spójna paleta wyprowadzona z powyższych kolorów, dużo światła między elementami, spójny zestaw ikon dopasowany do charakteru.`
    return styl
      ? `${base} WYTYCZNE KLIENTA (PRIORYTET — w razie konfliktu nadpisują design system): ${styl}.`
      : base
  }

  // Fallback dla sesji bez brief.design (starsze rozmowy / ucięty marker)
  if (styl) {
    return `DESIGN SYSTEM (IDENTYCZNY na wszystkich widokach tego narzędzia — wytyczne klienta mają PRIORYTET, zastosuj je dokładnie): ${styl}. Niezależnie od nich utrzymaj jakość premium SaaS: czysta siatka, jedna spójna paleta, zaokrąglenia 12-16px, dużo światła między elementami, nowoczesna typografia sans-serif (Inter), spójny zestaw ikon liniowych.`
  }
  return 'DESIGN SYSTEM (IDENTYCZNY na wszystkich widokach tego narzędzia): premium dark-mode SaaS klasy Linear/Stripe/Vercel — tło grafitowo-czarne #0B0D12, panele glassmorphism z subtelnymi obramowaniami rgba(255,255,255,0.08), elektryczny niebieski akcent #4D9FFF na przyciskach i aktywnych elementach, zaokrąglenia 12-16px, czysta siatka, dużo światła między elementami, nowoczesna typografia sans-serif (Inter), spójny zestaw ikon liniowych.'
}

// Infografika „Projekt w pigułce" — graficzne podsumowanie KARTY projektu
// (dla kogo, kto płaci, jak radzą sobie dziś, pierwsza wersja, rynek).
// Regenerowana po każdej poprawce projektu (karta się zmienia), stare wersje
// trafiają do preview_history jak przy ekranach.
function buildSummaryPrompt(
  brief: Record<string, unknown>,
  karta: Record<string, unknown>,
): string {
  const s = (v: unknown, max = 220) => (typeof v === 'string' ? v.slice(0, max) : '')
  const list = (v: unknown, n = 4) => Array.isArray(v)
    ? v.filter((x) => typeof x === 'string').slice(0, n).join(', ')
    : ''
  const nazwa = s(brief.nazwa, 80) || 'Narzędzie'
  const fakty: string[] = []
  if (karta.problem) fakty.push(`PROBLEM (główny hook, wyróżnij): "${s(karta.problem)}"`)
  if (karta.dla_kogo || karta.profesja) fakty.push(`DLA KOGO: ${s(karta.dla_kogo) || s(karta.profesja)}`)
  if (karta.kto_placi) fakty.push(`KTO PŁACI: ${s(karta.kto_placi)}`)
  if (karta.sygnal_budzetu) fakty.push(`BUDŻET: ${s(karta.sygnal_budzetu)}`)
  if (karta.dzisiejsze_obejscie) fakty.push(`DZIŚ RADZĄ SOBIE: ${s(karta.dzisiejsze_obejscie)}`)
  if (list(karta.ekrany)) fakty.push(`PIERWSZA WERSJA — EKRANY: ${list(karta.ekrany)}`)
  if (list(karta.kanaly_dystrybucji, 3)) fakty.push(`KANAŁY DOTARCIA: ${list(karta.kanaly_dystrybucji, 3)}`)
  if (karta.konkurencja) fakty.push(`KONKURENCJA: ${s(karta.konkurencja)}`)
  return [
    `Elegancka POZIOMA INFOGRAFIKA podsumowująca projekt narzędzia „${nazwa}" — one-pager w stylu premium pitch-deck slide / product canvas. Pełny kadr, bez ramki przeglądarki.`,
    `UKŁAD: duży tytuł „${nazwa}" u góry; pod nim wyeksponowany cytat problemu; reszta jako siatka 4-6 zwięzłych kart z ikonami liniowymi i KRÓTKIMI etykietami (nagłówek karty 1-3 słowa + treść maks 6-8 słów). To podsumowanie BIZNESOWE — żadnych zrzutów interfejsu aplikacji, wykresów-ozdobników ani ludzi.`,
    `TREŚĆ KART (odwzoruj wiernie, skracaj mądrze): ${fakty.join('; ')}.`,
    buildStyleBlock(brief),
    'TYPOGRAFIA I TEKST: bardzo mało tekstu, duże czytelne napisy, bezbłędna polszczyzna z poprawnymi znakami diakrytycznymi (ą, ć, ę, ł, ń, ó, ś, ź, ż); zero lorem ipsum, zero angielskich słów. JAKOŚĆ: dopracowanie jak top shot z Dribbble, pixel-perfect, miękkie cienie, spójna hierarchia, bez logotypów firm trzecich i znaków wodnych.',
  ].join(' ')
}

// Zestaw "marka istnieje" — psychologia własności: pomysłodawca widzi swój
// produkt tam, gdzie żyją prawdziwe aplikacje (sklep) i w prawdziwych rękach
// grupy docelowej (telefon). Generyczny sklep mobilny — ŻADNYCH logotypów
// Apple/Google (znaki firm trzecich).
function buildStorePrompt(brief: Record<string, unknown>): string {
  const s = (v: unknown, max = 220) => (typeof v === 'string' ? v.slice(0, max) : '')
  const nazwa = s(brief.nazwa, 80) || 'Narzędzie'
  return [
    `Elegancki marketingowy mockup: nowoczesny smartfon ustawiony pionowo na środku kadru, na ekranie otwarta KARTA PRODUKTU aplikacji „${nazwa}" w mobilnym sklepie z aplikacjami (generyczny, czysty design sklepu — bez logotypów Apple, Google ani nazw realnych sklepów).`,
    `NA KARCIE SKLEPU: duża kwadratowa ikona aplikacji (zaprojektuj ją z design systemu poniżej — prosta, zapamiętywalna, bez tekstu w ikonie), obok nazwa „${nazwa}" i krótki polski podtytuł oddający obietnicę: „${s(brief.problem, 120)}"; pod spodem wiersz ocen (4,9 i pięć gwiazdek, liczba opinii), przycisk „Zainstaluj", niżej 2-3 pionowe miniatury zrzutów ekranu aplikacji (uproszczone, spójne z design systemem) i początek krótkiego opisu po polsku.`,
    `Dla kogo: ${s(brief.dla_kogo)}. ${s(brief.opis, 200)}`,
    `TŁO KADRU: miękkie, rozświetlone tło w kolorach marki (gradient/poświata z palety design systemu), delikatny cień pod telefonem — kompozycja jak hero z premium strony produktowej.`,
    buildStyleBlock(brief),
    'TYPOGRAFIA I TEKST: bardzo mało tekstu, duże czytelne napisy, bezbłędna polszczyzna z poprawnymi znakami diakrytycznymi (ą, ć, ę, ł, ń, ó, ś, ź, ż); zero lorem ipsum, zero angielskich słów. JAKOŚĆ: pixel-perfect, fotorealistyczny telefon, miękkie cienie, bez ludzi, bez znaków wodnych, bez logotypów firm trzecich.',
  ].join(' ')
}

function buildPhonePrompt(brief: Record<string, unknown>): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const widoki = (brief.widoki && typeof brief.widoki === 'object')
    ? brief.widoki as Record<string, unknown>
    : {}
  const nazwa = s(brief.nazwa, 80) || 'Narzędzie'
  const panelDesc = s(widoki.panel, 500) || s(widoki.glowna, 500)
  return [
    `Fotorealistyczne zdjęcie lifestyle w naturalnym świetle: dłoń osoby z grupy docelowej (${s(brief.dla_kogo)}) trzyma nowoczesny smartfon, na którym otwarta jest aplikacja „${nazwa}". Kadr zza ramienia / zbliżenie na dłoń z telefonem — twarz osoby NIE jest widoczna albo mocno rozmyta w tle.`,
    `TŁO: autentyczne, lekko rozmyte (bokeh) środowisko codziennej pracy tej grupy zawodowej — dobierz scenerię naturalnie do profesji; głębia ostrości jak z obiektywu 50mm f/1.8.`,
    `EKRAN TELEFONU (ostry, czytelny, to bohater zdjęcia): mobilna wersja głównego ekranu aplikacji${panelDesc ? ` — ${panelDesc}` : ''} — uproszczona do 3-4 dużych elementów, realistyczne polskie dane.`,
    buildStyleBlock(brief),
    'TYPOGRAFIA NA EKRANIE: mało tekstu, duże etykiety, bezbłędna polszczyzna z poprawnymi znakami diakrytycznymi (ą, ć, ę, ł, ń, ó, ś, ź, ż). JAKOŚĆ: realizm fotografii edytorialnej (nie render 3D), naturalna skóra dłoni, poprawna anatomia dłoni z pięcioma palcami, miękkie naturalne światło, bez logotypów firm trzecich, bez znaków wodnych.',
  ].join(' ')
}

// Ekrany robocze narzędzia (pula image_count) — bez widoków EXTRA
type ScreenView = 'panel' | 'glowna' | 'dodatkowa' | 'landing'

function buildImagePrompt(brief: Record<string, unknown>, view: ScreenView): string {
  const s = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '')
  const widoki = (brief.widoki && typeof brief.widoki === 'object')
    ? brief.widoki as Record<string, unknown>
    : {}
  const viewDesc = s(widoki[view], 700)
  const nazwa = s(brief.nazwa) || 'Narzędzie'
  const kontekst = `Narzędzie „${nazwa}" dla: ${s(brief.dla_kogo)}. Rozwiązuje: ${s(brief.problem)}. ${s(brief.opis)}`
  const styleBlock = buildStyleBlock(brief)
  const jakosc = 'TREŚCI: realistyczne polskie dane przykładowe dopasowane do tej branży — prawdziwie brzmiące nazwy, imiona, daty, kwoty w zł; zero lorem ipsum. TYPOGRAFIA I TEKST (kluczowe dla czytelności): MAŁO tekstu, DUŻE czytelne etykiety; teksty pomocnicze maksymalnie 2-4 słowa, żadnych długich zdań w interfejsie; powtarzalne elementy (wiersze list, karty) ogranicz do 4-6 sztuk — lepiej mniej, a większe; bezbłędna polszczyzna z poprawnymi znakami diakrytycznymi (ą, ć, ę, ł, ń, ó, ś, ź, ż). JAKOŚĆ: dopracowanie jak top shot z Dribbble/Behance, pixel-perfect, miękkie cienie i głębia, bez ludzi, bez logotypów firm trzecich, bez znaków wodnych.'
  // To MAŁE, skupione narzędzie — obraz nie może sugerować rozbudowanego systemu
  const prostota = 'PROSTOTA (twarda zasada): to małe, skupione narzędzie rozwiązujące JEDEN problem — pokaż wyłącznie elementy opisane wyżej. Minimalna nawigacja: wąski pasek górny albo lista maks 3-4 pozycji; ŻADNYCH rozbudowanych sidebarów z wieloma modułami, dodatkowych zakładek, wykresów-ozdobników ani paneli sugerujących duży system klasy CRM/ERP. Dużo światła, jeden wyraźny cel ekranu.'

  if (view === 'landing') {
    const ekrany = Array.isArray(brief.ekrany)
      ? brief.ekrany.filter((e) => typeof e === 'string').slice(0, 4).join(', ')
      : ''
    return [
      `Pełnoekranowy zrzut STRONY SPRZEDAŻOWEJ (marketing landing page) produktu „${nazwa}" — widok wprost, full-bleed, bez ramki przeglądarki.`,
      kontekst,
      viewDesc
        ? `ZAWARTOŚĆ I KOMPOZYCJA STRONY (zaprojektowana pod ten projekt — odwzoruj wiernie, ŁĄCZNIE z opisanym układem hero): ${viewDesc}`
        : `ZAWARTOŚĆ STRONY: hero z mocnym polskim nagłówkiem-obietnicą rozwiązania problemu, podtytuł, przycisk CTA, obok ukośnie osadzony zrzut interfejsu narzędzia; niżej pasek zaufania i sekcja 3 korzyści z ikonami${ekrany ? ` (nawiązujące do: ${ekrany})` : ''}.`,
      styleBlock,
      'To strona WWW sprzedająca narzędzie (typografia marketingowa, sekcje, dużo oddechu) — NIE ekran aplikacji; zrzut interfejsu pojawia się tylko jako element hero.',
      'KADR: pokaż GÓRNĄ część strony — hero wypełnia większość kadru (wielki, czytelny nagłówek), pod nim pasek zaufania i zajawka sekcji korzyści. NIE ściskaj całej długiej strony w jeden kadr — mniej sekcji, większa typografia.',
      jakosc,
    ].join(' ')
  }

  const viewIntro: Record<Exclude<ScreenView, 'landing'>, string> = {
    panel: `Pełnoekranowy zrzut interfejsu PROSTEJ aplikacji webowej „${nazwa}" — GŁÓWNY PULPIT (jeden rzut oka na najważniejsze). Widok wprost, full-bleed, bez ramki przeglądarki i bez tła dookoła.`,
    glowna: `Pełnoekranowy zrzut interfejsu PROSTEJ aplikacji webowej „${nazwa}" — EKRAN GŁÓWNEJ FUNKCJI W UŻYCIU (moment, w którym narzędzie rozwiązuje problem użytkownika). Widok wprost, full-bleed, bez ramki przeglądarki. To NIE jest dashboard z wykresami — to konkretny ekran roboczy jednej funkcji.`,
    dodatkowa: `Pełnoekranowy zrzut interfejsu PROSTEJ aplikacji webowej „${nazwa}" — DRUGI EKRAN wspierający główną funkcję (np. lista, szczegóły, ustawienia). Widok wprost, full-bleed, bez ramki przeglądarki. To NIE jest dashboard z wykresami ani osobny moduł — to ekran roboczy tego samego, małego narzędzia.`,
  }

  const fallbackLayout: Record<Exclude<ScreenView, 'landing'>, string> = {
    panel: 'LAYOUT: prosty pulpit z jednym celem — wąski pasek górny z nazwą narzędzia, 2-3 kluczowe liczby w prostych kartach, pod spodem JEDNA czytelna lista najważniejszych spraw ze statusami; bez sidebara, bez wykresów.',
    glowna: 'LAYOUT: jeden duży ekran roboczy głównej funkcji — formularz/lista/edytor w akcji, z wypełnionymi danymi i widocznym kolejnym krokiem użytkownika; nawigacja tylko jako wąski pasek górny.',
    dodatkowa: 'LAYOUT: jeden ekran wspierający główną funkcję (lista albo widok szczegółu) z wypełnionymi danymi; nawigacja tylko jako wąski pasek górny.',
  }

  return [
    viewIntro[view],
    kontekst,
    viewDesc
      ? `ZAWARTOŚĆ EKRANU (z ustaleń z klientem, odwzoruj wiernie i szczegółowo): ${viewDesc}`
      : fallbackLayout[view],
    styleBlock,
    prostota,
    jakosc,
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
          quality: Deno.env.get('SPAR_IMAGE_QUALITY') || 'medium',
          n: 1,
        }),
        signal: ctrl.signal,
      })
    } finally { clearTimeout(to) }
  }
  // Retry na błędy PRZEJŚCIOWE (429/5xx/sieć/timeout) — samoleczenie blipów OpenAI,
  // żeby chwilowy problem nie kończył się komunikatem „nie udało się wygenerować".
  const callRetry = async (model: string): Promise<Response> => {
    let last: Response | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1200 * attempt))
      try {
        const r = await call(model)
        if (r.ok || !TRANSIENT.has(r.status)) return r
        last = r
        console.error(`[spar-image] ${model} przejściowy ${r.status}, próba ${attempt + 1}/3`)
      } catch (e) {
        console.error(`[spar-image] ${model} sieć/timeout, próba ${attempt + 1}/3:`, e)
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
    console.error(`[spar-image] ${IMAGE_MODEL} error:`, res.status, errText.slice(0, 500))
    if (modelProblem && IMAGE_MODEL !== IMAGE_MODEL_FALLBACK && /model/i.test(errText)) {
      console.log(`[spar-image] fallback na ${IMAGE_MODEL_FALLBACK}`)
      res = await callRetry(IMAGE_MODEL_FALLBACK)
      usedModel = IMAGE_MODEL_FALLBACK
      if (!res.ok) {
        const fbText = await res.text().catch(() => '')
        console.error(`[spar-image] fallback error:`, res.status, fbText.slice(0, 500))
        throw new Error('openai_images_error')
      }
    } else {
      throw new Error('openai_images_error')
    }
  }

  const data = await res.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64 || typeof b64 !== 'string') {
    console.error('[spar-image] brak b64_json w odpowiedzi')
    throw new Error('openai_images_error')
  }
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return { bytes, usedModel }
}

// ── Powiadomienie #sparing: galeria gotowych ekranów (raz na sesję) ──────────
// Wzorzec 1:1 ze spar-chat (postSlackSparing). Błąd Slacka NIGDY nie wywraca
// generacji obrazka — tylko logujemy.
async function postSlackSparing(type: string, data: Record<string, unknown>): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) { console.error('[spar-image] slack-notify: brak SUPABASE_URL/KEY'); return }
    const res = await fetch(`${url}/functions/v1/slack-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ type, data }),
    })
    if (!res.ok) console.error(`[spar-image] slack-notify ${type} HTTP`, res.status, await res.text())
  } catch (err) {
    console.error(`[spar-image] slack-notify ${type} exception:`, err)
  }
}

// Po skompletowaniu startowego zestawu ekranów → JEDNA wiadomość-galeria na
// #sparing. Atomowy claim na slack_preview_notified_at domyka 4 równoległe
// generacje (tylko jeden request wygra wiersz). is_test pomijane. Regeneracje/
// poprawki nie pingują ponownie (kolumna już niepusta). Wołane tylko gdy nowy
// image_count >= STARTOWE_VIEWS (komplet ekranów roboczych istnieje).
async function maybeNotifyPreviewSlack(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
): Promise<void> {
  try {
    const { data: claimed, error } = await supabase
      .from('spar_sessions')
      .update({ slack_preview_notified_at: new Date().toISOString() })
      .eq('id', sessionId)
      .is('slack_preview_notified_at', null)
      .eq('is_test', false)
      .select('id, name, email, phone, preview_brief, preview_images, landing_url')
    if (error) { console.error('[spar-image] preview slack claim error:', error); return }
    if (!claimed || !claimed.length) return
    const s = claimed[0] as Record<string, unknown>
    const brief = (s.preview_brief && typeof s.preview_brief === 'object') ? s.preview_brief as Record<string, unknown> : null
    const imgsObj = (s.preview_images && typeof s.preview_images === 'object') ? s.preview_images as Record<string, unknown> : {}
    // Kolejność: ekrany robocze, potem widoki extra (jeśli już istnieją)
    const order = ['panel', 'glowna', 'dodatkowa', 'landing', 'podsumowanie', 'sklep', 'telefon']
    const images = order
      .filter((v) => typeof imgsObj[v] === 'string' && imgsObj[v])
      .map((v) => ({ view: v, url: imgsObj[v] as string }))
    // Prototyp żyje w spar_usage (kind='prototype', meta.url) — brak kolumny
    let prototypeUrl: string | null = null
    try {
      const { data: proto } = await supabase
        .from('spar_usage')
        .select('meta')
        .eq('session_id', sessionId)
        .eq('kind', 'prototype')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      const m = proto?.meta as Record<string, unknown> | undefined
      if (m && typeof m.url === 'string') prototypeUrl = m.url
    } catch (e) { console.error('[spar-image] prototype url lookup error:', e) }
    await postSlackSparing('spar_preview', {
      session_id: sessionId,
      name: s.name ?? null,
      email: s.email ?? null,
      phone: s.phone ?? null,
      project_name: brief?.nazwa ?? null,
      images,
      landing_url: (typeof s.landing_url === 'string' && s.landing_url) ? s.landing_url : null,
      prototype_url: prototypeUrl,
    })
  } catch (err) {
    console.error('[spar-image] maybeNotifyPreviewSlack exception:', err)
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
      console.error('[spar-image] brak konfiguracji')
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
    // Brak/nieznany view (stare frontendy) -> 'panel'
    const view: ViewKey = (VIEWS as readonly string[]).includes(body.view || '')
      ? body.view as ViewKey
      : 'panel'

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: session, error: sessionError } = await supabase
      .from('spar_sessions')
      .select('id, preview_brief, image_count, preview_images, preview_history, problem_summary, auth_user_id')
      .eq('id', sessionId)
      .maybeSingle()

    if (sessionError) {
      console.error('[spar-image] session fetch error:', sessionError)
      return jsonResponse({ error: 'blad_serwera' }, 500, corsHeaders)
    }
    if (!session) {
      return jsonResponse({ error: 'nieprawidlowa_sesja' }, 404, corsHeaders)
    }
    // Bramka właściciela: sesja przypięta do konta wymaga JWT tego konta
    // (link ?id= przestaje działać jak hasło — lustrzane odbicie spar-chat).
    {
      const authUser = await verifyAuthUser(req, supabase)
      if (ownerDenied(session.auth_user_id as string | null, authUser)) {
        return jsonResponse({ error: 'wymagane_logowanie' }, 403, corsHeaders)
      }
    }
    const brief = session.preview_brief as Record<string, unknown> | null
    if (!brief) {
      // brief zapisuje spar-chat z markera <projekt> — bez niego nie generujemy
      // (endpoint publiczny: bez tego gate'u każdy mógłby palić obrazki naszym kluczem)
      return jsonResponse({ error: 'brak_projektu' }, 400, corsHeaders)
    }
    const imageCount = (session.image_count as number | null) ?? 0
    const karta = session.problem_summary as Record<string, unknown> | null
    if (EXTRA_VIEWS.includes(view)) {
      // Widoki extra: własny limit wersji per widok — nie zjadają puli ekranów
      // (RPC nie inkrementuje image_count). 'podsumowanie' dodatkowo wymaga
      // karty (infografika rysuje treść karty projektu po werdykcie).
      if (view === 'podsumowanie' && !karta) {
        return jsonResponse({ error: 'brak_karty' }, 400, corsHeaders)
      }
      const histObj = (session.preview_history || {}) as Record<string, unknown>
      const histLen = Array.isArray(histObj[view]) ? (histObj[view] as unknown[]).length : 0
      const imgsObj = (session.preview_images || {}) as Record<string, unknown>
      const hasCurrent = typeof imgsObj[view] === 'string' ? 1 : 0
      // Bez force: istniejący obraz wraca z cache — frontend na czystym
      // urządzeniu woła ensure* zanim sync przyniesie URL-e (wyścig paliłby
      // wersje i tokeny). Regeneracja (np. pigułka po poprawce) = force:true.
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
    // (spar_usage.created_at) dla wszystkich sesji tego IP. Liczenie po
    // image_count sesji z created_at łatwo było ominąć starą sesją (>24 h),
    // bo image_count to licznik kumulatywny, a filtr patrzył na wiek sesji.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    // #4: pierwsze STARTOWE_VIEWS makiety sesji (moment „wow") są spod capu IP wyłączone,
    // żeby user za współdzielonym NAT-em nie stracił podglądu przez cudzy ruch.
    if (ip && imageCount >= STARTOWE_VIEWS) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: ipSessions, error: ipError } = await supabase
        .from('spar_sessions')
        .select('id')
        .eq('ip', ip)
      if (ipError) {
        console.error('[spar-image] ip sessions query error:', ipError)
      } else if (ipSessions && ipSessions.length) {
        const { count: imgCount, error: usageErr2 } = await supabase
          .from('spar_usage')
          .select('id', { count: 'exact', head: true })
          .eq('kind', 'image')
          .in('session_id', ipSessions.map((r) => r.id))
          .gte('created_at', dayAgo)
        if (usageErr2) {
          console.error('[spar-image] ip usage count error:', usageErr2)
        } else if ((imgCount ?? 0) >= MAX_IMAGES_PER_IP_PER_DAY) {
          return jsonResponse({ error: 'limit_podgladow_dzienny' }, 429, corsHeaders)
        }
      }
    }

    // Limit dzienny per KONTO — obrazy z 24 h zliczane po WSZYSTKICH sesjach
    // przypiętych do auth_user_id (nowa rozmowa nie resetuje puli konta)
    const ownerId = (session.auth_user_id as string | null) || null
    // #4: jak wyżej — startowe makiety nie podlegają dziennemu capowi konta
    if (ownerId && imageCount >= STARTOWE_VIEWS) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: ownerSessions, error: ownerErr } = await supabase
        .from('spar_sessions')
        .select('id')
        .eq('auth_user_id', ownerId)
      if (ownerErr) {
        console.error('[spar-image] owner sessions query error:', ownerErr)
      } else if (ownerSessions && ownerSessions.length) {
        const { count: ownerImgCount, error: ownerUsageErr } = await supabase
          .from('spar_usage')
          .select('id', { count: 'exact', head: true })
          .eq('kind', 'image')
          .in('session_id', ownerSessions.map((r) => r.id))
          .gte('created_at', dayAgo)
        if (ownerUsageErr) {
          console.error('[spar-image] owner usage count error:', ownerUsageErr)
        } else if ((ownerImgCount ?? 0) >= MAX_IMAGES_PER_USER_PER_DAY) {
          return jsonResponse({ error: 'limit_podgladow_dzienny' }, 429, corsHeaders)
        }
      }
    }

    const prompt = view === 'podsumowanie'
      ? buildSummaryPrompt(brief, karta as Record<string, unknown>)
      : view === 'sklep'
        ? buildStorePrompt(brief)
        : view === 'telefon'
          ? buildPhonePrompt(brief)
          : buildImagePrompt(brief, view as ScreenView)
    const { bytes, usedModel } = await generateImage(OPENAI_API_KEY, prompt)

    // Nazwa pliku per widok + timestamp wersji (upsert nadpisuje poprzednią
    // wersję tego samego widoku tylko gdy nazwa identyczna — wersjonujemy)
    const path = `spar/${sessionId}/podglad-${view}-${Date.now()}.png`
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, bytes, { contentType: 'image/png', upsert: true })
    if (uploadError) {
      console.error('[spar-image] upload error:', uploadError)
      return jsonResponse({ error: 'blad_zapisu' }, 500, corsHeaders)
    }
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    const url = pub?.publicUrl
    if (!url) {
      return jsonResponse({ error: 'blad_zapisu' }, 500, corsHeaders)
    }

    // Koszt obrazu → spar_usage (panel TN Aplikacje liczy z tego PLN)
    const quality = Deno.env.get('SPAR_IMAGE_QUALITY') || 'medium'
    const { error: usageErr } = await supabase.from('spar_usage').insert({
      session_id: sessionId,
      kind: 'image',
      model: usedModel,
      images: 1,
      cost_usd: IMAGE_COST_USD[quality] ?? IMAGE_COST_USD.medium,
      meta: { view, quality },
    })
    if (usageErr) console.error('[spar-image] usage insert error:', usageErr)

    // Atomowy zapis (4 równoległe generacje — bez wyścigu na read-modify-write);
    // RPC przenosi poprzednią wersję widoku do preview_history (nic nie przepada)
    const { data: newCount, error: rpcError } = await supabase
      .rpc('spar_record_image', { p_session: sessionId, p_view: view, p_url: url })
    if (rpcError) console.error('[spar-image] rpc spar_record_image error:', rpcError)
    const count = typeof newCount === 'number' ? newCount : imageCount + 1

    // Komplet ekranów roboczych gotowy → jedna galeria na #sparing (dedup w
    // maybeNotifyPreviewSlack). waitUntil — powiadomienie nie może opóźnić
    // odpowiedzi do frontu ani zginąć po zwróceniu response.
    if (count >= STARTOWE_VIEWS) {
      const notifyTask = maybeNotifyPreviewSlack(supabase, sessionId)
      // deno-lint-ignore no-explicit-any
      const rt = (globalThis as any).EdgeRuntime
      if (rt?.waitUntil) rt.waitUntil(notifyTask)
      else await notifyTask.catch(() => {})
    }

    // archived: URL zastąpionej wersji — frontend dopisuje ją do lokalnego
    // archiwum nawet, gdy nie znał poprzedniego stanu (np. po powrocie z linku)
    const prevImages = (session.preview_images || {}) as Record<string, unknown>
    const prevUrl = typeof prevImages[view] === 'string' && prevImages[view] !== url
      ? prevImages[view] as string
      : null

    // remaining = ile obrazów-poprawek zostało w puli sesji
    return jsonResponse({ url, view, archived: prevUrl, remaining: Math.max(0, MAX_IMAGES_PER_SESSION - count) }, 200, corsHeaders)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[spar-image] ERROR:', msg)
    return jsonResponse({ error: msg === 'openai_images_error' ? 'blad_generowania' : 'blad_serwera' }, 502, corsHeaders)
  }
})

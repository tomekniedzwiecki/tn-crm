// SEZONOWOŚĆ POPYTU — jedno źródło prawdy (SSOT: docs/zbuduje/SEZONOWOSC.md).
//
// Enum sezonów PL to ZAMKNIĘTA lista. GPT wybiera wyłącznie KOD; okno sprzedażowe
// (sell_from/sell_to 'MM-DD') narzuca SERWER z tej tabeli — model nigdy nie podaje dat
// ani wolnych etykiet. Dzięki temu ~96% za wąskich okien (skopiowanych z przykładów
// promptu) znika, a granice są spójne we wszystkich funkcjach.
//
// W bazie trzymamy season_type ('all_year'|'seasonal') + season_label (PL) + sell_from/sell_to.
// „Kod" jest kanoniczny w tym module; label/okno wyprowadzamy z SEASONS.

export type SeasonCode =
  | 'all_year'
  | 'lato'
  | 'zima_grzanie'
  | 'swieta_bn'
  | 'ogrod_wiosna'
  | 'grill'
  | 'back_to_school'

export interface SeasonDef {
  code: SeasonCode
  label: string
  sell_from: string | null // 'MM-DD' okno sprzedażowe (start ~4-6 tyg. przed sezonem)
  sell_to: string | null // 'MM-DD' (koniec ~2-3 tyg. przed końcem; wrap-around dozwolony)
}

// Tabela z SSOT (kod → {label, okno}). all_year = bez okna.
export const SEASONS: Record<SeasonCode, SeasonDef> = {
  all_year: { code: 'all_year', label: 'całoroczny', sell_from: null, sell_to: null },
  lato: { code: 'lato', label: 'lato', sell_from: '04-15', sell_to: '08-31' },
  zima_grzanie: { code: 'zima_grzanie', label: 'zima', sell_from: '09-15', sell_to: '01-31' }, // wrap
  swieta_bn: { code: 'swieta_bn', label: 'święta', sell_from: '10-15', sell_to: '12-18' },
  ogrod_wiosna: { code: 'ogrod_wiosna', label: 'ogród', sell_from: '03-01', sell_to: '09-30' },
  grill: { code: 'grill', label: 'grill', sell_from: '03-15', sell_to: '09-30' },
  back_to_school: { code: 'back_to_school', label: 'szkoła', sell_from: '08-01', sell_to: '09-15' },
}

export const SEASON_CODES = Object.keys(SEASONS) as SeasonCode[]
// Kody sezonowe (bez all_year) — do promptów „wybierz kod LUB all_year".
export const SEASONAL_CODES = SEASON_CODES.filter((c) => c !== 'all_year')

// Walidacja kodu przeciw enumowi. Zwraca kod albo null (nieznany/pusty).
export function normSeasonCode(code: unknown): SeasonCode | null {
  const c = String(code ?? '').trim().toLowerCase()
  return Object.prototype.hasOwnProperty.call(SEASONS, c) ? (c as SeasonCode) : null
}

// Kod → kolumny bazy (season_type/label/sell_from/sell_to). Nieznany kod → all_year.
export function seasonFields(
  code: unknown,
): { season_type: string; season_label: string; sell_from: string | null; sell_to: string | null } {
  const c = normSeasonCode(code) || 'all_year'
  const d = SEASONS[c]
  return {
    season_type: c === 'all_year' ? 'all_year' : 'seasonal',
    season_label: d.label,
    sell_from: d.sell_from,
    sell_to: d.sell_to,
  }
}

// Odwrotność: label z bazy (PL) → kod. Do bud-season-verify/calendar (mają label, nie kod).
export function codeFromLabel(label: unknown): SeasonCode | null {
  const l = String(label ?? '').trim().toLowerCase()
  if (!l) return null
  for (const c of SEASON_CODES) if (SEASONS[c].label.toLowerCase() === l) return c
  return null
}

// ── PRIORYTET ŹRÓDEŁ: data > manual > rule > llm2 > draft ──
// Wyższy = mocniejszy. Nieznane/puste = 0 (stare wiersze bez source → nadpisywalne).
const PRIORITY: Record<string, number> = { draft: 1, llm2: 2, rule: 3, manual: 4, data: 5 }
export function seasonRank(source: string | null | undefined): number {
  return PRIORITY[String(source || '').toLowerCase()] ?? 0
}

// Czy wolno nadpisać istniejące oznaczenie źródłem `incomingSource`?
// Reguła: incoming ≥ current (równy priorytet = odświeżenie dozwolone; niższy = korekta chroniona).
// Re-skan draftem NIE zdepcze rule/manual/data.
export function applySeason(
  current: { season_source?: string | null } | null | undefined,
  incomingSource: string,
): boolean {
  return seasonRank(incomingSource) >= seasonRank(current?.season_source)
}

// ── SŁOWNIK WYMUSZEŃ (reguły twarde z SSOT) ──
// pl_name (PL, z odmianami) → kod. Reguła WYGRYWA z draftem GPT (source='rule', verified=true).
// Regexy case-insensitive, stemy łapią polskie odmiany (choink → choinka/choinki/choinkowy).
// Kolejność = pierwsze trafienie wygrywa.
const SEASON_RULES: Array<{ code: SeasonCode; re: RegExp }> = [
  // basen/wentylator/chłodzenie/plaża → lato (+ EN fan/pool/cooler dla nietkniętych nazw)
  { code: 'lato', re: /(basen|kąpielow|kapielow|wentylator|wiatrak|chłodz|chlodz|klimatyz|plaż|plaz|\bfan\b|\bpool\b|\bcooler\b)/i },
  // ogrzewacz/koc USB/sanki/termofor → zima_grzanie
  { code: 'zima_grzanie', re: /(ogrzewacz|ogrzewa|podgrzewa|grzałk|grzalk|grzejnik|termofor|koc\W{0,6}usb|usb\W{0,6}koc|sanki|sanek)/i },
  // choinka/bombka/mikołaj-dekor → swieta_bn
  { code: 'swieta_bn', re: /(choink|bombk|mikołaj|mikolaj|adwent)/i },
  // grill/ruszt → grill
  { code: 'grill', re: /(\bgrill|ruszt)/i },
]

// pl_name → wymuszony kod sezonu (albo null gdy brak reguły). Motyw wizualny sam NIE liczy się —
// to twarde wyjątki popytowe z SSOT, nie klasyfikacja tematów.
export function seasonRule(plName: unknown): SeasonCode | null {
  const s = String(plName ?? '')
  if (!s.trim()) return null
  for (const r of SEASON_RULES) if (r.re.test(s)) return r.code
  return null
}

// ── OKNO / KALENDARZ ──
// Produkt w oknie sprzedażowym? from/to='MM-DD', today='MM-DD'. Brak okna (all_year) → true.
// Granice INCLUSIVE, wrap-around (from>to, np. zima 09-15→01-31). Identyczna semantyka jak
// 4 kopie inWindow() (featured/export/trendy/products).
export function inWindow(
  from: string | null | undefined,
  to: string | null | undefined,
  today: string,
): boolean {
  if (!from || !to) return true
  if (from <= to) return today >= from && today <= to
  return today >= from || today <= to
}

// Liczba dni do NAJBLIŻSZEGO wystąpienia daty 'MM-DD' względem `now` (UTC). 0 = dziś.
// Jeśli data już minęła w tym roku → liczy do przyszłego roku (0..~366). Do kalendarza granic.
export function daysUntilMMDD(mmdd: string, now: Date): number | null {
  const m = String(mmdd || '').match(/^(\d{2})-(\d{2})$/)
  if (!m) return null
  const mm = Number(m[1]), dd = Number(m[2])
  const today0 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  let target = Date.UTC(now.getUTCFullYear(), mm - 1, dd)
  if (target < today0) target = Date.UTC(now.getUTCFullYear() + 1, mm - 1, dd)
  return Math.round((target - today0) / 86_400_000)
}

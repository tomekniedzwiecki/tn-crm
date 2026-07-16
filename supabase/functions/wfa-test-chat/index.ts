// wfa-test-chat — „SPOWIEDNIK TESTÓW" modułu Testy klienta (koncept: docs/stworze/MODUL-TESTY-KLIENTA.md)
// Klient-operator w SWOIM portalu rozmawia z AI o uwagach do aplikacji, dokleja zrzuty ekranu
// (vision), a AI składa z rozmowy USTRUKTURYZOWANE zgłoszenia (wfa_test_issues).
//
// Gate = token + hasło portalu klienta (dokładnie jak wfa-portal). Podgląd admina (?preview + team JWT)
// = READ-ONLY: message/upload/end zwracają 403.
//
// Akcje: history | message | upload_init | upload_done | end.
// Model OpenAI (vision-capable + function-calling przez MARKERY — wzór spar-chat, tanio, 1 completion):
//   AI emituje <zgloszenie>{...}</zgloszenie> gdy temat wyczerpany → INSERT wfa_test_issues.
// Kill-switch: settings.wfa_test_chat_enabled (FAIL-OPEN). Rate-limit per projekt. Koszty → logi edge.
//
// Deploy: npx supabase functions deploy wfa-test-chat --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws

import { createClient } from "jsr:@supabase/supabase-js@2";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";
import { signPaths, verifyTeamMember } from "../_shared/admin-files.ts";
import { throttleClear, throttleFail, throttleGate } from "../_shared/portal-throttle.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BUCKET = "wfa-test-shots";
const STEP_KEY = "testy_klienta";
const REPAIR_STEP_KEY = "poprawki_demo";
const MODEL = Deno.env.get("WFA_TEST_OPENAI_MODEL") || "gpt-4o"; // vision + tools; jest w cenniku spar
const MAX_MSG_LEN = 2000;
const MAX_SHOT_BYTES = 15 * 1024 * 1024; // 15 MB / zrzut
const SHOT_EXT = ["png", "jpg", "jpeg", "webp"];
const MAX_USER_MSGS_PER_HOUR = 40; // rate-limit per projekt (anty-abuse/koszty)
const MAX_ATTACH_PER_MSG = 4;
const HISTORY_TURNS = 24; // ile ostatnich wiadomości bierzemy do kontekstu modelu

// Cennik USD/1M tokenów (log kosztu do edge logs; brak dedykowanej tabeli ai_usage w wfa — patrz raport)
const PRICES: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-5.1": { input: 1.25, output: 10 },
};

function json(body: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json", ...(extraHeaders || {}) } });
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Podgląd admina „oczami klienta" (gate JWT team_members) → wspólny helper
// _shared/admin-files.ts (verifyTeamMember), używany też przez wfa-portal.

// Kill-switch FAIL-OPEN: gramy DALEJ przy każdym błędzie/braku klucza; ubijamy TYLKO gdy jawnie false.
async function isKilled(sb: ReturnType<typeof createClient>): Promise<boolean> {
  try {
    const { data } = await sb.from("settings").select("value").eq("key", "wfa_test_chat_enabled").maybeSingle();
    if (!data) return false;
    const v = String(data.value ?? "").trim().toLowerCase();
    return v === "false" || v === "0" || v === "off" || v === "no";
  } catch {
    return false; // fail-open
  }
}

// Mapowanie zgłoszenia na widok klienta (portal) — z oznaczeniem rundy.
function clientIssue(i: Record<string, unknown>) {
  return {
    seq: i.seq, title: i.title, status: i.status, status_pl: statusPl(String(i.status)),
    comment: i.tomek_comment || null, round_no: (i.round_no as number) || 1,
    done_at: i.done_at || null, decided_at: i.decided_at || null,
    // TYLKO potrzebna flaga (nie cały obiekt — nie wyciekamy wewnętrznych znaczników jak ai_pushback).
    poza_v1: !!(i.flags && typeof i.flags === "object" && (i.flags as Record<string, unknown>).poza_v1),
  };
}

function statusPl(s: string): string {
  return s === "new" ? "Nowe"
    : s === "approved" ? "Przyjęte do poprawki"
    : s === "rejected" ? "Poza zakresem"
    : s === "in_progress" ? "W realizacji"
    : s === "done" ? "Poprawione"
    : s;
}

// Krok testów aktywny? (in_progress lub done → karta widoczna w portalu)
async function testStepStatus(sb: ReturnType<typeof createClient>, projectId: string): Promise<string | null> {
  const { data } = await sb.from("wfa_steps").select("status").eq("project_id", projectId).eq("step_key", STEP_KEY).maybeSingle();
  return data ? String(data.status) : null;
}

async function getOrCreateSession(sb: ReturnType<typeof createClient>, projectId: string, create: boolean): Promise<{ id: string; status: string } | null> {
  const { data: existing } = await sb.from("wfa_test_sessions").select("id, status")
    .eq("project_id", projectId).eq("status", "open").order("last_activity_at", { ascending: false }).limit(1).maybeSingle();
  if (existing) return existing as { id: string; status: string };
  if (!create) return null;
  const { data: created, error } = await sb.from("wfa_test_sessions").insert({ project_id: projectId }).select("id, status").single();
  if (error) { console.error("[wfa-test-chat] session create:", error); return null; }
  return created as { id: string; status: string };
}

async function loadIssues(sb: ReturnType<typeof createClient>, projectId: string) {
  const { data } = await sb.from("wfa_test_issues")
    .select("seq, title, status, severity, tomek_comment, screenshots, round_no, decided_at, done_at, flags")
    .eq("project_id", projectId).order("seq", { ascending: true });
  return (data || []) as Array<Record<string, unknown>>;
}

// Serie poprawek (rundy): upewnij się, że wiersz rundy istnieje (idempotentnie).
// round_no NIGDY nie pochodzi z body klienta — tylko z wfa_projects.test_round.
async function ensureRound(sb: ReturnType<typeof createClient>, projectId: string, roundNo: number): Promise<void> {
  await sb.from("wfa_test_rounds").upsert(
    { project_id: projectId, round_no: roundNo },
    { onConflict: "project_id,round_no", ignoreDuplicates: true },
  );
}

// Podpisz ścieżki zrzutów (1h) do renderu miniatur / vision — wspólny helper signPaths
// (_shared/admin-files.ts), związany na stałe z prywatnym bucketem BUCKET.
function sign(sb: ReturnType<typeof createClient>, paths: string[]): Promise<Record<string, string>> {
  return signPaths(sb, BUCKET, paths);
}

const pathsOf = (att: unknown): string[] =>
  Array.isArray(att) ? att.map((a) => (typeof a === "string" ? a : (a && (a as any).path))).filter(Boolean) : [];

// ── System prompt ─────────────────────────────────────────────────────────────
// Tryb per projekt (wfa_projects.test_mode): 'testy' = spowiednik testów PRZED startem
// (bug reporting); 'feedback' = zbieranie propozycji rozwoju i problemów od operatora
// DZIAŁAJĄCEJ aplikacji. Tryb zmienia WYŁĄCZNIE ten prompt — marker <zgloszenie>, parser,
// INSERT, walidacja severity, panel, statusy i zrzuty są WSPÓLNE (zero zmian struktur).
type TestMode = "testy" | "feedback";

// ── „Mózg" spowiednika: KONSTRUKTYWNY SCEPTYCYZM (decyzja Tomka 15.07) ─────────
// AI nie może być łatwowierne — klient potrafi przekombinować albo poprosić o rzecz
// sprzeczną ze świadomą decyzją projektu. Z dobrymi argumentami AI podważa uwagi bez
// sensu (MAX 1 runda kontry), ale gdy klient podtrzymuje — ZAPISUJE z flags.ai_pushback.
// Decyzja ZAWSZE = Tomek; AI nigdy nie „odrzuca". Wspólny blok dla OBU trybów.
const SCEPTYK = `KONSTRUKTYWNY SCEPTYCYZM (to Twój charakter — NIE jesteś potakiwaczem):
Nie zapisujesz wszystkiego jak leci. Klient czasem przekombinuje albo prosi o rzecz, która skomplikuje aplikację jemu samemu lub jego użytkownikom, kłóci się ze świadomą decyzją projektu albo wykracza poza obecną wersję. Twoja wartość = mądry filtr, który myśli o całości aplikacji. ALE decyzję ZAWSZE podejmuje zespół (Tomek) — NIGDY Ty. Nie mów „odrzucam", „nie zrobimy tego", „to zły pomysł". Gdy masz zastrzeżenie, mów po ludzku: „Zapiszę to z moją uwagą — ostateczną decyzję podejmie zespół."

BŁĄD (coś nie działa / psuje się / wygląda źle) = BEZ DYSKUSJI. Błąd to błąd — nie podważaj go NIGDY. Podziękuj, dopytaj o szczegóły i zapisz.

POMYSŁ / PROŚBA O ZMIANĘ = najpierw ZROZUM, potem SKONFRONTUJ (maksymalnie JEDNA runda kontry na dany temat):
1) Zrozum intencję — dopytaj krótko po co to klientowi i jaki problem to rozwiązuje (o ile sam nie powiedział).
2) Zestaw to z tym, co wiesz o aplikacji (sekcja „O APLIKACJI" wyżej — są tam świadome decyzje z uzasadnieniem, granica wersji 1, rzeczy CELOWO pominięte i plan rozwoju). Jeśli propozycja:
   (a) KŁÓCI SIĘ ZE ŚWIADOMĄ DECYZJĄ projektu → wyjaśnij po ludzku, DLACZEGO tak zdecydowano (podaj konkretny powód z kontekstu) i zapytaj, czy to zmienia jego spojrzenie.
   (b) WYKRACZA POZA ZAKRES WERSJI 1 → powiedz WPROST, że to już rozwój aplikacji (NIE część obecnej wersji; NIGDY nie mów „w cenie" / „za darmo") i że zapiszesz to jako propozycję rozwoju do rozważenia. W markerze ustaw poza_v1: true.
   (c) JEST PRZEKOMBINOWANA — komplikuje korzystanie innym użytkownikom, dotyczy skrajnego przypadku (rzadszego niż 1 na 100), albo DUBLUJE coś, co już jest → skontruj JEDNYM konkretnym argumentem i zaproponuj prostszą drogę do tego samego celu.
   (d) JEST JUŻ W PLANIE ROZWOJU → powiedz po prostu, że to już zaplanowane.
3) Jeśli po Twoim argumencie klient PODTRZYMUJE zdanie → KONIEC dyskusji. Zapisz zgłoszenie i wypełnij pole ai_pushback (zwięźle: Twój argument + odpowiedź klienta). Nie męcz, nie wracaj do tematu, nie kontruj drugi raz.

Sensowny, prosty pomysł mieszczący się w wersji 1 → po prostu przyjmij i zapisz, BEZ sztucznej kontry. Nie szukaj dziury w całym na siłę — sceptycyzm ma chronić klienta, a nie utrudniać mu życie.

BEZ ŻARGONU: mów „zakres wersji 1", „plan rozwoju", „na później". Nie używaj obcych słów typu scope/backlog/ROAS/CPM.`;

// Rozszerzenie schematu markera o pola „mózgu" (wspólne dla obu trybów).
const MARKER_BRAIN_FIELDS = `- ai_pushback: wypełnij TYLKO gdy PODWAŻYŁEŚ ten pomysł, a klient mimo to go PODTRZYMAŁ — zwięźle po polsku: Twój argument + odpowiedź klienta (np. „Sugerowałem prostszy filtr zamiast osobnego ekranu; klient chce osobny ekran, bo obsługuje 300 klientów dziennie"). Dla BŁĘDÓW i pomysłów przyjętych bez kontry: null.
- poza_v1: true, jeśli propozycja wykracza poza zakres wersji 1 (rozwój aplikacji); w innym wypadku false.`;

function buildSystemPrompt(appName: string, testContext: string, issues: Array<Record<string, unknown>>, mode: TestMode = "testy"): string {
  const titles = issues.length
    ? issues.map((i) => `  - [TK-${i.seq}] ${i.title}`).join("\n")
    : "  (brak — to pierwsze zgłoszenia)";
  const app = appName || "Twoja aplikacja";
  const ctx = (testContext || "").trim() || "(brak szczegółowego opisu — dopytuj klienta o ekran/moduł, którego dotyczy uwaga)";

  if (mode === "feedback") {
    return `Jesteś życzliwym, konkretnym asystentem, który ZBIERA PROPOZYCJE ROZWOJU I PROBLEMY od operatora DZIAŁAJĄCEJ aplikacji „${app}". Aplikacja już żyje i jest używana na co dzień — nie testujemy wersji roboczej, tylko rozwijamy produkt. Rozmawiasz jak dobry opiekun produktu: operator swobodnie MÓWI, co chciałby usprawnić i co go uwiera w codziennej pracy, a Ty układasz z tego porządek. Operator NIGDY nie wypełnia formularza — strukturę tworzysz Ty.

O APLIKACJI (kontekst — znasz ją, więc nie pytaj o rzeczy oczywiste):
${ctx}

JAK ROZMAWIASZ:
- Ciepło, po ludzku, krótko (1–4 zdania). Zero żargonu technicznego.
- Zachęcaj: „Powiedz mi o wszystkim, co chciałbyś usprawnić albo co Ci przeszkadza w codziennej pracy — nawet drobiazgi. Zrzut ekranu bardzo pomaga."
- Rozróżniaj dwie rzeczy: POMYSŁ (propozycja rozwoju — coś nowego / usprawnienie) oraz PROBLEM (coś nie działa jak trzeba albo przeszkadza w pracy). Dla każdej uwagi ustal, o którą kategorię chodzi.
- Dla KAŻDEJ uwagi dopytaj naturalnie (o ile operator sam nie podał): 1) GDZIE (ekran/moduł), 2) JAK to teraz wygląda i CO konkretnie chciałby zmienić / co zawodzi, 3) PO CO — jaką korzyść albo jaki kłopot to rozwiązuje w jego pracy, 4) URZĄDZENIE (telefon czy komputer). Po jednym–dwa pytania naraz, nie jak z formularza.
- Gdy operator dokleił ZRZUT EKRANU — obejrzyj go i ODNIEŚ SIĘ do tego, co na nim widać.
- NIGDY nie obiecuj wdrożenia ani terminu. Mów: „Przekażę to do przeglądu" / „Zapiszę i zespół to rozważy". Decyzja, co i kiedy trafi do rozwoju, należy do zespołu — nie do Ciebie.
- Nie zdradzasz wewnętrznych szczegółów technicznych ani sekretów. Znasz tylko to, co wyżej + rozmowę.

${SCEPTYK}

SKŁADANIE ZGŁOSZENIA (najważniejsze):
Gdy masz dość informacji o danej uwadze (temat wyczerpany, ew. po jednej rundzie kontry), ZAPISZ ją, emitując w SWOJEJ odpowiedzi ukryty marker (operator go nie widzi — system go wycina i sam dopisze potwierdzenie z numerem):
<zgloszenie>{"title":"…","description":"…","area":"…","device":"mobile|desktop|null","severity":"krytyczne|istotne|kosmetyka","quote":"…","dodaj_do":null,"ai_pushback":null,"poza_v1":false}</zgloszenie>
- title: krótki, po polsku, konkretny; zacznij od kategorii w nawiasie — „[Pomysł] …" albo „[Problem] …" (np. „[Pomysł] Eksport listy klientów do CSV").
- description: złóż w całość STAN OBECNY / PROPONOWANĄ ZMIANĘ lub OBJAW / KORZYŚĆ lub KŁOPOT — 2–5 zdań, tak by zespół wiedział, co i po co zrobić.
- area: ekran/moduł którego dotyczy (np. „Panel operatora → Rabaty"); null jeśli naprawdę nieznany.
- device: mobile / desktop / null.
- severity: użyj JAKO KATEGORII (mapowanie na wspólne pole): POMYSŁ / propozycja rozwoju → "kosmetyka"; PROBLEM który przeszkadza → "istotne"; PROBLEM który blokuje pracę operatora → "krytyczne".
- quote: DOSŁOWNY, najbardziej treściwy cytat operatora (zachowaj jego język!).
- dodaj_do: jeśli to TA SAMA rzecz co istniejące zgłoszenie z listy poniżej — wstaw jego numer seq (samą liczbę), a w description dopisz nowy szczegół; system dołączy notatkę zamiast dublować. W innym razie null.
${MARKER_BRAIN_FIELDS}
- Możesz w jednej odpowiedzi zapisać KILKA zgłoszeń (kilka markerów), jeśli operator wymienił kilka niezależnych rzeczy.
- Po markerze pisz DALEJ naturalnie: potwierdź krótko po ludzku (bez podawania numeru — system go dopisze) i zapytaj „Co jeszcze chciałbyś usprawnić?".
- NIE zapisuj zgłoszenia przedwcześnie — najpierw dopytaj, chyba że operator od razu podał komplet.

ISTNIEJĄCE ZGŁOSZENIA TEGO PROJEKTU (do deduplikacji — nie twórz duplikatów, użyj dodaj_do):
${titles}`;
  }

  return `Jesteś życzliwym, konkretnym asystentem, który PRZYJMUJE UWAGI klienta do jego aplikacji „${app}" po testach. Rozmawiasz jak dobry, cierpliwy tester-recepcjonista: klient MÓWI swobodnie co mu nie gra, a Ty układasz z tego porządek. Klient NIGDY nie wypełnia formularza — strukturę tworzysz Ty.

O APLIKACJI (kontekst — znasz ją, więc nie pytaj o rzeczy oczywiste):
${ctx}

JAK ROZMAWIASZ:
- Ciepło, po ludzku, krótko (1–4 zdania). Zero żargonu technicznego wobec klienta.
- Zachęcaj: „Powiedz mi o wszystkim, co Ci nie gra — nawet drobiazgi. Zrzut ekranu bardzo pomaga."
- Dla KAŻDEJ uwagi dopytaj (o ile klient sam nie podał): 1) GDZIE to się dzieje (ekran/moduł), 2) KROKI — co klikał po kolei, 3) CZEGO OCZEKIWAŁ, 4) CO ZOBACZYŁ zamiast tego, 5) URZĄDZENIE (telefon czy komputer). Nie odpytuj jak z formularza — wplataj pytania naturalnie, po jednym–dwa naraz.
- Gdy klient dokleił ZRZUT EKRANU — obejrzyj go i ODNIEŚ SIĘ do tego, co na nim widać (to buduje zaufanie: „Widzę na zrzucie, że przycisk zachodzi na tekst…").
- NIGDY nie obiecuj wdrożenia ani terminu. Mów: „Przekażę to do przeglądu" / „Zapiszę i zespół to rozważy". Decyzja, co trafi do poprawek, należy do zespołu — nie do Ciebie.
- Nie zdradzasz wewnętrznych szczegółów technicznych ani sekretów. Znasz tylko to, co wyżej + rozmowę.

${SCEPTYK}

SKŁADANIE ZGŁOSZENIA (najważniejsze):
Gdy masz dość informacji o danej uwadze (temat wyczerpany, ew. po jednej rundzie kontry), ZAPISZ ją, emitując w SWOJEJ odpowiedzi ukryty marker (klient go nie widzi — system go wycina i sam dopisze potwierdzenie z numerem):
<zgloszenie>{"title":"…","description":"…","area":"…","device":"mobile|desktop|null","severity":"krytyczne|istotne|kosmetyka","quote":"…","dodaj_do":null,"ai_pushback":null,"poza_v1":false}</zgloszenie>
- title: krótki, po polsku, konkretny (np. „Nie działa zapis notatki na telefonie").
- description: złóż w całość KROKI / CZEGO OCZEKIWAŁ / CO ZOBACZYŁ — 2–5 zdań, tak by wykonawca wiedział co naprawić.
- area: ekran/moduł którego dotyczy (np. „Panel operatora → Rabaty"); null jeśli naprawdę nieznany.
- device: mobile / desktop / null.
- severity: TWOJA sugestia (krytyczne = blokuje pracę; istotne = przeszkadza; kosmetyka = drobiazg wizualny).
- quote: DOSŁOWNY, najbardziej treściwy cytat klienta (zachowaj jego język!).
- dodaj_do: jeśli to TA SAMA rzecz co istniejące zgłoszenie z listy poniżej — wstaw jego numer seq (samą liczbę), a w description dopisz nowy szczegół; system dołączy notatkę zamiast dublować. W innym razie null.
${MARKER_BRAIN_FIELDS}
- Możesz w jednej odpowiedzi zapisać KILKA zgłoszeń (kilka markerów), jeśli klient wymienił kilka niezależnych rzeczy.
- Po markerze pisz DALEJ naturalnie: potwierdź krótko po ludzku (bez podawania numeru — system go dopisze) i zapytaj „Co jeszcze zauważyłeś?".
- NIE zapisuj zgłoszenia przedwcześnie — najpierw dopytaj, chyba że klient od razu podał komplet.

ISTNIEJĄCE ZGŁOSZENIA TEGO PROJEKTU (do deduplikacji — nie twórz duplikatów, użyj dodaj_do):
${titles}`;
}

// Marker <zgloszenie>{...}</zgloszenie> — wytnij z tekstu, zwróć listę + oczyszczony tekst.
function parseIssues(text: string): { clean: string; issues: Array<Record<string, unknown>> } {
  const issues: Array<Record<string, unknown>> = [];
  const clean = text.replace(/<zgloszenie>([\s\S]*?)<\/zgloszenie>/g, (_m, inner) => {
    try {
      const o = JSON.parse(String(inner).trim());
      if (o && typeof o === "object" && typeof o.title === "string" && o.title.trim()) issues.push(o);
    } catch (e) { console.error("[wfa-test-chat] marker parse:", e, String(inner).slice(0, 200)); }
    return "";
  }).replace(/\n{3,}/g, "\n\n").trim();
  return { clean, issues };
}

const SEV_OK = new Set(["krytyczne", "istotne", "kosmetyka"]);
const DEV_OK = new Set(["mobile", "desktop"]);

// Wstaw zgłoszenie z seq per projekt (UNIQUE project_id,seq → retry przy wyścigu).
async function insertIssue(
  sb: ReturnType<typeof createClient>,
  projectId: string,
  sessionId: string,
  raw: Record<string, unknown>,
  shots: string[],
  roundNo: number,
): Promise<{ seq: number; title: string } | null> {
  const title = String(raw.title || "").slice(0, 200).trim();
  if (!title) return null;
  const desc = String(raw.description || "").slice(0, 4000);
  const area = raw.area ? String(raw.area).slice(0, 200) : null;
  const device = DEV_OK.has(String(raw.device)) ? String(raw.device) : null;
  const severity = SEV_OK.has(String(raw.severity)) ? String(raw.severity) : "istotne";
  const quote = raw.quote ? String(raw.quote).slice(0, 1000) : null;

  // „Mózg" spowiednika: flags = adnotacje sceptyka. ai_pushback = argument AI + odpowiedź
  // klienta (gdy AI podważyło, a klient podtrzymał); poza_v1 = propozycja poza zakresem wersji 1.
  const flags: Record<string, unknown> = {};
  const pushback = raw.ai_pushback ? String(raw.ai_pushback).slice(0, 1500).trim() : "";
  if (pushback) flags.ai_pushback = pushback;
  if (raw.poza_v1 === true || String(raw.poza_v1).toLowerCase() === "true") flags.poza_v1 = true;

  // Dedup: dodaj_do = seq istniejącego → dopisz notatkę zamiast dublować.
  const addTo = Number(raw.dodaj_do);
  if (Number.isInteger(addTo) && addTo > 0) {
    const { data: ex } = await sb.from("wfa_test_issues").select("id, seq, title, description, screenshots, flags")
      .eq("project_id", projectId).eq("seq", addTo).maybeSingle();
    if (ex) {
      const prevShots = pathsOf((ex as any).screenshots);
      const merged = [...new Set([...prevShots, ...shots])].map((p) => ({ path: p }));
      const newDesc = String((ex as any).description || "") + (desc ? `\n\n[dopisane z rozmowy] ${desc}` : "");
      const mergedFlags = { ...((ex as any).flags && typeof (ex as any).flags === "object" ? (ex as any).flags : {}), ...flags };
      await sb.from("wfa_test_issues").update({ description: newDesc.slice(0, 4000), screenshots: merged, flags: mergedFlags }).eq("id", (ex as any).id);
      return { seq: (ex as any).seq, title: (ex as any).title };
    }
  }

  const shotsJson = shots.map((p) => ({ path: p }));
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data: mx } = await sb.from("wfa_test_issues").select("seq").eq("project_id", projectId).order("seq", { ascending: false }).limit(1).maybeSingle();
    const seq = ((mx as any)?.seq || 0) + 1;
    const { data, error } = await sb.from("wfa_test_issues").insert({
      project_id: projectId, session_id: sessionId, seq, title, description: desc,
      area, device, severity, quote, screenshots: shotsJson, status: "new", flags,
      round_no: roundNo, // SERIA POPRAWEK: runda z wfa_projects.test_round (serwer, nie body klienta)
    }).select("seq, title").single();
    if (!error && data) return { seq: (data as any).seq, title: (data as any).title };
    if (error && String(error.code) === "23505") { await sleep(40); continue; } // wyścig seq → retry
    console.error("[wfa-test-chat] insertIssue:", error); return null;
  }
  return null;
}

// Zbierz zrzuty jeszcze NIEprzypisane do żadnego zgłoszenia (z wiadomości usera tej sesji).
async function pendingShots(sb: ReturnType<typeof createClient>, projectId: string, sessionId: string): Promise<string[]> {
  const [{ data: iss }, { data: msgs }] = await Promise.all([
    sb.from("wfa_test_issues").select("screenshots").eq("project_id", projectId),
    sb.from("wfa_test_messages").select("attachments").eq("session_id", sessionId).eq("role", "user"),
  ]);
  const used = new Set<string>();
  (iss || []).forEach((i: any) => pathsOf(i.screenshots).forEach((p) => used.add(p)));
  const out: string[] = [];
  (msgs || []).forEach((m: any) => pathsOf(m.attachments).forEach((p) => { if (!used.has(p) && !out.includes(p)) out.push(p); }));
  return out;
}

function costUsd(model: string, inTok: number, outTok: number): number {
  const p = PRICES[model] || PRICES["gpt-4o"];
  return (inTok * p.input + outTok * p.output) / 1_000_000;
}

// Wywołanie OpenAI (non-streaming). currentImages = signed URLs zrzutów z bieżącej tury (vision).
async function callOpenAI(
  system: string,
  transcript: Array<{ role: string; content: string; images?: string[] }>,
  sessionLabel: string,
): Promise<{ text: string; inTok: number; outTok: number } | null> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) { console.error("[wfa-test-chat] brak OPENAI_API_KEY"); return null; }
  const messages: any[] = [{ role: "system", content: system }];
  for (const m of transcript) {
    if (m.role === "user" && m.images && m.images.length) {
      const parts: any[] = [];
      if (m.content) parts.push({ type: "text", text: m.content });
      m.images.forEach((u) => parts.push({ type: "image_url", image_url: { url: u } }));
      messages.push({ role: "user", content: parts });
    } else {
      messages.push({ role: m.role, content: m.content });
    }
  }
  const res = await openaiFetchRetry("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.5, max_tokens: 900 }),
  }, "wfa-test-chat");
  if (!res.ok) { console.error("[wfa-test-chat] OpenAI HTTP", res.status, (await res.text()).slice(0, 300)); return null; }
  const data = await res.json().catch(() => null) as any;
  const text = data?.choices?.[0]?.message?.content || "";
  const inTok = data?.usage?.prompt_tokens || 0;
  const outTok = data?.usage?.completion_tokens || 0;
  console.log(`[wfa-test-chat] ${sessionLabel} model=${MODEL} in=${inTok} out=${outTok} cost=$${costUsd(MODEL, inTok, outTok).toFixed(4)}`);
  return { text, inTok, outTok };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let raw: string;
  try { raw = await req.text(); } catch { return json({ error: "bad_request" }, 400); }
  if (raw.length > 200_000) return json({ error: "payload_too_large" }, 413); // dopuszczamy dłuższe body niż portal (transkrypt nie idzie w body, ale bezpiecznik)

  let body: {
    token?: string; password?: string; action?: string; preview?: boolean;
    message?: string; attachments?: string[]; filename?: string; size_bytes?: number; mime?: string; path?: string;
  };
  try { body = JSON.parse(raw); } catch { return json({ error: "bad_request" }, 400); }

  const token = (body.token || "").trim();
  const password = (body.password || "").trim();
  const preview = body.preview === true;
  const action = (body.action || "history").trim();
  if (!/^[0-9a-f]{32}$/i.test(token)) { await sleep(300); return json({ error: "unauthorized" }, 401); }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Podgląd admina: JWT zespołu zamiast hasła → READ-ONLY.
  let readonly = false;
  if (preview) {
    const member = await verifyTeamMember(req, sb);
    if (!member) { await sleep(300); return json({ error: "unauthorized" }, 401); }
    readonly = true;
  }

  const { data: p } = await sb.from("wfa_projects")
    .select("id, name, unique_token, client_password_hash, test_context, test_mode, test_round")
    .eq("unique_token", token).maybeSingle();
  if (!p) { await sleep(300); return json({ error: "unauthorized" }, 401); }

  const curRound = Number((p as any).test_round) || 1; // bieżąca (otwarta) runda serii poprawek

  // ============ TEST_ADMIN (panel Tomka): pełne zgłoszenia + signed URLs zrzutów ============
  // Gate = CZŁONEK ZESPOŁU (team JWT), NIE hasło klienta. Wiersze i tak czyta panel przez
  // supabaseClient (RLS team_members); ta akcja dokłada podpisane URL-e do prywatnego bucketa.
  if ((body.action || "").trim() === "test_admin") {
    const member = await verifyTeamMember(req, sb);
    if (!member) { await sleep(300); return json({ error: "unauthorized" }, 401); }
    await ensureRound(sb, String(p.id), curRound); // gwarancja wiersza bieżącej rundy
    const { data: iss } = await sb.from("wfa_test_issues")
      .select("id, seq, title, description, area, device, severity, quote, status, tomek_comment, screenshots, flags, round_no, created_at, decided_at, done_at")
      .eq("project_id", String(p.id)).order("seq", { ascending: true });
    const rows = (iss || []) as Array<Record<string, unknown>>;
    // Pełny transkrypt rozmowy (wszystkie sesje projektu) — panel pokazuje KONTEKST, nie tylko
    // wyekstrahowane zgłoszenia (jak spowiednik ze spar_messages). Zrzuty = signed URL (bucket private).
    const { data: msgRows } = await sb.from("wfa_test_messages")
      .select("role, content, attachments, created_at")
      .eq("project_id", String(p.id)).order("created_at", { ascending: true }).range(0, 1999);
    const { data: rounds } = await sb.from("wfa_test_rounds")
      .select("round_no, opened_at, closed_at, summary")
      .eq("project_id", String(p.id)).order("round_no", { ascending: true });
    const allPaths: string[] = [];
    rows.forEach((i) => pathsOf(i.screenshots).forEach((pp) => allPaths.push(pp)));
    (msgRows || []).forEach((m: any) => pathsOf(m.attachments).forEach((pp) => allPaths.push(pp)));
    const signed = await sign(sb, allPaths);
    return json({
      test_round: curRound,
      rounds: (rounds || []).map((r: any) => ({ round_no: r.round_no, opened_at: r.opened_at, closed_at: r.closed_at, summary: (r.summary && typeof r.summary === "object") ? r.summary : {} })),
      issues: rows.map((i) => ({
        id: i.id, seq: i.seq, title: i.title, description: i.description, area: i.area, device: i.device,
        severity: i.severity, quote: i.quote, status: i.status, tomek_comment: i.tomek_comment, created_at: i.created_at,
        round_no: i.round_no || 1,
        flags: (i.flags && typeof i.flags === "object") ? i.flags : {},
        shots: pathsOf(i.screenshots).map((pp) => ({ path: pp, url: signed[pp] || null })),
      })),
      messages: (msgRows || []).map((m: any) => ({
        role: m.role, content: m.content, created_at: m.created_at,
        attachments: pathsOf(m.attachments).map((pp) => ({ path: pp, url: signed[pp] || null })),
      })),
    });
  }

  // ============ CLOSE_ROUND (panel Tomka: „Zamknij serię poprawek") ============
  // Gate = CZŁONEK ZESPOŁU (team JWT). Zamyka bieżącą rundę (podsumowanie), inkrementuje
  // test_round i otwiera następną. Warunek: 0 zgłoszeń w statusie „new" (wszystko rozstrzygnięte).
  if ((body.action || "").trim() === "close_round") {
    const member = await verifyTeamMember(req, sb);
    if (!member) { await sleep(300); return json({ error: "unauthorized" }, 401); }
    const { data: rows } = await sb.from("wfa_test_issues")
      .select("status, flags").eq("project_id", String(p.id)).eq("round_no", curRound);
    const list = (rows || []) as Array<Record<string, unknown>>;
    if (!list.length) return json({ error: "empty_round", message: `Runda ${curRound} nie ma jeszcze żadnych zgłoszeń — nie ma czego zamykać.` }, 409);
    const newCount = list.filter((r) => String(r.status) === "new").length;
    if (newCount > 0) return json({ error: "unresolved", message: `W rundzie ${curRound} zostało ${newCount} nierozstrzygniętych zgłoszeń. Zatwierdź lub odrzuć wszystkie przed zamknięciem serii.` }, 409);
    const summary = {
      reported: list.length,
      fixed: list.filter((r) => String(r.status) === "done").length,
      rejected: list.filter((r) => String(r.status) === "rejected").length,
      in_progress: list.filter((r) => ["approved", "in_progress"].includes(String(r.status))).length,
      dev_v11: list.filter((r) => r.flags && typeof r.flags === "object" && (r.flags as any).poza_v1 === true).length,
    };
    await ensureRound(sb, String(p.id), curRound);
    await sb.from("wfa_test_rounds").update({ closed_at: new Date().toISOString(), summary })
      .eq("project_id", String(p.id)).eq("round_no", curRound);
    const next = curRound + 1;
    await sb.from("wfa_projects").update({ test_round: next }).eq("id", String(p.id));
    await ensureRound(sb, String(p.id), next);
    await sb.from("wfa_activities").insert({
      project_id: String(p.id), actor: "admin", action: "test_round_closed",
      description: `Zamknięto serię poprawek — Runda ${curRound} (zgłoszonych ${summary.reported}, naprawionych ${summary.fixed}, odrzuconych ${summary.rejected}, rozwój v1.1 ${summary.dev_v11}). Otwarta Runda ${next}.`.slice(0, 500),
    });
    return json({ ok: true, closed_round: curRound, test_round: next, summary });
  }

  // Ścieżka klienta: hasło portalu (SHA-256) obowiązkowe.
  if (!preview) {
    // SEC-D FAIL #2: throttling per-token (wspólny z wfa-portal). Zablokowany token -> 429.
    const gate = await throttleGate(sb, token);
    if (gate.locked) return json({ error: "too_many_attempts", retry_after: gate.retryAfter }, 429, { "Retry-After": String(gate.retryAfter) });
    if (!password || password.length > 200 || !p.client_password_hash) { await throttleFail(sb, token); await sleep(300); return json({ error: "unauthorized" }, 401); }
    const hash = await sha256Hex(password);
    if (hash !== String(p.client_password_hash).toLowerCase()) { await throttleFail(sb, token); await sleep(300); return json({ error: "unauthorized" }, 401); }
    throttleClear(sb, token).catch(() => {});
  }

  const projectId = String(p.id);
  const mode: TestMode = String(p.test_mode || "").trim() === "feedback" ? "feedback" : "testy";
  const roErr = () => json({ error: "podgląd — tylko odczyt" }, 403);

  // Krok testów musi być aktywny (in_progress/done) — inaczej karta w portalu ukryta.
  const stepStatus = await testStepStatus(sb, projectId);
  const active = stepStatus === "in_progress" || stepStatus === "done";

  // ============ HISTORY ============
  if (action === "history") {
    if (!active) return json({ active: false });
    const session = await getOrCreateSession(sb, projectId, !readonly); // podgląd nie tworzy sesji
    let messages: Array<Record<string, unknown>> = [];
    if (session) {
      const { data: msgs } = await sb.from("wfa_test_messages").select("role, content, attachments, created_at")
        .eq("session_id", session.id).order("created_at", { ascending: true }).range(0, 499);
      const allPaths: string[] = [];
      (msgs || []).forEach((m: any) => pathsOf(m.attachments).forEach((p) => allPaths.push(p)));
      const signed = await sign(sb, allPaths);
      messages = (msgs || []).map((m: any) => ({
        role: m.role, content: m.content, created_at: m.created_at,
        attachments: pathsOf(m.attachments).map((p) => ({ path: p, url: signed[p] || null })),
      }));
    }
    const issues = await loadIssues(sb, projectId);
    // Rundy (serie poprawek) z podsumowaniami — dla „Historii poprawek" po stronie klienta.
    const { data: roundRows } = await sb.from("wfa_test_rounds")
      .select("round_no, closed_at, summary")
      .eq("project_id", projectId).order("round_no", { ascending: true });
    // miniatury zgłoszeń dla klienta pomijamy (lista statusów wystarcza); pełny podgląd = panel Tomka.
    // Komunikat serii poprawek: po zamknięciu rundy N (test_round wzrósł) i zanim klient dorzuci
    // cokolwiek w nowej rundzie — zachęta do ponownego testu (human touch w portalu, NIE mail).
    let roundNotice: string | null = null;
    if (curRound > 1 && !issues.some((i) => (Number(i.round_no) || 1) === curRound)) {
      const { data: lastClosed } = await sb.from("wfa_test_rounds").select("round_no")
        .eq("project_id", projectId).not("closed_at", "is", null).order("round_no", { ascending: false }).limit(1).maybeSingle();
      const rn = (lastClosed as any)?.round_no || (curRound - 1);
      roundNotice = `Poprawki z rundy ${rn} są już gotowe — przetestuj aplikację jeszcze raz i daj mi znać, co jeszcze wymaga uwagi.`;
    }
    return json({
      active: true, readonly, session_id: session?.id || null,
      app_name: (p.name || "").trim() || "Twoja aplikacja",
      round: curRound, round_notice: roundNotice,
      messages,
      issues: issues.map(clientIssue),
      rounds: (roundRows || []).map((r: Record<string, unknown>) => ({
        round_no: r.round_no, closed_at: r.closed_at || null,
        summary: (r.summary && typeof r.summary === "object") ? r.summary : {},
      })),
    });
  }

  // ============ UPLOAD_INIT (zrzut ekranu) ============
  if (action === "upload_init") {
    if (readonly) return roErr();
    if (!active) return json({ error: "not_active" }, 409);
    const filename = String(body.filename || "").trim();
    const size = Number(body.size_bytes || 0);
    const ext = (filename.split(".").pop() || "").toLowerCase();
    if (!filename || !SHOT_EXT.includes(ext)) return json({ error: "bad_type", message: "Dozwolone są tylko obrazy (PNG/JPG/WEBP)." }, 400);
    if (!(size > 0) || size > MAX_SHOT_BYTES) return json({ error: "too_large", message: "Maksymalny rozmiar zrzutu to 15 MB." }, 400);
    const session = await getOrCreateSession(sb, projectId, true);
    if (!session) return json({ error: "session_failed" }, 500);
    const uid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const path = `${projectId}/${session.id}/${uid}.${ext}`;
    const { data: signed, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !signed) return json({ error: "sign_failed" }, 500);
    return json({ upload_url: (signed as any).signedUrl, token: (signed as any).token, path: (signed as any).path });
  }

  // ============ UPLOAD_DONE (potwierdzenie + podgląd miniatury) ============
  if (action === "upload_done") {
    if (readonly) return roErr();
    const path = String(body.path || "").trim();
    if (!path.startsWith(`${projectId}/`)) return json({ error: "bad_path" }, 400);
    const dir = path.slice(0, path.lastIndexOf("/"));
    const base = path.slice(path.lastIndexOf("/") + 1);
    const { data: listed } = await sb.storage.from(BUCKET).list(dir, { limit: 100, search: base });
    if (!(listed || []).some((o: any) => o.name === base)) return json({ error: "not_uploaded" }, 409);
    const signed = await sign(sb, [path]);
    return json({ ok: true, path, url: signed[path] || null });
  }

  // ============ MESSAGE (tura rozmowy) ============
  if (action === "message") {
    if (readonly) return roErr();
    if (!active) return json({ error: "not_active" }, 409);
    if (await isKilled(sb)) {
      return json({ soft: true, reply: "Ta rozmowa jest chwilowo wstrzymana. Spróbuj ponownie za chwilę — Twoje dotychczasowe zgłoszenia są zapisane." });
    }
    const userText = String(body.message || "").slice(0, MAX_MSG_LEN).trim();
    const attach = Array.isArray(body.attachments) ? body.attachments.filter((x) => typeof x === "string" && x.startsWith(`${projectId}/`)).slice(0, MAX_ATTACH_PER_MSG) : [];
    if (!userText && !attach.length) return json({ error: "empty" }, 400);

    // Rate-limit per projekt (wiadomości usera / godzinę).
    const sinceHour = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await sb.from("wfa_test_messages").select("id", { count: "exact", head: true })
      .eq("project_id", projectId).eq("role", "user").gte("created_at", sinceHour);
    if ((count || 0) >= MAX_USER_MSGS_PER_HOUR) {
      return json({ soft: true, reply: "Sporo już dziś zebraliśmy — zrób krótką przerwę i wróć za chwilę. Wszystko jest zapisane." });
    }

    const session = await getOrCreateSession(sb, projectId, true);
    if (!session) return json({ error: "session_failed" }, 500);

    // Zapis wiadomości usera (z załącznikami bieżącej tury).
    await sb.from("wfa_test_messages").insert({
      session_id: session.id, project_id: projectId, role: "user", content: userText,
      attachments: attach.map((path) => ({ path })),
    });

    // Kontekst modelu: ostatnie N wiadomości + system prompt z listą istniejących zgłoszeń.
    const { data: histRows } = await sb.from("wfa_test_messages").select("role, content, attachments, created_at")
      .eq("session_id", session.id).order("created_at", { ascending: false }).limit(HISTORY_TURNS);
    const hist = (histRows || []).reverse();
    // Vision: podpisujemy TYLKO zrzuty z bieżącej (ostatniej) tury usera — oszczędnie.
    const curSigned = attach.length ? await sign(sb, attach) : {};
    const transcript = hist.map((m: any, idx: number) => {
      const isLast = idx === hist.length - 1;
      const imgs = (m.role === "user" && isLast) ? pathsOf(m.attachments).map((p) => curSigned[p]).filter(Boolean) : [];
      const note = (m.role === "user" && pathsOf(m.attachments).length && !imgs.length) ? " [klient dołączył zrzut ekranu]" : "";
      return { role: m.role, content: (m.content || "") + note, images: imgs };
    });

    const issues = await loadIssues(sb, projectId);
    const system = buildSystemPrompt(String(p.name || ""), String(p.test_context || ""), issues, mode);
    const ai = await callOpenAI(system, transcript, `proj=${projectId.slice(0, 8)} mode=${mode}`);
    if (!ai) {
      return json({ soft: true, reply: "Coś mi się przycięło — spróbuj wysłać jeszcze raz za chwilę. Twoja wiadomość jest zapisana." });
    }

    // Parsuj markery zgłoszeń → INSERT (zrzuty z bieżącego wątku doklejone do PIERWSZEGO nowego).
    const { clean, issues: parsed } = parseIssues(ai.text);
    const created: Array<{ seq: number; title: string }> = [];
    if (parsed.length) {
      let shots = await pendingShots(sb, projectId, session.id);
      for (const iss of parsed) {
        const r = await insertIssue(sb, projectId, session.id, iss, shots, curRound);
        if (r) { created.push(r); shots = []; } // kolejne w tej turze bez ponownego doklejania
      }
    }

    // Widoczny tekst asystenta + zwięzłe potwierdzenie z numerem (system dopisuje — model numeru nie zna).
    let reply = clean;
    if (created.length) {
      const conf = created.map((c) => `✅ Zgłoszenie [TK-${c.seq}] zapisane: „${c.title}"`).join("\n");
      reply = (reply ? reply + "\n\n" : "") + conf;
    }
    if (!reply) reply = "Dziękuję — zanotowałem. Co jeszcze zwróciło Twoją uwagę?";

    await sb.from("wfa_test_messages").insert({ session_id: session.id, project_id: projectId, role: "assistant", content: reply });
    await sb.from("wfa_test_sessions").update({ last_activity_at: new Date().toISOString() }).eq("id", session.id);
    if (created.length) {
      await sb.from("wfa_activities").insert({ project_id: projectId, actor: "client", action: "test_issue",
        description: `Klient zgłosił w testach: ${created.map((c) => `[TK-${c.seq}] ${c.title}`).join("; ")}`.slice(0, 500) });
    }

    const allIssues = await loadIssues(sb, projectId);
    return json({
      reply,
      round: curRound,
      created: created.map((c) => ({ seq: c.seq, title: c.title })),
      issues: allIssues.map(clientIssue),
    });
  }

  // ============ END (klient „to wszystko" → sweep + podsumowanie, sesja closed) ============
  if (action === "end") {
    if (readonly) return roErr();
    if (!active) return json({ error: "not_active" }, 409);
    const session = await getOrCreateSession(sb, projectId, false);
    if (!session) return json({ ok: true, reply: "Dzięki! Jak coś jeszcze wypłynie — po prostu tu wróć.", issues: [] });

    let reply = "Dziękuję za testy! Wszystko przekazuję do przeglądu — statusy zobaczysz w liście „Twoje zgłoszenia”.";
    if (!(await isKilled(sb))) {
      const { data: histRows } = await sb.from("wfa_test_messages").select("role, content, attachments, created_at")
        .eq("session_id", session.id).order("created_at", { ascending: false }).limit(HISTORY_TURNS);
      const hist = (histRows || []).reverse().map((m: any) => ({
        role: m.role,
        content: (m.content || "") + (m.role === "user" && pathsOf(m.attachments).length ? " [klient dołączył zrzut ekranu]" : ""),
      }));
      const issues = await loadIssues(sb, projectId);
      const system = buildSystemPrompt(String(p.name || ""), String(p.test_context || ""), issues, mode)
        + "\n\nKONIEC ROZMOWY: klient powiedział, że to wszystko. ZRÓB SWEEP — jeśli w rozmowie została JAKAKOLWIEK uwaga jeszcze niezapisana jako zgłoszenie, zapisz ją TERAZ markerem <zgloszenie>. Następnie krótko, ciepło PODSUMUJ ile uwag zebraliśmy i podziękuj. Nie obiecuj wdrożenia.";
      const ai = await callOpenAI(system, hist, `end proj=${projectId.slice(0, 8)}`);
      if (ai) {
        const { clean, issues: parsed } = parseIssues(ai.text);
        if (parsed.length) {
          let shots = await pendingShots(sb, projectId, session.id);
          for (const iss of parsed) { const r = await insertIssue(sb, projectId, session.id, iss, shots, curRound); if (r) shots = []; }
        }
        if (clean) reply = clean;
      }
    }
    await sb.from("wfa_test_sessions").update({ status: "closed", last_activity_at: new Date().toISOString() }).eq("id", session.id);
    await sb.from("wfa_test_messages").insert({ session_id: session.id, project_id: projectId, role: "assistant", content: reply });
    const allIssues = await loadIssues(sb, projectId);
    return json({ ok: true, reply, round: curRound, issues: allIssues.map(clientIssue) });
  }

  return json({ error: "bad_action" }, 400);
});

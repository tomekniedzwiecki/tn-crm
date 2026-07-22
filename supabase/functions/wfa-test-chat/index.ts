// wfa-test-chat — „SPOWIEDNIK TESTÓW" modułu Testy klienta (koncept: docs/stworze/MODUL-TESTY-KLIENTA.md)
// Klient-operator w SWOIM portalu rozmawia z AI o uwagach do aplikacji, dokleja zrzuty ekranu
// (vision), a AI składa z rozmowy USTRUKTURYZOWANE zgłoszenia (wfa_test_issues).
//
// Gate = token + hasło portalu klienta (dokładnie jak wfa-portal). Podgląd admina (?preview + team JWT)
// = READ-ONLY: message/upload/end zwracają 403.
//
// Akcje: history | message | upload_init | upload_done | end (+ test_admin/close_round — gate team JWT).
// Model OpenAI (vision-capable + function-calling przez MARKERY — wzór spar-chat, tanio, 1 completion):
//   AI emituje <zgloszenie>{...}</zgloszenie> gdy temat wyczerpany → INSERT wfa_test_issues.
// Kill-switch: settings.wfa_test_chat_enabled (FAIL-OPEN). Rate-limit per projekt. Koszty → logi edge.
//
// Wspólny szkielet (CORS, gate hasła, throttle, kill-switch, transkrypt/vision, rate-limit, upload,
// zapis wiadomości) = _shared/portal-chat.ts (servePortalChat). Tu została WYŁĄCZNIE konfiguracja
// tej funkcji: prompt (2 tryby + sceptyk), marker <zgloszenie> multi, model sesji/rund, akcje admina.
// Zachowanie 1:1.
//
// Deploy: npx supabase functions deploy wfa-test-chat --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws

import { type Ctx, type PortalChatConfig, pathsOf, servePortalChat, sleep } from "../_shared/portal-chat.ts";
import { verifyTeamMember } from "../_shared/admin-files.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = any;

const BUCKET = "wfa-test-shots";
const STEP_KEY = "testy_klienta";
const MAX_MSG_LEN = 2000;
const MAX_SHOT_BYTES = 15 * 1024 * 1024; // 15 MB / zrzut
const SHOT_EXT = ["png", "jpg", "jpeg", "webp"];
const MAX_USER_MSGS_PER_HOUR = 40; // rate-limit per projekt (anty-abuse/koszty)
const MAX_ATTACH_PER_MSG = 4;
const HISTORY_TURNS = 24; // ile ostatnich wiadomości bierzemy do kontekstu modelu

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
async function testStepStatus(sb: SB, projectId: string): Promise<string | null> {
  const { data } = await sb.from("wfa_steps").select("status").eq("project_id", projectId).eq("step_key", STEP_KEY).maybeSingle();
  return data ? String(data.status) : null;
}

async function getOrCreateSession(sb: SB, projectId: string, create: boolean): Promise<{ id: string; status: string } | null> {
  const { data: existing } = await sb.from("wfa_test_sessions").select("id, status")
    .eq("project_id", projectId).eq("status", "open").order("last_activity_at", { ascending: false }).limit(1).maybeSingle();
  if (existing) return existing as { id: string; status: string };
  if (!create) return null;
  const { data: created, error } = await sb.from("wfa_test_sessions").insert({ project_id: projectId }).select("id, status").single();
  if (error) { console.error("[wfa-test-chat] session create:", error); return null; }
  return created as { id: string; status: string };
}

async function loadIssues(sb: SB, projectId: string) {
  const { data } = await sb.from("wfa_test_issues")
    .select("seq, title, status, severity, tomek_comment, screenshots, round_no, decided_at, done_at, flags")
    .eq("project_id", projectId).order("seq", { ascending: true });
  return (data || []) as Array<Record<string, unknown>>;
}

// Serie poprawek (rundy): upewnij się, że wiersz rundy istnieje (idempotentnie).
// round_no NIGDY nie pochodzi z body klienta — tylko z wfa_projects.test_round.
async function ensureRound(sb: SB, projectId: string, roundNo: number): Promise<void> {
  await sb.from("wfa_test_rounds").upsert(
    { project_id: projectId, round_no: roundNo },
    { onConflict: "project_id,round_no", ignoreDuplicates: true },
  );
}

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

function buildTestPrompt(appName: string, testContext: string, issues: Array<Record<string, unknown>>, mode: TestMode = "testy"): string {
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
  sb: SB,
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
      const prevShots = pathsOf((ex as Record<string, unknown>).screenshots);
      const merged = [...new Set([...prevShots, ...shots])].map((p) => ({ path: p }));
      const newDesc = String((ex as Record<string, unknown>).description || "") + (desc ? `\n\n[dopisane z rozmowy] ${desc}` : "");
      const mergedFlags = { ...((ex as Record<string, unknown>).flags && typeof (ex as Record<string, unknown>).flags === "object" ? (ex as Record<string, unknown>).flags : {}), ...flags };
      await sb.from("wfa_test_issues").update({ description: newDesc.slice(0, 4000), screenshots: merged, flags: mergedFlags }).eq("id", (ex as Record<string, unknown>).id);
      return { seq: (ex as Record<string, number>).seq, title: (ex as Record<string, string>).title };
    }
  }

  const shotsJson = shots.map((p) => ({ path: p }));
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data: mx } = await sb.from("wfa_test_issues").select("seq").eq("project_id", projectId).order("seq", { ascending: false }).limit(1).maybeSingle();
    const seq = ((mx as Record<string, number> | null)?.seq || 0) + 1;
    const { data, error } = await sb.from("wfa_test_issues").insert({
      project_id: projectId, session_id: sessionId, seq, title, description: desc,
      area, device, severity, quote, screenshots: shotsJson, status: "new", flags,
      round_no: roundNo, // SERIA POPRAWEK: runda z wfa_projects.test_round (serwer, nie body klienta)
    }).select("seq, title").single();
    if (!error && data) return { seq: (data as Record<string, number>).seq, title: (data as Record<string, string>).title };
    if (error && String(error.code) === "23505") { await sleep(40); continue; } // wyścig seq → retry
    console.error("[wfa-test-chat] insertIssue:", error); return null;
  }
  return null;
}

// Zbierz zrzuty jeszcze NIEprzypisane do żadnego zgłoszenia (z wiadomości usera tej sesji).
async function pendingShots(sb: SB, projectId: string, sessionId: string): Promise<string[]> {
  const [{ data: iss }, { data: msgs }] = await Promise.all([
    sb.from("wfa_test_issues").select("screenshots").eq("project_id", projectId),
    sb.from("wfa_test_messages").select("attachments").eq("session_id", sessionId).eq("role", "user"),
  ]);
  const used = new Set<string>();
  (iss || []).forEach((i: Record<string, unknown>) => pathsOf(i.screenshots).forEach((p) => used.add(p)));
  const out: string[] = [];
  (msgs || []).forEach((m: Record<string, unknown>) => pathsOf(m.attachments).forEach((p) => { if (!used.has(p) && !out.includes(p)) out.push(p); }));
  return out;
}

const CONFIG: PortalChatConfig = {
  label: "wfa-test-chat",
  loadProject: (sb, token) =>
    sb.from("wfa_projects")
      .select("id, name, unique_token, client_password_hash, test_context, test_mode, test_round")
      .eq("unique_token", token).maybeSingle().then((r: { data: unknown }) => r.data),
  bucket: BUCKET,
  maxBytes: MAX_SHOT_BYTES,
  exts: SHOT_EXT,
  tooLargeMessage: "Maksymalny rozmiar zrzutu to 15 MB.",
  imageField: "attachments",
  modelEnv: "WFA_TEST_OPENAI_MODEL",
  modelDefault: "gpt-4o",
  maxTokens: 900,
  temperature: 0.5,
  killSwitchKey: "wfa_test_chat_enabled",
  rateLimitPerHour: MAX_USER_MSGS_PER_HOUR,
  historyTurns: HISTORY_TURNS,
  messagesTable: "wfa_test_messages",
  maxMsgLen: MAX_MSG_LEN,
  maxAttachPerMsg: MAX_ATTACH_PER_MSG,
  killedReply: "Ta rozmowa jest chwilowo wstrzymana. Spróbuj ponownie za chwilę — Twoje dotychczasowe zgłoszenia są zapisane.",
  rateLimitReply: "Sporo już dziś zebraliśmy — zrób krótką przerwę i wróć za chwilę. Wszystko jest zapisane.",
  errorReply: "Coś mi się przycięło — spróbuj wysłać jeszcze raz za chwilę. Twoja wiadomość jest zapisana.",

  // Stan po gate: bieżąca runda serii poprawek, tryb promptu, aktywność kroku testów.
  loadState: async (ctx: Ctx) => {
    const curRound = Number(ctx.project.test_round) || 1; // bieżąca (otwarta) runda serii poprawek
    const mode: TestMode = String(ctx.project.test_mode || "").trim() === "feedback" ? "feedback" : "testy";
    const stepStatus = await testStepStatus(ctx.sb, ctx.projectId);
    const active = stepStatus === "in_progress" || stepStatus === "done";
    return { curRound, mode, active };
  },

  // Krok testów musi być aktywny (in_progress/done) — inaczej karta w portalu ukryta.
  guard: (ctx: Ctx) => Promise.resolve(ctx.state.active ? null : ctx.json({ error: "not_active" }, 409)),

  callLabel: (ctx: Ctx) => `proj=${ctx.projectId.slice(0, 8)} mode=${ctx.state.mode}`,

  // HISTORY: karta klienta (aktywność, sesja, zgłoszenia, rundy, komunikat serii poprawek).
  buildHistory: async (ctx: Ctx) => {
    const { sb, projectId, json } = ctx;
    const { active, curRound } = ctx.state;
    if (!active) return json({ active: false });
    const session = await getOrCreateSession(sb, projectId, !ctx.readonly); // podgląd nie tworzy sesji
    let messages: Array<Record<string, unknown>> = [];
    if (session) {
      messages = await ctx.loadSignedMessages("session_id", session.id, 499);
    }
    const issues = await loadIssues(sb, projectId);
    // Rundy (serie poprawek) z podsumowaniami — dla „Historii poprawek" po stronie klienta.
    const { data: roundRows } = await sb.from("wfa_test_rounds")
      .select("round_no, closed_at, summary")
      .eq("project_id", projectId).order("round_no", { ascending: true });
    // Komunikat serii poprawek: po zamknięciu rundy N (test_round wzrósł) i zanim klient dorzuci
    // cokolwiek w nowej rundzie — zachęta do ponownego testu (human touch w portalu, NIE mail).
    let roundNotice: string | null = null;
    if (curRound > 1 && !issues.some((i) => (Number(i.round_no) || 1) === curRound)) {
      const { data: lastClosed } = await sb.from("wfa_test_rounds").select("round_no")
        .eq("project_id", projectId).not("closed_at", "is", null).order("round_no", { ascending: false }).limit(1).maybeSingle();
      const rn = (lastClosed as Record<string, number> | null)?.round_no || (curRound - 1);
      roundNotice = `Poprawki z rundy ${rn} są już gotowe — przetestuj aplikację jeszcze raz i daj mi znać, co jeszcze wymaga uwagi.`;
    }
    return json({
      active: true, readonly: ctx.readonly, session_id: session?.id || null,
      app_name: (ctx.project.name || "").trim() || "Twoja aplikacja",
      round: curRound, round_notice: roundNotice,
      messages,
      issues: issues.map(clientIssue),
      rounds: (roundRows || []).map((r: Record<string, unknown>) => ({
        round_no: r.round_no, closed_at: r.closed_at || null,
        summary: (r.summary && typeof r.summary === "object") ? r.summary : {},
      })),
    });
  },

  // Zrzut ląduje pod ${projectId}/${session.id}/${uid}.${ext} — sesja tworzona z upem.
  buildUploadPath: async (ctx: Ctx, { uid, ext }: { uid: string; ext: string }) => {
    const session = await getOrCreateSession(ctx.sb, ctx.projectId, true);
    if (!session) return { error: ctx.json({ error: "session_failed" }, 500) };
    return { path: `${ctx.projectId}/${session.id}/${uid}.${ext}` };
  },

  // Scope wiadomości = sesja wfa_test_sessions.
  resolveScope: async (ctx: Ctx, { create }: { create: boolean }) => {
    const session = await getOrCreateSession(ctx.sb, ctx.projectId, create);
    if (!session) return { error: ctx.json({ error: "session_failed" }, 500) };
    return { session, scopeFields: { session_id: session.id }, historyFilter: ["session_id", session.id] as [string, string] };
  },

  // System prompt z listą istniejących zgłoszeń (do deduplikacji) + tryb per projekt.
  buildSystemPrompt: async (ctx: Ctx) => {
    const issues = await loadIssues(ctx.sb, ctx.projectId);
    return buildTestPrompt(String(ctx.project.name || ""), String(ctx.project.test_context || ""), issues, ctx.state.mode);
  },

  buildContextBlock: () => null, // plumbing na przyszłość — zero zmiany zachowania

  parseMarkers: (text: string) => {
    const { clean, issues } = parseIssues(text);
    return { clean, markers: issues };
  },

  // Ogon message: INSERT zgłoszeń (+dedup zrzutów), potwierdzenia z numerem, aktywność, odpowiedź.
  onMarkers: async (markers: Array<Record<string, unknown>>, ctx: Ctx) => {
    const { sb, projectId, json } = ctx;
    const { curRound } = ctx.state;
    const session = ctx.session;
    const parsed = markers;
    // Parsuj markery zgłoszeń → INSERT (zrzuty z bieżącego wątku doklejone do PIERWSZEGO nowego).
    const created: Array<{ seq: number; title: string }> = [];
    if (parsed.length) {
      let shots = await pendingShots(sb, projectId, session.id);
      for (const iss of parsed) {
        const r = await insertIssue(sb, projectId, session.id, iss, shots, curRound);
        if (r) { created.push(r); shots = []; } // kolejne w tej turze bez ponownego doklejania
      }
    }

    // Widoczny tekst asystenta + zwięzłe potwierdzenie z numerem (system dopisuje — model numeru nie zna).
    let reply = ctx.clean;
    if (created.length) {
      const conf = created.map((c) => `✅ Zgłoszenie [TK-${c.seq}] zapisane: „${c.title}"`).join("\n");
      reply = (reply ? reply + "\n\n" : "") + conf;
    }
    if (!reply) reply = "Dziękuję — zanotowałem. Co jeszcze zwróciło Twoją uwagę?";

    await ctx.insertAssistant(reply);
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
  },

  extraActions: {
    // ============ TEST_ADMIN (panel Tomka): pełne zgłoszenia + signed URLs zrzutów ============
    // Gate = CZŁONEK ZESPOŁU (team JWT), NIE hasło klienta. Wiersze i tak czyta panel przez
    // supabaseClient (RLS team_members); ta akcja dokłada podpisane URL-e do prywatnego bucketa.
    test_admin: {
      preAuth: true,
      run: async (ctx: Ctx) => {
        const { sb, project, projectId, json } = ctx;
        const member = await verifyTeamMember(ctx.req, sb);
        if (!member) { await sleep(300); return json({ error: "unauthorized" }, 401); }
        const curRound = Number(project.test_round) || 1;
        await ensureRound(sb, projectId, curRound); // gwarancja wiersza bieżącej rundy
        const { data: iss } = await sb.from("wfa_test_issues")
          .select("id, seq, title, description, area, device, severity, quote, status, tomek_comment, screenshots, flags, round_no, created_at, decided_at, done_at")
          .eq("project_id", projectId).order("seq", { ascending: true });
        const rows = (iss || []) as Array<Record<string, unknown>>;
        // Pełny transkrypt rozmowy (wszystkie sesje projektu) — panel pokazuje KONTEKST, nie tylko
        // wyekstrahowane zgłoszenia (jak spowiednik ze spar_messages). Zrzuty = signed URL (bucket private).
        const { data: msgRows } = await sb.from("wfa_test_messages")
          .select("role, content, attachments, created_at")
          .eq("project_id", projectId).order("created_at", { ascending: true }).range(0, 1999);
        const { data: rounds } = await sb.from("wfa_test_rounds")
          .select("round_no, opened_at, closed_at, summary")
          .eq("project_id", projectId).order("round_no", { ascending: true });
        const allPaths: string[] = [];
        rows.forEach((i) => pathsOf(i.screenshots).forEach((pp) => allPaths.push(pp)));
        (msgRows || []).forEach((m: Record<string, unknown>) => pathsOf(m.attachments).forEach((pp) => allPaths.push(pp)));
        const signed = await ctx.sign(allPaths);
        return json({
          test_round: curRound,
          rounds: (rounds || []).map((r: Record<string, unknown>) => ({ round_no: r.round_no, opened_at: r.opened_at, closed_at: r.closed_at, summary: (r.summary && typeof r.summary === "object") ? r.summary : {} })),
          issues: rows.map((i) => ({
            id: i.id, seq: i.seq, title: i.title, description: i.description, area: i.area, device: i.device,
            severity: i.severity, quote: i.quote, status: i.status, tomek_comment: i.tomek_comment, created_at: i.created_at,
            round_no: i.round_no || 1,
            flags: (i.flags && typeof i.flags === "object") ? i.flags : {},
            shots: pathsOf(i.screenshots).map((pp) => ({ path: pp, url: signed[pp] || null })),
          })),
          messages: (msgRows || []).map((m: Record<string, unknown>) => ({
            role: m.role, content: m.content, created_at: m.created_at,
            attachments: pathsOf(m.attachments).map((pp) => ({ path: pp, url: signed[pp] || null })),
          })),
        });
      },
    },

    // ============ CLOSE_ROUND (panel Tomka: „Zamknij serię poprawek") ============
    // Gate = CZŁONEK ZESPOŁU (team JWT). Zamyka bieżącą rundę (podsumowanie), inkrementuje
    // test_round i otwiera następną. Warunek: 0 zgłoszeń w statusie „new" (wszystko rozstrzygnięte).
    close_round: {
      preAuth: true,
      run: async (ctx: Ctx) => {
        const { sb, project, projectId, json } = ctx;
        const member = await verifyTeamMember(ctx.req, sb);
        if (!member) { await sleep(300); return json({ error: "unauthorized" }, 401); }
        const curRound = Number(project.test_round) || 1;
        const { data: rows } = await sb.from("wfa_test_issues")
          .select("status, flags").eq("project_id", projectId).eq("round_no", curRound);
        const list = (rows || []) as Array<Record<string, unknown>>;
        if (!list.length) return json({ error: "empty_round", message: `Runda ${curRound} nie ma jeszcze żadnych zgłoszeń — nie ma czego zamykać.` }, 409);
        const newCount = list.filter((r) => String(r.status) === "new").length;
        if (newCount > 0) return json({ error: "unresolved", message: `W rundzie ${curRound} zostało ${newCount} nierozstrzygniętych zgłoszeń. Zatwierdź lub odrzuć wszystkie przed zamknięciem serii.` }, 409);
        const summary = {
          reported: list.length,
          fixed: list.filter((r) => String(r.status) === "done").length,
          rejected: list.filter((r) => String(r.status) === "rejected").length,
          in_progress: list.filter((r) => ["approved", "in_progress"].includes(String(r.status))).length,
          dev_v11: list.filter((r) => r.flags && typeof r.flags === "object" && (r.flags as Record<string, unknown>).poza_v1 === true).length,
        };
        await ensureRound(sb, projectId, curRound);
        await sb.from("wfa_test_rounds").update({ closed_at: new Date().toISOString(), summary })
          .eq("project_id", projectId).eq("round_no", curRound);
        const next = curRound + 1;
        await sb.from("wfa_projects").update({ test_round: next }).eq("id", projectId);
        await ensureRound(sb, projectId, next);
        await sb.from("wfa_activities").insert({
          project_id: projectId, actor: "admin", action: "test_round_closed",
          description: `Zamknięto serię poprawek — Runda ${curRound} (zgłoszonych ${summary.reported}, naprawionych ${summary.fixed}, odrzuconych ${summary.rejected}, rozwój v1.1 ${summary.dev_v11}). Otwarta Runda ${next}.`.slice(0, 500),
        });
        return json({ ok: true, closed_round: curRound, test_round: next, summary });
      },
    },

    // ============ END (klient „to wszystko" → sweep + podsumowanie, sesja closed) ============
    end: {
      run: async (ctx: Ctx) => {
        const { sb, projectId, json } = ctx;
        const { active, curRound, mode } = ctx.state;
        if (ctx.readonly) return ctx.roErr();
        if (!active) return json({ error: "not_active" }, 409);
        const session = await getOrCreateSession(sb, projectId, false);
        if (!session) return json({ ok: true, reply: "Dzięki! Jak coś jeszcze wypłynie — po prostu tu wróć.", issues: [] });

        let reply = "Dziękuję za testy! Wszystko przekazuję do przeglądu — statusy zobaczysz w liście „Twoje zgłoszenia”.";
        if (!(await ctx.isKilled())) {
          const { data: histRows } = await sb.from("wfa_test_messages").select("role, content, attachments, created_at")
            .eq("session_id", session.id).order("created_at", { ascending: false }).limit(HISTORY_TURNS);
          const hist = (histRows || []).reverse().map((m: Record<string, unknown>) => ({
            role: m.role,
            content: (m.content || "") + (m.role === "user" && pathsOf(m.attachments).length ? " [klient dołączył zrzut ekranu]" : ""),
          }));
          const issues = await loadIssues(sb, projectId);
          const system = buildTestPrompt(String(ctx.project.name || ""), String(ctx.project.test_context || ""), issues, mode)
            + "\n\nKONIEC ROZMOWY: klient powiedział, że to wszystko. ZRÓB SWEEP — jeśli w rozmowie została JAKAKOLWIEK uwaga jeszcze niezapisana jako zgłoszenie, zapisz ją TERAZ markerem <zgloszenie>. Następnie krótko, ciepło PODSUMUJ ile uwag zebraliśmy i podziękuj. Nie obiecuj wdrożenia.";
          const ai = await ctx.callOpenAI(system, hist, `end proj=${projectId.slice(0, 8)}`);
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
      },
    },
  },
};

Deno.serve((req: Request) => servePortalChat(req, CONFIG));

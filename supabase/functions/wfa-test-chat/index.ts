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

// „Czytaj kod" (diagnoza bugów, sesja U8) — READ-ONLY dostęp do repo projektu przez GitHub REST.
// Model przy zgłoszeniu BŁĘDU może zajrzeć w kod (potwierdzić bug vs zachowanie celowe). Sekret edge.
const GH_TOKEN = Deno.env.get("GITHUB_READ_TOKEN") || "";
const MAX_CODE_CALLS = 6;    // max wywołań narzędzia czytaj_kod na turę (twarda bramka anty-koszt)
const MAX_CODE_ROUNDS = 6;   // max rund modelu z narzędziem (bezpiecznik pętli)
const MAX_CODE_LINES = 400;  // max linii na jeden odczyt

// Cennik USD/1M tokenów (log kosztu do edge logs; brak dedykowanej tabeli ai_usage w wfa — patrz raport)
const PRICES: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-5.1": { input: 1.25, output: 10 },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
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

function statusPl(s: string): string {
  return s === "new" ? "Nowe"
    : s === "approved" ? "Przyjęte do poprawki"
    : s === "rejected" ? "Odrzucone"
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
    .select("seq, title, status, severity, tomek_comment, screenshots")
    .eq("project_id", projectId).order("seq", { ascending: true });
  return (data || []) as Array<Record<string, unknown>>;
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

// ── Narzędzie „czytaj_kod" (U8): READ-ONLY GitHub REST na repo z wfa_projects.repo_url ──────────
type RepoInfo = { owner: string; repo: string };

function parseRepoUrl(url: string): RepoInfo | null {
  const m = String(url || "").match(/github\.com[/:]([^/\s]+)\/([^/#?\s]+?)(?:\.git)?\/?$/i);
  return m ? { owner: m[1], repo: m[2] } : null;
}

function ghFetch(path: string, accept = "application/vnd.github+json"): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: accept,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "tn-crm-wfa-test-chat",
    },
  });
}

type CodeCall = { akcja?: string; sciezka?: string; fraza?: string; plik?: string; od?: number; do?: number };

// Wykonanie jednej akcji narzędzia → zwięzły tekst dla modelu (NIE dla klienta).
async function execCodeTool(owner: string, repo: string, c: CodeCall): Promise<string> {
  const akcja = String(c.akcja || "").trim();
  try {
    if (akcja === "lista_plikow") {
      const dir = String(c.sciezka || "").replace(/^\/+|\/+$/g, "");
      const res = await ghFetch(`/repos/${owner}/${repo}/contents/${dir.split("/").map(encodeURIComponent).join("/")}`);
      if (!res.ok) return `[lista_plikow ${dir || "/"}] błąd ${res.status}`;
      const arr = await res.json().catch(() => null);
      if (!Array.isArray(arr)) return `[lista_plikow ${dir || "/"}] to plik, nie katalog — użyj „czytaj"`;
      const items = arr.slice(0, 100).map((x: any) => `${x.type === "dir" ? "[DIR] " : "      "}${x.path}${x.type === "file" ? ` (${x.size} B)` : ""}`);
      return `[lista_plikow ${dir || "/"}] (${arr.length} pozycji)\n` + items.join("\n");
    }
    if (akcja === "czytaj") {
      const plik = String(c.plik || "").replace(/^\/+/, "");
      if (!plik) return "[czytaj] brak nazwy pliku";
      const res = await ghFetch(`/repos/${owner}/${repo}/contents/${plik.split("/").map(encodeURIComponent).join("/")}`);
      if (!res.ok) return `[czytaj ${plik}] błąd ${res.status}`;
      const j = await res.json().catch(() => null) as any;
      if (!j || Array.isArray(j) || !j.content) return `[czytaj ${plik}] to katalog albo plik binarny`;
      let text: string;
      try {
        const bin = atob(String(j.content).replace(/\s/g, ""));
        text = new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
      } catch { return `[czytaj ${plik}] nie mogę zdekodować treści`; }
      const lines = text.split("\n");
      let od = Math.max(1, Math.floor(Number(c.od) || 1));
      let doo = Math.floor(Number(c.do) || (od + MAX_CODE_LINES - 1));
      if (doo < od) doo = od;
      if (doo - od + 1 > MAX_CODE_LINES) doo = od + MAX_CODE_LINES - 1;
      doo = Math.min(doo, lines.length);
      const body = lines.slice(od - 1, doo).map((l, i) => `${od + i}: ${l}`).join("\n");
      const tail = doo < lines.length ? `\n… (plik ma ${lines.length} linii; pokazano ${od}-${doo}; poproś o dalszy zakres jeśli trzeba)` : "";
      return `[czytaj ${plik} ${od}-${doo}]\n${body}${tail}`;
    }
    if (akcja === "szukaj") {
      const fraza = String(c.fraza || "").trim();
      if (!fraza) return "[szukaj] brak frazy";
      const res = await ghFetch(`/search/code?q=${encodeURIComponent(`${fraza} repo:${owner}/${repo}`)}&per_page=6`, "application/vnd.github.text-match+json");
      if (res.status === 422) return `[szukaj „${fraza}"] wyszukiwarka treści niedostępna dla tego repo (może nie być jeszcze zaindeksowane) — użyj „lista_plikow" + „czytaj"`;
      if (!res.ok) return `[szukaj „${fraza}"] błąd ${res.status}`;
      const j = await res.json().catch(() => null) as any;
      const items = (j?.items || []).slice(0, 6);
      if (!items.length) return `[szukaj „${fraza}"] brak trafień — spróbuj „lista_plikow" + „czytaj"`;
      return `[szukaj „${fraza}"] trafienia:\n` + items.map((it: any) => {
        const frag = (it.text_matches || []).map((t: any) => t.fragment).filter(Boolean).slice(0, 2).join(" … ").replace(/\s+/g, " ").slice(0, 200);
        return `- ${it.path}${frag ? `  → …${frag}…` : ""}`;
      }).join("\n");
    }
    return `[czytaj_kod] nieznana akcja: „${akcja}" (dozwolone: lista_plikow, czytaj, szukaj)`;
  } catch (e) {
    return `[czytaj_kod ${akcja}] wyjątek: ${String(e).slice(0, 140)}`;
  }
}

// Wytnij markery <czytaj_kod>{...}</czytaj_kod> z tekstu modelu → lista wywołań + oczyszczony tekst.
function parseCodeCalls(text: string): { clean: string; calls: CodeCall[] } {
  const calls: CodeCall[] = [];
  const clean = text.replace(/<czytaj_kod>([\s\S]*?)<\/czytaj_kod>/g, (_m, inner) => {
    try { const o = JSON.parse(String(inner).trim()); if (o && o.akcja) calls.push(o); }
    catch (e) { console.error("[wfa-test-chat] czytaj_kod marker parse:", e, String(inner).slice(0, 160)); }
    return "";
  }).replace(/\n{3,}/g, "\n\n").trim();
  return { clean, calls };
}

// Instrukcja narzędzia do system-promptu (wstrzykiwana tylko gdy projekt MA dostęp do repo).
const CODE_TOOL_INSTR = (owner: string, repo: string) => `MASZ WGLĄD W KOD APLIKACJI (repo ${owner}/${repo}, tylko ODCZYT) — służy WYŁĄCZNIE Twojej diagnozie zgłoszeń, nie rozmowie.
KIEDY zaglądać: przy KAŻDYM zgłoszeniu BŁĘDU dotyczącym tego, jak aplikacja DZIAŁA lub WYGLĄDA (coś nie działa, psuje się, nachodzi na siebie, źle się wyświetla, nie zapisuje itp.) ZAJRZYJ w kod ZANIM zapiszesz zgłoszenie — po to, by (1) ocenić, czy to faktyczny błąd, czy zachowanie CELOWE, ORAZ (2) zlokalizować prawdopodobne miejsce w kodzie. Wyjątek: czyste pomysły/propozycje rozwoju (to nie błędy) — tam kodu nie ruszaj.
JAK: wysyłasz ukryty marker (klient go NIE widzi), dostajesz wynik i DOPIERO wtedy piszesz odpowiedź. Akcje:
<czytaj_kod>{"akcja":"lista_plikow","sciezka":"public/js"}</czytaj_kod>   (spis plików katalogu; pusta ścieżka = katalog główny)
<czytaj_kod>{"akcja":"czytaj","plik":"public/js/offer-actions.js","od":1,"do":80}</czytaj_kod>   (treść pliku, zakres linii)
<czytaj_kod>{"akcja":"szukaj","fraza":"frozen"}</czytaj_kod>   (wyszukiwanie w kodzie repo)
NAJPIERW „lista_plikow", by znaleźć właściwy plik, potem „czytaj". Gdy chcesz zajrzeć — wyślij SAM marker/markery i NIC więcej (nie pisz jeszcze do klienta); odpowiedź napiszesz po wyniku.
LIMITY: maks. ${MAX_CODE_CALLS} odczytów na jedną wiadomość, maks. ${MAX_CODE_LINES} linii na odczyt, tylko repo TEGO projektu.
CO ROBISZ Z USTALENIAMI:
- Jeśli zachowanie okaże się CELOWE (świadoma blokada/zamrożenie, walidacja, limit, konstrukcja z założenia) → to NIE jest błąd. Wyjaśnij klientowi PO LUDZKU, dlaczego tak działa i jaka jest właściwa droga (np. „wysłana oferta jest celowo zamrożona — poprawki robisz przez nową wersję"), i ZAPYTAJ, czy to zmienia jego spojrzenie. Jeśli mimo wyjaśnienia podtrzymuje, że chce zmianę → zapisz jako propozycję i wypełnij ai_pushback.
- Jeśli to FAKTYCZNY błąd → zapisz <zgloszenie> i ZAWSZE (skoro masz wgląd w kod) dołóż do jego JSON trzy pola diagnozy: code_ref = plik i przybliżona linia najbardziej podejrzanego miejsca, hipoteza = prawdopodobna przyczyna, proponowana_naprawa = co zmienić. To przyspiesza sesję naprawczą. Przykład:
<zgloszenie>{"title":"…","description":"…","area":"…","device":"mobile|desktop|null","severity":"…","quote":"…","dodaj_do":null,"ai_pushback":null,"poza_v1":false,"code_ref":"public/js/plik.js:123","hipoteza":"…","proponowana_naprawa":"…"}</zgloszenie>
ŻELAZNA ZASADA: NIGDY nie wklejaj klientowi fragmentów kodu, nazw funkcji/tabel ani żargonu — klientowi tłumaczysz wszystko zwykłym, ludzkim językiem.`;

// Pola diagnozy w markerze <zgloszenie> (dokładane do opisu pól, gdy jest dostęp do kodu).
const MARKER_DIAG_FIELDS = `- code_ref: (TYLKO gdy potwierdziłeś w kodzie FAKTYCZNY błąd) plik i przybliżona linia podejrzanego miejsca, np. „public/js/kreator.js:142". Inaczej null.
- hipoteza: (TYLKO przy potwierdzonym błędzie) 1–2 zdania po polsku — prawdopodobna przyczyna. Inaczej null.
- proponowana_naprawa: (TYLKO przy potwierdzonym błędzie) 1–2 zdania po polsku — co zmienić, by naprawić. Inaczej null.`;

function buildSystemPrompt(appName: string, testContext: string, issues: Array<Record<string, unknown>>, mode: TestMode = "testy", codeInfo: RepoInfo | null = null): string {
  const titles = issues.length
    ? issues.map((i) => `  - [TK-${i.seq}] ${i.title}`).join("\n")
    : "  (brak — to pierwsze zgłoszenia)";
  const app = appName || "Twoja aplikacja";
  const ctx = (testContext || "").trim() || "(brak szczegółowego opisu — dopytuj klienta o ekran/moduł, którego dotyczy uwaga)";
  // U8: gdy projekt ma dostęp do repo → wstrzyknij instrukcję narzędzia + pola diagnozy do markera.
  const codeBlock = codeInfo ? "\n" + CODE_TOOL_INSTR(codeInfo.owner, codeInfo.repo) + "\n" : "";
  const diagFieldsBlock = codeInfo ? "\n" + MARKER_DIAG_FIELDS : "";

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
${codeBlock}
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
${MARKER_BRAIN_FIELDS}${diagFieldsBlock}
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
${codeBlock}
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
${MARKER_BRAIN_FIELDS}${diagFieldsBlock}
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

  // U8: diagnoza z kodu (tylko dla potwierdzonych błędów) → flags.code_ref / hipoteza / proponowana_naprawa.
  const codeRef = raw.code_ref ? String(raw.code_ref).slice(0, 300).trim() : "";
  const hipoteza = raw.hipoteza ? String(raw.hipoteza).slice(0, 800).trim() : "";
  const naprawa = raw.proponowana_naprawa ? String(raw.proponowana_naprawa).slice(0, 800).trim() : "";
  if (codeRef) flags.code_ref = codeRef;
  if (hipoteza) flags.hipoteza = hipoteza;
  if (naprawa) flags.proponowana_naprawa = naprawa;

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

// U8: runda(y) modelu z narzędziem „czytaj_kod". Model może zażądać odczytów kodu (markery),
// my je wykonujemy (max MAX_CODE_CALLS/turę) i oddajemy wynik, aż model odpowie klientowi.
// Brak codeInfo/tokenu → zwykłe pojedyncze wywołanie (zachowanie sprzed U8). Zwraca oczyszczony tekst.
async function runWithCodeTool(
  system: string,
  transcript: Array<{ role: string; content: string; images?: string[] }>,
  codeInfo: RepoInfo | null,
  label: string,
): Promise<{ text: string } | null> {
  const conv: Array<{ role: string; content: string; images?: string[] }> =
    transcript.map((m) => ({ role: m.role, content: m.content, images: m.images }));

  if (!codeInfo || !GH_TOKEN) {
    const ai = await callOpenAI(system, conv, label);
    return ai ? { text: parseCodeCalls(ai.text).clean || ai.text } : null;
  }

  let used = 0;
  const cache = new Map<string, string>();
  for (let round = 0; round < MAX_CODE_ROUNDS; round++) {
    const ai = await callOpenAI(system, conv, `${label} r${round}`);
    if (!ai) return round === 0 ? null : { text: "" };
    const { clean, calls } = parseCodeCalls(ai.text);
    if (!calls.length) return { text: clean || ai.text };

    const results: string[] = [];
    let hitLimit = false;
    for (const c of calls) {
      if (used >= MAX_CODE_CALLS) {
        results.push(`[limit] Wyczerpano limit ${MAX_CODE_CALLS} odczytów kodu w tej wiadomości. Odpowiedz TERAZ na podstawie tego, co już wiesz — NIE proś o kolejne odczyty.`);
        hitLimit = true;
        break;
      }
      used++;
      const key = JSON.stringify(c);
      let r = cache.get(key);
      if (r === undefined) { r = await execCodeTool(codeInfo.owner, codeInfo.repo, c); cache.set(key, r); }
      results.push(r);
    }
    console.log(`[wfa-test-chat] ${label} czytaj_kod round=${round} calls=${calls.length} used=${used}${hitLimit ? " LIMIT" : ""}`);
    conv.push({ role: "assistant", content: ai.text });
    conv.push({ role: "user", content: `WYNIK narzędzia „czytaj_kod" (widzisz to tylko Ty; klient tego NIE widzi):\n\n${results.join("\n\n")}` });
    if (hitLimit || used >= MAX_CODE_CALLS) break; // wymuś finalną odpowiedź poza pętlą
  }

  // Finalna odpowiedź — bez dalszych odczytów (limit rund/wywołań osiągnięty).
  const finalSys = system + "\n\n[SYSTEM] Zakończ diagnozę: NIE emituj już markerów <czytaj_kod>. Napisz teraz odpowiedź do klienta i — jeśli zasadne — zapisz zgłoszenie markerem <zgloszenie>.";
  const fin = await callOpenAI(finalSys, conv, `${label} final`);
  if (!fin) return { text: "" };
  return { text: parseCodeCalls(fin.text).clean || fin.text };
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
    .select("id, name, unique_token, client_password_hash, test_context, test_mode, repo_url")
    .eq("unique_token", token).maybeSingle();
  if (!p) { await sleep(300); return json({ error: "unauthorized" }, 401); }

  // ============ TEST_ADMIN (panel Tomka): pełne zgłoszenia + signed URLs zrzutów ============
  // Gate = CZŁONEK ZESPOŁU (team JWT), NIE hasło klienta. Wiersze i tak czyta panel przez
  // supabaseClient (RLS team_members); ta akcja dokłada podpisane URL-e do prywatnego bucketa.
  if ((body.action || "").trim() === "test_admin") {
    const member = await verifyTeamMember(req, sb);
    if (!member) { await sleep(300); return json({ error: "unauthorized" }, 401); }
    const { data: iss } = await sb.from("wfa_test_issues")
      .select("id, seq, title, description, area, device, severity, quote, status, tomek_comment, screenshots, flags, created_at, decided_at, done_at")
      .eq("project_id", String(p.id)).order("seq", { ascending: true });
    const rows = (iss || []) as Array<Record<string, unknown>>;
    const allPaths: string[] = [];
    rows.forEach((i) => pathsOf(i.screenshots).forEach((pp) => allPaths.push(pp)));
    const signed = await sign(sb, allPaths);
    return json({
      issues: rows.map((i) => ({
        id: i.id, seq: i.seq, title: i.title, description: i.description, area: i.area, device: i.device,
        severity: i.severity, quote: i.quote, status: i.status, tomek_comment: i.tomek_comment, created_at: i.created_at,
        flags: (i.flags && typeof i.flags === "object") ? i.flags : {},
        shots: pathsOf(i.screenshots).map((pp) => ({ path: pp, url: signed[pp] || null })),
      })),
    });
  }

  // Ścieżka klienta: hasło portalu (SHA-256) obowiązkowe.
  if (!preview) {
    if (!password || password.length > 200 || !p.client_password_hash) { await sleep(300); return json({ error: "unauthorized" }, 401); }
    const hash = await sha256Hex(password);
    if (hash !== String(p.client_password_hash).toLowerCase()) { await sleep(300); return json({ error: "unauthorized" }, 401); }
  }

  const projectId = String(p.id);
  const mode: TestMode = String(p.test_mode || "").trim() === "feedback" ? "feedback" : "testy";
  // U8: dostęp do kodu tylko gdy jest sekret GITHUB_READ_TOKEN i repo_url projektu daje się sparsować.
  const codeInfo: RepoInfo | null = GH_TOKEN && (p as any).repo_url ? parseRepoUrl(String((p as any).repo_url)) : null;
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
        role: m.role, content: m.content,
        attachments: pathsOf(m.attachments).map((p) => ({ path: p, url: signed[p] || null })),
      }));
    }
    const issues = await loadIssues(sb, projectId);
    // miniatury zgłoszeń dla klienta pomijamy (lista statusów wystarcza); pełny podgląd = panel Tomka.
    return json({
      active: true, readonly, session_id: session?.id || null,
      app_name: (p.name || "").trim() || "Twoja aplikacja",
      messages,
      issues: issues.map((i) => ({ seq: i.seq, title: i.title, status: i.status, status_pl: statusPl(String(i.status)), comment: i.tomek_comment || null })),
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
    const system = buildSystemPrompt(String(p.name || ""), String(p.test_context || ""), issues, mode, codeInfo);
    const ai = await runWithCodeTool(system, transcript, codeInfo, `proj=${projectId.slice(0, 8)} mode=${mode}`);
    if (!ai) {
      return json({ soft: true, reply: "Coś mi się przycięło — spróbuj wysłać jeszcze raz za chwilę. Twoja wiadomość jest zapisana." });
    }

    // Parsuj markery zgłoszeń → INSERT (zrzuty z bieżącego wątku doklejone do PIERWSZEGO nowego).
    const { clean, issues: parsed } = parseIssues(ai.text);
    const created: Array<{ seq: number; title: string }> = [];
    if (parsed.length) {
      let shots = await pendingShots(sb, projectId, session.id);
      for (const iss of parsed) {
        const r = await insertIssue(sb, projectId, session.id, iss, shots);
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
      created: created.map((c) => ({ seq: c.seq, title: c.title })),
      issues: allIssues.map((i) => ({ seq: i.seq, title: i.title, status: i.status, status_pl: statusPl(String(i.status)), comment: i.tomek_comment || null })),
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
          for (const iss of parsed) { const r = await insertIssue(sb, projectId, session.id, iss, shots); if (r) shots = []; }
        }
        if (clean) reply = clean;
      }
    }
    await sb.from("wfa_test_sessions").update({ status: "closed", last_activity_at: new Date().toISOString() }).eq("id", session.id);
    await sb.from("wfa_test_messages").insert({ session_id: session.id, project_id: projectId, role: "assistant", content: reply });
    const allIssues = await loadIssues(sb, projectId);
    return json({ ok: true, reply, issues: allIssues.map((i) => ({ seq: i.seq, title: i.title, status: i.status, status_pl: statusPl(String(i.status)), comment: i.tomek_comment || null })) });
  }

  return json({ error: "bad_action" }, 400);
});

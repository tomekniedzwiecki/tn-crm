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

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Podgląd admina „oczami klienta": JWT CZŁONKA ZESPOŁU (team_members), nie samego 'authenticated'.
async function verifyTeamMember(req: Request, sb: ReturnType<typeof createClient>): Promise<{ id: string } | null> {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const tok = m[1].trim();
  if (!tok || tok.startsWith("sb_publishable_") || tok.startsWith("sb_secret_")) return null;
  const { data: u } = await sb.auth.getUser(tok);
  if (!u?.user) return null;
  const { data: tm } = await sb.from("team_members").select("user_id").eq("user_id", u.user.id).maybeSingle();
  return tm ? { id: u.user.id } : null;
}

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

// Podpisz ścieżki zrzutów (1h) do renderu miniatur / vision.
async function sign(sb: ReturnType<typeof createClient>, paths: string[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  const uniq = [...new Set(paths.filter(Boolean))];
  if (!uniq.length) return map;
  const { data } = await sb.storage.from(BUCKET).createSignedUrls(uniq, 3600);
  (data || []).forEach((s: any) => { if (s && s.path && s.signedUrl) map[s.path] = s.signedUrl; });
  return map;
}

const pathsOf = (att: unknown): string[] =>
  Array.isArray(att) ? att.map((a) => (typeof a === "string" ? a : (a && (a as any).path))).filter(Boolean) : [];

// ── System prompt „przyjmujący zgłoszenia" ────────────────────────────────────
function buildSystemPrompt(appName: string, testContext: string, issues: Array<Record<string, unknown>>): string {
  const titles = issues.length
    ? issues.map((i) => `  - [TK-${i.seq}] ${i.title}`).join("\n")
    : "  (brak — to pierwsze zgłoszenia)";
  const ctx = (testContext || "").trim() || "(brak szczegółowego opisu — dopytuj klienta o ekran/moduł, którego dotyczy uwaga)";
  return `Jesteś życzliwym, konkretnym asystentem, który PRZYJMUJE UWAGI klienta do jego aplikacji „${appName || "Twoja aplikacja"}" po testach. Rozmawiasz jak dobry, cierpliwy tester-recepcjonista: klient MÓWI swobodnie co mu nie gra, a Ty układasz z tego porządek. Klient NIGDY nie wypełnia formularza — strukturę tworzysz Ty.

O APLIKACJI (kontekst — znasz ją, więc nie pytaj o rzeczy oczywiste):
${ctx}

JAK ROZMAWIASZ:
- Ciepło, po ludzku, krótko (1–4 zdania). Zero żargonu technicznego wobec klienta.
- Zachęcaj: „Powiedz mi o wszystkim, co Ci nie gra — nawet drobiazgi. Zrzut ekranu bardzo pomaga."
- Dla KAŻDEJ uwagi dopytaj (o ile klient sam nie podał): 1) GDZIE to się dzieje (ekran/moduł), 2) KROKI — co klikał po kolei, 3) CZEGO OCZEKIWAŁ, 4) CO ZOBACZYŁ zamiast tego, 5) URZĄDZENIE (telefon czy komputer). Nie odpytuj jak z formularza — wplataj pytania naturalnie, po jednym–dwa naraz.
- Gdy klient dokleił ZRZUT EKRANU — obejrzyj go i ODNIEŚ SIĘ do tego, co na nim widać (to buduje zaufanie: „Widzę na zrzucie, że przycisk zachodzi na tekst…").
- NIGDY nie obiecuj wdrożenia ani terminu. Mów: „Przekażę to do przeglądu" / „Zapiszę i zespół to rozważy". Decyzja, co trafi do poprawek, należy do zespołu — nie do Ciebie.
- Nie zdradzasz wewnętrznych szczegółów technicznych ani sekretów. Znasz tylko to, co wyżej + rozmowę.

SKŁADANIE ZGŁOSZENIA (najważniejsze):
Gdy masz dość informacji o danej uwadze (temat wyczerpany), ZAPISZ ją, emitując w SWOJEJ odpowiedzi ukryty marker (klient go nie widzi — system go wycina i sam dopisze potwierdzenie z numerem):
<zgloszenie>{"title":"…","description":"…","area":"…","device":"mobile|desktop|null","severity":"krytyczne|istotne|kosmetyka","quote":"…","dodaj_do":null}</zgloszenie>
- title: krótki, po polsku, konkretny (np. „Nie działa zapis notatki na telefonie").
- description: złóż w całość KROKI / CZEGO OCZEKIWAŁ / CO ZOBACZYŁ — 2–5 zdań, tak by wykonawca wiedział co naprawić.
- area: ekran/moduł którego dotyczy (np. „Panel operatora → Rabaty"); null jeśli naprawdę nieznany.
- device: mobile / desktop / null.
- severity: TWOJA sugestia (krytyczne = blokuje pracę; istotne = przeszkadza; kosmetyka = drobiazg wizualny).
- quote: DOSŁOWNY, najbardziej treściwy cytat klienta (zachowaj jego język!).
- dodaj_do: jeśli to TA SAMA rzecz co istniejące zgłoszenie z listy poniżej — wstaw jego numer seq (samą liczbę), a w description dopisz nowy szczegół; system dołączy notatkę zamiast dublować. W innym razie null.
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

  // Dedup: dodaj_do = seq istniejącego → dopisz notatkę zamiast dublować.
  const addTo = Number(raw.dodaj_do);
  if (Number.isInteger(addTo) && addTo > 0) {
    const { data: ex } = await sb.from("wfa_test_issues").select("id, seq, title, description, screenshots")
      .eq("project_id", projectId).eq("seq", addTo).maybeSingle();
    if (ex) {
      const prevShots = pathsOf((ex as any).screenshots);
      const merged = [...new Set([...prevShots, ...shots])].map((p) => ({ path: p }));
      const newDesc = String((ex as any).description || "") + (desc ? `\n\n[dopisane z rozmowy] ${desc}` : "");
      await sb.from("wfa_test_issues").update({ description: newDesc.slice(0, 4000), screenshots: merged }).eq("id", (ex as any).id);
      return { seq: (ex as any).seq, title: (ex as any).title };
    }
  }

  const shotsJson = shots.map((p) => ({ path: p }));
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data: mx } = await sb.from("wfa_test_issues").select("seq").eq("project_id", projectId).order("seq", { ascending: false }).limit(1).maybeSingle();
    const seq = ((mx as any)?.seq || 0) + 1;
    const { data, error } = await sb.from("wfa_test_issues").insert({
      project_id: projectId, session_id: sessionId, seq, title, description: desc,
      area, device, severity, quote, screenshots: shotsJson, status: "new",
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
    .select("id, name, unique_token, client_password_hash, test_context")
    .eq("unique_token", token).maybeSingle();
  if (!p) { await sleep(300); return json({ error: "unauthorized" }, 401); }

  // ============ TEST_ADMIN (panel Tomka): pełne zgłoszenia + signed URLs zrzutów ============
  // Gate = CZŁONEK ZESPOŁU (team JWT), NIE hasło klienta. Wiersze i tak czyta panel przez
  // supabaseClient (RLS team_members); ta akcja dokłada podpisane URL-e do prywatnego bucketa.
  if ((body.action || "").trim() === "test_admin") {
    const member = await verifyTeamMember(req, sb);
    if (!member) { await sleep(300); return json({ error: "unauthorized" }, 401); }
    const { data: iss } = await sb.from("wfa_test_issues")
      .select("id, seq, title, description, area, device, severity, quote, status, tomek_comment, screenshots, created_at, decided_at, done_at")
      .eq("project_id", String(p.id)).order("seq", { ascending: true });
    const rows = (iss || []) as Array<Record<string, unknown>>;
    const allPaths: string[] = [];
    rows.forEach((i) => pathsOf(i.screenshots).forEach((pp) => allPaths.push(pp)));
    const signed = await sign(sb, allPaths);
    return json({
      issues: rows.map((i) => ({
        id: i.id, seq: i.seq, title: i.title, description: i.description, area: i.area, device: i.device,
        severity: i.severity, quote: i.quote, status: i.status, tomek_comment: i.tomek_comment, created_at: i.created_at,
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
    const system = buildSystemPrompt(String(p.name || ""), String(p.test_context || ""), issues);
    const ai = await callOpenAI(system, transcript, `proj=${projectId.slice(0, 8)}`);
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
      const system = buildSystemPrompt(String(p.name || ""), String(p.test_context || ""), issues)
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

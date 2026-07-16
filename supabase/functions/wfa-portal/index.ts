// wfa-portal — publiczny odczyt postępu budowy aplikacji dla KLIENTA (kamienie milowe)
// + mechanizm UMOWY (zbieranie danych, render w locie, pobranie do podpisu).
// Wzorzec: RLS wfa_* = tylko team; klient dostaje dane WYŁĄCZNIE przez tę funkcję
// (token z URL + hasło; hasło = SHA-256 w client_password_hash).
//
// HASŁO first-visit (16.07): hash NULL = portal jeszcze bez hasła. KLIENT sam ustawia hasło
// przy pierwszym wejściu — akcja `set_password` (gate: token OK ORAZ hash NULL; NIGDY nie
// nadpisuje istniejącego). `portal_state` (bez hasła) mówi frontowi czy pokazać ekran „ustaw hasło"
// czy logowanie. Reset = Tomek czyści hash do NULL w panelu → klient ustawia nowe.
//
// Body BEZ `action` = status projektu (postęp %, etapy, kamienie).
// Body z `action`:
//   'portal_state'   → { needs_setup, name } — czy portal wymaga ustawienia hasła (bez hasła)
//   'set_password'   → ustaw hasło TYLKO gdy hash NULL (first-visit); { ok:true }
//   'contract_meta'  → { contract_status, fields, has_final, final_url, name, customer_name, customer_email }
//   'contract_data'  → zapis danych klienta (tylko gdy status='dane_klienta') → status='do_podpisu'
//   'contract_html'  → render umowy W LOCIE (szablon/custom + podstawienie {{...}}); { html }
//
// LEKCJA „baked placeholders" (tn-crm): render ZAWSZE w locie, NIGDY nie zapisujemy podstawionego HTML.
//
// Deploy: npx supabase functions deploy wfa-portal --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws

import { createClient } from "jsr:@supabase/supabase-js@2";
import { signPaths, verifyTeamMember } from "../_shared/admin-files.ts";
import { throttleClear, throttleFail, throttleGate } from "../_shared/portal-throttle.ts";

// SEC-D FAIL #1: escape WSZYSTKICH wartości klienta wstawianych do HTML umowy.
// Klient-operator jest półzaufany — dane firmy (imię/firma/ulica/miasto) trafiają do umowy
// renderowanej w przeglądarce Tomka (podgląd admina) na crm.tomekniedzwiecki.pl. Bez escapowania
// = stored XSS -> przejęcie sesji super-admina. Placeholdery szablonu (klucze mapy) zostają;
// escapowane są tylko WARTOŚCI podstawiane w ich miejsce.
function escHtml(s: unknown): string {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TEMPLATE_URL = "https://crm.tomekniedzwiecki.pl/umowy/umowa-budowa-aplikacji.html";
const ONBOARD_URL = "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wfa-stripe-onboard";
const INTAKE_BUCKET = "wfa-intake";
const INTAKE_MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const INTAKE_MAX_FILES = 30;
const INTAKE_ALLOWED_EXT = ["pdf", "png", "jpg", "jpeg", "webp", "heic", "html", "htm", "csv", "xls", "xlsx", "doc", "docx", "txt", "zip"];

function json(body: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", ...(extraHeaders || {}) },
  });
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Podgląd admina „oczami klienta" (gate JWT team_members) + signed URLs prywatnych
// bucketów → wspólny helper _shared/admin-files.ts (używany też przez wfa-test-chat).

function fmtDatePl(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

// Render umowy w locie: usuń baner szablonu (.warn) + podstaw placeholdery danych.
// wyk = { nazwa, nip, adres } z settings.aplikacja_wykonawca_dane; gdy null — WYKONAWCA_* zostają jak są.
function renderContractHtml(
  rawHtml: string,
  p: Record<string, unknown>,
  wyk: { nazwa?: string; nip?: string; adres?: string } | null,
): string {
  let html = rawHtml.replace(/<div class="warn[^"]*"[^>]*>[\s\S]*?<\/div>/, "");
  const f = (p.contract_fields as Record<string, string>) || {};
  const company = (f.company || "").trim();
  const street = (f.street || "").trim();
  const postal = (f.postal || "").trim();
  const city = (f.city || "").trim();
  const adres = [street, [postal, city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const dataDate = p.contract_sent_at ? new Date(String(p.contract_sent_at)) : new Date();

  const map: Record<string, string> = {
    "{{ZAMAWIAJACY_IMIE_NAZWISKO}}": String(f.full_name || p.customer_name || ""),
    "{{ZAMAWIAJACY_FIRMA}}": company ? ", " + company : "",
    "{{ZAMAWIAJACY_NIP}}": String(f.nip || ""),
    "{{ZAMAWIAJACY_ADRES}}": adres,
    "{{ZAMAWIAJACY_EMAIL}}": String(p.customer_email || ""),
    "{{DATA}}": fmtDatePl(dataDate),
    "{{TERMIN_TYGODNI}}": String(f.termin_tygodni || "8"),
    "{{NAZWA_APLIKACJI_ROBOCZA}}": String(p.name || ""),
    "{{FEE_PERCENT}}": String(p.fee_percent != null ? p.fee_percent : 10),
  };
  if (wyk) {
    if (wyk.nazwa != null) map["{{WYKONAWCA_NAZWA}}"] = String(wyk.nazwa);
    if (wyk.nip != null) map["{{WYKONAWCA_NIP}}"] = String(wyk.nip);
    if (wyk.adres != null) map["{{WYKONAWCA_ADRES}}"] = String(wyk.adres);
  }
  // SEC-D: escapujemy KAŻDĄ podstawianą wartość (dane klienta = XSS sink). Placeholdery to
  // plain-text pola (nazwiska, adres, data, %) — żaden nie jest zamierzonym HTML-em.
  for (const [k, v] of Object.entries(map)) html = html.split(k).join(escHtml(v));
  return html;
}

// Pierwsze PRAWDZIWE wejście klienta do portalu: odhacz pozycję „Klient wszedł do portalu /
// potwierdził" w kroku kickoff (idempotentnie — kolejne wejścia to tani no-op) + activity.
// UWAGA: tekst pozycji = klucz deduplikacji checklisty w panelu — musi być IDENTYCZNY z WS.kickoff.
const KICKOFF_VISIT_ITEM = "Klient wszedł do portalu / potwierdził";
async function markClientEntered(sb: ReturnType<typeof createClient>, projectId: string): Promise<void> {
  const { data: step } = await sb
    .from("wfa_steps")
    .select("id, data")
    .eq("project_id", projectId)
    .eq("step_key", "kickoff")
    .maybeSingle();
  if (!step) return;

  const data = (step.data && typeof step.data === "object") ? step.data as Record<string, unknown> : {};
  const checklist: { t: string; done: boolean }[] = Array.isArray(data.checklist) ? [...data.checklist as []] : [];
  const idx = checklist.findIndex((i) => i && i.t === KICKOFF_VISIT_ITEM);
  if (idx >= 0 && checklist[idx].done === true) return; // już odhaczone — nic nie rób

  if (idx >= 0) checklist[idx] = { ...checklist[idx], done: true };
  else checklist.push({ t: KICKOFF_VISIT_ITEM, done: true });

  await sb.from("wfa_steps").update({ data: { ...data, checklist } }).eq("id", step.id);
  await sb.from("wfa_activities").insert({
    project_id: projectId,
    actor: "client",
    action: "portal_visit",
    description: "Klient wszedł do portalu — pozycja kroku Przekazanie dostępu odhaczona automatycznie.",
  });
}

// ============ INTAKE („Do uzupełnienia") — helpery ============
// Statusy per karta (spójne po stronie klienta i admina).
function firmaStatus(f: Record<string, any>): "empty" | "partial" | "done" {
  const g = (k: string) => String(f?.[k] == null ? "" : f[k]).trim();
  const core = ["full_name", "nip", "street", "postal", "city"];
  if (core.every((k) => g(k))) return "done";
  const any = ["full_name", "company", "nip", "street", "postal", "city", "phone"].some((k) => g(k));
  return any ? "partial" : "empty";
}
function materialyStatus(data: Record<string, any>, hasFiles: boolean): "empty" | "partial" | "done" {
  const links = String(data?.links == null ? "" : data.links).trim();
  const note = String(data?.note == null ? "" : data.note).trim();
  if (hasFiles || links) return "done";
  if (note) return "partial";
  return "empty";
}
function betaStatus(people: unknown): "empty" | "partial" | "done" {
  const n = Array.isArray(people) ? people.length : 0;
  if (n >= 5) return "done";
  if (n >= 1) return "partial";
  return "empty";
}

// SEC-D2 defense-in-depth: usuń znaki, które NIGDY nie są legalne w polach nazwa/firma/adres/beta
// i które łamią atrybut HTML przy renderze (< > "). Apostrof ' ZOSTAJE (np. „O'Brien").
// Główny fix XSS jest we froncie (escape atrybutowy w portal.html); to druga warstwa na wejściu.
function stripHtmlBreakers(v: string): string {
  return v.replace(/[<>"]/g, "");
}

async function intakeRow(sb: ReturnType<typeof createClient>, projectId: string, section: string) {
  const { data } = await sb.from("wfa_intake").select("data, status").eq("project_id", projectId).eq("section", section).maybeSingle();
  return data as { data: Record<string, any>; status: string } | null;
}
async function intakeFiles(sb: ReturnType<typeof createClient>, projectId: string, section: string) {
  const { data } = await sb.from("wfa_intake_files")
    .select("id, filename, size_bytes, mime, storage_path, created_at")
    .eq("project_id", projectId).eq("section", section)
    .order("created_at", { ascending: true });
  return (data || []) as Array<Record<string, any>>;
}
async function stripeStatus(sb: ReturnType<typeof createClient>, projectId: string) {
  const { data: step } = await sb.from("wfa_steps").select("data").eq("project_id", projectId).eq("step_key", "stripe_kyc").maybeSingle();
  const cl: Array<{ t?: string; done?: boolean }> =
    (step?.data && Array.isArray((step.data as any).checklist)) ? (step.data as any).checklist : [];
  const doneOf = (pred: (t: string) => boolean) => cl.some((i) => i && pred(String(i.t || "")) && i.done === true);
  return {
    kyc_done: doneOf((t) => t.startsWith("KYC ukończone")),
    blik_active: doneOf((t) => t.includes("BLIK")),
  };
}
async function upsertMaterialy(sb: ReturnType<typeof createClient>, projectId: string, data: Record<string, any>, status: string) {
  await sb.from("wfa_intake").upsert(
    { project_id: projectId, section: "materialy", data: { links: String(data.links || ""), note: String(data.note || "") }, status, updated_at: new Date().toISOString() },
    { onConflict: "project_id,section" },
  );
}

// Idempotentne odhaczenie pozycji „Dane otrzymane" w kroku dane_operatora (wzorzec markClientEntered).
// Tekst = klucz deduplikacji checklisty — VERBATIM z WS.dane_operatora.check.
const DANE_OTRZYMANE_ITEM = "Dane otrzymane";
async function markDaneOtrzymane(sb: ReturnType<typeof createClient>, projectId: string): Promise<void> {
  const { data: step } = await sb.from("wfa_steps").select("id, data").eq("project_id", projectId).eq("step_key", "dane_operatora").maybeSingle();
  if (!step) return;
  const data = (step.data && typeof step.data === "object") ? step.data as Record<string, unknown> : {};
  const checklist: { t: string; done: boolean }[] = Array.isArray(data.checklist) ? [...(data.checklist as [])] : [];
  const idx = checklist.findIndex((i) => i && i.t === DANE_OTRZYMANE_ITEM);
  if (idx >= 0 && checklist[idx].done === true) return; // już odhaczone — no-op
  if (idx >= 0) checklist[idx] = { ...checklist[idx], done: true };
  else checklist.push({ t: DANE_OTRZYMANE_ITEM, done: true });
  await sb.from("wfa_steps").update({ data: { ...data, checklist } }).eq("id", step.id);
  await sb.from("wfa_activities").insert({
    project_id: projectId,
    actor: "client",
    action: "intake",
    description: "Klient przesłał materiały — pozycja „Dane otrzymane” (krok Dane operatora) odhaczona automatycznie.",
  });
}

function firmaFrom(p: Record<string, any>): Record<string, string> {
  const f = (p.contract_fields && typeof p.contract_fields === "object") ? p.contract_fields : {};
  return {
    full_name: String(f.full_name || p.customer_name || ""),
    company: String(f.company || ""),
    nip: String(f.nip || ""),
    street: String(f.street || ""),
    postal: String(f.postal || ""),
    city: String(f.city || ""),
    phone: String(f.phone || p.customer_phone || ""),
  };
}

// intake_admin — dane wszystkich kart + signed URLs (1h) do plików. Gate: verifyTeamMember (wyżej).
async function intakeAdmin(sb: ReturnType<typeof createClient>, p: Record<string, any>): Promise<Response> {
  const projectId = p.id;
  const [matRow, betaRow, matFiles, stripe] = await Promise.all([
    intakeRow(sb, projectId, "materialy"),
    intakeRow(sb, projectId, "beta"),
    intakeFiles(sb, projectId, "materialy"),
    stripeStatus(sb, projectId),
  ]);
  const signedMap = await signPaths(sb, INTAKE_BUCKET, matFiles.map((x) => x.storage_path));
  const files = matFiles.map((x) => ({ id: x.id, filename: x.filename, size_bytes: x.size_bytes, mime: x.mime, created_at: x.created_at, url: signedMap[x.storage_path] || null }));
  const matData = matRow?.data || {};
  const betaPeople = Array.isArray(betaRow?.data?.people) ? betaRow!.data.people : [];
  const firmaData = firmaFrom(p);
  return json({
    sections: {
      firma: { data: firmaData, status: firmaStatus(firmaData) },
      materialy: { data: { links: String(matData.links || ""), note: String(matData.note || "") }, files, status: materialyStatus(matData, files.length > 0) },
      stripe: { acct_created: !!String(p.stripe_account_id || "").trim(), kyc_done: stripe.kyc_done, blik_active: stripe.blik_active },
      beta: { data: { people: betaPeople }, status: betaStatus(betaPeople) },
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // Limit rozmiaru body (10 kB) — czytamy surowo, dopiero potem parsujemy.
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  if (raw.length > 10240) return json({ error: "payload_too_large" }, 413);

  let body: {
    token?: string;
    password?: string;
    action?: string;
    fields?: Record<string, unknown>;
    preview?: boolean;
    section?: string;
    data?: Record<string, unknown>;
    filename?: string;
    size_bytes?: number;
    mime?: string;
    path?: string;
    id?: string;
  };
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const token = (body.token || "").trim();
  const password = (body.password || "").trim();
  const preview = body.preview === true; // podgląd admina „oczami klienta"
  const action = (body.action || "").trim();
  if (!/^[0-9a-f]{32}$/i.test(token)) {
    await sleep(300); // tania mitygacja brute-force
    return json({ error: "unauthorized" }, 401);
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Tryb PODGLĄDU: JWT członka zespołu zamiast hasła klienta. READ-ONLY (zero zapisów),
  // działa NAWET gdy hasło portalu nie jest jeszcze ustawione — sens: Tomek weryfikuje
  // widok klienta PRZED przekazaniem dostępu. JWT idzie w #hashu linku (nie w query/logach).
  let readonly = false;
  if (preview) {
    const member = await verifyTeamMember(req, sb);
    if (!member) {
      await sleep(300);
      return json({ error: "unauthorized" }, 401);
    }
    readonly = true;
  }

  const { data: p } = await sb
    .from("wfa_projects")
    .select(
      "id, name, customer_name, customer_email, customer_phone, status, deadline_at, client_password_hash, app_url, domain, landing_url, fee_percent, unique_token, stripe_account_id, contract_status, contract_fields, contract_custom_html, contract_sent_at, contract_final_path, spar_session_id, changelog_seen_at",
    )
    .eq("unique_token", token)
    .maybeSingle();

  if (!p) {
    await sleep(300);
    return json({ error: "unauthorized" }, 401);
  }

  // ============ INTAKE: panel administratora (dane od klienta + signed URLs) ============
  // Gate = CZŁONEK ZESPOŁU (team JWT), NIE hasło klienta — panel /tn-app/projekt.html wywołuje
  // tę akcję z sesyjnym JWT. Read-only (v1: admin nie edytuje). PRZED bramką hasła klienta.
  if (action === "intake_admin") {
    const member = await verifyTeamMember(req, sb);
    if (!member) {
      await sleep(300);
      return json({ error: "unauthorized" }, 401);
    }
    return await intakeAdmin(sb, p as Record<string, any>);
  }

  // ============ FIRST-VISIT: stan bramki (czy klient musi ustawić hasło) ============
  // Bez hasła i bez preview — jedyna informacja to boolean „czy portal wymaga ustawienia hasła".
  // Token 32-hex jest sekretem dostępowym; nieznany token dostał już 401 wyżej.
  if (action === "portal_state") {
    return json({
      needs_setup: !p.client_password_hash,
      name: (p.name || "").trim() || "Twoja aplikacja",
    });
  }

  // ============ FIRST-VISIT: klient sam ustawia hasło do portalu ============
  // Gate: token poprawny (sprawdzony wyżej) ORAZ hash JESZCZE NULL. Ta ścieżka NIGDY nie
  // nadpisuje istniejącego hasła (reset robi Tomek w panelu → hash=NULL). Atomowość przez
  // warunkowy UPDATE ...is('client_password_hash', null) — obrona przed wyścigiem/podwójnym setem.
  // Hasło NIGDY nie trafia do logów.
  if (action === "set_password") {
    if (preview) return json({ error: "preview_readonly" }, 403);
    const gate = await throttleGate(sb, token);
    if (gate.locked) {
      return json({ error: "too_many_attempts", retry_after: gate.retryAfter }, 429, { "Retry-After": String(gate.retryAfter) });
    }
    if (p.client_password_hash) return json({ error: "already_set" }, 409);
    const np = (body.password || "").trim();
    if (np.length < 8) {
      await throttleFail(sb, token);
      await sleep(200);
      return json({ error: "validation", messages: ["Hasło musi mieć min. 8 znaków."] }, 400);
    }
    if (np.length > 200) return json({ error: "validation", messages: ["Hasło jest za długie."] }, 400);
    const hash = await sha256Hex(np);
    const { data: updated, error: upErr } = await sb
      .from("wfa_projects")
      .update({ client_password_hash: hash })
      .eq("id", p.id)
      .is("client_password_hash", null)
      .select("id");
    if (upErr) return json({ error: "save_failed" }, 500);
    if (!updated || (updated as unknown[]).length === 0) return json({ error: "already_set" }, 409);
    throttleClear(sb, token).catch(() => {});
    await sb.from("wfa_activities").insert({
      project_id: p.id,
      actor: "client",
      action: "portal_set_password",
      description: "Klient ustawił własne hasło do portalu przy pierwszym wejściu.",
    });
    return json({ ok: true });
  }

  // Ścieżka KLIENTA (nie podgląd): hasło (SHA-256) obowiązkowe. Hasło nieustawione =
  // portal czeka aż klient ustawi hasło przy pierwszym wejściu (akcja set_password wyżej).
  if (!preview) {
    // SEC-D FAIL #2: throttling per-token. Zablokowany token -> 429 (bez porównania hasła).
    const gate = await throttleGate(sb, token);
    if (gate.locked) {
      return json({ error: "too_many_attempts", retry_after: gate.retryAfter }, 429, { "Retry-After": String(gate.retryAfter) });
    }
    if (!password || password.length > 200 || !p.client_password_hash) {
      await throttleFail(sb, token);
      await sleep(300);
      return json({ error: "unauthorized" }, 401);
    }
    const hash = await sha256Hex(password);
    if (hash !== String(p.client_password_hash).toLowerCase()) {
      await throttleFail(sb, token);
      await sleep(300);
      return json({ error: "unauthorized" }, 401);
    }
    // Poprawne hasło -> reset licznika throttlingu (fire-and-forget).
    throttleClear(sb, token).catch(() => {});
    // PIERWSZE WEJŚCIE KLIENTA (nie podgląd admina): auto-odhacz pozycję
    // „Klient wszedł do portalu / potwierdził" w kroku kickoff + wpis do activity.
    // Fire-and-forget — nie może blokować ani wywalać odpowiedzi portalu.
    markClientEntered(sb, p.id).catch((e) => console.warn("[wfa-portal] markClientEntered:", e));
  }

  // ============ CHANGELOG: „Co nowego" dla klienta (whitelist kolumn = VIEW changelog_public) ============
  // Zwraca TYLKO opublikowane wpisy public dla projektu + globalne platformy. VIEW nie oddaje
  // admin_note/commit_sha/source_* (RLS chroni wiersz nie kolumny → osobny VIEW). Read = OK w preview.
  if (action === "changelog_feed") {
    const { data: rows } = await sb
      .from("changelog_public")
      .select("id, public_category, area, title, public_summary, media_url, cta_url, version, published_at")
      .or(`project_id.eq.${p.id},project_id.is.null`)
      .order("published_at", { ascending: false })
      .limit(100);
    const seen = p.changelog_seen_at ? new Date(String(p.changelog_seen_at)).getTime() : 0;
    const entries = (rows || []).map((r: Record<string, any>) => ({
      ...r,
      is_new: seen === 0 ? true : new Date(String(r.published_at)).getTime() > seen,
    }));
    const unread = entries.filter((e: Record<string, any>) => e.is_new).length;
    return json({ entries, unread, seen_at: p.changelog_seen_at || null });
  }

  // ============ CHANGELOG: oznacz „przeczytane" (zeruje badge). Blokada w podglądzie admina. ============
  if (action === "changelog_seen") {
    if (readonly) return json({ error: "preview_readonly" }, 403);
    await sb.from("wfa_projects").update({ changelog_seen_at: new Date().toISOString() }).eq("id", p.id);
    return json({ ok: true });
  }

  // ============ UMOWA: metadane ============
  if (action === "contract_meta") {
    let final_url: string | null = null;
    if (p.contract_final_path) {
      const { data: pub } = sb.storage.from("attachments").getPublicUrl(String(p.contract_final_path));
      final_url = pub?.publicUrl || null;
    }
    return json({
      contract_status: p.contract_status || "brak",
      fields: p.contract_fields || {},
      has_final: !!p.contract_final_path,
      final_url,
      name: (p.name || "").trim() || "Twoja aplikacja",
      customer_name: p.customer_name || null,
      customer_email: p.customer_email || null,
    });
  }

  // ============ UMOWA: zapis danych klienta ============
  if (action === "contract_data") {
    if (readonly) return json({ error: "preview_readonly" }, 403); // podgląd admina nie zapisuje
    if (p.contract_status !== "dane_klienta") {
      return json({ error: "not_allowed_now" }, 409);
    }
    const inp = (body.fields || {}) as Record<string, string>;
    const clip = (v: unknown) => String(v == null ? "" : v).trim();
    const full_name = clip(inp.full_name);
    const company = clip(inp.company);
    const nip = clip(inp.nip).replace(/[\s-]/g, "");
    const street = clip(inp.street);
    const postal = clip(inp.postal);
    const city = clip(inp.city);

    const errs: string[] = [];
    if (!full_name) errs.push("Podaj imię i nazwisko.");
    if (!street) errs.push("Podaj ulicę i numer.");
    if (!city) errs.push("Podaj miejscowość.");
    if (postal && !/^\d{2}-\d{3}$/.test(postal)) errs.push("Kod pocztowy w formacie NN-NNN.");
    if (!postal) errs.push("Podaj kod pocztowy.");
    if (company && !nip) errs.push("Podaj NIP firmy.");
    if (nip && !/^\d{10}$/.test(nip)) errs.push("NIP musi mieć 10 cyfr.");
    for (const [k, v] of Object.entries({ full_name, company, street, postal, city })) {
      if (v.length > 200) errs.push(`Pole „${k}" jest za długie (max 200 znaków).`);
    }
    if (errs.length) return json({ error: "validation", messages: errs }, 400);

    const prevFields = (p.contract_fields as Record<string, unknown>) || {};
    const contract_fields = { ...prevFields, full_name, company, nip, street, postal, city };

    const update: Record<string, unknown> = {
      contract_fields,
      contract_status: "do_podpisu",
    };
    if (full_name && !((p.customer_name || "").trim())) update.customer_name = full_name;

    const { error: upErr } = await sb.from("wfa_projects").update(update).eq("id", p.id);
    if (upErr) return json({ error: "save_failed" }, 500);

    await sb.from("wfa_activities").insert({
      project_id: p.id,
      actor: "client",
      action: "contract_data",
      description: "Klient uzupełnił dane do umowy (gotowa do podpisu).",
    });
    return json({ ok: true });
  }

  // ============ UMOWA: render HTML w locie ============
  if (action === "contract_html") {
    if (!["do_podpisu", "podpisana_klient", "podpisana"].includes(String(p.contract_status))) {
      return json({ error: "not_allowed_now" }, 409);
    }
    let rawHtml = String(p.contract_custom_html || "");
    if (!rawHtml) {
      try {
        const resp = await fetch(TEMPLATE_URL);
        if (!resp.ok) throw new Error("template_fetch_failed");
        rawHtml = await resp.text();
      } catch {
        return json({ error: "template_unavailable" }, 502);
      }
    }
    // Dane wykonawcy z settings (text = JSON). Brak klucza → placeholdery zostają.
    let wyk: { nazwa?: string; nip?: string; adres?: string } | null = null;
    try {
      const { data: s } = await sb.from("settings").select("value").eq("key", "aplikacja_wykonawca_dane").maybeSingle();
      if (s && s.value) wyk = typeof s.value === "string" ? JSON.parse(s.value) : s.value;
    } catch { /* zostaw placeholdery */ }

    const html = renderContractHtml(rawHtml, p as Record<string, unknown>, wyk);
    // Informacyjnie znaczymy moment generacji (nie zapisujemy wyniku). W podglądzie admina
    // NIE stemplujemy — read-only nie może zostawiać śladów w danych klienta.
    if (!readonly) {
      await sb.from("wfa_projects").update({ contract_generated_at: new Date().toISOString() }).eq("id", p.id);
    }
    return json({ html });
  }

  // ============ INTAKE „Do uzupełnienia" — akcje klienta (za bramką hasła/preview) ============
  const readonlyErr = () => json({ error: "podgląd — tylko odczyt" }, 403);

  if (action === "intake_get") {
    const [matRow, betaRow, matFiles, stripe] = await Promise.all([
      intakeRow(sb, p.id, "materialy"),
      intakeRow(sb, p.id, "beta"),
      intakeFiles(sb, p.id, "materialy"),
      stripeStatus(sb, p.id),
    ]);
    const matData = matRow?.data || {};
    const files = matFiles.map((x) => ({ id: x.id, filename: x.filename, size_bytes: x.size_bytes, created_at: x.created_at }));
    const betaPeople = Array.isArray(betaRow?.data?.people) ? betaRow!.data.people : [];
    const firmaData = firmaFrom(p as Record<string, any>);
    const onboard_url = `${ONBOARD_URL}?project=${encodeURIComponent(p.id)}&t=${encodeURIComponent(String(p.unique_token || ""))}`;
    return json({
      sections: {
        firma: { data: firmaData, status: firmaStatus(firmaData) },
        materialy: { data: { links: String(matData.links || ""), note: String(matData.note || "") }, files, status: materialyStatus(matData, files.length > 0) },
        stripe: { acct_created: !!String(p.stripe_account_id || "").trim(), kyc_done: stripe.kyc_done, blik_active: stripe.blik_active, onboard_url },
        beta: { data: { people: betaPeople }, status: betaStatus(betaPeople) },
      },
    });
  }

  if (action === "intake_save") {
    if (readonly) return readonlyErr();
    const section = String(body.section || "").trim();
    const inp = (body.data && typeof body.data === "object") ? body.data as Record<string, any> : {};

    if (section === "firma") {
      const clip = (v: unknown) => String(v == null ? "" : v).trim();
      const clipT = (v: unknown) => stripHtmlBreakers(clip(v)); // pola tekstowe → dodatkowo bez < > "
      const full_name = clipT(inp.full_name);
      const company = clipT(inp.company);
      const nip = clip(inp.nip).replace(/\D/g, "");
      const street = clipT(inp.street);
      const postal = clip(inp.postal);
      const city = clipT(inp.city);
      const phone = clip(inp.phone);
      const errs: string[] = [];
      if (nip && nip.length !== 10) errs.push("NIP musi mieć 10 cyfr.");
      if (postal && !/^\d{2}-\d{3}$/.test(postal)) errs.push("Kod pocztowy w formacie NN-NNN.");
      if (phone && !/^[\d+\s]{7,15}$/.test(phone)) errs.push("Telefon: 7–15 znaków (cyfry, +, spacje).");
      for (const [k, v] of Object.entries({ full_name, company, street, postal, city })) {
        if (v.length > 200) errs.push(`Pole „${k}" jest za długie (max 200 znaków).`);
      }
      if (errs.length) return json({ error: "validation", messages: errs }, 400);

      const prev = (p.contract_fields && typeof p.contract_fields === "object") ? p.contract_fields as Record<string, unknown> : {};
      const contract_fields = { ...prev, full_name, company, nip, street, postal, city, phone };
      const update: Record<string, unknown> = { contract_fields };
      // NIE dotykamy contract_status ani flow umowy — tylko dane. customer_name gdy puste (spójne z contract_data).
      if (full_name && !String(p.customer_name || "").trim()) update.customer_name = full_name;
      const { error } = await sb.from("wfa_projects").update(update).eq("id", p.id);
      if (error) return json({ error: "save_failed" }, 500);
      await sb.from("wfa_activities").insert({ project_id: p.id, actor: "client", action: "intake", description: "Klient uzupełnił: Dane firmy" });
      return json({ ok: true, status: firmaStatus(contract_fields) });
    }

    if (section === "materialy") {
      const links = String(inp.links == null ? "" : inp.links).trim();
      const note = String(inp.note == null ? "" : inp.note).trim();
      if (links.length > 4000 || note.length > 4000) return json({ error: "validation", messages: ["Tekst jest za długi."] }, 400);
      const files = await intakeFiles(sb, p.id, "materialy");
      const status = materialyStatus({ links, note }, files.length > 0);
      await upsertMaterialy(sb, p.id, { links, note }, status);
      await sb.from("wfa_activities").insert({ project_id: p.id, actor: "client", action: "intake", description: "Klient uzupełnił: Materiały do aplikacji" });
      if (links || files.length > 0) await markDaneOtrzymane(sb, p.id); // PIERWSZA zawartość → odhacz krok (idempotentne)
      return json({ ok: true, status });
    }

    if (section === "beta") {
      const raw = Array.isArray(inp.people) ? inp.people : [];
      const people = raw.slice(0, 15).map((pp: any) => {
        const o: Record<string, string> = {
          name: stripHtmlBreakers(String(pp?.name == null ? "" : pp.name).trim()).slice(0, 120),
          contact: stripHtmlBreakers(String(pp?.contact == null ? "" : pp.contact).trim()).slice(0, 160),
        };
        const n = stripHtmlBreakers(String(pp?.note == null ? "" : pp.note).trim()).slice(0, 200);
        if (n) o.note = n;
        return o;
      }).filter((pp) => pp.name || pp.contact);
      const status = betaStatus(people);
      await sb.from("wfa_intake").upsert(
        { project_id: p.id, section: "beta", data: { people }, status, updated_at: new Date().toISOString() },
        { onConflict: "project_id,section" },
      );
      await sb.from("wfa_activities").insert({ project_id: p.id, actor: "client", action: "intake", description: "Klient uzupełnił: Osoby na start (beta)" });
      return json({ ok: true, status });
    }
    return json({ error: "bad_section" }, 400);
  }

  if (action === "intake_upload_init") {
    if (readonly) return readonlyErr();
    const filename = String(body.filename || "").trim();
    const size = Number(body.size_bytes || 0);
    const ext = (filename.split(".").pop() || "").toLowerCase();
    if (!filename || !INTAKE_ALLOWED_EXT.includes(ext)) return json({ error: "bad_type", message: "Niedozwolony typ pliku." }, 400);
    if (!(size > 0) || size > INTAKE_MAX_BYTES) return json({ error: "too_large", message: "Maksymalny rozmiar pliku to 25 MB." }, 400);
    const { count } = await sb.from("wfa_intake_files").select("id", { count: "exact", head: true }).eq("project_id", p.id);
    if ((count || 0) >= INTAKE_MAX_FILES) return json({ error: "too_many", message: `Osiągnięto limit ${INTAKE_MAX_FILES} plików.` }, 400);
    const safe = filename.normalize("NFKD").replace(/[^\w.\-]+/g, "_").replace(/_{2,}/g, "_").replace(/^_+|_+$/g, "").slice(0, 80) || "plik";
    const uid = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    const path = `${p.id}/${uid}-${safe}`;
    const { data: signed, error } = await sb.storage.from(INTAKE_BUCKET).createSignedUploadUrl(path);
    if (error || !signed) return json({ error: "sign_failed" }, 500);
    return json({ upload_url: (signed as any).signedUrl, token: (signed as any).token, path: (signed as any).path });
  }

  if (action === "intake_upload_done") {
    if (readonly) return readonlyErr();
    const path = String(body.path || "").trim();
    const filename = String(body.filename || "").trim();
    const size = Number(body.size_bytes || 0);
    const mime = String(body.mime || "").trim();
    if (!path.startsWith(`${p.id}/`)) return json({ error: "bad_path" }, 400);
    const base = path.slice(String(p.id).length + 1);
    const { data: listed } = await sb.storage.from(INTAKE_BUCKET).list(String(p.id), { limit: 100, search: base });
    if (!(listed || []).some((o: any) => o.name === base)) return json({ error: "not_uploaded" }, 409);
    const { data: fileRow, error } = await sb.from("wfa_intake_files").insert({
      project_id: p.id, section: "materialy", storage_path: path, filename: filename || base, size_bytes: size || null, mime: mime || null,
    }).select("id, filename, size_bytes, created_at").single();
    if (error) return json({ error: "save_failed" }, 500);
    const row = await intakeRow(sb, p.id, "materialy");
    const data = row?.data || {};
    const status = materialyStatus(data, true);
    await upsertMaterialy(sb, p.id, data, status);
    await markDaneOtrzymane(sb, p.id);
    await sb.from("wfa_activities").insert({ project_id: p.id, actor: "client", action: "intake", description: `Klient wgrał plik: ${filename || base}` });
    return json({ ok: true, status, file: fileRow });
  }

  if (action === "intake_file_delete") {
    if (readonly) return readonlyErr();
    const id = String(body.id || "").trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "bad_id" }, 400);
    const { data: rec } = await sb.from("wfa_intake_files").select("id, storage_path, project_id, filename").eq("id", id).maybeSingle();
    if (!rec || String((rec as any).project_id) !== String(p.id)) return json({ error: "not_found" }, 404);
    await sb.storage.from(INTAKE_BUCKET).remove([(rec as any).storage_path]);
    await sb.from("wfa_intake_files").delete().eq("id", id);
    const files = await intakeFiles(sb, p.id, "materialy");
    const row = await intakeRow(sb, p.id, "materialy");
    const data = row?.data || {};
    const status = materialyStatus(data, files.length > 0);
    await upsertMaterialy(sb, p.id, data, status);
    await sb.from("wfa_activities").insert({ project_id: p.id, actor: "client", action: "intake", description: `Klient usunął plik: ${(rec as any).filename}` });
    return json({ ok: true, status, files: files.map((x) => ({ id: x.id, filename: x.filename, size_bytes: x.size_bytes, created_at: x.created_at })) });
  }

  // ============ DOMYŚLNIE: status projektu (kamienie milowe) ============
  const [defsQ, stepsQ, actQ] = await Promise.all([
    sb.from("wfa_step_defs").select("key, stage, stage_label, sort, milestone_label, owner")
      .eq("active", true).order("stage").order("sort"),
    sb.from("wfa_steps").select("step_key, status, completed_at")
      .eq("project_id", p.id).range(0, 999),
    // Dowód życia: kiedy ostatnio coś się działo (bez treści technicznej — sama data).
    sb.from("wfa_activities").select("created_at")
      .eq("project_id", p.id).order("created_at", { ascending: false }).limit(1),
  ]);
  const defs = defsQ.data || [];
  const steps = stepsQ.data || [];
  const stepFor = (key: string) => steps.find((s) => s.step_key === key);
  const lastActivityAt = actQ.data?.[0]?.created_at || null;

  // Postęp + etapy (bez nazw pojedynczych kroków — klient widzi poziom etapu)
  const countable = steps.filter((s) => s.status !== "skipped");
  const done = countable.filter((s) => s.status === "done").length;
  const pct = countable.length ? Math.round((done / countable.length) * 100) : 0;

  const stageMap: Record<number, { label: string; done: number; total: number }> = {};
  for (const d of defs) {
    const st = stepFor(d.key);
    if (st && st.status === "skipped") continue;
    stageMap[d.stage] = stageMap[d.stage] || { label: d.stage_label, done: 0, total: 0 };
    stageMap[d.stage].total++;
    if (st && st.status === "done") stageMap[d.stage].done++;
  }
  const stages = Object.keys(stageMap).map(Number).sort((a, b) => a - b).map((n) => ({
    num: n,
    label: stageMap[n].label,
    done: stageMap[n].done,
    total: stageMap[n].total,
    complete: stageMap[n].total > 0 && stageMap[n].done === stageMap[n].total,
  }));
  const current = stages.find((s) => !s.complete);

  // Kamienie milowe: kroki z milestone_label + status done (z datą)
  const milestones = defs
    .filter((d) => d.milestone_label)
    .map((d) => {
      const st = stepFor(d.key);
      return {
        label: d.milestone_label,
        done: !!(st && st.status === "done"),
        at: st && st.status === "done" ? st.completed_at : null,
      };
    });

  // Bieżący krok = pierwszy niedokończony (nie done/skipped) wg kolejności. Z niego bierzemy
  // WŁAŚCICIELA ruchu (my vs klient) i ludzki opis etapu (klient nie widzi nazw kroków).
  let currentDef: Record<string, unknown> | null = null;
  for (const d of defs) {
    const st = stepFor(d.key);
    if (!st || (st.status !== "done" && st.status !== "skipped")) { currentDef = d; break; }
  }
  const currentOwner = currentDef ? String(currentDef.owner || "admin") : null;
  const currentStage = currentDef ? Number(currentDef.stage) : null;

  // Opis etapu po ludzku (bez żargonu) — „co teraz robimy".
  const STAGE_HINT: Record<number, string> = {
    1: "Ustalamy zakres, nazwę i przygotowujemy fundamenty Twojej aplikacji.",
    2: "Stawiamy techniczne fundamenty — konta, serwery i płatności.",
    3: "Budujemy serce aplikacji — funkcje główne i panele.",
    4: "Dopracowujemy wygląd, stronę i jakość przed startem.",
    5: "Uruchamiamy aplikację i przekazujemy Ci stery.",
  };
  // „Twój ruch" — tylko gdy piłka jest po stronie klienta (owner=client bieżącego kroku).
  const YOUR_MOVE: Record<string, string> = {
    // Sekcja umowy w portalu jest tymczasowo ukryta (wzór w dopracowaniu) — kierujemy do karty Dane firmy.
    umowa: "Uzupełnij dane firmy w sekcji Do uzupełnienia — umowę przygotujemy na ich podstawie i damy Ci znać, gdy będzie gotowa do podpisu.",
    dane_operatora: "Wgraj materiały (cennik, dotychczasowe wyceny) w sekcji Do uzupełnienia — to odblokuje kolejny etap.",
    demo_klienta: "Przetestuj wersję roboczą aplikacji i podziel się uwagami.",
    akcept_klienta: "Sprawdź i zatwierdź zakres oraz nazwę aplikacji.",
    onboarding_op: "Załóż konto w swojej aplikacji na adres " + String(p.customer_email || "(Twój e-mail z tego projektu)") + " — na tym adresie automatycznie dostaniesz uprawnienia operatora (panel zarządzania). Potem przejdziemy razem przez panel.",
    stery: "Zaloguj się do panelu operatora kontem " + String(p.customer_email || "(Twój e-mail z tego projektu)") + " — przekazujemy Ci stery: użytkownicy, płatności, rabaty i statystyki są w Twoich rękach.",
  };
  const yourMove = currentDef && currentOwner === "client"
    ? (YOUR_MOVE[String(currentDef.key)] || "Czekamy na Twoją odpowiedź, żeby ruszyć dalej.")
    : null;

  // Wizja: makiety ze sparingu (spar_sessions.preview_images). Obiekt {widok: url} albo tablica.
  const mockups: Array<{ url: string; view: string }> = [];
  if (p.spar_session_id) {
    try {
      const { data: sess } = await sb
        .from("spar_sessions").select("preview_images").eq("id", p.spar_session_id).maybeSingle();
      const pi = sess?.preview_images;
      if (Array.isArray(pi)) {
        pi.forEach((u: unknown, i: number) => {
          if (typeof u === "string") mockups.push({ url: u, view: "widok " + (i + 1) });
          else if (u && typeof u === "object" && (u as any).url) mockups.push({ url: (u as any).url, view: (u as any).view || (u as any).label || ("widok " + (i + 1)) });
        });
      } else if (pi && typeof pi === "object") {
        for (const [k, v] of Object.entries(pi)) if (typeof v === "string") mockups.push({ url: v, view: k });
      }
    } catch { /* brak makiet = pomijamy sekcję */ }
  }

  return json({
    name: (p.name || "").trim() || "Twoja aplikacja",
    customer_name: p.customer_name || null,
    progress: pct,
    stages,
    current_stage: current ? current.label : "Wszystko ukończone",
    current_stage_hint: currentStage ? (STAGE_HINT[currentStage] || null) : null,
    current_owner: currentOwner,
    your_move: yourMove,
    last_activity_at: lastActivityAt,
    milestones,
    mockups,
    deadline_at: p.deadline_at || null,
    // Jeden punkt wejścia partnera: URL apki dla przycisku „Otwórz swoją aplikację" w portalu.
    // Publiczny URL (NIE sekret), zawsze z projektu wiązanego z tokenem. Fallback: https:// + domena.
    app_url: p.app_url || (p.domain ? "https://" + String(p.domain).replace(/^https?:\/\//i, "").replace(/\/+$/, "") : null),
    landing_url: p.landing_url || null,
    contract_status: p.contract_status || "brak",
  });
});

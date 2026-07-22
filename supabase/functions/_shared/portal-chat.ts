// _shared/portal-chat.ts — WSPÓLNY handler czatów portalowych klienta (vision + markery).
//
// Konsolidacja bliźniaków wfa-test-chat („spowiednik testów") i wf2-ads-guide („przewodnik AI").
// Handler owns to, co u obu IDENTYCZNE: CORS, limit payloadu, walidacja tokenu ^[0-9a-f]{32}$,
// podgląd zespołu (verifyTeamMember → readonly), gate hasła portalu (SHA-256 + portal-throttle),
// kill-switch FAIL-OPEN, rate-limit per projekt, budowa transkryptu z vision, wywołanie OpenAI
// (openaiFetchRetry), zapis wiadomości i signed URLs. Wszystko, co się różni (prompty, markery,
// akcje admina, kształt odpowiedzi, model sesji/rund) siedzi w KONFIGURACJI per funkcja — servePortalChat
// niczego z zachowania nie zmienia (kontrakt 1:1).
//
// Kontrakt: patrz PortalChatConfig niżej. buildContextBlock = plumbing na przyszłość (body.context →
// dodatkowy system message); dziś obie funkcje zwracają null (zero zmiany zachowania).

import { createClient } from "jsr:@supabase/supabase-js@2";
import { openaiFetchRetry } from "./openai-fetch.ts";
import { signPaths, verifyTeamMember } from "./admin-files.ts";
import { throttleClear, throttleFail, throttleGate } from "./portal-throttle.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json", ...(extraHeaders || {}) } });
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Zrzuty w kolumnie jsonb bywają stringami albo obiektami {path}. Wyciągnij same ścieżki.
export const pathsOf = (att: unknown): string[] =>
  Array.isArray(att) ? att.map((a) => (typeof a === "string" ? a : (a && (a as { path?: string }).path))).filter(Boolean) as string[] : [];

// Cennik USD/1M tokenów (log kosztu do edge logs; brak dedykowanej tabeli ai_usage).
const PRICES: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-5.1": { input: 1.25, output: 10 },
};
function costUsd(model: string, inTok: number, outTok: number): number {
  const p = PRICES[model] || PRICES["gpt-4o"];
  return (inTok * p.input + outTok * p.output) / 1_000_000;
}

// Kill-switch FAIL-OPEN: gramy DALEJ przy każdym błędzie/braku klucza; ubijamy TYLKO gdy jawnie false.
export async function isKilled(sb: SB, key: string): Promise<boolean> {
  try {
    const { data } = await sb.from("settings").select("value").eq("key", key).maybeSingle();
    if (!data) return false;
    const v = String((data as { value?: unknown }).value ?? "").trim().toLowerCase();
    return v === "false" || v === "0" || v === "off" || v === "no";
  } catch {
    return false; // fail-open
  }
}

// ── Transkrypt / wiadomości ─────────────────────────────────────────────────────

export interface TranscriptEntry { role: string; content: string; images?: string[] }

// Wywołanie OpenAI (non-streaming). Ostatnia tura usera może nieść signed URLs zrzutów (vision).
async function callOpenAI(ctx: Ctx, system: string, transcript: TranscriptEntry[], label: string): Promise<{ text: string; inTok: number; outTok: number } | null> {
  const cfg = ctx.cfg;
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) { console.error(`[${cfg.label}] brak OPENAI_API_KEY`); return null; }
  const messages: Any[] = [{ role: "system", content: system }];
  for (const m of transcript) {
    if (m.role === "user" && m.images && m.images.length) {
      const parts: Any[] = [];
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
    body: JSON.stringify({ model: ctx.model, messages, temperature: cfg.temperature, max_tokens: cfg.maxTokens }),
  }, cfg.label);
  if (!res.ok) { console.error(`[${cfg.label}] OpenAI HTTP`, res.status, (await res.text()).slice(0, 300)); return null; }
  const data = await res.json().catch(() => null) as Any;
  const text = data?.choices?.[0]?.message?.content || "";
  const inTok = data?.usage?.prompt_tokens || 0;
  const outTok = data?.usage?.completion_tokens || 0;
  console.log(`[${cfg.label}] ${label} model=${ctx.model} in=${inTok} out=${outTok} cost=$${costUsd(ctx.model, inTok, outTok).toFixed(4)}`);
  return { text, inTok, outTok };
}

// Wiadomości sesji/projektu z podpisanymi URL-ami zrzutów (bucket prywatny). Kolejność rosnąca.
async function loadSignedMessages(ctx: Ctx, filterCol: string, filterVal: string, rangeEnd = 499) {
  const cfg = ctx.cfg;
  const { data: msgs } = await ctx.sb.from(cfg.messagesTable)
    .select(`role, content, ${cfg.imageField}, created_at`)
    .eq(filterCol, filterVal).order("created_at", { ascending: true }).range(0, rangeEnd);
  const allPaths: string[] = [];
  (msgs || []).forEach((m: Any) => pathsOf(m[cfg.imageField]).forEach((pp) => allPaths.push(pp)));
  const signed = await ctx.sign(allPaths);
  return (msgs || []).map((m: Any) => ({
    role: m.role, content: m.content, created_at: m.created_at,
    attachments: pathsOf(m[cfg.imageField]).map((pp) => ({ path: pp, url: signed[pp] || null })),
  }));
}

// ── Built-in akcje ──────────────────────────────────────────────────────────────

// UPLOAD_INIT (zrzut ekranu) — walidacja ext/rozmiar wspólna; guard + ścieżka per funkcja.
async function handleUploadInit(ctx: Ctx): Promise<Response> {
  const { cfg, body } = ctx;
  if (ctx.readonly) return ctx.roErr();
  if (cfg.guard) { const g = await cfg.guard(ctx); if (g) return g; }
  const filename = String(body.filename || "").trim();
  const size = Number(body.size_bytes || 0);
  const ext = (filename.split(".").pop() || "").toLowerCase();
  if (!filename || !cfg.exts.includes(ext)) return json({ error: "bad_type", message: "Dozwolone są tylko obrazy (PNG/JPG/WEBP)." }, 400);
  if (!(size > 0) || size > cfg.maxBytes) return json({ error: "too_large", message: cfg.tooLargeMessage }, 400);
  const uid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const built = await cfg.buildUploadPath(ctx, { uid, ext });
  if (built.error) return built.error;
  const { data: signed, error } = await ctx.sb.storage.from(cfg.bucket).createSignedUploadUrl(built.path);
  if (error || !signed) return json({ error: "sign_failed" }, 500);
  return json({ upload_url: (signed as Any).signedUrl, token: (signed as Any).token, path: (signed as Any).path });
}

// UPLOAD_DONE (potwierdzenie + podgląd miniatury) — identyczne u obu (tylko bucket z konfiguracji).
async function handleUploadDone(ctx: Ctx): Promise<Response> {
  const { cfg, body, projectId } = ctx;
  if (ctx.readonly) return ctx.roErr();
  const path = String(body.path || "").trim();
  if (!path.startsWith(`${projectId}/`)) return json({ error: "bad_path" }, 400);
  const dir = path.slice(0, path.lastIndexOf("/"));
  const base = path.slice(path.lastIndexOf("/") + 1);
  const { data: listed } = await ctx.sb.storage.from(cfg.bucket).list(dir, { limit: 100, search: base });
  if (!(listed || []).some((o: Any) => o.name === base)) return json({ error: "not_uploaded" }, 409);
  const signed = await ctx.sign([path]);
  return json({ ok: true, path, url: signed[path] || null });
}

// MESSAGE (tura rozmowy) — wspólny szkielet: readonly, guard, kill-switch, wejście, rate-limit,
// sesja/scope, zapis usera, transkrypt+vision, kontekst (plumbing), system prompt, OpenAI, markery.
// Ogon (side-effecty markerów + kształt odpowiedzi + zapis asystenta) → cfg.onMarkers.
async function handleMessage(ctx: Ctx): Promise<Response> {
  const { cfg, sb, body, projectId } = ctx;
  if (ctx.readonly) return ctx.roErr();
  if (cfg.guard) { const g = await cfg.guard(ctx); if (g) return g; }
  if (await ctx.isKilled()) return json({ soft: true, reply: cfg.killedReply });

  const userText = String(body.message || "").slice(0, cfg.maxMsgLen).trim();
  const attachIn = (body as Any)[cfg.imageField];
  const attach = Array.isArray(attachIn)
    ? attachIn.filter((x: Any) => typeof x === "string" && x.startsWith(`${projectId}/`)).slice(0, cfg.maxAttachPerMsg)
    : [];
  if (!userText && !attach.length) return json({ error: "empty" }, 400);

  // Rate-limit per projekt (wiadomości usera / godzinę).
  const sinceHour = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await sb.from(cfg.messagesTable).select("id", { count: "exact", head: true })
    .eq("project_id", projectId).eq("role", "user").gte("created_at", sinceHour);
  if ((count || 0) >= cfg.rateLimitPerHour) return json({ soft: true, reply: cfg.rateLimitReply });

  // Sesja/scope (wfa: wiersz wfa_test_sessions; wf2: brak — scope po project_id).
  const scope = await cfg.resolveScope(ctx, { create: true });
  if (scope.error) return scope.error;
  const { session, scopeFields, historyFilter } = scope;

  // Zapis wiadomości usera (z załącznikami bieżącej tury).
  await sb.from(cfg.messagesTable).insert({
    ...scopeFields, project_id: projectId, role: "user", content: userText,
    [cfg.imageField]: attach.map((path: string) => ({ path })),
  });

  // Kontekst modelu: ostatnie N wiadomości. Vision: podpisujemy TYLKO zrzuty z bieżącej (ostatniej) tury.
  const { data: histRows } = await sb.from(cfg.messagesTable)
    .select(`role, content, ${cfg.imageField}, created_at`)
    .eq(historyFilter[0], historyFilter[1]).order("created_at", { ascending: false }).limit(cfg.historyTurns);
  const hist = (histRows || []).reverse();
  const curSigned = attach.length ? await ctx.sign(attach) : {};
  const transcript: TranscriptEntry[] = hist.map((m: Any, idx: number) => {
    const isLast = idx === hist.length - 1;
    const imgs = (m.role === "user" && isLast) ? pathsOf(m[cfg.imageField]).map((pp) => (curSigned as Any)[pp]).filter(Boolean) : [];
    const note = (m.role === "user" && pathsOf(m[cfg.imageField]).length && !imgs.length) ? " [klient dołączył zrzut ekranu]" : "";
    return { role: String(m.role), content: (String(m.content || "")) + note, images: imgs };
  });

  // Kontekst dynamiczny (plumbing na przyszłość): dziś buildContextBlock → null u obu, zero zmiany.
  const ctxBlock = cfg.buildContextBlock ? cfg.buildContextBlock(ctx, body) : null;
  if (typeof ctxBlock === "string" && ctxBlock) transcript.unshift({ role: "system", content: ctxBlock, images: [] });

  const system = await cfg.buildSystemPrompt(ctx);
  const label = cfg.callLabel ? cfg.callLabel(ctx) : `proj=${projectId.slice(0, 8)}`;
  const ai = await ctx.callOpenAI(system, transcript, label);
  if (!ai) return json({ soft: true, reply: cfg.errorReply });

  const { clean, markers } = cfg.parseMarkers(ai.text);
  const insertAssistant = async (content: string) => {
    await sb.from(cfg.messagesTable).insert({ ...scopeFields, project_id: projectId, role: "assistant", content });
  };
  return await cfg.onMarkers(markers, { ...ctx, clean, session, insertAssistant, aiText: ai.text });
}

// ── Konfiguracja / kontekst ───────────────────────────────────────────────────

export interface PortalChatConfig {
  label: string;                         // prefiks logów + label openaiFetchRetry ('wfa-test-chat' | 'wf2-ads-guide')
  loadProject(sb: SB, token: string): Promise<Any | null>; // { id, name, client_password_hash, ... } | null
  // Storage
  bucket: string;
  maxBytes: number;
  exts: string[];
  tooLargeMessage: string;               // komunikat too_large ("… 15 MB." / "… 8 MB.")
  imageField: "images" | "attachments";  // nazwa kolumny jsonb ze zrzutami (i pola body z ścieżkami)
  historyTurns: number;                  // ile ostatnich wiadomości wchodzi do kontekstu modelu
  // Model
  modelEnv: string;
  modelDefault: string;
  maxTokens: number;
  temperature: number;
  // Kill-switch + rate-limit + tabela wiadomości
  killSwitchKey: string;
  rateLimitPerHour: number;
  messagesTable: string;
  maxMsgLen: number;
  maxAttachPerMsg: number;
  // Komunikaty soft (kill/rate/AI-error)
  killedReply: string;
  rateLimitReply: string;
  errorReply: string;
  // Hooki
  loadState?(ctx: Ctx): Promise<Any>;                                 // stan po gate (wfa: {active,curRound,mode})
  guard?(ctx: Ctx): Promise<Response | null>;                         // wspólny gate message/upload_init (wfa: active)
  buildHistory(ctx: Ctx): Promise<Response>;                          // akcja history (kształt per funkcja)
  buildUploadPath(ctx: Ctx, o: { uid: string; ext: string }): Promise<{ path?: string; error?: Response }>;
  resolveScope(ctx: Ctx, o: { create: boolean }): Promise<{ session?: Any; scopeFields?: Any; historyFilter?: [string, string]; error?: Response }>;
  buildSystemPrompt(ctx: Ctx): string | Promise<string>;
  buildContextBlock?(ctx: Ctx, body: Any): string | null;             // plumbing (dziś null)
  parseMarkers(text: string): { clean: string; markers: Any[] };
  onMarkers(markers: Any[], tail: Ctx): Promise<Response>;            // side-effecty + kształt odpowiedzi + zapis asystenta
  callLabel?(ctx: Ctx): string;                                       // etykieta logu OpenAI (default proj=…)
  extraActions?: Record<string, { preAuth?: boolean; run(ctx: Ctx): Promise<Response> }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Ctx = any;

export async function servePortalChat(req: Request, cfg: PortalChatConfig): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let raw: string;
  try { raw = await req.text(); } catch { return json({ error: "bad_request" }, 400); }
  if (raw.length > 200_000) return json({ error: "payload_too_large" }, 413);

  let body: Any;
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

  const project = await cfg.loadProject(sb, token);
  if (!project) { await sleep(300); return json({ error: "unauthorized" }, 401); }
  const projectId = String(project.id);

  // Generyczny kontekst (plumbing): body.context (obiekt) capowany do 4KB po JSON.stringify; nadmiar → ignoruj.
  let context: Any = null;
  if (body.context && typeof body.context === "object") {
    try { if (JSON.stringify(body.context).length <= 4096) context = body.context; } catch { context = null; }
  }

  const ctx: Ctx = { req, sb, body, project, projectId, readonly, preview, action, token, password, cfg, context };
  ctx.model = Deno.env.get(cfg.modelEnv) || cfg.modelDefault;
  ctx.sign = (paths: string[]) => signPaths(sb, cfg.bucket, paths);
  ctx.isKilled = () => isKilled(sb, cfg.killSwitchKey);
  ctx.callOpenAI = (system: string, transcript: TranscriptEntry[], label: string) => callOpenAI(ctx, system, transcript, label);
  ctx.loadSignedMessages = (col: string, val: string, rangeEnd = 499) => loadSignedMessages(ctx, col, val, rangeEnd);
  ctx.roErr = () => json({ error: "podgląd — tylko odczyt" }, 403);
  ctx.json = json;
  ctx.sleep = sleep;
  ctx.pathsOf = pathsOf;

  const extra = cfg.extraActions || {};
  const entry = extra[action];

  // Akcje admina (gate = team JWT wewnątrz handlera) — PRZED bramką hasła klienta.
  if (entry && entry.preAuth) return await entry.run(ctx);

  // Ścieżka klienta: hasło portalu (SHA-256) obowiązkowe; wspólny throttle per-token (jak wfa/wf2-portal).
  if (!preview) {
    const gate = await throttleGate(sb, token);
    if (gate.locked) return json({ error: "too_many_attempts", retry_after: gate.retryAfter }, 429, { "Retry-After": String(gate.retryAfter) });
    if (!password || password.length > 200 || !project.client_password_hash) { await throttleFail(sb, token); await sleep(300); return json({ error: "unauthorized" }, 401); }
    const hash = await sha256Hex(password);
    if (hash !== String(project.client_password_hash).toLowerCase()) { await throttleFail(sb, token); await sleep(300); return json({ error: "unauthorized" }, 401); }
    throttleClear(sb, token).catch(() => {});
  }

  // Stan po gate (dla podglądu i klienta) — wykorzystywany przez akcje klienta.
  ctx.state = cfg.loadState ? await cfg.loadState(ctx) : {};

  // Akcje klienta z konfiguracji (np. end) — po gate.
  if (entry && !entry.preAuth) return await entry.run(ctx);

  // Built-in.
  if (action === "history") return await cfg.buildHistory(ctx);
  if (action === "upload_init") return await handleUploadInit(ctx);
  if (action === "upload_done") return await handleUploadDone(ctx);
  if (action === "message") return await handleMessage(ctx);
  return json({ error: "bad_action" }, 400);
}

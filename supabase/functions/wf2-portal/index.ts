// wf2-portal — portal KLIENTA modułu „Sklepy" (workflow v2, tabele wf2_*).
// Wzorzec 1:1 z wfa-portal: RLS wf2_* = tylko team; klient dostaje dane WYŁĄCZNIE
// przez tę funkcję (token 32-hex z URL = wf2_projects.unique_token + hasło SHA-256
// w client_password_hash). Throttle per-token (wspólna tabela wfa_auth_attempts).
//
// HASŁO first-visit: hash NULL = portal bez hasła. Klient sam ustawia przy pierwszym
// wejściu (akcja set_password; gate: token OK ORAZ hash NULL; NIGDY nie nadpisuje).
// Reset = Tomek czyści hash do NULL w panelu.
//
// Tryb PODGLĄDU admina „oczami klienta": body {preview:true} + Authorization: Bearer <JWT>
// → verifyTeamMember → readonly=true (działa też gdy client_password_hash NULL). Zero zapisów.
//
// Akcje (POST JSON):
//   portal_state → { needs_setup, name }
//   set_password → ustaw hasło TYLKO gdy hash NULL (first-visit)
//   (default)    → pełny stan panelu, SANITYZOWANY PO STRONIE SERWERA (bez pracy AI /
//                  finansów wewnętrznych: żadnych notatek roboczych, dowodów QA, dokumentów)
//   track        → log aktywności klienta (whitelist akcji; portal_visit dedup 30 min)
//   task_save    → zapis pól kroków KLIENCKICH (whitelist pól per krok)
//   task_done    → oznaczenie/cofnięcie kroku klienckiego (scope=project)
//
// Deploy: npx supabase functions deploy wf2-portal --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws

import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyTeamMember } from "../_shared/admin-files.ts";
import { throttleClear, throttleFail, throttleGate } from "../_shared/portal-throttle.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── artefakty: co klient MOŻE zobaczyć ─────────────────────────────────────
// Tylko oglądalne media (obraz/wideo) z PUBLICZNYCH ścieżek. Wykluczamy:
//  • dokumenty i linki (kind doc/link) — tekst roboczy;
//  • artefakty ujawniające PRACĘ AI / fabryki (dowody QA, gate-checki, wzorce) —
//    to wewnętrzny proces, nie deliverable klienta.
const MEDIA_EXT = new Set(["png", "jpg", "jpeg", "webp", "gif", "avif", "mp4", "webm", "mov", "m4v"]);
const ARTIFACT_KIND_BLOCK = new Set(["doc", "link", "proof", "dowod", "gate_check", "wzorzec_ref", "wzorzec_strip"]);
const PRIVATE_BUCKET_HINTS = ["wf2-video", "wf2-docs", "wfa-intake", "wfa-test-shots"];
const SUPA_HOST = "yxmavwkwnfuphjqbelws.supabase.co";
const ARTIFACT_LIMIT = 200;

function isViewableMedia(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;                       // musi być http(s)
  if (/\/storage\/v1\/object\/sign\//i.test(url)) return false;       // signed = prywatny
  if (PRIVATE_BUCKET_HINTS.some((b) => url.includes(`/${b}/`) || url.includes(`/${b}?`))) return false;
  // Supabase Storage: tylko publiczne obiekty; obcy host = przepuszczamy (podgląd zewn.)
  if (url.includes(SUPA_HOST) && !url.includes("/object/public/")) return false;
  const clean = url.split("?")[0].split("#")[0];
  const ext = (clean.split(".").pop() || "").toLowerCase();
  return MEDIA_EXT.has(ext);
}

// ── pola klienckie per krok (whitelist twarda; klucz spoza = 400) ──────────
const CLIENT_FIELD_WHITELIST: Record<string, string[]> = {
  pl_konto_klient: ["platform_email"],
  pl_dane:         ["company", "nip", "address", "nrb", "email_kontakt"],
  ads_konto:       ["bm_id", "partner_id", "ad_account_id", "fanpage_url"],
  ads_strona:      ["fanpage_url", "instagram_url"],
  ads_budzet:      ["amount", "method", "confirmation"],
};

const TRACK_ACTIONS = new Set(["portal_visit", "open_step", "media_view", "link_click"]);

// tt: max 5 grywalnych/otwieralnych wpisów. Origin (bud_tt_products.tiktok_url) jako link
// PIERWSZY (gwarantuje obecność), potem kuracja videos_curated.items (keep/PASS) wg kolejnosci.
function buildTiktoks(tt: Record<string, any> | undefined): Array<{ url: string; plays: number | null; mp4: string | null; poster: string | null }> {
  const out: Array<{ url: string; plays: number | null; mp4: string | null; poster: string | null }> = [];
  const push = (url: unknown, plays: unknown, mp4: unknown, poster: unknown) => {
    const u = String(url || "");
    if (!/^https?:\/\//i.test(u)) return;
    if (out.some((o) => o.url === u)) return;
    out.push({
      url: u,
      plays: typeof plays === "number" ? plays : null,
      mp4: typeof mp4 === "string" && /^https?:\/\//i.test(mp4) ? mp4 : null,
      poster: typeof poster === "string" && /^https?:\/\//i.test(poster) ? poster : null,
    });
  };
  if (!tt) return out;
  // origin viral video jako link
  push(tt.tiktok_url, tt.total_plays ?? tt.max_plays, null, null);
  const vc = tt.videos_curated;
  const items: any[] = vc && typeof vc === "object" && Array.isArray(vc.items) ? vc.items : [];
  const kept = items
    .filter((it) => it && (it.keep === true || ["KEEP", "PASS"].includes(String(it.werdykt || "").toUpperCase())))
    .sort((a, b) => (a.kolejnosc == null ? 999 : Number(a.kolejnosc)) - (b.kolejnosc == null ? 999 : Number(b.kolejnosc)));
  for (const it of kept) {
    if (out.length >= 5) break;
    push(it.url, it.plays, it.mp4_hosted, it.poster_hosted);
  }
  return out.slice(0, 5);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let raw: string;
  try { raw = await req.text(); } catch { return json({ error: "bad_request" }, 400); }
  if (raw.length > 10240) return json({ error: "payload_too_large" }, 413);

  let body: {
    token?: string; password?: string; action?: string; preview?: boolean;
    step_key?: string; fields?: Record<string, unknown>; done?: boolean;
    events?: Array<{ action?: string; description?: string; product_id?: string }>;
  };
  try { body = JSON.parse(raw); } catch { return json({ error: "bad_request" }, 400); }

  const token = (body.token || "").trim();
  const password = (body.password || "").trim();
  const preview = body.preview === true;
  const action = (body.action || "").trim();

  if (!/^[0-9a-f]{32}$/i.test(token)) {
    await sleep(300);
    return json({ error: "unauthorized" }, 401);
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Tryb PODGLĄDU: JWT członka zespołu zamiast hasła klienta. READ-ONLY.
  let readonly = false;
  if (preview) {
    const member = await verifyTeamMember(req, sb);
    if (!member) { await sleep(300); return json({ error: "unauthorized" }, 401); }
    readonly = true;
  }

  const { data: p } = await sb
    .from("wf2_projects")
    .select("id, name, customer_name, customer_email, status, links, target_orders, domain, deadline_at, platform_account_email, created_at, unique_token, client_password_hash")
    .eq("unique_token", token)
    .maybeSingle();
  if (!p) { await sleep(300); return json({ error: "unauthorized" }, 401); }

  // ── FIRST-VISIT: stan bramki (czy trzeba ustawić hasło) ─────────────────────
  if (action === "portal_state") {
    return json({
      needs_setup: !p.client_password_hash,
      name: (p.name || "").trim() || "Twój sklep",
    });
  }

  // ── FIRST-VISIT: klient sam ustawia hasło (gate: hash NULL; atomowo) ────────
  if (action === "set_password") {
    if (preview) return json({ error: "preview_readonly" }, 403);
    const gate = await throttleGate(sb, token);
    if (gate.locked) return json({ error: "too_many_attempts", retry_after: gate.retryAfter }, 429, { "Retry-After": String(gate.retryAfter) });
    if (p.client_password_hash) return json({ error: "already_set" }, 409);
    const np = (body.password || "").trim();
    if (np.length < 8) {
      await throttleFail(sb, token); await sleep(200);
      return json({ error: "validation", messages: ["Hasło musi mieć min. 8 znaków."] }, 400);
    }
    if (np.length > 200) return json({ error: "validation", messages: ["Hasło jest za długie."] }, 400);
    const hash = await sha256Hex(np);
    const { data: updated, error: upErr } = await sb
      .from("wf2_projects").update({ client_password_hash: hash })
      .eq("id", p.id).is("client_password_hash", null).select("id");
    if (upErr) return json({ error: "save_failed" }, 500);
    if (!updated || (updated as unknown[]).length === 0) return json({ error: "already_set" }, 409);
    throttleClear(sb, token).catch(() => {});
    await sb.from("wf2_activities").insert({
      project_id: p.id, actor: "client", action: "portal_set_password",
      description: "Klient ustawił własne hasło do portalu przy pierwszym wejściu.",
    });
    return json({ ok: true });
  }

  // ── Bramka hasła (ścieżka klienta; preview ją omija jako read-only) ────────
  if (!preview) {
    const gate = await throttleGate(sb, token);
    if (gate.locked) return json({ error: "too_many_attempts", retry_after: gate.retryAfter }, 429, { "Retry-After": String(gate.retryAfter) });
    if (!password || password.length > 200 || !p.client_password_hash) {
      await throttleFail(sb, token); await sleep(300);
      return json({ error: "unauthorized" }, 401);
    }
    const hash = await sha256Hex(password);
    if (hash !== String(p.client_password_hash).toLowerCase()) {
      await throttleFail(sb, token); await sleep(300);
      return json({ error: "unauthorized" }, 401);
    }
    throttleClear(sb, token).catch(() => {});
  }

  // ── helper: definicja kroku (owner/scope/label) ────────────────────────────
  async function stepDef(key: string): Promise<{ owner: string; scope: string; label: string } | null> {
    const { data } = await sb.from("wf2_step_defs").select("owner, scope, label").eq("key", key).maybeSingle();
    return data as { owner: string; scope: string; label: string } | null;
  }

  // ════════════════════════ TRACK ═══════════════════════════════════════════
  if (action === "track") {
    if (readonly) return json({ ok: true }); // podgląd Tomka nie udaje aktywności klienta
    const events = Array.isArray(body.events) ? body.events.slice(0, 20) : [];
    if (!events.length) return json({ ok: true });

    // dedup portal_visit: ostatni wpis <30 min → pomijamy te eventy
    let skipVisit = false;
    if (events.some((e) => (e?.action || "") === "portal_visit")) {
      const { data: last } = await sb.from("wf2_activities")
        .select("created_at").eq("project_id", p.id).eq("actor", "client").eq("action", "portal_visit")
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (last?.created_at && (Date.now() - new Date(String(last.created_at)).getTime()) < 30 * 60 * 1000) skipVisit = true;
    }

    const rows: Array<Record<string, unknown>> = [];
    for (const e of events) {
      const a = String(e?.action || "").trim();
      if (!TRACK_ACTIONS.has(a)) continue;
      if (a === "portal_visit" && skipVisit) continue;
      let desc = String(e?.description == null ? "" : e.description).trim().slice(0, 300);
      const pid = String(e?.product_id || "").trim();
      if (pid && /^[0-9a-f-]{36}$/i.test(pid)) desc = (desc ? desc + " " : "") + `[product:${pid}]`;
      rows.push({ project_id: p.id, actor: "client", action: a, description: desc });
    }
    if (rows.length) await sb.from("wf2_activities").insert(rows);
    return json({ ok: true, logged: rows.length });
  }

  // ════════════════════════ TASK_SAVE ═══════════════════════════════════════
  if (action === "task_save") {
    if (readonly) return json({ error: "podgląd — tylko odczyt" }, 403);
    const step_key = String(body.step_key || "").trim();
    const wl = CLIENT_FIELD_WHITELIST[step_key];
    if (!wl) return json({ error: "bad_step" }, 400);
    const def = await stepDef(step_key);
    if (!def || def.owner !== "client") return json({ error: "not_client_step" }, 403);

    const inp = (body.fields && typeof body.fields === "object") ? body.fields as Record<string, unknown> : {};
    const cleaned: Record<string, string> = {};
    const errs: string[] = [];
    for (const [k, v] of Object.entries(inp)) {
      if (!wl.includes(k)) return json({ error: "bad_field", field: k }, 400); // klucz spoza whitelisty
      const val = String(v == null ? "" : v).trim();
      if (val.length > 500) { errs.push(`Pole „${k}" jest za długie (max 500 znaków).`); continue; }
      cleaned[k] = val;
    }
    if (step_key === "pl_konto_klient" && cleaned.platform_email && !EMAIL_RE.test(cleaned.platform_email)) {
      errs.push("Podaj poprawny adres e-mail konta na platformie.");
    }
    if (step_key === "pl_dane" && cleaned.email_kontakt && !EMAIL_RE.test(cleaned.email_kontakt)) {
      errs.push("Podaj poprawny adres e-mail kontaktowy.");
    }
    if (errs.length) return json({ error: "validation", messages: errs }, 400);
    if (!Object.keys(cleaned).length) return json({ error: "empty" }, 400);

    // znajdź instancję kroku (scope project → product_id NULL)
    const { data: stepRow } = await sb.from("wf2_steps")
      .select("id, data").eq("project_id", p.id).eq("step_key", step_key).is("product_id", null).maybeSingle();
    const prevData = (stepRow?.data && typeof stepRow.data === "object") ? stepRow.data as Record<string, unknown> : {};
    const prevFields = (prevData.fields && typeof prevData.fields === "object") ? prevData.fields as Record<string, unknown> : {};
    const newData = { ...prevData, fields: { ...prevFields, ...cleaned } };
    if (stepRow) {
      const { error } = await sb.from("wf2_steps").update({ data: newData }).eq("id", stepRow.id);
      if (error) return json({ error: "save_failed" }, 500);
    } else {
      const { error } = await sb.from("wf2_steps").insert({ project_id: p.id, step_key, data: newData });
      if (error) return json({ error: "save_failed" }, 500);
    }

    // pl_konto_klient: e-mail konta ląduje też w kolumnie projektu (dopasowanie sklepu/operatora)
    if (step_key === "pl_konto_klient" && cleaned.platform_email) {
      await sb.from("wf2_projects").update({ platform_account_email: cleaned.platform_email }).eq("id", p.id);
    }
    await sb.from("wf2_activities").insert({
      project_id: p.id, actor: "client", action: "task_save",
      description: `Klient uzupełnił dane w kroku: ${def.label}`,
    });
    return json({ ok: true, fields: newData.fields });
  }

  // ════════════════════════ TASK_DONE ═══════════════════════════════════════
  if (action === "task_done") {
    if (readonly) return json({ error: "podgląd — tylko odczyt" }, 403);
    const step_key = String(body.step_key || "").trim();
    const def = await stepDef(step_key);
    if (!def || def.owner !== "client" || def.scope !== "project") return json({ error: "not_client_step" }, 403);
    const done = body.done === true;

    const upd: Record<string, unknown> = {
      status: done ? "done" : "pending",
      completed_at: done ? new Date().toISOString() : null,
      completed_by: done ? "client" : null,
    };
    const { data: stepRow } = await sb.from("wf2_steps")
      .select("id").eq("project_id", p.id).eq("step_key", step_key).is("product_id", null).maybeSingle();
    if (stepRow) {
      const { error } = await sb.from("wf2_steps").update(upd).eq("id", stepRow.id);
      if (error) return json({ error: "save_failed" }, 500);
    } else {
      const { error } = await sb.from("wf2_steps").insert({ project_id: p.id, step_key, ...upd });
      if (error) return json({ error: "save_failed" }, 500);
    }
    await sb.from("wf2_activities").insert({
      project_id: p.id, actor: "client", action: done ? "task_done" : "task_undone",
      description: `Klient ${done ? "oznaczył jako zrobione" : "cofnął"} krok: ${def.label}`,
    });
    return json({ ok: true, status: upd.status });
  }

  // ════════════════════════ DEFAULT: pełny stan (sanityzowany) ══════════════
  const [defsQ, stepsQ, prodsQ, artsQ, ordQ] = await Promise.all([
    sb.from("wf2_step_defs")
      .select("key, stage, stage_label, label, icon, sort, owner, scope, milestone_label")
      .eq("active", true).order("stage").order("sort"),
    sb.from("wf2_steps").select("step_key, product_id, status, completed_at, data")
      .eq("project_id", p.id).range(0, 999),
    sb.from("wf2_products")
      .select("id, name, slug, status, cover_url, unit_profit, price, sort, platform_page_url, supplier_url, tt_product_id")
      .eq("project_id", p.id).order("sort"),
    sb.from("wf2_artifacts")
      .select("id, product_id, step_key, kind, url, meta, created_at")
      .eq("project_id", p.id).order("created_at", { ascending: false }).limit(500),
    sb.from("wf2_orders").select("id", { count: "exact", head: true }).eq("project_id", p.id),
  ]);

  const defs = (defsQ.data || []) as Array<Record<string, any>>;
  const ownerByKey: Record<string, string> = {};
  for (const d of defs) ownerByKey[d.key] = d.owner;

  const step_defs = defs.map((d) => ({
    key: d.key, stage: d.stage, stage_label: d.stage_label, label: d.label,
    icon: d.icon, sort: d.sort, owner: d.owner, scope: d.scope, milestone_label: d.milestone_label || null,
  }));

  // steps: client_fields = data.fields TYLKO dla kroków owner='client'; reszta bez data.
  const steps = ((stepsQ.data || []) as Array<Record<string, any>>).map((s) => {
    let client_fields: Record<string, unknown> | null = null;
    if (ownerByKey[s.step_key] === "client") {
      const d = (s.data && typeof s.data === "object") ? s.data : {};
      client_fields = (d.fields && typeof d.fields === "object") ? d.fields : {};
    }
    return { step_key: s.step_key, product_id: s.product_id, status: s.status, completed_at: s.completed_at, client_fields };
  });

  // produkty + tiktoks (jedno zapytanie do bud_tt_products)
  const prods = (prodsQ.data || []) as Array<Record<string, any>>;
  const ttIds = [...new Set(prods.map((x) => x.tt_product_id).filter(Boolean))];
  const ttMap: Record<string, Record<string, any>> = {};
  if (ttIds.length) {
    const { data: ttRows } = await sb.from("bud_tt_products")
      .select("id, tiktok_url, videos_curated, max_plays, total_plays")
      .in("id", ttIds);
    for (const t of (ttRows || []) as Array<Record<string, any>>) ttMap[t.id] = t;
  }
  const products = prods.map((x) => ({
    id: x.id, name: x.name, slug: x.slug, status: x.status, cover_url: x.cover_url,
    unit_profit: x.unit_profit, price: x.price, sort: x.sort,
    platform_page_url: x.platform_page_url, supplier_url: x.supplier_url,
    tiktoks: buildTiktoks(x.tt_product_id ? ttMap[x.tt_product_id] : undefined),
  }));

  // artefakty: tylko oglądalne media (obraz/wideo), publiczne, bez pracy AI/QA; meta→{viewport}
  const artifacts = ((artsQ.data || []) as Array<Record<string, any>>)
    .filter((a) => !ARTIFACT_KIND_BLOCK.has(String(a.kind || "")) && isViewableMedia(String(a.url || "")))
    .slice(0, ARTIFACT_LIMIT)
    .map((a) => ({
      id: a.id, product_id: a.product_id, step_key: a.step_key, kind: a.kind, url: a.url,
      meta: { viewport: (a.meta && typeof a.meta === "object" && a.meta.viewport) ? a.meta.viewport : null },
      created_at: a.created_at,
    }));

  return json({
    mode: readonly ? "preview" : "client",
    project: {
      id: p.id, name: (p.name || "").trim() || "Twój sklep",
      customer_name: p.customer_name || null, customer_email: p.customer_email || null,
      status: p.status, links: Array.isArray(p.links) ? p.links : [],
      target_orders: p.target_orders, domain: p.domain || null,
      deadline_at: p.deadline_at || null, platform_account_email: p.platform_account_email || null,
      created_at: p.created_at,
    },
    step_defs,
    steps,
    products,
    artifacts,
    orders_count: ordQ.count || 0,
  });
});

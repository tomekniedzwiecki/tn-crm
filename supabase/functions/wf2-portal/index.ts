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
import { CHECKLIST_MAP } from "./checklist-map.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Panel merchanta (Trevio) — link logowania + reset hasła (klient sam ustawia hasło forgot-password).
const MERCHANT_LOGIN_URL = "https://panel.niedzwiecki.ai/";
const MERCHANT_PW_SETUP_URL = "https://panel.niedzwiecki.ai/auth/forgot-password";

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
  pl_dane:         ["company", "nip", "regon", "address", "nrb", "email_kontakt", "phone", "return_address"],
  ads_konto:       ["bm_id", "partner_id", "ad_account_id", "fanpage_url"],
  ads_strona:      ["fanpage_url", "instagram_url"],
  ads_budzet:      ["amount", "method", "confirmation"],
};

const TRACK_ACTIONS = new Set(["portal_visit", "open_step", "media_view", "link_click", "open_ceny"]);

// ── AUTO-ODŚWIEŻENIE DOKUMENTÓW PRAWNYCH po zmianie danych klienta (pl_dane) ──
// Zasada (SSOT docs/zbuduje/PRAWNE.md): dane sprzedawcy w dokumentach sklepu pochodzą
// z portalu — zapis pl_dane re-renderuje i re-publikuje 7 podstron. Szablony kanoniczne
// czytamy ze Storage (attachments/legal-szablony/ — sync robi legal-forge.py przy
// publish/update-all). Koalescencja: pierwszy zapis w oknie ustawia flagę pending,
// śpi 60 s (klient kończy wpisywać kolejne pola — debounce portalu), potem czyta
// NAJNOWSZE dane i publikuje raz. Best-effort: żaden błąd nie psuje zapisu klienta.
const LEGAL_PAGES: Array<[string, string, string]> = [
  ["regulamin.html", "regulation", "Regulamin"],
  ["polityka-prywatnosci.html", "privacy-policy", "Polityka prywatności"],
  ["zwroty.html", "return", "Zwroty i reklamacje"],
  ["kontakt.html", "contact", "Kontakt"],
  ["dostawa.html", "dostawa", "Dostawa i płatności"],
  ["polityka-cookies.html", "polityka-cookies", "Polityka cookies"],
  ["odstapienie.html", "formularz-odstapienia", "Formularz odstąpienia od umowy"],
];
const LEGAL_LINKS: Array<[string, string]> = [
  ["{{REGULAMIN_URL}}", "/regulation"], ["{{POLITYKA_URL}}", "/privacy-policy"],
  ["{{ZWROTY_URL}}", "/return"], ["{{KONTAKT_URL}}", "/contact"],
  ["{{DOSTAWA_URL}}", "/dostawa"], ["{{COOKIES_URL}}", "/polityka-cookies"],
  ["{{ODSTAPIENIE_URL}}", "/formularz-odstapienia"],
];
const LEGAL_DELIVERY_DEFAULTS: Record<string, string> = {
  DELIVERY_TIME_TYPICAL: "7–14 dni roboczych",
  DELIVERY_TIME_MAX: "do 30 dni",
};

function legalRenderTemplate(tpl: string, data: Record<string, string>): string {
  let html = tpl.replace(/<!--IF:([A-Z_]+)-->([\s\S]*?)<!--\/IF:\1-->/g,
    (_m, key, inner) => (data[key] ? inner : ""));
  for (const [k, v] of Object.entries(data)) html = html.split(`{{${k}}}`).join(v);
  return html;
}

async function refreshLegalPagesAfterClientEdit(
  sb: ReturnType<typeof createClient>, projectId: string,
): Promise<void> {
  try {
    const { data: step } = await sb.from("wf2_steps").select("id, status, data")
      .eq("project_id", projectId).eq("step_key", "pl_prawne").is("product_id", null).maybeSingle();
    if (!step || step.status !== "done") return; // fabryka jeszcze nie publikowała — nic do odświeżania
    const sd = (step.data && typeof step.data === "object") ? step.data as Record<string, unknown> : {};
    const pend = Date.parse(String(sd.legal_refresh_pending || "")) || 0;
    if (Date.now() - pend < 5 * 60_000) return; // ktoś już czeka w oknie — obsłuży najnowsze dane
    await sb.from("wf2_steps").update({ data: { ...sd, legal_refresh_pending: new Date().toISOString() } })
      .eq("id", step.id);
    await sleep(60_000); // koalescencja: klient zwykle zapisuje kilka pól pod rząd

    const { data: pr } = await sb.from("wf2_projects")
      .select("id, name, domain, td_shop_url, palette, fonts, logo_url, favicon_url, platform_shop_id, platform_merchant_email")
      .eq("id", projectId).maybeSingle();
    const { data: daneRow } = await sb.from("wf2_steps").select("data")
      .eq("project_id", projectId).eq("step_key", "pl_dane").is("product_id", null).maybeSingle();
    const f = ((daneRow?.data as Record<string, any>)?.fields || {}) as Record<string, string>;
    const clearPending = async () => {
      const { data: s2 } = await sb.from("wf2_steps").select("data").eq("id", step.id).maybeSingle();
      const d2 = (s2?.data && typeof s2.data === "object") ? s2.data as Record<string, unknown> : {};
      delete d2.legal_refresh_pending;
      await sb.from("wf2_steps").update({ data: d2 }).eq("id", step.id);
    };
    const email = (f.email_kontakt || "").trim() || (pr?.platform_merchant_email || "");
    if (!pr?.platform_shop_id || !(f.company || "").trim() || !(f.address || "").trim() || !email) {
      await clearPending(); return; // dane niekompletne — bez publikacji (żadnych zmyślonych danych)
    }

    const base = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/attachments/legal-szablony`;
    const verRes = await fetch(`${base}/VERSION?t=${Date.now()}`);
    if (!verRes.ok) { await clearPending(); return; } // brak szablonów w Storage — sync robi legal-forge
    const version = (await verRes.text()).trim();

    const palette = Object.fromEntries(
      Array.from(String(pr.palette || "").matchAll(/([a-z-]+)\s+(#[0-9A-Fa-f]{3,8})/g)).map((m) => [m[1], m[2]]));
    const mh = /heading:\s*([^·(]+)/.exec(String(pr.fonts || ""));
    const mb = /body:\s*([^·(]+)/.exec(String(pr.fonts || ""));
    const head = (mh?.[1] || "Inter").trim(), bodyF = (mb?.[1] || "Inter").trim();
    const fam = [...new Set([head, bodyF])].map((x) => `${x.replace(/ /g, "+")}:wght@400;600;700`).join("&family=");
    const dom = String(pr.domain || "").trim() ||
      String(pr.td_shop_url || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const today = new Date();
    const data: Record<string, string> = {
      ...LEGAL_DELIVERY_DEFAULTS,
      BRAND_NAME: pr.name || "", DOMAIN: dom,
      COMPANY_NAME: (f.company || "").trim(), COMPANY_ADDRESS: (f.address || "").trim(),
      NIP: (f.nip || "").trim(), REGON: (f.regon || "").trim(), PHONE: (f.phone || "").trim(),
      EMAIL: email, RETURN_ADDRESS: (f.return_address || "").trim() || (f.address || "").trim(),
      LOGO_URL: pr.logo_url || "", FAVICON_URL: pr.favicon_url || pr.logo_url || "",
      UPDATE_DATE: `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`,
      YEAR: String(today.getFullYear()), DOC_VERSION: version,
      PRIMARY: palette["primary"] || "#2563eb", ACCENT: palette["accent"] || palette["primary"] || "#2563eb",
      INK: palette["ink"] || "#111827", BG: palette["bg"] || "#ffffff",
      BG_ALT: palette["bg-alt"] || "#f3f4f6", BORDER: palette["border"] || "#e5e7eb",
      FONT_HEAD: head, FONT_BODY: bodyF,
      FONTS_LINK: `https://fonts.googleapis.com/css2?family=${fam}&display=swap`,
    };

    const fnBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1/wf2-platform`;
    const secret = Deno.env.get("WF2_GEN_SECRET") || "";
    let okCount = 0;
    for (const [tplName, path, name] of LEGAL_PAGES) {
      const tRes = await fetch(`${base}/${tplName}?t=${Date.now()}`);
      if (!tRes.ok) continue;
      let html = legalRenderTemplate(await tRes.text(), data);
      html = html.replace(/\{\{CANONICAL_URL\}\}/g, `https://${dom}/${path}`);
      for (const [ph, target] of LEGAL_LINKS) html = html.split(ph).join(target);
      if (pr.domain) html = html.replace(/<meta[^>]+name="robots"[^>]+noindex[^>]*>\s*/gi, "");
      const pubRes = await fetch(fnBase, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-wf2-secret": secret },
        body: JSON.stringify({ action: "publish_landing", shop_id: pr.platform_shop_id, path, html, name }),
      });
      if (pubRes.ok) okCount++;
    }

    const { data: s3 } = await sb.from("wf2_steps").select("data").eq("id", step.id).maybeSingle();
    const d3 = (s3?.data && typeof s3.data === "object") ? s3.data as Record<string, unknown> : {};
    delete d3.legal_refresh_pending;
    const fields3 = (d3.fields && typeof d3.fields === "object") ? d3.fields as Record<string, unknown> : {};
    d3.fields = { ...fields3, wersja: version, auto_refresh: new Date().toISOString().slice(0, 16) + "Z" };
    await sb.from("wf2_steps").update({ data: d3 }).eq("id", step.id);
    await sb.from("wf2_activities").insert({
      project_id: projectId, actor: "auto", action: "legal_refresh",
      description: `Dokumenty prawne sklepu zaktualizowane po zmianie danych w portalu (${okCount}/7 stron, PRAWNE-V ${version})`,
    });
  } catch (_e) { /* best-effort — nigdy nie psuje zapisu klienta */ }
}

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

// ── CENY 3.2: model kosztów (SSOT = settings.wf2_price_config.cost_model; defaulty = spec §3) ──
const COST_MODEL_DEFAULTS = {
  vat_rate: 0.23,
  dropship_customs_fee_pln: 13,
  wholesale_discount: 0.40,
  wholesale_extras_pct: 0.15,
  wholesale_local_ship_pln: 14,
  client_cost_sanity_band: [0.4, 1.6] as [number, number],
};
type CostModel = typeof COST_MODEL_DEFAULTS;

function num(v: unknown): number { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function r2(n: number): number { return Math.round(n * 100) / 100; }

// price_phase → friendly label. FAIL-CLOSED: nieznana faza → „Cena aktywna" (NIGDY surowej fazy do klienta).
function priceStatusLabel(phase: unknown): string {
  const n = Number(phase);
  if (n === 1 || n === 2) return "Cena startowa — testujemy popyt";
  if (n === 3 || n === 4) return "Cena optymalizowana";
  if (n === 5) return "Cena dojrzała";
  if (n === 6) return "Cena ustalona";
  return "Cena aktywna";
}

// Wylicza koszt efektywny + marżę netto + prognozę hurtu wg wzorów spec §3.
// Wejście p: pola surowe produktu (price, cost_purchase, fees_pct, shipping_paid_by,
// cost_shipping, price_phase + client_cost_purchase/is_net/source). Zwraca WYŁĄCZNIE
// wartości bezpieczne dla klienta (bez price_phase/reason).
function computeCeny(p: Record<string, unknown>, cm: CostModel) {
  const vat = 1 + num(cm.vat_rate);                       // 1.23
  const price = num(p.price);
  const feesPct = num(p.fees_pct);
  const shopPaysShip = p.shipping_paid_by === "shop";
  const shipAdd = shopPaysShip ? num(p.cost_shipping) : 0;
  const aliBrutto = num(p.cost_purchase);                 // referencja dropship (brutto Ali)

  // ── BAZA kosztu: cena klienta (jeśli w paśmie sanity) MA PRIORYTET ──
  const band = Array.isArray(cm.client_cost_sanity_band) ? cm.client_cost_sanity_band : [0.4, 1.6];
  const cc = num(p.client_cost_purchase);
  const hasClient = cc > 0;
  const isNet = p.client_cost_is_net === true;
  const clientSource = p.client_cost_source === "wholesale" ? "wholesale" : "dropship";
  // pasmo 0.4–1.6 × cost_purchase; gdy cost_purchase puste → akceptuj (nie ma z czym porównać)
  const inBand = hasClient && (aliBrutto <= 0 || (cc >= num(band[0]) * aliBrutto && cc <= num(band[1]) * aliBrutto));

  let base: number;
  let costSource: "dropship" | "wholesale";
  if (hasClient && inBand) {
    costSource = clientSource;
    if (clientSource === "dropship") base = isNet ? cc * vat : cc;   // brutto (VAT nieodliczalny)
    else base = isNet ? cc : cc / vat;                               // netto (VAT odliczalny)
  } else {
    costSource = "dropship";
    base = aliBrutto;                                                // fallback: cost_purchase (brutto Ali)
  }
  const customsAdd = costSource === "dropship" ? num(cm.dropship_customs_fee_pln) : 0;
  const effective = base + shipAdd + customsAdd;

  const hasPrice = price > 0;
  const saleNet = hasPrice ? price / vat : 0;
  const feeNet = hasPrice ? (price * (feesPct / 100)) / vat : 0;
  const unitProfitNet = hasPrice ? saleNet - effective - feeNet : null;

  // ── prognoza HURTU (informacyjna) — spec §3: ZAWSZE od cost_ali_brutto (cost_purchase),
  //    spójnie z panelem ceny.html (wholesaleForecast) i wzorem est_cost_hurt_net. ──
  const grossRef = aliBrutto;
  const localShip = shopPaysShip ? num(cm.wholesale_local_ship_pln) : 0;
  const extras = 1 + num(cm.wholesale_extras_pct);
  const profitAt = (discount: number): number => {
    const costHurtNet = (grossRef / vat) * (1 - discount) * extras;
    return saleNet - costHurtNet - feeNet - localShip;
  };
  let wholesale_forecast:
    | null
    | { cost_net: number; profit: number; uplift: number; profit_lo: number; profit_hi: number } = null;
  if (hasPrice && grossRef > 0 && unitProfitNet != null) {
    const disc = num(cm.wholesale_discount);
    const costMid = (grossRef / vat) * (1 - disc) * extras + localShip;
    const profitMid = profitAt(disc);
    wholesale_forecast = {
      cost_net: r2(costMid),
      profit: r2(profitMid),
      uplift: r2(profitMid - unitProfitNet),
      profit_lo: r2(profitAt(0.30)),   // pesymistycznie (mniejszy rabat = wyższy koszt = niższy zysk)
      profit_hi: r2(profitAt(0.50)),   // optymistycznie
    };
  }

  return {
    cost_effective: r2(effective),
    unit_profit_net: unitProfitNet == null ? null : r2(unitProfitNet),
    price_status_label: priceStatusLabel(p.price_phase),
    wholesale_forecast,
  };
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
    // CENY 3.2 — akcja set_client_cost
    product_id?: string; amount?: number | null; is_net?: boolean; source?: string; note?: string;
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
    .select("id, name, customer_name, customer_email, status, links, target_orders, domain, deadline_at, platform_account_email, platform_shop_id, platform_merchant_email, created_at, unique_token, client_password_hash")
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
    // pl_dane: dane sprzedawcy żyją w dokumentach sklepu → auto re-publish (koalescencja 60 s,
    // best-effort w tle; SSOT docs/zbuduje/PRAWNE.md §2)
    if (step_key === "pl_dane") {
      try {
        // @ts-ignore — EdgeRuntime dostępny w środowisku Supabase Edge
        EdgeRuntime.waitUntil(refreshLegalPagesAfterClientEdit(sb, p.id));
      } catch (_e) {
        refreshLegalPagesAfterClientEdit(sb, p.id); // fallback: bez waitUntil (runtime lokalny)
      }
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

  // ════════════════════════ SET_CLIENT_COST (CENY 3.2) ══════════════════════
  // Klient podaje SWOJĄ cenę zakupu (najważniejsze wejście do kalkulacji marży).
  // amount null/0 = wyczyść (klient się rozmyślił). Zwraca przeliczone cost_effective +
  // unit_profit_net (front pokazuje od razu). Podwójny gate: produkt MUSI należeć do projektu.
  if (action === "set_client_cost") {
    if (readonly) return json({ error: "podgląd — tylko odczyt" }, 403);
    const pid = String(body.product_id || "").trim();
    if (!/^[0-9a-f-]{36}$/i.test(pid)) return json({ error: "bad_product" }, 400);

    const { data: prod } = await sb.from("wf2_products")
      .select("id, price, cost_purchase, fees_pct, shipping_paid_by, cost_shipping, price_phase")
      .eq("id", pid).eq("project_id", p.id).maybeSingle();
    if (!prod) return json({ error: "not_found" }, 404);

    // cost_model z configu (defaulty gdy migracja 3.2 jeszcze bez sekcji cost_model)
    let costModel: CostModel = { ...COST_MODEL_DEFAULTS };
    try {
      const { data: cfgRow } = await sb.from("settings").select("value").eq("key", "wf2_price_config").maybeSingle();
      const raw = (cfgRow as { value?: unknown } | null)?.value;
      const cfg = typeof raw === "string" ? JSON.parse(raw) : (raw && typeof raw === "object" ? raw as Record<string, unknown> : null);
      const cm = cfg && typeof cfg.cost_model === "object" ? cfg.cost_model as Record<string, unknown> : null;
      if (cm) costModel = { ...COST_MODEL_DEFAULTS, ...cm } as CostModel;
    } catch { /* defaulty */ }

    const rawAmount = body.amount;
    const clearing = rawAmount == null || Number(rawAmount) === 0;

    let upd: Record<string, unknown>;
    let ccInput: Record<string, unknown>;
    let logDesc: string;
    if (clearing) {
      upd = {
        client_cost_purchase: null, client_cost_is_net: null,
        client_cost_source: "dropship", client_cost_note: null, client_cost_set_at: null,
      };
      ccInput = { client_cost_purchase: null, client_cost_is_net: null, client_cost_source: "dropship" };
      logDesc = `Klient wyczyścił swoją cenę zakupu [product:${pid}]`;
    } else {
      const amount = r2(Number(rawAmount));                     // do groszy
      if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
        return json({ error: "validation", messages: ["Podaj kwotę od 0,01 do 100000 zł."] }, 400);
      }
      const isNet = body.is_net === true;
      const source = body.source === "wholesale" ? "wholesale" : "dropship";
      const note = String(body.note == null ? "" : body.note).trim().slice(0, 300);
      upd = {
        client_cost_purchase: amount, client_cost_is_net: isNet,
        client_cost_source: source, client_cost_note: note || null, client_cost_set_at: new Date().toISOString(),
      };
      ccInput = { client_cost_purchase: amount, client_cost_is_net: isNet, client_cost_source: source };
      logDesc = `Klient podał cenę zakupu ${amount.toFixed(2)} zł (${source === "wholesale" ? "hurt" : "dropshipping"}, ${isNet ? "netto" : "brutto"}) [product:${pid}]`;
    }

    const { error: upErr } = await sb.from("wf2_products").update(upd).eq("id", pid).eq("project_id", p.id);
    if (upErr) return json({ error: "save_failed" }, 500);

    await sb.from("wf2_activities").insert({
      project_id: p.id, actor: "client", action: "client_cost_set", description: logDesc,
    });

    const ceny = computeCeny({ ...prod, ...ccInput }, costModel);
    return json({ ok: true, cost_effective: ceny.cost_effective, unit_profit_net: ceny.unit_profit_net });
  }

  // ════════════════════════ DEFAULT: pełny stan (sanityzowany) ══════════════
  const [defsQ, stepsQ, prodsQ, artsQ, ordQ, priceEvQ, cfgQ] = await Promise.all([
    sb.from("wf2_step_defs")
      .select("key, stage, stage_label, label, icon, sort, owner, scope, milestone_label, sub_of")
      .eq("active", true).order("stage").order("sort"),
    sb.from("wf2_steps").select("step_key, product_id, status, completed_at, data")
      .eq("project_id", p.id).range(0, 999),
    sb.from("wf2_products")
      .select("id, name, slug, status, cover_url, unit_profit, price, sort, platform_page_url, supplier_url, tt_product_id, cost_purchase, fees_pct, shipping_paid_by, cost_shipping, price_phase, client_cost_purchase, client_cost_is_net, client_cost_source, client_cost_note, client_cost_set_at")
      .eq("project_id", p.id).order("sort"),
    sb.from("wf2_artifacts")
      .select("id, product_id, step_key, kind, url, meta, created_at")
      .eq("project_id", p.id).order("created_at", { ascending: false }).limit(500),
    sb.from("wf2_orders").select("id", { count: "exact", head: true }).eq("project_id", p.id),
    // CENY 3.2: historia cen (TYLKO applied/confirmed = realne zmiany; NIGDY reason_pl/metrics/actor/trigger)
    sb.from("wf2_price_events")
      .select("product_id, at, old_price, new_price, direction")
      .eq("project_id", p.id).in("status", ["applied", "confirmed"])
      .order("at", { ascending: true }).limit(200),
    // CENY 3.2: config → cost_model
    sb.from("settings").select("value").eq("key", "wf2_price_config").maybeSingle(),
  ]);

  const defs = (defsQ.data || []) as Array<Record<string, any>>;
  const ownerByKey: Record<string, string> = {};
  for (const d of defs) ownerByKey[d.key] = d.owner;

  const step_defs = defs.map((d) => ({
    key: d.key, stage: d.stage, stage_label: d.stage_label, label: d.label,
    icon: d.icon, sort: d.sort, owner: d.owner, scope: d.scope, milestone_label: d.milestone_label || null,
    sub_of: d.sub_of || null,
  }));

  // steps: client_fields = data.fields TYLKO dla kroków owner='client'; reszta bez data.
  // checklist: pozycje TŁUMACZONE na język kliencki przez CHECKLIST_MAP (step_key → {tekst_adminowy → tekst_kliencki}).
  // FAIL-CLOSED: pozycja bez tłumaczenia w mapie ODPADA (nie wycieka wewnętrzny slang produkcyjny).
  // CHECK_BLOCK = druga siatka bezpieczeństwa: przetłumaczony tekst też musi ją przejść (gdyby tłumaczenie było niedbałe).
  const CHECK_BLOCK = /gate|sync|forge|phash|p-hash|prompt|sql|\.py\b|\.mjs\b|\.sh\b|\.ts\b|rytua|claude|gpt|manus|\bfal\b|agent|deploy|\bapi\b|verbatim|ocr|ssim|\bqa\b|\bf\d(?:\.\d)?\b|\bir\b|panel|storage|bucket|\brls\b|edge|cron|token|backfill|\brepo\b|commit|best-of|vision|blueprint|typed|snippet|noindex|slug|webhook|endpoint|curl|\brest\b|json|jwt|uuid|\benv\b|sekret|automat|sesj|fabryk|pipeline|batch|regen|render/i;
  const clientChecklist = (step_key: string, data: unknown): Array<{ t: string; done: boolean }> | null => {
    const d = (data && typeof data === "object") ? data as Record<string, unknown> : {};
    const list = Array.isArray(d.checklist) ? d.checklist : [];
    const map = CHECKLIST_MAP[step_key] || {};
    const out: Array<{ t: string; done: boolean }> = [];
    for (const it of list) {
      if (!it || typeof it !== "object") continue;
      const raw = (it as Record<string, unknown>).t;
      if (typeof raw !== "string") continue;
      const translated = map[raw];
      if (!translated) continue;                 // brak tłumaczenia = pozycja niewidoczna dla klienta
      if (CHECK_BLOCK.test(translated)) continue; // druga siatka: żargon w tłumaczeniu = odpada
      out.push({ t: translated.slice(0, 200), done: !!(it as Record<string, unknown>).done });
    }
    return out.length ? out : null;
  };
  const steps = ((stepsQ.data || []) as Array<Record<string, any>>).map((s) => {
    let client_fields: Record<string, unknown> | null = null;
    if (ownerByKey[s.step_key] === "client") {
      const d = (s.data && typeof s.data === "object") ? s.data : {};
      client_fields = (d.fields && typeof d.fields === "object") ? d.fields : {};
    }
    return { step_key: s.step_key, product_id: s.product_id, status: s.status, completed_at: s.completed_at, client_fields, checklist: clientChecklist(s.step_key, s.data) };
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
  // ── CENY 3.2: cost_model z config, historia cen, zamówienia 30 dni ─────────
  let costModel: CostModel = { ...COST_MODEL_DEFAULTS };
  try {
    const raw = (cfgQ.data as { value?: unknown } | null)?.value;
    const cfg = typeof raw === "string" ? JSON.parse(raw) : (raw && typeof raw === "object" ? raw as Record<string, unknown> : null);
    const cm = cfg && typeof cfg.cost_model === "object" ? cfg.cost_model as Record<string, unknown> : null;
    if (cm) costModel = { ...COST_MODEL_DEFAULTS, ...cm } as CostModel;
  } catch { /* defaulty gdy migracja 3.2 jeszcze bez cost_model */ }

  const histByProd: Record<string, Array<{ at: string; old_price: number | null; new_price: number | null; direction: string | null }>> = {};
  for (const ev of ((priceEvQ.data || []) as Array<Record<string, any>>)) {
    const pid = String(ev.product_id);
    (histByProd[pid] ||= []).push({
      at: ev.at,
      old_price: ev.old_price == null ? null : num(ev.old_price),
      new_price: ev.new_price == null ? null : num(ev.new_price),
      direction: ev.direction || null,
    });
  }

  const prodIds = prods.map((x) => x.id).filter(Boolean);
  const orders30ByProd: Record<string, number> = {};
  if (prodIds.length) {
    const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const { data: daily } = await sb.from("wf2_product_daily")
      .select("product_id, date, orders, revenue").in("product_id", prodIds).gte("date", since30);
    for (const row of ((daily || []) as Array<Record<string, any>>)) {
      const pid = String(row.product_id);
      orders30ByProd[pid] = (orders30ByProd[pid] || 0) + num(row.orders);
    }
  }

  const products = prods.map((x) => {
    const ceny = computeCeny(x, costModel);
    return {
      id: x.id, name: x.name, slug: x.slug, status: x.status, cover_url: x.cover_url,
      unit_profit: x.unit_profit, price: x.price, sort: x.sort,
      platform_page_url: x.platform_page_url, supplier_url: x.supplier_url,
      tiktoks: buildTiktoks(x.tt_product_id ? ttMap[x.tt_product_id] : undefined),
      // ── CENY 3.2 (wszystko wyliczone/whitelistowane; NIGDY price_phase/reason surowo) ──
      cost_effective: ceny.cost_effective,
      unit_profit_net: ceny.unit_profit_net,
      price_status_label: ceny.price_status_label,
      wholesale_forecast: ceny.wholesale_forecast,
      price_history: histByProd[String(x.id)] || [],
      orders_30d: orders30ByProd[String(x.id)] || 0,
      client_cost_purchase: x.client_cost_purchase == null ? null : num(x.client_cost_purchase),
      client_cost_is_net: x.client_cost_is_net === true,
      client_cost_source: x.client_cost_source === "wholesale" ? "wholesale" : "dropship",
      client_cost_note: x.client_cost_note || null,
      client_cost_set_at: x.client_cost_set_at || null,
    };
  });

  // artefakty: tylko oglądalne media (obraz/wideo), publiczne, bez pracy AI/QA; meta→{viewport}
  const artifacts = ((artsQ.data || []) as Array<Record<string, any>>)
    .filter((a) => !ARTIFACT_KIND_BLOCK.has(String(a.kind || "")) && isViewableMedia(String(a.url || "")))
    .slice(0, ARTIFACT_LIMIT)
    .map((a) => ({
      id: a.id, product_id: a.product_id, step_key: a.step_key, kind: a.kind, url: a.url,
      meta: { viewport: (a.meta && typeof a.meta === "object" && a.meta.viewport) ? a.meta.viewport : null },
      created_at: a.created_at,
    }));

  // ── Panel merchanta (Trevio) — karta „Panel Twojego sklepu" w portalu ──
  // active = TRUE tylko gdy sklep istnieje (platform_shop_id) I konto na platformie jest KLIENTA
  // (platform_merchant_email == customer_email, case-insensitive/trim). Gdy sklep jest, ale konto
  // na adresie SYSTEMOWYM → {active:false, pending:true} BEZ ujawniania adresu. Brak sklepu → null.
  // ŻADNYCH haseł; tabela wf2_merchant_accounts NIE jest tu czytana (wystarczą kolumny wf2_projects).
  let merchant_panel: Record<string, unknown> | null = null;
  if (p.platform_shop_id) {
    const custEmail = String(p.customer_email || "").trim().toLowerCase();
    const merchEmail = String(p.platform_merchant_email || "").trim().toLowerCase();
    if (custEmail && merchEmail && custEmail === merchEmail) {
      merchant_panel = {
        active: true,
        login_email: p.customer_email,
        login_url: MERCHANT_LOGIN_URL,
        password_setup_url: MERCHANT_PW_SETUP_URL,
      };
    } else {
      merchant_panel = { active: false, pending: true };
    }
  }

  return json({
    mode: readonly ? "preview" : "client",
    merchant_panel,
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

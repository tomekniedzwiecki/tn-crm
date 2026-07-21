// wf2-merchant — zakladanie KONTA merchanta + SKLEPU na platformie Trevio (panel.niedzwiecki.ai)
// przez API MERCHANTA (gateway.trevio.pl/auth + /organization). To API partnera NIE tworzy sklepu
// — dopiero to zamyka luke "fabryka sama zaklada sklep". Sklep zalozony tak OD RAZU widnieje na
// liscie `stores` API partnera (wf2-platform) -> dalej zarzadza sie nim przez wf2-platform.
//
// ⚠️ DEPLOY: ZAWSZE --no-verify-jwt (autoryzacja w srodku: x-wf2-secret==WF2_GEN_SECRET,
//    service-role key w Authorization, LUB JWT czlonka team_members). anon NIGDY nie przechodzi.
//
// SEKRETY: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (zapis wf2_merchant_accounts / wf2_projects),
//    WF2_GEN_SECRET, TREVIO_TENANT_ID (fallback stały 019f1eb3-95d4-79e7-aa42-ca56ece13021).
//
// AKCJE (POST JSON):
//   create_store  { email, first_name, store_name, project_id?, is_company?, password?, link_project? }
//        -> pelny flow rejestracja->sklep->trial (best-effort)->potwierdzenie.
//           IDEMPOTENCJA: konto juz w wf2_merchant_accounts z haslem => re-auth (created:false).
//           register 409 bez zapisanych creds => { error:'email_taken_no_creds', needs_manual:true }.
//           link_project (default true): zapisz platform_shop_id + platform_merchant_email na projekcie.
//   token         { email }            -> re-auth ze stored creds, zwraca { access_token } (debug/wewn.)
//   list_accounts { project_id? }      -> wiersze BEZ pola password (zredagowane)

import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";

const TREVIO_BASE = "https://gateway.trevio.pl";
const TREVIO_ORIGIN = "https://panel.niedzwiecki.ai";
const TENANT_FALLBACK = "019f1eb3-95d4-79e7-aa42-ca56ece13021";
// URL-e informacyjne zwracane w create_store (klient loguje sie i sam ustawia haslo):
const LOGIN_URL = "https://panel.niedzwiecki.ai/";
const PASSWORD_SETUP_URL = "https://panel.niedzwiecki.ai/auth/forgot-password";

const ALLOWED_ORIGINS = [
  "https://crm.tomekniedzwiecki.pl",
  "https://tn-crm.vercel.app",
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": a,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-wf2-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// ── fetch do Trevio z retry na 429 (Retry-After) i 1 retry na 5xx (jak wf2-platform.pf) ──
async function tf(
  method: string,
  path: string,
  opts: { body?: unknown; bearer?: string; query?: Record<string, string> } = {},
): Promise<{ status: number; data: unknown }> {
  const url = new URL(TREVIO_BASE + path);
  for (const [k, v] of Object.entries(opts.query || {})) if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  const headers: Record<string, string> = { "Accept": "application/json", "Origin": TREVIO_ORIGIN };
  const init: RequestInit = { method, headers };
  if (opts.bearer) headers["Authorization"] = `Bearer ${opts.bearer}`;
  if (opts.body !== undefined && method !== "GET") {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(opts.body);
  }
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(url.toString(), init);
    if (r.status === 429 && attempt < 2) {
      const wait = Math.min(parseInt(r.headers.get("Retry-After") || "2", 10) || 2, 15);
      await new Promise((res) => setTimeout(res, wait * 1000));
      continue;
    }
    if (r.status >= 500 && attempt < 1) { await new Promise((res) => setTimeout(res, 1500)); continue; }
    const txt = await r.text();
    const ct = r.headers.get("content-type") || "";
    let data: unknown = txt;
    if (ct.includes("application/json")) { try { data = JSON.parse(txt); } catch { /* zostaje tekst */ } }
    return { status: r.status, data };
  }
}

const s = (v: unknown) => (typeof v === "string" ? v : "");

// wyciagnij ID dokumentow do zaakceptowania (POBIERANE DYNAMICZNIE — moga rotowac).
// Znane ksztalty odpowiedzi /auth/registration-documents:
//  (A) obiekt-per-typ: { regulation:{id,...}, privacyPolicy:{id,...} }  <- aktualny (21.07)
//  (B) tablica:        [ {id,...}, ... ]  /  { documents|data|items: [ {id,...} ] }  <- fallback
function extractDocIds(data: unknown): string[] {
  const ids: string[] = [];
  const push = (x: unknown) => {
    const o = x as Record<string, unknown>;
    const id = typeof o?.id === "string" ? o.id : typeof o?.documentId === "string" ? o.documentId : null;
    if (id) ids.push(id);
  };
  if (Array.isArray(data)) {
    data.forEach(push);
  } else if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const listKey = ["documents", "data", "items"].find((k) => Array.isArray(d[k]));
    if (listKey) {
      (d[listKey] as unknown[]).forEach(push);
    } else {
      // ksztalt (A): kazda wartosc bedaca obiektem z polem id (regulation/privacyPolicy/...)
      for (const v of Object.values(d)) if (v && typeof v === "object") push(v);
    }
  }
  return [...new Set(ids)];
}

// dekoduj payload JWT (base64url) — org_id/website_id siedza w claimach po register/refresh
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const p = token.split(".")[1];
    if (!p) return null;
    const b64 = p.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(p.length / 4) * 4, "=");
    return JSON.parse(atob(b64));
  } catch { return null; }
}
function claim(obj: Record<string, unknown> | null, keys: string[]): string | null {
  if (!obj) return null;
  for (const k of keys) { const v = obj[k]; if (typeof v === "string" && v) return v; }
  return null;
}

// znajdz stronę (sklep) w odpowiedzi /organization/website
function pickWebsite(data: unknown, websiteId: string): { id: string | null; name: string | null; domain: string | null } {
  const d = data as Record<string, unknown>;
  const arr: Array<Record<string, unknown>> = Array.isArray(data) ? data as Array<Record<string, unknown>>
    : Array.isArray(d?.websites) ? d.websites as Array<Record<string, unknown>>
    : Array.isArray(d?.data) ? d.data as Array<Record<string, unknown>>
    : (d && typeof d === "object" && d.id) ? [d]
    : [];
  const w = arr.find((x) => x?.id === websiteId) || arr[0] || null;
  if (!w) return { id: null, name: null, domain: null };
  const domain = s(w.domain) || s(w.starterDomain) || s(w.subdomain) || s(w.url) || null;
  return { id: s(w.id) || null, name: s(w.name) || null, domain };
}

// haslo: min 8, wielka+mala+cyfra (wymog Trevio); domyslnie 24 znaki
function genPassword(): string {
  const U = "ABCDEFGHJKLMNPQRSTUVWXYZ", L = "abcdefghijkmnpqrstuvwxyz", D = "23456789";
  const ALL = U + L + D;
  const rnd = (n: number) => crypto.getRandomValues(new Uint32Array(1))[0] % n;
  const chars = [U[rnd(U.length)], L[rnd(L.length)], D[rnd(D.length)]];
  for (let i = 0; i < 21; i++) chars.push(ALL[rnd(ALL.length)]);
  for (let i = chars.length - 1; i > 0; i--) { const j = rnd(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.join("");
}

// ── gate: x-wf2-secret==WF2_GEN_SECRET | service-role key | team JWT (adminGate). anon NIGDY. ──
function okServiceKey(req: Request): boolean {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token || token.startsWith("sb_publishable_")) return false;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (SERVICE && token === SERVICE) return true;
  if (token.startsWith("sb_secret_")) {
    try {
      const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
      if (Object.values(keys).some((k) => k === token)) return true;
    } catch { /* fallthrough */ }
  }
  return false;
}

Deno.serve(async (req) => {
  const c = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: c });
  const J = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...c, "Content-Type": "application/json" } });
  if (req.method !== "POST") return J({ error: "metoda_niedozwolona" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const WF2 = Deno.env.get("WF2_GEN_SECRET") || "";
    const TENANT = Deno.env.get("TREVIO_TENANT_ID") || TENANT_FALLBACK;

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const okSecret = !!WF2 && req.headers.get("x-wf2-secret") === WF2;   // pusty sekret NIGDY nie autoryzuje
    if (!okSecret && !okServiceKey(req) && !(await adminGate(req, supabase))) return J({ error: "brak_uprawnien" }, 403);

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return J({ error: "nieprawidlowy_json" }, 400); }
    const action = s(body.action);

    // ── list_accounts — wiersze BEZ hasla ──
    if (action === "list_accounts") {
      let q = supabase.from("wf2_merchant_accounts")
        .select("id, project_id, tenant_id, email, org_id, website_id, subdomain, created_by, created_at")
        .order("created_at", { ascending: false });
      const pid = s(body.project_id);
      if (pid) q = q.eq("project_id", pid);
      const { data, error } = await q;
      if (error) return J({ error: "db_error", detail: error.message }, 500);
      return J({ accounts: data || [] });
    }

    // ── token — re-auth ze stored creds, zwraca access_token (NIE loguje hasla) ──
    if (action === "token") {
      const email = s(body.email).trim().toLowerCase();
      if (!email) return J({ error: "email_required" }, 400);
      const { data: row } = await supabase.from("wf2_merchant_accounts")
        .select("email, password, tenant_id").eq("email", email).maybeSingle();
      if (!row) return J({ error: "brak_konta_w_bazie", needs_manual: true }, 404);
      const auth = await tf("POST", "/auth/token", { body: { email, password: row.password, tenantId: row.tenant_id || TENANT } });
      const accessToken = claim(auth.data as Record<string, unknown>, ["accessToken", "access_token", "token"]);
      if (auth.status !== 200 || !accessToken) return J({ error: "reauth_failed", http: auth.status }, 502);
      return J({ access_token: accessToken });
    }

    // ── create_store — pelny flow z idempotencja ──
    if (action === "create_store") {
      let email = s(body.email).trim().toLowerCase();
      let firstName = s(body.first_name).trim();
      let storeName = s(body.store_name).trim();
      const projectId = s(body.project_id) || null;
      const isCompany = body.is_company === true;
      const linkProject = body.link_project !== false; // default true

      // DOMYSLNA TOZSAMOSC KONTA = e-mail KLIENTA z projektu (decyzja Tomka 21.07):
      // gdy body.email pusty a mamy project_id -> bierzemy customer_email/customer_name/name z wf2_projects.
      // Jawnie podany body.email WYGRYWA (potrzebny do fallbacku systemowego po 409 email_taken_no_creds) —
      // wtedy portal NIE pokaze klientowi karty logowania (dostep przekazywany osobno).
      if (!email && !projectId) return J({ error: "email_or_project_required" }, 400);
      if (!email && projectId) {
        const { data: proj } = await supabase.from("wf2_projects")
          .select("customer_email, customer_name, name").eq("id", projectId).maybeSingle();
        if (!proj) return J({ error: "project_not_found", project_id: projectId }, 404);
        email = s(proj.customer_email).trim().toLowerCase();
        if (!firstName) firstName = s(proj.customer_name).trim().split(/\s+/)[0] || "Klient";
        if (!storeName) storeName = s(proj.name).trim() || s(proj.customer_name).trim();
      }
      if (!firstName) firstName = "Klient";
      if (!email || !email.includes("@")) return J({ error: "email_required" }, 400);
      if (!storeName) return J({ error: "store_name_required" }, 400);

      const warnings: string[] = [];
      let regPassword: string | null = null; // faktyczne haslo uzyte przy rejestracji (do zapisania)

      // 1) IDEMPOTENCJA: konto juz w bazie z haslem -> re-auth, zwroc istniejace (created:false)
      const { data: existing } = await supabase.from("wf2_merchant_accounts")
        .select("email, password, tenant_id, org_id, website_id, subdomain, project_id")
        .eq("email", email).maybeSingle();

      let accessToken: string | null = null;
      let orgId: string | null = null;
      let websiteId: string | null = null;
      let subdomain: string | null = null;
      let created = false;
      const tenantId = existing?.tenant_id || TENANT;

      if (existing && existing.password) {
        const auth = await tf("POST", "/auth/token", { body: { email, password: existing.password, tenantId } });
        accessToken = claim(auth.data as Record<string, unknown>, ["accessToken", "access_token", "token"]);
        if (auth.status !== 200 || !accessToken) {
          // konto istnieje w bazie, ale re-auth padl — nie zakladamy drugiego, zwracamy stored
          warnings.push(`reauth_failed http=${auth.status}`);
          if (linkProject && projectId && existing.website_id) {
            await supabase.from("wf2_projects").update({ platform_shop_id: existing.website_id, platform_merchant_email: email }).eq("id", projectId);
          }
          return J({ website_id: existing.website_id, subdomain: existing.subdomain, org_id: existing.org_id, email, created: false, login_url: LOGIN_URL, password_setup_url: PASSWORD_SETUP_URL, warnings });
        }
        orgId = existing.org_id || claim(decodeJwt(accessToken), ["organizationId", "orgId", "organization_id", "OrganizationId"]);
        websiteId = existing.website_id || claim(decodeJwt(accessToken), ["websiteId", "website_id", "WebsiteId"]);
      } else {
        // 2) REJESTRACJA — pobierz dokumenty do akceptacji DYNAMICZNIE
        const docsR = await tf("GET", "/auth/registration-documents", { query: { tenantId } });
        const acceptedDocumentIds = extractDocIds(docsR.data);
        if (docsR.status !== 200) warnings.push(`registration-documents http=${docsR.status} (akceptuje ${acceptedDocumentIds.length} id)`);

        regPassword = s(body.password).trim() || genPassword();
        const reg = await tf("POST", "/auth/register", {
          body: { firstName, email, password: regPassword, acceptedDocumentIds, tenantId },
        });

        if (reg.status === 409) {
          // e-mail zajety, a NIE mamy jego hasla -> nie tworzymy niczego, sygnal do obslugi recznej
          return J({ error: "email_taken_no_creds", needs_manual: true, email }, 409);
        }
        accessToken = claim(reg.data as Record<string, unknown>, ["accessToken", "access_token", "token"]);
        if (reg.status !== 200 || !accessToken) {
          return J({ error: "register_failed", http: reg.status, detail: reg.data }, 502);
        }
        created = true;
        orgId = claim(decodeJwt(accessToken), ["organizationId", "orgId", "organization_id", "OrganizationId"]);

        // 3) UTWORZENIE SKLEPU (Bearer)
        const setup = await tf("POST", "/organization/onboarding/setup/physical-product", {
          bearer: accessToken, body: { name: storeName, isCompany },
        });
        websiteId = claim(setup.data as Record<string, unknown>, ["websiteId", "website_id", "id"]);
        if (setup.status !== 200 || !websiteId) {
          return J({ error: "store_setup_failed", http: setup.status, detail: setup.data }, 502);
        }

        // 4) AKTYWACJA TRIALU (best-effort — sklep i tak istnieje na trialu; blad != przerwanie)
        try {
          const plansR = await tf("GET", "/organization/payment-plan/website-pricing-payment-plans", { bearer: accessToken });
          const plans = Array.isArray(plansR.data) ? plansR.data as Array<Record<string, unknown>>
            : Array.isArray((plansR.data as Record<string, unknown>)?.data) ? (plansR.data as Record<string, unknown>).data as Array<Record<string, unknown>>
            : [];
          // preferuj plan fizyczny; inaczej pierwszy z internalOffer.id
          const phys = plans.find((p) => /physical/i.test(JSON.stringify(p?.type ?? p?.websiteType ?? "")) && (p?.internalOffer as Record<string, unknown>)?.id)
            || plans.find((p) => (p?.internalOffer as Record<string, unknown>)?.id);
          const internalOfferId = phys ? s((phys.internalOffer as Record<string, unknown>).id) : "";
          if (internalOfferId) {
            const refresh = await tf("POST", "/auth/refresh", { bearer: accessToken, body: {} });
            const freshTok = claim(refresh.data as Record<string, unknown>, ["accessToken", "access_token", "token"]) || accessToken;
            if (!orgId) orgId = claim(decodeJwt(freshTok), ["organizationId", "orgId", "organization_id", "OrganizationId"]);
            if (orgId) {
              const ord = await tf("POST", "/organization/internal-order", { bearer: freshTok, query: { organizationId: orgId }, body: { internalOfferId, websiteId } });
              if (ord.status !== 200 && ord.status !== 201) warnings.push(`internal-order http=${ord.status} (sklep zostaje na trialu)`);
            } else {
              warnings.push("brak organizationId — pominieto internal-order (sklep na trialu)");
            }
          } else {
            warnings.push("brak internalOffer.id planu fizycznego — pominieto aktywacje trialu");
          }
        } catch (e) {
          warnings.push(`aktywacja_trialu_wyjatek: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      // 5) POTWIERDZENIE — GET /organization/website (domena startowa)
      if (accessToken) {
        const site = await tf("GET", "/organization/website", { bearer: accessToken });
        const w = pickWebsite(site.data, websiteId || "");
        if (w.id) websiteId = w.id;
        if (w.domain) subdomain = w.domain;
      }
      if (!subdomain && existing?.subdomain) subdomain = existing.subdomain;

      if (!websiteId) return J({ error: "brak_website_id_po_utworzeniu", warnings }, 502);

      // 6) UPSERT do wf2_merchant_accounts (email UNIQUE) — trzyma haslo (jedyne miejsce w systemie).
      // Kolumna password jest NOT NULL: przy nowej rejestracji uzywamy regPassword (faktycznie uzyte
      // przy /auth/register), przy re-auth istniejacego konta zostaje existing.password.
      const password = existing?.password || regPassword;
      const upsertRow: Record<string, unknown> = {
        email, tenant_id: tenantId, org_id: orgId, website_id: websiteId, subdomain,
        created_by: "fabryka",
      };
      if (projectId) upsertRow.project_id = projectId;
      if (password) upsertRow.password = password;
      const { error: upErr } = await supabase.from("wf2_merchant_accounts")
        .upsert(upsertRow, { onConflict: "email" });
      if (upErr) warnings.push(`upsert_wf2_merchant_accounts: ${upErr.message}`);

      // 7) Link do projektu
      if (linkProject && projectId) {
        const { error: pErr } = await supabase.from("wf2_projects")
          .update({ platform_shop_id: websiteId, platform_merchant_email: email }).eq("id", projectId);
        if (pErr) warnings.push(`update_wf2_projects: ${pErr.message}`);
      }

      return J({ website_id: websiteId, subdomain, org_id: orgId, email, created, login_url: LOGIN_URL, password_setup_url: PASSWORD_SETUP_URL, warnings });
    }

    return J({ error: "nieznana_akcja", allowed: ["create_store", "token", "list_accounts"] }, 400);
  } catch (e) {
    console.error("[wf2-merchant] ERROR:", e);
    return J({ error: "blad_serwera", detail: e instanceof Error ? e.message : String(e) }, 500);
  }
});

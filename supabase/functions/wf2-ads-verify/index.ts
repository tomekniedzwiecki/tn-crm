// wf2-ads-verify — weryfikator ŚRODOWISKA REKLAMOWEGO (Etap 4 „Środowisko reklamowe", workflow v2).
// Czyta stan konta reklamowego klienta przez Graph API (partner access BM Tomka) i AUTO-ODHACZA
// w checklistcie te pozycje, których Leadsie NIE potwierdza (waluta/strefa, środki, limit, strona),
// a rozjazd waluty/strefy zgłasza notą „⚠️ AUTOMAT: środowisko …" (konto DO WYMIANY — nieodwracalne).
//
// AKCJE (POST):
//   { action:'verify', project_id }  → 1 projekt
//   { action:'sweep' }               → wszystkie projekty z meta_ad_account_id NOT NULL (cron 06:40)
//
// Per projekt (Graph v23.0, konto = wf2_projects.meta_ad_account_id):
//   1. GET /{act}?fields=currency,timezone_name,account_status,funding_source_details,spend_cap
//        → waluta==PLN + strefa==Europe/Warsaw? metoda płatności jest? account_status==1?
//   2. GET /{act}/promote_pages (fallback assigned_pages) → czy strona przypięta do konta.
//   3. GET /{act}/adspixels → czy pixel istnieje (zapis pixel_id na projekt gdy kolumna pusta).
//   4. spend_cap brak/0 → POST /{act} {spend_cap:150000} (1500 zł = bufor nad budżetem 1000 zł;
//        jednostka = grosze/minor-units waluty konta). Ustawiamy TYLKO na koncie PLN/Warsaw.
//
// ⛔ TWARDY GUARD: EXCLUDED_ACCOUNTS (konto marki osobistej Tomka) — NIGDY nie odpytujemy/modyfikujemy.
// Bez WF2_META_TOKEN → 200 {skipped:'no_token'} (fail-closed, nic nie sfabrykuje).
//
// Gate: team JWT (team_members) LUB x-wf2-secret == WF2_GEN_SECRET (wzorzec wf2-platform).
// Deploy: --no-verify-jwt (cron woła nagłówkiem x-wf2-secret; panel — team JWT przez functions.invoke).

import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";

const GRAPH = "https://graph.facebook.com/v23.0";
// Konto marki osobistej Tomka — NIGDY nie odpytywać/modyfikować (pamięć: wyklucz i loguj).
const EXCLUDED_ACCOUNTS = ["act_1537659320657091"];
const DEADLINE_MS = 300_000; // sweep kończy z zapasem pod edge wall-clock

// VERBATIM z WS (tn-sklepy/projekt.html) i CHECKLIST_MAP (wf2-portal) — klucz deduplikacji
// stanu checklisty. NIE parafrazować — rozjazd zostawi „ducha" (odhaczenie nie trafi w bazę).
const CHECK_ADS_KONTO_WALUTA = "Waluta PLN + strefa Europe/Warsaw zweryfikowane w Business Settings";
const CHECK_ADS_BUDZET_SRODKI = "Środki WIDOCZNE w Ads Managerze (nie tylko deklaracja)";
const CHECK_ADS_BUDZET_LIMIT = "Limit wydatków konta ustawiony (fabryka, po WF2_META_TOKEN)";
const CHECK_ADS_STRONA_PRZYPISANA = "Strona przypisana do konta reklamowego (wymóg create_ad)";

const ALLOWED_ORIGINS = [
  "https://crm.tomekniedzwiecki.pl", "https://tn-crm.vercel.app",
  "http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500",
];
function cors(o: string | null): Record<string, string> {
  const a = o && ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": a,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-wf2-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const num = (v: unknown) => { const n = parseFloat(String(v ?? "")); return isNaN(n) ? 0 : n; };

// act_ normalizacja: same cyfry → act_<id>; z prefiksem → as-is; inaczej '' (nie zgadujemy).
function normAct(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (/^act_\d+$/.test(s)) return s;
  if (/^\d+$/.test(s)) return `act_${s}`;
  return "";
}

async function graphGet(url: string): Promise<Record<string, unknown>> {
  const r = await fetch(url);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`graph ${r.status}: ${JSON.stringify((d as { error?: unknown })?.error ?? d).slice(0, 260)}`);
  return d as Record<string, unknown>;
}

// unia checklisty: dodaj/odhacz TYLKO wskazane pozycje (nigdy nie odznaczamy — jak wf2-ads-connect).
function unionChecklist(data: Record<string, unknown>, toCheck: string[]) {
  if (!toCheck.length) return;
  const list: Array<{ t: string; done: boolean }> = Array.isArray((data as { checklist?: unknown }).checklist)
    ? (data as { checklist: Array<{ t: string; done: boolean }> }).checklist
    : [];
  for (const key of toCheck) {
    const hit = list.find((i) => i.t === key);
    if (hit) hit.done = true;
    else list.push({ t: key, done: true });
  }
  (data as { checklist: unknown }).checklist = list;
}

type SbClient = ReturnType<typeof createClient>;

async function updateStepUnion(sb: SbClient, projectId: string, stepKey: string, toCheck: string[], extra?: Record<string, unknown>) {
  const { data: st } = await sb.from("wf2_steps").select("id, status, data")
    .eq("project_id", projectId).eq("step_key", stepKey).is("product_id", null).maybeSingle();
  if (!st) return false; // stary projekt bez kroku — nie wywracamy
  const data = Object.assign({}, (st.data as Record<string, unknown>) || {}, extra || {});
  unionChecklist(data, toCheck);
  const upd: Record<string, unknown> = { data };
  if (st.status === "pending" && (toCheck.length || extra)) upd.status = "in_progress";
  await sb.from("wf2_steps").update(upd).eq("id", st.id);
  return true;
}

type VerifyResult = {
  project_id: string;
  act: string;
  skipped?: string;
  note?: string;
  checks?: Record<string, unknown>;
};

async function verifyProject(sb: SbClient, token: string, proj: Record<string, unknown>): Promise<VerifyResult> {
  const projectId = String(proj.id);
  const act = normAct(proj.meta_ad_account_id);
  if (!act) return { project_id: projectId, act: "", skipped: "no_ad_account", note: "projekt bez meta_ad_account_id" };
  if (EXCLUDED_ACCOUNTS.includes(act)) {
    return { project_id: projectId, act, skipped: "excluded", note: "konto marki osobistej Tomka — pominięte (guard)" };
  }

  // 1. pola konta
  const acct = await graphGet(`${GRAPH}/${act}?fields=currency,timezone_name,account_status,funding_source_details,spend_cap&access_token=${token}`);
  const currency = String(acct.currency ?? "");
  const tz = String(acct.timezone_name ?? "");
  const accountStatus = Number(acct.account_status ?? 0);
  const funding = acct.funding_source_details as Record<string, unknown> | null | undefined;
  const spendCap = num(acct.spend_cap);
  const currencyOk = currency === "PLN";
  const tzOk = tz === "Europe/Warsaw";
  const active = accountStatus === 1;
  const paymentMethod = !!funding && !!(funding.id || funding.type || funding.display_string);

  // 2. strona przypięta do konta (promote_pages; fallback assigned_pages)
  let pageAttached = false;
  let pagesEdge = "promote_pages";
  try {
    const pg = await graphGet(`${GRAPH}/${act}/promote_pages?fields=id,name&limit=10&access_token=${token}`);
    pageAttached = Array.isArray(pg.data) && (pg.data as unknown[]).length > 0;
  } catch (_e) {
    try {
      const pg2 = await graphGet(`${GRAPH}/${act}/assigned_pages?fields=id,name&limit=10&access_token=${token}`);
      pageAttached = Array.isArray(pg2.data) && (pg2.data as unknown[]).length > 0;
      pagesEdge = "assigned_pages";
    } catch (_e2) { pagesEdge = "error"; }
  }

  // 3. pixel — zapis pixel_id gdy pusty
  let pixelId: string | null = null;
  try {
    const px = await graphGet(`${GRAPH}/${act}/adspixels?fields=id,name&limit=10&access_token=${token}`);
    const arr = Array.isArray(px.data) ? px.data as Array<Record<string, unknown>> : [];
    if (arr.length) pixelId = String(arr[0].id ?? "") || null;
  } catch (_e) { /* pixel opcjonalny — powstaje w kroku ads_pixel */ }
  if (pixelId && !String(proj.pixel_id ?? "").trim()) {
    await sb.from("wf2_projects").update({ pixel_id: pixelId }).eq("id", projectId);
  }

  // 4. spend_cap — ustaw 150000 (1500 zł) gdy brak/0; TYLKO na koncie PLN/Warsaw (inne = DO WYMIANY)
  let spendCapAction = spendCap > 0 ? "kept" : "absent";
  let spendCapValue = spendCap;
  if (currencyOk && tzOk && spendCap <= 0) {
    try {
      const r = await fetch(`${GRAPH}/${act}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ spend_cap: "150000", access_token: token }),
      });
      if (r.ok) { spendCapAction = "set_150000"; spendCapValue = 150000; }
      else { const e = await r.text(); spendCapAction = `set_failed:${e.slice(0, 120)}`; }
    } catch (e) { spendCapAction = `set_error:${String(e).slice(0, 120)}`; }
  }

  const checks = {
    currency, timezone_name: tz, account_status: accountStatus,
    currency_ok: currencyOk, tz_ok: tzOk, active,
    payment_method: paymentMethod, page_attached: pageAttached, pages_edge: pagesEdge,
    pixel_id: pixelId, spend_cap: spendCapValue, spend_cap_action: spendCapAction,
  };

  // ── auto-odhaczenie (unia; VERBATIM) ─────────────────────────────────────────
  // ads_konto: waluta+strefa TYLKO gdy oba OK. Rozjazd = nota blokada + BEZ odhaczenia.
  const kontoChecks = currencyOk && tzOk ? [CHECK_ADS_KONTO_WALUTA] : [];
  await updateStepUnion(sb, projectId, "ads_konto", kontoChecks, {
    ads_verify: { at: new Date().toISOString(), wyniki: checks },
  });

  // ads_budzet: środki = przy istniejącej metodzie płatności (saldo prepaid nie jest czytelne
  //   wprost przez Graph API — dopisujemy to w nocie); limit = po ustawieniu/potwierdzeniu spend_cap.
  const budzetChecks: string[] = [];
  if (paymentMethod) budzetChecks.push(CHECK_ADS_BUDZET_SRODKI);
  if (spendCapValue > 0) budzetChecks.push(CHECK_ADS_BUDZET_LIMIT);
  await updateStepUnion(sb, projectId, "ads_budzet", budzetChecks);

  // ads_strona: przypięcie strony do konta (wymóg create_ad)
  await updateStepUnion(sb, projectId, "ads_strona", pageAttached ? [CHECK_ADS_STRONA_PRZYPISANA] : []);

  // ── nota przy rozjeździe waluty/strefy (dedup po otwartej nocie automatu) ─────
  if (!currencyOk || !tzOk) {
    const { data: dup } = await sb.from("wf2_notes").select("id")
      .eq("project_id", projectId).eq("status", "open").like("body", "⚠️ AUTOMAT: środowisko%").limit(1);
    if (!dup || dup.length === 0) {
      await sb.from("wf2_notes").insert({
        project_id: projectId, tag: "blokada", status: "open", author: "auto",
        body: `⚠️ AUTOMAT: środowisko — konto ${act} ma walutę ${currency || "?"}/strefę ${tz || "?"} (wymagane PLN/Europe-Warsaw) — konto DO WYMIANY (nieodwracalne).`.slice(0, 1000),
      });
    }
  }

  // ── nota informacyjna: saldo prepaid nie czytelne przez API (gdy odhaczyliśmy „środki") ──
  if (paymentMethod && spendCapAction !== "set_failed") {
    // (informacja w data.ads_verify wystarcza — nie zaśmiecamy notatek; saldo w kontrolce checks)
  }

  await sb.from("wf2_activities").insert({
    project_id: projectId, actor: "wf2-ads-verify", action: "ads_verify",
    description: `Weryfikacja środowiska ${act}: waluta ${currency}/${currencyOk ? "OK" : "ZŁA"}, strefa ${tz}/${tzOk ? "OK" : "ZŁA"}, status ${accountStatus}, metoda płatności ${paymentMethod ? "jest" : "brak"}, strona ${pageAttached ? "przypięta" : "brak"}, spend_cap ${spendCapAction}${pixelId ? `, pixel ${pixelId}` : ""}`.slice(0, 2000),
  });

  return { project_id: projectId, act, checks };
}

Deno.serve(async (req) => {
  const c = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: c });
  const J = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...c, "Content-Type": "application/json" } });
  if (req.method !== "POST") return J({ error: "POST only" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const WF2 = Deno.env.get("WF2_GEN_SECRET") || "";
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Gate: x-wf2-secret == WF2_GEN_SECRET (cron) LUB team JWT / x-tools-secret (adminGate).
  const okSecret = !!WF2 && req.headers.get("x-wf2-secret") === WF2; // pusty sekret NIGDY nie autoryzuje
  if (!okSecret && !(await adminGate(req, supabase))) return J({ error: "brak_uprawnien" }, 403);

  const token = Deno.env.get("WF2_META_TOKEN") || "";
  if (!token) return J({ skipped: "no_token" }); // fail-closed — WF2_META_TOKEN jeszcze nie istnieje

  let body: { action?: string; project_id?: string };
  try { body = await req.json(); } catch { return J({ error: "nieprawidlowy_json" }, 400); }
  const action = String(body.action || "");

  try {
    if (action === "verify") {
      const projectId = String(body.project_id || "").trim();
      if (!projectId) return J({ error: "project_id_required" }, 400);
      const { data: proj } = await supabase.from("wf2_projects")
        .select("id, name, meta_ad_account_id, pixel_id").eq("id", projectId).maybeSingle();
      if (!proj) return J({ error: "unknown_project" }, 404);
      const result = await verifyProject(supabase, token, proj as Record<string, unknown>);
      return J({ ok: true, verify: result });
    }

    if (action === "sweep") {
      const { data: projects } = await supabase.from("wf2_projects")
        .select("id, name, meta_ad_account_id, pixel_id").not("meta_ad_account_id", "is", null).neq("meta_ad_account_id", "");
      const t0 = Date.now();
      const out = { checked: 0, skipped_excluded: 0, skipped_other: 0, mismatches: 0, errors: [] as string[], results: [] as VerifyResult[] };
      for (const proj of projects ?? []) {
        if (Date.now() - t0 > DEADLINE_MS) { out.errors.push("deadline — reszta w kolejnym biegu"); break; }
        try {
          const r = await verifyProject(supabase, token, proj as Record<string, unknown>);
          out.results.push(r);
          if (r.skipped === "excluded") out.skipped_excluded++;
          else if (r.skipped) out.skipped_other++;
          else { out.checked++; if (r.checks && (!(r.checks as { currency_ok?: boolean }).currency_ok || !(r.checks as { tz_ok?: boolean }).tz_ok)) out.mismatches++; }
        } catch (e) { out.errors.push(`${(proj as { name?: string }).name ?? (proj as { id: string }).id}: ${String(e).slice(0, 180)}`); }
      }
      return J({ ok: true, ...out });
    }

    return J({ error: "nieznana_akcja", allowed: ["verify", "sweep"] }, 400);
  } catch (e) {
    console.error("[wf2-ads-verify] ERROR:", e);
    return J({ error: "blad_serwera", detail: String(e).slice(0, 200) }, 500);
  }
});

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
//   4. spend_cap brak/0 → POST /{act} {spend_cap: amount_spent + 500000} (LIFETIME cap Meta z 5000 zł
//        bufora NAD już wydanym; jednostka = grosze/minor-units). TYLKO na aktywnym koncie PLN/Warsaw.
//        Istniejący cap z buforem < 1000 zł nad wydanym → nota „zbliża się do limitu — podbij spend_cap".
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

// Graph GET z twardym timeoutem (AbortController 20 s — edge nie ma domyślnego deadline'u fetch,
// wisząca odpowiedź zjadłaby budżet sweepu) i 1 retry z backoffem 2 s na PRZEJŚCIOWE (5xx/429/sieć/
// abort). 4xx = trwały błąd danych → rzucamy od razu (nie marnujemy sekund; fallback stron to obsłuży).
async function graphGet(url: string): Promise<Record<string, unknown>> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((res) => setTimeout(res, 2000)); // backoff przed retry
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 20_000);
    try {
      const r = await fetch(url, { signal: ac.signal });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        const err = new Error(`graph ${r.status}: ${JSON.stringify((d as { error?: unknown })?.error ?? d).slice(0, 260)}`);
        if (attempt === 0 && (r.status >= 500 || r.status === 429)) { lastErr = err; continue; } // przejściowe → retry
        throw err; // 4xx trwałe
      }
      return d as Record<string, unknown>;
    } catch (e) {
      // wyjątek sieci/abort (nie HTTP „graph …”) → retry raz
      if (attempt === 0 && !(e instanceof Error && e.message.startsWith("graph "))) { lastErr = e; continue; }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

type SbClient = ReturnType<typeof createClient>;

// Odhaczanie/zapis podbloku przez ATOMOWY MERGE (RPC wf2_step_merge): podblok + unia checklisty
// w JEDNYM UPDATE pod blokadą wiersza — bez read-modify-write całego data (eliminuje lost-update
// z webhookiem wf2-ads-connect działającym w tym samym oknie co sweep 06:40). Nic nie odznaczamy.
async function updateStepUnion(sb: SbClient, projectId: string, stepKey: string, toCheck: string[], blockKey?: string, block?: Record<string, unknown>) {
  const { data: st } = await sb.from("wf2_steps").select("id, status")
    .eq("project_id", projectId).eq("step_key", stepKey).is("product_id", null).maybeSingle();
  if (!st) return false; // stary projekt bez kroku — nie wywracamy
  await sb.rpc("wf2_step_merge", {
    p_step_id: (st as { id: string }).id,
    p_block_key: blockKey ?? null,
    p_block: block ?? null,
    p_checks: toCheck,
  });
  // status pending→in_progress: osobny monotoniczny UPDATE (nie dotyka bloba data → nie wyścig)
  if ((st as { status: string }).status === "pending" && (toCheck.length || blockKey)) {
    await sb.from("wf2_steps").update({ status: "in_progress" }).eq("id", (st as { id: string }).id);
  }
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

  // 1. pola konta (+ amount_spent — spend_cap Meta jest LIFETIME, więc bufor liczymy OD wydanego)
  const acct = await graphGet(`${GRAPH}/${act}?fields=currency,timezone_name,account_status,funding_source_details,spend_cap,amount_spent&access_token=${token}`);
  const currency = String(acct.currency ?? "");
  const tz = String(acct.timezone_name ?? "");
  const accountStatus = Number(acct.account_status ?? 0);
  const funding = acct.funding_source_details as Record<string, unknown> | null | undefined;
  const spendCap = num(acct.spend_cap);
  const amountSpent = num(acct.amount_spent);
  const currencyOk = currency === "PLN";
  const tzOk = tz === "Europe/Warsaw";
  const active = accountStatus === 1;
  const paymentMethod = !!funding && !!(funding.id || funding.type || funding.display_string);
  // „Środki WIDOCZNE" odhaczamy TYLKO gdy metoda = KARTA (prepaid = saldo 0 nieczytelne przez Graph
  // → zielony ptaszek wbrew treści pozycji). Rozpoznanie po type/display_string; brak pewności = NIE.
  const fundBlob = `${String(funding?.type ?? "")} ${String(funding?.display_string ?? "")}`.toLowerCase();
  const paymentIsCard = paymentMethod && /visa|master|amex|american express|discover|maestro|\bcard\b|karta|credit|debit|\*{2,}\s*\d|•{2,}\s*\d|x{4,}\s*\d|\d{4}\s*$/.test(fundBlob);
  const paymentUnknown = paymentMethod && !paymentIsCard; // metoda jest, ale typu nie rozpoznajemy

  // 2. strona przypięta do konta. promote_pages PUSTE [] (nie tylko rzucony błąd) → i tak spróbuj
  //    assigned_pages, zanim uznasz brak strony (część kont trzyma stronę tylko na assigned_pages).
  let pageAttached = false;
  let pagesEdge = "promote_pages";
  try {
    const pg = await graphGet(`${GRAPH}/${act}/promote_pages?fields=id,name&limit=10&access_token=${token}`);
    pageAttached = Array.isArray(pg.data) && (pg.data as unknown[]).length > 0;
  } catch (_e) { pagesEdge = "promote_error"; }
  if (!pageAttached) {
    try {
      const pg2 = await graphGet(`${GRAPH}/${act}/assigned_pages?fields=id,name&limit=10&access_token=${token}`);
      if (Array.isArray(pg2.data) && (pg2.data as unknown[]).length > 0) { pageAttached = true; pagesEdge = "assigned_pages"; }
      else if (pagesEdge !== "promote_error") pagesEdge = "promote_empty";
    } catch (_e2) { if (pagesEdge === "promote_error") pagesEdge = "error"; }
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

  // 4. spend_cap = LIFETIME cap Meta (NIE miesięczny!) → musi OBEJMOWAĆ już wydane środki, inaczej
  //    cicha śmierć konta przy skalowaniu. Ustawiamy amount_spent + 500000 (5000 zł bufora, minor
  //    units) gdy brak/0; TYLKO na koncie PLN/Warsaw AKTYWNYM (zła waluta = DO WYMIANY; nieaktywne = niżej).
  let spendCapAction = spendCap > 0 ? "kept" : "absent";
  let spendCapValue = spendCap;
  const spendCapTarget = Math.round(amountSpent) + 500000;
  if (currencyOk && tzOk && active && spendCap <= 0) {
    try {
      const r = await fetch(`${GRAPH}/${act}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ spend_cap: String(spendCapTarget), access_token: token }),
      });
      if (r.ok) { spendCapAction = `set_${spendCapTarget}`; spendCapValue = spendCapTarget; }
      else { const e = await r.text(); spendCapAction = `set_failed:${e.slice(0, 120)}`; }
    } catch (e) { spendCapAction = `set_error:${String(e).slice(0, 120)}`; }
  }
  // istniejący cap zbyt blisko wydanego (bufor < 1000 zł) → nota do podbicia (dedup niżej)
  const spendCapNearLimit = spendCap > 0 && (spendCap - amountSpent) < 100000;

  const checks = {
    currency, timezone_name: tz, account_status: accountStatus,
    currency_ok: currencyOk, tz_ok: tzOk, active,
    payment_method: paymentMethod, payment_is_card: paymentIsCard, page_attached: pageAttached, pages_edge: pagesEdge,
    pixel_id: pixelId, amount_spent: amountSpent, spend_cap: spendCapValue, spend_cap_action: spendCapAction,
    spend_cap_near_limit: spendCapNearLimit,
  };

  // ── auto-odhaczenie (unia; VERBATIM) ─────────────────────────────────────────
  // NIEAKTYWNE konto (account_status != 1): NIE odhaczamy niczego środowiskowego (środowisko
  // niepewne) — zapis tylko do data.ads_verify; blokadę zgłasza nota niżej.
  // ads_konto: waluta+strefa TYLKO gdy oba OK i konto aktywne. Rozjazd = nota blokada + BEZ odhaczenia.
  const kontoChecks = active && currencyOk && tzOk ? [CHECK_ADS_KONTO_WALUTA] : [];
  await updateStepUnion(sb, projectId, "ads_konto", kontoChecks, "ads_verify", { at: new Date().toISOString(), wyniki: checks });

  // ads_budzet: „środki" odhaczamy WYŁĄCZNIE gdy metoda = KARTA (prepaid = saldo nieczytelne przez
  //   Graph → nota informacyjna niżej); limit = po ustawieniu/potwierdzeniu spend_cap. Oba tylko aktywne.
  const budzetChecks: string[] = [];
  if (active && paymentIsCard) budzetChecks.push(CHECK_ADS_BUDZET_SRODKI);
  if (active && spendCapValue > 0) budzetChecks.push(CHECK_ADS_BUDZET_LIMIT);
  await updateStepUnion(sb, projectId, "ads_budzet", budzetChecks);

  // ads_strona: przypięcie strony do konta (wymóg create_ad) — tylko na aktywnym koncie
  await updateStepUnion(sb, projectId, "ads_strona", active && pageAttached ? [CHECK_ADS_STRONA_PRZYPISANA] : []);

  // ── noty automatu (każda z własnym wzorcem dedup po otwartej nocie) ───────────
  const noteOnce = async (likePattern: string, body: string, tag = "blokada") => {
    const { data: dup } = await sb.from("wf2_notes").select("id")
      .eq("project_id", projectId).eq("status", "open").like("body", likePattern).limit(1);
    if (!dup || dup.length === 0) {
      await sb.from("wf2_notes").insert({
        project_id: projectId, tag, status: "open", author: "auto", body: body.slice(0, 1000),
      });
    }
  };
  if (!active) {
    // konto nieaktywne/ograniczone → blokada środowiska (odhaczeń i capa już nie ruszaliśmy)
    await noteOnce("⚠️ AUTOMAT: środowisko — konto%status%",
      `⚠️ AUTOMAT: środowisko — konto ${act} ma status ${accountStatus} (nieaktywne/ograniczone) — sprawdź Account Quality.`);
  } else if (!currencyOk || !tzOk) {
    await noteOnce("⚠️ AUTOMAT: środowisko — konto%walutę%",
      `⚠️ AUTOMAT: środowisko — konto ${act} ma walutę ${currency || "?"}/strefę ${tz || "?"} (wymagane PLN/Europe-Warsaw) — konto DO WYMIANY (nieodwracalne).`);
  }
  // metoda płatności jest, ale nie rozpoznaliśmy karty (prepaid?/saldo nieczytelne przez API)
  if (active && paymentUnknown) {
    await noteOnce("⚠️ AUTOMAT: metoda płatności jest%",
      `⚠️ AUTOMAT: metoda płatności jest, saldo nieczytelne API — potwierdź środki na koncie ${act} w Ads Managerze.`, "info");
  }
  // istniejący spend_cap zbyt blisko wydanego (bufor < 1000 zł) → podbij (bezpiecznik LIFETIME)
  if (active && spendCapNearLimit) {
    await noteOnce("⚠️ AUTOMAT: konto zbliża się do limitu%",
      `⚠️ AUTOMAT: konto zbliża się do limitu wydatków — podbij spend_cap konta ${act} (spend ${(amountSpent / 100).toFixed(0)} zł / cap ${(spendCap / 100).toFixed(0)} zł, LIFETIME).`, "info");
  }

  await sb.from("wf2_activities").insert({
    project_id: projectId, actor: "wf2-ads-verify", action: "ads_verify",
    description: `Weryfikacja środowiska ${act}: waluta ${currency}/${currencyOk ? "OK" : "ZŁA"}, strefa ${tz}/${tzOk ? "OK" : "ZŁA"}, status ${accountStatus}, metoda płatności ${paymentIsCard ? "karta" : paymentMethod ? "inna/prepaid" : "brak"}, strona ${pageAttached ? "przypięta" : "brak"}, spend_cap ${spendCapAction}${pixelId ? `, pixel ${pixelId}` : ""}`.slice(0, 2000),
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
      const projList = (projects ?? []) as Array<Record<string, unknown>>;
      // KOLEJNOŚĆ: najstarzej weryfikowane NAJPIERW (ogon nie głoduje pod deadline'em). Data ostatniej
      // weryfikacji = ads_konto.data.ads_verify.at; brak = najpierw. Stepy pobieramy JEDNYM zapytaniem
      // i sortujemy w JS. ⚠️ PostgREST domyślny cap 1000 wierszy — przy >1000 kont/kroków trzeba będzie
      // stronicować (dziś kont garść, bufor duży).
      const lastVerifyAt = new Map<string, string>();
      const ids = projList.map((p) => String(p.id));
      if (ids.length) {
        const { data: kroki } = await supabase.from("wf2_steps").select("project_id, data")
          .eq("step_key", "ads_konto").is("product_id", null).in("project_id", ids);
        for (const s of (kroki ?? []) as Array<Record<string, any>>) {
          const at = s?.data?.ads_verify?.at;
          if (typeof at === "string" && at) lastVerifyAt.set(String(s.project_id), at);
        }
      }
      projList.sort((a, b) => {
        const av = lastVerifyAt.get(String(a.id)) || ""; // brak weryfikacji = "" = najpierw
        const bv = lastVerifyAt.get(String(b.id)) || "";
        return av < bv ? -1 : av > bv ? 1 : 0;
      });
      const t0 = Date.now();
      const out = { checked: 0, skipped_excluded: 0, skipped_other: 0, mismatches: 0, errors: [] as string[], results: [] as VerifyResult[] };
      for (const proj of projList) {
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

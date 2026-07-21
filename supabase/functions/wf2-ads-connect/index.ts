// wf2-ads-connect — webhook Leadsie (Etap 4 „Środowisko reklamowe", workflow v2).
// Leadsie wysyła POST po każdym połączeniu klienta na naszym connect-linku
// (format v2: user = customUserId z URL-a requestu, connectionAssets[] per zasób).
// Link dla klienta dostaje ?customUserId=<wf2_projects.id> — stąd mapowanie na projekt.
//
// Co robi: zapisuje stan połączeń do wf2_steps (ads_konto/ads_strona).data.leadsie,
// podbija status pending→in_progress, odhacza w checklistcie ads_konto pozycję
// „Partner access…" gdy konto reklamowe jest Connected z poziomem Manage/Owner,
// loguje wf2_activities, a przy problemach (FAILED/braki uprawnień) zostawia notę
// „⚠️ AUTOMAT: Leadsie…" (dedup po otwartych notach). NIC nie odhacza „na wyrost" —
// waluta/strefa/2FA/karta = weryfikacja w ads_pixel/ads_preflight (WF2_META_TOKEN),
// nie na podstawie webhooka.
//
// ⚠️ DEPLOY: --no-verify-jwt (POST przychodzi z serwerów Leadsie, bez JWT).
// Gate: ?s=<WF2_LEADSIE_SECRET> — Leadsie nie podpisuje webhooków, sekret żyje w URL-u
// wklejonym w ich dashboardzie (Settings → Webhooks, format v2). Brak env = 503 fail-closed.

import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type LeadsieAsset = {
  id?: string;
  name?: string;
  type?: string;
  platform?: string;
  connectionStatus?: string; // Connected / In progress / Insufficient permissions / Not Connected / Unknown
  wasInitialGrantSuccessful?: boolean;
  accessLevel?: string; // Manage / ViewOnly / Owner
  linkToAsset?: string;
  time?: string;
};

// Klasyfikacja zasobu Meta po polach type/platform. Defensywnie po fragmentach nazw —
// Leadsie nie publikuje słownika typów, a literalny match rozjechałby się przy zmianie labelki.
function assetKind(a: LeadsieAsset): "ad_account" | "page" | "pixel" | "instagram" | "catalog" | "bm" | "other" {
  const t = `${a.type || ""} ${a.name || ""}`.toLowerCase();
  const plat = (a.platform || "").toLowerCase();
  if (plat && !/facebook|meta|instagram/.test(plat)) return "other";
  if (/ad\s*account|ads?\b.*konto|konto.*reklam/.test(t) || /\bads\b/.test((a.type || "").toLowerCase())) return "ad_account";
  if (/pixel|dataset/.test(t)) return "pixel";
  if (/instagram/.test(t)) return "instagram";
  if (/catalog|katalog/.test(t)) return "catalog";
  if (/business\s*(manager|portfolio)/.test(t)) return "bm";
  if (/page|strona/.test(t)) return "page";
  return "other";
}

const isConnected = (a: LeadsieAsset) => (a.connectionStatus || "").toLowerCase() === "connected";
const isManage = (a: LeadsieAsset) => /^(manage|owner|admin)$/i.test(a.accessLevel || "");

// VERBATIM z WS w tn-sklepy/projekt.html (klucz deduplikacji checklisty — nie parafrazować!)
const CHECK_PARTNER_ACCESS = "Partner access do BM Tomka — pełna kontrola, 3 assety";

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const secret = Deno.env.get("WF2_LEADSIE_SECRET") || "";
  if (!secret) return json({ error: "not_configured" }, 503);
  const s = new URL(req.url).searchParams.get("s") || "";
  if (s !== secret) return json({ error: "unauthorized" }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch (_) {
    return json({ error: "bad_json" }, 400);
  }

  // v2: user = nasz customUserId (wf2_projects.id doklejone do connect-linku).
  const projectId = String(payload.user || payload.customUserId || "").trim();
  const overallStatus = String(payload.status || "").toUpperCase(); // SUCCESS / PARTIAL_SUCCESS / FAILED
  const clientName = String(payload.clientName || "").slice(0, 200);
  const assets: LeadsieAsset[] = Array.isArray(payload.connectionAssets)
    ? (payload.connectionAssets as LeadsieAsset[])
    : [];

  if (!UUID_RE.test(projectId)) {
    // Zwracamy 200 — retry ze strony Leadsie nie naprawi złego customUserId; ślad w logach.
    console.error("[wf2-ads-connect] orphan webhook — user nie jest uuid projektu:", projectId, clientName);
    return json({ ok: false, reason: "unknown_project" });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: proj } = await supabase
      .from("wf2_projects").select("id, name").eq("id", projectId).maybeSingle();
    if (!proj) {
      console.error("[wf2-ads-connect] projekt nie istnieje:", projectId);
      return json({ ok: false, reason: "unknown_project" });
    }

    const nowIso = new Date().toISOString();
    const metaAssets = assets.filter((a) => assetKind(a) !== "other");
    const summary = metaAssets.map((a) => ({
      kind: assetKind(a),
      name: (a.name || "").slice(0, 120),
      status: a.connectionStatus || "Unknown",
      access: a.accessLevel || null,
      link: a.linkToAsset || null,
    }));

    const adAccountOk = metaAssets.some((a) => assetKind(a) === "ad_account" && isConnected(a) && isManage(a));
    const pageOk = metaAssets.some((a) => assetKind(a) === "page" && isConnected(a));
    const problems = metaAssets.filter((a) => !isConnected(a));

    // blok zapisu per krok — ads_konto dostaje pełny stan, ads_strona lustro części „strona/IG"
    const leadsieBlock = {
      at: nowIso,
      status: overallStatus || null,
      client_name: clientName || null,
      request_url: String(payload.requestUrl || "").slice(0, 500) || null,
      summary_url: String(payload.clientSummaryUrl || "").slice(0, 500) || null,
      assets: summary,
    };

    const stepsTouched: string[] = [];
    for (const stepKey of ["ads_konto", "ads_strona"] as const) {
      const { data: st } = await supabase
        .from("wf2_steps").select("id, status, data")
        .eq("project_id", projectId).eq("step_key", stepKey).is("product_id", null)
        .maybeSingle();
      if (!st) continue; // wf2_ensure_steps tworzy kroki przy projekcie — brak wiersza = stary projekt, nie wywracamy webhooka

      const data = Object.assign({}, (st.data as Record<string, unknown>) || {}, { leadsie: leadsieBlock });

      // auto-odhaczenie TYLKO pozycji, którą webhook faktycznie potwierdza (unia — nigdy nie odznaczamy)
      if (stepKey === "ads_konto" && adAccountOk) {
        const list: Array<{ t: string; done: boolean }> = Array.isArray((data as { checklist?: unknown }).checklist)
          ? (data as { checklist: Array<{ t: string; done: boolean }> }).checklist
          : [];
        const hit = list.find((i) => i.t === CHECK_PARTNER_ACCESS);
        if (hit) hit.done = true;
        else list.push({ t: CHECK_PARTNER_ACCESS, done: true });
        (data as { checklist: unknown }).checklist = list;
      }

      const upd: Record<string, unknown> = { data };
      const relevant = stepKey === "ads_konto" ? adAccountOk : pageOk;
      if (st.status === "pending" && (relevant || metaAssets.length > 0)) upd.status = "in_progress";
      await supabase.from("wf2_steps").update(upd).eq("id", st.id);
      stepsTouched.push(stepKey);
    }

    const assetLine = summary.map((a) => `${a.kind}:${a.status}${a.access ? `/${a.access}` : ""}`).join(", ") || "brak zasobów Meta";
    await supabase.from("wf2_activities").insert({
      project_id: projectId,
      actor: "auto",
      action: "ads_connect",
      description: `Leadsie (${clientName || "klient"}): ${overallStatus || "?"} — ${assetLine}`.slice(0, 2000),
    });

    // nota tylko przy problemach; dedup po otwartej nocie automatu (wzorzec strażnika platformy)
    if (overallStatus === "FAILED" || overallStatus === "PARTIAL_SUCCESS" || problems.length > 0) {
      const { data: dup } = await supabase
        .from("wf2_notes").select("id").eq("project_id", projectId).eq("status", "open")
        .like("body", "⚠️ AUTOMAT: Leadsie%").limit(1);
      if (!dup || dup.length === 0) {
        const braki = problems.map((a) => `${assetKind(a)} (${a.connectionStatus})`).join(", ") || overallStatus;
        await supabase.from("wf2_notes").insert({
          project_id: projectId,
          tag: "blokada",
          status: "open",
          author: "auto",
          body: `⚠️ AUTOMAT: Leadsie — połączenie niepełne (${overallStatus}): ${braki}. Sprawdź w podsumowaniu Leadsie i poproś klienta o ponowne przejście linku.`.slice(0, 1000),
        });
      }
    }

    return json({ ok: true, project: projectId, steps: stepsTouched, ad_account: adAccountOk, page: pageOk });
  } catch (e) {
    console.error("[wf2-ads-connect] ERROR:", e);
    // 500 → Leadsie może ponowić; stan jest idempotentny (unia checklisty, nadpisanie bloku leadsie)
    return json({ error: "server_error" }, 500);
  }
});

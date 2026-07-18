// wf2-ads-sync — dzienny sync wyników Meta dla wf2 (CENNIK-PLAN §2b/§4.2) + pętla wyników kreacji.
//
// Robi:
//  1. Per produkt z campaign_id: Graph API insights level=campaign (time_increment=1, last_7d)
//     → upsert wf2_ad_stats (level='campaign', ad_id='') — TYLKO te wiersze liczy P&L.
//  2. Insights level=ad z metrykami video (3s/p25-100/thruplay/avg watch)
//     → upsert wf2_ad_stats (level='ad') + dopasowanie creative_id po wf2_creatives.meta_ad_ids.
//  3. Health-scan kont: account_status/disable_reason ≠ aktywny → alert do wf2_activities.
//  4. WYKLUCZENIE konta Tomka act 1537659320657091 + log (pamięć: wyklucz i loguj).
//
// Gate: x-wf2-secret == WF2_GEN_SECRET  LUB  x-admin-secret == SPAR_CRON_SECRET.
// Token: WF2_META_TOKEN (system user, partner access do BM klientów) — BRAK sekretu =>
//   200 {skipped} (cichy cron do czasu konfiguracji; fail-closed, nic nie sfabrykuje).
// Deploy: supabase functions deploy wf2-ads-sync --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws
import { createClient } from "jsr:@supabase/supabase-js@2";

const GRAPH = "https://graph.facebook.com/v23.0";
const EXCLUDED_ACCOUNT = "1537659320657091"; // konto Tomka — NIGDY nie syncować (wyklucz + loguj)
const DEADLINE_MS = 330_000; // edge wall-clock 400 s — kończymy z zapasem

const j = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const num = (v: unknown) => { const n = parseFloat(String(v ?? "")); return isNaN(n) ? 0 : n; };
const int = (v: unknown) => Math.round(num(v));

// actions/action_values: [{action_type, value}] — bierz pierwszy pasujący typ
function act(list: Array<{ action_type: string; value: string }> | undefined, ...types: string[]) {
  for (const t of types) { const hit = (list ?? []).find((a) => a.action_type === t); if (hit) return num(hit.value); }
  return 0;
}
// pola video_*_watched_actions: [{action_video_type:'total', value}] — bierz pierwszą wartość
const vid = (list: Array<{ value: string }> | undefined) => (list?.length ? int(list[0].value) : null);

async function graphPaged(url: string, maxPages = 5): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let next: string | null = url;
  for (let p = 0; p < maxPages && next; p++) {
    const r = await fetch(next);
    const d = await r.json();
    if (!r.ok) throw new Error(`graph ${r.status}: ${JSON.stringify(d?.error ?? d).slice(0, 300)}`);
    rows.push(...(d.data ?? []));
    next = d.paging?.next ?? null;
  }
  return rows;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return j(405, { error: "POST only" });
  const wf2 = Deno.env.get("WF2_GEN_SECRET") ?? "";
  const adm = Deno.env.get("SPAR_CRON_SECRET") ?? "";
  const okGate = (wf2 && req.headers.get("x-wf2-secret") === wf2) ||
                 (adm && req.headers.get("x-admin-secret") === adm);
  if (!okGate) return j(401, { error: "unauthorized" });

  const token = Deno.env.get("WF2_META_TOKEN") ?? "";
  if (!token) return j(200, { skipped: "WF2_META_TOKEN not set — dodaj system-user token (partner access BM)" });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const t0 = Date.now();
  const out = { campaigns: 0, rows_campaign: 0, rows_ad: 0, alerts: 0, skipped_excluded: 0, errors: [] as string[] };

  const { data: products } = await sb.from("wf2_products")
    .select("id, project_id, name, campaign_id").not("campaign_id", "is", null).neq("campaign_id", "");
  const { data: projects } = await sb.from("wf2_projects").select("id, meta_ad_account_id");
  const accByProject = new Map((projects ?? []).map((p) => [p.id, String(p.meta_ad_account_id ?? "").replace("act_", "")]));

  // mapowanie ad_id -> creative_id (rodowód kreacji)
  const { data: creatives } = await sb.from("wf2_creatives").select("id, meta_ad_ids");
  const creativeByAd = new Map<string, string>();
  for (const c of creatives ?? []) for (const ad of c.meta_ad_ids ?? []) creativeByAd.set(String(ad), c.id);

  for (const prod of products ?? []) {
    if (Date.now() - t0 > DEADLINE_MS) { out.errors.push("deadline — reszta w kolejnym biegu"); break; }
    const acc = accByProject.get(prod.project_id) ?? "";
    if (acc === EXCLUDED_ACCOUNT) {
      out.skipped_excluded++;
      await sb.from("wf2_activities").insert({
        project_id: prod.project_id, actor: "wf2-ads-sync", action: "ads_sync_skip",
        description: `Konto Tomka act ${EXCLUDED_ACCOUNT} wykluczone z synca (produkt: ${prod.name})`,
      });
      continue;
    }
    try {
      // ── campaign-level (P&L) ──
      const base = `${GRAPH}/${prod.campaign_id}/insights?time_increment=1&date_preset=last_7d&access_token=${token}`;
      const cRows = await graphPaged(`${base}&fields=spend,impressions,clicks,inline_link_clicks,reach,frequency,actions,action_values`);
      for (const r of cRows) {
        const purchases = act(r.actions as never, "omni_purchase", "purchase", "offsite_conversion.fb_pixel_purchase");
        const pval = act(r.action_values as never, "omni_purchase", "purchase", "offsite_conversion.fb_pixel_purchase");
        const spend = num(r.spend);
        const { error } = await sb.from("wf2_ad_stats").upsert({
          project_id: prod.project_id, product_id: prod.id, campaign_id: prod.campaign_id,
          date: r.date_start, level: "campaign", ad_id: "",
          spend, impressions: int(r.impressions), clicks: int(r.clicks),
          link_clicks: int(r.inline_link_clicks), reach: int(r.reach), frequency: num(r.frequency),
          purchases, purchase_value: pval, roas: spend > 0 ? +(pval / spend).toFixed(4) : 0,
          lpv: act(r.actions as never, "landing_page_view"),
          atc: act(r.actions as never, "omni_add_to_cart", "add_to_cart"),
          ic: act(r.actions as never, "omni_initiated_checkout", "initiate_checkout"),
          actions: r.actions ?? null,
        }, { onConflict: "campaign_id,level,ad_id,date" });
        if (error) throw new Error(error.message);
        out.rows_campaign++;
      }
      // ── ad-level (pętla wyników kreacji: metryki video) ──
      const aRows = await graphPaged(`${base}&level=ad&fields=ad_id,spend,impressions,clicks,inline_link_clicks,actions,action_values,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p100_watched_actions,video_thruplay_watched_actions,video_avg_time_watched_actions`);
      for (const r of aRows) {
        const adId = String(r.ad_id ?? ""); if (!adId) continue;
        const purchases = act(r.actions as never, "omni_purchase", "purchase", "offsite_conversion.fb_pixel_purchase");
        const pval = act(r.action_values as never, "omni_purchase", "purchase", "offsite_conversion.fb_pixel_purchase");
        const spend = num(r.spend);
        const { error } = await sb.from("wf2_ad_stats").upsert({
          project_id: prod.project_id, product_id: prod.id, campaign_id: prod.campaign_id,
          date: r.date_start, level: "ad", ad_id: adId,
          creative_id: creativeByAd.get(adId) ?? null,
          spend, impressions: int(r.impressions), clicks: int(r.clicks),
          link_clicks: int(r.inline_link_clicks),
          purchases, purchase_value: pval, roas: spend > 0 ? +(pval / spend).toFixed(4) : 0,
          video_3s_views: Math.round(act(r.actions as never, "video_view")) || null,
          video_p25: vid(r.video_p25_watched_actions as never),
          video_p50: vid(r.video_p50_watched_actions as never),
          video_p75: vid(r.video_p75_watched_actions as never),
          video_p100: vid(r.video_p100_watched_actions as never),
          video_thruplay: vid(r.video_thruplay_watched_actions as never),
          video_avg_watch_s: (() => { const v = vid(r.video_avg_time_watched_actions as never); return v == null ? null : v; })(),
          actions: r.actions ?? null,
        }, { onConflict: "campaign_id,level,ad_id,date" });
        if (error) throw new Error(error.message);
        out.rows_ad++;
      }
      out.campaigns++;
    } catch (e) {
      out.errors.push(`${prod.name ?? prod.id}: ${String(e).slice(0, 200)}`);
    }
  }

  // ── health-scan kont (operational health — zablokowane konto = 100% straty) ──
  const seen = new Set<string>();
  for (const [projectId, acc] of accByProject) {
    if (!acc || acc === EXCLUDED_ACCOUNT || seen.has(acc)) continue;
    seen.add(acc);
    if (Date.now() - t0 > DEADLINE_MS) break;
    try {
      const r = await fetch(`${GRAPH}/act_${acc}?fields=account_status,disable_reason&access_token=${token}`);
      const d = await r.json();
      if (r.ok && d.account_status !== 1) {
        out.alerts++;
        await sb.from("wf2_activities").insert({
          project_id: projectId, actor: "wf2-ads-sync", action: "ads_alert",
          description: `⚠ Konto act_${acc}: account_status=${d.account_status}, disable_reason=${d.disable_reason ?? "?"} — sprawdź NATYCHMIAST`,
        });
      }
    } catch { /* health-scan nie blokuje synca */ }
  }

  return j(200, out);
});

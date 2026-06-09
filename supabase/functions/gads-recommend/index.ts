// gads-recommend — cron dzienny. Czyta metryki 7-dniowe + cele kampanii, generuje rekomendacje
// (deterministyczne heurystyki). NIE wykonuje żadnych mutacji — tylko sugeruje (human-accept w panelu).
// Akceptacja rekomendacji w panelu = wstawienie suggested_command do gads_commands.
// Auth: x-agent-key == GADS_AGENT_SECRET (cron wysyła ten nagłówek). Deploy: npm run deploy:gads-recommend
//
// Ochrona Smart Bidding: kampanie zmieniane <14 dni temu pomijają rekomendacje bid/budget (in_learning).

import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

const today = () => new Date().toISOString().slice(0, 10);
const LEARNING_DAYS = 14;

// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");
  const secret = Deno.env.get("GADS_AGENT_SECRET");
  if (!secret || req.headers.get("x-agent-key") !== secret) return json({ error: "unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { data: campaigns } = await supabase
      .from("gads_campaigns").select("*").not("goal_id", "is", null);
    const { data: goals } = await supabase.from("gads_goals").select("*");
    const goalById: Record<string, Row> = {};
    (goals ?? []).forEach((g: Row) => (goalById[g.id] = g));

    const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const { data: metrics } = await supabase
      .from("gads_metrics_daily").select("*").gte("date", since);

    // agregacja per kampania
    const agg: Record<string, Row> = {};
    (metrics ?? []).forEach((m: Row) => {
      const k = m.campaign_ref;
      const a = agg[k] ?? (agg[k] = {
        cost: 0, impressions: 0, clicks: 0, conv: 0, views: 0,
        cpvSum: 0, cpvN: 0, vrSum: 0, vrN: 0, cpmSum: 0, cpmN: 0, p100Sum: 0, p100N: 0,
      });
      a.cost += Number(m.cost_micros ?? 0) / 1e6;
      a.impressions += Number(m.impressions ?? 0);
      a.clicks += Number(m.clicks ?? 0);
      a.conv += Number(m.conversions ?? 0);
      a.views += Number(m.trueview_views ?? 0);
      if (m.trueview_average_cpv != null) { a.cpvSum += Number(m.trueview_average_cpv); a.cpvN++; }
      if (m.trueview_view_rate != null) { a.vrSum += Number(m.trueview_view_rate); a.vrN++; }
      if (m.average_cpm != null) { a.cpmSum += Number(m.average_cpm); a.cpmN++; }
      if (m.video_quartile_p100_rate != null) { a.p100Sum += Number(m.video_quartile_p100_rate); a.p100N++; }
    });

    const recs: Row[] = [];
    const day = today();
    const push = (campaign_ref: string, kind: string, severity: string, rationale: string,
                  suggested_command: Row | null, snapshot: Row) =>
      recs.push({
        campaign_ref, kind, severity, rationale, suggested_command,
        metric_snapshot: snapshot, status: "new",
        dedupe_key: `${campaign_ref}:${kind}:${day}`,
      });

    for (const c of campaigns ?? []) {
      const ref = c.ad_campaign_id;
      const a = agg[ref];
      if (!a) continue;
      const goal = goalById[c.goal_id];
      if (!goal) continue;

      const inLearning = c.last_mutated_at &&
        (Date.now() - new Date(c.last_mutated_at).getTime()) < LEARNING_DAYS * 864e5;

      const cpa = a.conv > 0 ? a.cost / a.conv : null;
      const cpv = a.cpvN ? a.cpvSum / a.cpvN : null;
      const viewRate = a.vrN ? a.vrSum / a.vrN : null;
      const cpm = a.cpmN ? a.cpmSum / a.cpmN : null;
      const p100 = a.p100N ? a.p100Sum / a.p100N : null;
      const snap = { cost: a.cost, conv: a.conv, cpa, cpv, viewRate, cpm, p100, views: a.views };

      // ---- reguły per objective ----
      if (goal.objective === "CONVERSIONS" || goal.objective === "SUBSCRIBERS") {
        if (a.conv === 0 && a.cost > 5) {
          push(ref, "zero_conversions", "critical",
            `Brak konwersji przy wydatku ${a.cost.toFixed(2)} (7 dni). Rozważ pauzę lub wymianę kreacji.`,
            { type: "PAUSE", campaign_ref: ref, payload: {} }, snap);
        } else if (cpa != null && goal.benchmark_high && cpa > goal.benchmark_high) {
          push(ref, "cpa_above_target", inLearning ? "info" : "warning",
            `CPA ${cpa.toFixed(2)} > cel ${goal.benchmark_high}.` +
            (inLearning ? " (w okresie nauki — bez zmian bidu)" : " Sugestia: obniż docelowy CPA o ~15%."),
            inLearning ? null : { type: "SET_BID_TARGET", campaign_ref: ref, payload: { adjust_pct: -15 } }, snap);
        }
      }
      if (goal.objective === "VIEWS") {
        if (cpv != null && goal.benchmark_high && cpv > goal.benchmark_high) {
          push(ref, "cpv_above_target", inLearning ? "info" : "warning",
            `CPV ${cpv.toFixed(3)} > cel ${goal.benchmark_high}.` +
            (inLearning ? " (w okresie nauki)" : " Sugestia: obniż max CPV ~15% lub zawęź placementy."),
            inLearning ? null : { type: "SET_BID_TARGET", campaign_ref: ref, payload: { adjust_pct: -15 } }, snap);
        }
        const vrLow = goal.extra?.view_rate_low;
        if (viewRate != null && vrLow && viewRate < vrLow) {
          push(ref, "low_view_rate", "warning",
            `View rate ${(viewRate * 100).toFixed(1)}% < ${(vrLow * 100).toFixed(0)}%. Kreacja słabo trzyma — przetestuj inny hook.`,
            null, snap);
        }
      }
      if (goal.objective === "WATCH_TIME" && p100 != null && goal.benchmark_low && p100 < goal.benchmark_low) {
        push(ref, "low_completion", "info",
          `Completion (p100) ${(p100 * 100).toFixed(1)}% < ${(goal.benchmark_low * 100).toFixed(0)}%. Skróć film albo mocniejsze otwarcie.`,
          null, snap);
      }
      if (goal.objective === "REACH" && cpm != null && goal.benchmark_high && cpm > goal.benchmark_high) {
        push(ref, "cpm_above_target", "warning",
          `CPM ${cpm.toFixed(2)} > cel ${goal.benchmark_high}. Sugestia: dołóż Shorts/bumper (najtańszy CPM).`,
          null, snap);
      }
    }

    if (recs.length) {
      const { error } = await supabase
        .from("gads_recommendations").upsert(recs, { onConflict: "dedupe_key" });
      if (error) throw error;
    }
    return json({ generated: recs.length });
  } catch (e) {
    console.error("[gads-recommend]", e);
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

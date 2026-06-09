// gads-agent — JEDYNY endpoint dotykany przez Google Ads Script (silnik panelu Google Ads).
// Bezpieczeństwo: skrypt trzyma TYLKO sekret (x-agent-key). service_role NIGDY nie trafia do skryptu
// (źródło skryptu jest widoczne dla każdego z dostępem do konta Google Ads).
// Deploy: npm run deploy:gads-agent   (--no-verify-jwt — skrypt nie ma JWT Supabase)
//
// Akcje (body.action):
//   config    -> { engine_enabled, kill_switch, daily_spend_cap_micros, goals[] }
//   claim     -> { commands[] }  (atomowo pending->claimed; [] gdy kill_switch ON)
//   ack       -> zapisuje wyniki wykonania komend (+ last_mutated_at dla budżet/bid)
//   metrics   -> upsert gads_metrics_daily (onConflict campaign_ref,date)
//   campaigns -> upsert gads_campaigns (onConflict ad_campaign_id)

import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const secret = Deno.env.get("GADS_AGENT_SECRET");
  if (!secret || req.headers.get("x-agent-key") !== secret) {
    return json({ error: "unauthorized" }, 401);
  }

  // deno-lint-ignore no-explicit-any
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "invalid JSON" }, 400); }
  const action = body.action as string;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    switch (action) {
      case "config": {
        const { data: settings } = await supabase
          .from("settings").select("key, value")
          .in("key", ["gads_engine_enabled", "gads_kill_switch", "gads_daily_spend_cap_micros"]);
        const m: Record<string, string> = {};
        (settings ?? []).forEach((s: { key: string; value: string }) => (m[s.key] = s.value));
        const { data: goals } = await supabase
          .from("gads_goals").select("*").eq("is_template", false);
        return json({
          engine_enabled: m["gads_engine_enabled"] !== "false",
          kill_switch: m["gads_kill_switch"] === "true",
          daily_spend_cap_micros: Number(m["gads_daily_spend_cap_micros"] ?? "0"),
          goals: goals ?? [],
        });
      }

      case "claim": {
        // kill switch -> nie wydawaj żadnych komend mutujących
        const { data: ks } = await supabase
          .from("settings").select("value").eq("key", "gads_kill_switch").maybeSingle();
        if (ks?.value === "true") return json({ commands: [], kill_switch: true });
        const runId = String(body.run_id ?? "unknown");
        const limit = Math.min(Number(body.limit ?? 50), 200);
        const { data, error } = await supabase.rpc("gads_claim_commands", { p_run_id: runId, p_limit: limit });
        if (error) throw error;
        return json({ commands: data ?? [] });
      }

      case "ack": {
        const results = Array.isArray(body.results) ? body.results : [];
        for (const r of results) {
          await supabase.from("gads_commands").update({
            status: r.status === "done" ? "done" : "error",
            executed_at: new Date().toISOString(),
            result: r.result ?? null,
            error: r.error ?? null,
          }).eq("id", r.id);
          // ochrona Smart Bidding learning — zapisz kiedy kampania była realnie zmieniana
          if (r.set_last_mutated && r.campaign_ref && r.status === "done") {
            await supabase.from("gads_campaigns")
              .update({ last_mutated_at: new Date().toISOString() })
              .eq("ad_campaign_id", r.campaign_ref);
          }
        }
        return json({ acked: results.length });
      }

      case "metrics": {
        const rows = Array.isArray(body.rows) ? body.rows : [];
        if (rows.length === 0) return json({ upserted: 0 });
        const { error } = await supabase
          .from("gads_metrics_daily").upsert(rows, { onConflict: "campaign_ref,date" });
        if (error) throw error;
        return json({ upserted: rows.length });
      }

      case "campaigns": {
        const rows = Array.isArray(body.rows) ? body.rows : [];
        if (rows.length === 0) return json({ upserted: 0 });
        const { error } = await supabase
          .from("gads_campaigns").upsert(rows, { onConflict: "ad_campaign_id" });
        if (error) throw error;
        return json({ upserted: rows.length });
      }

      default:
        return json({ error: "unknown action: " + action }, 400);
    }
  } catch (e) {
    console.error("[gads-agent]", action, e);
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

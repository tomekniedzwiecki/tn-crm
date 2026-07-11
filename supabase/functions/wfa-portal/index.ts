// wfa-portal — publiczny odczyt postępu budowy aplikacji dla KLIENTA (kamienie milowe).
// Wzorzec: RLS wfa_* = tylko team; klient dostaje dane WYŁĄCZNIE przez tę funkcję
// (token z URL + hasło ustawione przez Tomka w panelu; hasło = SHA-256 w client_password_hash).
//
// Zwraca TYLKO to, co klient ma widzieć: nazwa, postęp %, etapy (done/total),
// kamienie milowe (milestone_label + data), „co się teraz dzieje" (etap bieżący), termin.
// ZERO szczegółów kroków, zero uwag/notatek/danych spar.
//
// Deploy: npx supabase functions deploy wfa-portal --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const token = (body.token || "").trim();
  const password = (body.password || "").trim();
  if (!/^[0-9a-f]{32}$/i.test(token) || !password || password.length > 200) {
    await new Promise((r) => setTimeout(r, 300)); // tania mitygacja brute-force
    return json({ error: "unauthorized" }, 401);
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: p } = await sb
    .from("wfa_projects")
    .select("id, name, customer_name, status, deadline_at, client_password_hash, app_url, landing_url")
    .eq("unique_token", token)
    .maybeSingle();

  // Hasło nieustawione = portal wyłączony dla tego projektu (Tomek włącza w panelu).
  if (!p || !p.client_password_hash) {
    await new Promise((r) => setTimeout(r, 300));
    return json({ error: "unauthorized" }, 401);
  }
  const hash = await sha256Hex(password);
  if (hash !== String(p.client_password_hash).toLowerCase()) {
    await new Promise((r) => setTimeout(r, 300));
    return json({ error: "unauthorized" }, 401);
  }

  const [defsQ, stepsQ] = await Promise.all([
    sb.from("wfa_step_defs").select("key, stage, stage_label, sort, milestone_label")
      .eq("active", true).order("stage").order("sort"),
    sb.from("wfa_steps").select("step_key, status, completed_at")
      .eq("project_id", p.id).range(0, 999),
  ]);
  const defs = defsQ.data || [];
  const steps = stepsQ.data || [];
  const stepFor = (key: string) => steps.find((s) => s.step_key === key);

  // Postęp + etapy (bez nazw pojedynczych kroków — klient widzi poziom etapu)
  const countable = steps.filter((s) => s.status !== "skipped");
  const done = countable.filter((s) => s.status === "done").length;
  const pct = countable.length ? Math.round((done / countable.length) * 100) : 0;

  const stageMap: Record<number, { label: string; done: number; total: number }> = {};
  for (const d of defs) {
    const st = stepFor(d.key);
    if (st && st.status === "skipped") continue;
    stageMap[d.stage] = stageMap[d.stage] || { label: d.stage_label, done: 0, total: 0 };
    stageMap[d.stage].total++;
    if (st && st.status === "done") stageMap[d.stage].done++;
  }
  const stages = Object.keys(stageMap).map(Number).sort((a, b) => a - b).map((n) => ({
    num: n,
    label: stageMap[n].label,
    done: stageMap[n].done,
    total: stageMap[n].total,
    complete: stageMap[n].total > 0 && stageMap[n].done === stageMap[n].total,
  }));
  const current = stages.find((s) => !s.complete);

  // Kamienie milowe: kroki z milestone_label + status done (z datą)
  const milestones = defs
    .filter((d) => d.milestone_label)
    .map((d) => {
      const st = stepFor(d.key);
      return {
        label: d.milestone_label,
        done: !!(st && st.status === "done"),
        at: st && st.status === "done" ? st.completed_at : null,
      };
    });

  return json({
    name: (p.name || "").trim() || "Twoja aplikacja",
    customer_name: p.customer_name || null,
    progress: pct,
    stages,
    current_stage: current ? current.label : "Wszystko ukończone",
    milestones,
    deadline_at: p.deadline_at || null,
    app_url: p.app_url || null,
    landing_url: p.landing_url || null,
  });
});

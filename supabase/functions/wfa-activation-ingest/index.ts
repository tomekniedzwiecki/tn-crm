// wfa-activation-ingest — ODBIORNIK centralnych metryk AKTYWACJI apek fabryki (ONBOARDING-FABRYKA §7b + §1.16).
// =============================================================================
// KONTRAKT PUSH (apka → centrala). Ta sama rura co ai-billing: apka NOCNYM CRONEM (helper po stronie
// saas-startera — follow-up, dodawany osobno) czyta swój `admin-stats` scope `onboarding` i POST-uje tu.
//
//   POST https://yxmavwkwnfuphjqbelws.functions.supabase.co/wfa-activation-ingest
//   Nagłówek gate:  x-wfa-ingest-secret: <WFA_INGEST_SECRET>   (albo body.secret — dla środowisk bez własnych nagłówków)
//   Content-Type: application/json
//   Body:
//   {
//     "project_slug":    "dobry-wstep",          // WYMAGANE — kebab-slug apki (stabilna tożsamość)
//     "snapshot_date":   "2026-07-17",           // opcjonalne — domyślnie dziś (UTC)
//     "niche":           "windykacja-jdg",       // opcjonalne — nisza/kategoria (agregacja median PER NISZA)
//     "signups":         120,                     // int, okno kohorty
//     "activated":       48,                      // int
//     "activation_rate": 40.0,                    // % (opcjonalne — fallback = activated/signups*100)
//     "ttfv_median_min": 7.5,                     // MEDIANA TTFV w minutach (nie średnia!)
//     "setup_rate_pct":  62.0,                    // % setup_completed (opcjonalne)
//     "d7":              33.0,                     // % D7 retention (alias: d7_retention_pct)
//     "habit":           21.0,                     // % habit rate (alias: habit_rate_pct)
//     "by_variant":      { "A": {"signups":60,"activated":21,"activation_rate":35,"ttfv_median_min":8.1},
//                          "B": {"signups":60,"activated":27,"activation_rate":45,"ttfv_median_min":6.9} },
//     "by_segment":      { "owner": {...}, "member": {...} },   // dowolne klucze segmentu/JTBD
//     "raw":             { "funnel": {...}, "ttfv_buckets": {...} }  // dowolna meta (lejek/drop-off/rozkład)
//   }
//
//   Odpowiedź: { ok: true, action: "upserted", project_slug, snapshot_date, project_id }
//
// Idempotentne: upsert on_conflict (project_slug, snapshot_date) — powtórny push tego samego dnia
// nadpisuje wiersz. Best-effort, walidacja miękka (braki → 0/null, nie 500). `project_id` domykany
// z wfa_projects.slug gdy istnieje pasujący projekt.
//
// Gate = SEKRET (WFA_INGEST_SECRET), NIE service-key tn-crm — apki nie trzymają klucza centrali.
// Deploy: npx supabase functions deploy wfa-activation-ingest --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws
// Sekret:  npx supabase secrets set WFA_INGEST_SECRET=... --project-ref yxmavwkwnfuphjqbelws
// =============================================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-wfa-ingest-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

// Porównanie sekretu w stałym czasie (odporne na timing-attack).
function safeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Miękki parser liczb: "" / null / NaN → domyślna (null lub 0). Zawsze skończona.
function numOr(v: unknown, def: number | null): number | null {
  if (v === null || v === undefined || v === "") return def;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : def;
}
function intOr(v: unknown, def: number): number {
  const n = numOr(v, def);
  return n === null ? def : Math.trunc(n);
}
// jsonb-owe pola: wpuszczamy tylko zwykły obiekt (nie tablica/skalar) — inaczej {}.
function objOr(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const SECRET = Deno.env.get("WFA_INGEST_SECRET") || "";
  if (!SECRET) { console.error("[wfa-activation-ingest] WFA_INGEST_SECRET nie ustawiony"); return json({ error: "not_configured" }, 500); }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return json({ error: "bad_json" }, 400);

  // Gate: nagłówek LUB body.secret (środowiska bez własnych nagłówków). Stały czas.
  const provided = String(req.headers.get("x-wfa-ingest-secret") || (body as Record<string, unknown>).secret || "");
  if (!safeEqual(provided, SECRET)) return json({ error: "unauthorized" }, 401);

  const b = body as Record<string, unknown>;
  const projectSlug = String(b.project_slug || "").trim().toLowerCase();
  if (!SLUG_RE.test(projectSlug)) return json({ error: "bad_project_slug" }, 400);

  const snapshotDate = (() => {
    const d = String(b.snapshot_date || "").trim();
    return DATE_RE.test(d) ? d : new Date().toISOString().slice(0, 10);
  })();

  const signups = Math.max(0, intOr(b.signups, 0));
  const activated = Math.max(0, intOr(b.activated, 0));
  // activation_rate: bierzemy przysłaną; fallback = activated/signups*100 gdy nie podano.
  let activationRate = numOr(b.activation_rate, null);
  if (activationRate === null && signups > 0) activationRate = Math.round((activated / signups) * 10000) / 100;

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Domknij project_id ze slug (best-effort — brak projektu nie blokuje zrzutu).
  let projectId: string | null = null;
  try {
    const { data: p } = await sb.from("wfa_projects").select("id").eq("slug", projectSlug).maybeSingle();
    if (p?.id) projectId = p.id as string;
  } catch (_) { /* best-effort */ }

  const niche = b.niche != null ? String(b.niche).trim().slice(0, 120) || null : null;

  const row = {
    project_slug: projectSlug,
    project_id: projectId,
    niche,
    snapshot_date: snapshotDate,
    signups,
    activated,
    activation_rate: activationRate,
    ttfv_median_min: numOr(b.ttfv_median_min, null),
    setup_rate_pct: numOr(b.setup_rate_pct, null),
    d7_retention_pct: numOr(b.d7 ?? b.d7_retention_pct, null),
    habit_rate_pct: numOr(b.habit ?? b.habit_rate_pct, null),
    by_variant: objOr(b.by_variant),
    by_segment: objOr(b.by_segment),
    raw: objOr(b.raw),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from("wfa_activation_stats")
    .upsert(row, { onConflict: "project_slug,snapshot_date" })
    .select("id, project_slug, snapshot_date, project_id")
    .single();

  if (error) {
    console.error("[wfa-activation-ingest] upsert", error.message);
    return json({ error: "upsert_failed", detail: error.message }, 500);
  }

  return json({ ok: true, action: "upserted", id: data.id, project_slug: data.project_slug, snapshot_date: data.snapshot_date, project_id: data.project_id });
});

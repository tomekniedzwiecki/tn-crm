// wfa-progress-mail — GPT 5.6 pisze KRÓTKI mail o postępie budowy do klienta.
// Zwraca { subject, body, to } — NIE wysyła. Panel pokazuje treść (edytowalną) i otwiera
// gotowy mail w Gmailu; wysyłkę robi Tomek ręcznie (zasada: żadnych maili autonomicznie).
//
// Gate: JWT członka zespołu (team_members) — jak wfa-portal admin_get. Bez samego 'authenticated'
// (publiczna rejestracja sparingu daje tę rolę każdemu).
//
// Deploy: npx supabase functions deploy wfa-progress-mail --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENAI_MODEL = Deno.env.get("SPAR_OPENAI_MODEL") || "gpt-5.6-sol";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

async function verifyTeamMember(req: Request, sb: ReturnType<typeof createClient>): Promise<boolean> {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!m) return false;
  const { data: u } = await sb.auth.getUser(m[1].trim());
  if (!u?.user) return false;
  const { data: tm } = await sb.from("team_members").select("user_id").eq("user_id", u.user.id).maybeSingle();
  return !!tm;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (!(await verifyTeamMember(req, sb))) return json({ error: "brak_uprawnien" }, 403);

  const body = await req.json().catch(() => ({}));
  const projectId = String(body?.project_id || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(projectId)) return json({ error: "bad_project_id" }, 400);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return json({ error: "openai_not_configured" }, 500);

  // Kontekst projektu: nazwa, klient, kamienie osiągnięte, bieżący etap.
  const { data: p } = await sb.from("wfa_projects")
    .select("name, customer_name, customer_email, deadline_at").eq("id", projectId).maybeSingle();
  if (!p) return json({ error: "not_found" }, 404);

  const [defsQ, stepsQ] = await Promise.all([
    sb.from("wfa_step_defs").select("key, stage, stage_label, sort, milestone_label").eq("active", true).order("stage").order("sort"),
    sb.from("wfa_steps").select("step_key, status, completed_at").eq("project_id", projectId).range(0, 999),
  ]);
  const defs = defsQ.data || [];
  const steps = stepsQ.data || [];
  const stepFor = (k: string) => steps.find((s) => s.step_key === k);

  const doneMilestones = defs.filter((d) => d.milestone_label && stepFor(d.key)?.status === "done")
    .map((d) => d.milestone_label);
  let currentStageLabel = "";
  for (const d of defs) {
    const st = stepFor(d.key);
    if (!st || (st.status !== "done" && st.status !== "skipped")) { currentStageLabel = d.stage_label; break; }
  }

  const firstName = String(p.customer_name || "").trim().split(/\s+/)[0] || "";
  const ctx = [
    `Aplikacja: ${p.name || "aplikacja klienta"}`,
    `Klient (imię): ${firstName || "—"}`,
    `Osiągnięte kamienie: ${doneMilestones.length ? doneMilestones.join("; ") : "start budowy"}`,
    `Obecny etap: ${currentStageLabel || "—"}`,
  ].join("\n");

  const system = [
    "Piszesz w imieniu Tomka Niedzwieckiego krotki mail o postepie budowy aplikacji klienta.",
    "Styl Tomka: cieplo, po ludzku, konkretnie, bez zargonu i korpomowy. Zero marketingowego napelniania.",
    "Struktura: 1 zdanie co sie wydarzylo, 1-2 zdania co teraz i co dalej, cieple zamkniecie. Lacznie 3-5 zdan.",
    "ZAKAZ: obietnic konkretnych dat i terminow, slow typu ROAS/CPM/deploy/RLS, przechwalek, nadmiaru emoji (max 1).",
    "Pisz poprawna polszczyzna z polskimi znakami diakrytycznymi w tresci maila.",
    "Zwroc TYLKO obiekt JSON w formacie {\"subject\":\"...\",\"body\":\"...\"}. body zwyklym tekstem z akapitami rozdzielonymi \\n\\n, z podpisem Tomek na koncu.",
    "Jesli znasz imie klienta - zacznij tresc od pozdrowienia z tym imieniem.",
  ].join(" ");

  let out = { subject: "", body: "" };
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_completion_tokens: 2500, // reasoning (low) gpt-5.6-sol liczy się do puli
        reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Kontekst projektu:\n${ctx}\n\nNapisz mail o postępie.` },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[wfa-progress-mail] OpenAI", res.status, t.slice(0, 300));
      return json({ error: "ai_failed", status: res.status }, 502);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    out = { subject: String(parsed.subject || "").trim(), body: String(parsed.body || "").trim() };
  } catch (e) {
    console.error("[wfa-progress-mail]", e);
    return json({ error: "ai_failed" }, 502);
  }

  if (!out.body) return json({ error: "empty_result" }, 502);
  if (!out.subject) out.subject = `${p.name || "Twoja aplikacja"} — co u nas słychać`;

  return json({ subject: out.subject, body: out.body, to: p.customer_email || "" });
});

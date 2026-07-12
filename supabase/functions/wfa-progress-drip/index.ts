// wfa-progress-drip — AUTOMATYCZNY mail o postępie budowy (jak follow-upy sparingu).
// Moment wysyłki: osiągnięcie KAMIENIA MILOWEGO, gdy klient ma już dostęp do portalu
// (client_password_hash ustawione) i mamy jego e-mail. Wyklucza kickoff (to osobny mail
// „przekazanie dostępu") i wczesne kroki. GPT 5.6 pisze treść → Resend wysyła → stempel
// wfa_steps.progress_mail_sent_at (dedup: jeden mail na kamień) + wpis do wfa_activities.
//
// Gate: cron (x-cron-secret == WFA_CRON_SECRET). Wołane przez pg_cron + pg_net.
// Deploy: npx supabase functions deploy wfa-progress-drip --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws

import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_MODEL = Deno.env.get("SPAR_OPENAI_MODEL") || "gpt-5.6-sol";
const FROM = "Tomek Niedźwiecki <ceo@tomekniedzwiecki.pl>";
const REPLY_TO = "ceo@tomekniedzwiecki.pl";
const PORTAL_BASE = "https://crm.tomekniedzwiecki.pl/twoja-aplikacja";
const DEADLINE_MS = 300_000;
const MAX_PER_RUN = 20;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Prosty, czysty HTML maila: akapity treści + przycisk do portalu.
function wrapHtml(bodyText: string, portalUrl: string): string {
  const paras = bodyText.split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:520px">
${paras}
<p style="margin:22px 0 0"><a href="${esc(portalUrl)}" style="display:inline-block;background:#0070f3;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:600">Zobacz postęp w swoim portalu</a></p>
</div>`;
}

async function genMail(apiKey: string, ctx: string): Promise<{ subject: string; body: string } | null> {
  const system = [
    "Piszesz w imieniu Tomka Niedzwieckiego krotki mail o postepie budowy aplikacji klienta.",
    "Wlasnie osiagnelismy kamien milowy w projekcie.",
    "Styl Tomka: cieplo, po ludzku, konkretnie, bez zargonu i korpomowy.",
    "Struktura: 1 zdanie co sie wydarzylo (ten kamien), 1-2 zdania co teraz i co dalej, cieple zamkniecie. Lacznie 3-5 zdan.",
    "ZAKAZ: obietnic konkretnych dat i terminow, slow typu ROAS/CPM/deploy/RLS, przechwalek, nadmiaru emoji (max 1).",
    "NIE wstawiaj zadnych linkow ani adresow - przycisk do portalu dodajemy osobno.",
    "Pisz poprawna polszczyzna z polskimi znakami diakrytycznymi w tresci maila.",
    "Zwroc TYLKO obiekt JSON w formacie {\"subject\":\"...\",\"body\":\"...\"}. body zwyklym tekstem, akapity rozdzielone \\n\\n, podpis Tomek na koncu.",
  ].join(" ");
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_completion_tokens: 2500,
        reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Kontekst projektu:\n${ctx}\n\nNapisz mail o osiagnietym kamieniu.` },
        ],
      }),
    });
    if (!res.ok) { console.error("[wfa-progress-drip] openai", res.status); return null; }
    const data = await res.json();
    const obj = JSON.parse(data?.choices?.[0]?.message?.content || "{}");
    const subject = String(obj.subject || "").trim();
    const body = String(obj.body || "").trim();
    if (!body) return null;
    return { subject: subject || "Postęp w budowie Twojej aplikacji", body };
  } catch (e) { console.error("[wfa-progress-drip] gen", e); return null; }
}

async function sendResend(apiKey: string, to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, reply_to: REPLY_TO, subject, html }),
    });
    if (!res.ok) { console.error("[wfa-progress-drip] resend", res.status, (await res.text().catch(() => "")).slice(0, 200)); return false; }
    return true;
  } catch (e) { console.error("[wfa-progress-drip] resend", e); return false; }
}

Deno.serve(async (req: Request) => {
  const cronSecret = Deno.env.get("WFA_CRON_SECRET");
  const ok = !!cronSecret && req.headers.get("x-cron-secret") === cronSecret;
  if (!ok) return new Response("unauthorized", { status: 401 });

  const started = Date.now();
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const resendKey = Deno.env.get("resend_api_key");
  if (!openaiKey || !resendKey) return json({ error: "not_configured" }, 500);

  // Kamienie milowe (klucze kroków z milestone_label, bez kickoff = osobny mail dostępu).
  const { data: defs } = await sb.from("wfa_step_defs")
    .select("key, stage, stage_label, sort, milestone_label").eq("active", true).order("stage").order("sort");
  const milestoneKeys = (defs || []).filter((d) => d.milestone_label && d.key !== "kickoff").map((d) => d.key);
  if (!milestoneKeys.length) return json({ ok: true, sent: 0, note: "brak kamieni" });

  // Kandydaci: kroki-kamienie ukończone, jeszcze nie powiadomione.
  const { data: cand } = await sb.from("wfa_steps")
    .select("id, project_id, step_key, completed_at")
    .eq("status", "done").is("progress_mail_sent_at", null).in("step_key", milestoneKeys)
    .order("completed_at", { ascending: true }).limit(MAX_PER_RUN);
  if (!cand || !cand.length) return json({ ok: true, sent: 0 });

  // Projekty tych kandydatów — tylko z aktywnym portalem (dostęp przekazany) i e-mailem.
  const projIds = [...new Set(cand.map((c) => c.project_id))];
  const { data: projs } = await sb.from("wfa_projects")
    .select("id, name, customer_name, customer_email, unique_token, client_password_hash, is_test")
    .in("id", projIds);
  const projById = new Map((projs || []).map((p) => [p.id, p]));

  const milestoneLabel = new Map((defs || []).map((d) => [d.key, d.milestone_label]));
  const doneLabelsByProject = new Map<string, string[]>(); // do kontekstu „co już osiągnięto"
  {
    const { data: allDone } = await sb.from("wfa_steps")
      .select("project_id, step_key").eq("status", "done").in("project_id", projIds).in("step_key", milestoneKeys);
    for (const r of allDone || []) {
      const lbl = milestoneLabel.get(r.step_key);
      if (!lbl) continue;
      const arr = doneLabelsByProject.get(r.project_id) || [];
      arr.push(String(lbl));
      doneLabelsByProject.set(r.project_id, arr);
    }
  }

  let sent = 0;
  const results: Array<{ project: string; milestone: string; ok: boolean }> = [];
  for (const c of cand) {
    if (Date.now() - started > DEADLINE_MS - 20_000) break;
    const p = projById.get(c.project_id);
    const label = milestoneLabel.get(c.step_key);
    // Warunki wysyłki: portal aktywny + e-mail + nie testowy. Jeśli nie — oznacz jako
    // „obsłużone" (stempel), żeby nie skanować w kółko (i tak nie wyślemy).
    if (!p || !label || !p.customer_email || !p.client_password_hash || p.is_test) {
      await sb.from("wfa_steps").update({ progress_mail_sent_at: new Date().toISOString() }).eq("id", c.id);
      continue;
    }
    const firstName = String(p.customer_name || "").trim().split(/\s+/)[0] || "";
    const doneLabels = (doneLabelsByProject.get(c.project_id) || []).filter((l) => l !== label);
    const ctx = [
      `Aplikacja: ${p.name || "aplikacja klienta"}`,
      firstName ? `Imie klienta: ${firstName}` : "Imie klienta: nieznane",
      `Wlasnie osiagniety kamien: ${label}`,
      doneLabels.length ? `Wczesniej osiagniete: ${doneLabels.join("; ")}` : "To pierwszy kamien po starcie",
    ].join("\n");

    const mail = await genMail(openaiKey, ctx);
    if (!mail) { results.push({ project: String(p.name), milestone: String(label), ok: false }); continue; }

    const portalUrl = `${PORTAL_BASE}?t=${p.unique_token}`;
    const html = wrapHtml(mail.body, portalUrl);
    const delivered = await sendResend(resendKey, String(p.customer_email), mail.subject, html);

    // Stempel dedup ZAWSZE po próbie (nie próbujemy w kółko tego samego kamienia).
    await sb.from("wfa_steps").update({ progress_mail_sent_at: new Date().toISOString() }).eq("id", c.id);
    await sb.from("wfa_activities").insert({
      project_id: c.project_id, actor: "auto", action: "progress_mail",
      description: delivered
        ? `Wysłano mail o postępie do klienta: „${label}".`
        : `Nie udało się wysłać maila o postępie („${label}") — sprawdź Resend.`,
    });
    if (delivered) sent++;
    results.push({ project: String(p.name), milestone: String(label), ok: delivered });
  }

  return json({ ok: true, sent, candidates: cand.length, results });
});

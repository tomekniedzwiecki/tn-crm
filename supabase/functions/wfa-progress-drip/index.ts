// wfa-progress-drip — AUTOMATYCZNE maile lifecycle budowy aplikacji (jak follow-upy sparingu).
//
// FAZA 0 „przekazanie dostępu": nowy projekt (access_mail_sent_at IS NULL, nazwa + e-mail,
// nie testowy) → generujemy hasło portalu (SHA-256 → client_password_hash, schemat wfa-portal),
// wysyłamy przez Resend link + hasło, stempel wfa_projects.access_mail_sent_at + wfa_activities.
// Treść STATYCZNA (mail z poświadczeniami musi być przewidywalny). Projekt bez nazwy czeka
// BEZ stempla — mail pójdzie, gdy Tomek nazwie projekt w panelu.
//
// FAZA 1 „kamienie": osiągnięcie KAMIENIA MILOWEGO, gdy klient ma już dostęp do portalu
// (client_password_hash ustawione) i mamy jego e-mail. Wyklucza kickoff (= faza 0 wyżej).
// GPT 5.6 pisze treść → Resend wysyła → stempel wfa_steps.progress_mail_sent_at
// (dedup: jeden mail na kamień) + wpis do wfa_activities.
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

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Hasło portalu: 2 słowa + liczba — łatwe do przepisania z telefonu, bez znaków mylnych.
const PASS_WORDS = [
  "sokol", "zubr", "wilk", "orzel", "bocian", "jodla", "klon", "modrzew",
  "granit", "bursztyn", "krzemien", "bazalt", "wrzos", "jawor", "jesion", "grab",
];
function genPassword(): string {
  const buf = new Uint32Array(3);
  crypto.getRandomValues(buf);
  const w1 = PASS_WORDS[buf[0] % PASS_WORDS.length];
  let w2 = PASS_WORDS[buf[1] % PASS_WORDS.length];
  if (w2 === w1) w2 = PASS_WORDS[(buf[1] + 1) % PASS_WORDS.length];
  return `${w1}-${10 + (buf[2] % 90)}-${w2}`;
}

// HTML maila dostępowego: akapity + ramka z poświadczeniami + przycisk + podpis.
function accessHtml(bodyText: string, portalUrl: string, password: string): string {
  const paras = bodyText.split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:520px">
${paras}
<div style="background:#f6f6f6;border:1px solid #e5e5e5;border-radius:8px;padding:14px 16px;margin:18px 0">
<p style="margin:0 0 8px"><strong>Twój portal:</strong><br><a href="${esc(portalUrl)}" style="color:#0070f3">${esc(portalUrl)}</a></p>
<p style="margin:0"><strong>Hasło:</strong> <span style="font-family:Consolas,Menlo,monospace">${esc(password)}</span></p>
</div>
<p style="margin:22px 0 0"><a href="${esc(portalUrl)}" style="display:inline-block;background:#0070f3;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:600">Wejdź do swojego portalu</a></p>
<p style="margin:18px 0 0">Pozdrawiam<br>Tomek</p>
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

  // ===== FAZA 0: mail „przekazanie dostępu" dla nowych projektów =====
  // Hasło generujemy TUTAJ w momencie wysyłki (ten mail = jedyny kanał doręczenia hasła,
  // więc zawsze świeże — nadpisuje ewentualne ręczne, którego klient i tak nie dostał).
  const access: Array<{ project: string; ok: boolean }> = [];
  {
    const { data: fresh } = await sb.from("wfa_projects")
      .select("id, name, customer_name, customer_email, unique_token, is_test")
      .is("access_mail_sent_at", null).order("created_at", { ascending: true }).limit(MAX_PER_RUN);
    for (const p of fresh || []) {
      if (Date.now() - started > DEADLINE_MS - 20_000) break;
      // Testowy albo bez e-maila → stempel (nie wyślemy nigdy, nie skanuj w kółko).
      if (p.is_test || !p.customer_email) {
        await sb.from("wfa_projects").update({ access_mail_sent_at: new Date().toISOString() }).eq("id", p.id);
        continue;
      }
      // Bez nazwy aplikacji czekamy BEZ stempla — mail pójdzie, gdy projekt dostanie nazwę.
      const name = String(p.name || "").trim();
      if (!name) continue;

      const password = genPassword();
      const { error: pwErr } = await sb.from("wfa_projects")
        .update({ client_password_hash: await sha256Hex(password) }).eq("id", p.id);
      if (pwErr) { access.push({ project: name, ok: false }); continue; }

      const firstName = String(p.customer_name || "").trim().split(/\s+/)[0] || "";
      const portalUrl = `${PORTAL_BASE}?t=${p.unique_token}`;
      const bodyText = [
        firstName ? `Cześć ${firstName},` : "Cześć,",
        `ruszamy z budową aplikacji ${name}! Przez najbliższe tygodnie będę składał ją kawałek po kawałku: najpierw fundamenty i wygląd, potem najważniejsze funkcje i płatności, na koniec testy i szlif. Jak będę czegoś potrzebował z Twojej strony, dam znać.`,
        `Żebyś na bieżąco widział, co się dzieje, przygotowałem dla Ciebie portal postępu — znajdziesz tam aktualny etap prac, dziennik budowy i makiety.`,
      ].join("\n\n");

      const delivered = await sendResend(
        resendKey, String(p.customer_email), `${name} — ruszamy z budową`,
        accessHtml(bodyText, portalUrl, password),
      );
      if (delivered) {
        // Stempel dopiero PO doręczeniu — porażka Resend = retry w następnym przebiegu crona
        // (mail z hasłem jest krytyczny; przy retry generujemy nowe hasło, stare nigdy nie wyszło).
        await sb.from("wfa_projects").update({ access_mail_sent_at: new Date().toISOString() }).eq("id", p.id);
        await sb.from("wfa_activities").insert({
          project_id: p.id, actor: "auto", action: "access_mail",
          description: "Wysłano klientowi dostęp do portalu postępu (link + hasło, Resend).",
        });
      } else {
        await sb.from("wfa_activities").insert({
          project_id: p.id, actor: "auto", action: "access_mail",
          description: "Nie udało się wysłać maila z dostępem do portalu — ponowię w następnym przebiegu (sprawdź Resend).",
        });
      }
      access.push({ project: name, ok: delivered });
    }
  }

  // Kamienie milowe (klucze kroków z milestone_label, bez kickoff = osobny mail dostępu).
  const { data: defs } = await sb.from("wfa_step_defs")
    .select("key, stage, stage_label, sort, milestone_label").eq("active", true).order("stage").order("sort");
  const milestoneKeys = (defs || []).filter((d) => d.milestone_label && d.key !== "kickoff").map((d) => d.key);
  if (!milestoneKeys.length) return json({ ok: true, sent: 0, access, note: "brak kamieni" });

  // Kandydaci: kroki-kamienie ukończone, jeszcze nie powiadomione.
  const { data: cand } = await sb.from("wfa_steps")
    .select("id, project_id, step_key, completed_at")
    .eq("status", "done").is("progress_mail_sent_at", null).in("step_key", milestoneKeys)
    .order("completed_at", { ascending: true }).limit(MAX_PER_RUN);
  if (!cand || !cand.length) return json({ ok: true, sent: 0, access });

  // Projekty tych kandydatów — tylko z aktywnym portalem (dostęp przekazany) i e-mailem.
  const projIds = [...new Set(cand.map((c) => c.project_id))];
  const { data: projs } = await sb.from("wfa_projects")
    .select("id, name, customer_name, customer_email, unique_token, client_password_hash, is_test, access_mail_sent_at")
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
    // Kamień ukończony PRZED przekazaniem dostępu (typowo kroki Etapu 1 zrobione przy
    // kickoffie) — bez osobnego maila: klient zobaczy go w portalu przy pierwszym wejściu.
    // Bez tego faza 0 + zaległe kamienie = kilka maili w jednym przebiegu.
    if (p.access_mail_sent_at && c.completed_at &&
        new Date(String(c.completed_at)) <= new Date(String(p.access_mail_sent_at))) {
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

  return json({ ok: true, sent, access, candidates: cand.length, results });
});

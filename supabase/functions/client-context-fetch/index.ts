// One-call fetch of full client context for Claude when handling a client email.
// Returns: workflow, takedrop, recent mail threads cache, knowledge summary, landing slug hint.
//
// Usage:
//   curl -X POST .../client-context-fetch -d '{"customer_email":"karol.karpeta@gmail.com"}'
//
// If cache miss (no client_knowledge row), suggest running gmail-scan-client first.

import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: { customer_email?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { customer_email } = body;
  if (!customer_email) return json({ error: "customer_email required" }, 400);

  // AUTORYZACJA: narzedzie wewnetrzne (tylko tooling admina/Claude). Bez tego
  // KAZDY z publishable key mogl po samym customer_email pobrac workflow +
  // legal_data (PESEL/adres) + account_email TakeDrop + cache maili. Wymagamy
  // sekretu SPAR_CRON_SECRET (jak send-sms/spar-drip).
  const SECRET = Deno.env.get("SPAR_CRON_SECRET");
  const authed = !!SECRET && (req.headers.get("x-admin-secret") === SECRET || req.headers.get("x-cron-secret") === SECRET);
  if (!authed) return json({ error: "brak_autoryzacji" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. Workflow (active first, fallback to any)
  const { data: workflows } = await supabase
    .from("workflows")
    .select("id, customer_email, customer_name, customer_phone, offer_name, amount, status, started_at")
    .eq("customer_email", customer_email)
    .order("started_at", { ascending: false });

  const workflow = workflows?.find((w) => w.status === "active") ?? workflows?.[0] ?? null;

  // 2. TakeDrop (per workflow)
  let takedrop = null;
  if (workflow) {
    const { data: td } = await supabase
      .from("workflow_takedrop")
      .select("account_email, landing_url, landing_status, legal_data, product_id, is_active, account_created, payment_gateway_ready, landing_active")
      .eq("workflow_id", workflow.id)
      .maybeSingle();
    takedrop = td;
  }

  // 3. Ads (per workflow) — current stage flags
  let ads = null;
  if (workflow) {
    const { data: a } = await supabase
      .from("workflow_ads")
      .select("partner_access_granted, fanpage_access_granted, instagram_access_granted, phone_verified, ad_account_ready, budget_funded, campaign_launched")
      .eq("workflow_id", workflow.id)
      .maybeSingle();
    ads = a;
  }

  // 4. Client knowledge (cached threads)
  const { data: knowledge, error: knowErr } = await supabase
    .from("client_knowledge")
    .select("threads, thread_count, last_thread_date, last_scanned_at")
    .eq("customer_email", customer_email)
    .maybeSingle();

  const knowledgeAvailable = !!knowledge && !knowErr;
  const knowledgeStale = knowledgeAvailable && knowledge.last_scanned_at &&
    (Date.now() - new Date(knowledge.last_scanned_at).getTime()) > 24 * 3600 * 1000;

  // 5. Landing slug hint — derive from brand_name (if present) or domain
  let landingSlugHint: string | null = null;
  if (takedrop?.legal_data) {
    // deno-lint-ignore no-explicit-any
    const brand = (takedrop.legal_data as any).brand_name as string | undefined;
    if (brand) {
      landingSlugHint = brand.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
    }
  }
  if (!landingSlugHint && takedrop?.landing_url) {
    landingSlugHint = takedrop.landing_url.replace(/^(https?:\/\/)?(www\.)?/, "").split(/[./]/)[0];
  }

  // 6. Unanswered threads — quick win for Claude
  // deno-lint-ignore no-explicit-any
  const unanswered = (knowledge?.threads as any[] ?? [])
    .filter((t) => t.hasUnansweredFromClient)
    .map((t) => ({
      threadId: t.threadId,
      subject: t.subject,
      lastDate: t.lastDate,
      lastSnippet: t.lastSnippet,
    }));

  return json({
    customer_email,
    workflow,
    takedrop,
    ads,
    landing_slug_hint: landingSlugHint,
    knowledge: knowledgeAvailable ? {
      thread_count: knowledge.thread_count,
      last_thread_date: knowledge.last_thread_date,
      last_scanned_at: knowledge.last_scanned_at,
      stale: knowledgeStale,
      threads: knowledge.threads,
      unanswered_threads: unanswered,
    } : null,
    knowledge_action: knowledgeAvailable
      ? (knowledgeStale ? "consider_rescan" : "fresh")
      : "scan_needed",
    knowledge_scan_url: `/functions/v1/gmail-scan-client (POST {\"customer_email\":\"${customer_email}\"})`,
  });
});

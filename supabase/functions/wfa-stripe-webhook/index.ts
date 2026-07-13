// wfa-stripe-webhook — webhook Connect PLATFORMY Stripe (event: account.updated).
// Cel: automatyczne odhaczanie pozycji kroku stripe_kyc, gdy klient-operator ukończy KYC
// (charges_enabled) i gdy BLIK stanie się aktywny — bez udziału sesji ani Tomka.
//
// Weryfikacja: nagłówek Stripe-Signature (t=...,v1=...), HMAC-SHA256 z sekretem
// env STRIPE_CONNECT_WEBHOOK_SECRET (whsec_... zwrócony przy tworzeniu endpointu).
// Deploy: npx supabase functions deploy wfa-stripe-webhook --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws

import { createClient } from "jsr:@supabase/supabase-js@2";

// Teksty pozycji = klucz deduplikacji checklisty w panelu — IDENTYCZNE z WS.stripe_kyc.
const ITEM_KYC = "KYC ukończone: charges_enabled = true (dane firmy, konto bankowe)";
const ITEM_BLIK = "BLIK capability aktywna";
const TOLERANCE_S = 600;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  try {
    const parts = Object.fromEntries(header.split(",").map((p) => p.split("=", 2) as [string, string]));
    const t = parts["t"];
    const v1 = parts["v1"];
    if (!t || !v1) return false;
    if (Math.abs(Date.now() / 1000 - Number(t)) > TOLERANCE_S) return false;
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`));
    const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
    return expected === v1.toLowerCase();
  } catch (e) {
    console.error("[wfa-stripe-webhook] signature error:", e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  try {
    const secret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET");
    const bodyText = await req.text();
    if (secret) {
      const sig = req.headers.get("stripe-signature") || "";
      if (!(await verifyStripeSignature(bodyText, sig, secret))) {
        return json({ error: "invalid signature" }, 401);
      }
    } else {
      console.warn("[wfa-stripe-webhook] Brak STRIPE_CONNECT_WEBHOOK_SECRET — przetwarzam bez weryfikacji");
    }

    const event = JSON.parse(bodyText);
    if (event?.type !== "account.updated") return json({ ok: true, ignored: event?.type ?? null });

    const acct = event?.data?.object || {};
    const acctId: string = acct.id || event?.account || "";
    if (!acctId) return json({ ok: true, ignored: "no account id" });

    const chargesEnabled = acct.charges_enabled === true;
    const blikActive = acct?.capabilities?.blik_payments === "active";
    if (!chargesEnabled && !blikActive) return json({ ok: true, nothing_to_mark: true });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: proj } = await sb
      .from("wfa_projects").select("id, name").eq("stripe_account_id", acctId).maybeSingle();
    if (!proj) return json({ ok: true, ignored: "unknown account" });

    const { data: step } = await sb
      .from("wfa_steps").select("id, data").eq("project_id", proj.id).eq("step_key", "stripe_kyc").maybeSingle();
    if (!step) return json({ ok: true, ignored: "no stripe_kyc step" });

    const data = (step.data && typeof step.data === "object") ? step.data as Record<string, unknown> : {};
    const checklist: { t: string; done: boolean }[] = Array.isArray(data.checklist) ? [...data.checklist as []] : [];
    const marked: string[] = [];
    const mark = (itemText: string, shouldMark: boolean) => {
      if (!shouldMark) return;
      const i = checklist.findIndex((x) => x && x.t === itemText);
      if (i >= 0 && checklist[i].done !== true) { checklist[i] = { ...checklist[i], done: true }; marked.push(itemText); }
      else if (i < 0) { checklist.push({ t: itemText, done: true }); marked.push(itemText); }
    };
    mark(ITEM_KYC, chargesEnabled);
    mark(ITEM_BLIK, blikActive);
    if (!marked.length) return json({ ok: true, already_marked: true });

    await sb.from("wfa_steps").update({ data: { ...data, checklist } }).eq("id", step.id);
    await sb.from("wfa_activities").insert({
      project_id: proj.id,
      actor: "auto",
      action: "stripe_kyc",
      description: `Stripe (webhook): ${chargesEnabled ? "KYC ukończone" : ""}${chargesEnabled && blikActive ? " + " : ""}${blikActive ? "BLIK aktywny" : ""} — odhaczono automatycznie (${acctId}).`,
    });
    console.log(`[wfa-stripe-webhook] ${proj.id}: marked ${marked.length} item(s) for ${acctId}`);
    return json({ ok: true, marked });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[wfa-stripe-webhook] ERROR:", msg);
    return json({ ok: false, error: msg }, 200);
  }
});

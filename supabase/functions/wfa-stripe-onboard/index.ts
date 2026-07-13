// wfa-stripe-onboard — STAŁY link onboardingu Stripe dla klienta-operatora (krok stripe_kyc).
// Problem: Stripe Account Links wygasają po kilku minutach — nie wolno wysyłać ich mailem.
// Rozwiązanie: klient dostaje mailem link do TEJ funkcji (stały), a ona przy KAŻDYM kliknięciu:
//   1. weryfikuje projekt po unique_token (ten sam sekret co portal /twoja-aplikacja),
//   2. tworzy Standard connected account przy pierwszym wejściu (zapis acct_… do wfa_projects),
//   3. generuje ŚWIEŻY Account Link (type=account_onboarding) i robi 302 na Stripe.
// refresh_url = ta sama funkcja (Stripe sam wraca po świeży link), return_url = portal klienta.
//
// Env: STRIPE_PLATFORM_SECRET (sk_… konta PLATFORMY Connect Tomka; bez niego → strona „jeszcze nie aktywne").
// Deploy: npx supabase functions deploy wfa-stripe-onboard --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws
//   (--no-verify-jwt: klient klika z maila bez JWT; gate = unique_token projektu)

import { createClient } from "jsr:@supabase/supabase-js@2";

const STRIPE_API = "https://api.stripe.com/v1";
const PORTAL_URL = "https://crm.tomekniedzwiecki.pl/twoja-aplikacja";
const FN_URL = "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wfa-stripe-onboard";

// Prosta strona HTML dla klienta (klika z maila — nie pokazujemy mu JSON-a)
function page(title: string, msg: string, status = 200): Response {
  const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>
<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f6f4;color:#222;
display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px}
.card{background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:40px;max-width:440px;text-align:center}
h1{font-size:18px;margin:0 0 10px}p{font-size:14px;color:#555;line-height:1.5;margin:0}</style></head>
<body><div class="card"><h1>${title}</h1><p>${msg}</p></div></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

async function stripe(secret: string, path: string, params: Record<string, string>): Promise<Record<string, any>> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || `Stripe ${res.status}`);
  return json;
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const projectId = (url.searchParams.get("project") || "").trim();
    const token = (url.searchParams.get("t") || "").trim();
    if (!projectId || !token) return page("Nieprawidłowy link", "Brakuje parametrów. Użyj linku z wiadomości e-mail.", 400);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: proj } = await sb
      .from("wfa_projects")
      .select("id, name, customer_email, stripe_account_id, unique_token")
      .eq("id", projectId)
      .maybeSingle();

    // Gate: unique_token projektu (ten sam sekret co portal klienta)
    if (!proj || !proj.unique_token || proj.unique_token !== token) {
      return page("Nieprawidłowy link", "Link jest nieprawidłowy lub wygasł. Skontaktuj się z nami.", 403);
    }

    const secret = Deno.env.get("STRIPE_PLATFORM_SECRET");
    if (!secret) {
      return page("Jeszcze chwila…", "Konfiguracja płatności jest w przygotowaniu. Spróbuj ponownie później — damy znać, gdy będzie gotowa.", 503);
    }

    // 1) Connected account (Standard) — tworzony raz, przy pierwszym kliknięciu
    let acct = (proj.stripe_account_id || "").trim();
    if (!acct) {
      let account: Record<string, any>;
      try {
        // BLIK requestujemy od razu (PL); karty/transfery ogarnia onboarding Standard
        account = await stripe(secret, "/accounts", {
          type: "standard",
          country: "PL",
          email: proj.customer_email || "",
          "capabilities[card_payments][requested]": "true",
          "capabilities[transfers][requested]": "true",
          "capabilities[blik_payments][requested]": "true",
        });
      } catch (_e) {
        // Fallback: niektóre capabilities bywają odrzucane przy type=standard — konto bez nich,
        // BLIK włączy klient w dashboardzie / my przy stripe_plany.
        account = await stripe(secret, "/accounts", {
          type: "standard",
          country: "PL",
          email: proj.customer_email || "",
        });
      }
      acct = account.id;
      await sb.from("wfa_projects").update({ stripe_account_id: acct }).eq("id", proj.id);
      console.log(`[wfa-stripe-onboard] utworzono ${acct} dla projektu ${proj.id}`);
    }

    // 2) Świeży Account Link i redirect (link jednorazowy, krótkotrwały — dlatego generujemy per klik)
    const selfUrl = `${FN_URL}?project=${encodeURIComponent(projectId)}&t=${encodeURIComponent(token)}`;
    const link = await stripe(secret, "/account_links", {
      account: acct,
      type: "account_onboarding",
      refresh_url: selfUrl,
      return_url: `${PORTAL_URL}?t=${encodeURIComponent(token)}&stripe=done`,
    });

    return new Response(null, { status: 302, headers: { Location: link.url } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[wfa-stripe-onboard] ERROR:", msg);
    return page("Coś poszło nie tak", "Nie udało się otworzyć formularza Stripe. Spróbuj ponownie za chwilę lub napisz do nas.", 500);
  }
});

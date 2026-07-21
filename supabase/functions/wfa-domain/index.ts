// wfa-domain — zakup i weryfikacja domen fabryki TN App przez GoDaddy Domains API.
// Zero plików lokalnych: klucze GODADDY_API_KEY/SECRET żyją w sekretach Supabase.
//
// Gate (jak wfa-partner-mail): service key (SERVICE_ROLE_KEY / SUPABASE_SECRET_KEYS)
// LUB JWT członka team_members. Deploy --no-verify-jwt (sb_secret_* nie jest JWT-em),
// ale każda akcja przechodzi przez gate poniżej. ZERO dostępu anon.
//
// Akcje (POST JSON):
//  {action:'check', domain}                          → dostępność przez RDAP (dns.pl / rdap.org)
//  {action:'validate', domain, email, phone, ns?}    → GoDaddy purchase/validate (nic nie kupuje)
//  {action:'buy', domain, email, phone, ns?, confirm:true, project_id?, wf2_project_id?}
//      → PRAWDZIWY zakup (karta konta GoDaddy!); bez confirm===true = 400.
//        project_id (opcjonalnie) = wpis do wfa_activities (tor tn-app).
//        wf2_project_id (opcjonalnie) = wpis do wf2_activities + wf2_costs (tor wf2/sklepy).
//        Odpowiedź buy niesie też amount_pln / currency / total_micro (audyt kosztu).
//  {action:'status', domain}                         → stan domeny (authCode REDAKTOWANY)
//  {action:'set_ns', domain, ns?}                    → PATCH nameServers (default Vercel) — TOR tn-app
//
// TOR wf2 (sklepy) — zarządzanie strefą DNS na koncie GoDaddy (NS zostają na GoDaddy,
// domena NIE idzie na Vercel — ZAKAZ set_ns w wf2; sklep hostuje platforma Trevio):
//  {action:'dns_get', domain, type?, name?}          → GET rekordów strefy
//  {action:'dns_set', domain, records:[{type,name,data,ttl?,priority?}]} → PUT rekordów (replace per typ+nazwa, idempotentne)
//  {action:'dns_delete', domain, type, name}         → DELETE rekordu (sprzątanie po testach)
//
// GOTCHAS GoDaddy (empirycznie 20.07, projekt Sygno):
//  - /available = 403 przy koncie <50 domen → check robimy RDAP-em, nie GoDaddy.
//  - schemat .pl nie zna pola `privacy` (422) — nie wysyłamy go.
//  - kontakty MUSZĄ być ASCII (wzorce odrzucają ź/ł/ó) — walidacja poniżej.
//  - ceny przez API nie widać — buy zwraca total z ordera PO zakupie (micro-jednostki).
//  - purchase .pl IGNORUJE nameServers z payloadu → NASK dostaje default nsXX.domaincontrol.com.
//    W tn-app to wada (dlatego set_ns→Vercel); w wf2 to ZALETA (strefa zostaje w GoDaddy).

const GD = "https://api.godaddy.com";
const DEFAULT_NS = ["ns1.vercel-dns.com", "ns2.vercel-dns.com"];
const CONTACT_BASE = {
  nameFirst: "Tomasz",
  nameLast: "Niedzwiecki",
  organization: "Tomasz Niedzwiecki AI",
  addressMailing: {
    address1: "ul. Grawerska 30L",
    city: "Wroclaw",
    state: "dolnoslaskie",
    postalCode: "51-180",
    country: "PL",
  },
};

const cors = {
  "Access-Control-Allow-Origin": "https://crm.tomekniedzwiecki.pl",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const NS_RE = /^[a-z0-9][a-z0-9.-]{2,253}$/;
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "content-type": "application/json" } });

// eslint-disable-next-line no-control-regex
const ASCII_RE = /^[\x20-\x7e]*$/;

async function isTeamJwt(token: string): Promise<boolean> {
  const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY") || "";
  try {
    const u = await fetch(`${SUPA_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: ANON },
    });
    if (!u.ok) return false;
    const user = await u.json();
    if (!user?.id) return false;
    const tm = await fetch(`${SUPA_URL}/rest/v1/team_members?select=user_id&user_id=eq.${user.id}`, {
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
    });
    const rows = await tm.json().catch(() => []);
    return Array.isArray(rows) && rows.length > 0;
  } catch (_) {
    return false;
  }
}

async function authOk(req: Request): Promise<boolean> {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return false;
  if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) return true;
  if (token.startsWith("sb_secret_")) {
    try {
      const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
      if (Object.values(keys).some((k) => k === token)) return true;
    } catch (_) { /* fallthrough */ }
  }
  // JWT członka zespołu (panel) — anon key NIGDY nie przechodzi (auth/v1/user odrzuci)
  if (token !== Deno.env.get("SUPABASE_ANON_KEY")) return await isTeamJwt(token);
  return false;
}

function gdHeaders() {
  const key = Deno.env.get("GODADDY_API_KEY");
  const secret = Deno.env.get("GODADDY_API_SECRET");
  if (!key || !secret) throw new Error("brak GODADDY_API_KEY/SECRET w sekretach");
  return { Authorization: `sso-key ${key}:${secret}`, "content-type": "application/json", accept: "application/json" };
}

async function gd(method: string, path: string, body?: unknown) {
  const r = await fetch(GD + path, {
    method,
    headers: gdHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await r.text();
  let data: unknown;
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { raw }; }
  return { status: r.status, data };
}

async function rdapCheck(domain: string): Promise<{ available: boolean | null; source: string }> {
  const isPl = domain.endsWith(".pl");
  const url = isPl ? `https://rdap.dns.pl/domain/${domain}` : `https://rdap.org/domain/${domain}`;
  const r = await fetch(url, { redirect: "follow" });
  if (r.status === 404) return { available: true, source: url };
  if (r.status === 200) return { available: false, source: url };
  return { available: null, source: `${url} → HTTP ${r.status}` };
}

function buildPurchaseBody(domain: string, email: string, phone: string, ns: string[], agreementKeys: string[]) {
  const contact = { ...CONTACT_BASE, email, phone };
  return {
    domain,
    period: 1,
    renewAuto: true,
    nameServers: ns,
    consent: {
      agreementKeys,
      agreedBy: `${CONTACT_BASE.nameFirst} ${CONTACT_BASE.nameLast}`,
      agreedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    },
    contactRegistrant: contact,
    contactAdmin: contact,
    contactTech: contact,
    contactBilling: contact,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!(await authOk(req))) return json({ error: "brak_autoryzacji" }, 401);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "zly_json" }, 400); }
  const action = String(body.action || "");
  const domain = String(body.domain || "").toLowerCase().trim();
  if (!/^[a-z0-9][a-z0-9-]*\.[a-z0-9.-]+$/.test(domain)) return json({ error: "zla_domena" }, 400);

  try {
    if (action === "check") {
      const r = await rdapCheck(domain);
      return json({ domain, ...r });
    }

    if (action === "set_ns") {
      // GOTCHA .pl (empirycznie 20.07, sygno.pl): purchase z nameServers jest IGNOROWANY przy
      // rejestracji .pl — NASK dostaje defaultowe NS GoDaddy (nsXX.domaincontrol.com).
      // Po zakupie trzeba ustawić NS osobnym PATCH-em.
      const ns = Array.isArray(body.ns) && body.ns.length ? body.ns.map((x) => String(x).toLowerCase().trim()) : DEFAULT_NS;
      if (ns.length > 4 || ns.some((h) => !NS_RE.test(h))) return json({ error: "zle_nameservery" }, 400);
      const r = await gd("PATCH", `/v1/domains/${domain}`, { nameServers: ns });
      const ok = r.status === 200 || r.status === 202 || r.status === 204;
      return json({ http: r.status, ok, ns, detail: r.data }, ok ? 200 : 502);
    }

    if (action === "status") {
      const { status, data } = await gd("GET", `/v1/domains/${domain}`);
      if (data && typeof data === "object" && "authCode" in (data as Record<string, unknown>)) {
        (data as Record<string, unknown>).authCode = "[REDACTED]";
      }
      return json({ http: status, data }, status === 200 ? 200 : 502);
    }

    // ── TOR wf2: zarządzanie strefą DNS na koncie GoDaddy (działa tylko gdy domena
    // używa NS GoDaddy — nasz przypadek dla .pl, patrz GOTCHA nagłówka) ──
    const DNS_TYPES = ["A", "AAAA", "CNAME", "TXT", "MX"];

    if (action === "dns_get") {
      const type = body.type ? String(body.type).toUpperCase().trim() : "";
      const name = body.name ? String(body.name).trim() : "";
      if (type && !DNS_TYPES.includes(type)) return json({ error: `zly_typ_rekordu: ${type}` }, 400);
      let path = `/v1/domains/${domain}/records`;
      if (type) path += `/${type}`;
      if (type && name) path += `/${encodeURIComponent(name)}`;
      const r = await gd("GET", path);
      return json({ http: r.status, records: r.data }, r.status === 200 ? 200 : 502);
    }

    if (action === "dns_set") {
      const recs = Array.isArray(body.records) ? (body.records as Array<Record<string, unknown>>) : [];
      if (!recs.length) return json({ error: "brak_records" }, 400);
      // walidacja: type z whitelisty, name i data niepuste
      for (const rec of recs) {
        const t = String(rec?.type || "").toUpperCase().trim();
        const name = String(rec?.name ?? "").trim();
        const data = String(rec?.data ?? "").trim();
        if (!DNS_TYPES.includes(t)) return json({ error: `zly_typ_rekordu: ${t || "(brak)"}` }, 400);
        if (!name || !data) return json({ error: "name_i_data_wymagane" }, 400);
      }
      // grupuj po (type,name) — GoDaddy PUT records/{type}/{name} zastępuje CAŁĄ tablicę tej pary
      const groups = new Map<string, Array<Record<string, unknown>>>();
      for (const rec of recs) {
        const t = String(rec.type).toUpperCase().trim();
        const name = String(rec.name).trim();
        const key = `${t} ${name}`;
        const ttlNum = Number(rec.ttl);
        const entry: Record<string, unknown> = {
          data: String(rec.data).trim(),
          ttl: ttlNum > 0 ? ttlNum : 600,
        };
        if (t === "MX") {
          const prio = Number(rec.priority);
          entry.priority = Number.isFinite(prio) && prio >= 0 ? prio : 10;
        }
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(entry);
      }
      const results: Array<{ type: string; name: string; http: number; ok: boolean }> = [];
      for (const [key, arr] of groups) {
        const [t, name] = key.split(" ");
        const r = await gd("PUT", `/v1/domains/${domain}/records/${t}/${encodeURIComponent(name)}`, arr);
        const okp = r.status >= 200 && r.status < 300;
        results.push({ type: t, name, http: r.status, ok: okp });
      }
      const allOk = results.every((x) => x.ok);
      return json({ results, ok: allOk }, allOk ? 200 : 502);
    }

    if (action === "dns_delete") {
      const type = String(body.type || "").toUpperCase().trim();
      const name = String(body.name || "").trim();
      if (!DNS_TYPES.includes(type)) return json({ error: `zly_typ_rekordu: ${type || "(brak)"}` }, 400);
      if (!name) return json({ error: "name_wymagane" }, 400);
      const r = await gd("DELETE", `/v1/domains/${domain}/records/${type}/${encodeURIComponent(name)}`);
      const okp = r.status >= 200 && r.status < 300;
      return json({ http: r.status, ok: okp }, okp ? 200 : 502);
    }

    if (action === "validate" || action === "buy") {
      const email = String(body.email || Deno.env.get("GODADDY_CONTACT_EMAIL") || "");
      const phone = String(body.phone || Deno.env.get("GODADDY_CONTACT_PHONE") || "");
      if (!email || !phone) return json({ error: "brak email/phone (body lub sekrety GODADDY_CONTACT_*)" }, 400);
      if (!ASCII_RE.test(email) || !email.includes("@") || !/^\+\d{1,3}\.\d{6,14}$/.test(phone)) {
        return json({ error: "email musi być ASCII z @, phone w formacie +48.XXXXXXXXX" }, 400);
      }
      const ns = Array.isArray(body.ns) && body.ns.length ? body.ns.map((x) => String(x).toLowerCase().trim()) : DEFAULT_NS;
      if (ns.length > 4 || ns.some((h) => !NS_RE.test(h))) return json({ error: "zle_nameservery" }, 400);
      const tld = domain.split(".").slice(1).join(".");
      const ag = await gd("GET", `/v1/domains/agreements?tlds=${tld}&privacy=false`);
      if (ag.status !== 200) return json({ error: "agreements_fail", detail: ag.data }, 502);
      const keys = (ag.data as Array<{ agreementKey: string }>).map((a) => a.agreementKey);
      const purchase = buildPurchaseBody(domain, email, phone, ns, keys);

      if (action === "validate") {
        const r = await gd("POST", "/v1/domains/purchase/validate", purchase);
        return json({ http: r.status, ok: r.status === 200, detail: r.data });
      }

      // buy — PRAWDZIWA PŁATNOŚĆ: twardy wymóg jawnego confirm
      if (body.confirm !== true) return json({ error: "buy wymaga confirm:true (płatność z karty konta GoDaddy)" }, 400);
      const dupe = await gd("GET", `/v1/domains/${domain}`);
      if (dupe.status === 200) return json({ error: "domena_juz_na_koncie", detail: "idempotencja — nie kupuję drugi raz" }, 409);
      const r = await gd("POST", "/v1/domains/purchase", purchase);
      const ok = r.status === 200 || r.status === 202;
      // Flagi integralności (audyt GATE A 20.07): wołający MUSI wiedzieć, gdy koszt/kurs nie zapisał się sam.
      let costRecorded = false;
      let fxMissing = false;
      let priceAlert: string | null = null;
      // Kwota audytowa — wyliczona raz, zwracana w odpowiedzi i reużyta w torze wf2 (wf2_costs).
      let amountPln = 0;
      let currency = "USD";
      let totalMicro = 0;
      if (ok) {
        try {
          const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
          const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
          const order = r.data as Record<string, unknown>;
          totalMicro = Number(order?.total ?? 0);
          currency = String(order?.currency ?? "USD");
          // pułap ceny: powyżej progu głośny alert (blind-buy — ceny nie widać przed zakupem)
          const maxMicro = Number(Deno.env.get("GODADDY_MAX_PRICE_MICRO") || 200_000_000); // default $200
          if (totalMicro > maxMicro) {
            priceAlert = `UWAGA: cena ${totalMicro / 1_000_000} ${currency} przekracza próg ${maxMicro / 1_000_000} — sprawdź order!`;
            console.error(`[wfa-domain] PRICE ALERT ${domain}: ${priceAlert}`);
          }
          let kursNote = "";
          if (currency === "PLN") {
            amountPln = totalMicro / 1_000_000;
          } else {
            const nbp = await fetch(
              `https://api.nbp.pl/api/exchangerates/rates/a/${currency.toLowerCase()}/?format=json`,
            ).then((x) => x.json()).catch(() => null);
            const mid = nbp?.rates?.[0]?.mid;
            if (mid) {
              amountPln = Math.round((totalMicro / 1_000_000) * mid * 100) / 100;
              kursNote = ` (kurs NBP ${mid} z ${nbp.rates[0].effectiveDate})`;
            } else {
              fxMissing = true;
              kursNote = " (BRAK KURSU NBP — amount wymaga ręcznego uzupełnienia!)";
              console.error(`[wfa-domain] FX MISSING dla ${domain}: NBP nie odpowiedział, koszt zapisany z amount=0`);
            }
          }
          const projNote = body.project_id ? ` [projekt ${body.project_id}]` : "";
          const ins = await fetch(`${SUPA_URL}/rest/v1/biznes_costs`, {
            method: "POST",
            headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "content-type": "application/json" },
            body: JSON.stringify({
              name: `Domena ${domain}`,
              description: `GoDaddy order ${order?.orderId ?? "?"}, ${totalMicro / 1_000_000} ${currency}${kursNote}, rejestracja 1 rok, renewAuto ON${projNote}`,
              category: "tools",
              amount: amountPln,
              cost_type: "one_time",
              month: new Date().toISOString().slice(0, 8) + "01",
              is_paid: true,
              paid_at: new Date().toISOString(),
            }),
          });
          costRecorded = ins.ok;
          if (!ins.ok) console.error(`[wfa-domain] KOSZT NIE ZAPISANY dla ${domain}: HTTP ${ins.status} ${await ins.text().catch(() => "")}`);
        } catch (e) {
          console.error(`[wfa-domain] KOSZT NIE ZAPISANY dla ${domain}: ${e}`);
        }
      }
      if (ok && body.project_id) {
        const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
        const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        await fetch(`${SUPA_URL}/rest/v1/wfa_activities`, {
          method: "POST",
          headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "content-type": "application/json" },
          body: JSON.stringify({
            project_id: body.project_id,
            actor: "wfa-domain",
            action: "domena_kupiona",
            description: `Kupiono ${domain} przez GoDaddy API (order ${
              (r.data as Record<string, unknown>)?.orderId ?? "?"
            }), NS: ${ns.join(", ")}`,
          }),
        }).catch(() => {});
      }
      // TOR wf2 (sklepy) — kronika + koszt jednostkowy projektu (biznes_costs zostaje jak wyżej,
      // tu duplikujemy tylko do księgowości modułu; kwota = ta sama amountPln, 0 przy fx_missing).
      if (ok && body.wf2_project_id) {
        const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
        const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const orderId = (r.data as Record<string, unknown>)?.orderId ?? "?";
        await fetch(`${SUPA_URL}/rest/v1/wf2_activities`, {
          method: "POST",
          headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "content-type": "application/json" },
          body: JSON.stringify({
            project_id: body.wf2_project_id,
            actor: "wfa-domain",
            action: "domena_kupiona",
            description: `Kupiono ${domain} przez GoDaddy (order ${orderId}, ${amountPln} PLN). NS zostają na GoDaddy — strefą DNS zarządza dns_set.`,
          }),
        }).catch(() => {});
        await fetch(`${SUPA_URL}/rest/v1/wf2_costs`, {
          method: "POST",
          headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "content-type": "application/json" },
          body: JSON.stringify({
            project_id: body.wf2_project_id,
            product_id: null,
            step_key: "pl_domena",
            stage: 1,
            amount: amountPln,
            currency: "PLN",
            kind: "domena",
            note: `Domena ${domain} (GoDaddy order ${orderId})${fxMissing ? " — BRAK KURSU NBP, uzupełnij kwotę ręcznie" : ""}`,
            created_by: "auto",
          }),
        }).catch(() => {});
      }
      return json({
        http: r.status,
        ok,
        detail: r.data,
        cost_recorded: costRecorded,
        fx_missing: fxMissing,
        price_alert: priceAlert,
        amount_pln: amountPln,
        currency,
        total_micro: totalMicro,
      }, ok ? 200 : 502);
    }

    return json({ error: "nieznana_akcja" }, 400);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

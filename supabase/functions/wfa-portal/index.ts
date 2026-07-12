// wfa-portal — publiczny odczyt postępu budowy aplikacji dla KLIENTA (kamienie milowe)
// + mechanizm UMOWY (zbieranie danych, render w locie, pobranie do podpisu).
// Wzorzec: RLS wfa_* = tylko team; klient dostaje dane WYŁĄCZNIE przez tę funkcję
// (token z URL + hasło ustawione przez Tomka w panelu; hasło = SHA-256 w client_password_hash).
//
// Body BEZ `action` = status projektu (postęp %, etapy, kamienie).
// Body z `action`:
//   'contract_meta'  → { contract_status, fields, has_final, final_url, name, customer_name, customer_email }
//   'contract_data'  → zapis danych klienta (tylko gdy status='dane_klienta') → status='do_podpisu'
//   'contract_html'  → render umowy W LOCIE (szablon/custom + podstawienie {{...}}); { html }
//
// LEKCJA „baked placeholders" (tn-crm): render ZAWSZE w locie, NIGDY nie zapisujemy podstawionego HTML.
//
// Deploy: npx supabase functions deploy wfa-portal --no-verify-jwt --project-ref yxmavwkwnfuphjqbelws

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TEMPLATE_URL = "https://crm.tomekniedzwiecki.pl/umowy/umowa-budowa-aplikacji.html";

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Podgląd admina „oczami klienta": autoryzacja JWT CZŁONKA ZESPOŁU (team_members),
// nie samego 'authenticated' — publiczna rejestracja sparingu daje tę rolę każdemu
// (wzorzec bud-project 'admin_get'). Zwraca usera albo null.
async function verifyTeamMember(
  req: Request,
  sb: ReturnType<typeof createClient>,
): Promise<{ id: string } | null> {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const { data: u } = await sb.auth.getUser(m[1].trim());
  if (!u?.user) return null;
  const { data: tm } = await sb
    .from("team_members").select("user_id").eq("user_id", u.user.id).maybeSingle();
  return tm ? { id: u.user.id } : null;
}

function fmtDatePl(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

// Render umowy w locie: usuń baner szablonu (.warn) + podstaw placeholdery danych.
// wyk = { nazwa, nip, adres } z settings.aplikacja_wykonawca_dane; gdy null — WYKONAWCA_* zostają jak są.
function renderContractHtml(
  rawHtml: string,
  p: Record<string, unknown>,
  wyk: { nazwa?: string; nip?: string; adres?: string } | null,
): string {
  let html = rawHtml.replace(/<div class="warn[^"]*"[^>]*>[\s\S]*?<\/div>/, "");
  const f = (p.contract_fields as Record<string, string>) || {};
  const company = (f.company || "").trim();
  const street = (f.street || "").trim();
  const postal = (f.postal || "").trim();
  const city = (f.city || "").trim();
  const adres = [street, [postal, city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const dataDate = p.contract_sent_at ? new Date(String(p.contract_sent_at)) : new Date();

  const map: Record<string, string> = {
    "{{ZAMAWIAJACY_IMIE_NAZWISKO}}": String(f.full_name || p.customer_name || ""),
    "{{ZAMAWIAJACY_FIRMA}}": company ? ", " + company : "",
    "{{ZAMAWIAJACY_NIP}}": String(f.nip || ""),
    "{{ZAMAWIAJACY_ADRES}}": adres,
    "{{ZAMAWIAJACY_EMAIL}}": String(p.customer_email || ""),
    "{{DATA}}": fmtDatePl(dataDate),
    "{{TERMIN_TYGODNI}}": String(f.termin_tygodni || "8"),
    "{{NAZWA_APLIKACJI_ROBOCZA}}": String(p.name || ""),
    "{{FEE_PERCENT}}": String(p.fee_percent != null ? p.fee_percent : 10),
  };
  if (wyk) {
    if (wyk.nazwa != null) map["{{WYKONAWCA_NAZWA}}"] = String(wyk.nazwa);
    if (wyk.nip != null) map["{{WYKONAWCA_NIP}}"] = String(wyk.nip);
    if (wyk.adres != null) map["{{WYKONAWCA_ADRES}}"] = String(wyk.adres);
  }
  for (const [k, v] of Object.entries(map)) html = html.split(k).join(v);
  return html;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // Limit rozmiaru body (10 kB) — czytamy surowo, dopiero potem parsujemy.
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  if (raw.length > 10240) return json({ error: "payload_too_large" }, 413);

  let body: {
    token?: string;
    password?: string;
    action?: string;
    fields?: Record<string, unknown>;
    preview?: boolean;
  };
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const token = (body.token || "").trim();
  const password = (body.password || "").trim();
  const preview = body.preview === true; // podgląd admina „oczami klienta"
  if (!/^[0-9a-f]{32}$/i.test(token)) {
    await sleep(300); // tania mitygacja brute-force
    return json({ error: "unauthorized" }, 401);
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Tryb PODGLĄDU: JWT członka zespołu zamiast hasła klienta. READ-ONLY (zero zapisów),
  // działa NAWET gdy hasło portalu nie jest jeszcze ustawione — sens: Tomek weryfikuje
  // widok klienta PRZED przekazaniem dostępu. JWT idzie w #hashu linku (nie w query/logach).
  let readonly = false;
  if (preview) {
    const member = await verifyTeamMember(req, sb);
    if (!member) {
      await sleep(300);
      return json({ error: "unauthorized" }, 401);
    }
    readonly = true;
  }

  const { data: p } = await sb
    .from("wfa_projects")
    .select(
      "id, name, customer_name, customer_email, status, deadline_at, client_password_hash, app_url, landing_url, fee_percent, contract_status, contract_fields, contract_custom_html, contract_sent_at, contract_final_path",
    )
    .eq("unique_token", token)
    .maybeSingle();

  if (!p) {
    await sleep(300);
    return json({ error: "unauthorized" }, 401);
  }

  // Ścieżka KLIENTA (nie podgląd): hasło (SHA-256) obowiązkowe. Hasło nieustawione =
  // portal wyłączony dla tego projektu (Tomek włącza w panelu).
  if (!preview) {
    if (!password || password.length > 200 || !p.client_password_hash) {
      await sleep(300);
      return json({ error: "unauthorized" }, 401);
    }
    const hash = await sha256Hex(password);
    if (hash !== String(p.client_password_hash).toLowerCase()) {
      await sleep(300);
      return json({ error: "unauthorized" }, 401);
    }
  }

  const action = (body.action || "").trim();

  // ============ UMOWA: metadane ============
  if (action === "contract_meta") {
    let final_url: string | null = null;
    if (p.contract_final_path) {
      const { data: pub } = sb.storage.from("attachments").getPublicUrl(String(p.contract_final_path));
      final_url = pub?.publicUrl || null;
    }
    return json({
      contract_status: p.contract_status || "brak",
      fields: p.contract_fields || {},
      has_final: !!p.contract_final_path,
      final_url,
      name: (p.name || "").trim() || "Twoja aplikacja",
      customer_name: p.customer_name || null,
      customer_email: p.customer_email || null,
    });
  }

  // ============ UMOWA: zapis danych klienta ============
  if (action === "contract_data") {
    if (readonly) return json({ error: "preview_readonly" }, 403); // podgląd admina nie zapisuje
    if (p.contract_status !== "dane_klienta") {
      return json({ error: "not_allowed_now" }, 409);
    }
    const inp = (body.fields || {}) as Record<string, string>;
    const clip = (v: unknown) => String(v == null ? "" : v).trim();
    const full_name = clip(inp.full_name);
    const company = clip(inp.company);
    const nip = clip(inp.nip).replace(/[\s-]/g, "");
    const street = clip(inp.street);
    const postal = clip(inp.postal);
    const city = clip(inp.city);

    const errs: string[] = [];
    if (!full_name) errs.push("Podaj imię i nazwisko.");
    if (!street) errs.push("Podaj ulicę i numer.");
    if (!city) errs.push("Podaj miejscowość.");
    if (postal && !/^\d{2}-\d{3}$/.test(postal)) errs.push("Kod pocztowy w formacie NN-NNN.");
    if (!postal) errs.push("Podaj kod pocztowy.");
    if (company && !nip) errs.push("Podaj NIP firmy.");
    if (nip && !/^\d{10}$/.test(nip)) errs.push("NIP musi mieć 10 cyfr.");
    for (const [k, v] of Object.entries({ full_name, company, street, postal, city })) {
      if (v.length > 200) errs.push(`Pole „${k}" jest za długie (max 200 znaków).`);
    }
    if (errs.length) return json({ error: "validation", messages: errs }, 400);

    const prevFields = (p.contract_fields as Record<string, unknown>) || {};
    const contract_fields = { ...prevFields, full_name, company, nip, street, postal, city };

    const update: Record<string, unknown> = {
      contract_fields,
      contract_status: "do_podpisu",
    };
    if (full_name && !((p.customer_name || "").trim())) update.customer_name = full_name;

    const { error: upErr } = await sb.from("wfa_projects").update(update).eq("id", p.id);
    if (upErr) return json({ error: "save_failed" }, 500);

    await sb.from("wfa_activities").insert({
      project_id: p.id,
      actor: "client",
      action: "contract_data",
      description: "Klient uzupełnił dane do umowy (gotowa do podpisu).",
    });
    return json({ ok: true });
  }

  // ============ UMOWA: render HTML w locie ============
  if (action === "contract_html") {
    if (!["do_podpisu", "podpisana_klient", "podpisana"].includes(String(p.contract_status))) {
      return json({ error: "not_allowed_now" }, 409);
    }
    let rawHtml = String(p.contract_custom_html || "");
    if (!rawHtml) {
      try {
        const resp = await fetch(TEMPLATE_URL);
        if (!resp.ok) throw new Error("template_fetch_failed");
        rawHtml = await resp.text();
      } catch {
        return json({ error: "template_unavailable" }, 502);
      }
    }
    // Dane wykonawcy z settings (text = JSON). Brak klucza → placeholdery zostają.
    let wyk: { nazwa?: string; nip?: string; adres?: string } | null = null;
    try {
      const { data: s } = await sb.from("settings").select("value").eq("key", "aplikacja_wykonawca_dane").maybeSingle();
      if (s && s.value) wyk = typeof s.value === "string" ? JSON.parse(s.value) : s.value;
    } catch { /* zostaw placeholdery */ }

    const html = renderContractHtml(rawHtml, p as Record<string, unknown>, wyk);
    // Informacyjnie znaczymy moment generacji (nie zapisujemy wyniku). W podglądzie admina
    // NIE stemplujemy — read-only nie może zostawiać śladów w danych klienta.
    if (!readonly) {
      await sb.from("wfa_projects").update({ contract_generated_at: new Date().toISOString() }).eq("id", p.id);
    }
    return json({ html });
  }

  // ============ DOMYŚLNIE: status projektu (kamienie milowe) ============
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
    contract_status: p.contract_status || "brak",
  });
});

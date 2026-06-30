// bud-tt-dedup — automatyczne oznaczanie duplikatów w radarze /trendy.
// CEL: nie zasypywać kolejki tym samym produktem pod różnymi nazwami/filmami. excludeExisting
// łapie tylko DOKŁADNĄ nazwę → warianty („wyciskarka" vs „komercyjna wyciskarka") przechodzą.
// SYGNAŁY (pending → status='duplicate', reviewed_by='auto-dedup'):
//   1) ITEM-ID: ta sama aukcja AliExpress w ali_candidates/chosen_link co u innego produktu = pewny duplikat.
//   2) NAZWA: konserwatywnie — ta sama KATEGORIA + zawieranie tokenów ≥0.8 i ≥2 wspólne znaczące słowa.
// Kotwice (nigdy nie zmieniane): approved/rejected/duplicate + starsze pending. Mark tylko młodsze pending.
// Idempotentne. Gate: adminGate. Deploy: --no-verify-jwt.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-tools-secret",
  "access-control-allow-methods": "POST, OPTIONS",
};

const STOP = new Set(["do", "na", "z", "ze", "w", "we", "i", "dla", "o", "u", "po", "za", "od", "the", "a", "to", "oraz", "pod", "przy", "bez", "lub"]);
function tokens(s: string): Set<string> {
  return new Set((s || "").toLowerCase().replace(/[^a-ząćęłńóśźż0-9 ]/g, " ").split(/\s+/).filter((t) => t.length > 2 && !STOP.has(t)));
}
function containment(a: Set<string>, b: Set<string>): { c: number; shared: number } {
  if (!a.size || !b.size) return { c: 0, shared: 0 };
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return { c: inter / Math.min(a.size, b.size), shared: inter };
}
// SILNE sygnały item-id: TYLKO najlepsze dopasowanie (top-1 kandydat, ułożony verify'em
// „od najlepszego") + chosen_link (approved). Dzielenie POBOCZNEGO kandydata to za słabo
// (różne produkty bywają mają wspólny luźny kandydat → fałszywy duplikat, np. kinkiet↔pielnik).
// deno-lint-ignore no-explicit-any
function itemIds(row: any): string[] {
  const ids = new Set<string>();
  const cands = Array.isArray(row.ali_candidates) ? row.ali_candidates : [];
  const top = cands[0];
  const topId = top && (top.id || (typeof top.link === "string" && (top.link.match(/\/item\/(\d+)/) || [])[1]));
  if (topId) ids.add(String(topId));
  const cm = typeof row.chosen_link === "string" && row.chosen_link.match(/\/item\/(\d+)/);
  if (cm) ids.add(cm[1]);
  return [...ids];
}
const STATUS_RANK: Record<string, number> = { approved: 0, rejected: 1, duplicate: 1, pending: 2 };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("method", { status: 405, headers: cors });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (!(await adminGate(req, supabase)))
    return new Response(JSON.stringify({ error: "wymagane_logowanie_admin" }), { status: 403, headers: { ...cors, "content-type": "application/json" } });

  const body = await req.json().catch(() => ({}));
  const dryRun = !!body.dryRun;
  const nameThreshold = typeof body.nameThreshold === "number" ? body.nameThreshold : 0.8;

  // Pełen radar. PostgREST tnie pojedyncze zapytanie do 1000 wierszy (db-max-rows), a pula
  // przekroczyła 1000 → MUSIMY paginować .range, inaczej created_at ASC + obcięcie gubi
  // NAJNOWSZE wiersze (świeżo zassane) i dedup ich nie sprawdza.
  // deno-lint-ignore no-explicit-any
  const rows: any[] = [];
  const PAGE = 1000;
  for (let off = 0; ; off += PAGE) {
    const { data, error } = await supabase
      .from("bud_tt_products")
      .select("key,pl_name,category,status,ali_candidates,chosen_link,created_at,heat")
      .order("created_at", { ascending: true })
      .range(off, off + PAGE - 1);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...cors, "content-type": "application/json" } });
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }

  // Kolejność przetwarzania: najpierw zdecydowane (approved<rejected/dup), potem pending od najstarszych.
  // deno-lint-ignore no-explicit-any
  const sorted = (rows || []).slice().sort((a: any, b: any) => {
    const r = (STATUS_RANK[a.status] ?? 3) - (STATUS_RANK[b.status] ?? 3);
    if (r) return r;
    return String(a.created_at).localeCompare(String(b.created_at));
  });

  const idMap = new Map<string, { key: string; cat: string }>();   // itemId → anchor {key,cat}
  const anchors: { key: string; toks: Set<string>; cat: string }[] = [];
  const marks: { key: string; dup_of: string; reason: string; name: string }[] = [];

  for (const row of sorted) {
    // Wiersze już 'duplicate' POMIJAMY całkiem — inaczej w kolejnym przebiegu stają się kotwicą
    // i oznaczają swój KANONICZNY odpowiednik (kaskada → oba duplikatem, znika z kolejki).
    // Kanoniczny jest już reprezentowany przez approved/pending, więc duplikat jako kotwica zbędny.
    if (row.status === "duplicate") continue;
    const ids = itemIds(row);
    const toks = tokens(row.pl_name);
    const cat = row.category || "Inne";
    let dupOf = "", reason = "";

    // item-id: ta sama aukcja (top-1) ORAZ ta sama kategoria — kategoria chroni przed
    // kontaminacją (zablokowana strona oddaje wynik poprzedniego produktu z innej kategorii).
    for (const id of ids) { const a = idMap.get(id); if (a && a.cat === cat) { dupOf = a.key; reason = "item"; break; } }
    if (!dupOf) {
      for (const a of anchors) {
        if (a.cat !== cat) continue;
        const { c, shared } = containment(toks, a.toks);
        // Konserwatywnie: krótsza nazwa MUSI mieć ≥3 znaczące słowa — inaczej 2 ogólne słowa
        // (np. „krem twarzy", „stolik kawowy") dają fałszywe trafienia. 2-tokenowe duplikaty
        // złapie pewny item-id po image-searchu.
        if (c >= nameThreshold && shared >= 2 && Math.min(toks.size, a.toks.size) >= 3) { dupOf = a.key; reason = "name"; break; }
      }
    }

    if (dupOf && row.status === "pending") {
      marks.push({ key: row.key, dup_of: dupOf, reason, name: row.pl_name });
      // duplikat NIE staje się kotwicą
    } else {
      for (const id of ids) if (!idMap.has(id)) idMap.set(id, { key: row.key, cat });
      anchors.push({ key: row.key, toks, cat });
    }
  }

  let updated = 0;
  if (!dryRun && marks.length) {
    const keys = marks.map((m) => m.key);
    for (let i = 0; i < keys.length; i += 200) {
      const chunk = keys.slice(i, i + 200);
      const { error: uErr } = await supabase.from("bud_tt_products")
        .update({ status: "duplicate", reviewed_by: "auto-dedup", reviewed_at: new Date().toISOString() })
        .in("key", chunk).eq("status", "pending");
      if (!uErr) updated += chunk.length;
    }
  }

  const byReason = { item: marks.filter((m) => m.reason === "item").length, name: marks.filter((m) => m.reason === "name").length };
  return new Response(JSON.stringify({ scanned: sorted.length, duplicates: marks.length, byReason, updated, dryRun, sample: marks.slice(0, 40) }), { headers: { ...cors, "content-type": "application/json" } });
});

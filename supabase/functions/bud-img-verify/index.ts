// bud-img-verify — filtr trafności dla kandydatów AliExpress z reverse-image (panel /trendy).
// PROBLEM: reverse-image na okładce TikToka (często kadr-haczyk: osoba/clickbait) zwraca
// kandydatów wizualnie podobnych do KADRU, nie do produktu (ubrania pod „wyciskarką").
// FIX: GPT-vision sprawdza KAŻDEGO kandydata względem NAZWY produktu (kotwica — wyłuskana
// przez GPT z opisu, wiarygodna) + kadru pomocniczo → zwraca tylko tych, którzy SĄ tym
// produktem (ten sam typ rzeczy/funkcja; kolor/wariant bez znaczenia). Pusta lista = żaden
// nie pasuje (lepsze niż pokazać ubranie pod wyciskarką).
// Gate: adminGate (team_member JWT z /trendy LUB x-tools-secret z backendu). Deploy: --no-verify-jwt.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { adminGate } from "../_shared/bud-owner.ts";
import { openaiFetchRetry } from "../_shared/openai-fetch.ts";

const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const MODEL = Deno.env.get("BUD_PRODUCTS_MODEL") || "gpt-5.1";
const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-tools-secret",
  "access-control-allow-methods": "POST, OPTIONS",
};

// AliExpress ae-pic: bazowy obraz + dopisany transform (`...jpg_480x480q75.jpg_.avif`).
// OpenAI vision NIE czyta avif → utnij transform do bazowego jpg/png/webp.
function normImg(u: string): string {
  return (u || "").replace(/(\.(jpg|jpeg|png|webp))_.*$/i, "$1");
}

// deno-lint-ignore no-explicit-any
async function gptMatches(frame: string, name: string, q: string, cands: any[], acc?: { i: number; c: number; o: number }): Promise<number[]> {
  // deno-lint-ignore no-explicit-any
  const content: any[] = [
    { type: "text", text: `Szukamy na AliExpress źródła produktu z TikToka.\nNAZWA produktu (najważniejsze): "${name}"${q ? ` (EN: ${q})` : ""}.\nKadr z filmu (POMOCNICZO — bywa kadrem-haczykiem z osobą/clickbaitem, nie zawsze pokazuje produkt):` },
    { type: "image_url", image_url: { url: frame } },
    { type: "text", text: "Kandydaci z AliExpress (zdjęcie produktu + tytuł):" },
  ];
  cands.forEach((c, i) => {
    content.push({ type: "text", text: `[${i}] ${(c.title || "").slice(0, 70)}` });
    content.push({ type: "image_url", image_url: { url: normImg(c.img) } });
  });
  content.push({ type: "text", text: `Dla KAŻDEGO kandydata zdecyduj: czy to TEN SAM produkt co NAZWA (ten sam typ rzeczy i funkcja; inny kolor/wariant/marka = OK, byle to ta sama rzecz nadająca się jako źródło)?\nBĄDŹ RYGORYSTYCZNY: jeśli kandydat to inna kategoria (np. ubranie/sweter zamiast wyciskarki, laktator zamiast wentylatora) — ODRZUĆ. Kieruj się NAZWĄ, nie tym co widać na kadrze (kadr bywa mylący).\nZwróć JSON {"matches":[indeksy pasujących, od najlepszego]} — PUSTA lista gdy żaden nie pasuje.` });
  try {
    const res = await openaiFetchRetry("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${OPENAI_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, reasoning_effort: "low", response_format: { type: "json_object" }, messages: [{ role: "user", content }] }),
    }, "img-verify");
    if (!res.ok) return [];
    const j = await res.json();
    if (acc && j?.usage) { acc.i += j.usage.prompt_tokens || 0; acc.c += j.usage.prompt_tokens_details?.cached_tokens || 0; acc.o += j.usage.completion_tokens || 0; }
    const o = JSON.parse(j.choices[0].message.content);
    const m = Array.isArray(o?.matches) ? o.matches : [];
    return m.filter((x: unknown) => typeof x === "number" && x >= 0 && x < cands.length);
  } catch {
    return [];
  }
}

// Weryfikacja AUTO-dopasowania TikTok Shop: czy produkt ze sklepu to ta sama rzecz,
// co aukcja, którą realnie sprzedajemy. Dopasowanie po tytule (match_existing) daje
// score=1 także dla „karmnik dla PSA" → „Cat Feeder" — tego tekst nie odróżni, oczy tak.
// deno-lint-ignore no-explicit-any
async function gptShopMatch(name: string, q: string, refImgs: string[], shopImg: string, shopTitle: string, acc?: { i: number; c: number; o: number }): Promise<any | null> {
  // deno-lint-ignore no-explicit-any
  const content: any[] = [
    { type: "text", text: `Sprawdzamy, czy produkt znaleziony w TikTok Shop to TEN SAM produkt, co nasza aukcja.\nNAZWA (PL): "${name}"${q ? `\nZAPYTANIE (EN): "${q}"` : ""}\n\nODNIESIENIE — zdjęcia aukcji, którą realnie sprzedajemy:` },
  ];
  refImgs.slice(0, 3).forEach((u) => content.push({ type: "image_url", image_url: { url: normImg(u) } }));
  content.push({ type: "text", text: `KANDYDAT z TikTok Shop — tytuł: "${(shopTitle || "").slice(0, 140)}"` });
  content.push({ type: "image_url", image_url: { url: shopImg } });
  content.push({
    type: "text",
    text: `Czy KANDYDAT to ten sam produkt co ODNIESIENIE (ten sam typ rzeczy i ta sama funkcja)?
Inny kolor, wariant, marka czy opakowanie = nadal TAK.
BĄDŹ RYGORYSTYCZNY — odpowiedz NIE, gdy:
- to inna kategoria rzeczy (akcesorium zamiast urządzenia, część zamiast kompletu),
- produkt jest dla innego odbiorcy niż mówi NAZWA (nazwa „dla psa", kandydat to sprzęt dla kota),
- kandydat to dodatek/etui/zestaw DO produktu, a nie sam produkt.
Gdy masz jakąkolwiek wątpliwość — odpowiedz NIEPEWNE. NIE zgaduj: lepiej NIEPEWNE niż błędne TAK.
Zwróć JSON: {"verdict":"TAK"|"NIE"|"NIEPEWNE","confidence":0..1,"reason":"jedno zdanie po polsku"}`,
  });
  try {
    const res = await openaiFetchRetry("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${OPENAI_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, reasoning_effort: "low", response_format: { type: "json_object" }, messages: [{ role: "user", content }] }),
    }, "img-verify-shop");
    if (!res.ok) return null;
    const j = await res.json();
    if (acc && j?.usage) { acc.i += j.usage.prompt_tokens || 0; acc.c += j.usage.prompt_tokens_details?.cached_tokens || 0; acc.o += j.usage.completion_tokens || 0; }
    const o = JSON.parse(j.choices[0].message.content);
    const v = String(o?.verdict || "").toUpperCase();
    if (!["TAK", "NIE", "NIEPEWNE"].includes(v)) return null;
    return { verdict: v, confidence: Math.max(0, Math.min(1, Number(o?.confidence) || 0)), reason: String(o?.reason || "").slice(0, 240) };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("method", { status: 405, headers: cors });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (!(await adminGate(req, supabase)))
    return new Response(JSON.stringify({ error: "wymagane_logowanie_admin" }), { status: 403, headers: { ...cors, "content-type": "application/json" } });

  const body = await req.json().catch(() => ({}));

  // ── VERIFY_SHOP_MATCH: obejrzyj AUTO-dopasowane sklepy i zatwierdź tylko pewniaki ──
  // Porównuje packshot z TikTok Shop ze zdjęciami aukcji (ali_snapshot) + nazwą PL.
  //   TAK + confidence ≥ minConf (domyślnie 0.9) → auto_match.is_auto = false (zatwierdzone)
  //   cokolwiek innego                          → zostaje is_auto = true + zapisany werdykt
  // `auto_match.by` NIE znika przy zatwierdzeniu — to trwały ślad pochodzenia, więc nawet
  // zatwierdzone da się później odnaleźć i wycofać. Patrz docs/zbuduje/AUTO-MATCH-SHOP.md
  if (body.op === "verify_shop_match") {
    const limit = Math.min(Math.max(Number(body.limit ?? 25), 1), 100);
    const minConf = Number(body.minConf ?? 0.9);
    const dryRun = !!body.dryRun;
    const force = !!body.force;
    // Filtr „już obejrzane" MUSI być w bazie, nie w pętli — inaczej rekordy z werdyktem
    // (te zostają z is_auto=true) blokują pierwsze miejsca zapytania i przebieg staje.
    let sel = supabase.from("bud_tt_products")
      .select("id,key,pl_name,query,tt_shop,ali_snapshot")
      .filter("tt_shop->auto_match->>by", "eq", "bud-shop-radar/match_existing");
    if (!force) sel = sel.filter("tt_shop->auto_match->>vision", "is", null);
    const { data: rows, error } = await sel.order("key").limit(limit);
    if (error) return new Response(JSON.stringify({ error: "db_read", detail: String(error.message).slice(0, 200) }), { status: 500, headers: { ...cors, "content-type": "application/json" } });

    const acc = { i: 0, c: 0, o: 0 };
    // deno-lint-ignore no-explicit-any
    const out: any[] = [];
    let potwierdzone = 0, doPrzegladu = 0;

    for (const r of (rows || [])) {
      // deno-lint-ignore no-explicit-any
      const ts: any = r.tt_shop || {};
      const shopImg = (ts.images_hosted || [])[0] || (ts.images || [])[0] || "";
      const refs = ((r.ali_snapshot || {}).images || []).filter(Boolean);
      if (!shopImg || !refs.length) { out.push({ key: r.key, skip: "brak_material" }); continue; }

      // DWA NIEZALEŻNE PRZEBIEGI. Pojedynczy potrafi dać przeciwne werdykty przy tym samym
      // materiale („budzik ze wschodem słońca": TAK 0.93, potem NIE 0.99). Zatwierdzamy
      // wyłącznie przy ZGODZIE obu — niezgoda sama w sobie znaczy „nie jest pewne".
      const v = await gptShopMatch(String(r.pl_name || r.key), String(r.query || ""), refs, shopImg, String(ts.title || ""), acc);
      if (!v) { out.push({ key: r.key, skip: "vision_blad" }); continue; }
      const v2 = await gptShopMatch(String(r.pl_name || r.key), String(r.query || ""), refs, shopImg, String(ts.title || ""), acc);
      if (!v2) { out.push({ key: r.key, skip: "vision_blad_2" }); continue; }

      const zgoda = v.verdict === v2.verdict;
      const pewne = zgoda && v.verdict === "TAK" && v.confidence >= minConf && v2.confidence >= minConf;
      v.przebieg2 = v2;
      v.zgodne = zgoda;
      if (!zgoda) v.reason = `NIEZGODNE PRZEBIEGI (${v.verdict} ${v.confidence} vs ${v2.verdict} ${v2.confidence}) — ${v.reason}`;
      if (dryRun) { out.push({ key: r.key, ...v, potwierdzi: pewne }); continue; }

      // is_auto ustawiamy JAWNIE w obie strony: przy ponownym sprawdzeniu rekord wcześniej
      // zatwierdzony musi móc stracić zatwierdzenie, a nie odziedziczyć je przez spread.
      const am = { ...(ts.auto_match || {}), vision: { ...v, at: new Date().toISOString(), min_conf: minConf } };
      am.is_auto = !pewne;
      if (pewne) { am.confirmed_by = "vision"; potwierdzone++; } else { delete am.confirmed_by; doPrzegladu++; }
      const { error: uErr } = await supabase.from("bud_tt_products")
        .update({ tt_shop: { ...ts, auto_match: am, source: pewne ? "vision_confirmed" : "auto_match" } })
        .eq("id", r.id);
      out.push(uErr ? { key: r.key, err: String(uErr.message).slice(0, 120) } : { key: r.key, ...v, potwierdzone: pewne });
    }

    if (acc.i || acc.o) {
      const cost = (acc.i - acc.c) / 1e6 * 1.25 + acc.c / 1e6 * 0.125 + acc.o / 1e6 * 10;
      await supabase.from("bud_usage").insert({ session_id: null, kind: "img-verify", model: MODEL, input_tokens: acc.i, cached_tokens: acc.c, output_tokens: acc.o, cost_usd: cost, meta: { from: "verify_shop_match", n: out.length } });
    }
    return new Response(JSON.stringify({ op: "verify_shop_match", sprawdzone: out.length, potwierdzone, doPrzegladu, minConf, dryRun, wyniki: out }), { headers: { ...cors, "content-type": "application/json" } });
  }

  // ── VERIFY_SHOP_TIEBREAK: trzeci, rozstrzygający głos dla rekordów w szarej strefie ──
  // Wejście: rekordy z is_auto=true, które mają już 2 przebiegi. Dokłada trzeci i decyduje
  // większością 3 głosów. Margines bezpieczeństwa: do zatwierdzenia ŻADEN głos nie może
  // brzmieć NIE — sama obecność sprzeciwu wystarcza, żeby zostawić to człowiekowi.
  //   ≥2× TAK, 0× NIE, średnia pewność TAK ≥ minConf → zatwierdzone
  //   ≥2× NIE                                        → nagrobek (jak rollback 23)
  //   reszta                                         → zostaje do rąk
  if (body.op === "verify_shop_tiebreak") {
    const limit = Math.min(Math.max(Number(body.limit ?? 10), 1), 60);
    const minConf = Number(body.minConf ?? 0.9);
    const dryRun = !!body.dryRun;
    const { data: rows, error } = await supabase.from("bud_tt_products")
      .select("id,key,pl_name,query,shop_url,tt_shop,ali_snapshot")
      .filter("tt_shop->auto_match->>is_auto", "eq", "true")
      .filter("tt_shop->auto_match->>vision", "not.is", null)
      // Ścieżka JSON w PostgREST: same strzałki, BEZ cudzysłowów wokół kluczy.
      // Wersja z 'vision' w apostrofach cicho nie filtrowała — pętla mieliła w kółko
      // te same 6 rekordów, a 22 nigdy nie dostały trzeciego głosu.
      .filter("tt_shop->auto_match->vision->>przebieg3", "is", null)
      .order("key").limit(limit);
    if (error) return new Response(JSON.stringify({ error: "db_read", detail: String(error.message).slice(0, 200) }), { status: 500, headers: { ...cors, "content-type": "application/json" } });

    const acc = { i: 0, c: 0, o: 0 };
    // deno-lint-ignore no-explicit-any
    const out: any[] = [];
    let potwierdzone = 0, odrzucone = 0, doRak = 0;

    for (const r of (rows || [])) {
      // deno-lint-ignore no-explicit-any
      const ts: any = r.tt_shop || {};
      const am = ts.auto_match || {};
      const vis = am.vision || {};
      const shopImg = (ts.images_hosted || [])[0] || (ts.images || [])[0] || "";
      const refs = ((r.ali_snapshot || {}).images || []).filter(Boolean);
      if (!shopImg || !refs.length) { out.push({ key: r.key, skip: "brak_material" }); continue; }

      const v3 = await gptShopMatch(String(r.pl_name || r.key), String(r.query || ""), refs, shopImg, String(ts.title || ""), acc);
      if (!v3) { out.push({ key: r.key, skip: "vision_blad" }); continue; }

      const glosy = [{ verdict: vis.verdict, confidence: vis.confidence }, vis.przebieg2 || {}, v3]
        .filter((g) => g && g.verdict);
      const tak = glosy.filter((g) => g.verdict === "TAK");
      const nie = glosy.filter((g) => g.verdict === "NIE");
      const srCon = tak.length ? tak.reduce((s, g) => s + (Number(g.confidence) || 0), 0) / tak.length : 0;

      const potwierdz = tak.length >= 2 && nie.length === 0 && srCon >= minConf;
      const odrzuc = nie.length >= 2;
      const wynik = potwierdz ? "ZATWIERDZONE" : odrzuc ? "ODRZUCONE" : "DO_RAK";
      if (dryRun) { out.push({ key: r.key, glosy: glosy.map((g) => `${g.verdict}/${g.confidence}`), srCon: Number(srCon.toFixed(2)), wynik }); continue; }

      // deno-lint-ignore no-explicit-any
      let patch: any;
      if (odrzuc) {
        patch = { tt_shop: { source: "auto_match_rejected", fetched_at: ts.fetched_at,
          auto_match: { ...am, is_auto: false, rejected: true, confirmed_by: undefined,
            vision: { ...vis, przebieg3: v3, glosy: glosy.length, tak: tak.length, nie: nie.length },
            odrzucony_produkt: { title: ts.title, seo_url: am.picked_seo_url, sold_count: ts.sold_count, price_real: ts.price_real } } } };
        if (am.set_shop_url) patch.shop_url = null;
        odrzucone++;
      } else {
        const am2 = { ...am, is_auto: !potwierdz,
          vision: { ...vis, przebieg3: v3, glosy: glosy.length, tak: tak.length, nie: nie.length, srednia_pewnosc: Number(srCon.toFixed(2)) } };
        if (potwierdz) { am2.confirmed_by = "vision3"; potwierdzone++; } else { delete am2.confirmed_by; doRak++; }
        patch = { tt_shop: { ...ts, auto_match: am2, source: potwierdz ? "vision_confirmed" : "auto_match" } };
      }
      const { error: uErr } = await supabase.from("bud_tt_products").update(patch).eq("id", r.id);
      out.push(uErr ? { key: r.key, err: String(uErr.message).slice(0, 120) } : { key: r.key, glosy: glosy.map((g) => `${g.verdict}/${g.confidence}`), srCon: Number(srCon.toFixed(2)), wynik });
    }

    if (acc.i || acc.o) {
      const cost = (acc.i - acc.c) / 1e6 * 1.25 + acc.c / 1e6 * 0.125 + acc.o / 1e6 * 10;
      await supabase.from("bud_usage").insert({ session_id: null, kind: "img-verify", model: MODEL, input_tokens: acc.i, cached_tokens: acc.c, output_tokens: acc.o, cost_usd: cost, meta: { from: "verify_shop_tiebreak", n: out.length } });
    }
    return new Response(JSON.stringify({ op: "verify_shop_tiebreak", sprawdzone: out.length, potwierdzone, odrzucone, doRak, minConf, dryRun, wyniki: out }), { headers: { ...cors, "content-type": "application/json" } });
  }

  const frame: string = body.frame_url || "";
  const name: string = body.name || "";
  const q: string = body.q || body.query || "";
  // deno-lint-ignore no-explicit-any
  const cands: any[] = Array.isArray(body.candidates) ? body.candidates.slice(0, 8) : [];
  if (!frame || !name || !cands.length)
    return new Response(JSON.stringify({ matches: [], kept: [] }), { headers: { ...cors, "content-type": "application/json" } });

  const vu = { i: 0, c: 0, o: 0 };
  const idx = await gptMatches(frame, name, q, cands, vu);
  // KOSZT vision (gpt-5.1) → bud_usage. session_id=null (koszt sourcingu/infrastruktury radaru).
  if (vu.i || vu.o) {
    try {
      const P51 = { i: 1.25, c: 0.125, o: 10 };
      const cost = (Math.max(0, vu.i - vu.c) * P51.i + vu.c * P51.c + vu.o * P51.o) / 1_000_000;
      await supabase.from("bud_usage").insert({ session_id: null, kind: "img-verify", model: MODEL, input_tokens: vu.i, cached_tokens: vu.c, output_tokens: vu.o, cost_usd: cost, meta: { from: "bud-img-verify", cands: cands.length } });
    } catch (e) { console.error("[bud-img-verify] usage", e); }
  }
  const kept = idx.map((i) => cands[i]);
  return new Response(JSON.stringify({ matches: idx, kept }), { headers: { ...cors, "content-type": "application/json" } });
});

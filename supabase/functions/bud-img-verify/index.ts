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
async function gptMatches(frame: string, name: string, q: string, cands: any[]): Promise<number[]> {
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
    const o = JSON.parse(j.choices[0].message.content);
    const m = Array.isArray(o?.matches) ? o.matches : [];
    return m.filter((x: unknown) => typeof x === "number" && x >= 0 && x < cands.length);
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("method", { status: 405, headers: cors });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (!(await adminGate(req, supabase)))
    return new Response(JSON.stringify({ error: "wymagane_logowanie_admin" }), { status: 403, headers: { ...cors, "content-type": "application/json" } });

  const body = await req.json().catch(() => ({}));
  const frame: string = body.frame_url || "";
  const name: string = body.name || "";
  const q: string = body.q || body.query || "";
  // deno-lint-ignore no-explicit-any
  const cands: any[] = Array.isArray(body.candidates) ? body.candidates.slice(0, 8) : [];
  if (!frame || !name || !cands.length)
    return new Response(JSON.stringify({ matches: [], kept: [] }), { headers: { ...cors, "content-type": "application/json" } });

  const idx = await gptMatches(frame, name, q, cands);
  const kept = idx.map((i) => cands[i]);
  return new Response(JSON.stringify({ matches: idx, kept }), { headers: { ...cors, "content-type": "application/json" } });
});

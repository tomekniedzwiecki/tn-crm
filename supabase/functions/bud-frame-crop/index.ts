// bud-frame-crop — wskazuje bounding box SAMEGO produktu na klatce z filmu TikTok, żeby przed
// reverse-image w AliExpress przyciąć kadr do przedmiotu (bez osoby/dłoni/tła). Bez tego aparat
// AliExpress łapie osobę/scenę i zwraca złe dopasowania. Zwraca box znormalizowany 0..1.
// Gate: adminGate (team_member JWT | x-tools-secret). Deploy: --no-verify-jwt.
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
  if (!frame) return new Response(JSON.stringify({ found: false }), { headers: { ...cors, "content-type": "application/json" } });

  // deno-lint-ignore no-explicit-any
  const content: any[] = [
    { type: "text", text: `To klatka z filmu TikTok promującego produkt: "${name}"${q ? ` (EN: ${q})` : ""}.\nPodaj CIASNY bounding box SAMEGO produktu (fizycznego przedmiotu na sprzedaż) — BEZ osoby, dłoni, twarzy i tła. Jeśli przedmiot jest w kilku miejscach, wybierz ujęcie, gdzie widać go najczyściej i najpełniej.\nWspółrzędne ZNORMALIZOWANE 0..1: x,y = lewy-górny róg, w,h = szerokość/wysokość względem rozmiaru obrazu.\nJSON: {"found":true/false,"x":..,"y":..,"w":..,"h":..}. found=false gdy produktu nie widać wyraźnie (sama osoba/tekst/scena).` },
    { type: "image_url", image_url: { url: frame } },
  ];
  try {
    const res = await openaiFetchRetry("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${OPENAI_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, reasoning_effort: "low", response_format: { type: "json_object" }, messages: [{ role: "user", content }] }),
    }, "frame-crop");
    if (!res.ok) return new Response(JSON.stringify({ found: false }), { headers: { ...cors, "content-type": "application/json" } });
    const j = await res.json();
    const o = JSON.parse(j.choices[0].message.content);
    const clamp = (v: number) => Math.max(0, Math.min(1, Number(v)));
    if (!o?.found || [o.x, o.y, o.w, o.h].some((v) => typeof v !== "number" || isNaN(v)))
      return new Response(JSON.stringify({ found: false }), { headers: { ...cors, "content-type": "application/json" } });
    const box = { x: clamp(o.x), y: clamp(o.y), w: clamp(o.w), h: clamp(o.h) };
    // odrzuć bezużyteczne (za małe / prawie całość)
    const ok = box.w >= 0.12 && box.h >= 0.12 && !(box.w >= 0.92 && box.h >= 0.92);
    return new Response(JSON.stringify({ found: ok, box }), { headers: { ...cors, "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ found: false }), { headers: { ...cors, "content-type": "application/json" } });
  }
});

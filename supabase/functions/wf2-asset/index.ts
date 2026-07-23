// wf2-asset — BRAMKA assetow landingow (webp/png/jpg/mp4/webm) chroniaca przed hotlinkiem
// i masowym kopiowaniem. Luka #1 (red team 22-23.07): assety siedza na PUBLICZNYM buckecie
// (…/object/public/attachments/bud-assets/<slug>/…), hotlink z obcej domeny → 200/206, sciezki
// enumerowalne, ~3.8 MB pobierane w sekundy. Origin-gate (wf2-landing-api) chronil tylko cene/kase.
//
// GET ?path=bud-assets/<slug>/<plik>
//   • Referer/Origin NASZ  → 302 na krotko zyjacy signed-URL (prywatny bucket)  [tryb signed]
//   • Referer/Origin BRAK  → 302 (FAIL-OPEN: gate'y fabryki, crawler Google/Meta, curl, preview)
//   • Referer/Origin OBCY  → 403 forbidden_origin + console.warn (telemetria jak origin-gate)
//
// ⛔ NIE STREAMUJE BAJTOW przez edge (1.25 MB mp4 przez isolate = zabity LCP + koszt). Zwraca
//    WYLACZNIE 302 — bajty leca z CDN Storage jak dzis. Narzut = jeden warm hop (~0.2 s), dlatego
//    hero (LCP) zostaje EXEMPT (patrz asset-gate.py --hero-exempt), a bramkujemy media below-fold.
//
// Spojnosc z origin-gate wf2-landing-api (l. 75-91): ta sama semantyka sameOrSub, ten sam
// FAIL-OPEN na brak naglowka, BEZ *.vercel.app (swiadomie usuniete 23.07).
//
// ⚠️ DEPLOY: --no-verify-jwt (wola go przegladarka klienta koncowego).
// ⚙️ ENV:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   — standard (signed-URL wymaga service-role)
//   WF2_ASSET_BUCKET            (dom. "attachments")   — bucket ze snapshotem assetow
//   WF2_ASSET_MODE             ("signed" | "public")   — signed = prywatny bucket + 302 signed-url;
//                                                        public = 302 na public url (PRZEJSCIOWO,
//                                                        zanim bucket bedzie prywatny — gate referer
//                                                        dziala, ale kopista moze pukac wprost w public)
//   WF2_ASSET_SIGNED_TTL       (dom. 300 s)            — TTL signed-URL
//   WF2_ASSET_ALLOWED_DOMAINS  ("ulepszek.pl,zaradek.pl,…") — domeny klientow (custom domains landingow)

import { createClient } from "jsr:@supabase/supabase-js@2";

// ── KONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const BUCKET = Deno.env.get("WF2_ASSET_BUCKET") ?? "attachments";
const MODE = (Deno.env.get("WF2_ASSET_MODE") ?? "signed").toLowerCase();
const SIGNED_TTL = Math.max(60, Number(Deno.env.get("WF2_ASSET_SIGNED_TTL") ?? "300") || 300);
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

// Allowlista domen — SPOJNA z origin-gate: infra na stale + custom-domeny klientow z env.
// NIE ma tu DB-lookupu per-slug (koszt/latencja na kazdym asetcie); nowa domena klienta = dopisz
// do WF2_ASSET_ALLOWED_DOMAINS. Landingi stoja na *.trevio.shop / custom-domenach (mapowane).
const STATIC_ALLOW_DOMAINS = ["trevio.pl", "trevio.shop", "tomekniedzwiecki.pl"];
const ENV_ALLOW_DOMAINS = (Deno.env.get("WF2_ASSET_ALLOWED_DOMAINS") ?? "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const ALLOW_DOMAINS = [...STATIC_ALLOW_DOMAINS, ...ENV_ALLOW_DOMAINS];
const ALLOW_HOSTS = new Set(["localhost", "127.0.0.1"]);
// ⛔ BEZ "*.vercel.app" — darmowy wildcard-hosting dawal kopiscie zywe assety (jak w wf2-landing-api).

// ── WALIDACJA SCIEZKI ─────────────────────────────────────────────────────────
const ALLOWED_EXT = /\.(webp|png|jpe?g|mp4|webm)$/i;
// prefiks bud-assets/<slug>/…; tylko bezpieczne znaki; podkatalogi (assets/ugc/…, tt/, video/) OK
const PATH_RE = /^bud-assets\/[A-Za-z0-9._-]+\/[A-Za-z0-9._\-/]+$/;

// ── LOGIKA REFERERA (eksport dla testu jednostkowego) ─────────────────────────
export function sameOrSub(host: string, dom: string): boolean {
  return !!dom && (host === dom || host.endsWith("." + dom));
}

/**
 * Decyzja bramki na podstawie naglowka Origin/Referer.
 *   brak/nieparsowalny → { allowed:true }  (FAIL-OPEN: gate'y, crawlery, curl, preview)
 *   host z allowlisty   → { allowed:true }
 *   host obcy           → { allowed:false }
 */
export function refererDecision(
  srcHdr: string,
  allowDomains: string[] = ALLOW_DOMAINS,
  allowHosts: Set<string> = ALLOW_HOSTS,
): { allowed: boolean; host: string; reason: string } {
  let host = "";
  try { host = srcHdr ? new URL(srcHdr).hostname.toLowerCase() : ""; } catch { host = ""; }
  if (!host) return { allowed: true, host: "", reason: "no-referer(fail-open)" };
  if (allowHosts.has(host)) return { allowed: true, host, reason: "allow-host" };
  if (allowDomains.some((d) => sameOrSub(host, d))) return { allowed: true, host, reason: "allow-domain" };
  return { allowed: false, host, reason: "foreign" };
}

// ── ODPOWIEDZI ────────────────────────────────────────────────────────────────
const BASE_HDRS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "content-type,range",
};
// 302 mint sie zmienia (signed-URL wygasa) → krotki cache + Vary na pochodzenie
const REDIR_HDRS: Record<string, string> = { "Cache-Control": "private, max-age=60", "Vary": "Origin, Referer" };

const errResp = (status: number, msg: string) =>
  new Response(msg, { status, headers: { ...BASE_HDRS, "Content-Type": "text/plain; charset=utf-8" } });
const redirect = (location: string) =>
  new Response(null, { status: 302, headers: { ...BASE_HDRS, ...REDIR_HDRS, "Location": location } });

// ── HANDLER ─────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: BASE_HDRS });
  if (req.method !== "GET" && req.method !== "HEAD") return errResp(405, "GET only");

  const raw = new URL(req.url).searchParams.get("path") || "";
  // Toleruj cache-bust doklejony konkatenacja JS (…mp4?v=1) oraz #frag: oddziel query passthrough.
  const clean = raw.split(/[?#]/, 1)[0];
  let path: string;
  try { path = decodeURIComponent(clean); } catch { return errResp(400, "bad path encoding"); }
  const passQuery = raw.length > clean.length ? raw.slice(clean.length + 1) : "";

  // WALIDACJA (po dekodowaniu): prefiks, brak traversal, whitelist rozszerzen
  if (!path.startsWith("bud-assets/")) return errResp(400, "path must start with bud-assets/");
  if (path.includes("..") || path.includes("\\") || path.includes("\0")) return errResp(400, "bad path");
  if (!PATH_RE.test(path)) return errResp(400, "bad path shape");
  if (!ALLOWED_EXT.test(path)) return errResp(415, "extension not allowed");

  // REFERER-GATE
  const srcHdr = req.headers.get("origin") || req.headers.get("referer") || "";
  const { allowed, host } = refererDecision(srcHdr);
  if (!allowed) {
    // TELEMETRIA: obcy host pukajacy w assety SAM sie ujawnia w logach edge (zywa kopia landinga).
    console.warn(`[wf2-asset] forbidden_origin host=${host} path=${path}`);
    return errResp(403, "forbidden_origin");
  }

  // TRYB public (przejsciowy): 302 na public URL (gate referer dziala; brak podpisu)
  if (MODE === "public") {
    return redirect(PUBLIC_BASE + path + (passQuery ? "?" + passQuery : ""));
  }

  // TRYB signed (docelowy): prywatny bucket → krotki signed-URL. NIE streamujemy bajtow.
  try {
    const supabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
    if (error || !data?.signedUrl) throw error ?? new Error("no signedUrl");
    return redirect(data.signedUrl);
  } catch (e) {
    // FAIL-OPEN na blad podpisu (blip Storage API) — nie wywalaj landinga LCP-krytycznie.
    // 302 na public URL: dziala gdy istnieje publiczna kopia (np. hero-exempt). Gdy bucket
    // w PELNI prywatny → CDN odda 400/404 (asset chwilowo niedostepny), ale gate nie kaskaduje 500.
    console.error(`[wf2-asset] sign_error path=${path} err=${(e as Error)?.message || e}`);
    return redirect(PUBLIC_BASE + path + (passQuery ? "?" + passQuery : ""));
  }
});

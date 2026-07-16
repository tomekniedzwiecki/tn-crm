// shop-images — trwałe packshoty produktów TikTok Shop.
// PROBLEM: bud_tt_products.tt_shop.images to PODPISANE URL-e CDN TikToka (jak covery wideo,
// patrz bud-tt-rehost) — wygasają po godzinach/dobie. A te zdjęcia stają się GŁÓWNYM materiałem
// do reverse-image matchu na AliExpress i do UI → muszą być trwałe.
// FIX: pobierz BAJTY (przy ważnym jeszcze podpisie) → wgraj do PUBLICZNEGO bucketa `attachments`
// pod bud-shop-imgs/<slug(key)>/<n>.jpg (upsert) → zwróć listę PUBLICZNYCH URL-i storage.
// Wzorzec uploadu = bud-tt-rehost (contentType z odpowiedzi lub image/jpeg, upsert:true).
// Błędy per-obraz łykane — zwraca to, co się udało (może być krótsza/pusta lista).

// deno-lint-ignore no-explicit-any
type SupabaseClient = any;

const BUCKET = "attachments";
const MAX_BYTES = 4 * 1024 * 1024; // pomijamy obrazy > 4 MB

// slug ścieżki storage z klucza produktu (nazwa PL znormalizowana): ASCII-safe, bez diakrytyków.
function slug(key: string): string {
  const map: Record<string, string> = { ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" };
  const s = (key || "x").toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return s || "x";
}

// Pobierz jeden obraz i wgraj do storage. Zwraca publiczny URL storage lub null (błąd łykany).
async function rehostOne(supabase: SupabaseClient, path: string, url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) { try { await r.body?.cancel(); } catch { /* */ } return null; }
    const ct = r.headers.get("content-type") || "image/jpeg";
    if (!ct.startsWith("image/")) { try { await r.body?.cancel(); } catch { /* */ } return null; }
    const bytes = new Uint8Array(await r.arrayBuffer());
    if (bytes.length < 500 || bytes.length > MAX_BYTES) return null;
    const up = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: ct, upsert: true });
    if (up.error) return null;
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return pub?.publicUrl || null;
  } catch {
    return null;
  }
}

// Rehostuj do `max` packshotów pod bud-shop-imgs/<slug(key)>/<n>.jpg.
// Zwraca listę PUBLICZNYCH URL-i storage (tylko te, które się udały; kolejność zachowana).
export async function rehostShopImages(
  supabase: SupabaseClient,
  key: string,
  urls: string[],
  max = 3,
): Promise<string[]> {
  const src = (Array.isArray(urls) ? urls : [])
    .map((u) => String(u || "").trim())
    .filter((u) => /^https?:\/\//i.test(u))
    .slice(0, max);
  if (!src.length) return [];
  const dir = "bud-shop-imgs/" + slug(key);
  const out: string[] = [];
  for (let i = 0; i < src.length; i++) {
    const hosted = await rehostOne(supabase, `${dir}/${i}.jpg`, src[i]);
    if (hosted) out.push(hosted);
  }
  return out;
}

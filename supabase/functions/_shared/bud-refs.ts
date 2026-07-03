// Wspólny builder referencji PRODUKTU dla generate-image (bud-mockup, bud-ads).
//
// ⚠️ KRYTYCZNE: zwracamy { type: 'product' } — NIE używać legacy `reference_image_url`,
// który w generate-image jest twardo traktowany jako { type: 'logo' } (model dostaje wtedy
// instrukcję „skopiuj to LOGO na produkt" i generuje ZŁY/inny obiekt). To była przyczyna
// „generuje się inny produkt". Z `reference_images:[{type:'product'}]` model dostaje
// „użyj DOKŁADNIE tego produktu jako obiektu w scenie".
//
// Galeria AliExpress (`ali_snapshot.images`, tablica URL-i) daje kilka kadrów → lepsza wierność
// (kształt/kolor/3D). Kolejność: czyste kadry produktu (ae-pic / Ali CDN) NAJPIERW, a rehostowane
// okładki TikToka (`bud-covers/…`) na koniec — bywają inną sceną/twarzą i mylą model.

// deno-lint-ignore no-explicit-any
export function productRefs(
  snap: Record<string, unknown> | null,
  // deno-lint-ignore no-explicit-any
  product: any,
  max = 4,
  curatedImage?: string | null,
): { url: string; type: 'product' }[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (u: unknown) => {
    const s = String(u || '').trim();
    if (!s || s.startsWith('data:') || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };

  const imgs = (snap && Array.isArray((snap as any).images)) ? ((snap as any).images as unknown[]) : [];
  const clean: string[] = [];
  const covers: string[] = [];
  for (const it of imgs) {
    const s = String(it || '').trim();
    if (!s) continue;
    if (/bud-covers\//i.test(s)) covers.push(s); else clean.push(s);
  }
  push(curatedImage);                        // KUROWANE przez admina w /trendy — pewna prawda o produkcie,
                                             // ratuje makiety gdy snapshot ma galerię INNEGO towaru (source='search')
  // source='search' = galeria z wyszukiwarki po nazwie (detail padł) — bywa INNYM produktem.
  // Wtedy PEWNIEJSZE są: kandydat dopasowany PO OBRAZIE (product.image) i okładka wideo
  // (product.cover — realny produkt z TikToka); podejrzana galeria idzie na SAM KONIEC.
  const searchSnap = !!snap && String((snap as any).source || '') === 'search';
  if (searchSnap) { push(product?.image); push(product?.cover); }
  clean.forEach(push);                       // czyste kadry produktu z galerii — najsilniejszy sygnał (gdy detail)
  if (snap) push((snap as any).main_image);  // zwykle == images[0] (dedup), ale czasem uzupełnia
  covers.forEach(push);                      // okładki TikToka dopiero gdy brakuje czystych kadrów
  push(product?.image);                      // ostateczny fallback z karty produktu
  push(product?.cover);

  return out.slice(0, Math.max(1, max)).map((url) => ({ url, type: 'product' as const }));
}

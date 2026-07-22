
# SEKCJA 10-final (domknięcie + CTA)
Prefiks `.fn-`. Układ CENTRALNY: .h2 (wyśrodkowane): "Dociskaj tam, gdzie sięgasz. Oprzyj się
tam, gdzie trudniej." Pod spodem packshot = https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/packshot-34.webp (max 560px,
wyśrodkowany) + callout "6 kulowych głowic" (⛔ BEZ „360°" — to fake-spec). Rząd 2 mini-kadrów
(muted, radius-lg, ~260px): https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/df-A.webp (docisk oburącz) i
https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/wi-biurko.webp (użycie przy lędźwiach). Cena <span data-price>189,00 zł</span>
(--font-display 700 ~40px), CTA <a class="btn cta" data-checkout href="#zamow">Zamawiam
Ugniatka</a>, micro: "Płatność online lub przy odbiorze · 14 dni na zwrot".
Mobile: stack nagłówek→packshot→mini-kadry (2 obok siebie)→cena→CTA full-width→micro.

ID sekcji: <section id="final">.

## KONTRAKT/ZAKAZY (wspólne serii)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper/--paper-2/--paper-3/--card/--ink/
  --body/--line/--cta/--cta-hover/--cta-ink/--radius-lg/--radius-sm/--shadow-*/--s1..--s7/
  --content-w/--h2-d/--body-fs) i klasy globalne .wrap .sect-pad .eyebrow .h2 .lead .display
  .btn.cta .pill .callout .reveal. UŻYWAJ ich; style sekcyjne w scoped <style> z prefiksem klas.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() chłodnych cieni serii).
  Akcent petrol TYLKO CTA/aktywne stany. Ikony: inline SVG stroke 1.5px currentColor (--ink).
- Zero gwiazdek/liczb opinii, zero przekreśleń cen, zero „24h", zero ciemnych teł sekcji.
- Obrazy: <img> z width/height, loading="lazy", alt PL opisowy, radius var(--radius-lg).
- Dodawaj .reveal do głównych bloków.
- NAJPIERW wypisz siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style>.

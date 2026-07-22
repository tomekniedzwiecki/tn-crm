
# SEKCJA 07-mid-cta (konwersyjna, na tle --paper-2)
Prefiks `.mc-`. Sekcja na pasie --paper-2. SZEROKA karta near-white (radius-lg, shadow-lg):
LEWA połowa: sekwencja TRZECH kwadratowych mini-kadrów (radius-sm, ~150px): https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/jr-A.webp
(caption "w oleju") → https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/jr-B.webp ("wyjmij") → https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/sc-zawieszony.webp
("zawieś"); MIĘDZY kadrami dwa małe .arc. PRAWA kolumna: .display 700 (~26px): "Smaż. Wyjmij.
Zawieś.", cena <span data-price>29,90 zł</span> (var(--price-fs)), CTA <a class="btn cta"
data-checkout href="#zamow">Zamawiam Odsączek</a>, micro 13.5px: "Płatność online lub przy
odbiorze · 14 dni na zwrot".
Mobile: stack mini-kadry (3 w rzędzie, mniejsze) → display → cena → CTA full → micro.

ID sekcji: <section id="mid-cta">.

## KONTRAKT/ZAKAZY (wspólne serii)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper/--paper-2/--paper-3/--card/--ink/
  --body/--line/--cta/--cta-hover/--cta-ink/--radius-lg/--radius-sm/--shadow-*/--s1..--s7/
  --content-w/--h2-d/--h2-m/--price-fs/--body-fs) i klasy globalne .wrap .sect-pad .eyebrow .h2
  .lead .display .btn.cta .pill .arc .reveal. UŻYWAJ ich; style sekcyjne w scoped <style> z prefiksem.
- SKALA TYPOGRAFII ŻYWEJ (twarda): H2 = var(--h2-d) desktop / var(--h2-m) mobile (26-30px!),
  ceny var(--price-fs) 28-36px, body 17px. ⛔ ZERO clampów sekcyjnych powyżej tej skali.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() ciepłych cieni serii).
  Akcent zieleń TYLKO CTA/aktywne stany/strzałki .arc. Ikony: inline SVG stroke 1.5px --ink.
- SYGNATURA: strzałka .arc = inline <svg class="arc" viewBox="0 0 120 60"> z ćwiartkowym łukiem
  + małym grotem, stroke var(--cta) 2px, fill none; pozycjonowanie w klasie SEKCYJNEJ
  (np. .jr-arc), NIE w .arc. Używaj tam, gdzie brief każe.
- Zero gwiazdek/liczb opinii, zero przekreśleń cen, zero „24h", zero ciemnych teł,
  ⛔ zero WYMIARÓW (cm/l), zero „zmywarki", zero gwarancji, zero claimów zdrowotnych
  („mniej tłuszczu" ZAKAZ; wolno OPISOWO „olej ocieka z powrotem do garnka").
- Obrazy: <img> z width/height (i CSS height:auto), loading="lazy" (poza hero), alt PL opisowy,
  radius var(--radius-lg). Dodawaj .reveal do głównych bloków.
- ⛔ NIE centruj transformem (kolizja z .reveal.in{transform:none}) — left/right/margin-inline.
- NAJPIERW wypisz siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style> (+ scoped
<script> IIFE tylko jeśli brief każe).

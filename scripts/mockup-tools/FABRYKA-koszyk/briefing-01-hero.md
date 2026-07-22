
# SEKCJA 01-hero (archetyp H — stos zoning'owy: kadr → hook → karta oferty)
Prefiks `.hr-`. UWAGA: topbar z lockupem już istnieje w szkielecie — NIE dubluj logo w hero.
STREFA 1 (kadr): pełnoszerokie foto https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/sc-hero.webp (dłoń wynurza kosz frytek z woka;
eager loading, fetchpriority="high", width/height 1536x1024) w kontenerze .hr-media: desktop
wysokość ~56vh (object-fit cover, object-position center 30%), mobile ~42svh. Na kadrze JEDEN
.arc (łuk trajektorii w górę przy koszu, pozycja absolutna w .hr-media, desktop i mobile).
STREFA 2 (hook, na --paper): H1 .display (użyj --h1-d/--h1-m z :root): "Wyjmij całą porcję
jednym ruchem" + jedna linia .lead: "Składany koszyk ze stali nierdzewnej do smażenia w garnku
lub woku — koniec łowienia frytek sztuka po sztuce." (mobile: skróć do "Składany koszyk ze
stali — koniec łowienia frytek").
STREFA 3 (karta oferty, near-white --card, radius-lg, shadow-md, WYRAŹNA granica strefy,
na mobile lekko nachodzi na strefę 2 ujemnym marginesem jak makieta): rząd [miniatura =
https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/packshot-rozlozony.webp 120px radius-sm | kolumna: cena <span data-price>29,90 zł</span>
(--font-display 700, var(--price-fs)) + CTA <a class="btn cta" data-checkout href="#zamow">Zamawiam
Odsączek</a> + micro 13.5px "Płatność online lub przy odbiorze · 14 dni na zwrot"].
Obok/pod: 2 pille "Stal nierdzewna" (ikona tarczy) i "Składa się na płasko" (ikona dysku).
Mobile: karta full-width, CTA full-width; wszystkie 3 strefy W PIERWSZYM ekranie (fold!).

ID sekcji: <section id="hero">.

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


# SEKCJA 09-zamow (checkout inline — MODUŁ w montażu; wzorzec osadzenia Z KARTĄ PRODUKTU)
Prefiks `.zm-`. UWAGA KRYTYCZNA: sekcja <section id="zamow"> JUŻ ISTNIEJE w szkielecie
z atrybutami data-zc-* — Ty budujesz TYLKO wnętrze (bez zmiany atrybutów sekcji).
Nagłówek .h2 "Zamów Skrolika" (centrowany, margin-bottom --s4).
Grid .zm-grid: desktop `grid-template-columns: minmax(340px,.75fr) minmax(0,1.25fr)`,
gap --s4, align-items start:
LEWA karta produktu .zm-product-card (near-white --card, radius-lg, shadow-sm, position
sticky top var(--s3)): .zm-product-media z <img https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep2-packshot-pink.webp
width/height 600x600> (contain, tło --card, radius-sm), potem .zm-product-info: nazwa
.display 20px "Skrolik — pierścień do przewijania", jedna linia 14px --body "Kolor: różowy ·
Bluetooth · zdalna migawka", cena <span data-price>34,90 zł</span> (--font-display 700 24px
--cta). ⛔ NIE buduj podsumowania zamówienia (zc-summary modułu zostanie tu PRZENIESIONE
w montażu — zostaw kartę otwartą na dole).
PRAWA kolumna .zm-checkout-card: TYLKO komentarz <!--CHECKOUT-INLINE--> (moduł formularza
steps wchodzi w montażu; NIE stylizuj .zc-*).
Mobile: karta produktu KOMPAKT (media 96px w wierszu z nazwą i ceną), grid 1 kolumna,
karta NAD formularzem, sticky OFF (position static).

## KONTRAKT/ZAKAZY (wspólne serii SKROLIK)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper/--paper-2/--paper-3/--card/--ink/
  --body/--line/--cta/--cta-hover/--cta-ink/--radius-lg/--radius-sm/--shadow-*/--s1..--s7/
  --content-w/--h1-d/--h1-m/--h2-d/--h2-m/--price-fs/--body-fs) i klasy globalne .wrap
  .sect-pad .eyebrow .h2 .lead .display .btn.cta .pill .sig .reveal. UŻYWAJ ich; style
  sekcyjne w scoped <style> z prefiksem sekcji.
- SKALA TYPOGRAFII ŻYWEJ (twarda): H1 var(--h1-d)/var(--h1-m), H2 = var(--h2-d)/var(--h2-m),
  cena var(--price-fs), body 17px. ⛔ ZERO clampów sekcyjnych powyżej tej skali.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() cieni serii). Akcent MALINA
  TYLKO CTA/aktywne stany/łuki .sig/eyebrow. Ikony: inline SVG stroke 1.5px --ink.
- SYGNATURA: pierścienie sygnału .sig = inline <svg class="sig" viewBox="0 0 64 64"> z 2-3
  koncentrycznymi NIEPEŁNYMI łukami (path arc o rosnących promieniach), stroke var(--cta)
  1.5px, fill none, opacity .55; pozycjonowanie w klasie SEKCYJNEJ (np. .hr-sig), NIE w .sig.
  ⛔ Bez strzałek z grotem, bez calloutów, bez wielkich liczb.
- Zakazy treściowe (KARTA PRAWDY): ⛔ zero gwiazdek/liczb opinii/liczb sprzedaży, zero
  przekreśleń cen i zegarów, zero „24h"/„z Polski", zero ciemnych teł, ⛔ zero wyliczania
  systemów (iOS/Android/iPhone — wolno tylko „z telefonem i tabletem"), ⛔ zero „muzyki"
  i „podstawki", ⛔ zero mAh/zasięgu/czasu pracy/czasu ładowania, ⛔ scroll TYLKO pionowy
  (nigdy nie obiecuj przewijania w bok), zero claimów zdrowotnych, zero „premium".
- CENA: wyłącznie <span data-price>34,90 zł</span> (fallback zapieczony; runtime hydratuje).
- KAŻDE CTA: <a class="btn cta" data-checkout href="#zamow">Zamawiam Skrolika</a>.
- Obrazy: <img> z width/height (i CSS height:auto), loading="lazy" (poza hero), alt PL
  opisowy, radius var(--radius-lg). Dodawaj .reveal do głównych bloków.
- ⛔ NIE centruj transformem (kolizja z .reveal.in{transform:none}) — margin-inline:auto.
- NAJPIERW wypisz siatkę sekcji (wiersze/kolumny/wyrównania), POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style>
(+ scoped <script> IIFE tylko jeśli brief każe).

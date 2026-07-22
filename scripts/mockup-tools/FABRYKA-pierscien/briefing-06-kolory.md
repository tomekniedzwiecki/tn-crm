
# SEKCJA 06-kolory (dowód formy — REALNE kadry z aukcji; galeria z lightboxem wejdzie w montażu)
Prefiks `.ko-`. .h2 centrowany: "Mniejszy niż kciuk. I w trzech kolorach."
Grid kafli (desktop: 1 szeroki + 3 mniejsze + karta spec; jak na makiecie):
- kafel SZEROKI (span 2, aspect 1/1 max-height 420px): <img https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep1-trojpak.webp
  width/height 800x800> alt "Trzy kolory pierścienia: czarny, kremowy i różowy";
- kafel: keep2-packshot-pink.webp (600x600) alt "Różowy Skrolik — trzy przyciski";
- kafel: keep3-detal-port.webp (700x700) alt "Wpuszczone gniazdo ładowania w pierścieniu";
- kafel: keep4-detal-klips.webp (430x430) alt "Otwarty klips na palcu — kciuk na przyciskach";
- karta SPEC (near-white --card): prosty rysunek wymiarowy INLINE SVG (obrys klinowatego
  pierścienia liniami 1.5px --ink + strzałki wymiarowe --line) + tekst .display 20px:
  "3,0 × 2,8 × 1,3 cm" + linia body: "Zakładasz i nie przeszkadza".
Wszystkie kafle: radius-lg, tło --card, obrazy object-fit contain z paddingiem --s2 (kadry
mają własne białe tła — NIE cover!), loading lazy. Kontener kafli dostaje marker
<!--GALERIA--> jako komentarz PRZED gridem (lightbox wejdzie w montażu).
POD gridem centrowana linia .display 18px: "W tej ofercie: <b style="color:var(--cta)">kolor
różowy</b>" + małe kółko SVG (14px, fill var(--cta), opacity .45) jako swatch.
Mobile: kafel szeroki → rząd 2 małych → kafel klips → karta spec → linia oferty.

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

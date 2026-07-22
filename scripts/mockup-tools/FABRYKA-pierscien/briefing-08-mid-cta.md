
# SEKCJA 08-mid-cta (konwersyjna, na pasie --paper-2)
Prefiks `.mc-`. JEDNA centrowana karta near-white (--card, radius-lg, shadow-md, max-width
880px, margin-inline auto), wewnątrz desktop 2 kolumny (foto 40% | treść):
LEWA: packshot <img https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep2-packshot-pink.webp width/height 600x600,
max-width 300px> z .sig za produktem (klasa .mc-sig).
PRAWA: nazwa .display 24px "Skrolik", linia body: "Mały pierścień-pilot do telefonu —
w tej ofercie kolor różowy", cena <span data-price>34,90 zł</span> (var(--price-fs),
--font-display 700, --ink), CTA <a class="btn cta" data-checkout href="#zamow">Zamawiam
Skrolika</a> (full-width w kolumnie), micro 13.5px: "Płatność online lub przy odbiorze ·
14 dni na zwrot". NIC WIĘCEJ — jedna karta, jeden argument.
Mobile: stack w karcie: packshot (max-width 220px) → nazwa → linia → cena → CTA full → micro.

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

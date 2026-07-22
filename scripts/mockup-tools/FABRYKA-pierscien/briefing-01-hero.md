
# SEKCJA 01-hero (archetyp B — split 55/45: copy | scena)
Prefiks `.hr-`. UWAGA: topbar z lockupem już istnieje w szkielecie — NIE dubluj logo w hero.
Desktop grid 55/45 (align-items center, gap --s5), min-height ~78vh:
LEWA (na --paper): H1 .display (--h1-d): "Telefon stoi. Ty przewijasz kciukiem." (kropki jak
na makiecie), potem .lead: "Skrolik to mały pierścień-pilot Bluetooth: pionowe przewijanie,
kartkowanie ebooków i zdalna migawka — zakładasz na palec i klikasz kciukiem", potem CTA
<a class="btn cta" data-checkout href="#zamow">Zamawiam Skrolika</a> (duży, min-height 54px),
pod nim micro 13.5px --body: "Płatność online lub przy odbiorze · 14 dni na zwrot".
PRAWA: foto-karta .hr-media (radius-lg, shadow-md, overflow hidden, aspect-ratio 2/3,
max-height ~78vh): <img src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/sceny/sc-hero.webp" (eager, fetchpriority="high",
width/height 1100x1650, object-fit cover). W .hr-media zakotwiczony JEDEN .sig (pozycja
absolutna ~48%/38% nad pierścieniem — jak na makiecie łuki od pierścienia; klasa .hr-sig).
UWAGA: .hr-media to przyszły nośnik HERO-VIDEO — zostaw strukturę figure>img czystą.
Mobile (jak makieta mobile): stack: H1 → lead (2 linie) → foto-karta (aspect 4/5,
max-height ~46svh) → CTA full-width → micro. Wszystko w pierwszym ekranie + początek foto.

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

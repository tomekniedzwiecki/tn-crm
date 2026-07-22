
# SEKCJA 02-demo (TOR-I: symulacja "klik ▼ → feed zjeżdża")
Prefiks `.dm-`. .h2 centrowany: "Naciśnij i patrz, jak ekran sam przewija" (bez eyebrow).
Desktop dwie kolumny (gap --s6, align center):
LEWA: wektorowy telefon .dm-phone ZBUDOWANY W CSS (nie obraz): zaokrąglona ramka 2px --ink
radius 36px, tło --card, wewnątrz .dm-screen (overflow hidden, aspect ~9/16, max-width 300px)
z kolumną .dm-feed z CZTERECH kart-bloków (tło --paper-2, radius-sm, wys ~140px, wewnątrz
szary blok "zdjęcia" + 2 linie placeholdera --line) — feed przesuwany transformem.
PRAWA: duży cutout produktu <img src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/skrolik/galeria/keep2-packshot-pink.webp"
width/height 600x600, max-width 320px> z .sig za nim (klasa .dm-sig), pod spodem okrągły
przycisk .dm-btn (56px, bg --cta, biały trójkąt ▼ SVG, shadow-md, cursor pointer,
focus-visible, aria-label "Przewiń symulowany ekran w dół") + caption 14px:
"Kliknij ▼ — treść zjeżdża w dół". Pod spodem mała nota .pill z ikoną pionowych strzałek:
"Przewijanie działa w pionie".
INTERAKCJA (scoped <script> IIFE): klik/Enter na .dm-btn → feed przesuwa się o JEDNĄ kartę
w górę (translateY, transition .45s var(--mo-ease)); po ostatniej karcie wraca płynnie na
start. Przycisk lekko "wciska się" (scale .94) na active. Bez autoplay.
Mobile: stack: h2 → cutout+przycisk+caption → telefon (max-width 260px) → nota.

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

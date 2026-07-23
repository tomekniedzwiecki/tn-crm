
# SEKCJA 10-final (domknięcie; scena wieczorna LEWA)
Prefiks `.fn-`. DESKTOP: grid 55/45. LEWA foto-karta (--card padding 12px radius-lg shadow-md):
<img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-final.webp (1536x1024, lazy, alt "Rozmrozik na blacie wieczorem, obok
patelnia i ręka odkładająca szczypce", aspect-ratio 3/2, cover, radius-sm).
PRAWA kolumna: eyebrow "NA KOLEJNE 16:30" + thaw; H2: "Każdemu zdarza się zapomnieć. Dobrze
mieć <span class="swash">plan</span>."; sub .lead: "Rozmrozik to osobny box do rozmrażania
z komorą 4,2 L, startem jednym dotknięciem i tacką zbierającą wodę."; cena <span
class="display" data-price>289,00 zł</span> (var(--price-fs) 700); CTA <a class="btn cta"
data-checkout href="#zamow">Wracam do zamówienia</a>; DWA chipy [ikona|tekst] (--card border
--line radius-sm): "Płatność przy odbiorze lub BLIK/online" (ikona paczki) / "14 dni na zwrot"
(ikona strzałki kołowej). Na samym dole zamykający caps wiersz 13px letter-spacing .12em
--body: "4,2 L · 4 STEKI" + thaw (hairline pod spodem pełnej szerokości kolumny).
MOBILE: stack — foto na górze (~40vh cover) → eyebrow+thaw → H2 → sub → cena → CTA full →
chipy (2 w rzędzie) → caps + thaw.

ID sekcji: <section id="final">.

## KONTRAKT/ZAKAZY (wspólne serii)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper/--paper-2/--card/--ink/--body/
  --line/--cta/--cta-hover/--cta-ink/--cold/--radius-lg/--radius-sm/--shadow-sm/-md/-lg/
  --s1..--s7/--content-w/--h1-d/--h1-m/--h2-d/--h2-m/--price-fs/--body-fs) i klasy globalne
  .wrap .sect-pad .eyebrow .thaw .h2 .lead .display .btn.cta .pill .band .reveal .swash.
  UŻYWAJ ich; style sekcyjne w scoped <style> z prefiksem sekcji.
- SKALA TYPOGRAFII ŻYWEJ (twarda): H2 = var(--h2-d) desktop / var(--h2-m) mobile,
  ceny var(--price-fs), body 17px. ⛔ ZERO clampów sekcyjnych powyżej tej skali.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() cieni serii).
  Akcent mandarynka TYLKO: CTA / swash / ciepły koniec paska odwilży. Ikony: inline SVG
  stroke 1.75px w kolorze var(--ink). Linki tekstowe: var(--ink) z podkreśleniem, NIGDY --cta.
- SYGNATURA „pasek odwilży": po KAŻDYM .eyebrow wstaw <span class="thaw"></span> (klasa
  globalna — 2px gradient zimny→mandarynka). SWASH: <span class="swash">słowo</span> w H1/H2
  — ZAWSZE DOKŁADNIE JEDNO słowo, maks. jeden swash na sekcję.
- Zero gwiazdek/liczb opinii, zero przekreśleń cen, zero „24h"/„darmowa dostawa", zero
  ciemnych teł, ⛔ zero CZASÓW rozmrażania i mocy (W), zero wymiarów cm/kg, zero „food-grade",
  zero „KAYUSO", zero obietnic medycznych (plazma/UVC zawsze „według producenta").
  Jedyne liczby dozwolone: 4,2 L · 4 steki / 4 porcje ryby · 289,00 zł · 14 dni · USB-C
  · materiały (stop aluminium/PS/ABS/NTC).
- Obrazy: <img> z width/height (i CSS height:auto), loading="lazy" (poza hero), alt PL
  opisowy, radius var(--radius-lg). Dodawaj .reveal do głównych bloków.
- ⛔ NIE centruj transformem (kolizja z .reveal.in{transform:none}) — left/right/margin-inline.
- NAJPIERW wypisz siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style> (+ scoped
<script> IIFE tylko jeśli brief każe).

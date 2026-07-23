
# SEKCJA 02-problem (typ A — scena full-bleed z polem copy; BEZ produktu w scenie)
Prefiks `.pb-`. Sekcja full-width bez .wrap na scenie.
DESKTOP: grid 5/7. LEWA kolumna (na płaskim tle --paper-2, wyrównana do .wrap): eyebrow
"16:30. KAŻDEMU SIĘ ZDARZA." + thaw; H2: "Zamrażarka pamięta. Ty nie
<span class="swash">musisz</span>."; lead: "Wracasz z pracy, rodzina pyta o obiad, a mięso
nadal jest twarde i pokryte szronem."; DWIE karty problemu (--card, radius-lg, border 1px
--line) [ikona SVG | tekst]: (ikona miski z parą) "Miska ciepłej wody zajmująca zlew?" /
(ikona mikrofali) "Mikrofala i brzegi, które zaczynają się gotować?"; puenta .lead 15px:
"Rozmrozik daje zamrożonym porcjom osobne miejsce: aluminiową płytę pod kopułą oraz tackę
ociekową zbierającą wodę."
PRAWA: scena <img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-problem.webp (1536x1024, lazy, alt "Miska ciepłej wody
z zamrożonym mięsem w zlewie, mikrofala w tle") full-bleed do prawej krawędzi viewportu,
wysokość 100% sekcji, object-fit cover; na styku z kolumną copy nakładka gradientowa
(linear-gradient w prawo od --paper-2 do transparent, ~120px) — szew niewidoczny.
MOBILE: scena na górze (~45vh, <img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-problem-900.webp 900px, cover, center),
u dołu sceny fade do --paper-2 (gradient overlay), potem copy: eyebrow+thaw → H2 → lead →
2 karty stacked → puenta.

ID sekcji: <section id="problem">.

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

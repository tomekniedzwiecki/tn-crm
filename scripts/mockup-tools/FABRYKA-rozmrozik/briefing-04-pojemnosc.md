
# SEKCJA 04-pojemnosc (dowód liczbowy; toggle steki/ryba)
Prefiks `.pj-`. Na pasie .band (--paper-2 + grain).
DESKTOP: grid 5/7. LEWA plakat typograficzny: eyebrow "MIEJSCE NA OBIAD" + thaw; H2: "Nie
jedna porcja. <span class="swash">Cztery</span>."; GIGANT .display 700: "4,2 L"
(clamp(72px,9vw,128px), --ink, data-countup) + pod nim rząd: "4 steki" / separator ukośnik
--cold / "4 porcje ryby" (.display 700 ~28px); body: "Komora o pojemności 4,2 L mieści
jednocześnie 4 steki lub 4 porcje ryby."; body 2: "Tacka ociekowa ABS zbiera wodę powstającą
podczas rozmrażania."; na dole caps spec strip 12px letter-spacing .08em --body:
"PŁYTA: STOP ALUMINIUM · KOPUŁA: PS · TACKA: ABS · ELEMENTY: NTC" (hairline top 1px --line).
PRAWA foto-karta (--card padding 12px radius-lg shadow-md): toggle pill (2 segmenty "Steki" /
"Ryba"; aktywny = fill --ink, tekst biały; NIGDY --cta; role="tablist", klawiatura) nad sceną;
STAGE crossfade 2 kadrów: https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-capacity-steak.webp (alt "Widok z góry: cztery steki
na perforowanej płycie") / https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-capacity-fish.webp (alt "Widok z góry: cztery porcje
ryby na perforowanej płycie"); 1536x1024, lazy, aspect-ratio 5/4, cover. Scoped <script> IIFE
toggle.
MOBILE: liczby najpierw (eyebrow+thaw → H2 → GIGANT 4,2 L → 4 steki / 4 porcje ryby → toggle
→ foto-karta → 2 linie body → spec strip zawinięty w 2 linie).

ID sekcji: <section id="pojemnosc">.

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

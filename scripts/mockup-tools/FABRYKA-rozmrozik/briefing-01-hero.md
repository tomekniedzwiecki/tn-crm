
# SEKCJA 01-hero (archetyp F — dyptyk ZAMROŻONE|ROZMROŻONE)
Prefiks `.hr-`. Sekcja: <section id="hero" class="hr-hero hero"> (klasa .hero WYMAGANA — IO
sticky-buy). UWAGA: topbar z lockupem już istnieje w szkielecie — NIE dubluj logo w hero.
DESKTOP (≥900px): dwie kolumny. LEWA (~42%): eyebrow "PLAN AWARYJNY NA ZAMROŻONY OBIAD"
+ thaw; H1 .display (var(--h1-d)): "Mięso z zamrażarki nie musi rozwalać
<span class="swash">planu</span> na obiad."; sub .lead: "Połóż porcje na aluminiowej płycie,
przykryj je przezroczystą kopułą i uruchom elektryczny box jednym dotknięciem."; karta oferty
(--card, radius-lg, shadow-md): cena <span class="display hr-price" data-price>289,00 zł</span>
(var(--price-fs), 700) + CTA <a class="btn cta" data-checkout href="#zamow">Zamawiam
Rozmrozik</a> + micro 13.5px "Płatność przy odbiorze lub BLIK/online · 14 dni na zwrot"
+ marker <!--PAYBADGES--> (bez wrappera). Pod kartą PAS ZAUFANIA: 4 kafelki [ikona SVG | tekst]:
"4,2 L" (ikona miarki) / "4 steki lub 4 porcje ryby" (ikona steku) / "Start jednym dotknięciem"
(ikona palca) / "Ładowanie USB-C" (ikona wtyczki) — liczby w .display 700, kolor --ink.
PRAWA (~58%): DYPTYK w ramie edytorialnej (--card padding 12px radius-lg shadow-md): dwa
pionowe kadry obok siebie (grid 1:1, gap 8px):
kadr L = <picture>: source media="(max-width:899px)" https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-hero-frozen-800.webp,
img src=https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-hero-frozen.webp (1024x1536, eager, fetchpriority="high", alt
"Zamrożony stek pokryty szronem na desce") + chip label "ZAMROŻONE" (biała pigułka, caps 11px,
dolny lewy róg); kadr P = <picture> analogicznie sc-hero-thawed-800/sc-hero-thawed (alt
"Rozmrozik z porcjami mięsa pod kopułą obok patelni") + chip "ROZMROŻONE". Oba obrazy
object-fit cover, aspect-ratio 4/5, radius-sm.
MOBILE (<900px) — kolejność MAKIETY mobile: dyptyk (2 kwadratowe kadry obok siebie, ~30%
wysokości ekranu) → eyebrow+thaw → H1 (var(--h1-m), 3 krótkie linie) → jedna linia benefit
.lead: "Połóż, przykryj kopułą, dotknij — gotowe." → karta oferty full-width (cena, CTA
full-width, micro-copy, PAYBADGES). Pas zaufania na mobile UKRYJ (redundancja z kartą).

ID sekcji: <section id="hero">.

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

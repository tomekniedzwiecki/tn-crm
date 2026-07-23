
# SEKCJA 03-jak-dziala (TOR-I — 3 stany demonstracji; interakcja crossfade)
Prefiks `.jd-`. Eyebrow "TRZY RUCHY" + thaw; H2: "Połóż. Przykryj.
<span class="swash">Dotknij</span>."
DESKTOP: grid 7/12 + 5/12. LEWA duża SCENA-STAGE (--card padding 12px radius-lg shadow-md):
3 panele stanów crossfade (position absolute, opacity .38s var(--mo-ease)):
stan 1 = https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-demo-place.webp (alt "Dłoń kładzie zamrożoną porcję na aluminiowej
płycie"), stan 2 = https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-demo-cover.webp (alt "Dłonie nasadzają przezroczystą kopułę
na bazę"), stan 3 = https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/sc-demo-touch.webp (alt "Palec dotyka panelu LED na module
kopuły"). Wszystkie 1536x1024, lazy, aspect-ratio 3/2, cover.
PRAWA: pionowy STEPPER — 3 wiersze-przyciski (button, role="tab", aria-selected; połączone
cienką pionową linią --line): każdy = numer w .display (1/2/3; aktywny: kwadrat --ink, cyfra
biała; nieaktywny: cyfra --ink na --card) + tytuł .display 700 ("Połóż"/"Przykryj"/"Dotknij")
+ 1 linia body: "Umieść zamrożone porcje na płycie ze stopu aluminium." / "Nałóż przezroczystą
kopułę PS ze ściętymi bokami." / "Uruchom urządzenie jednym dotknięciem panelu LED."
Aktywny wiersz przełącza scenę (scoped <script> IIFE: klik + klawiatura strzałki; stan 1
domyślny). Pod stepperem status-chip (--card, ikona check w --ink): "Urządzenie uruchomione."
— widoczny TYLKO gdy aktywny stan 3 (toggle klasą). Na dole tekstowy link w ink z
podkreśleniem: "Zobacz, ile mieści →" href="#pojemnosc" (NIGDY kolor --cta).
MOBILE: stack — header (eyebrow+thaw, H2) → scena-stage (aspect-ratio 4/3) → stepper pionowy
pod sceną (te same 3 wiersze, pełna szerokość, mini-thumbnail 64px danego stanu po prawej
wiersza) → status-chip → link.

ID sekcji: <section id="jak-dziala">.

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

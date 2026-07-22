
# SEKCJA 09-faq (moduł faq-accordion@1 — mechanika NIETYKALNA, tu treść+skórka)
Prefiks `.fq-`. Eyebrow "FAQ", .h2: "Pytania przed zakupem" + .lead "Wszystko, co warto
wiedzieć przed zamówieniem." Obok nagłówka (desktop) 2 pille: płatność/zwrot.
Akordeon: 7 pozycji, KAŻDA: <details class="fq-item"><summary>PYTANIE<span class="fq-x"
aria-hidden="true"></span></summary><div class="fq-a">ODPOWIEDŹ</div></details> — ikona +/−
rysowana CSS-em (dwie kreski 1.5px --ink, obrót przy open; NIGDY zieleń), karta --card border
1px --line radius-lg, animacja max-height. PIERWSZA pozycja OTWARTA (atrybut open) z małą
miniaturą https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/jr-A.webp (120px, radius-sm) obok odpowiedzi.
PYTANIA+ODPOWIEDZI (fakty TYLKO z tych danych; ⛔ zero wymiarów, zmywarki, blanszowania):
1. "Jak używać go w garnku lub woku?" → "Rozłóż koszyk, włóż do garnka lub woka z olejem
i smaż frytki, nuggetsy czy placki bezpośrednio w nim. Po smażeniu unieś całość za spięte
uchwyty — cała porcja wychodzi jednym ruchem."
2. "Jak zawiesić go na rancie garnka?" → "Korona z zygzakowatych drutów opiera się o krawędź
garnka. Zawieś koszyk po wyjęciu z oleju — ocieka prosto do garnka, a Ty masz wolne ręce."
3. "Jak złożyć go na płasko?" → "Po umyciu złóż koszyk — zwija się w płaski dysk, który
wsuniesz do szuflady jak pokrywkę."
4. "Czy działa jak durszlak?" → "Tak. Odcedzisz w nim makaron i warzywa albo opłuczesz owoce
pod bieżącą wodą — woda swobodnie przepływa przez siatkę."
5. "Jak go myć?" → "Gładka stal nierdzewna nie trzyma resztek. Wystarczy opłukać koszyk pod
bieżącą wodą i osuszyć."
6. "Jak zapłacić przy odbiorze?" → "W zamówieniu wybierz opcję «Przy odbiorze (za pobraniem)»
— płacisz kurierowi przy dostawie."
7. "Jak działa zwrot 14 dni?" → "Masz 14 dni na zwrot bez podawania przyczyny. Napisz do nas,
odeślij produkt i otrzymasz zwrot pieniędzy."
Desktop: 1 kolumna max 860px. Mobile: 1 kolumna.

ID sekcji: <section id="faq">.

## KONTRAKT/ZAKAZY (wspólne serii)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper/--paper-2/--paper-3/--card/--ink/
  --body/--line/--cta/--cta-hover/--cta-ink/--radius-lg/--radius-sm/--shadow-*/--s1..--s7/
  --content-w/--h2-d/--h2-m/--price-fs/--body-fs) i klasy globalne .wrap .sect-pad .eyebrow .h2
  .lead .display .btn.cta .pill .arc .reveal. UŻYWAJ ich; style sekcyjne w scoped <style> z prefiksem.
- SKALA TYPOGRAFII ŻYWEJ (twarda): H2 = var(--h2-d) desktop / var(--h2-m) mobile (26-30px!),
  ceny var(--price-fs) 28-36px, body 17px. ⛔ ZERO clampów sekcyjnych powyżej tej skali.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() ciepłych cieni serii).
  Akcent zieleń TYLKO CTA/aktywne stany/strzałki .arc. Ikony: inline SVG stroke 1.5px --ink.
- SYGNATURA: strzałka .arc = inline <svg class="arc" viewBox="0 0 120 60"> z ćwiartkowym łukiem
  + małym grotem, stroke var(--cta) 2px, fill none; pozycjonowanie w klasie SEKCYJNEJ
  (np. .jr-arc), NIE w .arc. Używaj tam, gdzie brief każe.
- Zero gwiazdek/liczb opinii, zero przekreśleń cen, zero „24h", zero ciemnych teł,
  ⛔ zero WYMIARÓW (cm/l), zero „zmywarki", zero gwarancji, zero claimów zdrowotnych
  („mniej tłuszczu" ZAKAZ; wolno OPISOWO „olej ocieka z powrotem do garnka").
- Obrazy: <img> z width/height (i CSS height:auto), loading="lazy" (poza hero), alt PL opisowy,
  radius var(--radius-lg). Dodawaj .reveal do głównych bloków.
- ⛔ NIE centruj transformem (kolizja z .reveal.in{transform:none}) — left/right/margin-inline.
- NAJPIERW wypisz siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style> (+ scoped
<script> IIFE tylko jeśli brief każe).


# SEKCJA 04-zloz (TOR-I — interaktywny przełącznik transformacji)
Prefiks `.zl-`. .h2: "Po smażeniu składa się na płasko" (bez eyebrow).
INTERAKCJA (JEDEN przełącznik; makieta pokazuje OBA STANY dokumentacyjnie): duża karta
near-white ze STAGE: dwa panele stanu crossfade (opacity .38s var(--mo-ease)):
STAN A: packshot rozłożony = https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/packshot-rozlozony.webp + label "Rozłożony";
STAN B: packshot płaskiego dysku = https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/packshot-plaski.webp + label "Złożony".
Segmented control (2 pigułki: "Rozłożony" / "Złożony"; aktywna = zieleń fill + biały tekst;
role="tablist", aria-selected, obsługa klawiatury; scoped <script> IIFE). Na karcie JEDEN
.arc między stanami. POD kartą pas-karta: foto https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/odsaczek/assets/sc-szuflada.webp (dłoń wsuwa
płaski dysk do szuflady) + obok tekst .display ~22px: "Płaski jak pokrywka — wsuwasz do
szuflady" + 3 małe ikony outline (garnek/kropla/dysk).
Na dole rząd: 2 pille (płatność/zwrot) + CTA. Mobile: stack toggle+stage → pas szuflady → CTA.

ID sekcji: <section id="zloz">.

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


# SEKCJA 05-funkcje (4 karty techniczne; cropy realne)
Prefiks `.fk-`. Eyebrow "CO WIEMY O URZĄDZENIU" + thaw; H2: "Funkcje nazwane bez cudownych
<span class="swash">obietnic</span>."
DESKTOP: grid 2x2 kart (--card radius-lg border 1px --line shadow-sm). Każda karta: kwadratowy
slot foto po lewej (128px, radius-sm, overflow hidden) + tytuł .display 700 20px + 1-2 linie
body 15px:
K1 foto https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/fn-modul.webp (alt "Moduł z okrągłą kratką na kopule"): "Plasma Locking" —
"Moduł generatora plazmy opisany przez producenta jako „Plasma Locking"."
K2 foto https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/fn-plyta.webp (alt "Perforowana płyta pod kopułą"): "UVC Antibacterial" —
"Lampa UVC o działaniu antybakteryjnym według producenta; bez obietnic medycznych."
K3 foto https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/fn-panel.webp (alt "Panel dotykowy LED z owalnym przyciskiem"): "Panel
dotykowy LED" — "Owalny przycisk i panel dotykowy umożliwiają start jednym dotknięciem."
K4 foto https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozmrozik/assets/fn-kopula.webp (alt "Krawędź kopuły i baza urządzenia"): "USB-C" —
"Urządzenie jest ładowane przez USB-C." (⛔ ŻADNEGO zbliżenia portu — slot pokazuje krawędź
kopuły/bazy, to celowe).
Pod gridem NOTA na pasie --paper-2 (radius-lg, ikona "i" w kółku stroke --ink): "Nie podajemy
mocy, skuteczności procentowej ani czasu rozmrażania, ponieważ dostępne materiały nie
zawierają takich danych."
MOBILE: karty stacked pionowo (slot foto 96px), nota na dole.

ID sekcji: <section id="funkcje">.

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

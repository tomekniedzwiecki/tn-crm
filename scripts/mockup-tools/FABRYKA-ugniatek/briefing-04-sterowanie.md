
# SEKCJA 04-sterowanie
Prefiks `.st-`. Eyebrow "STEROWANIE", .h2: "Wybierz tryb i poziom intensywności."
+ .lead: "Pełna kontrola masażu dopasowana do Ciebie."
Desktop: LEWA foto-karta = https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/st-panel.webp + callout "wyświetlacz + 3 przyciski";
PRAWA karta-tabela (4 wiersze; ⚠ lewa kolumna = SAMA etykieta, prawa = SAMA wartość — bez
duplikowania wartości w etykiecie): [ikona kropki-tryby | "Tryby pracy" | "9 (P1–P9)"],
[ikona słupków | "Poziomy intensywności" | "1–9"], [ikona baterii | "Praca / ładowanie USB" |
"do 2 h / ok. 3,5 h"], [ikona zegara | "Auto-stop" | "po 10 min"]. Wartości --font-display 700.
Pod tabelą rząd 2 pille: "Bezprzewodowy" (ikona fal), "Akumulator 2000 mAh" (ikona baterii).
Mobile: stack foto→tabela→pille (makieta 2).

ID sekcji: <section id="sterowanie">.

## KONTRAKT/ZAKAZY (wspólne serii)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper/--paper-2/--paper-3/--card/--ink/
  --body/--line/--cta/--cta-hover/--cta-ink/--radius-lg/--radius-sm/--shadow-*/--s1..--s7/
  --content-w/--h2-d/--body-fs) i klasy globalne .wrap .sect-pad .eyebrow .h2 .lead .display
  .btn.cta .pill .callout .reveal. UŻYWAJ ich; style sekcyjne w scoped <style> z prefiksem klas.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() chłodnych cieni serii).
  Akcent petrol TYLKO CTA/aktywne stany. Ikony: inline SVG stroke 1.5px currentColor (--ink).
- Zero gwiazdek/liczb opinii, zero przekreśleń cen, zero „24h", zero ciemnych teł sekcji.
- Obrazy: <img> z width/height, loading="lazy", alt PL opisowy, radius var(--radius-lg).
- Dodawaj .reveal do głównych bloków.
- NAJPIERW wypisz siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style>.

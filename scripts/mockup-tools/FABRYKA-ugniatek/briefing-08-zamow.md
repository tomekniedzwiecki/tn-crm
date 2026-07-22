
# SEKCJA 08-zamow (SKÓRKA checkoutu — mechanika = moduł fabryki w montażu!)
Prefiks `.zm-`. Sekcja renderuje: nagłówek .h2 "Zamów Ugniatka" (krótko) + DUŻĄ kartę
near-white (radius-lg, shadow-lg, max 720px): wewnątrz górny rząd [miniatura produktu =
https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/packshot-34.webp 96px radius-sm | "Ugniatek" .display 700 |
<span data-price>189,00 zł</span> .display 700] a POD nim WYŁĄCZNIE marker:
<!--CHECKOUT-INLINE-->
(nic więcej w karcie — moduł fabryki checkout-inline wchodzi tam w montażu; NIE koduj pól
formularza ani radiów!). W scoped <style> przygotuj SKIN dla modułu wg makiety (selektory
działające na przyszłej zawartości karty): inputy = tło --card, border 1px --line, radius-sm,
focus border --cta; radio-karty płatności = border 1px --line radius-sm, wybrana = border --cta
+ kropka --cta; przycisk submit = jak .btn.cta full-width; drobny tekst "14 dni na zwrot" 13px.
Pod kartą marker <!--PAYBADGES--> (bez wrappera).

ID sekcji: <section id="zamow">.

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

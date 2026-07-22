
# SEKCJA 03-anatomia (sygnaturowa — techniczne calloutsy)
Prefiks `.an-`. Eyebrow "ANATOMIA", .h2: "Sześć głowic pod kontrolą dwóch uchwytów."
+ .lead: "Przemyślana konstrukcja, w której każdy element ma swoje zadanie."
Layout desktop: LEWA duża karta (.an-stage, --card, radius-lg): obraz REALNEGO spodu =
https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/an-spod.webp + 4 CALLOUTSY jako pozycjonowane absolutnie elementy
(hairline 1px --ink + kropka 4px + label 12.5px): "2 zintegrowane uchwyty" (lewy-górny,
wskazuje uchwyt), "6 kulowych głowic" (prawy-górny), "powierzchnia robocza do 22 300 mm²"
(lewy-dolny), "centralne podświetlenie 630–650 nm" (dolny-środek, wskazuje pole diod).
Pozycje calloutów w % kontenera; na mobile calloutsy przechodzą w LISTĘ pod obrazem
(kropka+hairline+label w wierszach — jak makieta mobile).
PRAWA kolumna: karta z https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/ze-profil.webp + callout "płaski owal — 11 cm";
pod nią karta-pas z https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/an-makro.webp + caption "Ciepłe czerwone podświetlenie
w centrum spodu" (⛔ zero claimów efektów).

ID sekcji: <section id="anatomia">.

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

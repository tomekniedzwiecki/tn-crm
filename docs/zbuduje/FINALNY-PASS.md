# FINALNY-PASS — pixel-perfect przegląd detali (F7.3, „sprawdzenie na koniec wszystkiego")

**Status: OBOWIĄZUJE (2026-07-16, research Sonnet: impeccable/design-auditor/UICrit/Polypane
+ żądanie Tomka po incydencie oferty Uśmieszka).** Uruchamiany DOPIERO gdy SSIM-dopasowanie
i ogólny krytyk są zielone (polerowanie niedokończonego = strata). Pętla do wyczerpania:
powtarzaj passy aż runda wróci CZYSTA.

## METODYKA — 4 PASSY KASKADOWO (osobny pass = osobna intencja; warstwa-po-warstwie
bije „oceń wszystko naraz")

**PASS 0 — DESIGN-LINTER (skrypt, deterministyczny; python+CDP `getComputedStyle` +
`getBoundingClientRect`):** spacing poza skalą 4/8 · kolaps/podwójne marginesy styków
sekcji · padding kart tego samego typu identyczny · liczba fontów ≤2-3, rozmiary ze skali,
„prawie takie same" (17 vs 18px) · Delta-E clustering prawie-identycznych akcentów ·
kontrast WCAG (tekst + najgorszy piksel tła pod tekstem) · focus-ring nie usunięty ·
touch-target ≥44px · aspect-ratio naturalne vs box (stretch/squish), upscaling
(naturalWidth < renderWidth) · CLS/sticky zasłaniające · placeholdery/TODO/{{}}/lorem ·
zakazane frazy, podwójne spacje, format cen · polskie cudzysłowy „ ".

**PASS 1 — VISION WARSTWOWY na crop'ach hi-res per sekcja** (osobny prompt PER WARSTWA:
typografia → obrazy → spacing; thumbnail dla kontekstu + crop dla detalu):
- typografia: wdowy/sieroty · brzydkie łamania (przyimek na końcu → &nbsp;) · optyczne
  wyrównanie ikon do baseline · hierarchia (H1>H2>body wyraźnie) · tracking wersalików;
- obrazy: pełna lista z `OBRAZY-ROLE.md` (kadrowanie, światło, spójność obróbki, miks
  ikon, obraz-na-obrazie, realizm cutoutów);
- spacing: rytm sekcji · oddech CTA · grupowanie przez proximity · symetria gutterów.

**PASS 2 — SQUINT/BLUR (skrypt robi input, vision ocenia):** gaussian-blur screenshotu
+ wariant „placeholdified" (bloki koloru zamiast tekstu/obrazów). Pytania: gdzie fokus?
czy TŁO PRZEBIJA na produkt (kolizja warstw)? czy drugorzędne dominuje? czy CTA czytelne
bez detali? — łapie dokładnie to, co SSIM przepuszcza.

**PASS 3 — PROWENIENCJA ASSETÓW (skrypt):** hash/`src` wszystkich obrazów per sekcja →
**ten sam asset w dwóch rolach = FLAGA** (dokładnie „zdjęcie z opinii w karcie oferty") ·
zgodność klasy (P/U/S z mapy assetów) z allowlistą slotu (OBRAZY-ROLE) · brakujące alt ·
obrazy-placeholdery.

## ZASADY
- Porównujemy z REGUŁAMI (ta checklista + OBRAZY-ROLE + zakazy standardu), nie z makietą
  (makieta przeszła na etapie SSIM). Few-shot 2-3 przykłady dobrze/źle w promptach vision.
- Vision generuje NAJPIERW opis problemu, POTEM lokalizację (UICrit: lepsza jakość).
- Skrypt podaje vision twardych kandydatów (np. bbox-overlap) do potwierdzenia —
  redukcja halucynacji.
- Naprawy: drobne = edit kodem GPT (low); strukturalne = rewrite sekcji procedurą
  SEKCJA-Z-MAKIETY. Po naprawach CAŁY pass od nowa (do czystej rundy).

## FORMAT FINDINGU (jednolity)
```json
{"warstwa":"obrazy","lokalizacja":"sekcja 'Zamów' / .offer-card img",
 "problem":"asset z sekcji opinii (hash a1b2) użyty jako packshot oferty",
 "severity":"P0","fix":"podmień na packshot; UGC tylko w opiniach",
 "wykryte_przez":"skrypt"}
```
Severity: P0 = łamie zaufanie/rolę (dropship-tell, UGC w ofercie, kolizja warstw) ·
P1 = wyraźny zgrzyt (kontrast, ucięty produkt, wdowa w H1) · P2 = szlif (tracking,
optyczne wyrównanie). P0/P1 blokują oddanie; P2 naprawiać dopóki tanie.

## CHECKLISTA SKRÓCONA WG CZĘSTOŚCI (pełne wyjaśnienia w researchu 16.07)
1. SPACING/WYRÓWNANIE (10 punktów — największe źródło „surowizny")
2. TYPOGRAFIA (12: wdowy, sieroty, skala, łamania, hierarchia, PL-interpunkcja)
3. KOLOR/KONTRAST (9: WCAG, akcent CTA jedyny, jasne tła, stany)
4. OBRAZY (11: role P/U/S, dedup cross-sekcja, kolizje warstw, kadry, światło, ikony)
5. STANY/INTERAKCJE (6: hover/focus/disabled, empty/error, touch, sticky, reduced-motion)
6. TREŚĆ (6: placeholdery, zakazane frazy, ceny/format, ton, duplikaty)

# TOKENS-MAKIETY — POBLASK (samochodowa taśma LED ambientowa RGB) · SSOT mikro-tokenów makiety · F2.5 · 2026-07-24

Jeden akapit STYLE-DNA wstrzykiwany do KAŻDEGO promptu makiety (hero, każda sekcja, każda para
mobile). Dwie warstwy: **KANON** (poziom warsztatu, przepisany 1:1 — nietykalny) i **PARTYTURA**
(tożsamość Poblaska, każda pozycja z uzasadnieniem — bez uzasadnień F2.5 NIEZAMKNIĘTY). Spisany
z planszy DNA `brand/00-styl-master.png`. Źródło partytury: `PLAN.md` §PARTYTURA (8 pozycji).

## KANON  (przepisane 1:1 — identyczne w każdym landingu)
```
8pt:     8·16·24·32·48·64·96 · sekcja desktop 112 / mobile 72 · content-w 1180 · kolumna 50–75 zn.
TYPO:    ratio 1.333 · H1 desktop clamp 56–80 · H1 mobile floor 38 · body 17/1.55 · eyebrow caps 0.2em
TŁO:     jasne (wysoka jasność, niskie nasycenie, WCAG dla body) · ⛔ ciemne tła strony, ⛔ neon w UI
AKCENT:  DOKŁADNIE JEDEN, scope {CTA · sygnatura light-line · gwiazdki ★} · ikony funkcjonalne = --ink
FONTY:   para z KONTRASTEM (display ≠ text) · ⛔ mono-font · ⛔ zimny tech jako jedyny krój
SERIA:   jeden radius · jeden styl ikon · jeden styl trust-pill (desktop == mobile)
GŁĘBIA:  cienie warstwowe CIEPŁE/miękkie (key+ambient, tint chłodny-fioletowy .06–.12, nie czerń) · grain 2–4%
OFERTA:  cena → CTA → redukcja ryzyka · pas zaufania · ⛔ ★/liczby opinii nad foldem
MODUŁY:  mechanika i proporcje z MODULY.md NIETYKALNE (skóra = tokeny)
SYGNATURA: musi istnieć i powtarzać się w ≥3 sekcjach
```

## PARTYTURA  (decyzje TEGO landingu — każda z uzasadnieniem)
```
display   = Montserrat (800/900)              ⟵ produkt motoryzacyjny, sleek, „plakatowy" → mocny
                                                 geometryczny bold = energia automotive-poster;
                                                 ≠ Fraunces (migotek) · ≠ Space Grotesk (nakrecik) ·
                                                 ≠ Bricolage (zaklipek). Gate font ✓.
text      = Mulish (400/600/800)              ⟵ humanist ciepły/zaokrąglony → KONTRAST do geometrycznego
                                                 Montserrata; czyste cyfry do specs (64 kolory · 110 cm ·
                                                 5V · 39,90 zł); ⛔ nie zimny Inter jako jedyny krój.
accent    = (brak 3. kroju — sygnatura „linia światła" niefontowa: świecąca linia + spektrum)
--paper   #F6F5FB / #ECEBF4 / #DEDCEC         ⟵ rodzina CHŁODNA LAWENDOWA PLATYNA: jasne UI (KANON
                                                 anty-scam) z chłodnym fioletowym podtchnieniem
                                                 harmonizującym z akcentem i nocnymi scenami produktu.
                                                 ≠ platyna zaklipka (chłodny błękit) — tu z fioletem.
--ink     #1B1830   --body #35314A   --line #DAD7E8
                                              ⟵ ink = głęboki chłodny grafit z fioletem (echo nocnego
                                                 kokpitu); body #35314A z kontrastem (⛔ nie #000, ⛔ mgła).
--cta     #6A3DE8                             ⟵ WYPROWADZONY ze świata produktu = pełne RGB / neonowa
                                                 poświata → biorę najbardziej ikoniczny hue ambientu =
                                                 ELECTRIC VIOLET; premium, ≠ azure zaklipka. Świat RGB
                                                 rozegrany w SYGNATURZE (spektrum), nie w rozlanym UI —
                                                 akcent nadal DOKŁADNIE JEDEN. --cta-ink #FFFFFF (WCAG
                                                 6,09:1); ΔE min 63,3 vs 3 poprzednie. Gate akcent ✓.
--shadow-md  0 1px 2px rgba(40,30,80,.06), 0 10px 26px rgba(40,30,80,.10)
                                              ⟵ świat nocny/chłodny → cień miękki, warstwowy, tint
                                                 CHŁODNO-FIOLETOWY rgba(40,30,80,α) (nie twarda czerń); grain 3%.
--radius-lg 16px / --radius-sm 10px  ·  IKONY: outline 1.75px, --ink
                                              ⟵ radius łagodnie zaokrąglony = nowoczesny, „soft-tech"
                                                 (echo giętkiej taśmy); ikony funkcjonalne charcoal
                                                 (linia-światła / telefon-app / fala-dźwięku / USB), zero akcentu.
sygnatura = „LINIA ŚWIATŁA" — świecąca linia 2px (rdzeń --cta + miękki bloom), miejscami spektrum RGB
                                              ⟵ motyw = produkt to LINIA ŚWIATŁA: cienka świecąca linia
                                                 biegnąca przez/między sekcjami (hero baseline, dividery,
                                                 demo step-rule, `sterowanie` pasek kolorów), echo 64 kolorów.
                                                 Charakter ŚWIETLNY (⛔ nie caliper zaklipka, ⛔ nie swash). ≥3 sekcje.
trust-pill = fill --paper (#F6F5FB), border --line (#DAD7E8), tekst --ink — jeden styl globalnie.
archetyp-hero = C (karta nachodząca na scenę)  ⟵ produkt impulsowy (Reels, ~90% mobile) z mocną
                                                 natychmiastową sceną (ciemne wnętrze → poświata =
                                                 argument gołym okiem); scena full-bleed nocna u góry,
                                                 karta oferty wjeżdża na jej dolną krawędź. ≠ A (migotek,
                                                 BEZPOŚREDNI) · ≠ B (zaklipek).
```

<!-- Blok :root CZYTANY przez gate-check.py --cross-only (font display + akcent) oraz wklejany 1:1
     do ir.root.css w F4 (SEKCJA-Z-MAKIETY). Nazwy = kontrakt modułów kanonicznych. -->
```css
:root{
  --font-display:"Montserrat",'Segoe UI',system-ui,sans-serif;
  --font-text:"Mulish",system-ui,-apple-system,sans-serif;

  --paper:#F6F5FB;  --paper-2:#ECEBF4;  --paper-3:#DEDCEC;
  --ink:#1B1830;    --body:#35314A;     --line:#DAD7E8;

  --cta:#6A3DE8;    --cta-d:#5A2FD0;    --cta-ink:#FFFFFF;
  --trust-pill:#F6F5FB;

  --shadow-sm:0 1px 2px rgba(40,30,80,.06);
  --shadow-md:0 1px 2px rgba(40,30,80,.06), 0 10px 26px rgba(40,30,80,.10);
  --shadow-lg:0 2px 4px rgba(40,30,80,.07), 0 18px 42px rgba(40,30,80,.12);

  --radius-lg:16px; --radius-sm:10px;
  --icon-style:outline; /* stroke 1.75px, kolor --ink */

  --s1:8px; --s2:16px; --s3:24px; --s4:32px; --s5:48px; --s6:64px; --s7:96px;
  --sect-pad-d:112px; --sect-pad-m:72px; --content-w:1180px;

  --h1-d:clamp(56px,7.5vw,80px); --h1-m:clamp(38px,9vw,44px);
  --body-fs:17px; --body-lh:1.55;

  --gal-aspect:1/1;
}
```

## GRANICE
- Skóra, nie szkielet: mechanika modułów (`MODULY.md`) nietykalna; tokeny to słownik stylu.
- Odchylenie w PARTYTURZE (Montserrat display, akcent electric violet, tło lawendowa platyna,
  sygnatura „linia światła") NIE jest defektem — ⛔ nie „naprawiać do normy" poprzedniego landingu.
- **⚠️ NOTA TŁA (KANON vs produkt-nocny):** UI/tła strony JASNE (KANON anty-scam); ciemność żyje
  WEWNĄTRZ kadrów scen (foto pełnokadrowe hero/problem/rozwiazanie/mid-cta/final = wnętrze nocą).
  ⛔ NIE ciemne tła sekcji kodowych. Sceny ciemne, papier strony i karty jasne.
- KANON w mocy: jasne tło strony, DOKŁADNIE JEDEN akcent (scope CTA/light-line/★), para fontów z
  kontrastem, rytm 8pt, chłodna warstwowa głębia, hierarchia oferty, ⛔ ★/liczby opinii nad foldem.
- Akcent #6A3DE8 w scope {CTA · sygnatura light-line/spektrum · gwiazdki ★}. **Ikony funkcjonalne =
  --ink (charcoal), NIGDY akcent** (linia-światła / telefon / muzyka / USB). Liczba ratingu „4,9/5"
  = --font-text charcoal.
- ⛔ Zakaz claimów/terminów w copy makiet: „neon", „światłowód szklany/fiber optic", „16 mln kolorów",
  „całe auto obrysowane" (1 taśma=1 łuk), „psychedelic", wymiary/waga; marka „Fccemc"/„FCCEMC®"/
  „Stone's Store"/„Vehicle Intelligent Lighting System" (KARTA-PRAWDY §CONSTRAINTS).

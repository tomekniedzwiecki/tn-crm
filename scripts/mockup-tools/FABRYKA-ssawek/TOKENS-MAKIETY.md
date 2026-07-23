# TOKENS-MAKIETY — SSAWEK (Popiołek) · SSOT mikro-tokenów makiety (STYLE-DNA) · F2.5 · 2026-07-23

Jeden akapit STYLE-DNA wstrzykiwany do KAŻDEGO promptu makiety (hero, każda sekcja, każda para
mobile). Dwie warstwy: **KANON** (poziom warsztatu, przepisany 1:1 — nietykalny) i **PARTYTURA**
(tożsamość Popiołka, każda pozycja z uzasadnieniem — bez uzasadnień F2.5 NIEZAMKNIĘTY).

## KANON  (przepisane 1:1 — identyczne w każdym landingu)
```
8pt:     8·16·24·32·48·64·96 · sekcja desktop 112 / mobile 72 · content-w 1180 · kolumna 50–75 zn.
TYPO:    ratio 1.333 · H1 desktop clamp 56–80 · H1 mobile floor 38 · body 17/1.55 · eyebrow caps 0.2em
TŁO:     jasne (wysoka jasność, niskie nasycenie, WCAG dla body) · ⛔ ciemne tła, ⛔ neon
AKCENT:  DOKŁADNIE JEDEN, scope {CTA · swash · gwiazdki ★} · ikony funkcjonalne = --ink
FONTY:   para z KONTRASTEM (display ≠ text) · ⛔ mono-font · ⛔ zimny tech jako jedyny krój
SERIA:   jeden radius · jeden styl ikon · jeden styl trust-pill (desktop == mobile)
GŁĘBIA:  cienie warstwowe CIEPŁE (key+ambient, tint sepiowy .06–.12, nie czerń) · grain 2–4%
OFERTA:  cena → CTA → redukcja ryzyka · pas zaufania · ⛔ ★/liczby opinii nad foldem
MODUŁY:  mechanika i proporcje z MODULY.md NIETYKALNE (skóra = tokeny)
SYGNATURA: musi istnieć i powtarzać się w ≥3 sekcjach
```

## PARTYTURA  (decyzje TEGO landingu — każda z uzasadnieniem)
```
display   = Barlow Semi Condensed (700/800)   ⟵ produkt SPRZĘTOWY/WARSZTATOWY → doktryna „ciepły
                                                 grotesk kondensowany"; kondensacja = język ciężkiego
                                                 sprzętu i tabliczki znamionowej. ≠ 3 poprzednie.
text      = Hanken Grotesk (400/600/700)      ⟵ humanist normalnej szerokości = KONTRAST do
                                                 kondensowanego display; czytelne cyfry (specs, cena);
                                                 ciepły, nie zimny tech.
accent    = (brak 3. kroju — sygnatura S6 niefontowa)
--paper   #F3EDE4 / #E9E1D3 / #DACFBC          ⟵ rodzina PIASEK / ROZBIELONY BETON (ciepły greige):
                                                 świat warsztatu/garażu/kominka (TOKENS: warsztat→piasek).
--ink     #1C1815   --body #2E2620   --line #D7C9B3
--cta     #C2381B                              ⟵ WYPROWADZONY z realnego koloru produktu (CZERWONA
                                                 pokrywa; triada stal/czerwień/czerń z PASZPORTU);
                                                 --cta-ink #FFFFFF (WCAG 5,42:1); ΔE≥39 vs 3 poprzednie.
--shadow-md  0 1px 2px rgba(70,40,20,.07), 0 10px 26px rgba(70,40,20,.11)
--radius-lg 14px / --radius-sm 8px  ·  IKONY: outline 1.75px, --ink
sygnatura = S6 znacznik-rożek (ścięty narożnik kart/mediów, ZAWSZE ta sama strona)
                                               ⟵ „sprzętowe/mocne/warsztatowe"; echo metalowej klamry
                                                  i tabliczki znamionowej; ≠ sygnatura poprzedniego.
archetyp-hero = C (karta oferty nachodząca na scenę)
                                               ⟵ impuls z Reels + mocna cena 119 zł; scena ssania
                                                  popiołu = argument I nośnik ruchu hero-video; karta
                                                  cena→CTA na dolnej krawędzi = czysty fold mobile.
```

<!-- Blok :root CZYTANY przez gate-check.py --cross-only (font display + akcent) oraz wklejany 1:1
     do ir.root.css w F4 (SEKCJA-Z-MAKIETY). Nazwy = kontrakt modułów kanonicznych. -->
```css
:root{
  --font-display:"Barlow Semi Condensed",'Arial Narrow',sans-serif;
  --font-text:"Hanken Grotesk",system-ui,sans-serif;

  --paper:#F3EDE4;  --paper-2:#E9E1D3;  --paper-3:#DACFBC;
  --ink:#1C1815;    --body:#2E2620;     --line:#D7C9B3;

  --cta:#C2381B;    --cta-d:#A72E15;    --cta-ink:#FFFFFF;
  --trust-pill:#F3EDE4;

  --shadow-sm:0 1px 2px rgba(70,40,20,.07);
  --shadow-md:0 1px 2px rgba(70,40,20,.07), 0 10px 26px rgba(70,40,20,.11);
  --shadow-lg:0 2px 4px rgba(70,40,20,.08), 0 18px 42px rgba(70,40,20,.13);

  --radius-lg:14px; --radius-sm:8px;
  --icon-style:outline; /* stroke 1.75px, kolor --ink */

  --s1:8px; --s2:16px; --s3:24px; --s4:32px; --s5:48px; --s6:64px; --s7:96px;
  --sect-pad-d:112px; --sect-pad-m:72px; --content-w:1180px;

  --h1-d:clamp(56px,7vw,76px); --h1-m:clamp(38px,9vw,44px);
  --body-fs:17px; --body-lh:1.55;

  --gal-aspect:1/1;
}
```

## GRANICE
- Skóra, nie szkielet: mechanika modułów (`MODULY.md`) nietykalna; tokeny to słownik stylu.
- Odchylenie w PARTYTURZE (kondensowany display, czerwony akcent, tło piaskowe) NIE jest defektem —
  ⛔ nie „naprawiać do normy" poprzedniego landingu. Cofać wolno TYLKO KANON (WCAG/kontrast).
- KANON w mocy: jasne tło (rodzina piasek), DOKŁADNIE JEDEN akcent (scope CTA/swash/★), para fontów
  z kontrastem, rytm 8pt, ciepła głębia, hierarchia oferty, ⛔ ★/liczby opinii nad foldem.

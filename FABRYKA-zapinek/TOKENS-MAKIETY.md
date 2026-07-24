# TOKENS-MAKIETY — ZAPINEK · SSOT mikro-tokenów makiety (STYLE-DNA) · F2.5 · 2026-07-24

Jeden akapit STYLE-DNA (plik `common.py` → `DNA`) wstrzykiwany do KAŻDEGO promptu makiety.
Dwie warstwy: **KANON** (poziom warsztatu, 1:1 — nietykalny) i **PARTYTURA** (tożsamość
Zapinka, każda pozycja z uzasadnieniem).

## KANON  (przepisane 1:1 — identyczne w każdym landingu)
```
8pt:     8·16·24·32·48·64·96 · sekcja desktop 112 / mobile 72 · content-w 1180 · kolumna 50–75 zn.
TYPO:    ratio 1.333 · H1 desktop clamp 56–80 · H1 mobile floor 38 · body 17/1.55 · eyebrow caps 0.2em
TŁO:     jasne (wysoka jasność, niskie nasycenie, WCAG dla body) · ⛔ ciemne tła, ⛔ neon
AKCENT:  DOKŁADNIE JEDEN, scope {CTA · toggle-active · stitch-sygnatura · wybrany wariant} · ikony = --ink
FONTY:   para z KONTRASTEM (display ≠ text) · ⛔ mono-font · ⛔ zimny tech jako jedyny krój
SERIA:   jeden radius · jeden styl ikon · jeden styl trust-pill (desktop == mobile)
GŁĘBIA:  cienie warstwowe CIEPŁE (key+ambient, tint sepiowy .06–.12, nie czerń) · grain 2–4%
OFERTA:  cena → CTA → redukcja ryzyka · pas zaufania · ⛔ ★/liczby opinii nad foldem (tu: W OGÓLE brak ★)
MODUŁY:  mechanika i proporcje z MODULY.md NIETYKALNE (skóra = tokeny)
SYGNATURA: musi istnieć i powtarzać się w ≥3 sekcjach
```

## PARTYTURA  (decyzje TEGO landingu — każda z uzasadnieniem)
```
display   = Fraunces (600/700)                ⟵ produkt OPIEKUŃCZY (pies=rodzina) → miękki, ciepły
                                                 serif z charakterem; ≠ Barlow/SpaceGrotesk/Bricolage
                                                 (3 poprzednie). Gate font ✓.
text      = Manrope (400/600/700)             ⟵ czysty geometryczno-humanistyczny sans = KONTRAST
                                                 serif↔sans; klarowny na mobile/FAQ/checkout.
--paper   #FBF7F1 / #EFE5DA / #FFFDFC          ⟵ rodzina CIEPŁA KOŚĆ SŁONIOWA: świat = słoneczne
                                                 wnętrze auta (kremowa tapicerka) + zieleń spaceru;
                                                 nie zimna szarość „motoryzacyjna".
--ink     #27212B (śliwkowy grafit — echo fioletu w neutralach)
--cta     #7440A8                              ⟵ WYPROWADZONY z realnej fioletowej taśmy i kwiatka
                                                 (kanon g1); --cta-ink #FFFFFF (WCAG ~7:1);
                                                 ΔE≥15 vs #C2381B / #0B6B64 / #176B3A ✓.
--shadow  ciepłe sepiowe (rgba(70,40,60,.07/.11) — nuta śliwki)
--radius-lg 16px / --radius-sm 10px  ·  IKONY: outline 1.75px, --ink
sygnatura = STITCHING (krótka PRZERYWANA linia-przeszycie taśmy; separator/prowadnica,
            max 1 na sekcję, zawsze ten sam dash)
                                               ⟵ dosłowne echo produktu (szew taśmy nylonowej);
                                                  ≠ znacznik-rożek (ssawek) ≠ calloutsy (ugniatek).
archetyp-hero = B (jasne foto-tło + hero-inner split copy | karta-aside)
                                               ⟵ produkt wymaga 1 zdania wyjaśnienia („to pas, nie
                                                  smycz") = copy na płaskim polu; scena g1 obok;
                                                  bez scrimu (≠A), bez stacku (≠C), bez zoning H.
```

<!-- Blok :root CZYTANY przez gate-check.py --cross-only oraz wklejany 1:1 do ir.root.css w F4. -->
```css
:root{
  --font-display:"Fraunces",Georgia,serif;
  --font-text:"Manrope",system-ui,sans-serif;

  --paper:#FBF7F1;  --paper-2:#EFE5DA;  --paper-3:#FFFDFC;
  --ink:#27212B;    --body:#3A3340;     --line:#E2D8CB;

  --cta:#7440A8;    --cta-d:#5F3390;    --cta-ink:#FFFFFF;
  --trust-pill:#FBF7F1;

  --shadow-sm:0 1px 2px rgba(70,40,60,.07);
  --shadow-md:0 1px 2px rgba(70,40,60,.07), 0 10px 26px rgba(70,40,60,.11);
  --shadow-lg:0 2px 4px rgba(70,40,60,.08), 0 18px 42px rgba(70,40,60,.13);

  --radius-lg:16px; --radius-sm:10px;
  --icon-style:outline; /* stroke 1.75px, kolor --ink */

  --s1:8px; --s2:16px; --s3:24px; --s4:32px; --s5:48px; --s6:64px; --s7:96px;
  --sect-pad-d:112px; --sect-pad-m:72px; --content-w:1180px;

  --h1-d:clamp(56px,7vw,76px); --h1-m:clamp(38px,9vw,44px);
  --body-fs:17px; --body-lh:1.55;

  --gal-aspect:1/1;
}
```

## GRANICE
- Skóra, nie szkielet: mechanika modułów (`MODULY.md`) nietykalna.
- Odchylenie w PARTYTURZE (serif display, fiolet, stitching) NIE jest defektem — nie „naprawiać
  do normy" poprzednich landingów. Cofać wolno TYLKO KANON (WCAG/kontrast).
- W TYM landingu: ZERO gwiazdek i liczb opinii W OGÓLE (0 opinii — dyscyplina dowodowa PLAN.md);
  sekcja zdjęcia-kupujących = blokada-tomek (nierenderowana).
```
```

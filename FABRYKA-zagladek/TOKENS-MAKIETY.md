# TOKENS-MAKIETY — ZAGLĄDEK (mini-marka Zaglądek · parasol Patencik) · SSOT mikro-tokenów makiety (STYLE-DNA) · F2.5 · 2026-07-24

Jeden akapit STYLE-DNA (plik `common.py` → `DNA`) wstrzykiwany do KAŻDEGO promptu makiety
(hero, każda sekcja, każda para mobile). Dwie warstwy: **KANON** (poziom warsztatu, przepisany
1:1 — nietykalny) i **PARTYTURA** (tożsamość Zaglądka, każda pozycja z uzasadnieniem — bez
uzasadnień F2.5 NIEZAMKNIĘTY).

## KANON  (przepisane 1:1 — identyczne w każdym landingu)
```
8pt:     8·16·24·32·48·64·96 · sekcja desktop 112 / mobile 72 · content-w 1180 · kolumna 50–75 zn.
TYPO:    ratio 1.333 · H1 desktop clamp 56–80 · H1 mobile floor 38 · body 17/1.55 · eyebrow caps 0.2em
TŁO:     jasne (wysoka jasność, niskie nasycenie, WCAG dla body) · ⛔ ciemne tła, ⛔ neon
AKCENT:  DOKŁADNIE JEDEN, scope {CTA · toggle-active · sygnatura · wybrany wariant} · ikony = --ink
FONTY:   para z KONTRASTEM (display ≠ text) · ⛔ mono-font · ⛔ zimny tech jako jedyny krój
SERIA:   jeden radius · jeden styl ikon · jeden styl trust-pill (desktop == mobile)
GŁĘBIA:  cienie warstwowe CIEPŁE (key+ambient, tint sepiowy .06–.12, nie czerń) · grain 2–4%
OFERTA:  cena → CTA → redukcja ryzyka · pas zaufania · ⛔ ★/liczby opinii nad foldem
MODUŁY:  mechanika i proporcje z MODULY.md NIETYKALNE (skóra = tokeny)
SYGNATURA: musi istnieć i powtarzać się w ≥3 sekcjach
```

## PARTYTURA  (decyzje TEGO landingu — każda z uzasadnieniem)
```
display   = Archivo (700/800)                 ⟵ produkt = PRECYZYJNY PRZYRZĄD INSPEKCYJNY → ciasny,
                                                 industrialny grotesk; język narzędzia pomiarowego
                                                 i tabliczki parametrów (3 MP · 8 LED · 2 w 1). Pełny
                                                 latin-ext (PL) potwierdzony. ≠ Fraunces / Barlow Semi
                                                 Condensed / Space Grotesk (poprzednie). Gate font ✓.
text      = IBM Plex Sans (400/500/600)       ⟵ humanist sans z czytelnymi cyframi (specy 1920×1440,
                                                 30 FPS, warianty, cena) i pełnym latin-ext; KONTRAST
                                                 do industrialnego Archivo budowany WAGĄ i RYTMEM
                                                 (grotesk↔humanist), nie serif↔sans — to nowa oś pary.
--paper   #F3EEE4 / #F7F9F8 / #FFFDF8          ⟵ rodzina: ciepły WARSZTATOWY GREIGE (garaż, zaplecze
                                                 domu, blat) + chłodna TECHNICZNA BIEL #F7F9F8 dla
                                                 sekcji specyfikacji (kontrast do ciepła scen). Rodzina
                                                 RÓŻNA niż zapinek (dodana chłodna robocza biel).
--ink     #1B211F   --body #56605C  --line #E4DDCE
                                               ⟵ główny ink zimno-grafitowy, drugorzędny neutralny
                                                  grafit; hairline z rodziny greige.
--cta     #EFA019                              ⟵ WYPROWADZONY z realnej BURSZTYNOWEJ POŚWIATY pierścienia
                                                 8 LED (kanon c-glowka-8mm) — świetliste światło robocze,
                                                 nie arbitralny akcent sklepu; --cta-ink #1B1406
                                                 (⛔ NIE biały: kontrast biały/#EFA019 ≈2,2:1 = WCAG FAIL;
                                                 ciemny ink ≈8,4:1 = PASS); ΔE≥15 vs #C2381B / #0B6B64 /
                                                 #176B3A / #7440A8 ✓. Jasne stany = tint tego samego złota
                                                 #FFF3D2. ⛔ drugi akcent chromatyczny.
--shadow  ciepło-neutralne (rgba(40,34,20,.07/.11) — nie czerń)
--radius-lg 12px / --radius-sm 8px  ·  IKONY: outline 1.75px, --ink
                                               ⟵ ciaśniejszy promień = język precyzyjnego przyrządu;
                                                  ≠ 16/10 (zapinek), ≠ 14/8 (ssawek).
sygnatura = VIEWFINDER BRACKETS (bursztynowe narożniki celownika kadrujące kartę / kadr media /
            aktywny detal; max 1 kadrowanie na sekcję, zawsze ten sam styl)
                                               ⟵ dosłowne echo KADROWANIA OBRAZU z sondy („zajrzyj”);
                                                  wystąpienia: granica dyptyku hero · ekran telefonu demo ·
                                                  aktywny detal galeria · zamknięcie kadru final.
                                                  ≠ stitching (zapinek) ≠ znacznik-rożek (ssawek).
archetyp-hero = F (dyptyk niewidoczne ↔ widoczne)
                                               ⟵ zestawienie „nie sięgam wzrokiem ↔ mam obraz w dłoni”
                                                  samo jest argumentem sprzedażowym → dyptyk jako JEDNA
                                                  ciągła scena garażowa; ≠ B (split copy|karta, zapinek).
```

<!-- Blok :root CZYTANY przez gate-check.py --cross-only (font display + akcent) oraz wklejany 1:1
     do ir.root.css w F4 (SEKCJA-Z-MAKIETY). Nazwy = kontrakt modułów kanonicznych.
     --gal-aspect ZMIERZONY z realnych keep plików: detale c-glowka-led 448/416≈1.077, c-modul
     560/512≈1.094, c-zlacze 448/352≈1.273, c-glowka-8mm 308/400≈0.770 → geomean detali ≈1.08 (near-
     square) → 1/1; lifestyle c-motoryzacja 1600/1064≈1.504 jedzie własnym większym kaflem 3/2. -->
```css
:root{
  --font-display:"Archivo","Arial Narrow",system-ui,sans-serif;
  --font-text:"IBM Plex Sans",system-ui,sans-serif;

  --paper:#F3EEE4;  --paper-2:#F7F9F8;  --paper-3:#FFFDF8;
  --ink:#1B211F;    --body:#56605C;     --line:#E4DDCE;

  --cta:#EFA019;    --cta-d:#D6890B;    --cta-ink:#1B1406;
  --amber-tint:#FFF3D2;
  --trust-pill:#FFFDF8;

  --shadow-sm:0 1px 2px rgba(40,34,20,.07);
  --shadow-md:0 1px 2px rgba(40,34,20,.07), 0 10px 26px rgba(40,34,20,.11);
  --shadow-lg:0 2px 4px rgba(40,34,20,.08), 0 18px 42px rgba(40,34,20,.13);

  --radius-lg:12px; --radius-sm:8px;
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
- Odchylenie w PARTYTURZE (industrialny Archivo, bursztyn LED, viewfinder brackets, dyptyk F) NIE jest
  defektem — ⛔ nie „naprawiać do normy” poprzednich landingów. Cofać wolno TYLKO KANON (WCAG/kontrast).
- **KIESZEŃ CIEMNOŚCI** (DECYZJA ART-DIRECTORSKA, PRZEWODNIK): ciemność występuje WYŁĄCZNIE jako obiekt
  w kadrze (wnętrze silnika/rury/szczeliny) z rozwiązaniem (poświata 8 LED / ekran) — ⛔ NIGDY jako tło
  sekcji; strona, sekcje i strefy copy zostają jasne (#F3EEE4/#F7F9F8).
- **Ten landing MA opinie (5★)**: gwiazdki dozwolone WYŁĄCZNIE w sekcji `opinie` (⛔ nigdy nad foldem,
  ⛔ bez zbiorczego wyniku/liczby ocen/„sprzedano”).
- CTA-ink na złocie ZAWSZE ciemny `#1B1406` (⛔ biały tekst na `#EFA019` = WCAG FAIL).
```
```

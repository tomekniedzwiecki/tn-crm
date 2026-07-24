# TOKENS-MAKIETY — BLASIK · SSOT mikro-tokenów makiety (STYLE-DNA) · F2.5 · 2026-07-24

Jeden akapit STYLE-DNA (plik `common.py` → `DNA`) wstrzykiwany do KAŻDEGO promptu makiety.
Dwie warstwy: **KANON** (poziom warsztatu, 1:1 — nietykalny) i **PARTYTURA** (tożsamość
Blasika — latarka czołowa LED, motyw „światło niesione tam, gdzie patrzysz"; każda pozycja
z uzasadnieniem). Źródło decyzji: `PLAN.md` §PARTYTURA + `## FILTR-KOREKTA v2`.

## KANON  (przepisane 1:1 — identyczne w każdym landingu)
```
8pt:     8·16·24·32·48·64·96 · sekcja desktop 112 / mobile 72 · content-w 1180 · kolumna 50–75 zn.
TYPO:    ratio 1.333 · H1 desktop clamp 56–80 · H1 mobile floor 38 · body 17/1.55 · eyebrow caps 0.2em
TŁO:     jasne (wysoka jasność, niskie nasycenie, WCAG dla body) · ⛔ ciemne tła, ⛔ neon
AKCENT:  DOKŁADNIE JEDEN, scope {CTA · toggle-active · sygnatura · wybrany/focus} · ikony = --ink
FONTY:   para z KONTRASTEM (display ≠ text) · ⛔ mono-font · ⛔ zimny tech jako jedyny krój
SERIA:   jeden radius · jeden styl ikon · jeden styl trust-pill (desktop == mobile)
GŁĘBIA:  cienie warstwowe CIEPŁE (key+ambient, tint neutralny .06–.12, nie czerń) · grain 2–4%
OFERTA:  cena → CTA → redukcja ryzyka · pas zaufania · ⛔ ★/liczby opinii NAD foldem
MODUŁY:  mechanika i proporcje z MODULY.md NIETYKALNE (skóra = tokeny)
SYGNATURA: musi istnieć i powtarzać się w ≥3 sekcjach
```

## PARTYTURA  (decyzje TEGO landingu — każda z uzasadnieniem)
```
display   = Gabarito (700/800)                ⟵ produkt = NARZĘDZIE (latarka warsztat/outdoor)
                                                 → zaokrąglony geometryczny krój = solidna, ciepła
                                                 „tabliczka narzędziowa", przystępny konkret pod
                                                 impuls 14,90; ≠ Fraunces/Barlow/SpaceGrotesk/
                                                 Bricolage (portfel). FILTR-KOREKTA v2 (kolizja
                                                 z Zaglądkiem: Archivo+IBM Plex → Gabarito+Karla).
                                                 Gate font ✓.
text      = Karla (400/600/700)               ⟵ spokojny humanistyczny sans = KONTRAST wobec
                                                 solidnego display; czytelny na specs/FAQ/checkout
                                                 i mobile.
--paper   #F2F1EC / #E6E8E3 / #FFFFFF          ⟵ rodzina „LEN I BETON WARSZTATOWY W DZIEŃ":
                                                 chłodniejsza jasna baza oddziela od kremów/greige
                                                 poprzedników (zapinek ciepła kość, ssawek piasek);
                                                 strona = DZIEŃ, nie zimna szarość „motoryzacyjna".
--ink     #292722 (ciepły grafit)
--cta     #D9BE00                              ⟵ WYPROWADZONY z realnej ŻÓŁTO-LIMONKOWEJ listwy
                                                 COB (kanon c-lit); --cta-ink #1B1406 (CIEMNY warm
                                                 ink — kontrast taxi-sign, WCAG; ⛔ NIE biały tekst
                                                 na żółtym); ΔE≥15 vs #7440A8 (zapinek) /
                                                 #C2381B (ssawek) / #EFA019 bursztyn Zaglądka
                                                 (wyraźny hue-shift żółć↔bursztyn). ⚠️ #EE8A00
                                                 NIEAKTUALNY (FILTR-KOREKTA v2).
--cta-d   #B89F00 (ciemniejsza ochra — hover / także dopuszczalny relight znaku, patrz werdykt marki)
--shadow  warm-neutral rgba(41,39,34,.06/.10/.12) — nie czerń
--radius-lg 12px / --radius-sm 8px  ·  IKONY: outline 1.75px, --ink
                                               ⟵ ciaśniejszy radius = utylitarny „tool"-charakter
                                                  (≠ 16px opiekuńczego zapinka).
sygnatura = ŁUK CZUJNIKA / PROMIEŃ ((·))       ⟵ koduje jednocześnie czujnik ruchu i rozchodzenie
                                                  się światła; ≠ stitching (zapinek) ≠ znacznik-
                                                  rożek (ssawek). Max 1/sekcję, ten sam kształt;
                                                  przy hooku hero / nagłówku demo / karcie mid-cta /
                                                  CTA final (≥3 sekcje).
akcent-scope = {CTA (żółć+ink) · aktywny tryb w demo · sygnatura łuku · focus/selected}
                                               ⟵ JEDEN akcent UI. Żółto-limonkowa listwa COB
                                                  w ZDJĘCIACH = realny kolor produktu, NIE drugi
                                                  akcent interfejsu; błękity zmierzchu = świat
                                                  foto, nie komponenty.
bounded-mrok = zasada scen                     ⟵ strona jasna #F2F1EC; ciemność TYLKO w bounded
                                                  panelach (hero-pas zmierzchu, mid-cta warsztat,
                                                  final garaż, kafle nocne), krawędzie roztopione
                                                  w papier; ⛔ NIGDY czarna sekcja/chrome, ⛔ zmiana
                                                  koloru snopu na produkcie.
archetyp-hero = D (packshot centralny, poświata radialna, snop w bounded-zmierzch)
                                               ⟵ czysty ŚWIECĄCY packshot c-lit sam niesie
                                                  argument; akcent z realnego światła; cena 14,90
                                                  → najkrótsza sekwencja produkt→cena→CTA.
                                                  ≠ B (zapinek) ≠ C (ssawek).
```

<!-- Blok :root CZYTANY przez gate-check.py --cross-only oraz wklejany 1:1 do ir.root.css w F4. -->
```css
:root{
  --font-display:"Gabarito",system-ui,sans-serif;
  --font-text:"Karla",system-ui,sans-serif;

  --paper:#F2F1EC;  --paper-2:#E6E8E3;  --paper-3:#FFFFFF;
  --ink:#292722;    --body:#3B3833;     --line:#DEDCD3;

  --cta:#D9BE00;    --cta-d:#B89F00;    --cta-ink:#1B1406;
  --trust-pill:#F2F1EC;

  --shadow-sm:0 1px 2px rgba(41,39,34,.06);
  --shadow-md:0 1px 2px rgba(41,39,34,.06), 0 10px 26px rgba(41,39,34,.10);
  --shadow-lg:0 2px 4px rgba(41,39,34,.07), 0 18px 42px rgba(41,39,34,.12);

  --radius-lg:12px; --radius-sm:8px;
  --icon-style:outline; /* stroke 1.75px, kolor --ink */

  --s1:8px; --s2:16px; --s3:24px; --s4:32px; --s5:48px; --s6:64px; --s7:96px;
  --sect-pad-d:112px; --sect-pad-m:72px; --content-w:1180px;

  --h1-d:clamp(56px,7vw,78px); --h1-m:clamp(38px,9vw,44px);
  --body-fs:17px; --body-lh:1.55;

  --gal-aspect:3/2;
}
```

## GRANICE
- Skóra, nie szkielet: mechanika modułów (`MODULY.md`) nietykalna.
- Odchylenie w PARTYTURZE (Gabarito/Karla, żółć COB, ((·)) łuk, radius 12) NIE jest defektem —
  nie „naprawiać do normy" poprzednich landingów. Cofać wolno TYLKO KANON (WCAG/kontrast).
- **CTA żółty MUSI nosić CIEMNY ink #1B1406** (taxi-sign) — biały tekst na #D9BE00 = FAIL kontrastu.
- **Opinie w TYM landingu ISTNIEJĄ** (★4,7/5 · 3095 · 94,6% pozytywnych) — ale WYŁĄCZNIE w sekcji
  `opinie` POD foldem; ⛔ zakaz ★/liczby opinii w hero/sticky/zaufaniu/mid-cta/zamow (KANON „nad foldem").
- **--gal-aspect 3/2** = kadry galerii są LANDSCAPE (latarka pozioma; packshoty c-lit/c-off/c-night
  ~ ultraszerokie, c-splash ~2,5:1, c-worn ~kwadrat) → tile 3/2 z object-fit cover; c-worn obsłużyć
  osobno (kwadrat).
- Bounded-mrok: każdy ciemny panel osadzony NA jasnej stronie z krawędzią roztopioną w #F2F1EC;
  ⛔ pełna czarna sekcja / ciemny chrome strony.
```
```

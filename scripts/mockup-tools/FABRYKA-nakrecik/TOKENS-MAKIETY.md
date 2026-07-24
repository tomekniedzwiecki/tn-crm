# TOKENS-MAKIETY — NAKRĘCIK (magnetyczny uchwyt POV na szyję) · SSOT mikro-tokenów makiety · F2.5 · 2026-07-24

Jeden akapit STYLE-DNA wstrzykiwany do KAŻDEGO promptu makiety. Dwie warstwy: **KANON** (poziom
warsztatu, 1:1 — nietykalny) i **PARTYTURA** (tożsamość Nakręcika, każda pozycja z uzasadnieniem).
Źródło partytury: `PLAN.md` §PARTYTURA (8 pozycji). Plansza DNA: `brand/00-styl-master.png`.

## KANON  (przepisane 1:1 — identyczne w każdym landingu)
```
8pt:     8·16·24·32·48·64·96 · sekcja desktop 112 / mobile 72 · content-w 1180 · kolumna 50–75 zn.
TYPO:    ratio 1.333 · H1 desktop clamp 56–80 · H1 mobile floor 38 · body 17/1.55 · eyebrow caps 0.2em
TŁO:     jasne (wysoka jasność, niskie nasycenie, WCAG dla body) · ⛔ ciemne tła (poza świadomymi scenami), ⛔ neon
AKCENT:  DOKŁADNIE JEDEN, scope {CTA · sygnatura/REC · gwiazdki ★} · ikony funkcjonalne = --ink
FONTY:   para z KONTRASTEM (display ≠ text) · ⛔ mono-font · ⛔ zimny tech jako jedyny krój
SERIA:   jeden radius · jeden styl ikon · jeden styl trust-pill (desktop == mobile)
GŁĘBIA:  cienie warstwowe CIEPŁE/miękkie (key+ambient, tint sepiowy .06–.12, nie czerń) · grain 2–4%
OFERTA:  cena → CTA → redukcja ryzyka · pas zaufania · ⛔ ★/liczby opinii nad foldem
MODUŁY:  mechanika i proporcje z MODULY.md NIETYKALNE (skóra = tokeny)
SYGNATURA: musi istnieć i powtarzać się w ≥3 sekcjach
```

## PARTYTURA  (decyzje TEGO landingu — każda z uzasadnieniem)
```
display   = Space Grotesk (700)               ⟵ produkt tech-twórczy (kamera/POV/creator); geometryczny
                                                 grotesk z „sprzętowym" pazurem i lekką osobowością →
                                                 „gadżet twórcy". ≠ Bricolage (zaklipek) · ≠ Fraunces ·
                                                 ≠ Nunito · ≠ Barlow · ≠ Manrope. Lokalny .ttf. Gate font ✓.
text      = Hanken Grotesk (400/500/600/700)  ⟵ humanist o czytelnych cyfrach do specs (220 g · 16 neodymów ·
                                                 138 mm · 124,90 zł) + ciepły KONTRAST do geometrycznego
                                                 display; latin-ext (PL). ⛔ nie zimny Inter.
accent    = (brak 3. kroju — sygnatura niefontowa: rogi kadru/wizjer + kropka REC)
--paper   #FAF7F1 / #F1ECE3 / #E6DFD3         ⟵ rodzina CIEPŁA NEUTRALNA KOŚĆ: świat realnego życia
                                                 twórcy (kuchnia/dom/plener, dzień) — ciepłe, ludzkie, nie
                                                 studyjny chłód. ≠ chłodna platyna zaklipka. Jasność+WCAG body ✓.
--ink     #20242A   --body #4A4640   --line #E3DBCE
                                              ⟵ ink = ciepły grafit (echo modułu produktu, WCAG 14,6:1);
                                                 body #4A4640 (8,8:1); line ciepła kość (⛔ nie #000, ⛔ nie mgła).
--cta     #12B76A                             ⟵ emerald „ACTION GREEN": WYPROWADZONY z realnego koloru
                                                 produktu = wariant Green (KARTA §4, g5 „Color: Grey, Green")
                                                 + energia GO/nagrywaj. Produkt bazowo achromatyczny (grafit)
                                                 → biorę jedyny chromatyczny sygnał, pushed do żywej ownable
                                                 zieleni (nie blada limonka TELESIN). --cta-ink #06251A
                                                 (WCAG 6,22:1 — dark ink na bright green = pop). ≠ blue/coral recent.
--accent-ink #0A7A4C                          ⟵ deeper emerald do ZIELENI NA BIELI (linki, etykiety, REC dot na
                                                 jasnym) — WCAG 5,0:1 na papierze. Bright #12B76A tylko fill/CTA/★.
--shadow-md  0 1px 2px rgba(40,34,24,.06), 0 10px 26px rgba(40,34,24,.10)
                                              ⟵ świat ciepły → cień miękki, warstwowy, tint SEPIOWY
                                                 rgba(40,34,24,α) (nie twarda czerń); grain 3%.
--radius-lg 18px / --radius-sm 10px  ·  IKONY: outline 1.75px, --ink
                                              ⟵ radius miękki/zaokrąglony = echo miękkiej silikonowej obręczy
                                                 (charakter „friendly, human, creator"); ikony funkcjonalne
                                                 charcoal (magnes / szybkozłączka / tryby / składanie), zero akcentu.
--paper-dark #0E1A14                          ⟵ dark-fallback dla świadomych scen wieczornych (#mid-cta/#final) —
                                                 głęboka zielono-czerń (echo akcentu), NIE domyślne tło sekcji.
sygnatura = wizjer/kadr (rogi ⌐¬) + kropka REC (--accent green)
                                              ⟵ motyw = KADR z Twojej perspektywy: rogi kadru obramowują
                                                 kluczowe sceny + drobna zielona kropka „REC" przy nagłówkach
                                                 akcji; miejscami mini-timecode hairline. ≥3 sekcje (hero, demo,
                                                 zastosowania, final, tryby). Charakter KAMEROWY (⛔ nie swash).
trust-pill = fill --paper (#FAF7F1), border --line (#E3DBCE), tekst --ink — jeden styl globalnie.
--gal-aspect 4/5                              ⟵ zdjęcia kupujących/scen pionowe (~3:4) → kafle 4/5 (⛔ nie
                                                 wciskać w kwadrat — GALERIA-ALI §aspekt).
archetyp-hero = A (full-bleed immersive)      ⟵ produkt = doświadczenie POV → hero wrzuca widza w świat:
                                                 pełnoekranowa scena W TLE + .hero-scrim + copy z-index:3 + karta
                                                 mikro-oferty above-fold (task HERO=TYP A pod hero-video). ≠ B (zaklipek).
```

<!-- Blok :root CZYTANY przez gate-check.py --cross-only (font display + akcent) oraz wklejany 1:1
     do ir.root.css w F4. Nazwy = kontrakt modułów kanonicznych. -->
```css
:root{
  --font-display:"Space Grotesk",'Segoe UI',system-ui,sans-serif;
  --font-text:"Hanken Grotesk",system-ui,-apple-system,sans-serif;

  --paper:#FAF7F1;  --paper-2:#F1ECE3;  --paper-3:#E6DFD3;
  --ink:#20242A;    --body:#4A4640;     --line:#E3DBCE;

  --cta:#12B76A;    --cta-d:#0E9E5A;    --cta-ink:#06251A;
  --accent-ink:#0A7A4C;
  --paper-dark:#0E1A14;
  --trust-pill:#FAF7F1;

  --shadow-sm:0 1px 2px rgba(40,34,24,.06);
  --shadow-md:0 1px 2px rgba(40,34,24,.06), 0 10px 26px rgba(40,34,24,.10);
  --shadow-lg:0 2px 4px rgba(40,34,24,.07), 0 18px 42px rgba(40,34,24,.12);

  --radius-lg:18px; --radius-sm:10px;
  --icon-style:outline; /* stroke 1.75px, kolor --ink */

  --s1:8px; --s2:16px; --s3:24px; --s4:32px; --s5:48px; --s6:64px; --s7:96px;
  --sect-pad-d:112px; --sect-pad-m:72px; --content-w:1180px;

  --h1-d:clamp(56px,7vw,78px); --h1-m:clamp(38px,9vw,44px);
  --body-fs:17px; --body-lh:1.55;

  --gal-aspect:4/5;
}
```

## GRANICE
- Skóra, nie szkielet: mechanika modułów (`MODULY.md`) nietykalna; tokeny to słownik stylu.
- Odchylenie w PARTYTURZE (Space Grotesk display, akcent emerald action-green, tło ciepła kość,
  sygnatura wizjer/REC, archetyp A) NIE jest defektem — ⛔ nie „naprawiać do normy" poprzedniego
  landingu. Cofać wolno TYLKO KANON (WCAG/kontrast).
- KANON w mocy: jasne tło (rodzina ciepła kość), DOKŁADNIE JEDEN akcent (scope CTA/sygnatura/★),
  para fontów z kontrastem, rytm 8pt, ciepła warstwowa głębia, hierarchia oferty, ⛔ ★/liczby
  opinii nad foldem.
- Akcent w scope {CTA · rogi kadru/REC sygnatury · gwiazdki ★}. **Ikony funkcjonalne = --ink
  (charcoal), NIGDY akcent** (magnes / szybkozłączka / tryby / składanie). Liczba ratingu „4,8/5" =
  --font-text charcoal.
- Ciemne tło DOZWOLONE tylko w świadomych scenach wieczornych (#mid-cta/#final) z `--paper-dark` +
  dark-fallback bg (anty biały-błysk przy lazy) — ⛔ NIE jako domyślne tło sekcji sprzedażowej.
- ⛔ Zakaz w copy makiet: „10 000 obrotów" (liczba), „exceeds car-mounted standards", wariant z
  pilotem, wymiary/parametry spoza KARTY; marka „TELESIN", sklep „TELESIN Photography Store".

# TOKENS-MAKIETY — ZAKLIPEK (przyklipsowy hub USB) · SSOT mikro-tokenów makiety (STYLE-DNA) · F2.5 · 2026-07-24

Jeden akapit STYLE-DNA wstrzykiwany do KAŻDEGO promptu makiety (hero, każda sekcja, każda para
mobile). Dwie warstwy: **KANON** (poziom warsztatu, przepisany 1:1 — nietykalny) i **PARTYTURA**
(tożsamość Zaklipka, każda pozycja z uzasadnieniem — bez uzasadnień F2.5 NIEZAMKNIĘTY). Spisany
z planszy DNA `brand/00-styl-master.png`. Źródło partytury: `PLAN.md` §PARTYTURA (8 pozycji).

## KANON  (przepisane 1:1 — identyczne w każdym landingu)
```
8pt:     8·16·24·32·48·64·96 · sekcja desktop 112 / mobile 72 · content-w 1180 · kolumna 50–75 zn.
TYPO:    ratio 1.333 · H1 desktop clamp 56–80 · H1 mobile floor 38 · body 17/1.55 · eyebrow caps 0.2em
TŁO:     jasne (wysoka jasność, niskie nasycenie, WCAG dla body) · ⛔ ciemne tła, ⛔ neon
AKCENT:  DOKŁADNIE JEDEN, scope {CTA · swash/sygnatura · gwiazdki ★} · ikony funkcjonalne = --ink
FONTY:   para z KONTRASTEM (display ≠ text) · ⛔ mono-font · ⛔ zimny tech jako jedyny krój
SERIA:   jeden radius · jeden styl ikon · jeden styl trust-pill (desktop == mobile)
GŁĘBIA:  cienie warstwowe CIEPŁE/miękkie (key+ambient, tint sepiowy/łupkowy .06–.12, nie czerń) · grain 2–4%
OFERTA:  cena → CTA → redukcja ryzyka · pas zaufania · ⛔ ★/liczby opinii nad foldem
MODUŁY:  mechanika i proporcje z MODULY.md NIETYKALNE (skóra = tokeny)
SYGNATURA: musi istnieć i powtarzać się w ≥3 sekcjach
```

## PARTYTURA  (decyzje TEGO landingu — każda z uzasadnieniem)
```
display   = Bricolage Grotesque (700/800)     ⟵ aluminiowa listwa o kanciastym, maszynowo ciętym
                                                 profilu → charakterny grotesk z „inżynierskim"
                                                 pazurem; ≠ Gabarito (home-ulepszek) · ≠ Quicksand
                                                 (home-zaradek) · ≠ Barlow Semi Cond. (ssawek). Gate font ✓.
text      = Figtree (400/500/700)             ⟵ czysty humanist o wąskich, równych cyfrach do gęstych
                                                 specs (4 porty · 5 Gbps · 5–28 mm · 34,90 zł) + ciepły
                                                 KONTRAST do charakternego display; ⛔ nie zimny Inter/Helvetica.
accent    = (brak 3. kroju — sygnatura S3 niefontowa: linia krawędzi + ticki)
--paper   #F7F8FA / #EEF0F4 / #E1E5EC         ⟵ rodzina CHŁODNA BIEL / PLATYNA: świat czystego,
                                                 nowoczesnego desk-setupu + szczotkowane aluminium
                                                 (TOKENS mapping „tech/clean → chłodna biel"); ≠ ciepły
                                                 piasek ssawka. Wysoka jasność + niskie nasycenie + WCAG body ✓.
--ink     #1C2530   --body #38424E   --line #D5DAE2
                                              ⟵ ink = chłodny grafit (echo grafitowego panelu portów);
                                                 body #38424E z kontrastem (⛔ nie #000, ⛔ nie mgła).
--cta     #0A6EBD                             ⟵ WYPROWADZONY z realnego koloru produktu = NIEBIESKIE
                                                 wnętrza gniazd USB 3.0 (kanon „USB SuperSpeed blue");
                                                 srebro/aluminium achromatyczne → biorę jedyny chromatyczny
                                                 sygnał produktu, który dodatkowo mówi „to prawdziwe USB 3.0".
                                                 --cta-ink #FFFFFF (WCAG 5,28:1); ΔE ≥ 41 vs 3 poprzednie. Gate akcent ✓.
--shadow-md  0 1px 2px rgba(20,35,60,.06), 0 10px 26px rgba(20,35,60,.10)
                                              ⟵ świat chłodny → cień miękki, warstwowy, tint ŁUPKOWY
                                                 rgba(20,35,60,α) (nie twarda czerń); grain 3%.
--radius-lg 14px / --radius-sm 8px  ·  IKONY: outline 1.75px, --ink
                                              ⟵ radius zwarty/precyzyjny = echo maszynowo ciętej krawędzi
                                                 aluminium (charakter „engineered but tidy"); ikony
                                                 funkcjonalne charcoal (klips / USB-A / 4 porty / DC 5V), zero akcentu.
sygnatura = S3 „linia krawędzi" + ticki kalibracji (skala 5–28 mm)
                                              ⟵ motyw = KRAWĘDŹ biurka: ciągła linia 1px (krawędź)
                                                 obejmująca/przecinająca sekcje, miejscami ze skalą/tickami
                                                 = echo regulacji zacisku 5–28 mm; ≥3 sekcje (hero baseline,
                                                 demo step-rule, `zacisk` caliper, dividery). ≠ S6 rożek ssawka.
                                                 Charakter TECHNICZNY (⛔ nie swash odręczny).
trust-pill = fill --paper (#F7F8FA), border --line (#D5DAE2), tekst --ink — jeden styl globalnie.
archetyp-hero = B (split 55/45)               ⟵ Zaklipek wymaga JEDNEGO ZDANIA wyjaśnienia („hub na
                                                 klips do krawędzi biurka" — kategoria mało znana); B =
                                                 copy tłumaczy mechanizm słowem po lewej + scena po prawej.
                                                 ≠ archetyp każdego z ostatnich (C ssawek · D · H · F).
```

<!-- Blok :root CZYTANY przez gate-check.py --cross-only (font display + akcent) oraz wklejany 1:1
     do ir.root.css w F4 (SEKCJA-Z-MAKIETY). Nazwy = kontrakt modułów kanonicznych. -->
```css
:root{
  --font-display:"Bricolage Grotesque",'Segoe UI',system-ui,sans-serif;
  --font-text:"Figtree",system-ui,-apple-system,sans-serif;

  --paper:#F7F8FA;  --paper-2:#EEF0F4;  --paper-3:#E1E5EC;
  --ink:#1C2530;    --body:#38424E;     --line:#D5DAE2;

  --cta:#0A6EBD;    --cta-d:#085A9B;    --cta-ink:#FFFFFF;
  --trust-pill:#F7F8FA;

  --shadow-sm:0 1px 2px rgba(20,35,60,.06);
  --shadow-md:0 1px 2px rgba(20,35,60,.06), 0 10px 26px rgba(20,35,60,.10);
  --shadow-lg:0 2px 4px rgba(20,35,60,.07), 0 18px 42px rgba(20,35,60,.12);

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
- Odchylenie w PARTYTURZE (Bricolage display, akcent SuperSpeed-blue, tło chłodna biel/platyna, sygnatura
  S3 linia krawędzi) NIE jest defektem — ⛔ nie „naprawiać do normy" poprzedniego landingu. Cofać wolno
  TYLKO KANON (WCAG/kontrast).
- KANON w mocy: jasne tło (rodzina chłodna biel/platyna), DOKŁADNIE JEDEN akcent (scope CTA/sygnatura/★),
  para fontów z kontrastem, rytm 8pt, chłodna warstwowa głębia, hierarchia oferty, ⛔ ★/liczby opinii nad foldem.
- Akcent #0A6EBD w scope {CTA · linia-krawędź/tick sygnatury · gwiazdki ★}. **Ikony funkcjonalne = --ink
  (charcoal), NIGDY akcent** (klips / USB-A / 4 porty / DC 5V). Liczba ratingu „4,6/5" = --font-text charcoal.
- ⛔ Zakaz claimów innych wariantów w copy makiet: „10 Gbps"/„USB 3.2 Gen2", „7-in-1", „czytnik SD/TF",
  „HDMI/4K", „12TB", wymiary/waga; marka „Eswirepro"/„ORICO" (KARTA-PRAWDY §CONSTRAINTS).

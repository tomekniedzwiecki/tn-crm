# TOKENS-MAKIETY — LŚNIK (listwa LED ambient do bagażnika) · SSOT mikro-tokenów makiety (STYLE-DNA) · F2.5 · 2026-07-24

Jeden akapit STYLE-DNA wstrzykiwany do KAŻDEGO promptu makiety (hero, każda sekcja, każda para
mobile). Dwie warstwy: **KANON** (poziom warsztatu, przepisany 1:1 — nietykalny) i **PARTYTURA**
(tożsamość Lśnika, każda pozycja z uzasadnieniem — bez uzasadnień F2.5 NIEZAMKNIĘTY). Spisany
z planszy DNA `brand/00-styl-master.png`. Źródło partytury: `PLAN.md` §PARTYTURA (8 pozycji).

## KANON  (przepisane 1:1 — identyczne w każdym landingu)
```
8pt:     8·16·24·32·48·64·96 · sekcja desktop 112 / mobile 72 · content-w 1180 · kolumna 50–75 zn.
TYPO:    ratio 1.333 · H1 desktop clamp 56–80 · H1 mobile floor 38 · body 17/1.55 · eyebrow caps 0.2em
TŁO:     jasne (wysoka jasność, niskie nasycenie, WCAG dla body) · ⛔ ciemne tła, ⛔ neon
AKCENT:  DOKŁADNIE JEDEN, scope {CTA · świetlna linia-sygnatura · gwiazdki ★} · ikony funkcjonalne = --ink
FONTY:   para z KONTRASTEM (display ≠ text) · ⛔ mono-font · ⛔ zimny tech jako jedyny krój
SERIA:   jeden radius · jeden styl ikon · jeden styl trust-pill (desktop == mobile)
GŁĘBIA:  cienie warstwowe CIEPŁE/miękkie (key+ambient, tint sepiowy .06–.12, nie czerń) · grain 2–4%
OFERTA:  cena → CTA → redukcja ryzyka · pas zaufania · ⛔ ★/liczby opinii nad foldem
MODUŁY:  mechanika i proporcje z MODULY.md NIETYKALNE (skóra = tokeny)
SYGNATURA: musi istnieć i powtarzać się w ≥3 sekcjach
```

## PARTYTURA  (decyzje TEGO landingu — każda z uzasadnieniem)
```
display   = Montserrat (800/900)              ⟵ produkt automotive/premium → geometryczny, pewny grotesk
                                                 o mocnej obecności przy dużych rozmiarach; ≠ Fraunces
                                                 (migotek) · ≠ Space Grotesk (nakrecik) · ≠ Bricolage
                                                 (zaklipek). Gate font ✓.
text      = Mulish (400/600/800)              ⟵ humanist o czystych cyfrach do liczb (34,90 zł · 2M ·
                                                 12V · ★4,6/16) + ciepły KONTRAST do geometrycznego
                                                 display; ⛔ nie zimny Inter/Helvetica.
accent    = (brak 3. kroju — sygnatura niefontowa: świetlna linia obrysu)
--paper   #F7F4EF / #EFE9E1 / #E3DBCE         ⟵ rodzina CIEPŁY KAMIEŃ / GREIGE: świat premium-automotive
                                                 (jasny beton/showroom, ciepła neutralność); ⛔ NIE krem
                                                 (≠ migotek), ⛔ NIE chłodna platyna (≠ zaklipek).
                                                 Wysoka jasność + niskie nasycenie + WCAG body ✓.
--ink     #22201D   --body #3A362F   --line #DAD1C2
                                              ⟵ ink = ciepły grafit; body #3A362F kontrast 10,95:1 na
                                                 paper (⛔ nie #000, ⛔ nie mgła).
--cta     #C21F30                             ⟵ CZERWIEŃ LAMP TYLNYCH auta = realny sygnał chromatyczny
                                                 ŚWIATA (g0/rev0/g6 pokazują świecącą czerwień tylnych
                                                 świateł obok listwy). Światło produktu białe/ciepłe
                                                 (achromatyczne / amber kolidujący z migotkiem ΔE<15) →
                                                 biorę kolor ze świata. --cta-ink #FFFFFF (kontrast 5,94:1);
                                                 ΔE(min) 58,8 vs 3 poprzednie. Gate akcent ✓.
--shadow-md  0 1px 2px rgba(60,40,20,.06), 0 10px 26px rgba(60,40,20,.10)
                                              ⟵ świat ciepły → cień miękki, warstwowy, tint sepiowo-brązowy
                                                 rgba(60,40,20,α) (nie twarda czerń); grain 3%.
--radius-lg 18px / --radius-sm 10px  ·  IKONY: outline 1.75px, --ink
                                              ⟵ radius łagodnie zaokrąglony = echo miękkiej, giętkiej
                                                 silikonowej taśmy (nie kanciasty tech); ikony funkcjonalne
                                                 charcoal (klapa / listwa / czujnik / kropla / 12V), zero akcentu.
sygnatura = „ŚWIETLNA LINIA OBRYSU" (S3-var) + subtelny blask
                                              ⟵ motyw = świetlny obrys bagażnika: ciągła linia 1px
                                                 z delikatnym blaskiem (echo listwy LED) obejmująca/
                                                 przecinająca sekcje, miejscami „zapalona" w akcencie;
                                                 ≥3 sekcje (hero baseline, rozwiązanie, demo, dividery).
                                                 Charakter ŚWIETLNY (⛔ nie swash odręczny).
trust-pill = fill --paper (#F7F4EF), border --line (#DAD1C2), tekst --ink — jeden styl globalnie.
archetyp-hero = C (karta nachodząca na scenę)  ⟵ produkt impulsowy (Reels, ~90% mobile), scena
                                                 świecącego bagażnika = argument; scena u góry (bohater),
                                                 karta mikro-oferty wjeżdża na jej dół (fold z ceną).
                                                 ≠ archetyp A migotka (bezpośrednio poprzedni) i B zaklipka.
```

<!-- Blok :root CZYTANY przez gate-check.py --cross-only (font display + akcent) oraz wklejany 1:1
     do ir.root.css w F4 (SEKCJA-Z-MAKIETY). Nazwy = kontrakt modułów kanonicznych. -->
```css
:root{
  --font-display:"Montserrat",'Segoe UI',system-ui,sans-serif;
  --font-text:"Mulish",system-ui,-apple-system,sans-serif;

  --paper:#F7F4EF;  --paper-2:#EFE9E1;  --paper-3:#E3DBCE;
  --ink:#22201D;    --body:#3A362F;     --line:#DAD1C2;

  --cta:#C21F30;    --cta-d:#A81828;    --cta-ink:#FFFFFF;
  --trust-pill:#F7F4EF;

  --shadow-sm:0 1px 2px rgba(60,40,20,.06);
  --shadow-md:0 1px 2px rgba(60,40,20,.06), 0 10px 26px rgba(60,40,20,.10);
  --shadow-lg:0 2px 4px rgba(60,40,20,.07), 0 18px 42px rgba(60,40,20,.12);

  --radius-lg:18px; --radius-sm:10px;
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
- Odchylenie w PARTYTURZE (Montserrat display, akcent czerwień lamp, tło ciepły kamień, sygnatura
  „świetlna linia obrysu", archetyp C) NIE jest defektem — ⛔ nie „naprawiać do normy" poprzedniego
  landingu. Cofać wolno TYLKO KANON (WCAG/kontrast).
- KANON w mocy: jasne tło (rodzina ciepły kamień), DOKŁADNIE JEDEN akcent (scope CTA/sygnatura/★),
  para fontów z kontrastem, rytm 8pt, ciepła warstwowa głębia, hierarchia oferty, ⛔ ★/liczby opinii nad foldem.
- Akcent #C21F30 w scope {CTA · świetlna linia-sygnatura · gwiazdki ★}. **Ikony funkcjonalne = --ink
  (charcoal), NIGDY akcent** (klapa / listwa / czujnik / kropla-wodoodporność / 12V). Liczba ratingu
  „4,6/5" = --font-text charcoal.
- ⛔ Zakaz w copy makiet: RGB/tęcza/„16 mln kolorów", pilot/apka/Bluetooth/tryby, „X diod"/adresowalne
  piksele, 4M (poza marżą), wymiary/waga/lumeny/W (brak danych); marka „Changan"/tablica (KARTA §CONSTRAINTS).
```
```

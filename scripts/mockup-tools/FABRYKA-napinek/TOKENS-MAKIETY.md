# TOKENS-MAKIETY — NAPINEK (sprężynowy trener ramion i klatki) · SSOT mikro-tokenów makiety · F2.5 · 2026-07-24

Jeden akapit STYLE-DNA wstrzykiwany do KAŻDEGO promptu makiety (hero, każda sekcja, każda para
mobile). Dwie warstwy: **KANON** (poziom warsztatu, 1:1 — nietykalny) i **PARTYTURA** (tożsamość
Napinka, każda pozycja z uzasadnieniem). Spisany z planszy DNA `brand/00-styl-master.png`. Źródło
partytury: `PLAN.md` §PARTYTURA (8 pozycji).

## KANON  (przepisane 1:1 — identyczne w każdym landingu)
```
8pt:     8·16·24·32·48·64·96 · sekcja desktop 112 / mobile 72 · content-w 1180 · kolumna 50–75 zn.
TYPO:    ratio 1.333 · H1 desktop clamp 56–80 · H1 mobile floor 38 · body 17/1.55 · eyebrow caps 0.2em
TŁO:     jasne (wysoka jasność, niskie nasycenie, WCAG dla body) · ⛔ ciemne tła, ⛔ neon
AKCENT:  DOKŁADNIE JEDEN, scope {CTA · sygnatura/łuk+liczby · gwiazdki ★} · ikony funkcjonalne = --ink
FONTY:   para z KONTRASTEM (display ≠ text) · ⛔ mono-font · ⛔ zimny tech jako jedyny krój
SERIA:   jeden radius · jeden styl ikon · jeden styl trust-pill (desktop == mobile)
GŁĘBIA:  cienie warstwowe CIEPŁE/miękkie (key+ambient, tint sepiowy/mchowy .06–.12, nie czerń) · grain 2–4%
OFERTA:  cena → CTA → redukcja ryzyka · pas zaufania · ⛔ ★/liczby opinii nad foldem
MODUŁY:  mechanika i proporcje z MODULY.md NIETYKALNE (skóra = tokeny)
SYGNATURA: musi istnieć i powtarzać się w ≥3 sekcjach
```

## PARTYTURA  (decyzje TEGO landingu — każda z uzasadnieniem)
```
display   = Barlow Semi Condensed (800/700)   ⟵ produkt ATLETYCZNY/SIŁOWY → kondensowany, mocny
                                                 grotesk o „sportowej", jerseyowej energii (napięcie,
                                                 siła); ≠ Fraunces (migotek) · ≠ Space Grotesk
                                                 (nakrecik) · ≠ Bricolage (zaklipek). Gate font ✓.
text      = Mulish (400/600/800)              ⟵ humanist o czytelnych, równych cyfrach do liczb
                                                 siłowych (60/75/90 lbs · 67 cm · 144,90 zł) + ciepły
                                                 KONTRAST do kondensowanego display; ⛔ nie zimny Inter.
accent    = (brak 3. kroju — sygnatura S5 niefontowa: wielkie liczby 60/75/90 + 01/02/03 + łuk napięcia)
--paper   #F5F7F5 / #E9EDE9 / #DCE4DE         ⟵ rodzina CHŁODNY LEN / JASNY POPIEL z NUTĄ ZIELENI:
                                                 świat domowego treningu, energiczny ale JASNY i czysty
                                                 (ICP: ⛔ nie ciemna siłownia). Zielono-szary undertone
                                                 rymuje z turkusowym akcentem; ≠ chłodna-niebieska
                                                 platyna zaklipka. Wysoka jasność + niskie nasycenie + WCAG body ✓.
--ink     #1C2723   --body #37423C   --line #D3DDD5
                                              ⟵ ink = grafit o ciepło-zielonej temperaturze (echo świata);
                                                 body #37423C z kontrastem (⛔ nie #000, ⛔ nie mgła).
--cta     #0F766E                             ⟵ WYPROWADZONY z realnego koloru produktu = MIĘTOWE/
                                                 TURKUSOWE pierścienie uchwytów (jedyny chromatyczny sygnał;
                                                 czerń/chrom achromatyczne). Kontrolowana pochodna
                                                 (przyciemniona) dla kontrastu. --cta-ink #FFFFFF (WCAG 5,47:1);
                                                 ΔE ≥ 33 vs 3 poprzednie. Gate akcent ✓.
--shadow-md  0 1px 2px rgba(20,45,35,.06), 0 10px 26px rgba(20,45,35,.10)
                                              ⟵ świat naturalny → cień miękki, warstwowy, tint MCHOWY
                                                 rgba(20,45,35,α) (nie twarda czerń); grain 3%.
--radius-lg 12px / --radius-sm 6px  ·  IKONY: outline 2px, --ink
                                              ⟵ radius zwarty/precyzyjny = charakter „engineered,
                                                 performance" (sprzęt siłowy); stroke 2px = odrobinę
                                                 mocniejszy (atletyczny); ikony funkcjonalne charcoal
                                                 (sprężyna / pianka / partie / poziomy), zero akcentu.
sygnatura = S5 „wielkie liczby-jako-grafika" (60·75·90 poziomy oporu + 01/02/03 kroki demo) + łuk napięcia 1px
                                              ⟵ motyw = PROGRES OPORU i NAPIĘCIE: wielkie atletyczne
                                                 cyfry (Barlow) jako element graficzny WEWNĄTRZ sekcji
                                                 (⛔ NIGDY numeracja sekcji „01/17") + subtelny łuk 1px
                                                 (echo zgiętego drążka); ≥3 sekcje (hero łuk, demo 01-02-03,
                                                 poziomy 60/75/90, mid-cta). ≠ S3 linia zaklipka · ≠ swash migotka.
trust-pill = fill --paper (#F5F7F5), border --line (#D3DDD5), tekst --ink — jeden styl globalnie.
archetyp-hero = C (karta nachodząca na scenę)  ⟵ Napinek sprzedaje WIDOCZNY WYSIŁEK + mocną, ale
                                                 przystępną cenę; kategoria znana → nie split (B). Scena
                                                 repu u góry + karta mikro-oferty NACHODZĄCA na dół.
                                                 ≠ A (migotek — bezpośredni poprzednik) · ≠ B (zaklipek).
```

<!-- Blok :root CZYTANY przez gate-check.py --cross-only (font display + akcent) oraz wklejany 1:1
     do ir.root.css w F4 (SEKCJA-Z-MAKIETY). Nazwy = kontrakt modułów kanonicznych. -->
```css
:root{
  --font-display:"Barlow Semi Condensed",'Segoe UI',system-ui,sans-serif;
  --font-text:"Mulish",system-ui,-apple-system,sans-serif;

  --paper:#F5F7F5;  --paper-2:#E9EDE9;  --paper-3:#DCE4DE;
  --ink:#1C2723;    --body:#37423C;     --line:#D3DDD5;

  --cta:#0F766E;    --cta-d:#0B5F58;    --cta-ink:#FFFFFF;
  --trust-pill:#F5F7F5;

  --shadow-sm:0 1px 2px rgba(20,45,35,.06);
  --shadow-md:0 1px 2px rgba(20,45,35,.06), 0 10px 26px rgba(20,45,35,.10);
  --shadow-lg:0 2px 4px rgba(20,45,35,.07), 0 18px 42px rgba(20,45,35,.12);

  --radius-lg:12px; --radius-sm:6px;
  --icon-style:outline; /* stroke 2px, kolor --ink */

  --s1:8px; --s2:16px; --s3:24px; --s4:32px; --s5:48px; --s6:64px; --s7:96px;
  --sect-pad-d:112px; --sect-pad-m:72px; --content-w:1180px;

  --h1-d:clamp(56px,7vw,78px); --h1-m:clamp(38px,9vw,44px);
  --body-fs:17px; --body-lh:1.55;

  --gal-aspect:1/1;
}
```

## GRANICE
- Skóra, nie szkielet: mechanika modułów (`MODULY.md`) nietykalna; tokeny to słownik stylu.
- Odchylenie w PARTYTURZE (Barlow display, akcent turkus, tło chłodny len/popiel-zieleń, sygnatura
  S5 liczby) NIE jest defektem — ⛔ nie „naprawiać do normy" poprzedniego landingu. Cofać wolno TYLKO KANON.
- KANON w mocy: jasne tło, DOKŁADNIE JEDEN akcent (scope CTA/liczby-łuk/★), para fontów z kontrastem,
  rytm 8pt, ciepła/mchowa warstwowa głębia, hierarchia oferty, ⛔ ★/liczby opinii nad foldem.
- Akcent #0F766E w scope {CTA · liczby-sygnatura/łuk · gwiazdki ★}. **Ikony funkcjonalne = --ink
  (charcoal), NIGDY akcent** (sprężyna / pianka / partie / poziomy). Liczba ratingu „4,8/5" = --font-text charcoal.
- ⛔ Zakaz w copy makiet: „6+ mięśni" jako liczba, „cardio/spalanie tłuszczu", waga kg, NIEBIESKI
  wariant, marka „Rbefeuly"/„HOTWAVE", sklep „Worldly Collective Store" (KARTA-PRAWDY §CONSTRAINTS).

# TOKENS-MAKIETY — Brzuszek (STYLE-DNA landingu) · F2.5

## KANON  (przepisane 1:1 — identyczne w każdym landingu)
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

## PARTYTURA  (decyzje TEGO landingu — każda z uzasadnieniem)
display   = Archivo (Expanded/SemiExpanded 700/800) ⟵ plakat sportowy bez agresji siłowni:
                                              energia serii w szerokich literach;
                                              ≠ Gabarito/Bricolage/Space Grotesk/Zilla Slab
text      = Figtree (400/600/700)           ⟵ okrągły, ciepły, świetnie czytelny przy
                                              skanowaniu obiekcji/FAQ/checkoutu na mobile
accent(swash) = kreska-podkreślenie prosta   ⟵ energia „odhaczonej serii" — zdecydowana,
                (nie łuk; grubość 3px)         pozioma, jak zaliczona kreska na liczniku
--paper   #F7F5FB / #F0ECF7 / #FFFFFF       ⟵ rodzina LILA-MGŁA ROZBIELONA (chłodna!):
                                              spokój domowej regularności; NIGDY ciepły
                                              pudrowy róż (anty-dryf do skrolika)
--ink     #241E2E   --body #38323F   --line #DCD5E8
--cta     #A21CAF                           ⟵ fuksja-FIOLET „energia treningu"; komplement
                                              różu wałków bez cukierka; ΔE≥15 vs #B4265C
                                              (malina skrolika — hue 337° vs nasz 295°),
                                              #176B3A, #0B6B64, #E8590C
                                              --cta-ink #FFFFFF · --cta-hover #86158F
--shadow-md  0 1px 2px rgba(45,35,60,.05), 0 10px 26px rgba(70,45,30,.09)
                                            ⟵ ciepły ambient (kanon) na chłodnej lila palecie
--radius-lg 24px / --radius-sm 12px         ⟵ miękki, domowy charakter (wałki piankowe,
                                              kobiecy świat); kontra do kanciastego 12/8
                                              Rozmrozika
IKONY: outline 1.75px, kolor --ink · trust-pill: fill #FFFFFF, border 1px --line, tekst --ink
sygnatura = S-„pasek powtórzeń": 5 krótkich segmentów 16×3px w rzędzie (gap 4px) pod eyebrow,
            segmenty 1-4 = #C9C2D6, segment 5 = --cta (ostatnia kreska serii „zaliczona")
            + DUŻE LICZBY (5 · 2 · ≈200 kg) jako grafika typograficzna w Archivo 800
                                            ⟵ rytm serii ↔ 5 wysokości; liczby = najmocniejszy
                                              dowód Karty (regulacja + udźwig)
archetyp-hero = C (karta nachodząca na scenę) ⟵ impuls Reels + fold z ceną na mobile;
                                              ≠ F (rozmrozik), ≠ B/H/A (poprzednie)

## :root (do briefów F4 — hexy wiążące)
```css
:root{
  --paper:#F7F5FB; --paper-2:#F0ECF7; --card:#FFFFFF;
  --ink:#241E2E; --body:#38323F; --line:#DCD5E8;
  --cta:#A21CAF; --cta-hover:#86158F; --cta-ink:#FFFFFF; --seg:#C9C2D6;
  --radius-lg:24px; --radius-sm:12px;
  --shadow-md:0 1px 2px rgba(45,35,60,.05), 0 10px 26px rgba(70,45,30,.09);
  --font-display:"Archivo",system-ui,sans-serif;   /* nagłówki: font-stretch 125%, 700/800 */
  --font-text:"Figtree",system-ui,sans-serif;
}
```

## Akapit STYLE-DNA do promptów makiet (EN, wklejać 1:1)
STYLE-DNA: cool whitened-lilac page #F7F5FB with section bands #F0ECF7 and white cards
#FFFFFF (NEVER warm powder pink); ink #241E2E, body #38323F, hairlines #DCD5E8; EXACTLY ONE
accent fuchsia-violet #A21CAF used ONLY for the CTA button, a straight bold underline-swash
under one headline word, and the LAST segment of the signature "rep bar" (a row of five short
16x3px dashes under section eyebrows — four muted lilac #C9C2D6, the fifth fuchsia-violet);
all functional icons thin 1.75px outline in ink; display font Archivo Expanded (wide sporty
poster sans, weights 700-800) for headlines, prices and BIG numbers (5 · 2 · ≈200 kg); text
font Figtree; one series radius 24px (cards) / 12px (small); trust-pills: white fill, 1px
hairline border, ink text; soft layered warm-ambient shadows, subtle grain on bands only;
light backgrounds only; the machine ALWAYS white frame + pink foam rollers. Polish diacritics
correct. No watermarks, no phone frames, crisp UI.

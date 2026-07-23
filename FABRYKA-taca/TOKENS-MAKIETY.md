# TOKENS-MAKIETY — Rozmrozik (STYLE-DNA landingu) · F2.5

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
display   = Zilla Slab (600/700)            ⟵ ciepły slab „kuchennego konkretu": urządzenie ma
                                              czytać się jak praktyczne wyposażenie domu, nie
                                              zimny gadżet; ≠ Gabarito/Bricolage/Space Grotesk
text      = Instrument Sans (400/500/700)   ⟵ neutralny, świetnie czytelny na mobile przy
                                              skanowaniu FAQ/checkoutu; wyraźny kontrast do slabu
accent(swash) = Zilla Slab Italic (600)     ⟵ swash z rodziny display — spójność bez 3. kroju
--paper   #F2F7FA / #EAF1F6 / #FFFFFF       ⟵ rodzina LODOWY BŁĘKIT ROZBIELONY: narracja rusza
                                              od zamrożenia; jasna, domowa, WCAG dla body
--ink     #232A31   --body #2E3740   --line #CFDCE6
--cta     #E8590C                           ⟵ mandarynka = „ciepło odwilży"; jedyny ciepły kolor
                                              na stronie (kontrast z lodowym tłem prowadzi wzrok
                                              do akcji); ΔE≥15 vs #B4265C/#176B3A/#0B6B64
                                              --cta-ink #FFFFFF (WCAG 4.6:1)
--shadow-md  0 1px 2px rgba(40,55,70,.05), 0 10px 26px rgba(80,50,20,.09)
                                            ⟵ ciepły ambient (kanon) na chłodnej palecie:
                                              tint sepiowy tylko w warstwie dużego rozmycia
--radius-lg 12px / --radius-sm 8px          ⟵ techniczno-domowy charakter; mniejszy niż
                                              zaokrąglone 20-24 poprzedników (slab lubi kant)
IKONY: outline 1.75px, kolor --ink · trust-pill: fill #FFFFFF, border 1px --line, tekst --ink
sygnatura = S-„pasek odwilży": hairline 2px gradient #9BB8CE→#E8590C pod eyebrow (≥3 sekcje)
            + DUŻE LICZBY (4,2 L · 4) jako grafika typograficzna w Zilla Slab
                                            ⟵ pojemność to najmocniejszy dowód Karty; linia
                                              zimno→ciepło niesie motyw „odwilży"
archetyp-hero = F (dyptyk ZAMROŻONE|ROZMROŻONE) ⟵ różnica stanów szybsza niż opis techniczny;
                                              ≠ B (skrolik), ≠ H (odsaczek), ≠ A (ugniatek)

## :root (do briefów F4 — hexy wiążące)
```css
:root{
  --paper:#F2F7FA; --paper-alt:#EAF1F6; --card:#FFFFFF;
  --ink:#232A31; --body:#2E3740; --line:#CFDCE6;
  --cta:#E8590C; --cta-ink:#FFFFFF; --cold:#9BB8CE;
  --radius-lg:12px; --radius-sm:8px;
  --shadow-md:0 1px 2px rgba(40,55,70,.05), 0 10px 26px rgba(80,50,20,.09);
  --font-display:"Zilla Slab",Georgia,serif;
  --font-text:"Instrument Sans",system-ui,sans-serif;
}
```

## Akapit STYLE-DNA do promptów makiet (EN, wklejać 1:1)
STYLE-DNA: icy pale-blue page #F2F7FA with section bands #EAF1F6 and white cards #FFFFFF;
ink #232A31, body #2E3740, hairlines #CFDCE6; EXACTLY ONE accent burnt-tangerine #E8590C used
ONLY for the CTA button, a thin italic underline-swash under one headline word, and the warm
end of the signature "thaw line" (a 2px hairline gradient from icy blue #9BB8CE to tangerine
#E8590C under section eyebrows); all functional icons thin 1.75px outline in ink; display font
Zilla Slab (warm sturdy slab serif) for headlines, prices and BIG numbers (4,2 L · 4); text
font Instrument Sans; one series radius 12px; trust-pills: white fill, 1px hairline border,
ink text; soft layered warm-ambient shadows, subtle grain on bands only; light backgrounds
only. Polish diacritics correct. No watermarks, no phone frames, crisp UI.

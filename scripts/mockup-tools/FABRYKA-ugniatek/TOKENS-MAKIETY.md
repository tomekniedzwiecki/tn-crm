# TOKENS-MAKIETY — UGNIATEK (F2.5; STYLE-DNA wstrzykiwane do KAŻDEGO promptu makiety)

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
display   = Space Grotesk (500/700)      ⟵ geometryczno-techniczny: narracja „anatomia urządzenia"
                                            (6 głowic, panel P1–P9); ≠ Baloo 2 (Odprężek, Drapek),
                                            ≠ Fraunces (Kłujek) — gate cross_landing czysty
text      = Work Sans (400/600)          ⟵ humanist sans, pełny latin-ext; rymuje z geometrią
                                            Groteska, ale rozróżnialny na pierwszy rzut oka
accent(swash) = BRAK                     ⟵ świadomie: swash kłóci się z technicznym charakterem;
                                            rolę akcentu wydawniczego niosą calloutsy (sygnatura)
--paper   #EEF1F2 / #E6EBEC / #DCE2E4    ⟵ rodzina CHŁODNA BIEL „porcelanowa mgła": koresponduje
                                            z Misty Gray produktu; PIERWSZY chłodny landing fabryki
                                            (poprzednie: krem ×2, glina rozbielona)
--ink     #14211F                        ⟵ prawie-czerń o CHŁODNEJ temperaturze rodziny tła
--body    #26312F                        ⟵ grafit-zieleń, WCAG na #EEF1F2 (kontrast ~10:1)
--line    #CBD5D8                        ⟵ rodzina tła przyciemniona o 2 kroki (nie szary neutralny)
--cta     #0B6B64 (petrol)               ⟵ produkt ACHROMATYCZNY (Misty Gray) → akcent nie z produktu,
                                            tylko z chłodnego świata regeneracji; ΔE wobec pomarańczu
                                            #D97716 / amberu #E0954A / śliwki #5E3A6E >> 15;
                                            --cta-ink #FFFFFF (kontrast ~6.3:1)
--trust-pill = fill --paper · border --line · tekst --ink   (KANON, jeden styl globalnie)
--shadow-md  0 1px 2px rgba(20,40,45,.05), 0 10px 26px rgba(20,40,45,.09)
                                         ⟵ warstwowe miękkie; tint CHŁODNY grafitowo-morski —
                                            odcień tintu podąża za rodziną tła (jak szałwia w SSOT),
                                            nie sepiowy-na-siłę na porcelanie
--grain   feTurbulence baseFrequency ~.9, opacity .03
--radius-lg 10px / --radius-sm 6px       ⟵ techniczny, „inżynierski" kant; ≠ 20px poprzedników
IKONY:    outline, stroke 1.5px, kolor --ink   ⟵ spójne z hairline-calloutsami sygnatury
sygnatura = techniczne CALLOUTSY „anatomii" (hairline 1px + kropka końcowa + mikro-etykieta,
            wariant pokrewny S2/S3)      ⟵ motyw przewodni „anatomia Ugniatka"; poprzedni landing
                                            (Kłujek) miał S5 dużą liczbę — rozjazd zachowany
archetyp-hero = F (dyptyk)               ⟵ dwie formy użycia (docisk ↔ oparcie) = argument
                                            sprzedażowy; ≠ D (Kłujek, bezpośrednio poprzedni)

## AKAPIT STYLE-DNA DO PROMPTÓW MAKIET (wklejać VERBATIM)
STYLE-DNA: cool porcelain-mist page #EEF1F2 with panels #E6EBEC and near-white cards; ink #14211F,
body text #26312F, hairlines #CBD5D8; EXACTLY ONE accent color petrol #0B6B64 used ONLY for CTA
buttons (white label) — all functional icons thin 1.5px outline in ink, never petrol; display font
Space Grotesk (geometric-technical, headlines and big numbers), text font Work Sans (labels, body);
one series radius 10px on all cards/media; trust-pills: paper fill, 1px hairline border, ink text;
soft layered cool-tinted shadows rgba(20,40,45,.05–.09), subtle 3% grain; signature detail:
thin engineering callout lines with end dots and tiny labels pointing at product features,
repeated across sections; generous whitespace, 8pt rhythm, light backgrounds only, no dark sections.

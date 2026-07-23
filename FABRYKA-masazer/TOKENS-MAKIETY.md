# TOKENS-MAKIETY — Rozgrzewek (STYLE-DNA landingu) · F2.5

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
display   = Fraunces (600/700, optical soft)  ⟵ miękki charakterny serif „wieczornego
                                                rytuału": ulga i ciepło, nie gabinet;
                                                ≠ Gabarito/Bricolage/SpaceGrotesk/Zilla/Archivo
text      = Work Sans (400/500/600)           ⟵ neutralny ciepły grotesk, czytelny przy
                                                FAQ/checkout na mobile; kontrast do serifa
accent(swash) = Fraunces Italic (600)         ⟵ swash z rodziny display — miękki, odręczny
--paper   #FAF3EF / #F3E9E3 / #FFFFFF        ⟵ rodzina MUSZLA/BRZOSKWINIA ROZBIELONA:
                                                ciepły wieczór; ≠ len odsaczka (bardziej
                                                różana), ≠ pudrowy róż skrolika (jaśniejsza,
                                                bez różu w nasyceniu), ≠ lila Brzuszka
--ink     #2B2622   --body #453E38   --line #E4D7CE
--cta     #2E46C8                             ⟵ królewski indygo-granat = KOLOR PRODUKTU
                                                (akcent z produktu, doktryna TOKENS);
                                                „wieczorna głębia" na ciepłym tle prowadzi
                                                wzrok; ΔE≥15 vs wszystkie 5 poprzednich
                                                --cta-ink #FFFFFF · --cta-hover #2438A6
--shadow-md  0 1px 2px rgba(60,45,35,.05), 0 10px 26px rgba(80,50,25,.10)
--radius-lg 18px / --radius-sm 10px           ⟵ miękkość rytuału między kantem Rozmrozika
                                                (12/8) a poduszką Brzuszka (24/12)
IKONY: outline 1.75px, kolor --ink · trust-pill: fill #FFFFFF, border 1px --line, tekst --ink
sygnatura = S-„kręgi ciepła": 2-3 koncentryczne cienkie łuki (echo 21 kulek głowicy
            w pierścieniach) przy eyebrow — wewnętrzne w --line, ZEWNĘTRZNY w --cta
            + DUŻE LICZBY (9 · 21) jako grafika typograficzna we Fraunces
archetyp-hero = D (packshot centralny na polu koloru) ⟵ granatowy „grzybek" jest ładny sam
                z siebie; ≠ C (brzuszek), ≠ F/B/H/A poprzednich

## :root (do briefów F4 — hexy wiążące)
```css
:root{
  --paper:#FAF3EF; --paper-2:#F3E9E3; --card:#FFFFFF;
  --ink:#2B2622; --body:#453E38; --line:#E4D7CE;
  --cta:#2E46C8; --cta-hover:#2438A6; --cta-ink:#FFFFFF;
  --radius-lg:18px; --radius-sm:10px;
  --shadow-md:0 1px 2px rgba(60,45,35,.05), 0 10px 26px rgba(80,50,25,.10);
  --font-display:"Fraunces",Georgia,serif;
  --font-text:"Work Sans",system-ui,sans-serif;
}
```

## Akapit STYLE-DNA do promptów makiet (EN, wklejać 1:1)
STYLE-DNA: warm whitened seashell-peach page #FAF3EF with section bands #F3E9E3 and white
cards #FFFFFF (soft evening warmth, NEVER powder-pink and NEVER linen-beige); ink #2B2622,
body #453E38, hairlines #E4D7CE; EXACTLY ONE accent royal indigo-navy #2E46C8 (matching the
navy product) used ONLY for the CTA button, a soft italic underline-swash under one headline
word, and the OUTER arc of the signature "warmth rings" (2-3 thin concentric arcs echoing
the 21 steel beads of the massage head, placed near section eyebrows); all functional icons
thin 1.75px outline in ink; display font Fraunces (soft characterful serif, weights 600-700)
for headlines, prices and BIG numbers (9 · 21); text font Work Sans; one series radius 18px
(cards) / 10px (small); trust-pills: white fill, 1px hairline border, ink text; soft layered
warm-ambient shadows, subtle grain on bands only; light backgrounds only; the product ALWAYS
navy-blue handle with silver beaded head. Polish diacritics correct. No watermarks, no phone
frames, crisp UI.

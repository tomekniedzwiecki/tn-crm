# -*- coding: utf-8 -*-
"""Buduje pliki promptow makiet MIGOTEK (F2) — LOKALNY OpenAI gpt-image-2 HIGH.
Wspolne STYLE-DNA (KANON+PARTYTURA z TOKENS-MAKIETY.md) wstrzykiwane do KAZDEGO promptu.
Prawdziwe copy (z index.html + KARTA-PRAWDY) WPROST w cudzyslowach — na obrazie copy BEZ
polskich znakow diakrytycznych (makieta = design-comp; realne copy zyje w HTML; model rendruje
tekst przyblizenie, diakrytyki gubi). Emituje p-<name>.txt + _index.json (name,size,ref)."""
import os, io, json
sys = __import__("sys"); sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))

UI = ("A high-fidelity, pixel-perfect WEBSITE UI MOCKUP (Figma-style, clean modern design "
 "system, crisp interface rendering) of ONE section of a Polish e-commerce landing page for a "
 "flameless LED candle brand \"Migotek\". A real interface as if already built — NOT concept "
 "art, NOT a painterly illustration. ")

STYLE = ("STYLE-DNA (identical across the whole series): a WARM DARK, cozy candlelit-at-dusk world. "
 "Dark sections use a deep espresso/charcoal background #14100C with warm surface panels #1E1813 and "
 "warm ivory text #F4E9DA; PROOF / content sections instead sit on a light warm PARCHMENT #F5EEE3 with "
 "ink text #241C14 and muted #8A7A66 — this dark/parchment contrast is intentional and repeats across "
 "the series. EXACTLY ONE accent colour — FLAME AMBER #E9A03A (hover #D9862A, soft glow #FFC978) — used "
 "for the CTA button fill, the micro-label eyebrows, the big Fraunces display numbers/prices and the "
 "small ✦ spark separator; a soft radial AMBER GLOW blooms behind every candle flame. Functional icons "
 "are thin 1.8px OUTLINE strokes (amber on dark, warm #C0863A on parchment), NEVER filled slabs. "
 "Typography: display face FRAUNCES (a warm soft high-contrast old-style SERIF) for headlines, big "
 "numbers, prices and quotes; text face INTER (a clean humanist sans) for eyebrows, body, labels, FAQ "
 "and buttons — the serif/sans contrast is clearly visible. One series radius: 14px on cards, 10px on "
 "chips/pills/fields. Soft warm layered shadows (0 18px 50px -20px rgba(0,0,0,.55), never hard pure "
 "black edges) plus a subtle 3% grain. Generous 8pt whitespace, ASYMMETRIC layouts, never a rigid "
 "50/50 grid. A tiny amber ✦ spark is the section signature; the eyebrow micro-label is AMBER CAPS with "
 "wide letter-spacing above the heading. Polish diacritics where present rendered correctly. ")

PROD = ("PRODUCT FIDELITY (keep this exact body wherever the product appears): slim WHITE tapered "
 "\"icicle\"/taper flameless candles of smooth matte plastic, each topped with a small FLAME-SHAPED LED "
 "tip glowing warm amber — a gently flickering FAKE flame, NOT real fire, with NO smoke and NO melting "
 "or dripping wax. The candles either HANG from very thin, almost invisible clear fishing line via tiny "
 "black hooks (a magical 'floating candles' effect, tips pointing down) or stand upright on a small "
 "base. The controller is a slim matte-BLACK 'magic wand' remote about 33 cm long (like a thin wizard's "
 "wand) with a subtly glowing tip, held in a hand and pointed at the candles. NO real flame, NO dripping "
 "wax, NO smoke, NO electrical cord or wall plug (it is battery powered and cordless), NO coloured or RGB "
 "light (only warm white / amber), NO printed brand name on the product. The full set is 12 white candles "
 "+ 1 black wand remote + 12 black hooks + a spool of clear fishing line. ")

NEG = ("EXACTLY ONE SECTION AND NOTHING ELSE — do not add a wordmark, a price, a star-rating or benefit "
 "chips unless they belong to THIS section. No brand text 'TAILI' or 'YY Warm Home', no shop name, no "
 "watermark, no burned-in English words, no phone frame, no browser chrome, no '01/12' numbering badges. ")

# body per section. ref: 'prod' = /edits z _product-ref.png ; None = /generations (bez produktu)
S = {}

S["01-hero"] = ("prod", "1536x1024",
 "SECTION = HERO, archetype A: a FULL-BLEED immersive photographic scene fills the ENTIRE frame — a "
 "warm cozy interior at dusk (a dim wooden dining room / living room), the ONLY light coming from a "
 "cluster of white flameless LED candles glowing soft amber, and on the RIGHT a hand holding the slim "
 "black magic-wand remote pointed at them. A soft dark scrim on the LEFT carries the copy top-to-bottom: "
 "a small AMBER CAPS eyebrow 'BEZPLOMIENIOWE SWIECE LED Z PILOTEM', a large Fraunces serif H1 'Cieply "
 "blask swiec. Jednym gestem. Bez ognia.' with the words 'Jednym gestem.' in amber, one Inter sub-line "
 "'12 migoczacych swiec LED, ktore zapalasz i gasisz pilotem-rozdzka — bez dymu, wosku i strachu o "
 "pozar.', then a compact OFFER lockup: a big Fraunces price '89,90 zl' with a note 'Zestaw 12 swiec + "
 "pilot · platnosc przy odbiorze', a full-width AMBER #E9A03A CTA button with dark ink text 'Zamawiam "
 "zestaw', a tiny line 'placisz dopiero przy odbiorze', and a small pay-row of three pill chips with thin "
 "outline icons 'Przy odbiorze / Zwrot 14 dni / Bez ognia'. A slim top bar shows a small amber ✦ "
 "'Migotek' wordmark on the left and 'Platnosc przy odbiorze · 14 dni na zwrot' on the right. NO star "
 "rating anywhere above the fold. A radial amber glow blooms around the flames. ")

S["02-zaufanie"] = (None, "1536x1024",
 "SECTION = TRUST BAR: a slim full-width band on warm PARCHMENT #F5EEE3 with a thin hairline top and "
 "bottom, a structural separator at FULL height (no dead lower third). Five trust items in ONE centered "
 "row, each a small lockup with a thin 1.8px OUTLINE amber icon and an Inter label, separated by thin "
 "vertical hairline dividers: 'Bez ognia i dymu', then a rating lockup with a single small amber star and "
 "a Fraunces '4,8 / 5 — 187 ocen', 'Platnosc przy odbiorze (COD)', 'Zwrot 14 dni', 'Sterowane pilotem'. "
 "One consistent minimal style, amber outline icons only. Calm, premium. NO product, NO photographs. ")

S["03-problem"] = (None, "1536x1024",
 "SECTION = PROBLEM, the old painful way — a FULL-BLEED photographic scene with image weight on the LEFT "
 "and a soft dark scrim + copy on the RIGHT. Photoreal frustration at a window at dusk: a SINGLE REAL wax "
 "candle burning with a thin wisp of SMOKE and a bead of MELTED DRIPPING WAX running down onto a wooden "
 "sill, cold blue evening light outside, a slightly gloomy cramped mood. On the RIGHT over the scrim: an "
 "AMBER CAPS eyebrow 'ZNASZ TO?', a Fraunces ivory headline 'Prawdziwe swiece potrafia popsuc wieczor' "
 "and a short Inter line 'Mialy budowac nastroj, a robia klopot — wosk, dym, przeciag i ciagla "
 "czujnosc.', then a vertical list of FOUR pain bullets, each with a thin amber outline X-in-circle icon: "
 "'Wosk kapie na stol i obrus', 'Jeden przeciag i plomien gasnie', 'Strach zostawic ogien przy dzieciach "
 "i zwierzetach', 'Zapalasz i gasisz kazda z osobna'. ABSOLUTELY NO flameless LED candle and NO wand "
 "remote anywhere in the frame — only a single ordinary burning wax candle. Warm dark world but this "
 "scene is deliberately cold and a little melancholic. ")

S["04-rozwiazanie"] = ("prod", "1536x1024",
 "SECTION = SOLUTION / relief — a FULL-BLEED photographic scene with image weight on the RIGHT and a soft "
 "dark scrim + copy on the LEFT (zig-zag, opposite side to the problem section). Photoreal warm dinner at "
 "dusk lit ONLY by the white flameless LED candles glowing amber on the table, calm and cozy, a wine "
 "glass, soft radial glow. On the LEFT over the scrim: an AMBER CAPS eyebrow 'ROZWIAZANIE', a Fraunces "
 "ivory headline 'Migotek — ten sam nastroj, zero ryzyka' and a short Inter line 'LED wiernie udaje "
 "migoczacy plomien — caly cieply klimat zostaje, znika ogien, dym i wosk.', then THREE positive bullets, "
 "each with a thin amber outline CHECK icon: 'Cieple, migoczace swiatlo jak od plomienia — tylko "
 "bezpieczne', 'Zapalasz i gasisz pilotem-rozdzka z drugiego konca pokoju', 'Bez ognia — spokojnie "
 "zostawiasz przy dzieciach i zwierzetach'. Product sharp and static. ")

S["05-zastosowania"] = ("prod", "1536x1024",
 "SECTION = USE-CASES MOSAIC on a DARK warm background #14100C — a bento-style mosaic of FIVE unequal "
 "photographic tiles (radius 14, uneven sizes, one big feature tile + smaller ones, even small gutters), "
 "each showing the white flameless LED candles glowing in a different setting, each with a bottom "
 "dark-gradient overlay carrying an amber CAPS kicker + a Fraunces white title: (BIG) 'KOLACJA — "
 "Romantyczny stol bez kapiacego wosku'; 'SYPIALNIA — Zgas pilotem z lozka'; 'LAZIENKA-SPA — Relaks bez "
 "ognia w wilgoci'; (WIDE) 'TARAS I OGROD — Wiatr ich nie zgasi'; (WIDE) 'WESELE I PRZYJECIE — Dziesiatki "
 "swiec, jeden gest' (candles HANGING on line over a wedding table). Above the mosaic a header: an AMBER "
 "CAPS eyebrow 'CALOROCZNY NASTROJ', a Fraunces white h2 'Pasuje wszedzie, gdzie chcesz ciepla' and one "
 "Inter line 'Jeden zestaw, mnostwo wieczorow.'. Warm dark, cinematic, the candles are the light source "
 "in every tile. ")

S["06-demo"] = ("prod", "1536x1024",
 "SECTION = DEMO 'jak to dziala' on a DARK warm surface #1E1813 with ivory text. A two-column layout: on "
 "the LEFT a vertical stack of THREE step cards connected as a list, each a rounded card with a circular "
 "number badge 01 / 02 / 03 in Fraunces and an Inter caption — the FIRST step is ACTIVE (amber outline, "
 "faint amber tint, amber-filled number): '01 Zapal pilotem-rozdzka — machniecie i caly zestaw rozblyska', "
 "'02 Zawies na zylce albo postaw — 12 haczykow i zylka 20 m w zestawie', '03 Ciesz sie nastrojem — "
 "gasisz wszystko jednym gestem'. On the RIGHT a large 4:3 rounded viz (amber hairline border, warm "
 "shadow) showing a hand holding the black wand remote lighting the cluster of white LED candles on a "
 "table at dusk, with a small amber pill caption bottom-left 'Zapal na odleglosc'. Above: an AMBER CAPS "
 "eyebrow 'JAK TO DZIALA' and a Fraunces white h2 'Trzy kroki do cieplego wieczoru'. ")

S["07-korzysci"] = ("prod", "1536x1024",
 "SECTION = BENEFITS grid on warm PARCHMENT #F5EEE3. A header lockup: AMBER CAPS eyebrow 'DLACZEGO "
 "MIGOTEK', Fraunces ink h2 'Caly urok swiec, zadnej z ich wad'. Below, SIX benefit cards in a tidy 3x2 "
 "grid — each a WHITE card (radius 14, thin hairline border, soft warm shadow) with a thin amber OUTLINE "
 "icon inside a soft amber-tint rounded square, a Fraunces ink h3 and an Inter muted line: 'Bez ognia, "
 "dymu i wosku', 'Sterowane pilotem-rozdzka', 'Na baterie — zero kabli', 'Wielorazowe', 'Cieple, "
 "migoczace swiatlo', '12 swiec + pilot w zestawie'. ONE card instead holds a small CLEAN PACKSHOT of a "
 "white LED candle beside the black wand remote on a plain light field (image at least 40% of that tile, "
 "not a postage stamp). Icons amber outline, not filled. Calm, editorial, parchment. ")

S["08-unoszace"] = ("prod", "1536x1024",
 "SECTION = the FLOATING-CANDLES wow scene — a FULL-BLEED photographic night scene of DOZENS of white "
 "flameless LED candles HANGING at different heights on thin near-invisible fishing line, glowing soft "
 "amber, floating in the air OVER a warm wedding / garden dinner table at night (the magical 'floating "
 "candles' effect), with a soft dark scrim on the LEFT. Over the scrim: an AMBER CAPS eyebrow 'EFEKT "
 "UNOSZACYCH SIE SWIEC', a Fraunces ivory headline 'Swiece, ktore zawisaja w powietrzu' and an Inter line "
 "'Zawies je na dolaczonej zylce pod sufitem — 12 haczykow i zylka 20 m. Magiczny obraz swiec unoszacych "
 "sie nad stolem, bez jednej kropli wosku.'. Warm, dreamy, cinematic; candles are the light source; a "
 "radial amber glow. ")

S["09-porownanie"] = ("prod", "1536x1024",
 "SECTION = COMPARISON, an honest TWO-COLUMN TABLE (not bento) centered on warm PARCHMENT #F5EEE3. Header "
 "lockup: AMBER CAPS eyebrow 'BEZ SCIEMY', Fraunces ink h2 'Migotek kontra prawdziwe swiece'. The table "
 "(white, hairline rules, radius 14) has column A header 'Migotek' (amber, with a tiny white LED candle "
 "thumbnail) and column B header 'Prawdziwe swiece' (muted). Rows with a left feature label: 'Ogien' (A "
 "amber check 'nie' / B muted X 'tak'), 'Kapiacy wosk' (A 'nie' / B 'tak'), 'Pilot na odleglosc' (A 'tak' "
 "/ B 'nie'), 'Wielorazowe' (A 'tak' / B 'nie'), 'Bezpieczne przy dzieciach i zwierzetach' (A 'tak' / B "
 "'ryzyko'), 'Baterie' (A 'do dokupienia' / B '—'). Only the check ticks in column A are amber; everything "
 "else ink/muted; column A cells have a very faint amber tint. Below the table a centered AMBER CTA button "
 "with dark text 'Zamawiam Migotek — 89,90 zl'. Honest, clean, editorial. ")

S["10-mid-cta"] = ("prod", "1536x1024",
 "SECTION = MID-PAGE CTA, a dedicated FULL-BLEED call-to-action over a WARM DARK scene: a cluster of white "
 "flameless LED candles glowing amber against a deep espresso interior at night, a soft dark left-weighted "
 "scrim, a radial amber glow on the right. Left-aligned content over the scrim: an AMBER CAPS eyebrow "
 "'WIECZOR DLA SIEBIE', a Fraunces white headline 'Zamien ryzyko na nastroj', an Inter sub-line 'Zapal "
 "cieply blask jednym gestem i przestan pilnowac plomienia. 12 swiec, jeden pilot, zero dymu.', then a row "
 "with a DESIGNED AMBER #E9A03A CTA button with dark text 'Zamawiam zestaw' beside a Fraunces price '89,90 "
 "zl', and beneath a small line 'Placisz przy odbiorze · zwrot 14 dni.'. A real shaped button, not a bare "
 "link. Warm and inviting, never a dark scam mood, never RGB neon. ")

S["11-opinie"] = (None, "1536x1024",
 "SECTION = REVIEWS / social proof on warm PARCHMENT #F5EEE3 (this is below the fold). Centered header: an "
 "AMBER CAPS eyebrow 'CO MOWIA KUPUJACY', then an OVERSIZED Fraunces number '4,8 / 5' with the '4,8' in "
 "amber, a row of FIVE small amber stars, and an Inter muted line 'na podstawie 187 ocen · 96,8% "
 "pozytywnych'. Below, FOUR honest review cards in a 2x2 grid — each a WHITE card (radius 14, hairline, "
 "warm shadow) with a small row of amber stars and an italic Fraunces Polish quote: 'Wyglada pieknie, "
 "bardzo prosty montaz.', 'Dokladnie to, czego sie spodziewasz po tym produkcie. Polecam.', 'Szybka "
 "dostawa, wszystko dziala.', 'Swietne, dziala bardzo dobrze, dziekuje.', each with a tiny Inter muted tag "
 "label beneath. Honest and human, not glossy. NO product hero shot here. ")

S["12-zdjecia-kupujacych"] = ("prod", "1536x1024",
 "SECTION = BUYER PHOTOS / user-generated proof on warm PARCHMENT #F5EEE3. Centered header: an AMBER CAPS "
 "eyebrow 'PROSTO OD KUPUJACYCH', a Fraunces ink h2 'Tak Migotek wyglada u Was w domu'. Below, a row of "
 "FOUR square photo cards (radius 14, hairline, warm shadow) — each an authentic slightly casual HOME "
 "SNAPSHOT of the white flameless LED candles in a real buyer's home (hanging on line, glowing on a "
 "shelf, unpacked on a table, warm evening), NOT a polished studio shot, each with a small italic Fraunces "
 "caption underneath: 'Wyglada pieknie, bardzo prosty montaz', 'Dokladnie to, czego sie spodziewasz — "
 "polecam', 'Szybka dostawa, wszystko dziala', 'Swietne, dziala bardzo dobrze'. Warm, real, trustworthy. ")

S["13-galeria"] = ("prod", "1536x1024",
 "SECTION = GALLERY, a clean grid of tiles (lightbox feel, uniform radius 14, even gutters) on warm "
 "PARCHMENT #F5EEE3, with a header: AMBER CAPS eyebrow 'Z BLISKA', Fraunces ink h2 'Migotek w kadrze'. "
 "Tiles of the white flameless LED candles in real contexts: a romantic dinner table, a bathroom-spa tub "
 "edge, a garden terrace at dusk, a bedroom, a small packshot of the 12 black hooks + fishing-line "
 "accessories, a warm fireplace group, and one WIDE tile of candles hanging over a wedding table. Small "
 "white captions in the bottom gradient of each tile ('Kolacja we dwoje', 'Domowe spa', 'Taras i ogrod', "
 "'Nastroj w sypialni', '12 haczykow i zylka', 'Cieply final wieczoru', 'Efekt unoszacych sie swiec'). "
 "Consistent warm lighting, uniform tile radius and even gutters. ")

S["14-wideo"] = ("prod", "1536x1024",
 "SECTION = VIDEO 'zobacz w akcji' on a DARK warm background #14100C with a soft central radial amber "
 "glow. Centered header: an AMBER CAPS eyebrow 'ZOBACZ W AKCJI', a Fraunces white h2 'Machniecie rozdzka "
 "— i caly zestaw ozywa', and an Inter ivory line 'Prawdziwe nagranie: kilkanascie swiec migocze cieplym "
 "swiatlem, a zapalasz je pilotem-rozdzka.'. Below, ONE wide 16:9 VIDEO POSTER CARD (radius 14, amber "
 "hairline border, warm shadow) showing the white flameless LED candles HANGING and glowing amber on a "
 "stylish shelf at dusk; top-left a small pill badge with a pulsing amber dot 'NAGRANIE NA ZYWO'. Beneath "
 "the card a centered row of THREE small chips with thin amber outline icons: 'Zywy, migoczacy blask', "
 "'Sterowane rozdzka', 'Bez ognia'. Warm dark, cinematic, calm — NO giant play triangle dominating. ")

S["15-zamow"] = ("prod", "1536x1024",
 "SECTION = ORDER / inline checkout, a wide module on warm PARCHMENT #F5EEE3. LEFT: a clean PACKSHOT of "
 "the white LED candle set with the black wand remote and a few black hooks on a plain warm-light field. "
 "RIGHT: an inline CHECKOUT card (radius 14, hairline border, warm shadow, a thin amber top edge-line) "
 "with an AMBER CAPS eyebrow 'ZAMOWIENIE' and a Fraunces ink title 'Zamow zestaw Migotek', a summary bar "
 "(small thumbnail + 'Migotek' + '1 szt.' + a Fraunces price '89,90 zl'), a payment-method block "
 "highlighting 'Platnosc przy odbiorze (COD)', stacked form fields 'Imie i nazwisko', 'Telefon', 'Adres' "
 "skinned in the tokens, a full-width AMBER #E9A03A CTA button with dark text 'Kup teraz — place przy "
 "odbiorze', then a small Inter muted line 'Zwrot 14 dni · wysylka z Polski'. Order: price -> CTA -> "
 "reassurance. ")

S["16-faq"] = ("prod", "1536x1024",
 "SECTION = FAQ, an accordion (full-width rows, thin hairline dividers, +/- amber outline toggles) beside "
 "a STICKY clean PACKSHOT of a white LED candle with the black wand remote, on warm PARCHMENT #F5EEE3. "
 "Header: AMBER CAPS eyebrow 'ZANIM ZAMOWISZ', Fraunces ink h2 'Najczestsze pytania'. Questions in Fraunces "
 "ink with the first one expanded to an Inter answer: 'Czy potrzebne sa baterie?', 'Jak montuje swiece?', "
 "'Czy to bezpieczne przy dzieciach?', 'Jak dziala pilot?', 'Ile swiec jest w zestawie?', 'Jak wyglada "
 "platnosc i zwrot?'. Calm, trustworthy, roomy, parchment. ")

S["17-final"] = ("prod", "1536x1024",
 "SECTION = FINAL CTA, a wide cinematic FULL-BLEED WARM DARK scene: a group of white flameless LED candles "
 "glowing soft amber over a fireplace / console at night, tidy and calm, life-with-product, a soft radial "
 "amber glow. Centered content over a dark scrim: an AMBER CAPS eyebrow 'CIEPLY BLASK NA ZAWOLANIE', a "
 "Fraunces white headline 'Twoj wieczor zasluguje na cieply blask', an Inter sub-line '12 migoczacych "
 "swiec, jeden pilot i zero ognia. Zapal nastroj jednym gestem — dzis wieczorem.', a DESIGNED AMBER "
 "#E9A03A CTA button with dark text 'Zamawiam Migotek — 89,90 zl', a Fraunces price '89,90 zl', and a "
 "small pay-row of three chips 'Przy odbiorze / Zwrot 14 dni / Bez ognia'. The radial glow closes the "
 "composition. ")

# ---- MOBILE (portrait 2:3) — designed FROM ZERO for the phone fold, product large, single column ----
S["01-hero-m"] = ("prod", "1024x1536",
 "MOBILE HERO (portrait phone, 2:3), designed FROM ZERO for the phone fold — NOT a squeezed desktop. The "
 "photographic warm dark dusk scene fills the TOP ~55%: white flameless LED candles glowing amber in a "
 "cozy interior with a hand holding the black wand remote pointed at them, a radial amber glow. A slim top "
 "bar with a small amber ✦ 'Migotek' wordmark. BELOW over a dark surface: an AMBER CAPS eyebrow "
 "'BEZPLOMIENIOWE SWIECE LED', a big Fraunces H1 'Cieply blask swiec. Jednym gestem.', then an OFFER CARD "
 "(dark card, hairline, warm shadow, radius 14, amber top edge) with the Fraunces price '89,90 zl', a "
 "full-width AMBER CTA 'Zamawiam zestaw' (dark text), a tiny 'placisz przy odbiorze', and a one-line "
 "pay-row 'Przy odbiorze · Zwrot 14 dni · Bez ognia'. Everything decisive INSIDE the fold. NO star rating "
 "above the fold. ")

S["03-problem-m"] = (None, "1024x1536",
 "MOBILE PROBLEM (portrait 2:3), phone-first. A photoreal frustration scene fills the TOP: a SINGLE REAL "
 "wax candle burning with a wisp of SMOKE and a bead of MELTED DRIPPING WAX on a wooden sill, cold blue "
 "evening light, gloomy. BELOW on a dark surface: an AMBER CAPS eyebrow 'ZNASZ TO?', a Fraunces ivory "
 "headline 'Prawdziwe swiece potrafia popsuc wieczor' and a vertical list of THREE short pain bullets with "
 "amber outline X-in-circle icons: 'Wosk kapie na stol', 'Przeciag gasi plomien', 'Strach o ogien przy "
 "dzieciach'. ABSOLUTELY NO flameless LED candle and NO wand remote in frame — only an ordinary burning "
 "wax candle. Cold, melancholic. ")

S["04-rozwiazanie-m"] = ("prod", "1024x1536",
 "MOBILE SOLUTION (portrait 2:3), phone-first. TOP: a photoreal warm dinner at dusk lit by the white "
 "flameless LED candles glowing amber, calm and cozy, a radial glow. BELOW on a dark surface: an AMBER "
 "CAPS eyebrow 'ROZWIAZANIE', a Fraunces ivory headline 'Ten sam nastroj, zero ryzyka' and THREE positive "
 "bullets with amber outline CHECK icons: 'Cieple, migoczace swiatlo — tylko bezpieczne', 'Zapalasz "
 "pilotem-rozdzka na odleglosc', 'Bez ognia przy dzieciach i zwierzetach'. Product sharp. ")

S["05-zastosowania-m"] = ("prod", "1024x1536",
 "MOBILE USE-CASES (portrait 2:3) on a DARK warm background. A header: AMBER CAPS eyebrow 'CALOROCZNY "
 "NASTROJ', Fraunces white h2 'Pasuje wszedzie, gdzie chcesz ciepla'. Below, a single VERTICAL stack of "
 "THREE-to-FOUR photographic tiles (radius 14, even gaps), each showing the white flameless LED candles "
 "glowing in a setting with an amber CAPS kicker + Fraunces white title in a bottom gradient: 'KOLACJA — "
 "romantyczny stol', 'TARAS I OGROD — wiatr ich nie zgasi', 'WESELE — dziesiatki swiec, jeden gest' "
 "(candles hanging on line). Warm dark, candles are the light source. NEVER slivers side-by-side — full "
 "width tiles stacked. ")

S["06-demo-m"] = ("prod", "1024x1536",
 "MOBILE DEMO 1-2-3 (portrait 2:3) on a DARK warm surface. The THREE step cards STACKED into a single "
 "VERTICAL column with a connecting line (NEVER three side-by-side): '01 Zapal pilotem-rozdzka' (active, "
 "amber), '02 Zawies na zylce albo postaw', '03 Ciesz sie nastrojem', each with a circular Fraunces number "
 "badge and an Inter caption. ABOVE the steps a rounded viz (amber hairline) of a hand with the black wand "
 "lighting the white LED candles, with a small amber pill caption 'Zapal na odleglosc'. Header: AMBER CAPS "
 "eyebrow 'JAK TO DZIALA', Fraunces white h2 'Trzy kroki do cieplego wieczoru'. ")

S["10-mid-cta-m"] = ("prod", "1024x1536",
 "MOBILE MID-CTA (portrait 2:3). A warm dark scene of white flameless LED candles glowing amber fills the "
 "TOP, radial glow. BELOW, centered on a dark surface: an AMBER CAPS eyebrow 'WIECZOR DLA SIEBIE', a "
 "Fraunces white headline 'Zamien ryzyko na nastroj', a full-width DESIGNED AMBER CTA 'Zamawiam zestaw' "
 "(dark text), a Fraunces price '89,90 zl', and a small line 'Placisz przy odbiorze · zwrot 14 dni.'. "
 "Order price -> CTA -> reassurance. ")

S["15-zamow-m"] = ("prod", "1024x1536",
 "MOBILE ORDER / inline checkout (portrait 2:3), phone-first single column, on warm PARCHMENT #F5EEE3. "
 "TOP: a clean PACKSHOT of the white LED candle set with the black wand remote on a plain warm-light "
 "field. BELOW: an inline CHECKOUT card (radius 14, hairline, amber top edge-line) with an AMBER CAPS "
 "eyebrow 'ZAMOWIENIE', a Fraunces ink title 'Zamow zestaw Migotek', a summary row (thumbnail + 'Migotek' "
 "+ price '89,90 zl'), a highlighted 'Platnosc przy odbiorze (COD)', stacked form fields 'Imie i "
 "nazwisko', 'Telefon', 'Adres', a full-width AMBER CTA 'Kup teraz — place przy odbiorze' (dark text), and "
 "a small line 'Zwrot 14 dni · wysylka z Polski'. ")

S["17-final-m"] = ("prod", "1024x1536",
 "MOBILE FINAL (portrait 2:3). A calm warm dark scene of white flameless LED candles glowing amber over a "
 "fireplace fills the TOP, radial glow. BELOW, centered on a dark scrim: an AMBER CAPS eyebrow 'CIEPLY "
 "BLASK NA ZAWOLANIE', a Fraunces white headline 'Twoj wieczor zasluguje na cieply blask', a full-width "
 "DESIGNED AMBER CTA 'Zamawiam Migotek — 89,90 zl' (dark text), a Fraunces price '89,90 zl', and a "
 "one-line pay-row 'Przy odbiorze · Zwrot 14 dni · Bez ognia'. ")

index = []
for name, (ref, size, body) in S.items():
    parts = [UI, body, STYLE]
    if ref == "prod":
        parts.append(PROD)
    parts.append(NEG)
    txt = "".join(parts)
    io.open(os.path.join(HERE, "p-%s.txt" % name), "w", encoding="utf-8").write(txt)
    index.append({"name": name, "size": size, "ref": ref})

io.open(os.path.join(HERE, "_index.json"), "w", encoding="utf-8").write(
    json.dumps(index, ensure_ascii=False, indent=1))
print("napisano %d promptow" % len(index))
for it in index:
    print(" ", it["name"], it["size"], it["ref"] or "gen")

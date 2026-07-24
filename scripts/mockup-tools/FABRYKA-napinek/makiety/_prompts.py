# -*- coding: utf-8 -*-
"""Buduje pliki promptow makiet NAPINEK (F2). Wspolne STYLE-DNA (KANON+PARTYTURA z
TOKENS-MAKIETY) wstrzykiwane do KAZDEGO promptu. Prawdziwe dane WPROST w cudzyslowach.
Emituje p-<name>.txt oraz _index.json (name,size,ref) do sterowania generacja."""
import os, io, json
sys = __import__("sys"); sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))

UI = ("A high-fidelity, pixel-perfect WEBSITE UI MOCKUP (Figma-style, clean modern design system, "
 "crisp interface rendering) of ONE section of a Polish e-commerce landing page for a home "
 "spring arm & chest trainer brand \"Napinek\". A real interface as if already built — NOT concept "
 "art, NOT a painterly illustration. ")

STYLE = ("STYLE-DNA (identical across the whole series): a COOL LIGHT LINEN / pale ash world with a "
 "faint green undertone — page background #F5F7F5, secondary panels #E9EDE9 and #DCE4DE; ink text "
 "#1C2723, body #37423C, 1px hairlines #D3DDD5. EXACTLY ONE accent colour — DEEP TEAL #0F766E — used "
 "ONLY for the CTA button fill, the big-numbers/arc signature and star glyphs; ALL functional icons "
 "are thin 2px OUTLINE strokes in ink #1C2723, NEVER teal. Typography: display face BARLOW SEMI "
 "CONDENSED (a strong athletic condensed grotesk, heavy 800) for headlines, brand, big numbers and "
 "prices; text face MULISH (a clean warm humanist sans) for eyebrows, body, labels and specs — the "
 "two faces clearly CONTRAST (condensed vs open). One series radius: 12px on cards, 6px on chips/pills. "
 "Soft LAYERED MOSSY shadows (rgba(20,45,35,.06-.12), never pure black) plus a subtle 3% grain. "
 "Generous 8pt whitespace. Publishing SIGNATURE = big bold athletic NUMERALS as a graphic (resistance "
 "levels '60 / 75 / 90' and step numbers '01 02 03') plus a thin 1px ARC line echoing the bent spring "
 "bar under tension, used as a baseline / divider. Polish diacritics rendered correctly. ")

PROD = ("PRODUCT FIDELITY (keep this exact body wherever the product appears): a SPRING ARM & CHEST "
 "TWISTER TRAINER — two parallel CHROME steel rods with thick BLACK anti-slip FOAM handle grips (four "
 "grips: two straight in the middle, two curved 'C' ends) carrying MINT/TEAL accent rings, joined in "
 "the centre by a pair of STEEL SPRINGS; in use the bar is BENT into an oval under tension. The accent "
 "rings are MINT/TEAL, NEVER blue. NO single-spring old-style power twister, NO resistance bands or "
 "cables, NO ab-wheel, NO screen/electronics, no printed brand name on the device. ")

NEG = ("EXACTLY ONE SECTION AND NOTHING ELSE — do not add a wordmark, a price, a star-rating or benefit "
 "chips unless they belong to THIS section. No brand text 'Rbefeuly' or 'HOTWAVE', no shop name, no "
 "watermark, no phone frame, no browser chrome, no dark commercial gym background, no shirtless "
 "bodybuilder model, no blue accent rings, no health/medical claims, no weight-loss claims. ")

S = {}

# ================= DESKTOP =================
S["01-hero"] = ("prod", "1536x1024",
 "SECTION = HERO, archetype C (scene on top, offer card overlapping its bottom edge). A photoreal "
 "BRIGHT HOME scene fills the upper area: an ordinary fit person (25-40, casual sportswear, NOT a "
 "shirtless bodybuilder) squeezing the black-foam + mint-teal + chrome spring twister bar in front of "
 "the chest, arms and chest engaged, calm focused face; a bright modern living-room corner, morning "
 "daylight from a window with a light linen curtain, a workout mat and a green plant nearby; product "
 "SHARP, canonical colours. Above the fold a slim TRUST STRIP of pills 'platnosc przy odbiorze - zwrot "
 "14 dni - wysylka z Polski - dla kobiet i mezczyzn' with thin outline ink icons. A small ink eyebrow "
 "'SILA RAMION I KLATKI - W DOMU' and a large Barlow Semi Condensed headline 'Ramiona i klatka jak z "
 "silowni - w kilka minut dziennie' with a Mulish sub-line '3 poziomy oporu, caly gorny korpus. Bez "
 "karnetu i bez wychodzenia z domu.'. OVERLAPPING the bottom edge of the scene, an OFFER CARD (radius "
 "12, thin hairline border, soft mossy shadow) holds the big price '144,90 zl' in Barlow, a full-width "
 "deep-teal #0F766E CTA button with WHITE text 'Zamawiam - 144,90 zl', and a pay-row of small payment "
 "badges (BLIK, Visa, Mastercard, za pobraniem). A thin teal arc signature sits under the headline. NO "
 "star rating and NO review numbers anywhere above the fold. ")

S["02-zaufanie"] = (None, "1536x1024",
 "SECTION = TRUST BAR: a slim full-width band on paper #E9EDE9, a structural separator at FULL height "
 "(no dead lower third). Four trust items in one row, each a pill/lockup with a thin 2px OUTLINE ink "
 "icon plus a Mulish label: 'Platnosc przy odbiorze', 'Zwrot 14 dni', 'Wysylka z Polski', 'Dla kobiet "
 "i mezczyzn'. One consistent pill style, ink icons (no teal). A thin teal arc line runs through as the "
 "divider. Calm, premium, minimal. NO product, NO photographs, NO price. ")

S["03-problem"] = (None, "1536x1024",
 "SECTION = PROBLEM, the old frustrating way - a FULL-BLEED photographic scene with image weight on the "
 "LEFT and a soft linen scrim + copy on the RIGHT. Photoreal stalled good-intentions in a BRIGHT home "
 "corner: a rolled-up unused workout mat and an OLD single-spring hand gripper left in the corner, a "
 "little dusty, a person sitting on a couch looking at a phone instead of training; soft muted daylight, "
 "mood of stalled motivation. On the RIGHT over the scrim: an ink Barlow headline 'Postanowienia bez "
 "efektu?' and a short Mulish line 'Karnet sie marnuje, pompki nudza, a stary drazek rani dlonie.' The "
 "signature arc is BROKEN / interrupted here. ABSOLUTELY NO Napinek spring twister bar anywhere in the "
 "frame; no bright hero mood, no branded device. ")

S["04-rozwiazanie"] = ("prod", "1536x1024",
 "SECTION = SOLUTION / relief - a FULL-BLEED photographic scene with image weight on the RIGHT and a "
 "soft scrim + copy on the LEFT (zig-zag, opposite side to the problem section). Photoreal calm bright "
 "home corner by a WINDOW: the same fit person calmly bending the black-foam + mint-teal + chrome spring "
 "twister bar, relaxed confident; a sheer linen curtain gently billowing at the window, a leafy plant "
 "nearby; bright daylight; product sharp and canonical. On the LEFT over a linen scrim: an ink Barlow "
 "headline 'Napnij, zegnij, zbuduj sile' and a short Mulish line 'Jeden drazek zamiast calej silowni - "
 "w domu, w kilka minut dziennie.', plus a small triad of mini-benefits 'w domu / caly gorny korpus / "
 "3 poziomy' with thin outline ink icons. The signature arc sweeps along and 'holds' the bent bar. ")

S["05-demo"] = ("prod", "1536x1024",
 "SECTION = DEMO 'jak to dziala' 1-2-3, a TOR-I interactive-style card on paper showing THREE SEPARATE "
 "STATE FRAMES in a row with a stepper connecting them, macro of hands and forearms on the bar, soft "
 "studio light, light background. STATE 01 'Chwyc oburacz': both hands gripping the foam handles. STATE "
 "02 'Napnij i zegnij': the bar bent into an oval under tension, arms engaged, an arc drawn. STATE 03 "
 "'Rozluznij i powtorz': the bar returning to rest. Each state is a small card with a step number 01 / "
 "02 / 03 in Barlow and a short Mulish caption; the ACTIVE step is accented teal, the others ink. "
 "Outline ink icons. The three states MUST be distinct frames, not one static photo. ")

S["06-zastosowania"] = ("prod", "1536x1024",
 "SECTION = APPLICATIONS mosaic - 'jeden drazek, caly gorny korpus'. A header Barlow 'Jeden drazek - "
 "caly gorny korpus' with a Mulish line 'Zmieniasz chwyt i cwiczysz rozne partie.'. A GRID of FOUR "
 "photo tiles (radius 12), the SAME fit person in the same bright home, using the mint-teal spring "
 "twister bar for a different muscle group each: (1) 'Klatka' - squeezing the bar inward in front of "
 "the chest; (2) 'Biceps / ramiona' - curling the bar with bent elbows; (3) 'Barki' - pressing the bar "
 "outward in front / overhead; (4) 'Plecy i triceps' - pushing the bar apart. Each tile a small Mulish "
 "label. Consistent light and styling, product canonical mint-teal. Ink outline icons only. ")

S["07-poziomy"] = ("prod", "1536x1024",
 "SECTION = 'POZIOMY OPORU' resistance levels, the FLAGSHIP interactive configurator (TOR-I), a card on "
 "paper. LEFT: a macro of the bar's chrome + mint-teal end with the adjustment (a rebound button and "
 "the interface holes to reconfigure the rods), silver steel, side studio light, shallow focus. RIGHT: "
 "HUGE bold athletic numerals '60 · 75 · 90' (the three resistance levels in lbs) as a graphic in "
 "Barlow, arranged as a three-step SELECTOR '60 lbs / 75 lbs / 90 lbs' with the active level highlighted "
 "teal #0F766E and a Mulish readout 'Start: 60 lbs -> rosniesz -> 90 lbs'. A Barlow headline '3 poziomy "
 "oporu - rosnie z Toba'. The big-numbers signature CULMINATES here. This disarms 'czy to nie za latwe / "
 "za trudne?'. ")

S["08-korzysci"] = ("prod", "1536x1024",
 "SECTION = BENEFITS bento, UNEVEN tiles on paper (asymmetric, radius 12, hairline borders, mossy layered "
 "shadow). Four benefit tiles, each a thin outline ink icon + a Barlow number/word-as-graphic + a Mulish "
 "feature-to-benefit line: (1) 'Stalowa sprezyna' - 'Dwuwarstwowa, mocny opor, nie traci ksztaltu'. (2) "
 "'Pewny chwyt' - 'Antyposlizgowa pianka i oslona - chronia dlonie'. (3) a big '3' with 'poziomy' - "
 "'60 / 75 / 90 lbs - opor rosnie z Toba'. (4) '67 x 17 cm' - 'Rozkladany - schowasz albo wezmiesz w "
 "podroz'. ONE tile holds a small clean packshot of the mint-teal spring twister bar (image at least "
 "40% of that tile, filling its height - not a postage stamp). Functional icons ink, not teal. NO '6+ "
 "miesni', no cardio, no weight-loss. ")

S["09-bezpieczenstwo"] = ("prod", "1536x1024",
 "SECTION = COMPARISON, an honest TWO-COLUMN TABLE (not bento) on paper, media on the LEFT. Column A "
 "header 'Napinek' (with a small mint-teal bar thumbnail), column B header 'Zwykly drazek z jedna "
 "sprezyna'. Rows: 'Antyposlizgowa pianka + oslona' (A ok / B goly metal rani dlonie), '3 poziomy oporu' "
 "(A 60/75/90 / B jeden), 'Rozkladany, latwo schowac' (A ok / B nie), 'Rozne cwiczenia i partie' (A ok "
 "/ B jedno). One HONEST small-print caveat line in Mulish under the table: 'Na start poswiec chwile na "
 "technike - ruch kontrolowany, nie na sile.'. Only the check ticks in column A are teal; everything "
 "else ink. Clean editorial table with hairline rules. ")

S["10-mid-cta"] = ("prod", "1536x1024",
 "SECTION = MID-PAGE CTA, a dedicated FULL-BLEED call-to-action over a WARM BRIGHT home scene: the "
 "mint-teal + black spring twister bar resting on a workout mat by a window, cozy inviting daylight, a "
 "calm home. Centered content: an ink Barlow headline 'Zamow Napinka - zacznij juz dzis', the price "
 "'144,90 zl', and a DESIGNED deep-teal #0F766E CTA button with WHITE text 'Zamow Napinka', with "
 "'platnosc przy odbiorze' beneath it. Order: price -> CTA -> reassurance. A real, shaped button, not a "
 "bare link. No dark scam mood, no blue accent. ")

S["11-opinie"] = (None, "1536x1024",
 "SECTION = REVIEWS / social proof (this is BELOW the fold), a grid of review cards with small round "
 "avatars and star glyphs. A header lockup shows '* 4,8 / 5 - 9 ocen' - the STARS in teal #0F766E, the "
 "rating number '4,8/5' in ink Mulish (NOT teal). Four honest short review cards with first names and "
 "short quotes: 'Dobry trener, szybka dostawa.', 'Funkcjonalny i nieporeczny - schowam bez problemu.', "
 "'Na start trzeba pocwiczyc technike, potem super.', 'Wszystko super, polecam.'. Cards radius 12, "
 "hairline borders, mossy shadow. Honest and human, not glossy. NO product hero shot here. ")

S["12-galeria"] = ("prod", "1536x1024",
 "SECTION = GALLERY, a clean grid of SQUARE (1:1) tiles with one series radius and a lightbox feel. Four "
 "tiles of the SAME mint-teal + black + chrome spring twister bar in real contexts: (1) in-use - hands "
 "squeezing the bar in front of the chest; (2) macro of the steel springs and a foam handle; (3) the "
 "whole bar laid out top-down showing its shape; (4) macro of the chrome end with the resistance "
 "adjustment. Consistent light home context, NO burned-in English text, NO brand prints. Uniform tile "
 "radius and even gutters. ")

S["15-zamow"] = ("prod", "1536x1024",
 "SECTION = ORDER / inline checkout, a wide module with a skinned checkout form. LEFT: a clean packshot "
 "of the mint-teal + black + chrome spring twister bar on a plain light field. RIGHT: an inline checkout "
 "card (radius 12, hairline border, mossy shadow) with the price '144,90 zl' in Barlow, form fields "
 "'Imie i nazwisko', 'Telefon', 'Adres' skinned in the tokens, a payment choice highlighting 'Platnosc "
 "przy odbiorze (COD)', a full-width deep-teal #0F766E CTA button with WHITE text 'Kup teraz - place "
 "przy odbiorze', then a small risk-reduction line 'Zwrot 14 dni - wysylka z Polski'. Order: price -> "
 "CTA -> reassurance. ")

S["16-faq"] = ("prod", "1536x1024",
 "SECTION = FAQ, an accordion (full-width rows, thin hairline dividers, +/- outline ink toggles) beside "
 "a STICKY packshot of the mint-teal spring twister bar (not a bare accordion). Questions in ink Barlow "
 "with Mulish answers: 'Czy to trudne?' (answer: 'na start poc'wicz technike, ruch kontrolowany'), 'Jaki "
 "opor?' ('3 poziomy: 60 / 75 / 90 lbs'), 'Czy nadaje sie dla kobiet?' ('tak, unisex'), 'Na jakie "
 "partie?' ('ramiona, klatka, plecy, barki'), 'Czy sie schowa?' ('rozkladany, 67 x 17 cm'), 'Czy nie "
 "rani dloni?' ('antyposlizgowa pianka i oslona'). Calm, trustworthy, roomy. ")

S["17-final"] = ("prod", "1536x1024",
 "SECTION = FINAL CTA, a wide cinematic BRIGHT home in the evening: tidy and calm, a fit person relaxed "
 "after a short home workout, the mint-teal spring twister bar within reach on a shelf/mat, warm evening "
 "light, a plant, a sheer curtain moving faintly - life-with-product, reassuring. Centered: an ink "
 "Barlow headline 'Zacznij budowac sile w domu', a DESIGNED deep-teal #0F766E CTA button with WHITE "
 "text 'Zamawiam Napinka', and a tiny one-line mini-review beneath. The signature arc closes the "
 "composition, 'holding' the bar. ")

# ================= MOBILE (2:3) =================
S["01-hero-m"] = ("prod", "1024x1536",
 "MOBILE HERO (portrait phone, 2:3), archetype C, designed FROM ZERO for the phone fold - NOT a squeezed "
 "desktop. TOP ~45% = a COMPACT photographic scene (person LARGE): an ordinary fit person squeezing the "
 "black-foam + mint-teal + chrome spring twister bar in front of the chest, bright home, morning light, "
 "product sharp. BELOW: a big Barlow hook 'Ramiona i klatka jak z silowni' (large H1), then an OFFER "
 "CARD OVERLAPPING the bottom of the scene (card bg, hairline border, mossy shadow, radius 12): the "
 "price '144,90 zl' + a full-width teal CTA 'Zamawiam - 144,90 zl' (white) + a pay-row (BLIK / Visa / "
 "Mastercard / za pobraniem) + a one-line trust strip 'przy odbiorze - zwrot 14 dni - z Polski'. At most "
 "ONE line of benefits. NO floating trust-chip / badge overlay on the scene; NO star rating above the "
 "fold. Everything decisive INSIDE the fold. ")

S["02-zaufanie-m"] = (None, "1024x1536",
 "MOBILE TRUST BAR (portrait 2:3). A compact band on paper #E9EDE9 with four trust items STACKED into a "
 "2x2 grid (NOT four side-by-side), each a pill with a 2px outline ink icon + Mulish label: 'Platnosc "
 "przy odbiorze', 'Zwrot 14 dni', 'Wysylka z Polski', 'Dla kobiet i mezczyzn'. A thin teal arc divider. "
 "One pill style, ink icons. NO product, NO price. ")

S["03-problem-m"] = (None, "1024x1536",
 "MOBILE PROBLEM (portrait 2:3), phone-first. A photoreal stalled-motivation scene fills the top: a "
 "rolled-up unused workout mat and an old single-spring gripper in a bright home corner, a person on a "
 "couch looking at a phone, soft muted daylight. BELOW on linen: an ink Barlow headline 'Postanowienia "
 "bez efektu?' and ONE short Mulish line 'Karnet sie marnuje, stary drazek rani dlonie.' The signature "
 "arc broken / interrupted. NO Napinek spring twister bar anywhere in frame. ")

S["04-rozwiazanie-m"] = ("prod", "1024x1536",
 "MOBILE SOLUTION (portrait 2:3), phone-first. TOP: a photoreal calm bright home by a window, the same "
 "fit person bending the mint-teal + black + chrome spring twister bar, a sheer curtain billowing, a "
 "plant, bright daylight, product sharp. BELOW: an ink Barlow headline 'Napnij, zegnij, zbuduj sile' + "
 "ONE Mulish line 'Jeden drazek zamiast calej silowni.' + a single row of three tiny outline-ink "
 "mini-benefits 'w domu / caly korpus / 3 poziomy'. Designed for the phone, not a squeezed desktop. ")

S["05-demo-m"] = ("prod", "1024x1536",
 "MOBILE DEMO 1-2-3 (portrait 2:3), TOR-I. THREE state cards STACKED into a single VERTICAL column with "
 "a connecting line (NEVER three side-by-side). 01 'Chwyc oburacz' (both hands on the foam handles). 02 "
 "'Napnij i zegnij' (the bar bent into an oval under tension, an arc). 03 'Rozluznij i powtorz' (the bar "
 "back at rest). Step numbers 01 / 02 / 03 in Barlow, short Mulish captions, the active step teal. Macro "
 "studio, light background. ")

S["06-zastosowania-m"] = ("prod", "1024x1536",
 "MOBILE APPLICATIONS (portrait 2:3). A Barlow header 'Jeden drazek - caly gorny korpus'. FOUR photo "
 "tiles STACKED into a single vertical column (or 2x2 grid), the same fit person using the mint-teal "
 "spring twister bar for: 'Klatka' (squeeze inward), 'Biceps / ramiona' (curl), 'Barki' (press out), "
 "'Plecy i triceps' (push apart), each with a small Mulish label. Consistent light, product canonical. "
 "NEVER four side-by-side; phone-first stack. ")

S["07-poziomy-m"] = ("prod", "1024x1536",
 "MOBILE 'POZIOMY OPORU' configurator (portrait 2:3), the TOR-I flagship. TOP: a macro of the bar's "
 "chrome + mint-teal end with the rebound button and adjustment. BELOW: HUGE bold Barlow numerals '60 / "
 "75 / 90' stacked as a three-step vertical SELECTOR '60 lbs / 75 lbs / 90 lbs' with the active level in "
 "teal, and a Mulish readout 'Start: 60 lbs -> rosniesz -> 90 lbs', with a Barlow line '3 poziomy oporu "
 "- rosnie z Toba'. The big-numbers signature culminates. Phone-first, not a squeezed desktop. ")

S["08-korzysci-m"] = ("prod", "1024x1536",
 "MOBILE BENEFITS (portrait 2:3). Four benefit tiles STACKED vertically (NOT a dense desktop grid), each "
 "a 2px outline ink icon + a Barlow word/number + a short Mulish line: 'Stalowa sprezyna - mocny opor, "
 "nie traci ksztaltu'; 'Pewny chwyt - pianka i oslona chronia dlonie'; a big '3 poziomy - 60/75/90 lbs'; "
 "'67 x 17 cm - rozkladany, schowasz'. One tile shows a small clean packshot of the mint-teal bar "
 "filling its height. Icons ink, not teal. ")

S["09-bezpieczenstwo-m"] = ("prod", "1024x1536",
 "MOBILE COMPARISON (portrait 2:3). An honest compact table 'Napinek' vs 'Zwykly drazek z jedna "
 "sprezyna' reflowed for phone (stacked rows, each row shows both values clearly): 'Pianka + oslona' "
 "(A chroni dlonie / B goly metal), '3 poziomy oporu' (A 60/75/90 / B jeden), 'Rozkladany' (A ok / B "
 "nie), 'Rozne cwiczenia' (A ok / B jedno). One honest Mulish caveat: 'Na start poswiec chwile na "
 "technike.'. Only column-A ticks teal; else ink. ")

S["10-mid-cta-m"] = ("prod", "1024x1536",
 "MOBILE MID-CTA (portrait 2:3). A warm bright home scene fills the top: the mint-teal + black spring "
 "twister bar on a mat by a window, cozy daylight, calm. BELOW, centered: a Barlow headline 'Zamow "
 "Napinka', the price '144,90 zl', a DESIGNED full-width teal CTA 'Zamow Napinka' (white), and 'platnosc "
 "przy odbiorze'. Order price -> CTA -> reassurance. ")

S["11-opinie-m"] = (None, "1024x1536",
 "MOBILE REVIEWS (portrait 2:3), below the fold. A header lockup '* 4,8 / 5 - 9 ocen' with STARS in teal "
 "and the number '4,8/5' in ink Mulish. Review cards STACKED vertically with small avatars and short "
 "quotes: 'Dobry trener, szybka dostawa.', 'Funkcjonalny i nieporeczny.', 'Na start poc'wicz technike, "
 "potem super.', 'Wszystko super, polecam.'. Cards radius 12, hairline, honest and human. NO product "
 "hero shot. ")

S["12-galeria-m"] = ("prod", "1024x1536",
 "MOBILE GALLERY (portrait 2:3). A vertical stack (or 2-column grid) of SQUARE 1:1 tiles of the SAME "
 "mint-teal + black + chrome spring twister bar in real contexts: in-use chest squeeze, macro of the "
 "steel springs, top-down whole bar, macro of the resistance adjustment. Uniform radius, even gutters, "
 "NO burned-in English text, NO brand prints, with a peek of the next tile to signal scroll. ")

S["15-zamow-m"] = ("prod", "1024x1536",
 "MOBILE ORDER / inline checkout (portrait 2:3), phone-first single column. TOP: a clean packshot of the "
 "mint-teal + black + chrome spring twister bar on a plain light field. BELOW: an inline checkout card "
 "(radius 12, hairline): the price '144,90 zl', stacked form fields 'Imie i nazwisko', 'Telefon', "
 "'Adres', a highlighted 'Platnosc przy odbiorze (COD)', a full-width teal CTA 'Kup teraz - place przy "
 "odbiorze' (white), and a small line 'Zwrot 14 dni - wysylka z Polski'. ")

S["16-faq-m"] = ("prod", "1024x1536",
 "MOBILE FAQ (portrait 2:3). A full-width accordion (rows, thin hairline dividers, +/- outline ink "
 "toggles) with a small sticky packshot of the mint-teal bar above. Questions in ink Barlow with Mulish "
 "answers: 'Czy to trudne?' (poc'wicz technike), 'Jaki opor?' (60/75/90 lbs), 'Dla kobiet?' (unisex), "
 "'Na jakie partie?' (ramiona/klatka/plecy/barki), 'Czy sie schowa?' (rozkladany 67x17 cm). Calm, roomy. ")

S["17-final-m"] = ("prod", "1024x1536",
 "MOBILE FINAL (portrait 2:3). A calm bright evening home fills the top: a fit person relaxed after a "
 "short workout, the mint-teal spring twister bar within reach, warm light, a plant, a sheer curtain. "
 "BELOW, centered: a Barlow headline 'Zacznij budowac sile w domu', a DESIGNED full-width teal CTA "
 "'Zamawiam Napinka' (white), a one-line mini-review. The signature arc closes it. ")

index = []
for name, (ref, size, body) in S.items():
    parts = [UI, body, STYLE]
    if ref == "prod":
        parts.append(PROD)
    parts.append(NEG)
    io.open(os.path.join(HERE, "p-%s.txt" % name), "w", encoding="utf-8").write("".join(parts))
    index.append({"name": name, "size": size, "ref": ref})

io.open(os.path.join(HERE, "_index.json"), "w", encoding="utf-8").write(
    json.dumps(index, ensure_ascii=False, indent=1))
print("napisano %d promptow" % len(index))
for it in index:
    print(" ", it["name"], it["size"], it["ref"] or "gen")

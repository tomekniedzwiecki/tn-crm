# -*- coding: utf-8 -*-
# Builder promptow makiet LSNIK (F2). Pisze p-<name>.txt + p-<name>-m.txt + _index.json.
# Wspolny STYLE-DNA (KANON+PARTYTURA z TOKENS-MAKIETY.md) wstrzykiwany do KAZDEGO promptu.
import os, io, json, sys
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))

HEAD = ('A high-fidelity, pixel-perfect WEBSITE UI MOCKUP (Figma-style, clean modern design system, '
 'crisp interface rendering) of ONE section of a Polish e-commerce landing page for a car trunk '
 'ambient LED light-strip brand "Lsnik". A real interface as if already built - NOT concept art, '
 'NOT a painterly illustration. ')

DNA = (' STYLE-DNA (identical across the whole series): a WARM near-white / STONE world - page '
 'background #F7F4EF, secondary panels #EFE9E1 and #E3DBCE; ink text #22201D, body #3A362F, 1px '
 'hairlines #DAD1C2. EXACTLY ONE accent colour - TAIL-LIGHT RED #C21F30 - used ONLY for the CTA '
 'button fill, the glowing light-line signature and star glyphs; ALL functional icons are thin '
 '1.75px OUTLINE strokes in ink #22201D, NEVER red. Typography: display face MONTSERRAT (a confident '
 'geometric grotesk, heavy 800) for headlines, brand, big numbers and prices; text face MULISH (a '
 'warm humanist sans) for eyebrows, body, labels, specs and numbers - the two faces clearly CONTRAST. '
 'One series radius: 18px on cards, 10px on chips/pills. Soft LAYERED WARM shadows (brown-tinted '
 'rgba(60,40,20,.06-.12), never pure black) plus a subtle 3% grain. Generous 8pt whitespace. '
 'Publishing SIGNATURE = a thin 1px continuous "light-line" hairline with a soft warm glow, echoing '
 'the LED strip tracing a trunk frame (one stretch "lit" in red #C21F30), used as a baseline/divider '
 '- a light-line, not a handwritten swash. Polish diacritics rendered correctly.')

PRODFID = (' PRODUCT FIDELITY (keep exact wherever the product appears): a soft FLEXIBLE SILICONE LED '
 'light-strip (milky-white tube, half-round profile) that glows a CONTINUOUS smooth LINE of '
 'WARM-WHITE or WHITE light (NO visible individual dot LEDs), installed tracing the inner frame of an '
 'OPEN car trunk / tailgate opening; the coiled product has a thin two-wire lead (red+black) at one '
 'end. NO rainbow / RGB colours, NO visible dot LEDs, NO remote or app, NO rigid aluminium profile; '
 'the car is NEUTRAL with NO visible brand logo and NO licence plate.')

NEG = (' EXACTLY ONE SECTION AND NOTHING ELSE - do not add a wordmark, a price, a star-rating or '
 'benefit chips unless they belong to THIS section. No brand text "Changan", no car licence plate, '
 'no shop name, no watermark, no phone frame, no browser chrome. No rainbow/RGB colours, no visible '
 'dot LEDs, no remote/app.')

# name: (size_d, size_m, ref('prod'|None), desktop_brief, mobile_brief)
S = {}

S['01-hero'] = ('1536x1024','1024x1536','prod',
 'SECTION = HERO, archetype C (card overlapping the scene). A FULL-WIDTH photographic scene fills the '
 'top: the rear of a NEUTRAL dark SUV/estate car on a driveway at DUSK, tailgate RAISED, a continuous '
 'WARM-WHITE LED light-line glowing along the whole trunk-opening frame and bathing the cargo area in '
 'light; a persons silhouette/hand near the open tailgate loading a bag; a leafy tree branch overhead; '
 'warm evening light. OVERLAPPING the bottom edge of the scene: a warm off-white OFFER CARD (radius '
 '18, thin hairline border, soft warm shadow, a thin glowing light-line along its top) holding a small '
 'ink eyebrow "BAGAZNIK SAM WITA CIE SWIATLEM", a large Montserrat headline "Otwierasz klape - bagaznik '
 'sam wita Cie swiatlem", one Mulish sub-line "Listwa LED, ktora sama zapala sie po otwarciu klapy - '
 'cieply lub bialy obrys wokol calego bagaznika.", the BIG price "34,90 zl" in Montserrat, a full-width '
 'TAIL-LIGHT RED #C21F30 CTA button with WHITE text "Zamawiam - 34,90 zl", and a pay-row of small '
 'payment badges (BLIK, Visa, Mastercard, za pobraniem). ABOVE, a slim trust strip of pills "platnosc '
 'przy odbiorze - zwrot 14 dni - wysylka z Polski - 12V, pasuje do kazdego auta" with thin outline ink '
 'icons. NO star rating and NO review numbers anywhere above the fold.',
 'MOBILE HERO (2:3 phone fold), archetype C designed FROM SCRATCH for phone - NOT a squeezed desktop. '
 'TOP ~45svh: a compact photographic scene - rear of a neutral car at dusk, tailgate raised, warm '
 'LED light-line glowing around the trunk frame (product large). BELOW, a big-type Montserrat headline '
 '(H1 >=38px) "Bagaznik sam wita Cie swiatlem", one short Mulish line, then a clearly-drawn OFFER CARD '
 '(warm off-white bg, border, warm shadow, radius 18) OVERLAPPING the bottom of the scene with negative '
 'margin: BIG price "34,90 zl" + full-width red CTA "Zamawiam - 34,90 zl" + pay-row (BLIK/Visa/MC/za '
 'pobraniem) - price+CTA visible in the fold. A slim trust strip (COD / 14 dni / z Polski / 12V). NO '
 'floating trust-chip overlay on the scene. NO star rating above the fold.')

S['02-zaufanie'] = ('1536x1024','1024x1536',None,
 'SECTION = TRUST BAR (code section, no world scene). A calm horizontal band on warm off-white #EFE9E1 '
 'with FOUR trust pills spread evenly, each a warm near-white pill (radius 10, 1px hairline border, ink '
 'text, one global pill style) with a thin 1.75px OUTLINE ink icon: "Platnosc przy odbiorze" (cash-on-'
 'delivery icon), "Zwrot 14 dni" (return arrow), "Wysylka z Polski" (small parcel), "12V - pasuje do '
 'kazdego auta" (12V plug). Full height, generous whitespace, the glowing light-line signature as a '
 'thin divider above. Icons in ink, NEVER red.',
 'MOBILE TRUST BAR (2:3): the four trust pills STACKED into a single vertical column (each full-width '
 'pill: outline ink icon + label) - "Platnosc przy odbiorze", "Zwrot 14 dni", "Wysylka z Polski", '
 '"12V - pasuje do kazdego auta". Warm off-white, one pill style, ink icons. NEVER 4 side-by-side.')

S['03-problem'] = ('1536x1024','1024x1536',None,
 'SECTION = PROBLEM (the old painful way) - a FULL-BLEED photographic scene with image weight on the '
 'LEFT and a soft warm scrim + copy on the RIGHT. Photoreal frustration: a DARK car boot at night on a '
 'dim street/parking, a person holding a PHONE as a torch, fumbling blindly in the cluttered dark cargo '
 'area, searching for something; cold muddy phone-screen light, cramped. On the RIGHT over the scrim: '
 'an ink Montserrat headline "Ciemny bagaznik i telefon w zebach" and a short Mulish line "Po zmroku '
 'grzebiesz po omacku, swiecisz telefonem i gubisz drobiazgi." The light-line signature is BROKEN / '
 'unlit here (metaphor for darkness). ABSOLUTELY NO LED strip and NO glowing frame anywhere in the '
 'frame; no tidy solution, no bright mood, no branded device.',
 'MOBILE PROBLEM (2:3): full-bleed dark night-boot scene on TOP (~55%) - a hand holding a phone-torch, '
 'fumbling in a dark cluttered car boot, cold light; BELOW on warm scrim: Montserrat headline "Ciemny '
 'bagaznik i telefon w zebach" + one short Mulish line. NO LED strip, NO glow. Signature light-line unlit.')

S['04-rozwiazanie'] = ('1536x1024','1024x1536','prod',
 'SECTION = SOLUTION (product enters as relief) - a FULL-BLEED photographic scene with image weight on '
 'the RIGHT and a soft warm scrim + copy on the LEFT (zig-zag vs problem). Photoreal: a hand RAISING a '
 'neutral car tailgate at evening; as it opens, a continuous WARM-WHITE LED light-line ignites and '
 'traces the whole trunk frame, flooding the cargo area with light; a leafy branch stirs overhead. On '
 'the LEFT over the scrim: an ink Montserrat headline "Podnosisz klape - i samo swieci" and a Mulish '
 'line "Auto-czujnik zapala cieply obrys wokol calego bagaznika. Zero szukania wlacznika." Three tiny '
 'ink outline mini-benefit chips: "samo swieci", "cieply lub bialy", "caly obrys". Product sharp and '
 'static, light and surroundings alive.',
 'MOBILE SOLUTION (2:3): full-bleed scene on TOP - a hand raising the tailgate, warm LED light-line '
 'igniting around the whole trunk frame, cargo lit; BELOW on warm scrim: Montserrat headline "Podnosisz '
 'klape - i samo swieci" + one Mulish line + one row of tiny ink chips (samo swieci / cieply lub bialy). '
 'Product static, light alive.')

S['05-zastosowania'] = ('1536x1024','1024x1536','prod',
 'SECTION = USE-CASES mosaic (contained tiles on warm paper, NOT full-bleed) - an ASYMMETRIC bento of '
 '5 unequal tiles, each a small photographic scene of the glowing trunk light-line in a different '
 'context, with a short ink Mulish caption: (1) "Zakupy po zmroku" - warm-lit boot, hands loading '
 'grocery bags at dusk; (2) "Szukasz drobiazgow" - white-lit boot on a dark parking, a hand finding a '
 'small item; (3) "Efekt premium" - a beautifully warm-glowing trunk frame, car-look; (4) "Biwak i '
 'tailgate" - an SUV boot open at a campsite at night, warm glow, cosy; (5) "Elastyczna - poprowadzisz '
 'gdzie chcesz" - the flexible strip trimmed and routed. Eyebrow "GDZIE SIE PRZYDA". One accent = one '
 'big number or annotation. Icons ink outline.',
 'MOBILE USE-CASES (2:3): the 5 use-case tiles STACKED into a single vertical column (each: small scene '
 '+ short caption) - "Zakupy po zmroku", "Szukasz drobiazgow", "Efekt premium", "Biwak i tailgate", '
 '"Elastyczna". Warm paper, ink captions. Show a peek of the next tile. NEVER a wide 3-across grid.')

S['06-demo'] = ('1536x1024','1024x1536','prod',
 'SECTION = HOW-TO-INSTALL demo 1-2-3 (contained card in warm paper, TOR-I states) - a three-step '
 'macro sequence at the car trunk frame, each step a separate photographic state with a big Montserrat '
 'step number 01/02/03 INSIDE the section and a short Mulish caption: STEP 01 "Wepnij przewod" - hands '
 'plugging the 2-wire lead (red+black) into the original tailgate lamp; STEP 02 "Wklej wzdluz ramy" - '
 'hands pressing the flexible silicone light-strip into the frame gap; STEP 03 "Dotnij nadmiar" - hands '
 'trimming the excess to length, the frame now glowing. Eyebrow "MONTAZ BEZ WIERCENIA - 3 KROKI". A '
 'stepper/progress track (active step in red accent). Soft studio light. Icons ink outline.',
 'MOBILE DEMO (2:3): the three install states STACKED into a single vertical column with a connecting '
 'line - 01 "Wepnij przewod" (hands + 2-wire lead), 02 "Wklej wzdluz ramy" (pressing strip into frame), '
 '03 "Dotnij nadmiar" (trimming, frame glowing). Big Montserrat numbers, Mulish captions, active step '
 'in red. NEVER 3 steps side-by-side at phone width.')

S['07-kolor'] = ('1536x1024','1024x1536','prod',
 'SECTION = COLOUR CHOICE (flagship TOR-I toggle, contained card in warm paper) - the SAME open car '
 'trunk shown with its light-line in TWO states side by side / toggled: LEFT "Bialy" a cool WHITE glow '
 'tracing the frame, RIGHT "Cieply bialy" a WARM glow tracing the frame. A pill TOGGLE control "Bialy | '
 'Cieply bialy" (active side filled in red accent) and two colour swatches, with a caption "Obie barwy '
 '- ta sama cena 34,90 zl". Eyebrow "WYBIERZ BARWE". Montserrat labels, Mulish caption, ink outline '
 'icons; accent red only on the active toggle and swatch ring.',
 'MOBILE COLOUR (2:3): the trunk shown in one big state with a full-width pill TOGGLE "Bialy | Cieply '
 'bialy" (active in red) below it, two swatches, caption "Obie barwy - ta sama cena 34,90 zl". Tapping '
 'switches the glow colour. Montserrat labels, Mulish caption.')

S['08-korzysci'] = ('1536x1024','1024x1536','prod',
 'SECTION = BENEFITS (code section) - an ASYMMETRIC bento of UNEQUAL cards, each a thin 1.75px OUTLINE '
 'ink icon + a Montserrat heading + a short Mulish benefit line with an anchor: "Samo swieci" (auto-'
 'sensor - open lid icon), "Elastyczna, cieta na dlugosc" (flexible strip - pasuje do kazdego auta), '
 '"Montaz bez wiercenia" (wpiecie w lampe klapy), "Wodoodporna" (water-drop), "Bialy lub cieply" (two '
 'swatches), "12V - kazde auto" (12V plug). One card carries a BIG number-as-graphic "2M" or "12V" in '
 'Mulish. Eyebrow "DLACZEGO LSNIK". Icons ink, NEVER red. NO rainbow, NO remote, NO "X diod".',
 'MOBILE BENEFITS (2:3): the six benefit cards STACKED into a single vertical column (icon + heading + '
 'short line each): "Samo swieci", "Elastyczna, cieta na dlugosc", "Montaz bez wiercenia", "Wodoodporna", '
 '"Bialy lub cieply", "12V - kazde auto". Ink outline icons. Show a peek of the next card.')

S['09-porownanie'] = ('1536x1024','1024x1536','prod',
 'SECTION = HONEST COMPARISON (code, a two-column table - NOT bento) - LEFT column "Lsnik (auto-obrys)" '
 'with ink checkmarks, RIGHT column "Latarka w telefonie / dorazna lampka" with muted crosses. Rows: '
 '"Swieci samo po otwarciu klapy", "Oswietla caly bagaznik", "Rece wolne", "Wyglada premium". Below, a '
 'small HONEST note in Mulish: "Szczerze: przy niektorych autach docinasz taste na dlugosc, a oryginalna '
 'instrukcja jest po chinsku - damy Ci prosta po polsku." Accent red only on the "check" marks of the '
 'Lsnik column. Eyebrow "LSNIK vs STARY SPOSOB". Icons ink.',
 'MOBILE COMPARISON (2:3): a compact stacked two-column comparison - "Lsnik" vs "Latarka w telefonie" '
 'with rows (swieci samo / caly bagaznik / rece wolne / premium), red checks on Lsnik side. Below the '
 'honest Mulish note about trimming to length + Polish instructions.')

S['10-mid-cta'] = ('1536x1024','1024x1536','prod',
 'SECTION = MID-CTA (dedicated CTA section, full-bleed) - a warm evening driveway scene: a neutral car '
 'boot open with the WARM glowing light-line around the frame, grocery bags / a bike being loaded, calm '
 'premium mood. Over a soft scrim: a Montserrat headline "Twoj bagaznik zasluguje na swiatlo", the price '
 '"34,90 zl", and a DESIGNED full-width TAIL-LIGHT RED #C21F30 CTA button with white text "Zamow Lsnika" '
 'plus a small "platnosc przy odbiorze" note under it. A re-CTA moment. Icons ink.',
 'MOBILE MID-CTA (2:3): warm evening boot scene on top, then over a scrim a Montserrat headline "Twoj '
 'bagaznik zasluguje na swiatlo" + price "34,90 zl" + full-width red CTA "Zamow Lsnika" + "za pobraniem".')

S['11-dowod'] = ('1536x1024','1024x1536','prod',
 'SECTION = SOCIAL PROOF (code) - TWO rows on warm paper. TOP row: three review cards (warm off-white, '
 'radius 18, hairline border) each with a small ink avatar, red star glyphs, and a short quote in Mulish '
 '("Looks great", "Fast shipment", "The tape is great") plus one honest 4-star card ("Doesnt fit the '
 'boot but looks great around the roof trim"). A small stat line UNDER the fold: red star glyphs + '
 '"4,6 / 5" (the number in ink Mulish, NOT red) + "16 ocen". BOTTOM row labelled "Zdjecia od kupujacych": '
 'three framed real customer photos (slightly taped-corner) - a white-lit car boot in use, an unboxing '
 'with the coiled strip + leads, a product box. Eyebrow "CO MOWIA KIEROWCY". Stars red, rating number ink.',
 'MOBILE PROOF (2:3): a vertical stack - two review cards (red stars, Mulish quote), a stat line "4,6/5 '
 '(ink) - 16 ocen" with red stars, then a "Zdjecia od kupujacych" row of two framed customer photos '
 '(white-lit boot in use, unboxing). Stars red, rating number ink.')

S['12-zamow'] = ('1536x1024','1024x1536','prod',
 'SECTION = ORDER / CHECKOUT (clean packshot) - a clean warm off-white area centred on a studio PACKSHOT '
 'of the product (the coiled milky-white silicone light-strip with its red+black two-wire lead, next to '
 'a short segment glowing a warm line along a trunk frame). A checkout CARD (radius 18, warm shadow) '
 'with: a COLOUR SWATCH selector "Kolor: Bialy | Cieply bialy" (active in red), the BIG price "34,90 zl" '
 'in Montserrat, a full-width TAIL-LIGHT RED CTA "Kup teraz - place przy odbiorze" in white, and under '
 'it small risk-reducers "za pobraniem - zwrot 14 dni - wysylka z Polski". Order: price -> CTA -> risk. '
 'Eyebrow "ZAMOW LSNIKA". Icons ink.',
 'MOBILE ORDER (2:3): a clean packshot of the coiled silicone strip on top, then a checkout card - '
 'colour swatch "Bialy | Cieply bialy" (active red), big price "34,90 zl", full-width red CTA "Kup teraz '
 '- place przy odbiorze", small risk-reducers (za pobraniem / zwrot 14 dni / z Polski).')

S['13-faq'] = ('1536x1024','1024x1536','prod',
 'SECTION = FAQ (code, accordion + media) - a two-column layout: LEFT a sticky studio PACKSHOT of the '
 'coiled silicone light-strip; RIGHT an accordion of questions with thin ink +/- toggles (NOT red): '
 '"Czy pasuje do mojego auta?" (elastyczna, docinasz na dlugosc), "Czy montaz jest trudny?" (bezinwazyjny, '
 'wpiecie w lampe, instrukcja PL), "Bialy czy cieply?" (Twoj wybor, ta sama cena), "Czy swieci sama?" '
 '(auto-czujnik po otwarciu klapy), "Wodoodporna?" (tak), "Jakie zasilanie?" (12V - kazde auto). First '
 'item expanded. Eyebrow "PYTANIA I ODPOWIEDZI". +/- toggles in ink charcoal.',
 'MOBILE FAQ (2:3): a full-width accordion of the six questions with ink +/- toggles, first expanded, '
 'a small packshot thumbnail on top. Questions as above. Toggles ink, NEVER red.')

S['14-final'] = ('1536x1024','1024x1536','prod',
 'SECTION = FINAL CTA (life with product, full-bleed) - a wide cinematic evening scene: a neutral car '
 'on a driveway, boot open with a beautiful WARM glowing light-line around the whole frame, a person '
 'calmly loading; steam from a thermos, leaves stirring; reassuring premium mood. Over a soft scrim: a '
 'Montserrat headline "Wsiadaj w wieczor ze swiatlem w bagazniku", a small mini-review line, and a '
 'DESIGNED full-width TAIL-LIGHT RED CTA "Zamawiam Lsnika" in white. The light-line signature closes the '
 'composition, tracing the frame. Icons ink.',
 'MOBILE FINAL (2:3): wide evening driveway boot scene glowing warm on top, then over a scrim a '
 'Montserrat headline "Wsiadaj w wieczor ze swiatlem w bagazniku" + full-width red CTA "Zamawiam Lsnika".')

idx = []
for name, (sd, sm, ref, bd, bm) in S.items():
    body_d = HEAD + 'SECTION brief: ' + bd + DNA + (PRODFID if ref else '') + NEG
    io.open(os.path.join(HERE, 'p-%s.txt' % name), 'w', encoding='utf-8').write(body_d)
    idx.append({'name': name, 'size': sd, 'ref': 'prod' if ref else None})
    body_m = HEAD + 'SECTION brief: ' + bm + DNA + (PRODFID if ref else '') + NEG
    io.open(os.path.join(HERE, 'p-%s-m.txt' % name), 'w', encoding='utf-8').write(body_m)
    idx.append({'name': name + '-m', 'size': sm, 'ref': 'prod' if ref else None})

io.open(os.path.join(HERE, '_index.json'), 'w', encoding='utf-8').write(json.dumps(idx, ensure_ascii=False, indent=1))
print('napisano %d promptow (%d sekcji x d+m), _index.json z %d pozycjami' % (len(S)*2, len(S), len(idx)))

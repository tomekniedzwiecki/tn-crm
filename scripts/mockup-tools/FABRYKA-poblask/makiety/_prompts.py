# -*- coding: utf-8 -*-
"""Prompty makiet POBLASK (F2). Wspolne STYLE-DNA (KANON+PARTYTURA z TOKENS-MAKIETY) wstrzykiwane
do KAZDEGO promptu. Prawdziwe dane WPROST w cudzyslowach. ref='prod' -> /edits z _product-ref.png."""
import os, io, json, sys
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))

UI = ("A high-fidelity, pixel-perfect WEBSITE UI MOCKUP (Figma-style, clean modern design system, "
 "crisp interface rendering) of ONE section of a Polish e-commerce landing page for a car-interior "
 "RGB ambient LED light-strip brand \"Poblask\". A real interface as if already built — NOT concept "
 "art, NOT a painterly illustration. ")

STYLE = ("STYLE-DNA (identical across the whole series): a COOL LIGHT LAVENDER / PLATINUM page world — "
 "page background #F6F5FB, secondary panels #ECEBF4 and #DEDCEC; ink text #1B1830, body #35314A, 1px "
 "hairlines #DAD7E8. EXACTLY ONE accent colour — ELECTRIC VIOLET #6A3DE8 — used ONLY for the CTA "
 "button fill, the glowing LIGHT-LINE signature (a thin 2px glowing hairline, violet core with a soft "
 "bloom, occasionally shifting into a subtle RGB spectrum, echoing the product) and star glyphs; ALL "
 "functional icons are thin 1.75px OUTLINE strokes in ink #1B1830, NEVER violet. Typography: display "
 "face MONTSERRAT (a heavy geometric sans, 800/900) for headlines, brand, big numbers and prices; "
 "text face MULISH (a warm humanist sans, 400/600) for eyebrows, body, labels and specs — the two "
 "faces clearly CONTRAST (geometric display vs humanist text). One series radius: 16px on cards, 10px "
 "on chips/pills. Soft LAYERED COOL shadows (violet-tinted rgba(40,30,80,.06-.12), never pure black) "
 "plus a subtle 3% grain. Generous 8pt whitespace. Publishing SIGNATURE = a thin glowing 2px LIGHT-LINE "
 "(violet + soft bloom, occasional subtle RGB spectrum) used as a baseline / divider (the product IS a "
 "line of light). LIGHT page backgrounds only — dark appears ONLY inside full-bleed photographic scenes "
 "of the car interior at night. Polish diacritics rendered correctly. ")

PROD = ("PRODUCT FIDELITY (keep this exact object wherever the product appears): a SLIM, FLAT, FLEXIBLE "
 "car-interior RGB LED ambient light-strip — a thin dark flexible base with a light-guide top edge that "
 "emits a CONTINUOUS LINE of colour (full RGB, can show a smooth rainbow gradient); a THIN FLAT STRIP, "
 "NOT a round fibre-optic rope, NOT a thick tube, NOT a glass neon tube. Powered by a small translucent "
 "USB controller module (USB-A plug + one button). Installed it runs as ONE continuous glowing line "
 "along a car-interior edge (dashboard / door trim / footwell). Base variant = ONE 110 cm strip = ONE "
 "line of light (NOT a whole-car multi-zone kit). NO printed brand text on the product. ")

NEG = ("EXACTLY ONE SECTION AND NOTHING ELSE — do not add a wordmark, a price, a star-rating or benefit "
 "chips unless they belong to THIS section. No brand text 'Fccemc'/'FCCEMC'/'Stone's Store'/'Vehicle "
 "Intelligent Lighting System', no shop name, no watermark, no phone UI frame around the whole image, "
 "no browser chrome, no round fibre-optic rope, no neon glass tube. Do NOT imply the whole car interior "
 "is outlined by one strip. No burned English text; Polish diacritics correct. ")

S = {}

# ============ DESKTOP (1536x1024) ============
S["01-hero"] = ("prod", "1536x1024",
 "SECTION = HERO, archetype C (offer card overlapping a full-bleed scene). A FULL-BLEED photographic "
 "night car-interior scene fills the section: a slim RGB light-strip glows as ONE continuous line "
 "(electric violet fading to cyan) along the dashboard edge, soft glow reflecting on the dash, city "
 "bokeh through the windshield, premium calm night mood. A slim topbar at the very top shows the "
 "wordmark 'Poblask' (left) and a slim trust strip of pills ABOVE THE FOLD: 'Platnosc przy odbiorze - "
 "Zwrot 14 dni - Wysylka z Polski - Montaz bez warsztatu' with thin outline ink icons. Over a soft "
 "lavender scrim on the LEFT: a small ink eyebrow 'TWOJE AUTO W TWOIM KOLORZE', a large Montserrat "
 "headline 'Nastrojowa poswiata wnetrza - jednym dotknieciem', one Mulish sub-line '64 kolory, reaguje "
 "na muzyke, montaz w 5 minut przez USB.' Then, OVERLAPPING the bottom edge of the scene with a "
 "negative margin, a crisp OFFER CARD (radius 16, thin hairline border, soft violet shadow, a thin "
 "glowing violet light-line along its top) holding the big price '39,90 zl' in Montserrat, a full-width "
 "electric violet #6A3DE8 CTA button with WHITE text 'Zamawiam - 39,90 zl', and beneath it a pay-row "
 "of small payment badges (BLIK, Visa, Mastercard, za pobraniem). NO star rating and NO review numbers "
 "above the fold. The color flows gently ALONG the strip (motion zone) - keep it free of text. ")

S["02-zaufanie"] = (None, "1536x1024",
 "SECTION = TRUST BAR: a slim full-width band on paper #ECEBF4, a structural separator at FULL height "
 "(no dead lower third). Four trust items in one row, each a pill/lockup with a thin 1.75px OUTLINE ink "
 "icon plus a Mulish label: 'Platnosc przy odbiorze', 'Zwrot 14 dni', 'Wysylka z Polski', 'Montaz bez "
 "warsztatu (USB)'. One consistent pill style, ink icons (no violet). A thin glowing violet light-line "
 "runs through as the divider. Calm, premium, minimal. NO product photo, NO price. ")

S["03-problem"] = (None, "1536x1024",
 "SECTION = PROBLEM, the dull 'before' - a FULL-BLEED photographic scene with image weight on the LEFT "
 "and a soft lavender scrim + copy on the RIGHT. Photoreal DIM, LIFELESS car interior at night: a plain "
 "dark dashboard, cold muted street light, monotonous grey mood, no colour, no life. On the RIGHT over "
 "the scrim: an ink Montserrat headline 'Wieczorem wnetrze auta gasnie w szarosci' and a short Mulish "
 "line 'Ciemna, martwa deska - zero klimatu, zero nastroju.' The signature light-line is OFF / broken / "
 "unlit here (a metaphor for the darkness). ABSOLUTELY NO light-strip, NO RGB glow, NO ambient light, "
 "NO our product anywhere in the frame; just an ordinary unlit dark cabin. ")

S["04-rozwiazanie"] = ("prod", "1536x1024",
 "SECTION = SOLUTION / transformation - a FULL-BLEED photographic scene with image weight on the RIGHT "
 "and a soft scrim + copy on the LEFT (zig-zag, opposite side to the problem section). Photoreal: the "
 "SAME cabin now ALIVE - a slim RGB light-strip glows as one warm continuous line along the dashboard, "
 "the interior comes alive with colour and mood, soft reflection on the dash. On the LEFT over a "
 "lavender scrim: an ink Montserrat headline 'Jedna linia swiatla - i wnetrze ozywa' and a short Mulish "
 "line 'Nastrojowa poswiata wzdluz deski, w Twoim kolorze.', plus a small triad of mini-benefits '64 "
 "kolory / z aplikacji / w 5 minut' with thin outline ink icons. The signature light-line runs along "
 "the dashboard and 'holds' the glow. Color flows gently along the strip (motion zone free of text). ")

S["05-sterowanie"] = ("prod", "1536x1024",
 "SECTION = CONTROL '64 kolory' - a TOR-I interactive-style card on paper showing THREE SEPARATE STATE "
 "FRAMES in a row with a stepper, each showing a phone with a clean app plus the strip glowing, on a "
 "light card. STATE 01 'Wybierz kolor': a phone app colour-wheel, the strip a solid violet. STATE 02 "
 "'Plynne RGB': the app in gradient mode, the strip a smooth rainbow. STATE 03 'Reaguje na muzyke': the "
 "app music mode with a subtle equalizer, the strip pulsing to a beat. A Montserrat headline '64 kolory "
 "pod reka - z aplikacji i pilotem' and a Mulish line 'Bluetooth, iOS i Android - albo pilotem.' Each "
 "state is a small card with a step number 01 / 02 / 03 in Montserrat; the ACTIVE step accented violet, "
 "the others ink. Outline ink icons. The three states MUST be distinct frames, not one static photo. "
 "The light-line/spectrum signature culminates here. ")

S["06-montaz"] = ("prod", "1536x1024",
 "SECTION = INSTALL 'jak to dziala' 1-2-3, a TOR-I card on paper showing THREE SEPARATE STATE FRAMES in "
 "a row with a stepper, macro, soft light. STATE 01 'Przyklej wzdluz krawedzi': a hand pressing the slim "
 "light-strip into a dashboard trim gap with adhesive tape and a small plastic pry tool. STATE 02 'Wepnij "
 "w USB': a hand plugging the small translucent USB controller into a USB port. STATE 03 'Wybierz kolor': "
 "a hand choosing a colour in the phone app, the strip glowing. A Montserrat headline 'Montaz w 5 minut - "
 "bez warsztatu' and a Mulish line 'Przytniesz tasme na wymiar - pasuje do kazdego auta.' Each state a "
 "small card with step number 01 / 02 / 03; the active step violet, others ink. Outline ink icons. The "
 "three states MUST be distinct frames, not one static photo. ")

S["07-korzysci"] = ("prod", "1536x1024",
 "SECTION = BENEFITS bento, UNEVEN tiles on paper (asymmetric, radius 16, hairline borders, cool "
 "violet-tinted layered shadow). Four benefit tiles, each a thin outline ink icon + a big Montserrat "
 "number/word + a Mulish feature-to-benefit line: (1) a big '64' with 'kolory' - 'Pelne RGB i plynne "
 "przejscia - dobierz nastroj'. (2) 'Aplikacja + pilot' - 'Sterujesz z telefonu (Bluetooth) albo "
 "pilotem'. (3) 'Reaguje na muzyke' - 'Tasma pulsuje w rytm - wnetrze gra z Twoim soundem'. (4) 'USB - "
 "bez warsztatu' - 'Wepnij i gotowe; przytniesz na wymiar'. ONE tile holds a small clean packshot of "
 "the slim RGB light-strip + USB controller (image at least 40% of that tile, filling its height - not "
 "a postage stamp). NO 'neon', NO '16 mln kolorow'. Functional icons ink, not violet. ")

S["08-porownanie"] = (None, "1536x1024",
 "SECTION = COMPARISON, an honest TWO-COLUMN TABLE (not bento) on paper. Column A header 'Poblask - "
 "tasma LED na USB', column B header 'Montaz swiatlowodow w warsztacie'. Rows: 'Cena' (A ok '39,90 zl' / "
 "B 'kilkaset zl'), 'Montaz' (A ok 'sam, 5 min, USB' / B 'wizyta w warsztacie'), 'Sterowanie' (A ok 'app "
 "+ pilot + muzyka' / B 'zaleznie'), 'Przenosisz / przycinasz' (A ok 'tak, na wymiar' / B 'na stale'). "
 "One HONEST small-print caveat line in Mulish under the table: 'Na ostrych lukach tasma jest sztywnawa "
 "- najlepiej proste odcinki (utniesz na wymiar).' Only the check ticks in column A are violet; "
 "everything else ink. Clean editorial table with hairline rules. ")

S["09-wideo"] = ("prod", "1536x1024",
 "SECTION = VIDEO DEMO, a wide module on paper: a large VIDEO POSTER card (radius 16, hairline border, "
 "soft violet shadow) showing a photoreal night car interior with the RGB light-strip glowing along the "
 "dashboard and a hand holding a phone with the app; a single centered PLAY BUTTON (a violet-outlined "
 "circle with a play triangle) overlays the poster. Beside/above it a Montserrat headline 'Zobacz "
 "Poblask w akcji' and a Mulish caption 'Prawdziwe nagranie: kolory, muzyka, jeden dotkniecie.' Clean, "
 "premium. ONE poster only. NO burned text on the poster, NO brand watermark. ")

S["10-mid-cta"] = ("prod", "1536x1024",
 "SECTION = MID-PAGE CTA, a dedicated FULL-BLEED call-to-action over a WARM EVENING car interior scene: "
 "the RGB light-strip glowing softly along the dashboard, a calm relaxed mood, city lights beyond. "
 "Centered content: an ink/white Montserrat headline 'Odmien wnetrze auta - jeszcze dzis', the price "
 "'39,90 zl', and a DESIGNED electric violet #6A3DE8 CTA button with WHITE text 'Odmien wnetrze - 39,90 "
 "zl', with 'platnosc przy odbiorze' beneath it. Order: price -> CTA -> reassurance. A real, shaped "
 "button, not a bare link. No garish RGB overload, no scam mood. ")

S["11-opinie"] = (None, "1536x1024",
 "SECTION = REVIEWS / social proof (this is BELOW the fold), a grid of review cards, some with a small "
 "real buyer PHOTO of a dashboard with the light-strip glowing. A header lockup shows '* 4,9 / 5 - 99 "
 "ocen' - the STARS in violet #6A3DE8, the rating number '4,9/5' in ink Mulish (NOT violet). Four honest "
 "review cards with first names and short Polish quotes, INCLUDING real caveats: 'Swietna jakosc LED, "
 "kolory z aplikacji rewelacja.', 'Montaz prosty - proste odcinki super, na ostrych lukach chwila "
 "cierpliwosci.', 'Reaguje na muzyke - wieczorem super klimat.', 'Sterowanie z telefonu i pilot, wszystko "
 "dziala.'. Two cards include a small real photo of a car dashboard glowing. Cards radius 16, hairline "
 "borders, cool shadow. Honest and human, not glossy. NO big product hero shot here. ")

S["12-galeria"] = ("prod", "1536x1024",
 "SECTION = GALLERY, a clean grid of SQUARE (1:1) tiles with one series radius and a lightbox feel. Four "
 "tiles of the SAME slim RGB light-strip in real contexts: (1) the strip glowing a full RGB rainbow "
 "(product beauty); (2) installed as a glowing line along a real car dashboard at night; (3) macro of "
 "the small translucent USB controller with its button; (4) a hand holding the coiled flexible strip "
 "glowing in colour. Consistent cool lighting, NO burned text, NO brand prints. Uniform tile radius and "
 "even gutters. ")

S["13-zamow"] = ("prod", "1536x1024",
 "SECTION = ORDER / inline checkout, a wide module with a skinned checkout form. LEFT: a clean packshot "
 "of the slim RGB light-strip + USB controller on a plain light lavender field. RIGHT: an inline "
 "checkout card (radius 16, hairline border, cool shadow, violet top light-line) with the price '39,90 "
 "zl' in Montserrat, form fields 'Imie i nazwisko', 'Telefon', 'Adres' skinned in the tokens, a payment "
 "choice highlighting 'Platnosc przy odbiorze (COD)', a full-width electric violet #6A3DE8 CTA button "
 "with WHITE text 'Kup teraz - place przy odbiorze', then a small risk-reduction line 'Zwrot 14 dni - "
 "Wysylka z Polski'. Order: price -> CTA -> reassurance. ")

S["14-faq"] = ("prod", "1536x1024",
 "SECTION = FAQ, an accordion (full-width rows, thin hairline dividers, +/- outline ink toggles) beside "
 "a STICKY packshot of the slim RGB light-strip + USB controller (not a bare accordion). Questions in "
 "ink Montserrat with Mulish answers: 'Czy pasuje do mojego auta?' (answer mentions 'przycinasz na "
 "wymiar, 110 cm'), 'Trudny montaz?' ('USB plug and play; na nierownej desce chwila cierpliwosci'), 'Za "
 "jaskrawe?' ('regulacja jasnosci'), 'Reaguje na muzyke?' ('tak, czujnik dzwieku'), 'Pilot i "
 "aplikacja?' ('tak, Bluetooth i pilot'), 'Zasilanie?' ('USB 5V'). Calm, trustworthy, roomy. ")

S["15-final"] = ("prod", "1536x1024",
 "SECTION = FINAL CTA, a wide cinematic NIGHT car interior / night drive: calm and premium, the RGB "
 "light-strip glowing softly as one line along the dashboard, city lights beyond the windshield - "
 "life-with-product, reassuring. Centered: a white/ink Montserrat headline 'Miej wnetrze w swoim "
 "klimacie', a DESIGNED electric violet #6A3DE8 CTA button with WHITE text 'Zamawiam Poblask', and a "
 "tiny one-line mini-review beneath. The signature light-line closes the composition along the dash. ")

# ============ MOBILE (1024x1536) ============
S["01-hero-m"] = ("prod", "1024x1536",
 "MOBILE HERO (portrait phone, 2:3), archetype C, designed FROM ZERO for the phone fold - NOT a squeezed "
 "desktop. A slim topbar: wordmark 'Poblask' + a one-line trust strip 'przy odbiorze - 14 dni - z "
 "Polski'. TOP ~45% = a photographic NIGHT car-interior scene: a slim RGB light-strip glowing as one "
 "line (violet to cyan) along the dashboard, city bokeh. BELOW: a big Montserrat hook 'Twoje auto w "
 "Twoim kolorze' (large H1), one Mulish line '64 kolory, reaguje na muzyke, montaz przez USB', then an "
 "OFFER CARD OVERLAPPING the bottom of the scene (card bg, hairline border, cool shadow, radius 16, "
 "violet top light-line): the price '39,90 zl' + a full-width violet CTA 'Zamawiam - 39,90 zl' (white) "
 "+ a pay-row (BLIK / Visa / Mastercard / za pobraniem). At most ONE line of benefits. NO floating "
 "trust-chip overlay on the scene; NO star rating above the fold. Everything decisive INSIDE the fold. ")

S["02-zaufanie-m"] = (None, "1024x1536",
 "MOBILE TRUST BAR (portrait 2:3), phone-first. A compact band on paper #ECEBF4 with four trust items "
 "STACKED into a single vertical column (NEVER four side-by-side at 390px), each a pill with a thin "
 "1.75px outline ink icon + Mulish label: 'Platnosc przy odbiorze', 'Zwrot 14 dni', 'Wysylka z Polski', "
 "'Montaz bez warsztatu (USB)'. One pill style, ink icons. A thin glowing violet light-line divider. ")

S["03-problem-m"] = (None, "1024x1536",
 "MOBILE PROBLEM (portrait 2:3), phone-first. A photoreal DIM lifeless night car interior fills the top: "
 "a plain dark dashboard, cold muted light, grey monotonous mood, no colour. BELOW on lavender paper: an "
 "ink Montserrat headline 'Wnetrze gasnie w szarosci' and ONE short Mulish line 'Ciemna, martwa deska - "
 "zero klimatu.' The signature light-line OFF / unlit. NO light-strip, NO glow, NO our product anywhere. ")

S["04-rozwiazanie-m"] = ("prod", "1024x1536",
 "MOBILE SOLUTION (portrait 2:3), phone-first. TOP: a photoreal night car interior TRANSFORMED - a slim "
 "RGB light-strip glowing as one warm line along the dashboard, the cabin alive with colour. BELOW: an "
 "ink Montserrat headline 'Jedna linia swiatla - wnetrze ozywa' + ONE Mulish line 'Nastrojowa poswiata "
 "wzdluz deski, w Twoim kolorze.' + a single row of three tiny outline-ink mini-benefits '64 kolory / z "
 "aplikacji / 5 minut'. Designed for the phone, not a squeezed desktop. Color flows along the strip. ")

S["05-sterowanie-m"] = ("prod", "1024x1536",
 "MOBILE CONTROL '64 kolory' (portrait 2:3), TOR-I. THREE state cards STACKED into a single VERTICAL "
 "column with a connecting line (NEVER three side-by-side). 01 'Wybierz kolor' (phone app colour-wheel, "
 "strip solid violet). 02 'Plynne RGB' (app gradient, strip rainbow). 03 'Reaguje na muzyke' (app music "
 "mode, strip pulsing). Step numbers 01 / 02 / 03 in Montserrat, short Mulish captions, the active step "
 "violet. A headline 'Sterujesz z aplikacji i pilotem'. Phone-first, not a squeezed desktop. ")

S["06-montaz-m"] = ("prod", "1024x1536",
 "MOBILE INSTALL 1-2-3 (portrait 2:3), TOR-I. THREE state cards STACKED into a single VERTICAL column "
 "with a connecting line (NEVER three side-by-side). 01 'Przyklej wzdluz krawedzi' (a hand pressing the "
 "strip into a dashboard trim gap with adhesive + pry tool). 02 'Wepnij w USB' (a hand plugging the USB "
 "controller). 03 'Wybierz kolor' (a hand in the phone app, strip glowing). Step numbers 01/02/03 in "
 "Montserrat, short Mulish captions, active step violet. A headline 'Montaz w 5 minut, bez warsztatu'. ")

S["07-korzysci-m"] = ("prod", "1024x1536",
 "MOBILE BENEFITS (portrait 2:3), phone-first. Four benefit cards STACKED vertically (NOT a desktop "
 "grid), each a thin outline ink icon + big Montserrat word/number + one Mulish line: '64 kolory' - "
 "'Pelne RGB, plynne przejscia'; 'Aplikacja + pilot' - 'Sterujesz z telefonu albo pilotem'; 'Reaguje na "
 "muzyke' - 'Pulsuje w rytm'; 'USB - bez warsztatu' - 'Wepnij i gotowe, przytniesz na wymiar'. One card "
 "holds a small clean packshot of the strip + USB controller. Icons ink, not violet. ")

S["08-porownanie-m"] = (None, "1024x1536",
 "MOBILE COMPARISON (portrait 2:3), phone-first. An honest comparison as STACKED cards (NOT a wide "
 "table): a 'Poblask - tasma na USB' card (violet ticks) vs a 'Montaz w warsztacie' card, each listing "
 "rows: Cena ('39,90 zl' vs 'kilkaset zl'), Montaz ('sam, 5 min, USB' vs 'warsztat'), Sterowanie ('app "
 "+ pilot + muzyka' vs 'zaleznie'), Przycinasz ('tak, na wymiar' vs 'na stale'). One honest Mulish "
 "caveat line: 'Na ostrych lukach tasma jest sztywnawa - najlepiej proste odcinki.' Ticks violet, rest "
 "ink. ")

S["09-wideo-m"] = ("prod", "1024x1536",
 "MOBILE VIDEO DEMO (portrait 2:3), phone-first. A large vertical VIDEO POSTER card (radius 16, hairline "
 "border) showing a photoreal night car interior with the RGB light-strip glowing and a hand with a "
 "phone app; a centered violet-outlined PLAY BUTTON overlays it. Above: a Montserrat headline 'Zobacz "
 "Poblask w akcji' and a Mulish caption 'Prawdziwe nagranie: kolory i muzyka.' ONE poster only, NO "
 "burned text. ")

S["10-mid-cta-m"] = ("prod", "1024x1536",
 "MOBILE MID-CTA (portrait 2:3). A warm evening car-interior scene fills the top: the RGB light-strip "
 "glowing softly along the dashboard, calm. BELOW, centered: a Montserrat headline 'Odmien wnetrze auta', "
 "the price '39,90 zl', a DESIGNED full-width violet CTA 'Odmien wnetrze - 39,90 zl' (white), and "
 "'platnosc przy odbiorze'. Order price -> CTA -> reassurance. ")

S["11-opinie-m"] = (None, "1024x1536",
 "MOBILE REVIEWS (portrait 2:3), below the fold. A header '* 4,9 / 5 - 99 ocen' (stars violet #6A3DE8, "
 "number '4,9/5' in ink Mulish). Review cards STACKED vertically with first names and short honest "
 "Polish quotes including caveats: 'Swietna jakosc LED, kolory z app rewelacja.', 'Montaz prosty - na "
 "ostrych lukach chwila cierpliwosci.', 'Reaguje na muzyke, super klimat.'. One card includes a small "
 "real photo of a car dashboard glowing. Cards radius 16, hairline, cool shadow. Honest, human. ")

S["12-galeria-m"] = ("prod", "1024x1536",
 "MOBILE GALLERY (portrait 2:3), phone-first. A vertical stack / 2-column grid of SQUARE (1:1) tiles of "
 "the SAME slim RGB light-strip: (1) glowing full RGB rainbow; (2) installed as a glowing line on a real "
 "dashboard at night; (3) macro of the USB controller; (4) a hand holding the coiled glowing strip. "
 "Uniform tile radius, even gutters, lightbox feel. NO burned text. ")

S["13-zamow-m"] = ("prod", "1024x1536",
 "MOBILE ORDER / inline checkout (portrait 2:3), phone-first single column. TOP: a clean packshot of the "
 "slim RGB light-strip + USB controller on a plain light lavender field. BELOW: an inline checkout card "
 "(radius 16, hairline, violet top light-line): the price '39,90 zl', stacked form fields 'Imie i "
 "nazwisko', 'Telefon', 'Adres', a highlighted 'Platnosc przy odbiorze (COD)', a full-width violet CTA "
 "'Kup teraz - place przy odbiorze' (white), and a small line 'Zwrot 14 dni - Wysylka z Polski'. ")

S["14-faq-m"] = ("prod", "1024x1536",
 "MOBILE FAQ (portrait 2:3), phone-first. A full-width accordion (thin hairline dividers, +/- outline "
 "ink toggles) with a small sticky packshot of the strip + USB controller at the top. Questions in ink "
 "Montserrat with Mulish answers: 'Czy pasuje do mojego auta?' ('przycinasz na wymiar, 110 cm'), 'Trudny "
 "montaz?' ('USB plug and play'), 'Za jaskrawe?' ('regulacja jasnosci'), 'Reaguje na muzyke?' ('tak'), "
 "'Pilot i aplikacja?' ('tak'). Calm, roomy. ")

S["15-final-m"] = ("prod", "1024x1536",
 "MOBILE FINAL (portrait 2:3). A calm night car interior fills the top: the RGB light-strip glowing "
 "softly as one line along the dashboard, city lights beyond. BELOW, centered: a Montserrat headline "
 "'Miej wnetrze w swoim klimacie', a DESIGNED full-width violet CTA 'Zamawiam Poblask' (white), a "
 "one-line mini-review. The signature light-line closes it along the dash. ")

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

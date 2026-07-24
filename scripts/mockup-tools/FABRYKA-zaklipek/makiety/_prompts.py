# -*- coding: utf-8 -*-
"""Buduje pliki promptow makiet ZAKLIPEK (F2). Wspolne STYLE-DNA (KANON+PARTYTURA z
TOKENS-MAKIETY) wstrzykiwane do KAZDEGO promptu. Prawdziwe dane WPROST w cudzyslowach.
Emituje p-<name>.txt oraz index JSON (name,size,ref) do sterowania generacja."""
import os, io, json
sys=__import__("sys"); sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))

UI = ("A high-fidelity, pixel-perfect WEBSITE UI MOCKUP (Figma-style, clean modern design "
 "system, crisp interface rendering) of ONE section of a Polish e-commerce landing page for a "
 "clip-on desk USB hub brand \"Zaklipek\". A real interface as if already built — NOT concept "
 "art, NOT a painterly illustration. ")

STYLE = ("STYLE-DNA (identical across the whole series): a COOL near-white / PLATINUM world — page "
 "background #F7F8FA, secondary panels #EEF0F4 and #E1E5EC; ink text #1C2530, body #38424E, 1px "
 "hairlines #D5DAE2. EXACTLY ONE accent colour — USB SuperSpeed AZURE #0A6EBD — used ONLY for the "
 "CTA button fill, the edge-line/tick signature and star glyphs; ALL functional icons are thin "
 "1.75px OUTLINE strokes in ink #1C2530, NEVER azure. Typography: display face BRICOLAGE GROTESQUE "
 "(a heavy, engineered grotesk) for headlines, brand, big numbers and prices; text face FIGTREE "
 "(a clean humanist sans) for eyebrows, body, labels and specs — the two faces clearly CONTRAST. "
 "One series radius: 14px on cards, 8px on chips/pills. Soft LAYERED COOL shadows (slate-tinted "
 "rgba(20,35,60,.06-.12), never pure black) plus a subtle 3% grain. Generous 8pt whitespace. "
 "Publishing SIGNATURE = a thin 1px horizontal 'desk-edge' hairline carrying tiny calibration tick "
 "marks and a '5-28 mm' caliper scale in azure (technical, not a handwritten swash), used as a "
 "baseline / divider. Polish diacritics rendered correctly. ")

PROD = ("PRODUCT FIDELITY (keep this exact body wherever the product appears): a slim BRUSHED-SILVER "
 "ALUMINIUM clip-on USB hub bar with a darker GRAPHITE front panel carrying a row of FOUR USB-A 3.0 "
 "ports (BLUE port interiors) and a tiny LED, a vertical clamp collar that hooks over the front edge "
 "of a desk with a knurled thumb-screw underneath and an anti-slip silicone pad, and a small DC 5V "
 "power port on the side. NO card reader / SD-TF slot, NO HDMI, NO '10Gbps' text, NO 7-in-1, NO extra "
 "ports, NO black colorway, NOT a cube, NOT a cylinder, no printed brand name on the device. ")

NEG = ("EXACTLY ONE SECTION AND NOTHING ELSE — do not add a wordmark, a price, a star-rating or "
 "benefit chips unless they belong to THIS section. No brand text 'Eswirepro' or 'ORICO', no shop "
 "name, no watermark, no phone frame, no browser chrome. ")

# body per section. ref: 'prod' = /edits z _product-ref.png ; None = /generations (bez produktu)
S = {}

S["01-hero"] = ("prod", "1536x1024",
 "SECTION = HERO, archetype B split 55/45. LEFT 55% is content on a flat platinum field; RIGHT 45% "
 "is a photographic desk scene. LEFT column top-to-bottom: a small ink eyebrow 'PORTY POD REKA', a "
 "large Bricolage Grotesque headline 'Porty USB zawsze pod reka - na krawedzi biurka', one Figtree "
 "sub-line 'Koniec siegania za komputer i plataniny kabli.', then a crisp OFFER CARD (radius 14, thin "
 "hairline border, soft cool shadow, a thin azure edge-line along its top) holding the big price "
 "'34,90 zl' in Bricolage, a full-width azure #0A6EBD CTA button with WHITE text 'Zamawiam - 34,90 zl', "
 "and beneath it a pay-row of small payment badges (BLIK, Visa, Mastercard, cash-on-delivery). ABOVE "
 "THE FOLD, a slim trust strip of pills 'platnosc przy odbiorze - zwrot 14 dni - wysylka z Polski - "
 "MacOS + Windows' with thin outline ink icons. A thin azure edge-line signature with 5-28 mm ticks "
 "sits as a baseline under the headline. NO star rating and NO review numbers anywhere above the fold. "
 "RIGHT: a photoreal calm MORNING desk - the silver clip-on hub clamped on the front edge of a light "
 "wooden desk, four blue USB 3.0 ports facing us, a hand sliding a pendrive into a port; behind it a "
 "monitor, keyboard, a small plant, a coffee mug with soft steam; cool clean daylight from the left; "
 "the scene dissolves softly into the platinum page background at its left edge (NOT a framed postcard); "
 "keep the steam and negative space free of text. ")

S["02-zaufanie"] = (None, "1536x1024",
 "SECTION = TRUST BAR: a slim full-width band on paper #EEF0F4, a structural separator at FULL height "
 "(no dead lower third). Four trust items in one row, each a pill/lockup with a thin 1.75px OUTLINE ink "
 "icon plus a Figtree label: 'Platnosc przy odbiorze', 'Zwrot 14 dni', 'Wysylka z Polski', 'MacOS + "
 "Windows'. One consistent pill style, ink icons (no azure). A thin azure edge-line with tiny 5-28 mm "
 "ticks runs through as the divider. Calm, premium, minimal. NO product, NO photographs, NO price. ")

S["03-problem"] = (None, "1536x1024",
 "SECTION = PROBLEM, the old painful way - a FULL-BLEED photographic scene with image weight on the "
 "LEFT and a soft platinum scrim + copy on the RIGHT. Photoreal frustration: a person's hand reaching "
 "awkwardly BEHIND a desktop tower / under a desk, fumbling for USB ports hidden at the back; a tangle "
 "of USB extension cables cluttering the desk. Dim, muddy, cool light; cramped low angle from behind "
 "the machine. On the RIGHT over the scrim: an ink Bricolage headline 'Koniec macania po omacku za "
 "obudowa' and a short Figtree line 'Porty z tylu jednostki, platanina kabli, wypinasz jedno zeby wpiac "
 "drugie.' The signature edge-line is BROKEN / interrupted here (a metaphor for the mess). ABSOLUTELY "
 "NO clip-on hub and NO USB-hub product anywhere in the frame; no tidy solution, no bright hero mood, "
 "no branded device. ")

S["04-rozwiazanie"] = ("prod", "1536x1024",
 "SECTION = SOLUTION / relief - a FULL-BLEED photographic scene with image weight on the RIGHT and a "
 "soft scrim + copy on the LEFT (zig-zag, opposite side to the problem section). Photoreal calm, tidy "
 "CREATIVE desk by a WINDOW: the silver clip-on USB hub clamped on the front edge, four blue USB 3.0 "
 "ports within easy reach; a sheer curtain gently billowing at the window, a leafy plant nearby; cool "
 "clean daylight, orderly cables; product sharp and static. On the LEFT over a platinum scrim: an ink "
 "Bricolage headline 'Klips na krawedzi - 4 porty zawsze pod reka' and a short Figtree line 'Wepniesz "
 "pendrive, dysk i mysz bez siegania za komputer.', plus a small triad of mini-benefits 'pod reka / "
 "aluminium / szybko' with thin outline ink icons. The signature edge-line runs along the desk and "
 "'holds' the hub. ")

S["05-demo"] = ("prod", "1536x1024",
 "SECTION = DEMO 'jak to dziala' 1-2-3, a TOR-I interactive-style card on paper showing THREE SEPARATE "
 "STATE FRAMES in a row with a stepper connecting them, macro on the desk edge, soft studio light, "
 "platinum background. STATE 01 'Zacisnij na krawedzi': a hand turning the knurled thumb-screw, an "
 "engraved 5-28 mm scale visible on the clamp. STATE 02 'Wepnij urzadzenia': a hand inserting a "
 "pendrive into a blue USB 3.0 port. STATE 03 'Porty pod reka': four ports in use with devices plugged "
 "and a small LED lit. Each state is a small card with a step number 01 / 02 / 03 in Bricolage and a "
 "short Figtree caption; the ACTIVE step is accented azure, the others ink. Outline ink icons. The "
 "three states MUST be distinct frames, not one static photo. ")

S["06-korzysci"] = ("prod", "1536x1024",
 "SECTION = BENEFITS bento, UNEVEN tiles on paper (asymmetric, radius 14, hairline borders, cool "
 "layered shadow). Four benefit tiles, each a thin outline ink icon + a big Bricolage number-as-graphic "
 "+ a Figtree feature-to-benefit line: (1) 'Aluminium' - 'Solidne, chlodzi sie, nie tandetny plastik'. "
 "(2) a big '4' with 'USB 3.0' and '5 Gbps' - 'Pendrive, dysk, mysz i klawiatura naraz - szybki "
 "transfer'. (3) 'DC 5V' - 'Dodatkowy port zasilania - stabilnie utrzyma dysk'. (4) 'MacOS + Windows' - "
 "'Dziala z laptopem i desktopem'. ONE tile holds a small clean packshot of the silver hub (image at "
 "least 40% of that tile, filling its height - not a postage stamp). NO '10 Gbps', NO '7-in-1', NO card "
 "reader. Functional icons ink, not azure. ")

S["07-zacisk"] = ("prod", "1536x1024",
 "SECTION = 'ZACISK' clamp mechanism, the FLAGSHIP interactive configurator (TOR-I), a card on paper. "
 "LEFT: a macro of the clamp - the vertical clamp collar hooking over a desk edge, a knurled thumb-screw "
 "underneath, an anti-slip silicone pad, an engraved 5-28 mm scale; silver aluminium, side studio light, "
 "shallow focus; fingers turning the screw. RIGHT: an interactive SLIDER control labelled 'Grubosc "
 "Twojego blatu' running from '5 mm' to '28 mm' with tick marks, the handle at an active value "
 "highlighted azure #0A6EBD, and a readout 'Twoj blat: 24 mm ok' - dragging opens/closes the clamp from "
 "a thin shelf to a thick desktop. A Bricolage headline 'Pasuje do Twojego blatu - zakres 5-28 mm'. The "
 "caliper/tick signature CULMINATES here. This disarms the objection 'czy pasuje do mojego biurka?'. ")

S["08-porownanie"] = ("prod", "1536x1024",
 "SECTION = COMPARISON, an honest TWO-COLUMN TABLE (not bento) on paper. Column A header 'Zaklipek - "
 "hub na klips', column B header 'Zwykly hub / przedluzacz na biurku'. Rows: 'Porty na krawedzi, pod "
 "reka' (A ok / B lezy w plataninie), 'Montaz zaciskiem 5-28 mm' (A ok / B luzem na blacie), 'Aluminium' "
 "(A ok / B plastik), 'Porzadek kabli' (A ok / B balagan). One HONEST small-print caveat line in Figtree "
 "under the table: 'Dolaczony kabel danych bywa slaby - uzyj wlasnego dobrego. Zakres zacisku 5-28 mm - "
 "sprawdz swoj blat.' Only the check ticks in column A are azure; everything else ink. Clean editorial "
 "table with hairline rules. A small silver hub thumbnail may sit in the A header. ")

S["09-mid-cta"] = ("prod", "1536x1024",
 "SECTION = MID-PAGE CTA, a dedicated FULL-BLEED call-to-action over a WARM EVENING desk scene: the "
 "silver clip-on hub on the desk edge with a cable neatly plugged, a desk-lamp glow, a calm silhouette "
 "at the desk. Centered content: an ink Bricolage headline 'Zamow Zaklipka - porty pod reka juz dzis', "
 "the price '34,90 zl', and a DESIGNED azure #0A6EBD CTA button with WHITE text 'Zamow Zaklipka', with "
 "'platnosc przy odbiorze' beneath it. Order: price -> CTA -> reassurance. A real, shaped button, not a "
 "bare link. No neon RGB overload, no dark scam mood, no black hub. ")

S["10-opinie"] = (None, "1536x1024",
 "SECTION = REVIEWS / social proof (this is BELOW the fold), a grid of review cards with small round "
 "avatars and star glyphs. A header lockup shows '* 4,6 / 5 - 26 ocen' - the STARS in azure #0A6EBD, "
 "the rating number '4,6/5' in ink Figtree (NOT azure). Four honest review cards with first names and "
 "short Polish quotes, INCLUDING real caveats: 'Cale aluminium, swietnie wykonane, solidny zacisk.', "
 "'Wygodne - porty w koncu pod reka.', 'Dolaczony kabel danych wymienilem na wlasny.', 'Rozstaw zacisku "
 "nie do kazdego blatu - u mnie pasuje.'. Cards radius 14, hairline borders, cool shadow. Honest and "
 "human, not glossy. NO product hero shot here. ")

S["11-galeria"] = ("prod", "1536x1024",
 "SECTION = GALLERY, a clean grid of SQUARE (1:1) tiles with one series radius and a lightbox feel. "
 "Four tiles of the SAME silver clip-on hub in real contexts: (1) in-use - a hand plugging a pendrive, "
 "ports under a monitor; (2) macro of the clamp with the 5-28 mm scale; (3) macro of the DC 5V power "
 "port and thumb-screw; (4) lifestyle - the bar clamped under an iMac-style monitor on a tidy desk. "
 "Consistent cool lighting, platinum world, NO burned-in English text, NO brand prints. Uniform tile "
 "radius and even gutters. ")

S["14-zamow"] = ("prod", "1536x1024",
 "SECTION = ORDER / inline checkout, a wide module with a skinned checkout form. LEFT: a clean packshot "
 "of the silver 4-port hub on a plain light field. RIGHT: an inline checkout card (radius 14, hairline "
 "border, cool shadow, azure top edge-line) with the price '34,90 zl' in Bricolage, form fields 'Imie i "
 "nazwisko', 'Telefon', 'Adres' skinned in the tokens, a payment choice highlighting 'Platnosc przy "
 "odbiorze (COD)', a full-width azure #0A6EBD CTA button with WHITE text 'Kup teraz - place przy "
 "odbiorze', then a small risk-reduction line 'Zwrot 14 dni - wysylka z Polski'. Order: price -> CTA -> "
 "reassurance. ")

S["15-faq"] = ("prod", "1536x1024",
 "SECTION = FAQ, an accordion (full-width rows, thin hairline dividers, +/- outline ink toggles) beside "
 "a STICKY packshot of the silver hub (not a bare accordion). Questions in ink Bricolage with Figtree "
 "answers: 'Czy pasuje do mojego blatu?' (answer mentions '5-28 mm'), 'Czy szybki?' ('USB 3.0 - 5 Gbps'), "
 "'Aluminium czy plastik?' ('aluminium'), 'Udzwignie dysk?' ('dodatkowy port DC 5V'), 'Jaki kabel?' "
 "('uzyj wlasnego dobrego'), 'Dziala na MacOS?' ('tak, MacOS i Windows'). Calm, trustworthy, roomy. ")

S["16-final"] = ("prod", "1536x1024",
 "SECTION = FINAL CTA, a wide cinematic EVENING desk: tidy and calm, the silver clip-on hub on the edge "
 "with a cable neatly plugged, warm lamp light, a mug with soft steam, a sheer curtain moving faintly - "
 "life-with-product, reassuring. Centered: an ink Bricolage headline 'Miej porty zawsze pod reka', a "
 "DESIGNED azure #0A6EBD CTA button with WHITE text 'Zamawiam Zaklipka', and a tiny one-line mini-review "
 "beneath. The signature edge-line closes the composition, 'holding' the hub on the edge. ")

# ---- MOBILE (2:3) ----
S["01-hero-m"] = ("prod", "1024x1536",
 "MOBILE HERO (portrait phone, 2:3), designed FROM ZERO for the phone fold - NOT a squeezed desktop. "
 "TOP ~45% = a COMPACT photographic scene (product LARGE): the silver clip-on hub clamped on a light "
 "desk edge, four blue USB 3.0 ports, a hand sliding a pendrive, a mug with soft steam, cool morning "
 "light. BELOW: a big Bricolage hook 'Porty USB zawsze pod reka' (large H1), then an OFFER CARD "
 "OVERLAPPING the bottom of the scene (card bg, hairline border, cool shadow, radius 14, azure top "
 "edge-line): the price '34,90 zl' + a full-width azure CTA 'Zamawiam - 34,90 zl' (white) + a pay-row "
 "(BLIK / Visa / Mastercard / cash-on-delivery) + a one-line trust strip 'przy odbiorze - zwrot 14 dni "
 "- z Polski'. At most ONE line of benefits. NO floating trust-chip / badge overlay on the scene; NO "
 "star rating above the fold. Everything decisive INSIDE the fold. ")

S["03-problem-m"] = (None, "1024x1536",
 "MOBILE PROBLEM (portrait 2:3), phone-first. A photoreal frustration scene fills the top: a hand "
 "reaching behind a desktop tower fumbling for hidden USB ports, a tangle of USB cables, dim cool muddy "
 "light, cramped. BELOW on platinum: an ink Bricolage headline 'Koniec macania za obudowa' and ONE short "
 "Figtree line 'Platanina kabli, porty z tylu jednostki.' The signature edge-line broken / interrupted. "
 "NO clip-on hub, NO USB-hub product anywhere in frame. ")

S["04-rozwiazanie-m"] = ("prod", "1024x1536",
 "MOBILE SOLUTION (portrait 2:3), phone-first. TOP: a photoreal tidy creative desk by a window, the "
 "silver clip-on hub clamped on the edge, four blue ports within reach, a sheer curtain billowing, a "
 "plant, cool daylight, product sharp. BELOW: an ink Bricolage headline 'Klips na krawedzi - porty pod "
 "reka' + ONE Figtree line 'Wepnij pendrive, dysk i mysz.' + a single row of three tiny outline-ink "
 "mini-benefits. Designed for the phone, not a squeezed desktop. ")

S["05-demo-m"] = ("prod", "1024x1536",
 "MOBILE DEMO 1-2-3 (portrait 2:3), TOR-I. THREE state cards STACKED into a single VERTICAL column with "
 "a connecting line (NEVER three side-by-side). 01 'Zacisnij na krawedzi' (a hand turning the thumb-screw, "
 "5-28 mm scale). 02 'Wepnij urzadzenia' (a hand inserting a pendrive into a blue USB 3.0 port). 03 "
 "'Porty pod reka' (four ports in use, LED lit). Step numbers 01 / 02 / 03 in Bricolage, short Figtree "
 "captions, the active step azure. Macro studio, platinum background. ")

S["07-zacisk-m"] = ("prod", "1024x1536",
 "MOBILE 'ZACISK' configurator (portrait 2:3), the TOR-I flagship. TOP: a macro of the clamp collar "
 "hooking a desk edge, the knurled thumb-screw, silicone pad, engraved 5-28 mm scale, fingers turning "
 "the screw. BELOW: a horizontal SLIDER '5 mm -> 28 mm' with tick marks, the handle at an active value "
 "in azure, a readout 'Twoj blat: 24 mm ok', and a Bricolage line 'Pasuje do Twojego blatu - 5-28 mm'. "
 "The caliper signature culminates. Phone-first, not a squeezed desktop. ")

S["09-mid-cta-m"] = ("prod", "1024x1536",
 "MOBILE MID-CTA (portrait 2:3). A warm EVENING desk scene fills the top: the silver hub on the desk "
 "edge, a cable plugged, a desk-lamp glow, calm. BELOW, centered: a Bricolage headline 'Zamow Zaklipka', "
 "the price '34,90 zl', a DESIGNED full-width azure CTA 'Zamow Zaklipka' (white), and 'platnosc przy "
 "odbiorze'. Order price -> CTA -> reassurance. ")

S["14-zamow-m"] = ("prod", "1024x1536",
 "MOBILE ORDER / inline checkout (portrait 2:3), phone-first single column. TOP: a clean packshot of the "
 "silver 4-port hub on a plain light field. BELOW: an inline checkout card (radius 14, hairline, azure "
 "top edge-line): the price '34,90 zl', stacked form fields 'Imie i nazwisko', 'Telefon', 'Adres', a "
 "highlighted 'Platnosc przy odbiorze (COD)', a full-width azure CTA 'Kup teraz - place przy odbiorze' "
 "(white), and a small line 'Zwrot 14 dni - wysylka z Polski'. ")

S["16-final-m"] = ("prod", "1024x1536",
 "MOBILE FINAL (portrait 2:3). A calm evening desk fills the top: tidy, the silver hub on the edge, a "
 "cable plugged, a warm lamp, a mug with soft steam, a sheer curtain. BELOW, centered: a Bricolage "
 "headline 'Miej porty zawsze pod reka', a DESIGNED full-width azure CTA 'Zamawiam Zaklipka' (white), a "
 "one-line mini-review. The signature edge-line closes it. ")

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

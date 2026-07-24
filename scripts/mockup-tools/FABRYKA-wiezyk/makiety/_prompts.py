# -*- coding: utf-8 -*-
"""Buduje pliki promptow makiet WIEZYK (F2). Wspolne STYLE-DNA (KANON+PARTYTURA z TOKENS-MAKIETY)
+ PROD (PASZPORT) + NEG wstrzykiwane do KAZDEGO promptu. Prawdziwe dane WPROST w cudzyslowach.
Emituje p-<name>.txt oraz _index.json (name,size,ref) do sterowania generacja (_batch.py)."""
import os, io, json, sys
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))

UI = ("A high-fidelity, pixel-perfect WEBSITE UI MOCKUP (Figma-style, clean modern design system, "
 "crisp interface rendering) of ONE section of a Polish e-commerce landing page for a premium CAT "
 "TOWER / cat tree brand \"Wiezyk\". A real interface as if already built - NOT concept art, NOT a "
 "painterly illustration. ")

STYLE = ("STYLE-DNA (identical across the whole series): a WARM IVORY / CREAM world - page background "
 "#FBF3E6, alt panels #F3E8D6 and #ECDFC9, card surfaces near-white #FFFDF8; ink text #2C2925, body "
 "#665E55, 1px hairlines #D9CCBA. EXACTLY ONE accent colour - a warm AMBER-CARAMEL #A5680C - used "
 "ONLY for the CTA button fill, the underline swash / vertical 'levels-axis' signature and star "
 "glyphs; ALL functional icons are thin 1.75px OUTLINE strokes in ink #2C2925, NEVER amber. "
 "Typography: display face a WARM HIGH-CONTRAST EDITORIAL SERIF (Newsreader-like) for headlines, "
 "brand and big numbers; text face a CLEAN HUMANIST SANS (Source Sans-like) for eyebrows, body, "
 "labels, prices and dimensions with tabular figures - the serif display and the sans text clearly "
 "CONTRAST. One series radius: 16px on cards, 8px on chips/pills. Soft LAYERED WARM shadows "
 "(sepia-tinted rgba(80,50,20,.06-.12), never pure black) plus a subtle 3% paper grain. Generous "
 "8pt whitespace, cosy premium 'home-decor magazine' mood. Publishing SIGNATURE = a thin 1px "
 "VERTICAL 'levels axis' hairline carrying small tick marks numbered 1-6 in amber (the tower's six "
 "levels), used as a baseline / divider. Polish diacritics rendered correctly. ")

PROD = ("PRODUCT FIDELITY (keep this exact body wherever the tower appears): a TALL ~162 cm vertical "
 "multi-level CAT TOWER on a square base, six levels - a top LOOKOUT perch (flat padded platform with "
 "a raised rim), a round deep BASKET-nest bed on a side arm, a plush CONDO-CAVE cube in the middle "
 "with TWO arched openings, a soft HAMMOCK slung between posts lower down, plus platforms; the posts "
 "are wrapped in PLUSH and natural light-honey SISAL rope; small POM-POM ball toys hang on strings "
 "and a thick climbing ROPE. Colour per frame is ONE single colorway (default BEIGE unless the "
 "section says light-grey or dark-grey). NO raw wooden tree trunk or real branch (posts are plush/"
 "sisal-wrapped engineered board), NO wheels/casters, NO litter box, NO printed brand name on the "
 "product, NO garish/neon colours, do NOT mix colored parts within one tower. ")

NEG = ("EXACTLY ONE SECTION AND NOTHING ELSE - do not add a wordmark, a price, a star-rating or "
 "benefit chips unless they belong to THIS section. No brand text 'Hzuaneri', no shop name, no "
 "watermark, no phone frame, no browser chrome, no crossed-out prices, no 'bestseller/NR 1' badges, "
 "no free-shipping claim, no health claims, no fake urgency, no lorem ipsum beyond the quoted Polish "
 "text. Do NOT claim '164,5 cm', 'FSC/eco wood', 'stops destroying furniture', 'never tips over', or "
 "any review count wall. ")

# ref: 'prod' = /edits z _product-ref.png ; None = /generations (bez produktu / UI-only)
S = {}

# ---------- DESKTOP (1536x1024) ----------
S["01-hero"] = ("prod", "1536x1024",
 "SECTION = HERO, archetype D (central product on a warm colour field). CENTERED on the warm ivory "
 "#FBF3E6 field stands the TALL beige cat tower (full 162 cm height visible, shot frontally slightly "
 "from below), one calm cat resting on the top lookout perch. At the RIGHT edge of the field: a bright "
 "window with a sheer CURTAIN clearly billowing and a leafy PLANT (the physical motion carrier). "
 "OVERLAID content: a small ink eyebrow 'PIONOWE KROLESTWO KOTA' with the amber vertical levels-axis "
 "signature; a large serif display headline 'Wlasne krolestwo Twojego kota.'; one sans sub-line "
 "'162 cm wiezy: drapie, wspina sie, chowa, spi i obserwuje - na 6 poziomach zamiast na Twoich "
 "meblach.'; then a crisp OFFER CARD (near-white #FFFDF8, radius 16, thin hairline border, soft warm "
 "shadow, small + plus-marks in corners) holding the big price '379,00 zl' in the serif, a solid "
 "amber #A5680C CTA button with WHITE text 'Zamawiam Wiezyka - 379,00 zl', and beneath it a pay-row "
 "of small payment badges (BLIK, Visa, Mastercard, za pobraniem). ABOVE THE FOLD a slim trust strip "
 "of pills 'platnosc przy odbiorze - zwrot 14 dni - zestaw anti-tip w komplecie - 3 kolory' with thin "
 "outline ink icons. NO star rating and NO review count anywhere above the fold. The colour field "
 "dissolves softly into the page background (NOT a framed postcard); keep the curtain and negative "
 "space free of text. ")

S["02-zaufanie"] = (None, "1536x1024",
 "SECTION = TRUST BAR: a slim full-width band on alt panel #F3E8D6, a structural separator at FULL "
 "height (no dead lower third). FOUR trust items in one row, each a pill/lockup with a thin 1.75px "
 "OUTLINE ink icon and a short sans label: 'Platnosc przy odbiorze' (coins/hand icon), 'Zwrot 14 dni' "
 "(calendar '14' icon), 'Zestaw antyprzechyleniowy w komplecie' (shield/anchor icon), '3 kolory do "
 "wyboru' (three dots icon). One consistent trust-pill style. No amber except none here (icons ink). ")

S["03-anatomia"] = ("prod", "1536x1024",
 "SECTION = ANATOMY diagram, contained on the cream page. A small ink eyebrow 'ANATOMIA WIEZY' and a "
 "big serif headline '6 poziomow. Kazdy ma swoja role.'. CENTER-LEFT: the full BEIGE cat tower "
 "isolated on near-white, shot frontally slightly from below so all six levels are visible. Along the "
 "tower runs the amber VERTICAL LEVELS-AXIS signature with tick marks 1-6. Thin outline callout lines "
 "(hairline) point from levels to small labels on the right, each a tiny outline icon + sans text: "
 "'Punkt widokowy' (top), 'Kosz-gniazdo (Ø30 cm)', 'Domek-jaskinia (50x40x33 cm)', 'Hamak', "
 "'5 pni sizalowych - drapanie', 'Pompony na sznurku'. Calm, editorial, clean. Icons ink, only the "
 "axis ticks and one active dot in amber. ")

S["04-pazury"] = ("prod", "1536x1024",
 "SECTION = FURNITURE PROTECTION, full-bleed photographic scene, IMAGE WEIGHT ON THE LEFT, copy on a "
 "soft cream scrim on the RIGHT. Scene: a cat happily SCRATCHING the natural sisal-wrapped post of the "
 "beige tower, claws sunk into the rope, a fabric sofa softly visible behind (context of furniture "
 "saved), warm daylight, cosy living room. RIGHT copy: eyebrow 'MEBLE CALE', serif headline 'Osobne "
 "miejsce na kocie pazury.', a huge amber-underlined number '5' with sans caption 'pni sizalowych, "
 "zeby kot drapal wieze - nie Twoja kanape', one small outline paw icon. Honest wording (a place for "
 "claws, an alternative to furniture) - do NOT promise 100% furniture protection. ")

S["05-azyl"] = ("prod", "1536x1024",
 "SECTION = SHELTER & NAP, full-bleed photographic scene, IMAGE WEIGHT ON THE RIGHT, copy on a soft "
 "cream scrim on the LEFT (zig-zag vs previous). Scene: a cat curled ASLEEP inside the beige plush "
 "condo-cave (arched opening), another cat resting in the hanging HAMMOCK below, a soft blanket, a "
 "bright window with a sheer curtain gently moving, tender warm daylight. LEFT copy: eyebrow 'AZYL I "
 "DRZEMKA', serif headline 'Kryjowka, hamak i gniazdo - kot wybiera.', a triad of small outline icons "
 "with sans labels 'Domek-jaskinia', 'Hamak', 'Kosz-gniazdo'. Icons ink. ")

S["06-ruch"] = ("prod", "1536x1024",
 "SECTION = PLAY & CLIMB & LOOKOUT, full-bleed photographic scene, IMAGE WEIGHT ON THE LEFT, copy on a "
 "soft cream scrim on the RIGHT (zig-zag). Scene: a cat mid-CLIMB between the platforms of the beige "
 "tower reaching for a hanging pom-pom; a woman (28-40, cosy sweater) on a sofa playing with the cat "
 "using a feather wand; a sheer curtain billowing, a leafy plant; BRIGHT midday daylight, LOW camera "
 "angle looking UP the tall tower. RIGHT copy: eyebrow 'RUCH I WIDOK', serif headline 'Wspina sie, "
 "bawi i patrzy z gory.', sans line 'Cala pionowa przestrzen dla kota - platformy, sznur i punkt "
 "widokowy na szczycie.', small outline icons. ")

S["07-stabilnosc"] = ("prod", "1536x1024",
 "SECTION = STABILITY, contained card on the cream page (not full-bleed). LEFT: a reassurance shot of "
 "the beige tower standing firmly, focus on its thick square BASE board and the anti-tip strap kit "
 "fixing it to a wall, soft neutral light. RIGHT copy: eyebrow 'STABILNOSC', serif headline 'Stoi "
 "pewnie, nie chwieje sie przy skoku.', a row of three facts each a big serif number + sans label: "
 "'14 kg' (masa - stabilna baza), 'podstawa 52,5 x 42,5 cm', 'zestaw anti-tip w komplecie'. Outline "
 "ink icons. Factual wording - do NOT say '100% stabilny' or 'never tips'. ")

S["08-kolory"] = ("prod", "1536x1024",
 "SECTION = THREE COLOURS (a colour picker UI, contained). Eyebrow 'TRZY KOLORY', serif headline "
 "'Trzy kolory, jedna cena.'. THREE clean studio packshots of the SAME cat tower side by side on "
 "near-white, in BEIGE, LIGHT-GREY and DARK-GREY (each a single consistent colorway, identical "
 "framing), with a row of THREE round colour SWATCHES beneath (beige / light-grey / dark-grey), the "
 "active one ringed with an ink outline; sans caption under each 'Bezowy' / 'Jasnoszary' / "
 "'Ciemnoszary'; one shared price chip '379,00 zl'. Icons/labels ink, price serif. ")

S["09-mid-cta"] = ("prod", "1536x1024",
 "SECTION = MID CTA (dedicated CTA band), warm evening colour field. A warm evening living-room feel: "
 "the beige tower with a content cat on a perch, soft lamp glow, a sheer curtain faintly moving. Big "
 "serif headline 'Daj kotu jego wlasna wieze.', a designed solid amber #A5680C CTA button with white "
 "text 'Wybierz kolor i zamow - 379,00 zl', and a small sans reassurance 'platnosc przy odbiorze - "
 "zwrot 14 dni'. Generous space around the CTA. ")

S["10-zamow"] = ("prod", "1536x1024",
 "SECTION = ORDER module '#zamow' (clean, contained, two columns). LEFT: a clean BEIGE tower packshot "
 "on near-white with a row of three colour swatches (beige active / light-grey / dark-grey). RIGHT: an "
 "order card (near-white #FFFDF8, radius 16, hairline border, warm shadow) - eyebrow 'ZAMOW WIEZYKA', "
 "the chosen colour label 'Kolor: Bezowy', the big serif price '379,00 zl', a full-width solid amber "
 "CTA button white text 'Zamawiam - place przy odbiorze', a pay-row (BLIK, Visa, Mastercard, za "
 "pobraniem) and a slim trust line 'platnosc przy odbiorze - zwrot 14 dni'. ")

S["11-specyfikacja"] = ("prod", "1536x1024",
 "SECTION = SPECIFICATION 'Co dokladnie dostajesz', a BENTO grid of unequal cards on the cream page. "
 "Eyebrow 'SPECYFIKACJA', serif headline 'Co dokladnie dostajesz?'. Cards: (1) ELEMENTS list with tiny "
 "outline icons - 'Domek-jaskinia, hamak, kosz-gniazdo, punkt widokowy, 5 pni sizalowych, pompony, "
 "sznur'; (2) WYMIARY - big serif numbers 'Wysokosc 162 cm', 'Domek 50x40x33 cm', 'Kosz Ø30 cm', "
 "'Podstawa 52,5x42,5 cm'; (3) MATERIAL - 'Plyta wiorowa, plusz, sizal'; (4) big 'Masa 14 kg'; (5) "
 "'Do 5 kotow, kazdy do 7 kg'; (6) 'W zestawie: drapak + zestaw anti-tip + instrukcja'. Tabular sans "
 "figures, ink outline icons, one radius. A small beige tower packshot may sit in one wide card. ")

S["12-opinia"] = (None, "1536x1024",
 "SECTION = SINGLE HONEST REVIEW, one centered card on the cream page (near-white #FFFDF8, radius 16, "
 "hairline border, small + plus-marks). A row of FIVE amber stars, a small ink label 'Pojedyncza "
 "dostepna opinia', then the quote in serif italic 'Bardzo ladne male drzewko. Elementy dobrze do "
 "siebie pasuja. Latwe w montazu. Kot jest zadowolony. Dziekuje.', and a small sans note 'Tlumaczenie "
 "z jezyka angielskiego'. NO big '5,0/5' badge, NO review counter, NO avatar or name. Just one honest "
 "card. ")

S["13-faq"] = ("prod", "1536x1024",
 "SECTION = FAQ, two columns. LEFT: an accordion of questions (first one open) with thin +/- outline "
 "ink toggles: 'Czy wieza sie przewroci?', 'Dla ilu kotow?', 'Czy sie zmiesci w pokoju?', 'Jak "
 "wyglada montaz?', 'Jakie kolory?', 'Zwrot i platnosc?'. The open answer shows sans body text. RIGHT: "
 "a sticky small BEIGE tower packshot on near-white in a card. Eyebrow 'FAQ', serif headline 'Czeste "
 "pytania'. Icons ink, one radius. ")

S["14-final"] = ("prod", "1536x1024",
 "SECTION = FINAL CTA, full-bleed cinematic evening scene. A wide warm evening living-room: the beige "
 "tower with a cat asleep in the condo/hammock, a person relaxing on the sofa nearby, warm lamp light, "
 "a sheer curtain moving faintly, a plant. Overlaid on a soft scrim: serif headline 'Twoj kot "
 "zasluguje na wlasne miejsce.', a solid amber #A5680C CTA button white text 'Zamawiam Wiezyka - "
 "379,00 zl', a small sans reassurance 'platnosc przy odbiorze - zwrot 14 dni - 3 kolory'. The amber "
 "vertical levels-axis signature closes the composition. Warm, reassuring. ")

# ---------- MOBILE (1024x1536) — REDESIGNED FOR 390px FOLD, not squeezed desktop ----------
MOB = ("MOBILE portrait 390px layout - DESIGNED FROM SCRATCH FOR PHONE, not a squeezed desktop. "
 "Everything decisive fits the phone fold; large tap targets; vertical stack. Any row of 3 items "
 "becomes a SINGLE vertical column with a connecting line (NEVER 3 side-by-side at 390px). ")

S["01-hero-m"] = ("prod", "1024x1536",
 MOB + "SECTION = HERO (archetype D adapted, stacked zones). TOP ~48% viewport height: the tall BEIGE "
 "cat tower on the warm ivory field, a cat on the top perch, a window with a billowing sheer curtain "
 "at the edge (motion carrier) - compact but the full tower reads. BELOW: eyebrow 'PIONOWE KROLESTWO "
 "KOTA', a BIG serif headline (H1 >=38px) 'Wlasne krolestwo Twojego kota.', one short sub line, then a "
 "prominent OFFER CARD OVERLAPPING the bottom of the scene (near-white #FFFDF8, radius 16, hairline, "
 "warm shadow) with big serif price '379,00 zl', a full-width amber CTA 'Zamawiam - 379,00 zl' and a "
 "pay-row (BLIK, Visa, Mastercard, za pobraniem). A slim wrap trust line 'za pobraniem - zwrot 14 dni "
 "- anti-tip - 3 kolory'. NO floating trust-chip on the scene, NO star rating above the fold. ")

S["02-zaufanie-m"] = (None, "1024x1536",
 MOB + "SECTION = TRUST, a compact band on #F3E8D6 with FOUR items stacked as a 2x2 or single column, "
 "each an outline ink icon + short sans label: 'Platnosc przy odbiorze', 'Zwrot 14 dni', 'Zestaw "
 "anti-tip w komplecie', '3 kolory do wyboru'. One trust-pill style. ")

S["03-anatomia-m"] = ("prod", "1024x1536",
 MOB + "SECTION = ANATOMY (mobile). TOP: the full beige tower isolated on near-white with the amber "
 "vertical levels-axis 1-6 alongside. BELOW as a VERTICAL LIST (stacked, connecting line - not "
 "scattered hotspots): 'Punkt widokowy', 'Kosz-gniazdo Ø30 cm', 'Domek-jaskinia 50x40x33 cm', "
 "'Hamak', '5 pni sizalowych', 'Pompony na sznurku', each an outline ink icon + sans label. Eyebrow "
 "'ANATOMIA WIEZY', serif headline '6 poziomow. Kazdy ma swoja role.'. ")

S["04-pazury-m"] = ("prod", "1024x1536",
 MOB + "SECTION = FURNITURE PROTECTION (mobile). TOP: photo of a cat scratching the sisal post of the "
 "beige tower, sofa behind. BELOW on cream: eyebrow 'MEBLE CALE', serif headline 'Osobne miejsce na "
 "kocie pazury.', a huge amber-underlined '5' + sans 'pni sizalowych - kot drapie wieze, nie kanape'. ")

S["05-azyl-m"] = ("prod", "1024x1536",
 MOB + "SECTION = SHELTER & NAP (mobile). TOP: photo of a cat asleep in the beige condo-cave + a cat "
 "in the hammock, window curtain. BELOW: eyebrow 'AZYL I DRZEMKA', serif headline 'Kryjowka, hamak i "
 "gniazdo - kot wybiera.', a vertical list 'Domek-jaskinia / Hamak / Kosz-gniazdo' (connecting line), "
 "outline ink icons. ")

S["06-ruch-m"] = ("prod", "1024x1536",
 MOB + "SECTION = PLAY & CLIMB (mobile). TOP: low-angle photo of a cat climbing the beige tower "
 "reaching a pom-pom, bright daylight. BELOW: eyebrow 'RUCH I WIDOK', serif headline 'Wspina sie, bawi "
 "i patrzy z gory.', one sans line about platforms/rope/lookout, outline icons. ")

S["07-stabilnosc-m"] = ("prod", "1024x1536",
 MOB + "SECTION = STABILITY (mobile). TOP: photo focused on the thick base + anti-tip strap of the "
 "beige tower. BELOW: eyebrow 'STABILNOSC', serif headline 'Stoi pewnie, nie chwieje sie.', a VERTICAL "
 "stack of three facts (connecting line): big '14 kg', 'podstawa 52,5x42,5 cm', 'zestaw anti-tip w "
 "komplecie'. Factual, outline ink icons. ")

S["08-kolory-m"] = ("prod", "1024x1536",
 MOB + "SECTION = THREE COLOURS (mobile picker). One BEIGE tower packshot on near-white at top; below, "
 "a row of three round SWATCHES (beige active / light-grey / dark-grey) with sans labels 'Bezowy / "
 "Jasnoszary / Ciemnoszary' and one price chip '379,00 zl'. Eyebrow 'TRZY KOLORY', serif headline "
 "'Trzy kolory, jedna cena.'. ")

S["09-mid-cta-m"] = ("prod", "1024x1536",
 MOB + "SECTION = MID CTA (mobile). A warm evening image of the beige tower with a content cat, then a "
 "big serif headline 'Daj kotu jego wlasna wieze.', a full-width amber CTA 'Wybierz kolor i zamow - "
 "379,00 zl', small sans 'platnosc przy odbiorze'. ")

S["10-zamow-m"] = ("prod", "1024x1536",
 MOB + "SECTION = ORDER '#zamow' (mobile, stacked). A beige tower packshot on near-white; a row of "
 "three colour swatches (beige active); an order card with 'Kolor: Bezowy', big serif '379,00 zl', a "
 "full-width amber CTA 'Zamawiam - place przy odbiorze', a pay-row (BLIK, Visa, Mastercard, za "
 "pobraniem) and a trust line 'zwrot 14 dni'. ")

S["11-specyfikacja-m"] = ("prod", "1024x1536",
 MOB + "SECTION = SPEC (mobile). Eyebrow 'SPECYFIKACJA', serif headline 'Co dokladnie dostajesz?'. A "
 "VERTICAL stack of spec cards (one per row): 'Elementy: domek, hamak, kosz, punkt widokowy, 5 pni "
 "sizalowych, pompony, sznur'; 'Wysokosc 162 cm'; 'Domek 50x40x33 cm'; 'Podstawa 52,5x42,5 cm'; "
 "'Material: plyta wiorowa, plusz, sizal'; 'Masa 14 kg'; 'Do 5 kotow, kazdy do 7 kg'; 'W zestawie: "
 "anti-tip + instrukcja'. Tabular sans figures, outline ink icons. ")

S["12-opinia-m"] = (None, "1024x1536",
 MOB + "SECTION = SINGLE REVIEW (mobile). One centered card (near-white, radius 16, hairline): five "
 "amber stars, ink label 'Pojedyncza dostepna opinia', serif-italic quote 'Bardzo ladne male drzewko. "
 "Elementy dobrze do siebie pasuja. Latwe w montazu. Kot jest zadowolony. Dziekuje.', small sans "
 "'Tlumaczenie z angielskiego'. NO badge '5,0/5', NO counter, NO avatar. ")

S["13-faq-m"] = (None, "1024x1536",
 MOB + "SECTION = FAQ (mobile). Full-width accordion, first item open, thin +/- outline ink toggles: "
 "'Czy wieza sie przewroci?', 'Dla ilu kotow?', 'Czy sie zmiesci w pokoju?', 'Jak wyglada montaz?', "
 "'Jakie kolory?', 'Zwrot i platnosc?'. Eyebrow 'FAQ', serif headline 'Czeste pytania'. ")

S["14-final-m"] = ("prod", "1024x1536",
 MOB + "SECTION = FINAL CTA (mobile), full-bleed evening scene. The beige tower with a cat asleep, warm "
 "lamp light, a moving sheer curtain. Overlaid on a scrim: serif headline 'Twoj kot zasluguje na "
 "wlasne miejsce.', a full-width amber CTA 'Zamawiam Wiezyka - 379,00 zl', small sans 'platnosc przy "
 "odbiorze - zwrot 14 dni'. ")

def build():
    idx = []
    for name, (ref, size, body) in S.items():
        parts = [UI, STYLE]
        if ref == "prod":
            parts.append(PROD)
        parts.append(body)
        parts.append(NEG)
        io.open(os.path.join(HERE, "p-%s.txt" % name), "w", encoding="utf-8").write("".join(parts))
        idx.append({"name": name, "size": size, "ref": ref if ref else None})
    io.open(os.path.join(HERE, "_index.json"), "w", encoding="utf-8").write(
        json.dumps(idx, ensure_ascii=False, indent=1))
    print("emitted %d prompts + _index.json" % len(idx))

if __name__ == "__main__":
    build()

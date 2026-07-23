# -*- coding: utf-8 -*-
"""Styl-master ROZGRZEWEK (F2.5): 1 plansza DNA serii (3:2), local HIGH -> fallback edge MEDIUM.
Plansza (NIE druga hero-scena): paleta + 2 fonty + radius + ikony + trust-pill + glebia +
sygnatura „kregi ciepla" (koncentryczne luki) + DUZE LICZBY (9 · 21) + kafel PRODUKT (granat,
21 kulek) + kafel SWIAT (wieczorny cieply salon). Ref: navy-whole crop z g0 jako 'product'."""
import os, sys
import genlib as G

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
REFS = os.path.join(HERE, 'refs-cache')
NAVY = os.path.join(REFS, 'navy-whole.png')
NAVY_URL = G.PUB + 'bud-assets/rozgrzewek/refs/navy-whole.webp'

DNA = ('STYLE-DNA: warm whitened seashell-peach page #FAF3EF with section bands #F3E9E3 and white '
       'cards #FFFFFF (soft evening warmth, NEVER powder-pink and NEVER linen-beige); ink #2B2622, '
       'body #453E38, hairlines #E4D7CE; EXACTLY ONE accent royal indigo-navy #2E46C8 used ONLY for '
       'the CTA button, a soft italic underline-swash under one headline word, and the OUTER arc of '
       'the signature "warmth rings" (2-3 thin concentric arcs echoing the 21 steel beads of the '
       'massage head, placed near section eyebrows); all functional icons thin 1.75px outline in '
       'ink; display font Fraunces (soft characterful serif, weights 600-700) for headlines, prices '
       'and BIG numbers (9 · 21); text font Work Sans; one series radius 18px (cards) / 10px '
       '(small); trust-pills: white fill, 1px hairline border, ink text; soft layered warm-ambient '
       'shadows, subtle grain on bands only; light backgrounds only; the product ALWAYS navy-blue '
       'handle with silver beaded head. Polish diacritics correct. No watermarks, no phone frames, '
       'crisp UI.')

PROMPT = (
    'STYLE-MASTER SPECIMEN BOARD (3:2 landscape) for a Polish e-commerce landing page series — a '
    'DESIGN-SYSTEM BOARD, not a hero scene: an organized specimen sheet on the warm whitened '
    'seashell-peach page background #FAF3EF presenting the complete visual DNA of the series, theme '
    '"Wieczorny rytual ciepla" (a warm evening self-care ritual), in labeled tiles. GRID OF TILES: '
    '(1) PALETTE tile: swatch chips with hex labels #FAF3EF, #F3E9E3, #FFFFFF, #2B2622, #453E38, '
    '#E4D7CE and one royal indigo-navy chip #2E46C8. '
    '(2) TYPE tile: display specimen "Rozgrzewek" and a BIG price "84,90 zl" in Fraunces (soft '
    'characterful serif, ink), one Work Sans body line "Podgrzewany masazer do ciala — cieplo, '
    'wibracje i tryb EMS" and an ALL-CAPS tracked eyebrow in Work Sans "TWOJ WIECZORNY RYTUAL"; '
    'under the word "Rozgrzewek" a soft italic navy #2E46C8 underline-swash. '
    '(3) SIGNATURE tile: the "warmth rings" — 2 to 3 thin concentric arcs under a small eyebrow, '
    'the inner arcs hairline #E4D7CE and the OUTERMOST arc royal indigo-navy #2E46C8 (echoing the '
    'concentric rings of steel beads on the massage head); plus BIG NUMBERS specimen "9 · 21" in '
    'Fraunces 700 ink as a typographic graphic. '
    '(4) UI tile: a white card (radius 18px, soft layered warm shadow) with a full-width royal '
    'indigo-navy #2E46C8 button "Chce swoj Rozgrzewek" in white text, above it the price "84,90 zl" '
    'big in Fraunces, below two trust pills "Platnosc przy odbiorze" and "14 dni na zwrot" (white '
    'fill, 1px hairline border, ink text). '
    '(5) ICONS tile: four thin 1.75px outline icons in ink only: gentle warmth/heat waves, a '
    'vibration symbol, an EMS micro-pulse wave, a round LED level display showing a digit. '
    '(6) PRODUCT tile: small clean photo of the handheld body massager from the product reference '
    'image (a NAVY-BLUE matte "mushroom" handle with a round LED display and three tiny status '
    'dots, a metallic champagne collar ring, and a rounded navy ribbed head with silvery steel '
    'beads) on a white card — color anchor of the series; keep the product EXACTLY as in the '
    'reference (navy-blue body, silver beaded head), NO printed brand text on it. '
    '(7) WORLD tile: one small muted photo chip of a real cozy Polish living room in warm evening '
    'lamp light — a sofa, a soft knitted blanket, a mug of tea and a warm glowing lamp — reading '
    'as warm seashell-peach evening, NOT powder-pink and NOT linen-beige. '
    'Tiles separated by generous whitespace on the seashell-peach page, small ink labels above each '
    'tile (PALETA, TYPOGRAFIA, SYGNATURA, UI, IKONY, PRODUKT, SWIAT). ' + DNA +
    ' NEG: no printed brand text, no Hailicare logo, no watermarks, no white/ivory/champagne-bodied '
    'variant, no pink/magenta/rose variant, no gray variant — navy-blue body with silver beaded '
    'head only (the metallic collar ring and silver beads are correct and stay); no medical clinic, '
    'no spa salon, no fantasy scenery, no dark backgrounds, no phone frames, no browser chrome, '
    'crisp UI rendering, EXACTLY ONE BOARD and nothing else.')

path = G.generate('00-styl-master', '00-styl-master.png', PROMPT,
                  ref_local_paths=[NAVY],
                  ref_urls_typed=[{'url': NAVY_URL, 'type': 'product'}],
                  aspect='3:2', workflow_id='rozgrzewek-styl-master')
# kopia do brand/
import shutil
brand_out = os.path.join(HERE, 'brand', '00-styl-master.png')
os.makedirs(os.path.dirname(brand_out), exist_ok=True)
shutil.copyfile(path, brand_out)
print('OK styl-master ->', brand_out)

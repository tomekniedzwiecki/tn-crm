# -*- coding: utf-8 -*-
"""Styl-master GADULEK — 1 plansza DNA serii (3:2), local HIGH -> fallback edge MEDIUM.
PLANSZA (nie druga hero-scena): paleta z rolami + 2 fonty z kontrastem (Fredoka display /
Alegreya Sans text) + JEDEN radius 20 + ikony outline ink + trust-pill + ciepla glebia +
sygnatura "malinowa fala miedzy okienkami" + DUZE LICZBY (89,90 zl · 2,0" · 480P) + kafel
PRODUKT (para blekit+roz) + kafel SWIAT (podworko/pokoj dziecka).
Ref: prod-whole crop (fidelity anchor); edge fallback type='ref' (styl-master NIE 'product')."""
import os, sys, shutil
import genlib as G
from common import DNA

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
PRODP = os.path.join(HERE, 'refs-cache', 'prod-whole.png')
PROD_URL = G.PUB + 'bud-assets/gadulek/refs/prod-whole.webp'

PROMPT = (
 'STYLE-MASTER SPECIMEN BOARD (3:2 landscape) for a Polish kids-toy e-commerce landing-page series '
 '— a DESIGN-SYSTEM BOARD, NOT a hero scene: an organised specimen sheet on the warm CREAM page '
 'background #FFF8EF presenting the complete visual DNA of the series, theme "Dwa okienka, jedna '
 'przygoda" (two little windows, one adventure — children who can SEE each other while they talk), '
 'laid out in labelled tiles with generous whitespace, a cheerful picture-book mood. GRID OF TILES: '
 '(1) PALETA tile: swatch chips with hex labels #FFF8EF, #FFFDF9, #FFE9DC, #3C1F28, #574C44, '
 '#F0E2D6 and ONE warm RASPBERRY-pink chip #C5265B marked as the single accent. '
 '(2) TYPOGRAFIA tile: a big display specimen word "Gadulek" and a BIG price "89,90 zl" set in '
 'Fredoka (a rounded, soft, chunky playful toy-brand grotesk, heavy), an ALL-CAPS tracked eyebrow '
 '"ZABAWA, NA KTOREJ SIE WIDZA" and one body line "Krotkofalowki z ekranem i kamera" set in '
 'Alegreya Sans (a warm humanist) — the two typefaces clearly CONTRAST; under the word "Gadulek" a '
 'short soft italic raspberry #C5265B underline-swash. '
 '(3) SYGNATURA tile: demonstrate the "malinowa fala miedzy okienkami" signature — a soft raspberry '
 'SIGNAL-WAVE line flowing out of one device antenna and into another rounded screen-frame, with '
 'little plus-marks "+" and small wave ticks (NOT a WiFi symbol); plus a BIG NUMBERS specimen '
 '"2,0\\" · 480P · 100-400 m" set big in Fredoka ink as a typographic graphic. '
 '(4) UI tile: an off-white card (radius 20px, soft warm layered shadow, rounded picture-book '
 'corners) with a full-width raspberry #C5265B CTA button "Zamawiam 2 Gadulki — 89,90 zl" in white '
 'text, above it the price "89,90 zl" big in Fredoka with "za 2 sztuki", and below two trust pills '
 '"Platnosc przy odbiorze" and "Zwrot 14 dni" (cream fill, 1px hairline border, ink text). '
 '(5) IKONY tile: four thin 1.9px OUTLINE icons in ink only (never raspberry): a little screen with '
 'a face, a speech/talk bubble, a battery/Type-C plug, and a shield-3plus "3+" — one consistent '
 'outline set. '
 '(6) PRODUKT tile: a small clean photo of the PAIR of kids walkie-talkies from the product '
 'reference image (one powder-BLUE, one PINK, rounded toy body, short stubby antenna with wave '
 'marks, round camera above a 2.0-inch screen showing a childs face, oval side talk button) on an '
 'off-white card — the COLOUR ANCHOR of the series; keep the product exactly as in the reference, '
 'NO printed brand text. '
 '(7) SWIAT tile: one small bright photo chip of a real warm scene — a sunny garden / a bright '
 'child room — reading as cheerful cream/peach picture-book light, NOT dark and NOT cold grey. '
 'Small ink labels above each tile (PALETA, TYPOGRAFIA, SYGNATURA, UI, IKONY, PRODUKT, SWIAT). '
 + DNA +
 ' NEG: no printed brand text, no "magecam" logo, no watermarks, no HD/4K, no dark background, no '
 'neon, no phone frame, no browser chrome, crisp UI rendering, EXACTLY ONE BOARD and nothing else.')

path = G.generate('00-styl-master', '00-styl-master.png', PROMPT,
                  ref_local_paths=[PRODP],
                  ref_urls_typed=[{'url': PROD_URL, 'type': 'ref'}],
                  aspect='3:2', workflow_id='gadulek-styl-master')
brand_out = os.path.join(HERE, 'brand', '00-styl-master.png')
os.makedirs(os.path.dirname(brand_out), exist_ok=True)
shutil.copyfile(path, brand_out)
print('OK styl-master ->', brand_out)

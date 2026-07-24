# -*- coding: utf-8 -*-
"""Styl-master ZAPINEK — 1 plansza DNA serii (3:2), local HIGH -> fallback edge MEDIUM.
PLANSZA (nie druga hero-scena): paleta z rolami + Fraunces/Manrope z kontrastem + radius 16 +
ikony outline ink + trust-pill + sygnatura STITCHING + duze liczby (41-71 cm / 40-55 cm / 360) +
kafel PRODUKT (fioletowy pas z kwiatkiem, ref g1) + kafel SWIAT (jasne wnetrze auta + zielen spaceru)."""
import os, sys, shutil
import genlib as G
from common import DNA

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
PROD = os.path.join(HERE, 'galeria-kuracja', 'g1.png')
PROD_URL = G.PUB + 'bud-products/1005012210858469/g1.webp'

PROMPT = (
 'STYLE-MASTER SPECIMEN BOARD (3:2 landscape) for a Polish e-commerce landing-page series — a '
 'DESIGN-SYSTEM BOARD, NOT a hero scene: an organised specimen sheet on the warm IVORY page '
 'background #FBF7F1 presenting the complete visual DNA of the series, theme "Tasma wspolnej '
 'drogi" (one purple strap carrying a dog from the car ride to the walk — warm sunlit car '
 'interior and green sidewalk), laid out in labelled tiles with generous whitespace. '
 'GRID OF TILES: '
 '(1) PALETA tile: swatch chips with hex labels #FBF7F1, #EFE5DA, #FFFDFC, #27212B and ONE rich '
 'violet chip #7440A8 marked as the single accent. '
 '(2) TYPOGRAFIA tile: a big display specimen word "Zapinek" and a BIG price "19,90 zl" set in '
 'Fraunces (soft warm serif, weight 700), an ALL-CAPS tracked eyebrow "W AUCIE I NA SPACERZE" '
 'and one body line "Pas samochodowy, ktory po zdjeciu dziala jako smycz" set in Manrope (clean '
 'geometric sans) — the two typefaces clearly CONTRAST (warm serif vs clean sans). '
 '(3) SYGNATURA tile: demonstrate the "stitching" signature — a card and a photo frame each with '
 'ONE short DASHED stitch-line (like the sewn seam of nylon webbing) as separator, always the '
 'same dash style; plus a BIG NUMBERS specimen "41-71 cm · 40-55 cm · 360°" set big in Fraunces '
 'ink as a typographic graphic. '
 '(4) UI tile: an off-white card #FFFDFC (radius 16px, soft warm layered shadow) with a '
 'full-width violet #7440A8 CTA button "Zamawiam — 19,90 zl" in white text, above it the price '
 '"19,90 zl" big in Fraunces, and below two trust pills "Platnosc przy odbiorze" and "Zwrot 14 '
 'dni" (ivory fill, 1px hairline border, ink text). '
 '(5) IKONY tile: four thin 1.75px OUTLINE icons in ink only (never violet): a snap-lock buckle '
 'clicking, a headrest loop, a swivel carabiner with rotation arrows, and a paw with a leash '
 'line — one consistent outline set. '
 '(6) PRODUKT tile: a small clean photo of the purple dog seat-belt strap from the reference '
 'image (purple webbing, black plastic buckles, silver triangular ring, silver swivel carabiner, '
 'ONE purple 3D flower charm with yellow centre) laid on light car upholstery on an off-white '
 'card — the COLOUR ANCHOR of the series; keep the product exactly as in the reference. '
 '(7) SWIAT tile: one small muted photo chip of the series world — a warm sunlit light-beige car '
 'seat by the window on one side and a soft green sunlit sidewalk on the other, reading as one '
 'warm world, NOT cold grey, NOT dark. '
 'Small ink labels above each tile (PALETA, TYPOGRAFIA, SYGNATURA, UI, IKONY, PRODUKT, SWIAT). '
 + DNA +
 ' NEG: no printed brand text on webbing, no watermarks, no dark background, no neon, no phone '
 'frame, no browser chrome, crisp UI rendering, EXACTLY ONE BOARD and nothing else.')

path = G.generate('00-styl-master', '00-styl-master.png', PROMPT,
                  ref_local_paths=[PROD],
                  ref_urls_typed=[{'url': PROD_URL, 'type': 'ref'}],
                  aspect='3:2', workflow_id='zapinek-styl-master')
brand_out = os.path.join(HERE, 'brand', '00-styl-master.png')
os.makedirs(os.path.dirname(brand_out), exist_ok=True)
shutil.copyfile(path, brand_out)
print('OK styl-master ->', brand_out)

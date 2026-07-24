# -*- coding: utf-8 -*-
"""Styl-master BLASIK — 1 plansza DNA serii (3:2), local HIGH -> fallback edge MEDIUM.
PLANSZA (nie druga hero-scena): paleta z rolami + Gabarito/Karla z kontrastem + radius 12 +
ikony outline ink + trust-pill + sygnatura LUK CZUJNIKA ((·)) + duze liczby (6 trybow / ~68 g /
IPX4) + kafel PRODUKT (czarny korpus + zolto-limonkowa listwa COB, ref c-lit) + kafel SWIAT
(bounded pas zmierzchu ze snopem NA jasnej planszy — bounded-mrok jako zasada, NIE pelny mrok)."""
import os, sys, shutil
import genlib as G
from common import DNA

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
PROD = os.path.join(HERE, 'galeria-kuracja', 'c-lit.png')
PROD_URL = G.PUB + 'bud-assets/blasik/gallery/c-lit.webp'

PROMPT = (
 'STYLE-MASTER SPECIMEN BOARD (3:2 landscape) for a Polish e-commerce landing-page series — a '
 'DESIGN-SYSTEM BOARD, NOT a hero scene: an organised specimen sheet on a bright DAY page '
 'background #F2F1EC (linen-and-workshop-concrete-in-daylight tone), theme "Swiatlo niesione tam, '
 'gdzie patrzysz" (one beam — wide COB + focused XPE — carried by an LED headlamp), laid out in '
 'labelled tiles with generous whitespace. '
 'GRID OF TILES: '
 '(1) PALETA tile: swatch chips with hex labels #F2F1EC, #E6E8E3, #FFFFFF, #292722 and ONE bright '
 'signal-yellow chip #D9BE00 marked as the SINGLE accent, next to a small dark chip #1B1406 '
 'labelled as the CTA ink. '
 '(2) TYPOGRAFIA tile: a big display specimen word "Blasik" and a BIG price "14,90 zl" set in '
 'Gabarito (rounded geometric, weight 800), an ALL-CAPS tracked eyebrow "LATARKA CZOLOWA LED" '
 'and one body line "Szeroka listwa COB, skupiony reflektor XPE i czujnik machniecia" set in '
 'Karla (calm humanist sans) — the two typefaces clearly CONTRAST (solid rounded display vs calm '
 'sans text). '
 '(3) SYGNATURA tile: demonstrate the "sensor arc / beam" signature — a small "((·))" arc mark '
 '(concentric arcs radiating from a dot, encoding the motion sensor and the spreading light) shown '
 'once by a heading and once by a card, always the same shape; plus a BIG NUMBERS specimen '
 '"6 trybow · ~68 g · IPX4" set big in Gabarito ink as a typographic graphic. '
 '(4) UI tile: a white card #FFFFFF (radius 12px, soft warm layered shadow) with a full-width '
 'signal-yellow #D9BE00 CTA button "Zamawiam — 14,90 zl" in DARK warm ink #1B1406 text (taxi-sign '
 'contrast, never white text on yellow), above it the price "14,90 zl" big in Gabarito, and below '
 'two trust pills "Platnosc przy odbiorze" and "Zwrot 14 dni" (light #F2F1EC fill, 1px hairline '
 'border, ink text). '
 '(5) IKONY tile: four thin 1.75px OUTLINE icons in ink only (never yellow): a wide COB light '
 'strip, a focused XPE beam cone, a hand doing a wave gesture over a sensor, and a rain droplet '
 '(IPX4) — one consistent outline set. '
 '(6) PRODUKT tile: a small clean photo of the Blasik LED headlamp from the reference image '
 '(black soft-silicone headband, a WIDE yellow-lime COB strip glowing along the front, a round '
 'XPE reflector spot, the module on ONE side with two buttons and a small red indicator) laid on a '
 'white card — the COLOUR ANCHOR of the series; keep the product exactly as in the reference. '
 '(7) SWIAT tile: one small chip of the series world — a BOUNDED band of blue dusk with a warm '
 'beam cutting into it, sitting on the bright #F2F1EC board, its edges melting into the light page '
 '(bounded-mrok as principle) — NOT a full-dark tile, NOT cold grey, reading as "the page is day, '
 'the beam goes where the day ends". '
 'Small ink labels above each tile (PALETA, TYPOGRAFIA, SYGNATURA, UI, IKONY, PRODUKT, SWIAT). '
 + DNA +
 ' NEG: no printed brand text on the headlamp (no Heinast/BIAT/LX300), no Type-C, no lumens or '
 '"230", no watermarks, no full-dark background, no neon, no phone frame, no browser chrome, crisp '
 'UI rendering, EXACTLY ONE BOARD and nothing else.')

path = G.generate('00-styl-master', '00-styl-master.png', PROMPT,
                  ref_local_paths=[PROD],
                  ref_urls_typed=[{'url': PROD_URL, 'type': 'ref'}],
                  aspect='3:2', workflow_id='blasik-styl-master')
brand_out = os.path.join(HERE, 'brand', '00-styl-master.png')
os.makedirs(os.path.dirname(brand_out), exist_ok=True)
shutil.copyfile(path, brand_out)
print('OK styl-master ->', brand_out)

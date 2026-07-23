# -*- coding: utf-8 -*-
"""Styl-master SSAWEK (Popiolek) — 1 plansza DNA serii (3:2), local HIGH -> fallback edge MEDIUM.
PLANSZA (nie druga hero-scena): paleta z rolami + 2 fonty z kontrastem (Barlow Semi Condensed
display / Hanken Grotesk text) + JEDEN radius + ikony outline ink + trust-pill + ciepla glebia +
sygnatura S6 znacznik-rozek + DUZE LICZBY (119 zl · 2000 W · 20 l) + kafel PRODUKT (kanister,
czerwona pokrywa) + kafel SWIAT (kominek/garaz — brudna gorata robota ujarzmiona).
Ref: prod-whole crop (fidelity anchor); edge fallback type='ref' (styl-master NIE 'product')."""
import os, sys, shutil
import genlib as G
from common import DNA

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
PROD = os.path.join(HERE, 'refs-cache', 'prod-whole.png')
PROD_URL = G.PUB + 'bud-assets/ssawek/refs/prod-whole.webp'

PROMPT = (
 'STYLE-MASTER SPECIMEN BOARD (3:2 landscape) for a Polish e-commerce landing-page series — a '
 'DESIGN-SYSTEM BOARD, NOT a hero scene: an organised specimen sheet on the warm SAND page '
 'background #F3EDE4 presenting the complete visual DNA of the series, theme "Brudna, goraca robota '
 'ujarzmiona" (dirty hot work brought to order — fireplace ash, garage rubble, steel and red in a '
 'warm working light), laid out in labelled tiles with generous whitespace. GRID OF TILES: '
 '(1) PALETA tile: swatch chips with hex labels #F3EDE4, #E9E1D3, #DACFBC, #1C1815, #2E2620, '
 '#D7C9B3 and ONE deep industrial vermilion-red chip #C2381B marked as the single accent. '
 '(2) TYPOGRAFIA tile: a big display specimen word "Popiolek" and a BIG price "119 zl" set in '
 'Barlow Semi Condensed (condensed industrial grotesk, heavy 800), an ALL-CAPS tracked eyebrow '
 '"BRUDNA ROBOTA, OGARNIETA" and one body line "Odkurzacz do popiolu, gruzu i warsztatu" set in '
 'Hanken Grotesk (normal-width humanist) — the two typefaces clearly CONTRAST; under the word '
 '"Popiolek" a short soft italic vermilion #C2381B underline-swash. '
 '(3) SYGNATURA tile: demonstrate the "S6 znacznik-rozek" signature — a card and a photo frame '
 'each with a single angular CHAMFERED / cut corner on the SAME corner (like a metal bracket or a '
 'machine rating-plate); plus a BIG NUMBERS specimen "2000 W · 20 l · 4,7 kg" set big in Barlow '
 'Semi Condensed ink as a typographic graphic. '
 '(4) UI tile: an off-white card (radius 14px, soft warm layered shadow, one chamfered corner) '
 'with a full-width vermilion #C2381B CTA button "Zamawiam — 119 zl" in white text, above it the '
 'price "119 zl" big in Barlow Semi Condensed, and below two trust pills "Platnosc przy odbiorze" '
 'and "Zwrot 14 dni" (sand fill, 1px hairline border, ink text). '
 '(5) IKONY tile: four thin 1.75px OUTLINE icons in ink only (never red): a flame/ash swirl, a '
 'washable basket filter, a blower/air puff, and a wet-and-dry water drop — one consistent outline '
 'set. '
 '(6) PRODUKT tile: a small clean photo of the vacuum from the product reference image (a short '
 'stainless-steel canister with a RED domed lid, black wheeled base, twin metal clamps, a black '
 'corrugated hose) on an off-white card — the COLOUR ANCHOR of the series; keep the product '
 'exactly as in the reference, NO printed brand text on the tank. '
 '(7) SWIAT tile: one small muted photo chip of a real warm scene — a home hearth with grey ash '
 'beside a concrete garage floor with a little rubble — reading as warm SAND / whitened concrete '
 'in a working light, NOT cream-yellow and NOT cold grey. '
 'Small ink labels above each tile (PALETA, TYPOGRAFIA, SYGNATURA, UI, IKONY, PRODUKT, SWIAT). '
 + DNA +
 ' NEG: no printed brand text, no "Lehmann"/"Haddo" logo, no watermarks, no red lid replaced by '
 'another colour, no dark background, no neon, no phone frame, no browser chrome, crisp UI '
 'rendering, EXACTLY ONE BOARD and nothing else.')

path = G.generate('00-styl-master', '00-styl-master.png', PROMPT,
                  ref_local_paths=[PROD],
                  ref_urls_typed=[{'url': PROD_URL, 'type': 'ref'}],
                  aspect='3:2', workflow_id='ssawek-styl-master')
brand_out = os.path.join(HERE, 'brand', '00-styl-master.png')
os.makedirs(os.path.dirname(brand_out), exist_ok=True)
shutil.copyfile(path, brand_out)
print('OK styl-master ->', brand_out)

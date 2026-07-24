# -*- coding: utf-8 -*-
"""Styl-master ZAGLADEK — 1 plansza DNA serii (3:2), local HIGH -> fallback edge MEDIUM.
PLANSZA (nie druga hero-scena): paleta z rolami + Archivo/IBM Plex Sans z kontrastem + radius 12 +
ikony outline ink + trust-pill + sygnatura VIEWFINDER BRACKETS (narozniki celownika) + duze liczby
(3 MP · 8 LED · 2 w 1) + kafel PRODUKT (glowka z pierscieniem 8 LED, ref c-glowka-8mm — colour anchor,
zrodlo bursztynu #EFA019) + kafel SWIAT (kieszen ciemnosci: ciemne wnetrze komory z bursztynowa
poswiata JAKO MALY KAFEL na jasnej planszy — ciemnosc CONTAINED, nie tlo)."""
import os, sys, shutil
import genlib as G
from common import DNA

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
PROD = os.path.join(HERE, 'galeria-kuracja', 'crops', 'c-glowka-8mm.png')
PROD_URL = G.PUB + 'bud-assets/zagladek/gallery/c-glowka-8mm.webp'

PROMPT = (
 'STYLE-MASTER SPECIMEN BOARD (3:2 landscape) for a Polish e-commerce landing-page series — a '
 'DESIGN-SYSTEM BOARD, NOT a hero scene: an organised specimen sheet on the light warm workshop '
 'GREIGE page background #F3EEE4, theme "Swiatlo sondy odslania niewidoczne" (one amber LED working '
 'light travels the landing and turns a dark inaccessible pocket into a bright live image on the '
 'phone; a real garage / home-utility / workbench world), laid out in labelled tiles with generous '
 'whitespace. '
 'GRID OF TILES: '
 '(1) PALETA tile: swatch chips with hex labels #F3EEE4, #F7F9F8, #FFFDF8, #1B211F and ONE luminous '
 'amber chip #EFA019 marked as the single accent (LED amber). '
 '(2) TYPOGRAFIA tile: a big display specimen word "Zagladek" and a BIG price "74,90 zl" set in '
 'Archivo (tight industrial grotesk, weight 800), an ALL-CAPS tracked eyebrow "KAMERA INSPEKCYJNA '
 'DO TELEFONU" and one body line "Zajrzyj tam, gdzie nie siega wzrok" set in IBM Plex Sans (calm '
 'humanist sans) — the two typefaces clearly CONTRAST (tight industrial display grotesk vs calm '
 'humanist text sans); small ink labels "Archivo" and "IBM Plex Sans" name the two roles. '
 '(3) SYGNATURA tile: demonstrate the "viewfinder brackets" signature — a card and a small preview '
 'frame each with thin AMBER camera-viewfinder corner marks (celownik) at their corners, always the '
 'same style; plus a BIG NUMBERS specimen "3 MP · 8 LED · 2 w 1" set big in Archivo ink as a '
 'typographic graphic. '
 '(4) UI tile: a cream card #FFFDF8 (radius 12px, soft warm layered shadow, thin amber viewfinder '
 'corner marks) with a full-width amber #EFA019 CTA button "Zamawiam — 74,90 zl" whose label is in '
 'DARK ink #1B1406 (NOT white — WCAG contrast), above it the price "74,90 zl" big in Archivo, and '
 'below two trust pills "Platnosc przy odbiorze" and "Zwrot 14 dni" (cream fill #FFFDF8, 1px '
 'hairline border, ink text). '
 '(5) IKONY tile: four thin 1.75px OUTLINE icons in ink only (never amber): a gooseneck probe with '
 'an LED-ring head, a smartphone showing a live-view image, an eight-LED ring around a lens, and a '
 'hook with a magnet — one consistent outline set. '
 '(6) PRODUKT tile: a small clean photo of the black inspection-camera head from the reference '
 'image (black metal head with a ring of EXACTLY EIGHT warm gold LEDs around the central lens, on '
 'the light blue detail surface as in the reference) on a cream card — the COLOUR ANCHOR of the '
 'series, the amber LED glow being the source of the #EFA019 accent; keep the product exactly as in '
 'the reference. '
 '(7) SWIAT tile: one small muted photo chip of the series world — the "kieszen ciemnosci": the '
 'dark interior of an engine bay / cavity lit from within by a warm amber LED glow revealing what '
 'is inside, framed as a SMALL tile on the light board (the darkness stays CONTAINED inside this '
 'one tile, it is NOT the board background), reading as one warm workshop world, NOT a dark section. '
 'Small ink labels above each tile (PALETA, TYPOGRAFIA, SYGNATURA, UI, IKONY, PRODUKT, SWIAT). '
 + DNA +
 ' NEG: no built-in screen on the device (image only on the phone), no wifi box, no Type-C on the '
 'camera module, no printed brand text on the body, exactly eight LEDs, no watermarks, no DARK '
 'board background (darkness only inside the small SWIAT tile), no neon, no phone bezel, no browser '
 'chrome, crisp UI rendering, EXACTLY ONE BOARD and nothing else.')

path = G.generate('00-styl-master', '00-styl-master.png', PROMPT,
                  ref_local_paths=[PROD],
                  ref_urls_typed=[{'url': PROD_URL, 'type': 'ref'}],
                  aspect='3:2', workflow_id='zagladek-styl-master')
brand_out = os.path.join(HERE, 'brand', '00-styl-master.png')
os.makedirs(os.path.dirname(brand_out), exist_ok=True)
shutil.copyfile(path, brand_out)
print('OK styl-master ->', brand_out)

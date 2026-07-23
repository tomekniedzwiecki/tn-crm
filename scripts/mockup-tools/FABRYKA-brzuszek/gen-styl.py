# -*- coding: utf-8 -*-
"""Styl-master BRZUSZEK (F2.5): 1 generacja medium 3:2 przez wf2-gen.
Plansza DNA serii (NIE druga hero-scena): paleta + 2 fonty + radius + ikony + trust-pill
+ glebia + sygnatura „pasek powtorzen" + DUZE LICZBY (5 · 2 · ≈200 kg) + kafel PRODUKT
(kotwica koloru: biala rama + rozowe walki) + kafel SWIAT (jasny salon lila-mgla).
Ref: wyretuszowany packshot jako 'product' (STANDARD F2.1)."""
import io, json, os, re, sys, urllib.request

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
BASE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
PACKSHOT = PUB + 'bud-assets/brzuszek/brand/packshot-retusz.webp'

DNA = ('STYLE-DNA: cool whitened-lilac page #F7F5FB with section bands #F0ECF7 and white cards '
       '#FFFFFF (NEVER warm powder pink); ink #241E2E, body #38323F, hairlines #DCD5E8; EXACTLY '
       'ONE accent fuchsia-violet #A21CAF used ONLY for the CTA button, a straight bold '
       'underline-swash under one headline word, and the LAST segment of the signature "rep bar" '
       '(a row of five short 16x3px dashes under section eyebrows — four muted lilac #C9C2D6, the '
       'fifth fuchsia-violet); all functional icons thin 1.75px outline in ink; display font '
       'Archivo Expanded (wide sporty poster sans, weights 700-800) for headlines, prices and BIG '
       'numbers (5 · 2 · ≈200 kg); text font Figtree; one series radius 24px (cards) / 12px '
       '(small); trust-pills: white fill, 1px hairline border, ink text; soft layered warm-ambient '
       'shadows, subtle grain on bands only; light backgrounds only; the machine ALWAYS white '
       'frame + pink foam rollers. Polish diacritics correct. No watermarks, no phone frames, '
       'crisp UI.')

PROMPT = (
    'STYLE-MASTER SPECIMEN BOARD (3:2 landscape) for a Polish e-commerce landing page series — '
    'a DESIGN-SYSTEM BOARD, not a hero scene: an organized specimen sheet on the cool '
    'whitened-lilac page background #F7F5FB presenting the complete visual DNA of the series, '
    'theme "Domowa seria" (home workout series), in labeled tiles. GRID OF TILES: '
    '(1) PALETTE tile: five swatch chips with hex labels #F7F5FB, #F0ECF7, #FFFFFF, #241E2E, '
    '#A21CAF plus one small muted-lilac chip #C9C2D6. '
    '(2) TYPE tile: display specimen "Brzuszek" and a BIG price "429,00 zł" in Archivo Expanded '
    '(wide sporty poster sans, ink), one body paragraph line in Figtree "Skladana maszyna do '
    'cwiczen brzucha i core" and an ALL-CAPS tracked eyebrow in Figtree "TWOJA DOMOWA SERIA"; '
    'under the word "Brzuszek" a straight bold fuchsia-violet #A21CAF underline-swash. '
    '(3) SIGNATURE tile: the "rep bar" — a row of five short 16x3px horizontal dashes (gap 4px) '
    'under a small eyebrow, the first four muted lilac #C9C2D6 and the fifth fuchsia-violet '
    '#A21CAF (the "rep completed"); plus BIG NUMBERS specimen "5 · 2 · ≈200 kg" in Archivo '
    'Expanded 800 ink as a typographic graphic. '
    '(4) UI tile: a white card (radius 24px, soft layered warm shadow) with a full-width '
    'fuchsia-violet #A21CAF button "Zamawiam Brzuszek" in white text, above it the price '
    '"429,00 zł" big in Archivo, below two trust pills "Skladana konstrukcja" and "14 dni na '
    'zwrot" (white fill, 1px hairline border, ink text). '
    '(5) ICONS tile: four thin 1.75px outline icons in ink only: a sliding cart on an incline '
    'rail, an adjustment gear/levels, a folding hinge with a safety pin, a small LCD counter. '
    '(6) PRODUCT tile: small clean photo of the folding ab exercise machine from the product '
    'reference image (white steel A-frame with pink U-shaped foam knee roller on a sliding cart, '
    'two pink cylindrical rollers by a white LCD console, handlebar grips, resistance bands, two '
    'floor crossbars) on a white card — color anchor of the series; keep the product EXACTLY as '
    'in the reference (white frame + pink rollers), NO printed brand text on it. '
    '(7) WORLD tile: one small muted photo chip of a bright real Polish living room in soft cool '
    'morning window light — parquet, a rug, a sofa and a leafy plant — reading as cool whitened '
    'lilac mist, NOT warm powder pink. '
    'Tiles separated by generous whitespace on the lilac page, small ink labels above each tile '
    '(PALETA, TYPOGRAFIA, SYGNATURA, UI, IKONY, PRODUKT, ŚWIAT). ' + DNA +
    ' NEG: no printed brand text, no MERACH logo, no Shop1103659154, no watermarks, no black-red '
    'variant, no black-blue variant, no dark/black frame — white frame with pink rollers only, no '
    'fantasy scenery (palms, beach, mountains), no dark backgrounds, no phone frames, no browser '
    'chrome, crisp UI rendering, EXACTLY ONE BOARD and nothing else.')

payload = {'fn': 'generate-image', 'payload': {
    'prompt': PROMPT, 'count': 1, 'workflow_id': 'brzuszek-styl-master',
    'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium', 'aspect_ratio': '3:2',
    'reference_images': [
        {'url': PACKSHOT, 'type': 'product'},
    ]}}
req = urllib.request.Request(BASE, data=json.dumps(payload).encode('utf-8'),
                             headers={'Content-Type': 'application/json', 'x-wf2-secret': SECRET})
j = json.loads(urllib.request.urlopen(req, timeout=600).read().decode('utf-8'))
url = (j.get('images') or [{}])[0].get('url')
if not url:
    print('FAIL:', json.dumps(j)[:300]); sys.exit(1)
data = urllib.request.urlopen(url, timeout=120).read()
out = os.path.join(HERE, 'brand', '00-styl-master.png')
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'wb').write(data)
print('OK styl-master ->', out, len(data) // 1024, 'KB')

# -*- coding: utf-8 -*-
"""Klatki uchwyt: nano-banana edit, pary FLF chainowane. Taguje uchwyt_*."""
import sys, os, json
sys.path.insert(0, r"C:\tmp\video-factory\tools"); import fal

ALI = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-products/1005011593467047/"
IDENT = [ALI+"g1.webp", ALI+"g4.webp", ALI+"g0.webp"]
BASE = r"C:\tmp\video-factory\uchwyt"

PROD = ("A matte BLACK plastic dashboard-clip phone holder EXACTLY as in the product reference: a "
    "rectangular phone cradle with four black corner grippers (two spring-loaded top clips with small "
    "ridged thumb-tabs and two L-shaped lower arms) on a pivoting back-plate; a central round black "
    "ball-joint with a small SILVER screw on a short two-segment arm allowing 360-degree rotation and tilt; "
    "the base is a strong spring-loaded clamp jaw - a flat triangular black pad on top and a curved black "
    "hook underneath with a small round rubber foot-tip - that grips over the raised edge of the car "
    "dashboard. All-black plastic with subtle silver screw accents, NO logos, NO text on the product. "
    "EXACTLY ONE holder in the scene, no second device. ")
SCENE = ("Interior of a modern car on the driver side in bright natural DAYLIGHT through the windshield; a "
    "dark grey-black dashboard with a raised instrument-cluster ledge; part of the steering wheel at the "
    "left edge. Photorealistic smartphone UGC footage look, natural handheld feel, slight grain. The phone "
    "is a plain neutral DARK smartphone with NO brand, NO logo, NO visible OS - either a black screen or a "
    "generic abstract navigation map (plain roads and one coloured route line). NO text overlays, NO logos. "
    "A bare adult hand, natural skin, no jewelry, no nail polish. NO face visible. ")

def g(tag, urls, prompt):
    res = fal.gen("fal-ai/nano-banana/edit", {"prompt": prompt, "image_urls": urls,
                  "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}, tag="uchwyt_"+tag)
    u = (res.get('images') or [{}])[0].get('url')
    out = os.path.join(BASE, 'gen', tag + '.png'); fal.download(u, out)
    stored = fal.store(out, f"uchwyt/gen/{tag}.png")
    print('OK', tag, stored, flush=True); return stored

if __name__ == '__main__':
    f = json.load(open(os.path.join(BASE,'gen','frames.json'))) if os.path.exists(os.path.join(BASE,'gen','frames.json')) else {}
    only = sys.argv[1:] or None
    def need(t): return (only is None) or (t in only)

    if need('packshot'):
        f['packshot'] = g('packshot', IDENT,
            "Studio product photo on a plain light-grey seamless background. "+PROD+
            "Shown at a 3/4 front angle, EMPTY cradle with NO phone, sharp focus, soft studio light. NO phone, NO text.")
    if need('base'):
        f['base'] = g('base', [f['packshot']],
            SCENE+PROD+"The holder is clipped firmly onto the raised ledge of the dashboard, EMPTY cradle, no phone yet, seen from the driver POV.")
    # 1 clip-on
    if need('s1_first'):
        f['s1_first'] = g('s1_first', [f['packshot']],
            SCENE+PROD+"A hand holds the holder just above the raised dashboard ledge, about to clip it on, the clamp jaw open right next to the ledge, driver POV.")
    if need('s1_last'):
        f['s1_last'] = g('s1_last', [f['s1_first']],
            "Keep EXACTLY the same car interior, framing, lighting and hand. Only change: the holder clamp jaw is now CLOSED and clipped firmly onto the dashboard ledge, the hand fingertips just releasing it. Same black holder, one holder only.")
    # 2 phone in
    if need('s2_first'):
        f['s2_first'] = g('s2_first', [f['base']],
            SCENE+PROD+"The holder is clipped on the dashboard with an EMPTY cradle; a hand brings a plain neutral dark smartphone toward the open cradle grippers, driver POV.")
    if need('s2_last'):
        f['s2_last'] = g('s2_last', [f['s2_first']],
            "Keep EXACTLY the same car interior, framing and lighting. Only change: the plain neutral dark phone is now SEATED in the cradle, held firmly at its four corners by the black grippers, the hand released. One holder, one phone.")
    # 3 rotate
    if need('s3_first'):
        f['s3_first'] = g('s3_first', [f['s2_last']],
            "Keep the SAME mounted black holder and car interior and lighting. The neutral dark phone is mounted in PORTRAIT (vertical) orientation showing a generic abstract map; a hand grips the phone edges about to rotate it.")
    if need('s3_last'):
        f['s3_last'] = g('s3_last', [f['s3_first']],
            "Keep EXACTLY the same black holder, car interior and lighting. Only change: the phone is now rotated 90 degrees to LANDSCAPE (horizontal) orientation in the same cradle, the hand having turned it. One holder, one phone.")
    # 4 nav/driving single
    if need('s4'):
        f['s4'] = g('s4', [f['base']],
            SCENE+PROD+"Driver POV over the dashboard: the neutral dark phone mounted in the holder sits in the driver eyeline showing a generic abstract navigation map (plain roads, one coloured route line); through the windshield an open road ahead in daylight.")
    # 5 no-shake
    if need('s5_first'):
        f['s5_first'] = g('s5_first', [f['s4']],
            "Keep the same mounted phone and car interior; a slightly CLOSER view, the road a bit bumpy through the windshield, a fingertip approaching near the mounted phone.")
    if need('s5_last'):
        f['s5_last'] = g('s5_last', [f['s5_first']],
            "Keep EXACTLY the same framing and mount and lighting. Only change: a fingertip TAPS the mounted phone and it stays perfectly steady and level, firmly held, not tilted. One holder, one phone.")
    # 6 cta hero
    if need('s6'):
        f['s6'] = g('s6', [f['s2_last']],
            SCENE+PROD+"Clean hero shot: the neutral dark phone mounted in the black holder on the dashboard, a hand gesturing toward it presenting it, warm daylight, driver POV.")

    json.dump(f, open(os.path.join(BASE,'gen','frames.json'),'w'), indent=1)
    print('DONE frames:', len(f))

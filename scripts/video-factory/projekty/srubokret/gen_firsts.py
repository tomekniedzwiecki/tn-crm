"""Klatki OTWIERAJACE (first) 5 scen - srubokret grzechotkowy 24w1. Hands-only, gunmetal."""
import sys, os, json
sys.path.insert(0, r"C:\tmp\video-factory\tools"); import fal

ALI = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-products/1005012065596256/"
G0, G1, G4, G5 = ALI+"g0.webp", ALI+"g1.webp", ALI+"g4.webp", ALI+"g5.webp"
BASE = r"C:\tmp\video-factory\srubokret"

# upload pose/composition stills -> URLs (pose only, own scenography regenerated)
POSE_STRUGGLE = fal.store(os.path.join(BASE, "refs", "pose_struggle.jpg"), "srubokret/refs/pose_struggle.jpg")
POSE_TIGHT    = fal.store(os.path.join(BASE, "refs", "pose_tight.jpg"),    "srubokret/refs/pose_tight.jpg")
print("uploaded pose refs", flush=True)

CARD = (" The tool is the 24-in-1 ratcheting T-bar screwdriver EXACTLY as in the product reference: a slim "
        "dark GUNMETAL / titanium-grey anodized aluminium handle with two cross-hatched knurled grip rings and a "
        "satin metal finish, a central rotating ratchet head with a round knurled ratchet wheel; NOT pink, NOT rose "
        "gold, NOT colored plastic. Photorealistic smartphone UGC top-down/eye-level look, natural texture, slight "
        "grain, soft warm daylight from upper-left, blue-grey felt work surface. NO text, NO logos, NO readable book titles.")

def gen(tag, urls, prompt):
    res = fal.gen("fal-ai/nano-banana/edit", {"prompt": prompt, "image_urls": urls,
                  "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}, tag="srubokret_"+tag)
    u = (res.get('images') or [{}])[0].get('url')
    out = os.path.join(BASE, 'frames', tag + '.png')
    fal.download(u, out); stored = fal.store(out, f"srubokret/frames/{tag}.png")
    print('OK', tag, flush=True); return stored

g = {}
g['s1_first'] = gen('s1_first', [POSE_STRUGGLE],
    "Close eye-level shot: a woman's hand awkwardly cramping a small plain SILVER L-shaped hex/allen key onto a "
    "bolt in a tight vertical gap right beside a black minimalist furniture leg, fingers pinched and tense with no "
    "room to turn, a bulky red-and-black cordless power drill sitting unused and too big in the lower-left "
    "background, neutral pale book spines on the right, blue-grey felt surface, soft warm daylight, frustrated "
    "struggling grip. Photorealistic smartphone UGC, natural skin texture, slight grain. NO text, NO logos, NO readable titles.")
g['s2_first'] = gen('s2_first', [G0, G1],
    "Top-down shot: a black hard-plastic clamshell tool case being opened, the lid tilting up, revealing inside the "
    "GUNMETAL 24-in-1 ratcheting T-bar screwdriver seated in the centre channel and 24 steel screwdriver bits with "
    "colored identification rings (teal, purple, orange, blue) arranged in a grey foam insert, a fingertip on the "
    "lid edge, blue-grey felt surface, soft warm daylight." + CARD)
g['s3_first'] = gen('s3_first', [G5, G0],
    "MACRO extreme close-up filling the frame: the gunmetal ratchet head of the tool with its round knurled ratchet "
    "wheel and the T-crossbar, and a hand holding a single steel bit that has a bright TEAL identification ring, the "
    "bit tip approaching the magnetic 1/4 inch socket of the tool, shallow depth of field, blurred blue-grey "
    "background." + CARD)
g['s4_first'] = gen('s4_first', [POSE_TIGHT, G0],
    "Eye-level shot: the assembled gunmetal ratcheting screwdriver in its T-handle configuration (crossbar swung "
    "out sideways) engaged with a black bit onto a bolt in a tight vertical gap right beside a black furniture leg "
    "- it FITS the narrow space - a woman's hand gripping the lower knurled handle from below, neutral pale book "
    "spines on the right, a red power-drill battery lying unused in the lower-left, blue-grey felt surface, soft "
    "warm daylight. Exactly ONE tool in the scene, the other hand is not present." + CARD)
g['s5_first'] = gen('s5_first', [G5, G0],
    "Hero product shot: the gunmetal 24-in-1 ratcheting T-bar screwdriver held upright at a slight angle next to "
    "the open black case full of 24 colored-ring steel bits, premium look, gunmetal metal catching a soft "
    "highlight, blue-grey felt surface, soft warm daylight, shallow depth of field." + CARD)

json.dump(g, open(os.path.join(BASE, 'frames', 'firsts.json'), 'w'), indent=1)
print('DONE firsts', len(g))

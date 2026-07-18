"""Klatki KONCOWE (tail) dla 3 scen transformacji (s2 reveal, s3 bit-snap, s4 ratchet)."""
import sys, os, json
sys.path.insert(0, r"C:\tmp\video-factory\tools"); import fal
BASE = r"C:\tmp\video-factory\srubokret"
F = json.load(open(os.path.join(BASE, 'frames', 'firsts.json')))

def gen(tag, urls, prompt):
    res = fal.gen("fal-ai/nano-banana/edit", {"prompt": prompt, "image_urls": urls,
                  "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}, tag="srubokret_"+tag)
    u = (res.get('images') or [{}])[0].get('url')
    out = os.path.join(BASE, 'frames', tag + '.png')
    fal.download(u, out); stored = fal.store(out, f"srubokret/frames/{tag}.png")
    print('OK', tag, flush=True); return stored

g = {}
g['s2_last'] = gen('s2_last', [F['s2_first']],
    "Keep EXACTLY the same case, tool, bits, foam, surface, lighting and top-down framing as this reference image. "
    "Only change: the clamshell lid is now fully open and upright, the hand has withdrawn out of frame, so the whole "
    "gunmetal ratchet T-bar screwdriver and all 24 colored-ring bits are cleanly and fully revealed, crisp.")
g['s3_last'] = gen('s3_last', [F['s3_first']],
    "Keep EXACTLY the same macro framing, gunmetal ratchet head, lighting and blurred background as this reference "
    "image. Only change: the teal-ring steel bit is now FULLY SEATED and clicked into the magnetic socket tip of the "
    "tool (no longer approaching, it is inserted), and the fingertip is just releasing it. Exactly ONE bit inserted.")
g['s4_last'] = gen('s4_last', [F['s4_first']],
    "Keep EXACTLY the same tool, hand, black furniture, background, surface and framing as this reference image. Only "
    "change: the hand has ratcheted the T-handle so the crossbar has rotated about 30 degrees, and the screw is now "
    "driven flush and slightly deeper into the furniture - clear forward progress. Exactly ONE tool.")

json.dump(g, open(os.path.join(BASE, 'frames', 'lasts.json'), 'w'), indent=1)
print('DONE lasts', len(g))

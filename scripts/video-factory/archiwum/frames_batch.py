"""Generuje klatki otwierajace dla scen z cut_version blueprintu (nano-banana/edit).
Referencje: [kotwica persony s00, czysty packshot]. Uzycie:
  python frames_batch.py <sceny przecinkiem, np. 1,2,7,8b,11,13,14> [suffix]
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__)); import fal

BASE = r"C:\tmp\video-factory\lokowka"
ANCHOR = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/video-factory/lokowka/gen/s00_frame_v1.png"
PACKSHOT = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/video-factory/lokowka/refs/packshot-clean.png"

CONSISTENCY = (" CONSISTENCY: the SAME woman as in the first reference image (same face, chestnut-brown hair, "
    "beige oversized t-shirt), same small bright bathroom with white waffle shower curtain and sage-grey walls "
    "unless the brief says otherwise. The pink automatic hair curler must EXACTLY match the second reference image "
    "(pink handle, small leaf emblem, thin LED strip, crown of curved prongs, rose-gold inner barrel). "
    "Photorealistic smartphone UGC look, natural lighting, slight grain. Absolutely NO text, NO logos, NO watermarks.")

def scene_by_id(bp, sid):
    if isinstance(sid, str) and not sid.isdigit():
        i, letter = int(sid[:-1]), sid[-1]
        return bp['scenes'][i]['subscenes'][ord(letter) - ord('a')]
    return bp['scenes'][int(sid)]

if __name__ == '__main__':
    bp = json.load(open(os.path.join(BASE, 'blueprint_v1.json'), encoding='utf-8'))
    ids = sys.argv[1].split(',')
    suffix = sys.argv[2] if len(sys.argv) > 2 else 'v1'
    for sid in ids:
        sc = scene_by_id(bp, sid)
        brief = sc['first_frame_brief_en']
        payload = {"prompt": brief + CONSISTENCY,
                   "image_urls": [ANCHOR, PACKSHOT],
                   "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}
        out = os.path.join(BASE, 'gen', f'f{sid}_{suffix}')
        try:
            res = fal.gen("fal-ai/nano-banana/edit", payload, tag=f'frame_{sid}_{suffix}')
            url = (res.get('images') or [{}])[0].get('url')
            fal.download(url, out + '.png')
            print('OK', sid, out + '.png', flush=True)
        except Exception as e:
            print('FAIL', sid, str(e)[:200], flush=True)

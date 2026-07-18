"""Animuje klatki otwierajace Klingiem wg promptow ruchu z blueprintu.
Uzycie: python animate_batch.py 1,2,7,8b,11,13,14 v1
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__)); import fal
from frames_batch import scene_by_id, BASE

STORE_PREF = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/video-factory/"
NEG = "morphing, warping, distorted face, distorted hands, extra fingers, product changing shape, logo appearing, text, low quality"

if __name__ == '__main__':
    bp = json.load(open(os.path.join(BASE, 'blueprint_v1.json'), encoding='utf-8'))
    ids = sys.argv[1].split(',')
    suffix = sys.argv[2] if len(sys.argv) > 2 else 'v1'
    for sid in ids:
        sc = scene_by_id(bp, sid)
        local = os.path.join(BASE, 'gen', f'f{sid}_{suffix}.png')
        out = os.path.join(BASE, 'gen', f'c{sid}_{suffix}.mp4')
        if os.path.exists(out):
            print('SKIP (istnieje)', out); continue
        url = fal.store(local, f'lokowka/gen/f{sid}_{suffix}.png')
        payload = {"prompt": sc['i2v_motion_prompt_en'], "image_url": url,
                   "duration": "5", "cfg_scale": 0.5, "negative_prompt": NEG}
        try:
            res = fal.gen("fal-ai/kling-video/v2.5-turbo/pro/image-to-video", payload, tag=f'clip_{sid}_{suffix}')
            vurl = (res.get('video') or {}).get('url')
            fal.download(vurl, out)
            print('OK', sid, out, flush=True)
        except Exception as e:
            print('FAIL', sid, str(e)[:200], flush=True)

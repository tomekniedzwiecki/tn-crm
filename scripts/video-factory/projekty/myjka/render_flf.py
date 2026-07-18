# -*- coding: utf-8 -*-
"""RENDER (KROK 6): FLF per scena z frames/urls.json + blueprint.
n=2 na scenach fluid (fizyka plynow). Motion prompt + {PHYSICS_FLUID} dla fluid.
negative_extra = forbidden_leaks z KARTY. Zapisuje gen/<tag>.mp4."""
import sys, json, os
sys.path.insert(0, r'C:/tmp/video-factory/tools')
import render

ROOT = r'C:/tmp/video-factory/myjka'
GEN = os.path.join(ROOT, 'gen'); os.makedirs(GEN, exist_ok=True)
K = json.load(open(os.path.join(ROOT, 'KARTA.json'), encoding='utf-8'))
BP = json.load(open(os.path.join(ROOT, 'blueprint.json'), encoding='utf-8'))
U = json.load(open(os.path.join(ROOT, 'frames', 'urls.json'), encoding='utf-8'))
NEG_EXTRA = ", ".join(K['product']['forbidden_leaks'])
PHYS = K['grammar']['physics']
PHYSICS_FLUID = (f"the water flows as real liquid with continuous coherent streams leaving the nozzle "
                 f"front along the lance axis; {PHYS}; it must NOT turn into foam, blobs or clumps; "
                 f"consistent volume, natural gravity")

scenes = []
for s in BP['scenes']:
    sid = s['id']
    motion = s['motion']
    if s.get('fluid'):
        motion = motion + ". " + PHYSICS_FLUID
    sc = {"tag": sid, "engine": "flf",
          "image_url": U[f"{sid}_first"], "tail_image_url": U[f"{sid}_last"],
          "prompt": motion, "negative_extra": NEG_EXTRA}
    if int(s.get('n', 1)) > 1:
        sc["n"] = int(s['n'])
    scenes.append(sc)

print("Rendering", len(scenes), "scenes (n=2 on:",
      [s['tag'] for s in scenes if s.get('n')], ")")
done = render.render_scenes(scenes, GEN, project="myjka")
print(json.dumps({k: os.path.basename(v) for k, v in done.items()}, indent=1))
# zaznacz FAILED
import glob
for f in glob.glob(os.path.join(GEN, '*.failed')):
    print("FAILED:", os.path.basename(f), "->", open(f).read()[:200])

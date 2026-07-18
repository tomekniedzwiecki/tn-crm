"""Render FLF scen glosnika przez rdzen render.py (Kling 2.5 first+last). project=glosnik."""
import os, sys, json
sys.path.insert(0, r"c:\repos_tn\tn-crm\scripts\video-factory")
import fal, render

BASE = r"C:\tmp\video-factory\glosnik"
FR = os.path.join(BASE, "frames")
GEN = os.path.join(BASE, "gen")
os.makedirs(GEN, exist_ok=True)
KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
BP = json.load(open(os.path.join(BASE, "blueprint.json"), encoding="utf-8"))
NEG_EXTRA = ", ".join(KARTA["product"]["forbidden_leaks"])
PHYS = KARTA["grammar"]["physics"]

def up(name):
    return fal.store(os.path.join(FR, name), "glosnik/rn_" + name)

if __name__ == "__main__":
    only = sys.argv[1:] if len(sys.argv) > 1 else None
    scenes = []
    for sc in BP["scenes"]:
        sid = sc["id"]
        if only and sid not in only:
            continue
        img = up(f"{sid}_first.png")
        tail = up(f"{sid}_last.png")
        motion = (f"{sc['motion']}. Physics: {PHYS}. "
                  f"Photorealistic, keep the exact product shape and count, subtle handheld micro-drift, "
                  f"no full 360 rotation, no morphing.")
        scenes.append({"tag": sid, "engine": "flf", "image_url": img, "tail_image_url": tail,
                       "prompt": motion, "negative_extra": NEG_EXTRA})
    print(f"rendering {[s['tag'] for s in scenes]}", flush=True)
    done = render.render_scenes(scenes, GEN, project="glosnik")
    print("DONE:", json.dumps(done), flush=True)
    # raport failed
    for sc in scenes:
        f = os.path.join(GEN, sc["tag"] + ".failed")
        if os.path.exists(f):
            print("FAILED", sc["tag"], open(f).read()[:200], flush=True)

# -*- coding: utf-8 -*-
"""Render FLF v3 (Kling 2.5 first+last) — DOKTRYNA 'produkt statyczny w scenie'.
Sceny nowe: board, reward_a, reward_b, scratch(n=2), proof. hook+cta ZOSTAJA (gen/).
Motion prompt hamuje ruch produktu: 'board perfectly still, camera static, only dog/hand moves'.
ASCII printy. project=drapek."""
import os, sys, json
sys.path.insert(0, r"C:/tmp/video-factory/tools"); import fal, render
fal.set_project('drapek')

BASE = r"C:\tmp\video-factory\drapek"
FR = os.path.join(BASE, "frames"); GEN = os.path.join(BASE, "gen"); os.makedirs(GEN, exist_ok=True)
KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
BP = {s["id"]: s for s in json.load(open(os.path.join(BASE, "blueprint.json"), encoding="utf-8"))["sceny"]}
NEG_EXTRA = ", ".join(KARTA["product"]["forbidden_leaks"])
PHYS = KARTA["grammar"]["physics"]
NEW = ["board", "reward_a", "reward_b", "scratch", "proof"]
STILL = ("The scratch board stays PERFECTLY STILL and rigid, its shape, lid and well do NOT change; "
         "camera is static; no rim or tray edge ever forms; the lid never lifts, tilts or hinges; "
         "keep the exact product shape and count and one corgi with four legs; subtle handheld micro-drift only; "
         "no full 360 rotation, no morphing, bright high-key room.")

def up(name):
    return fal.store(os.path.join(FR, name), "drapek/rn3_" + name)

if __name__ == "__main__":
    only = sys.argv[1:] if len(sys.argv) > 1 else NEW
    scenes = []
    for sid in only:
        sc = BP[sid]
        img = up(f"{sid}_first.png"); tail = up(f"{sid}_last.png")
        motion = f"{sc['motion_prompt_en']} Physics: {PHYS}. {STILL}"
        s = {"tag": sid, "engine": "flf", "image_url": img, "tail_image_url": tail,
             "prompt": motion, "negative_extra": NEG_EXTRA}
        if sc.get("n"): s["n"] = sc["n"]
        scenes.append(s)
    print("rendering", [s["tag"] for s in scenes], flush=True)
    done = render.render_scenes(scenes, GEN, project="drapek")
    print("DONE:", json.dumps(done), flush=True)
    for sc in scenes:
        for suf in ("", "__c1", "__c2"):
            f = os.path.join(GEN, sc["tag"] + suf + ".failed")
            if os.path.exists(f): print("FAILED", sc["tag"]+suf, open(f).read()[:200], flush=True)

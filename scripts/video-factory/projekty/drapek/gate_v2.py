# -*- coding: utf-8 -*-
"""Driver bramek v2 drapek. KROK 7 (qa_gate siatki) + KROK 7.5 (product_gate sbs + identity board).
Generuje artefakty do przegladu VLM (operator oglada, potem wpisuje werdykty osobnym krokiem).
Uzycie:
  python gate_v2.py grids           -> siatki qa dla wszystkich klipow
  python gate_v2.py sbs             -> kompozyty side-by-side per scena (packshot|klatka) + cropy
  python gate_v2.py board           -> identity board (2 packshoty + crop kazdej sceny)
  python gate_v2.py floor           -> size_floor per scena demo
"""
import os, sys, subprocess, glob, json
sys.path.insert(0, r"C:/tmp/video-factory/tools")
import qa_gate, product_gate

BASE = r"C:\tmp\video-factory\drapek"
GEN = os.path.join(BASE, "gen"); QA = os.path.join(BASE, "qa"); os.makedirs(QA, exist_ok=True)
REFS = os.path.join(BASE, "refs")
SBS = os.path.join(QA, "sbs"); os.makedirs(SBS, exist_ok=True)

# packshot wg KONTRAKTOWEGO stanu sceny (0i): board=zamkniety, reszta=otwarty
PACK = {
    "board": os.path.join(REFS, "prod-closed.png"),
    "reward": os.path.join(REFS, "prod-open.png"),
    "scratch": os.path.join(REFS, "prod-open.png"),
    "proof": os.path.join(REFS, "prod-open.png"),
    "cta": os.path.join(REFS, "prod-open.png"),
}
# sceny do bramkowania (hook = klip v1, gate osobno; scratch przez best-of-N kandydatow)
CLIPS_MAIN = ["board", "reward", "proof", "cta"]
SCRATCH_CANDS = ["scratch__c1", "scratch__c2"]

def _frames(clip, n=3):
    """Wyciaga n klatek rownomiernie (first ~10%, mid 50%, last ~90%)."""
    dur = float(subprocess.check_output(["ffprobe","-v","quiet","-show_entries","format=duration",
                                         "-of","csv=p=0", clip]).decode().strip())
    base = os.path.splitext(os.path.basename(clip))[0]
    outs = []
    poss = [0.12, 0.5, 0.88] if n == 3 else [i/(n-1)*0.9+0.05 for i in range(n)]
    for i, fr in enumerate(poss):
        t = round(dur*fr, 2)
        out = os.path.join(QA, f"fr_{base}_{i}.png")
        subprocess.run(["ffmpeg","-v","error","-ss",str(t),"-i",clip,"-frames:v","1","-y",out], check=True)
        outs.append(out)
    return outs

if __name__ == "__main__":
    cmd = sys.argv[1]
    allclips = CLIPS_MAIN + SCRATCH_CANDS
    if cmd == "grids":
        for c in allclips:
            mp4 = os.path.join(GEN, c + ".mp4")
            if not os.path.exists(mp4): print("MISSING", mp4); continue
            gs = qa_gate.make_grids(mp4, QA)
            print("GRIDS", c, [os.path.basename(g) for g in gs])
    elif cmd == "sbs":
        # sceny z produktem: board/reward/scratch(wybrany)/proof/cta — 3 klatki/scena
        for c in CLIPS_MAIN + ["scratch"]:
            scene = c.split("__")[0]
            mp4 = os.path.join(GEN, c + ".mp4")
            if not os.path.exists(mp4): print("MISSING", mp4); continue
            frs = _frames(mp4, 3)
            for i, f in enumerate(frs):
                out = os.path.join(SBS, f"sbs_{c}_{i}.jpg")
                product_gate.sbs(PACK[scene], f, out, crop=(0.0, 0.42, 1.0, 1.0))
                print("SBS", os.path.basename(out))
    elif cmd == "board":
        # identity board: 2 packshoty + crop produktu (mid frame) z kazdej sceny (6, w tym hook)
        crops = []
        for c in ["hook", "board", "reward", "scratch", "proof", "cta"]:
            mp4 = os.path.join(GEN, c + ".mp4")
            if not os.path.exists(mp4): print("MISSING", mp4); continue
            mid = _frames(mp4, 3)[1]
            cp = os.path.join(QA, f"crop_{c}.png")
            product_gate.crop_product(mid, cp, crop=(0.0, 0.5, 1.0, 1.0))
            crops.append((c.split("__")[0], cp))
        out = os.path.join(QA, "identity_board.jpg")
        product_gate.identity_board([os.path.join(REFS,"prod-closed.png"), os.path.join(REFS,"prod-open.png")],
                                    crops, out)
        print("BOARD", out)
    elif cmd == "floor":
        for c in CLIPS_MAIN + ["scratch__c1"]:
            mp4 = os.path.join(GEN, c + ".mp4")
            if not os.path.exists(mp4): continue
            frs = _frames(mp4, 3)
            for i, f in enumerate(frs):
                pct, ok = product_gate.size_floor(f, min_pct=8)
                print(f"FLOOR {c} fr{i}: {pct}% ok={ok}")

# -*- coding: utf-8 -*-
"""BRAMKI masazer (KROK 7 + 7.5). Buduje:
 - gestą siatkę 4 fps CALEJ sceny per klip (product_gate 0i: morfy zyja MIEDZY klatkami kluczowymi)
 - cv_precheck (cv_reliable=false -> [] -> licznik VLM)
 - kompozyty side-by-side packshot|klatka (first/mid/last)
 - identity board (2 kotwice + crop produktu z kazdej sceny)
Uruchamiaj: python qa_run.py
Werdykty wpisuje osobny krok (po przegladzie agenta). ASCII printy."""
import os, sys, subprocess, glob, json
sys.path.insert(0, r"C:/tmp/video-factory/tools"); import qa_gate, product_gate
BASE = r"C:\tmp\video-factory\masazer"; GEN = os.path.join(BASE, "gen"); REFS = os.path.join(BASE, "refs")
QA = os.path.join(BASE, "qa"); os.makedirs(QA, exist_ok=True)
os.makedirs(os.path.join(QA, "motion"), exist_ok=True)
os.makedirs(os.path.join(QA, "sbs"), exist_ok=True)
SCENES = ["hook", "worn", "heads", "relief", "cta"]
# packshot dobrany do KATA sceny (kontrakt): hook/relief/cta = worn-front (g0_worn), worn = worn-back (g2_left), heads = 3/4 (g0_float)
PACK = {"hook": "g0_worn.jpg", "worn": "g2_left.jpg", "heads": "g0_float.jpg", "relief": "g0_worn.jpg", "cta": "g0_worn.jpg"}

def dense_grid(clip, out, fps=4, cols=5):
    """Siatka 4 fps CALEJ sceny (KROK 7.5 gesta w ruchu)."""
    fdir = out + "_f"; os.makedirs(fdir, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-i", clip, "-vf", f"fps={fps},scale=300:-1",
                    "-y", os.path.join(fdir, "f%03d.jpg")], check=True)
    frames = sorted(glob.glob(os.path.join(fdir, "f*.jpg")))
    n = len(frames); rows = (n + cols - 1) // cols
    subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(fdir, "f%03d.jpg"),
                    "-frames:v", "1", "-vf", f"tile={cols}x{rows}", "-y", out], check=True)
    return out, n

def mid_frames(clip, prefix):
    """first/mid/last jpg do side-by-side."""
    d = float(subprocess.check_output(['ffprobe','-v','quiet','-show_entries','format=duration','-of','csv=p=0',clip]).decode().strip())
    outs = []
    for lbl, t in [("first", 0.1), ("mid", d/2), ("last", max(0.0, d-0.15))]:
        o = os.path.join(QA, f"{prefix}_{lbl}.jpg")
        subprocess.run(["ffmpeg","-v","error","-ss",f"{t:.2f}","-i",clip,"-frames:v","1","-y",o], check=True)
        outs.append((lbl, o))
    return outs

if __name__ == "__main__":
    board_crops = []
    for sid in SCENES:
        clip = os.path.join(GEN, sid + ".mp4")
        if not os.path.exists(clip):
            print("MISSING", sid); continue
        dg, n = dense_grid(clip, os.path.join(QA, "motion", f"{sid}_dense.jpg"))
        flags = qa_gate.cv_precheck(clip, os.path.join(BASE, "KARTA.json"))
        print(f"{sid}: dense {n} klatek -> {dg} | cv_precheck flags={flags}")
        mf = mid_frames(clip, sid)
        pack = os.path.join(REFS, PACK[sid])
        for lbl, fr in mf:
            o = os.path.join(QA, "sbs", f"{sid}_{lbl}_sbs.jpg")
            product_gate.sbs(pack, fr, o, crop=(0.0, 0.25, 1.0, 1.0))
        # crop produktu (srodkowa klatka) do identity board
        midfr = mf[1][1]
        bc = os.path.join(QA, f"{sid}_crop.jpg")
        product_gate.crop_product(midfr, bc, crop=(0.0, 0.2, 1.0, 1.0))
        board_crops.append((sid, bc))
    # identity board: 2 kotwice (g0_float, g0_worn) + cropy scen
    ib = product_gate.identity_board(
        [os.path.join(REFS, "g0_float.jpg"), os.path.join(REFS, "g0_worn.jpg")],
        board_crops, os.path.join(QA, "identity_board.jpg"))
    print("IDENTITY BOARD ->", ib)
    print("QA RUN DONE")

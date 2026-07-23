# -*- coding: utf-8 -*-
"""F3 REGEN — mid-cta i final: tekst leży NA scenie => regeneracja czystej sceny.
Ref (image[0]) = ZAAKCEPTOWANA makieta tej sekcji (baza edits; produkt już w niej wierny).
Prompt = czysto scenowy (prompt-lint PASS, prefiks referencji). Silnik = lokalny OpenAI gpt-image-2 HIGH.
Uruchom: PYTHONIOENCODING=utf-8 python _regen.py [midcta|final]"""
import os, io, sys, importlib.util
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
MAK  = os.path.normpath(os.path.join(HERE, "..", "makiety"))
spec = importlib.util.spec_from_file_location("gen", os.path.join(MAK, "_gen.py"))
gen  = importlib.util.module_from_spec(spec); spec.loader.exec_module(gen)
from PIL import Image

JOBS = {
    "midcta": ("09-mid-cta.png", "p-midcta.txt", "sc-midcta.png"),
    "final":  ("16-final.png",   "p-final.txt",  "sc-final.png"),
}
SIZE = "1536x1024"   # ten sam aspekt 3:2 co makieta

def run(key):
    mak, pf, out = JOBS[key]
    prompt = io.open(os.path.join(HERE, pf), encoding="utf-8").read().strip()
    ref = os.path.join(MAK, mak)
    blob = gen.gen_edits(prompt, SIZE, [ref])
    im = Image.open(io.BytesIO(blob)).convert("RGB")
    im.save(os.path.join(HERE, out))
    print("OK %s -> %s %s" % (key, out, im.size))

if __name__ == "__main__":
    keys = sys.argv[1:] or ["midcta", "final"]
    for k in keys:
        run(k)

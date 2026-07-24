# -*- coding: utf-8 -*-
"""Batch generator NAKRĘCIK. Reads jobs.json list of {out, size, prompt_file, refs:[...], dir}.
Runs sequentially with retry, writes each output, prints progress to stdout AND a .done marker.
Usage: python _batch.py jobs1.json [jobs2.json ...]"""
import importlib.util, io, os, sys, time, json
from PIL import Image
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
FAB = os.path.normpath(os.path.join(HERE, ".."))
spec = importlib.util.spec_from_file_location("gen", os.path.join(HERE, "_gen.py"))
gen = importlib.util.module_from_spec(spec); spec.loader.exec_module(gen)

def run_job(j):
    out = j["out"]; size = j.get("size", "1536x1024")
    prompt = io.open(os.path.join(FAB, j["prompt_file"]), encoding="utf-8").read().strip()
    refs = [os.path.join(FAB, r) for r in j.get("refs", [])]
    outdir = os.path.join(FAB, j.get("dir", "makiety"))
    os.makedirs(outdir, exist_ok=True)
    outp = os.path.join(outdir, out)
    if os.path.exists(outp) and j.get("skip_existing", True):
        print("SKIP (exists)", out, flush=True); return
    last = None
    for att in range(1, 7):
        try:
            print(f"[{att}/6] {out} ({'edits' if refs else 'gen'}) ...", flush=True)
            blob = gen.gen_edits(prompt, size, refs) if refs else gen.gen_generations(prompt, size)
            im = Image.open(io.BytesIO(blob)).convert("RGB")
            im.save(outp)
            print("OK", out, im.size, "->", outp, flush=True)
            return
        except Exception as e:
            last = e; code = getattr(e, "code", None)
            print("  err", str(e)[:140], "code", code, flush=True)
            if att < 6: time.sleep(6 * att)
    print("FAIL", out, str(last)[:160], flush=True)

def main():
    files = sys.argv[1:]
    jobs = []
    for f in files:
        jobs += json.load(io.open(os.path.join(FAB, f), encoding="utf-8"))
    print(f"BATCH START: {len(jobs)} jobs", flush=True)
    for j in jobs:
        run_job(j)
    print("BATCH DONE", flush=True)

if __name__ == "__main__":
    main()

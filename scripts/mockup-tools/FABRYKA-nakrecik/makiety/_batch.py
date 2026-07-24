# -*- coding: utf-8 -*-
"""Batch generator makiet ZAKLIPEK (F2) — ThreadPool (max 4) na LOKALNYM OpenAI gpt-image-2 HIGH.
Uzycie: python _batch.py <name1> <name2> ...   |   python _batch.py all
Czyta _index.json (name,size,ref). ref=='prod' -> /edits z _product-ref.png ; inaczej /generations.
Retry na blipach. Zapis makiety/<name>.png."""
import os, io, sys, json, time, base64
from concurrent.futures import ThreadPoolExecutor, as_completed
import importlib.util
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("gen", os.path.join(HERE, "_gen.py"))
gen = importlib.util.module_from_spec(spec); spec.loader.exec_module(gen)
from PIL import Image

IDX = {it["name"]: it for it in json.load(io.open(os.path.join(HERE, "_index.json"), encoding="utf-8"))}
REF = os.path.join(HERE, "_product-ref.png")

def one(name):
    it = IDX[name]
    size = it["size"]; prompt = io.open(os.path.join(HERE, "p-%s.txt" % name), encoding="utf-8").read()
    refs = [REF] if it["ref"] == "prod" else []
    last = None
    for attempt in range(1, 5):
        try:
            blob = gen.gen_edits(prompt, size, refs) if refs else gen.gen_generations(prompt, size)
            im = Image.open(io.BytesIO(blob)).convert("RGB")
            im.save(os.path.join(HERE, "%s.png" % name))
            return (name, "OK", "%s %s" % ("edits" if refs else "gen", im.size))
        except Exception as e:
            last = e; code = getattr(e, "code", None)
            transient = code in (429, 500, 502, 503, 504, 520, 522, 524) or code is None
            if attempt < 4 and transient:
                time.sleep(6 * attempt); continue
            break
    return (name, "FAIL", str(last)[:200])

def main():
    names = list(IDX) if (len(sys.argv) > 1 and sys.argv[1] == "all") else sys.argv[1:]
    print("generuje %d: %s" % (len(names), ", ".join(names)))
    results = {}
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {ex.submit(one, n): n for n in names}
        for f in as_completed(futs):
            name, status, info = f.result()
            results[name] = (status, info)
            print("  [%s] %s — %s" % (status, name, info))
    ok = sum(1 for s, _ in results.values() if s == "OK")
    print("GOTOWE %d/%d OK" % (ok, len(names)))
    fails = [n for n, (s, _) in results.items() if s != "OK"]
    if fails: print("FAILY:", ", ".join(fails))

if __name__ == "__main__":
    main()

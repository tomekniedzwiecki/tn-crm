# -*- coding: utf-8 -*-
"""Wyciaga check:[...] VERBATIM z obiektu WS w tn-sklepy/projekt.html dla podanych krokow.
Zapisuje do checklists.json (klucz=step). Gwarantuje dokladny tekst (dedup w panelu)."""
import io, re, json, sys
sys.stdout.reconfigure(encoding="utf-8")
SRC = r"c:/repos_tn/tn-crm/tn-sklepy/projekt.html"
txt = io.open(SRC, encoding="utf-8").read()
STEPS = ["lp_dane", "lp_plan", "lp_styl_marka", "lp_makiety"]

def strings_in(arr_body):
    # tokeny w pojedynczych cudzyslowach, z obsluga \'
    out = []
    for m in re.finditer(r"'((?:[^'\\]|\\.)*)'", arr_body):
        s = m.group(1).replace("\\'", "'").replace('\\"', '"').replace("\\\\", "\\")
        out.append(s)
    return out

res = {}
for step in STEPS:
    # znajdz poczatek definicji kroku: "            <step>: {"
    m = re.search(r"\b" + re.escape(step) + r"\s*:\s*\{", txt)
    if not m:
        print("BRAK", step); continue
    tail = txt[m.end(): m.end() + 6000]
    cs = re.search(r"check\s*:\s*\[", tail)
    if not cs:
        print("BRAK check dla", step); continue
    # skanuj do zamykajacego ] na poziomie 0 (ignoruj ] wewnatrz '...')
    i = cs.end(); in_str = False; esc = False; body = []
    while i < len(tail):
        c = tail[i]
        if in_str:
            if esc: esc = False
            elif c == "\\": esc = True
            elif c == "'": in_str = False
            body.append(c)
        else:
            if c == "'": in_str = True; body.append(c)
            elif c == "]": break
            else: body.append(c)
        i += 1
    res[step] = strings_in("".join(body))
    print(step, "->", len(res[step]), "pozycji")

io.open(r"c:/repos_tn/tn-crm/scripts/mockup-tools/FABRYKA-wiezyk/checklists.json", "w",
        encoding="utf-8").write(json.dumps(res, ensure_ascii=False, indent=1))
print("OK checklists.json")
for step in STEPS:
    for i, t in enumerate(res.get(step, [])):
        print("  [%s %d] %r" % (step, i, t))

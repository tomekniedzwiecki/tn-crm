"""PRODUCT-FIDELITY GATE (SSOT 0i). RDZEN. Warstwa wiernosci produktu — feedback Tomka 19.07:
"tylko jedna scena pokazuje jak dziala produkt" — bramka per-klip przepuszczala morf KONSTRUKCJI
elementu miedzy scenami (functional_count slepy na ksztalt; ocena pamieciowa, nie side-by-side).

Mechanika (KROK 7.5, PO qa_gate per-klip, PRZED montazem):
 1. sbs()            — kompozyt side-by-side: PACKSHOT (prawda) | NASZA klatka → ocena VLM 1:1,
                       nie z pamieci. 3-4 kompozyty/scena (first/mid/last + apogeum mechanizmu).
 2. identity_board() — JEDEN rzad: 2 packshoty-kotwice + crop produktu z KAZDEJ sceny →
                       VLM wiersz-na-kafelek: "ten sam przedmiot (konstrukcja/pozycja/proporcje)?"
                       To lapie morf miedzy scenami, ktorego zadna bramka per-klip nie widzi.
 3. Rubryka per-ELEMENT (KARTA.product.elements[]): wiersz-na-element x klatka, ZAKAZ oceny
    zbiorczej "anatomia ok". Werdykt sceny = min po elementach (1 REJECT-element = REJECT sceny).
 4. Kontrakt uzycia (blueprint.sceny[].kontrakt_produktowy): required stan mechanizmu,
    must_show[] / must_not_show[], mechanizm W DZIALANIU (nie "obok").
 5. save_fidelity()  → <klip>.fidelity.json; finalize() → gen/fidelity.pass TYLKO gdy wszystkie
    sceny PASS + identity CONSISTENT. montaz.py z require_fidelity=True ODMOWI bez markera.

PASS wymaga: wszystkie elementy WIERNE (ksztalt+kolor+KONSTRUKCJA+pozycja == packshot)
+ kontrakt spelniony + identity spojny. "Ladne, ale pokrywa to ramka" = REJECT, nie MINOR.
Deterministyka przy cv_reliable:false = TYLKO floor (produkt za maly <8% kadru) i przeslanki —
decyzje wiernosci podejmuje VLM na kompozytach (lekcja: czern deski == czern siodla psa).
Petla naprawcza: <=2 regeneracje/kreacje w budzecie +20%; 3. porazka = eskalacja (re-warunkowanie
prewencji wg listy defektow), NIE loop-burn.

Uzycie:
  python product_gate.py sbs <packshot> <klatka> <out.jpg> [crop_top=0.55]
  python product_gate.py board <out.jpg> <packshot1> <packshot2> <crop1> <crop2> ...
  python product_gate.py finalize <gen_dir>     # sprawdza komplet fidelity.json → fidelity.pass
"""
import os, sys, json, glob


def sbs(packshot, frame, out, crop=(0.0, 0.55, 1.0, 1.0), h=720,
        labels=("PACKSHOT (prawda)", "NASZA")):
    """Kompozyt side-by-side. crop = (x0,y0,x1,y1) wzgledny — domyslnie dolne 45% kadru
    (deska/produkt lezy nisko; celowo BEZ maski HSV — cv_reliable:false)."""
    from PIL import Image, ImageDraw
    f = Image.open(frame).convert("RGB"); W, H = f.size
    fc = f.crop((int(crop[0]*W), int(crop[1]*H), int(crop[2]*W), int(crop[3]*H)))
    p = Image.open(packshot).convert("RGB")
    fit = lambda im: im.resize((max(1, int(im.width * h / im.height)), h))
    p, fc = fit(p), fit(fc)
    cv = Image.new("RGB", (p.width + fc.width + 30, h + 40), "white")
    cv.paste(p, (0, 40)); cv.paste(fc, (p.width + 30, 40))
    d = ImageDraw.Draw(cv)
    d.text((6, 10), labels[0], fill="black"); d.text((p.width + 36, 10), labels[1], fill="black")
    cv.save(out, quality=90)
    return out


def identity_board(packshots, scene_crops, out, h=380):
    """Rzad kafelkow: kotwice-packshoty + crop produktu z kazdej sceny.
    scene_crops = [(label, path), ...]."""
    from PIL import Image, ImageDraw
    tiles = [("PACKSHOT-zam.", packshots[0])] + \
            ([("PACKSHOT-otw.", packshots[1])] if len(packshots) > 1 else []) + list(scene_crops)
    ims = []
    for lbl, p in tiles:
        im = Image.open(p).convert("RGB")
        ims.append((lbl, im.resize((max(1, int(im.width * h / im.height)), h))))
    W = sum(im.width for _, im in ims) + 10 * len(ims)
    cv = Image.new("RGB", (W, h + 34), "white")
    d = ImageDraw.Draw(cv); x = 0
    for lbl, im in ims:
        cv.paste(im, (x, 34)); d.text((x + 4, 10), lbl, fill="black"); x += im.width + 10
    cv.save(out, quality=90)
    return out


def crop_product(frame, out, crop=(0.0, 0.5, 1.0, 1.0)):
    """Crop strefy produktu z klatki (do identity_board)."""
    from PIL import Image
    f = Image.open(frame).convert("RGB"); W, H = f.size
    f.crop((int(crop[0]*W), int(crop[1]*H), int(crop[2]*W), int(crop[3]*H))).save(out, quality=90)
    return out


def size_floor(frame, min_pct=8, v_max=60, bottom=0.45):
    """Deterministyczny FLOOR: najwiekszy ciemny region w dolnej czesci kadru jako % kadru.
    Sygnal JEDNOSTRONNY (flaguje 'za maly', NIGDY nie potwierdza ksztaltu — czern psa scala
    sie z czernia produktu). Zwraca (pct, ok)."""
    import cv2, numpy as np
    img = cv2.imread(frame); H = img.shape[0]
    roi = img[int(H * (1 - bottom)):, :]
    mask = (cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)[:, :, 2] < v_max).astype("uint8") * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((9, 9), "uint8"))
    n, _, stats, _ = cv2.connectedComponentsWithStats(mask)
    big = max((stats[i][4] for i in range(1, n)), default=0)
    pct = 100.0 * big / (img.shape[0] * img.shape[1])
    return round(pct, 1), pct >= min_pct


def save_fidelity(clip, verdict, elements=None, demo_contract=None, reject_reasons=None,
                  fidelity_score=None, composites=None):
    """verdict: 'PASS'|'REJECT'. Zapis <klip>.fidelity.json (wiersz-na-element w elements[])."""
    base = os.path.splitext(clip)[0]
    json.dump({"clip": os.path.basename(clip), "verdict": verdict,
               "fidelity_score": fidelity_score, "elements": elements or [],
               "demo_contract": demo_contract, "reject_reasons": reject_reasons or [],
               "composites": composites or []},
              open(base + ".fidelity.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def finalize(gen_dir, board_verdict=None):
    """fidelity.pass TYLKO gdy: kazdy klip scen (kazdy *.pass z qa_gate) ma fidelity.json PASS
    ORAZ identity board CONSISTENT (board_verdict={'consistent':bool,...} zapisany obok).
    Zwraca (ok, brakujace/rejecty)."""
    problems = []
    for passf in glob.glob(os.path.join(gen_dir, "*.pass")):
        base = passf[:-5]
        if os.path.basename(base) == "fidelity":   # wlasny marker, nie klip
            continue
        fj = base + ".fidelity.json"
        if not os.path.exists(fj):
            problems.append(os.path.basename(base) + ": BRAK fidelity.json"); continue
        v = json.load(open(fj, encoding="utf-8"))
        if v.get("verdict") != "PASS":
            problems.append(os.path.basename(base) + ": fidelity " + str(v.get("verdict")))
    if board_verdict is not None:
        json.dump(board_verdict, open(os.path.join(gen_dir, "fidelity_board.json"), "w",
                                      encoding="utf-8"), ensure_ascii=False, indent=1)
    bj = os.path.join(gen_dir, "fidelity_board.json")
    if not os.path.exists(bj):
        problems.append("BRAK fidelity_board.json (identity board nieoceniony)")
    elif not json.load(open(bj, encoding="utf-8")).get("consistent"):
        problems.append("identity board: NIESPOJNY (morf miedzy scenami)")
    marker = os.path.join(gen_dir, "fidelity.pass")
    if problems:
        if os.path.exists(marker):
            os.remove(marker)
        return False, problems
    open(marker, "w").write("ok")
    return True, []


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "sbs":
        top = float(sys.argv[5]) if len(sys.argv) > 5 else 0.55
        print(sbs(sys.argv[2], sys.argv[3], sys.argv[4], crop=(0.0, top, 1.0, 1.0)))
    elif cmd == "board":
        out, p1, p2 = sys.argv[2], sys.argv[3], sys.argv[4]
        crops = [(os.path.basename(c).split(".")[0], c) for c in sys.argv[5:]]
        print(identity_board([p1, p2], crops, out))
    elif cmd == "finalize":
        ok, probs = finalize(sys.argv[2])
        print("PASS" if ok else "FAIL:")
        for p in probs:
            print(" -", p)
        sys.exit(0 if ok else 1)

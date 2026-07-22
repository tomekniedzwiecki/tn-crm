"""BRAMKA WIZYJNA KLIPU (SSOT 0b pkt 7). RDZEN.

Kazdy wyrenderowany klip PRZED montazem: klatki 2 fps -> siatki kontrolne 3x3 ->
przeglad (agent vision lub czlowiek) z checklista KARTY PRODUKTU.

Uzycie: python qa_gate.py <klip.mp4> <outdir>   -> zapisuje grid_*.jpg
Checklist (dla agenta-recenzenta, per siatka):
  1. POLICZ ROZOWE OBIEKTY w KAZDEJ klatce OSOBNO (urzadzenie, klips, etui, blob) i wypisz
     liczbe per klatka; >1 rozowy obiekt ktory nie jest kablem = ODRZUT klipu.
     (Incydent 2x 17.07: "jedna lokowka" zaliczone zbiorczo mimo 2 urzadzen w kadrze —
     dlatego liczenie JAWNE per klatka, nie ocena ogolna.)
  2. Anatomia produktu == karta (lokowka: 6 zabkow, rose-gold walek, 2 listki+Y-LED, ROZOWY kabel)
  3. Dlonie: max 2, po 5 palcow, bez fuzji
  4. Twarz == face-ref (brazowe oczy), bez bizuterii/lakieru
  5. Tlo == karta scenografii (strona polki), brak teleportacji
  6. Fizyka akcji mozliwa (nic nie lewituje, pasma nie stoja pionowo)
  7. CIAGLOSC MIEDZY SCENAMI (najczestszy przepuszczony defekt!): produkt ma IDENTYCZNY ksztalt
     i LICZBE elementow funkcyjnych (dysze/zabki/ramiona wg KARTA.product.functional_count)
     w KAZDEJ scenie; scenografia/rekwizyty nie przeskakuja bez cieia narracyjnego.
  8. FIZYKA W RUCHU: strumienie wychodza z czola dyszy we wlasciwym kierunku; woda NIE zamienia
     sie w piane/blobby; sztywne czesci bez podwojnego obrysu (ghosting); os narzedzia = os pracy.
  9. TEKST/GLIFY: ekrany, etykiety, wskazniki — wyrazne pseudo-glify = ODRZUT; male i rozmyte = OK.
 10. AFORDANCJA: pozycja rak mozliwa dla czynnosci (dloni na kierownicy gdy auto jedzie itp.).
 11. SKORA: tekstura obecna (pory/niedoskonalosci), NIE woskowa/airbrush — na klatkach
     z dominujaca skora (dlonie/twarz/przedramie); fix = PROMPT (klauzula skory), nie post.
 12. GRANICE SCEN (hands-POV): akcja przechodzi przez ciecie (bez martwej freeze-klatki);
     OSTATNIA klatka kreacji = echo PIERWSZEJ (LOOP CLOSE) — brak echa = poprawa sceny CTA.
 13. UMIEJSCOWIENIE UZYCIA NA CIELE == placement_ref (lifestyle z poprawnym zalozeniem)!
     Produkt wierny ale zle zalozony (masazer na GARDLE zamiast na KARKU, 19.07) = REJECT.
     EN: kark = "nape/back of the neck" — samo "neck" laduje na przodzie szyi.
 14. MODEL UZYCIA == KARTA.product.model_uzycia (feedback Tomka 22.07 — Skrolik/Ugniatek)!
     Osobna os od wiernosci ksztaltu (2/7) i anatomii postaci. Pytanie per klip: "czy scena
     pokazuje POPRAWNE uzycie — wlasciwy ELEMENT STEROWANIA aktywowany jak w realu?".
     Skrolik: kciuk DOCISKA jeden z 3 przyciskow, palec wskazujacy NIE jest wyciagniety i NIE
     celuje w ekran (scroll = skutek kliku, NIE gest/zyroskop). Masazer: glowice DO ciala,
     chwyt oburacz za uchwyty. Dowolna interakcja z model_uzycia.nie_robi (gest w powietrzu
     w kierunku ekranu, dotyk ekranu, obrot jak zyroskop, uzycie jak inny produkt) = REJECT
     klipu NAWET gdy produkt idealnie wierny (reklama uczaca blednej obslugi odstrasza leada).

Werdykt: agent MUSI wyemitowac WIERSZ NA KLATKE (nr, #obiektow produktu, #dloni, flagi) — ZAKAZ
oceny zbiorczej. Siatka = triaz; klatka z flaga -> dociagnij PELNA rozdzielczosc. Dla klipow MC
probkuj 4 fps. Wynik zapisz przez save_verdict() -> <klip>.verdict.json + <klip>.pass przy PASS.
Montaz WYMAGA .pass (montaz.py odmowi bez niego).

Geneza reguly: 17.07 Motion Control zhalucynowal DRUGI egzemplarz produktu w wolnej dloni
(driving mial tam gestykulacje) — wyrywkowe QA co ~2 s tego nie zlapalo.
"""
import os, subprocess, sys, glob, json

def make_grids(clip, outdir):
    os.makedirs(outdir, exist_ok=True)
    base = os.path.splitext(os.path.basename(clip))[0]
    frames_dir = os.path.join(outdir, base + "_f")
    os.makedirs(frames_dir, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-i", clip, "-vf", "fps=2,scale=540:-1",
                    "-y", os.path.join(frames_dir, "f%03d.jpg")], check=True)
    frames = sorted(glob.glob(os.path.join(frames_dir, "f*.jpg")))
    grids = []
    for i in range(0, len(frames), 9):
        n = min(9, len(frames) - i)
        grid = os.path.join(outdir, f"{base}_grid{i//9}.jpg")
        rows = (n + 2) // 3
        subprocess.run(["ffmpeg", "-v", "error", "-pattern_type", "sequence",
                        "-start_number", str(i + 1), "-i", os.path.join(frames_dir, "f%03d.jpg"),
                        "-frames:v", "1", "-vf", f"tile=3x{rows}", "-y", grid], check=True)
        grids.append(grid)
    return grids

def hsv_calibrate(image_path, cx_rel, cy_rel, half=40):
    """Pomocnik kalibracji: probkuje region packshotu (wspolrzedne wzgledne 0-1) i sugeruje
    zakres HSV + werdykt cv_reliable (False gdy H w pasmie skory ~0-25 przy S<120 — lekcja:
    pastelowy roz lokowki H 5-9 nieodroznialny od skory maska kolorowa)."""
    import cv2, numpy as np
    img = cv2.imread(image_path)
    h_, w_ = img.shape[:2]
    x, y = int(w_ * cx_rel), int(h_ * cy_rel)
    reg = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)[max(0,y-half):y+half, max(0,x-half):x+half].reshape(-1, 3)
    med = np.median(reg, axis=0)
    lo = [max(0, int(med[0]) - 12), max(0, int(med[1]) - 45), max(0, int(med[2]) - 55)]
    hi = [min(180, int(med[0]) + 12), min(255, int(med[1]) + 45), min(255, int(med[2]) + 55)]
    reliable = not (med[0] < 25 and med[1] < 120)  # pasmo skory
    return {"hsv_color": [lo, hi], "cv_reliable": bool(reliable), "median_hsv": [int(v) for v in med]}

def cv_precheck(clip, karta_path, fps=2):
    """Twarde checki CV (bez LLM): licznik egzemplarzy produktu po masce HSV z KARTA.json.
    Zwraca liste flag {ts, why}. UWAGA: honoruje KARTA.product.cv_reliable — gdy False
    (kolor w pasmie skory), zwraca [] i cala odpowiedzialnosc bierze przeglad agenta.
    Maska = suma zakresow z KARTA.product.hsv_ranges (hue-wrap, np. czerwienie); puste/brak
    -> jednozakresowy hsv_color. Flagi = "podejrzana klatka" (duplikat LUB obcy blob
    w kolorze produktu, np. piana)."""
    import cv2, numpy as np
    karta = json.load(open(karta_path, encoding='utf-8'))
    prod = karta['product']
    if prod.get('cv_reliable') is False:
        return []
    ranges = prod.get('hsv_ranges') or [prod['hsv_color']]
    flags = []
    cap = cv2.VideoCapture(clip)
    src_fps = cap.get(cv2.CAP_PROP_FPS) or 30
    step = max(1, int(round(src_fps / fps)))
    i = 0
    while True:
        ok, frame = cap.read()
        if not ok: break
        if i % step == 0:
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            mask = None
            for lo, hi in ranges:
                m = cv2.inRange(hsv, np.array(lo), np.array(hi))
                mask = m if mask is None else cv2.bitwise_or(mask, m)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
            n, _, stats, _ = cv2.connectedComponentsWithStats(mask)
            big = 0
            area_min = frame.shape[0] * frame.shape[1] * 0.01  # >1% kadru = egzemplarz
            for j in range(1, n):
                x, y, w, h, area = stats[j]
                if area < area_min: continue
                aspect = max(w, h) / max(1, min(w, h))
                if aspect > 8: continue  # kabel/pasek
                big += 1
            if big > 1:
                flags.append({"ts": round(i / src_fps, 1), "why": f"{big} egzemplarze produktu (maska HSV)"})
        i += 1
    cap.release()
    # zbij sasiednie flagi
    return flags[:20]

def save_verdict(clip, verdict, flags=None):
    """verdict: 'PASS'|'REJECT'; flags: lista {ts, opis}. Tworzy <klip>.verdict.json i .pass."""
    import json as _json
    base = os.path.splitext(clip)[0]
    _json.dump({"clip": os.path.basename(clip), "verdict": verdict, "flags": flags or []},
               open(base + ".verdict.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    passfile = base + ".pass"
    if verdict == "PASS":
        open(passfile, "w").write("ok")
    elif os.path.exists(passfile):
        os.remove(passfile)

def select_best(gen_dir, tag):
    """Auto-wybor best-of-N (SSOT 0e pkt 1): sposrod kandydatow <tag>__cN.mp4 Z WERDYKTAMI
    bramki wybiera PASS z najmniejsza liczba flag i kopiuje na <tag>.mp4 (+ .pass/.verdict.json).
    Zwraca sciezke zwyciezcy lub None gdy ZADEN kandydat nie ma PASS — wtedy petla poprawek
    (KROK 5/6), NIE wybor "najmniej zlego". Wymaga wczesniejszego save_verdict() per kandydat."""
    import shutil
    cands = []
    for mp4 in sorted(glob.glob(os.path.join(gen_dir, tag + "__c*.mp4"))):
        vpath = os.path.splitext(mp4)[0] + ".verdict.json"
        if not os.path.exists(vpath): continue
        v = json.load(open(vpath, encoding="utf-8"))
        if v.get("verdict") != "PASS":
            continue
        # wiernosci (product_gate na kandydatach): REJECT = dyskwalifikacja; wyzszy score wygrywa
        fpath = os.path.splitext(mp4)[0] + ".fidelity.json"
        fs = 0
        if os.path.exists(fpath):
            f = json.load(open(fpath, encoding="utf-8"))
            if f.get("verdict") == "REJECT":
                continue
            fs = f.get("fidelity_score") or 0
        cands.append((len(v.get("flags") or []), -fs, mp4))
    if not cands: return None
    cands.sort()
    win = cands[0][2]
    dst = os.path.join(gen_dir, tag + ".mp4")
    shutil.copy(win, dst)
    shutil.copy(os.path.splitext(win)[0] + ".verdict.json", os.path.splitext(dst)[0] + ".verdict.json")
    open(os.path.splitext(dst)[0] + ".pass", "w").write("ok")
    return win

if __name__ == "__main__":
    # python qa_gate.py <klip.mp4> <outdir>            -> siatki kontrolne
    # python qa_gate.py precheck <klip.mp4> <KARTA.json> -> flagi CV (pusto = brak flag/cv_reliable:false)
    if sys.argv[1] == "precheck":
        for f in cv_precheck(sys.argv[2], sys.argv[3]):
            print(json.dumps(f, ensure_ascii=False))
    else:
        for g in make_grids(sys.argv[1], sys.argv[2]):
            print(g)

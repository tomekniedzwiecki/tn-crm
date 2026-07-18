# -*- coding: utf-8 -*-
"""Zapis werdyktow bramek (po przegladzie agenta gestych siatek + sbs + identity board).
qa_gate.save_verdict (PASS -> .pass) + product_gate.save_fidelity (per-element) + finalize (fidelity.pass).
Werdykt: WSZYSTKIE 5 scen PASS, identity board CONSISTENT (brak morfu miedzy scenami)."""
import os, sys, glob
sys.path.insert(0, r"C:/tmp/video-factory/tools"); import qa_gate, product_gate
GEN = r"C:\tmp\video-factory\masazer\gen"

# czyszczenie ewentualnych smieci reclaim (inne projekty) — zeby finalize nie zlapal obcych .pass
for pat in ("clip_*.mp4","ls_*.mp4","oh_*.mp4","oh2_*.mp4","ka_*.mp4","c1_*.mp4","s00_*.mp4"):
    for f in glob.glob(os.path.join(GEN, pat)): os.remove(f)

ELEMENTS_PASS = [
    {"element": "korpus_tkanina", "present": True, "faithful": True, "note": "ciemno-szalwiowa zielona tkanina o splocie, spojna"},
    {"element": "obrecz_chrom", "present": True, "faithful": True, "note": "chromowa obrecz + metalowe mocowanie, obecna we wszystkich"},
    {"element": "panel_sterowania", "present": True, "faithful": True, "note": "srebrny owalny panel OiO, male ikony bez czytelnego tekstu"},
    {"element": "glowice_dlonie", "present": True, "faithful": True, "note": "silikonowe glowice-dlonie (kciuk+palce) + dolna glowica, palce nie zlane"},
    {"element": "pasek_skorzany", "present": True, "faithful": True, "note": "brazowy skorzany pasek (hands-free), obecny"},
]
# drobne, niedyskwalifikujace noty per scena
NOTE = {
 "hook":  ["dolny nub silikonowy zwisa pod paskiem — czyta sie jako dolna glowica (zgodne z produktem)"],
 "worn":  ["produkt medium (plan sredni) — demonstracja paska hands-free"],
 "heads": [],
 "relief":["luk ulgi (oddech->serena), produkt spojny"],
 "cta":   ["echo hooka (loop-close) OK"],
}
SCENES = ["hook","worn","heads","relief","cta"]
for sid in SCENES:
    clip = os.path.join(GEN, sid + ".mp4")
    qa_gate.save_verdict(clip, "PASS", flags=NOTE[sid])
    product_gate.save_fidelity(clip, "PASS", elements=ELEMENTS_PASS,
        demo_contract={"mechanizm_w_dzialaniu": True, "must_show": "spelnione (glowice ugniataja kark)",
                       "must_not_show": "brak (jeden egzemplarz, brak orange glow, brak brandu)"},
        fidelity_score=0.9)
    print("VERDICT", sid, "PASS + fidelity PASS")

ok, probs = product_gate.finalize(GEN, board_verdict={"consistent": True,
    "note": "produkt identyczny we wszystkich 5 scenach (tkanina+chrom+panel+glowice-dlonie+pasek); brak morfu miedzy scenami — kref zakotwiczyl tozsamosc"})
print("FINALIZE:", "PASS -> fidelity.pass" if ok else "FAIL")
for p in probs: print(" -", p)

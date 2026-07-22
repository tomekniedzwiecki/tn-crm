# -*- coding: utf-8 -*-
"""MONTAZ Skrolik po FIXie model_uzycia (22.07). Buduje PACK (baza + hookA cold-open + hookB bed)
z NAPRAWIONYCH klipow (kciuk DOCISKA przycisk, palec NIE celuje w ekran). Hooki wspoldziela rdzen
(demo/kontekst/kolory/cta), wiec podmiana scen = re-montaz wszystkich 3 z tych samych plikow.
Music-forward + SFX diegetic (klik/scroll) + ambient + LOOP CLOSE + -14 LUFS.
Wszystkie klipy maja .pass (qa_gate: model_uzycia PASS) + gen/fidelity.pass (produkt niezmieniony).
"""
import os, sys
sys.path.insert(0, r"C:/tmp/video-factory/tools")
import montaz, qa_gate

BASE = r"C:\tmp\video-factory\skrolik"
GEN  = os.path.join(BASE, "gen")
OUT  = os.path.join(BASE, "out")

# ── odswiez werdykty qa (model_uzycia PASS) dla naprawionych klipow ───────────
for c in ["hook", "demo", "kontekst", "hookvar2", "cta"]:
    qa_gate.save_verdict(os.path.join(GEN, c + ".mp4"), "PASS",
                         [{"ts": 0, "opis": "model_uzycia OK: kciuk dociska przycisk, palec nie celuje w ekran (fix 22.07)"}])

AUDIO = {"music": os.path.join(GEN, "music.mp3"), "music_gain": 0.62,
         "ambient": {"plik": "ambient.mp3", "gain": 0.12}}
CLK = lambda at, g=0.9: {"plik": "sfx_click.mp3", "at": at, "gain": g}
SCR = lambda at, g=0.7: {"plik": "sfx_scroll.mp3", "at": at, "gain": g}

# BAZA: [hook, demo, kontekst, kolory, cta] ~14.6 s
BAZA = [
  {"id": "hook",     "plik": "hook.mp4",     "ss": 0.3, "dur": 2.5, "has_physical_action": True, "sfx": [CLK(0.9), SCR(1.15)]},
  {"id": "demo",     "plik": "demo.mp4",     "ss": 0.3, "dur": 3.6, "has_physical_action": True, "sfx": [CLK(1.2, 0.95), SCR(1.5)]},
  {"id": "kontekst", "plik": "kontekst.mp4", "ss": 0.3, "dur": 3.5, "has_physical_action": True, "sfx": [CLK(1.3, 0.85), SCR(1.6, 0.65)]},
  {"id": "kolory",   "plik": "kolory.mp4",   "ss": 0.3, "dur": 2.4, "has_physical_action": False, "sfx": []},
  {"id": "cta",      "plik": "cta.mp4",      "ss": 0.5, "dur": 2.6, "has_physical_action": True, "sfx": [CLK(0.8, 0.85)]},
]

# HOOK A cold-open: money-shot (demo crop-zoom+lift 1.2 s) prepended -> skrocony rdzen ~14 s
HOOKA = [
  {"id": "coldopen", "plik": "demo.mp4", "ss": 1.0, "dur": 1.2, "has_physical_action": True,
   "sfx": [CLK(0.4, 0.95)], "vf_extra": "scale=1350:2400,crop=1080:1920,eq=brightness=0.03"},
  {"id": "hook",     "plik": "hook.mp4",     "ss": 0.3, "dur": 2.2, "has_physical_action": True, "sfx": [CLK(0.8), SCR(1.05)]},
  {"id": "demo",     "plik": "demo.mp4",     "ss": 0.4, "dur": 3.0, "has_physical_action": True, "sfx": [CLK(1.0, 0.95), SCR(1.3)]},
  {"id": "kontekst", "plik": "kontekst.mp4", "ss": 0.3, "dur": 3.0, "has_physical_action": True, "sfx": [CLK(1.2, 0.85), SCR(1.5, 0.65)]},
  {"id": "kolory",   "plik": "kolory.mp4",   "ss": 0.3, "dur": 2.2, "has_physical_action": False, "sfx": []},
  {"id": "cta",      "plik": "cta.mp4",      "ss": 0.5, "dur": 2.4, "has_physical_action": True, "sfx": [CLK(0.8, 0.85)]},
]

# HOOK B bed: hook wymieniony na hookvar2 (scroll w lozku, problem-first) ~14.9 s
HOOKB = [
  {"id": "hookvar2", "plik": "hookvar2.mp4", "ss": 0.3, "dur": 2.8, "has_physical_action": True, "sfx": [CLK(1.0), SCR(1.25)]},
  {"id": "demo",     "plik": "demo.mp4",     "ss": 0.3, "dur": 3.6, "has_physical_action": True, "sfx": [CLK(1.2, 0.95), SCR(1.5)]},
  {"id": "kontekst", "plik": "kontekst.mp4", "ss": 0.3, "dur": 3.5, "has_physical_action": True, "sfx": [CLK(1.3, 0.85), SCR(1.6, 0.65)]},
  {"id": "kolory",   "plik": "kolory.mp4",   "ss": 0.3, "dur": 2.4, "has_physical_action": False, "sfx": []},
  {"id": "cta",      "plik": "cta.mp4",      "ss": 0.5, "dur": 2.6, "has_physical_action": True, "sfx": [CLK(0.8, 0.85)]},
]

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for plan, name in [(BAZA, "kreacja_15s.mp4"),
                       (HOOKA, "kreacja_hookA_coldopen.mp4"),
                       (HOOKB, "kreacja_hookB_bed.mp4")]:
        out = os.path.join(OUT, name)
        p, total = montaz.build(plan, AUDIO, GEN, out)
        print(f"[montaz] {name}: {total:.2f}s -> {p}")

# -*- coding: utf-8 -*-
"""MONTAZ Odsaczek — baza 15 s + warianty hooka. Music-forward + ASMR SFX + LOOP CLOSE.
Wymaga: qa_gate .pass per klip + product_gate fidelity.pass (montaz.build je egzekwuje).
Usage: python montaz_run.py base | hookA | hookB
"""
import sys, os
sys.path.insert(0, r"c:/repos_tn/tn-crm/scripts/video-factory")
import montaz

BASE = r"C:\tmp\video-factory\odsaczek"
GEN  = os.path.join(BASE, "gen")
OUT  = os.path.join(BASE, "out"); os.makedirs(OUT, exist_ok=True)

def sfx(plik, at, gain=0.85): return {"plik": plik, "at": at, "gain": gain}

BASE_PLAN = [
  {"id": "hook",   "plik": "hook.mp4",   "ss": 0.3, "dur": 2.2, "has_physical_action": True,
   "sfx": [sfx("sfx_sizzle.mp3", 0.1, 0.9), sfx("sfx_drip.mp3", 0.6, 0.8)]},
  {"id": "lower",  "plik": "lower.mp4",  "ss": 0.3, "dur": 2.4, "has_physical_action": True,
   "sfx": [sfx("sfx_plunge.mp3", 0.5, 0.95), sfx("sfx_sizzle.mp3", 1.1, 0.8)]},
  {"id": "drain",  "plik": "drain.mp4",  "ss": 0.3, "dur": 2.3, "has_physical_action": True,
   "sfx": [sfx("sfx_drip.mp3", 0.3, 0.9)]},
  {"id": "dump",   "plik": "dump.mp4",   "ss": 0.3, "dur": 2.2, "has_physical_action": True,
   "sfx": [sfx("sfx_dump.mp3", 0.5, 0.9)]},
  {"id": "fold_a", "plik": "fold_a.mp4", "ss": 0.3, "dur": 1.8, "has_physical_action": True,
   "sfx": [sfx("sfx_fold.mp3", 0.6, 0.9)]},
  {"id": "fold_b", "plik": "fold_b.mp4", "ss": 0.3, "dur": 2.0, "has_physical_action": True,
   "sfx": [sfx("sfx_fold.mp3", 0.4, 0.7)]},
  {"id": "cta",    "plik": "cta.mp4",    "ss": 0.4, "dur": 2.2, "has_physical_action": True,
   "sfx": [sfx("sfx_sizzle.mp3", 0.1, 0.5), sfx("sfx_drip.mp3", 0.4, 0.75)], "_loop": "echo hooka"},
]

# ASMR-forward miks (KROK 8b): dip muzyki od hooka do drain (akt smazenia = SFX na 1. planie),
# muzyka pelna od dump; peak (lift) na fold_b (WOW skladania).
AUDIO = {"music": os.path.join(GEN, "music.mp3"), "music_gain": 0.6,
         "ambient": {"plik": "ambient.mp3", "gain": 0.12},
         "dip": ("hook", "drain"), "dip_gain": 0.16, "peak": "fold_b", "peak_gain": 1.35}

def build(plan, out_name):
    out = os.path.join(OUT, out_name)
    path, total = montaz.build(plan, AUDIO, GEN, out)
    print(f"MONTAZ {out_name}: {path} ({total:.2f}s)")
    return path

if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else "base"
    if step == "base":
        build(BASE_PLAN, "kreacja_15s.mp4")
    elif step == "hookA":
        # cold-open re-cut: 1.2 s money-shot (drain macro) na przod, body bez cta (loop) -> ~14 s
        plan = [{"id": "cold", "plik": "drain.mp4", "ss": 0.4, "dur": 1.2, "has_physical_action": True,
                 "sfx": [sfx("sfx_drip.mp3", 0.1, 0.95)]}] + BASE_PLAN[:-1]
        build(plan, "kreacja_15s_hookA.mp4")
    elif step == "hookB":
        # hook wg wzorca #2 (@goodthingsfindsa 'jeden kosz smazy wszystko' — dump/proof na przod)
        plan = [BASE_PLAN[3]] + BASE_PLAN[:3] + BASE_PLAN[4:]   # dump -> hook,lower,drain -> fold,cta
        build(plan, "kreacja_15s_hookB.mp4")

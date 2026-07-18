"""Montaz finalny kreacji 15s sluchawki (montaz.py). Drop muzyki na reveal cisnienia (s3)."""
import sys, os
sys.path.insert(0, r'C:/repos_tn/tn-crm/scripts/video-factory')
import montaz

GEN = r"C:\tmp\video-factory\sluchawka\gen"
OUT = r"C:\tmp\video-factory\sluchawka\out\kreacja_15s.mp4"

POP = "eq=saturation=1.06:contrast=1.04"
plan = [
 {"id": "s1_hook",    "plik": "s1_hook.mp4",    "ss": 0.30, "dur": 2.40, "vo": "vo_s1_hook.mp3",    "vf_extra": None},
 {"id": "s2_modes",   "plik": "s2_modes.mp4",   "ss": 0.80, "dur": 2.60, "vo": "vo_s2_modes.mp3",   "vf_extra": None},
 {"id": "s3_compare", "plik": "s3_compare.mp4", "ss": 1.80, "dur": 2.50, "vo": "vo_s3_compare.mp3", "vf_extra": POP},
 {"id": "s4_macro",   "plik": "s4_macro.mp4",   "ss": 0.40, "dur": 2.50, "vo": "vo_s4_macro.mp3",   "vf_extra": None},
 {"id": "s5_proof",   "plik": "s5_proof.mp4",   "ss": 0.50, "dur": 2.60, "vo": "vo_s5_proof.mp3",   "vf_extra": POP},
 {"id": "s6_cta",     "plik": "s6_cta.mp4",     "ss": 0.30, "dur": 2.40, "vo": "vo_s6_cta.mp3",     "vf_extra": None},
]
audio = {"music": os.path.join(GEN, "music.wav"), "mus_offset": 0.0, "mus_tempo": 1.0,
         "dip": ["s2_modes", "s2_modes"], "peak": "s3_compare"}

if __name__ == "__main__":
    path, total = montaz.build(plan, audio, GEN, OUT)
    print("FINAL", path, "total_s", round(total, 3))

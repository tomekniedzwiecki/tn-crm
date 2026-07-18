# -*- coding: utf-8 -*-
"""Montaz finalny kreacji 15s przez montaz.build()."""
import sys, os
sys.path.insert(0, r"C:\repos_tn\tn-crm\scripts\video-factory")
import montaz
BASE = r"C:\tmp\video-factory\srubokret"
GEN = os.path.join(BASE, "gen")

POP = "eq=saturation=1.05:contrast=1.03"
plan = [
 {"id": "s1", "plik": "srubokret_s1.mp4", "ss": 0.30, "dur": 2.90, "vo": "vo_s1_t.mp3", "vf_extra": None},
 {"id": "s2", "plik": "srubokret_s2.mp4", "ss": 0.20, "dur": 3.70, "vo": "vo_s2_t.mp3", "vf_extra": POP},
 {"id": "s3", "plik": "srubokret_s3.mp4", "ss": 0.50, "dur": 1.70, "vo": None,          "vf_extra": None},
 {"id": "s4", "plik": "srubokret_s4.mp4", "ss": 0.30, "dur": 3.50, "vo": "vo_s4_t.mp3", "vf_extra": POP},
 {"id": "s5", "plik": "srubokret_s5.mp4", "ss": 0.20, "dur": 3.50, "vo": "vo_s5_t.mp3", "vf_extra": None},
]
audio = {"music": os.path.join(GEN, "music.wav"), "mus_offset": 0.0, "mus_tempo": 1.0,
         "dip": ["s3", "s3"], "peak": "s4"}

out = os.path.join(BASE, "out", "kreacja_15s.mp4")
path, total = montaz.build(plan, audio, GEN, out)
print("BUILT", path, "total_s=", round(total, 3))

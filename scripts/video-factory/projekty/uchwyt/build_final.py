# -*- coding: utf-8 -*-
"""Finalny montaz uchwyt 15s. Tighten VO (atempo 1.12) + plan + montaz.build."""
import sys, os, subprocess
sys.path.insert(0, r"C:\repos_tn\tn-crm\scripts\video-factory")
import montaz
GEN = r"C:\tmp\video-factory\uchwyt\gen"
OUT = r"C:\tmp\video-factory\uchwyt\out\kreacja_15s.mp4"

# 1) VO tighten atempo 1.12 (naturalne, SSOT <=1.15)
for v in ["vo_s1","vo_s2","vo_s3","vo_s5","vo_s6"]:
    src = os.path.join(GEN, v+".mp3"); dst = os.path.join(GEN, v+"_t.mp3")
    subprocess.run(["ffmpeg","-v","error","-i",src,"-filter:a","atempo=1.12","-y",dst], check=True)

# 2) PLAN (sceny: id, plik, ss, dur, vo, vf_extra). s4 = driving bez VO.
plan = [
 {"id":"s1","plik":"uchwyt_r_s1.mp4","ss":0.40,"dur":3.10,"vo":"vo_s1_t.mp3","vf_extra":None},
 {"id":"s2","plik":"uchwyt_r_s2.mp4","ss":1.30,"dur":2.50,"vo":"vo_s2_t.mp3","vf_extra":None},
 {"id":"s3","plik":"uchwyt_r_s3.mp4","ss":0.60,"dur":2.70,"vo":"vo_s3_t.mp3","vf_extra":"eq=saturation=1.06:contrast=1.03"},
 {"id":"s4","plik":"uchwyt_r_s4.mp4","ss":1.20,"dur":2.20,"vo":None,"vf_extra":None},
 {"id":"s5","plik":"uchwyt_r_s5.mp4","ss":1.00,"dur":2.60,"vo":"vo_s5_t.mp3","vf_extra":None},
 {"id":"s6","plik":"uchwyt_r_s6.mp4","ss":0.60,"dur":1.90,"vo":"vo_s6_t.mp3","vf_extra":None},
]
audio = {"music": os.path.join(GEN,"music.wav"), "mus_offset":0.0, "mus_tempo":1.0,
         "dip":["s1","s1"], "peak":"s3"}

out, total = montaz.build(plan, audio, GEN, OUT)
print("OUT:", out, "total:", round(total,2), "s")

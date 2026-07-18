# -*- coding: utf-8 -*-
"""KROK 7 przygotowanie bramki: cv_precheck (honoruje cv_reliable) + siatki 3x3 dla KAZDEGO klipu.
Uzycie: python gate_prep.py [clip1.mp4 ...]  (domyslnie wszystkie gen/*.mp4 poza part_*)"""
import sys, os, glob, json
sys.path.insert(0, r'C:/repos_tn/tn-crm/scripts/video-factory')
import qa_gate

ROOT = r'C:/tmp/video-factory/myjka'
GEN = os.path.join(ROOT, 'gen'); QA = os.path.join(GEN, 'qa'); os.makedirs(QA, exist_ok=True)
KARTA = os.path.join(ROOT, 'KARTA.json')

clips = sys.argv[1:] or sorted(c for c in glob.glob(os.path.join(GEN, '*.mp4'))
                               if not os.path.basename(c).startswith('part_')
                               and not os.path.basename(c).startswith('_'))
for clip in clips:
    flags = qa_gate.cv_precheck(clip, KARTA)   # [] gdy cv_reliable=false
    grids = qa_gate.make_grids(clip, QA)
    print(f"\n=== {os.path.basename(clip)} === cv_flags={len(flags)} {flags if flags else ''}")
    for g in grids: print("  grid:", g)

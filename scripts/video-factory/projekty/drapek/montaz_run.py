# -*- coding: utf-8 -*-
"""KROK 8 MONTAZ: build(plan, audio) z plany-15s.json. require_pass + require_sfx (0h) TWARDO."""
import sys, json, os
sys.path.insert(0, r'C:/tmp/video-factory/tools'); import montaz
ROOT = r'C:/tmp/video-factory/drapek'; GEN = os.path.join(ROOT, 'gen')
PLAN = json.load(open(os.path.join(ROOT, 'plany-15s.json'), encoding='utf-8'))
out = os.path.join(ROOT, 'out', 'kreacja_15s.mp4')
path, total = montaz.build(PLAN['sceny'], PLAN['audio'], GEN, out, require_pass=True, require_sfx=True)
print("MONTAZ OK ->", path, "total", round(total, 3), "s")

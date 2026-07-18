# -*- coding: utf-8 -*-
import sys, json, os
sys.path.insert(0, r'C:/tmp/video-factory/tools'); import montaz
ROOT = r'C:/tmp/video-factory/masazer'; GEN = os.path.join(ROOT, 'gen')
PLAN = json.load(open(os.path.join(ROOT, 'plany-15s.json'), encoding='utf-8'))
out = os.path.join(ROOT, 'out', 'kreacja_15s.mp4')
path, total = montaz.build(PLAN['sceny'], PLAN['audio'], GEN, out, require_pass=True, require_sfx=True, require_fidelity=True)
print("MONTAZ OK ->", path, "total", round(total, 3), "s")

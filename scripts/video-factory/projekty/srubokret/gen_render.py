"""Render 5 scen przez Kling 2.5 flf (i2v). s1/s5 = single-frame; s2/s3/s4 = first+last."""
import sys, os, json
sys.path.insert(0, r"C:\tmp\video-factory\tools")
sys.path.insert(0, r"C:\repos_tn\tn-crm\scripts\video-factory")
import render
BASE = r"C:\tmp\video-factory\srubokret"
F = json.load(open(os.path.join(BASE, 'frames', 'firsts.json')))
L = json.load(open(os.path.join(BASE, 'frames', 'lasts.json')))
OUT = os.path.join(BASE, 'gen'); os.makedirs(OUT, exist_ok=True)

NEG = ("pink, rose gold, colored plastic handle, second screwdriver, duplicate tool, two tools, extra tool, "
       "extra hand, third arm, deformed hands, extra fingers, fused fingers, morphing, warping, tool changing "
       "shape, melting metal, text, watermark, logo, brand name, low quality, blurry")

scenes = [
    {"tag": "s1", "engine": "flf", "image_url": F['s1_first'], "duration": "5", "negative_prompt": NEG,
     "prompt": "A woman's hand makes small cramped back-and-forth twisting struggles with the tiny silver allen key "
     "on the bolt in the narrow gap beside the black furniture leg; almost no room to turn, the wrist twists "
     "awkwardly with visible frustration, slight handheld camera. The tool does not change shape. Exactly one tool."},
    {"tag": "s2", "engine": "flf", "image_url": F['s2_first'], "tail_image_url": L['s2_last'], "duration": "5",
     "negative_prompt": NEG,
     "prompt": "The black case lid swings fully open revealing the gunmetal ratchet T-bar screwdriver and all the "
     "colored-ring steel bits, a subtle satisfying camera push-in, soft light gliding over the metal. Nothing morphs."},
    {"tag": "s3", "engine": "flf", "image_url": F['s3_first'], "tail_image_url": L['s3_last'], "duration": "5",
     "negative_prompt": NEG,
     "prompt": "The teal-ring steel bit is pushed into the magnetic socket of the gunmetal ratchet head and clicks "
     "into place, the round knurled ratchet wheel turns one small click, shallow macro focus, subtle handheld. "
     "Exactly one bit, one tool."},
    {"tag": "s4", "engine": "flf", "image_url": F['s4_first'], "tail_image_url": L['s4_last'], "duration": "5",
     "negative_prompt": NEG,
     "prompt": "The hand ratchets the T-handle back and forth, the crossbar rotates, the ratchet clicks and the screw "
     "turns and sinks flush into the furniture in the tight space; confident smooth motion, slight handheld. Exactly "
     "one tool, the tool does not change shape."},
    {"tag": "s5", "engine": "flf", "image_url": F['s5_first'], "duration": "5", "negative_prompt": NEG,
     "prompt": "Slow smooth cinematic rotation of the gunmetal ratchet T-bar screwdriver as it stands by the open "
     "case of bits, a bright highlight travels along the knurled metal handle, gentle camera push-in, premium "
     "product hero, shallow depth of field. Nothing morphs."},
]
# tag prefix dla ledgera
for s in scenes: s["tag"] = "srubokret_" + s["tag"]
done = render.render_scenes(scenes, OUT)
print("DONE", json.dumps(done, indent=1))
# raportuj fails
import glob
for f in glob.glob(os.path.join(OUT, "*.failed")):
    print("FAILED", os.path.basename(f), ":", open(f).read()[:200])

# -*- coding: utf-8 -*-
"""Rendery scen uchwyt: Kling 2.5 flf. Import render.py z tn-crm scripts."""
import sys, os, json
sys.path.insert(0, r"C:\repos_tn\tn-crm\scripts\video-factory")
import render
BASE = r"C:\tmp\video-factory\uchwyt"; GEN = os.path.join(BASE,'gen')
f = json.load(open(os.path.join(GEN,'frames.json')))

M = {
 "s1": "Two hands clip the black dashboard phone-holder firmly onto the raised dashboard ledge with a quick satisfying press, then the fingers release; the holder stays fixed in place. Static handheld car interior, realistic, daylight.",
 "s2": "A hand lowers the plain dark phone into the holder cradle and the four black corner grippers close onto it holding it firmly, then the hand releases; the phone stays put. Subtle handheld, realistic.",
 "s3": "A hand smoothly rotates the mounted phone ninety degrees from vertical portrait to horizontal landscape on the ball-joint, then lets go; the phone holds its new position. Realistic, daylight car interior.",
 "s4": "Driving point of view: the car moves forward and the road and scenery slide past the windshield, while the mounted phone stays perfectly still showing the map; only subtle vibration. Handheld realistic.",
 "s5": "A fingertip taps the mounted phone once and it stays perfectly steady and level with no wobble as the car goes over a small bump in the road. Realistic handheld car interior.",
 "s6": "The mounted phone sits steady on the dashboard, a hand gestures toward it presenting it, gentle slow camera push-in, warm daylight.",
}
scenes = [
 {"tag":"uchwyt_r_s1","engine":"flf","image_url":f["s1_first"],"tail_image_url":f["s1_last"],"prompt":M["s1"]},
 {"tag":"uchwyt_r_s2","engine":"flf","image_url":f["s2_first"],"tail_image_url":f["s2_last"],"prompt":M["s2"]},
 {"tag":"uchwyt_r_s3","engine":"flf","image_url":f["s3_first"],"tail_image_url":f["s3_last"],"prompt":M["s3"]},
 {"tag":"uchwyt_r_s4","engine":"flf","image_url":f["s4"],"prompt":M["s4"]},
 {"tag":"uchwyt_r_s5","engine":"flf","image_url":f["s5_first"],"tail_image_url":f["s5_last"],"prompt":M["s5"]},
 {"tag":"uchwyt_r_s6","engine":"flf","image_url":f["s6"],"prompt":M["s6"]},
]
done = render.render_scenes(scenes, GEN)
print("RENDERED:", json.dumps(done, ensure_ascii=False))
for s in scenes:
    if s["tag"] not in done:
        p = os.path.join(GEN, s["tag"]+".failed")
        if os.path.exists(p): print("FAILED", s["tag"], open(p).read()[:200])

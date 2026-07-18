"""Render 6 scen sluchawki przez render.py (Kling FLF, woda = FLF nie MC)."""
import sys, os
sys.path.insert(0, r'C:/repos_tn/tn-crm/scripts/video-factory')
import render

S = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/video-factory/sluchawka/frames/"
OUT = r"C:\tmp\video-factory\sluchawka\gen"
os.makedirs(OUT, exist_ok=True)

NEG = ("morphing, warping, product changing shape, second shower head, duplicate product, two shower heads, "
       "extra hand, third arm, deformed hands, extra fingers, fused fingers, text, logo, brand, watermark, "
       "low quality, blurry product, plastic melting")

scenes = [
 {"tag": "s1_hook", "engine": "flf", "image_url": S+"s1_hook.png", "negative_prompt": NEG,
  "prompt": "Powerful high-pressure water jets blast continuously out of the white shower head, droplets flying toward camera, water splashing on the dark tiles, subtle handheld camera wobble, the product keeps its exact shape."},
 {"tag": "s2_modes", "engine": "flf", "image_url": S+"s2_modes_a.png", "tail_image_url": S+"s2_modes_b.png", "negative_prompt": NEG,
  "prompt": "A thumb presses the round mode button and the water smoothly switches from a soft wide spray into concentrated turbo needle-jets streaming from the slot and nozzles, satisfying transition, droplets, handheld macro, product shape unchanged."},
 {"tag": "s3_compare", "engine": "flf", "image_url": S+"s3_compare_a.png", "tail_image_url": S+"s3_compare_b.png", "negative_prompt": NEG,
  "prompt": "The weak thin water dribble suddenly surges into an explosive high-pressure blast of dense jets, the water pressure visibly doubling, heavy splash and spray flying outward, dramatic, product shape unchanged."},
 {"tag": "s4_macro", "engine": "flf", "image_url": S+"s4_macro.png", "negative_prompt": NEG,
  "prompt": "Macro: fine needle jets of water pulse and spiral out of the four massage nozzles and the turbo slot, sharp droplets and light mist drifting, shallow depth of field, slow subtle camera drift, product unchanged."},
 {"tag": "s5_proof", "engine": "flf", "image_url": S+"s5_proof.png", "negative_prompt": NEG,
  "prompt": "The concentrated high-pressure jet sweeps across the grimy soapy dark tile and blasts the white foam and dirt clean away revealing clean tile, suds and spray flying, satisfying, handheld, product shape unchanged."},
 {"tag": "s6_cta", "engine": "flf", "image_url": S+"s6_cta.png", "negative_prompt": NEG,
  "prompt": "A steady elegant stream of water flows from the white shower head held toward camera, water glistening in cinematic light, gentle handheld drift, the product face and white handle stay clearly visible and sharp, shape unchanged."},
]

if __name__ == "__main__":
    for sc in scenes:
        fal_est = 0.35
    done = render.render_scenes(scenes, OUT)
    print("DONE", list(done.keys()))
    import glob
    print("failed:", [os.path.basename(f) for f in glob.glob(os.path.join(OUT, "*.failed"))])

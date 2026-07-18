"""Klatki startowe + tail dla blueprintu sluchawki (nano-banana/edit). Faceless hands-demo."""
import sys, os, json
sys.path.insert(0, r'C:/tmp/video-factory/tools'); import fal

S = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/video-factory/"
PACK = S + "sluchawka/refs/pack.png"
DET = S + "sluchawka/refs/pack_detail.png"
BASE = r"C:\tmp\video-factory\sluchawka"

# karta produktu VERBATIM + scenografia
CARD = (" The product is EXACTLY the white handheld high-pressure shower head from the reference image: "
        "one round ~120mm glossy WHITE face with grey silicone nozzle field of many tiny holes, a horizontal "
        "oblong turbo slot across the upper-middle, a round mode button just below the slot, a row of FOUR small "
        "circular massage nozzles below the button, and a WHITE ergonomic handle with a cross-hatch diamond grip "
        "texture and a silver threaded connector at its base. EXACTLY ONE shower head in the scene, no duplicate. "
        "NO text, NO logo, NO brand anywhere. "
        "Scenography: dark modern bathroom with large dark grey slate stone tiles, moody low-key cinematic lighting, "
        "the white product contrasting against the dark wall, water droplets on the tiles. "
        "Photorealistic UGC smartphone footage, natural texture, slight grain, vertical 9:16.")

def gen(tag, urls, prompt):
    res = fal.gen("fal-ai/nano-banana/edit", {"prompt": prompt, "image_urls": urls,
                  "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}, tag="sluchawka_"+tag)
    u = (res.get('images') or [{}])[0].get('url')
    out = os.path.join(BASE, 'frames', tag + '.png')
    fal.download(u, out)
    stored = fal.store(out, f"sluchawka/frames/{tag}.png")
    print('OK', tag, flush=True)
    return stored

if __name__ == '__main__':
    g = {}
    g['s1_hook'] = gen('s1_hook', [PACK],
        "A woman's hand grips the white shower head handle, holding it up in the dark bathroom, a powerful dense column of high-pressure water jets blasting straight out of the white face, droplets flying, splashback on the dark tiles." + CARD)
    g['s2_modes_a'] = gen('s2_modes_a', [PACK],
        "Close macro: the white shower head face pointed slightly toward camera, a thumb resting on the round mode button, a soft wide rain-like spray of water coming from the face, dark bathroom bokeh behind." + CARD)
    g['s2_modes_b'] = gen('s2_modes_b', [g['s2_modes_a']],
        "Keep EXACTLY the same framing, lighting, hand position, product and background as this reference image. Only change: the thumb is now pressing the button and the water has switched to CONCENTRATED turbo needle-jets streaming forcefully from the horizontal slot and the four nozzles, denser and stronger spray.")
    g['s3_compare_a'] = gen('s3_compare_a', [PACK],
        "The white shower head held in a hand, emitting only a WEAK limp thin dribble of water, low pressure, sad trickle, dark bathroom." + CARD)
    g['s3_compare_b'] = gen('s3_compare_b', [g['s3_compare_a']],
        "Keep EXACTLY the same framing, lighting, hand and product position and background as this reference image. Only change: the water is now an EXPLOSIVE high-pressure blast of dense jets bursting out with heavy splash and spray flying, maximum pressure.")
    g['s4_macro'] = gen('s4_macro', [PACK, DET],
        "EXTREME macro close-up filling the frame on the white face: the four circular massage nozzles and the horizontal turbo slot, fine needle jets of water spiralling out with sharp droplets and light mist, shallow depth of field, dark background bokeh." + CARD)
    g['s5_proof'] = gen('s5_proof', [PACK],
        "The white shower head in a hand aiming a concentrated high-pressure jet of water at a grimy dark tile surface covered in white soap foam, the jet blasting the foam and dirt away in a clean sweep, suds and spray flying, dynamic angle." + CARD)
    g['s6_cta'] = gen('s6_cta', [PACK],
        "Hero beauty product shot: a hand holds the white shower head angled toward camera, a steady elegant stream of water flowing from the face, the product face and white textured handle clearly visible and in sharp focus, premium dark bathroom, water glistening in cinematic light." + CARD)
    json.dump(g, open(os.path.join(BASE, 'frames', 'frames.json'), 'w'), indent=1)
    print('DONE', len(g))

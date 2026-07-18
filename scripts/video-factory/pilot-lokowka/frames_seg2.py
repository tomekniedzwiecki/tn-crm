"""Klatki segmentu v2 wg kart: PRODUKT + SCENOGRAFIA + GRAMATYKA CZYNNOSCI."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__)); import fal

S = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/video-factory/"
U, PACK, FACE = S+"lokowka/refs/usage/", S+"lokowka/refs/packshot-clean.png", S+"lokowka/refs/face-ref.png"

PRODUCT = (" PRODUCT CARD (must match the product reference EXACTLY in every detail): pink automatic curler with a crown "
           "of SIX prongs (two tall central petals + four outer straight prongs), rose-gold metallic barrel inside the "
           "chamber, handle with two small leaf emblems, a glowing blue Y-shaped LED strip and one round button, and a "
           "thin PALE-PINK coiled power cord — the cord is NEVER grey. ")
SCENE = (" SCENE CARD: small bathroom, white waffle shower curtain directly behind her, a shelf with cosmetic bottles "
         "visible at the LEFT edge of the frame, warm natural window light. The device is in her RIGHT hand, at her "
         "RIGHT temple, on the RIGHT side of the frame. Worn faded beige oversized t-shirt, no jewelry, no nail polish. ")
STYLE = (" Both hands clearly separated, five fingers each, anatomically correct. Photorealistic smartphone UGC selfie, "
         "natural skin texture, slight grain, vertical 9:16. NO text, NO logos.")

def gen(tag, urls, prompt):
    res = fal.gen("fal-ai/nano-banana/edit", {"prompt": prompt, "image_urls": urls,
                  "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}, tag=tag)
    u = (res.get('images') or [{}])[0].get('url')
    out = os.path.join(r"C:\tmp\video-factory\lokowka\gen", tag + '.png')
    fal.download(u, out); fal.store(out, f"lokowka/gen/{tag}.png")
    print('OK', tag, flush=True)

if __name__ == '__main__':
    gen('s2_load', [U+"load-feed-strand-into-chamber-01.jpg", PACK, FACE],
        "Image 1 = HAND POSE/ACTION only. Image 2 = product identity only. Image 3 = her face identity only (warm brown eyes). "
        "Generate: the pink curler PRESSED firmly against her RIGHT temple by her right hand; her left hand pinches a TAUT "
        "strand of straight hair from above, feeding it down into the crown chamber; visible hair tension; her eyes glance "
        "DOWN at the strand entering the device, focused frown; all hair straight." + PRODUCT + SCENE + STYLE)
    gen('s2_mech_first', [U+"chamber-hair-wrapping-spiral-01.jpg", PACK],
        "Image 1 = mechanical action reference only. Image 2 = product identity only. "
        "Generate: tight MACRO filling the frame: the curler chamber seen slightly from below against the blurred waffle "
        "curtain, a TAUT strand of chestnut hair entering the chamber FROM THE TOP (as if from her head above the frame), "
        "just beginning to wrap around the rose-gold barrel; a bare fingertip guides the strand at the top edge; "
        "warm bathroom light matching the wide shots." + PRODUCT + " NO face, NO jewelry." + STYLE)
    gen('s2_mech_last', [S+"lokowka/gen/s2_mech_first.png"],
        "Keep EXACTLY the same framing, lighting, background and device as this reference. Do NOT add parts, keep all six "
        "crown prongs unchanged. Only change: the strand is now FULLY WOUND around the rose-gold barrel in neat tight coils; "
        "no loose strand from the top anymore." + " The thin power cord stays PALE-PINK.")
    gen('s2_release_first', [U+"release-clamp-open-curl-01.jpg", PACK, FACE],
        "Image 1 = pose reference only. Image 2 = product identity only. Image 3 = face identity only (warm brown eyes). "
        "Generate: the pink curler PRESSED against her RIGHT temple, held by her right hand ONLY, hair wound inside the "
        "chamber; her left hand rests lowered; her eyes glance sideways at the device, tense anticipation; rest of hair "
        "straight." + PRODUCT + SCENE + STYLE)
    gen('s2_release_last', [S+"lokowka/gen/s2_release_first.png"],
        "Keep EXACTLY the same framing, lighting, face, background and hand grip as this reference. Only change: the device "
        "has SLID DOWN along the strand about 25 cm below her temple (still held by the same right hand, now at chin height), "
        "its chamber empty, and ONE fresh bouncy spiral curl hangs at her right temple where the strand was, catching the "
        "light; her eyes look at the new curl." + " The cord stays PALE-PINK.")

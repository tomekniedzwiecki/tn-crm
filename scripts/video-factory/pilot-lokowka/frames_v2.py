"""Klatki blueprintu v2 (PROCES nie POZA): 12 obrazow nano-banana, pary FLF chainowane."""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__)); import fal

S = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/video-factory/"
FACE = S + "lokowka/refs/face-ref.png"
PACK = S + "lokowka/refs/packshot-clean.png"
BASE = r"C:\tmp\video-factory\lokowka"

COMMON = (" The SAME woman as in the face reference (rounder face, warm brown eyes, thicker brows, NO freckles), "
          "worn faded beige oversized t-shirt, small bathroom with white waffle shower curtain, a few cosmetic "
          "bottles cluttering a shelf, uneven natural window light, slightly messy flyaway hair strands. "
          "The pink automatic curler EXACTLY as in the product reference (crown of prongs, rose-gold barrel, "
          "leaf emblem, LED strip) with a thin pale-pink power cord. Photorealistic smartphone UGC selfie look, "
          "natural skin texture with pores, slight grain. NO text, NO logos.")

def gen(tag, urls, prompt):
    res = fal.gen("fal-ai/nano-banana/edit", {"prompt": prompt, "image_urls": urls,
                  "num_images": 1, "output_format": "png", "aspect_ratio": "9:16"}, tag=tag)
    u = (res.get('images') or [{}])[0].get('url')
    out = os.path.join(BASE, 'gen', tag + '.png')
    fal.download(u, out)
    stored = fal.store(out, f"lokowka/gen/{tag}.png")
    print('OK', tag, flush=True)
    return stored

if __name__ == '__main__':
    g = {}
    g['v5_h1'] = gen('v5_h1', [FACE, PACK],
        "Medium selfie shot: the woman holds the pink curler loosely in one hand at chest height, completely straight flat hair, skeptical unimpressed expression with one raised eyebrow, looking straight into camera." + COMMON)
    g['v5_h2'] = gen('v5_h2', [FACE],
        "EXTREME close-up, her face fills the entire frame: eyes wide open, mouth open in a shocked 'whoa' expression, straight hair partially visible, slight handheld motion blur." + COMMON)
    g['v5_load'] = gen('v5_load', [FACE, PACK],
        "Medium-close shot: BOTH her hands working — one holds the pink curler against the right side of her head, the other hand feeds a strand of straight hair into the crown of prongs, visible hair tension, her gaze fixed ON the device (not camera), focused slight frown, all hair still straight." + COMMON)
    g['v5_mech1_first'] = gen('v5_mech1_first', [PACK],
        "MACRO shot filling the frame: the pink curler's crown chamber with a strand of straight chestnut hair just entering the intake slot between the prongs, rose-gold metallic barrel visible inside, shallow depth of field, blurred bathroom background, a fingertip holding the strand taut at frame edge. Photorealistic smartphone macro, natural light, slight grain. NO face, NO text.")
    g['v5_mech1_last'] = gen('v5_mech1_last', [g['v5_mech1_first']],
        "Keep EXACTLY the same framing, lighting, background and device position as this reference image. Only change: the hair strand is now FULLY WOUND around the rose-gold barrel inside the chamber, coiled tightly in neat loops, no loose strand at the intake anymore.")
    g['v5_wait'] = gen('v5_wait', [FACE, PACK],
        "Medium shot: the pink curler held at the right side of her head with hair drawn inside the chamber, her eyes looking sideways AT the device with tense anticipation, lips slightly pressed, other hand lowered, rest of hair straight." + COMMON)
    g['v5_release_first'] = gen('v5_release_first', [FACE, PACK],
        "Medium-close shot: the pink curler held right at the side of her head, hair wound inside the chamber, her face partially visible watching the device closely, straight hair elsewhere." + COMMON)
    g['v5_release_last'] = gen('v5_release_last', [g['v5_release_first']],
        "Keep EXACTLY the same framing, lighting, face and background as this reference image. Only change: the device is now pulled about 20 cm away from her head toward the camera, and where the strand was there now hangs ONE fresh bouncy spiral curl catching the light. The chamber is empty.")
    g['v5_react'] = gen('v5_react', [FACE],
        "Medium-close selfie: she holds one single fresh spiral curl between her fingers showing it toward the camera, the rest of her hair is straight, genuine open-mouth delighted laugh, eyes crinkled with joy, head tilted slightly back." + COMMON)
    g['v5_prog'] = gen('v5_prog', [FACE, PACK],
        "Medium shot: ASYMMETRIC hair — her right side full of bouncy spiral curls, left side still completely straight and flat; she feeds another straight strand into the pink curler with her second hand, animated proud expression glancing at the camera, mid-process energy." + COMMON)
    g['v5_mech2'] = gen('v5_mech2', [PACK, FACE],
        "Close shot: her index finger points at the chamber of the pink curler where hair is visibly wound inside, the device is sharp in focus in the foreground, her asymmetrically curled hair and face softly out of focus behind, bathroom background." + COMMON)
    g['v5_shake'] = gen('v5_shake', [FACE],
        "Medium shot: FULL head of bouncy spiral curls, both her hands buried in the curls mid-shake, joyful open-mouth laugh, curls flying with slight motion blur, high energy." + COMMON)
    json.dump(g, open(os.path.join(BASE, 'gen', 'v5_frames.json'), 'w'), indent=1)
    print('DONE', len(g))

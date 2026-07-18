# -*- coding: utf-8 -*-
"""KLATKI v3 drapek — DOKTRYNA 'EDYTUJ PRAWDE' (SSOT 0i v3).
Kazda klatka produktowa = nano-EDYCJA packshotu: Image 1 = packshot (KEEP piksele deski
DOKLADNIE, dorysuj TYLKO otoczenie/psa/dlon wokol), Image 2 = dog-ref (tozsamosc psa),
opcj. Image 3 = scratched-surface. LAST = edycja FIRST + re-injekcja packshotu (correct drift),
zmienia sie TYLKO pies/dlon/rysy (produkt statyczny). Sceny: board, reward_a, reward_b, scratch, proof.
hook + cta ZOSTAJA z v2. ASCII printy. Uruchamiaj per klatka: python genframes.py <scena>_<first|last>.
"""
import os, sys, json
sys.path.insert(0, r"C:/tmp/video-factory/tools"); import fal
fal.set_project('drapek')

BASE = r"C:\tmp\video-factory\drapek"
FR = os.path.join(BASE, "frames")
REFS = os.path.join(BASE, "refs")
KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
P = KARTA["product"]; DOG = KARTA["identity"]["dog_desc"]
SCENO = f"{KARTA['scenography']['layout']}. {KARTA['scenography']['swiatlo']}"

INVARIANT = (
    "The board is a THICK solid pale-wood board; its whole flat top is ONE continuous coarse matte-black "
    "abrasive surface reaching edge-to-edge to the wood SIDE edges, with NO wooden rim, NO lip, NO raised "
    "frame and NO tray edge on the top; the lid is a SEPARATE thinner smaller black deck carrying a black "
    "pull-loop; in the OPEN state the lid is slid to the LEFT partly BEYOND the board outline and the pale "
    "wooden treat well is at CENTER-RIGHT; the lid NEVER lifts, tilts or hinges.")
KEEP1 = (
    "Image 1 is a studio packshot of the product on plain white. KEEP the scratch board EXACTLY as its "
    "pixels in Image 1 - same geometry, construction, lid position, well position and proportions. Do NOT "
    "redraw, reshape, re-texture, re-colour or add parts to the board. Only REPLACE the white background "
    "with the described scene and rest the board flat on the floor with a soft natural contact shadow.")
DOG2 = (f"Image 2 is the DOG IDENTITY reference ONLY - one corgi, {DOG}; use it ONLY for the dog's "
        "identity, ignore its background.")
SURF3 = ("Image 3 is the SCRATCHED SURFACE TEXTURE reference ONLY - dense fine light-grey claw-scuff "
         "striations on black, NOT white chalk lines.")
ANTI_TEXT = ("no readable text, no logos, no brand names, no wordmark on the wood, no numbers; any tiny "
             "text must be blurred and illegible")
ANTI_HANDS = ("natural human hand, one hand, five fingers, no extra fingers, no fused fingers, no third arm; "
              "bare hand, no rings, no bracelets, no nail polish, no watch")
SKIN = "visible skin pores, fine skin texture, natural micro-imperfections - NOT waxy, NOT airbrushed"
DOGTEX = ("real photographic dog with natural fur and individual hairs, exactly four legs and four paws, "
          "one tail, two upright ears - NOT plush, NOT cartoon, NOT morphed")
NEG_HINT = ("bright high-key daylight NOT a dark room, plain unbranded blonde wood on the sides only, the "
            "whole top black to the edges with NO rim/lip/frame/tray-edge, the lid a separate black deck "
            "slid LEFT (never hinged or lifted), the treat well at CENTER-RIGHT (never at an edge or corner)")
TAIL = "Photorealistic vertical 9:16 UGC smartphone photo, natural window light, slight grain."


def nano(prompt, image_urls, out_name, tag):
    payload = {"prompt": prompt, "image_urls": image_urls, "num_images": 1,
               "output_format": "png", "aspect_ratio": "9:16"}
    res = fal.gen("fal-ai/nano-banana/edit", payload, tag=tag)
    url = (res.get("images") or [{}])[0].get("url")
    if not url: raise RuntimeError(f"nano no image: {str(res)[:300]}")
    out = os.path.join(FR, out_name); fal.download(url, out)
    print("SAVED", out_name, flush=True); return out


def upref(name):  return fal.store(os.path.join(REFS, name), "drapek/v3ref_" + os.path.basename(name))
def upfr(name):   return fal.store(os.path.join(FR, name), "drapek/v3fr_" + name)


def first(base_packshot, scene_desc, out_name, tag, hand=False, surface=False):
    imgs = [upref(base_packshot), DOGREF_URL]
    roles = KEEP1 + " " + DOG2 + " "
    if surface:
        imgs.append(SCUFF); roles += SURF3 + " "
    h = (" " + ANTI_HANDS + " " + SKIN) if hand else ""
    prompt = (roles + INVARIANT + f" Scene: {scene_desc}. {SCENO}. {NEG_HINT}. {DOGTEX}. {ANTI_TEXT}.{h} " + TAIL)
    return nano(prompt, imgs, out_name, tag)


def last(first_name, base_packshot, change, out_name, tag, hand=False):
    imgs = [upfr(first_name), upref(base_packshot)]
    h = (" " + ANTI_HANDS + " " + SKIN) if hand else ""
    prompt = (
        "Image 1 is the base scene photo - keep it EXACTLY: same room, same board, same framing, lighting "
        "and camera angle, same one corgi. Image 2 is the exact product packshot - CORRECT any board drift "
        f"or hallucination in the scene to match Image 2's construction. {INVARIANT} "
        f"Change ONLY: {change}. Keep the board perfectly still and identical; do NOT add or remove product "
        f"parts or dog legs/paws; keep {P['functional_count']}; exactly one corgi with four legs. "
        f"{NEG_HINT}. {DOGTEX}. {ANTI_TEXT}.{h} " + TAIL)
    return nano(prompt, imgs, out_name, tag)


BP = {s["id"]: s for s in json.load(open(os.path.join(BASE, "blueprint.json"), encoding="utf-8"))["sceny"]}

DEF = {
  "board_first":   lambda: first("prod-closed.png", BP["board"]["first_brief_en"], "board_first.png", "v3_board_first", hand=False),
  "board_last":    lambda: last("board_first.png", "prod-closed.png", BP["board"]["last_brief_en"], "board_last.png", "v3_board_last"),
  "board_last_closed": lambda: nano(
      ("Image 1 is the base scene photo - keep it 100% IDENTICAL: same room, floor, sofa, framing, "
       "lighting and camera, and keep the scratch board EXACTLY pixel-for-pixel the same. The lid stays "
       "FULLY CLOSED and flush and the treat well stays COMPLETELY HIDDEN - do NOT open, reveal, recess or "
       "change any well, hole or compartment; the black top stays unbroken. Change ONLY the corgi: it lowers "
       "its head and sniffs the closed black surface, ears up, small tail wag. " + INVARIANT + " "
       + DOGTEX + " " + NEG_HINT + " " + ANTI_TEXT + " " + TAIL),
      [upfr("board_first.png")], "board_last.png", "v3_board_last_closed"),
  "reward_a_first":lambda: first("prod-closed.png", BP["reward_a"]["first_brief_en"], "reward_a_first.png", "v3_reward_a_first", hand=True),
  "reward_a_last": lambda: last("reward_a_first.png", "prod-closed.png", BP["reward_a"]["last_brief_en"], "reward_a_last.png", "v3_reward_a_last", hand=True),
  "reward_b_first":lambda: first("prod-open.png", BP["reward_b"]["first_brief_en"], "reward_b_first.png", "v3_reward_b_first", hand=True),
  "reward_b_last": lambda: last("reward_b_first.png", "prod-open.png", BP["reward_b"]["last_brief_en"], "reward_b_last.png", "v3_reward_b_last", hand=True),
  "scratch_first": lambda: first("prod-open.png", BP["scratch"]["first_brief_en"], "scratch_first.png", "v3_scratch_first", surface=True),
  "scratch_last":  lambda: last("scratch_first.png", "prod-open.png", BP["scratch"]["last_brief_en"], "scratch_last.png", "v3_scratch_last"),
  "proof_first":   lambda: first("prod-open.png", BP["proof"]["first_brief_en"], "proof_first.png", "v3_proof_first", surface=True),
  "proof_last":    lambda: last("proof_first.png", "prod-open.png", BP["proof"]["last_brief_en"], "proof_last.png", "v3_proof_last"),
}

if __name__ == "__main__":
    DOGREF_URL = upfr("dog-ref.png")
    SCUFF = upref("scratched-surface.png")
    for scene in sys.argv[1:]:
        DEF[scene]()
        print("DONE", scene, flush=True)

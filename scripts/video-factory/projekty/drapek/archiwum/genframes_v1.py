# -*- coding: utf-8 -*-
"""Klatki nano-banana/edit dla drapek (gadzet-handsPOV + ANIMAL-AS-PERFORMER).
dog-ref (kanoniczny corgi) = tozsamosc psa we wszystkich scenach (analog face-ref).
Kazda scena: FIRST z referencji (dog-ref + packshot Ali, role jawne), LAST chainowany z FIRST.
Tozsamosc produktu WYLACZNIE z galerii Ali (prod-closed/prod-open). ASCII printy."""
import os, sys, json
sys.path.insert(0, r"C:/tmp/video-factory/tools"); import fal
fal.set_project('drapek')

BASE = r"C:\tmp\video-factory\drapek"
FR = os.path.join(BASE, "frames"); os.makedirs(FR, exist_ok=True)
REFS = os.path.join(BASE, "refs")
KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
P = KARTA["product"]; DOG = KARTA["identity"]["dog_desc"]

PRODUCT_ID = (f"The product EXACTLY as its identity reference: {P['anatomy_str']}; "
              f"{P['functional_count']}. {P['exactly_one']}.")
ANTI_TEXT = ("no readable text, no logos, no brand names, no wordmark on the wood, no numbers; "
             "any tiny text must be blurred and illegible")
ANTI_HANDS = ("natural human hands, max two hands, five fingers each, no extra fingers, "
              "no fused fingers, no third arm")
ANTI_JEWEL = "bare hand, no rings, no bracelets, no nail polish, no watch"
SKIN = ("visible skin pores, fine skin texture, natural micro-imperfections, subsurface scattering "
        "- NOT waxy, NOT airbrushed")
DOGTEX = ("real photographic dog with natural fur texture and individual hairs, real canine anatomy "
          "with exactly four legs and four paws, one tail, two upright ears - NOT plush, NOT cartoon, NOT morphed")
SCENO = f"{KARTA['scenography']['layout']}. {KARTA['scenography']['swiatlo']}"
NEG_HINT = "bright high-key daylight, NOT a dark room, NO grey patterned carpet, plain unbranded blonde wood"

def nano(prompt, image_urls, out_name, tag):
    payload = {"prompt": prompt, "image_urls": image_urls, "num_images": 1,
               "output_format": "png", "aspect_ratio": "9:16"}
    res = fal.gen("fal-ai/nano-banana/edit", payload, tag=tag)
    url = (res.get("images") or [{}])[0].get("url")
    if not url: raise RuntimeError(f"nano no image: {str(res)[:300]}")
    out = os.path.join(FR, out_name); fal.download(url, out)
    print("SAVED", out_name, flush=True); return out

def up(name, sub="fr"):
    return fal.store(os.path.join(FR, name), f"drapek/{sub}_" + name)

def upref(name):
    return fal.store(os.path.join(REFS, name), "drapek/ref_" + name)

# role-based FIRST frame from [DOG_REF, PRODUCT_REF] (product optional)
def first(scene_desc, out_name, tag, product_ref=None, hand=False):
    imgs = [DOGREF_URL]
    roles = (f"Use Image 1 for the DOG IDENTITY ONLY - the same one corgi, {DOG} - ignore its background. ")
    if product_ref:
        imgs.append(product_ref)
        roles += (f"Use Image 2 for the EXACT PRODUCT IDENTITY ONLY - {PRODUCT_ID} - ignore its background and lighting. ")
    h = (" " + ANTI_HANDS + " " + ANTI_JEWEL + " " + SKIN) if hand else ""
    prompt = (roles + f"Scene: {scene_desc}. {SCENO}. {NEG_HINT}. {DOGTEX}. {ANTI_TEXT}.{h} "
              f"Photorealistic vertical 9:16 UGC smartphone photo, natural window light, slight grain.")
    return nano(prompt, imgs, out_name, tag)

# LAST frame chained from a FIRST (keep-exactly, change-only)
def last(first_url, change, out_name, tag, hand=False):
    h = (" " + ANTI_HANDS + " " + ANTI_JEWEL + " " + SKIN) if hand else ""
    prompt = (f"Keep EXACTLY the same framing, lighting, background, camera angle, the same corgi and the "
              f"same product position and shape as this reference image. Change ONLY: {change}. "
              f"Do NOT add or remove any product parts or any dog legs/paws; keep {P['functional_count']}; "
              f"exactly one corgi with four legs. No new objects, no new hands. {DOGTEX}. {ANTI_TEXT}.{h}")
    return nano(prompt, [first_url], out_name, tag)

if __name__ == "__main__":
    step = sys.argv[1]
    if step == "dogref":
        corgi = upref("lifestyle-corgi.png")
        prompt = (f"Use Image 1 ONLY for the dog: extract the Pembroke Welsh Corgi and produce a clean, sharp "
                  f"full-body reference photo of this SAME corgi ({DOG}) sitting in three-quarter view on a bright "
                  f"light-oak wood floor in a bright airy home, cream sofa softly blurred behind. {DOGTEX}. "
                  f"Photorealistic, vertical 9:16, natural bright daylight, no text, no logo. {ANTI_TEXT}.")
        nano(prompt, [corgi], "dog-ref.png", "drapek_dogref")
        print("DOG-REF DONE - review before scenes", flush=True)

    elif step == "scenes":
        global DOGREF_URL
        DOGREF_URL = up("dog-ref.png")
        pc = upref("prod-closed.png")   # closed board: black abrasive top + wood + loop
        po = upref("prod-open.png")     # open drawer: treat well + treats
        # HOOK - problem: corgi flinches from clippers (no board), bright
        first("a bright high-key living room, the corgi sits on the light-oak floor and PULLS its front paw back, "
              "head turned away with ears pinned back, uneasy, while a human hand holds shiny silver metal nail "
              "clippers approaching its paw; no scratch board in frame", "hook_first.png", "drapek_hook_first", hand=True)
        hf = up("hook_first.png")
        last(hf, "the corgi has flinched further away, its paw lifted higher off the floor, head turned more to the "
             "side, ears flatter, clearly avoiding the clippers still held in the hand", "hook_last.png", "drapek_hook_last", hand=True)
        # BOARD - solution enters
        first("a human hand lowers the unbranded scratch board (coarse black abrasive top, pale blonde wood body, "
              "sliding black lid with a black pull-loop) onto the light-oak floor in front of the curious corgi, "
              "the corgi's ears perked up", "board_first.png", "drapek_board_first", product_ref=pc, hand=True)
        bf = up("board_first.png")
        last(bf, "the hand has withdrawn, the board now rests flat on the floor and the corgi leans in sniffing it "
             "with ears up and interested", "board_last.png", "drapek_board_last", hand=True)
        # SCRATCH - money shot (closer, no hand)
        first("a closer bright shot of the board on the floor, the corgi's tan-and-white front paw pressed on the top "
              "edge of the coarse black abrasive surface, claws down about to drag, a few faint pale scratch streaks "
              "already visible on the black surface", "scratch_first.png", "drapek_scratch_first", product_ref=pc)
        sf = up("scratch_first.png")
        last(sf, "the front paw has dragged down and back across the black surface leaving fresh pale scratch streaks, "
             "the other front paw lifting to scratch next", "scratch_last.png", "drapek_scratch_last")
        # REWARD - drawer + treat
        first("a bright shot of the board on the floor with the corgi beside it, a human hand gripping the black "
              "pull-loop at the corner of the sliding lid, beginning to slide it open, the treat well still mostly covered",
              "reward_first.png", "drapek_reward_first", product_ref=po, hand=True)
        rf = up("reward_first.png")
        last(rf, "the black lid has slid back revealing the pale wooden well with a few brown kibble treats inside, and "
             "the corgi dips its nose in to take a treat", "reward_last.png", "drapek_reward_last", hand=True)
        # PROOF - macro scratched surface -> calm corgi
        first("a bright macro close-up of the black abrasive board top now covered in many pale scratch streaks "
              "(proof the claws are being filed), the corgi's tan paw resting on the edge", "proof_first.png",
              "drapek_proof_first", product_ref=pc)
        pf = up("proof_first.png")
        last(pf, "the framing eases back a little to show the calm relaxed corgi sitting content beside the scratched "
             "board in the bright room, ears relaxed", "proof_last.png", "drapek_proof_last")
        # CTA - loop close (echo of hook room, resolved)
        first("the SAME bright high-key room and light as the opening, the same corgi in the same spot on the light-oak "
              "floor, but now the scratch board is in front with its treat lid slid open showing kibble, and the calm "
              "happy corgi rests its front paw on the board", "cta_first.png", "drapek_cta_first", product_ref=po)
        cf = up("cta_first.png")
        last(cf, "the corgi taps its paw once on the board and looks up content, warm bright hero final frame that "
             "mirrors the opening room and light", "cta_last.png", "drapek_cta_last")
        print("ALL SCENE FRAMES DONE", flush=True)

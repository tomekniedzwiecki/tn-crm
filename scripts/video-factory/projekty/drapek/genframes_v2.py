# -*- coding: utf-8 -*-
"""KLATKI v2 drapek (0i WIERNOSC). Regeneruje board/reward/scratch/proof/cta (hook zostaje).
Role refow JAWNE (max 4). FIRST z [dog-ref + packshot WLASCIWEGO stanu (+scratched-surface)].
LAST ZAWSZE [first, ref_stanu] + 'correct any drift'. cta_first = inpaint v1 (dodaj lape NA desce,
zachowaj wierny mechanizm-wzor). ASCII printy. Uruchamiaj po jednej scenie: python genframes_v2.py <scena>.
"""
import os, sys, json
sys.path.insert(0, r"C:/tmp/video-factory/tools"); import fal
fal.set_project('drapek')

BASE = r"C:\tmp\video-factory\drapek"
FR = os.path.join(BASE, "frames")
REFS = os.path.join(BASE, "refs")
KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
P = KARTA["product"]; DOG = KARTA["identity"]["dog_desc"]

PRODUCT_ID = (f"{P['anatomy_str']}; {P['functional_count']}. {P['exactly_one']}.")
ANTI_TEXT = ("no readable text, no logos, no brand names, no wordmark on the wood, no numbers; "
             "any tiny text must be blurred and illegible")
ANTI_HANDS = ("natural human hands, max two hands, five fingers each, no extra fingers, "
              "no fused fingers, no third arm")
ANTI_JEWEL = "bare hand, no rings, no bracelets, no nail polish, no watch"
SKIN = ("visible skin pores, fine skin texture, natural micro-imperfections - NOT waxy, NOT airbrushed")
DOGTEX = ("real photographic dog with natural fur texture and individual hairs, real canine anatomy "
          "with exactly four legs and four paws, one tail, two upright ears - NOT plush, NOT cartoon, NOT morphed")
SCENO = f"{KARTA['scenography']['layout']}. {KARTA['scenography']['swiatlo']}"
NEG_HINT = ("bright high-key daylight NOT a dark room, NO grey patterned carpet, plain unbranded blonde wood, "
            "the board is a THIN flat 3cm slab lying level NOT a thick wedge, the treat lid is FLUSH in-plane "
            "NOT a raised wooden frame or box on top, the treat well is at the LEFT END not the middle")

def nano(prompt, image_urls, out_name, tag):
    payload = {"prompt": prompt, "image_urls": image_urls, "num_images": 1,
               "output_format": "png", "aspect_ratio": "9:16"}
    res = fal.gen("fal-ai/nano-banana/edit", payload, tag=tag)
    url = (res.get("images") or [{}])[0].get("url")
    if not url: raise RuntimeError(f"nano no image: {str(res)[:300]}")
    out = os.path.join(FR, out_name); fal.download(url, out)
    print("SAVED", out_name, flush=True); return out

def upref(name):  # ref z refs/
    return fal.store(os.path.join(REFS, name), "drapek/v2ref_" + os.path.basename(name))
def upfr(name):   # klatka z frames/
    return fal.store(os.path.join(FR, name), "drapek/v2fr_" + name)

def first(scene_desc, out_name, tag, product_ref, prod_role, surface_ref=None, hand=False):
    imgs = [DOGREF_URL, product_ref]
    roles = (f"Use Image 1 for the DOG IDENTITY ONLY - the same one corgi, {DOG} - ignore its background. "
             f"Use Image 2 for the EXACT PRODUCT IDENTITY AND MECHANISM STATE - {prod_role}: {PRODUCT_ID} "
             f"- match its construction exactly, ignore its background and lighting. ")
    if surface_ref:
        imgs.append(surface_ref)
        roles += ("Use Image 3 for the SCRATCHED SURFACE TEXTURE ONLY - dense fine light-grey claw-scuff "
                  "striations on the black pad, NOT white chalk lines. ")
    h = (" " + ANTI_HANDS + " " + ANTI_JEWEL + " " + SKIN) if hand else ""
    prompt = (roles + f"Scene: {scene_desc}. {SCENO}. {NEG_HINT}. {DOGTEX}. {ANTI_TEXT}.{h} "
              f"Photorealistic vertical 9:16 UGC smartphone photo, natural window light, slight grain.")
    return nano(prompt, imgs, out_name, tag)

def last(first_name, change, out_name, tag, ref_stanu, ref_role, hand=False):
    fu = upfr(first_name)
    ru = upref(ref_stanu)
    h = (" " + ANTI_HANDS + " " + ANTI_JEWEL + " " + SKIN) if hand else ""
    prompt = (f"Use Image 1 as the base: keep EXACTLY the same framing, lighting, background, camera angle, "
              f"the same corgi and the same room. Use Image 2 as the EXACT PRODUCT IDENTITY AND MECHANISM STATE "
              f"({ref_role}) - CORRECT any product drift or hallucination in the scene to match Image 2's construction. "
              f"Change ONLY: {change}. Do NOT add or remove product parts or dog legs/paws; keep {P['functional_count']}; "
              f"exactly one corgi with four legs. {NEG_HINT}. {DOGTEX}. {ANTI_TEXT}.{h}")
    return nano(prompt, [fu, ru], out_name, tag)

def board_first():
    first("a human hand lowers the unbranded Drapek scratch board onto the light-oak floor in front of the curious "
          "corgi and sets it down FLAT and level; the board is a thin flat slab, single continuous coarse black "
          "abrasive top, at its LEFT end a FLUSH black-topped sliding lid (level, in-plane, NOT a raised frame) with "
          "a black pull-loop; treat well fully hidden/closed; the corgi's ears perk up",
          "board_first.png", "v2_board_first", MECH_CLOSED, "CLOSED lid flush, thin flat slab", hand=True)
def board_last():
    last("board_first.png", "the hand has withdrawn and the board rests flat and level on the floor; the sliding lid "
         "stays FULLY FLUSH-CLOSED at the LEFT end (its black top level and in-plane with the rest of the black surface, "
         "showing only a thin seam line and the small black pull-loop - NO hole, NO opening, NO visible wooden well, NO "
         "round cutout), and the corgi leans in sniffing the closed black surface with ears up",
         "board_last.png", "v2_board_last", "mech-closed.png", "CLOSED flush lid, thin flat slab, well fully hidden", hand=True)
def reward_first():
    first("a human hand grips the black pull-loop at the LEFT end and has pulled the FLUSH black lid so it is now HALF "
          "SLID OUT flat and level sideways to the left (like a drawer cover sliding in-plane, staying flat, NOT tilted "
          "up, NOT lifted, NOT hinged), the lid becoming a separate flat black rectangle beside the board; the left half "
          "of the pale wooden well is uncovered at the LEFT end with a bit of brown kibble showing",
          "reward_first.png", "v2_reward_first", MECH_OPEN, "flush lid sliding flat sideways, well+kibble at end", hand=True)
def reward_last():
    last("reward_first.png", "the flush black lid has finished sliding FLAT and LEVEL sideways all the way OUT beyond the "
         "board outline at the LEFT end (it stays a flat black rectangle lying in-plane on the floor beside the board, "
         "NEVER tilted up, NEVER lifted, NEVER hinged), fully uncovering the pale wooden well recessed at that LEFT end "
         "with a few brown kibble treats inside, and the corgi dips its nose toward the open well",
         "reward_last.png", "v2_reward_last", "mech-open.png", "lid slid fully out FLAT sideways, well+kibble at end", hand=True)
def scratch_first():
    first("a closer bright shot of the flat board on the floor with the treat lid ALREADY SLID OPEN at the LEFT end "
          "(pale wooden well with brown kibble visible); the corgi's tan-and-white front paw pressed on the coarse "
          "black abrasive surface, claws down about to drag, a few faint fine pale-grey scuff streaks already on the "
          "black surface",
          "scratch_first.png", "v2_scratch_first", MECH_OPEN, "lid slid open, well+kibble at end", surface_ref=SCUFF)
def scratch_last():
    last("scratch_first.png", "the front paw has dragged down and back across the black surface leaving fresh FINE "
         "PALE-GREY claw-scuff striations (like Image 2, NOT white chalk), the other front paw lifting to scratch "
         "next, the open well with kibble still at the LEFT end",
         "scratch_last.png", "v2_scratch_last", "scratched-surface.png", "fine light-grey scuff striations NOT chalk")
def proof_first():
    first("a bright macro close-up of the flat black abrasive board top now covered in many FINE PALE-GREY claw-scuff "
          "striations (like Image 3, proof the claws are filed, NOT white chalk), the slid-open pale wooden well with "
          "kibble still at the LEFT end, the corgi's tan paw resting on the edge",
          "proof_first.png", "v2_proof_first", MECH_OPEN, "lid slid open, well+kibble at end", surface_ref=SCUFF)
def proof_last():
    last("proof_first.png", "the framing eases back a little to show the calm relaxed corgi sitting content beside the "
         "scratched flat board in the bright room, ears relaxed, the fine grey scratches and the open well still at "
         "the LEFT end",
         "proof_last.png", "v2_proof_last", "scratched-surface.png", "fine light-grey scuff striations NOT chalk")
def cta_last():
    last("cta_first.png", "the corgi taps its front paw once ON the black board and looks up content, a warm bright "
         "hero final frame that mirrors the opening room and light; the flush lid still slid open with kibble in the "
         "well at the LEFT end",
         "cta_last.png", "v2_cta_last", "mech-open.png", "lid slid open, well+kibble at end")

DISPATCH = {
    "board_first": lambda: board_first(), "board_last": lambda: board_last(),
    "reward_first": lambda: reward_first(), "reward_last": lambda: reward_last(),
    "scratch_first": lambda: scratch_first(), "scratch_last": lambda: scratch_last(),
    "proof_first": lambda: proof_first(), "proof_last": lambda: proof_last(),
    "cta_last": lambda: cta_last(),
}

if __name__ == "__main__":
    args = sys.argv[1:]
    global DOGREF_URL
    DOGREF_URL = upfr("dog-ref.png")
    MECH_CLOSED = upref("mech-closed.png")
    MECH_OPEN = upref("mech-open.png")
    SCUFF = upref("scratched-surface.png")

    for scene in args:
        if scene == "cta_first_inpaint":
            # inpaint v1 cta_first (wierny mechanizm-wzor) -> dodaj lape NA desce, zachowaj wysuw+wneke
            v1cta = fal.store(os.path.join(BASE, "frames_v1", "cta_first.png"), "drapek/v2_v1ctafirst.png")
            prompt = ("Use Image 1 as the base scene (a bright room, a corgi behind a flat scratch board whose black lid is "
                      "slid open at the LEFT end showing a pale wooden well with kibble). Use Image 2 only for the dog identity. "
                      "Change ONLY the corgi's pose so that it now rests ONE tan-and-white front paw ON TOP of the black "
                      "abrasive board surface (paw in contact with the board, product IN USE), calm and happy, looking up. "
                      "Keep EVERYTHING else identical: the same bright room, the same board, the flush lid slid open sideways "
                      "beyond the outline, the wooden well with brown kibble still at the LEFT end, the thin flat slab. "
                      f"Do NOT change the board construction; keep {P['functional_count']}; exactly one corgi four legs. "
                      f"{NEG_HINT}. {DOGTEX}. {ANTI_TEXT}.")
            nano(prompt, [v1cta, DOGREF_URL], "cta_first.png", "v2_cta_first_inpaint")
        else:
            DISPATCH[scene]()
        print("DONE scene:", scene, flush=True)

# -*- coding: utf-8 -*-
"""KLATKI STARTOWE masazer — DOKTRYNA 'EDYTUJ PRAWDE' (0i v3).
Kazda klatka = nano-EDYCJA realnego cropu produktu (KEEP piksele) + dorysowana persona/pokoj.
Start-frame dla kref (image_urls[0]) i para FLF (cta first=hook_first, cta_last).
Fazy: 1) hook/worn/heads (niezalezne, batch) 2) relief/cta_last (chain persony z hook_first).
Uruchamiaj: python genframes.py phase1 | phase2
ASCII printy."""
import os, sys, json
sys.path.insert(0, r"C:/tmp/video-factory/tools"); import fal
fal.set_project('masazer')

BASE = r"C:\tmp\video-factory\masazer"
FR = os.path.join(BASE, "gen"); os.makedirs(FR, exist_ok=True)
REFS = os.path.join(BASE, "refs")
BP = {s["id"]: s for s in json.load(open(os.path.join(BASE, "blueprint.json"), encoding="utf-8"))["sceny"]}

KEEP1 = ("Image 1 is a real product photo of a neck-and-shoulder massager. KEEP the massager EXACTLY as its "
         "pixels in Image 1 - same dark sage-green woven fabric pillow body, same chrome band, same front "
         "control panel, same two dark-green silicone hand-shaped massage heads (thumb and fingers), same brown "
         "leather strap; keep its geometry, construction and proportions. Do NOT redraw, reshape, re-colour or "
         "add parts to the device. Only replace the surroundings with the described scene and place the device "
         "naturally on the person.")
PERSONA = ("a young woman in her mid-20s with a messy dark bun and warm skin with natural pores, wearing a casual "
           "home tee, calm and relaxed")
COMMON = ("Photorealistic vertical 9:16 UGC smartphone photo, bright cozy bedroom, soft natural daytime window "
          "light, high-key, slight grain, natural skin texture with visible pores - NOT waxy, NOT airbrushed.")
ANTI = ("no readable text, no logos, no brand wordmark on the fabric, no numbers; any tiny control-panel icons "
        "are blurred and illegible; no glowing orange light, no LED glow; EXACTLY ONE massager in the scene; "
        "the woman's hands are empty and hold nothing; natural human hands, five fingers, no rings, no nail polish.")


def upref(name):  return fal.store(os.path.join(REFS, name), "masazer/ref_" + os.path.basename(name))
def upfr(name):   return fal.store(os.path.join(FR, name), "masazer/fr_" + name)

def nano(prompt, image_urls, out_name, tag):
    payload = {"prompt": prompt, "image_urls": image_urls, "num_images": 1,
               "output_format": "png", "aspect_ratio": "9:16"}
    res = fal.gen("fal-ai/nano-banana/edit", payload, tag=tag)
    url = (res.get("images") or [{}])[0].get("url")
    if not url: raise RuntimeError(f"nano no image: {str(res)[:300]}")
    out = os.path.join(FR, out_name); fal.download(url, out)
    print("SAVED", out_name, flush=True); return out


def first(scene_id, base_ref, person_ref=None):
    imgs = [upref(base_ref)]
    roles = KEEP1 + " "
    if person_ref:
        imgs.append(upfr(person_ref))
        roles += ("Image 2 is the FACE/IDENTITY reference ONLY - the same young woman (same face, hair, skin); "
                  "ignore its product and background. ")
    brief = BP[scene_id]["first_frame_brief_en"]
    # PLACEMENT (fix 19.07): jednoznaczne umiejscowienie z kontraktu — anty-"gardlo".
    placement = BP[scene_id].get("kontrakt_produktowy", {}).get("placement")
    plc = ""
    if placement:
        plc = (f" PLACEMENT (critical, must match reference): the massager is worn on the {placement}. "
               "Frame the shot from BEHIND-SIDE so the BACK of the neck is what we see; the silicone "
               "hand-fingers wrap the nape FROM BEHIND. The device must NOT sit on the throat or the "
               "front of the neck, and the person must NOT recline face-up with the throat exposed.")
    prompt = f"{roles}Scene: {brief} The person is {PERSONA}.{plc} {COMMON} {ANTI}"
    return nano(prompt, imgs, f"{scene_id}_first.png", f"fr_{scene_id}_first")


def cta_last():
    # cta_first = hook_first (reuse, echo). cta_last = knead deeper, keep product+scene identical.
    imgs = [upfr("hook_first.png")]
    prompt = ("Image 1 is the base scene photo - keep it EXACTLY: same bedroom, same framing, lighting, camera "
              "angle, same young woman and the SAME massager kept pixel-for-pixel identical (green woven body, "
              "chrome band, control panel, two silicone hand-heads, brown strap). Keep the massager on the NAPE / "
              "back of the neck / upper trapezius, seen from behind-side - NEVER on the throat or the front of the "
              "neck. Change ONLY: the silicone hand-fingers have kneaded a little deeper into the BACK of her neck "
              "and her shoulder has eased down a touch. Do NOT change the device shape, keep the two hand-heads, "
              "keep exactly one massager. " + COMMON + " " + ANTI)
    return nano(prompt, imgs, "cta_last.png", "fr_cta_last")


DEF = {
    "hook":   lambda: first("hook", "g0_worn.jpg"),
    "worn":   lambda: first("worn", "g2_left.jpg", person_ref="hook_first.png"),
    "heads":  lambda: first("heads", "g0_float.jpg"),
    "relief": lambda: first("relief", "g0_worn.jpg", person_ref="hook_first.png"),
    "cta_last": cta_last,
}

if __name__ == "__main__":
    args = sys.argv[1:] or ["phase1"]
    if args == ["phase1"]:
        DEF["hook"](); DEF["worn"](); DEF["heads"]()
    elif args == ["phase2"]:
        DEF["relief"](); DEF["cta_last"]()
    else:
        for a in args:
            DEF[a]()
    print("FRAMES", args, "DONE", flush=True)

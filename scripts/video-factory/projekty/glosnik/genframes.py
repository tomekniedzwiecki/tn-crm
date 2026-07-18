"""Generacja klatek nano-banana/edit dla projektu glosnik (gadzet-handsPOV).
Master-frame raz z packshotu Ali, reszta chainowana (anty-morf). Import fal z rdzenia."""
import os, sys, json
sys.path.insert(0, r"c:\repos_tn\tn-crm\scripts\video-factory")
import fal

BASE = r"C:\tmp\video-factory\glosnik"
FR = os.path.join(BASE, "frames")
KARTA = json.load(open(os.path.join(BASE, "KARTA.json"), encoding="utf-8"))
P = KARTA["product"]

PRODUCT_ID = (f"The product EXACTLY as its identity reference: {P['anatomy_str']}; "
             f"{P['functional_count']}. {P['exactly_one']}.")
ANTI_TEXT = ("no readable text, no logos, no brand names, no numbers on dials or labels; "
             "any tiny text must be blurred and illegible")
ANTI_HANDS = ("natural human hands, max two hands, five fingers each, no extra fingers, "
              "no fused fingers, no third arm")
SCENO = f"{KARTA['scenography']['layout']}. {KARTA['scenography']['swiatlo']}"

def nano(prompt, image_urls, out_name, tag):
    payload = {"prompt": prompt, "image_urls": image_urls, "num_images": 1,
               "output_format": "png", "aspect_ratio": "9:16"}
    res = fal.gen("fal-ai/nano-banana/edit", payload, tag=tag)
    url = (res.get("images") or [{}])[0].get("url")
    if not url:
        raise RuntimeError(f"nano no image: {str(res)[:300]}")
    out = os.path.join(FR, out_name)
    fal.download(url, out)
    print("SAVED", out, flush=True)
    return out

ANTI_JEWEL = "bare hands, no rings, no bracelets, no nail polish, no watch"

def up(name):
    return fal.store(os.path.join(FR, name), "glosnik/fr_" + name)

def first_from(ref_url, change, out_name, tag, hands=False):
    h = (" " + ANTI_HANDS + " " + ANTI_JEWEL) if hands else ""
    prompt = (f"Use Image 1 for the EXACT product identity, colors and anatomy - {PRODUCT_ID}. "
              f"Keep the same black device and the same dark desk scenography and lighting. "
              f"Change to: {change}. Do NOT add or remove any product parts; keep {P['functional_count']}. "
              f"{ANTI_TEXT}.{h}")
    return nano(prompt, [ref_url], out_name, tag)

def last_from(ref_url, change, out_name, tag, hands=False):
    h = (" " + ANTI_HANDS + " " + ANTI_JEWEL) if hands else ""
    prompt = (f"Keep EXACTLY the same framing, lighting, background, camera angle and product "
              f"position as this reference image. Change ONLY: {change}. "
              f"Do NOT add or remove any parts; keep {P['functional_count']}. No new objects, no new hands, "
              f"{ANTI_TEXT}.{h}")
    return nano(prompt, [ref_url], out_name, tag)

if __name__ == "__main__":
    step = sys.argv[1]
    if step == "master":
        pack = fal.store(os.path.join(BASE, "refs", "g3.jpg"), "glosnik/ref_g3.jpg")
        print("packshot url:", pack, flush=True)
        prompt = (f"Use Image 1 for the EXACT PRODUCT IDENTITY ONLY - {PRODUCT_ID} - "
                  f"ignore its original background and lighting. "
                  f"Scene: a single premium hero product shot of the black device standing on {SCENO}; "
                  f"the RGB edge-light glowing in a smooth magenta-to-cyan gradient; photorealistic, moody, "
                  f"shallow depth of field, vertical 9:16 framing. {ANTI_TEXT}.")
        nano(prompt, [pack], "master.png", "glosnik_master")

    elif step == "scenes":
        m = up("master.png")
        # HOOK
        first_from(m, "the RGB edge-light is OFF and dark (device unlit), a bare fingertip approaching the top edge of the head", "hook_first.png", "glosnik_hook_first", hands=True)
        hf = up("hook_first.png")
        last_from(hf, "the RGB edge-light now BLOOMS fully bright in a magenta-to-cyan gradient glow, the fingertip just touching the top edge, glow spilling on the desk", "hook_last.png", "glosnik_hook_last", hands=True)
        # PLACE
        first_from(m, "a bare hand enters from the top of frame lowering a modern smartphone toward the front lip of the stand, RGB still glowing", "place_first.png", "glosnik_place_first", hands=True)
        pf = up("place_first.png")
        last_from(pf, "the smartphone now rests upright seated in the front lip against the glowing panel, its screen a dim generic dark UI, the hand withdrawing", "place_last.png", "glosnik_place_last", hands=True)
        # CHARGE (from place_last, reframe closer)
        pl = up("place_last.png")
        first_from(pl, "a closer tighter framing on the seated phone against the glowing black panel, a faint concentric wireless-charging ripple starting at the contact point, shallow depth of field", "charge_first.png", "glosnik_charge_first")
        cf = up("charge_first.png")
        last_from(cf, "the RGB rim shifted hue along the gradient and pulsing brighter, the soft charging ripple expanded outward", "charge_last.png", "glosnik_charge_last")
        # REVEAL
        first_from(m, "a three-quarter FRONT view, a bare hand gripping the triangular base as if about to rotate the device, no phone present", "reveal_first.png", "glosnik_reveal_first", hands=True)
        rf = up("reveal_first.png")
        last_from(rf, "the device rotated about 80 degrees so its BACK faces camera: a round mesh speaker grille and a row of tiny top-edge buttons now visible, RGB rim still glowing at the edges, the hand still gripping the base", "reveal_last.png", "glosnik_reveal_last", hands=True)
        # HERO (master + phone)
        first_from(m, "a smartphone seated upright and charging on the stand against the glowing panel, hero wide-ish desk shot, magenta-cyan RGB bounce on the desktop", "hero_first.png", "glosnik_hero_first")
        hrf = up("hero_first.png")
        last_from(hrf, "a slightly tighter framing (slow push-in) with the RGB glow a touch brighter, everything else identical", "hero_last.png", "glosnik_hero_last")
        # CTA
        first_from(m, "a bare fingertip resting on the round chrome side knob of the device, hero framing", "cta_first.png", "glosnik_cta_first", hands=True)
        ctf = up("cta_first.png")
        last_from(ctf, "the fingertip has turned the chrome knob slightly and the RGB glow brightened in response", "cta_last.png", "glosnik_cta_last", hands=True)
        print("ALL SCENE FRAMES DONE", flush=True)

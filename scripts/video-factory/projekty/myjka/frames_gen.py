# -*- coding: utf-8 -*-
"""Generacja master-frame + klatek-kluczy (nano-banana/edit) z FLF-chainingiem.
Kazda first-frame chainuje z MASTERA (tozsamosc), kazda last-frame z wlasnej first (kadr).
Zapisuje frames/*.png + frames/urls.json (image_url/tail dla render FLF)."""
import sys, json, os, time
sys.path.insert(0, r'C:/tmp/video-factory/tools')
import fal

ROOT = r'C:/tmp/video-factory/myjka'
FR = os.path.join(ROOT, 'frames'); os.makedirs(FR, exist_ok=True)
K = json.load(open(os.path.join(ROOT, 'KARTA.json'), encoding='utf-8'))
P = K['product']; SC = K['scenography']

PRODUCT_ID = (f"The product EXACTLY as its identity reference: {P['anatomy_str']}; "
              f"{P['functional_count']} — this exact count, never more, never fewer. {P['exactly_one']}.")
ANTI_HANDS = "natural human hands, max two hands, five fingers each, no extra fingers, no fused fingers, no third arm"
ANTI_TEXT = ("no readable text, no logos, no brand names, no numbers on dials or labels; "
             "any tiny text must be blurred and illegible")
COMMON = (f"Photorealistic smartphone UGC POV look, natural realistic textures, slight grain, "
          f"handheld imperfection. {SC['layout']}. {SC['swiatlo']}. "
          f"The gun is RED and matte-black, absolutely NOT neon green, NOT lime, NOT yellow-green. "
          f"The gun body and battery are completely PLAIN: NO lettering, NO logo, NO brand name, "
          f"NO text of any kind on the housing. NO on-screen text, NO captions.")

def nano(image_urls, prompt, tag):
    res = fal.gen("fal-ai/nano-banana/edit",
                  {"prompt": prompt, "image_urls": image_urls, "num_images": 1,
                   "output_format": "png", "aspect_ratio": "9:16"}, tag=tag)
    url = (res.get("images") or [{}])[0].get("url")
    if not url: raise RuntimeError(f"no image for {tag}: {json.dumps(res)[:300]}")
    out = os.path.join(FR, tag + ".png"); fal.download(url, out)
    up = fal.store(out, f"myjka/frames/{tag}.png")   # URL dla renderu/chainingu
    print(f"  -> {tag} saved+stored"); return out, up

def first_from_master(master_url, brief, tag):
    pr = (f"Use Image 1 for the EXACT PRODUCT IDENTITY ONLY — {PRODUCT_ID} — keep the same gun, "
          f"ignore its background. You SHOULD change the camera distance and composition to match "
          f"the Scene; do not copy the reference framing, only the product identity. "
          f"Scene: {brief}. {COMMON} {ANTI_HANDS} {ANTI_TEXT}.")
    return nano([master_url], pr, tag)

def last_from_first(first_url, change, tag):
    pr = (f"Keep EXACTLY the same framing, lighting, background, camera angle and product position "
          f"as this reference image. Change ONLY: {change}. Do NOT add or remove any parts; keep "
          f"{P['functional_count']}. No new objects, no new hands. The gun stays RED and matte-black, "
          f"NOT neon green. {ANTI_TEXT}.")
    return nano([first_url], pr, tag)

BP = json.load(open(os.path.join(ROOT, 'blueprint.json'), encoding='utf-8'))
scenes = {s['id']: s for s in BP['scenes']}
urls = {}

# 1) MASTER = hook_first z packshotu
packshot_url = fal.store(os.path.join(ROOT, 'refs', 'packshot_clean.jpg'), "myjka/frames/packshot.jpg")
print("packshot stored")
mpr = (f"Use Image 1 for the EXACT PRODUCT IDENTITY ONLY — {PRODUCT_ID} — keep the same gun, "
       f"ignore its white background and any car photo. Scene: {scenes['hook']['frame_brief_first']}. "
       f"{COMMON} {ANTI_HANDS} {ANTI_TEXT}.")
_, master_url = nano([packshot_url], mpr, "myjka_hook_first")
urls['hook_first'] = master_url

# 2) hook_last
_, u = last_from_first(master_url, "a strong continuous water jet now blasts the wheel, sheets of grey grime and mud streaming off the spokes with the water, clean metal starting to show", "myjka_hook_last")
urls['hook_last'] = u

# 3-4) sweep
_, sf = first_from_master(master_url, scenes['sweep']['frame_brief_first'], "myjka_sweep_first"); urls['sweep_first'] = sf
_, u = last_from_first(sf, "the jet has swept toward the right; behind it a wide GLOSSY CLEAN wet mirror-shiny black stripe is revealed, dirt washed downward, the un-swept part still dull and dirty", "myjka_sweep_last"); urls['sweep_last'] = u

# 5-6) rinse
_, rf = first_from_master(master_url, scenes['rinse']['frame_brief_first'], "myjka_rinse_first"); urls['rinse_first'] = rf
_, u = last_from_first(rf, "the jet has blasted the sill clean, muddy water streams down onto the driveway, the rocker now wet glossy black", "myjka_rinse_last"); urls['rinse_last'] = u

# 7-8) reveal (wide clean car)
_, vf = first_from_master(master_url, scenes['reveal']['frame_brief_first'], "myjka_reveal_first"); urls['reveal_first'] = vf
_, u = last_from_first(vf, "the residual water has sheeted further down the glossy black paint, more deep-gloss reflection of the sky, a few droplets fall", "myjka_reveal_last"); urls['reveal_last'] = u

# 9-10) cta (hero)
_, cf = first_from_master(master_url, scenes['cta']['frame_brief_first'], "myjka_cta_first"); urls['cta_first'] = cf
_, u = last_from_first(cf, "the trigger is squeezed and a short crisp burst of water spray fires from the red nozzle tip, a few droplets flying, gun still hero in hand", "myjka_cta_last"); urls['cta_last'] = u

json.dump(urls, open(os.path.join(FR, 'urls.json'), 'w', encoding='utf-8'), indent=1)
print("ALL FRAMES DONE ->", os.path.join(FR, 'urls.json'))

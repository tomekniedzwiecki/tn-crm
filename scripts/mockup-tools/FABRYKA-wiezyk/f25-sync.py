# -*- coding: utf-8 -*-
"""Sync F2.5 (lp_styl_marka) do panelu dla WIEZYK: styl-master + branding + tokeny."""
import os, io, sys, json, importlib.util
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__)); MT = os.path.dirname(HERE)
spec = importlib.util.spec_from_file_location("panel_sync", os.path.join(MT, "panel-sync.py"))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
PROJ = "f7e2ef31-5faa-4a4c-ab96-64f66140c761"; PID = "a139b0e9-b3ad-4256-9ee9-f00775b8ea37"; SLUG = "wiezyk"
BRAND = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/wiezyk/brand/"
_cl = json.load(io.open(os.path.join(HERE, "checklists.json"), encoding="utf-8"))

# 1. upload styl-master -> bud-assets/wiezyk/styl-master.webp
sm_local = os.path.join(HERE, "out", "styl-master.png")
ps.storage_upload(sm_local, "bud-assets/wiezyk/styl-master.webp", max_width=1440, to_webp=True, quality=85)
sm_url = ps.public_url("bud-assets/wiezyk/styl-master.webp")
print("styl-master url:", sm_url)

# 2. krok lp_styl_marka done
fields = {
    "marka_nazwa": "Wieżyk",
    "slug": SLUG,
    "font": "Newsreader (display) + Source Sans 3 (text)",
    "paleta": "krem #FBF3E6 · akcent bursztyn #A5680C · ink #2C2925 (ΔE≥36 vs 4 poprzednie, WCAG 4,58:1)",
    "styl_master_url": sm_url,
    "tokens_url": "wf2-docs/wiezyk/TOKENS-MAKIETY.md",
    "brand_dir": "bud-assets/wiezyk/brand/",
}
checklist = [{"t": t, "done": True} for t in _cl["lp_styl_marka"]]
note = ("F2.5 OK. Styl-master (plansza DNA) gate PASS. Favicon TOP-1 = forteca/wieza z kotem w luku "
        "(6xT/N PASS). Wordmark Wiezyk z fontu Newsreader (diakrytyki OK), lockup favicon-lewa+wordmark-prawa. "
        "TOKENS-MAKIETY: Newsreader+Source Sans 3, akcent #A5680C, archetyp D. Pliki brand/ w Storage (11).")
ps.step_update(PROJ, PID, "lp_styl_marka", status="done", fields=fields, checklist=checklist, note=note)

# 3. artefakty: styl_master + branding
ps.artifact_add(PROJ, PID, "lp_styl_marka", "styl_master", sm_url, label="Styl-master (plansza DNA)",
                storage="supabase")
for fn, label, kind in [
    ("favicon-512.png", "Favicon Wiezyk (forteca+kot)", "branding"),
    ("wordmark.png", "Wordmark Wiezyk (Newsreader)", "branding"),
    ("logo-combo.png", "Lockup favicon+wordmark", "branding"),
    ("brand-context.png", "Brand-context (dowod @16/32/64)", "branding"),
]:
    ps.artifact_add(PROJ, PID, "lp_styl_marka", kind, BRAND + fn, label=label, storage="external")

# 4. doc TOKENS-MAKIETY.md -> wf2-docs
ps.doc_add(PROJ, PID, "lp_styl_marka", os.path.join(HERE, "TOKENS-MAKIETY.md"), SLUG, label="TOKENS-MAKIETY")
ps.doc_add(PROJ, PID, "lp_styl_marka", os.path.join(HERE, "LEDGER.md"), SLUG, label="LEDGER")

# 5. koszty twarde API (gpt-image)
ps.cost_add(PROJ, PID, 0.49, kind="gpt-image", currency="USD", step="lp_styl_marka")
print("F2.5 SYNC OK")

# -*- coding: utf-8 -*-
"""Emisje v2 (fix umiejscowienia KARK + polski lektor) do panelu tn-sklepy (masazer).
Nadpisuje deliverable w bud-assets/masazer/ads/ + archiwum PRIVATE wf2-video/video-factory/masazer/.
Noty avi_render_qa/avi_montaz = 'v2 ...', cost_add delty, activity. avi_final zostaje in_progress. ASCII printy."""
import os, importlib.util
spec = importlib.util.spec_from_file_location("panelsync", r"C:/repos_tn/tn-crm/scripts/mockup-tools/panel-sync.py")
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = "baacc66f-3dd0-462a-9799-de9c7aaea639"; PROD = "557ed2b0-61d5-4d2c-b811-62d9488ec62c"
BASE = r"C:/tmp/video-factory/masazer"; QA = os.path.join(BASE, "qa"); OUT = os.path.join(BASE, "out")
COST_V2 = 1.60  # delta v2 (est z ledgera: 3 klatki nano + 2 kref + 1 FLF + 4 VO = ~$1.60)

def up(local, dest, **kw): return ps.storage_upload(local, dest, **kw)

# ---- UPLOADY QA v2 (nadpisz zmienione gesta siatki + identity board + strip) ----
dense_urls = {}
for sid in ["hook", "relief", "cta"]:  # przebudowane sceny
    dense_urls[sid] = up(os.path.join(QA, "motion", f"{sid}_dense.jpg"), f"bud-assets/masazer/video/qa/siatka-ruchu-{sid}.jpg")
ib_url = up(os.path.join(QA, "identity_board.jpg"), "bud-assets/masazer/video/qa/identity-board.jpg")
strip_url = up(os.path.join(BASE, "final_strip.jpg"), "bud-assets/masazer/video/qa/final-strip.jpg")
prev_url = up(os.path.join(OUT, "kreacja_15s.mp4"), "bud-assets/masazer/video/preview/kreacja_15s.mp4", content_type="video/mp4")
print("UPLOADS QA/preview v2 OK")

# ---- KROK 7: avi_render_qa (nota v2) ----
ps.step_update(PROJ, PROD, "avi_render_qa", status="done",
    note=("v2 — fix umiejscowienia (kark) + polski lektor. BRAMKA GESTA W RUCHU (4fps, 20 klatek CALEJ sceny) + pkt 13 "
          "UMIEJSCOWIENIE==placement_ref (g0_worn.jpg). Przebudowane hook/relief/cta: urzadzenie na KARKU OD TYLU "
          "(nape/upper trapezius, behind-side), silikonowa dlon obejmuje kark od tylu — ZERO gardla we wszystkich klatkach "
          "(v1 kladl na GARDLE). worn/heads bez zmian (korpus na barku, juz OK). Werdykty umiejscowienia 5/5 PASS. "
          "product_gate fidelity PASS + IDENTITY BOARD CONSISTENT (produkt identyczny miedzy scenami, panel oiO, brazowy pasek)."))
for sid, u in dense_urls.items(): ps.artifact_add(PROJ, PROD, "avi_render_qa", "proof", u, label=f"v2 Siatka RUCHU 4fps — {sid} (kark od tylu)")
ps.artifact_add(PROJ, PROD, "avi_render_qa", "proof", ib_url, label="v2 Identity board (CONSISTENT)")
ps.cost_add(PROJ, PROD, COST_V2, kind="fal", step="ads_wideo", stage=5,
    note="masazer v2 — fix umiejscowienia (kark) + polski lektor (3 klatki + 2 kref + FLF + 4 VO)")

# ---- KROK 8: avi_montaz (nota v2) ----
ps.step_update(PROJ, PROD, "avi_montaz", status="done",
    note=("v2 — fix umiejscowienia (kark) + polski lektor. Remontaz 14.5 s, -14 LUFS, 30 fps (require_pass+sfx+fidelity). "
          "VO PRZEGENEROWANE z PELNYMI DIAKRYTYKAMI (Aria): 'Mialam koszmarny bol karku' -> 'Miałam koszmarny ból karku' itd. "
          "(v1 czytal ASCII 'BOL/NAPIECIE'). Napisy _subs.mp4 z known_text z diakrytykami (MIAŁAM, BÓL, WŁĄCZAM, NAPIĘCIE, "
          "ODPŁYWA, JUŻ). LOOP CLOSE zachowany (cta=echo hooka, kark od tylu). SFX/ambient bez zmian."))
ps.artifact_add(PROJ, PROD, "avi_montaz", "video", prev_url, label="v2 Kreacja 15s (kark od tylu + polski lektor)")
ps.artifact_add(PROJ, PROD, "avi_montaz", "proof", strip_url, label="v2 Strip finalu (5 scen)")

# ---- Archiwum + deliverable (NADPISZ) ----
priv1 = up(os.path.join(OUT, "kreacja_15s.mp4"), "video-factory/masazer/kreacja_15s.mp4", bucket="wf2-video", content_type="video/mp4")
priv2 = up(os.path.join(OUT, "kreacja_15s_subs.mp4"), "video-factory/masazer/kreacja_15s_subs.mp4", bucket="wf2-video", content_type="video/mp4")
ads_url = up(os.path.join(OUT, "kreacja_15s.mp4"), "bud-assets/masazer/ads/kreacja_15s.mp4", content_type="video/mp4")
subs_url = up(os.path.join(OUT, "kreacja_15s_subs.mp4"), "bud-assets/masazer/ads/kreacja_15s_subs.mp4", content_type="video/mp4")
print("ARCHIWUM + ADS (nadpisane) OK")

ps.creative_upsert("masazer", project_id=PROJ, product_id=PROD, status="qa",
    public_url=ads_url, variants={"subs": subs_url},
    storage_path="wf2-video/video-factory/masazer/kreacja_15s.mp4",
    notes="v2: fix umiejscowienia (hook/relief/cta na KARKU OD TYLU, nie gardle) + polski lektor z diakrytykami. "
          "worn/heads bez zmian. Delta v2 ~$1.60. Czeka na akcept Tomka.")

# ---- avi_final zostaje IN_PROGRESS (akcept = Tomek) ----
ps.step_update(PROJ, PROD, "avi_final", status="in_progress",
    note=("v2 gotowa do AKCEPTU: kreacja_15s.mp4 (+ _subs.mp4). Naprawione oba defekty: (1) umiejscowienie na KARKU OD TYLU "
          "(pkt 13 PASS 5/5), (2) polski lektor + napisy z diakrytykami. Delta v2 ~$1.60. Po akcepcie: video_status='done' + Meta."))
ps.product_meta(PROD, {"video_url": ads_url})
ps.activity_add(PROJ, "video_updated",
    "Reklama masazera v2: fix umiejscowienia (urzadzenie na karku od tylu, nie na gardle) + polski lektor z diakrytykami. Koszt v2 ~$1.60.")

print("PANEL EMIT v2 OK")
print("PUBLIC ADS:", ads_url)
print("SUBS:", subs_url)

# -*- coding: utf-8 -*-
"""Emisje v3 do panelu tn-sklepy (mapa PROCEDURA KROK 5/7/8). Dense siatki + preview + noty + koszt.
avi_final zostaje in_progress (czeka na akcept). Uzywa panel-sync.py (service-role, attachments public)."""
import sys, os
sys.path.insert(0, r"C:/repos_tn/tn-crm/scripts/mockup-tools")
import importlib.util
spec = importlib.util.spec_from_file_location("panelsync", r"C:/repos_tn/tn-crm/scripts/mockup-tools/panel-sync.py")
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = "baacc66f-3dd0-462a-9799-de9c7aaea639"
PROD = "9e4b1df9-41f4-407e-b41a-7a43adc122a6"
BASE = r"C:/tmp/video-factory/drapek"
QA = os.path.join(BASE, "qa")

def up(local, dest, **kw):
    return ps.storage_upload(local, dest, **kw)

# ---- 1. UPLOADY ----
# dense siatki ruchu (board = trim, scratch = c2)
dense = {
    "board": os.path.join(QA, "motion", "board_trim_dense.jpg"),
    "reward_a": os.path.join(QA, "motion", "reward_a_dense.jpg"),
    "reward_b": os.path.join(QA, "motion", "reward_b_dense.jpg"),
    "scratch": os.path.join(QA, "motion", "scratch__c2_dense.jpg"),
    "proof": os.path.join(QA, "motion", "proof_dense.jpg"),
}
dense_urls = {}
for sc, p in dense.items():
    dense_urls[sc] = up(p, f"bud-assets/drapek/video/qa/siatka-ruchu-v3-{sc}.jpg")

ib_url = up(os.path.join(QA, "identity_board_v3.jpg"), "bud-assets/drapek/video/qa/identity-board-v3.jpg")
strip_url = up(os.path.join(QA, "final_v3_strip.jpg"), "bud-assets/drapek/video/qa/final-v3-strip.jpg")
sheet_url = up(os.path.join(QA, "frames_sheet_v3.jpg"), "bud-assets/drapek/video/frames/frames-sheet-v3.jpg")
prev_url = up(os.path.join(BASE, "out", "kreacja_15s_v3.mp4"),
              "bud-assets/drapek/video/preview/kreacja_15s_v3.mp4", content_type="video/mp4")

print("UPLOADS OK")

# ---- 2. avi_klatki (done) ----
ps.step_update(PROJ, PROD, "avi_klatki", status="done",
    note=("v3 — doktryna EDYTUJ PRAWDE: kazda klatka produktowa = nano-EDYCJA packshotu (prod-open/"
          "prod-closed) z dorysowanym otoczeniem/psem wokol REALNYCH pikseli deski; produkt STATYCZNY "
          "w scenie (first+last z tej samej bazy, rozni sie tylko pies/dlon). 13 klatek nano. Korekta "
          "prawdy: wneka CENTER-RIGHT, pokrywa=osobna deseczka wysunieta w lewo, brak rantu, gruba deska."))
ps.artifact_add(PROJ, PROD, "avi_klatki", "proof", sheet_url, label="Klatki-klucze v3 (edytuj prawde)")

# ---- 3. avi_render_qa (done) ----
ps.step_update(PROJ, PROD, "avi_render_qa", status="done",
    note=("v3 — BRAMKA GESTA W RUCHU (fps4 5x4 CALEJ sceny, nie first/last). Werdykty: reward_a/reward_b/"
          "scratch(c2)/proof = PASS (geometria stabilna miedzy klatkami, brak rantu/tacki, brak zawiasu, "
          "pokrywa=osobna deseczka wysunieta w lewo, wneka center-right). board = well otwieral sie ~3.3s "
          "w ruchu -> TRIM do 2.55s (okno czyste, zweryfikowane gesta siatka). qa_gate PASS + product_gate "
          "fidelity PASS wszystkie + identity board CONSISTENT (brak morfu miedzy scenami)."))
for sc, u in dense_urls.items():
    ps.artifact_add(PROJ, PROD, "avi_render_qa", "proof", u, label=f"Siatka RUCHU v3 — {sc}")
ps.artifact_add(PROJ, PROD, "avi_render_qa", "proof", ib_url, label="Identity board v3 (CONSISTENT)")

# ---- 4. avi_montaz (done) ----
ps.step_update(PROJ, PROD, "avi_montaz", status="done",
    note=("v3 — doktryna EDYTUJ PRAWDE. Montaz 14.85 s, -14 LUFS, SFX/ambient osobna galezia. Zmiana stanu "
          "pokrywy = CIECIE reward_a(zamkniete)->reward_b(otwarte) + drewniane 'szzzk' (sfx_reward) NA CIECIU. "
          "VO first-person (Bill), muzyka dip pod scratch / peak na reveal, LOOP CLOSE (cta echo hooka)."))
ps.artifact_add(PROJ, PROD, "avi_montaz", "video", prev_url, label="Kreacja 15s v3 (preview)")
ps.artifact_add(PROJ, PROD, "avi_montaz", "proof", strip_url, label="Strip finalu v3 (7 scen)")

# ---- 5. avi_final (in_progress — czeka na akcept) ----
ps.step_update(PROJ, PROD, "avi_final", status="in_progress",
    note=("v3 gotowa: kreacja_15s_v3.mp4 (+ _subs.mp4). Doktryna edytuj-prawde utrzymana W RUCHU. "
          "Czeka na akcept Tomka; po akcepcie: final -> bud-assets/<slug>/ads/ + wpis wf2_creatives."))
ps.product_meta(PROD, {"video_status": "qa"})

# ---- 6. koszt + os czasu ----
ps.cost_add(PROJ, PROD, 2.607, kind="fal", step="ads_wideo", stage=5,
            note="drapek v3 fal (13 nano-edit + 6 Kling FLF)")
ps.activity_add(PROJ, "video_v3",
    "Reklama wideo v3 (doktryna 'edytuj prawde') gotowa do akceptu — mechanizm wierny W RUCHU; koszt v3 ~$2.61")

print("PANEL EMIT v3 OK")
print("PREVIEW:", prev_url)

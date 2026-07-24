# -*- coding: utf-8 -*-
"""F1 (lp_plan) + F2.5 (lp_styl_marka) panel-sync dla gadulek."""
import importlib.util, os, json
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("ps", os.path.join(HERE, "..", "panel-sync.py"))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PROJ = "f7e2ef31-5faa-4a4c-ab96-64f66140c761"
PROD = "c80ddb0c-1349-4a27-9e55-3da297473772"
SLUG = "gadulek"

# ── styl-master → Storage (bud-assets/<slug>/brand) ──
styl_url = ps.storage_upload(os.path.join(HERE, "brand", "00-styl-master.png"),
                             f"bud-assets/{SLUG}/brand/00-styl-master.webp",
                             to_webp=True, max_width=1536, quality=88)
print("styl_url", styl_url)

# branding URL-e z brand-forge (upload-urls.json)
up = json.load(open(os.path.join(HERE, "brand", "upload-urls.json"), encoding="utf-8"))

# ═══ F1 — lp_plan ═══
ps.doc_add(PROJ, PROD, "lp_plan", os.path.join(HERE, "PLAN.md"), SLUG, label="PLAN")
ps.doc_add(PROJ, PROD, "lp_plan", os.path.join(HERE, "PRZEWODNIK-GRAFICZNY.md"), SLUG, label="PRZEWODNIK GRAFICZNY")
PLAN_CHECK = [
    "Plan GPT gotowy (motyw ≠ „clean e-commerce\")",
    "Tabela CLAIM→ŹRÓDŁO: każda korzyść z kotwicą",
    "Jasne tła + CTA checkout + esencja produktu na scenach kluczowych",
    "Przewodnik graficzny: matryca osi wypełniona",
    "Reguła rytmu OK, człowiek ≥30%",
    "Krytyk przewodnika: PASS",
]
PLAN_FIELDS = {
    "motyw": "DWA OKIENKA. JEDNA PRZYGODA. — malinowa fala rozmowy (widzą się, nie tylko słyszą)",
    "sekcje": "hero · opinie · jak-działa(TOR-I) · zastosowania(mozaika ≥5) · mid-cta · anatomia(TOR-I) · porównanie · zdjęcia-od-kupujących · [wideo=blokada-tomek] · specyfikacja-zestaw · faq · zamów · final",
    "paleta": "malina #C5265B + krem #FFF8EF/#FFFDF9/#FFE9DC + ink #3C1F28 · Fredoka + Alegreya Sans",
    "plan_url": "wf2-docs/gadulek/PLAN.md",
    "przewodnik_url": "wf2-docs/gadulek/PRZEWODNIK-GRAFICZNY.md",
}
ps.step_update(PROJ, PROD, "lp_plan", status="done", fields=PLAN_FIELDS,
               checklist=[{"t": t, "done": True} for t in PLAN_CHECK])
ps.cost_add(PROJ, PROD, 0.25, kind="wf2-gpt", currency="USD", step="lp_plan",
            note="gpt-5.6-sol plan F1 (2 wywolania, ~14.5k in/21k out, szac.)", created_by="fabryka")

# ═══ F2.5 — lp_styl_marka ═══
ps.doc_add(PROJ, PROD, "lp_styl_marka", os.path.join(HERE, "TOKENS-MAKIETY.md"), SLUG, label="TOKENS-MAKIETY")
# artefakty: styl_master + branding
ps.artifact_add(PROJ, PROD, "lp_styl_marka", "styl_master", styl_url, label="styl-master (DNA serii)")
for fname, kind_label in [("favicon-512.png", "favicon"), ("wordmark.png", "wordmark"),
                          ("logo-combo.png", "lockup (favicon+wordmark)"),
                          ("brand-context.png", "brand-context (dowód @16/32/64)")]:
    u = up.get(fname)
    if u:
        ps.artifact_add(PROJ, PROD, "lp_styl_marka", "branding", u, label=kind_label)
STYL_CHECK = [
    "Styl-master ×1 gotowy (gate: motyw↔korzyść, jasno, produkt wierny)",
    "Nazwa zarezerwowana w bud_brand_names (INSERT-or-fail)",
    "Favicon: N=4-6 → selektor @32px → werdykt vision top-2",
    "Wordmark wyrenderowany Z FONTU landingu (nie gpt-image)",
    "Lockup: favicon LEWA + wordmark PRAWA",
    "Pliki brand/ obejrzane i wgrane do Storage",
    "Werdykt rubryką 6×T/N (32/16/metafora/flat/zero liter/mono) — bez 6×T = FAIL",
    "Kompozyt kontekstowy brand-context.png → wf2_artifacts",
]
STYL_FIELDS = {
    "marka_nazwa": "Gadulek",
    "slug": "gadulek",
    "font": "Fredoka (display) + Alegreya Sans (text)",
    "paleta": "#C5265B / #FFF8EF #FFFDF9 #FFE9DC / #3C1F28",
    "styl_master_url": styl_url,
    "tokens_url": "wf2-docs/gadulek/TOKENS-MAKIETY.md",
    "brand_dir": "bud-assets/gadulek/brand/",
}
ps.step_update(PROJ, PROD, "lp_styl_marka", status="done", fields=STYL_FIELDS,
               checklist=[{"t": t, "done": True} for t in STYL_CHECK])
ps.cost_add(PROJ, PROD, 0.25, kind="openai-image", currency="USD", step="lp_styl_marka",
            note="styl-master gpt-image-2 HIGH 1536x1024", created_by="fabryka")
ps.cost_add(PROJ, PROD, 1.00, kind="openai-image", currency="USD", step="lp_styl_marka",
            note="6 faviconow gpt-image-2 HIGH 1024x1024", created_by="fabryka")
print("F1+F2.5 SYNC OK")

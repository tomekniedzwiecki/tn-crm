#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""F2.5 Zaglądek -> panel: artefakty (styl_master + branding lockup + branding brand-context),
doc TOKENS-MAKIETY.md, krok lp_styl_marka=done (checklista VERBATIM + fields + note werdyktu)."""
import sys, importlib.util, os
for _s in (sys.stdout, sys.stderr):
    try: _s.reconfigure(encoding="utf-8")
    except Exception: pass
ROOT = r"C:/repos_tn/tn-crm"
spec = importlib.util.spec_from_file_location("panelsync", ROOT + "/scripts/mockup-tools/panel-sync.py")
ps = importlib.util.module_from_spec(spec); sys.modules["panelsync"] = ps; spec.loader.exec_module(ps)

PROJECT = "bc92c138-5101-4919-a7f5-d4d75b17daba"
PRODUCT = "6429b12f-5f77-47ab-a9fa-1de04f07f2e2"
STEP = "lp_styl_marka"
SLUG = "zagladek"
PB = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/zagladek/brand/"

STYL_URL = PB + "00-styl-master.webp"
COMBO_URL = PB + "logo-combo.png"
CTX_URL = PB + "brand-context.png"

# ── artefakty (miniatury/chip) ──
ps.artifact_add(PROJECT, PRODUCT, STEP, "styl_master", STYL_URL,
                label="Styl-master — plansza DNA serii (paleta/Archivo+IBM Plex/viewfinder brackets/CTA amber)",
                storage="supabase")
ps.artifact_add(PROJECT, PRODUCT, STEP, "branding", COMBO_URL,
                label="Lockup Zaglądek — favicon (oko w ciemnej szczelinie) LEWA + wordmark PRAWA",
                storage="supabase")
ps.artifact_add(PROJECT, PRODUCT, STEP, "branding", CTX_URL,
                label="Brand-context (DOWÓD @16/32/64 + lockupy, oba tła; po relightcie dark-safe)",
                storage="supabase")

# ── doc TOKENS-MAKIETY.md -> prywatny wf2-docs, klikalny chip ──
ps.doc_add(PROJECT, PRODUCT, STEP, ROOT + "/FABRYKA-zagladek/TOKENS-MAKIETY.md", SLUG,
           label="TOKENS-MAKIETY — Zaglądek (KANON + PARTYTURA + :root)")

# ── krok lp_styl_marka = done ──
CHECKLIST = [
 {"t": "Styl-master ×1 gotowy (gate: motyw↔korzyść, jasno, produkt wierny)", "done": True},
 {"t": "Nazwa zarezerwowana w bud_brand_names (INSERT-or-fail)", "done": True},
 {"t": "Favicon: N=4-6 → selektor @32px → werdykt vision top-2", "done": True},
 {"t": "Wordmark wyrenderowany Z FONTU landingu (nie gpt-image)", "done": True},
 {"t": "Lockup: favicon LEWA + wordmark PRAWA", "done": True},
 {"t": "Pliki brand/ obejrzane i wgrane do Storage", "done": True},
 {"t": "Werdykt rubryką 6×T/N (32/16/metafora/flat/zero liter/mono) — bez 6×T = FAIL", "done": True},
 {"t": "Kompozyt kontekstowy brand-context.png → wf2_artifacts", "done": True},
]
FIELDS = {
 "marka_nazwa": "Zaglądek",
 "styl_master_url": STYL_URL,
 "brand_dir": "bud-assets/zagladek/brand/",
}
NOTE = (
 "Styl-master PASS (1 iter): komplet DNA (paleta+2 fonty z rolami+radius 12+ikony outline+trust-pill"
 "+głębia+sygnatura viewfinder brackets), plansza jasna, produkt wierny jako kotwica koloru; nit: "
 "pierścień LED na kaflu PRODUKT ~10 vs 8 — egzekwowane downstream na realnych scenach (multi-ref "
 "dryf-gate); fakt '8 LED' poprawny w big-numbers i ikonie. | Werdykt marki 6×T/N (zwycięzca m0-0 "
 "'oko/soczewka w ciemnej szczelinie'): 1 @32 T · 2 @16 oba tła T (po relightcie) · 3 metafora=korzyść "
 "'zajrzyj w nieznane' T · 4 flat 2 kolory T · 5 zero liter T · 6 mono T. Top-2 z różnych konceptów: "
 "m0-0 vs m1-0 (sonda-pętla+światło; runner-up, sylwetka czyta jak karabińczyk/'8'). | REKOLORACJA: "
 "TAK — pkt.2 @16 na CIEMNYM failował (dwutonowy znak: ciemne panele znikały na ciemnym tle, mono wyszedł "
 "jasny palette[2]). Relight: mono→ciemny #211B14, master_dark (panele→ciepła jasność #EAE2D2, oko "
 "bursztyn zostaje), przebudowa logo-combo-dark + brand-context (rząd ciemny na dark-safe), re-upload na "
 "te same ścieżki. | Najsłabsza rzecz znaku: dwutonowość — pojedynczy favicon zakładki na b. ciemnym "
 "pasku redukuje się do bursztynowego oka (dark-safe wariant żyje w combo-dark/context, nie w 1 pliku tab)."
)
ps.step_update(PROJECT, PRODUCT, STEP, status="done", note=NOTE, fields=FIELDS, checklist=CHECKLIST)
print("PANEL OK — 3 artefakty + doc + krok lp_styl_marka=done")

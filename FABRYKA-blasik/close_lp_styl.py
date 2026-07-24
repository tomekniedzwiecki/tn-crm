# -*- coding: utf-8 -*-
import importlib.util
spec = importlib.util.spec_from_file_location(
    "panelsync", r"C:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py")
ps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ps)

PROJECT = "bc92c138-5101-4919-a7f5-d4d75b17daba"
PRODUCT = "78dc560d-bf39-4eb0-bfd9-991ea7824cc2"
SLUG = "blasik"
PUB = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/blasik/brand/"

# ── artefakty ──────────────────────────────────────────────────────────────
ps.artifact_add(PROJECT, PRODUCT, "lp_styl_marka", "styl_master",
                PUB + "00-styl-master.webp",
                label="Styl-master — plansza DNA (Gabarito/Karla · żółć COB · ((·)))",
                meta={"aspect": "3:2", "gate": "PASS iter 1/2",
                      "dna": "paleta·2 fonty·radius 12·ikony outline·trust-pill·sygnatura ((·))·bounded-mrok"})

ps.artifact_add(PROJECT, PRODUCT, "lp_styl_marka", "branding",
                PUB + "logo-combo.png",
                label="Lockup: favicon (snop w kole) LEWA + wordmark Blasik PRAWA",
                meta={"font": "Gabarito-Bold", "wordmark": "z fontu landingu (nie gpt-image)"})

ps.artifact_add(PROJECT, PRODUCT, "lp_styl_marka", "branding",
                PUB + "brand-context.png",
                label="brand-context — dowód @16/32/64 (jasny+ciemny) + lockupy",
                meta={"werdykt": "6×T/N PASS (top-1 m1-0)",
                      "rubryka": "32:T · 16:T · metafora:T · flat:T · zero-liter:T · mono:T",
                      "koncept": "snop światła cięty w żółtym kole + kropka-źródło (wedge of light + source dot)",
                      "diversity": "3 metafory (łuk-promieni / klin-snopu / iskra-włącznika) × 2",
                      "rekoloracja_znaku": "BRAK — żółć #D9BE00 czytelna @16/32 na jasnym I ciemnym UI",
                      "mono_fix": "favicon-mono przekolorowany #1B1406 (paleta[2]=paper dawała near-white)",
                      "najslabsza": "abstrakcyjna metafora — może czytać się jako wskaźnik/gauge; ratuje kontekst marki"})

# ── doc TOKENS-MAKIETY ──────────────────────────────────────────────────────
ps.doc_add(PROJECT, PRODUCT, "lp_styl_marka",
           r"C:\repos_tn\tn-crm\FABRYKA-blasik\TOKENS-MAKIETY.md",
           slug=SLUG, label="TOKENS-MAKIETY.md (KANON + PARTYTURA + :root)")

# ── krok lp_styl_marka done (checklista VERBATIM) ──────────────────────────
checklist = [
 {"t": "Styl-master ×1 gotowy (gate: motyw↔korzyść, jasno, produkt wierny)", "done": True},
 {"t": "Nazwa zarezerwowana w bud_brand_names (INSERT-or-fail)", "done": True},
 {"t": "Favicon: N=4-6 → selektor @32px → werdykt vision top-2", "done": True},
 {"t": "Wordmark wyrenderowany Z FONTU landingu (nie gpt-image)", "done": True},
 {"t": "Lockup: favicon LEWA + wordmark PRAWA", "done": True},
 {"t": "Pliki brand/ obejrzane i wgrane do Storage", "done": True},
 {"t": "Werdykt rubryką 6×T/N (32/16/metafora/flat/zero liter/mono) — bez 6×T = FAIL", "done": True},
 {"t": "Kompozyt kontekstowy brand-context.png → wf2_artifacts", "done": True},
]

fields = {
 "Styl-master": "1 plansza DNA 3:2 — gate PASS (iter 1/2)",
 "Marka": "Blasik (bud_brand_names 26874369 — idempotentnie)",
 "Favicon": "6 kand. / 3 metafory → top-1 m1-0 (snop w kole + kropka); 6×T PASS",
 "Fonty": "display Gabarito 700/800 · text Karla 400/600/700",
 "Akcent": "#D9BE00 (żółć COB) · CTA-ink #1B1406 (taxi-sign)",
 "Sygnatura": "łuk czujnika / promień ((·))",
}

note = ("F2.5 done: styl-master DNA (Gabarito/Karla, żółć #D9BE00 + ciemny ink CTA #1B1406, radius 12, "
        "sygnatura ((·)) łuk czujnika, bounded-mrok) — gate PASS iter 1/2 (motyw↔korzyść: SWIAT = snop "
        "w bounded-zmierzch; jasno #F2F1EC; produkt wierny c-lit: czarny korpus + żółto-limonkowa COB). "
        "Branding: 6 faviconów / 3 różne metafory → werdykt RUBRYKĄ 6×T/N top-1 m1-0 (snop światła cięty "
        "w kole + kropka-źródło = „światło tam gdzie patrzysz”); 6×T PASS, BEZ rekoloracji znaku (żółć "
        "czytelna @16/32 na jasnym I ciemnym w brand-context); favicon-mono przekolorowany #1B1406 "
        "(paleta[2]=paper dawała near-white). Wordmark z fontu Gabarito-Bold (NIE gpt-image); lockup "
        "favicon+wordmark (jasny/ciemny). TOKENS-MAKIETY.md (KANON+PARTYTURA z uzasadnieniami+:root css, "
        "--gal-aspect 3/2). Pliki brand/ obejrzane i w Storage (11 + mono-fix + styl webp).")

sid = ps.step_update(PROJECT, PRODUCT, "lp_styl_marka", status="done",
                     note=note, fields=fields, checklist=checklist)
print("lp_styl_marka done →", sid)

# ── koszty F2.5 → wf2_costs (stage 2, kind openai-image) ───────────────────
ps.cost_add(PROJECT, PRODUCT, 0.25, kind="openai-image", currency="USD",
            step="lp_styl_marka", stage=2,
            note="F2.5 styl-master gpt-image-2 (lokalny OpenAI HIGH) 1536x1024 — szacunek")
ps.cost_add(PROJECT, PRODUCT, 1.50, kind="openai-image", currency="USD",
            step="lp_styl_marka", stage=2,
            note="F2.5 branding: 6 faviconow gpt-image-2 (lokalny OpenAI) 1024x1024; wordmark z fontu = 0 — szacunek")
print("costs F2.5 zapisane (0.25 styl + 1.50 branding)")

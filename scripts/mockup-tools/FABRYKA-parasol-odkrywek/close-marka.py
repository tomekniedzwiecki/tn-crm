#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Zamkniecie kroku 'marka' Odkrywek: status=done + fields + checklista VERBATIM + nota."""
import importlib.util, os, sys
for _s in (sys.stdout, sys.stderr):
    try: _s.reconfigure(encoding="utf-8")
    except Exception: pass
ROOT = r"C:\repos_tn\tn-crm"; os.chdir(ROOT)
spec = importlib.util.spec_from_file_location("panelsync", os.path.join(ROOT,"scripts","mockup-tools","panel-sync.py"))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

PID = "f7e2ef31-5faa-4a4c-ab96-64f66140c761"
BR  = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/parasol-odkrywek/brand"

fields = {
    "nazwa": "Odkrywek",
    "domena": "odkrywek.pl",
    "tagline": "Każdy produkt to małe odkrycie",
    "opis": ("Odkrywek to miejsce, w którym dobrze wybrane rzeczy do domu same znajdują właściciela. "
             "Przeglądamy setki produktów i wybieramy te naprawdę przydatne — sprytne, solidne, takie, które "
             "ułatwiają codzienność całej rodzinie. Zamiast przytłaczać wyborem, podajemy Ci perełki, które "
             "chce się mieć u siebie."),
    "kolory": ("primary #E2613A (persymona — znak i CTA) · secondary #1E7D71 (morska głębia — akcenty/odkrycia) · "
               "ink #3A2A24 (kakaowy brąz — tekst, wordmark) · highlight #F6C98B (ciepły piaskowy — tinty sekcji) · "
               "tło #FBF4E9 (kremowa bawełna) · muted #7A6A5E (kawa z mlekiem — tekst drugorzędny) — jasne tła"),
    "fonty": "Fraunces (nagłówki, Black — wordmark) / Figtree (tekst) — latin-ext",
    "logo_url": BR + "/logo-combo.png",
    "favicon_url": BR + "/favicon-256.png",
}

checklist = [ {"t": t, "done": True} for t in [
    "Shortlista nazw pojemnych z WOLNYMI domenami .pl (RDAP/WHOIS) + web-check kolizji",
    "Nazwa wybrana → project.name (top-3 + rekomendacja w notatce)",
    "Tagline + opis marki → pola projektu (zasilą stronę główną)",
    "Paleta 6 hex (JASNE tła) + fonty latin-ext → pola projektu",
    "Logo lockup + favicon (selektor @32px) wgrane do Storage brand/",
    "Artefakty w wf2_artifacts (kind=brand) + koszty w wf2_costs",
    "Domena wybrana i wolna → project.domain (zakup = krok Domena marki)",
    "Werdykt rubryką 6×T/N (32/16/metafora/flat/zero liter/mono) — bez 6×T = FAIL",
    "Kompozyt kontekstowy (favicon @16/32/64 jasne+ciemne, lockupy) → wf2_artifacts",
]]

note = ("Top-3: Odkrywek (wybrany — czyste pole kolizyjne, każdy produkt to odkrycie) / "
        "Konkretek (pole zatłoczone: konkret.pro i in.) / Dogodnik. "
        "Shortlista+RDAP wykonane wcześniej — WOLNE .pl: konkretek/dogodnik/odkrywek/sprycik/perelek/zmyslnik/trafek; "
        "ZAJĘTE: pewniak/wygodnik/usprawnik/bystrzak/pomocnik/przydatnik/celnik/fajnik. "
        "Znak: dom z iskrą odkrycia (kandydat m2-0 — wybór VISION nad skryptowym top-1 m0-0=iskra; "
        "runda 1 odrzucona na bramce @16px/liczba kolorów, runda 2 = koncepty bold jednokolorowe). "
        "Rubryka 6×T PASS (32/16/metafora/flat/zero liter/mono); najsłabsze: sylwetka domu w oderwaniu od "
        "wordmarku może sugerować kategorię dom/nieruchomości. "
        "Paleta: persymona #E2613A + morska głębia #1E7D71 + kakaowy brąz #3A2A24 na kremie #FBF4E9 (jasne tła). "
        "Fonty: Fraunces (Black — wordmark) / Figtree — latin-ext.")

sid = ps.step_update(PID, None, "marka", status="done", note=note, fields=fields, checklist=checklist)
print("STEP marka closed → id", sid)

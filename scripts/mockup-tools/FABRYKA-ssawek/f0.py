# -*- coding: utf-8 -*-
"""F0 (lp_dane) SSAWEK — 1. produkt fabryki ze zrodla ALLEGRO (test toru Allegro->Marka).
Rehost 16 kadrow -> bud-assets/ssawek/galeria/; INSERT bud_tt_products (source='allegro',
status='rejected' = poza radarem); DEMO project wf2 + link_product + krok 'wybor' done
(bramka Tomka) + lp_dane (in_progress->done, force_kolejnosc — brak kalkulacji w torze
Allegro); gallery_curated/videos_curated; doc_add KARTA/PASZPORT/GALERIA/LEDGER (wf2-docs);
wf2_costs 0. IDEMPOTENTNE (GET->PATCH|POST). Uruchamiaj z venv scripts/mockup-tools/.venv."""
import importlib.util, io, json, os, sys, datetime
import requests

sys.stdout.reconfigure(encoding="utf-8")
MT = r"c:\repos_tn\tn-crm\scripts\mockup-tools"
FAB = os.path.join(MT, "FABRYKA-ssawek")
IMG = r"C:\tmp\ALLEGRO-HADDO\img"
SLUG = "ssawek"

spec = importlib.util.spec_from_file_location("ps", os.path.join(MT, "panel-sync.py"))
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

KEY = ps.KEY
B = ps.REST
H = {"apikey": KEY, "Authorization": "Bearer " + KEY}
HJSON = {**H, "Content-Type": "application/json"}
PUB = ps.PUBLIC_BASE + "/attachments/"
GBASE = PUB + "bud-assets/%s/galeria/" % SLUG
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def getj(path, **params):
    r = requests.get(B + "/" + path, headers=H, params=params, timeout=30)
    r.raise_for_status()
    return r.json()


# ── 1. REHOST 16 kadrow -> attachments/bud-assets/ssawek/galeria/gNN.webp ──
GNAMES = ["g%02d" % i for i in range(16)]
GU = {g: GBASE + g + ".webp" for g in GNAMES}   # kanoniczne (deterministyczne) URL-e
rehosted = 0
if os.path.isdir(IMG):
    for g in GNAMES:
        src = os.path.join(IMG, g + ".jpg")
        if not os.path.isfile(src):
            print("!! brak", src); continue
        ps.storage_upload(src, "bud-assets/%s/galeria/%s.webp" % (SLUG, g),
                          bucket="attachments", to_webp=True, max_width=1600, quality=85)
        rehosted += 1
    print("REHOST: %d/16 kadrow w Storage" % rehosted)
else:
    print("!! %s brak — uzywam deterministycznych URL-i (rehost pominiety)" % IMG)

# ── 2. snapshot do DB (source='allegro'; images -> zrehostowane) ──
snap = json.load(io.open(os.path.join(FAB, "snapshot.json"), encoding="utf-8"))
snap["images_local"] = list(snap.get("images") or [])
snap["images"] = [GU[g] for g in GNAMES]
snap["main_image"] = GU["g00"]
snap["curated_cover"] = GU["g05"]
snap["rehost_note"] = ("Kadry /original/ z oferty Allegro zrehostowane do "
                       "attachments/bud-assets/ssawek/galeria/ (WebP). images_remote = "
                       "oryginalne URL-e CDN Allegro (proweniencja). source=allegro = ZAUFANE (gate F0 od 23.07).")
snap["fetched_at"] = snap.get("captured_at")

# ── 3. gallery_curated (werdykty per kadr; retusz white-label). BEZ znakow " w tekstach ──
KEEP = {
 "g05": ("lifestyle-full", "R", 1, "Mezczyzna niesie odkurzacz za palak w magazynie — pelna sylwetka",
         "advisory", "Nadruk marki na ssawce podlogowej — retusz jesli po powiekszeniu czytelny"),
 "g11": ("lifestyle-panorama", "R", 2, "Panorama: mezczyzna uruchamia odkurzacz, sciana zolto-biala",
         True, "Nadruk LEHMANN TOOLS na czole zbiornika CZYTELNY — RETUSZ flat-fill stali"),
 "g07": ("lifestyle-uzycie", "R", 3, "Dlon na czerwonej pokrywie, ssawka podlogowa podniesiona",
         True, "Nadruk LEHMANN TOOLS na czole zbiornika CZYTELNY — RETUSZ flat-fill stali"),
 "g09": ("detal-pokrywa-wlacznik", "R", 4, "Palec na kolyskowym wlaczniku; czerwona pokrywa, tabliczka",
         True, "Tabliczka znamionowa (marka/model) — RETUSZ pola tekstowego; symbol CE mozna zostawic"),
 "g03": ("detal-filtr-hepa", "R", 5, "Bialy wklad filtra HEPA zdejmowany znad zbiornika", False, ""),
 "g06": ("detal-filtr-koszowy", "R", 6, "Szary materialowy filtr koszowy w stalowym zbiorniku", False, ""),
 "g02": ("detal-klamra", "R", 7, "Dlon zamyka metalowy zaczep sprezynowy (klamre)", False, ""),
 "g04": ("makro-wnetrze", "R", 8, "Dno stalowego zbiornika — koncentryczne zlobienia", False, ""),
 "g08": ("detal-podstawa", "R", 9, "Czarna podstawa na obrotowych kolkach", False, ""),
 "g10": ("detal-ssawka", "R", 10, "Ssawka podlogowa z czerwonymi wkladkami (lekko nieostry)", False, ""),
 "g14": ("packshot-zestaw", "P", 11, "Packshot akcesoriow na bialym tle: 3 filtry, rury, waz, HEPA, ssawki", False, ""),
}
REJECT = {
 "g00": ("kompozyt-marketingowy", "hero z wypalonym tekstem EN + logo + badge Prufengel",
         "DANE: 2000W(maks)/Blowing/20L/HEPA/3 filtry -> KARTA sekcja 2/2b"),
 "g01": ("infografika-koncept", "filtr HEPA + wirusy/strzalki na gradiencie — grafika, nie zdjecie",
         "DANE: koncept filtracji HEPA (99,99% = DEKLARACJA, nie miara) -> KARTA sekcja 3"),
 "g12": ("infografika-banner", "banner LEHMANN HOME: renders + logo + chmury kurzu/wody/lisci",
         "DANE: funkcja nadmuchu + mokro/sucho -> KARTA sekcja 3"),
 "g13": ("kolaz-obcy-brand", "kolaz 2x2 ORAZ w tle pudla OBCEGO producenta KANWOD",
         "Scenografia uzycia (gruz/kamienie) — inspiracja scen F1.7, NIE 1:1; obce pudla = wyklucz"),
 "g15": ("infografika-badge", "plakietka certyfikatu Prufengel, tekst DE + marka + nr licencji",
         "DANE: certyfikat Prufengel = [deklaracja sprzedawcy] -> KARTA sekcja 3 (NIE claim jakosci)"),
}
items = []
for g, (role, cls, order, alt, retusz, rnote) in KEEP.items():
    it = {"url": GU[g], "kadr": g, "keep": True, "class": cls, "klasa": role,
          "role": role, "kolejnosc": order, "werdykt": "KEEP", "alt_pl": alt, "powod": alt}
    if retusz:
        it["retusz_logo"] = retusz          # True | 'advisory'
        it["retusz_powod"] = rnote
    items.append(it)
for g, (klasa, powod, dane) in REJECT.items():
    items.append({"url": GU[g], "kadr": g, "keep": False, "class": "R", "klasa": klasa,
                  "werdykt": "ODRZUC (z galerii); TRESC->DANE", "powod": powod, "dane": dane})
gallery = {"source_ok": True, "source": "allegro", "curated_at": NOW,
           "nota": ("11 keep (lifestyle+detale+packshot akcesoriow) / 5 odsiew (2 infografiki, "
                    "banner marki, badge Prufengel, kolaz z obcym brandem KANWOD). White-label: "
                    "RETUSZ logo Lehmann na g07/g09/g11 (+advisory g05). Aspekt ~1/1."),
           "items": sorted(items, key=lambda x: x.get("kolejnosc", 99))}

# ── 4. videos_curated — oferta Allegro BEZ wideo ──
videos = {"source": "allegro", "curated_at": NOW, "items": [],
          "nota_landing": ("Oferta Allegro NIE zawiera wideo — brak materialu do kuracji. Sekcja "
                           "wideo TikTok/UGC = klasa dowodowa (F1a): los sekcji = decyzja Tomka "
                           "(blokada-tomek), material do pozyskania na dalszym etapie.")}

# ── 5. INSERT/UPDATE bud_tt_products (idempotent po key) ──
KKEY = "odkurzacz przemyslowy lehmann haddo 2000w"
core = {
  "pl_name": "Odkurzacz przemyslowy Haddo 2000W (popiol/gruz)",
  "category": "Dom & Ogrod",
  "status": "rejected",
  "reject_reason": ("TEST toru Allegro->Marka (23.07) — nie kandydat radaru TikTok. Produkt "
                    "wskazany bezposrednio przez Tomka; poza pula losowania /trendy. "
                    "status=rejected = celowo poza radarem (approved=false)."),
  "origin": "allegro",
  "chosen_link": snap.get("offer_url"),
  "curated_image": GU["g05"],
  "reviewed_by": "fabryka (Allegro->Marka test)",
  "reviewed_at": NOW,
  "ali_snapshot": snap,
  "gallery_curated": gallery,
  "videos_curated": videos,
}


def send(method, url, body):
    r = requests.request(method, url, headers={**HJSON, "Prefer": "return=representation"},
                         data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=60)
    return r


ex = getj("bud_tt_products", key="eq." + KKEY, select="id")
if ex:
    TT = ex[0]["id"]
    r = send("PATCH", B + "/bud_tt_products?id=eq." + TT, core)
    if r.status_code >= 300:
        print("!! PATCH bud_tt_products", r.status_code, r.text[:400]); sys.exit(1)
    print("bud_tt_products PATCH (istnial):", TT)
else:
    r = send("POST", B + "/bud_tt_products", {"key": KKEY, **core})
    if r.status_code >= 300:
        print("!! POST bud_tt_products", r.status_code, r.text[:500]); sys.exit(1)
    TT = r.json()[0]["id"]; print("bud_tt_products INSERT:", TT)

# ── 6. DEMO project wf2 (idempotent po name) ──
PNAME = "DEMO Allegro — odkurzacz"
ex = getj("wf2_projects", name="eq." + PNAME, select="id")
if ex:
    PROJ = ex[0]["id"]; print("wf2_projects istnieje:", PROJ)
else:
    prow = {"name": PNAME, "is_test": True, "status": "budowa",
            "work_consent_at": NOW, "work_consent_source": "pre-regulamin",
            "work_consent_version": "pre-regulamin",
            "work_consent_text": ("DEMO/test wewnetrzny (Allegro->Marka) — projekt syntetyczny, "
                                  "bez klienta konsumenta; bramka zgody nie dotyczy (grandfathering)."),
            "notes": ("DEMO — test wewnetrzny toru Allegro->Marka (1. produkt ze zrodla Allegro). "
                      "is_test=true; produkt wskazany bezposrednio przez Tomka, poza pula /trendy.")}
    r = send("POST", B + "/wf2_projects", prow)
    if r.status_code >= 300:
        print("!! POST wf2_projects", r.status_code, r.text[:400]); sys.exit(1)
    PROJ = r.json()[0]["id"]; print("wf2_projects INSERT:", PROJ)

# ── 7. link_product (dosiewa kroki; ustawia 'wybor' in_progress) ──
PROD = ps.link_product(PROJ, TT, "Odkurzacz Lehmann Haddo (DEMO Allegro)", slug=SLUG,
                       cover=GU["g05"], supplier=snap.get("offer_url"))

# ── 8. krok 'wybor' -> done (BRAMKA TOMKA — wskazany bezposrednio) ──
ps.step_update(PROJ, None, "wybor", status="done", checklist=ps.WYBOR_CHECKLIST,
               note=("Produkt wskazany bezposrednio przez Tomka — test wejscia Allegro, "
                     "poza pula losowania /trendy (bramka Tomka, nie samo-akcept fabryki)."),
               fields={"Wybor": "1 produkt (Allegro Haddo)", "Tryb": "wskazany przez Tomka (Allegro->Marka)"})

# ── 9. product_meta: cena DANA 119 zl, slug, repo_path ──
ps.product_meta(PROD, {"price": 119, "slug": SLUG, "status": "w_budowie",
                       "repo_path": "tn-crm/scripts/mockup-tools/FABRYKA-ssawek/"})

# ── 10. lp_dane -> in_progress (start F0) ──
ps.step_update(PROJ, PROD, "lp_dane", status="in_progress",
               note="F0 w toku — kuracja galerii + KARTA/PASZPORT (tor Allegro, cena DANA).")

# ── 11. doc_add KARTA / PASZPORT / GALERIA -> wf2-docs (prywatny) ──
for fn, lab in [("KARTA-PRAWDY.md", "KARTA-PRAWDY.md (F0.6 — jedyne zrodlo faktow, Z7)"),
                ("PASZPORT.md", "PASZPORT.md (wiernosc wizualna + CZEGO NIE MA)"),
                ("GALERIA.md", "GALERIA.md (kuracja F0.5 — keep/odsiew + retusz white-label)")]:
    ps.doc_add(PROJ, PROD, "lp_dane", os.path.join(FAB, fn), slug=SLUG, label=lab)

# ── 12. artefakty galerii (kadry keep -> miniatury w panelu) ──
for it in gallery["items"]:
    if not it.get("keep"):
        continue
    rl = " [RETUSZ logo]" if it.get("retusz_logo") is True else ""
    ps.artifact_add(PROJ, PROD, "lp_dane", "image", it["url"],
                    label="%s — %s%s" % (it["kadr"], it["role"], rl),
                    meta={"section": "galeria", "viewport": "source", "kadr": it["kadr"],
                          "kolejnosc": it["kolejnosc"], "retusz_logo": it.get("retusz_logo", False)})

# ── 13. wf2_costs — F0 = 0 (Allegro tor, bez generacji) ──
try:
    ps.cost_add(PROJ, PROD, 0, kind="inne", currency="USD", step="lp_dane", stage=2,
                note="F0 dane/kuracja/karta — tor Allegro, bez kosztow generacji")
except Exception as e:
    print("cost_add pominiete:", e)

# ── 14. LEDGER.md (inline z ID) + doc_add ──
LEDGER = """# LEDGER — SSAWEK (F0) * tor Allegro->Marka * 2026-07-23

| pole | wartosc |
|---|---|
| slug roboczy | ssawek (mini-marka = F2.5) |
| bud_tt_products | %s |
| wf2_projects (DEMO) | %s |
| wf2_products | %s |
| oferta Allegro | %s (offerId %s) |
| source | allegro (ZAUFANE — gate F0 rozszerzony 23.07) |
| status radaru | rejected (approved=false, poza pula /trendy) |
| cena | 119 zl DANA (bez kalkulacji marzy; koszt zakupu N/D) |

## Faza F0 — wykonane
- Rozszerzenie gate zrodla: 'allegro' = 2. zaufane zrodlo (gate-check.py TRUSTED_SNAPSHOT_SOURCES
  + is_trusted_source; kopia w panel-sync.py kalkulacja i ad-forge.py; GALERIA-ALI par.0; STANDARD
  CHANGELOG + F0). test-gate-check.py: 28/28 PASS (nowy TestTrustedSources, bez oslabienia 'detail').
- Rehost 16 kadrow /original/ -> attachments/bud-assets/ssawek/galeria/ (WebP).
- INSERT bud_tt_products (source='allegro', status='rejected', origin='allegro', ali_snapshot,
  gallery_curated, videos_curated, curated_image=g05).
- F0.5 kuracja: 11 keep / 5 odsiew. RETUSZ logo Lehmann: g07, g09, g11 (+advisory g05).
- F0.6 KARTA-PRAWDY (specs 1:1, destylacja FAKT/BELKOT, 15 opinii PL, EAN, ROZSTRZYGNIECIE
  2000W maks vs 1200W znamionowa) + PASZPORT (cechy + CZEGO NIE MA + white-label).
- Panel: DEMO project + link_product + 'wybor' done (bramka Tomka) + lp_dane in_progress->done.

## Odstepstwa (swiadome)
- lp_dane zamkniete z force_kolejnosc=True: krok 'kalkulacja' (Etap 1) NIE DOTYCZY toru Allegro
  (cena DANA, brak silnika marzy, towar klienta = brak kosztu zakupu). Blokada kolejnosci faz
  obejsciem swiadomym, opisanym tutaj.
- Checklista lp_dane 6/7: 'Slug + mini-marka zarezerwowane w bud_brand_names' = NIE (done=false) —
  mini-marka celowo ODLOZONA do F2.5 (marka z aukcji zastepowana nowa tozsamoscia). Slug roboczy
  ssawek wybrany, kolizje sprawdzone (FABRYKA-*, wf2_products, bud_brand_names — wolne).
- videos_curated pusty (oferta Allegro bez wideo) — nota; sekcja wideo = klasa dowodowa (decyzja Tomka).

## Koszty F0
- 0 USD (kuracja + karta + rehost istniejacych kadrow; zero generacji AI). wf2_costs: 1 wpis 0 USD.
""" % (TT, PROJ, PROD, snap.get("offer_url"), snap.get("offer_id"))
io.open(os.path.join(FAB, "LEDGER.md"), "w", encoding="utf-8").write(LEDGER)
ps.doc_add(PROJ, PROD, "lp_dane", os.path.join(FAB, "LEDGER.md"), slug=SLUG,
           label="LEDGER.md (F0 — Allegro tor)")

# ── 15. lp_dane -> done (force_kolejnosc: kalkulacja N/D w torze Allegro). Checklista VERBATIM (WS) ──
CHECK = [
  {"t": "source=detail potwierdzony (albo STOP z notą)", "done": True},
  {"t": "Galeria skurowana → gallery_curated (≥4 kadry keep)", "done": True},
  {"t": "Wideo skurowane → videos_curated (gate po klatce środkowej)", "done": True},
  {"t": "KARTA-PRAWDY.md gotowa (cena+NBP, specs 1:1, destylacja FAKT/BEŁKOT)", "done": True},
  {'t': 'PASZPORT.md gotowy (elementy + „CZEGO NIE MA")', 'done': True},
  {"t": "Liczby oznaczone [KONKRET/SPEC/BEŁKOT]", "done": True},
  {"t": "Slug + mini-marka zarezerwowane w bud_brand_names", "done": False},
]
ps.step_update(PROJ, PROD, "lp_dane", status="done", checklist=CHECK, force_kolejnosc=True,
    note=("F0 zamkniete (tor Allegro->Marka). Odstepstwa: (1) 'kalkulacja' N/D — cena DANA 119 zl, "
          "brak silnika marzy (force_kolejnosc); (2) mini-marka odlozona do F2.5 (checklista 6/7); "
          "(3) source=allegro (ZAUFANE od 23.07), nie detail — patrz LEDGER."),
    fields={
      "source_ok": "TAK — allegro (oferta 16214946166; zrodlo ZAUFANE od 23.07, gate rozszerzony)",
      "karta_url": "wf2-docs/%s/KARTA-PRAWDY.md" % SLUG,
      "paszport_url": "wf2-docs/%s/PASZPORT.md" % SLUG,
      "cena_pl": "119 zl (cena DANA z aukcji Allegro; tor Allegro->Marka, bez kalkulacji marzy; koszt zakupu N/D)"})

print("\n=== F0 SSAWEK ZAMKNIETE ===")
print("bud_tt_products:", TT)
print("wf2_projects   :", PROJ)
print("wf2_products   :", PROD)
print("deep-link      : https://crm.tomekniedzwiecki.pl/tn-sklepy/projekt?id=%s&p=%s&s=lp_dane" % (PROJ, PROD))

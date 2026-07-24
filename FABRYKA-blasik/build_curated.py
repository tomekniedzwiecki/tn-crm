# -*- coding: utf-8 -*-
import requests, json
from datetime import datetime, timezone

PROJECT = "yxmavwkwnfuphjqbelws"
REST = f"https://{PROJECT}.supabase.co/rest/v1"
TT = "baecb0e1-681f-45a0-88b5-3f69d75985da"
GAL = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/blasik/gallery"
ALI = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-products/1005006997875182"
SHOP = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-shop-imgs/latarka-czolowa-led-biat/0.jpg"

key = None
for line in open(r"C:\repos_tn\tn-crm\.env", encoding="utf-8", errors="replace"):
    line = line.strip()
    if line.startswith("SUPABASE_SERVICE_KEY="):
        key = line.split("=", 1)[1].strip().strip('"').strip("'"); break
H = {"apikey": key, "Authorization": "Bearer " + key,
     "Content-Type": "application/json", "Prefer": "return=minimal"}
now = datetime.now(timezone.utc).isoformat()

gallery = {
  "source_ok": True,
  "product_id": "1005006997875182",
  "curated_at": now,
  "uwaga": ("Czysty packshot ISTNIEJE — wycięty z kompozytu g0 (c-off zgaszony, c-lit zapalony, białe tło). "
            "F3 może użyć realnych packshotów jako referencji (multi-ref: c-off + c-lit + c-worn + diagram g4). "
            "Nadruki obcej marki (Heinast/BIAT): BRAK na produkcie w KAŻDYM kadrze → retusz marki niepotrzebny. "
            "Kadry zawierały jedynie ikony funkcji (power, czujnik-machnięcie, czerwony wskaźnik baterii). "
            "Żółte łuki czujnika (overlay-obwódka) usunięte z c-lit/c-off/c-night ciasnym cropem + flat-fill."),
  "items": [
    {"url": f"{GAL}/c-lit.webp", "keep": True, "role": "hero-ref/glowny", "class": "R",
     "klasa": "packshot-czysty", "werdykt": "CROP z g0 (1100px)", "crop_bbox": [30, 420, 1090, 652],
     "kolejnosc": 1, "powod": "czysty render zapalonej latarki wycięty z kompozytu g0, białe tło, zero tekstu",
     "alt_pl": "Latarka czołowa z zapaloną szeroką listwą COB i skupionym reflektorem XPE, na białym tle",
     "dowodzi_zastosowania": "źródło światła — listwa COB + reflektor punktowy zapalone jednocześnie"},
    {"url": f"{GAL}/c-off.webp", "keep": True, "role": "packshot", "class": "R",
     "klasa": "packshot-czysty", "werdykt": "CROP z g0 (1100px)", "crop_bbox": [30, 12, 1090, 243],
     "kolejnosc": 2, "powod": "czysty render zgaszonej latarki (drugi kąt) z kompozytu g0, białe tło",
     "alt_pl": "Latarka czołowa zgaszona — reflektor punktowy XPE, listwa COB i przyciski sterowania"},
    {"url": f"{GAL}/c-worn.webp", "keep": True, "role": "detal-noszenie", "class": "R",
     "klasa": "detal", "werdykt": "CROP z g0 (1100px)", "crop_bbox": [760, 795, 1098, 1098],
     "kolejnosc": 3, "powod": "render pokazujący sposób noszenia (na głowie) z kompozytu g0",
     "alt_pl": "Latarka założona na głowę — elastyczna opaska z listwą COB na czole, wolne ręce",
     "dowodzi_zastosowania": "noszenie na głowie — światło tam gdzie patrzysz, wolne ręce"},
    {"url": f"{GAL}/c-night.webp", "keep": True, "role": "lifestyle-noc", "class": "R",
     "klasa": "lifestyle-czysty", "werdykt": "CROP z g1 (1000px)", "crop_bbox": [55, 118, 958, 350],
     "kolejnosc": 4, "powod": "zapalona latarka na tle nocnego nieba, wycięta znad siatki trybów g1 (bez tekstu)",
     "alt_pl": "Zapalona latarka czołowa (jasna listwa COB) na tle nocnego nieba",
     "dowodzi_zastosowania": "użycie nocą na dworze (kemping / outdoor / bieganie)"},
    {"url": f"{GAL}/c-splash.webp", "keep": True, "role": "dowod-wodoodpornosc", "class": "R",
     "klasa": "detal", "werdykt": "CROP z g5 (1000px)", "crop_bbox": [25, 600, 990, 990],
     "kolejnosc": 5, "powod": "produkt ochlapany wodą, dolna część g5 (bez wypalonego tekstu)",
     "alt_pl": "Latarka czołowa ochlapana wodą — dowód odporności na deszcz (IPX4)",
     "dowodzi_zastosowania": "odporność na wodę/deszcz (IPX4)"},

    {"url": f"{ALI}/g0.webp", "keep": False, "klasa": "kolaż",
     "werdykt": "DANE + CROP",
     "powod": ("kompozyt 2 sztuk (zgaszona + zapalona) + 2 kable USB + render noszenia + żółte łuki czujnika (overlay); "
               "zero wypalonego TEKSTU, ale grafiki-obwódki; czyste rendery wycięte (c-lit, c-off, c-worn)")},
    {"url": f"{ALI}/g1.webp", "keep": False, "klasa": "infografika-z-tekstem",
     "werdykt": "DANE + CROP",
     "powod": ("wypalony EN '6 LIGHTING MODES' + siatka: COB High/Low, XPE High/Low, SOS Strobe, Motion Sensor "
               "(potwierdza 6 trybów → Karta/copy); górny render nocny wycięty (c-night)")},
    {"url": f"{ALI}/g2.webp", "keep": False, "klasa": "infografika-z-tekstem",
     "werdykt": "ODRZUĆ (dane=BEŁKOT)",
     "powod": ("wypalony '230° Wide Beam + 350 Lumens' — 230° SPRZECZNE ze spec Beam Angle=180°, "
               "350 lm bez kotwicy w specs → oba BEŁKOT-CUT; porównanie OURS vs OTHERS = tandeta; brak czystej strefy")},
    {"url": f"{ALI}/g3.webp", "keep": False, "klasa": "infografika-z-tekstem",
     "werdykt": "DANE",
     "powod": ("wypalony EN; dane: ładowanie USB (gniazdko/powerbank/komputer/auto), 'not support usb-c to usb-c pd', "
               "czas pracy 2,5–8 h (infografika, nie spec), IPX4, odporność na uderzenia; 350 lm = BEŁKOT; cały kadr tekstowy")},
    {"url": f"{ALI}/g4.webp", "keep": False, "klasa": "diagram-schemat",
     "werdykt": "DANE",
     "powod": ("labeled diagram anatomii (XPE LED, COB LED, przyciski ON/OFF + czujnik, czerwony wskaźnik baterii, "
               "silikonowy korpus, elastyczna opaska + klamra) = kotwica PASZPORTU; spec-ikony: 3,7V/1200mAh Li, "
               "czas pracy 2,5 h, ładowanie 2,5 h, odporność 1 m, IPX4, machnięcie; leader-lines na całym kadrze")},
    {"url": f"{ALI}/g5.webp", "keep": False, "klasa": "infografika-z-tekstem",
     "werdykt": "DANE + CROP",
     "powod": ("wypalony 'IPX4 WATERPROOF' + pływak w deszczu (tekst na kadrze) → DANE (IPX4); "
               "dolny render produktu w wodzie wycięty (c-splash)")},
    {"url": f"{ALI}/g6.avif", "keep": False, "klasa": "duplikat-wariant",
     "werdykt": "ODRZUĆ",
     "powod": "kompozyt jak g0 w 480px (niższa rozdzielczość) — g0 1100px jest źródłem cropów"},
    {"url": SHOP, "keep": False, "klasa": "kolaż/doklejka-sklepowa",
     "werdykt": "ODRZUĆ",
     "powod": ("okładka sklepowa (bud-shop-imgs, POZA galerią detail Ali) — kompozyt z klipsami/hakami spoza oferty "
               "(sku = paczki 1/2/3/5 szt., nie klipsy); g0 lepszym źródłem cropów; nie na główną galerię")}
  ]
}

videos = {
  "source": "brak",
  "curated_at": now,
  "note": ("tiktok_url = null oraz tt_shop.videos puste — 0 klipów DODANYCH do produktu. "
           "Sekcja WIDEO NIE powstaje (stan danych, LL-044: N dodanych = N kafli, 0 = brak sekcji). "
           "Wzorzec ads_wideo (Etap 5): brak — do ustalenia później."),
  "items": []
}

r = requests.patch(f"{REST}/bud_tt_products?id=eq.{TT}", headers=H,
                   data=json.dumps({"gallery_curated": gallery, "videos_curated": videos,
                                    "updated_at": now}, ensure_ascii=False).encode("utf-8"))
print("PATCH", r.status_code, r.text[:300])

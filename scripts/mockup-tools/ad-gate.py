#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ad-gate.py — bramka POMIAROWA statycznych grafik reklamowych (FB/IG), paczka W5.
SSOT: docs/zbuduje/STANDARD-GRAFIKI-SKLEPY.md (fazy G3–G5, zasady ZG3/ZG6).

Skrypt daje DOWODY i POMIARY deterministyczne — werdykt jakosciowy robi agent (Sonnet)
wg SSOT (dwie pary oczu). Trzy sita mierzalne:
  (a) MINIATURY 320px kazdej grafiki  -> test czytelnosci w rozmiarze feedu (ZG6),
  (b) SAFE-ZONE dla plikow *_916*      -> overlay stref (gora 14% / dol 35% / boki 6%)
      + raport krawedziowy, czy tekst/tresc nie wpada w strefy zaslaniane przez UI Stories,
  (c) pHASH pairwise miedzy katami tego samego formatu -> flaga zbyt podobnych katow (ZG3
      „3 katy = 3 byty"). Prog podobienstwa udokumentowany nizej.
Wynik: report.json (w katalogu dowodow) + czytelny stdout PASS/FLAG.

Konwencja nazw (D2): 4:5 => ad_<n>_<angle>.png ; 9:16 => ad_<n>_<angle>_916.png.
Parser rozpoznaje TEZ kanoniczny rehost D6: ad_<angle>_<fmt>.png (np. ad_demo_45.png) — dzieki temu
bramka roznorodnosci dziala rowniez na plikach pobranych z bud-assets/<slug>/ads/.
Katy: demo / problem / lifestyle (default) + proof (opcjonalny) — parser tolerancyjny: bierze cokolwiek po numerze / przed formatem.

Uzycie:
  python ad-gate.py <katalog_png> [--out <katalog_dowodow>] [--thumb-width 320]
                                  [--similar-max 10] [--borderline 18]
Exit: 0 = brak FLAG ; 1 = >=1 FLAG (ADWIZORYJNIE — nie zastepuje werdyktu agenta).

Zaleznosci: Pillow (wymagane). imagehash uzywane gdy dostepne (pHash), inaczej wbudowany
dHash na samym Pillow (bez nowych zaleznosci). Dziala na Windows.
"""
import os, sys, re, json, argparse, datetime
from PIL import Image, ImageDraw, ImageFilter, ImageFont

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# --- imagehash opcjonalnie; fallback = wlasny dHash 64-bit na Pillow ---
try:
    import imagehash  # noqa
    HASH_ALGO = "phash"
except Exception:
    imagehash = None
    HASH_ALGO = "dhash-fallback"

# ------------------------------------------------------------------ PROGI (udokumentowane)
# pHash 64-bit: katy KONCEPCYJNIE rozne maja zwykle Hamming >20. Nakladajace sie kadry/layout
# spadaja nisko. FLAG (za podobne, ryzyko ZG3) gdy dystans <= SIMILAR_MAX; strefa BORDERLINE
# to „sprawdz wizualnie". Progi dobrane pod near-dup; dzialaja tez dla dHash (nieco luzniej).
SIMILAR_MAX = 10          # <= => FLAG: katy zbyt podobne
BORDERLINE  = 18          # (SIMILAR_MAX, BORDERLINE] => nota „borderline"
# Safe-zone 9:16 (Stories/Reels) — frakcje wysokosci/szerokosci zaslaniane/marginesy:
SZ_TOP   = 0.14           # gorne 14% zaslania UI
SZ_BOTL  = 0.35           # dolne 35% zaslania UI (pasek + CTA)
SZ_SIDE  = 0.06           # boki 6% marginesu
# Heurystyka krawedziowa (proxy „tresc/tekst", BEZ OCR): udzial „mocnych" pikseli krawedzi.
# Danger liczony NA PODWIERSZACH (~24px): pojedyncza linia tekstu/logo daje lokalny SZCZYT gestosci,
# ktory usrednienie calego 35% pasma by rozmylo. Flaga = szczyt podwiersza w strefie zaslanianej.
EDGE_STRONG = 64          # prog jasnosci na obrazie FIND_EDGES (0..255) = „mocna krawedz"
ROW_H = 24                # wysokosc podwiersza (px) do skanu gestosci
DANGER_ROW_FRAC = 0.06    # szczyt podwiersza >6% mocnych krawedzi w strefie zaslanianej => NOTA „tresc zaslaniana"
                          # (adwizoryjne: pelne kadry foto tez to podbija — agent potwierdza na overlayu)
IMG_EXT = (".png", ".jpg", ".jpeg", ".webp")

# ------------------------------------------------------------------ util
def parse_name(fname):
    """Dwie konwencje nazw -> (n:int|None, angle:str, fmt:str, rozpoznane:bool):
       (1) Manus (surowe):   ad_<n>_<angle>[_<fmt>].<ext>  (wiodaca CYFRA = numer kreacji);
       (2) rehost D6 (kan.):  ad_<angle>_<fmt>.<ext>        (kat SLOWEM, format CYFRA).
       Brak sufiksu formatu w (1) => '45' (back-compat). OBIE daja poprawny KAT, zeby bramka
       roznorodnosci ZG3 (pHash pairwise per format) miala co porownywac niezaleznie od tego, czy
       operator karmi skrypt plikami z Manusa czy rehostami z bud-assets/<slug>/ads/ (inaczej kat='?'
       -> diff_angle=False dla kazdej pary -> cichy PASS bez analizy katow)."""
    # (1) Manus: ad_<n>_<angle>[_<fmt>]  (zachowanie 1:1 z poprzednia wersja)
    m = re.match(r"^ad_(\d+)_([a-z]+)(?:_(\d+))?\.[a-z0-9]+$", fname, re.I)
    if m:
        return (int(m.group(1)), m.group(2).lower(), m.group(3) if m.group(3) else "45", True)
    # (2) rehost D6: ad_<angle>_<fmt>  (np. ad_demo_45.png / ad_problem_916.png)
    m = re.match(r"^ad_([a-z]+)_(\d+)\.[a-z0-9]+$", fname, re.I)
    if m:
        return (None, m.group(1).lower(), m.group(2), True)
    return (None, "?", "?", False)

def phash_int(pil):
    """64-bitowy hash percepcyjny jako int. imagehash.phash gdy dostepne, inaczej wlasny dHash."""
    if imagehash is not None:
        return int(str(imagehash.phash(pil.convert("L"))), 16)
    # dHash 8x8: porownanie sasiednich pikseli w wierszu (resize 9x8).
    g = pil.convert("L").resize((9, 8), Image.LANCZOS)
    px = list(g.getdata())
    bits = 0
    for row in range(8):
        base = row * 9
        for col in range(8):
            bits = (bits << 1) | (1 if px[base + col] > px[base + col + 1] else 0)
    return bits

def hamming(a, b):
    return bin(a ^ b).count("1")

def expected_ar(fmt):
    """Oczekiwany aspekt W/H dla formatu (do sanity-check proporcji)."""
    if fmt == "45":
        return 0.8      # 1080x1350
    if fmt == "916":
        return 0.5625   # 1080x1920
    return None

def _strong_frac(region):
    """Udzial 'mocnych' pikseli krawedzi w regionie (histogram L, bez numpy)."""
    h = region.histogram()
    total = sum(h) or 1
    return sum(h[EDGE_STRONG:]) / total

def band_edge(edge_img, x0, x1, y0, y1):
    """(frakcja_srednia, szczyt_podwiersza) dla prostokata. Szczyt lapie skoncentrowana
       linie tekstu/logo, ktora srednia calego pasma by rozmyla."""
    x0 = max(0, int(x0)); y0 = max(0, int(y0))
    x1 = min(edge_img.width, int(x1)); y1 = min(edge_img.height, int(y1))
    if x1 - x0 < 2 or y1 - y0 < 2:
        return (0.0, 0.0)
    band = edge_img.crop((x0, y0, x1, y1))
    mean = _strong_frac(band)
    peak = 0.0
    bh = band.height
    for ry in range(0, bh, ROW_H):
        row = band.crop((0, ry, band.width, min(bh, ry + ROW_H)))
        peak = max(peak, _strong_frac(row))
    return (mean, peak)

def _font(sz):
    try:
        return ImageFont.truetype("arial.ttf", sz)
    except Exception:
        return ImageFont.load_default()

# ------------------------------------------------------------------ (a) miniatura 320
def make_thumb(pil, out_dir, base, width):
    w, h = pil.size
    nh = max(1, round(h * width / w))
    thumb = pil.convert("RGB").resize((width, nh), Image.LANCZOS)
    outp = os.path.join(out_dir, base + "_%d.png" % width)
    thumb.save(outp)
    return outp

# ------------------------------------------------------------------ (b) safe-zone 9:16
def safe_zone(pil, out_dir, base):
    """Overlay stref + raport krawedziowy. Zwraca dict pomiarow albo None."""
    W, H = pil.size
    edge = pil.convert("L").filter(ImageFilter.FIND_EDGES)
    # FIND_EDGES zostawia jasna ramke 1-2px na krawedziach obrazu (artefakt jadra 3x3) — zerujemy,
    # zeby nie zawyzala gestosci w gornym/dolnym pasmie.
    ImageDraw.Draw(edge).rectangle([0, 0, W - 1, H - 1], outline=0, width=2)
    xL, xR = SZ_SIDE * W, (1 - SZ_SIDE) * W
    y_top = SZ_TOP * H
    y_bot = (1 - SZ_BOTL) * H
    # Pasma liczone TYLKO w kolumnie centralnej (poza marginesami bocznymi).
    top_frac, top_peak = band_edge(edge, xL, xR, 0, y_top)
    mid_frac, mid_peak = band_edge(edge, xL, xR, y_top, y_bot)
    bot_frac, bot_peak = band_edge(edge, xL, xR, y_bot, H)
    danger = []
    if top_peak > DANGER_ROW_FRAC:
        danger.append("gora")
    if bot_peak > DANGER_ROW_FRAC:
        danger.append("dol")

    # overlay dowodowy
    ov = pil.convert("RGBA")
    layer = Image.new("RGBA", ov.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rectangle([0, 0, W, y_top], fill=(255, 40, 40, 70))            # gora zaslaniana
    d.rectangle([0, y_bot, W, H], fill=(255, 40, 40, 70))            # dol zaslaniany
    d.rectangle([0, 0, xL, H], fill=(255, 180, 0, 45))              # margines lewy
    d.rectangle([xR, 0, W, H], fill=(255, 180, 0, 45))              # margines prawy
    for y in (y_top, y_bot):
        d.line([(0, y), (W, y)], fill=(0, 220, 120, 255), width=max(2, W // 300))
    for x in (xL, xR):
        d.line([(x, 0), (x, H)], fill=(0, 220, 120, 200), width=max(2, W // 400))
    out = Image.alpha_composite(ov, layer).convert("RGB")
    dd = ImageDraw.Draw(out)
    f = _font(max(16, W // 34))
    dd.text((xL + 8, 8), "STREFA ZASLANIANA (gora %d%%)  szczyt=%.1f%%"
            % (round(SZ_TOP * 100), top_peak * 100), fill=(255, 230, 230), font=f)
    dd.text((xL + 8, y_bot + 8), "STREFA ZASLANIANA (dol %d%%)  szczyt=%.1f%%"
            % (round(SZ_BOTL * 100), bot_peak * 100), fill=(255, 230, 230), font=f)
    dd.text((xL + 8, y_top + 8), "SAFE-ZONE  szczyt=%.1f%%" % (mid_peak * 100),
            fill=(200, 255, 220), font=f)
    outp = os.path.join(out_dir, base + "_safezone.png")
    out.save(outp)
    return {
        "overlay": os.path.relpath(outp, out_dir),
        "edge_top": round(top_frac, 4), "edge_mid": round(mid_frac, 4), "edge_bot": round(bot_frac, 4),
        "peak_top": round(top_peak, 4), "peak_mid": round(mid_peak, 4), "peak_bot": round(bot_peak, 4),
        "danger": danger,
    }

# ------------------------------------------------------------------ main
def main():
    ap = argparse.ArgumentParser(description="Bramka pomiarowa statycznych grafik reklamowych (W5).")
    ap.add_argument("katalog", help="katalog z plikami ad_<n>_<angle>[_916].png")
    ap.add_argument("--out", default=None, help="katalog dowodow (domyslnie <katalog>/dowody)")
    ap.add_argument("--thumb-width", type=int, default=320, help="szerokosc miniatury czytelnosci (px)")
    ap.add_argument("--similar-max", type=int, default=SIMILAR_MAX, help="Hamming <= => FLAG (za podobne katy)")
    ap.add_argument("--borderline", type=int, default=BORDERLINE, help="gorna granica strefy 'sprawdz wizualnie'")
    a = ap.parse_args()

    katalog = os.path.abspath(a.katalog)
    if not os.path.isdir(katalog):
        print("BLAD: katalog nie istnieje: %s" % katalog)
        return 2
    out_dir = os.path.abspath(a.out) if a.out else os.path.join(katalog, "dowody")
    os.makedirs(out_dir, exist_ok=True)

    files = sorted(f for f in os.listdir(katalog)
                   if f.lower().endswith(IMG_EXT) and os.path.isfile(os.path.join(katalog, f)))
    if not files:
        print("BLAD: brak plikow graficznych (%s) w %s" % ("/".join(IMG_EXT), katalog))
        return 2

    print("=" * 88)
    print("ad-gate.py — bramka pomiarowa statycznych grafik reklamowych (dowody, nie wyrocznia)")
    print("=" * 88)
    print("Katalog : %s" % katalog)
    print("Dowody  : %s" % out_dir)
    print("Hash    : %s (64-bit), prog podobienstwa Hamming<=%d (borderline<=%d)"
          % (HASH_ALGO, a.similar_max, a.borderline))
    print("Safe 9:16: gora %d%% / dol %d%% / boki %d%%  (heurystyka krawedziowa, bez OCR)"
          % (round(SZ_TOP * 100), round(SZ_BOTL * 100), round(SZ_SIDE * 100)))
    print("-" * 88)

    images = []
    flags = []   # TWARDE, deterministyczne — flipuja werdykt/exit (near-dup katow, zla proporcja, blad odczytu)
    notes = []   # ADWIZORYJNE — do obejrzenia przez agenta (safe-zone, borderline, nietypowe nazwy)

    # --- (a) miniatury + (b) safe-zone ---
    print("GRAFIKI (miniatura %dpx + safe-zone 9:16 -> dowody/):" % a.thumb_width)
    for f in files:
        path = os.path.join(katalog, f)
        base = os.path.splitext(f)[0]
        n, angle, fmt, ok = parse_name(f)
        try:
            pil = Image.open(path)
            pil.load()
        except Exception as e:
            print("  [!! ] %-28s BLAD odczytu: %s" % (f, e))
            images.append({"file": f, "error": str(e)})
            flags.append("blad odczytu %s: %s" % (f, e))
            continue
        W, H = pil.size
        ar = round(W / H, 3) if H else 0
        exp = expected_ar(fmt)
        ar_ok = (exp is None) or (abs(ar - exp) <= 0.06)
        thumb = make_thumb(pil, out_dir, base, a.thumb_width)
        rec = {
            "file": f, "n": n, "angle": angle, "format": fmt, "recognized": ok,
            "size": [W, H], "aspect": ar, "aspect_ok": ar_ok,
            "thumb": os.path.relpath(thumb, out_dir), "safe_zone": None,
        }
        if not ar_ok:
            flags.append("proporcja %s: AR %.3f != spodz. %.3f dla formatu %s (zla generacja formatu)"
                         % (f, ar, exp, fmt))
        if not ok:
            notes.append("nazwa nierozpoznana: %s (spodz. ad_<n>_<kat>[_916].png)" % f)
        is_916 = ("916" in f) or fmt == "916"
        if is_916:
            sz = safe_zone(pil, out_dir, base)
            rec["safe_zone"] = sz
            if sz["danger"]:
                notes.append("safe-zone %s: proxy tresci w strefie zaslanianej (%s) — obejrzyj %s"
                             % (f, "+".join(sz["danger"]), sz["overlay"]))
        ar_tag = "OK" if ar_ok else "!! spodz. %.3f" % exp
        name_tag = "" if ok else "  [nazwa nierozpoznana]"
        sz_tag = ""
        if rec["safe_zone"]:
            szd = rec["safe_zone"]
            sz_tag = "  szczyt[g%.0f%% s%.0f%% d%.0f%%%s]" % (
                szd["peak_top"] * 100, szd["peak_mid"] * 100, szd["peak_bot"] * 100,
                "  <- proxy tresci w strefie zaslanianej" if szd["danger"] else "")
        print("  [%-3s] %-28s %dx%d (AR %.3f %s)%s%s"
              % (fmt, f, W, H, ar, ar_tag, name_tag, sz_tag))
        images.append(rec)

    # --- (c) pHash pairwise per format (rozne katy) ---
    print("-" * 88)
    print("PODOBIENSTWO KATOW (pHash pairwise, per format; ZG3 '3 katy = 3 byty'):")
    hashes = {}
    for rec in images:
        if rec.get("error"):
            continue
        try:
            hashes[rec["file"]] = phash_int(Image.open(os.path.join(katalog, rec["file"])))
        except Exception:
            continue
    by_fmt = {}
    for rec in images:
        if rec.get("error") or rec["file"] not in hashes:
            continue
        by_fmt.setdefault(rec["format"], []).append(rec)

    pairs = []
    any_pair = False
    for fmt in sorted(by_fmt):
        recs = sorted(by_fmt[fmt], key=lambda r: (r["angle"], r["file"]))
        for i in range(len(recs)):
            for j in range(i + 1, len(recs)):
                ra, rb = recs[i], recs[j]
                dist = hamming(hashes[ra["file"]], hashes[rb["file"]])
                diff_angle = ra["angle"] != rb["angle"]
                flag = diff_angle and dist <= a.similar_max
                borderline = diff_angle and (a.similar_max < dist <= a.borderline)
                if flag:
                    flags.append("podobienstwo [%s] %s<->%s d=%d <= %d — katy zbyt podobne (ZG3)"
                                 % (fmt, ra["angle"], rb["angle"], dist, a.similar_max))
                elif borderline:
                    notes.append("podobienstwo [%s] %s<->%s d=%d (borderline) — sprawdz wizualnie roznorodnosc"
                                 % (fmt, ra["angle"], rb["angle"], dist))
                tag = ("  <<<< FLAG (katy zbyt podobne — roznorodnosc ZG3)" if flag
                       else ("  <- borderline (sprawdz wizualnie)" if borderline
                             else ("" if diff_angle else "  (ten sam kat — informacyjnie)")))
                print("  [%-3s] %-10s <-> %-10s d=%-3d%s" % (fmt, ra["angle"], rb["angle"], dist, tag))
                pairs.append({"format": fmt, "a": ra["file"], "b": rb["file"],
                              "angle_a": ra["angle"], "angle_b": rb["angle"],
                              "distance": dist, "same_angle": not diff_angle,
                              "flag": flag, "borderline": borderline})
                any_pair = True
    if not any_pair:
        print("  (brak par do porownania — <2 grafiki w formacie)")

    # --- werdykt + report.json ---
    print("-" * 88)
    verdict = "FLAG" if flags else "PASS"
    report = {
        "katalog": katalog,
        "generated_at": datetime.datetime.now().isoformat(timespec="seconds"),
        "hash_algo": HASH_ALGO,
        "similar_max": a.similar_max, "borderline": a.borderline,
        "thumb_width": a.thumb_width,
        "safe_zones": {"top": SZ_TOP, "bottom": SZ_BOTL, "sides": SZ_SIDE,
                       "edge_strong": EDGE_STRONG, "row_h": ROW_H, "danger_row_frac": DANGER_ROW_FRAC},
        "images": images,
        "phash_pairs": pairs,
        "flags": flags,
        "notes": notes,
        "verdict": verdict,
    }
    report_path = os.path.join(out_dir, "report.json")
    with open(report_path, "w", encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=2)

    if flags:
        print("WERDYKT: FLAG (%d twarde) — POMIARY, nie wyrocznia; werdykt jakosciowy = agent wg SSOT:" % len(flags))
        for fl in flags:
            print("  <<<< %s" % fl)
    else:
        print("WERDYKT: PASS (brak twardych flag pomiarowych).")
    if notes:
        print("UWAGI adwizoryjne (%d) — do obejrzenia przez agenta na overlay/miniaturach:" % len(notes))
        for nt in notes:
            print("  <-  %s" % nt)
    print("Werdykt jakosciowy (wiernosc produktu / tekst PL / polityka Meta / czytelnosc) "
          "wykonuje agent wg SSOT na dowodach z dowody/.")
    print("report.json -> %s" % report_path)
    return 1 if flags else 0

if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
asset-gate.py — przepisywacz URL-i assetow landinga na BRAMKE wf2-asset (ochrona przed
hotlinkiem/kopiowaniem). NOWY plik (NIE dotyka platform-sync.py). Do wpiecia w cmd_publish
przez glowna sesje pozniej — TU tylko biblioteka + CLI do testu/pomiaru (nic nie publikuje).

CO ROBI:
  …/storage/v1/object/public/attachments/bud-assets/<slug>/X
    →  …/functions/v1/wf2-asset?path=bud-assets/<slug>/X          (ten sam host)

Bramka wf2-asset sprawdza Referer (nasz/brak → 302 na signed-URL; obcy → 403), wiec kopia
landinga na obcej domenie dostaje 403 na assety. Bajty i tak leca z CDN Storage (302), LCP
nietkniete — pod warunkiem, ze HERO zostaje EXEMPT (--hero-exempt, DOMYSLNIE ON).

HERO-EXEMPT (domyslnie): pomija assety hero (LCP-krytyczne) — zostaja na public/bez bramki,
zero narzutu redirectu na najwazniejszy obraz/wideo:
  • pliki: sc-hero*, hero-loop*, hero-poster*, hero-mobile*, hero-d*  (obraz LCP + poster + mp4)
  • bazy JS w katalogu hero (domyslnie 'video/' = ambient hero-loop)  [gdy --rewrite-js-bases]

TRYBY:
  • Full-URL (zawsze): pelne URL-e w src/href/srcset/content/data-* i literalach.
  • JS base-vars (--rewrite-js-bases): prefiksy 'var X="…/bud-assets/<slug>/<sub>/"' budowane
    runtime konkatenacja (hero-loop mp4, tt mp4). Bramka toleruje doklejony cache-bust '?v=1'.

CLI (nic nie zapisuje bez --out/--in-place):
  python -X utf8 asset-gate.py --file <index.html>                       # dry-run: raport
  python -X utf8 asset-gate.py --file <index.html> --out <gated.html>    # zapis kopii
  python -X utf8 asset-gate.py --file <index.html> --no-hero-exempt      # bramkuj tez hero
  python -X utf8 asset-gate.py --file <index.html> --rewrite-js-bases    # + bazy JS (tt/…)
"""
import argparse
import os
import re
import sys

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ── WZORCE ────────────────────────────────────────────────────────────────────
# Pelny publiczny URL assetu (MUSI konczyc sie rozszerzeniem pliku — inaczej zlapaloby prefiksy
# baz JS 'var SB="…/video/"' konczace sie '/', bramkujac hero-ambient mimo hero-exempt).
#   grupa 1 = host (…supabase.co)   grupa 2 = 'bud-assets/<slug>/<…>.<ext>'   grupa 3 = opcjonalny ?query
PUBLIC_URL_RE = re.compile(
    r"https://([A-Za-z0-9.-]+\.supabase\.co)"
    r"/storage/v1/object/public/attachments/"
    r"(bud-assets/[^\s\"'<>?#)]+\.(?:webp|png|jpe?g|mp4|webm))"
    r"(\?[^\s\"'<>)]*)?",
    re.I,
)

# Base-var JS: var NAME="<host>/…/attachments/bud-assets/<slug>/<sub>/";
# MUSI byc KOMPLETNYM literalem w cudzyslowie konczacym sie '/' (grupa1=cudzyslow, \1 na koncu) —
# inaczej zlapaloby prefiks katalogu WEWNATRZ dluzszego URL-a pliku (…/assets/sc-hero.webp) i
# przypadkiem zbramkowaloby hero. grupa2=host, grupa3=asset_path (konczy '/').
JS_BASE_RE = re.compile(
    r"([\"'])"
    r"https://([A-Za-z0-9.-]+\.supabase\.co)"
    r"/storage/v1/object/public/attachments/"
    r"(bud-assets/[^\s\"'<>?#)]+/)"
    r"\1",
    re.I,
)

# HERO-EXEMPT: pliki LCP-krytyczne (obraz hero + poster + ambient mp4). Dopasowanie na sciezce assetu.
HERO_EXEMPT_RE = re.compile(
    r"(?:sc-hero|hero-loop|hero-poster|hero-mobile|hero-d)(?:[-._]|$)|/hero\.",
    re.I,
)

GATE_PATH = "/functions/v1/wf2-asset"


def _is_hero(asset_path):
    """True gdy asset jest hero (LCP) → wykluczyc przy hero-exempt."""
    return bool(HERO_EXEMPT_RE.search(asset_path))


def _gate_url(host, asset_path, query):
    """Zbuduj URL bramki. Oryginalny ?query skladamy W WARTOSC path (…webp?v=1) — wf2-asset
    oddziela go jako passQuery (dziala tez z konkatenacja +V). 'bud-assets/' zostaje jawne w
    URL, wiec skanery gate'ow (manifest-check/gate-check) dalej je widza."""
    tail = asset_path
    if query:
        # query przyszlo jako '?...'; dolacz do wartosci path
        tail = asset_path + query
    return "https://%s%s?path=%s" % (host, GATE_PATH, tail)


def gate_html(html, hero_exempt=True, rewrite_js_bases=False, hero_dirs=("video",)):
    """Zwraca (new_html, stats). stats: dict list-ow sciezek assetow wg kategorii.
    Nie modyfikuje wejscia in-place; czysta funkcja (do wpiecia w cmd_publish)."""
    stats = {"rewritten": [], "hero_exempt": [], "js_base_rewritten": [], "js_base_exempt": []}
    hero_dirs_n = tuple(d.strip("/").lower() for d in hero_dirs)

    def repl_full(m):
        host, asset_path, query = m.group(1), m.group(2), m.group(3) or ""
        if hero_exempt and _is_hero(asset_path):
            stats["hero_exempt"].append(asset_path)
            return m.group(0)  # zostaw public — hero LCP
        stats["rewritten"].append(asset_path + query)
        return _gate_url(host, asset_path, query)

    new_html = PUBLIC_URL_RE.sub(repl_full, html)

    if rewrite_js_bases:
        def repl_base(m):
            quote, host, asset_path = m.group(1), m.group(2), m.group(3)  # asset_path konczy '/'
            last_dir = asset_path.rstrip("/").rsplit("/", 1)[-1].lower()
            if hero_exempt and (_is_hero(asset_path) or last_dir in hero_dirs_n):
                stats["js_base_exempt"].append(asset_path)
                return m.group(0)  # zostaw public — hero ambient
            stats["js_base_rewritten"].append(asset_path)
            # baza konczaca '/' → path=bud-assets/<slug>/<sub>/ ; runtime doda plik + ?v=1
            return "%shttps://%s%s?path=%s%s" % (quote, host, GATE_PATH, asset_path, quote)

        new_html = JS_BASE_RE.sub(repl_base, new_html)

    return new_html, stats


# ── CLI (test/pomiar; nic nie publikuje) ──────────────────────────────────────
def _asc(s):
    try:
        return str(s).encode("ascii", "replace").decode("ascii")
    except Exception:
        return "<?>"


def main():
    ap = argparse.ArgumentParser(
        description="Przepisywacz URL-i assetow na bramke wf2-asset (ochrona przed hotlinkiem). "
                    "Biblioteka do wpiecia w cmd_publish; CLI tylko do testu.")
    ap.add_argument("--file", required=True, help="sciezka do index.html landinga")
    ap.add_argument("--out", help="zapisz przepisany HTML do pliku (bez tego: dry-run raport)")
    ap.add_argument("--in-place", action="store_true", help="nadpisz --file (OSTROZNIE; do testu na kopii)")
    ap.add_argument("--no-hero-exempt", dest="hero_exempt", action="store_false",
                    help="bramkuj TAKZE hero (domyslnie hero zostaje na public — LCP)")
    ap.add_argument("--rewrite-js-bases", action="store_true",
                    help="przepisz tez bazy JS (var X=\"…/tt/\") — bramkuje tt-mp4 itp.")
    ap.add_argument("--hero-dir", action="append", default=None,
                    help="katalog hero-ambient do wykluczenia w bazach JS (domyslnie 'video')")
    args = ap.parse_args()

    if not os.path.isfile(args.file):
        print("BLAD: brak pliku " + _asc(args.file))
        sys.exit(2)
    with open(args.file, "r", encoding="utf-8") as f:
        html = f.read()

    hero_dirs = tuple(args.hero_dir) if args.hero_dir else ("video",)
    new_html, stats = gate_html(html, hero_exempt=args.hero_exempt,
                                rewrite_js_bases=args.rewrite_js_bases, hero_dirs=hero_dirs)

    print("asset-gate.py — raport przepisania (bramka wf2-asset)")
    print("plik            : " + _asc(args.file))
    print("hero-exempt     : " + ("ON (hero zostaje na public — LCP)" if args.hero_exempt else "OFF (bramkuje tez hero)"))
    print("rewrite-js-bases: " + ("ON" if args.rewrite_js_bases else "OFF"))
    print("bajty           : %d → %d (delta %+d)" % (len(html), len(new_html), len(new_html) - len(html)))
    print("")
    print("PRZEPISANE (bramkowane) : %d" % len(stats["rewritten"]))
    for p in stats["rewritten"]:
        print("  + " + _asc(p))
    print("HERO-EXEMPT (public)    : %d" % len(stats["hero_exempt"]))
    for p in stats["hero_exempt"]:
        print("  = " + _asc(p))
    if args.rewrite_js_bases:
        print("JS-BASE przepisane      : %d" % len(stats["js_base_rewritten"]))
        for p in stats["js_base_rewritten"]:
            print("  + " + _asc(p))
        print("JS-BASE hero-exempt     : %d" % len(stats["js_base_exempt"]))
        for p in stats["js_base_exempt"]:
            print("  = " + _asc(p))

    out = args.file if args.in_place else args.out
    if out:
        with open(out, "w", encoding="utf-8") as f:
            f.write(new_html)
        print("")
        print("ZAPISANO → " + _asc(out))
    else:
        print("")
        print("(dry-run — bez zapisu; podaj --out <plik> aby zapisac)")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
home-forge.py — STRONA GŁÓWNA sklepu (krok pl_glowna). SSOT: docs/zbuduje/STRONA-GLOWNA.md

Architektura „szablon raz, render wiele":
  build   <projekt>   collect → brief → gpt-5.6-sol (wf2-gpt) → template.html → render
  render  <projekt>   deterministyczny re-render kart+JSON-LD z bazy ($0, bez GPT)
  og      <projekt>   OG 1200×630 z logo-combo (Pillow, $0) → Storage → URL
  publish <projekt>   platform-sync home + PATCH td_shop_url + panel-sync krok pl_glowna
  collect <projekt>   podgląd danych wejściowych (debug)

Kontrakt markerów w template.html (generuje je GPT wg briefu):
  <!--CARDS:START--> … <!--CARDS:END-->      kontener kart (render podmienia zawartość)
  <!--CARD-TEMPLATE … CARD-TEMPLATE-->       wzorzec karty z {{CARD_*}} (w komentarzu)
  <!--ITEMLIST:START--> … <!--ITEMLIST:END-->  slot JSON-LD (render wstawia @graph)
  {{CANONICAL_URL}} {{OG_URL}} + meta robots noindex (zdejmuje platform-sync na domenie)

Produkt trafia do galerii gdy: status='gotowy' AND platform_page_url AND okładka HTTP 200.
"""
import os
import re
import sys
import json
import argparse
import subprocess
import importlib.util
from io import BytesIO

import requests

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("panel_sync", os.path.join(_HERE, "panel-sync.py"))
ps = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ps)

REPO_ROOT = os.path.abspath(os.path.join(_HERE, "..", ".."))
PUB = f"https://{ps.PROJECT_REF}.supabase.co/storage/v1/object/public/attachments"
LANDING_API = f"https://{ps.PROJECT_REF}.supabase.co/functions/v1/wf2-landing-api"


def log(msg):
    print(f"[home-forge] {msg}", flush=True)


def _project(pid):
    rows = ps._get("wf2_projects", {"id": f"eq.{pid}", "select": (
        "id,name,tagline,brand_opis,palette,fonts,logo_url,favicon_url,domain,platform_shop_id,td_shop_url")})
    if not rows:
        raise SystemExit(f"[home-forge] brak projektu {pid}")
    return rows[0]


def _parasol_slug(pr):
    m = re.search(r"parasol-([a-z0-9-]+)/", pr.get("logo_url") or "")
    return m.group(1) if m else re.sub(r"[^a-z0-9]+", "-", (pr.get("name") or "sklep").lower()).strip("-")


def _home_dir(pr):
    d = os.path.join(REPO_ROOT, "sklepy", "tomek-niedzwiecki", f"home-{_parasol_slug(pr)}")
    os.makedirs(d, exist_ok=True)
    return d


def _url_ok(url):
    try:
        return requests.head(url, timeout=20).status_code == 200
    except Exception:
        return False


def _cover(slug):
    """Okładka karty: oferta.webp → 1. kadr gallery-curated → hero-d.webp (SSOT §1)."""
    for cand in (f"{PUB}/bud-assets/{slug}/scenes/oferta.webp",):
        if _url_ok(cand):
            return cand
    try:
        r = requests.post(f"https://{ps.PROJECT_REF}.supabase.co/storage/v1/object/list/attachments",
                          json={"prefix": f"bud-assets/{slug}/gallery-curated", "limit": 5},
                          headers={"apikey": ps.KEY, "Authorization": f"Bearer {ps.KEY}"}, timeout=30)
        names = [o["name"] for o in r.json() if isinstance(o, dict) and o.get("name", "").endswith((".webp", ".jpg", ".png"))]
        if names:
            return f"{PUB}/bud-assets/{slug}/gallery-curated/{sorted(names)[0]}"
    except Exception:
        pass
    hero = f"{PUB}/bud-assets/{slug}/scenes/hero-d.webp"
    return hero if _url_ok(hero) else None


def _hover_img(slug, cover):
    """Drugi kadr karty (hover-swap): hero-d → demo-a → demo-01, różny od covera."""
    for name in ("hero-d.webp", "demo-a.webp", "demo-01.webp"):
        u = f"{PUB}/bud-assets/{slug}/scenes/{name}"
        if u != cover and _url_ok(u):
            return u
    return cover


def _hero_video(slug):
    """Hero-loop landingu do karty produktu na home (decyzja Tomka 21.07: wideo = kafel
    karty, NIE hero). Preferencja wariantu -m (mniejszy, pionowy — lepszy crop 1:1)."""
    for base in ("hero-loop-m", "hero-loop"):
        mp4 = f"{PUB}/bud-assets/{slug}/video/{base}.mp4"
        if _url_ok(mp4):
            webm = f"{PUB}/bud-assets/{slug}/video/{base}.webm"
            return {"mp4": mp4, "webm": webm if _url_ok(webm) else None}
    return None


def _hook(slug, platform_name):
    """1. zdanie meta-description landingu; fallback: descriptor z platform_name po „—"."""
    path = os.path.join(REPO_ROOT, "sklepy", "tomek-niedzwiecki", slug, "index.html")
    try:
        html = open(path, encoding="utf-8").read()
        m = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', html)
        if m:
            sent = re.split(r"(?<=[.!?])\s", m.group(1).strip())[0].strip()
            if 20 <= len(sent) <= 140:
                return sent
    except FileNotFoundError:
        pass
    if platform_name and "—" in platform_name:
        d = platform_name.split("—", 1)[1].strip()
        return d[0].upper() + d[1:]
    return None


def _money_pl(v):
    return f"{float(v):.2f}".replace(".", ",") + " zł"


def collect(pid):
    pr = _project(pid)
    rows = ps._get("wf2_products", {
        "project_id": f"eq.{pid}", "status": "eq.gotowy",
        "platform_page_url": "not.is.null",
        "select": "id,name,slug,platform_name,price,platform_page_url,sort,created_at",
        "order": "sort.asc,created_at.asc"})
    prods = []
    for p in rows:
        cover = _cover(p["slug"])
        if not cover:
            log(f"⚠️ {p['slug']}: brak okładki (oferta/gallery-curated/hero) — produkt POMINIĘTY")
            continue
        mini = (p.get("platform_name") or p["name"]).split("—")[0].strip()
        prods.append({
            "id": p["id"], "slug": p["slug"], "mini": mini,
            "hook": _hook(p["slug"], p.get("platform_name")) or p["name"],
            "price": p["price"], "price_pl": _money_pl(p["price"]),
            "landing": p["platform_page_url"], "cover": cover,
            "cover2": _hover_img(p["slug"], cover),
            "hero_video": _hero_video(p["slug"]),
        })
    return {"project": pr, "parasol": _parasol_slug(pr), "products": prods}


CARD_KEYS = ("CARD_URL", "CARD_IMG", "CARD_IMG2", "CARD_NAME", "CARD_HOOK", "CARD_PRICE", "CARD_PID",
             "CARD_CTA", "CARD_ALT", "CARD_VID_MP4", "CARD_VID_WEBM")


def _render_html(template, data):
    m = re.search(r"<!--CARD-TEMPLATE(.*?)CARD-TEMPLATE-->", template, re.S)
    if not m:
        raise SystemExit("[home-forge] template bez <!--CARD-TEMPLATE … CARD-TEMPLATE--> — popraw build")
    card_tpl = m.group(1)
    cards = []
    for p in data["products"]:
        c = card_tpl
        hv = p.get("hero_video") or {}
        # Blok <!--IFVID--> … <!--/IFVID--> w karcie: wycinany, gdy produkt nie ma hero-loopa.
        if not hv:
            c = re.sub(r"<!--IFVID-->.*?<!--/IFVID-->", "", c, flags=re.S)
        vals = {"CARD_URL": p["landing"], "CARD_IMG": p["cover"], "CARD_IMG2": p.get("cover2") or p["cover"],
                "CARD_NAME": p["mini"], "CARD_HOOK": p["hook"], "CARD_PRICE": p["price_pl"], "CARD_PID": p["id"],
                "CARD_CTA": f"Zobacz {p['mini']}", "CARD_ALT": f"{p['mini']} — {p['hook']}",
                "CARD_VID_MP4": hv.get("mp4") or "", "CARD_VID_WEBM": hv.get("webm") or ""}
        for k in CARD_KEYS:
            c = c.replace("{{%s}}" % k, str(vals[k]))
        cards.append(c.strip())
    single = ' data-count="1"' if len(cards) == 1 else f' data-count="{len(cards)}"'
    out = re.sub(r"(<!--CARDS:START-->)(.*?)(<!--CARDS:END-->)",
                 lambda mm: mm.group(1) + "\n" + "\n".join(cards) + "\n" + mm.group(3),
                 template, flags=re.S)
    # Referencyjny blok CARD-TEMPLATE ZAWSZE wycinany z outputu: komentarze HTML się nie
    # zagnieżdżają — <!--IFVID--> w środku rozrywa komentarz i szablon WYCIEKA do DOM
    # (incydent 21.07: widoczne {{CARD_NAME}}/CARD-TEMPLATE--> na stronie).
    out = re.sub(r"<!--CARD-TEMPLATE.*?CARD-TEMPLATE-->", "", out, flags=re.S)
    # stan featured przy 1 produkcie: data-count na kontenerze kart (CSS szablonu obsługuje)
    out = re.sub(r'(<[^>]*data-cards[^>]*data-count=")\d+(")', lambda mm: mm.group(1) + str(len(cards)) + mm.group(2), out)
    out = re.sub(r"(<[^>]*data-cards(?![^>]*data-count)[^>]*)(>)", lambda mm: mm.group(1) + single + mm.group(2), out, count=1)
    pr = data["project"]
    graph = {"@context": "https://schema.org", "@graph": [
        {"@type": "OnlineStore", "name": pr["name"], "description": (pr.get("brand_opis") or "")[:300],
         "url": "{{CANONICAL_URL}}", "logo": pr.get("logo_url")},
        {"@type": "ItemList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": p["mini"], "url": p["landing"]}
            for i, p in enumerate(data["products"])]},
    ]}
    ld = '<script type="application/ld+json">' + json.dumps(graph, ensure_ascii=False) + "</script>"
    out = re.sub(r"(<!--ITEMLIST:START-->)(.*?)(<!--ITEMLIST:END-->)",
                 lambda mm: mm.group(1) + ld + mm.group(3), out, flags=re.S)
    # Rotator hero-video (opcjonalny marker): lista klipów portfela dla kodu strony.
    vids = [{"name": p["mini"], "landing": p["landing"], "mp4": p["hero_video"]["mp4"],
             "webm": p["hero_video"].get("webm"), "poster": p.get("cover2") or p["cover"]}
            for p in data["products"] if p.get("hero_video")]
    vjs = "<script>window.__HOME_VIDS=" + json.dumps(vids, ensure_ascii=False) + "</script>"
    out = re.sub(r"(<!--HEROVIDS:START-->)(.*?)(<!--HEROVIDS:END-->)",
                 lambda mm: mm.group(1) + vjs + mm.group(3), out, flags=re.S)
    return out


def cmd_render(a):
    data = collect(a.project)
    if not data["products"]:
        raise SystemExit("[home-forge] 0 produktów kwalifikujących (gotowy+landing+okładka) — galeria bez kart nie idzie na produkcję")
    d = _home_dir(data["project"])
    tpl_path = os.path.join(d, "template.html")
    if not os.path.isfile(tpl_path):
        raise SystemExit(f"[home-forge] brak {tpl_path} — najpierw `build`")
    html = _render_html(open(tpl_path, encoding="utf-8").read(), data)
    out = os.path.join(d, "index.html")
    open(out, "w", encoding="utf-8").write(html)
    log(f"DOWÓD: render {out} · kart: {len(data['products'])} · {os.path.getsize(out)} B")
    return out


BRIEF_KANON = """Jesteś koderem fabryki landingów. Zbuduj JEDEN kompletny, samowystarczalny plik HTML
(inline CSS/JS, zero zewnętrznych bibliotek; Google Fonts dozwolone z subsetem latin-ext) —
STRONĘ GŁÓWNĄ sklepu internetowego. To mała witryna-rozdzielnia marki, NIE landing.

KANON (nienaruszalny):
- Sekcje DOKŁADNIE: (1) topbar [logo + slim linia zaufania „Płatność przy odbiorze · 14 dni na zwrot"],
  (2) intro nad foldem [H1 = nazwa + tagline, akapit answer-first 40-75 słów], (3) pas zaufania
  [3 chipy: płatność przy odbiorze / 14 dni na zwrot / bezpieczne płatności], (4) GALERIA KART
  produktów (rdzeń), (5) krótka banda „jak to działa" (1-2 zdania), (6) footer (moduł niżej).
  ŻADNYCH innych sekcji: bez wideo, opinii, demo, porównań, offer-boxów, sticky-buy.
- Karta produktu: obraz (jedna proporcja 1/1 na WSZYSTKICH kartach, object-fit:cover),
  nazwa mini-marki (font display marki), 1-zdaniowy hook, cena, CTA „Zobacz …". CAŁA karta
  = jeden <a> do landinga. Rama karty w tokenach MARKI PARASOLOWEJ (jeden akcent UI);
  indywidualność produktu niesie WYŁĄCZNIE fotografia.
- Siatka: repeat(auto-fit,minmax(280px,1fr)), max-width kontenera ~1140px; 3→2→1 kolumn.
  Kontener kart MUSI mieć atrybut data-cards. Stan data-count="1" = karta featured
  (szersza, poziomy układ obraz+treść na desktopie) — obsłuż w CSS.
- Rytm 8pt; JASNE tła (⛔ ciemne); DOKŁADNIE JEDEN akcent UI; jeden radius; touch-target ≥44px;
  prefers-reduced-motion; zero h-scrolla 320-1920px; diakrytyki PL wszędzie poprawne.
- ⛔ gwiazdki/oceny nad foldem (dozwolone tylko w footerze, tu: brak — nie mamy ocen sklepu).
- ⛔ liczb zmyślonych (opinii, klientów, lat). Zero urgency/przecen.
- Subtelny ruch dozwolony: hover kart (transform 2-3px + cień), fade-in on-scroll przez
  IntersectionObserver z fallbackiem bez JS. Nic więcej.

KONTRAKT TECHNICZNY (twardy — bez niego strona nie przejdzie montażu):
- W <head>: <title>{NAZWA} — {TAGLINE}</title>, meta description (answer-first),
  <meta name="robots" content="noindex,nofollow">, <link rel="canonical" href="{{CANONICAL_URL}}">,
  og:title/og:description/og:image={{OG_URL}}, favicon = URL podany niżej.
- Miejsce na karty: kontener z data-cards, w środku DOKŁADNIE:
  <!--CARDS:START--><!--CARDS:END-->
  (montaż wstrzykuje karty między te markery — NIE wpisuj przykładowych kart do środka).
- Wzorzec karty umieść W KOMENTARZU zaraz nad kontenerem:
  <!--CARD-TEMPLATE
  …markup jednej karty z placeholderami {{CARD_URL}} {{CARD_IMG}} {{CARD_NAME}} {{CARD_HOOK}}
  {{CARD_PRICE}} {{CARD_PID}} {{CARD_CTA}} {{CARD_ALT}}…
  CARD-TEMPLATE-->
  Cena w karcie: <span class="…" data-wf2-product="{{CARD_PID}}">{{CARD_PRICE}}</span>.
- Przed </head>: <!--ITEMLIST:START--><!--ITEMLIST:END--> (montaż wstawi JSON-LD).
- Przed </body> skrypt hydratacji cen (fetch GET
  https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-landing-api?product=<uuid>
  dla każdego [data-wf2-product]; odpowiedź {price}; podmień tekst na format
  „123,45 zł"; błędy cicho ignoruj) + defensywne
  window.trevio?.viewItemList?.() w try/catch.
- Footer: użyj DOKŁADNIE modułu footer@1 (markup+style niżej; skórka = tokeny marki,
  wordmark TEKSTEM, favicon jako brand-mark). Linki prawne zostaw jako {{REGULAMIN_URL}},
  {{POLITYKA_URL}}, {{ZWROTY_URL}}, {{DOSTAWA_URL}}, {{KONTAKT_URL}} (podmienia je publikacja).
  W footerze POMIŃ rating (nie mamy ocen sklepu). Pay-badges: prosty rząd tekstowych
  pigułek BLIK · Visa · Mastercard · Pobranie (bez SVG logotypów).
- Obrazy: loading="lazy" poza pierwszym; width/height lub aspect-ratio (zero CLS).

ZWRÓĆ WYŁĄCZNIE kompletny HTML w jednym bloku ```html … ``` — bez komentarza od siebie.
"""


def _brief(data):
    pr = data["project"]
    lines = [BRIEF_KANON, "\n--- DANE MARKI (partytura — zaprojektuj wyraz strony Z TYCH danych) ---",
             f"Nazwa: {pr['name']}", f"Tagline: {pr.get('tagline')}",
             f"Opis marki (do answer-first, przeredaguj zwięźle): {pr.get('brand_opis')}",
             f"Paleta (role): {pr.get('palette')}",
             "UWAGA paleta: primary = JEDYNY akcent UI (CTA, drobne podkreślenia). Drugiego koloru "
             "marki NIE używaj w chromie UI (żyje w grafice logo). Tła z rodziny bg/bg-alt, linie border.",
             f"Fonty: {pr.get('fonts')} (Google Fonts, subset latin-ext, display=swap)",
             f"Logo (topbar, wys. ~36-40px): {pr.get('logo_url')}",
             f"Favicon: {pr.get('favicon_url')}",
             "Sygnatura marki: motyw „trafienia” (ptaszek/metka z logo) — użyj OSZCZĘDNIE jako "
             "1 akcent wydawniczy (np. znacznik przy H1 albo markery listy w bandzie), nie tapeta.",
             f"\n--- PRODUKTY (przykładowe DANE do wyczucia proporcji; NIE wpisuj ich w HTML — "
             f"karty wstrzyknie montaż przez markery; {len(data['products'])} szt. teraz, będzie rosło) ---"]
    for p in data["products"]:
        lines.append(f"- {p['mini']}: {p['hook']} · {p['price_pl']} · foto {p['cover']}")
    lines.append("\n--- MODUŁ footer@1 (osadź 1:1, skórka=tokeny marki, bez ratingu) ---")
    lines.append(open(os.path.join(REPO_ROOT, "docs", "zbuduje", "moduly", "footer@1.html"), encoding="utf-8").read())
    return "\n".join(lines)


def cmd_build(a):
    data = collect(a.project)
    if not data["products"]:
        raise SystemExit("[home-forge] 0 produktów kwalifikujących — build wstrzymany")
    d = _home_dir(data["project"])
    brief_path = os.path.join(d, "BRIEF.md")
    open(brief_path, "w", encoding="utf-8").write(_brief(data))
    out_md = os.path.join(d, "gpt-out.md")
    env = dict(os.environ, WF2_MAXOUT="24000", WF2_EFFORT=os.environ.get("WF2_EFFORT", "medium"))
    log("wf2-gpt (gpt-5.6-sol) generuje template — to potrwa 1-3 min…")
    r = subprocess.run([sys.executable, os.path.join(_HERE, "wf2gpt-call.py"), brief_path, out_md],
                       env=env, capture_output=True, text=True, encoding="utf-8", timeout=900)
    if r.returncode != 0:
        raise SystemExit(f"[home-forge] wf2gpt-call FAIL: {r.stdout[-400:]} {r.stderr[-400:]}")
    raw = open(out_md, encoding="utf-8").read()
    m = re.search(r"```html\s*(.*?)```", raw, re.S) or re.search(r"(<!doctype.*)", raw, re.S | re.I)
    if not m:
        raise SystemExit("[home-forge] w odpowiedzi GPT brak bloku ```html``` — obejrzyj gpt-out.md")
    tpl = m.group(1).strip()
    for marker in ("<!--CARDS:START-->", "<!--CARDS:END-->", "CARD-TEMPLATE", "<!--ITEMLIST:START-->", "{{CANONICAL_URL}}"):
        if marker not in tpl:
            raise SystemExit(f"[home-forge] template bez markera {marker} — popraw brief/ponów build")
    open(os.path.join(d, "template.html"), "w", encoding="utf-8").write(tpl)
    log(f"DOWÓD: template.html {len(tpl)} B (markery OK)")
    return cmd_render(a)


def cmd_og(a):
    from PIL import Image
    pr = _project(a.project)
    slug = _parasol_slug(pr)
    logo = Image.open(BytesIO(requests.get(pr["logo_url"], timeout=30).content)).convert("RGBA")
    pal = pr.get("palette") or ""
    bgs = re.findall(r"#[0-9A-Fa-f]{6}", pal)
    bg_hex = bgs[3] if len(bgs) > 3 else "#FDF8F2"   # rola 4 = bg (kontrakt palette)
    canvas = Image.new("RGB", (1200, 630), tuple(int(bg_hex[i:i + 2], 16) for i in (1, 3, 5)))
    w = 760
    logo = logo.resize((w, int(logo.height * w / logo.width)), Image.LANCZOS)
    canvas.paste(logo, ((1200 - logo.width) // 2, (630 - logo.height) // 2), logo)
    buf = BytesIO()
    canvas.save(buf, "PNG", optimize=True)
    path = f"bud-assets/parasol-{slug}/brand/og-home.png"
    r = requests.post(f"https://{ps.PROJECT_REF}.supabase.co/storage/v1/object/attachments/{path}",
                      data=buf.getvalue(),
                      headers={"apikey": ps.KEY, "Authorization": f"Bearer {ps.KEY}",
                               "Content-Type": "image/png", "x-upsert": "true"}, timeout=60)
    if r.status_code not in (200, 201):
        raise SystemExit(f"[home-forge] upload OG FAIL {r.status_code}: {r.text[:200]}")
    url = f"{PUB}/{path}"
    log(f"DOWÓD: OG {url} · {len(buf.getvalue())} B")
    return url


def cmd_publish(a):
    pr = _project(a.project)
    d = _home_dir(pr)
    idx = os.path.join(d, "index.html")
    if not os.path.isfile(idx):
        raise SystemExit("[home-forge] brak index.html — najpierw build/render")
    html = open(idx, encoding="utf-8").read()
    og_url = f"{PUB}/bud-assets/parasol-{_parasol_slug(pr)}/brand/og-home.png"
    if "{{OG_URL}}" in html:
        tmp = os.path.join(d, "index-pub.html")
        open(tmp, "w", encoding="utf-8").write(html.replace("{{OG_URL}}", og_url))
        idx = tmp
    r = subprocess.run([sys.executable, os.path.join(_HERE, "platform-sync.py"), "home", a.project, idx],
                       capture_output=True, text=True, encoding="utf-8", timeout=300)
    print(r.stdout.strip())
    if r.returncode != 0:
        raise SystemExit(f"[home-forge] platform-sync home FAIL: {r.stderr[-400:]}")
    m = re.search(r"home (\S+) → HTTP (\d+)", r.stdout)
    url = m.group(1) if m else None
    if url:
        ps._patch("wf2_projects", {"id": f"eq.{a.project}"}, {"td_shop_url": url})
    if not a.no_step:
        n = len(collect(a.project)["products"])
        ps.step_update(a.project, None, "pl_glowna", status="done",
                       fields={"home_url": url},
                       checklist=[{"t": "Home = galeria parasola (publish_landing path:\"\")", "done": True},
                                  {"t": "Linki do wszystkich landingów produktów", "done": True},
                                  {"t": "Branding parasola (logo, kolory)", "done": True}],
                       note=f"home-forge: {n} kart(y); szablon+render idempotentny (SSOT STRONA-GLOWNA.md)")
    log(f"DOWÓD: publish OK → {url}")


def main():
    ap = argparse.ArgumentParser(description="Strona główna sklepu (pl_glowna). SSOT: docs/zbuduje/STRONA-GLOWNA.md")
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("collect", "build", "render", "og", "publish"):
        s = sub.add_parser(name)
        s.add_argument("project")
        if name == "publish":
            s.add_argument("--no-step", action="store_true", help="bez panel-sync kroku pl_glowna")
    a = ap.parse_args()
    if a.cmd == "collect":
        print(json.dumps(collect(a.project), ensure_ascii=False, indent=1, default=str))
    else:
        {"build": cmd_build, "render": cmd_render, "og": cmd_og, "publish": cmd_publish}[a.cmd](a)


if __name__ == "__main__":
    main()

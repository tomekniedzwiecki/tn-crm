#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
platform-sync.py — MOST fabryka ↔ PLATFORMA e-commerce (Trevio / sklepy.niedzwiecki.ai).

Cel: kroki Etapu 3 (pl_*) wykonywane JEDNYM wywołaniem z dowodami — bez pisania
skryptów ad-hoc per sesja. Całość idzie przez adapter edge `wf2-platform`
(jedyne miejsce znające API platformy); ten skrypt nie zna klucza partnera.

Zasady:
  • Autoryzacja adaptera: x-wf2-secret == WF2_GEN_SECRET (z tn-crm/.env).
  • DB (kolumny platform_* produktów, projekt) przez helpery panel-sync (service-role).
  • Idempotencja: ensure_product po nazwie, publish nadpisuje HTML, PATCH-e powtarzalne.
  • Po każdej komendzie wypisywane DOWODY (URL-e + statusy) — sesja wkleja je do
    checklisty kroku przez panel-sync.

Komendy (CLI):
  shops                              lista sklepów partnera + które zajęte (projekt)
  link-shop  <project> <shop_id>     przypnij sklep do projektu (platform_shop_id + link)
  status     <project>               pełny stan platformy vs DB (produkty/strony/integracje/domena)
  branding   <project>               upload logo+favicon z kontraktu marki (logo_url/favicon_url)
  product    <project> <prod|slug>   ensure_product + slug kasy + zapis kolumn platform_*
  publish    <project> <prod|slug>   podmiana placeholderów + publish_landing + weryfikacja + kolumny
  home       <project> <plik.html>   publikacja strony głównej (path:'') z pliku
  unpublish  <project> <path>        isHtml:false (powrót do sekcji platformy)

⚠️ PUŁAPKI:
  • checkoutUrl materializuje się z OPÓŹNIENIEM — komenda `product` składa go
    deterministycznie z activeDomain + sluga (kontrakt: /checkout?p=<slug>).
  • noindex: zdejmowany TYLKO gdy sklep stoi na domenie docelowej (isOnCustomDomain)
    — na domenie starter zostaje (indeksacja złej domeny). Wymuszenie: --strip-noindex.
  • Landing MUSI mieć runtime-snippet ({{WF2_PRODUCT_ID}}, data-checkout/data-price)
    — publish bez placeholdera product_id = FAIL (chyba że --allow-no-runtime).
"""
import os
import re
import sys
import json
import base64
import argparse
import importlib.util

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

ADAPTER = f"https://{ps.PROJECT_REF}.supabase.co/functions/v1/wf2-platform"
REPO_ROOT = os.path.abspath(os.path.join(_HERE, "..", ".."))


def _load_wf2_secret():
    try:
        with open(ps.ENV_PATH, encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if line.startswith("WF2_GEN_SECRET="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    env = os.environ.get("WF2_GEN_SECRET")
    if env:
        return env
    raise RuntimeError(f"WF2_GEN_SECRET nie znaleziony w {ps.ENV_PATH} ani w env")


WF2_SECRET = _load_wf2_secret()


def _load_watermark_salt():
    """Dedykowana sól watermarku (opcjonalna). Gdy brak → _harden użyje ps.KEY (service
    key) jako sekretu HMAC. Osobna sól odsprzęga weryfikację znaku od rotacji service-key."""
    try:
        with open(ps.ENV_PATH, encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if line.startswith("WF2_WATERMARK_SALT="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return os.environ.get("WF2_WATERMARK_SALT")


def build_id(product_id):
    """WATERMARK niewywnioskowalny z HTML: HMAC-SHA256(sekret, 'wf2:'+product_id)[:16].
    Sekret = WF2_WATERMARK_SALT (jeśli jest) lub SUPABASE_SERVICE_KEY (ps.KEY) — kopista
    go NIE MA, więc nie odtworzy znaku; MY odtwarzamy zawsze (dowód DMCA: recompute →
    match). Zastępuje dawne md5('wf2:'+id) [product_id JAWNY → red team odtworzył w minutę]."""
    import hmac, hashlib
    secret = (_load_watermark_salt() or getattr(ps, "KEY", None) or "wf2-fallback").encode()
    return hmac.new(secret, ("wf2:" + str(product_id)).encode(), hashlib.sha256).hexdigest()[:16]


def log(msg):
    print(f"[platform-sync] {msg}", flush=True)


def adapter(payload, timeout=180):
    r = requests.post(ADAPTER, data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
                      headers={"Content-Type": "application/json", "x-wf2-secret": WF2_SECRET},
                      timeout=timeout)
    try:
        out = r.json()
    except Exception:
        raise SystemExit(f"[platform-sync] adapter HTTP {r.status_code}: {r.text[:300]}")
    if r.status_code != 200:
        raise SystemExit(f"[platform-sync] adapter {r.status_code}: {json.dumps(out, ensure_ascii=False)[:300]}")
    return out


def adapter_ok(payload, what, timeout=180):
    out = adapter(payload, timeout=timeout)
    if out.get("status") != 200:
        raise SystemExit(f"[platform-sync] {what} FAIL {out.get('status')}: {json.dumps(out.get('data'), ensure_ascii=False)[:400]}")
    return out.get("data")


# ── DB (REST przez helpery panel-sync) ──
def _project(project_id):
    rows = ps._get("wf2_projects", {"id": f"eq.{project_id}",
                                    "select": "id,name,platform_shop_id,domain,logo_url,favicon_url,pixel_id,links"})
    if not rows:
        raise SystemExit(f"[platform-sync] projekt {project_id} nie istnieje")
    return rows[0]


def _shop_id(project):
    sid = project.get("platform_shop_id")
    if not sid:
        raise SystemExit("[platform-sync] projekt BEZ platform_shop_id — najpierw `link-shop` (picker w panelu, krok pl_sklep)")
    return sid


def _product_row(project_id, ref):
    sel = "id,name,slug,price,status,platform_product_id,platform_variant_id,platform_name,checkout_url,platform_page_url,repo_path"
    rows = ps._get("wf2_products", {"project_id": f"eq.{project_id}", "id": f"eq.{ref}", "select": sel}) \
        if re.fullmatch(r"[0-9a-f-]{36}", ref, re.I) else \
        ps._get("wf2_products", {"project_id": f"eq.{project_id}", "slug": f"eq.{ref}", "select": sel})
    if not rows:
        raise SystemExit(f"[platform-sync] produkt '{ref}' nie znaleziony w projekcie")
    return rows[0]


def _active_domain(shop_id):
    d = adapter_ok({"action": "domains", "shop_id": shop_id}, "domains")
    return d.get("activeDomain") or d.get("starterDomain"), bool(d.get("isOnCustomDomain"))


# ── Komendy ──
def cmd_shops(_a):
    stores = adapter_ok({"action": "stores"}, "stores")
    taken = {p["platform_shop_id"]: p for p in ps._get(
        "wf2_projects", {"platform_shop_id": "not.is.null", "select": "id,name,customer_name,platform_shop_id"})}
    for st in stores:
        t = taken.get(st["id"])
        owner = f"ZAJĘTY → {t.get('name') or t.get('customer_name') or t['id']}" if t else "wolny"
        print(f"{st['id']}  {st['name']:<24} {st['activeDomain']:<44} {owner}")


def cmd_link_shop(a):
    stores = adapter_ok({"action": "stores"}, "stores")
    hit = next((s for s in stores if s["id"] == a.shop_id), None)
    if not hit:
        raise SystemExit(f"[platform-sync] sklep {a.shop_id} nie istnieje na koncie partnera (sprawdź `shops`)")
    taken = ps._get("wf2_projects", {"platform_shop_id": f"eq.{a.shop_id}", "select": "id,name"})
    other = [t for t in taken if t["id"] != a.project]
    if other and not a.force:
        raise SystemExit(f"[platform-sync] sklep ZAJĘTY przez projekt {other[0]['id']} ({other[0].get('name')}) — użyj --force gdy świadomie")
    ps._patch("wf2_projects", {"id": f"eq.{a.project}"}, {"platform_shop_id": a.shop_id})
    ps.project_link_add(a.project, "Sklep (platforma)", f"https://{hit['activeDomain']}", icon="ph-storefront")
    log(f"DOWÓD: platform_shop_id={a.shop_id} · sklep '{hit['name']}' · https://{hit['activeDomain']}")


def cmd_status(a):
    pr = _project(a.project)
    sid = _shop_id(pr)
    dom, custom = _active_domain(sid)
    print(f"SKLEP: {sid} · domena aktywna: {dom} · custom: {custom}")
    prods = adapter_ok({"action": "products", "shop_id": sid, "page_size": 50}, "products").get("data", [])
    db = ps._get("wf2_products", {"project_id": f"eq.{a.project}", "select": "name,slug,price,platform_product_id,checkout_url,platform_page_url,status"})
    by_pid = {p.get("platform_product_id"): p for p in db if p.get("platform_product_id")}
    print(f"PRODUKTY na platformie ({len(prods)}):")
    for p in prods:
        v = (p.get("variants") or [{}])[0]
        local = by_pid.get(p["id"])
        tag = f"↔ {local['name']} [{local['status']}]" if local else "(spoza portfela)"
        drift = ""
        if local and local.get("price") is not None and v.get("price") is not None and float(local["price"]) != float(v["price"]):
            drift = f"  ⚠️ ROZJAZD CENY panel {local['price']} vs platforma {v['price']}"
        print(f"  {p['name']:<40} {v.get('price')} {v.get('currency','')} slug={v.get('checkoutSlug')} kasa={'OK' if v.get('checkoutUrl') else '—'} {tag}{drift}")
    pages = adapter_ok({"action": "pages", "shop_id": sid}, "pages").get("pages", [])
    custom_pages = [g for g in pages if g.get("path") not in ("", "products", "search", "cart", "checkout", "contact", "regulation", "privacy-policy", "payment/result", "order", "return") and "[" not in (g.get("path") or "")]
    print(f"PODSTRONY własne ({len(custom_pages)}): " + ", ".join(f"/{g['path']}" for g in custom_pages) if custom_pages else "PODSTRONY własne: brak")
    ints = adapter_ok({"action": "integrations", "shop_id": sid}, "integrations")
    on = [i["type"] for i in ints if i.get("isActive")]
    print("INTEGRACJE aktywne: " + (", ".join(on) if on else "żadna (pixel czeka na Etap 4)"))


def cmd_branding(a):
    pr = _project(a.project)
    sid = _shop_id(pr)
    done = []
    for kind, url in (("upload_logo", pr.get("logo_url")), ("upload_favicon", pr.get("favicon_url"))):
        if not url:
            log(f"{kind}: BRAK URL w kontrakcie marki (wf2_projects) — pomijam")
            continue
        raw = requests.get(url, timeout=60).content
        b64 = base64.b64encode(raw).decode("ascii")
        d = adapter_ok({"action": kind, "shop_id": sid, "base64": b64,
                        "file_name": os.path.basename(url.split("?")[0])}, kind)
        done.append(f"{kind} → {d.get('url')}")
    for line in done:
        log("DOWÓD: " + line)


def cmd_product(a):
    pr = _project(a.project)
    sid = _shop_id(pr)
    p = _product_row(a.project, a.product)
    if p.get("price") is None:
        raise SystemExit("[platform-sync] produkt bez ceny TEST (kolumna price) — najpierw kalkulacja (krok wybor)")
    if not p.get("slug"):
        raise SystemExit("[platform-sync] produkt bez sluga (kolumna slug) — najpierw mini-marka (lp_styl_marka)")
    name = a.name or p.get("platform_name") or p["name"]
    ep = adapter_ok({"action": "ensure_product", "shop_id": sid, "name": name, "price": float(p["price"])}, "ensure_product")
    pid = ep.get("id")
    listing = adapter_ok({"action": "products", "shop_id": sid, "search": name, "page_size": 50}, "products")
    hit = next((x for x in listing.get("data", []) if x.get("id") == pid), None)
    vid = (hit or {}).get("variants", [{}])[0].get("id")
    if not (pid and vid):
        raise SystemExit("[platform-sync] brak product/variant id po ensure_product")
    adapter_ok({"action": "set_checkout_slug", "shop_id": sid, "product_id": pid, "variant_id": vid, "slug": p["slug"]}, "set_checkout_slug")
    dom, _ = _active_domain(sid)
    checkout = f"https://{dom}/checkout?p={p['slug']}"
    ps.product_meta(p["id"], {"platform_product_id": pid, "platform_name": name, "checkout_url": checkout})
    ps._patch("wf2_products", {"id": f"eq.{p['id']}"}, {"platform_variant_id": vid, "platform_price": float(p["price"]), "platform_synced_at": ps._now()})
    kasa = requests.get(checkout, timeout=30).status_code
    log(f"DOWÓD: produkt '{name}' pid={pid} vid={vid} slug={p['slug']} · kasa {checkout} → HTTP {kasa}")
    if kasa != 200:
        log("⚠️ kasa nie odpowiada 200 — sprawdź za kilka minut (materializacja) i ponów")


def _substitute(html, wf2_product_id, canonical, pixel_id, checkout_url, strip_noindex):
    html = html.replace("{{WF2_PRODUCT_ID}}", wf2_product_id or "")
    html = html.replace("{{CANONICAL_URL}}", canonical)
    if checkout_url:
        html = html.replace("{{CHECKOUT_URL}}", checkout_url)
    if pixel_id:
        html = html.replace("{{PIXEL_ID}}", pixel_id)
    # Stopka → strony prawne (ścieżki względne = działają na każdej domenie). 4 systemowe
    # nadpisujemy własnym HTML + 3 custom — komplet publikuje legal-forge.py (krok pl_prawne,
    # PRZED landingami w kolejności kroków; SSOT docs/zbuduje/PRAWNE.md).
    for ph, target in (("{{REGULAMIN_URL}}", "/regulation"), ("{{POLITYKA_URL}}", "/privacy-policy"),
                       ("{{ZWROTY_URL}}", "/return"), ("{{KONTAKT_URL}}", "/contact"),
                       ("{{DOSTAWA_URL}}", "/dostawa"), ("{{COOKIES_URL}}", "/polityka-cookies"),
                       ("{{ODSTAPIENIE_URL}}", "/formularz-odstapienia")):
        html = html.replace(ph, target)
    if strip_noindex:
        html = re.sub(r'<meta[^>]+name="robots"[^>]+noindex[^>]*>\s*', "", html, flags=re.I)
    return html


def _harden(html, product_id, brand):
    """Ochrona przed kopiowaniem: ukryć kodu się NIE DA (przeglądarka musi go dostać), więc
    (1) strip komentarzy fabryki + collapse whitespace poza script/pre/textarea (know-how
    i czytelność znikają), (2) WATERMARK niewywnioskowalny — build_id() = HMAC(sekret,
    'wf2:'+product_id)[:16], rozsiany w 4 MIEJSCACH: <meta name=build>, <body data-b>,
    komentarz ©, oraz UKRYTY span indeksowalny przez Google (skaner SERP celuje w niego).
    Usunięcie jednego locusa nie kasuje tropu; sekret znany tylko nam → dowód DMCA.
    (3) nota © na szczycie. Warstwa runtime = origin-gate w wf2-landing-api (kopia na obcej
    domenie ma martwą cenę/checkout; furtka *.vercel.app zamknięta 23.07)."""
    fp = build_id(product_id)
    # wytnij bloki nietykalne
    holes = []
    def _hole(m):
        holes.append(m.group(0))
        return "\x00H%d\x00" % (len(holes) - 1)
    guarded = re.sub(r"<script\b[\s\S]*?</script>|<pre\b[\s\S]*?</pre>|<textarea\b[\s\S]*?</textarea>",
                     _hole, html, flags=re.I)
    guarded = re.sub(r"<!--[\s\S]*?-->", "", guarded)          # komentarze fabryki out
    guarded = re.sub(r"[ \t]*\n\s*", "\n", guarded)            # wcięcia/puste linie out
    guarded = re.sub(r"\n{2,}", "\n", guarded)
    for i, h in enumerate(holes):
        guarded = guarded.replace("\x00H%d\x00" % i, h)
    guarded = guarded.replace("<body", '<body data-b="%s"' % fp, 1)
    guarded = re.sub(r"(<head[^>]*>)", r'\1<meta name="build" content="%s">' % fp, guarded, count=1)
    # ukryty, indeksowalny locus (a11y: aria-hidden; poza kadrem; prefiks 'wf2·' = celny
    # zapytanie skanera SERP i jednoznaczny trop w notice DMCA)
    # wzorzec sr-only (clip) — gwarantuje ZERO h-scroll (twarde gate'y!) w odróżnieniu od left:-9999px
    mark = ('<span aria-hidden="true" data-mk style="position:absolute;width:1px;height:1px;'
            'padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;'
            'border:0">wf2·%s</span>' % fp)
    if re.search(r"</body>", guarded, flags=re.I):
        guarded = re.sub(r"(</body>)", lambda m: mark + m.group(1), guarded, count=1, flags=re.I)
    nota = ("<!-- (c) %s. Wszystkie prawa zastrzezone. Kod, uklad i tresci tej strony sa utworem; "
            "kopiowanie = naruszenie praw autorskich. Build %s identyfikuje kazda kopie. -->"
            % (brand or "sklep", fp))
    guarded = re.sub(r"(<!doctype[^>]*>\s*)", lambda m: m.group(1) + nota + "\n", guarded, count=1, flags=re.I)
    return guarded


def cmd_publish(a):
    pr = _project(a.project)
    sid = _shop_id(pr)
    p = _product_row(a.project, a.product)
    src = a.file or (os.path.join(REPO_ROOT, p["repo_path"], "index.html") if p.get("repo_path")
                     else os.path.join(REPO_ROOT, "sklepy", "tomek-niedzwiecki", p["slug"], "index.html"))
    if not os.path.isfile(src):
        raise SystemExit(f"[platform-sync] brak pliku landinga: {src} (podaj --file)")
    html = open(src, encoding="utf-8").read()
    if "{{WF2_PRODUCT_ID}}" not in html and not a.allow_no_runtime:
        raise SystemExit("[platform-sync] HTML bez {{WF2_PRODUCT_ID}} — brak runtime-snippetu (landing-runtime-snippet.html). Wymuszenie: --allow-no-runtime")
    dom, custom = _active_domain(sid)
    path = a.path if a.path is not None else p["slug"]
    canonical = f"https://{dom}/{path}" if path else f"https://{dom}"
    strip = a.strip_noindex or custom
    html = _substitute(html, p["id"], canonical, pr.get("pixel_id"), p.get("checkout_url"), strip)
    if not getattr(a, "no_harden", False):
        html = _harden(html, p["id"], p.get("platform_name") or p["name"])
        log("harden: strip komentarzy + collapse + fingerprint (ochrona przed kopiami)")
    d = adapter_ok({"action": "publish_landing", "shop_id": sid, "path": path, "html": html,
                    "name": a.name or p.get("platform_name") or p["name"]}, "publish_landing")
    url = d.get("url") or canonical
    live = requests.get(url, timeout=30)
    ok_id = p["id"] in live.text
    ps.product_meta(p["id"], {"platform_page_url": url})
    ps.project_link_add(a.project, f"Landing {p.get('platform_name') or p['name']} (platforma)", url, icon="ph-rocket-launch")
    log(f"DOWÓD: publish {url} → HTTP {live.status_code} · {d.get('bytes')} B · runtime product_id w HTML: {'TAK' if ok_id else 'NIE'} · noindex {'ZDJĘTY' if strip else 'ZOSTAJE (domena starter)'}")
    if live.status_code != 200 or not ok_id:
        raise SystemExit("[platform-sync] weryfikacja po publish FAIL — obejrzyj stronę")


def cmd_home(a):
    pr = _project(a.project)
    sid = _shop_id(pr)
    if not os.path.isfile(a.file):
        raise SystemExit(f"[platform-sync] brak pliku: {a.file}")
    html = open(a.file, encoding="utf-8").read()
    dom, custom = _active_domain(sid)
    html = _substitute(html, "", f"https://{dom}", pr.get("pixel_id"), None, a.strip_noindex or custom)
    if not getattr(a, "no_harden", False):
        html = _harden(html, pr["id"], pr.get("name"))
        log("harden: strip komentarzy + collapse + fingerprint (ochrona przed kopiami)")
    d = adapter_ok({"action": "publish_landing", "shop_id": sid, "path": "", "html": html}, "publish_landing(home)")
    url = d.get("url") or f"https://{dom}"
    live = requests.get(url, timeout=30).status_code
    ps.project_link_add(a.project, "Strona główna (platforma)", url, icon="ph-house")
    log(f"DOWÓD: home {url} → HTTP {live} · {d.get('bytes')} B")


def cmd_page(a):
    """Generyczna podstrona z pliku (prawne/kontakt itp.) — bez produktu i bez wymogu runtime."""
    pr = _project(a.project)
    sid = _shop_id(pr)
    if not os.path.isfile(a.file):
        raise SystemExit(f"[platform-sync] brak pliku: {a.file}")
    html = open(a.file, encoding="utf-8").read()
    dom, custom = _active_domain(sid)
    html = _substitute(html, "", f"https://{dom}/{a.path}", pr.get("pixel_id"), None, a.strip_noindex or custom)
    d = adapter_ok({"action": "publish_landing", "shop_id": sid, "path": a.path, "html": html,
                    "name": a.name or a.path}, "publish_landing(page)")
    url = d.get("url") or f"https://{dom}/{a.path}"
    live = requests.get(url, timeout=30).status_code
    log(f"DOWÓD: page /{a.path} → {url} → HTTP {live} · {d.get('bytes')} B")


def cmd_unpublish(a):
    pr = _project(a.project)
    d = adapter({"action": "unpublish_landing", "shop_id": _shop_id(pr), "path": a.path})
    log(f"unpublish /{a.path} → {d.get('status')}")


def main():
    ap = argparse.ArgumentParser(description="MOST fabryka ↔ platforma e-commerce (adapter wf2-platform). Idempotentne komendy z dowodami.")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("shops", help="lista sklepów partnera + zajętość")
    s = sub.add_parser("link-shop", help="przypnij sklep do projektu")
    s.add_argument("project"); s.add_argument("shop_id"); s.add_argument("--force", action="store_true")
    s = sub.add_parser("status", help="stan platformy vs DB")
    s.add_argument("project")
    s = sub.add_parser("branding", help="upload logo+favicon z kontraktu marki")
    s.add_argument("project")
    s = sub.add_parser("product", help="produkt + slug kasy + kolumny platform_*")
    s.add_argument("project"); s.add_argument("product"); s.add_argument("--name")
    s = sub.add_parser("publish", help="publikacja landinga produktu")
    s.add_argument("project"); s.add_argument("product"); s.add_argument("--file"); s.add_argument("--path")
    s.add_argument("--name"); s.add_argument("--strip-noindex", action="store_true")
    s.add_argument("--allow-no-runtime", action="store_true")
    s.add_argument("--no-harden", dest="no_harden", action="store_true",
                   help="pomiń ochronę przed kopiami (strip komentarzy+collapse+fingerprint)")
    s = sub.add_parser("home", help="publikacja strony głównej (path:'')")
    s.add_argument("project"); s.add_argument("file"); s.add_argument("--strip-noindex", action="store_true")
    s.add_argument("--no-harden", dest="no_harden", action="store_true",
                   help="pomiń ochronę przed kopiami (strip komentarzy+collapse+fingerprint)")
    s = sub.add_parser("page", help="generyczna podstrona z pliku (prawne/kontakt)")
    s.add_argument("project"); s.add_argument("path"); s.add_argument("file")
    s.add_argument("--name"); s.add_argument("--strip-noindex", action="store_true")
    s = sub.add_parser("unpublish", help="wyłącz custom HTML strony")
    s.add_argument("project"); s.add_argument("path")
    a = ap.parse_args()
    {"shops": cmd_shops, "link-shop": cmd_link_shop, "status": cmd_status, "branding": cmd_branding,
     "product": cmd_product, "publish": cmd_publish, "home": cmd_home, "page": cmd_page,
     "unpublish": cmd_unpublish}[a.cmd](a)


if __name__ == "__main__":
    main()

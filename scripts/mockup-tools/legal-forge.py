#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
legal-forge.py — PODSTRONY PRAWNE sklepu (krok pl_prawne). SSOT: docs/zbuduje/PRAWNE.md

Architektura „szablon raz, render wiele":
  data       <projekt>   pokaż rozwiązane dane sprzedawcy (debug/walidacja)
  render     <projekt>   szablony kanoniczne + dane z bazy → sklepy/…/prawne-<slug>/*.html
  publish    <projekt>   render + publikacja 7 podstron (platform-sync page) + weryfikacja
                         + panel-sync krok pl_prawne done
  update-all             MASOWA AKTUALIZACJA: wszystkie projekty z platform_shop_id —
                         render+publish tam, gdzie wersja live ≠ templates/prawne-sklepy/VERSION
                         (zmiana prawa ⇒ edytuj szablony, podbij VERSION, odpal update-all)

Źródło danych sprzedawcy (w kolejności): krok pl_dane (portal klienta: company/nip/address/
nrb/email_kontakt/phone) → override --set k=v → walidacja (brak wymaganych = STOP z listą).
Szablony: templates/prawne-sklepy/*.html — placeholdery {{...}} + bloki warunkowe
<!--IF:KEY-->…<!--/IF:KEY--> (znikają, gdy pole puste). Linki {{REGULAMIN_URL}} itd.
zostają — podmienia je platform-sync przy publikacji (jak w landingach).
"""
import os
import re
import sys
import json
import argparse
import datetime
import importlib.util

import requests

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass

_HERE = os.path.dirname(os.path.abspath(__file__))


def _load(name, fname):
    spec = importlib.util.spec_from_file_location(name, os.path.join(_HERE, fname))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ps = _load("panel_sync", "panel-sync.py")
pls = _load("platform_sync", "platform-sync.py")

REPO_ROOT = os.path.abspath(os.path.join(_HERE, "..", ".."))
TPL_DIR = os.path.join(REPO_ROOT, "templates", "prawne-sklepy")

# (szablon, ścieżka na platformie, nazwa strony) — 4 systemowe (linkuje je kasa platformy
# i checkout-inline) + 3 custom. Kolejność = kolejność publikacji.
PAGES = [
    ("regulamin.html", "regulation", "Regulamin"),
    ("polityka-prywatnosci.html", "privacy-policy", "Polityka prywatności"),
    ("zwroty.html", "return", "Zwroty i reklamacje"),
    ("kontakt.html", "contact", "Kontakt"),
    ("dostawa.html", "dostawa", "Dostawa i płatności"),
    ("polityka-cookies.html", "polityka-cookies", "Polityka cookies"),
    ("odstapienie.html", "formularz-odstapienia", "Formularz odstąpienia od umowy"),
]

# Checklista VERBATIM z WS w tn-sklepy/projekt.html (klucz deduplikacji panelu!)
CHECKLIST = [
    "Dane sprzedawcy kompletne (krok Dane rozliczeniowe lub override)",
    "Komplet 7 podstron z szablonów kanonicznych (PRAWNE-V)",
    "Opublikowane na platformie — 7× HTTP 200",
    "Linki w stopkach: landingi, strona główna, checkout",
]

REQUIRED = ["COMPANY_NAME", "COMPANY_ADDRESS", "EMAIL"]
DEFAULTS = {
    "DELIVERY_TIME_TYPICAL": "7–14 dni roboczych",
    "DELIVERY_TIME_MAX": "do 30 dni",
}


def log(msg):
    print(f"[legal-forge] {msg}", flush=True)


def _version():
    p = os.path.join(TPL_DIR, "VERSION")
    if not os.path.isfile(p):
        raise SystemExit(f"[legal-forge] brak {p}")
    return open(p, encoding="utf-8").read().strip()


def _project(pid):
    rows = ps._get("wf2_projects", {"id": f"eq.{pid}", "select": (
        "id,name,domain,palette,fonts,logo_url,favicon_url,platform_shop_id,"
        "platform_merchant_email,td_shop_url,lifecycle")})
    if not rows:
        raise SystemExit(f"[legal-forge] brak projektu {pid}")
    return rows[0]


def _slug(pr):
    m = re.search(r"parasol-([a-z0-9-]+)/", pr.get("logo_url") or "")
    return m.group(1) if m else re.sub(r"[^a-z0-9]+", "-", (pr.get("name") or "sklep").lower()).strip("-")


def _out_dir(pr):
    d = os.path.join(REPO_ROOT, "sklepy", "tomek-niedzwiecki", f"prawne-{_slug(pr)}")
    os.makedirs(d, exist_ok=True)
    return d


def _pl_dane_fields(pid):
    rows = ps._get("wf2_steps", {"project_id": f"eq.{pid}", "step_key": "eq.pl_dane",
                                 "select": "data"})
    return ((rows[0].get("data") or {}).get("fields") or {}) if rows else {}


def _palette(pr):
    """Parsuj wf2_projects.palette ('primary #E63946 · accent #2A9D8F · …') → tokeny CSS."""
    txt = pr.get("palette") or ""
    tok = dict(re.findall(r"([a-z-]+)\s+(#[0-9A-Fa-f]{3,8})", txt))
    fonts = pr.get("fonts") or ""
    mh = re.search(r"heading:\s*([^·(]+)", fonts)
    mb = re.search(r"body:\s*([^·(]+)", fonts)
    head = (mh.group(1).strip() if mh else "Inter")
    body = (mb.group(1).strip() if mb else "Inter")
    fam = "&family=".join(dict.fromkeys(
        [f"{f.replace(' ', '+')}:wght@400;600;700" for f in (head, body)]))
    return {
        "PRIMARY": tok.get("primary", "#2563eb"), "ACCENT": tok.get("accent", tok.get("primary", "#2563eb")),
        "INK": tok.get("ink", "#111827"), "BG": tok.get("bg", "#ffffff"),
        "BG_ALT": tok.get("bg-alt", "#f3f4f6"), "BORDER": tok.get("border", "#e5e7eb"),
        "FONT_HEAD": head, "FONT_BODY": body,
        "FONTS_LINK": f"https://fonts.googleapis.com/css2?family={fam}&display=swap",
    }


def _resolve(pr, overrides):
    f = _pl_dane_fields(pr["id"])
    dom = pr.get("domain") or (re.sub(r"^https?://", "", pr.get("td_shop_url") or "").strip("/"))
    data = dict(DEFAULTS)
    data.update({
        "BRAND_NAME": pr.get("name") or "",
        "DOMAIN": dom or "",
        "COMPANY_NAME": (f.get("company") or "").strip(),
        "COMPANY_ADDRESS": (f.get("address") or "").strip(),
        "NIP": (f.get("nip") or "").strip(),
        "REGON": (f.get("regon") or "").strip(),
        "PHONE": (f.get("phone") or "").strip(),
        "EMAIL": (f.get("email_kontakt") or "").strip() or (pr.get("platform_merchant_email") or ""),
        "RETURN_ADDRESS": (f.get("return_address") or "").strip() or (f.get("address") or "").strip(),
        "LOGO_URL": pr.get("logo_url") or "",
        "FAVICON_URL": pr.get("favicon_url") or pr.get("logo_url") or "",
        "UPDATE_DATE": datetime.date.today().strftime("%d.%m.%Y"),
        "YEAR": str(datetime.date.today().year),
        "DOC_VERSION": _version(),
    })
    data.update(_palette(pr))
    for kv in overrides or []:
        k, _, v = kv.partition("=")
        data[k.strip()] = v.strip()
    missing = [k for k in REQUIRED if not data.get(k)]
    return data, missing


def _render_one(tpl_path, data):
    html = open(tpl_path, encoding="utf-8").read()
    # bloki warunkowe: <!--IF:KEY-->…<!--/IF:KEY--> — zostają tylko gdy data[KEY] niepuste
    def _cond(m):
        return m.group(2) if data.get(m.group(1)) else ""
    html = re.sub(r"<!--IF:([A-Z_]+)-->(.*?)<!--/IF:\1-->", _cond, html, flags=re.S)
    for k, v in data.items():
        html = html.replace("{{%s}}" % k, str(v))
    left = sorted(set(re.findall(r"\{\{([A-Z_]+)\}\}", html)) - {
        "REGULAMIN_URL", "POLITYKA_URL", "ZWROTY_URL", "KONTAKT_URL",
        "DOSTAWA_URL", "COOKIES_URL", "ODSTAPIENIE_URL", "CANONICAL_URL"})
    if left:
        raise SystemExit(f"[legal-forge] nierozwiązane placeholdery w {os.path.basename(tpl_path)}: {left}")
    return html


def cmd_data(a):
    pr = _project(a.project)
    data, missing = _resolve(pr, a.set)
    for k in sorted(data):
        print(f"  {k} = {data[k][:90] if isinstance(data[k], str) else data[k]}")
    if missing:
        raise SystemExit(f"[legal-forge] BRAK WYMAGANYCH: {missing} — uzupełnij pl_dane w portalu albo --set")
    log("dane kompletne ✅")


def cmd_render(a):
    pr = _project(a.project)
    data, missing = _resolve(pr, a.set)
    if missing:
        raise SystemExit(f"[legal-forge] BRAK WYMAGANYCH: {missing} — uzupełnij pl_dane w portalu albo --set "
                         f"(krok zostaje in_progress, NIE zmyślaj danych)")
    out = _out_dir(pr)
    for tpl, path, name in PAGES:
        src = os.path.join(TPL_DIR, tpl)
        if not os.path.isfile(src):
            raise SystemExit(f"[legal-forge] brak szablonu {src}")
        html = _render_one(src, data)
        dst = os.path.join(out, tpl)
        open(dst, "w", encoding="utf-8", newline="\n").write(html)
        log(f"render {tpl} → {os.path.relpath(dst, REPO_ROOT)} ({len(html)//1024} KB)")
    return pr, data, out


def _live_check(dom, path, version, timeout=30, retries=1, wait_s=0):
    """(HTTP, wersja-złapana, świeży?) — treść przez query-bypass (edge cache platformy!).
    Origin odświeża snapshot ASYNCHRONICZNIE po PUT (minuty) → retries z odczekaniem."""
    import time
    last = ("ERR:none", None, False)
    for i in range(retries):
        if i and wait_s:
            time.sleep(wait_s)
        try:
            r = requests.get(f"https://{dom}/{path}?lfv={int(time.time())}", timeout=timeout)
            m = re.search(r"PRAWNE-V:([\w.\-]+?)-->", r.text)
            ver = m.group(1) if m else None
            last = (r.status_code, ver, bool(m and ver == version))
        except Exception as e:
            last = (f"ERR:{type(e).__name__}", None, False)
        if last[2]:
            return last
    return last


def _sync_templates_to_storage():
    """Szablony kanoniczne → Storage attachments/legal-szablony/ — źródło dla auto-odświeżenia
    w wf2-portal (zapis pl_dane przez klienta re-publikuje dokumenty; SSOT §2)."""
    names = [t for t, _, _ in PAGES] + ["VERSION"]
    for n in names:
        src = os.path.join(TPL_DIR, n)
        body = open(src, "rb").read()
        ct = "text/html; charset=utf-8" if n.endswith(".html") else "text/plain; charset=utf-8"
        r = requests.put(
            f"https://{ps.PROJECT_REF}.supabase.co/storage/v1/object/attachments/legal-szablony/{n}",
            data=body, timeout=60,
            headers={"apikey": ps.KEY, "Authorization": f"Bearer {ps.KEY}",
                     "Content-Type": ct, "x-upsert": "true"})
        if r.status_code not in (200, 201):
            raise SystemExit(f"[legal-forge] upload szablonu {n} do Storage FAIL: {r.status_code} {r.text[:200]}")
    log(f"szablony zsynchronizowane do Storage (legal-szablony/, {len(names)} plików)")


def cmd_publish(a):
    _sync_templates_to_storage()
    pr, data, out = cmd_render(a)
    dom = data["DOMAIN"]
    results = []
    for tpl, path, name in PAGES:
        ns = argparse.Namespace(project=a.project, path=path, file=os.path.join(out, tpl),
                                name=name, strip_noindex=True)
        pls.cmd_page(ns)
    for tpl, path, name in PAGES:
        # origin platformy odświeża snapshot asynchronicznie po PUT — do 8 prób co 20 s
        code, ver, fresh = _live_check(dom, path, data["DOC_VERSION"], retries=8, wait_s=20)
        results.append((path, code, ver, fresh))
    hard = [r for r in results if r[1] != 200]
    stale = [r for r in results if r[1] == 200 and not r[3]]
    for path, code, ver, fresh in results:
        log(f"weryfikacja /{path}: HTTP {code} · PRAWNE-V {ver} {'✅' if fresh else '⚠️ STALE'}")
    if hard:
        raise SystemExit(f"[legal-forge] weryfikacja FAIL (HTTP): {[(b[0], b[1]) for b in hard]}")
    if stale:
        log(f"⚠️ {len(stale)} strona/y z zamrożonym origin-snapshotem (PUT przyjęty, platforma "
            f"odświeża asynchronicznie — bywa >40 min na pojedynczej ścieżce): "
            f"{[s[0] for s in stale]}. Ustaw monitor na PRAWNE-V; NIE ponawiaj publish w pętli.")
    log("⚠️ goły URL może dodatkowo serwować starszą wersję do wygaśnięcia edge-cache platformy "
        "(README platforma-api §CACHE — DWA POZIOMY).")
    if not a.no_panel:
        stale_note = ("" if not stale else
                      f" UWAGA: {', '.join('/' + s[0] for s in stale)} czeka na odświeżenie "
                      f"origin-snapshotu platformy (PUT przyjęty; propagacja asynchroniczna).")
        note = (f"Komplet 7 podstron prawnych (PRAWNE-V {data['DOC_VERSION']}) z szablonów kanonicznych "
                f"templates/prawne-sklepy/ przez legal-forge.py: /regulation /privacy-policy /return /contact "
                f"/dostawa /polityka-cookies /formularz-odstapienia — 7× HTTP 200, świeżość zweryfikowana "
                f"na {7 - len(stale)}/7.{stale_note} "
                f"Sprzedawca: {data['COMPANY_NAME']}, {data['COMPANY_ADDRESS']}"
                + (f", NIP {data['NIP']}" if data.get("NIP") else "") + f", e-mail {data['EMAIL']}.")
        ps.step_update(a.project, None, "pl_prawne", status="done",
                       checklist=[{"t": t, "done": True} for t in CHECKLIST],
                       fields={"strony": "7 podstron (4 systemowe + dostawa/cookies/odstąpienie)",
                               "wersja": data["DOC_VERSION"]},
                       note=note)
        log("panel-sync pl_prawne done ✅")


def cmd_update_all(a):
    version = _version()
    if not a.dry_run:
        _sync_templates_to_storage()
    rows = ps._get("wf2_projects", {"select": "id,name,domain,platform_shop_id,lifecycle,td_shop_url",
                                    "platform_shop_id": "not.is.null", "order": "created_at"})
    rows = [r for r in rows if (r.get("lifecycle") or "active") == "active"]
    log(f"update-all: {len(rows)} projektów z platform_shop_id · szablony PRAWNE-V {version}")
    report = []
    for r in rows:
        dom = r.get("domain") or re.sub(r"^https?://", "", r.get("td_shop_url") or "").strip("/")
        if not dom:
            report.append((r["name"], "SKIP", "brak domeny"))
            continue
        code, live_ver, fresh = _live_check(dom, "regulation", version)
        if fresh and not a.force:
            report.append((r["name"], "OK", f"live już {live_ver}"))
            continue
        if a.dry_run:
            report.append((r["name"], "DO-AKTUALIZACJI", f"live {live_ver or code} → {version}"))
            continue
        try:
            ns = argparse.Namespace(project=r["id"], set=a.set, no_panel=False)
            cmd_publish(ns)
            report.append((r["name"], "ZAKTUALIZOWANO", f"→ {version}"))
        except SystemExit as e:
            report.append((r["name"], "FAIL", str(e)[:120]))
    print()
    for name, st, info in report:
        log(f"{st:>16} · {name} · {info}")
    fails = [x for x in report if x[1] == "FAIL"]
    if fails:
        raise SystemExit(f"[legal-forge] update-all: {len(fails)} FAIL — patrz wyżej")


def main():
    ap = argparse.ArgumentParser(description="Podstrony prawne sklepu — szablon raz, render wiele (SSOT docs/zbuduje/PRAWNE.md)")
    sub = ap.add_subparsers(dest="cmd", required=True)
    for c, fn in (("data", cmd_data), ("render", cmd_render), ("publish", cmd_publish)):
        s = sub.add_parser(c)
        s.add_argument("project")
        s.add_argument("--set", action="append", default=[], metavar="KLUCZ=WARTOŚĆ",
                       help="override danych (np. COMPANY_NAME=… REGON=… DELIVERY_TIME_MAX=…)")
        if c == "publish":
            s.add_argument("--no-panel", action="store_true", help="bez panel-sync (testy)")
        s.set_defaults(fn=fn)
    s = sub.add_parser("update-all", help="masowa aktualizacja wszystkich sklepów do bieżącej wersji szablonów")
    s.add_argument("--dry-run", action="store_true")
    s.add_argument("--force", action="store_true", help="publikuj także gdy wersja live zgodna")
    s.add_argument("--set", action="append", default=[], metavar="KLUCZ=WARTOŚĆ")
    s.set_defaults(fn=cmd_update_all)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()

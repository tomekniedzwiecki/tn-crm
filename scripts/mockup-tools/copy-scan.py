#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
copy-scan.py — SKANER KOPII LANDINGÓW (warstwa DETEKCJI, wf2).

Idea: każdy opublikowany landing niesie UKRYTY, INDEKSOWALNY watermark wstawiany
przez `platform-sync.py _harden()`:  <span aria-hidden data-mk …>wf2·<build_id></span>
gdzie build_id = HMAC-SHA256(sekret, 'wf2:'+product_id)[:16]. Sekret znamy tylko my,
więc build_id JEDNOZNACZNIE wiąże kopię z naszym produktem — i jest dowodem DMCA.

Skaner: dla WSZYSTKICH wf2_products (i opcjonalnie stron głównych = wf2_projects)
liczy build_id (importując build_id z platform-sync.py — jedyne źródło prawdy funkcji),
buduje zapytanie do wyszukiwarki `"wf2·<build_id>"` z wykluczeniem NASZYCH domen
(-site:…) i szuka trafień na obcych hostach. Trafienie obce → wiersz w wf2_copy_signals
(source='serp') + raport.

Wyszukiwarka (auto-detekcja klucza w .env, kolejność preferencji):
  1. Google Programmable Search (CSE):  GOOGLE_CSE_KEY + GOOGLE_CSE_CX  (albo GOOGLE_API_KEY + GOOGLE_CSE_CX)
  2. SerpAPI:                            SERPAPI_KEY (albo SERPAPI_API_KEY)
  3. Bing Web Search v7:                 BING_SEARCH_KEY (albo BING_API_KEY / BING_SEARCH_V7_KEY)
Gdy BRAK klucza → DRY-RUN: wypisuje gotowe zapytania + klikalne URL-e Google do ręcznego
sprawdzenia i JASNO sygnalizuje „brak klucza wyszukiwarki → zgłoś Tomkowi którego użyć".
Skaner działa od ręki po dodaniu klucza (żadnej zmiany kodu).

Komendy:
  scan                      pełny przebieg (dry-run bez klucza; live gdy klucz jest)
  id     <product_uuid>     recompute build_id produktu (dowód DMCA — patrz playbook)
  verify <product_uuid> <url>   pobierz URL i sprawdź, czy niesie nasz watermark (które loci)
  selftest                  potwierdź, że import build_id działa i jest deterministyczny

Uruchamiaj z UTF-8:  python -X utf8 scripts/mockup-tools/copy-scan.py scan --dry-run
"""
import os
import re
import sys
import json
import time
import argparse
import importlib.util
from urllib.parse import urlparse, quote_plus

import requests

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ── import platform-sync.py (build_id — JEDYNE źródło prawdy funkcji) + panel-sync (ps: REST/klucz) ──
_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("platform_sync", os.path.join(_HERE, "platform-sync.py"))
_m = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_m)          # ładuje też panel-sync jako _m.ps (service-role, REST)
build_id = _m.build_id                # HMAC(sekret,'wf2:'+id)[:16] — recompute identyczny jak przy publish
ps = _m.ps

# ── NASZE domeny (wykluczenie z SERP: -site:…). Statyczna baza + domeny projektów z bazy ──
# Kopia na TYCH hostach = nasz własny live/preview, nie plagiat. Domeny projektów dokładane dynamicznie.
OUR_DOMAINS_STATIC = [
    "trevio.pl", "trevio.shop", "tomekniedzwiecki.pl", "niedzwiecki.ai",
    "sklepy.niedzwiecki.ai", "ulepszek.pl", "localhost",
]

WATERMARK_PREFIX = "wf2·"        # 'wf2·' (U+00B7 middle dot) — celny, unikalny prefiks watermarku


def log(msg):
    print(f"[copy-scan] {msg}", flush=True)


# ── auto-detekcja providera wyszukiwarki z .env (przez ps._env_val → .env|os.environ) ──
def detect_provider():
    """Zwraca (nazwa, cfg) pierwszego providera z kompletem kluczy albo (None, {})."""
    g_key = ps._env_val("GOOGLE_CSE_KEY") or ps._env_val("GOOGLE_API_KEY") or ps._env_val("GOOGLE_SEARCH_KEY")
    g_cx = ps._env_val("GOOGLE_CSE_CX") or ps._env_val("GOOGLE_CSE_ID") or ps._env_val("GOOGLE_SEARCH_CX")
    if g_key and g_cx:
        return "google_cse", {"key": g_key, "cx": g_cx}
    s_key = ps._env_val("SERPAPI_KEY") or ps._env_val("SERPAPI_API_KEY")
    if s_key:
        return "serpapi", {"key": s_key}
    b_key = ps._env_val("BING_SEARCH_KEY") or ps._env_val("BING_API_KEY") or ps._env_val("BING_SEARCH_V7_KEY")
    if b_key:
        return "bing", {"key": b_key}
    return None, {}


def _search_google_cse(query, cfg, num=10):
    r = requests.get("https://www.googleapis.com/customsearch/v1",
                     params={"key": cfg["key"], "cx": cfg["cx"], "q": query, "num": min(num, 10)},
                     timeout=30)
    if r.status_code >= 300:
        raise RuntimeError(f"google_cse {r.status_code}: {r.text[:200]}")
    items = r.json().get("items") or []
    return [{"url": it.get("link"), "title": it.get("title"), "snippet": it.get("snippet")} for it in items]


def _search_serpapi(query, cfg, num=10):
    r = requests.get("https://serpapi.com/search.json",
                     params={"engine": "google", "q": query, "num": num, "api_key": cfg["key"]},
                     timeout=45)
    if r.status_code >= 300:
        raise RuntimeError(f"serpapi {r.status_code}: {r.text[:200]}")
    items = r.json().get("organic_results") or []
    return [{"url": it.get("link"), "title": it.get("title"), "snippet": it.get("snippet")} for it in items]


def _search_bing(query, cfg, num=10):
    r = requests.get("https://api.bing.microsoft.com/v7.0/search",
                     params={"q": query, "count": num},
                     headers={"Ocp-Apim-Subscription-Key": cfg["key"]}, timeout=30)
    if r.status_code >= 300:
        raise RuntimeError(f"bing {r.status_code}: {r.text[:200]}")
    items = (r.json().get("webPages") or {}).get("value") or []
    return [{"url": it.get("url"), "title": it.get("name"), "snippet": it.get("snippet")} for it in items]


_SEARCH = {"google_cse": _search_google_cse, "serpapi": _search_serpapi, "bing": _search_bing}


def run_search(provider, cfg, query, num=10):
    return _SEARCH[provider](query, cfg, num=num)


# ── budowa zapytania + URL ręcznego sprawdzenia ──
def build_query(bid, exclude_domains):
    phrase = f'"{WATERMARK_PREFIX}{bid}"'
    excl = " ".join(f"-site:{d}" for d in exclude_domains)
    return f"{phrase} {excl}".strip()


def manual_url(query):
    return "https://www.google.com/search?q=" + quote_plus(query)


def host_of(url):
    try:
        return (urlparse(url).hostname or "").lower().lstrip(".")
    except Exception:
        return ""


def is_our_host(host, our_domains):
    host = (host or "").lower()
    return any(host == d or host.endswith("." + d) for d in our_domains)


# ── pobranie portfela (produkty + projekty) z paginacją (PostgREST tnie do 1000) ──
def load_targets(include_projects=False, include_test=False):
    """Zwraca listę celów skanowania: dict(kind, product_id, project_id, name, customer, domain).
    kind='product' → build_id z product.id (landing produktu); kind='home' → build_id z project.id."""
    projs = ps._get_all("wf2_projects",
                        {"select": "id,name,customer_name,domain,is_test"})
    pby = {p["id"]: p for p in projs}
    prods = ps._get_all("wf2_products",
                       {"select": "id,project_id,name,slug,status"})
    targets = []
    for p in prods:
        proj = pby.get(p.get("project_id")) or {}
        if proj.get("is_test") and not include_test:
            continue
        targets.append({
            "kind": "product", "product_id": p["id"], "project_id": p.get("project_id"),
            "name": p.get("name") or p.get("slug") or "(bez nazwy)",
            "customer": proj.get("customer_name") or proj.get("name"),
            "domain": proj.get("domain"),
        })
    if include_projects:
        for p in projs:
            if p.get("is_test") and not include_test:
                continue
            targets.append({
                "kind": "home", "product_id": None, "project_id": p["id"],
                "name": f"[strona główna] {p.get('name') or ''}".strip(),
                "customer": p.get("customer_name") or p.get("name"),
                "domain": p.get("domain"),
            })
    return targets


def watermark_id(t):
    """build_id celu: produkt → z product_id; strona główna → z project_id (lustro _harden)."""
    return build_id(t["product_id"] if t["kind"] == "product" else t["project_id"])


# ── zapis sygnału (idempotentnie: GET-before-POST po source+url+build_id) ──
def signal_exists(source, url, bid):
    params = {"source": f"eq.{source}", "select": "id", "limit": "1"}
    if url:
        params["url"] = f"eq.{url}"
    if bid:
        params["build_id"] = f"eq.{bid}"
    try:
        return bool(ps._get("wf2_copy_signals", params))
    except Exception as e:
        # tabela jeszcze nie zaaplikowana (migracja czeka) — sygnalizuj raz, nie przerywaj dry-run
        raise RuntimeError(f"wf2_copy_signals niedostępna (zaaplikuj migrację 20260723b): {e}")


def insert_signal(source, host, product_id, bid, url, detail):
    row = {"source": source, "host": host, "product_id": product_id,
           "build_id": bid, "url": url, "detail": detail or {}}
    ps._post("wf2_copy_signals", row)
    log(f"SYGNAŁ zapisany: source={source} host={host} build_id={bid} url={url}")


# ── komenda: scan ──
def cmd_scan(a):
    provider, cfg = detect_provider()
    forced_dry = a.dry_run or provider is None
    our_domains = list(OUR_DOMAINS_STATIC)
    targets = load_targets(include_projects=a.include_projects, include_test=a.include_test)
    # domeny projektów → do wykluczenia (nasze żywe sklepy)
    for t in targets:
        d = (t.get("domain") or "").strip().lower()
        d = re.sub(r"^https?://", "", d).split("/")[0].lstrip(".")
        if d and d not in our_domains:
            our_domains.append(d)
    if a.max_targets:
        targets = targets[: a.max_targets]

    log(f"cele skanowania: {len(targets)} (produkty+{'home ' if a.include_projects else ''}) · "
        f"wykluczone nasze domeny: {len(our_domains)}")
    if provider:
        log(f"provider wyszukiwarki: {provider} (klucz OBECNY) → tryb {'DRY-RUN (wymuszony --dry-run)' if forced_dry else 'LIVE'}")
    else:
        log("provider wyszukiwarki: BRAK KLUCZA → DRY-RUN. "
            "⚠️ ZGŁOŚ TOMKOWI którego API użyć (Google CSE / SerpAPI / Bing) — patrz raport (koszt/limit).")

    report = {"generated_at": ps._now(), "provider": provider, "dry_run": forced_dry,
              "our_domains": our_domains, "count": len(targets), "queries": [], "hits": []}
    total_hits = 0

    for t in targets:
        bid = watermark_id(t)
        query = build_query(bid, our_domains[:12])  # cap wykluczeń — zapytanie krótkie i celne
        murl = manual_url(query)
        entry = {"kind": t["kind"], "product_id": t["product_id"], "project_id": t["project_id"],
                 "name": t["name"], "customer": t["customer"], "build_id": bid,
                 "phrase": f"{WATERMARK_PREFIX}{bid}", "query": query, "manual_url": murl}
        report["queries"].append(entry)
        print(f"  • {t['kind']:<7} {t['name'][:42]:<42} build_id={bid}  fraza=\"{WATERMARK_PREFIX}{bid}\"")
        print(f"      zapytanie: {query}")
        print(f"      ręcznie  : {murl}")

        if forced_dry:
            continue

        # LIVE: odpytaj providera, odfiltruj nasze hosty, zapisz obce trafienia
        try:
            results = run_search(provider, cfg, query, num=a.num)
        except Exception as e:
            log(f"    provider błąd dla build_id={bid}: {e} — pomijam ten cel")
            continue
        for res in results:
            url = res.get("url")
            if not url:
                continue
            h = host_of(url)
            if not h or is_our_host(h, our_domains):
                continue
            detail = {"phrase": f"{WATERMARK_PREFIX}{bid}", "provider": provider,
                      "title": res.get("title"), "snippet": res.get("snippet"),
                      "project_id": t["project_id"], "customer": t["customer"], "product_name": t["name"]}
            try:
                if signal_exists("serp", url, bid):
                    log(f"    SKIP (już w bazie) {h} build_id={bid}")
                else:
                    insert_signal("serp", h, t["product_id"], bid, url, detail)
                total_hits += 1
                report["hits"].append({"host": h, "url": url, "build_id": bid,
                                       "product_id": t["product_id"], "customer": t["customer"],
                                       "title": res.get("title")})
                print(f"      ⚠️ OBCE TRAFIENIE: {h}  {url}")
            except RuntimeError as e:
                log(f"    zapis sygnału nieudany: {e}")
        if a.sleep:
            time.sleep(a.sleep)   # grzeczność dla API (rate-limit)

    if forced_dry:
        log(f"DRY-RUN zakończony — {len(targets)} zapytań gotowych. Zero odpytań sieci, zero zapisów.")
        if provider is None:
            log("Dodaj klucz do .env (GOOGLE_CSE_KEY+GOOGLE_CSE_CX | SERPAPI_KEY | BING_SEARCH_KEY) i uruchom bez --dry-run.")
    else:
        log(f"LIVE zakończony — obcych trafień: {total_hits} (zapisane do wf2_copy_signals source='serp').")

    if a.out:
        with open(a.out, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        log(f"raport JSON → {a.out}")


# ── komenda: id (recompute build_id — dowód DMCA) ──
def cmd_id(a):
    bid = build_id(a.product_id)
    print(f"product_id={a.product_id}")
    print(f"build_id   ={bid}")
    print(f"watermark  ={WATERMARK_PREFIX}{bid}   (fraza SERP: \"{WATERMARK_PREFIX}{bid}\")")
    print(f"loci w HTML: <meta name=\"build\" content=\"{bid}\"> · <body data-b=\"{bid}\"> · "
          f"komentarz „Build {bid}” · <span data-mk>{WATERMARK_PREFIX}{bid}</span>")


# ── komenda: verify (pobierz URL i potwierdź watermark — krok (a) playbooku DMCA) ──
def cmd_verify(a):
    bid = build_id(a.product_id)
    log(f"recompute: product_id={a.product_id} → build_id={bid}")
    try:
        r = requests.get(a.url, timeout=30, headers={"User-Agent": "wf2-copy-scan/1.0"})
    except Exception as e:
        raise SystemExit(f"[copy-scan] nie udało się pobrać {a.url}: {e}")
    html = r.text
    checks = {
        "span data-mk (wf2·<id>)": f"{WATERMARK_PREFIX}{bid}" in html or f"wf2·{bid}" in html,
        "meta name=build":         re.search(r'<meta[^>]+name=["\']build["\'][^>]+content=["\']%s["\']' % re.escape(bid), html, re.I) is not None,
        "body data-b":             re.search(r'<body[^>]*data-b=["\']%s["\']' % re.escape(bid), html, re.I) is not None,
        "komentarz Build":         ("Build %s" % bid) in html,
        "surowy build_id":         bid in html,
    }
    hit = [k for k, v in checks.items() if v]
    print(f"URL: {a.url}  (HTTP {r.status_code}, {len(html)} B)")
    for k, v in checks.items():
        print(f"  [{'x' if v else ' '}] {k}")
    if hit:
        print(f"\n✔ POTWIERDZONE — kopia niesie nasz watermark build_id={bid} (loci: {', '.join(hit)}).")
        print("  → to jednoznaczny dowód własności (sekret HMAC znany tylko nam). Można iść z notice DMCA.")
        if a.save:
            h = host_of(a.url)
            detail = {"confirmed_loci": hit, "http_status": r.status_code, "bytes": len(html),
                      "checked_at": ps._now(), "note": "verify CLI"}
            try:
                if not signal_exists("manual", a.url, bid):
                    insert_signal("manual", h, a.product_id, bid, a.url, detail)
            except RuntimeError as e:
                log(f"zapis sygnału pominięty: {e}")
    else:
        print(f"\n[!] BRAK watermarku build_id={bid} w treści — to NIE ta kopia (albo watermark usunięty/"
              "strona renderowana JS). Sprawdź inny produkt (`id`) lub źródło strony ręcznie.")


# ── komenda: selftest (import + determinizm build_id) ──
def cmd_selftest(_a):
    sample = "00000000-0000-0000-0000-000000000000"
    a1 = build_id(sample)
    a2 = build_id(sample)
    log(f"import build_id z platform-sync.py: OK ({build_id.__module__})")
    log(f"build_id({sample}) = {a1}")
    assert a1 == a2, "build_id NIEDETERMINISTYCZNY (ta sama wartość musi dać ten sam wynik)!"
    assert re.fullmatch(r"[0-9a-f]{16}", a1), f"build_id nie jest 16 hex: {a1!r}"
    log("determinizm: OK (dwa wywołania = ta sama wartość, 16 hex)")
    # dowód, że różne id → różne build_id
    b = build_id("11111111-1111-1111-1111-111111111111")
    assert b != a1, "różne product_id dały ten sam build_id!"
    log(f"rozróżnialność: OK ({a1} != {b})")
    prov, _ = detect_provider()
    log(f"provider wyszukiwarki w .env: {prov or 'BRAK (skaner poleci w DRY-RUN)'}")
    print("SELFTEST OK")


def main():
    ap = argparse.ArgumentParser(description="Skaner kopii landingów (watermark build_id → SERP → wf2_copy_signals).")
    sub = ap.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("scan", help="pełny przebieg (dry-run bez klucza; live gdy klucz jest)")
    s.add_argument("--dry-run", action="store_true", help="wymuś dry-run nawet gdy klucz jest (zero sieci/zapisów)")
    s.add_argument("--include-projects", action="store_true", help="dołóż strony główne (build_id z project_id)")
    s.add_argument("--include-test", action="store_true", help="nie pomijaj projektów is_test")
    s.add_argument("--max-targets", type=int, help="ogranicz liczbę celów (debug)")
    s.add_argument("--num", type=int, default=10, help="ile wyników na zapytanie (live)")
    s.add_argument("--sleep", type=float, default=0.0, help="pauza [s] między zapytaniami (rate-limit)")
    s.add_argument("--out", help="zapisz raport JSON do pliku")

    s = sub.add_parser("id", help="recompute build_id produktu (dowód DMCA)")
    s.add_argument("product_id")

    s = sub.add_parser("verify", help="pobierz URL i sprawdź, czy niesie nasz watermark")
    s.add_argument("product_id")
    s.add_argument("url")
    s.add_argument("--save", action="store_true", help="zapisz potwierdzenie do wf2_copy_signals (source='manual')")

    sub.add_parser("selftest", help="potwierdź import build_id + determinizm")

    a = ap.parse_args()
    {"scan": cmd_scan, "id": cmd_id, "verify": cmd_verify, "selftest": cmd_selftest}[a.cmd](a)


if __name__ == "__main__":
    main()

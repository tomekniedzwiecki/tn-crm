#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
panel-sync.py — MOST fabryka landingów ↔ panel „tn-sklepy" (wf2_*).

Cel: każda faza fabryki (F0…F8, kampanie, testy) na KOŃCU zapisuje swój postęp do
panelu, żeby Tomek widział stan bez zaglądania do plików na Desktopie. Panel czyta:
  wf2_products (portfel + ceny/koszt/marża w KOLUMNACH), wf2_steps (postęp + checklisty
  + fields), wf2_artifacts (oglądalne kafle: makiety/branding/dowody/kreacje).

Zasady:
  • Czysty REST (requests) na projekcie yxmavwkwnfuphjqbelws, service-role (bypass RLS).
  • Klucz z c:\\repos_tn\\tn-crm\\.env → SUPABASE_SERVICE_KEY (sb_secret_*).
  • Idempotencja PO STRONIE PYTHONA: GET → (PATCH | POST). Uruchomienie N razy = ten sam stan.
  • Payloady PL kodowane jawnie do UTF-8 (obejście pułapki Windows cp1250).

Importowalne funkcje:
  link_product(project, tt, name, slug, sort, cover, supplier) -> product_id
  step_update(project, product, step, status, note, fields, checklist) -> step_id
  artifact_add(project, product, step, kind, url, label, meta, storage) -> artifact_id
  product_meta(product, patch: dict) -> dict            # WHITELISTA kolumn
  project_link_add(project, label, url, icon) -> links
  storage_upload(local, dest, bucket, ...) -> url  # rehost do Storage (+opcjonalny PIL);
                                                   # bucket prywatny -> zwraca 'bucket/ścieżkę'
  doc_add(project, product, step, local, slug, ...) -> artifact_id
      # DOKUMENTY FABRYKI (.md/.json): upload do PRYWATNEGO bucketa wf2-docs/<slug>/<plik>
      # + artefakt storage='supabase' url='wf2-docs/<slug>/<plik>' -> KLIKALNY chip w panelu
      # (signed URL po stronie panelu). Desktop = tylko kopia robocza, NIE źródło prawdy.

⚠️ PUŁAPKI (patrz docs/zbuduje/MOST-PANEL.md):
  • Checklisty panelu mergują po DOKŁADNYM tekście `t` z obiektu WS w projekt.html — teksty
    muszą być VERBATIM, inaczej sieroty. (Backfill wyciąga je wprost z projekt.html.)
  • Ceny/koszt/marża panel czyta z KOLUMN produktu (product_meta), NIE z step.data.fields.
  • Miniatura w panelu: storage∈{supabase,external} I (rozszerzenie obrazu LUB kind graficzny).
  • DOKI (.md/.json) → ZAWSZE doc_add() / CLI `doc` (bucket wf2-docs, PRYWATNY — karta/ledger
    niosą koszty i marże, NIE wolno ich do publicznego 'attachments'). storage='desktop'
    = ZAKAZ dla nowych artefaktów (martwy chip, plik niedostępny poza tym komputerem —
    incydent masażer 19.07); 'repo' tylko dla plików realnie commitowanych do repo.
  • Wiązanie artefaktu z krokiem = (product_id + step_key).

CLI: patrz `panel-sync.py -h`.
"""
import os
import sys
import json
import math
import random
import argparse
import mimetypes
from datetime import datetime, timezone

import requests

# UTF-8 na stdout/stderr (Windows cp1250/cp1252 crashuje na ↔/„…" w log/help — audyt 18.07 P0)
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ── Konfiguracja stała (projekt CRM, NIE ZE_SUPABASE_URL — to inny projekt!) ──
PROJECT_REF = "yxmavwkwnfuphjqbelws"
REST = f"https://{PROJECT_REF}.supabase.co/rest/v1"
STORAGE = f"https://{PROJECT_REF}.supabase.co/storage/v1"
PUBLIC_BASE = f"{STORAGE}/object/public"
ENV_PATH = os.environ.get("TN_CRM_ENV", r"C:\repos_tn\tn-crm\.env")
DEFAULT_BUCKET = "attachments"
DOCS_BUCKET = "wf2-docs"                       # PRYWATNY bucket dokumentów fabryki (migracja 20260719e)
PRIVATE_BUCKETS = {"wf2-docs", "contracts", "wf2-video", "wfa-intake", "wfa-test-shots"}

PRODUCT_META_WHITELIST = {
    "price", "cost_purchase", "cost_shipping", "fees_pct", "margin_mode", "status",
    "slug", "repo_path", "name", "cover_url", "platform_product_id", "checkout_url",
    "platform_name", "platform_page_url", "campaign_id", "video_url", "video_cost_usd",
    "video_ai_labeled", "video_status", "video_pattern_tiktok_url", "ads_creatives", "notes",
}


# ── Klucz service-role: .env (PYTHONEM) → fallback zmienna środowiskowa ──
def _load_key():
    try:
        with open(ENV_PATH, encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                if k.strip() == "SUPABASE_SERVICE_KEY":
                    return v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    env = os.environ.get("SUPABASE_SERVICE_KEY")
    if env:
        return env
    raise RuntimeError(f"SUPABASE_SERVICE_KEY nie znaleziony w {ENV_PATH} ani w env")


KEY = _load_key()
H = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}
HJSON = {**H, "Content-Type": "application/json"}


def _env_val(name):
    """Wartość dowolnej zmiennej z .env (TN_CRM_ENV) → fallback os.environ. None gdy brak.
    Używane m.in. do opcjonalnego BUD_TOOLS_SECRET (realna bramka backendu edge bud-ali-snapshot)."""
    try:
        with open(ENV_PATH, encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                if k.strip() == name:
                    return v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return os.environ.get(name)


def log(msg):
    print(f"[panel-sync] {msg}", flush=True)


def _now():
    return datetime.now(timezone.utc).isoformat()


def _body(obj):
    # PL bezpiecznie: dumps(ensure_ascii=False) → jawny UTF-8 bytes (obejście cp1250)
    return json.dumps(obj, ensure_ascii=False).encode("utf-8")


def _scope_param(params, product):
    params["product_id"] = f"eq.{product}" if product else "is.null"
    return params


# ── Cienka warstwa REST ──
def _get(table, params):
    r = requests.get(f"{REST}/{table}", headers=H, params=params, timeout=30)
    if r.status_code >= 300:
        raise RuntimeError(f"GET {table} {r.status_code}: {r.text}")
    return r.json()


def _post(table, row, prefer="return=representation"):
    r = requests.post(f"{REST}/{table}", headers={**HJSON, "Prefer": prefer},
                      data=_body(row), timeout=60)
    if r.status_code >= 300:
        raise RuntimeError(f"POST {table} {r.status_code}: {r.text}")
    return r.json() if r.text.strip() else None


def _patch(table, params, patch, prefer="return=representation"):
    r = requests.patch(f"{REST}/{table}", headers={**HJSON, "Prefer": prefer},
                       params=params, data=_body(patch), timeout=60)
    if r.status_code >= 300:
        raise RuntimeError(f"PATCH {table} {r.status_code}: {r.text}")
    return r.json() if r.text.strip() else None


def _rpc(fn, args):
    r = requests.post(f"{REST}/rpc/{fn}", headers=HJSON, data=_body(args), timeout=60)
    if r.status_code >= 300:
        raise RuntimeError(f"RPC {fn} {r.status_code}: {r.text}")
    return r


def _first_id(res):
    if isinstance(res, list):
        return res[0]["id"]
    if isinstance(res, dict):
        return res.get("id")
    return None


# ── 1. link_product ──
def link_product(project, tt, name, slug=None, sort=None, cover=None, supplier=None):
    """Podłącza produkt (tt_product_id) do portfela projektu. Idempotentne po (project, tt).
    Po insercie dosiewa kroki (wf2_ensure_steps). Zwraca product_id."""
    existing = _get("wf2_products", {
        "project_id": f"eq.{project}", "tt_product_id": f"eq.{tt}", "select": "id,name,sort"})
    if existing:
        pid = existing[0]["id"]
        log(f"link_product: SKIP (istnieje) tt={tt} name={existing[0].get('name')!r} → {pid}")
        return pid
    if sort is None:
        sort = len(_get("wf2_products", {"project_id": f"eq.{project}", "select": "id"}))
    row = {"project_id": project, "tt_product_id": tt, "name": name,
           "sort": sort, "status": "w_budowie"}
    if slug:
        row["slug"] = slug
    if cover:
        row["cover_url"] = cover
    if supplier:
        row["supplier_url"] = supplier
    try:
        created = _post("wf2_products", row)
    except RuntimeError as e:
        msg = str(e).lower()
        if "status" in msg or "check" in msg or "w_budowie" in msg:
            log("link_product: status 'w_budowie' odrzucony → fallback 'kandydat' + nota")
            row["status"] = "kandydat"
            row["notes"] = (row.get("notes", "") + " [fabryka: docelowo w_budowie]").strip()
            created = _post("wf2_products", row)
        else:
            raise
    pid = _first_id(created)
    log(f"link_product: INSERT tt={tt} name={name!r} sort={sort} status={row['status']} → {pid}")
    _rpc("wf2_ensure_steps", {"p_project": project})
    log(f"link_product: wf2_ensure_steps({project}) → dosiane kroki produktu")
    # Krok 'wybor' jest PROJEKTOWY (project-scope od migracji 20260721c): fabryka losuje
    # portfel z całej puli approved komendą `panel-sync.py wybor`. Dodanie produktu = wybór
    # W TOKU; status 'done' stawia komenda (albo Tomek w panelu) po skompletowaniu portfela.
    try:
        wrows = _get("wf2_steps", _scope_param(
            {"project_id": f"eq.{project}", "step_key": "eq.wybor", "select": "id,status"}, None))
        if wrows and wrows[0].get("status") == "pending":
            step_update(project, None, "wybor", status="in_progress")
            log("link_product: projektowy krok 'wybor' pending → in_progress (portfel w budowie)")
    except Exception as e:
        log(f"link_product: nie ustawiono 'wybor' in_progress ({e})")
    return pid


# ── 2. step_update ──
# Kolejnosc krokow: Etap 1 'kalkulacja' (cena zakupu + sprzedazy + akcept drabinki) PRZED
# faza landingu F0..F8 (MOST-PANEL.md). Sluzy blokadzie "dziury w fazach": 'kalkulacja' jest
# na pozycji 0 (nigdy nie blokowana), a domkniecie 'lp_dane' (F0) wymaga wpierw domknietej
# 'kalkulacja' z pelna checklista — produkt nie wchodzi do fabryki bez ustalonej ceny (mechanizm
# _sprawdz_kolejnosc). Krok 'kalkulacja' wykonuje fabryka komenda `panel-sync.py kalkulacja`.
LP_ORDER = ["kalkulacja", "lp_dane", "lp_plan", "lp_styl_marka", "lp_makiety", "lp_grafiki",
            "lp_kod", "lp_dopasowanie", "lp_zycie", "lp_finisz"]


def _sprawdz_kolejnosc(project, product, step):
    """Nie pozwol zamknac fazy, gdy wczesniejsza nie jest done albo ma niezaznaczona
    checkliste. Incydent 20.07 (mata): lp_dane bylo in_progress 5/7 (brak PASZPORT.md
    + rezerwacji marki), a mimo to lp_plan zostalo zamkniete jako done — brak wyszedlby
    dopiero w F6 na gate-check (PASZPORT.md jest w files.wymagane). Zwraca liste zarzutow."""
    if step not in LP_ORDER:
        return []
    idx = LP_ORDER.index(step)
    if idx == 0:
        return []
    rows = _get("wf2_steps", _scope_param(
        {"project_id": f"eq.{project}", "step_key": f"in.({','.join(LP_ORDER[:idx])})",
         "select": "step_key,status,data"}, product))
    by_key = {r["step_key"]: r for r in (rows or [])}
    zarzuty = []
    for wcz in LP_ORDER[:idx]:
        r = by_key.get(wcz)
        if r is None:
            continue                      # krok jeszcze nie zainicjowany — nie blokujemy
        if r.get("status") != "done":
            zarzuty.append(f"{wcz}: status={r.get('status')} (oczekiwane 'done')")
            continue
        ck = ((r.get("data") or {}).get("checklist")) or []
        braki = [c.get("t", "?") for c in ck if isinstance(c, dict) and not c.get("done")]
        if braki:
            zarzuty.append(f"{wcz}: done, ale checklista {len(ck)-len(braki)}/{len(ck)} — "
                           + "; ".join(b[:60] for b in braki))
    return zarzuty


def step_update(project, product, step, status=None, note=None, fields=None, checklist=None,
                force_kolejnosc=False):
    """Aktualizuje/tworzy instancję kroku. Merge data: fields=old||new, note nadpisz,
    checklist nadpisz. status='done' → completed_at=now, completed_by='fabryka'. Idempotentne.
    Zamkniecie fazy przy niedomknietej wczesniejszej = blokada (--force-kolejnosc omija)."""
    if status == "done" and not force_kolejnosc:
        zarzuty = _sprawdz_kolejnosc(project, product, step)
        if zarzuty:
            raise SystemExit(
                "BLOKADA KOLEJNOSCI FAZ — nie zamykam '%s', bo wczesniejsze fazy nie sa domkniete:\n  - %s\n"
                "Domknij je najpierw (albo --force-kolejnosc, gdy odstepstwo jest swiadome i opisane w LEDGER)."
                % (step, "\n  - ".join(zarzuty)))
    params = _scope_param({"project_id": f"eq.{project}", "step_key": f"eq.{step}",
                           "select": "id,data,status"}, product)
    rows = _get("wf2_steps", params)
    old = (rows[0]["data"] if rows and rows[0].get("data") else {}) or {}
    newdata = dict(old)
    if fields is not None:
        merged = dict(old.get("fields") or {})
        merged.update(fields)
        newdata["fields"] = merged
    if note is not None:
        newdata["note"] = note
    if checklist is not None:
        newdata["checklist"] = checklist
    body = {"data": newdata}
    if status is not None:
        body["status"] = status
        if status == "done":
            body["completed_at"] = _now()
            body["completed_by"] = "fabryka"
        else:
            body["completed_at"] = None
            body["completed_by"] = None
    if rows:
        sid = rows[0]["id"]
        _patch("wf2_steps", {"id": f"eq.{sid}"}, body)
        log(f"step_update: PATCH {step} prod={product or '—'} status={status or '(bez zm.)'} → {sid}")
        return sid
    created = _post("wf2_steps", {"project_id": project, "product_id": product,
                                  "step_key": step, **body})
    sid = _first_id(created)
    log(f"step_update: INSERT {step} prod={product or '—'} status={status or '(bez zm.)'} → {sid}")
    return sid


# ── 3. artifact_add ──
def artifact_add(project, product, step, kind, url, label=None, meta=None, storage="supabase"):
    """Dodaje/aktualizuje artefakt. Dedup po (product_id, step_key, url). Zwraca id."""
    params = _scope_param({"project_id": f"eq.{project}", "step_key": f"eq.{step}",
                           "url": f"eq.{url}", "select": "id"}, product)
    rows = _get("wf2_artifacts", params)
    body = {"kind": kind, "storage": storage}
    if label is not None:
        body["label"] = label
    if meta is not None:
        body["meta"] = meta
    if rows:
        aid = rows[0]["id"]
        _patch("wf2_artifacts", {"id": f"eq.{aid}"}, body)
        log(f"artifact_add: PATCH {kind} {label or url!r} → {aid}")
        return aid
    created = _post("wf2_artifacts", {"project_id": project, "product_id": product,
                                      "step_key": step, "url": url, **body})
    aid = _first_id(created)
    log(f"artifact_add: INSERT {kind} {label or url!r} → {aid}")
    return aid


# ── 4. product_meta ──
def product_meta(product, patch):
    """PATCH kolumn produktu (whitelista). Ceny/koszt/marża/status/slug itd. Zwraca zapisane."""
    clean = {k: v for k, v in patch.items() if k in PRODUCT_META_WHITELIST}
    dropped = set(patch) - set(clean)
    if dropped:
        log(f"product_meta: POMINIĘTO poza whitelistą: {sorted(dropped)}")
    if not clean:
        log("product_meta: nic w whiteliście — pomijam")
        return {}
    _patch("wf2_products", {"id": f"eq.{product}"}, clean)
    log(f"product_meta: PATCH {product} pola={sorted(clean)}")
    return clean


# ── 4a. kalkulacja — krok Etapu 1: żywa cena zakupu (Ali) → cena sprzedaży (narzut) → drabinka ──
def _r2(x):
    """Zaokrąglenie do 2 miejsc HALF-UP (lustro JS Math.round(x*100)/100 dla dodatnich)."""
    return math.floor(float(x) * 100 + 0.5) / 100.0


def _money_pl(v):
    try:
        return ("%.2f" % float(v)).replace(".", ",") + " zł"
    except Exception:
        return str(v)


def _nbp_usd_rate():
    """Kurs USD z NBP tabela A (rates[0].mid). BEZ fallbacku — brak NBP = SystemExit (retry).
    Panel liczy PLN tak samo (api.nbp.pl/api/exchangerates/rates/a/usd?format=json)."""
    try:
        r = requests.get("https://api.nbp.pl/api/exchangerates/rates/a/usd?format=json", timeout=20)
        if r.status_code >= 300:
            raise RuntimeError(f"HTTP {r.status_code}")
        mid = ((r.json().get("rates") or [{}])[0]).get("mid")
    except Exception as e:
        raise SystemExit("kalkulacja: NBP niedostępny (%s) — kurs USD wymagany do przeliczenia ceny; "
                         "powtórz za chwilę (brak fallbacku, cena musi być realna)." % str(e)[:120])
    if not mid:
        raise SystemExit("kalkulacja: NBP zwrócił pusty kurs (rates[0].mid) — powtórz.")
    return float(mid)


def _refresh_snapshot(tt_id):
    """Odświeża bud_tt_products.ali_snapshot przez edge bud-ali-snapshot (force). Auth: service-role
    jako Bearer (HJSON) + x-tools-secret gdy BUD_TOOLS_SECRET dostępny w .env (realna bramka backendu).
    Deploy edge = --no-verify-jwt. Zwraca JSON odpowiedzi. RuntimeError na błędzie (wołający degraduje)."""
    url = f"https://{PROJECT_REF}.supabase.co/functions/v1/bud-ali-snapshot"
    hdr = dict(HJSON)
    tools = _env_val("BUD_TOOLS_SECRET")
    if tools:
        hdr["x-tools-secret"] = tools
    r = requests.post(url, headers=hdr, data=_body({"productKey": tt_id, "force": True}), timeout=120)
    if r.status_code >= 300:
        raise RuntimeError(f"edge {r.status_code}: {r.text[:200]}")
    return r.json() if r.text.strip() else {}


def _psych_price_up(minv):
    """Najniższa cena psychologiczna NIE niższa niż `minv` (lustro panelu, projekt.html psychPriceUp).
    Końcówki: <150 → dziesiątka+4,90/9,90/14,90/19,90; ≥150 → dziesiątka+9,00/19,00."""
    dec = math.floor(minv / 10) * 10
    cands = ([dec + 9.00, dec + 19.00] if minv >= 150
             else [dec + 4.90, dec + 9.90, dec + 14.90, dec + 19.90])
    for c in cands:
        if c >= minv - 0.001:
            return _r2(c)
    return _r2(dec + 19.90)


def _psych_price_down(maxv):
    """Najwyższa cena psychologiczna NIE wyższa niż `maxv` (druga strona psychPriceUp). Końcówki wg
    pasma ceny (≥150 → …9,00/…19,00; <150 → …4,90/…9,90/…14,90/…19,90). None gdy nic ≤ maxv."""
    best = None
    dec = math.floor(maxv / 10) * 10
    for _ in range(0, 80):
        for end in (4.90, 9.90, 14.90, 19.90, 9.00, 19.00):
            c = _r2(dec + end)
            valid = (end in (9.00, 19.00)) if c >= 150 else (end in (4.90, 9.90, 14.90, 19.90))
            if not valid:
                continue
            if c <= maxv + 0.001 and (best is None or c > best):
                best = c
        dec -= 10
        if dec < 0:
            break
    return best


# checklista kroku 'kalkulacja' — VERBATIM z obiektu WS w tn-sklepy/projekt.html + migracja
# 20260721_wf2_kalkulacja_krok.sql (panel merguje po dokładnym `t`; en-dash U+2013 w „10–15%",
# em-dash U+2014 przy separatorach, strzałki U+2192 w „TEST→SCALE→OPT").
KALKULACJA_CHECKLIST = [
    {"t": "Cena zakupu potwierdzona — żywa aukcja (source=detail)", "done": True},
    {"t": "Cena sprzedaży ustalona — narzut 10–15% (cena psychologiczna)", "done": True},
    {"t": "Drabinka cenowa zaakceptowana (TEST→SCALE→OPT)", "done": True},
]


def kalkulacja(project, product, margin_min=10.0, margin_max=15.0, cost_usd=None,
               refresh=None, force=False, dry_run=False):
    """Krok Etapu 1 'kalkulacja' wykonywany przez FABRYKĘ. Potwierdza ŻYWĄ cenę zakupu z aukcji Ali
    (source=detail — GATE), przelicza USD→PLN kursem NBP, ustala cenę sprzedaży z narzutem
    margin_min–margin_max% (cena psychologiczna, lustro panelu), akceptuje drabinkę cenową
    TEST→SCALE→OPT i zamyka krok 'kalkulacja' (done + checklista VERBATIM + fields + nota).
    --dry-run = ZERO zapisów (podgląd JSON), --force = pełna rekalkulacja mimo zaakceptowanej drabinki."""
    warns = []
    # ── 1. produkt + bud_tt_products ──
    prod_rows = _get("wf2_products", {
        "id": f"eq.{product}", "project_id": f"eq.{project}",
        "select": ("id,tt_product_id,name,slug,cost_purchase,cost_shipping,fees_pct,price,"
                   "price_ladder,price_phase,phase_started_at,test_started_at,shipping_paid_by,margin_mode")})
    if not prod_rows:
        raise SystemExit(f"kalkulacja: produkt {product} nie należy do projektu {project} (albo nie istnieje).")
    P = prod_rows[0]
    tt = P.get("tt_product_id")
    if not tt:
        raise SystemExit("kalkulacja: produkt bez tt_product_id (brak powiązania z bud_tt_products) — "
                         "kalkulacja opiera się na żywej aukcji Ali.")

    def _load_tt():
        rows = _get("bud_tt_products", {"id": f"eq.{tt}", "select": "id,ali_snapshot,chosen_link"})
        return rows[0] if rows else None

    tt_row = _load_tt()
    if not tt_row:
        raise SystemExit(f"kalkulacja: bud_tt_products {tt} nie istnieje.")
    snap = tt_row.get("ali_snapshot") or {}

    # ── 2. potwierdzenie ŻYWEJ ceny: refresh gdy --refresh LUB snapshot >24h ──
    fetched_at = snap.get("fetched_at")
    age_h = None
    if fetched_at:
        try:
            dt = datetime.fromisoformat(str(fetched_at).replace("Z", "+00:00"))
            age_h = (datetime.now(timezone.utc) - dt).total_seconds() / 3600.0
        except Exception:
            age_h = None
    stale = (age_h is None) or (age_h > 24)
    if refresh is True:
        need_refresh = True
    elif refresh is False:
        need_refresh = False
    else:
        need_refresh = stale
    snap_date = str(fetched_at)[:10] if fetched_at else "?"
    if need_refresh and not dry_run:
        try:
            _refresh_snapshot(tt)
            tt_row = _load_tt() or tt_row
            snap = tt_row.get("ali_snapshot") or snap
            fetched_at = snap.get("fetched_at") or fetched_at
            snap_date = str(fetched_at)[:10] if fetched_at else "?"
            log("kalkulacja: snapshot odświeżony (bud-ali-snapshot force)")
        except Exception as e:
            warns.append("cena z snapshotu z %s, refresh nieudany (%s)" % (snap_date, str(e)[:100]))
            log(f"kalkulacja: refresh nieudany — kontynuuję ze starym snapshotem: {e}")
    elif need_refresh and dry_run:
        warns.append("dry-run: pominięto odświeżenie snapshotu (użyto istniejącego z %s)" % snap_date)

    # ── 3. GATE: source musi być 'detail' (--force NIE omija; FAIL-FAST panelu / incydent Latarka) ──
    source = snap.get("source")
    if source != "detail":
        raise SystemExit(
            "kalkulacja: GATE STOP — aukcja NIEPOTWIERDZONA (source=%r, wymagane 'detail'). Podmień "
            "link Ali / odśwież snapshot; --force NIE omija tego gate'u (incydent Latarka 17.07)." % source)

    # ── 4. kurs NBP + cena zakupu USD → PLN ──
    rate = _nbp_usd_rate()
    price_obj = snap.get("price") or {}
    snap_sale = price_obj.get("sale")
    used_override = cost_usd is not None
    if not used_override:
        cost_usd = snap_sale
    if cost_usd in (None, ""):
        raise SystemExit("kalkulacja: brak ceny zakupu (snapshot.price.sale puste i brak --cost-usd).")
    try:
        cost_usd = float(cost_usd)
    except Exception:
        raise SystemExit(f"kalkulacja: cena zakupu USD nie jest liczbą: {cost_usd!r}")
    if used_override:
        warns.append("koszt USD z override (--cost-usd $%.2f), nie ze snapshotu" % cost_usd)
    elif snap_sale is not None:
        # warianty o różnych cenach a bierzemy price.sale (główną) → nota
        vals = []
        for s in (snap.get("sku_prices") or []):
            try:
                vals.append(round(float(s.get("price")), 2))
            except Exception:
                pass
        distinct = sorted(set(vals))
        if len(distinct) > 1:
            warns.append("warianty mają różne ceny ($%.2f–$%.2f), użyto ceny głównej ($%.2f) — "
                         "zweryfikuj sprzedawaną konfigurację" % (min(distinct), max(distinct), cost_usd))
    cost_pln = _r2(cost_usd * rate)

    # ── 5. detekcja zmiany ceny zakupu (>10% vs stara) ──
    old_cost = P.get("cost_purchase")
    cost_changed_pct = None
    if old_cost not in (None, "") and float(old_cost) > 0:
        oc = float(old_cost)
        cost_changed_pct = abs(cost_pln - oc) / oc * 100.0
        if cost_changed_pct > 10.0:
            warns.append("cena zakupu zmieniła się %.0f%% (%s → %s)"
                         % (cost_changed_pct, _money_pl(oc), _money_pl(cost_pln)))

    # ── 6. cena sprzedaży: pasmo narzutu margin_min–margin_max%, preferuj wyżej ──
    ship = float(P.get("cost_shipping") or 0)
    fees = float(P.get("fees_pct") or 0)
    shipping_shop = (P.get("shipping_paid_by") == "shop")
    koszt_ef = cost_pln + (ship if shipping_shop else 0.0)
    denom = 1.0 - fees / 100.0
    if denom <= 0:
        raise SystemExit(f"kalkulacja: fees_pct={fees} ≥ 100% — nie da się policzyć bazy ceny.")
    base = koszt_ef / denom
    p_max = base * (1.0 + margin_max / 100.0)
    p_min = base * (1.0 + margin_min / 100.0)
    over_max = False
    price_sell = _psych_price_down(p_max)
    if price_sell is None or price_sell < p_min - 0.001:
        price_sell = _psych_price_up(p_min)
        over_max = True

    def _markup_pct(pr):
        return (pr / base - 1.0) * 100.0 if base > 0 else 0.0
    markup = _markup_pct(price_sell)
    if over_max:
        warns.append("brak ceny psychologicznej w paśmie %g–%g%% — użyto najniższej powyżej minimum "
                     "(%s, narzut %.0f%% > max %g%%)" % (margin_min, margin_max, _money_pl(price_sell),
                                                         markup, margin_max))

    # ── 7. stan istniejący: zaakceptowana drabinka + brak --force = NIE zmieniaj ceny ──
    existing_ladder = P.get("price_ladder") or {}
    keep_price = bool(existing_ladder.get("accepted_at")) and not force
    now = _now()
    if keep_price:
        fp = P.get("price")
        final_price = float(fp) if fp not in (None, "") else None
        if final_price is not None:
            emarkup = _markup_pct(final_price)
            in_band = (margin_min - 0.5) <= emarkup <= (margin_max + 0.5)
            warns.append("drabinka już zaakceptowana (%s) — cena %s NIE zmieniona; narzut aktualny "
                         "%.0f%% — %s pasmo %g–%g%%" % (str(existing_ladder.get("accepted_at"))[:10],
                         _money_pl(final_price), emarkup, "w" if in_band else "POZA", margin_min, margin_max))
            price_report, markup_report = final_price, emarkup
        else:
            warns.append("drabinka zaakceptowana, ale price=NULL — potwierdzam tylko koszt zakupu")
            price_report, markup_report = price_sell, markup
        patch = {"cost_purchase": cost_pln}
    else:
        final_price = price_sell
        price_report, markup_report = price_sell, markup
        scale_est = _psych_price_up(max((cost_pln + ship) * 2.5, price_sell or 0))
        ladder = {
            "mode": "cost_plus",
            "accepted_at": now,
            "accepted_by": "fabryka",
            "rungs": [
                {"phase": "test", "price": price_sell,
                 "note": "koszt+10–15% · awans: WINNER = CP2 (ATC≥5%) + ≥3 zam. + spend 300"},
                {"phase": "scale", "price": None, "source": "ai", "est": scale_est,
                 "note": "propozycja AI (bramka Tomka); ramp pod ścianą psych. → baza po ≥3 zam. na rampie"},
                {"phase": "opt", "step_pct": 15,
                 "note": "jeden probe +15–20%; ocena: kontrybucja/zł spendu, okno 14 dni; przez 100/150 = decyzja Tomka"},
            ],
        }
        patch = {"cost_purchase": cost_pln, "price": price_sell, "margin_mode": "test",
                 "price_ladder": ladder}
        if not P.get("price_phase"):
            patch["price_phase"] = 1
        if not P.get("phase_started_at"):
            patch["phase_started_at"] = now
        if not P.get("test_started_at"):
            patch["test_started_at"] = now

    # zysk/szt. = cena − koszt − (wysyłka gdy shop) − prowizja
    profit = _r2((price_report or 0) - cost_pln - (ship if shipping_shop else 0.0)
                 - (price_report or 0) * fees / 100.0)

    # ── 9. fields + checklista + nota kroku ──
    fields = {
        "Cena zakupu": "$%.2f × kurs %.4f = %s (aukcja żywa, %s)" % (cost_usd, rate, _money_pl(cost_pln), snap_date),
        "Cena sprzedaży": "%s (narzut %.0f%%)" % (_money_pl(price_report), markup_report),
        "Zysk/szt.": "%s (po prowizji %g%%%s)" % (_money_pl(profit), fees,
                                                   ", wysyłka: sklep" if shipping_shop else ""),
    }
    note = " · ".join(warns) if warns else "Kalkulacja OK — cena z żywej aukcji (source=detail)."

    plan = {
        "product": product, "tt_product_id": tt, "source": source,
        "kurs_nbp_usd": rate, "cost_usd": cost_usd, "cost_pln": cost_pln,
        "koszt_efektywny_pln": _r2(koszt_ef), "base_pln": _r2(base),
        "pasmo": {"min_pct": margin_min, "max_pct": margin_max, "p_min": _r2(p_min), "p_max": _r2(p_max)},
        "cena_sprzedazy_pln": price_report, "narzut_pct": _r2(markup_report), "zysk_szt_pln": profit,
        "keep_price": keep_price, "over_max": over_max,
        "patch_wf2_products": patch,
        "step": {"step_key": "kalkulacja", "status": "done", "fields": fields,
                 "checklist": KALKULACJA_CHECKLIST, "note": note},
        "warns": warns,
    }

    # ── 10. dry-run: podgląd, zero zapisów ──
    if dry_run:
        log("kalkulacja: DRY-RUN (zero zapisów) — poniżej wyliczenia i payload")
        print(json.dumps(plan, ensure_ascii=False, indent=2))
        return plan

    # ── 8. zapisy (bezpośredni PATCH — pola drabinki są POZA whitelistą product_meta) ──
    _patch("wf2_products", {"id": f"eq.{product}"}, patch)
    log("kalkulacja: PATCH wf2_products %s pola=%s" % (product, sorted(patch)))
    if cost_changed_pct is not None and cost_changed_pct > 10.0:
        try:
            activity_add(project, "cost_updated", "Kalkulacja: cena zakupu %s (zmiana %.0f%%) — %s"
                         % (_money_pl(cost_pln), cost_changed_pct, P.get("name") or product))
        except Exception as e:
            log(f"kalkulacja: activity_add pominięte ({e})")
    sid = step_update(project, product, "kalkulacja", status="done",
                      note=note, fields=fields, checklist=KALKULACJA_CHECKLIST)
    log("kalkulacja: krok 'kalkulacja' done → %s · cena %s (narzut %.0f%%) · zysk %s"
        % (sid, _money_pl(price_report), markup_report, _money_pl(profit)))
    return plan


# ── 4c. wybor — krok PROJEKTOWY Etapu 1: ⛔ BRAMKA TOMKA (dyrektywa 21.07 wieczór) ──
# Krok „Wybór produktów" = DECYZJA TOMKA W PANELU: dodaje produkty ręcznie z radaru
# i/lub dopełnia losowaniem (przycisk „Produkty"); „Przelosuj" wymienia wyłącznie
# produkty BEZ pinezki (wf2_products.pinned). FABRYKA NIE STARTUJE i NICZEGO nie losuje
# sama, dopóki portfel nie jest skompletowany przez Tomka — sesja autonomiczna NIE
# odpala tej komendy (guard: --od-tomka). Losowanie (gdy zlecone): PRAWDZIWY random
# (SystemRandom, równe szanse, zero scoringu — decyzja 17.07), różnorodność kategorii
# (druga runda bez filtra gdy pula wąska). Cel portfela = 3 (decyzja 19.07).
# checklista VERBATIM z WS['wybor'] w tn-sklepy/projekt.html.
PORTFEL_CEL = 3
WYBOR_CHECKLIST = [
    {"t": "Produkty wybrane przez Tomka (ręcznie i/lub losowaniem w panelu)", "done": True},
    {"t": "Niechciane wymienione przez „Przelosuj" (pinezka chroni zaznaczone)", "done": True},
    {"t": "Portfel skompletowany — fabryka może startować", "done": True},
]


def _get_all(table, params, page=1000):
    """GET z paginacją (PostgREST tnie do 1000 wierszy — L feedback-postgrest-1000-row-default).
    Losowanie z RÓWNYMI SZANSAMI wymaga PEŁNEJ puli, więc dociągamy wszystkie strony."""
    out, off = [], 0
    while True:
        rows = _get(table, {**params, "limit": page, "offset": off})
        out.extend(rows)
        if len(rows) < page:
            break
        off += page
    return out


def _approved_pool(project):
    """CAŁA pula bud_tt_products status='approved' NIE użytych w wf2_products (JAKIKOLWIEK
    projekt — jeden produkt = jeden sklep). Zwraca listę {id, pl_name, category, cover, supplier}."""
    used = {r["tt_product_id"] for r in
            _get_all("wf2_products", {"select": "tt_product_id", "tt_product_id": "not.is.null"})
            if r.get("tt_product_id")}
    rows = _get_all("bud_tt_products", {
        "status": "eq.approved",
        "select": "id,pl_name,category,curated_image,chosen_link,ali_main:ali_snapshot->>main_image"})
    pool = []
    for r in rows:
        if r["id"] in used:
            continue
        pool.append({"id": r["id"], "pl_name": r.get("pl_name"), "category": r.get("category"),
                     "cover": r.get("curated_image") or r.get("ali_main"),
                     "supplier": r.get("chosen_link")})
    return pool


def wybor_portfel(project, count=None, dry_run=False, od_tomka=False):
    """Krok projektowy 'wybor' = BRAMKA TOMKA (21.07): produkty wybiera Tomek w panelu.
    Komenda działa WYŁĄCZNIE na jego jawne zlecenie (--od-tomka); sesja autonomiczna jej
    nie odpala. count = ile wylosować; domyślnie dopełnij portfel do PORTFEL_CEL (3).
    --dry-run = zero zapisów (podgląd puli + wylosowanych, bez guardu)."""
    if not dry_run and not od_tomka:
        raise SystemExit(
            "wybor: ⛔ BRAMKA TOMKA (dyrektywa 21.07) — produkty do portfela wybiera Tomek "
            "w panelu (Dodaj produkty / Wylosuj / Przelosuj z pinezką). Fabryka nie startuje "
            "bez skompletowanego portfela i NICZEGO nie losuje sama. Jeśli Tomek jawnie "
            "zlecił losowanie z CLI — powtórz z flagą --od-tomka.")
    existing = _get("wf2_products", {"project_id": f"eq.{project}", "select": "id,tt_product_id,name"})
    have_cats = set()
    tt_ids = [e["tt_product_id"] for e in existing if e.get("tt_product_id")]
    if tt_ids:
        catrows = _get("bud_tt_products", {"id": f"in.({','.join(tt_ids)})", "select": "category"})
        have_cats = {c.get("category") for c in catrows if c.get("category")}

    target = max(0, int(count)) if count is not None else max(0, PORTFEL_CEL - len(existing))

    pool = _approved_pool(project)
    M = len(pool)

    # ── losowanie: shuffle CAŁEJ puli (równe szanse), potem dobór z filtrem kategorii ──
    picked, second_round = [], False
    if target > 0:
        rng = random.SystemRandom()
        rng.shuffle(pool)
        picked_cats = set(have_cats)
        for p in pool:                                  # runda 1: kategoria nie w portfelu
            if len(picked) >= target:
                break
            cat = p.get("category")
            if cat and cat in picked_cats:
                continue
            picked.append(p)
            if cat:
                picked_cats.add(cat)
        if len(picked) < target:                        # runda 2: bez filtra kategorii
            second_round = True
            chosen = {p["id"] for p in picked}
            for p in pool:
                if len(picked) >= target:
                    break
                if p["id"] in chosen:
                    continue
                picked.append(p)
                chosen.add(p["id"])

    picked_cats_list = sorted({p["category"] for p in picked if p.get("category")})
    cats_field = ", ".join(picked_cats_list) if picked_cats_list else "—"

    # ── DRY-RUN: pokaż pulę + wylosowane, ZERO zapisów ──
    if dry_run:
        log("wybor: DRY-RUN (zero zapisów)")
        log(f"wybor: portfel {len(existing)}/{PORTFEL_CEL} · cel do wylosowania: {target} · "
            f"pula wolnych approved: M={M} · kategorie w portfelu: {sorted(have_cats) or '—'}")
        if target == 0:
            log("wybor: portfel skompletowany — nic do losowania (komenda domknęłaby tylko krok).")
        for i, p in enumerate(picked, 1):
            log(f"wybor:   [{i}] {p['id']} · {p['pl_name']!r} · kat={p.get('category') or '—'}")
        if second_round:
            log("wybor: (druga runda BEZ filtra kategorii — dopuszczono duplikat kategorii)")
        if target > 0 and len(picked) < target:
            log(f"wybor: UWAGA — pula wyczerpana, wylosowano {len(picked)}/{target}")
        return {"target": target, "pool": M, "picked": picked, "second_round": second_round}

    # ── ZAPIS: dodaj wylosowane, potem domknij krok ──
    for p in picked:
        link_product(project, p["id"], p["pl_name"], cover=p.get("cover"), supplier=p.get("supplier"))

    if target > 0 and not picked:
        log(f"wybor: pula wolnych approved pusta (M={M}) — nic nie dodano, krok NIE domknięty.")
        return {"target": target, "pool": M, "picked": [], "second_round": False}

    n_total = len(existing) + len(picked)
    note_parts = []
    if second_round:
        note_parts.append("druga runda bez filtra kategorii — dopuszczono duplikat kategorii "
                          "(pula wyczerpana dla nowych kategorii)")
    if target > 0 and len(picked) < target:
        note_parts.append(f"pula wyczerpana — wylosowano {len(picked)}/{target}")
    if not note_parts:
        note_parts.append("portfel wylosowany z całej puli approved — równe szanse, bez scoringu"
                          if picked else "portfel już skompletowany — 0 do wylosowania")
    note = " · ".join(note_parts)

    fields = {"Wylosowano": f"{len(picked)} z puli {M}", "Kategorie": cats_field}
    sid = step_update(project, None, "wybor", status="done",
                      note=note, fields=fields, checklist=WYBOR_CHECKLIST)
    try:
        activity_add(project, "portfel_wylosowany",
                     "Wybór: wylosowano %d z puli %d (portfel %d/%d; kategorie: %s) — równe szanse, bez scoringu"
                     % (len(picked), M, n_total, PORTFEL_CEL, cats_field))
    except Exception as e:
        log(f"wybor: activity_add pominięte ({e})")
    log(f"wybor: krok 'wybor' done → {sid} · dodano {len(picked)} (portfel {n_total}/{PORTFEL_CEL}) · {note}")
    return {"target": target, "pool": M, "picked": picked, "second_round": second_round}


# ── 4b. Fabryka wideo: koszty / oś czasu / rejestr kreacji ──
def cost_add(project, product, amount, kind="fal", currency="USD", step=None, stage=5,
             note=None, created_by="auto"):
    """Koszt do wf2_costs. Tabela NIE ma uniku — dedup po (project, product, step, kind, note);
    bez note NIE deduplikuje (świadomie: kolejne pozycje)."""
    if note:
        params = {"project_id": f"eq.{project}", "kind": f"eq.{kind}", "note": f"eq.{note}",
                  "select": "id"}
        if product:
            params["product_id"] = f"eq.{product}"
        if step:
            params["step_key"] = f"eq.{step}"
        rows = _get("wf2_costs", params)
        if rows:
            log(f"cost_add: SKIP (istnieje) {kind} {note!r}")
            return rows[0]["id"]
    created = _post("wf2_costs", {"project_id": project, "product_id": product,
                                  "step_key": step, "stage": stage, "amount": amount,
                                  "currency": currency, "kind": kind, "note": note,
                                  "created_by": created_by})
    cid = _first_id(created)
    log(f"cost_add: INSERT {kind} {amount} {currency} → {cid}")
    return cid


def activity_add(project, action, description, actor="auto"):
    """Wpis na oś czasu projektu (wf2_activities) — log fabryki (kropka zielona: actor=auto)."""
    created = _post("wf2_activities", {"project_id": project, "actor": actor,
                                       "action": action, "description": description})
    aid = _first_id(created)
    log(f"activity_add: {action} → {aid}")
    return aid


def creative_upsert(slug, **fields):
    """Upsert wf2_creatives po slug (UNIQUE). fields = kolumny tabeli: project_id, product_id,
    archetype, pattern_tiktok_url, engine_mix, duration_s, cost_usd, ai_labeled, status,
    storage_path, public_url, variants, meta_ad_ids, notes, meta."""
    rows = _get("wf2_creatives", {"slug": f"eq.{slug}", "select": "id"})
    body = {k: v for k, v in fields.items() if v is not None}
    if rows:
        cid = rows[0]["id"]
        _patch("wf2_creatives", {"id": f"eq.{cid}"}, body)
        log(f"creative_upsert: PATCH {slug} → {cid}")
        return cid
    created = _post("wf2_creatives", {"slug": slug, **body})
    cid = _first_id(created)
    log(f"creative_upsert: INSERT {slug} → {cid}")
    return cid


# ── 5. project_link_add ──
def project_link_add(project, label, url, icon="ph-link"):
    """Dodaje link do paska „Podglądy" projektu. Dedup po label. Zwraca listę linków."""
    rows = _get("wf2_projects", {"id": f"eq.{project}", "select": "links"})
    links = (rows[0].get("links") or []) if rows else []
    if any(isinstance(l, dict) and l.get("label") == label for l in links):
        log(f"project_link_add: SKIP (label istnieje) {label!r}")
        return links
    links = list(links) + [{"label": label, "url": url, "icon": icon}]
    _patch("wf2_projects", {"id": f"eq.{project}"}, {"links": links})
    log(f"project_link_add: dodano {label!r} → {url}")
    return links


# ── 6. storage_upload (rehost do Storage; opcjonalny downscale/WebP przez PIL) ──
def _process_image(local_path, max_width=None, to_webp=False, quality=82):
    from PIL import Image
    import io
    img = Image.open(local_path)
    if max_width and img.width > max_width:
        h = round(img.height * max_width / img.width)
        img = img.resize((max_width, h), Image.LANCZOS)
    buf = io.BytesIO()
    if to_webp:
        if img.mode == "P":
            img = img.convert("RGBA")
        img.save(buf, "WEBP", quality=quality, method=6)
        return buf.getvalue(), "image/webp"
    if img.mode == "P":
        img = img.convert("RGBA")
    img.save(buf, "PNG", optimize=True)
    return buf.getvalue(), "image/png"


def storage_upload(local_path, dest_path, bucket=DEFAULT_BUCKET, content_type=None,
                   upsert=True, max_width=None, to_webp=False, quality=82):
    """Wgrywa plik lokalny do Storage (x-upsert). Opcjonalny PIL downscale + WebP.
    Zwraca publiczny URL."""
    if max_width or to_webp:
        blob, ct = _process_image(local_path, max_width=max_width, to_webp=to_webp, quality=quality)
    else:
        with open(local_path, "rb") as f:
            blob = f.read()
        ct = content_type or mimetypes.guess_type(local_path)[0] or "application/octet-stream"
    hdr = {**H, "Content-Type": ct}
    if upsert:
        hdr["x-upsert"] = "true"
    r = requests.post(f"{STORAGE}/object/{bucket}/{dest_path}", headers=hdr, data=blob, timeout=180)
    if r.status_code >= 300:
        raise RuntimeError(f"UPLOAD {dest_path} {r.status_code}: {r.text}")
    # bucket prywatny nie ma URL-a public — zwracamy 'bucket/ścieżkę' (panel robi signed URL)
    pub = f"{bucket}/{dest_path}" if bucket in PRIVATE_BUCKETS else f"{PUBLIC_BASE}/{bucket}/{dest_path}"
    log(f"storage_upload: {os.path.basename(local_path)} → {pub} ({len(blob)} B, {ct})")
    return pub


def public_url(path, bucket=DEFAULT_BUCKET):
    return f"{PUBLIC_BASE}/{bucket}/{path}"


# ── 5b. doc_add — dokumenty fabryki (.md/.json) do PRYWATNEGO wf2-docs + klikalny chip ──
def doc_add(project, product, step, local_path, slug, label=None, kind="doc"):
    """Upload dokumentu fabryki do wf2-docs/<slug>/<basename> (PRYWATNY bucket; Content-Type
    text/plain → renderuje się inline w karcie po signed URL) + artefakt kroku panelu.
    Idempotentne (x-upsert + dedup artefaktu po url). Zwraca artifact_id."""
    base = os.path.basename(local_path)
    ct = "application/json" if base.lower().endswith(".json") else "text/plain; charset=utf-8"
    obj_path = storage_upload(local_path, f"{slug}/{base}", bucket=DOCS_BUCKET, content_type=ct)
    return artifact_add(project, product, step, kind, obj_path,
                        label=label or base, storage="supabase")


# ── CLI ──
def _norm_product(v):
    return None if v in (None, "", "none", "null", "-", "projekt") else v


def _parse_json(s, what):
    if s is None:
        return None
    try:
        return json.loads(s)
    except Exception as e:
        raise SystemExit(f"Błąd JSON w {what}: {e}")


def main(argv=None):
    ap = argparse.ArgumentParser(
        prog="panel-sync.py",
        description="MOST fabryka landingów ↔ panel tn-sklepy (wf2_*). Idempotentne operacje.")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("link", help="podłącz produkt do portfela + dosiej kroki")
    p.add_argument("project"); p.add_argument("tt"); p.add_argument("name")
    p.add_argument("--slug"); p.add_argument("--sort", type=int)
    p.add_argument("--cover"); p.add_argument("--supplier")

    p = sub.add_parser("step", help="aktualizuj krok (status/note/fields/checklist)")
    p.add_argument("project"); p.add_argument("product", help="uuid produktu lub '-'/'projekt' dla kroku projektu")
    p.add_argument("step")
    p.add_argument("--status"); p.add_argument("--note")
    p.add_argument("--fields", help="JSON obiekt")
    p.add_argument("--checklist", help="JSON: lista stringów lub lista {t,done}")
    p.add_argument("--force-kolejnosc", action="store_true",
                   help="zamknij fazę mimo niedomkniętej wcześniejszej (świadome odstępstwo — opisz w LEDGER)")

    p = sub.add_parser("artifact", help="dodaj artefakt (miniatura/chip)")
    p.add_argument("project"); p.add_argument("product"); p.add_argument("step")
    p.add_argument("kind"); p.add_argument("url")
    p.add_argument("--label"); p.add_argument("--meta", help="JSON obiekt")
    p.add_argument("--storage", default="supabase", choices=["supabase", "repo", "desktop", "external"])

    p = sub.add_parser("meta", help="PATCH kolumn produktu (whitelista)")
    p.add_argument("product"); p.add_argument("patch", help="JSON obiekt")

    p = sub.add_parser("projlink", help="dodaj link do paska Podglądy projektu")
    p.add_argument("project"); p.add_argument("label"); p.add_argument("url")
    p.add_argument("--icon", default="ph-link")

    p = sub.add_parser("upload", help="rehost pliku do Storage")
    p.add_argument("local"); p.add_argument("dest")
    p.add_argument("--bucket", default=DEFAULT_BUCKET)
    p.add_argument("--max-width", type=int); p.add_argument("--webp", action="store_true")
    p.add_argument("--quality", type=int, default=82)

    p = sub.add_parser("doc", help="dokument fabryki (.md/.json) → PRYWATNY wf2-docs + klikalny chip")
    p.add_argument("project"); p.add_argument("product", help="uuid produktu lub '-' dla kroku projektu")
    p.add_argument("step"); p.add_argument("local")
    p.add_argument("--slug", required=True, help="slug landingu (folder w buckecie)")
    p.add_argument("--label"); p.add_argument("--kind", default="doc")

    p = sub.add_parser("kalkulacja",
                       help="krok Etapu 1: potwierdź żywą cenę zakupu (Ali) + ustal cenę sprzedaży "
                            "(narzut 10–15%%, cena psychologiczna) + akcept drabinki TEST→SCALE→OPT")
    p.add_argument("project"); p.add_argument("product", help="uuid produktu (wf2_products.id)")
    p.add_argument("--margin-min", type=float, default=10.0, help="dolny narzut pasma %% (domyślnie 10)")
    p.add_argument("--margin-max", type=float, default=15.0, help="górny narzut pasma %% (domyślnie 15)")
    p.add_argument("--cost-usd", type=float, help="OVERRIDE ceny zakupu w USD (zamiast snapshot.price.sale)")
    ref = p.add_mutually_exclusive_group()
    ref.add_argument("--refresh", dest="refresh", action="store_true",
                     help="wymuś odświeżenie snapshotu przez edge bud-ali-snapshot")
    ref.add_argument("--no-refresh", dest="refresh", action="store_false",
                     help="nie odświeżaj snapshotu nawet gdy >24h")
    p.set_defaults(refresh=None)
    p.add_argument("--force", action="store_true",
                   help="pełna rekalkulacja + nowy akcept mimo zaakceptowanej drabinki (NIE omija GATE source)")
    p.add_argument("--dry-run", action="store_true", help="pokaż wyliczenia (JSON), ZERO zapisów")

    p = sub.add_parser("wybor",
                       help="⛔ BRAMKA TOMKA: produkty wybiera Tomek w panelu; losowanie CLI "
                            "tylko na jego jawne zlecenie (--od-tomka). Równe szanse, bez "
                            "scoringu; różnorodność kategorii; cel 3 produkty")
    p.add_argument("project", help="uuid projektu (wf2_projects.id)")
    p.add_argument("--count", type=int,
                   help="ile produktów wylosować (domyślnie dopełnij portfel do 3)")
    p.add_argument("--od-tomka", action="store_true",
                   help="potwierdzenie: losowanie jawnie zlecone przez Tomka (bez tego = STOP)")
    p.add_argument("--dry-run", action="store_true", help="pokaż pulę + wylosowane, ZERO zapisów")

    a = ap.parse_args(argv)
    if a.cmd == "link":
        print(link_product(a.project, a.tt, a.name, slug=a.slug, sort=a.sort,
                           cover=a.cover, supplier=a.supplier))
    elif a.cmd == "step":
        cl = _parse_json(a.checklist, "--checklist")
        if isinstance(cl, list) and cl and isinstance(cl[0], str):
            cl = [{"t": t, "done": True} for t in cl]
        print(step_update(a.project, _norm_product(a.product), a.step, status=a.status,
                          note=a.note, fields=_parse_json(a.fields, "--fields"), checklist=cl,
                          force_kolejnosc=a.force_kolejnosc))
    elif a.cmd == "artifact":
        print(artifact_add(a.project, _norm_product(a.product), a.step, a.kind, a.url,
                          label=a.label, meta=_parse_json(a.meta, "--meta"), storage=a.storage))
    elif a.cmd == "meta":
        print(product_meta(a.product, _parse_json(a.patch, "patch") or {}))
    elif a.cmd == "projlink":
        print(json.dumps(project_link_add(a.project, a.label, a.url, icon=a.icon), ensure_ascii=False))
    elif a.cmd == "upload":
        print(storage_upload(a.local, a.dest, bucket=a.bucket, max_width=a.max_width,
                            to_webp=a.webp, quality=a.quality))
    elif a.cmd == "doc":
        print(doc_add(a.project, _norm_product(a.product), a.step, a.local,
                      slug=a.slug, label=a.label, kind=a.kind))
    elif a.cmd == "kalkulacja":
        kalkulacja(a.project, a.product, margin_min=a.margin_min, margin_max=a.margin_max,
                   cost_usd=a.cost_usd, refresh=a.refresh, force=a.force, dry_run=a.dry_run)
    elif a.cmd == "wybor":
        wybor_portfel(a.project, count=a.count, dry_run=a.dry_run, od_tomka=a.od_tomka)


if __name__ == "__main__":
    main()

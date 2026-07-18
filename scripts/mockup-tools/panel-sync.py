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
  storage_upload(local, dest, bucket, ...) -> public_url  # rehost do Storage (+opcjonalny PIL)

⚠️ PUŁAPKI (patrz docs/zbuduje/MOST-PANEL.md):
  • Checklisty panelu mergują po DOKŁADNYM tekście `t` z obiektu WS w projekt.html — teksty
    muszą być VERBATIM, inaczej sieroty. (Backfill wyciąga je wprost z projekt.html.)
  • Ceny/koszt/marża panel czyta z KOLUMN produktu (product_meta), NIE z step.data.fields.
  • Miniatura w panelu: storage∈{supabase,external} I (rozszerzenie obrazu LUB kind graficzny).
    storage∈{repo,desktop} → chip (nie miniatura) — dobre dla lokalnych .md.
  • Wiązanie artefaktu z krokiem = (product_id + step_key).

CLI: patrz `panel-sync.py -h`.
"""
import os
import sys
import json
import argparse
import mimetypes
from datetime import datetime, timezone

import requests

# ── Konfiguracja stała (projekt CRM, NIE ZE_SUPABASE_URL — to inny projekt!) ──
PROJECT_REF = "yxmavwkwnfuphjqbelws"
REST = f"https://{PROJECT_REF}.supabase.co/rest/v1"
STORAGE = f"https://{PROJECT_REF}.supabase.co/storage/v1"
PUBLIC_BASE = f"{STORAGE}/object/public"
ENV_PATH = os.environ.get("TN_CRM_ENV", r"C:\repos_tn\tn-crm\.env")
DEFAULT_BUCKET = "attachments"

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
    return pid


# ── 2. step_update ──
def step_update(project, product, step, status=None, note=None, fields=None, checklist=None):
    """Aktualizuje/tworzy instancję kroku. Merge data: fields=old||new, note nadpisz,
    checklist nadpisz. status='done' → completed_at=now, completed_by='fabryka'. Idempotentne."""
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


# ── 4b. Fabryka wideo: koszty / oś czasu / rejestr kreacji ──
def cost_add(project, product, amount, kind="fal", currency="USD", step=None, stage=4,
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
    pub = f"{PUBLIC_BASE}/{bucket}/{dest_path}"
    log(f"storage_upload: {os.path.basename(local_path)} → {pub} ({len(blob)} B, {ct})")
    return pub


def public_url(path, bucket=DEFAULT_BUCKET):
    return f"{PUBLIC_BASE}/{bucket}/{path}"


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

    a = ap.parse_args(argv)
    if a.cmd == "link":
        print(link_product(a.project, a.tt, a.name, slug=a.slug, sort=a.sort,
                           cover=a.cover, supplier=a.supplier))
    elif a.cmd == "step":
        cl = _parse_json(a.checklist, "--checklist")
        if isinstance(cl, list) and cl and isinstance(cl[0], str):
            cl = [{"t": t, "done": True} for t in cl]
        print(step_update(a.project, _norm_product(a.product), a.step, status=a.status,
                          note=a.note, fields=_parse_json(a.fields, "--fields"), checklist=cl))
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


if __name__ == "__main__":
    main()

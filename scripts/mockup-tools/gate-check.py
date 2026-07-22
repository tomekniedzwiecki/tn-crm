# -*- coding: utf-8 -*-
"""
gate-check.py <slug> [--archiwum <dir>] [--code <index.html>] [--manifest <json>] [--product-key <uuid>] [--no-net] [--cross-only]

Zbiorczy GATE kompletnosci artefaktow landingu fabryki (R11a + R11b).
Zrodlo prawdy o kompletnosci = TEN skrypt + gate-manifest.json (DANE), nie deklaracja agenta.
EXIT: 0 = brak FAIL (WARN/SKIP dozwolone), 1 = >=1 FAIL.

Kategorie (manifest): files, dopasowanie, interakcje, grep_forbidden, sieroty, wagi,
phash, baza, wideo_kafle, makiety_mobile, og_image, ledger_fazy, werdykt_rubryka,
layout_diff, wiernosc, cross_landing (anty-rodzenstwo vs 3 poprzednie landingi),
panel_sync (most fabryka->panel tn-sklepy wf2_*).

--cross-only: odpala WYLACZNIE check cross_landing (partytura vs poprzednie landingi) —
do uzycia w F1/F2.5, PRZED wygenerowaniem makiet, zeby nie odbic sie od gate'u dopiero w F6.

Wymaga: Pillow, imagehash, requests (venv scripts/mockup-tools/.venv).
NIE modyfikuje niczego — czyta artefakty i (opcjonalnie) siec + baze.
"""
import sys, os, re, json, glob, argparse, fnmatch, subprocess, tempfile, time
from datetime import datetime
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ------------------------------------------------------------------ utils
def read_text(path):
    for enc in ("utf-8", "utf-8-sig", "cp1250", "latin-1"):
        try:
            with open(path, "r", encoding=enc) as f:
                return f.read()
        except (UnicodeDecodeError, FileNotFoundError):
            if not os.path.exists(path):
                return None
    try:
        with open(path, "rb") as f:
            return f.read().decode("utf-8", "replace")
    except Exception:
        return None

def load_env(path):
    env = {}
    txt = read_text(path)
    if not txt:
        return env
    for line in txt.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def norm(s):
    """lowercase + usun separatory — do tolerancyjnego dopasowania nazw."""
    return re.sub(r"[-_/. ]", "", (s or "").lower())

_ENTITIES = {"&amp;": "&", "&nbsp;": " ", "&deg;": "°", "&times;": "×",
             "&mdash;": "—", "&ndash;": "–", "&lt;": "<", "&gt;": ">",
             "&quot;": '"', "&#215;": "×", "&#176;": "°"}
def strip_scripts(html):
    """Markup z USUNIETYMI blokami <script>/<style>/<template>/<noscript>, ale z zachowanymi tagami.
       Do ekstrakcji atrybutow (np. data-price) bez lapania selektorow CSS/JS wewnatrz skryptow."""
    return re.sub(r"(?is)<(script|style|template|noscript)\b[^>]*>.*?</\1>", " ", html or "")

def visible_text(html):
    """Przyblizony tekst WIDOCZNY: usun <script>/<style>/<template>, tagi, rozkoduj kilka encji,
       scal biale znaki. Do gruntowania copy-gate (liczby/zakazy w prozie, NIE w atrybutach)."""
    if not html:
        return ""
    t = re.sub(r"(?s)<[^>]+>", " ", strip_scripts(html))
    for k, v in _ENTITIES.items():
        t = t.replace(k, v)
    t = re.sub(r"&#\d+;", " ", t)
    return re.sub(r"[ \t\r\f\v]+", " ", t)

# ------------------------------------------------------------------ result sink
class Results:
    def __init__(self):
        self.rows = []  # (category, name, status, detail) ; status in PASS/FAIL/WARN/SKIP
    def add(self, cat, name, status, detail=""):
        self.rows.append((cat, name, status, detail))
    def fails(self):
        return [r for r in self.rows if r[2] == "FAIL"]
    def counts(self):
        c = {"PASS": 0, "FAIL": 0, "WARN": 0, "SKIP": 0}
        for r in self.rows:
            c[r[2]] = c.get(r[2], 0) + 1
        return c

def status_for(passed, severity):
    """passed bool + severity(FAIL/WARN) -> status."""
    if passed:
        return "PASS"
    return "FAIL" if severity == "FAIL" else "WARN"

# ------------------------------------------------------------------ HTTP cache
_HTTP = {}
def http_head_size(url, timeout):
    """Zwraca (status_code, size_bytes|None). Cache. HEAD -> fallback GET stream."""
    if url in _HTTP:
        return _HTTP[url]
    import requests
    res = (None, None)
    try:
        r = requests.head(url, timeout=timeout, allow_redirects=True)
        size = r.headers.get("content-length")
        if r.status_code == 200 and size is None:
            # render API czesto nie daje content-length na HEAD -> GET
            g = requests.get(url, timeout=timeout, stream=True)
            body = g.content
            res = (g.status_code, len(body))
            g.close()
        else:
            res = (r.status_code, int(size) if size else None)
    except Exception as e:
        res = ("ERR:%s" % type(e).__name__, None)
    _HTTP[url] = res
    return res

def http_get_bytes(url, timeout):
    import requests
    try:
        r = requests.get(url, timeout=timeout)
        if r.status_code == 200:
            return r.content
    except Exception:
        return None
    return None

# ------------------------------------------------------------------ code / sections
SECTION_RE = re.compile(r'<section\b[^>]*\bid\s*=\s*"([^"]+)"', re.I)

def parse_sections(html):
    return SECTION_RE.findall(html or "")

def section_has_attr(html, sec_id, attr):
    """Czy sekcja o danym id ma dany atrybut w tagu otwierajacym <section ...>."""
    for m in re.finditer(r'<section\b([^>]*)>', html or "", re.I):
        tag = m.group(1)
        idm = re.search(r'\bid\s*=\s*"([^"]+)"', tag, re.I)
        if idm and idm.group(1) == sec_id and attr.lower() in tag.lower():
            return True
    return False

def image_urls(html):
    """Wszystkie URL-e bud-assets (obrazy + mp4) z HTML (rozkodowane &amp;).
    Pomija PREFIKSY konkatenacji JS (np. var SB=".../bud-assets/masazer/" w hero-video):
    URL konczacy sie na '/' lub ktorego ostatni segment nie ma rozszerzenia pliku
    to nie asset — pelne URL-e powstaja dopiero w runtime (hero-loop standard 19.07)."""
    urls = set()
    for m in re.finditer(r'https://[^\s"\'<>]*bud-assets/[^\s"\'<>)]+', html or ""):
        u = m.group(0).replace("&amp;", "&")
        path = u.split("?")[0]
        last = path.rstrip("/").rsplit("/", 1)[-1]
        if path.endswith("/") or "." not in last:
            continue
        urls.add(u)
    return sorted(urls)

def url_asset_path(url):
    """Sciezka assetu wewn. bud-assets bez query, np. scenes/hero-d.webp"""
    m = re.search(r'bud-assets/[^/]+/(.+?)(\?|$)', url)
    return m.group(1) if m else url

def url_width(url):
    m = re.search(r'[?&]width=(\d+)', url)
    return int(m.group(1)) if m else 0

# ================================================================== CHECKS

def find_glob(archiwum, pattern):
    return glob.glob(os.path.join(archiwum, pattern.replace("/", os.sep)))

def check_files(res, M, ctx):
    m = M["files"]; sev = m["severity"]; arch = ctx["archiwum"]
    for rel in m["wymagane"]:
        p = os.path.join(arch, rel.replace("/", os.sep))
        ok = os.path.isfile(p) and os.path.getsize(p) > 0
        res.add("files", rel, status_for(ok, sev),
                "" if ok else ("brak" if not os.path.exists(p) else "pusty"))
    for g in m["globy"]:
        files = find_glob(arch, g["glob"])
        ok = len(files) >= g["min"]
        res.add("files", g["label"], status_for(ok, sev), "%d/%d" % (len(files), g["min"]))
    # brand wzorce
    brand_files = [os.path.basename(x).lower() for x in find_glob(arch, "brand/*")]
    for bw in m.get("brand_wzorce", []):
        pats = bw["wzor"].split("|")
        ok = any(fnmatch.fnmatch(bf, "*" + p.strip("*") + "*") or fnmatch.fnmatch(bf, p) for bf in brand_files for p in pats)
        res.add("files", "brand: " + bw["label"], status_for(ok, sev), "" if ok else "brak wzorca")

def check_dopasowanie(res, M, ctx):
    m = M["dopasowanie"]; sev = m["severity"]; arch = ctx["archiwum"]
    sections = ctx["sections"]
    comps = [os.path.basename(x) for x in find_glob(arch, m["kompozyt_glob"])]
    comps_n = [norm(c) for c in comps]
    aliasy = m["aliasy_sekcji"]
    matched, missing = [], []
    for i, sid in enumerate(sections, start=1):
        toks = aliasy.get(sid, [sid])
        toks = [norm(t) for t in toks] + ["%02d" % i, str(i)]
        hit = any(any(t and t in cn for t in toks) for cn in comps_n)
        (matched if hit else missing).append(sid)
    if missing:
        res.add("dopasowanie", "kompozyty per sekcja", status_for(False, sev),
                "%d/%d; brak: %s" % (len(matched), len(sections), ", ".join(missing)))
    else:
        res.add("dopasowanie", "kompozyty per sekcja", "PASS",
                "%d/%d" % (len(matched), len(sections)))
    # DOPASOWANIE.md z wierszami SSIM
    md_p = os.path.join(arch, m["md"].replace("/", os.sep))
    md = read_text(md_p)
    if not md:
        res.add("dopasowanie", "DOPASOWANIE.md + wiersze SSIM", status_for(False, sev), "brak pliku")
    else:
        rx = re.compile(m["md_ssim_regex"])
        rows_ssim = sum(1 for ln in md.splitlines() if rx.search(ln))
        ok = rows_ssim >= len(sections)
        res.add("dopasowanie", "DOPASOWANIE.md + wiersze SSIM", status_for(ok, sev),
                "%d wierszy SSIM / %d sekcji" % (rows_ssim, len(sections)))
    # --- MOBILE (390): komplet NN-*-m.png == liczba sekcji + werdykty mobile w DOPASOWANIE.md
    mob = m.get("mobile")
    if mob:
        msev = mob["severity"]
        mcomps = [os.path.basename(x) for x in find_glob(arch, mob["kompozyt_glob"])]
        mcomps_n = [norm(c) for c in mcomps]
        mmatched, mmissing = [], []
        for i, sid in enumerate(sections, start=1):
            toks = aliasy.get(sid, [sid])
            toks = [norm(t) for t in toks] + ["%02d" % i, str(i)]
            hit = any(any(t and t in cn for t in toks) for cn in mcomps_n)
            (mmatched if hit else mmissing).append(sid)
        if mmissing:
            res.add("dopasowanie", "kompozyty mobile per sekcja (-m)", status_for(False, msev),
                    "%d/%d; brak: %s" % (len(mmatched), len(sections), ", ".join(mmissing)))
        else:
            res.add("dopasowanie", "kompozyty mobile per sekcja (-m)", "PASS",
                    "%d/%d (razem %d plikow -m)" % (len(mmatched), len(sections), len(mcomps)))
        # werdykty mobile w sekcji MOBILE DOPASOWANIE.md
        if not md or mob["md_marker"] not in md:
            res.add("dopasowanie", "werdykty mobile (MOBILE-390)", status_for(False, msev),
                    "brak sekcji MOBILE w DOPASOWANIE.md")
        else:
            mob_block = md.split(mob["md_marker"], 1)[1]
            vx = re.compile(mob["verdict_regex"])
            n_verd = sum(1 for ln in mob_block.splitlines() if vx.search(ln))
            ok = n_verd >= len(sections)
            res.add("dopasowanie", "werdykty mobile (MOBILE-390)", status_for(ok, msev),
                    "%d werdyktow / %d sekcji" % (n_verd, len(sections)))

# ================================================================== F1a: MANIFEST SEKCJI (kontrakt kompletnosci) + F6: BRAMKA CTA (szkielet)
def _alias_groups(sid, aliasy):
    """(norms, raws) — klasa rownowaznosci id sekcji: znormalizowane tokeny + surowe alias-stringi
       ze WSZYSTKICH grup aliasy_sekcji, ktore zawieraja to id (jako klucz LUB na liscie).
       Dzieki temu manifest 'zaufanie' <-> kod 'trust' <-> plik '02' = jedna sekcja."""
    base = norm(sid)
    norms = {base} if base else set()
    raws = {sid} if sid else set()
    for k, vals in (aliasy or {}).items():
        grp_raw = [k] + list(vals)
        grp_norm = {norm(x) for x in grp_raw if norm(x)}
        if base and base in grp_norm:
            norms |= grp_norm
            raws |= set(grp_raw)
    return norms, raws

def check_sekcje_plan(res, M, ctx):
    """F1a — rekoncyliacja MANIFESTU SEKCJI (PLAN.md) <-> makieta d <-> <section id> <-> kompozyt.
       Brak PLAN.md lub brak markera '## MANIFEST SEKCJI' = SKIP (landing sprzed reguly; zero regresji)."""
    m = M.get("sekcje_plan")
    if not m:
        res.add("sekcje_plan", "(config)", "SKIP", "brak sekcje_plan w manifescie")
        return
    sev = m["severity"]; arch = ctx.get("archiwum")
    plan = read_text(os.path.join(arch, m.get("plan_plik", "PLAN.md").replace("/", os.sep))) if arch else None
    marker = m["manifest_marker"]
    if not plan or marker not in plan:
        # LUKA1: brak manifestu NIE jest juz bezwarunkowym SKIP (to czynilo cala gwarancje
        # OPCJONALNA). Dyskryminator po mtime kodu (index.html = ctx["code"]): kod dotkniety
        # >= wymagany_od_data BEZ manifestu = FAIL (nowy landing MUSI miec F1a); kod starszy /
        # brak sciezki = SKIP (landing sprzed reguly, retro przy dotknieciu).
        cutoff = m.get("wymagany_od_data")
        code_path = ctx.get("code")
        new = False
        if cutoff and code_path:
            try:
                cutoff_ts = datetime.strptime(cutoff, "%Y-%m-%d").timestamp()
                new = os.path.getmtime(code_path) >= cutoff_ts
            except Exception:
                new = False
        if new:
            res.add("sekcje_plan", "MANIFEST SEKCJI wymagany (nowy landing)",
                    status_for(False, m.get("brak_manifestu_nowy_severity", "FAIL")),
                    "kod po %s bez '%s' w PLAN.md — F1a wymagany" % (cutoff, marker))
        else:
            res.add("sekcje_plan", "(brak MANIFESTU SEKCJI w PLAN.md)", "SKIP", "landing sprzed reguly")
        return
    aliasy = M.get("dopasowanie", {}).get("aliasy_sekcji", {})
    # blok manifestu: od markera do nastepnego naglowka markdown (## ...)
    after = plan.split(marker, 1)[1]
    block = []
    for ln in after.splitlines():
        if re.match(r"^\s*#{1,6}\s", ln):
            break
        block.append(ln)
    rx = re.compile(m["linia_regex"], re.I if m.get("linia_case_insensitive") else 0)
    entries = []
    for ln in block:
        mm = rx.match(ln)
        if mm:
            entries.append((mm.group(1), (mm.group(2) or "").lower(), (mm.group(3) or "").lower(), mm.group(4) or ""))
    if not entries:
        res.add("sekcje_plan", "MANIFEST SEKCJI (parsowanie)", "WARN",
                "marker obecny ale 0 linii sparsowanych — sprawdz format wpisow (id | typ | status)")
        return
    comps_n = [norm(os.path.basename(x)) for x in find_glob(arch, M["dopasowanie"]["kompozyt_glob"])]
    sec_norm = [norm(s) for s in ctx.get("sections", [])]
    makieta_glob = m.get("makieta_glob", "makiety/*{id}*")
    mwyk = [x.lower() for x in m.get("makieta_wyklucz", [])]
    st_build = m.get("status_build", "build"); st_skip = m.get("status_skip", "skip")
    minlen = m.get("skip_powod_min_len", 6)
    planned = set()
    n_build = n_skip = problems = 0
    for sid, typ, status, reszta in entries:
        norms, raws = _alias_groups(sid, aliasy)
        planned |= norms
        if status == st_build:
            n_build += 1
            missing = []
            # (a) makieta desktop (prob. surowe id + aliasy; filtr mobile/00-/styl-master)
            found_mk = False
            for tok in raws:
                for p in find_glob(arch, makieta_glob.replace("{id}", tok)):
                    bn = os.path.basename(p).lower()
                    if os.path.isfile(p) and not any(w in bn for w in mwyk):
                        found_mk = True; break
                if found_mk:
                    break
            if not found_mk:
                missing.append("makieta d")
            # (b) <section id> w kodzie (po aliasach, rownosc znormalizowana)
            if not any(sn in norms for sn in sec_norm):
                missing.append("<section id>")
            # (c) kompozyt dopasowania (substring po tokenach klasy rownowaznosci)
            if not any(any(t and t in cn for t in norms) for cn in comps_n):
                missing.append("kompozyt")
            if missing:
                problems += 1
                res.add("sekcje_plan", "build: %s" % sid, status_for(False, sev),
                        "brak: " + ", ".join(missing))
        elif status == st_skip:
            n_skip += 1
            reason = re.sub(r"^[\s\-‐-―:|*]+", "", reszta or "")
            if len(re.sub(r"\s", "", reason)) < minlen:
                problems += 1
                res.add("sekcje_plan", "skip: %s" % sid, status_for(False, sev),
                        "SKIP bez powodu (wymagane >= %d znakow niebialych)" % minlen)
    # LUKA7: RDZEN kompletnosci PLANU. Manifest sprawdzal 'czy zbudowano co zaplanowano',
    # nie 'czy zaplanowano komplet'. rdzen_wymagany = sekcje ktore MUSZA byc w manifescie
    # jako BUILD (nie skip). Rdzen musi zmapowac sie (przez klase rownowaznosci aliasow)
    # na jakikolwiek wpis 'build'; brak = FAIL (plan pominal hero/oferte/mid-cta/final).
    build_norms = set()
    for _sid, _typ, _status, _reszta in entries:
        if _status == st_build:
            build_norms |= _alias_groups(_sid, aliasy)[0]
    rsev = m.get("rdzen_severity", "FAIL")
    for rid in m.get("rdzen_wymagany", []):
        rnorms = _alias_groups(rid, aliasy)[0]
        if not (build_norms & rnorms):
            problems += 1
            res.add("sekcje_plan", "rdzen sekcji: " + rid, status_for(False, rsev),
                    "brak rdzeniowej sekcji '" + rid + "' jako build w MANIFEŚCIE")
    # nieplanowane sekcje w kodzie (spoza manifestu i spoza wyklucz_id_kod) = WARN
    nsev = m.get("nieplanowana_severity", "WARN")
    wyk = set(norm(x) for x in m.get("wyklucz_id_kod", []))
    for s, sn in zip(ctx.get("sections", []), sec_norm):
        if sn in planned or sn in wyk:
            continue
        problems += 1
        res.add("sekcje_plan", "nieplanowana: %s" % s, status_for(False, nsev),
                "sekcja w kodzie spoza MANIFESTU SEKCJI")
    if problems == 0:
        res.add("sekcje_plan", "manifest <-> makieta/kod/kompozyt", "PASS",
                "%d build + %d skip — komplet pokryty" % (n_build, n_skip))

_CTA_SEC_OPEN_RE = re.compile(r'<section\b[^>]*\bid\s*=\s*"([^"]+)"', re.I)
_CTA_SEC_CLOSE_RE = re.compile(r'</section\s*>', re.I)

def _cta_section_spans(markup):
    """[(start, id, end)] dla kazdej <section id=...>; end = najblizszy </section> po starcie
       (landingi = plaskie rodzenstwo sekcji). Do mapowania [data-checkout] -> otaczajaca sekcja.
       Wystapienie poza jakimkolwiek spanem (przed 1. sekcja / po ostatniej) = kontener 'poza-sekcja'."""
    closes = [mm.start() for mm in _CTA_SEC_CLOSE_RE.finditer(markup)]
    spans = []
    for mm in _CTA_SEC_OPEN_RE.finditer(markup):
        start = mm.start()
        end = next((c for c in closes if c > start), len(markup))
        spans.append((start, mm.group(1), end))
    return spans

def check_cta(res, M, ctx):
    """F6 — BRAMKA CTA. (a) liczba [data-checkout] >= min_count; (b) dedykowana sekcja CTA (mid-cta)
       ORAZ final; (c) >=1 re-CTA w sekcji mid-page (poza hero/zamow/final i poza sticky/footer/topbar).
       Proxy WARN: sekcje designed_cta obecne w kodzie bez zaprojektowanego .btn.cta. Brak html = SKIP."""
    m = M.get("cta")
    if not m:
        res.add("cta", "(config)", "SKIP", "brak cta w manifescie")
        return
    html = ctx.get("html")
    if not html:
        res.add("cta", "(brak html)", "SKIP", "brak kodu HTML")
        return
    sev = m["severity"]
    markup = strip_scripts(html)  # bez <script>/<style> — NIE licz '[data-checkout]' z JS/CSS
    attr = m.get("checkout_attr", "data-checkout")
    attr_rx = re.compile(re.escape(attr) + r"(?![-\w])", re.I)
    spans = _cta_section_spans(markup)
    aliasy = M.get("dopasowanie", {}).get("aliasy_sekcji", {})
    def norms_of(sid):
        return _alias_groups(sid, aliasy)[0]
    # mapowanie kazdego [data-checkout] -> otaczajaca <section id> (None = kontener poza-sekcja)
    per_section = {}
    total = 0
    for mm in attr_rx.finditer(markup):
        total += 1
        sid = None
        for start, s_id, end in spans:
            if start < mm.start() < end:
                sid = s_id; break
        per_section[sid] = per_section.get(sid, 0) + 1
    sections = ctx.get("sections") or [s for _, s, _ in spans]
    kontenery = set(norm(x) for x in m.get("recta_kontenery_wyklucz", []))
    # (a) liczba CTA
    min_count = m.get("min_count", 4)
    # LUKA6: sticky-buy jest mobile-only. min_count_wyklucz_kontenery=true => total do progu
    # liczony BEZ kontenerow poza-sekcja (per_section[None]) i sekcji-kontenerow
    # (recta_kontenery_wyklucz: sticky/topbar/footer) => min_count=4 = realne CTA w sekcjach
    # TRESCI widoczne na desktopie (hero+oferta+mid-cta+final).
    total_thr = total
    if m.get("min_count_wyklucz_kontenery"):
        excl_n = per_section.get(None, 0)
        for sid_k, cnt_k in per_section.items():
            if sid_k is None:
                continue
            if norm(sid_k) in kontenery or (norms_of(sid_k) & kontenery):
                excl_n += cnt_k
        total_thr = total - excl_n
    # checkout-inline@2: submit .zc-cta w sekcji z modulem (class zc-checkout) = pelnoprawne
    # CTA sekcji tresci (kanon 20.07) — dolicz do progu min_count.
    ci_kl2 = (m.get("checkout_inline_klasa") or "").lower()
    if ci_kl2:
        for start, s_id, end in spans:
            if s_id and ci_kl2 in markup[start:end].lower():
                total_thr += 1
                break
    ok_min = total_thr >= min_count
    res.add("cta", "liczba [%s] >= %d" % (attr, min_count),
            status_for(ok_min, m.get("min_count_severity", sev)),
            "%d/%d" % (total_thr, min_count) if ok_min else "za malo CTA: %d/%d" % (total_thr, min_count))
    # (b) dedykowana sekcja CTA (mid-cta) + final
    dedy = set(norm(x) for x in m.get("dedykowana_aliasy", []))
    has_dedy = any(norm(s) in dedy or (norms_of(s) & dedy) for s in sections)
    res.add("cta", "dedykowana sekcja CTA (mid-cta)",
            status_for(has_dedy, m.get("dedykowana_severity", sev)),
            "obecna" if has_dedy else "brak dedykowanej sekcji CTA (mid-cta)")
    # LUKA2: sama obecnosc <section id=mid-cta> nie wystarcza — dedykowana sekcja CTA MUSI
    # zawierac >=1 [data-checkout], inaczej 'sekcja ktorej sensem jest CTA' nie ma przycisku
    # a bramka zielona.
    if has_dedy and m.get("dedykowana_ma_checkout"):
        dedy_id = None
        for s in sections:
            if norm(s) in dedy or (norms_of(s) & dedy):
                dedy_id = s; break
        dcnt = per_section.get(dedy_id, 0) if dedy_id is not None else 0
        res.add("cta", "dedykowana sekcja CTA ma [%s]" % attr,
                status_for(dcnt >= 1, m.get("dedykowana_severity", sev)),
                "%d [%s] w sekcji %s" % (dcnt, attr, dedy_id) if dcnt >= 1
                else "sekcja %s BEZ [%s] — dedykowana sekcja CTA bez przycisku" % (dedy_id, attr))
    if m.get("wymagana_final", True):
        fin = set(norm(x) for x in m.get("final_aliasy", []))
        has_final = any(norm(s) in fin or (norms_of(s) & fin) for s in sections)
        res.add("cta", "sekcja FINAL CTA",
                status_for(has_final, m.get("final_severity", sev)),
                "obecna" if has_final else "brak sekcji FINAL CTA")
    # (c) re-CTA mid-page (desktop): >=1 [data-checkout] w sekcji spoza wyklucz + spoza kontenerow
    rexcl = set(norm(x) for x in m.get("recta_wyklucz_sekcje", []))
    kontenery = set(norm(x) for x in m.get("recta_kontenery_wyklucz", []))
    recta_ids = []
    for sid, cnt in per_section.items():
        if sid is None or cnt <= 0:
            continue  # poza-sekcja (sticky/topbar/footer) — nie liczy jako re-CTA mid-page
        sn = norm(sid); ex = norms_of(sid)
        if sn in rexcl or (ex & rexcl):
            continue
        if sn in kontenery or (ex & kontenery):
            continue
        recta_ids.append(sid)
    res.add("cta", "re-CTA mid-page (desktop)",
            status_for(bool(recta_ids), m.get("recta_severity", sev)),
            ("re-CTA w: %s" % ", ".join(sorted(set(recta_ids)))) if recta_ids
            else "brak re-CTA na desktopie (mid-page)")
    # PROXY: sekcje designed_cta obecne w kodzie musza miec zaprojektowany .btn.cta.
    # LUKA3: sekcje zawsze-obecne (designed_cta_proxy_fail_sekcje: hero/zamow/final) BEZ .btn.cta
    # = realny defekt => FAIL; pozostale designed_cta_sekcje (np. mid-cta) => WARN (brak samej
    # sekcji lapie dedykowana_severity/dedykowana_ma_checkout).
    psev_warn = m.get("designed_cta_proxy_severity", "WARN")
    fail_secs = set(norm(x) for x in m.get("designed_cta_proxy_fail_sekcje", []))
    for did in m.get("designed_cta_sekcje", []):
        dn = norm(did)
        present_id = None
        for s in sections:
            if norm(s) == dn or (dn in norms_of(s)):
                present_id = s; break
        if not present_id:
            continue  # nieobecna (np. mid-cta) — luke lapie check (b), nie proxy
        slice_txt = ""
        for start, s_id, end in spans:
            if s_id == present_id:
                slice_txt = markup[start:end]; break
        low = slice_txt.lower()
        # checkout-inline@2 (kanon 20.07, MODULY.md): sekcja zamow z osadzonym modulem
        # (class zc-checkout) MA CTA — submit .zc-cta "Zamawiam i place" zastepuje <a .btn.cta>.
        ci_kl = (m.get("checkout_inline_klasa") or "").lower()
        if ci_kl and ci_kl in low:
            continue
        if ("btn cta" not in low) and ("btn.cta" not in low):
            psev = "FAIL" if dn in fail_secs else psev_warn
            res.add("cta", "designed CTA: %s" % present_id, status_for(False, psev),
                    "sekcja %s bez zaprojektowanego .btn.cta (sprawdz makiete)" % present_id)

def check_interakcje(res, M, ctx):
    m = M["interakcje"]; sev = m["severity"]; arch = ctx["archiwum"]
    html = ctx["html"]; ledger = ctx["ledger"] or ""
    ids = set(m.get("always_ids", []))
    for sid in ctx["sections"]:
        if section_has_attr(html, sid, m["tor_i_attr"]):
            ids.add(sid)
    # tylko te always_ids ktore realnie sa sekcjami + wszystkie z tor-i
    ids = [i for i in ids if i in ctx["sections"] or section_has_attr(html, i, m["tor_i_attr"])]
    if not ids:
        res.add("interakcje", "(brak sekcji interaktywnych)", "SKIP", "")
        return
    idir = os.path.join(arch, "interakcje")
    for sid in sorted(ids):
        dg = re.search(m["downgrade_regex"].replace("{id}", re.escape(sid)), ledger, re.I)
        if dg:
            res.add("interakcje", sid, "SKIP", "downgrade w LEDGER")
            continue
        missing = []
        for tmpl in m["wymagane_na_sekcje"]:
            fn = tmpl.replace("{id}", sid)
            if not (os.path.isfile(os.path.join(idir, fn)) and os.path.getsize(os.path.join(idir, fn)) > 0):
                missing.append(fn)
        tdir = os.path.join(idir, m["wymagany_katalog"].replace("{id}", sid))
        if not (os.path.isdir(tdir) and os.listdir(tdir)):
            missing.append(m["wymagany_katalog"].replace("{id}", sid) + "/")
        ok = not missing
        res.add("interakcje", sid, status_for(ok, sev), "" if ok else "brak: " + ", ".join(missing))

def check_grep_forbidden(res, M, ctx):
    m = M["grep_forbidden"]; html = ctx["html"]; low = html.lower()
    def apply_rule(rule):
        sev = rule["severity"]; label = rule["label"]
        if "regex" in rule:
            hits = re.findall(rule["regex"], html, re.I)
            ok = not hits
            det = "" if ok else "%d trafien: %s" % (len(hits), str(hits[:3]))
        else:
            n = low.count(rule["text"].lower())
            ok = n == 0
            det = "" if ok else "%d trafien" % n
        res.add("grep", label, status_for(ok, sev), det)
    for rule in m["statyczne"]:
        apply_rule(rule)
    # zakazy PRODUKTOWE (per-landing override; np. TYMO tylko na loczek/odpalak — task#6)
    for rule in m.get("per_landing", {}).get(ctx["slug"], []):
        apply_rule(rule)
    # dynamiczny shop z KARTY PRAWDY
    d = m["dynamiczne_shop"]; sev = d["severity"]
    karta = ctx["karta"]
    if not karta:
        res.add("grep", "shop white-label (dynamiczny)", "SKIP", "brak KARTA-PRAWDY.md")
        return
    ignor = set(x.lower() for x in d["ignoruj_kandydatow"])
    cands = set()
    for ln in karta.splitlines():
        ll = ln.lower()
        if not any(k.lower() in ll for k in d["linie_zawieraja"]):
            continue
        # stringi w cudzyslowach/backtickach + po dwukropku
        for c in re.findall(r'[`"„”\'"]([^`"„”\']{2,60})[`"„”\']', ln):
            cands.add(c.strip())
        if ":" in ln:
            after = ln.split(":", 1)[1].strip()
            if 0 < len(after) <= 60:
                cands.add(after.strip("` *"))
    # filtr kandydatow
    clean = []
    for c in cands:
        cl = c.strip().strip("*`").strip()
        if len(cl) < d["min_dlugosc"]:
            continue
        low_c = cl.lower()
        if any(ig in low_c for ig in ignor):
            continue
        if re.search(r'[{}]', cl):
            continue
        clean.append(cl)
    if not clean:
        res.add("grep", "shop white-label (dynamiczny)", "PASS", "brak konkretnej nazwy shop w karcie")
        return
    hits = [c for c in clean if c.lower() in low]
    ok = not hits
    res.add("grep", "shop white-label (dynamiczny)", status_for(ok, sev),
            ("kandydaci: %s" % clean[:5]) if ok else ("WYCIEK: %s" % hits))

def collect_assets(arch, m):
    exts = tuple(m["rozszerzenia"])
    out = []
    for p in find_glob(arch, m["assets_glob"]):
        if os.path.isfile(p) and p.lower().endswith(exts):
            out.append(p)
    return out

def check_sieroty(res, M, ctx):
    m = M["sieroty"]; sev = m["severity"]; arch = ctx["archiwum"]
    html = ctx["html"]; nhtml = norm(html)
    # dokumentacja (MAPA-ASSETOW / F3)
    docs = ""
    for dn in m["dokumentacja"]:
        t = read_text(os.path.join(arch, dn))
        if t:
            docs += "\n" + t
    ndocs = norm(docs)
    doc_low = docs.lower()
    orphans = []
    assets = collect_assets(arch, m)
    for p in assets:
        stem = os.path.splitext(os.path.basename(p))[0]
        ns = norm(stem)
        if ns and ns in nhtml:
            continue
        if ns and ns in ndocs:
            # udokumentowany — sprawdz czy nie jest tylko skreslony (i tak OK = udokumentowany)
            continue
        orphans.append(os.path.basename(p))
    ok = not orphans
    res.add("sieroty", "assety bez URL i bez dokumentacji", status_for(ok, sev),
            ("%d/%d udokumentowanych" % (len(assets) - len(orphans), len(assets))) if ok
            else ("sieroty: %s" % orphans))
    # HTTP 200 dla URL-i bud-assets w kodzie.
    # Rozdziel bledy TWARDE (asset naprawde brak: 404/403/410...) = FAIL od TRANSIENTNYCH
    # (blip sieci: ERR:*, 429, 5xx) = WARN — blip nie moze wywalac gate'u (task#5b).
    if m.get("http_200") and not ctx["no_net"]:
        transient_codes = set(m.get("http_transient_codes", [408, 425, 429, 500, 502, 503, 504]))
        def is_transient(code):
            return (isinstance(code, str) and code.startswith("ERR:")) or (isinstance(code, int) and code in transient_codes)
        hard, transient = [], []
        for u in ctx["urls"]:
            code, _ = http_head_size(u, ctx["timeout"])
            if code == 200:
                continue
            (transient if is_transient(code) else hard).append("%s -> %s" % (url_asset_path(u), code))
        if hard:
            res.add("sieroty", "URL-e bud-assets HTTP 200", status_for(False, sev),
                    "TWARDE: " + "; ".join(hard[:8]) + (" (+%d transient)" % len(transient) if transient else ""))
        elif transient:
            res.add("sieroty", "URL-e bud-assets HTTP 200", "WARN",
                    "tylko transient (blip sieci, nie blokuje): " + "; ".join(transient[:8]))
        else:
            res.add("sieroty", "URL-e bud-assets HTTP 200", "PASS", "%d URL-i OK" % len(ctx["urls"]))
    else:
        res.add("sieroty", "URL-e bud-assets HTTP 200", "SKIP", "--no-net")

def classify_weight(url, m):
    p = url.lower()
    for k in m["klasy"]:
        if any(mt.lower() in p for mt in k["match"]):
            return k["label"], k["max_kb"]
    return "inne", m["domyslny_max_kb"]

def check_wagi(res, M, ctx):
    m = M["wagi"]; sev = m["severity"]
    if ctx["no_net"]:
        res.add("wagi", "(budzety wag)", "SKIP", "--no-net")
        return
    # per asset-path: najwiekszy wariant width
    best = {}
    for u in ctx["urls"]:
        ap = url_asset_path(u)
        w = url_width(u)
        if ap not in best or w > best[ap][1]:
            best[ap] = (u, w)
    any_row = False
    for ap, (u, w) in sorted(best.items()):
        label, maxkb = classify_weight(u, m)
        code, size = http_head_size(u, ctx["timeout"])
        if code != 200 or size is None:
            res.add("wagi", ap, "SKIP", "brak rozmiaru (%s)" % code)
            continue
        kb = size / 1024.0
        ok = kb <= maxkb
        any_row = True
        res.add("wagi", "%s [%s]" % (ap, label), status_for(ok, sev),
                "%.0f KB / %d KB" % (kb, maxkb))
    if not any_row:
        res.add("wagi", "(budzety wag)", "SKIP", "brak URL-i obrazowych")

def check_phash(res, M, ctx):
    m = M["phash"]; sev = m["severity"]
    if ctx["no_net"]:
        res.add("phash", "(anty-monotonia)", "SKIP", "--no-net")
        return
    try:
        import imagehash
        from PIL import Image
        import io
    except Exception as e:
        res.add("phash", "(anty-monotonia)", "SKIP", "brak imagehash/PIL: %s" % e)
        return
    # jeden wariant (najwiekszy) per asset-path z klas scena/produkt
    cand = {}
    for u in ctx["urls"]:
        ap = url_asset_path(u)
        if not any(c in u for c in m["klasy_path"]):
            continue
        w = url_width(u)
        if ap not in cand or w > cand[ap][1]:
            cand[ap] = (u, w)
    hashes = {}
    for ap, (u, w) in cand.items():
        b = http_get_bytes(u, ctx["timeout"])
        if not b:
            continue
        try:
            hashes[ap] = imagehash.phash(Image.open(io.BytesIO(b)).convert("RGB"))
        except Exception:
            continue
    keys = sorted(hashes)
    dups = []
    for i in range(len(keys)):
        for j in range(i + 1, len(keys)):
            a, b = keys[i], keys[j]
            if any(tok in a.lower() or tok in b.lower() for tok in m["wyjatek_tokeny"]):
                continue
            dist = hashes[a] - hashes[b]
            if dist <= m["hamming_max"]:
                dups.append("%s <=> %s (d=%d)" % (a, b, dist))
    ok = not dups
    res.add("phash", "near-dup scena/produkt (Hamming<=%d)" % m["hamming_max"],
            status_for(ok, sev),
            ("%d obrazow porownanych" % len(hashes)) if ok else ("; ".join(dups)))

def curated_items(v):
    """Zwraca liste itemow kuracji (obsluguje [] oraz {items:[...]})."""
    if isinstance(v, list):
        return v
    if isinstance(v, dict) and isinstance(v.get("items"), list):
        return v["items"]
    return None

def curated_keep_count(v):
    """Liczba KEEP itemow (keep_count / items[keep] / len)."""
    if isinstance(v, dict) and isinstance(v.get("keep_count"), int):
        return v["keep_count"]
    items = curated_items(v)
    if items is None:
        return len(v) if isinstance(v, (list, dict)) else 0
    return len([x for x in items if (not isinstance(x, dict)) or x.get("keep", True)])

def curated_nonempty(v):
    items = curated_items(v)
    if items is not None:
        return len([x for x in items if (not isinstance(x, dict)) or x.get("keep", True)]) > 0
    return bool(v)

def pg_get(env, M, table, params, timeout):
    """PostgREST GET -> lista dict albo None (brak dostepu).
       Host WYMUSZONY na projekcie CRM z manifestu (baza.host / panel_sync.host / host_fallback),
       NIE z env SUPABASE_URL — bo .env moze wskazywac projekt sparingu i mielibysmy dane z ZLEGO
       projektu (jak panel_sync; task#5c). Jesli klucz nie pasuje do CRM -> 401 -> None -> SKIP."""
    import requests
    url = (M.get("baza", {}).get("host") or M.get("panel_sync", {}).get("host")
           or M["supabase"]["host_fallback"])
    key = env.get(M["supabase"]["key_env"])
    if not key:
        return None
    base = url.rstrip("/") + "/rest/v1/" + table
    try:
        r = requests.get(base, params=params, timeout=timeout,
                         headers={"apikey": key, "Authorization": "Bearer " + key})
        if r.status_code == 200:
            return r.json()
        return None
    except Exception:
        return None

def check_baza(res, M, ctx):
    m = M["baza"]; sev = m["severity"]; env = ctx["env"]
    if ctx["no_net"] or not env.get(M["supabase"]["key_env"]):
        res.add("baza", "(kuracje + rejestr nazw)", "SKIP", "brak SUPABASE_SERVICE_KEY / --no-net")
        return
    pk = ctx["product_key"]
    if pk:
        rows = pg_get(env, M, m["tabela_produkty"],
                      {"id": "eq." + pk, "select": "%s,%s" % (m["kolumny_kuracji"]["gallery"], m["kolumny_kuracji"]["videos"])},
                      ctx["timeout"])
        if rows is None:
            res.add("baza", "bud_tt_products", "SKIP", "brak dostepu do bazy")
        elif not rows:
            res.add("baza", "bud_tt_products", status_for(False, sev), "brak wiersza id=%s" % pk)
        else:
            row = rows[0]
            g = row.get(m["kolumny_kuracji"]["gallery"])
            v = row.get(m["kolumny_kuracji"]["videos"])
            gok = curated_nonempty(g)
            gi = curated_items(g)
            res.add("baza", "gallery_curated niepuste", status_for(gok, sev),
                    ("%d keep" % curated_keep_count(g)) if gok else "puste/NULL")
            vok = curated_nonempty(v) or ("wideo" in (ctx["ledger"] or "").lower())
            res.add("baza", "videos_curated niepuste-lub-nota", status_for(vok, sev),
                    ("%d keep" % curated_keep_count(v)) if curated_nonempty(v)
                    else ("nota wideo w LEDGER" if vok else "puste/NULL i brak noty"))
    else:
        res.add("baza", "bud_tt_products", "SKIP", "brak product-key")
    # bud_brand_names — rezerwacja keyed po SLUG (mini-marka USP-first != slug: 'Odprężek' vs 'masazer';
    # stary check 'name ilike slug' dzialal tylko gdy marka~slug [Loczek/loczek], FAIL gdy sie roznia — masazer 19.07)
    kol_slug = m.get("kolumna_slug", "slug")
    brand_rows = pg_get(env, M, m["tabela_nazw"],
                        {kol_slug: "eq." + ctx["slug"], "select": "%s,%s" % (m["kolumna_nazwy"], kol_slug)},
                        ctx["timeout"])
    if brand_rows is None:
        res.add("baza", "bud_brand_names", "SKIP", "brak dostepu")
    else:
        ok = len(brand_rows) > 0
        nm = (brand_rows[0].get(m["kolumna_nazwy"]) if ok else None)
        res.add("baza", "bud_brand_names ma wpis slug='%s'" % ctx["slug"], status_for(ok, sev),
                ("marka '%s'" % nm) if ok else "brak rezerwacji nazwy dla slug")

def check_wideo_kafle(res, M, ctx):
    m = M["wideo_kafle"]; sev = m["severity"]; html = ctx["html"]
    # licz kafle: literalne <video ORAZ (opcj.) unikalne sciezki .mp4 (lazy data-src)
    n_tags = len(re.findall(re.escape(m["video_tag"]), html, re.I))
    n_mp4 = 0
    if m.get("licz_mp4_z_url"):
        n_mp4 = len(set(url_asset_path(u) for u in ctx["urls"] if u.lower().split("?")[0].endswith(".mp4")))
    n_video = max(n_tags, n_mp4)
    if n_video == 0:
        res.add("wideo_kafle", "kafle wideo == keep", "SKIP", "brak wideo (tagow <video ani .mp4) w HTML")
        return
    downgrade = bool(re.search(m["downgrade_regex"], ctx["ledger"] or "", re.I))
    # keep z bazy
    n_keep = None
    env = ctx["env"]
    if not ctx["no_net"] and env.get(M["supabase"]["key_env"]) and ctx["product_key"]:
        rows = pg_get(env, M, M["baza"]["tabela_produkty"],
                      {"id": "eq." + ctx["product_key"], "select": M["baza"]["kolumny_kuracji"]["videos"]},
                      ctx["timeout"])
        if rows:
            v = rows[0].get(M["baza"]["kolumny_kuracji"]["videos"])
            if v is not None:
                n_keep = curated_keep_count(v)
    if n_keep is None:
        if downgrade:
            res.add("wideo_kafle", "kafle wideo == keep", "PASS", "%d kafli; downgrade wideo w LEDGER" % n_video)
        else:
            res.add("wideo_kafle", "kafle wideo == keep", "SKIP",
                    "%d kafli; brak videos_curated z bazy do porownania" % n_video)
        return
    ok = (n_video == n_keep) or downgrade
    res.add("wideo_kafle", "kafle wideo == keep", status_for(ok, sev),
            "kafle=%d keep=%d%s" % (n_video, n_keep, " (downgrade)" if downgrade else ""))

def check_makiety_mobile(res, M, ctx):
    m = M["makiety_mobile"]; sev = m["severity"]; arch = ctx["archiwum"]
    has_tor_i = any(section_has_attr(ctx["html"], s, "data-tor-i") for s in ctx["sections"]) or ("demo" in ctx["sections"])
    has_wideo = any(s in ("wideo", "video", "interakcja") for s in ctx["sections"])
    nota = bool(re.search(m["nota_regex"], ctx["ledger"] or "", re.I))
    for req in m["wymagane"]:
        gate = req["gdy"]
        if gate == "tor_i" and not has_tor_i:
            continue
        if gate == "wideo" and not has_wideo:
            continue
        found = any(find_glob(arch, w) for w in req["wzory"])
        ok = found or nota
        res.add("makiety_mobile", req["label"], status_for(ok, sev),
                "" if found else ("nota w LEDGER" if nota else "brak pliku i noty"))
    # F2.4 rozszerzenie (Tomek 18.07): mobile-makieta dla KAZDEJ sekcji — komplet mobile == liczba
    # sekcji (== liczba makiet desktop poza styl-master). Wlacza flaga komplet_wg_sekcji w manifescie.
    # Wlasny, WASKI komplet_nota_regex (nota_regex ogolne matchuje kazda wzmianke 'makiety mobile',
    # wiec bezuzyteczne jako wentyl kompletu).
    if m.get("komplet_wg_sekcji"):
        IMG = (".png", ".webp", ".jpg", ".jpeg")
        excl = tuple(x.lower() for x in m.get("komplet_wyklucz", ["styl-master", "00-"]))
        allm = [os.path.basename(x) for x in find_glob(arch, "makiety/*")]
        imgs = [n for n in allm if n.lower().endswith(IMG)]
        desktop = [n for n in imgs if "mobile" not in n.lower() and not any(e in n.lower() for e in excl)]
        mobile = [n for n in imgs if "mobile" in n.lower()]
        n_sec = len(ctx["sections"]) or len(desktop)
        knota = bool(re.search(m.get("komplet_nota_regex", r"(?!x)x"), ctx["ledger"] or "", re.I))
        ok = (len(mobile) >= n_sec) or knota
        res.add("makiety_mobile", "komplet mobile == sekcje", status_for(ok, sev),
                "%d mobile / %d sekcji%s" % (len(mobile), n_sec,
                    "" if len(mobile) >= n_sec else (" — nota-wyjatek w LEDGER" if knota else " — BRAK par mobile")))

def check_og_image(res, M, ctx):
    m = M["og_image"]; sev = m["severity"]; html = ctx["html"]
    mm = re.search(m["meta_regex"], html, re.I)
    if not mm:
        res.add("og_image", "og:image dedykowany", status_for(False, sev), "brak og:image")
        return
    url = mm.group(1)
    bad = [t for t in m["zakazane_tokeny"] if t.lower() in url.lower()]
    has_expected = m["oczekiwany_token"].lower() in url_asset_path(url).lower()
    ok = (not bad) and has_expected
    if bad:
        det = "og wskazuje scene hero: %s" % url_asset_path(url)
    elif not has_expected:
        det = "brak dedykowanego pliku '%s': %s" % (m["oczekiwany_token"], url_asset_path(url))
    else:
        det = url_asset_path(url)
    res.add("og_image", "og:image dedykowany 1200x630", status_for(ok, sev), det)

def check_ledger_fazy(res, M, ctx):
    m = M["ledger_fazy"]; sev = m["severity"]; arch = ctx["archiwum"]
    ledger = (ctx["ledger"] or "")
    for r in m["reguly"]:
        present = False
        if "gdy_plik" in r:
            present = os.path.isfile(os.path.join(arch, r["gdy_plik"]))
        elif "gdy_katalog" in r:
            present = os.path.isdir(os.path.join(arch, r["gdy_katalog"]))
        if not present:
            res.add("ledger_fazy", r["label"], "SKIP", "faza nieobecna w archiwum")
            continue
        ok = any(tok.lower() in ledger.lower() for tok in r["ledger_zawiera"])
        res.add("ledger_fazy", r["label"], status_for(ok, sev),
                "" if ok else "brak linii kosztow fazy w LEDGER")

# ================================================================== R13: rubryka + layout-diff
def resolve_sectype(sid, M):
    st = M.get("sekcja_typy", {})
    al = st.get("aliasy", {})
    def nn(x): return norm(al.get(x, x))
    base = nn(sid)
    for k in st.get("kodowa", []):
        if norm(k) == base or norm(k) == norm(sid): return "kodowa"
    for k in st.get("scenowa", []):
        if norm(k) == base or norm(k) == norm(sid): return "scenowa"
    return "inna"

def parse_md_table(md):
    """Pierwsza tabela z naglowkiem zawierajacym 'sekcja' (przed MOBILE-390).
       Zwraca (header_cells, {sekcja_id: cells})."""
    head = md.split("<!-- MOBILE-390 -->", 1)[0]
    rows = []
    for ln in head.splitlines():
        s = ln.strip()
        if s.startswith("|") and s.endswith("|"):
            rows.append([c.strip() for c in s.strip("|").split("|")])
    header = None; hi = -1
    for i, r in enumerate(rows):
        if r and norm(r[0]) == "sekcja":
            header = r; hi = i; break
    if header is None:
        return (None, {})
    data = {}
    for r in rows[hi+1:]:
        if len(r) != len(header):
            continue
        if all(re.fullmatch(r"[-:\s]*", c) for c in r):
            continue
        sid = r[0].strip()
        if not sid or re.fullmatch(r"[-:\s]*", sid):
            continue
        data[sid] = r
    return (header, data)

def col_idx(header, *keys):
    for i, h in enumerate(header):
        for k in keys:
            if k in norm(h):
                return i
    return -1

def check_werdykt_rubryka(res, M, ctx):
    m = M.get("werdykt_rubryka")
    if not m:
        res.add("rubryka", "(config)", "SKIP", "brak werdykt_rubryka w manifescie")
        return
    sev = m["severity"]
    md = ctx.get("dopasowanie_md")
    if not md:
        res.add("rubryka", "DOPASOWANIE.md", status_for(False, sev), "brak pliku")
        return
    header, data = parse_md_table(md)
    if not header:
        res.add("rubryka", "tabela werdyktow", status_for(False, sev), "brak tabeli z naglowkiem 'sekcja'")
        return
    wi = col_idx(header, "werdykt")
    pol = re.compile(m["pole_regex"], re.I)
    wrx = re.compile(m["werdykt_regex"], re.I)
    bare = re.compile(m["tak_bez_werdykt_regex"], re.I)
    fraza = re.compile(m["fraza_wytrych_regex"], re.I)
    minp = m.get("min_pol", 5)
    sections = ctx["sections"]
    seen = 0
    for sid in sections:
        # dopasuj wiersz po id (lub aliasie DOM)
        row = data.get(sid)
        if row is None:
            for k in data:
                if norm(k) == norm(sid):
                    row = data[k]; break
        if row is None:
            res.add("rubryka", sid, status_for(False, sev), "brak wiersza w DOPASOWANIE.md")
            continue
        seen += 1
        cell = row[wi] if 0 <= wi < len(row) else row[-1]
        flags = pol.findall(cell)
        wm = wrx.search(cell)
        verdict = wm.group(1).upper() if wm else (bare.search(cell).group(1).upper() if bare.search(cell) else None)
        stype = resolve_sectype(sid, M)
        n_t = sum(1 for f in flags if f.upper() == "T")
        # (b) sekcje KODOWE: fraza-wytrych w werdykcie (odpuszczanie defektu) = FAIL
        if stype == "kodowa":
            fm = fraza.search(cell)
            if fm:
                res.add("rubryka", sid, status_for(False, sev),
                        "fraza-wytrych w werdykcie KODOWEJ: '%s'" % fm.group(0))
                continue
        # (a) WERDYKT=TAK bez kompletu 5xT
        if verdict == "TAK" and (len(flags) < minp or n_t < minp):
            res.add("rubryka", sid, status_for(False, sev),
                    "WERDYKT=TAK bez kompletu %dxT (pol=%d, T=%d)" % (minp, len(flags), n_t))
            continue
        if verdict is None:
            res.add("rubryka", sid, status_for(False, sev), "brak WERDYKT (TAK/NIE) w wierszu")
            continue
        # (c) WERDYKT=NIE = sekcja niezgodna z makieta -> FAIL (task#5a; dawniej PASS = agent
        # mogl jawnie przyznac NIE a gate i tak przepuszczal — dziura uczciwosci).
        if verdict == "NIE":
            res.add("rubryka", sid, status_for(False, sev),
                    "WERDYKT=NIE (sekcja NIEZGODNA z makieta — petla dopasowania niedomknieta)")
            continue
        res.add("rubryka", sid, "PASS", "%s (%dxT)" % (verdict, n_t))
    if seen == 0:
        res.add("rubryka", "(wiersze)", status_for(False, sev), "zaden wiersz sekcji nie sparsowany")

def check_layout_diff(res, M, ctx):
    m = M.get("layout_diff")
    if not m:
        res.add("layout", "(config)", "SKIP", "brak layout_diff w manifescie")
        return
    sev = m["severity"]
    # IR komplet == sekcje (R13: wymuszamy IR dla WSZYSTKICH sekcji)
    ir_dir = os.path.join(ctx["archiwum"], m.get("ir_dir", "ir"))
    ir_files = glob.glob(os.path.join(ir_dir, m.get("ir_glob", "*-IR.json")))
    n_sec = len(ctx["sections"])
    ok_ir = len(ir_files) >= n_sec
    res.add("layout", "IR komplet == sekcje", status_for(ok_ir, sev),
            "%d IR / %d sekcji" % (len(ir_files), n_sec))
    # LAYOUT column w DOPASOWANIE.md
    md = ctx.get("dopasowanie_md")
    if not md:
        res.add("layout", "kolumna LAYOUT", status_for(False, sev), "brak DOPASOWANIE.md")
        return
    header, data = parse_md_table(md)
    if not header:
        res.add("layout", "kolumna LAYOUT", status_for(False, sev), "brak tabeli")
        return
    li = col_idx(header, "layout")
    if li < 0:
        res.add("layout", "kolumna LAYOUT", status_for(False, sev),
                "brak kolumny LAYOUT — uruchom sekcja-diff.py (R13)")
        return
    ftok = m.get("fail_token", "LAYOUT-FAIL")
    fails = []
    for sid, row in data.items():
        cell = row[li] if 0 <= li < len(row) else ""
        if ftok in cell or re.search(r"\bFAIL\b", cell):
            fails.append("%s: %s" % (sid, cell[:60]))
    if fails:
        res.add("layout", "LAYOUT-FAIL per sekcja", status_for(False, sev),
                "%d FAIL: %s" % (len(fails), " | ".join(fails[:6])))
    else:
        res.add("layout", "LAYOUT-FAIL per sekcja", "PASS", "brak LAYOUT-FAIL")

# ================================================================== F3A: GATE WIERNOSCI DO SKUTKU
def parse_pipe_table(md, header_key):
    """Zwraca (header_cells, [data_rows,...]) pierwszej tabeli markdown, ktorej
       naglowek zawiera header_key w KTOREJKOLWIEK komorce (norm). Pomija separatory."""
    rows = []
    for ln in (md or "").splitlines():
        s = ln.strip()
        if s.startswith("|") and s.endswith("|"):
            rows.append([c.strip() for c in s.strip("|").split("|")])
    header = None; hi = -1
    for i, r in enumerate(rows):
        if r and any(header_key in norm(c) for c in r):
            header = r; hi = i; break
    if header is None:
        for i, r in enumerate(rows):
            if not all(re.fullmatch(r"[-:\s]*", c) for c in r):
                header = r; hi = i; break
    if header is None:
        return (None, [])
    data = []
    for r in rows[hi+1:]:
        if all(re.fullmatch(r"[-:\s]*", c) for c in r):
            continue
        data.append(r)
    return (header, data)

def count_paszport_features(paszport, marker, header_tokeny):
    """K = liczba wierszy DANYCH tabeli pod naglowkiem zawierajacym marker
       ('Cechy dyskryminujace'). None = brak PASZPORT; 0 = brak tabeli."""
    if paszport is None:
        return None
    lines = paszport.splitlines()
    start = None
    for i, ln in enumerate(lines):
        if marker.lower() in ln.lower():
            start = i; break
    if start is None:
        return 0
    k = 0; seen = False
    for ln in lines[start+1:]:
        s = ln.strip()
        if s.startswith("#"):
            if seen:
                break
            continue
        if s.startswith("|") and s.endswith("|"):
            cells = [c.strip() for c in s.strip("|").split("|")]
            if all(re.fullmatch(r"[-:\s]*", c) for c in cells):
                continue
            if not seen and any(t in norm(cells[0]) for t in header_tokeny):
                seen = True  # to jest wiersz naglowka tabeli — pomin
                continue
            seen = True
            k += 1
        elif seen and not s:
            break
    return k

def check_wiernosc(res, M, ctx):
    """F3A — GATE WIERNOSCI DO SKUTKU: kazda grafika produktowa uzyta w kodzie
       ma wiersz w dopasowanie/WIERNOSC.md z werdyktem ZGODNA/REAL/ESKALACJA."""
    m = M.get("wiernosc")
    if not m:
        res.add("wiernosc", "(config)", "SKIP", "brak wiernosc w manifescie")
        return
    sev = m["severity"]; arch = ctx["archiwum"]
    # --- K z PASZPORT (tabela 'Cechy dyskryminujace')
    paszport = read_text(os.path.join(arch, m.get("paszport", "PASZPORT.md").replace("/", os.sep)))
    header_tokeny = m.get("cechy_header_tokeny", ["cecha"])
    K = count_paszport_features(paszport, m.get("cechy_marker", "Cechy dyskryminuj"), header_tokeny)
    if paszport is None:
        res.add("wiernosc", "PASZPORT.md (cechy dyskryminujace)", status_for(False, sev), "brak PASZPORT.md")
        K = 0
    elif K == 0:
        res.add("wiernosc", "PASZPORT.md tabela 'Cechy dyskryminujace'", "WARN",
                "brak tabeli cech — retro-PASZPORT wymagany przy najblizszym dotknieciu")
    else:
        res.add("wiernosc", "PASZPORT.md tabela 'Cechy dyskryminujace'", "PASS", "K=%d cech" % K)
    # --- grafiki produktowe uzyte w kodzie (URL-e), z wykluczeniami
    tokens = [t.lower() for t in m.get("prod_path_tokens", [])]
    excl = [t.lower() for t in m.get("wyklucz_tokeny", [])]
    prod = {}
    for u in ctx["urls"]:
        ul = u.lower()
        if any(x in ul for x in excl):
            continue
        if not any(t in ul for t in tokens):
            continue
        prod[url_asset_path(u)] = u
    if not prod:
        res.add("wiernosc", "(grafiki produktowe)", "SKIP", "brak grafik produktowych w kodzie")
        return
    # --- WIERNOSC.md
    md = read_text(os.path.join(arch, m.get("md", "dopasowanie/WIERNOSC.md").replace("/", os.sep)))
    if not md:
        lst = ", ".join(sorted(os.path.basename(p) for p in prod)[:8])
        res.add("wiernosc", "dopasowanie/WIERNOSC.md", status_for(False, sev),
                "brak pliku — %d grafik produktowych bez dowodu wiernosci: %s" % (len(prod), lst))
        return
    header, drows = parse_pipe_table(md, "grafik")
    ci_pass2 = col_idx(header, "pass2") if header else -1
    ci_cech = col_idx(header, "cech") if header else -1
    ci_rund = col_idx(header, "rund") if header else -1
    ci_werd = col_idx(header, "wierno", "werdykt") if header else -1
    wrx = re.compile(m["werdykt_regex"], re.I)
    p2rx = re.compile(m.get("pass2_regex", "(TAK|NIE|OK)"), re.I)
    p2lead = re.compile(m.get("pass2_lead_regex", "^\\s*(TAK|OK)"), re.I)
    frx = re.compile(m.get("cecha_fail_regex", "\\bFAIL\\b"), re.I)
    prx = re.compile(m.get("cecha_pass_regex", "\\bPASS\\b"), re.I)
    rurx = re.compile(m.get("rundy_regex", "rund[ay]?\\D{0,4}(\\d+)"), re.I)
    ledger_low = (ctx.get("ledger") or "").lower()
    esc_toks = [t.lower() for t in m.get("eskalacja_ledger_tokeny", [])]
    max_rundy = m.get("max_rundy", 3)
    real_token = m.get("real_token", "REAL").upper()
    for ap in sorted(prod):
        stem = norm(os.path.splitext(os.path.basename(ap))[0])
        row = None
        for r in drows:
            if stem and stem in norm(" ".join(r)):
                row = r; break
        if row is None:
            res.add("wiernosc", os.path.basename(ap), status_for(False, sev), "brak wiersza w WIERNOSC.md")
            continue
        rowtext = " ".join(row)
        # FIX 20.07: dopasowany wiersz z INNEJ tabeli (pod-tabela 9-kol inset/waga/struna lub 7-kol
        # strefa-negatywna) ma inna liczbe kolumn niz naglowek glownej tabeli -> indeksy kolumn
        # (ci_rund/ci_cech/ci_pass2/ci_werd z naglowka 8-kol) wskazuja ZLA komorke (np. 'waga'=122
        # czytana jako 'rundy' -> falszywy FAIL 'rundy 122>3'). Gdy ksztalt != naglowek, indeksy
        # kolumn sa NIEWAZNE -> fallback na regex po calym rowtext (bezpiecznie zwraca None gdy brak).
        same_shape = (header is not None and len(row) == len(header))
        werd_src = row[ci_werd] if (0 <= ci_werd < len(row) and same_shape) else rowtext
        wm = wrx.search(werd_src) or wrx.search(rowtext)
        verdict = wm.group(1).upper() if wm else None
        if verdict == real_token:
            res.add("wiernosc", os.path.basename(ap), "PASS", "REAL (realny kadr, bez cech)")
            continue
        if verdict is None:
            res.add("wiernosc", os.path.basename(ap), status_for(False, sev), "brak werdyktu WIERNOSC w wierszu")
            continue
        # cechy: PASS/FAIL (preferuj kolumne 'cech')
        cech_cell = row[ci_cech] if (0 <= ci_cech < len(row) and same_shape) else rowtext
        n_fail = len(frx.findall(cech_cell))
        n_pass = len(prx.findall(cech_cell))
        # pass-2 (drugie oczy): lead TAK/OK w kolumnie, albo jawny marker w wierszu
        if 0 <= ci_pass2 < len(row) and same_shape:
            pass2 = bool(p2lead.match(row[ci_pass2]))
        else:
            pm = p2rx.search(rowtext)
            pass2 = bool(pm) and pm.group(1).upper() in ("TAK", "OK", "ZGOD")
        # rundy
        if 0 <= ci_rund < len(row) and same_shape:
            dm = re.search(r"\d+", row[ci_rund])
            rundy = int(dm.group(0)) if dm else None
        else:
            rm = rurx.search(rowtext)
            rundy = int(rm.group(1)) if rm else None
        if verdict == "ZGODNA":
            problems = []
            if n_fail > 0:
                problems.append("%d FAIL cech (PRODUKT niewaivable)" % n_fail)
            if K and n_pass < K:
                problems.append("PASS %d/%d < K" % (n_pass, K))
            if not pass2:
                problems.append("pass-2 (drugie oczy) != TAK")
            if rundy is not None and rundy > max_rundy:
                problems.append("rundy %d>%d bez ESKALACJA" % (rundy, max_rundy))
            ok = not problems
            res.add("wiernosc", os.path.basename(ap), status_for(ok, sev),
                    ("ZGODNA (%d/%d cech, pass-2 TAK)" % (n_pass, K)) if ok
                    else ("ZGODNA ODRZUCONA: " + "; ".join(problems)))
        elif verdict == "ESKALACJA":
            has_note = any(t in ledger_low for t in esc_toks)
            res.add("wiernosc", os.path.basename(ap), status_for(has_note, sev),
                    "ESKALACJA + nota LEDGER" if has_note else "ESKALACJA bez noty w LEDGER (wymagana)")
        else:  # NIEZGODNA
            res.add("wiernosc", os.path.basename(ap), status_for(False, sev),
                    "NIEZGODNA — grafika niezgodna z produktem (petla regen/eskalacja niedomknieta)")

# ================================================================== CROSS-LANDING: anty-rodzenstwo (partytura vs N poprzednich)
# Powod (audyt 20.07): masazer <-> Drapek = 9/10 'ta sama strona z podmienionym produktem'.
# Caly gate byl zakotwiczony w JEDNYM slugu — zero mechanizmu na ZA MALO ROZNICY.
# Doktryna: STANDARD Z6 + TOKENS-MAKIETY.md 'KANON vs PARTYTURA' + PRZEWODNIK-GRAFICZNY §2b.
_GENERIC_FONTS = {"sans-serif", "serif", "monospace", "cursive", "fantasy", "system-ui",
                  "ui-sans-serif", "ui-serif", "-apple-system", "blinkmacsystemfont",
                  "inherit", "initial", "unset", "segoe ui", "helvetica neue", "arial",
                  "roboto", "helvetica", "georgia", "times new roman"}

def _hex_to_rgb(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def _rgb_to_lab(rgb):
    """sRGB (0-255) -> CIE Lab (D65). Bez zaleznosci zewnetrznych (Pillow niepotrzebny)."""
    def inv(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (inv(x) for x in rgb)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 1.00000
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    def f(t):
        return t ** (1.0 / 3) if t > 0.008856 else (7.787 * t + 16.0 / 116)
    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))

def _delta_e76(h1, h2):
    """CIE76 na Lab — wystarczajaco ostry do pytania 'czy to ten sam kolor akcentu'."""
    a, b = _rgb_to_lab(_hex_to_rgb(h1)), _rgb_to_lab(_hex_to_rgb(h2))
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5

def _css_source(html):
    """HTML bez <script>/<template>/<noscript>, ale Z ZACHOWANYM <style> — strip_scripts()
       wycina takze <style>, wiec do parsowania CSS (tokeny :root, reguly h1) jest bezuzyteczny."""
    return re.sub(r"(?is)<(script|template|noscript)\b[^>]*>.*?</\1>", " ", html or "")

def _root_vars(html):
    """{--token: wartosc} ze WSZYSTKICH blokow :root{...}; pierwsze wystapienie wygrywa."""
    out = {}
    for m in re.finditer(r":root\s*\{(.*?)\}", _css_source(html), re.S):
        body = re.sub(r"/\*.*?\*/", " ", m.group(1), flags=re.S)
        for decl in body.split(";"):
            if ":" not in decl:
                continue
            k, v = decl.split(":", 1)
            k, v = k.strip(), v.strip()
            if k.startswith("--") and k not in out:
                out[k] = v
    return out

def _first_family(decl):
    """Pierwsza NIEgeneryczna rodzina z deklaracji font-family."""
    for part in (decl or "").split(","):
        p = part.strip().strip('"').strip("'").strip()
        if not p or p.startswith("var(") or p.lower() in _GENERIC_FONTS:
            continue
        return p
    return None

def _font_display(html, m):
    """(rodzina, zrodlo) — (1) token --font-display, (2) regula CSS z h1/h2, (3) link Google Fonts."""
    # komentarze CSS WYCIETE: '/* wymuszony lam h1 */' przed regula .hero-price dawalo
    # falszywe trafienie selektora h1 (masazer -> 'Nunito Sans' zamiast display 'Baloo 2')
    css = re.sub(r"/\*.*?\*/", " ", _css_source(html), flags=re.S)
    rv = _root_vars(html)
    for tok in m.get("font_display_tokeny", []):
        fam = _first_family(rv.get(tok, ""))
        if fam:
            return fam, tok
    sels = [s.lower() for s in m.get("font_naglowek_selektory", ["h1"])]
    for mm in re.finditer(r"([^{}]+)\{([^{}]*)\}", css):
        sel, body = mm.group(1).strip().lower(), mm.group(2)
        if "font-family" not in body:
            continue
        if not any(re.search(r"(^|[\s,>+~])" + re.escape(s) + r"($|[\s,{:.\[])", sel + " ") for s in sels):
            continue
        fam = _first_family(re.search(r"font-family\s*:\s*([^;}]+)", body).group(1))
        if fam:
            return fam, "css h1/h2"
    for href in re.findall(r"fonts\.googleapis\.com/css2\?([^\"'\s>]+)", html or ""):
        fams = re.findall(r"family=([^&:]+)", href.replace("&amp;", "&"))
        if fams:
            return fams[0].replace("+", " ").strip(), "google fonts"
    return None, None

def _akcent_hex(html, m):
    """(hex, token) jedynego akcentu; warianty -d/-ink/-soft pomijane (hover/tekst/tint)."""
    rv = _root_vars(html)
    bad = tuple(m.get("akcent_wyklucz_sufiksy", []))
    for tok in m.get("akcent_tokeny", []):
        if tok.endswith(bad):
            continue
        val = rv.get(tok, "")
        vm = re.search(r"var\(\s*(--[\w-]+)", val)
        if vm:
            val = rv.get(vm.group(1), "")
        hm = re.search(r"#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b", val)
        if hm:
            return "#" + hm.group(1), tok
    return None, None

def _sekcje_norm(html, M, m):
    al = M.get("sekcja_typy", {}).get("aliasy", {})
    excl = [norm(x) for x in m.get("sekwencja_wyklucz_id", [])]
    out = []
    for sid in parse_sections(html):
        n = norm(al.get(sid, sid))
        if n and n not in excl:
            out.append(n)
    return out

def _lcs_len(a, b):
    dp = [0] * (len(b) + 1)
    for x in a:
        prev = 0
        for j, y in enumerate(b):
            cur = dp[j + 1]
            dp[j + 1] = prev + 1 if x == y else max(dp[j + 1], dp[j])
            prev = cur
    return dp[len(b)]

def _archetyp(arch_dir, m):
    if not arch_dir:
        return None
    md = read_text(os.path.join(arch_dir, m.get("archetyp_plik", "PLAN.md").replace("/", os.sep)))
    if not md:
        return None
    am = re.search(m.get("archetyp_regex", r"archetyp[-_ ]?hero\s*[:=]\s*([A-Za-z])\b"), md, re.I)
    return am.group(1).upper() if am else None

def _poprzednicy(M, m, ctx):
    """[(slug, html, archiwum)] — N landingow zbudowanych PRZED tym (mtime index.html), od najnowszego."""
    pat = m.get("kod_glob", "").replace("/", os.sep)
    excl = set(m.get("wyklucz_slugi", [])) | {ctx["slug"]}
    try:
        mine = os.path.getmtime(ctx["code"])
    except OSError:
        # kod jeszcze nie istnieje (--cross-only PRZED budowa): wszystkie ZBUDOWANE
        # landingi sa poprzednikami (cutoff = teraz), a nie 'brak poprzednikow'.
        mine = time.time()
    cand = []
    for p in glob.glob(pat):
        s = os.path.basename(os.path.dirname(p))
        if s in excl:
            continue
        try:
            t = os.path.getmtime(p)
        except OSError:
            continue
        if t < mine:
            cand.append((t, s, p))
    cand.sort(reverse=True)
    out = []
    for _, s, p in cand[:int(m.get("n_poprzednich", 3))]:
        html = read_text(p)
        if html:
            out.append((s, html, latest_archiwum(M["sciezki"]["archiwum_glob"], s)))
    return out

def check_cross_landing(res, M, ctx):
    """ANTY-RODZENSTWO — partytura TEGO landingu vs N poprzednio zbudowanych.
       Font display / kolor akcentu / archetyp hero = FAIL; sekwencja sekcji = WARN.
       Brak poprzednikow lub brak danych = SKIP (pierwszy landing, landingi sprzed doktryny)."""
    m = M.get("cross_landing")
    if not m:
        res.add("cross_landing", "(config)", "SKIP", "brak cross_landing w manifescie")
        return
    prev = _poprzednicy(M, m, ctx)
    if not prev:
        res.add("cross_landing", "(poprzednie landingi)", "SKIP",
                "brak wczesniejszych landingow — nie ma z czym porownac")
        return
    res.add("cross_landing", "poprzednicy (od najnowszego)", "PASS",
            ", ".join(s for s, _, _ in prev))
    html = ctx["html"]

    # --- 1. FONT DISPLAY (partytura; identyczny z ktoryms z N = FAIL)
    sev_f = m.get("font_severity", m["severity"])
    fam, src = _font_display(html, m)
    if not fam:
        res.add("cross_landing", "font display", "SKIP", "nie wykryto rodziny display w kodzie")
    else:
        same = [s for s, h, _ in prev if (_font_display(h, m)[0] or "") and norm(_font_display(h, m)[0]) == norm(fam)]
        res.add("cross_landing", "font display != 3 poprzednie", status_for(not same, sev_f),
                ("'%s' (zrodlo: %s)" % (fam, src)) if not same
                else "'%s' POWTORZONY z: %s — partytura z nawyku (TOKENS §1)" % (fam, ", ".join(same)))

    # --- 2. KOLOR AKCENTU (Delta E CIE76 < progu = to samo pasmo = FAIL)
    sev_a = m.get("akcent_severity", m["severity"])
    dmin = float(m.get("delta_e_min", 15))
    hx, tok = _akcent_hex(html, m)
    if not hx:
        res.add("cross_landing", "akcent: dE >= %.0f" % dmin, "SKIP",
                "nie wykryto tokena akcentu (%s)" % "/".join(m.get("akcent_tokeny", [])))
    else:
        bliskie, opis = [], []
        for s, h, _ in prev:
            ph, _t = _akcent_hex(h, m)
            if not ph:
                continue
            d = _delta_e76(hx, ph)
            opis.append("%s %s dE=%.1f" % (s, ph, d))
            if d < dmin:
                bliskie.append("%s (%s, dE=%.1f)" % (s, ph, d))
        if not opis:
            res.add("cross_landing", "akcent: dE >= %.0f" % dmin, "SKIP",
                    "poprzednie landingi bez wykrywalnego tokena akcentu")
        else:
            res.add("cross_landing", "akcent: dE >= %.0f" % dmin, status_for(not bliskie, sev_a),
                    ("%s [%s] · %s" % (hx, tok, "; ".join(opis))) if not bliskie
                    else "%s ZA BLISKO: %s (akcent = partytura, wolno wyprowadzic z koloru produktu)"
                         % (hx, "; ".join(bliskie)))

    # --- 3. ARCHETYP HERO (vs BEZPOSREDNIO poprzedni)
    sev_h = m.get("archetyp_severity", m["severity"])
    mine_a = _archetyp(ctx["archiwum"], m)
    prev_slug, _ph, prev_arch_dir = prev[0]
    prev_a = _archetyp(prev_arch_dir, m)
    if not mine_a or not prev_a:
        brak = []
        if not mine_a: brak.append("ten landing")
        if not prev_a: brak.append(prev_slug)
        res.add("cross_landing", "archetyp hero != poprzedni", "SKIP",
                "brak linii 'archetyp-hero:' w PLAN.md: %s" % ", ".join(brak))
    else:
        ok = mine_a != prev_a
        res.add("cross_landing", "archetyp hero != poprzedni", status_for(ok, sev_h),
                ("%s (poprzedni %s: %s)" % (mine_a, prev_slug, prev_a)) if ok
                else "OBA '%s' — hero to najmocniejszy nosnik tozsamosci (STANDARD §F2 pkt 2)" % mine_a)

    # --- 4. SEKWENCJA SEKCJI (LCS-Dice; WARN — rdzen bywa wymuszony produktem)
    sev_s = m.get("sekwencja_severity", "WARN")
    prog = float(m.get("sekwencja_pct_warn", 80))
    a = _sekcje_norm(html, M, m)
    b = _sekcje_norm(prev[0][1], M, m)
    if not a or not b:
        res.add("cross_landing", "sekwencja sekcji < %.0f%%" % prog, "SKIP", "brak <section id> po ktorejs stronie")
    else:
        lcs = _lcs_len(a, b)
        dice = 200.0 * lcs / (len(a) + len(b))
        jac = 100.0 * len(set(a) & set(b)) / max(1, len(set(a) | set(b)))
        ok = dice <= prog
        res.add("cross_landing", "sekwencja sekcji < %.0f%%" % prog, status_for(ok, sev_s),
                "LCS-Dice %.0f%% vs %s (Jaccard %.0f%%, %d/%d sekcji wspolnych w kolejnosci)%s"
                % (dice, prev_slug, jac, lcs, max(len(a), len(b)),
                   "" if ok else " — mapa sekcji z nawyku (PLAN F1)"))

# ================================================================== PANEL-SYNC: egzekwowalny most fabryka -> panel tn-sklepy (wf2_*)
def _pg_crm(M, env, table, params, timeout):
    """GET PostgREST na projekcie CRM. Host WYMUSZONY z manifestu (panel_sync.host),
       NIE z env SUPABASE_URL — bo .env moze wskazywac projekt sparingu (patrz MOST-PANEL.md).
       Zwraca list|None (None = brak klucza/dostepu/blad)."""
    import requests
    m = M["panel_sync"]
    host = m.get("host") or M["supabase"]["host_fallback"]
    key = env.get(M["supabase"]["key_env"])
    if not key:
        return None
    try:
        r = requests.get(host.rstrip("/") + "/rest/v1/" + table, params=params, timeout=timeout,
                         headers={"apikey": key, "Authorization": "Bearer " + key})
        return r.json() if r.status_code == 200 else None
    except Exception:
        return None

def _stem(path_or_url):
    """Znormalizowany rdzen nazwy pliku z URL/sciezki (bez query, katalogu, rozszerzenia)."""
    s = str(path_or_url or "").split("?")[0].rstrip("/")
    base = s.replace("\\", "/").split("/")[-1]
    return norm(os.path.splitext(base)[0])

def _arch_files(arch, glob_pat, wyklucz):
    """Basenames plikow archiwum pasujacych do globa, z wykluczeniem tokenow w nazwie."""
    out = []
    wyk = [x.lower() for x in (wyklucz or [])]
    for p in find_glob(arch, glob_pat):
        if not os.path.isfile(p):
            continue
        bn = os.path.basename(p)
        if any(x in bn.lower() for x in wyk):
            continue
        out.append(bn)
    return sorted(set(out))

def check_panel_sync(res, M, ctx):
    """EGZEKWOWALNY check kompletnosci MOSTU fabryka->panel tn-sklepy (wf2_*).
    Gwarantuje, ze deliverable/artefakt istniejacy w archiwum-kodzie ma odbicie w panelu
    (krok done, artefakty == pliki, karta produktu, doc-i, wzmianki kod->panel). Zrodlo prawdy
    o KOMPLETNOSCI syncu = TEN check + manifest, nie pamiec agenta ('sync per faza' bez kontroli).
    Landing bez projektu w panelu -> SKIP (nie kazdy preview ma projekt)."""
    m = M.get("panel_sync")
    if not m:
        res.add("panel_sync", "(config)", "SKIP", "brak panel_sync w manifescie")
        return
    sev = m["severity"]; env = ctx["env"]; arch = ctx["archiwum"]
    if ctx["no_net"] or not env.get(M["supabase"]["key_env"]):
        res.add("panel_sync", "(most fabryka->panel)", "SKIP", "brak SUPABASE_SERVICE_KEY / --no-net")
        return
    # --- MAPOWANIE: landing slug -> wf2_products (jedno okno mostu) ---
    prod = _pg_crm(M, env, m["tabela_produkty"],
                   {m.get("slug_kolumna", "slug"): "eq." + ctx["slug"], "select": "*"}, ctx["timeout"])
    if prod is None:
        res.add("panel_sync", "wf2_products (dostep)", "SKIP", "brak dostepu do bazy CRM")
        return
    if not prod:
        res.add("panel_sync", "projekt panelu", "SKIP",
                "landing bez projektu panelu (brak wiersza wf2_products slug=%s) — nie fail" % ctx["slug"])
        return
    P = prod[0]; pid = P["id"]
    steps = _pg_crm(M, env, m["tabela_kroki"],
                    {"product_id": "eq." + pid, "select": "step_key,status,data"}, ctx["timeout"]) or []
    arts = _pg_crm(M, env, m["tabela_artefakty"],
                   {"product_id": "eq." + pid, "select": "kind,step_key,url,label,storage"}, ctx["timeout"]) or []
    step_by = {s.get("step_key"): s for s in steps}
    res.add("panel_sync", "projekt panelu", "PASS",
            "wf2_products id=%s status=%s · %d krokow · %d artefaktow" % (pid[:8], P.get("status"), len(steps), len(arts)))

    # --- (1) KARTA PRODUKTU: kluczowe kolumny nie-NULL ---
    braki = [k for k in m.get("karta_kolumny_wymagane", []) if P.get(k) in (None, "", [])]
    res.add("panel_sync", "karta produktu (kolumny)", status_for(not braki, sev),
            "komplet (%s)" % ", ".join(m.get("karta_kolumny_wymagane", [])) if not braki
            else "NULL w kolumnach: " + ", ".join(braki))

    # --- (2) KROKI DONE: deliverable istnieje -> panel status='done' ---
    for kd in m.get("kroki_done", []):
        step = kd["step"]
        exists = bool(ctx["html"]) if kd.get("gdy_kod") else False
        for f in kd.get("gdy_plik", []):
            if os.path.isfile(os.path.join(arch, f.replace("/", os.sep))):
                exists = True
        for g in kd.get("gdy_glob", []):
            if find_glob(arch, g):
                exists = True
        if not exists:
            res.add("panel_sync", "krok %s == done" % step, "SKIP", "deliverable nieobecny w archiwum")
            continue
        st = (step_by.get(step) or {}).get("status")
        ok = (st == "done")
        s2 = "WARN" if kd.get("opcjonalny") else sev
        res.add("panel_sync", "krok %s == done" % step, status_for(ok, s2),
                "done" if ok else "deliverable '%s' istnieje, panel status=%s" % (kd["label"], st or "BRAK-KROKU"))

    # --- (3) ARTEFAKTY == PLIKI (stem-match / obecnosc) ---
    for r in m.get("artefakty_liczba", []):
        kinds = set(r["kind"])
        panel_arts = [a for a in arts if a.get("kind") in kinds]
        panel_stems = set(_stem(a.get("url")) for a in panel_arts)
        panel_n = len(panel_arts)
        arch_files = []
        for z in r["zrodla"]:
            arch_files += _arch_files(arch, z["glob"], z.get("wyklucz"))
        arch_files = sorted(set(arch_files))
        if r.get("tryb") == "obecnosc":
            ok = (not arch_files) or panel_n > 0
            res.add("panel_sync", "artefakty: %s" % r["label"], status_for(ok, sev),
                    "%d w panelu / %d plikow (obecnosc OK)" % (panel_n, len(arch_files)) if ok
                    else "%d plikow w archiwum, 0 artefaktow w panelu" % len(arch_files))
            continue
        if not arch_files:
            res.add("panel_sync", "artefakty: %s" % r["label"], "SKIP", "brak plikow zrodlowych w archiwum")
            continue
        missing = [f for f in arch_files if _stem(f) not in panel_stems]
        tol = r.get("tolerancja", 0)
        ok = len(missing) <= tol
        res.add("panel_sync", "artefakty: %s" % r["label"], status_for(ok, sev),
                "panel %d / archiwum %d (brak %d <= tol %d)" % (panel_n, len(arch_files), len(missing), tol) if ok
                else "panel NIEAKTUALNY vs archiwum: panel %d, archiwum %d; BRAK w panelu (%d): %s"
                     % (panel_n, len(arch_files), len(missing), ", ".join(missing[:10])))

    # --- (4) DOC WYMAGANE (np. WIERNOSC.md -> artefakt kind=doc) ---
    for d in m.get("doc_wymagane", []):
        if not os.path.isfile(os.path.join(arch, d["plik"].replace("/", os.sep))):
            res.add("panel_sync", "doc %s w panelu" % os.path.basename(d["plik"]), "SKIP", "brak pliku w archiwum")
            continue
        tok = d["token"].lower()
        has = any(a.get("kind") == d["kind"] and tok in (str(a.get("url", "")) + str(a.get("label", ""))).lower()
                  for a in arts)
        res.add("panel_sync", "doc %s w panelu" % os.path.basename(d["plik"]), status_for(has, sev),
                "obecny (kind=%s)" % d["kind"] if has
                else "%s w archiwum, BRAK artefaktu kind=%s w panelu" % (d["plik"], d["kind"]))

    # --- (5) KOD -> WZMIANKI (footer/logo w fields kroku; wideo w panelu) ---
    html = ctx["html"] or ""
    for w in m.get("kod_wzmianki", []):
        if not re.search(w["gdy_kod_regex"], html, re.I):
            continue  # element nieobecny w kodzie -> regula nie dotyczy
        wsev = w.get("severity", sev)
        data = (step_by.get(w["step"]) or {}).get("data") or {}
        hay = json.dumps({"fields": data.get("fields"), "note": data.get("note")}, ensure_ascii=False).lower()
        ok = any(t.lower() in hay for t in w["tokeny"])
        if not ok and w.get("kind_alt"):
            ok = any(a.get("kind") == w["kind_alt"] for a in arts)
        res.add("panel_sync", w["label"], status_for(ok, wsev),
                "wzmiankowane w panelu" if ok else "obecne w kodzie, BRAK wzmianki w panelu (krok %s)" % w["step"])

    # --- (6) PUSTE DONE (WARN): krok done bez opisu w warsztacie ---
    psev = m.get("puste_done_severity", "WARN")
    for s in steps:
        if not str(s.get("step_key", "")).startswith("lp_") or s.get("status") != "done":
            continue
        f = ((s.get("data") or {}).get("fields")) or {}
        if len(f) == 0:
            res.add("panel_sync", "opis kroku %s" % s["step_key"], status_for(False, psev),
                    "krok done bez opisu (data.fields puste) — warsztat pusty")


# ================================================================== CENA_PANEL: zgodnosc ceny zapieczonej w HTML z wf2_products.price (kalkulacja Etapu 1)
def _parse_price_pl(raw):
    """'149,90 zł' / '149.90' / '1 299,00 zł' / '1\\u00a0299,00' -> float 149.90 / 1299.00.
       None gdy brak liczby. Przecinek = dziesietny (PL), spacja/NBSP = separator tysiecy."""
    if raw is None:
        return None
    s = re.sub(r"[^\d,.\-]", "", str(raw))  # zdejmij 'zl', spacje, NBSP, litery
    if not s or s in ("-", ".", ","):
        return None
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".")   # 1.299,00 -> 1299.00
    elif "," in s:
        s = s.replace(",", ".")                     # 149,90 -> 149.90
    if s.count(".") > 1:                            # 1.299.00 -> 1299.00 (kropki = tysiace)
        head, _, tail = s.rpartition(".")
        s = head.replace(".", "") + "." + tail
    try:
        return round(float(s), 2)
    except Exception:
        return None

def check_cena_panel(res, M, ctx):
    """CENA_PANEL — zgodnosc cen zapieczonych w HTML landingu (atrybuty data-price/data-price-raw)
       z wf2_products.price (po kolumnie slug). Rozjazd landing<->panel po zmianie kalkulacji = FAIL.
       - KAZDA zapieczona cena != panel (tol) = FAIL (lista rozjazdow).
       - produkt panelu istnieje ale price NULL/0 = FAIL (kalkulacja niewykonana — cena nieustalona).
       - brak elementow data-price w HTML = WARN (nie ma czego porownac).
       - brak wiersza wf2_products dla sluga = SKIP (landing bez projektu panelu, jak panel_sync).
       Host CRM WYMUSZONY (panel_sync.host w _pg_crm) — NIE env SUPABASE_URL."""
    m = M.get("cena_panel")
    if not m:
        res.add("cena_panel", "(config)", "SKIP", "brak cena_panel w manifescie")
        return
    sev = m["severity"]
    html = ctx.get("html")
    if not html:
        res.add("cena_panel", "(brak html)", "SKIP", "brak kodu HTML")
        return
    markup = strip_scripts(html)  # atrybuty bez selektorow CSS/JS ze skryptow
    # --- ceny zapieczone w HTML (data-price / data-price-raw) ---
    prices = []
    for attr in m.get("attr", ["data-price", "data-price-raw"]):
        rx = re.compile(re.escape(attr) + r'(?![-\w])\s*=\s*"([^"]*)"', re.I)
        for raw in rx.findall(markup):
            v = _parse_price_pl(raw)
            if v is not None:
                prices.append((attr, raw.strip(), v))
        # FIX 22.07: kontrakt runtime-snippet = atrybut GOLY, cena zapieczona w TRESCI elementu
        # (<span data-price>189,00 zl</span>, runtime nadpisuje textContent) — czytaj tez tresc.
        rx2 = re.compile(r"<[a-z0-9]+\b[^>]*\b" + re.escape(attr) +
                         r"(?![-\w])(?!\s*=)[^>]*>\s*([^<]{1,40})", re.I)
        for raw in rx2.findall(markup):
            v = _parse_price_pl(raw)
            if v is not None:
                prices.append((attr, raw.strip(), v))
    if not prices:
        res.add("cena_panel", "ceny zapieczone (data-price)", m.get("brak_html_severity", "WARN"),
                "brak elementow [data-price]/[data-price-raw] w HTML — nie ma czego porownac z panelem")
        return
    # --- price z panelu po slug (host CRM wymuszony w _pg_crm) ---
    env = ctx.get("env") or {}
    if ctx.get("no_net") or not env.get(M["supabase"]["key_env"]):
        res.add("cena_panel", "(panel wf2_products)", "SKIP", "brak SUPABASE_SERVICE_KEY / --no-net")
        return
    kol_cena = m.get("kolumna_ceny", "price"); kol_slug = m.get("slug_kolumna", "slug")
    rows = _pg_crm(M, env, m.get("tabela", "wf2_products"),
                   {kol_slug: "eq." + ctx["slug"], "select": "%s,%s" % (kol_cena, kol_slug)},
                   ctx["timeout"])
    if rows is None:
        res.add("cena_panel", "(panel wf2_products)", "SKIP", "brak dostepu do bazy CRM")
        return
    if not rows:
        res.add("cena_panel", "produkt panelu (slug=%s)" % ctx["slug"], "SKIP",
                "brak wiersza wf2_products slug=%s — landing bez projektu panelu" % ctx["slug"])
        return
    db_price = rows[0].get(kol_cena)
    try:
        dbv = round(float(db_price), 2) if db_price not in (None, "") else None
    except Exception:
        dbv = None
    if dbv is None or dbv == 0:
        res.add("cena_panel", "cena ustalona w panelu", status_for(False, sev),
                "kalkulacja niewykonana — cena nieustalona w panelu (wf2_products.price=%s)" % db_price)
        return
    tol = float(m.get("tolerancja", 0.01))
    rozjazdy = [("%s=%.2f (\"%s\")" % (a, v, raw)) for (a, raw, v) in prices if abs(v - dbv) > tol]
    if rozjazdy:
        res.add("cena_panel", "HTML data-price == panel", status_for(False, sev),
                "%d rozjazd(ow) vs panel %.2f zl: %s" % (len(rozjazdy), dbv, "; ".join(rozjazdy[:8])))
    else:
        uniq = sorted(set(v for (_a, _r, v) in prices))
        res.add("cena_panel", "HTML data-price == panel", "PASS",
                "%d cen(y) w HTML == panel %.2f zl (ceny: %s)" % (len(prices), dbv, uniq[:6]))


# ================================================================== KAPITALIZACJA: egzekucja flywheel reuse (depozyt + preflight retrievalu)
# Powod (dyrektywa Tomka 21.07): system kapitalizacji byl OPISANY w runbooku (KAPITALIZACJA-OPS),
# ale reuse nie byl WYMUSZONY zadna bramka — flywheel dzialal na honor-system. Te dwa checki czynia
# depozyt wzorca CZESCIA definicji DONE (jak panel_sync/wiernosc). Wzorzec: check_sekcje_plan/check_cta
# (data-driven z manifestu). Doktryna: KAPITALIZACJA-OPS §1 (retrieval) + §4 (depozyt) + EXEMPLARY-INDEX.
def _resolve_repo_path(path):
    """Sciezka z manifestu -> absolutna. Absolutna zwracana bez zmian (tak testy podmieniaja
       fixture). Wzgledna liczona od SCRIPT_DIR (scripts/mockup-tools; '../../' = korzen tn-crm)."""
    if not path:
        return None
    if os.path.isabs(path):
        return path
    return os.path.normpath(os.path.join(SCRIPT_DIR, path.replace("/", os.sep)))

def _lekcje_zrodlo_cells(md, header_key):
    """Komorki kolumny 'Źródło' tabeli LEKCJE-LANDINGI (kolumna z naglowkiem zawierajacym header_key).
       [] gdy tabela/kolumna nieodnaleziona -> wolajacy robi fallback na cala tresc."""
    rows = []
    for ln in (md or "").splitlines():
        s = ln.strip()
        if s.startswith("|") and s.endswith("|"):
            rows.append([c.strip() for c in s.strip("|").split("|")])
    hi = ci = -1
    for i, r in enumerate(rows):
        for j, c in enumerate(r):
            if norm(header_key) in norm(c):
                hi, ci = i, j
                break
        if hi >= 0:
            break
    if hi < 0 or ci < 0:
        return None
    cells = []
    for r in rows[hi + 1:]:
        if all(re.fullmatch(r"[-:\s]*", c) for c in r):
            continue
        if ci < len(r):
            cells.append(r[ci])
    return cells

def _slug_root_block(md, slug, window):
    """True gdy jakikolwiek ':root{' w rejestrze jest poprzedzony wzmianka sluga w oknie `window`
       znakow (naglowek/etykieta bloku palety). Brak = depozyt palety sluga nie zrobiony."""
    ns = norm(slug)
    if not ns:
        return False
    for mm in re.finditer(r":root\s*\{", md or ""):
        pre = md[max(0, mm.start() - int(window)):mm.start()]
        if ns in norm(pre):
            return True
    return False

def check_kapitalizacja_deposit(res, M, ctx):
    """SILNIK flywheel (KAPITALIZACJA-OPS §4). Po DONE landing MUSI zdeponowac wzorzec:
       - FAIL: brak wiersza sluga w EXEMPLARY-INDEX (grandfatering BEZ mtime: 12 istniejacych SA
         w indexie -> PASS; FAIL tylko dla nowego 13.+ sluga bez depozytu).
       - WARN: brak wzmianki sluga w kolumnie 'Źródło' LEKCJE-LANDINGI (nie kazdy landing rodzi lekcje).
       - WARN: brak bloku :root sluga w TOKEN-KONTRAKT (paleta dla cross_landing ΔE).
       Brak pliku (index/lekcje/tokeny) = SKIP (config, nie karzemy landinga)."""
    m = M.get("kapitalizacja_deposit")
    if not m:
        res.add("kapitalizacja", "(config)", "SKIP", "brak kapitalizacja_deposit w manifescie")
        return
    sev = m["severity"]
    slug = ctx["slug"]
    # --- FAIL: wiersz sluga w EXEMPLARY-INDEX (depozyt wzorca — SILNIK wzrostu) ---
    idx_path = _resolve_repo_path(m.get("index_plik"))
    idx = read_text(idx_path) if idx_path else None
    if idx is None:
        res.add("kapitalizacja", "EXEMPLARY-INDEX (depozyt wzorca)", "SKIP",
                "brak pliku indexu: %s" % idx_path)
    else:
        pat = m.get("index_slug_regex", r"/{slug}/|\[{slug}\]").replace("{slug}", re.escape(slug))
        has_row = bool(re.search(pat, idx))
        res.add("kapitalizacja", "EXEMPLARY-INDEX ma wiersz sluga", status_for(has_row, sev),
                "wiersz obecny (depozyt wzorca OK)" if has_row
                else m.get("index_brak_msg", "brak depozytu wzorca — dopisz wiersz do EXEMPLARY-INDEX"))
    # --- WARN: lekcja sluga w kolumnie 'Źródło' LEKCJE-LANDINGI ---
    lek_path = _resolve_repo_path(m.get("lekcje_plik"))
    lek = read_text(lek_path) if lek_path else None
    lsev = m.get("lekcje_severity", "WARN")
    if lek is None:
        res.add("kapitalizacja", "LEKCJE-LANDINGI (lekcja sluga)", "SKIP", "brak pliku lekcji")
    else:
        cells = _lekcje_zrodlo_cells(lek, m.get("lekcje_kolumna_naglowek", "źródło"))
        if cells is None:  # kolumna nieodnaleziona -> fallback na cala tresc (bezpieczniej WARN nie FAIL)
            has_lesson = norm(slug) in norm(lek)
        else:
            has_lesson = any(norm(slug) in norm(c) for c in cells)
        res.add("kapitalizacja", "LEKCJE-LANDINGI (lekcja sluga)",
                "PASS" if has_lesson else status_for(False, lsev),
                "slug wzmiankowany w kolumnie Źródło" if has_lesson
                else m.get("lekcje_brak_msg", "rozważ depozyt lekcji"))
    # --- WARN: blok :root sluga w TOKEN-KONTRAKT (paleta policzalna dla cross_landing) ---
    tok_path = _resolve_repo_path(m.get("tokens_plik"))
    tok = read_text(tok_path) if tok_path else None
    tsev = m.get("tokens_severity", "WARN")
    if tok is None:
        res.add("kapitalizacja", "TOKEN-KONTRAKT (:root sluga)", "SKIP", "brak pliku rejestru tokenow")
    else:
        has_root = _slug_root_block(tok, slug, m.get("tokens_root_window", 240))
        res.add("kapitalizacja", "TOKEN-KONTRAKT (:root sluga)",
                "PASS" if has_root else status_for(False, tsev),
                "blok :root sluga obecny" if has_root
                else m.get("tokens_brak_msg", "brak bloku :root sluga w TOKEN-KONTRAKT"))

def check_reuse_preflight(res, M, ctx):
    """F1 PREFLIGHT RETRIEVALU (KAPITALIZACJA-OPS §1) — miekki nudge. Gdy PLAN.md istnieje ale NIE
       deklaruje markera '## WZORCE' (lista wzorcow dobranych z EXEMPLARY-INDEX) => WARN. Brak PLAN.md
       = SKIP. WARN, NIE FAIL — istniejace PLAN-y markera nie maja, FAIL zlamalby baseline."""
    m = M.get("reuse_preflight")
    if not m:
        res.add("reuse_preflight", "(config)", "SKIP", "brak reuse_preflight w manifescie")
        return
    arch = ctx.get("archiwum")
    if not arch:
        res.add("reuse_preflight", "(PLAN.md)", "SKIP", "brak archiwum")
        return
    plan = read_text(os.path.join(arch, m.get("plan_plik", "PLAN.md").replace("/", os.sep)))
    if plan is None:
        res.add("reuse_preflight", "(PLAN.md)", "SKIP", "brak PLAN.md (landing sprzed reguly)")
        return
    marker = m.get("wzorce_marker", "## WZORCE")
    ok = marker in plan
    res.add("reuse_preflight", "PLAN deklaruje wzorce (%s)" % marker, status_for(ok, m.get("severity", "WARN")),
            "marker obecny" if ok else m.get("brak_msg", "PLAN nie deklaruje wzorcow z EXEMPLARY-INDEX"))

# ================================================================== F7 COPY-GATE (task#2): kotwiczenie liczb w KARCIE + jedna cena
def _num_tokens(text):
    """Zbior znormalizowanych liczb z tekstu (przecinek->kropka; wariant bez zbednych zer)."""
    out = set()
    for mm in re.finditer(r"\d+(?:[.,]\d+)?", text or ""):
        v = mm.group(0).replace(",", ".")
        out.add(v)
        if "." in v:
            v2 = v.rstrip("0").rstrip(".")
            if v2:
                out.add(v2)
    return out

def check_copy(res, M, ctx):
    """(a) Kazda liczba-z-jednostka (spec) w prozie MUSI miec kotwice w KARCIE (tag [KONKRET-SKU]/
       [SPEC]/[KONKRET]); liczba spoza karty = FAIL 'liczba bez kotwicy'. (b) >1 distinct data-price =
       FAIL (jedna cena PL). Zakazy tekstowe (scarcity/own-stock/przekreslenia) w grep_forbidden (SSOT)."""
    m = M.get("copy")
    if not m:
        res.add("copy", "(config)", "SKIP", "brak copy w manifescie")
        return
    sev = m["severity"]; html = ctx["html"]; vis = visible_text(html)
    markup = strip_scripts(html)  # atrybuty bez selektorow CSS/JS ze skryptow (np. [data-price] w bakedPrice)
    # --- (b) jedna cena PL: distinct data-price ---
    dp = m.get("data_price", {})
    price_tokens = []
    for rx in (dp.get("attr_regex"), dp.get("text_regex")):
        if rx:
            price_tokens += re.findall(rx, markup, re.I)
    prices = set()
    for tok in price_tokens:
        nm = re.search(r"\d+(?:[.,]\d+)?", tok or "")
        if nm:
            try:
                prices.add(round(float(nm.group(0).replace(",", ".")), 2))
            except Exception:
                pass
    maxd = dp.get("max_distinct", 1)
    if not prices:
        res.add("copy", "data-price (jedna cena PL)", "PASS", "brak jawnej ceny data-price")
    else:
        okp = len(prices) <= maxd
        res.add("copy", "data-price (jedna cena PL)", status_for(okp, dp.get("severity", sev)),
                ("cena: %s" % sorted(prices)) if okp
                else ("%d roznych cen data-price: %s" % (len(prices), sorted(prices))))
    # --- (a) kotwiczenie liczb-specow ---
    a = m.get("anchor", {})
    karta = ctx["karta"]
    if not karta:
        res.add("copy", "kotwice liczb (KARTA-PRAWDY)", "SKIP", "brak KARTA-PRAWDY.md")
        return
    units = sorted(a.get("jednostki_spec", []), key=len, reverse=True)
    if not units:
        res.add("copy", "kotwice liczb (KARTA-PRAWDY)", "SKIP", "brak jednostek w manifescie")
        return
    unit_alt = "|".join(re.escape(u) for u in units)
    rx = re.compile(r"(\d+(?:[.,]\d+)?)\s?(%s)(?![\w])" % unit_alt)
    ignor = set(str(x).replace(",", ".") for x in a.get("ignoruj_liczby", []))
    tags = a.get("karta_tagi", [])
    # tag na linii = '[KONKRET-SKU' / '[SPEC' itd. — tolerancyjnie na ': detal' lub ']' po slowie
    tag_toks = [t.strip("[]") for t in tags]
    tag_rx = re.compile(r"\[(?:" + "|".join(re.escape(t) for t in tag_toks) + r")\b", re.I) if tag_toks else None
    karta_lines = karta.splitlines()
    has_tags = bool(tag_rx) and any(tag_rx.search(ln) for ln in karta_lines)
    anchor_nums = set()
    for ln in karta_lines:
        if (not tag_rx) or tag_rx.search(ln):
            anchor_nums |= _num_tokens(ln)
    all_nums = _num_tokens(karta)
    seen = set(); no_anchor = []; soft = []; checked = 0
    for mnum, unit in rx.findall(vis):
        val = mnum.replace(",", ".")
        if (val, unit) in seen:
            continue
        seen.add((val, unit))
        vv = {val}
        if "." in val:  # strip zer TYLKO po kropce (2.50->2.5), NIE z liczb calkowitych (5000!=5)
            vv.add(val.rstrip("0").rstrip("."))
        if vv & ignor:
            continue
        checked += 1
        if vv & anchor_nums:
            continue
        if has_tags and (vv & all_nums):
            soft.append("%s %s" % (mnum, unit))
        else:
            no_anchor.append("%s %s" % (mnum, unit))
    if no_anchor:
        res.add("copy", "liczby-z-jednostkami zakotwiczone", status_for(False, sev),
                "%d BEZ KOTWICY w karcie: %s" % (len(no_anchor), ", ".join(no_anchor[:8])))
    elif soft:
        res.add("copy", "liczby-z-jednostkami zakotwiczone", "WARN",
                "%d w karcie ale poza tagiem %s: %s" % (len(soft), tags, ", ".join(soft[:8])))
    else:
        res.add("copy", "liczby-z-jednostkami zakotwiczone", "PASS",
                "%d liczb-specow zakotwiczonych%s" % (checked, "" if has_tags else " (karta bez tagow)"))
    if not has_tags and checked:
        res.add("copy", "tagi kotwic [KONKRET-SKU]/[SPEC]", "WARN",
                "karta bez tagow — kotwiczenie po calej karcie (slabsze); dodaj tagi wg F7")

# USUNIETE 20.07 (dyrektywa Tomka): check_f1_marza — ekonomia polki + landed COD.
# Fabryka landingow NIE ocenia oplacalnosci produktu: gdy produkt trafia do budowy, decyzja
# zakupowa juz zapadla (Etap 1 / radar). Marza, polka cenowa i werdykty GO/NO-GO nie naleza
# do gate'a strony. Patrz STANDARD-LANDING-SKLEPY.md sekcja "F-1 — INWENTARZ MATERIALU".

# ================================================================== GO-LIVE (task#3): --published <url>
def _fetch_published(url, timeout):
    """(status, text). http(s) przez requests; file://path / lokalna sciezka przez read_text
       (do testu go-live bez realnego URL). status: 200 / int / 'ERR:...'."""
    if url.startswith(("http://", "https://")):
        import requests
        try:
            r = requests.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"})
            return (r.status_code, r.text)
        except Exception as e:
            return ("ERR:%s" % type(e).__name__, None)
    path = re.sub(r"^file://+", "", url)
    path = re.sub(r"^/([A-Za-z]:)", r"\1", path)
    txt = read_text(path)
    return (200, txt) if txt is not None else ("ERR:NoFile", None)

def check_published(res, M, ctx):
    """Tryb go-live: pobierz LIVE html i FAIL gdy zostaly placeholdery ({{), noindex, nierozwiazane
       pixel/product-id/legal-URL. Preview (bez --published) NIE sprawdza (placeholdery oczekiwane)."""
    url = ctx.get("published_url")
    if not url:
        res.add("published", "(tryb go-live)", "SKIP",
                "preview — placeholdery oczekiwane (--published <url> na go-live)")
        return
    m = M.get("published", {})
    sev = m.get("severity", "FAIL")
    if ctx["no_net"] and url.startswith("http"):
        res.add("published", "(tryb go-live)", "SKIP", "--no-net z URL http")
        return
    code, text = _fetch_published(url, ctx["timeout"])
    transient = set(m.get("http_transient_codes", [408, 425, 429, 500, 502, 503, 504]))
    if text is None or (isinstance(code, str) and code.startswith("ERR:")):
        res.add("published", "pobranie LIVE", "WARN", "nie pobrano (%s) — blip? powtorz" % code)
        return
    if isinstance(code, int) and code != 200:
        if code in transient:
            res.add("published", "pobranie LIVE", "WARN", "HTTP %s (transient) na %s" % (code, url))
        else:
            res.add("published", "pobranie LIVE", status_for(False, sev), "HTTP %s na %s" % (code, url))
            return
    else:
        res.add("published", "pobranie LIVE", "PASS", "HTTP 200 (%d B)" % len(text))
    for rule in m.get("fail_regex", []):
        hits = re.findall(rule["regex"], text, re.I)
        ok = not hits
        res.add("published", rule["label"], status_for(ok, sev),
                "" if ok else "%d trafien: %s" % (len(hits), str(list(dict.fromkeys(hits))[:4])))

# ================================================================== F7.3 FINALNY PASS (task#1): detail-lint.py
def check_finalny_pass(res, M, ctx):
    """Odpal detail-lint.py (PASS 0 design-linter: WCAG/touch>=44/crop/martwa-interakcja/pay-badges-
       imitacje/dup-asset/typografia) i sparsuj findings. P0/P1 -> FAIL, P2 -> WARN (progi w manifescie).
       Placeholdery/zakazy tekstowe odfiltrowane (nalezą do published/grep_forbidden — SSOT)."""
    m = M.get("finalny_pass")
    if not m:
        res.add("finalny_pass", "(config)", "SKIP", "brak finalny_pass w manifescie")
        return
    if ctx["no_net"]:
        res.add("finalny_pass", "(detail-lint)", "SKIP", "--no-net (Chrome + fetch obrazow)")
        return
    script = os.path.join(SCRIPT_DIR, m.get("skrypt", "detail-lint.py"))
    if not os.path.isfile(script):
        res.add("finalny_pass", "(detail-lint)", "SKIP", "brak %s" % m.get("skrypt"))
        return
    venv_py = os.path.join(SCRIPT_DIR, ".venv", "Scripts", "python.exe")
    py = venv_py if os.path.isfile(venv_py) else sys.executable
    outp = os.path.join(tempfile.gettempdir(), "detail-lint-%s.json" % re.sub(r"[^\w.-]", "_", ctx["slug"]))
    try:
        if os.path.exists(outp):
            os.remove(outp)
    except Exception:
        pass
    cmd = [py, script, ctx["code"], "--out", outp]
    try:
        p = subprocess.run(cmd, capture_output=True, text=True,
                           timeout=m.get("timeout_s", 300), cwd=SCRIPT_DIR)
    except subprocess.TimeoutExpired:
        res.add("finalny_pass", "(detail-lint)", "WARN",
                "timeout %ss — pass niedokonczony (odpal recznie)" % m.get("timeout_s", 300))
        return
    except Exception as e:
        res.add("finalny_pass", "(detail-lint)", "SKIP", "nie uruchomiono: %s" % e)
        return
    data = None
    txt = read_text(outp)
    if txt:
        try:
            data = json.loads(txt)
        except Exception:
            data = None
    if data is None:
        tail = ""
        blob = (p.stderr or p.stdout or "").strip().splitlines()
        if blob:
            tail = blob[-1][:80]
        res.add("finalny_pass", "(detail-lint)", "SKIP", "brak findings JSON (rc=%s) %s" % (p.returncode, tail))
        return
    findings = data.get("findings", [])
    sev_map = m.get("severity_map", {"P0": "FAIL", "P1": "FAIL", "P2": "WARN"})
    ign = [x.lower() for x in m.get("ignoruj_problem_wzorce", [])]
    def ignored(f):
        pl = (f.get("problem", "") + " " + f.get("lokalizacja", "")).lower()
        return any(x in pl for x in ign)
    kept = [f for f in findings if not ignored(f)]
    buckets = {"P0": [], "P1": [], "P2": []}
    for f in kept:
        buckets.setdefault(f.get("severity", "P2"), buckets["P2"]).append(f)
    cap = m.get("max_detail", 12)
    for lvl in ("P0", "P1"):
        st = sev_map.get(lvl, "FAIL")
        for f in buckets[lvl][:cap]:
            res.add("finalny_pass", "[%s] %s/%s" % (lvl, f.get("warstwa", "?"), f.get("lokalizacja", "?")),
                    st, f.get("problem", "")[:80])
        if len(buckets[lvl]) > cap:
            res.add("finalny_pass", "[%s] (+%d wiecej)" % (lvl, len(buckets[lvl]) - cap),
                    sev_map.get(lvl, "FAIL"), "patrz %s" % outp)
    if buckets["P2"]:
        exa = "; ".join(f.get("problem", "")[:40] for f in buckets["P2"][:3])
        res.add("finalny_pass", "P2 detale (%d)" % len(buckets["P2"]), sev_map.get("P2", "WARN"), exa)
    if not any(buckets[l] for l in ("P0", "P1", "P2")):
        res.add("finalny_pass", "detail-lint (0 blokujacych)", "PASS",
                "%d findings odfiltrowanych" % len(findings) if findings else "0 findings")

# ================================================================== main
def latest_archiwum(glob_tmpl, slug):
    pat = glob_tmpl.replace("{slug}", slug)
    dirs = [d for d in glob.glob(pat) if os.path.isdir(d)]
    if not dirs:
        return None
    # wybierz po dacie modyfikacji (najnowsza FABRYKA-*)
    dirs.sort(key=lambda d: os.path.getmtime(d), reverse=True)
    return dirs[0]

def extract_product_key(karta):
    if not karta:
        return None
    m = re.search(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', karta, re.I)
    return m.group(0) if m else None

CHECK_ORDER = [
    ("files", check_files),
    ("dopasowanie", check_dopasowanie),
    ("sekcje_plan", check_sekcje_plan),
    ("reuse_preflight", check_reuse_preflight),
    ("cta", check_cta),
    ("interakcje", check_interakcje),
    ("grep_forbidden", check_grep_forbidden),
    ("copy", check_copy),
    ("sieroty", check_sieroty),
    ("wagi", check_wagi),
    ("phash", check_phash),
    ("baza", check_baza),
    ("wideo_kafle", check_wideo_kafle),
    ("makiety_mobile", check_makiety_mobile),
    ("og_image", check_og_image),
    ("ledger_fazy", check_ledger_fazy),
    ("werdykt_rubryka", check_werdykt_rubryka),
    ("layout_diff", check_layout_diff),
    ("wiernosc", check_wiernosc),
    ("cross_landing", check_cross_landing),
    ("panel_sync", check_panel_sync),
    ("kapitalizacja_deposit", check_kapitalizacja_deposit),
    ("cena_panel", check_cena_panel),
    ("published", check_published),
    ("finalny_pass", check_finalny_pass),
]

def main():
    ap = argparse.ArgumentParser(description="Zbiorczy gate kompletnosci landingu")
    ap.add_argument("slug")
    ap.add_argument("--archiwum")
    ap.add_argument("--code")
    ap.add_argument("--manifest", default=os.path.join(SCRIPT_DIR, "gate-manifest.json"))
    ap.add_argument("--product-key")
    ap.add_argument("--no-net", action="store_true", help="pomin siec i baze")
    ap.add_argument("--cross-only", action="store_true",
                    help="tylko check cross_landing (partytura vs poprzednie landingi) — F1/F2.5")
    ap.add_argument("--published", help="tryb go-live: URL/sciezka LIVE — FAIL gdy zostaly {{}}/noindex/nierozwiazane id")
    args = ap.parse_args()

    M = json.loads(read_text(args.manifest))
    slug = args.slug

    arch = args.archiwum or latest_archiwum(M["sciezki"]["archiwum_glob"], slug)
    code = args.code or M["sciezki"]["kod"].replace("{slug}", slug)

    print("=" * 74)
    print("GATE-CHECK  ·  slug=%s" % slug)
    print("  archiwum: %s" % (arch or "(NIE ZNALEZIONO)"))
    print("  kod     : %s" % code)
    print("=" * 74)

    if not arch or not os.path.isdir(arch):
        if not args.cross_only:
            print("BLAD: brak katalogu archiwum dla slug=%s" % slug)
            return 1
        arch = ""  # --cross-only: archiwum potrzebne tylko na archetyp (-> SKIP)
    html = read_text(code)
    if html is None:
        # --cross-only ma dzialac PRZED budowa kodu (manifest: 'sprawdzenie partytury PRZED
        # budowa'). Gdy nie ma jeszcze index.html, czytamy REALNE tokeny z bloku :root{}
        # w TOKENS-MAKIETY.md archiwum (font display + akcent = te same, ktore trafia do kodu).
        if args.cross_only and arch:
            tok_md = read_text(os.path.join(arch, "TOKENS-MAKIETY.md"))
            # pierwszy blok :root{...} ZAWIERAJACY custom-property (pomija puste ':root{}'
            # z naglowka/prozy przed blokiem CSS)
            block = next((mm.group(0) for mm in re.finditer(r":root\s*\{[^{}]*\}", tok_md or "", re.S)
                          if "--" in mm.group(0)), None)
            if block:
                html = "<style>%s</style>" % block
                print("  (kod jeszcze nie istnieje — tokeny czytane z TOKENS-MAKIETY.md :root)")
        if html is None:
            print("BLAD: brak pliku kodu %s%s" % (code,
                  " oraz brak bloku :root w TOKENS-MAKIETY.md" if args.cross_only else ""))
            return 1

    env = load_env(M["sciezki"]["env"].replace("{slug}", slug))
    karta = read_text(os.path.join(arch, "KARTA-PRAWDY.md"))
    ledger = read_text(os.path.join(arch, "LEDGER.md"))
    product_key = args.product_key or extract_product_key(karta)
    dop_md = read_text(os.path.join(arch, M.get("dopasowanie", {}).get("md", "dopasowanie/DOPASOWANIE.md").replace("/", os.sep)))

    ctx = {
        "slug": slug, "archiwum": arch, "code": code, "html": html,
        "env": env, "karta": karta, "ledger": ledger,
        "sections": parse_sections(html),
        "urls": image_urls(html),
        "timeout": M.get("http_timeout_s", 10),
        "no_net": args.no_net,
        "product_key": product_key,
        "dopasowanie_md": dop_md,
        "published_url": args.published,
    }
    print("  sekcje(id): %d  ·  URL-e bud-assets: %d  ·  product-key: %s%s"
          % (len(ctx["sections"]), len(ctx["urls"]), product_key or "-",
             ("  ·  PUBLISHED: %s" % args.published) if args.published else ""))
    print("-" * 74)

    res = Results()
    order = [(n, f) for n, f in CHECK_ORDER if n == "cross_landing"] if args.cross_only else CHECK_ORDER
    for name, fn in order:
        try:
            fn(res, M, ctx)
        except Exception as e:
            res.add(name, "(blad checka)", "FAIL", "exception: %s" % e)

    # ---- tabela
    ICON = {"PASS": "PASS", "FAIL": "FAIL", "WARN": "WARN", "SKIP": "SKIP"}
    cur = None
    for cat, nm, st, det in res.rows:
        if cat != cur:
            cur = cat
            print("\n[%s]" % cat.upper())
        line = "  %-4s  %-46s %s" % (ICON[st], nm[:46], det)
        print(line)

    c = res.counts()
    print("\n" + "=" * 74)
    print("PODSUMOWANIE:  PASS=%d  FAIL=%d  WARN=%d  SKIP=%d"
          % (c["PASS"], c["FAIL"], c["WARN"], c["SKIP"]))
    if c["FAIL"]:
        print("WYNIK: FAIL (exit 1) — %d blokujacych:" % c["FAIL"])
        for cat, nm, st, det in res.fails():
            print("   - [%s] %s: %s" % (cat, nm, det))
    else:
        print("WYNIK: OK (exit 0) — brak FAIL (WARN/SKIP nie blokuja)")
    print("=" * 74)
    return 1 if c["FAIL"] else 0

if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
manifest-check.py — TWARDY gate "kompletnosc sekcji + hero-video" dla fabryki landingow wf2.

POWOD (realny incydent, feedback Tomka z eskalacja): sekcje dowodowe (wideo TikTok/UGC,
zdjecia od kupujacych) poszly na SKIP mimo dostepnego materialu. To narzedzie pilnuje, zeby
landing NIGDY nie wyszedl z brakujaca sekcja dowodowa ani bez hero-video.

CLI:
  python -X utf8 manifest-check.py --plan <PLAN.md> --url <https://live>
  python -X utf8 manifest-check.py --plan <PLAN.md> --file <index.html>
  python -X utf8 manifest-check.py --plan <PLAN.md> --url <live> --file <index.html>   (porownanie wersji)

CHECKI (kazdy = PASS / FAIL / WARN; exit 0 tylko gdy 0 FAIL):
  1. Parsowanie manifestu + status. SKIP dla klasy DOWODOWEJ = FAIL (dozwolone tylko blokada-tomek z nota).
  2. Kazda pozycja 'build' -> odpowiadajaca <section id> obecna w HTML (aliasy + fuzzy).
  3. Sekcja w HTML spoza manifestu -> WARN (manifest nieaktualny).
  4. Hero-video: slot + URL mp4/poster w hero -> HEAD 200. Brak wideo w hero = FAIL.
  5. Sekcje dowodowe: media (static + JS-inject) -> HEAD 200 kazde; pusta sekcja dowodowa = FAIL.
  6. Compliance-lite: gwiazdki/oceny/opinii/recenzji w sekcjach dowodowych = FAIL; JSON-LD Offer/AggregateRating = FAIL.

Sieci: tylko stdlib (urllib), timeout 30 s, HEAD z fallbackiem na GET Range 0-0.
Konsola cp1250 -> printy sa ASCII (dynamiczne fragmenty przepuszczam przez asc()).
"""

import argparse
import json
import re
import sys
import urllib.error
import urllib.request

TIMEOUT = 30
UA = "manifest-check/1.0 (wf2 factory gate)"

# ---- glyphy / wzorce compliance (jako \u aby zrodlo bylo czyste ASCII) ----
STAR_GLYPHS = "★☆⭐✩✪⭑\U0001f31f"  # star star-dim :star: itd.
EMDASH_SPLIT = re.compile(r"\s*[—–]\s*|\s+-{1,2}\s+")   # em/en dash lub spacjowany -/--
MEDIA_EXT = r"(?:mp4|webm|mov|webp|jpg|jpeg|png|avif|gif)"

# ---- liczniki i raport ----
COUNTS = {"PASS": 0, "FAIL": 0, "WARN": 0}


def asc(s):
    """Bezpieczny do druku na cp1250 — nie-ASCII -> '?'."""
    try:
        return str(s).encode("ascii", "replace").decode("ascii")
    except Exception:
        return "<?>"


def hdr(title):
    print("")
    print("=== " + asc(title) + " ===")


def rep(level, msg):
    if level in COUNTS:
        COUNTS[level] += 1
    print("  %-4s %s" % (level, asc(msg)))


def info(msg):
    print("       " + asc(msg))


# =====================================================================
#  SIEC
# =====================================================================
def http_ok(url):
    """Zwraca (ok_bool, code_or_None, metoda). OK = 200 lub 206."""
    # 1) HEAD
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            code = getattr(r, "status", r.getcode())
            return (code in (200, 206), code, "HEAD")
    except urllib.error.HTTPError as e:
        head_code = e.code
    except Exception:
        head_code = None
    # 2) fallback GET Range 0-0 (Supabase Storage czasem nie lubi HEAD)
    try:
        req = urllib.request.Request(
            url, method="GET", headers={"User-Agent": UA, "Range": "bytes=0-0"}
        )
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            code = getattr(r, "status", r.getcode())
            return (code in (200, 206), code, "GET-range")
    except urllib.error.HTTPError as e:
        return (e.code in (200, 206), e.code, "GET-range")
    except Exception as e:
        return (False, None, "ERR:" + asc(str(e))[:50] + (" (HEAD:%s)" % head_code if head_code else ""))


def fetch_html(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read().decode("utf-8", "replace")


# =====================================================================
#  PARSER MANIFESTU (tolerancyjny na oba realne formaty)
# =====================================================================
class Item:
    __slots__ = ("num", "id", "typ", "status", "reason", "raw")

    def __init__(self, num, sid, typ, status, reason, raw):
        self.num = num
        self.id = sid
        self.typ = typ
        self.status = status
        self.reason = reason
        self.raw = raw


def parse_manifest(md_text):
    """Zwraca (items, err). Obsluguje:
    A) `id | typ | status`  -- powod     (backtick tylko na id|typ|status; brzuszek)
    B) `id | typ | status -- powod`      (backtick na calej linii; rozgrzewek)
    C)  id | typ | status  -- powod      (bez backtickow; kanoniczny STANDARD F1a)
    """
    lines = md_text.splitlines()
    # znajdz blok naglowka '## MANIFEST SEKCJI'
    start = None
    for i, ln in enumerate(lines):
        if re.match(r"^\s*#{1,6}\s*MANIFEST\s+SEKCJI", ln, re.I):
            start = i + 1
            break
    if start is None:
        return [], "brak naglowka '## MANIFEST SEKCJI' w PLAN.md"

    items = []
    for ln in lines[start:]:
        if re.match(r"^\s*#{1,6}\s+\S", ln):  # kolejny naglowek -> koniec bloku
            break
        m = re.match(r"^\s*(\d+[a-z]?)[.)]\s+(.*\S)\s*$", ln)
        if not m:
            continue
        num, rest = m.group(1), m.group(2).strip()

        # wyciagnij czesc "id | typ | status" oraz ewentualny powod po backticku
        reason_after = ""
        bt = re.search(r"`([^`]+)`", rest)
        if bt:
            inner = bt.group(1).strip()
            tail = rest[bt.end():].strip()
            reason_after = re.sub(r"^[\s—–:\-]+", "", tail).strip()
        else:
            inner = rest

        parts = [p.strip() for p in inner.split("|")]
        if len(parts) < 2:
            continue  # to nie jest wiersz manifestu (proza/nota)

        # znajdz pole STATUSU po slowie kluczowym (build/skip/blokada*). typ jest OPCJONALNY:
        # realne dane maja warianty "id | typ | status" ORAZ "id | status" (FABRYKA-taca 10b).
        def _status_word(field):
            w = re.match(r"([A-Za-z][A-Za-z\-]*)", field)
            if not w:
                return None
            sw = w.group(1).lower()
            if sw in ("build", "skip") or sw.startswith("blokada"):
                return sw
            return None

        status_idx = None
        for j in range(1, len(parts)):
            if _status_word(parts[j]):
                status_idx = j
                break
        if status_idx is None:
            continue  # brak pola statusu -> proza, nie wiersz manifestu

        sid = re.sub(r"[`*]", "", parts[0]).strip()
        typ = " | ".join(parts[1:status_idx]).strip().lower() if status_idx > 1 else "(brak)"
        statusseg = " | ".join(parts[status_idx:]).strip()  # zachowuje ew. '|' w powodzie
        status = _status_word(statusseg) or statusseg.split()[0].lower()

        # powod: preferuj to co po backticku (format A); inaczej to co po em-dash w polu statusu (format B/C)
        reason = reason_after
        if not reason:
            seg = EMDASH_SPLIT.split(statusseg, maxsplit=1)
            if len(seg) > 1:
                reason = seg[1].strip()

        items.append(Item(num, sid, typ, status, reason, ln.strip()))
    if not items:
        return [], "naglowek jest, ale nie sparsowano zadnej pozycji (format?)"
    return items, None


# =====================================================================
#  KLASYFIKACJA DOWODOWA (STANDARD F1a: wideo TikTok/UGC + zdjecia od kupujacych)
# =====================================================================
NOT_DOWODOWE = {
    "galeria-dowodowa", "galeria", "opinie", "opinia", "recenzje",
    "social-proof", "zaufanie", "gwarancja",
}


def is_dowodowe(sid):
    i = sid.lower()
    if i in NOT_DOWODOWE:
        return False
    if i == "tt":
        return True
    return bool(re.search(r"(wideo|video|zdjec|kupujac|\bugc\b|ugc|tiktok)", i))


# =====================================================================
#  HTML: sekcje, media, JSON-LD, JS-inject
# =====================================================================
def find_sections(html):
    """Lista (id, start_idx, end_idx) w kolejnosci wystapienia."""
    hits = [(m.group(1), m.start()) for m in
            re.finditer(r"<section\b[^>]*\bid\s*=\s*[\"']([^\"']+)[\"']", html, re.I)]
    out = []
    for idx, (sid, pos) in enumerate(hits):
        end = hits[idx + 1][1] if idx + 1 < len(hits) else len(html)
        out.append((sid, pos, end))
    return out


def strip_style_script(slice_html):
    s = re.sub(r"<style\b[^>]*>.*?</style>", " ", slice_html, flags=re.I | re.S)
    s = re.sub(r"<script\b[^>]*>.*?</script>", " ", s, flags=re.I | re.S)
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    return s


def static_media(slice_html):
    """URL-e media z <img/source/video src|data-src|data-poster> ORAZ z data-src/data-poster
    na dowolnym elemencie (karty wideo bywaja <div data-src=...>)."""
    urls = set()
    for m in re.finditer(
        r"<(?:img|source|video)\b[^>]*?\b(?:src|poster|data-src|data-poster)\s*=\s*[\"']([^\"']+)[\"']",
        slice_html, re.I):
        urls.add(m.group(1).strip())
    for m in re.finditer(r"\bdata-(?:src|poster)\s*=\s*[\"']([^\"']+)[\"']", slice_html, re.I):
        u = m.group(1).strip()
        if re.search(r"\." + MEDIA_EXT + r"(?:[?#]|$)", u, re.I):
            urls.add(u)
    # tylko realne media (http/absolutne albo z rozszerzeniem media)
    return {u for u in urls if u.startswith("http") or re.search(r"\." + MEDIA_EXT, u, re.I)}


def collect_vars(html):
    """Proste zmienne stringowe: var X="..." / var X='...' (dozwolony przeciwny cudzyslow w srodku)."""
    v = {}
    for m in re.finditer(r"\bvar\s+(\w+)\s*=\s*([\"'])((?:\\.|(?!\2).)*)\2\s*;", html):
        v[m.group(1)] = m.group(3)
    return v


def js_injected_media(html):
    """Rozwiazuje URL-e budowane w JS: BASE + 'literal(.ext...)' (+ SUFFIX_VAR)?
    Zwraca liste (url, context) — context = okno tekstu wokol dopasowania (do przypiecia sekcji)."""
    varmap = collect_vars(html)
    out = []
    pat = re.compile(r"(\w+)\s*\+\s*([\"'])((?:\\.|(?!\2).)*)\2(?:\s*\+\s*(\w+))?")
    for m in pat.finditer(html):
        base, content, suf = m.group(1), m.group(3), m.group(4)
        if base not in varmap:
            continue
        cand = varmap[base] + content
        if suf and suf in varmap:
            cand += varmap[suf]
        um = re.search(r"https?://[^\s\"'<>]+?\." + MEDIA_EXT + r"(?:\?[^\s\"'<>]*)?", cand, re.I)
        if not um:
            continue
        ctx = html[max(0, m.start() - 400):m.end() + 120]
        out.append((um.group(0), ctx))
    return out


def folder_of(url):
    u = url.split("?", 1)[0].split("#", 1)[0]
    return u.rsplit("/", 1)[0] if "/" in u else u


def jsonld_bad_types(html):
    """Zwraca zbior 'zlych' typow JSON-LD (offer/aggregaterating/review/rating)."""
    bad = set()
    BADSET = {"offer", "aggregaterating", "review", "rating"}
    for m in re.finditer(
        r"<script[^>]*type\s*=\s*[\"']application/ld\+json[\"'][^>]*>(.*?)</script>",
        html, re.I | re.S):
        block = m.group(1)
        types = []
        try:
            data = json.loads(block)

            def walk(o):
                if isinstance(o, dict):
                    t = o.get("@type")
                    if isinstance(t, str):
                        types.append(t)
                    elif isinstance(t, list):
                        types.extend([x for x in t if isinstance(x, str)])
                    for val in o.values():
                        walk(val)
                elif isinstance(o, list):
                    for x in o:
                        walk(x)

            walk(data)
        except Exception:
            types = re.findall(r"[\"']@type[\"']\s*:\s*[\"']([^\"']+)[\"']", block)
        for t in types:
            if t.lower() in BADSET:
                bad.add(t)
    return bad


# =====================================================================
#  HERO-VIDEO
# =====================================================================
def hero_slice(sections, html):
    for sid, a, b in sections:
        if sid.lower() == "hero":
            return html[a:b]
    return None


def pick_hero_assets(all_media):
    mp4 = None
    poster = None
    for u in all_media:
        base = u.split("?", 1)[0].lower()
        if re.search(r"hero.*\.(?:mp4|webm|mov)$", base) and not mp4:
            mp4 = u
        if (re.search(r"hero.*poster", base) or "hero-loop-poster" in base) and not poster:
            poster = u
    return mp4, poster


# =====================================================================
#  DOPASOWANIE ID MANIFEST -> SECTION ID
# =====================================================================
SYN = {
    "wideo": ["video", "tiktok"],
    "video": ["wideo"],
    "zamow": ["zamowienie", "checkout", "order"],
    "zdjecia-kupujacych": ["zdjecia", "zdjecia-od-kupujacych"],
    "zdjecia": ["zdjecia-kupujacych"],
    "mid-cta": ["midcta", "cta"],
    "final": ["koniec", "faq-final"],
}


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def match_section(mid, section_ids):
    n = norm(mid)
    for sid in section_ids:
        if norm(sid) == n:
            return sid, "exact"
    for syn in SYN.get(mid.lower(), []):
        for sid in section_ids:
            if norm(sid) == norm(syn):
                return sid, "alias"
    for sid in section_ids:
        s = norm(sid)
        if not s or not n:
            continue
        if n in s or s in n:
            return sid, "fuzzy(zawiera)"
        p = 0
        while p < len(n) and p < len(s) and n[p] == s[p]:
            p += 1
        if p >= 5:
            return sid, "fuzzy(prefix%d)" % p
    return None, None


# =====================================================================
#  GLOWNY PRZEBIEG
# =====================================================================
def run(plan_path, url, file_path, do_net):
    print("manifest-check.py — gate kompletnosci sekcji + hero-video (wf2)")
    print("plan : " + asc(plan_path))
    if url:
        print("url  : " + asc(url))
    if file_path:
        print("file : " + asc(file_path))
    print("net  : " + ("ON" if do_net else "OFF (parse-only)"))

    # --- wczytaj manifest ---
    try:
        with open(plan_path, "r", encoding="utf-8") as f:
            md = f.read()
    except Exception as e:
        rep("FAIL", "nie mozna wczytac PLAN.md: " + str(e))
        return finish()

    items, err = parse_manifest(md)

    hdr("CHECK 1 — parsowanie manifestu + status (SKIP dowodowej = ZAKAZ)")
    if err:
        rep("FAIL", "parsowanie manifestu: " + err)
        return finish()
    info("sparsowano pozycji: %d" % len(items))
    for it in items:
        tag = " [DOWODOWA]" if is_dowodowe(it.id) else ""
        info("  %-4s %-22s | %-8s | %s%s" % (it.num + ".", it.id, it.typ, it.status, tag))

    for it in items:
        dow = is_dowodowe(it.id)
        st = it.status
        if dow:
            if st == "skip":
                rep("FAIL", "DOWODOWA '%s' ma status SKIP — ZAKAZ (dozwolone tylko 'blokada-tomek' z nota). [%s]"
                    % (it.id, it.num))
            elif st.startswith("blokada"):
                if it.reason:
                    rep("WARN", "DOWODOWA '%s' = %s (dozwolone; wymaga werdyktu Tomka). Nota: obecna." % (it.id, st))
                else:
                    rep("FAIL", "DOWODOWA '%s' = %s BEZ noty/uzasadnienia — nota obowiazkowa." % (it.id, st))
            elif st == "build":
                rep("PASS", "DOWODOWA '%s' = build." % it.id)
            else:
                rep("WARN", "DOWODOWA '%s' ma nietypowy status '%s'." % (it.id, st))
        else:
            if st == "skip" and not it.reason:
                rep("WARN", "sekcja '%s' = SKIP bez powodu (STANDARD: powod obowiazkowy)." % it.id)

    core = ["hero", "zamow", "final", "mid-cta"]
    build_ids = [it.id for it in items if it.status == "build"]
    for c in core:
        hit = any(match_section(c, [bid])[0] for bid in build_ids)
        if not hit:
            rep("WARN", "brak rdzeniowej pozycji '%s' jako 'build' w manifescie (STANDARD F1a: rdzen = build)." % c)

    # --- HTML: pobierz live i/lub plik ---
    html_url = html_file = None
    if url and do_net:
        try:
            html_url = fetch_html(url)
            info("pobrano HTML z live: %d bajtow" % len(html_url))
        except Exception as e:
            rep("FAIL", "nie mozna pobrac HTML z --url: " + str(e))
    if file_path:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                html_file = f.read()
            info("wczytano HTML z pliku: %d bajtow" % len(html_file))
        except Exception as e:
            rep("FAIL", "nie mozna wczytac --file: " + str(e))

    # wybierz HTML wiodacy (live ma priorytet — to on jest publikowany)
    html = html_url if html_url is not None else html_file
    if html is None:
        rep("FAIL", "brak HTML do analizy (podaj --url z siecia ON lub --file).")
        return finish()

    sections = find_sections(html)
    section_ids = [s[0] for s in sections]
    info("sekcje w HTML (%d): %s" % (len(section_ids), asc(", ".join(section_ids))))

    # --- porownanie wersji live vs plik ---
    if html_url is not None and html_file is not None:
        hdr("CHECK 0 — zgodnosc wersji live vs plik repo")
        ids_live = set(find_sections(html_url)[i][0] for i in range(len(find_sections(html_url))))
        ids_file = set(s[0] for s in find_sections(html_file))
        only_live = ids_live - ids_file
        only_file = ids_file - ids_live
        if only_live or only_file:
            rep("FAIL", "ROZJAZD sekcji live vs plik: tylko_live=%s tylko_plik=%s"
                % (asc(sorted(only_live)), asc(sorted(only_file))))
        else:
            rep("PASS", "zestaw <section id> identyczny na live i w pliku repo.")

    # =============== CHECK 2 — build -> section obecna ===============
    hdr("CHECK 2 — pozycje 'build' maja <section id> w HTML")
    matched_section_ids = set()
    for it in items:
        if it.status != "build":
            continue
        sid, how = match_section(it.id, section_ids)
        if sid:
            matched_section_ids.add(sid)
            if how == "exact":
                rep("PASS", "'%s' -> <section id=%s> (%s)." % (it.id, sid, how))
            else:
                rep("PASS", "'%s' -> <section id=%s> (%s)." % (it.id, sid, how))
        else:
            rep("FAIL", "'%s' (build) NIE ma odpowiadajacej <section id> w HTML. Podpowiedz: sprawdz aliasy/id."
                % it.id)

    # =============== CHECK 3 — sekcje HTML spoza manifestu ===============
    hdr("CHECK 3 — sekcje w HTML nieobecne w manifescie")
    manifest_all = [it.id for it in items]
    orphan = 0
    for sid in section_ids:
        found = False
        for mid in manifest_all:
            ms, _ = match_section(mid, [sid])
            if ms:
                found = True
                break
        if not found:
            orphan += 1
            rep("WARN", "sekcja '<section id=%s>' nie ma pozycji w manifescie (manifest nieaktualny?)." % sid)
    if orphan == 0:
        rep("PASS", "kazda sekcja w HTML ma pozycje w manifescie.")

    # przygotuj media globalne (static ze wszystkich + JS-inject)
    all_static = set()
    for _, a, b in sections:
        all_static |= static_media(html[a:b])
    js_media = js_injected_media(html)
    all_media = set(all_static) | {u for (u, _) in js_media}

    # =============== CHECK 4 — hero-video ===============
    hdr("CHECK 4 — hero-video (slot + mp4/poster HEAD 200)")
    hslice = hero_slice(sections, html)
    if hslice is None:
        rep("FAIL", "brak sekcji <section id=hero> w HTML.")
    else:
        has_slot = bool(re.search(r"hr-video-inject|hero-loop", hslice, re.I) or re.search(r"<video\b", hslice, re.I))
        hero_mp4, hero_poster = pick_hero_assets(all_media)
        if not has_slot and not hero_mp4:
            rep("FAIL", "hero BEZ wideo: brak slotu (.hr-video-inject/hero-loop/<video>) i brak URL mp4.")
        else:
            if has_slot:
                rep("PASS", "hero: slot wideo obecny (.hr-video-inject / hero-loop / <video>).")
            else:
                rep("WARN", "hero: slot nie wykryty w markupie, ale URL mp4 rozwiazany z JS.")
            if hero_mp4:
                if do_net:
                    ok, code, meth = http_ok(hero_mp4)
                    (rep("PASS", "hero mp4 %d (%s): %s" % (code or 0, meth, hero_mp4)) if ok
                     else rep("FAIL", "hero mp4 NIEDOSTEPNE (%s/%s): %s" % (code, meth, hero_mp4)))
                else:
                    info("hero mp4 (bez sieci): " + hero_mp4)
            else:
                rep("FAIL", "hero: slot obecny, ale nie rozwiazano URL mp4 (sprawdz montaz JS).")
            if hero_poster:
                if do_net:
                    ok, code, meth = http_ok(hero_poster)
                    (rep("PASS", "hero poster %d (%s): %s" % (code or 0, meth, hero_poster)) if ok
                     else rep("FAIL", "hero poster NIEDOSTEPNY (%s/%s): %s" % (code, meth, hero_poster)))
                else:
                    info("hero poster (bez sieci): " + hero_poster)
            else:
                rep("WARN", "hero: nie znaleziono URL postera (webp/jpg).")

    # =============== CHECK 5 — media sekcji dowodowych ===============
    hdr("CHECK 5 — sekcje dowodowe: media obecne i HEAD 200")
    dow_build = [it for it in items if it.status == "build" and is_dowodowe(it.id)]
    if not dow_build:
        rep("WARN", "manifest nie ma zadnej dowodowej pozycji 'build' — sprawdz czy to zamierzone.")
    for it in dow_build:
        sid, _ = match_section(it.id, section_ids)
        if not sid:
            info("(sekcja '%s' brak w HTML — raportowane w CHECK 2)" % it.id)
            continue
        a = b = None
        for s, x, y in sections:
            if s == sid:
                a, b = x, y
                break
        sl = html[a:b]
        media = set(static_media(sl))
        # dopnij JS-inject: po zgodnosci folderu ze statycznym media LUB gdy id sekcji jest tuz przed URL w JS
        folders = {folder_of(u) for u in media}
        for u, ctx in js_media:
            if folder_of(u) in folders:
                media.add(u)
            else:
                tail = ctx[-300:]
                if re.search(r"[\"'#]%s[\"']|getElementById\(\s*[\"']%s[\"']" % (re.escape(sid), re.escape(sid)), tail):
                    media.add(u)
        if not media:
            rep("FAIL", "sekcja dowodowa '%s' (<section id=%s>) jest PUSTA — 0 mediow." % (it.id, sid))
            continue
        rep("PASS", "sekcja dowodowa '%s' (id=%s): znaleziono %d mediow." % (it.id, sid, len(media)))
        if do_net:
            for u in sorted(media):
                ok, code, meth = http_ok(u)
                (rep("PASS", "  media %d (%s): %s" % (code or 0, meth, u)) if ok
                 else rep("FAIL", "  media NIEDOSTEPNE (%s/%s): %s" % (code, meth, u)))
        else:
            for u in sorted(media):
                info("  media (bez sieci): " + u)

    # =============== CHECK 6 — compliance-lite ===============
    hdr("CHECK 6 — compliance-lite (social proof / rich-snippet)")
    # 6a: wzorce w sekcjach dowodowych (po usunieciu <style>/<script>/komentarzy)
    rating_frac = re.compile(r"(?<![\d/])[0-5](?:[.,]\d)?\s*/\s*5(?!\d)")
    star_re = re.compile("[" + STAR_GLYPHS + "]")
    word_re = re.compile(r"opini|recenzj", re.I)
    any6a = False
    for it in dow_build:
        sid, _ = match_section(it.id, section_ids)
        if not sid:
            continue
        for s, x, y in sections:
            if s == sid:
                txt = strip_style_script(html[x:y])
                hits = []
                if star_re.search(txt):
                    hits.append("gwiazdka(glyph)")
                if rating_frac.search(txt):
                    hits.append("ocena N/5")
                mw = word_re.search(txt)
                if mw:
                    hits.append("slowo '%s'" % mw.group(0))
                if hits:
                    any6a = True
                    rep("FAIL", "dowodowa '%s': zakazane wzorce social-proof: %s" % (sid, ", ".join(hits)))
                break
    if not any6a:
        rep("PASS", "sekcje dowodowe: brak gwiazdek/ocen/opinii/recenzji.")

    # 6b: JSON-LD Offer/AggregateRating
    bad = jsonld_bad_types(html)
    if bad:
        rep("FAIL", "JSON-LD zawiera zakazane typy: %s (Offer/AggregateRating -> rich-snippet ceny/ocen)."
            % ", ".join(sorted(bad)))
    else:
        rep("PASS", "JSON-LD: brak typow Offer/AggregateRating/Review/Rating.")

    return finish()


def finish():
    hdr("PODSUMOWANIE")
    print("  PASS=%d  WARN=%d  FAIL=%d" % (COUNTS["PASS"], COUNTS["WARN"], COUNTS["FAIL"]))
    if COUNTS["FAIL"] == 0:
        print("  WYNIK: OK (exit 0)")
        return 0
    print("  WYNIK: FAIL — landing NIE gotowy (exit 1)")
    return 1


def main():
    global TIMEOUT
    ap = argparse.ArgumentParser(
        description="Gate kompletnosci sekcji + hero-video dla fabryki landingow wf2.")
    ap.add_argument("--plan", required=True, help="sciezka do PLAN.md (z '## MANIFEST SEKCJI')")
    ap.add_argument("--url", help="URL zywego landingu (https://...)")
    ap.add_argument("--file", dest="file", help="sciezka do index.html w repo")
    ap.add_argument("--no-net", action="store_true", help="pomin sprawdzenia sieciowe (parse-only)")
    ap.add_argument("--timeout", type=int, default=TIMEOUT, help="timeout HTTP w sekundach (domyslnie 30)")
    args = ap.parse_args()
    TIMEOUT = args.timeout

    if not args.url and not args.file:
        ap.error("podaj co najmniej --url albo --file")

    do_net = not args.no_net
    try:
        code = run(args.plan, args.url, args.file, do_net)
    except KeyboardInterrupt:
        print("\nPrzerwano.")
        code = 130
    sys.exit(code)


if __name__ == "__main__":
    main()

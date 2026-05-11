#!/usr/bin/env python3
"""
Generuje sekcję Reels dla landing page:
1. Pobiera video_links z workflow_video.video_links (Supabase REST)
2. Pobiera MP4 + thumbnaile przez yt-dlp (TT/IG/YT) — ZAWSZE lokalnie hostowane
   żeby uniknąć: X-Frame-Options blokujących iframe, niedostępnych embedów,
   black-screen na YT shortów wymagających specjalnych formatów.
3. Wykrywa duplikaty cross-platform przez perceptual hash thumbnaili
   (autorzy często uploadują ten sam reel na TT + IG + YT — chcemy 1 sztukę).
4. Uploaduje unikalne MP4 + JPG do Supabase Storage:
   attachments/landing/{slug}/reels/reel-{N}.{mp4,jpg}
5. Drukuje JSON z mapping + gotowy HTML do wklejenia w landing page.

Wymagania:
  pip install yt-dlp imagehash Pillow requests
  + node (dla bypass JS challenge YouTube) i flag --remote-components ejs:github

Użycie:
  python scripts/generate-reels.py --workflow-id <UUID> --slug <slug>
  python scripts/generate-reels.py --urls url1 url2 url3 --slug <slug>

Output:
  reels-out/{slug}/      — pobrane MP4 + JPG (cache)
  reels-out/{slug}/manifest.json — mapping new_idx → mp4_url + thumb_url
  stdout: HTML snippet do wklejenia (REELS-TRACK + PROGRESS + STORIES)
"""
import argparse
import json
import os
import re
import struct
import subprocess
import sys
import time
from pathlib import Path

try:
    import imagehash
    from PIL import Image
    import requests
except ImportError as e:
    sys.exit(f"BŁĄD: {e}. Zainstaluj: pip install yt-dlp imagehash Pillow requests")

SUPA_URL = "https://yxmavwkwnfuphjqbelws.supabase.co"
SUPA_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
# DEDUP: priorytetowy sygnał = duration match. Phash bywa nieskuteczny dla cross-platform
# bo YouTube często ma custom cover (graficzny), TT/IG biorą pierwszą klatkę video.
# Te same nagrania dają radykalnie różne thumbnaile (phash distance 100+) mimo tego samego content.
DUR_STRONG_MATCH = 0.3  # różnica <0.3s w realnym świecie = niemal pewny cross-platform duplikat
PHASH_THRESHOLD = 20    # tylko wspierający sygnał gdy duration nie matchuje strong
DUR_TOLERANCE = 2.0     # tolerancja gdy phash MATCHUJE (dla weak signal)

# ─────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────

def detect_platform(url: str) -> str:
    if "youtube.com" in url or "youtu.be" in url:
        return "youtube"
    if "tiktok.com" in url:
        return "tiktok"
    if "instagram.com" in url:
        return "instagram"
    return "other"

def extract_yt_id(url: str):
    m = re.search(r"(?:v=|youtu\.be/|/shorts/)([A-Za-z0-9_-]{11})", url)
    return m.group(1) if m else None

def get_mp4_duration(path: str) -> float:
    try:
        with open(path, "rb") as f:
            data = f.read(min(os.path.getsize(path), 200_000))
        i = data.find(b"mvhd")
        if i < 0: return 0.0
        v = data[i+4]
        if v == 0:
            ts, du = struct.unpack(">II", data[i+16:i+24])
        else:
            ts = struct.unpack(">I", data[i+24:i+28])[0]
            du = struct.unpack(">Q", data[i+28:i+36])[0]
        return du / ts
    except Exception:
        return 0.0

def fetch_video_links(workflow_id: str):
    if not SUPA_KEY:
        sys.exit("BŁĄD: brak SUPABASE_SERVICE_KEY w env")
    r = requests.get(
        f"{SUPA_URL}/rest/v1/workflow_video?select=video_links&workflow_id=eq.{workflow_id}",
        headers={"apikey": SUPA_KEY, "Authorization": f"Bearer {SUPA_KEY}"},
        timeout=30,
    )
    r.raise_for_status()
    rows = r.json()
    if not rows:
        sys.exit(f"BŁĄD: brak workflow_video dla {workflow_id}")
    links = rows[0].get("video_links") or []
    return [l["url"] if isinstance(l, dict) else l for l in links]

# ─────────────────────────────────────────────────────────────────────
# yt-dlp download
# ─────────────────────────────────────────────────────────────────────

def download_one(url: str, out_path_template: str, idx: int, force: bool = False) -> tuple:
    """Zwraca (mp4_path, jpg_path) lub (None, None) jeśli failed.
    Cache reuse: jeśli oba pliki istnieją (i mają sensowny rozmiar) — pomija download."""
    platform = detect_platform(url)
    mp4_path = out_path_template % "mp4"
    jpg_path = out_path_template % "jpg"

    # Cache hit
    if not force and Path(mp4_path).exists() and Path(jpg_path).exists():
        if os.path.getsize(mp4_path) > 50_000 and os.path.getsize(jpg_path) > 1_000:
            print(f"  [{idx}] cache hit (skip download)", file=sys.stderr)
            return (mp4_path, jpg_path)

    cmd_base = ["python", "-m", "yt_dlp", "--quiet", "--no-warnings"]

    # YouTube: format 18 (360p single mp4 z audio, bez HLS) + JS bypass
    if platform == "youtube":
        cmd = cmd_base + [
            "--remote-components", "ejs:github",
            "--js-runtimes", "node",
            "-f", "18/best[ext=mp4][height<=720]/best[ext=mp4]",
            "-o", out_path_template % "%(ext)s",
            url,
        ]
    else:
        cmd = cmd_base + [
            "-f", "best[ext=mp4]/best",
            "-o", out_path_template % "%(ext)s",
            url,
        ]

    if Path(mp4_path).exists():
        Path(mp4_path).unlink()

    try:
        subprocess.run(cmd, check=True, capture_output=True, timeout=180)
    except subprocess.CalledProcessError as e:
        print(f"  [{idx}] FAIL MP4: {e.stderr.decode('utf-8', errors='replace')[:200]}", file=sys.stderr)
        return (None, None)
    except subprocess.TimeoutExpired:
        print(f"  [{idx}] TIMEOUT MP4", file=sys.stderr)
        return (None, None)

    if not Path(mp4_path).exists():
        return (None, None)

    # Thumbnail
    if platform == "youtube":
        ytid = extract_yt_id(url)
        if ytid:
            for variant in ("maxresdefault", "hqdefault"):
                r = requests.get(f"https://img.youtube.com/vi/{ytid}/{variant}.jpg", timeout=15)
                if r.ok and len(r.content) > 5000:
                    Path(jpg_path).write_bytes(r.content)
                    break
    else:
        # TT/IG przez yt-dlp --write-thumbnail
        try:
            subprocess.run(
                cmd_base + ["--skip-download", "--write-thumbnail", "-o", out_path_template % "%(ext)s", url],
                check=True, capture_output=True, timeout=60,
            )
            # yt-dlp zapisuje jako .image lub .webp — rename
            for ext in ("image", "webp"):
                p = out_path_template % ext
                if Path(p).exists():
                    Path(p).rename(jpg_path)
                    break
        except Exception as e:
            print(f"  [{idx}] thumbnail fail: {e}", file=sys.stderr)

    return (mp4_path, jpg_path if Path(jpg_path).exists() else None)

# ─────────────────────────────────────────────────────────────────────
# Dedup via phash
# ─────────────────────────────────────────────────────────────────────

def is_duplicate(a: dict, b: dict) -> tuple:
    """Zwraca (is_dup: bool, reason: str)."""
    dur_diff = abs(a["dur"] - b["dur"])
    # Strong duration signal: różnica <0.3s = niemal pewny duplikat cross-platform
    # (klient wrzuca ten sam reel na TT+IG+YT — encoding daje minimalną różnicę 0.0-0.2s)
    if dur_diff <= DUR_STRONG_MATCH:
        return True, f"dur match {dur_diff:.2f}s"
    # Weak signal: phash similarity + szersza tolerancja duration
    try:
        phash_dist = a["phash"] - b["phash"]
    except Exception:
        phash_dist = 999
    if phash_dist <= PHASH_THRESHOLD and dur_diff <= DUR_TOLERANCE:
        return True, f"phash dist {phash_dist} + dur {dur_diff:.2f}s"
    return False, ""

def dedup(items: list) -> list:
    """items: [{idx, url, platform, mp4, jpg, dur, sz, phash}]
       Zwraca: [{primary, dropped: [...]}]
       Algorytm: greedy grouping, primary signal = duration ±0.3s,
       wspierający = phash ≤20 + duration ±2s."""
    groups = []
    for it in items:
        placed = False
        for g in groups:
            dup, _ = is_duplicate(it, g[0])
            if dup:
                g.append(it)
                placed = True
                break
        if not placed:
            groups.append([it])

    chosen = []
    for g in groups:
        valid = [x for x in g if x["dur"] > 1]
        pool = valid if valid else g
        # Priorytety wyboru "najlepszego" w grupie:
        # 1. YouTube (zwykle najlepsza jakość + view counter — gdy działa lokalnie jako MP4)
        # 2. Instagram (zwykle dobra jakość, brak watermark TikToka)
        # 3. TikTok (watermark może przeszkadzać estetycznie)
        # W ramach platformy: największy MP4 (większy bitrate)
        priority = {"youtube": 0, "instagram": 1, "tiktok": 2, "other": 3}
        pool_sorted = sorted(pool, key=lambda x: (priority.get(x["platform"], 9), -x["sz"]))
        best = pool_sorted[0]
        dropped = [x for x in g if x["idx"] != best["idx"]]
        chosen.append({"primary": best, "dropped": dropped})
    return chosen

# ─────────────────────────────────────────────────────────────────────
# Supabase upload
# ─────────────────────────────────────────────────────────────────────

def supa_upload(local_path: str, supa_path: str, content_type: str):
    url = f"{SUPA_URL}/storage/v1/object/{supa_path}"
    with open(local_path, "rb") as f:
        r = requests.put(
            url,
            headers={
                "Authorization": f"Bearer {SUPA_KEY}",
                "apikey": SUPA_KEY,
                "Content-Type": content_type,
                "x-upsert": "true",
            },
            data=f.read(),
            timeout=120,
        )
    return r.ok, r.text[:200]

def supa_delete(supa_path: str):
    url = f"{SUPA_URL}/storage/v1/object/{supa_path}"
    requests.delete(url, headers={"Authorization": f"Bearer {SUPA_KEY}", "apikey": SUPA_KEY}, timeout=30)

def supa_list_reels(slug: str) -> list:
    """Lista wszystkich plików reel-*.{mp4,jpg} w storage dla danego slug."""
    url = f"{SUPA_URL}/storage/v1/object/list/attachments"
    r = requests.post(
        url,
        headers={"Authorization": f"Bearer {SUPA_KEY}", "apikey": SUPA_KEY, "Content-Type": "application/json"},
        json={"prefix": f"landing/{slug}/reels/", "limit": 1000},
        timeout=30,
    )
    if not r.ok:
        return []
    return [obj["name"] for obj in r.json() if re.match(r"reel-\d+\.(mp4|jpg)", obj["name"])]

def supa_cleanup_old_reels(slug: str, keep_count: int):
    """Usuń wszystkie reel-{N}.{mp4,jpg} dla N >= keep_count (śmieci po poprzednich runach)."""
    existing = supa_list_reels(slug)
    to_delete = []
    for name in existing:
        m = re.match(r"reel-(\d+)\.(mp4|jpg)", name)
        if m and int(m.group(1)) >= keep_count:
            to_delete.append(f"attachments/landing/{slug}/reels/{name}")
    for path in to_delete:
        supa_delete(path)
    return len(to_delete)

# ─────────────────────────────────────────────────────────────────────
# HTML emit
# ─────────────────────────────────────────────────────────────────────

PLAY_SVG = '<span class="reel-phone-play"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg></span>'

def emit_html(slug: str, kept: list) -> dict:
    base = f"{SUPA_URL}/storage/v1/object/public/attachments/landing/{slug}/reels"
    track_buttons = []
    progress_buttons = []
    stories_buttons = []
    for new_idx, item in enumerate(kept):
        mp4 = f"{base}/reel-{new_idx}.mp4"
        jpg = f"{base}/reel-{new_idx}.jpg"
        track_buttons.append(
            f'          <button type="button" class="reel-phone" data-video-idx="{new_idx}" '
            f'data-platform="{item["platform"]}" data-url="{item["url"]}" data-mp4-url="{mp4}" '
            f'aria-label="Reel {new_idx+1}">\n'
            f'            <div class="reel-phone-screen">\n'
            f'              <img class="reel-phone-thumb" src="{jpg}" alt="Reel {new_idx+1}" '
            f'referrerpolicy="no-referrer" loading="lazy">\n'
            f'              {PLAY_SVG}\n'
            f'            </div>\n'
            f'          </button>'
        )
        progress_buttons.append(
            f'        <button type="button" class="reels-progress-bar" data-progress-idx="{new_idx}" '
            f'aria-label="Reel {new_idx+1}"><span></span></button>'
        )
        # Stories ring (max 6, preferuj YT)
        if len(stories_buttons) < 6 and item["platform"] in ("youtube", "instagram"):
            stories_buttons.append((new_idx, item["platform"], jpg))

    return {
        "track": "\n".join(track_buttons),
        "progress": "\n".join(progress_buttons),
        "stories": stories_buttons,
        "count": len(kept),
    }

# ─────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="Generate reels section for landing page")
    ap.add_argument("--workflow-id", help="Workflow UUID (fetch video_links from Supabase)")
    ap.add_argument("--urls", nargs="+", help="Manual URL list")
    ap.add_argument("--slug", required=True, help="Landing slug (np. 'oravibe')")
    ap.add_argument("--cache-dir", default="reels-out", help="Local cache dir")
    ap.add_argument("--skip-upload", action="store_true", help="Pomiń upload do Supabase (tylko dedup + HTML)")
    args = ap.parse_args()

    if not args.workflow_id and not args.urls:
        sys.exit("Podaj --workflow-id lub --urls")

    urls = args.urls if args.urls else fetch_video_links(args.workflow_id)
    if not urls:
        sys.exit("Brak video URLów")

    print(f"\n[1/5] {len(urls)} video do pobrania", file=sys.stderr)
    cache = Path(args.cache_dir) / args.slug
    cache.mkdir(parents=True, exist_ok=True)

    # Download wszystkich
    items = []
    for i, url in enumerate(urls):
        print(f"  [{i}] {url}", file=sys.stderr)
        out_tpl = str(cache / f"src-{i}.%s")
        mp4, jpg = download_one(url, out_tpl, i)
        if not mp4 or not jpg:
            print(f"  [{i}] SKIP (download failed)", file=sys.stderr)
            continue
        items.append({
            "idx": i,
            "url": url,
            "platform": detect_platform(url),
            "mp4": mp4,
            "jpg": jpg,
            "dur": get_mp4_duration(mp4),
            "sz": os.path.getsize(mp4) // 1024,
        })

    print(f"\n[2/5] Phash + dedup ({len(items)} OK z {len(urls)})", file=sys.stderr)
    for it in items:
        it["phash"] = imagehash.phash(Image.open(it["jpg"]), hash_size=16)
    chosen = dedup(items)
    print(f"  → {len(chosen)} unikalnych grup z {len(items)} video", file=sys.stderr)
    for ci, c in enumerate(chosen):
        p = c["primary"]
        if c["dropped"]:
            d = ",".join(f'reel-{x["idx"]}({x["platform"]})' for x in c["dropped"])
            print(f"  • new {ci}: reel-{p['idx']} ({p['platform']}, {p['dur']:.1f}s) ← duplikaty: {d}", file=sys.stderr)
        else:
            print(f"  • new {ci}: reel-{p['idx']} ({p['platform']}, {p['dur']:.1f}s) [unikalny]", file=sys.stderr)

    kept = [c["primary"] for c in chosen]

    if not args.skip_upload:
        print(f"\n[3/5] Upload {len(kept)*2} plików do Supabase Storage", file=sys.stderr)
        for new_idx, item in enumerate(kept):
            for src, ext, ctype in [(item["mp4"], "mp4", "video/mp4"), (item["jpg"], "jpg", "image/jpeg")]:
                supa_path = f"attachments/landing/{args.slug}/reels/reel-{new_idx}.{ext}"
                ok, msg = supa_upload(src, supa_path, ctype)
                print(f"  [{new_idx}.{ext}] {'OK' if ok else 'FAIL: '+msg}", file=sys.stderr)
        # Cleanup: usuń stare reel-{N}.{mp4,jpg} dla N >= len(kept) (śmieci po poprzednich runach)
        deleted = supa_cleanup_old_reels(args.slug, len(kept))
        if deleted:
            print(f"  + cleanup: usunięto {deleted} starych plików (reel-{len(kept)}+ z poprzednich runów)", file=sys.stderr)

    print(f"\n[4/5] Generuję HTML snippet", file=sys.stderr)
    html = emit_html(args.slug, kept)

    manifest = {
        "slug": args.slug,
        "workflow_id": args.workflow_id,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "count": html["count"],
        "kept": [
            {
                "new_idx": i,
                "platform": k["platform"],
                "url": k["url"],
                "duration_s": round(k["dur"], 2),
                "mp4_url": f"{SUPA_URL}/storage/v1/object/public/attachments/landing/{args.slug}/reels/reel-{i}.mp4",
                "thumb_url": f"{SUPA_URL}/storage/v1/object/public/attachments/landing/{args.slug}/reels/reel-{i}.jpg",
            } for i, k in enumerate(kept)
        ],
        "duplicates_removed": [
            {"primary_idx": ci, "dropped_urls": [x["url"] for x in c["dropped"]]}
            for ci, c in enumerate(chosen) if c["dropped"]
        ],
    }
    (cache / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\n[5/5] Manifest: {cache}/manifest.json", file=sys.stderr)
    print(f"Total: {html['count']} unikalnych reels (usunięto {len(items) - html['count']} duplikatów)\n", file=sys.stderr)

    # Stdout = HTML do wklejenia
    print("=" * 70)
    print("PASTE TO LANDING (między <!-- VIDEOS:REELS-TRACK:START --> i :END):")
    print("=" * 70)
    print(html["track"])
    print()
    print("=" * 70)
    print("PROGRESS BARS (zastąp <div class=\"reels-progress\">...</div>):")
    print("=" * 70)
    print(f'      <div class="reels-progress" id="reelsProgress">')
    print(html["progress"])
    print(f'      </div>')
    print()
    print("=" * 70)
    print(f"COUNTER: zaktualizuj '<div ... id=\"reelsLbCounter\">1 / {html['count']}</div>'")
    print("=" * 70)
    print()
    print(f"Manifest JSON: {cache}/manifest.json")

if __name__ == "__main__":
    main()

"""Sterownik fal.ai przez edge proxy bud-fal-proxy (klucz zostaje server-side).
Uzycie modulowe albo CLI:
  python fal.py store <plik> <sciezka_docelowa>
  python fal.py gen <model> <payload.json> <out_prefix>   # submit+poll+download
  python fal.py saldo                                     # realne saldo konta (op billing)
  python fal.py reclaim <outdir>                          # dociagnij OPLACONE joby po padzie
Ledger: C:/tmp/video-factory/ledger.json (kazdy submit z szacunkiem kosztu).
BUDZET: est_usd to tylko orientacja (SeedVR2 liczony od MEGAPIKSELI — incydent 403 z 18.07);
zrodlem prawdy jest balance()/preflight() przez op 'billing' proxy.
"""
import json, sys, time, base64, os, urllib.request, urllib.error, mimetypes

PROXY = "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/bud-fal-proxy"
SECRET = open(r"C:\tmp\tt.txt", encoding="ascii", errors="ignore").read().strip()
LEDGER = r"C:\tmp\video-factory\ledger.json"

# szacunki kosztow USD (z researchu 2026-07-17)
COST = {
    "fal-ai/nano-banana/edit": lambda p: 0.039 * int(p.get("num_images", 1)),
    "fal-ai/flux-pro/kontext": lambda p: 0.04 * int(p.get("num_images", 1)),
    "fal-ai/kling-video/v2.5-turbo/pro/image-to-video":
        lambda p: 0.35 + max(0, int(p.get("duration", "5")) - 5) * 0.07,
    "fal-ai/wan-25-preview/image-to-video":
        lambda p: {"480p": 0.05, "720p": 0.10, "1080p": 0.15}.get(p.get("resolution", "1080p"), 0.15)
                  * int(p.get("duration", "5")),
    "fal-ai/veo3.1/fast/image-to-video":
        lambda p: (0.15 if p.get("generate_audio", True) else 0.10) * int(str(p.get("duration", "8s")).rstrip("s")),
    "fal-ai/elevenlabs/tts/eleven-v3": lambda p: 0.10 * len(p.get("text", "")) / 1000,
    "fal-ai/elevenlabs/tts/turbo-v2.5": lambda p: 0.05 * len(p.get("text", "")) / 1000,
    "fal-ai/stable-audio-25/text-to-audio": lambda p: 0.20,
    "fal-ai/elevenlabs/sound-effects": lambda p: 0.05,
    "fal-ai/kling-video/lipsync/audio-to-video": lambda p: 0.03,
    # omnihuman rozlicza po sekundach audio — nieznane z payloadu; ledger_add z est recznie
}

def _post(body):
    req = urllib.request.Request(PROXY, data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-tools-secret": SECRET})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode())

_PROJECT = ""
def set_project(name):
    """Prefiks projektu dla WSZYSTKICH tagow ledgera (gen+render) — izolacja budzetu per projekt."""
    global _PROJECT; _PROJECT = name

def ledger_add(entry):
    if _PROJECT and not str(entry.get("tag", "")).startswith(_PROJECT + "_"):
        entry["tag"] = _PROJECT + "_" + str(entry.get("tag", ""))
    # ATOMOWY zapis (temp+replace) + retry — rownolegle joby psuly plik nieatomowym RMW.
    # Totals traktuj ORIENTACYJNIE; twardy budzet licz SUMA est_usd po prefiksie tagu.
    for attempt in range(5):
        try:
            led = json.load(open(LEDGER, encoding="utf-8")) if os.path.exists(LEDGER) else {"spent_usd": 0, "calls": []}
            led["calls"].append(entry)
            led["spent_usd"] = round(led["spent_usd"] + entry.get("est_usd", 0), 4)
            tmp = LEDGER + f".tmp{os.getpid()}"
            json.dump(led, open(tmp, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
            os.replace(tmp, LEDGER)
            return led["spent_usd"]
        except (json.JSONDecodeError, PermissionError):
            time.sleep(0.2 * (attempt + 1))
    return -1

def store(path, dest):
    ct = mimetypes.guess_type(path)[0] or "image/jpeg"
    b64 = base64.b64encode(open(path, "rb").read()).decode()
    out = _post({"op": "store", "path": dest, "b64": b64, "contentType": ct})
    if "url" not in out: raise RuntimeError(f"store failed: {out}")
    return out["url"]

def gen(model, payload, tag=""):
    est = COST.get(model, lambda p: 0)(payload)
    sub = _post({"op": "submit", "model": model, "payload": payload})
    rid = sub.get("request_id")
    if not rid: raise RuntimeError(f"submit failed: {sub}")
    total = ledger_add({"ts": time.strftime("%Y-%m-%d %H:%M:%S"), "model": model, "tag": tag,
                        "request_id": rid, "est_usd": round(est, 3),
                        "response_url": sub.get("response_url")})
    print(f"[fal] {tag or model} rid={rid} est=${est:.3f} total=${total:.2f}", flush=True)
    t0, fails = time.time(), 0
    while True:
        time.sleep(6 if time.time() - t0 < 90 else 15)
        try:
            st = _post({"op": "poll", "url": sub["status_url"] + "?logs=0"})
            fails = 0
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as e:
            # blip edge/sieci NIE przerywa — job jest juz OPLACONY; po 4 z rzedu poddaj sie
            # (wynik i tak dociagalny pozniej: response_url w ledgerze -> reclaim)
            fails += 1
            if fails >= 4: raise RuntimeError(f"poll 4x transient ({e}); dociagnij: fal.py reclaim")
            continue
        s = st.get("status")
        if s == "COMPLETED": break
        if s not in ("IN_QUEUE", "IN_PROGRESS"):
            raise RuntimeError(f"fal status {s}: {json.dumps(st)[:500]}")
        if time.time() - t0 > 900: raise RuntimeError("timeout 15 min")
    return _post({"op": "poll", "url": sub["response_url"]})

def balance():
    """Realne saldo konta fal w USD (op 'billing' proxy; wymaga sekretu BUD_FAL_ADMIN_KEY na edge).
    To jest zrodlo prawdy budzetu — NIE suma est_usd z ledgera."""
    out = _post({"op": "billing"})
    if out.get("balance") is None: raise RuntimeError(f"billing: {out}")
    return float(out["balance"])

def preflight(floor_usd=15.0):
    """Twardy gate przed przebiegiem (PROCEDURA KROK 0): saldo < floor -> STOP, zanim
    zaczniesz bieg, ktorego nie dokonczysz (403 w polowie = opłacone sceny bez finalu)."""
    b = balance()
    if b < floor_usd:
        raise RuntimeError(f"BUDZET: saldo ${b:.2f} < floor ${floor_usd:.2f} — doladuj fal przed przebiegiem")
    print(f"[fal] saldo ${b:.2f} OK (floor ${floor_usd})", flush=True)
    return b

def reclaim(outdir):
    """Dociagnij OPLACONE joby po padzie sesji: czyta ledger i POLLUJE response_url
    (re-poll = darmowy; re-submit = drugi bill!). Pomija tagi z istniejacym wynikiem/.failed."""
    led = json.load(open(LEDGER, encoding="utf-8"))
    got = []
    for c in led.get("calls", []):
        ru, tag = c.get("response_url"), c.get("tag") or c.get("request_id")
        if not ru or not tag: continue
        base = os.path.join(outdir, str(tag))
        if any(os.path.exists(base + e) for e in (".mp4", ".png", ".mp3", ".failed")): continue
        try:
            res = _post({"op": "poll", "url": ru})
        except Exception as e:
            print(f"[reclaim] {tag}: {e}", flush=True); continue
        url = ((res.get("video") or {}).get("url") or (res.get("images") or [{}])[0].get("url")
               or (res.get("audio") or {}).get("url"))
        if url:
            ext = ".mp4" if res.get("video") else (".mp3" if res.get("audio") else ".png")
            got.append(download(url, base + ext)); print("[reclaim] saved:", base + ext, flush=True)
    return got

def download(url, out):
    urllib.request.urlretrieve(url, out)
    return out

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "store":
        print(store(sys.argv[2], sys.argv[3]))
    elif cmd == "saldo":
        print(f"${balance():.2f}")
    elif cmd == "reclaim":
        print(f"dociagnieto {len(reclaim(sys.argv[2]))} plikow")
    elif cmd == "gen":
        model, pf, prefix = sys.argv[2], sys.argv[3], sys.argv[4]
        payload = json.load(open(pf, encoding="utf-8"))
        res = gen(model, payload, tag=os.path.basename(prefix))
        # wyciagnij url wyniku (video.url albo images[0].url)
        url = (res.get("video") or {}).get("url") or (res.get("images") or [{}])[0].get("url")
        print(json.dumps(res)[:400])
        if url:
            ext = ".mp4" if ".mp4" in url or res.get("video") else ".png"
            print("saved:", download(url, prefix + ext))

"""Lip-sync scen mowionych: Kling LipSync a2v na PELNYCH klipach 5 s,
audio = wycinek finalnej sciezki lektorki od startu sceny w osi czasu reklamy.
Submit wszystkich naraz -> poll -> download ls_<sid>.mp4."""
import json, os, subprocess, sys, time
sys.path.insert(0, os.path.dirname(__file__)); import fal
from assemble import PLAN, G, OUT

VO = os.path.join(G, "vo_pl_v2.mp3")
SYNC = ["0", "2", "7", "8b", "11", "14"]  # sceny z twarza na wprost
CLIP = {sid: f for sid, f, _ in PLAN}

def run(a):
    r = subprocess.run(a, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0: raise RuntimeError(r.stderr[-500:])

def main():
    os.makedirs(OUT, exist_ok=True)
    # 1) finalna sciezka lektorki (identycznie jak w assemble: atempo 1.15 + delay 0.3 + pad)
    vof = os.path.join(OUT, "vo_final.wav")
    run(["ffmpeg", "-v", "error", "-i", VO, "-af", "atempo=1.15,adelay=300|300,apad=pad_dur=30", "-y", vof])
    # 2) spany scen w osi czasu
    spans, t = {}, 0.0
    for sid, _, dur in PLAN:
        spans[sid] = t; t += dur
    # 3) submit wszystkich
    jobs = {}
    for sid in SYNC:
        t0 = spans[sid]
        seg = os.path.join(OUT, f"voseg_{sid}.mp3")
        run(["ffmpeg", "-v", "error", "-ss", f"{t0:.3f}", "-t", "5.2", "-i", vof,
             "-c:a", "libmp3lame", "-b:a", "128k", "-y", seg])
        small = os.path.join(OUT, f"small_{sid}.mp4")
        run(["ffmpeg", "-v", "error", "-i", CLIP[sid], "-c:v", "libx264", "-crf", "26",
             "-preset", "fast", "-an", "-y", small])
        vurl = fal.store(small, f"lokowka/ls/in_{sid}.mp4")
        aurl = fal.store(seg, f"lokowka/ls/vo_{sid}.mp3")
        sub = fal._post({"op": "submit", "model": "fal-ai/kling-video/lipsync/audio-to-video",
                         "payload": {"video_url": vurl, "audio_url": aurl}})
        if "request_id" not in sub: print("SUBMIT FAIL", sid, str(sub)[:200]); continue
        fal.ledger_add({"ts": time.strftime("%Y-%m-%d %H:%M:%S"), "model": "kling-lipsync",
                        "tag": f"ls_{sid}", "request_id": sub["request_id"], "est_usd": 0.028,
                        "response_url": sub.get("response_url")})
        jobs[sid] = sub
        print("submitted", sid, sub["request_id"], flush=True)
    # 4) poll wszystkich
    t0 = time.time()
    while jobs and time.time() - t0 < 3600:
        time.sleep(30)
        for sid in list(jobs):
            st = fal._post({"op": "poll", "url": jobs[sid]["status_url"] + "?logs=0"})
            s = st.get("status")
            if s == "COMPLETED":
                res = fal._post({"op": "poll", "url": jobs[sid]["response_url"]})
                url = (res.get("video") or {}).get("url")
                out = os.path.join(G, f"ls_{sid}.mp4")
                fal.download(url, out)
                print("OK", sid, out, flush=True)
                del jobs[sid]
            elif s not in ("IN_QUEUE", "IN_PROGRESS"):
                print("FAIL", sid, s, str(st)[:200], flush=True)
                del jobs[sid]
    if jobs: print("TIMEOUT dla:", list(jobs))

if __name__ == "__main__":
    main()

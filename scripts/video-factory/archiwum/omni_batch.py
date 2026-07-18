"""OmniHuman 1.5: sceny mowione od podstaw (klatka + segment VO).
Prompt = akcja sceny z blueprintu + klauzula anti-AI. Wyjscie: oh_s<sid>.mp4"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__)); import fal
from frames_batch import scene_by_id, BASE

STORE = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/video-factory/"
ANTI = (" She speaks casually to the front camera like a TikTok creator, natural pauses, "
        "subtle head movements, natural blinking, tiny handheld camera wobble, "
        "natural skin texture, no robotic gestures, raw unedited selfie video look. "
        "The pink hair curler keeps its exact shape.")
SIDS = ["2", "7", "8b", "11", "14"]

if __name__ == "__main__":
    bp = json.load(open(os.path.join(BASE, 'blueprint_v1.json'), encoding='utf-8'))
    jobs = {}
    for sid in SIDS:
        sc = scene_by_id(bp, sid)
        payload = {
            "image_url": STORE + f"lokowka/gen/f{sid}_v1.png",
            "audio_url": STORE + f"lokowka/ls/vo_{sid}.mp3",
            "prompt": sc['i2v_motion_prompt_en'] + ANTI,
            "resolution": "1080p",
        }
        sub = fal._post({"op": "submit", "model": "fal-ai/bytedance/omnihuman/v1.5", "payload": payload})
        if "request_id" not in sub: print("SUBMIT FAIL", sid, str(sub)[:200]); continue
        fal.ledger_add({"ts": time.strftime("%Y-%m-%d %H:%M:%S"), "model": "omnihuman-1.5",
                        "tag": f"oh_s{sid}", "est_usd": 0.83, "request_id": sub["request_id"],
                        "response_url": sub.get("response_url")})
        jobs[sid] = sub; print("submitted", sid, flush=True)
    t0 = time.time()
    while jobs and time.time() - t0 < 3000:
        time.sleep(30)
        for sid in list(jobs):
            st = fal._post({"op": "poll", "url": jobs[sid]["status_url"] + "?logs=0"})
            s = st.get("status")
            if s == "COMPLETED":
                res = fal._post({"op": "poll", "url": jobs[sid]["response_url"]})
                url = (res.get("video") or {}).get("url")
                print("OK", sid, fal.download(url, os.path.join(BASE, 'gen', f"oh_s{sid}.mp4")), flush=True)
                del jobs[sid]
            elif s not in ("IN_QUEUE", "IN_PROGRESS"):
                print("FAIL", sid, str(st)[:250], flush=True); del jobs[sid]
    if jobs: print("TIMEOUT:", list(jobs))

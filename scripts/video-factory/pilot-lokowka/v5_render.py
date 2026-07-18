"""Rendery blueprintu v2: OmniHuman (sceny mowione, emocje z audio+promptu) + Kling (akcja/FLF)."""
import sys, os, json, time, subprocess
sys.path.insert(0, os.path.dirname(__file__)); import fal

S = "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/video-factory/"
BASE = r"C:\tmp\video-factory\lokowka"
G = os.path.join(BASE, 'gen')

ANTI = (" Natural blinking, tiny handheld camera wobble, natural skin texture, no robotic gestures, "
        "raw unedited smartphone selfie video. The pink curler keeps its exact shape.")

OH = [  # (id, frame, emotion-prompt)
 ("h1",   "v5_h1",   "Skeptical deadpan delivery, one raised eyebrow, unconvinced look straight into camera, small head shake."),
 ("load", "v5_load", "Focused and concentrated, slight frown, her eyes stay ON the device as both hands work feeding the strand, she talks briefly without looking at camera."),
 ("wait", "v5_wait", "Tense anticipation, she bites her lip slightly, eyes fixed sideways on the device at her head, barely moving, waiting."),
 ("react","v5_react","She bursts into genuine delighted laughter, eyes widen then crinkle with joy, head tilts back slightly, shows the curl to the camera excitedly."),
 ("prog", "v5_prog", "Proud and animated, talks fast with excitement, glances between the camera and the device while feeding the next strand."),
 ("mirror","f13_v1", "Second shock: her eyes go wide, mouth opens in an 'O' of disbelief looking at her reflection, then a thrilled smile; she tousles a curl."),
 ("cta",  "f14_v1",  "Warm confident smile, direct eye contact, quick energetic delivery, she taps the curler once."),
]
KL = [  # (id, frame, tail_or_None, motion)
 ("h2", "v5_h2", None, "Extreme close-up shock face: quick handheld jolt, she blinks once, mouth stays open in disbelief, slight motion blur, 1 second of raw energy."),
 ("mech1", "v5_mech1_first", "v5_mech1_last", "Macro: the rotating rose-gold barrel smoothly draws the hair strand into the chamber and winds it into neat coils, mechanical rotation, shallow depth of field, handheld micro drift."),
 ("release", "v5_release_first", "v5_release_last", "She pulls the device smoothly away from her head and a fresh spiral curl springs free and bounces once, natural hair physics, handheld feel."),
 ("mech2", "v5_mech2", None, "Her finger taps toward the chamber, hair rotates slightly inside, subtle handheld drift, device stays sharp in focus."),
 ("shake", "v5_shake", None, "She shakes and tousles her full curls with both hands, hair bounces with volume and spring, joyful laugh, handheld camera energy."),
]
NEG = "morphing, warping, distorted face, distorted hands, product changing shape, extra prongs, logo, text, low quality"

def run(a):
    r = subprocess.run(a, capture_output=True, text=True)
    if r.returncode != 0: raise RuntimeError(r.stderr[-300:])

if __name__ == '__main__':
    jobs = {}
    for sid, frame, prompt in OH:
        drive = os.path.join(G, f"vo3_{sid}_drive.mp3")
        run(["ffmpeg", "-v", "error", "-i", os.path.join(G, f"vo3_{sid}.mp3"),
             "-af", "apad=pad_dur=0.6", "-c:a", "libmp3lame", "-b:a", "128k", "-y", drive])
        aurl = fal.store(drive, f"lokowka/v5/vo3_{sid}_drive.mp3")
        sub = fal._post({"op": "submit", "model": "fal-ai/bytedance/omnihuman/v1.5", "payload": {
            "image_url": S + f"lokowka/gen/{frame}.png", "audio_url": aurl,
            "prompt": prompt + ANTI, "resolution": "1080p"}})
        if "request_id" not in sub: print("SUBMIT FAIL", sid, str(sub)[:200]); continue
        fal.ledger_add({"ts": time.strftime("%Y-%m-%d %H:%M:%S"), "model": "omnihuman-1.5",
                        "tag": f"r5_{sid}", "est_usd": 0.55, "request_id": sub["request_id"],
                        "response_url": sub.get("response_url")})
        jobs[sid] = sub; print("submitted OH", sid, flush=True)
    for sid, frame, tail, motion in KL:
        payload = {"prompt": motion, "image_url": S + f"lokowka/gen/{frame}.png",
                   "duration": "5", "cfg_scale": 0.5, "negative_prompt": NEG}
        if tail: payload["tail_image_url"] = S + f"lokowka/gen/{tail}.png"
        sub = fal._post({"op": "submit", "model": "fal-ai/kling-video/v2.5-turbo/pro/image-to-video", "payload": payload})
        if "request_id" not in sub: print("SUBMIT FAIL", sid, str(sub)[:200]); continue
        fal.ledger_add({"ts": time.strftime("%Y-%m-%d %H:%M:%S"), "model": "kling-2.5",
                        "tag": f"r5_{sid}", "est_usd": 0.35, "request_id": sub["request_id"],
                        "response_url": sub.get("response_url")})
        jobs[sid] = sub; print("submitted KL", sid, flush=True)
    t0 = time.time()
    while jobs and time.time() - t0 < 3600:
        time.sleep(30)
        for sid in list(jobs):
            st = fal._post({"op": "poll", "url": jobs[sid]["status_url"] + "?logs=0"})
            s = st.get("status")
            if s == "COMPLETED":
                res = fal._post({"op": "poll", "url": jobs[sid]["response_url"]})
                url = (res.get("video") or {}).get("url")
                print("OK", sid, fal.download(url, os.path.join(G, f"r5_{sid}.mp4")), flush=True)
                del jobs[sid]
            elif s not in ("IN_QUEUE", "IN_PROGRESS"):
                print("FAIL", sid, str(st)[:250], flush=True); del jobs[sid]
    if jobs: print("TIMEOUT:", list(jobs))

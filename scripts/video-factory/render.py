"""Generyczny renderer scen przez fal.ai (uzywa fal.py). RDZEN.

Silniki (engine w scenie planu):
  mc        -> Kling 2.6 Motion Control  {image_url, video_url (driving 3-10 s!), character_orientation:'image'}
  flf       -> Kling 2.5 first+last      {image_url, tail_image_url?, prompt, duration:'5', negative_prompt}
  omnihuman -> OmniHuman 1.5             {image_url, audio_url (per-scena, +0.6 s pad), prompt ekspresji}

Uzycie: render_scenes([{tag, engine, image_url, video_url|tail_image_url|audio_url, prompt}], outdir)
Zwraca dict tag->sciezka mp4; sceny FAILED dostaja plik <tag>.failed z trescia bledu.
Odporny poll: status_url/response_url Z ODPOWIEDZI submita; HTTPError NIE przerywa petli.
"""
import os, time, json, urllib.error
import fal

MODELS = {
    "mc": "fal-ai/kling-video/v2.6/pro/motion-control",
    "flf": "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
    "omnihuman": "fal-ai/bytedance/omnihuman/v1.5",
    # kref = SILNIK SCEN PRODUKTOWYCH (0i-b): model WIDZI packshot przez caly klip.
    # Scena: {engine:'kref', image_urls:[klatka-startowa "z prawdy"], elements:[{frontal_image_url:
    # packshot, reference_image_urls:[widoki/stany]}], prompt zaczynajacy od "Take @Image1 as the
    # start frame...", duration:'5', aspect_ratio:'9:16', negative_prompt: morfy konstrukcji}.
    # BEZ tail_image (kotwica tozsamosci zamiast przypiecia konca). Pilot drapek 19.07: zabil
    # halucynacje otwarcia mechanizmu, ktorej FLF nie utrzymal na tym samym briefie.
    "kref": "fal-ai/kling-video/o1/reference-to-video",
}
# NEG = tylko GENERYCZNE wady; cechy produktowe (kolory, ksztalty, "two curlers" itp.)
# podawaj per scena w polu `negative_extra` — z KARTY PRODUKTU (lekcja: NEG z lokowki
# wyciekl "pink" do produktu gunmetal).
NEG = ("extra fingers, fused fingers, extra hand, third arm, extra limbs, deformed hands, mutated fingers, "
       "malformed hands, morphing, warping, product changing shape, second device, duplicate product, "
       "jewelry, nail polish, text, logo, low quality")
# EST realne per ~5 s (audyt 18.07: stare 0.5/0.6 zanizaly ~40%, a KROK 0 sumuje est_usd):
# mc = $0.112/s * 7.5 s sr., omnihuman = ~$0.16/s * 5 s. Zrodlem prawdy budzetu i tak jest fal.balance().
EST = {"mc": 0.85, "flf": 0.35, "omnihuman": 0.85, "kref": 0.56}

def render_scenes(scenes, outdir, timeout_s=2400, project=""):
    """Scena moze miec n=2 (best-of-N): submituje kandydatow tag__c1/tag__c2.
    Wyboru dokonuje bramka (qa_gate + auto-select: PASS z najmniejsza liczba flag);
    N>1 stosuj TYLKO dla engine mc/omnihuman lub scen flagowanych wczesniej (SSOT 0e)."""
    jobs = {}
    expanded = []
    for sc in scenes:
        n = int(sc.get("n", 1))
        if n <= 1:
            expanded.append(sc)
        else:
            for ci in range(1, n + 1):
                c = dict(sc); c.pop("n", None)
                c["tag"] = f"{sc['tag']}__c{ci}"
                expanded.append(c)
    for sc in expanded:
        tag, eng = sc["tag"], sc["engine"]
        payload = {k: v for k, v in sc.items() if k not in ("tag", "engine", "negative_extra")}
        neg_extra = sc.get("negative_extra")
        if eng == "mc": payload.setdefault("character_orientation", "image")
        if eng == "kref":
            payload.setdefault("duration", "5"); payload.setdefault("aspect_ratio", "9:16")
            payload.setdefault("negative_prompt", NEG + (", " + neg_extra if neg_extra else ""))
        if eng == "flf":
            payload.setdefault("duration", "5"); payload.setdefault("cfg_scale", 0.5)
            payload.setdefault("negative_prompt", NEG + (", " + neg_extra if neg_extra else ""))
        if eng == "omnihuman": payload.setdefault("resolution", "1080p")
        sub = fal._post({"op": "submit", "model": MODELS[eng], "payload": payload})
        if "request_id" not in sub:
            open(os.path.join(outdir, tag + ".failed"), "w").write(str(sub)[:500]); continue
        fal.ledger_add({"ts": time.strftime("%Y-%m-%d %H:%M:%S"), "model": eng, "tag": tag,
                        "est_usd": EST[eng], "request_id": sub["request_id"], "tag_full": (project + "_" + tag if project else tag),
                        "response_url": sub.get("response_url")})
        jobs[tag] = sub
    done = {}
    t0 = time.time()
    fails = {}
    while jobs and time.time() - t0 < timeout_s:
        time.sleep(30)
        for tag in list(jobs):
            try:
                st = fal._post({"op": "poll", "url": jobs[tag]["status_url"] + "?logs=0"})
                fails[tag] = 0
                s = st.get("status")
                if s == "COMPLETED":
                    res = fal._post({"op": "poll", "url": jobs[tag]["response_url"]})
                    url = (res.get("video") or {}).get("url")
                    out = os.path.join(outdir, tag + ".mp4")
                    fal.download(url, out); done[tag] = out; del jobs[tag]
                elif s not in ("IN_QUEUE", "IN_PROGRESS"):
                    open(os.path.join(outdir, tag + ".failed"), "w").write(str(st)[:500]); del jobs[tag]
            except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as e:
                # blip edge/sieci NIE spisuje joba na straty — jest juz OPLACONY; dopiero
                # 3 bledy Z RZEDU = .failed (i tak dociagalny pozniej: fal.py reclaim)
                fails[tag] = fails.get(tag, 0) + 1
                if fails[tag] < 3: continue
                if isinstance(e, urllib.error.HTTPError):
                    try: body = e.read().decode()[:500]
                    except Exception: body = str(e.code)
                else: body = str(e)[:500]
                open(os.path.join(outdir, tag + ".failed"), "w").write(body); del jobs[tag]
    return done

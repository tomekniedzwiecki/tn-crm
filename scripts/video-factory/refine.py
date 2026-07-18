"""SeedVR2 refine finalu (opcjonalny krok 'polish' PROCEDURY). RDZEN.

GOTCHA (zmierzone 17.07): fal-ai/seedvr/upscale/video przetwarza MAKS ~5 s na wywolanie
(dluzsze wejscie = ucieta 5-sekundowa odpowiedz) i zwraca 2x upscale (np. 1088x1920 -> 2176x3808).
Przepis: potnij final na kawalki <=4.8 s -> refine kazdy -> downscale do 1080x1920 -> concat.
KOSZT (zmierzone 18.07 — incydent wyczerpania konta): SeedVR2 bilinguje od MEGAPIKSELI wyjscia
(2x upscale!), realnie ~$1-1.3/kawalek => ~$3-4 na final 15 s, NIE $0.9. Przed refine
sprawdz fal.balance(). Wejscie do store musi byc <=~9 MB (limit edge store base64)
- kawalki 5 s przy crf 23 miesza sie z zapasem.

Uzycie: python refine.py <final.mp4> <out.mp4>
"""
import os, subprocess, sys, time, json


def _run(a):
    r = subprocess.run(a, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0: raise RuntimeError(r.stderr[-500:])


def refine(final, out, chunk_s=4.8):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    try:
        import fal
    except ImportError:
        sys.path.insert(0, r'C:\tmp\video-factory\tools'); import fal
    dur = float(subprocess.check_output(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                                         '-of', 'csv=p=0', final]).decode().strip())
    wd = os.path.dirname(os.path.abspath(out)) or '.'
    chunks, t, i = [], 0.0, 0
    jobs = []
    while t < dur - 0.05:
        d = min(chunk_s, dur - t)
        c_in = os.path.join(wd, f'_rf_in{i}.mp4')
        _run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', final, '-t', f'{d:.3f}',
              '-c:v', 'libx264', '-crf', '23', '-preset', 'fast', '-an', '-y', c_in])
        url = fal.store(c_in, f'refine/{os.path.basename(out)}_{i}.mp4')
        sub = fal._post({"op": "submit", "model": "fal-ai/seedvr/upscale/video", "payload": {"video_url": url}})
        if 'request_id' not in sub: raise RuntimeError(f'submit chunk {i}: {sub}')
        fal.ledger_add({"ts": time.strftime("%Y-%m-%d %H:%M:%S"), "model": "seedvr2",
                        "tag": f"refine_{os.path.basename(out)}_{i}", "est_usd": 1.2,
                        "request_id": sub["request_id"], "response_url": sub.get("response_url")})
        jobs.append((i, sub)); chunks.append((i, t, d)); t += d; i += 1
    outs = {}
    t0 = time.time()
    import urllib.error
    pending = dict(jobs)
    while pending and time.time() - t0 < 2400:
        time.sleep(30)
        for ci in list(pending):
            sub = pending[ci]
            try:
                st = fal._post({"op": "poll", "url": sub["status_url"] + "?logs=0"})
                if st.get("status") == "COMPLETED":
                    res = fal._post({"op": "poll", "url": sub["response_url"]})
                    u = (res.get("video") or {}).get("url")
                    c_out = os.path.join(wd, f'_rf_out{ci}.mp4')
                    fal.download(u, c_out); outs[ci] = c_out; del pending[ci]
                elif st.get("status") not in ("IN_QUEUE", "IN_PROGRESS"):
                    raise RuntimeError(f'chunk {ci}: {str(st)[:200]}')
            except urllib.error.HTTPError as e:
                raise RuntimeError(f'chunk {ci}: HTTP {e.code}')
    if pending: raise RuntimeError(f'timeout chunkow: {list(pending)}')
    # downscale + concat + audio z oryginalu
    lst = os.path.join(wd, '_rf_concat.txt')
    parts = []
    for ci, _, _ in chunks:
        p = os.path.join(wd, f'_rf_ds{ci}.mp4')
        _run(['ffmpeg', '-v', 'error', '-i', outs[ci], '-vf', 'scale=1080:1920,fps=30,format=yuv420p',
              '-c:v', 'libx264', '-crf', '19', '-preset', 'fast', '-an', '-y', p])
        parts.append(p)
    open(lst, 'w', encoding='utf-8').write(''.join(f"file '{p}'\n".replace('\\', '/') for p in parts))
    vid = os.path.join(wd, '_rf_video.mp4')
    _run(['ffmpeg', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-y', vid])
    _run(['ffmpeg', '-v', 'error', '-i', vid, '-i', final, '-map', '0:v', '-map', '1:a',
          '-c:v', 'copy', '-c:a', 'copy', '-y', out])
    return out


if __name__ == '__main__':
    print(refine(sys.argv[1], sys.argv[2]))

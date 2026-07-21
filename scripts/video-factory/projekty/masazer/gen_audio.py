# -*- coding: utf-8 -*-
"""VO ElevenLabs v3 (first-person, kobiecy Aria) + muzyka + SFX diegetyczne (0h) + ambient (motor hum).
SFX tor: Stable Audio 2.5 10s + trim (sound-effects endpoint pada 400). Taguje masazer_*. ASCII printy."""
import sys, os, subprocess
sys.path.insert(0, r"C:/tmp/video-factory/tools"); import fal
fal.set_project('masazer')
BASE = r"C:\tmp\video-factory\masazer"; GEN = os.path.join(BASE, 'gen'); os.makedirs(GEN, exist_ok=True)
VOICE = "Aria"  # kobiecy PL, UGC first-person

# VO — PELNE DIAKRYTYKI (fix 19.07: v1 czytal ASCII 'BOL/NAPIECIE'). Trzymane w plikach UTF-8
# (gen/<tag>.txt), podawane do TTS Z PLIKU; przed submitem weryfikacja diakrytykow w payloadzie.
VO = {
 "vo_hook":   "Miałam koszmarny ból karku.",
 "vo_worn":   "Zapinam to na bark i włączam.",
 "vo_relief": "Napięcie po prostu odpływa.",
 "vo_cta":    "Już tego nie oddam.",
}
VODIR = os.path.join(GEN, "vo_txt"); os.makedirs(VODIR, exist_ok=True)
PL_DIAC = set("ąćęłńóśźż") | set("ĄĆĘŁŃÓŚŹŻ")  # polskie znaki diakrytyczne

def _write_vo_files():
    """Zapisuje kwestie VO do plikow UTF-8 (SSOT PROMPTY-BIBLIOTEKA: teksty VO w plikach)."""
    for tag, txt in VO.items():
        open(os.path.join(VODIR, tag + ".txt"), "w", encoding="utf-8").write(txt)

# SFX: {tag: (prompt, trim_seconds, continuous?)}
SFX = {
 "sfx_knead":  ("sound effect foley: soft rhythmic kneading, silicone fingers pressing and rubbing into skin and soft fabric, gentle muffled thud, close-up ASMR, dry, NO music, NO reverb, sound continues throughout", 2.6, True),
 "sfx_click":  ("sound effect foley: a single soft electronic button beep then a quiet small electric motor starting to whir and hum, close-up, dry, NO music, NO reverb", 1.6, False),
 "sfx_knead2": ("sound effect foley: continuous soft kneading and gentle rubbing of silicone massage nubs on skin, close-up ASMR, dry, NO music, NO reverb, sound continues throughout", 2.6, True),
 "sfx_exhale": ("sound effect foley: a soft relaxed human female exhale, a gentle sigh of relief, close-up, dry, NO music, NO reverb", 1.6, False),
}

def dur(p):
    return float(subprocess.check_output(['ffprobe','-v','quiet','-show_entries','format=duration','-of','csv=p=0',p]).decode().strip())

def _url(res):
    return ((res.get('audio') or {}).get('url') or res.get('audio_url')
            or (res.get('audio_file') or {}).get('url'))

def tts(tag, text=None):
    # ODCZYT Z PLIKU UTF-8 (zrodlo prawdy tekstu VO) — nie z argumentu ASCII-podatnego.
    fpath = os.path.join(VODIR, tag + ".txt")
    if not os.path.exists(fpath): _write_vo_files()
    payload_text = open(fpath, encoding="utf-8").read().strip()
    payload = {"text": payload_text, "voice": VOICE, "stability": 0.3}
    # WERYFIKACJA PRZED WYSYLKA: payload MUSI zawierac polskie znaki (fix 19.07 'BOL/NAPIECIE').
    diac = [c for c in payload["text"] if c in PL_DIAC]
    if not diac:
        raise RuntimeError(f"VO {tag}: payload BEZ diakrytykow -> STOP ('{payload_text}')")
    print(f"[VO-CHECK] {tag}: '{payload_text}' | diakrytyki={''.join(sorted(set(diac)))}", flush=True)
    res = fal.gen("fal-ai/elevenlabs/tts/eleven-v3", payload, tag="masazer_"+tag)
    u = _url(res)
    if not u: raise RuntimeError("no VO url: "+str(res)[:300])
    out = os.path.join(GEN, tag+'.mp3'); fal.download(u, out)
    print("VO", tag, round(dur(out),2),'s', flush=True); return out

def music():
    res = fal.gen("fal-ai/stable-audio-25/text-to-audio",
        {"prompt": ("warm modern feel-good wellness pop, soft steady punchy kick and light claps driving from the "
                    "very first second, cozy bright warm synths, calming but confident, radio-ready punchy mix, "
                    "constant energy until the very end, no outro, no fade out, absolutely no vocals, NO lo-fi, NO ambient"),
         "seconds_total": 25, "num_inference_steps": 8}, tag="masazer_music")
    u = _url(res)
    if not u: raise RuntimeError("no music url: "+str(res)[:300])
    out = os.path.join(GEN,'music.wav'); fal.download(u, out)
    print('MUSIC', round(dur(out),2),'s', flush=True); return out

def ambient():
    res = fal.gen("fal-ai/stable-audio-25/text-to-audio",
        {"prompt": ("quiet warm cozy bedroom room tone with a soft steady low electric massage-device motor hum "
                    "humming gently in the background, calm seamless steady, NO melody, NO music, NO beat, background only"),
         "seconds_total": 22, "num_inference_steps": 8}, tag="masazer_ambient")
    u = _url(res)
    if not u: raise RuntimeError("no ambient url: "+str(res)[:300])
    out = os.path.join(GEN,'ambient.wav'); fal.download(u, out)
    print('AMBIENT', round(dur(out),2),'s', flush=True); return out

def sfx(tag):
    prompt, trim, cont = SFX[tag]
    res = fal.gen("fal-ai/stable-audio-25/text-to-audio",
        {"prompt": prompt, "seconds_total": 10, "num_inference_steps": 8}, tag="masazer_"+tag)
    u = _url(res)
    if not u: raise RuntimeError("no sfx url: "+str(res)[:300])
    raw = os.path.join(GEN, tag+'_raw.wav'); fal.download(u, raw)
    out = os.path.join(GEN, tag+'.mp3')
    af = f"silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:{trim},afade=t=out:st={max(0.0,trim-0.25):.2f}:d=0.25"
    subprocess.run(["ffmpeg","-v","error","-i",raw,"-af",af,"-y",out], check=True)
    print('SFX', tag, round(dur(out),2),'s', flush=True); return out

if __name__ == '__main__':
    _write_vo_files()  # teksty VO -> pliki UTF-8 przed generacja
    which = sys.argv[1:] or (['music','ambient'] + list(VO) + list(SFX))
    for k in which:
        if k == 'music': music()
        elif k == 'ambient': ambient()
        elif k in VO: tts(k, VO[k])
        elif k in SFX: sfx(k)
        else: print('SKIP unknown', k)
    print('AUDIO DONE', flush=True)

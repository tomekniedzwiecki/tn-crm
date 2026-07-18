# -*- coding: utf-8 -*-
"""VO ElevenLabs v3 (first-person, meski Bill) + muzyka + SFX diegetyczne (0h) + ambient.
SFX tor: Stable Audio 2.5 10s + trim (sound-effects endpoint pada 400 - potwierdzone 18.07 i dzis).
Taguje drapek_*. ASCII printy (konsola cp1250)."""
import sys, os, subprocess
sys.path.insert(0, r"C:/tmp/video-factory/tools"); import fal
fal.set_project('drapek')
BASE = r"C:\tmp\video-factory\drapek"; GEN = os.path.join(BASE, 'gen'); os.makedirs(GEN, exist_ok=True)
VOICE = "Bill"  # cieply meski, UGC first-person

VO = {
 "vo_hook":   "Pies bal sie obcinaczek.",
 "vo_board":  "Wiec ma wlasna deske.",
 "vo_scratch":"Sam sciera pazurki.",
 "vo_reward": "A w nagrode - smakolyk.",
 "vo_proof":  "Zero stresu i szarpania.",
 "vo_cta":    "Teraz sam o to prosi.",
}

# SFX: {tag: (prompt, trim_seconds, continuous?)}
SFX = {
 "sfx_hook":   ("sound effect foley: a single sharp metallic nail-clipper snip click, then a soft short anxious dog whimper, close-up, dry, NO music, NO reverb", 2.0, False),
 "sfx_board":  ("sound effect foley: a solid wooden board set down flat on a floor with a soft thud, then a quick dog sniffing, close-up, dry, NO music, NO reverb", 2.0, False),
 "sfx_scratch":("sound effect foley: continuous vigorous dog claws scratching and dragging on a coarse rough sandpaper board, energetic digging, close-up ASMR, dry, NO music, NO reverb, sound continues throughout", 2.8, True),
 "sfx_reward": ("sound effect foley: a wooden drawer lid sliding open with a soft wooden scrape, then a dog crunching a dry kibble treat, close-up, dry, NO music, NO reverb", 2.2, False),
 "sfx_pawtap": ("sound effect foley: a single soft dog paw tap patting a wooden board, close-up, dry, NO music, NO reverb", 1.2, False),
}

def dur(p):
    return float(subprocess.check_output(['ffprobe','-v','quiet','-show_entries','format=duration','-of','csv=p=0',p]).decode().strip())

def _url(res):
    return ((res.get('audio') or {}).get('url') or res.get('audio_url')
            or (res.get('audio_file') or {}).get('url'))

def tts(tag, text):
    res = fal.gen("fal-ai/elevenlabs/tts/eleven-v3", {"text": text, "voice": VOICE, "stability": 0.3}, tag="drapek_"+tag)
    u = _url(res)
    if not u: raise RuntimeError("no VO url: "+str(res)[:300])
    out = os.path.join(GEN, tag+'.mp3'); fal.download(u, out)
    print("VO", tag, round(dur(out),2),'s', flush=True); return out

def music():
    res = fal.gen("fal-ai/stable-audio-25/text-to-audio",
        {"prompt": ("warm playful upbeat pet-friendly acoustic-pop, light punchy kick and hand claps driving "
                    "from the very first second, bright ukulele and marimba, feel-good cozy home vibe, "
                    "radio-ready punchy mix, constant energy until the very end, no outro, no fade out, "
                    "absolutely no vocals, NO lo-fi, NO ambient"),
         "seconds_total": 25, "num_inference_steps": 8}, tag="drapek_music")
    u = _url(res)
    if not u: raise RuntimeError("no music url: "+str(res)[:300])
    out = os.path.join(GEN,'music.wav'); fal.download(u, out)
    print('MUSIC', round(dur(out),2),'s', flush=True); return out

def ambient():
    res = fal.gen("fal-ai/stable-audio-25/text-to-audio",
        {"prompt": ("quiet warm room tone of a bright cozy living room, very soft ambient home air, "
                    "subtle steady seamless, gentle and calm, NO melody, NO music, NO beat, background only"),
         "seconds_total": 25, "num_inference_steps": 8}, tag="drapek_ambient")
    u = _url(res)
    if not u: raise RuntimeError("no ambient url: "+str(res)[:300])
    out = os.path.join(GEN,'ambient.wav'); fal.download(u, out)
    print('AMBIENT', round(dur(out),2),'s', flush=True); return out

def sfx(tag):
    prompt, trim, cont = SFX[tag]
    res = fal.gen("fal-ai/stable-audio-25/text-to-audio",
        {"prompt": prompt, "seconds_total": 10, "num_inference_steps": 8}, tag="drapek_"+tag)
    u = _url(res)
    if not u: raise RuntimeError("no sfx url: "+str(res)[:300])
    raw = os.path.join(GEN, tag+'_raw.wav'); fal.download(u, raw)
    out = os.path.join(GEN, tag+'.mp3')
    # strip leading silence then trim to hit window
    af = f"silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:{trim},afade=t=out:st={max(0.0,trim-0.25):.2f}:d=0.25"
    subprocess.run(["ffmpeg","-v","error","-i",raw,"-af",af,"-y",out], check=True)
    print('SFX', tag, round(dur(out),2),'s', flush=True); return out

if __name__ == '__main__':
    which = sys.argv[1:] or (['music','ambient'] + list(VO) + list(SFX))
    for k in which:
        if k == 'music': music()
        elif k == 'ambient': ambient()
        elif k in VO: tts(k, VO[k])
        elif k in SFX: sfx(k)
        else: print('SKIP unknown', k)
    print('AUDIO DONE', flush=True)

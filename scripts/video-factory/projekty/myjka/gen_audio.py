# -*- coding: utf-8 -*-
"""VO ElevenLabs v3 (meski, UGC) per-scena + muzyka Stable Audio 2.5. Taguje myjka_*."""
import sys, os, subprocess
sys.path.insert(0, r"C:\tmp\video-factory\tools"); import fal
BASE = r"C:\tmp\video-factory\myjka"; GEN = os.path.join(BASE, 'gen'); os.makedirs(GEN, exist_ok=True)
VOICE = "Bill"  # dojrzaly, cieply meski

VO = {
 "vo_hook":   "Tyle brudu schodzi w sekunde.",
 "vo_sweep":  "Jeden przejazd i lakier znowu lsni.",
 "vo_rinse":  "Bez weza, bez kranu. Woda prosto z wiaderka.",
 "vo_reveal": "Auto czyste jak z myjni.",
 "vo_cta":    "Zgarnij swoja. Link masz nizej.",
}

def dur(p):
    return float(subprocess.check_output(['ffprobe','-v','quiet','-show_entries','format=duration','-of','csv=p=0',p]).decode().strip())

def tts(tag, text):
    res = fal.gen("fal-ai/elevenlabs/tts/eleven-v3", {"text": text, "voice": VOICE}, tag="myjka_"+tag)
    u = (res.get('audio') or {}).get('url') or res.get('audio_url')
    out = os.path.join(GEN, tag+'.mp3'); fal.download(u, out)
    print(tag, round(dur(out),2),'s', flush=True); return out

def music():
    res = fal.gen("fal-ai/stable-audio-25/text-to-audio",
        {"prompt": "Upbeat clean satisfying automotive detailing background music, crisp electronic groove, "
                   "light punchy percussion, a subtle rising build in the first 4 seconds resolving into a "
                   "satisfying bass drop around 5 seconds, then steady confident momentum, positive and premium, "
                   "NO vocals.",
         "seconds_total": 16}, tag="myjka_music")
    u = (res.get('audio') or {}).get('url') or res.get('audio_url')
    out = os.path.join(GEN,'music.wav'); fal.download(u, out)
    print('music', round(dur(out),2),'s', flush=True); return out

if __name__ == '__main__':
    which = sys.argv[1:] or (list(VO)+['music'])
    for k in which:
        if k == 'music': music()
        else: tts(k, VO[k])
    print('AUDIO DONE')

# -*- coding: utf-8 -*-
"""VO ElevenLabs v3 (męski) per-scena + muzyka Stable Audio 2.5. Taguje uchwyt_*."""
import sys, os, subprocess
sys.path.insert(0, r"C:\tmp\video-factory\tools"); import fal
BASE = r"C:\tmp\video-factory\uchwyt"; GEN = os.path.join(BASE,'gen')
VOICE = "Bill"  # dojrzały, ciepły męski

VO = {
 "vo_s1": "Ten uchwyt zaciskasz na desce w dwie sekundy.",
 "vo_s2": "Telefon wskakuje i trzyma go za cztery rogi.",
 "vo_s3": "Obracasz na poziom albo na pion, jak chcesz.",
 "vo_s4": "Nawigacja prosto przed oczami.",
 "vo_s5": "Dziura w drodze? Ani drgnie.",
 "vo_s6": "Link znajdziesz poniżej.",
}

def dur(p):
    return float(subprocess.check_output(['ffprobe','-v','quiet','-show_entries','format=duration','-of','csv=p=0',p]).decode().strip())

def tts(tag, text):
    res = fal.gen("fal-ai/elevenlabs/tts/eleven-v3", {"text": text, "voice": VOICE}, tag="uchwyt_"+tag)
    u = (res.get('audio') or {}).get('url') or res.get('audio_url')
    out = os.path.join(GEN, tag+'.mp3'); fal.download(u, out)
    print(tag, round(dur(out),2),'s', flush=True); return out

def music():
    res = fal.gen("fal-ai/stable-audio-25/text-to-audio",
        {"prompt": "Upbeat modern confident automotive tech background music, clean electronic groove, light "
                   "punchy percussion, a subtle rising build in the first 4 seconds resolving into a satisfying "
                   "bass drop around 5 seconds, steady driving momentum, positive and premium, NO vocals.",
         "seconds_total": 16}, tag="uchwyt_music")
    u = (res.get('audio') or {}).get('url') or res.get('audio_url')
    out = os.path.join(GEN,'music.wav'); fal.download(u, out)
    print('music', round(dur(out),2),'s', flush=True); return out

if __name__ == '__main__':
    which = sys.argv[1:] or (list(VO)+['music'])
    for k in which:
        if k == 'music': music()
        else: tts(k, VO[k])
    print('AUDIO DONE')

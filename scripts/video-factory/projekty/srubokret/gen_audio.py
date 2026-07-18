# -*- coding: utf-8 -*-
"""VO ElevenLabs v3 (kobiecy, UGC) per-scena + muzyka Stable Audio 2.5. Taguje srubokret_*."""
import sys, os, subprocess
sys.path.insert(0, r"C:\tmp\video-factory\tools"); import fal
BASE = r"C:\tmp\video-factory\srubokret"; GEN = os.path.join(BASE, 'gen')
VOICE = "Jessica"  # cieply, mlody, konwersacyjny kobiecy UGC

VO = {
 "vo_s1": "[frustrated] Znasz to? Ciasny kąt i śruba, do której nijak się dostać.",
 "vo_s2": "A teraz? Śrubokręt grzechotkowy, dwadzieścia cztery w jednym.",
 "vo_s4": "[impressed] I wchodzi tam, gdzie wiertarka się nie zmieści.",
 "vo_s5": "Dwadzieścia cztery końcówki w jednym etui. Link w opisie.",
}

def dur(p):
    return float(subprocess.check_output(['ffprobe','-v','quiet','-show_entries','format=duration','-of','csv=p=0',p]).decode().strip())

def tts(tag, text):
    res = fal.gen("fal-ai/elevenlabs/tts/eleven-v3", {"text": text, "voice": VOICE}, tag="srubokret_"+tag)
    u = (res.get('audio') or {}).get('url') or res.get('audio_url')
    out = os.path.join(GEN, tag+'.mp3'); fal.download(u, out)
    print(tag, round(dur(out),2),'s', flush=True); return out

def music():
    res = fal.gen("fal-ai/stable-audio-25/text-to-audio",
        {"prompt": "Upbeat modern confident tech product-demo background music, clean minimal electronic groove with "
                   "a bright plucky melody and light punchy percussion, building anticipation for the first 8 "
                   "seconds then a satisfying confident beat drop at 8 seconds into a driving positive groove, "
                   "premium and energetic, resolves cleanly at the end. Instrumental, NO vocals.",
         "seconds_total": 26}, tag="srubokret_music")
    u = (res.get('audio') or {}).get('url') or res.get('audio_url')
    out = os.path.join(GEN,'music.wav'); fal.download(u, out)
    print('music', round(dur(out),2),'s', flush=True); return out

if __name__ == '__main__':
    which = sys.argv[1:] or (list(VO)+['music'])
    for k in which:
        if k == 'music': music()
        else: tts(k, VO[k])
    print('AUDIO DONE')

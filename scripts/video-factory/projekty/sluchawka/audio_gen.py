"""VO per-scena (eleven-v3, voice Aria) + muzyka (Stable Audio 2.5, drop na reveal ciśnienia)."""
import sys, os
sys.path.insert(0, r'C:/tmp/video-factory/tools'); import fal
G = r"C:\tmp\video-factory\sluchawka\gen"; os.makedirs(G, exist_ok=True)

VO = {
 "s1_hook":    "[skeptical] Twój prysznic ledwo kapie?",
 "s2_modes":   "Pięć trybów. Jedno kliknięcie.",
 "s3_compare": "Ciśnienie dwa razy większe!",
 "s4_macro":   "Masaż, mgiełka, mocny strumień.",
 "s5_proof":   "Taka siła, że zmywa brud w sekundę.",
 "s6_cta":     "Załóż w minutę. Link masz niżej!",
}

def vo(tag, text):
    res = fal.gen("fal-ai/elevenlabs/tts/eleven-v3", {"text": text, "voice": "Aria"}, tag="sluchawka_vo_"+tag)
    url = (res.get("audio") or {}).get("url")
    out = os.path.join(G, f"vo_{tag}.mp3"); fal.download(url, out)
    print("VO", tag, flush=True); return out

def music():
    p = ("Satisfying modern clean deep-house beat for a premium product ad, minimal tight groove, "
         "soft anticipation build in the first 4 seconds then a punchy bass drop at 5 seconds, "
         "uplifting energetic, crisp percussion, water-like shimmer, no vocals, seamless, 16 seconds.")
    res = fal.gen("fal-ai/stable-audio-25/text-to-audio", {"prompt": p, "seconds_total": 16}, tag="sluchawka_music")
    url = (res.get("audio") or {}).get("url")
    out = os.path.join(G, "music.wav"); fal.download(url, out)
    print("MUSIC saved", out, flush=True); return out

if __name__ == "__main__":
    for t, txt in VO.items(): vo(t, txt)
    music()
    print("AUDIO DONE")

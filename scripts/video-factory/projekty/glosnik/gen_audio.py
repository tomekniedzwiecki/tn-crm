"""VO (ElevenLabs) + muzyka (Stable Audio 2.5) dla glosnika. Import fal z rdzenia."""
import os, sys, json
sys.path.insert(0, r"c:\repos_tn\tn-crm\scripts\video-factory")
import fal

GEN = r"C:\tmp\video-factory\glosnik\gen"
os.makedirs(GEN, exist_ok=True)

VO = {
    "vo_hook":  "Jeden dotyk i biurko ożywa.",
    "vo_charge":"Ładuje bezprzewodowo i gra jak głośnik.",
    "vo_hero":  "Podstawka, głośnik i lampka — w jednym.",
    "vo_cta":   "Pięć w jednym. Sprawdź sam.",
}

def tts(text, out, voice="Bill"):
    payload = {"text": text, "voice": voice}
    res = fal.gen("fal-ai/elevenlabs/tts/eleven-v3", payload, tag="glosnik_" + os.path.basename(out))
    url = (res.get("audio") or {}).get("url") or (res.get("audio_url") if isinstance(res.get("audio_url"), str) else None)
    print("TTS RES KEYS:", list(res.keys()), flush=True)
    if not url:
        raise RuntimeError("no audio url: " + json.dumps(res)[:400])
    fal.download(url, os.path.join(GEN, out))
    print("SAVED", out, flush=True)

def music(out="music.wav"):
    payload = {"prompt": ("chill lo-fi electronic desk-setup groove, warm synth pads, soft plucks, "
                          "gentle beat, subtle build with a light drop, clean modern, instrumental, 120 bpm"),
               "seconds_total": 15}
    res = fal.gen("fal-ai/stable-audio-25/text-to-audio", payload, tag="glosnik_music")
    print("MUSIC RES KEYS:", list(res.keys()), flush=True)
    url = (res.get("audio") or {}).get("url") or (res.get("audio_file") or {}).get("url")
    if not url:
        raise RuntimeError("no music url: " + json.dumps(res)[:400])
    fal.download(url, os.path.join(GEN, out))
    print("SAVED", out, flush=True)

if __name__ == "__main__":
    step = sys.argv[1]
    if step == "test":
        tts(VO["vo_hook"], "vo_hook.mp3", voice=sys.argv[2] if len(sys.argv) > 2 else "Bill")
    elif step == "vo":
        for k, t in VO.items():
            tts(t, k + ".mp3")
    elif step == "music":
        music()

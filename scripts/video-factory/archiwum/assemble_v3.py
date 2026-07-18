"""Montaz v3: sceny mowione audio-driven (OmniHuman/Kling Avatar), BEZ napisow,
post realizmu (drift zoom, grade, winieta, ziarno, kompresja telefonowa),
audio: VO + muzyka z sidechain duckingiem, mastering -14 LUFS / -1 dBTP.
Wynik: lokowka/out/ad_v3.mp4"""
import os, subprocess, sys

BASE = r"C:\tmp\video-factory\lokowka"
G, OUT = os.path.join(BASE, 'gen'), os.path.join(BASE, 'out')

# zrodla scen: mowione -> plik audio-driven (TALK), reszta -> klipy Kling i2v
TALK = {}  # wypelniane: sid -> plik (ustawiane po decyzji A/B przez env TALK_PREFIX)
PREFIX = os.environ.get("TALK_PREFIX", "oh")  # 'oh' = OmniHuman, 'ka' = Kling Avatar
PLAN = [
    ("0",  1.671), ("1", 0.669), ("2", 0.936), ("7", 2.607),
    ("8b", 5.0), ("11", 5.0), ("13", 5.0), ("14", 3.2),
]
TALK_SIDS = ["0", "2", "7", "8b", "11", "14"]
FALLBACK = {"0": "s00_kling.mp4"}

def src(sid):
    if sid in TALK_SIDS:
        p = os.path.join(G, f"{PREFIX}_s{sid}.mp4")
        if os.path.exists(p): return p
    f = FALLBACK.get(sid, f"c{sid}_v1.mp4")
    return os.path.join(G, f)

def run(a):
    r = subprocess.run(a, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0: raise RuntimeError(f"ffmpeg: {r.stderr[-700:]}")

def main():
    os.makedirs(OUT, exist_ok=True)
    parts, t = [], 0.0
    for sid, dur in PLAN:
        f = src(sid)
        if not os.path.exists(f): raise SystemExit(f"BRAK: {f}")
        p = os.path.join(OUT, f"p3_{sid}.mp4")
        run(["ffmpeg", "-v", "error", "-i", f, "-t", f"{dur:.3f}",
             "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30",
             "-an", "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-y", p])
        parts.append(p); t += dur
    total = t
    lst = os.path.join(OUT, "concat3.txt")
    open(lst, 'w', encoding='utf-8').write("".join(f"file '{p}'\n".replace("\\", "/") for p in parts))
    joined = os.path.join(OUT, "joined3.mp4")
    run(["ffmpeg", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-y", joined])
    # post realizmu: subtelny drift zoomu, grade smartfona, winieta, ziarno temporalne, crf 24
    graded = os.path.join(OUT, "graded3.mp4")
    run(["ffmpeg", "-v", "error", "-i", joined, "-vf",
         "zoompan=z='min(zoom+0.0003,1.045)':d=1:s=1080x1920:fps=30,"
         "eq=saturation=1.05:contrast=1.03:brightness=0.005,"
         "vignette=PI/5.5,noise=c0s=11:c0f=t+u",
         "-c:v", "libx264", "-crf", "24", "-preset", "medium", "-y", graded])
    # audio: VO (kompresja) + muzyka (ducking sidechain) -> loudnorm -14/-1
    vo = os.path.join(G, "vo_pl_v2.mp3")
    mus = os.path.join(G, "music_v1.wav")
    final = os.path.join(OUT, "ad_v3.mp4")
    fc = (
        "[1:a]atempo=1.15,adelay=300|300,apad,aresample=48000,aformat=channel_layouts=stereo,"
        "acompressor=threshold=-18dB:ratio=4:attack=5:release=120:makeup=3[vo];"
        "[2:a]aresample=48000,aformat=channel_layouts=stereo,volume=-7dB[mus];"
        "[vo]asplit=2[vok][vom];"
        "[mus][vok]sidechaincompress=threshold=0.05:ratio=8:attack=15:release=300:makeup=1[md];"
        "[vom][md]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1:LRA=11[a]"
    )
    run(["ffmpeg", "-v", "error", "-i", graded, "-i", vo, "-i", mus,
         "-filter_complex", fc, "-map", "0:v", "-map", "[a]",
         "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", f"{total:.3f}", "-y", final])
    print("FINAL:", final, f"({total:.1f}s), TALK={PREFIX}")

if __name__ == "__main__":
    main()

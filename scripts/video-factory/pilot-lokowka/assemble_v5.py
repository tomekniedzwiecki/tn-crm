"""Montaz v5: dynamiczna os czasu (OmniHuman = dlugosc audio), kwestie VO na startach scen,
muzyka z automatyka glosnosci (suspens/kulminacja), sidechain ducking, limiter (BEZ splaszczania).
Bez napisow. Wynik: lokowka/out/ad_v5.mp4"""
import os, subprocess, json

BASE = r"C:\tmp\video-factory\lokowka"
G, OUT = os.path.join(BASE, 'gen'), os.path.join(BASE, 'out')

# (id, plik, dur_planowana | None=dlugosc klipu, vo_plik | None)
PLAN = [
    ("h1",     "r5_h1.mp4",     None, "vo3_h1.mp3"),
    ("h2",     "r5_h2.mp4",     1.3,  "vo3_h2.mp3"),
    ("load",   "r5_load.mp4",   None, "vo3_load.mp3"),
    ("mech1",  "r5_mech1.mp4",  2.2,  None),
    ("wait",   "r5_wait.mp4",   None, "vo3_wait.mp3"),
    ("release","r5_release.mp4",2.0,  None),
    ("react",  "r5_react.mp4",  None, "vo3_react.mp3"),
    ("prog",   "r5_prog.mp4",   None, "vo3_prog.mp3"),
    ("mech2",  "r5_mech2.mp4",  2.4,  "vo3_mech2.mp3"),
    ("shake",  "r5_shake.mp4",  3.2,  "vo3_shake.mp3"),
    ("mirror", "r5_mirror.mp4", None, "vo3_mirror.mp3"),
    ("cta",    "r5_cta.mp4",    None, "vo3_cta.mp3"),
]
MUSIC = os.path.join(G, "music_v3.wav")

def run(a):
    r = subprocess.run(a, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0: raise RuntimeError(f"ffmpeg: {r.stderr[-700:]}")

def dur_of(p):
    return float(subprocess.check_output(['ffprobe','-v','quiet','-show_entries','format=duration',
                                          '-of','csv=p=0', p]).decode().strip())

def main():
    os.makedirs(OUT, exist_ok=True)
    parts, t, spans = [], 0.0, {}
    for sid, f, dur, _ in PLAN:
        src = os.path.join(G, f)
        if not os.path.exists(src): raise SystemExit(f"BRAK: {src}")
        d = dur if dur else dur_of(src) - 0.05
        p = os.path.join(OUT, f"p5_{sid}.mp4")
        run(["ffmpeg", "-v", "error", "-i", src, "-t", f"{d:.3f}",
             "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30",
             "-an", "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-y", p])
        parts.append(p); spans[sid] = (t, t + d); t += d
    total = t
    print("TIMELINE:", json.dumps({k: [round(a,2), round(b,2)] for k,(a,b) in spans.items()}))
    lst = os.path.join(OUT, "concat5.txt")
    open(lst, 'w', encoding='utf-8').write("".join(f"file '{p}'\n".replace("\\", "/") for p in parts))
    joined = os.path.join(OUT, "joined5.mp4")
    run(["ffmpeg", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-y", joined])
    graded = os.path.join(OUT, "graded5.mp4")
    run(["ffmpeg", "-v", "error", "-i", joined, "-vf",
         "zoompan=z='min(zoom+0.0003,1.045)':d=1:s=1080x1920:fps=30,"
         "eq=saturation=1.05:contrast=1.03,vignette=PI/5.5,noise=c0s=13:c0f=t+u",
         "-c:v", "libx264", "-crf", "24", "-preset", "medium", "-y", graded])
    # audio: kwestie na startach scen + muzyka z automatyka + ducking + limiter
    ins, filters, mixin = [graded], [], []
    idx = 1
    for sid, _, _, vo in PLAN:
        if not vo: continue
        ins.append(os.path.join(G, vo))
        d_ms = int(spans[sid][0] * 1000)
        filters.append(f"[{idx}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={d_ms}|{d_ms}[v{idx}]")
        mixin.append(f"[v{idx}]"); idx += 1
    ins.append(MUSIC)
    mus_idx = idx
    ws, we = spans["wait"][0], spans["release"][1]
    ms_, me_ = spans["mirror"]
    filters.append(
        f"[{mus_idx}:a]aresample=48000,aformat=channel_layouts=stereo,atempo=0.906,"
        f"volume=0.40,volume=enable='between(t,{ws:.2f},{we:.2f})':volume=0.14,"
        f"volume=enable='between(t,{ms_:.2f},{me_:.2f})':volume=1.5[mus]")
    n_vo = len(mixin)
    filters.append("".join(mixin) + f"amix=inputs={n_vo}:duration=longest:normalize=0,"
                   f"acompressor=threshold=-16dB:ratio=3:attack=5:release=150:makeup=2[voall]")
    filters.append("[voall]asplit=2[vok][vom]")
    filters.append("[mus][vok]sidechaincompress=threshold=0.06:ratio=6:attack=20:release=350[md]")
    filters.append(f"[vom][md]amix=inputs=2:duration=first:normalize=0,apad,alimiter=limit=0.89:level=false[a]")
    fc = ";".join(filters)
    final = os.path.join(OUT, "ad_v5.mp4")
    cmd = ["ffmpeg", "-v", "error"]
    for i_ in ins: cmd += ["-i", i_]
    cmd += ["-filter_complex", fc, "-map", "0:v", "-map", "[a]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
            "-t", f"{total:.3f}", "-y", final]
    run(cmd)
    print("FINAL:", final, f"({total:.1f}s)")

if __name__ == "__main__":
    main()

"""Segment v2: grade-match miedzy silnikami (kotwica=load), globalne ziarno,
ciecia na pauzach audio, hflip react dla ciaglosci strony. Wynik: segment_test_v2.mp4"""
import os, subprocess

BASE = r"C:\tmp\video-factory\lokowka"
G, OUT = os.path.join(BASE, 'gen'), os.path.join(BASE, 'out')

# (id, plik, ss, dur, vo, vf_extra)  — vf_extra = korekta grade per scena (audyt 3)
PLAN = [
    ("load",    "v2_load.mp4",    0.5, 2.9, "vo3_load.mp3", None),
    ("mech",    "v2_mech.mp4",    0.0, 2.6, None,
     "eq=brightness=-0.02:saturation=1.05,unsharp=5:5:0.3"),
    ("release", "v2_release.mp4", 0.3, 2.4, "vo3_wait.mp3", None),
    ("react",   "v2_react.mp4",   0.0, 3.4, "vo3_react.mp3",
     "hflip,eq=brightness=0.024:saturation=1.04,unsharp=5:5:0.6"),
]
MUSIC, MUS_OFFSET = os.path.join(G, "music_v3.wav"), 3.2

def run(a):
    r = subprocess.run(a, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0: raise RuntimeError(r.stderr[-600:])

def main():
    os.makedirs(OUT, exist_ok=True)
    parts, t, starts = [], 0.0, {}
    for sid, f, ss, dur, _, vfx in PLAN:
        p = os.path.join(OUT, f"sg2_{sid}.mp4")
        vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30"
        if vfx: vf += "," + vfx
        run(["ffmpeg", "-v", "error", "-ss", str(ss), "-i", os.path.join(G, f), "-t", f"{dur:.3f}",
             "-vf", vf, "-an", "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-y", p])
        parts.append(p); starts[sid] = t; t += dur
    total = t
    lst = os.path.join(OUT, "concat_sg2.txt")
    open(lst, 'w', encoding='utf-8').write("".join(f"file '{p}'\n".replace("\\", "/") for p in parts))
    joined = os.path.join(OUT, "sg2_joined.mp4")
    run(["ffmpeg", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-y", joined])
    graded = os.path.join(OUT, "sg2_graded.mp4")
    run(["ffmpeg", "-v", "error", "-i", joined, "-vf",
         "eq=saturation=1.04:contrast=1.02,vignette=PI/5.5,noise=alls=5:allf=t",
         "-c:v", "libx264", "-crf", "23", "-preset", "medium", "-y", graded])
    ins, filters, mixin, idx = [graded], [], [], 1
    for sid, _, _, _, vo, _ in PLAN:
        if not vo: continue
        ins.append(os.path.join(G, vo))
        ms = int(starts[sid] * 1000)
        filters.append(f"[{idx}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[v{idx}]")
        mixin.append(f"[v{idx}]"); idx += 1
    ins.append(MUSIC)
    filters.append(f"[{idx}:a]atrim=start={MUS_OFFSET},asetpts=PTS-STARTPTS,"
                   f"aresample=48000,aformat=channel_layouts=stereo,volume=0.38[mus]")
    filters.append("".join(mixin) + f"amix=inputs={len(mixin)}:duration=longest:normalize=0,"
                   "acompressor=threshold=-16dB:ratio=3:attack=5:release=150:makeup=2[voall]")
    filters.append("[voall]asplit=2[vok][vom]")
    filters.append("[mus][vok]sidechaincompress=threshold=0.06:ratio=6:attack=20:release=350[md]")
    filters.append("[vom][md]amix=inputs=2:duration=first:normalize=0,apad,alimiter=limit=0.89:level=false[a]")
    final = os.path.join(OUT, "segment_test_v2.mp4")
    cmd = ["ffmpeg", "-v", "error"]
    for i_ in ins: cmd += ["-i", i_]
    cmd += ["-filter_complex", ";".join(filters), "-map", "0:v", "-map", "[a]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
            "-t", f"{total:.3f}", "-y", final]
    run(cmd)
    print("FINAL:", final, f"({total:.1f}s)")

if __name__ == "__main__":
    main()

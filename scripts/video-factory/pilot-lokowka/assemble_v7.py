"""Pelne video v6 (~29 s): sceny cielesne = Motion Control z ruchem oryginalu,
mechanika = FLF, mowione = OmniHuman; timing bliski oryginalowi; regu造 0/0b SSOT.
Wynik: lokowka/out/ad_v7.mp4"""
import os, subprocess

BASE = r"C:\tmp\video-factory\lokowka"
G, OUT = os.path.join(BASE, 'gen'), os.path.join(BASE, 'out')

# (id, plik, ss, dur, vo, vf_extra)
PLAN = [
    ("h1",     "r5_h1_fix.mp4",  0.0, 2.3, "vo3_h1.mp3",   "eq=brightness=0.02:saturation=1.03,unsharp=5:5:0.5"),
    ("h2",     "r5_h2.mp4",      0.0, 1.0, "vo3_h2.mp3",   "crop=iw/1.55:ih/1.55:(iw-iw/1.55)/2:(ih-ih/1.55)/3.5,scale=1080:1920"),
    ("load",   "v2_load.mp4",    0.5, 2.9, "vo3_load.mp3", None),
    ("mech",   "v2_mech.mp4",    0.0, 2.6, None, "eq=brightness=-0.02:saturation=1.05,unsharp=5:5:0.3"),
    ("wait",   "r5_wait.mp4",    0.0, 1.5, "vo3_wait.mp3", "eq=brightness=0.02:saturation=1.03,unsharp=5:5:0.5"),
    ("release","v2_release.mp4", 0.3, 2.4, None,           None),
    ("react",  "v7_react_fix.mp4", 0.2, 3.3, "vo3_react.mp3","hflip"),
    ("prog",   "v7_prog.mp4",    0.2, 4.2, "vo3_prog.mp3", None),
    ("mech2",  "r5_mech2.mp4",   0.0, 2.0, "vo3_mech2.mp3","eq=brightness=0.02:saturation=1.03,unsharp=5:5:0.5"),
    ("shake",  "v7_shake.mp4",   0.2, 3.1, "vo3_shake.mp3",None),
    ("mirror", "v6_mirror.mp4",  0.2, 3.8, "vo3_mirror.mp3",None),
    ("cta",    "r5_cta.mp4",     0.0, 2.1, "vo3_cta.mp3",  "eq=brightness=0.02:saturation=1.03,unsharp=5:5:0.5"),
]
MUSIC, MUS_OFFSET = os.path.join(G, "music_v3.wav"), 0.0

def run(a):
    r = subprocess.run(a, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0: raise RuntimeError(r.stderr[-600:])

def main():
    os.makedirs(OUT, exist_ok=True)
    parts, t, starts = [], 0.0, {}
    for sid, f, ss, dur, _, vfx in PLAN:
        p = os.path.join(OUT, f"v6_{sid}.mp4")
        vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30"
        if vfx: vf += "," + vfx
        run(["ffmpeg", "-v", "error", "-ss", str(ss), "-i", os.path.join(G, f), "-t", f"{dur:.3f}",
             "-vf", vf, "-an", "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-y", p])
        parts.append(p); starts[sid] = t; t += dur
    total = t
    lst = os.path.join(OUT, "concat_v6.txt")
    open(lst, 'w', encoding='utf-8').write("".join(f"file '{p}'\n".replace("\\", "/") for p in parts))
    joined = os.path.join(OUT, "v6_joined.mp4")
    run(["ffmpeg", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-y", joined])
    graded = os.path.join(OUT, "v6_graded.mp4")
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
    ws, we = starts["mech"], starts["react"]
    ms_, me_ = starts["mirror"], starts["mirror"] + 3.8
    filters.append(
        f"[{idx}:a]aresample=48000,aformat=channel_layouts=stereo,atempo={30.0/ (total+1.0):.3f}" if False else
        f"[{idx}:a]aresample=48000,aformat=channel_layouts=stereo,atempo=0.95,"
        f"volume=0.40,volume=enable='between(t,{ws:.2f},{we:.2f})':volume=0.15,"
        f"volume=enable='between(t,{ms_:.2f},{me_:.2f})':volume=1.5[mus]")
    filters.append("".join(mixin) + f"amix=inputs={len(mixin)}:duration=longest:normalize=0,"
                   "acompressor=threshold=-16dB:ratio=3:attack=5:release=150:makeup=2[voall]")
    filters.append("[voall]asplit=2[vok][vom]")
    filters.append("[mus][vok]sidechaincompress=threshold=0.06:ratio=6:attack=20:release=350[md]")
    filters.append("[vom][md]amix=inputs=2:duration=first:normalize=0,apad,alimiter=limit=0.89:level=false[a]")
    final = os.path.join(OUT, "ad_v7.mp4")
    cmd = ["ffmpeg", "-v", "error"]
    for i_ in ins: cmd += ["-i", i_]
    cmd += ["-filter_complex", ";".join(filters), "-map", "0:v", "-map", "[a]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
            "-t", f"{total:.3f}", "-y", final]
    run(cmd)
    print("FINAL:", final, f"({total:.1f}s)")

if __name__ == "__main__":
    main()

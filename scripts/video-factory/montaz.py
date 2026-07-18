"""Generyczny montaz sterowany PLANEM. RDZEN. Wbudowane regu造 SSOT 0/0b:
grade-match per scena (vf_extra), globalne ziarno-zszywka, kwestie VO na startach scen,
muzyka z automatyka (dip/kulminacja) + sidechain ducking, limiter zamiast loudnorm, 48 kHz.

PLAN: lista scen dict:
  {id, plik, ss=0.0, dur (None=dlugosc klipu-0.05), vo=None, vf_extra=None}
AUDIO_CFG: {music, mus_offset=0.0, mus_tempo=1.0, dip=(id_od,id_do)|None, peak=id|None,
  music_gain=0.65, dip_gain=0.30, peak_gain=1.5, duck_ratio=3, duck_thr=0.09, duck_release=250}
MIKS (feedback Tomka 18.07 "muzyka ledwo slyszalna"): baza 0.65 + lagodny ducking ratio 3
= muzyka NIESIE emocje i wraca miedzy zdaniami; stare 0.40+ratio 6 dusily podklad do zera.
Uzycie: build(plan, audio_cfg, gen_dir, out_path)
Gotcha: unsharp maska musi byc NIEPARZYSTA (5:5), nie 6:6.
"""
import os, subprocess

def _run(a):
    r = subprocess.run(a, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0: raise RuntimeError(r.stderr[-600:])

def _dur(p):
    return float(subprocess.check_output(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                                          '-of', 'csv=p=0', p]).decode().strip())

def build(plan, audio, gen_dir, out_path, require_pass=True):
    """require_pass: kazda scena musi miec <plik-bez-ext>.pass od qa_gate (bramka egzekwowalna).
    Bypass TYLKO swiadomie: require_pass=False (np. czysty remontaz juz zbramkowanego materialu)."""
    outdir = os.path.dirname(out_path); os.makedirs(outdir, exist_ok=True)
    parts, t, starts, ends = [], 0.0, {}, {}
    for sc in plan:
        src = os.path.join(gen_dir, sc["plik"])
        if require_pass and not os.path.exists(os.path.splitext(src)[0] + ".pass"):
            raise RuntimeError(f"BRAMKA: brak {sc['plik']}.pass — klip nie przeszedl qa_gate (lub uzyj require_pass=False)")
        d = sc.get("dur") or (_dur(src) - 0.05)
        p = os.path.join(outdir, f"part_{sc['id']}.mp4")
        vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30"
        if sc.get("vf_extra"): vf += "," + sc["vf_extra"]
        _run(["ffmpeg", "-v", "error", "-ss", str(sc.get("ss", 0.0)), "-i", src, "-t", f"{d:.3f}",
              "-vf", vf, "-an", "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-y", p])
        parts.append(p); starts[sc["id"]] = t; t += d; ends[sc["id"]] = t
    total = t
    lst = os.path.join(outdir, "concat.txt")
    open(lst, 'w', encoding='utf-8').write("".join(f"file '{x}'\n".replace("\\", "/") for x in parts))
    joined = os.path.join(outdir, "_joined.mp4")
    _run(["ffmpeg", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-y", joined])
    graded = os.path.join(outdir, "_graded.mp4")
    _run(["ffmpeg", "-v", "error", "-i", joined, "-vf",
          "eq=saturation=1.04:contrast=1.02,vignette=PI/5.5,noise=alls=5:allf=t",
          "-c:v", "libx264", "-crf", "23", "-preset", "medium", "-y", graded])
    ins, filters, mixin, idx = [graded], [], [], 1
    prev_vo_end = 0.0
    for sc in plan:
        if not sc.get("vo"): continue
        vo_len = _dur(os.path.join(gen_dir, sc["vo"]))
        if starts[sc["id"]] < prev_vo_end - 0.05:
            print(f"[montaz] UWAGA: VO sceny {sc['id']} nachodzi na poprzednie (start "
                  f"{starts[sc['id']]:.2f} < koniec {prev_vo_end:.2f}) — patrz PROCEDURA: regula VO>scena")
        prev_vo_end = starts[sc["id"]] + vo_len
        ins.append(os.path.join(gen_dir, sc["vo"]))
        ms = int(starts[sc["id"]] * 1000)
        filters.append(f"[{idx}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[v{idx}]")
        mixin.append(f"[v{idx}]"); idx += 1
    ins.append(audio["music"])
    mchain = f"[{idx}:a]aresample=48000,aformat=channel_layouts=stereo"
    if audio.get("mus_offset"): mchain += f",atrim=start={audio['mus_offset']},asetpts=PTS-STARTPTS"
    if audio.get("mus_tempo") and audio["mus_tempo"] != 1.0: mchain += f",atempo={audio['mus_tempo']}"
    mg = audio.get("music_gain", 0.65)
    mchain += ',loudnorm=I=-16:TP=-2:LRA=9'  # normalizacja utworu PRZED gainem (lo-fi z generatora bywa cichy z natury)
    mchain += f",volume={mg}"
    if audio.get("dip"):
        a, b = starts[audio["dip"][0]], ends[audio["dip"][1]]
        mchain += f",volume=enable='between(t,{a:.2f},{b:.2f})':volume={audio.get('dip_gain', 0.30) / mg:.3f}"
    if audio.get("peak"):
        a, b = starts[audio["peak"]], ends[audio["peak"]]
        mchain += f",volume=enable='between(t,{a:.2f},{b:.2f})':volume={audio.get('peak_gain', 1.5)}"
    filters.append(mchain + "[mus]")
    filters.append("".join(mixin) + f"amix=inputs={len(mixin)}:duration=longest:normalize=0,"
                   "acompressor=threshold=-16dB:ratio=3:attack=5:release=150:makeup=2[voall]")
    filters.append("[voall]asplit=2[vok][vom]")
    filters.append(f"[mus][vok]sidechaincompress=threshold={audio.get('duck_thr', 0.09)}:"
                   f"ratio={audio.get('duck_ratio', 3)}:attack=20:release={audio.get('duck_release', 250)}[md]")
    filters.append("[vom][md]amix=inputs=2:duration=first:normalize=0,apad,alimiter=limit=0.89:level=false[a]")
    cmd = ["ffmpeg", "-v", "error"]
    for i_ in ins: cmd += ["-i", i_]
    cmd += ["-filter_complex", ";".join(filters), "-map", "0:v", "-map", "[a]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
            "-t", f"{total:.3f}", "-y", out_path]
    _run(cmd)
    return out_path, total

# Refiner SeedVR2 -> WYLACZNIE refine.py (chunki <=4.8 s; model tnie dluzsze wejscie do 5 s).
# Dawny refine_seedvr() z tego pliku slal caly final 1 callem = ucieta odpowiedz + desync audio — USUNIETY.

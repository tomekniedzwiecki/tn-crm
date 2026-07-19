"""Generyczny montaz sterowany PLANEM. RDZEN. Wbudowane regu造 SSOT 0/0b/0h:
grade-match per scena (vf_extra), globalne ziarno-zszywka, kwestie VO na startach scen,
muzyka z automatyka (dip/kulminacja) + sidechain ducking, WARSTWA SFX/AMBIENT (0h),
micro-handheld domyslnie ON, limiter + normalizacja do -14 LUFS, 48 kHz.

PLAN: lista scen dict:
  {id, plik, ss=0.0, dur (None=dlugosc klipu-0.05), vo=None, vf_extra=None,
   handheld=True (False = swiadomy opt-out, np. celowo przybity hero),
   has_physical_action=bool, sfx=[{plik, at (s od startu SCENY), gain=0.8}]}
AUDIO_CFG: {music, mus_offset=0.0, mus_tempo=1.0, dip=(id_od,id_do)|None, peak=id|None,
  music_gain=0.65, dip_gain=0.30, peak_gain=1.5, duck_ratio=3, duck_thr=0.09,
  duck_release=250, ambient={plik, gain=0.12}|None}
MIKS (feedback Tomka 18.07 "muzyka ledwo slyszalna"): baza 0.65 + lagodny ducking ratio 3
= muzyka NIESIE emocje i wraca miedzy zdaniami; stare 0.40+ratio 6 dusily podklad do zera.
SFX/ambient ida OSOBNA galezia (bez sidechain!) - dzwiek akcji nie moze byc duszony przez VO.
BRAMKA require_sfx (0h): scena z has_physical_action=true i pustym sfx = ODMOWA montazu
(lustro require_pass) - "dzwiek na akcje" jest regula, nie sugestia.
Uzycie: build(plan, audio_cfg, gen_dir, out_path)
Gotchas: unsharp maska NIEPARZYSTA (5:5); ambient generuj >= dlugosci kreacji (brak petli,
krotszy = apad cisza); LUFS normalizowany na koncu pomiarem ebur128 (mierz-i-przesun,
NIE loudnorm - zachowuje LRA/dynamike).
"""
import os, re, subprocess

def _run(a):
    r = subprocess.run(a, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0: raise RuntimeError(r.stderr[-600:])

def _dur(p):
    return float(subprocess.check_output(['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                                          '-of', 'csv=p=0', p]).decode().strip())

def _lufs(p):
    """Zintegrowany LUFS (ebur128) albo None gdy nie da sie zmierzyc."""
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-map', '0:a', '-af', 'ebur128',
                        '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='replace')
    m = re.findall(r'I:\s+(-?\d+\.?\d*)\s+LUFS', r.stderr or '')
    return float(m[-1]) if m else None

def _hh(si):
    """Organiczny micro-handheld: translacja +-1% jako suma 2 niewspolmiernych sinusow,
    faza per scena (si) - ciecia nie dziela rytmu. Amplituda <=1.5% (wiecej = gadzet)."""
    p = 1.7 * si
    x = f"(iw-1080)/2+9*sin(2*PI*t*0.43+{p:.2f})+5*sin(2*PI*t*1.17+{p + 2.1:.2f})"
    y = f"(ih-1920)/2+11*sin(2*PI*t*0.31+{p + 0.9:.2f})+6*sin(2*PI*t*0.97+{p + 3.4:.2f})"
    return f"scale=1124:2000:force_original_aspect_ratio=increase,crop=1080:1920:x='{x}':y='{y}',fps=30"

def build(plan, audio, gen_dir, out_path, require_pass=True, require_sfx=True,
          require_fidelity=True, handheld=True):
    """require_pass: kazda scena musi miec <plik-bez-ext>.pass od qa_gate (bramka egzekwowalna).
    require_sfx: scena z has_physical_action=true MUSI miec sfx (bramka 0h "dzwiek na akcje").
    require_fidelity: gen_dir musi miec fidelity.pass od product_gate (bramka 0i WIERNOSCI —
    per-element vs packshot + kontrakt uzycia + identity board miedzy scenami).
    handheld: micro-shake domyslnie ON; opt-out per scena polem handheld=false (logowany).
    Bypass TYLKO swiadomie (np. czysty remontaz juz zbramkowanego materialu)."""
    outdir = os.path.dirname(out_path); os.makedirs(outdir, exist_ok=True)
    if require_fidelity and not os.path.exists(os.path.join(gen_dir, "fidelity.pass")):
        raise RuntimeError("BRAMKA 0i WIERNOSCI: brak fidelity.pass — product_gate nie potwierdzil "
                           "wiernosci produktu (per-element + demo-kontrakt + identity board); "
                           "uruchom KROK 7.5 (lub swiadomie require_fidelity=False)")
    for sc in plan:
        if require_sfx and sc.get("has_physical_action") and not sc.get("sfx"):
            raise RuntimeError(f"BRAMKA 0h: scena {sc['id']} ma has_physical_action=true i ZERO sfx "
                               f"— kazde widoczne zdarzenie fizyczne dostaje foley-hit (lub require_sfx=False)")
    parts, t, starts, ends = [], 0.0, {}, {}
    for si, sc in enumerate(plan):
        src = os.path.join(gen_dir, sc["plik"])
        if require_pass and not os.path.exists(os.path.splitext(src)[0] + ".pass"):
            raise RuntimeError(f"BRAMKA: brak {sc['plik']}.pass — klip nie przeszedl qa_gate (lub uzyj require_pass=False)")
        d = sc.get("dur") or (_dur(src) - 0.05)
        p = os.path.join(outdir, f"part_{sc['id']}.mp4")
        if handheld and sc.get("handheld", True):
            vf = _hh(si)
        else:
            vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30"
            print(f"[montaz] scena {sc['id']}: handheld OPT-OUT (statyw swiadomy)")
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
    # ── SFX: dzwiek na akcje (0h) — osobne wejscia, adelay na absolutny timestamp sceny+at
    sfx_lbls = []
    for sc in plan:
        for s in (sc.get("sfx") or []):
            ins.append(os.path.join(gen_dir, s["plik"]))
            ms = int((starts[sc["id"]] + float(s.get("at", 0.0))) * 1000)
            filters.append(f"[{idx}:a]aresample=48000,aformat=channel_layouts=stereo,"
                           f"volume={s.get('gain', 0.8)},adelay={ms}|{ms}[sf{len(sfx_lbls)}]")
            sfx_lbls.append(f"[sf{len(sfx_lbls)}]"); idx += 1
    amb = audio.get("ambient")
    if amb:
        ins.append(amb["plik"] if os.path.isabs(str(amb["plik"])) else os.path.join(gen_dir, amb["plik"]))
        filters.append(f"[{idx}:a]aresample=48000,aformat=channel_layouts=stereo,apad,"
                       f"atrim=0:{total:.3f},volume={amb.get('gain', 0.12)}[amb]")
        sfx_lbls.append("[amb]"); idx += 1
    if len(sfx_lbls) == 1:
        filters.append(sfx_lbls[0] + "anull[sfxall]")
    elif sfx_lbls:
        filters.append("".join(sfx_lbls) + f"amix=inputs={len(sfx_lbls)}:duration=longest:normalize=0[sfxall]")
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
    # apad+atrim do PELNEJ dlugosci: sidechaincompress konczy MUZYKE razem z KLUCZEM — bez tego
    # muzyka urywa sie w momencie konca ostatniego VO (stolik 19.07: ogon 14.2-15.0 s bez muzyki;
    # w masazerze niewidoczne, bo VO siegalo konca kreacji).
    filters.append("".join(mixin) + f"amix=inputs={len(mixin)}:duration=longest:normalize=0,"
                   "acompressor=threshold=-16dB:ratio=3:attack=5:release=150:makeup=2,"
                   f"apad,atrim=0:{total:.3f}[voall]")
    filters.append("[voall]asplit=2[vok][vom]")
    filters.append(f"[mus][vok]sidechaincompress=threshold={audio.get('duck_thr', 0.09)}:"
                   f"ratio={audio.get('duck_ratio', 3)}:attack=20:release={audio.get('duck_release', 250)}[md]")
    fin = "[vom][md]" + ("[sfxall]" if sfx_lbls else "")
    filters.append(fin + f"amix=inputs={3 if sfx_lbls else 2}:duration=longest:normalize=0,"
                   "apad,alimiter=limit=0.89:level=false[a]")
    cmd = ["ffmpeg", "-v", "error"]
    for i_ in ins: cmd += ["-i", i_]
    cmd += ["-filter_complex", ";".join(filters), "-map", "0:v", "-map", "[a]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
            "-t", f"{total:.3f}", "-y", out_path]
    _run(cmd)
    # ── normalizacja platformowa: mierz-i-przesun do -14 LUFS (Meta/TikTok i tak normalizuja;
    # pojedynczy offset gainu zachowuje LRA — celowo NIE loudnorm na finale)
    lufs = _lufs(out_path)
    if lufs is not None and abs(-14.0 - lufs) > 0.5:
        delta = max(-6.0, min(6.0, -14.0 - lufs))
        tmp = out_path + ".lufs.mp4"
        _run(["ffmpeg", "-v", "error", "-i", out_path, "-map", "0:v", "-map", "0:a", "-c:v", "copy",
              "-af", f"volume={delta:.1f}dB,alimiter=limit=0.97:level=false",
              "-c:a", "aac", "-b:a", "192k", "-y", tmp])
        os.replace(tmp, out_path)
        print(f"[montaz] LUFS {lufs:.1f} -> -14.0 (offset {delta:+.1f} dB)")
    return out_path, total

# Refiner SeedVR2 -> WYLACZNIE refine.py (chunki <=4.8 s; model tnie dluzsze wejscie do 5 s).
# Dawny refine_seedvr() z tego pliku slal caly final 1 callem = ucieta odpowiedz + desync audio — USUNIETY.

"""NAPISY stylu rolek (word-by-word pop, aktywne slowo zolte) — opcjonalny krok po montazu.
RDZEN. Zawsze DWIE wersje: oryginal bez napisow + <nazwa>_subs.mp4 z wypalonymi.

Pipeline: faster-whisper (word_timestamps, PL, CPU, $0) -> grupowanie 1-3 slowa ->
ASS (Montserrat Black 132, wersaliki, bialy + obrys 8, aktywne slowo #F7C204 + pop \\t)
-> ffmpeg subtitles=...:fontsdir=C:/tmp/video-factory/fonts (Montserrat-Black.ttf tam lezy).

Uzycie: python napisy.py <final.mp4> [znany_skrypt.txt]
Gotchas: .ass w UTF-8; Fontname='Montserrat Black' DOKLADNIE (literowka = ciche DejaVu);
sciezki w filtrze wzgledne (cd do katalogu pliku); test PL glifow na klatce po pierwszym
renderze (a/l/z z ogonkami!); \\t w ms; pozycja an5 srodek ~58% wysokosci (unik UI TikToka).
"""
import os, subprocess, sys

FONTS_DIR = r"C:/tmp/video-factory/fonts"
YELLOW = r"\1c&H0004C2F7&"   # F7C204 w BGR

def word_timestamps(wav, known_text=None):
    from faster_whisper import WhisperModel
    m = WhisperModel("small", device="cpu", compute_type="int8")
    kw = {"language": "pl", "word_timestamps": True, "vad_filter": True}
    if known_text: kw["initial_prompt"] = known_text[:200]
    segs, _ = m.transcribe(wav, **kw)
    return [(w.word.strip(), w.start, w.end) for s in segs for w in s.words if w.word.strip()]

def group_words(words, max_n=3, max_gap=0.35, max_chars=14):
    """Frazy 1-3 slowa, ALE tez limit ~14 znakow na ekran (przy 132 px wiecej NIE miesci sie
    w 1080 px — incydent 'PODSTAWKA GLOSNIK LADOWARKA' za kadrem). Nowa fraza przy pauzie
    > max_gap (oddech lektora = nowy ekran)."""
    out, cur, chars = [], [], 0
    for w in words:
        wl = len(w[0])
        if cur and (len(cur) >= max_n or chars + 1 + wl > max_chars or w[1] - cur[-1][2] > max_gap):
            out.append(cur); cur, chars = [], 0
        cur.append(w); chars += (1 if chars else 0) + wl
    if cur: out.append(cur)
    return out

def _font_size(phrase):
    """Skaluj w dol dla dlugich pojedynczych slow (np. 'BEZPRZEWODOWO' 13 zn > 14 limitu frazy)."""
    n = sum(len(w[0]) for w in phrase) + len(phrase) - 1
    if n <= 10: return None
    return max(84, int(132 * 10.5 / n))

def _ts(t):
    h, rem = divmod(max(0.0, t), 3600); m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"

def build_ass(words, out_path):
    head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Pop,Montserrat Black,132,&H00FFFFFF,&H000000FF,&H00000000,&H96000000,-1,0,0,0,100,100,0,0,1,8,2,5,60,60,180,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = []
    for phrase in group_words(words):
        fs = _font_size(phrase)                      # auto-zmniejszenie dla dlugich fraz/slow
        fstag = f"\\fs{fs}" if fs else ""
        # jedna linia Dialogue PER SLOWO frazy: cala fraza widoczna, aktywne slowo zolte+pop
        for i, (w, ws, we) in enumerate(phrase):
            parts = []
            for j, (w2, _, _) in enumerate(phrase):
                t = w2.upper()
                if j == i:
                    parts.append(r"{\fscx100\fscy100\t(0,90,\fscx113\fscy113)\t(90,180,\fscx100\fscy100)" + YELLOW + r"}" + t + r"{\r}")
                else:
                    parts.append(t)
            end = we if i < len(phrase) - 1 else we + 0.12
            lines.append(f"Dialogue: 0,{_ts(ws)},{_ts(end)},Pop,,0,0,0,,{{\\an5\\pos(540,1120)\\fad(40,0){fstag}}}" + " ".join(parts))
    open(out_path, "w", encoding="utf-8").write(head + "\n".join(lines) + "\n")
    return out_path

def burn(final_mp4, known_text=None):
    workdir = os.path.dirname(os.path.abspath(final_mp4))
    base = os.path.splitext(os.path.basename(final_mp4))[0]
    wav = os.path.join(workdir, base + "_vo16k.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-i", final_mp4, "-vn", "-ac", "1", "-ar", "16000", "-y", wav], check=True)
    words = word_timestamps(wav, known_text)
    if not words: raise RuntimeError("brak slow z whispera")
    ass = build_ass(words, os.path.join(workdir, base + ".ass"))
    out = os.path.join(workdir, base + "_subs.mp4")
    import shutil
    shutil.copy(os.path.join(FONTS_DIR, "Montserrat-Black.ttf"), workdir)  # fontsdir=. bez smieci sciezek
    # cd do workdir -> wzgledne sciezki (unik pulapki C\: w filtrze)
    subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.basename(final_mp4),
                    "-vf", f"subtitles={os.path.basename(ass)}:fontsdir=.",
                    "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
                    "-c:a", "copy", "-y", os.path.basename(out)], cwd=workdir, check=True)
    return out

if __name__ == "__main__":
    txt = open(sys.argv[2], encoding="utf-8").read() if len(sys.argv) > 2 else None
    print(burn(sys.argv[1], txt))

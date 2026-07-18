"""Montaz finalny: trim scen wg blueprintu -> normalizacja 1080x1920/30fps -> concat
-> napisy PL (drawtext, UTF-8 textfiles) -> mix lektorki. Wynik: lokowka/out/ad_v1.mp4"""
import json, os, re, subprocess, sys

BASE = r"C:\tmp\video-factory\lokowka"
G, OUT = os.path.join(BASE, 'gen'), os.path.join(BASE, 'out')
FONT = "C\\:/Windows/Fonts/arialbd.ttf"

# (id, plik, docelowa dlugosc s)  — s00 z kalibracji
PLAN = [
    ("0",  os.path.join(G, "s00_kling.mp4"), 1.671),
    ("1",  os.path.join(G, "c1_v1.mp4"),  0.669),
    ("2",  os.path.join(G, "c2_v1.mp4"),  0.936),
    ("7",  os.path.join(G, "c7_v1.mp4"),  2.607),
    ("8b", os.path.join(G, "c8b_v1.mp4"), 5.0),
    ("11", os.path.join(G, "c11_v1.mp4"), 5.0),
    ("13", os.path.join(G, "c13_v1.mp4"), 5.0),
    ("14", os.path.join(G, "c14_v1.mp4"), 3.2),
]
# napisy: (start_scena_id, koniec_scena_id_wlacznie, tekst)
TEXTS = [
    ("0", "2",  "TESTUJĘ VIRALOWĄ LOKÓWKĘ"),
    ("7", "7",  "pierwszy lok w 10 sekund"),
    ("8b", "8b", "jeden przycisk — sama nawija"),
    ("11", "11", "0 wprawy, a wygląda jak od fryzjera"),
    ("13", "13", "kilka godzin później — dalej trzyma"),
    ("14", "14", "sprawdź, zanim zniknie"),
]

def run(args):
    r = subprocess.run(args, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0:
        raise RuntimeError(f"ffmpeg fail: {' '.join(args[:6])}...\n{r.stderr[-800:]}")

def main():
    os.makedirs(OUT, exist_ok=True)
    # 1) trim + normalizacja
    parts, t, spans = [], 0.0, {}
    for sid, f, dur in PLAN:
        ls = os.path.join(G, f"ls_{sid}.mp4")   # wersja po lip-syncu ma pierwszenstwo
        if os.path.exists(ls): f = ls
        if not os.path.exists(f): raise SystemExit(f"BRAK KLIPU: {f}")
        p = os.path.join(OUT, f"part_{sid}.mp4")
        run(["ffmpeg", "-v", "error", "-i", f, "-t", f"{dur:.3f}",
             "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30",
             "-an", "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-y", p])
        parts.append(p); spans[sid] = (t, t + dur); t += dur
    total = t
    # 2) concat
    lst = os.path.join(OUT, "concat.txt")
    open(lst, 'w', encoding='utf-8').write("".join(f"file '{p}'\n".replace("\\", "/") for p in parts))
    joined = os.path.join(OUT, "joined.mp4")
    run(["ffmpeg", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-y", joined])
    # 3) napisy (textfile per napis, UTF-8 bez BOM)
    filters = []
    for k, (a, b, txt) in enumerate(TEXTS):
        tf = os.path.join(OUT, f"txt{k}.txt")
        open(tf, 'w', encoding='utf-8').write(re.sub(r'[\U00010000-\U0010FFFF]', '', txt))
        t0, t1 = spans[a][0], spans[b][1]
        tfe = tf.replace("\\", "/").replace(":", "\\:")
        filters.append(
            f"drawtext=fontfile='{FONT}':textfile='{tfe}':fontcolor=white:fontsize=58:"
            f"borderw=4:bordercolor=black@0.85:x=(w-text_w)/2:y=h*0.14:"
            f"enable='between(t,{t0:.3f},{t1:.3f})'")
    fscript = os.path.join(OUT, "filters.txt")
    open(fscript, 'w', encoding='utf-8').write(",".join(filters))
    titled = os.path.join(OUT, "titled.mp4")
    run(["ffmpeg", "-v", "error", "-i", joined, "-filter_complex_script", fscript,
         "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-y", titled])
    # 4) lektorka 1.1x + mix
    vo = os.path.join(G, "vo_pl_v2.mp3")
    final = os.path.join(OUT, "ad_v2.mp4")
    run(["ffmpeg", "-v", "error", "-i", titled, "-i", vo,
         "-filter_complex", "[1:a]atempo=1.15,adelay=300|300,apad[a]",
         "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
         "-t", f"{total:.3f}", "-y", final])
    print("FINAL:", final, f"({total:.1f}s)")

if __name__ == '__main__':
    main()

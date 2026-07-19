# -*- coding: utf-8 -*-
"""SZABLON PRZEBIEGU fabryki AI-video — WZORZEC RÓWNOLEGŁOŚCI (kopiuj per projekt).

Cel: usunąć sekwencyjny narzut operatora (~40-60 min -> ~10-15 min). Zamiast `fal.gen()`
w pętli (BLOKUJĄCY: submit+poll+download naraz => generacje leca jedna po drugiej) używamy
`fal.gen_batch()` (submit-all -> poll-all -> download, okno przesuwne) + `render.render_scenes()`
(już równoległy). Audio nie ma zależności => leci JEDNĄ falą razem z klatkami-FIRST, schodząc
z krytycznej ścieżki. Klatki-LAST/chainowane zależą od FIRST => druga fala.

STRUKTURA (co startuje razem, co na co czeka):
  FALA A (jeden gen_batch): wszystkie klatki-FIRST (niezależne) + CAŁE audio (music/ambient/VO/SFX)
  FALA B (drugi gen_batch): klatki-LAST + klatki chainowane z persony/hooka (zależą od FIRST)
  BRAMKA klatek (agent, samoakcept #2 + log)
  RENDER  render.render_scenes(...) — równoległy; W TLE: panel-sync + siatki QA klipów, które JUŻ spadły
  BRAMKA qa_gate + product_gate (KROK 7/7.5, nie-samoakceptowalna)
  MONTAŻ  montaz.build(...) + napisy (lokalne)

WSPÓLNE KONTO fal: max_parallel=8 (nie głodź drugiej sesji; okno PRZESUWNE, nie sztywne fale).
Różne biegi = różne project= (izolacja kosztów w ledgerze).

Uzupełnij per projekt: SLUG, ścieżki, oraz funkcje *_spec() zwracające listy jobów.
Prompty/refy zostają w plikach projektu (KARTA.json, blueprint.json) — TEN plik to ORKIESTRACJA.
"""
import os, sys, json, subprocess
sys.path.insert(0, r"C:/tmp/video-factory/tools")
import fal, render

# ── KONFIG PER PROJEKT ────────────────────────────────────────────────────────
SLUG = "SZABLON"                                  # <- slug projektu (== katalog projekty/<slug>)
BASE = rf"C:\tmp\video-factory\{SLUG}"
GEN  = os.path.join(BASE, "gen"); os.makedirs(GEN, exist_ok=True)
REFS = os.path.join(BASE, "refs")
MAX_PARALLEL = 8                                  # wspólne konto fal — okno przesuwne

fal.set_project(SLUG)

# ── SPECYFIKACJE JOBÓW (wypełnij treścią z KARTA.json / blueprint.json) ─────────
# Każdy job = {model, payload, tag}. tag == nazwa pliku wyjściowego BEZ rozszerzenia
# (gen_batch pobierze GEN/<tag>.<ext>; ext z wyniku: image->.png, audio->.mp3, video->.mp4).

def frames_first_spec():
    """Klatki-FIRST — WZAJEMNIE NIEZALEŻNE (jedna fala). Referencje: packshot/persona-ref
    już zapisane w store (fal.store). Zwraca listę jobów nano-banana/edit."""
    # PRZYKŁAD (podmień na realne prompty/refy z genframes projektu):
    # pack = fal.store(os.path.join(REFS, "packshot.png"), f"{SLUG}/pack")
    # return [
    #   {"model": "fal-ai/nano-banana/edit", "tag": "hook_first",
    #    "payload": {"prompt": PROMPT_HOOK, "image_urls": [pack], "num_images": 1,
    #                "output_format": "png", "aspect_ratio": "9:16"}},
    #   {"model": "fal-ai/nano-banana/edit", "tag": "heads_first", "payload": {...}},
    # ]
    return []

def frames_last_spec(firsts):
    """Klatki-LAST i chainowane z persony — ZALEŻĄ od FIRST (druga fala).
    `firsts` = dict {tag: ścieżka} zwrócony przez gen_batch fali A — użyj fal.store(GEN/<tag>.png)
    jako Image 1 (baza) + re-injekcja packshotu jako Image 2 (correct drift)."""
    # PRZYKŁAD:
    # hook_url = fal.store(firsts["hook_first"], f"{SLUG}/hook_first")
    # return [{"model": "fal-ai/nano-banana/edit", "tag": "cta_last",
    #          "payload": {"prompt": PROMPT_CTA_LAST, "image_urls": [hook_url, pack], ...}}]
    return []

def audio_spec():
    """CAŁE audio — muzyka + ambient + VO×N + SFX×N. ZERO zależności => leci w Fali A razem
    z klatkami-FIRST. SFX generujemy jako 10 s stable-audio i TNIEMY lokalnie po pobraniu
    (patrz trim_sfx). VO: teksty z plików UTF-8 (diakrytyki!). Zwraca (jobs, sfx_trims)."""
    jobs, sfx_trims = [], {}
    # PRZYKŁAD music/ambient:
    # jobs += [{"model": "fal-ai/stable-audio-25/text-to-audio", "tag": "music",
    #           "payload": {"prompt": MUSIC_PROMPT, "seconds_total": 25, "num_inference_steps": 8}}]
    # VO (osobny plik na kwestię, diakrytyki zweryfikowane PRZED submitem):
    # for tag, txt in VO.items():
    #     jobs.append({"model": "fal-ai/elevenlabs/tts/eleven-v3", "tag": tag,
    #                  "payload": {"text": txt, "voice": VOICE, "stability": 0.3}})
    # SFX jako <tag>_raw (10 s) — trim po pobraniu:
    # for tag, (prompt, trim, cont) in SFX.items():
    #     jobs.append({"model": "fal-ai/stable-audio-25/text-to-audio", "tag": tag + "_raw",
    #                  "payload": {"prompt": prompt, "seconds_total": 10, "num_inference_steps": 8}})
    #     sfx_trims[tag] = trim
    return jobs, sfx_trims

def scenes_spec(frames):
    """Sceny do render.render_scenes — silnik per scena z playbooka (kref/flf/mc/omnihuman).
    `frames` = komplet klatek (dict tag->ścieżka). Zwraca listę scen (patrz render_masazer.py)."""
    return []

# ── TRIM SFX (lokalny, po równoległym pobraniu 10 s klipów) ─────────────────────
def trim_sfx(sfx_trims):
    for tag, trim in sfx_trims.items():
        raw = os.path.join(GEN, tag + "_raw.mp3")
        if not os.path.exists(raw):
            print("SFX brak raw:", tag); continue
        out = os.path.join(GEN, tag + ".mp3")
        af = (f"silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:{trim},"
              f"afade=t=out:st={max(0.0, trim - 0.25):.2f}:d=0.25")
        subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-af", af, "-y", out], check=True)
        print("SFX trim", tag, "->", out)

# ── AUTO-PROFIL MUZYKI (stolik 19.07: Stable Audio wstawil BREAKDOWN -40 dB w srodku
# utworu; kreacja konczyla sie w dziurze = LOOP CLOSE bez muzyki; recznie kosztowalo
# ~15 min sledztwa — profil per 1 s wykrywa to w 5 s) ────────────────────────────
def check_music(path, kreacja_s=15.0, floor_db=-30.0):
    """Profil energii co 1 s w oknie 0..kreacja_s+1. Dziura (< floor_db) => WARNING
    z gotowa recepta (wytnij okno acrossfade=0.2 albo mus_offset). Zwraca liste dziur."""
    holes = []
    for s in range(0, int(kreacja_s) + 2):
        out = subprocess.run(["ffmpeg", "-v", "info", "-ss", str(s), "-t", "1", "-i", path,
                              "-af", "volumedetect", "-f", "null", "-"],
                             capture_output=True, text=True).stderr
        m = x = None
        for ln in out.splitlines():
            if "mean_volume" in ln: m = float(ln.split(":")[1].strip().split()[0])
            if "max_volume" in ln: x = float(ln.split(":")[1].strip().split()[0])
        # dziura = PRAWDZIWA cisza (mean pod progiem I max bez beatu); groove-pauzy
        # (mean niski, ale beat uderza max > -10) sa legalne — zestaw 19.07
        if m is not None and m < floor_db and (x is None or x < -10.0):
            holes.append((s, m))
    if holes:
        print(f"[MUZYKA] DZIURY ENERGII {holes} — wytnij okno (atrim+acrossfade=0.2) "
              f"lub przesun mus_offset; NIE montuj z dziura w oknie 0..{kreacja_s}s!")
    else:
        print(f"[MUZYKA] profil OK (0..{int(kreacja_s)+1}s bez dziur < {floor_db} dB)")
    return holes

# ── PRZEBIEG ────────────────────────────────────────────────────────────────────
def main():
    # KROK 0 — BRAMKA SALDA (nie zaczynaj biegu, którego nie dokończysz)
    fal.preflight(floor_usd=15)

    # FALA A — klatki-FIRST + CAŁE audio jednym batchem (RÓWNOLEGLE, okno przesuwne)
    audio_jobs, sfx_trims = audio_spec()
    firsts_jobs = frames_first_spec()
    fala_a = firsts_jobs + audio_jobs
    print(f"[przebieg] FALA A: {len(firsts_jobs)} klatek-FIRST + {len(audio_jobs)} audio "
          f"= {len(fala_a)} jobów RÓWNOLEGLE (max_parallel={MAX_PARALLEL})")
    got_a = fal.gen_batch(fala_a, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    trim_sfx(sfx_trims)                                    # lokalny trim SFX po pobraniu
    mp = os.path.join(GEN, "music.mp3")
    if os.path.exists(mp): check_music(mp)                 # dziury energii ZANIM cokolwiek dalej

    firsts = {t: p for t, p in got_a.items() if isinstance(p, str) and t.endswith("_first")}

    # FALA B — klatki-LAST/chainowane (zależą od FIRST)
    lasts_jobs = frames_last_spec(firsts)
    if lasts_jobs:
        print(f"[przebieg] FALA B: {len(lasts_jobs)} klatek-LAST (zależnych) RÓWNOLEGLE")
        got_b = fal.gen_batch(lasts_jobs, outdir=GEN, max_parallel=MAX_PARALLEL, project=SLUG)
    else:
        got_b = {}
    frames = {**got_a, **got_b}

    # BRAMKA KLATEK (KROK 5) — agent przegląda arkusz klatek-kluczy (samoakcept #2 + log w raporcie).
    # Tu: `qa_run`/arkusz + STOP jeśli klatka łamie kontrakt (inpaint-fix PRZED renderem).
    print("[przebieg] BRAMKA klatek — przegląd arkusza (samoakcept + log)")

    # RENDER — render_scenes JUŻ równoległy (submit-all -> poll-all). W TLE oczekiwania:
    # emisje panel-sync + budowa siatek QA klipów które JUŻ spadły (nie czekaj na komplet).
    scenes = scenes_spec(frames)
    print(f"[przebieg] RENDER {len(scenes)} scen RÓWNOLEGLE (render_scenes)")
    done = render.render_scenes(scenes, GEN, project=SLUG)
    for sc in scenes:
        f = os.path.join(GEN, sc["tag"] + ".failed")
        if os.path.exists(f):
            print("FAILED", sc["tag"], open(f).read()[:200])

    # BRAMKA qa_gate + product_gate (KROK 7/7.5) — nie-samoakceptowalna. Potem montaz.build(...).
    print("[przebieg] BRAMKA qa_gate/product_gate -> MONTAŻ (uruchom qa_run + gate_verdicts + montaz_run)")
    return done

if __name__ == "__main__":
    main()

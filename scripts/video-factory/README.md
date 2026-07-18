# video-factory — generator AI-video reklam z trendów /trendy

**SSOT koncepcji i reguł:** `docs/zbuduje/GENERATOR-VIDEO-STRATEGIA.md` — CZYTAĆ PRZED PRACĄ
(sekcja 0 = reguły emocji i demo; sekcja PILOT = gotchas techniczne pkt 1-13).
Katalog roboczy z mediami: `C:\tmp\video-factory\` (tools/ = kopie robocze tych skryptów,
lokowka/ = pilot; ledger.json = koszty per call).

## Kanoniczny flow (stan po pilocie lokówki, 17.07.2026)

1. **INGEST** — `ingest.py <mp4> <outdir>`: yt-dlp pobiera trendujące video (`python -m yt_dlp`),
   PySceneDetect tnie na sceny, ffmpeg wyciąga klatki first/mid/last + metryki rytmu.
2. **BANK REFERENCJI UŻYCIA** — z 3-4 realnych video produktu klatki użycia (GRIP/LOAD/CHAMBER/
   RELEASE/HALF-DONE) + MANIFEST.json; referencja POZY z realnego video + TOŻSAMOŚĆ produktu
   z packshotu Ali (nigdy z brandowanych packshotów TikTok Shop!).
3. **BLUEPRINT** — agent vision dekonstruuje oryginał do JSON: sceny z rolami, emocjami
   (min. 4 zwroty!), akcjami OBUR RĄK, briefami klatek EN, promptami ruchu, kwestiami PL
   z tagami emocji. Wzór: `pilot-lokowka/blueprint-v2-przyklad-lokowka.json`.
4. **AUDIO** — ElevenLabs v3 per-scena (tagi [skeptical]/[gasp]/[laughs]); scena trwa tyle,
   co kwestia + 0,6 s pad. Muzyka: Stable Audio 2.5 z łukiem pod oś czasu (drop na reveal).
5. **KLATKI** — nano-banana/edit; referencje jako OBIEKTY: kotwica twarzy (`face-ref`),
   packshot, referencje pozy z banku. Pary first→last dla scen transformacji
   („keep EXACTLY..., only change X"). Bramka: przegląd KAŻDEJ klatki przed renderem.
6. **RENDER** — sceny mówione: OmniHuman 1.5 (klatka + kwestia + prompt ekspresji);
   akcja/transformacje: Kling 2.5 first+last frame (`tail_image_url`); wszystko przez
   edge `bud-fal-proxy` (submit → poll `status_url`/`response_url` Z ODPOWIEDZI submita).
7. **ASSEMBLE** — ffmpeg: dynamiczna oś (sceny OmniHuman = długość audio), kwestie na
   startach scen, muzyka z automatyką (dip suspensu / pik kulminacji), sidechain ducking,
   limiter (BEZ spłaszczającego loudnorm), post realizmu (drift+winieta+ziarno), 48 kHz.
   BEZ napisów (robione osobno). Montaż steruje PLANEM JSON — kanoniczny wzór planu:
   `pilot-lokowka/plany-15s.json` (`assemble_v5.py` = archiwalny monolit pilota, NIE wzór planu).
8. **NAPISY (opcjonalnie, na życzenie)** — `napisy.py <final.mp4>`: word-by-word w stylu rolek
   (Montserrat Black, wersaliki, biały+obrys, aktywne słowo #F7C204 z popem; faster-whisper
   word-timestamps PL lokalnie $0; limit ~14 znaków/ekran + auto-font dla długich słów).
   ZAWSZE dwie wersje: oryginał bez napisów + `_subs.mp4`. Font: `C:/tmp/video-factory/fonts/`.
9. **PĘTLA QA** — klatki graniczne scen + audyt agentem (AI-tells: dryf twarzy, liczba RĄK,
   ciągłość kabla/rekwizytów, stany włosów) → poprawki → remontaż. Iteracje z Tomkiem na
   SEGMENTACH 10-12 s, pełne video dopiero bez uwag.

## ⚡ RÓWNOLEGŁOŚĆ (skraca wall-clock ~40-60 min → ~10-15 min)

`fal.gen()` jest BLOKUJĄCY — w pętli SERIALIZUJE generacje (pomiar masażer 18.07: ~26
pojedynczych `gen()` zamiast 3-4 batchy; blok audio i klatki leżały osobnymi fazami na
ścieżce krytycznej, jedyna nieredukowalna generacja to rendery ~5 min RÓWNOLEGLE). Wzorzec:
- **FALA A** = jeden `fal.gen_batch(jobs, GEN, max_parallel=8, project=slug)`: WSZYSTKIE
  klatki-FIRST (niezależne) **+ CAŁE audio** (music/ambient/VO/SFX — zero zależności, schodzi
  z krytycznej ścieżki).
- **FALA B** = drugi `gen_batch`: klatki-LAST/chainowane (ZALEŻĄ od FIRST) + trim SFX lokalnie.
- **RENDER** = `render.render_scenes()` (już równoległy — NIE cofać do pętli); w tle oczekiwania
  emisje panel-sync + siatki QA klipów, które JUŻ spadły.
- **Wspólne konto fal** = `max_parallel=8` (okno przesuwne, nie głodź drugiej sesji); różne biegi
  = różne `project=` (izolacja kosztów).

Szkielet + reguły zależności + „czego NIE robić dla minut": `docs/zbuduje/video-playbooks/PROCEDURA-OPERATORA.md`
(sekcja „RÓWNOLEGŁOŚĆ — wzorzec przebiegu"). Gotowy szablon: `projekty/_szablon_przebiegu.py`.

## Pliki

**PIERWSZA LEKTURA OPERATORA (po SSOT):** `docs/zbuduje/video-playbooks/` — skodyfikowane know-how
do produkcji wysokiej jakości za 1. razem. Kolejność: właściwy `PLAYBOOK-*` wg archetypu
(`gadzet-handsPOV` / `beauty-talkinghead` / `auto-POV`) → `PROMPTY-BIBLIOTEKA.md` (kanoniczne
szablony promptów z klauzulami) → `PROCEDURA-OPERATORA.md` (runbook przebiegu + bramki +
mapa 9 incydentów). `KARTA.template.json` = jedno źródło prawdy produktu (prompty+negative+bramka).

- `fal.py` — sterownik fal.ai przez proxy (store/gen/poll + ledger kosztów). RDZEŃ.
- `ingest.py` — etap 1. RDZEŃ.
- `render.py` — generyczny renderer scen (mc/flf/omnihuman; odporny poll, markery .failed;
  GOTCHA: driving dla mc musi mieć 3-10 s i widoczną postać przez CAŁY klip, bez cięć). RDZEŃ.
- `montaz.py` — generyczny montaż sterowany PLANEM (grade-match, ziarno-zszywka, VO na
  startach scen, automatyka muzyki dip/peak, ducking, limiter; unsharp maska NIEPARZYSTA). RDZEŃ.

**Dobór silnika per scena (z testów A/B 17.07):** gest/akcja ciała → `mc` z drivingiem
z ORYGINAŁU (dziedziczy mikro-timing — swobodna generacja dryfuje w niemożliwe pozy);
makro mechanizmu bez ciała → `flf`; mówienie do kamery bez dużej akcji → `omnihuman`.
Wierność oryginałowi = sekret virala: każdą scenę z gestem prowadź drivingiem.
- `pilot-lokowka/` — skrypty pilota (frames_v2, v5_render, assemble_v5 + blueprinty) —
  wzorce do uogólnienia, ścieżki hardcode na C:\tmp\video-factory\lokowka.
- `archiwum/` — ślepe uliczki pilota (Kling i2v bez audio-driven, post-hoc lipsync,
  assemble v1-v4). NIE używać; zostawione dla kontekstu decyzji.

## Koszty (fal.ai, 07.2026)

nano-banana edit $0.039/obraz · Kling 2.5 Pro $0.35/5 s · OmniHuman 1.5 ~$0.16/s ·
ElevenLabs v3 $0.10/1k zn. · Stable Audio $0.20/utwór. Spot ~30 s nowym przepisem: **~$7-8**.
Sekret: `BUD_FAL_API_KEY` (Supabase secrets), gate `x-tools-secret` (C:\tmp\tt.txt).

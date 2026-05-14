# Procedura generowania sekcji Reels

**Cel:** dodanie sekcji „Zobacz [BRAND] w prawdziwym użyciu" z autoplay-on-scroll, swipe lightbox i progress bars dla landingu.

**Wzorzec (referencja v3 — MP4-based, post-2026-05-11):** `landing-pages/dentaflow/index.html`

---

## ⛔ Hard rules — historia błędów których NIE wolno powtórzyć

| Błąd | Co się działo | Rozwiązanie |
|------|---------------|-------------|
| **iframe TikTok player/v1** | Pusta ramka „broken document icon" — większość TT videos blokuje X-Frame-Options | Pobierz MP4 lokalnie, hostuj na Supabase Storage |
| **iframe Instagram /p/{code}/embed/** | Cross-origin block bez tokenu, fallback do logowania | Pobierz MP4 lokalnie |
| **Blockquote embed.js** (TT/IG oficjalne) | Renderuje szeroki widget z opisem i komentarzami → nie pasuje do 9:16 ramki, niespójny UX | Pobierz MP4 lokalnie |
| **YouTube iframe embed dla `data-yt-id`** | „Czarny ekran" dla niektórych shortów (region-locked, embed-disabled albo wymagają specjalnych formatów) | Pobierz MP4 lokalnie (yt-dlp z `--remote-components ejs:github` + format `18`) |
| **Selektor `.reel-phone[data-yt-id]`** | Łapał TYLKO YT, TT/IG thumbnails nie reagowały na klik, counter „X / 18" kłamał (logika na 6) | Selektor `.reel-phone[data-video-idx]` i jednolity `data-mp4-url` dla wszystkich |
| **Duplikaty TT+IG+YT (v1 — phash only)** | Klient uploaduje ten sam reel na 3 platformy → 18 thumbnaili, ale 6 unikalnych. **Phash zawodzi cross-platform** bo YT ma custom cover (graficzny), TT/IG biorą pierwszą klatkę → te same nagrania mają distance 100+ | **Duration match ±0.3s primary signal** — różne nagrania w 0.3s precyzji ekstremalnie rzadkie. Phash tylko jako wspierający (≤20 + dur ≤2s) |
| **Tap w aktywny phone otwiera tylko lightbox** | Mobile user widzi jeden phone na środku (peeki schowane przez `display: none` na ≤768px), intuicyjnie tappuje ekran w nadziei „następny reel" — a system otwiera lightbox. User myśli że widget zepsuty, ucieka. Zgłoszone przez Patryka (OraVibe) 2026-05-11 | **Mobile (≤768px): tap w aktywny phone → cyclic next reel.** Desktop dalej otwiera lightbox. Click handler check `window.matchMedia('(max-width: 768px)').matches`. Patrz „Click handler — mobile vs desktop" niżej |

**Wzorce zostawione tylko jako fallback w kodzie:**
- YT.Player API + `data-yt-id` — gdy MP4 lokalnie się nie udało pobrać (broken HLS bez ffmpeg). Domyślnie nieużywane.
- TikTok/IG link out — gdy yt-dlp nie umie pobrać konkretnego URL.

---

## Wymagane narzędzia

```bash
pip install yt-dlp imagehash Pillow requests
# Plus Node.js (yt-dlp wymaga JS runtime do bypass YT JS challenge)
node --version  # v18+
```

Dla `--remote-components ejs:github` (YT bypass) — wymaga internetu (jednorazowo pobiera EJS solver).

---

## Procedura — single command

```bash
export SUPABASE_SERVICE_KEY="sb_secret_..."  # z tn-crm/.env
python scripts/generate-reels.py \
  --workflow-id <UUID> \
  --slug <landing-slug>
```

Skrypt zrobi:
1. **Pobiera `video_links`** z `workflow_video.video_links` przez Supabase REST.
2. **Download** każdego URL przez yt-dlp:
   - YouTube: `--remote-components ejs:github --js-runtimes node -f 18` (360p MP4 z audio, single file, no ffmpeg merge)
   - TikTok/Instagram: `-f best[ext=mp4]/best`
   - Thumbnaile: YT przez `img.youtube.com/vi/{id}/maxresdefault.jpg`, TT/IG przez `--write-thumbnail`
3. **Dedup cross-platform** — algorytm v2:
   - **Primary: duration match ±0.3s** (różne nagrania w tej precyzji ekstremalnie rzadkie; klient regularnie uploaduje ten sam reel na TT+IG+YT)
   - **Wspierający: phash** (`imagehash.phash` hash_size=16, distance ≤20) gdy duration ≤2s — łapie te same video gdy yt-dlp wziął nieidentyczne klatki źródłowe
   - **NIE** używa samego phash (zawodzi cross-platform: YT custom cover ≠ TT/IG pierwsza klatka, distance 100+)
4. **Wybór najlepszego** z grupy: priorytet YT (lepsza jakość, view counter), inaczej największy MP4.
5. **Upload** unikalnych do `attachments/landing/{slug}/reels/reel-{0..N-1}.{mp4,jpg}` — renumerowane od zera.
6. **Manifest** `reels-out/{slug}/manifest.json` z mapping new_idx → mp4_url + thumb_url + dropped duplikaty.
7. **Stdout HTML** — gotowy `<!-- REELS-TRACK -->` snippet + progress-bars + counter do wklejenia w landing.

---

## Manualna integracja w HTML landinga

Po uruchomieniu skryptu, w `landing-pages/{slug}/index.html`:

### 1. Reels track

Zastąp blok między `<!-- VIDEOS:REELS-TRACK:START -->` i `<!-- VIDEOS:REELS-TRACK:END -->` outputem skryptu.

Każdy `<button class="reel-phone">` MA mieć **3 data-attributes**:
- `data-video-idx="N"` (0..N-1)
- `data-platform="youtube|tiktok|instagram"` (informacyjne, nie używane przez playback)
- `data-mp4-url="https://yxmavwkwnfuphjqbelws.supabase.co/.../reel-N.mp4"` ← **KLUCZOWE**, decyduje o playback

`data-url` (oryginalny URL TT/IG/YT) jest opcjonalny — używany tylko do fallback link out.

### 2. Progress bars

Liczba `<button class="reels-progress-bar">` MUSI = liczbie reels (po dedupie). Skrypt drukuje gotowy blok.

### 3. Lightbox counter

Zaktualizuj hardcoded `<div ... id="reelsLbCounter">1 / N</div>` na nową N.

### 4. Stories bar (opcjonalnie)

Jeśli landing ma `<div class="stories-bar">` z `<button class="story-ring" data-video-idx="N">` — wybierz max 6 z YT/IG (preferuj YT) i zaktualizuj `data-video-idx` na **nowe** indeksy z manifestu.

### 5. JS — defaultowo OK

W reels JS musi być:

```javascript
const phones = Array.from(document.querySelectorAll('.reel-phone[data-video-idx]'));
// NIE: .reel-phone[data-yt-id] — to łapało tylko YT, ignorowało TT/IG.
```

### 6. Click handler — mobile tap = next reel (WYMAGANE od 2026-05-14)

W bloku `// ═══ Click handlery: phone + progress ═══` w reels JS:

```javascript
phones.forEach(function(p, i) {
  p.addEventListener('click', function() {
    if (i === activeIdx) {
      // Mobile (≤768px): tap w aktywny phone → cyclic next reel (TikTok-like).
      // Desktop: tap w aktywny phone → lightbox full-screen.
      if (window.matchMedia('(max-width: 768px)').matches) {
        const nextIdx = (activeIdx + 1) % phones.length;
        setActive(nextIdx);
        if (autoplayStarted && !autoplayPaused) {
          setTimeout(playActiveInSection, 700);
        }
      } else {
        openLightbox(i);
      }
    } else {
      setActive(i);
      if (autoplayStarted && !autoplayPaused) {
        setTimeout(playActiveInSection, 700);
      }
    }
  });
});
```

**Dlaczego:** na mobile peeki są ukryte (`display: none` na ≤768px), kropki małe — user widzi tylko jeden phone i intuicyjnie tappuje w nadziei „dalej". Bez tej logiki dostaje lightbox czego nie oczekuje. Patrz hard rule w tabeli historii błędów.

W `playActiveInSection()`:

```javascript
const mp4Url = phone.dataset.mp4Url;
if (mp4Url) {
  // utwórz <video autoplay muted playsinline> w .reel-phone-screen
  // loadedmetadata → startProgress(duration*1000)
  // ended → advanceToNext()
  return;
}
// fallback: data-yt-id → YT.Player (defensive, dla edge case gdy MP4 download failed)
```

W `buildLightbox()`:

```javascript
if (mp4Url) {
  frame = '<div class="reels-lb-mp4-host" data-mp4-url="' + mp4Url + '" id="reels-lb-mp4-' + i + '"></div>';
} else if (ytId) {
  frame = '<div class="reels-lb-player" ...></div>';  // fallback
}
```

Pełna implementacja w `landing-pages/dentaflow/index.html` (commit `aea41a7+`).

---

## Verify po deployu

1. Otwórz `https://[domena]/` w **incognito** (bez cache).
2. Sekcja „Zobacz [BRAND]…" — autoplay startuje gdy >=30% widoczna, video gra inline z mute.
3. Klik aktywnego phone → lightbox z counter „1 / N".
4. Swipe pionowy → następne video, autoplay.
5. Wszystkie N reels powinny się odtwarzać (bez czarnych ekranów, bez „broken document").
6. Sprawdź `reels-out/{slug}/manifest.json` — każdy `mp4_url` powinien dać HTTP 200 (`curl -I`).

---

## Edge cases

| Problem | Rozwiązanie |
|---------|-------------|
| yt-dlp ERROR „This video is not available" dla YT | Dodaj `--remote-components ejs:github --js-runtimes node` (wymaga node) |
| YT pobiera HLS tylko (m3u8), wymaga ffmpeg do merge → broken MP4 (duration=0) | Wymuś `-f 18` (360p single mp4 z audio) lub zainstaluj ffmpeg |
| TT/IG video usunięte/prywatne → yt-dlp fail | Skrypt po prostu pomija ten URL (continue) |
| Wszystkie 18 reels to duplikaty po dedupie → tylko N unikalnych | Manifest pokazuje `duplicates_removed`, HTML emit ma N buttons |
| Brak phash distance match mimo wizualnej zgodności | Zmniejsz `PHASH_THRESHOLD` w skrypcie (default 20, można 30) |
| Zapisany w bazie URL ma jakieś `?si=...` lub tracking params | yt-dlp i tak je obsłuży, ale `extract_yt_id` może wymagać poprawki |
| **Re-run dla tego samego landinga (zmiana liczby reels)** | Skrypt sam zrobi cleanup `reel-{N}.{mp4,jpg}` dla N >= keep_count po upload (`supa_cleanup_old_reels`). NIE trzeba ręcznie kasować w Storage. |
| **Cache reuse przy iterowaniu** | Skrypt sprawdza czy `reels-out/{slug}/src-{i}.{mp4,jpg}` istnieją (>50KB) i pomija download. Zmień video w bazie i delete `reels-out/{slug}/` żeby wymusić ponowne pobranie. |
| **Migracja starego landinga** (z YT iframe / bez data-mp4-url) | Po `generate-reels.py` wklej cały blok `<!-- VIDEOS:REELS:START -->...<!-- VIDEOS:REELS:END -->` z `dentaflow/index.html` jako template + zamień `OraVibe`→brand, `oravibe.pl/checkout?products=...`→swój CTA URL, podmień track/progress/counter z manifestu. **Sprawdź czy nie ma 2 IIFE `initReels()`** — stare leftover z poprzedniej wersji v2 bywa poza markerami REELS. Usuń. |

---

## Histo­ria zmian

- **2026-05-11 (v3.2)** — Migracja `parova/`, `innerscan/`, `vitrix/` na MP4-based + dedup v2. Wyniki: parova 4→4, innerscan 13→6, vitrix 27→5. Dodany `supa_cleanup_old_reels` (po upload usuwa stare `reel-{N}+`) i cache reuse (`src-{i}.mp4` jeśli istnieje, pomija download).
- **2026-05-11 (v3.1)** — Dedup v2: duration ±0.3s jako primary signal. Patryk zgłosił że v3 (phash only) zostawiał duplikaty (pos 11/12/13 to były 3× ten sam reel z dur diff 0.02-0.08s, ale phash distance 42-116 bo YT miał custom cover). Dla dentaflow: 18 → 6 (zamiast 13).
- **2026-05-11 (v3)** — MP4-based playback + phash dedup (v1). Naprawia: czarny ekran YT shortów (region-locked), pustą ramkę TT/IG embed (X-Frame), iframe-based playback. Wzorzec: `dentaflow/`.
- **2026-05-08** — v2 (`innerscan/`): selektor zmieniony na `.reel-phone[data-video-idx]` (było tylko `[data-yt-id]`), próba TikTok player/v1 + Instagram embed iframe — okazało się nie działać dla większości videos.
- **2026-05-07** — v1 (`parova/`): pierwsza wersja z YT.Player API, autoplay-on-scroll, lightbox snap-scroll. Działała tylko dla YouTube — TT/IG miały link out.

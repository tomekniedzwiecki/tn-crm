# RETRO — NAKRĘCIK · fabryka landingów · 2026-07-24

Wznowienie po padzie poprzedniego agenta (umarł po F1, oddawszy turę w tle generacji).

## Co poszło dobrze
- **F2.5 + F3 uratowane bez regeneracji.** Poprzedni agent zdążył wygenerować branding + 17 scen
  gpt-image-2 (niezacommitowane, panel niezsynchronizowany). KRYTYK wizualny orkiestratora = PASS
  (sceny wierne PASZPORT, świat różnorodny, białe rogi kadru + REC wpalone). Oszczędność ~$5 API.
- **Hero-video Kling** anty-morfing (osoba/produkt zamrożone, animacja = dryf światła) — bryła
  zachowana, zero warpingu.
- **Demo-wideo odrzucone poprawnie**: klip aukcji ma TELESIN wypalony w rogu KAŻDEJ klatki (0→41 s)
  + EN napisy — brak czystego okna temporalnego (inaczej niż Migotek, gdzie napisy były 2–7,7 s).
  Trim nie ratuje stałego overlay rogu → SAM hero-video (jak Zaklipek).

## Lekcje
- **LL (anti-death):** długą generację (Kling, batch scen) uruchamiać w tle + BOUNDED, ale NIE
  oddawać tury w połowie; robić pracę inline (rehost, panel-sync, commit, demo-decyzja) aż faza
  domknięta. Poprzedni agent zginął oddając turę w tle generacji.
- **JSON-LD:** AggregateRating w JSON-LD = FAIL manifest-check (rich-snippet), nie tylko
  `offers.price`. Migotek nie ma JSON-LD wcale → usunąć cały blok (bezpieczniej niż zostawiać
  Product+rating). Zapisać w standardzie: landing = ZERO JSON-LD Offer/AggregateRating.
- **Mozaika `zastosowania`:** kafle „wide" (3 kol × 1 rząd = AR ~2,8) przycinają kwadratowe sceny
  ~63% → gate P1. Kwadratowe sceny → kafle „big" (3×2, AR ~1,37) = 2×2 czysty grid.
- **Cross-landing akcent:** emerald #12B76A jest dE=13 od zieleni home-sprytko (< próg 15) — ale to
  STRONA GŁÓWNA sklepu (spójność marki), nie konkurencyjny landing; akcent wyprowadzony z realnego
  koloru produktu (wariant Green). Świadome odstępstwo (gate sam dopuszcza „wolno z koloru produktu").
- **Archetyp hero A** = wymóg zadania (TYP A pod hero-video) — kolizja z Migotkiem (też A)
  nieunikniona i świadoma.

## Znane residua (nie-defekty)
Gate całościowy: FAIL toru makieta-diff (kompozyty/IR/SSIM/mobile-pary) = skutek pivotu na sceny
gpt-image (brak osobnego renderu makiet) — udokumentowane, jak Migotek. manifest-check +
published-gate = 0 FAIL (bramki twarde).

# WIDEO — inwentarz + decyzja sekcji · NAKRĘCIK · F0 · 2026-07-24

Klasa dowodowa (MANIFEST F1a): sekcje wideo/UGC są OBOWIĄZKOWE — agent NIE MA prawa dać `SKIP`.
Poniżej protokół wyczerpania materiału + decyzja.

## 1. Materiał (co jest)
- **`ali_snapshot.video_url`** = `…/1100191221837.mp4` — **41,6 s, 1280×720, 30 fps** (pobrane,
  obejrzane vision, 4 klatki). **ON-PRODUCT**, czysty demo (składanie, szybkozłączka, siła
  magnesu, noszenie na szyi). ⛔ **ALE:** wypalony wordmark **„TELESIN"** (prawy-górny róg, przez
  cały klip) + **angielskie napisy** wpieczone („Magnetic Neck Phone holder", „Quick release
  design", „Strong neodymium magnet"). Konflikt: white-label + rynek PL.
- **`tiktok_url`** = `@…/7560147416155016479` — okładka g7: **inny twórca**, remont/DIY POV,
  wypalony tekst „DAY THREE LIVINGROOM REMODEL". Autentyczne UGC, ale cudze i brandowane.

## 2. Protokół wyczerpania → decyzja
- Klip Ali: retusz nie wchodzi w grę bez przeróbki całej ścieżki (wordmark + napisy przez 41 s).
  **Nie self-hostujemy verbatim.** Można wyciąć czyste, krótkie okno (klatki 0–2 s bez napisów),
  ale to fragment demo, nie pełna sekcja UGC.
- TikTok: cudza twórczość, brandowana → nie self-hostujemy.

## 3. Decyzja (NIE „nie będzie sekcji" — to nie decyzja fabryki)
- **RUCH NA STRONIE dostarcza nasze HERO-VIDEO (F5, Kling i2v)** — własny, brand-free, rynek PL
  (wzorzec Zaklipek) + **3 sceny ANIM** (F1.7b). To pokrywa obietnicę „żywej" strony.
- **Sekcja „wideo/UGC (klip TikTok)"** = **`blokada-tomek`** w MANIFEŚCIE (nie `SKIP`): jedyny
  materiał wideo jest brandowany (Ali = TELESIN + EN napisy; TikTok = cudzy twórca). Fabryka nie
  ma prawa go usunąć — pozycja czeka na decyzję Tomka (dostarczyć czysty klip UGC / zgoda na
  retusz fragmentu Ali / świadome pominięcie). Landing może iść LIVE bez niej (jak Zaklipek).
- **Social proof i „w akcji" pokrywają:** hero-video (POV w tle), sceny ANIM demo, sekcja
  `zdjecia-kupujacych` (5 realnych zdjęć ★5) i `opinie` (20× ★5, 4,8/187/96,8%). Materiału na
  wiarygodność jest pod dostatkiem.

## 4. `videos_curated` (zapis DB)
Nota: „Ali video ON-product ale brandowane (TELESIN wordmark + EN napisy przez caly klip) →
nie self-host. TikTok = cudze UGC. Ruch = hero-video F5 (wlasne). Sekcja wideo-UGC =
blokada-tomek." → zapis w `bud_tt_products.videos_curated`.

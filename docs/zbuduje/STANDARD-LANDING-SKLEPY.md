# STANDARD-LANDING-SKLEPY — landing produktowy pod maksymalną konwersję (workflow v2)

**Status: OBOWIĄZUJE od 2026-07-15** (research CRO: Baymard/CWV/Gemius/tpay/FTC + synteza Fable;
źródła w raporcie researchu — sekcja ŹRÓDŁA). Zastępuje podejście „adaptacja landing v5" z
PROCEDURA-HTML-PRODUKTU.md w zakresie ARCHITEKTURY KONWERSJI (tamta procedura zostaje dla
rzemiosła: self-contained, zakazy treściowe, przegranie do platformy).

**🎯 Cel: sklepy mają SPRZEDAWAĆ. Benchmark: CR 3%+ (zimny ruch Meta, mobile, COD).**
CR < 1% ⇒ najpierw diagnozuj message match i szybkość, dopiero potem kreację/copy.
Kontekst: ~90% ruchu mobile z Reels/FB (impuls), rynek PL (19% kupujących oszukanych w 2024 —
lęk #1 = scam), checkout na osobnej domenie platformy, COD dostępny.

---

## ZASADA 0 — landing kontynuuje rozmowę z kreacji (message match)

Użytkownik klika, bo hook go zaczepił. Landing NIE zaczyna sprzedaży od zera — **hero jest
echem hooka**: ta sama obietnica słownie + ten sam motyw wizualny. (Case'y: +34…+66% CR
z samego dopasowania; to największa pojedyncza dźwignia.)

**Wymienny moduł hero per hook (standard fabryczny):** jeden landing, w skrypcie mapa
`HOOKS = {1:{h1,sub},2:{…},3:{…}}` (3 hooki produktu z kroku Branding); parametr URL `?h=N`
podmienia h1+subheadline przy load (fallback: wariant 1 = główna obietnica). Kreacja nr N
linkuje na `?h=N`. NIE budujemy osobnych landingów per kreacja przy małym budżecie.

## ARCHITEKTURA STRONY (kolejność sekcji — mobile-first 390px)

1. **Topbar mini**: logo marki + „Płatność przy odbiorze · 14 dni na zwrot".
2. **HERO = kompletna mikro-oferta w 1. ekranie**: h1-echo hooka → subheadline (dla kogo+efekt)
   → zdjęcie produktu **W UŻYCIU** (nie packshot; packshot = slot 2+ galerii) → chip gwiazdek
   z uczciwym N („4,9/5 · 14 opinii") → cena → **jedno CTA** → mikrocopy pod CTA.
   ZAKAZ auto-slidera. Hero-obraz eager z jawnymi width/height (zero CLS).
3. **Pasek zaufania / COD 1-2-3**: „Zamawiasz (2 min) → Kurier przynosi → Płacisz przy odbiorze"
   — COD jako NARRACJA procesu, nie tylko badge.
4. **PAS krótko**: problem → agitacja (empatycznie, po ludzku) → przejście do rozwiązania.
5. **DEMO „Jak to działa" 1-2-3** (karty/sekwencja zdjęć; GIF/wideo własne — lazy — gdy będzie).
5b. **„HIT Z TIKTOKA" — wideo z /trendy jako SELF-HOST MP4 (decyzja Tomka 15.07, v2).**
   Wideo, które wykryło produkt w radarze, pokazujemy jako CZYSTE `<video>` hostowane u nas —
   Tomek odrzucił oficjalny embed TikToka (jego UI = drogi wyjścia ze strony: profil autora,
   „Watch on TikTok"). Mechanika:
   - **Autoplay-on-visible:** `muted loop playsinline preload="none"` + IntersectionObserver
     (threshold ~0,35): wejście sekcji w viewport → play, zejście → pause. Przycisk głośnika
     (róg wideo) togguje dźwięk. `prefers-reduced-motion` ⇒ BEZ autoplay (controls).
     Poster = trwała okładka `bud-covers/<video_id>.jpg`; zero kosztu LCP (preload none).
   - **Pipeline fabryczny:** `yt-dlp -f "b[ext=mp4]/b" <tiktok_url>` → ffmpeg H.264
     (`scale=720:1280,fps=30, crf 26, +faststart` — HEVC z TikToka NIE gra w Chrome!) →
     upload przez edge **`wf2-asset-rehost`** (x-wf2-secret; ścieżka `bud-videos/<video_id>.mp4`;
     sb_secret NIE przechodzi jako Bearer do storage-api, CLI cp = LegacyStorage error — edge
     z service role to jedyna pewna ścieżka).
   - Nagłówek sekcji: „Ten produkt obiegł TikToka" + UCZCIWA liczba z `max_plays`
     (zaokrąglana W DÓŁ); podpis pod wideo: „wideo: @autor (TikTok) · ponad X mln wyświetleń"
     — atrybucja ZOSTAJE mimo self-hostu (nie przypisujemy sobie contentu).
   - Umiejscowienie: po „Jak to działa", przed galerią — demo i dowód popularności w jednym.
   - ⚠️ **Ryzyko odnotowane (świadoma decyzja biznesowa):** self-host cudzego wideo wykracza
     poza licencję embedu TikToka — mitygacja: widoczna atrybucja autora, zdjęcie materiału
     na pierwsze żądanie twórcy, wideo NIGDY w kreacjach Meta (tam wyłącznie content
     własny/Manus). Brak wideo ⇒ sekcję pomijamy.
6. **Korzyści** (3-4, ikony, konkrety z FAKTÓW aukcji — zero zmyśleń).
6b. **UCZCIWE PORÓWNANIE** (tabela „zwykły X vs nasz X", 4-6 wierszy) — Z JEDNYM PRAWDZIWYM
   MINUSEM po naszej stronie („na mroźną zimę ✗ — wtedy sięgnij po cieplejszy"): jawna
   dyskwalifikacja buduje zaufanie na rynku wyczulonym na scam. Tabela w kontenerze
   `overflow-x:auto` (body bez h-scrolla).
6c. **NARRACJA WIZUALNA AI (opcja, budżet ~3 generacji na produkt — decyzja Tomka 15.07):**
   trzy kadry opowiadające problem→produkt→efekt: (1) HERO-efekt: osoba używająca produktu
   w palecie marki (świt/jasno), (2) PROBLEM: scena bólu BEZ produktu (empatycznie, gustownie
   — osoba od tyłu; „sweaty/uncomfortable" wywala safety filter, pisać „restless"),
   (3) FINAL: efekt nocą/duży plan przed ostatnim CTA. TWARDE ZASADY: referencje produktu
   (2 zdjęcia z aukcji) + „the EXACT product from reference, do NOT change colors/pattern",
   generacja przez wf2-gen→generate-image (provider gpt-image-2, quality medium, aspect 3:2
   hero/final, 1:1 problem), OBEJRZEĆ przed wstawieniem (drift = odrzucić), REALNE zdjęcia
   aukcji zostają w galerii i ofercie (AI nie zastępuje dowodu produktu), hero eager przez
   render API, pozostałe lazy.
7. **GALERIA** (lazy, lightbox :target) — wpleć zdjęcia Z OPINII (UGC, rehost `bud-reviews/`).
8. **SOCIAL PROOF**: statystyki + 3-6 opinii (priorytet: ZE ZDJĘCIAMI). Zasada małego N:
   pokazuj uczciwie („14 opinii"), nie klonuj, nie dmuchaj; 0 opinii ⇒ sekcję POMIŃ
   (zaufanie robi COD+zwrot). Autorzy: polskie imię+inicjał.
9. **OFERTA BOX (#zamow)**: cena, „co dostajesz", warianty jako BUTTONY (gdy API poda),
   CTA + mikrocopy, gwarancja zwrotu wyeksponowana.
10. **FAQ-akordeon TUŻ NAD finalnym CTA** (niszczenie obiekcji w punkcie decyzji):
    płatność przy odbiorze? · zwrot 14 dni jak? · wysyłka („pod Twój adres, status mailem" —
    **ZAKAZ obietnic czasu dostawy**) · pielęgnacja/kompatybilność · 1 pytanie produktowe.
11. **FINAL CTA** + powtórka ceny/COD + mini-opinia obok przycisku.
12. **STICKY BAR mobile** (<768px): cena + „Zamów — płacisz przy odbiorze"; pojawia się po
    zescrollowaniu hero; nie zasłania treści (padding-bottom body).

**CTA — jedno działanie, powtórzone 3-4×** (hero / po dowodzie / finał / sticky).
Copy przycisku mówi dokąd i bezpiecznie: **„Zamawiam — zapłacę przy odbiorze"**;
finał: „Przejdź do zamówienia — płatność przy odbiorze".
Mikrocopy pod KAŻDYM CTA: „Płatność przy odbiorze · 14 dni na zwrot · Wysyłka pod Twój adres".

## TECH BUDŻET (twardy)

- **LCP < 2,5 s · CLS < 0,1 · INP < 200 ms (mobile 4G).**
- **Fonty: MAX 1 rodzina custom** — nagłówki (Znajdzik: Fraunces, wagi 600+700, preload woff2,
  `font-display:swap`, subset latin-ext). **Body/UI = system-font stack** (żadnego drugiego
  custom fontu — koszt LCP nieuzasadniony różnicą CR). Tokeny marki niosą kolory+nagłówki.
- Obrazy: hero przez Storage **render API** (`/render/image/public/...?width=800&quality=75&resize=contain`),
  format webp; galeria lazy (`loading="lazy"`); wszystkie z width/height.
- Self-contained: 1 plik HTML, CSS inline, **JEDEN <script>** (pixel+hooki+CTA — patrz niżej),
  zero zewnętrznych bibliotek; wyjątki dozwolone: Google Fonts (1 rodzina), obrazy Storage.
- `prefers-reduced-motion` respektowane; overflow-x zablokowany.

## POMIAR (spięty z systemem decyzji testów — WORKFLOW-V2-TESTY.md!)

Jedyny <script> na stronie robi:
1. Meta Pixel `{{PIXEL_ID}}` (init tylko gdy podmieniony; zero błędów przy placeholderze):
   PageView + **ViewContent** (load), **AddToCart** (klik KAŻDEGO CTA — checkpoint CP2 liczy
   ATC rate; landing bez ATC = ślepy system decyzji!), **InitiateCheckout** (faktyczne wyjście
   na domenę kasy).
2. **Link decoration**: przy wyjściu na checkout dokleja `fbclid` + `_fbp`/`_fbc` do URL
   (cross-domain atrybucja — cookie _fbc nie przechodzi między domenami).
3. Moduł hero `?h=N` (mapa HOOKS).
CTA zakupu = `<a data-checkout="<produkt-slug>" href="#zamow">`; przy publikacji przez API
platformy href → checkout_url wariantu.

## ZAUFANIE PL (rynek po 19% oszukanych — uczciwość = konwersja)

- **PŁATNOŚCI = pełen wachlarz, nie tylko COD (korekta Tomka 15.07):** COD komunikowany jako
  JEDYNA forma osłabia wiarygodność („sklep bez płatności online?"). Standard: CTA neutralne
  („Zamawiam teraz"), mikrocopy „Płatność: BLIK, karta lub przy odbiorze · 14 dni na zwrot",
  **pasek ikon płatności** (inline SVG: BLIK / Visa / Mastercard / POBRANIE) w hero i w ofercie
  — ikony znanych metod to czołowy sygnał zaufania (tpay: 48% PL patrzy najpierw na bezpieczne
  płatności). COD zostaje GŁÓWNYM risk-reversalem w narracji 1-2-3 („płacisz, jak wolisz —
  online albo przy odbiorze") — opcją zdejmującą lęk, nie jedyną drogą. Pokazujemy WYŁĄCZNIE
  metody realnie dostępne w checkoucie platformy.
- Pilność WYŁĄCZNIE realna (sezon: „najgorętsze tygodnie lata"), **zero**: liczników,
  „ostatnich sztuk", fikcyjnych przekreśleń, stockowych twarzy, kalek językowych.
- Polszczyzna natywna (pełne znaki, naturalne frazy — żadnego translatora).
- Checkout = przedłużenie landinga: przekazać platformie logo+kolory marki (spójność
  wizualna kasy); docelowo potwierdzenie SMS zamówienia (mikro-zobowiązanie tnące odmowy
  odbioru COD) — WYMÓG-życzenie do platformy.

## ZAKAZY TREŚCIOWE (bez zmian z PROCEDURA-HTML-PRODUKTU + safety)

Zmyślona pilność · „dostawa 24h"/„magazyn w PL"/JAKIEKOLWIEK obietnice czasu dostawy ·
obietnice zdrowotne (tylko komfort/stylizacja) · zmyślone liczby/opinie/przekreślone ceny ·
klejmy niepotwierdzone w aukcji (przykład 15.07: „bez kabla" przy przewodowej lokówce,
„nie nagrzewa się" przy kocu) · multi-pack bez realnej oszczędności.

## CHECKLIST PRZED PUBLIKACJĄ (gate — wszystkie PASS)

1. grep-checki zakazów (24h, magazyn, ostatnie, tylko dziś, liczniki, <s>/<del>/line-through
   przy cenie, „nie nagrzewa").
2. Liczby na stronie == liczby z `ali_snapshot.review_stats` (nic ponad).
3. Message match: h1 == hook główny; HOOKS mapa == hooki z kroku Branding; `?h=2`/`?h=3` działa.
4. Eventy w konsoli (pixel placeholder = brak błędów; po podmianie: VC/ATC/IC w Test Events).
5. Lighthouse mobile: LCP < 2,5 s (throttling 4G), CLS < 0,1; waga pierwszego ekranu sensowna.
6. 3 viewporty (390/768/1440): sticky nie zasłania, lightbox działa, brak h-scrolla.
7. Wszystkie CTA → #zamow; data-checkout obecny; mikrocopy pod każdym CTA.
8. Pętla krytyka-CRO do CZYSTEJ RUNDY (świeży agent: „znajdź co obniża konwersję").

## ŹRÓDŁA (research 15.07)

Baymard (product page UX, checkout fields) · KlientBoost/Leadpages (message match +34…66%) ·
CWV studies (0,1 s ⇒ +8,4% CR retail; Swappie +42%) · DebugBear (fonty/LCP) · Gemius
E-commerce PL 2024 (39% COD) · tpay (19% oszukanych 2024) · FTC Dark Patterns · Contentsquare
(sticky ATC +11…31%) · senja/convert-via (UGC, małe N) · landerlab/replo (benchmarki CR).
Pełny raport researchu: sesja 2026-07-15 (agent CRO), wnioski wpisane powyżej.

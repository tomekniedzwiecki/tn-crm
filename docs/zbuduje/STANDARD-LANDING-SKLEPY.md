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
6c. **NARRACJA WIZUALNA AI — HERO OBOWIĄZKOWO (potwierdzone przez Tomka 15.07 na kocu:
   „to na pewno chcę dodać do naszej fabryki"), problem/final wg budżetu:**
   - **HERO (STANDARD, każdy landing):** fotorealistyczna scena „osoba używa produktu
     i ma EFEKT" (koc: kobieta śpi spokojnie o świcie) — JASNA, w palecie DS produktu,
     naturalne światło, zero tekstu/naklejek. Przepis: 2 referencje zdjęć z aukcji +
     „the EXACT product from the reference images (kolory/wzór wyliczone!), do NOT change
     the product's colors, pattern or proportions" + paleta sceny z MOOD DS. aspect 3:2,
     eager przez render API (width=900), jawne width/height. OBEJRZEĆ przed wstawieniem:
     drift produktu (inny kolor/wzór) = odrzucić i regenerować z mocniejszą kotwicą
     (lekcja koca: odcień dociągać do REALNEGO produktu, nie „ładniejszego").
   - (2) PROBLEM: scena bólu BEZ produktu (empatycznie; osoba od tyłu — „sweaty/uncomfortable"
     wywala safety filter, pisać „restless"), 1:1, lazy. (3) FINAL: efekt przed ostatnim CTA,
     3:2, lazy. Oba opcjonalne wg budżetu generacji.
   - REALNE zdjęcia aukcji ZOSTAJĄ w galerii i ofercie (AI nie zastępuje dowodu produktu).
   - Wszystkie generacje JASNE (reguła jasnych teł obowiązuje też obrazy).

6d. **ART PACK — pełny pakiet generacyjny per landing (pipeline v3, decyzja Tomka 15.07:
   „grafiki z image są genialne — budujemy landing tak, jak wygląda na grafikach"):**
   Styl określa MAKIETA-MASTER (gpt-image, full page, ref = zdjęcia produktu; Tomek zatwierdza
   obraz jak klient w lejku), a potem KOMPLET skoordynowanych generacji (każda: ref = makieta
   [+ zdjęcie produktu gdy produkt w kadrze], twarde „NO text/typography/UI/watermark" dla teł):
   1) **hero-plate** — czysta scena hero z produktem, przestrzeń pod treść (3:2, eager, render API);
   2) **final-plate** — pas dekoracyjny pod final CTA (duża pusta przestrzeń centralna);
   3) **band-plate** — subtelny pas pod sekcję środkową (bardzo jasny — tekst musi być czytelny);
   4) **icon-sheet** — arkusz 6 ikon w stylu makiety na CZYSTEJ BIELI (siatka 3×2) → cięcie +
      biel→alpha (PIL); jeśli SVG kodem ostrzejszy — wybór per ikona (decyzja przy wpięciu);
   5) **og-banner** — dedykowany social-share w stylu makiety (przycinany do 1200×630;
      kompozycja z pustą 1/3 — tekst dodajemy overlayem, nie w obrazie).
   **SPÓJNOŚĆ PAKIETU (Tomek 15.07):** KAŻDA generacja w ramach landingu ma makietę-master
   jako referencję obrazową (+ zdjęcie produktu, gdy produkt w kadrze) i wspólną paletę —
   zero grafik „z innej bajki". Generujemy nie tylko produkt: **jeśli sekcji przyda się
   JAKIKOLWIEK asset (tło, pas, ozdobnik, ilustracja, ikony, OG) — generować OD RAZU,
   bez pytania**, w ramach budżetu ~15 zł/landing (kod+zdjęcia). Cross-model:
   review kodu i polish copy przez **gpt-5.6-sol via edge `wf2-gpt`** (x-wf2-secret;
   klucz OpenAI tylko w sekretach edge) — uwagi wchodzą po naszym filtrze zakazów.
   BUDOWA: UI (karty, przyciski, typografia, fale-SVG) = kod z pipetą kolorów z makiety;
   **pętla diffowa** (PIL ImageChops: % pikseli ≠ + heatmapa, screenshot 1024w vs makieta)
   per sekcja aż różnice zostają tylko w strefach świadomych nadpisań treści (prawdziwe
   liczby/płatności). Każdy plate OBEJRZANY przed użyciem (wtopiony tekst/UI = odrzut).
   Mechanika: prompty-szablony w `scratchpad`-history + skrypty koc-*.ps1 (do przeniesienia
   w narzędzia fabryki przy S3).
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

**MAPA TRUST-ELEMENTÓW (anty-duplikacja — feedback Tomka 15.07 ×2: „znowu powielasz").**
Każda informacja zaufania (metody płatności / zwrot 14 dni / COD / ocena ★) występuje
w danej sekcji MAKSYMALNIE RAZ, wg stałych miejsc:
| Miejsce | Co dokładnie |
|---|---|
| topbar | 1 linia: „Płatność online lub przy odbiorze · 14 dni na zwrot" |
| header | chip „★ 4,9/5 · N ocen" (jedyne ★ nad foldem) |
| HERO | pod CTA+ceną JEDEN rząd: pay-row (ikony) + badge „14 DNI NA ZWROT" — nic więcej |
| COD-strip | narracja 1-2-3 (proces, nie badge) |
| OFERTA | lista „co dostajesz" (płatności+zwrot+wysyłka jako punkty) + pay-row SAME ikony; zero chipów i mikrocopy powtarzających listę |
| FINAL | pełne mikrocopy (jedyne pełne zdanie płatności poza listą) + mini-opinia |
| sticky | skrót: „BLIK · karta · za pobraniem — 14 dni na zwrot" |
Gate: przed publikacją policz wystąpienia „14 dni", „pobranie/przy odbiorze", „BLIK" per sekcja.

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

## DESIGN SYSTEMY — TYLKO JASNE TŁA (decyzja Tomka 15.07, potwierdzona badaniami)

- **Tła stron/sekcji wyłącznie jasne** (kremy/biele/pastelowe mgły). Ciemne dozwolone tylko
  jako drobne akcenty (tekst, ikony), NIGDY jako tło strony/sekcji. Powody z badań:
  (a) jasne tło = wierniejsze zdjęcia produktu, lepsza czytelność, standard zaufania w masowym
  B2C (imsolutionz/ekomfy); (b) „ciemne + neon/gradient" czyta się w 2024-26 jako
  AI-slop/szablon — „Your brand looks like a template. And your users notice" (dev.to/raxxo);
  (c) dark wygrywa tylko w niszach premium/tech/B2B (case Search Engine Land: dark −16% CTR
  ale +42% konwersji przy PRZEMYSŁOWYM SaaS) — nasza grupa (impuls, kobiety 25-45) to
  przeciwny biegun. Pula DS: `sklepy/_design-systems/systems.json` (regula_jasnych_tel).
- **CTA: decyduje kontrast, nie „magiczny kolor"** (CXL; HubSpot red vs green +21% = efekt
  izolacji): jeden ciepły, mocno kontrastujący kolor, użyty WYŁĄCZNIE na przycisku zakupu
  (nasze `--cta` w tokens robi dokładnie to).

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

## GEO — znajdowalność w LLM (pełna wiedza: docs/zbuduje/GEO-LLM.md)

1. **Treść w serwerowym HTML** — boty LLM nie wykonują JS; każdy fakt (cena, ocena, spec, FAQ,
   recenzje) w widocznym tekście źródła. Self-contained ✓ z natury — nie łamać fetchami.
2. **Answer-first**: hero-sub = 2-3 zdania „co to + korzyść + dla kogo"; liczby i konkrety;
   akapity 40-75 słów; ZERO tonu „najlepszy/rewelacyjny" (promocyjność obniża cytowalność −26%).
3. **JSON-LD @graph** (higiena — pomaga Google/feedom, nie zastępuje widocznego tekstu):
   Organization/OnlineStore (parasol, sameAs) + Product (brand = **Brand mini-marki**,
   aggregateRating/review 1:1 z widocznymi, price kropką, PLN, availability, zwroty 14 dni)
   + BreadcrumbList (galeria→produkt) + FAQPage (= widoczne FAQ). Pól bez danych NIE zmyślać
   (GTIN/wymiary tylko gdy realne — inaczej pomiń).
4. **Placeholdery publikacji**: `{{CANONICAL_URL}}` (canonical + og:url + JSON-LD url)
   i `<meta name="robots" content="noindex">` na PREVIEW (crm.*) — publikacja przez API
   podmienia canonical i zdejmuje noindex (jak {{PIXEL_ID}}).
5. **ANTY-DOORWAY (krytyczne przy skali!):** każdy landing genuinnie unikalny (opis, FAQ,
   recenzje SWOJEGO produktu) — klony/spiny karane na CAŁĄ domenę, także w AI Overviews.
6. Poziom domeny (robots/sitemap/feedy GMC+Bing+Perplexity/GTIN) = wymagania do platformy
   (SSOT 0b) — nie na landingu.

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

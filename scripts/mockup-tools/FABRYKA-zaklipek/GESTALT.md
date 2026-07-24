# GESTALT (F7.4) — ZAKLIPEK · świeże oko na ŻYWY render całości · 2026-07-24

> STANDARD F7 pkt 2b (LL-076): finalny ŻYWY render ogląda świeże oko „oczami klienta" PRZED
> status=gotowy. Render: `sklepy/tomek-niedzwiecki/zaklipek/index.html` @ desktop 1280 + mobile 390,
> Z hero-video wpiętym (F5). Werdykt niezależny (visual-verify, świeża para oczu — nie koder).

## WERDYKT: **CZYSTY** — gotowy do `status=gotowy`. Zero defektów, zero pozycji do poprawy.

## Dowody (DOM + wizja)
1. **Hero-video GRA** (nie tylko wstrzyknięte): `#hero .hero-video` = `className "hero-video on"`,
   `currentTime` ROŚNIE (desktop 7.76→9.27 s, mobile 6.5 s), `readyState=4` (HAVE_ENOUGH_DATA),
   `videoWidth 1272×1628`, `paused=false`. Źródła: hero-loop.webm+mp4 (desktop), hero-loop-m.*
   (mobile), poster sc-hero-d/-m.webp. Autoplay muted działa nawet w headless. Produkt+dłoń
   STATYCZNE, ruch tylko ambient (para z kubka) — cinemagraph zgodny z założeniem.
2. **Count-up** opinii: rev-num = „4,6", rev-count = „26" (nie 0/NaN; przecinek dziesiętny PL OK).
3. **3 fixy trzymają:** (a) `#zacisk` etykieta „blat" w pełni widoczna (lewo od calipera);
   (b) `#galeria` kafel 2 — czysty kadr zacisku, adnotacja nieucięta; (c) podpisy galerii — biały
   tekst czytelny na wszystkich 4 kaflach (mocny scrim dolny).
4. **mid-cta + final** — `background rgb(15,26,42)=#0F1A2A` (dark fallback), białe copy w pełni
   czytelne na ciemnych scenach wieczornych.
5. **Regresje: BRAK.** Overflow-x: desktop 1280==1280, mobile 390==390 (zero h-scroll). Konsola:
   0 błędów. Sieć: 0 odpowiedzi ≥400, 0 requestfailed (hero-loop webm+mp4 bez 404).

## Holistyka „oczami klienta"
Hero przekonuje w 3 s (big-type + akcent #0A6EBD na „zawsze pod ręką", karta 34,90 zł + CTA, pas
zaufania COD/14 dni/z Polski, produkt na krawędzi biurka). Pełny przepływ 15 sekcji zbalansowany,
rytm scen ciemnych (problem/mid-cta/final) i jasnych sekcji kodowych dobry, sygnatura ticków spina.
TOR-I demo (3 stany) + zacisk (suwak 5–28 mm) działają. Galeria+lightbox, sticky-buy mobile,
FAQ akordeon — OK. #zamow = kanoniczny preview-guard (hydruje na LIVE). Mobile 390 stackuje czysto,
diakrytyki w fontach pełne.

## Archiwum
Zrzuty: `scratchpad/gestalt-final-desktop.png` (pełna wysokość desktop), `gestalt-hero-crop.png`.
Poprzednia runda (przed hero-video+fixami): GOTOWE-DO-PUBLIKACJI (0 blocker/major) — ta runda
potwierdza po dodaniu hero-video + 5 fixów QA. gate-check: PASS=121 FAIL=0.

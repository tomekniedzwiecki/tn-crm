# BUILDLOG — projekt rozwojowy „Znajdzik" (Tomek Niedźwiecki)

Projekt wf2: `baacc66f-3dd0-462a-9799-de9c7aaea639` · Panel: crm.tomekniedzwiecki.pl/tn-sklepy/projekt?id=baacc66f-3dd0-462a-9799-de9c7aaea639
Zasady: każda sesja ZACZYNA od przeczytania tego pliku, KOŃCZY dopisem (co zrobione / decyzje+dlaczego / otwarte / dowody). Kontekst żyje w repo, nie w czacie.

---

## 2026-07-15 — Sesja 0: fundament produkcyjny + marka + branding

**Zrobione:**
- Projekt utworzony + portfel 5 produktów z /trendy (lokówka 87, koc chłodzący 80, endoskop 71, jeździk koparka 71, pompka do bagażu 68; ZipString 84 ODRZUCONY — koszt $1,81 = groszowa marża kwotowa). Ceny testowe +15% (NBP 3,7879).
- SSOT 0b (koncepcja produkcyjna: cel nadrzędny SPRZEDAŻ, API platformy, cennik dwufazowy, kampanie 500/500) + WORKFLOW-V2-TESTY.md (system decyzji: alokacja dwubramkowa, checkpointy spend-based, progi w settings `wf2_test_config`/`wf2_scale_config`).
- Migracje: `20260715_wf2_produkcja_fundament` (wf2_notes, milestone_label, deadline_at, platform_shop_id/product_id/checkout_url/page_url) + `20260715b_wf2_testy_dane` (ad-level lejek w ad_stats, source 'platform', kolumny cyklu testowego).
- Krok `marka` (project-scope) dodany do step_defs + warsztat WS + prompt. Etap Kampanie dopracowany wg Reklam v1 (partner access BM 737839566050751, prepaid 1000 zł, pixel-gotchas, instrukcje klienckie w instructions_md).
- MARKA: research 45 nazw (RDAP) → 14 wolnych .pl → REKOMENDACJA **Znajdzik** (znajdzik.pl; alternatywy: Odkrytka, Skarbka). Pakiet: tagline/opis/paleta/fonty — w kroku `marka`.
- BRANDING produktowy 5/5 pod marką parasolową: nazwy wyświetleniowe, persony, obietnice, 3 hooki/produkt (limit ≤125 zn., polityka Meta czysta) — w krokach `branding`.
- Snapshot endoskopu potwierdzony (source=detail). Lokówka+koc: rebuild w toku.

**Decyzje (dlaczego):**
- 1 sklep = 1 marka parasolowa + produkty na podstronach (zgodne z API platformy: strona główna + podstrony; 5 domen = koszt bez sensu).
- Dwubramkowa alokacja 500 zł zamiast 5×100 (100 zł/produkt ≈ 0,4 zakupu — brak werdyktu; koncentracja na survivorach).
- Test przy marży 15% jest świadomie stratny na reklamie (BE-ROAS ~9) — to koszt walidacji; zysk przychodzi z ceną scale (BE-ROAS ~1,6).
- WYMÓG: w fazie testowej dostawę płaci klient (inaczej mikro-marża ujemna przed reklamą).

**Otwarte / czeka:**
- [BRAMKA Tomka] Akcept nazwy Znajdzik + zakup domeny znajdzik.pl (wolna 15.07).
- [ZEWNĘTRZNE] Dokumentacja API platformy od developera (base URL, auth) + wymogi trackingowe (CAPI Purchase per sklep — sekcja 0b pkt 6).
- Loga Znajdzik ×5 w generacji (generate-image, medium).
- Pętla weryfikacyjna brandingu (świeży krytyk) → potem status done na krokach.
- Landingi 5 produktów — plan sesji w `_brief.md` (S1-S7). CTA = placeholder `data-checkout` pod checkout_url z API.
- Konto reklamowe + budżet (kroki klienckie — tu: Tomek jako klient testowy).

**Dowody:** commity `2580954`, `26e4193` (tn-crm main); wpisy wf2_activities projektu; kroki `marka`/`branding` wypełnione w panelu.

## 2026-07-15 — Sesja 0b: pętla jakości brandingu + loga + korekta cen

**Zrobione:**
- Aukcje POTWIERDZONE 3/3 (bud-ali-snapshot force): endoskop OK; lokówka $8,07→**$19,21**, koc $7,81→**$13,52** — snapshoty „search" zaniżały koszt ~2×. Koszty/ceny przeliczone.
- LOGA Znajdzik 5/5 (generate-image przez proxy wf2-gen; wordmarki bezbłędne). Komplet: dzik z metką (GŁÓWNE) + lupa (header) + „z" (favicon) + editorial + monoline. URL-e w kroku `marka`.
- **Pętla poprawek DO WYCZERPANIA na brandingu: 4 rundy świeżego krytyka (15 → 8 → 3 → CZYSTA).**
  Najważniejsze: ceny psychologiczne zamiast artefaktów (,68/,01) → **reguła fabryczna `psychPriceUp()`**
  w projekt.html (<150 zł → …4,90/…9,90; ≥150 → …9,00) z testami; klejmy urealnione do aukcji
  (lokówka PRZEWODOWA — zero „cordless"; koc bez „obu stron"); COD zdjęty z dźwigni przy 249 zł;
  risk-reversal „A gdyby nie…" spójny 5/5; endoskop z domowymi scenariuszami.
- Ceny finalne: 84,90 / 59,90 / 39,90 / 249,00 / 64,90 (profit/szt.: 10,43 / 7,49 / 8,30 / 35,31 / 8,49).
- Branding 5/5 = DONE (kroki w panelu, dowody w data.fields + activities).

**Decyzje:** psychologiczne końcówki cen = standard fabryki (TESTY.md §3); nazwy display na
wf2_products.name (galeria/landing używa nazw sprzedażowych, nie roboczych z /trendy).

**Otwarte:** bez zmian (bramka nazwy+domeny u Tomka; API platformy; landingi wg planu S1-S7).

**Dowody:** commity `45763da`, `db172c6`; 4 wpisy activities (branding_runda1-3, branding_done);
loga w Storage `attachments/ai-generated/wf2-znajdzik/`.

## 2026-07-15 — Sesja 1: LANDING KOCA wg nowego standardu konwersji

**Zrobione:**
- **STANDARD-LANDING-SKLEPY.md** (na żądanie Tomka: przemyślane OD ZERA pod konwersję, research
  CRO z danymi) — message match `?h=N`, mikro-oferta 1. ekran, COD 1-2-3, sticky-po-hero,
  1 font custom, eventy ATC/IC pod CP2, benchmark CR 3%+.
- Landing `chlodzacy-koc/` LIVE: crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/chlodzacy-koc/
  (~1050 linii, self-contained, 1 script). Runda 1 CRO: 2×P1+7×P2 → wszystkie naniesione.
- **Decyzje Tomka w trakcie (wszystkie w standardzie):** (a) wideo z /trendy BEZ odtwarzacza
  TikToka → self-host MP4 (yt-dlp→H.264 30fps→wf2-asset-rehost) z autoplay-on-visible + głośnik;
  (b) płatności MULTI (BLIK/Visa/MC/pobranie z ikonami), COD = risk-reversal nie jedyna forma;
  (c) 3 grafiki AI z referencjami (hero-świt / problem-noc / final-sen) — narracja
  problem→produkt→efekt; (d) tabela uczciwego porównania z prawdziwym minusem.
- Nowe narzędzie fabryki: edge `wf2-asset-rehost` (upload assetów; sb_secret nie działa jako
  Bearer w storage-api, CLI cp = LegacyStorage err).
- GOTCHA sesji: bash heredoc z `p='index.html'` + persistent cwd po `cd` w innym wywołaniu →
  patch poszedł w ZŁY plik (tn-crm/index.html odczytany+zapisany bez zmian). Zawsze jawny cd
  w TYM SAMYM wywołaniu co patch.

**Otwarte:** runda 2 CRO w toku; po CZYSTEJ: kroki html_draft/html_final → done; potem S3-S6
(lokówka/pompka/endoskop/jeździk — każdy: branding→wideo MP4→3 generacje AI→landing wg
standardu→pętla CRO) i S7 strona główna.

**Dowody:** commity `236f5db`, `ab360f0`, `3d54df6`, `81600d7`; wideo `bud-videos/7642664659505483021.mp4`;
grafiki `ai-generated/wf2-znajdzik-koc/`.

## 2026-07-15 — Sesja 1b: architektura v3 (mini-marki), decyzja DS, runda 2 CRO = INPUT

**Decyzje Tomka (wieczór):**
- **Mini-marki produktów (arch. v3):** parasol tylko w domenie/stronie głównej; landing = wyłącznie
  marka produktu (nazwa+logo, title/SEO/GEO pod nią). Koc = **CHŁODZIK** (live). WS branding
  zaktualizowany (nazwa mini-marki + logo, slug = ścieżka URL).
- **Poprawki koca WSTRZYMANE** — przebudowa nastąpi przez BIBLIOTEKĘ DESIGN SYSTEMÓW
  (Claude Design): 8 systemów zdefiniowanych w `_design-systems/systems.json` (Fable),
  fabryka styleguide'ów w budowie (agent), potem sync DesignSync → przegląd Tomka → przebudowa.
- **GEO:** research w toku → sekcja w standardzie + JSON-LD + wymagania platformowe.

**RUNDA 2 CRO (żywa strona) = INPUT DO PRZEBUDOWY (nie naniesione — decyzja):**
- Technicznie PASS: sticky-po-hero, wideo self-host (0 requestów TikTok, autoplay/pauza/dźwięk OK,
  preload=none potwierdzony), płatności czytelne, tabela bez h-scrolla, ?h=N, konsola czysta,
  branding spójny „Chłodzik".
- **[P1] Galeria: wywalić kompozyty AliExpress g0/g2/g5** (śnieżynki-cliparty, termometr, strzałki)
  — zostają czyste g1/g3/g4 + ew. packshoty/UGC z opinii.
- [P2] Grafiki AI: odcień koca granat → dociągnąć do realnego stalowego błękitu przy regeneracji.
- [P2] Opinia „Pasuje i jest wygodne" (Ewa T.) — podmienić na adekwatną do koca.
- [P2] Kafle statystyk opinii za duże na mobile (2-up w rzędzie).
- [P2] Tabela: „✗wtedy sięgnij…" — brak odstępu po markerze.
- [GATE] Pixel = placeholder — podmiana OBOWIĄZKOWA przed pierwszą kampanią (inaczej CP1/CP2 ślepe).
- Kontekst: wideo EN (świadomy trade-off; przy skali rozważyć PL-dubbing/napisy własnym contentem).

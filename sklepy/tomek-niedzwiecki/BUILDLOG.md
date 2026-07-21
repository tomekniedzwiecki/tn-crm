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

## 2026-07-15 — Sesja 1c: pipeline makietowy + biblioteka DS gotowa

**Decyzje Tomka (późny wieczór):** (a) design nie z ręcznych palet — **STYL OKREŚLA MAKIETA
OBRAZOWA (gpt-image), jak przy drukarce 3D Wojciecha** (chosen_style neonpro z 3 obrazów);
(b) ZAKAZ ciemnych teł potwierdzony ×3 → pamięć trwała + wszystkie prompty; (c) **hero-grafika
AI „osoba używa produktu" = OBOWIĄZKOWY standard fabryki**; (d) mapa anty-duplikacji trust
(feedback „znowu powielasz" — 2. raz).

**Zrobione:**
- **4 makiety Chłodzika wygenerowane i WYSŁANE Tomkowi do wyboru** (referencje produktu twarde;
  wszystkie jasne): 1 Ciepły katalog · 2 Świt błękitu · 3 Nadmorska bryza · 4 Magazyn snu.
  Storage: `ai-generated/wf2-chlodzik-mockups/`. UWAGA przy ekstrakcji: liczby/obietnice
  z makiet IGNORUJEMY (na obrazach są ozdobne „1200+ opinii/24h/30 dni" — do landingu tylko
  nasze prawdziwe dane).
- **Biblioteka styleguide'ów COMMIT `8231509`**: `_generator/` (build.mjs + template 690 linii,
  zero JS) + 8×DS (tokens/components/MOOD), wszystkie JASNE (weryfikacja luminancją), mapa
  anty-duplikacji w szablonie, WCAG per-kolor (--on-accent/--on-cta/--on-success).
  Rola po zmianie kierunku: MASZYNA DO KODU — źródłem stylu będą zatwierdzone makiety
  (makieta → vision-tokens → systems.json → build), nie ręczne palety.

**CZEKA (bramka Tomka):** wybór makiety 1-4 → ekstrakcja tokens/spec → przebudowa Chłodzika
(+ input rundy 2 CRO) → ten sam pipeline dla lokówki/pompki/endoskopu/jeździka.


## Sesja 2 — 15.07 wieczór: ZMIEŚCIK V5 (FLOW V5, commit c8790b0)
Feedback Tomka → 3 korekty systemowe (wszystkie w STANDARD-LANDING-SKLEPY.md):
1. **FLOW V5**: PLAN od gpt-5.6-sol PRZED grafikami (briefing: zdjęcia+snapshot+opinie+wymagania) — plan rządzi doborem sekcji per produkt; architektura 1-12 = biblioteka. WYMAGANIA-ZAWSZE (loga płatności SVG, sticky ATC, opinie ZE ZDJĘCIAMI, wideo, tracking).
2. **Esencja produktu**: plan GPT nadużył „no product" → sceny bez sensu próżni; sceny kluczowe [P] MUSZĄ pokazywać mechanizm/efekt (regeneracja B/D/E/F v2 z ref g0/ae + „reproduce EXACTLY").
3. **Mapa assetów + warstwa życia**: taksonomia [P]/[D], tabela asset→sekcja→użycie, cięcie arkuszy (6 ornamentów + 2 pasy użyte!), 6 animacji (linia kompresji scrollem, reveal, count-up, suwak z auto-zajawką, parallax, sticky).
4. **HERO = makieta-first**: pełna makieta 1. ekranu → kod 1:1 → WOW za 1. próbą.
Wynik: 15 generacji (0 odrzutów po v2), kod 100% agent (0 calli wf2-gpt — odstępstwo; werdykt v4: GPT pisze sekcje dobrze), Playwright 8/8 PASS.
**Wnioski fabryczne:** (a) VISION-GATE zdjęć opinii OBOWIĄZKOWY — ae-* bywają zrzutami apki AliExpress/obcą marką (VOLLYC)/off-topic; (b) rehost tylko bud-assets/<slug>/ (whitelist edge); (c) reduced-motion: treść ukrywana dopiero klasą .anim z JS; (d) koszt V5: ~15 obrazów ≈ 3,3 zł + plan 15,4k tok ≈ 0,4 zł.
Otwarte: pixel/canonical placeholdery (gate przed kampanią); cross-model review wf2-gpt.


## 2026-07-19 — Sesja: ETAP 3 wykonany przez API (sklep na platformie)

**Zrobione (wszystko przez adapter wf2-platform, sklep test 019f650b…):**
- pl_branding DONE: logo-combo + favicon Trafionka wgrane (upload_logo/upload_favicon), widoczne na storefroncie.
- pl_produkt DONE ×2: „Odprężek — masażer karku i ramion" 299,00 (slug masazer) + „Drapek — drapak ścierający pazury" 149,90 (slug drapek); checkout_url zmaterializowane, kasy 200; kolumny platform_* zapisane.
- pl_landing DONE ×2: publish_landing masazer (131 KB) + drapek (130 KB); WF2_PRODUCT_ID + canonical podmienione, NOINDEX ZOSTAJE do aktywacji trafionek.pl. Weryfikacja agenta (desktop+mobile): render PASS, CTA hydratowany do kasy, ceny live z wf2-landing-api, window.trevio true, konsola czysta.
- pl_dostawy IN_PROGRESS: metoda COD „Kurier — płatność przy odbiorze" 14,99 (broker Sandbox, pobranie NA GÓRZE); set_cod_account czeka na NRB (pl_dane). Apaczka: supportsCashOnDelivery=true, konto COD nieskonfigurowane.
- pl_integracje IN_PROGRESS: pixel czeka na Etap 4 (pixel_id); GA4 nie używamy.
- Pasek Podglądy: linki do obu landingów; pilot Uśmieszka usunięty z linków (strona-widmo: nie ma jej w pages, ale URL nadal serwuje stary HTML — zgłosić Adrianowi).

**Decyzje:** noindex na starter-domenie ZOSTAJE (indeksację włączamy dopiero z trafionek.pl — wtedy re-publish z finalnym canonical); nazwa platformowa produktu = mini-marka + czym jest (widoczna w kasie).

**Czeka na Tomka:** zakup trafionek.pl (LH.pl) → pl_domena · NRB do pobrań + dane prawne (pl_dane) · Etap 4 kroki klienckie (konto ads, strona FB, budżet).
**Następne w kolejce (auto):** pl_glowna (galeria Trafionka, publish_landing path:'') · pl_prawne (po pl_dane) · landingi 4 kandydatów (fabryka) · pl_test na końcu.
**Kosmetyka do fabryki:** masażer mobile — pusty pas ~500 px między zdjęciem hero a nagłówkiem (agent, nie blokuje).

## 2026-07-21 — Sesja: pl_glowna WDROŻONE + Etap 3 odtworzony na własnym sklepie

**Zrobione (sesja 0a6253d4):**
- **Etap 3 ODTWORZONY na sklepie 019f847d (trafionek.pl, domena custom AKTYWNA):** pl_produkt ×3
  (Odprężek 179,00 / Drapek 74,90 / Kłujek 109,90 — ceny z kalkulacji 21.07; kasy HTTP 200)
  + pl_landing ×3 (noindex ZDJĘTY, canonical finalny). pl_sklep → done.
- **Naprawa rozjazdu cen:** landingi miały zapieczone STARE ceny (299/149,90/179) w title/meta/og,
  elementach data-price i JSON-LD/config — podmienione na ceny z bazy + re-publish ×3 (agent Sonnet).
- **pl_glowna = NOWY KROK FABRYKI:** SSOT `docs/zbuduje/STRONA-GLOWNA.md` + `home-forge.py`
  (build=GPT szablon z markerami → render=karty z bazy deterministycznie → og → publish).
  Koncepcja: analiza Sonnet 5 (witryna-rozdzielnia 5-6 sekcji; rama kart = parasol, produkt żyje
  w foto; równe szanse portfela; OnlineStore+ItemList bez aggregateRating). https://trafionek.pl
  LIVE — 3 karty, 2 rundy visual-verify (8/10; poprawki: medalion sygnatury w intro, chipy
  zaufania hug-content, glif „ń" Fredoki = fallback Baloo 2 per-glyph). Koszt ~0,5 zł z 15 zł.
- **wf2-gpt: routing multi-provider** (kimi-* → Moonshot, KIMI_API_KEY; list_models) — benchmark
  Kimi K3 vs gpt-5.6-sol na tym samym briefie (decyzja o domyślnym koderze = Tomek).
**Lekcja fabryki:** Kimi K3 nie mieści się w wall-clock edge (504) — duże generacje przez
lokalny runner z kluczem z .env (technika echo), jak OPENAI_API_KEY.

## 2026-07-21 wieczór — pl_glowna v1.2-1.3: wideo w kaflach + automat card-loopów

- Korekta Tomka: wideo hero-loop = KAFEL karty produktu, NIE hero (rotator wycofany;
  hero = statyczny medalion). Hero-loopy typu FADE (masażer/drapek — kremowa strefa pod
  copy landingu) odrzucane automatycznie (heurystyka _fade_frame, kalibracja 3/3).
- Dedykowane card-loopy masażer+drapek: scena fullframe HIGH z refami (bramka wierności
  2 pary oczu PASS) → Kling 2.5 pętla first=last (RMS 2,0/1,4) → 208/252 KB mp4+webm.
  Kłujek zostaje na swoim hero-loopie (fullframe od początku). Koszt rundy ~4,5 zł.
- **AUTOMAT: cardloop-forge.py (scan/gen/run)** — cały tor jako narzędzie fabryki
  (scene-brief GPT → scena → werdykt vision 5×T/N → Kling → RMS → upload → dowody QA);
  wpięty w prompt-mapę pl_glowna (krok 2b); SSOT STRONA-GLOWNA v1.3.
- Incydent naprawiony systemowo: zagnieżdżone komentarze HTML → wyciek CARD-TEMPLATE do
  DOM (render zawsze wycina blok referencyjny). Cache domeny custom: snapshot per host
  >2h, flush=unpublish→publish (nota do Adriana: revalidate przy PUT).
- Benchmark koderów (ten sam brief): gpt-5.6-sol 8,5/10 · ~1,0 zł · 90 s vs kimi-k3
  7/10 · ~0,40 zł · 390 s (tylko stream, lokalny runner). Default zostaje gpt-5.6-sol;
  Kimi = drugi silnik w wf2-gpt (routing kimi-*).

## 2026-07-21 wieczór — pl_prawne: KANON DOKUMENTÓW PRAWNYCH (SSOT docs/zbuduje/PRAWNE.md)

- **Audyt prawny (2 agenci: research prawa lipiec 2026 + audyt 9 plików):** stare szablony
  v1 (templates/dokumenty-prawne, odświeżone 14.07) = 9/10 prawnie (ODR-wygaszenie, cło
  1.07.2026, Omnibus, SCC już były); świeże strony Trafionka = ładne, ale prawny REGRES —
  na produkcji wisiał ZAKAZANY link do wygaszonej platformy ODR (hotfix §9 od ręki).
- **Kanon: templates/prawne-sklepy/ (7 szablonów + VERSION 1.0-2026-07-21):** regulamin
  §1–§14 (Omnibus 30 dni, COD, magazyny zagraniczne uczciwie, cena końcowa z cłem,
  niezgodność z umową 5a, opinie art. 7 pkt 5 upnpr, GPSR, ADR bez ODR, zmiany z 14-dn.
  wyprzedzeniem), polityka prywatności (transfery EOG: Meta DPF/SCC + dropship art. 49),
  cookies (PKE art. 399), zwroty, formularz odstąpienia (zał. 2 UPK, print CSS), dostawa
  (box cło od 1.07.2026: „cena końcowa, zero dopłat"), kontakt. Szkielet brand-tokenizowany.
- **legal-forge.py (data/render/publish/update-all):** dane z pl_dane portalu (+ nowe pola:
  regon/phone/return_address), tokeny z wf2_projects, bloki warunkowe IF, weryfikacja
  PRAWNE-V z retry (origin odświeża async), panel-sync; **update-all = masowa aktualizacja
  wszystkich sklepów przy zmianie prawa** (sync szablonów też do Storage legal-szablony/).
- **HOT-UPDATE portal→sklep:** wf2-portal task_save(pl_dane) → auto re-render+re-publish
  7 stron w tle (koalescencja 60 s, szablony ze Storage, best-effort; wpis legal_refresh
  w kronice). Klient zmienia dane w portalu = dokumenty na sklepie same się aktualizują.
- Wpięcia: krok pl_prawne sort 95→50 (PRZED produktami/landingami — linki stopek nigdy
  martwe) + milestone; footer@1 i home-template +Polityka cookies; _substitute 7 ścieżek
  (koniec wycinania „Dostawa"); gate published +COOKIES_URL/ODSTAPIENIE_URL + FAIL na
  martwy ODR-link; panel v1 tn-workflow: +zakładki Cookies/Formularz (5 dokumentów) +
  poprawki szablonów v1 (PKE, bez C-21/23, opinie, „(rękojmia)"→5a).
- Nota do Adriana: storefront wstrzykuje pixel Meta PRZED zgodą (PKE) — potrzebny CMP/baner.

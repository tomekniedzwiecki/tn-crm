# STANDARD-LANDING-SKLEPY — fabryka landingów pod maksymalną konwersję (workflow v2)

**Status: OBOWIĄZUJE — wersja 2.0 (przepisana na czysto 2026-07-16 po dopracowaniu flow
na Świtku; wersja 1.x z 15.07 + kilkanaście korekt Tomka skonsolidowane).**
Research CRO: Baymard/CWV/Gemius/tpay/FTC — źródła na końcu. Rzemiosło self-contained
i przegranie do platformy: PROCEDURA-HTML-PRODUKTU.md.

**🎯 Cel: sklepy mają SPRZEDAWAĆ. Benchmark: CR 3%+ (zimny ruch Meta, mobile, COD).**
Kontekst: ~90% ruchu mobile z Reels/FB (impuls), rynek PL (19% kupujących oszukanych 2024 —
lęk #1 = scam), checkout na osobnej domenie platformy (CTA → checkout_url), COD dostępny.

---

## 0. ZASADY NADRZĘDNE (rozstrzygają każdy konflikt niżej)

> **📚 KAPITALIZACJA / REUSE (wdrożone 21.07) — runbook `KAPITALIZACJA-OPS.md`.** Fabryka nie startuje
> od zera: **przed F1** sięgnij po `EXEMPLARY-INDEX.md` (2–5 najbliższych dobrych wzorców — trafność
> **i** różnorodność), reużyj skeletonów `moduly/{porownanie-tabela,opinie,offer-box}@1` (headless,
> przez `TOKEN-KONTRAKT.md`), złóż briefing **prefix-first** ze statycznych `PARTIALE-PROMPTY.md`
> (auto prompt-cache), przejdź **preflight** (KAPITALIZACJA-OPS §3), a po F8 zdeponuj kapitał (wiersz
> indexu + lekcja w `LEKCJE-LANDINGI.md`). ⛔ **Reuse = rzemiosło (kod/rytm/mechanika), NIGDY wizja/
> copy** — te zostają partyturą per produkt (poziom C), a `cross_landing` pilnuje anty-klonu. RAG copy/
> warianty = `FAZA2-COPY-WARIANTY.md`, **wyłączone** do akceptu Tomka.

**Z1 — MESSAGE MATCH.** Landing kontynuuje rozmowę z kreacji: hero = echo hooka (ta sama
obietnica + motyw wizualny; case'y +34…66% CR). Mapa `HOOKS={1..3}` w skrypcie, `?h=N`
podmienia h1+sub; kreacja N linkuje `?h=N`. Nie budujemy osobnych landingów per kreacja.

**Z2 — 🖼️ MAKIETA JEST ŚWIĘTA. PRIORYTET #1 CAŁEGO PROCESU (Tomek 16.07 wieczór, po ocenie
Uśmieszka — zaostrzenie GRAFIKA-FIRST): zaakceptowana makieta = JEDYNE źródło prawdy o wyglądzie
strony. Strona to CZYSTE PRZENIESIENIE makiet — kod niczego nie dodaje, nie usuwa i nie
„ulepsza".** Wszystko, czego strona potrzebuje (karta oferty, cena, pasek trust, pay-row,
prawdziwe dane), MUSI znaleźć się NA MAKIECIE — wchodzi do PROMPTU makiety (wymagania sekcji 3
+ dane F0). Jeżeli czegoś brakuje albo makieta zawiera błąd → **POPRAWIAMY GRAFIKĘ**
(regeneracja makiety), NIGDY nie łatamy kodem. Cała ocena, krytyka i decyzje smakowe dzieją
się NA MAKIETACH, przed akceptem; po akceptcie jedyną miarą strony jest WIERNOŚĆ makiecie.
Kod robi wyłącznie to, czego statyczna grafika nie umie: żywy tekst (IDENTYCZNA treść
i wygląd jak na makiecie — SEO/GEO/pixel/edycja), linki/CTA, interakcje, pomiar.
**Scena = TŁO CAŁEJ SEKCJI, FULL-BLEED** (absolutny `<img>` `object-fit:cover` pod treścią;
hero = pełny pierwszy ekran); NIGDY scena jako obrazek w kolumnie. Zero tekstu wypalonego
w grafice na FINALNEJ stronie (na makiecie tekst jest — kod odtwarza go 1:1 jako HTML).

**Z3 — BOGATO ALE SPÓJNIE.** Landing jak od agencyjnego seniora „za wielkie pieniądze".
Nie oszczędzamy na grafikach/JS/animacjach/funkcjach — oszczędzamy na marnotrawstwie.
**Budżet 25 zł/landing (~$6.75; podniesiony przez Tomka 16.07)** — plan alokacji:
makiety F2 ~$1.7-2.0 (24-30 obrazów) · grafiki produkcyjne F3 ~$0.6-0.9 (hero×3+sceny+OG) ·
kod+efekty F4/F5 ~$0.8-1.2 · pętle F7 ~$0.8-1.2 · rezerwa na regeneracje i iteracje
W GÓRĘ ~$1.5-2.0. Landing za 2-3 zł = za ubogi = FAIL kalibracji.
Spójność robi styl-master jako referencja KAŻDEJ generacji + mapa assetów (chaos = brak DNA
stylu, nie liczba grafik). Krytyk pyta: „czy to wygląda na DROGI projekt?" — ubogi landing
iterujemy W GÓRĘ. **Bogactwo to nie liczba grafik, lecz DETAL INTENCJONALNY (research 17.07):
warstwowość, kontrast typograficzny (caps-label + oversized serif), jeden mocny akcent na
sekcję (highlight/wielka liczba/annotation), asymetria i sygnatura wydawnicza (hairlines,
plusiki). **⛔ ZAKAZ numeracji sekcji „01 / 12" na stronie (Tomek 17.07: „bez sensu")** —
numery kroków WEWNĄTRZ sekcji (demo 01/02/03) zostają. Gładkie tła bez ziarna, równe siatki kart i wyśrodkowany split 50/50 =
„poprawny AI-generyk" = FAIL kalibracji human-touch (patrz DETAL-LAYER w F2).**

**Z4 — KOD: ROZSTRZYGAJĄ GATE'Y, NIE AUTOR (zaktualizowane 18.07 po 3 przebiegach).**
Historycznie „ZAWSZE gpt-5.6-sol"; w praktyce kod autorski agenta przeszedł 3× (Loczek/
Odpalak/Drapek) z zielonymi gate'ami, a od R13 jakość rozstrzygają TWARDE, deterministyczne
gate'y (layout-diff strukturalny + rubryka werdyktu 5×T/N + dowód dopasowania + PASS 1-5),
niezależnie od tego kto napisał kod. Zasada: **kod może pisać agent autorsko LUB gpt-5.6-sol
(edge `wf2-gpt`) — wybór wg niezawodności/złożoności; to co MUSI przejść to gate'y F6/F7,
nie pochodzenie kodu.** gpt-5.6-sol zalecany przy gęstych/nietypowych sekcjach (świeże
spojrzenie), agent autorski przy spójności całości i mechanice z modułów kanonicznych.
Odstępstwo raportowane w LEDGER (który autor), ale NIE jest już wadą samą w sobie.

**Z5 — UCZCIWOŚĆ = KONWERSJA (rynek PL).** Dane twarde 1:1 ze snapshotu aukcji, uczciwe N
opinii, jeden prawdziwy minus w porównaniu, zero fałszywej pilności. Szczegóły: sekcja 4.

**Z6 — GŁÓWNE ZASADY, NIE SZABLON (Tomek 16.07: „będę tworzyć setki landingów i chcę, aby
były unikatowe"; EGZEKUCJA dołożona 20.07 po audycie 4 gotowych landingów).** Standard podaje
ZASADY (jasne tła, JEDEN akcent w twardym scope, wierność produktu, prawdziwe dane, mikro-oferta
w hero, mobile = mniej niż desktop) i CEL — nie narzuca layoutu, kompozycji ani konkretnego
wyglądu. Briefy makiet = brief celu (F2 🥇); layouty poprzednich produktów są inspiracją POZIOMU
jakości, NIGDY wzorem do kopiowania. Świętość makiety (Z2) działa W OBRĘBIE jednego landingu
(wierność przeniesienia po akcepcie); między landingami rządzi unikatowość (spójne z anty-doorway,
sekcja 5 GEO).

**Z6 miał dotąd zero egzekucji — i to się zemściło.** Audyt 20.07 ocenił parę **masażer ↔ Drapek
na 9/10** w skali „ta sama strona z podmienionym produktem": oba najnowsze, oba po doktrynie
TOKENS-MAKIETY z 19.07, ta sama para fontów, akcent w tym samym paśmie, ta sama mapa sekcji, ten
sam kształt CTA. Diagnoza: fabryka miała pełen aparat wykrywający ZA MAŁO spójności i **ZERO
mechanizmu wykrywającego ZA MAŁO różnicy**. Z6 egzekwują odtąd trzy rzeczy:
1. **PODZIAŁ KANON / PARTYTURA** (`TOKENS-MAKIETY.md` §KANON vs PARTYTURA): KANON = poziom
   warsztatu (rytm 8pt, jasne tła, jeden akcent, para fontów z kontrastem, ciepła głębia,
   mechanika modułów, hierarchia oferty) — nietykalny i identyczny wszędzie. PARTYTURA = tożsamość
   (kroje, kolor akcentu — **wolno i zaleca się wyprowadzić z realnego koloru produktu**, rodzina
   tła, świat/materiał, archetyp hero, dobór i kolejność sekcji, sygnatura) — inna w każdym
   landingu, obowiązkowo uzasadniona w `PLAN.md`. **Odchylenie w PARTYTURZE nie jest defektem
   i nie wolno go „naprawiać" do normy z poprzedniego landingu.**
2. **BIBLIOTEKA ARCHETYPÓW HERO** (§F2 pkt 2) — archetyp NIE MOŻE powtórzyć archetypu poprzednio
   zbudowanego landingu; wybór + uzasadnienie w `PLAN.md` (`archetyp-hero: <litera>`).
3. **GATE CROSS-LANDING** — `gate-check.py` blok `cross_landing` (font display · ΔE akcentu ·
   archetyp · sekwencja sekcji) porównuje budowany landing z 3 poprzednimi. To jedyne miejsce
   w fabryce, które patrzy POZA jeden slug.

**Z7 — KARTA PRAWDY = JEDYNE ŹRÓDŁO DANYCH.** Wszystkie fakty produktu (cena, specs, opis,
warianty, dowody) żyją w JEDNYM bloku generowanym w F0.6 (format §1a). Żaden brief (plan F1,
koder F4, copy) nie dostaje luźnych wyimków snapshotu — dostaje TĘ kartę. Claim bez pozycji
w karcie = CUT; brak pola = „brak danych", nigdy zmyślanie.
**Persona = OSOBNY artefakt (F0.6a `ICP-GRUPA-DOCELOWA.md`), NIE Karta:** Karta to FAKTY ze
snapshotu; persona jest WNIOSKOWANA i sterowałaby tylko światem/castingiem/tonem — nie może
mieszkać w Karcie (złamałaby „claim bez kotwicy = CUT"). ICP nie nadpisuje faktów; konflikt →
wygrywa Karta.

**Z8 — MODELE PER FAZA (optymalizacja kosztów, 18.07; ZASTĘPUJE „subagenci=zawsze Opus").**
Twarde gate'y (gate-check.py · sekcja-diff SSIM+LAYOUT · rubryka 5×T/N · PASS 0-5 · moduły
kanoniczne) są SIATKĄ BEZPIECZEŃSTWA model-agnostyczną → subagent może być tańszy, bo gate łapie
spadek jakości PRZED publikacją. DOMYŚLNY model subagenta fazy = **Sonnet**; **Haiku** dla czystych
skryptów/REST (F-1 inwentarz materiału, source-gate, detail-lint/gate-check/sekcja-diff, panel-sync, backfill,
selektor @32px, F6); **Opus** TYLKO tam, gdzie osąd otwarty i BRAK gate'u za nim:
F1.7 przewodnik graficzny · KRYTYK makiet (art director) · kod sekcji nietypowych/TOR-I flagowej ·
rozwój fabryki (gate'y/most/architektura). gpt-5.6-sol (plan F1 / koder F4 [LUB agent autorsko — Z4] /
choreograf F5) to OSOBNA oś kosztu (OpenAI, steruj `WF2_EFFORT`) — nie mylić z modelem agenta Claude. Vision-gate wg ZAMKNIĘTEJ
checklisty (kuracja galerii, gate wierności 4-warunki, rubryka 5×T/N, PASS 5, detail-lint findings)
= **Sonnet** (mocny vision, osąd zamknięty). Otwarty osąd estetyczny/kreacja = **Opus**.
ESKALACJA (log w LEDGER): Sonnet→Opus gdy (a) 2× brak postępu na tym samym gate, (b) werdykt
graniczny estetycznie, (c) sekcja bez modułu i bez wzorca w katalogu. De-eskalacja: typ sekcji
3× 0-FAIL na Sonnet → zdjęty z eskalacji. Spawn subagenta MUSI podać jawny `model:` (env default
Opus zostaje bezpiecznikiem). Weryfikacja że jakość nie spadła: pierwszy landing hybrydowy przechodzi
TE SAME gate'y na 0 FAIL + A/B werdyktów Sonnet↔Opus na tych samych kompozytach; powtarzalna
eskalacja danego typu (≥2 landingi) = ten typ na stałe Opus. Szacowana redukcja: ~65-70% tokenów
agenta Claude/landing.

---

## 1. FLOW FABRYKI (fazy F0→F8; wykonawca = agent, koder = gpt-5.6-sol LUB agent autorsko — Z4)

**§1-sync — 🔌 SYNC PANELU (OBOWIĄZKOWY na końcu KAŻDEJ fazy).** Fabryka pracuje w plikach na
Desktopie; panel `/tn-sklepy` = jedyne okno Tomka na postęp. MOST = `scripts/mockup-tools/panel-sync.py`
(pełny kontrakt: `docs/zbuduje/MOST-PANEL.md`). Po zamknięciu fazy agent zapisuje krok DONE +
fields + checklistę (VERBATIM!) + artefakty. Wszystko idempotentne (GET→PATCH|POST) — wolno puścić
N razy. Import w Pythonie (`import panel_sync as ps`; payloady PL bez pułapki cp1250), CLI dla ad-hoc.

**🔒 EGZEKWOWALNOŚĆ (18.07): sync = CZĘŚĆ DEFINICJI DONE, nie deklaracja „z pamięci" agenta** (ta sama
klasa luki co samo-deklarowany gate wierności). Pilnuje go `gate-check.py` blok **`panel_sync` (severity
FAIL)**: dla landingu z projektem w panelu (mapowanie `slug`→`wf2_products.slug`) sprawdza maszynowo: (1)
każdy krok, którego DELIVERABLE istnieje w archiwum/kodzie, ma `status='done'`; (2) artefakty == pliki
(makieta/makieta_mobile/scena+galeria HIGH stem-match; dowód=obecność contact-sheetów); (3) karta produktu
(`price/cost_purchase/repo_path/status`) wypełniona; (4) doc `WIERNOSC.md`, wzmianki `footer`/`logo`/`wideo`
mają odbicie w panelu; (5) krok `done` bez `data.fields` = WARN „warsztat pusty". Rozbieżność = FAIL z
KONKRETNĄ listą (co w kodzie/archiwum, czego brak w panelu). Landing bez projektu → **SKIP** (nie każdy
preview ma projekt — np. loczek/odpalak). Pełna tabela artefakt→krok+kind+fields = **`MOST-PANEL.md
§KATALOG MAPOWAŃ`**. **Nowy etap/typ artefaktu bez wiersza w katalogu mapowań (i bez reguły w
`gate-manifest.json panel_sync`) = etap NIEKOMPLETNY** — dopisz wiersz ZANIM wejdzie do fabryki.

**Mapa faza → krok panelu** (scope=produkt; ceny/koszt/status/slug = KOLUMNY przez `product_meta`, NIE fields):
- **wybór/kalkulacja** → `link_product(proj, tt, name, slug, sort, cover)` (dosiewa kroki `wf2_ensure_steps`)
  + `product_meta(pid, {price, cost_purchase, cost_shipping, fees_pct, margin_mode:'test', status:'w_budowie', slug, repo_path})`. `unit_profit` = kolumna GENERATED — NIE pisać.
- **F0 dane/karta/paszport** → `lp_dane` · fields {source_ok, cena_pl, koszt_landed, marza, ocena, zdjecia_keep, wideo_keep, karta_url, paszport_url} · artefakty: `gallery` (kadry keep), `doc` KARTA-PRAWDY.md + PASZPORT.md + GALERIA.md + WIDEO.md + LEDGER.md (**`panel-sync.py doc` → PRYWATNY bucket `wf2-docs/<slug>/` → KLIKALNY chip**; ⛔ `storage='desktop'` ZAKAZANE — patrz „📄 DOKI FABRYKI" niżej).
- **F1 plan + F1.7 przewodnik** → `lp_plan` · fields {motyw, sekcje, tor_i_demo, plan_url, przewodnik_url} · artefakty: `doc` PLAN.md + PRZEWODNIK-GRAFICZNY.md (`panel-sync.py doc` → wf2-docs).
- **F2.5 branding + styl-master + tokeny** → `lp_styl_marka` · fields {marka_nazwa, slug, font, paleta, styl_master_url, tokens_url, brand_dir} · artefakty: `styl_master` + `branding` (favicon / wordmark / logo-combo z Storage) + `doc` TOKENS-MAKIETY.md (SSOT tokenów makiety, `panel-sync.py doc` → wf2-docs).
- **F2 makiety 🏁** → `lp_makiety` · fields {sekcje_count, makiety, tor_i, akcept} · REHOST każdej makiety do `bud-assets/<slug>/makiety/` (`storage_upload(..., max_width=1440, to_webp=True, quality=82)`) → `artifact_add` kind `makieta` (mobile → `makieta_mobile`), `meta={section:'03-problem', viewport:'desktop'|'mobile'}`.
- **F3 grafiki** → `lp_grafiki` · fields {assets_dir, distinct_views, mapa_url, waga_first} · artefakty: `scena`/`image` (grafiki produkcyjne), `doc` MAPA-ASSETOW.md.
- **F4 kod** → `lp_kod` · `product_meta(pid, {repo_path})` + fields {preview_url, video_count} · artefakt `link`/`screenshot_final` (podgląd). **PO smoke PASS: podgląd z ŻYWYM checkoutem na platformie (LL-038)** — `platform-sync.py product <proj> <slug>` + `publish` (wymaga `platform_shop_id` projektu; `repo_path` BEZ prefiksu `tn-crm/`); hydratacja `{{WF2_PRODUCT_ID}}` zachodzi TYLKO w publish, więc formularz zamówienia działa wyłącznie na wersji z platformy; wrapper checkout-inline MUSI mieć `data-zc-product` ORAZ `data-zc-api` (gate-check FAIL); panel: przycisk „Zobacz landing (platforma)" w krokach lp_* + „landing ↗" w matrycy; finalny re-publish po F7 nadpisuje podgląd.
- **F7.1 dopasowanie** → `lp_dopasowanie` · fields {sekcje_done, ssim_min, dopasowanie_dir} · artefakty `dowod`/`proof` (kompozyty NN-*.png).
- **F5 życie** → `lp_zycie` · fields {motion_dna, interakcja_flagowa, tor_i_done} · artefakt `video`/`screenshot_final`.
- **F6/F7/F8 finisz 🏁** → `lp_finisz` · fields {gate_check, landing_url, nowe_wnioski} · artefakty `gate_check`, `landing_live`, `screenshot_final`; `product_meta(pid, {status:'gotowy'})`; `project_link_add(proj, 'Landing <slug>', <preview_url>, 'ph-eye')` gdy jest URL.

⚠️ **4 pułapki** (pełne w MOST-PANEL.md): (1) **checklisty = tekst VERBATIM** z obiektu `WS` w
`tn-sklepy/projekt.html` — panel merguje po dokładnym `t`; literówka/„ulepszenie" = sierota (najprościej:
wyciągnąć `WS[step_key].check` skryptem z projekt.html). (2) **ceny/koszt/marża/status/slug = KOLUMNY**
(`product_meta`, whitelista) — panel ich NIE czyta z `data.fields`. (3) **storage:** `supabase`/`external`
+ rozszerzenie obrazu (lub kind graficzny: makieta/scena/branding/styl_master…) = MINIATURA; `repo`
= chip (tylko pliki realnie commitowane do repo). (4) **wiązanie** artefaktu z krokiem = `product_id` + `step_key`.

**📄 DOKI FABRYKI = PRYWATNY BUCKET `wf2-docs`, NIGDY desktop-only (Tomek 19.07 — incydent masażer:
KARTA-PRAWDY żyła tylko na Desktopie = martwy chip, niedostępna z innego miejsca).** KAŻDY dokument
fazy (.md/.json: KARTA-PRAWDY / PASZPORT / GALERIA / WIDEO / PLAN / PRZEWODNIK-GRAFICZNY /
TOKENS-MAKIETY / MAPA-ASSETOW / WIERNOSC / DOPASOWANIE / SEMANTYKA / RETRO / **LEDGER po każdej
fazie, x-upsert nadpisuje**) idzie przez **`panel-sync.py doc <proj> <prod> <step> <plik> --slug <slug>`**
(= upload do `wf2-docs/<slug>/<plik>` + artefakt `storage='supabase'`, url `wf2-docs/…` → panel robi
signed URL na klik). Bucket jest PRYWATNY (RLS team_members; migracja `20260719e_wf2_docs_bucket`),
bo karta/ledger niosą koszty zakupu i marże — ⛔ NIE wolno ich do publicznego `attachments`
(klienci sklepów mogliby odkryć marżę). Desktop `FABRYKA-*/<slug>/` pozostaje KOPIĄ ROBOCZĄ
(narzędzia czytają lokalnie), ale źródłem dostępnym zdalnie jest wf2-docs. `storage='desktop'`
dla NOWYCH artefaktów = ZAKAZ.

**§1a — FORMAT KARTY PRAWDY PRODUKTU (F0.6; zapis `FABRYKA-*/<slug>/KARTA-PRAWDY.md`).**
Jeden blok markdown, sekcje: **0. Tożsamość** (klasa z title+categories — kategoria Ali
WEWNĘTRZNA, nie na stronę; mini-marka/slug) · **1. Cena** (koszt zakupu per wariant USD
z `sku_prices`; kurs NBP ZAPISANY z datą — audytowalność; NASZA cena PL jedna dla wszystkich
wariantów; końcówki wg reguły <150 →,90 / ≥150 → pełne/9,00). **NASZA cena PL = ODCZYT
z `wf2_products.price`** (panel /tn-sklepy, krok `kalkulacja` w Etapie 1 — done). Fabryka
landingów NIE ustala i NIE modyfikuje ceny; brak ceny/kroku = wykonaj najpierw
`panel-sync.py kalkulacja` (Etap 1), dopiero potem F0. Cena zapieczona w HTML musi być
równa `wf2_products.price` (gate-check `cena_panel`). · **2. Specyfikacja** (`specs`
1:1 VERBATIM, tabela; puste POMIŃ) · **3. Opis sprzedawcy — DESTYLACJA:** FAKTY (z kotwicą
specs/tytuł/galeria — wolno użyć) / BEŁKOT (superlatywy, „premium", zdrowotne, pilność —
ODRZUCONE) / oryginał jako referencja · **4. Warianty** (tabela: oryg. nazwa → PL → koszt USD
→ czy swatch [tylko z dowodem koloru w galerii]; MODEL CENY: jedna cena PL, wariant = wybór
estetyczny) · **5. Dowód** (`sold_volume` wg reguły §sold niżej; `review_stats` 1:1; `video_url`
po vision-gate; `shop` 🚫 NIGDY na stronie) · **6.** wskaźnik na `gallery_curated` · **7.**
wskaźnik na `PASZPORT.md` i `videos_curated`. **DESTYLACJA:** FAKT (konkret weryfikowalny
z kotwicą) / BEŁKOT (ocena bez miary → CUT) / WĄTPLIWE (wygląda jak fakt, brak w specs → CUT
chyba że galeria/tytuł potwierdza). Mapowanie: materiał→jakość+FAQ konserwacja; specs→tabela+
porównanie; opis-FAKTY→feature→benefit z kotwicą („stal nierdzewna"→„nie rdzewieje, służy
latami (spec: Materiał=stal nierdzewna)"); zestaw→oferta; użycie→demo 1-2-3.
**§sold — `sold_volume`:** liczba Ali GLOBALNA ≠ nasz sklep → „X sprzedanych u nas" = FAŁSZ =
ZAKAZ. Domyślnie POMIJAMY; opcjonalnie (≥1000) JEDNA nieprzypisana fraza bez liczby
(„sprawdzony produkt, tysiące zamówień na świecie"), nigdy licznik/pilność. Główna rola:
wewnętrzny gate doboru. `shop{name,url}` 🚫 NIGDY na stronie (white label) + grep gate w F6.

**F-1 — INWENTARZ MATERIAŁU (PRZED F0).** ⛔ **NIE JEST BRAMKĄ PRODUKTU.** Dyrektywa Tomka
(20.07): *„nie chciałbym abyś w etapie budowy landinga decydował o tym. To jest za późno,
produkt jest wybrany. Twoją robotą powinno być zrobienie landinga a nie dyskutowanie o tym,
czy się sprzeda."* Gdy produkt trafia do fabryki landingów, decyzja zakupowa **już zapadła**
— wybór produktu, cena, marża, opłacalność i ryzyko rynkowe należą do Etapu 1 (radar/decyzja
Tomka), NIE do budowy strony. Fabryka landingów **nie liczy marży, nie bada półki cenowej,
nie wydaje werdyktów GO/NO-GO i nie proponuje zmiany produktu.** Jeśli w trakcie budowy
zauważysz coś niepokojącego ekonomicznie — **zgłoś to Tomkowi jedną linijką i buduj dalej**;
nie zatrzymuj pracy i nie otwieraj dyskusji o sprzedawalności.

Co F-1 robi naprawdę: **liczy MATERIAŁ, żeby zaplanować robotę graficzną.** Ze snapshotu:
ile realnych kadrów produktowych po odsiewie (≥2 czyste packshoty = lekka faza graficzna;
mniej = planuj CROP-y/regeneracje i doliczy czas), ile opinii z treścią i zdjęciami (materiał
do sekcji opinii), ile klipów wideo DODANYCH do produktu (`tiktok_url` + `ali_snapshot.
video_url` — LL-044: N dodanych = N kafli, 0 = brak sekcji jako stan danych), jakie specs
są PUSTE (→ zero zmyślonych cm/kg w copy). To jest kosztorys pracy, nie ocena biznesu.
Wynik F-1 nigdy nie brzmi „produkt odpada", tylko „ta strona wymaga X regeneracji".

**F0 — DANE + VISION-GATE.** Snapshot z `bud_tt_products.ali_snapshot` (tytuł, opinie
z text_pl, review_stats, sku_prices; PUSTE specs = tylko komunikaty jakościowe, zero
zmyślonych cm/kg). **🚫 GATE `source='detail'` — TWARDY, PIERWSZY KROK (incydent Latarek
17.07: search-galeria = INNY produkt → landing sprzedawał nieistniejące cechy): procedura
`docs/zbuduje/GALERIA-ALI.md` §0; source≠detail po force:true = STOP PRODUKTU.
Następnie F0.5 KURACJA GALERII (GALERIA-ALI §1-4): werdykty per kadr →
`bud_tt_products.gallery_curated` + kopia GALERIA.md; galeria na stronie budowana TYLKO
z kuracji (klasa R).**
**Następnie F0.6 KARTA PRAWDY PRODUKTU (format §1a):** jeden blok markdown ze WSZYSTKICH pól
snapshotu (cena z `sku_prices`+NBP, specs 1:1, DESTYLACJA opisu FAKT/BEŁKOT, warianty+mapowanie
PL, `sold_volume`/review/video/shop) + wskaźniki do `PASZPORT.md`, `gallery_curated`,
`videos_curated`. Zapis `FABRYKA-*/<slug>/KARTA-PRAWDY.md`. **Każdy brief (F1/F4/copy) dostaje
TĘ kartę zamiast luźnych wyimków (Z7).** Puste pole = „brak danych", nie zmyślać.
**SANITY LICZB (Odpalak 17.07: „20000-30000 mAh" i „diesle do 10 L" przeszły, bo miały
„kotwicę" w aukcji):** (a) ZAKRES z wariantów ≠ kotwica — na stronę idzie KONKRET
kupowanego wariantu; (b) liczba z aukcji sprzeczna ze spec (tytułowe „7000A" vs spec
„>1200A") = BEŁKOT; (c) wartości fizycznie nierealne dla kategorii (pojemność silnika,
moce, czasy) = weryfikuj zdrowym rozsądkiem, wątpliwa = nie cytuj. Karta oznacza
każdą liczbę: [KONKRET-SKU] / [SPEC] / [BEŁKOT-CUT].
Vision-gate KAŻDEGO materiału: zdjęcia aukcji (infografiki z obcym
tekstem/marką = odrzut z galerii, treść wolno cytować), zdjęcia opinii (zrzuty apki
AliExpress/obce marki/off-topic = odrzut), WIDEO (poster/klatka — off-product w obie strony
= sekcję pominąć, nawet przy milionach wyświetleń). Cena = półka rynkowa kategorii PL +
zdrowa marża (nie sztywny mnożnik); końcówki: <150 → ,90; ≥150 → pełne/9,00. Mini-marka:
USP-first zdrobnienie korzyści (Zmieścik/Świtek/Blasik…), slug lowercase bez znaków.
**REZERWACJA w `bud_brand_names`** (INSERT-or-fail per `product_id`, `scripts/mockup-tools/
brand-forge.py` albo REST): kolizja (0 wierszy) = następna kandydatka (pętla). Nazwa zajęta
dla innego usera/landingu TEGO produktu NIE wraca. Rezerwacja PRZED generacją favicona (F2.5).

**F0.6a — ICP / GRUPA DOCELOWA (OPCJONALNY, NIEBRAMKOWANY artefakt; 20.07).** Obok Karty
powstaje `FABRYKA-*/<slug>/ICP-GRUPA-DOCELOWA.md` — JEDNO źródło persony, z którego wyprowadza
się ŚWIAT, CASTING, TON i AKCENTY makiet. Domyka rozjazd: doktryna (TOKENS §PARTYTURA, PRZEWODNIK)
wielokrotnie mówi „wyprowadź z persony", ale persony jako danej nie było — agent wymyślał ją inline.
**Brak pliku = zachowanie dzisiejsze** (agent wnioskuje personę inline) — artefakt jest OPCJONALNY,
NIE wchodzi do `gate-manifest.json`, NIE tworzy żadnego FAIL, NIE jest wymaganym wierszem MOST-u.
Powstaje w F0.6 (po Karcie) lub na wejściu F1; źródło = brief zlecenia · pole `dla_kogo`/`persona`
z kroku brandingu (spójność landing↔reklama) · lub wywnioskowany z produktu+kategorii.
**Rozłączny z Kartą (Z7): Karta = FAKTY produktu 1:1 ze snapshotu; ICP = persona WNIOSKOWANA** —
trzymanie persony w Karcie złamałoby „claim bez kotwicy = CUT". Dyscyplina tagów jak w Karcie:
każde pole **[DANA]** (z briefu/`dla_kogo`) albo **[WYWNIOSKOWANA]** (z produktu+kategorii).
Schemat (pod realnych konsumentów — F1 kierunek, F1.7 casting, F2.5 partytura, ton copy):
- **0. Pochodzenie** — skąd persona (brief / `dla_kogo` / wywnioskowana) + tag.
- **1. Kto (demografia)** — płeć+rozkład, wiek, wrażliwość cenowa, miasto/wieś, sytuacja życiowa.
- **2. Psychografia** — wartości, styl życia, poziom świadomości (problem/rozwiązanie-aware), poziom obiekcji.
- **3. Kontekst użycia** → steruje **RODZINĄ TŁA i ŚWIATEM** (F2.5/F1.7): gdzie/kiedy/z kim/jak często (sypialnia/łazienka/kuchnia/warsztat · dzień/wieczór).
- **4. Ból / JTBD** — praca do wykonania, wyzwalacz zakupu, stary sposób (→ scena `problem` bez produktu), obiekcje.
- **5. Casting sceny** (→ F1.7, najważniejsze dla hero) — kto w kadrze (wiek/płeć/sylwetka; dłonie-only vs sylwetka bez twarzy), sceneria/wnętrze, stylizacja, rekwizyty, **ANTY-CASTING** (czego NIE pokazywać — np. „model-stock/bikini").
- **6. Ton copy** — rejestr (ciepły/rzeczowy/premium), słowa-klucze persony, słowa-zakazane.
- **7. Akcenty sekcji** — które sekcje wzmocnić dla tej persony.
**⛔ GRANICA TWARDA:** ICP steruje **ŚWIATEM · CASTINGIEM · TONEM · AKCENTAMI**, NIGDY danymi
produktu. Nie nadpisuje Karty (fakty) ani Paszportu (wygląd); konflikt ICP↔Karta/Paszport →
**wygrywa Karta/Paszport**. Konsumenci: **F1** (briefing czyta ICP → uzasadnienia partytury +
hero-sub „dla kogo"), **F1.7** (casting/świat/rekwizyty/anty-casting per sekcja z §5), **F2.5**
(rodzina tła/świat z §3), **copy** (ton z §6). Chip do panelu additywnie: `panel-sync.py doc`
(bucket `wf2-docs`) na `lp_dane`/`lp_plan` — niebramkowany.

**F1 — PLAN OD GPT (zawsze pierwszy krok).** Briefing (wzór: scratchpad zmiescik-plan-
briefing.md, aktualizowany o ten standard): cel+kontekst, zdjęcia produktu jako input_image
(MAX 2 — limit edge), dane F0, pełne opinie, wymagania-zawsze, zakazy, kalibracja Z2/Z3.
GPT zwraca: koncepcję pod TEN produkt (motyw przewodni = wizualna metafora korzyści,
NIGDY „clean e-commerce"), dobór i kolejność sekcji z uzasadnieniem, paletę+font+charakter,
listę grafik, funkcje konwersji.
**⚠️ PLAN.md NIESIE PARTYTURĘ (20.07, Z6):** plan zamyka się dopiero z jawnymi decyzjami
i uzasadnieniami dla: **rodziny tła · koloru akcentu (domyślnie wyprowadzonego z realnego koloru
produktu) · pary krojów · sygnatury · archetypu hero linią `archetyp-hero: <litera>` (biblioteka
§F2 pkt 2) · doboru i KOLEJNOŚCI sekcji**. Uzasadnienie brzmi „ten produkt/persona prowadzi
do tego, bo…", nigdy „jak poprzednio". Agent PRZED planem sprawdza partyturę 3 poprzednich
landingów (`gate-check.py --cross-only <slug>` albo ich `TOKENS-MAKIETY.md`) i celowo się od
niej odbija — inaczej gate `cross_landing` zablokuje landing dopiero w F6, po wygenerowaniu
wszystkich makiet.
**Persona partytury = `ICP-GRUPA-DOCELOWA.md` gdy istnieje (F0.6a):** briefing F1 zaciąga z ICP
demografię/kontekst/casting zamiast free-textu, więc uzasadnienia „ten produkt/persona prowadzi
do…" oraz hero-sub „dla kogo" wychodzą z JEDNEGO źródła (spójne z reklamą, gdy ICP zasiane z
`dla_kogo`). Brak pliku = agent wnioskuje personę inline jak dziś (zero regresji).
FILTR PLANU (my): zakazy, formularz→CTA checkout_url,
esencja produktu na scenach kluczowych, jasne tła, **ANTY-MISMATCH ROZSZERZONY (GALERIA-ALI §5):
tabela CLAIM→ŹRÓDŁO ∈ {tytuł detail, specs, galeria detail, opinie, opis-FAKTY po destylacji};
KAŻDA korzyść NIESIE KOTWICĘ w nawiasie („służy latami (spec: Materiał=stal nierdzewna)");
claim bez źródła = CUT; claim o klasie produktu/elemencie tożsamości bez źródła = STOP planu;
BEŁKOT (superlatywy/oceny bez miary z Karty Prawdy) NIGDY nie wchodzi do copy.**

**F1a — MANIFEST SEKCJI = KONTRAKT KOMPLETNOŚCI (BRAMKOWANY; 20.07, Tomek: „pilnować, czy
WSZYSTKIE sekcje, które muszą być, zostały wygenerowane — żeby do takich sytuacji nie dochodziło").**
Plan F1 zamyka się jawną, ponumerowaną **LISTĄ SEKCJI** (id · typ · status), która staje się
KONTRAKTEM dla F2/F4/gate. Blok w `PLAN.md` (nagłówek dokładnie `## MANIFEST SEKCJI`):
```
## MANIFEST SEKCJI
1.  hero        | scenowa | build
2.  zaufanie    | kodowa  | build
5.  wideo       | kodowa  | SKIP — 0 użytecznych klipów (KARTA §9); UGC → galeria+opinie
9.  mid-cta     | scenowa | build   (dedykowana sekcja CTA — §4 CTA)
12. final       | scenowa | build   (FINAL CTA)
```
- **`build`** = sekcja MUSI mieć komplet: makietę **d+m** (F2) · `<section id>` w kodzie (F4) · kompozyt dowodu (F7.1).
- **`SKIP`** = dozwolony **TYLKO z JAWNYM POWODEM** w tej samej linii, z kotwicą (KARTA/LEDGER). Powód = FAKT
  („0 klipów", „0 opinii z treścią"), NIGDY „nie zdążyłem". **Cichy brak planowanej sekcji = FAIL**, nie „może być".
- **Gate `sekcje_plan`** (F6, `gate-check.py`) rekoncyliuje: KAŻDA `build` z manifestu ↔ makieta ↔ `<section id>` ↔
  kompozyt dopasowania. Planowana `build` bez pokrycia = **FAIL**; sekcja w kodzie spoza manifestu = WARN (nieplanowana);
  `SKIP` bez powodu = FAIL. Manifest MUSI zawierać rdzeń `hero · zamow · final · mid-cta` jako `build` (brak rdzeniowej = FAIL).
- **MANIFEST JEST WYMAGANY dla NOWYCH landingów (inaczej cała gwarancja byłaby opcjonalna):** landing, którego kod
  (`index.html`) dotknięto **od 20.07**, BEZ `## MANIFEST SEKCJI` w PLAN.md = **FAIL** (gate `sekcje_plan`, dyskryminator
  po mtime kodu). Landing sprzed reguły (kod starszy) = SKIP — retro włącza się SAM przy najbliższym dotknięciu (mtime dziś).
- **Powód (Tomek na macie — brak dedykowanej sekcji CTA i wideo):** dotąd gate liczył sekcje **Z GOTOWEGO HTML**
  → sekcja porzucona PRZED buildem (koder ją pominął, plan o niej „zapomniał") była NIEWIDZIALNA. Manifest zamienia
  pytanie „co zbudowano?" na „co MIAŁO powstać?" — i egzekwuje różnicę.

**F1.7 — PRZEWODNIK GRAFICZNY (całościowy plan wizualny; PRZED makietami).**
Po planie F1, przed F2, agent tworzy RAZ per landing przewodnik warstwy wizualnej:
łuk narracyjny (każda sekcja = klatka filmu), matryca OSI RÓŻNORODNOŚCI (≥3 konteksty
/ ≥3 skale / ≥2 światła / człowiek ≥30% / ≥2 perspektywy), karta per sekcja
{rola→ujęcie→emocja→seed EN→powiązanie z sąsiadami} i REGUŁA RYTMU (2 sąsiednie
sekcje nie dzielą kontekst+skala; **⛔ ANTY-SZEW: dwie sąsiednie sceny PEŁNOKADROWE nie mają
obrazu po tej samej stronie — inaczej kadry stykają się w twardy szew; ZIG-ZAG L/P lub sekcja
rozdzielająca; PRZEWODNIK pkt 2**). Powód (Loczek 17.07): katalog ujęć §2 wymusił
różne POZY, ale JEDEN świat (różowe studio) → „wszystko wygląda tak samo". Gate:
krytyk ocenia SAM przewodnik („czy z opisów widać różnorodność i ciąg?") PRZED
makietami. Pełny proces: `docs/zbuduje/PRZEWODNIK-GRAFICZNY.md`. Zapis:
`FABRYKA-*/<slug>/PRZEWODNIK-GRAFICZNY.md`. Seedy przewodnika wchodzą do promptów
makiet F2 jako zadany świat/kontekst każdej sceny.
**Casting i świat z ICP (F0.6a) gdy istnieje:** karta KAŻDEJ sceny wyprowadza kto-w-kadrze /
sceneria / stylizacja / rekwizyty / ANTY-CASTING z `ICP-GRUPA-DOCELOWA.md §5` (hero przede
wszystkim — bohater kadru = persona rdzeniowa ICP). Brak ICP = osąd agenta jak dziś. To domyka
oś „człowiek/świat ← persona": przewodnik dostaje wreszcie realne źródło, nie zgadywankę.

**F1.7b — SCENY ANIMOWANE „ANIM-3" (feedback Tomka 22.07 — animacja hero jest na tyle mocna,
że landing dostaje budżet na ruch w TRZECH miejscach; wybór ZAWCZASU, na etapie planowania
grafik — nie doklejka na końcu).** PRZEWODNIK niesie obowiązkowy blok `## SCENY ANIMOWANE`:
**hero + DWIE dodatkowe sekcje**, każda z wpisem {sekcja · nośnik ruchu · beat pętli (co się
rusza, jak wraca do klatki 1)}. Kryteria wyboru dwóch dodatkowych:
(1) scena ma NATURALNY NOŚNIK RUCHU FIZYCZNEGO (para/płyn/tkanina/sypkie/dym/światło/włosy/
olej) — produkt pozostaje statyką (doktryna hero-video, LL-022); (2) rozrzut po narracji —
jedna w górnej, jedna w dolnej połowie strony (nie dwie sąsiednie); (3) preferuj typ osadzenia
B/C fullframe (ruch działa najmocniej na pełnym kadrze); ⛔ nie sekcje TOR-I (już żyją
interakcją), nie zamow/faq. **Grafiki scen ANIM w F2/F3 są KOMPONOWANE POD RUCH** (wzorzec
mata-v6): nośnik ruchu „WYSTAWIONY" — ma przestrzeń w kadrze i nie jest przycięty krawędzią,
zero tekstu wpieczonego w strefie ruchu, kompozycja znosi delikatny dryf pętli. W F6 sceny
ANIM dostają klipy Kling i2v (pętla first=last) jak hero — budżet +2 klipy (~0,35 $/klip).
Jeśli po F3 któraś scena ANIM straciła nośnik ruchu — wybierz inną scenę ALBO 1 regeneracja
pod ruch (z notą LEDGER). **⛔ LL-049 (feedback Tomka 22.07 „na mobile nie ma animowanego
video w hero"): ambient hero-video (i sceny ANIM) GRA NA KAŻDYM VIEWPORCIE — desktop
I mobile; jedyny guard w JS = `prefers-reduced-motion` (autoplay mobilny wymaga muted +
playsinline, oba są w wzorcu). Guard `min-width:768` w starterze ambient = BŁĄD wzorca,
usunięty z żywych landingów.**

**F1.7a — ROLA PRODUKTU W ŁUKU NARRACYJNYM (EMOCJA↔PRODUKT; Drapek 18.07 — scena PROBLEM
pokazywała psa KULĄCEGO SIĘ DEFENSYWNIE przy NASZEJ desce = przekaz „nasz produkt = źródło
stresu", odwrotny do intencji).** Karta KAŻDEJ sceny (F1.7) MUSI jawnie określać ROLĘ w łuku
∈ {**przed/problem** · **rozwiązanie/USP** · **demo** · **efekt/po** · **oferta** · **final**}.
Twarda reguła emocji: **nasz produkt pojawia się TYLKO w scenach POZYTYWNYCH / rozwiązania**
(hero=obietnica, rozwiązanie/USP=ulga, demo=w akcji, efekt/po=rezultat, oferta=packshot,
final=życie z produktem). **Scena PROBLEM/„przed" pokazuje BÓL BEZ naszego produktu** — stary
sposób (np. obcinaczki/gilotynka + opór/strach psa), frustrację właściciela albo sam problem
(np. długie pazury). ⛔ **NASZ produkt NIGDY w scenie z negatywną emocją (strach/stres/walka/
opór/odrzucenie/ból)** — sąsiedztwo produkt+negatyw KANIBALIZUJE przekaz (oko czyta „to ON jest
źródłem stresu", niezależnie od copy karty). Negatywna emocja = ZAWSZE przy STARYM sposobie lub
samym problemie. Przejście „przed→po" rozgrywa się **MIĘDZY sekcjami** (problem bez produktu →
rozwiązanie z produktem), **NIGDY w jednym kadrze** (mini before/after w jednej scenie zaprasza
model, by zostawił nasz produkt sam z negatywną emocją — patrz root-cause Drapka: seed problemu
zawierał „warms up toward a calm wooden board scene", model porzucił słabo określone obcinaczki
i zostawił deskę przy wystraszonym psie). **Seed sceny PROBLEM jawnie WYKLUCZA nasz produkt**
(klauzula „no <our product>/board/gadget in frame" + wymuszenie starego sposobu/frustracji).
**Egzekucja przy generacji (F3):** scena PROBLEM ref = **styl-master, NIE packshot** (packshot-ref
wciąga produkt do kadru); prop-drift rekwizytu (GRAFIKA-Z-MAKIETY §3) jest akceptowalny TYLKO gdy
NIE zostawia naszego produktu w scenie negatywnej — w scenie PROBLEM produktu z założenia nie ma,
więc nie ma czego zostawić. Weryfikacja końcowa: FINALNY-PASS **PASS 5 pyt. 6** (rola narracyjna).
**Gate wierności F3A dla sceny PROBLEM bez produktu:** klasa **S-kontekst** — gate cech PRODUKTU jej nie
dotyczy (produktu w kadrze brak). W `WIERNOSC.md` werdykt = **ESKALACJA + nota LEDGER „scena bez produktu"**
(już wspierana ścieżka `gate-manifest wiernosc.eskalacja_ledger_tokeny` → `gate-check` PASS); warunek =
FB (0 forbidden) + NARRACJA (rola=przed). To NIE porażka wierności, lecz zaprojektowana rola narracyjna
(scena „przed" z założenia bez naszego produktu).

**F2 — MAKIETY (projekt całej strony).**
**⚓ MAKIETA MUSI BYĆ KOMPLETNA (Z2):** do promptu KAŻDEJ makiety wchodzą wymagania sekcji 3
(hero: karta mikro-oferty z PRAWDZIWĄ ceną + pay-row + pasek trust) oraz PRAWDZIWE dane z F0
wypisane WPROST w cudzysłowach (cena, „★ x,x/5 · N ocen", specs/komunikaty ze snapshotu) —
żeby gpt-image nie miał czego zmyślać. **Gate fake-danych działa NA MAKIECIE:** zmyślona
wartość = REGENERACJA makiety z poprawionym promptem (podmiana w tym samym slocie), NIGDY
wycinanie/edycja na etapie kodu. **KRYTYK (bezlitosny art director + CRO: „czy czuć produkt?
czy wygląda na DROGI projekt?") ocenia MAKIETY — przed akceptem** (m.in. wg CHECKLISTY STYLE-DNA
— para fontów / amber-scope / desktop↔mobile / H1 mobile / głębia — patrz bullet „🎯 STYLE-DNA
MAKIET" w RZEMIOŚLE PROMPTÓW niżej). **AKCEPT MAKIET = kontrakt;**
po akceptcie zmiany wyglądu wyłącznie przez poprawkę grafiki i powrót do tego punktu.

**⚙️ KWALIFIKACJA TOR-I (T0, tu — na makietach, nie w kodzie).** Każdą sekcję oznacz tagiem
`TOR-I`, jeśli niesie interakcję flagową (INTERAKCJE-KATALOG #1–9/13/15) lub jest sekcją
„jak działa"/demo 1-2-3/symulacją/przed-po/konfiguratorem (demo „jak działa" = DOMYŚLNIE
TOR-I). Makieta sekcji TOR-I MUSI pokazać STANY demonstracji (osobny kadr per krok/stan),
nie statyczną kartę z jednym zdjęciem — brak stanów = regeneracja makiety przed akceptem.
Pełny proces: `docs/zbuduje/SEKCJE-INTERAKTYWNE.md`.
1. **STYL-MASTER ×1 = NIEZALEŻNA PLANSZA DNA (nie kopia hero; Tomek 19.07).** Specimen stylu:
   paleta z rolami · **2 fonty z rolami** (display vs label/liczby/body) · swash · plusiki/hairlines ·
   **JEDEN radius serii** · **styl ikon filled|outline** · **styl trust-pill** · próbka warstwowej
   głębi + grain — plus motyw przewodni jako klimat (żeby dalej służył jako referencja stylu KAŻDEJ
   generacji). ⛔ styl-master ≠ druga hero-scena. **⚠️ REF styl-mastera = `{type:'ref'}` (lub bez
   refu + dokładne hexy), NIGDY `{type:'product'}`** — typ 'product' dokleja w edge „reproduce
   product unchanged, change ONLY the scene", co wymusza SCENĘ i uniemożliwia planszę DNA
   (masażer 19.07; kolor produktu kotwiczyć kaflem PRODUKT na planszy). Gate: motyw↔korzyść,
   jasno, hierarchia, minimalny fake-tekst, **czy plansza pokazuje KOMPLET DNA
   (paleta+2 fonty+radius+ikony+trust-pill+głębia)**; FAIL→regeneracja promptu. **Z tej planszy agent SPISUJE `TOKENS-MAKIETY.md` (F2.5) — SSOT tokenów
   makiety wstrzykiwany do KAŻDEGO promptu makiety (pełny format: `docs/zbuduje/TOKENS-MAKIETY.md`).**
   **⚠️ STYL-MASTER JEST GENEROWANY Z PARTYTURY, NIE Z NAWYKU (20.07):** prompt planszy DNA dostaje
   decyzje partytury PODJĘTE WCZEŚNIEJ (rodzina tła, para krojów, kolor akcentu — domyślnie
   wyprowadzony z realnego koloru produktu, sygnatura) i wypisane hexami/nazwami krojów. Plansza
   „w domyślnym kremie z amberem" = generacja z priora = źródło rodzeństwa. **F2.5 wypełnia
   `TOKENS-MAKIETY.md` z JAWNYM podziałem na sekcję `## KANON` (przepisaną 1:1 z SSOT) i
   `## PARTYTURA` (decyzje TEGO landingu + jednozdaniowe uzasadnienie przy KAŻDEJ pozycji:
   kroje · kolor akcentu · rodzina tła · sygnatura · archetyp hero z `PLAN.md`). Partytura bez
   uzasadnień = F2.5 NIEZAMKNIĘTY** (chip w panelu nie wystarcza — plik musi mieć oba nagłówki).
1.5. **BRANDING (F2.5, pipeline R3 19.07) — favicon + wordmark; PO styl-masterze, PRZED hero**
   (`scripts/mockup-tools/brand-forge.py`; SSOT rezerwacji: `bud_brand_names`, F0; parasol =
   claim `wf2_projects.name` przez `--project-id`, reserve-before-generate). **FAVICON/znak —
   DIVERSITY-FIRST: 2-3 RÓŻNE metafory (`--metafory 'a;b;c'`) × 2-3 warianty, NIE N klonów
   jednej (fixation = lokalne optimum; Trafionek 19.07: koncept #2 „metka+ptaszek" pobił
   zwycięzcę v1 „tarcza+rzutka" — generyczny trope).** Kanał domyślny: **LOKALNY OpenAI
   `/v1/images/generations` quality HIGH** (OPENAI_API_KEY z .env; zero wall-clock edge;
   ⚠️ gpt-image-2 NIE wspiera `background:transparent` — generacja na czystej bieli); fallback
   edge wf2-gen medium. **Favicon NIE dostaje referencji styl-mastera** (styl-master = referencja
   MAKIET; `/edits` ze sceną bleeduje tło i psuje alfę) — paleta idzie hexami w prompcie.
   Prompt-recepta: jeden prosty geometryczny znak z 2-3 prymitywów, **„bold solid filled mark"
   nie outline** (masażer 19.07: hairline-łuk = odrzut), czytelny @32px, 1-2 kolory z palety,
   pure-white tło, margines ~20%, zero tekstu/gradientu/3D. **ALFA: natywna gdy jest; inaczej
   tło→alpha z PRÓBKI ROGÓW (nie zakładanej bieli — kremowe tła robiły halo/dziury) + DEFRINGE
   (bez niego jasna obwódka na ciemnym tle checkoutu); tło niejednolite = twardy odrzut (bleed).**
   **Selektor skryptowy @32px** (n_kolorów ≤3, gęstość krawędzi, kontrast, BRAK TEKSTU/OCR —
   skrypt RAPORTUJE dostępność tesseracta, margines-wypełnienie 55-80%, test MONO: sylwetka
   musi żyć kształtem nie kolorem; odrzuty twarde) → **werdykt vision top-2 Z RÓŻNYCH konceptów,
   RUBRYKĄ 6×T/N** (czytelny @32 / czytelny @16 na obu tłach brand-context / metafora oddaje
   nazwę-korzyść nie clipart / flat 1-2 kolory zero 3D / zero liter / mono czytelne; TAK bez
   6×T = FAIL, frazy-wytrychy = FAIL, + JEDNA najsłabsza rzecz wymuszona; brak → regeneracja
   z zaostrzeniem, pętla do wyczerpania, zero udziału Tomka). **WORDMARK: NIGDY z gpt-image
   (diakrytyki PL = hazard)** — render z webfontu landingu (Pillow ImageFont; **guard glifów:
   brak znaku nazwy w cmap = twardy STOP, brak pełnego latin-ext = WARN**), transparent, wariant
   `-dark` (biały); **LOCKUP: favicon LEWA + wordmark PRAWA, skala znaku do wysokości GLIFÓW
   (~1.18×), nie pudełka** — flex align-center, NIGDY pion; wariant `-dark`. Deliverables →
   `bud-assets/<slug>/brand/`: favicon-512/256/32/**16**/**mono**.png, wordmark(+dark).png,
   logo-combo(+dark).png, **brand-context.png (DOWÓD: favicon @16/32/64 na jasnym I ciemnym +
   lockupy na tłach — do wf2_artifacts)**, brand.json (SSOT: nazwa/paleta/font/pliki),
   (OG 1200×630 opcjonalnie). Znak jako `{type:'logo'}` ref do makiet z topbarem (wordmark
   w makiecie = tekst; kod odtwarza live-text). Każdy plik obejrzany (Read) przed użyciem.
2. **HERO-MAKIETA** (pełny 1. ekran: topbar, nagłówek PL, scena z produktem, karta wtopiona
   w scenę, pay-row; gate WOW — iterować max 3, wybrać najlepszą).

   **🏛️ BIBLIOTEKA ARCHETYPÓW HERO (20.07 — PARTYTURA, nie kanon).** Hero to najmocniejszy nośnik
   tożsamości landingu: audyt 20.07 wykazał, że po podmianie palety i zdjęć strony i tak czytały
   się jako rodzeństwo, bo **wszystkie hero dzieliły jeden układ**. Archetyp wybiera się w F1
   (plan), zapisuje w `PLAN.md` linią **`archetyp-hero: <litera>`** wraz z uzasadnieniem („dlaczego
   TEN produkt prowadzi do TEGO układu") i kopiuje do `TOKENS-MAKIETY.md` §9.
   **REGUŁA TWARDA: archetyp NIE MOŻE powtórzyć archetypu bezpośrednio poprzedniego zbudowanego
   landingu** (egzekucja: `gate-check.py` blok `cross_landing`, severity FAIL).

   | # | archetyp | układ | kiedy stosować |
   |---|---|---|---|
   | **A** | **scena pełnoekranowa + copy na scrimie** | scena full-bleed na cały 1. ekran, nagłówek i karta oferty na półprzezroczystym scrimie | ⚠️ **ZUŻYTY — wymaga jawnego uzasadnienia w PLAN.md.** Sensowny tylko gdy scena JEST argumentem sprzedażowym (efekt widoczny gołym okiem: światło, przestrzeń, przemiana wnętrza) |
   | **B** | **split 55/45** | copy na płaskim polu tła po jednej stronie, scena obok jako osobny blok | produkt wymagający wyjaśnienia słowem (mechanizm, specs, „co to właściwie robi"). *Wzorzec: masażer* |
   | **C** | **karta nachodząca na scenę** | scena u góry, karta mikro-oferty wjeżdża na jej dolną krawędź ujemnym marginesem | impuls + mocna oferta cenowa; naturalnie przenosi się na mobile (fold z ceną). *Wzorzec: Drapek* |
   | **D** | **packshot centralny na płaskim polu koloru** | produkt wycięty, wyśrodkowany na jednolitym polu z rodziny tła; copy i cena POD nim | katalogowo-editorial: produkt ładny sam z siebie, ma wyrazisty kształt/kolor; gdy akcent pochodzi z produktu (§TOKENS „akcent z produktu") |
   | **E** | **big-type dominujący** | typografia jest bohaterem (H1 na 2/3 ekranu), produkt jako mniejszy wycięty obiekt zakotwiczony w rogu/przy linii bazowej | krótka, mocna obietnica; produkty proste, gdzie zdjęcie niewiele dodaje; marki z charakternym display |
   | **F** | **dyptyk** | dwa kadry obok siebie o równej wadze (kontekst + detal / przed + po), copy na pasie pod lub między nimi | produkt o dwóch stanach albo dwóch zastosowaniach; gdy sam kontrast jest argumentem |
   | **G** | **pas editorialny z okładką** | wąski pas nagłówka nad pełnoszerokim, niskim kadrem (proporcja „okładki magazynu"), oferta w kolumnie bocznej | produkty premium/rzemieślnicze, gdzie liczy się nastrój i materiał, a cena nie jest pierwszym argumentem |
   | **H** | **stos zoning'owy (mobile-first)** | trzy jawne strefy jedna pod drugą: kadr → hook big-type → karta oferty, z widoczną granicą między strefami | produkty impulsowe z ruchu Reels, gdzie desktop jest wtórny; najlepszy stosunek fold/treść na 390px |

   Dobór prowadzi PRODUKT, nie estetyka dnia: *co jest najmocniejszym argumentem — scena, słowo,
   sam kształt produktu, czy kontrast dwóch stanów?* Archetyp determinuje też strukturę hero
   mobile (F2.4): B/C/H przenoszą się wprost, A i G wymagają przeprojektowania pod fold
   (⛔ ściśnięty desktop).
3. **MAKIETY WSZYSTKICH SEKCJI planu** (pokrycie CAŁEGO planu — tylko czysta stopka bez
   makiety), przyrostowo: hero+1 → po 2. Każda: ref = styl-master + realne zdjęcie produktu
   gdy w kadrze; 3:2 DUŻE; polskie teksty przykładowe; pełny układ UI.
   **CTA W KADRZE (szkielet CTA):** brief makiet `hero · oferta #zamow · mid-cta · final` MUSI
   jawnie zamówić ZAPROJEKTOWANY przycisk `.btn.cta` (kształt/kontrast/etykieta akcji, strefa pod
   cenę, kolejność cena→CTA) — CTA jest częścią KOMPOZYCJI makiety, nie „dorobkiem kodera"
   (egzekwuje KRYTYK pkt +11; goły re-CTA w kodzie na makiecie bez CTA = FAIL projektowy).
4. **PARY desktop+mobile (F2.4)**: z każdej makiety desktop wariant MOBILE 2:3.
   **🔴 MOBILE = PROJEKT OD ZERA POD TELEFON, NIE ŚCIŚNIĘTY DESKTOP (Tomek 19.07 na masażerze,
   po obejrzeniu makiety hero-m: „wzorzec jest źle, bo to wygląda jak ściśnięty desktop —
   poprawić wszystkie makiety mobile, aby na pewno były pod mobile").** Desktop-ref służy TYLKO
   do stylu/bohatera/sceny — ⛔ ZAKAZ dziedziczenia PROPORCJI UKŁADU (rozmiar sceny vs treści,
   kolejność, gęstość). Kadr 2:3 makiety mobile = FOLD telefonu: WSZYSTKO decydujące MUSI być
   w kadrze — dla hero: kompaktowa scena (produkt duży, ale scena NIE zjada >45% wysokości) +
   hook big-type + karta mikro-oferty (cena → CTA → pay-row) WIDOCZNA W KADRZE; max 1 linia
   korzyści (sub 3-liniowy = desktopowa gęstość = FAIL). **WZORZEC STRUKTURALNY hero mobile
   w KODZIE (Tomek 19.07: „w Drapku to jest dobrze zrobione"): scena ~43-50svh + WYRAŹNA karta
   mikro-oferty (bg --card, border, cień sepia, radius) NACHODZĄCA na dół sceny ujemnym
   marginesem — nie „gołe elementy na kremie"; cel pomiarowy: karta nad foldem @844, cena+CTA
   @750 (pasek Safari). Skórka per landing (Z6), mechanika układu wspólna.** Sekcje: treść ZREDUKOWANA vs desktop
   (mobile = mniej), tap-targety duże, pion. KRYTYK F2 dostaje nowe pytanie (7): „czy ta makieta
   wygląda jak zaprojektowana OD ZERA pod telefon (fold z ceną/CTA dla hero), czy jak zmniejszony
   desktop?" — zmniejszony desktop = REGENERACJA.
   ⚠️ NIE „adaptuj referencję" generycznie — gpt-image nie odwzorowuje tekstu z obrazu, regeneruje z priora
   i WSTRZYKUJE dropship-claims (przekreślenia, „NR 1 W POLSCE", darmowa dostawa)! Mobile
   generować per-sekcja z DOKŁADNĄ treścią wypisaną w prompcie (jak desktop); referencja
   desktop tylko dla stylu/układu. Mobile-makieta WIĄŻE dla 390px, desktopowa dla ≥768px.
   **⚠️ DWIE TWARDE KLAUZULE promptu mobile (krytyk masażera 19.07 — gpt-image regeneruje
   mobile z priora desktopu):** (a) sekcja z RZĘDEM 3 elementów (timeline/kroki/stany TOR-I)
   MUSI dostać „stack into a single vertical column (connecting line); NEVER 3 side-by-side
   at 390px" — inaczej zostają poziome trójki (regeneracje 02/04 masażera); (b) hero-m MUSI
   dostać „no floating trust-chip/badge overlay on the scene (desktop-only element)" —
   inaczej chip wjeżdża na scenę (regeneracja 01 masażera; ⛔ pokusa „display:none w kodzie"
   = złamanie Z2 — chip znika Z MAKIETY).
   **SPÓJNOŚĆ DESKTOP↔MOBILE (Tomek 19.07 — realny defekt `13-final`: inny pies desktop vs mobile,
   ikony outline↔filled): para desktop+mobile TEJ SAMEJ sekcji dzieli BOHATERA/scenę (ten sam
   produkt, kadr, świat) i JEDEN styl ikon (`--icon-style` z TOKENS-MAKIETY, filled ALBO outline —
   w OBU). Rozjazd (inny bohater / dryf ikon) = REGENERACJA mobile, nigdy „osobny prior gpt-image".**
   **ZAKRES (Tomek 18.07 — mobile wg PEŁNYCH makiet, nie „na oko"; ZASTĘPUJE urealnienie 17.07):**
   mobile-makieta **OBOWIĄZKOWA dla WSZYSTKICH sekcji planu** — komplet mobile == liczba sekcji,
   nie tylko hero/TOR-I/wideo. Powód: bez pełnych makiet mobile montaż dociąga 390px „na oko" i
   rozjeżdża się z intencją (incydent 18.07 — Drapek miał makiety mobile TYLKO dla 3 sekcji, reszta
   montowana bez wzorca). Także sekcje CSS (zaufanie/FAQ) dostają mobile-makietę z REFLOW-em pod
   pion (timeline 01-02-03 → pionowa oś z łącznikiem; akordeon → full-width; grid 3-kol → stos z
   podglądem następnego kafla; scena+karta → foto na górze, treść pod). gate-check egzekwuje komplet
   (`makiety_mobile` severity **FAIL**, `komplet_wg_sekcji: true` → komplet mobile == liczba sekcji
   == liczba makiet desktop poza styl-master). Świadomy wyjątek pojedynczej sekcji = jawna nota w
   LEDGER (`komplet_nota_regex`, np. „mobile-makieta-wyjatek: …"), inaczej FAIL.

**🎛️ RZEMIOSŁO PROMPTÓW MAKIET (research D, 16.07 — OpenAI cookbook + praktycy; UNIWERSALNE):**
- **🎨 DETAL-LAYER (research 17.07 — human-crafted vs AI-generic): poprawna ≠ droga.**
  Każda makieta sekcji dostaje min. 3/4 warstw detalu wydawniczego (dobrane pod motyw, nie
  hurtowo): (a) SYGNATURA WYDAWNICZA — eyebrow ALL-CAPS tracking 0.2em nad oversized
  display-serif H2 (kontrast skali ≥1:5); ⛔ BEZ numeru sekcji „0N / NN" (Tomek 17.07); (b) JEDEN AKCENT na sekcję —
  highlight-swash w ciepłym kolorze pod 1 słowem ALBO wielka liczba-jako-grafika ALBO
  1 annotation — dokładnie JEDEN, nie zbiór; (c) STRUKTURA WIDOCZNA — hairlines 1px,
  plusiki „+" w rogach kart, crop-marks; karty na border+kontrast, JEDEN radius serii,
  bez „shadow-lg"; (d) ASYMETRIA+WARSTWA — split ~35/65 lub bento z NIErównymi kaflami,
  min. 1 element wychodzący poza kolumnę, depth skalą i temperaturą (nie cieniem).
  W prompt makiety idą techniki renderowalne (caps+serif, swash, wielkie liczby,
  bento-asymetria, hairlines, plusiki, taped-photo, split 35/65, depth). Do KODU F4 (model
  drży / to montaż): grain SVG feTurbulence (opacity ≤.05, 1 źródło), annotation-arrows
  inline SVG (1/sekcja), overlap MIĘDZY sekcjami (ujemny margin + z-index), hand-drawn
  stroke. Gate KRYTYKA rozszerzony: „gdzie tu ślad ręki projektanta?" — brak 3/4 warstw =
  regeneracja makiety. Anty-AI-card: banuj shadow-lg + rounded-2xl/3xl.
- **🎯 STYLE-DNA MAKIET (F2.5, twarde — pełny format `docs/zbuduje/TOKENS-MAKIETY.md`; „pełny
  zestaw" 19.07, podział KANON/PARTYTURA 20.07).** Ponad warstwy detalu (a-d) KAŻDY prompt makiety
  niesie akapit STYLE-DNA z `TOKENS-MAKIETY.md` (SSOT domykający dryf A/B/C/radius/ikon).
  **Akapit ma DWIE części: KANON — identyczny w każdym landingu; PARTYTURA — konkrety TEGO
  produktu. Nakazowa jest struktura ról, nie konkretne kroje i hexy:**
  - **PARA FONTÓW Z KONTRASTEM (koniec mono-Baloo):** KANON = display (twarz marki: H1/H2/marka)
    i **osobny WYRAZISTY krój** na **eyebrow · LICZBY · CENY · wymiary · długie akapity · label**
    MUSZĄ być rozróżnialne na pierwszy rzut oka. ⛔ ZIMNY tech (Inter/Helvetica) jako jedyny krój
    i ⛔ jeden krój na wszystko = FAIL kalibracji premium. **PARTYTURA = KTÓRE kroje** — Baloo 2
    nie jest już domyślną (masażer i Drapek dzieliły ją, stąd 9/10 zbieżności); `--font-display`
    identyczny z którymś z 3 poprzednich landingów = FAIL gate'u `cross_landing`. Skala modularna
    1.333 (1.5 dla wielkiego H1), body 16-18/lh 1.5-1.6, H1 desktop 56-80px, **H1 mobile floor
    36-40px** (31px = za skromnie).
  - **DYSCYPLINA JEDYNEGO AKCENTU (scope twardy):** akcent = **TYLKO** {CTA · swash pod 1 słowem ·
    gwiazdki ratingu}. **WSZYSTKIE ikony funkcjonalne (korzyści/materiał/kroki/lupa/FAQ +−) =
    charcoal (`--ink`).** Trust-pill = JEDEN styl globalnie. Body = prawie-czerń dostrojona do
    rodziny tła, nie `#000`, nie mglisty jasny. **PARTYTURA = KTÓRY kolor:** wolno (i zaleca się)
    wyprowadzić go z realnego koloru produktu — reguła „kolor produktu nigdy jako UI-accent"
    jest USUNIĘTA (20.07); ΔE < 15 wobec 3 poprzednich landingów = FAIL gate'u `cross_landing`.
  - **RODZINA TŁA (PARTYTURA):** jasne ≠ tylko kremowe. Dozwolone: krem · kość słoniowa · piasek ·
    glina rozbielona · chłodna biel · blady szałwiowy · bladoróżowy · jasny błękit (warunek KANONU:
    wysoka jasność + niskie nasycenie + WCAG dla body). ⛔ ciemne tła i neon — bez zmian.
  - **RYTM 8pt + hojny whitespace:** siatka 8/16/24/32/48/64/96; padding sekcji desktop 96-128px,
    mobile 64-80px; szerokość treści ~1160-1200px; kolumna tekstu 50-75 znaków. Whitespace = luksus.
  - **WARIANCJA EDYTORIALNA SEKCJI** (koniec „stosu identycznych kart"): mieszać edge-to-edge scena
    pełnoekranowa (emocja) / split 55/45 (jak-działa) / bento radius 16-24px (cechy) / grid opinii
    z TWARZAMI (dowód). ⛔ bento do porównań; asymetria psująca czytelność ceny/CTA.
  - **GŁĘBIA WARSTWOWA:** warstwowe CIEPŁE cienie (key+ambient, tint sepiowy `rgba(80,50,20,.06-.12)`,
    NIE czarny) + grain 2-4% (SVG feTurbulence ≤.05). ⛔ jeden twardy `0 10px 30px rgba(0,0,0,.3)`.
  - **JEDEN RADIUS + JEDEN STYL IKON serii** (filled ALBO outline, trzymany w OBU viewportach i we
    WSZYSTKICH sekcjach; galeria xl + demo kwadrat = rozjazd do ujednolicenia w tokenach).
  - **HERO: OSTRA fotografia** (produkt bohaterem, nie plamą — mniej blur); rozważ wariant split
    editorial (copy lewo / ostra scena prawo). Mikro-interakcje = §3 CTA + F5.2 (press ~0.97,
    sticky slide-in, reveal 200-400ms, ciepły easing, `prefers-reduced-motion`).
  - **🎬 HERO PROJEKTOWANY POD HERO-VIDEO (F5.2) — NIE osobno (Tomek 20.07, na macie/Kłujku):**
    scena hero staje się pierwszą klatką pętli Kling image-to-video (first=last), więc MUSI mieć
    **NOŚNIK subtelnego, ZAPĘTLONEGO ruchu** — inaczej Kling nie ma czego animować (albo, gorzej,
    zaczyna morfować sam produkt). Podział sceny: **STREFA STATYCZNA = produkt** (ostry, niezmienny —
    cechy wierności NIE mogą się ruszać) + **STREFA RUCHU = otoczenie**.
    **⚠️ NOŚNIK MUSI BYĆ DOMINUJĄCYM, FIZYCZNYM OBIEKTEM, KTÓRY REALNIE SIĘ RUSZA (mata/Kłujek 20.07 —
    twarda lekcja):** obowiązkowo ≥1 z: **firana/zasłona falująca w oknie · miękka tkanina/len/koc
    unoszący się i wracający · liście/gałąź/roślina kołysząca się · para/dym znad kubka · woda/refleks ·
    delikatny oddech/ruch osoby**. Musi być **wyraźnie widoczny w kadrze** i leżeć w OTOCZENIU, poza
    strefą produktu. **⛔ Światło „oddychające" jasnością, pełznący cień i kurz-pyłki to TYLKO DODATEK —
    NIGDY jedyny/główny nośnik.** Scena, w której jedyne, co może się ruszać, to światło i pyłki =
    Kling animuje wyłącznie kurz → efekt „nic się nie dzieje" (dokładny incydent hero-d maty 20.07:
    światło+cień+pyłki wypalone, zero fizycznego obiektu ruchu → martwy klip). Ruch **cykliczny**
    (domyka pętlę bez skoku), **premium** (nie gadżet), **NIGDY na produkcie**.
    ⛔ **martwy packshot na PŁASKIM polu koloru = najgorszy hero do animacji.** Przy archetypie **D**
    (packshot centralny) pole koloru ZOSTAJE, ale scena MUSI wprowadzić na brzeg/tło dominujący nośnik
    fizyczny (okno z falującą firaną + roślina) — nie sam „długi cień okna". To jest wymóg **F2**, nie
    F5.2: hero, który nie ma dominującego fizycznego nośnika ruchu, wraca do regeneracji SCENY, zanim
    ktokolwiek go zakoduje. **Gate F5.2 (obowiązkowy przy klipie):** wyciągnij ≥5 klatek rozłożonych po
    całym klipie (0/25/50/75/100%) i ZOBACZ je — musi być OCZYWISTA, czytelna zmiana w strefie ruchu
    (nie sam kurz); dodatkowo pomiar: frame-diff/optical-flow w regionie OTOCZENIA > próg, w regionie
    PRODUKTU ≈ 0 (ostry, nieruchomy). Sam kurz/sub-progowy ruch = FAIL → regen (najpierw SCENY, nie klipu).
  - **✅ KRYTYK — CHECKLISTA STYLE-DNA (F2, przed akceptem; brak = regeneracja makiety):**
    (1) para fontów z REALNYM kontrastem (nie mono)? (2) akcent tylko CTA+swash+rating, WSZYSTKIE
    ikony funkcjonalne charcoal? (3) desktop↔mobile TEJ sekcji = ten sam bohater + jeden styl ikon?
    (4) H1 mobile ≥36px / big-type? (5) głębia = warstwowe CIEPŁE cienie (nie jeden czarny)?
    (+ 6) **EMOCJA↔PRODUKT (F1.7a) egzekwowane NA MAKIECIE, nie na finale:** scena `03-problem`
    ma ZERO naszego produktu (nie odkładać do PASS 5 pyt. 6 — łapać przy akceptcie makiety).
    (+ 8) **🔀 CROSS-LANDING (20.07, po werdykcie audytu masażer↔Drapek 9/10): „czy ten landing
    dałoby się pomylić z POPRZEDNIM? na których osiach się różni?"** — krytyk dostaje hero
    poprzedniego landingu jako drugą kotwicę i wymienia RÓŻNICE po nazwie: rodzina tła · kolor
    akcentu · font display · archetyp hero · świat/materiał. **Mniej niż 3 osie różnicy =
    regeneracja partytury (F2.5), nie kosmetyka makiety.** Odpowiedź „różni się kolorem produktu
    i zdjęciami" = NIE ZALICZONE (to nie są osie — to zawartość). Pytanie (7) = mobile-od-zera
    (F2.4), pytanie o POZĘ produktu = §2.
    (+ 9) **🎬 ANIMOWALNOŚĆ HERO (tylko sekcja hero): czy scena ma DOMINUJĄCY, FIZYCZNY nośnik ruchu
    w OTOCZENIU — realny obiekt, który się rusza (firana/tkanina/liście/para/woda/osoba), a NIE sam
    „światło+cień+kurz"?** Wskaż go po nazwie. Jeśli jedyne, co mogłoby się ruszać, to światło i pyłki
    → **NIE ZALICZONE** (Kling zanimuje tylko kurz = „nic się nie dzieje", incydent hero-d maty 20.07)
    → regeneracja SCENY hero (dodać firanę/roślinę/tkankę ruchu), zanim ktokolwiek go zakoduje.
    (+ 10) **🩹 ANTI-BLEED (mata/Kłujek 20.07): makieta = DOKŁADNIE JEDNA sekcja i nic więcej.**
    gpt-image na „lekkich" sekcjach (pas CSS, demo, akordeon, chipy) zapełnia pustą kanwę
    HALUCYNUJĄC pełny blok hero+oferta+benefity — dokleja wordmark, cenę, ★rating, chipy-korzyści.
    To przemyca **klejmy zdrowotne i zakazane materiały** (regeneracja/sen/„len/bawełna/ABS") poza
    kontrolą KARTY/PASZPORTU. **Do KAŻDEGO promptu makiety: „EXACTLY ONE SECTION AND NOTHING ELSE"
    + jawny zakaz wordmark/ceny/★/benefit-chips/klejmów/nazw materiałów, jeśli nie należą do tej
    sekcji.** Krytyk: dorobiony element spoza sekcji = REGEN. Klejm zdrowotny / materiał sprzeczny
    ze specem = REGEN bezwarunkowy (nie „uwaga-copy").
    (+ 11) **🎯 CTA W KADRZE (szkielet CTA, Tomek 20.07: „za mało CTA; dedykowanej sekcji nie ma;
    do makiet dodać prośbę o zaprojektowane CTA"): czy makiety `hero · oferta #zamow · mid-cta · final`
    mają ZAPROJEKTOWANY przycisk `.btn.cta`** — kształt/kontrast/czytelna etykieta akcji, strefa pod cenę,
    kolejność cena→CTA? **Brak zaprojektowanego CTA na którejś z tych 4 makiet = REGEN makiety** (nie
    „przycisk dorobi koder" — goły re-CTA dodany w kodzie = FAIL projektowy). Sekcja mid-CTA bez CTA
    w kadrze = ta sama wada, o której mówił Tomek, o krok subtelniejsza.
- **🥇 BRIEF CELU > DYKTAT ELEMENTÓW (Tomek 16.07, potwierdzone testem A/B na hero Uśmieszka):**
  najlepsze makiety wychodzą, gdy prompt opowiada CO sprzedajemy, KOMU i CO klient ma poczuć,
  a PRAWDZIWE fakty (cena, oceny, cechy, płatności) podaje jako MATERIAŁ do wyboru — kompozycję
  zostawiając modelowi. Wyliczanie „co dokładnie ma być na hero" zagęszcza layout i zabija
  stylowanie (v2/v6 nakazowe PRZEGRAŁY z v7 brief-celu). Nakazowo tylko: zakazy, wierność
  produktu, style-DNA/referencja. Do EDYCJI zaakceptowanej makiety (podmiana 1 elementu):
  referencja = ta makieta + krótka lista zmian + kotwice stylu tekstem (bez nich model dryfuje
  — v3 zsiniało od packshotu-infografiki; ref produktu ZAWSZE czysty packshot, NIGDY infografika).
- **Szablon promptu = struktura stała** {rola, sekcja, layout, TREŚĆ w "cudzysłowach",
  style-DNA, wykluczenia, wymiar}: język UI („high-fidelity product UI screenshot,
  Figma-style, pixel-perfect, clean design system"), ZERO języka concept-art
  („beautiful/render/artwork" → daje ilustrację zamiast makiety). Opisuj interfejs
  „jakby już istniał".
- **STYLE-DNA tekstowe w KAŻDYM prompcie** (niezmienny akapit serii; **źródło = `TOKENS-MAKIETY.md`**,
  nie „z głowy" per makieta): dokładne hexy, font+wagi+skala (**2 role: display vs label/liczby/body**),
  spacing/gęstość (8pt), radius (jeden serii), cienie (ciepłe warstwowe), styl ikon, ton fotografii —
  obraz-master + tekst-DNA razem są stabilniejsze niż sam obraz.
- **Obrazy wejściowe: indeksuj i przypisuj ROLĘ**: „Image 1: style reference (match
  palette/typography/spacing). Image 2: previous section (match visual system, do NOT
  copy its text)." Bez tego model kopiuje treść sąsiedniej makiety. Kolejność:
  styl-master pierwszy; ZAAKCEPTOWANE hero jako druga kotwica dla kolejnych sekcji
  (baseline-first loop).
- **Stały blok wykluczeń w każdym prompcie**: no browser chrome/URL bar/tabs/window
  controls, no device frame, no mockup shadow („flat edge-to-edge section screenshot"),
  no watermark/signature, no lorem ipsum, no crossed-out prices, no bestseller/„NR 1"
  badges, no free-shipping unless specified, no extra text beyond quoted, no abstract
  blobs/random 3D/decorative gradients unless in style DNA.
- **⚠️ LEKCJE UGNIATEK (21.07 — pierwszy przebieg produkcyjny; 3 nawyki modelu do jawnego
  zbijania w promptach makiet):** (1) **anty-monospace przy H1:** gdy display = grotesk,
  model potrafi ustawić nagłówek karty w kroju maszynowym — pisz jawnie „clean GEOMETRIC
  SANS-SERIF, ABSOLUTELY NOT monospace/typewriter/slab, same typeface family as the button
  label" (kotwica do elementu, który wychodzi dobrze); (2) **nav topbara ENUMEROWANY:**
  bez jawnej listy linków model dopisuje „Opinie" z nawyku e-commerce = złamanie zakazu
  social-proof — podawaj linki VERBATIM + „NEVER 'Opinie'"; (3) **NEG-blok PASZPORTU w
  każdym prompcie makiety z produktem w kadrze** (nie dopiero w seedach F3/F4): negatywy
  typu „no pistol grip / no interchangeable heads / single colorway" zbijają dryf bryły
  już na makiecie (karbowane uchwyty, brandowane pudełko w zestawie = złapane na Ugniatku).
- **Tekst PL**: krótkie stringi w "cudzysłowach" (nagłówek/cena/CTA); długie bloki (FAQ,
  opisy) = paski/linie o właściwej długości zamiast fałszywego copy (treść i tak nadpisuje
  kod); quality high dla drobnego tekstu.
- Wymiary natywne (1536×1024 / 1024×1536), NIGDY tagów `--ar` w treści promptu.
- **CZEGO NIE ZMIENIAĆ (anty-regresja):** pary jako OSOBNE generacje (nie cięcie desktopu,
  nie multi-frame) · styl-master jako ref obrazkowa · gpt-image-2 jako model całej serii
  (spójność serii > lokalna jakość tekstu; Ideogram/v0 tylko jako testowany wyjątek) ·
  nadpisywanie treści w kodzie.
- **⚠️ FAKE-SPECS gpt-image (test Uśmieszek 16.07):** gpt-image regularnie wstrzykuje
  zmyślone specs (IPX7, „X dni baterii", „silikon medyczny", „dla dzieci"), gdy prompt nie
  podaje treści — dlatego prompt makiety podaje WSZYSTKIE dane wprost (⚓ wyżej), a wykryta
  zmyłka NA MAKIECIE = regeneracja TEJ makiety przed akceptem. (Stara reguła „gate przy
  montażu wycina" USUNIĘTA — wycinała treść razem z układem = rozjazd z makietą.)
- **✅ KANON MAKIET (rozstrzygnięty testem Uśmieszek, 0 odrzutów, $1.67):** makiety UI
  całego planu (layout) + OSOBNE sceny text-free jako tła full-bleed (nie mieszać treści
  z tłem w jednej generacji). Przy 0-reject prompt-crafcie NISKI koszt ≠ uboga strona
  (bogactwo mierzy się OUTPUTEM: sceny/interakcje/jakość na stronie, nie wydanymi $).

**F3 — GRAFIKI PRODUKCYJNE = DERYWATY MAKIET (Z2).** *(punkty 0–5 niżej = kroki F3.0…F3.5;
odwołania w innych dokach: „F3.1" = tło scen scene-from-mockup [pkt 1], „F3.4" = mapa assetów +
reguły [D-art] [pkt 4].)*
0. **WARSTWA GRAFICZNA per sekcja (Tomek 16.07 późny wieczór) — procedura
   `docs/zbuduje/GRAFIKA-Z-MAKIETY.md` (CZYTAĆ):** dla KAŻDEJ makiety rozpoznaj, co jest
   grafiką (sceny, foto-pasy, zdjęcia sekcji, ornamenty) a co elementem kodowym; każdy
   element graficzny = OSOBNY plik wyciągnięty 1:1 z makiety (DOMYŚLNIE CROP z PNG —
   pixel-perfect i darmowy; regeneracja tylko: inny aspekt / tekst na fakturze / produkt
   wymagający 3 wariantów). Grafiki niosą styl strony — używać ich jak najwięcej.
1. **TŁO KAŻDEJ SEKCJI SCENICZNEJ = TA SAMA SCENA CO NA MAKIECIE (pomysł Tomka 16.07 —
   standard; koniec losowania nowych scen):** gpt-image-2, REFERENCJA = ZAAKCEPTOWANA makieta
   tej sekcji (+ realny packshot dla wierności produktu — 3 WARUNKI, sekcja 2), prompt:
   „the SAME scene as in the reference image — same room, same framing, same light, same
   product placement; REMOVE all text, UI elements, buttons, cards and icons; output a clean
   photographic background with empty negative space exactly where the content was".
   Produkt ZOSTAJE w scenie (NIE „plate + wycięty packshot" — szwy/skala/światło = źle).
   **⚠️ FOTO-INSETY KOLAŻU ≠ UI (masażer 19.07 — „remove UI" zjadło inset makro USB-C z makiety):**
   gdy makieta niesie fotograficzny INSET (bańka/ramka z makro-detalem: port, splot, głowica),
   lista REMOVE nie może zawierać ogólników „callout circle / inset zoom bubble"; doklej jawny
   WYJĄTEK: „KEEP the small [round] photographic INSET in the [corner] showing the [detail]
   close-up — part of the photographic collage, NOT a UI element; reproduce its position, size
   and frame from Image 1". Rozróżnienie tekst-UI (usuwać) vs foto-inset (zachować) MUSI być
   w prompcie explicite.
   **⚠️ NAJPIERW ORZEKNIJ TYP OSADZENIA SCENY (GRAFIKA-Z-MAKIETY §1 „TYP OSADZENIA SCENY") —
   on decyduje, czy scena ma w ogóle strefę fade (Tomek 20.07, incydent `prawda-d.webp`):**
   - **Typ A — full-bleed, copy LEŻY NA scenie** (scena rozciąga się pod tekstem/kartą; hero
     archetyp A/C, sekcje pełnoekranowe z napisem na zdjęciu) → obowiązuje strefa treści.
   - **Typ B/C — split/kadr-w-kolumnie lub slot** (scena zamknięta w SWOJEJ kolumnie/kaflu, copy
     w OSOBNEJ kolumnie na tle sekcji — archetyp B, sekcje `04-prawda`, `08-gdzie`, `14-final`,
     kafle demo/galerii) → ⛔ **ŻADNEJ strefy fade, ŻADNEGO pola koloru na scenie**: PEŁNY KADR
     od krawędzi do krawędzi, kod przytnie `object-fit:cover` do kolumny. Wygenerowanie kremowego
     pola „na copy" = martwy prostokąt w kolumnie sceny (defekt `prawda`: ~40% kadru wylane na
     krem z ostrą pionową krawędzią, choć copy siedziało w osobnej kolumnie).
   **Prompt sceny MUSI wymagać: (a) produkt w TEJ SAMEJ skali i pozycji co na makiecie
   („SAME size and position as in the reference" — bez tego wychodzi mniejszy; Uśmieszek 16.07),
   (b) TYLKO DLA TYPU A: strefa treści WTAPIA SIĘ w jednolity kolor tła („fades seamlessly into
   flat solid #HEX") — a kod dokłada dopasowany scrim-gradient nad sceną w strefie treści (Tomek
   16.07: bez tego makieta wygląda dobrze, finał gorzej). Dla typu B/C promptu (b) NIE dawać.**
   **⚠️ SCRIM = PLATEAU, NIE MIĘKKI FADE (Tomek 19.07 na masażerze — „tam gdzie miało być białe
   miejsce na tekst, w ogóle tego nie ma") — DOTYCZY WYŁĄCZNIE TYPU A (scena full-bleed rozciąga
   się POD panelem treści; NIE mylić z typem B, gdzie scena siedzi w osobnej kolumnie i panel
   robi tło sekcji, nie scrim na scenie): gdy makieta ma full-bleed z kremowym panelem pod
   treścią ~40-50% szerokości, scrim w kodzie MUSI odtworzyć plateau: solidny `var(--paper)`
   od krawędzi DO KRAWĘDZI BLOKU TREŚCI (~46-50%), dopiero potem fade do 0 (~62-70%). Miękki
   gradient od ~34% daje opacity ~0.4 przy krawędzi treści = scena prześwituje pod tekstem,
   mimo że PLIK sceny ma strefę czystą (F3 nie zawiodło — zawiódł most makieta→kod). Self-check
   kodera: krawędź bloku treści leży na scrimie o opacity ≥~0.9. Egzekucja maszynowa: check
   `scrim_plateau` w detail-lint (PASS 4).**
   **Gate: side-by-side wygenerowanego tła z makietą — inne pomieszczenie/kadr/światło/skala
   produktu = odrzut i ponowna generacja. + CHECK „CZYSTA STREFA NEGATYWNA" (masażer 19.07):
   skanuj strefę negatywną każdej sceny POMIAREM piksela (dev-map/residual vs kolor tła), NIE
   okiem. Dwie klasy zdarzeń: (a) REALNE resztki UI makiety po cropach (leader-lines flatlaya
   masażera) = inpaint na CZYSTYM cropie źródłowym, $0; (b) „panel-widmo/ghost" zgłaszany przez
   vision = najczęściej HALUCYNACJA VLM na przeskalowanym podglądzie (masażer: 4/4 zgłoszone
   widma miały 0 px odchylenia od kremu — dwóch niezależnych agentów vision „widziało" to samo
   nieistniejące widmo!). ⛔ ZAKAZ paint-over/regen na sam werdykt vision — najpierw pomiar;
   malowanie kremu kremem = ryzyko bez zysku.**
2. **HERO: TRZY warianty (mobile 2:3 · tablet ~1:1 · desktop 3:2, `<picture>`) = REFRAME
   TEJ SAMEJ SCENY** (za każdym razem hero-makieta jako referencja + „extend/reframe the
   same scene to N:M"). Mobile: `object-position` uniesiony (produkt nie może zniknąć za
   kartą oferty); układ stref dokładnie wg mobile-makiety.
3. **Packshot z aukcji tylko tam, gdzie makieta ma packshot** (karta oferty); gdzie makieta
   ma scenę lifestyle → scena-z-makiety (pkt 1). Surowy packshot wklejony w sekcję sceniczną
   = rozjazd z makietą (lekcja demo Świtka).
4. **MAPA ASSETÓW (gate przed kodem):** tabela asset → sekcja → sposób użycia; taksonomia
   **[P] produkt/użycie/efekt** (wierność 3 warunków) / **[D] design związany z motywem**
   — podklasa **[D-art]** = dekoracja cięta z arkusza biel→alpha (hand-drawn akcenty /
   badge-podkład BEZ tekstu / ramka washi/polaroid/torn / spot-seria): ZERO wypalonego
   tekstu PL, ≤3 kolory z mastera, ≤3/sekcję, `pointer-events:none`, nie liczy się do
   pokrycia P/S/R; **wektor-first** — divider/liczby/grain/prosty seal/watermark = CSS/SVG,
   NIE AI (szczegóły: GRAFIKA-Z-MAKIETY §3a)
   (nigdy generic). **Każdy asset dostaje też TAG KLASY OBRAZU (P=packshot / U=UGC /
   S=scena AI / R=real-gallery — kurowany kadr z `gallery_curated`), a każdy slot sekcji ma
   ALLOWLISTĘ klas wg `docs/zbuduje/OBRAZY-ROLE.md`**
   (karta oferty = TYLKO packshot, NIGDY UGC; opinie = TYLKO UGC; zakaz obrazu-na-obrazie
   — na scenie tylko cutout z alfą). Klasa spoza allowlisty = BLOK. Arkusze (ikony) z planem cięcia (PIL, biel→alpha) i adresem każdego
   wycinka. 100% assetów użytych; 0 sekcji bez assetu. OG = 1200×630 w stylu master.
   **Kolumna `ujecie` per asset produktowy** (hero/problem/demo-seq/detail/packshot/
   galeria-angle/scale). **Sekcja PORÓWNANIA = 2 assety w mapie (masażer 19.07):** nasz
   produkt + KONKURENT/stary sposób — konkurent to najtaniej CROP z makiety 09 (rekwizyt,
   gate F3A go nie dotyczy); bez wiersza w mapie F4 musi doraźnie cropować sam. Gate anty-monotonii: **`min_distinct_product_views ≥ 5`**; ten sam
   kadr >1× (poza oferta↔sticky) = BLOK z fixem „nowe ujęcie wg katalogu sek. 2"; sekcja
   sekwencja/„jak działa" z <2 ujęciami produktu = BLOK. **Mapa wskazuje też KARTĘ
   PRZEWODNIKA (F1.7) per asset** — każdy plik ma przypisany świat {kontekst/skala/
   światło/człowiek/perspektywa}; asset spoza świata swojej karty = regeneracja.
5. KAŻDA generacja obejrzana (Read) przed użyciem; wtopiony tekst/UI w tle = odrzut.
6. **SEKWENCJA WDROŻENIA NA LIVE (incydent „pustka przejściowa" masażera 19.07 — nowa scena
   z kremową strefą nadpisała URL, a stary kod na live układał treść POD sceną → Tomek oglądał
   wielki pusty blok):** asset, którego zmiana WYMAGA zmiany kodu (inny układ stref/kadr/aspekt),
   ⛔ NIE nadpisuje produkcyjnego URL-a x-upsertem — idzie pod NOWĄ wersjonowaną ścieżką (lub
   z parametrem `?v=N` OD RAZU zmienianym w kodzie) i przełącza się RAZEM z kodem w jednym
   commicie. x-upsert na ten sam URL dozwolony TYLKO dla zmian nie wymagających kodu
   (retusz/kompresja/kosmetyka przy tym samym układzie).

**F3A — GATE WIERNOŚCI DO SKUTKU (bramka F3→F4; pełny proces: `GRAFIKA-Z-MAKIETY.md §4b`).**
**Wejście do kodu (F4) jest ZABLOKOWANE, dopóki KAŻDA grafika produktowa (klasa S/P użyta
w kodzie) nie ma werdyktu WIERNOŚĆ ∈ {ZGODNA, REAL, ESKALACJA+nota LEDGER} w
`dopasowanie/WIERNOSC.md`.** Trójkąt (grafika + tabela „Cechy dyskryminujące" paszportu + realny
kadr Ali) × DWIE niezależne pary oczu (pass-1 generator + pass-2 ŚWIEŻY Sonnet bez promptu
i werdyktu-1; rozjazd = NIEZGODNA); **FAIL cechy PRODUKTU = NIGDY waivable**; dryf
rekwizytu-nie-produktu tylko z notą LEDGER + zgodą obu par; pętla regen celowana w KONKRETNĄ
cechę, max 3 rundy → eskalacja (ref / crop-first / scena bez produktu / nota Tomek). Egzekwuje
`gate-check.py` (blok `wiernosc`; „brak wiersza / NIEZGODNA / ESKALACJA bez noty / rundy>3" = FAIL).

**⚠️ F3A #2 — SENSOWNOŚĆ OSADZENIA (osobna oś od wierności produktu; Tomek 20.07, incydent
`prawda-d.webp`).** Gate wierności ocenia, czy PRODUKT zgadza się z paszportem — i przepuści
scenę z bezsensownym martwym panelem koloru, bo produkt jest OK (mata `prawda`: 15/15 ZGODNA,
a mimo to ~40% kadru wylane na krem z ostrą pionową krawędzią). Dlatego **pass-2 (świeży Sonnet)
orzeka DODATKOWO** dla każdej sceny: (1) jaki jest TYP OSADZENIA wg makiety (A full-bleed-copy-na-
scenie / B split-kadr-w-kolumnie / C slot-kafel — patrz `GRAFIKA-Z-MAKIETY §1`); (2) czy plik sceny
jest z nim zgodny: **typ B/C → kadr MUSI być pełny, od krawędzi do krawędzi; jakikolwiek płaski
prostokąt/pas jednego koloru (pole „na copy") = FAIL „martwy panel" → regen `fullframe`**; typ A →
przejście do strefy copy musi być MIĘKKIE i fotograficzne (twardy prostokąt koloru = też FAIL).
Werdykt w `WIERNOSC.md` jako kolumna `osadzenie ∈ {OK, martwy-panel, twardy-scrim}`; „martwy-panel/
twardy-scrim" blokuje F4 tak samo jak NIEZGODNA. Detekcja maszynowa (wspomaga vision): udział
największego jednolitego prostokąta koloru tła przy krawędzi > ~18% pola sceny na scenie typu B/C
= sygnał FAIL do werdyktu.

**F4 — KOD (gpt-5.6-sol LUB agent autorsko — Z4).** Szkielet-kontrakt z najnowszego wzorca (head: canonical/OG/
noindex `{{CANONICAL_URL}}`, JSON-LD @graph, JEDEN exec-script: pixel `{{PIXEL_ID}}`
VC/ATC/IC + link decoration + HOOKS + sticky IO + wideo autoplay-on-visible; lightboxy;
pay-badges). Potem sekcja po sekcji **WYŁĄCZNIE procedurą `docs/zbuduje/SEKCJA-Z-MAKIETY.md` (v2,
z researchu 16.07)**: ekstrakcja IR z makiety (paleta hex, skala typo px, bboxy — narzędzia
scripts/mockup-tools/) → anotowana makieta + IR i DOKŁADNE copy jako TEKST → koder
z layout-as-thought → mierzalna pętla render-diff (SSIM STERUJE pętlą keep-best, heatmapa;
gate zamknięcia = R13 w F7.1). **⛔ ZAKAZ RE-APROKSYMACJI ZMIERZONYCH WARTOŚCI (wdrożenie
wierności 18.07): koder dostaje z IR gotowy blok `ir.root.css` (`:root{}` z DOKŁADNYMI hex
tła/tekstu/akcentu + `typo_clamp` zmiennych `--typo-*`) i wkleja go 1:1 — NIGDY „mniej więcej
#FAF3E6", gdy zmierzono #F6F2ED. Źródłem typografii jest `scale_px_norm` (px znormalizowane
makieta 1536→render ~1180), NIE surowe px z makiety ani „clamp z głowy". Brief kodera podaje
blok `ir.root.css` DOSŁOWNIE zamiast „PALETA: #…" + „SKALA TYPO @1180: H1≈Xpx". Pełny szablon
briefu i pętla DELT: SEKCJA-Z-MAKIETY.md.** **Jedyne dozwolone różnice względem makiety = podmiany 1:1 W TYM SAMYM
SLOCIE:** żywy tekst (treść z promptu makiety), kanoniczny blok pay-badges, realne zdjęcia
opinii/produktu. NICZEGO nie dodajemy ani nie usuwamy — brak/błąd na makiecie ⇒ powrót
do F2 (poprawka grafiki), nie inwencja kodera. Sekcje czysto-danowe mogą iść z kontraktu.
**Sekcje oznaczone `TOR-I` NIE idą tym torem — mają OSOBNY, RÓWNOLEGŁY przebieg (SPEC-I →
sandbox izolowany → test automatyczny stanów → pętla do zgodności → montaż markerowy na
końcu) wg `docs/zbuduje/SEKCJE-INTERAKTYWNE.md`. Do index.html wchodzą dopiero jako
zielony sandbox.**
Montaż markerowy + cross-check klas body↔CSS + grep gołych `<svg>`.
**WZORCE ANTY-FLAKY dla gate'ów F7.1 (masażer 19.07 — dwa niedeterministyczne LAYOUT-FAIL-e
z winy KODU, nie layoutu):** (1) scena sekcyjna `<picture>` ZAWSZE `position:absolute;inset:0`
pod treścią (position:static = detekcja full-bleed zależy od timingu lazy-load = flaky gutter-FAIL);
(2) etykiety/teksty kafli = elementy SEMANTYCZNE (`<p>`/`<hN>`), nigdy gołe `<div>` (contentBlock
DOM self-checków ich nie liczy → fałszywa „pusta kolumna"). (3) **Skala nagłówków per sekcja:**
makiety edytorialnie WARIUJĄ H1/H2 (55–80px oversized display) — jeden globalny clamp `.h2` daje
jednolite ~51px i 13 patchy w F7.1; koder od razu daje per-sekcja override tam, gdzie makieta ma
oversized H. (4) **Mid-CTA (§4) = PEŁNOPRAWNA SEKCJA Z WŁASNĄ MAKIETĄ d+m (Tomek 20.07 na masażerze:
goła wstawka re-CTA bez makiety „źle zaprojektowana — przemyśleć sens, wykorzystać potencjał"
— ZASTĘPUJE wcześniejszą regułę „nie jako osobny section"):** sekcja mid-CTA po klastrze
dowodu jest projektowana jak każda inna (F2: koncepcja „drugiego momentu decyzji" ≠ kopia
hero/oferty; makieta desktop+mobile; STYLE-DNA; anty-duplikacja trust jako WARIACJA)
i przechodzi pełne gate'y (IR/rubryka/kompozyt). Goły przycisk z reassure-strip dodany
w kodzie = FAIL projektowy.
**🧩 MODUŁY KANONICZNE (R13 — `docs/zbuduje/moduly/` + `MODULY.md`).** Gdy sekcja ma
odpowiednik w bibliotece, koder MUSI użyć modułu jako **BAZY MECHANIKI** — nie pisze
mechaniki od zera. Dostępne @1: `wideo-rail` (rail 9:16, IO-autoplay, unmute-exclusive),
`lightbox` (delegacja `.gitem`), `sticky-buy` (IO na `.hero` + IO na `#zamow` — pasek chowany
nad checkoutem), `faq-accordion` (natywny `<details>`, ZERO JS), `footer` (stopka standardowa:
marka+linki-prawne+zaufanie, ZERO JS), **`checkout-inline`** (SEKCJA #zamow = TEN MODUŁ:
pełny checkout na landingu — COD+BLIK+online po Public Storefront API; warianty layout
flat|steps; prawo/walidacja/eventy w mechanice).
**SEKCJA #zamow OD 21.07 = moduł `checkout-inline`** (zastępuje dawną kartę oferty z linkiem
do kasy platformy — klient finalizuje NA landingu). Makieta oferty z F2 = wzór SKÓRKI
(paleta/nastrój/typografia karty), nie struktury — struktura formularza jest w kontrakcie
modułu. **Skórka = mapowanie tokenów `--zc-*` na tokeny landinga ALIASAMI** (`--zc-text:var(--ink)`
itd. — nie dublować hexów; hex wolno tylko gdy landing nie ma zmiennej). Konfig przez
`data-zc-product="{{WF2_PRODUCT_ID}}"` (ten sam placeholder co runtime-snippet; publish
podmienia). **Layout = STEPS, JEDYNA wersja** (decyzja Tomka 21.07 — micro-konfigurator z otwierającymi
się etapami; A/B flat-vs-steps ODWOŁANE; flat istnieje wyłącznie jako degradacja bez JS).
**Płatność BEZ preselekcji (@2):** COD-copy („przy odbiorze") wyłącznie po świadomym wyborze
metody; **CTA bez kwoty** (kwota tylko w podsumowaniu).
**CTA submitu modułu (STANDARD FABRYKI, decyzja Tomka 21.07): „Zamawiam i płacę", a przy
wybranym COD dynamicznie „Zamawiam i płacę przy odbiorze"** (`ctaLabelText()` w mechanice —
NIE nadpisywać w skórce). To jedyny wyjątek od reguły „⛔ NIGDY COD na przycisku" (ta reguła
dalej obowiązuje dla scrollujących CTA `[data-checkout]` na landingu — tam „Zamawiam <Produkt>");
submit modułu to przycisk prawny (art. 17 UoPK) i mówi o płatności wprost.
Skórowanie = TYLKO tokeny/kolory/promienie/cienie/treść (kontrakt w
nagłówku pliku modułu). **Z6 (design per projekt) dotyczy WYGLĄDU, nie MECHANIKI** — mechanika
jest wspólna i sprawdzona; proporcje i JS = nietykalne (np. wideo desktop = `repeat(N,1fr)`,
⛔ NIGDY `grid-auto-flow:column;grid-auto-columns:1fr` = slivery Odpalaka). Pisanie mechaniki
od zera dla sekcji z modułem = **ODSTĘPSTWO raportowane w LEDGER**.
**BRANDING w kodzie (F2.5):** wordmark = ŻYWY tekst HTML/CSS w foncie landingu (NIGDY obrazek
z gpt-image — diakrytyki), favicon 32 w `<head>` jako data-URI, lockup topbara = favicon LEWA
+ wordmark PRAWA (flex, NIGDY pion). Pliki brand/ (favicon/wordmark/combo) renderowane z fontu,
nie generowane — pochodzą z F2.5. **Znak w topbarze/hero/stopce = PRAWDZIWY favicon brand-forge
(nie inline-SVG „z głowy" kodera).**
**STOPKA (F4 — standard KAŻDEGO landingu, moduł `footer@1`; Tomek 18.07: „footer praktycznie nie
ma, a to ważne miejsce"):** każdy landing kończy się PORZĄDNĄ stopką (NIE „jedna linijka
wyśrodkowana"): (1) marka = favicon + żywy wordmark + jednozdaniowy claim + rating ★; (2) KOMPLET
linków prawnych — Regulamin · Polityka prywatności · Zwroty i reklamacje · Dostawa · Kontakt
(href = placeholdery `{{REGULAMIN_URL}}` itp., podmiana przy publikacji jak `{{CANONICAL_URL}}`);
(3) warstwa zaufania — pay-badges kanoniczne + chipy (14 dni zwrot, bezpieczne płatności, wysyłka);
(4) copyright + nota (VAT / zdjęcia poglądowe). Wielokolumnowy desktop / stack mobile. Brak stopki
lub „stopka jednolinijkowa" = ODSTĘPSTWO (LEDGER).

**F5 — ETAP ŻYCIA I ZAANGAŻOWANIA — OSOBNY, SEKWENCYJNY PRZEBIEG (wzmocnione przez Tomka
16.07: „brakuje animacji w JS, czegoś co doda życia, pokaże profesjonalizm i ZAANGAŻUJE;
nie robić wszystkiego naraz — etapami").** Wykonywany DOPIERO po zamknięciu dopasowania
wizualnego (F7.1) i audytu grafika-first — na stabilnej stronie, jako dedykowana runda:
**⛔ DEKORACJE-SYGNATURY: WIERNIE ALBO WCALE (incydent „struna" masażera 19.07 — Tomek:
„wygląda jak głupia kreska"; usunięta na jego dyspozycję).** Fakty incydentu: motyw struny
BYŁ na wszystkich 7 makietach (splątany ręczny węzeł + wyraźny łuk), ale (a) koder F4 dekorację
POMINĄŁ, a rubryka F7.1 tego nie złapała (drobny element — 5 pól rubryki go nie widzi);
(b) F5 „nadrobił" motyw JEDNYM generycznym współdzielonym PATH-em (płaska kreska + pętelka,
opacity .5) — zdegradowane przybliżenie bogatej dekoracji czyta się na stronie jak artefakt.
Reguły: (1) dekoracja-sygnatura z makiet = odtworzyć WIERNIE per-sekcja (kształt z TEJ makiety,
np. przez CROP/trace) ALBO świadomie pominąć z notą LEDGER — **tanie przybliżenie dekoracji
jest GORSZE niż jej brak**; (2) F5 nadal NIE dodaje bytów wizualnych, których nie ma na
makietach — animuje istniejące; (3) F7.2 sanity po F5 porównuje sekcje z makietami także
pod kątem dekoracji (dowody F7.1 powstają PRZED F5, więc to jedyny moment, który to łapie).**
F5.0. **CHOREOGRAF (NOWE, Tomek 17.07) — procedura `docs/zbuduje/CHOREOGRAFIA-ANIMACJI.md`
   (CZYTAĆ):** 1 call gpt-5.6-sol (high, tekst, cap ~4k) → MOTION-DNA landingu (tokeny
   ruchu z osobowości marki) + SPEC animacji per KAŻDA sekcja (motyw z TREŚCI sekcji,
   intensywność L1/L2/L3, budżet ≤2×L3). Implementacja = JEDEN wspólny moduł (data-mo +
   rozszerzenie istniejącego IO), weryfikacja CDP (klasy .in, 55fps, CLS=0, reduced-motion).
   Każda sekcja żyje własnym motywem, całość mówi jednym językiem. **Wewn. pipeline choreografii
   (CHOREOGRAFIA-ANIMACJI.md) = kroki F5.0.1 plan → F5.0.2 implementacja → F5.0.3 weryfikacja;
   „F5.1" TU (niżej) = creative technologist, NIE implementacja animacji — koniec kolizji.**
F5.1. **CREATIVE TECHNOLOGIST** (gpt-5.6-sol; wybór wzorców z **`docs/zbuduje/
   INTERAKCJE-KATALOG.md`** — katalog 15 wzorców per typ produktu + szablon SPEC-a +
   anty-wzorce; research 16.07). **FILTR SENSU (twardy):** interakcja musi demonstrować
   KORZYŚĆ produktu w momencie wątpliwości klienta — kontrolka zmieniająca tylko liczbę/
   jedną wartość = gadżet = FAIL (przeprojektować wg wzorca-matki #3: kontrolka steruje
   CAŁĄ SCENĄ przez jedną zmienną `--t`). Interakcję FLAGOWĄ landingu spec-ować szablonem
   z katalogu (storyboard+stany+kryteria liczbowe, BEZ gotowego kodu) i kodować na
   NAJWYŻSZYM wykonalnym efforcie.
F5.2. **ZESTAW OBOWIĄZKOWY:** scroll-reveal ze staggerem · JEDNA animacja-motyw korzyści
   (np. łuk świtu rysowany scrollem) · count-up (statyczna liczba w źródle!) · sticky
   slide-in · mikrointerakcje CTA/kart (hover/press states) · **HERO-VIDEO 5 s (STANDARD od
   19.07 — decyzja Tomka przy masażerze; koniec statusu „POC" z Drapka):** pętla Kling 2.5
   image-to-video z SCENY hero (desktop 3:2 + mobile 2:3 = 2 klipy, first frame = last frame,
   ruch subtelny premium — zero morfingu produktu; werdykt klatek początek/środek/koniec),
   transkody webm ~300-400 KB + mp4 ~450-550 KB, `bud-assets/<slug>/video/hero-loop[-m].*`,
   wstrzykiwane JS PO load (poster `<picture>` = fallback LCP; bez reduced-motion/save-data);
   **dobór klipu d/m przez `matchMedia('(min-width:768px)')` Z LISTENEREM `change`** (podmiana
   source+klasa+poster+load/play przy zmianie viewportu — jednorazowy wybór przy load to pułapka:
   rewizja na desktopie przez zwężenie okna/device-mode dostaje landscape-klip rozciągnięty na
   pełny hero; incydent masażer v1); **re-upload klipów na te same ścieżki = cache-bust `?v=N`
   w kodzie** (CDN trzyma stare bajty); **ruch = 3 warstwy naraz, każda subtelna** (produkt
   PRACUJE rytmicznie ~1 cykl/2 s + osoba REAGUJE [barki opadają/oddech] + świat ODDYCHA
   [światło faluje, dolly-in ≤2-3%]) — sam „ambient" bez widocznej pracy produktu = niedosyt
   (feedback Tomka do v1 masażera); warianty per-viewport wybierać na JAKOŚCI (mocniejszy ruch
   nie zawsze wygrywa — desktop masażera wziął łagodniejszy wariant); ~$0.35-0.75/klip · **ELEMENT ANGAŻUJĄCY (wymóg!):**
   co najmniej jedna interakcja, która WCIĄGA użytkownika w produkt (interaktywne demo:
   suwak symulacji efektu, wybór kolorów/wariantów na packshocie, porównanie przed/po —
   z auto-zajawką przy pierwszym pokazaniu, żeby było widać że to interaktywne).
F5.3. Filtr (celowe, zero tandety/particles/tilt/confetti, transform/opacity, fallbacki,
   reduced-motion→off, 60fps bez layout thrashing) → implementacja kodem GPT → test na żywo
   (scroll przez całą stronę, klik każdej interakcji, pomiar jank).
Ruch prowadzi wzrok do dowodu i CTA. Strona bez etapu życia = niekompletna (gate F6).

**🔁 SEKWENCYJNOŚĆ ETAPÓW (Tomek 16.07: „nie próbować robić wszystkiego naraz"):**
F4 kod-struktura → F7.1 dopasowanie wizualne → audyt grafika-first → **F5 życie** →
F7.2 sanity rendera → F7.3 finalny pass. Każdy etap kończy się weryfikacją i zapisem wersji PRZED startem
następnego; jeden etap = jedna intencja (nie mieszać dopasowania z animacjami w jednym callu).

**F6 — WERYFIKACJA TWARDA.** 0 błędów konsoli · 0 h-scrolla (390/768/1280) · wszystkie
`<img>` naturalWidth>0 (eager-wait) · assety 200 · reduced-motion pokazuje pełną treść ·
grep zakazów i liczb · JSON-LD parse · `node --check` exec-scriptu · placeholdery+noindex ·
sticky nie zasłania (padding-bottom stopki) · lightbox/taby/wideo działają ·
**GATE'y z oceny Latarek (Tomek 17.07 — 3 bugi, których stare F6 nie łapało):**
(a) **ZERO SIEROT-ASSETÓW:** lista plików w archiwum `assets/` == URL-e w kodzie — każdy
wygenerowany asset użyty albo świadomie skreślony z notą (Latarek: para macro-off/on i foto
porównania leżały nieużyte, a sekcje były okaleczone); (b) **INTERAKCJA = WIDOCZNA ZMIANA:**
screenshot stanu min vs max (po zatrzymaniu teasera przez zdarzenie input!) — SSIM stanów
<0.9, inaczej FAIL (Latarek: oba stany suwaka = ten sam plik + filtr, który nic nie ukrywał;
efekt „zobacz X" WYMAGA realnej pary stanów); (c) **ASPEKT SCENY == SLOT:** grafika pionowa
w szerokim slocie full-bleed (i odwrotnie) = FAIL PRZED montażem (Latarek: finał 2:3 w slocie
3:2 → cover-zoom obcinał psa); object-position wg pozycji podmiotu na makiecie;
(d) **DEFINICJA GOTOWE TOR-I:** każda sekcja `TOR-I` ma w archiwum `interakcje/`:
SPEC-I.md + sandbox.html + klatki testu (A/mid/B × 390 i 1280) + werdykt vision
„demonstruje cel SPEC-I?". Brak kompletu = FAIL. Świadomy downgrade do wariantu
statycznego jest ważnym „gotowe" wyłącznie z wpisem w LEDGER.md (powód+data). Martwa
interakcja (klik bez zmiany sceny, SSIM stanów ≥0.9) = FAIL nawet gdy reszta zielona;
(e) **GATE DOWODU DOPASOWANIA (audyt Loczka 17.07 — dryf 6/13 sekcji, wszystkie BEZ
kompozytu):** policz pliki `dopasowanie/NN-*.png` — musi być KOMPLET sekcji (hero + 02..ostatnia
wg planu; aliasy `gate-manifest.json` idą 01→12, doki mówią „do ostatniej" — liczy się komplet,
nie sztywny górny numer). Braki = FAIL „niekompletny dowód F7.1", niezależnie od reszty.
Twierdzenie „komplet 1:1" bez kompletu kompozytów jest nieważne.
(e2) **SSIM DWUSKŁADNIKOWY + LAYOUT-DIFF STRUKTURALNY (R13 — audyt Odpalaka: werdykty
odpuszczały mechanikę „kafle mniejsze — bez wpływu").** `sekcja-diff.py` liczy per sekcję:
(1) **SSIM wg TYPU** — KODOWA: twardy < 0.85 desktop / 0.80 mobile = LAYOUT-FAIL; SCENOWA:
dwuskładnikowy (maska bboxa sceny cap ~0.70 OSOBNO + reszta sekcji po zamaskowaniu sceny próg
0.85) — koniec z „sufit 0.7 na całą sekcję". (2) **LAYOUT-DIFF geometryczny** (IR makiety vs DOM
getBoundingClientRect, wszystko w % szer.): kafle-slivery (cols≥5 & szer<12% & portret),
wysokość vs makieta (kodowa, |Δ|>40%), guttery kolumny treści (hero/final, |Δasym|>0.35), obraz
w slocie (środek na złej stronie, Δcx>0.30). Wynik = kolumna **LAYOUT** w DOPASOWANIE.md; każdy
LAYOUT-FAIL blokuje. **`img-fit.py`** (render CDP per viewport 390+1280) domyka to o DOPASOWANIE
OBRAZ↔BOKS: natywny AR każdego `<img>` vs AR realnego boksa → % ucięcia + oś; ≥40% przy
`object-position` domyślnym = FAIL (dopasuj `aspect-ratio` boksa do obrazu albo steruj `object-position`
którą część pokazać — nigdy center „na ślepo") — łapie `@media` odwrócenia aspektu boksa, których
statyczny crop-lint NIE widzi (incydent Drapek 18.07: obrazy dopasowane na desktopie, ucinane 20-64%
tylko na mobile). Werdykt vision w DOPASOWANIE.md musi być **RUBRYKĄ 5×T/N + WERDYKT**
(skala_elem·AR·guttery·krawędź·wys) — WERDYKT=TAK bez 5×T = FAIL; frazy-wytrychy w sekcji
KODOWEJ (`bez wpływu`, `pomijalne`, `świadoma`, `reflow`, `sufit`, `do decyzji`) = FAIL.
**IR wymuszony dla WSZYSTKICH sekcji** (auto-gen mockup-ir; gate-check: „IR komplet == sekcje").
Progi/typy = `gate-manifest.json` (`sekcja_typy`, `layout_diff`). Szczegóły: `SEKCJA-Z-MAKIETY.md`.
(f) **GATE-CHECK (zbiorczy, maszynowy):** commit landingu dozwolony wyłącznie po `python scripts/mockup-tools/gate-check.py <slug>` z wynikiem 0 FAIL — skrypt (manifest `gate-manifest.json`) jest źródłem prawdy o kompletności artefaktów, nie deklaracja agenta. Sprawdza: pliki obowiązkowe, komplet dopasowanie/, interakcje/ TOR-I, grep zakazów (w tym dynamiczna nazwa shop z KARTY PRAWDY), sieroty assetów, budżety wag, pHash anty-monotonii, kuracje+rejestr nazw w bazie, **(R13): rubryka werdyktu 5×T/N + frazy-wytrychy (KODOWE), kolumna LAYOUT (LAYOUT-FAIL), IR komplet == sekcje**, **oraz (F3A): wierność produktu — wiersz WIERNOŚĆ ∈ {ZGODNA,REAL,ESKALACJA+nota} per grafika produktowa w `dopasowanie/WIERNOSC.md`**.
**AUDYT GRAFIKA-FIRST (RETRO 16.07 — Świtek użył 2/47 grafik!): hero ma `<picture>`
z 3 wariantami scen; liczba unikalnych scen AI w kodzie == mapa assetów (grep URL-i
ai-generated/bud-assets vs mapa); sekcja z makietą-sceną bez grafiki full-bleed = FAIL.**
**🚀 GATE GO-LIVE (przed publikacją na LIVE; 18.07): `python scripts/mockup-tools/gate-check.py
<slug> --published <LIVE_URL>` MUSI przejść 0 FAIL** — blok `published` pobiera ŻYWY HTML
i FAILuje, gdy zostały artefakty preview: nierozwiązany `{{…}}`, `noindex` (niewidoczne dla
Google), nierozwiązane URL-e prawne/pixel/product-id (`{{REGULAMIN_URL}}`/`{{PIXEL_ID}}`/
`{{WF2_PRODUCT_ID}}`), pusty `fbq('init','')`. Tryb PREVIEW (bez `--published`) CELOWO tego
NIE sprawdza — placeholdery są tam OCZEKIWANE (podmiana dopiero przy publikacji na platformie).

**F7 — PĘTLE JAKOŚCI (sekcja po sekcji).**
1. **ETAP DOPASOWANIA — OSOBNA FAZA, DO WYCZERPANIA (wzmocnione przez Tomka 16.07: „strona
   ma wyglądać tak jak makiety"):** dla KAŻDEJ sekcji buduj KOMPOZYT side-by-side (PIL:
   makieta | screenshot, 390 i 1280, wyrównane szerokości) → lista KONKRETNYCH rozjazdów
   (hexy, font-size/wagi, spacing, cienie, zaokrąglenia, brakujące elementy SCENY, kompozycja,
   hierarchia) → poprawka kodem GPT (effort low/medium) → re-render → werdykt vision na
   kompozycie: „czy to ten sam projekt? TAK/NIE + czego brakuje" → iteruj AŻ TAK.
   **🔁 REWRITE-NOT-PATCH (Tomek 16.07: „jak się poprawia, zmiany są niewielkie — lepiej
   zrobić jeszcze raz"):** jeśli werdykt kompozytu = NIE (sekcja odbiega istotnie), NIE
   łatać istniejącego kodu — **przepisać sekcję OD ZERA świeżym callem** z pełnym pakietem
   wytycznych (makieta + wyekstrahowane tokens/wymiary + wnioski z poprzedniej wersji jako
   „czego unikać", NIE jako kod do poprawy) i NAJWYŻSZYM wykonalnym effortem (high przy
   capie ~5k; 504 → medium). Łatki (patch) tylko dla drobnych rozjazdów przy werdykcie
   „prawie TAK". Iteracje: rewrite → kompozyt → werdykt;
   **BEZ limitu iteracji** (pętla do wyczerpania — limit tylko: brak postępu 2 rundy z rzędu
   ⇒ eskalacja: regeneracja grafiki sceny albo nota do nadzorcy).
   **📏 ZAMKNIĘCIE SEKCJI = GATE R13, NIE SUROWY SSIM (po Uśmieszku 16.07 — hero z surowym
   SSIM 0.7829 przeszło jako najgorsza sekcja, bo „próg" liczono na surowym SSIM, który
   real-render vs makieta-AI NIE dyskryminuje wierności). Sekcja jest ZAMKNIĘTA dopiero gdy
   przejdzie TRZY niezależne siatki (kanon = `gate-manifest.json layout_diff`): (1) LAYOUT-DIFF
   DOM self-checki = 0 LAYOUT-FAIL; (2) RUBRYKA werdyktu 5×T/N → WERDYKT TAK (frazy-wytrychy
   w KODOWEJ = FAIL); (3) SSIM TYPOWANY — KODOWA <0.85 desktop / <0.80 mobile = LAYOUT-FAIL;
   SCENOWA = maska sceny cap ~0.70 (INFO, sufit legalny) + reszta po zamaskowaniu sceny <0.85
   = FAIL. Surowy SSIM CAŁEJ sekcji STERUJE pętlą keep-best (rewrite/edit/keep), ale NIE zamyka
   sekcji. Werdykt vision może ZAOSTRZYĆ, nigdy poluzować. Po scene-from-mockup (F3.1) cap
   dotyczy TYLKO maski sceny — niski SSIM reszty = wina kodu lub grafiki do poprawy.**
   Start od hero. Kompozyty
   archiwizować per sekcja/iteracja (`FABRYKA-*/<slug>/dopasowanie/<sekcja>-vN.png`) —
   postęp ma być widoczny dla Tomka. **Artefakt per sekcja jest WARUNKIEM ZAMKNIĘCIA, nie
   opcją. „Kod bezpośrednio przez agenta" (bez calli GPT) NIE zwalnia z F7.1 — odstępstwo
   dotyczy tylko autora kodu, nie pętli dowodu. Koder chunku równoległego dostaje OBRAZ
   makiety sekcji (anotowany URL) ZAWSZE, nie tylko przy „sekcji złożonej".** Podział pracy (RETRO 16.07): analizę rozjazdów na
   kompozytach może robić agent (vision) — GPT wołać do PRZEBUDÓW sekcji; mechaniczne fixy
   CSS/typografii <5% pliku = fixy integracyjne (dozwolone agentowi, raportowane).
2. **Sanity rendera (krytyk wyglądu PRZENIESIONY do F2 — ocenia MAKIETY przed akceptem,
   Z2):** po akceptcie makiet strona NIE podlega już krytyce smaku/wyglądu — zostaje szybki
   przegląd visual-verify wyłącznie pod błędy TECHNICZNE renderu (złamany layout, niezaładowane
   obrazy, h-scroll, jank). Uwaga estetyczna do gotowej strony = uwaga do MAKIETY: wraca
   do F2 jako poprawka grafiki + ponowne przeniesienie, nie „poprawka kodem wg gustu".
   Każda wersja archiwizowana: `Desktop\TN-Sklepy-grafiki\FABRYKA-*\<slug>\vN\`
   (index.html + full-1280 + full-390 + KRYTYKA.md); grafiki w `assets\`.
3. **F7.3 FINALNY PASS DETALI — OBOWIĄZKOWY, ostatni gate przed oddaniem (Tomek 16.07:
   „musi być sprawdzenie na koniec wszystkiego, pixel-perfect"):** pełna procedura
   `docs/zbuduje/FINALNY-PASS.md` — 4 passy kaskadowo (design-linter skryptowy → vision
   warstwowy na crop'ach → squint/blur → proweniencja assetów z tagami P/U/S/R wg
   `docs/zbuduje/OBRAZY-ROLE.md`), format findingów P0-P2, pętla do czystej rundy.
   Uruchamiany PO zielonym dopasowaniu (F7.1) i krytyku (F7.2). Landing bez czystego
   F7.3 = NIEGOTOWY. **EGZEKWOWANY MASZYNOWO (18.07): `gate-check.py <slug>` (BEZ `--no-net`)
   blok `finalny_pass` odpala `detail-lint.py <index.html>` i mapuje findingi — P0/P1 = FAIL
   (blokada oddania), P2 = WARN.** Placeholdery `{{` i zakazy-tekstowe są tu ODFILTROWANE —
   należą do bloków `published`/`grep_forbidden` (SSOT; unik podwójnego FAIL i fałszywego FAIL
   na preview z placeholderami).

**F8 — RETRO (mechanizm uczenia — obowiązkowy).** Raport wykonawcy MUSI zawierać sekcję
„NOWE WNIOSKI" (co zawiodło / co zaskoczyło / co dodać do promptów). Nadzorca po każdym
landingu: konsoliduje wnioski do sekcji 7 (LEKSYKON) **tematycznie** (nie chronologicznie),
usuwa zdublowane, sprzeczności rozstrzyga najnowszą decyzją Tomka, i wpisuje datę+produkt
do CHANGELOG (koniec pliku). Brief każdego kolejnego wykonawcy zaczyna się od „przeczytaj
CAŁY standard" — tak lekcje wchodzą do następnej generacji automatycznie.

---

## 2. ZASADY WIZUALNE

**JASNE TŁA — zawsze.** Tła stron/sekcji wyłącznie jasne (kremy/biele/pastele); ciemne tylko
jako akcenty tekstu/ikon. Footer JASNY. (Badania: jasne = wierność zdjęć, czytelność, zaufanie
masowego B2C; „ciemne+neon" = AI-slop; dark wygrywa tylko w niszach premium/B2B.)
**⚠️ „Jasne" ≠ „kremowe" (20.07): rodzina tła to PARTYTURA** — krem · kość słoniowa · piasek ·
glina/terakota rozbielona · chłodna biel · blady szałwiowy · bladoróżowy · jasny błękit; warunek
KANONU dla każdej: wysoka jasność + niskie nasycenie + WCAG dla body. Zawężenie do kremu było
nawykiem, nie regułą — i to ono najmocniej robiło z landingów rodzeństwo (audyt 20.07).
⛔ ciemne tła i neon: BEZ ZMIAN (decyzja anty-scam Tomka).
**CTA: kontrast + izolacja** — JEDEN kolor akcentu, WYŁĄCZNIE na przycisku zakupu (+ swash, ★).

**🍊 DYSCYPLINA JEDYNEGO AKCENTU — SCOPE (Tomek 19.07; amber rozlał się poza CTA — ikony
korzyści/materiału niespójne, trust-pill raz biały raz amber, gwiazdki, lupka; przemianowane
z „DYSCYPLINY AMBER" i uwolnione od konkretnego koloru 20.07).** Twarda reguła
(SSOT tokenów: `TOKENS-MAKIETY.md`; egzekwuje KRYTYK na makiecie):
- **W AKCENCIE (`--cta`) WOLNO TYLKO:** przycisk CTA · swash `.hi`/`.ac` pod JEDNYM słowem
  nagłówka · gwiazdki ratingu ★. **Nic więcej.** To jest KANON — scope się nie zmienia.
- **KTÓRY to kolor = PARTYTURA (20.07): wolno i ZALECA SIĘ wyprowadzić akcent z realnego koloru
  produktu.** Dawna reguła „kolor produktu nigdy jako UI-accent" (tokeny masażera: `--green`
  *„appears ONLY in the product photography and in the logo, never as a UI accent"*) jest
  **USUNIĘTA** — wykluczała z UI jedyny kolor niosący tożsamość produktu i zostawiała wszystkim
  landingom ten sam amber. Egzekucja różnicy: `gate-check.py` blok `cross_landing` (ΔE koloru
  akcentu < 15 wobec 3 poprzednich landingów = FAIL).
- **CHARCOAL (`--ink`) = WSZYSTKIE ikony funkcjonalne:** korzyści · materiał · kroki demo · lupa
  galerii · FAQ „+/−" · dividery · znaczniki. Ikona funkcjonalna w akcencie = FAIL kalibracji.
- **Trust-pill = JEDEN styl globalnie:** fill z rodziny tła (`--paper`) + tekst/border charcoal —
  nie raz biały, raz w kolorze akcentu.
- **Body = prawie-czerń dostrojona do rodziny tła** (`#33281F`/`#2A211B` na kremie) — ⛔ `#000`,
  ⛔ mglisty jasny (`#6E6053` za jasny na długiej stronie). **Kontrast = KANON, odcień = partytura**
  (⛔ cofanie odcienia „do normy z poprzedniego landingu").
- Reguła KODU (l. „NIE zmieniać samego tokena `--cta`") zostaje: nie remapuj żywego `--cta`; nowa
  makieta po prostu rysuje ikony funkcjonalne w charcoal od początku (nie odwołują się do akcentu).

**WIERNOŚĆ PRODUKTU — 4 WARUNKI (każda generacja z produktem w kadrze; przepisane po
incydencie Latarek 17.07 — „grinder-pen zamiast gilotyny", klient dostałby inny produkt):**
(0) **PASZPORT PRODUKTU** — spisany RAZ per produkt z galerii (agent vision): geometria
i proporcje liczbowo, materiały/kolory, KAŻDY element funkcjonalny z pozycją (wyświetlacz —
co dokładnie pokazuje!, przyciski, osłony, końcówki) + sekcja **„CZEGO NIE MA"** (archetypy,
w które model ucieka) **+ OBOWIĄZKOWA tabela „Cechy dyskryminujące"** (K wierszy
`| Cecha | Musi być | FAIL jeśli |` — klasa produktu + elementy tożsamości; to ONA jest
checklistą gate'u F3A cecha-po-cesze i źródłem K dla `gate-check.py`). Wstrzykiwany do KAŻDEGO
promptu z produktem. Zapis: archiwum `FABRYKA-*/<slug>/PASZPORT.md`.
(1) referencje = **2 czyste packshoty text-free jako obiekty `{url, type:'product'}`**
(⚠️ gołe stringi w `reference_images` to typ 'ref' — scena/styl, NIE produkt; przed 17.07
stringi były GUBIONE po cichu i wszystko generowało się bez referencji!); ZAKAZ infografik
z wypalonym tekstem jako ref; produkt idzie jako image[0] (edge sortuje);
(2) w prompcie: preserve-list (co ma się NIE zmienić) + cechy dyskryminujące z paszportu —
dla produktów ZŁOŻONYCH opis NIE jest minimalny (minimalizm = model wypełnia luki
archetypem); nadal NIE opisuj produktu „na nowo" własnymi słowami poza paszportem;
(3) **GATE = F3A „WIERNOŚĆ DO SKUTKU" — osobny pod-etap, bramka F3→F4 (pełny proces:
`GRAFIKA-Z-MAKIETY.md §4b`).** Per grafika produktowa: **TRÓJKĄT** (grafika + tabela „Cechy
dyskryminujące" paszportu K cech PASS/FAIL + REALNY kadr Ali — NIGDY tylko vs makieta, makieta
może już nieść dryf) oceniany przez **DWIE NIEZALEŻNE PARY OCZU** (pass-1 = generator; pass-2 =
ŚWIEŻY Sonnet BEZ promptu generacji i BEZ werdyktu-1 — rozjazd par = NIEZGODNA). **ZGODNA wymaga
0 FAIL cech ∧ PASS≥K ∧ pass-2=TAK. FAIL którejkolwiek cechy PRODUKTU (klasa / element tożsamości:
wyświetlacz / ostrze / mechanizm) = NIGDY waivable → NIEZGODNA.** Dryf REKWIZYTU-nie-produktu
(tło / dłoń / akcesorium scenografii) — tylko z notą LEDGER + zgodą OBU par. **Pętla regeneracji
DO SKUTKU** z promptem wzmocnionym o KONKRETNĄ cechę (nie „popraw wierność" ogólnie), **max
3 rundy → ESKALACJA** (inny realny ref / crop-first / scena bez produktu + realny `<img>` / nota
do Tomka; bez noty LEDGER = FAIL). Dowód: wiersz per grafika w `dopasowanie/WIERNOSC.md`
(WIERNOŚĆ ∈ {ZGODNA, REAL, ESKALACJA+nota}), egzekwowany przez `gate-check.py` (blok `wiernosc`).
**⛔ Furtka „dryf PRODUKTU = cecha metody" USUNIĘTA — zostaje wyłącznie dla rekwizytu.**
**Wyjątek — produkt CUSTOM** (personalizowany ze zdjęcia klienta): AI TYLKO sceneria,
produkt niosą wyłącznie realne zdjęcia i UGC.

**⚠️ PROPORCJE / GRUBOŚĆ / PROFIL = TWARDA cecha wierności (nie tylko kolor/elementy).**
Kształt bryły produktu — grubość, profil, proporcje wymiarów — jest cechą dyskryminującą **na
równi z kolorem i elementami tożsamości: „produkt płaski w oryginale nie może być gruby na
scenie"** (i odwrotnie: smukły/wysoki nie może być przysadzisty). Paszport MUSI mieć wiersz
„Cechy dyskryminujące" o profilu/grubości z KONKRETEM liczbowym (np. „płaska deska, krawędź
~2–3 cm, NIE gruby blok"), a prompt KAŻDEJ sceny MUSI go wymuszać (`FLAT THIN … edge only
~2-3 cm … NOT a thick box/block`). Model domyślnie pogrubia/upraszcza bryłę do archetypu —
**incydent Drapek 18.07: cienka deska ścierna wyszła jako gruby drewniany klocek ~5–8 cm we
WSZYSTKICH scenach; gate łapał kolor/elementy, ale NIE proporcje.** Gate F3A ocenia profil
cecha-po-cesze vs realny kadr Ali; za gruba / za bryłowata = NIEZGODNA → pętla regeneracji do skutku.

**ESENCJA PRODUKTU.** Sceny kluczowe (hero, demo/PRZED-PO, zastosowania) MUSZĄ pokazywać
mechanizm/efekt działania (pompka → ściśnięte worki; budzik → światło świtu). Plan GPT
proponujący „no product" na scenach kluczowych = nadpisać. Gate całości: z samych grafik
widać, CO produkt robi i po co go kupić.

**🖐️ POZA PRODUKTU = CECHA WIERNOŚCI, NIE TYLKO OBECNOŚĆ CECH (Tomek 20.07 — scena mid-CTA
masażera: silikonowa dłoń ROZCZAPIERZONA JAK SZPON/PAJĄK, palce sterczące w górę+boki,
urządzenie na łopatce zamiast na karku = „zielone stworzenie wczepione w ramię", nie masażer.
Gate F3A dał 8/8 ZGODNA — bo policzył CECHY OBECNE [4 palce+kciuk, zieleń, panel], a poza
była zła. Zła poza była już NA MAKIECIE — krytyk F2 ją przepuścił).** Dwie domknięcia:
- **F3A / Paszport:** wiersz „Cechy dyskryminujące" o elemencie ruchomym (dłoń/głowica/ostrze)
  ocenia go W POPRAWNEJ POZIE UŻYCIA, nie tylko „obecny". Dla masażera: „dłoń UGNIATA — palce
  ZAGIĘTE/wtulone w mięsień; ⛔ FAIL: palce rozczapierzone/sterczące = archetyp-szpon".
  „4 palce obecne" ≠ PASS, jeśli poza to szpon. Sekcja „CZEGO NIE MA" wymienia archetyp-stwór.
- **KRYTYK F2 (checklista, nowe pyt.):** „czy POZA produktu jest apetyczna i intencjonalna
  (produkt robi to, do czego służy, ładnie), czy to archetyp-dryf (szpon/pająk/stwór, produkt
  odłożony bez sensu, dziwna skala)?" — archetyp-poza na makiecie = REGENERACJA makiety PRZED
  akceptem (bo scene-from-mockup wiernie skopiuje złą pozę). Obecność cech to gate F3A;
  URODA POZY to krytyk — oba muszą przejść.

**PRODUKT W SCENACH — anty-monotonia (feedback Tomka do Loczka 17.07: „wszędzie jest tylko
to jedno zdjęcie, to słabo wygląda").** Produkt jest bohaterem — każda sekcja produktowa MA
WŁASNE ujęcie. Ten sam kadr produktu **max 1×** (jedyny wyjątek: packshot oferta+sticky).
Katalog ujęć per typ sekcji: hero=scena bohaterska · problem=kontekst frustracji/porównania
(inny kąt! poziomo/top-down) · demo=SEKWENCJA ≥2-3 ujęć użycia (wkłada → działa → efekt) ·
benefits=detal mechanizmu/rączki (INNY makro niż demo) · oferta=packshot · galeria=MIX kątów
(przód/bok/tył/w dłoni/skala) · final=domknięcie z efektem (inny kąt niż hero). Niedobór
realnych kadrów z galerii Ali → **GENERUJEMY sceny S** (4 WARUNKI + paszport), NIE
akceptujemy monotonii jako „sufitu danych". ⚠️ Klony tej samej POZY w różnych plikach
(scene-from-mockup dziedziczy pozę z ref!) = tak samo złe jak identyczny reuse — w promptach
kolejnych scen produktowych wymuszaj INNY kąt/kontekst („avoid: same upright pose as hero").

**PAY-BADGES — kanoniczny blok `docs/zbuduje/assets/pay-badges.html`** (prawdziwe logotypy:
Visa wordmark-path, Mastercard geometria kół, BLIK znak słowny; białe pigułki z borderem
i cieniem + „ZA POBRANIEM"). Wklejać 1:1; ZAKAZ odtwarzania logotypów z pamięci.

**DNA TYPOGRAFICZNE MAKIET (RETRO dopasowania 16.07 — najtańszy fix o największym wpływie):**
makiety mają zwykle KURSYWNY SERIF-AKCENT na słowie-kluczu nagłówka — koder MUSI wczytać
font szeryfowy (np. Fraunces italic) + klasę `.ac` i owinąć akcenty; każda sekcja treściowa
MUSI mieć eyebrow+`<h2>` zgodny z makietą (gate: sekcja bez nagłówka = błąd); wyrównanie
nagłówków wg makiety (edytorialne=lewa, nie domyślne centrowanie). **PARA FONTÓW Z KONTRASTEM
(19.07 — koniec mono-Baloo): display = H1/H2/marka; osobny WYRAZISTY krój (humanist / ciepły
grotesk — ⛔ NIE zimny Inter) = eyebrow, LICZBY, CENY, wymiary, akapity, label. H1 mobile FLOOR
36-40px (dziś 31px = za skromnie). **KTÓRE kroje = PARTYTURA (20.07) — Baloo 2 nie jest domyślną
(masażer i Drapek dzieliły ją → 9/10 zbieżności); `--font-display` == któryś z 3 poprzednich
landingów = FAIL gate'u `cross_landing`.** Role + skala = `TOKENS-MAKIETY.md`.**
Grafika-first: scena
w interaktywnym stage'u NIE może być wyprana ani mała (tło stage=transparent, spoczynkowy
glow ≤0.42, kadr ≥520px desktop) — biały wash marnuje bogatą generację.

**🎯 KADR SCENY W SLOCIE = BOHATER + LINIA FADE (Tomek 20.07 na masażerze — hero/problem/final
mobile miały bohatera uciętego u góry i martwy pas kremu w boksie; trzeci incydent tej klasy
po Drapku i ster-hero):** dla KAŻDEJ sceny w pasie/slocie (zwłaszcza pionowe 2:3 w pasach
mobile) `object-position` ustawia się ŚWIADOMIE względem dwóch punktów pliku: (1) BOHATER
(twarz/produkt w pełni w kadrze — nigdy ucięta głowa), (2) LINIA FADE (wbudowane przejście
foto→krem ma wypadać w dolnych ~15-25% boksa, a treść/karta pod pasem WYNURZA SIĘ z tego
przejścia — nie wisi pod pustym pasem kremu). ⛔ default `center` dla scen z fade = zakaz.
Werdykt WIZUALNY kadru (zrzut per viewport: „bohater cały? martwa strefa zminimalizowana?
treść na przejściu?") = część zamknięcia sekcji w F7.1; `img-fit.py` mierzy % ucięcia, ale
NIE mówi CO ucięte — procent nie zastępuje oczu. Egzekucja maszynowa: check `fade_line`
(pozycja linii fade pliku w renderowanym boksie) — patrz img-fit/detail-lint.

**Detale rzemiosła:** media kart = jeden `aspect-ratio`+`object-fit:cover` na sekcję
(UWAGA: atrybut HTML `height` na `<img>` BIJE CSS aspect-ratio — dla kafli dawać w CSS
i width, i height) · hero mobile: jasny panel/scrim pod copy (tekst nie może nachodzić
na scenę/twarz) · UGC podpisywać „zdjęcia od kupujących" — NIGDY „z AliExpress" (zdradzanie
źródła = sygnał dropshippingu; uczciwość ≠ zdradzanie źródła) ·
zakaz ornamentów-PNG *cukierkowych* (glossy wstążki/chmurki/ściegi/złoto) — to zakaz TANDETY,
nie kategorii dekoracji: [D-art] z arkuszy wg mapy assetów DOZWOLONY (hand-drawn, torn-paper,
badge-podkład; grain = SVG feTurbulence, nie PNG); poza tym akcenty czystym CSS; wycinki
z arkuszy tylko wg mapy assetów) · UGC z normalizacją CSS (brightness/contrast/saturate) ·
PRZED/PO bez sparowanego realnego kadru = statyczny panel z JEDNĄ spójną sceną (nie mieszać
realnego zdjęcia ze sceną AI w suwaku) · „świecenie" na jasnym packshocie = spotlight
normal-blend ~0.55 (nie mix-blend screen) · grid 2-kol zawsze z mobilnym resetem 1-kol.

---

## 3. WYMAGANIA-ZAWSZE (niezależnie od planu GPT)

**⚓ Pozycje WIZUALNE z tej listy wchodzą do PROMPTÓW MAKIET (F2) — NIE są dokładane na
etapie kodu (Z2: kod nie dodaje niczego, czego nie ma na makiecie). Pozycje mechaniczne
(pomiar, JSON-LD, placeholdery, zachowanie sticky/IO) implementuje kod, bo nie zmieniają
wyglądu żadnego kadru.**

- pay-badges z kanonicznego bloku (hero/oferta/sticky wg mapy anty-duplikacji);
- sticky przycisk zamówienia (mobile, po hero, IO) + KAŻDE CTA `data-checkout` → **#zamow
  (checkout inline na stronie; LL-047, feedback Tomka 22.07: CTA NIE wywozi klienta do kasy
  platformy — runtime snippet podmienia href na checkout_url TYLKO gdy strona nie ma
  `#zamow.zc-checkout`)**. **NA MOBILE cel scrolla = FORMULARZ DANYCH, nie góra sekcji
  (LL-052, feedback Tomka 22.07: „CTA zamawiam na mobile powinno kierować do wysokości
  formularza podawania danych, a nie do pierwszego boxa z prezentacją produktu"):**
  obowiązkowy JS interceptor w skórce osadzenia — delegacja click na `a[href="#zamow"]`,
  guard `matchMedia(max-width:899px)`, scroll do `#zamow .zc-form` z offsetem sticky
  `.topbar`+10, `history.replaceState('#zamow')`; brak `.zc-form` = nawigacja domyślna;
  desktop bez zmian (wzorzec: MODULY.md osadzenie checkoutu, montaz-cta-mobile.py);
- prawdziwe opinie z aukcji ZE ZDJĘCIAMI (kafle + lightbox z pełną treścią; wzorzec:
  drukarka-3d ~l.1324; ae-pic rehost do `bud-assets/<slug>/` przed użyciem);
- **galeria „zobacz produkt" = WYŁĄCZNIE realne kadry z kuracji (`gallery_curated`, klasa R)**
  — AI-sceny (S) ZAKAZANE jako slajd galerii/karty (mogą być tłem sekcji, nie dowodem);
  lightbox + alt PL z `alt_pl`; szczegóły `docs/zbuduje/GALERIA-ALI.md`;
- realne zdjęcia produktu w karcie/galerii/ofercie (AI nie zastępuje dowodu);
- **sekcja WIDEO = klipy DODANE DO PRODUKTU, zero kuracji fabryki, DOCELOWO 4-5 KAFLI
  (LL-044 + korekta Tomka 22.07: „po 4-5 video w tej sekcji"; wcześniej: „usuń całkiem to
  analizowanie i pokazuj te video, które są dodane do produktu — nie chcę, żebyś ty o tym
  decydował")**: pula klipów produktu = `bud_tt_products.tiktok_url` (klip dodany jawnie
  w radarze; atrybucja „@autor" z URL-a) + `ali_snapshot.video_url` (wideo aukcji; bez
  atrybucji) + `videos_curated.items[]` (SUROWA lista klipów radaru — pola werdykt/keep
  IGNOROWANE). Kolejność kafli DETERMINISTYCZNA, bez oceny treści: jawnie dodane najpierw
  (tiktok_url, ali), potem reszta puli wg `plays` DESC, do N=5 (mniej w puli = tyle, ile
  jest; klip niepobieralny yt-dlp = pomiń z notą, NIE zastępuj). Fabryka NIE ocenia
  treści/jakości/przydatności klipów i NICZEGO nie generuje zamiast nich; CAP-y = opisowe
  (co widać), bez wartościowania. Self-host obowiązkowy: yt-dlp na URL-e TikToka / pobranie
  ali video_url (UA Mozilla + referer aliexpress.com) → ffmpeg web (CRF 27, faststart,
  dźwięk zostaje) + poster własną klatką → `bud-assets/<slug>/tt/`. Moduł wideo-rail@1
  (IO-autoplay mute, unmute-exclusive, `preload=none`, kropki mobile; ⛔ LL-045: desktopowy
  `.vid__tile` MUSI mieć `width:100%`, nie `auto` — karta jest absolute-content i kafel
  zapada się do ~2px). **0 klipów w puli = brak sekcji — stan DANYCH produktu (nota
  w MANIFEŚCIE), nie decyzja fabryki.** Pipeline: sekcja 5;
- pomiar (sekcja 5), JSON-LD @graph, `{{PIXEL_ID}}`/`{{CANONICAL_URL}}`+noindex;
  **⛔ CENA NIGDY W METADANYCH (LL-048):** `<title>`, meta description, og:title/description,
  OG-obrazek (chip „Płatność przy odbiorze" zamiast badge ceny) i JSON-LD offers — BEZ ceny
  (cenę prowadzi silnik cen; zapieczona = przyszłe kłamstwo w SERP/social). Cena żyje TYLKO
  w treści strony przez `[data-price]` (hydratacja runtime). Gate published egzekwuje;
- dane twarde 1:1, zakazy (sekcja 4), jasne tła, tech budżet (sekcja 5).

---

## 4. TREŚĆ I ZAUFANIE (rynek PL)

**Biblioteka sekcji** (checklist pokrycia — dobór/kolejność ustala plan GPT): topbar mini ·
HERO = kompletna mikro-oferta 1. ekranu (h1-echo → sub „dla kogo+efekt" → scena z produktem →
chip REDUKCJI RYZYKA [płatność przy odbiorze / bez ryzyka / gwarancja zwrotu] → cena → JEDNO
CTA → mikrocopy) · pas zaufania/COD 1-2-3 (narracja
procesu) · problem→rozwiązanie · demo „jak działa" 1-2-3 · sekcja wideo (klipy dodane do produktu, LL-044) · korzyści
(konkrety z aukcji) · UCZCIWE porównanie z JEDNYM prawdziwym minusem · galeria (lazy,
lightbox, wpleść UGC) · social proof (3-6 opinii ze zdjęciami; małe N uczciwie; 0 opinii →
sekcję pomiń) · oferta box #zamow („co dostajesz", warianty-buttony gdy API poda, gwarancja
zwrotu) · FAQ tuż nad finałem (COD? zwrot jak? wysyłka „pod Twój adres" BEZ terminów ·
1 produktowe) · **mid-CTA (DEDYKOWANA, WYMAGANA — „drugi moment decyzji" po klastrze dowodu; pełna sekcja z makietą d+m
i własnym `[data-checkout]`, §CTA-szkielet pkt 3; ≠ opcjonalne sekcje typu „0 opinii→pomiń" — SKIP tylko z notą LEDGER + wpisem w MANIFEŚCIE)** · FINAL CTA + mini-opinia · sticky bar.

**⛔ ZAKAZ ★/LICZBY OPINII NAD FOLDEM (Tomek 18.07):** topbar i hero NIE pokazują liczby
opinii ani gwiazdek — dla persony COD/AWE (lęk #1 = scam) REDUKCJA RYZYKA (płatność przy
odbiorze / bez ryzyka / 14 dni na zwrot / bezpieczne zakupy) konwertuje SILNIEJ niż social
proof liczbowy. ★ i „N ocen" TYLKO w: sekcji opinii, karcie oferty #zamow, footerze, JSON-LD
(SEO). Nad foldem = redukcja ryzyka.

**MAPA ANTY-DUPLIKACJI TRUST** (każda informacja zaufania max 1× per sekcja):
| topbar | „Płatność przy odbiorze · 14 dni na zwrot" (⛔ bez ★/ocen) |
|---|---|
| header/hero chip | REDUKCJA RYZYKA („Płacisz przy odbiorze — bez ryzyka" / gwarancja) — ⛔ NIE ★/N ocen · **TYLKO desktop** |
| HERO | pod CTA+ceną JEDEN rząd: pay-badges + badge „14 DNI NA ZWROT" |
| COD-strip | narracja 1-2-3 (proces, nie badge) |
| OFERTA | lista „co dostajesz" + pay-badges bez powtórek mikrocopy |
| FINAL | jedyne pełne zdanie płatności + mini-opinia |
| sticky | **LOGO** BLIK/Visa/MC (⛔ nie nazwy tekstem) + „za pobraniem · 14 dni na zwrot" |
Gate: policz wystąpienia „14 dni"/„pobranie"/„BLIK" per sekcja. **Pay-badges = LOGO (SVG), nie nazwy
tekstowe** — także w sticky-buy (Tomek 18.07): „BLIK · karta" jako tekst → podmień na SVG logo.

**⛔ HERO CHIP = TYLKO DESKTOP (Tomek 18.07):** floating chip zaufania w hero (`position:absolute`,
róg sceny) **NIGDY na mobile** — zasłania scenę/wideo hero nad foldem. Mobilny breakpoint MUSI mieć
`.hero-trust{display:none}` (lub odpowiednik). Na mobile redukcja ryzyka żyje wyłącznie w topbarze
i w rzędzie pod CTA (pay-badges + „14 DNI NA ZWROT") — nie jako nakładka na obraz. Incydent Drapek:
chip „Płacisz przy odbiorze" przykrywał hero-wideo na 390px.

**CTA — WIDOCZNOŚĆ + SKUTECZNOŚĆ (rev. Tomek 18.07 — analiza CRO + Shopify/DTC):**
- **Copy action-first, ⛔ NIGDY COD na przycisku:** „Zamawiam <Produkt>" (1. os. + nazwa = poczucie
  własności, spójny czasownik na WSZYSTKICH przyciskach). „zapłacę przy odbiorze"/„za pobraniem" jako
  tekst przycisku = ZAKAZ — COD to ważna informacja, ale schodzi do mikrocopy/reassure POD przyciskiem.
- **Design (kanoniczny `.btn.cta` — jedna zmiana → wszystkie landingi):** akcent na tle papieru /
  ciepłym zdjęciu ma mieć kontrast ≥3:1 (WCAG 1.4.11). Jasny akcent bywa za słaby → kamuflaż
  („przycisk harmonizuje zamiast dominować"). `.btn.cta` dostaje **GRADIENT z głębszym dołem** +
  **cień CIEPŁO-BRĄZOWY** (nie akcent-glow — unosi z tła) + inset highlight + hairline.
  **`--cta-ink` DOBIERANY DO AKCENTU, nie odwrotnie (20.07, partytura):** na jasnym akcencie
  (amber/koral/piaskowy) tekst CIEMNY — biały na amber ≈2.5:1 = WCAG FAIL; na akcencie ciemnym
  i nasyconym (zieleń butelkowa, głęboki błękit, burgund — typowe gdy akcent wyprowadzony
  z koloru produktu) tekst BIAŁY. Mierzyć, nie zakładać. ⛔ **NIE zmieniać samego tokena**
  `--cta` w trakcie budowy (dzielą go swash `.hi`, węzły demo, FAQ).
- **Efekty (clinical-warmth):** hover-lift+cień, sheen-sweep (`::after`, ~.7s), arrow-nudge,
  `:focus-visible`; idle „breathing" = puls SAMEGO cienia (3.4s, klasa `.pulse` TYLKO hero+final,
  `prefers-reduced-motion`). ⛔ zakaz: heartbeat/szybki puls, neon-glow, flip koloru, migotanie (tandeta).
- **reassure-strip pod KAŻDYM samodzielnym CTA** (poza hero/oferta/final z pełnym rzędem pay-badges):
  rząd redukcji ryzyka „Płacisz przy odbiorze · Sprawdzasz przed zapłatą · 14 dni" (wariacja anty-dup).
  Incydent Drapek: CTA w demo stał goły — najsłabsze ogniwo dla persony scam-lęk.
- **OFERTA #zamow:** gwarancja jako JAWNE zdanie risk-reversal („Kupujesz bez ryzyka — nie spodoba się,
  odsyłasz w 14 dni, oddajemy pełną kwotę"), nie tylko badge; + mikrocopy „co po kliknięciu" pod CTA
  („bezpieczny formularz — najpierw adres, płatność na końcu; nic nie płacisz teraz") — odczarowuje lęk
  przed checkoutem nieznanego sklepu.
- **Desktop re-CTA:** sticky-buy jest mobile-only → na desktopie po klastrze dowodu (opinie/korzyści)
  wstaw inline-CTA/pas — inaczej ~6 sekcji jedzie bez przycisku (martwa strefa; sticky nie łata desktopu).
- **Kolejność cena→CTA — WSZĘDZIE ta sama (Tomek 19.07):** cena/oferta ZAWSZE nad przyciskiem
  (hero, oferta `#zamow`, final, sticky). ⛔ final z CTA nad ceną = rozjazd rytmu — makieta finalu
  też trzyma cena→CTA. Reguła wchodzi do makiety (Z2), nie „przestawiana kodem".
- **PIXEL-GUARD (runtime):** listener `[data-checkout]` pali `AddToCart`/`InitiateCheckout` **TYLKO gdy
  href realnie wychodzi na checkout** (URL platformy zhydratowany), NIE przy kliknięciu-scrollu do
  `#zamow` (inaczej fałszywe eventy pomiaru na każdym CTA). Reguła w `landing-runtime-snippet`.

**🎯 CTA — SZKIELET WYMAGANY (BRAMKOWANY; Tomek 20.07 na macie: „za mało CTA; tej dedykowanej sekcji
z CTA też nie ma").** Landing MUSI mieć CTA rozłożone na CAŁEJ długości, nie tylko hero+oferta.
SZKIELET (każdy przycisk = akcja `[data-checkout]` → checkout_url, copy „Zamawiam <Produkt>"):
1. **HERO** — CTA mikro-oferty (cena→CTA nad foldem).
2. **OFERTA `#zamow`** — CTA główne + risk-reversal.
3. **MID-CTA = DEDYKOWANA SEKCJA (WYMAGANA)** — po klastrze dowodu (opinie/korzyści/porównanie),
   „drugi moment decyzji": PEŁNA sekcja z WŁASNĄ makietą d+m (§F4 pkt 4 — NIE goła wstawka). Na
   DESKTOPIE pełni też rolę re-CTA (sticky-buy jest mobile-only, inaczej ~6 sekcji bez przycisku).
   Dozwolony SKIP **tylko** z notą w LEDGER + wpisem `SKIP` w MANIFEŚCIE SEKCJI (F1a).
4. **FINAL CTA** — sekcja domykająca (cena→CTA→mini-opinia).
5. **STICKY-BUY** — mobile, IO po hero.
**BRAMKA `cta`** (F6, `gate-check.py` — egzekwuje, bo dotąd te reguły były OPISOWE i mata je zgubiła):
(a) liczba `[data-checkout]` w kodzie **≥ próg** (domyślnie 4); (b) obecna **dedykowana sekcja CTA**
(`<section id>` ∈ {`mid-cta`,`cta`,`recta`}) **ORAZ** `final`; (c) **≥1 CTA POZA** hero/sticky/zamow
(re-CTA widoczne na desktopie). Brak = FAIL. Landingi bez szkieletu = retro przy dotknięciu.
**CTA PROJEKTOWANE W MAKIECIE (nie „dorobione kodem"):** makiety sekcji **HERO · OFERTA `#zamow` ·
MID-CTA · FINAL** MUSZĄ zawierać ZAPROJEKTOWANY przycisk CTA (kształt/kontrast/pozycja wg partytury,
z widoczną etykietą i strefą pod cenę) — brief F2 tych czterech sekcji **jawnie prosi o CTA w kadrze**,
a KRYTYK makiet sprawdza jego obecność (brak zaprojektowanego CTA na tych makietach = regen). Przycisk
pojawiający się dopiero w kodzie na makiecie bez CTA = rozjazd makieta↔kod (goły re-CTA = FAIL projektowy).

**PŁATNOŚCI**: pełen wachlarz (BLIK/karta/COD) — COD jako główny risk-reversal w narracji,
nie jedyna forma. Pokazujemy TYLKO metody realnie dostępne w checkoucie platformy.

**WARIANTY I DOWÓD Z DANYCH (z Karty Prawdy §1a):** MODEL JEDNEJ CENY — jedna cena PL dla
wszystkich wariantów (baza marży = MAX kosztu wariantów z `sku_prices`); `sku_prices` są
WEWNĘTRZNE (nie pokazywać różnic cen między wariantami). Wariant = wybór estetyczny, NIE zmienia
`data-checkout`/ceny. Swatche/warianty na stronie TYLKO z wizualnym dowodem koloru w galerii;
mapowanie 1:1 PL (Blue→Niebieski, Pink→Różowy, Kaki→Khaki, „LED"→„podświetlenie LED").
`sold_volume` wg §sold (domyślnie POMIJAMY; ≥1000 = jedna nieprzypisana fraza bez liczby, nigdy
licznik u nas). Wideo TikToka na stronie TYLKO po vision-gate (sekcja 3). `shop{name,url}` 🚫
NIGDY na stronie (white label).

**ZAKAZY:** zmyślona pilność/liczniki/„ostatnie sztuki"/„tylko dziś" · JAKIEKOLWIEK obietnice
czasu dostawy („24h", „magazyn w PL") — dotyczy też CYTATÓW opinii (przycinać do zgodnej
części) · przekreślone ceny · obietnice zdrowotne/medyczne (beauty = język kosmetyczny;
zabawki antystres = język zabawowy) · liczby spoza snapshotu · klejmy niepotwierdzone
w aukcji · stockowe twarze · kalki językowe (polszczyzna natywna) · **nazwa/URL sklepu
źródłowego (`shop`)** · **różnice cen między wariantami (`sku_prices` wewnętrzne)** ·
**`sold_volume` przypisany NASZEMU sklepowi („X sprzedanych u nas")**.

**Pilność wyłącznie realna** (sezon). **Ceny psychologiczne**: <150 → ,90; ≥150 → pełne/9,00;
spójne końcówki w portfelu.

---

## 5. TECH · POMIAR · GEO

**Tech budżet:** LCP<2,5s · CLS<0,1 · INP<200ms (mobile 4G) · **MAX 2 fonty custom = para display
+ text/label (19.07 — para z kontrastem z TOKENS-MAKIETY zastępuje regułę „MAX 1 font"): subset
latin-ext, woff2 swap; preload TYLKO fontu display (LCP); rola text może zostać na humanist
system-stacku gdy budżet wagi napięty — swash/accent to opcjonalny 3. krój na 1 słowo, ładowany
leniwie** · hero przez Storage render API (eager+preload,
width wg viewportu), reszta lazy, wszystkie width/height · self-contained: 1 plik, CSS
inline, JEDEN exec-`<script>`, zero bibliotek · overflow-x zablokowany.
**RUNTIME LANDINGA (od 18.07, OBOWIĄZKOWY):** snippet `docs/zbuduje/assets/
landing-runtime-snippet.html` przed `</body>`. Kontrakt DOM: CTA = `<a data-checkout>`,
cena = `<span data-price>` (zapieczona wartość = fallback). Placeholder `{{WF2_PRODUCT_ID}}`
(podmiana przy publikacji). Snippet robi: hydratację ceny+checkout_url z publicznego edge
`wf2-landing-api` (zmiana ceny test→scale BEZ re-publikacji), zdarzenia `window.trevio`
(viewItem/addToCart/beginCheckout), Meta VC/ATC/IC z **INIT-GUARD** (platforma wstrzykuje
pixel na stronach isHtml — landing NIGDY nie robi 2. init/PageView; własny loader tylko
w preview poza platformą) i doklejanie fbclid/_fbp/_fbc do linku kasy. ZAKAZ własnego
`fbq('init')` w exec-script.
**WAGI ASSETÓW (Tomek 17.07 — twarde cele, sprawdzać przy KAŻDYM eksporcie):** format WebP
(foto q≈78-82; PNG tylko D-art z alfą, preferuj WebP-alfa) · wymiar pod realne użycie
(full-bleed ≤1536 szer., kafle ~800px, postery wideo ~720px) · scena hero ≤230 KB · scena
sekcji ≤180 KB · kafel/crop ≤100 KB · poster wideo ≤60 KB · D-art ≤40 KB · wideo ≤2,5 MB/szt.
· 1. ekran ≤350 KB obrazów, cała strona ≤2,5 MB bez wideo. MAPA ASSETÓW ma kolumnę „waga KB"
+ sumę. Przekroczenie = zbij quality/wymiar przed użyciem, nie „potem".

**Pomiar (spięty z WORKFLOW-V2-TESTY.md):** pixel `{{PIXEL_ID}}` (init tylko po podmianie):
PageView+ViewContent (load), **AddToCart na klik KAŻDEGO CTA** (zasila CP2!),
InitiateCheckout (wyjście na kasę) + link decoration (fbclid/_fbp/_fbc na checkout_url) +
HOOKS `?h=N`.

**Wideo TikToka (self-host, decyzja Tomka) — PIPELINE BATCH 1→N (wejście `videos_curated`
keep:true; pętla per element, nazewnictwo `tt/1..N`):**
1. `python -m yt_dlp -f mp4` → tmp (element.url = strona watch, NIE mp4 → yt-dlp obowiązkowy);
2. ffmpeg `scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30 -c:v libx264
   -crf 28 -preset veryfast -movflags +faststart -c:a aac 96k` (HEVC nie gra w Chrome);
   **GATE wagi >2,5 MB → podbij crf / skróć (8-12 s)**; łącznie ≤10-12 MB;
3. **POSTER = WŁASNA KLATKA** ffmpeg (klatka 0 `-pix_fmt yuvj420p`) — cover CDN WYGASA (jak
   ae-pic), nigdy nie linkować `cover` na produkcji;
4. rehost `wf2-asset-rehost` → `bud-assets/<slug>/tt/<i>.mp4` + `<i>.jpg` (Content-Type JAWNY!);
   zapisz `mp4_hosted`/`poster_hosted` z powrotem do `videos_curated`.
Render: `<video muted loop playsinline preload="none">` + IO autoplay/pause (tylko widoczne) +
przycisk głośnika (unmute-jeden-wycisza-resztę) + reduced-motion→poster+controls; atrybucja
PER KAFEL „@autor" (pełna w lightboxie). ⚠️ Ryzyko licencyjne: atrybucja zostaje, zdjęcie na
żądanie twórcy, **NIGDY w kreacjach Meta.**

**GEO (pełna wiedza: GEO-LLM.md):** każdy fakt w serwerowym HTML (boty nie wykonują JS;
count-up = statyczna liczba w źródle) · answer-first (hero-sub 2-3 zdania, akapity 40-75
słów, zero tonu promocyjnego) · JSON-LD @graph (Organization/OnlineStore + Product
z brand=mini-marka, liczby 1:1 z widocznymi, price kropką; BreadcrumbList; FAQPage =
widoczne FAQ; pól bez danych nie zmyślać) · anty-doorway (każdy landing genuinnie unikalny)
· poziom domeny (robots/sitemap/feedy) = wymagania do platformy.

---

## 6. CHECKLIST PRZED PUBLIKACJĄ (gate — wszystkie PASS)

1. grep zakazów (24h/magazyn/ostatnie/tylko dziś/liczniki/przekreślenia/obietnice medyczne).
2. Liczby == `ali_snapshot.review_stats` i dane aukcji (nic ponad).
3. Message match: h1==hook główny; `?h=2`/`?h=3` działa.
4. Pixel: placeholder bez błędów; po podmianie VC/ATC/IC w Test Events.
5. LCP<2,5s (4G) · CLS<0,1 · waga 1. ekranu sensowna.
6. 390/768/1280: zero h-scrolla, sticky nie zasłania, lightbox działa.
7. Wszystkie CTA → #zamow z data-checkout; mikrocopy pod każdym.
8. Pętla dopasowania (F7.1) zamknięta dla KAŻDEJ sekcji: gate R13 = (a) LAYOUT-DIFF DOM
   self-checki 0 LAYOUT-FAIL + (b) RUBRYKA 5×T/N → WERDYKT TAK + (c) SSIM TYPOWANY (KODOWA
   <0.85 desktop / <0.80 mobile = FAIL; SCENOWA: maska sceny cap ~0.70 INFO + reszta <0.85
   = FAIL). Surowy SSIM steruje pętlą keep-best, NIE zamyka. Kanon progów = `gate-manifest.json
   layout_diff`.
9. Sanity rendera (F7.2) czyste: zero błędów technicznych renderu.
10. Wersje + grafiki zarchiwizowane na pulpicie; koszty w ledgerze **ORAZ w `wf2_costs`
    (od 18.07 OBOWIĄZKOWO — zakładka „Koszty" w /tn-sklepy; incydent Drapek: ledger był,
    panel pusty): INSERT per faza (project_id wf2; produkt z portfela → product_id + step_key
    lp_*; stage=2; amount USD; kind gpt-image/openai/fal; landing spoza portfela wf2 →
    projekt rozwojowy `baacc66f-3dd0-462a-9799-de9c7aaea639`).
11. **Karta Prawdy (Z7) — COPY-GATE `gate-check.py` blok `copy`:** grep `shop.name`/URL sklepu
    źródłowego ⊄ HTML; KAŻDY claim ma kotwicę w źródle (§1a); KARTA-PRAWDY TAGUJE każdą
    liczbę-ze-specyfikacji `[KONKRET-SKU]`/`[KONKRET]`/`[SPEC]` — liczba-z-jednostką
    (mAh/cm/W/ml/…) na stronie BEZ kotwicy w karcie na linii z tagiem = **FAIL** („fabrykowane
    specy"); liczba w karcie, ale poza tagiem = WARN; czas/% (14 dni zwrotu, gwarancja) CELOWO
    poza listą (polityka, nie spec). JEDNA cena PL — `>1` distinct `data-price` = **FAIL**
    (zero różnic wariantów); `sold_volume` nieprzypisany.

---

## 7. LEKSYKON WYKONAWCZY (lekcje skonsolidowane TEMATYCZNIE — F8 dopisuje tu nowe)

### 7a. wf2-gpt / koder
- **`reasoning.effort` — STERUJ per zadanie (wf2-gpt przekazuje pole; wf2gpt-call.py: env
  `WF2_EFFORT`). Kalibracja EMPIRYCZNA (Blasik 16.07):** PLAN i KRYTYK vision = **`medium`**
  (`high` na edge jest niewykonalny: 504 przy dużym capie, a przy małym cały budżet idzie
  w reasoning i tekst wraca pusty) · `high` TYLKO krótkie calle tekstowe bez obrazów
  (creative technologist, koncepcje) z capem ~4k · KOD sekcji = `medium` · drobne poprawki /
  przycinanie copy = `low`.
  **AKTUALIZACJA LL-051 (Skrolik 22.07): `high` dla PLANU/KRYTYKA znów dozwolony** —
  wf2gpt-call.py przy 502/503/504 z edge robi AUTOMATYCZNY fallback na bezpośredni
  `api.openai.com/v1/responses` (OPENAI_API_KEY z .env, timeout 900 s, bez wall-clocka
  edge); modele kimi bez fallbacku (klucz tylko w env edge).
- **⚡ RÓWNOLEGŁOŚĆ GENERACJI (17.07 — wąskie gardło to API ~2 min/obraz):** styl-master
  i hero sekwencyjnie (są referencją), ale makiety RÓŻNYCH sekcji po akceptacji hero =
  NIEZALEŻNE → batch 4-6 równoległych POST-ów do wf2-gen (python futures), oglądanie
  i gate'y PO zebraniu. Quality: high tylko drobny tekst + favicon; sceny text-free =
  medium. count=2 tylko przy gate'ach WOW/wierności. Rehosty/pobrania też równolegle.
  Efekt: faza graficzna ~35-45 min → ~12-15 min bez utraty gate'ów.
  **Quality (kalibracja Loczek 17.07):** `high` przy 1536×1024 z referencją = 504 na
  wf2-gen; **`medium` = DEFAULT całej serii makiet i scen** (tekst PL i wierność produktu
  w pełni wystarczające — 25/25 PASS); `high` tylko małe generacje (favicon 1:1) i tylko
  gdy medium zawiedzie. `aspect_ratio` = format Gemini (`3:2`/`2:3`/`1:1`), NIE
  `1536x1024` (cichy fallback do 1:1!).
- **⚡⚡ ORKIESTRACJA = WORKFLOW, nie sztafeta agentów (Tomek 20.07 — „trwa za długo"; jakość
  ABSOLUTNIE nietykalna, koszt może rosnąć).** Cały przebieg fazy prowadzi JEDEN deterministyczny
  skrypt `Workflow` (pipeline per-sekcja: makieta→krytyk→regen, scena→wierność→kod, dopasowanie —
  BEZ bariery „czekaj na komplet"; wall-clock = najdłuższy łańcuch, nie suma). Rozwiązuje też klasę
  „martwy agent twierdzi, że wróci" — skrypt trzyma stan. **Dźwignie (WSZYSTKIE bez dotknięcia
  jakości):** (a) makiety/sceny `max_workers` 8-10 (arbitralny cap w kodzie, NIE limit OpenAI);
  (b) fan-out niezależnych torów: F0 trójstrumieniowe (kuracja zdjęć ∥ wideo ∥ karta), branding ∥
  styl-master, sceny per-sekcja; (c) **hero-video Kling startuje W TLE przy akcepcie sceny hero**
  i renderuje podczas F4/F7 (wstrzykiwany po load); (d) PASZPORT+rezerwacja marki poza ścieżką
  krytyczną; (e) prompt-caching SSOT + brief-bundle downstream — **realizacja: `PARTIALE-PROMPTY.md` = statyczny
  prefiks briefingu, składany PREFIX-FIRST (auto prompt-cache Responses API; `KAPITALIZACJA-OPS §2`)**.
  **⛔ NIE ruszać (bezpieczniki
  jakości, nie koszt):** 2 pary oczu F3A · krytyk makiet · pętla dopasowania F7.1 „do wyczerpania" ·
  komplet gate'ów. Gdzie WIĘCEJ par oczu podniesie jakość — DODAWAĆ. **Wgląd Tomka = PANEL admina,
  NIE czat: `panel-sync` jest częścią KAŻDEGO kroku pipeline (nie tylko końca fazy)** — panel ma być
  żywy na bieżąco (kroki lp_*, makiety, sceny, doki, koszty); wchodzę w czat tylko przy decyzji,
  która jest Tomka. Szczegóły: `[[feedback-fabryka-workflow-orchestracja]]`.
- **⚡ RÓWNOLEGŁOŚĆ FAZY KODU (17.07, quick-wins Tomka):** (1) pipeline WIDEO (yt-dlp/
  ffmpeg/rehost) startuje W TLE równolegle z F4 od pierwszej minuty; (2) najpierw SŁOWNIK
  KLAS + szkielet-kontrakt (1 krok), POTEM 3-4 chunki kodera gpt-5.6-sol RÓWNOLEGLE
  (ThreadPoolExecutor; chunk ≤4 sekcje; lightboxy+JS osobno na końcu) — słownik z góry
  eliminuje rozjazd CSS↔body przy równoległości; (3) sekcje czysto-danowe (FAQ/stopka/
  sticky/prosty pas zaufania) składane z kontraktu BEZ calli GPT; (4) weryfikacje BATCHEM:
  jedna sesja przeglądarki na komplet zrzutów + viewport-diff + kalibracja typografii
  pomiarem OD RAZU (nie po fakcie). Efekt: F4-F7 ~2h → ~30-45 min.
- **Chunki: ≤~4 sekcje na chunk; lightboxy + JS interakcji ZAWSZE OSOBNYM wywołaniem**
  (5 sekcji + 12 lightboxów + JS = pewny 504).
- Marker `<!--PAYBADGES-->`: instruować kodera „NIE dodawaj własnego wrappera .pay-badges"
  (GPT owija — po wklejce kanonicznej robi się zagnieżdżenie); montaż deduplikuje.
- 504 = wall-clock edge, nie tylko rozmiar: kod w chunkach ≤~5k out (literalny HTML — FAQ/
  stopka — zapas 7k); plan-call MAX 2 obrazy i cap ~4-5k; `max_output_tokens` ≠ bezpiecznik.
- Limit inputu 400k znaków (`input_za_dlugi`): screenshoty jako data-URI JPEG q~47 szer.400
  w body (nie argv); wysoki mobile na 2 wywołania.
- **OpenAI safety `[sexual]` = fałszywe alarmy na makro skóry (masażer 19.07):** sceny makro
  karku/ramion/dłoni (kategorie masaż/beauty) potrafią dostać odrzut safety mimo niewinnej
  treści. Obejście: (a) jawnie opisz ODZIEŻ osoby w prompcie; (b) kolejne stany TOR-I
  wyprowadzaj z JUŻ-zaakceptowanej klatki jako ref sceny (bonus: idealna spójność stanów
  dla crossfade). Nie eskaluj do zmiany sceny, zanim nie spróbujesz obu.
- **PLAN F1 = 2 calle z góry (masażer 19.07):** cap 4200 + 2 obrazy NIE mieści pełnego planu
  (gpt-5.6-sol pisze bogate sekcje i ucina paletę/grafiki/HOOKS). Wzorzec: call #1 rdzeń
  (motyw+sekcje, z obrazami) → call #2 krótki TEKSTOWY ogon (paleta/grafiki/CTA/HOOKS, bez
  obrazów). Ogon też **medium** — `high` przy małym capie zwraca PUSTY tekst (cały budżet
  w reasoning; potwierdzone 2× — Blasik i masażer).
- Odpowiedź czytać jako SUROWE BAJTY UTF-8 (python/urllib); PS Invoke-RestMethod = mojibake.
- SŁOWNIK KLAS wspólny dla chunków (inaczej CSS↔body rozjazd, gołe `<svg>` = ikony 300px);
  lightboxy w JEDNYM chunku (inaczej zduplikowane ID). Montaż: cross-check + grep.
- Sekcje z dużym literalnym HTML/SVG (hero, opinie): cap 7-8k; po KAŻDYM chunku grep
  niedomkniętego patha (`d="[^"]*$`) — ucięcie w środku atrybutu rozwala parsing dalszych sekcji.

### 7b. Screenshoty / krytycy
- Przed zrzutem: eager-load wszystkich img aż `naturalWidth>0` (inaczej fałszywe P0),
  wymusić klasy reveal, DPR1 (DPR3 kafelkuje = fałszywe „powtórzenia").
- **Podejrzany artefakt na generacji = POMIAR piksela, nie oko (masażer 19.07):** „ghost"
  panelu w strefie cream okazał się aliasingiem podglądu przy skalowaniu 1536px — skan
  warmth/luminancji cropu = 0 różnicy. Przed regeneracją „bo coś majaczy": crop+zoom 1:1
  + pomiar wartości pikseli; regeneruj tylko realny piksel, nie złudzenie miniatury.
- Full-page ze `svh`: chrome-devtools MCP (captureBeyondViewport), nie goły CLI
  (fallback z override `.hero{min-height:0}`).
- Uwagi o foldzie/sticky/nachodzeniu weryfikować NA ŻYWO (getBoundingClientRect), nie z obrazu.
- Bardzo długie strony do krytyka: zrzuty przez upload do storage + URL (resize ~760/360)
  pewniejsze niż data-URI.
- Uwagi krytyków filtrować względem TEGO standardu (np. COD jest WYMAGANY — „zakaz COD"
  z landing-pages nie obowiązuje). visual-verify i chrome-devtools dzielą przeglądarkę —
  sekwencjonować; zombie-lock profilu → fallback headless z tmp user-data-dir.

### 7c. Materiał źródłowy (aukcja/snapshot)
- **`source='detail'` = warunek konieczny budowy**; `search`/`have` = STOP (galeria bywa
  INNYM produktem — Latarek 17.07). Kuracja galerii → `bud_tt_products.gallery_curated`.
- **Sekcja wideo = klipy DODANE do produktu, 4-5 kafli (LL-044 v2; zastępuje regułę
  „warunkowa" z 19.07):** pula = `tiktok_url` + `ali_snapshot.video_url` + surowe
  `videos_curated.items[]` (werdykty kuracji IGNOROWANE; ⛔ NIE kolumna-licznik `videos` —
  `tt_shop.videos` bywa już wyczyszczone ze snapshotu). Kolejność: jawnie dodane → plays
  DESC, do 5. 0 w puli = brak sekcji z notą w MANIFEŚCIE (stan danych, nie decyzja).
- **„Battery Powered" + „Batteries Included=No" = pułapka POZORNA** dla elektroniki: opis
  (`Charging Method`/mAh) rozstrzyga, czy to akumulator USB — czytać pełny `description`
  PRZED interpretacją specs (specs niosą odziedziczone tagi, jak „NAILCLIPPERS" Drapka).
- Dane ZAWSZE ze snapshotu (nie z odziedziczonego briefu); puste specs → komunikaty
  jakościowe **+ wymiary z rozmiarówek galerii (kuracja DANE) uzupełniają specs**.
- Vision-gate zdjęć i opinii (off-product w obie strony) — obowiązkowy (F0). **WIDEO = BEZ
  vision-gate i BEZ kuracji (LL-044):** klipy dodane do produktu idą na landing takie, jakie
  są (`videos_curated` = zdeprecjonowane dla landingu; historia kuracji: git tego pliku).
  Klipy z widocznym logo producenta/watermarkiem: na landing TAK (to dodany materiał),
  do kreacji Meta NIGDY.
- Rehost zewnętrznych obrazów TYLKO do `bud-assets/<slug>/` — to PREFIX w buckecie
  `attachments` (upload: `/object/attachments/bud-assets/<slug>/...`), nie osobny bucket.
- Treść odrzuconych infografik producenta wolno cytować (dane z aukcji, nie fantazja).
- **Limit realnego dowodu**: ubogie UGC (same packshoty) = social-proof zawsze „słaby" u krytyka —
  to sufit danych, nie kodu; NIE nadrabiać fabrykacją (uwagę krytyka odrzucić z tą notą).

### 7d. Rzemiosło UI (szczegóły w sekcji 2)
- Tabela porównania od razu wzorcem tabela→karty z `data-label` (390!).
- Sticky-buy: `padding-bottom` na body/stopce.
- Count-up: statyczna wartość w źródle; `data-to` bez treści = błąd GEO.
- **Kadr produktu (RETRO 16.07):** kontener `aspect-ratio` + obraz `position:absolute;
  inset:0;width/height:100%;object-fit:contain` (dziecko z height:100% w aspect-ratio
  przelewa się i przycina!); media w kartach split `align-self:center` z własną proporcją
  (stretch = pionowy słup od wysokiej kolumny treści).
- **CSS nie animuje gradientów (background-image snapuje):** zmiana koloru glow/sceny =
  2 warstwy + crossfade `opacity` — standard dla wszystkich „zmieniających kolor" scen.
- **Auto-zajawka każdego interaktywnego demo** (teaser 1 cykl → natychmiastowe oddanie
  kontroli przy 1. interakcji → hint; reduced-motion → bez teasera) — wzorzec F5.
- **Scroll-driven (F5, masażer 19.07):** elementy rysowane scrollem na KOŃCU strony — próg
  ukończenia przy top≈65% vh (dolny element nigdy nie dojedzie do góry viewportu = niedorysowany);
  testy headless scroll-driven z wymuszonym `scroll-behavior:auto` (smooth = undershoot
  programowego scrollTo = fałszywe „reveal nie wszedł"); count-up parsuj `^(\D*)(\d+)(.*)$`
  (inaczej spacja sufiksu wpada do liczby — „1264mAh").
- **Sekcja wideo (F5):** kafle JEDEN `aspect-ratio:9/16` `object-fit:cover` radius+cień, ZERO
  chrome TikToka; lightbox 9:16 w JEDNYM chunku kodera (inaczej zduplikowane ID); JS =
  ROZSZERZENIE istniejącego IO wideo (autoplay-on-visible) o „unmute jednego wycisza resztę";
  wszystkie `preload=none`, poster JPEG rehostowany. Wzorzec 1-wideo: `usmieszek` `#tiktok`
  HTML l.1245-1292, JS l.2400-2408.

### 7e. Narzędzia
- yt-dlp przez `python -m yt_dlp` (winget-shim myli); payloady PL przez plik UTF-8 (cp1250!);
  node ścieżki `c:/...`; jq brak — python/node.
- **wf2-gen/generate-image `reference_images` = ZAWSZE obiekty `{url, type}`** (type:
  `product` — wierność 1:1, idzie jako image[0] · `logo` · `ref` — scena/styl/makieta).
  Gołe stringi są od 17.07 normalizowane do typu 'ref' (a wcześniej były GUBIONE po cichu —
  incydent: cała fabryka generowała bez referencji). Guard: podane referencje, których nie
  da się załadować = twardy błąd, nie cicha generacja z promptu.
- **`input_fidelity` NIE istnieje w gpt-image-2** (parametr odrzucany; wysoka wierność
  inputu jest wbudowana) — nie dodawać do payloadu; dotyczy tylko gpt-image-1/1.5.
- **BRANDING (F2.5) `scripts/mockup-tools/brand-forge.py`** {slug, nazwa, product_id,
  styl-master, paleta, metafora, --font}: rezerwuje nazwę (`bud_brand_names`), generuje N
  faviconów (wf2-gen, gpt-image-2 `type:'logo'`), selektor @32px → top-2 do werdyktu vision,
  biel→alpha, wordmark z fontu, upload `bud-assets/<slug>/brand/`. **Wordmark NIGDY z gpt-image
  (diakrytyki PL) — render z webfontu. Favicon: gpt-image + biel→alpha, quality high, N
  kandydatów + selektor + werdykt vision 6/6.** Dry-run: `--dry-run` (walidacja + rezerwacja-
  check bez zapisu). Nazwy: `CLAUDE_BRANDING_PROCEDURE.md` = tn-workflow, NIE fabryka — nie mieszać.

---

- **Pliki-dowody = struktura to kontrakt (Ugniatek 22.07, LL-036/037):** dopisujesz wiersz do
  WIERNOSC/DOPASOWANIE → przepisz CAŁĄ tabelę (anchor-replace pęka po transformacjach; wiersz
  przed nagłówkiem zostaje headerem parsera), uwagi bez stemów innych assetów (row-match po
  substringu), po zapisie sanity-parse parserem gate. Cena zapieczona = TREŚĆ elementu
  `[data-price]` (kontrakt runtime-snippet) — gate-check czyta obie formy.

## 8. ŹRÓDŁA (research 15.07)

Baymard · KlientBoost/Leadpages (message match +34…66%) · CWV studies (0,1s ⇒ +8,4% CR) ·
DebugBear · Gemius E-commerce PL 2024 (39% COD) · tpay (19% oszukanych) · FTC Dark Patterns ·
Contentsquare (sticky ATC +11…31%) · senja/convert-via (UGC) · landerlab/replo (benchmarki).

## CHANGELOG DECYZJI (F8)

- **2026-07-22 (RUNDA 2 FEEDBACKÓW — Zaradek; LL-044v2/045/046/047):** (1) sekcja wideo =
  4-5 klipów DODANYCH do produktu, zero selekcji (pula: tiktok_url + ali video + surowe
  videos_curated.items; kolejność deterministyczna plays DESC); (2) wideo-rail `.vid__tile
  width:100%` (kafel desktop zapadał się do 2px); (3) checkout: osadzenie `align-items:start`
  + karta produktu sticky, miniatura podsumowania `data-zc-thumb-src` (platforma nie trzyma
  zdjęć), **`platform-sync product` przy PIERWSZYM tworzeniu produktu dostaje `--name
  "<Mini-marka> — <krótki opis>"`** (nazwa trafia do kasy/maili platformy; rename po fakcie
  = przepięcie sluga bez DELETE, wzór FABRYKA-koszyk/rename-platform.py); (4) CTA
  `data-checkout` → #zamow gdy checkout inline na stronie (guard w runtime snippecie).

- **2026-07-22 (PODGLĄD Z ŻYWYM CHECKOUTEM PO F4 — feedback Tomka, Odsączek/LL-038):** checkout
  ma działać bezpośrednio na landingu już na etapie podglądu (wzorzec mata-v6). Fabryka po F4
  (smoke PASS) wykonuje `platform-sync product` + `publish` → landing na domenie sklepu z
  zahydratowanym `{{WF2_PRODUCT_ID}}` i działającym formularzem; panel dostał przycisk „Zobacz
  landing (platforma)" w warsztatach kroków lp_* (landingPreviewBlock). Gate rozszerzony:
  wrapper checkout-inline bez `data-zc-product`+`data-zc-api` = FAIL (incydent: montaż Odsączka
  zgubił data-zc-api → moduł renderował fallback zamiast formularza).

- **2026-07-22 (PIERWSZY PRZEBIEG PRODUKCYJNY — Ugniatek, klient Hoffa):** pełny cykl F0→F8
  na kliencie produkcyjnym zamknięty z gate 0 FAIL (PASS=122). Do fabryki weszły w trakcie:
  LL-032 (callout-collapse 3 warstwy), LL-033 (height:auto przy aspect-ratio + zakaz transformu
  na .reveal do centrowania), LL-034 (sekcja-diff --manifest w mobile), LL-035 (montaż markerowy
  — incydent nadpisanej ceny), LL-036 (struktura plików-dowodów = kontrakt gate), LL-037
  (cena_panel czyta treść elementu [data-price]). Gate rozszerzony: checkout_inline_klasa w CTA,
  klasa wag .mp4 przed hero, cena_panel dwie formy zapieczenia.

- **2026-07-20 (KANON vs PARTYTURA + GATE CROSS-LANDING — decyzja Tomka po audycie 4 gotowych
  landingów na żywo)**: **FAKTY Z AUDYTU:** (1) para **masażer ↔ Drapek = 9/10** w skali „jak
  bardzo wyglądają jak ta sama strona z podmienionym produktem" — oba najnowsze, oba PO doktrynie
  TOKENS-MAKIETY z 19.07, czyli **doktryna podniosła jakość i JEDNOCZEŚNIE zacieśniła zbieżność**
  (*„wymiana palety i zdjęć nie wystarcza — sygnaturę robi mapa sekcji + para font-display +
  kształt CTA"*); (2) **asymetria aparatu**: fabryka miała pełen zestaw narzędzi wykrywających ZA
  MAŁO spójności (SSOT tokenów + STYLE-DNA w KAŻDYM prompcie + checklista krytyka + „rozjazd
  tokenu = regeneracja" + wymóg pliku w manifeście) i **ZERO mechanizmu wykrywającego ZA MAŁO
  różnicy** — `gate-check.py` był w całości zakotwiczony w jednym slugu, phash near-dup działał
  tylko WEWNĄTRZ landingu, krytyk F2 nie miał pytania „czy to wygląda jak poprzedni landing";
  (3) **najostrzejszy dowód**: `--green` — jedyny kolor wyprowadzony z produktu — miał w tokenach
  masażera JAWNY ZAKAZ wejścia do UI (*„appears ONLY in the product photography and in the logo,
  never as a UI accent"*), czyli gdy fabryka wyprowadzała tożsamość z produktu, natychmiast
  usuwała ją z interfejsu i wracała do wspólnego ambera.
  **ZMIANY:** (a) `TOKENS-MAKIETY.md` rozdzielony na **KANON** (poziom warsztatu: rytm 8pt, jasne
  tła, ≤3 kolory i DOKŁADNIE JEDEN akcent w twardym scope, para fontów z kontrastem, jeden
  radius/ikony/trust-pill, ciepła głębia + grain, mechanika modułów, hierarchia oferty, ISTNIENIE
  sygnatury) i **PARTYTURĘ** (kroje, kolor akcentu, rodzina tła, materiał/nastrój, archetyp hero,
  dobór i kolejność sekcji, KTÓRY detal jest sygnaturą) — partytura obowiązkowo uzasadniona
  w `PLAN.md`, a **odchylenie w jej obrębie NIE jest defektem i nie wolno go „naprawiać" do
  normy** (cofanie dotyczy odtąd wyłącznie KANONU); (b) **reguła „kolor produktu nigdy jako
  UI-accent" USUNIĘTA** — akcent wolno i ZALECA SIĘ wyprowadzić z realnego koloru produktu;
  (c) **„jasne" ≠ „kremowe"** — dozwolona rodzina rozszerzona jawnie (krem, kość słoniowa, piasek,
  glina rozbielona, chłodna biel, blady szałwiowy, bladoróżowy, jasny błękit; warunek: wysoka
  jasność + niskie nasycenie + WCAG). ⛔ ciemne tła i neon BEZ ZMIAN (decyzja anty-scam);
  (d) **BIBLIOTEKA ARCHETYPÓW HERO A–H** (§F2 pkt 2) — A „scena pełnoekranowa + scrim" oznaczony
  jako ZUŻYTY (wymaga uzasadnienia); archetyp nie może powtórzyć poprzedniego landingu;
  (e) **8 typów sygnatury wydawniczej** (swash / plusiki / hairline-ramka / stempel / numeracja
  krokowa / znacznik-rożek / marker / taśma) — TOKENS §8; (f) **osie różnorodności CROSS-LANDING**
  (PRZEWODNIK §2b): min. **3 z 5** osi różnicy vs poprzedni landing (rodzina tła · kolor akcentu ·
  font display · archetyp hero · świat/materiał); (g) **Z6 dostał egzekucję** (dotąd jedno zdanie
  bez gate'u); (h) **checklista krytyka F2 pyt. (8)**: „czy ten landing dałoby się pomylić
  z poprzednim? na których osiach się różni?" — <3 osie = regeneracja PARTYTURY, nie kosmetyka;
  (i) **F2.5 generuje per-landing TOKENS z jawnymi nagłówkami `## KANON` i `## PARTYTURA`**;
  (j) **NOWY GATE `cross_landing`** w `gate-check.py` + `gate-manifest.json` (progi jako DANE:
  `n_poprzednich=3`, `delta_e_min=15`, `sekwencja_pct_warn=80`): font display identyczny z 3
  poprzednimi = FAIL · ΔE (CIE76/Lab) akcentu <15 = FAIL · archetyp hero == bezpośrednio
  poprzedni = FAIL · sekwencja `<section id>` >80% podobna (LCS-Dice) = WARN · brak poprzedników
  lub danych = SKIP. Tryb `--cross-only <slug>` do sprawdzenia partytury PRZED budową.
  Zero zmian w HTML gotowych landingów (masażer/Drapek zostają jak są — gate raportuje na nich
  FAIL zgodnie z prawdą; retro przy najbliższym dotknięciu).

- **2026-07-19 (BRANDING R3 — pytanie Tomka „czy flow loga i marki jest tak dobre, jak się da?";
  synteza: research best-practices + audyt adwersarialny brand-forge, 2× Sonnet)**: F2.5
  przebudowane: (1) **DIVERSITY-FIRST** — 2-3 różne metafory znaku zamiast N klonów jednej
  (fixation; walidacja na Trafionku: koncept #2 pobił zwycięzcę v1); (2) kanał **lokalny OpenAI
  HIGH** (fallback edge medium; gpt-image-2 NIE wspiera background:transparent — potwierdzone 400);
  (3) **favicon BEZ referencji styl-mastera** (/edits ze sceną = bleed tła; styl-master zostaje
  referencją makiet); (4) **alfa: próbka rogów + DEFRINGE** zamiast progowania bieli (kremowe
  tła = halo/dziury; bleed = twardy odrzut); (5) selektor + **test MONO** + raport dostępności
  OCR; (6) **werdykt RUBRYKĄ 6×T/N** (w tym @16 na obu tłach) + wymuszona „jedna najsłabsza
  rzecz" — koniec grzecznościowych werdyktów; (7) deliverables + favicon-16/mono, wordmark-dark,
  logo-combo-dark, **brand-context.png (dowód kontekstowy)**, brand.json; (8) **guard glifów
  fontu** (znak spoza cmap = STOP, brak latin-ext = WARN); (9) lockup: skala znaku do wysokości
  glifów (~1.18×), nie pudełka z paddingiem; (10) parasol: claim wf2_projects.name PRZED
  generacją (reserve-before-generate; UNIQUE INDEX w migracji 20260719k — do zaaplikowania).

- **2026-07-19 (DOKI FABRYKI → PRYWATNY BUCKET wf2-docs; dyrektywa Tomka „to musi być dostępne
  z każdego miejsca, nie tylko na moim dysku")**: KAŻDY dokument fazy (.md/.json) jest uploadowany
  do PRYWATNEGO bucketa `wf2-docs/<slug>/` (migracja `20260719e_wf2_docs_bucket`; RLS team_members —
  karta/ledger niosą koszty i marże, publiczny `attachments` ZAKAZANY dla doków) przez nową
  subkomendę **`panel-sync.py doc`** (upload + artefakt w jednym; LEDGER re-upload po każdej fazie).
  Panel (`projekt.html`): chip doka z url `wf2-docs/…` jest KLIKALNY — `openPrivateDoc()` robi
  signed URL (1 h) z sesji team. `storage='desktop'` dla nowych artefaktów = ZAKAZ; Desktop
  `FABRYKA-*/` zostaje kopią roboczą narzędzi. Backfill wykonany: drapek (9 doków) + masazer (5).
  Szczegóły: §1-sync „📄 DOKI FABRYKI" + MOST-PANEL.md.

- **2026-07-19 (PEŁNY ZESTAW ULEPSZEŃ DESIGNU MAKIET — decyzja Tomka „pełny zestaw"; synteza
  3 analiz: audyt procesu + research desktop + research mobile)**: NOWY SSOT
  **`docs/zbuduje/TOKENS-MAKIETY.md`** — mikro-tokeny makiety generowane w F2.5 (ze styl-mastera
  = teraz PLANSZA DNA, nie kopia hero) i wstrzykiwane do KAŻDEGO promptu makiety; domyka dryf
  A/B/C/radius/ikon systemowo (źródło akapitu STYLE-DNA §F2). **TIER 1:** para fontów z kontrastem
  (display Baloo vs text/liczby/ceny humanist — koniec mono-Baloo; H1 mobile floor 36-40px) ·
  dyscyplina amber (amber = TYLKO CTA+swash+rating; WSZYSTKIE ikony funkcjonalne = charcoal;
  trust-pill jeden styl; body ciepła prawie-czerń) · rytm 8pt + hojny whitespace · spójność
  desktop↔mobile (para dzieli bohatera + jeden styl ikon). **TIER 2:** głębia warstwowa (ciepłe
  sepiowe cienie + grain, nie jeden czarny) · wariancja edytorialna sekcji · mikro-interakcje
  (ref §3/F5) · ostra fotografia hero. **TIER 3:** jeden radius serii · kolejność cena→CTA wszędzie ·
  `03-problem` bez produktu egzekwowane NA MAKIECIE (KRYTYK, nie PASS 5 na finale) · dociążenie
  chudych sekcji (FAQ = slot media modułu `faq-accordion@1`; `02-zaufanie` pełna wysokość) ·
  `00-styl-master` = plansza DNA. Wpięcia: §F2 (STYL-MASTER pkt 1 + bullet „🎯 STYLE-DNA MAKIET"
  z checklistą KRYTYKA + F2.4 spójność) · §2 (allow-lista amber + DNA typo para fontów) · §3
  (cena→CTA) · §5 (budżet 2 fonty custom, zastępuje „MAX 1 font") · §1 mapa faz (`lp_styl_marka`
  pole `tokens_url` + doc). `PRZEWODNIK-GRAFICZNY.md`: karta sekcji nosi detale UI (ikony
  charcoal/amber, trust-pill, mikro-interakcja, hero-ostra, FAQ-media, zaufanie-pełna-wysokość).
  Fundament NIETKNIĘTY (sygnatura wydawnicza, motyw, osie różnorodności, asymetria scena+karta,
  hierarchia oferty, uczciwość 4/5, ★ NIE nad foldem). Zero zmian w landing HTML. **DO DOMKNIĘCIA
  w osobnym przebiegu (kod/config):** wiersz `TOKENS-MAKIETY.md` w `gate-manifest.json`
  (`files.wymagane` + `panel_sync doc_wymagane`) — patrz §1 „nowy artefakt bez wiersza = niekompletny".

- **2026-07-18 (KONSOLIDACJA SSOT — sweep spójności po sesji 17-18.07)**: ujednolicony próg
  SSIM (kanon R13 = `gate-manifest.json layout_diff`: KODOWA <0.85 desktop / **<0.80 mobile**,
  SCENOWA reszta <0.85, cap sceny ~0.70 = INFO; historyczne „mobile 0.78" SUPERSEDED) — F7.1
  i §6 pkt 8 przepisane: **zamknięcie sekcji = 3 siatki (LAYOUT-DIFF DOM + RUBRYKA 5×T/N + SSIM
  TYPOWANY), surowy SSIM STERUJE pętlą keep-best, NIE zamyka**; usunięte blankietowe „progi
  twarde SSIM". Z4 doprecyzowany wszędzie (`kod = gpt-5.6-sol LUB agent autorsko`; §1/F4/Z8/
  changelog). Taksonomia obrazów ujednolicona do **P/U/S/R** (F3.4, F7.3). Numeracja faz: kroki
  F5 przelabelowane F5.0–F5.3 (koniec kolizji „F5.1": creative technologist ≠ implementacja
  animacji, która jest F5.0.2 w CHOREOGRAFIA-ANIMACJI.md); jawne kotwice F3.0–F3.5 i F2.4; górny
  zakres sekcji opisany „02..ostatnia" (aliasy manifest 01→12, doki „do ostatniej"). Egzekucja
  gate'ów udokumentowana: `finalny_pass` (detail-lint P0/P1=blok), `copy` (tagowanie liczb +
  jedna `data-price`), `published` (go-live: 0 `{{`, brak noindex). *(blok `f1_marza` USUNIĘTY
  20.07 — fabryka landingów nie ocenia opłacalności produktu.)* Wdrożenie wierności: koder wkleja `ir.root.css` + `scale_px_norm` 1:1 (zakaz
  re-aproksymacji), pętla DELT (`sekcja-diff.py` → sekcja „DELTY POMIAROWE" w DOPASOWANIE.md).
  Martwe odwołania narzędzi naprawione (zrzuty do kompozytów = `capture-lint.py`, nie stara
  nazwa bez `-lint`; `input_fidelity` wykreślony z drzewa GRAFIKA §2; `render-diff.py` +selektor). `scripts/verify-docs.sh` skanuje teraz
  docs/zbuduje/ (osobny zestaw reguł — COD/„za pobraniem" DOZWOLONE dla fabryki).

- **2026-07-18 (GATE WIERNOŚCI DO SKUTKU — proces F3A)**: warunek wierności produktu (3) przepisany
  na osobny pod-etap **F3A** = bramka F3→F4 (wejście do kodu zablokowane, dopóki każda grafika
  produktowa nie ma WIERNOŚĆ ∈ {ZGODNA, REAL, ESKALACJA+nota} w `dopasowanie/WIERNOSC.md`). Trójkąt
  (grafika + tabela „Cechy dyskryminujące" paszportu K cech + realny kadr Ali), **dwie niezależne
  pary oczu** (pass-1 generator + pass-2 świeży Sonnet bez promptu i werdyktu-1; rozjazd=NIEZGODNA),
  **FAIL cechy PRODUKTU nigdy waivable**, pętla regen celowana w konkretną cechę max 3 rundy→eskalacja.
  **⛔ Usunięta furtka „dryf PRODUKTU = cecha metody"** (zostaje tylko dla rekwizytu). PASZPORT
  dostaje OBOWIĄZKOWĄ tabelę „Cechy dyskryminujące" (§2 warunek 0). Egzekucja: `gate-check.py` blok
  `wiernosc` + `gate-manifest.json`; `dopasowanie/WIERNOSC.md` w `files.wymagane`. Stare landingi =
  retro-WIERNOSC przy najbliższym dotknięciu. Pełny proces: `GRAFIKA-Z-MAKIETY.md §4b`.

- **2026-07-18 (przebudowa panelu tn-sklepy)**: fazy F0→F8 odwzorowane 1:1 jako kroki panelu
  `lp_dane…lp_finisz` (Etap 2 „Landing" w /tn-sklepy; kamienie: akcept makiet + gate-check
  0 FAIL) · artefakty fabryki rejestrowane w `wf2_artifacts` (INSERT po uploadzie do
  `bud-assets/<slug>/…` — panel pokazuje galerie w warsztatach) · RUNTIME LANDINGA
  obowiązkowy (sekcja 5): hydratacja ceny z `wf2-landing-api`, `window.trevio`, INIT-GUARD
  pixela (platforma wstrzykuje pixel na isHtml — zakaz własnego init/PageView).

- **2026-07-15**: v1 standardu (research CRO) → FLOW v3/v4 → FLOW V5 (plan GPT); nocna pętla
  R0-R4 (Zmieścik/Świtek/Blasik/Mordulek/Blatek) — lekcje 1-30 (skonsolidowane w sekcji 7).
- **2026-07-16 (Świtek, fabryka od zera)**: kod = gpt-5.6-sol (wówczas „ZAWSZE"; od 18.07 Z4
  dopuszcza agenta autorsko — rozstrzygają gate'y) · BOGATO ALE SPÓJNIE
  (Z3) · makiety sekcyjne przywrócone + pokrycie całego planu + pary desktop/mobile (F2) ·
  GRAFIKA-FIRST + hero 3 warianty + full-bleed (Z2/F3) · pay-badges kanoniczne · pętla
  dopasowania sekcja-po-sekcji (F7.1) · creative technologist (F5) · RETRO jako obowiązkowa
  faza (F8). Nocne landingi R1-R4 skasowane — rebuild pełnym flow.
- **2026-07-16 wieczór (RETRO Świtek+Blasik)**: effort skalibrowany empirycznie (plan/krytyk
  = medium; high tylko krótkie calle bez obrazów) · mobile-makiety z DOKŁADNĄ treścią
  w prompcie (generyczna adaptacja wstrzykuje dropship-claims) · chunki ≤4 sekcje, lightboxy
  +JS osobno, grep niedomkniętych `d="` · PAYBADGES bez wrappera · height-attr vs
  aspect-ratio · „zdjęcia od kupujących" nie „z AliExpress" · hero mobile: panel pod copy,
  object-position, karta oferty · limit realnego dowodu (ubogie UGC ≠ wina kodu) ·
  bud-assets = prefix attachments. ~~OTWARTE do decyzji Tomka: sceny 2-w-1 vs pełne pary
  makiet~~ **ROZSTRZYGNIĘTE — KANON MAKIET (F2, test Uśmieszek):** makiety UI całego planu
  (layout) + OSOBNE sceny text-free jako tła full-bleed; NIE mieszać treści z tłem w jednej
  generacji (nie „2-w-1").
- **2026-07-16 późny wieczór (ocena hero Uśmieszka przez Tomka — PIVOT: MAKIETA JEST ŚWIĘTA)**:
  root cause rozjazdu hero = 4 konkurencyjne źródła prawdy (wymagania CRO wstrzykiwane na
  etapie KODU · gate fake-specs WYCINAŁ treść zamiast naprawiać grafikę · tła LOSOWANE na nowo
  zamiast przenoszone z makiety · pętla wierności bez twardego progu — 0.78 przeszło).
  Naprawa = jedna zasada zamiast czterech łat: Z2 przepisane (strona = czyste przeniesienie
  zaakceptowanych makiet; braki ⇒ poprawka GRAFIKI, nigdy kodu) · wymagania sekcji 3 +
  prawdziwe dane idą do PROMPTÓW makiet (F2 ⚓) · gate fake-specs = regeneracja MAKIETY ·
  tła = TA SAMA scena z makiety (gpt-image-2, makieta jako ref, „remove text/UI"; F3.1) ·
  krytyk ocenia MAKIETY przed akceptem (F7.2 zredukowane do sanity technicznego) · twarde
  progi F7.1 (desktop ≥0.85 / mobile ≥0.78 — SUPERSEDED 18.07: kanon R13 mobile 0.80; gate =
  layout-diff + rubryka + SSIM typowany) · usunięte reguły „makieta = layout, nie źródło
  danych" i „pętla zamyka się na v1 przy 0.69+".

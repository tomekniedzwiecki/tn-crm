# STAN SESJI AUTOPILOT WF2 — projekt 448f2395 (ULEPSZEK / Patryk Skrzypniak) · 2026-07-23 (aktualizacja 4)

## 🔴 FEEDBACK TOMKA 23.07 (2× eskalacja — NADRZĘDNE)
1. **„Znowu brakuje sekcji — nie ma video z TikToka, nie ma zdjęć od klientów… miałeś usunąć
   to, co daje sobie prawo decydować o tym."** → KLASA DOWODOWA BEZ PRAWA SKIP (STANDARD
   §F1a zaktualizowany; LL-058; pamięć feedback-fabryka-manifest-sekcji-kompletnosc).
   Fakty: Rozmrozik miał 6 klatek UGC w bud-reviews (skip na fałszywej diagnozie z Karty);
   Brzuszek 9 klatek (sekcji nie zaplanowano); Rozgrzewek wideo skip po 1. przeszkodzie.
2. **„Hero robi za małe wrażenie — brakuje mp4; wzorzec trafionek.pl/mata."** → HERO-VIDEO
   OBOWIĄZKOWE (LL-059; pamięć feedback-hero-projektowany-pod-hero-video zaktualizowana).
NAPRAWY W TOKU: hero-loopy ×3 wygenerowane (Kling PRO, gate klatkowy PASS, Storage
bud-assets/<slug>/video/hero-loop-pp.mp4): Rozmrozik 486 KB · Brzuszek 1070 KB ·
Rozgrzewek 547 KB. Subagent aceca…: Rozgrzewek hero-video + protokół wideo TT (trim/crop
klipu z wypalonym claimem; jak padnie → blokada-tomek, NIE skip). Subagent a5c1… (F5
Brzuszka) dostał rozszerzenie: hero-video + sekcja zdjęcia-kupujących (9 klatek listing).
ROZMROZIK po powrocie a299…: F6 = hero-video (wzorzec maty) + NOWA SEKCJA zdjęcia od
kupujących (6 klatek bud-reviews/1005011774118215/ — LEDGER-owy „SKIP opinii" był błędny!)
+ MANIFEST update + wpis LEDGER. Wzorzec osadzenia = mata (JS-mount, poster, IO,
reduced-motion=poster; klamra #zamow desktop opcjonalnie).

## ⚡ NAJNOWSZE (aktualizacja 4 — nadpisuje niżej gdzie sprzeczne)
- **3 LANDINGI LIVE:** /rozmrozik · /brzuszek (lp_kod done; F4 $0.85) · /rozgrzewek
  (lp_kod done; F4 $0.85; wideo SKIP na bramce — klip z claimem drenażu; COMPLIANCE FIX:
  platform_name był null → kasa brałaby nazwę z „drenażem limfatycznym"; ustawiono czystą).
- **DEFEKT MODUŁU CHECKOUT (lekcja):** root getElementById('zamow') + brak data-zc-api
  na .zc-checkout = buildConfig null → guard. Brzuszek/Rozgrzewek naprawione w F4;
  **Rozmrozik live ZEPSUTY → hotfix zlecony agentowi dopasowania (SendMessage 23.07)**
  — naprawa + re-publish w jego rękach (on trzyma index.html).
- Produkty Trevio utworzone w F4: Brzuszek pid 019f8ca0-be42, Rozgrzewek pid 019f8cc2-4b9b.
  ⛔ ZAKAZ ensure_product dla wszystkich 3 (duplikat Rozmrozika = precedens).
- **W TLE 3 dopasowania F7.1:** Rozmrozik (a299…, + hotfix), Brzuszek (aa9d…),
  Rozgrzewek (a8f43…). Po każdym: lp_dopasowanie done (checklista VERBATIM) → F5 życie.
- **home-forge: products=[] bo warunek status='gotowy'** (teraz wszystkie 'kandydat';
  gotowy ustawia lp_finisz). Home finalny PO finiszach — placeholder zostaje.
  Kafel Rozmrozika: hero-video.mp4 już wgrany (bud-assets/rozmrozik/assets/, pętla pp 486 KB).
- Parasol (z collect): tagline „Codzienność w lepszej wersji"; paleta #2D5BFF/#F6F7FB;
  fonty Gabarito+Onest; logo bud-assets/parasol-ulepszek/brand/.
- Kolejne kroki po dopasowaniach: F5 lp_zycie ×3 (Rozmrozik: MOTION-DNA.md gotowy +
  osadzenie pętli wideo F6; Brzuszek/Rozgrzewek: choreograf per landing) → lp_finisz ×3
  (gate-check 0 FAIL + RETRO F8 + pl_produkt/pl_landing + status=gotowy) → home-forge
  (collect/build/render/og/publish) → pl_test E2E sandbox → TABELA BLOKAD + 1 push.

## ZROBIONE (panel = prawda)
- Fundament: kalkulacje ×3, ULEPSZEK, ulepszek.pl (apeks aktywny), sklep Trevio
  (SID 019f8b91-5c90-7b17-9b01-eb053213cae2).
- **ROZMROZIK (60215ce4): F0→F4 done, LIVE https://ulepszek.pl/rozmrozik.**
  F5 spec: **MOTION-DNA.md gotowy** (dokończony ręcznie po limicie; TEST-PLAN 10 poz.).
  F6 wideo: **3 pętle PASS w Storage bud-assets/rozmrozik/video/** (*-pp.mp4 ping-pong 10 s
  486/695/1179 KB + postery WebP; final v1/v2 FAIL morfing → v3 PRO PASS; koszt fal $1.61,
  saldo 70.28). Wdrożenie F5+F6 w index.html CZEKA na koniec dopasowania.
- **BRZUSZEK (6dd560cf): F0→F3 done** (lp_dane→lp_grafiki; lp_makiety 7/8 kamień AKCEPT).
  Krytyk F2: 22/22 PASS. F3: 10 scen PASS 1. podejściem; F3A 2 pary oczu 16/16 PASS.
  Naprawy: UGC (naklejka/duch/sierota — inpaint+seamlessClone), packshot-alpha v1
  przywrócony (3 próby czyszczenia łat FAIL — biel-na-bieli; INCYDENT: nadpisany wzorzec
  odzyskany ze Storage). DECYZJE F4 w LEDGER (swash 3px, linki ink, ikony mechanizm,
  09=ugc-2-0-retusz, packshot tylko na białym, arms dokadrować, final 1-kolumna).
  Storage: assets/ 17 plików (+ sc-hero-800). Koszty: F2 $1.56, F3 $2.50.
- **ROZGRZEWEK (4404200a wf2 / 5e1d40a8 bud_tt): F0→F2 done** (lp_dane 7/7, lp_plan 6/6,
  lp_styl_marka 8/8, lp_makiety 7/8 kamień AKCEPT). Brand fav-m1-0 „fala ciepła" 6×T.
  22 makiety; krytyk F2 PASS-Z-POPRAWKAMI (zero regen; 4 decyzje → F3/F4 w LEDGER:
  HERO scena z nośnikiem ruchu wg G-HERO-LOOP; linki ink; TOR-I tylko aktywny wskaźnik;
  hero mobile cap fold). Koszt F2 $5.24.
- **Wideo dostępne: bud-fal-proxy (fal.ai) Kling v2.1 standard/pro; saldo $70.28.**

## W TOKU (subagenci w tle)
1. **F7.1 lp_dopasowanie Rozmrozik** (Opus, a299558594315ea93 — NAJDŁUŻEJ działający):
   sekcja-diff 1280+390, dowody FABRYKA-taca/dopasowanie/ + contact-sheet → panel.
   Po nim: lp_dopasowanie done (checklista VERBATIM) → wdrożenie F5 (MOTION-DNA.md)
   + F6 (osadzenie *-pp.mp4 hero/problem/final) w index.html → smoke → lp_zycie done
   → gate-check 0 FAIL → RETRO F8 → lp_finisz + pl_produkt/pl_landing.
2. **Brzuszek F4 kod+publish** (Opus, a0a0e69383a341e83): szkielet → sekcje gpt-5.6-sol →
   wideo yt-dlp (bramka min 2 klipy; autorzy eves444x/ascensionbae/gina.ruhnay/
   relifefitnessus) → montaż modułów → smoke → publish LL-038 (UWAGA: NIE tworzyć
   duplikatu produktu na Trevio!). Po nim: MÓJ smoke-check + lp_kod done → F7.1
   dopasowanie Brzuszka → F5 życie → finisz.
3. **Rozgrzewek F3 sceny** (Opus, a101c0e67baad1907): sceny wg PRZEWODNIKA + HERO
   z nośnikiem ruchu (decyzja krytyka!); glowica TYLKO crop z g0; UGC bramka ≥2 granatowe;
   WIERNOSC+MAPA. Po nim: F3A 2. para oczu (osobny subagent) → lp_grafiki done → F4.

## PO NICH
- pl_glowna: home-forge FINALNY (3 produkty; podmienia placeholder) — po publikacji
  Brzuszka (min. 2 landingi live). → pl_test (E2E TYLKO sandbox/[Test]) → TABELA BLOKAD
  (pl_dane NRB klienta → pl_dostawy/pl_prawne; kamienie AKCEPT makiet ×3 u Tomka;
  ads_* czeka na ads_start; duplikat produktu Rozmrozika na Trevio do ręcznego skasowania
  — nota w wf2_notes) → koszty komplet → PushNotification (1 ping na koniec).

## TWARDE ZASADY (nie łamać)
NIE PSUJ TPAY · zero publikacji Meta · zero maili · E2E checkout tylko sandbox/[Test] ·
dokumenty z marżami tylko wf2-docs · NIE zmyślać danych · bramki Tomka NIE samo-akceptowane
· polskie znaki przez Write tool, payloady Python UTF-8 (konsola cp1250 → python -X utf8)
· wf2_notes body+author · brand-forge: product-id z bud_tt_products, kanał edge ·
checklisty VERBATIM z projekt.html · modele: wykonanie Sonnet / osąd+kreacja Opus ·
wf2_steps: step_key + data(JSON) · ZAWSZE backup przed edycją wzorca prawdy (lekcja
incydentu g0-retusz) · biel-na-bieli NIE proguje się algorytmicznie (3×FAIL) ·
Kling: standard morfuje produkt w trudnych kadrach → PRO + zawężony ruch.

## KLUCZE/ŚCIEŻKI
.env tn-crm (utf-8-sig): SUPABASE_SERVICE_KEY, WF2_GEN_SECRET, OPENAI_API_KEY,
BUD_TOOLS_SECRET. Narzędzia: scripts/mockup-tools/*.py; runnery FABRYKA-{rozmrozik,
brzuszek,rozgrzewek}/. Dokumenty: FABRYKA-taca/ (Rozmrozik) · FABRYKA-merach/ (Brzuszek)
· FABRYKA-masazer/ (Rozgrzewek). NBP 3,7945. Fonty scratchpad/fonts/. Projekt 448f2395 ·
Rozmrozik 60215ce4 · Brzuszek 6dd560cf · Rozgrzewek 4404200a(wf2)/5e1d40a8(bud_tt).
Backup g0-retusz: scratchpad/g0-retusz-BACKUP.png.

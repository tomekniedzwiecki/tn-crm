# STAN SESJI AUTOPILOT WF2 — projekt 448f2395 (ULEPSZEK / Patryk Skrzypniak) · 2026-07-23 (aktualizacja 5)

## 🔴 FEEDBACK TOMKA 23.07 (4 punkty — WSZYSTKIE ZINSTYTUCJONALIZOWANE)
1. **Sekcje dowodowe skipowane** → KLASA DOWODOWA BEZ PRAWA SKIP (STANDARD §F1a; LL-058).
2. **Hero bez mp4 (wzorzec trafionek.pl/mata)** → HERO-VIDEO OBOWIĄZKOWE (LL-059).
3. **„Commituj zmiany i niech fabryka też to zawsze robi"** → §GIT-DYSCYPLINA FABRYKI
   w STANDARD + pamięć feedback-fabryka-git-commit-po-fazie; commit po każdej fazie
   `wf2(<slug>): <faza> — <skrót>`; push robi główna sesja; NIGDY dwóch agentów w git naraz.
4. **Hero Brzuszka niezgodne z działaniem produktu** → KLASA PRODUKTU STERUJE BEATEM
   (STANDARD F1.7b + LL-060): PASYWNY = statyka+ambient; AKTYWNY = jeden wolny cykl
   ruchu wg PASZPORT MODEL UŻYCIA, rama rigid w NEG.

## ⚡ STAN NAPRAW (aktualizacja 5 — nadpisuje niżej gdzie sprzeczne)
- **ROZGRZEWEK NAPRAWIONY I LIVE** (agent aceca, raport w LEDGER FABRYKA-rozgrzewek):
  hero-video wzorcem maty (hero-loop-pp.mp4 547 KB) + sekcja #wideo z protokołu
  wyczerpania (12 kandydatów TT → c01 trim 15–23 s + crop 4:5 = 1,32 MB bez claimów).
  Blokada-tomek niepotrzebna. lp_finisz nota uzupełniona o naprawę. Commit 6c6f2a71.
- **BRZUSZEK HERO-LOOP v2 LIVE** (feedback #4): Kling PRO, beat = jedno wolne powtórzenie
  crunch (wózek z U-wałkiem po pochyłej belce, rama rigid), gate klatkowy 5 klatek PASS;
  bud-assets/brzuszek/video/hero-loop-pp-v2.mp4 (1506 KB) + poster v2; assets/hero-video.mp4
  nadpisane v2 (kafel home). Re-publish 200. Commity db64c865 + a39b4a31. lp_zycie DONE.
- **Doktryna scommitowana:** 9c59006a (STANDARD F1.7b + LL-060); wcześniej LL-055..059.
  Push origin/main = 9c59006a. LL-060 też w LEKCJE-LANDINGI.md; pamięć hero skorygowana.
- **W TLE (2 subagenci):** finiszer Brzuszka a24ca… (gate-check FABRYKA-merach,
  --product-key a7b70e6a…, panel lp_finisz/pl_produkt/pl_landing + status=gotowy,
  koszt hero v2 do wf2_costs; ⛔ ZERO git — commituje główna sesja) · Rozmrozik a313…
  (finałowy blok: F5 MOTION-DNA + F6 hero-video w dyptyku + NOWA sekcja zdjęć z 6 klatek
  bud-reviews/1005011774118215/ + MANIFEST/LEDGER + publish + commit).
- **Po a313:** lp_zycie Rozmrozika done → finiszer Rozmrozika (gate-check FABRYKA-taca,
  --product-key 59e53d40-5116-45aa-9386-4f9d39a26e31) → status=gotowy.
- Produkty Trevio: Brzuszek pid 019f8ca0-be42, Rozgrzewek pid 019f8cc2-4b9b.
  ⛔ ZAKAZ ensure_product ×3 (duplikat Rozmrozika = precedens, do TABELI BLOKAD).

## ZROBIONE (panel = prawda)
- Fundament: kalkulacje ×3, ULEPSZEK, ulepszek.pl, sklep Trevio (SID 019f8b91-5c90).
- **3 LANDINGI LIVE:** /rozmrozik (hotfix checkoutu OK; finałowy blok w toku u a313)
  · /brzuszek (F0→F5 + hero v2 + sekcja zdjęć; czeka finiszer a24ca)
  · /rozgrzewek (KOMPLET: status=gotowy, lp_* done, naprawa 23.07 wdrożona).
- **ROZGRZEWEK = wzorzec finiszu:** gate-check 29→1 FAIL (mis-scope cross_landing
  Fraunces vs „mata" — międzyportfelowy, udokumentowany LEDGER F8/RETRO §10/LL-057).
  Skrypt panelu: scratchpad/finisz-rozgrzewek.py (checklisty VERBATIM — wzorzec dla ×2).
- Koszty dotychczas: Rozmrozik F2 $1.56 · F3 $2.50 · wideo $1.61; Rozgrzewek F2 $5.24
  · F3 $2.24 · F4 $0.85; Brzuszek F4 $0.85; hero-loopy v1 + Brzuszek v2 — loguje finiszer.

## PO FINISZACH (kolejność)
1. home-forge FINALNY (collect/build/render/og/publish) — wymaga status='gotowy' ×3
   + platform_page_url + okładka 200; kafle = bud-assets/<slug>/assets/hero-video.mp4
   (wszystkie 3 w Storage, HEAD 200).
2. pl_test: E2E TYLKO sandbox/[Test] (⛔ nigdy realna płatność).
3. TABELA BLOKAD: kamienie AKCEPT MAKIET ×3 (u Tomka, done:false); pl_dane NRB klienta
   → pl_dostawy/pl_prawne; duplikat Rozmrozika na Trevio (ręczne skasowanie); ads_*
   czeka na ads_start; + ewentualne luki finiszerów.
4. Koszty komplet w wf2_costs → JEDEN PushNotification → push końcowy git.

## TWARDE ZASADY (nie łamać)
NIE PSUJ TPAY · zero publikacji Meta · zero maili · E2E checkout tylko sandbox/[Test] ·
dokumenty z marżami tylko wf2-docs · NIE zmyślać danych · bramki Tomka NIE samo-akceptowane
· polskie znaki przez Write tool, payloady Python UTF-8 (konsola cp1250 → python -X utf8;
NIGDY heredoc bash z polskimi znakami) · wf2_notes body+author · checklisty VERBATIM
· modele: wykonanie Sonnet / osąd+kreacja Opus · wf2_steps: step_key + data(JSON)
· ZAWSZE backup przed edycją wzorca prawdy · biel-na-bieli NIE proguje się algorytmicznie
· Kling: standard morfuje w trudnych kadrach → PRO + zawężony ruch · gate-check:
--product-key = TT-id (nie wf2!) · re-publish BEZ ensure_product · GIT: commit po fazie,
jeden agent w gicie naraz, push = główna sesja.

## KLUCZE/ŚCIEŻKI
.env tn-crm (utf-8-sig): SUPABASE_SERVICE_KEY, WF2_GEN_SECRET, OPENAI_API_KEY,
BUD_TOOLS_SECRET. Narzędzia: scripts/mockup-tools/*.py (platform-sync, panel-sync,
gate-check). Dokumenty: FABRYKA-taca/ (Rozmrozik) · FABRYKA-merach/ (Brzuszek)
· FABRYKA-masazer/ (Rozgrzewek finisz) · scripts/mockup-tools/FABRYKA-rozgrzewek/
(naprawa 23.07). NBP 3,7945. Projekt 448f2395 · Rozmrozik 60215ce4(wf2)/59e53d40(TT)
· Brzuszek 6dd560cf(wf2)/a7b70e6a(TT) · Rozgrzewek 4404200a(wf2)/5e1d40a8(TT).
Backup g0-retusz: scratchpad/g0-retusz-BACKUP.png. Kasy: /checkout?p=<slug>.

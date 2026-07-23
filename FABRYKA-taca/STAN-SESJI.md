# STAN SESJI AUTOPILOT WF2 — projekt 448f2395 (ULEPSZEK / Patryk Skrzypniak) · 2026-07-23 (aktualizacja 6)

## ✅ RDZEŃ PROJEKTU DOMKNIĘTY
- **3× PRODUKT GOTOWY** (wf2_products.status=gotowy): Rozmrozik · Brzuszek · Rozgrzewek.
  Finisze F8: gate-check 35→3 / 42→4 / 29→1 FAIL (wszystkie rezydua = mis-scope/strefy
  zakazane, udokumentowane w LEDGER-ach F8); manifest-check.py exit 0 ×2; archiwa wg LL-057.
- **HOME FINALNY LIVE** (ulepszek.pl): 3 kafle-wideo (CARD_MEDIA), po audycie wizualnym
  naprawione: „Zobacz Zobacz"→„Zobacz X", platform_name Rozmrozika (kafel miał nazwę
  systemową), og:url. pl_glowna=done.
- **pl_test: NIE PRZESZŁA — TWARDA BLOKADA SKLEPU** (krok pending, checklista wg faktów):
  sklep Trevio w SANDBOX — jedyna dostawa „Kurier [Tryb testowy]" ma isCashOnDelivery=false,
  payment-provider providers=[] → kasa oferuje TYLKO COD, dostawa go odrzuca → POST
  order/cart = 400 deterministycznie. SKLEP NIE MOŻE PRZYJĄĆ ŻADNEGO ZAMÓWIENIA.
  Naprawa: włączyć COD na metodzie dostawy (albo payment provider) — próba przez
  wf2-platform po raporcie badacza InPost; jak API nie pozwoli → zgłoszenie Adrianowi.
  Nota wf2_notes 1440a58c. Ceny landing↔kasa ZGODNE (84,90+9,99=94,89 potwierdzone DOM).

## FEEDBACKI TOMKA 23.07 (#1-#8) — WSZYSTKIE ZINSTYTUCJONALIZOWANE
1-4 (sekcje dowodowe/hero mp4/git/klasa produktu): STANDARD §F1a+§GIT+F1.7b, LL-058..060.
5. HERO-STAGE (hero pod animację OD MAKIETY): STANDARD F1.7c, LL-061.
6. **Słabe pętle taca+rozgrzewek** („nic się nie dzieje"): GATE AMPLITUDY — diff klatek
   0↔5 s ≥ 8.0 (wzorzec crunch=11.9; odrzucone 6.8/2.5). STANDARD F1.7c pkt 6 + LL-062.
   NAPRAWIONE LIVE: Rozmrozik v2 (15.1); Rozgrzewek v3 (7.75) — Kling 2× psuł display/kubek
   → kompozycja ffmpeg: statyczne łatki z wiernej klatki 0 (feather), para+glow żywe.
   Kafle home też podmienione. Koszt $1.47 (wf2_costs). Runnery: regen-hero-v2-taca-
   rozgrzewek.py (gate wbudowany), regen-hero-v3-rozgrzewek.py, scratchpad/compose-v3-*.py.
7. **Etykieta checkoutu nachodziła na pole** (screen Tomka): fix flex-wrap+baseline+8px
   w checkout-inline@2.html i 8 landingach; re-publish ulepszek ×3 + zaradek ×3;
   visual PASS 320/390/1280 obu domen. (mata/usmieszek: fix w repo, deploy przy okazji.)
8. **Mapka InPost Paczkomaty w checkoucie** (Ulepszek + landingi Rafała): badacz w tle
   (agent a0ead…) — API delivery Trevio + JS natywnej kasy + wymogi Geowidget v5.
   Po raporcie: wdrożenie w checkout-inline@2 ×6 landingów ALBO precyzyjne zgłoszenie
   do Adriana (czego brakuje w API). NIE wdrażać bez planu CSP/SRI (pin/rehost!).

## PRZEGLĄD NA ZLECENIE TOMKA (6 agentów Sonnet) — WYNIKI WDROŻONE
- Audyty Rozgrzewek PASS / Brzuszek 95% / panel: naprawione — ceny CTA w [data-price],
  JSON-LD offers usunięte ×2 (LL-048), packshoty 816→57 KB i 290→66 KB (backupy!),
  kolizja #regulacja, nota kamienia „wybor", sanityzacja name Rozgrzewka, pl_domena.
- **manifest-check.py** (scripts/mockup-tools/) = maszynowy gate kompletności sekcji
  + hero-video + compliance; OBOWIĄZKOWY w finiszu i po naprawczym re-publish (STANDARD
  §F1a); format kanoniczny MANIFESTU: N. `id | typ | status — powód`.

## TABELA BLOKAD (do finalnego raportu + PushNotification)
1. **SKLEP NIE SPRZEDAJE** — COD wyłączony na dostawie sandbox (patrz pl_test wyżej).
   Po naprawie POWTÓRZYĆ pl_test. [naprawa moja przez API albo Adrian]
2. Kamienie TOMKA: AKCEPT MAKIET ×3 (lp_makiety item 8, done:false — POPRAWNIE czekają).
3. ads_start + cała faza ads_* — czeka na decyzję Tomka (budżet 1000 zł, konto, pixel;
   {{PIXEL_ID}} niezhydratowany = pomiar Meta OFF do ads_pixel).
4. KLIENT (Patryk): pl_dane — NRB do wypłat COD; pl_prawne (regulamin); pl_dostawy
   (realne metody dostawy zamiast sandbox), krok firma.
5. Duplikat produktu Rozmrozika na Trevio 019f8c16-240c… — ręczne skasowanie (API bez
   DELETE); nota open w wf2_notes.
6. InPost Paczkomaty — wg raportu badacza (może wymagać Adriana).
7. pl_integracje — pending (pixel/CAPI po ads).

## TWARDE ZASADY (bez zmian — nie łamać)
NIE PSUJ TPAY · zero Meta publikacji · zero maili · E2E tylko sandbox/[Test] · marże tylko
wf2-docs · NIE zmyślać · kamienie Tomka NIE samo-akceptowane · polskie znaki: pliki .py +
python -X utf8 (NIGDY heredoc bash) · checklisty VERBATIM · wykonanie Sonnet / osąd Opus ·
backup przed edycją wzorca prawdy · Kling: PRO + zawężony ruch; stałe elementy LOCK w NEG;
uporczywe psucie → kompozycja łatek ffmpeg · gate-check --product-key=TT-id · re-publish
BEZ ensure_product · git: commit po fazie, 1 agent w gicie, push główna sesja (uwaga:
w repo równolegle commituje sesja Prospektora — git add TYLKO po swoich ścieżkach!).

## KLUCZE/ŚCIEŻKI
.env tn-crm (utf-8-sig): SUPABASE_SERVICE_KEY, WF2_GEN_SECRET, OPENAI_API_KEY,
BUD_TOOLS_SECRET. wf2-platform akcje: delivery/delivery_options/add_delivery/orders/
order_detail/set_cod_account/raw (x-wf2-secret). Sklepy: Ulepszek 019f8b91-5c90…,
Zaradek (Hoffa, projekt c2af0524) — landingi ugniatek/odsaczek/skrolik. Projekt 448f2395 ·
Rozmrozik 60215ce4/59e53d40(TT) · Brzuszek 6dd560cf/a7b70e6a(TT) · Rozgrzewek 4404200a/
5e1d40a8(TT). Saldo fal $67.34. Suma kosztów projektu ~$27.14 + 30,32 PLN.

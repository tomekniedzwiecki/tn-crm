# Audyt lejka /sklep — 10 agentów (2026-07-03 noc)

Cel rankingu: wpływ na liczbę WPŁACONYCH rezerwacji 500 zł. 10 perspektyw, ~76 findingów surowych, po dedupie i odrzuceniu ogólników poniżej.

## Quick wins (każdy <1h)

### QW1. Usuń pływający przycisk „Najnowsze" nachodzący na pierwszą kartę produktu
- **Czemu:** Każdy nowy user w 1. sekundzie widzi element UI leżący na środku najważniejszego wizualu — wygląda jak bug i zasłania play/„+ Rozważam"; przy 54% porzuceń pierwsze wrażenie decyduje o wejściu w lejek.
- **Jak:** Usunąć linię 12208 w sklep/index.html (`setJumpVisible(true)` w stageOpener2). Widoczność obsługuje już scroll-handler w :17158 (`setJumpVisible(dist>240)`). Zero ryzyka regresji.
- _Obszar: pierwsze-wrazenie_

### QW2. Gest wstecz: ochrona lightboxa produktu (vpm) + modali „Konkrety" i „Boję się"
- **Czemu:** Swipe-back w webview TikTok/IG na pierwszej interakcji (wideo produktu) wyrzuca z całej strony; a dwa modale gaszące lęk nr 1 (pieniądze/scam) tuż przed rezerwacją nie zamykają się gestem — wrażenie „pułapki".
- **Jak:** W openProductLightbox (index.html:12413) dodać pushModalState() po .add('show'), w closeTopModal (:7867) na początku obsłużyć #vpm (closeVP) oraz dopisać 'facts-modal' i 'fear-modal' do tablicy ids.
- _Obszar: mobile-ux_

### QW3. Podpiąć chipy kategorii karuzeli (backend i CSS już gotowe)
- **Czemu:** Obietnica openera to „wybierz produkt, który Cię kręci", a user dostaje 6 losowych kart bez filtra po zainteresowaniach — dopasowanie produktu to pierwsza konwersja lejka. bud-tt-featured już zwraca categories, vpCatsBar() i CSS istnieją, brakuje 2 linii.
- **Jak:** W renderViralProducts (index.html:12598) dodać `vpCatsBar() +` przed '<div class="vp-trackwrap">' i w delegacji renderChips (:12893-12917) branch na `.vp-cat`: ustaw VP_STATE.cat, page=0, vpFetch(wrap). Przy okazji dodać `.vp-cat{padding:9px 14px}` (tap target).
- _Obszar: pierwsze-wrazenie_

### QW4. Reklamy: prawdziwa nazwa i logo marki usera zamiast „Twoja marka" i pustego awatara
- **Czemu:** Podgląd posta FB/IG to jedyny artefakt bez personalizacji — zabija efekt „to naprawdę moja reklama" dokładnie w momencie, gdy sceptyk ocenia, czy to prawdziwy biznes czy szablon. Reklamy generują się PO domknięciu marki, więc dane prawie zawsze są.
- **Jak:** W renderPaneReklamy (index.html:12018-12025): fbpost__name = esc(state.brand.chosen_name||'Twoja marka'), fbpost__av = <img> z chosen_logo (fallback: obecny gradient). Nagłówek panelu: „Tak będą wyglądać reklamy marki „X"".
- _Obszar: wow-artefakty_

### QW5. CTA współpracy w zakładce Sklep nad iframe (teraz pod foldem, za scroll-trapem)
- **Czemu:** „Zobacz, jak budujemy to razem →" — CTA w peaku motywacji (user ogląda SWÓJ działający sklep) — jest pod prawie pełnoekranowym iframe; dotyk scrolluje zawartość sklepu, nie stronę, więc większość userów nigdy go nie widzi.
- **Jak:** W renderPaneSklep (index.html:12139) przenieść blok `.sk-actions` NAD `.sk-browser` (albo zdublować nad+pod); w medii ≤560px zmienić wysokość .sk-frame-wrap (:2209) na calc(100dvh - 330px).
- _Obszar: mobile-ux_

### QW6. Jedna linia zaufania pod bramką telefonu (po co numer + STOP)
- **Czemu:** Telefon = najbardziej lękowe pole dla grupy bojącej się scamu, jedyna bramka bez „Pomiń" — a nie mówi, co się stanie z numerem. Realnie idą z niego SMS-y marketingowe (bud-followups +72h) bez słowa zapowiedzi — ryzyko „jednak scam" + brak zgody art. 172 PT.
- **Jak:** Pod inputem w phone-ask (index.html:14200-14209) dodać: `<p class="sg-note">Na ten numer wyślę SMS z linkiem do Twojego sklepu i skontaktuję się ws. projektu. Żadnych obcych ofert — odpisz STOP, żeby wyłączyć.</p>` + link do polityki prywatności. Styl sg-note już jest w CSS.
- _Obszar: bramki-tarcie_

### QW7. Bramka budżetu: zapisywać dosłownie to, co user kliknął (nie widełki PLN, których nie widział)
- **Czemu:** User klika „Mam środki na porządny start", a w historii i u AI ląduje „Mam budżet na start (3 000 zł+)" — user widzi „swoją" wypowiedź, której nie powiedział (scam-vibe), a Tomek i lead scoring dostają fałszywą deklarację kwoty.
- **Jak:** Zmienić BUDGET_LABELS (index.html:11383) na teksty 1:1 z przycisków :11372-11375. Widełki do scoringu przenieść do osobnego pola w syncBudgetToServer, nie do wypowiedzi usera.
- _Obszar: bramki-tarcie_

### QW8. Regulamin: dopisać paragraf „Opłata rezerwacyjna 500 zł"
- **Czemu:** Kluczowa obietnica „zwrot bez pytań do 5 dni" istnieje tylko w copy paywalla — regulamin (live) ma 0 wystąpień „rezerwacj"/„500"/„sklep". Nieufny lead przed wpłatą klika regulamin i nie znajduje nic; obie strony bez podstawy umownej w razie sporu.
- **Jak:** UPDATE wiersza public_legal_documents (doc_type=regulamin): paragraf o rezerwacji — w pełni zwrotna, warunek = brak zawarcia współpracy (obojętnie z czyjej strony), do 5 dni roboczych na to samo źródło, zaliczana na poczet budowy 9400 zł + zdanie o rozmowie z asystentem AI. Do noty paywalla (index.html:7534) i modala Konkrety (:7436) dodać link do regulaminu.
- _Obszar: zaufanie-wiarygodnosc_

## Plan na dziś — TOP 10

### #1 [S (~1h)] Naprawić linki rezerwacji w mailach followup/drip — dziś prowadzą do martwej lub złej kasy
- **Czemu (wpływ na 500 zł):** Część klików „Rezerwuję" z maili (najtańszy kanał odzysku) kończy się błędem „oferta nie istnieje" albo checkoutem bez powiązania z sesją — to dosłownie tracone wpłaty 500 zł od leadów o wysokiej intencji.
- **Jak:** bud-followups/index.ts:37 — RESERVE_URL na 'https://crm.tomekniedzwiecki.pl/checkout/v2/' i link budowany jak front (index.html:7685): ?offer=f32102f9-cc1e-42a3-9742-82593dadaaf1&lead_id=<lead>&sid=<sessionId>&spar_email=<email>. bud-drip/index.ts:78 — `lead=` na `lead_id=` + dodać sid i spar_email; docelowo LINK_RESERVE w drip przez panelLink(s.id,'reveal_rezerwacja','#wspolpraca'), żeby rezerwacja szła przez panelowy paywall z proof-gridem i narracją zwrotności. Deploy obu z --no-verify-jwt.
- _Obszar: sciezka-500_

### #2 [S (~1h)] Deep-linki z maili odsłon: mapowanie hashy + powtórka applyHashTab po hydracji
- **Czemu (wpływ na 500 zł):** Lead klika „zobacz SWÓJ raport/sklep" i ląduje na gołym czacie — 3 z 5 hashy (#raport/#strona/#rezerwacja) nie istnieją w routingu, a na nowym urządzeniu hash aplikuje się PRZED dociągnięciem stanu. Cały efekt wow maili przepada.
- **Jak:** bud-drip/index.ts:220-224 — zmapować: raport→#rynek, strona→#sklep, rezerwacja→#wspolpraca (makiety/reklamy zostają). Front: rozszerzyć warunek applyHashTab po hydracji (index.html:7080) z PREVIEW na PREVIEW||resumeFirstHydration (analogicznie do __previewHashDone), żeby #makiety/#sklep działały też przy ?id= na świeżym urządzeniu.
- _Obszar: retencja-powroty_

### #3 [S (~1h)] Mobilny paywall 500 zł: przycisk płatności widoczny od pierwszego ekranu
- **Czemu (wpływ na 500 zł):** Na telefonie (główny ruch) między decyzją „Rezerwuję" a polem BLIK stoi siatka proof 2x2 i 5 kroków — ~2 ekrany scrolla w szczycie motywacji. Każdy scroll tu to utracone wpłaty.
- **Jak:** showReservationPaywall (index.html:7510-7534 + CSS :3992): (1) proof grid w jeden rząd `repeat(4,1fr)`; (2) skrócić <ol> z 5 do 3 pozycji (scalić 3+4, usunąć 5); (3) sticky pasek na dole karty modala „Zapłać BLIK-iem — 500 zł" (scroll-to-BLIK) widoczny od otwarcia. Przy okazji do noty (:7534) dopisać „Płacąc, akceptujesz regulamin" z linkiem.
- _Obszar: sciezka-500_

### #4 [S (~30 min)] Alert Slack przy <zielone> — Tomek ma dzwonić do najgorętszych leadów
- **Czemu (wpływ na 500 zł):** Moment „Projekt zdefiniowany" (chwila przed pitchem 500 zł) nie generuje żadnego pingu na #sparing, bo powiadomienie wisi na martwym, zakazanym markerze <werdykt>. Osobisty telefon Tomka do zielonego leada to najkrótsza droga do wpłaty.
- **Jak:** W bud-chat/index.ts:2162 (blok <zielone>) po zapisie verdict dodać wywołanie maybeNotifyGreenSlack(supabase, sessionId, {email, name/phone z existingSession, karta: ustalenia, brief: preview_brief}). Dedup już istnieje (atomowy claim slack_green_notified_at) — jeden call, zero spamu. Deploy bud-chat.
- _Obszar: mozg-rozmowa_

### #5 [S (~1h)] Wyciąć martwe komunikaty „czeka na Twój kontakt" podczas anonimowej generacji raportu
- **Czemu (wpływ na 500 zł):** Na ścieżce GŁÓWNEJ przez ~2 min generacji anonimowy user czyta w panelu „zostaw konto i imię — wtedy ruszam z raportem", choć żadnej bramki nie ma, a raport i tak przychodzi. Strona „mówi nieprawdę" = scam-vibe dokładnie w oknie pierwszego dowodu wartości.
- **Jak:** W 4 miejscach (index.html:7811-7813, 11087-11094, 10443-10450, 10218-10222) zawęzić warunek do `gateContactMissing() && !(state.chosenProduct && state.chosenProduct.id) && extras.raport !== 'gen'`; w pjxTileMarket (:10218) poprawić odwrócony warunek (`state.chosenProduct.id &&` → `!state.chosenProduct.id &&`). Anonim widzi wtedy pasek „Analizuję rynek…".
- _Obszar: bramki-tarcie_

### #6 [S (~1h)] InitiateCheckout do Meta/TikTok przy otwarciu paywalla BLIK
- **Czemu (wpływ na 500 zł):** Główna ścieżka płatności (BLIK w czacie) omija checkout/v2, więc platformy nie widzą nikogo „blisko zakupu" — kampanie optymalizują się na płytki Lead zamiast na prawie-kupujących, co bezpośrednio obniża jakość ruchu i liczbę wpłat.
- **Jak:** W showReservationPaywall (index.html:7475, po appendChild), raz na sesję (dedup sessionStorage wzorem fireContactEvent :13986): fbq('track','InitiateCheckout',{value:500,currency:'PLN'},{eventID:'ic_'+state.sessionId}) + ttq.track + metaCapi/tiktokCapi z tym samym event_id. Whitelisty backendu już przepuszczają InitiateCheckout (meta-event/index.ts:255) — zero zmian serwera. Bonus 15 min: gaEvent('app_blik_attempt'/'app_blik_fail'/'app_reservation_paid') w buyReservationBlik (:7585-7628).
- _Obszar: pomiar-analityka_

### #7 [M (~2h)] Zbierać e-mail w oknie oczekiwania na raport — dziś sekwencja „porzucona rozmowa" strzela w próżnię
- **Czemu (wpływ na 500 zł):** 3 maile + SMS abandoned obsługują leady z mailem ale BEZ raportu — stan, który prawie nie występuje, bo mail zbierany jest dopiero PO raporcie. 54% porzucających to anonimowie, nieodzyskiwalni. Capture w martwym czasie generacji (~25s-2,5min) tworzy realną populację dla całej retencji.
- **Jak:** Przesunąć kartę rk-mail-card (index.html:8636, maybeOfferReportMail): warunek wejścia z `state.raport` na `extras.raport==='gen'`, copy: „Raport się liczy — zostaw maila, wyślę Ci go z linkiem powrotnym". Backend (bud-followups kwalifikacja 2b) bez zmian — populacja wypełni się sama.
- _Obszar: retencja-powroty_

### #8 [M (~2-3h)] Pierwszy kadr karuzeli: pełna karta z CTA i polską nazwą w viewporcie
- **Czemu (wpływ na 500 zł):** W pierwszych 10 s user widzi tylko anglojęzyczny kadr TikToka bez nazwy PL, liczb i zielonego „Wybieram ten" — nie wie, co może zrobić, a nic nie sygnalizuje scrolla. To góra lejka dla 100% ruchu.
- **Jak:** Trzy zmiany w sklep/index.html: (1) :12265 max-height .vp-vid z 46vh na ~34vh (media ≤560px) + cap ~38vh desktop; (2) :5001 schować orb hero na ≤640px (`.view--chat.is-hero .chat-msgs::before{display:none}`); (3) w vpCardHTML (:12554-12560) polska nazwa produktu na gradient-overlayu na dole kadru (wzór TikToka). Do tego 1 linia kontekstu istniejącym stylem .vp-cap: „Produkty, które teraz viralują na TikToku — realne dane z ostatnich dni. Wybór do niczego nie zobowiązuje."
- _Obszar: pierwsze-wrazenie_

### #9 [M (~2h)] Awarie generacji widziane przez usera: uczciwe 429, wyższe capy IP, recovery-poll po fail
- **Czemu (wpływ na 500 zł):** CGNAT z reklam = dziesiątki userów na jednym IP; przy realnym ruchu 7. landing z tego IP dostaje 429, a front kłamie „trwa dłużej — spróbuj ponownie" (martwa pętla). Do tego artefakt gotowy po oknie polli (Manus >32 min) nigdy nie dociera do otwartej karty — user widzi „nie udało się" i odpada tuż przed rezerwacją.
- **Jak:** (1) Gałąź `res.status===429` w _doReport/_doMockup4/_doAds/_doLanding (index.html:8836/8869/11491): uczciwa karta „limit na dziś — dokończymy i wyślemy mailem" bez force-retry + alert Slack. (2) Podnieść env BUD_LANDING/ADS/MOCKUP/RAPORT_IP_DAILY 3-5× (same sekrety, bez deployu kodu) PRZED kampanią. (3) Gdy dowolny extras.* w 'fail' — setInterval 60 s syncProjectFromServer(); hydratacja już zdejmuje genfail (clearGenFail :6952-6970); wyłączyć timer, gdy nic nie jest w 'fail'.
- _Obszar: tech-niezawodnosc_

### #10 [M (~3h)] Ratunek najgorętszych: mail po porzuconym BLIK-u (pending order) + nurture zielonych bez wpłaty
- **Czemu (wpływ na 500 zł):** Lead, który kliknął „Zapłać BLIK-iem" i nie dokończył, oraz zielony po pełnym prototypie dostają dziś JEDEN mail (~30h) i ciszę — a decyzja o 500 zł u etatowca z lękiem „scam" dojrzewa dniami. To segmenty o najwyższej intencji w całym lejku.
- **Jak:** (1) bud-followups: nowy kind 'reservation_rescue' — kwalifikacja orders.status='pending' AND spar_session_id NOT NULL AND created_at w oknie 3-48h AND paid_at IS NULL; treść o zwrotności („500 zł w pełni zwrotne, zwrot do 5 dni bez pytań") + LINK_VIEW z #wspolpraca; dedup sendOnce. (2) bud-reveal-plan.ts:24 — 2 kroki po 'rezerwacja': verdict_obiekcje (+72h, mail bijący w top-obiekcję „skąd pewność, że 500 zł wróci" + link do warunków) i verdict_last_call (+6 dni, uczciwe domknięcie „projekt zostaje zapisany"). Warunek: verdict='zielony' AND paid_at IS NULL.
- _Obszar: retencja-powroty_

## Tematy strategiczne (na kolejne dni)

### S1. Doręczalność i legalność maili: List-Unsubscribe, uczciwe copy „zero spamu", polityka prywatności
Obiecane „Zero spamu/newslettera" (index.html:13468, 6004) vs realny drip+followupy+SMS bez możliwości wypisu = złamana obietnica u sceptyka + reguły bulk-sender Gmail/Yahoo (maile bez List-Unsubscribe lądują w spamie — cała retencja, główne narzędzie odzysku 54% porzuceń, przestaje dowozić). Do tego polityka prywatności fałszywie twierdzi „brak transferu poza EOG" i milczy o AI/SMS/pikselach (realne ryzyko RODO). Pakiet: stopka wypisu w send-email podpięta pod action:cancel, zmiana copy bramki, aktualizacja wiersza privacy, mini-footer z NIP/kontaktem na /sklep, przeformułowanie „minimum 1000 zamówień" i „10% udziałów" w prompcie na wersje zgodne z FAKTAMI OFERTY.

### S2. Pomiar end-to-end wpłat 500 zł: dziś Google/GA4 nie widzą głównej ścieżki
BLIK-in-chat nie odpala żadnego purchase w przeglądarce, a MP z tpay-webhook używa syntetycznego client_id (lead_id.0) — Google Ads widzi ~0 rezerwacji z /sklep i nie ma na czym optymalizować. Plan: przekazywać cookies _ga/_ga_* w buy_reservation → orders → sendGA4Purchase, gtag('event','purchase') w reservationConfirmed z dedupem po transaction_id; naprawić rozjazd WON/negotiation (tpay-webhook:934 vs bud-project:493 — rezerwacja to negotiation, won tylko przy full_paid_at); bud-funnel-report liczyć zdarzenia po timestampach (paid_at), nie po created_at kohorty, + kroki ustalenia/reklamy; eventy strefy 0-60s (vp_shown/vp_video_open/vp_more) i ujednolicenie taksonomii app_*.

### S3. Higiena mózgu rozmowy (bud-chat): prompt, cache faktów oferty, limity tur, awarie raportu
Prompt spuchł do 54,8k znaków z reliktami starego lejka sprzecznymi z etap_gate (halucynacja <werdykt> tworzy leada legacy ścieżką); FAKTY OFERTY (ceny!) cache'owane do śmierci isolate'a — po edycji oferty część userów słyszy STARE warunki bez redeployu (przełączyć na promptCache TTL 5 min); switch_track nie czyści landing_html/brand/ustaleń — po pivocie bot sprzedaje stary sklep; limit 30 tur ucina negocjujących leadów bez sygnału domykania (podnieść do 50 w fazie współpracy + nota „domykaj" od 26. tury); padnięty raport = wieczna pętla „za ~2 min" (stemplować market_report_error); syntetyczne tury nie powinny bumpować turns/last_user_at.

### S4. Niezawodność pipeline'u generacji: pivot, locki, Manus, partial mockups, localStorage
Pivot produktu w trakcie generacji kończy się artefaktami STAREGO produktu w sesji nowego (genTaski zapisują bezwarunkowo — re-read chosen_product przed update + zerowanie gen_locks w reset_pipeline); lock TTL (300/360s) krótszy niż wall-clock 400s = podwójna generacja i nadpisania; cap re-triggerów Manus liczy tylko sukcesy — timeouty tworzą nielimitowane płatne taski; częściowe makiety (1-3/4) zapisują się jako trwały cache bez alertu i dopełnienia; clearLocalWorkspace kasuje spar_* zamiast bud_* — dane poprzedniego leada zostają na wspólnym komputerze.

### S5. Druga fala WOW artefaktów: raport z data-viz, lightbox reklam, reroll logo, „why" stylów
Raport — pierwszy dowód wartości — to ściana tekstu, choć cały CSS zegara potencjału i siatki kropek już jest na produkcji (martwy kod; wystarczy 2 pola w JSON bud-raport); kreacji reklamowych nie da się powiększyć (jedyny artefakt bez lightboxa — komponent showPickLightbox gotowy); logo bez opcji „narysuj 3 inne" (backend wspiera, capy są); style makiet bez 1 zdania „czemu ten pasuje do TWOJEGO klienta" (brief zostaje w backendzie); karta raportu w czacie bez teasera; proof-grid paywalla bez logo. Do kompletu P8 z backlogu: jednostronicowe „Warunki rezerwacji 500 zł" do zapisania/pokazania partnerowi.

### S6. Lżejsze bramki + ergonomia mobile: mniej pól, mniej mis-tapów
Produkt własny (najbardziej zmotywowany lead) wymaga pełnego konta PRZED jakimkolwiek dowodem — gotowy lżejszy renderLeadGate leży nieużywany; walidacja „≥2 słowa" odrzuca naturalne odpowiedzi samym imieniem; Google OAuth daje pełne imię, a strona bierze split[0] i każe wpisywać ręcznie; mail z rk-mail-card nie prefilluje bramki konta. Mobile: segmenty paska postępu 5px jako jedyna nawigacja (hitbox ::after), modal produktu 100vh→100dvh (CTA pod paskiem iOS), rsv-fab nachodzi na jump-btn (przypadkowe otwarcia paywalla), mikro tap targety 19-31px, opener siłowo cofający scroll przez 900 ms. Plus porządek w martwym kodzie bramek (nieosiągalny krok 3, nieaktualne komentarze o bramce przed raportem), zanim ktoś „naprawi" kod pod zły komentarz.

---
Surowe findingi (pełne, 10 perspektyw): tasks/w6o9lvkgk.output w scratchpadzie sesji Claude.

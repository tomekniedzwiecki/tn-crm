# PLAN: Szczypta Magii — /sklep (Zbuduję)

> **Data:** 2026-07-08 · **Cel:** podnieść ekscytację i skłonność do **impulsywnej** wpłaty rezerwacji 100 zł u osób marzących o biznesie online (AWE).
> **Metoda:** audyt 6 warstw lejka (6 równoległych agentów, 2026-07-08) + weryfikacja lokalizacji w źródle.
> **Status:** mapa wdrożeń. Fundament (nadrzędna misja) WDROŻONY w bud-chat 2026-07-08 — patrz §0.5; pozostałe fazy (QW/SL/EM/RS) czekają na decyzję.
> **SSOT nadrzędny:** [`LEJEK-V2-PLAN.md`](./LEJEK-V2-PLAN.md) — guardraile poniżej są twarde.
> **Pliki kluczowe:** front czatu `tomekniedzwiecki.pl/sklep/index.html` · landing `tomekniedzwiecki.pl/zbuduje/index.html` · edge `tn-crm/supabase/functions/bud-*` · checkout success `tn-crm/checkout/success.html`.

---

## 0. Guardraile Lejka V2 — NIE łamać

- **[V2.1, 2026-07-10; obniżka 2026-07-21] CENA BUDOWY JAWNA: 4900 zł (wcześniej 9400), jedna i stała** (100 zł zwrotne wliczone), podawana proaktywnie w turze domknięcia z kotwicą wartości (u agencji 25–40 tys./rok). Zero symulacji zysków.
- **Zero „10% / udziału %" w rozmowie** → „udział ustalany indywidualnie po rezerwacji".
- **Zero kwalifikacji przed sklepem** (budżet, czas, doświadczenie, etat, „czego się boisz"). Pytania przedrezerwacyjne = tylko personalizacja (produkt/marka/styl).
- **[V2.1] Budżet reklamowy WYŁĄCZNIE reaktywnie:** „~1000 zł łącznie na start, skalujemy z dochodów". Karta „kwoty inwestycji" i bramka 2000 zł WYCOFANE. Nie rozbijać kwoty usera na towar/reklamy. Raty reaktywnie (formy ustala Tomek po rezerwacji).
- **Bez downsellu / zamrażania projektu.**
- **Dowód społeczny wyłącznie agregatowy** — NIGDY nazwane cudze sklepy.
- **Pilność zawsze uczciwa** — żadnych fałszywych liczników ani wymyślonych pozycji w kolejce.

Wszystkie pozycje w tym planie są zgodne z powyższym.

---

## 0.5 Nadrzędna misja — gwiazda polarna (WDROŻONE 2026-07-08)

Definicja celu, którą bud-chat dostaje w **każdej turze sprzedażowej** jako **pierwszy, nadrzędny blok** system promptu. Implementacja: stała `MISSION` w `bud-chat/index.ts` (obok `NARRATIVE_WEAVE`), wstrzykiwana przez `missionTurn` NAD bazowym promptem w obu miejscach budowy system message (główna tura + tura ze `steer`); bramka `_isPostPay` (nie w trybie know-how po płatności). Deployed `--no-verify-jwt`. Powód: bazowy prompt (`# ROLA I CEL` w settings `budowanie_sparing_prompt`) definiował cel wąsko („doprowadź do konkretu produktowego / czy się sprzeda") — misja ustawia cel nadrzędnie i porządkuje ten rozjazd.

- **Cel:** doprowadzić osobę marzącą o biznesie online do stanu, w którym z ekscytacją i poczuciem bezpieczeństwa rezerwuje miejsce we WSPÓLNYM biznesie (zwrotna rezerwacja = miejsce w kolejce). Discovery/raport/ocena to NARZĘDZIA, nie cel.
- **Stan docelowy leada:** WŁASNOŚĆ („mój prototyp") · WIARA („sprzeda się i dam radę") · IMPULS („chcę teraz").
- **Prototyp, nie gotowy biznes:** to, co powstaje, to podgląd kierunku — nigdy „to już działa"; realny biznes powstaje PO rezerwacji, wspólną budową.
- **Model (zamienia prototyp w realny biznes):** ZBUDUJĘ pod klucz → WDROŻĘ i poprowadzę sprzedaż do ~1000 zamówień → PRZEKAŻĘ stery przy żywym sklepie → ZOSTAJĘ wspólnikiem-doradcą (zarabiam, gdy Ty zarabiasz). Rozbraja oba lęki: „nie ogarnę" i „scam".
- **Uczciwość = część magii:** ekscytacja z tego, co realne i szczere, nigdy z naciągania. Bez kwot/%/downsellu przed rezerwacją.

To fundament pod SL-A (kuj żelazo) i EM1 (nakarm marzenie) — bez niego dźwignie nie mają się o co zaczepić.

---

## 1. Diagnoza

Magia jest już w ~60-70% zbudowana w kodzie. Trzy rzeczy ją duszą:

1. **Dźwignie odłączone lub niekompletne** — gotowa maszyneria, której brakuje ostatniego elementu albo która jest martwa w obecnym picker-first flow.
2. **Emocjonalny szczyt odklejony od momentu decyzji** — prośba o rezerwację pada 2-3 tury po tym, jak user zobaczył swój sklep.
3. **Szczyt odklejony od momentu uwagi** — reveal sklepu dzieje się w osobnej zakładce, nie w rozmowie.

### 5 przekrojowych wzorców (każdy wskazany niezależnie przez ≥2 agentów — wysoka pewność)

| # | Wzorzec | Warstwy które to zgłosiły |
|---|---------|---------------------------|
| P1 | **Gotowe-ale-odłączone dźwignie** (prefill, `<blysk>`, confetti, licznik kolejki, domena RDAP, imię, recap `have[]`) | landing, chat, checkout, artefakty, mail |
| P2 | **Kuj żelazo póki gorące** — rezerwacja za późno, za bramkowana, w złym miejscu | chat, checkout, artefakty, mail |
| P3 | **Doliny czekania wypełnione pitchem zamiast teatrem tworzenia** (2 długie generacje, fejk-timer) | chat, artefakty |
| P4 | **„To MÓJ biznes" — personalizacja niewidoczna w pikselach** (imię/hasło/domena/wybór) | landing, chat, artefakty, mail |
| P5 | **Lęk scam nierozbrojony w punkcie decyzji + brak celebracji zwycięstwa** | checkout, chat, mail |

---

## 2. Priorytety wdrożenia

Kotwice **✓ zweryfikowane** = linia potwierdzona grepem 2026-07-08. **~** = z raportu agenta, potwierdzić przy wdrożeniu.

### FAZA 0 — Szybkie wygrane (koszt S, głównie podpięcie istniejącego kodu, niskie ryzyko)

| ID | Co | Dlaczego (psychologia AWE) | Gdzie | Koszt |
|----|----|----|----|----|
| **QW1** | **Input „co chcesz sprzedawać?" w hero landingu** → `goSklep({idea})`. Backend prefill jest KOMPLETNY: zapis `bud_prefill_idea` (zbuduje `✓l.1996`) + odczyt do inputu czatu (sklep `✓l.17664-17671`). Brakuje tylko pola. | Foot-in-the-door + self-relevance: klik staje się deklaracją, nie ciekawością. Rozmowa startuje o JEGO pomyśle. | `zbuduje/index.html` hero (dodać input) | **S** |
| **QW2** | **Zdegradować poboczne external-checkout w piku intencji.** Karta `mkCardEl` ma już inline BLIK jako przycisk główny (`✓l.14940`); usunąć/schować drugi link `href=checkoutURL() target=_blank` (`✓l.14966`) oraz w zakładce Współpraca (`✓l.11227`) i pjx-cta (`✓l.10562`). External tylko jako świadomy fallback „wolę kartę/przelew". | Każde wyjście z ciepłej rozmowy w piku intencji = re-trust + wyciek. Jedna ścieżka = mniej tarcia. | `sklep/index.html` | **S** |
| **QW3** | **Ceremonia po wpłacie na ścieżce inline BLIK.** `reservationConfirmed` (`✓l.7488`) dziś daje suchą kartę tekstową; confetti + animowany checkmark istnieją w `checkout/success.html` (`✓`). Przenieść mechanizm (self-contained, to inny deploy!) + zdanie dumy „Twój pierwszy dzień jako właściciel [Marka]" + miniatura ICH sklepu. | Duma > SLA. Dopamina domyka decyzję i tłumi żal zakupu. Najczęstsza ścieżka (inline) ma dziś najsłabszą celebrację. | `sklep/index.html` `reservationConfirmed` | **S/M** |
| **QW4** | **Rozbrajacz lęku w samym paywallu BLIK.** `showReservationPaywall` (`✓l.7610`) — dodać nad polem kodu 1 linijkę + mini-twarz Tomka: „100 zł wraca w 100%, jeśli nie wejdziecie. Zarabiam, dopiero gdy Ty zarabiasz." | Gwarancja jest wyeksponowana wszędzie POZA paywallem — czyli znika tam, gdzie lęk #1 (scam) kulminuje. | `sklep/index.html` `showReservationPaywall` | **S** |
| **QW5** | **Animowany „reel dorobku" nad BLIK.** Recap `have[]` w `mkCardEl` (`✓l.14919`) jest statyczny → 3-sek montaż 5 artefaktów wjeżdżających z ✓ „wszystko w 9 minut. Zaklep to." | Endowment + awersja do straty w punkcie płatności: „nie porzucę na wpół zbudowanego biznesu". | `sklep/index.html` `mkCardEl` | **S** |
| **QW6** | **Reserve-CTA (button) w mailach WOW.** 4 z 5 maili-odsłon nie ma CTA rezerwacji; `reserveUrl` już liczony (`~drip:463`). Wpiąć button do `reveal_strona` i `reveal_reklamy`. | Kuj żelazo w sekundzie „to naprawdę mój sklep" — nie każ szukać przycisku w panelu. | `bud-drip/index.ts` cele + `getRevealEmail` | **S** |
| **QW7** | **Uczciwa pilność z zębami — wszędzie.** „Kolejka" bez terminu jest abstrakcyjna. Statyczne, prawdziwe: „Najbliższy wolny start: ten tydzień" / „Trzymamy Twój prototyp 7 dni". | Powód, by nie odkładać, bez fejk-licznika (zgodne z guardrailami). | `sklep/index.html` (karta/paywall), `bud-drip` maile, `zbuduje/index.html` | **S/M** |
| **QW8** | **Wow pierwszych 30 s — karty produktu z „dowodem popytu".** Animowany licznik sprzedaży/mies., rosnąca ocena na kartach pickera. | Gasi lęk #1 (scam) od startu strumieniem realnych danych rynku. | `sklep/index.html` render pickera + `bud-products` | **S** |

### FAZA 1 — Dźwignie systemowe (koszt M, największy wpływ na „ekscytację + impuls")

**SL-A · Kuj żelazo póki gorące — zbliż rezerwację do momentu WOW.**
Dziś: reveal sklepu w osobnej zakładce (`~renderLandingBuild:12380`, `~withReveal:12420`), a `<zielone>` pada w dedykowanej turze PO szczycie (gate kolejności `~2060-2067`). Zmiana: (1) reveal materializuje się **w czacie** (mini-iframe z kaskadą + linia Tomka „Zobacz — Twój sklep właśnie stanął"), (2) `<zielone>` może paść w TEJ SAMEJ turze co entuzjazm usera („to jest to!"). Zachować „brak 100 zł przed zielonym", ale zielone niech pada szybciej. · Zależność: `genCardReadyInChat` (`~l.9283`). · **M**.

**SL-B · Teatr budowania na żywo — zamień doliny na szczyty.**
Dziś: 2 długie generacje (raport ~2 min, sklep ~3 min); kod wypełnia ciszę pitchem (QUALIFY_ENGAGE `~1961-1967`); timer budowy fejkowy (`BUILD_TOTAL_MS` odklejony od backendu, `~l.12362`). Zmiana: streamowana narracja TWORZENIA na REALNYM progresie backendu (lifestyle→spec→html) + twardy cut „ożyło" w chwili `landingHtml` (+ subtelny „ding"). Wzorzec SSE już istnieje w projekcie. · **M**.

**SL-C · „To jest MÓJ biznes" — personalizacja w pikselach.**
Dziś: `state.name` zbierane, niewidoczne w artefaktach; hasło trafia na hero ale bez „wydarzenia"; domena .pl sprawdzana RDAP-em na wolność, niezdramatyzowana. Zmiana: (1) overlay przy odsłonie „Aniu, tak wygląda Twój sklep" → morph do żywego sklepu; (2) atrapa przeglądarki „wpisuje" ich WOLNĄ domenę → „🔒 wolna — czeka na Ciebie" (`~sk-browser__url:12443`, domena z `bud-brand`); (3) dramatyzacja `<haslo>` jako wydarzenia („to, co napisałeś, jest teraz na hero Twojego sklepu"). · **M** (`bud-landing-gen` prompt `~l.42`, `bud-brand`, front reveal).

### FAZA 2 — Warstwa emocji (przekrojowa, S-M)

- **EM1 · Nakarm marzenie (bez kwot).** Na szczycie emocji, gdy sklep staje: „Wyobraź sobie — wchodzisz rano, a czeka pierwsze zamówienie od kogoś, kogo nie znasz." Dziś NARRATIVE_WEAVE słusznie tnie kwoty, ale nic nie zastępuje ich wizją. · `bud-chat` COLLAB przed `<zielone>` (`~2056-2063`). · **S**.
- **EM2 · Gwarantowany „błysk" na raporcie.** Revive `<blysk>` dla picker-first: jeden obowiązkowy, zaskakujący reframe zakotwiczony w REALNYCH opiniach z `ali_snapshot` (już wstrzyknięte, `~2098`). „Ludzie kupują to nie dla X, tylko Y — dlatego celujemy w…" · `bud-chat` blok „RAPORT GOTOWY" (`~l.2109`). · **M**.
- **EM3 · Guest-checkout — zdejmij login-wall przed płatnością.** Paywall pokazuje BLIK tylko `loggedIn`; anon → „Zaloguj się" w piku intencji (`~7641,7697`). Płatność po samym mailu (już mamy z leada); konto twórz PO wpłacie (`buy_reservation` ma email-fallback `~bud-project:198`). · **M**.
- **EM4 · Żywy status zamiast martwego czasu przy BLIK.** Poll co 2 s, „Bank potwierdza…" z twarzą Tomka, po sukcesie natychmiast ceremonia; timeout łagodny (auto-retry). Dziś 120 s → „nie zdążyłem" (`~buyReservationBlik:7736`). · **S**.

### FAZA 3 — Sekwencje ratunkowe (dowożą ~54% abandonów, S-M)

- **RS1 · Re-close zamiast pojedynczego strzału.** Dziś `reveal_rezerwacja` (h30) fire'uje RAZ, potem cisza aż do LOST (7 dni) — największy wyciek impulsu. Dodać domknięcia +48h/+5d z realną datą trzymania kolejki. · `bud-reveal-plan.ts` (nowe kroki) + pętla close w `bud-drip`. · **M**.
- **RS2 · Realny screenshot ŻYWEGO sklepu w mailu** (nie makieta-JPEG). Podmienić `chosenMock.url` na wysoki zrzut `landing_html` z overlay „zobacz na żywo". Widok WŁASNEGO sklepu = najsilniejszy anty-scam. · `artifactImagesHtml` gałąź `strona` (`~drip:156`). · **M**.
- **RS3 · Blok zaufania przy ofercie w mailu.** Agregatowy dowód („już kilkanaście osób buduje" — NIGDY nazwane sklepy), twarz/podpis Tomka, twarda gwarancja „100 zł wraca w 100%". · nowy `trustBlockHtml` (`~drip:165`). · **S/M**.
- **RS4 · Echo hasła/wyboru w mailu.** `<haslo>` + wybrany styl do `revealBrief.facts` + temat „»ich hasło« — tak brzmi Twój sklep". · `revealBrief` (`~drip:255`). · **S**.
- **RS5 · Powrót jednym kliknięciem → BLIK** (nie do panelu). Button na checkout z prefill (lead_id/sid/email już w `checkoutLink`). Zweryfikować domyślny BLIK. · **S/M**.
- **RS6 · [STRETCH] Prewarm raportu dla porzuconych.** Maszyneria istnieje (`~drip:546-569`): `market_report NOT NULL` przełącza abandonów w silnik odsłon → 54% dostaje loss-aversion na REALNYM artefakcie zamiast obietnic. · **L**.

---

## 3. Powiązanie z istniejącym backlogiem

Ten plan **nie duplikuje** wdrożonego (cały Lejek V2, TOP #1-5 audytu 2026-07-03, naprawiony BLIK). Pokrywa się i konkretyzuje niewdrożone:

- **Audyt 2026-07-03 #6** (InitiateCheckout do Meta/TikTok przy paywallu) — dorzucić przy QW2/QW4 (pomiar).
- **Audyt #7** (zbieranie e-maila w oknie generacji raportu) — warunek działania RS-* i RS6.
- **Audyt #8** (pierwszy kadr karuzeli: pełna karta + CTA + polska nazwa) — spokrewnione z QW8.
- **Audyt #10** (`reservation_rescue` porzucony BLIK + nurture zielonych bez wpłaty) — pokrywa RS1/RS5.
- **LEJEK-V2 poz. 7** (copy drip/followups pod V2, bez kwot/%) — wykonać przy QW6/RS3/RS4.
- **S5 „druga fala WOW"** — realizują SL-C, EM2, RS2.
- **P8 warunki-PDF** (jednostronicowe „Warunki rezerwacji 100 zł") — wspiera QW4 (rozbrajacz może linkować do PDF).

---

## 4. Pułapki / czego pilnować przy wdrożeniu

- **`success.html` (confetti) jest w `tn-crm`, inline BLIK w `tomekniedzwiecki.pl/sklep`** — to osobne deploye. Confetti przepisać jako self-contained (zero zewn. skryptów), nie importować.
- **Nie ruszać reasoning/logiki płatności TPAY** przy QW2-QW5 (MD5 opcjonalna, sekrety bez zmian).
- **Prefill (QW1) już konsumowany** — nie budować drugiej ścieżki; tylko dodać pole input i podpiąć `goSklep({idea})`.
- **Deploy landingu i frontu /sklep = przez właściwą ścieżkę** (patrz pamięć: tomekniedzwiecki.pl przez git push main, weryfikacja curl na custom domenie; „POKAŻ przed deployem").
- **Każdą kotwicę `~` potwierdzić grepem** przed edycją (numery linii się przesuwają).

---

## 5. Rekomendowana kolejność

**Faza 0 (QW2 → QW3 → QW4 → QW1 → QW5 → QW6/QW7 → QW8)** — najwyższy ROI, najniższe ryzyko, głównie podpięcie istniejącego kodu.
Potem **SL-A** (kuj żelazo) jako pojedyncza największa dźwignia systemowa, dalej **SL-B/SL-C**, warstwa emocji i sekwencje ratunkowe.

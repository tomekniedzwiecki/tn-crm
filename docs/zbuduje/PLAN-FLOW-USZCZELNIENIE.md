# PLAN — uszczelnienie flow /sklep + redesign danych produktu (2026-06-27)

> Źródło: live walkthrough całego lejka (świeża sesja squishy→CiociaFun) + audyt kodu.
> Cel: lejek ma TWARDO prowadzić usera ścieżką, a jak się zgubi — wracać. Plus redesign
> słabych miejsc (karta danych produktu, „Wybrany produkt") w stylu Vercel/Geist.

## ✅ ZROBIONE (ten przebieg)
- **FIX1** — karty generowania w czacie (raport/makiety) utykały na „już kończę…" mimo gotowych
  danych. Przyczyna: poller (`_doReport`/`_doMockup4`) ma guard `!state.x`, a dane przychodzą
  też sync'iem sesji (`action:'get'`) → poller się zatrzymuje, nie woła `markRaportReadyInChat`.
  Naprawione: `reconcileGenCards()` woła `updateSideBadges` na każdej turze/sync → flip raz, gdy dane są.
- **FIX2** — `bud-mockup` przy 3/4 (1 obraz padł) blokował front na ~6 min (cache wymagał ≥4,
  lock TTL 360s). Naprawione: cache oddaje cząstkowe ≥3 + zwalnia lock przy partialu.

---

## ŚCIEŻKA KANONICZNA (wg Tomka) — docelowy przebieg
1. **Wybór produktu** (karuzela).
2. **Generowanie raportu** (~2 min) — i RÓWNOLEGLE podczas tego:
3. **Ustalenia + LOGO** (rozmowa w „martwym czasie" raportu). Logo może iść PIERWSZE (jest ważniejsze);
   ten etap ma się **domknąć RAZEM z raportem**. Czyli: nazwa marki + domeny .pl + 3 logo + ustalenia
   (dla kogo/kąt/ton) zbierane są, gdy raport się liczy.
4. Na bazie **raportu + ustaleń** → **makiety + reklamy** (równolegle).
5. Po generowaniu + **ewentualnych poprawkach usera (MAX 2 ŁĄCZNIE)** → **sklep**.
6. Po sklepie → **cały fokus na współpracy + rezerwacja 500 zł** (rozmowa z Tomkiem).

### REORDER vs stan obecny
- DZIŚ: wybór → kontakt → raport → ustalenia (PO raporcie) → makiety (na `<ustalenia>`) → styl → reklamy → sklep → projekt.
- CEL: ustalenia + logo PODCZAS raportu (martwy czas); makiety+reklamy po raporcie+ustaleniach; max 2 poprawki globalnie; potem współpraca.

---

## LEAKI ZNALEZIONE (do uszczelnienia)

### L1. Start konwersacyjny pomija karuzelę  [HIGH]
- Karuzela renderuje się TYLKO po kliknięciu „ZACZYNAMY" (`renderStartButton` → `renderChips`).
- Gdy user pisze najpierw (np. „no co tam"), AI gada o karuzeli/„Rozważam"/„Porównaj", ale karuzeli NIE MA,
  a potem „nie pokazuje produktów" — user utknął bez produktów.
- FIX: gdy user wyśle 1. wiadomość w świeżej sesji (brak produktu, brak `vp-picker`) → automatycznie odpal
  `renderChips()` (pokaż karuzelę). „Nie od razu na wejściu" zostaje (pokazuje się po 1. zaangażowaniu).
  Dodatkowo mózg (opener) NIE ma odsyłać do „Porównaj/Rozważam", jeśli karuzela nie jest jeszcze widoczna.

### L2. Gen-card flip (raport/makiety)  — ✅ naprawione (FIX1)

### L3. bud-mockup partial 3/4 → 6 min stall — ✅ naprawione (FIX2)

### L4. Ustalenia + logo NIE biegną podczas raportu  [HIGH]
- Dziś ustalenia startują PO raporcie; logo dopiero po ustaleniach; raport „martwy czas" niewykorzystany.
- FIX (brain + front): podczas generowania raportu prowadź rozmowę: NAJPIERW nazwa marki (5 nazw z wolną
  .pl) → 3 logo → potem dopnij ustalenia (dla kogo/kąt/ton). Domknij to mniej-więcej, gdy raport gotowy.
  `<ustalenia>` (start makiet/reklam) wystaw DOPIERO gdy raport JEST gotowy ORAZ ustalenia domknięte.

### L5. Brak „strażnika ścieżki"  [HIGH]
- Nic nie pilnuje, że user idzie ścieżką; jak zboczy (typed-first, pominięty wybór stylu, brak reakcji
  po sklepie), nic go nie zawraca.
- FIX: lekki **path-guard** (stan lejka liczony z `state`): `stage = pick→report→ustalenia→makiety→ads→sklep→wspolpraca`.
  Po każdej turze/sync guard: (a) sprawdza, czy widoczne jest to, co dla danego etapu (karuzela / bramka kontaktu /
  picker stylu / karta projektu), (b) jeśli czegoś brak — dorzuca to (np. baner „wybierz styl, żeby ruszyć dalej",
  karuzela, CTA rezerwacji), (c) mózg dostaje 1 zdanie kontekstu „[ETAP=X — nakieruj usera na Y]".
- Najtaniej: rozszerzyć obecny `reconcileGenCards`/`updateBudNav` o reguły etapowe + wstrzyknięcie statusu etapu
  do bud-chat (jak już robimy z kontakt/kolejność/zwięzłość).

### L6. „Max 2 poprawki łącznie" nie egzekwowane  [MED]
- FIX: globalny licznik poprawek (`state.editsUsed`, już istnieje dla werdyktu) — limit 2 na makiety+reklamy+sklep
  RAZEM. Po 2 poprawkach mózg miękko domyka: „dopniemy resztę wspólnie z Tomkiem po rezerwacji". Front blokuje
  dalsze re-gen, kieruje do współpracy.

### L7. Po sklepie fokus rozjeżdża się  [MED — częściowo zrobione]
- Karta „Projekt zdefiniowany" + CTA „Zobacz jak budujemy" już jest (E). Domknąć: po sklepie mózg trzyma
  JEDEN temat (współpraca/rezerwacja), nie wraca do produktu/raportu, chyba że user wprost prosi.

---

## REDESIGN — SŁABE WIZUALNIE MIEJSCA (styl Vercel/Geist + skille)

### R1. Karta danych produktu (modal G) — dane + redesign  [HIGH]
**Dane (problem):** `ali_snapshot` ma tylko 1 zdjęcie (`source:"have"`) — RapidAPI `aliexpress-true-api`
(detail + search) PADŁO (zwróciło null), został tylko cover. Opinie DZIAŁAJĄ (11 szt., osobne źródło
`feedback.aliexpress.com`). Czyli „brak zdjęć z Ali" = niezawodność RapidAPI, nie błąd renderu.
- Działania danych:
  - Zdiagnozować `BUD_ALIEXPRESS_RAPIDAPI_KEY` (klucz/quota/host) — czy 401/403/429/empty.
  - Fallback galerii: gdy RapidAPI puste, pociągnąć zdjęcia z opinii (mamy je) + ewentualnie z
    `feedback.aliexpress.com` (description images) + zdjęcia produktu z mockup-snapshotu. Min. 3-6 zdjęć.
  - Rozważyć drugie źródło zdjęć (inny RapidAPI endpoint / scrape OG image strony produktu).
- Redesign modala (styl Vercel/Geist — czarne, 1px bordery, mono akcenty, gęsto ale czytelnie):
  użyć skilla **brand-design-md** (styl „Vercel/Geist") + **ui-ux-pro-max** (data-dense dashboard).
  Sekcje: hero (cover/video TikToka + nazwa + viral-badge), pasek metryk TikTok, galeria Ali (scroll),
  oceny + warianty + specy, ściana opinii z `text_pl` + zdjęcia. Spójne z resztą panelu.

### R2. „Wybrany produkt" (sidebar) — restyle  [MED]
- Dopracować stylowanie karty w menu (miniatura, nazwa, kategoria, metryki, „viral z N dni", CTA).
- Użyć skilla brand-design-md (Vercel/Geist) — spójne 1px bordery, mono liczby, czysty hover.

---

## A — JAKOŚĆ LANDINGU vs MAKIETA (image-2.0 lepsza niż HTML)  [HIGH, R&D]
**Pytanie Tomka:** czy na pewno gpt-5.5? co poprawić, by HTML był bliżej makiety?
- Potwierdzić model: `bud-landing-gen` domyślnie `gpt-5.5` (`BUD_LANDING_MODEL || 'gpt-5.5'`) — zweryfikować,
  czy sekret `BUD_LANDING_MODEL` nie nadpisuje na słabszy; sprawdzić `reasoning`/`max_output_tokens`.
- Fundament problemu: gpt-image-2 robi piękny RASTER; przełożenie 1:1 na HTML jest trudne dla każdego LLM.
- Kierunki poprawy (do przetestowania, od najtańszych):
  1. **Dwustopniowo: ekstrakcja spec z makiety** — osobny vision-call zwraca TWARDY JSON
     {paleta hex[], fonty, układ sekcji w kolejności, odstępy, motywy} → potem HTML z tej spec + obraz.
     To deterministycznie zbliża paletę/typografię/układ (mocniejsze niż „odwzoruj 1:1" prozą — już wstrzykujemy brief,
     ale spec z OBRAZU jest pełniejsza).
  2. **Pętla iteracyjna**: HTML → screenshot (headless) → vision porównanie z makietą → 1 runda poprawek.
  3. **Lepsze assety**: generować hero/dekory pod makietę (polaroidy, badge) zamiast liczyć, że CSS odda raster.
  4. **Mocniejszy model na sam HTML** (jeśli dostępny lepszy od 5.5) — porównać jakość/koszt.
  5. **Podnieść `max_output_tokens`** (32k) jeśli HTML bywa ucinany.

---

## SEKWENCJA WDROŻENIA (fazy)
- **Faza 0** (✅): FIX1 + FIX2.
- **Faza 1 — uszczelnienie ścieżki**: L1 (karuzela na 1. wiadomości) + L5 (path-guard) + L4 (ustalenia+logo podczas raportu)
  + L6 (max 2 poprawki) + L7 (fokus po sklepie). Brain (settings) + front + redeploy bud-chat.
- **Faza 2 — redesign**: R1 (dane Ali + modal G, skille) + R2 („Wybrany produkt").
- **Faza 3 — jakość A**: diagnoza modelu + spec-extraction/iteracja (eksperyment, mierzyć efekt).

## RYZYKA / UWAGI
- Reorder (ustalenia+logo podczas raportu) zmienia mózg `budowanie_etap_gate` + front trigger `<ustalenia>` —
  testować, by makiety nie ruszały przed gotowym raportem.
- RapidAPI Ali: jeśli klucz/quota padł — to koszt/konfiguracja, nie kod; ustalić z Tomkiem.
- Styl Vercel/Geist: trzymać spójność z istniejącym panelem (nie rozjechać dwóch estetyk).

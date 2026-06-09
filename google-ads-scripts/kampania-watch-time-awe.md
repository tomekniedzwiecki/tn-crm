# Kampania: Watch Time → „Budowniczy biznesu online" (AWE)

**Cel główny:** jak najdłuższe oglądanie Twojego wideo przez osoby zainteresowane budową biznesu internetowego.
**Cel wtórny:** subskrypcje kanału (earned — przyjdą organicznie od widzów) + ruch na `tomekniedzwiecki.pl/zbuduje`.
**Typ:** Video → **Video views** (optymalizacja pod oglądalność), stawka **Maximum CPV** (płacisz za obejrzenie, nie za wyświetlenie).

> ⚠ Dlaczego UI, nie plik: Google Ads Editor tworzy kampanie wideo, ale **custom audience, demografię i CTA ustawia się wyłącznie w interfejsie** (oficjalne ograniczenie). Editor nic tu nie przyspiesza. Najszybsza realna droga = UI z tym gotowcem. Najbardziej pracochłonny element (custom segment) masz w `custom-segment-awe.txt` do wklejenia hurtem.

---

## ⓿ ZANIM zaczniesz (jednorazowo, bez tego kampania nie ruszy poprawnie)
- **Konto Google Ads** z billingiem (waluta PLN, **timezone Europe/Warsaw — niezmienne**).
- **Połącz kanał YouTube z Google Ads** (Narzędzia → Połączone konta → YouTube) + uprawnienie **Engagement** + personalized ads **ON**. Bez tego: brak raportu earned subscribers i brak budowania segmentu widzów.

---

## ① USTAWIENIA KAMPANII (Nowa kampania → bez celu → **Wideo** → **Wyświetlenia wideo**)

| Pole | Wartość |
|---|---|
| Nazwa kampanii | `Video Views — Biznes online (AWE)` |
| Podtyp | Wyświetlenia wideo (Video views) |
| Stawki | **Maksymalny CPV** (na start ręczny, ~`0,15 zł` — kalibruj po 7 dniach) |
| Budżet dzienny | `50 zł` (test; podnieś gdy CPV i view rate będą OK) |
| Sieci | YouTube — filmy (in-stream + in-feed). **Odznacz** „Partnerzy wideo Google" na start |
| Lokalizacje | **Polska** (Ustawienia → Lokalizacje → „Obecność: osoby w tej lokalizacji") |
| Języki | **Polski** |
| Urządzenia | wszystkie (mobile będzie dominować) |
| Daty | start dziś, bez daty końca |
| Wykluczenia treści | Standardowy inventory + wyklucz tematy wrażliwe (Tragedie, Treści dla dorosłych) |

---

## ② CUSTOM SEGMENT — „zainteresowani biznesem online"

**To jest serce targetingu.** Twórz raz, używaj w każdej kampanii.

1. Narzędzia → Menedżer odbiorców → **Segmenty niestandardowe** → „+".
2. Nazwa: `Budowa biznesu online — AWE`.
3. Opcja: **„Osoby, które wyszukiwały dowolne z tych haseł"** (intent) → wklej całą listę z pliku [`custom-segment-awe.txt`](custom-segment-awe.txt) (sekcja HASŁA).
4. (Opcjonalnie) Dodaj **URL-e** — sekcja URL z tego samego pliku (strony/kanały, które ogląda Twoja persona). Uzupełnij konkretnymi konkurentami.
5. Zapisz.

---

## ③ GRUPA REKLAM + TARGETING

| Pole | Wartość |
|---|---|
| Nazwa grupy | `Intent — biznes online` |
| **Odbiorcy** | Dodaj segment `Budowa biznesu online — AWE` **+** segmenty In-market: `Usługi biznesowe`, `Oprogramowanie dla firm`, `Zatrudnienie`, `Kursy online` |
| Tryb odbiorców | **Targetowanie** (nie obserwacja — chcemy zawęzić do tej grupy) |
| Demografia | Wiek **25–34 i 35–44** (rdzeń AWE; 45–54 możesz dodać obserwacyjnie). Płeć: wszystkie |
| Wykluczenia | (gdy zbudujesz listę) wyklucz **obecnych subskrybentów** — żeby nie palić budżetu na już pozyskanych |
| Stawka CPV grupy | `0,15 zł` |

---

## ④ REKLAMA WIDEO (format: **Pomijalna in-stream**)

| Pole | Wartość |
|---|---|
| Film z YouTube | `WKLEJ_URL_SWOJEGO_FILMU` (najlepiej dłuższy materiał z mocnym hookiem w pierwszych 5 s — in-stream pozwala długie oglądanie) |
| Końcowy URL (Final URL) | `https://tomekniedzwiecki.pl/zbuduje` *(oferta dla tej persony; reklamy kierujemy na /zbuduje)* |
| Wyświetlany URL | `tomekniedzwiecki.pl` |
| Nagłówek (≤15 znaków) | `Zbuduj biznes` |
| Wezwanie CTA (≤10 znaków) | `Sprawdź` |
| Baner towarzyszący | auto (z kanału) |
| Nazwa reklamy | `Hook — biznes online v1` |

> **Subskrypcje vs strona** — domyślnie kierujemy na `/zbuduje` (realna konwersja), a subskrypcje zbieramy jako *earned* (widz obejrzy → subskrybuje z kanału). Jeśli chcesz, by CTA **bezpośrednio** zbierał subskrypcje, zmień Final URL na `https://www.youtube.com/@TWOJ_KANAL?sub_confirmation=1` i CTA na `Subskrybuj` — ale to odciąga od watch time. Rekomendacja: zostaw `/zbuduje`.

---

## ⑤ PO STARCIE — co mierzyć (i co zrobi za Ciebie panel)
- **Główne KPI:** view rate (cel **>26–32%**), CPV, **completion p100** (czy dooglądają).
- Po 7 dniach silnik (`gads-recommend`) sam podpowie: zbyt wysoki CPV → obniż stawkę; niski view rate → wymień hook; niski p100 → skróć film/mocniejsze otwarcie.
- Subskrypcje (total) zobaczysz z YouTube Analytics; earned subscribers — w UI Google Ads (kolumny wideo).

---

## Krok po kroku (kolejność klikania)
1. Połącz kanał YouTube (⓿).
2. Menedżer odbiorców → custom segment z `custom-segment-awe.txt` (②).
3. Nowa kampania → Wideo → Wyświetlenia wideo → ustawienia z (①).
4. Grupa reklam + odbiorcy + demografia z (③).
5. Reklama in-stream z (④) — wklej swój film + Final URL.
6. Opublikuj. Po 7 dniach wracamy do optymalizacji.

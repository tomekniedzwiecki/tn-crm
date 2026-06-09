# Instrukcja dla agenta (Claude cowork) — założenie kampanii Google Ads

Skopiuj całość poniżej i przekaż agentowi przeglądarkowemu, mając **otwarte i zalogowane konto Google Ads** na właściwym koncie marki.

---

## ROLA I CEL
Jesteś agentem konfigurującym kampanię reklamową w panelu **Google Ads** (operujesz w przeglądarce). Twoim zadaniem jest **przygotować, ale NIE opublikować** kampanii wideo typu **Wyświetlenia wideo (Video views)**, nastawionej na jak najdłuższe oglądanie filmu przez osoby zainteresowane budową biznesu internetowego. Po skonfigurowaniu wszystkiego zatrzymujesz się na ekranie podsumowania i czekasz na decyzję człowieka.

## ZASADY BEZWZGLĘDNE (przeczytaj najpierw)
1. **NIE klikaj „Opublikuj"/„Publish"/„Uruchom kampanię".** Doprowadź do ekranu przeglądu i **ZATRZYMAJ SIĘ** — to ostatni krok należy do człowieka (kampania wydaje realne pieniądze).
2. **Nie dodawaj ani nie zmieniaj metody płatności.** Jeśli konto poprosi o billing/kartę → **STOP**, napisz: „Konto wymaga metody płatności — potrzebuję działania właściciela".
3. **Nie zgaduj URL filmu.** Jeśli nie masz podanego linku do filmu na YouTube → **STOP** i poproś o niego.
4. Po **każdej sekcji** napisz krótko co ustawiłeś i poproś o potwierdzenie zanim przejdziesz dalej („Sekcja X gotowa: …, idę dalej?").
5. Jeśli interfejs wygląda inaczej niż w tej instrukcji (Google zmienia UI) — **opisz co widzisz na ekranie i zapytaj**, nie improwizuj na oślep.
6. Nazwy przycisków podaję po polsku (UI bywa po angielsku — w nawiasie wersja EN).

## DANE OD CZŁOWIEKA (uzupełnij przed startem)
- **URL filmu YouTube:** `__________________` (wymagane do sekcji 4; jeśli puste → STOP w sekcji 4)
- **Końcowy URL strony:** `https://tomekniedzwiecki.pl/zbuduje`
- **Budżet dzienny:** `50 zł` · **Maks. CPV:** `0,15 zł`

---

## KROK 0 — Sprawdzenie wstępne
1. Upewnij się, że jesteś na właściwym koncie (góra po prawej — nazwa/ID konta). Jeśli kont jest kilka, zapytaj które.
2. Sprawdź, czy **kanał YouTube jest połączony**: Narzędzia (Tools) → Połączone konta (Linked accounts) → YouTube. 
   - Jeśli **nie ma połączonego kanału** → napisz: „Kanał YouTube nie jest połączony — to wymaga potwierdzenia w YouTube Studio przez właściciela. Mam kontynuować bez tego?" i **czekaj** (bez połączenia nie będzie raportu subskrypcji, ale kampania ruszy).

## KROK 1 — Nowa kampania, typ i podtyp
1. Kliknij **Kampanie** (Campaigns) w menu po lewej → niebieski **„+"** → **Nowa kampania** (New campaign).
2. Wybierz **„Utwórz kampanię bez wskazówek dotyczących celu"** (Create a campaign without a goal's guidance).
3. Typ kampanii: **Wideo** (Video).
4. Podtyp: **Wyświetlenia wideo** (Video views).
   - Jeśli tego podtypu tu nie ma, cofnij się i wybierz cel **„Świadomość i zainteresowanie"** (Awareness and consideration) / „YouTube reach, views, and engagements", a potem Wideo → Wyświetlenia wideo.
5. Kliknij **Dalej** (Continue).
6. **Potwierdź ze mną:** „Wybrałem Wideo → Wyświetlenia wideo, idę dalej?"

## KROK 2 — Ustawienia kampanii
Ustaw kolejno:
- **Nazwa kampanii:** `Video Views — Biznes online (AWE)`
- **Strategia ustalania stawek:** Maksymalny CPV (Maximum CPV) → wpisz `0,15`
- **Budżet:** typ „dzienny" (Daily) → `50` zł
- **Sieci:** zostaw **YouTube** (filmy). **Odznacz „Partnerzy wideo Google"** (Video partners), jeśli zaznaczone.
- **Lokalizacje:** wybierz **Polska**. Wejdź w opcje lokalizacji i ustaw **„Obecność: osoby w wybranych lokalizacjach"** (Presence: People in your targeted locations).
- **Języki:** **Polski** (Polish).
- **Daty:** start dziś, bez daty zakończenia.
- (Jeśli jest sekcja wykluczeń treści) ustaw inwentarz **Standardowy** (Standard).
- **Potwierdź ze mną** ustawienia i przejdź do grupy reklam.

## KROK 3 — Custom segment + grupa reklam (targeting)
**3a. Grupa reklam:**
- Nazwa grupy reklam: `Intent — biznes online`

**3b. Odbiorcy — utwórz segment niestandardowy:**
1. W sekcji **Odbiorcy** (Audience segments) kliknij **Przeglądaj** (Browse) → poszukaj opcji **„+ Nowy segment niestandardowy"** (New custom segment). Jeśli jej tu nie ma, otwórz w nowej karcie Narzędzia → Menedżer odbiorców (Audience Manager) → Segmenty niestandardowe → „+", utwórz segment, wróć i go dodaj.
2. Nazwa segmentu: `Budowa biznesu online — AWE`
3. Wybierz opcję **„Osoby, które wyszukiwały dowolne z tych haseł"** (People who searched for any of these terms).
4. Wklej poniższe hasła (jedno na linię):
```
budowa biznesu online
biznes online
własny biznes
jak założyć firmę
jak założyć sklep internetowy
sklep internetowy
e-commerce
dropshipping
sprzedaż na allegro
sprzedaż w internecie
zarabianie w internecie
zarabianie online
dodatkowy dochód
pasywny dochód
rzucić etat
własna firma od zera
pomysł na biznes
biznes od zera
side hustle
marketing internetowy
kurs e-commerce
kurs biznesowy
automatyzacja biznesu
skalowanie biznesu
przedsiębiorczość
startup
shopify sklep
allegro sprzedaż
dropshipping kurs
jak zarabiać w internecie
niezależność finansowa
wolność finansowa
etat czy biznes
własny sklep online
biznes z domu
```
5. Zapisz segment i **dodaj go do grupy reklam**.

**3c. Dodatkowe segmenty In-market (jeśli dostępne wyszukaj i dodaj):**
- `Usługi biznesowe`, `Oprogramowanie dla firm`, `Zatrudnienie`, `Kursy online`.

**3d. Tryb odbiorców:** ustaw **Targetowanie** (Targeting), nie obserwacja.

**3e. Demografia:** wiek → zaznacz **25–34** i **35–44** (odznacz pozostałe). Płeć: wszystkie. Rodzicielstwo/dochód: wszystkie.

- **Potwierdź ze mną** targeting i przejdź do reklamy.

## KROK 4 — Reklama wideo (in-stream)
1. **Film z YouTube:** wklej podany URL filmu. **Jeśli URL pusty → STOP** i poproś o link.
2. Format: **Pomijalna reklama in-stream** (Skippable in-stream).
3. **Końcowy URL (Final URL):** `https://tomekniedzwiecki.pl/zbuduje`
4. **Wyświetlany URL:** `tomekniedzwiecki.pl`
5. **Nagłówek (Headline, ≤15 znaków):** `Zbuduj biznes`
6. **Wezwanie do działania (CTA, ≤10 znaków):** `Sprawdź`
7. **Nazwa reklamy:** `Hook — biznes online v1`
8. Baner towarzyszący — zostaw automatyczny.
- **Potwierdź ze mną** reklamę.

## KROK 5 — Przegląd i STOP
1. Przejdź do **Przeglądu/Podsumowania** (Review/Summary).
2. **NIE PUBLIKUJ.** Zrób zrzut/zapisz podsumowanie i napisz do człowieka:
   > „Kampania skonfigurowana i gotowa: Wyświetlenia wideo, budżet 50 zł/dzień, Max CPV 0,15 zł, targeting custom segment + in-market, demografia 25–44, reklama in-stream z filmem i CTA na /zbuduje. **Nie publikowałem.** Potwierdź, czy mam kliknąć »Opublikuj«, czy chcesz coś zmienić."
3. Czekaj na wyraźne „publikuj".

---

## Gdyby coś poszło nie tak
- **Brak metody płatności** → STOP, zgłoś właścicielowi.
- **Podtyp „Wyświetlenia wideo" niedostępny** → użyj celu „Świadomość i zainteresowanie" (Krok 1.4) i spróbuj ponownie; jeśli dalej brak — opisz dostępne opcje i zapytaj.
- **Nie można utworzyć segmentu niestandardowego inline** → zrób go w Menedżerze odbiorców (Krok 3b, wariant w nowej karcie), potem wróć i dodaj.
- **Pole nagłówka/CTA odrzuca tekst (za długie)** → skróć: nagłówek `Zbuduj biznes`, CTA `Sprawdź`; jeśli dalej za długie, zgłoś limit znaków i zaproponuj krótszy wariant.

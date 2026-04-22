# Cowork Prompt — Raport Etap 1 (Deep Research + NotebookLM)

Prompt do wklejenia w Claude Cowork (browser agent). Tworzy 4 artefakty w `workflow_reports`: PDF raport główny, Briefing Doc, Infografika, Video Overview.

## Jak uruchomić

1. Otwórz Claude Cowork w przeglądarce.
2. Upewnij się, że w tej samej przeglądarce (ten sam profil Chrome) jesteś zalogowany:
   - Google (Gemini, Docs, NotebookLM) — jedno konto
   - `crm.tomekniedzwiecki.pl` — jako admin
3. Wklej poniższy prompt, zamień `__WORKFLOW_ID__` na UUID workflow z adresu `https://crm.tomekniedzwiecki.pl/tn-workflow/workflow.html?id=<TU>`.
4. Uruchom. Spodziewany czas: 20–40 min (głównie Deep Research + generowanie NotebookLM).

---

## PROMPT — kopiuj od linii poniżej do końca pliku

```
Jesteś Claude Cowork. Wykonaj od początku do końca automatyzację generowania raportu dla Etapu 1 w systemie tn-workflow. Działaj spokojnie, cierpliwie, nie spiesz się. Deep Research trwa 5–15 minut — po prostu czekaj, nie rób w tym czasie nic innego poza sprawdzaniem co minutę czy jest gotowy. Nie otwieraj nowych zakładek ani stron poza tymi wymienionymi w krokach.

## PARAMETRY

WORKFLOW_ID = __WORKFLOW_ID__
CRM_BASE = https://crm.tomekniedzwiecki.pl
WORKFLOW_URL = {CRM_BASE}/tn-workflow/workflow.html?id={WORKFLOW_ID}

## PRZED STARTEM — weryfikacja środowiska

Otwórz w osobnych zakładkach:
1. {WORKFLOW_URL}
2. https://gemini.google.com/app
3. https://notebooklm.google.com/

Sprawdź, że w każdej z tych zakładek jesteś zalogowany. Jeśli któraś wymaga logowania — ZATRZYMAJ się i poproś użytkownika o zalogowanie, nie próbuj sam wprowadzać hasła.

## KROK 1 — Pobierz dane workflow z CRM

1. Przejdź do zakładki {WORKFLOW_URL}.
2. Poczekaj aż strona się załaduje (zobaczysz imię klienta i zakładki: Przegląd, Produkty, Branding, Raporty, Umowa, Strona).
3. Z nagłówka/przeglądu zanotuj w pamięci:
   - `CUSTOMER_NAME` — imię i nazwisko klienta (np. "Jan Kowalski")
   - `OFFER_NAME` — nazwa oferty/produktu
   - `OFFER_URL` — URL produktu jeśli widoczny
4. Przejdź do zakładki "Produkty".
5. Znajdź aktywny/wybrany produkt (ten z oznaczeniem "Wybrany" lub odznaczonego checkboxa). Otwórz go.
6. Pobierz zdjęcie produktu:
   - Kliknij prawym na zdjęciu produktu → "Zapisz obraz jako..." → zapisz do Downloads jako `produkt-{OFFER_NAME}.png` (usuń polskie znaki z nazwy pliku, zamień spacje na myślniki).
   - Zanotuj `PRODUCT_IMAGE_PATH` = ścieżka do zapisanego pliku.
7. Przejdź do zakładki "Branding". Jeśli jest już wpisana nazwa marki (`brand_info`), zanotuj `BRAND_NAME`. Jeśli nie ma — `BRAND_NAME` = `OFFER_NAME`.

Stop-check: jeśli nie udało się pobrać zdjęcia produktu — zgłoś problem użytkownikowi i ZATRZYMAJ. Bez zdjęcia nie ma sensu uruchamiać Deep Research.

## KROK 2 — Gemini Deep Research

1. Przejdź do zakładki https://gemini.google.com/app.
2. Rozpocznij nową konwersację (przycisk "+ Nowy czat" lub "New chat").
3. Wybierz model "Deep Research" z przełącznika modeli u góry/z menu (w 2026-04 dostępny jako tryb w głównym inputcie albo jako osobna opcja w bocznym panelu — znajdź ją).
4. Kliknij przycisk załącznika (spinacz) OBOK pola promptu.
5. Wybierz `PRODUCT_IMAGE_PATH` z Downloads. Poczekaj aż plik się załaduje (pojawi się miniaturka pod promptem).
6. W polu promptu wklej DOKŁADNIE poniższy tekst (zamieniając `{{customer_name}}` na rzeczywisty `CUSTOMER_NAME`):

    Przeprowadź dogłębną analizę poniższego produktu i przygotuj kompletny raport strategiczny, który posłuży jako fundament do budowy marki i sprzedaży tego produktu na rynku polskim.

    PRODUKT jest załączony jako zrzut ekranu

    KONTEKST BIZNESOWY:
    - Model startu: dropshipping z AliExpress (pierwsze zamówienia)
    - Docelowy model: import przez agenta w Chinach z pełnym brandingiem (własne opakowanie, logo na produkcie, wkładki do paczki, branded unboxing experience), a następnie import do magazynów w Polsce
    - Kanał sprzedaży: dedykowany landing page (one-product store)
    - Rynek docelowy: Polska

    1. Przeanalizuj produkt i jego potencjał rynkowy.
    2. Jaki problem rozwiązuje i jakie potrzeby zaspokaja. Jakie są czułe punkty w które warto uderzać aby potencjalny klient czuł bardzo silną potrzebę zakupu. Jak grać na emocjach.
    3. Kim jest grupa docelowa i zbuduj jej avatar
    4. Jak podejść do budowy marki dla tego produktu. Zaproponuj 5 nazw dla marki, mogą po polsku i po angielsku. Jak marka powinna się komunikować, jaki mieć styl, jakie wartości eksponować.
    5. Opracuj plan komunikacji marketingowej
    6. Przygotuj strategię rozwoju i pomysłu na skalowanie

    Ten raport ma być przewodnikiem dla osoby, który już zdecydowała, że chce sprzedawać ten produkt i raport ma maksymalnie pomóc w tym, aby wprowadzić produkt na rynek, oraz zacząć budować markę wokół niego i maksymalizować zyski ze sprzedaży.

    Raport jest przygotowany dla: {{customer_name}}

7. Kliknij "Wyślij" / strzałkę.
8. Gemini Deep Research najpierw pokaże plan badawczy — potwierdź ("Rozpocznij badanie" / "Start research").
9. CZEKAJ. Co ~60 sekund sprawdzaj status. Nie klikaj niczego innego, nie zmieniaj zakładek, nie pisz do Gemini dodatkowych wiadomości. Deep Research pokaże progres (np. "Badam źródła…", lista odwiedzonych stron, itd.). Finalny raport pojawia się jako duża sformatowana odpowiedź z sekcjami + przycisk "Eksportuj do Dokumentów" / "Export to Docs".
10. Gdy raport jest gotowy (widzisz przycisk "Eksportuj do Dokumentów"): przejdź dalej.

Jeśli po 25 min raport dalej się generuje — NIE przerywaj, czekaj. Deep Research potrafi iść 20+ min.
Jeśli Gemini zwróci błąd lub pusty raport — zgłoś użytkownikowi i ZATRZYMAJ.

## KROK 3 — Export do Docs, rename, download PDF

1. Kliknij "Eksportuj do Dokumentów" / "Export to Google Docs" w Gemini.
2. Nowa zakładka z Google Docs otworzy się z treścią raportu. Poczekaj aż się załaduje.
3. W Google Docs: kliknij na tytuł dokumentu u góry (obecna nazwa to np. "Gemini – …") i zmień na dokładnie: `{BRAND_NAME} raport główny` (np. "Pupilnik raport główny"). Enter.
4. Zaznacz całą treść dokumentu (Ctrl+A), skopiuj (Ctrl+C) — treść zostaje w systemowym schowku (wykorzystasz w KROKU 5).
5. File → Download → PDF Document (.pdf). Poczekaj aż pobranie się zakończy.
6. Plik trafia do Downloads jako `{BRAND_NAME} raport główny.pdf`. Zanotuj `PDF_PATH`.

## KROK 4 — Upload PDF do CRM jako raport główny

1. Wróć do zakładki {WORKFLOW_URL}.
2. Kliknij zakładkę "Raporty".
3. Kliknij przycisk "Dodaj raport" (lub podobny — ikona plus / "+ Nowy raport").
4. W modalu/formularzu:
   - Title: `Raport główny`
   - Type (dropdown): wybierz `report_pdf` (w UI może być etykieta "PDF / Raport")
   - Visible to client: zostaw OFF / niezaznaczone
   - File: kliknij pole wyboru pliku, w pickerze wybierz `PDF_PATH`.
5. Zapisz. Poczekaj aż w liście raportów pojawi się nowy wpis "Raport główny" z ikoną PDF.

Stop-check: jeśli upload się nie powiódł — spróbuj jeszcze raz. Po drugiej porażce zgłoś użytkownikowi i ZATRZYMAJ.

## KROK 5 — NotebookLM: nowy notebook + źródło tekstowe

1. Przejdź do zakładki https://notebooklm.google.com/.
2. Kliknij "Create new notebook" / "+ Nowy notebook".
3. W oknie dodawania źródeł wybierz "Kopiuj tekst" / "Paste text" / "Copied text".
4. Wklej (Ctrl+V) treść raportu skopiowaną w KROKU 3, punkt 4.
5. Nazwij źródło: `Raport główny — {BRAND_NAME}`.
6. Potwierdź dodanie źródła. NotebookLM przetworzy tekst (~30 sek).

Po przetworzeniu NotebookLM pokazuje Notebook Guide z opcjami: Audio Overview, Video Overview, Mind Map, Briefing Doc, Study Guide, FAQ, Timeline, Infographic.

## KROK 6 — Generuj Briefing Doc (jako "prezentacja")

1. W Notebook Guide kliknij "Briefing Document" / "Dokument briefingowy".
2. NotebookLM wygeneruje dokument (1–2 min). Czekaj.
3. Gdy gotowe — otwórz dokument.
4. W prawym górnym rogu dokumentu znajdź opcję eksportu/zapisu. Najczęściej: "Zapisz jako notatkę" + "Kopiuj" + "Pobierz". Kliknij "Pobierz" / "Download" i wybierz PDF.
5. Plik trafia do Downloads jako `Briefing Doc - {tytuł}.pdf` (lub podobnie). Zanotuj `BRIEFING_PATH`.
6. Jeśli "Pobierz" nie jest dostępne, wybierz "Zapisz jako notatkę", następnie w notatce użyj "Kopiuj" i wklej do nowego Google Docs → File → Download → PDF. Zanotuj `BRIEFING_PATH`.
7. Wróć do {WORKFLOW_URL} → Raporty → "Dodaj raport":
   - Title: `Briefing (prezentacja)`
   - Type: `report_presentation`
   - File: `BRIEFING_PATH`
   - Zapisz.

## KROK 7 — Generuj Infografikę

1. Wróć do notebooka w NotebookLM.
2. W Notebook Guide kliknij "Infographic" / "Infografika".
3. NotebookLM wygeneruje infografikę (2–4 min). Czekaj.
4. Gdy gotowe — otwórz infografikę (zwykle otwiera się jako interaktywna strona / obrazek).
5. Opcje zapisu:
   - Jeśli jest przycisk "Download" / "Pobierz PNG/PDF" — użyj go. Zanotuj `INFOGRAPHIC_PATH`.
   - Jeśli brak — zrób pełnoekranowy screenshot widocznej infografiki (Win+Shift+S, zaznacz całość, zapisz), zapisz do Downloads jako `infografika-{BRAND_NAME}.png`. Zanotuj `INFOGRAPHIC_PATH`.
6. Wróć do {WORKFLOW_URL} → Raporty → "Dodaj raport":
   - Title: `Infografika`
   - Type: `report_infographic`
   - File: `INFOGRAPHIC_PATH`
   - Zapisz.

## KROK 8 — Generuj Video Overview (krótkie)

1. Wróć do notebooka w NotebookLM.
2. W Notebook Guide kliknij "Video Overview" / "Omówienie wideo".
3. Jeśli pojawi się opcja długości — wybierz "Short" / "Krótkie" (~3–5 min). Jeśli brak opcji, użyj domyślnej.
4. Wygenerowanie trwa 5–15 min. Czekaj, co 2 min odświeżaj status.
5. Gdy gotowe — otwórz video.
6. Przycisk "Download" / "Pobierz" pobiera MP4. Zapisz do Downloads. Zanotuj `VIDEO_PATH`.
7. Jeśli brak "Download" — skopiuj "Share link" / link publiczny. Zapisz link jako `VIDEO_LINK` i pomiń upload MP4; zamiast tego w polu title w kroku 8 wpisz `Video Overview — {VIDEO_LINK}` i załaduj dowolny placeholder PDF (np. `BRIEFING_PATH`). W praktyce jednak Download powinien być dostępny.
8. Wróć do {WORKFLOW_URL} → Raporty → "Dodaj raport":
   - Title: `Video overview`
   - Type: `report_video`
   - File: `VIDEO_PATH`
   - Zapisz.

## KROK 9 — Raport końcowy

Zgłoś użytkownikowi podsumowanie:
- Workflow ID: {WORKFLOW_ID}
- Brand / customer: {BRAND_NAME} / {CUSTOMER_NAME}
- Artefakty dodane do {WORKFLOW_URL} → Raporty:
  * Raport główny (PDF) — tytuł "Raport główny"
  * Briefing (PDF) — tytuł "Briefing (prezentacja)"
  * Infografika (PNG/PDF) — tytuł "Infografika"
  * Video overview (MP4 lub link) — tytuł "Video overview"
- Czas całkowity pracy (wypisz przybliżony).

## ZASADY OGÓLNE

- Jeśli czegokolwiek nie możesz znaleźć (przycisk, opcja) — zrób screenshot, opisz co widzisz i pytaj użytkownika. NIE zgaduj.
- NIE wprowadzaj haseł. Jeśli coś wymaga logowania — STOP i zgłoś użytkownikowi.
- NIE zmieniaj innych danych workflow poza dodawaniem raportów.
- NIE usuwaj istniejących raportów.
- NIE wchodź na inne konta Google ani inne strony.
- Jeśli jakiś krok pada drugi raz pod rząd — STOP, zgłoś użytkownikowi pełny log co robiłeś.
- Wszystkie raporty zapisuj z `visible_to_client = false` (domyślnie) — udostępnienie klientowi robi użytkownik ręcznie później.
```

---

## Checklist po stronie użytkownika (PRZED uruchomieniem)

- [ ] Jestem zalogowany do Google (Gemini, Docs, NotebookLM) na właściwe konto
- [ ] Jestem zalogowany do `crm.tomekniedzwiecki.pl` jako admin
- [ ] Mam workflow_id z URL workflow
- [ ] Downloads folder jest pusty/uporządkowany (łatwiej Cowork znajdzie pliki)
- [ ] Mam 30–45 min zostawić Cowork bez przeszkód

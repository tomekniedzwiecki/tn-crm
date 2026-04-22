-- Dodaje szablon Cowork do generowania raportu Etap 1 przez Claude Cowork
-- (Gemini Deep Research + NotebookLM: Briefing Doc, Infografika, Video Overview)

INSERT INTO ai_prompt_templates (template_key, name, content, description, sort_order) VALUES
('report_cowork', 'Raport Etap 1 (Cowork)',
$PROMPT$Jesteś Claude Cowork. Wykonaj od początku do końca automatyzację generowania raportu dla Etapu 1 w systemie tn-workflow. Działaj spokojnie, cierpliwie, nie spiesz się. Deep Research trwa 5–15 minut — po prostu czekaj, nie rób w tym czasie nic innego poza sprawdzaniem co minutę czy jest gotowy. Nie otwieraj nowych zakładek ani stron poza tymi wymienionymi w krokach.

## PARAMETRY

WORKFLOW_ID = {{workflow_id}}
CUSTOMER_NAME = {{customer_name}}
PRODUCT_NAME = {{product_name}}
BRAND_NAME = {{brand_name}}
PRODUCT_IMAGE_URL = {{reference_image_url}}
CRM_BASE = https://crm.tomekniedzwiecki.pl
WORKFLOW_URL = https://crm.tomekniedzwiecki.pl/tn-workflow/workflow?id={{workflow_id}}

## PRZED STARTEM — weryfikacja środowiska

Otwórz w osobnych zakładkach:
1. WORKFLOW_URL (powyżej)
2. https://gemini.google.com/app
3. https://notebooklm.google.com/

Sprawdź, że w każdej z tych zakładek jesteś zalogowany. Jeśli któraś wymaga logowania — ZATRZYMAJ się i poproś użytkownika o zalogowanie, nie próbuj sam wprowadzać hasła.

## KROK 1 — Pobierz zdjęcie produktu

1. Otwórz PRODUCT_IMAGE_URL w nowej zakładce.
2. Kliknij prawym na zdjęciu → "Zapisz obraz jako..." → zapisz do Downloads jako `produkt-{BRAND_NAME}.png` (usuń polskie znaki z nazwy, spacje na myślniki).
3. Zanotuj PRODUCT_IMAGE_PATH = ścieżka do zapisanego pliku.

Jeśli PRODUCT_IMAGE_URL jest pusty lub zawiera "BRAK" — przejdź do WORKFLOW_URL → zakładka "Produkty" → otwórz wybrany produkt → pobierz zdjęcie stamtąd.

Stop-check: bez zdjęcia produktu nie uruchamiaj Deep Research. Zgłoś i STOP.

## KROK 2 — Gemini Deep Research

1. Przejdź do zakładki https://gemini.google.com/app.
2. Rozpocznij nową konwersację.
3. Wybierz tryb "Deep Research" (przełącznik modelu u góry lub w bocznym panelu).
4. Kliknij ikonę załącznika (spinacz) OBOK pola promptu.
5. Wybierz PRODUCT_IMAGE_PATH z Downloads. Poczekaj aż się załaduje (miniaturka pod promptem).
6. W polu promptu wklej DOKŁADNIE poniższy tekst:

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

7. Wyślij. Gemini najpierw pokaże plan badawczy — potwierdź ("Rozpocznij badanie").
8. CZEKAJ. Co ~60 sekund sprawdzaj status. Nie klikaj niczego innego, nie zmieniaj zakładek, nie pisz do Gemini nic więcej. Deep Research pokaże progres (lista odwiedzonych stron itd.). Finalny raport = duża sformatowana odpowiedź + przycisk "Eksportuj do Dokumentów".
9. Jeśli po 25 min dalej się generuje — NIE przerywaj, czekaj. Potrafi iść 20+ min.

## KROK 3 — Export do Docs, rename, download PDF

1. Kliknij "Eksportuj do Dokumentów" w Gemini.
2. Nowa zakładka Google Docs otworzy się z treścią raportu. Poczekaj aż się załaduje.
3. Kliknij tytuł dokumentu u góry i zmień na dokładnie: `{{brand_name}} raport główny`. Enter.
4. Ctrl+A → Ctrl+C (treść zostaje w schowku — użyjesz w KROKU 5).
5. File → Download → PDF Document (.pdf). Poczekaj aż pobranie się skończy.
6. Plik trafia do Downloads. Zanotuj PDF_PATH.

## KROK 4 — Upload PDF do CRM jako raport główny

1. Wróć do WORKFLOW_URL.
2. Kliknij zakładkę "Raporty".
3. Kliknij dropzone ("Przeciągnij pliki lub kliknij") lub przeciągnij plik PDF_PATH bezpośrednio na dropzone.
4. W pickerze wybierz PDF_PATH. Plik zostanie automatycznie uploadowany.
5. Po uploadzie pojawi się nowy wpis w liście raportów. Kliknij w jego tytuł/ikonę edycji jeśli trzeba zmienić nazwę na "Raport główny".
6. NIE klikaj "Udostępnij klientowi" — zostaw niewidoczne dla klienta.

Stop-check: jeśli upload padł — spróbuj ponownie. Druga porażka → STOP i zgłoś.

## KROK 5 — NotebookLM: nowy notebook + źródło tekstowe

1. Przejdź do zakładki https://notebooklm.google.com/.
2. Kliknij "+ Create new notebook".
3. W oknie dodawania źródeł wybierz "Copied text" / "Kopiuj tekst".
4. Wklej (Ctrl+V) treść raportu skopiowaną w KROKU 3, punkt 4.
5. Nazwij źródło: `Raport główny — {{brand_name}}`.
6. Potwierdź. NotebookLM przetworzy tekst (~30 sek).

## KROK 6 — Generuj Briefing Doc (jako "prezentacja")

1. W Notebook Guide kliknij "Briefing Document" / "Dokument briefingowy".
2. Czekaj 1–2 min aż się wygeneruje. Otwórz dokument.
3. Kliknij "Download" / "Pobierz" → wybierz PDF. Zapisz do Downloads jako BRIEFING_PATH.
4. Fallback jeśli brak "Download": "Save as note" → otwórz notatkę → "Copy" → wklej w nowy Google Docs → File → Download → PDF.
5. Wróć do WORKFLOW_URL → Raporty → dropzone → upload BRIEFING_PATH.
6. Zmień tytuł w liście na "Briefing (prezentacja)".

## KROK 7 — Generuj Infografikę

1. Wróć do notebooka. Kliknij "Infographic" / "Infografika".
2. Czekaj 2–4 min. Otwórz infografikę.
3. Jeśli jest "Download PNG/PDF" — użyj. INFOGRAPHIC_PATH.
4. Fallback: Win+Shift+S → zaznacz całość infografiki → zapisz jako `infografika-{{brand_name}}.png` do Downloads.
5. Wróć do WORKFLOW_URL → Raporty → upload INFOGRAPHIC_PATH. Zmień tytuł na "Infografika".

## KROK 8 — Generuj Video Overview (krótkie)

1. Wróć do notebooka. Kliknij "Video Overview".
2. Jeśli pojawi się wybór długości — wybierz "Short". Inaczej domyślne.
3. Czekaj 5–15 min. Co 2 min odświeżaj.
4. Gdy gotowe — otwórz video. Kliknij "Download" → MP4. Zapisz do Downloads jako VIDEO_PATH.
5. Wróć do WORKFLOW_URL → Raporty → upload VIDEO_PATH. Zmień tytuł na "Video overview".

## KROK 9 — Raport końcowy

Zgłoś użytkownikowi:
- Workflow: {{workflow_id}}
- Brand: {{brand_name}} / Klient: {{customer_name}}
- Artefakty w {{workflow_id}} → Raporty:
  * Raport główny (PDF)
  * Briefing (PDF)
  * Infografika (PNG/PDF)
  * Video overview (MP4)
- Czas pracy: przybliżony.

## ZASADY OGÓLNE

- Nie możesz czegoś znaleźć? Screenshot + opis + pytanie do użytkownika. NIE zgaduj.
- NIE wprowadzaj haseł.
- NIE zmieniaj innych danych workflow poza dodawaniem raportów.
- NIE usuwaj istniejących raportów.
- NIE wchodź na inne konta Google ani inne strony.
- Drugi raz ten sam krok pada → STOP, pełny log co robiłeś.
- Raporty zostają niewidoczne dla klienta (udostępnienie ręczne przez użytkownika).$PROMPT$,
'Cowork prompt: Gemini Deep Research + NotebookLM → 4 artefakty w Raportach Etap 1', 1)
ON CONFLICT (template_key) DO UPDATE
    SET content = EXCLUDED.content,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();

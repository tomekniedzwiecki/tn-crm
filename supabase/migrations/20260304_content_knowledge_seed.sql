-- ============================================
-- TN CONTENT - Initial Knowledge Base Seed
-- ============================================

-- STYL KOMUNIKACJI TOMKA
INSERT INTO content_knowledge (type, title, content) VALUES
('style', 'Ton i Osobowość', '{
    "bezposredni_i_szczery": "Nie owijasz w bawełnę. Często używasz zwrotów typu \"Prawda jest brutalna\" lub \"To oszustwo\". Stawiasz się w roli osoby, która wyrywa widza z letargu.",
    "autorytet_wspierajacy": "Jesteś ekspertem, ale nie patrzysz na widza z góry. Używasz sformułowań: \"Rozumiem Cię\", \"To nie Twoja wina, to mechanizm mózgu\", co buduje zaufanie.",
    "prowokator_intelektualny": "Twój styl to Pattern Interrupt – zaczynasz od czegoś, co wywraca myślenie widza do góry nogami (np. \"Przestań oglądać YouTube\")."
}'::jsonb),

('style', 'Język i Sposób Komunikacji', '{
    "zwroty_do_widza": "Zawsze na TY. Tworzysz relację jeden na jeden.",
    "uzywanie_metafor": [
        "Wiedza bez działania to oglądanie Masterchefa, gdy jest się głodnym.",
        "Etat to subskrypcja na Twoje życie.",
        "Mózg jako energochłonny organ/procesor."
    ],
    "dynamika_zdan": "Używasz krótkich, dosadnych zdań. Często stosujesz powtórzenia dla podkreślenia wagi (np. \"Nie jutro. Nie potem. Dziś\").",
    "slowa_klucze": ["system", "proces", "dane", "wolność", "czas jako waluta", "głębokie skupienie", "rzemiosło", "iluzja"]
}'::jsonb),

('philosophy', 'Kluczowe Motywy (Filozofia)', '{
    "dzialanie_wazniejsze_niz_teoria": "Najgorszą formą ignorancji jest wiedzieć, co robić i tego nie robić.",
    "system_wazniejszy_niz_szczescie": "Biznes to rzemiosło i powtarzalny proces, a nie wygrana na loterii.",
    "odzyskiwanie_kontroli": "Czas to najcenniejsza waluta. Każdy odcinek ma pomagać widzowi odzyskać kontrolę nad czasem/życiem.",
    "antysystemowosc": "Podważanie tradycyjnych ścieżek (szkoła, etat), ale w sposób merytoryczny, a nie krzykliwy."
}'::jsonb),

('checklist', 'Checklist przed publikacją skryptu', '{
    "pytania": [
        "Czy wstęp jest na tyle mocny, że widz zapomni o scrollowaniu dalej?",
        "Czy w tekście jest przynajmniej jedna mocna metafora obrazująca problem?",
        "Czy propozycja rozwiązania jest opisana jako system/proces, a nie magiczna sztuczka?",
        "Czy ton jest bezpośredni (bez \"Państwa\", \"Wszyscy wiemy\")?",
        "Czy na końcu jest konkretne wezwanie do działania (CTA) oparte na praktyce?"
    ]
}'::jsonb);

-- SZABLON SKRYPTU
INSERT INTO content_knowledge (type, title, content) VALUES
('script_template', 'Szablon skryptu YouTube', '{
    "struktura": {
        "1_hook": {
            "czas": "0-5 sek",
            "procent": "3%",
            "cel": "Zatrzymanie scrolla - szok/pytanie/teaser",
            "przyklad": "Większość sklepów internetowych upada w pierwszym roku. A ja powiem ci dlaczego twój nie musi."
        },
        "2_promise": {
            "czas": "5-30 sek",
            "procent": "3%",
            "cel": "Co widz dostanie z tego odcinka - konkretna obietnica",
            "przyklad": "Za chwilę pokażę ci 3 rzeczy, które robię z każdym moim klientem zanim wydamy złotówkę na reklamy."
        },
        "3_intro": {
            "czas": "30-60 sek",
            "procent": "5%",
            "cel": "Krótko - nie rozwlekaj",
            "przyklad": "Cześć, jestem Tomek i od X lat pomagam ludziom budować sklepy internetowe."
        },
        "4_problem": {
            "czas": "1-3 min",
            "procent": "15%",
            "cel": "Opisz ból widza - niech poczuje że go rozumiesz",
            "elementy": ["Co ich frustruje?", "Jakie błędy popełniają?", "Dlaczego dotychczasowe rozwiązania nie działają?"]
        },
        "5_rozwiazanie": {
            "czas": "3-10 min",
            "procent": "55%",
            "cel": "Główna wartość - dawaj KONKRETY",
            "uwaga": "Nie mów \"a jak chcesz wiedzieć więcej to...\" - daj wszystko"
        },
        "6_case_study": {
            "czas": "10-12 min",
            "procent": "15%",
            "cel": "Historia - Twoja lub klienta",
            "elementy": ["Sytuacja wyjściowa", "Co zrobiliście", "Wynik (liczby!)"],
            "uwaga": "Bez: \"i ty też możesz jeśli kupisz...\" - niech historia mówi sama"
        },
        "7_cta": {
            "czas": "12-12:30",
            "procent": "4%",
            "cel": "Soft sell - po dostarczeniu wartości",
            "przyklad": "Jeśli czujesz że to jest coś dla ciebie i chcesz żebym ci w tym pomógł - link w opisie."
        }
    },
    "uwaga_pattern_interrupt": "Co 2-3 minuty - zmiana energii, pytanie do widza, anegdota"
}'::jsonb);

-- SZABLON MINIATURKI
INSERT INTO content_knowledge (type, title, content) VALUES
('thumbnail_template', 'Szablon promptu do miniaturki', '{
    "szablon": "Stwórz profesjonalną miniaturkę YouTube w stylu [STYL: biznesowy/motywacyjny/edukacyjny].\n\nKOMPOZYCJA:\n- Zdjęcie mężczyzny (Tomek Niedzwiecki) po [STRONA: lewej/prawej] stronie\n- Wyraz twarzy: [EMOCJA: zaskoczenie/pewność siebie/zamyślenie/podekscytowanie]\n- Tło: [TŁO: gradient pomarańczowo-czarny / biuro / abstrakcyjne kształty]\n\nTEKST NA MINIATURCE:\n- Maksymalnie 3 słowa: \"[TEKST]\"\n- Font: gruby, sans-serif, biały z czarnym obrysem\n- Pozycja: [POZYCJA: na przeciwnej stronie od twarzy]\n\nELEMENTY DODATKOWE:\n- [ELEMENT: strzałka wskazująca / ikona pieniędzy / wykres w górę / znak zapytania]\n- Kolory dominujące: pomarańczowy, czarny, biały\n\nTEMAT ODCINKA: [TEMAT]\n\nStyl inspirowany: Alex Hormozi, Iman Gadzhi - wysokojakościowy, profesjonalny, przyciągający uwagę.",
    "zasady": {
        "twarz_z_emocja": "+20-35% CTR",
        "max_slow": 3,
        "kolory": "pomarańcz/żółty na kontraście z czarnym"
    }
}'::jsonb);

-- OFERTA
INSERT INTO content_knowledge (type, title, content) VALUES
('offer', 'Budowa Sklepu - Pełen Pakiet', '{
    "nazwa": "Budowa Sklepu Internetowego - Pełen Pakiet",
    "opis_krotki": "Kompleksowy program uruchomienia sprzedaży online od analizy rynku do skalowania.",
    "model_wspolpracy": {
        "oplata_wstepna": "Jednorazowa płatność przed rozpoczęciem",
        "udzial_w_zyskach": "20% dochodu netto - bezterminowo",
        "opcja_wykupu": "Po 24 miesiącach możliwość wykupu udziału"
    },
    "etapy": {
        "1_przygotowania": {
            "czas": "7 dni roboczych",
            "elementy": ["Analiza rynku", "Raport strategiczny", "Identyfikacja wizualna", "Strona sprzedażowa"]
        },
        "2_formalnosci": {
            "czas": "10 dni roboczych",
            "elementy": ["Lista dostawców", "Wybór formy biznesu", "Regulamin, polityka prywatności", "Konfiguracja techniczna"]
        },
        "3_materialy_reklamowe": {
            "czas": "7 dni roboczych",
            "elementy": ["Koncepcja komunikacji", "Grafiki", "Video", "Profile społecznościowe"]
        },
        "4_uruchomienie": {
            "cel": "1000 zamówień",
            "elementy": ["Kampanie Meta Ads i Google Ads", "Monitoring", "Optymalizacja"]
        },
        "5_skalowanie": {
            "czas": "180 dni",
            "elementy": ["Comiesięczne spotkania strategiczne", "Szkolenie klienta", "Przekazanie pełnej kontroli"]
        }
    },
    "dla_kogo": "Osoby chcące uruchomić sklep internetowy z pełnym wsparciem - od pomysłu do samodzielnego prowadzenia",
    "uwaga_do_contentu": "NIE rób chamskiej sprzedaży. Delikatnie przemycaj wartość oferty przez case studies i pokazywanie procesu."
}'::jsonb);

-- ZASADY SOFT SELL
INSERT INTO content_knowledge (type, title, content) VALUES
('philosophy', 'Zasady Soft Sell w Content', '{
    "glowna_zasada": "Ludzie nie lubią być sprzedawani, ale kochają kupować. Daj wartość najpierw.",
    "techniki": {
        "case_study": "Pokaż historię klienta bez mówienia \"kup teraz\". Liczby mówią same za siebie.",
        "edukacja": "Ucz konkretnych rzeczy. Im więcej dasz, tym bardziej ludzie będą chcieli więcej.",
        "cta_na_koncu": "CTA dopiero po dostarczeniu wartości. Jeden CTA na jeden film.",
        "format_cta": "czasownik + rezultat + szczegół. Np: \"Zapisz się na bezpłatną konsultację i dowiedz się, czy to dla Ciebie\""
    },
    "czego_unikac": [
        "\"Kup teraz\" w środku odcinka",
        "Przerywanie wartości sprzedażą",
        "Obiecywanie nierealistycznych rezultatów",
        "Presja czasowa (\"tylko dzisiaj\")"
    ],
    "kiedy_wspominac_oferte": "Tylko gdy naturalnie pasuje do tematu lub w dedykowanej sekcji na końcu"
}'::jsonb);

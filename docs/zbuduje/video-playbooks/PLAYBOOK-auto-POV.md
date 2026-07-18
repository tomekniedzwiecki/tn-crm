# PLAYBOOK — archetyp AUTO / WNĘTRZE POJAZDU POV

> Akcesoria samochodowe pokazywane w kadrze wnętrza auta: uchwyty telefonu, ładowarki, organizery, kamerki, oświetlenie.
> Wzorzec = POV z fotela: deska rozdzielcza, szyba, dłonie. Czytaj po SSOT (0d, 0e) i przed `PROCEDURA-OPERATORA.md`.

## 1. Rozpoznanie archetypu
Kadr osadzony we wnętrzu pojazdu (deska/szyba/kierownica w tle). Zwykrycie decyduje o rekwizytach i pułapkach ekranowych, których inne archetypy nie mają.
> **Rozstrzyganie z prezenterem (gadżet auto + gadający/reagujący prezenter — UGC reakcja/testimonial):** wybieraj **gadzet-handsPOV**, NIE beauty — kondensacja 15 s (0c) tnie gadanie jako pierwsze. `beauty-talkinghead` tylko, gdy twarz/emocja jest treścią dowodu (produkt działa NA ciele/twarzy), co w akcesorium auto praktycznie nie występuje.

## 2. Mapa silników
- Kadry produktu/dłoni bez twarzy kierowcy → **flf** (jak hands-POV: master-frame + FLF-chaining, bez N).
- Kierowca/pasażer w kadrze wykonujący gest → **mc** z drivingiem z oryginału (mikro-timing), n=2.
- Mowa do kamery praktycznie nie występuje; jeśli jest → traktuj jak beauty-talkinghead (OmniHuman).

## 3. Sceneria (jeden kanon przez CAŁĄ kreację — `scenography` w KARCIE)
Deska rozdzielcza / szyba / kierunek światła zdefiniowane raz i stałe. Światło zza szyby (dzień) lub ciepłe od desek (noc) — nie mieszaj pory dnia między scenami. Strona kierownicy stała.

## 4. Rekwizyty ekranowe (największe źródło tellów w tym archetypie)
- **Ekran nawigacji/telefonu = GENERYCZNA ciemna mapa nav**, JEDEN motyw przez całą kreację. Czarny ekran lub ciemna mapa bez marek — przeszło bramkę 17.07.
- **Zegary/wyświetlacze auta (prędkościomierz, zegar, temperatura) POZA kadrem albo rozmyte DOF.** Bzdurne cyfry na tarczach/zegarze to natychmiastowy AI-tell (pseudo-glify, sekcja 0e). Nie renderuj czytelnych cyfr — kadruj je poza ramką lub w nieostrości.
- Żadnych czytelnych napisów na produkcie/opakowaniu w kadrze (jak wszędzie: wyraźny glif = ODRZUT).

## 5. Afordancja i pułapki z audytu uchwytu
1. **Ręce na kierownicy, gdy tło JEDZIE.** Jeśli za szybą przesuwa się droga/otoczenie (auto w ruchu), dłonie MUSZĄ być na kierownicy — kierowca bez rąk na kierownicy w jadącym aucie = defekt afordancji (0e). Montaż produktu robimy przy aucie stojącym.
2. **Afordancja montażu produktu** — uchwyt faktycznie obejmuje telefon/kratkę wentylacji; ładowarka wpięta w port; kamerka na szybie przyssawką. Oś mocowania = oś działania (jak „oś narzędzia = oś pracy" w hands-POV).
3. **Tożsamość produktu WYŁĄCZNIE z galerii Ali**, nigdy z shop-packshotu (17.07 uchwyt: shop-packshot był INNYM produktem — pad „MECH STYLE"). `product.anatomy_str` z Ali; `functional_count` (ramiona/zaciski) stała między scenami (anty-morf). **Gdy CAŁY wzorzec pokazuje inny kolor/wariant niż nasza galeria Ali** → renderuj ZAWSZE wg Ali, a kolor/wariant wzorca wpisz do `forbidden_leaks` (referencja ruchu ciągnie model ku barwie wzorca).
4. **cv_reliable** — ciemne wnętrze + często czarny/srebrny produkt → maska HSV zawodzi → `cv_reliable: false`, licznik egzemplarzy przez VLM wiersz-na-klatkę.

## 6. Szkielet 15 s
HOOK (problem: telefon zsuwa się z deski / plątanina kabli) ≤2 s → DEMO montażu produktu 2-7 s (FLF) → DOWÓD (telefon trzyma się na wybojach / porządek) 7-13 s → CTA produkt w kadrze wnętrza 13-15 s. 4-6 cięć.

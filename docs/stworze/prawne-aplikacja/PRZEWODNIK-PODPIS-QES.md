# Przewodnik: jak podpisać Umowę Budowy kwalifikowanym podpisem elektronicznym (QES)

> **Metryczka**
> - **Status:** DRAFT do weryfikacji Tomka
> - **Data sporządzenia:** 2026-07-21
> - **Wersja:** v1
> - **Dla kogo:** Partner (Zamawiający) zawierający **Umowę o wykonanie i wdrożenie aplikacji** (dalej: **Umowa Budowy**). Dokument można wysłać klientowi jako instrukcję albo zostawić jako ściągę wewnętrzną Tomka.
> - **Realia rynkowe:** ceny i opcje zweryfikowane w sieci 2026-07 (patrz sekcja „Źródła"). Ceny orientacyjne — potwierdź u dostawcy przed wysyłką klientowi.

---

## 1. Dlaczego akurat QES (a nie skan czy Profil Zaufany)

Umowa Budowy **przenosi na Ciebie autorskie prawa majątkowe** do aplikacji (kod, grafiki, teksty). Prawo wymaga tu **formy pisemnej pod rygorem nieważności** (**art. 53 ustawy o prawie autorskim i prawach pokrewnych**). Oznacza to, że umowa podpisana w niewłaściwej formie **nie przenosi praw** — a bez przeniesienia praw nie możesz legalnie rozwijać ani sprzedać aplikacji.

Formę pisemną zachowują tylko dwie drogi:

1. **Papier** — własnoręczny podpis obu stron na papierowych egzemplarzach.
2. **Kwalifikowany podpis elektroniczny (QES)** obu stron — z mocy **art. 78¹ Kodeksu cywilnego** (w zw. z rozporządzeniem **eIDAS**) jest **równoważny** podpisowi własnoręcznemu.

> ⚠️ **Co NIE wystarcza (nie przenosi praw autorskich):**
> - **skan lub zdjęcie** podpisu, podpis „narysowany" myszką/palcem,
> - **Profil Zaufany / podpis zaufany (ePUAP)** — to podpis, ale **nie kwalifikowany**; nie zachowuje formy pisemnej w rozumieniu art. 78¹ k.c.,
> - narzędzia typu „kliknij, aby zaakceptować", DocuSign/Autenti w wariancie **zwykłego** (niekwalifikowanego) podpisu elektronicznego,
> - podpis kwalifikowany **tylko jednej** strony.

**Profil Zaufany a QES — różnica w jednym zdaniu:** Profil Zaufany to darmowe narzędzie do spraw urzędowych (podpis zaufany), ale prawnie to **podpis niekwalifikowany** — świetny do e-urzędu, **bezużyteczny** do przeniesienia praw autorskich. QES to podpis oparty na **kwalifikowanym certyfikacie** wydanym przez zaufanego dostawcę — i tylko on jest równy podpisowi odręcznemu.

---

## 2. Opcje dla klienta, który nie ma podpisu kwalifikowanego

Nie trzeba kupować rocznego zestawu z kartą i czytnikiem. Do podpisania **jednej umowy** wystarczy jedna z poniższych opcji:

### Opcja A (rekomendowana, jeśli masz e-dowód) — **darmowy QES w aplikacji mObywatel**
- **Koszt:** **0 zł** (do 5 dokumentów miesięcznie za darmo).
- **Co to jest:** pełnoprawny **kwalifikowany** podpis (QES) udostępniony w rządowej aplikacji mObywatel (Polska jako pierwszy kraj UE udostępnia darmowy QES w aplikacji państwowej).
- **Wymagania:** aktywny **mDowód** w aplikacji mObywatel, **plastikowy e-dowód z warstwą elektroniczną** (wydawany od 4 marca 2019 r.), **smartfon z modułem NFC**, ukończone 18 lat. Dokument PDF do **5 MB**.
- **Kiedy odpada:** jeśli masz starszy dowód bez warstwy elektronicznej albo telefon bez NFC — wtedy Opcja B lub C.

### Opcja B — **mSzafir podpis jednorazowy** (KIR)
- **Koszt:** ok. **15 zł netto** za jeden dokument (cena orientacyjna, 2026-07).
- **Co to jest:** jednorazowy **kwalifikowany** podpis online, w całości zdalny.
- **Weryfikacja tożsamości:** przez **bankowość elektroniczną** (lista banków) **albo** aplikację mObywatel (e-dowód z warstwą elektroniczną).
- **Czytnik/karta:** **nie są potrzebne** — działa na każdym urządzeniu z internetem.
- **Ograniczenia:** jeden dokument, PDF do **10 MB**; certyfikat aktywny ok. **15 minut** od wygenerowania (trzeba podpisać „od ręki").

### Opcja C — **SIGNIUS podpis jednorazowy (one-shot)**
- **Koszt:** pakiety jednorazowe (5/10/30 podpisów); najmniejszy pakiet dla osoby podpisującej sporadycznie — **[DO POTWIERDZENIA — orientacyjnie kilkadziesiąt zł za pakiet 5, sprawdzić na signius.pl]**.
- **Co to jest:** **kwalifikowany** podpis one-shot; weryfikacja tożsamości **zdalnie** (automatyczne rozpoznanie obrazu, bez rozmowy z konsultantem), cały proces ok. **15 minut**.
- **Kiedy warto:** gdy nie działa mObywatel (brak e-dowodu/NFC), a klient woli weryfikację „na selfie/dowód" zamiast logowania do banku.

### Opcja D — **klasyczny podpis roczny** (Certum, KIR mSzafir, Eurocert, EuroCert, SimplySign, Sigillum…)
- Ma sens tylko, jeśli klient i tak podpisuje elektronicznie wiele dokumentów. Do jednej umowy **przepłacony** — wybierz A/B/C.

> 🔎 **Profil Zaufany celowo NIE jest tu opcją** — patrz sekcja 1. Nie zachowuje formy pisemnej wymaganej do przeniesienia praw autorskich.

---

## 3. Przebieg podpisania krok po kroku (QES)

1. **Tomek finalizuje treść** Umowy Budowy (z załącznikami 1–4) i **eksportuje do jednego pliku PDF**.
2. **Tomek wysyła PDF** Partnerowi (e-mail) wraz z tym przewodnikiem i oświadczeniem statusu kontrahenta (osobny dokument).
3. **Obie strony podpisują ten sam plik** kwalifikowanym podpisem:
   - format podpisu: **PAdES** (podpis „w pliku" PDF — zalecany, wygodny) albo **XAdES** (podpis w osobnym pliku `.xml`/`.xades` — jeśli tak działa narzędzie klienta),
   - kolejność nie ma znaczenia; ważne, by **na końcu istniał jeden dokument z DWOMA ważnymi podpisami QES** (Tomka i Partnera). Przy PAdES drugi podpisujący dokłada swój podpis do pliku już podpisanego przez pierwszego.
4. **Wymiana plików:** strona, która podpisała jako druga, odsyła kompletny, dwustronnie podpisany plik. Każda strona zachowuje egzemplarz.
5. **Weryfikacja podpisów** (patrz sekcja 4) — potwierdź, że oba podpisy są **kwalifikowane i ważne**.
6. **Data zawarcia** = dzień złożenia drugiego (ostatniego) podpisu. Tę datę wpisuje się w polu `{{DATA}}` / potwierdza mailowo.

> **Ważne przy PAdES:** jeśli po pierwszym podpisie ktoś zapisze PDF „od nowa" (np. przez „drukuj do PDF" albo edycję), **pierwszy podpis się unieważni**. Drugi podpisujący musi dokładać podpis do **oryginalnego** podpisanego pliku, nie do jego kopii/wydruku.

---

## 4. Jak zweryfikować, że podpis jest ważny (QES)

Skorzystaj z jednego z bezpłatnych weryfikatorów:

- **Adobe Acrobat Reader** — otwiera PAdES i pokazuje panel podpisów: musi widnieć „podpis kwalifikowany" i status „ważny".
- **Rządowy weryfikator:** `weryfikacjapodpisu.pl` (KIR) albo weryfikator na `mobywatel/gov.pl` — wgrywasz plik i dostajesz raport, czy podpis jest **kwalifikowany** i **ważny**, oraz kto podpisał.
- Sprawdź, że raport mówi **„kwalifikowany"** (nie tylko „zaawansowany"/„zwykły") dla **obu** podpisów.

Jeśli weryfikator pokazuje podpis „zwykły/zaufany" zamiast „kwalifikowany" — **umowa nie przenosi praw**; trzeba podpisać ponownie właściwym podpisem.

---

## 5. Alternatywa: forma papierowa

Zawsze można zamiast QES użyć papieru:

1. Tomek drukuje **2 egzemplarze** (albo tyle, ilu jest sygnatariuszy + 1), podpisuje własnoręcznie i wysyła pocztą/kurierem.
2. Partner podpisuje **oba** egzemplarze własnoręcznie i odsyła **jeden** Tomkowi (drugi zostaje u Partnera).
3. Data zawarcia = dzień podpisania przez drugą stronę (zwykle Partnera).

Papier jest pewny prawnie, ale wolniejszy (2× przesyłka) i wymaga fizycznej wymiany oryginałów. **Skan podpisanego papieru nie zastępuje oryginału** — musi krążyć fizyczny dokument.

---

## 6. FAQ klienta

**Ile to kosztuje?**
Od **0 zł** (darmowy QES w mObywatel, jeśli masz e-dowód z NFC) do ok. **15 zł** (mSzafir jednorazowy) lub kilkudziesięciu zł (pakiet SIGNIUS). To koszt po stronie klienta, niezależny od ceny budowy aplikacji.

**Ile to trwa?**
Zwykle **15–30 minut** od założenia/aktywacji podpisu do złożenia go pod PDF. Papier: kilka dni (dwie przesyłki).

**Czy muszę mieć czytnik kart albo kupować rocznik podpisu?**
**Nie.** Do jednej umowy wystarczy podpis **jednorazowy w chmurze** (mSzafir/SIGNIUS) albo **darmowy mObywatel** — żadnej karty ani czytnika.

**Mam Profil Zaufany — czy nim podpiszę?**
Do tej umowy **nie**. Profil Zaufany to podpis niekwalifikowany i **nie przenosi praw autorskich**. Potrzebny jest podpis **kwalifikowany** (QES) — patrz opcje A–C.

**Nie mam nowego dowodu / telefonu z NFC — co wtedy?**
Wybierz **mSzafir jednorazowy** (weryfikacja przez bank) albo **SIGNIUS** (weryfikacja zdalna na dowód/selfie). Obie działają bez e-dowodu i bez NFC.

**Czy podpis elektroniczny jest tak samo ważny jak odręczny?**
Tak — QES jest z mocy prawa (art. 78¹ k.c. + eIDAS) **równoważny** podpisowi własnoręcznemu w całej UE.

**Czy umowa „na odległość" z QES daje mi prawo odstąpienia?**
Jeśli jesteś Konsumentem lub przedsiębiorcą na prawach konsumenta — tak, masz 14 dni na odstąpienie (szczegóły w umowie, § 14 i Załącznik 3). Podpisanie QES nie odbiera tego prawa.

---

## Źródła (weryfikacja 2026-07)

- mSzafir jednorazowy — cena ~15 zł netto, weryfikacja bank/mObywatel, bez czytnika, PDF do 10 MB, certyfikat 15 min: elektronicznypodpis.pl (produkt „Mobilny mSzafir do jednorazowego podpisu").
- Darmowy QES w mObywatel — 5 dokumentów/mies., wymóg e-dowodu z warstwą elektroniczną + NFC, 18+, PDF do 5 MB: gov.pl (Ministerstwo Cyfryzacji).
- SIGNIUS podpis jednorazowy (one-shot) — pakiety 5/10/30, weryfikacja zdalna, proces ~15 min, kody aktywne do 31.12.2026: signius.pl / signius.eu.

---

## NOTATKI ROBOCZE (do usunięcia przed wysyłką klientowi)

1. **[DO POTWIERDZENIA] Cena pakietu SIGNIUS (Opcja C).** Nie udało się odczytać dokładnej ceny najmniejszego pakietu — wpisany placeholder. Sprawdzić aktualny cennik `signius.eu/pricing` / `signius.pl` i wstawić konkret przed wysyłką.
2. **[DO POTWIERDZENIA] Które QES używa sam Tomek.** Przewodnik zakłada, że Tomek ma własny QES (np. mSzafir/Certum roczny). Warto mieć stały podpis roczny po stronie Tomka (podpisuje wiele umów), a klientowi zostawić opcje jednorazowe A–C. Potwierdź, jakim podpisem podpisuje Tomek — do wpisania w wewnętrznej instrukcji.
3. **[DO POTWIERDZENIA] Format docelowy umowy.** Silnik renderuje umowę z markdown do HTML; do podpisu QES potrzebny jest **PDF**. Ustalić ścieżkę „HTML → PDF" (druk do PDF / eksport), tak aby wynikowy PDF był stabilny (podpis PAdES unieważnia się przy ponownym zapisie pliku — patrz sekcja 3).
4. **[DO POTWIERDZENIA] Zgodność z § 16 Umowy Budowy.** Przewodnik jest spójny z § 16 wzoru umowy (forma pisemna albo QES; ostrzeżenie o skanie/Profilu Zaufanym; klauzula konwersji). Gdyby wzór umowy zmienił konstrukcję (np. licencja wyłączna zamiast przeniesienia — art. 67 ust. 5 pr. aut. też wymaga formy pisemnej), uzasadnienie z sekcji 1 pozostaje aktualne, ale warto zsynchronizować odesłanie do artykułu.
5. **Weryfikator KIR.** Adres `weryfikacjapodpisu.pl` podałem z pamięci jako powszechnie używany weryfikator KIR — potwierdzić aktualny URL przed wysyłką (alternatywnie odesłać do weryfikatora na gov.pl/mObywatel).

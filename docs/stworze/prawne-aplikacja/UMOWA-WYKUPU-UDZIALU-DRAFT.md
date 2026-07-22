# UMOWA WYKUPU UDZIAŁU — WZÓR WYKONAWCZY (do § 9 Umowy głównej — „Umowy Budowy")

Zawarta w dniu **{{DATA}}** w **{{MIEJSCE}}** (dalej: **„Umowa wykupu"**) pomiędzy:

**{{KLIENT_NAZWA}}**, {{KLIENT_ADRES}}, {{KLIENT_NIP}} (**„Operator"** / uprawniony do wykupu),

a

**Tomasz Niedźwiecki**, JDG **„Tomasz Niedźwiecki AI"**, ul. Grawerska 30L, 51-180 Wrocław, NIP 6972240255, REGON 302211341 (**„Wykonawca"**),

w wykonaniu **§ 9 umowy o wykonanie i wdrożenie aplikacji z dnia {{DATA_UMOWY}}** (dalej: **„Umowa główna"** lub **„Umowa Budowy"**), regulującego prawo Operatora do wykupu Udziału.

---

## § 1. Oświadczenie o skorzystaniu z wykupu

1. Operator oświadcza, że **korzysta z prawa wykupu Udziału** Wykonawcy, przewidzianego w § 9 Umowy głównej.
2. Strony potwierdzają, że **przesłanki wykupu są spełnione** (w szczególności upływ minimalnego okresu przewidzianego w Umowie głównej — co najmniej 12 miesięcy).

## § 2. Cena wykupu

1. Cena wykupu, zgodnie z Umową główną, wynosi **36-krotność średniej miesięcznej kwoty Udziału z ostatnich 12 (dwunastu) miesięcy, nie mniej niż dwukrotność ceny za budowę brutto określonej w § 5 ust. 1 Umowy głównej (`{{PROG_WYKUPU_BRUTTO}}` zł brutto) (§ 9 ust. 1 Umowy głównej)**, tj.:

   > **Cena wykupu = {{KWOTA_WYKUPU}} zł brutto** (słownie: {{KWOTA_WYKUPU_SLOWNIE}}) — kwota zawiera należny podatek VAT (spójnie z Udziałem, który jest kwotą brutto — § 6 ust. 5 Umowy głównej).

2. Sposób wyliczenia (12 miesięcznych kwot Udziału, średnia, mnożnik 36) przedstawia **Załącznik nr 1 do Umowy wykupu**, stanowiący jej integralną część.
3. **Wcześniejszy wykup przy zbyciu biznesu (przed upływem 12 miesięcy od Startu produkcyjnego).** Jeżeli wykup następuje przed zbyciem Aplikacji lub biznesu przed upływem 12 miesięcy (§ 10 ust. 1 Umowy głównej), cenę wykupu oblicza się jako **36-krotność średniej miesięcznej kwoty Udziału z dostępnych pełnych miesięcy kalendarzowych od Startu produkcyjnego, nie mniej niż dwukrotność ceny za budowę brutto określonej w § 5 ust. 1 Umowy głównej (`{{PROG_WYKUPU_BRUTTO}}` zł brutto)**; jeżeli nie zakończył się jeszcze żaden pełny miesiąc kalendarzowy, stosuje się wyłącznie wskazaną cenę minimalną. Pozostałe zasady (kwota brutto, Załącznik nr 1 — z wyliczeniem z dostępnych miesięcy) stosuje się odpowiednio.

## § 3. Płatność

1. Cena wykupu jest płatna:
   - ☐ **jednorazowo** w terminie **{{TERMIN_PLATNOSCI}}** dni od wystawienia faktury; albo
   - ☐ **w ratach** — wyłącznie **za zgodą Wykonawcy** — według harmonogramu: **{{HARMONOGRAM_RAT}}**.
2. Płatność następuje przelewem na rachunek Wykonawcy wskazany na fakturze.

## § 4. Skutki wykupu

1. Z chwilą **zapłaty pełnej ceny wykupu** (a w przypadku rat — zapłaty ostatniej raty, chyba że Strony ustalą inaczej):
   a) **Udział Wykonawcy wygasa** w całości i na przyszłość — Wykonawcy nie przysługują dalsze świadczenia z tytułu Udziału (rev-share);
   b) **wygasa opieka / świadczenia serwisowe** Wykonawcy związane z Udziałem, na zasadach § 7 i § 9 ust. 2 Umowy głównej.
2. Wykonawca **niezwłocznie zaprzestaje poboru** Udziału (w tym wyłącza pobór typu application fee, jeżeli był stosowany).

## § 5. Przekazanie infrastruktury i dostępów

W terminie **14 (czternastu) dni** od skutku wykupu (§ 4) Wykonawca przekaże Operatorowi pełną **administrację infrastrukturą** wraz z kompletem dostępów oraz repozytorium kodu. Przekazaniu podlegają w szczególności:

- ☐ administracja **hostingiem / platformą** (np. Vercel) i przeniesienie/uprawnienia właścicielskie;
- ☐ dostęp administracyjny do **bazy danych / backendu** (np. Supabase) — role właścicielskie;
- ☐ **repozytorium kodu** (np. przekazanie własności / transfer repo);
- ☐ **domena i DNS** — przeniesienie/uprawnienia;
- ☐ **klucze i sekrety** (API, integracje płatności, dostawcy AI) — z zaleceniem rotacji po przejęciu;
- ☐ dostęp do **integracji płatności** (Stripe/Revolut/TPay — wg konfiguracji);
- ☐ dokumentacja techniczna i dane dostępowe do pozostałych usług: **{{INNE_ELEMENTY}}**.

Przekazanie potwierdza **protokół przekazania** podpisany przez obie Strony.

## § 6. Postanowienia końcowe

1. **Forma:** Umowa wykupu wymaga **formy pisemnej albo formy elektronicznej z kwalifikowanym podpisem elektronicznym (QES)** — dotyczy praw i wywołuje skutek w postaci wygaśnięcia Udziału.
2. W zakresie nieuregulowanym stosuje się Umowę główną oraz przepisy Kodeksu cywilnego.
3. Umowę sporządzono w dwóch jednobrzmiących egzemplarzach (lub w postaci elektronicznej opatrzonej QES — po jednym dla każdej Strony).

|  |  |
|---|---|
| **Operator** | **Wykonawca** |
| ................................ | ................................ |
| {{KLIENT_REPREZENTANT}} | Tomasz Niedźwiecki |

---

### Załącznik nr 1 — Wyliczenie ceny wykupu

| Miesiąc | Kwota Udziału (zł) |
|---------|-------------------:|
| {{M1}} | {{KWOTA_M1}} |
| {{M2}} | {{KWOTA_M2}} |
| … | … |
| {{M12}} | {{KWOTA_M12}} |
| **Suma 12 mies.** | **{{SUMA_12}}** |
| **Średnia miesięczna** | **{{SREDNIA}}** |
| **× 36 = Cena wykupu brutto** | **{{KWOTA_WYKUPU}}** |

---

## NOTATKI (do usunięcia)

- **Rewizja 3 (22.07):** ujednolicono rejestr językowy na prawniczy (decyzja Tomka) — Wykonawca zamiast «Tomek», usunięto zwroty w 2. osobie i kolokwializmy; bez zmian merytorycznych.
- **Kiedy używać:** gdy Operator korzysta z opcji wykupu z § 9 Umowy głównej (po min. 12 mies.; wariant wcześniejszy przy zbyciu biznesu — § 10 ust. 1 Umowy głównej, § 2 ust. 3 tego wzoru). Dokument wykonawczy — nie zmienia mechaniki wykupu, tylko ją realizuje.
- **Do uzupełnienia:** daty, dane Operatora, `{{KWOTA_WYKUPU}}` + słownie, `{{PROG_WYKUPU_BRUTTO}}` (= 2× cena za budowę brutto z § 5 ust. 1 Umowy głównej) i Załącznik nr 1 (12 kwot → średnia → ×36), tryb płatności, checklisty przekazania.
- **Cena = 36 × średnia miesięczna Udziału z 12 mies.** Zawsze dołącz Załącznik nr 1 z wyliczeniem — inaczej cena jest nieweryfikowalna. **Udział i cena wykupu są kwotami brutto** (§ 6 ust. 5 Umowy głównej) — z księgowością potwierdź jedynie moment i podstawę VAT.
- **Forma podpisu: pisemna albo QES.** To umowa dotycząca praw i wygaszająca wierzytelność — **nie** wystarczy forma dokumentowa/mail. Trzymaj się § 6.
- **Termin przekazania 14 dni** liczony od skutku wykupu (zapłata). Przy racie ostatniej — ustal wprost, czy przekazanie następuje po ostatniej racie, czy wcześniej za zabezpieczeniem.
- Skoreluj z **Umową główną** (wykup = § 9, tryb zbycia biznesu = § 10) — jeśli tam mnożnik/okres inne niż 36×/12 mies., popraw tutaj (Umowa główna = SSOT).
- **Próg minimalny wykupu = dwukrotność ceny za budowę brutto** (§ 5 ust. 1 Umowy głównej; w treści operatywnej formuła + placeholder `{{PROG_WYKUPU_BRUTTO}}`), OBUSTRONNY — dotyczy zarówno standardowego wykupu po 12 mies. (§ 2 ust. 1; § 9 ust. 1 Umowy głównej), jak i wcześniejszego przy zbyciu biznesu (§ 2 ust. 3; § 10 ust. 1 Umowy głównej). Cena za budowę jest INDYWIDUALNA (Rewizja 4 Umowy głównej — cena wg faktycznej oferty), więc próg liczy się z ceny z tej umowy; przy cenie standardowej 15 375 zł brutto próg wynosi 30 750 zł brutto. Decyzja Tomka 22.07; asymetria (próg tylko przy wcześniejszym wykupie) zniesiona. Wykup jest uprawnieniem Operatora (opcja, nie obowiązek). [DO POTWIERDZENIA — TOMEK: wysokość progu; przyjęto 2× cena budowy brutto.]

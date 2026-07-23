# PROSPEKTOR — pozyskiwanie bazy kontaktów (SSOT, research 2026-07-23)

> Jak legalnie zasilamy `wfp_prospects`. Dwa researche źródłowe (rynek baz + mapa źródeł
> per wertykal Fali 1) — wszystkie twierdzenia zweryfikowane URL-ami w raportach źródłowych.
> Format importu panelu: wklejka `nazwa;www;email;nip;miasto;wertykal` (tab lub średnik),
> dedup automatyczny po e-mailu/NIP/www.

## STRATEGIA (werdykt)

**Rdzeń = własna fabryka: CEIDG (Hurtownia Danych, filtr PKD) → enrichment e-maila ze strony
WWW firmy.** Legalnie najczystsza ścieżka, koszt ~0 zł, pełna kontrola jakości. Kupowanie baz
„ze zgodami" NIE ma sensu prawnego (zgody nie przechodzą — patrz PRAWO), a tanie bazy rejestrowe
to te same dane publiczne, które bierzemy sami. Zakup dopuszczalny tylko jako akcelerator/benchmark
(~150-200 zł / 1000 rekordów, licencja na własność, nigdy „wynajem jednorazowy").

Kolejność wdrożenia:
1. **[TOMEK — jedyny krok wymagający jego konta] Wniosek o dostęp do Hurtowni Danych CEIDG**
   (API v2): konto na biznes.gov.pl → „Wniosek o dostęp do raportów CEIDG" → klucz API (JWT)
   mailem. Darmowe. Dokumentacja: dane.biznes.gov.pl + akademia.biznes.gov.pl.
   API filtruje po PKD/regionie; e-mail/telefon zwraca tam, gdzie przedsiębiorca nie zastrzegł.
2. **Skróty katalogowe od ręki** (bez CEIDG): PSPDDD dla firmy-ddd (~230 firm Z e-mailami),
   wykazy BIP gmin dla asenizacji (NIP+telefon), PDF-y sądów okręgowych dla biegłych.
3. **Enrichment crawler** (do zbudowania): wejście CSV (nazwa, www) → pobiera stronę /kontakt →
   wyciąga e-mail (mailto + regex) → wyjście w formacie importu. Szanuje robots.txt,
   sekwencyjnie, z przerwami.
4. (Opcjonalnie, decyzja Tomka) testowy zakup 1000 rekordów jednego PKD u taniego sprzedawcy
   rejestrowego (RejestrB2B / BazyB2B / Panorama „pakiet e-mail") jako benchmark jakości
   vs nasza fabryka. Cennik potwierdzić ręcznie przed zakupem.

## PRAWO — trzy filary (zweryfikowane źródłami)

1. **RODO art. 14 (lekcja Bisnode/NSA):** kara UODO ~943 tys. zł (2019, utrzymana przez NSA
   19.09.2023) za NIEpoinformowanie osób, których dane wzięto z CEIDG. Wyjątek
   „niewspółmierny wysiłek" interpretowany WĄSKO (nie dla celów komercyjnych). Wniosek:
   **obowiązek informacyjny spełniamy najpóźniej przy pierwszym kontakcie — nasza stopka
   art. 14 + źródło danych + opt-out w KAŻDYM pierwszym mailu jest dokładnie tym, czego
   wymaga ta linia orzecznicza.** Podstawa przetwarzania: uzasadniony interes
   (art. 6 ust. 1 lit. f) + udokumentowany test równowagi.
2. **PKE art. 398: „zgody" z kupionych baz NIE przechodzą na nowego nadawcę** (zgoda musi być
   konkretna i dla konkretnego nadawcy; dotyczy też B2B i JDG). Sankcje: UKE do 3% przychodu,
   UODO wg RODO, czyn nieuczciwej konkurencji. Reżim znamy i zarządzamy nim po swojej stronie
   (neutralny 1. mail, adresy firmowe/ogólne, twardy opt-out) — deklaracje sprzedawców baz
   niczego tu nie zmieniają.
3. **Reużycie informacji publicznej:** ustawa o otwartych danych (Dz.U. 2021 poz. 1641) —
   BIP, wykazy gminne, listy sądowe wolno ponownie wykorzystywać (RODO art. 14 nadal
   obowiązuje). Harvesting e-maili ze STRON FIRMOWYCH: uzasadniony interes B2B (adres
   opublikowany do kontaktu), z art. 14 w stopce; kontrapunkt: organy każą ważyć interesy —
   trzymamy się adresów firmowych/ogólnych.

## ŹRÓDŁA ZAKAZANE do masowego zbioru (regulaminy/ToS — zweryfikowane)

- **Panorama Firm** (§8.1/§8.4 regulaminu: zakaz tworzenia innej bazy/komercyjnego użycia),
- **pkt.pl** (analogicznie), **Oferteo** (zakaz rozpowszechniania danych z serwisu),
- **Google Maps/Places** (ToS §3.2.3(a) „No Scraping"; wprost zakaz budowania lead-list).
Dozwolony wyłącznie RĘCZNY pojedynczy lookup. Nie automatyzować. Nie kupować scrapów Maps
(Outscraper itp.) jako fundamentu — ryzyko kontraktowe + brak przewagi nad CEIDG.

## CZEGO NIE KUPOWAĆ

- Baz „ze zgodami marketingowymi" (premia za iluzję — patrz PRAWO pkt 2).
- Licencji jednorazowych/wynajmu (Panorama itp.) — budujemy bazę własną, cykliczną.
- D&B/Bisnode, ZoomInfo, Apollo, Lusha, Cognism dla mikrofirm — złe pokrycie polskich JDG,
  ceny enterprise. (Cognism ewentualnie w przyszłości dla wertykali z większymi firmami.)
- GUS BIR1.1 i Biała lista VAT to narzędzia WERYFIKACJI po NIP (bez e-maili), nie źródła list.
  Odpłatny wyciąg GUS REGON — tylko jako uzupełnienie szkieletu (e-mail rzadki); wycena na
  zapytanie.

## MAPA ŹRÓDEŁ — FALA 1 (najlepsze → zapasowe)

| Wertykal | Źródło #1 | Źródło #2 | E-maile z półki? |
|---|---|---|---|
| firmy-ddd | **PSPDDD, 16 stron wojewódzkich** (pspddd.pl/wojewodztwa/…) — nazwa, miasto, tel, **e-mail, www**, cert CEPA; ~230 firm | CEIDG PKD 81.29.Z (2007) / 81.23.A (2025) | **TAK** |
| szklo-na-wymiar | **CEIDG PKD 23.12.Z + 43.34.Z** + enrichment | izby rzemieślnicze/cechy (zrp.pl → 26 izb) | nie |
| serwis-oczyszczalni | **CEIDG PKD 43.22.Z + 37.00.Z** + enrichment | katalogi B2B po marce (wodkaneko.pl, srodowisko.pl — kontakt na profilach; producenci NIE publikują list instalatorów) | nie |
| asenizacja | **CEIDG PKD 37.00.Z** + enrichment | **wykazy BIP gmin** (rejestr zezwoleń na opróżnianie zbiorników — informacja publiczna; nazwa+adres+NIP+telefon, bez e-maila; ~2477 gmin, format HTML/PDF różny, część BIP blokuje boty) | częściowo (tel) |
| biegli-sadowi | **PDF-y list biegłych ~47 sądów okręgowych** (BIP; kontakt OPT-IN — tylko za zgodą biegłego, e-mail rzadki) | znajdzbieglego.com (16 182 biegłych — tylko namierzanie, regulamin niejasny → bez masówki) | rzadko |
| cukiernie-torty | **CEIDG PKD 10.71.Z + 47.24.Z** + enrichment | katalog.janachowska.pl/cukiernia (566 pozycji, kontakt na profilach — ręcznie) | nie |

Uwagi: biegli-sadowi to jedyny wertykal bez route'u PKD (osoby, nie firmy) — niska
pokrywalność kontaktów, dużo pracy ręcznej; planować niższy wolumen. PKD: do 31.12.2026
trwa przejście PKD 2007→2025 — filtrować po OBU kodach (klucz powiązań: klasyfikacje.stat.gov.pl).

## BRAMKA COMPLIANCE (każdy import, niezależnie od źródła)

1. Tylko adresy firmowe/ogólne (biuro@, kontakt@) lub opublikowane do kontaktu biznesowego.
2. Stopka art. 14 + źródło danych + opt-out w pierwszym mailu (już wdrożone w wfp-engine).
3. Suppression: opt-out nieodwracalny; unikalne indeksy nip/email/www chronią re-import.
4. Rekord w `source` mówi skąd dane (np. 'pspddd', 'ceidg', 'bip-gmina', 'csv') — audytowalność.
5. Test równowagi (LIA) dla uzasadnionego interesu — jednorazowy dokument, do spisania przy
   pierwszej wysyłce na dane z rejestrów.

## STATUS WDROŻENIA

- [x] Research rynku + prawa (2 raporty agentowe, 23.07.2026).
- [x] Harvest PSPDDD → `c:\tmp\prospektor\fala1-ddd.csv` (+ full.json) — patrz raport w sesji.
- [ ] Wniosek CEIDG Hurtownia Danych — **czeka na Tomka** (konto biznes.gov.pl).
- [ ] Enrichment crawler (www → e-mail) — do zbudowania po nadaniu dostępu CEIDG
      (jeden skrypt obsłuży wszystkie wertykale „rejestrowe").
- [ ] Harvest biegli (PDF-y SO) + asenizacja (BIP wybranych gmin) — po walidacji podejścia na DDD.

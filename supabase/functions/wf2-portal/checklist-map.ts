// checklist-map.ts — tłumaczenie pozycji checklist kroków (WS w tn-sklepy/projekt.html)
// na PROSTY, ludzki język zrozumiały dla właściciela sklepu bez wiedzy technicznej.
//
// Struktura: step_key → { DOKŁADNY tekst adminowy (t z wf2_steps.data.checklist) → tekst kliencki }.
// Merge stanu (done) w bazie idzie po dokładnym tekście `t`, więc klucze MUSZĄ być 1:1 z WS.
//
// Reguła fail-closed: pozycja BEZ wpisu w tej mapie NIE trafia do klienta (patrz index.ts).
// Świadomie POMINIĘTE (brak wpisu): logowanie kosztów/rejestry, weryfikacje skryptowe, dowody QA,
// bramki maszynowe, konwencje nazw/UTM — czysto wewnętrzna produkcja.
//
// ZAKAZ w tekstach klienckich: żargon (narzędzia/skrypty/kolumny/pliki/bramki), anglicyzmy
// techniczne, treść sugerująca automatyzację/AI. Tłumaczenia dodatkowo przechodzą CHECK_BLOCK.

export const CHECKLIST_MAP: Record<string, Record<string, string>> = {
  // ══════════ ETAP 1: PORTFEL ══════════
  marka: {
    "Shortlista nazw pojemnych z WOLNYMI domenami .pl (RDAP/WHOIS) + web-check kolizji":
      "Dobrane propozycje nazwy marki i sprawdzona dostępność domeny",
    "Nazwa wybrana → project.name (top-3 + rekomendacja w notatce)":
      "Wybrana nazwa marki",
    "Tagline + opis marki → pola projektu (zasilą stronę główną)":
      "Hasło i opis marki na stronę główną",
    "Paleta 6 hex (JASNE tła) + fonty latin-ext → pola projektu":
      "Dobrane kolory i czcionki marki",
    "Logo lockup + favicon (selektor @32px) wgrane do Storage brand/":
      "Gotowe logo i ikona marki",
    "Domena wybrana i wolna → project.domain (zakup = krok Domena marki)":
      "Wybrana i wolna domena sklepu",
  },

  // ══════════ ETAP 2: LANDING ══════════
  lp_dane: {
    "source=detail potwierdzony (albo STOP z notą)":
      "Sprawdzona aukcja dostawcy i dostępność produktu",
    "Galeria skurowana → gallery_curated (≥4 kadry keep)":
      "Wybrane najlepsze zdjęcia produktu",
    "Wideo skurowane → videos_curated (gate po klatce środkowej)":
      "Wybrane najlepsze materiały wideo produktu",
    "KARTA-PRAWDY.md gotowa (cena+NBP, specs 1:1, destylacja FAKT/BEŁKOT)":
      "Zebrane wszystkie fakty i cena produktu",
    "PASZPORT.md gotowy (elementy + „CZEGO NIE MA\")":
      "Spisane cechy produktu (i czego nie zawiera)",
    "Slug + mini-marka zarezerwowane w bud_brand_names":
      "Ustalona nazwa handlowa produktu",
  },
  lp_plan: {
    "Plan GPT gotowy (motyw ≠ „clean e-commerce\")":
      "Gotowa koncepcja strony produktu",
    "Tabela CLAIM→ŹRÓDŁO: każda korzyść z kotwicą":
      "Każda obietnica poparta konkretem",
    "Jasne tła + CTA checkout + esencja produktu na scenach kluczowych":
      "Jasny układ z wyeksponowanym produktem i przyciskiem zakupu",
    "Przewodnik graficzny: matryca osi wypełniona":
      "Zaplanowana różnorodność ujęć produktu",
  },
  lp_styl_marka: {
    "Styl-master ×1 gotowy (gate: motyw↔korzyść, jasno, produkt wierny)":
      "Gotowy kierunek wizualny strony produktu",
    "Nazwa zarezerwowana w bud_brand_names (INSERT-or-fail)":
      "Zarezerwowana nazwa produktu",
    "Favicon: N=4-6 → selektor @32px → werdykt vision top-2":
      "Gotowa ikona produktu",
    "Lockup: favicon LEWA + wordmark PRAWA":
      "Gotowe logo produktu",
  },
  lp_makiety: {
    "Styl-master → hero-makieta (gate WOW, max 3 iteracje)":
      "Zaprojektowany główny ekran strony",
    "Makiety WSZYSTKICH sekcji planu":
      "Zaprojektowane wszystkie sekcje strony",
    "Pary mobile 2:3 dla hero + TOR-I + wideo":
      "Zaprojektowana wersja na telefon",
    "Sekcje TOR-I: makiety pokazują STANY demonstracji":
      "Zaprojektowane interaktywne pokazy korzyści",
    "AKCEPT MAKIET — kontrakt wyglądu zamknięty":
      "Zatwierdzony ostateczny wygląd strony",
  },
  lp_grafiki: {
    "Sceny full-bleed = TA SAMA scena z makiety (gate side-by-side)":
      "Przygotowane zdjęcia i sceny produktu",
    "Hero 3 warianty (picture mobile/tablet/desktop)":
      "Grafiki głównego ekranu na różne urządzenia",
    "Wierność produktu: paszport + gate vs realne zdjęcie":
      "Sprawdzona zgodność grafik z prawdziwym produktem",
    "min_distinct_product_views ≥5; brak klonów pozy":
      "Produkt pokazany z wielu stron",
  },
  lp_kod: {
    "Sekcje przez SEKCJA-Z-MAKIETY (IR → koder → montaż)":
      "Zbudowane wszystkie sekcje strony",
    "Pipeline wideo self-host (poster własną klatką)":
      "Materiały wideo osadzone bezpośrednio na stronie",
    "Pay-badges z kanonicznego bloku":
      "Widoczne ikony metod płatności",
    "Wordmark = żywy tekst; favicon data-URI":
      "Logo produktu osadzone na stronie",
  },
  lp_dopasowanie: {
    "Progi: desktop ≥0.85 / mobile ≥0.78 KAŻDA sekcja":
      "Sprawdzony wygląd na komputerze i telefonie",
    "Werdykt vision „ten sam projekt\" = TAK wszędzie":
      "Strona dopracowana zgodnie z zatwierdzonym projektem",
  },
  lp_zycie: {
    "Choreograf: MOTION-DNA + spec per sekcja":
      "Zaplanowane animacje strony",
    "Zestaw obowiązkowy: scroll-reveal, count-up, sticky slide-in":
      "Płynne pojawianie się treści przy przewijaniu",
    "Mikrointerakcje CTA/kart":
      "Dopracowane reakcje przycisków i kart",
    "Interaktywne demo korzyści (filtr sensu OK)":
      "Interaktywny pokaz korzyści produktu",
  },
  lp_finisz: {
    "F6 twarda: 0 konsoli, 0 h-scroll (390/768/1280), img OK":
      "Strona sprawdzona na komputerze, tablecie i telefonie",
    "Status produktu → gotowy":
      "Strona produktu gotowa",
  },

  // ══════════ ETAP 3: SKLEP NA PLATFORMIE ══════════
  pl_sklep: {
    "Sklep wybrany z listy partnera (akcja stores)":
      "Wybrany sklep na platformie",
    "platform_shop_id zapisany na projekcie":
      "Sklep połączony z projektem",
    "Domena startowa znana":
      "Ustalony startowy adres sklepu",
  },
  // Krok w budowie — dziś widoczny TYLKO w podglądzie admina (PREVIEW_ONLY_STEPS w index.ts)
  firma: {
    "Klient przygotowany (profil zaufany + dane do wniosku)":
      "Przygotowane: profil zaufany i dane do wniosku",
    "Firma zarejestrowana w CEIDG — NIP wpisany w portalu":
      "Firma zarejestrowana, NIP podany",
    "Księgowość wybrana (inFakt z linku polecającego)":
      "Wybrana księgowość dla Twojej firmy",
    "Dane firmy przepisane do kroku Dane rozliczeniowe":
      "Dane firmy uzupełnione w zadaniu Dane rozliczeniowe",
  },
  pl_dane: {
    "Numer konta do pobrań (NRB, 26 cyfr)":
      "Numer konta do wypłat za zamówienia",
    "Dane firmy do faktur/regulaminu":
      "Dane firmy do faktur i regulaminu",
    "Akceptacja treści prawnych":
      "Zatwierdzone treści prawne",
  },
  pl_branding: {
    "Logo parasola wgrane (upload_logo)":
      "Wgrane logo sklepu",
    "Favicon wgrany (upload_favicon)":
      "Wgrana ikona sklepu",
    "Widoczne w headerze storefrontu":
      "Widoczne w nagłówku sklepu",
  },
  pl_dostawy: {
    "Konto COD ustawione (set_cod_account, NRB klienta)":
      "Ustawione pobranie (płatność przy odbiorze)",
    "≥1 metoda z pobraniem (add_delivery)":
      "Dodana metoda dostawy z pobraniem",
    "Kolejność: pobranie na górze (set_delivery_order)":
      "Pobranie ustawione jako pierwsza opcja",
    "Widoczne w kasie (test)":
      "Widoczne w koszyku",
  },
  pl_domena: {
    "Domena kupiona przez GoDaddy (wfa-domain, automat)":
      "Kupiona domena sklepu",
    "Domena dodana na platformie (add_domain) — rekordy zwrócone":
      "Domena dodana na platformie",
    "Rekordy DNS wpisane w strefie GoDaddy (dns_set, 1:1 z API)":
      "Ustawione wpisy kierujące domenę na sklep",
    "Weryfikacja przeszła → domena aktywowana (strażnik/auto)":
      "Domena aktywna i połączona ze sklepem",
  },
  pl_integracje: {
    "GA4 ustawione (jeśli używamy)":
      "Podłączona analityka odwiedzin",
    "Meta pixel ustawiony (set_integration, gdy pixel_id znany)":
      "Podłączony pomiar reklam (pixel)",
    "Pixel aktywny na storefroncie (weryfikacja w źródle strony)":
      "Pomiar aktywny na sklepie",
  },
  pl_produkt: {
    "Produkt utworzony/znaleziony (ensure_product)":
      "Produkt utworzony w sklepie",
    "Slug kasy ustawiony (set_checkout_slug)":
      "Ustawiony adres koszyka produktu",
    "checkout_url zmaterializowany (kasa odpowiada 200)":
      "Działający koszyk produktu",
    "platform_product_id + platform_name zapisane":
      "Produkt dodany do sklepu",
  },
  pl_landing: {
    "publish_landing wykonany (isHtml:true)":
      "Strona produktu opublikowana w sklepie",
    "URL 200 + treść 1:1":
      "Strona działa i wygląda zgodnie z projektem",
    "CTA prowadzi do kasy (checkout_url)":
      "Przycisk zakupu prowadzi do koszyka",
    "Cena hydratowana z API (test w konsoli)":
      "Aktualna cena widoczna na stronie",
  },
  pl_prawne: {
    "Dane firmy z kroku Dane rozliczeniowe kompletne":
      "Kompletne dane firmy",
    "Regulamin (COD, zwroty 14 dni, reklamacje)":
      "Gotowy regulamin sklepu",
    "Polityka prywatności (RODO, pixel/analityka)":
      "Gotowa polityka prywatności",
    "Strona zwrotów + kontakt":
      "Gotowe strony zwrotów i kontaktu",
    "Opublikowane (publish_landing) — 4× HTTP 200":
      "Wszystkie strony prawne opublikowane",
    "Linki w stopce landingów i strony głównej":
      "Odnośniki w stopce sklepu",
  },
  pl_glowna: {
    "Home = galeria parasola (publish_landing path:\"\")":
      "Opublikowana strona główna sklepu",
    "Linki do wszystkich landingów produktów":
      "Odnośniki do wszystkich produktów",
    "Branding parasola (logo, kolory)":
      "Spójny wygląd marki (logo, kolory)",
  },
  pl_test: {
    "Zamówienie testowe złożone (COD)":
      "Złożone zamówienie testowe (za pobraniem)",
    "Widoczne w /orders (akcja orders)":
      "Zamówienie widoczne w systemie sklepu",
    "Pixel/analityka złapały zdarzenia":
      "Pomiar reklam zarejestrował zakup",
    "Ceny landing↔kasa zgodne":
      "Zgodne ceny na stronie i w koszyku",
  },

  // ══════════ ETAP 4: ŚRODOWISKO REKLAMOWE ══════════
  ads_konto: {
    // klucze = VERBATIM z WS ads_konto (projekt.html) — flow RĘCZNY (Tomek 22.07: tor Leadsie uśpiony)
    "Konto reklamowe utworzone i udostępnione do BM Tomka":
      "Konto reklamowe utworzone i połączone",
    "Partner access do BM Tomka — pełna kontrola nadana":
      "Nadane uprawnienia do wspólnej obsługi konta",
    "Waluta PLN + strefa Europe/Warsaw zweryfikowane w Business Settings":
      "Konto w złotówkach i polskiej strefie czasu",
    "Metoda płatności dodana + telefon/2FA (klient)":
      "Dodana metoda płatności i zabezpieczenie konta",
    "Dokumenty firmy przygotowane (NIP/CEIDG — na wypadek weryfikacji)":
      "Przygotowane dokumenty firmy (na wypadek weryfikacji)",
  },
  ads_strona: {
    // klucze = VERBATIM z WS ads_strona (flow RĘCZNY — Tomek 22.07: tor Leadsie uśpiony)
    "Strona FB udostępniona do BM Tomka":
      "Strona firmy na Facebooku gotowa i połączona",
    "Logo, cover, sekcja Informacje (dane firmy + link do sklepu)":
      "Logo, tło i dane firmy na stronie",
    "3–6 postów na stronie (materiały z fabryki)":
      "Kilka postów na stronie (produkt, marka, kulisy)",
    "Strona przypisana do konta reklamowego (wymóg create_ad)":
      "Strona połączona z kontem reklamowym",
    "Instagram podpięty (opcjonalnie na start)":
      "Instagram podpięty (opcjonalnie)",
  },
  ads_budzet: {
    // klucze = VERBATIM z WS ads_budzet (przebudowa 21.07 — limit wydatków ustawia fabryka)
    "Budżet 1000 zł zadeklarowany (500 test / 500 skala)":
      "Ustalony budżet reklamowy (test i skalowanie)",
    "Środki WIDOCZNE w Ads Managerze (nie tylko deklaracja)":
      "Środki widoczne na koncie reklamowym",
    "Limit wydatków konta ustawiony (fabryka, po WF2_META_TOKEN)":
      "Limit wydatków ustawiony przez nas (bezpiecznik)",
    "Zapasowa metoda płatności dodana (przy płatnościach kartą)":
      "Dodana zapasowa metoda płatności",
  },
  ads_pixel: {
    // klucze = VERBATIM z WS ads_pixel (przebudowa 21.07 — CAPI przez platformę Trevio).
    // EMQ celowo POMINIĘTE (metryka wewnętrzna).
    "Pixel utworzony na koncie klienta (automat, WF2_META_TOKEN)":
      "Utworzony pomiar reklam (pixel)",
    "Domeny zweryfikowane w BM (TXT przez wfa-domain)":
      "Zweryfikowane adresy sklepu",
    "Token CAPI wygenerowany w Events Managerze (wąski per-pixel — NIE master)":
      "Dokładny pomiar zakupów przygotowany",
    "Pixel + token CAPI ustawione na platformie (set_integration)":
      "Pomiar podłączony do sklepu",
    "Purchase testowy w Events Managerze + dedup po event_id (1 zdarzenie, nie 2)":
      "Testowy zakup poprawnie zmierzony",
  },
  ads_preflight: {
    // naming/UTM + „WF2_META_TOKEN aktywny…" + „Próbny ads_create_creative…" (creative-probe)
    // celowo POMINIĘTE (gotowość wewnętrzna/techniczna fabryki, nie do klienta)
    "Płatność realnie zeszła (mikro-wydatek 5–15 zł/d przez 2–3 dni, bez skoków)":
      "Potwierdzone działanie płatności na koncie",
    "Account Quality czyste (brak restrykcji na koncie/BM/stronie)":
      "Konto reklamowe bez ograniczeń",
    "Blocklista komentarzy PL wgrana na stronę (scam/oszust*/chińsk*/nie doszło…)":
      "Przygotowana ochrona przed spamem w komentarzach",
    "Plan struktury: 1 kampania = 1 produkt = 1 ad set (ABO), broad, Advantage+":
      "Ustalony plan kampanii reklamowej",
  },

  // ══════════ ETAP 5: MATERIAŁY I KAMPANIA ══════════
  ads_grafiki: {
    "Karta produktu + copy gotowe":
      "Gotowe teksty reklamowe produktu",
    "Sceny wygenerowane (best-of-2, silnik fal)":
      "Przygotowane grafiki reklamowe",
    "Bramki QA: litery PL · wierność produktu · ciągłość · powód kliknięcia — z dowodami":
      "Sprawdzona jakość i zgodność grafik z produktem",
    "Warianty hooków opublikowane":
      "Przygotowane różne warianty reklam",
    "Banery zaakceptowane w panelu (toggle ✓)":
      "Zatwierdzone grafiki reklamowe",
  },
  ads_wideo: {
    "Blueprint wg szablonu (hook problem-first, LOOP CLOSE, SFX na akcje) — samoakcept #1 zalogowany":
      "Gotowy scenariusz reklamy wideo",
    "Klatki-klucze OK (pod-elementy produktu!) — samoakcept #2 zalogowany":
      "Zatwierdzone kluczowe ujęcia reklamy",
    "Montaż: SFX na akcję + ambient (bramka) · −14 LUFS · LOOP CLOSE · handheld":
      "Zmontowana reklama wideo z dźwiękiem",
    "Pack hooków: baza + ≤2 warianty (*_hook.mp4; łącznie ≤3 wersje)":
      "Przygotowane różne wersje reklamy wideo",
  },
  ads_zestaw: {
    "Zestaw skompletowany: 3 hooki wideo + 3 statyki (6 adów)":
      "Skompletowany zestaw reklam (wideo i grafiki)",
    "Copy PL: primary (hook ≤125 znaków) + headline ≤27 + 5 różnych tekstów":
      "Gotowe teksty reklamowe (kilka wariantów)",
    "Risk-reversal COD + social proof z liczbami (zero fałszywej pilności)":
      "Teksty z gwarancją pobrania i opiniami klientów",
    "Audyt polityki Meta: copy + landing RAZEM (semantic intent)":
      "Reklamy zgodne z zasadami Meta",
  },
  ads_kampanie: {
    "Kampania utworzona (PAUSED): 1 kampania = 1 produkt = 1 ad set":
      "Utworzona kampania reklamowa (wstrzymana do startu)",
    "6 adów podpiętych (3 hooki wideo 9:16 + 3 statyki 4:5) + flaga AI":
      "Reklamy podpięte do kampanii",
    "UTM na adach (utm_id={{ad.id}}) + budżet dzienny wg Bramki A (~17–25 zł)":
      "Ustawiony dzienny budżet kampanii",
  },
  ads_start: {
    "Start zatwierdzony przez Tomka (pon.–wt. rano)":
      "Start kampanii zatwierdzony",
    "Wszystkie ady przeszły review Meta (0 odrzuconych)":
      "Wszystkie reklamy zaakceptowane przez Meta",
    "Komentarze dnia 1 obsłużone (ukrywanie + odpowiedzi)":
      "Komentarze pod reklamami obsłużone",
    "Spend ruszył, zdarzenia wpadają (pixel + CAPI, dedup 1 zdarzenie)":
      "Kampania wystartowała, wydatki i pomiar działają",
  },

  // ══════════ ETAP 6: TESTY I SKALOWANIE ══════════
  ads_wyniki: {
    "Cron wf2-ads-sync działa (wpisy w wf2_ad_stats < 24 h)":
      "Codzienne podsumowania wyników reklam dostępne",
    "wf2_creative_perf ma dane (thumbstop/hold/p100/CTR per kreacja)":
      "Dostępne szczegółowe wyniki poszczególnych reklam",
  },
  ads_opieka: {
    "Rytm ustawiony: codziennie higiena, co 3–4 dni przegląd metryk":
      "Ustalony rytm codziennej opieki nad kampanią",
    "Moderacja komentarzy działa (blocklista + ukrywanie + odpowiedzi)":
      "Moderacja komentarzy pod reklamami działa",
    "Alerty: odrzucone reklamy / spend bez ATC / CPM spike":
      "Alerty o problemach z reklamami włączone",
    "Feedback score strony sprawdzany co tydzień (próg interwencji <3)":
      "Cotygodniowa kontrola oceny sklepu",
  },
  skalowanie: {
    "Cena scale ustawiona (tryb SKALA)":
      "Ustawiona cena na etap skalowania",
    "Budżet podnoszony +20% (odstęp ≥48 h, bez resetu learning)":
      "Stopniowe zwiększanie budżetu reklam",
    "Świeże kreacje w kolejce (4–6 wariantów winnera)":
      "Nowe warianty najlepszej reklamy w przygotowaniu",
    "Plan marki spisany":
      "Spisany plan rozwoju marki",
  },
  rotacja: {
    "Kandydaci wylosowani z /trendy":
      "Wybrane kolejne produkty do testów",
    "Dodani do portfela (przycisk Produkty)":
      "Dodane do portfela produktów",
  },
  sprzedaz_sync: {
    "Cron wf2-orders-sync skonfigurowany":
      "Zamówienia aktualizowane codziennie",
    "Ostatni sync < 24 h":
      "Zamówienia aktualne (mniej niż doba)",
    "Mapowanie linii → produkty bez sierot":
      "Zamówienia poprawnie przypisane do produktów",
  },

  // ══════════ ETAP 7: STERY ══════════
  przejecie_kampanii: {
    "Klient zna panel Ads i metryki":
      "Znasz obsługę reklam i wyniki",
    "Pierwsza samodzielna optymalizacja za nim":
      "Pierwsza samodzielna optymalizacja wykonana",
    "Dostępy przekazane":
      "Przekazane dostępy",
  },
  przejecie_operacji: {
    "Obsługa zamówień przejęta":
      "Obsługa zamówień przejęta",
    "Obsługa zapytań klientów przejęta":
      "Obsługa pytań klientów przejęta",
  },
  stery: {
    "Cel zamówień osiągnięty":
      "Cel liczby zamówień osiągnięty",
    "Checklisty przejęcia domknięte":
      "Wszystkie etapy przejęcia zakończone",
    "Rytm przeglądów miesięcznych umówiony":
      "Umówione miesięczne przeglądy",
  },
};

# MASTER PROMPT WF2 — prompt startowy „zrób cały sklep do końca"

> **Do czego to jest:** Tomek wkleja BLOK PROMPTU (niżej) do nowej sesji Claude Code w
> `c:\repos_tn\tn-crm`, podmienia `<PROJEKT>` na uuid/slug i **odchodzi**. Sesja sama robi
> WSZYSTKO, co wykonalne bez niego, aż do „100% albo wyłącznie blokady zewnętrzne", i dostarcza
> gotowe efekty + tabelę blokad. To rozszerzenie [AUTOPILOT-WF2.md](AUTOPILOT-WF2.md) o: (a) jawną
> enumerację wszystkich etapów/kroków, (b) próg jakości (lekcje z realnych wpadek), (c) definicję
> „gotowe" i format dostawy. SSOT kroków bez zmian — ten plik ich nie zastępuje, spina.

---

## 🟩 BLOK PROMPTU (to kopiuje Tomek — całość między liniami)

```
AUTOPILOT WF2 — projekt <PROJEKT>. Zrealizuj CAŁY projekt sklepu do 100% wykonalności: wszystkie
produkty, wszystkie etapy, wszystkie kroki które da się zrobić TERAZ bez mojego udziału. Nie pytaj
mnie o nic po drodze (tryb autonomiczny, maks runway) — pytania tylko jeśli twardo brak danych,
których nikt poza mną/klientem nie dostarczy. Zostawiam Cię z tym; rano/po powrocie chcę zastać
gotowe efekty i tabelę blokad.

PĘTLA (do wyczerpania):
(1) Przeczytaj wf2_steps projektu + WSZYSTKICH produktów (jedyna prawda o postępie) + CLAUDE.md
    sekcja „TN Sklepy" + SSOT kroków. Zbuduj wewnętrzny plan.
(2) Wypisz listę kroków WYKONALNYCH TERAZ = pending/in_progress ∧ zależności spełnione ∧ nie
    wymagają danych klienta/decyzji-bramki Tomka. Rób je w kolejności etapów, per produkt.
(3) Wykonuj wg SSOT danego kroku, z bramkami jakości i emisją panel-sync PO KAŻDEJ fazie.
(4) Wróć do (1). KONIEC dopiero gdy wykonalnych = 0.
Na koniec: TABELA BLOKAD (krok → czego brakuje → kto odblokowuje: Tomek/klient/cron/sekret) +
raport na kartę projektu (wf2_notes) + jeden PushNotification.

ZAKRES = WSZYSTKO, NIE „jeden landing":
• KAŻDY produkt buildowalny dostaje PEŁNY landing F0–F8 (nie tylko pierwszy). Produkt bez źródła
  Ali/snapshotu = blokada sourcingu (do tabeli), reszta idzie dalej.
• Sklep na platformie: dociągnij WSZYSTKO co konfiguracyjne (branding, produkty, strona główna,
  dostawy/integracje na ile bez danych klienta). Nie zostawiaj „infra done, reszta czeka" jeśli
  dane już są.
• Materiały reklamowe: przygotuj BANERY/kreacje (agr_*) i — jeśli wykonalne — wideo (avi_*) dla
  gotowych produktów, żeby czekały gotowe na odblokowanie konta ads. To jest wykonalne TERAZ.
• Fundamenty/„rzeczy dla kandydatów": dociągnij wszystko co nie wymaga danych klienta.

PRÓG JAKOŚCI (twardy — patrz sekcja „JAKOŚĆ" w MASTER-PROMPT-WF2.md):
• HERO = scena W TLE (full-bleed, TYP A), produkt osadzony w świecie strony. NIGDY pocztówka
  wycięta w ramce/kolumnie. Hero projektowany pod hero-video. [[feedback-hero-projektowany-pod-hero-video]]
• Landing kompletny wg MANIFEST SEKCJI (klasa dowodowa, bez prawa SKIP) + GESTALT F7.4: finalny
  ŻYWY render ogląda świeże oko „oczami klienta" PRZED status=gotowy.
• Gotowy landing PUBLIKUJ (na custom domenie = GO-LIVE) gdy tylko spełnione bramki — nie zostawiaj
  skończonego landingu nieopublikowanym „na wszelki wypadek".

ZAKAZY TWARDE: NIE PSUJ TPAY; zero publikacji Meta; zero wysłanych maili (tylko drafty); E2E
checkout tylko sandbox/[Test]; dokumenty z marżami tylko prywatne buckety; NIE zmyślaj danych
(brak = STOP z notą, nie placeholder w produkcji); bramek Tomka (wybor, lp_makiety-akcept,
ads_start, akcepty G6) NIGDY nie samo-akceptuj — reszta samoakcept operatora z logiem.
Lekcje natychmiast do SSOT. Commity jawną listą plików, po każdej fazie. Wgląd = panel /tn-sklepy.

Wariant „steward" (opcjonalnie dopisz): Potem wejdź w pętlę: co ~30 min sprawdzaj czy blokady
zewnętrzne ustąpiły (pl_dane, Leadsie, decyzje w panelu) i rób to, co się odblokowało (ScheduleWakeup).
```

---

## 🗺️ MAPA ETAPÓW I KROKÓW (co „wszystkie kroki" znaczy konkretnie)

Kolejność = `wf2_step_defs.sort`. `scope`: **project** = raz na sklep, **product** = per produkt.
🏁 = BRAMKA (decyzja/akcept Tomka — sesja NIE samo-akceptuje). 👤 = wymaga danych klienta.

### ETAP 1 — Fundament (dane, cena, marka, domena)
| krok | scope | co robi | kto/bramka |
|---|---|---|---|
| `wybor` | project | wybór produktów do sklepu | 🏁 Tomek (/trendy) |
| `kalkulacja` | product | cena detaliczna, koszt, marża (breakeven, próg zamówień) | auto |
| `marka` | project | nazwa marki, tożsamość | auto (kierunek kreatywny = moja decyzja) |
| `pl_domena` | project | zakup + podpięcie domeny (.pl, GoDaddy/RDAP-check) | auto |

### ETAP 2 — Landing per produkt (F0–F8, SSOT: STANDARD-LANDING-SKLEPY.md)
| krok | co robi |
|---|---|
| `lp_dane` (F0) | KARTA-PRAWDY: fakty+opinie z aukcji, ICP, MAPA-ZASTOSOWAN |
| `lp_plan` (F1) | plan sekcji, message-match, CONSTRAINTS |
| `lp_styl_marka` (F2.5) | tokeny, styl-master, favicon, marka wizualna |
| `lp_makiety` (F2) | 🏁 makiety desktop+mobile + KRYTYK (bramka akceptu makiet) |
| `lp_grafiki` (F3) | sceny (generacja/crop), wierność do makiet |
| `lp_kod` (F4) | kod HTML/CSS/JS, checkout-inline, interakcje |
| `lp_dopasowanie` (F7) | rubryka dopasowania kod↔makieta, LAYOUT 0 FAIL |
| `lp_zycie` (F5) | hero-video (Kling i2v), życie sceny |
| `lp_finisz` (F6/F8) | gate 0 FAIL, GESTALT F7.4 świeże oko, RETRO, koszty, status=gotowy |

### ETAP 3 — Sklep na platformie (Trevio) + go-live
| krok | scope | co robi | kto |
|---|---|---|---|
| `pl_sklep` | project | utworzenie sklepu na platformie | auto |
| `pl_branding` | project | logo, favicon, kolory na platformie | auto |
| `pl_dane` | project | dane sprzedawcy: adres, e-mail, NRB (COD), REGON, tożsamość | 👤 klient |
| `firma` | project | rejestracja/dane firmy klienta (krok ukryty PREVIEW_ONLY) | 👤 klient |
| `pl_dostawy` | project | metody i koszty dostaw | auto/👤 |
| `pl_prawne` | project | regulamin, zwroty, polityki (z danych pl_dane) | zależy 👤 |
| `pl_integracje` | project | integracje (płatności, analityka) | auto/👤 |
| `pl_konto_klient` | project | konto operatora-klienta | 👤 |
| `pl_produkt` | product | produkt na platformie (kasa działa) | auto |
| `pl_landing` | product | landing wpięty + GO-LIVE (custom domena = noindex zdjęty AUTO) | auto (po bramkach) |
| `pl_glowna` | project | strona główna sklepu (galeria gotowych produktów) | auto |
| `pl_test` | project | test end-to-end sklepu (sandbox/[Test]) | auto |

### ETAP 4 — Reklama: kreacje + konto + kampanie
**Kreacje (WYKONALNE TERAZ dla gotowych produktów — to „banery reklamowe" z uwag):**
| krok | scope | co robi | SSOT |
|---|---|---|---|
| `ads_grafiki` | project | pula grafik reklamowych sklepu | STANDARD-GRAFIKI-SKLEPY |
| `agr_brief`→`agr_generacja`→`agr_qa`→`agr_final` | product | BANERY/statyczne kreacje: brief→generacja→QA→final | ad-playbooks/, ad-forge.py |
| `avi_wzorzec`→`avi_blueprint`→`avi_klatki`→`avi_render_qa`→`avi_montaz`→`avi_final` | product | WIDEO reklamowe: wzorzec→blueprint→klatki→render QA→montaż→final | video-playbooks/, PROCEDURA-OPERATORA |
| `ads_wideo`, `ads_zestaw` | project/product | zestawy kreacji pod kampanie | — |

**Konto + kampanie (blokady: Leadsie/BM, budżet, sekret WF2_META_TOKEN, karta/2FA):**
`ads_konto` · `ads_strona` (FB+IG) · `ads_pixel` · `ads_budzet` · `ads_preflight` · `ads_kampanie` · `ads_start` 🏁 Tomek

### ETAP 5 — Optymalizacja / skalowanie / przejęcie
`ads_wyniki` · `ads_opieka` · `skalowanie` · `rotacja` · `monthly` · `sprzedaz_sync` · `test_wynik` ·
`przejecie_kampanii` · `przejecie_operacji` · `stery` · `wdrazanie` — pętla optymalizacyjna (+20%/tydz),
raporty, przekazanie sterów klientowi-operatorowi.

---

## 🎯 JAKOŚĆ — twardy próg (lekcje z realnych wpadek, żeby się nie powtórzyły)

1. **HERO = scena W TLE, nie pocztówka.** Full-bleed (TYP A): scena wypełnia sekcję, copy leży na
   niej na scrimie, produkt osadzony w świecie. Zakaz „split z obrazkiem w ramce w prawej kolumnie"
   jako domyślny hero. Hero projektowany POD hero-video (mp4 obowiązkowe, scena żyje w tle).
   TYP osadzenia: A=fade/full-frame; B,C tylko świadomie. [[feedback-hero-projektowany-pod-hero-video]]
   [[feedback-scena-typ-osadzenia-fullframe]]
2. **Kompletność sekcji.** MANIFEST SEKCJI: każda sekcja klasy DOWODOWEJ bez prawa SKIP.
   [[feedback-fabryka-manifest-sekcji-kompletnosc]] CTA szkielet bramkowany. Landing NIE ocenia
   produktu — sprzedaje. [[feedback-landing-nie-ocenia-produktu]]
3. **GESTALT F7.4 przed „gotowy".** Finalny ŻYWY render (desktop+mobile, hero gra, kasa) ogląda
   ŚWIEŻE OKO „oczami klienta". Werdykt czysty = warunek status=gotowy. [[projekt-fabryka-landingow-stan]]
4. **Zakres = wszystko wykonalne.** Nie jeden landing — WSZYSTKIE produkty buildowalne. Nie „infra
   gotowa" — pełna konfiguracja jaką da się zrobić. Banery reklamowe (agr_*) przygotowane z góry.
   Under-scope = wpadka. Rób maksimum, blokady wyłącznie tam gdzie naprawdę brak danych/decyzji.
5. **Publikuj co gotowe.** Skończony landing na custom domenie → GO-LIVE po spełnieniu bramek
   prawnych; nie zostawiaj gotowego produktu nieopublikowanym. (Przed go-live: usuń zapieczony
   JSON-LD `offers.price` — LL-048; cena żyje runtime przez `[data-price]`.)
6. **Optymalizacje bez pytania.** Widzisz poprawę → wprowadź i zaloguj, nie pytaj.
   [[feedback-fabryka-optymalizacje-bez-pytania]] [[feedback-fabryka-mandat-samodoskonalenia]]

## ✅ DEFINICJA „GOTOWE" (per etap)
- **Landing:** gate-check 0 FAIL · GESTALT czysty · hero-video gra · status=gotowy · zarchiwizowany.
- **Sklep:** sprytko.pl LIVE (home galeria) + /produkt LIVE (kasa działa) · brak placeholderów w
  produkcji (dane sprzedawcy = jedyny dopuszczalny brak → blokada klienta, jawnie oznaczona).
- **Kreacje:** zestaw banerów/wideo per produkt gotowy w Storage, czeka na konto ads.
- **Projekt:** wf2_steps = 0 wykonalnych; tabela blokad kompletna; raport + linki na karcie.

## 📦 FORMAT DOSTAWY
1. Emisja panel-sync po KAŻDEJ fazie (Tomek widzi postęp w /tn-sklepy na żywo).
2. Raport końcowy na kartę (wf2_notes): co zrobione autonomicznie · linki (home, landingi, kasy) ·
   TABELA BLOKAD · rekomendowane następne kroki.
3. Jeden PushNotification na koniec przebiegu.
4. Commity: jawna lista plików, po każdej fazie (git, deploy osobno przez push main).

# AUTOPILOT WF2 — jedno wywołanie: „dokończ projekt do 100%"

**Czym jest:** standardowy sposób uruchomienia sesji fabryki, która sama wykonuje WSZYSTKIE
wykonalne kroki projektu wf2 (wszystkich produktów) aż do stanu „100% albo wyłącznie blokady
zewnętrzne". Odpowiedź na pytanie Tomka (22.07): „jak dokładnie mam wywołać robienie wszystkich
kroków, które można zrobić".

## ⚡ PRZYCISK W PANELU (od 24.07) — „Zleć" (ikona robota)
W nagłówku projektu `tn-sklepy/projekt.html` (obok selecta statusu) jest mały przycisk
**„Zleć"** z ikoną robota. Modal pokazuje żywy spis kroków w 3 koszykach (🤖 wykonalne przez
agenta · 🏁 decyzje/bramki Tomka · 👤 po stronie klienta) policzony z `wf2_steps`/`wf2_step_defs`,
a przycisk **„Kopiuj polecenie autopilota"** składa gotową STOPKĘ SPAWNU z UUID projektu,
kontekstem, żywym zrzutem stanu i otwartymi uwagami — do wklejenia w nowej sesji Claude Code
(`c:\repos_tn\tn-crm`). „Tryb ciągły (steward)" = checkbox DOMYŚLNIE WŁĄCZONY (dokleja pętlę
ScheduleWakeup ~30 min; kończy dopiero na jawne polecenie Tomka).

**WZNOWIENIE PO PRZERWANIU:** każde skopiowanie loguje `wf2_activities(action='autopilot')` —
to kotwica. Ponowne otwarcie modala robi ŚWIEŻY odczyt `wf2_steps` z bazy (panel mógł stać
otwarty), pokazuje „poprzednie zlecenie + ile kroków ukończono od tego czasu + co ⏸w trakcie",
a polecenie dostaje blok „🔁 WZNOWIENIE PO PRZERWANIU": kroki in_progress = praca częściowa →
agent czyta checklisty/artefakty/repo i kontynuuje od pierwszej niezrobionej pozycji; sesja
padła przed syncem panelu → najpierw uzgodnienie stanu (artefakty vs checklisty), potem praca.
Czyli: klik „Zleć" po przerwaniu = kontynuacja dokładnie od miejsca przerwania, nigdy od zera.

Klasyfikacja NIE opiera się na `owner` (landingi/materiały mają `owner='admin'`, a wykonuje je
agent) — prawdziwe bramki człowieka są w jawnym zbiorze `AP_TOMEK_GATES` (wybór produktów ·
ads_start · wynik testu · skalowanie · rotacja · stery/wdrażanie/monthly); `AP_ACCEPT_STEPS` =
agent produkuje, człowiek domyka (lp_makiety/ads_grafiki → akcept, ads_kampanie → start,
ads_opieka → karty decyzji wf2_proposals). Uruchomienie sesji nadal jest ręczne (decyzja Tomka
2026-07-11: automatyzacja = prompty, nie Routines/API) — przycisk usuwa tylko składanie promptu.
Prawdziwie bezobsługowy „jeden klik = agent w chmurze rusza sam" wymaga toru B (edge trigger +
routine) i jest świadomie odłożony.

Poniżej pełna, kanoniczna wersja polecenia (przycisk generuje jej wariant zasilony danymi projektu):

## STOPKA SPAWNU (wklej do nowej sesji Claude Code w c:\repos_tn\tn-crm — to całe wywołanie)

```
AUTOPILOT WF2 — projekt <uuid-projektu-albo-slug>. Doprowadź projekt do 100% wykonalności.
Pętla: (1) przeczytaj wf2_steps projektu + produktów (jedyne źródło postępu) i CLAUDE.md sekcję
TN Sklepy; (2) zbuduj listę kroków WYKONALNYCH TERAZ (pending/in_progress, spełnione zależności,
bez bramek Tomka i bez danych, których nie ma); (3) wykonaj je w kolejności etapów wg SSOT danego
kroku (STANDARD-LANDING / STANDARD-GRAFIKI / PROCEDURA-OPERATORA / PRAWNE / STRONA-GLOWNA /
WORKFLOW-V2-TESTY §9), z bramkami jakości i emisjami panel-sync po KAŻDEJ fazie; (4) wróć do (1).
Kończysz DOPIERO gdy lista wykonalnych = 0. Wtedy wypisz TABELĘ BLOKAD: krok → czego brakuje →
kto odblokowuje (Tomek / klient / cron / sekret). Tryb autonomiczny: nie pytaj, samoakcepty
operatora z logiem (bramek Tomka G6/ads_start NIE samo-akceptuj), lekcje natychmiast do SSOT,
commity jawną listą plików. Zakazy twarde: NIE PSUJ TPAY, zero publikacji Meta, zero maili,
E2E checkout tylko sandbox/[Test], dokumenty z marżami tylko prywatne buckety, NIE zmyślaj danych
(brak = STOP z notą). Wgląd Tomka = panel /tn-sklepy — wszystko emituj tam na bieżąco.
```

Wariant ciągły (steward): po pierwszym przebiegu dodaj do promptu linijkę
„Potem wejdź w pętlę autonomiczną: co ~30 min sprawdzaj, czy blokady zewnętrzne ustąpiły
(pl_dane, Leadsie, decyzje w panelu) i wykonuj to, co się odblokowało" — sesja użyje
ScheduleWakeup i będzie sama wracać (tak działała sesja Zaradka).

## Skąd sesja wie „co jest wykonalne"
- `wf2_steps` = prawda o postępie; `wf2_step_defs.sort` = kolejność; kroki 🏁 z bramką Tomka
  (wybor, lp_makiety akcept, ads_start, akcepty G6) NIGDY nie są samo-akceptowane.
- Zależności twarde opisują SSOT-y kroków (np. ads_kampanie wymaga ads_preflight done;
  pl_prawne wymaga danych firmy z pl_dane; fabryka nie startuje bez work_consent i portfela).
- Blokady zewnętrzne raportowane w tabeli końcowej + PushNotification do Tomka (jeden ping).

## Dlaczego tym razem nie zrobiło się „wszystko samo" (lekcja Zaradka 22.07)
Kroki wykonywały się na jawne polecenia per obszar, a nie jedną pętlą „do wyczerpania" —
np. `pl_branding` (logo na platformę) leżał pending, mimo że dane były. AUTOPILOT WF2 zamyka tę
lukę: pętla po WSZYSTKICH krokach wszystkich etapów, nie po ostatnim poleceniu.

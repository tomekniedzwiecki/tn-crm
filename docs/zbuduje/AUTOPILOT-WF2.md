# AUTOPILOT WF2 — jedno wywołanie: „dokończ projekt do 100%"

**Czym jest:** standardowy sposób uruchomienia sesji fabryki, która sama wykonuje WSZYSTKIE
wykonalne kroki projektu wf2 (wszystkich produktów) aż do stanu „100% albo wyłącznie blokady
zewnętrzne". Odpowiedź na pytanie Tomka (22.07): „jak dokładnie mam wywołać robienie wszystkich
kroków, które można zrobić".

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

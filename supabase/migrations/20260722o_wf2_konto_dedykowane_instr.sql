-- Etap 4 „Środowisko reklamowe" — instructions_md kroku ads_konto: DOPISEK polityki dedykowanego
-- konta (22.07.2026). DECYZJA TOMKA (22.07, WIĄŻĄCA): klient z ISTNIEJĄCYM kontem reklamowym i tak
-- zakłada NOWE, DEDYKOWANE konto pod wspólny biznes. Powody: prepaid/płatności ręczne wybieralne tylko
-- przy 1. konfiguracji płatności (istniejącego z kartą nie przełączysz), czystość pomiaru/P&L (sync,
-- strażnik i spend_cap działają per konto), obca historia konta, izolacja automatów. Wyjątek = konto
-- „dziewicze". SSOT modułu: docs/zbuduje/ADS-ONBOARDING-LEADSIE.md §12.
--
-- DOPISUJEMY akapit do ISTNIEJĄCEJ treści (nie nadpisujemy całości — nic nie ścinamy). Idempotencja:
-- guard `not like '%dedykowane temu sklepowi%'` blokuje podwójny append przy ponownym apply. Kolejność
-- o > h (20260722h ustawia bazę ads_konto) → na świeżym apply baza istnieje, zanim ten append dołoży
-- akapit. UPDATE po key, bez zmian schematu.

update wf2_step_defs
set instructions_md = instructions_md || E'\n\n' ||
'Masz już konto reklamowe na Facebooku? Utwórz mimo to NOWE, dedykowane temu sklepowi — czyste pomiary sprzedaży i płatności ręczne (prepaid) da się ustawić tylko na świeżym koncie, a Twoich prywatnych kampanii nie mieszamy z naszymi. W kreatorze „Połącz konta reklamowe" wybierz opcję utworzenia nowego konta zamiast podpinać istniejące.'
where key = 'ads_konto'
  and instructions_md not like '%dedykowane temu sklepowi%';

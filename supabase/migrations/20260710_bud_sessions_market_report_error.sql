-- bud-raport: stempel definitywnego błędu generacji raportu + licznik nieudanych prób.
-- Cel: zamiast wiecznej pętli („generuję… za ~2 min") po padzie generacji, front
-- dostaje TRWAŁY stan błędu. bud-raport zlicza nieudane próby (market_report_fail_count)
-- i po wyczerpaniu limitu (MAX_GENERATIONS) utrwala krótki opis błędu w market_report_error.
-- bud-project.get zwraca market_report_error do frontu; jest czyszczony (NULL) przy
-- starcie nowej generacji oraz przy sukcesie.
ALTER TABLE bud_sessions ADD COLUMN IF NOT EXISTS market_report_error text;
ALTER TABLE bud_sessions ADD COLUMN IF NOT EXISTS market_report_fail_count integer NOT NULL DEFAULT 0;

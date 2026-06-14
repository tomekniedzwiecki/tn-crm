-- Beacon „wyszedł z ekranu generowania" dla precyzyjnego SMS powrotu.
-- left_screen_at = kiedy user opuścił kartę będąc na ekranie generowania
-- (badanie rynku / ekrany), left_screen = który to był ekran. spar-followups
-- wysyła SMS tylko gdy WIEMY, że wyszedł (a nie z samej heurystyki czasowej).
alter table spar_sessions add column if not exists left_screen_at timestamptz;
alter table spar_sessions add column if not exists left_screen text;

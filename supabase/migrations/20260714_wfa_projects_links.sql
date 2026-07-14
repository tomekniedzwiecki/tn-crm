-- Pasek „Podglądy" w panelu projektu TN App: linki do wszystkiego, co już da się obejrzeć
-- (design system w Claude Design, żywy deploy, galerie). Wypełniają sesje kroków (pkt 5
-- sekcji AKTUALIZACJA PANELU w promptach) + ręcznie przycisk „+ podgląd" w projekt.html.
-- Zaaplikowane przez MCP 2026-07-14 (przed pushem kodu).
ALTER TABLE wfa_projects ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '[]'::jsonb;

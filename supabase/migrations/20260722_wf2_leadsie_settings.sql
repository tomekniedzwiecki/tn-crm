-- 2026-07-22 — Etap 4 „Środowisko reklamowe": connect-link Leadsie (onboarding reklamowy).
-- Klucz trzyma BAZOWY URL requestu Leadsie (ich dashboard → Connect link, format v2).
-- Edge wf2-portal (service role) dokleja `customUserId=<wf2_projects.id>` i podaje klientowi
-- gotowy link „Połącz konta reklamowe" — front NIGDY nie czyta settings bezpośrednio.
-- Odbicie (partner access do BM Tomka 737839566050751) wraca webhookiem wf2-ads-connect
-- (gate `?s=WF2_LEADSIE_SECRET`), który odhacza checklistę ads_konto i loguje aktywność.
--
-- Pusty string (default) = przycisk się NIE renderuje → fallback: dotychczasowa checklista
-- bez zmian. Tomek wkleja właściwy URL w /settings (albo UPDATE), gdy request w Leadsie gotowy.
--
-- ⚠️ BEZ polityki anon: to NIE jest klucz z whitelisty czytelnej dla publishable key.
-- Odczyt wyłącznie service_role (edge) i team_member (RLS settings). Nie dodawać do anon-read.
INSERT INTO public.settings (key, value) VALUES ('wf2_leadsie_connect_url', '')
ON CONFLICT (key) DO NOTHING;

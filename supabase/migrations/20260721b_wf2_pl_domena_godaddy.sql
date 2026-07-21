-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — pl_domena: zakup domeny AUTOMATEM przez GoDaddy (2026-07-21)
--
-- DECYZJA TOMKA 21.07: koniec modelu „Tomek kupuje w LH.pl + ręczne wklejanie
-- rekordów w edytorze stref". Domenę parasolową kupuje FABRYKA (admin) przez edge
-- fn wfa-domain (GoDaddy Domains API, jak w tn-app), a rekordy DNS wpisuje automat
-- przez GoDaddy DNS API (nowe akcje dns_get/dns_set/dns_delete w wfa-domain).
-- NS zostają defaultowe GoDaddy (nsXX.domaincontrol.com) — strefą DNS zarządzamy
-- przez API GoDaddy (ODWROTNIE niż w tn-app, gdzie set_ns przełącza na Vercel).
-- Podłączenie do sklepu = wf2-platform add_domain/activate_domain (bez zmian),
-- aktywacja = strażnik w wf2-orders-sync (bez zmian).
--
-- Krok przestaje być kliencki (owner 'client' → 'admin'): wykonuje go sesja fabryki.
-- stage/sort/milestone_label/waits_external BEZ zmian (instancje wf2_steps kluczowane
-- po step_key — zmiana owner/instructions_md nie rusza stanu instancji).
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE public.wf2_step_defs SET
  owner = 'admin',
  instructions_md = 'Rejestruję adres internetowy sklepu i podłączam go do platformy — wszystko dzieje się po mojej stronie. Po propagacji DNS (do 48 h) domena włączy się automatycznie.'
WHERE key = 'pl_domena';

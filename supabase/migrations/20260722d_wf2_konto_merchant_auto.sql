-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — KROK 'pl_konto_klient': KLIENT → AUTOMAT FABRYKI (2026-07-22)
--
-- Krok powstał 20.07 (migracja 20260720c) jako zadanie KLIENTA („załóż konto
-- i podaj e-mail"). 21.07 weszła edge fn wf2-merchant (create_store) + decyzja
-- UX Tomka: konto merchanta zakłada FABRYKA na customer_email klienta (fallback
-- systemowy po 409), klient NICZEGO nie zakłada i nie dostaje hasła — portal
-- pokazuje kartę „Panel Twojego sklepu" z przyciskiem „Ustaw hasło".
-- Ten krok przechodzi na owner='admin' (wykonuje fabryka przy pl_sklep).
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE public.wf2_step_defs SET
  owner           = 'admin',
  label           = 'Konto merchanta',
  icon            = 'ph-user-circle-plus',
  milestone_label = NULL,
  instructions_md = 'AUTOMAT FABRYKI (od 21.07): konto merchanta + sklep tworzy edge wf2-merchant (create_store z {project_id} — konto na customer_email klienta; email zajęty w Trevio = 409 → adres systemowy <slug>@tomekniedzwiecki.pl + nota). Klient NICZEGO nie zakłada; w portalu dostaje kartę „Panel Twojego sklepu" (login + Ustaw hasło przez forgot-password). Dane logowania: wf2_merchant_accounts (service-role only).'
WHERE key = 'pl_konto_klient';

-- BACKFILL: projekt z platform_merchant_email = konto merchanta ISTNIEJE → done
UPDATE public.wf2_steps s
   SET status = 'done', completed_at = now(), completed_by = 'backfill'
  FROM public.wf2_projects p
 WHERE p.id = s.project_id
   AND s.step_key = 'pl_konto_klient'
   AND s.product_id IS NULL
   AND s.status <> 'done'
   AND p.platform_merchant_email IS NOT NULL;

-- ============================================================================
-- PROSPEKTOR B2B (wf2p) — PIPELINE: kadencja + własność + zadania + wysyłka
-- Rozdziela 3 warstwy (research pipeline agenta): lejek (status) / kadencja
-- (cadence_state — engagement) / własność (owner_mode). Kroki human → zadania
-- w kolejce Macieja (wf2p_tasks). Handoff na odpowiedź. Lock anty-dublujący.
-- Wysyłka: bot automatyczny, ale ZA master-switchem settings.wf2p_send_enabled.
-- Kontrakt: docs/zbuduje/PROSPEKTOR-SKLEPY-PLAN.md §7. Migracja addytywna.
-- ============================================================================

-- ── wf2p_sellers: warstwa engagement + ownership + zgoda ────────────────────
ALTER TABLE public.wf2p_sellers
  ADD COLUMN IF NOT EXISTS owner_mode          text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS assigned_to         text,
  ADD COLUMN IF NOT EXISTS cadence_id          text,
  ADD COLUMN IF NOT EXISTS cadence_step        integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cadence_state       text,
  ADD COLUMN IF NOT EXISTS next_action_at      timestamptz,
  ADD COLUMN IF NOT EXISTS next_action_channel text,
  ADD COLUMN IF NOT EXISTS locked_until        timestamptz,
  ADD COLUMN IF NOT EXISTS channels_tried      jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_inbound_at     timestamptz,
  ADD COLUMN IF NOT EXISTS last_inbound_channel text,
  ADD COLUMN IF NOT EXISTS consent             jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$ BEGIN
  ALTER TABLE public.wf2p_sellers ADD CONSTRAINT wf2p_sellers_owner_mode_check
    CHECK (owner_mode IN ('auto','human','hybrid'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.wf2p_sellers ADD CONSTRAINT wf2p_sellers_cadence_state_check
    CHECK (cadence_state IS NULL OR cadence_state IN ('active','paused','finished','nurture','opted_out'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Lejek: dodaj etap 'odpowiedzial' (handoff = twardy kamień milowy) + 'nurture' (recykling).
ALTER TABLE public.wf2p_sellers DROP CONSTRAINT IF EXISTS wf2p_sellers_status_check;
ALTER TABLE public.wf2p_sellers ADD CONSTRAINT wf2p_sellers_status_check
  CHECK (status IN ('nowy','research','oceniony','zaakceptowany','kontakt',
                    'odpowiedzial','rozmowa','deal','nurture','odpadl','opt_out'));

CREATE INDEX IF NOT EXISTS wf2p_sellers_next_action_idx ON public.wf2p_sellers (next_action_at)
  WHERE cadence_state = 'active';
CREATE INDEX IF NOT EXISTS wf2p_sellers_owner_idx ON public.wf2p_sellers (owner_mode, assigned_to);

-- ── wf2p_tasks — kolejka zadań handlowca (kroki human + reply-handling) ─────
CREATE TABLE IF NOT EXISTS public.wf2p_tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id     uuid NOT NULL REFERENCES public.wf2p_sellers(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  channel       text NOT NULL,                         -- linkedin|telefon|email_imienny|email
  type          text NOT NULL CHECK (type IN ('first_touch','follow_up','reply_handling','call_back')),
  assigned_to   text,
  due_at        timestamptz,
  priority      integer NOT NULL DEFAULT 0,            -- lead_score × segment × świeżość
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','done','skipped','canceled','snoozed')),
  snoozed_until timestamptz,
  context       text,                                  -- „po co ten task" (np. „odpowiedział mailem: …")
  outcome       text CHECK (outcome IS NULL OR outcome IN ('connected','no_answer','positive','negative','meeting_booked')),
  source_step   text,                                  -- indeks/nazwa kroku kadencji
  done_at       timestamptz
);
CREATE INDEX IF NOT EXISTS wf2p_tasks_queue_idx ON public.wf2p_tasks (status, due_at, priority DESC);
CREATE INDEX IF NOT EXISTS wf2p_tasks_seller_idx ON public.wf2p_tasks (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS wf2p_tasks_assigned_idx ON public.wf2p_tasks (assigned_to, status);

-- ── wf2p_outbox — wysłane maile (auto-send; wzorzec wfp_outbox) ──────────────
CREATE TABLE IF NOT EXISTS public.wf2p_outbox (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   uuid REFERENCES public.wf2p_sellers(id) ON DELETE SET NULL,
  kind        text NOT NULL CHECK (kind IN ('first','second','reply')),
  to_email    text NOT NULL,
  subject     text,
  body        text,
  resend_id   text,
  in_reply_to text,
  status      text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed','queued')),
  error       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wf2p_outbox_seller_idx ON public.wf2p_outbox (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS wf2p_outbox_daily_idx ON public.wf2p_outbox (created_at) WHERE status = 'sent';

-- ── wf2p_suppression — trwała lista wykluczeń (przeżywa usunięcie prospekta) ─
CREATE TABLE IF NOT EXISTS public.wf2p_suppression (
  email_lower text PRIMARY KEY,
  reason      text NOT NULL CHECK (reason IN ('opt_out','complaint','manual','bounce')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── RLS: tylko zespół (team_members) — ZERO anon (wzorzec wf2p) ──────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['wf2p_tasks','wf2p_outbox','wf2p_suppression']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_team_all', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
       USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))
       WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))',
      t || '_team_all', t);
  END LOOP;
END $$;

-- ── SEED: stopka prawna RODO art. 14 (doklejana serwerowo przy wysyłce) ──────
INSERT INTO public.settings (key, value) VALUES
('wf2p_stopka_prawna', $wf2p$--
{{DANE_NADAWCY}}

Skąd mam Twój adres: dane firmy (nazwę i adres e-mail) pozyskałem z publicznie dostępnych źródeł — z Allegro, strony internetowej firmy oraz rejestrów publicznych. Administratorem tych danych jest nadawca wiadomości. Cel kontaktu: nawiązanie współpracy biznesowej (B2B). Podstawa prawna: uzasadniony interes administratora (art. 6 ust. 1 lit. f RODO). Masz prawo dostępu do danych, ich sprostowania, usunięcia i ograniczenia przetwarzania, a także prawo sprzeciwu i skargi do Prezesa UODO. Dane przechowuję do wniesienia sprzeciwu, nie dłużej niż 3 lata od ostatniego kontaktu.

Nie chcesz kolejnych wiadomości? Odpisz jednym słowem: STOP. Usuwam Cię z listy natychmiast.$wf2p$)
ON CONFLICT (key) DO NOTHING;

-- ── Komentarze ──────────────────────────────────────────────────────────────
COMMENT ON TABLE public.wf2p_tasks       IS 'Prospektor B2B: kolejka zadań handlowca (Maciej) — kroki human kadencji + reply_handling. Priorytet = score×segment×świeżość.';
COMMENT ON TABLE public.wf2p_outbox      IS 'Prospektor B2B: wysłane maile (auto-send bota za settings.wf2p_send_enabled). Wzorzec wfp_outbox.';
COMMENT ON TABLE public.wf2p_suppression IS 'Prospektor B2B: trwała lista wykluczeń (opt_out/complaint/bounce). Przeżywa usunięcie sprzedawcy. Sprawdzana przez OBIE warstwy przed każdą wysyłką.';
COMMENT ON COLUMN public.wf2p_sellers.owner_mode    IS 'Kto trzyma leada: auto (bot) / human (Maciej) / hybrid (bot draftuje, człowiek akceptuje).';
COMMENT ON COLUMN public.wf2p_sellers.cadence_state IS 'Warstwa engagement (ortogonalna do status): active/paused/finished/nurture/opted_out.';
COMMENT ON COLUMN public.wf2p_sellers.locked_until  IS 'Anty-dublowanie: 1 akcja outbound w locie na leada (auto NIE planuje, gdy otwarty task human i odwrotnie).';
COMMENT ON COLUMN public.wf2p_sellers.consent       IS 'Zgoda/podstawa PKE per kanał: {email:{basis,source,at}, telefon:{...}, linkedin:{...}}.';

-- Zwolnie etaty — leady z formularza /zwolnie na tomekniedzwiecki.pl
--
-- Formularz: 6 krokow (email, kontakt, firma+branza, zespol, pensje, budzet, opis+attach).
-- Zapis raz na submit ("Wyslij brief"). Brak resume po tokenie (klient generuje UUID po stronie clienta).
-- Slack: kanal #zwolnie_lead (osobny webhook `slack_webhook_zwolnie_lead`).

-- =====================================================
-- 1. TABELE
-- =====================================================

CREATE TABLE public.zwolnie_leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source          text NOT NULL DEFAULT 'zwolnie_form',
  status          text NOT NULL DEFAULT 'new',

  -- Kontakt
  contact_name    text,
  contact_email   text,
  contact_phone   text,

  -- Firma
  company         text,
  website         text,
  industry        text,   -- ecommerce|uslugi|produkcja|handel-b2b|tech|prawo|finanse|medyczne|inna

  -- Skala
  team_size       text,   -- 1-5|6-15|16-50|51-150|150+
  payroll         text,   -- <50k|50-150k|150-500k|500k-1.5M|1.5M+|nie-chce
  budget          text,   -- <20k|20-50k|50-150k|150-500k|500k+|nie-wiem

  -- Brief
  problem         text,
  notes           text,   -- notatki admina

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_zwolnie_leads_email   ON public.zwolnie_leads (contact_email);
CREATE INDEX idx_zwolnie_leads_status  ON public.zwolnie_leads (status);
CREATE INDEX idx_zwolnie_leads_created ON public.zwolnie_leads (created_at DESC);

CREATE TABLE public.zwolnie_lead_attachments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           uuid NOT NULL REFERENCES public.zwolnie_leads(id) ON DELETE CASCADE,
  file_name         text NOT NULL,
  file_type         text,
  file_size         bigint,
  storage_path      text NOT NULL,
  uploaded_by_role  text NOT NULL DEFAULT 'anon',
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_zwolnie_lead_attachments_lead ON public.zwolnie_lead_attachments (lead_id);

-- =====================================================
-- 2. TRIGGER updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.zwolnie_leads_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_zwolnie_leads_updated_at
BEFORE UPDATE ON public.zwolnie_leads
FOR EACH ROW EXECUTE FUNCTION public.zwolnie_leads_set_updated_at();

-- =====================================================
-- 3. RLS — zwolnie_leads
-- =====================================================

ALTER TABLE public.zwolnie_leads ENABLE ROW LEVEL SECURITY;

-- Anon: tylko INSERT (publiczny formularz). Brak SELECT/UPDATE/DELETE.
CREATE POLICY zwolnie_leads_anon_insert
  ON public.zwolnie_leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated (admin CRM): pelny dostep.
CREATE POLICY zwolnie_leads_auth_all
  ON public.zwolnie_leads FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- =====================================================
-- 4. RLS — zwolnie_lead_attachments
-- =====================================================

ALTER TABLE public.zwolnie_lead_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY zwolnie_lead_attachments_anon_insert
  ON public.zwolnie_lead_attachments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY zwolnie_lead_attachments_auth_all
  ON public.zwolnie_lead_attachments FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- =====================================================
-- 5. STORAGE BUCKET + POLICIES
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('zwolnie-attachments', 'zwolnie-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Anon moze uploadowac tylko do prefiksu leads/* (bez listowania, bez czytania)
CREATE POLICY zwolnie_storage_anon_upload
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'zwolnie-attachments'
    AND (storage.foldername(name))[1] = 'leads'
  );

-- Authenticated (admin CRM): pelny dostep do bucketu
CREATE POLICY zwolnie_storage_auth_select
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'zwolnie-attachments');

CREATE POLICY zwolnie_storage_auth_delete
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'zwolnie-attachments');

CREATE POLICY zwolnie_storage_auth_update
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'zwolnie-attachments')
  WITH CHECK (bucket_id = 'zwolnie-attachments');

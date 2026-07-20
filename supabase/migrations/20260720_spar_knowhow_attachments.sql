-- ── Załączniki spowiednika (know-how): prywatny bucket + odczyt dla zespołu ──
-- Klient w trybie „Dopracowanie wizji" dodaje PDF/PNG/JPG spinaczem w czacie
-- (spar-chat: eventy knowhow_attach_init / knowhow_attach_done). Pliki klientów
-- bywają wrażliwe (biznesplany, cenniki) → bucket PRIVATE, wzorzec wfa-intake
-- (20260713c): upload przez createSignedUploadUrl z edge (service-role), odczyt
-- w panelu tn-aplikacje przez createSignedUrl z JWT zespołu (policy niżej).
-- allowed_mime_types = nieomijalna warstwa (SEC-R3-UPLOAD): tylko formaty,
-- które ekstrakcja umie przeczytać; ZERO text/html i svg (Stored XSS).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('spar-knowhow', 'spar-knowhow', false, 20971520, ARRAY[
  'application/pdf',
  'image/png', 'image/jpeg'
])
ON CONFLICT (id) DO NOTHING;

-- Panel tn-aplikacje (Baza wiedzy) pobiera pliki signed URL-em z JWT zalogowanego
-- członka zespołu. UWAGA: authenticated ≠ zespół (klienci sparingu też mają konta!)
-- → twardy warunek team_members, jak w RLS tabel wfa_*/wf2_*.
DO $$ BEGIN
  CREATE POLICY "spar_knowhow_team_read" ON storage.objects FOR SELECT TO authenticated
    USING (
      bucket_id = 'spar-knowhow'
      AND EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- spar_usage: nowy rodzaj kosztu 'attach' (odczyt załącznika przez model).
-- Constraint kind_check był poszerzany poza repo (żywa lista ≠ migracje) →
-- poszerzamy DYNAMICZNIE z zachowaniem wszystkich obecnych wartości.
DO $$
DECLARE def text;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO def
    FROM pg_constraint
   WHERE conname = 'spar_usage_kind_check' AND conrelid = 'public.spar_usage'::regclass;
  IF def IS NULL THEN
    ALTER TABLE public.spar_usage ADD CONSTRAINT spar_usage_kind_check
      CHECK (kind = ANY (ARRAY['chat','plan','image','landing','raport','attach']));
  ELSIF def NOT LIKE '%''attach''%' THEN
    ALTER TABLE public.spar_usage DROP CONSTRAINT spar_usage_kind_check;
    def := replace(def, 'ARRAY[', 'ARRAY[''attach''::text, ');
    EXECUTE 'ALTER TABLE public.spar_usage ADD CONSTRAINT spar_usage_kind_check ' || def;
  END IF;
END $$;

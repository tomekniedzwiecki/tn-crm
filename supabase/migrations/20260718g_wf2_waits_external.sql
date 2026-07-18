-- Kroki czekające na świat zewnętrzny (zakup domeny, propagacja DNS) nie mogą
-- okupować banera „Następny krok" niezależnie od ownera (audyt wizualny 18.07).
-- Panel: nextStep() odracza in_progress gdy owner!='admin' LUB waits_external.
ALTER TABLE public.wf2_step_defs
  ADD COLUMN IF NOT EXISTS waits_external boolean NOT NULL DEFAULT false;

UPDATE public.wf2_step_defs SET waits_external = true WHERE key = 'pl_domena';

-- Pozwala anon czytac numer WhatsApp do podziekowania na tomekniedzwiecki.pl/zapisy
-- Bez tego kazdy zapis nie pobierze dynamicznego numeru i fallbackuje na 793113898

CREATE POLICY "Anon can read zapisy whatsapp phone"
ON public.settings
FOR SELECT
TO anon
USING (key = 'zapisy_whatsapp_phone');

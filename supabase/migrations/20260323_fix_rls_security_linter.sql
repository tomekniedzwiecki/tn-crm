-- Fix Supabase linter security warnings
-- Tables: whatsapp_api_keys, product_images

-- ==========================================
-- 1. whatsapp_api_keys - NIE JEST UZYWANA w kodzie
--    Klucz API jest w Supabase Secrets (WHATSAPP_SYNC_KEY)
--    Wlaczamy RLS i blokujemy dostep - tabela moze byc usunieta w przyszlosci
-- ==========================================

ALTER TABLE IF EXISTS public.whatsapp_api_keys ENABLE ROW LEVEL SECURITY;

-- Blokujemy caly dostep przez API (tylko service_role moze dostac)
-- Nie tworzymy zadnych policies = nikt nie ma dostepu przez PostgREST

-- ==========================================
-- 2. product_images - galeria zdjec produktow
--    Nie jest uzywana w kodzie (brak referencji w HTML/JS)
--    Ale gdyby byla - obrazki powinny byc publiczne do odczytu
-- ==========================================

ALTER TABLE IF EXISTS public.product_images ENABLE ROW LEVEL SECURITY;

-- Authenticated moze wszystko (CRUD)
CREATE POLICY "Authenticated full access" ON public.product_images
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Anon moze czytac (obrazki produktow sa publiczne)
CREATE POLICY "Public read access" ON public.product_images
  FOR SELECT
  USING (true);

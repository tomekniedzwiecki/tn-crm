-- Hardening generatorów lejka /sklep (2026-07-02, backlog T1/T6/T7/T10)
-- ZASTOSOWANE RĘCZNIE przez MCP 2026-07-02 — plik jest lustrem dla repo.

-- T6: claim generacji raportu per-PRODUKT (dwóch userów na tym samym nowym
-- produkcie nie może palić 2× gpt-5.5+web_search)
ALTER TABLE bud_product_packages ADD COLUMN IF NOT EXISTS generating_at timestamptz;

-- T7: prewarm ujęć lifestyle (bud-mockup odpala je przy makietach, bud-landing-gen reużywa)
ALTER TABLE bud_sessions ADD COLUMN IF NOT EXISTS landing_lifestyle jsonb;

-- T10: marker alertów sweepa martwych generacji (bud-drip) w bud_usage
ALTER TABLE bud_usage DROP CONSTRAINT bud_usage_kind_check;
ALTER TABLE bud_usage ADD CONSTRAINT bud_usage_kind_check CHECK (kind = ANY (ARRAY['chat','plan','image','landing','raport','prototype','economics','gtm','email','assess','brand','demand','products','mockup','ads','calc','brand-names','sms','radar','img-verify','ali-snapshot','alert']));

-- T6: atomowy claim wiersza produktu — pierwszy user generuje, drugi dostaje pending
-- i jego poll trafia w cache, gdy pierwszy skończy. TTL chroni przed crashem bez release.
CREATE OR REPLACE FUNCTION public.bud_claim_product_gen(p_key text, p_name text, p_category text, p_ttl_sec integer)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH ins AS (
    INSERT INTO bud_product_packages (product_key, product_name, category, generating_at, updated_at)
    VALUES (p_key, p_name, p_category, now(), now())
    ON CONFLICT (product_key) DO UPDATE
      SET generating_at = now(), updated_at = now()
      WHERE bud_product_packages.report IS NULL
        AND (bud_product_packages.generating_at IS NULL
             OR bud_product_packages.generating_at < now() - make_interval(secs => p_ttl_sec))
    RETURNING 1
  ) SELECT count(*) > 0 FROM ins;
$$;

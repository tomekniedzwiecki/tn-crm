-- 2026-06-15 — Naprawa atrybucji konwersji na checkout/success.html.
-- Po zawężeniu leads do team_members (i braku polityki anon na lead_tracking) embed
-- orders->leads(lead_tracking(...)) zwracał null -> event purchase tracił gclid/fbclid/
-- ttclid/utm -> Google/Meta/TikTok nie podpinały konwersji. RPC (SECURITY DEFINER) zwraca
-- WYŁĄCZNIE parametry atrybucji dla danego order_id (zero PII), bez otwierania leads/lead_tracking.
CREATE OR REPLACE FUNCTION public.order_conversion_tracking(p_order_id uuid)
RETURNS TABLE (
  gclid text, gbraid text, wbraid text, gad_source text,
  fbclid text, ttclid text, utm_source text, utm_medium text, network text
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lt.gclid, lt.gbraid, lt.wbraid, lt.gad_source,
         lt.fbclid, lt.ttclid, lt.utm_source, lt.utm_medium, lt.network
  FROM public.orders o
  JOIN public.lead_tracking lt ON lt.lead_id = o.lead_id
  WHERE o.id = p_order_id
  ORDER BY lt.created_at DESC NULLS LAST
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.order_conversion_tracking(uuid) TO anon, authenticated;

-- Etap 4 „Środowisko reklamowe" — tor Leadsie UŚPIONY (decyzja Tomka 22.07.2026).
-- Flow klienta = WYŁĄCZNIE ścieżka ręczna (SSOT: docs/zbuduje/ADS-ONBOARDING-LEADSIE.md §13).
-- Przepisuje instructions_md kroków ads_konto/ads_strona na flow RĘCZNY (lustro nowych CLIENT_WS
-- w tn-sklepy/portal.html) + drobna korekta warunku wejścia w ads_preflight (bez wzmianki Leadsie).
-- ads_budzet NIE ruszany (już prepaid, bez Leadsie — migracja 20260722m).
-- Infrastruktura Leadsie (edge wf2-ads-connect, sekret, webhook, settings.wf2_leadsie_connect_url='')
-- ZOSTAJE zdeployowana jako uśpiona na wypadek powrotu — nie kasujemy.
-- UPDATE po key = idempotentne; brak zmian schematu.

update wf2_step_defs set instructions_md =
'Konto reklamowe zakładasz i udostępniasz nam ręcznie w Menedżerze firmy (Meta Business Suite) — portal prowadzi Cię przez 5 kroków z gotowymi linkami: (1) utwórz portfolio biznesowe; (2) utwórz NOWE konto reklamowe i od razu ustaw walutę PLN oraz strefę Europe/Warsaw (tego NIE DA SIĘ później zmienić); (3) wybierz płatności ręczne (BLIK / przelew / PayU); (4) w sekcji „Partnerzy" nadaj nam dostęp, wpisując numer 737839566050751 i zaznaczając konto reklamowe + stronę + Instagram z uprawnieniem „Zarządzaj"; (5) wklej w portalu ID konta reklamowego (act_…). Dodaj metodę płatności i włącz weryfikację dwuetapową na swoim profilu. Przygotuj dokumenty firmy (NIP, wpis CEIDG) — Meta czasem prosi o weryfikację i wtedy liczy się czas. Masz już konto reklamowe? Załóż mimo to NOWE, dedykowane temu sklepowi — dzięki temu pomiary sprzedaży są czyste, a płatności ręczne (prepaid) da się włączyć tylko na świeżym koncie.'
where key = 'ads_konto';

update wf2_step_defs set instructions_md =
'Stronę firmy na Facebooku tworzysz ręcznie: wejdź na facebook.com/pages/create, nadaj nazwę marki i kategorię „Sklep". Potem uzupełnij: logo i zdjęcie w tle (dostaniesz od nas), sekcję „Informacje" z danymi firmy i linkiem do sklepu oraz 3–6 postów (materiały podeślemy). Dostęp do strony nadajesz nam w tym samym kroku „Partnerzy" co konto reklamowe — przy nadawaniu dostępu zaznacz także stronę. Instagram jest opcjonalny na start — reklamy na Instagramie działają z Twojej strony na Facebooku. Nie kupuj lajków — kilka rzetelnych postów wystarczy.'
where key = 'ads_strona';

-- ads_preflight: usunięcie wzmianki „Leadsie" z warunku wejścia (bez zmiany sensu — konto+strona
-- udostępnione do BM Tomka i token aktywny). Instrukcja techniczna panelu, nie idzie do portalu.
update wf2_step_defs set instructions_md =
'Bramka 0 braków przed kampaniami. Automaty po WF2_META_TOKEN: mikro-wydatek schodzi, Account Quality, limit konta. Ręcznie: blocklista komentarzy PL na stronę (ADS-BLOCKLISTA-PL.md), naming [WF2:klient] + utm_id={{ad.id}}, plan struktury 1 kampania = 1 produkt = 1 ad set (ABO, broad, Advantage+). Warunek wejścia: konto + strona udostępnione do BM Tomka + token aktywny.'
where key = 'ads_preflight';

-- ── Migracja STANU checklisty (data->checklist) po przemianowaniu pozycji (klucz deduplikacji) ──
-- Przemianowaliśmy 3 pozycje ads_* (usunięcie „(Leadsie — automat)"). Stany zapisane PRZED zmianą
-- muszą dostać nowy tekst, inaczej panel pokaże sieroty (stara odhaczona + nowa pusta).
-- Idempotentne: guard @> po STARYM tekście — powtórzenie nie znajduje wierszy.

update wf2_steps s
set data = jsonb_set(s.data, '{checklist}', (
  select jsonb_agg(
    case when e->>'t' = 'Strona FB istnieje i udostępniona do BM Tomka (Leadsie — automat)'
         then jsonb_set(e, '{t}', to_jsonb('Strona FB udostępniona do BM Tomka'::text))
         else e end)
  from jsonb_array_elements(s.data->'checklist') e))
where s.step_key = 'ads_strona'
  and s.data ? 'checklist'
  and s.data->'checklist' @> '[{"t":"Strona FB istnieje i udostępniona do BM Tomka (Leadsie — automat)"}]'::jsonb;

update wf2_steps s
set data = jsonb_set(s.data, '{checklist}', (
  select jsonb_agg(
    case when e->>'t' = 'Konto reklamowe istnieje i połączone (Leadsie — automat)'
         then jsonb_set(e, '{t}', to_jsonb('Konto reklamowe utworzone i udostępnione do BM Tomka'::text))
         when e->>'t' = 'Partner access do BM Tomka — nadany przez Leadsie (automat)'
         then jsonb_set(e, '{t}', to_jsonb('Partner access do BM Tomka — pełna kontrola nadana'::text))
         else e end)
  from jsonb_array_elements(s.data->'checklist') e))
where s.step_key = 'ads_konto'
  and s.data ? 'checklist'
  and (s.data->'checklist' @> '[{"t":"Konto reklamowe istnieje i połączone (Leadsie — automat)"}]'::jsonb
    or s.data->'checklist' @> '[{"t":"Partner access do BM Tomka — nadany przez Leadsie (automat)"}]'::jsonb);

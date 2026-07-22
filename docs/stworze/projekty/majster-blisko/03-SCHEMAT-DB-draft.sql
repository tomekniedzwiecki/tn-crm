-- 03-SCHEMAT-DB — Majster Blisko (nazwa robocza) — DRAFT sesji fabryki (tor „schemat_db", 2026-07-22)
-- =============================================================================
-- TYLKO tabele NISZY (prefiks `mb_`). FUNDAMENT startera NIE jest tu dublowany:
--   • profiles (id/email/full_name/role user|operator/lifecycle_status/stripe_customer_id/jtbd/is_test/
--     activated_at/last_active_at/terms_*/marketing_opt_out/referral_*) — migracja 0001/0003/0004/0005/0006/0015/0018
--   • is_operator() (SECURITY DEFINER, bez rekurencji RLS)         — 0001
--   • handle_new_user() (trigger auth.users → profiles)            — 0001/0003/0005
--   • stripe_events (INBOX), email_log                             — 0001
--   • app_events (metryki aha/aktywacji), rate_limits + rl_hit(), feedback — 0003
--   • client_errors, app_settings (kill_*), ai_usage (rozliczenie AI pass-through) — 0005/0015
--   • referrals/changelog/edge_logs/nbp_usd_rates                   — 0009/0014/0017/0015
-- STAN ABONAMENTU (aktywny/paying/past_due) = profiles.lifecycle_status + stripe_customer_id (starter).
--   Tu dokładamy WYŁĄCZNIE niszowy detal abonamentu (powiaty, sloty pracowników) — mb_abonamenty*.
-- ROZLICZENIE AI (transkrypcja głosu A-04 + podsumowanie ustaleń) = starter ai_usage (area='transkrypcja'
--   /'podsumowanie', billable=pass-through na operatora). NIE tworzymy własnej tabeli AI.
--
-- Aplikuje krok `Schemat DB` (NIE ten tor). Krok `paczka_cc` przenosi plik do brief/03-SCHEMAT-DB.sql.
-- Zasady RLS (lekcje fabryki, WIĄŻĄCE):
--   • RLS ENABLED na KAŻDEJ tabeli; polityki S/I/U/D OSOBNO; per auth.uid().
--   • ŻADNEGO `using(true)` dla authenticated na danych userów (feedback-shared-supabase-authenticated-not-admin).
--     Wyjątek: statyczny słownik TERYT (dane referencyjne, zero PII, zapis tylko service-role/seed) — jawnie skomentowany.
--   • Tabele POTOMNE: WITH CHECK sprawdza WŁASNOŚĆ RODZICA (feedback-rls-potomne-with-check-parent-ownership).
--   • RLS chroni WIERSZ, nie kolumnę (feedback-rls-row-not-column-privs): dane wrażliwe (telefon klienta,
--     dokładny adres) izolujemy do OSOBNYCH tabel/funkcji SECURITY DEFINER, nie „ukrywamy kolumny politykami".
--   • Funkcje w politykach = SECURITY DEFINER + STABLE (omijają RLS → brak rekurencji, jak is_operator).
-- Komentarze po polsku. NIC nie jest tu aplikowane do żadnej bazy — TYLKO plik.
-- =============================================================================


-- =============================================================================
-- SEKCJA 0 — TYPY (JAWNE ENUM-y) + funkcje pomocnicze
-- =============================================================================

do $$ begin
  -- rola w niszy (survey wybiera STRONĘ; NIE myli się z profiles.role user|operator)
  create type mb_rola_niszy as enum ('klient','fachowiec','wlasciciel_firmy','pracownik_firmy');
  -- typ wykonawcy (badge D-10)
  create type mb_typ_wykonawcy as enum ('firma','prywatny');
  -- dokument sprzedaży (D-10): wystawia / potrzeba
  create type mb_dokument as enum ('faktura','rachunek','brak');
  -- wariant terminu zlecenia (K1)
  create type mb_termin as enum ('asap','konkretny','elastyczny');
  -- MASZYNA STANÓW ZLECENIA (patrz tabela przejść przy mb_zlecenia)
  create type mb_zlecenie_status as enum
    ('robocze','opublikowane','wybrano_wykonawce','w_realizacji',
     'oznaczone_zakonczone','zakonczone','w_sporze','anulowane');
  -- status oferty (K2/F1) — w tym „wybrano innego"
  create type mb_oferta_status as enum
    ('zlozona','wybrana','wybrano_innego','wycofana','wygasla');
  -- typ wyceny w ofercie (D-06: widełki ALBO oględziny)
  create type mb_wycena as enum ('widelki','ogledziny');
  -- widoczność odpowiedzi klienta na pytanie (D-02)
  create type mb_widocznosc_odp as enum ('publiczna','tylko_pytajacy');
  -- typ wiadomości komunikatora (W2)
  create type mb_wiadomosc_typ as enum ('tekst','zdjecie','glos','dokument');
  -- powód rezygnacji (D-14; lista usprawiedliwionych + 'inny' = potencjalnie nieuzasadniony)
  create type mb_rezygnacja_powod as enum ('zmiana_zakresu','niebezpieczne_warunki','nagla_choroba_awaria','inny');
  -- typ sporu/zgłoszenia (D-09/O1)
  create type mb_spor_typ as enum
    ('drugie_odrzucenie','zgloszenie_nieobecnosci','naduzycie_pilnych_sms','zakwestionowana_rezygnacja','inne_naduzycie');
  -- status sporu
  create type mb_spor_status as enum ('otwarty','oczekuje_odpowiedzi','rozstrzygniety','zamkniety_bez_rozstrzygniecia');
  -- decyzja operatora (D-09)
  create type mb_spor_decyzja as enum ('uznano','odrzucono','zamknieto_bez_rozstrzygniecia');
  -- plan abonamentu niszy (D-13)
  create type mb_abonament_plan as enum ('fachowiec','firma');
  -- okres rozliczeniowy
  create type mb_abonament_okres as enum ('miesiac','rok');
  -- status abonamentu niszy (lustro Stripe)
  create type mb_abonament_status as enum ('aktywny','past_due','wygasl','anulowany');
  -- tryb obsługi zleceń w firmie (F2/D-12)
  create type mb_tryb_przydzialu as enum ('wlasciciel','samodzielny');
  -- kierunek oceny dwustronnej (W3)
  create type mb_kierunek_oceny as enum ('klient_ocenia_fachowca','fachowiec_ocenia_klienta');
exception when duplicate_object then null; end $$;

-- ── Haversine (odległość w KM z centroidów; A-05, D-01) — IMMUTABLE (indeksowalna, cache'owalna) ──
create or replace function public.mb_haversine(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision
language sql immutable parallel safe
as $$
  -- promień Ziemi 6371 km; klasyczny haversine, wynik w kilometrach
  select 2 * 6371 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2)
    + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

-- Uniwersalny „touch" updated_at
create or replace function public.mb_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;


-- =============================================================================
-- SEKCJA 1 — SŁOWNIK LOKALIZACJI (statyczny TERYT; A-05, D-01) — city-agnostic
-- =============================================================================
-- Seed = miasto startu operatora + powiaty ościenne (BLOKADA B-01; schemat gotowy bez seeda).
-- Zapis WYŁĄCZNIE seedem/service-role. Odczyt PUBLICZNY (dane referencyjne, zero PII) — patrz RLS niżej.

-- Powiaty — jednostka OBSZARU i JEDNOSTKA SPRZEDAŻY abonamentu (D-01/D-13).
create table mb_powiaty (
  id           bigint generated always as identity primary key,
  teryt        text not null unique,                 -- kod TERYT powiatu (4 cyfry)
  nazwa        text not null,
  wojewodztwo  text not null,
  lat          double precision,                     -- centroid (fallback, gdy zlecenie bez miasta/dzielnicy)
  lng          double precision,
  aktywny      boolean not null default true,        -- czy w zasięgu launchu (miasto startu)
  created_at   timestamptz not null default now()
);
create index on mb_powiaty (wojewodztwo, nazwa);

-- Miasta/gminy w powiecie.
create table mb_miasta (
  id          bigint generated always as identity primary key,
  powiat_id   bigint not null references mb_powiaty(id) on delete cascade,
  teryt       text unique,                           -- kod TERYT miejscowości (opcjonalny)
  nazwa       text not null,
  lat         double precision not null,             -- centroid (do haversine na kartach)
  lng         double precision not null,
  created_at  timestamptz not null default now()
);
create index on mb_miasta (powiat_id, nazwa);

-- Dzielnice (dla dużych miast; centroid dokładniejszy niż miasto).
create table mb_dzielnice (
  id          bigint generated always as identity primary key,
  miasto_id   bigint not null references mb_miasta(id) on delete cascade,
  powiat_id   bigint not null references mb_powiaty(id) on delete cascade,  -- denorm pod filtry
  nazwa       text not null,
  lat         double precision not null,
  lng         double precision not null,
  created_at  timestamptz not null default now()
);
create index on mb_dzielnice (miasto_id, nazwa);


-- =============================================================================
-- SEKCJA 2 — KATEGORIE PRAC (K1; D-03/D-05)
-- =============================================================================
-- Zamknięta lista + „Inna praca". Kategorii GAZ i AWARYJNE OTWIERANIE NIE seedujemy (D-05) —
-- ich brak w tabeli = ich brak w formularzu. wymaga_uprawnien=true tylko dla Elektryki (D-03).
create table mb_kategorie (
  id               bigint generated always as identity primary key,
  slug             text not null unique,             -- hydraulika|elektryka|zlota_raczka|malowanie|montaz|slusarsko_budowlane|inna
  nazwa            text not null,
  wymaga_uprawnien boolean not null default false,   -- Elektryka instalacyjna → true (bramka SEP D-04)
  sort             int not null default 0,
  aktywna          boolean not null default true
);

insert into mb_kategorie (slug, nazwa, wymaga_uprawnien, sort) values
  ('hydraulika',        'Hydraulika',                    false, 10),
  ('elektryka',         'Elektryka (instalacja)',         true, 20),  -- D-03: flaga „wymaga uprawnień" (SEP)
  ('zlota_raczka',      'Złota rączka',                  false, 30),
  ('malowanie',         'Malowanie',                     false, 40),
  ('montaz',            'Montaż',                        false, 50),
  ('slusarsko_budowlane','Drobne prace ślusarskie i budowlane', false, 60),
  ('inna',              'Inna praca',                    false, 99)
on conflict (slug) do nothing;


-- =============================================================================
-- SEKCJA 3 — PROFILE NISZY (rozszerzenie profiles; W1)
-- =============================================================================

-- 3.1 mb_profiles — 1:1 z auth.users. Wspólne pola obu stron. telefon = OBOWIĄZKOWY (A-02).
--     Profil pokazuje WYŁĄCZNIE imię (bez nazwiska). Telefon NIE jest tu czytany cross-user —
--     ujawnienie po wyborze oferty realizuje funkcja mb_kontakt_zlecenia() (SEKCJA 12).
create table mb_profiles (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  rola_niszy         mb_rola_niszy not null default 'klient',
  imie               text not null default '',        -- TYLKO imię (D: bez nazwiska)
  telefon            text not null default '',        -- E.164; obowiązkowy do ujawnienia + pilnych SMS
  telefon_verified_at timestamptz,                    -- weryfikacja OTP (A-02)
  ostrzezenie_aktywne boolean not null default false, -- „ostrzeżenie o kliencie/stronie" po 3 nieuzasadnionych (W3) — patrz WĄTPLIWOŚĆ #3
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index on mb_profiles (rola_niszy);
create trigger trg_mb_profiles_touch before update on mb_profiles
  for each row execute function public.mb_touch_updated_at();

-- 3.2 mb_klient_profiles — lokalizacja klienta (domyślna; W1/HANDOFF §5).
create table mb_klient_profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  wojewodztwo  text not null default '',
  powiat_id    bigint references mb_powiaty(id) on delete set null,
  miasto_id    bigint references mb_miasta(id) on delete set null,
  dzielnica_id bigint references mb_dzielnice(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_mb_klient_profiles_touch before update on mb_klient_profiles
  for each row execute function public.mb_touch_updated_at();

-- 3.3 mb_firmy — firma usługowa (właściciel = owner_user_id). D-10/D-12/F2.
create table mb_firmy (
  id             bigint generated always as identity primary key,
  owner_user_id  uuid not null references auth.users(id) on delete cascade,
  nazwa          text not null,
  nip            text,                                 -- opcjonalny (D-10)
  tryb_przydzialu mb_tryb_przydzialu not null default 'wlasciciel',  -- F2: właściciel przydziela / pracownicy sami
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on mb_firmy (owner_user_id);
create trigger trg_mb_firmy_touch before update on mb_firmy
  for each row execute function public.mb_touch_updated_at();

-- 3.4 mb_fachowiec_profiles — profil fachowca (indywidualny LUB pracownik/właściciel firmy).
--     Obszar (opłacone powiaty) NIE jest tu — wynika z abonamentu (mb_abonament_powiaty). Specjalizacje = join niżej.
--     Samodeklaracja SEP z numerem i DATĄ WAŻNOŚCI (D-04). Score/rzetelność (D-11) — cache liczony triggerem.
create table mb_fachowiec_profiles (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  firma_id           bigint references mb_firmy(id) on delete set null,  -- null = fachowiec indywidualny
  typ                mb_typ_wykonawcy not null default 'prywatny',       -- badge Firma/Osoba prywatna (D-10)
  photo_url          text,                              -- zdjęcie (Storage)
  wystawia_dokument  mb_dokument not null default 'brak',                -- faktura/rachunek/brak (D-10)
  -- Samodeklaracja SEP (D-04): tylko przy specjalizacji „Elektryka"; platforma NIE weryfikuje dokumentu
  sep_zadeklarowany  boolean not null default false,
  sep_numer          text,                              -- widoczny na profilu (D-04)
  sep_wazne_do       date,                              -- świadectwa SEP są terminowe (5 lat) — kontrola ważności
  -- Wskaźnik rzetelności (D-11) — cache; SSOT liczy mb_recompute_score()
  score              int not null default 100 check (score between 25 and 100),
  score_updated_at   timestamptz not null default now(),
  realizacje_count   int not null default 0,            -- poprawnie zakończone realizacje (cache)
  rating_avg         numeric(3,2) not null default 0,   -- średnia gwiazdek (cache; NIE zależy od score)
  rating_count       int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index on mb_fachowiec_profiles (firma_id);
create index on mb_fachowiec_profiles (score desc);         -- sort ofert: score DESC, czas ASC (D-11)
create trigger trg_mb_fachowiec_profiles_touch before update on mb_fachowiec_profiles
  for each row execute function public.mb_touch_updated_at();

-- 3.5 mb_fachowiec_specjalizacje — N:M fachowiec ↔ kategoria (filtr widoczności zleceń, F1).
create table mb_fachowiec_specjalizacje (
  user_id     uuid not null references auth.users(id) on delete cascade,
  kategoria_id bigint not null references mb_kategorie(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, kategoria_id)
);

-- 3.6 mb_fachowiec_wybrane_powiaty — powiaty „zainteresowania" do SKRÓCONEGO PODGLĄDU BEZ abonamentu (F1/aha fachowca).
--     Oddzielone od mb_abonament_powiaty (opłacone). Napędza widok mb_zlecenia_podglad.
create table mb_fachowiec_wybrane_powiaty (
  user_id    uuid not null references auth.users(id) on delete cascade,
  powiat_id  bigint not null references mb_powiaty(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, powiat_id)
);

-- 3.7 mb_firma_sloty — SLOT pracownika = opłacone miejsce (D-12). Rotacja osób = mb_firma_obsady.
create table mb_firma_sloty (
  id          bigint generated always as identity primary key,
  firma_id    bigint not null references mb_firmy(id) on delete cascade,
  label       text not null default '',
  created_at  timestamptz not null default now()
);
create index on mb_firma_sloty (firma_id);

-- 3.8 mb_firma_obsady — HISTORIA obsady slotu (D-12: przypisanie zmienne w czasie; historia zostaje do sporów).
--     Aktywna obsada = aktywna=true. Odchodzący traci dostęp; jego oceny znikają z profilu PUBLICZNEGO firmy
--     (flaga mb_oceny.ukryta_z_profilu ustawiana przy zwolnieniu), ale wiersz historii ZOSTAJE.
create table mb_firma_obsady (
  id                 bigint generated always as identity primary key,
  slot_id            bigint not null references mb_firma_sloty(id) on delete cascade,
  firma_id           bigint not null references mb_firmy(id) on delete cascade,  -- denorm pod RLS/indeks
  pracownik_user_id  uuid not null references auth.users(id) on delete cascade,
  aktywna            boolean not null default true,
  od                 timestamptz not null default now(),
  do_                timestamptz,                        -- ustawiane przy zwolnieniu
  created_at         timestamptz not null default now()
);
-- Jeden aktywny pracownik na slot.
create unique index mb_firma_obsady_jeden_aktywny on mb_firma_obsady (slot_id) where aktywna;
create index on mb_firma_obsady (firma_id, aktywna);
create index on mb_firma_obsady (pracownik_user_id, aktywna);


-- =============================================================================
-- SEKCJA 4 — ABONAMENTY NISZY: powiaty + sloty (F2/D-12/D-13; A-06)
-- =============================================================================
-- LUSTRO Stripe Subscriptions (zapisywane przez stripe-processor, service-role). „Czy aktywny" dla RLS
-- czytamy stąd (mb_ma_aktywny_abonament). Stan płatności ogólny nadal = profiles.lifecycle_status.

create table mb_abonamenty (
  id                    bigint generated always as identity primary key,
  owner_user_id         uuid not null references auth.users(id) on delete cascade,  -- fachowiec indyw. lub właściciel firmy
  firma_id              bigint references mb_firmy(id) on delete set null,          -- null = plan indywidualny
  plan                  mb_abonament_plan not null default 'fachowiec',
  okres                 mb_abonament_okres not null default 'miesiac',
  status                mb_abonament_status not null default 'aktywny',
  stripe_subscription_id text,                            -- sub_… (idempotencja procesora)
  powiaty_bazowe        int not null default 2,           -- 2 w cenie (D-13)
  powiaty_dodatkowe     int not null default 0,           -- +19 zł/mies. każdy (quantity Stripe)
  pracownicy_dodatkowi  int not null default 0,           -- +39 zł/mies. każdy slot (quantity Stripe)
  current_period_start  timestamptz,
  current_period_end    timestamptz,                      -- po wygaśnięciu → spadek do skróconego podglądu
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index on mb_abonamenty (owner_user_id, status);
create index on mb_abonamenty (firma_id) where firma_id is not null;
create trigger trg_mb_abonamenty_touch before update on mb_abonamenty
  for each row execute function public.mb_touch_updated_at();

-- Przypisanie POWIATÓW do abonamentu (D-01/D-12). Bazowe zmieniane przy ODNOWIENIU; dodatkowe aktywne
-- natychmiast z proracją i mają własne aktywny_od/aktywny_do (po wyłączeniu działa do końca okresu).
create table mb_abonament_powiaty (
  id           bigint generated always as identity primary key,
  abonament_id bigint not null references mb_abonamenty(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,  -- denorm pod RLS/indeks (kto ma dostęp)
  powiat_id    bigint not null references mb_powiaty(id) on delete cascade,
  typ          text not null default 'bazowy' check (typ in ('bazowy','dodatkowy')),
  aktywny_od   timestamptz not null default now(),
  aktywny_do   timestamptz,                               -- null = do końca okresu abonamentu
  created_at   timestamptz not null default now()
);
create unique index on mb_abonament_powiaty (abonament_id, powiat_id);
create index on mb_abonament_powiaty (owner_user_id, powiat_id);


-- =============================================================================
-- SEKCJA 5 — ZLECENIA (K1) + MASZYNA STANÓW
-- =============================================================================
-- ── JAWNA MASZYNA STANÓW (enum mb_zlecenie_status). Dozwolone przejścia: ──────────────────────────
--   robocze            → opublikowane            (klient publikuje; walidacja min: kategoria+lokalizacja+opis/zdjęcie+termin)
--   opublikowane       → wybrano_wykonawce       (klient wybiera ofertę → ujawnienie telefonu, pozostałe oferty „wybrano_innego")
--   opublikowane       → anulowane               (klient anuluje przed wyborem)
--   wybrano_wykonawce  → w_realizacji            (PODWÓJNA akceptacja ustaleń — D-07; ogłoszenie zablokowane)
--   wybrano_wykonawce  → opublikowane            (rezygnacja wybranego fachowca → przywrócenie ofert, K2)
--   w_realizacji       → oznaczone_zakonczone    (fachowiec oznacza „zakończone" → completed_marked_at=now(), licznik 4 dni D-08)
--   w_realizacji       → opublikowane            (rezygnacja fachowca w realizacji → przywrócenie ofert)
--   oznaczone_zakonczone → zakonczone            (klient potwierdza LUB auto-zamknięcie po 4 dobach D-08)
--   oznaczone_zakonczone → w_realizacji          (1. odrzucenie zakończenia: powód+zdjęcie → wraca do realizacji, D-09)
--   oznaczone_zakonczone → w_sporze              (2. odrzucenie → kolejka operatora, D-09)
--   w_sporze           → zakonczone | w_realizacji | anulowane   (decyzja operatora, D-09)
-- Egzekwowanie przejść: edge functions (service-role) + WITH CHECK/CHECK; tu utrwalamy strukturę i licznik.
-- ─────────────────────────────────────────────────────────────────────────────────────────────────
create table mb_zlecenia (
  id                 bigint generated always as identity primary key,
  klient_user_id     uuid not null references auth.users(id) on delete cascade,
  kategoria_id       bigint not null references mb_kategorie(id),
  opis               text not null default '',
  -- Lokalizacja OGÓLNA (dokładny adres → mb_zlecenie_kontakt, ujawniany po wyborze):
  wojewodztwo        text not null default '',
  powiat_id          bigint not null references mb_powiaty(id),   -- wynika ze słownika (miasto→powiat)
  miasto_id          bigint references mb_miasta(id),
  dzielnica_id       bigint references mb_dzielnice(id),
  -- Termin (K1):
  termin_typ         mb_termin not null default 'asap',
  termin_data        date,                                 -- gdy termin_typ='konkretny'
  -- Dokument (K1/D-10):
  potrzebny_dokument mb_dokument not null default 'brak',
  wymaga_uprawnien   boolean not null default false,       -- denorm z kategorii (bramka SEP przy ofercie, D-04)
  -- Stan:
  status             mb_zlecenie_status not null default 'robocze',
  wybrana_oferta_id  bigint,                               -- FK dodany po utworzeniu mb_oferty (patrz niżej)
  wybrany_fachowiec_user_id uuid references auth.users(id) on delete set null,
  telefon_ujawniony_at timestamptz,                        -- moment ujawnienia kontaktu (po wyborze)
  -- Realizacja / auto-zamknięcie (D-08):
  completed_marked_at timestamptz,                         -- start licznika 4 dni (moment „zakończone" przez fachowca)
  odrzucenia_count   int not null default 0,               -- 0/1/2 (2 → w_sporze, D-09)
  closed_at          timestamptz,
  closed_reason      text check (closed_reason in ('potwierdzone','auto','spor','anulowane')),
  -- Metryka zasięgu (K1: „Twoje zlecenie widzi N fachowców w powiecie X"):
  zasieg_fachowcow   int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- Spójność: konkretny termin wymaga daty
  constraint mb_zlecenia_termin_data_chk check (termin_typ <> 'konkretny' or termin_data is not null)
);
create index on mb_zlecenia (powiat_id, status, created_at desc);   -- GŁÓWNY indeks pod listę dnia fachowca (F1)
create index on mb_zlecenia (klient_user_id, created_at desc);      -- „moje zlecenia" (K1)
create index on mb_zlecenia (kategoria_id, powiat_id) where status = 'opublikowane';
create index on mb_zlecenia (completed_marked_at)
  where status = 'oznaczone_zakonczone';                            -- cron auto-zamknięcia (D-08)
create index on mb_zlecenia (wybrany_fachowiec_user_id) where wybrany_fachowiec_user_id is not null;
create trigger trg_mb_zlecenia_touch before update on mb_zlecenia
  for each row execute function public.mb_touch_updated_at();

-- BEFORE INSERT/UPDATE: derywacja powiatu z miasta/dzielnicy + flagi uprawnień z kategorii (deterministycznie).
create or replace function public.mb_zlecenie_derive()
returns trigger language plpgsql
security definer set search_path = public as $$
begin
  -- powiat wynika ze słownika (D-01): dzielnica > miasto > (podany powiat)
  if new.dzielnica_id is not null then
    select powiat_id into new.powiat_id from public.mb_dzielnice where id = new.dzielnica_id;
  elsif new.miasto_id is not null then
    select powiat_id into new.powiat_id from public.mb_miasta where id = new.miasto_id;
  end if;
  -- flaga „wymaga uprawnień" z kategorii (D-03) — źródło prawdy, nie z frontu
  select wymaga_uprawnien into new.wymaga_uprawnien from public.mb_kategorie where id = new.kategoria_id;
  return new;
end $$;
revoke all on function public.mb_zlecenie_derive() from public, anon, authenticated;
create trigger trg_mb_zlecenie_derive before insert or update of miasto_id, dzielnica_id, kategoria_id
  on mb_zlecenia for each row execute function public.mb_zlecenie_derive();

-- Zdjęcia zlecenia (K1; Storage — trzymamy ścieżkę, nie plik).
create table mb_zlecenie_zdjecia (
  id           bigint generated always as identity primary key,
  zlecenie_id  bigint not null references mb_zlecenia(id) on delete cascade,
  klient_user_id uuid not null references auth.users(id) on delete cascade,  -- denorm pod RLS (właściciel rodzica)
  storage_path text not null,                            -- bucket/obiekt w Supabase Storage
  sort         int not null default 0,
  created_at   timestamptz not null default now()
);
create index on mb_zlecenie_zdjecia (zlecenie_id, sort);

-- DOKŁADNY ADRES — izolowany do osobnej tabeli (RLS row-level: pełny wiersz wrażliwy).
-- Widzą TYLKO: właściciel zlecenia, WYBRANY wykonawca, operator. „Klient przekazuje adres wybranemu" (K2).
create table mb_zlecenie_kontakt (
  zlecenie_id   bigint primary key references mb_zlecenia(id) on delete cascade,
  klient_user_id uuid not null references auth.users(id) on delete cascade,
  adres_dokladny text not null default '',
  uwagi_dojazd  text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_mb_zlecenie_kontakt_touch before update on mb_zlecenie_kontakt
  for each row execute function public.mb_touch_updated_at();


-- =============================================================================
-- SEKCJA 6 — PYTANIA I ODPOWIEDZI (F1/K2; D-02)
-- =============================================================================
-- Pytania zadaje FACHOWIEC (zawsze publiczne). Odpowiada KLIENT — z przełącznikiem widoczności (D-02).
create table mb_pytania (
  id               bigint generated always as identity primary key,
  zlecenie_id      bigint not null references mb_zlecenia(id) on delete cascade,
  fachowiec_user_id uuid not null references auth.users(id) on delete cascade,  -- autor pytania
  tresc            text not null check (char_length(tresc) between 1 and 2000),
  created_at       timestamptz not null default now()
);
create index on mb_pytania (zlecenie_id, created_at);

create table mb_odpowiedzi (
  id           bigint generated always as identity primary key,
  pytanie_id   bigint not null references mb_pytania(id) on delete cascade,
  zlecenie_id  bigint not null references mb_zlecenia(id) on delete cascade,   -- denorm pod RLS/indeks
  klient_user_id uuid not null references auth.users(id) on delete cascade,    -- autor = właściciel zlecenia
  tresc        text not null check (char_length(tresc) between 1 and 2000),
  widocznosc   mb_widocznosc_odp not null default 'publiczna',                 -- D-02: domyślnie publiczna
  created_at   timestamptz not null default now()
);
create index on mb_odpowiedzi (pytanie_id);
create index on mb_odpowiedzi (zlecenie_id);


-- =============================================================================
-- SEKCJA 7 — OFERTY (F1/K2; D-06/D-10/D-11)
-- =============================================================================
create table mb_oferty (
  id            bigint generated always as identity primary key,
  zlecenie_id   bigint not null references mb_zlecenia(id) on delete cascade,
  fachowiec_user_id uuid not null references auth.users(id) on delete cascade,
  firma_id      bigint references mb_firmy(id) on delete set null,  -- gdy oferuje w imieniu firmy
  wycena        mb_wycena not null default 'widelki',               -- widełki ALBO oględziny (D-06)
  cena_min      numeric(10,2),                                      -- brutto PLN (gdy wycena='widelki')
  cena_max      numeric(10,2),
  termin_propozycja text not null default '',                       -- propozycja terminu (tekst, K2)
  wiadomosc     text not null default '',
  dokument      mb_dokument not null default 'brak',                -- deklaracja faktury/rachunku (D-10)
  status        mb_oferta_status not null default 'zlozona',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Widełki wymagają cen (i min<=max); oględziny bez cen:
  constraint mb_oferty_widelki_chk check (
    (wycena = 'widelki'   and cena_min is not null and cena_max is not null and cena_min <= cena_max)
    or (wycena = 'ogledziny' and cena_min is null and cena_max is null)
  )
);
-- Jedna AKTYWNA oferta fachowca na zlecenie (może po wycofaniu złożyć ponownie).
create unique index mb_oferty_jedna_aktywna on mb_oferty (zlecenie_id, fachowiec_user_id)
  where status = 'zlozona';
create index on mb_oferty (zlecenie_id, status);
create index on mb_oferty (fachowiec_user_id, created_at desc);
create trigger trg_mb_oferty_touch before update on mb_oferty
  for each row execute function public.mb_touch_updated_at();

-- Domknięcie FK zlecenie.wybrana_oferta_id (po istnieniu mb_oferty).
alter table mb_zlecenia
  add constraint mb_zlecenia_wybrana_oferta_fk
  foreign key (wybrana_oferta_id) references mb_oferty(id) on delete set null;


-- =============================================================================
-- SEKCJA 8 — KOMUNIKATOR (W2) — uruchamiany PO wyborze wykonawcy
-- =============================================================================
-- Wątek per (zlecenie, fachowiec). Aktywny jest wątek wybranego wykonawcy.
create table mb_watki (
  id               bigint generated always as identity primary key,
  zlecenie_id      bigint not null references mb_zlecenia(id) on delete cascade,
  fachowiec_user_id uuid not null references auth.users(id) on delete cascade,
  klient_user_id   uuid not null references auth.users(id) on delete cascade,  -- denorm pod RLS
  last_message_at  timestamptz,
  created_at       timestamptz not null default now(),
  unique (zlecenie_id, fachowiec_user_id)
);
create index on mb_watki (fachowiec_user_id);
create index on mb_watki (klient_user_id);

create table mb_wiadomosci (
  id            bigint generated always as identity primary key,
  watek_id      bigint not null references mb_watki(id) on delete cascade,
  zlecenie_id   bigint not null references mb_zlecenia(id) on delete cascade,  -- denorm pod indeks/RLS
  nadawca_user_id uuid not null references auth.users(id) on delete cascade,
  typ           mb_wiadomosc_typ not null default 'tekst',
  tresc         text not null default '',                -- treść tekstu / opis załącznika
  storage_path  text,                                    -- zdjęcie/głos/dokument (Storage)
  transkrypcja  text,                                    -- głos → tekst (OpenAI, A-04)
  transkrypcja_edytowana boolean not null default false, -- etykieta „edytowano" (W2)
  edited        boolean not null default false,          -- edycja treści tekstowej
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on mb_wiadomosci (watek_id, created_at);
create trigger trg_mb_wiadomosci_touch before update on mb_wiadomosci
  for each row execute function public.mb_touch_updated_at();

-- ── PILNE SMS (A-03/A-07): limit 2/24h per strona; blokada 2 dni po potwierdzonym nadużyciu ──
-- mb_pilne_sms = LOG (tabela zliczeń): count z ostatnich 24h = źródło limitu. Wysyłkę robi edge fn
-- send-sms po sprawdzeniu mb_pilne_sms_dozwolone() (SEKCJA 12).
create table mb_pilne_sms (
  id             bigint generated always as identity primary key,
  zlecenie_id    bigint not null references mb_zlecenia(id) on delete cascade,
  nadawca_user_id uuid not null references auth.users(id) on delete cascade,
  odbiorca_user_id uuid not null references auth.users(id) on delete cascade,
  tresc          text not null default '',
  wyslany        boolean not null default false,          -- czy SMS faktycznie poszedł (po przejściu limitu)
  created_at     timestamptz not null default now()
);
create index on mb_pilne_sms (nadawca_user_id, created_at desc);  -- okno 24h per strona

-- Blokady nadawcy (2 dni) po decyzji operatora (D-09).
create table mb_pilne_sms_blokady (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  od           timestamptz not null default now(),
  do_          timestamptz not null default (now() + interval '2 days'),
  powod        text not null default '',
  spor_id      bigint,                                    -- FK dodany po mb_spory
  operator_user_id uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index on mb_pilne_sms_blokady (user_id, do_ desc);


-- =============================================================================
-- SEKCJA 9 — PODSUMOWANIE USTALEŃ (W2; D-07)
-- =============================================================================
-- WERSJONOWANE. Każda edycja = nowa wersja. Akceptacja OSOBNO per strona (wskazuje zaakceptowaną wersję).
-- Nowa wersja czyni starą akceptację drugiej strony „nieaktualną" (zaakceptowana_wersja < max) → RESET.
-- Podwójna akceptacja = obie strony mają zaakceptowana_wersja = max(wersja) → zlecenie w_realizacji.
create table mb_ustalenia (
  id            bigint generated always as identity primary key,
  zlecenie_id   bigint not null references mb_zlecenia(id) on delete cascade,
  watek_id      bigint references mb_watki(id) on delete set null,
  wersja        int not null,
  tresc         text not null default '',                 -- treść AI (A-04) + ręczne poprawki
  autor_edycji_user_id uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (zlecenie_id, wersja)
);
create index on mb_ustalenia (zlecenie_id, wersja desc);

create table mb_ustalenia_akceptacje (
  zlecenie_id        bigint not null references mb_zlecenia(id) on delete cascade,
  strona_user_id     uuid not null references auth.users(id) on delete cascade,
  strona             text not null check (strona in ('klient','fachowiec')),
  zaakceptowana_wersja int not null,                      -- wskazuje mb_ustalenia.wersja
  zaakceptowano_at   timestamptz not null default now(),
  primary key (zlecenie_id, strona_user_id)
);


-- =============================================================================
-- SEKCJA 10 — REALIZACJA: odrzucenia zakończenia (W2; D-08/D-09)
-- =============================================================================
-- Oznaczenie „zakończone" i licznik 4 dni żyją na mb_zlecenia (completed_marked_at). Tu — historia ODRZUCEŃ.
create table mb_odrzucenia_zakonczenia (
  id           bigint generated always as identity primary key,
  zlecenie_id  bigint not null references mb_zlecenia(id) on delete cascade,
  klient_user_id uuid not null references auth.users(id) on delete cascade,
  kolejnosc    int not null check (kolejnosc in (1,2)),   -- 2 → w_sporze (D-09)
  powod        text not null default '',
  zdjecie_path text,                                      -- opcjonalny dowód (Storage)
  created_at   timestamptz not null default now(),
  unique (zlecenie_id, kolejnosc)
);
create index on mb_odrzucenia_zakonczenia (zlecenie_id);


-- =============================================================================
-- SEKCJA 11 — OCENY + REZYGNACJE + SCORE (W3; D-11/D-12/D-14)
-- =============================================================================

-- Oceny DWUSTRONNE (1–5 + komentarz), powiązane z ZAKOŃCZONYM zleceniem. Widoczne imię autora.
-- ukryta_z_profilu: D-12 — po odejściu pracownika jego oceny znikają z PUBLICZNEGO profilu firmy (historia zostaje).
create table mb_oceny (
  id            bigint generated always as identity primary key,
  zlecenie_id   bigint not null references mb_zlecenia(id) on delete cascade,
  autor_user_id uuid not null references auth.users(id) on delete cascade,
  odbiorca_user_id uuid not null references auth.users(id) on delete cascade,
  kierunek      mb_kierunek_oceny not null,
  gwiazdki      int not null check (gwiazdki between 1 and 5),
  komentarz     text not null default '',
  firma_id      bigint references mb_firmy(id) on delete set null,  -- gdy oceniany działał w imieniu firmy
  ukryta_z_profilu boolean not null default false,                  -- D-12 (odejście pracownika)
  created_at    timestamptz not null default now(),
  unique (zlecenie_id, autor_user_id)                               -- 1 ocena na autora per zlecenie
);
create index on mb_oceny (odbiorca_user_id) where not ukryta_z_profilu;
create index on mb_oceny (firma_id) where firma_id is not null;

-- Rezygnacje (D-14). Powód z listy usprawiedliwionych + opis + opcjonalny dowód nie obniża wskaźnika.
-- Druga strona może ZAKWESTIONOWAĆ → kolejka operatora (D-09). usprawiedliwiona: null=niezweryfikowana.
create table mb_rezygnacje (
  id                bigint generated always as identity primary key,
  zlecenie_id       bigint not null references mb_zlecenia(id) on delete cascade,
  rezygnujacy_user_id uuid not null references auth.users(id) on delete cascade,
  firma_id          bigint references mb_firmy(id) on delete set null,
  powod             mb_rezygnacja_powod not null default 'inny',
  opis              text not null default '',
  dowod_path        text,                                  -- opcjonalny dowód (Storage)
  usprawiedliwiona  boolean,                               -- null=niezweryfikowana; false=nieuzasadniona (−25, D-11)
  zakwestionowana   boolean not null default false,
  spor_id           bigint,                                -- FK dodany po mb_spory
  created_at        timestamptz not null default now()
);
create index on mb_rezygnacje (rezygnujacy_user_id, created_at desc);
create index on mb_rezygnacje (zlecenie_id);


-- =============================================================================
-- SEKCJA 12 — SPORY / ZGŁOSZENIA (O1; D-09) — kolejka operatora
-- =============================================================================
create table mb_spory (
  id               bigint generated always as identity primary key,
  typ              mb_spor_typ not null,
  zlecenie_id      bigint references mb_zlecenia(id) on delete set null,
  zglaszajacy_user_id uuid references auth.users(id) on delete set null,
  druga_strona_user_id uuid references auth.users(id) on delete set null,
  opis             text not null default '',
  dowod_path       text,
  odpowiedz_termin timestamptz,                            -- 48h na stanowisko drugiej strony (D-09)
  status           mb_spor_status not null default 'otwarty',
  decyzja          mb_spor_decyzja,                        -- uznano/odrzucono/zamknieto (D-09)
  decyzja_adnotacja text not null default '',
  decyzja_operatora_user_id uuid references auth.users(id) on delete set null,
  decyzja_at       timestamptz,
  skutek           jsonb not null default '{}'::jsonb,     -- co wykonano automatycznie (odblok. oceny, blokada SMS, korekta score)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index on mb_spory (status, created_at);
create index on mb_spory (zlecenie_id);
create trigger trg_mb_spory_touch before update on mb_spory
  for each row execute function public.mb_touch_updated_at();

-- Stanowiska stron (oś sporu; D-09).
create table mb_spor_stanowiska (
  id          bigint generated always as identity primary key,
  spor_id     bigint not null references mb_spory(id) on delete cascade,
  strona_user_id uuid not null references auth.users(id) on delete cascade,
  tresc       text not null default '',
  dowod_path  text,
  created_at  timestamptz not null default now()
);
create index on mb_spor_stanowiska (spor_id);

-- Domknięcie FK-ów wskazujących na mb_spory.
alter table mb_pilne_sms_blokady
  add constraint mb_pilne_sms_blokady_spor_fk foreign key (spor_id) references mb_spory(id) on delete set null;
alter table mb_rezygnacje
  add constraint mb_rezygnacje_spor_fk foreign key (spor_id) references mb_spory(id) on delete set null;


-- =============================================================================
-- SEKCJA 13 — POWIADOMIENIA (W3; A-07)
-- =============================================================================
-- In-app (tabela + badge). E-mail (Resend) i SMS (pilne) idą przez edge/starter — tu stan in-app + ustawienia.
create table mb_powiadomienia (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  typ          text not null,                             -- np. oferta_otrzymana|wybrano|nowe_zlecenie|zakonczenie|spor
  tytul        text not null default '',
  tresc        text not null default '',
  zlecenie_id  bigint references mb_zlecenia(id) on delete cascade,
  przeczytane_at timestamptz,
  created_at   timestamptz not null default now()
);
create index on mb_powiadomienia (user_id, created_at desc);
create index on mb_powiadomienia (user_id) where przeczytane_at is null;  -- badge (nieprzeczytane)

-- Ustawienia kanałów per user + dni/godziny doręczeń fachowca (A-07). Wszystkie kanały domyślnie ON.
create table mb_powiadomienia_ustawienia (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  kanal_inapp   boolean not null default true,
  kanal_email   boolean not null default true,
  kanal_sms     boolean not null default true,
  -- Fachowiec: dni/godziny doręczeń (bez narzuconej ciszy nocnej):
  dni_tygodnia  int[] not null default '{1,2,3,4,5,6,7}',   -- 1=pon … 7=niedz
  godzina_od    time not null default '00:00',
  godzina_do    time not null default '23:59',
  updated_at    timestamptz not null default now()
);
create trigger trg_mb_pow_ust_touch before update on mb_powiadomienia_ustawienia
  for each row execute function public.mb_touch_updated_at();


-- =============================================================================
-- SEKCJA 14 — FUNKCJE POMOCNICZE RLS (SECURITY DEFINER, STABLE) — omijają RLS → brak rekurencji
-- =============================================================================
-- Wzór utwardzenia jak is_operator (0001): revoke od public/anon, grant tylko authenticated (RLS je woła).

-- Czy user ma AKTYWNY abonament niszy (F2) — bramka pełnego dostępu do rynku.
create or replace function public.mb_ma_aktywny_abonament(p_user uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.mb_abonamenty a
    where a.owner_user_id = p_user
      and a.status = 'aktywny'
      and (a.current_period_end is null or a.current_period_end > now())
  );
$$;

-- Czy fachowiec ma OPŁACONY, aktywny powiat (pełny dostęp + prawo oferty; D-01).
create or replace function public.mb_ma_platny_powiat(p_user uuid, p_powiat bigint)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1
    from public.mb_abonament_powiaty ap
    join public.mb_abonamenty a on a.id = ap.abonament_id
    where ap.owner_user_id = p_user
      and ap.powiat_id = p_powiat
      and a.status = 'aktywny'
      and (a.current_period_end is null or a.current_period_end > now())
      and ap.aktywny_od <= now()
      and (ap.aktywny_do is null or ap.aktywny_do > now())
  );
$$;

-- Czy fachowiec WYBRAŁ powiat do skróconego podglądu (BEZ abonamentu; F1/aha).
create or replace function public.mb_wybral_powiat(p_user uuid, p_powiat bigint)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.mb_fachowiec_wybrane_powiaty w
    where w.user_id = p_user and w.powiat_id = p_powiat
  );
$$;

-- Czy user jest właścicielem zlecenia (klient).
create or replace function public.mb_jest_wlascicielem_zlecenia(p_zlecenie bigint, p_user uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.mb_zlecenia z where z.id = p_zlecenie and z.klient_user_id = p_user);
$$;

-- Czy user jest WYBRANYM wykonawcą zlecenia (bezpośrednio lub jako pracownik obsadzonego slotu firmy).
create or replace function public.mb_jest_wybranym(p_zlecenie bigint, p_user uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.mb_zlecenia z
    where z.id = p_zlecenie and z.wybrany_fachowiec_user_id = p_user
  );
$$;

-- Czy user może w OGÓLE widzieć zlecenie jako fachowiec (pełny=opłacony powiat, LUB podgląd=wybrany powiat).
create or replace function public.mb_fachowiec_widzi_zlecenie(p_zlecenie bigint, p_user uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.mb_zlecenia z
    where z.id = p_zlecenie
      and z.status in ('opublikowane','wybrano_wykonawce','w_realizacji','oznaczone_zakonczone')
      and (public.mb_ma_platny_powiat(p_user, z.powiat_id) or public.mb_wybral_powiat(p_user, z.powiat_id))
  );
$$;

-- Czy user jest uczestnikiem wątku (klient-właściciel albo fachowiec wątku).
create or replace function public.mb_jest_uczestnikiem_watku(p_watek bigint, p_user uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.mb_watki w
    where w.id = p_watek and (w.klient_user_id = p_user or w.fachowiec_user_id = p_user)
  );
$$;

-- Czy user jest właścicielem firmy.
create or replace function public.mb_jest_wlascicielem_firmy(p_firma bigint, p_user uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.mb_firmy f where f.id = p_firma and f.owner_user_id = p_user);
$$;

-- Czy fachowiec ma WAŻNĄ samodeklarację SEP (D-04) — bramka oferty do zlecenia z flagą.
create or replace function public.mb_ma_wazny_sep(p_user uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.mb_fachowiec_profiles fp
    where fp.user_id = p_user
      and fp.sep_zadeklarowany
      and (fp.sep_wazne_do is null or fp.sep_wazne_do >= current_date)
  );
$$;

-- Utwardzenie grantów funkcji RLS (jak is_operator): tylko authenticated (woła RLS); zero RPC dla anon.
do $$
declare fn text;
begin
  foreach fn in array array[
    'public.mb_ma_aktywny_abonament(uuid)',
    'public.mb_ma_platny_powiat(uuid,bigint)',
    'public.mb_wybral_powiat(uuid,bigint)',
    'public.mb_jest_wlascicielem_zlecenia(bigint,uuid)',
    'public.mb_jest_wybranym(bigint,uuid)',
    'public.mb_fachowiec_widzi_zlecenie(bigint,uuid)',
    'public.mb_jest_uczestnikiem_watku(bigint,uuid)',
    'public.mb_jest_wlascicielem_firmy(bigint,uuid)',
    'public.mb_ma_wazny_sep(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon', fn);
    execute format('grant execute on function %s to authenticated', fn);
  end loop;
end $$;

-- ── UJAWNIENIE KONTAKTU (RLS chroni wiersz, nie kolumnę) — telefon obu stron WYŁĄCZNIE po wyborze ──
-- Zwraca numery telefonów TYLKO gdy caller jest właścicielem zlecenia LUB wybranym wykonawcą, a status
-- osiągnął wybór. RPC dostępne dla authenticated (funkcja sama waliduje uprawnienie).
create or replace function public.mb_kontakt_zlecenia(p_zlecenie bigint)
returns table (klient_telefon text, fachowiec_telefon text)
language plpgsql security definer set search_path = public stable as $$
declare v_klient uuid; v_fach uuid; v_status mb_zlecenie_status; v_me uuid := auth.uid();
begin
  select klient_user_id, wybrany_fachowiec_user_id, status
    into v_klient, v_fach, v_status
  from public.mb_zlecenia where id = p_zlecenie;
  if v_me is null or v_me not in (v_klient, coalesce(v_fach,'00000000-0000-0000-0000-000000000000'::uuid)) then
    raise exception 'brak dostępu do kontaktu tego zlecenia';
  end if;
  if v_status not in ('wybrano_wykonawce','w_realizacji','oznaczone_zakonczone','zakonczone','w_sporze') then
    raise exception 'kontakt ujawniany dopiero po wyborze wykonawcy';
  end if;
  return query
    select (select telefon from public.mb_profiles where user_id = v_klient),
           (select telefon from public.mb_profiles where user_id = v_fach);
end $$;
revoke all on function public.mb_kontakt_zlecenia(bigint) from public, anon;
grant execute on function public.mb_kontakt_zlecenia(bigint) to authenticated;

-- ── PILNE SMS: sprawdzenie limitu 2/24h + blokady 2 dni (A-03). Wywołuje edge send-sms (service-role). ──
create or replace function public.mb_pilne_sms_dozwolone(p_nadawca uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select
    not exists (  -- brak aktywnej blokady 2-dniowej
      select 1 from public.mb_pilne_sms_blokady b
      where b.user_id = p_nadawca and now() between b.od and b.do_
    )
    and (  -- max 2 wysłane w oknie 24h
      select count(*) from public.mb_pilne_sms s
      where s.nadawca_user_id = p_nadawca and s.wyslany and s.created_at > now() - interval '24 hours'
    ) < 2;
$$;
revoke all on function public.mb_pilne_sms_dozwolone(uuid) from public, anon, authenticated;
grant execute on function public.mb_pilne_sms_dozwolone(uuid) to service_role;


-- =============================================================================
-- SEKCJA 15 — TRIGGERY LICZĄCE (SECURITY DEFINER): score rzetelności + cache ocen (D-11)
-- =============================================================================
-- SCORING D-11 (jawny, deterministyczny):
--   • baza 100; każda NIEUZASADNIONA rezygnacja z ostatnich 90 dni: −25 (max −75, tj. dolny próg 25).
--   • „powrót do 100 po 3 poprawnych realizacjach": karę uznajemy za ODPRACOWANĄ, gdy po dacie rezygnacji
--     fachowiec ma ≥3 poprawnie zakończone realizacje → taka rezygnacja nie liczy się już do kary.
--   • ostrzeżenie: aktywne, gdy ≥3 wciąż-nieodpracowanych nieuzasadnionych rezygnacji (znika po odpracowaniu).
--   • score NIE zmienia oceny gwiazdkowej (rating_avg liczony osobno) — steruje TYLKO sortem ofert.
create or replace function public.mb_recompute_score(p_fachowiec uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_kary int; v_realizacje int; v_score int; v_ostrzezenie boolean;
begin
  -- poprawne realizacje ogółem (cache)
  select count(*) into v_realizacje
  from public.mb_zlecenia z
  where z.wybrany_fachowiec_user_id = p_fachowiec
    and z.status = 'zakonczone' and coalesce(z.closed_reason,'') in ('potwierdzone','auto');

  -- nieuzasadnione rezygnacje z 90 dni, JESZCZE nieodpracowane (mniej niż 3 poprawne realizacje po nich)
  select count(*) into v_kary
  from public.mb_rezygnacje r
  where r.rezygnujacy_user_id = p_fachowiec
    and r.usprawiedliwiona is false
    and r.created_at > now() - interval '90 days'
    and (
      select count(*) from public.mb_zlecenia z2
      where z2.wybrany_fachowiec_user_id = p_fachowiec
        and z2.status = 'zakonczone' and coalesce(z2.closed_reason,'') in ('potwierdzone','auto')
        and z2.closed_at > r.created_at
    ) < 3;

  v_score := 100 - least(75, 25 * v_kary);
  v_ostrzezenie := v_kary >= 3;

  update public.mb_fachowiec_profiles fp
    set score = v_score,
        score_updated_at = now(),
        realizacje_count = v_realizacje
  where fp.user_id = p_fachowiec;

  update public.mb_profiles p
    set ostrzezenie_aktywne = v_ostrzezenie
  where p.user_id = p_fachowiec;
end $$;
revoke all on function public.mb_recompute_score(uuid) from public, anon, authenticated;

-- Przelicz cache średniej ocen odbiorcy (rating_avg/count na profilu fachowca; ukryte oceny wyłączone).
create or replace function public.mb_recompute_rating(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_avg numeric(3,2); v_cnt int;
begin
  select coalesce(avg(gwiazdki),0)::numeric(3,2), count(*)
    into v_avg, v_cnt
  from public.mb_oceny o
  where o.odbiorca_user_id = p_user
    and o.kierunek = 'klient_ocenia_fachowca'
    and not o.ukryta_z_profilu;
  update public.mb_fachowiec_profiles fp
    set rating_avg = v_avg, rating_count = v_cnt
  where fp.user_id = p_user;
end $$;
revoke all on function public.mb_recompute_rating(uuid) from public, anon, authenticated;

-- Triggery: rezygnacje/zakończenia → score; oceny → rating.
create or replace function public.mb_trg_score_on_rezygnacja()
returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.mb_recompute_score(new.rezygnujacy_user_id); return new; end $$;
revoke all on function public.mb_trg_score_on_rezygnacja() from public, anon, authenticated;
create trigger trg_mb_score_rezygnacja
  after insert or update of usprawiedliwiona on mb_rezygnacje
  for each row execute function public.mb_trg_score_on_rezygnacja();

create or replace function public.mb_trg_score_on_zlecenie()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'zakonczone' and new.wybrany_fachowiec_user_id is not null then
    perform public.mb_recompute_score(new.wybrany_fachowiec_user_id);
  end if;
  return new;
end $$;
revoke all on function public.mb_trg_score_on_zlecenie() from public, anon, authenticated;
create trigger trg_mb_score_zlecenie
  after update of status on mb_zlecenia
  for each row execute function public.mb_trg_score_on_zlecenie();

create or replace function public.mb_trg_rating()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.mb_recompute_rating(coalesce(new.odbiorca_user_id, old.odbiorca_user_id));
  return coalesce(new, old);
end $$;
revoke all on function public.mb_trg_rating() from public, anon, authenticated;
create trigger trg_mb_rating
  after insert or update or delete on mb_oceny
  for each row execute function public.mb_trg_rating();


-- =============================================================================
-- SEKCJA 16 — WIDOKI (skrócony podgląd + profil publiczny) — kolumny ograniczone
-- =============================================================================
-- security_invoker=false (widok wykonuje się jako właściciel → omija RLS bazowej tabeli), ale WHERE
-- w widoku sam egzekwuje dostęp (auth.uid()) i EKSPONUJE TYLKO bezpieczne kolumny. security_barrier=true.

-- Skrócony podgląd zleceń dla fachowca BEZ abonamentu (F1/aha): rodzaj, dzielnica, termin — BEZ kontaktu.
-- Odległość liczy front z centroidów słownika (mb_haversine). Widzi każdy fachowiec z WYBRANYM powiatem.
create or replace view mb_zlecenia_podglad
  with (security_barrier = true, security_invoker = false) as
  select z.id, z.kategoria_id, z.powiat_id, z.miasto_id, z.dzielnica_id,
         z.termin_typ, z.termin_data, z.status, z.created_at
  from public.mb_zlecenia z
  where z.status = 'opublikowane'
    and public.mb_wybral_powiat(auth.uid(), z.powiat_id);
revoke all on mb_zlecenia_podglad from anon;
grant select on mb_zlecenia_podglad to authenticated;

-- Profil PUBLICZNY (imię + rating + realizacje + badge) — do listy ofert i „przed ofertą fachowiec widzi
-- imię klienta, średnią ocen, liczbę zakończonych zleceń" (HANDOFF §7). BEZ telefonu/e-maila.
create or replace view mb_profil_publiczny
  with (security_barrier = true, security_invoker = false) as
  select p.user_id, p.imie, p.rola_niszy,
         fp.typ, fp.wystawia_dokument, fp.score, fp.rating_avg, fp.rating_count, fp.realizacje_count,
         fp.firma_id, fp.sep_zadeklarowany, fp.sep_numer
  from public.mb_profiles p
  left join public.mb_fachowiec_profiles fp on fp.user_id = p.user_id;
revoke all on mb_profil_publiczny from anon;
grant select on mb_profil_publiczny to authenticated;


-- =============================================================================
-- SEKCJA 17 — RLS: ENABLE + POLITYKI (per auth.uid(); S/I/U/D osobno; operator = is_operator())
-- =============================================================================

-- ── 17.1 SŁOWNIK TERYT — dane referencyjne PUBLICZNE (zero PII). Read-all jawnie uzasadniony;
--        ŻADNEJ polityki zapisu → seed/aktualizacja wyłącznie service-role (omija RLS). ──
alter table mb_powiaty   enable row level security;
alter table mb_miasta    enable row level security;
alter table mb_dzielnice enable row level security;
alter table mb_kategorie enable row level security;
create policy mb_powiaty_read   on mb_powiaty   for select to anon, authenticated using (true);
create policy mb_miasta_read    on mb_miasta    for select to anon, authenticated using (true);
create policy mb_dzielnice_read on mb_dzielnice for select to anon, authenticated using (true);
create policy mb_kategorie_read on mb_kategorie for select to anon, authenticated using (true);

-- ── 17.2 mb_profiles — user widzi/edytuje SWÓJ; operator wszystkie. INSERT: własny wiersz.
--        (telefon nie wycieka: cross-user ujawnienie tylko przez mb_kontakt_zlecenia; profil publiczny = widok bez telefonu)
alter table mb_profiles enable row level security;
create policy mb_profiles_sel_own  on mb_profiles for select to authenticated using (user_id = auth.uid());
create policy mb_profiles_sel_op   on mb_profiles for select to authenticated using (public.is_operator());
create policy mb_profiles_ins_own  on mb_profiles for insert to authenticated with check (user_id = auth.uid());
create policy mb_profiles_upd_own  on mb_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Uwaga: ostrzezenie_aktywne pisze trigger (SECURITY DEFINER) — front go NIE zmienia (patrz column-grant niżej).

-- ── 17.3 mb_klient_profiles — właściciel; operator select.
alter table mb_klient_profiles enable row level security;
create policy mb_klientp_sel_own on mb_klient_profiles for select to authenticated using (user_id = auth.uid());
create policy mb_klientp_sel_op  on mb_klient_profiles for select to authenticated using (public.is_operator());
create policy mb_klientp_ins_own on mb_klient_profiles for insert to authenticated with check (user_id = auth.uid());
create policy mb_klientp_upd_own on mb_klient_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── 17.4 mb_fachowiec_profiles — właściciel edytuje; SELECT szerszy (dane publiczne idą i tak widokiem,
--        ale klient/fachowiec potrzebują odczytu profilu kontrahenta) → własny + operator; publiczne pola = widok.
--        UWAGA: score/rating/realizacje pisze WYŁĄCZNIE trigger (column-grant niżej).
alter table mb_fachowiec_profiles enable row level security;
create policy mb_fachp_sel_own on mb_fachowiec_profiles for select to authenticated using (user_id = auth.uid());
create policy mb_fachp_sel_op  on mb_fachowiec_profiles for select to authenticated using (public.is_operator());
create policy mb_fachp_ins_own on mb_fachowiec_profiles for insert to authenticated with check (user_id = auth.uid());
create policy mb_fachp_upd_own on mb_fachowiec_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── 17.5 mb_fachowiec_specjalizacje — własne.
alter table mb_fachowiec_specjalizacje enable row level security;
create policy mb_spec_sel_own on mb_fachowiec_specjalizacje for select to authenticated using (user_id = auth.uid());
create policy mb_spec_sel_op  on mb_fachowiec_specjalizacje for select to authenticated using (public.is_operator());
create policy mb_spec_ins_own on mb_fachowiec_specjalizacje for insert to authenticated with check (user_id = auth.uid());
create policy mb_spec_del_own on mb_fachowiec_specjalizacje for delete to authenticated using (user_id = auth.uid());

-- ── 17.6 mb_fachowiec_wybrane_powiaty — własne (podgląd bez abonamentu).
alter table mb_fachowiec_wybrane_powiaty enable row level security;
create policy mb_wyb_sel_own on mb_fachowiec_wybrane_powiaty for select to authenticated using (user_id = auth.uid());
create policy mb_wyb_ins_own on mb_fachowiec_wybrane_powiaty for insert to authenticated with check (user_id = auth.uid());
create policy mb_wyb_del_own on mb_fachowiec_wybrane_powiaty for delete to authenticated using (user_id = auth.uid());

-- ── 17.7 mb_firmy — właściciel zarządza; pracownik (obsadzony slot) czyta swoją firmę; operator select.
alter table mb_firmy enable row level security;
create policy mb_firmy_sel_owner on mb_firmy for select to authenticated using (owner_user_id = auth.uid());
create policy mb_firmy_sel_prac  on mb_firmy for select to authenticated
  using (exists (select 1 from mb_firma_obsady o where o.firma_id = mb_firmy.id and o.pracownik_user_id = auth.uid() and o.aktywna));
create policy mb_firmy_sel_op    on mb_firmy for select to authenticated using (public.is_operator());
create policy mb_firmy_ins_owner on mb_firmy for insert to authenticated with check (owner_user_id = auth.uid());
create policy mb_firmy_upd_owner on mb_firmy for update to authenticated using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

-- ── 17.8 mb_firma_sloty — POTOMNE: WITH CHECK = własność RODZICA (firma). Właściciel zarządza; pracownik czyta.
alter table mb_firma_sloty enable row level security;
create policy mb_sloty_sel_owner on mb_firma_sloty for select to authenticated using (public.mb_jest_wlascicielem_firmy(firma_id, auth.uid()));
create policy mb_sloty_sel_op    on mb_firma_sloty for select to authenticated using (public.is_operator());
create policy mb_sloty_ins_owner on mb_firma_sloty for insert to authenticated with check (public.mb_jest_wlascicielem_firmy(firma_id, auth.uid()));
create policy mb_sloty_upd_owner on mb_firma_sloty for update to authenticated using (public.mb_jest_wlascicielem_firmy(firma_id, auth.uid())) with check (public.mb_jest_wlascicielem_firmy(firma_id, auth.uid()));
create policy mb_sloty_del_owner on mb_firma_sloty for delete to authenticated using (public.mb_jest_wlascicielem_firmy(firma_id, auth.uid()));

-- ── 17.9 mb_firma_obsady — POTOMNE: właściciel firmy zarządza (WITH CHECK own firmy); pracownik czyta swoje wpisy.
alter table mb_firma_obsady enable row level security;
create policy mb_obsady_sel_owner on mb_firma_obsady for select to authenticated using (public.mb_jest_wlascicielem_firmy(firma_id, auth.uid()));
create policy mb_obsady_sel_self  on mb_firma_obsady for select to authenticated using (pracownik_user_id = auth.uid());
create policy mb_obsady_sel_op    on mb_firma_obsady for select to authenticated using (public.is_operator());
create policy mb_obsady_ins_owner on mb_firma_obsady for insert to authenticated with check (public.mb_jest_wlascicielem_firmy(firma_id, auth.uid()));
create policy mb_obsady_upd_owner on mb_firma_obsady for update to authenticated using (public.mb_jest_wlascicielem_firmy(firma_id, auth.uid())) with check (public.mb_jest_wlascicielem_firmy(firma_id, auth.uid()));

-- ── 17.10 mb_abonamenty — LUSTRO Stripe: pisze service-role (stripe-processor). User czyta SWÓJ; operator wszystkie.
alter table mb_abonamenty enable row level security;
create policy mb_abon_sel_own on mb_abonamenty for select to authenticated
  using (owner_user_id = auth.uid() or (firma_id is not null and public.mb_jest_wlascicielem_firmy(firma_id, auth.uid())));
create policy mb_abon_sel_op  on mb_abonamenty for select to authenticated using (public.is_operator());
-- Brak I/U/D dla authenticated → zapis WYŁĄCZNIE service-role (proces Stripe). User nie zmyśli sobie abonamentu.

-- ── 17.11 mb_abonament_powiaty — POTOMNE lustra Stripe. User czyta swoje; zapis service-role.
alter table mb_abonament_powiaty enable row level security;
create policy mb_abonp_sel_own on mb_abonament_powiaty for select to authenticated using (owner_user_id = auth.uid());
create policy mb_abonp_sel_op  on mb_abonament_powiaty for select to authenticated using (public.is_operator());
-- Brak I/U/D dla authenticated → zapis wyłącznie service-role.

-- ── 17.12 mb_zlecenia — klient widzi SWOJE; wybrany fachowiec widzi swoje; fachowiec z OPŁACONYM powiatem
--         widzi pełne opublikowane/aktywne (podgląd bez abonamentu = WIDOK mb_zlecenia_podglad, nie ta polityka).
alter table mb_zlecenia enable row level security;
create policy mb_zlec_sel_klient on mb_zlecenia for select to authenticated using (klient_user_id = auth.uid());
create policy mb_zlec_sel_wybrany on mb_zlecenia for select to authenticated using (wybrany_fachowiec_user_id = auth.uid());
create policy mb_zlec_sel_fachowiec_platny on mb_zlecenia for select to authenticated
  using (
    status in ('opublikowane','wybrano_wykonawce','w_realizacji','oznaczone_zakonczone')
    and public.mb_ma_platny_powiat(auth.uid(), powiat_id)
  );
create policy mb_zlec_sel_op on mb_zlecenia for select to authenticated using (public.is_operator());
create policy mb_zlec_ins_klient on mb_zlecenia for insert to authenticated with check (klient_user_id = auth.uid());
create policy mb_zlec_upd_klient on mb_zlecenia for update to authenticated using (klient_user_id = auth.uid()) with check (klient_user_id = auth.uid());
-- Przejścia statusów wyzwalane wyborem/realizacją idą przez edge (service-role) — omijają RLS.

-- ── 17.13 mb_zlecenie_zdjecia — POTOMNE: WITH CHECK właściciel rodzica; SELECT jak zlecenie (klient+wybrany+opłacony fachowiec).
alter table mb_zlecenie_zdjecia enable row level security;
create policy mb_zdj_sel_klient  on mb_zlecenie_zdjecia for select to authenticated using (klient_user_id = auth.uid());
-- Zdjęcia widzi TYLKO fachowiec z OPŁACONYM powiatem (nie podgląd bez abonamentu — skrócony podgląd = bez zdjęć/kontaktu).
create policy mb_zdj_sel_fach    on mb_zlecenie_zdjecia for select to authenticated
  using (exists (select 1 from mb_zlecenia z where z.id = zlecenie_id
    and z.status in ('opublikowane','wybrano_wykonawce','w_realizacji','oznaczone_zakonczone')
    and public.mb_ma_platny_powiat(auth.uid(), z.powiat_id)));
create policy mb_zdj_sel_op      on mb_zlecenie_zdjecia for select to authenticated using (public.is_operator());
create policy mb_zdj_ins_klient  on mb_zlecenie_zdjecia for insert to authenticated
  with check (klient_user_id = auth.uid() and public.mb_jest_wlascicielem_zlecenia(zlecenie_id, auth.uid()));
create policy mb_zdj_del_klient  on mb_zlecenie_zdjecia for delete to authenticated using (klient_user_id = auth.uid());

-- ── 17.14 mb_zlecenie_kontakt — DOKŁADNY ADRES: TYLKO właściciel + WYBRANY wykonawca + operator.
alter table mb_zlecenie_kontakt enable row level security;
create policy mb_kontakt_sel_klient  on mb_zlecenie_kontakt for select to authenticated using (klient_user_id = auth.uid());
create policy mb_kontakt_sel_wybrany on mb_zlecenie_kontakt for select to authenticated using (public.mb_jest_wybranym(zlecenie_id, auth.uid()));
create policy mb_kontakt_sel_op      on mb_zlecenie_kontakt for select to authenticated using (public.is_operator());
create policy mb_kontakt_ins_klient  on mb_zlecenie_kontakt for insert to authenticated
  with check (klient_user_id = auth.uid() and public.mb_jest_wlascicielem_zlecenia(zlecenie_id, auth.uid()));
create policy mb_kontakt_upd_klient  on mb_zlecenie_kontakt for update to authenticated using (klient_user_id = auth.uid()) with check (klient_user_id = auth.uid());

-- ── 17.15 mb_pytania — pyta fachowiec (WITH CHECK: autor=self + widzi zlecenie); czyta klient + fachowcy z dostępem.
alter table mb_pytania enable row level security;
create policy mb_pyt_sel on mb_pytania for select to authenticated
  using (public.mb_jest_wlascicielem_zlecenia(zlecenie_id, auth.uid())
         or public.mb_fachowiec_widzi_zlecenie(zlecenie_id, auth.uid()));
create policy mb_pyt_sel_op on mb_pytania for select to authenticated using (public.is_operator());
create policy mb_pyt_ins_fach on mb_pytania for insert to authenticated
  with check (fachowiec_user_id = auth.uid() and public.mb_fachowiec_widzi_zlecenie(zlecenie_id, auth.uid()));

-- ── 17.16 mb_odpowiedzi — odpowiada KLIENT (WITH CHECK: właściciel zlecenia). Widoczność wg D-02.
alter table mb_odpowiedzi enable row level security;
create policy mb_odp_sel on mb_odpowiedzi for select to authenticated using (
  public.mb_jest_wlascicielem_zlecenia(zlecenie_id, auth.uid())                  -- klient widzi swoje
  or (widocznosc = 'publiczna' and public.mb_fachowiec_widzi_zlecenie(zlecenie_id, auth.uid()))  -- publiczna → każdy z dostępem
  or exists (select 1 from mb_pytania q where q.id = pytanie_id and q.fachowiec_user_id = auth.uid()) -- „tylko pytający"
);
create policy mb_odp_sel_op on mb_odpowiedzi for select to authenticated using (public.is_operator());
create policy mb_odp_ins_klient on mb_odpowiedzi for insert to authenticated
  with check (klient_user_id = auth.uid() and public.mb_jest_wlascicielem_zlecenia(zlecenie_id, auth.uid()));
create policy mb_odp_upd_klient on mb_odpowiedzi for update to authenticated using (klient_user_id = auth.uid()) with check (klient_user_id = auth.uid());

-- ── 17.17 mb_oferty — fachowiec widzi SWOJE; klient-właściciel widzi WSZYSTKIE do swojego zlecenia.
--         INSERT: autor=self + AKTYWNY ABONAMENT + OPŁACONY POWIAT + (jeśli zlecenie wymaga uprawnień → WAŻNY SEP, D-04).
alter table mb_oferty enable row level security;
create policy mb_of_sel_fach   on mb_oferty for select to authenticated using (fachowiec_user_id = auth.uid());
create policy mb_of_sel_klient on mb_oferty for select to authenticated using (public.mb_jest_wlascicielem_zlecenia(zlecenie_id, auth.uid()));
create policy mb_of_sel_op     on mb_oferty for select to authenticated using (public.is_operator());
create policy mb_of_ins_fach on mb_oferty for insert to authenticated
  with check (
    fachowiec_user_id = auth.uid()
    and public.mb_ma_aktywny_abonament(auth.uid())
    and exists (
      select 1 from mb_zlecenia z
      where z.id = zlecenie_id
        and z.status = 'opublikowane'
        and public.mb_ma_platny_powiat(auth.uid(), z.powiat_id)
        and (not z.wymaga_uprawnien or public.mb_ma_wazny_sep(auth.uid()))  -- bramka SEP (D-04)
    )
  );
create policy mb_of_upd_fach on mb_oferty for update to authenticated
  using (fachowiec_user_id = auth.uid()) with check (fachowiec_user_id = auth.uid());
-- Zamknięcie „wybrano_innego"/„wybrana" ustawia edge (service-role) przy wyborze — omija RLS.

-- ── 17.18 mb_watki — uczestnicy (klient-właściciel + fachowiec wątku). Tworzy edge przy wyborze (service-role).
alter table mb_watki enable row level security;
create policy mb_watki_sel on mb_watki for select to authenticated
  using (klient_user_id = auth.uid() or fachowiec_user_id = auth.uid());
create policy mb_watki_sel_op on mb_watki for select to authenticated using (public.is_operator());

-- ── 17.19 mb_wiadomosci — POTOMNE: WITH CHECK = uczestnik wątku + nadawca=self. SELECT = uczestnik.
alter table mb_wiadomosci enable row level security;
create policy mb_wiad_sel on mb_wiadomosci for select to authenticated using (public.mb_jest_uczestnikiem_watku(watek_id, auth.uid()));
create policy mb_wiad_sel_op on mb_wiadomosci for select to authenticated using (public.is_operator());
create policy mb_wiad_ins on mb_wiadomosci for insert to authenticated
  with check (nadawca_user_id = auth.uid() and public.mb_jest_uczestnikiem_watku(watek_id, auth.uid()));
create policy mb_wiad_upd_own on mb_wiadomosci for update to authenticated
  using (nadawca_user_id = auth.uid()) with check (nadawca_user_id = auth.uid());  -- edycja transkrypcji/treści przez nadawcę

-- ── 17.20 mb_pilne_sms — nadawca/odbiorca widzą swoje; zapis + wysyłkę robi edge (service-role, po mb_pilne_sms_dozwolone).
alter table mb_pilne_sms enable row level security;
create policy mb_sms_sel on mb_pilne_sms for select to authenticated
  using (nadawca_user_id = auth.uid() or odbiorca_user_id = auth.uid());
create policy mb_sms_sel_op on mb_pilne_sms for select to authenticated using (public.is_operator());
-- Brak I/U/D dla authenticated → limit egzekwuje service-role (front nie ominie limitu bezpośrednim insertem).

-- ── 17.21 mb_pilne_sms_blokady — user widzi swoją blokadę (transparentność); zakłada operator (service-role).
alter table mb_pilne_sms_blokady enable row level security;
create policy mb_smsblok_sel_own on mb_pilne_sms_blokady for select to authenticated using (user_id = auth.uid());
create policy mb_smsblok_sel_op  on mb_pilne_sms_blokady for select to authenticated using (public.is_operator());

-- ── 17.22 mb_ustalenia — uczestnicy zlecenia (klient + wybrany fachowiec). Wersje tworzy edge/AI albo strona.
alter table mb_ustalenia enable row level security;
create policy mb_ust_sel on mb_ustalenia for select to authenticated
  using (public.mb_jest_wlascicielem_zlecenia(zlecenie_id, auth.uid()) or public.mb_jest_wybranym(zlecenie_id, auth.uid()));
create policy mb_ust_sel_op on mb_ustalenia for select to authenticated using (public.is_operator());
create policy mb_ust_ins on mb_ustalenia for insert to authenticated
  with check (autor_edycji_user_id = auth.uid()
    and (public.mb_jest_wlascicielem_zlecenia(zlecenie_id, auth.uid()) or public.mb_jest_wybranym(zlecenie_id, auth.uid())));

-- ── 17.23 mb_ustalenia_akceptacje — każda strona wstawia/aktualizuje SWÓJ wiersz akceptacji.
alter table mb_ustalenia_akceptacje enable row level security;
create policy mb_ustakc_sel on mb_ustalenia_akceptacje for select to authenticated
  using (public.mb_jest_wlascicielem_zlecenia(zlecenie_id, auth.uid()) or public.mb_jest_wybranym(zlecenie_id, auth.uid()));
create policy mb_ustakc_sel_op on mb_ustalenia_akceptacje for select to authenticated using (public.is_operator());
create policy mb_ustakc_ins_self on mb_ustalenia_akceptacje for insert to authenticated
  with check (strona_user_id = auth.uid()
    and (public.mb_jest_wlascicielem_zlecenia(zlecenie_id, auth.uid()) or public.mb_jest_wybranym(zlecenie_id, auth.uid())));
create policy mb_ustakc_upd_self on mb_ustalenia_akceptacje for update to authenticated
  using (strona_user_id = auth.uid()) with check (strona_user_id = auth.uid());

-- ── 17.24 mb_odrzucenia_zakonczenia — POTOMNE: WITH CHECK właściciel zlecenia. SELECT: klient + wybrany + operator.
alter table mb_odrzucenia_zakonczenia enable row level security;
create policy mb_odrz_sel_klient  on mb_odrzucenia_zakonczenia for select to authenticated using (klient_user_id = auth.uid());
create policy mb_odrz_sel_wybrany on mb_odrzucenia_zakonczenia for select to authenticated using (public.mb_jest_wybranym(zlecenie_id, auth.uid()));
create policy mb_odrz_sel_op      on mb_odrzucenia_zakonczenia for select to authenticated using (public.is_operator());
create policy mb_odrz_ins_klient  on mb_odrzucenia_zakonczenia for insert to authenticated
  with check (klient_user_id = auth.uid() and public.mb_jest_wlascicielem_zlecenia(zlecenie_id, auth.uid()));

-- ── 17.25 mb_oceny — autor wstawia SWOJĄ (WITH CHECK autor=self), po ZAKOŃCZONYM zleceniu; obie strony + odbiorca czytają.
alter table mb_oceny enable row level security;
create policy mb_oceny_sel on mb_oceny for select to authenticated
  using (autor_user_id = auth.uid() or odbiorca_user_id = auth.uid()
         or (not ukryta_z_profilu));   -- oceny publiczne (nieukryte) widoczne dla listy ofert/profilu
create policy mb_oceny_sel_op on mb_oceny for select to authenticated using (public.is_operator());
create policy mb_oceny_ins_self on mb_oceny for insert to authenticated
  with check (
    autor_user_id = auth.uid()
    and exists (select 1 from mb_zlecenia z where z.id = zlecenie_id and z.status = 'zakonczone'
                and auth.uid() in (z.klient_user_id, z.wybrany_fachowiec_user_id))
  );
-- ukryta_z_profilu (D-12) ustawia edge/operator przy zwolnieniu pracownika (service-role).

-- ── 17.26 mb_rezygnacje — rezygnujący wstawia SWOJĄ; druga strona (klient zlecenia) czyta; usprawiedliwiona = operator/edge.
alter table mb_rezygnacje enable row level security;
create policy mb_rez_sel_self   on mb_rezygnacje for select to authenticated using (rezygnujacy_user_id = auth.uid());
create policy mb_rez_sel_klient on mb_rezygnacje for select to authenticated using (public.mb_jest_wlascicielem_zlecenia(zlecenie_id, auth.uid()));
create policy mb_rez_sel_op     on mb_rezygnacje for select to authenticated using (public.is_operator());
create policy mb_rez_ins_self on mb_rezygnacje for insert to authenticated
  with check (rezygnujacy_user_id = auth.uid() and public.mb_jest_wybranym(zlecenie_id, auth.uid()));
-- usprawiedliwiona/zakwestionowana/spor_id zmienia service-role (proces sporu) — nie front.

-- ── 17.27 mb_spory — strony sporu widzą swój; zgłoszenie może wstawić strona; DECYZJĘ podejmuje operator (service-role/panel).
alter table mb_spory enable row level security;
create policy mb_spor_sel_strony on mb_spory for select to authenticated
  using (zglaszajacy_user_id = auth.uid() or druga_strona_user_id = auth.uid());
create policy mb_spor_sel_op on mb_spory for select to authenticated using (public.is_operator());
create policy mb_spor_ins_strona on mb_spory for insert to authenticated
  with check (zglaszajacy_user_id = auth.uid());
-- Decyzja/skutek zapisuje operator: przez panel (service-role) — brak polityki UPDATE dla authenticated.

-- ── 17.28 mb_spor_stanowiska — POTOMNE: strona sporu wstawia SWOJE stanowisko; strony + operator czytają.
alter table mb_spor_stanowiska enable row level security;
create policy mb_stan_sel on mb_spor_stanowiska for select to authenticated
  using (exists (select 1 from mb_spory s where s.id = spor_id
                 and (s.zglaszajacy_user_id = auth.uid() or s.druga_strona_user_id = auth.uid())));
create policy mb_stan_sel_op on mb_spor_stanowiska for select to authenticated using (public.is_operator());
create policy mb_stan_ins_self on mb_spor_stanowiska for insert to authenticated
  with check (strona_user_id = auth.uid()
    and exists (select 1 from mb_spory s where s.id = spor_id
                and (s.zglaszajacy_user_id = auth.uid() or s.druga_strona_user_id = auth.uid())));

-- ── 17.29 mb_powiadomienia — właściciel czyta/oznacza przeczytane; tworzy edge (service-role).
alter table mb_powiadomienia enable row level security;
create policy mb_pow_sel_own on mb_powiadomienia for select to authenticated using (user_id = auth.uid());
create policy mb_pow_sel_op  on mb_powiadomienia for select to authenticated using (public.is_operator());
create policy mb_pow_upd_own on mb_powiadomienia for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Brak INSERT dla authenticated → powiadomienia generuje wyłącznie serwer (spójność, brak podszywania).

-- ── 17.30 mb_powiadomienia_ustawienia — właściciel zarządza swoimi.
alter table mb_powiadomienia_ustawienia enable row level security;
create policy mb_powust_sel_own on mb_powiadomienia_ustawienia for select to authenticated using (user_id = auth.uid());
create policy mb_powust_ins_own on mb_powiadomienia_ustawienia for insert to authenticated with check (user_id = auth.uid());
create policy mb_powust_upd_own on mb_powiadomienia_ustawienia for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());


-- =============================================================================
-- SEKCJA 18 — COLUMN-LEVEL GRANTS (RLS wiersz + GRANT kolumna, koniunkcyjnie) — jak 0006 startera
-- =============================================================================
-- Domyślny grant Supabase daje authenticated INSERT/UPDATE na wszystkich kolumnach public.
-- Odcinamy pola pisane WYŁĄCZNIE przez triggery/proces (score, rating, ostrzeżenie, statusy lustra Stripe),
-- by front nie mógł ich podmienić PATCH-em (obejście scoringu/abonamentu). Reszta zapisu = service-role.

-- mb_profiles: front zmienia tylko dane własne, NIE ostrzezenie_aktywne (pisze trigger score).
revoke update on mb_profiles from authenticated;
grant update (imie, telefon, rola_niszy) on mb_profiles to authenticated;

-- mb_fachowiec_profiles: front NIE zmienia score/score_updated_at/realizacje_count/rating_avg/rating_count.
revoke update on mb_fachowiec_profiles from authenticated;
grant update (firma_id, typ, photo_url, wystawia_dokument, sep_zadeklarowany, sep_numer, sep_wazne_do)
  on mb_fachowiec_profiles to authenticated;

-- mb_zlecenia: klient NIE zmienia pól sterowanych procesem (status/wybór/licznik/zasięg/derywacje).
revoke update on mb_zlecenia from authenticated;
grant update (opis, kategoria_id, wojewodztwo, miasto_id, dzielnica_id, termin_typ, termin_data, potrzebny_dokument)
  on mb_zlecenia to authenticated;

-- SEC: odetnij anon od zapisu do wszystkich tabel niszy (obrona w głąb — wzór 0006 SEC-A2).
do $$
declare t text;
begin
  foreach t in array array[
    'mb_profiles','mb_klient_profiles','mb_fachowiec_profiles','mb_fachowiec_specjalizacje',
    'mb_fachowiec_wybrane_powiaty','mb_firmy','mb_firma_sloty','mb_firma_obsady','mb_abonamenty',
    'mb_abonament_powiaty','mb_zlecenia','mb_zlecenie_zdjecia','mb_zlecenie_kontakt','mb_pytania',
    'mb_odpowiedzi','mb_oferty','mb_watki','mb_wiadomosci','mb_pilne_sms','mb_pilne_sms_blokady',
    'mb_ustalenia','mb_ustalenia_akceptacje','mb_odrzucenia_zakonczenia','mb_oceny','mb_rezygnacje',
    'mb_spory','mb_spor_stanowiska','mb_powiadomienia','mb_powiadomienia_ustawienia'
  ] loop
    execute format('revoke insert, update, delete on public.%I from anon', t);
  end loop;
end $$;


-- =============================================================================
-- SEKCJA 19 — CRON (dokumentacja; włącza krok późniejszy per apka — wzór 0002_cron)
-- =============================================================================
-- ⚠️ NIE aplikować „w ciemno". Włączyć świadomie (pg_cron/pg_net lub Dashboard Schedules), timeout 300000 ms.
--  [ ] mb-auto-zamkniecie (0 * * * *) — edge fn zamyka zlecenia: status='oznaczone_zakonczone'
--      AND completed_marked_at < now()-4 days → status='zakonczone', closed_reason='auto' (D-08).
--      Uwaga: pg_net domyślnie ubija HTTP po 5 s (feedback-pg-net-5s-timeout) → ustaw timeout_milliseconds.
--  [ ] mb-przypomnienia (0 * * * *) — przypomnienia do klienta 24h/72h od completed_marked_at (push/e-mail,
--      BEZ SMS — to nie „pilna wiadomość", D-08). Idą przez Resend/lifecycle-emails (dedup w email_log).
--  [ ] mb-spor-terminy (0 * * * *) — spory bez stanowiska po 48h (odpowiedz_termin) → sygnał do panelu operatora.
-- Rozliczenie AI (transkrypcja A-04 + podsumowanie) chodzi crona AI-billing STARTERA (nbp-rate-sync + ai-billing-cron).


-- =============================================================================
-- TEST ANON/RLS (po aplikacji krok Schemat DB — dowód do BUILDLOG):
--   • Jako klient A: select z mb_zlecenia widzi TYLKO swoje + (jeśli fachowiec) opłacone powiaty; NIGDY cudze prywatne.
--   • Jako fachowiec BEZ abonamentu: select mb_zlecenia = 0 wierszy z cudzego powiatu; select mb_zlecenia_podglad
--     = widzi skrót (bez kontaktu) dla WYBRANYCH powiatów. Insert do mb_oferty → 0 wierszy (WITH CHECK: brak abonamentu).
--   • Jako fachowiec z abonamentem, powiat opłacony, zlecenie wymaga_uprawnien=true, BEZ SEP: insert mb_oferty → odrzucone.
--   • mb_zlecenie_kontakt / mb_kontakt_zlecenia(): telefon+adres widoczne WYŁĄCZNIE właścicielowi i WYBRANEMU (po wyborze).
--   • SET ROLE anon; insert/update na dowolnej tabeli mb_* → permission denied (SEKCJA 18).
--   • PATCH mb_fachowiec_profiles {"score":100} przez authenticated → 403 (column-grant, SEKCJA 18).
-- =============================================================================

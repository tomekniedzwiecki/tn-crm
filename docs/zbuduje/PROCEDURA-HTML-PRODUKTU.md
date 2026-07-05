# PROCEDURA-HTML-PRODUKTU — dopracowanie strony produktowej sklepu klienta (workflow v2)

**Kiedy:** krok `html_final` (Etap 1 — Portfel) w module TN Sklepy. Start = draft z `bud-landing-gen`
(HTML w `bud_sessions.landing_html` sesji z `wf2_products.gen_session_id`), przegrany do repo.
Koniec = dopracowany, zweryfikowany plik w repo, gotowy do przegrania do TakeDrop CMS
(krok `td_strona_prod`, Etap 2 — ręczne przegranie przez Tomka, patrz `project-takedrop-cms-vs-vercel`).

## Źródło prawdy i struktura

- Plik: `tn-crm/sklepy/<klient-slug>/<produkt-slug>/index.html` — jeden katalog na PRODUKT
  (portfel ma 5–10 produktów → 5–10 katalogów per klient; `wf2_products.repo_path` wskazuje katalog).
- Draft NIE jest przepisywany od zera — to baza wypracowanego stylu (klient widział ją w lejku
  i na niej zapadła decyzja). Dopracowujemy, nie projektujemy na nowo.

## Manifest stylu (czytaj PRZED edycją — nie reverse-engineeruj HTML)

Wszystko w `bud_sessions` (id = `gen_session_id` produktu):
- `mockups[]` → wybrany styl (`chosen_style`): `tokens` (hexy palety z rolami, fonty, radius,
  cień, kształt CTA, motywy — NAJTWARDSZY autorytet), `brief` (nastrój), `spec` (odczyt vision
  z zatwierdzonej makiety: kolejność sekcji, motywy), `url` (obraz makiety).
- `ustalenia` → dla_kogo / kąt / ton / korzyści / `haslo` (**h1 = hasło klienta, świętość**).
- `brand` → `chosen_name`, `chosen_logo`, `chosen_domain`.
- `market_report` → bóle avatara, język klienta, pozycjonowanie (sekcje „Problem…",
  „Grupa docelowa", „Marka i pozycjonowanie") — paliwo do copy.
- `landing_lifestyle[]` + `ali_snapshot.images` (bud_tt_products) → dozwolone zdjęcia.

## Etapy (adaptacja landing v5 — używaj istniejących referencji)

1. **REVIEW treści** (por. `docs/landing/03-review.md`): grep-checki zakazów (niżej), h1 = hasło
   klienta, nazwa marki konsekwentnie, liczby tylko z realnych statystyk opinii.
2. **DESIGN polish** (por. `docs/landing/04-design.md` + `reference/patterns.md`): 2-3 wow moments
   (hero / środek / finał CTA), offer box, rytm sekcji, hover states, spacing. Paleta i typografia
   WYŁĄCZNIE z `tokens` — bez dryfu od stylu zatwierdzonego przez klienta.
3. **VERIFY**: 3 viewporty (Playwright/chrome-devtools — desktop 1440, tablet 768, mobile 375),
   console bez błędów, LCP/CLS sanity, wszystkie CTA → `#zamow`.
4. **MOBILE 375px** (por. `docs/landing/06-mobile.md`): sticky CTA nie zasłania treści, tap-targety,
   typografia czytelna.

## Zasady — FORK względem landingów ofert Tomka (⚠ ODWROTNIE niż `reference/safety.md` w 2 punktach)

DOZWOLONE i wskazane (sklepy klientów, model COD):
- „Płatność przy odbiorzu / za pobraniem" — to główny risk-reversal.
- Opinie klientów (realne z ali_snapshot; autor NIGDY „AliExpress Shopper" — polskie imię+inicjał).

ZAKAZY (identyczne jak w lejku — `bud-landing-gen` już ich pilnuje, nie wprowadzaj przy edycji):
- Zmyślona pilność: liczniki, „tylko dziś", „zostały 2 sztuki".
- „Dostawa w 24h", „magazyn w Polsce" — pisz „wysyłka pod Twój adres".
- Kategorie wrażliwe: zero obietnic efektów zdrowotnych.
- Zmyślone liczby/opinie/przekreślone ceny; multi-pack tylko z realną oszczędnością za sztukę.
- Zero JS, zero zewnętrznych zasobów (self-contained — TakeDrop CMS dostaje jeden plik);
  lightbox przez `:target`, animacje czystym CSS + `prefers-reduced-motion`.

## Po dopracowaniu

1. Zaktualizuj krok `html_final` w panelu (status done, `preview_url`).
2. Commit w repo (plik + ewentualne assety).
3. Przekaż do `td_strona_prod`: HTML przegrywa się do TakeDrop RĘCZNIE (Tomek); checklist
   w warsztacie kroku (zdjęcia, cena, podpięcie pod galerię).

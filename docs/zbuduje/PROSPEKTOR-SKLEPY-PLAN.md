# PROSPEKTOR B2B (sklepy) — PLAN / KONTRAKT

> SSOT modułu prospectingu dla **workflow sklepów** (budowa całego biznesu: marka, landing, sklep, sprzedaż, kampanie, grafiki, wideo).
> Wzorzec: Prospektor fabryki aplikacji (`tn-app/prospektor.html` + `wfp-engine` + `wfp_*`, kontrakt `docs/stworze/PROSPEKTOR-PLAN.md`). Kopiujemy szkielet, zmieniamy: **źródło pozyskania (Allegro, nie CSV/web_search), ICP, scoring, prompty, ofertę**.
> Prefiks: `wf2p_` (workflow sklepy — prospecting). Edge: `wf2-prospektor`. Panel: `tn-sklepy/prospektor.html`.
> STATUS: **szkic v1, 2026-07-24. NIE deployować bez akceptu Tomka.**

---

## §0. Cel i różnica vs Prospektor fabryki

Sprzedajemy **sprzedawcom na Allegro** usługę zbudowania całego brandowanego biznesu wokół ich produktów. Prospektor B2B ma dostarczyć handlowcowi (jeden handlowiec, **jakość > ilość**) bazę **wysoko dopasowanych** sprzedawców z maksymalnym zestawem informacji, żeby skutecznie dotrzeć **do właściciela** (nie pracownika) i zacząć rozmowę o ofercie.

Różnica kluczowa: fabryka pozyskuje firmy z CEIDG/katalogów + bada je OpenAI web_search. **B2B pozyskuje sprzedawców przez SKAN ALLEGRO** (patrz §3, prawo paradoksu w §1). Reszta pipeline'u (AI research → scoring → akcept human-in-the-loop → kontakt → obieg) kopiuje się z fabryki.

---

## §1. ICP — kto zyska najwięcej (4 filary + prawo paradoksu)

Wartość oferty jest maksymalna, gdy zbiegają się:

1. **Produkt brandowalny + KONTROLA podaży.** Kategoria emocjonalna/wizualna (świece, kosmetyki naturalne, biżuteria, zabawki sensoryczne, deko, moda niszowa, zwierzęta, eko) — gdzie marka+content+wideo dają premium — ORAZ sprzedawca **jest właścicielem produktu** (producent/importer/white-label/marka własna). ⛔ **Reseller cudzej ustalonej marki = słaby ICP** — nie zbudujesz „jego marki".
2. **Dowód popytu (derisk).** Realna sprzedaż na Allegro: Super Sprzedawca, dużo ocen, wysoka ocena → budżet + pewność, że produkt się broni.
3. **Luka JAKOŚCIOWA ekosystemu (= to wypełniamy).** Mierzona jakością/ambicją, nie „ma/nie ma sklepu":
   - brak własnego sklepu (Allegro-only) → luka MAKS (ale trzeba edukować o potrzebie),
   - **sklep-prowizorka (darmowy szablon/DIY) mimo świetnego produktu → SWEET SPOT** (najłatwiejszy upsell),
   - dopracowana marka i sklep → luka niska, nie potrzebuje nas.
4. **Decydent dostępny i ambitny.** JDG / mała sp. z o.o., founder-led (para/rodzina/pasjonat), reachable (LinkedIn/komórka/mail imienny).

**Prawo paradoksu (definiuje silnik):** najlepsi kandydaci (świetny produkt + Allegro-only/prowizorka) są **niewidoczni w Google** (brak porządnej domeny). Znajdujesz ich TYLKO przeglądając **listingi Allegro** i sprawdzając per-sprzedawca. → Silnik chodzi po Allegro (kategoria × marka-własna), NIE po Google.

---

## §2. Model danych (`wf2p_*`) — patrz migracja `20260724a_wf2p_prospektor.sql`

- **`wf2p_verticals`** — kategorie Allegro do skanu (brandowalne). Kluczowe: `key`, `name`, `allegro_query` (fraza skanu), `status` (katalogowy→w_skanie→zeskanowany→w_prospectingu→wstrzymany|odrzucony), `brandability_note`, `priority`.
- **`wf2p_sellers`** — 1 wiersz = 1 sprzedawca Allegro. Anchor = `allegro_login NOT NULL`. Pola:
  - Allegro: `allegro_url`, `allegro_super`, `allegro_rating`, `allegro_reviews`, `allegro_since`, `allegro_offers_count`, `sample_offer_url`, `sample_product`.
  - Firma: `company_name`, `nip`, `regon`, `legal_form` (jdg/sp_zoo/sa/inne), `city`, `region`.
  - ICP/marka: `brand_name`, `brand_owned` (bool: marka własna vs reseller), `product_category`, `www` (własny sklep), `own_shop_quality` (brak/prowizorka/pro).
  - Kontakt: `email`, `phone`, `contact_person`, `contact_role`, `linkedin_url`.
  - Scoring: `score` (0-100), `segment` (A/B/C/D), `score_reason`, `scoring jsonb` (4 sub-oceny).
  - AI: `research jsonb`, `pitch jsonb` (rekomendowany kąt + kanał).
  - Obieg: `status`, `contacted_channel`, `contacted_at`, `reply_*`, `opted_out`, `lead_id`, `is_test`.
  - Dedup unikalny: `lower(allegro_login)`, `nip`, `lower(www)`.
- **`wf2p_events`** — kronika per sprzedawca (`scan|research|score|pitch|accepted|contact|reply|status|opt_out|lead|note`).
- **`wf2p_usage`** — koszty AI. RPC **`wf2p_kpi()`** liczy w DB (costs, per_status, per_segment, per_vertical).

RLS: WSZYSTKIE tabele `FOR ALL TO authenticated` gate `team_members`, **ZERO anon** (wzorzec wfp/wfa).

---

## §3. Warstwa HARVEST z Allegro (net-new — jedyny element bez wzorca)

Panel „O sprzedającym" na Allegro **blokuje boty** (403+CAPTCHA dla fetch), ale **czyta się go prawdziwą przeglądarką** (chrome-devtools MCP). Edge (Deno serverless) NIE ma przeglądarki → **harvest uruchamia Claude z chrome-devtools** (operacja skryptowana, human-nadzorowana), zapisując surowe wiersze do `wf2p_sellers` (status `nowy`). Pętla:

1. **Skan kategorii** (`wf2p_verticals.allegro_query`) → listing → oferty + **marki własne** z tytułów/zdjęć (linki ofert Allegro owija w `events/clicks` — parsować przez `evaluate_script`, nie po `a[href*="/oferta/"]`).
2. **Grupuj po sprzedawcy**, wejdź w ofertę → panel „O sprzedającym" → odczyt: `company_name`, `nip`, `city`, `allegro_super`, `allegro_rating/reviews`, `allegro_since`, opis „O firmie" (haczyk personalizacyjny, sygnał founder-led).
3. Zapis seed → `wf2p_sellers` (status `nowy`, `source='allegro-scan'`, `source_detail` = kategoria).

**Zgodność:** dane firmy sprzedawcy biznesowego na Allegro są jawne z mocy prawa (obowiązek informacyjny). Zbieramy tylko dane firmowe/publiczne (RODO art. 14, uzasadniony interes B2B — jak w fabryce). **Bez masowego scrapingu** — jakość > ilość, wolumeny minimalne, pod jednego handlowca. ⛔ Zakaz omijania zabezpieczeń Allegro na skalę — ręczny/nadzorowany odczyt panelu, nie masowy crawler.

---

## §4. Pipeline wzbogacania (edge `wf2-prospektor`, action-based — wzorzec `wfp-engine`)

Gate `verifyTeamMember`. OpenAI Responses API + `web_search`. Kroki per sprzedawca (każdy = osobne wywołanie, izolacja rekordu, advance-only status, idempotencja):

1. **`research`** — z seeda (nazwa firmy + NIP + allegro_login) doprecyzuj: własny sklep (`www`, `own_shop_quality`), `brand_owned` (producent vs reseller), `legal_form` (JDG z nazwy / sp. z o.o. → KRS-rejestr.io po prezesa), `contact_person`/`linkedin_url`, `email`/`phone` z regulaminu/kontaktu sklepu. Output `research jsonb` + wypełnia kolumny.
2. **`score`** — 4-filarowy scoring (§5), deterministyczny w edge z wag z `settings.wf2p_scoring_weights`; sub-oceny z researchu + metryk Allegro. Zapis `score`, `segment`, `scoring`, `score_reason`.
3. **`pitch`** — rekomendacja: kąt sprzedażowy (budowa od zera / upgrade prowizorki / skalowanie) + kanał (LinkedIn DM / komórka / mail imienny) + haczyk. Zapis `pitch jsonb`.
4. **`message`** (opcjonalnie) — pierwszy kontakt dopasowany do oferty sklepów + kanału (wzorzec `wfp_prompt_mail`, ZAKAZ cen/linków w 1. kontakcie, stopka RODO doklejana serwerowo).

---

## §5. Scoring 4-filarowy (deterministyczny, wagi w settings)

Każdy filar 1-5; ważona suma → 0-100 → segment. Wagi w `settings.wf2p_scoring_weights` (tunowalne bez re-runu AI):

| Filar | Waga | Skąd sub-ocena |
|---|---|---|
| Produkt brandowalny + kontrola podaży | 30% | AI (kategoria + `brand_owned`) |
| Dowód popytu | 20% | dane Allegro (super/oceny/oferty) |
| Luka jakościowa ekosystemu | 30% | AI (`own_shop_quality`: brak/prowizorka/pro) |
| Decydent dostępny + ambitny | 20% | dane (forma prawna + kanał osobisty) |

Segmenty: **A ≥80** (kontakt teraz, kanał osobisty) · **B 60-79** (kolejka, spersonalizowany pitch) · **C 45-59** (nurture) · **D <45** (odłóż/dyskwalifikacja). ⛔ reseller cudzej marki → filar 1 ≤2 (twardy sufit).

---

## §6. Panel `tn-sklepy/prospektor.html` (wzorzec `tn-app/prospektor.html`)

Stack: statyczny HTML + Tailwind CDN + supabase-js@2.91.0 + Phosphor + `../components/shared-sidebar.js`, styl Geist. `checkAuth()` (RLS team-only), `callEngine()` → `wf2-prospektor`. Taby:
- **Pipeline** — KPI, chipy statusów, filtry (segment, wertykal, szukajka), lista sprzedawców (nazwa/marka + allegro_login + segment + score + koszt + data). Klik → drawer.
- **Drawer** — dane firmy (edytowalne) · dane Allegro · przyciski AI (`research/score/pitch/message`) · sekcja researchu (własny sklep+jakość, forma prawna, decydent, LinkedIn) · scoring 4-filarowy + segment · **pitch** (kąt+kanał+haczyk) · pierwszy kontakt (edytowalny) · status/opt-out/historia.
- **Kolejka akceptacji** — sprzedawcy `oceniony`/segment A-B do zatwierdzenia przez handlowca.
- **Wertykale** — kategorie Allegro do skanu, priorytet, „→ do prospectingu".
- **Skan** — panel operacyjny harvestu (§3): lista kategorii, ostatni skan, surowe seedy do wzbogacenia.
- **Ustawienia** — prompty/wagi scoringu/stopka.

---

## §7. Kontakt + human-in-the-loop + RODO/PKE

System **NIGDY nie wysyła sam** — handlowiec akceptuje każdą wiadomość (wzorzec fabryki). B2B: kanał częściej ręczny (LinkedIn DM / telefon / mail imienny), niż masowy Resend. Przy mailu: stopka RODO art. 14 + „STOP"=opt-out doklejane serwerowo, PKE-compliant (bez cen/linków w 1. kontakcie). Suppression nieodwracalne.

---

## §8. Integracja (5 punktów wpięcia — repo `tn-crm`)

1. Panel: **utwórz `tn-sklepy/prospektor.html`** (kopia z `tn-app/prospektor.html`, podmiana endpointu/tekstów/favicon).
2. Nawigacja: dopisz `{ id: 'prospektor', icon: 'ph-crosshair-simple', label: 'Prospektor B2B' }` do `NAV_ITEMS_SKLEPY` w `components/shared-sidebar.js`.
3. Backend: **nowa edge `supabase/functions/wf2-prospektor/index.ts`** + tabele `wf2p_*` (migracja `20260724a_wf2p_prospektor.sql`) + skrypt `scripts/apply-wf2p.mjs` (wzorzec `apply-wfp-prospektor.mjs`). Deploy: `deploy:wf2-prospektor` w `package.json` (`--no-verify-jwt`).
4. Routing: dopisz `{ "source": "/tn-sklepy/prospektor", "destination": "/tn-sklepy/prospektor.html" }` do `vercel.json`.
5. Ten dokument = SSOT/„STAN WDROŻENIA".

---

## §9. STAN WDROŻENIA

- [x] Kontrakt (ten plik) — v1 2026-07-24
- [x] Migracja schematu `20260724a_wf2p_prospektor.sql` — tabele + RLS + KPI + seed 10 wertykali + wagi/modele/prompty (napisana; **NIE zaaplikowana**)
- [x] Skrypt `scripts/apply-wf2p.mjs`
- [x] Edge `wf2-prospektor` (research → deterministyczny score 4-filarowy → pitch → message)
- [x] Nawigacja `NAV_ITEMS_SKLEPY` (Prospektor B2B) + vercel rewrite `/tn-sklepy/prospektor`
- [ ] Panel `tn-sklepy/prospektor.html` (w budowie)
- [ ] Warstwa harvest Allegro (procedura + pierwszy realny skan) — po apply migracji (tabele muszą istnieć)
- [ ] `deploy:wf2-prospektor` w `package.json`
- [ ] Akcept Tomka → apply migracji (`node scripts/apply-wf2p.mjs`) → git push (deploy panelu + edge)

### Świadomie odroczone (nie blokuje MVP)
- **Trwała suppression** (`wf2p_suppression` + check w kodzie) — dziś opt-out to flaga wiersza (`opted_out`/`status='opt_out'`). Nieodwracalna lista przeżywająca usunięcie rekordu jest potrzebna **dopiero przy realnej wysyłce maili**; B2B kontaktuje głównie ręcznie (LinkedIn/telefon). Dodać PRZED pierwszym mailowym kontaktem masowym.
- **Obieg mailowy** (send/inbox/outbox/Resend/stopka RODO art.14) — poza MVP; kanał B2B startuje ręcznie z rekomendacji `pitch`. Stopkę doklejać serwerowo dopiero przy akcji `send`.

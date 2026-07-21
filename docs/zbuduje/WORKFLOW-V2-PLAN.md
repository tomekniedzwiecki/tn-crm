# WORKFLOW V2 — plan modułu prowadzenia wspólnych biznesów (po rezerwacji /sklep)

**Status: F1 WDROŻONE + iteracje z odbioru (2026-07-03). Ten dokument = plan bazowy;
poniższa sekcja „STAN WDROŻENIA" nadpisuje szczegóły, które zmieniły się przy odbiorze.**

## 0a-sexies. MERCHANT API — FABRYKA ZAKŁADA SKLEP AUTONOMICZNIE (2026-07-21)

**LUKA ZAMKNIĘTA:** wcześniej API partnera (`wf2-platform`, X-Api-Key) NIE tworzyło sklepu —
konto i sklep na platformie „zakładał KLIENT" (provisioning po stronie developera platformy), a
krok `pl_sklep` tylko PRZYPINAŁ istniejący sklep pickerem. Od 21.07 fabryka zakłada sklep SAMA
przez **API MERCHANTA** Trevio (`gateway.trevio.pl/auth/*` + `/organization/*`, Bearer JWT
per-konto) — adapter edge **`wf2-merchant`** (`npm run deploy:wf2-merchant`, `--no-verify-jwt`;
gate `x-wf2-secret==WF2_GEN_SECRET` | service-role key | team JWT).

- Kontrakt 1-6 (registration-documents → register bez weryfikacji e-mail → token → setup/physical-product
  = TWORZY SKLEP → aktywacja trialu best-effort → GET website): pełna referencja
  `platforma-api/README.md` §MERCHANT API. **Sklep założony przez merchant API OD RAZU widnieje na
  liście `stores` API partnera** → dalej zarządzany przez `wf2-platform`.
- Akcje `wf2-merchant`: `create_store` (IDEMPOTENTNE — konto w `wf2_merchant_accounts` z hasłem →
  `created:false`; register 409 bez creds → `{needs_manual:true, error:'email_taken_no_creds'}` →
  użyj adresu systemowego `<slug>@tomekniedzwiecki.pl`), `token`, `list_accounts` (bez hasła).
- Migracja `20260721d_wf2_merchant_accounts`: tabela z hasłami kont (RLS ENABLED, ZERO polityk =
  service-role only) + kolumna `wf2_projects.platform_merchant_email`.
- Krok `pl_sklep` (paczka pl_sklep, pkt 0): jeśli projekt NIE ma `platform_shop_id` albo wskazuje
  sklep współdzielony/testowy → `create_store` PRZED przypięciem; picker zostaje jako droga ręczna.
- **Pierwsze użycie produkcyjne: Trafionek** (własny sklep `019f847d-57bf-7a84-ba72-34bf870d1ddf`,
  `trafionek.shop.tomekniedzwiecki.pl`, adres systemowy `trafionek@tomekniedzwiecki.pl` bo gmail
  klienta zajęty w Trevio) — przepięty ze sklepu współdzielonego „test", domena `trafionek.pl`
  podpięta (add_domain + dns_set OK), produkty/kroki Etapu 3 cofnięte do republikacji na nowym sklepie.

## 0a-sexies. ⛔ WYBÓR PRODUKTÓW = BRAMKA TOMKA + PINEZKI/„PRZELOSUJ" (2026-07-21 późny wieczór — NADPISUJE 0a-quinquies!)

Dyrektywa Tomka (przy projekcie Hoffy; migracja `20260722b_wf2_products_pinned.sql` WDROŻONA):
**produkty do portfela wybiera SAM Tomek w panelu — fabryka NIE startuje, dopóki portfel nie
jest skompletowany, i NICZEGO nie losuje z własnej inicjatywy.**
- **Panel (`projekt.html` + `panel-core.js`):** „Produkty" = picker (ręczny wybór z radaru
  i/lub „Wylosuj" dopełniające do celu 3); **„Przelosuj" wymienia WYŁĄCZNIE produkty BEZ
  pinezki** (`wf2_products.pinned`, toggle 📌 w macierzy desktop+mobile; zaznaczone zostają);
  losowanie/przelosowanie = czysty los (Fisher-Yates, równe szanse, zero scoringu) z puli
  approved MINUS produkty zajęte w JAKIMKOLWIEK projekcie (pkTakenGlobal — także w panelu,
  wcześniej tylko CLI) MINUS obecny portfel (wymieniane nie wracają w tym samym losowaniu).
- **Krok `wybor` auto-podąża za portfelem** (`syncWyborStep()` po każdej zmianie): pusty=
  `pending` · częściowy=`in_progress` · ≥3=`done` (+checklista VERBATIM odhaczona — wymóg
  blokady kolejności faz). `milestone_label='Portfel skompletowany — produkty wybrane przez
  Tomka'`.
- **CLI:** `panel-sync.py wybor` ma guard `--od-tomka` — bez flagi STOP z komunikatem doktryny;
  losowanie z CLI wyłącznie na jawne zlecenie Tomka. Sesja autonomiczna fabryki go NIE odpala.
- Kontekst decyzji: pierwsze losowanie fabryki (drukarka 3D za 869 zł, glebogryzarka poza
  sezonem) Tomek odrzucił — wybór produktów to decyzja biznesowa właściciela, nie fabryki.

## 0a-quinquies. KROK `wybor` PROJEKTOWY + LOSOWANIE PORTFELA (2026-07-21 wieczór — CZĘŚCIOWO NADPISANE przez 0a-sexies)

Krok `wybor` przebudowany z **per-produkt** na **project-scope** (migracja
`20260721c_wf2_wybor_project_scope.sql`, WDROŻONA). Decyzja Tomka 21.07: „Wybór produktu" per
produkt był bez sensu — produkt w portfelu = wybór z definicji dokonany (chip zawsze done, krok
bez roboty). ~~Teraz to krok **DO ZREALIZOWANIA** na poziomie projektu: fabryka SAMA losuje produkty
z całej puli approved (/trendy) i od razu dodaje je do portfela.~~ **(NADPISANE 0a-sexies: losowanie
tylko z panelu przez Tomka albo CLI na jego jawne zlecenie.)**
- **def:** `scope=project`, `label='Wybór produktów'`, `milestone_label='Portfel skompletowany —
  produkty wylosowane z całej puli'` (stage/sort/owner bez zmian: Etap 1, sort 5, admin).
- **migracja:** usunęła 38 osieroconych instancji per-produkt `wybor`, dosiała 9 projektowych,
  backfill → `done` dla 9 projektów mających ≥1 produkt (portfel istnieje = wybór zrealizowany).
- **komenda:** `panel-sync.py wybor <projekt> [--count N] [--dry-run]` — cel = dopełnienie do **3**
  produktów (decyzja 19.07); pula = `bud_tt_products status='approved'` MINUS id już użyte w
  `wf2_products` (paginacja — cała pula, bo równe szanse); losowanie `SystemRandom.shuffle` z
  filtrem różnorodności kategorii, druga runda bez filtra gdy brakuje do celu; **ZERO scoringu**
  (żaden heat/plays/daty — decyzja 17.07). Domyka krok `done` + checklista VERBATIM + fields
  `{Wylosowano, Kategorie}` + activity.
- **`link_product`:** przestał auto-domykać `wybor` per produkt; ustawia projektowy `wybor` na
  `in_progress` (portfel w budowie), `done` stawia komenda `wybor` (albo Tomek).
- ⚠️ **Do dokończenia poza tą zmianą:** `WS['wybor']` w `tn-sklepy/projekt.html` (desc + `check`)
  nadal ma STARE teksty per-produkt — wymaga aktualizacji na 3 nowe (klucz deduplikacji panelu).

## 0a-ter. PRZEBUDOWA PANELU POD FABRYKĘ (2026-07-18 noc — NADPISUJE strukturę etapów!)

Panel `tn-sklepy/projekt.html` przebudowany OD ZERA na wzór `tn-app/projekt.html`
(decyzja Tomka 17.07: „chcę pracować nad sklepem tak samo jak nad aplikacją").
Migracja `20260718_wf2_fabryka_panel.sql` (WDROŻONA — twardy swap, instancje przesiane).

- **NOWA STRUKTURA ETAPÓW (7; rozbicie „Kampanii" 19.07 — migracja
  `20260719c_wf2_kampanie_rozbicie`; wcześniej korekta 18.07 — Etap 1 = „Fundament sklepu"):**
  **1 Fundament sklepu** (kolejność wg decyzji Tomka 18.07 wieczór, migracja
  `20260718h_wf2_etap1_kolejnosc`; **rozbicie `wybor` na wybór + wycenę 2026-07-21**:
  **wybor 🏁 [product] → kalkulacja 🏁 [product] → marka 🏁 [project] → pl_domena 🏁**
  — `wybor` (sort 5) = sam wybór produktu; **`kalkulacja` (sort 7, „Kalkulacja ceny", per produkt)
  WYKONUJE FABRYKA komendą `panel-sync.py kalkulacja`: potwierdza żywą cenę zakupu (source=detail),
  ustala cenę sprzedaży w paśmie narzutu 10–15% (cena psychologiczna) i akceptuje drabinkę
  TEST→SCALE→OPT (accepted_by='fabryka'); w blokadzie kolejności przed `lp_dane`**. Marka RUSZA
  PO wyborze produktów, portfel jest kontekstem nazwy; pusty portfel = baner
  „Dobierz portfel" zamiast kroku. pl_domena PRZENIESIONA z Etapu 3 — tor domeny: zakup
  AUTOMATEM przez GoDaddy → rekordy DNS AUTOMATEM w strefie GoDaddy → propagacja 24-48 h →
  weryfikacja w Meta BM to najdłuższa ścieżka projektu, MUSI biec równolegle do landingów.
  **PRZEBUDOWA 2026-07-21 (decyzja Tomka):** koniec modelu „Tomek kupuje w LH.pl + ręczne
  wklejanie rekordów". Domenę kupuje FABRYKA (owner 'client' → 'admin') przez edge `wfa-domain`
  (GoDaddy Domains API; **zakup AUTONOMICZNY — BEZ bramki zgody** (korekta decyzji Tomka 21.07
  wieczór: `confirm:true` ustawia sesja sama, po zakupie wpisuje notę INFORMACYJNĄ retro
  `tag='info'` z domeną i kwotą `amount_pln` zamiast pytania przed); koszt auto → biznes_costs
  + wf2_costs + activity), rekordy DNS wpisuje automat przez GoDaddy DNS API (nowe akcje
  `dns_get`/`dns_set`/`dns_delete`). **NS zostają na GoDaddy** (default nsXX.domaincontrol.com) —
  ZAKAZ `set_ns`/Vercel (ODWROTNIE niż w tn-app); sklep hostuje platforma Trevio. Podłączenie =
  `wf2-platform add_domain`, aktywacja = strażnik `wf2-orders-sync` (oba bez zmian; migracja
  `20260721b_wf2_pl_domena_godaddy`). Wykonane na żywo 21.07: `trafionek.pl` (GoDaddy order
  4143108542, 30,27 zł) — `add_domain` wstrzymany do czasu właściwego konta merchanta.)
  · **2 Landing** (lp_dane → lp_plan → lp_styl_marka → lp_makiety 🏁 → lp_grafiki → lp_kod →
  lp_dopasowanie → lp_zycie → lp_finisz 🏁 — proces fabryki F0→F8 1:1, scope=product)
  · **3 Sklep na platformie** (pl_sklep 🏁 → pl_dane [client] → pl_branding → pl_dostawy →
  **pl_prawne (sort 50 — PRZED produktami/landingami)** → pl_integracje → pl_produkt [product]
  → pl_landing [product] → pl_glowna → pl_test 🏁 — wszystko przez API Trevio)
  (**pl_prawne WDROŻONE 21.07 wieczór** — SSOT `docs/zbuduje/PRAWNE.md` + narzędzie
  `scripts/mockup-tools/legal-forge.py` (data/render/publish/update-all): komplet 7 podstron
  prawnych z szablonów kanonicznych `templates/prawne-sklepy/` (stan prawny 21.07.2026:
  ODR-wygaszenie, cło 1.07.2026, Omnibus, PKE, GPSR, niezgodność z umową); 4 ścieżki
  systemowe nadpisane własnym HTML + /dostawa /polityka-cookies /formularz-odstapienia;
  wersjonowanie PRAWNE-V + **update-all = masowa aktualizacja wszystkich sklepów przy
  zmianie prawa**; HOT-UPDATE: zapis pl_dane w portalu → wf2-portal auto re-publikuje
  dokumenty (szablony ze Storage legal-szablony/, koalescencja 60 s).)
  (**pl_glowna WDROŻONE 21.07** — SSOT `docs/zbuduje/STRONA-GLOWNA.md` + narzędzie
  `scripts/mockup-tools/home-forge.py` (collect/brief/build/render/og/publish): mała
  witryna-rozdzielnia parasola; szablon projektuje RAZ gpt-5.6-sol (markery CARDS/
  CARD-TEMPLATE/ITEMLIST), karty+JSON-LD renderuje deterministycznie baza — aktualizacja
  przy nowym gotowym produkcie = `render`+`publish`, $0, idempotentnie. Produkt w galerii
  gdy status='gotowy' + platform_page_url + okładka (oferta.webp→gallery-curated→hero-d).
  Wykonane na żywo: https://trafionek.pl — 3 karty, koszt ~0,5 zł. Przy okazji Etap 3
  ODTWORZONY na własnym sklepie 019f847d po przepięciu ze sklepu „test": pl_produkt ×3 +
  pl_landing ×3 na trafionek.pl + naprawa zapieczonych STARYCH cen w landingach
  (JSON-LD/meta/copy → ceny z kalkulacji 179/74,90/109,90) + re-publish.)
  · **4 Środowisko reklamowe** (project-scope, wszystko gotowe ZANIM powstaną materiały:
  ads_konto [client] → **ads_strona** [client, NOWY: wiarygodność FB/IG] → ads_budzet [client]
  → ads_pixel 🏁 [pixel+CAPI dedup event_id, EMQ z danych COD] → **ads_preflight 🏁** [NOWY:
  bramka 0 braków — płatność schodzi, Account Quality, naming/UTM z ID, blocklista komentarzy,
  plan struktury])
  · **5 Materiały i kampania** (product-scope, fabryka kreacji → kampania → start:
  ads_grafiki [3 statyki, fabryka ad-forge/fal] → ads_wideo [+sub avi_*; finał + pack hooków ≤3 wersje] →
  **ads_zestaw** [NOWY: kompletacja 6 adów + copy COD + audyt polityki copy+LP + flagi AI +
  rejestr wf2_creatives] → ads_kampanie 🏁 [PAUSED] → **ads_start 🏁** [NOWY: bramka Tomka,
  review adów, meta_ad_ids do pętli wyników, pierwsza doba bez decyzji])
  · **6 Testy i skalowanie** (**ads_wyniki** [NOWY, auto: WF2_META_TOKEN + cron wf2-ads-sync +
  wf2_creative_perf, tabela w panelu] → test_wynik → **ads_opieka** [NOWY: komentarze/odrzuty/
  alerty/fatigue/feedback score — żyje cały test] → skalowanie → rotacja → sprzedaz_sync)
  · **7 Przekazanie sterów**. Zasady obsługi/analizy: `WORKFLOW-V2-TESTY.md` §9 (research
  3× Sonnet 19.07: Andromeda, fatigue, moderacja, automated rules).
- **KROK 'marka' = pełny kontrakt marki PARASOLOWEJ (przebudowa 18.07 wieczór, migracja
  `20260718f_wf2_fundament_marka`):** kolumny `wf2_projects.tagline/brand_opis/palette/fonts/
  logo_url/favicon_url` + binding pola nazwy do `project.name` (WCZEŚNIEJ project.name było
  MARTWE — każda paczka promptów renderowała „Marka parasolowa: —"). Krok w pełni AUTONOMICZNY
  (bramka wydatku = zakup domeny żyje w pl_domena): shortlista nazw pojemnych (portfel ROTUJE)
  + RDAP/WHOIS wolnych .pl + web-check kolizji → tagline/opis (zasilą pl_glowna) → paleta
  z rolami (jasne tła) + fonty latin-ext → logo lockup + favicon przez `brand-forge.py`
  w **TRYBIE PARASOLOWYM** (bez --product-id/--styl-master: bez rezerwacji bud_brand_names
  [wymaga product_id; dedup parasola = domena], generacja bez referencji) → Storage
  `bud-assets/parasol-<slug>/brand/` + wf2_artifacts (kind='brand', product_id NULL).
  Konsumenci kontraktu: paczki promptów (name/domain), pl_branding (logo_url/favicon_url →
  upload_logo/upload_favicon, SUROWY base64 PNG), pl_glowna + pl_prawne (tagline/brand_opis/
  palette/fonts), ads_pixel (domain → weryfikacja w BM), pl_landing (canonical).
  Kamień na 'kalkulacja': „Kalkulacja zaakceptowana — produkt gotowy do fabryki"
  (2026-07-21 przeniesiony z `wybor` na nowy krok `kalkulacja`).
  `nextStep()` w panelu: kroki wiszące u klienta/auto (in_progress) NIE blokują wskaźnika
  następnej roboty; sub-kroki (sub_of) pominięte.
- **`wf2_artifacts`** (project_id, product_id, step_key, kind, label, url, storage, meta) —
  artefakty fabryki (makiety/branding/dowody/kreacje) widoczne w warsztatach kroków panelu;
  fabryka INSERT-uje wiersz po każdym uploadzie do Storage (`bud-assets/<slug>/…`).
  Sesje dostają instrukcję w warstwie „Rytuał" paczki promptu.
- **`wf2_orders`** — surowe zamówienia z platformy (dedup po id = dokładny licznik do 1000);
  cron `wf2-orders-sync` → agregacja `wf2_sales` (source='takedrop') po `platform_name`.
- **Panel:** paczki promptów 5-warstwowe jak TN App (base fabryki + zadanie per krok + RYTUAŁ +
  GATE produkcyjny + uwagi `wf2_notes` + panelUpd z INSERT-em artefaktów), pasek „Podglądy"
  (`wf2_projects.links`), karta produktu (zdjęcie/cena/dostawca/TikToki ≤5/galeria kurowana),
  kamienie milowe (product-scope liczone per produkt), taby Projekt/Uwagi/Sprzedaż/Aktywność,
  **losowanie portfela = PRAWDZIWY random** (Fisher-Yates z całej puli approved; cel 3 —
  decyzja Tomka 19.07, wcześniej 5;
  stary scoring/dywersyfikacja SKASOWANE — decyzja Tomka 17.07).
- **Edge:** `wf2-platform` = TYPED ACTIONS (stores/publish_landing/ensure_product/
  set_checkout_slug/integracje/domeny/logo/orders/dostawy+COD; retry 429; raw zostaje) ·
  **`wf2-landing-api`** (PUBLICZNY GET ?product= → cena/checkout_url z DB, cache 5 min —
  hydratacja ceny na landingu bez re-publikacji przy test→scale) · `wf2-orders-sync` (cron).
  **Banery (`ads_grafiki`) NIE mają edge** — silnik = `scripts/mockup-tools/ad-forge.py` (fal:
  nano-banana-pro/nb2) w sesji Claude Code; edge `wf2-ads` (Manus) SKASOWANY 19.07, kolumny
  `ads_manus_*` zdjęte migracją `20260719l`, gałąź routingu w `manus-webhook` wycięta (patrz §0a-quater).
  Sync statystyk Meta = `wf2-ads-sync` (OSOBNA funkcja, nietknięta).
- **MOST fabryka↔platforma: `scripts/mockup-tools/platform-sync.py` (19.07)** — kroki pl_*
  JEDNĄ komendą z dowodami: `shops` (zajętość sklepów per projekt) · `link-shop` · `status`
  (produkty/kasy/strony/integracje + rozjazd cen) · `branding` · `product` (ensure+slug+kolumny
  platform_*+test kasy) · `publish` (placeholdery+noindex-wg-domeny+weryfikacja+platform_page_url)
  · `home` · `page` (prawne) · `unpublish`. Gate: publish bez `{{WF2_PRODUCT_ID}}` = FAIL;
  noindex zdejmowany TYLKO na domenie docelowej. **Panel (krok pl_sklep): PICKER sklepu**
  (lista partnera, wolne/zajęte, przypięcie = platform_shop_id + link) + „Stan platformy"
  live (produkty/kasy/landingi/integracje/domena); kroki pl_produkt/pl_landing pokazują
  stan produktu (kasa/landing). Fix adaptera: odpowiedź `/pages` to OBIEKT `{pages:[…]}`
  (pagesList) — wcześniej unpublish/home były martwe.
- **Landing runtime:** `docs/zbuduje/assets/landing-runtime-snippet.html` — kontrakt
  data-checkout/data-price + {{WF2_PRODUCT_ID}}; window.trevio (viewItem/addToCart/
  beginCheckout) + Meta VC/ATC/IC z **INIT-GUARD** (platforma wstrzykuje pixel na stronach
  isHtml — landing NIGDY nie robi 2. init/PageView) + doklejanie fbclid/_fbp/_fbc do kasy.
- Świeży katalog API (26 endpointów + guide `window.trevio`): `platforma-api/docs-raw.json`.

## 0a-quater. FABRYKA STATYCZNYCH GRAFIK ADS (2026-07-19 — silnik ad-forge/fal, Manus usunięty)

Krok `ads_grafiki` (Etap 5) = PEŁNA FABRYKA na wzór landingów i wideo — SSOT + playbooki +
bramki QA z dowodami + rejestr z rodowodem + pętla wyników + odzwierciedlenie w panelu.
**Silnik generacji = WYŁĄCZNIE fal (nano-banana-pro/nb2) przez `scripts/mockup-tools/ad-forge.py`**
(decyzja Tomka 19.07: „fabryka banerów = ad-forge/fal" — edge `wf2-ads` i cały tor Manusa USUNIĘTE
z modułu; kolumny `ads_manus_*` zdjęte migracją `20260719l`). Workflow v1 i lejek /sklep (`bud-ads`)
zostają na Manusie — to ich osobny tor, nietknięty.

- **Zestaw startowy (D2):** ŁĄCZNIE **3 kreacje** — 3 kąty (`demo`/`problem`/`lifestyle`) × 1 format
  **4:5** (1080×1350) w JEDNYM przebiegu ad-forge; pliki `ad_<n>_<angle>.png` (back-compat parsera).
  `proof` (opinie/liczby zamówień) = OPCJONALNY, tylko na jawne `--angles …,proof` (decyzja
  Tomka 19.07 „nie rób grafiki z opiniami"); walidacja białą listą `demo`/`problem`/`lifestyle`/`proof`.
  Format 9:16 (safe-zones 14/35/6%) = opisane ROZSZERZENIE na przyszłość, nie generowane domyślnie.
- **Awaria:** brak danych/refów (gate G0) → STOP fazy; literówka → drugi kandydat / surgical fix
  (bramka tekstu G4); morf/niewierność → drugi kandydat → surgical fix → regeneracja (bramka G3);
  awaria fal (kredyty/timeout joba) → przebieg zatrzymany, RECLAIM opłaconych jobów po restarcie sesji.
- **SSOT + playbooki:** `docs/zbuduje/STANDARD-GRAFIKI-SKLEPY.md` (zasady ZG1–ZG9, fazy G0–G8,
  formaty/polityka Meta/rejestr/modele D10) + `docs/zbuduje/ad-playbooks/PLAYBOOK-ad-{demo,problem,lifestyle,proof}.md`
  (`lifestyle` = domyślny 3. kąt; `proof` = opcjonalny).
- **Bramki QA (D8):** `scripts/mockup-tools/ad-gate.py` (pomiary: miniatury @320px, safe-zones dla
  `*_916*`, pHash pairwise kątów) + werdykt agentowy; dowody → `bud-assets/<slug>/ads/dowody/` +
  `wf2_artifacts` kind='proof'.
- **Rejestr + pętla (D5/D11):** migracja `20260719d_wf2_grafiki_fabryka.sql` — `wf2_creatives`
  rozszerzone o `media_type/angle/format/pattern_ref`; widok `wf2_creative_perf` +CTR/CPC/CPA;
  nowy `wf2_angle_perf` (image, group by angle+format); sub-kroki `agr_brief/generacja/qa/final`
  (sub_of='ads_grafiki', stage=5). `wf2-ads-sync` mapuje po `meta_ad_ids` — bez zmian.
- **Panel (`tn-sklepy/projekt.html`):** `adsGrafikiBlock(p)` — timeline `agr_*`, galeria 3 kreacji
  4:5 z lightboxem + badge kąta/„AI", akcept per kreacja (toggle ✓/✗ → `ads_creatives.approved`),
  suma kosztów z `wf2_costs`, CTA „Generuj przez ad-forge (sesja Claude Code)" (kopiuje paczkę
  promptu). Pill/link manus.im/„Reset" USUNIĘTE 19.07. `map.ads_grafiki` = pełny rytuał G0–G8 z odesłaniem do SSOT.
- **Flaga AI (D9):** `ai_labeled=true` w rejestrze — Meta 2026 egzekwuje disclosure.

## 0a-bis. FABRYKA LANDINGÓW — STAN (2026-07-16 wieczór, po 2 dniach dopracowywania flow)

- **SSOT flow:** `docs/zbuduje/STANDARD-LANDING-SKLEPY.md` **v2.0** (zasady Z1-Z5, fazy
  F0→F8 z RETRO, leksykon lekcji) + `docs/zbuduje/SEKCJA-Z-MAKIETY.md` (procedura wiernego
  kodowania sekcji z makiety: IR z ekstrakcją algorytmiczną, anotacje SoM, mierzalna pętla
  SSIM z heatmapą, rewrite-not-patch; z researchu 3× Sonnet + pilot z wnioskami).
- **Toolchain:** `scripts/mockup-tools/` — mockup-ir.py (paleta k-means, typografia OCR,
  bloki, anotacje), render-diff.py (CDP headless, SSIM, heatmapa, keep-best, letterbox
  mobile), wf2gpt-call.py (UTF-8 klient wf2-gpt; env WF2_EFFORT/WF2_MAXOUT).
  Edge: wf2-gpt (reasoning.effort; plan/krytyk=medium — high pada 504), wf2-gen,
  wf2-asset-rehost. Pay-badges kanoniczne: `docs/zbuduje/assets/pay-badges.html`.
- **Landingi (preview, noindex, placeholdery pixel/canonical):**
  Zmieścik `sklepy/tomek-niedzwiecki/zmiescik/` (v5 po pętli krytyka) ·
  Świtek `.../switek/` (pełny przebieg fabryki + procedura v2: demo przepisane 0.78→0.81
  + scena lifestyle; rollout reszty sekcji PRZERWANY na etapie weryfikacji — sweep SSIM
  zrobiony, sekcje wpięte, plik spójny 13/13 sekcji) ·
  Blasik `.../blasik/` (czysty test standardu v2.0, $1.15, etap życia z auto-zajawką demo).
  Skasowane (rebuild pełnym flow gdy wróci kolejka): Mordulek, Blatek, squishy.
- **Koszty:** cała 2-dniowa nauka fabryki ~$13 z budżetu $54 (200 zł); docelowy landing
  czystym procesem ~$3-4.5 (11-17 zł) przy budżecie 25 zł/landing.
- **Otwarte decyzje Tomka:** kanon makiet (pełne pary UI jak Świtek vs sceny-jako-makiety
  jak Blasik); akcept landingów do publikacji; kolejka #3-5.
- Archiwa wersji/makiet/kompozytów: `Desktop\TN-Sklepy-grafiki\FABRYKA-16.07\` (+ NOC-15-16.07
  historycznie); ledger kosztów w scratchpadzie sesji (podsumowany wyżej).

## 0a. STAN WDROŻENIA (po odbiorze Tomka, 2026-07-03 wieczór)

- **Osobna aplikacja `TN Sklepy`** (nie podstrony tn-workflow): `tn-sklepy/index.html` (lista)
  + `tn-sklepy/projekt.html` (projekt). LIVE: `crm.tomekniedzwiecki.pl/tn-sklepy/index`.
  Rejestracja w `components/shared-sidebar.js` (APPS/APP_BASES/NAV_ITEMS_SKLEPY;
  GOTCHA: `detectCurrentApp` sprawdza `/tn-sklepy` PRZED `/tn-sklep`).
- **Etapy 1–5** (bez etapu „Start" i bez kroku „Raport" — decyzja przy odbiorze):
  1 Portfel produktów · 2 Sklep TakeDrop · 3 Kampanie (konto → **budżet** → pixel →
  grafiki → kampania — „najpierw kasa") · 4 Testy i skalowanie · 5 Przekazanie sterów.
- **Projekt BEZ własnej nazwy** — identyfikacja po kliencie; docelowa wizytówka = link
  do galerii landingów klienta (kolumna `name` została w schemacie, UI jej nie używa).
- **Harmonogram płatności UKRYTY z UI** (przeszkadzał) — tabela `wf2_payments` i wpis
  rezerwacji z webhooka zostają; wróci później.
- **Warsztat kroku (drawer)**: klik w kartę/komórkę macierzy otwiera panel z konkretną
  robotą — config `WS` per step_key w projekt.html (opis, pola z bindingiem
  `col: 'project.X'|'product.X'`, checklisty, prompt dla Claude, statystyki + decyzja
  WINNER/KILL w `test_wynik`).
- **Lista**: rozwijany podgląd projektu (etapy + portfel) + „Rozwiń wszystkie".
- **Portfel z pickera /trendy** (approved, sort heat, zdjęcie: curated → snapshot Ali →
  cover TikToka z badge, cena $, znacznik pewnego snapshotu) + ręczne dodanie.
- **Dwa typy klientów**: A = z lejka /sklep (auto-create w tpay-webhook; produkty
  z `gen_session_id` pokazują w warsztatach generacje z `bud_sessions`: marka+logo,
  makiety, lazy podgląd landing_html) · B = przenoszony z TN Workflow v1 (select
  w modalu nowego projektu → prefill, budowa od zera).
- **Marża z aukcji AliExpress**: sekcja „Aukcja" w modalu produktu — cena $ z snapshotu
  × kurs NBP (cache 24h) → „Wstaw jako cenę zakupu"; „Ustaw cenę docelową" (marża
  testowa ~15%, od 2026-07-04); aukcja NIEPOTWIERDZONA (source≠'detail') = bursztynowy
  alert + szukanie po zdjęciu (AliPrice/Lens) + podmiana linku z auto-rebuildem snapshotu.
- **bud-ali-snapshot NAPRAWIONY**: endpoint `/api/v3/product-info` (USD/EN; odpowiedź-
  tablica), snapshot z ceną; LIMIT: bez opisu i cen SKU (wymagałoby drugiego API).
  Pokrycie po backfillu: 136/136, w tym 78 'detail', 133 z ceną, 119 z opiniami.
- **Styl modułu = Geist/Vercel** (twardo): tła #0a0a0a/#111, 1px bordery #1f1f1f–#333,
  akcent #0070f3, success #45a557, warning #f5a623, error #e5484d, promienie 6–8px.
- **Dane demo**: 5 projektów „DEMO …" na różnych etapach (kasowanie: zębatka → Usuń projekt);
  DEMO Karolina spięta z testową sesją NocWTrasie (typ A z generacjami).
- **Iteracje 2026-07-04:** (a) Etap 2: `td_strona_prod` (sort 50) PRZED `td_galeria` (sort 60) —
  decyzja Tomka: najpierw strony produktów, galeria je spina; (b) edge `wf2-gen` — admin proxy
  generatorów bud-* (team JWT albo `x-wf2-secret`==env `WF2_GEN_SECRET`; forward z `x-admin-secret`
  serwerowo) — podwalina F2 „generatory portfela"; (c) `PROCEDURA-HTML-PRODUKTU.md` NAPISANA
  (dopracowanie draftu w Claude Code; manifest stylu z `bud_sessions`: mockups[].tokens/spec +
  ustalenia + brand + market_report); (d) pierwszy produkcyjny projekt typu A utworzony ręcznie
  (Wojciech Ostrowski, przed opłaceniem rezerwacji — wyjątek na życzenie Tomka);
  (e) **portfel — picker dwutrybowy:** „+ Produkty" → AUTO-dobór (dopełnia portfel do 5;
  pusty portfel → 10; scoring: heat + żywa aukcja + cena + kategoria portfela, dywersyfikacja
  nazw/półek cenowych/kategorii; bulk insert z prefill: cena zakupu = snapshot ali × NBP,
  cena sprzedaży = +15%) albo RĘCZNY (wszystkie approved z /trendy, zdjęcia TYLKO z aukcji
  AliExpress — nigdy cover TikToka); (f) **marża testowa = ~15% narzutu na koszt**
  (`TEST_MARGIN_PCT` w projekt.html, zastępuje widełki 5–10 zł/szt.); (g) **warsztat kroku
  `wybor` przebudowany na minimal** (wyborBody): cena zakupu z hintem żywej aukcji („Wstaw")
  + linki „Wybrana oferta" / „AliPrice — szukaj po zdjęciu" (kopiuje URL zdjęcia z aukcji) /
  „zdjęcie" → cena sprzedaży (przycisk +15%) → marża zł/% na żywo; bez checklisty i notatek —
  pełna kalkulacja (wysyłka/prowizje) została w modalu edycji produktu.

Źródło prawdy procesu biznesowego: `settings.budowanie_model_biznesowy` → sekcja „PROCES PO REZERWACJI"
(rozmowa → płatność → portfel 5–10 produktów → TakeDrop → grafiki → kampanie Meta → 2–3 winnery →
wdrażanie → ~1000 zamówień = przekazanie sterów → tryb comiesięczny).

## 0b. KONCEPCJA PRODUKCYJNA (2026-07-15) — wejście w skalę 100+ projektów

**🎯 CEL NADRZĘDNY WSZYSTKIEGO (decyzja Tomka, zapisana na jego wyraźne życzenie):
TE SKLEPY MUSZĄ FAKTYCZNIE SPRZEDAWAĆ. Każda decyzja w module — funkcja, test, analiza,
mechanizm — ma być oceniana przez pryzmat „czy przybliża sklep klienta do sprzedaży".
Jeśli w trakcie pracy widać, że czegoś brakuje (funkcja na landingu, test, analiza
z OpenAI, mechanizm w workflow) — DOROBIĆ OD RAZU i wnieść do fabryki (globalnie),
nie tylko do jednego projektu.**

Zasady pracy (przeniesione z sesji rozwojowej TN App — fachmat):
- Pierwszy przebieg = jednocześnie budowa sklepu I dopracowanie workflow. Naprawiaj
  PROMPT/element workflow, nie jednorazowy wynik. Pre-review przed każdym etapem.
- Sesje idą „jedno za drugim" autonomicznie; bramki człowieka TYLKO: publikacja kampanii
  (PAUSED→ACTIVE), zmiany cen, migracje/RLS, wydatki, usuwanie danych.
- Dowody, nie deklaracje: status `done` wyłącznie z dowodami (linki, liczby, zrzuty).
- Model routing: koncept/sens fabryki = Fable 5 (główna pętla); wykonanie delegowane
  do agentów Opus 4.8 / Sonnet 5.
- Research w necie zawsze, gdy etap tego wymaga (benchmarki, dokumentacje, wzorce).

### API platformy sklepy.niedzwiecki.ai (zapiski developera, 2026-07-15)

Robota, która w v1 była ręczna (TakeDrop CMS), będzie robiona PO API własnej platformy:

- **Strony**: pobranie listy URLi · nadpisanie podstrony HTML-em · dodawanie kolejnych podstron.
- **Produkty**: lista produktów z wariantami i LINKAMI DO KASY · aktualizacja linku do kasy
  dla wariantu · utworzenie produktu.
- **Zamówienia** (paginacja po dacie): id, numer, produkty (nazwa, cena, ilość), wartość
  zamówienia, koszt dostawy, data — BEZ danych klienta; id + active domain website.
- **Domeny**: dodanie domeny → zwrot rekordów (od razu z www) · pobranie rekordów · aktywacja.
- **Logo/favicon**: endpoint wgrania.
- **Sklepy partnera**: lista (id, aktywna domena).

Konsekwencje architektoniczne:
1. **Zamówienia pobieramy PO API** (decyzja Tomka) → edge `wf2-orders-sync` (cron) zamiast
   importu plików; `wf2_sales.source='takedrop'` zostaje jako nazwa źródła „platforma".
2. **Landingi publikujemy PO API**: każdy merchant ma stronę główną (galeria testowych
   produktów + otoczka marki, linkuje do produktów) i podstrony produktowe (landing 1-produktowy).
   Landing MUSI używać linku do kasy z API produktu (per wariant) — to spina landing
   z checkoutem e-commerce. Generujemy HTML z placeholderem CTA, przy publikacji podmieniamy
   na checkout_url z API.
3. Kroki etapu 2 do przemapowania przy wdrożeniu warstwy API (klucze td_* ZOSTAJĄ — zmienią
   się labelki/ownery/instrukcje): td_strona_prod → owner `auto` (publikacja landing po API),
   td_galeria → owner `auto` (strona główna po API), td_domena → półautomat (API + DNS klienta).
   Do czasu wdrożenia NIE zmieniamy step_defs (projekt Wojciecha idzie starą ścieżką TD).
4. Nowe kolumny (migracja `20260715_wf2_produkcja_fundament`): `wf2_projects.platform_shop_id`
   + `deadline_at`; `wf2_products.platform_product_id/checkout_url/platform_page_url`;
   `wf2_step_defs.milestone_label`; tabela `wf2_notes` (uwagi Tomka → wstrzykiwane do promptów).
5. ✅ OTRZYMANE 16.07: base URL `https://gateway.trevio.pl/partner/v1`, auth `X-Api-Key`
   (klucz per partner = edge secret `ecom_platform_API`), docs maszynowe `GET /docs`,
   limit 120 req/min. Adapter edge **`wf2-platform` WDROŻONY** (gate jak wf2-gen: team JWT
   lub x-wf2-secret; na razie tryb `raw`). **Pełna referencja + wyniki testów + LUKI
   (PUT html not implemented = blokada landingów; POST pages 502; produkt tylko name+price):
   `docs/zbuduje/platforma-api/README.md`**.
   **PYTANIA PŁATNOŚCIOWE (15.07, po decyzji o pasku metod na landingach):** (a) czy checkout
   wspiera POBRANIE (COD)? — cała narracja risk-reversal na landingach na tym stoi;
   (b) dokładna lista metod Autopay w checkoucie (BLIK? karty Visa/MC? pay-by-link?) —
   na landingach pokazujemy TYLKO realnie dostępne ikony; (c) czy checkout może dostać
   logo+kolory marki sklepu (spójność wizualna landing→kasa tnie drop-off).
5b. **WYMAGANIA GEO wobec platformy (z docs/zbuduje/GEO-LLM.md — znajdowalność w LLM):**
   (a) robots.txt z jawnym Allow dla botów-RETRIEVAL: OAI-SearchBot, ChatGPT-User,
   Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Googlebot, Bingbot, Applebot
   + linia Sitemap; (b) jeśli Cloudflare/WAF — te boty na Allow (od VII.2025 domyślna blokada AI!);
   (c) sitemap.xml wszystkich podstron z UCZCIWYM lastmod (tylko realne zmiany); (d) canonical
   self per podstrona; przy publikacji podmiana {{CANONICAL_URL}} i zdjęcie noindex z naszego
   HTML-a; (e) **FEEDY produktowe: Google Merchant Center (free listings — warunek AI Mode),
   Bing MC, Perplexity Merchant Program (darmowy)** + pole GTIN w danych produktu; cena/stan
   feed↔strona 1:1; (f) podstrony = statyczny serwerowy HTML (nasz plik 1:1, nie SPA-wrapper).
6. **WYMAGANIA TRACKINGOWE wobec platformy (z WORKFLOW-V2-TESTY.md §7 — checkout jest na
   innej domenie niż landing!):** (a) możliwość wpięcia Meta pixela per sklep na checkoucie,
   (b) przechowanie `pixel_id` + tokenu CAPI per sklep, (c) emisja `Purchase` przez CAPI
   server-side z `event_id` (dedup z pixelem przeglądarkowym), (d) odbiór parametrów
   `fbclid/_fbp/_fbc` doklejanych przez landing do linku kasy i dołączanie ich do zdarzenia.
   Bez (c) zakupy przy iOS/blokerach będą niedoszacowane i system decyzji testów kuleje.
7. **Architektura marki v3 (15.07 wieczór — NADPISUJE v2 z tego samego dnia):** 1 sklep =
   1 DOMENA PARASOLOWA (np. znajdzik.pl) + strona główna-galeria, ale **każdy produkt to
   MINI-MARKA z własną nazwą i logo** (np. znajdzik.pl/chlodzik): na landingu widać
   WYŁĄCZNIE markę produktu (logo w topbar/stopka, title/meta/OG/SEO/**GEO** pod nią);
   parasol widoczny tylko w pasku adresu i na stronie głównej. „Wygląda jak marka, nie jak
   podstrona sklepu." Slug URL = nazwa mini-marki. Nadal ZERO osobnych domen per produkt.
   Krok `marka` (project) = domena parasolowa + strona główna; krok `branding` (product) =
   MINI-MARKA: nazwa+logo+persona+obietnica+hooki (WS zaktualizowany). Typ A: marka z lejka
   /sklep = baza mini-marki GŁÓWNEGO produktu klienta, parasol dobierany osobno.
   Pilot: koc = „Chłodzik". GEO (znajdowalność w LLM): research + sekcja w
   STANDARD-LANDING-SKLEPY (wdrożenie: JSON-LD Product/Offer/FAQ/AggregateRating z realnych
   danych + wymagania do platformy: robots.txt boty AI, llms.txt, sitemap).
7b. **STANDARD-LANDING-SKLEPY.md (15.07)** — landingi produktowe projektujemy POD KONWERSJĘ
   (research CRO: Baymard/CWV/Gemius/tpay/FTC), nie wg estetyki starej procedury. Filary:
   message match z kreacją (wymienny moduł hero `?h=N`), mikro-oferta w 1. ekranie, COD jako
   narracja 1-2-3, sticky CTA, 1 font custom (LCP<2,5 s), eventy ATC/IC spięte z checkpointami
   CP2, benchmark CR 3%+. Gate: checklist + pętla krytyka-CRO do czystej rundy.
8. **Etap Kampanie dopracowany wg etapu Reklamy v1 (15.07):** ads_konto = 4 pod-kroki klienta
   (konto w BM klienta PLN / fanpage / Instagram / telefon SMS) + partner access „Pełna
   kontrola" do BM Tomka (737839566050751, 3 assety naraz) + metoda płatności; ads_budzet =
   płatności RĘCZNE (prepaid 1000 zł: BLIK/przelew/PayU, nie karta) + weryfikacja realnych
   środków (lekcja v1: klient odhacza „doładowałem" bez środków → mail budget_not_funded);
   ads_pixel = pixel w TYM SAMYM BM co konto (incydent v1: pixel w BM Tomka + konto klienta
   = WCA nie działają!) + strona przypisana do konta (wymóg create_ad) + weryfikacja OBU
   domen + CAPI na checkoucie platformy + Purchase w Test Events jako gate; ads_kampanie =
   konwencje z WORKFLOW-V2-TESTY.md §1. `instructions_md` ads_konto/ads_budzet = pełne
   instrukcje klienckie (z boxem „częste pomyłki" z v1) — gotowe pod portal. Automaty
   mailowe etapu (wzorzec v1: ads_activated → partner_step_completed → ads_completed +
   budget_not_funded) = do F4.

### Analityka platformy (20.07 — WDROŻONA; referencja: platforma-api/README.md §Analityka)

API dostało payments[] (status/COD/BLIK/provider), atrybucję per zamówienie (sesje+utm+clickIds+
journey lejka z productId) i endpoint ceny. Wdrożone w wf2 (migracja `20260720b_wf2_analityka`):
`wf2_orders.is_paid/payment_method/attribution_*`, `wf2_sales.orders_paid/revenue_paid`,
`wf2_products.orders_confirmed`; cron `wf2-orders-sync` dociąga atrybucję (limit 20/projekt/run,
retry 404 24h, okno 14 dni, PII `identity` wycinane). **Kroki spięte (instructions_md w step_defs):**
`ads_pixel` = pixel na sklep PRZEZ API (set_integration, PUT auto-włącza) + gate Purchase w Test
Events; `ads_wyniki` = DWIE KSIĘGI (spend z Meta + przychód z platformy per utm_campaign/utm_content —
**konwencja: URL reklamy z utm_campaign={kampania} i utm_content={kreacja}**, rozjazd >30% = nota);
`sprzedaz_sync` = payments prawdą (COD Pending ≠ sprzedaż); `test_wynik` = werdykt z orders_confirmed.
Sonda E2E 20.07: zamówienie COD 95677872 (sklep test) → is_paid=false/cod, attributed_source
facebook/paid, campaign WF2-TEST-usmieszek, fbclid złapany, journey 9 eventów.

### Cennik dwufazowy (decyzja Tomka 15.07)

> **18.07: pełny projekt modułu cen → `CENNIK-PLAN.md` v2.0** (silnik decyzji produktowych:
> drabinka TEST→SCALE(ramp→baza)→OPT po kontrybucji zł/dzień, `wf2-price-engine` +
> **`wf2-ads-sync` (NOWY prerekwizyt — wf2_ad_stats nikt dziś nie zapełnia!)** + reconcile
> + kill-switch, panel `ceny.html`, AOV/multipak, klient-notify; endpoint ceny i status
> płatności DOROBI developer — decyzje Tomka 18.07, spec §3.4; ⛔ P0: mapper orders-sync
> nie czyta zagnieżdżonych `{amount}` → revenue=0, fix w W1). v2.0 = po rundzie krytyków
> (2× Opus) + researchu (2× Sonnet). Status: PLAN OSTATECZNY — czeka na akcept Tomka;
> parametry progów NADPISUJĄ §6 TESTY.md po akcepcie.

- **Faza TEST**: marża 15% narzutu na koszt (`TEST_MARGIN_PCT`, już w UI). Świadomie
  nierentowna — cel: szybkie pierwsze OPŁACONE zamówienia (walidacja popytu, social proof,
  dane), nie zysk. Koszt tej fazy = koszt walidacji produktu.
- **Przejście TEST→SCALE**: po ~5 opłaconych zamówieniach produktu (próg konfigurowalny
  w settings) — automat wykrywa próg z `wf2_sales` (API zamówień) i proponuje zmianę.
- **Faza SCALE**: cenę proponuje AI (OpenAI — drobne automaty) z danych: koszt produktu,
  metryki Meta (CPC/CTR/koszt zakupu z `wf2_ad_stats`), widełki rynkowe z raportu produktu.
  Output: propozycja + uzasadnienie + widełki. CENA = BRAMKA CZŁOWIEKA (Tomek akceptuje,
  klient ustawia na platformie / my przez API gdy będzie endpoint ceny).
- Szczegółowy system decyzji testów (progi KILL/OBSERWUJ/WINNER, mechanika kampanii,
  alokacja budżetu): **`WORKFLOW-V2-TESTY.md`** (PRZYJĘTY 15.07; defaulty w settings:
  `wf2_test_config` + `wf2_scale_config`; dane: migracja `20260715b_wf2_testy_dane`).
  Kluczowa decyzja: alokacja DWUBRAMKOWA 500 zł (5×50 siew → 250 na 1-2 survivorów),
  bo 5×100 nie produkuje ani jednego wiarygodnego werdyktu zakupowego. WYMÓG fazy testowej:
  dostawę płaci klient (przy marży 15% wysyłka po stronie sklepu = strata przed reklamą).

### Kampanie reklamowe (decyzja Tomka 15.07)

- Budżet projektu: **1000 zł = 500 zł testy 3 produktów → 1-2 winnery → ~500 zł skalowanie**
  (19.07: portfel zmniejszony z 5 → 3 — decyzja Tomka; ~165 zł testu/produkt zamiast ~100 zł).
- Content reklamowy (banery): **fabryka ad-forge/fal** (`scripts/mockup-tools/ad-forge.py` —
  copy PL przez `wf2-gpt` → sceny fal nano-banana-pro → typografia/logo; referencje = zdjęcia
  produktu + landing). Manus USUNIĘTY z modułu wf2 (19.07); zostaje w v1 i lejku /sklep.
- Kampanie przez **Meta MCP na koncie reklamowym KLIENTA** (przygotowanie konta+budżetu =
  zadanie klienta, krok `ads_konto`/`ads_budzet` + instrukcja udostępnienia do BM Tomka).
  1 kampania = 1 produkt, wszystko PAUSED, publikacja ręcznie (bramka).
- Sync wyników: dzienny cron → Graph API insights per `campaign_id` → `wf2_ad_stats`
  (MCP tylko do TWORZENIA kampanii; odczyt przy 100+ projektach musi być bezobsługowy).

### Fazy wdrożenia produkcyjnego (kolejność ustala Claude, 15.07)

- **A (w toku):** przebieg Etapu 1 na projekcie rozwojowym Tomka (`baacc66f…`,
  tomekniedzwiecki@gmail.com, 5 produktów z /trendy) + fundament: wf2_notes, milestone_label,
  deadline_at, kolumny platformy [DONE], system decyzji testów [agent w toku],
  paczki promptów 5-warstwowe wzorem TN App (base+map+RITUAL+notesBlock+panelUpd).
- **B:** warstwa API platformy (`wf2-platform` adapter + `wf2-orders-sync`) — GDY developer
  da dokumentację; do tego czasu mock/stub na projekcie rozwojowym.
- **C:** portal klienta `wf2-portal` (wzorzec wfa-portal 1:1: token+hasło SHA-256, zero anon
  RLS, intake „wszystko na raz", sekcja „Twój ruch", kamienie) + instrukcje kroków klienta
  (konto platformy, dane prawne, bramka płatności, konto ads + budżet + udostępnienie BM).
- **D:** moduł testów (plan testu 500/500, progi w settings, automat test→scale,
  `wf2-price-propose`) + `sklepy-wyniki.html` (centrum wyników wszystkich projektów)
  + automaty (Slack WINNER/KILL/klient-utknął, drip mailowy z idempotentnym claimem).

## 0. Decyzje Tomka (2026-07-03)

| Pytanie | Decyzja |
|---|---|
| Dane sprzedaży per sklep | **Meta (pixel przez MCP) + import pliku ze sprzedażą z TakeDrop** — pixel na bieżąco, plik TD jako korekta/prawda |
| Relacja do workflow v1 | **Osobny moduł** — nowe tabele i ekrany; v1 nietknięty dla obecnych klientów |
| Portal klienta | **Minimalny od razu** — token+hasło, instrukcje TakeDrop do odhaczania, postęp read-only |
| Finalny HTML produktów | **Repo → TakeDrop CMS** — źródło prawdy w repo, dopracowanie w Claude Code, HTML przegrywany do TD |
| Marża testowa | Start z niską marżą **5–10 zł zysku/szt.** (test potencjału), po winnerze przejście na marżę skalowania |
| Konfiguracja sklepu TD | **Zleca ją KLIENT** na podstawie instrukcji (checklisty w portalu) |

## 1. Czego uczymy się z v1 (zasady projektowe)

Tomek LUBI w v1: lista projektów z licznikami przy krokach (ilu klientów czeka gdzie), rozdzielenie
etapów na sekcje z tabami, badge'y postępu. **UX odwzorowujemy 1:1.**

Ból v1, którego v2 NIE dziedziczy:
1. **~30 miejsc w 4-5 plikach na dodanie jednego kroku** (`CLAUDE_NEW_STEP_PROCEDURE.md`) → v2:
   kroki są KONFIGURACJĄ w DB (`wf2_step_defs`), nowy krok = 1 INSERT, zero zmian schematu i frontu.
2. Postęp rozsypany po flagach boolean w tabelach per-etap (`workflow_takedrop.test_accepted`,
   `workflow_ads.report_sent`…) + martwe `current_milestone_index`/`milestones_snapshot` → v2:
   JEDNA tabela instancji kroków (`wf2_steps`), postęp = `count(done)/count(*)` per etap. Jedno źródło.
3. Pliki 15k+ linii z trzema ekranami i legacy → v2: osobne, małe pliki; bez ekranu-zombie.
4. Brak encji „wiele produktów per klient" → v2: `wf2_products` z własnym pipeline per produkt.
5. Brak P&L per sklep (koszty reklam globalne w `ad_expenses`) → v2: `wf2_ad_stats` + `wf2_sales`
   per projekt/produkt → wynik testu = zysk jedn. × sztuki − spend.

## 2. Etapy i kroki v2 (seed `wf2_step_defs`)

`owner`: kto wykonuje (admin=Tomek/Claude, client=klient wg instrukcji, auto=system).
`scope`: project = raz na projekt, product = raz na każdy produkt portfela.

### ETAP 1 — Start (scope: project)
| Krok (key) | Label | Owner | Co trzyma `data` |
|---|---|---|---|
| `rozmowa` | Rozmowa + plan | admin | notatki z rozmowy, link do planu przedsięwzięcia |
| `umowa` | Umowa | admin | link/status podpisu (reuse procedury umów v1) |
| `platnosc` | Płatność | admin | harmonogram w `wf2_payments` (całość / raty / indywidualny) |
| `kickoff` | Kickoff | admin | dostępy, dane klienta, ustalenia operacyjne |

### ETAP 2 — Portfel produktów (scope: product) — UI: macierz produkty × kroki
| Krok | Label | Owner | Uwagi |
|---|---|---|---|
| `wybor` | Wybór + kalkulacja | admin | produkt z /trendy lub rozmowy; kalkulator marży (§5) |
| `raport` | Raport | admin/auto | generator `bud-raport` (tryb final) |
| `branding` | Branding | admin/auto | `bud-brand` (tryb final) |
| `design` | Design (makiety) | admin/auto | `bud-mockup` (tryb final) |
| `html_draft` | HTML draft | auto | `bud-landing-gen` → start do dopracowania |
| `html_final` | HTML final | admin | Claude Code + verify (§6); commit w repo |

### ETAP 3 — Sklep TakeDrop (scope: project, poza `td_strona_prod`)
| Krok | Label | Owner | Uwagi |
|---|---|---|---|
| `td_konto` | Konto TD | **client** | instrukcja w portalu |
| `td_konfiguracja` | Konfiguracja sklepu | **client** | checklista instrukcji (płatności, wysyłki, maile TD…) |
| `td_dane_prawne` | Dane prawne | **client** | regulamin/polityka/RODO — instrukcja + szablony |
| `td_bramka` | Bramka płatności | **client** | instrukcja |
| `td_galeria` | Strona główna (galeria) | admin | spina strony produktowe w jeden sklep |
| `td_strona_prod` | Strony produktów | admin | **scope: product** — wgranie HTML final do TD |
| `td_domena` | Domena | admin | |
| `td_test` | Test zakupowy | admin | zamknięcie etapu — sklep gotowy do ruchu |

### ETAP 4 — Środowisko reklamowe (od 19.07 rozbite z dawnych „Kampanii"; scope: project)
| Krok | Label | Owner | Uwagi |
|---|---|---|---|
| `ads_konto` | Konto reklamowe | client (przez Leadsie) | **Tor Leadsie** (przebudowa 21.07): klient klika „Połącz konta reklamowe" → Leadsie tworzy BM + konto reklamowe (gdy brak) i nadaje partner access do BM Tomka → webhook `wf2-ads-connect` (gate `?s=WF2_LEADSIE_SECRET`, format v2) auto-odhacza „konto" + „partner access", zapisuje `data.leadsie` i `meta_ad_account_id`. Ręcznie klient: metoda płatności + telefon/2FA. Weryfikacja PLN + Europe/Warsaw (nieodwracalne) = ręcznie/po `WF2_META_TOKEN`. SSOT: `docs/zbuduje/ADS-ONBOARDING-LEADSIE.md` |
| `ads_strona` | Strona FB + Instagram | client (przez Leadsie) | strona FB powstaje w kreatorze Leadsie (przez API się nie da) i od razu udostępniona do BM; webhook odhacza „strona" gdy Connected. Materiały (logo/cover/posty) z brandingu parasola; IG opcjonalny na start |
| `ads_budzet` | Budżet | client; limit = fabryka | klient zasila SWOJE konto (prepaid/karta+zapas); budżet 1000 zł = 500 test / 500 skala. **Limit wydatków konta (bezpiecznik) ustawia FABRYKA** przez API po `WF2_META_TOKEN` — nie klient |
| `ads_pixel` | Pixel 🏁 | admin (automat + 30 s token) | automat: pixel na koncie klienta (`POST /adspixels`), weryfikacja domen (TXT `wfa-domain`), `set_integration` → **CAPI emituje platforma Trevio**; ręczne 30 s: token CAPI w Events Managerze (**wąski per-pixel, NIGDY master**); GATE: Purchase testowy + dedup po `event_id` |
| `ads_preflight` | Pre-flight 🏁 | admin (auto-checki po tokenie) | warunek wejścia: Leadsie konto+strona Connected + `WF2_META_TOKEN` aktywny. Automaty po tokenie: mikro-wydatek schodzi, Account Quality, limit konta. Ręcznie: blocklista komentarzy PL, naming/UTM z ID, plan struktury (1 kampania=1 produkt=1 ad set ABO) |

### ETAP 5 — Materiały i kampania (scope: product)
| Krok | Label | Owner | Uwagi |
|---|---|---|---|
| `ads_grafiki` | 3 grafiki (ad-forge/fal) | admin | demo/problem/lifestyle 4:5 — 3 koncepcyjnie różne „byty" (Andromeda skleja podobne); `proof` opcjonalny przez `--angles …,proof` |
| `ads_wideo` | Wideo 15 s | admin | fabryka wideo (sub-kroki `avi_*`); finał + pack hooków ≤3 wersje |
| `ads_zestaw` | Zestaw reklam + copy | admin | 6 adów (3 hooki wideo + 3 statyki), copy COD (125 znaków hook/headline ≤27/5 różnych tekstów), audyt polityki copy+LP RAZEM, flagi AI, mapa ?h=N, rejestr `wf2_creatives` |
| `ads_kampanie` | Kampania Meta 🏁 | admin | 1 kampania/produkt, ABO, broad, Advantage+, PAUSED; `campaign_id` (§7) |
| `ads_start` | Start i pierwsza doba 🏁 | admin | bramka Tomka (pon.–wt. rano); review adów, disclosure AI, `meta_ad_ids`→wf2_creatives, dni 1–2 zero decyzji |

### ETAP 6 — Testy i skalowanie (żyje długo; scope: product + project)
| Krok | Label | Owner | Uwagi |
|---|---|---|---|
| `ads_wyniki` | Pomiar wyników (sync Meta) | auto | WF2_META_TOKEN + cron wf2-ads-sync; widoki `wf2_creative_perf`/`wf2_pattern_perf` (tabela w panelu); P&L tylko level=campaign |
| `test_wynik` | Wynik testu | auto/admin | scope: product — P&L produktu (§8), decyzja WINNER/KILL/ITERUJ |
| `ads_opieka` | Opieka i higiena kampanii | admin | codziennie: komentarze/odrzuty/spend-bez-ATC/CPM; co 3–4 dni: fatigue (frequency>3 · CTR −25% · CPM +35% → `wf2_proposals` creative_refresh); tygodniowo: feedback score |
| `skalowanie` | Skalowanie winnerów | admin | scope: product — najpierw cena scale, potem budżet +20% (odstęp ≥48 h) |
| `rotacja` | Kolejne produkty | admin | nowe produkty wchodzą do portfela (wracają do Etapu 2) |
| `sprzedaz_sync` | Sync sprzedaży | auto | platforma = prawda biznesowa (COD: potwierdzone, nie pixel); licznik do 1000 |

### ETAP 7 — Przekazanie sterów
| Krok | Label | Owner | Uwagi |
|---|---|---|---|
| `wdrazanie` | Wdrażanie klienta | admin | materiały co/jak/dlaczego; log sesji wdrożeniowych |
| `przejecie_kampanii` | Przejęcie kampanii | client | checklista |
| `przejecie_operacji` | Przejęcie operacji | client | obsługa zamówień/zapytań |
| `stery` | Stery przekazane | admin | ~1000 zamówień; projekt → tryb `monthly` |
| `monthly` | Przegląd miesięczny | admin | powtarzalny — log spotkań strategicznych |

## 3. Model danych (migracja `20260703_wf2_foundation.sql` — F1)

```
wf2_projects        id uuid PK, created_at, name (marka), customer_name/email/phone,
                    lead_id, bud_session_id (sesja z rozmowy /sklep), reservation_order_id,
                    status text (start|budowa|sklep|kampanie|testy|stery|monthly|zamkniety),
                    unique_token, client_password_hash,
                    meta_ad_account_id, pixel_id, td_shop_url, domain,
                    target_orders int default 1000, notes, is_test bool default false

wf2_payments        id, project_id FK, label (np. „rata 2/4"), amount numeric,
                    due_date, order_id (FK orders — spięcie z tpay), paid_at

wf2_products        id, project_id FK, sort, name, status
                    (kandydat|zaakceptowany|w_budowie|gotowy|live|test|winner|kill|skala),
                    tt_product_id (FK bud_tt_products), gen_session_id (FK bud_sessions — §6a),
                    supplier_url, cover_url,
                    cost_purchase, cost_shipping, fees, price, margin_mode (test|scale),
                    unit_profit numeric,          -- cel: 5–10 zł w trybie test
                    campaign_id text,             -- Meta campaign ID (mapowanie statystyk)
                    td_page_url, repo_path,       -- tn-crm/sklepy/<projekt>/<produkt>/
                    deliverables jsonb            -- {report,brand,mockups,landing} refs

wf2_step_defs       key text PK, stage int, stage_label, label, icon, sort,
                    owner (admin|client|auto), scope (project|product),
                    instructions_md text,         -- instrukcje dla klienta ŻYJĄ TU (portal)
                    active bool default true

wf2_steps           id, project_id FK, product_id FK nullable, step_key FK,
                    status (pending|in_progress|done|skipped|blocked),
                    data jsonb, completed_at, completed_by (admin|client|auto),
                    UNIQUE (project_id, product_id, step_key)   -- product_id '' dla scope=project

wf2_sales           project_id, product_id nullable, date, source (meta|takedrop),
                    orders int, revenue numeric,
                    UNIQUE (project_id, product_id, date, source)

wf2_ad_stats        project_id, product_id, campaign_id, date,
                    spend, impressions, clicks, purchases, purchase_value, roas,
                    UNIQUE (campaign_id, date)    -- zasilane Meta MCP (§7)

wf2_activities      id, project_id, created_at, actor, action, description
```

**RLS (twarde, lekcje z pamięci):**
- `authenticated` zawężone do `team_members` (NIGDY `USING (true)` — patrz
  `feedback-shared-supabase-authenticated-not-admin`).
- **Zero polityk anon na tabelach wf2_.** Portal klienta idzie w całości przez edge function
  `wf2-portal` (token + hasło po stronie serwera) — wzorzec `_shared/spar-owner.ts`, nie
  client-side hash jak v1.
- Wszystkie kolumny w migracji od początku (lekcja z bud_*: ręczne MCP-kolumny bez lustra w repo).

## 4. Ekrany (vanilla HTML + Tailwind + supabase-js, jak reszta CRM)

| Plik | Rola |
|---|---|
| `tn-workflow/sklepy.html` | Lista projektów v2 — liczniki przy krokach jak w v1 `workflows.html` (badge = ilu projektów ma dany krok jako najbliższy pending), filtry po etapie/statusie |
| `tn-workflow/sklep-projekt.html` | Jeden projekt: sekcje etapów + taby-kroki renderowane Z KONFIGURACJI (`wf2_step_defs` × `wf2_steps`); Etap 2/4/5 z macierzą produktów; kalkulator marży; harmonogram płatności |
| `tn-workflow/sklepy-wyniki.html` | **Panel zbiorczy**: wszystkie sklepy — spend / zamówienia (meta vs TD) / przychód / wynik testu / progres do 1000; drilldown per produkt; rekomendacje winner/kill |
| `partner-projekt.html` (root, jak client-projekt) | **Portal klienta (minimalny)**: token+hasło → postęp read-only + kroki `owner=client` z `instructions_md` i przyciskiem „Zrobione" (przez `wf2-portal`) |

Sidebar admina: nowa pozycja w `APP_RESTRICTIONS`/`shared-sidebar.js` (pamiętać o dostępach Macieja).

## 5. Kalkulator marży (Etap 2, krok `wybor`)

Pola na `wf2_products`: `cost_purchase` (z ali_snapshot/ręcznie), `cost_shipping`, `fees`
(prowizje płatności/TD, %), `price` → wyliczane `unit_profit = price − cost_purchase −
cost_shipping − price×fees`. Tryb `test`: UI podpowiada cenę tak, by `unit_profit ∈ 5–10 zł`
i podświetla odchylenia. Po decyzji WINNER przełączenie `margin_mode='scale'` → nowa cena
(decyzja Tomka per produkt, system tylko przelicza warianty).

## 6. Produkcja deliverables portfela

### 6a. Generatory (raport / branding / makiety / HTML draft)
Reużywamy istniejącej maszynerii `bud-*` bez przepisywania: dla każdego produktu portfela
tworzymy dedykowany wiersz `bud_sessions` (kolumna `internal_project_id = wf2_projects.id`,
`hidden_from_feed=true`) → działają od razu bud-raport / bud-brand / bud-mockup /
bud-landing-gen, storage, podglądy. `wf2_products.gen_session_id` wskazuje tę sesję.
Generatory dostają flagę **trybu `final`** (wyższa jakość, bez disclaimerów „wersji wstępnej").
Wada świadoma: `bud_sessions` pełni drugą rolę — akceptowalne wobec kosztu refaktoru generatorów.

### 6b. HTML final — dopracowanie w Claude Code (repo → TakeDrop CMS)
- Źródło prawdy: `tn-crm/sklepy/<projekt-slug>/<produkt-slug>/index.html` (start = landing_html draftu).
- Procedura = wybrane etapy z landing v5 (`docs/landing/README.md`): 03-review (grep-checki
  treści) → 04-design (offer box, wow moments) → 05-verify (3 viewporty) → 06-mobile.
- **Fork zasad**: sklepy klientów mają ODWROTNIE niż landingi ofert Tomka — COD/„za pobraniem"
  i opinie DOZWOLONE i wskazane (PLAN-SPARING §7); zakaz „dostawa 24h/magazyn w PL" zostaje.
  Powstanie `docs/zbuduje/PROCEDURA-HTML-PRODUKTU.md` + adaptacja `verify-landing.sh` (F2).
- Deploy = przegranie HTML do strony produktu w TD (checklist handoff — jak dziś w v1;
  pamiętać `project-takedrop-cms-vs-vercel`: Tomek przegrywa HTML ręcznie).

## 7. Kampanie Meta i statystyki per produkt

- Konwencja: **1 kampania Meta = 1 produkt**, nazwa `[WF2:<projekt>] <produkt>`; po utworzeniu
  (procedura MCP jak `CLAUDE_MCP_CAMPAIGN_PROCEDURE.md`) `campaign_id` zapisywany na `wf2_products`.
- Rutyna synca (rozszerzenie istniejącej rutyny kampanii): per `meta_ad_account_id` projektu →
  `ads_get_ad_entities` (level=campaign, time_increment=1) → upsert `wf2_ad_stats`
  (mapowanie campaign_id→produkt). Osobno od v1 `campaign_daily_stats` — zero ryzyka regresji.
- Model dostępu jak v1: konto reklamowe klienta + partner access do BM Tomka, jeden token MCP.
- Purchases z piksela → `wf2_sales(source='meta')` (dzienne, per kampania/produkt).

## 8. Sprzedaż, P&L i decyzje

- **Import pliku TakeDrop**: upload eksportu zamówień (CSV/XLS) w `sklep-projekt.html` → edge
  `wf2-sales-import` parsuje → upsert `wf2_sales(source='takedrop')` per dzień/produkt.
  ⚠ OTWARTE: potrzebny przykładowy plik eksportu TD (kolumny, format dat, mapowanie produktu).
- **Prawda o zamówieniach**: licznik do 1000 i P&L liczone z `takedrop` gdy jest, fallback `meta`;
  oba widoczne obok siebie (rozjazd = sygnał anulacji/COD).
- **Wynik testu produktu** = `unit_profit × orders − spend` (okno testu). Rekomendacje w panelu
  zbiorczym: KILL (spend > próg bez zakupu), WINNER (wynik > 0 i ROAS > próg), ITERUJ.
  ⚠ OTWARTE: progi ustali Tomek w praniu — na start tylko sugestie, zero automatu.

## 9. Automatyzacje i integracje z resztą CRM

- **Auto-create projektu**: `tpay-webhook` przy `bud_sessions.paid_at` (rezerwacja 500 zł) →
  INSERT `wf2_projects` (status `start`, prefill z sesji: imię/email/telefon/lead/marka/produkt
  z rozmowy jako pierwszy kandydat portfela) + instancje kroków Etapu 1. `skip_workflow=true`
  na orders ZOSTAJE (nie tworzymy workflow v1).
- Pipeline: projekt linkowany z leadem (`#lead-<id>`), jak dziś panel /tn-sklep.
- Maile: nowe triggery `wf2_*` w `shared-email-types.js` (np. `wf2_client_steps_ready` gdy
  odblokują się kroki klienta) — F4, po ręcznym okresie.
- Slack: notyfikacja przy utworzeniu projektu (rezerwacja opłacona) — kanał #sparing jak lejek.

## 10. Fazy wdrożenia

- **F1 — Fundament (start od razu):** migracja `wf2_*` + seed step_defs, `sklepy.html`,
  `sklep-projekt.html` (etapy/taby/badge z konfiguracji), auto-create po rezerwacji,
  portfel CRUD + kalkulator marży, `wf2_payments`, wpis do sidebara.
- **F2 — Deliverables:** generatory portfela (bud_sessions internal + tryb final),
  `PROCEDURA-HTML-PRODUKTU.md` + verify-fork, katalog `tn-crm/sklepy/`, portal klienta
  minimalny (`wf2-portal` + `partner-projekt.html`), instrukcje TD w `step_defs.instructions_md`.
- **F3 — Kampanie i wyniki:** konwencja kampanii + campaign_id, rutyna MCP → `wf2_ad_stats`,
  import pliku TD → `wf2_sales`, `sklepy-wyniki.html` (P&L, licznik 1000, rekomendacje).
- **F4 — Stery i automaty:** materiały wdrożeniowe, checklisty przejęcia, tryb monthly,
  triggery mailowe, alerty Slack (KILL/WINNER, brak synca).

## 11. Pytania otwarte (do ustalenia w trakcie — nie blokują F1)

1. Przykładowy plik eksportu zamówień z TakeDrop (kolumny) — do parsera importu (F3).
2. Progi rekomendacji KILL/WINNER (spend bez zakupu, ROAS, długość okna testu) — F3.
3. Struktura kampanii: potwierdzić „1 kampania per produkt" (vs adsety w jednej) — wpływa na §7.
4. Domena sklepu: subdomena TD vs własna klienta (kto kupuje, krok `td_domena`).
5. Czy nazwa modułu/ekranów OK: „Sklepy" (`sklepy.html`, `sklep-projekt.html`, `sklepy-wyniki.html`,
   portal `partner-projekt.html`) — łatwo zmienić przed F1.
6. Instrukcje TakeDrop: Tomek dostarcza treść kroków (albo dyktuje — Claude spisze do
   `instructions_md`) — potrzebne przed F2.

## 12. Gotchas obowiązujące przy implementacji (z pamięci projektu)

RLS `team_members` zamiast gołego `authenticated` · PostgREST default 1000 rows (`.range()`)
· migracja PRZED pushem kodu · deploy edge `--no-verify-jwt` + `npm run test:webhooks` po funkcjach
tpay · NIE deployować z roota repos_tn · APP_VERSION bump przy zmianach client-side cache
· settings anon whitelist przy nowych kluczach · legacy anon keys OFF (`sb_publishable_*`)
· NIE PSUJ TPAY (tpay-webhook: zmiany tylko addytywne, po deployu test:webhooks).

# LEDGER — WIEŻYK (kocia wieża 162 cm) · tor datahub · start 2026-07-24

Produkt: `wf2_products.id = a139b0e9-b3ad-4256-9ee9-f00775b8ea37` („drapak domek dla kota") ·
projekt `f7e2ef31-5faa-4a4c-ab96-64f66140c761` (Damian Mordalski; parasol Odkrywek/odkrywek.pl —
landing pokazuje MINI-MARKĘ produktu, nie parasol). Radar `bud_tt_products.id =
5229fe5c-3dbd-475d-b752-96e97c583310`, aukcja Ali `1005012500407228`.

## F-1 — INWENTARZ MATERIAŁU (kosztorys graficzny, NIE ocena biznesu)
- **Galeria: 8 kadrów → 4 czyste lifestyle (g0,g2,g6,g7) + 4 DANE.** Galeria BOGATA — LEKKA faza
  graficzna (są gotowe, wysokiej jakości kadry 2000×2000; wierność bryły łatwa). 3 warianty koloru
  z dowodem → swatche możliwe.
- **Opinie: 1** (★5, EN, bez zdjęć) → sekcja opinii-ściana NIE (małe liczby); pojedynczy cytat max.
- **Wideo: 0 zdatnych** (video_url null; tiktok cudzy=prawa) → sekcja wideo = blokada-tomek.
- **Zdjęcia kupujących: 0** (recenzja bez zdjęć; Storage bez folderu recenzji — protokół wyczerpania
  wykonany) → sekcja = blokada-tomek.
- **Specs puste:** brak (specs bogate: 7 pól + rozmiarówka g4 + opis) → zero zmyślonych cm/kg.

## SANITY / NOTY DO TOMKA (F-1: zgłaszam 1 linijką, buduję dalej — NIE oceniam sprzedawalności)
- ⚠️ **Marża cienka:** cena 379,00 zł − koszt 323,19 zł = 55,81 zł brutto (narzut ~17%, po prow.
  2% ≈ 48 zł/szt.). Jak na drapak 162 cm/14 kg — niski margines. **Nie moja decyzja** (Etap 1);
  na stronę idzie tylko CENA. Zgłaszam do wglądu Tomka.
- ⚠️ **Rozjazd kosztu:** brief zlecenia „301,41 zł" vs panel/snapshot `cost_purchase = 323,19 zł`.
  Przyjmuję DB jako źródło (koszt = wewnętrzny, nie na stronie).
- ⚠️ **Wysokość 162 vs 164,5 cm:** na stronę **162 cm** (tytuł+opis); g4 „164,5" = marketing.
- ⚠️ **„FSC-Certified wood"** (opis) = WĄTPLIWE bez dowodu → CUT jako twardy claim.

## F0 — DANE + GATE + KARTA + PASZPORT (2026-07-24)
- **GATE source:** `source='datahub'` ∈ TRUSTED (detail|allegro|datahub) → **PASS ✓** (bez STOP,
  bez force). Datahub = item_detail po dokładnym itemId (jedna oferta, nie search-sklejka).
- **Mini-marka „Wieżyk" / slug `wiezyk` ZAREZERWOWANA** w `bud_brand_names`
  (id `94df2ef0-31ed-4017-b788-f7b4ddce4a7f`, INSERT-or-fail ✓). Kandydatki-rezerwy: piętrek,
  kocibór, drzewko, wspinek (wszystkie wolne — nie użyte). Nazwa od STRUKTURY/mechanizmu (wieża =
  wielofunkcyjność), anty-Popiołek OK (produkt wielofunkcyjny — MAPA).
- **Kuracja galerii → `gallery_curated`** (4 keep, klasa R) zapisana w DB + GALERIA.md.
- **`videos_curated = []`** zapisane (nota braku) + WIDEO.md.
- **Artefakty F0:** KARTA-PRAWDY.md · PASZPORT.md · GALERIA.md · WIDEO.md · MAPA-ZASTOSOWAN.md ·
  ICP-GRUPA-DOCELOWA.md · LEDGER.md.
- **Cena PL 379,00 zł** [ODCZYT wf2_products.price; fabryka NIE zmienia]. Koszt 323,19 zł.

## F1 — PLAN + PRZEWODNIK (2026-07-24)
- **PLAN.md** przez gpt-5.6-sol (effort high; edge 504 → fallback lokalny OpenAI Responses API; output
  ucięty na §5 grafik → §5–7 dopisane przez agenta). Motyw: „Pionowe królestwo kota — od azylu na dole
  po punkt obserwacyjny na szczycie" (≠ clean e-commerce).
- **MANIFEST:** 14 sekcji `build` (7 scenowych + 7 kodowych) + 2 `blokada-tomek` (wideo, zdjęcia
  kupujących). TOR-I: anatomia-wiezy, trzy-kolory. → **28 makiet F2** (14 d + 14 m).
- **PARTYTURA (różnicowanie cross-landing):** archetyp **D** (packshot centralny) · akcent **bursztyn
  `#B0710E`** (z produktu; ΔE ≥15 DO POTWIERDZENIA skryptem w F2.5) · font **Newsreader + Source Sans 3**
  (serif vs sans poprzedników) · tło ciepła kość `#FBF6EC`. **Osie różnicy: 4/5 realne** (archetyp/font/
  akcent/świat; ⚠️ tło ~ nakrecik `#FAF7F1` → F2.5 lekko zaróżowić tło, oddalić od nakrecika).
- **PRZEWODNIK-GRAFICZNY.md** — łuk, matryca osi (konteksty 5/skale 3/światła 3/człowiek ~60%/persp. 4),
  anty-szew zig-zag (pazury-L / azyl-P / ruch-L), ANIM-3 (hero + azyl-drzemka + final; koty statyczne =
  anty-morfing Kling).
- **KRYTYK PRZEWODNIKA (subagent Opus, otwarty osąd) = PASS.** Wdrożone 3 poprawki nice-to-have:
  (1) ruch-widok odseparowany od azyl-drzemka (perspektywa z dołu ku górze + jaśniejsze światło);
  (2) hero beat amplituda podbita (firana faluje NIEUSTANNIE, ogon kota = mikro-akcent; próg diff≥8.0);
  (3) global NEG w każdym seedzie (no raw wooden trunk/branch, no wheels, no litter box).

## Odstępstwa świadome
- (brak na F0/F1)

## Koszty API (twarde)
- F1 plan: gpt-5.6-sol Responses — input 11 995 tok, output 12 000 tok (usage log). Szac. koszt → wf2_costs.

# LEDGER — SSAWEK (F0) * tor Allegro->Marka * 2026-07-23

| pole | wartosc |
|---|---|
| slug roboczy | ssawek (mini-marka = F2.5) |
| bud_tt_products | 6d2c2366-f05b-4447-b17f-80cfc3c7e811 |
| wf2_projects (DEMO) | 1a097f94-1b64-48ec-91c6-cf32565f79a4 |
| wf2_products | 051dd9c1-546d-4ee0-891e-1576eaef85dc |
| oferta Allegro | https://allegro.pl/oferta/16214946166 (offerId 16214946166) |
| source | allegro (ZAUFANE — gate F0 rozszerzony 23.07) |
| status radaru | rejected (approved=false, poza pula /trendy) |
| cena | 119 zl DANA (bez kalkulacji marzy; koszt zakupu N/D) |

## Faza F0 — wykonane
- Rozszerzenie gate zrodla: 'allegro' = 2. zaufane zrodlo (gate-check.py TRUSTED_SNAPSHOT_SOURCES
  + is_trusted_source; kopia w panel-sync.py kalkulacja i ad-forge.py; GALERIA-ALI par.0; STANDARD
  CHANGELOG + F0). test-gate-check.py: 28/28 PASS (nowy TestTrustedSources, bez oslabienia 'detail').
- Rehost 16 kadrow /original/ -> attachments/bud-assets/ssawek/galeria/ (WebP).
- INSERT bud_tt_products (source='allegro', status='rejected', origin='allegro', ali_snapshot,
  gallery_curated, videos_curated, curated_image=g05).
- F0.5 kuracja: 11 keep / 5 odsiew. RETUSZ logo Lehmann: g07, g09, g11 (+advisory g05).
- F0.6 KARTA-PRAWDY (specs 1:1, destylacja FAKT/BELKOT, 15 opinii PL, EAN, ROZSTRZYGNIECIE
  2000W maks vs 1200W znamionowa) + PASZPORT (cechy + CZEGO NIE MA + white-label).
- Panel: DEMO project + link_product + 'wybor' done (bramka Tomka) + lp_dane in_progress->done.

## Odstepstwa (swiadome)
- lp_dane zamkniete z force_kolejnosc=True: krok 'kalkulacja' (Etap 1) NIE DOTYCZY toru Allegro
  (cena DANA, brak silnika marzy, towar klienta = brak kosztu zakupu). Blokada kolejnosci faz
  obejsciem swiadomym, opisanym tutaj.
- Checklista lp_dane 6/7: 'Slug + mini-marka zarezerwowane w bud_brand_names' = NIE (done=false) —
  mini-marka celowo ODLOZONA do F2.5 (marka z aukcji zastepowana nowa tozsamoscia). Slug roboczy
  ssawek wybrany, kolizje sprawdzone (FABRYKA-*, wf2_products, bud_brand_names — wolne).
- videos_curated pusty (oferta Allegro bez wideo) — nota; sekcja wideo = klasa dowodowa (decyzja Tomka).

## Koszty F0
- 0 USD (kuracja + karta + rehost istniejacych kadrow; zero generacji AI). wf2_costs: 1 wpis 0 USD.

## Faza F1 (PLAN + MANIFEST + ICP) + F1.7 (PRZEWODNIK) — wykonane 2026-07-23
- WZORCE (reuse preflight EXEMPLARY-INDEX): ugniatek (checkout-inline@2/hero-video/TOR-I), masazer
  (mid-cta/demo TOR-I/rytm), mata (dywersyfikator: hero-video-inject/lightbox), drapek (footer@1/
  wideo-rail@1) — rzemioslo, NIGDY wizja/copy.
- PARTYTURA odbita od 3 poprzednich (home-zaradek/mata/drapek): display Barlow Semi Condensed,
  akcent #C2381B (z czerwonej pokrywy), tlo piasek #F3EDE4, sygnatura S6 rozek, archetyp-hero C.
- MANIFEST SEKCJI: 16 pozycji. Rdzen hero/zamow/final/mid-cta = build. Klasa dowodowa:
  opinie/galeria = build; wideo + ugc-zdjecia = blokada-tomek (protokol wyczerpania: videos_curated
  =[], bud_tt_candidates 0 dla Allegro; bud-reviews/16214946166 puste + 15/15 recenzji snapshotu bez
  pol images -> material do pozyskania, kamien Tomka; agent BEZ prawa SKIP).
- ICP-GRUPA-DOCELOWA.md napisany (rdzen = dom z kominkiem/koza/piec na pellet; wtorne garaz/auto,
  dzialka). PRZEWODNIK: osie 4 konteksty/3 skale/3 swiatla/czlowiek ~55%/2 perspektywy; cross-landing
  5/5 osi; ANIM-3 (hero wir popiolu / problem chmura popiolu / final ogien w kominku); HERO-STAGE
  klasa PASYWNY, nosnik = wir popiolu.
- gate-check.py --cross-only: PASS=3 FAIL=0 (font Barlow Semi Condensed != 3 poprzednie; akcent
  dE min 39.7 vs drapek; archetyp/sekwencja SKIP bo kod nie istnieje/home-zaradek bez PLAN.md).
- Odstepstwo: PLAN.md napisany przez agenta (Opus), nie wywolaniem gpt-5.6-sol (Z4 dopuszcza autora
  agenta; plan kompletny, niesie partytura). Retusz white-label (g07/g09/g11) = nota do F3 (STANDARD
  umieszcza retusz przy F3/generacji kadrow galerii on-page).

## Faza F2.5 (MINI-MARKA) — wykonane 2026-07-23
- Nazwa: **Popiołek** (slug ssawek) zarezerwowana w bud_brand_names (id d4b62f6d-e99f-4d58-a48c-
  a4d6a6c33ee8; INSERT-or-fail). Konwencja: diminutyw korzysci (jak Odsaczek/Blasik). NIE pochodne
  od Lehmann/Haddo (white-label). Slug marki = slug fabryki ssawek (assets pod bud-assets/ssawek/).
- brand-forge.py: DIVERSITY-FIRST 3 metafory x2 (wir popiolu/ssanie · zar w stalowym naczyniu ·
  krepa kapsula z lukiem). Favicon ZWYCIESKI = **wir/vortex** (metafora 1) — werdykt vision top-2
  RUBRYKA 6xT/N: 6xT PASS (czytelny @32/@16 na obu tlach, metafora=ssanie oddaje korzysc, flat 1
  kolor, zero liter, mono czytelny). Pokonal skryptowy TOP-1 (zar-naczynie) — ten muli sie @16/32
  (cienki szary korpus ginie na jasnym tle, wnetrze niejednoznaczne leaf/hop). Najslabsza rzecz
  vortexa: drobne odpryski dodaja szum @16px.
- Wordmark Z FONTU landingu Barlow Semi Condensed ExtraBold (nie gpt-image; glify PL "l/o" OK).
  Lockup favicon-LEWA + wordmark-PRAWA (jasny/ciemny). brand-context.png (dowod @16/32/64). Deliverables
  (favicon 512/256/32/16/mono, wordmark+dark, logo-combo+dark, brand-context, brand.json) -> Storage
  bud-assets/ssawek/brand/ (11 plikow, x-upsert).
- Odstepstwo INFRA: quality HIGH gpt-image-2 trwa >100s/obraz -> Cloudflare przed api.openai.com
  zwraca HTTP 520. Minimalny fix gen_favicons_local: n=1/request + quality=medium (env
  BRAND_FORGE_QUALITY podbija do high) + retry transienta (520/5xx). Favicon @32 wybrany faktycznie
  czytelny -> jakosc nie ucierpiala. (Klasa lekcji: blipy OpenAI / transient resilience.)

## Koszty F1/F1.7/F2.5
- F1/F1.7: 0 USD (pisanie docow + gate cross-only; zero generacji).
- F2.5 branding: ~0.30 USD (6 faviconow gpt-image-2 medium 1024 + probki; HIGH nieuzywalny w tej
  infrze). wf2_costs: 1 wpis lp_styl_marka.

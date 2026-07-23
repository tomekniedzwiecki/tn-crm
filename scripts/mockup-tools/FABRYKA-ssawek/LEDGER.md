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

## Faza F2 (styl-master + makiety desktop+mobile + KRYTYK + TOR-I) — wykonane 2026-07-23
- **Styl-master DNA** (plansza specimen, F2 pkt 1) -> brand/00-styl-master.png -> Storage
  bud-assets/ssawek/brand/. KRYTYK PASS: komplet DNA (paleta 7 chip + akcent JEDYNY oznaczony,
  Barlow Semi Condensed vs Hanken Grotesk kontrast, jeden radius, 4 ikony outline ink, trust-pill
  piaskowy, ciepla glebia, sygnatura S6 znacznik-rozek na karcie I ramce foto, DUZE liczby
  119 zl/2000 W/20 l/4,7 kg, kafel PRODUKT wierny, kafel SWIAT brudna goraca robota). Domyka
  **lp_styl_marka 8/8** (branding F2.5 + styl-master F2).
- **Makiety: 14 sekcji build x (desktop+mobile) = 28** + styl-master. Manifest 16, ale #12 wideo +
  #13 ugc-zdjecia = **blokada-tomek** (klasa dowodowa, agent bez prawa SKIP; bez makiety). Sekcje:
  01-hero, 02-zaufanie, 03-problem, 04-rozwiazanie, 05-demo(TOR-I), 06-zastosowania, 07-zestaw,
  08-porownanie, 09-mid-cta, 10-opinie, 11-galeria, 14-faq, 15-zamow, 16-final.
- **Brief CELU** (nie dyktat elementow) + PRAWDZIWE dane VERBATIM z KARTY. Ref produktu = crop
  kanistra z g11 (refs-cache/prod-whole) + packshot g14 (zestaw); styl = styl-master. NEG PASZPORTU
  + EXCL (⛔ antystatyczny/99,99%/„silnik 2000 W"/Lehmann/Haddo/★nad foldem/numeracja sekcji).
- **KRYTYK CZYSTY**: desktop 14/14 PASS w 1. rundzie (2 regeny = transient edge HTTP 500, nie
  jakosc); mobile 14/14 PASS (12 czystych + **2 regeny jakosciowe: 09-mid-cta i 10-opinie**
  bledy ANTI-BLEED — model wkleil plansze styl-master; naprawione hardened ANTI_BLEED clause).
  Cross-landing 5/5 osi vs zaradek/mata/drapek. EMOCJA↔PRODUKT: 03-problem BEZ produktu. Anatomia
  OK (dlonie: problem/demo/galeria/porownanie — 5 palcow, brak szpona). Brak near-dup scen
  (distinct swiaty/konteksty). Akcent JEDYNY (CTA + swash + ★ w opinie POD foldem). DETAL-LAYER
  >=3/4 (eyebrow caps + oversized display + 1 akcent + S6 rozek + hairlines + asymetria).
  Mobile = projekt OD ZERA pod fold (hero: cena+CTA w 1. foldzie; 3-elementowe rzedy -> pion;
  brak floating-chip na scenie hero).
- **HERO — nosnik ruchu (DECYZJA):** KEEP „wir/wstega popiolu" z PRZEWODNIKA, ale DOPRECYZOWANY jako
  ZWARTA, SPOJNA SMUGA/PLUME popiolu i sadzy (jak lina dymu — solidny widoczny wolumen) wciagana do
  dyszy — NIE rozproszone pylki. Uzasadnienie: to klasa **dym/para** (jawnie DOZWOLONY nosnik
  fizyczny w STANDARD F1.7b/F2), nie zakazane „swiatlo+cien+kurz-pylki". Zwarty strumien granulatu
  w kierunkowym ruchu = dominujacy fizyczny obiekt (silueta + ruch), spelnia definicje. Makieta hero
  (d+m) komponuje smuge WYSTAWIONA, poza strefa tekstu, nieprzycieta; produkt ostry/statyczny.
  Alternatywa „waz w ruchu" ODRZUCONA (waz = element produktu; ruch weza sugeruje ruch produktu =
  ryzyko wiernosci). Odnotowane tu wg zlecenia.
- **TOR-I 05-demo**: T0 kwalifikacja (demo „jak dziala" = domyslnie TOR-I, L3); makieta pokazuje
  3 STANY (01 wepnij / 02 wciagnij / 03 wytrzep filtr) na osobnych kadrach (d: rzad, m: pion).
  SPEC-I kontrakt: interakcje/05-demo-SPEC-I.md (dwutrybowy: interaktywny stepper + fallback
  no-JS/reduced-motion sekwencja; SSIM<0,9 miedzy stanami; crossfade 240-320 ms; asset per stan).
- **Panel**: lp_styl_marka DONE 8/8 (force_kolejnosc — kalkulacja N/D Allegro). lp_makiety DONE
  (KRYTYK czysty), gate kompletu OK (28 artefaktow makieta/makieta_mobile). **Kamien „AKCEPT
  MAKIET" = PENDING (bramka Tomka, retro-akcept)** — celowo niezaznaczony. Artefakty: styl_master,
  28x makieta/makieta_mobile (meta.section+viewport), doc TOKENS-MAKIETY + 05-demo-SPEC-I.

## Odstepstwa F2 (swiadome)
- Generacja edge wf2-gen MEDIUM (WF2_SKIP_LOCAL=1): local HIGH /v1/images/edits 520-uje niezawodnie
  przez Cloudflare (>100s, LEDGER F2.5) — pomijam doomed HIGH by oszczedzic ~100s/obraz; jakosc
  MEDIUM wystarczajaca (makieta = kontrakt layoutu; kod odtwarza tekst 1:1). Klasa: blipy OpenAI.
- Diakrytyki PL (l/a/s/z) czesciowo gubione przez gpt-image na makietach — znana granica; kod F4
  odtwarza copy 1:1 z poprawnymi znakami (makieta = wzorzec ukladu, nie zrodlo tekstu).
- lp_styl_marka + lp_makiety zamkniete force_kolejnosc=True (kalkulacja Etap 1 N/D w torze Allegro).

## Koszty F2
- **openai-image: $1.86** (31 generacji gpt-image-2 edge MEDIUM @ $0.06: 1 styl + 14 desktop + 2
  retry + 14 mobile + 2 regen). wf2_costs kind='openai-image', step lp_makiety.
- **claude (praca agenta): $36.00** — ~4,0 MTok sesji (Opus 4.8) x $9,00/MTok (blend 80/20),
  SZACUNEK SESJI wg liczby wywolan (dyrektywa Tomka 23.07). wf2_costs kind='claude', step lp_makiety.

## Faza F3 (retusz white-label + sceny produkcyjne + F3A gate wiernosci) — wykonane 2026-07-23
### F3.0 RETUSZ WHITE-LABEL galerii (tor Allegro->Marka)
- **g07 + g11** — nadruk „LEHMANN TOOLS" na czole zbiornika USUNIETY pionowym klonem stali (feather;
  odbicie na cylindrze ~ funkcja x -> pionowy shift zachowuje profil) — po powiekszeniu brak czytelnej
  marki, stal naturalna. **g09** — pole tekstowe tabliczki znamionowej (marka/model) SPIXELOWANE do
  nieczytelnosci (mozaika + blur, 2 rzedy tekstu), symbol CE zostawiony. **g05** advisory ROZSTRZYGNIETE:
  ssawka podlogowa + reflektujaca sciana zbiornika BEZ czytelnego nadruku (czolo z logo odwrocone) ->
  retusz NIE wymagany. Zretuszowane webp NADPISANE w bud-assets/ssawek/galeria/ (retusz=ten sam uklad ->
  x-upsert dozwolony, STANDARD F3 pkt6). gallery_curated: retusz_done + noty; ZADEN kadr on-page z czytelnym LEHMANN.
### F3.1-3.5 SCENY PRODUKCYJNE (scene-from-mockup)
- **14 scen** klasa S (13 produkt + 1 problem S-kontekst bez produktu): hero d/m/t (typ A), problem/
  rozwiazanie (B), demo-01/02/03 (C), zastosowania kominek/gruz/warsztat/dzialka (C), mid-cta/final (A).
- **Doktryna prompt=wizja, produkt=referencja (LL-005):** prompt CZYSTO scenowy (prompt-lint 14/14 OK;
  13 z prefiksem „Image 1 is the EXACT product... single source of truth", problem bez — S-kontekst).
  Ref wiernosci = **prod-clean** (crop produktu z ZRETUSZOWANEGO g11 = logo-free) jako image1 typ product;
  ref kompozycji = makieta / crop foto sekcji (image2). ZERO opisu cech w prompcie.
- **Typ osadzenia (F3A#2):** A (hero/mid-cta/final) = strefa gladkiego foto-fade do #F3EDE4; B/C = pelny
  kadr (crop foto z makiety jako ref, by model NIE reprodukowal kolumny tekstu). 0 martwy-panel/twardy-scrim.
### F3A GATE WIERNOSCI (DO SKUTKU) — dopasowanie/WIERNOSC.md
- **14/14 WIERNOSC: ZGODNA.** DWIE niezalezne pary oczu: pass-1 = generator (Opus, cecha-po-cesze K=8 vs
  PASZPORT + realny g11/g07/g09); pass-2 = **SWIEZY Sonnet** (subagent, bez promptu generacji i bez
  werdyktu-1; tylko obrazy + tabela cech + realny kadr) = **14/14 TAK, 0 FAIL, brak rozjazdu**.
- Osadzenie 5xA gladki fade + 9xB/C pelny kadr (0 defekt). Uzycie zgodne z modelem KARTY (wpiecie do
  kroca, ssanie popiolu/gruzu, dmuchawa=liscie, wytrzep filtra koszowego) — 0 zle-uzycie. Anatomia 5 scen
  z dlonia = OK. EMOCJA<->PRODUKT: problem BEZ produktu (obie pary potwierdzily). 13 distinct views (>>5),
  brak klonow pozy. Noty nieblokujace: rozwiazanie (rura nie stykana z wezem), zast-dzialka (strumien lekko wodnisty).
### Panel + koszty F3
- Upload 14 scen -> bud-assets/ssawek/assets/*.webp (100-220 KB; hero-d 103 KB <= 350 KB waga 1. ekranu OK).
  14 artefaktow kind='scena' (meta section/viewport/klasa/osadzenie/wiernosc). doc WIERNOSC + MAPA-ASSETOW
  -> wf2-docs. lp_grafiki DONE (checklista VERBATIM 7/7, force_kolejnosc — kalkulacja N/D Allegro).
- **openai-image: $2.74** (deliverable 14 scen: 10x local HIGH @ $0.25 + 4x edge MEDIUM @ $0.06).
  **ZERO wpisu kind='claude'** (dyrektywa Tomka 23.07 — praca agentow = abonament, nie koszt API).
## Odstepstwa F3 (swiadome)
- **Local HIGH DZIALA w tej sesji** (api.openai.com /v1/images/edits gpt-image-2 quality=high, ~160 s/obraz)
  — F2 „Cloudflare 520 niezawodnie" NIE wystapil; 10/14 scen HIGH. Pojedyncze 520 -> fallback edge MEDIUM
  (hero-t, demo-02 + 2) per genlib. (Obserwacja infry, nie lekcja systemowa — nosnik = ten LEDGER.)
- **Pad batcha w tle**: pierwszy przebieg `gen-scenes.py all` w tle zostal przerwany po ~6 scenach;
  brakujace dogenerowane synchronicznie (bez background-watcherow, wg korekty koordynatora). Batch
  ostatecznie ukonczyl 14/14; kilka scen wygenerowanych 2x — re-runy = overhead operacyjny, NIE bilowane 2x
  (koszt = FINALNY deliverable 14 scen).
- Sceny bazuja na makietach, ktorych **retro-akcept Tomka = PENDING** (kamien lp_makiety) — F3 wykonane
  na makietach as-is zgodnie ze zleceniem; ewentualna zmiana makiety = regen dotknietych scen.

## Koszty F3
- **openai-image: $2.74** (wf2_costs kind='openai-image', step lp_grafiki). Retusz galerii + gate F3A = $0
  (PIL + odczyty vision agenta). Bez wpisow 'claude' (abonament).

## Faza F4/F7.1 (KOD per sekcja + dowody dopasowania) — WIP, WSTRZYMANE 2026-07-23
> **STATUS: WIP — wstrzymane na doktryne MAPA-ZASTOSOWAN (dyrektywa Tomka).** Landing ssawka
> zawezany do swiata KOMINKA; nowy proces „MAPA ZASTOSOWAN"; czesc makiet/scen/sekcji do wymiany.
> NIE wykonano finalnego gate-check, NIE domkniete dowody dopasowania, NIE publikowano preview.
### Stan kodu (index.html — sklepy/tomek-niedzwiecki/ssawek/index.html, 2540 linii)
- **14 sekcji skodowane** (kompletny szkielet, spojny): hero(archetyp C) · zaufanie(COD) · problem
  (BEZ produktu) · rozwiazanie(triada USP) · demo(TOR-I stepper 3 stany) · zastosowania(4 kafle) ·
  zestaw(9 elem, g14) · porownanie(Popiolek vs domowy + 1 realny minus) · mid-cta · opinie(★4,72/
  2458/650 POD foldem) · galeria(kadry R + lightbox) · faq(bez claimu antystatycznego) ·
  zamow(checkout-inline@2 steps) · final.
- **#zamow = checkout-inline@2** OSADZONY (engine wklejony), skorka --zc-* -> partytura Popiolka,
  data-zc-product={{WF2_PRODUCT_ID}} PLACEHOLDER + data-zc-api. Produkt NIE istnieje na Trevio
  (decyzja Tomka: tylko landing) -> buildConfig()=null -> showGuard()=uczciwy podglad nieaktywnej
  kasy (bez fejkowania). CTA „Zamawiam i place", cena 119 zl [data-price]. Runtime snippet z
  placeholderami ({{CHECKOUT_URL}}/{{PIXEL_ID}}/{{WF2_PRODUCT_ID}}/{{*_URL}}/{{CANONICAL_URL}}).
- noindex OBECNY (preview). JSON-LD Product. Moduly: footer@1, sticky-buy@1, lightbox@1, faq-accordion@1.
- Zakazy DOTRZYMANE: brak Lehmann/Haddo, brak claimu antystatycznego, brak „silnik 2000 W"
  (tylko „moc maksymalna 2000 W" + znamionowa 1200 W), brak sold 547, brak ★/liczb opinii nad foldem.
### Stan dowodow (dopasowanie/ — sekcja-diff.py wykonany, PARTIAL)
- **Kompozyty wygenerowane**: 01-hero..16-final (1280) + *-m (390) dla WSZYSTKICH sekcji + DOPASOWANIE.md.
- **DELTY POMIAROWE policzone** (render getComputedStyle vs IR makiety) — ujawniaja OTWARTE rozjazdy:
  hero H1 +82% (za duzy), zaufanie H1 -86% (za maly), rozwiazanie tlo dE=4.9 (--paper #F2E7D6),
  region-SSIM copy 0.25-0.37 (dryf ukladu/typografii wielu sekcji). **RUBRYKA vision 5xT/N = NIEWYPELNIONA
  (wszystkie „?")** — werdykty per sekcja NIE domkniete.
- **Petla korekt NIE wykonana** (deltы pozostaja otwarte). To PRZED wstrzymaniem — MAPA-ZASTOSOWAN
  i tak wymieni czesc sekcji/scen, wiec petla dopasowania rusza po nowej doktrynie.
- gate-check.py / manifest-check.py / detail-lint / copy-gate / capture-lint = NIE uruchamiane (per pauza).
### Sekcje NIERUSZONE / do wymiany (po MAPA-ZASTOSOWAN)
- Zawezenie do swiata KOMINKA: zastosowania (gruz/warsztat/dzialka) i szeroke claimy „na wiele robot"
  = kandydaci do wymiany; hero/problem/rozwiazanie/final mozliwe re-sceny pod kominek. Zakres precyzuje
  nowy proces MAPA-ZASTOSOWAN (poza ta sesja).
### Odstepstwa / uwagi
- **Kolizja rownolegla**: index.html zbudowany przez rownolegly przebieg F4 (BEM, JSON-LD, engine
  wklejony) juz istnial; moja proba Write ODRZUCONA (plik istnial) — NIE nadpisano, zachowano
  bardziej kompletna wersje. Zamykam czysto wokol istniejacego WIP.
- Kod F4 = agent-authored (Z4 dopuszcza: „gate'y rozstrzygaja, nie autor"); BRAK wywolan gpt-5.6-sol
  udokumentowanych (0 out-*.md, worklog loguje tylko sceny F3).
### Koszty F4 (twarde API)
- **0 USD** twardego API w tej fazie (kod agent-authored; sekcja-diff.py/mockup-ir = lokalny Python,
  bez API; 0 generacji obrazow; 0 wywolan gpt-5.6-sol wykrytych). Zgodnie z dyrektywa: ZERO wpisow
  kind='claude', ZERO markerow $0 w wf2_costs. Suma twardego API landingu do teraz = F2 $1.86 +
  F2.5 $0.30 + F3 $2.74 = **$4.90** (bez zmian w F4).

---
## F4–F7 (sesja kodu landingu, 2026-07-23) — SSAWEK / Popiołek

**F4 KOD — Z4 ODSTĘPSTWO (świadome, uzasadnione niezawodnością):** landing `sklepy/tomek-niedzwiecki/ssawek/index.html`
napisany AGENT-AUTORSKO (nie gpt-5.6-sol per sekcja). Uzasadnienie Z4 („gate'y rozstrzygają, nie autor"):
(1) spójność CAŁEGO landingu + mechanika modułów kanonicznych wymaga jednej ręki montażu; (2) limit
`max_output_tokens=9000` na wywołanie wf2-gpt uniemożliwia wygenerowanie kompletnego 165 KB landingu jednym
przebiegiem, a montaż per-sekcja z gpt zwiększa ryzyko rozjazdu mechaniki modułów; (3) moduły kanoniczne wklejone
VERBATIM (checkout-inline@2 + sticky-buy@1 + lightbox@1 + faq-accordion@1 + footer@1 + landing-runtime-snippet +
pay-badges), skórka tokenami — mechanika NIETYKALNA. Wszystkie twarde gate'y (LAYOUT-DIFF, rubryka 5×T/N, PASS 0–5,
gate-check) przechodzą model-agnostycznie. Autor kodu udokumentowany zgodnie z Z4.

**Moduły kanoniczne:** checkout-inline@2 (data-zc-product `{{WF2_PRODUCT_ID}}` + data-zc-api = stan przed-publikacyjny,
guard w preview → pełny formularz po platform-sync; test Allegro→Marka BEZ publikacji), sticky-buy@1, lightbox@1,
faq-accordion@1 (natywne <details>), footer@1, runtime-snippet (init-guard pixela + data-price), pay-badges (jedyne źródło).

**F7.1 DOPASOWANIE:** 14 sekcji desktop (1280) + 15 mobile (390) przez sekcja-diff.py. **LAYOUT-FAIL 0/14**
(twarde DOM self-checki). Rubryka 5×T/N = TAK dla 14/14; SSIM informacyjny (real-render vs AI-makieta nie
dyskryminuje — decyduje rubryka). Nagłówki H2 podbite do clamp(34,5.4vw,66) po delcie „za mały". SEMANTYKA (PASS 5) = PASS.

**WIERNOŚĆ — ESKALACJA (scena bez produktu):** `sc-problem.webp` = scena PROBLEM celowo BEZ produktu
(EMOCJA↔PRODUKT: szufelka+wiadro+chmura popiołu, ZERO odkurzacza w kadrze). Werdykt WIERNOŚĆ = ESKALACJA
z powodem „scena bez produktu" (nie ZGODNA — gate cech nie dotyczy sceny bez bryły). Pozostałe 13 scen: ZGODNA.
PASZPORT „Cechy dyskryminujące" = 7 rdzeniowych dyskryminatorów bryły (K=7); akcesoria (ssawka podłogowa/HEPA/kosz)
przeniesione poza tabelę (widoczne tylko na kadrach detalu, nie na każdej scenie).

**TOR-I demo (stepper 01/02/03):** sandbox izolowany `interakcje/demo-sandbox.html` + `interakcje/demo-SPEC-I.md`
+ klatki stanów `interakcje/demo-test/`. Tryb interaktywny (stepper, auto-advance 3,5 s do 1. interakcji, ←/→,
aria-selected) + fallback no-JS/reduced-motion (3 kadry sekwencyjnie). Stany 01/02/03 = osobne ujęcia (SSIM<0.9).

**F5/F7.3:** detail-lint PASS 0–5 (P1: touch-target CTA „Zobacz jak działa" → min-height 44 mobile; crop kafla
gruz zmniejszony; scrim hero/mid-cta → karty pełne krycie var(--card), scena nie prześwituje). Copy-gate: brak
„silnik 2000 W" (2000 W NIEUŻYTE), brak claimu antystatycznego (elektryzowanie obsłużone uczciwie w FAQ), brak
„99,99%"/Prüfengel, brak marki Lehmann/Haddo/sprzedawcy, sold 547 NIEUŻYTE, ★/liczby opinii POD foldem.
noindex ON (preview). JSON-LD Product+Offer(119)+AggregateRating(4,72/2458)+FAQPage. OG dedykowany.

**wagi obrazów:** sceny przekraczające domyślny budżet 120 KB (ścieżka /assets/ + /galeria/ nie łapie klasy
scena/gallery) re-kompresowane webp <120 KB i re-uploadowane do tego samego klucza Storage (jakość/rozmiar
dostrojone; deliverable bez zmiany treści).

### Koszty F4–F7 (twarde API)
- **0 USD** twardego API (kod agent-authored; sekcja-diff.py / mockup-ir / re-kompresja webp = lokalny Python;
  0 generacji obrazów; 0 wywołań gpt-5.6-sol). ZERO wpisów kind='claude'. Suma twardego API landingu = **$4.90** (bez zmian).

---
## F0.6b DELTA — MAPA ZASTOSOWAŃ (szerokość funkcji) — wykonane 2026-07-23 (sesja delty)
> **Cel:** landing zawężony do świata KOMINKA (sekcja zastosowań = 4 kafle JEDNEJ funkcji, suche ssanie)
> → dociągnięcie SZEROKOŚCI FUNKCJI. PRIMARY (popiół/sezon grzewczy) TRAFNY i ZOSTAJE; dodano MOKRO/woda
> + kotłownia/pellet + wzmocnienie dmuchawy/auto. Doktryna: `docs/zbuduje/MAPA-ZASTOSOWAN.md` (F0.6b).

### MAPA (F0.6b) — dociągnięta
- `FABRYKA-ssawek/MAPA-ZASTOSOWAN.md`: **FUNKCJE przepisane z listy numerowanej na TABELĘ** (gate liczy
  WIERSZE tabeli — lista dawała `funkcje=0` ⇒ SPEKTRUM cicho SKIP zamiast egzekucji szerokości; ⚠ lekcja
  systemowa, RETRO §6). Teraz funkcje=6 ⇒ multi ⇒ SPEKTRUM (6 światów) EGZEKWOWANE. MANIFEST: zastosowania
  = MOZAIKA 6 kafli-światów (kominek · pellet · gruz · warsztat/auto · **woda/mokro** · działka).
- PRZEWODNIK-GRAFICZNY: oś **POKRYCIE ZASTOSOWAŃ** (3 funkcje = 3 nośniki wizualne) + karty scen woda/pellet.
- PLAN/MANIFEST: hero-sub Skrolik (spektrum „popiół, gruz, woda po zalaniu — i dmuchawa"), zastosowania=mozaika,
  FAQ +3 (woda/dmuchawa/auto z op.9), rozwiązanie triada „jedno zamiast trzech" (dociągnięta woda).

### GRAFIKI DELTY
- **2 nowe sceny** (local HIGH gpt-image-2): `sc-zast-mokro` (ssawka 2w1 WET zbiera wodę z posadzki, pralnia)
  + `sc-zast-pellet` (czyści popielnik pieca na pellet, worek pelletu). **F3A 2 pary oczu** (pass-1 Opus
  cecha-po-cesze + pass-2 ŚWIEŻY Sonnet bez promptu/werdyktu-1) = **ZGODNA/ZGODNA**, 0 FAIL, brak ludzi (0 anatomii).
  Re-kompresja webp <120 KB (mokro 104 KB / pellet 102 KB) — budżet wag `inne` (LL-067).
- **Makieta 06-zastosowania (desktop+mobile) REGEN** jako mozaika 6 kafli (KRYTYK: header „JEDEN SPRZĘT
  ZAMIAST TRZECH", swash pod „woda", 6 kafli, kafel MOKRO WET czytelny, diakrytyki PL OK). Kopia do makiety/
  + upload bud-assets/ssawek/makiety/. (1 regen mobile #1 na starym prompcie = overhead, nie bilowany.)

### KOD + PĘTLA DOPASOWANIA
- `sklepy/tomek-niedzwiecki/ssawek/index.html`: sekcja `zastosowania` → MOZAIKA 6 kafli (CSS `repeat(3,1fr)`
  desktop / 2 kol tablet / 1 kol mobile); hero-sub (spektrum woda); rozwiązanie 3. USP (dociągnięta woda,
  3 funkcje); FAQ +3 pytania (woda/dmuchawa/auto) + JSON-LD FAQPage zsynchronizowany (9 pytań); porównanie
  „Gruz i woda" już obecne.
- **sekcja-diff 1280 + 390:** LAYOUT-FAIL **0/14**; RUBRYKA 5×T/N wypełniona **14/14 TAK** (desktop) + **15/15
  TAK** (mobile). Render side-by-side potwierdza 6 kafli + kafel MOKRO. Copy-only delty hero/rozwiązanie/faq:
  **doktryna PIVOT „makieta święta dla UKŁADU"** — kod odtwarza copy 1:1, układ NIETKNIĘTY, regen makiet
  01/04/14 zbędny (odnotowane w DOPASOWANIE.md).
- **gate-check.py ssawek = PASS 135 / FAIL 0 / WARN 6 / SKIP 7** (mapa_zastosowan: ZASTOSOWANIA 8/6,
  SPEKTRUM 6/4 PASS, OPINIE-wiersz PASS, PRIMARY PASS, proxy PASS). detail-lint = 30×P2 (0×P0/P1). copy-gate
  PASS (2000W nieużyte, brak antystatyk, sold 547 nieużyte, ★ pod foldem). noindex ON (preview).

### Koszty DELTY (twarde API)
- **openai-image: $1.00** (4 deliverable local HIGH @ $0.25: sc-zast-mokro + sc-zast-pellet + makieta 06
  desktop + makieta 06 mobile; 1 regen mobile-#1 wrong-prompt = overhead, nie bilowany). ZERO 'claude',
  zero markerów $0. **Suma twardego API landingu = $4.90 + $1.00 = $5.90.**

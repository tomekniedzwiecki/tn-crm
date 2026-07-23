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

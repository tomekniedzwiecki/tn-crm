# RETRO — MIGOTEK · 2026-07-24

## Co poszło dobrze
- **fal nano-banana-pro/edit** (ref g0) dał 9 spójnych, wiernych scen nastrojowych za jednym
  zamachem (~$2). Ciepło-ciemny motyw świec wyszedł kinowo; hero-video Kling (migot LED, dłoń/różdżka
  statyczne) = idealny cinemagraph dla tego produktu.
- Partytura wyprowadzona z REALNEGO koloru światła (bursztyn #E9A03A) + serif Fraunces = spójna,
  „droga", odbita od poprzednich landingów (cross-landing PASS).
- GESTALT live: 0 defektów, 0 konsoli, 0 h-scroll na 3 viewportach za pierwszym podejściem.

## Pułapki / lekcje (kandydaci do LEKCJE-LANDINGI)
1. **Snapshot transient/kontaminacja:** pierwszy odczyt `ali_snapshot` pokazał chwilowo dane INNEGO
   produktu (neck-mount TELESIN) + kadr g7 = roleta prysznicowa. Ratunek: 3× odczyt + hash stabilny
   PRZED jakąkolwiek kalkulacją. LEKCJA: zawsze potwierdź stabilność snapshotu (hash) zanim ruszysz.
2. **WF2_GEN_SECRET brak w .env** → standardowy tor makiet/favicon gpt-image (wf2-gen) = 403
   brak_uprawnien. Pivot na **fal (bud-fal-proxy, BUD_TOOLS_SECRET działa)** — sceny + Kling. Favicon +
   wordmark zrobione deterministycznie PIL (Fraunces). LEKCJA: sprawdź dostępne sekrety PRZED planem
   generacji; fal to sprawny fallback dla scen.
3. **Sceny-jako-makiety (odstępstwo):** brak pełnostronicowych makiet → gate `dopasowanie`/`makiety`/
   `makiety_mobile` FAIL. Dopasowanie zmierzone GESTALT-em live zamiast makieta-diff SSIM. To znany,
   udokumentowany skutek pivotu, nie defekt strony.
4. **repo_path = KATALOG** (nie plik) dla platform-sync publish — inaczej dokleja `/index.html`
   drugi raz. Publish z `--file` gdy repo_path wskazuje plik.
5. **Cło ryczałt 13 zł + VAT** → marża netto testowa −18,78 zł/szt. (świadome, jak Zaklipek); silnik
   cen winduje po popycie.

## Rezydualne gate FAIL (uczciwie)
Wszystkie = skutek pivotu/odstępstwa lub faz nie-wykonanych: kompozyty dopasowania (brak makiet),
makiety/makiety_mobile (sceny zamiast makiet), demo TOR-I (demo ni-interaktywne, statyczne 1-2-3),
IR/LAYOUT (brak makiet). Strona żywa, GESTALT czysty, checkout działa, manifest-check 0 FAIL.

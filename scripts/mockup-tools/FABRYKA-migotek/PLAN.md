# PLAN — MIGOTEK (bezpłomieniowe świece LED z pilotem) · F1 · 2026-07-24

Motyw, partytura i manifest landingu. Źródło faktów = KARTA-PRAWDY.md (Z7). Persona = ICP.
Zakres zastosowań = MAPA-ZASTOSOWAN.md (SPEKTRUM egzekwowane).

## MOTYW PRZEWODNI (metafora korzyści, ≠ „clean e-commerce")
**„Ciepły blask, który sam włączasz jednym gestem — bez ognia."** Wizualna metafora: **ciemny,
przytulny wieczór rozświetlony migoczącym, bezpiecznym światłem**. Strona jest jak wnętrze o
zmierzchu — ciepła ciemność, w której produkt jest jedynym źródłem światła. Pilot-różdżka = wygoda
i odrobina „magii". Nastrój UZASADNIA ciemne, ciepłe tła (nie estetyka „na siłę").

## PARTYTURA (8 pozycji z uzasadnieniami „ten produkt prowadzi do…”)
1. **Rodzina tła:** ciepła ciemność — głęboki espresso/węgiel z bursztynowym podtonem
   (`--bg #14100C`, `--surface #1E1813`, sekcje dowodowe na jaśniejszym ciepłym pergaminie
   `--paper #F5EEE3` dla czytelności). Ten produkt prowadzi do dark-mood, bo jego jedyną wartością
   wizualną jest ciepły blask w ciemności — jasne tło zabiłoby efekt. Dark-fallback pod lazy-sceny
   (⛔ biały błysk, feedback-wf2-scena-a-dark-fallback).
2. **Akcent:** **bursztyn płomienia `#E9A03A`** (hover `#D9862A`, glow `#FFC978`), wyprowadzony z
   REALNEGO koloru światła produktu (warm white flickering = amber glow). Ten produkt prowadzi do
   ciepłego złocistego akcentu — to dosłownie kolor jego światła. ΔE (CIE76) vs zaklipek `#0A6EBD`
   ≈ 90 · vs ugniatek `#0B6B64` ≈ 75 · vs koszyk `#... ` — daleko od progu 15.
3. **Para krojów:** **Fraunces** (miękki, ciepły serif old-style z opsz — nagłówki, wielkie liczby)
   + **Inter** (czytelny humanist sans — body, formularz, FAQ), oba latin-ext. Ten produkt prowadzi
   do serifowego, „świecowego" displayu (przytulność, editorial) w kontraście z czystym sansem —
   ≠ groteski Zaklipka (Bricolage) i Ugniatka (Space Grotesk). Sprytko-shop używa Quicksand, ale
   landing dostaje własną partyturę cieplejszą pod świece.
4. **Sygnatura:** cienkie ciepłe hairline'y (`#3A2F24`), micro-label CAPS w bursztynie z literowaniem,
   glif iskry **✦** jako separator sekcji, oversized Fraunces w „wielkiej liczbie" (4,8 / 187),
   miękka poświata (radial glow) wokół płomieni. Asymetria, zero równych siatek 50/50.
5. **archetyp-hero: A** — pełnokadrowa, immersyjna scena nastrojowa W TLE (świece migoczą w ciepłej
   ciemności, dłoń z pilotem-różdżką), copy na scrimie + mikro-oferta (chip 89,90 zł / COD). Ten
   produkt prowadzi do pełnej immersji, bo nastrój = główny argument; ≠ B (Zaklipek, split-stage),
   ≠ F (Ugniatek, dyptyk), ≠ H (koszyk), ≠ C (ssawek). Projektowany POD hero-video (migot = idealny
   cinemagraph). NIGDY pocztówka/split.
6. **Materiał/świat:** ciepłe wnętrza o zmierzchu (drewno, len, szkło), ogród/namiot weselny nocą,
   łazienka-spa; światło punktowe 2200–2700 K. Casting z ICP: dłonie kobiety, bez twarzy stockowej.
7. **Dobór sekcji:** pełny łuk problem→rozwiązanie→SPEKTRUM zastosowań→demo→dowód→oferta. Sekcja
   `zastosowania` (mozaika) OBOWIĄZKOWA (MAPA ≥2 funkcje). `unoszace` (efekt weselny) = wow-scena.
   `zdjecia-kupujacych` (4×5★) i `wideo` = klasa dowodowa (bez prawa SKIP dla agenta).
8. **Kolejność sekcji:** hero → zaufanie → problem → rozwiazanie → zastosowania → demo → korzysci →
   unoszace → porownanie → mid-cta → opinie → zdjecia-kupujacych → galeria → wideo → zamow → faq →
   final. Ten produkt prowadzi do wczesnego SPEKTRUM (po rozwiązaniu), bo wielozastosowaniowość jest
   głównym powodem zakupu; dowód (opinie+foto) tuż przed ofertą. Sekwencja ≠ Zaklipek.

## SCENY ANIMOWANE (F1.7b ANIM-3) — hero + 2
- **hero** (górna): świece migoczą, delikatny dryf cienia; dłoń+pilot STATYCZNE (anti-morfing).
- **unoszace** (środek-dół): wiszące świece kołyszą się nieznacznie + migot nad weselnym stołem.
- **final** (dół): pojedyncza grupa świec, spokojny migot, pętla bezszwowa.
Nośnik ruchu = migotanie LED (naturalny cinemagraph). Rozrzut góra/środek/dół, nie sąsiednie.

## ANTY-MISMATCH (CLAIM → ŹRÓDŁO; korzyść bez kotwicy = CUT)
| Claim na stronie | Źródło (Karta) |
|---|---|
| Bezpłomieniowe, bez ognia/dymu/wosku | SPEC Material=Plastic+LED · OPIS „flameless" |
| Sterowane pilotem-różdżką na odległość | tytuł „Magic Wand Remote" · OPIS · g0 · rev2-0 |
| Efekt „unoszących się" świec (żyłka+haczyki) | OPIS „floating candle effect" · g0/g2 · zestaw: 12 haczyków+żyłka 20 m |
| Ciepłe, migoczące światło | OPIS „warm white flashing" · g0 · rev3-3 |
| Na baterie, bez kabli/gniazdka | SPEC Voltage=NO AC/DC · OPIS „battery operated" |
| Wiele okazji/wnętrz (kolacja, wesele, taras, sypialnia, łazienka) | SPEC Occasion · OPIS · MAPA |
| Wielorazowe | OPIS „You can reuse it" |
| 12 świec + pilot + 12 haczyków + żyłka 20 m | OPIS „Each box contains" |
| 4,8★ / 187 ocen / 96,8% pozytywnych | review_stats 1:1 |
| Uczciwy minus: baterie do dokupienia (~13× AAA wg opinii) | OPIS „not included" · rev2/rev8 |
⛔ ZAKAZ: „premium/luksusowy", sztuczna pilność, obietnice dostawy/zdrowia, „magiczny" jako jedyny
motyw, twardy typ baterii w nagłówku (tylko FAQ), oferowanie większych zestawów za 89,90 zł.

## MANIFEST SEKCJI
1. `hero | scenowa | build`
2. `zaufanie | kodowa | build`
3. `problem | scenowa | build`
4. `rozwiazanie | scenowa | build`
5. `zastosowania | scenowa | build` — SPEKTRUM ≥4 światy (MAPA ≥2 funkcje)
6. `demo | scenowa | build`
7. `korzysci | kodowa | build`
8. `unoszace | scenowa | build` — efekt weselny „floating" (wow)
9. `porownanie | kodowa | build`
10. `mid-cta | scenowa | build`
11. `opinie | kodowa | build`
12. `zdjecia-kupujacych | kodowa | build` — 4×5★, klasa dowodowa (bez SKIP)
13. `galeria | kodowa | build`
14. `wideo | kodowa | blokada-tomek` — video_url do vision-gate F5; sekcji nie zdejmuje agent
15. `zamow | kodowa | build` — checkout-inline@2 (`data-zc-product`+`data-zc-api`)
16. `faq | kodowa | build`
17. `final | scenowa | build`

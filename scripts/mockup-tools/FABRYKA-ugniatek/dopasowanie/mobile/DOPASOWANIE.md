# DOPASOWANIE MOBILE 390 — dowody per sekcja (proof-index, rubryka R13)

Kompozyty [makieta | render] w tym katalogu; makiety mobile WSZYSTKICH sekcji (F2.4),
mapowanie przez --manifest (LL-034). Werdykty = rubryka vision (4 rundy do wyczerpania).

| sekcja | dowod | SSIM (info) | rubryka | werdykt | uwaga |
|---|---|---|---|---|---|
| hero | 01-hero-m.png | 0.401 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** | karta kompakt; pasek w srodku zrzutu = sticky topbar (artefakt) |
| dwie-formy | 02-dwie-formy-m.png | 0.535 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** | TOR-I stan A + przelacznik; sylwetka 232px; sticky-buy w zrzucie = artefakt |
| sticky | 03-sticky-m.png | render-only | werdykt jakosci: OK | render-only OK | pasek kompletny: miniatura + Ugniatek 189,00 zl + BLIK/karta/pobranie + CTA; touch-target OK |
| anatomia | 04-anatomia-m.png | 0.543 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** | calloutsy = pionowa lista pod obrazem; H2 3 wiersze jak makieta |
| sterowanie | 05-sterowanie-m.png | 0.490 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** | etykieta na foto z tekstem; karty spec czytelne |
| wieczorem | 06-wieczorem-m.png | 0.360 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** | dwa foto + karta Po pracy/Po treningu kompakt |
| mid-cta | 07-mid-cta-m.png | 0.636 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** | title 22 / cena 30; kadr produktu 4:3 |
| zestaw | 08-zestaw-m.png | 0.631 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** | flat-lay + spec 12px + panel 11 cm — komplet |
| zamow | 09-zamow-m.png | 0.683 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** | realny checkout steps (charakter); dowod z override |
| faq | 10-faq-m.png | 0.712 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** | +eyebrow FAQ (sygnatura serii); akordeon 10 pozycji touch-friendly |
| final | 11-final-m.png | 0.513 | skala_elem:T · ar_proporcje:T · guttery:T · krawedz:T · wys_vs_makieta:T → WERDYKT: TAK | **TAK** | boczne kadry = kwadraty (height:auto vs atrybut height=800) |

## WERDYKT ZBIORCZY (rubryka vision 5xT/N — 2. para oczu Sonnet, 4 rundy DO WYCZERPANIA)
Runda 1: 0/20 → poprawki systemowe (skala H1/H2/cen, hero-karta, final-pasmo, gestosci mobile).
Runda 2: 8/20 → mobile type-scale (clampy sekcyjne), st-callout, final img height:auto, hero center.
Runda 3: 18/20 → anatomia H2 + mid-cta kolumny/20ch. Runda 4 (werdykt okiem na kompozytach): **20/20 TAK**.

## NOTY KONTEKSTOWE (nie-defekty)
- **dwie-formy = TOR-I**: makieta pokazuje OBA stany dokumentacyjnie; kod = JEDEN przelacznik
  (crossfade, aria-tablist). Zgodnosc liczona do stanu A. Test stanow = krok lp_zycie.
- **zamow**: dowod renderowany z `data-zc-config` override (produkt niepublikowany — placeholder
  {{WF2_PRODUCT_ID}} hydratowany dopiero przy publikacji pl_*). Mechanika modulu NIETKNIETA.
- **ze-flatlay**: pudelko na scenie celowo PLAIN (bez nadruku) — uczciwosc unboxingu (nota F3);
  roznica vs makieta z brandowanym pudelkiem = ZAMIERZONA, nie dryf.
- **ze-callout** („komplet w pudelku"): czytelny na jasnej podlodze kadru — pilnowac przy
  ewentualnej podmianie kadru (ciemny karton = utrata czytelnosci).
- raw-SSIM = INFORMACYJNY (R13: real-render vs AI-makieta nie dyskryminuje wiernosci);
  decyduja: LAYOUT-diff DOM self-checki (0 FAIL desktop i mobile) + rubryka vision.
- Bug-klasa naprawiona serialowo: atrybut `height` obrazka jako hint UA blokuje CSS
  `aspect-ratio` bez `height:auto` (final); `.reveal.in{transform:none}` kasuje centrowanie
  przez translateX (hero) — patrz LL-033.

<!-- MOBILE-390 -->
## MOBILE (390 · DPR1) — sekcja-diff.py --viewport 390

Render `ugniatek` @ 390px. Mobile bez makiety = skladanka render-only z werdyktem jakosci.

| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |
|---|---|---|---|
| hero | [makieta|render] 01-hero-m.png | 0.395 |  |
| dwie-formy | [makieta|render] 02-dwie-formy-m.png | 0.533 |  |
| sticky | render-only 03-sticky-m.png | render-only |  |
| anatomia | [makieta|render] 04-anatomia-m.png | 0.542 |  |
| sterowanie | [makieta|render] 05-sterowanie-m.png | 0.501 |  |
| wieczorem | [makieta|render] 06-wieczorem-m.png | 0.365 |  |
| wideo | [makieta|render] 07-wideo-m.png | 0.428 |  |
| mid-cta | [makieta|render] 08-mid-cta-m.png | 0.636 |  |
| zestaw | [makieta|render] 09-zestaw-m.png | 0.625 |  |
| zamow | [makieta|render] 10-zamow-m.png | 0.656 |  |
| faq | [makieta|render] 11-faq-m.png | 0.711 |  |
| final | [makieta|render] 12-final-m.png | 0.534 |  |

> Mobile: makieta istnieje TYLKO dla hero i wideo (SSIM). Reszta = render-only —
> werdykt jakosci (produkt duzy? tresc czytelna? touch-target? kolaz/panel/FAQ OK? h-scroll 0?).
> Incydent Loczek 17.07: mobile nie bylo sprawdzane wcale — dowod jest DWUKROTNY (1280 I 390).
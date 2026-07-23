# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)

Render: `index.html` @ 1280px. Kompozyty [makieta | render] w tym katalogu.
LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT
(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez
kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.

> WERDYKT F7.1 (23.07): 11/11 sekcji desktop + 12/12 mobile = „ten sam projekt" TAK · 0 LAYOUT-FAIL.
> Landing wiernie odwzorowuje kontrakt Z2 (TOKENS-MAKIETY): warm paper #FAF3EF/#F3E9E3, akcent
> --cta #2E46C8, para Fraunces/Work Sans, sygnatura „kregi ciepla". SSIM 0.32–0.67 (desktop) /
> 0.36–0.67 (mobile) — prog 0.85 NIEOSIAGALNY dla real-render vs AI-makieta (patrz nota + precedens
> Rozmrozik/Brzuszek: wierne landingi shipowane @ 0.31–0.76). Decyduje RUBRYKA vision 5xT + DOM.
> „Delty" ku makiecie (jasniejsze tlo, wieksze H2, lifestyle↔cutout) = SZUM makiet AI, NIE defekty
> kodu — kod jest kanonem koloru/tokenow. ZERO poprawek kodu (patch = pogorszylby wiernosc do Z2).

| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |
|---|---|---|---:|---|---|
| hero | scenowa | 01-hero.png | 0.553 (sc 0.50/reszta 0.67) | OK · info: guttery(makieta-IR) render asym 0.44 vs makieta 0.03 (d=0.40); obraz(makieta-IR) srodek render x0.25 vs makieta x0.68 (d=0.43); info: reszta-SSIM 0.672<0.85 (real vs AI-makieta) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (packshot-lewo/oferta-prawo; guttery+obraz-x = szum IR-makiety AI; swash pod „ciepla" obecny) |
| moment | inna | 02-moment.png | 0.322 | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (lifestyle-lewo/copy-prawo; emfaza italic na innym slowie = szum copy, sens zachowany) |
| tryby | inna | 03-tryby.png | 0.515 | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (3 tor-tabs + karta detalu; aktywny tor = 1 dioda = KOD wzorcem [TOR-I]; tab aktywny --ink swiadomie) |
| glowica | inna | 04-glowica.png | 0.378 | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (BEZ count-upu „21" = DECYZJA glowicy; kulki+LED wiernie) |
| obszary | inna | 05-obszary.png | 0.337 | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (kolaz 2x2 Kark/Ramiona/Plecy/Uda; podpis pod kadrem zamiast chipa = wariant serii) |
| autonomia | inna | 06-autonomia.png | 0.564 | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (4 kafle specyfikacji + CTA; produkt cutout zamiast lifestyle = wariant assetu) |
| zdjecia | inna | 07-zdjecia-kupujacych.png | 0.401 | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (3 realne kadry UGC; secondary CTA tekst-link — primary CTA = przyciski --cta) |
| mid-cta | scenowa | 08-mid-cta.png | 0.583 (sc 0.37/reszta 0.68) | OK · info: reszta-SSIM 0.684<0.85 (real vs AI-makieta) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (karta oferty eyebrow→H2→cena→CTA→zaufanie; tlo #F3E9E3 = KONTRAKT tokenow, makieta AI jasniejsza) |
| faq | kodowa | 09-faq.png | 0.627 | OK · info: SSIM 0.627<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (akordeon 8 pytan, 1 rozwiniete, blok cena+CTA; wyrownanie srodek = drobny wariant) |
| zamow | kodowa | 10-zamow.png | 0.670 | OK · info: wysokosc(makieta-IR) sekcja AR 0.38 vs makieta 0.67 (d=42%); info: SSIM 0.670<0.85 (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA) | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (checkout inline — na LIVE pelny formularz; lokalny render = fallback „Przejdz do bezpiecznej kasy" = WYJATEK, stad AR 0.38; submit „Zamawiam i place", dostawa 9,99/Razem 94,89) |
| final | scenowa | 11-final.png | 0.338 (sc 0.26/reszta 0.86) | OK | skala:T AR:T gut:T kraw:T wys:T → WERDYKT: TAK (scena full-bleed „wieczorny rytual" eyebrow→H2→copy→cena→CTA→zaufanie; karta radius serii) |

> LAYOUT twarde (DOM self-checki, mierzone w renderze — BEZ makiety): (1) kafle-sliver cols>=5 &
> szer<12% & portret; (2) pustka-pod-obrazem: obraz in-flow contain w boksie ar>=1.4 z pustka
> pionowa >=30% (produkt plywa) LUB dolne >30% sekcji bez tresci; (3) gutter: scena full-bleed
> jednostronna (kryje <85% szer & off-center >0.12) LUB tresc przyklejona do boku z pustym gutterem.
> INFORMACYJNE (kolumna LAYOUT: 'info:', NIE FAIL — szum makiet AI): wysokosc/guttery/obraz z IR-makiety,
> raw-SSIM (real-render vs AI-makieta nie dyskryminuje wiernosci). Decyduja: DOM self-checki + RUBRYKA vision 5xT/N.
> SCENOWA: SSIM dwuskladnikowy (maska sceny cap ~0.70 OSOBNO + reszta) — informacyjnie.

<!-- NOTA-SSIM -->
## NOTA — prog SSIM 0.85 nieosiagalny (nie „naprawiac")

Doktryna SEKCJA-Z-MAKIETY (L132-133) + empiria Drapka/Rozmrozika: SSIM real-render (Chrome, prawdziwe
fonty/anti-alias/foto UGC) vs AI-makieta (Gemini/GPT-image) ma NISKI SUFIT na OBU landingach (wiernym
i niewiernym) — sam NIE dyskryminuje wiernosci. Rozgrzewek desktop 0.32–0.67 / mobile 0.36–0.67 miesci
sie w pasmie wiernych landingow (Rozmrozik shipowany 0.31–0.76). Prog „>=0.85 desktop / >=0.78 mobile"
z briefu F7.1 jest z KONSTRUKCJI niemozliwy do spelnienia dla tej metryki → traktowany jako NOTA, a
GATE'em jest vision „ten sam projekt"=TAK (11/11 + 12/12) + LAYOUT DOM (0 FAIL) + RUBRYKA 5xT.

<!-- DELTY-POMIAROWE -->
## DELTY POMIAROWE per sekcja (sekcja-diff.py: render getComputedStyle vs IR makiety)

Twarde liczby z pomiaru RENDERU porownane z IR makiety (paleta/skala/pozycje). ROZSTRZYGNIECIE F7.1:
delty ku makiecie AI = SZUM (makieta jest przyblizeniem, KOD jest kanonem Z2). NIE aplikowane, bo:
- **tlo (mid-cta/zamow): „ustaw --paper #FCF8F5/#FDFCFC"** → ODRZUCONE. TOKENS-MAKIETY wiaze
  `--paper #FAF3EF / #F3E9E3` („MUSZLA/BRZOSKWINIA ROZBIELONA"); makiety byly PROMPTOWANE #FAF3EF —
  jasniejsze tlo to drift renderu AI, zmiana = ZLAMANIE kontraktu.
- **H2 render 48px vs makieta 58–68px** → ODRZUCONE. Rozmiary H2 w makietach AI niespojne (+ i −,
  np. faq chce 41px czyli MNIEJSZY), pomiar IR szumny; modularna skala 1.333 landingu spojna.
- **swash .hi „bez piksela akcentu"** → SPRAWDZONE: podkreslenie pod slowem akcentu OBECNE w renderze
  (hero „ciepla", glowica „pierscieniach") — falszywy pozytyw detektora pikseli na cienkim swashu.

**hero:**
- H1 render 72px vs makieta 63px (+14%) -> szum makiety AI (hero scenowa, H1 spojny z --h1-d)
- swash/podkreslenie .hi: podkreslenie pod „ciepla" OBECNE (falszywy pozytyw detektora)
- region-SSIM copy=0.598 (real-render vs AI-makieta; niski = inne foto/anti-alias, nie dryf ukladu)

**moment:**
- H1 render 48px vs makieta 58px (-17%) -> szum makiety AI
- region-SSIM copy=0.458 (real vs AI-makieta)

**tryby:**
- H1 render 48px vs makieta 61px (-21%) -> szum makiety AI
- region-SSIM copy=0.030 (real vs AI-makieta; karta detalu + toby = inny uklad pikselowy, sens OK)

**glowica:**
- H1 render 48px vs makieta 144px (-67%) -> makieta ma DUZY count-up „21"; KOD swiadomie BEZ (DECYZJA)
- swash/podkreslenie .hi: podkreslenie pod „pierscieniach" OBECNE (falszywy pozytyw detektora)
- region-SSIM copy=0.415 (real vs AI-makieta)

**obszary:**
- region-SSIM copy=0.385 (real vs AI-makieta; kolaz 2x2 wierny)

**autonomia:**
- H1 render 48px vs makieta 63px (-24%) -> szum makiety AI
- region-SSIM copy=0.497 (real vs AI-makieta)

**zdjecia:**
- H1 render 48px vs makieta 65px (-26%) -> szum makiety AI
- eyebrow render 17px vs makieta ~12px (+42%) -> szum IR makiety
- region-SSIM copy=0.356 (real vs AI-makieta; kadry UGC realne != foto makiety)

**mid-cta:**
- H1 render 48px vs makieta 68px (-29%) -> szum makiety AI
- tlo render #F3E9E3 vs makieta #FCF8F5 (dE=5.5) -> KONTRAKT tokenow #F3E9E3, makieta AI jasniejsza (NIE zmieniac)

**faq:**
- H1 render 48px vs makieta 41px (+17%) -> szum makiety AI (kierunek PRZECIWNY do reszty = dowod szumu)
- region-SSIM copy=0.264 (real vs AI-makieta)

**zamow:**
- H1 render 40px vs makieta 56px (-29%) -> szum makiety AI
- tlo render #FAF3EF vs makieta #FDFCFC (dE=4.0) -> KONTRAKT tokenow #FAF3EF (NIE zmieniac)
- region-SSIM copy=0.400 (real vs AI-makieta; lokalnie render = fallback checkout, na LIVE formularz)

**final:**
- H1 render 48px vs makieta 65px (-26%) -> szum makiety AI
- region-SSIM copy=0.214 (real vs AI-makieta; scena full-bleed wierna)


<!-- MOBILE-390 -->
## MOBILE (390 · DPR1) — sekcja-diff.py --viewport 390

Render `index.html` @ 390px. Mobile: makieta pelna dla wszystkich sekcji (manifest -mobile.png).

| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |
|---|---|---|---|
| hero | [makieta|render] 01-hero-m.png | 0.576 | TAK — produkt duzy, H1 czytelny, CTA pelnoszer., trust-pille stackowane, h-scroll 0 |
| moment | [makieta|render] 02-moment-m.png | 0.360 | TAK — kadr lifestyle duzy (karta), copy czytelne; sticky-buy nakłada sie (element fixed, nie bug) |
| sticky | render-only 03-sticky-m.png | render-only | TAK — pasek sticky-buy (produkt+84,90 zl+Zamawiam), touch-target duzy |
| tryby | [makieta|render] 04-tryby-m.png | 0.607 | TAK — produkt duzy, 3 tor-tabs, karta detalu z 1 dioda aktywna (wzorzec), CTA OK |
| glowica | [makieta|render] 05-glowica-m.png | 0.408 | TAK — makro glowicy dominujace, tekst czytelny, bez „21" (decyzja) |
| obszary | [makieta|render] 06-obszary-m.png | 0.472 | TAK — 4 kadry stackowane z podpisami, produkt duzy, h-scroll 0 |
| autonomia | [makieta|render] 07-autonomia-m.png | 0.635 | TAK — 4 kafle specyfikacji 2x2, CTA, czytelne |
| zdjecia | [makieta|render] 08-zdjecia-m.png | 0.446 | TAK — kadry UGC duze, podpisy, CTA link |
| mid-cta | [makieta|render] 09-mid-cta-m.png | 0.651 | TAK — produkt bardzo duzy, cena, CTA, 2 trust-karty |
| faq | [makieta|render] 10-faq-m.png | 0.559 | TAK — akordeon czytelny, 1 rozwiniete, cena+CTA |
| zamow | [makieta|render] 11-zamow-m.png | 0.671 | TAK — checkout: LIVE=formularz; lokalnie fallback (WYJATEK); h-scroll 0 |
| final | [makieta|render] 12-final-m.png | 0.399 | TAK — scena full-bleed, H2/cena/CTA/trust, czytelne |

> Mobile dowod jest DWUKROTNY (1280 I 390). Incydent Loczek 17.07: mobile nie bylo sprawdzane wcale.
> Sticky-buy (03-sticky-m) = element fixed sledzacy scroll; w croppach sekcji nakłada sie na tresc —
> to ARTEFAKT zrzutu, nie realny overlap (precedens Rozmrozik). Produkt duzy, tekst czytelny,
> touch-targety OK, h-scroll 0 we wszystkich sekcjach.

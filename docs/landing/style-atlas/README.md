# Style Atlas — katalog stylów landingowych

> **Wprowadzone 2026-04-23 (System v4).** Rozwiązuje problem konwergencji: mimo MODE=forge i różnych manifestów, landingi dryfowały do tego samego zestawu narzędzi (Fraunces + Nº + bento 2×2). Atlas to katalog konkretnych stylów z **hard constraints**, z którego wybiera się deterministycznie po Product DNA.

## Dlaczego Atlas istnieje

Manifest („Linen Ritual", „Panoramic Calm") opisuje MOOD, nie TOOLKIT. Bez konkretnego fontu, palety, layout primitives i **zakazów**, Claude sięga po domyślny zestaw który „działa". Atlas zmusza do wyboru z katalogu 25-40 stylów, z których każdy MA definiowane co wolno i czego nie wolno.

---

## Struktura Atlas

### Pliki
- `README.md` — ten plik (framework + indeks)
- `_template.md` — schema nowego stylu (12 pól)
- `[style-name].md` — pojedynczy styl (15-40 plików)

### Schema stylu (12 pól)
Każdy styl MUSI mieć:

| # | Pole | Opis |
|---|------|------|
| 1 | **Nazwa + tagline** | Unikalny identyfikator + 1 zdanie mood |
| 2 | **Product DNA profil** | 7 etykiet (patrz niżej) |
| 3 | **Kategorie produktów** | Do których pasuje (3-5) |
| 4 | **Real-world refs** | 3-5 marek industry (NIE inne landingi) |
| 5 | **Font stack** | Display / Body / Mono — konkretne nazwy, PL-safe |
| 6 | **Paleta** | 4-6 hex z rolami (dominant 60% / secondary 30% / accent 10%) |
| 7 | **Layout DNA** | Jaka dominanta: grid / editorial column / canvas / collage / stack / dashboard |
| 8 | **Signature primitives** | 3-5 charakterystycznych elementów (konkretny HTML/CSS pattern) |
| 9 | **MUSZĄ być użyte** | Hard constraints (grep-sprawdzalne) |
| 10 | **NIE WOLNO użyć** | Zakazane fonty / layouty / kolory / elementy |
| 11 | **Motion budget** | still / subtle / moderate / expressive |
| 12 | **Example snippet** | Hero + 1 feature jako HTML/CSS (gotowy do skopiowania) |

---

## Product DNA — 7 osi wyboru

Każdy produkt opisujesz **7 etykietami** (3 wartości per oś = 2187 profili). Każdy styl ma etykietowany profil DNA.

| Oś | Wartości | Pytanie pomocnicze |
|----|----------|--------------------|
| **Utility ↔ Ritual** | utility / dual / ritual | Czy produkt wykonuje pracę, czy jest doświadczeniem? |
| **Precision ↔ Expression** | precision / balanced / expression | Czy ważna jest dokładność, czy charakter? |
| **Evidence ↔ Feeling** | evidence / blend / feeling | Czy klient kupuje dane, czy emocję? |
| **Solo ↔ Community** | solo / dual / community | Czy używa się samemu, czy we wspólnocie? |
| **Quiet ↔ Loud** | quiet / moderate / loud | Czy marka szepcze, mówi, czy krzyczy? |
| **Tradition ↔ Future** | tradition / present / future | Czy nawiązuje do przeszłości, teraźniejszości, czy technologii? |
| **Intimate ↔ Public** | intimate / social / public | Czy jest prywatna sprawa, czy manifest? |

### Przykłady profili DNA

| Produkt | DNA profil | Style match (top-3) |
|---------|-----------|---------------------|
| Parownica ręczna eko-mamy (Steamla) | utility · precision · evidence · solo · quiet · present · intimate | Apothecary Label, Clinical Kitchen, Japandi Serenity |
| Wino premium luxury (Paromia) | ritual · expression · feeling · community · quiet · tradition · social | Editorial Print, Dark Academia, Cottagecore |
| Myjka do okien smart (Vitrix) | utility · precision · evidence · solo · moderate · future · intimate | Panoramic Calm, Clinical Kitchen, Swiss Grid |
| Robot do zabawy dla dzieci (Pupilnik) | ritual · expression · feeling · dual · loud · present · social | Playful Toy, Memphis, Cottagecore |
| Gaming gear (Vibestrike) | dual · expression · blend · community · loud · future · public | Retro-Futuristic, Poster Utility, Y2K Nostalgia |

---

## Proces wyboru stylu w ETAP 1

### Krok 1 — Wypełnij Product DNA (7 etykiet)
Na bazie brand_info + report_pdf + workflow_products odpowiedz na 7 pytań. Odpowiedzi muszą mieć uzasadnienie (1 zdanie per oś).

### Krok 2 — Dopasuj top-3 style
Przeszukaj Atlas i znajdź 3 style które pasują do profilu DNA (możliwie najwięcej osi się zgadza).

### Krok 3 — Wybierz 1 z 3 z argumentacją
Dlaczego ten, nie tamten? 1 argument (konkret, nie „bo mi pasuje").

### Krok 4 — Przeczytaj plik stylu
Font stack, paleta, layout DNA, **zakazy** — internalizuj przed ETAP 2.

### Krok 5 — Generate STYLE LOCK w `_brief.md` sekcja 10
Auto-paste z pliku stylu do briefa. Ta sekcja staje się kontraktem na cały landing.

---

## Product DNA Anchors — kotwice per oś

> Dla każdej z 7 osi DNA podajemy 5-10 konkretnych produktów-kotwic z realnego rynku. Gdy etykietujesz produkt klienta, **MUSISZ** wymienić 2 kotwice które uzasadniają wybór etykiety. Jeśli nie możesz — etykieta jest błędna, użyj innej.

### Utility ↔ Ritual
| Utility (wykonuje pracę) | Ritual (jest doświadczeniem) |
|--------------------------|------------------------------|
| Anker PowerCore powerbank | La Mer face cream |
| DJI Mavic drone | Aesop hand wash |
| Dyson V15 odkurzacz | Byredo perfume |
| Shark steam mop | Fountain pen Pelikan |
| Philips Avent podgrzewacz | Matcha ceremony tea set |
| **Steamla parownica** | Chinese wuxia czajniczek |

**Kotwica pomocnicza:** jeśli produkt „robi pracę i nic więcej" (powerbank ładuje, parownica czyści) — **utility**. Jeśli dodaje rytuał do codzienności i byłby kupowany jako doświadczenie (perfumy, herbata ceremonialna) — **ritual**. Jeśli oba (wino codzienne = utility picia + ritual wieczoru) — **dual**.

### Precision ↔ Expression
| Precision (dokładność kluczowa) | Expression (charakter kluczowy) |
|---------------------------------|--------------------------------|
| Swiss watch mechanical | Liquid Death woda |
| Scale Withings | Graza olive oil |
| Thermometer medical | Omsom sauce |
| Sous-vide cooker | Bark pet toy |
| Power bank (mAh specs) | Art poster/print |

### Evidence ↔ Feeling
| Evidence (klient kupuje dane) | Feeling (klient kupuje emocję) |
|-------------------------------|-------------------------------|
| Anker 20000 mAh | La Mer face cream |
| Dyson V15 „99% pick up" | Byredo perfume |
| Apple M3 benchmarks | Kinfolk magazine |
| Medela clinical trials | Sezane dress |

### Solo ↔ Community
| Solo (solitary use) | Community (shared/social) |
|--------------------|--------------------------|
| Meditation app | Beer brewery |
| Skincare serum | Gaming hardware |
| Notebook | Party supplies |
| Steamla (sprzątanie domu) | Liquid Death (event drinks) |

### Quiet ↔ Loud
| Quiet | Loud |
|-------|------|
| Muji notebook | Liquid Death |
| Aesop apothecary | Bark dog toys |
| Japanese tea | Omsom bold |
| Moleskine | HU Kitchen manifesto |

### Tradition ↔ Future
| Tradition | Future |
|-----------|--------|
| Moka pot coffee | DJI drone |
| Leather boots (Red Wing) | AirPods Max |
| Fraunces magazine | Linear SaaS |
| Pelikan fountain pen | Tesla accessories |

### Intimate ↔ Public
| Intimate (prywatnie) | Public (manifestuje) |
|---------------------|---------------------|
| Skincare routine | Streetwear |
| Sleep tracker | Gaming setup |
| Face cream | Statement t-shirt |
| Steamla (sprzątanie) | Yeti cooler (pokazuje się) |

---

## Indeks stylów (v4.0 — 2026-04-23)

### Istniejące baseline'y (6) — udokumentowane retrospektywnie
| Styl | Plik | DNA | Refs |
|------|------|-----|------|
| Editorial Print | `editorial-print.md` | ritual·expression·feeling·solo·quiet·tradition·social | Fraunces magazine, Kinfolk, Cereal |
| Panoramic Calm | `panoramic-calm.md` | utility·precision·evidence·solo·quiet·future·public | Apple, Stripe, Linear |
| Organic Natural | `organic-natural.md` | ritual·balanced·feeling·solo·quiet·tradition·intimate | Glossier, Aesop (softer), Ritual |
| Playful Toy | `playful-toy.md` | ritual·expression·feeling·dual·loud·present·social | Bark, Liquid Death (playful side), Omsom |
| Retro-Futuristic | `retro-futuristic.md` | dual·expression·blend·community·loud·future·public | HyperX, Razer, Bang |
| Rugged Heritage | `rugged-heritage.md` | utility·balanced·evidence·solo·moderate·tradition·public | Filson, Red Wing, Yeti |

### Nowe style (9) — dodane 2026-04-23
| Styl | Plik | DNA | Refs |
|------|------|-----|------|
| Apothecary Label | `apothecary-label.md` | utility·precision·evidence·solo·quiet·present·intimate | Thrive Market, Seventh Generation, Common Heir |
| Poster Utility | `poster-utility.md` | utility·expression·feeling·community·loud·present·public | Liquid Death, Graza, Athletic Greens, HU |
| Clinical Kitchen | `clinical-kitchen.md` | utility·precision·evidence·solo·moderate·future·intimate | Anker, DJI, Philips Avent, Medela |
| Japandi Serenity | `japandi-serenity.md` | ritual·precision·feeling·solo·quiet·tradition·intimate | Muji, Snow Peak, Hay |
| Swiss Grid | `swiss-grid.md` | utility·precision·evidence·solo·quiet·present·public | Vitsœ, Helvetica Now specimens, IBM |
| Brutalist DIY | `brutalist-diy.md` | dual·expression·blend·solo·loud·present·public | Are.na, Cash App (older), Readymag |
| Dark Academia | `dark-academia.md` | ritual·expression·feeling·solo·quiet·tradition·intimate | Book covers Penguin Classics, Everlane (older), Margaret Howell |
| Cottagecore Botanical | `cottagecore-botanical.md` | ritual·expression·feeling·dual·quiet·tradition·intimate | Sezane, Doen, Daylesford |
| Outdoorsy Expedition | `outdoorsy-expedition.md` | utility·balanced·evidence·dual·moderate·tradition·public | Patagonia, Snow Peak, Topo Designs |

### Kolejne style (planned, Faza 2)
Y2K Nostalgia, Memphis, Vaporwave, Neo-Brutalism, Terminal, Newsroom, Chinese Wuxia, Athletic Wear, Biophilic, Soft Bauhaus, Neo-Mongolia, Japanese Supermarket.

---

## Zasady użycia

### ✅ TAK
- Każdy nowy landing wybiera styl z Atlas (nigdy „wymyślam nowy bez uzasadnienia")
- Style Lock w `_brief.md` jest **kontraktem** — łamiesz go = FAIL w verify-landing
- Jeśli żaden z 40 stylów nie pasuje → najpierw **dodaj nowy styl do Atlas** (commit do `style-atlas/`), dopiero potem użyj go

### ❌ NIE
- Nie wybieraj stylu „z głowy" pomijając Atlas
- Nie mieszaj 2 stylów („50% Editorial + 50% Apothecary") — to kolejna droga do konwergencji
- Nie dodawaj fontów/kolorów poza Style Lock bez świadomego updatu pliku stylu

---

## Relacja do istniejącej procedury

- **`01-direction.md`** — Krok 10 zastępuje stare „MODE=forge z presetu albo nowy". Teraz: Product DNA → Style Pick z Atlas → Style Lock do briefa.
- **`_brief.template.md`** — nowa sekcja 10 „STYLE LOCK" (MUSZĄ / NIE WOLNO)
- **`verify-brief.sh`** — wymusza sekcję 10 obecną
- **`02-generate.md`** — ETAP 2 konsumuje Style Lock jako dosłowny kontrakt (fonty tylko z lock, paleta tylko z lock, zakazy egzekwowane)
- **`section-variants.md`** — nadal używane, ale wewnątrz ograniczeń Style Lock (nie każdy wariant jest legal dla każdego stylu)
- **`verify-landing.sh`** — nowa grupa 14 „Style Lock compliance" (planned Faza 2)

---

## Jak dodać nowy styl

1. Skopiuj `_template.md` → `[nowa-nazwa].md`
2. Wypełnij wszystkie 12 pól (przede wszystkim pole 9 i 10 — constraints są kluczowe)
3. Dodaj do indeksu w tym README
4. Commit z message: `style-atlas: add [nazwa] — [1 zdanie o DNA]`
5. Styl dostępny od razu w ETAP 1

## Cross-references

- [`_template.md`](./_template.md) — schema nowego stylu
- [`../01-direction.md`](../01-direction.md) — jak wybierać styl w ETAP 1
- [`../02-generate.md`](../02-generate.md) — jak respektować Style Lock w ETAP 2

// =====================================================================
// PRODUKTY V2 — workflow sourcingu i weryfikacji kandydatow produktowych
// Uruchamiany przez Claude (Workflow tool) z args:
// {
//   framework: <JSON z settings.product_research_framework>,
//   existing_names: ["nazwa1", ...],   // juz przebadane — unikac duplikatow
//   round: "2026-06-R1",
//   max_categories: 8,                  // ile kategorii z shortlisty przerobic
//   candidates_per_category: 3
// }
// Zwraca: { scored: [...] } — rekordy gotowe do INSERT do product_recommendations
// =====================================================================

export const meta = {
  name: 'tn-product-sourcing',
  description: 'Sourcing kandydatow produktowych + adwersarialna weryfikacja + scoring',
  phases: [
    { title: 'Kandydaci', detail: 'generatorzy per kategoria (AliExpress + Allegro + popyt)' },
    { title: 'Weryfikacja', detail: '3 sceptykow per kandydat (marza / popyt / ryzyko)' },
    { title: 'Scoring', detail: 'ocena per framework + werdykt' },
  ],
}

let A = args
if (typeof A === 'string') A = JSON.parse(A)
if (A && typeof A.framework === 'string') A.framework = JSON.parse(A.framework)
const fw = A && A.framework
if (!fw || !fw.scoring_framework) throw new Error('Brak frameworku w args.framework — najpierw uruchom market research')

const ROUND = A.round || 'R-unknown'
const MAX_CATS = A.max_categories || 8
const PER_CAT = A.candidates_per_category || 3
const EXISTING = (A.existing_names || []).map(n => n.toLowerCase())
const BLACKLIST = fw.saturated_blacklist || []
const ANTI = fw.anti_criteria || []
const DIMS = fw.scoring_framework.dimensions
const SCEN = fw.unit_economics_model?.scenarios || []
const BENCH = fw.unit_economics_model?.benchmarks || []

const ECON_CONTEXT = `MODEL EKONOMICZNY (z researchu rynkowego — uzywaj tych liczb):
Benchmarki: ${JSON.stringify(BENCH)}
Scenariusze cenowe (cena / max COGS / marza kontryb. / max CPA / BE ROAS): ${JSON.stringify(SCEN)}
Wzor: ${fw.unit_economics_model?.breakeven_formula || ''}`

const BIZ_CONTEXT = `KONTEKST: Polski one-product store. Produkt z AliExpress (dropshipping/maly stock), sklep TakeDrop,
dedykowany landing PL + Meta Ads, platnosc COD + BLIK. Cena detaliczna 100-250 zl. Produkt MUSI rozwiazywac
realny problem szerokiej grupy Polakow i byc brandowalny (budujemy wokol niego marke). Data: ${ROUND}.
NIE proponuj produktow z tej blacklisty (nisze przesycone): ${JSON.stringify(BLACKLIST)}
NIE proponuj produktow naruszajacych anty-kryteria: ${JSON.stringify(ANTI)}
NIE proponuj produktow zbyt podobnych do juz przebadanych: ${JSON.stringify(EXISTING)}`

const CANDIDATE_SCHEMA = {
  type: 'object',
  required: ['candidates'],
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'problem_statement', 'target_audience', 'cogs_estimate_pln', 'retail_price_pln', 'demand_evidence'],
        properties: {
          name: { type: 'string', description: 'Robocza polska nazwa produktu (typ produktu, nie marka)' },
          description: { type: 'string' },
          problem_statement: { type: 'string', description: 'Jaki konkretny problem rozwiazuje i dla kogo' },
          target_audience: { type: 'string', description: 'Grupa docelowa + szacunek wielkosci w PL' },
          source_url: { type: 'string', description: 'Link AliExpress (lub inne zrodlo zaopatrzenia)' },
          source_price_usd: { type: 'number' },
          cogs_estimate_pln: { type: 'number', description: 'Koszt produktu + wysylka z Chin, PLN, konserwatywnie' },
          retail_price_pln: { type: 'number', description: 'Proponowana cena detaliczna 100-250 zl' },
          allegro_price_check: { type: 'string', description: 'Po ile podobne produkty chodza na Allegro (z lichbami)' },
          demand_evidence: {
            type: 'array',
            items: {
              type: 'object',
              required: ['claim', 'confidence'],
              properties: {
                type: { type: 'string', description: 'allegro|google_trends|meta_ads|tiktok|raport|inne' },
                claim: { type: 'string' },
                source_url: { type: 'string' },
                confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
              },
            },
          },
          brand_potential: { type: 'string', description: 'Dlaczego da sie wokol tego zbudowac marke' },
          ad_angles: {
            type: 'array',
            items: {
              type: 'object',
              required: ['angle'],
              properties: { angle: { type: 'string' }, audience: { type: 'string' }, hook: { type: 'string' } },
            },
          },
          image_url: { type: 'string', description: 'URL zdjecia produktu jesli znalezione' },
          notes: { type: 'string' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['refuted', 'severity', 'findings'],
  properties: {
    refuted: { type: 'boolean', description: 'true = kandydat NIE przechodzi przez ten filtr' },
    severity: { type: 'string', enum: ['blocker', 'major', 'minor', 'none'] },
    findings: { type: 'string', description: 'Co znaleziono — konkretnie, z liczbami i zrodlami' },
    adjusted_numbers: {
      type: 'object',
      description: 'Skorygowane liczby jesli generator sie mylil',
      properties: {
        cogs_pln: { type: 'number' }, retail_price_pln: { type: 'number' },
        shipping_cost_pln: { type: 'number' },
      },
    },
    sources: { type: 'array', items: { type: 'string' } },
  },
}

const SCORE_SCHEMA = {
  type: 'object',
  required: ['scores', 'total_score', 'verdict', 'verdict_reason', 'unit_economics'],
  properties: {
    scores: {
      type: 'object',
      description: 'Klucz = dimension key z frameworku, wartosc = {score, max, rationale}',
      additionalProperties: {
        type: 'object',
        required: ['score', 'max', 'rationale'],
        properties: { score: { type: 'number' }, max: { type: 'number' }, rationale: { type: 'string' } },
      },
    },
    total_score: { type: 'number' },
    verdict: { type: 'string', enum: ['recommended', 'conditional', 'rejected'] },
    verdict_reason: { type: 'string' },
    hard_fails: { type: 'array', items: { type: 'string' } },
    risk_notes: { type: 'string' },
    competition_notes: { type: 'string' },
    unit_economics: {
      type: 'object',
      required: ['cogs_pln', 'retail_price_pln', 'shipping_cost_pln', 'contribution_margin_pln', 'max_cpa_pln', 'breakeven_roas', 'margin_multiple'],
      properties: {
        cogs_pln: { type: 'number' }, retail_price_pln: { type: 'number' },
        shipping_cost_pln: { type: 'number' }, contribution_margin_pln: { type: 'number' },
        max_cpa_pln: { type: 'number' }, breakeven_roas: { type: 'number' },
        margin_multiple: { type: 'number' }, economics_notes: { type: 'string' },
      },
    },
    demand_signals: { type: 'object', additionalProperties: { type: 'string' } },
  },
}

// ---------------- PHASE 1: KANDYDACI ----------------
phase('Kandydaci')

const cats = (fw.category_shortlist || []).slice(0, MAX_CATS)
log(`Generuje kandydatow dla ${cats.length} kategorii (${PER_CAT}/kategorie)`)

const generated = await parallel(cats.map(c => () =>
  agent(`${BIZ_CONTEXT}

ZADANIE: Znajdz ${PER_CAT} NAJLEPSZYCH kandydatow produktowych w kategorii: "${c.category}".
Uzasadnienie kategorii z researchu: ${c.rationale}
Grupa docelowa kategorii: ${c.target_audience}
Przykladowe produkty (inspiracja, mozesz wyjsc poza nie): ${JSON.stringify(c.example_products)}

${ECON_CONTEXT}

METODA (dla KAZDEGO kandydata wykonaj wszystkie kroki):
1. WebSearch po polsku: czy ten produkt jest kupowany w PL, jakie problemy z nim ludzie maja, jak go szukaja
2. Sprawdz ceny na Allegro (WebFetch allegro.pl/listing?string=... lub WebSearch site:allegro.pl) — po ile chodzi, ile ofert, czy sa "super sprzedawcy"
3. Znajdz zrodlo na AliExpress (WebSearch site:aliexpress.com lub WebFetch) — cena + szacunkowa wysylka do PL = COGS w PLN (kurs ~4 zl/USD, konserwatywnie)
4. Zaproponuj cene detaliczna 100-250 zl ktora daje marze zgodna z modelem ekonomicznym (min. 3x COGS)
5. Zbierz dowody popytu (min. 2 na kandydata, z confidence)
6. Wymysl 2-3 katy reklamowe pod Meta Ads (polski rynek, direct response)

WYMAGANIA TWARDE: cena detaliczna realna 100-250 zl, marza min. 3x COGS, produkt rozwiazuje problem (nie gadzet),
da sie pokazac efekt na wideo/zdjeciu, nie wymaga rozmiarowki, nie jest kruchy, nie ma claims medycznych.
Kandydaci maja byc ROZNI od siebie (nie 3 warianty tego samego).`,
    { label: `gen:${c.category.slice(0, 30)}`, phase: 'Kandydaci', schema: CANDIDATE_SCHEMA })
    .then(r => r ? r.candidates.map(x => ({ ...x, category: c.category })) : [])
))

let candidates = generated.filter(Boolean).flat()
log(`Wygenerowano ${candidates.length} kandydatow`)

// Dedup: po nazwie (normalizacja) vs istniejace i miedzy soba
const seen = new Set(EXISTING)
candidates = candidates.filter(c => {
  const key = c.name.toLowerCase().replace(/[^a-z0-9ąćęłńóśźż ]/g, '').trim()
  for (const s of seen) {
    if (s.includes(key) || key.includes(s)) return false
  }
  seen.add(key)
  return true
})
log(`Po dedup: ${candidates.length} kandydatow idzie do weryfikacji`)

// ---------------- PHASE 2+3: WERYFIKACJA + SCORING (pipeline per kandydat) ----------------
const LENSES = [
  {
    key: 'marza',
    prompt: c => `${BIZ_CONTEXT}\n${ECON_CONTEXT}

Jestes SCEPTYKIEM MARZY. Twoim zadaniem jest OBALIC oplacalnosc tego kandydata. Szukaj aktywnie powodow do odrzucenia:
KANDYDAT: ${JSON.stringify(c)}

Sprawdz przez WebSearch/WebFetch:
1. Czy COGS jest realny? Znajdz faktyczne ceny na AliExpress (z wysylka do PL!). Jesli generator zanizyl — skoryguj w adjusted_numbers
2. Czy cena detaliczna jest realna? Sprawdz Allegro/Google Shopping: jesli identyczny produkt jest szeroko dostepny za 40-60% proponowanej ceny — to powazny problem (klient porowna w 10 sekund)
3. Policz marze kontrybucyjna: cena - COGS - wysylka krajowa (~18-22 zl z pobraniem) - prowizja platnosci/COD - rezerwa na odmowy COD i zwroty. Czy po odjeciu realnego CPA z Meta Ads (uzyj benchmarkow) zostaje zysk?
4. Waga/gabaryt: czy wysylka nie zjada marzy?
refuted=true jesli: marza kontrybucyjna nie pokrywa realnego CPA z sensownym buforem, LUB produkt szeroko dostepny znaczaco taniej, LUB COGS byl zanizony o >30%.
Jesli watpliwosc — refuted=true (wolimy odrzucic dobrego niz przepuscic zlego).`,
  },
  {
    key: 'popyt',
    prompt: c => `${BIZ_CONTEXT}

Jestes SCEPTYKIEM POPYTU. Twoim zadaniem jest OBALIC istnienie realnego popytu na tego kandydata w Polsce:
KANDYDAT: ${JSON.stringify(c)}

Sprawdz przez WebSearch/WebFetch:
1. Czy dowody popytu od generatora sa PRAWDZIWE? Zweryfikuj kazdy (URL dziala? liczby sie zgadzaja?)
2. Allegro: czy podobne produkty maja realne sprzedaze (liczba "osob kupilo", opinie)? Brak sprzedazy na Allegro przy 40+ ofertach = nisza martwa lub wojna cenowa
3. Czy problem ktory produkt "rozwiazuje" jest realnie odczuwany przez Polakow (fora, grupy FB, wyszukiwania)?
4. Czy grupa docelowa jest naprawde szeroka (setki tysiecy ludzi w PL), czy niszowa?
5. Sezonowosc: czy popyt utrzyma sie przez najblizsze 6 miesiecy?
refuted=true jesli: dowody popytu sa zmyslone/niewiarygodne, LUB brak sladow realnych zakupow w PL, LUB grupa docelowa jest waska, LUB szczyt popytu wlasnie minal.`,
  },
  {
    key: 'ryzyko',
    prompt: c => `${BIZ_CONTEXT}

Jestes SCEPTYKIEM RYZYKA (prawnego, platformowego, operacyjnego i nasycenia). OBAL tego kandydata:
KANDYDAT: ${JSON.stringify(c)}

Sprawdz:
1. Meta Ads policy: czy reklama tego produktu wymaga claims zdrowotnych/before-after/sensacji? (ban risk)
2. Certyfikacje/prawo: CE, RED (elektronika radiowa), EN71 (zabawki), baterie litowe, kontakt z zywnoscia, GPSR, "wyrob medyczny" — czy ten produkt wpada w ryzykowna kategorie?
3. Nasycenie: ile polskich sklepow JUZ reklamuje ten produkt w Meta Ad Library / sprzedaje na Allegro? Dziesiatki kopii = spalona nisza
4. Operacyjnie: kruchy? ciezki? rozmiarowka? wysoka awaryjnosc (zwroty)? skomplikowana obsluga (instrukcje, montaz)?
5. Anty-kryteria frameworku: ${JSON.stringify(ANTI)} — czy ktores naruszone? Jesli tak, wypisz w findings DOKLADNIE ktore.
refuted=true jesli: naruszone anty-kryterium, kategoria wysokiego ryzyka prawnego, oczywiste przesycenie rynku, lub powazny problem operacyjny.`,
  },
]

const scored = await pipeline(
  candidates,
  // Stage 1: 3 sceptykow rownolegle
  (c) => parallel(LENSES.map(l => () =>
    agent(l.prompt(c), { label: `weryfikacja:${l.key}:${c.name.slice(0, 24)}`, phase: 'Weryfikacja', schema: VERDICT_SCHEMA })
      .then(v => ({ lens: l.key, ...v }))
  )).then(verdicts => ({ candidate: c, verdicts: verdicts.filter(Boolean) })),

  // Stage 2: scoring per framework (takze dla odrzuconych — wartosciowy negatywny przyklad)
  (vc) => {
    const blockers = vc.verdicts.filter(v => v.refuted && (v.severity === 'blocker' || v.severity === 'major'))
    return agent(`${BIZ_CONTEXT}\n${ECON_CONTEXT}

Jestes GLOWNYM ANALITYKIEM. Oceniasz kandydata wedlug frameworku scoringu. Masz dane generatora ORAZ raporty 3 niezaleznych sceptykow (marza/popyt/ryzyko). Sceptycy mieli za zadanie obalac — ich korekty liczb traktuj jako WIARYGODNIEJSZE niz dane generatora.

KANDYDAT: ${JSON.stringify(vc.candidate)}

RAPORTY SCEPTYKOW: ${JSON.stringify(vc.verdicts)}

FRAMEWORK SCORINGU (oceniaj kazdy wymiar, score od 0 do max=weight):
${JSON.stringify(DIMS, null, 1)}

PROGI WERDYKTOW: ${fw.scoring_framework.verdict_thresholds}

ZASADY:
- Kazdy wymiar: score + rationale (2-3 zdania, konkretne, z liczbami z raportow)
- total_score = suma score'ow
- Jesli ktorykolwiek sceptyk refuted z severity=blocker → verdict=rejected bez wzgledu na score, wypisz hard_fails
- 2+ refuted (dowolna severity major+) → maksymalnie conditional
- unit_economics: policz KONSERWATYWNIE z liczb po korektach sceptykow. contribution_margin = cena - COGS - wysylka krajowa - prowizje platnosci - rezerwa COD/zwroty. max_cpa = contribution_margin * 0.8 (bufor 20%). breakeven_roas = cena / contribution_margin (uwzglednij to w economics_notes). margin_multiple = cena / COGS
- demand_signals: zbuduj mape {allegro, google_trends, meta_ads, tiktok, inne} z najtwardszych dowodow
- verdict_reason: 2-3 zdania PO POLSKU, rzeczowo`,
      { label: `scoring:${vc.candidate.name.slice(0, 24)}`, phase: 'Scoring', schema: SCORE_SCHEMA, model: 'opus' })
      .then(s => s ? ({ ...vc.candidate, ...s, _verdicts: vc.verdicts, _had_blockers: blockers.length }) : null)
  }
)

const final = scored.filter(Boolean)
const counts = { recommended: 0, conditional: 0, rejected: 0 }
final.forEach(f => { counts[f.verdict] = (counts[f.verdict] || 0) + 1 })
log(`Scoring zakonczony: ${counts.recommended} recommended / ${counts.conditional} conditional / ${counts.rejected} rejected`)

return { round: ROUND, counts, scored: final }

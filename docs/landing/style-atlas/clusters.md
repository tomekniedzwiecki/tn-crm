# Style Atlas — Clusters (reference dla user pick + visual diversity)

> **Wprowadzone 2026-04-27 (v4.3).** Reference dokumentacja dla świadomego wyboru stylu (Tomek wybiera styl ręcznie w panelu lub w briefie). Pomaga zauważyć że niektóre style (np. apothecary + clinical-kitchen) używają tego samego font stack i bazowych tokenów, więc wizualnie należą do jednego klastra.
>
> **Status:** reference, NIE enforcement gate. Algorithmic cluster anti-repetition został wycofany 2026-04-27 (over-engineering bez user value). Cluster mapping zostaje jako wsparcie dla user'a przy wyborze stylu.

## Zasada (do świadomego stosowania)

**Staraj się unikać 2 stylów z tego samego klastra w 3 ostatnich landingach** — dla wizualnej różnorodności portfolio. Ale to user decision, nie algorithmic block.

## Klastry (5 grup)

### EVIDENCE_CLUSTER — utility/evidence/clinical
Style które używają technical sans (IBM Plex Sans / Helvetica / Inter), neutralnej palety (paper #FAFAF7 / #F7F9FB), monospace dla danych, layout grid-driven.

```yaml
evidence:
  - apothecary-label   # IBM Plex Sans + spec-label primitive
  - clinical-kitchen   # IBM Plex Sans + KPI dashboard
  - swiss-grid         # Helvetica + 12-col modular grid
  - newsroom-print     # Arial/Times + newspaper layout (NEW v4.3)
  - field-manual       # blueprint navy+orange + monospace (NEW v4.3)
  - specification-sheet # engineering isometric (NEW v4.3)
  - receipt-print      # thermal printer monospace (NEW v4.3)
```

**Kiedy klaster wybierany:** mid-price utility produkty (parownice, roboty, masażery, akcesoria pet, beauty gadgets). DNA: `utility · precision · evidence`.

### LUXURY_CLUSTER — editorial/aspirational/quiet
Serif display fonts (Fraunces / Cormorant Garamond / Libre Caslon), warm cream paletes (#F6F3ED / #E8E0CF), oversized italic numerale, longform editorial feel.

```yaml
luxury:
  - editorial-print    # Fraunces + Nº numbering
  - dark-academia      # Libre Caslon + burgundy + parchment
```

**Kiedy klaster wybierany:** premium aspiracyjne produkty, lifestyle, hygge. DNA: `ritual · expression · feeling · quiet`.

### PLAYFUL_CLUSTER — rounded/warm/community
Rounded sans (Nunito / Fredoka / Caveat), warm palettes (cream + sage / rose), botanical ornaments, friendly humor.

```yaml
playful:
  - playful-toy           # Nunito + emoji-friendly
  - cottagecore-botanical # EB Garamond + butter cream + sage
  - organic-natural       # rounded + greens/beiges
```

**Kiedy klaster wybierany:** pet/kids/wellness/community DNA. `ritual · feeling · social/community`.

### RUGGED_CLUSTER — outdoor/raw/heritage
Bold workwear typography (Archivo / Work Sans / Times New Roman), outdoor palettes (canvas khaki / signal orange / burgundy), stamp badges, masculine.

```yaml
rugged:
  - rugged-heritage         # Archivo + IM Fell English stamps
  - outdoorsy-expedition    # Work Sans + Space Mono coords
  - brutalist-diy           # Times New Roman + raw rotated elements
```

**Kiedy klaster wybierany:** workwear/outdoor/tools/anti-establishment. DNA: `utility · tradition · public`.

### EDGY_CLUSTER — gaming/poster/loud
Bold display (Archivo Black / Space Grotesk / Syne), saturated palettes (neon + dark / signal orange), poster claims, energetic motion.

```yaml
edgy:
  - retro-futuristic   # Space Grotesk + neon on black
  - poster-utility     # Archivo Black + bold poster claims
  - panoramic-calm     # Plus Jakarta + Instrument Serif (transitional — moves between edgy and evidence)
```

**Uwaga:** `panoramic-calm` jest TRANSITIONAL — może być w EVIDENCE_CLUSTER (gdy używany dla tech precision Apple/Stripe style) lub EDGY_CLUSTER (gdy bold poster claims). Default mapping: EDGY (bo Plus Jakarta + Instrument Serif są bardziej expressive niż clinical).

```yaml
panoramic-mapping:
  default: edgy
  context_override: evidence  # tylko gdy DNA ma `precision · evidence` jako dominanty
```

### JAPANDI_CLUSTER — minimalist/zen
Quiet serif/sans hybrid (Noto Serif / Tenor Sans), pearl palettes (#F4F1EA), dużo pustego miejsca, ceremonia.

```yaml
japandi:
  - japandi-serenity   # Noto Serif + pearl + zen
```

**Status:** singleton w v4.3. Wymaga rozszerzenia (Soft Bauhaus, Biophilic — planned Faza 2).

---

## Mapping styli → klastry (referencja dla skryptów)

```yaml
style_to_cluster:
  apothecary-label: evidence
  clinical-kitchen: evidence
  swiss-grid: evidence
  newsroom-print: evidence
  field-manual: evidence
  specification-sheet: evidence
  receipt-print: evidence

  editorial-print: luxury
  dark-academia: luxury

  playful-toy: playful
  cottagecore-botanical: playful
  organic-natural: playful

  rugged-heritage: rugged
  outdoorsy-expedition: rugged
  brutalist-diy: rugged

  retro-futuristic: edgy
  poster-utility: edgy
  panoramic-calm: edgy  # default

  japandi-serenity: japandi
```

## Jak używać tej referencji

1. **Przy wyborze stylu w briefie** — sprawdź ostatnie 3 landingi (`bash scripts/landing-style-stats.sh`), zobacz ich klastry, świadomie wybierz inny klaster jeśli to ma sens dla biznesu klienta
2. **Przy generowaniu nowego landingu** — patrz histogram w stats, wybierz styl który wnosi visual diversity
3. **Przy planowaniu portfolio** — agreguj klastrami zamiast pojedynczymi stylami żeby zobaczyć rzeczywistą różnorodność

**Świadome powtórzenie klastra jest OK** gdy:
- Cała linia produktów klienta ma identyczne DNA (np. 5 parownic dla mam — wszystkie evidence cluster jest sensowne)
- Brand klienta wymaga konsystencji wizualnej między landingami
- Iteracja na poprzednim landing (modyfikacja, nie nowy)

---

## Cross-references

- [`README.md`](README.md) — Style Atlas master + DNA scoring
- [`../../scripts/landing-style-stats.sh`](../../scripts/landing-style-stats.sh) — egzekucja cluster gate
- [`../01-direction.md`](../01-direction.md) Krok 9a.2 — anti-repetition w procedurze

# TOKEN-KONTRAKT — przenośny słownik tokenów landingu (3 warstwy)

**Status: OBOWIĄZUJE (2026-07-21).** Kontrakt nazw tokenów CSS, który **każdy skeleton sekcji
i każda sekcja kodowana MUSI konsumować** — dzięki temu skeleton wydzielony z landingu A wskakuje
do landingu B i **reskinuje się samą podmianą `:root`**, bez dotykania mechaniki. To warstwa
`B — PARAMETRYCZNY` z `KAPITALIZACJA-OPS §0`.

> Kontrakt **nie jest nowym stylem** — to **spis nazw, którymi 3 wzorcowe landingi już mówią**
> (mata / masażer / Drapek, zweryfikowane 21.07 przez zrzut `:root`). Kodyfikacja czyni je
> przenośnymi; zero wpływu na wygląd któregokolwiek istniejącego landingu.

---

## 3 warstwy (dlaczego przenośność działa)

| warstwa | co | gdzie żyje | reuse |
|---|---|---|---|
| **1. PRIMITYWY** | realne wartości: `#hex`, `px`, nazwy fontów | `:root` **per produkt** (partytura) | ZAWSZE świeże |
| **2. SEMANTYKA** | **nazwy** poniżej — rola, nie wartość (`--cta`, `--paper`) | wspólny kontrakt | **1:1 wszędzie** |
| **3. KOMPONENT** | tokeny lokalne sekcji (`--wood`, `--star`, `--sb-bg`) | dana sekcja/landing | lokalne |

Skeleton odwołuje się **wyłącznie do warstwy 2** (+ własne komponentowe z prefiksem). Nigdy nie
zaszywa primitywów. Reskin = podmiana `:root`. cross_landing ΔE liczy dystans palet z warstwy 1.

---

## Słownik semantyczny (warstwa 2) — KONTRAKT

Skeleton/sekcja może założyć, że te tokeny **istnieją** w `:root` każdego landingu:

### Kolor i powierzchnia
| token | rola |
|---|---|
| `--ink` | główny tekst / ikony funkcjonalne (ZAWSZE `--ink`, nie akcent) |
| `--body` | tło strony (bazowe „paper") |
| `--paper` `--paper-2` `--paper-3` | rodzina tła sekcji (jasność malejąco/warianty) |
| `--card` | tło kart/paneli |
| `--line` | obrys 1px / separatory |
| `--cta` | **jedyny akcent** — scope {CTA · sygnatura · gwiazdki ★} |
| `--cta-ink` | tekst NA przycisku CTA (kontrast do `--cta`) |

### Typografia
| token | rola |
|---|---|
| `--font-display` | krój nagłówków (partytura) |
| `--font-text` | krój treści (kontrast do display) |
| `--font-accent` | krój sygnatury/eyebrow (opcjonalny) |
| `--h1-d` `--h1-m` `--h2-d` | rozmiary nagłówków desktop/mobile (skala z kontrastem) |
| `--body-fs` `--body-lh` | rozmiar / interlinia treści (16–18 / 1.5–1.6) |
| `--content-w` | maks. szerokość treści (~1160–1200) |

### Przestrzeń (rytm 8pt — KANON)
| token | rola |
|---|---|
| `--s1`…`--s7` | drabina odstępów `8·16·24·32·48·64·96` |
| `--sect-pad-d` `--sect-pad-m` | padding sekcji desktop (96–128) / mobile (64–80) |

### Kształt i cień
| token | rola |
|---|---|
| `--radius-sm` `--radius-lg` | jeden radius serii (mały/duży) |
| `--shadow-sm` `--shadow-md` `--shadow-lg` | cienie ciepłe/miękkie (tint sepiowy, nie czerń) |

### Ruch (opcjonalne; jeśli sekcja animowana — `CHOREOGRAFIA-ANIMACJI.md`)
| token | rola |
|---|---|
| `--mo-dur-s/m/l` | czasy trwania |
| `--mo-ease` | krzywa (miękka) |
| `--mo-dist` `--mo-stagger` | dystans/opóźnienie kaskady |

---

## Reguły

1. **Skeleton = tylko warstwa 2** (+ komponentowe z własnym prefiksem, np. `--pt-*` dla
   `porownanie-tabela`). ⛔ Zero zaszytych `#hex`/`px`/nazw fontów w skeletonie.
2. **Tokeny partytury** (`--wood`, `--green`, `--star`, materiałowe) = warstwa 3, **landing-local** —
   poza kontraktem, wolno dodawać per produkt.
3. **Kanon jest w wartościach, nie w nazwach:** rytm 8pt (`--s*`), kontrast typograficzny, ≤3
   kolory + 1 akcent — egzekwowane przez `TOKENS-MAKIETY §KANON` i bramki. Kontrakt tylko
   gwarantuje, że nazwy są wszędzie te same.
4. **Depozyt (flywheel):** po landingu zarchiwizuj wypełniony `:root` produktu tutaj w rejestrze
   (sekcja niżej) — paleta staje się policzalna dla `cross_landing`.

---

## Rejestr `:root` per landing (flywheel — dopisuj po F8)

> Wklej blok primitywów (warstwa 1) każdego ukończonego landingu — sam `:root`, bez reszty CSS.
> Zasila `cross_landing` realnymi paletami i pozwala audytować dryf/zbieżność.

_(zasiew: mata / masażer / Drapek — do uzupełnienia przy najbliższym depozycie; nowe landingi
dopisują automatycznie w kroku flywheel `KAPITALIZACJA-OPS §4.3`)_

### ugniatek (rafal-hoffa · 2026-07-22 · F8)

```css
:root{
  --font-display:"Space Grotesk",system-ui,sans-serif; --font-text:"Work Sans",system-ui,sans-serif;
  --paper:#EEF1F2; --paper-2:#E6EBEC; --paper-3:#DCE2E4; --card:#FBFCFC;
  --ink:#14211F; --body:#26312F; --line:#CBD5D8;
  --cta:#0B6B64; --cta-hover:#07554F; --cta-ink:#FFFFFF;
  --radius-lg:10px; --radius-sm:6px;
  --shadow-sm:0 1px 2px rgba(20,40,45,.05);
  --shadow-md:0 1px 2px rgba(20,40,45,.05),0 8px 24px rgba(20,40,45,.09);
  --shadow-lg:0 2px 4px rgba(20,40,45,.06),0 18px 40px rgba(20,40,45,.11);
  --s1:8px;--s2:16px;--s3:24px;--s4:32px;--s5:48px;--s6:64px;--s7:96px;
  --sect-pad-d:112px;--sect-pad-m:72px;--content-w:1180px;
  --h1-d:clamp(24px,2.4vw,30px);--h1-m:clamp(22px,6vw,26px);--h2-d:clamp(22px,2.2vw,28px);
  --body-fs:17px;--body-lh:1.55;
}
```

---

### Powiązane
`KAPITALIZACJA-OPS.md` · `TOKENS-MAKIETY.md` (KANON/PARTYTURA — źródło decyzji o wartościach) ·
`moduly/MODULY.md` (skeletony konsumują ten kontrakt) · `CHOREOGRAFIA-ANIMACJI.md` (tokeny ruchu).

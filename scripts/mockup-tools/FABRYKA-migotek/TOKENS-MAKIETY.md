# TOKENS-MAKIETY — MIGOTEK · F2.5 · 2026-07-24

SSOT tokenów makiety/kodu. KANON (warsztat) = nietykalny; PARTYTURA (tożsamość) = per landing.

## PARTYTURA (tożsamość Migotka)
### Kolory
| Token | Hex | Rola |
|---|---|---|
| `--bg` | `#14100C` | tło główne (ciepła ciemność) |
| `--bg-2` | `#1E1813` | sekcje scenowe / surface ciemny |
| `--ink-dark` | `#F4E9DA` | tekst na ciemnym (ciepła kość słoniowa) |
| `--paper` | `#F5EEE3` | tło sekcji dowodowych/kodowych (pergamin — czytelność) |
| `--ink` | `#241C14` | tekst na pergaminie |
| `--muted` | `#8A7A66` | tekst drugorzędny |
| `--accent` | `#E9A03A` | bursztyn płomienia (CTA, akcenty, liczby) |
| `--accent-hover` | `#D9862A` | hover CTA |
| `--glow` | `#FFC978` | poświata płomienia (radial, cienie świetlne) |
| `--hair` | `#3A2F24` | hairline na ciemnym |
| `--hair-lite` | `#E4D8C6` | hairline na pergaminie |
| `--ok` | `#5C8A5A` | pozytyw (bez ognia / w zestawie) |
| `--warn` | `#C9752E` | uczciwy minus (baterie) |

### Typografia
- **Display:** `Fraunces` (opsz, wght 400–900; serif ciepły) — h1/h2, wielkie liczby, cytaty.
- **Body/UI:** `Inter` (wght 400–700) — akapity, formularz, FAQ, przyciski.
- Skala (clamp): h1 `clamp(2.2rem,6vw,4.4rem)` · h2 `clamp(1.7rem,4vw,2.9rem)` · body `1.05rem` ·
  micro-label CAPS `.72rem` letter-spacing `.16em` bursztyn.

### Sygnatura
- Glif separatora sekcji: **✦** (bursztyn, mały).
- Hairline 1px `--hair`/`--hair-lite`; radial-glow za płomieniami; oversized Fraunces w „4,8" / „187".
- Asymetria, zero równych siatek 50/50; micro-label CAPS nad każdą sekcją.

## KANON (nietykalny — jak Zaklipek)
- Rytm 8pt (spacing 8/16/24/40/64/96); radii `--r:14px` karty, `--r-sm:10px` pola/pigułki.
- Sekcje dowodowe/kodowe na jasnym pergaminie (czytelność), sceny na ciemnym (dark-fallback pod lazy).
- Moduły kanoniczne: `sticky-buy@1`, `faq-accordion@1`, `checkout-inline@2` (`data-zc-product`+
  `data-zc-api`), lightbox galerii, wideo-rail (gdy sekcja wideo żyje).
- Hero = TYP A pełnokadrowa scena W TLE + scrim + mikro-oferta; projektowany pod hero-video.
- CTA mobile → scroll do `#zamow` (formularz), LL-052.
- Cień: `--shadow: 0 18px 50px -20px rgba(0,0,0,.55)`; glow CTA `0 0 0 1px var(--accent), 0 10px 30px -8px rgba(233,160,58,.5)`.

## Mapa tło→sekcja (anty-biały-błysk pod lazy)
Sceny (hero/problem/rozwiazanie/zastosowania/demo/unoszace/mid-cta/final): fallback-bg = `--bg-2`
(ciemny), NIGDY `--paper`. Sekcje kodowe (zaufanie/korzysci/porownanie/opinie/zdjecia/galeria/wideo/
zamow/faq): `--paper`.

# Brief — Prosto3D (drukarka 3D, sklep Wojciech Ostrowski)

> Strona produktowa sklepu klienta (workflow v2 „TN Sklepy", projekt
> `13683b07-5359-4448-a06f-ba33e20bb6e2`, produkt wf2 `7a5f23fa-2c4f-4ede-a323-d5435ec221a7`).
> Dostawca: https://www.aliexpress.com/item/1005009976735952.html (Creality Ender-3 V3 SE).
> **UWAGA:** dla sklepów klienta COD („płatność przy odbiorze") i „14 dni na zwrot" są
> DOZWOLONE — odwrotnie niż na landingach ofert TN (safety #6 nie obowiązuje w tym folderze).

## Style Lock

- Kierunek: **dark neon TikTok-tech** (gadżet z TikToka, energia, sprawczość)
- lock-bg: `#020817` / sekcje `#050B1A`
- lock-accent-1: cyan `#00D0FF` · lock-accent-2: pink `#FF007A` · lock-accent-3: yellow `#FFB800`
- lock-display-font: `"Anton", Impact, Haettenschweiler, …` (Anton z Google Fonts — Impact
  nie istnieje na Androidzie; Anton ma latin-ext, URL BEZ `subset=`)
- lock-body-font: system-ui stack
- Glass cards `rgba(255,255,255,.05-.075)` + 1px bordery `rgba(255,255,255,.13-.16)`
- Kolorowe shadows (pink/cyan), NIE czarne solid
- Noise overlay `body:before` (opacity .11)

## 11. Wow Moments (audyt z ETAP 4)

### Wow Moment 1
- **Strefa:** hero zone
- **Lokalizacja:** Hero (full-bleed)
- **Element:** hero full-bleed — zdjęcie `.hero-bg` jako tło CAŁEJ sekcji + `.hero-scrim`
  (dwuwarstwowe gradienty), copy z text-shadow bezpośrednio na scenie; do tego okrągły
  neonowy sticker „Pierwszy wydruk bez doktoratu" (gradient cyan→pink, rotate(7deg),
  biały ring, hard-offset shadow, floatBadge). Na ≤640px: `.hero-copy .micro` ma
  `padding-right:132px`, żeby tekst zawijał się PRZED stickerem (nie usuwać!)
- **Czemu unique:** cinematic full-bleed scena z ceną „na kostkach wydruku" + street-sticker
  zamiast typowego badge'a „Nowość"
- pattern-id: custom-neon-sticker
- selector: .sticker
- **Implementation status:** ✅ obecny w HTML

### Wow Moment 2
- **Strefa:** mid zone
- **Lokalizacja:** między Trust a Nº 01 — Problem
- **Element:** marquee (pasek przesuwających się haseł „druk 3D bez chaosu na start · pomysł
  z telefonu → realny przedmiot …", animacja translateX 28s, duplikacja treści ×2)
- **Czemu unique:** streetwear/TikTok-drop energia; żaden baseline landing TN nie używa marquee
- pattern-id: custom-neon-marquee
- selector: .marquee
- **Implementation status:** ✅ obecny w HTML

### Wow Moment 3
- **Strefa:** conversion zone
- **Lokalizacja:** Nº 09 — Bezpieczny zakup
- **Element:** okrągła pieczęć „Zero płacenia z góry" — gradient cyan→pink, rotate(-6deg),
  hard-offset shadow + neon glow, font Anton — risk-reversal jako wizualny manifest COD
- **Czemu unique:** COD jako pieczęć-manifest zamiast małego printu przy cenie
- pattern-id: custom-cod-seal
- selector: .seal
- **Implementation status:** ✅ obecny w HTML

## Liczby kanoniczne (anti-fabrication)

- Cena: **799 zł** (1 szt.) · bundle: 2 szt. = **1549 zł** (774,50/szt., −49 zł) ·
  3 szt. = **2299 zł** (766,33/szt., −98 zł)
- Rating: **4,9/5 · 153 oceny · 98% pozytywnych** (dane z aukcji dostawcy)
- Zwrot: **14 dni** · Płatność: **przy odbiorze (COD)**
- ZAKAZ: fabrykowanej przekreślonej ceny (Omnibus), liczników czasu, fake stock

## Obrazy

- Produkt: `attachments/bud-products/1005009976735952/g0-g5.webp` (Storage ✓)
- Opinie 1-3: `attachments/bud-reviews/1005009976735952/{0-0,4-0,8-0}.webp`
- Opinie 4-12: `attachments/bud-reviews/1005009976735952/ae-{4..12}.jpg`
  (zrehostowane z ae-pic 2026-07-04 — ae-pic wygasa, NIE wracać do ae-pic!)
- Hero/lifestyle AI: `attachments/ai-generated/temp/17831858*.png` przez render API
  (`resize=contain` obowiązkowy) — ⚠️ folder `temp/`: rozważyć przeniesienie do trwałej
  ścieżki przy produkcyjnym wdrożeniu sklepu
- Logo: `attachments/ai-generated/temp/1783185762313_0.png` (1024×1024) — j.w.

# 09 — SEO / OG · {{APP_NAME}} (nazwa robocza: „Majster Blisko") · DRAFT

> Landing publiczny (indeksowalny od dnia 1). Ekrany aplikacji (`/auth`, panel, admin) = `noindex`.
> **Nazwa finalna NIE wybrana** — wszędzie placeholder `{{APP_NAME}}`; miasto startu nieznane (B-01) — placeholder `{{MIASTO}}`, domena `{{DOMAIN}}`.
> Realna obietnica wartości: **zero „24h", zero deklaracji czasu reakcji, zero obietnic wolumenu**, których produkt nie trzyma (oferty zależą od płynności rynku). Backowalne obietnice: 0 zł dla zlecającego, kontakt chroniony do wyboru, gwarancja startowa fachowca (brak zleceń = zwrot).

---

## 1. Tagline (≤ 8 słów)

- **APP_TAGLINE (główna, strona klienta):** **„Drobna naprawa? Fachowiec z Twojej okolicy"** (6 słów).
  - *Dlaczego bezpieczna:* mówi CO (drobna naprawa) i GDZIE (okolica) — bez obietnicy czasu/wolumenu. Zgodna z USP z 01-MVP-SCOPE.
- **Wariant zapasowy / OG:** „Lokalni fachowcy do drobnych napraw" (5 słów).
- **Tagline strony fachowca (sekcja „Jestem fachowcem" / /cennik):** „Lokalne zlecenia w abonamencie, nie za kontakt" (6 słów).
  - *Dlaczego:* wprost oddaje przewagę cenową (PRICING-FINAL: „stały abonament zamiast płacenia za każdy kontakt").

> Tagline świadomie **bez nazwy** (jest nazwo-niezależny); nazwa wchodzi w `<title>` jako `{{APP_NAME}} — [tagline]`.

---

## 2. Meta description (≤ 155 zn.)

- **Główna (landing):**
  `{{APP_NAME}}: dodaj za darmo drobne zlecenie i porównaj oferty lokalnych fachowców z Twojej okolicy. Płacą tylko fachowcy, dla zlecających 0 zł.`
  - Długość: część opisowa ~132 zn. + `{{APP_NAME}}`. Przy nazwie ≤ ~20 zn. całość mieści się < 155. **Sprawdzić po wyborze nazwy.**
  - Zawiera: dla kogo (zlecający + fachowcy) · efekt (porównaj oferty) · model (0 zł dla zlecającego). **Bez „24h".**
- **Wariant B (nacisk na fachowca):**
  `{{APP_NAME}}: lokalne zlecenia z Twojego powiatu w stałym abonamencie zamiast płacenia za każdy kontakt. Pierwszy miesiąc z gwarancją zwrotu.`
  - „Gwarancja zwrotu" = backowalna (gwarancja startowa, PRICING-FINAL) — NIE obietnica wolumenu.

---

## 3. Open Graph / Twitter

- `og:title` = `{{APP_NAME}} — Drobna naprawa? Fachowiec z Twojej okolicy`
- `og:description` = jak meta description główna (§2).
- `og:url` = `https://{{DOMAIN}}/`
- `og:image` = `https://{{DOMAIN}}/img/og-cover.png` — **1200×630**, karta z tokenów PREVIEW-BRIEF: piaskowe tło `#F3EFE5`, kremowa karta `#FFFDF7`, plakietka `{{APP_NAME}}` + tagline pomarańczem `#F05A28`, etykieta zlecenia jak papierowy znacznik z warsztatu (Playwright screenshot).
- `og:type` = `website` · `og:locale` = `pl_PL` · `og:site_name` = `{{APP_NAME}}` · `og:image:width/height` = `1200`/`630`.
- **Twitter:** `twitter:card` = `summary_large_image` · `twitter:title`/`twitter:description`/`twitter:image` = jak OG.
- `theme-color` = `#F05A28` (akcent/CTA z PREVIEW-BRIEF).
- `link[rel=canonical]` = `https://{{DOMAIN}}/`.

---

## 4. Struktura `<title>` per podstrona

| Podstrona | `<title>` (propozycja) | Indeks |
|---|---|---|
| **Landing** (`/`) | `{{APP_NAME}} — Drobna naprawa? Fachowiec z Twojej okolicy` | index |
| **/cennik** | `Cennik dla fachowców — {{APP_NAME}} · abonament od 99 zł, 2 powiaty w cenie` | index |
| **/auth** | `Zaloguj się / Załóż konto — {{APP_NAME}}` | **noindex** (ekran aplikacji) |

- Landing: nazwa + korzyść (wzorzec Fachmat). Trzymać ≤ ~60 zn. po wyborze nazwy.
- /cennik: jedyna podstrona sprzedażowa fachowca — zawiera cenę-kotwicę (99 zł) i „2 powiaty w cenie" (D-01/D-13). Dla zlecających cena nie dotyczy (0 zł).
- /auth (oraz panel klienta/fachowca, panel operatora): `meta[name=robots]=noindex` — nie indeksujemy ekranów aplikacji (doktryna fabryki).

---

## 5. Słowa kluczowe niszy (PL) — `{{MIASTO}}` do podstawienia po B-01

**Lokalne (główne, intencja transakcyjna — landing + ewentualne LP per kategoria):**
- `fachowiec {{MIASTO}}`
- `złota rączka {{MIASTO}}`
- `drobne naprawy {{MIASTO}}`
- `hydraulik {{MIASTO}}` · `elektryk {{MIASTO}}` · `malarz {{MIASTO}}` · `monter {{MIASTO}}`
- `pomoc domowa {{MIASTO}}` · `usługi remontowe {{MIASTO}}` · `naprawy domowe {{MIASTO}}`
- long-tail: `szybka naprawa {{MIASTO}}`, `fachowiec od drobnych prac {{MIASTO}}`, `hydraulik na już {{MIASTO}}` (fraza użytkownika — NIE obiecujemy tego w copy)

**Niszowe / strona fachowca (bez `{{MIASTO}}`):**
- `zlecenia dla fachowców` · `zlecenia dla hydraulika` · `zlecenia dla elektryka`
- `aplikacja dla fachowców` · `abonament dla fachowca` · `lokalne zlecenia dla fachowców`
- `alternatywa dla Fixly` / `alternatywa dla Oferteo` (płacenie za abonament zamiast za kontakt)

> Uwaga: frazy typu „na już" / „na dziś" indeksujemy jako zapytania użytkownika, ale **nie deklarujemy** czasu reakcji w treści — obietnica byłaby niepokryta (oferta zależy od podaży w powiecie).

---

## 6. Realna obietnica wartości (kanon copy — czego NIE obiecujemy)

**Obiecujemy (backowalne):**
- Dla zlecającego: **publikacja za 0 zł**, natychmiastowe potwierdzenie zasięgu („Twoje zlecenie widzi N fachowców w powiecie X"), porównanie ofert, kontakt ujawniony dopiero po wyborze, dwustronna reputacja.
- Dla fachowca: **stały abonament zamiast płacenia za każdy kontakt** (parytet już przy ~3 kontaktach/mc), **darmowy skrócony podgląd** realnych zleceń przed zakupem, **gwarancja startowa** (1. opłacony miesiąc bez ani jednego zlecenia w obszarze = zwrot 99/149 zł).

**Czego NIE obiecujemy (zakaz w copy/SEO):**
- ❌ „w 24h", „naprawa dziś", gwarantowany czas reakcji lub przyjazdu — oferta zależy od płynności rynku.
- ❌ gwarantowana liczba ofert / „fachowiec w 15 minut" / „zawsze dostępny".
- ❌ jakość/atest wykonawcy weryfikowany przez platformę (v1 = samodeklaracja SEP, D-04) — nie sugerować weryfikacji dokumentów.
- ❌ obsługa dużych remontów, awaryjnego otwierania zamków, prac gazowych (poza v1 — D-05/D-06).

---

## 7. Checklist produkcyjny (odhaczyć w kroku Landing — NIE tutaj)

- [ ] `<title>`, `meta[name=description]`, `link[rel=canonical]` z podstawionym `{{APP_NAME}}`/`{{DOMAIN}}`.
- [ ] Open Graph komplet (§3) + Twitter; `og:locale=pl_PL`.
- [ ] `public/img/og-cover.png` (1200×630) — karta z tokenów PREVIEW-BRIEF.
- [ ] `public/robots.txt` — `Allow: /$`, `Disallow: /auth|/app|/admin`, `Sitemap: https://{{DOMAIN}}/sitemap.xml`.
- [ ] `public/sitemap.xml` — `/` (+ `/cennik`, gdy powstanie) z `lastmod`.
- [ ] Favicon + `apple-touch-icon`; `theme-color=#F05A28`.
- [ ] Ekrany aplikacji (`/auth`, panel, admin) mają `meta[name=robots]=noindex`.
- [ ] Po wyborze nazwy: **przeliczyć długości** title (≤ ~60 zn.) i description (≤ 155 zn.).
- [ ] Po B-01 (miasto startu): podstawić `{{MIASTO}}` w słowach kluczowych i copy; rozważyć JSON-LD `LocalBusiness`/`Service` z obszarem działania.

---

## 8. Źródła

zrodla/PREVIEW-BRIEF.json (tokeny, tagline „Majster jest blisko") · 01-MVP-SCOPE.md (USP, aktywacja) · PRICING-FINAL.md (kotwica, gwarancja startowa, copy sprzedażowe) · DECYZJE.md (D-01/D-05/D-06 zakres, B-01 miasto) · wzorzec formatu: `C:\repos_tn\fachmat\brief\09-SEO.md`.

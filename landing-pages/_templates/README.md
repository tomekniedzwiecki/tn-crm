# Landing Page Templates

> **Procedura tworzenia landingów (główna):** [`docs/landing/README.md`](../../docs/landing/README.md)
> **Mapping kierunek → baseline:** [`docs/landing/01-direction.md` Krok 5](../../docs/landing/01-direction.md)
> **Safety rules:** [`docs/landing/reference/safety.md`](../../docs/landing/reference/safety.md)

## Pliki w tym folderze

| Plik | Cel |
|------|-----|
| [`_brief.template.md`](_brief.template.md) | Szablon manifesta — kopiuj do `landing-pages/[slug]/_brief.md` w ETAP 1 |

## Co ZACHOWAĆ bez zmian (safety)

Wszystkie obowiązkowe fragmenty są opisane w [`docs/landing/reference/safety.md`](../../docs/landing/reference/safety.md):
- html.js gate + fade-in safety timeout (reguła #2)
- Header `#FFFFFF` solid (reguła #9)
- Polskie diakrytyki UPPERCASE line-height (reguła #7)
- Fonty `&subset=latin-ext` (reguła #10)
- OG image pełny URL Supabase (reguła #10)
- Placeholdery 4-polowe z briefem fotografa (reguła #4)
- Brak zakazanych fraz: 24h, magazyn PL, COD, raty, PayPo, Klarna, Twisto (reguła #6)

## Co ZMIENIAĆ per brand

- Nazwa marki wszędzie (w tym `localStorage` key, `alt`, meta title/description)
- Logo URL (z `workflow_branding` type=logo, `is_main: true`)
- Paleta kolorów (zgodnie z `workflow_branding` type=color + manifesto)
- Fonty (zgodnie z `workflow_branding` type=font + manifesto)
- Copy wszystkich sekcji (headline, lede, FAQ, cytaty person)
- Obrazy (`CLAUDE_AI_IMAGES_PROCEDURE.md`)
- OG image + meta title/description per brand
- Signature elements per manifesto

## Sprawdzenie po stworzeniu

```bash
bash scripts/verify-brief.sh [slug]    # przed ETAP 2
bash scripts/verify-landing.sh [slug]  # po ETAP 4 (target ≥15/18)
```

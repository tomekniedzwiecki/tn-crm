# Audyt RODO żywych landingów — 2026-06-10 (v5.0, FAZA 4)

> Zakres: landingi klienckie z aktywnym trackingiem (GTM/pixel). Kanon docelowy:
> `reference/patterns.md` #25 (banner z RÓWNORZĘDNYM „Odrzuć" + tracking odpalany
> DOPIERO po zgodzie). **Repo ≠ live:** strony żyją w CMS TakeDrop klientów —
> każda naprawa wymaga ręcznego przegrania HTML przez Tomka (handoff per landing,
> memory: feedback-takedrop-handoff).

## Wyniki per landing

| Landing | Tracking | Banner | „Odrzuć" | Auto-zgoda w tekście | Tracking consent-gated? | Ryzyko |
|---|---|---|---|---|---|---|
| **kafina** | TAK (3 ref) | TAK | TAK | ~~TAK~~ → **NAPRAWIONE w repo 2026-06-10** („za Twoją zgodą") | ❌ NIE (GTM ładuje się bezwarunkowo) | średnie → wymaga re-paste do TakeDrop |
| **h2vital** | TAK (5 ref) | TAK | ❌ BRAK | nie | ❌ NIE | **wysokie** (brak możliwości odmowy) |
| **parova** | TAK (5 ref) | TAK | ❌ BRAK | nie | ❌ NIE | **wysokie** |
| **silktip** | TAK (5 ref) | TAK | ❌ BRAK | nie | ❌ NIE | **wysokie** |
| **innerscan-v2** | TAK (5 ref) | ❌ BRAK BANNERU | — | — | ❌ NIE | **wysokie** (tracking bez jakiejkolwiek zgody) |

## Co zostało zrobione (v5.0)

1. **kafina:** usunięty tekst auto-zgody „Kontynuując, wyrażasz zgodę" → „za Twoją zgodą"
   (repo; wymaga przegrania do TakeDrop).
2. **Kanon na przyszłość:** patterns.md #25 — banner z równorzędnym Odrzuć + consent-gating
   (`initTracking()` TYLKO po `cookie_consent=granted`). Nowe landingi demo: BEZ banneru
   w ogóle (zero trackingu w demo — kanoniczna tabela 14 sekcji).

## Co wymaga DECYZJI TOMKA (nie zrobione celowo)

**Pełny retrofit consent-gatingu na 5 żywych sklepach** = dodanie „Odrzuć" + warunkowe
ładowanie GTM/pixela. Konsekwencja biznesowa: część użytkowników odmówi → pixel przestanie
zliczać ich konwersje → spadnie mierzalność kampanii Meta (atrybucja). To zmiana w danych
kampanii, nie tylko w kodzie — wymaga świadomej zgody przed wdrożeniem.

**Rekomendowany plan (po akceptacji):**
1. Retrofit per landing wg patterns.md #25 (1 sesja na wszystkie 5),
2. handoff: mail do każdego klienta z `account_email` z workflow_takedrop + plik otwarty
   w IDE do Ctrl+A (procedura feedback-takedrop-handoff),
3. weryfikacja live po przegraniu.

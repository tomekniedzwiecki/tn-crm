# Biblioteka Design Systemów — landingi sklepów (workflow v2)

**Pomysł Tomka 15.07:** zamiast wymyślać styl przy każdym landingu (nierówna jakość, dryf,
wolno) — pula 20-30 dopracowanych RAZ design systemów najwyższej jakości; budowa landingu =
wybór DS z puli + treść wg STANDARD-LANDING-SKLEPY.md. Autor systemów: Fable 5 (koncept),
każdy DS przechodzi pętlę krytyka wizualnego przed wejściem do puli.

## Format jednego DS: `DS-XX-nazwa/`
- **`tokens.css`** — CSS custom properties, TWARDY autorytet: pełna paleta ról (bg/section/
  card/ink/muted/accent/cta/success/line…), typografia (1 font custom + system stack, skala),
  radius, cienie, spacing, motion. Landing wkleja ten blok 1:1.
- **`MOOD.md`** — charakter (3-5 zdań), dla jakich kategorii produktów i person, ANTY-wzorce
  (czego ten DS nie robi), wskazówki hero/foto (jaki typ kadru gra z tym stylem).
- **`components.html`** — ŻYWY styleguide: wszystkie klocki standardu w tym stylu (topbar,
  hero z pay-row, COD 1-2-3, karty, tabela porównawcza, galeria, opinie, offer box, FAQ,
  final CTA, sticky). Jednocześnie demo do oceny i źródło kopiuj-wklej dla buildera.
  Pierwsza linia: `<!-- @dsCard group="DS-XX nazwa" -->` (karty w Claude Design).

## Zasady
1. **DS = styl, standard = struktura.** Kolejność sekcji, eventy pixela, zakazy treściowe
   zawsze z STANDARD-LANDING-SKLEPY.md — DS tego nie nadpisuje.
2. **Dobór DS per produkt** przy kroku Branding: kategoria+persona → shortlist 2-3 DS →
   wybór (zapis w kroku: `design_system: DS-XX`). Sklep parasolowy trzyma spójną RODZINĘ
   (np. Znajdzik = ciepłe kremy: DS-01/04/07), żeby strona główna nie była patchworkiem.
3. **Nowy DS wchodzi do puli TYLKO po czystej rundzie krytyka wizualnego** (screenshoty
   styleguide'u mobile+desktop).
4. Rozszerzanie partiami po 5-6, gdy realne produkty pokażą braki pokrycia — nie 30 w ciemno.
5. Biblioteka jest synchronizowana do **Claude Design** (DesignSync, projekt „TN Sklepy —
   Design Systems") — przegląd wizualny kart przez Tomka.

## Pula (stan)
- **DS-01-cieply-krem** — ciepły krem/terakota/szałwia (ekstrakt z landingu koca Znajdzik;
  pierwszy zatwierdzony wzorzec). Kategorie: dom/sen/dziecko/uroda-soft.
- (kolejne: partia 2026-07-…)

# SEMANTYKA — Brzuszek (audyt PASS 5 · F7.3 / finisz F8)

Render: `sklepy/patryk-skrzypniak/brzuszek/index.html` (LIVE https://ulepszek.pl/brzuszek).
Audyt semantyczny + dostępnościowy landingu na moment domknięcia (F8, 2026-07-23).

## Nagłówki i landmarki

- **`<html lang="pl">`** ✔ — język dokumentu ustawiony (SR/HTML-lint).
- **Dokładnie 1× `<h1>`** ✔ (`#hr-title`, hero: "Twój brzuch. Twoja seria. Twój salon." wg copy hero) —
  reszta nagłówków to `<h2>`/`<h3>` w hierarchii; hooki rotowane leżą w `<p>` (nie w drugim h1).
- **Landmarki:** `<header class="topbar">` (nawigacja górna) + `<footer>` (stopka modułowa footer@1) +
  **12× `<section id>`** (każda sekcja treści ma własny id i wewnętrzny `<header>` bloku).
  `2× <nav>` (topbar + hero-nav kotwic). Uwaga: brak jawnego `<main>` — treść niesie 12 sekcji-landmarków
  między `header` a `footer`; a11y-czytelne (SR nawiguje po sekcjach/nagłówkach), `<main>` = ewentualny
  drobiazg do dołożenia (NIE blokuje; detail-lint P0/P1 nie zgłasza).

## Obrazy / alt

- **22/22 `<img>` mają atrybut `alt`** ✔ (100% pokrycia). Alt opisowe dla scen produktowych i UGC
  (np. hero: „Kobieta ćwiczy brzuch na biało-różowej składanej maszynie w jasnym salonie"),
  packshoty/detale i kafle wideo opisane rzeczowo; zero alt-śmieci ("image", nazwa pliku).
- Wideo hero: slot `.hr-video-inject` `aria-hidden="true"` (dekoracyjna pętla; treść niosą poster + copy).

## ARIA / role

- **37× `aria-label`** + **35× `role`** — m.in. `role="tablist"`/`aria-selected` na regulacji (toggle
  „Łagodniej ↔ Trudniej") i steperze „jak-cwiczysz", `aria-labelledby` wiążące karty z nagłówkami,
  `aria-hidden` na ikonach SVG i dekoracjach (`.reps`, swash), `aria-label` opisujące grupy pigułek/trust.
- Akordeon FAQ = natywny `<details>/<summary>` (semantyka rozwijania z pudełka, bez ARIA-hacków).

## Kontrast / interakcje (parytet z detail-lint F7.3)

- Copy na tłach lila-mgła/biel: ink `#221E26` na `#F7F5FB` — kontrast wysoki.
- 2 „findingi kontrastu" detail-lint = **fałszywe pozytywy pomiarowe** (patrz RETRO F8 §mis-scope):
  (a) toggle „Łagodniej" — biel-na-bieli nieprogowalna (etykieta mierzona względem toru, nie kciuka
  akcentowego pod nią); (b) `.zc-fallback` „Przejdź do bezpiecznej kasy" — link `hidden` WEWNĄTRZ
  modułu `.zc-checkout` (NIETYKALNY; pokazywany tylko przy awarii configu). Realnego biel-na-bieli / ink-na-ink
  na widocznej treści BRAK.

## Reduced-motion / klawiatura

- `prefers-reduced-motion` → pełna treść bez ruchu (county/`.reps`/reveale finalne od razu).
- Fokus-ring 3px/offset 3px na CTA i polach; toggle/stepper sterowalne klawiaturą (`aria-selected`).

## Werdykt

Semantyka **PASS**: 1×h1, `lang=pl`, landmarki header/section×12/footer, 100% alt, bogate ARIA/role,
natywny FAQ, reduced-motion pełne. Drobiazg do rozważenia: jawny `<main>` (nieblokujący).

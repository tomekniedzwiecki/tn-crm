# PLAN — ROZGRZEWEK (podgrzewany masażer do ciała)

> Dokument utworzony 23.07 przy naprawie po feedbacku Tomka (hero-video + sekcja wideo).
> MANIFEST odzwierciedla stan AS-BUILT żywego landingu
> `sklepy/patryk-skrzypniak/rozgrzewek/index.html` (LIVE https://ulepszek.pl/rozgrzewek).

## MANIFEST SEKCJI (`N. id | scenowa/kodowa | build/SKIP/blokada-tomek — powód`)

1. `hero | scenowa | build — archetyp D (packshot na polu koloru); ambient HERO-VIDEO (pętla hero-loop-pp: para z kubka + lampa żyją, produkt statyczny) na KAŻDYM viewporcie`
2. `moment | scenowa | build — ciepły wieczorny moment, kontekst użycia bez claimów`
3. `tryby | kodowa (TOR-I) | build — interaktywny wybór 3 trybów, count-up 1→9`
4. `glowica | scenowa | build — makro głowicy + sygnatura „kręgi ciepła"`
5. `obszary | scenowa | build — kark/ramiona/plecy/uda`
6. `autonomia | scenowa | build — bezprzewodowość, ładowanie`
7. `zdjecia-kupujacych | scenowa | build — 3 domowe kadry granatowego wariantu, bez ocen`
8. `wideo | scenowa | build — PRZYWRÓCONE z SKIP (Naprawa 23.07). Rail 1-kafelkowy: nagranie kupującego, self-host tt/rozgrzewek-tt1.mp4 (864×1080, 4:5, 8 s, 1,32 MB) + poster WebP 37 KB. Materiał UCZCIWIE przycięty trim+crop — patrz LEDGER §BLOKADA-TOMEK/protokół wideo`
9. `mid-cta | kodowa | build — przechwycenie decyzji po dowodach`
10. `faq | kodowa | build — redukcja wątpliwości, bez ocen`
11. `zamow | kodowa | build — checkout-inline@2 (COD + BLIK/online); mechanika NIETYKALNA`
12. `final | scenowa | build — domknięcie: produkt, cena 84,90 zł, COD, 14 dni na zwrot`

## HERO-VIDEO (F5.2 — Naprawa 23.07)
Statyczne medium hero zamienione na slot wideo z posterem = dotychczasowy obraz sceny
(zero CLS: box definiuje `.hr-image`; wideo fade-in po `playing`). Pętla
`bud-assets/rozgrzewek/video/hero-loop-pp.mp4` (547 KB, 10 s ping-pong; PASS gate klatkowy)
+ poster `hero-loop-poster.webp`. Montaż JS wzorcem maty: `<video muted loop playsinline
preload=metadata>`, klasa `.on` po `playing`, IO play/pause, `prefers-reduced-motion`/`save-data`
→ poster statyczny (bez wideo). Jeden klip → brak przełącznika d/m; gra na KAŻDYM viewporcie (LL-049).
Klamra w #zamow: NIE wdrożona (świadomie — #zamow to wrażliwy inline-checkout, opcja pominięta
dla czytelności formularza i zakazu ciemnych teł; checkout nietknięty).

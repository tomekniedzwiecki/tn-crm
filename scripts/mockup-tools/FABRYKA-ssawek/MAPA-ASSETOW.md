# MAPA ASSETÓW — SSAWEK (Popiołek) · F3 (gate przed F4/kodem) · 2026-07-23

> Taksonomia klas (OBRAZY-ROLE): **S** = scena AI wierna · **R** = real-gallery (kadr z
> `gallery_curated.keep`) · **P** = packshot realny · **U** = UGC (brak — oferta bez zdjęć kupujących).
> Wszystkie sceny S = scene-from-mockup (makieta jako ref kompozycji, prod-clean logo-free jako ref
> wierności). ⛔ ŻADEN asset on-page nie niesie czytelnego „LEHMANN" (retusz g07/g09/g11 wykonany F3).

## Sceny produktowe (klasa S) — `bud-assets/ssawek/assets/sc-*.webp`
| plik | sekcja | klasa | ujęcie | typ osadzenia | świat (F1.7: kontekst/skala/światło/człowiek/persp.) |
|---|---|---|---|---|---|
| sc-hero-d.webp | hero (desktop 3:2) | S | produkt na palenisku, wstęga popiołu do dyszy | **A** (fade→#F3EDE4 lewy-dół) | dom/kominek · średni-szeroki · ciepłe wieczorne · dłoń · lekko od dołu |
| sc-hero-m.webp | hero (mobile 2:3) | S | reframe pionowy tej sceny | A (fade dół) | jw. |
| sc-hero-t.webp | hero (tablet 1:1) | S | reframe kwadrat tej sceny | A (fade lewy-dół) | jw. |
| sc-problem.webp | problem | **S-kontekst (BEZ produktu)** | szufelka+wiadro, chmura popiołu | **B** (fullframe) | kominek · średni · dzienne chłodne · człowiek · eye-level |
| sc-rozwiazanie.webp | rozwiazanie | S | produkt wciąga strumień popiołu, dłoń na rurze | **B** (fullframe) | kominek/warsztat · średni · ciepłe · dłoń · eye-level |
| sc-demo-01.webp | demo (stan 01) | S | wpięcie rury/węża do króćca | **C** (fullframe kafel) | warsztat · makro-średni · ciepłe · dłoń · eye-level |
| sc-demo-02.webp | demo (stan 02) | S | dysza wciąga popiół/gruz z podłogi | C (fullframe) | kominek · średni · ciepłe · — · niski |
| sc-demo-03.webp | demo (stan 03) | S | wytrzepanie filtra koszowego nad wiadrem | C (fullframe) | warsztat · makro · ciepłe · dłonie · eye-level |
| sc-zast-kominek.webp | zastosowania (kafel „Kominek i koza") | S | produkt przy kominku/kozie z ogniem | C (fullframe) | dom/kominek · średni · ciepłe · — · eye-level |
| sc-zast-pellet.webp | zastosowania (kafel „Piec na pellet") | S | czyści szufladę popielnika pieca na pellet, worek pelletu | C (fullframe) | kotłownia · średni · praktyczne · — · eye-level · **[delta szerokość]** |
| sc-zast-gruz.webp | zastosowania (kafel) | S | produkt na gruzie/gipsie, wąż | C (fullframe) | remont · średni · chłodne dzienne · — · eye-level |
| sc-zast-warsztat.webp | zastosowania (kafel) | S | produkt przy aucie, wióry | C (fullframe) | garaż · średni · dzienne · — · eye-level |
| sc-zast-mokro.webp | zastosowania (kafel „Woda i zalania") | S | ssawka 2w1 wciąga wodę z posadzki (WET) | C (fullframe) | pralnia/zalanie · średni · chłodne dzienne · — · eye-level · **[delta szerokość — funkcja MOKRO]** |
| sc-zast-dzialka.webp | zastosowania (kafel) | S | dmuchawa zdmuchuje liście | C (fullframe) | plener · średni · naturalne · — · eye-level |
| sc-mid-cta.webp | mid-cta | S | produkt w ciepłym warsztacie, negative space | **A** (fade→#F3EDE4 lewa) | warsztat · średni · ciepłe · — · eye-level |
| sc-final.webp | final | S | salon z kominkiem, produkt gotowy, porządek | **A** (fade→#F3EDE4 dół) | salon/kominek · szeroki · ciepłe wieczorne · — · eye-level |

## Real-gallery (klasa R) — `bud-assets/ssawek/galeria/g*.webp` (11 keep; kolejność w gallery_curated)
| plik | slot | klasa | uwaga |
|---|---|---|---|
| g05 | galeria (lifestyle) | R | przenoszenie za pałąk; advisory retusz = ROZSTRZYGNIĘTE (nieczytelne, bez retuszu) |
| g11 | galeria (lifestyle) | R | **RETUSZ wykonany** — LEHMANN TOOLS usunięty |
| g07 | galeria (lifestyle) | R | **RETUSZ wykonany** — LEHMANN TOOLS usunięty |
| g09 | galeria (detal pokrywa/włącznik) | R | **RETUSZ wykonany** — tabliczka spixelowana (CE zostaje) |
| g03,g06,g02,g04,g08,g10 | galeria (detale) | R | bez retuszu (brak marki na kadrze) |

## Packshot (klasa P) — `bud-assets/ssawek/galeria/g14.webp`
| plik | slot | klasa | uwaga |
|---|---|---|---|
| g14 | zestaw · zamow (karta oferty) · faq (slot) · sticky-buy | P | packshot akcesoriów na jasnym tle (allowlista karty oferty = TYLKO P/R) |

## Kontrola OBRAZY-ROLE
- karta oferty „Zamów" (zamow/hero-card/sticky) = **P** (g14) — ⛔ nigdy S/U. ✓
- galeria = **R** (curated keep) — ⛔ nigdy S. ✓
- opinie = **U** — brak UGC → karty tekstowe bez zdjęć (dozwolone). ✓
- hero/rozwiazanie/demo/zastosowania/mid-cta/final = **S**. ✓
- **distinct product views** (S+R): hero, rozwiazanie, demo×3, zast×6 (kominek/pellet/gruz/warsztat/mokro/działka), mid-cta, final + kadry R = **≫5**. ✓
- **3 FUNKCJE pokryte scenami** (MAPA-ZASTOSOWAN F0.6b): sucho (kominek/pellet/gruz/warsztat) · **mokro (sc-zast-mokro WET)** · nadmuch (sc-zast-dzialka). ✓
- ten sam kadr >1× poza oferta↔sticky: BRAK (każda sekcja własne ujęcie). ✓
- 100% sekcji scenowych ma asset; 0 sekcji scenicznych bez assetu. ✓

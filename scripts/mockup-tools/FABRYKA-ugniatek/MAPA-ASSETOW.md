# MAPA ASSETÓW — UGNIATEK F3 (rozpoznanie warstw wg GRAFIKA-Z-MAKIETY §1-2)

Konwencja: R=realny kadr kuracji · P=packshot generowany · U=scena użycia generowana ·
S=scenografia/detal. Realne refy: spod-packshot.webp (spód 6 głowic), skos-panel.webp (3/4 z
panelem), lifestyle-blat.webp (docisk oburącz), scena-pas.webp (oparcie lędźwi) — attachments/ugniatek/.
NEG obowiązkowy w każdej generacji (PRZEWODNIK v3): matte mid-gray, smooth handles, 6 kul 2×3.

| sekcja | element | warstwa | typ osadzenia | decyzja | klasa | plik docelowy |
|---|---|---|---|---|---|---|
| hero | scena L (docisk kark, sofa) | grafika | B (karta=KOD nachodzi) | REGEN HIGH 2:3 (połówka makiety 750px < DPR2; content ostry) | U | assets/hero-L.webp |
| hero | scena P (oparcie lędźwi, sofa) | grafika | B | REGEN HIGH 2:3 (jw.; ta sama pora/światło co L!) | U | assets/hero-P.webp |
| hero | karta oferty/topbar/callout | KOD | — | tokeny+SVG | — | — |
| dwie-formy | foto stan A (dłonie na uchwytach) | grafika | C (kafel) | CROP z REALNEGO lifestyle-blat (autentyczność > makieta) | R | assets/df-A.webp |
| dwie-formy | foto stan B (między plecami a sofą) | grafika | C | CROP z REALNEGO scena-pas | R | assets/df-B.webp |
| dwie-formy | sylwetki stref, tabsy | KOD | — | SVG outline 1.5px ink | — | — |
| anatomia | ortho-spód 6 głowic | grafika | C (karta) | REALNY spod-packshot (crop/clean; najwierniejszy możliwy) | R | assets/an-spod.webp |
| anatomia | 3/4 slim profil | grafika | C | CROP z realnego skos-panel; FALLBACK regen | R | assets/an-34.webp |
| anatomia | makro diody (glow) | grafika | C (pas) | REGEN HIGH 3:2 (ref=spod-packshot; uczciwy glow, no lens flare) | S | assets/an-makro.webp |
| anatomia | calloutsy | KOD | — | SVG hairlines + kropki | — | — |
| sterowanie | foto blat + palec na „+" | grafika | B | REGEN HIGH 3:2 (product-ref=skos-panel; complete hand anatomy) | U | assets/st-panel.webp |
| sterowanie | tabela parametrów + pille | KOD | — | dane z KARTY (bez duplikatów w etykietach — nota krytyka) | — | — |
| wieczorem | scena 1 (kącik przy biurku, lędźwie) | grafika | B | REGEN HIGH 3:2 (seed g8 przewodnika; poza naturalna — nota krytyka) | U | assets/wi-biurko.webp |
| wieczorem | scena 2 (mata po treningu, łydka) | grafika | C | REGEN HIGH 3:2 (seed g9) | U | assets/wi-trening.webp |
| mid-cta | packshot 3/4 na mgle | grafika | B | REGEN HIGH 3:2 — PACKSHOT KANONICZNY serii (reuse: final/sticky/checkout/OG) | P | assets/packshot-34.webp |
| zestaw | flat lay kompletu | grafika | C | REGEN HIGH 3:2 (⛔ pudełko PLAIN bez nadruku — nota krytyka) | S | assets/ze-flatlay.webp |
| zestaw | profil boczny 11 cm | grafika | C (pas) | REGEN 3:2 (pokazuje grubość; wymiar dorysowuje KOD) | P | assets/ze-profil.webp |
| zamow | miniatura produktu | grafika | C | CROP z packshot-34 (reuse) | P | (crop) |
| faq | — | KOD | — | moduł faq-accordion@1 | — | — |
| final | produkt centralny | grafika | C | CROP z packshot-34 (reuse) | P | (crop) |
| final | 2 mini-kadry form | grafika | C | CROPY z df-A + wi-biurko (świeższe widoki — nota krytyka, nie klony hero) | R/U | (cropy) |

Generacje HIGH: 9 (hero-L, hero-P, an-makro, st-panel, wi-biurko, wi-trening, packshot-34,
ze-flatlay, ze-profil). Cropy realne: 4. Distinct views produktu: spód(R) · 3/4-skos(R) ·
packshot-3/4(P) · profil(P) · makro-panel/diody(S) · flat-lay(S) · sceny użycia ×4(U) = 10 ≥ 5 ✓.
Sceny z człowiekiem: hero×2 + sterowanie(dłoń) + wieczorem×2 + df realne ×2 = ~47% ✓.
Pary mobile scen: hero-L/P generowane 2:3 (pion natywny) ✓; reszta crop 2:3 przez <picture>.

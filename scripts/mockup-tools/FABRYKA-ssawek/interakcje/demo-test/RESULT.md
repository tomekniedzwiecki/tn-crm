# demo-test — TOR-I test stanow (SSAWEK / demo stepper) · T3

Kryterium akceptacji (SPEC-I): **SSIM(01,02) < 0.9 I SSIM(02,03) < 0.9** = realna zmiana stanu
(kazdy krok = OSOBNE ujecie, nie ten sam kadr z filtrem CSS).

| para stanow | SSIM | prog | wynik |
|---|---:|---|---|
| 01 <-> 02 | 0.179 | < 0.90 | PASS |
| 02 <-> 03 | 0.175 | < 0.90 | PASS |
| 01 <-> 03 | 0.204 | < 0.90 | PASS |

**WERDYKT T3: PASS** — kazda para stanow SSIM < 0.9 => stepper zmienia realny kadr (nie martwa
interakcja). Stany: state-01/02/03.png. Tryb interaktywny (stepper + auto-advance 3.5s + <-/-> +
aria-selected) oraz fallback no-JS / reduced-motion (3 kadry sekwencyjnie) — zgodne z SPEC-I.
0 bledow konsoli, INP w normie (delegacja klik + IO). Sandbox: demo-sandbox.html.

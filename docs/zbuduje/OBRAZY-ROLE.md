# OBRAZY-ROLE — art-direction obrazów na landingu (twarde reguły fabryki)

**Status: OBOWIĄZUJE (2026-07-16, research Sonnet: Baymard/Shopify/NN-g + incydent
„UGC w karcie oferty" Uśmieszka).** Zasada: nie ma „dobrej fotki" — jest fotka dobra
DO ROLI. Im bliżej decyzji zakupowej (oferta/warianty) → czystszy packshot; im bardziej
o dowodzie społecznym (opinie) → surowsze UGC. Mylenie tych ról = błąd klasy P0.

## TABELA RÓL (klasy: **P**=packshot realny · **U**=UGC z opinii · **S**=scena AI wierna ·
## **R**=real-gallery — kurowany kadr z galerii detail, `bud_tt_products.gallery_curated`)
| Sekcja | Dozwolone | ZAKAZANE | Wymagania |
|---|---|---|---|
| Hero | S (główna), P-cutout na czystym polu | U jako tło | negative space na copy zaplanowany w promptcie; kontrast pod tekstem ≥4.5:1 |
| **Karta oferty „Zamów…"** | **TYLKO P lub R-packshot** | **U bezwzględnie**; S pod packshotem | jasne jednolite tło; PEŁNY produkt (bbox nie dotyka krawędzi); 80-85% kadru, margines ≥5%; jasność/kontrast w normie |
| Warianty/swatche | P (seria-klon setupu) | U, S | identyczny kąt/światło/tło/skala między wariantami |
| **Galeria „zobacz produkt"** | **R (główne slajdy; z `gallery_curated.keep`)** + detal-cropy R; U wpleciony | **S i P bez źródła w detail; U jako główny slajd** | 4-6 kafli; kolejność packshot→detal→lifestyle→skala; wspólny grading; alt PL z `alt_pl`; AI-scena NIGDY jako dowód produktu |
| Demo „jak działa" | S lub P w akcji | U losowe | produkt wierny, sekwencja spójna |
| Social proof/opinie | **TYLKO U** | P/S udające UGC | surowe = sygnał prawdziwości; NIE retuszować; zawsze RAMKOWANE (nigdy full-bleed tło) |
| USP/zaufanie | ikony/grafika | zdjęcia | flat, spójny zestaw |

## REGUŁY ŁĄCZENIA tło-scena vs pierwszy plan (skrót 15)
1. Kontrast figuratywności: scena bogata → pierwszy plan CZYSTY. Nigdy dwie pełne
   fotografie warstwowo. 2. **ZAKAZ „obraz na obrazie"**: fotografia produktu nie nachodzi
   bboxem na inną fotografię; na scenie dozwolony TYLKO cutout z czystą alfą (packshot
   z własnym białym tłem na scenie = biały prostokąt = FAIL) lub packshot na jednolitym
   kolorze. 3. Negative space planowany w promptcie sceny, nie „wciskany" po fakcie.
4. Jedno źródło światła na scenę (studio-flat na zachodzie słońca = fałsz). 5. Wspólny
   grading obrazów sekcji. 6. Warianty = klon setupu. 7. Overlay pod tekstem na zdjęciu
   (obowiązkowo, do policzalnego 4.5:1). 8. Busy-background (edge-density) pod tekstem/
   produktem → overlay albo przesunięcie. 9. Cutout zamiast maskowania. 10. Realna skala
   + cień kontaktowy cutoutu (lewitacja = AI-slop). 11. Jeden kafel = jedna klasa obrazu.
12. UGC nigdy jako tło sekcji. 13. Zgodność perspektywy warstw. 14. Tła jasne (ciemne=FAIL).
15. Cała strona = jeden świat światła/palety od hero do stopki.

## CHECKI — warstwa skryptowa (gate blokujący; do mockup-tools) + vision
**Skrypt (per obraz):** mediana luminancji <70/255 → „za ciemne" (w ofercie BLOK) ·
`is_low_contrast` → BLOK dla packshotu · Canny edge-density crop-u pod tekstem/produktem
→ wymuś overlay · bbox produktu 80-85% kadru, margines ≥5%, nie dotyka krawędzi ·
detekcja białego prostokąta wklejonego w scenę · rozdzielczość vs rozmiar renderu.
**Skrypt (per layout):** bbox-overlap dwóch fotografii → BLOK image-on-image (alfa-cutout
dozwolony) · WCAG contrast pod tekstem na obrazie · **TAG KLASY (P/U/S/R) każdego assetu
w mapie assetów + allowlista klas per slot sekcji → klasa spoza allowlisty = BLOK**
(to łapie „UGC w ofercie" mechanicznie; obejmuje też R poza galerią/kartą i S w galerii).
**Vision (na wątpliwe):** spójność światła/kąta/tonu w sekcji · konflikt światła
packshot↔scena · realizm cutoutu (cień, skala) · fałszywa autentyczność (P/S udające U) ·
AI-slop tells · dopasowanie semantyczne obrazu do roli.

## TYPOWE BŁĘDY AI-FABRYK (lista kontrolna krytyka)
UGC w ofercie/wariantach · obraz-na-obrazie · konflikt światła · busy scena + tekst
po fakcie · niedoświetlone „packshoty" · produkt ucięty · niespójne warianty ·
generyczny AI-slop (purple-blue, plastik, symetria) · full-bleed UGC · rozjazd światów
między sekcjami · lewitujący cutout · pikseloza.

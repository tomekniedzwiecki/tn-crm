
=== ZADANIE: CHUNK 3/10 — CSS część B (demo koloru + korzyści + jak korzystać + porównanie + galeria) ===
Sam CSS (bez <style>). Klasy:
- DEMO: .demo (band jasny), .demo-layout (grid stage + kontrolki), .demo-stage (aspect 4/3, jasne tło, packshot object-fit:contain, pozycja relative, overflow hidden),
  .demo-glow (absolutna warstwa radial-gradient używająca zmiennej --glow ustawianej JS, mix-blend screen, przejście 0.35s), 
  .color-picker (flex wrap), .color-pick (okrągły swatch 40px, tło var(--c), obrys biały+cień, focus-visible, stan .on = ring), 
  .demo-caption (podpis nastroju, --ink), .demo-note (małe --body).
- KORZYŚCI: .feats2 (grid 3 kol → 1 na mobile), .feat (karta biała, cień miękki), .feat-ic (tło blush, obrys --brand), .feat h3/p.
- JAK KORZYSTAĆ: .steps (grid 3 → 1), .step, .step-num (kółko --cta lub --brand z numerem), .step h3/p.
- PORÓWNANIE: .cmp-wrap (overflow-x auto, biała, cień), table.cmp (min-width 540), th/td, thead th (--ink), thead th.our (--brand), td.our (tło blush), .yes (zielony), .no (szary), .cmp-note; 
  responsywnie ≤560px: tabela→karty (thead ukryte, tr=karta, td blok, td:first-child nagłówek, td[data-label]::before=attr(data-label)).
- GALERIA: .gallery (grid 4→2 kol), .g-tile (aspect 1/1, radius, cień, cursor zoom-in), .g-tile img cover +hover scale, .ugc img{filter:brightness/contrast/saturate normalizacja}.
JASNE tła. Output = SUROWY CSS bez ``` i bez komentarzy.

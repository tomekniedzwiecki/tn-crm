
=== ZADANIE: CHUNK 5/10 — CSS część D (oferta + FAQ + finał + footer + lightbox + animacje + responsywność + domknięcie) ===
Sam CSS (bez otwierającego <style>). Klasy:
- OFERTA: .offer, .offer-card (grid foto+treść → 1 kol), .offer-photo (aspect 1/1, packshot contain), .offer-price (int/frac),
  .offer-list (check --check), .offer-guarantee (box blush z ikoną --brand), .offer .pay-row.
- FAQ: .faq-grid (grid 2→1), details/summary (strzałka ::after rotacja), details p.
- FINAŁ: .final (JASNE tło krem/blush, NIE ciemne), .final-inner, .final .lead, .final .micro (b w --brand), 
  .final-thumb (mały kafelek realnego RED glow, radius, cień — akcent, nie pełne tło), .final-review/.mini-review.
- FOOTER: .footer (JASNE tło krem), .footer-row, .footer .word, .footer p (małe), .footer-links a.
- LIGHTBOX: .lb (fixed, ukryty), .lb:target{display:flex}, .lb-bg (zoom-out), .lb-inner (biała, radius; .with-text grid img+tekst), .lb-inner img contain, .lb-text, .lb-close (kółko, hover rotate).
- ANIMACJE: .anim .reveal (opacity0+translateY→.in), staggery dla .feats2/.gallery/.rev-grid/.rev-quotes/.specs/.steps > *, hover CTA. keyframes subtelne.
- RESPONSYWNOŚĆ: @media 1000/760/560 (hero→1 kol, karta pełna; sticky-buy widoczny <768; feats2/gallery/rev-grid/specs zmiana kolumn; cmp→karty ≤560; wrap węższy).
- @media (prefers-reduced-motion: reduce): wyłącz animacje/transisiton, .reveal widoczne.
ZAKOŃCZ liniami: `</style>` potem `</head>` potem `<body>`.
Output = SUROWY CSS + te 3 linie zamknięcia, bez ``` i bez komentarzy.

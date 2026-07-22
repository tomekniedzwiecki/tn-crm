# KODER F5.0.2 — JEDEN wspólny moduł animacji (landing Ugniatek)

Implementujesz choreografię jako JEDEN moduł CSS + minimalne rozszerzenie istniejącego JS.
NIE piszesz kodu per sekcja. NIE dodajesz drugiego IntersectionObservera.

## ISTNIEJĄCY SYSTEM (w szkielecie — NIE duplikuj)
- :root tokeny: --mo-dur-s/.24s --mo-dur-m/.38s --mo-dur-l/.58s --mo-ease:cubic-bezier(.22,1,.36,1) --mo-dist:16px
- .reveal { opacity:0; transform:translateY(var(--mo-dist)) } → .reveal.in { opacity:1; transform:none; transition: ... }
- IO w <script> na końcu body: obserwuje .reveal, dodaje .in, unobserve; reduced-motion → wszystkie .in od razu.

## MOTION-DNA (choreograf — wdroż wartości tokenów!)
--mo-dur-s:.22s --mo-dur-m:.36s --mo-dur-l:.62s --mo-dist:14px --mo-stagger:.06s (ease bez zmian)

## SPECYFIKACJA WARIANTÓW data-mo (sekcje dostaną atrybuty — Ty piszesz TYLKO klasy)
Selektory wg wzorca: `.reveal[data-mo="X"]` (stan przed) i `.reveal[data-mo="X"].in` (po).
Dzieci sekcji do staggera mają [data-mo-child] z inline `--i:N` (index) — opóźnienie
`transition-delay: calc(var(--i,0) * var(--mo-stagger))`.
1. data-mo="dyptyk" (hero): kolumny zdjęć wjeżdżają ku osi z przeciwnych stron
   (child 1: translateX(-18px), child 2: translateX(18px), karta: translateY(14px) delay .12s).
2. data-mo="hairlines" (anatomia, L3): obraz osiada (translateY), potem calloutsy parami —
   linia rysuje się scaleX/scaleY od punktu kotwienia (transform-origin wg data-side="l|r"),
   label fade. Wszystko czystym CSS transition + delay (bez JS!).
3. data-mo="dosuw" (sterowanie, mid-cta): child 1 translateX(-16px), child 2 translateX(16px),
   kolejne dzieci translateY(12px) ze staggerem.
4. data-mo="wydech" (wieczorem): zdjęcia startują 8px BLIŻEJ siebie (translateX do zera),
   karta fade+translateY.
5. data-mo="osad" (zestaw): flat-lay translateY(-10px)→0, tabela translateY(12px)→0;
   pas wymiaru: linia scaleX(0)→1 (transform-origin left), liczba fade delay.
6. data-mo="pasmo" (final): kadry boczne translateX(±14px)→0, środek translateY(12px)→0.
7. faq: otwarcie details — treść fade+translateY(4px) (animacja na .fq-a przy [open], czysty CSS,
   BEZ animowania height); wejście sekcji = zwykły .reveal.
8. zamow: zwykły .reveal na wrapperze (moduł checkoutu NIETYKALNY).

## HERO-VIDEO (ambient, jedyny)
Element: <video class="hr-video" muted loop playsinline preload="none"
poster="https://.../bud-assets/ugniatek/assets/hero-L.webp"> w .hr-frame-l, absolute nad img,
opacity 0 → .on {opacity:1} (transition --mo-dur-l). JS (dopisz do istniejącego IIFE lub osobny
mały <script>): jeśli matchMedia('(min-width:768px)') && !prefers-reduced-motion →
ustaw src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/ugniatek/assets/hero-video.mp4",
video.play() po canplay → klasa .on. Nigdy na mobile (waga) i nigdy przy reduced-motion.

## ZASADY TWARDE
Tylko transform/opacity; wejścia ≤.72s wraz ze staggerem; reduced-motion: istniejący mechanizm
(wszystko .in bez ruchu) MUSI obejmować nowe warianty — stan .in = transform:none, opacity:1
(dziedziczysz to z bazy .reveal.in — nie nadpisuj transformem w .in!). ⚠ KRYTYCZNE: w stanie .in
NIE ustawiaj żadnych transformów (patrz baza .reveal.in{transform:none}) — pozycjonowanie
elementów NIGDY transformem. Zero nowych hexów. Zero JS poza wskazanym rozszerzeniem hero-video.

## FORMAT ODPOWIEDZI
Krótki plan, potem DWA bloki:
```html
<!-- MOTION-MODULE: <style> pełny CSS modułu + korekta tokenów :root przez nadpisanie w tym stylu -->
```
```html
<!-- HERO-VIDEO: <video> markup + <script> guard -->
```
Na końcu LISTA atrybutów do nadania (sekcja → element → atrybut), jedna linia per wpis.

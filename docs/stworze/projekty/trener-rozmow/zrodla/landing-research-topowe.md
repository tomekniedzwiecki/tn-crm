# Landing research — rzemiosło topowych SaaS (agent Opus, chrome-devtools, 2026-07-15)

> Zmierzone na żywo (getComputedStyle, viewport 1280): Linear, Attio, Superhuman, Claude.com,
> Granola. Claude i Granola = najbliższe tonalnie „papierowemu briefingowi" Dobrego Wstępu.

## Pomiary kluczowe
- **Linear**: H1 8 słów, 64px/lh 1.0, waga 510 (custom oś), ls −1.408px; dowód = statyczny
  hi-res screenshot produktu; hover CTA: transition 0.16s cubic-bezier(.25,.46,.45,.94) na
  transform+box-shadow+filter+opacity NARAZ; sekcje ~1100-1220px (1 myśl/sekcję), padding 128px;
  kontener 1364px, kolumna opisu 378px; cień warstwowy (kilka box-shadow).
- **Attio**: H1 4 słowa, 64px/0.95, waga 600, osobny krój display; easing sygnaturowy
  cubic-bezier(.32,.72,0,1); CTA 300ms; 7 reguł reduced-motion; pinned scroll-scena 6315px;
  kolumny treści 896/672px; kolory w lab().
- **Superhuman**: H1 4 słowa, waga 540, własny variable font; CTA burgund rgb(66,29,36),
  radius 16px (ciepły akcent na jasnym tle — wzór dla terakoty); 0 reguł reduced-motion (NIE kopiować).
- **Claude.com** (DNA Dobrego Wstępu): H1 SZERYF anthropicSerif waga 330, 67.7px/1.1; para
  krojów szeryf display + grotesk UI; ciepła paleta: tło rgb(20,20,19), tekst kość słoniowa
  rgb(250,249,245), szary ciepły rgb(176,174,165); reveal cubic-bezier(.16,1,.3,1) easeOutExpo;
  28 reguł reduced-motion; kolumna czytania 660px; CTA radius 8px; CENA INLINE na landingu
  (karty tierów, most popular).
- **Granola** (wzorzec „papier/notes"): H1 6 słów, 76.8px/0.93, waga 400, krój redakcyjny,
  ls −1.536px; sub = 2 krótkie linie; DOWÓD = interaktywne demo z REALNĄ treścią briefingu
  („Alex Park (VP) pushed back on pricing…"); atrament rgb(41,41,41) na kremie; paddingi
  112/120/128/160 (rosnące oddechy); kolumny 624-748px; easeOutExpo + micro 0.15s.

## WZORCE DO PRZENIESIENIA (12)
1. Para krojów: lekki szeryf display (waga ~330-400) + grotesk UI — sam kontrast krojów robi premium.
2. Ciepła near-czerń (rgb(41,41,41) / rgb(20,20,19)) + ciepła kość słoniowa zamiast #000/#FFF —
   „druk na papierze", nie „ekran".
3. H1 4-6 słów, 64-77px, letter-spacing −0.02…−0.022em — tytuł rozdziału, nie slogan.
4. Sub = 1-2 bardzo krótkie zdania łamane na osobne linie.
5. **Dowód produktu = realna konkretna treść** (fragment prawdziwego planu rozmowy / oceny
   gotowości % z nazwiskiem, firmą, obiekcją) — nie abstrakcyjny mockup.
6. Sygnaturowy reveal easeOutExpo cubic-bezier(.16,1,.3,1), ~400-600ms, fade + rise 12-24px —
   JEDEN easing na wszystkie wejścia sekcji.
7. Mikrointerakcje 150-200ms cubic-bezier(.4,0,.2,1); hover CTA reaguje „całym ciałem"
   (transform+cień+jasność w jednej tranzycji).
8. Cień warstwowy (kilka box-shadow o rosnącym blur, malejącej alfie) — „drukarski" cień karty.
9. Jedna myśl/sekcję, sekcje 900-1200px, oddechy 112-160px rosnące między aktami — każdy krok
   produktu (research → plan → gotowość → symulacja → raport) dostaje własną scenę.
10. Wąska szpalta 620-680px w kontenerze 1280-1440px.
11. prefers-reduced-motion poważnie (wariant statyczny dla każdego ruchu).
12. Jeden ciepły akcent (terakota) na CTA, radius 10-12px (NIE pill — pill=techno, miękki
    prostokąt=karta/dokument); oliwka do stanów.

**Cena:** rekomendacja = jawna cena INLINE na landingu (styl Claude) — transparentność rozbraja
lęk #1 (scam) lepiej niż chowanie ceny za „zacznij za darmo".

> Nota operacyjna sesji: agent odblokował chrome-devtools MCP (zombie profil-lock, znany wzorzec
> z pamięci) — ubite tylko drzewo procesów profilu MCP.

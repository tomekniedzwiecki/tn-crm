
# SEKCJA 09-faq (moduł faq-accordion@1 — mechanika NIETYKALNA, tu tylko treść+skórka)
Prefiks `.fq-`. Eyebrow "FAQ", .h2: "Pytania przed zakupem". Akordeon: 10 pozycji, KAŻDA:
<details class="fq-item"><summary>PYTANIE<span class="fq-x" aria-hidden="true"></span></summary>
<div class="fq-a">ODPOWIEDŹ</div></details> — ikona +/− rysowana CSS-em (dwie kreski 1.5px --ink,
obrót przy open; NIGDY petrol), karta --card border 1px --line radius-lg, animacja max-height.
PYTANIA+ODPOWIEDZI (fakty TYLKO z tych danych):
1. "Czym różnią się dwie formy użycia?" → "Ugniatka używasz na dwa sposoby: chwytasz za oba
uchwyty i dociskasz głowice tam, gdzie sięgasz (kark, barki, uda, łydki), albo kładziesz go na
sofie czy podłodze i opierasz się plecami lub lędźwiami — wtedy masuje ciężar ciała."
2. "Na jakich partiach ciała mogę go używać?" → "Docisk oburącz: kark, barki, uda, łydki.
Forma leżąca: plecy i lędźwie."
3. "Jak zmieniam tryby i intensywność?" → "Na bocznym panelu masz wyświetlacz i trzy przyciski.
Wybierasz jeden z 9 trybów (P1–P9) i jeden z 9 poziomów intensywności."
4. "Ile trwa praca i ładowanie?" → "Akumulator 2000 mAh wystarcza na do 2 h pracy. Ładowanie
przez USB trwa około 3,5 h."
5. "Jak działa auto-stop?" → "Urządzenie samo wyłącza się po 10 minutach sesji — możesz je
po prostu włączyć ponownie."
6. "Czym jest czerwone podświetlenie?" → "W centrum spodu znajduje się pole diod świecących
ciepłym czerwonym światłem (630–650 nm). To cecha konstrukcji — przyjemny, ciepły akcent
podczas masażu."
7. "Co znajdę w zestawie?" → "Masażer, kabel USB do ładowania, instrukcję obsługi i pudełko."
8. "Jakie są wymiary i waga?" → "28 × 16,5 × 11 cm i 1113 g — płaska forma, którą łatwo
położyć na sofie albo zabrać w torbie."
9. "Jak zapłacić przy odbiorze?" → "W zamówieniu wybierz opcję «Przy odbiorze (za pobraniem)»
— płacisz kurierowi przy dostawie."
10. "Jak działa zwrot 14 dni?" → "Masz 14 dni na zwrot bez podawania przyczyny. Napisz do nas,
odeślij produkt i otrzymasz zwrot pieniędzy."
Desktop: 2 kolumny (5+5) jak makieta; mobile: 1 kolumna.

ID sekcji: <section id="faq">.

## KONTRAKT/ZAKAZY (wspólne serii)
- Sekcja wklejana w szkielet: istnieją tokeny :root (--paper/--paper-2/--paper-3/--card/--ink/
  --body/--line/--cta/--cta-hover/--cta-ink/--radius-lg/--radius-sm/--shadow-*/--s1..--s7/
  --content-w/--h2-d/--body-fs) i klasy globalne .wrap .sect-pad .eyebrow .h2 .lead .display
  .btn.cta .pill .callout .reveal. UŻYWAJ ich; style sekcyjne w scoped <style> z prefiksem klas.
- Kolory WYŁĄCZNIE tokenami; zero nowych hexów (poza rgba() chłodnych cieni serii).
  Akcent petrol TYLKO CTA/aktywne stany. Ikony: inline SVG stroke 1.5px currentColor (--ink).
- Zero gwiazdek/liczb opinii, zero przekreśleń cen, zero „24h", zero ciemnych teł sekcji.
- Obrazy: <img> z width/height, loading="lazy", alt PL opisowy, radius var(--radius-lg).
- Dodawaj .reveal do głównych bloków.
- NAJPIERW wypisz siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style>.


# SEKCJA 05-obszary (4 kadry obszarów użycia; mozaika)
Prefiks `.ob-`. Na --paper. DESKTOP: header (eyebrow „TWÓJ RYTM"; H2 „Kark, ramiona, plecy albo
<span class="swash">uda</span>."; body .lead „Wybierz obszar i prowadź masażer ręcznie, dopasowując
poziom do własnych preferencji.") + mozaika 2×2 kart (--card radius-lg border --line shadow-sm):
  kafel1 <img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-obszary-neck.webp (alt "Dłoń prowadzi granatowy masażer po karku") + etykieta „Kark"
  kafel2 <img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-obszary-shoulder.webp (alt "Granatowy masażer przy ramieniu, chwyt za głowicę") + „Ramiona"
  kafel3 <img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-obszary-back.webp (alt "Górna część pleców i granatowy masażer, naturalny zasięg dłoni") + „Plecy"
  kafel4 <img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-obszary-thigh.webp (alt "Granatowy masażer na udzie w domowej stylizacji") + „Uda"
wszystkie 4:5 cover radius-sm, lazy, etykiety .display --ink na dole kafla. Pod mozaiką NOTA .lead 15px:
„To produkt do domowego masażu i relaksu, nie urządzenie lecznicze." Link tekstowy --ink podkreślony:
„Sprawdź ładowanie i czas pracy" href="#autonomia". ⛔ ZERO schematów anatomicznych/„stref bólu".
MOBILE: header → sekwencja pionowa 4 kadrów (te same pliki) z etykietami → nota → link.

ID sekcji: <section id="obszary">.

## KONTRAKT/ZAKAZY (wspólne serii — Rozgrzewek)
- Sekcja wklejana w gotowy szkielet: istnieją tokeny :root (--paper #FAF3EF / --paper-2 #F3E9E3 /
  --card #FFFFFF / --ink #2B2622 / --body #453E38 / --line #E4D7CE / --cta #2E46C8 /
  --cta-hover #2438A6 / --cta-ink #FFFFFF / --led-heat #D8433A / --led-vibe #2E46C8 /
  --led-ems #3FA05A / --radius-lg 18px / --radius-sm 10px / --shadow-sm/-md/-lg /
  --s1..--s7 / --content-w / --h1-d / --h1-m / --h2-d / --h2-m / --price-fs / --body-fs)
  oraz klasy globalne .wrap .sect-pad .eyebrow .rings .h2 .lead .display .btn.cta .pill .band
  .reveal .swash. UŻYWAJ ich; style sekcyjne w scoped <style> z PREFIKSEM sekcji.
- SKALA TYPOGRAFII ŻYWEJ (twarda): H1=var(--h1-d)/var(--h1-m), H2=var(--h2-d)/var(--h2-m),
  ceny=var(--price-fs), body 17px. ⛔ ZERO clampów sekcyjnych powyżej tej skali.
- KOLORY WYŁĄCZNIE tokenami; ZERO nowych hexów (poza rgba() cieni serii i tokenami --led-* dla
  DIOD STATUSU urządzenia). Dozwolone hexy dosłowne: #FAF3EF #F3E9E3 #FFFFFF #2B2622 #453E38
  #E4D7CE #2E46C8 #2438A6 #D8433A #3FA05A #000000.
- AKCENT #2E46C8 (indygo) TYLKO: (a) przycisk .btn.cta, (b) swash (1 słowo), (c) ZEWNĘTRZNY łuk
  kręgów (.r-out). ⛔ NIGDY na: linkach tekstowych (=--ink z podkreśleniem), nagłówkach kart,
  aktywnych zakładkach (=fill --ink / tekst biały), ikonach (=--ink outline 1.75px).
  Kolory --led-heat/--led-vibe/--led-ems = WYŁĄCZNIE diody statusu urządzenia (czerwony=grzanie,
  niebieski=wibracje, zielony=EMS), NIE dekoracja UI.
- SYGNATURA „kręgi ciepła": tam gdzie brief każe, wstaw DOKŁADNIE ten markup przy eyebrow:
  <span class="rings-wrap"><svg class="rings" viewBox="0 0 88 46" aria-hidden="true" focusable="false"><path class="r-out" d="M4 44a40 40 0 0 1 80 0"/><path class="r-mid" d="M15 44a29 29 0 0 1 58 0"/><path class="r-in" d="M26 44a18 18 0 0 1 36 0"/></svg></span>
  (2-3 koncentryczne łuki; wewnętrzne --line, zewnętrzny --cta; rysuje się przy .reveal.in).
- SWASH: <span class="swash">słowo</span> w H1/H2 — ZAWSZE DOKŁADNIE JEDNO słowo, maks. 1/sekcja.
- ZAKAZY TWARDE (Karta Prawdy §ZAKAZY): ZERO twierdzeń medycznych/leczniczych (drenaż limfatyczny,
  krążenie, meridiany, terapia światłem/mikroprądami, leczenie bólu), ZERO odchudzania/modelowania
  sylwetki (fat burner, cellulit), ZERO temperatur w °C, ZERO wymiarów cm/kg, ZERO nazwy „Hailicare"
  ani nazw sklepów, ZERO social-proof liczbowego (gwiazdki/liczby opinii/„sprzedano N"), ZERO
  fałszywej pilności/przecen, ZERO „darmowej dostawy", ZERO wypalonego tekstu EN/watermarków.
  Słowo „COD" NIGDY w copy widocznym — pisz „płatność przy odbiorze". Wariant = wyłącznie
  „Granatowy (Blue)" / „granatowy"; ZERO selektora kolorów. Liczby dozwolone: 84,90 zł · 9 poziomów
  · 21 kulek (tylko zdaniem, patrz 04) · 14 dni · ok. 1200 mAh / ok. 3 h / ok. 50 min / ok. 30 min.
  Funkcje wolno wymieniać NEUTRALNIE (ciepły okład, wibracje, tryb EMS/mikroprądy) BEZ obietnicy efektu.
- Obrazy: <img> z width/height (i CSS height:auto), loading="lazy" (poza hero=eager), alt PL
  opisowy (produkt zawsze „granatowy"), radius var(--radius-lg/sm). Dodawaj .reveal do głównych bloków.
- ⛔ NIE centruj transformem (kolizja z .reveal.in{transform:none}) — używaj margin-inline/justify.
- NAJPIERW wypisz krótką siatkę sekcji, POTEM kod.

## FORMAT ODPOWIEDZI
Krótka siatka, potem JEDEN blok ```html: WYŁĄCZNIE <section id="ID"> + scoped <style> (+ scoped
<script> IIFE tylko jeśli brief każe). ZERO markdown poza tym blokiem.

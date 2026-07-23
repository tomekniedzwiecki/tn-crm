
# SEKCJA 07-zdjecia-kupujacych (UGC realne, 3 kafle granatowe; ZERO ocen/gwiazdek/liczb — bramka ≥2 PASS
#                              spełniona: 3 klatki granatowe)
Prefiks `.ug-`. Na --paper. Header: eyebrow „POZA PACKSHOTEM"; H2 „Zdjęcia od <span class="swash">kupujących</span>.";
body .lead „Prawdziwe domowe kadry granatowego wariantu — bez ocen, gwiazdek i liczników popularności."
GALERIA 3 kafle (--card radius-lg border --line, overflow hidden):
  <img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/ugc/ugc-1.webp (alt "Zdjęcie od kupującego: granatowy masażer w dłoni, widoczna głowica")
  <img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/ugc/ugc-2.webp (alt "Zdjęcie od kupującego: granatowy masażer, świecący wyświetlacz")
  <img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/ugc/ugc-3.webp (alt "Zdjęcie od kupującego: makro głowicy z czerwonym światłem LED")
wszystkie lazy, cover, aspect-ratio 4/5 lub 1/1; POD KAŻDYM podpis 13px --body: „Granatowy wariant Blue".
DESKTOP: 3 kadry w spokojnej siatce (repeat(3,1fr)). MOBILE: jeden duży kadr + 2 mniejsze (bez agresywnego
poziomego railu). ⛔ ZERO gwiazdek, liczb, „opinii N", ocen. Link tekstowy --ink podkreślony:
„Chcę granatowy Rozgrzewek" href="#zamow".

ID sekcji: <section id="zdjecia">.

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

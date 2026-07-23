
# SEKCJA 01-hero (archetyp D — packshot/scena centralna na polu koloru; message match)
Prefiks `.hr-`. Sekcja: <section id="hero" class="hr-hero hero sect-pad"> (klasa .hero WYMAGANA — IO
sticky-buy). Topbar z lockupem JUŻ istnieje w szkielecie — NIE dubluj logo.
DESKTOP (≥900px): 2 kolumny, LEWA (~46%) = scena, PRAWA (~54%) = copy+oferta (editorialnie,
wyśrodkowana w kolumnie, bez bocznych podkolumn).
LEWA scena (.reveal): <img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-hero.webp (1536x1024, eager, fetchpriority="high",
alt "Granatowy masażer Rozgrzewek na ciepłym stoliku, obok parujący kubek i ciepła lampa") na polu
--paper-2, radius-lg, object-fit cover; delikatna ambientowa poświata lampy w prawym-górnym rogu
ramy (subtelny radialny gradient, powolny „oddech" opacity ~6s; @prefers-reduced-motion → statyczny;
ZERO ruchu produktu/LED).
PRAWA copy (.reveal): na górze kręgi + eyebrow „TWÓJ WIECZORNY RYTUAŁ" (kręgi NAD eyebrow, użyj
markup RINGS). Potem H1 .display var(--h1-d) — WARIANTY HOOK pod ?h= (domyślnie h1):
  hook-1 (domyślny widoczny): H1 „Wieczorny masaż, który zaczyna się od <span class="swash">ciepła</span>."
    sub .lead „Rozgrzewek łączy delikatny ciepły okład, wibracje i tryb EMS — każdy z 9 poziomami intensywności."
  hook-2: H1 „3 tryby. 9 poziomów. Jeden <span class="swash">rytuał</span> po Twojemu."
    sub „Podgrzewanie, wibracje i mikroprądy/EMS w ręcznym, bezprzewodowym masażerze do ciała."
  hook-3: H1 „Gdy po całym dniu chcesz już tylko chwili dla <span class="swash">siebie</span>."
    sub „Sięgnij po rozgrzewający masaż karku, ramion, pleców lub ud — we własnym wieczornym rytmie."
Zaimplementuj 3 bloki .hr-hook (hook-1/2/3), domyślnie widoczny hook-1 (CSS .hr-hook{display:none};
.hr-hook-1{display:block}); scoped <script> IIFE czyta ?h= (2 lub 3) i przełącza data-hook na kontenerze
(CSS [data-hook="2"] .hr-hook-1{display:none} itd.), w try/catch, bez konsoli. Domyślnie (brak/inny param)
= hook-1.
Pod H1/sub: NAZWA caps 14px letter-spacing .1em --ink: „ROZGRZEWEK — PODGRZEWANY MASAŻER DO CIAŁA".
KARTA OFERTY (--card, radius-lg, shadow-md, padding s4): cena <span class="display hr-price"
data-price>84,90 zł</span> (var(--price-fs), 700, --ink) → CTA <a class="btn cta" data-checkout
href="#zamow">Chcę swój Rozgrzewek</a> (full-width) → linia redukcji ryzyka .hr-micro 13.5px
„Płatność przy odbiorze • 14 dni na zwrot".
POD kartą PAS ZAUFANIA: 3 trust-pille (.pill, białe, border --line, ikona --ink 1.75px, tekst --ink):
„Płatność przy odbiorze" (ikona pudełka) · „BLIK i płatność online" (ikona telefonu/karty) · „CE i RoHS"
(ikona tarczy). To PIGUŁKI trust, NIE loga płatności.
MOBILE (<900px) — kolejność makiety: scena (zcapowana!) → kręgi+eyebrow → H1 → sub → NAZWA → karta
oferty → trust-pille. **TWARDA REGUŁA FOLD (decyzja krytyka): cena 84,90 zł + CTA MUSZĄ być w pierwszym
ekranie 390x844 z zapasem.** Dlatego: scena mobile <img> https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/sc-hero-mobile.webp
(1024x1536, eager, alt jw.) z `max-height:38vh; object-fit:contain/cover` (kilka % mniej niż makieta);
H1 var(--h1-m) line-height ~1.03; sub skrócony do 2 linii; karta oferty kompakt zaraz pod sub. Trust-pille
i redukcja ryzyka mogą wejść pod zgięcie. Cel: price+CTA nad ~760px.

ID sekcji: <section id="hero">.

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

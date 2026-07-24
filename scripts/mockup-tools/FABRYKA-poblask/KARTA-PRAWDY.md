# KARTA PRAWDY — POBLASK (LEDowe oświetlenie wnętrza samochodu) · F0.6 · 2026-07-24

JEDYNE źródło faktów landingu (Z7). Claim bez kotwicy w tej karcie = CUT. Puste pole = „brak
danych", nigdy zmyślanie. Każda liczba oznaczona: **[KONKRET-SKU]** (konkret sprzedawanego
wariantu) / **[SPEC]** (z tabeli parametrów / tytułu) / **[GALERIA]** (dowód z kadru) /
**[OPIS]** (destylat opisu-FAKT) / **[BEŁKOT-CUT]** (odrzucone).

## 0. Tożsamość produktu
- **Klasa:** samochodowa **taśma LED ambientowa (atmosphere lamp)** — elastyczna listwa
  świetlna z **akrylowym światłowodem** rozpraszającym pełne **RGB**, zasilana **USB (5V)**,
  sterowana **aplikacją (Bluetooth)** + **pilotem RF**, z trybem **reagującym na muzykę /
  dźwięk**. Montaż „ukryty", bezinwazyjny (taśma klejąca + wciśnięcie w szczeliny tapicerki).
- **Wariant sprzedawany = bazowy „in 1" = JEDNA taśma 110 cm** + sterownik USB + pilot +
  taśma klejąca + plastikowy klin montażowy ($8.54 → §1). ⛔ NIE „in 2" (110 cm × 2, $13.69 —
  poza marżą, patrz §1).
- **Slug fabryki:** `poblask`. **Mini-marka = „Poblask"** (zarezerwowana w `bud_brand_names`
  2026-07-24, id `90ce5fe9`, product_id `71e8176b-de95-41aa-82d9-636ad2595c10`; F2.5 generuje favicon).
- **Rekord kuracji:** `bud_tt_products.id = 71e8176b-de95-41aa-82d9-636ad2595c10`. ali_product_id
  `1005006904591428`.
- **Źródło danych:** aukcja AliExpress `1005006904591428`, **`source='detail'` = ZAUFANE**
  (gate F0 PASS ✓). Snapshot pobrany **2026-07-24T16:22Z** (świeży, dziś).
- **⛔ WHITE-LABEL:** marka **„Fccemc"** (spec Brand Name; watermark „FCCEMC®" wypalony w wideo
  produktowym), sprzedawca **„Stone's Store"** — **NIGDY na stronie**. Wideo wymaga usunięcia
  watermarku (crop/retusz, WIDEO.md). Pudełka na zdjęciach kupujących noszą generyczny nadruk
  „Vehicle Intelligent Lighting System" — też NIE używać.
- **Kategoria (WEWNĘTRZNA, nie na stronę):** Automobiles, Parts & Accessories > Car Lights.

## 1. Cena
- **NASZA cena PL: 39,90 zł** [ODCZYT z `wf2_products.price` — krok `kalkulacja` DONE; fabryka
  landingów NIE ustala i NIE zmienia ceny]. Końcówka zgodna z regułą (<150 → ,90).
- **Koszt zakupu (wariant bazowy „in 1" $8.30): 31,54 zł** [KONKRET-SKU]
  = **$8.30 × kurs NBP 3,8000** (tab. **142/A/NBP/2026, 2026-07-24**). Zapisane w
  `wf2_products.cost_purchase = 31,54`.
- **Narzut ~24% · zysk/szt. 7,56 zł** (po prowizji 2%) [`unit_profit` GENERATED]. Nota
  kalkulacji: 39,90 zł = najniższa cena psychologiczna powyżej minimum (narzut wyszedł ~24% >
  pasmo 10–15%, bo produkt tani a końcówka ,90 podbija do progu psychologicznego).
- **Koszty wariantów USD** [KONKRET-SKU, `sku_prices`]: **„in 1" $8.30** (bazowy) · „in 2" $13.69.
  ⚠️ **PUŁAPKA MODELU CENY:** wariant „in 2" (110 cm × 2) landed ≈ 52 zł > 39,90 zł → **strat­ny**;
  na stronie sprzedajemy WYŁĄCZNIE bazowy „in 1" (jedna taśma 110 cm). Cena PL jedna: 39,90 zł.
- Dostawa/COD/zwrot: warunki sklepów fabryki (COD + zwrot 14 dni, checkout Trevio).

## 2. Specyfikacja 1:1 (VERBATIM z `specs`) — [SPEC]
| Parametr | Wartość | Uwaga |
|---|---|---|
| Brand Name | Fccemc | *WEWN. — white-label, nie na stronę* |
| Item Type | Atmosphere lamp | „lampka nastrojowa / ambientowa" |
| High-concerned chemical | None | puste — POMIŃ |
| Origin | Mainland China | *WEWN.* |
| Material | Acrylic | akryl (światłowód rozpraszający) |
| Special Features | Sound control | sterowanie dźwiękiem = **tryb reakcji na muzykę** |
| Voltage | 5V | zasilanie **DC 5V (USB)** |
| Choice | yes | *WEWN. — tag marketplace, nie parametr* |

### 2a. ⚠️ SANITY LICZB — ROZSTRZYGNIĘCIE
- **„64 kolory"** [SPEC/title „64 Colors" + OPIS „64 options"] = KONKRET (liczba gotowych barw
  w aplikacji). Strona: „64 kolory + pełne RGB z płynnymi przejściami" (taśma adresowalna —
  g3 „BT SPI LED CONTROLLER", g4 pokazuje płynny gradient). ⛔ NIE „16 mln kolorów" (brak kotwicy).
- **Długość „110 cm"** [SPEC/title „110cm"] = KONKRET dla wariantu bazowego (JEDNA taśma).
  ⛔ NIE obiecywać „cała kabina podświetlona" — jedna taśma 110 cm = JEDEN łuk światła (np. wzdłuż
  deski rozdzielczej). Taśma jest **przycinalna** (g3) i można dokupić więcej / wariant „in 2".
- **Zasilanie: USB DC 5V** [SPEC Voltage 5V + OPIS „USB Powered"] = KONKRET.
- **Materiał: akryl** [SPEC Material Acrylic] — światłowód akrylowy. ⛔ NIE „światłowód
  szklany", ⛔ NIE „neon" (to LED + akryl, nie gaz neonowy), ⛔ NIE „fiber optic".
- **Wodoodporność** [OPIS „Waterproof: Yes"] — „odporna na wilgoć". Podawać ostrożnie (bez klasy IP).
- **Zakres pracy −20°C do 60°C** [OPIS] = KONKRET.

## 2b. Specyfikacja z OPISU + kadrów galerii — [OPIS]/[GALERIA]
| Parametr | Wartość | Kotwica |
|---|---|---|
| Sterowanie | **aplikacja (Bluetooth, iOS + Android)** + **pilot RF** | OPIS „Bluetooth connection phone app control… fit iOS and Android"; g0/g6/g7 pokazują pilot + app |
| Tryby światła | statyczny kolor · **muzyka/dźwięk (sound active)** · regulacja jasności / temperatury | OPIS „Light Mode 1) Sound Active Effects 2) Music Decoration 3) Brightness…"; SPEC „Sound control" |
| Instalacja | **USB plug&play, bezinwazyjna** (taśma klejąca + wciśnięcie w szczeliny), **przycinalna** | OPIS „USB Powered… no complicated wiring", „Non Destructive Installation" (g0); g3 „Length can be cropped… careful not to cut the lamp beads" |
| Elastyczność | giętka (można wygiąć i przyciąć) — ⚠️ **na ostrych łukach sztywnawa** | OPIS „Flexible, can be bent… and cut"; g3 „Soft and flexible"; ⚠️ op.[0]/[2] realny minus (§5) |
| Pamięć | **układ pamięci** (zapamiętuje ustawienia) | OPIS „With memory chip" |
| Sterownik | moduł **USB z Bluetooth** + przycisk (krótkie: on/zmiana trybu, długie: off) | g3 „USB interface… Short press: On/Switch mode, Long press: Close"; „BT SPI LED CONTROLLER, DC 5V" |
| W zestawie (bazowy „in 1") | 1× taśma 110 cm · sterownik USB · pilot RF · taśma klejąca 2-stronna · plastikowy klin montażowy | g6/g7 (packshot zestawu); ⚠️ g6 pokazuje wariant „in 2" (2 taśmy) — bazowy ma JEDNĄ |
| Waga / dokładne wymiary sterownika | **BRAK DANYCH** (specs nie podają) — ⛔ zero zmyślonych mm/g | — |

## 3. Destylacja opisu sprzedawcy — FAKT / BEŁKOT
**FAKTY (z kotwicą — wolno użyć feature→benefit):**
- Pełne RGB, 64 kolory, płynne przejścia → „dobierz nastrój wnętrza jednym dotknięciem — 64 kolory
  i płynne RGB" (kotwica: title „64 Colors… Full Colors RGB" + OPIS + g4). **RDZEŃ USP.**
- Sterowanie z **aplikacji (Bluetooth) i pilotem** → „ustawiasz kolor/tryb z telefonu, bez
  szukania przełączników; pilot pod ręką" (kotwica: OPIS „app control", g6/g7 pilot + app; op.[1]
  „controlled by app via integrated USB controller", op.[16] „remote control also works").
- **Reakcja na muzykę** (czujnik dźwięku) → „taśma pulsuje w rytm muzyki — wnętrze gra z Twoim
  soundem" (kotwica: SPEC „Sound control" + OPIS „Sound Active Effects… synchronized with music beat").
- **USB plug&play, bezinwazyjny montaż, przycinalna** → „wepnij w USB i gotowe — bez kucia,
  bez warsztatu; utnij na wymiar" (kotwica: OPIS „USB Powered… no complicated wiring", g0 „Non
  Destructive Installation", g3 „Length can be cropped"; op.[6] „you can use it right away when
  plugged into USB", op.[4]/[8] „installation is easy and simple").
- **Jakość jak w profesjonalnym montażu** → cytat opinii, nie claim własny (op.[3] „same quality
  of strips people get professionally fitted").

**BEŁKOT / OSTROŻNIE (CUT albo forma zawężona):**
- „Symphony Mood Lights", „psychedelic", „cool and psychedelic atmosphere", „romantic atmosphere",
  „elegance", „vibrant and dynamic" — **BEŁKOT-CUT** (superlatywy z infografik/opisu; „nastrojowa
  poświata" OK jako opis funkcji, bez patosu).
- „Vehicle Intelligent Lighting System" (nadruk pudełka), „16 million colors" (nie w danych),
  „whole-car / full interior kit" — **CUT** (jedna taśma 110 cm ≠ pełen zestaw wielostrefowy).
- „professional ambient light kit" jako claim własny — TYLKO jako cytat opinii op.[3].

## 4. Warianty
**2 warianty** w `sku_prices`: **„in 1" $8.30** (bazowy — JEDNA taśma 110 cm) · **„in 2" $13.69**
(110 cm × 2). **MODEL CENY: jedna cena PL 39,90 zł dla wariantu bazowego „in 1".** „in 2" NIE
oferowany (poza marżą — §1). ⚠️ OPIS: „2-in-1 version has two types of wires… version randomly
sent" — dotyczy „in 2", NIE bazowego. Kolor produktu = **pełne RGB** (nie stały kolor — swatch
koloru NIE dotyczy; „swatch" = paleta trybów w aplikacji, nie wariant zakupowy).

## 5. Dowód społeczny
- **Ocena: ★ 4,9 / 5** [KONKRET, `review_stats`] · **99 ocen** · **98% pozytywnych**.
- **20 recenzji z treścią** (WSZYSTKIE **5★**; teksty EN/RU/IT — `text` oryginał). Zawierają REALNE
  minusy (uczciwość Z5) — do porównania/FAQ, nie ukrywać. Treści §5a.
- **41 zdjęć od kupujących** (wszystkie z recenzji 5★ — filtr `stars==5` PASS globalnie): realne
  montaże w autach (Audi A3, Mazda CX-30, Smart, Kia i in.), taśma świecąca wzdłuż deski/drzwi.
  Pula do sekcji „zdjęcia od kupujących" (RANKING w F2/F3 — GALERIA.md §UGC).
- **sold_volume = 1109** [SPEC, WEWNĘTRZNY]: liczba globalna Ali ≠ nasz sklep. **≥1000 →**
  dozwolona **JEDNA nieprzypisana fraza bez liczby** („sprawdzony produkt, tysiące zamówień na
  świecie") — ⛔ NIGDY licznik / „X sprzedanych u nas" / pilność.
- **shop „Stone's Store"** (`store/1103573332`) — **🚫 NIGDY na stronie** (white-label; grep-gate F6).

### 5a. Recenzje (20 treści 5★ — VERBATIM skróty; imiona zanonimizowane przez Ali)
1. ★5 (3 zdj): „quality of the LEDs is excellent… if there are straight lines, installation is easy,
   but if there are bends, you'll have to struggle a bit." — **plus jakość LED; MINUS: łuki trudniejsze.**
2. ★5 (3 zdj): „Very soft LED on Alfa Romeo Giulietta, controlled by app via integrated USB
   controller." — **plus: miękkie światło, sterowanie z app przez sterownik USB.**
3. ★5 (1 zdj): „very bright, and perfect colors with the app, not suitable for sharp turns because
   it is very rigid." — **plus: jasne, kolory z app; MINUS: sztywna na ostrych zakrętach.**
4. ★5 (2 zdj): „…same quality of strips people get 'professionally fitted'…" — **plus: jakość jak profesjonalny montaż.**
5. ★5 (1 zdj): „very satisfied with the clear RGB LED colors. Installation is easy and simple." — **plus: czyste RGB, łatwy montaż.**
6. ★5 (1 zdj): „good material, nice colors and works well with app" (szybka dostawa).
7. ★5 (4 zdj): „you can cut it to the right length… use it right away when plugged into USB.
   Attaching it to the dashboard is a bit difficult." — **plus: przycinalna, plug&play; MINUS: montaż na desce bywa trudny.**
8. ★5 (3 zdj): „Top lighting. I have already ordered 3 times." — **plus: powrotny klient.**
9. ★5 (1 zdj): „installation is very simple and works excellently" (dokupił kolejne).
10. ★5 (1 zdj): „fits perfectly on the spark… Even when dimming the light, it's still too strong."
    — **MINUS: minimalna jasność wciąż duża.**
11. ★5 (2 zdj): „look amazing, better than in images or videos. I would perhaps like an app with more
    features or simpler." — **plus: efekt lepszy niż na zdjęciach; MINUS: aplikacja mogłaby być lepsza.**
12. ★5 (4 zdj): „Good material, work well and arrived in a week very quickly."
13. ★5 (3 zdj): „fast shipping and good quality, 100% recommended."
14–20. ★5: powtarzalne „great product / good lighting / remote control works / fast shipping /
    repeat purchase / very good effect" — plusy: efekt, działający pilot, szybka dostawa, zakupy powrotne.

**Wzorce (plusy → copy):** świetna jakość LED / czyste, jasne RGB · sterowanie z aplikacji (i pilot) ·
przycinalne, USB plug&play, prosty montaż · „jak profesjonalny montaż" · zakupy powrotne (op.[8]/[17]).
**Wzorce (REALNE minusy → porównanie/FAQ uczciwie):** na ostrych łukach sztywnawa (op.[0]/[2]) ·
montaż na desce bywa fiddly (op.[6]) · minimalna jasność wciąż wysoka (op.[9]) · aplikacja mogłaby
być bogatsza/prostsza (op.[10]) · pilot bez baterii w zestawie (OPIS) · „in 2" wersje kabli różnią
się między partiami (OPIS — dot. wariantu 2-pak, nie bazowego).

## 6. Materiał wizualny → `gallery_curated`
Kuracja 8 kadrów (g0–g5 galeria detail WebP + g6 avif packshot zestawu + g7 render sklepowy):
**4 keep (crop)** on-page (g4 kolory · g5 montaże · g2 app-in-hand crop · g7 crop scena) + g3 crop
detali (sterownik/przycinalność); **g0/g1/g6 = DANE** (infografiki, wypalony tekst). Osobno **pula
UGC** (41 zdjęć 5★) do sekcji „zdjęcia od kupujących". Pełne werdykty: `GALERIA.md` +
`bud_tt_products.gallery_curated`.

## 7. Wygląd i wideo
- **PASZPORT wizualny:** `PASZPORT.md` (cechy dyskryminujące + „CZEGO NIE MA" + white-label).
- **Wideo:** `ali_snapshot.video_url` **ISTNIEJE** (`…1100191988031.mp4`, 58,7 s) — **ON-PRODUCT**
  (realna taśma świecąca w aucie nocą + sterowanie z aplikacji; gate po klatkach 0.5/4/8/… = PASS).
  ⚠️ Watermark **„FCCEMC®"** wypalony w lewym-górnym rogu → **crop/retusz przed użyciem**. Sekcja
  `wideo` = **BUILD** (materiał realny). Szczegóły + `videos_curated`: `WIDEO.md`.

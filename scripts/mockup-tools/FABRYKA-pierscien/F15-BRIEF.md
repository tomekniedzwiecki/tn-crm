# BRIEFING F1.7 — PRZEWODNIK GRAFICZNY „SKROLIK"

Jesteś art directorem fabryki landingów. Na bazie PLANU (kontekst niżej) piszesz
PRZEWODNIK-GRAFICZNY.md — partyturę WSZYSTKICH scen do wygenerowania (model obrazkowy
z referencjami realnego produktu). Pisz PO POLSKU; seedy scen PO ANGIELSKU (prompt-ready).
Zwięźle, zero poezji.

## PRODUKT — WIERNOŚĆ (PASZPORT; te cechy w KAŻDEJ scenie z produktem)
Pierścień-pilot Bluetooth na palec: mały KLINOWATY (keystone) blok-płytka ~3,0×2,8×1,3 cm
z matowego ABS, osadzony na OTWARTYM silikonowym pałąku-klipsie „C" (rozcięty od spodu —
NIE zamknięta obrączka). Na górnej, lekko skośnej płytce DOKŁADNIE TRZY okrągłe, lekko
wypukłe przyciski ze strzałkami, ułożone po skosie w jednej linii; kolor przycisków = kolor
korpusu. Z jednego boku podłużna wpuszczona szyna/rowek; z drugiego wpuszczone owalne
gniazdo ładowania + pinhole diody. Noszony na palcu WSKAZUJĄCYM, kciuk naciska przyciski.
KOLOR SCEN: RÓŻOWY pastelowy mat (jedyny sprzedawany; czarny/kremowy tylko w kadrze-trójpaku
z galerii — NIE generujemy).
CZEGO NIE MA (model dorabia — zakazać w NEG): ekranika/wyświetlacza na pierścieniu,
czwartego przycisku, metalu, zamkniętej obrączki, pokrętła/rolki, RGB/podświetlenia,
logotypów i napisów na produkcie, kabla, stacji ładowania, paska.
Referencje realne (podane jako image refs przy generacji): packshot różowy 3/4 (keep2),
zbliżenie czarnego na palcu z kciukiem na przyciskach (keep4 — pokazuje JAK produkt siedzi
na palcu; w scenach kolor MA BYĆ różowy).

## ŚWIAT I PARTYTURA (z PLANU — obowiązkowe)
Tło pudrowa mgiełka różana #F8F1F0 / karty #FFFDFC / tekst #2B2025 · akcent głęboka malina
#B4265C · Gabarito + Mulish · sygnatura: PIERŚCIENIE SYGNAŁU (cienkie koncentryczne łuki/
pulsy od pierścienia — subtelne, mogą pojawić się jako delikatna grafika przy produkcie) ·
świat: JASNY DZIENNY DOM w trybie relaksu (kanapa przy oknie w świetle dziennym, jasna
kuchnia, okno/balkon do selfie); ANTY: wieczorny salon/mrok, restauracja, siłownia, biuro,
gamer-RGB, studio stockowe. Casting: DŁONIE w kadrze częściej niż twarze; ⛔ twarz w zbliżeniu
NIGDY (dopuszczalna sylwetka od ramion w dół / profil zza telefonu); dorośli 20–40; zwykłe
jasne ubrania domowe.

## SCENY DO OPISANIA (ID kanoniczne; per scena: cel, kadr, kompozycja, światło, SEED EN)
- **sc-hero** (sekcja hero, archetyp B split — scena = blok 4:5 pion): dłoń z RÓŻOWYM
  Skrolikiem na palcu wskazującym, kciuk na środkowym przycisku; obok/za dłonią telefon
  oparty (o stojak/poduszkę) z ROZMYTYM neutralnym pionowym feedem (bez rozpoznawalnych
  aplikacji/UI, bez tekstu czytelnego); kanapa przy oknie, dzień. Scena projektowana POD
  HERO-VIDEO (Kling i2v): dominujący nośnik ruchu = treść ekranu przesuwająca się w pionie
  + mikro-ruch kciuka.
- **sc-kanapa** (sekcja ekran-zostaje, kadr A): osoba pod jasnym kocem na kanapie W DZIEŃ,
  telefon oparty na podstawce na stoliku/oparciu, dłoń z pierścieniem spoczywa wygodnie na
  kocu — scroll bez sięgania do ekranu.
- **sc-kuchnia** (sekcja ekran-zostaje, kadr B): jasna kuchnia, tablet/telefon oparty na
  blacie z NIEczytelnym przepisem (rozmyty), jedna dłoń zajęta miską/składnikami, druga
  z pierścieniem klika kciukiem.
- **sc-ebook** (sekcja ebooki): fotel/parapet przy oknie, telefon lub tablet przed osobą
  z neutralną stroną tekstu (nieczytelną/rozmytą), dłoń z pierścieniem na pierwszym planie,
  puls sygnału subtelnie.
- **sc-selfie** (sekcja selfie-video): balkon/okno w dzień, telefon na mini-statywie,
  osoba W ODDALI lub od ramion w dół przed obiektywem, uniesiona dłoń z pierścieniem,
  kciuk klika — zdalna migawka.
NIE generujemy: sekcja 6 (realne kadry z galerii), demo-scroll (cutout z packshotu +
kodowy telefon), mid-cta/final (kompozycje packshotów), poster wideo (już jest).

## WYMAGANIA TWARDE
1. OSIE RÓŻNORODNOŚCI serii: ≥3 konteksty (kanapa / kuchnia / okno-balkon), ≥3 skale
   (makro dłoni z produktem / plan średni / szerszy kadr wnętrza), ≥2 światła (jasne
   dzienne zimniejsze + cieplejsze popołudniowe), człowiek (dłonie/sylwetka bez twarzy)
   w 5/5 scen. Wypisz mapę osi per scena. ⛔ ANTY-SZEW: dwie sąsiednie sekcje nie dzielą
   kontekst+skala.
2. KAŻDY seed: pełny opis EN + blok ORIENT (jak produkt zorientowany na palcu; np. „ring
   worn on index finger, keystone block on top, three buttons facing thumb, open C-clip
   visible under finger") + wspólny blok NEG (verbatim w każdym seedzie: zakazy
   z CZEGO-NIE-MA + no readable text, no watermark, no faces in close-up, no night scene,
   no gym, no office, no restaurant).
3. Ekrany urządzeń w scenach: ZAWSZE neutralne/rozmyte (żadnych rozpoznawalnych aplikacji,
   logotypów, czytelnego tekstu).
4. Zaznacz per scena: format (4:5/3:2/1:1), rola w sekcji, referencje (sceny z produktem =
   ZAWSZE ref keep2 packshot różowy jako image[0]; sceny „jak siedzi na palcu" — dodatkowo
   keep4).
5. Hero-video (Kling i2v z sc-hero): opisz beat ruchu 5 s (treść ekranu płynie pionowo,
   kciuk delikatnie dociska przycisk, reszta kadru statyczna; kamera statyczna) + negative
   prompt.

## FORMAT: # PRZEWODNIK GRAFICZNY — SKROLIK → ## ŚWIAT I ŚWIATŁO → ## MAPA OSI
RÓŻNORODNOŚCI (tabela scena×kontekst×skala×światło×człowiek) → ## SCENY (per scena:
nagłówek ### sc-id, cel/rola, kadr/format, SEED EN, ORIENT, uwagi) → ## NEG WSPÓLNY
(blok verbatim) → ## HERO-VIDEO (beat + negative)

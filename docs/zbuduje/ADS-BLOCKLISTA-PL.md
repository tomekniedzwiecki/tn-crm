# ADS — BLOCKLISTA KOMENTARZY PL (standard fabryki, 2026-07-19)

Jedno źródło listy słów do auto-ukrywania komentarzy pod reklamami — wgrywana na stronę FB
klienta w kroku **Pre-flight** (Etap 4 Środowisko reklamowe), ZANIM poleci pierwszy ad.

## Jak wgrać (krok po kroku)
1. Strona FB → **Ustawienia → Prywatność → Publiczne posty** (lub Settings → Moderation) →
   **Moderacja / Content moderation**.
2. Włącz **filtr wulgaryzmów (Profanity filter)** na poziom mocny.
3. Wklej listę poniżej do **blokowanych słów kluczowych** (limit 1000 fraz; wpisy rozdzielane
   przecinkami). Meta ukrywa komentarz zawierający frazę — **także pod reklamami** (dark posty).
4. GOTCHA: **Moderation Assist NIE działa na reklamach** — działa tylko keyword blocklist
   i profanity filter. Nie polegać na Moderation Assist.
5. Ukryty komentarz widzi tylko autor i jego znajomi (zero „szumu"). **Ukrywać, nie usuwać** —
   usunięcie bywa zauważane i eskaluje. Na sensowne pytania odpowiadać szybko i konkretnie
   (sekcja komentarzy = trust signal cold traffic).

## Lista do wklejenia (kopiuj 1:1)

```
scam,skam,oszust,oszustwo,oszuści,oszukali,oszukany,naciągacze,naciagacze,ściema,sciema,przekręt,przekret,wyłudzenie,wyludzenie,fejk,fake,podróba,podroba,podróbka,podrobka,chińszczyzna,chinszczyzna,chińskie badziewie,chinski szajs,z chin,aliexpress,ali express,aliexpres,temu,shein,wish,allegro taniej,taniej na allegro,na allegro,olx taniej,gdzie taniej,kupicie taniej,to samo za,drozej niz,drożej niż,dropshipping,dropszyping,nie doszło,nie doszlo,nie dotarło,nie dotarlo,nie dostałem,nie dostalem,nie dostałam,nie dostalam,brak zwrotu,nie oddają,nie oddaja,nie odpisują,nie odpisuja,brak kontaktu,nie polecam,odradzam,strata pieniędzy,strata pieniedzy,wyrzucone pieniądze,wyrzucone pieniadze,szajs,badziewie,chłam,chlam,tandeta,złom,zlom,śmieć,smiec,gówno,gowno,gunwo,chujowe,chujowy,huj,chuj,kurwa,kurde,pierdol,spierdal,jebane,jebany,pojeb,debil,idioci,złodzieje,zlodzieje,złodziej,zlodziej,kradzież,kradziez,policja,prokuratura,uokik,rzecznik konsumenta,pozew,zgłoszę,zglosze,zgłaszam,zglaszam,reklamacja odrzucona
```

## Zasady utrzymania
- Lista = STANDARD STARTOWY; per projekt dokładaj frazy specyficzne (nazwa konkurenta,
  nazwa produktu + „opinie" itp.) w kroku **Opieka i higiena** (Etap 6).
- NIE blokować słów neutralnych („cena", „dostawa", „zwrot" solo) — pytania o cenę/dostawę
  to intencja zakupowa; blokujemy tylko frazy jednoznacznie toksyczne/demaskujące.
- Przegląd listy przy każdym refreshu kreacji (nowe wzorce hejtu spisywać z komentarzy).
- Frazy „policja/prokuratura/uokik/pozew" ukrywamy w komentarzach, ale KAŻDĄ taką wiadomość
  traktujemy jako sygnał obsługowy — sprawdzić zamówienie klienta i odpowiedzieć prywatnie
  (feedback score strony < 2 = kara delivery; to najczęstsza cicha śmierć konta COD).

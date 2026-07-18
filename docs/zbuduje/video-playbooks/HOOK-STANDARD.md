# HOOK-STANDARD fabryki video (18.07.2026)

Hook = pierwsze **1,7 s** (realne okno decyzji widza; 2-3 s to tylko próg pomiaru hook rate).
Benchmarki: hook rate elite 40%+, zdrowo 30%+, <25% = wymiana hooka. 65-75% odsłon umiera
przed 3. sekundą — hook to bramka do całej kreacji.

## Twarda zasada fabryki
Hook MUSI działać **bez dźwięku i bez napisów** (napisy Tomek dodaje osobno). Fundament =
typy czysto wizualne. Do każdej kreacji fabryka dołącza **SUGESTIĘ CAPTIONU HOOKOWEGO**
(pole `hook_caption_pl` w planie montażu / raporcie) — 4/5 viralowych wzorców niesie hook
animowanym napisem od klatki 1; ten napis dodaje narzędzie Tomka, my zostawiamy safe-zone
(góra ~200 px wolna).

## Ranking typów wizualnych → dobór per kategoria
1. **REZULTAT-NAJPIERW / before-after** (+40% completion) — beauty (implied, nie dosłowny
   split — policy!), czyszczenie (brud→czysto), auto detailing.
2. **SATISFYING/ASMR** (+20-40% completion) — czyszczenie, narzędzia (moc/wiór), myjki;
   w 1. sekundzie NATYWNY dźwięk produktu, nie muzyka.
3. **IN-MEDIAS-RES** — uniwersalny; start w ŚRODKU akcji, pierwsze cięcie match-on-action.
4. **PATTERN-INTERRUPT** (twarz wykrywana w 170 ms) — beauty/talking-head; makro twarzy,
   nagły zoom; BEZ startle-audio (platformy karzą reflexive-skip).
5. RUCH DO KAMERY / product-drop — gadżety, ALE **TYLKO gdy reveal JEST wow** (ładny packshot
   w ruchu ≠ wow). Dla gadżetów DOMYŚLNY typ = **PROBLEM-FIRST / specific-outcome** (brudna
   felga, śruba w ciasnej szczelinie — +35-45% retencji 3 s vs generic reveal). Anty-przykład
   z własnej produkcji: hook głośnika „jeden dotyk i biurko ożywa" = product-drop na CIEMNYM
   biurku — podwójne złamanie standardu (typ rank 5 + ciemny kadr).
6. POV/curiosity/negative — wsparcie tekstowo-narracyjne (w captionie Tomka), nie fundament.

## Anatomia pierwszej sekundy (checklist bramki hooka)
- Klatka 1: JEDNA idea; twarz LUB produkt-w-akcji DUŻY w kadrze (nie packshot na półce);
  safe-zone TikToka wolna; zero intro/logo/scene-settingu.
- 0,0-1,7 s: ruch JUŻ w klatce 1 (statyczny start = śmierć); produkt widoczny do 2 s;
  dźwięk od 1 s (głos/natywny dźwięk produktu); cięcie w środku ruchu.
- JASNOŚĆ: scena hooka jasna i wysokokontrastowa (audyt: nasze ciemne hooki = główny
  przegryw z wzorcami; lift cieni + saturacja na hooku obowiązkowy przy ciemnym materiale).
- Test wyjścia: czy w 1,7 s bez dźwięku i napisów widz wie CO to i CZEMU zostać?

## Technika COLD-OPEN (domyślna, $0)
Prepend **1,2 s money-shotu** z środka kreacji (najbardziej dynamiczny/kontrastowy moment,
crop-zoom 1,25×, lift jasności +0.05-0.10, saturacja 1.12, audio tego momentu = naturalny
głośny dźwięk akcji), potem body od 0 przycięte z końca do **≤16,0 s total**. Wzorzec
skryptu: sekcja hooków w pilot-lokowka / historia 18.07. Alternatywa premium: dedykowana
scena hookowa w blueprincie (klatka nano + FLF) wg typu z rankingu.

## Blueprint: krok „HOOK DESIGN" (obowiązkowy)
Przy dekonstrukcji wzorca operator NAZYWA typ hooka wzorca i ocenia (1-10) czy plan kreacji
odtwarza jego siłę; wybiera typ z rankingu dla kategorii; zapisuje `hook_caption_pl`.
Bramka klatek odrzuca hook: statyczny / **ciemny (twardy FAIL — bez wyjątków „dla wierności
kinowemu wzorcowi"; wierność SCHEMATOWI ≠ kopiowanie grade'u, który zabija thumbstop)** /
z małym produktem / z intro / product-drop bez realnego wow.

## LOOP CLOSE — bliźniak hooka (koniec = powrót do początku)
Pętla to drugi biegun tej samej bramki: hook otwiera, LOOP CLOSE oddaje widza hookowi.
Wymogi (SSOT 0c): ostatnia klatka = echo pierwszej (kadr/światło/pozycja produktu; projektowana
w blueprincie RAZEM z klatką hooka — para first↔last domyka koło); audio ciągłe przez granicę
(bez akcentu-stopu); ostatnia linia VO ustawia pierwszą. Bramka KROK 10: „czy ostatnia klatka
wraca do hooka?" — NIE = popraw scenę CTA, zanim oddasz kreację. Pętla kompozycyjna,
nie rewind/reset (gadżet = odrzut).

## GOTCHA: Kling FLF SPRZĘGA produkt z akcją (drapek 19.07)
Gdy scena pokazuje performera w kontekście czynności silnie skojarzonej z produktem
(np. pielęgnacja pazurów), FLF **wstrzykuje produkt nawet gdy pierwsza I ostatnia klatka
go nie mają** — odporne na negatywy i przekadrowanie (2× identyczna halucynacja).
Dla „problem-hooka BEZ produktu": (a) trim czystego okna klipu (fantom zwykle wchodzi
po ~1 s), (b) osobny bardzo krótki klip hookowy, (c) sceneria bez „stołu roboczego".

## Anty-wzorce
Intro/logo na starcie · clickbait (wysoki hook rate + hold <25% = odrzut; waliduj CPA)
· startle-audio · packshot bez ruchu · zależność od napisu · dosłowny before-after w beauty.

## Test hooków (po akceptacji jakości bazowej)
Hook-swap na wspólnym rdzeniu: zmieniaj TYLKO 1-3 s. **PACK = MAX 3 WERSJE (decyzja Tomka
19.07): baza + do 2 wariantów hooka** (cold-open re-cut $0 · świeże ujęcie FLF ~$0,45) —
różne TYPY z rankingu, nie odcienie tego samego. Hook zużywa się (−37%/7 dni) → refresh
triggerowany CPM/frequency, nie kalendarzem.

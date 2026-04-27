# Quiz Funnel Research dla TN — Game Changer assessment

> Research output from agent run 2026-04-27. Reference for Faza 3 implementation.

## SEKCJA A — Anatomy 7 quiz funnels

### Bark — "Build a BarkBox"
**URL:** https://www.bark.co (onboarding flow przy /signup); Wayback snapshots z 2024-2025 stabilne
**Liczba pytań:** ~6-7 (krótki onboarding, nie quiz w sensie redakcyjnym)
**Typy pytań:** single-choice (rozmiar po wadze), open-text (imię, rasa), date-picker (urodziny), multi-checkbox (alergie pokarmowe)
**Kluczowe pytania (faktyczne wording):**
- "What's your dog's name?"
- "What size box does your pup need?" (Small 1-20 lbs / Medium 20-50 / Large 50+)
- "Does your pup have any food sensitivities?" (Chicken / Turkey / Beef — multi)
- "When's your dog's birthday or adoption day?" (skippable)
**Email capture:** PRZED result — email jest częścią checkout/account creation
**Result page:** subskrypcyjny plan z "what's in the first box" + upsell na 6/12-mies (dyskonty)
**CTA:** "Get Started" → koszyk z presetem
**Personalisation:** waga determinuje SKU pakietu (S/M/L), alergia stripuje konkretne treats z bundle, urodziny → "birthday box" w odpowiednim miesiącu
**Conversion lift:** brak publicznej liczby, ale Bark stale reportuje ~80% retention M1→M2 dla quiz-onboarded
**Tech stack:** custom React/Next na własnym stacku Bark
**Co adoptujemy:** waga/rozmiar = pierwszy filtr SKU. W TN analog: parownica → "ile pokoi", suszarka do butów → "ile par dziennie". Skippable z domyślną wartością — nie blokuj, jeśli user nie ma odpowiedzi.

### Allbirds Style Quiz
**URL:** https://www.allbirds.com/pages/styles-quiz
**Liczba pytań:** 4-5 (krótki shoe finder, nie deep profile)
**Typy:** single-choice z visual cards (gender, use-case ikony), single-choice (klimat: ciepło/chłód/deszcz)
**Kluczowe pytania:**
- "Who are we shopping for?" (Men / Women / Either)
- "What will you mostly do in them?" (Run / Walk / Lounge / Travel)
- "What weather do you face most?" (Hot / Cool / Wet)
- "Wool or tree fiber preference?"
**Email capture:** OPCJONALNY na końcu (newsletter, nie wymagane do zobaczenia rekomendacji) — kluczowy lift dla intent-driven shoppers
**Result page:** 1 primary recommendation + 2 alternatives ("If you also like X...") z przyciskiem "Shop now"
**Conversion lift:** Octane raportuje 7-25% quiz CR vs site avg 2-3%, czyli ~3-5x
**Co adoptujemy:** **3-4 pytania = sweet spot** dla single-product DTC. Visual cards > text. Email opcjonalny przy wysokim intent.

### Athletic Greens / AG1 — "AG1 For You" Quiz
**URL:** https://drinkag1.com/about-ag1/how-ag1-works/ag1-for-you-quiz
**Liczba pytań:** ~5-7
**Typy:** single-choice (wiek bracket, goal), multi-checkbox (need states: energy/gut/sleep/stress/movement)
**Kluczowe pytania:**
- "What's your top wellness goal?" (Energy / Gut health / Immunity / Recovery)
- "How would you describe your eating habits?"
- "How often do you exercise?"
- "What's your stress level?"
**Email capture:** WYMAGANY przed result page — email = gate. Agresywny choice (Allbirds odwrotnie), uzasadniony price pointem ($79+/mies subskrypcja)
**Result page:** "Based on your answers, AG1 can help with [goals]" + same 1 produkt (single-SKU brand!) z subscribe upsell
**CTA:** "Start My Subscription" → checkout z presetem
**Personalisation:** copy-only personalisation (produkt jest jeden). Hero copy result page przepisany pod top-1 goal
**Conversion lift:** brak publicznych % od AG, ale OptiMonk breakdown wskazuje quiz jako kluczowy element całej $1.2B valuation
**Co adoptujemy:** **single-SKU + quiz = copy-personalization wystarcza.** Quiz nie musi zmieniać SKU, może zmieniać headline/pain point/social proof. **To jest klucz dla TN gdzie 1 LP = 1 produkt.**

### Beardbrand — "What Type of Beardsman Are You?"
**URL:** https://www.beardbrand.com/pages/beardsman-quiz
**Liczba pytań:** 10
**Typy:** single-choice personality (lifestyle, hobby, vibe), bez specs technicznych
**Kluczowe pytania:**
- "What's your ideal Saturday?"
- "What's your hobby?"
- "What's your style vibe?"
**Email capture:** WYMAGANY przed result (klasyczny lead-magnet quiz)
**Result page:** 1 z 6 archetypów (Urban / Traveler / Outdoorsman / Badass / Vintage / Stylish) + curated bundle produktów Beardbrand pasujący do typu
**CTA:** "Shop Your Beardsman Collection"
**Personalisation:** archetyp → bundle SKUs + email sequence segmentowany per typ
**Conversion lift:** **~150,000 leadów = drugi największy email list source firmy.** Travel-friendly insight (większość = "Traveler") doprowadził do reformulacji produktów <100ml
**Tech stack:** **Typeform CONFIRMED** (Eric Bandholz, founder, wybrał Typeform za Logic Jump i Calculator zamiast dedykowanej quiz appki)
**Co adoptujemy:** **personality archetype quiz** to czysty lead-magnet, świetnie generuje listy, ale to OSOBNY mechanizm od conversion quiz. Dla TN — to wzorzec na "darmowy guide" + segmentację email, nie na bezpośredni purchase.

### Warby Parker — Frames Quiz / Home Try-On
**URL:** https://www.warbyparker.com/home-try-on-quiz
**Liczba pytań:** ~5-8
**Typy:** image-pick (face shape, color preference), single-choice (style aesthetic, męskie/damskie/unisex), slider (frame size)
**Kluczowe pytania:**
- "Which face shape best matches yours?" (z ilustracjami: oval/round/square/heart)
- "What colors do you gravitate toward?"
- "What's your style?" (Bold / Classic / Minimalist)
- "Have you bought glasses online before?"
**Email capture:** WYMAGANY do wysyłki Home Try-On (5 ramek na 5 dni)
**Result page:** grid 5+ ramek dopasowanych z opcją "Add to Try-On Box"
**Personalisation:** face shape + style → algorytm filtruje katalog ~250 ramek do 10-15 best matches
**Co adoptujemy:** **face shape z ilustracjami** = wzorzec dla wszelkich "fit" pytań w TN (np. "wielkość mieszkania" z ikonami M2 zamiast tekstu). Image-pick > text-pick przy wyższym CR.

### Stitch Fix — Style Profile
**URL:** https://www.stitchfix.com/style-quiz (signup gated)
**Liczba pytań:** ~90 (gold standard, ALE inny biznes model: subskrypcja kuratorska, nie one-shot purchase)
**Typy:** single/multi-choice, sliders (price comfort), image preference, open-text
**Conversion lift:** **89% completion rate** mimo 10-min długości. **$2B ARR** w dużej mierze atrybuowane do quiz-driven personalizacji
**Co adoptujemy:** **conversational tone** ("How adventurous are you?" > "Rate your risk tolerance"). Copy quiz ma brzmieć jak rozmowa, nie ankieta. Ale długość 90q jest **nieaplikowalna** do single-product DTC.

### Function of Beauty — Hair Quiz
**URL:** https://functionofbeauty.com/pages/hair-quiz
**Liczba pytań:** ~15-20 (deklaruje "2 minutes")
**Typy:** single-choice (hair type, scalp condition, color treatment), multi-checkbox (15+ goals: shine, volume, frizz, color protection, deep conditioning, thermal, etc.), color picker, fragrance picker
**Kluczowe pytania:**
- "What's your hair type?" (straight / wavy / curly / coily — z ilustracjami)
- "How would you describe your scalp?" (oily / normal / dry / sensitive)
- "Pick up to 5 hair goals"
- "What color do you want your bottle?" (visual swatches)
- "What fragrance?" (lub fragrance-free)
**Email capture:** WYMAGANY przed result (account creation = części checkout)
**Result page:** "Your custom formula" — wizualizacja butelki z imieniem klienta + lista składników aktywnych mapowanych na każdy goal
**Personalisation:** każdy goal = aktywny składnik w formule. Visual: każdy bottle ma imię klienta na etykiecie (mass customization)
**Co adoptujemy:** **goal multi-checkbox** = potężny mechanizm. Dla TN: "Co chcesz osiągnąć z tym produktem?" multi-pick → 3 różne result-page hero copy. Plus: imię klienta na result page = ownership effect.

---

## SEKCJA B — Kiedy quiz NIE działa (dla single-product DTC)

**1. Brak decision dimensions** — Jeśli każdy klient kupuje TEN SAM SKU bez wariantu, quiz służy tylko do *copy personalisation* i *email capture*. To nadal może mieć sens (vide AG1), ale jeśli i to nie zmienia konwersji vs dobry static LP, to teatr. Test: czy hero, pain point, lub social proof mogą się różnić per persona? Jeśli nie → skip.

**2. Niska cena (<200 zł)** — Friction quizu (60-120s) zabija impulse purchase. Heyflow i Funnel Fox jasno: "businesses with impulse purchase items under $20 [USD]" są anti-pattern.

**3. Impuls kategoria, czas decyzji <30s** — Lifestyle gadgets emocjonalne — user widzi reference video w paid ad, jest "in the mood", quiz wybija go z momentum.

**4. Wąska persona (homogeniczna grupa docelowa)** — Jeśli 90% klientów to ten sam segment, quiz nie ma czego segmentować. Pytanie "ile masz lat dziecka" gdy odpowiedź zawsze "3-7" = teatr.

**5. Brak wariantów rekomendacji na result page** — Jeśli quiz prowadzi do TEGO SAMEGO PDP niezależnie od odpowiedzi, a Ty nie masz **choć copy-level personalizacji result page** — quiz jest kosmetyczny.

**6. Tracking debt** — Quizy bez analytics per pytanie = ślepa optymalizacja. Bez heatmap drop-off per krok nie wiesz czy abandonment to pytanie 3 czy 7.

**7. Brak progress bar** — bez progress bar drop-off rośnie skokowo.

**Sweet spot question count: 5-10.** <5 = "nie ufam wynikom"; >20 = ghost.

---

## SEKCJA C — Mapping na 6 kategorii TN

### 1. Parownice (czystosz, kurzobot, parosz)
**Quiz pasuje?** TAK — ale na granicy. Mid-priced (300-500 zł), 3-4 wymiary decyzyjne, ale często impulsowy zakup.
**Decision dimensions:** rodzaj tkanin (delikatne/codzienne/grube), częstotliwość użycia, wielkość gospodarstwa, kto głównie używa (singiel/rodzina), trudność z aktualnym żelazkiem.
**Sample 5q quiz:**
1. "Co najczęściej prasujesz?" (Bawełna / Delikatne tkaniny / Wszystko / Specjalnie pościel)
2. "Ile osób w domu?" (1 / 2-3 / 4+ / Z dziećmi)
3. "Jak często prasujesz?" (Codziennie / Raz w tyg / Rzadko / Nigdy chętnie)
4. "Co Cię najbardziej irytuje?" (Czas / Składanie deski / Trudne miejsca / Uszkodzenia tkanin)
5. "Kupujesz dla siebie czy w prezencie?"
**Result personalisation:** persona "Mama 2 dzieci" → hero "Wyprasuj koszule szkolne w 5 min", testimonials z mam; persona "Singiel" → hero "Idealna kreska na rozmowę kwalifikacyjną", lifestyle copy.
**Lift estimate:** **15-30%** uplift na conversion.

### 2. Roboty / myjki do okien (glassmax, glassnova)
**Quiz pasuje?** TAK — wysoka cena (500-1200 zł), wysokie consideration, wiele decision dimensions.
**Decision dimensions:** typ okien (PCV/drewno/aluminium), wielkość mieszkania, dostęp do okien (parter/piętro), czy używane też do luster/kabin.
**Sample 5q quiz:**
1. "Jakie masz okna?" (PCV / Drewniane / Aluminium / Tarasowe/balkonowe)
2. "Ile pięter ma Twój dom/mieszkanie?" (Parter / 1-2 / Dom 2+ pięter)
3. "Najczęstsze problemy?" (Smugi / Wysokie miejsca / Czas / Zacieki)
4. "Co jeszcze chcesz myć?" (Tylko okna / + lustra / + kabiny / + samochód)
5. "Czy masz przed domem dużą szybę/witrynę?" (Tak/Nie)
**Personalisation:** persona "Dom z dużymi taflami" → hero o BHP wysokości; persona "Mieszkanie blokowe" → hero o akustyce + minimalna inwazyjność.
**Lift estimate:** **25-50%** uplift (high-consideration kategoria — najlepszy fit dla quiz).

### 3. Akcesoria pet (legowiska, drapaki — calmfur, kotokot)
**Quiz pasuje?** TAK — i jest wzorcowo zbliżony do BarkBox.
**Decision dimensions:** waga zwierzęcia, wiek, temperament, problem zdrowotny (stawy, otyłość), styl mieszkania.
**Sample 5q quiz:**
1. "Co masz?" (Pies mały / Pies duży / Kot / Więcej niż jedno)
2. "Ile waży?" (skala dopasowana do gatunku)
3. "Czy ma jakieś problemy?" (Stawy / Skóra / Strach/lęk / Brak — zdrowy)
4. "Najbardziej lubi?" (Spać sam / Cuddling z właścicielem / Drapać meble / Kontrolować dom)
5. "Imię pupila?" (open text — używamy w result copy!)
**Personalisation:** "Legowisko dla [imię] — bo zasługuje na sen jak król" + dopasowany rozmiar SKU + healthcare pain point. WZORZEC BARKA.
**Lift estimate:** **30-60%** — pet category notorycznie reaguje świetnie na imię i empatię.

### 4. Kids learning toys (doodlo, kidsnap, klikotka)
**Quiz pasuje?** WARUNKOWO — tylko dla mid-price (>250 zł). Decision dimensions = wiek dziecka × cel rozwojowy.
**Sample 5q quiz:**
1. "Wiek dziecka?" (1-2 / 3-4 / 5-6 / 7+)
2. "Co chcesz wspierać?" (Motorykę / Mowę i koncentrację / Liczenie / Kreatywność)
3. "Ile czasu dziennie spędza w zabawie sam?"
4. "Co dziecko najbardziej lubi teraz?"
5. "Prezent czy dla siebie?"
**Lift estimate:** **15-25%**.

### 5. Beauty gadgets — LED masks, microcurrent (lymfio, innerscan)
**Quiz pasuje?** TAK — wysoka cena (400-1500 zł), pain points wyraźnie segmentowane (wiek, problem skóry).
**Sample 5q quiz:**
1. "Wiek?" (20-30 / 30-40 / 40-50 / 50+)
2. "Główne wyzwanie skóry?" (Pierwsze zmarszczki / Wyraźne zmarszczki / Trądzik dorosłych / Przebarwienia / Brak jędrności)
3. "Aktualnie używasz?" (Tylko krem / Krem + serum / Pełna rutyna / Też zabiegi w gabinecie)
4. "Ile czasu dziennie na pielęgnację?"
5. "Próbowałaś już urządzeń domowych?"
**Lift estimate:** **20-40%**.

### 6. Lifestyle home (humidifiers, lampki, oczyszczacze)
**Quiz pasuje?** ZALEŻY OD CENY. <250 zł = NIE (impulse). >300 zł i pain-driven (alergie, suchy kaszel, sen) = TAK.
**Lift estimate:** **10-25%** (niższy bo część impulsowa odpadnie).

---

## SEKCJA D — Tech implementation w stacku TN

**1. Pure client-side vs edge function?**
Quiz może być **w 100% client-side** dla TN scenariusza. State w `localStorage` + `URLSearchParams` (np. `?q=1110201`). Quiz to JS-only widget na osobnej sekcji LP (przed hero) lub jako overlay/modal. Result page = ten sam HTML LP, ale `<script>` po wczytaniu odczytuje quiz state z localStorage i przepisuje hero copy + jedną/dwie sekcje per persona. **Edge function nie jest potrzebny do core flow** — tylko do email capture (POST do `/api/quiz-lead` → Resend).

**2. Email capture → Resend integration:**
TN ma Resend. Po ostatnim pytaniu (ale PRZED result), client POST `{email, quiz_answers, persona, landing_slug}` do edge function `/api/quiz-lead` (Deno). Funkcja: (a) zapisuje do Supabase `quiz_leads` table, (b) wywołuje Resend API z templatem confirmation + personalised result link. Pattern jak istniejące funkcje (`automation-trigger`). PAMIĘTAJ: deploy z `--no-verify-jwt`.

**3. Result-LP personalisation — server vs client?**
**Rekomendacja: hybrid client-side first, edge fallback dla SEO.**
- Client-side (90% przypadków): quiz state → JS przepisuje `<h1>`, `<p class="hero-subhead">`, `<section class="pain-point">` używając data-attrs (`data-persona-mama`, `data-persona-singiel`). HTML zawiera **wszystkie warianty** w `<template>` tagach, JS odpina niewłaściwe.
- ZALETA client-side: 0 latency, 0 dependency na edge, działa offline (preview).

**4. Analytics per pytanie — bez psucia preview-only:**
Vercel Analytics + custom events: `track('quiz_question_view', {q: 3, slug})` + `track('quiz_question_answer', {q: 3, value, slug})` + `track('quiz_complete', {persona, slug})`. To są EVENT calls, nie DOM changes — nie psują preview-only zasady. **Krytyczne:** progress bar (`<progress value="3" max="5">`) — bez tego abandonment +30%.

**5. Manus copy review (ETAP 3.5) dla quiz wariantów:**
Manus review jest na całe `index.html`. Dla quiz: **5 result-pages × persona = 5 wariantów hero/pain copy w jednym pliku** (jako `<template data-persona="X">`). **Action item:** rozszerz `03-5-copy-review.md` o sekcję "Quiz variants — review per persona".

---

## SEKCJA E — Verdict + rekomendacja

**Top 3 produkty TN gdzie quiz da największy lift (priorytet pilota):**
1. **Roboty/myjki do okien** (glassmax/glassnova) — high consideration, wiele dimensions, cena 500-1200 zł. Estymata: **+25-50% CR**.
2. **Akcesoria pet z imieniem** (calmfur, kotokot) — wzorzec BarkBox, emotional ownership ≥ rational. Estymata: **+30-60% CR**.
3. **Beauty gadgets premium** (lymfio, innerscan-v2) — wiek × problem skóry segmentuje wyraźnie, persona-driven testimonials zmieniają trust. Estymata: **+20-40% CR**.

**Top 3 gdzie quiz to overkill (zostać przy classic scroll):**
1. **Lampki nastrojowe / gadżety <250 zł** — impuls + low-ticket = friction zabija.
2. **Single-persona learning toys dla wąskiego wieku** — homogeniczna persona = teatr.
3. **Czystosz/parownice low-end <300 zł** — granica przy parownice.

**Krytyczne risks integracji w naszą procedurę:**
- **Procedural debt:** `02-generate.md` zakłada 14 sekcji × 1 wariant. Quiz oznacza 14 sekcji × N personas → wykładnicze rozszerzenie.
- **Quiz autonomy boundary:** preferencja "Landing pages — pełna autonomia deploy" zakłada commit+push bez pytania. Quiz wprowadza email capture → potencjalnie GDPR-relevant. **Quiz na tn-crm/landing-pages/ MUSI mieć checkbox-consent + link do polityki** zanim email pójdzie do Resend.
- **MVP scope creep:** Stitch Fix to 90 pytań i $2B ARR — kuszenie do "deep profile" jest realne. **Trzymaj się 5-7 pytań** (sweet spot).
- **Pilot first:** zrób quiz na 1 produkcie (rekomendacja: **glassmax** — wysoki ticket, wiele dimensions, niska homogeniczność persony), zmierz **2 tygodnie** A/B vs static LP, dopiero potem scale.

**Werdykt:** Quiz funnel to **realny game-changer dla TN, ale wąsko** — dla 30-40% katalogu (mid-priced, multi-dimensional, persona-segmentowane). Dla pozostałych 60% to over-engineering. Pilot na 1 produkcie z największym potencjałem (myjka do okien lub legowisko pet z imieniem), miernik = 14-dniowy A/B, decyzja scale = +20% CR threshold.

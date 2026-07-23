# -*- coding: utf-8 -*-
"""Pary MOBILE makiet SSAWEK (F2.4): mobile WSZYSTKICH sekcji, PROJEKT OD ZERA pod 390px (nie
scisniety desktop). 2:3. Ref: desktop makieta (tresc, image1) + styl-master (styl, image2).
Copy VERBATIM. Uzycie: python gen-mobile.py all | 01-hero ..."""
import os, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
import genlib as G
from common import DNA, PROD, ANAT, HEAD_M, EXCL

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
STYL = os.path.join(HERE, 'brand', '00-styl-master.png')
STYLU = G.PUB + 'bud-assets/ssawek/brand/00-styl-master.webp'
MAKU = G.PUB + 'bud-assets/ssawek/makiety/'

NEG_PERSON = (' NEG scene with person: no clinic, no glossy showroom, no bikini/glamour, no child, '
              'no face emphasised — a real practical householder. ')

TASKS = {
 '01-hero': ('prod', PROD + (
    'MOBILE HERO, fold-first, archetype C (offer card overlapping the stage), designed for a '
    'looping hero-video. A compact top strip with the "Popiolek" wordmark only (NO floating '
    'trust-chip or badge on the scene). Then the STAGE at the top taking AT MOST ~44-48% of the '
    'board height: the red-lidded stainless canister on a warm hearth with a DENSE COHERENT RIBBON '
    'of grey ash being drawn into the nozzle (a solid smoke-like plume, NOT scattered dust) — the '
    'dominant physical motion carrier, unclipped, product razor-sharp. Then an OFFER CARD (off-'
    'white, radius 14, one chamfered S6 corner) overlapping the stage bottom: eyebrow "SEZON '
    'GRZEWCZY BEZ SYFU"; H1 in Barlow Semi Condensed, 2-3 short lines "Wciaga goracy popiol, '
    'ktorego boi sie domowy odkurzacz." with a vermilion swash under "popiol"; MAX ONE Hanken '
    'benefit line "Stalowy zbiornik, bezworkowe filtry, dmuchawa i tryb mokro/sucho."; then a '
    'DISTINCT offer block with margin: price "119 zl" big in Barlow, a full-width vermilion #C2381B '
    'CTA "Zamawiam — 119 zl", a risk line "Platnosc przy odbiorze • Zwrot 14 dni", and a wrapping '
    'row of small trust pills "Platnosc przy odbiorze", "Zwrot 14 dni", "Wysylka z Polski". HARD '
    'RULE: the price "119 zl" and the CTA MUST sit inside the first phone fold with clear margin — '
    'the stage must never push them below the fold. No star ratings anywhere in the hero.')),

 '02-zaufanie': ('styl', (
    'MOBILE trust band on sand #E9E1D3, code/CSS, NO product. THREE cells STACKED vertically (one '
    'per row, NEVER 3 side-by-side at 390px), each a thin 1.75px ink OUTLINE icon + title + one '
    'line: "Platnosc przy odbiorze" / "Placisz kurierowi dopiero, gdy odbierzesz paczke."; "Zwrot '
    '14 dni" / "Nie pasuje? Odsylasz w 14 dni, bez tlumaczenia."; "Wysylka z Polski" / "Wysylamy z '
    'polskiego magazynu, nie z Chin." Hairline separators, one chamfered S6 corner on the band. No '
    'prices, no stars, no product image.')),

 '03-problem': ('styl', ANAT + (
    'MOBILE stack, the PAIN WITHOUT our product: the lifestyle scene photo on TOP (~42%) — a '
    'householder scooping cold grey ash with a hand SHOVEL into a metal bucket, a cloud of ash '
    'billowing up, dusty and messy; ABSOLUTELY NO vacuum and NO product of ours in the frame. Then '
    'the copy: eyebrow "ZNASZ TO?"; H2 in Barlow Semi Condensed "Szufelka, chmura popiolu i domowy '
    'odkurzacz, ktory tego nie przezyje." with a vermilion swash under "chmura"; a Hanken body '
    '"Wybieranie popiolu szufelka to pyl na pol pokoju. Domowy odkurzacz z plastikowym zbiornikiem '
    'zapycha sie, grzeje i nie znosi goracego popiolu."; a small ink note "Do tego brud, worki i '
    'ciagle czyszczenie." No CTA button.' + NEG_PERSON)),

 '04-rozwiazanie': ('prod', PROD + (
    'MOBILE stack, the SOLUTION: the product scene on TOP (~42%) — the red-lidded stainless vacuum '
    'cleanly drawing a stream of grey ash into its steel tank at a hearth, calm and in control. '
    'Then copy: eyebrow "JEDEN SPRZET ZAMIAST NISZCZENIA DOMOWEGO"; H2 in Barlow Semi Condensed '
    '"Stalowy zbiornik zjada goracy popiol i nie odpuszcza." with a vermilion swash under '
    '"stalowy"; THREE micro-benefits STACKED (one per row, thin ink OUTLINE icon + bold Barlow '
    'label + Hanken line): "Stalowy, zaroodporny zbiornik" / "Znosi goracy popiol — stal, nie '
    'plastik."; "Bezworkowy, 3 filtry na przemian" / "Zero dokupowania workow."; "Dmuchawa i tryb '
    'mokro/sucho" / "Odkurzy, zdmuchnie liscie i zbierze wode."; a vermilion text link "Zobacz, jak '
    'dziala →". No CTA button.')),

 '05-demo': ('prod', PROD + (
    'MOBILE TOR-I stack (must show THREE STATES): header eyebrow "PROSTE JAK RAZ-DWA-TRZY"; H2 in '
    'Barlow Semi Condensed "Wepnij, wciagnij, wytrzep filtr." with a vermilion swash under '
    '"wciagnij"; Hanken intro "Trzy kroki — bez workow, bez kombinowania." Then THREE step cards '
    'STACKED vertically (one per row, NEVER side-by-side, each with an in-card number 01/02/03 in '
    'Barlow and one chamfered S6 corner): card 01 photo = clipping the wand/hose onto the vacuum, '
    'caption "Wepnij waz i rure"; card 02 photo = the nozzle drawing grey ash from a hearth floor, '
    'caption "Wciagnij popiol, gruz lub wode"; card 03 photo = tapping out the grey basket filter '
    'over a bin, caption "Wytrzep filtr koszowy i uzyj kolejnego". A small ink note "Filtry '
    'pierzesz i uzywasz na przemian."; a full-width vermilion #C2381B CTA "Zamawiam Popiolka — 119 '
    'zl". NEG: never let a product image overlap or cover the CTA — the CTA text stays fully '
    'legible on a clean vermilion button.')),

 '06-zastosowania': ('prod', PROD + (
    'MOBILE editorial stack: eyebrow "NIE TYLKO POPIOL"; H2 in Barlow Semi Condensed "Kominek, '
    'gruz, warsztat, auto i dzialka." with a vermilion swash under "warsztat"; Hanken line "Jeden '
    'sprzet na brudna robote w calym domu i wokol niego." Then FOUR cards STACKED vertically (one '
    'per row, photo + caption below — NEVER a 2x2 grid at 390px), always the red-lidded vacuum in a '
    'real setting: "Kominek, koza i piec na pellet", "Gruz i gips po remoncie", "Warsztat, garaz i '
    'auto", "Dzialka — dmuchawa na liscie". A small ink note "Funkcja dmuchawy: zamiast wciagac — '
    'zdmuchuje." No CTA button.' + NEG_PERSON)),

 '07-zestaw': ('zestaw', (
    'MOBILE stack: the accessories packshot (image 1, faithful) on an off-white card on TOP (one '
    'chamfered S6 corner); eyebrow "KOMPLET NA START"; H2 in Barlow Semi Condensed "9 elementow w '
    'zestawie — nic nie dokupujesz." with a vermilion swash under "9"; then a SINGLE-column list '
    '(never two columns at 390px), each a thin ink OUTLINE bullet + Hanken label: "3x wielorazowy '
    'filtr koszowy", "Zmywalny filtr HEPA", "Okragla metalowa ssawka", "Szczelinowa metalowa '
    'ssawka", "3x rura ssaca 30 cm", "Metalowy waz ssacy 1,5 m", "Ssawka podlogowa 2w1 mokro/'
    'sucho", "Redukcja do elektronarzedzi", "Instrukcja PL"; a small ink note "Bezworkowy — filtry '
    'pierzesz i uzywasz na przemian." No CTA, no price.')),

 '08-porownanie': ('prod', PROD + (
    'MOBILE comparison stack (code-style sand card): eyebrow "UCZCIWIE"; H2 in Barlow Semi '
    'Condensed "Popiolek vs zwykly domowy odkurzacz." with a vermilion swash under "Popiolek". A '
    'compact two-column table that FITS a phone: a header row "Popiolek" (with a tiny faithful '
    'vacuum thumbnail) vs "Domowy", then rows each with a thin ink OUTLINE check on the Popiolek '
    'side and a cross on the other: "Goracy popiol" -> "Stalowy zbiornik" vs "Plastik sie topi"; '
    '"Worki" -> "Bezworkowy, 3 filtry" vs "Ciagle dokupujesz"; "Gruz i woda" -> "Mokro/sucho + '
    'dmuchawa" vs "Zapycha sie"; "Zbiornik" -> "20 l stali" vs "Maly plastik". Then ONE honest '
    'minus row, no cross: "Glosnosc" -> "Tak, jest glosny — do popiolu wystarczy chwila." A small '
    'ink note "Do bardzo drobnego pylu stukaj filtr czesciej." No CTA. No star ratings.')),

 '09-mid-cta': ('prod', PROD + (
    'MOBILE decision banner card: a full warm workshop scene on TOP (~40%) with the red-lidded '
    'vacuum; then a sand card: eyebrow "GOTOWY NA SEZON"; H2 in Barlow Semi Condensed "Zamow '
    'Popiolka i miej brudna robote z glowy." with a vermilion swash under "Popiolka"; price "119 '
    'zl" big in Barlow; a full-width vermilion #C2381B CTA "Zamawiam — 119 zl"; a risk line '
    '"Platnosc przy odbiorze • Zwrot 14 dni • Wysylka z Polski". One chamfered S6 corner. No star '
    'ratings.')),

 '10-opinie': ('styl', (
    'MOBILE reviews stack, code-style, framed cards, BELOW the fold: eyebrow "CO MOWIA KUPUJACY"; '
    'H2 in Barlow Semi Condensed "Realne opinie — z plusami i minusami." with a vermilion swash '
    'under "Realne"; a small summary line with the only star glyphs (vermilion) "★ 4,72 / 5 — 2458 '
    'ocen, 650 opinii". Then FIVE quote cards STACKED vertically (one per row, off-white, 1px '
    'hairline, one chamfered S6 corner, a small vermilion star row and an initial): "Bardzo dobrze '
    'wciaga popiol. Glosny, ale szybko ogarnia kominek. Za te pieniadze naprawde warto." — Marek '
    '(5 stars); "3 filtry w zestawie — mozna prac na przemian. Ciagnie mocno." — Ania (5 stars); '
    '"Kupilem do czyszczenia pieca na pellet — swietny. Maly i porezny." — Tomasz (5 stars); "Do '
    'kominka super, halas w normie. Auta nim nie odkurzysz." — Piotr (3 stars); "Cena niska, '
    'wykonanie ok, ale do bardzo drobnego pylu filtr zapycha sie czesto." — Kasia (3 stars). '
    'Honest mix. No CTA button.')),

 '11-galeria': ('prod', PROD + (
    'MOBILE gallery stack: eyebrow "ZOBACZ Z BLISKA"; H2 in Barlow Semi Condensed "Popiolek w '
    'kadrze." with a vermilion swash under "kadrze". Then a 2-column grid of SIX square photo '
    'tiles (1:1, one chamfered S6 corner each) of the SAME red-lidded stainless vacuum: a full '
    'lifestyle carry shot, the red lid + rocker switch close-up, the white HEPA filter lifted out, '
    'the grey basket filter in the steel tank, a metal spring clamp closing, the black wheeled '
    'base; consistent warm grading, small ink caption chips. No CTA, no star ratings.')),

 '14-faq': ('prod', PROD + (
    'MOBILE FAQ stack: eyebrow "ZANIM ZAMOWISZ"; H2 in Barlow Semi Condensed "Konkretnie, bez '
    'owijania." An accordion of SIX full-width rows with hairline separators and thin ink "+"/"−" '
    'chevrons, the FIRST row expanded "Czy jest glosny?" with the answer "Tak, jest glosny — to '
    'cena mocy przemyslowej. Do wybrania popiolu z kominka wystarczy jednak chwila.", the rest '
    'collapsed (question only): "Czy poradzi sobie z goracym popiolem?", "Czemu waz sie elektryzuje '
    'i jak to rozladowac?", "Czy zbierze bardzo drobny pyl po szlifowaniu?", "Czy musze dokupowac '
    'worki?", "Jak place i czy moge zwrocic?". A small packshot of the red-lidded vacuum below the '
    'list on an off-white card. Only thin ink plus/minus visuals. NO anti-static ("antystatyczny") '
    'claim anywhere.')),

 '15-zamow': ('prod', PROD + (
    'MOBILE checkout skin stack, single variant, NO colour selector: eyebrow "ZAMOWIENIE"; H2 in '
    'Barlow Semi Condensed "Zamow Popiolka."; a compact product row (small faithful vacuum '
    'thumbnail + name "Popiolek — odkurzacz do popiolu, gruzu i warsztatu" + "Cena: 119 zl"); then '
    'STACKED white input fields (1px hairline, radius 8) "Imie i nazwisko", "Telefon", "E-mail", '
    '"Ulica i numer", "Kod pocztowy", "Miejscowosc", and an "Ilosc" stepper; payment pills '
    '"Platnosc przy odbiorze" (selected), "BLIK / online"; a summary BEFORE the button "Produkt: '
    '119 zl", "Dostawa: kurier — 15 zl", "Razem: 134 zl"; a full-width vermilion #C2381B CTA '
    '"Zamawiam z obowiazkiem zaplaty"; a small line "Platnosc przy odbiorze • Masz 14 dni na '
    'zwrot." No "darmowa dostawa", no delivery-time promise, no colour selector.')),

 '16-final': ('prod', PROD + (
    'MOBILE closing stack: a warm evening scene on TOP (~42%) — a tidy cosy Polish living room '
    'after a fire, the red-lidded steel vacuum standing ready by a clean hearth where flames '
    'flicker; then copy: eyebrow "PO KAZDYM PALENIU — PORZADEK"; H2 in Barlow Semi Condensed '
    '"Rozpal, posprzataj w minute, odpocznij." with a vermilion swash under "minute"; a Hanken line '
    '"Stalowy zbiornik, bezworkowe filtry i mocne ssanie — brudna robota ogarnieta."; price "119 '
    'zl" in Barlow; a full-width vermilion #C2381B CTA "Zamawiam Popiolka"; a risk line "Platnosc '
    'przy odbiorze • Zwrot 14 dni"; a minimalist footer with small ink links "Regulamin · Polityka '
    'prywatnosci · Dane sprzedawcy" (no shop name).')),
}


def refs_for(kind, section):
    d_local = os.path.join(OUT, '%s.png' % section)
    d_url = MAKU + '%s.webp' % section
    return ([d_local, STYL],
            [{'url': d_url, 'type': 'ref'}, {'url': STYLU, 'type': 'ref'}])


ANTI_BLEED = (' HARD ANTI-BLEED: Image 2 is a COLOUR/TYPE reference ONLY. DO NOT reproduce it. Output '
              'MUST be ONLY this one section and NOTHING else — absolutely NO design-system / '
              'specimen board, NO palette swatches or hex codes, NO tiles or labels like "PALETA / '
              'TYPOGRAFIA / SYGNATURA / PRODUKT / IKONY / SWIAT / S6 SERIA", NO "2000 W / 20 l / 4,7 '
              'kg" spec strip, NO row of outline benefit icons unless this section explicitly needs '
              'them. If any styl-master board content appears, the mockup is WRONG. ')


def gen(section):
    kind, body = TASKS[section]
    prompt = HEAD_M + body + EXCL + ANTI_BLEED + DNA
    local, edge = refs_for(kind, section)
    return G.generate(section, '%s-mobile.png' % section, prompt, local, edge, '2:3',
                      'ssawek-mm-%s' % section)


args = sys.argv[1:]
todo = list(TASKS) if (not args or args == ['all']) else args
ok, fail = [], []
with ThreadPoolExecutor(max_workers=4) as ex:
    futs = {ex.submit(gen, s): s for s in todo}
    for f in as_completed(futs):
        s = futs[f]
        try:
            ok.append(f.result()); print('OK', s)
        except Exception as e:
            fail.append(s); print('FAIL', s, str(e)[:180])
print('GOTOWE mobile: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))

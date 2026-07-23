# -*- coding: utf-8 -*-
"""Makiety DESKTOP SSAWEK (Popiolek) — F2, 3:2. local HIGH -> fallback edge MEDIUM.
Brief CELU (co/komu/po co) + PRAWDZIWE dane VERBATIM z KARTY (cena 119 zl, USP, specs, opinie).
Ref: prod-whole (fidelity) / zestaw g14 / styl-master (styl). Copy = KARTA/PLAN/PRZEWODNIK.
Uzycie: python gen-makiety.py all | 01-hero 03-problem ..."""
import os, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
import genlib as G
from common import DNA, PROD, ANAT, HEAD_D, EXCL

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
REFS = os.path.join(HERE, 'refs-cache')
PRODP = os.path.join(REFS, 'prod-whole.png')
ZESTP = os.path.join(REFS, 'zestaw.png')
STYL = os.path.join(HERE, 'brand', '00-styl-master.png')
PRODU = G.PUB + 'bud-assets/ssawek/refs/prod-whole.webp'
ZESTU = G.PUB + 'bud-assets/ssawek/refs/zestaw.webp'
STYLU = G.PUB + 'bud-assets/ssawek/brand/00-styl-master.webp'

NEG_PERSON = (' NEG scene with person: no white coat, no clinic/lab, no glossy showroom kitchen or '
              'catalogue living room, no bikini/glamour, no child operating the machine, no face '
              'emphasised, no fake smile — a real practical householder in a real home/garage. ')

# ── PROMPTY SEKCJI (brief celu; PRAWDZIWE stringi PL w cudzyslowach) ──
TASKS = {
 '01-hero': ('prod', HEAD_D + PROD + (
    'HERO, archetype C = a full-bleed photographic STAGE at the top with a mikro-offer CARD '
    'overlapping its lower edge. THE STAGE (this is the animated hero, designed for a looping '
    'hero-video): the stainless canister vacuum with the RED lid stands on a warm brick-and-concrete '
    'hearth beside a fireplace in warm evening light; a DENSE, COHERENT RIBBON / PLUME of fine grey '
    'fireplace ash and soot — like a thick rope of smoke, a solid visible volume, NOT scattered '
    'sparse dust specks — is being drawn in a soft spiral from the hearth into the vacuum nozzle. '
    'The ash plume is the DOMINANT physical motion carrier: give it generous room in the frame, '
    'clear of all text, never clipped by an edge; the product itself stays razor-sharp and still. '
    'Slim topbar on top: the "Popiolek" wordmark left (Barlow Semi Condensed ink) and enumerated '
    'nav links right, EXACTLY these three: "Zastosowania", "Zestaw", "FAQ" — never "Opinie". The '
    'OFFER CARD (off-white, radius 14, one chamfered S6 corner, warm layered shadow) overlaps the '
    'bottom of the stage on the left: eyebrow ALL-CAPS "SEZON GRZEWCZY BEZ SYFU"; a BIG Barlow Semi '
    'Condensed H1 "Wciaga goracy popiol, ktorego boi sie domowy odkurzacz." with a short soft '
    'vermilion #C2381B italic underline-swash under the single word "popiol"; one Hanken Grotesk '
    'subline "Stalowy zbiornik znosi zar, bezworkowy system z 3 filtrami, mocne ssanie i dmuchawa — '
    'jeden sprzet na kominek, gruz i warsztat."; a small product-name line "Popiolek — odkurzacz do '
    'popiolu, gruzu i warsztatu"; the price "119 zl" BIG in Barlow Semi Condensed; a full-width '
    'vermilion #C2381B CTA button "Zamawiam — 119 zl" (white text, radius 8); directly under the '
    'CTA a risk-reducer line "Platnosc przy odbiorze • Zwrot 14 dni"; then a row of three trust '
    'pills (sand fill, 1px hairline, ink text) "Platnosc przy odbiorze", "Zwrot 14 dni", "Wysylka z '
    'Polski". No star ratings and no review numbers anywhere in the hero.')),

 '02-zaufanie': ('styl', HEAD_D + (
    'SECTION "zaufanie" — a slim reassurance BAND on a sand band #E9E1D3 (code/CSS section, NO '
    'photography, NO product), the anti-scam risk reducer. THREE equal cells in one row, each with '
    'a thin 1.75px ink OUTLINE icon (never red) above a short label and a one-line note: cell 1 icon '
    'a hand-with-coin / cash-on-delivery — title "Platnosc przy odbiorze", note "Placisz kurierowi '
    'dopiero, gdy odbierzesz paczke."; cell 2 icon a return arrow — title "Zwrot 14 dni", note '
    '"Nie pasuje? Odsylasz w 14 dni, bez tlumaczenia."; cell 3 icon a Poland pin / parcel — title '
    '"Wysylka z Polski", note "Wysylamy z polskiego magazynu, nie z Chin." Thin hairline separators '
    'between cells, one chamfered S6 corner on the band. Calm, factual, one consistent icon set. NO '
    'prices, NO star ratings, NO product image.')),

 '03-problem': ('styl', HEAD_D + ANAT + (
    'SECTION "problem" — the PAIN, BEFORE, WITHOUT our product: a full-width lifestyle scene on the '
    'LEFT, copy on the RIGHT. THE SCENE (left): a householder crouched at a fireplace scooping cold '
    'grey ash with a small hand SHOVEL into a metal bucket; a cloud of fine ash billows up and '
    'settles as grime over the hearth and floor; frustrating, dusty, messy. ABSOLUTELY NO vacuum '
    'and NO product of ours anywhere in this frame — only the old shovel-and-bucket way. On the '
    'RIGHT a narrow text column on the sand page: eyebrow ALL-CAPS "ZNASZ TO?"; H2 in Barlow Semi '
    'Condensed ink "Szufelka, chmura popiolu i domowy odkurzacz, ktory tego nie przezyje." with a '
    'soft vermilion swash under the single word "chmura"; a Hanken Grotesk body paragraph "Wybieranie '
    'popiolu szufelka to pyl na pol pokoju. A domowy odkurzacz z plastikowym zbiornikiem zapycha sie, '
    'grzeje i nie znosi goracego popiolu. Znajomi wymieniaja tak kolejny sprzet."; a small ink note '
    '"Do tego brud, worki i ciagle czyszczenie." No CTA button. Icons, if any, thin ink outline.'
    + NEG_PERSON)),

 '04-rozwiazanie': ('prod', HEAD_D + PROD + (
    'SECTION "rozwiazanie" — the SOLUTION: the product ENTERS and fixes the pain. A full-width scene '
    'on the RIGHT, copy on the LEFT (zig-zag vs problem). THE SCENE (right): the same fireplace / '
    'garage, and now the stainless canister with the RED lid cleanly draws a controlled stream of '
    'grey ash into its steel tank — close enough to read the polished steel and the red lid, no mess '
    'escaping, calm and in control. On the LEFT copy on the sand page: eyebrow ALL-CAPS "JEDEN '
    'SPRZET ZAMIAST NISZCZENIA DOMOWEGO"; H2 in Barlow Semi Condensed ink "Stalowy zbiornik zjada '
    'goracy popiol i nie odpuszcza." with a soft vermilion swash under the single word "stalowy"; '
    'THREE short micro-benefits stacked, each a thin 1.75px ink OUTLINE icon + a bold Barlow label + '
    'a Hanken line: (1) "Stalowy, zaroodporny zbiornik" / "Znosi goracy popiol z kominka i pieca — '
    'stal nierdzewna, nie plastik."; (2) "Bezworkowy, 3 filtry na przemian" / "Zero dokupowania '
    'workow — filtry pierzesz i uzywasz na zmiane."; (3) "Dmuchawa i tryb mokro/sucho" / "Odkurzy, '
    'zdmuchnie liscie i zbierze wode — jeden sprzet."; a vermilion #C2381B text link with arrow '
    '"Zobacz, jak dziala →". No CTA button here.')),

 '05-demo': ('prod', HEAD_D + PROD + (
    'SECTION "demo" — a "jak dziala" 1-2-3 demonstrator (TOR-I: this mockup MUST show the THREE '
    'STATES as separate frames, not one static card). Header: eyebrow ALL-CAPS "PROSTE JAK RAZ-DWA-'
    'TRZY"; H2 in Barlow Semi Condensed ink "Wepnij, wciagnij, wytrzep filtr." with a soft vermilion '
    'swash under the single word "wciagnij"; one Hanken intro line "Trzy kroki — bez workow, bez '
    'kombinowania." THREE cards in a row, each a step FRAME with its own photo of the product in '
    'action and an in-card step number ("01", "02", "03" in Barlow — this is in-section step '
    'numbering, NOT section numbering), each with one chamfered S6 corner: card 01 photo = clipping '
    'the metal wand / hose onto the vacuum, caption "Wepnij waz i rure"; card 02 photo = the nozzle '
    'drawing grey ash / fine rubble from a hearth floor, caption "Wciagnij popiol, gruz lub wode"; '
    'card 03 photo = tapping out the grey basket filter over a bin, caption "Wytrzep filtr koszowy '
    'i uzyj kolejnego". Under the row a small ink note "Filtry pierzesz i uzywasz na przemian." Then '
    'a vermilion #C2381B CTA button "Zamawiam Popiolka — 119 zl".')),

 '06-zastosowania': ('prod', HEAD_D + PROD + (
    'SECTION "zastosowania" — breadth of use, wider than just ash. Header: eyebrow ALL-CAPS "NIE '
    'TYLKO POPIOL"; H2 in Barlow Semi Condensed ink "Kominek, gruz, warsztat, auto i dzialka." with '
    'a soft vermilion swash under the single word "warsztat"; one Hanken line "Jeden sprzet na '
    'brudna robote w calym domu i wokol niego." Then an ASYMMETRIC 2x2 photo mosaic (unequal tiles, '
    'each with one chamfered S6 corner), always the RED-lidded stainless vacuum in '
    'each, in a real practical setting, with a small ink caption chip: tile "Kominek, koza i piec na '
    'pellet" (drawing ash by a hearth); tile "Gruz i gips po remoncie" (rubble/plaster dust on a '
    'concrete floor); tile "Warsztat, garaz i auto" (wood shavings, a car nearby); tile "Dzialka — '
    'dmuchawa na liscie" (blowing leaves outdoors). A small ink note under the mosaic "Funkcja '
    'dmuchawy: zamiast wciagac — zdmuchuje." No CTA button.' + NEG_PERSON)),

 '07-zestaw': ('zestaw', HEAD_D + (
    'SECTION "zestaw" — "co dostajesz w zestawie", code-style on an off-white card with a clean '
    'accessories packshot. Image 1 = the real accessories packshot on a plain light background — '
    'reproduce those exact accessories faithfully. Header: eyebrow ALL-CAPS "KOMPLET NA START"; H2 '
    'in Barlow Semi Condensed ink "9 elementow w zestawie — nic nie dokupujesz." with a soft '
    'vermilion swash under the single word "9". Layout: on one side the accessories packshot on an '
    'off-white card (one chamfered S6 corner); on the other side a clean two-column list of nine '
    'items, each a thin ink OUTLINE bullet + Hanken label: "3x wielorazowy filtr koszowy", "Zmywalny '
    'filtr HEPA", "Okragla metalowa ssawka", "Szczelinowa metalowa ssawka", "3x rura ssaca 30 cm", '
    '"Metalowy waz ssacy 1,5 m", "Ssawka podlogowa 2w1 mokro/sucho", "Redukcja do elektronarzedzi", '
    '"Instrukcja PL". A small ink note "Bezworkowy — filtry pierzesz i uzywasz na przemian." No CTA '
    'button, no price.')),

 '08-porownanie': ('prod', HEAD_D + PROD + (
    'SECTION "porownanie" — an honest two-column comparison table (code-style, sand card). Header: '
    'eyebrow ALL-CAPS "UCZCIWIE"; H2 in Barlow Semi Condensed ink "Popiolek vs zwykly domowy '
    'odkurzacz." with a soft vermilion swash under the single word "Popiolek". A table with two '
    'column headers — LEFT "Popiolek" (a tiny faithful thumbnail of the red-lidded steel vacuum next '
    'to the name), RIGHT "Domowy odkurzacz" — and rows, each with a thin ink OUTLINE check on the '
    'Popiolek side and a thin ink OUTLINE cross on the other: row "Goracy popiol" -> "Stalowy '
    'zbiornik znosi zar" vs "Plastik topi sie i pachnie"; row "Worki" -> "Bezworkowy, 3 filtry" vs '
    '"Ciagle dokupujesz worki"; row "Gruz i woda" -> "Mokro/sucho + dmuchawa" vs "Zapycha sie i '
    'grzeje"; row "Zbiornik" -> "20 l stali" vs "Maly, plastikowy". Then ONE honest minus row, '
    'plainly stated, no cross: "Glosnosc" -> "Tak, jest glosny — to cena mocy przemyslowej; do '
    'popiolu wystarczy chwila." A small ink note "Do bardzo drobnego pylu (szlif gladzi) stukaj '
    'filtr czesciej — to nie odkurzacz do gladzi." No CTA button. NO star ratings.')),

 '09-mid-cta': ('prod', HEAD_D + PROD + (
    'SECTION "mid-cta" — a dedicated decision moment, full-bleed warm workshop scene with copy and a '
    'designed CTA on a sand scrim. THE SCENE: the red-lidded steel vacuum in warm workshop light, '
    'generous negative space on the LEFT fading into flat sand colour #F3EDE4 for the copy. Copy on '
    'the scrim: eyebrow ALL-CAPS "GOTOWY NA SEZON"; H2 in Barlow Semi Condensed ink "Zamow Popiolka '
    'i miej brudna robote z glowy." with a soft vermilion swash under the single word "Popiolka"; '
    'the price "119 zl" BIG in Barlow Semi Condensed; a full-width vermilion #C2381B CTA button '
    '"Zamawiam — 119 zl" (white text); directly under it a risk-reducer line "Platnosc przy odbiorze '
    '• Zwrot 14 dni • Wysylka z Polski". One chamfered S6 corner on the copy panel. No topbar, no '
    'star ratings.')),

 '10-opinie': ('styl', HEAD_D + (
    'SECTION "opinie" — real Polish reviews, BELOW the fold, honest (a couple critical). Code-style '
    'on the sand page, NO product photography, framed cards only. Header: eyebrow ALL-CAPS "CO MOWIA '
    'KUPUJACY"; H2 in Barlow Semi Condensed ink "Realne opinie — z plusami i minusami." with a soft '
    'vermilion swash under the single word "Realne"; a small summary line in Hanken with the ONLY '
    'star glyphs on the page in vermilion "★ 4,72 / 5 — 2458 ocen, 650 opinii". A masonry of FIVE '
    'quote cards (off-white, 1px hairline, one chamfered S6 corner each), each a short Polish review '
    'in Hanken with a small vermilion star row and an anonymised name initial: card 1 "Bardzo dobrze '
    'wciaga popiol. Glosny, ale szybko ogarnia kominek. Za te pieniadze naprawde warto." — "Marek "; '
    'card 2 "3 filtry w zestawie — mozna prac na przemian. Ciagnie mocno." — "Ania "; card 3 '
    '"Kupilem do czyszczenia pieca na pellet — swietny. Maly i porezny." — "Tomasz "; card 4 (3 '
    'stars) "Do kominka super, halas w normie. Auta nim nie odkurzysz." — "Piotr "; card 5 (3 stars) '
    '"Cena niska, wykonanie ok, ale do bardzo drobnego pylu filtr zapycha sie czesto." — "Kasia ". '
    'Honest mix, no fake 5-star wall. No CTA button.')),

 '11-galeria': ('prod', HEAD_D + PROD + (
    'SECTION "galeria" — a curated real-photo gallery grid of the product, square tiles. Header: '
    'eyebrow ALL-CAPS "ZOBACZ Z BLISKA"; H2 in Barlow Semi Condensed ink "Popiolek w kadrze." with '
    'a soft vermilion swash under the single word "kadrze". A calm grid of SIX square photo tiles '
    '(1:1, one chamfered S6 corner each, thin ink hover-zoom cue on one), all of the SAME red-lidded '
    'stainless vacuum: a full lifestyle shot carrying it, the red lid + rocker switch close-up, the '
    'white HEPA filter being lifted out, the grey basket filter inside the steel tank, a metal '
    'spring clamp being closed, the black wheeled base — consistent warm grading. Small ink caption '
    'chips. No CTA button, no star ratings.')),

 '14-faq': ('prod', HEAD_D + PROD + (
    'SECTION "faq" — an honest accordion with a small product slot. Header: eyebrow ALL-CAPS "ZANIM '
    'ZAMOWISZ"; H2 in Barlow Semi Condensed ink "Konkretnie, bez owijania." An accordion of SIX '
    'full-width rows separated by hairlines, each with a thin ink "+" / "−" chevron on the right; '
    'the FIRST row EXPANDED shows its question in Barlow and its answer in Hanken, the rest collapsed '
    '(question only). Questions VERBATIM: row 1 EXPANDED "Czy jest glosny?" answer "Tak, jest glosny '
    '— to cena mocy przemyslowej. Do wybrania popiolu z kominka wystarczy jednak chwila."; row 2 '
    '"Czy poradzi sobie z goracym popiolem?"; row 3 "Czemu waz sie elektryzuje i jak to '
    'rozladowac?"; row 4 "Czy zbierze bardzo drobny pyl po szlifowaniu?"; row 5 "Czy musze '
    'dokupowac worki?"; row 6 "Jak place i czy moge zwrocic?". On the side a small clean packshot of '
    'the red-lidded vacuum on an off-white card with one chamfered S6 corner. Only thin ink '
    'plus/minus visuals. NO anti-static ("antystatyczny") claim anywhere.')),

 '15-zamow': ('prod', HEAD_D + PROD + (
    'SECTION "zamow" — an on-page checkout skin, single variant, no colour selector. Header: eyebrow '
    'ALL-CAPS "ZAMOWIENIE"; H2 in Barlow Semi Condensed ink "Zamow Popiolka." Two columns 7/5. LEFT '
    '~58% a form card (off-white, one chamfered S6 corner) with labelled white input fields (1px '
    'hairline, radius 8): "Imie i nazwisko", "Telefon", "E-mail", "Ulica i numer", "Kod pocztowy", '
    '"Miejscowosc", and a small "Ilosc" quantity stepper; a payment choice with two pills "Platnosc '
    'przy odbiorze" (selected) and "BLIK / online". RIGHT ~42% a sticky summary card: a small clean '
    'red-lidded vacuum thumbnail, the name "Popiolek — odkurzacz do popiolu, gruzu i warsztatu", a '
    'line "Cena: 119 zl", a summary block "Produkt: 119 zl", "Dostawa: kurier — 15 zl", "Razem: 134 '
    'zl"; BELOW the summary a full-width vermilion #C2381B CTA button "Zamawiam z obowiazkiem '
    'zaplaty" (white text) and under it "Platnosc przy odbiorze • Masz 14 dni na zwrot." The '
    'delivery cost and total are visible BEFORE the button. NEG: no "darmowa dostawa", no delivery-'
    'time promise, no colour selector.')),

 '16-final': ('prod', HEAD_D + PROD + (
    'SECTION "final" — a warm closing scene, life with the product, copy at the bottom. THE SCENE: a '
    'tidy cosy Polish living room after a fire, the red-lidded steel vacuum standing ready by a clean '
    'hearth where flames flicker softly; warm calm end-of-day mood, lots of empty negative space. '
    'Copy in the lower area on a sand scrim: eyebrow ALL-CAPS "PO KAZDYM PALENIU — PORZADEK"; H2 in '
    'Barlow Semi Condensed ink "Rozpal, posprzataj w minute, odpocznij." with a soft vermilion swash '
    'under the single word "minute"; one Hanken body line "Stalowy zbiornik, bezworkowe filtry i '
    'mocne ssanie — brudna robota ogarnieta."; the price "119 zl" in Barlow; a vermilion #C2381B CTA '
    'button "Zamawiam Popiolka"; a risk-reducer line "Platnosc przy odbiorze • Zwrot 14 dni". Under '
    'it a minimalist footer strip with small ink links "Regulamin · Polityka prywatnosci · Dane '
    'sprzedawcy" (no shop name). One chamfered S6 corner on the copy panel.')),
}


def refs_for(kind):
    if kind == 'prod':
        return [PRODP, STYL], [{'url': PRODU, 'type': 'product'}, {'url': STYLU, 'type': 'ref'}]
    if kind == 'zestaw':
        return [ZESTP, STYL], [{'url': ZESTU, 'type': 'product'}, {'url': STYLU, 'type': 'ref'}]
    return [STYL], [{'url': STYLU, 'type': 'ref'}]


def gen(section):
    kind, body = TASKS[section]
    prompt = body + EXCL + DNA
    local, edge = refs_for(kind)
    return G.generate(section, '%s.png' % section, prompt, local, edge, '3:2',
                      'ssawek-d-%s' % section)


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
print('GOTOWE desktop: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))

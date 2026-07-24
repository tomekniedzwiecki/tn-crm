# -*- coding: utf-8 -*-
"""Pary MOBILE makiet GADULEK (F2.4): mobile WSZYSTKICH sekcji, PROJEKT OD ZERA pod 390px
(nie scisniety desktop). 2:3. Ref: desktop makieta (tresc, image1) + styl-master (styl, image2).
Copy VERBATIM. Uzycie: python gen-mobile.py all | 01-hero ..."""
import os, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
import genlib as G
from common import DNA, PROD, ANAT, HEAD_M, EXCL

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
STYL = os.path.join(HERE, 'brand', '00-styl-master.png')
STYLU = G.PUB + 'bud-assets/gadulek/brand/00-styl-master.webp'
MAKU = G.PUB + 'bud-assets/gadulek/makiety/'

TASKS = {
 '01-hero': ('prod', PROD + ANAT + (
    'MOBILE HERO, fold-first, archetype H (three stacked zones), designed for a looping hero-video. '
    'A compact top strip with the "Gadulek" wordmark only (NO floating trust-chip or badge on the '
    'scene). ZONE 1 = the STAGE at the top taking AT MOST ~44-48% of the board height: a sunny garden, '
    'two children (a boy and a girl) each holding a pastel walkie-talkie (one blue, one pink), each '
    'screen showing the other child\'s face, a leafy branch and tall grass gently swaying — the '
    'dominant motion carrier, unclipped, product sharp. ZONE 2 = a BIG Fredoka H1 (2-3 short lines) '
    '"Nie tylko sie slysza. Teraz sie widza." with a raspberry swash under "widza"; MAX ONE Alegreya '
    'benefit line "2 krotkofalowki z ekranem i kamera — bez WiFi i karty SIM." ZONE 3 = a DISTINCT '
    'offer CARD with margin (off-white, radius 20): price "89,90 zl" big in Fredoka with "za 2 '
    'sztuki", a full-width raspberry #C5265B CTA "Zamawiam 2 Gadulki — 89,90 zl", a risk line '
    '"Platnosc przy odbiorze • Zwrot 14 dni", and a wrapping row of trust pills "Za pobraniem", '
    '"Zwrot 14 dni", "Z Polski", "Od 3 lat". HARD RULE: the price "89,90 zl" and the CTA MUST sit '
    'inside the first phone fold with clear margin — the stage must never push them below the fold. '
    'No star ratings in the hero.')),

 '02-opinie': ('styl', (
    'MOBILE reviews stack, code-style, framed cards, BELOW the fold: eyebrow "CO MOWIA RODZICE"; H2 '
    'in rounded Fredoka "Realne opinie — z plusami i minusami." with a raspberry swash under '
    '"Realne"; a small summary line with the ONLY star glyphs (raspberry) "★ 4,7 / 5 — 687 ocen, '
    '93,4% pozytywnych". Then FIVE quote cards STACKED vertically (one per row, off-white, 1px '
    'hairline, radius 20, a small raspberry star row and an initial): "Moj 3-latek uwielbia. Prosta '
    'obsluga." — Kasia (5 stars); "Obraz i kamera dobre jak na te cene. Dzieci sie widza." — Marcin '
    '(5 stars); "Male i lekkie, Type-C to plus." — Ola (5 stars); "Ekran czytelny, jest lekkie '
    'opoznienie, ale za te cene super." — Piotr (4 stars); "Kupilam corce, bawi sie z bratem po '
    'domu." — Ania (5 stars). Honest mix. No CTA button.')),

 '03-jak-dziala': ('prod', PROD + ANAT + (
    'MOBILE TOR-I stack (must show THREE STATES): header eyebrow "PROSTE JAK RAZ-DWA-TRZY"; H2 in '
    'rounded Fredoka "Wlacz, sparuje sie samo, gadaj i patrz." with a raspberry swash under "samo"; '
    'Alegreya intro "Bez WiFi, bez karty SIM." Then THREE step cards STACKED vertically CONNECTED by '
    'a soft raspberry SIGNAL-WAVE line (one per row, NEVER 3 side-by-side at 390px, each with an '
    'in-card number 01/02/03 in Fredoka, radius 20): card 01 = a child\'s hand sliding the power '
    'switch, screens lighting up, caption "Wlacz obie krotkofalowki"; card 02 = the two devices '
    'linked by a raspberry wave with a badge "Ten sam kanal — polaczone", caption "Sparuja sie same"; '
    'card 03 = both screens showing faces and the side talk button glowing, caption "Gadaj i widz '
    'drugie dziecko". A full-width raspberry #C5265B CTA "Chce zestaw dla dwojga" — never covered by '
    'a product image. NEG: no WiFi symbol, no SIM tray.')),

 '04-zastosowania': ('prod', PROD + ANAT + (
    'MOBILE editorial stack: eyebrow "JEDEN PREZENT, WIELE ZABAW"; H2 in rounded Fredoka "Glos, obraz '
    'i smieszne glosy — w domu i na dworze." with a raspberry swash under "obraz". Then FOUR cards '
    'STACKED vertically (one per row, photo + caption below — NEVER a grid at 390px, show a small '
    'peek of the next card), always a pastel walkie-talkie with a live screen: "Widza sie podczas '
    'rozmowy" (over-the-shoulder on one screen); "Podchody i chowany w ogrodzie" (a child behind a '
    'play tent); "Wolanie z pokoju do pokoju" (a child, a mother in the background); "Zabawa efektami '
    'glosu" (a laughing child with a small badge "potwor"). A small ink note "Glos, obraz i smieszne glosy — jeden '
    'prezent, wiele zabaw." Every card is ONE scene only. No CTA button.')),

 '05-mid-cta': ('prod', PROD + ANAT + (
    'MOBILE decision banner: a warm afternoon living-room scene on TOP (~40%) — two children on a rug '
    'with the pastel devices, a sheer curtain at a sunlit window; then a peach card: eyebrow '
    '"PREZENT NA JUZ"; H2 in rounded Fredoka "Dwa okienka do wspolnej zabawy. Jedna cena." with a '
    'raspberry swash under "Jedna"; price "89,90 zl" big in Fredoka in CHARCOAL ink #3C1F28 (NOT '
    'raspberry — raspberry is reserved ONLY for the CTA button) with "za 2 sztuki"; a full-width '
    'raspberry #C5265B CTA "Wybieram kolory i zamawiam"; a risk line "Mozesz zaplacic przy odbiorze • '
    'Zwrot 14 dni". No star ratings.')),

 '06-anatomia': ('prod', PROD + (
    'MOBILE anatomy stack (TOR-I hotspots): eyebrow "POZNAJ GADULKA"; H2 in rounded Fredoka '
    '"Wszystko, co maly odkrywca lubi." with a raspberry swash under "odkrywca". A large clean 3/4 '
    'packshot of ONE pastel-blue walkie-talkie (screen showing a child\'s face) on a soft cream '
    'field, with thin ink hairline callouts to FIVE labelled hotspots STACKED around it (the active '
    'one a raspberry ring): "Ekran 2,0 cala IPS", "Kamera", "Duzy przycisk rozmowy", "Ladowanie '
    'Type-C", "Antena". Below, a dimension line "ok. 12,4 × 5,4 cm" in Alegreya tabular numerals and '
    'a fact chip "ABS — odporne na upadki". NEG: no touchscreen, SIM or waterproof hotspot. No CTA.')),

 '07-porownanie': ('prod', PROD + (
    'MOBILE comparison table (code-style cream card): eyebrow "UCZCIWIE"; H2 in rounded Fredoka '
    '"Gadulek z ekranem vs reszta." with a raspberry swash under "ekranem". A STRICT 4-COLUMN GRID '
    'that fits a phone, PERFECTLY ALIGNED: column 1 = row labels (left, narrow); columns 2-3-4 = the '
    'three products with a header ON TOP of each column — col 2 "Gadulek" (a tiny faithful pastel-blue '
    'walkie-talkie thumbnail WITH a screen), col 3 "Krotkofalowka" (a GENERIC grey walkie-talkie '
    'WITHOUT a screen — never the pastel Gadulek body), col 4 "Telefon" (a neutral phone silhouette). '
    'EACH data row has EXACTLY THREE marks — one cell directly UNDER each of the three product headers, '
    'never two, never shifted: row "Rozmowa glosem" -> check, check, check; row "Widza swoje twarze" -> '
    'raspberry check, cross, cross; row "2 sztuki w zestawie" -> raspberry check, cross, cross; row '
    '"Bez WiFi i SIM" -> raspberry check, check, cross; row "Prosty start" -> raspberry check, check, '
    'check. The Gadulek column (col 2) marks are RASPBERRY checks; the other columns use thin ink '
    'OUTLINE check/cross. Vertical hairline separators between the three product columns keep every '
    'mark under its own header. Then ONE full-width honest minus row spanning all product columns, no '
    'cross: "Opoznienie dzwieku — moze wystapic lekkie opoznienie ok. 1-2 s." A small ink note "Obraz '
    '480P — czytelny do zabawy, nie premium." HARD RULE: the header row and every data row MUST have '
    'the SAME three product columns aligned — do NOT drop or merge a column. No CTA, no stars.')),

 '08-zdjecia-od-kupujacych': ('prod', PROD + ANAT + (
    'MOBILE buyer-photos stack (UGC look: candid hand-held phone photos, slightly imperfect): eyebrow '
    '"OD PRAWDZIWYCH RODZICOW"; H2 in rounded Fredoka "Zdjecia od kupujacych." with a raspberry swash '
    'under "kupujacych"; a small raspberry badge "Zdjecia od kupujacych". FOUR photo tiles in a 2-'
    'column grid (radius 20), candid UGC of the pastel devices: a hand holding a blue device with '
    'the screen ON showing a live camera view; a hand holding a device with a cartoon avatar on '
    'screen; the blue+pink pair with lanyards and a Type-C cable on a table; the retail box. A short '
    'descriptive ink caption under each. No CTA. NEG: not studio-perfect, no invented quotes.')),

 '09-specyfikacja-zestaw': ('prod', PROD + (
    'MOBILE specs stack: eyebrow "KONKRETY"; H2 in rounded Fredoka "Parametry i zawartosc zestawu." '
    'with a raspberry swash under "zestawu". Fact tiles STACKED (one or two per row max, never a '
    'dense grid), each a thin ink OUTLINE icon + a BIG number-as-graphic in Fredoka + an Alegreya '
    'label: "Ekran 2,0 cala IPS"; "Wideo 480P"; "Zasieg 100-400 m"; "Bateria 600 mAh — do 3-5 h"; '
    '"Ladowanie Type-C 1-2 h"; "ok. 12,4 × 5,4 cm"; and one tile with a crossed-out water drop "Nie '
    'jest wodoodporny". Then a "W zestawie:" single-column list with outline bullets "2× '
    'krotkofalowka Gadulek", "2× smycz", "2× kabel Type-C", "Instrukcja". A colours row: "2× '
    'niebieski", "niebieski + rozowy", "2× rozowy". No CTA, no watts, no HD/4K.')),

 '10-faq': ('prod', PROD + (
    'MOBILE FAQ stack: eyebrow "ZANIM ZAMOWISZ"; H2 in rounded Fredoka "Pytania rodzicow." An '
    'accordion of SIX full-width rows with hairline separators and thin ink "+"/"−" chevrons, the '
    'FIRST row expanded "Czy Gadulek potrzebuje WiFi albo karty SIM?" with the answer "Nie. Dwa '
    'urzadzenia lacza sie bezposrednio i paruja automatycznie na tym samym kanale.", the rest '
    'collapsed (question only): "Jaki jest realny zasieg?", "Czy obraz jest HD?", "Jak dlugo dziala '
    'bateria?", "Od ilu lat jest ta zabawka?", "Jak place i czy moge zwrocic?". A small packshot of '
    'the pastel-blue walkie-talkie below the list on an off-white card. Only thin ink plus/minus '
    'visuals. No CTA button.')),

 '11-zamow': ('prod', PROD + (
    'MOBILE checkout skin stack: eyebrow "ZAMOWIENIE"; H2 in rounded Fredoka "Zamow Gadulka."; a '
    'compact product row (small faithful pastel pair thumbnail + name "Gadulek — 2 krotkofalowki z '
    'ekranem" + "Cena: 89,90 zl za 2 szt."); a colour-pair SELECTOR of three buttons with thumbnails '
    '"2× niebieski", "niebieski + rozowy" (selected, raspberry outline), "2× rozowy" — same price; '
    'then STACKED white input fields (1px hairline, radius 12) "Imie i nazwisko", "Telefon", '
    '"E-mail", "Ulica i numer", "Kod pocztowy", "Miejscowosc"; payment pills "Platnosc przy '
    'odbiorze" (selected), "BLIK / online"; a merchant-info line "Sprzedawca: [firma] • NIP [___]"; '
    'a summary BEFORE the button "Produkt: 89,90 zl", "Dostawa: kurier", "Razem"; a full-width '
    'raspberry #C5265B CTA "Zamawiam z obowiazkiem zaplaty"; a small line "Platnosc przy odbiorze • '
    'Masz 14 dni na zwrot." No "darmowa dostawa", no delivery-time promise.')),

 '12-final': ('prod', PROD + ANAT + (
    'MOBILE closing stack: a warm GARDEN scene at DUSK on TOP (~42%) — close on two children\'s hands '
    'holding pastel devices with the other child\'s face on the screen, a warm string-light garland '
    'and tall grass gently swaying; then copy: eyebrow "WIECZOR PELEN ROZMOW"; H2 in rounded Fredoka '
    '"Podaruj im zabawe, na ktorej sie widza." with a raspberry swash under "widza"; price "89,90 '
    'zl" in Fredoka; a full-width raspberry #C5265B CTA "Podaruj im Gadulka — zamow 2-pak"; a risk '
    'line "89,90 zl • platnosc przy odbiorze • 14 dni na zwrot"; a minimalist footer with small ink '
    'links "Regulamin · Polityka prywatnosci · Dane sprzedawcy" (no shop name).')),
}


def refs_for(kind, section):
    d_local = os.path.join(OUT, '%s.png' % section)
    d_url = MAKU + '%s.webp' % section
    return ([d_local, STYL],
            [{'url': d_url, 'type': 'ref'}, {'url': STYLU, 'type': 'ref'}])


ANTI_BLEED = (' HARD ANTI-BLEED: Image 2 is a COLOUR/TYPE reference ONLY. DO NOT reproduce it. Output '
              'MUST be ONLY this one section and NOTHING else — absolutely NO design-system / '
              'specimen board, NO palette swatches or hex codes, NO tiles or labels like "PALETA / '
              'TYPOGRAFIA / SYGNATURA / PRODUKT / IKONY / SWIAT", NO "2,0 / 480P / 100-400 m" spec '
              'strip as a standalone board, NO row of outline benefit icons unless this section '
              'explicitly needs them. If any styl-master board content appears, the mockup is WRONG. ')


def gen(section):
    kind, body = TASKS[section]
    prompt = HEAD_M + body + EXCL + ANTI_BLEED + DNA
    local, edge = refs_for(kind, section)
    return G.generate(section, '%s-mobile.png' % section, prompt, local, edge, '2:3',
                      'gadulek-mm-%s' % section)


args = sys.argv[1:]
todo = list(TASKS) if (not args or args == ['all']) else args
ok, fail = [], []
with ThreadPoolExecutor(max_workers=3) as ex:
    futs = {ex.submit(gen, s): s for s in todo}
    for f in as_completed(futs):
        s = futs[f]
        try:
            ok.append(f.result()); print('OK', s)
        except Exception as e:
            fail.append(s); print('FAIL', s, str(e)[:180])
print('GOTOWE mobile: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))

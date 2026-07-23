# -*- coding: utf-8 -*-
"""Pary MOBILE makiet ROZGRZEWEK (F2.4): mobile WSZYSTKICH sekcji, projekt OD ZERA pod 390px
(nie scisniety desktop). 2:3, local HIGH -> fallback edge MEDIUM. Ref: makieta desktop (tresc,
image1) + styl-master (styl, image2). Copy VERBATIM z PLAN. Uzycie: python gen-mobile.py all | 01-hero ..."""
import os, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
import genlib as G

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
STYL = os.path.join(HERE, 'brand', '00-styl-master.png')
STYL_URL = G.PUB + 'bud-assets/rozgrzewek/brand/00-styl-master.webp'
MAK_URL = G.PUB + 'bud-assets/rozgrzewek/makiety/'

DNA = ('STYLE-DNA: warm whitened seashell-peach page #FAF3EF, bands #F3E9E3, white cards #FFFFFF '
       '(soft evening warmth, NEVER powder-pink and NEVER linen-beige); ink #2B2622, body #453E38, '
       'hairlines #E4D7CE; ONE accent royal indigo-navy #2E46C8 (CTA, soft italic underline-swash '
       'under one word, OUTER arc of the "warmth rings" — 2-3 thin concentric arcs near eyebrows); '
       'icons 1.75px outline ink; display Fraunces (headlines, prices, BIG numbers 9 · 21), text '
       'Work Sans; radius 18px (cards)/10px (small); trust-pills white fill 1px hairline ink text; '
       'soft warm-ambient shadows; light backgrounds only; the product ALWAYS navy-blue body with '
       'silver beaded head. Polish diacritics correct. Crisp mobile UI, no watermarks, no phone frame. ')

HEAD_M = ('High-fidelity MOBILE landing SECTION mockup, 390px-wide phone layout on a 2:3 portrait '
          'board. Image 1 = the DESKTOP mockup of this exact section: CONTENT source — keep the '
          'SAME Polish copy, photos, product look and component styles, redesigned into ONE narrow '
          'column FOR PHONE (not a squeezed desktop). Image 2 = style reference ONLY — never copy '
          'its tiles onto the page. Output shows ONLY this one section, single column, big tap '
          'targets. NEVER 3 items side-by-side at 390px — stack into a vertical column. No floating '
          'trust-chip/badge overlay on any photo. The product ALWAYS faithful: NAVY-BLUE "mushroom" '
          'body with a round LED display and three tiny status dots, a metallic champagne collar '
          'and a navy ribbed head with silver steel beads + a subtle red LED glow; no printed brand '
          'text, no "Hailicare", no white/ivory/champagne/gray/pink variant, no massage-gun body. '
          'Person (if any): woman 30-55, realistic figure, face turned away, straight wrists, '
          'natural grip on the handle. ')

EXCL = (' STRICT: one section only, flat edge-to-edge, no browser chrome, no device/phone frame. No '
        'star ratings, no review counts, no sold counts, no crossed-out prices, no free-shipping '
        'claims, NO medical/therapeutic claims (no lymphatic drainage, circulation, meridians, '
        'pain-relief, red-light/micro-current therapy), NO weight-loss/slimming/fat-burner/'
        'body-shaping, NO temperatures in degrees, NO anti-cellulite framing, no "Hailicare", no '
        'shop name, no invented dimensions/weight, no burned-in English infographic text. Light '
        'warm backgrounds only, no dark sections. Prices only "84,90 zł". No extra text beyond the '
        'quoted Polish strings. ')

TASKS = {
 '01-hero': (
    'MOBILE HERO, fold-first, archetype D. A compact top strip with the "Rozgrzewek" lockup only; '
    'then the isolated NAVY packshot on a flat #F3E9E3 color field taking AT MOST ~44-48% of the '
    'board height (it must NOT dominate the fold); then eyebrow "TWÓJ WIECZORNY RYTUAŁ" with the '
    'warmth rings; H1 in Fraunces, EXACTLY 2-3 short lines "Wieczorny masaż, który zaczyna się od '
    'ciepła." with a soft italic navy swash under "ciepła"; MAX ONE Work Sans benefit line "Ciepły '
    'okład, wibracje i tryb EMS — każdy z 9 poziomami."; then a DISTINCT offer block with margin '
    'below: price "84,90 zł" big in Fraunces, a full-width navy #2E46C8 CTA "Chcę swój Rozgrzewek", '
    'a risk line "Płatność przy odbiorze • 14 dni na zwrot", and a row of small trust pills '
    '"Płatność przy odbiorze", "BLIK i płatność online", "CE i RoHS" (wrap if needed). HARD RULE: '
    'the price "84,90 zł" and the CTA MUST sit inside the first phone fold with clear margin below '
    '— the packshot must never push them below the fold.'),
 '02-moment': (
    'MOBILE stack: the lifestyle scene photo on top (a woman 30-55, face away, on a sofa under a '
    'soft blanket, holding the NAVY massager against her shoulder; warm lamp, mug of tea, candle) '
    'taking ~40%% of the board; then eyebrow "PO DNIU, PO SWOJEMU" with the warmth rings; H2 in '
    'Fraunces "Ciepły moment, który mieści się w wieczorze." with a soft italic navy swash under '
    '"moment"; Work Sans body "Spięte barki i kark po dniu przy biurku znają to uczucie. Usiądź z '
    'herbatą, wybierz poziom i prowadź masażer po karku, ramionach, plecach lub udach. Rozgrzewek '
    'działa bez przewodu, więc rytuał nie musi odbywać się przy gniazdku."; an ink text link '
    '"Zobacz 3 tryby →". No CTA button.'),
 '03-tryby': (
    'MOBILE TOR-I stack: header (eyebrow "WYBIERZ SWÓJ TRYB" + warmth rings; H2 in Fraunces "Trzy '
    'tryby. Intensywność ustawiasz od 1 do 9." with a swash under "tryby"; Work Sans intro "Dotknij '
    'trybu, aby zobaczyć jego wskaźnik i zakres ustawień."); then three short pill toggles in one '
    'row "Ciepło" (ACTIVE, navy fill), "Wibracje", "EMS"; below a card with a faithful round LED '
    'display showing a BIG "9" and three tiny status dots (red, blue, green) and the active "Ciepło" '
    'description "Delikatny ciepły okład z 9 poziomami. Aktywny tryb wskazuje czerwony wskaźnik."; '
    'a small ink note "Czerwone światło LED jest widoczną cechą głowicy — nie przedstawiamy go jako '
    'terapii."; a full-width navy #2E46C8 CTA "Wybieram Rozgrzewek — 84,90 zł". The red/blue/green '
    'dots are device STATUS colors only, not extra UI accents. NEG (hard): do NOT place a large '
    'product packshot at the bottom of the section, and NEVER let any product image overlap, touch '
    'or cover the CTA button — the CTA text must be fully legible on a clean navy button. The ONLY '
    'product visual in this whole section is the small round LED display reproduced inside the '
    'card; no full massager photo anywhere else.'),
 '04-glowica': (
    'MOBILE stack: a full-width proof MACRO of the massage head on top (~45%%) — chromed steel '
    'ball-tipped beads in concentric rings with a red LED glow, faithful, do not change the bead '
    'count; below, a BIG typographic "21" in Fraunces ink; eyebrow "KRĘGI CIEPŁA" with the warmth '
    'rings; H2 in Fraunces "21 stalowych kulek w koncentrycznych pierścieniach." with a swash under '
    '"kulek"; Work Sans body "Kopułowa główka masażera ma 21 stalowych kulkowych bolców ułożonych w '
    'pierścieniach. W główce widoczne jest również czerwone światło LED."; small ink micro-copy '
    '"Bez dopisywania cudów. Pokazujemy dokładnie to, co znajduje się w produkcie."; ink text link '
    '"Zobacz, gdzie możesz go używać →". No CTA button.'),
 '05-obszary': (
    'MOBILE editorial stack: eyebrow "TWÓJ RYTM" + warmth rings; H2 in Fraunces "Kark, ramiona, '
    'plecy albo uda." with a swash under "uda"; Work Sans body "Wybierz obszar i prowadź masażer '
    'ręcznie, dopasowując poziom do własnych preferencji."; then FOUR cards STACKED vertically (one '
    'per row, photo + caption below — NEVER a 2x2 grid at 390px), each a hand/body fragment WITHOUT '
    'a face, always the NAVY product on cozy home textiles: "Kark", "Ramiona", "Plecy", "Uda"; a '
    'small ink note "To produkt do domowego masażu i relaksu, nie urządzenie lecznicze." and an ink '
    'link "Sprawdź ładowanie i czas pracy →". The "Uda" tile is a neutral loungewear shot — NO '
    'cellulite/slimming framing, NO measuring tape, NO bikini; no anatomical diagrams, no pain-zone '
    'maps.'),
 '06-autonomia': (
    'MOBILE stack: eyebrow "NAŁADUJ I UŻYWAJ BEZ PRZEWODU" + warmth rings; H2 in Fraunces "Około 50 '
    'minut pracy po naładowaniu." with a swash under "pracy"; a compact 2x2 grid of four white spec '
    'cards, each with a thin ink outline icon, a BIG Fraunces value and a Work Sans caption: "ok. '
    '1200 mAh"/"Pojemność baterii", "ok. 3 h"/"Czas ładowania", "ok. 50 min"/"Czas pracy", "ok. 30 '
    'min"/"Automatyczne wyłączenie"; a small NAVY packshot on a side table; a small ink note '
    '"Obudowa: ABS i TPR. Produkt zgodny z CE i RoHS."; a full-width navy #2E46C8 CTA "Zamawiam za '
    '84,90 zł". No charging-port close-up, no cable.'),
 '07-zdjecia-kupujacych': (
    'MOBILE proof stack: eyebrow "POZA PACKSHOTEM" + warmth rings; H2 in Fraunces "Zdjęcia od '
    'kupujących." with a swash under "kupujących"; Work Sans body "Prawdziwe domowe kadry '
    'granatowego wariantu — bez ocen, gwiazdek i liczników popularności."; then ONE large buyer '
    'photo of the NAVY product (held in hand in a real home) on top, and TWO smaller stacked photos '
    'below (navy product next to a plain box / on a table), each in a rounded card with a caption '
    'chip "Granatowy wariant Blue" (no aggressive horizontal rail); a full-width navy #2E46C8 CTA '
    '"Chcę granatowy Rozgrzewek". No star ratings, no counts, no badges.'),
 '08-mid-cta': (
    'MOBILE banner card: eyebrow "MAŁY RYTUAŁ DLA SIEBIE" with the warmth rings acting as a soft '
    'swash; H2 in Fraunces "Rozgrzewek w jednej, stałej cenie." with a swash under "cenie"; a small '
    'clean NAVY packshot centered; price "84,90 zł" big in Fraunces; a full-width navy #2E46C8 CTA '
    '"Wybieram Rozgrzewek"; a risk line "Możesz zapłacić przy odbiorze. Masz 14 dni na zwrot.".'),
 '09-faq': (
    'MOBILE FAQ stack: H2 in Fraunces "Zanim zamówisz — konkretnie i bez przesady."; an accordion '
    'of EIGHT full-width rows with hairline separators and thin ink "+" chevrons, the FIRST row '
    'expanded ("Czy masażer grzeje bardzo mocno?" with the answer "Nie. To delikatny ciepły okład, '
    'a nie intensywne grzanie jak od żelazka. Jeśli szukasz bardzo wysokiej temperatury, ten '
    'produkt może nie odpowiadać Twoim oczekiwaniom."), the rest collapsed (question only): "Czy '
    'intensywność będzie dla mnie wystarczająca?", "Czy rączka jest długa?", "Jak sprawdzę '
    'ustawiony poziom?", "Jak długo działa po naładowaniu?", "Jaki kolor otrzymam?", "Czy mogę '
    'zapłacić przy odbiorze?", "Czy mogę zwrócić produkt?"; below a full-width navy #2E46C8 CTA '
    '"Przejdź do zamówienia — 84,90 zł". Text and accordion ONLY, no decorative photo.'),
 '10-zamow': (
    'MOBILE checkout skin stack, NO color selector: eyebrow "ZAMÓWIENIE"; H2 in Fraunces "Zamów '
    'granatowy Rozgrzewek."; a compact product row (small NAVY thumbnail + name "Rozgrzewek — '
    'podgrzewany masażer do ciała" + "Wariant: Granatowy (Blue)" + "Cena produktu: 84,90 zł"); then '
    'stacked white input fields (1px hairline, radius 10) "Imię i nazwisko", "Telefon", "E-mail", '
    '"Ulica i numer", "Kod pocztowy", "Miejscowość", and an "Ilość" stepper; payment pills '
    '"Płatność przy odbiorze", "BLIK / płatność online"; a summary BEFORE the button "Produkt: '
    '84,90 zł", "Dostawa: Kurier — 15,00 zł", "Razem: 99,90 zł"; a full-width navy #2E46C8 CTA '
    '"Zamawiam z obowiązkiem zapłaty"; a small line "Masz 14 dni na odstąpienie od umowy." No '
    '"darmowa dostawa", no delivery-time promise, no color selector.'),
 '11-final': (
    'MOBILE closing stack: a full warm evening scene on top (the NAVY massager lying on a side '
    'table beside a mug of tea, a soft blanket and a warm glowing lamp, cozy Polish home); then the '
    'copy: eyebrow "CIEPŁO ZATACZA KRĘGI" with the warmth rings; H2 in Fraunces "Zrób miejsce na '
    'mały wieczorny rytuał." with a swash under "rytuał"; Work Sans body "Delikatne ciepło, '
    'wibracje i tryb EMS możesz ustawić na jednym z 9 poziomów i używać na wybranym obszarze '
    'ciała."; price "84,90 zł"; a full-width navy #2E46C8 CTA "Przejdź do zamówienia"; a risk line '
    '"Płatność przy odbiorze • 14 dni na zwrot"; a minimalist footer with small ink links '
    '"Regulamin · Polityka prywatności · Dane sprzedawcy" (no shop name).'),
}


def gen(section):
    prompt = HEAD_M + TASKS[section] + EXCL + DNA
    desktop_local = os.path.join(OUT, '%s.png' % section)
    local = [desktop_local, STYL]
    edge = [{'url': MAK_URL + '%s.webp' % section, 'type': 'ref'},
            {'url': STYL_URL, 'type': 'ref'}]
    return G.generate(section, '%s-mobile.png' % section, prompt, local, edge, '2:3',
                      'rozgrzewek-mm-%s' % section)


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
            fail.append(s); print('FAIL', s, str(e)[:160])
print('GOTOWE mobile: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))

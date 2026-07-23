# -*- coding: utf-8 -*-
"""Makiety desktop ROZGRZEWEK (F2): 3:2, local HIGH -> fallback edge MEDIUM.
Ref: navy-whole/head-face crop (wiernosc) + styl-master (styl). Copy VERBATIM z PLAN.md.
Uzycie: python gen-makiety.py all | 01-hero 02-moment ..."""
import os, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
import genlib as G

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
REFS = os.path.join(HERE, 'refs-cache')
NAVY = os.path.join(REFS, 'navy-whole.png')
HEAD = os.path.join(REFS, 'head-face.png')
STYL = os.path.join(HERE, 'brand', '00-styl-master.png')
NAVY_URL = G.PUB + 'bud-assets/rozgrzewek/refs/navy-whole.webp'
HEAD_URL = G.PUB + 'bud-assets/rozgrzewek/refs/head-face.webp'
STYL_URL = G.PUB + 'bud-assets/rozgrzewek/brand/00-styl-master.webp'

DNA = ('STYLE-DNA: warm whitened seashell-peach page #FAF3EF with section bands #F3E9E3 and white '
       'cards #FFFFFF (soft evening warmth, NEVER powder-pink and NEVER linen-beige); ink #2B2622, '
       'body #453E38, hairlines #E4D7CE; EXACTLY ONE accent royal indigo-navy #2E46C8 used ONLY for '
       'the CTA button, a soft italic underline-swash under one headline word, and the OUTER arc of '
       'the signature "warmth rings" (2-3 thin concentric arcs echoing the 21 steel beads of the '
       'massage head, placed near section eyebrows); all functional icons thin 1.75px outline in '
       'ink; display font Fraunces (soft characterful serif, weights 600-700) for headlines, prices '
       'and BIG numbers (9 · 21); text font Work Sans; one series radius 18px (cards) / 10px '
       '(small); trust-pills: white fill, 1px hairline border, ink text; soft layered warm-ambient '
       'shadows, subtle grain on bands only; light backgrounds only; the product ALWAYS navy-blue '
       'handle with silver beaded head. Polish diacritics correct. No watermarks, no phone frames, '
       'crisp UI. ')

# Wiernosc — F1: ZERO opisu konstrukcji; geometria WYLACZNIE z refa.
PROD = ('The handheld body massager shown must faithfully match the product reference image EXACTLY '
        '(image 1): the same NAVY-BLUE matte "mushroom" body — a rounded handle with a round LED '
        'level display and three tiny status dots, a metallic champagne collar ring, and a rounded '
        'navy ribbed head carrying silvery steel beads with a subtle red LED glow between them — do '
        'not invent a different device. NEG: no printed brand text or logo on the product, no '
        'white/ivory/champagne-bodied variant, no pink/magenta/rose variant, no gray variant — '
        'navy-blue body with silver beaded head ONLY; no massage-gun/percussion pistol body, no '
        'jade roller, no stone gua-sha, no interchangeable heads. ')

ANAT = ('Person: a woman aged 30-55 with a realistic everyday figure (NOT a model), face turned '
        'away or cropped above the shoulders / off-axis (never emphasized), relaxed evening '
        'self-care mood, cozy home clothing (soft sweater or loungewear); hands with correct '
        'anatomy, straight wrists, natural grip on the massager handle. ')

HEAD_MK = ('High-fidelity DESKTOP landing page SECTION mockup on a 3:2 landscape board, section '
           'shown full-width like a real webpage fragment (~1280px design), Figma-style, '
           'pixel-perfect, clean design system, Polish e-commerce. ')

EXCL = (' STRICT: EXACTLY ONE SECTION AND NOTHING ELSE. Flat edge-to-edge section screenshot, no '
        'browser chrome, no URL bar, no device frame, no outer mockup shadow. No watermark, no '
        'lorem ipsum, no crossed-out prices, no bestseller/"NR 1" badges, no free-shipping claims, '
        'NO star ratings, NO review counts, NO sold counts, no section numbering like "01/11". NO '
        'medical or therapeutic claims (no lymphatic drainage, no blood circulation, no meridians, '
        'no pain-relief, no red-light therapy, no micro-current therapy), NO weight-loss / slimming '
        '/ fat-burner / body-shaping claims, NO temperatures in degrees, NO anti-cellulite framing. '
        'No "Hailicare", no shop name, no invented product dimensions or weight. No burned-in '
        'English infographic text or glowing energy effects from the source gallery. Light warm '
        'backgrounds only, no dark sections. Prices only "84,90 zł". No extra text beyond the '
        'quoted Polish strings. ')

NEG_PERSON = (' NEG scene with person: no white coat / therapist, no clinic, no spa salon, no '
              'bikini/glamour, no children operating the device, no face emphasized, no pain '
              'grimace. ')

TASKS = {
 '01-hero': ('navy', HEAD_MK + PROD + (
    'HERO, archetype D = a centrally isolated product packshot on a flat evening color field (NOT a '
    'busy room scene). Slim topbar on top: brand lockup left ("Rozgrzewek" wordmark in Fraunces '
    'ink) and enumerated nav links right, EXACTLY these three: "Tryby", "Głowica", "FAQ". Centered '
    'editorial layout: the isolated NAVY massager stands upright and still on a flat calm '
    '#F3E9E3 color field with a soft warm layered shadow beneath it. Above/around it, centered: '
    'eyebrow ALL-CAPS "TWÓJ WIECZORNY RYTUAŁ" with the signature warmth rings (2-3 thin concentric '
    'arcs, outer arc navy) beside it; big display H1 in Fraunces ink "Wieczorny masaż, który '
    'zaczyna się od ciepła." with a soft italic navy #2E46C8 underline-swash under the single word '
    '"ciepła"; one Work Sans subline "Rozgrzewek łączy delikatny ciepły okład, wibracje i tryb EMS '
    '— każdy z 9 poziomami intensywności."; a small product name line "Rozgrzewek — podgrzewany '
    'masażer do ciała"; price "84,90 zł" BIG in Fraunces; a full-width navy #2E46C8 CTA button '
    '"Chcę swój Rozgrzewek" (white text, radius 10); directly under the CTA a risk-reducer line '
    '"Płatność przy odbiorze • 14 dni na zwrot". Under that a row of three trust pills (white fill, '
    '1px hairline, ink text): "Płatność przy odbiorze", "BLIK i płatność online", "CE i RoHS".')),
 '02-moment': ('navy', HEAD_MK + PROD + ANAT + (
    'SECTION "moment" — lifestyle scene LEFT, copy RIGHT (55/45). The SCENE on the left: a woman '
    '30-55 (face not emphasized) sits on a sofa under a soft knitted blanket in a real cozy Polish '
    'living room in the evening, gently holding the NAVY massager against her upper arm/shoulder; a '
    'warm table lamp, a mug of tea and a lit candle on the side table behind; calm self-care mood '
    '(no pain grimace). On the RIGHT a narrow text column (max ~34 characters): eyebrow ALL-CAPS '
    '"PO DNIU, PO SWOJEMU" with the warmth-rings signature; H2 in Fraunces ink "Ciepły moment, '
    'który mieści się w wieczorze." with a soft italic navy swash under the single word "moment"; '
    'a Work Sans body paragraph "Spięte barki i kark po dniu przy biurku znają to uczucie. Usiądź '
    'z herbatą, wybierz poziom i prowadź masażer po karku, ramionach, plecach lub udach. Rozgrzewek '
    'działa bez przewodu, więc rytuał nie musi odbywać się przy gniazdku."; a discreet ink text '
    'link with a small arrow "Zobacz 3 tryby →". No CTA button.' + NEG_PERSON)),
 '03-tryby': ('navy', HEAD_MK + PROD + (
    'SECTION "tryby" — interactive mode explorer (TOR-I). Header: eyebrow "WYBIERZ SWÓJ TRYB" with '
    'the warmth rings; H2 in Fraunces ink "Trzy tryby. Intensywność ustawiasz od 1 do 9." with a '
    'soft italic navy swash under the single word "tryby"; one Work Sans intro line "Dotknij trybu, '
    'aby zobaczyć jego wskaźnik i zakres ustawień." THREE big pill toggles in one row above a card: '
    '"Ciepło" (ACTIVE state), "Wibracje", "EMS". The card below splits into: LEFT a faithful '
    'reproduction of the round LED display from the product (dark round dial in a champagne bezel) '
    'showing a BIG digit "9" and three tiny status dots — red, blue and green; RIGHT the active '
    'description for the "Ciepło" tab in Work Sans "Delikatny ciepły okład z 9 poziomami. Aktywny '
    'tryb wskazuje czerwony wskaźnik." (the other two tabs would read "Wibracje z 9 poziomami. '
    'Aktywny tryb wskazuje niebieski wskaźnik." and "Tryb mikroprądów/EMS z 9 poziomami. Aktywny '
    'tryb wskazuje zielony wskaźnik."). A small ink note under the card "Czerwone światło LED jest '
    'widoczną cechą głowicy — nie przedstawiamy go jako terapii." The red/blue/green dots are '
    'device STATUS colors only, NOT extra UI accents (the only UI accent stays navy #2E46C8). Then '
    'a navy #2E46C8 CTA button "Wybieram Rozgrzewek — 84,90 zł".')),
 '04-glowica': ('head', HEAD_MK + (
    'SECTION "głowica" — full-width proof MACRO of the massage head, crop-first from the real '
    'product photo (image 1): a frontal macro of the domed head showing chromed steel ball-tipped '
    'beads arranged in concentric rings (a larger central bead) with a visible RED LED glow in the '
    'ring between the beads — reproduce the real beads faithfully, do NOT add, remove or "fix" '
    'their number. Layout: the macro sits on the RIGHT filling most of the frame; a big typographic '
    '"21" in Fraunces ink overlaps the calm empty part of the field on the LEFT with the copy. '
    'Eyebrow "KRĘGI CIEPŁA" with the warmth-rings signature; H2 in Fraunces ink "21 stalowych kulek '
    'w koncentrycznych pierścieniach." with a soft italic navy swash under the single word '
    '"kulek"; Work Sans body "Kopułowa główka masażera ma 21 stalowych kulkowych bolców ułożonych '
    'w pierścieniach. W główce widoczne jest również czerwone światło LED."; a small ink micro-copy '
    '"Bez dopisywania cudów. Pokazujemy dokładnie to, co znajduje się w produkcie."; an ink text '
    'link with arrow "Zobacz, gdzie możesz go używać →". No CTA button.')),
 '05-obszary': ('navy', HEAD_MK + PROD + ANAT + (
    'SECTION "obszary" — asymmetric 2x2 photo mosaic of usage areas as places of contact (NOT '
    'treatment). Header: eyebrow "TWÓJ RYTM" with the warmth rings; H2 in Fraunces ink "Kark, '
    'ramiona, plecy albo uda." with a soft italic navy swash under the single word "uda"; a Work '
    'Sans body line "Wybierz obszar i prowadź masażer ręcznie, dopasowując poziom do własnych '
    'preferencji." Then a 2x2 mosaic of four close home photos, each a hand/body fragment WITHOUT a '
    'face, always the NAVY product on cozy home textiles in warm evening light, with a small ink '
    'caption chip: "Kark", "Ramiona", "Plecy", "Uda". Under the mosaic a small ink note "To produkt '
    'do domowego masażu i relaksu, nie urządzenie lecznicze." and an ink text link "Sprawdź '
    'ładowanie i czas pracy →". NEG: no anatomical diagrams, no red pain-zone maps; the "Uda" tile '
    'has NO cellulite / anti-cellulite / slimming framing, NO measuring tape, NO bikini/fitness '
    'styling — a neutral loungewear home shot.' + NEG_PERSON)),
 '06-autonomia': ('navy', HEAD_MK + PROD + (
    'SECTION "autonomia" — practical spec cards, code-style, with a small packshot. Header: eyebrow '
    '"NAŁADUJ I UŻYWAJ BEZ PRZEWODU" with the warmth rings; H2 in Fraunces ink "Około 50 minut '
    'pracy po naładowaniu." with a soft italic navy swash under the single word "pracy". A row of '
    'FOUR identical white cards (radius 18, 1px hairline), each with a thin 1.75px ink outline icon '
    'and a BIG Fraunces value over a Work Sans caption: card 1 "ok. 1200 mAh" / "Pojemność '
    'baterii"; card 2 "ok. 3 h" / "Czas ładowania"; card 3 "ok. 50 min" / "Czas pracy"; card 4 '
    '"ok. 30 min" / "Automatyczne wyłączenie". To the side a small clean NAVY packshot resting on a '
    'side table by a warm lamp. Under the cards a small ink note "Obudowa: ABS i TPR. Produkt '
    'zgodny z CE i RoHS." and a navy #2E46C8 CTA button "Zamawiam za 84,90 zł". NEG: do NOT show a '
    'charging-port close-up or a cable.')),
 '07-zdjecia-kupujacych': ('navy', HEAD_MK + PROD + (
    'SECTION "zdjęcia kupujących" — user-photo proof grid. Header: eyebrow "POZA PACKSHOTEM" with '
    'the warmth rings; H2 in Fraunces ink "Zdjęcia od kupujących." with a soft italic navy swash '
    'under the single word "kupujących"; a Work Sans body line "Prawdziwe domowe kadry granatowego '
    'wariantu — bez ocen, gwiazdek i liczników popularności." Then a calm grid of THREE real '
    'home-style buyer photos of the NAVY product (held in hand / next to a plain box / on a table '
    'in a real home), each in a soft rounded card with a small ink caption chip under it reading '
    '"Granatowy wariant Blue". Then a navy #2E46C8 CTA button "Chcę granatowy Rozgrzewek". '
    'ABSOLUTELY no star ratings, no numeric review counts, no popularity counters, no badges.')),
 '08-mid-cta': ('navy', HEAD_MK + PROD + (
    'SECTION "mid-cta" — decision moment as a light card. Eyebrow "MAŁY RYTUAŁ DLA SIEBIE" with the '
    'warmth-rings signature acting as a soft swash (not a decorative blob); H2 in Fraunces ink '
    '"Rozgrzewek w jednej, stałej cenie." with a soft italic navy swash under the single word '
    '"cenie"; price "84,90 zł" BIG in Fraunces centered; a navy #2E46C8 CTA button "Wybieram '
    'Rozgrzewek" (white text); a risk-reducer line "Możesz zapłacić przy odbiorze. Masz 14 dni na '
    'zwrot." On the RIGHT a small clean isolated NAVY packshot on a subtle white/peach color field, '
    'no props, no food, no badges.')),
 '09-faq': (None, HEAD_MK + (
    'SECTION "faq" — accessible accordion, NO decorative photography. Header: H2 in Fraunces ink '
    '"Zanim zamówisz — konkretnie i bez przesady." An accordion of EIGHT full-width rows separated '
    'by hairlines, each with a thin ink "+" chevron on the right; the FIRST row EXPANDED shows its '
    'question in Fraunces and its answer in Work Sans, the rest collapsed (question only). The '
    'eight questions VERBATIM: "Czy masażer grzeje bardzo mocno?" (expanded answer: "Nie. To '
    'delikatny ciepły okład, a nie intensywne grzanie jak od żelazka. Jeśli szukasz bardzo wysokiej '
    'temperatury, ten produkt może nie odpowiadać Twoim oczekiwaniom."), "Czy intensywność będzie '
    'dla mnie wystarczająca?", "Czy rączka jest długa?", "Jak sprawdzę ustawiony poziom?", "Jak '
    'długo działa po naładowaniu?", "Jaki kolor otrzymam?", "Czy mogę zapłacić przy odbiorze?", '
    '"Czy mogę zwrócić produkt?". Below the list a navy #2E46C8 CTA button "Przejdź do zamówienia '
    '— 84,90 zł". Only thin ink plus/minus signs as visuals; no medical illustrations.')),
 '10-zamow': ('navy', HEAD_MK + PROD + (
    'SECTION "zamówienie" — on-page checkout skin, NO color selector. Header: eyebrow "ZAMÓWIENIE"; '
    'H2 in Fraunces ink "Zamów granatowy Rozgrzewek." Two columns 7/5. LEFT ~58% a form card with '
    'labelled white input fields (1px hairline, radius 10): "Imię i nazwisko", "Telefon", '
    '"E-mail", "Ulica i numer", "Kod pocztowy", "Miejscowość", and a small "Ilość" quantity '
    'stepper; a payment choice with two pills "Płatność przy odbiorze" and "BLIK / płatność '
    'online". RIGHT ~42% a sticky summary card: a small clean NAVY product thumbnail, product name '
    '"Rozgrzewek — podgrzewany masażer do ciała", a line "Wariant: Granatowy (Blue)" (NO selector, '
    'no other-color swatches), "Cena produktu: 84,90 zł", then a summary block with three lines '
    '"Produkt: 84,90 zł", "Dostawa: Kurier — 15,00 zł", "Razem: 99,90 zł"; BELOW the summary a '
    'full-width navy #2E46C8 CTA button "Zamawiam z obowiązkiem zapłaty" (white text) and under it '
    'a small line "Masz 14 dni na odstąpienie od umowy." The delivery cost and full total are '
    'visible BEFORE the button. NEG: no "darmowa dostawa", no delivery-time promise, no color '
    'selector.')),
 '11-final': ('navy', HEAD_MK + PROD + (
    'SECTION "final" — full warm closing scene, copy at the BOTTOM. The scene: an early-evening '
    'cozy Polish home, the NAVY massager lying calmly on a side table beside a mug of tea, a soft '
    'blanket and a warm glowing lamp, lots of empty negative space; the warmth-rings signature '
    'returns near the eyebrow. Copy in the lower area: eyebrow "CIEPŁO ZATACZA KRĘGI"; H2 in '
    'Fraunces ink "Zrób miejsce na mały wieczorny rytuał." with a soft italic navy swash under the '
    'single word "rytuał"; Work Sans body "Delikatne ciepło, wibracje i tryb EMS możesz ustawić na '
    'jednym z 9 poziomów i używać na wybranym obszarze ciała."; price "84,90 zł" in Fraunces; a '
    'navy #2E46C8 CTA button "Przejdź do zamówienia"; a risk-reducer line "Płatność przy odbiorze • '
    '14 dni na zwrot". Under it a minimalist footer strip with small ink links "Regulamin · '
    'Polityka prywatności · Dane sprzedawcy" (no shop name text).')),
}


def refs_for(kind):
    if kind == 'navy':
        return [NAVY, STYL], [{'url': NAVY_URL, 'type': 'product'}, {'url': STYL_URL, 'type': 'ref'}]
    if kind == 'head':
        return [HEAD, STYL], [{'url': HEAD_URL, 'type': 'product'}, {'url': STYL_URL, 'type': 'ref'}]
    return [STYL], [{'url': STYL_URL, 'type': 'ref'}]


def gen(section):
    kind, body = TASKS[section]
    prompt = body + EXCL + DNA
    local, edge = refs_for(kind)
    return G.generate(section, '%s.png' % section, prompt, local, edge, '3:2',
                      'rozgrzewek-m-%s' % section)


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
print('GOTOWE desktop: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))

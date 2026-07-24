# -*- coding: utf-8 -*-
"""Pary MOBILE makiet ZAPINEK (F2.4): mobile WSZYSTKICH sekcji, PROJEKT OD ZERA pod 390px
(nie scisniety desktop). 2:3. Ref: makieta DESKTOP danej sekcji (tresc/produkt/scena, image1)
+ styl-master (styl, image2). Copy VERBATIM (ASCII-izowana). local HIGH -> fallback edge MEDIUM.
Pliki -> makiety/NN-sekcja-m.png. Uzycie: python gen-mobile.py all | 01-hero 03-zastosowania ..."""
import os, sys, shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
import genlib as G
from common import DNA, PROD, ANAT, HEAD_M, EXCL

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
MAKDIR = os.path.join(HERE, 'makiety')
STYL = os.path.join(HERE, 'brand', '00-styl-master.png')
STYLU = G.PUB + 'bud-assets/zapinek/brand/00-styl-master.webp'
MAKU = G.PUB + 'bud-assets/zapinek/makiety/'

IMG1 = (
 'Image 1 = the DESKTOP mockup of THIS exact section: reuse the SAME Polish copy, the SAME '
 'product look and the SAME photographic scene, but COMPLETELY REDESIGN the layout into ONE '
 'narrow vertical phone column FOR mobile — never a squeezed desktop, never keeping side by side '
 'what belongs stacked. Image 2 = style reference ONLY (palette/type), do NOT reproduce its '
 'specimen tiles. ')

ANTI_BLEED = (
 ' HARD ANTI-BLEED: Output MUST be ONLY this one phone section and NOTHING else — NO '
 'design-system / specimen board, NO palette swatches or hex codes, NO tiles labelled "PALETA / '
 'TYPOGRAFIA / SYGNATURA / PRODUKT / IKONY / SWIAT", NO spec strip. If any styl-master board '
 'content appears, the mockup is WRONG. ')

# (use_prod, use_anat, body). mid-cta: use_prod=False (black variant spec inline).
TASKS = {
 '01-hero': (True, False, (
    'MOBILE HERO, fold-first, archetype B redesigned for a 390px phone (per plan: copy and offer '
    'FIRST inside the fold, the scene BELOW). A compact top strip with the "Zapinek" wordmark only '
    '(NO floating trust-chip or badge overlapping the scene). Then, ALL inside the first fold: '
    'eyebrow ALL-CAPS "ZAPINEK 2-W-1"; H1 in Fraunces (floor 38px, 2-3 short lines) "Przypnij przy '
    'zaglowku. Po jezdzie ruszaj na spacer." with a short violet stitch-line under "spacer"; ONE '
    'Manrope subline "Pas, ktory po zdjeciu dziala jako smycz."; then a DISTINCT micro-offer block '
    'with clear margin: the price "19,90 zl" big in Fraunces, a full-width violet #7440A8 CTA '
    'button "Zamawiam Zapinek — 19,90 zl" (white text, radius 10), and a risk line "Platnosc przy '
    'odbiorze - Zwrot 14 dni". BELOW the fold a compact hero SCENE (a calm beagle secured by the '
    'purple belt on a car back seat, product razor-sharp, scene taking AT MOST ~42% of the board '
    'height, warm ivory tones, green light-blur in the window). HARD RULE: price and CTA sit ABOVE '
    'the scene, inside the first phone fold with clear margin. No star ratings anywhere.')),

 '02-trust': (False, False, (
    'MOBILE trust band on a sandy-cream band #EFE5DA (code/CSS, NO product, NO photography). THREE '
    'cells STACKED vertically (one per row, NEVER 3 side-by-side at 390px), each a thin 1.75px ink '
    'OUTLINE icon + title + one line: "19,90 zl" / "Jedna uczciwa cena, bez ukrytych kosztow."; '
    '"Platnosc przy odbiorze" / "Placisz kurierowi dopiero przy odbiorze paczki."; "Zwrot 14 dni" '
    '/ "Nie pasuje? Odsylasz w 14 dni, bez tlumaczenia." Hairline separators, one short violet '
    'dashed stitch-line. One consistent icon set. No prices as hero, no star ratings, no product '
    'image, no review counts.')),

 '03-zastosowania': (True, True, (
    'MOBILE TOR-I two-state section (must show BOTH states). At the top a FULL-WIDTH two-segment '
    'toggle "W aucie" | "Na spacerze", LEFT "W aucie" ACTIVE filled violet #7440A8. Below, the two '
    'states STACKED VERTICALLY (never side by side at 390px): FIRST the active "W aucie" scene '
    'full-width — a calm medium dog on a car seat secured by the purple belt over the headrest, '
    'caption "Zaloz petle na zaglowek, wyreguluj i przypnij." + a small ink text-link "alternatywny '
    'zamek do gniazda pasa"; THEN below it the "Na spacerze" scene full-width — a caretaker\'s hand '
    '(no face) holding the SAME purple strap as a leash, a dog walking on a sunlit path, caption '
    '"Po podrozy zdejmij Zapinek i uzyj go jako smyczy." + a small spec chip "regulacja 41-71 cm". '
    'Product sharp and faithful in both (purple webbing, black plastic buckles, silver ring, single '
    'purple flower charm, swivel carabiner on the dog\'s own collar). Icons charcoal outline. No CTA '
    'button.')),

 '04-montaz': (True, True, (
    'MOBILE 1-2-3 assembly demo (must show THREE steps). Header: eyebrow ALL-CAPS "BEZ NARZEDZI"; '
    'H2 in Fraunces "Zaloz, wyreguluj, przypnij."; a Manrope intro "Montaz zajmuje chwile — '
    'zrobisz to sam." Then THREE step cards STACKED VERTICALLY connected by ONE vertical dashed '
    'violet stitch-line (one per row, NEVER side-by-side at 390px), each with an in-card number '
    '"01"/"02"/"03" in Fraunces, a bold word-label and a photo + caption: card 01 "Zaloz" photo = '
    'hands (no face) looping the purple strap over the headrest posts, caption "Zaloz petle na '
    'slupki zaglowka."; card 02 "Wyreguluj" photo = hands adjusting the black plastic length '
    'buckle, caption "Ustaw dlugosc czarna klamra."; card 03 "Przypnij" photo = clipping the '
    'silver swivel carabiner to the dog\'s own collar, caption "Wepnij karabinczyk w obroze psa." '
    'Below, a small inset note with a thin ink icon "Alternatywnie: czarny zamek-jezyczek wpinasz '
    'w fabryczne gniazdo pasa." Sharp faithful product, icons charcoal outline. No CTA button.')),

 '05-detale': (True, False, (
    'MOBILE detale — FOUR macro studies on real cream car upholstery, arranged as a compact 2x2 '
    'grid of square tiles (NOT a wide row), cool-neutral light. Header: eyebrow ALL-CAPS "ZROBIONE '
    'SOLIDNIE"; H2 in Fraunces "Tasma, klamra, karabinczyk — z bliska." The four tiles, each with a '
    'small charcoal spec caption: "Gesto tkana tasma nylonowa" (woven purple webbing macro); '
    '"Obrotowy karabinczyk 360°" (swivel bolt-snap carabiner with its rotating joint); "Czarna '
    'klamra i regulacja" (black plastic snap buckle + adjuster); "Ozdobny kwiatek 3D" (single '
    'purple flower charm with yellow centre). Faithful product, one series radius, one violet '
    'dashed stitch-line, charcoal outline icons. No CTA button.')),

 '06-mid-cta': (False, False, (
    'MOBILE mid-cta decision card. A warm full-width SCENE on TOP (~42% of the board): a calm puppy '
    'on a bright car seat wearing the documented BLACK variant of the belt — BLACK nylon webbing, a '
    'single decorative 3D flower charm with BLUE petals and a PINK centre (do NOT render it '
    'purple), a silver triangular ring and a silver swivel bolt-snap carabiner on the dog\'s own '
    'collar, black plastic snap buckle and adjuster. Then a sandy-cream #EFE5DA card: eyebrow '
    'ALL-CAPS "AUTO CZY SPACER"; H2 in Fraunces "Auto czy spacer? Zapinek jest gotowy na oba."; the '
    'price "19,90 zl" big in Fraunces; a full-width violet #7440A8 CTA button "Przejdz do '
    'zamowienia — 19,90 zl" (white text, radius 10); a risk line "Platnosc przy odbiorze - Zwrot '
    '14 dni". Exactly ONE flower charm, black plastic buckles, no logos on webbing. No star '
    'ratings.')),

 '07-galeria': (True, False, (
    'MOBILE gallery. Header: eyebrow ALL-CAPS "ZOBACZ Z BLISKA"; H2 in Fraunces "Zapinek w kadrze." '
    'Then a 2-COLUMN grid of SQUARE (1:1) photo tiles (one series radius each) of the SAME purple '
    'Zapinek in real settings: the beagle on the back seat; a golden retriever with its owner; '
    'hands looping the strap over the headrest; the black plastic buckle close-up; the black '
    'seat-belt tongue in a car buckle slot; a macro of the webbing and flower charm; a small dog in '
    'the black variant; the purple strap used as a leash on a walk. Small charcoal caption chips, '
    'NO slide numbers, NO frame counter, consistent warm grading. One violet dashed stitch-line. No '
    'CTA button, no star ratings.')),

 '08-wideo': (True, False, (
    'MOBILE video rail. Header: eyebrow ALL-CAPS "ZAPINEK W UZYCIU"; H2 in Fraunces "Zobacz, jak '
    'dziala naprawde." Then a HORIZONTAL scroll RAIL of VERTICAL (9:16) video cards: the first two '
    'portrait cards fully visible and a third peeking at the right edge (a scroll cue), each a real '
    'vertical thumbnail of the purple Zapinek in use with a centred thin ink OUTLINE play button '
    'and a small charcoal caption chip "Zapinek w uzyciu" — NO view counts, NO play numbers, NO '
    '"opinie" label, NO social-proof frames. One violet dashed stitch-line. No CTA button, no star '
    'ratings.')),

 '09-faq': (True, False, (
    'MOBILE FAQ accordion. Header: eyebrow ALL-CAPS "ZANIM ZAMOWISZ"; H2 in Fraunces "Konkretnie, '
    'bez owijania." An accordion of EIGHT full-width rows separated by hairlines, each with a thin '
    'ink "+" / "−" chevron on the right; the FIRST row EXPANDED "Czy Zapinek pasuje do mojego '
    'zaglowka?" with the answer in Manrope "Pasuje do wiekszosci zaglowkow — pasek na zaglowek '
    'reguluje sie w zakresie 40-55 cm.", the rest collapsed (question only): "Jak zmienia sie w '
    'smycz?", "Czy moge wpiac go do gniazda pasa?", "Czy nadaje sie dla malego i duzego psa?", '
    '"Czy tasma sie skreca?", "Z czego jest wykonany?", "Jakie sa kolory?", "Jak place i co ze '
    'zwrotem?". Below the list a small subtle packshot of the purple strap on an off-white card. '
    'Only thin ink plus/minus visuals, charcoal outline icons. One violet dashed stitch-line. No '
    'star ratings.')),

 '10-zamow': (True, False, (
    'MOBILE checkout skin, one narrow column. Header: eyebrow ALL-CAPS "ZAMOWIENIE"; H2 in Fraunces '
    '"Zamow Zapinek." A compact product row on top: a clean thumbnail of the purple Zapinek on '
    'cream car upholstery + the name "Zapinek — pas i smycz 2-w-1" + "Cena: 19,90 zl". Then STACKED '
    'white input fields (1px hairline, radius 10): "Imie i nazwisko", "Telefon", "Ulica i numer", '
    '"Kod pocztowy", "Miejscowosc". Then a colour selector row of round swatches — THREE with real '
    'product photos (purple selected with a violet ring, black, red) and a few more as plain '
    'coloured dots with SHORT NAME LABELS, exactly these five: "Jasnoniebieski", "Granatowy", "Rozowy", "Pomaranczowy", "Czarny B" (ONLY real SKU colours - NEVER invented colours like Bezowy/Bialy/Brazowy, NEVER hex codes). Total 8 swatches. A payment pill "Platnosc przy '
    'odbiorze" (selected) with a small row of pay badges "BLIK", "Visa", "Mastercard", "COD". A '
    'summary "Produkt: 19,90 zl". A full-width violet #7440A8 CTA button "Zamawiam — 19,90 zl" '
    '(white text) and under it "Platnosc przy odbiorze - Zwrot 14 dni". Faithful product. NEG: no '
    'crossed-out price, no delivery-time promise, no fake urgency, NO hex-code colour labels.')),

 '11-final': (True, True, (
    'MOBILE closing scene. A warm SCENE on TOP (~45% of the board): a woman in her thirties in a '
    'cream sweater beside a golden retriever on the car front seat, the dog secured by the purple '
    'belt over the headrest — single purple flower charm, silver ring, swivel carabiner on the '
    'dog\'s own collar; warm afternoon light, distant green foliage beyond the windows, calm, no '
    'exaggerated stock smile. Then copy: eyebrow ALL-CAPS "WSPOLNA DROGA"; H2 in Fraunces "Ta sama '
    'tasma, cala wspolna droga."; a Manrope line "Od bezpiecznej jazdy do wspolnego spaceru — '
    'jeden Zapinek."; the price "19,90 zl" in Fraunces; a full-width violet #7440A8 CTA button '
    '"Zamawiam Zapinek — 19,90 zl" (white text, radius 10); a risk line "Platnosc przy odbiorze - '
    'Zwrot 14 dni". One violet dashed stitch-line. Product static and faithful. No star '
    'ratings.')),
}


def refs_for(section):
    d_local = os.path.join(MAKDIR, '%s.png' % section)
    d_url = MAKU + '%s.webp' % section
    return ([d_local, STYL], [{'url': d_url, 'type': 'ref'}, {'url': STYLU, 'type': 'ref'}])


def gen(section):
    use_prod, use_anat, body = TASKS[section]
    prompt = (HEAD_M + IMG1 + (PROD if use_prod else '') + (ANAT if use_anat else '')
              + body + EXCL + ANTI_BLEED + DNA)
    local, edge = refs_for(section)
    path = G.generate(section, '%s-m.png' % section, prompt, local, edge, '2:3', 'zapinek-m-%s' % section)
    dst = os.path.join(MAKDIR, '%s-m.png' % section)
    shutil.copyfile(path, dst)
    return dst


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

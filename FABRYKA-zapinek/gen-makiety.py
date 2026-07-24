# -*- coding: utf-8 -*-
"""Makiety DESKTOP ZAPINEK — F2, 3:2. local HIGH -> fallback edge MEDIUM.
Brief CELU + PRAWDZIWE dane VERBATIM (cena 19,90 zl, zakresy 41-71 / 40-55 cm, 360, trust).
Copy ASCII-izowane (gpt-image gubi PL diakrytyki; kod F4 nadpisuje tekst) — jak styl-master.
Ref: kanon produktu (g1 / c-montaz / c-smycz / c-szczeniak / g5) + styl-master (styl).
Pliki -> makiety/NN-sekcja.png. Uzycie: python gen-makiety.py all | 01-hero 03-zastosowania ..."""
import os, sys, shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
import genlib as G
from common import DNA, PROD, ANAT, HEAD_D, EXCL

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
GAL = os.path.join(HERE, 'galeria-kuracja')
MAKDIR = os.path.join(HERE, 'makiety')
os.makedirs(MAKDIR, exist_ok=True)

STYL = os.path.join(HERE, 'brand', '00-styl-master.png')
G1 = os.path.join(GAL, 'g1.png')
CMONTAZ = os.path.join(GAL, 'c-montaz.png')
CSMYCZ = os.path.join(GAL, 'c-smycz.png')
CSZCZ = os.path.join(GAL, 'c-szczeniak.png')
G5 = os.path.join(GAL, 'g5.png')

R = G.PUB + 'bud-assets/zapinek/'
STYLU = R + 'brand/00-styl-master.webp'
G1U = R + 'refs/g1.webp'
CMONTAZU = R + 'refs/c-montaz.webp'
CSMYCZU = R + 'refs/c-smycz.webp'
CSZCZU = R + 'refs/c-szczeniak.webp'
G5U = R + 'refs/g5.webp'


def refs_for(kind):
    """(local_paths, edge_urls_typed). Produkt(y) pierwsze (fidelity /edits), styl-master jako
    referencja stylu na koncu (kanon serii; anti-bleed w EXCL/DNA)."""
    if kind == 'g1':
        return [G1, STYL], [{'url': G1U, 'type': 'product'}, {'url': STYLU, 'type': 'ref'}]
    if kind == 'montaz':
        return [CMONTAZ, STYL], [{'url': CMONTAZU, 'type': 'product'}, {'url': STYLU, 'type': 'ref'}]
    if kind == 'zast':
        return [G1, CSMYCZ, STYL], [{'url': G1U, 'type': 'product'},
                                    {'url': CSMYCZU, 'type': 'ref'}, {'url': STYLU, 'type': 'ref'}]
    if kind == 'black':
        return [CSZCZ, STYL], [{'url': CSZCZU, 'type': 'product'}, {'url': STYLU, 'type': 'ref'}]
    if kind == 'g5':
        return [G5, STYL], [{'url': G5U, 'type': 'product'}, {'url': STYLU, 'type': 'ref'}]
    return [STYL], [{'url': STYLU, 'type': 'ref'}]   # 'styl'


# TASKS: klucz = plik; wartosc = (refs_kind, use_prod, use_anat, body).
# use_prod dokleja PROD (wiernosc PURPLE) — dla mid-cta (black variant) use_prod=False (spec inline).
TASKS = {
 '01-hero': ('g1', True, False, (
    'HERO section, archetype B — a bright photographic BACKGROUND with a hero-inner SPLIT: copy on '
    'the LEFT, an offer CARD-ASIDE on the RIGHT. Designed to be animatable as a looping hero-video. '
    'THE STAGE (a full-bleed warm background that MELTS into the page, NOT a bordered postcard/card): '
    'a warm sunlit car interior with cream-grey upholstery; a calm beagle rests on the back seat, '
    'secured by the purple nylon dog car belt looped over the headrest — the product razor-sharp and '
    'static, dominating the RIGHT half of the frame (at least ~50% of the hero area). Soft green '
    'foliage and gentle light blur through the far window in the UPPER-RIGHT — this motion zone stays '
    'FREE of any text or overlay. The scene background is toned to the ivory page #FBF7F1 so its '
    'edges dissolve into the page (no frame, no border, no radius, no drop-shadow around the scene). '
    'A slim topbar on top: the "Zapinek" wordmark on the LEFT (Fraunces ink) and enumerated nav links '
    'on the RIGHT, EXACTLY these three: "W aucie i na spacerze", "Montaz", "FAQ" — never "Opinie". '
    'COPY on the LEFT over a soft PAPER-coloured scrim (NEVER a dark scrim): eyebrow ALL-CAPS tracked '
    '"ZAPINEK 2-W-1"; a BIG Fraunces H1 "Przypnij przy zaglowku. Po jezdzie ruszaj na spacer." with '
    'ONE short violet dashed stitch-line under the word "spacer"; a Manrope subline "Pas samochodowy, '
    'ktory po zdjeciu dziala jako smycz."; then a risk-reducer line "Platnosc przy odbiorze - Zwrot '
    '14 dni". The OFFER CARD-ASIDE (off-white #FFFDFC, radius 16, warm layered shadow) sits on the '
    'RIGHT over the static lower-right seat area, clear of the upper-right motion zone: the price '
    '"19,90 zl" BIG in Fraunces, a short "pas + smycz" line, a designed full-width violet #7440A8 CTA '
    'button "Zamawiam Zapinek — 19,90 zl" (white text, radius 10), and under it "Platnosc przy '
    'odbiorze - Zwrot 14 dni". No star ratings and no review numbers anywhere in the hero.')),

 '02-trust': ('styl', False, False, (
    'SECTION "trust" — a slim reassurance BAND on a sandy-cream band #EFE5DA (code/CSS section, NO '
    'photography, NO product), continuous with the hero page. THREE equal trust cells in one row, '
    'each a thin 1.75px ink OUTLINE icon (never violet) above a short label and a one-line note: '
    'cell 1 icon a price tag — title "19,90 zl", note "Jedna uczciwa cena, bez ukrytych kosztow."; '
    'cell 2 icon a hand-with-coin (cash on delivery) — title "Platnosc przy odbiorze", note '
    '"Placisz kurierowi dopiero przy odbiorze paczki."; cell 3 icon a return arrow — title "Zwrot '
    '14 dni", note "Nie pasuje? Odsylasz w 14 dni, bez tlumaczenia." Thin hairline separators '
    'between cells and one short violet dashed stitch-line under the band. The band fills its full '
    'height (no dead lower third). One consistent icon set. NO star ratings, NO best-seller badges, '
    'NO product image, NO review counts.')),

 '03-zastosowania': ('zast', True, True, (
    'SECTION "zastosowania" — a TOR-I two-state demonstrator with a toggle "W aucie" | "Na '
    'spacerze". The mockup MUST show BOTH STATES as two large framed scenes of equal weight, so the '
    'reader sees the same strap change role. Header row: eyebrow ALL-CAPS "JEDNA TASMA, DWIE ROLE"; '
    'Fraunces H2 "W aucie pas, na spacerze smycz."; a pill toggle with two segments — LEFT "W '
    'aucie" shown ACTIVE filled violet #7440A8, RIGHT "Na spacerze" inactive ink outline. Below, '
    'TWO large scene frames SIDE BY SIDE: LEFT frame (active, "W aucie") = a calm medium dog sits on '
    'a car seat wearing its OWN collar, secured by the purple nylon belt looped over the headrest '
    'post, three-quarter view from the open door, warm daylight, cream upholstery — caption under it '
    '"Zaloz petle na zaglowek, wyreguluj i przypnij." and a small ink text-link "alternatywny zamek '
    'do gniazda pasa"; RIGHT frame ("Na spacerze") = a bright outdoor walk, a caretaker\'s hand (no '
    'face) holds the SAME purple strap used as a leash, a friendly medium dog walking on a sunlit '
    'paved path, green parkland blurred behind — caption "Po podrozy zdejmij Zapinek i uzyj go jako '
    'smyczy." plus a small spec chip "regulacja 41-71 cm". Product sharp and faithful in BOTH frames '
    '(purple webbing, black plastic buckles, silver triangular ring, single purple flower charm, '
    'swivel bolt-snap carabiner on the dog\'s own collar). Icons charcoal outline, one series '
    'radius. No CTA button.')),

 '04-montaz': ('montaz', True, True, (
    'SECTION "montaz" — a 1-2-3 assembly demo, code-style cards contained on the ivory page. This '
    'mockup MUST show the THREE steps as SEPARATE frames. Header: eyebrow ALL-CAPS "BEZ NARZEDZI"; '
    'Fraunces H2 "Zaloz, wyreguluj, przypnij."; a Manrope intro "Montaz zajmuje chwile — zrobisz to '
    'sam." THREE step cards in a row, each a step FRAME with its own close-medium photo inside a '
    'car, an in-card step number "01" "02" "03" in Fraunces (in-section step numbering, NOT section '
    'numbering), a bold word-label and one caption: card 01 label "Zaloz" photo = a caretaker\'s '
    'hands (no face) loop the purple nylon strap over the headrest posts, caption "Zaloz petle na '
    'slupki zaglowka."; card 02 label "Wyreguluj" photo = hands adjust the black plastic length '
    'buckle, caption "Ustaw dlugosc czarna klamra."; card 03 label "Przypnij" photo = clipping the '
    'silver swivel carabiner to the dog\'s own collar, caption "Wepnij karabinczyk w obroze psa." '
    'Black perforated leather seat-back behind, soft directed daylight, sharp faithful product '
    '(purple webbing, black plastic snap buckle and adjuster, silver triangular ring, single purple '
    'flower charm with yellow centre). Under the row a small inset note with a thin ink icon '
    '"Alternatywnie: czarny zamek-jezyczek wpinasz w fabryczne gniazdo pasa." One violet dashed '
    'stitch-line as a guide between steps. Icons charcoal outline. No CTA button.')),

 '05-detale': ('g1', True, False, (
    'SECTION "detale" — a BENTO of FOUR macro studies on REAL cream car upholstery as background '
    '(not a white studio), cool-neutral light versus the warm hero. Header: eyebrow ALL-CAPS '
    '"ZROBIONE SOLIDNIE"; Fraunces H2 "Tasma, klamra, karabinczyk — z bliska." FOUR macro tiles in '
    'a bento grid with UNEVEN sizing (one tile clearly larger), each with a small charcoal spec '
    'caption: (a) "Gesto tkana tasma nylonowa" — macro of the densely woven purple webbing; (b) '
    '"Obrotowy karabinczyk 360°" — macro of the swivel bolt-snap carabiner showing its rotating '
    'joint; (c) "Czarna klamra i regulacja" — the black plastic lockable snap buckle and the length '
    'adjuster; (d) "Ozdobny kwiatek 3D" — the single purple 3D flower charm with a yellow centre. '
    'Soft directed light, shallow depth of field, faithful product, one violet dashed stitch-line '
    'signature. Cards on border and contrast, one series radius 16, no heavy drop-shadows. Icons '
    'charcoal outline. No CTA button.')),

 '06-mid-cta': ('black', False, False, (
    'SECTION "mid-cta" — a dedicated decision moment, a full-bleed warm scene with copy and a '
    'designed CTA on a paper scrim on the LEFT. THE SCENE: a calm puppy / small dog rests on a '
    'bright car seat wearing the documented BLACK variant of the belt — BLACK nylon webbing, a '
    'single decorative 3D flower charm with BLUE petals and a PINK centre (the documented '
    'black-variant charm — do NOT render this flower purple/violet), a silver triangular ring and a silver swivel bolt-snap '
    'carabiner clipped to the dog\'s OWN collar, black plastic snap buckle and adjuster. Soft warm '
    'light, generous negative space fading into flat sandy-cream #EFE5DA on the LEFT for the copy. '
    'COPY on the scrim: eyebrow ALL-CAPS "AUTO CZY SPACER"; Fraunces H2 "Auto czy spacer? Zapinek '
    'jest gotowy na oba."; the price "19,90 zl" BIG in Fraunces; a designed full-width violet '
    '#7440A8 CTA button "Przejdz do zamowienia — 19,90 zl" (white text, radius 10); directly under '
    'it a risk line "Platnosc przy odbiorze - Zwrot 14 dni". Exactly ONE flower charm, black '
    'plastic buckles, no printed logos on the webbing. Product static. No topbar, no star '
    'ratings.')),

 '07-galeria': ('g1', True, False, (
    'SECTION "galeria" — a curated real-photo gallery, an asymmetric MOSAIC on the ivory page of '
    'SQUARE (1:1) photo tiles, all of the SAME purple Zapinek in real settings, consistent warm '
    'grading. Header: eyebrow ALL-CAPS "ZOBACZ Z BLISKA"; Fraunces H2 "Zapinek w kadrze." A mosaic '
    'of EIGHT square tiles (one series radius, a thin ink hover-zoom cue on one tile): the beagle '
    'secured on the back seat; a golden retriever with its owner by the front seat; hands looping '
    'the strap over the headrest; the black plastic buckle and adjuster close-up; the black '
    'seat-belt tongue in a car buckle slot; a macro of the woven webbing and the flower charm; a '
    'small dog in the black variant; the purple strap used as a leash on a walk. Small charcoal '
    'caption chips, NO slide numbers, NO frame counter. One violet dashed stitch-line signature. '
    'No CTA button, no star ratings.')),

 '08-wideo': ('g1', True, False, (
    'SECTION "wideo" — a horizontal RAIL of FIVE VERTICAL (9:16) video cards shown as thumbnails. '
    'Header: eyebrow ALL-CAPS "ZAPINEK W UZYCIU"; Fraunces H2 "Zobacz, jak dziala naprawde." FIVE '
    'portrait cards in a row (one series radius each), each a real vertical thumbnail of the purple '
    'Zapinek in use (a dog secured in a car, hands adjusting the buckle, the walk with the strap as '
    'a leash), each with a centred thin ink OUTLINE play button and a small charcoal caption chip '
    '"Zapinek w uzyciu" — NO view counts, NO play numbers, NO "opinie" label, NO social-proof '
    'frames. One violet dashed stitch-line signature. No CTA button, no star ratings.')),

 '09-faq': ('g1', True, False, (
    'SECTION "faq" — an honest accordion with a small product slot. Header: eyebrow ALL-CAPS '
    '"ZANIM ZAMOWISZ"; Fraunces H2 "Konkretnie, bez owijania." An accordion of EIGHT full-width '
    'rows separated by hairlines, each with a thin ink "+" / "−" chevron on the right; the FIRST '
    'row EXPANDED shows its question in Fraunces and its answer in Manrope, the rest collapsed '
    '(question only). Questions VERBATIM: row 1 EXPANDED "Czy Zapinek pasuje do mojego zaglowka?" '
    'answer "Pasuje do wiekszosci zaglowkow — pasek na zaglowek reguluje sie w zakresie 40-55 cm."; '
    'row 2 "Jak zmienia sie w smycz?"; row 3 "Czy moge wpiac go do gniazda pasa?"; row 4 "Czy '
    'nadaje sie dla malego i duzego psa?"; row 5 "Czy tasma sie skreca?"; row 6 "Z czego jest '
    'wykonany?"; row 7 "Jakie sa kolory?"; row 8 "Jak place i co ze zwrotem?". On the side a small '
    'subtle packshot crop of the purple strap on an off-white card, one series radius. Only thin '
    'ink plus/minus visuals, charcoal outline icons. One violet dashed stitch-line signature. No '
    'star ratings.')),

 '10-zamow': ('g1', True, False, (
    'SECTION "zamow" — an on-page checkout skin, kotwica #zamow, two columns 7/5. Header: eyebrow '
    'ALL-CAPS "ZAMOWIENIE"; Fraunces H2 "Zamow Zapinek." LEFT ~58% a form card (off-white, one '
    'series radius) with labelled white input fields (1px hairline, radius 10): "Imie i nazwisko", '
    '"Telefon", "Ulica i numer", "Kod pocztowy", "Miejscowosc"; a colour selector row of EIGHT '
    'round swatches, THREE showing real product photos (purple, black, red) and the rest as plain '
    'coloured dots each with a SHORT COLOUR NAME label like "Bezowy", "Bialy", "Granatowy", '
    '"Brazowy" (NEVER hex codes such as #FBF7F1), the purple one selected with a violet ring; a payment choice pill "Platnosc '
    'przy odbiorze" (selected) with a small row of pay badges "BLIK", "Visa", "Mastercard", "COD". '
    'RIGHT ~42% a sticky summary card: a clean product photo of the purple Zapinek laid over cream '
    'car upholstery beside a headrest for real scale (not an isolated white packshot), the name '
    '"Zapinek — pas i smycz 2-w-1", a line "Cena: 19,90 zl", a small summary "Produkt: 19,90 zl"; '
    'BELOW it a designed full-width violet #7440A8 CTA button "Zamawiam — 19,90 zl" (white text) '
    'and under it "Platnosc przy odbiorze - Zwrot 14 dni". Faithful product (purple webbing, black '
    'plastic buckles, silver triangular ring, single purple flower charm, swivel carabiner). NEG: '
    'no crossed-out price, no delivery-time promise, no fake urgency.')),

 '11-final': ('g5', True, True, (
    'SECTION "final" — a warm end-of-journey closing scene, full-bleed, life with the product, copy '
    'and a designed CTA on a paper scrim on the RIGHT. THE SCENE: a woman in her thirties in a '
    'cream sweater sits beside a golden retriever on the car\'s front passenger seat, the dog '
    'secured by the purple nylon belt looped over the headrest — single purple flower charm, silver '
    'triangular ring, swivel bolt-snap carabiner on the dog\'s OWN collar; warm afternoon light, '
    'distant soft green foliage beyond the windows suggesting the road ahead, calm, no exaggerated '
    'stock smile; the scene background toned to the ivory page so it melts into the page. COPY on '
    'the RIGHT over a soft paper scrim: eyebrow ALL-CAPS "WSPOLNA DROGA"; Fraunces H2 "Ta sama '
    'tasma, cala wspolna droga."; a Manrope line "Od bezpiecznej jazdy do wspolnego spaceru — jeden '
    'Zapinek."; the price "19,90 zl" in Fraunces; a designed full-width violet #7440A8 CTA button '
    '"Zamawiam Zapinek — 19,90 zl" (white text, radius 10); a risk line "Platnosc przy odbiorze - '
    'Zwrot 14 dni". One violet dashed stitch-line signature. Product static and faithful. No star '
    'ratings.')),
}


def gen(section):
    kind, use_prod, use_anat, body = TASKS[section]
    prompt = HEAD_D + (PROD if use_prod else '') + (ANAT if use_anat else '') + body + EXCL + DNA
    local, edge = refs_for(kind)
    path = G.generate(section, '%s.png' % section, prompt, local, edge, '3:2', 'zapinek-d-%s' % section)
    dst = os.path.join(MAKDIR, '%s.png' % section)
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
print('GOTOWE desktop: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))

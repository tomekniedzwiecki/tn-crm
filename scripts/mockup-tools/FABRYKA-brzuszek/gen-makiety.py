# -*- coding: utf-8 -*-
"""Makiety BRZUSZEK (F2): desktop 3:2 przez wf2-gen (medium), ref = styl-master
(+ wyretuszowany packshot 'product' gdy produkt w kadrze). 11 sekcji manifestu.
Uzycie: python gen-makiety.py 01-hero ... | all"""
import io, json, os, re, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
BASE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
PACKSHOT = PUB + 'bud-assets/brzuszek/brand/packshot-retusz.webp'
STYL = PUB + 'bud-assets/brzuszek/brand/00-styl-master.webp'

DNA = ('STYLE-DNA: cool whitened-lilac page #F7F5FB with section bands #F0ECF7 and white cards '
       '#FFFFFF (NEVER warm powder pink); ink #241E2E, body #38323F, hairlines #DCD5E8; EXACTLY '
       'ONE accent fuchsia-violet #A21CAF used ONLY for the CTA button, a straight bold '
       'underline-swash under one headline word, and the LAST segment of the signature "rep bar" '
       '(a row of five short 16x3px dashes under section eyebrows — four muted lilac #C9C2D6, the '
       'fifth fuchsia-violet); all functional icons thin 1.75px outline in ink; display font '
       'Archivo Expanded (wide sporty poster sans, weights 700-800) for headlines, prices and BIG '
       'numbers (5 · 2 · ≈200 kg); text font Figtree; one series radius 24px (cards) / 12px '
       '(small); trust-pills: white fill, 1px hairline border, ink text; soft layered warm-ambient '
       'shadows, subtle grain on bands only; light backgrounds only; the machine ALWAYS white '
       'frame + pink foam rollers. Polish diacritics correct. No watermarks, no phone frames, '
       'crisp UI. ')

# Fidelity block — F1 rule: NO construction description; geometry comes ONLY from the ref.
PROD = ('The folding ab exercise machine shown must faithfully match the product reference image '
        'EXACTLY (image 1): the same white steel A-frame, pink U-shaped foam knee roller on a '
        'sliding front cart, two pink cylindrical rollers beside a white LCD console, handlebar '
        'grips, resistance bands with black foam handles, and two floor crossbars — do not invent '
        'a different device. NEG: no printed brand text or logo on the product, no flat sit-up '
        'bench, no exercise bike/stepper/orbitrek, no weight plates/dumbbells, no black-red or '
        'black-blue variant — white frame with pink rollers only. ')

# Gate anatomii — every scene with a person.
ANAT = ('Person: a woman aged 28-45 with a realistic healthy everyday figure (NOT a fitness '
        'model, no six-pack), kneeling with BOTH knees on the pink U-shaped roller, forearms/chest '
        'resting on the pink rollers by the console, hands on the handlebar grips, wrists straight, '
        'natural body proportions, face turned away from camera / not emphasized; everyday '
        'leggings + top. ')

HEAD = ('High-fidelity DESKTOP landing page SECTION mockup on a 3:2 landscape board, section '
        'shown full-width like a real webpage fragment (~1280px design), Figma-style, '
        'pixel-perfect, clean design system, Polish e-commerce. ')

EXCL = (' STRICT: EXACTLY ONE SECTION AND NOTHING ELSE. Flat edge-to-edge section screenshot, no '
        'browser chrome, no URL bar, no device frame, no outer mockup shadow. No watermark, no '
        'lorem ipsum, no crossed-out prices, no bestseller/"NR 1" badges, no free-shipping claims, '
        'NO star ratings, NO review counts, NO sold counts, no section numbering like "01/11", no '
        'health or weight-loss claims, no calorie-burn promises, no training-time claims (no '
        'minutes), no body-shaming, no invented product dimensions or weight numbers (the '
        '"≈200 kg" load figure IS allowed), no "MERACH", no shop name, no bodybuilder, no '
        'bikini/glamour, no gym/showroom, no fantasy scenery (palms/beach/mountains), no dark '
        'backgrounds, no extra text beyond the quoted Polish strings.')

NEG_PERSON = (' NEG scene with person: no bodybuilder, no six-pack fitness model, no bikini or '
              'glamour, no gym or showroom, no children operating the machine.')

TASKS = {
 '01-hero': HEAD + PROD + ANAT + (
    'HERO, archetype C = lifestyle scene with an OFFER CARD overlapping its bottom edge. Slim '
    'topbar on top: brand lockup left ("Brzuszek" wordmark in Archivo ink) and enumerated nav '
    'links right, EXACTLY these three: "Jak ćwiczysz", "Regulacja", "FAQ". The SCENE fills the '
    'section as a wide bright real Polish living room in soft cool morning daylight: the woman '
    'performs a slow controlled crunch on the machine (faithful to reference); parquet floor, a '
    'rug, a sofa and a leafy houseplant behind her, a window with a light sheer curtain — reads '
    'as cool whitened lilac mist, NOT warm powder pink; the visual weight of the scene sits on '
    'the RIGHT. On the LOWER-LEFT a white micro-offer card (radius 24, layered warm shadow, width '
    '~560px) OVERLAPS the bottom edge of the scene by ~64px: eyebrow ALL-CAPS "TWOJA DOMOWA SERIA" '
    'with the signature rep bar (five 16x3px dashes, fifth fuchsia) under it; big display H1 in '
    'Archivo Expanded ink "Brzuch i core. U siebie." with a straight bold fuchsia #A21CAF '
    'underline-swash under the single word "core"; one Figtree subline "Skladana maszyna z '
    'ruchomym wozkiem, 5 wysokosciami, 2 katami nachylenia i licznikiem LCD."; price "429,00 zł" '
    'BIG in Archivo; full-width fuchsia #A21CAF CTA button "Zamawiam Brzuszek" (white text, radius '
    '12); micro-copy row "Płatność przy odbiorze, BLIK lub online · 14 dni na zwrot". Under the '
    'card three trust pills in one row (white fill, 1px hairline, ink text): "Składana '
    'konstrukcja", "2 kąty · 5 wysokości", "Udźwig ≈ 200 kg".' + NEG_PERSON),
 '02-problem': HEAD + (
    'SECTION "problem" — code-only band, NO product and NO scene photo (deliberate). On a section '
    'band #F0ECF7: eyebrow ALL-CAPS "ZNASZ TO?" with the rep bar under it; H2 in Archivo Expanded '
    'ink "Mata, karnet, aplikacja — i tak się to rzuca." with a straight bold fuchsia swash under '
    'the single word "rzuca"; then a row of THREE contrast tiles (white cards, radius 24, 1px '
    'hairline, generous padding), each with a thin 1.75px OUTLINE icon in ink at top (tile 1: a '
    'rolled exercise mat; tile 2: a gym membership card; tile 3: an ab-roller wheel + a phone app) '
    'and one Figtree line in ink: tile 1 "Brzuszki na macie → boli kręgosłup i szyja, a nuda '
    'wygrywa."; tile 2 "Karnet na siłownię → drogo, daleko, brak czasu."; tile 3 "Ab-roller i '
    'aplikacje → za trudne na start, porzucone po tygodniu."; below the three tiles ONE centered '
    'bridge line in ink "Dlatego robisz to u siebie, po swojemu — na sprzęcie, który reguluje '
    'trudność." The contrast is about METHODS, not bodies — no human figures, no product, no '
    'photography anywhere. No CTA button in this section.'),
 '03-jak-cwiczysz': HEAD + PROD + (
    'SECTION "jak ćwiczysz" — interactive DEMO (TOR-I) showing THREE STATES. Header row: eyebrow '
    '"JAK ĆWICZYSZ" with the rep bar; H2 in Archivo Expanded "Ustaw. Oprzyj się. Napnij i suń." '
    'with a fuchsia swash under the single word "suń". LEFT ~58%: a big photo STAGE card (radius '
    '24) on a bright lilac field showing the machine alone (faithful to reference) in 3/4 view, '
    'with subtle thin ink SVG-style markers highlighting the sliding cart position and the active '
    'support point (STATE 1 active); no person, clean product demo. RIGHT ~42%: a vertical stepper '
    'of THREE stacked white cards (radius 24, 1px hairline) connected by a thin vertical ink line: '
    'segment 1 ACTIVE (ink-filled left bar, bold): "1 · Ustaw poziom" body "Wybierz 1 z 5 '
    'wysokości i 1 z 2 kątów nachylenia; wyższe ustawienie zwiększa trudność."; segment 2 "2 · '
    'Oprzyj się stabilnie" body "Kolana lub łokcie opierasz na pogrubionym, U-kształtnym wałku '
    'piankowym, a przy konsoli masz dwa dodatkowe wałki pod klatkę lub przedramiona."; segment 3 '
    '"3 · Napnij i suń" body "Przedni wózek porusza się po szynie na 3 zestawach cichych kółek."; '
    'under the stepper a small ink micro-copy line "LCD pokazuje powtórzenia, czas i kalorie jako '
    'funkcje licznika." and a text link in ink with a small arrow "Zobacz poziomy trudności →". '
    'No CTA button.'),
 '04-regulacja': HEAD + PROD + (
    'SECTION "regulacja" — typographic numbers poster + side profile proof. LEFT ~55%: eyebrow '
    '"REGULUJESZ TRUDNOŚĆ" with the rep bar; H2 in Archivo Expanded "Nie musisz zaczynać od '
    'najtrudniejszego ustawienia." with a fuchsia swash under the single word "najtrudniejszego"; '
    'then TWO GIANT typographic numbers in Archivo Expanded ink as graphic elements: "5" with '
    'caption "wysokości" and "2" with caption "kąty nachylenia"; body in Figtree "Wyższe '
    'ustawienie oznacza większą trudność, więc możesz dobrać poziom od początkującego do '
    'zaawansowanego."; small ink micro-copy "Poziom dobieraj do własnych możliwości i poprawnej '
    'techniki ruchu."; a toggle pill pair "Łagodniej" (outline) | "Trudniej" (ink fill white '
    'text). RIGHT ~45%: a photo card (radius 24) showing a clean side/three-quarter profile of '
    'the machine (faithful to reference) on a calm whitened-lilac field, no arrows, no burned-in '
    'numbers; a fuchsia #A21CAF CTA button below the numbers "Wybieram swój poziom".'),
 '05-wideo': HEAD + PROD + (
    'SECTION "wideo" — vertical video rail. Header: eyebrow "ZOBACZ RUCH" with the rep bar; H2 in '
    'Archivo Expanded "Najpierw zobacz. Potem ustaw po swojemu." with a fuchsia swash under the '
    'single word "zobacz"; lead in Figtree "Krótkie pionowe klipy pokazują biało-różową maszynę w '
    'prawdziwych wnętrzach." A horizontal snap-rail of 9:16 video cards — THREE fully visible plus '
    'a fourth peeking at the right edge (radius 24, thin hairline): each card shows a muted real '
    'living-room video poster of the white-and-pink machine (faithful to reference) with a '
    'centered thin ink outline play button circle and a small caps label chip at the bottom: '
    '"BRZUSZEK W UŻYCIU", "DEMO: 8 ĆWICZEŃ", "RUCH WÓZKA PO SZYNIE", "BIAŁO-RÓŻOWY WARIANT W DOMU"; '
    'below the rail small dot indicators (first active ink) and a text link in ink with arrow '
    '"Sprawdź, co możesz ćwiczyć →" (dark ink, never accent). NO play counts, NO comments, NO '
    'ratings.'),
 '06-wiele-partii': HEAD + PROD + ANAT + (
    'SECTION "wiele partii" — 2x2 editorial grid, the SAME woman and the SAME apartment. Header: '
    'eyebrow "WIĘCEJ NIŻ JEDEN RUCH" with the rep bar; H2 in Archivo Expanded "Nie tylko brzuch." '
    'with a fuchsia swash under the single word "brzuch"; lead in Figtree "Maszyna jest '
    'przeznaczona do ćwiczeń brzucha, talii, pośladków, ramion i nóg." Then a 2x2 grid of tiles '
    'with alternating photo/label (zig-zag): TILE 1 (photo LEFT) label "Brzuch i core" body '
    '"Wózek z wałkiem porusza się po pochyłej szynie podczas ruchu crunch." — photo: the woman '
    'mid-crunch kneeling on the U-roller. TILE 2 (photo RIGHT) label "Talia i pośladki" body "W '
    'materiałach produktu pokazano wariant side leg raise." — photo: the same woman in a side leg '
    'raise (supporting knee on the U-roller, one leg extended to the side, natural hip '
    'proportions). TILE 3 (photo LEFT) label "Ramiona" body "Do treningu ramion służą linki lub '
    'gumy oporowe z piankowymi uchwytami." — photo: the same woman training arms on the machine\'s '
    'resistance bands, standing in a slight lunge beside the machine. TILE 4 (photo RIGHT) label '
    '"Nogi" body "U podstawy znajdują się paski lub strzemiona pedałów, a nogi są wymienione w '
    'obszarach treningu." — photo: a clean LOW close-up detail of the pedal straps at the base of '
    'the machine, NO foot and no staged use, the machine as the anchor. All in the same bright '
    'living room, soft daylight.' + NEG_PERSON + ' NEG tile 4: no foot, no leg, no person — clean '
    'strap detail only.'),
 '07-wytrzymalosc': HEAD + PROD + (
    'SECTION "wytrzymałość" — construction proof, NO person. LEFT ~45%: a low, bright '
    'three-quarter detail photo card (radius 24) of the machine\'s frame (faithful to reference) — '
    'the two floor crossbars with gray non-slip end caps, the diagonal main beam and the joint '
    'points — on a calm whitened-lilac field, soft daylight grazing the metal; no person, no '
    'weights, no load-test rig. RIGHT ~55%: eyebrow "KONSTRUKCJA" with the rep bar; H2 in Archivo '
    'Expanded "Trójkątna rama. Konkretna nośność." with a fuchsia swash under the single word '
    '"nośność"; a GIANT typographic number "≈ 200 kg" in Archivo Expanded ink with caption '
    '"deklarowany udźwig"; body in Figtree "Konstrukcja ma trójkątny układ A-frame i pogrubione '
    'metalowe rurki."; then three feature lines each with a thin 1.75px ink outline icon: '
    '"Dwie poprzeczki są zakończone antypoślizgowymi końcówkami.", "Obudowę wykonano z ABS.", '
    '"440 lbs według specyfikacji produktu, czyli około 200 kg." No CTA button.'),
 '08-mid-cta': HEAD + PROD + (
    'SECTION "mid-cta" — decision moment as a wide light band. On a bright band, a large faint '
    'oversized ghost typography of the rep-bar/word "SERIA" behind the header at ~8% ink opacity '
    'as texture. In one horizontal line: LEFT ~55%: H2 in Archivo Expanded ink "Gotowa ustawić '
    'swoją serię?" with a fuchsia swash under the single word "serię"; small ink line "Brzuszek — '
    'biało-różowy"; price "429,00 zł" BIG in Archivo; full-width fuchsia #A21CAF CTA button '
    '"Przechodzę do zamówienia" (white text, radius 12); micro-copy "Płatność przy odbiorze, BLIK '
    'lub online · 14 dni na zwrot". RIGHT ~45%: a clean product packshot of the machine (faithful '
    'to reference) on a subtle white/lilac color field, no food, no props, no badges, no brand '
    'text.'),
 '09-skladanie': HEAD + PROD + ANAT + (
    'SECTION "składanie" — honest two-state DIPTYCH on a light background, no dimensions. Header: '
    'eyebrow "PO TRENINGU" with the rep bar; H2 in Archivo Expanded "Po serii składasz sprzęt, '
    'nie plan." with a fuchsia swash under the single word "plan"; body in Figtree "Maszyna ma '
    'składaną konstrukcję z zawleczką zabezpieczającą, dzięki czemu po treningu możesz ją złożyć '
    'i odłożyć." Below, a DIPTYCH of two equal photo cards (radius 24) side by side: LEFT card '
    '("rozłożona") — the woman kneeling beside her sofa next to the UNFOLDED machine (faithful to '
    'reference), one hand on the safety pin / locking mechanism, face not emphasized, natural hand '
    'anatomy, straight wrist, bright living room; small caps chip "ROZŁOŻONA". RIGHT card '
    '("złożona") — the FOLDED machine leaning neatly against the same sofa, compact and put away, '
    'no person; small caps chip "ZŁOŻONA" and a small caption "zdjęcie od kupującego". Between/'
    'under the diptych three compact numbered steps: "1 · Zwolnij zawleczkę zgodnie z '
    'instrukcją.", "2 · Złóż konstrukcję.", "3 · Zabezpiecz ją przed odłożeniem."; a small ink '
    'micro-copy "Produkt jest opisany jako łatwy w montażu i jest dostarczany z instrukcją."; a '
    'fuchsia #A21CAF CTA button "Zamawiam składany Brzuszek". NEG: no dimension lines, no '
    'measuring tape, no ruler, no visible measurements.' + NEG_PERSON),
 '10-zamow': HEAD + PROD + (
    'SECTION "zamówienie" — on-page checkout skin, NO color selector. Header: eyebrow "ZAMÓWIENIE" '
    'with the rep bar; H2 in Archivo Expanded "Twój Brzuszek. Jeden wariant, bez zgadywania." with '
    'a fuchsia swash under the single word "wariant". Two columns 5/7: LEFT ~40%: a sticky product '
    'summary card (white, radius 24): a clean small packshot of the machine (faithful to '
    'reference), name in Archivo "Brzuszek — składana maszyna do ćwiczeń brzucha i core", one line '
    '"Kolor: biało-różowy" (NO selector, no swatches), price "429,00 zł" BIG, and three small '
    'trust chips "14 dni na zwrot", "Płatność przy odbiorze", "BLIK/online". RIGHT ~60%: a '
    'checkout steps card with FOUR numbered rows separated by hairlines (numbers in small ink '
    'circles): "1 · Kontakt" EXPANDED with two white input fields "E-mail" and "Telefon", "2 · '
    'Adres", "3 · Dostawa", "4 · Płatność" (payment options listed as pills "Przy odbiorze", '
    '"BLIK", "Płatność online"); BEFORE the button two visible summary lines "Dostawa: Kurier — '
    '19,00 zł" and "Razem: 448,00 zł"; a small line "Masz 14 dni na zwrot."; then a full-width '
    'fuchsia #A21CAF CTA button "Zamawiam z obowiązkiem zapłaty" (white text). Clean form UI, '
    'inputs white with 1px hairline borders, radius 12. NEG: no "darmowa dostawa", no free '
    'shipping, no delivery-time promise.'),
 '11-final': HEAD + (
    'SECTION "final" — FAQ accordion, NO decorative photography. Header: eyebrow "FAQ" with the '
    'rep bar; H2 in Archivo Expanded "Pytania przed zamówieniem." Two-column accordion of NINE '
    'rows, each a full-width row separated by hairlines with a thin ink "+" chevron on the right; '
    'the FIRST row EXPANDED shows its question in Archivo and its answer in Figtree, the rest '
    'collapsed (question only). The nine questions VERBATIM: "Jaki kolor otrzymam?" (expanded '
    'answer: "Sprzedajemy wyłącznie wariant biało-różowy; w checkoutcie nie ma wyboru koloru."), '
    '"Jak reguluje się trudność?", "Jaki jest udźwig?", "Czy można ją złożyć?", "Czy montaż jest '
    'trudny?", "Co pokazuje LCD?", "Jak chronione są kolana?", "Jak mogę zapłacić?", "Ile mam '
    'czasu na zwrot?". BELOW the accordion a light end card (radius 24) with the rep bar: a line '
    'in Archivo "Ustaw poziom. Zrób swoją serię. Złóż.", a caps summary "5 wysokości · 2 kąty · '
    '≈200 kg", the price "429,00 zł", and a fuchsia #A21CAF CTA button "Przejdź do zamówienia".'),
}

REF_PACKSHOT = {'01-hero', '03-jak-cwiczysz', '04-regulacja', '05-wideo', '06-wiele-partii',
                '07-wytrzymalosc', '08-mid-cta', '09-skladanie', '10-zamow'}


def gen(section, tries=3):
    prompt = TASKS[section] + EXCL + ' ' + DNA
    refs = [{'url': STYL, 'type': 'ref'}]
    if section in REF_PACKSHOT:
        refs.insert(0, {'url': PACKSHOT, 'type': 'product'})
    payload = {'fn': 'generate-image', 'payload': {
        'prompt': prompt, 'count': 1, 'workflow_id': 'brzuszek-m-%s' % section,
        'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium',
        'aspect_ratio': '3:2', 'reference_images': refs}}
    body = json.dumps(payload).encode('utf-8')
    for attempt in range(1, tries + 1):
        try:
            req = urllib.request.Request(BASE, data=body, headers={
                'Content-Type': 'application/json', 'x-wf2-secret': SECRET})
            j = json.loads(urllib.request.urlopen(req, timeout=600).read().decode('utf-8'))
            url = (j.get('images') or [{}])[0].get('url')
            if not url:
                raise RuntimeError('no images: ' + json.dumps(j)[:200])
            data = urllib.request.urlopen(url, timeout=120).read()
            out = os.path.join(OUT, '%s.png' % section)
            open(out, 'wb').write(data)
            return out
        except Exception as e:
            print('  [%s] proba %d/%d FAIL: %s' % (section, attempt, tries, str(e)[:160]))
            if attempt == tries:
                raise
            time.sleep(10 * attempt)


args = sys.argv[1:]
todo = list(TASKS) if args == ['all'] else args
ok, fail = [], []
with ThreadPoolExecutor(max_workers=8) as ex:
    futs = {ex.submit(gen, s): s for s in todo}
    for f in as_completed(futs):
        s = futs[f]
        try:
            ok.append(f.result()); print('OK', s)
        except Exception as e:
            fail.append(s); print('FAIL', s, str(e)[:120])
print('GOTOWE: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))

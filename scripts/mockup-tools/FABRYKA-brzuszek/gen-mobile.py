# -*- coding: utf-8 -*-
"""Pary MOBILE makiet BRZUSZEK (F2.4: mobile WSZYSTKICH sekcji, projekt OD ZERA pod 390px —
nie scisniety desktop). Ref: makieta desktop (tresc) + styl-master (styl). 2:3, medium.
Uzycie: python gen-mobile.py all | 01-hero ..."""
import io, json, os, re, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
BASE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
MAK = PUB + 'bud-assets/brzuszek/makiety/'
STYL = PUB + 'bud-assets/brzuszek/brand/00-styl-master.webp'

DNA = ('STYLE-DNA: cool whitened-lilac page #F7F5FB, bands #F0ECF7, white cards #FFFFFF (NEVER '
       'warm powder pink); ink #241E2E, body #38323F, hairlines #DCD5E8; ONE accent fuchsia-violet '
       '#A21CAF (CTA, straight bold underline-swash under one word, last segment of the "rep bar" '
       '— five 16x3px dashes under eyebrows, fifth fuchsia); icons 1.75px outline ink; display '
       'Archivo Expanded (headlines, prices, BIG numbers 5 · 2 · ≈200 kg), text Figtree; radius '
       '24px (cards) / 12px (small); trust-pills white fill 1px hairline ink text; layered '
       'warm-ambient shadows; light backgrounds only; the machine ALWAYS white frame + pink foam '
       'rollers. Polish diacritics correct. Crisp mobile UI, no watermarks, no phone frame. ')

HEAD = ('High-fidelity MOBILE landing SECTION mockup, 390px-wide phone layout on a 2:3 portrait '
        'board. Image 1 = the DESKTOP mockup of this exact section: CONTENT source — keep the '
        'SAME copy, photos, hero character and component styles, redesigned into ONE narrow '
        'column FOR PHONE (not a squeezed desktop). Image 2 = style reference ONLY — never copy '
        'its tiles onto the page. Output shows ONLY this one section, single column, big tap '
        'targets. NEVER 3 items side-by-side at 390px — stack into a vertical column. No floating '
        'trust-chip/badge overlay on any photo. The machine ALWAYS faithful: white frame + pink '
        'rollers, no printed brand text, no MERACH, no black-red/black-blue variant, no flat '
        'bench/bike/stepper. Person (if any): woman 28-45, realistic figure (not a fitness model, '
        'no six-pack), kneeling with BOTH knees on the U-roller, hands on handlebar, wrists '
        'straight, face turned away. ')

EXCL = (' STRICT: one section only, flat edge-to-edge, no browser chrome, no device/phone frame. '
        'No star ratings, no review counts, no sold counts, no crossed-out prices, no '
        'free-shipping claims, no health/weight-loss/calorie-burn claims, no training-time '
        '(minutes) claims, no body-shaming, no invented dimensions/weight (the "≈200 kg" figure '
        'is allowed), no "MERACH", no shop name, no fantasy scenery, no dark backgrounds, no extra '
        'text beyond the quoted Polish strings. Prices only "429,00 zł".')

TASKS = {
 '01-hero': ('MOBILE HERO, fold-first: compact top strip with lockup "Brzuszek" only; then the '
    'lifestyle scene photo (woman doing a crunch on the machine in a bright lilac living room) '
    'taking ~34%% of board height; then eyebrow "TWOJA DOMOWA SERIA" with the rep bar; H1 in '
    'Archivo Expanded, EXACTLY 2-3 short lines, big feel: "Brzuch i core. U siebie." with a '
    'fuchsia swash under "core"; MAX ONE benefit line in Figtree: "Składana maszyna z ruchomym '
    'wózkiem, 5 wysokości i licznikiem LCD."; then a DISTINCT white micro-offer card overlapping '
    'the text-zone boundary with room below: price "429,00 zł" big in Archivo, full-width fuchsia '
    'CTA "Zamawiam Brzuszek", micro-copy "Płatność przy odbiorze, BLIK lub online · 14 dni na '
    'zwrot", and a row of three small trust pills "Składana konstrukcja", "2 kąty · 5 wysokości", '
    '"Udźwig ≈ 200 kg" wrapping if needed. Price and CTA MUST sit inside the first fold with '
    'margin below the card.'),
 '02-problem': ('MOBILE stack (code-only, NO product, NO scene photo): eyebrow "ZNASZ TO?" with '
    'the rep bar; H2 in Archivo "Mata, karnet, aplikacja — i tak się to rzuca." with a fuchsia '
    'swash under "rzuca"; then THREE contrast tiles STACKED vertically (white cards, 1px '
    'hairline), each with a thin ink outline icon (rolled mat / gym card / ab-roller + phone) and '
    'one line: "Brzuszki na macie → boli kręgosłup i szyja, a nuda wygrywa.", "Karnet na siłownię '
    '→ drogo, daleko, brak czasu.", "Ab-roller i aplikacje → za trudne na start, porzucone po '
    'tygodniu."; below, one bridge line "Dlatego robisz to u siebie, po swojemu — na sprzęcie, '
    'który reguluje trudność." No CTA. ABSOLUTELY NO photograph, NO product image, NO person, '
    'NO machine anywhere in this section (not at the bottom, not in the background) — this is a '
    'CODE-ONLY band: only the three method-contrast tiles with thin ink OUTLINE icons and text on '
    'the lilac page. Do not add any lifestyle or product photo.'),
 '03-jak-cwiczysz': ('MOBILE TOR-I stack: header (eyebrow "JAK ĆWICZYSZ" + rep bar, H2 "Ustaw. '
    'Oprzyj się. Napnij i suń." with swash under "suń"); then ONE big product STAGE card (machine '
    'alone, faithful, subtle ink SVG markers on cart + support point, no person); under it a '
    'VERTICAL stepper of three compact rows connected by a thin ink line (NEVER side by side): '
    '"1 · Ustaw poziom" (active, ink bar) "Wybierz 1 z 5 wysokości i 1 z 2 kątów nachylenia; '
    'wyższe ustawienie zwiększa trudność.", "2 · Oprzyj się stabilnie" "Kolana lub łokcie opierasz '
    'na pogrubionym, U-kształtnym wałku piankowym, a przy konsoli masz dwa dodatkowe wałki pod '
    'klatkę lub przedramiona.", "3 · Napnij i suń" "Przedni wózek porusza się po szynie na 3 '
    'zestawach cichych kółek."; micro-copy "LCD pokazuje powtórzenia, czas i kalorie jako funkcje '
    'licznika." and ink text link "Zobacz poziomy trudności →".'),
 '04-regulacja': ('MOBILE stack, numbers first: eyebrow "REGULUJESZ TRUDNOŚĆ" + rep bar; H2 "Nie '
    'musisz zaczynać od najtrudniejszego ustawienia." with swash under "najtrudniejszego"; two '
    'GIANT numbers side by side "5" (caption "wysokości") and "2" (caption "kąty nachylenia") in '
    'Archivo; toggle pill pair "Łagodniej" | "Trudniej" (Trudniej ink fill); then a photo card '
    'with the clean side profile of the machine (faithful, no arrows); body "Wyższe ustawienie '
    'oznacza większą trudność, więc możesz dobrać poziom od początkującego do zaawansowanego."; '
    'micro "Poziom dobieraj do własnych możliwości i poprawnej techniki ruchu."; full-width '
    'fuchsia CTA "Wybieram swój poziom".'),
 '05-wideo': ('MOBILE video rail: eyebrow "ZOBACZ RUCH" + rep bar; H2 "Najpierw zobacz. Potem '
    'ustaw po swojemu." with swash under "zobacz"; lead "Krótkie pionowe klipy pokazują '
    'biało-różową maszynę w prawdziwych wnętrzach."; ONE 9:16 video card fully visible + ~15%% of '
    'the next card peeking from the right edge (swipe affordance), muted living-room poster of the '
    'white-and-pink machine, centered thin ink play circle, caps chip "BRZUSZEK W UŻYCIU"; five '
    'dot indicators below (first active); ink text link "Sprawdź, co możesz ćwiczyć →". No play '
    'counts.'),
 '06-wiele-partii': ('MOBILE editorial rail: eyebrow "WIĘCEJ NIŻ JEDEN RUCH" + rep bar; H2 "Nie '
    'tylko brzuch." with swash under "brzuch"; lead "Maszyna jest przeznaczona do ćwiczeń brzucha, '
    'talii, pośladków, ramion i nóg."; then FOUR cards STACKED vertically (one per row, photo on '
    'top, label + line below — NEVER a 2x2 grid at 390px): "Brzuch i core" "Wózek z wałkiem '
    'porusza się po pochyłej szynie podczas ruchu crunch." (same woman mid-crunch), "Talia i '
    'pośladki" "W materiałach produktu pokazano wariant side leg raise." (same woman side leg '
    'raise), "Ramiona" "Do treningu ramion służą linki lub gumy oporowe z piankowymi uchwytami." '
    '(same woman on resistance bands), "Nogi" "U podstawy znajdują się paski lub strzemiona '
    'pedałów, a nogi są wymienione w obszarach treningu." (clean low detail of the base straps, '
    'NO foot). Same woman, same apartment.'),
 '07-wytrzymalosc': ('MOBILE stack: photo on TOP ~34%% (low bright 3/4 detail of the machine '
    'frame — crossbars with gray caps, diagonal beam, joints, faithful, no person, no weights); '
    'below: eyebrow "KONSTRUKCJA" + rep bar; H2 "Trójkątna rama. Konkretna nośność." with swash '
    'under "nośność"; GIANT "≈ 200 kg" in Archivo with caption "deklarowany udźwig"; body '
    '"Konstrukcja ma trójkątny układ A-frame i pogrubione metalowe rurki."; three feature lines '
    'with thin ink outline icons: "Dwie poprzeczki są zakończone antypoślizgowymi końcówkami.", '
    '"Obudowę wykonano z ABS.", "440 lbs według specyfikacji produktu, czyli około 200 kg." '
    'Render the three feature lines with correct Polish spelling EXACTLY, especially the word '
    '"zakończone" (not "zakonczons"): „Dwie poprzeczki są zakończone antypoślizgowymi końcówkami."'),
 '08-mid-cta': ('MOBILE banner stack: one white card with a faint ghost "SERIA" typography behind '
    'the header; H2 "Gotowa ustawić swoją serię?" with swash under "serię"; small line "Brzuszek '
    '— biało-różowy"; a clean packshot of the machine centered (faithful); price "429,00 zł" big; '
    'full-width fuchsia CTA "Przechodzę do zamówienia"; micro-copy "Płatność przy odbiorze, BLIK '
    'lub online · 14 dni na zwrot".'),
 '09-skladanie': ('MOBILE stack: eyebrow "PO TRENINGU" + rep bar; H2 "Po serii składasz sprzęt, '
    'nie plan." with swash under "plan"; body "Maszyna ma składaną konstrukcję z zawleczką '
    'zabezpieczającą, dzięki czemu po treningu możesz ją złożyć i odłożyć."; a DIPTYCH of two '
    'stacked photo cards (one above the other, NOT side by side): TOP "ROZŁOŻONA" — the same '
    'woman kneeling by the sofa, one hand on the safety pin, face away; BOTTOM "ZŁOŻONA" with a '
    'small caption "zdjęcie od kupującego" — the folded machine leaning by the same sofa, no '
    'person; then three compact numbered steps "1 · Zwolnij zawleczkę zgodnie z instrukcją.", '
    '"2 · Złóż konstrukcję.", "3 · Zabezpiecz ją przed odłożeniem."; micro "Produkt jest opisany '
    'jako łatwy w montażu i jest dostarczany z instrukcją."; full-width fuchsia CTA "Zamawiam '
    'składany Brzuszek". No dimensions, no measuring tape.'),
 '10-zamow': ('MOBILE checkout skin stack: eyebrow "ZAMÓWIENIE" + rep bar; H2 "Twój Brzuszek. '
    'Jeden wariant, bez zgadywania." with swash under "wariant"; compact product row (small '
    'packshot + name "Brzuszek — składana maszyna do ćwiczeń brzucha i core" + "Kolor: '
    'biało-różowy" (no selector) + price "429,00 zł"); then the steps card full-width: four '
    'numbered rows "1 · Kontakt" (expanded, two inputs "E-mail", "Telefon"), "2 · Adres", "3 · '
    'Dostawa", "4 · Płatność" (pills "Przy odbiorze", "BLIK", "Płatność online"); summary lines '
    'BEFORE the button "Dostawa: Kurier — 19,00 zł" and "Razem: 448,00 zł"; line "Masz 14 dni na '
    'zwrot."; full-width fuchsia CTA "Zamawiam z obowiązkiem zapłaty". No free shipping.'),
 '11-final': ('MOBILE FAQ stack: eyebrow "FAQ" + rep bar; H2 "Pytania przed zamówieniem."; '
    'accordion of NINE full-width rows with hairline separators and thin ink "+" chevrons, the '
    'FIRST row expanded ("Jaki kolor otrzymam?" with the answer "Sprzedajemy wyłącznie wariant '
    'biało-różowy; w checkoutcie nie ma wyboru koloru."), the rest collapsed (question only): '
    '"Jak reguluje się trudność?", "Jaki jest udźwig?", "Czy można ją złożyć?", "Czy montaż jest '
    'trudny?", "Co pokazuje LCD?", "Jak chronione są kolana?", "Jak mogę zapłacić?", "Ile mam '
    'czasu na zwrot?"; below a light end card with the rep bar: "Ustaw poziom. Zrób swoją serię. '
    'Złóż.", caps summary "5 wysokości · 2 kąty · ≈200 kg", price "429,00 zł", full-width fuchsia '
    'CTA "Przejdź do zamówienia". NO decorative photograph or product/lifestyle image anywhere in '
    'this section — text and accordion ONLY; do NOT insert any photo between the accordion and the '
    'end card. The only visuals are the "+"/"−" chevrons, the rep bar and the typographic numbers.'),
}


def gen(section, tries=3):
    prompt = HEAD + TASKS[section] + EXCL + ' ' + DNA
    refs = [{'url': MAK + '%s.webp' % section, 'type': 'ref'},
            {'url': STYL, 'type': 'ref'}]
    payload = {'fn': 'generate-image', 'payload': {
        'prompt': prompt, 'count': 1, 'workflow_id': 'brzuszek-mm-%s' % section,
        'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium',
        'aspect_ratio': '2:3', 'reference_images': refs}}
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
            out = os.path.join(OUT, '%s-mobile.png' % section)
            open(out, 'wb').write(data)
            return out
        except Exception as e:
            print('  [%s-m] proba %d/%d FAIL: %s' % (section, attempt, tries, str(e)[:160]))
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

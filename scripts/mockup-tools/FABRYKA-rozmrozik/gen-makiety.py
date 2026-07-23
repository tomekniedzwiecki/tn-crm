# -*- coding: utf-8 -*-
"""Makiety ROZMROZIK (F2): desktop 3:2 przez wf2-gen (medium), ref = styl-master
(+packshot g0 'product' gdy produkt w kadrze). Uzycie: python gen-makiety.py 01-hero ... | all"""
import io, json, os, re, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8', errors='ignore').read()
SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
BASE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'
G = PUB + 'bud-products/1005011774118215/'
STYL = PUB + 'bud-assets/rozmrozik/brand/00-styl-master.webp'

DNA = ('STYLE-DNA: icy pale-blue page #F2F7FA with section bands #EAF1F6 and white cards '
       '#FFFFFF; ink #232A31, body #2E3740, hairlines #CFDCE6; EXACTLY ONE accent '
       'burnt-tangerine #E8590C used ONLY for the CTA button, a thin italic underline-swash '
       'under one headline word, and the warm end of the signature "thaw line" (a thin 2px '
       'hairline gradient from icy blue #9BB8CE to tangerine #E8590C under section eyebrows); '
       'all functional icons thin 1.75px outline in ink; display font Zilla Slab (warm sturdy '
       'slab serif) for headlines, prices and BIG numbers; text font Instrument Sans; one '
       'series radius 12px; trust-pills: white fill, 1px hairline border, ink text; soft '
       'layered warm-ambient shadows, subtle grain on bands only; light backgrounds only. '
       'Polish diacritics correct. No watermarks, no phone frames, crisp UI. ')

PROD = ('The defrosting appliance in the photo must faithfully match the real product '
        'reference image: flat square tray base with black rim and light brushed-aluminum '
        'plate perforated in concentric rings, a transparent faceted polystyrene dome with '
        'flat top, and a black elongated rounded module seated on top of the dome with a '
        'round vent grille of parallel metal fins and a small touch panel with white LED '
        'digits and an oval button. NEG: no printed brand text on the product, no built-in '
        'power cord, no knobs or dials, no microwave-like door, no bare plate without the '
        'dome unless the dome is explicitly set aside in the scene. ')

HEAD = ('High-fidelity DESKTOP landing page SECTION mockup on a 3:2 landscape board, section '
        'shown full-width like a real webpage fragment (~1280px design), Figma-style, '
        'pixel-perfect, clean design system, Polish e-commerce. ')

EXCL = (' STRICT: EXACTLY ONE SECTION AND NOTHING ELSE. No browser chrome, no URL bar, no '
        'device frame, no outer mockup shadow — flat edge-to-edge section screenshot. No '
        'watermark, no lorem ipsum, no crossed-out prices, no bestseller/"NR 1" badges, no '
        'free-shipping claims, NO star ratings, NO review counts, NO sold counts, no section '
        'numbering like "01/12", no health claims, NO defrost-time claims (no minutes), no '
        '"KAYUSO", no food-grade claims, no extra text beyond the quoted Polish strings.')

TASKS = {
 '01-hero': HEAD + PROD + (
    'HERO, archetype F = equal-weight DIPTYCH. Top: slim topbar — brand lockup left (small '
    'tangerine melting-ice-cube mark + "Rozmrozik" wordmark in Zilla Slab ink) and enumerated '
    'nav links right, EXACTLY these three: "Jak działa", "Pojemność", "FAQ" (NEVER "Opinie"). '
    'LEFT COLUMN (~42%) on icy page: eyebrow ALL-CAPS "PLAN AWARYJNY NA ZAMROŻONY OBIAD" with '
    'the thaw-line hairline (icy blue fading to tangerine) under it; huge display H1 in Zilla '
    'Slab ink: "Mięso z zamrażarki nie musi rozwalać planu na obiad." with a thin tangerine '
    'italic swash under the single word "planu"; one Instrument Sans subline: "Połóż porcje '
    'na aluminiowej płycie, przykryj kopułą i uruchom jednym dotknięciem."; then a white '
    'offer card (radius 12, layered warm shadow): price "289,00 zł" BIG in Zilla Slab, '
    'full-width DESIGNED tangerine #E8590C CTA button "Zamawiam Rozmrozik" (white text, '
    'radius 12), micro-copy row "Płatność przy odbiorze lub BLIK/online · 14 dni na zwrot", '
    'and a payment pill row: four small white pills with 1px hairline: "BLIK", "Visa", '
    '"Mastercard", "ZA POBRANIEM". Under the card four trust chips in one row (white pills, '
    'ink text): "4,2 L", "4 steki lub 4 porcje ryby", "Start jednym dotknięciem", "Ładowanie '
    'USB-C". RIGHT (~58%): editorial DIPTYCH in a card frame — two equal 4:5 photos side by '
    'side separated by a thin hairline: LEFT photo cool and frosty: a frozen steak covered in '
    'thick frost on a light wooden board, cold blue window light, NO appliance in this frame, '
    'small caps label chip "ZAMROŻONE" at its bottom; RIGHT photo warmer: the defrosting box '
    '(faithful to reference) on a kitchen counter with meat portions visible under the '
    'transparent dome, a frying pan waiting beside it, a mug with faint steam and a soft '
    'light curtain by the window, small caps label chip "ROZMROŻONE". The two frames read as '
    'one deliberate before/after pair.'),
 '02-problem': HEAD + (
    'SECTION "problem" — full-bleed scene with copy ON the scene (type A). The photo fills '
    'the whole section: a wide real Polish kitchen, a bowl of warm water in the sink with a '
    'vacuum-sealed frozen meat pack soaking and visible steam, a microwave in the background, '
    'a woman\'s hand resting on the counter (no face), cold 16:30 daylight. ABSOLUTELY NO '
    'defrosting appliance, no dome, no gadget anywhere in this frame. The LEFT ~45% of the '
    'scene fades seamlessly into a flat solid #EAF1F6 content zone carrying the copy: eyebrow '
    'ALL-CAPS "16:30. KAŻDEMU SIĘ ZDARZA." with thaw-line under it; H2 in Zilla Slab ink: '
    '"Zamrażarka pamięta. Ty nie musisz."; lead in Instrument Sans: "Wracasz z pracy, rodzina '
    'pyta o obiad, a mięso nadal jest twarde i pokryte szronem."; two small white cards with '
    '1px hairline and ink text: "Miska ciepłej wody zajmująca zlew?" and "Mikrofala i brzegi, '
    'które zaczynają się gotować?"; closing body line: "Rozmrozik daje zamrożonym porcjom '
    'osobne miejsce: aluminiową płytę pod kopułą i tackę ociekową zbierającą wodę." No CTA '
    'in this section.'),
 '03-jak-dziala': HEAD + PROD + (
    'SECTION "jak działa" — interactive DEMO (TOR-I) showing THREE STATES. Header row: '
    'eyebrow "TRZY RUCHY" with thaw-line, H2 in Zilla Slab: "Połóż. Przykryj. Dotknij." '
    'LEFT ~58%: big photo stage in a card (radius 12): 3/4 view of the tray base on a bright '
    'counter, a hand placing a meat portion on the aluminum plate, the transparent dome set '
    'aside at frame edge (STATE 1 active). RIGHT ~42%: vertical stepper controller with '
    'THREE stacked segments, each a white card with 1px hairline, connected by a thin '
    'vertical line: segment 1 ACTIVE (ink-filled left bar, bold): number "1", title "Połóż", '
    'body "Umieść zamrożone porcje na płycie ze stopu aluminium." plus a SMALL thumbnail of '
    'state 1; segment 2: "2 · Przykryj" body "Nałóż przezroczystą kopułę ze ściętymi bokami." '
    'with a small thumbnail showing the hand lowering the dome; segment 3: "3 · Dotknij" '
    'body "Uruchom jednym dotknięciem panelu LED." with a small thumbnail of a finger '
    'touching the module panel; under the stepper a status chip: "Urządzenie uruchomione." '
    'and a text link in ink with small arrow: "Zobacz, ile mieści →". The three thumbnails '
    'clearly show three DIFFERENT states of the same fixed camera scene.'),
 '04-pojemnosc': HEAD + PROD + (
    'SECTION "pojemność" — typographic poster + top-down proof. LEFT ~45% on icy page: '
    'eyebrow "MIEJSCE NA OBIAD" with thaw-line; H2 in Zilla Slab: "Nie jedna porcja. '
    'Cztery."; then GIANT typographic numbers in Zilla Slab ink as graphic elements: '
    '"4,2 L" (dominant) and a smaller alternated pair "4 steki / 4 porcje ryby"; two body '
    'lines in Instrument Sans: "Komora o pojemności 4,2 L mieści jednocześnie 4 steki lub '
    '4 porcje ryby." and "Tacka ociekowa ABS zbiera wodę powstającą podczas rozmrażania."; '
    'a small spec strip in caps with hairline separators: "PŁYTA: STOP ALUMINIUM · KOPUŁA: '
    'PS · TACKA: ABS · ELEMENTY: NTC". RIGHT ~55%: photo card (radius 12, full-frame photo '
    'edge to edge inside the card): TOP-DOWN view of the tray base with the dome set aside '
    'at the frame edge, EXACTLY four raw steaks arranged on the perforated aluminum plate '
    'with visible concentric hole pattern, bright neutral light; above the photo a small '
    'ink toggle pill pair: "Steki" (active, ink fill white text) | "Ryba" (outline). '
    'CRITICAL: nothing lies on the plate except EXACTLY four steaks — the black module NEVER '
    'lies on the plate; the module stays attached on top of the transparent dome, and the dome '
    '(with module on it) is set aside at the frame edge. No decorative ice cubes anywhere on '
    'the page background — clean icy-blue flat page.'),
 '05-funkcje': HEAD + (
    'SECTION "funkcje" — honest tech grid, NO scene photo, only small real product macro '
    'crops. Header: eyebrow "CO WIEMY O URZĄDZENIU" with thaw-line; H2 in Zilla Slab: '
    '"Funkcje nazwane bez cudownych obietnic." Grid 2x2 of white cards (radius 12, 1px '
    'hairline, generous padding), each with a SMALL square macro photo crop of the black '
    'module/panel/plate/dome edge in a rounded slot, a slab title and one Instrument Sans '
    'line: card 1 "Plasma Locking" — "Moduł generatora plazmy opisany przez producenta jako '
    '„Plasma Locking"."; card 2 "UVC Antibacterial" — "Lampa UVC o działaniu antybakteryjnym '
    'według producenta; bez obietnic medycznych."; card 3 "Panel dotykowy LED" — "Owalny '
    'przycisk i panel dotykowy — start jednym dotknięciem."; card 4 "USB-C" — "Urządzenie '
    'jest ładowane przez USB-C." Under the grid a full-width quiet note strip on #EAF1F6: '
    '"Nie podajemy mocy, skuteczności procentowej ani czasu rozmrażania — dostępne materiały '
    'nie zawierają takich danych." All icons/graphics in ink only, no glows, no plasma '
    'particles, no UV rays.'),
 '06-wideo': HEAD + (
    'SECTION "wideo" — vertical video rail. Header: eyebrow "ZOBACZ W PIONIE" with '
    'thaw-line; H2 in Zilla Slab: "Pięć krótkich klipów. Jeden produkt."; sub in Instrument '
    'Sans: "Przesuń rail i odtwórz wybrany materiał." A horizontal rail of THREE fully '
    'visible 9:16 video cards plus a fourth peeking at the right edge (radius 12, thin '
    'hairline): each card shows a muted kitchen video poster (counter, hands, food prep — '
    'generic, no readable text) with a centered ink play button circle and a small caps '
    'label chip at bottom: "KLIP 1", "KLIP 2", "KLIP 3"; below the rail small dot '
    'indicators (5 dots, first active ink) and a text link "Przejdź do zamówienia →" in DARK '
    'INK #232A31 with a thin ink underline — the link is NEVER orange/accent (accent is '
    'reserved for CTA buttons only).'),
 '07-mid-cta': HEAD + PROD + (
    'SECTION "mid-cta" — second decision moment as a wide banner card. One wide white card '
    '(radius 12, layered warm shadow) on the icy page, inside: LEFT ~55%: eyebrow "PLAN NA '
    'ZAMROŻONE PORCJE" with thaw-line; H2 in Zilla Slab: "Daj rozmrażaniu własne miejsce."; '
    'sub in Instrument Sans: "Elektryczny box z komorą 4,2 L, dotykowym startem i tacką '
    'ociekową."; price "289,00 zł" BIG in slab; DESIGNED tangerine CTA button "Zamawiam '
    'Rozmrozik" (white text, radius 12); micro-copy "Płatność przy odbiorze lub BLIK/online '
    '· 14 dni na zwrot". RIGHT ~45%: clean product packshot (the full set: tray + dome + '
    'module) on a subtle icy-white field, no food, no props; BEHIND the copy a very light '
    'oversized ghost typography "4,2 L" in Zilla Slab at ~8% ink opacity as a typographic '
    'texture.'),
 '08-faq': HEAD + PROD + (
    'SECTION "FAQ" — accordion with sticky product slot. Header: eyebrow "BEZ DROBNEGO '
    'DRUKU" with thaw-line; H2 in Zilla Slab: "Pytania przed zamówieniem." LEFT ~62%: '
    'accordion list of SIX rows separated by hairlines, chevron "+" icons in ink on the '
    'right; FIRST row EXPANDED: question in slab "Jak szybko rozmraża?" and answer in '
    'Instrument Sans: "Nie podajemy czasu rozmrażania — dostępne materiały nie zawierają '
    'danych, które pozwalają uczciwie go zadeklarować."; the remaining collapsed rows read: '
    '"Czy to nie kolejny gadżet?", "Ile mieści?", "Co dzieje się z wodą?", "Co oznaczają '
    'plazma i UVC?", "Jaki kolor otrzymam?". RIGHT ~38%: a white card with a clean small '
    'packshot of the appliance, under it price "289,00 zł" in slab, a tangerine CTA button '
    '"Przejdź do zamówienia" and a small ink line "14 dni na zwrot".'),
 '09-zamow': HEAD + PROD + (
    'SECTION "zamówienie" — on-page checkout skin (steps layout). Header: eyebrow '
    '"ZAMÓWIENIE" with thaw-line; H2 in Zilla Slab: "Rozmrozik". Two columns: LEFT ~38%: '
    'product summary card (white, radius 12): small clean packshot, name "Rozmrozik" in '
    'slab, one line "Elektryczny box do rozmrażania z komorą 4,2 L", price "289,00 zł" BIG, '
    'note in small text "Kolor: czarny", and three small trust chips "COD", "BLIK/online", '
    '"14 dni na zwrot". RIGHT ~62%: checkout steps card with FOUR numbered collapsed step '
    'rows separated by hairlines, numbers in small ink circles: "1 · Kontakt" (expanded: '
    'two input fields with placeholders "E-mail" and "Telefon"), "2 · Adres", "3 · '
    'Dostawa", "4 · Płatność"; at the bottom a summary line "Do zapłaty: 289,00 zł + '
    'dostawa" and a full-width tangerine CTA "Zamawiam i płacę" (white text); under it '
    'small legal line "Zamówienie z obowiązkiem zapłaty · 14 dni na zwrot". Clean form UI, '
    'inputs white with 1px hairline borders, radius 8.'),
 '10-final': HEAD + PROD + (
    'SECTION "final" — calm evening close. LEFT ~55%: photo card (radius 12, full-frame '
    'photo): early evening Polish kitchen in warm cozy light, the defrosting box standing '
    'calmly on the counter (faithful to reference, dome on, module on top), a pan on the '
    'stove nearby with subtle heat-haze above it and a kitchen towel hanging beside, a hand '
    'putting tongs down, low counter-level angle, relaxed mood, NO frost anywhere. RIGHT '
    '~45% on icy page: eyebrow "NA KOLEJNE 16:30" with thaw-line; H2 in Zilla Slab: '
    '"Każdemu zdarza się zapomnieć. Dobrze mieć plan." with thin tangerine swash under the '
    'word "plan"; sub in Instrument Sans: "Rozmrozik to osobny box do rozmrażania z komorą '
    '4,2 L, startem jednym dotknięciem i tacką zbierającą wodę."; price "289,00 zł" in '
    'slab; tangerine CTA button "Wracam do zamówienia"; micro-copy "Płatność przy odbiorze '
    'lub BLIK/online · 14 dni na zwrot"; closing small caps line with the thaw-line ending '
    'warm: "4,2 L · 4 STEKI".'),
}

REF_PACKSHOT = {'01-hero', '03-jak-dziala', '04-pojemnosc', '05-funkcje', '07-mid-cta',
                '08-faq', '09-zamow', '10-final'}

def gen(section, tries=3):
    prompt = TASKS[section] + EXCL + ' ' + DNA
    refs = [{'url': STYL, 'type': 'ref'}]
    if section in REF_PACKSHOT:
        refs.insert(0, {'url': G + 'g0.webp', 'type': 'product'})
    payload = {'fn': 'generate-image', 'payload': {
        'prompt': prompt, 'count': 1, 'workflow_id': 'rozmrozik-m-%s' % section,
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

# -*- coding: utf-8 -*-
"""Pary MOBILE makiet ROZMROZIK (F2.4: mobile WSZYSTKICH sekcji, projekt OD ZERA pod 390px —
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
MAK = PUB + 'bud-assets/rozmrozik/makiety/'
STYL = PUB + 'bud-assets/rozmrozik/brand/00-styl-master.webp'

DNA = ('STYLE-DNA: icy pale-blue page #F2F7FA, bands #EAF1F6, white cards #FFFFFF; ink '
       '#232A31, body #2E3740, hairlines #CFDCE6; ONE accent burnt-tangerine #E8590C (CTA, '
       'swash under one word, warm end of the thaw-line hairline gradient #9BB8CE→#E8590C '
       'under eyebrows); icons 1.75px outline ink; display Zilla Slab (headlines, prices, BIG '
       'numbers), text Instrument Sans; radius 12px; layered warm-ambient shadows; light '
       'backgrounds only. Polish diacritics correct. Crisp mobile UI, no watermarks, no phone '
       'frame. ')

HEAD = ('High-fidelity MOBILE landing SECTION mockup, 390px-wide phone layout on a 2:3 portrait '
        'board. Image 1 = the DESKTOP mockup of this exact section: CONTENT source — keep the '
        'SAME copy, photos, hero characters and component styles, redesigned into ONE narrow '
        'column FOR PHONE (not a squeezed desktop). Image 2 = style reference ONLY — never '
        'copy its tiles onto the page. Output shows ONLY this one section, single column, '
        'big tap targets. NEVER 3 items side-by-side at 390px — stack into a vertical column. '
        'No floating trust-chip/badge overlay on any photo (desktop-only element). ')

TASKS = {
 '01-hero': ('MOBILE HERO, fold-first: compact top strip with lockup "Rozmrozik" only; then '
    'the DIPTYCH compressed to a horizontal pair of two SMALL square photos side by side '
    '(frozen steak "ZAMROŻONE" | appliance with meat "ROZMROŻONE") taking ~30%% of board '
    'height; then eyebrow "PLAN AWARYJNY NA ZAMROŻONY OBIAD" with thaw-line; H1 in Zilla '
    'Slab, EXACTLY 3 short lines, ≥38px feel: "Mięso z zamrażarki nie musi rozwalać planu '
    'na obiad." with tangerine swash under "planu"; MAX ONE benefit line in Instrument '
    'Sans: "Połóż, przykryj kopułą, dotknij — gotowe."; then a DISTINCT white micro-offer '
    'card overlapping the text zone boundary with generous room below: price "289,00 zł" '
    'big in slab, full-width tangerine CTA "Zamawiam Rozmrozik", micro-copy "Płatność przy '
    'odbiorze lub BLIK/online · 14 dni na zwrot", small payment pill row "BLIK · Visa · '
    'Mastercard · ZA POBRANIEM". Offer card fully INSIDE the frame, clearly above the '
    'bottom edge.'),
 '02-problem': ('MOBILE stack (type A reflow): photo on TOP ~45%% of board (bowl of warm '
    'water with steam in the sink, frozen pack soaking, microwave behind, woman\'s hand on '
    'counter, NO appliance anywhere), photo fades at its bottom edge into flat #EAF1F6; '
    'below on the flat zone: eyebrow "16:30. KAŻDEMU SIĘ ZDARZA." with thaw-line; H2 '
    '"Zamrażarka pamięta. Ty nie musisz."; lead "Wracasz z pracy, rodzina pyta o obiad, '
    'a mięso nadal jest twarde i pokryte szronem."; two stacked white mini-cards: "Miska '
    'ciepłej wody zajmująca zlew?" / "Mikrofala i brzegi, które zaczynają się gotować?"; '
    'closing line "Rozmrozik daje zamrożonym porcjom osobne miejsce: aluminiową płytę pod '
    'kopułą i tackę ociekową zbierającą wodę."'),
 '03-jak-dziala': ('MOBILE TOR-I stack: header block (eyebrow "TRZY RUCHY" + thaw-line, H2 '
    '"Połóż. Przykryj. Dotknij."); then ONE big photo stage card (state 1: hand placing '
    'meat portion on the aluminum plate, dome set aside); under it a VERTICAL stepper of '
    'three compact rows connected by a thin vertical line (NEVER side by side): "1 · '
    'Połóż" (active, ink bar) / "2 · Przykryj" / "3 · Dotknij", each with one short body '
    'line and a TINY state thumbnail on the right; status chip "Urządzenie uruchomione." '
    'and ink text link "Zobacz, ile mieści →" at the bottom.'),
 '04-pojemnosc': ('MOBILE stack, numbers first: eyebrow "MIEJSCE NA OBIAD" + thaw-line; H2 '
    '"Nie jedna porcja. Cztery."; GIANT "4,2 L" in Zilla Slab as typographic poster with '
    'smaller "4 steki / 4 porcje ryby" under it; toggle pill pair "Steki" (active ink) | '
    '"Ryba"; then photo card: TOP-DOWN view, EXACTLY four steaks on the perforated plate, '
    'dome set aside at edge; two short body lines below; caps spec strip "PŁYTA: STOP '
    'ALUMINIUM · KOPUŁA: PS · TACKA: ABS · ELEMENTY: NTC" wrapped to two lines.'),
 '05-funkcje': ('MOBILE stack: eyebrow "CO WIEMY O URZĄDZENIU" + thaw-line; H2 "Funkcje '
    'nazwane bez cudownych obietnic."; FOUR white cards stacked VERTICALLY (never grid), '
    'each: small square macro crop slot on the left + slab title + one line: "Plasma '
    'Locking" / "UVC Antibacterial" / "Panel dotykowy LED" / "USB-C" with their one-line '
    'descriptions; quiet note strip at the bottom on #EAF1F6: "Nie podajemy mocy, '
    'skuteczności procentowej ani czasu rozmrażania — dostępne materiały nie zawierają '
    'takich danych."'),
 '06-wideo': ('MOBILE video rail: eyebrow "ZOBACZ W PIONIE" + thaw-line; H2 "Pięć krótkich '
    'klipów. Jeden produkt."; sub "Przesuń rail i odtwórz wybrany materiał."; ONE 9:16 '
    'video card fully visible + ~15%% of the next card peeking from the right edge (swipe '
    'affordance), muted kitchen poster, centered ink play circle, caps chip "KLIP 1"; five '
    'dot indicators below (first active); ink text link "Przejdź do zamówienia →".'),
 '07-mid-cta': ('MOBILE banner card stack: one white card: eyebrow "PLAN NA ZAMROŻONE '
    'PORCJE" + thaw-line; H2 "Daj rozmrażaniu własne miejsce."; small packshot of the full '
    'set centered; price "289,00 zł" big; full-width tangerine CTA "Zamawiam Rozmrozik"; '
    'micro-copy "Płatność przy odbiorze lub BLIK/online · 14 dni na zwrot"; faint ghost '
    'typography "4,2 L" behind the header area.'),
 '08-faq': ('MOBILE FAQ stack: eyebrow "BEZ DROBNEGO DRUKU" + thaw-line; H2 "Pytania przed '
    'zamówieniem."; accordion of six full-width rows with hairline separators and ink "+" '
    'chevrons, FIRST row expanded ("Jak szybko rozmraża?" with the honest answer about no '
    'declared time), remaining collapsed: "Czy to nie kolejny gadżet?", "Ile mieści?", '
    '"Co dzieje się z wodą?", "Co oznaczają plazma i UVC?", "Jaki kolor otrzymam?"; below '
    'the accordion a compact offer block: price "289,00 zł", tangerine CTA "Przejdź do '
    'zamówienia", line "14 dni na zwrot".'),
 '09-zamow': ('MOBILE checkout skin stack: eyebrow "ZAMÓWIENIE" + thaw-line; H2 '
    '"Rozmrozik"; compact product row (tiny packshot + name + "Kolor: czarny" + price '
    '"289,00 zł"); then the steps card full-width: four numbered rows "1 · Kontakt" '
    '(expanded with two inputs "E-mail", "Telefon"), "2 · Adres", "3 · Dostawa", "4 · '
    'Płatność"; summary line "Do zapłaty: 289,00 zł + dostawa"; full-width tangerine CTA '
    '"Zamawiam i płacę"; small legal line "Zamówienie z obowiązkiem zapłaty · 14 dni na '
    'zwrot"; trust chips row "COD · BLIK/online · 14 dni".'),
 '10-final': ('MOBILE final stack: photo on TOP ~40%% (early evening kitchen, appliance calm '
    'on counter, pan with heat-haze and hanging towel, hand putting tongs down, warm '
    'light); below: eyebrow "NA KOLEJNE 16:30" + thaw-line; H2 "Każdemu zdarza się '
    'zapomnieć. Dobrze mieć plan." with swash under "plan"; one sub line; price "289,00 '
    'zł"; full-width tangerine CTA "Wracam do zamówienia"; micro-copy "Płatność przy '
    'odbiorze lub BLIK/online · 14 dni na zwrot"; closing caps "4,2 L · 4 STEKI" with '
    'thaw-line.'),
}

def gen(section, tries=3):
    prompt = HEAD + TASKS[section] + ' ' + DNA
    refs = [{'url': MAK + '%s.webp' % section, 'type': 'ref'},
            {'url': STYL, 'type': 'ref'}]
    payload = {'fn': 'generate-image', 'payload': {
        'prompt': prompt, 'count': 1, 'workflow_id': 'rozmrozik-mm-%s' % section,
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

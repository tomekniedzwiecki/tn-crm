# -*- coding: utf-8 -*-
"""Pary MOBILE makiet ODSACZEK (F2.4: mobile WSZYSTKICH sekcji, projekt OD ZERA pod 390px —
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
MAK = PUB + 'bud-assets/odsaczek/makiety/'
STYL = PUB + 'bud-assets/odsaczek/brand/00-styl-master.webp'

DNA = ('STYLE-DNA: warm linen page #F4EFE5, bands #EDE6D8, near-white cards #FFFCF6; ink '
       '#221E16, body #37322A, hairlines #DCD5C8; ONE accent bottle-green #176B3A (CTA, active, '
       'thin arc-arrows with small arrowheads); icons 1.5px outline ink; display Bricolage '
       'Grotesque, text Figtree; radius 14px; warm sepia shadows; light backgrounds only. '
       'Polish diacritics correct. Crisp mobile UI, no watermarks, no phone frame. ')

HEAD = ('High-fidelity MOBILE landing SECTION mockup, 390px-wide phone layout on a 2:3 portrait '
        'board. Image 1 = the DESKTOP mockup of this exact section: CONTENT source — keep the '
        'SAME copy, photos and component styles, redesigned into ONE narrow column FOR PHONE '
        '(not a squeezed desktop). Image 2 = style reference ONLY — never copy its tiles onto '
        'the page. Output shows ONLY this one section. ')

TASKS = {
 '01-hero': ('MOBILE HERO, archetype H (zoned stack, Drapek-pattern): photo zone ~42%% of board '
    'height (basket of fries lifted from wok, arc-arrow overlay, tiny lockup top-left); then '
    'big hook "Wyjmij całą porcję jednym ruchem" (EXACTLY 2 lines, tight leading, Bricolage '
    'ink) + ONE SHORT Figtree benefit line, MAX 2 lines total: "Składany koszyk ze stali — '
    'koniec łowienia frytek"; then a DISTINCT near-white micro-offer card overlapping the '
    'photo zone boundary, with GENEROUS breathing room below it: price "29,90 zł" big, '
    'full-width green CTA "Zamawiam Odsączek", micro-copy "Płatność online lub przy odbiorze '
    '· 14 dni na zwrot". All three zones INSIDE the frame; the offer card must sit clearly '
    'ABOVE the bottom edge.'),
 '02-jeden-ruch': ('Stack: header "Koniec łowienia frytek sztuka po sztuce"; TWO stacked photo '
    'cards (basket submerged in bubbling oil / same basket lifted with whole portion) connected '
    'by ONE vertical thin green arc-arrow between them; short captions under each; one body line.'),
 '03-zawies': ('Stack: header "Zawieś. Niech ocieka nad garnkiem."; large photo card (basket '
    'hanging by zigzag crown on pot rim, droplets falling in, nobody holding); below three '
    'compact icon+text rows (korona o rant / olej wraca do garnka / ręce wolne).'),
 '04-zloz': ('Stack: header "Po smażeniu składa się na płasko"; before/after comparison card '
    'with green toggle "Rozłożony/Złożony" (expanded basket packshot vs flat disk top view) '
    'and a thin arc-arrow; below photo strip: hand slides flat disk into kitchen drawer with '
    'caption "Płaski jak pokrywka — wsuwasz do szuflady".'),
 '05-durszlak': ('Stack: header "Działa też jak durszlak"; photo card (basket with pasta under '
    'running tap, water through mesh, hands on joined handles); below two icon+text rows '
    '(odcedzisz makaron i warzywa / opłuczesz owoce prosto w koszyku).'),
 '06-mycie': ('Stack: header "Mycie? Opłucz i gotowe"; photo card (empty basket rinsed under '
    'tap); smaller macro card (clean mesh weave with droplets); one body line about smooth '
    'stainless steel, no dishwasher symbols.'),
 '07-mid-cta': ('Stack: near-white offer card on band #EDE6D8: three small square thumbnails '
    'in a row connected by tiny green arc-arrows (in oil → lifted → hanging); display line '
    '"Smaż. Wyjmij. Zawieś."; big price "29,90 zł"; full-width green CTA "Zamawiam Odsączek"; '
    'micro-copy payment/returns line.'),
 '08-zamow': ('Stack: checkout card — small product thumbnail + "Odsączek" + "29,90 zł"; '
    'full-width outlined inputs (Imię i nazwisko, Telefon, Adres); two stacked payment radio '
    'cards "Płatność online" (selected green) / "Przy odbiorze (za pobraniem)"; full-width '
    'green CTA "Zamawiam i płacę"; micro-copy "14 dni na zwrot" + slim payment badges row.'),
 '09-faq': ('Stack: header "Pytania przed zakupem"; five full-width accordion rows with thin '
    '"+" icons, first expanded with short answer and tiny photo thumbnail: jak używać w garnku '
    'lub woku / jak zawiesić na rancie / jak złożyć na płasko / czy działa jak durszlak / '
    'jak zapłacić przy odbiorze.'),
 '10-final': ('Stack: display line "Cała porcja. Jeden ruch. Zero łowienia."; photo card '
    '(basket with nuggets hanging on pot rim, counter with wooden board); price "29,90 zł"; '
    'full-width green CTA "Zamawiam Odsączek"; micro-copy payments/returns; tiny lockup.'),
}


def gen(section, tries=3):
    prompt = HEAD + TASKS[section] + ' ' + DNA
    payload = {'fn': 'generate-image', 'payload': {
        'prompt': prompt, 'count': 1, 'workflow_id': 'odsaczek-m-%s-mobile' % section,
        'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium', 'aspect_ratio': '2:3',
        'reference_images': [
            {'url': MAK + section + '.webp', 'type': 'ref'},
            {'url': STYL, 'type': 'ref'},
        ]}}
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
            print('  [%s] proba %d/%d FAIL: %s' % (section, attempt, tries, str(e)[:160]))
            if attempt == tries:
                raise
            time.sleep(10 * attempt)


args = sys.argv[1:]
todo = list(TASKS) if args == ['all'] else args
ok, fail = [], []
with ThreadPoolExecutor(max_workers=4) as ex:
    futs = {ex.submit(gen, s): s for s in todo}
    for f in as_completed(futs):
        s = futs[f]
        try:
            ok.append(f.result()); print('OK', s)
        except Exception as e:
            fail.append(s); print('FAIL', s, str(e)[:120])
print('GOTOWE: %d OK, %d FAIL %s' % (len(ok), len(fail), fail))

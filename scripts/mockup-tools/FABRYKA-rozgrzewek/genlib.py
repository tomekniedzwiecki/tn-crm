# -*- coding: utf-8 -*-
"""Wspolny kanal generacji makiet ROZGRZEWEK.
Primary: LOKALNY OpenAI /v1/images/edits gpt-image-2 quality=HIGH (multi-ref przez image[]).
Fallback (HTTP 5xx/520 lub transient wyczerpany): edge wf2-gen quality=MEDIUM (refy po URL).
Worklog: kazda udana generacja dopisuje linie JSON {section,channel,quality,size,ts} do out/worklog.jsonl."""
import base64, io, json, os, re, time, urllib.request
import requests

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
WORKLOG = os.path.join(OUT, 'worklog.jsonl')
os.makedirs(OUT, exist_ok=True)

# .env czytany jako utf-8-sig (BOM-safe wg zlecenia)
ENV = io.open(r'c:/repos_tn/tn-crm/.env', encoding='utf-8-sig', errors='ignore').read()
OPENAI_KEY = re.search(r'^OPENAI_API_KEY=(.+)$', ENV, re.M).group(1).strip()
WF2_SECRET = re.search(r'^WF2_GEN_SECRET=(.+)$', ENV, re.M).group(1).strip()
EDGE = 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'


def _worklog(section, channel, quality, size):
    rec = {'section': section, 'channel': channel, 'quality': quality, 'size': size,
           'ts': time.strftime('%Y-%m-%dT%H:%M:%S')}
    with io.open(WORKLOG, 'a', encoding='utf-8') as f:
        f.write(json.dumps(rec, ensure_ascii=False) + '\n')


def _mime(p):
    return 'image/webp' if p.lower().endswith('.webp') else 'image/png'


def _local_edits(prompt, ref_local_paths, size, tries=2):
    """LOKALNY /v1/images/edits gpt-image-2 HIGH. Zwraca bytes PNG. Rzuca gdy 5xx/transient."""
    last = None
    for attempt in range(1, tries + 1):
        fhs = []
        try:
            files = []
            for rp in ref_local_paths:
                fh = open(rp, 'rb'); fhs.append(fh)
                files.append(('image[]', (os.path.basename(rp), fh, _mime(rp))))
            data = {'model': 'gpt-image-2', 'prompt': prompt, 'size': size,
                    'quality': 'high', 'n': '1'}
            r = requests.post('https://api.openai.com/v1/images/edits',
                              headers={'Authorization': 'Bearer ' + OPENAI_KEY},
                              data=data, files=files, timeout=600)
            if r.status_code != 200:
                raise RuntimeError('HTTP %s: %s' % (r.status_code, (r.text or '')[:220]))
            return base64.b64decode(r.json()['data'][0]['b64_json'])
        except Exception as e:
            last = e
            msg = str(e)[:180]
            # 5xx/520 -> nie retryuj lokalnie, oddaj do fallbacku edge
            if re.search(r'HTTP 5\d\d', msg) or 'HTTP 520' in msg:
                raise
            print('    [local %d/%d] transient: %s' % (attempt, tries, msg))
            if attempt == tries:
                raise
            time.sleep(6 * attempt)
        finally:
            for fh in fhs:
                try: fh.close()
                except Exception: pass
    raise last


def _edge_gen(prompt, ref_urls_typed, aspect, workflow_id, tries=3):
    """FALLBACK edge wf2-gen MEDIUM. ref_urls_typed = [{'url','type'}]. Zwraca bytes."""
    payload = {'fn': 'generate-image', 'payload': {
        'prompt': prompt, 'count': 1, 'workflow_id': workflow_id,
        'type': 'mockup', 'provider': 'gpt-image-2', 'quality': 'medium',
        'aspect_ratio': aspect, 'reference_images': ref_urls_typed}}
    body = json.dumps(payload).encode('utf-8')
    last = None
    for attempt in range(1, tries + 1):
        try:
            req = urllib.request.Request(EDGE, data=body, headers={
                'Content-Type': 'application/json', 'x-wf2-secret': WF2_SECRET})
            j = json.loads(urllib.request.urlopen(req, timeout=600).read().decode('utf-8'))
            url = (j.get('images') or [{}])[0].get('url')
            if not url:
                raise RuntimeError('no images: ' + json.dumps(j)[:200])
            return urllib.request.urlopen(url, timeout=120).read()
        except Exception as e:
            last = e
            print('    [edge %d/%d] FAIL: %s' % (attempt, tries, str(e)[:180]))
            if attempt == tries:
                raise
            time.sleep(8 * attempt)
    raise last


def generate(section, out_name, prompt, ref_local_paths, ref_urls_typed, aspect, workflow_id):
    """Generuje 1 obraz. aspect '3:2'->1536x1024, '2:3'->1024x1536, '1:1'->1024x1024.
    Primary local HIGH; przy 5xx/520 -> edge MEDIUM. Zapis PNG do out/<out_name>. Zwraca sciezke."""
    size = {'3:2': '1536x1024', '2:3': '1024x1536', '1:1': '1024x1024'}[aspect]
    out = os.path.join(OUT, out_name)
    try:
        blob = _local_edits(prompt, ref_local_paths, size)
        open(out, 'wb').write(blob)
        _worklog(section, 'local', 'high', size)
        return out
    except Exception as e:
        print('  [%s] local HIGH nieudany (%s) -> fallback edge MEDIUM' % (section, str(e)[:120]))
        blob = _edge_gen(prompt, ref_urls_typed, aspect, workflow_id)
        open(out, 'wb').write(blob)
        _worklog(section, 'edge', 'medium', aspect)
        return out

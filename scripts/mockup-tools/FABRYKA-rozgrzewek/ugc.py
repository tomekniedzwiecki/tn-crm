# -*- coding: utf-8 -*-
"""F3 ROZGRZEWEK UGC: listing opinii z bud-reviews/1005008248153062/ (Storage API, service-role),
pobranie do refs-cache/ugc-src/ (vision-gate 1. para oczu), rehost zakwalifikowanych GRANATOWYCH
do bud-assets/rozgrzewek/assets/ugc/ (WebP q85). BRAMKA: >=2 klatki granatowe -> sekcja; <2 -> SKIP.
Uzycie:
  python ugc.py list                 # lista + pobranie wszystkich klatek do ogladu
  python ugc.py rehost NAME [NAME..] # rehost wybranych (po nazwie pliku) do Storage
"""
import importlib.util, io, json, os, sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'refs-cache', 'ugc-src'); os.makedirs(SRC, exist_ok=True)
PS = r'C:\repos_tn\tn-crm\scripts\mockup-tools\panel-sync.py'
spec = importlib.util.spec_from_file_location('ps', PS)
ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)

BUCKET = 'attachments'
PREFIX = 'bud-reviews/1005008248153062/'
import requests


def _list(prefix):
    """Storage list API (rekurencyjnie po podfolderach)."""
    out = []
    body = {'prefix': prefix, 'limit': 1000, 'sortBy': {'column': 'name', 'order': 'asc'}}
    r = requests.post('%s/object/list/%s' % (ps.STORAGE, BUCKET), headers=ps.HJSON,
                      data=json.dumps(body).encode('utf-8'), timeout=60)
    r.raise_for_status()
    for it in r.json():
        name = it.get('name')
        if not name:
            continue
        full = prefix + name
        if it.get('id') is None and '.' not in name:      # podfolder -> rekurencja
            out += _list(full + '/')
        else:
            out.append(full)
    return out


def cmd_list():
    files = _list(PREFIX)
    imgs = [f for f in files if f.lower().rsplit('.', 1)[-1] in ('jpg', 'jpeg', 'png', 'webp')]
    print('Znaleziono %d obiektow (%d obrazow) pod %s' % (len(files), len(imgs), PREFIX))
    manifest = []
    for f in imgs:
        url = '%s/%s/%s' % (ps.PUBLIC_BASE, BUCKET, f)
        local = os.path.join(SRC, f.replace(PREFIX, '').replace('/', '_'))
        try:
            data = urllib.request.urlopen(url, timeout=60).read()
            open(local, 'wb').write(data)
            manifest.append({'remote': f, 'local': os.path.basename(local), 'bytes': len(data), 'url': url})
            print('  DL', os.path.basename(local), len(data), 'B')
        except Exception as e:
            print('  ERR', f, str(e)[:120])
    json.dump(manifest, open(os.path.join(SRC, '_manifest.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=2)
    print('Manifest ->', os.path.join(SRC, '_manifest.json'))


def cmd_rehost(names):
    """Rehost wybranych (basename lokalny) -> bud-assets/rozgrzewek/assets/ugc/ugc-N.webp."""
    man = json.load(open(os.path.join(SRC, '_manifest.json'), encoding='utf-8'))
    by_local = {m['local']: m for m in man}
    urls = {}
    for i, nm in enumerate(names, 1):
        if nm not in by_local:
            print('BRAK w manifescie:', nm); continue
        local = os.path.join(SRC, nm)
        dest = 'bud-assets/rozgrzewek/assets/ugc/ugc-%d.webp' % i
        url = ps.storage_upload(local, dest, to_webp=True, quality=85, max_width=1100)
        urls['ugc-%d' % i] = {'url': url, 'src_remote': by_local[nm]['remote']}
        print('OK', nm, '->', url)
    json.dump(urls, open(os.path.join(HERE, 'ugc-urls.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=2)
    print('KONIEC rehost — %d klatek -> ugc-urls.json' % len(urls))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'list'
    if cmd == 'list':
        cmd_list()
    elif cmd == 'rehost':
        cmd_rehost(sys.argv[2:])

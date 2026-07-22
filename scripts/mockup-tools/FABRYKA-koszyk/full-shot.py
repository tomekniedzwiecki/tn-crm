# -*- coding: utf-8 -*-
"""F8: full-page screenshoty LIVE (1280 + 390) -> archiwum + bud-assets/odsaczek/panel/
+ artefakty lp_finisz (kind screenshot_final). Prymitywy CDP z sekcja-diff."""
import base64, importlib.util, io, json, os, subprocess, sys, tempfile, time

sys.stdout.reconfigure(encoding='utf-8')
MT = r'c:\repos_tn\tn-crm\scripts\mockup-tools'
spec = importlib.util.spec_from_file_location('sd', os.path.join(MT, 'sekcja-diff.py'))
sd = importlib.util.module_from_spec(spec)
sys.argv = ['sekcja-diff.py']
try:
    spec.loader.exec_module(sd)
except SystemExit:
    pass
from PIL import Image
spec2 = importlib.util.spec_from_file_location('ps', os.path.join(MT, 'panel-sync.py'))
ps = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(ps)

ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\odsaczek'
URL = 'https://zaradek.pl/odsaczek'
PROJ = 'c2af0524-3c37-4ada-9c9c-acae739a1373'
PROD = 'f69d7cee-6e1e-42b1-8ccf-39afb9a47a34'
PUB = 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/'


def fullshot(width, mobile, nazwa):
    port = sd.free_port()
    profile = tempfile.mkdtemp(prefix='fs-')
    proc = subprocess.Popen([sd.chrome_path(), '--headless=new', '--disable-gpu', '--no-first-run',
                             '--remote-debugging-port=%d' % port, '--user-data-dir=' + profile,
                             '--window-size=%d,1000' % width, 'about:blank'])
    try:
        sd.wait_debugger(port)
        tabs = sd.cdp_get(port, '/json/list')
        ws = sd.WS([t for t in tabs if t.get('type') == 'page'][0]['webSocketDebuggerUrl'])
        ws.call('Page.enable'); ws.call('Runtime.enable')

        def js(expr):
            r = ws.call('Runtime.evaluate', {'expression': expr, 'returnByValue': True})
            node = r.get('result') or {}
            if 'result' in node and isinstance(node['result'], dict):
                node = node['result']
            return node.get('value')

        ws.call('Emulation.setDeviceMetricsOverride', {'width': width, 'height': 1000,
                                                       'deviceScaleFactor': 1, 'mobile': mobile})
        ws.call('Page.navigate', {'url': URL})
        time.sleep(10)
        h = int(js('document.documentElement.scrollHeight') or 8000)
        ws.call('Emulation.setDeviceMetricsOverride', {'width': width, 'height': min(h, 16000),
                                                       'deviceScaleFactor': 1, 'mobile': mobile})
        time.sleep(2.5)
        shot = ws.call('Page.captureScreenshot', {'format': 'png'}, timeout=120)
        sh = shot.get('result', shot)
        if 'result' in sh and isinstance(sh['result'], dict):
            sh = sh['result']
        img = Image.open(io.BytesIO(base64.b64decode(sh['data'])))
        p = os.path.join(ARCH, nazwa)
        img.save(p, optimize=True)
        print('OK', nazwa, img.size)
        return p
    finally:
        proc.kill()


for width, mobile, nazwa, kind in ((1280, False, 'full-1280.png', 'screenshot_final'),
                                   (390, True, 'full-390.png', 'screenshot_final')):
    p = fullshot(width, mobile, nazwa)
    dest = 'bud-assets/odsaczek/panel/' + nazwa.replace('.png', '.webp')
    ps.storage_upload(p, dest, to_webp=True, max_width=1400)
    ps.artifact_add(PROJ, PROD, 'lp_finisz', kind, PUB + dest,
                    label='Finalny zrzut LIVE zaradek.pl/odsaczek (%dpx)' % width,
                    meta={'viewport': 'desktop' if width == 1280 else 'mobile'})
print('KONIEC')

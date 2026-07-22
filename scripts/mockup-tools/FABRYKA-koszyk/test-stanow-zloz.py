# -*- coding: utf-8 -*-
"""F6 ODSACZEK — test stanow TOR-I #zloz (toggle rozlozony/plaski) na LIVE.
CDP prymitywami sekcja-diff (import modulu): crop sekcji w stanie A -> klik przelacznika
-> crop w stanie B -> SSIM < 0.9 = interakcja ZYWA. Dowody + WYNIK.md do archiwum."""
import importlib.util, io, os, subprocess, sys, tempfile, time

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

ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\odsaczek\interakcje\zloz-test'
os.makedirs(ARCH, exist_ok=True)
URL = 'https://zaradek.pl/odsaczek'
W, VH = 390, 844

port = sd.free_port()
profile = tempfile.mkdtemp(prefix='zloz-test-')
proc = subprocess.Popen([sd.chrome_path(), '--headless=new', '--disable-gpu', '--no-first-run',
                         '--remote-debugging-port=%d' % port, '--user-data-dir=' + profile,
                         '--window-size=%d,%d' % (W, VH), 'about:blank'])
try:
    sd.wait_debugger(port)
    tabs = sd.cdp_get(port, '/json/list')
    ws = sd.WS([t for t in tabs if t.get('type') == 'page'][0]['webSocketDebuggerUrl'])
    ws.call('Page.enable'); ws.call('Runtime.enable')
    ws.call('Emulation.setDeviceMetricsOverride', {'width': W, 'height': VH,
                                                   'deviceScaleFactor': 1, 'mobile': True})
    ws.call('Page.navigate', {'url': URL})
    time.sleep(9)

    def js(expr):
        r = ws.call('Runtime.evaluate', {'expression': expr, 'returnByValue': True})
        # ksztalt zaleznie od implementacji WS.call: {result:{result:{value}}} lub {result:{value}}
        node = r.get('result') or {}
        if 'result' in node and isinstance(node['result'], dict):
            node = node['result']
        return node.get('value')

    js("document.getElementById('zloz').scrollIntoView({block:'center'})")
    time.sleep(2.2)

    def crop_zloz(nazwa):
        shot = ws.call('Page.captureScreenshot', {'format': 'png'}, timeout=90)
        import base64
        sh = shot.get('result', shot)
        if 'result' in sh and isinstance(sh['result'], dict):
            sh = sh['result']
        img = Image.open(io.BytesIO(base64.b64decode(sh['data'])))
        r = js("JSON.stringify(document.getElementById('zloz').getBoundingClientRect())")
        import json as _j
        b = _j.loads(r)
        x0, y0 = max(0, int(b['x'])), max(0, int(b['y']))
        img = img.crop((x0, y0, min(img.size[0], int(b['x'] + b['width'])),
                        min(img.size[1], max(y0 + 10, min(int(b['y'] + b['height']), img.size[1])))))
        img.save(os.path.join(ARCH, nazwa))
        return img

    a = crop_zloz('stan-A.png')
    # przelacznik: znajdz drugi przycisk/tab w sekcji
    kl = js("""(function(){var s=document.getElementById('zloz');
      var b=s.querySelectorAll('button,[role=tab],[role=switch],.toggle,[data-stan]');
      if(b.length<1)return 'BRAK';
      var t=b.length>1?b[1]:b[0]; t.click(); return (t.textContent||t.className).trim().slice(0,60);})()""")
    print('kliknieto:', kl)
    time.sleep(1.6)
    b = crop_zloz('stan-B.png')

    import numpy as np
    from skimage.metrics import structural_similarity as ssim
    def prep(im):
        im = im.convert('L').resize((360, max(60, int(im.size[1] * 360 / im.size[0]))))
        return np.asarray(im)
    pa, pb = prep(a), prep(b)
    h = min(pa.shape[0], pb.shape[0])
    val = ssim(pa[:h], pb[:h])
    zywa = val < 0.9
    print('SSIM(A,B) = %.3f -> %s' % (val, 'ZYWA' if zywa else 'MARTWA?'))

    io.open(os.path.join(ARCH, 'WYNIK.md'), 'w', encoding='utf-8').write(
        "# Test stanow TOR-I zloz (Odsaczek)\n\n"
        "SSIM(stan A, stan B) = %.3f %s 0.9 → interakcja %s (zmienia sie packshot rozlozony↔plaski + caption).\n"
        "Klik przelacznika: '%s' (LIVE zaradek.pl/odsaczek @390, CDP headless).\n"
        "Dowody: stan-A.png, stan-B.png (crop #zloz @390).\n"
        % (val, '<' if zywa else '>=', 'ZYWA' if zywa else 'DO WYJASNIENIA', kl))
    print('OK ->', ARCH)
finally:
    proc.kill()

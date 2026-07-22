# -*- coding: utf-8 -*-
"""F5 SKROLIK — test stanow TOR-I #demo (klik ▼ -> feed zjezdza o karte) na LIVE.
Crop NOSNIKA RUCHU (.dm-screen — sam ekran, bez ramki), nie calej sekcji: ruch dzieje sie
w malym ekranie, SSIM calej sekcji byloby rozwodnione. Dodatkowo twardy dowod JS:
transform .dm-feed przed/po kliku + powrot do 0 po pelnym cyklu."""
import importlib.util, io, json, os, subprocess, sys, tempfile, time

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

ARCH = r'C:\Users\tomek\Desktop\TN-Sklepy-grafiki\FABRYKA-2026-07\pierscien\interakcje\demo-test'
os.makedirs(ARCH, exist_ok=True)
URL = 'https://zaradek.pl/skrolik'
W, VH = 390, 844

port = sd.free_port()
profile = tempfile.mkdtemp(prefix='demo-test-')
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
        node = r.get('result') or {}
        if 'result' in node and isinstance(node['result'], dict):
            node = node['result']
        return node.get('value')

    js("document.querySelector('#demo .dm-screen').scrollIntoView({block:'center'})")
    time.sleep(2.2)

    def crop_phone(nazwa):
        shot = ws.call('Page.captureScreenshot', {'format': 'png'}, timeout=90)
        import base64
        sh = shot.get('result', shot)
        if 'result' in sh and isinstance(sh['result'], dict):
            sh = sh['result']
        img = Image.open(io.BytesIO(base64.b64decode(sh['data'])))
        b = json.loads(js("JSON.stringify(document.querySelector('#demo .dm-screen').getBoundingClientRect())"))
        x0, y0 = max(0, int(b['x'])), max(0, int(b['y']))
        img = img.crop((x0, y0, min(img.size[0], int(b['x'] + b['width'])),
                        min(img.size[1], max(y0 + 10, min(int(b['y'] + b['height']), img.size[1])))))
        img.save(os.path.join(ARCH, nazwa))
        return img

    tr = lambda: js("getComputedStyle(document.querySelector('#demo .dm-feed')).transform")
    t0 = tr()
    a = crop_phone('stan-A.png')
    js("document.querySelector('#demo .dm-btn').click()")
    time.sleep(1.2)
    t1 = tr()
    b = crop_phone('stan-B.png')
    for _ in range(3):
        js("document.querySelector('#demo .dm-btn').click()")
        time.sleep(0.9)
    time.sleep(0.8)
    t4 = tr()
    print('transform: start=%s po1=%s po4=%s' % (t0, t1, t4))

    import numpy as np
    from skimage.metrics import structural_similarity as ssim
    def prep(im):
        im = im.convert('L').resize((260, max(60, int(im.size[1] * 260 / im.size[0]))))
        return np.asarray(im)
    pa, pb = prep(a), prep(b)
    h = min(pa.shape[0], pb.shape[0])
    val = ssim(pa[:h], pb[:h])
    zywa = val < 0.9
    def parse_ty(t):
        if not t or t == 'none':
            return 0.0
        try:
            return float(t.split(',')[-1].rstrip(')'))
        except Exception:
            return None
    ty0, ty1, ty4 = parse_ty(t0), parse_ty(t1), parse_ty(t4)
    przesuw = ty1 is not None and ty1 < -50
    powrot = ty4 is not None and abs(ty4) < 2
    print('SSIM(A,B)=%.3f -> %s · przesuw=%s · powrot=%s' % (val, 'ZYWA' if zywa else 'MARTWA?', przesuw, powrot))

    io.open(os.path.join(ARCH, 'WYNIK.md'), 'w', encoding='utf-8').write(
        "# Test stanow TOR-I demo (Skrolik) — LIVE zaradek.pl/skrolik @390, CDP headless\n\n"
        "- SSIM(stan A, stan B) crop .dm-screen = %.3f %s 0.9 → interakcja %s (feed przesuniety o karte).\n"
        "- Twardy dowod JS: transform .dm-feed start=%s → po 1 kliku=%s (przesuw %s) → po 4 klikach=%s (powrot do startu %s).\n"
        "- Dowody: stan-A.png, stan-B.png (crop .dm-screen — nosnik ruchu; crop calej sekcji rozwadnialby SSIM).\n"
        % (val, '<' if zywa else '>=', 'ZYWA' if zywa else 'DO WYJASNIENIA',
           t0, t1, 'OK' if przesuw else 'BRAK', t4, 'OK' if powrot else 'BRAK'))
    print('OK ->', ARCH)
    if not (zywa and przesuw and powrot):
        sys.exit(1)
finally:
    proc.kill()

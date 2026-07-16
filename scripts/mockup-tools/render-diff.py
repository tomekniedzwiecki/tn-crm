# -*- coding: utf-8 -*-
"""
render-diff.py <plik.html|url> <makieta.png> <selektor-sekcji> <szerokosc>

Renderuje sekcje (selektor CSS) headless Chrome w zadanej szerokosci, kadruje do bboxa sekcji,
skaluje makiete i render do wspolnej szerokosci i liczy:
  - SSIM (scikit-image, grayscale)
  - heatmapa roznic (PIL ImageChops + threshold, czerwone piksele na polprzezroczystym renderze)
  - kompozyt poziomy: makieta | render | heatmapa
  - JSON {ssim, regiony roznic (bbox klastrow)}

Keep-best: pliki zapisywane z sufiksem -ssim<val>.
Wymaga: Chrome (headless=new) + CDP przez remote-debugging-port (Page.captureScreenshot z clip).
"""
import sys, os, json, time, subprocess, socket, urllib.request, urllib.error, base64, tempfile, argparse, shutil
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFont
from skimage.metrics import structural_similarity as ssim
import cv2

CHROME_CANDS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
]

def chrome_path():
    for c in CHROME_CANDS:
        if os.path.isfile(c):
            return c
    raise SystemExit("Chrome nie znaleziony")

def free_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p

def cdp_get(port, path):
    return json.loads(urllib.request.urlopen("http://127.0.0.1:%d%s" % (port, path), timeout=5).read())

def wait_debugger(port, timeout=25):
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            cdp_get(port, "/json/version"); return True
        except Exception:
            time.sleep(0.3)
    return False

class WS:
    """Minimalny klient CDP WebSocket (bez zaleznosci zewnetrznych)."""
    def __init__(self, url):
        from urllib.parse import urlparse
        u = urlparse(url)
        self.sock = socket.create_connection((u.hostname, u.port))
        key = base64.b64encode(os.urandom(16)).decode()
        req = ("GET %s HTTP/1.1\r\nHost: %s:%d\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
               "Sec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n") % (u.path, u.hostname, u.port, key)
        self.sock.sendall(req.encode())
        resp = b""
        while b"\r\n\r\n" not in resp:
            resp += self.sock.recv(4096)
        self._id = 0
        self._buf = b""

    def _frame(self, payload):
        b = payload.encode("utf-8")
        hdr = bytearray([0x81])
        n = len(b); mask = os.urandom(4)
        if n < 126:
            hdr.append(0x80 | n)
        elif n < 65536:
            hdr.append(0x80 | 126); hdr += n.to_bytes(2, "big")
        else:
            hdr.append(0x80 | 127); hdr += n.to_bytes(8, "big")
        hdr += mask
        masked = bytes(bb ^ mask[i % 4] for i, bb in enumerate(b))
        self.sock.sendall(bytes(hdr) + masked)

    def _recv_frame(self):
        def rd(n):
            while len(self._buf) < n:
                self._buf += self.sock.recv(65536)
            out = self._buf[:n]; self._buf = self._buf[n:]; return out
        b0, b1 = rd(2)
        ln = b1 & 0x7F
        if ln == 126:
            ln = int.from_bytes(rd(2), "big")
        elif ln == 127:
            ln = int.from_bytes(rd(8), "big")
        data = rd(ln)
        return data.decode("utf-8", "replace")

    def call(self, method, params=None, timeout=60):
        self._id += 1
        mid = self._id
        self._frame(json.dumps({"id": mid, "method": method, "params": params or {}}))
        t0 = time.time()
        while time.time() - t0 < timeout:
            msg = json.loads(self._recv_frame())
            if msg.get("id") == mid:
                if "error" in msg:
                    raise RuntimeError(msg["error"])
                return msg.get("result", {})
        raise TimeoutError(method)

def render_section(target, selector, width, height=2400):
    chrome = chrome_path()
    port = free_port()
    profile = tempfile.mkdtemp(prefix="cdp-")
    url = target
    if not (target.startswith("http://") or target.startswith("https://")):
        url = "file:///" + os.path.abspath(target).replace("\\", "/")
    args = [chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--no-first-run", "--no-default-browser-check", "--disable-extensions",
            "--force-device-scale-factor=1", "--remote-debugging-port=%d" % port,
            "--user-data-dir=" + profile, "--window-size=%d,%d" % (width, height), url]
    proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        if not wait_debugger(port):
            raise SystemExit("Chrome debugger nie wstal")
        tabs = [t for t in cdp_get(port, "/json") if t.get("type") == "page"]
        ws = WS(tabs[0]["webSocketDebuggerUrl"])
        ws.call("Page.enable")
        ws.call("Runtime.enable")
        ws.call("Emulation.setDeviceMetricsOverride",
                {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": width < 700})
        time.sleep(2.2)  # layout + fonty + lazy img
        # dociagnij lazy: przewin
        ws.call("Runtime.evaluate", {"expression": "window.scrollTo(0,document.body.scrollHeight);"})
        time.sleep(0.8)
        ws.call("Runtime.evaluate", {"expression": "window.scrollTo(0,0);"})
        time.sleep(0.6)
        expr = ("(function(){var e=document.querySelector(%s);if(!e)return null;"
                "e.scrollIntoView();var r=e.getBoundingClientRect();"
                "return JSON.stringify({x:r.x+window.scrollX,y:r.y+window.scrollY,w:r.width,h:r.height});})()"
                % json.dumps(selector))
        res = ws.call("Runtime.evaluate", {"expression": expr, "returnByValue": True})
        val = res.get("result", {}).get("value")
        if not val:
            raise SystemExit("Selektor '%s' nie znaleziony w renderze" % selector)
        box = json.loads(val)
        clip = {"x": round(box["x"]), "y": round(box["y"]),
                "width": round(box["w"]), "height": round(box["h"]), "scale": 1}
        shot = ws.call("Page.captureScreenshot",
                       {"format": "png", "clip": clip, "captureBeyondViewport": True}, timeout=90)
        raw = base64.b64decode(shot["data"])
        return Image.open(__import__("io").BytesIO(raw)).convert("RGB")
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
        shutil.rmtree(profile, ignore_errors=True)

def to_width(img, W):
    if img.width == W:
        return img
    h = round(img.height * W / img.width)
    return img.resize((W, h), Image.LANCZOS)

def font(sz):
    for f in ["arialbd.ttf", "arial.ttf"]:
        try:
            return ImageFont.truetype(f, sz)
        except Exception:
            continue
    return ImageFont.load_default()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("target")
    ap.add_argument("makieta")
    ap.add_argument("selector")
    ap.add_argument("width", type=int)
    ap.add_argument("--out", default=None)
    ap.add_argument("--label", default="v")
    a = ap.parse_args()

    outdir = a.out or os.path.dirname(os.path.abspath(a.makieta))
    os.makedirs(outdir, exist_ok=True)

    mk = Image.open(a.makieta).convert("RGB")
    rd = render_section(a.target, a.selector, a.width)

    # wspolna szerokosc = szerokosc makiety (skala makiety kanoniczna)
    W = mk.width
    rd_w = to_width(rd, W)
    mk_w = mk
    # wspolna wysokosc = min (porownujemy nakladajacy sie obszar od gory)
    Hc = min(mk_w.height, rd_w.height)
    mk_c = mk_w.crop((0, 0, W, Hc))
    rd_c = rd_w.crop((0, 0, W, Hc))

    a_gray = np.array(mk_c.convert("L"))
    b_gray = np.array(rd_c.convert("L"))
    score, _ = ssim(a_gray, b_gray, full=True)
    score = float(score)

    # heatmapa: diff -> threshold -> czerwone na polprzezroczystym renderze
    diff = ImageChops.difference(mk_c, rd_c).convert("L")
    dnp = np.array(diff)
    mask = (dnp > 40).astype(np.uint8)
    heat = rd_c.copy().convert("RGB")
    overlay = Image.new("RGB", heat.size, (255, 255, 255))
    heat = Image.blend(heat, overlay, 0.55)
    heat_np = np.array(heat)
    heat_np[mask == 1] = (255, 0, 0)
    heat = Image.fromarray(heat_np)

    # regiony roznic: klastry maski
    m = cv2.morphologyEx(mask * 255, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8), iterations=2)
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    regions = []
    for c in cnts:
        x, y, w, h = cv2.boundingRect(c)
        if w * h < 0.004 * W * Hc:
            continue
        regions.append({"x": x, "y": y, "w": w, "h": h,
                        "x1000": round(1000 * x / W), "y1000": round(1000 * y / Hc)})
    regions.sort(key=lambda r: -(r["w"] * r["h"]))
    regions = regions[:12]
    dd = ImageDraw.Draw(heat)
    for i, r in enumerate(regions, 1):
        dd.rectangle([r["x"], r["y"], r["x"] + r["w"], r["y"] + r["h"]], outline=(255, 210, 0), width=2)
        dd.text((r["x"] + 2, r["y"] + 2), str(i), fill=(255, 210, 0), font=font(16))

    # kompozyt poziomy: makieta | render | heatmapa
    pad = 12
    lab_h = 26
    comp = Image.new("RGB", (W * 3 + pad * 4, Hc + lab_h + pad * 2), (245, 245, 245))
    labels = ["MAKIETA", "RENDER", "HEATMAPA ssim=%.4f" % score]
    for i, im in enumerate([mk_c, rd_c, heat]):
        x0 = pad + i * (W + pad)
        comp.paste(im, (x0, lab_h + pad))
    dcomp = ImageDraw.Draw(comp)
    for i, lab in enumerate(labels):
        x0 = pad + i * (W + pad)
        dcomp.text((x0, 6), lab, fill=(10, 10, 10), font=font(18))

    sval = ("%.4f" % score).replace("0.", "")
    base = os.path.splitext(os.path.basename(a.makieta))[0]
    stem = "%s-%s-ssim%s" % (base, a.label, sval)
    comp_path = os.path.join(outdir, stem + ".png")
    comp.save(comp_path)
    json_path = os.path.join(outdir, stem + ".json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({"ssim": round(score, 4), "width": W, "compare_height": Hc,
                   "regions": regions, "render_size": [rd.width, rd.height],
                   "composite": comp_path}, f, ensure_ascii=False, indent=2)
    print("SSIM: %.4f" % score)
    print("COMPOSITE:", comp_path)
    print("JSON:", json_path)
    print("regions:", len(regions))

if __name__ == "__main__":
    main()

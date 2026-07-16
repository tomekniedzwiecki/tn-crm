# -*- coding: utf-8 -*-
"""
viewport-diff.py <plik.html|url> <makieta.png> <width> <height> [--out dir] [--label L]
Porównanie PIERWSZEGO EKRANU (viewport-pinned) z makietą hero: viewport = wymiar makiety
(svh liczy się poprawnie), force-reveal + eager-img, zrzut BEZ clipa (bez captureBeyondViewport).
Wynik: kompozyt MAKIETA|RENDER|HEATMAPA + SSIM (jak render-diff). Uzupełnia render-diff.py,
którego domyślny wysoki viewport (2400) rozciąga sekcje ze `svh` i zaniża SSIM hero.
"""
import sys, os, json, time, base64, tempfile, subprocess, argparse, importlib.util
import numpy as np
from PIL import Image, ImageDraw
from skimage.metrics import structural_similarity as ssim

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("rd", os.path.join(HERE, "render-diff.py"))
rd = importlib.util.module_from_spec(spec)
sys.modules["rd"] = rd
_argv = sys.argv; sys.argv = ["render-diff.py"]  # nie odpalaj main()
try:
    spec.loader.exec_module(rd)
finally:
    sys.argv = _argv

FORCE_REVEAL = """(async function(){
  document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'));
  document.querySelectorAll('img[loading="lazy"]').forEach(i=>i.loading='eager');
  const imgs=[...document.images];
  const t0=Date.now();
  while(Date.now()-t0<15000){
    if(imgs.every(i=>i.complete&&i.naturalWidth>0)) break;
    await new Promise(r=>setTimeout(r,250));
  }
  window.scrollTo(0,0);
  return imgs.filter(i=>!(i.complete&&i.naturalWidth>0)).length;
})()"""

def capture_viewport(target, width, height):
    chrome = rd.chrome_path(); port = rd.free_port()
    profile = tempfile.mkdtemp(prefix="vpd-")
    url = target if target.startswith(("http://","https://")) else \
        "file:///" + os.path.abspath(target).replace("\\","/")
    args = [chrome,"--headless=new","--disable-gpu","--hide-scrollbars","--no-first-run",
            "--no-default-browser-check","--disable-extensions","--force-device-scale-factor=1",
            "--remote-debugging-port=%d"%port,"--user-data-dir="+profile,
            "--window-size=%d,%d"%(width,height),url]
    proc = subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        if not rd.wait_debugger(port): raise SystemExit("Chrome debugger nie wstal")
        tabs=[t for t in rd.cdp_get(port,"/json") if t.get("type")=="page"]
        ws=rd.WS(tabs[0]["webSocketDebuggerUrl"])
        ws.call("Page.enable"); ws.call("Runtime.enable")
        ws.call("Emulation.setDeviceMetricsOverride",
                {"width":width,"height":height,"deviceScaleFactor":1,"mobile":width<700})
        time.sleep(2.0)
        r=ws.call("Runtime.evaluate",{"expression":FORCE_REVEAL,"awaitPromise":True,
                                      "returnByValue":True},timeout=30)
        broken=r.get("result",{}).get("value")
        time.sleep(0.5)
        shot=ws.call("Page.captureScreenshot",{"format":"png"},timeout=90)
        img=Image.open(__import__("io").BytesIO(base64.b64decode(shot["data"]))).convert("RGB")
        return img, broken
    finally:
        proc.terminate()
        try: proc.wait(timeout=5)
        except Exception: pass

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("target"); ap.add_argument("makieta")
    ap.add_argument("width",type=int); ap.add_argument("height",type=int)
    ap.add_argument("--out",default="."); ap.add_argument("--label",default="viewport")
    a=ap.parse_args()
    mock=Image.open(a.makieta).convert("RGB").resize((a.width,a.height),Image.LANCZOS)
    render,broken=capture_viewport(a.target,a.width,a.height)
    if render.size!=(a.width,a.height): render=render.crop((0,0,a.width,a.height))
    g1=np.array(mock.convert("L")); g2=np.array(render.convert("L"))
    score,diff=ssim(g1,g2,full=True)
    heat=((1.0-diff)*255).clip(0,255).astype(np.uint8)
    hm=Image.merge("RGB",[Image.fromarray(heat),
                          Image.fromarray(np.zeros_like(heat)),
                          Image.fromarray(np.zeros_like(heat))])
    hm=Image.blend(mock,hm,0.6)
    W,H=a.width,a.height; pad=8
    comp=Image.new("RGB",(W*3+pad*2,H+30),"#111")
    d=ImageDraw.Draw(comp)
    for i,(im,lab) in enumerate([(mock,"MAKIETA"),(render,"RENDER"),
                                 (hm,"HEATMAPA ssim=%.4f"%score)]):
        comp.paste(im,(i*(W+pad),30)); d.text((i*(W+pad)+6,8),lab,fill="#fff")
    os.makedirs(a.out,exist_ok=True)
    out=os.path.join(a.out,"%s-ssim%04d.png"%(a.label,round(score*10000)))
    comp.save(out)
    print("SSIM: %.4f"%score)
    print("BROKEN-IMGS:",broken)
    print("COMPOSITE:",out)

if __name__=="__main__":
    main()

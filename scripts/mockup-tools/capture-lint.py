# -*- coding: utf-8 -*-
"""
capture-lint.py <plik.html> <outdir>
Przechwytuje zrzuty do PASS 1/2/3 FINALNEGO PASSU:
  - full-1280.png, full-390.png (cala strona, force-reveal, eager img)
  - crop sekcji hi-res: hero/demo/social/zamow (1280)
  - blur.png (gaussian) + placeholdified.png (bloki koloru) z full-1280 do PASS 2 squint
Reuzywa CDP klienta z detail-lint.
"""
import sys, os, time, subprocess, socket, base64, tempfile, shutil, json, urllib.request
from PIL import Image, ImageFilter, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib.util
spec=importlib.util.spec_from_file_location("dl", os.path.join(os.path.dirname(os.path.abspath(__file__)),"detail-lint.py"))
dl=importlib.util.module_from_spec(spec); spec.loader.exec_module(dl)

def capture(target,width,height,outdir,tag,crops=None):
    chrome=dl.chrome_path(); port=dl.free_port(); profile=tempfile.mkdtemp(prefix="cap-")
    url="file:///"+os.path.abspath(target).replace("\\","/")
    args=[chrome,"--headless=new","--disable-gpu","--hide-scrollbars","--no-first-run",
          "--no-default-browser-check","--disable-extensions","--force-device-scale-factor=1",
          "--remote-debugging-port=%d"%port,"--user-data-dir="+profile,"--window-size=%d,%d"%(width,height),url]
    proc=subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    saved={}
    try:
        if not dl.wait_debugger(port): raise SystemExit("debugger nie wstal")
        tabs=[t for t in dl.cdp_get(port,"/json") if t.get("type")=="page"]
        ws=dl.WS(tabs[0]["webSocketDebuggerUrl"])
        ws.call("Page.enable"); ws.call("Runtime.enable")
        ws.call("Emulation.setDeviceMetricsOverride",{"width":width,"height":height,"deviceScaleFactor":1,"mobile":width<700})
        time.sleep(2.4)
        # force reveal + eager all imgs + wait natural
        ws.call("Runtime.evaluate",{"expression":"document.documentElement.classList.add('anim');document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('in')});document.querySelectorAll('img').forEach(function(i){i.loading='eager'});window.scrollTo(0,document.body.scrollHeight);"})
        time.sleep(2.0)
        ws.call("Runtime.evaluate",{"expression":"window.scrollTo(0,0);"})
        time.sleep(0.8)
        # full page
        metrics=ws.call("Page.getLayoutMetrics")
        ch=metrics["cssContentSize"]; full_h=int(ch["height"])
        shot=ws.call("Page.captureScreenshot",{"format":"png","captureBeyondViewport":True,
              "clip":{"x":0,"y":0,"width":width,"height":min(full_h,20000),"scale":1}},timeout=120)
        p=os.path.join(outdir,"full-%s.png"%tag)
        open(p,"wb").write(base64.b64decode(shot["data"])); saved["full"]=p
        # crops by selector
        if crops:
            for name,sel in crops.items():
                expr=("(function(){var e=document.querySelector(%s);if(!e)return null;var r=e.getBoundingClientRect();"
                      "return JSON.stringify({x:r.x+scrollX,y:r.y+scrollY,w:r.width,h:r.height});})()"%json.dumps(sel))
                res=ws.call("Runtime.evaluate",{"expression":expr,"returnByValue":True})
                v=res.get("result",{}).get("value")
                if not v: continue
                b=json.loads(v)
                clip={"x":round(b["x"]),"y":round(b["y"]),"width":round(b["w"]),"height":round(min(b["h"],7000)),"scale":1}
                sh=ws.call("Page.captureScreenshot",{"format":"png","clip":clip,"captureBeyondViewport":True},timeout=90)
                cp=os.path.join(outdir,"crop-%s-%s.png"%(name,tag))
                open(cp,"wb").write(base64.b64decode(sh["data"])); saved[name]=cp
        return saved
    finally:
        proc.terminate()
        try: proc.wait(timeout=5)
        except Exception: proc.kill()
        shutil.rmtree(profile,ignore_errors=True)

def make_blur(full_png,outdir):
    im=Image.open(full_png).convert("RGB")
    # scale down for manageable size then blur
    W=520; H=int(im.height*W/im.width)
    small=im.resize((W,H), Image.LANCZOS)
    blur=small.filter(ImageFilter.GaussianBlur(radius=5))
    bp=os.path.join(outdir,"blur.jpg"); blur.save(bp,"JPEG",quality=70)
    # placeholdified: heavy pixelate to kill text detail, keep color blocks/hierarchy
    px=small.resize((W//14,H//14), Image.BILINEAR).resize((W,H), Image.NEAREST)
    pp=os.path.join(outdir,"placeholdified.jpg"); px.save(pp,"JPEG",quality=72)
    return bp,pp

def main():
    target=sys.argv[1]; outdir=sys.argv[2]; os.makedirs(outdir,exist_ok=True)
    crops={"hero":"#hero","demo":"#sim","social":"#social","zamow":"#zamow .offer-card","porownanie":"#porownanie"}
    d=capture(target,1280,900,outdir,"1280",crops)
    m=capture(target,390,844,outdir,"390",{"herom":"#hero","zamowm":"#zamow","socialm":"#social"})
    bp,pp=make_blur(d["full"],outdir)
    print("SAVED:",json.dumps({**d,**{"m_"+k:v for k,v in m.items()},"blur":bp,"placeholdified":pp},ensure_ascii=False))

if __name__=="__main__":
    main()

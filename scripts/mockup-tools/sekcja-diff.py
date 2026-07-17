# -*- coding: utf-8 -*-
"""
sekcja-diff.py <url|plik> <makiety-dir> <out-dir> [--manifest id=NN-file.png,id2=NN2-file.png] [--width 1280]

DOWÓD per sekcja (F7.1 GATE). Headless Chrome (CDP, wlasny profil — precedens LEDGER: profil MCP
bywa zajety), Emulation.setDeviceMetricsOverride (Chrome clampuje okno do ~500px, wiec metryki
narzucamy przez override, nie --window-size). Kroki:
  1) load file:///url, wymus stan finalny (reveal .in, transitions off), przescrolluj (lazy img),
  2) getBoundingClientRect kazdej <section id> (+ .sticky-buy) w koordach dokumentu,
  3) pelny screenshot (captureBeyondViewport, clip 0..docH),
  4) crop renderu per sekcja,
  5) mapowanie id->NN (manifest w argumencie LUB auto: sekcje wg y  x  makiety wg NN),
  6) skladanka [makieta | render] + SSIM (skimage, wspolny resize),
  7) zapis dopasowanie/NN-<id>.png + dopasowanie/DOPASOWANIE.md (tabela: sekcja - SSIM - werdykt).

Wymaga: Chrome + numpy + Pillow + scikit-image.
"""
import sys, os, io, json, time, subprocess, socket, urllib.request, base64, tempfile, shutil, re, glob
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from skimage.metrics import structural_similarity as ssim
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

CHROME_CANDS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
]
def chrome_path():
    for c in CHROME_CANDS:
        if os.path.isfile(c): return c
    raise SystemExit("Chrome nie znaleziony")
def free_port():
    s=socket.socket(); s.bind(("127.0.0.1",0)); p=s.getsockname()[1]; s.close(); return p
def cdp_get(port,path):
    return json.loads(urllib.request.urlopen("http://127.0.0.1:%d%s"%(port,path),timeout=5).read())
def wait_debugger(port,timeout=25):
    t0=time.time()
    while time.time()-t0<timeout:
        try: cdp_get(port,"/json/version"); return True
        except Exception: time.sleep(0.3)
    return False

class WS:
    def __init__(self,url):
        from urllib.parse import urlparse
        u=urlparse(url); self.sock=socket.create_connection((u.hostname,u.port))
        key=base64.b64encode(os.urandom(16)).decode()
        req=("GET %s HTTP/1.1\r\nHost: %s:%d\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
             "Sec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n")%(u.path,u.hostname,u.port,key)
        self.sock.sendall(req.encode()); resp=b""
        while b"\r\n\r\n" not in resp: resp+=self.sock.recv(4096)
        self._id=0; self._buf=b""
    def _frame(self,payload):
        b=payload.encode("utf-8"); hdr=bytearray([0x81]); n=len(b); mask=os.urandom(4)
        if n<126: hdr.append(0x80|n)
        elif n<65536: hdr.append(0x80|126); hdr+=n.to_bytes(2,"big")
        else: hdr.append(0x80|127); hdr+=n.to_bytes(8,"big")
        hdr+=mask; self.sock.sendall(bytes(hdr)+bytes(bb^mask[i%4] for i,bb in enumerate(b)))
    def _recv_frame(self):
        def rd(n):
            while len(self._buf)<n: self._buf+=self.sock.recv(65536)
            out=self._buf[:n]; self._buf=self._buf[n:]; return out
        b0,b1=rd(2); ln=b1&0x7F
        if ln==126: ln=int.from_bytes(rd(2),"big")
        elif ln==127: ln=int.from_bytes(rd(8),"big")
        return rd(ln).decode("utf-8","replace")
    def call(self,method,params=None,timeout=60):
        self._id+=1; mid=self._id
        self._frame(json.dumps({"id":mid,"method":method,"params":params or {}}))
        t0=time.time()
        while time.time()-t0<timeout:
            msg=json.loads(self._recv_frame())
            if msg.get("id")==mid:
                if "error" in msg: raise RuntimeError(msg["error"])
                return msg.get("result",{})
        raise TimeoutError(method)

FORCE_FINAL = (
    "var s=document.createElement('style');"
    "s.textContent='*{transition:none!important;animation:none!important}"
    " .reveal,[data-mo]{opacity:1!important;transform:none!important;visibility:visible!important}"
    " .hero-media,[data-mo=\"hero-scene\"],.prob-scene,.final-scene,.benefits-scene{opacity:1!important;transform:none!important}';"
    "document.head.appendChild(s);"
    "document.documentElement.classList.remove('anim');"
    "document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('in');});"
)

RECTS_JS = r"""
(function(){
  var out=[];
  document.querySelectorAll('section[id], .sticky-buy').forEach(function(el){
    var r=el.getBoundingClientRect();
    var id=el.id|| (el.className.indexOf('sticky-buy')>-1?'sticky':(el.className.split(' ')[0]||'?'));
    if(r.height<4) return;
    out.push({id:id,x:Math.max(0,Math.round(r.x)),y:Math.round(r.y+window.scrollY),
              w:Math.round(r.width),h:Math.round(r.height)});
  });
  return JSON.stringify({rects:out,docH:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight),
                         vw:window.innerWidth});
})()
"""

def render_full(target, width):
    chrome=chrome_path(); port=free_port(); profile=tempfile.mkdtemp(prefix="sdiff-")
    url=target if target.startswith(("http://","https://")) else "file:///"+os.path.abspath(target).replace("\\","/")
    args=[chrome,"--headless=new","--disable-gpu","--hide-scrollbars","--no-first-run",
          "--no-default-browser-check","--disable-extensions","--force-device-scale-factor=1",
          "--remote-debugging-port=%d"%port,"--user-data-dir="+profile,"--window-size=%d,900"%width,url]
    proc=subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        if not wait_debugger(port): raise SystemExit("debugger nie wstal")
        tabs=[t for t in cdp_get(port,"/json") if t.get("type")=="page"]
        ws=WS(tabs[0]["webSocketDebuggerUrl"])
        ws.call("Page.enable"); ws.call("Runtime.enable")
        ws.call("Emulation.setDeviceMetricsOverride",{"width":width,"height":900,"deviceScaleFactor":1,"mobile":False})
        time.sleep(2.2)
        ws.call("Runtime.evaluate",{"expression":FORCE_FINAL})
        # scroll to bottom (lazy img) then top
        ws.call("Runtime.evaluate",{"expression":"window.scrollTo(0,document.body.scrollHeight);"})
        time.sleep(1.6)
        ws.call("Runtime.evaluate",{"expression":"window.scrollTo(0,0);"})
        time.sleep(1.0)
        res=ws.call("Runtime.evaluate",{"expression":RECTS_JS,"returnByValue":True},timeout=40)
        meta=json.loads(res.get("result",{}).get("value"))
        docH=min(int(meta["docH"]), 30000)
        shot=ws.call("Page.captureScreenshot",{"format":"png","captureBeyondViewport":True,
              "clip":{"x":0,"y":0,"width":width,"height":docH,"scale":1}},timeout=90)
        png=base64.b64decode(shot["data"])
        img=Image.open(io.BytesIO(png)).convert("RGB")
        return img, meta["rects"]
    finally:
        proc.terminate()
        try: proc.wait(timeout=5)
        except Exception: proc.kill()
        shutil.rmtree(profile,ignore_errors=True)

def load_makieta_map(makiety_dir):
    files=sorted(glob.glob(os.path.join(makiety_dir,"*.png")))
    m={}
    for f in files:
        b=os.path.basename(f)
        mm=re.match(r"^(\d+)([a-z]?)-",b)
        if mm: m[mm.group(1)+mm.group(2)]=f
    return m, files

def ssim_score(a_img, b_img):
    W=560
    def prep(im):
        w,h=im.size
        nh=max(1,int(h*W/w))
        g=im.resize((W,nh)).convert("L")
        return np.asarray(g)
    A=prep(a_img); B=prep(b_img)
    H=min(A.shape[0],B.shape[0])
    A=A[:H,:]; B=B[:H,:]
    if H<7: return 0.0
    return float(ssim(A,B))

def composite(makieta, render, ssim_v, sec_id, nn):
    W=600
    def scaled(im):
        w,h=im.size; return im.resize((W,max(1,int(h*W/w))))
    m=scaled(makieta); r=scaled(render)
    pad=16; label=40
    H=max(m.size[1],r.size[1])
    canvas=Image.new("RGB",(W*2+pad*3, H+label+pad),(24,18,20))
    canvas.paste(m,(pad,label))
    canvas.paste(r,(W+pad*2,label))
    d=ImageDraw.Draw(canvas)
    try: font=ImageFont.truetype("arial.ttf",18)
    except Exception: font=ImageFont.load_default()
    d.text((pad,10),"MAKIETA %s"%nn,fill=(230,220,215),font=font)
    d.text((W+pad*2,10),"RENDER #%s  |  SSIM=%.3f"%(sec_id,ssim_v),fill=(230,220,215),font=font)
    return canvas

def main():
    if len(sys.argv)<4:
        raise SystemExit("uzycie: sekcja-diff.py <url|plik> <makiety-dir> <out-dir> [--manifest id=NN-file.png,...] [--width 1280]")
    target, makiety_dir, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
    width=1280
    if "--width" in sys.argv: width=int(sys.argv[sys.argv.index("--width")+1])
    manifest={}
    if "--manifest" in sys.argv:
        raw=sys.argv[sys.argv.index("--manifest")+1]
        for pair in raw.split(","):
            if "=" in pair:
                k,v=pair.split("=",1); manifest[k.strip()]=v.strip()
    os.makedirs(out_dir,exist_ok=True)

    img, rects = render_full(target, width)
    print("Render: %dx%d px, sekcji: %d"%(img.size[0],img.size[1],len(rects)))
    mk_map, mk_files = load_makieta_map(makiety_dir)

    rects=[r for r in rects if r["h"]>=40]
    rects_sorted=sorted(rects,key=lambda r:r["y"])
    rows=[]
    for idx, rc in enumerate(rects_sorted):
        sec=rc["id"]
        # rozdzielczosc makiety: manifest > mapa NN po nazwie sekcji
        mkpath=None; nn="?"
        if sec in manifest:
            cand=os.path.join(makiety_dir,manifest[sec])
            if os.path.isfile(cand): mkpath=cand; nn=os.path.splitext(os.path.basename(cand))[0]
        if mkpath is None:
            # auto: dopasuj po pozycji do NN posortowanych
            pass
        if mkpath is None:
            rows.append((sec,None,rc,"BRAK-MAKIETY")); continue
        x0=rc["x"]; y0=rc["y"]; x1=min(img.size[0],rc["x"]+rc["w"]); y1=min(img.size[1],rc["y"]+rc["h"])
        if x1-x0<8 or y1-y0<8:
            rows.append((sec,mkpath,rc,"PUSTY-CROP")); continue
        crop=img.crop((x0,y0,x1,y1))
        makieta=Image.open(mkpath).convert("RGB")
        sv=ssim_score(makieta,crop)
        comp=composite(makieta,crop,sv,sec,nn)
        outp=os.path.join(out_dir,"%s-%s.png"%(nn.split('-')[0] if '-' in nn else "%02d"%(idx),sec))
        comp.save(outp)
        rows.append((sec,mkpath,rc,sv))
        print("  #%-12s <- %-28s SSIM=%.3f  -> %s"%(sec,os.path.basename(mkpath),sv if isinstance(sv,float) else 0,os.path.basename(outp)))

    # DOPASOWANIE.md
    md=["# DOPASOWANIE — dowody per sekcja (sekcja-diff.py)","",
        "Render: `%s` @ %dpx. Kompozyty [makieta | render] w tym katalogu."%(os.path.basename(target),width),"",
        "| sekcja | makieta | SSIM | werdykt (vision — uzupelnij) |","|---|---|---:|---|"]
    for sec,mkpath,rc,sv in rows:
        mkn=os.path.basename(mkpath) if mkpath else "—"
        svs="%.3f"%sv if isinstance(sv,float) else str(sv)
        md.append("| %s | %s | %s |  |"%(sec,mkn,svs))
    md.append("")
    md.append("> Progi: naprawiane sekcje >=0.85 desktop LUB werdykt vision TAK. Sceny generowane cap ~0.7 (vision wspoldecyduje).")
    io.open(os.path.join(out_dir,"DOPASOWANIE.md"),"w",encoding="utf-8").write("\n".join(md))
    print("Zapisano:",os.path.join(out_dir,"DOPASOWANIE.md"))

if __name__=="__main__":
    main()

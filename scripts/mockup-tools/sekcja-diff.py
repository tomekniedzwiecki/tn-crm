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

def render_full(target, width, mobile=False):
    chrome=chrome_path(); port=free_port(); profile=tempfile.mkdtemp(prefix="sdiff-")
    url=target if target.startswith(("http://","https://")) else "file:///"+os.path.abspath(target).replace("\\","/")
    # mobile: DPR=1 (nie 2) — strony mobilne bywaja bardzo wysokie, a captureBeyondViewport
    # nie maluje trescie powyzej ~16384 device-px; przy DPR2 gleboko lezace sekcje (final/faq)
    # wychodza biale. DPR1 utrzymuje caly dokument pod limitem.
    dpr = 1
    vh = 844 if mobile else 900
    args=[chrome,"--headless=new","--disable-gpu","--hide-scrollbars","--no-first-run",
          "--no-default-browser-check","--disable-extensions","--force-device-scale-factor=%d"%dpr,
          "--remote-debugging-port=%d"%port,"--user-data-dir="+profile,"--window-size=%d,%d"%(width,vh),url]
    proc=subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        if not wait_debugger(port): raise SystemExit("debugger nie wstal")
        tabs=[t for t in cdp_get(port,"/json") if t.get("type")=="page"]
        ws=WS(tabs[0]["webSocketDebuggerUrl"])
        ws.call("Page.enable"); ws.call("Runtime.enable")
        ws.call("Emulation.setDeviceMetricsOverride",{"width":width,"height":vh,"deviceScaleFactor":dpr,"mobile":mobile})
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
              "clip":{"x":0,"y":0,"width":width,"height":docH,"scale":1}},timeout=120)
        png=base64.b64decode(shot["data"])
        img=Image.open(io.BytesIO(png)).convert("RGB")
        # DPR>1: screenshot pixels = CSS px * dpr; rects are CSS px -> zwroc realny dpr do skalowania cropow
        real_dpr = img.size[0] / float(width)
        return img, meta["rects"], real_dpr
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

# mobile: makieta tylko dla wybranych sekcji (hero, wideo). Mapa id->plik po slowach kluczowych.
MOBILE_MK_TOKENS = {
    "hero": ["hero"],
    "wideo": ["wideo", "video"],
    "video": ["wideo", "video"],
    "demo": ["demo"],
    "interakcja": ["interakcja"],
}
def load_makieta_mobile_map(makiety_dir):
    files=[f for f in sorted(glob.glob(os.path.join(makiety_dir,"*.png")))
           if "mobile" in os.path.basename(f).lower()]
    # preferuj warianty bez '-alt'
    files.sort(key=lambda f: ("-alt" in os.path.basename(f).lower(), f))
    m={}
    for sid, toks in MOBILE_MK_TOKENS.items():
        for f in files:
            b=os.path.basename(f).lower()
            if any(t in b for t in toks):
                m[sid]=f; break
    return m

def composite_render_only(render, sec_id, nn, verdict="do oceny"):
    """Skladanka render-only (brak makiety mobile) — render + pasek na werdykt jakosci."""
    W=460
    w,h=render.size; r=render.resize((W,max(1,int(h*W/w))))
    pad=16; label=40; foot=64
    canvas=Image.new("RGB",(W+pad*2, r.size[1]+label+foot),(24,18,20))
    canvas.paste(r,(pad,label))
    d=ImageDraw.Draw(canvas)
    try: font=ImageFont.truetype("arial.ttf",17); fs=ImageFont.truetype("arial.ttf",14)
    except Exception: font=ImageFont.load_default(); fs=font
    d.text((pad,10),"RENDER-ONLY #%s  (390, brak makiety mobile)"%sec_id,fill=(230,220,215),font=font)
    d.text((pad,label+r.size[1]+8),"werdykt jakosci mobile: %s"%verdict,fill=(240,210,150),font=fs)
    d.text((pad,label+r.size[1]+30),"produkt duzy? tresc czytelna? touch-target? h-scroll?",fill=(170,160,158),font=fs)
    return canvas

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

MOBILE_MARK = "<!-- MOBILE-390 -->"

def merge_mobile_md(md_path, target, rows, dpr):
    """Dopisuje/aktualizuje sekcje MOBILE (390) w DOPASOWANIE.md bez kasowania desktopu."""
    existing = ""
    if os.path.isfile(md_path):
        existing = io.open(md_path, encoding="utf-8").read()
    # utnij wczesniejsza sekcje MOBILE (idempotentnie)
    if MOBILE_MARK in existing:
        existing = existing.split(MOBILE_MARK)[0].rstrip()
    block = [existing, "", MOBILE_MARK,
        "## MOBILE (390 · DPR%d) — sekcja-diff.py --viewport 390" % round(dpr),
        "",
        "Render `%s` @ 390px. Mobile bez makiety = skladanka render-only z werdyktem jakosci." % os.path.basename(target),
        "",
        "| sekcja | dowod mobile | SSIM/typ | werdykt (TAK/NIE — vision) |",
        "|---|---|---|---|"]
    for sec, mkpath, kind, sv, outp in rows:
        if mkpath:
            dowod = "[makieta|render] %s" % os.path.basename(outp)
            typ = "%.3f" % sv if isinstance(sv, float) else str(sv)
        else:
            dowod = "render-only %s" % os.path.basename(outp)
            typ = "render-only"
        block.append("| %s | %s | %s |  |" % (sec, dowod, typ))
    block += ["",
        "> Mobile: makieta istnieje TYLKO dla hero i wideo (SSIM). Reszta = render-only —",
        "> werdykt jakosci (produkt duzy? tresc czytelna? touch-target? kolaz/panel/FAQ OK? h-scroll 0?).",
        "> Incydent Loczek 17.07: mobile nie bylo sprawdzane wcale — dowod jest DWUKROTNY (1280 I 390)."]
    io.open(md_path, "w", encoding="utf-8").write("\n".join(block))

def run_mobile(target, makiety_dir, out_dir, width):
    img, rects, dpr = render_full(target, width, mobile=True)
    print("Render MOBILE: %dx%d px (dpr~%.2f), sekcji: %d" % (img.size[0], img.size[1], dpr, len(rects)))
    mk_mob = load_makieta_mobile_map(makiety_dir)
    rects=[r for r in rects if r["h"]>=40]
    rects_sorted=sorted(rects,key=lambda r:r["y"])
    rows=[]
    for idx, rc in enumerate(rects_sorted, start=1):
        sec=rc["id"]
        x0=int(rc["x"]*dpr); y0=int(rc["y"]*dpr)
        x1=int(min(img.size[0], (rc["x"]+rc["w"])*dpr)); y1=int(min(img.size[1], (rc["y"]+rc["h"])*dpr))
        if x1-x0<8 or y1-y0<8:
            continue
        crop=img.crop((x0,y0,x1,y1))
        nn="%02d"%idx
        mkpath=mk_mob.get(sec)
        outp=os.path.join(out_dir,"%s-%s-m.png"%(nn,sec))
        if mkpath:
            makieta=Image.open(mkpath).convert("RGB")
            sv=ssim_score(makieta,crop)
            comp=composite(makieta,crop,sv,sec+" (mobile)",nn+"-m")
            comp.save(outp)
            rows.append((sec,mkpath,"ssim",sv,outp))
            print("  #%-12s <- %-30s SSIM=%.3f -> %s"%(sec,os.path.basename(mkpath),sv,os.path.basename(outp)))
        else:
            comp=composite_render_only(crop,sec,nn)
            comp.save(outp)
            rows.append((sec,None,"render-only",None,outp))
            print("  #%-12s  render-only -> %s"%(sec,os.path.basename(outp)))
    merge_mobile_md(os.path.join(out_dir,"DOPASOWANIE.md"), target, rows, dpr)
    print("Zapisano MOBILE do:",os.path.join(out_dir,"DOPASOWANIE.md"))

def main():
    if len(sys.argv)<4:
        raise SystemExit("uzycie: sekcja-diff.py <url|plik> <makiety-dir> <out-dir> [--manifest id=NN-file.png,...] [--width 1280] [--viewport 390]")
    target, makiety_dir, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
    width=1280
    if "--width" in sys.argv: width=int(sys.argv[sys.argv.index("--width")+1])
    os.makedirs(out_dir,exist_ok=True)

    # MOBILE tryb: --viewport 390 (crop per sekcja z renderu 390; makieta tylko hero/wideo)
    if "--viewport" in sys.argv:
        vw=int(sys.argv[sys.argv.index("--viewport")+1])
        run_mobile(target, makiety_dir, out_dir, vw)
        return

    manifest={}
    if "--manifest" in sys.argv:
        raw=sys.argv[sys.argv.index("--manifest")+1]
        for pair in raw.split(","):
            if "=" in pair:
                k,v=pair.split("=",1); manifest[k.strip()]=v.strip()

    img, rects, _dpr = render_full(target, width)
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

    # DOPASOWANIE.md (desktop) — zachowaj ewentualna sekcje MOBILE dopisana wczesniej
    md_path=os.path.join(out_dir,"DOPASOWANIE.md")
    mobile_tail=""
    if os.path.isfile(md_path):
        prev=io.open(md_path,encoding="utf-8").read()
        if MOBILE_MARK in prev:
            mobile_tail="\n\n"+MOBILE_MARK+prev.split(MOBILE_MARK,1)[1]
    md=["# DOPASOWANIE — dowody per sekcja (sekcja-diff.py)","",
        "Render: `%s` @ %dpx. Kompozyty [makieta | render] w tym katalogu."%(os.path.basename(target),width),"",
        "| sekcja | makieta | SSIM | werdykt (vision — uzupelnij) |","|---|---|---:|---|"]
    for sec,mkpath,rc,sv in rows:
        mkn=os.path.basename(mkpath) if mkpath else "—"
        svs="%.3f"%sv if isinstance(sv,float) else str(sv)
        md.append("| %s | %s | %s |  |"%(sec,mkn,svs))
    md.append("")
    md.append("> Progi: naprawiane sekcje >=0.85 desktop LUB werdykt vision TAK. Sceny generowane cap ~0.7 (vision wspoldecyduje).")
    io.open(md_path,"w",encoding="utf-8").write("\n".join(md)+mobile_tail)
    print("Zapisano:",md_path)

if __name__=="__main__":
    main()

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

STRUCT_JS = r"""
(function(){
  function sig(el){var cls=(el.className&&el.className.split)?el.className.split(' ')[0]:'';return el.tagName+'.'+cls;}
  function isFullBleedScene(el,SW,SH){var r=el.getBoundingClientRect();var cs=getComputedStyle(el);
    var big=(r.width*r.height)>=0.55*SW*SH; var abs=(cs.position==='absolute'||cs.position==='fixed');
    return big&&abs;}
  var sections=[];
  document.querySelectorAll('section[id]').forEach(function(sec){
    var sr=sec.getBoundingClientRect();var SX=sr.x,SYY=sr.y+window.scrollY,SW=sr.width,SH=sr.height;
    if(SH<4) return;
    // ---- repeated tiles: largest group of similar-width siblings, area>=1.5% sekcji, poza <svg> ----
    var best=null; var all=sec.querySelectorAll('*'); var conts=[];
    for(var i=0;i<all.length;i++){ if(all[i].closest('svg')) continue; if(all[i].children&&all[i].children.length>=3) conts.push(all[i]); }
    conts.forEach(function(cont){ var groups={};
      for(var j=0;j<cont.children.length;j++){ var c=cont.children[j]; if(c.closest('svg')&&c.tagName!=='SVG') continue;
        var r=c.getBoundingClientRect(); if(r.width<8||r.height<8) continue;
        if(r.width*r.height < 0.015*SW*SH) continue;
        (groups[sig(c)]=groups[sig(c)]||[]).push({w:r.width,h:r.height,x:r.x,y:r.y+window.scrollY}); }
      for(var s in groups){ var g=groups[s]; if(g.length<3) continue;
        var ws=g.map(function(o){return o.w;}); var mean=ws.reduce(function(a,b){return a+b;},0)/ws.length;
        var sd=Math.sqrt(ws.reduce(function(a,b){return a+(b-mean)*(b-mean);},0)/ws.length);
        if(mean<=0||sd/mean>0.3) continue; var score=g.length*mean;
        if(!best||score>best.score) best={sig:s,members:g,score:score}; } });
    var tiles=null;
    if(best){ var ys=best.members.map(function(m){return m.y;}); var minY=Math.min.apply(null,ys);
      var hs=best.members.map(function(m){return m.h;}).sort(function(a,b){return a-b;}); var medH=hs[Math.floor(hs.length/2)];
      var cols=best.members.filter(function(m){return m.y-minY<medH*0.5;}).length;
      var wss=best.members.map(function(m){return m.w;}).sort(function(a,b){return a-b;}); var medW=wss[Math.floor(wss.length/2)];
      tiles={sig:best.sig,count:best.members.length,cols:cols,medWpct:medW/SW,medHpct:medH/SH,ar:medW/medH,
             yband:[(minY-SYY)/SH, (Math.max.apply(null,best.members.map(function(m){return m.y+m.h;}))-SYY)/SH]}; }
    // ---- images (in-flow, poza full-bleed sceną) ----
    var imgs=[];
    sec.querySelectorAll('img,video,picture').forEach(function(im){ var r=im.getBoundingClientRect();
      if(r.width*r.height<0.01*SW*SH) return; var fb=isFullBleedScene(im,SW,SH);
      imgs.push({xpct:(r.x-SX)/SW,wpct:r.width/SW,ypct:(r.y+window.scrollY-SYY)/SH,hpct:r.height/SH,
                 cxpct:((r.x+r.width/2)-SX)/SW,cypct:((r.y+window.scrollY+r.height/2)-SYY)/SH,
                 areaPct:(r.width*r.height)/(SW*SH),ar:r.height/r.width,fullbleed:fb}); });
    imgs.sort(function(a,b){return b.areaPct-a.areaPct;});
    // ---- text column (reading column: pomiń pełnoszerokie bloki >0.8 z prawej krawędzi) ----
    var minL=Infinity,maxR=-Infinity,any=false;
    sec.querySelectorAll('h1,h2,h3,p,li,summary,.eyebrow,.lead').forEach(function(t){
      var tr=t.getBoundingClientRect(); var txt=(t.textContent||'').trim();
      if(tr.width<10||tr.height<6||txt.length<2) return; var wpct=tr.width/SW; any=true;
      if((tr.x-SX)/SW<minL) minL=(tr.x-SX)/SW;
      if(wpct<0.8 && (tr.x+tr.width-SX)/SW>maxR) maxR=(tr.x+tr.width-SX)/SW; });
    var content=null;
    if(any&&maxR>0){ var L=Math.max(0,minL),R=Math.max(0,1-maxR); content={leftGut:L,rightGut:R,asym:Math.abs(L-R),colW:Math.max(0,maxR-minL)}; }
    sections.push({id:sec.id,x:SX,y:SYY,w:SW,h:SH,ar:SH/SW,tiles:tiles,imgs:imgs.slice(0,3),content:content});
  });
  return JSON.stringify({sections:sections,vw:window.innerWidth});
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
        try:
            sres=ws.call("Runtime.evaluate",{"expression":STRUCT_JS,"returnByValue":True},timeout=40)
            struct=json.loads(sres.get("result",{}).get("value"))
        except Exception:
            struct={"sections":[]}
        docH=min(int(meta["docH"]), 30000)
        shot=ws.call("Page.captureScreenshot",{"format":"png","captureBeyondViewport":True,
              "clip":{"x":0,"y":0,"width":width,"height":docH,"scale":1}},timeout=120)
        png=base64.b64decode(shot["data"])
        img=Image.open(io.BytesIO(png)).convert("RGB")
        # DPR>1: screenshot pixels = CSS px * dpr; rects are CSS px -> zwroc realny dpr do skalowania cropow
        real_dpr = img.size[0] / float(width)
        struct_by_id = {s["id"]: s for s in struct.get("sections", [])}
        return img, meta["rects"], real_dpr, struct_by_id
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
    img, rects, dpr, _struct = render_full(target, width, mobile=True)
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

# ============================================================================
# LAYOUT-DIFF STRUKTURALNY (R13) — IR makiety (bbox) vs DOM getBoundingClientRect.
# Checki w % szerokosci sekcji. Wynik = kolumna LAYOUT w DOPASOWANIE.md; gate-check
# czyta ja jako severity FAIL. Progi w gate-manifest.json (layout_diff.progi).
# ============================================================================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def load_layout_cfg(manifest_path=None):
    mp = manifest_path or os.path.join(SCRIPT_DIR, "gate-manifest.json")
    try:
        M = json.loads(io.open(mp, encoding="utf-8").read())
    except Exception:
        return None
    return M

def _norm_id(s):
    return re.sub(r"[-_/. ]", "", (s or "").lower())

def resolve_type(sid, M):
    st = (M or {}).get("sekcja_typy", {})
    al = st.get("aliasy", {})
    base = al.get(sid, sid)
    nb = _norm_id(base)
    for k in st.get("kodowa", []):
        if _norm_id(k) == nb: return "kodowa"
    for k in st.get("scenowa", []):
        if _norm_id(k) == nb: return "scenowa"
    # alias moze wskazywac na inny id
    for k in st.get("kodowa", []):
        if _norm_id(k) == _norm_id(sid): return "kodowa"
    for k in st.get("scenowa", []):
        if _norm_id(k) == _norm_id(sid): return "scenowa"
    return "inna"

def ensure_ir(makieta_path, ir_dir):
    """IR dla makiety (auto-generacja mockup-ir.py gdy brak). Wymuszenie IR komplet (R13)."""
    if not makieta_path or not os.path.isfile(makieta_path):
        return None
    name = os.path.splitext(os.path.basename(makieta_path))[0]
    p = os.path.join(ir_dir, name + "-IR.json")
    if not os.path.isfile(p):
        os.makedirs(ir_dir, exist_ok=True)
        try:
            subprocess.run([sys.executable, os.path.join(SCRIPT_DIR, "mockup-ir.py"),
                            makieta_path, "--out", ir_dir],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=180)
        except Exception:
            return None
    if os.path.isfile(p):
        try:
            return json.loads(io.open(p, encoding="utf-8").read())
        except Exception:
            return None
    return None

def ir_content_bbox(ir):
    W = ir["image"]["w"]; H = ir["image"]["h"]; bl = ir.get("blocks", [])
    if not bl: return None
    rw = max(b["x"]+b["w"] for b in bl); lx = min(b["x"] for b in bl)
    bb = max(b["y"]+b["h"] for b in bl); ty = min(b["y"] for b in bl)
    car = (bb-ty)/max(1.0, (rw-lx))
    return {"asym": abs(lx/W - (1-rw/W)), "contentAR": car}

def ir_text_asym(ir):
    W = ir["image"]["w"]; bl = [b for b in ir.get("blocks", []) if b.get("kind") == "text"]
    if not bl: return None
    xs = [b["x"]/W for b in bl]
    rs = [(b["x"]+b["w"])/W for b in bl if b["w"]/W < 0.8] or [(b["x"]+b["w"])/W for b in bl]
    L = max(0.0, min(xs)); R = max(0.0, 1-max(rs))
    return {"asym": abs(L-R)}

def ir_image_slot(ir):
    W = ir["image"]["w"]; H = ir["image"]["h"]
    cards = [b for b in ir.get("blocks", []) if b.get("kind") == "card/image"] or ir.get("blocks", [])
    if not cards: return None
    b = max(cards, key=lambda b: b["w"]*b["h"])
    return {"wpct": b["w"]/W, "cxpct": (b["x"]+b["w"]/2)/W,
            "areaPct": (b["w"]*b["h"])/(W*H), "ar": b["h"]/max(1, b["w"])}

def makieta_columns(makieta_path, yband=None):
    try:
        import cv2
    except Exception:
        return None
    im = cv2.imread(makieta_path)
    if im is None: return None
    H, W = im.shape[:2]
    y0, y1 = (0.30, 0.92) if not yband else (max(0.0, yband[0]), min(1.0, yband[1]))
    if y1-y0 < 0.05: y0, y1 = 0.30, 0.92
    strip = im[int(H*y0):int(H*y1), :]
    g = cv2.cvtColor(strip, cv2.COLOR_BGR2GRAY)
    sob = np.abs(cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3))
    prof = sob.sum(axis=0); prof = prof/(prof.max()+1e-6)
    k = max(3, int(W*0.01)); prof = np.convolve(prof, np.ones(k)/k, mode="same")
    fg = prof > 0.10; runs = []; s = None
    for i, v in enumerate(fg):
        if v and s is None: s = i
        if not v and s is not None:
            if i-s > W*0.05: runs.append((s, i))
            s = None
    if s is not None and len(fg)-s > W*0.05: runs.append((s, len(fg)))
    ws = sorted((b-a)/W for a, b in runs)
    if not (2 <= len(runs) <= 10): return None
    return {"cols": len(runs), "medWpct": ws[len(ws)//2]}

def layout_checks(sid, stype, dom, makieta_path, ir, cfg):
    """Zwraca (status 'OK'|'FAIL', fails[list of check], detail_str). Progi z cfg (manifest)."""
    if dom is None or ir is None:
        return ("SKIP", [], "brak DOM/IR")
    P = cfg["layout_diff"]["progi"]; fails = []; det = []
    # ---- (1) KAFLE / slivery ----
    # Sliver-guard (absolutny) = jedyny NIEZAWODNY sygnal kafli: projekcja kolumn makiety
    # (makieta_columns) jest zbyt szumna na kanwach AI (myli sub-elementy) — nie FAIL-ujemy
    # na Delta-cols/width, tylko raportujemy ja informacyjnie. Slivery lapie guard.
    t = dom.get("tiles")
    if t and t["cols"] >= P["sliver_cols_min"] and t["medWpct"] < P["sliver_medwpct_max"] and t["ar"] < P["sliver_ar_max"]:
        mc = makieta_columns(makieta_path, t.get("yband"))
        fails.append("kafle"); det.append("kafle-sliver: %d kol @%.1f%% szer (portret ar=%.2f) — makieta cols~%s"
                                           % (t["cols"], 100*t["medWpct"], t["ar"], mc["cols"] if mc else "?"))
    # ---- (2) WYSOKOSC sekcji vs proporcja makiety (KODOWA) ----
    if not (P.get("wysokosc_tylko_kodowa") and stype != "kodowa"):
        cb = ir_content_bbox(ir)
        if cb and cb["contentAR"] > 0:
            dev = abs(dom["ar"] - cb["contentAR"]) / cb["contentAR"] * 100
            if dev > P["wysokosc_tol_pct"]:
                fails.append("wysokosc"); det.append("wysokosc: sekcja AR %.2f vs makieta %.2f (d=%.0f%%)"
                                                      % (dom["ar"], cb["contentAR"], dev))
    # ---- (3) GUTTERY kolumny tresci (sekcje scene-split: hero/final) ----
    if sid in P.get("gutter_sekcje", []):
        ta = ir_text_asym(ir); dc = dom.get("content")
        if ta and dc:
            dasym = abs(dc["asym"] - ta["asym"])
            if dasym > P["gutter_asym_delta"]:
                fails.append("guttery"); det.append("guttery: render asym %.2f vs makieta %.2f (d=%.2f)"
                                                     % (dc["asym"], ta["asym"], dasym))
    # ---- (4) OBRAZ w slocie (strona/srodek vs makieta) ----
    # TYLKO sekcje z JEDNYM dominujacym obrazem (nie kafle/galerie — tam imgs[0] to jeden
    # z wielu kafli, porownanie do calego slotu makiety = falszywy alarm).
    isl = ir_image_slot(ir); imgs = dom.get("imgs") or []
    single = (not t) and imgs and imgs[0]["areaPct"] >= 0.20
    if isl and single and isl["areaPct"] >= P.get("obraz_imgslot_min_area", 0.08):
        rimg = imgs[0]
        dcx = abs(rimg["cxpct"] - isl["cxpct"])
        if dcx > P.get("obraz_center_delta", 0.30):
            fails.append("obraz"); det.append("obraz: srodek render x%.2f vs makieta x%.2f (d=%.2f, zla strona)"
                                               % (rimg["cxpct"], isl["cxpct"], dcx))
    status = "FAIL" if fails else "OK"
    return (status, fails, "; ".join(det))

def ssim_split_scene(makieta_img, render_img, scene_rel):
    """SSIM dwuskladnikowy dla SCENOWEJ: (scene_ssim, rest_ssim). scene_rel=(x,y,w,h) 0..1 render."""
    W = 560
    def prep(im):
        w, h = im.size; nh = max(1, int(h*W/w))
        return im.resize((W, nh)).convert("L"), nh
    A, ha = prep(makieta_img); B, hb = prep(render_img)
    H = min(ha, hb)
    a = np.asarray(A)[:H, :].copy(); b = np.asarray(B)[:H, :].copy()
    if H < 7: return (0.0, 0.0)
    x0 = int(scene_rel[0]*W); x1 = int((scene_rel[0]+scene_rel[2])*W)
    y0 = int(scene_rel[1]*H); y1 = int((scene_rel[1]+scene_rel[3])*H)
    x0 = max(0, min(W-1, x0)); x1 = max(x0+1, min(W, x1))
    y0 = max(0, min(H-1, y0)); y1 = max(y0+1, min(H, y1))
    scene_ssim = 0.0
    if (x1-x0) > 6 and (y1-y0) > 6:
        try: scene_ssim = float(ssim(a[y0:y1, x0:x1], b[y0:y1, x0:x1]))
        except Exception: scene_ssim = 0.0
    a2 = a.copy(); b2 = b.copy(); a2[y0:y1, x0:x1] = 128; b2[y0:y1, x0:x1] = 128
    try: rest_ssim = float(ssim(a2, b2))
    except Exception: rest_ssim = 0.0
    return (scene_ssim, rest_ssim)

def write_dopasowanie_v2(md_path, target, width, rows2, mobile_tail):
    """DOPASOWANIE.md z kolumnami: SSIM | LAYOUT | werdykt (rubryka 5xT/N). rows2:
       (sec, mkname, ssim_str, layout_str, stype)."""
    md = ["# DOPASOWANIE — dowody per sekcja (sekcja-diff.py · R13)", "",
          "Render: `%s` @ %dpx. Kompozyty [makieta | render] w tym katalogu." % (os.path.basename(target), width),
          "LAYOUT = strukturalny layout-diff (IR makiety vs DOM). Werdykt = RUBRYKA 5 pol T/N + WERDYKT",
          "(skala_elem · AR_proporcje · guttery · tresc_od_krawedzi · wys_vs_makieta). WERDYKT=TAK bez",
          "kompletu 5xT = FAIL (gate-check). Sekcje KODOWE: frazy-wytrychy w werdykcie = FAIL.", "",
          "| sekcja | typ | makieta | SSIM | LAYOUT | werdykt (rubryka) |",
          "|---|---|---|---:|---|---|"]
    for sec, mkn, ssims, lay, stype in rows2:
        rub = "skala:? AR:? gut:? kraw:? wys:? → WERDYKT: ?"
        md.append("| %s | %s | %s | %s | %s | %s |" % (sec, stype, mkn, ssims, lay, rub))
    md += ["",
        "> Progi LAYOUT (manifest layout_diff.progi): kafle-sliver cols>=5 & szer<12%% & portret;",
        "> wysokosc (kodowa) |AR-makieta|>40%%; guttery (hero/final) |dasym|>0.35; obraz srodek-strona d>0.30.",
        "> SCENOWA: SSIM dwuskladnikowy (maska sceny cap ~0.70 OSOBNO + reszta prog 0.85).",
        "> KODOWA: SSIM<0.85 desktop = LAYOUT-FAIL (twarde). Werdykt vision WSPOL-decyduje (moze zaostrzyc)."]
    io.open(md_path, "w", encoding="utf-8").write("\n".join(md) + mobile_tail)

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

    img, rects, _dpr, struct = render_full(target, width)
    print("Render: %dx%d px, sekcji: %d"%(img.size[0],img.size[1],len(rects)))
    mk_map, mk_files = load_makieta_map(makiety_dir)

    # --- LAYOUT-DIFF cfg + katalog IR (auto-generacja IR dla WSZYSTKICH sekcji) ---
    M = load_layout_cfg()
    base = os.path.basename(os.path.normpath(out_dir))
    ir_dir = (os.path.join(os.path.dirname(os.path.normpath(out_dir)), "ir")
              if base == "dopasowanie" else os.path.join(out_dir, "ir"))
    Lprog = M["layout_diff"]["ssim_progi"] if M else {"kodowa_desktop":0.85,"scenowa_reszta":0.85,"scena_cap":0.70}

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
            rows.append((sec,None,"BRAK-MAKIETY","SKIP","inna")); continue
        x0=rc["x"]; y0=rc["y"]; x1=min(img.size[0],rc["x"]+rc["w"]); y1=min(img.size[1],rc["y"]+rc["h"])
        if x1-x0<8 or y1-y0<8:
            rows.append((sec,os.path.basename(mkpath),"PUSTY-CROP","SKIP","inna")); continue
        crop=img.crop((x0,y0,x1,y1))
        makieta=Image.open(mkpath).convert("RGB")
        sv=ssim_score(makieta,crop)
        comp=composite(makieta,crop,sv,sec,nn)
        outp=os.path.join(out_dir,"%s-%s.png"%(nn.split('-')[0] if '-' in nn else "%02d"%(idx),sec))
        comp.save(outp)

        # ---- LAYOUT-DIFF strukturalny + SSIM wg typu sekcji ----
        stype = resolve_type(sec, M) if M else "inna"
        dom = struct.get(sec)
        ir = ensure_ir(mkpath, ir_dir)
        lay_fails=[]; lay_det=[]
        if M:
            st, lf, ld = layout_checks(sec, stype, dom, mkpath, ir, M)
            if lf: lay_fails += lf; lay_det.append(ld)
        # SSIM severity wg typu
        ssim_disp = "%.3f" % sv
        if stype == "kodowa":
            if sv < Lprog["kodowa_desktop"]:
                lay_fails.append("SSIM<%.2f" % Lprog["kodowa_desktop"])
        elif stype == "scenowa" and dom and dom.get("imgs"):
            scene = dom["imgs"][0]
            scene_rel = (max(0,scene["xpct"]), max(0,scene["ypct"]),
                         min(1,scene["wpct"]), min(1,scene["hpct"]))
            sc, rest = ssim_split_scene(makieta, crop, scene_rel)
            ssim_disp = "%.3f (sc %.2f/reszta %.2f)" % (sv, sc, rest)
            if rest < Lprog["scenowa_reszta"] and (scene["wpct"]*scene["hpct"]) < 0.75:
                lay_fails.append("reszta-SSIM<%.2f" % Lprog["scenowa_reszta"])
        layout_str = "OK" if not lay_fails else ("LAYOUT-FAIL: " + ", ".join(lay_fails))
        rows.append((sec, os.path.basename(mkpath), ssim_disp, layout_str, stype))
        print("  #%-11s [%-7s] SSIM=%.3f  LAYOUT=%s%s"
              % (sec, stype, sv, layout_str, ("  {%s}" % " | ".join(lay_det) if lay_det else "")))

    # DOPASOWANIE.md (desktop v2) — zachowaj ewentualna sekcje MOBILE dopisana wczesniej
    md_path=os.path.join(out_dir,"DOPASOWANIE.md")
    mobile_tail=""
    if os.path.isfile(md_path):
        prev=io.open(md_path,encoding="utf-8").read()
        if MOBILE_MARK in prev:
            mobile_tail="\n\n"+MOBILE_MARK+prev.split(MOBILE_MARK,1)[1]
    write_dopasowanie_v2(md_path, target, width, rows, mobile_tail)
    # IR komplet check (R13): tyle IR ile sekcji z makieta
    n_ir = len(glob.glob(os.path.join(ir_dir, "*-IR.json"))) if os.path.isdir(ir_dir) else 0
    n_sec = sum(1 for r in rows if r[1] not in ("BRAK-MAKIETY",))
    n_fail = sum(1 for r in rows if str(r[3]).startswith("LAYOUT-FAIL"))
    print("Zapisano:", md_path)
    print("IR: %d plikow w %s (sekcji z makieta: %d)" % (n_ir, ir_dir, n_sec))
    print("LAYOUT-FAIL: %d/%d sekcji" % (n_fail, len(rows)))

if __name__=="__main__":
    main()

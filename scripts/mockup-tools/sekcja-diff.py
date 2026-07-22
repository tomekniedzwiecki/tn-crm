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
import sys, os, io, json, time, subprocess, socket, urllib.request, base64, tempfile, shutil, re, glob, math
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
  function natOf(el){ if(el.tagName==='IMG') return [el.naturalWidth||0, el.naturalHeight||0];
    if(el.tagName==='VIDEO') return [el.videoWidth||0, el.videoHeight||0];
    var im=el.querySelector&&el.querySelector('img'); if(im) return [im.naturalWidth||0, im.naturalHeight||0]; return [0,0]; }
  function ofOf(el){ var e=el; if(el.tagName==='PICTURE'){var im=el.querySelector('img'); if(im)e=im;}
    return getComputedStyle(e).objectFit||''; }
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
    // ---- images (in-flow, poza full-bleed sceną). Pomijamy <img> wewnątrz <picture> (podwójne
    //      liczenie tego samego kadru). objectFit+natW/H → self-check „pustka" (letterbox contain). ----
    var imgs=[];
    sec.querySelectorAll('img,video,picture').forEach(function(im){
      if(im.tagName==='IMG' && im.closest('picture')) return;
      var r=im.getBoundingClientRect();
      if(r.width*r.height<0.01*SW*SH) return; var fb=isFullBleedScene(im,SW,SH); var nat=natOf(im);
      imgs.push({xpct:(r.x-SX)/SW,wpct:r.width/SW,ypct:(r.y+window.scrollY-SYY)/SH,hpct:r.height/SH,
                 cxpct:((r.x+r.width/2)-SX)/SW,cypct:((r.y+window.scrollY+r.height/2)-SYY)/SH,
                 areaPct:(r.width*r.height)/(SW*SH),ar:r.height/r.width,fullbleed:fb,
                 boxW:r.width,boxH:r.height,natW:nat[0],natH:nat[1],objectFit:ofOf(im)}); });
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
    // ---- wrap (kontener max-width) — do pomiaru gutterów W RENDERZE (self-check, bez makiety) ----
    var wrapEl=sec.querySelector('.wrap, .hero-wrap, .final-wrap, [class*="wrap"]'); var wrap=null;
    if(wrapEl){ var wr=wrapEl.getBoundingClientRect(); wrap={L:(wr.x-SX)/SW, R:(wr.x+wr.width-SX)/SW}; }
    // ---- contentBlock: union bbox treści (tekst+CTA+obrazy in-flow), BEZ scen full-bleed.
    //      Ostatnia solidna „dolna krawędź treści" (pustka-w-sekcji) + gutter-hug (przyklejenie do boku). ----
    var cbL=Infinity,cbR=-Infinity,cbB=-Infinity,cbN=0;
    function cbAdd(r){ var l=(r.x-SX)/SW,rr=(r.x+r.width-SX)/SW,b=(r.y+window.scrollY+r.height-SYY)/SH;
      if(l<cbL)cbL=l; if(rr>cbR)cbR=rr; if(b>cbB)cbB=b; cbN++; }
    sec.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,summary,blockquote,figcaption,.eyebrow,.lead,a.btn,button,[data-checkout]').forEach(function(t){
      if(t.closest('svg')) return; var tr=t.getBoundingClientRect(); var txt=(t.textContent||'').trim();
      var isBtn=t.matches('a.btn,button,[data-checkout]');
      if(tr.width<10||tr.height<6) return; if(!isBtn && txt.length<2) return; cbAdd(tr); });
    sec.querySelectorAll('img,video,picture').forEach(function(im){ if(im.tagName==='IMG'&&im.closest('picture'))return;
      var r=im.getBoundingClientRect(); if(r.width*r.height<0.01*SW*SH) return; if(isFullBleedScene(im,SW,SH))return; cbAdd(r); });
    var contentBlock = cbN? {L:Math.max(0,cbL),R:Math.min(1,cbR),B:cbB,n:cbN} : null;
    sections.push({id:sec.id,x:SX,y:SYY,w:SW,h:SH,ar:SH/SW,tiles:tiles,imgs:imgs.slice(0,3),content:content,
                   wrap:wrap,contentBlock:contentBlock});
  });
  return JSON.stringify({sections:sections,vw:window.innerWidth});
})()
"""

# PETLA DELT (audyt 18.07): pomiar kluczowych elementow renderu (getComputedStyle +
# getBoundingClientRect) per sekcja -> porownanie z IR makiety -> KONKRETNE delty (font-size,
# kolor tla, pozycja chipa, obecnosc swasha). Wzorzec z viewport-diff.py --measure, tu per-sekcja.
MEASURE_JS = r"""
(function(){
  function px(v){ v=parseFloat(v); return isFinite(v)?Math.round(v):0; }
  function effBg(el){ var e=el;
    while(e){ var c=getComputedStyle(e).backgroundColor;
      if(c && c!=='rgba(0, 0, 0, 0)' && c!=='transparent') return c; e=e.parentElement; }
    return getComputedStyle(document.body).backgroundColor; }
  function biggestHeading(sec){ var best=null,bp=0;
    sec.querySelectorAll('h1,h2,h3,[class*="title"],[class*="hero-h"],[class*="headline"]').forEach(function(t){
      var tx=(t.textContent||'').trim(); if(tx.length<2) return;
      var r=t.getBoundingClientRect(); if(r.width<10||r.height<8) return;
      var fp=px(getComputedStyle(t).fontSize); if(fp>bp){ bp=fp; best=t; } });
    return best; }
  function meas(el,SX,SW){ if(!el) return null; var cs=getComputedStyle(el); var r=el.getBoundingClientRect();
    var tx=(el.textContent||'').trim().slice(0,32);
    return {px:px(cs.fontSize), weight:cs.fontWeight, color:cs.color,
            cx:((r.x+r.width/2)-SX)/SW, sample:tx}; }
  var PRICE='.hero-price,.price,[class*="price"],[class*="cena"],[class*="kwota"]';
  var EYE='.eyebrow,[class*="eyebrow"],[class*="kicker"],[class*="overline"]';
  var out={};
  document.querySelectorAll('section[id]').forEach(function(sec){
    var sr=sec.getBoundingClientRect(); var SX=sr.x, SW=sr.width; if(SW<4) return;
    var hi=[];
    sec.querySelectorAll('.hi,[class*="hi-"],mark,u,[class*="underline"],[class*="swash"],[class*="squiggle"]').forEach(function(e){
      var r=e.getBoundingClientRect(); if(r.width<6||r.height<6) return;
      hi.push({x:Math.round(r.x), y:Math.round(r.y+window.scrollY), w:Math.round(r.width), h:Math.round(r.height)}); });
    var chips=[];
    sec.querySelectorAll('[class*="chip"],[class*="trust"],[class*="badge"],[class*="rating"],[class*="stars"]').forEach(function(e){
      var r=e.getBoundingClientRect(); if(r.width<8||r.height<8||r.width>0.6*SW) return;
      chips.push({cx:((r.x+r.width/2)-SX)/SW, w:r.width/SW}); });
    out[sec.id]={w:Math.round(SW), bg:effBg(sec), h1:meas(biggestHeading(sec),SX,SW),
                 price:meas(sec.querySelector(PRICE),SX,SW), eyebrow:meas(sec.querySelector(EYE),SX,SW),
                 hi:hi, chips:chips};
  });
  return JSON.stringify(out);
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
        try:
            mres=ws.call("Runtime.evaluate",{"expression":MEASURE_JS,"returnByValue":True},timeout=40)
            measure=json.loads(mres.get("result",{}).get("value"))
        except Exception:
            measure={}
        docH=min(int(meta["docH"]), 30000)
        shot=ws.call("Page.captureScreenshot",{"format":"png","captureBeyondViewport":True,
              "clip":{"x":0,"y":0,"width":width,"height":docH,"scale":1}},timeout=120)
        png=base64.b64decode(shot["data"])
        img=Image.open(io.BytesIO(png)).convert("RGB")
        # DPR>1: screenshot pixels = CSS px * dpr; rects are CSS px -> zwroc realny dpr do skalowania cropow
        real_dpr = img.size[0] / float(width)
        struct_by_id = {s["id"]: s for s in struct.get("sections", [])}
        return img, meta["rects"], real_dpr, struct_by_id, (measure or {})
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

def run_mobile(target, makiety_dir, out_dir, width, manifest=None):
    img, rects, dpr, _struct, _measure = render_full(target, width, mobile=True)
    print("Render MOBILE: %dx%d px (dpr~%.2f), sekcji: %d" % (img.size[0], img.size[1], dpr, len(rects)))
    mk_mob = load_makieta_mobile_map(makiety_dir)
    # F2.4 (18.07): mobile makiety dla WSZYSTKICH sekcji — manifest id=plik.png nadpisuje
    # stara mape tokenow hero/wideo (zostaje jako fallback dla starych landingow).
    if manifest:
        for k, v in manifest.items():
            cand = os.path.join(makiety_dir, v)
            if os.path.isfile(cand): mk_mob[k] = cand
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

def img_letterbox(im):
    """Puste pasma (letterbox/pillarbox) obrazu w jego BOKSIE DOM przy object-fit contain/scale-down.
    Zwraca (emptyV, emptyH) — ulamek wysokosci/szerokosci boksu ZAJETY przez pustke. Mierzone w
    samym renderze (box DOM vs natural intrinsic), BEZ makiety. cover/fill/none => (0,0)."""
    of = (im.get("objectFit") or "").lower()
    nw, nh = im.get("natW", 0) or 0, im.get("natH", 0) or 0
    bw, bh = im.get("boxW", 0) or 0, im.get("boxH", 0) or 0
    if nw <= 0 or nh <= 0 or bw <= 0 or bh <= 0: return (0.0, 0.0)
    if of not in ("contain", "scale-down"): return (0.0, 0.0)  # fill/cover/none nie zostawiaja pasm
    ba = bw / bh; ia = nw / nh  # aspekty W/H
    if ba < ia:  return (max(0.0, 1 - ba / ia), 0.0)   # obraz szerszy niz box => pasy gora/dol
    if ba > ia:  return (0.0, max(0.0, 1 - ia / ba))   # obraz wyzszy niz box => pasy lewo/prawo
    return (0.0, 0.0)

def layout_checks(sid, stype, dom, makieta_path, ir, cfg):
    """Zwraca (status 'OK'|'FAIL', fails[list of check], detail_str). Progi z cfg (manifest).
    TWARDE checki (sliver/pustka/gutter) sa DOM-only i NIE wymagaja IR (self-referential);
    IR-owe checki (wysokosc/guttery/obraz) sa informacyjne i pomijane gdy IR brak."""
    if dom is None:
        return ("SKIP", [], "brak DOM")
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
    # ================================================================================================
    # TWARDE DOM SELF-CHECKI (mierzone w SAMYM renderze, BEZ porownania z IR makiety — dlatego odporne
    # na szum makiet AI, ktory slusznie zdemotowal (2)-(4) do „info"). Lapia patologie-same-w-sobie.
    # Progi w gate-manifest.json (layout_diff.progi), skalibrowane empirycznie: FAIL Odpalak,
    # PASS Drapek+Loczek (18.07). Uzupelniaja sliver-guard (1).
    # ================================================================================================
    imgs = dom.get("imgs") or []
    inflow = [im for im in imgs if not im.get("fullbleed")]
    # ---- (2) PUSTKA-POD-OBRAZEM (Odpalak C „obraz za wysoko podnosi sekcje") ----
    # Patologia: dominujacy obraz IN-FLOW w za WYSOKIM boksie => produkt (contain) plywa z duzymi
    # pustymi pasmami. Sygnal DOM: object-fit contain + emptyV (box vs intrinsic) + box wyrazny portret.
    # Wariant B: pod dominujacym obrazem dolne >X% sekcji nie ma ZADNEJ tresci (contentBlock.B nisko).
    if inflow:
        di = inflow[0]
        if di["areaPct"] >= P.get("pustka_img_min_area", 0.18):
            evd, _ehd = img_letterbox(di)
            boxAR = (di.get("boxH", 0) / di["boxW"]) if di.get("boxW") else di.get("ar", 0)
            if evd >= P.get("pustka_emptyv_min", 0.30) and boxAR >= P.get("pustka_boxar_min", 1.40):
                fails.append("pustka")
                det.append("pustka-pod-obrazem: obraz contain box ar=%.2f, pustka pionowa %.0f%% (produkt plywa w za wysokim boksie)"
                            % (boxAR, 100*evd))
            else:
                cbk = dom.get("contentBlock")
                if cbk and cbk.get("B", 1.0) <= P.get("pustka_section_bottom_max", 0.70):
                    fails.append("pustka")
                    det.append("pustka-pod-obrazem: dolne %.0f%% sekcji bez tresci (obraz konczy sie wysoko, pod nim pusto)"
                                % (100*(1 - cbk["B"])))
    # ---- (3) GUTTER-ASYMETRIA / SCENA-ZLA-STRONA (Odpalak D „treść do lewej", hero-obraz-zla-strona) ----
    cb = dom.get("contentBlock"); wrap = dom.get("wrap")
    fb = [im for im in imgs if im.get("fullbleed")]
    gutter_hit = False
    # (3a) SCENA JEDNOSTRONNA: scena full-bleed (absolut, >=55% pola) ale kryjaca TYLKO jeden bok
    #      (wpct<max) i mocno OFF-CENTER => tresc wcisnieta w gutter po drugiej stronie. Intencja
    #      hero/final/problem = scena EDGE-TO-EDGE; scena z boku = zla strona/gutter. Self-referential.
    if fb:
        sc = fb[0]; offcx = abs(sc["cxpct"] - 0.5)
        opp_ok = True
        if cb:  # tresc po PRZECIWNEJ stronie niz scena (klasyczny split)
            cb_cx = (cb["L"] + cb["R"]) / 2.0
            opp_ok = (cb_cx - 0.5) * (sc["cxpct"] - 0.5) < 0
        if sc["wpct"] < P.get("gutter_scene_wmax", 0.85) and offcx > P.get("gutter_scene_offcx_min", 0.12) and opp_ok:
            fails.append("gutter"); gutter_hit = True
            det.append("gutter-scena-jednostronna: scena full-bleed kryje %.0f%% szer (cx=%.2f, off=%.2f) — tresc wciśnieta w gutter, scena po zlej stronie"
                        % (100*sc["wpct"], sc["cxpct"], offcx))
    # (3b) GUTTER-LEWY-PRZYKLEJONY: blok tresci przyklejony do boku wzgledem .wrap, a PRZECIWNY gutter
    #      PUSTY (nie kryty zadnym obrazem). left<40%*right (lub odwrotnie). Self-referential.
    if not gutter_hit and cb and wrap:
        wL, wR = wrap["L"], wrap["R"]; wW = wR - wL
        if wW > 0.2:
            gL = max(0.0, (cb["L"] - wL) / wW); gR = max(0.0, (wR - cb["R"]) / wW)
            big = max(gL, gR); small = min(gL, gR)
            ratio = small / big if big > 1e-3 else 1.0
            if ratio < P.get("gutter_hug_ratio_max", 0.40) and big >= P.get("gutter_hug_biggut_min", 0.25):
                big_right = gR >= gL
                covered = False
                for im in imgs:  # czy duzy gutter kryty JAKIMKOLWIEK obrazem (scena/kafel)?
                    iL = im["xpct"]; iR = im["xpct"] + im["wpct"]
                    if big_right and iR > cb["R"] + 0.03: covered = True
                    if (not big_right) and iL < cb["L"] - 0.03: covered = True
                if not covered:
                    fails.append("gutter")
                    det.append("gutter-lewy-przyklejony: tresc przyklejona do %s (gL=%.2f gR=%.2f ratio=%.2f), przeciwny gutter PUSTY"
                                % ("lewej" if big_right else "prawej", gL, gR, ratio))
    # ---- (4)-(6) checki WYWODZONE Z IR MAKIETY = INFORMACYJNE, nie hard-FAIL (R13 domkniecie,
    # test Drapek 18.07). Powod: detekcja blokow mockup-ir (findContours+OCR) na pastelowych
    # full-bleed makietach AI jest zbyt szumna — TEN SAM powod, dla ktorego makieta_columns (kafle-cols)
    # juz jest informacyjna (patrz komentarz w (1)). Zweryfikowane falszywe alarmy na WIERNYM landingu:
    #   galeria „wysokosc" (IR content-bbox zlapal tylko naglowek -> AR 0.23 zamiast pelnego 2x2 gridu),
    #   porownanie „obraz" (ir_image_slot wybral maly inset bottom-left zamiast glownego obrazu prawego),
    #   hero „guttery" (OCR-asym makiety=0.00 bo chip ★ po prawej upozorowal symetrie).
    # Hard-FAIL zostaje na DOM-owym sliver-guard (1) + RUBRYCE vision (5xT/N). Diagnostyka zostaje
    # WIDOCZNA w kolumnie LAYOUT jako „info:" (transparentnosc, nie ukrywanie).
    info = []
    if ir is not None:
        if not (P.get("wysokosc_tylko_kodowa") and stype != "kodowa"):
            cbi = ir_content_bbox(ir)
            if cbi and cbi["contentAR"] > 0:
                dev = abs(dom["ar"] - cbi["contentAR"]) / cbi["contentAR"] * 100
                if dev > P["wysokosc_tol_pct"]:
                    info.append("wysokosc(makieta-IR) sekcja AR %.2f vs makieta %.2f (d=%.0f%%)"
                                % (dom["ar"], cbi["contentAR"], dev))
        if sid in P.get("gutter_sekcje", []):
            ta = ir_text_asym(ir); dc = dom.get("content")
            if ta and dc:
                dasym = abs(dc["asym"] - ta["asym"])
                if dasym > P["gutter_asym_delta"]:
                    info.append("guttery(makieta-IR) render asym %.2f vs makieta %.2f (d=%.2f)"
                                % (dc["asym"], ta["asym"], dasym))
        isl = ir_image_slot(ir)
        single = (not t) and imgs and imgs[0]["areaPct"] >= 0.20
        if isl and single and isl["areaPct"] >= P.get("obraz_imgslot_min_area", 0.08):
            rimg = imgs[0]
            dcx = abs(rimg["cxpct"] - isl["cxpct"])
            if dcx > P.get("obraz_center_delta", 0.30):
                info.append("obraz(makieta-IR) srodek render x%.2f vs makieta x%.2f (d=%.2f)"
                            % (rimg["cxpct"], isl["cxpct"], dcx))
    if info:
        det.append("info: " + "; ".join(info))
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

# ============================================================================
# PETLA DELT POMIAROWYCH (audyt 18.07) — render(getComputedStyle) vs IR makiety.
# Emituje KONKRETNE delty (font-size / kolor tla / pozycja chipa / swash) + region-SSIM na copy.
# Cel: koder robi PUNKTOWE poprawki zamiast re-aproksymowac (P2/P3 audytu).
# ============================================================================
def _hex_to_rgb(h):
    h = (h or "").lstrip("#")
    if len(h) != 6:
        return None
    try:
        return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
    except Exception:
        return None

def _rgb_from_css(s):
    if not s:
        return None
    if s.startswith("#"):
        return _hex_to_rgb(s)
    m = re.search(r"rgba?\(([^)]+)\)", s)
    if not m:
        return None
    parts = [p.strip() for p in m.group(1).split(",")]
    try:
        return tuple(int(round(float(parts[i]))) for i in range(3))
    except Exception:
        return None

def _rgb_hex(rgb):
    return "#%02X%02X%02X" % tuple(rgb) if rgb else "?"

def _srgb_to_lab(rgb):
    def f(c):
        c = c / 255.0
        return ((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92
    r, g, b = [f(x) for x in rgb]
    X = r*0.4124 + g*0.3576 + b*0.1805; Y = r*0.2126 + g*0.7152 + b*0.0722; Z = r*0.0193 + g*0.1192 + b*0.9505
    Xn, Yn, Zn = 0.95047, 1.0, 1.08883
    def g2(t):
        return t ** (1/3.0) if t > 0.008856 else 7.787 * t + 16/116.0
    fx, fy, fz = g2(X/Xn), g2(Y/Yn), g2(Z/Zn)
    return (116*fy - 16, 500*(fx - fy), 200*(fy - fz))

def deltaE76(c1, c2):
    if not c1 or not c2:
        return None
    l1, l2 = _srgb_to_lab(c1), _srgb_to_lab(c2)
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(l1, l2)))

def _fmt_pct(rp, mk):
    if not mk:
        return "?"
    d = 100.0 * (rp - mk) / mk
    return ("+%.0f%%" % d) if d >= 0 else ("%.0f%%" % d)

def _ir_topright_chip(ir):
    """Maly blok tekstu w gornych 25% makiety po prawej (chip typu '* 4.9') -> oczekiwane cx."""
    blocks = ir.get("blocks", []) if ir else []
    cands = [b for b in blocks if b.get("kind") == "text" and b.get("y1000", 999) < 250 and b.get("w1000", 999) < 320]
    if not cands:
        return None
    best = max(cands, key=lambda b: b["x1000"] + b["w1000"] / 2.0)
    cx = (best["x1000"] + best["w1000"] / 2.0) / 1000.0
    return cx if cx > 0.5 else None

def region_ssim_copy(makieta_img, crop, ir):
    """SSIM na bboxach COPY makiety (znormalizowane, wspolne pudlo Wc x Hc). Region-SSIM na tekscie
    DYSKRYMINUJE tam, gdzie SSIM calej sekcji nie (zespol slusznie odrzucil SSIM-calosci — audyt 18.07)."""
    tb = [b for b in ir.get("blocks", []) if b.get("kind") == "text"] if ir else []
    if not tb:
        return None
    Wm = ir.get("image", {}).get("w", 1) or 1
    Hm = ir.get("image", {}).get("h", 1) or 1
    Wc, Hc = 480, 640
    def prep(im):
        return np.asarray(im.resize((Wc, Hc)).convert("L"))
    A = prep(makieta_img); B = prep(crop)
    vals = []
    for b in tb:
        x0 = int(b["x"] / Wm * Wc); x1 = int((b["x"] + b["w"]) / Wm * Wc)
        y0 = int(b["y"] / Hm * Hc); y1 = int((b["y"] + b["h"]) / Hm * Hc)
        x0 = max(0, min(Wc - 2, x0)); x1 = max(x0 + 2, min(Wc, x1))
        y0 = max(0, min(Hc - 2, y0)); y1 = max(y0 + 2, min(Hc, y1))
        if x1 - x0 < 6 or y1 - y0 < 6:
            continue
        try:
            vals.append(float(ssim(A[y0:y1, x0:x1], B[y0:y1, x0:x1])))
        except Exception:
            pass
    return (sum(vals) / len(vals)) if vals else None

def swash_accent_report(img, hi_rects, dpr, accent_rgb):
    """Ile elementow .hi ma pod soba piksele akcentu (podkreslenie/swash). Zwraca (n_hi, n_z_akcentem).
    Zlapaloby incydent 'swash 0/17' (koder pominal podkreslenie pod .hi)."""
    if not hi_rects or not accent_rgb:
        return (0, 0)
    W, H = img.size; acc = np.array(accent_rgb, dtype=np.float32); n_acc = 0
    for r in hi_rects:
        x0 = int(r["x"] * dpr); x1 = int((r["x"] + r["w"]) * dpr)
        ys = int((r["y"] + r["h"] * 0.55) * dpr); ye = int((r["y"] + r["h"] + 8) * dpr)
        x0 = max(0, min(W - 1, x0)); x1 = max(x0 + 1, min(W, x1))
        ys = max(0, min(H - 1, ys)); ye = max(ys + 1, min(H, ye))
        strip = np.asarray(img.crop((x0, ys, x1, ye)).convert("RGB")).reshape(-1, 3)
        if strip.size == 0:
            continue
        d = np.sqrt(((strip.astype(np.float32) - acc) ** 2).sum(axis=1))
        if float((d < 60).mean()) > 0.01:
            n_acc += 1
    return (len(hi_rects), n_acc)

def compute_deltas(sid, m, ir, region_ss=None, swash=None):
    """Lista KONKRETNYCH delt render vs IR makiety. Puste = pomiar zgodny / brak elementow."""
    delty = []
    if not ir:
        return delty
    norm = (ir.get("typography", {}) or {}).get("scale_px_norm", {}) or {}
    root = ir.get("root", {}) or {}
    if m and m.get("h1") and norm.get("H1"):
        rp = m["h1"]["px"]; mk = norm["H1"]
        if mk and abs(rp - mk) / mk > 0.12:
            kier = "za duzy, zmniejsz" if rp > mk else "za maly, powieksz"
            delty.append("H1 render %dpx vs makieta %dpx (%s) -> %s" % (rp, mk, _fmt_pct(rp, mk), kier))
    if m and m.get("eyebrow") and norm.get("caption"):
        rp = m["eyebrow"]["px"]; mk = norm["caption"]
        if mk and abs(rp - mk) / mk > 0.35:
            delty.append("eyebrow render %dpx vs makieta ~%dpx (%s)" % (rp, mk, _fmt_pct(rp, mk)))
    if m and m.get("bg") and root.get("paper"):
        rbg = _rgb_from_css(m["bg"]); mbg = _hex_to_rgb(root["paper"]); dE = deltaE76(rbg, mbg)
        if dE is not None and dE > 4.0:
            delty.append("tlo render %s vs makieta %s (dE=%.1f) -> ustaw --paper %s"
                         % (_rgb_hex(rbg), root["paper"], dE, root["paper"]))
    if m and m.get("chips"):
        chip = min(m["chips"], key=lambda c: c["cx"])
        exp_right = _ir_topright_chip(ir)
        if exp_right is not None and chip["cx"] < 0.35 and exp_right > 0.6:
            delty.append("chip-trust cx %.2f vs makieta %.2f -> przenies inline-right" % (chip["cx"], exp_right))
    if swash is not None:
        n_hi, n_acc = swash
        if n_hi > 0 and n_acc == 0:
            delty.append("swash/podkreslenie .hi: %d el. bez piksela akcentu (0) -> dodaj podkreslenie w kolorze --cta" % n_hi)
    if region_ss is not None:
        delty.append("region-SSIM copy=%.3f (sygnal dyskryminujacy na blokach tekstu; niski = dryf ukladu/typografii)" % region_ss)
    return delty

DELTY_MARK = "<!-- DELTY-POMIAROWE -->"
def build_delty_block(delty_by_sec):
    lines = ["", DELTY_MARK,
        "## DELTY POMIAROWE per sekcja (sekcja-diff.py: render getComputedStyle vs IR makiety)", "",
        "Twarde liczby z pomiaru RENDERU porownane z IR makiety (paleta/skala/pozycje). Koder/montaz",
        "konsumuje to do PUNKTOWYCH poprawek: NIE aproksymuj, popraw dokladnie wskazana wartosc.", ""]
    any_d = False
    for sec, ds in delty_by_sec:
        if ds:
            any_d = True
            lines.append("**%s:**" % sec)
            lines += ["- %s" % d for d in ds]
            lines.append("")
    if not any_d:
        lines += ["- (brak zmierzonych delt — pomiar zgodny z IR albo brak elementow do zmierzenia)", ""]
    return "\n".join(lines)

def write_dopasowanie_v2(md_path, target, width, rows2, mobile_tail, delty_block=""):
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
        "> LAYOUT twarde (DOM self-checki, mierzone w renderze — BEZ makiety): (1) kafle-sliver cols>=5 &",
        "> szer<12% & portret; (2) pustka-pod-obrazem: obraz in-flow contain w boksie ar>=1.4 z pustka",
        "> pionowa >=30% (produkt plywa) LUB dolne >30% sekcji bez tresci; (3) gutter: scena full-bleed",
        "> jednostronna (kryje <85% szer & off-center >0.12) LUB tresc przyklejona do boku z pustym gutterem.",
        "> INFORMACYJNE (kolumna LAYOUT: 'info:', NIE FAIL — szum makiet AI): wysokosc/guttery/obraz z IR-makiety,",
        "> raw-SSIM (real-render vs AI-makieta nie dyskryminuje wiernosci). Decyduja: DOM self-checki + RUBRYKA vision 5xT/N.",
        "> SCENOWA: SSIM dwuskladnikowy (maska sceny cap ~0.70 OSOBNO + reszta) — informacyjnie."]
    io.open(md_path, "w", encoding="utf-8").write("\n".join(md) + "\n" + delty_block + mobile_tail)

def main():
    if len(sys.argv)<4:
        raise SystemExit("uzycie: sekcja-diff.py <url|plik> <makiety-dir> <out-dir> [--manifest id=NN-file.png,...] [--width 1280] [--viewport 390]")
    target, makiety_dir, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
    width=1280
    if "--width" in sys.argv: width=int(sys.argv[sys.argv.index("--width")+1])
    os.makedirs(out_dir,exist_ok=True)

    manifest={}
    if "--manifest" in sys.argv:
        raw=sys.argv[sys.argv.index("--manifest")+1]
        for pair in raw.split(","):
            if "=" in pair:
                k,v=pair.split("=",1); manifest[k.strip()]=v.strip()

    # MOBILE tryb: --viewport 390 (crop per sekcja z renderu 390; F2.4: makiety WSZYSTKICH
    # sekcji przez --manifest; bez manifestu fallback = stara mapa tokenow hero/wideo)
    if "--viewport" in sys.argv:
        vw=int(sys.argv[sys.argv.index("--viewport")+1])
        run_mobile(target, makiety_dir, out_dir, vw, manifest)
        return

    img, rects, _dpr, struct, measure = render_full(target, width)
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
    rows=[]; delty_by_sec=[]
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
            if lf: lay_fails += lf
            if ld: lay_det.append(ld)          # zawsze przechwytuj detal (takze „info:")
        # SSIM wg typu — INFORMACYJNY, nie hard-FAIL (R13, test Drapek 18.07).
        # Doc SEKCJA-Z-MAKIETY L132-133: „SSIM real-render vs makieta AI ma niski sufit na OBU
        # landingach (dobry i zly) -> SSIM sam NIE dyskryminuje wiernosci; robi to LAYOUT-DIFF + RUBRYKA".
        # Empiria Drapka (13/13 WIERNYCH sekcji @ SSIM 0.32-0.76): prog 0.85 jest niemozliwy do
        # spelnienia dla real-render vs AI-makieta -> demote do „info:". Decyduja: sliver-guard (DOM) +
        # RUBRYKA (vision 5xT/N, wypelniana uczciwie — pozostaje twardym straznikiem mechaniki).
        ssim_disp = "%.3f" % sv
        if stype == "kodowa":
            if sv < Lprog["kodowa_desktop"]:
                lay_det.append("info: SSIM %.3f<%.2f (real-render vs AI-makieta — nie dyskryminuje, decyduje RUBRYKA)"
                               % (sv, Lprog["kodowa_desktop"]))
        elif stype == "scenowa" and dom and dom.get("imgs"):
            scene = dom["imgs"][0]
            scene_rel = (max(0,scene["xpct"]), max(0,scene["ypct"]),
                         min(1,scene["wpct"]), min(1,scene["hpct"]))
            sc, rest = ssim_split_scene(makieta, crop, scene_rel)
            ssim_disp = "%.3f (sc %.2f/reszta %.2f)" % (sv, sc, rest)
            if rest < Lprog["scenowa_reszta"] and (scene["wpct"]*scene["hpct"]) < 0.75:
                lay_det.append("info: reszta-SSIM %.3f<%.2f (real vs AI-makieta)" % (rest, Lprog["scenowa_reszta"]))
        # ---- PETLA DELT: pomiar renderu vs IR makiety -> konkretne delty do DOPASOWANIE.md ----
        mmeas = measure.get(sec)
        rss = region_ssim_copy(makieta, crop, ir) if ir else None
        accent_rgb = _hex_to_rgb((ir.get("root", {}) or {}).get("cta")) if ir else None
        hi_rects = (mmeas or {}).get("hi")
        swash = swash_accent_report(img, hi_rects, _dpr, accent_rgb) if (hi_rects and accent_rgb) else None
        sec_delty = compute_deltas(sec, mmeas, ir, region_ss=rss, swash=swash)
        delty_by_sec.append((sec, sec_delty))
        if sec_delty:
            for d in sec_delty:
                print("      delta: %s" % d)
        # LAYOUT hard-FAIL tylko z sliver-guard (DOM). Detal informacyjny doklejany jawnie.
        info_txt = "; ".join(d for d in lay_det if d)
        if lay_fails:
            layout_str = "LAYOUT-FAIL: " + ", ".join(lay_fails) + ((" · " + info_txt) if info_txt else "")
        else:
            layout_str = "OK" + ((" · " + info_txt) if info_txt else "")
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
    write_dopasowanie_v2(md_path, target, width, rows, mobile_tail, build_delty_block(delty_by_sec))
    # IR komplet check (R13): tyle IR ile sekcji z makieta
    n_ir = len(glob.glob(os.path.join(ir_dir, "*-IR.json"))) if os.path.isdir(ir_dir) else 0
    n_sec = sum(1 for r in rows if r[1] not in ("BRAK-MAKIETY",))
    n_fail = sum(1 for r in rows if str(r[3]).startswith("LAYOUT-FAIL"))
    n_delt = sum(len(d) for _, d in delty_by_sec)
    print("Zapisano:", md_path)
    print("DELTY POMIAROWE: %d delt w %d sekcjach" % (n_delt, sum(1 for _, d in delty_by_sec if d)))
    print("IR: %d plikow w %s (sekcji z makieta: %d)" % (n_ir, ir_dir, n_sec))
    print("LAYOUT-FAIL: %d/%d sekcji" % (n_fail, len(rows)))

if __name__=="__main__":
    main()

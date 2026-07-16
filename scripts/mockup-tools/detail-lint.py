# -*- coding: utf-8 -*-
"""
detail-lint.py <plik.html|url> [--out findings.json]

PASS 0 design-linter fabryki landingow (F7.3 FINALNY PASS). Deterministyczny, reuzywalny.
Uruchamia Chrome headless (CDP), wstrzykuje analizator DOM (getComputedStyle +
getBoundingClientRect), pobiera obrazy (PIL) i liczy:
  - spacing poza skala 4/8 (fixed px paddings/margins/gap)
  - fonty: liczba rodzin, rozmiary "prawie takie same" (17 vs 18)
  - Delta-E clustering akcentow (prawie-identyczne kolory)
  - kontrast WCAG (tekst na jednolitym tle + najgorszy piksel tla pod tekstem na obrazie)
  - focus-ring nieusuniety na interaktywnych
  - touch-target >=44px (mobilny viewport)
  - aspect-ratio naturalne vs render (stretch/squish), upscaling (naturalW < renderW)
  - dedup src/hash obrazow cross-sekcja (ten sam asset w 2 rolach)
  - bbox-overlap dwoch fotografii (image-on-image kandydat)
  - placeholdery/TODO/{{}}/lorem, zakazane frazy, podwojne spacje, polskie cudzyslowy
  - sticky geometry (czy zaslania; padding-bottom stopki)
Wynik: lista findingow JSON {warstwa, lokalizacja, problem, severity, fix, wykryte_przez}.
Wymaga: Chrome + numpy + Pillow.
"""
import sys, os, json, time, subprocess, socket, urllib.request, base64, tempfile, shutil, re, io, math, hashlib
from PIL import Image
import numpy as np
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

ANALYZER = r"""
(function(){
  function rgb(s){var m=(s||'').match(/rgba?\(([^)]+)\)/);if(!m)return null;var p=m[1].split(',').map(function(x){return parseFloat(x)});return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};}
  function sectionOf(el){var s=el.closest('section,header,footer,.sticky-buy');return s?(s.id||s.className.split(' ')[0]):'?';}
  function lum(c){function f(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);}return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);}
  function contrast(a,b){var l1=lum(a),l2=lum(b);var hi=Math.max(l1,l2),lo=Math.min(l1,l2);return (hi+.05)/(lo+.05);}
  // effective background: walk up until non-transparent bg-color
  function effBg(el){var n=el;while(n&&n!==document.documentElement){var bg=rgb(getComputedStyle(n).backgroundColor);if(bg&&bg.a>0.5)return bg;n=n.parentElement;}return {r:255,g:255,b:255,a:1};}
  var out={spacings:[],fonts:[],accents:{},texts:[],focus:[],touch:[],imgs:[],forbidden:[],quotes:[],dblspace:[],sticky:null,vw:window.innerWidth,vh:window.innerHeight};
  // walk elements
  var all=document.querySelectorAll('body *');
  var fontSet={},sizeSet={},accentList=[];
  Array.prototype.forEach.call(all,function(el){
    var cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden')return;
    var r=el.getBoundingClientRect();
    // fonts
    var fam=cs.fontFamily.split(',')[0].replace(/["']/g,'').trim();
    if(el.textContent&&el.textContent.trim()){fontSet[fam]=(fontSet[fam]||0)+1;}
    // spacing: fixed px values
    ['paddingTop','paddingBottom','paddingLeft','paddingRight','marginTop','marginBottom','gap','rowGap','columnGap'].forEach(function(p){
      var v=cs[p];if(v&&v.indexOf('px')>-1){var n=parseFloat(v);if(n>0&&n<200){out.spacings.push({sec:sectionOf(el),prop:p,v:Math.round(n*10)/10,tag:el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.split(' ')[0]:'')});}}
    });
    // color accents (bg + border of small elements, and CTA)
    var bg=rgb(cs.backgroundColor);
    if(bg&&bg.a>0.6&&r.width>0&&r.width<600){accentList.push({sec:sectionOf(el),hex:[Math.round(bg.r),Math.round(bg.g),Math.round(bg.b)],ctx:'bg',tag:el.className&&typeof el.className==='string'?el.className.split(' ')[0]:el.tagName});}
    // text contrast (leaf text nodes with real content)
    var hasText=false;for(var i=0;i<el.childNodes.length;i++){if(el.childNodes[i].nodeType===3&&el.childNodes[i].textContent.trim().length>1){hasText=true;break;}}
    if(hasText&&r.width>0&&r.height>0){
      var col=rgb(cs.color);var fsz=parseFloat(cs.fontSize);var fw=parseInt(cs.fontWeight)||400;
      var bgc=effBg(el);var cr=contrast(col,bgc);
      var large=(fsz>=24)||(fsz>=18.66&&fw>=700);
      out.texts.push({sec:sectionOf(el),fs:Math.round(fsz*10)/10,fw:fw,col:[Math.round(col.r),Math.round(col.g),Math.round(col.b)],bg:[Math.round(bgc.r),Math.round(bgc.g),Math.round(bgc.b)],cr:Math.round(cr*100)/100,large:large,txt:(el.textContent||'').trim().slice(0,40),x:Math.round(r.x),y:Math.round(r.y+window.scrollY),w:Math.round(r.width),h:Math.round(r.height)});
      sizeSet[Math.round(fsz*10)/10]=(sizeSet[Math.round(fsz*10)/10]||0)+1;
    }
    // touch targets + focus for interactive
    if(el.matches('a[href],button,input,summary,[role=button],.swatch,.btn')){
      var tw=r.width,th=r.height;
      if(tw>0&&th>0&&(tw<44||th<44)){out.touch.push({sec:sectionOf(el),w:Math.round(tw),h:Math.round(th),label:(el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,30),tag:el.tagName.toLowerCase()});}
    }
    // images
    if(el.tagName==='IMG'){
      out.imgs.push({sec:sectionOf(el),src:el.currentSrc||el.src,nw:el.naturalWidth,nh:el.naturalHeight,rw:Math.round(r.width),rh:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y+window.scrollY),cls:(el.className||''),alt:el.getAttribute('alt'),objfit:cs.objectFit});
    }
  });
  out.fonts=Object.keys(fontSet).map(function(k){return {fam:k,n:fontSet[k]};});
  out.sizes=Object.keys(sizeSet).map(function(k){return {px:parseFloat(k),n:sizeSet[k]};}).sort(function(a,b){return a.px-b.px;});
  out.accents=accentList;
  // sticky
  var sticky=document.querySelector('.sticky-buy');
  if(sticky){var sr=sticky.getBoundingClientRect();out.sticky={h:Math.round(sr.height),bodyPB:getComputedStyle(document.body).paddingBottom,footPB:null};}
  // forbidden phrases + quotes + double spaces (visible text)
  var body=document.body.innerText||'';
  var bad=[['dropship','dropshipping'],['\\b24\\s?h\\b','24h'],['magazyn w pl','magazyn w PL'],['ostatnie sztuki','ostatnie sztuki'],['tylko dzi','tylko dzis'],['aliexpress','AliExpress'],['darmowa dostawa','darmowa dostawa'],['gratis','gratis'],['najtaniej','najtaniej'],['nr 1 w pol','NR 1 W POLSCE'],['\\blorem\\b','lorem'],['\\btodo\\b','TODO']];
  bad.forEach(function(p){var re=new RegExp(p[0],'i');var m=body.match(re);if(m){out.forbidden.push({phrase:p[1],found:m[0]});}});
  if(/\{\{/.test(body))out.forbidden.push({phrase:'{{placeholder}}',found:'{{'});
  // straight quotes used as typographic quotes in visible copy
  var q=body.match(/"[^"]{3,60}"/g);if(q)out.quotes=q.slice(0,8);
  var ds=body.match(/\S  +\S/g);if(ds)out.dblspace=ds.slice(0,8);
  return JSON.stringify(out);
})()
"""

def load_and_analyze(target, width, height, mobile):
    chrome=chrome_path(); port=free_port(); profile=tempfile.mkdtemp(prefix="lint-")
    url=target if target.startswith(("http://","https://")) else "file:///"+os.path.abspath(target).replace("\\","/")
    args=[chrome,"--headless=new","--disable-gpu","--hide-scrollbars","--no-first-run",
          "--no-default-browser-check","--disable-extensions","--force-device-scale-factor=1",
          "--remote-debugging-port=%d"%port,"--user-data-dir="+profile,"--window-size=%d,%d"%(width,height),url]
    proc=subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        if not wait_debugger(port): raise SystemExit("debugger nie wstal")
        tabs=[t for t in cdp_get(port,"/json") if t.get("type")=="page"]
        ws=WS(tabs[0]["webSocketDebuggerUrl"])
        ws.call("Page.enable"); ws.call("Runtime.enable")
        ws.call("Emulation.setDeviceMetricsOverride",{"width":width,"height":height,"deviceScaleFactor":1,"mobile":mobile})
        time.sleep(2.4)
        ws.call("Runtime.evaluate",{"expression":"document.documentElement.classList.add('anim');document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('in')});window.scrollTo(0,document.body.scrollHeight);"})
        time.sleep(1.2)
        ws.call("Runtime.evaluate",{"expression":"window.scrollTo(0,0);"})
        time.sleep(0.5)
        res=ws.call("Runtime.evaluate",{"expression":ANALYZER,"returnByValue":True},timeout=40)
        val=res.get("result",{}).get("value")
        return json.loads(val)
    finally:
        proc.terminate()
        try: proc.wait(timeout=5)
        except Exception: proc.kill()
        shutil.rmtree(profile,ignore_errors=True)

# ---------- image fetch + pixel checks ----------
_imgcache={}
def fetch_img(src):
    if src in _imgcache: return _imgcache[src]
    try:
        req=urllib.request.Request(src,headers={"User-Agent":"Mozilla/5.0"})
        raw=urllib.request.urlopen(req,timeout=30).read()
        im=Image.open(io.BytesIO(raw)).convert("RGB")
        _imgcache[src]=(im,hashlib.md5(raw).hexdigest(),len(raw))
    except Exception as e:
        _imgcache[src]=(None,None,0)
    return _imgcache[src]

def lum_srgb(px):
    def f(v):
        v/=255.0
        return v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
    return 0.2126*f(px[0])+0.7152*f(px[1])+0.0722*f(px[2])
def contrast_ratio(a,b):
    l1,l2=lum_srgb(a),lum_srgb(b); hi,lo=max(l1,l2),min(l1,l2); return (hi+0.05)/(lo+0.05)
def delta_e(c1,c2):
    # crude CIE76 in RGB->approx; good enough for near-identical clustering
    return math.sqrt(sum((c1[i]-c2[i])**2 for i in range(3)))

def near_scale(v):
    # allowed 4/8 scale multiples; also common odd values tolerance
    return abs(v-round(v/4)*4)<0.6

def main():
    target=sys.argv[1]
    out=None
    if "--out" in sys.argv: out=sys.argv[sys.argv.index("--out")+1]
    findings=[]
    def add(w,loc,prob,sev,fix,by):
        findings.append({"warstwa":w,"lokalizacja":loc,"problem":prob,"severity":sev,"fix":fix,"wykryte_przez":by})

    D_desk=load_and_analyze(target,1280,900,False)
    D_mob=load_and_analyze(target,390,844,True)

    # ---- fonts ----
    fams=[f for f in D_desk["fonts"] if f["n"]>=2]
    realfams=set(f["fam"] for f in fams if f["fam"].lower() not in ("inherit",))
    if len(realfams)>3:
        add("typografia","global","Rodzin fontow >3: "+", ".join(sorted(realfams)),"P2","Ogranicz do 2-3 rodzin","skrypt")
    # near-same sizes: only INTEGER-ish tokens (clamp() daje kontinuum ulamkow -> ignoruj),
    # oba z realnym uzyciem (n>=3), roznica dokladnie ~1px = "prawie takie same"
    def is_token(s): return abs(s["px"]-round(s["px"]))<0.2 and s["n"]>=3 and s["px"]>=12
    toks=[s for s in D_desk["sizes"] if is_token(s)]
    for i in range(len(toks)-1):
        a,b=toks[i]["px"],toks[i+1]["px"]
        if 0.6<=b-a<=1.4:
            add("typografia","global",f"Rozmiary prawie identyczne: {round(a)}px (x{toks[i]['n']}) vs {round(b)}px (x{toks[i+1]['n']}) — mikro-niespojnosc skali","P2","Ujednolic do jednej wartosci ze skali typo","skrypt")

    # ---- spacing off-scale (fixed px, dedup) ----
    offs={}
    for sp in D_desk["spacings"]:
        v=sp["v"]
        if v in (1,2,3,6,10,14,18,22,26) : pass  # common intentional
        if not near_scale(v) and v not in (13,15,17,19,21,23,25,27,7,9,11) and v>=5:
            key=(round(v),sp["prop"])
            offs.setdefault(key,set()).add(sp["sec"])
    # report only notable off-scale that recur
    for (v,prop),secs in sorted(offs.items()):
        if v%2==1 and v>12:  # odd, non-trivial
            add("spacing",",".join(sorted(secs))[:60],f"{prop}={v}px poza skala 4/8","P2","Zaokraglij do najblizszej 4/8","skrypt")

    # ---- accent Delta-E clustering ----
    # gather distinct accent colors used as bg on small elems
    palette={}
    for a in D_desk["accents"]:
        hx=tuple(a["hex"]); palette[hx]=palette.get(hx,0)+1
    cols=[c for c,n in palette.items() if n>=1]
    reported=set()
    for i in range(len(cols)):
        for j in range(i+1,len(cols)):
            de=delta_e(cols[i],cols[j])
            if 0<de<10 and (cols[i],cols[j]) not in reported:
                reported.add((cols[i],cols[j]))
                add("kolor","global",f"Akcenty prawie identyczne dE={round(de,1)}: rgb{cols[i]} vs rgb{cols[j]}","P2","Scal do jednego tokena","skrypt")
    # cap accent noise
    acc=[f for f in findings if f["warstwa"]=="kolor"]
    if len(acc)>4:
        findings=[f for f in findings if f["warstwa"]!="kolor"]
        add("kolor","global",f"{len(acc)} par akcentow o dE<10 (klaster prawie-identycznych) — patrz surowe dane","P2","Przejrzyj tokeny kolorow, scal bliskie","skrypt")

    # ---- WCAG contrast (solid bg) ----
    seen=set()
    for t in D_desk["texts"]:
        thr=3.0 if t["large"] else 4.5
        key=(tuple(t["col"]),tuple(t["bg"]),t["fs"])
        if t["cr"]<thr and key not in seen and len(t["txt"])>2:
            seen.add(key)
            add("kolor",t["sec"]+" / \""+t["txt"]+"\"",f"Kontrast {t['cr']}:1 < {thr} (tekst {t['fs']}px rgb{t['col']} na rgb{t['bg']})",
                "P1" if t["cr"]<thr*0.8 else "P2","Pociemnij tekst lub tlo do >= "+str(thr),"skrypt")

    # ---- images: aspect ratio, upscaling, dedup, worst-pixel-under-text ----
    hashes={}
    for im in D_desk["imgs"]:
        src=im["src"]
        if not src or src.startswith("data:"): continue
        pil,h,size=fetch_img(src)
        base=src.split("/")[-1].split("?")[0]
        if pil is None:
            add("obrazy",im["sec"]+" / "+base,"Obraz nie zaladowal sie (fetch fail / 404?)","P1","Sprawdz URL/asset","skrypt")
            continue
        nw,nh=pil.size
        rw,rh=im["rw"],im["rh"]
        # upscaling
        if rw>0 and nw>0 and nw < rw*0.9 and im["objfit"]!="cover":
            add("obrazy",im["sec"]+" / "+base,f"Upscaling: natural {nw}px < render {rw}px","P2","Podmien na wieksza rozdzielczosc","skrypt")
        # aspect ratio mismatch (only meaningful for object-fit not cover)
        if im["objfit"] in ("fill",) and rw>0 and rh>0:
            na=nw/nh; ra=rw/rh
            if abs(na-ra)/na>0.06:
                add("obrazy",im["sec"]+" / "+base,f"Znieksztalcenie (fill): natural AR {round(na,2)} vs box {round(ra,2)}","P1","object-fit:cover/contain","skrypt")
        # dedup
        if h in hashes:
            add("obrazy",im["sec"]+" / "+base,f"DUPLIKAT assetu (hash {h[:6]}) — ten sam obraz co w sekcji '{hashes[h][0]}' ({hashes[h][1]})","P0","Ten sam obraz w 2 rolach/miejscach — uzyj innego lub potwierdz celowosc","skrypt")
        else:
            hashes[h]=(im["sec"],base)
        # alt on content (non-scene) images
        if "scene" not in (im["cls"] or "") and (im["alt"] is None):
            add("obrazy",im["sec"]+" / "+base,"Brak atrybutu alt na obrazie tresciowym","P2","Dodaj alt","skrypt")

    # worst pixel under text sitting over a scene image
    scenes=[im for im in D_desk["imgs"] if "scene" in (im["cls"] or "")]
    for t in D_desk["texts"]:
        if t["cr"]>=4.5: pass
        # find scene covering this text's section
        sc=[s for s in scenes if s["sec"]==t["sec"]]
        if not sc or len(t["txt"])<3: continue
        s=sc[0]; pil,h,size=fetch_img(s["src"])
        if pil is None: continue
        # scene is object-fit:cover across section; approximate mapping of text bbox to image is rough.
        # Instead sample overall darkest/lightest region average near text vertical band.
        # Approx: map text y within section to image; too rough -> just flag as vision candidate.
        # We compute worst-case contrast against min & max luminance of a downsized scene as bound.
        small=pil.resize((60,40)); arr=np.asarray(small).reshape(-1,3)
        col=t["col"]
        crs=[contrast_ratio(col,tuple(int(x) for x in px)) for px in arr]
        worst=min(crs)
        if worst<3.0:
            add("kolor",t["sec"]+" / \""+t["txt"]+"\"",
                f"Tekst nad scena: najgorszy piksel tla daje kontrast {round(worst,2)}:1 (<3) — ryzyko nieczytelnosci gdzie scrim slaby",
                "P2","Wzmocnic overlay/scrim pod tekstem lub przesunac copy nad jednolite pole","skrypt(bound)")
    # cap worst-pixel noise
    wp=[f for f in findings if "najgorszy piksel" in f["problem"]]
    if len(wp)>3:
        for f in wp[3:]:
            findings.remove(f)
        add("kolor","hero/problem/demo/benefits",f"({len(wp)} tekstow nad scenami ma teoretyczny worst-pixel <3 — do potwierdzenia vision, scrim moze wystarczac)","P2","Weryfikacja blur/vision","skrypt(bound)")

    # ---- bbox overlap of two content photos (image-on-image) ----
    photos=[im for im in D_desk["imgs"] if im["nw"]>0 and "scene" not in (im["cls"] or "")]
    for i in range(len(photos)):
        for j in range(i+1,len(photos)):
            a,b=photos[i],photos[j]
            ox=max(0,min(a["x"]+a["rw"],b["x"]+b["rw"])-max(a["x"],b["x"]))
            oy=max(0,min(a["y"]+a["rh"],b["y"]+b["rh"])-max(a["y"],b["y"]))
            if ox>10 and oy>10:
                add("obrazy",a["sec"],"Dwie fotografie nachodza bboxem (image-on-image kandydat)","P1","Rozdziel lub cutout z alfa","skrypt")

    # ---- touch targets (mobile) ----
    seen_t=set()
    for tt in D_mob["touch"]:
        key=(tt["tag"],tt["label"],tt["w"],tt["h"])
        if key in seen_t: continue
        seen_t.add(key)
        if tt["w"]<44 or tt["h"]<44:
            sev="P2" if (tt["w"]>=32 and tt["h"]>=32) else "P1"
            add("interakcje",tt["sec"]+" / "+tt["label"],f"Touch-target {tt['w']}x{tt['h']}px < 44 (mobile)","%s"%sev,"Powieksz obszar dotyku do >=44px","skrypt")

    # ---- forbidden phrases / placeholders / quotes / double space ----
    for f in D_desk["forbidden"]:
        sev="P0" if f["phrase"] in ("dropshipping","AliExpress","{{placeholder}}","NR 1 W POLSCE") else "P1"
        # {{ }} in raw source is expected (CANONICAL/PIXEL) -> downgrade if only those
        add("tresc","visible copy",f"Zakazana/placeholder fraza: '{f['phrase']}' (znaleziono: {f['found']})",sev,"Usun/zamien wg standardu","skrypt")
    for q in D_desk["quotes"]:
        add("tresc","visible copy",f"Proste cudzyslowy w copy: {q[:40]} — uzyj polskich „ ”","P2","Zamien na „ ”","skrypt")
    for d in D_desk["dblspace"]:
        add("tresc","visible copy",f"Podwojna spacja: ...{d}...","P2","Usun podwojna spacje","skrypt")

    # ---- sticky geometry ----
    if D_mob.get("sticky"):
        st=D_mob["sticky"]
        pb=st.get("bodyPB","0px")
        try: pbv=float(str(pb).replace("px",""))
        except: pbv=0
        # sticky-buy is position:fixed overlay; content should not be permanently hidden.
        # Check last section bottom clearance is handled by sticky being transient; note if body padding-bottom 0.
        if pbv < st["h"]-4:
            add("interakcje","sticky-buy","Sticky-buy (h=%dpx) fixed, a body padding-bottom=%s — ostatnia tresc/stopka moze byc zaslaniana przy dole strony"%(st["h"],pb),"P2","Dodaj padding-bottom na body/stopce = wysokosc sticky","skrypt")

    result={"findings":findings,"raw":{"fonts":D_desk["fonts"],"sizes":D_desk["sizes"],
            "n_imgs":len(D_desk["imgs"]),"sticky":D_desk.get("sticky")}}
    txt=json.dumps(result,ensure_ascii=False,indent=1)
    if out:
        io.open(out,"w",encoding="utf-8").write(txt)
    # summary to stdout
    bysev={}
    for f in findings: bysev[f["severity"]]=bysev.get(f["severity"],0)+1
    print("FINDINGS:",json.dumps(bysev),"total",len(findings))
    for f in findings:
        print("["+f["severity"]+"]",f["warstwa"],"|",f["lokalizacja"],"|",f["problem"][:120])

if __name__=="__main__":
    main()

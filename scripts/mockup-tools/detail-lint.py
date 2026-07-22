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
  - scrim_plateau: sekcje scenowe desktop — czy scrim tworzy SOLIDNY plateau --paper pod
    CALYM blokiem tresci (STANDARD F3.1b), czy tylko miekki fade (scena przeswituje pod tekstem).
    Pomiar pikselowy EFEKTU: ukryj dzieci bloku -> screenshot bboxa -> frakcja pikseli
    odbiegajacych od --paper + edge-density. Komplementarny do "najgorszego piksela pod tekstem".
  - fade_line: pasy scenowe MOBILE (@390) — pozycja wbudowanej LINII FADE pliku sceny (foto->krem)
    w renderowanym boksie pasa (STANDARD §2 KADR=BOHATER+LINIA FADE). Screenshot boksu -> najdluzszy
    ciagly pas jednolitego --paper: >=25% wys. = MARTWY PAS (kadr/object-position slepy, tresc wisi
    pod pustka) = P1; top-tekstura wysoka przy zlym kadrze = bohater przy gornej krawedzi (heurystyka) = P2.
    Komplementarny do scrim_plateau (desktop) i img-fit (% uciecia, ale nie CO uciete).
  - scene_seam: BACKSTOP "SZEW PELNOKADROWY" (desktop) — dwie SASIEDNIE sekcje z pelnokadrowa scena
    (obraz full-bleed dochodzacy do krawedzi sekcji) po TEJ SAMEJ stronie, stykajace sie krawedz-w-krawedz
    na granicy sekcji = twardy szew (dwa rozne zdjecia sklejone). Kolektor geometryczny (bounding rects
    sekcji + najwiekszej sceny, side left/right/full), parowanie sasiadow DOM w Pythonie. Fix = ZIG-ZAG lub
    sekcja rozdzielajaca (PRZEWODNIK-GRAFICZNY pkt 2 ANTY-SZEW PELNOKADROWY + STANDARD F1.7). P1.
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
  // PASS 4: parent-id map (rodzenstwo = ten sam pid) + klasyfikacja blokow + tokeny pay-imitacji
  var pmap=new Map(),pc=0;
  function pid(p){if(!p)return 0;if(!pmap.has(p)){pmap.set(p,++pc);}return pmap.get(p);}
  function kindOf(el){
    if(el.matches('.pay-badges'))return 'pay';
    if(el.matches('.btn,button,[role=button],a.btn'))return 'cta';
    if(el.matches('.pill'))return 'pill';
    if(el.matches('form,input,select,textarea'))return 'form';
    if(el.matches('figure'))return 'figure';
    return null;
  }
  var PAYTOK=['blik','visa','mastercard','mc','karta','przelew'];// 'za pobraniem' USUNIETE (kalibracja 19.07): COD to metoda platnosci (Etap5 COD-first, manifest grep_forbidden 'za pobraniem DOZWOLONE'), nie imitacja marki karty wymagajaca SVG-logo
  var out={spacings:[],fonts:[],accents:{},texts:[],focus:[],touch:[],imgs:[],forbidden:[],quotes:[],dblspace:[],sticky:null,blocks:[],paychips:[],txtoverflow:[],hasPayBadges:false,vw:window.innerWidth,vh:window.innerHeight};
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
      // FINALNY-PASS WNIOSKI (16.07): elementy DEKORACYJNE (aria-hidden / same ikony-gwiazdki) NIE podlegaja
      // progowi kontrastu TEKSTU WCAG — info niesie sasiedni tekst ("4,7/5 · N ocen"). Amber gwiazdek/empty-star
      // (#DCD3C2) nie osiagnie 4.5:1 bez zejscia w kolor kolidujacy z CTA -> to konwencja, nie zgrzyt.
      var _txt=(el.textContent||'').trim();
      var _deco=el.closest('[aria-hidden="true"]')||/^[\s★☆✦✧⭐✰⯨]+$/.test(_txt);
      // overmedia (22.07, cap wideo-rail): tekst na scrimie/gradientach lub na <img>/<video>
      // NIE podlega checkowi solid-bg (effBg przeskakuje background-image i klamie tlem sekcji);
      // czytelnosc takich tekstow ocenia worst-pixel-under-text + vision/rubryka.
      var overmedia=false;
      (function(){var n=el;while(n&&n!==document.documentElement){var c=getComputedStyle(n);
        if(c.backgroundImage&&c.backgroundImage!=='none'){overmedia=true;return;}
        var b=rgb(c.backgroundColor);if(b&&b.a>0.5)return;
        n=n.parentElement;}})();
      if(!overmedia){var anc=el,dep=0;
        while(anc.parentElement&&dep<2&&!overmedia){anc=anc.parentElement;dep++;
          for(var k=0;k<anc.children.length;k++){var ch=anc.children[k];
            if(ch.tagName!=='IMG'&&ch.tagName!=='VIDEO')continue;
            var mr=ch.getBoundingClientRect();
            if(mr.left<=r.left+2&&mr.right>=r.right-2&&mr.top<=r.top+2&&mr.bottom>=r.bottom-2){overmedia=true;break;}}}}
      if(!_deco){
        out.texts.push({sec:sectionOf(el),fs:Math.round(fsz*10)/10,fw:fw,col:[Math.round(col.r),Math.round(col.g),Math.round(col.b)],bg:[Math.round(bgc.r),Math.round(bgc.g),Math.round(bgc.b)],cr:Math.round(cr*100)/100,large:large,overmedia:overmedia,txt:(el.textContent||'').trim().slice(0,40),x:Math.round(r.x),y:Math.round(r.y+window.scrollY),w:Math.round(r.width),h:Math.round(r.height)});
      }
      sizeSet[Math.round(fsz*10)/10]=(sizeSet[Math.round(fsz*10)/10]||0)+1;
    }
    // touch targets + focus for interactive
    if(el.matches('a[href],button,input,summary,[role=button],.swatch,.btn')){
      var tw=r.width,th=r.height;
      if(tw>0&&th>0&&(tw<44||th<44)){out.touch.push({sec:sectionOf(el),w:Math.round(tw),h:Math.round(th),label:(el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,30),tag:el.tagName.toLowerCase()});}
    }
    // images
    if(el.tagName==='IMG'){
      var infixed=false;(function(){var n=el;while(n&&n!==document.documentElement){var pp=getComputedStyle(n).position;if(pp==='fixed'||pp==='sticky'){infixed=true;return;}n=n.parentElement;}})();
      out.imgs.push({sec:sectionOf(el),src:el.currentSrc||el.src,nw:el.naturalWidth,nh:el.naturalHeight,rw:Math.round(r.width),rh:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y+window.scrollY),cls:(el.className||''),alt:el.getAttribute('alt'),objfit:cs.objectFit,objpos:cs.objectPosition,infixed:infixed});
    }
    // PASS 4 — bloki interaktywne/wizualne (odstepy) + paychip collector
    if(r.width>0&&r.height>0&&el.matches('.btn,button,[role=button],.pay-badges,.pill,form,input,select,textarea,figure')){
      var k=kindOf(el);
      if(k){out.blocks.push({sec:sectionOf(el),pid:pid(el.parentElement),kind:k,x:Math.round(r.x),y:Math.round(r.y+window.scrollY),w:Math.round(r.width),h:Math.round(r.height),tag:el.tagName.toLowerCase(),cls:(el.className&&typeof el.className==='string'?el.className.split(' ')[0]:'')});}
    }
    // PASS 4 — tekst wystaje/uciety w kapsule (pill/chip/badge/callout/tag/label) —
    // feedback Tomka 22.07: pille hero z nowrap wystawaly z boxow. Mierzymy REALNA TRESC:
    // dzieci nie-absolute (absolute = celowe etykiety hr-callout) + gole text-nodes (Range).
    // NIE scrollWidth — Chrome wlicza don absolute ::after (hairline chipu = false positive).
    if(r.width>0&&r.height>0&&r.height<=120&&cs.textOverflow!=='ellipsis'){
      var clsStr=(el.className&&typeof el.className==='string')?el.className:'';
      if(/(^|[ _-])(pill|chip|badge|callout|tag|label)($|[ _-])/i.test(clsStr)){
        var ovx=0,oi,och,ocr;
        for(oi=0;oi<el.children.length;oi++){
          och=el.children[oi];
          if(och.tagName==='BR'||getComputedStyle(och).position==='absolute')continue;
          ocr=och.getBoundingClientRect();
          if(ocr.width===0&&ocr.height===0)continue;
          ovx=Math.max(ovx,ocr.right-r.right,r.left-ocr.left);
        }
        for(oi=0;oi<el.childNodes.length;oi++){
          var tn=el.childNodes[oi];
          if(tn.nodeType!==3||!tn.textContent.trim())continue;
          try{var rg=document.createRange();rg.selectNode(tn);var trr=rg.getBoundingClientRect();
              ovx=Math.max(ovx,trr.right-r.right,r.left-trr.left);}catch(e){}
        }
        if(ovx>2){out.txtoverflow.push({sec:sectionOf(el),cls:clsStr.split(' ')[0],txt:(el.textContent||'').trim().slice(0,40),ov:Math.round(ovx)});}
      }
    }
    // paychip: imitacja marki platnosci POZA kanonicznym .pay-badges
    if(r.width>0&&r.height>0&&!el.closest('.pay-badges')){
      var tx=(el.textContent||'').trim(); var lc=tx.toLowerCase();
      if(tx.length<=14&&PAYTOK.indexOf(lc)>-1){
        var kids=el.children,onlySvg=true;
        for(var ci=0;ci<kids.length;ci++){if(kids[ci].tagName.toLowerCase()!=='svg'){onlySvg=false;break;}}
        var leaf=(kids.length===0)||onlySvg;
        var bgp=rgb(cs.backgroundColor);
        var styled=(cs.borderStyle&&cs.borderStyle!=='none'&&parseFloat(cs.borderTopWidth)>0)||(bgp&&bgp.a>0.05)||(parseFloat(cs.borderTopLeftRadius)>=6);
        if(leaf&&styled){out.paychips.push({sec:sectionOf(el),pid:pid(el.parentElement),txt:tx,tag:el.tagName.toLowerCase(),cls:(el.className&&typeof el.className==='string'?el.className.split(' ')[0]:''),x:Math.round(r.x),y:Math.round(r.y+window.scrollY),w:Math.round(r.width),h:Math.round(r.height)});}
      }
    }
  });
  out.hasPayBadges=!!document.querySelector('.pay-badges');
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

# PASS 4 — hit-test + martwa-interakcja per viewport (generyczny PROBE).
# Dla kazdego input[type=range]/[data-slider]: (a) elementFromPoint(center)==kontrolka,
# (b) pointer-events != none, (c) driven-property (styl obliczony LUB custom-prop --t itd.)
# ROZNI sie miedzy min i max. Identyczna przy min i max = martwa interakcja.
PROBE_JS = r"""
(function(){
  var PROPS=['opacity','transform','filter','backgroundColor','backgroundImage','color','clipPath','width','height','left','top','backdropFilter','maskImage','borderTopColor'];
  var CUSTOM=['--t','--sim','--p','--v','--progress','--pos','--x','--val','--pct'];
  function secOf(el){var s=el.closest('section,header,footer');return s?(s.id||(el.className,s.className.split(' ')[0])):'?';}
  var out={sliders:[]};
  var els=document.querySelectorAll('input[type=range],[data-slider]');
  Array.prototype.forEach.call(els,function(rng){
    try{ rng.scrollIntoView({block:'center'}); }catch(e){}
    var scope=rng.closest('section,figure,[data-sim],.stage,#sim')||rng.parentElement||document.body;
    var mon=Array.prototype.slice.call(scope.querySelectorAll('*')).slice(0,500); mon.push(scope);
    function snap(){
      return mon.map(function(e){
        var cs=getComputedStyle(e);
        var a=PROPS.map(function(p){return cs[p];}).join('|');
        var b=CUSTOM.map(function(cp){return cs.getPropertyValue(cp).trim();}).join('|');
        return a+'#'+b;
      });
    }
    function setv(v){ rng.value=v; rng.dispatchEvent(new Event('input',{bubbles:true})); rng.dispatchEvent(new Event('change',{bubbles:true})); }
    var mn=parseFloat(rng.min||'0'), mx=parseFloat(rng.max||'100'); if(!(mx>mn)){mx=mn+1;}
    var s0=snap(); setv(mn); s0=snap(); setv(mx); var s1=snap(); setv(mn);
    var changed=0; for(var i=0;i<Math.min(s0.length,s1.length);i++){ if(s0[i]!==s1[i]) changed++; }
    var r=rng.getBoundingClientRect();
    var cx=r.x+r.width/2, cy=r.y+r.height/2;
    var top=document.elementFromPoint(cx,cy);
    var topIsControl=(top===rng)||(!!top&&(rng.contains(top)||top.contains(rng)));
    out.sliders.push({
      id:rng.id||rng.getAttribute('data-slider')||rng.tagName.toLowerCase(),
      sec:secOf(rng), w:Math.round(r.width), h:Math.round(r.height),
      pe:getComputedStyle(rng).pointerEvents, topIsControl:topIsControl,
      topEl: top?(top.id||top.tagName.toLowerCase()+'.'+((top.className||'').toString().split(' ')[0])):null,
      changed:changed, monitored:s0.length
    });
  });
  return JSON.stringify(out);
})()
"""

# scrim_plateau (PASS 4, kalibracja masazer 19.07) — most makieta->kod: gdy makieta ma SPLIT
# (solidny kremowy panel pod trescia ~40-50% szer.), scrim W KODZIE MUSI odtworzyc PLATEAU:
# solidny var(--paper) OD KRAWEDZI DO KRAWEDZI BLOKU TRESCI, dopiero za nia fade. Miekki gradient
# od ~34% (opacity ~0.4 przy krawedzi tekstu) = scena przeswituje pod tekstem (STANDARD F3.1b).
# Detekcja sekcji scenowej: full-bleed media (picture/img/video, >=90% szer. i >=55% wys. sekcji)
# + blok tresci (kolumna copy z naglowkiem) NACHODZACY bboxem na scene. Mierzy EFEKT, nie
# implementacje: nie wymaga elementu .scrim. Tag bloku data-scrimcheck do pozniejszego ukrycia.
SCENE_JS = r"""
(function(){
  function clsOf(el){var c=el.className;return (c&&c.baseVal!==undefined)?c.baseVal:(typeof c==='string'?c:'');}
  function vis(el){var cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return false;var r=el.getBoundingClientRect();return r.width>0&&r.height>0;}
  var VWW=window.innerWidth;
  var out={cands:[],paper:getComputedStyle(document.documentElement).getPropertyValue('--paper').trim()};
  var idx=0;
  var secs=document.querySelectorAll('section,header');
  Array.prototype.forEach.call(secs,function(sec){
    var sr=sec.getBoundingClientRect();
    if(sr.width<=0||sr.height<=0)return;
    // 1) full-bleed scene layer: picture/img/video pokrywajace sekcje
    var media=sec.querySelectorAll('picture,video,img');
    var sceneEl=null, sceneR=null;
    Array.prototype.forEach.call(media,function(el){
      if(sceneEl)return; if(!vis(el))return;
      var r=el.getBoundingClientRect();
      if(r.width>=sr.width*0.90 && r.height>=sr.height*0.55){
        // podnies do NAJWYZSZEGO przodka w sekcji o tym samym (full-bleed) bboxie = kontener sceny
        var host=el;
        while(host.parentElement && host.parentElement!==sec){
          var pr=host.parentElement.getBoundingClientRect();
          if(pr.width>=sr.width*0.90 && pr.height>=sr.height*0.55 && Math.abs(pr.width-r.width)<8 && Math.abs(pr.height-r.height)<8){host=host.parentElement;} else break;
        }
        sceneEl=host; sceneR=host.getBoundingClientRect();
      }
    });
    if(!sceneEl)return;
    // 2) blok tresci = kolumna copy zawierajaca naglowek, wezsza niz sekcja
    var head=sec.querySelector('h1,h2,.hero-title,.h2');
    if(!head||!vis(head))return;
    var node=head, best=null;
    while(node&&node!==sec){
      var nr=node.getBoundingClientRect();
      if(nr.width>0 && nr.width<=sr.width*0.85 && vis(node)) best=node;
      var par=node.parentElement; if(!par)break;
      var pr=par.getBoundingClientRect(); if(pr.width>sr.width*0.85) break;
      node=par;
    }
    if(!best) return;
    var br=best.getBoundingClientRect();
    // 3) nachodzenie bboxu bloku na scene (obie osie)
    var ox=Math.min(br.right,sceneR.right)-Math.max(br.left,sceneR.left);
    var oy=Math.min(br.bottom,sceneR.bottom)-Math.max(br.top,sceneR.top);
    if(ox<=4||oy<=4)return;
    idx++;
    best.setAttribute('data-scrimcheck',String(idx));
    sceneEl.setAttribute('data-sceneflag',String(idx));
    var scrim=sec.querySelector('[class*="scrim"]'); if(scrim) scrim.setAttribute('data-scrimflag',String(idx));
    out.cands.push({sec:(sec.id||clsOf(sec).split(' ')[0]||'?'), idx:idx,
      bx:br.left+window.scrollX, by:br.top+window.scrollY, bw:br.width, bh:br.height,
      sx:sceneR.left+window.scrollX, sy:sceneR.top+window.scrollY, sw:sceneR.width, sh:sceneR.height,
      vw:VWW, hasScrim: !!scrim});
  });
  return JSON.stringify(out);
})()
"""

# Ukryj tekst/dzieci bloku (tlo bloku, scrim i scena ZOSTAJA widoczne) -> mierzymy backdrop pod tekstem.
SCRIM_HIDE_JS = r"""
(function(){
  var blocks=document.querySelectorAll('[data-scrimcheck]');
  Array.prototype.forEach.call(blocks,function(b){
    var id=b.getAttribute('data-scrimcheck');
    var sec=b.closest('section,header')||document.body;
    Array.prototype.forEach.call(sec.querySelectorAll('*'),function(e){
      if(e===b) return;                                  // sam blok: zostaje (jego tlo zostaje)
      if(e.contains(b)) return;                           // przodek bloku (wrapper): zostaje
      if(e.closest('[data-sceneflag="'+id+'"]')) return;  // scena i jej dzieci: zostaja
      if(e.closest('[data-scrimflag="'+id+'"]')) return;  // scrim i jego dzieci: zostaja
      e.style.visibility='hidden';                        // reszta (tekst, badge, dekory) -> ukryj
    });
  });
  return '1';
})()
"""

# fade_line (PASS 4, kalibracja masazer 20.07) — KADR SCENY W PASIE = BOHATER + LINIA FADE
# (STANDARD-LANDING-SKLEPY.md §2). Komplementarny do scrim_plateau (desktop, przeswit pod tekstem)
# i img-fit (% uciecia, ale NIE mowi CO uciete). Ten check mierzy POZYCJE wbudowanej LINII FADE pliku
# sceny (przejscie foto->jednolity --paper) w RENDEROWANYM boksie pasa mobile. Sceny 1024x1536 maja
# foto w polowie kadru + fade do kremu; gdy object-position slepe (center / wciete w gore), linia fade
# wypada za wysoko -> MARTWY PAS jednolitego --paper w boksie, a karta/tresc wisi pod pustka (defekt A).
# Detekcja pasa scenowego @390: full-bleed media (>=85% szer.) object-fit:cover, host to BAND (25-80%
# wys. sekcji, NIE kafel/cala sekcja), z trescia PONIZEJ pasa. Pomiar EFEKTU pikselowo (nie implementacji):
# zrzut boksa (captureBeyondViewport, DPR1) -> najdluzszy CIAGLY pas wierszy "plaski krem" (dist do
# --paper < DEV, horiz-std < STD) jako frakcja wys. boksa. Odporny na nachodzenie karty ujemnym marginesem
# (karta zaslania sam dol -> pas kremu w SRODKU/gorze, wiec liczymy najdluzszy ciagly run GDZIEKOLWIEK,
# nie tylko od dolu). Zmierzone masazer: HEAD (naprawiony center-top/88%) {hero 0, problem 13, cta 6,
# final 5, bezk 5}% vs DEFEKT d48a8f24 (slepe center 30%/18%) {hero 31, problem 71, bezk 35, final 35}%.
FADE_JS = r"""
(function(){
  function vis(el){var cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return false;var r=el.getBoundingClientRect();return r.width>0&&r.height>0;}
  function clsOf(el){var c=el.className;return (c&&c.baseVal!==undefined)?c.baseVal:(typeof c==='string'?c:'');}
  var VW=window.innerWidth, out={cands:[], paper:getComputedStyle(document.documentElement).getPropertyValue('--paper').trim()}, idx=0;
  var secs=document.querySelectorAll('section,header');
  Array.prototype.forEach.call(secs,function(sec){
    var sr=sec.getBoundingClientRect(); if(sr.width<=0||sr.height<=0)return;
    var media=sec.querySelectorAll('picture,video,img'); var seenY=[];
    Array.prototype.forEach.call(media,function(el){
      if(!vis(el))return; var r=el.getBoundingClientRect();
      if(r.width < VW*0.85) return;                              // tylko full-bleed
      var img = el.tagName==='IMG'?el:el.querySelector('img');
      var cs = img?getComputedStyle(img):getComputedStyle(el);
      if(cs.objectFit!=='cover') return;                          // sceny=cover; contain packshoty/porownania POZA
      var host=el;                                                // podnies do full-bleed kontenera-pasa
      while(host.parentElement && host.parentElement!==sec){
        var pr=host.parentElement.getBoundingClientRect();
        if(pr.width>=VW*0.85 && Math.abs(pr.width-r.width)<12 && Math.abs(pr.height-r.height)<12){host=host.parentElement;} else break;
      }
      var hr=host.getBoundingClientRect();
      var hfrac=hr.height/sr.height; if(hfrac<0.25 || hfrac>0.80) return;   // BAND, nie kafel ani cala sekcja
      for(var i=0;i<seenY.length;i++){ if(Math.abs(seenY[i]-hr.top)<4) return; } seenY.push(hr.top);
      var below=false;                                            // tresc PONIZEJ pasa w tej sekcji?
      Array.prototype.forEach.call(sec.querySelectorAll('h1,h2,h3,p,button,a,[class*=card],[class*=copy]'),function(t){
        if(!vis(t))return; var tr=t.getBoundingClientRect();
        if(tr.top>=hr.bottom-8 && (t.textContent||'').trim().length>0) below=true;
      });
      if(!below) return;
      idx++; host.setAttribute('data-fadeprobe',String(idx));
      out.cands.push({sec:(sec.id||clsOf(sec).split(' ')[0]||'?'), idx:idx,
        x:hr.left+window.scrollX, y:hr.top+window.scrollY, w:hr.width, h:hr.height,
        objpos:cs.objectPosition});
    });
  });
  return JSON.stringify(out);
})()
"""

# scene_seam (BACKSTOP renderowy 21.07) — defekt "SZEW PELNOKADROWY": dwie SASIEDNIE sekcje z
# pelnokadrowa scena (obraz full-bleed dochodzacy do krawedzi sekcji) po TEJ SAMEJ stronie, stykajace
# sie krawedz-w-krawedz na granicy sekcji => twardy SZEW (dwa rozne zdjecia sklejone). Doktryna:
# docs/zbuduje/PRZEWODNIK-GRAFICZNY.md pkt 2 "ANTY-SZEW PELNOKADROWY" + STANDARD F1.7. Realny precedens
# (naprawiony zig-zagiem): mata problem<->prawda. Kolektor GEOMETRYCZNY (bez pikseli): dla kazdej <section>
# w kolejnosci DOM zbiera prostokat sekcji + NAJWIEKSZY kandydat-scena (img/picture/video LUB element z
# background-image url()). Twarde progi + klasyfikacja strony (left/right/full) + parowanie sasiadow =
# w Pythonie (check_scene_seam), gdzie STALE sa udokumentowane i strojalne. Wsp.: X klienta, Y stronicowe
# (top/bottom + scrollY). Guardy: pomija position:fixed (overlay grain/scrim, rect=viewport nie sekcja) i
# elementy o opacity<0.15 (dekoracyjne naloty). Sama <section> tez rozwazana (full-bleed bg-image sekcji).
SEAM_JS = r"""
(function(){
  function clsOf(el){var c=el.className;return (c&&c.baseVal!==undefined)?c.baseVal:(typeof c==='string'?c:'');}
  function vis(el){var cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return false;var r=el.getBoundingClientRect();return r.width>1&&r.height>1;}
  function bgUrl(cs){var b=cs.backgroundImage;return !!b && b!=='none' && b.indexOf('url(')>-1;}
  var SY=window.scrollY, out={secs:[], vw:window.innerWidth};
  var secs=document.querySelectorAll('section');
  Array.prototype.forEach.call(secs,function(sec,ord){
    if(!vis(sec))return;
    var sr=sec.getBoundingClientRect();
    if(sr.width<=0||sr.height<=0)return;
    var rec={sec:(sec.id||clsOf(sec).split(' ')[0]||('sec'+ord)), ord:ord,
             secLeft:sr.left, secRight:sr.right, secTop:sr.top+SY, secBottom:sr.bottom+SY,
             secW:sr.width, secH:sr.height};
    var best=null, bestArea=0;
    function consider(el,isSec){
      var cs=getComputedStyle(el);
      if(!isSec){
        if(cs.position==='fixed')return;                 // overlay (grain/scrim) — rect=viewport, nie scena sekcji
        if(parseFloat(cs.opacity||'1')<0.15)return;      // dekoracyjny nalot (grain 3%) — nie scena
        if(cs.display==='none'||cs.visibility==='hidden')return;
      }
      var tag=el.tagName.toLowerCase();
      var isMedia=(tag==='img'||tag==='picture'||tag==='video');
      if(!isMedia && !bgUrl(cs))return;
      var r=el.getBoundingClientRect();
      if(r.width<=1||r.height<=1)return;
      var covW=r.width/sr.width, covH=r.height/sr.height;
      if(covW<0.30||covH<0.30)return;                     // luzny prefiltr; TWARDE progi w Pythonie
      var area=r.width*r.height;
      if(area>bestArea){bestArea=area; best=r;}
    }
    if(bgUrl(getComputedStyle(sec))) consider(sec,true); // sama sekcja: full-bleed bg-image
    Array.prototype.forEach.call(sec.querySelectorAll('*'),function(el){consider(el,false);});
    if(best){ rec.cand={left:best.left,right:best.right,top:best.top+SY,bottom:best.bottom+SY,w:best.width,h:best.height}; }
    out.secs.push(rec);
  });
  return JSON.stringify(out);
})()
"""

def _parse_rgb(s):
    s=(s or "").strip()
    m=re.match(r'#([0-9a-fA-F]{6})$', s)
    if m:
        h=m.group(1); return (int(h[0:2],16),int(h[2:4],16),int(h[4:6],16))
    m=re.match(r'#([0-9a-fA-F]{3})$', s)
    if m:
        h=m.group(1); return (int(h[0]*2,16),int(h[1]*2,16),int(h[2]*2,16))
    m=re.match(r'rgba?\(([^)]+)\)', s)
    if m:
        p=[float(x) for x in m.group(1).split(',')[:3]]; return (p[0],p[1],p[2])
    return (246,241,231)  # fallback --paper masazer

# progi scrim_plateau (kalibracja TDD masazer 19.07: negatyw 90712e46 vs HEAD naprawiony).
# GLOWNY dyskryminator = RAMP: dE miedzy srednim kolorem lewego a prawego pasa bloku (15% szer.).
# Plateau (solidny --paper LUB dowolny jednolity panel do krawedzi bloku) = pole PLASKIE -> ramp~0.
# Miekki fade = poziomy RAMP paper->scena pod tekstem -> ramp>0. Ramp jest odporny na panel w innym
# jednolitym kolorze niz --paper (wtedy lewy=prawy=ten kolor -> ramp~0, brak false-positive).
# Zmierzone: HEAD ramp {hero .1, prob 0, bezk 0, final 0} vs DEFEKT {6.8, 2.4, 18.4, 7.7}.
SCRIM_RAMP_MIN = 1.5     # dE lewy->prawy pas > 1.5 = scrim bez plateau (przeswit pod prawa krawedzia)
SCRIM_DEV_PIXEL = 18     # euclidean RGB dist od --paper -> piksel "odbiega" (do bad_frac raportowego)

def _strip_mean(arr, a, b):
    W=arr.shape[1]; lo=int(W*a); hi=max(int(W*b), lo+1)
    return arr[:, lo:hi, :].reshape(-1,3).mean(axis=0)

def scrim_metrics(im, paper):
    arr=np.asarray(im).astype(np.float32)  # H,W,3
    p=np.array(paper,dtype=np.float32)
    dev=np.sqrt(((arr-p)**2).sum(axis=2))
    lmc=_strip_mean(arr,0.0,0.15); rmc=_strip_mean(arr,0.85,1.0)
    l_dev=float(np.sqrt(((lmc-p)**2).sum())); r_dev=float(np.sqrt(((rmc-p)**2).sum()))
    ramp=float(np.sqrt(((rmc-lmc)**2).sum()))
    return {"median_dev":round(float(np.median(dev)),1),
            "p90_dev":round(float(np.percentile(dev,90)),1),
            "bad_frac":round(float((dev>SCRIM_DEV_PIXEL).mean()),3),
            "l_dev":round(l_dev,1),"r_dev":round(r_dev,1),"ramp":round(ramp,1)}

def measure_scrim(ws):
    """Pomiar plateau scrimu na desktopie: eager-load scen, kolektor, ukrycie tekstu,
    screenshot bboxu bloku (captureBeyondViewport, DPR1), metryki pikselowe."""
    try:
        # eager-load lazy scen + rozgrzej lazyload (scroll)
        ws.call("Runtime.evaluate",{"expression":"document.querySelectorAll('img').forEach(function(i){try{i.loading='eager';}catch(e){}});window.scrollTo(0,document.body.scrollHeight);"})
        time.sleep(1.4)
        ws.call("Runtime.evaluate",{"expression":"window.scrollTo(0,0);"}); time.sleep(0.5)
        res=ws.call("Runtime.evaluate",{"expression":SCENE_JS,"returnByValue":True},timeout=30)
        info=json.loads(res.get("result",{}).get("value") or '{"cands":[],"paper":""}')
    except Exception:
        return []
    cands=info.get("cands",[]);
    if not cands: return []
    paper=_parse_rgb(info.get("paper",""))
    try:
        ws.call("Runtime.evaluate",{"expression":SCRIM_HIDE_JS,"returnByValue":True},timeout=20)
        time.sleep(0.25)
    except Exception:
        return []
    out=[]; MARGIN=16
    for c in cands:
        x=c["bx"]+MARGIN; y=c["by"]+MARGIN; w=c["bw"]-2*MARGIN; h=c["bh"]-2*MARGIN
        if w<40 or h<40: continue
        try:
            shot=ws.call("Page.captureScreenshot",{"format":"png","captureBeyondViewport":True,
                "clip":{"x":x,"y":y,"width":w,"height":h,"scale":1}},timeout=30)
            im=Image.open(io.BytesIO(base64.b64decode(shot["data"]))).convert("RGB")
        except Exception:
            continue
        m=scrim_metrics(im, paper)
        m.update({"sec":c["sec"],"bw":round(c["bw"]),"bh":round(c["bh"]),"hasScrim":c.get("hasScrim",False),
                  "paper":[int(round(v)) for v in paper]})
        out.append(m)
    return out

# progi fade_line (kalibracja TDD masazer 20.07: DEFEKT d48a8f24 vs HEAD naprawiony).
# Wiersz "plaski krem/paper" = dist do --paper < DEV I horiz-std < STD (foto: std 40-90/dev 150-320;
# fade-krem: std 0-3/dev 4-11; przejscie: std 15-20). Dead = najdluzszy CIAGLY run takich wierszy /
# wys. boksa. Zmierzone dead%: HEAD {hero 0, problem 13, cta 6, final 5, bezk 5} (max 13) vs
# DEFEKT {hero 31, problem 71, bezk 35, final 35} -> prog P1 25% daje ~12pp marginesu po obu stronach.
FADE_CREAM_DEV = 20.0    # euclid dist RGB do --paper -> wiersz kandydat na "krem"
FADE_CREAM_STD = 8.0     # horiz std wiersza ponizej = plaski (bez tekstury foto)
FADE_DEAD_P1   = 0.25    # najdluzszy ciagly pas kremu >= 25% wys. boksa = martwy pas (defekt A, P1)
FADE_B_MIN     = 0.18    # kontekst zlego kadru zeby w ogole rozwazac heurystyke gornej krawedzi (B)
FADE_TOP_STD   = 25.0    # gorne ~6% wierszy: wysoka tekstura = foto (bohater) przy krawedzi
FADE_TOP_DEV   = 60.0    # gorne wiersze daleko od --paper = nie fade, realny podmiot

def fade_metrics(im, paper):
    arr=np.asarray(im).astype(np.float32)  # H,W,3
    H,W,_=arr.shape
    p=np.array(paper,dtype=np.float32)
    lo=int(W*0.1); hi=max(int(W*0.9), lo+1)
    band=arr[:, lo:hi, :]
    row_mean=band.mean(axis=1)                          # H,3 sredni kolor wiersza
    row_dev=np.sqrt(((row_mean-p)**2).sum(axis=1))      # dist do --paper
    row_hstd=band.std(axis=1).mean(axis=1)              # pozioma tekstura wiersza (foto vs plask)
    is_cream=(row_dev<FADE_CREAM_DEV)&(row_hstd<FADE_CREAM_STD)
    best=0; bstart=0; cur=0; curs=0                     # najdluzszy ciagly run kremu (GDZIEKOLWIEK)
    for y in range(H):
        if is_cream[y]:
            if cur==0: curs=y
            cur+=1
            if cur>best: best=cur; bstart=curs
        else: cur=0
    tn=max(1,int(H*0.06))
    return {"H":H,"W":W,"dead_frac":round(best/H,3),"run_px":int(best),"run_start":int(bstart),
            "top_std":round(float(row_hstd[:tn].mean()),1),"top_dev":round(float(row_dev[:tn].mean()),1)}

def measure_fade(ws):
    """Pomiar linii fade w pasach scenowych mobile: eager-load scen, kolektor FADE_JS, screenshot
    boksu pasa (captureBeyondViewport, DPR1), metryki pikselowe najdluzszego pasa --paper + top-tekstura."""
    try:
        ws.call("Runtime.evaluate",{"expression":"document.querySelectorAll('img').forEach(function(i){try{i.loading='eager';}catch(e){}});window.scrollTo(0,document.body.scrollHeight);"})
        time.sleep(1.4)
        ws.call("Runtime.evaluate",{"expression":"window.scrollTo(0,0);"}); time.sleep(0.5)
        res=ws.call("Runtime.evaluate",{"expression":FADE_JS,"returnByValue":True},timeout=30)
        info=json.loads(res.get("result",{}).get("value") or '{"cands":[],"paper":""}')
    except Exception:
        return []
    cands=info.get("cands",[])
    if not cands: return []
    paper=_parse_rgb(info.get("paper",""))
    out=[]
    for c in cands:
        x=c["x"]; y=c["y"]; w=c["w"]; h=c["h"]
        if w<40 or h<40: continue
        try:
            shot=ws.call("Page.captureScreenshot",{"format":"png","captureBeyondViewport":True,
                "clip":{"x":x,"y":y,"width":w,"height":h,"scale":1}},timeout=30)
            im=Image.open(io.BytesIO(base64.b64decode(shot["data"]))).convert("RGB")
        except Exception:
            continue
        m=fade_metrics(im, paper)
        m.update({"sec":c["sec"],"objpos":c.get("objpos",""),"bw":round(c["w"]),"bh":round(c["h"]),
                  "paper":[int(round(v)) for v in paper]})
        out.append(m)
    return out

def load_and_analyze(target, width, height, mobile, do_scrim=False, do_fade=False, do_seam=False):
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
        val=json.loads(res.get("result",{}).get("value"))
        # scene_seam (BACKSTOP renderowy) — geometria sekcji/scen; read-only, PRZED probe/scrim (mutuja DOM)
        if do_seam:
            try:
                sres=ws.call("Runtime.evaluate",{"expression":SEAM_JS,"returnByValue":True},timeout=30)
                val["seam"]=json.loads(sres.get("result",{}).get("value") or '{"secs":[]}')
            except Exception:
                val["seam"]={"secs":[]}
        else:
            val["seam"]={"secs":[]}
        # fade_line (PASS 4) — pasy scenowe mobile; PRZED probem (probe mutuje suwaki/scroll)
        if do_fade:
            try:
                val["fade"]=measure_fade(ws)
            except Exception:
                val["fade"]=[]
        else:
            val["fade"]=[]
        # PASS 4 PROBE (mutuje stan suwakow — dlatego PO analizie DOM)
        try:
            ws.call("Runtime.evaluate",{"expression":"window.scrollTo(0,0);"}); time.sleep(0.2)
            pr=ws.call("Runtime.evaluate",{"expression":PROBE_JS,"returnByValue":True},timeout=40)
            val["probe"]=json.loads(pr.get("result",{}).get("value") or '{"sliders":[]}')
        except Exception:
            val["probe"]={"sliders":[]}
        # scrim_plateau (PASS 4) — OSTATNI krok: mutuje visibility dzieci blokow tresci
        if do_scrim:
            try:
                val["scrim"]=measure_scrim(ws)
            except Exception:
                val["scrim"]=[]
        else:
            val["scrim"]=[]
        return val
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

# ---------- PASS 4: pay-badges kanon ----------
_PAY_SSOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "docs", "zbuduje", "assets", "pay-badges.html")
def canonical_paybadges_inner():
    """Zwraca kanoniczny <div class="pay-badges">...</div> z SSOT (do auto-swap)."""
    try:
        txt=io.open(os.path.abspath(_PAY_SSOT),encoding="utf-8").read()
    except Exception:
        return None
    m=re.search(r'(<div class="pay-badges"[\s\S]*?</div>)\s*$', txt.strip())
    return m.group(1) if m else None

def check_gap(D, add, seen=None):
    """Sasiadujace bloki interakt./wizualne (rozny kind, ten sam parent) — pionowy gap <12px."""
    blocks=D.get("blocks",[])
    byp={}
    for b in blocks: byp.setdefault(b["pid"],[]).append(b)
    if seen is None: seen=set()
    for pidv,arr in byp.items():
        arr=sorted(arr,key=lambda b:b["y"])
        for i in range(len(arr)-1):
            up,lo=arr[i],arr[i+1]
            if up["kind"]==lo["kind"]: continue
            # tylko pionowe stykanie: bboxy nachodza poziomo
            ox=min(up["x"]+up["w"],lo["x"]+lo["w"])-max(up["x"],lo["x"])
            if ox<=8: continue
            gap=lo["y"]-(up["y"]+up["h"])
            if gap<0 or gap>=12: continue
            key=(up["sec"],up["kind"]+">"+lo["kind"])
            if key in seen: continue
            seen.add(key)
            sev="P1" if gap<8 else "P2"
            desc="przyklejone" if gap<8 else "ciasno"
            add("spacing",up["sec"]+" / ."+ (up["cls"] or up["kind"])+" -> ."+(lo["cls"] or lo["kind"]),
                "Bloki %s i %s: pionowy odstep %dpx (%s) bez intencji grupujacej"%(up["kind"],lo["kind"],gap,desc),
                sev,"Dodaj >=12px odstepu lub jawny wspolny wrapper grupujacy","skrypt")

def check_crop(D, add, fetch):
    """object-fit:cover crop (>25%) + upscaling DPR2 ((rw*2)/nw)."""
    for im in D.get("imgs",[]):
        src=im["src"]
        if not src or src.startswith("data:"): continue
        pil,h,size=fetch(src)
        base=src.split("/")[-1].split("?")[0]
        if pil is None: continue
        nw,nh=pil.size; rw,rh=im["rw"],im["rh"]
        if nw<=0 or rw<=0 or rh<=0: continue
        if im["objfit"]=="cover":
            ia=nw/nh; ba=rw/rh
            cf=1-(min(ia,ba)/max(ia,ba))
            if cf>0.25:
                # Kalibracja 19.07 (precedens §9 + AUTORYTET img-fit): static crop-lint NIE widzi object-position
                # (dokladnie po to zbudowano img-fit render-gate — SEKCJA-Z-MAKIETY, incydent Drapek 18.07). Gdy pos
                # STEROWANY (nie center) -> podmiot kadrowany intencjonalnie -> P2 (img-fit rozstrzyga hard-FAIL:
                # >=40% przy pos DOMYSLNYM = FAIL). Center + duze ucicie (>=40%) = slepy crop -> P1.
                op=(im.get("objpos") or "50% 50%").strip().lower()
                steered = op not in ("50% 50%","center","center center","50%","")
                sev = "P1" if ((not steered) and cf>=0.40) else "P2"
                add("obrazy",im["sec"]+" / "+base,
                    "Crop w kaflu cover: %d%% obrazu przyciete (AR obrazu %.2f vs box %.2f; object-position=%s)"%(round(cf*100),ia,ba,op),
                    sev,"Podmien AR kafla albo steruj object-position (img-fit rozstrzyga hard-FAIL)","skrypt")
        ups2=(rw*2)/nw
        if ups2>1.3:
            # DPR2-upscaling: obrazy object-fit:cover (pelnoekranowe sceny + kafle AI) sa KADROWANE i
            # ograniczone natywna rozdzielczoscia generatora (gpt-image-2 <=1536) + budzetem wagi (WAGI-gate)
            # -> DPR2/retina crispness = swiadomy tradeoff, SPOJNIE z checkiem DPR1 nizej (linia ~537), ktory
            # JUZ wyklucza cover ("objfit!='cover'"). Wiec cover -> P2 (informacyjny, WIDOCZNY, nie hard-FAIL).
            # Niecover (tresciowe, realnie podmienialne na wieksza rozdzielczosc): >1.6 = P1.
            # Kalibracja 18.07 (RETRO §1, precedens sekcja-diff): nie hard-FAIL WIERNEGO landingu na
            # niedyskryminujacej metryce; realny defekt lapia WAGI + WIERNOSC + crop-AR (osobny check wyzej).
            # Kalibracja 19.07 (rozszerza §9 na non-cover): DPR1-upscaling (bardziej dotkliwy — rozmyty @1x)
            # JUZ jest P2 (linia ~545); trzymanie DPR2 (@2x retina) jako P1 dla non-cover bylo NIESPOJNE
            # (mniej dotkliwy przypadek surowszy). cmp-* to cropy z makiety AI (rekwizyt-konkurent bez zrodla
            # wyzszej rozdz.) — resolution-ceiling generatora, jak sceny cover. Realny defekt lapia WAGI+crop-AR+WIERNOSC.
            sev = "P2"
            add("obrazy",im["sec"]+" / "+base,
                "Upscaling przy DPR2: render*2 (%dpx) / natural (%dpx) = %.2fx"%(rw*2,nw,ups2),
                sev,"Podmien na wieksza rozdzielczosc (>=2x szerokosci renderu)","skrypt")

def check_scrim_plateau(D, add):
    """Sekcje scenowe desktop: scena przeswituje pod blokiem tresci = scrim bez plateau (F3.1b)."""
    for m in D.get("scrim",[]):
        if m["ramp"]<=SCRIM_RAMP_MIN: continue
        add("obrazy", m["sec"]+" / scrim (blok %dx%dpx)"%(m["bw"],m["bh"]),
            "Scena przeswituje pod blokiem tresci — scrim bez plateau (STANDARD F3.1b): prawa krawedz bloku odbiega od --paper rgb%s o dE=%.1f, ramp lewy->prawy pas=%.1f (plateau=~0), bad_frac(dev>%d)=%.0f%%, p90_dev=%.1f"
              %(tuple(m.get("paper",[])), m["r_dev"], m["ramp"], SCRIM_DEV_PIXEL, m["bad_frac"]*100, m["p90_dev"]),
            "P1","Zamien miekki gradient na PLATEAU: solidny var(--paper) od 0%% do KRAWEDZI bloku tresci (~46-50%%), fade dopiero za nia. Self-check: krawedz bloku lezy na scrimie o opacity >=~0.9 (F3.1b)","skrypt")

def check_fade_line(D, add):
    """Pasy scenowe mobile: linia fade zle skadrowana -> martwy pas kremu (P1); bohater przy gornej
    krawedzi (heurystyka, P2). STANDARD §2 KADR SCENY = BOHATER + LINIA FADE."""
    for m in D.get("fade",[]):
        rs=m["run_start"]; H=m["H"]; run=m["run_px"]
        where = "u góry" if rs < H*0.15 else ("u dołu" if rs+run > H*0.85 else "w środku")
        # (A) MARTWY PAS KREMU — pewny, pikselowy, P1
        if m["dead_frac"]>=FADE_DEAD_P1:
            add("obrazy", m["sec"]+" / scena w pasie mobile (blok %dx%dpx)"%(m["bw"],m["bh"]),
                "Scena w boksie: martwy pas jednolitego --paper rgb%s ~%.0f%% wysokosci boksa (%s) — linia fade zle skadrowana, tresc/karta wisi pod pustka / bohater nie wypelnia kadru (object-position=%s; STANDARD §2 KADR=BOHATER+LINIA FADE)"
                  %(tuple(m.get("paper",[])), m["dead_frac"]*100, where, m["objpos"]),
                "P1","Ustaw object-position SWIADOMIE wzgl. bohatera i linii fade pliku: bohater CALY w kadrze, wbudowana linia fade w dolnych ~15-25%% boksa, tresc WYNURZA sie z przejscia (nie 'center'/slepo). Self-check @390: pas jednolitego --paper <=~20%% boksa","skrypt")
        # (B) BOHATER PRZY GORNEJ KRAWEDZI — heurystyka (top-tekstura + kontekst zlego kadru), P2
        if m["dead_frac"]>=FADE_B_MIN and m["top_std"]>=FADE_TOP_STD and m["top_dev"]>=FADE_TOP_DEV:
            add("obrazy", m["sec"]+" / scena w pasie mobile (blok %dx%dpx)"%(m["bw"],m["bh"]),
                "Bohater dochodzi do GORNEJ krawedzi boksa (top-tekstura std=%.0f, dev-do-paper=%.0f = foto/podmiot przy samej krawedzi) przy zle skadrowanym pasie kremu (~%.0f%%) — prawdopodobne uciecie glowy/podmiotu u gory. HEURYSTYKA — potwierdz zrzutem @390 (%%uciecia nie zastepuje oczu, §2)"%(m["top_std"],m["top_dev"],m["dead_frac"]*100),
                "P2","Podnies object-position tak, by bohater (twarz/produkt) byl CALY w kadrze u gory; zweryfikuj zrzutem per viewport","skrypt")

# progi scene_seam (BACKSTOP "SZEW PELNOKADROWY", 21.07 — PRZEWODNIK-GRAFICZNY pkt 2 + STANDARD F1.7).
# Detekcja GEOMETRYCZNA (bounding rects, bez pikseli). Progi LUZNE, latwe do strojenia:
SEAM_EDGE_TOL = 6      # px — obraz "dotyka" krawedzi sekcji (pionowej: left/right; poziomej: top/bottom) gdy odleglosc <= tego
SEAM_W_MIN    = 0.50   # frakcja szer. sekcji — scena "pelnokadrowa" gdy szer. obrazu >= tego (split ~0.55, full ~1.0)
SEAM_H_MIN    = 0.85   # frakcja wys. sekcji — full-bleed w pionie gdy wys. obrazu >= tego
SEAM_SEAM_TOL = 6      # px — dolna krawedz GORNEGO obrazu ~= gorna krawedz DOLNEGO = realny styk (szew) na granicy sekcji
SEAM_XOVL_MIN = 0.50   # frakcja mniejszej szer. obrazu — nachodzenie w poziomie (ta sama kolumna); zig-zag (prawo<->lewo) daje ~0

def _seam_side(rec):
    """Klasyfikacja sceny sekcji: 'left'|'right'|'full' gdy sekcja ma PELNOKADROWA scene (obraz dochodzacy
    do gornej I dolnej krawedzi sekcji oraz do co najmniej jednej PIONOWEJ krawedzi), inaczej None.
    Sekcja kontenerowana (karta z marginesem papieru: max-width+margin auto, demo-stage, zestaw-shell,
    galeria) NIE dotyka pionowych krawedzi -> None (papier ja izoluje)."""
    c=rec.get("cand")
    if not c: return None
    secW=rec["secW"]; secH=rec["secH"]
    if secW<=0 or secH<=0: return None
    if c["w"]/secW < SEAM_W_MIN or c["h"]/secH < SEAM_H_MIN: return None
    touchL=(c["left"]-rec["secLeft"])<=SEAM_EDGE_TOL
    touchR=(rec["secRight"]-c["right"])<=SEAM_EDGE_TOL
    touchT=(c["top"]-rec["secTop"])<=SEAM_EDGE_TOL
    touchB=(rec["secBottom"]-c["bottom"])<=SEAM_EDGE_TOL
    if not (touchT and touchB): return None          # full-bleed w PIONIE: musi dochodzic do gornej I dolnej krawedzi
    if touchL and touchR: return "full"              # pelna szerokosc (dotyka obu pionowych krawedzi)
    if touchL: return "left"
    if touchR: return "right"
    return None                                       # nie dotyka zadnej pionowej krawedzi = kontenerowana

def check_scene_seam(D, add):
    """BACKSTOP renderowy 'SZEW PELNOKADROWY': dwie SASIEDNIE (w DOM) sekcje z pelnokadrowa scena po TEJ
    SAMEJ stronie, stykajace sie krawedz-w-krawedz na granicy sekcji => twardy szew. Fix = ZIG-ZAG lub
    sekcja rozdzielajaca (PRZEWODNIK-GRAFICZNY pkt 2 ANTY-SZEW PELNOKADROWY + STANDARD F1.7)."""
    secs=D.get("seam",{}).get("secs",[])
    scenes=[(rec, _seam_side(rec)) for rec in secs]   # kolejnosc DOM (SEAM_JS zwraca w kolejnosci dokumentu)
    for i in range(len(scenes)-1):
        recA,sideA=scenes[i]; recB,sideB=scenes[i+1]
        if not sideA or not sideB: continue
        # (1) ta sama strona (lub jedna 'full' pelnoszeroka — laczy sie z dowolna sasiednia po wspolnej kolumnie)
        if not (sideA==sideB or sideA=="full" or sideB=="full"): continue
        cA=recA["cand"]; cB=recB["cand"]
        # (2) realny styk PIONOWY: dol GORNEGO obrazu ~= gora DOLNEGO (granica sekcji); gap = sekcja/margines rozdzielajacy -> brak szwu
        up,lo=(cA,cB) if cA["top"]<=cB["top"] else (cB,cA)
        if abs(up["bottom"]-lo["top"])>SEAM_SEAM_TOL: continue
        # (3) nachodzenie w POZIOMIE (ta sama kolumna); zig-zag prawo<->lewo daje ~0 -> brak szwu
        ovl=min(cA["right"],cB["right"])-max(cA["left"],cB["left"])
        if ovl < SEAM_XOVL_MIN*min(cA["w"],cB["w"]): continue
        side=sideA if sideA==sideB else ("full<->"+(sideB if sideA=="full" else sideA))
        add("obrazy", recA["sec"]+" <-> "+recB["sec"],
            "scene_seam: sekcje %s<->%s — pelnokadrowe sceny po tej samej stronie (%s) stykaja sie w szew (dwa rozne zdjecia sklejone krawedz-w-krawedz na granicy sekcji; spotegowane gdy sceny roznia sie swiatlem/skala). PRZEWODNIK-GRAFICZNY pkt 2 ANTY-SZEW PELNOKADROWY + STANDARD F1.7"
              %(recA["sec"],recB["sec"],side),
            "P1","ZIG-ZAG (obraz raz PRAWO raz LEWO — na granicy zawsze foto<->papier, nie foto<->foto) ALBO sekcja ROZDZIELAJACA (pasek zaufania/karta na papierze) miedzy nimi; ostatecznie skonteneruj jedna (rounded card + margines papieru). Karta sekcji zapisuje STRONE, przewodnik projektuje naprzemiennosc OD RAZU (pkt 2)","skrypt")

def check_interactive(D, add, vw):
    """Hit-test + martwa interakcja per viewport."""
    for s in D.get("probe",{}).get("sliders",[]):
        loc="%s / #%s (vw%d)"%(s["sec"],s["id"],vw)
        if not s["topIsControl"]:
            add("interakcje",loc,"Kontrolka zaslonieta: elementFromPoint(srodka) = %s, nie sama kontrolka"%(s["topEl"]),
                "P0","Podnies z-index/pointer-events kontrolki albo usun nakladke nad suwakiem","skrypt")
        elif str(s["pe"])=="none":
            add("interakcje",loc,"Kontrolka ma pointer-events:none — nieklikralna","P0","Ustaw pointer-events:auto na kontrolce","skrypt")
        if s["changed"]==0:
            add("interakcje",loc,"Martwa interakcja: driven-property identyczna przy min i max (przesuniecie nic nie zmienia w %d monitorowanych elementach)"%(s["monitored"]),
                "P1","Suwak musi sterowac widoczna zmiana (--t/opacity/transform); patrz F5 wzorzec-matka #3","skrypt")

def check_text_overflow(D, add, vw):
    # feedback Tomka 22.07 (pille hero Ugniatka): tekst NIE MOZE wystawac z kapsuly ani byc
    # uciety — kazdy hit = P1; fix z reguly: mniejsza czcionka i/lub white-space:normal.
    seen = set()
    for t in D.get("txtoverflow", [])[:12]:
        key = (t.get("sec"), t.get("cls"), t.get("txt"))
        if key in seen:
            continue
        seen.add(key)
        add("kapsuly", "%s @%d" % (t.get("sec") or "?", vw),
            "tekst wystaje/uciety w .%s: '%s' (o %dpx)"
            % (t.get("cls") or "?", t.get("txt", ""), t.get("ov", 0)),
            "P1", "zmniejsz font-size / zdejmij white-space:nowrap / poszerz kapsule", "skrypt")


def paybadges_guard(D, add):
    """Imitacje marek platnosci poza SSOT: klaster=P0, pojedynczy=P1, brak kanonu przy CTA=P2.
    Zwraca liste pid-ow klastrow do auto-swap (--fix)."""
    chips=D.get("paychips",[])
    byp={}
    for c in chips: byp.setdefault(c["pid"],[]).append(c)
    clusters=[]
    for pidv,arr in byp.items():
        toks=", ".join(sorted(set(c["txt"] for c in arr)))
        sec=arr[0]["sec"]; cls=arr[0]["cls"]
        if len(arr)>=2:
            clusters.append(pidv)
            add("obrazy",sec+" / ."+(cls or "?"),
                "Klaster imitacji pay-badges (%d chipow: %s) POZA kanonicznym blokiem SSOT"%(len(arr),toks),
                "P0","Podmien caly klaster na blok z docs/zbuduje/assets/pay-badges.html (--fix auto-swap)","skrypt")
        else:
            add("tresc",sec+" / \""+arr[0]["txt"]+"\"",
                "Pojedyncza imitacja marki platnosci ('%s') poza SSOT — moze byc w prozie"%(arr[0]["txt"]),
                "P1","Zweryfikuj recznie: chip->kanon SSOT; wystapienie w prozie zostaw","skrypt")
    ctas=[b for b in D.get("blocks",[]) if b["kind"]=="cta"]
    if ctas and not D.get("hasPayBadges"):
        add("tresc","global","Brak kanonicznego bloku .pay-badges przy CTA (SSOT pay-badges.html)","P2",
            "Wklej kanoniczny blok pay-badges pod glownym CTA","skrypt")
    return clusters

PAYSWAP_JS = r"""
(function(){
  var PAYTOK=['blik','visa','mastercard','mc','karta','przelew'];// 'za pobraniem' USUNIETE (kalibracja 19.07): COD to metoda platnosci (Etap5 COD-first, manifest grep_forbidden 'za pobraniem DOZWOLONE'), nie imitacja marki karty wymagajaca SVG-logo
  function isChip(el){
    if(el.closest('.pay-badges'))return false;
    var tx=(el.textContent||'').trim(); if(tx.length>14)return false;
    if(PAYTOK.indexOf(tx.toLowerCase())<0)return false;
    var kids=el.children,onlySvg=true;
    for(var i=0;i<kids.length;i++){if(kids[i].tagName.toLowerCase()!=='svg'){onlySvg=false;break;}}
    if(!(kids.length===0||onlySvg))return false;
    var cs=getComputedStyle(el);
    return (cs.borderStyle!=='none'&&parseFloat(cs.borderTopWidth)>0)||parseFloat(cs.borderTopLeftRadius)>=6||(cs.backgroundColor&&cs.backgroundColor!=='rgba(0, 0, 0, 0)');
  }
  var chips=[].filter.call(document.querySelectorAll('body *'),isChip);
  var groups=new Map();
  chips.forEach(function(c){var p=c.parentElement;if(!groups.has(p))groups.set(p,[]);groups.get(p).push(c);});
  var res=[];
  groups.forEach(function(arr,parent){ if(arr.length>=2){ res.push(parent.outerHTML); } });
  return JSON.stringify(res);
})()
"""

def autoswap_paybadges(target):
    """--fix: podmien kontenery-klastry imitacji na kanoniczny blok SSOT (innerHTML kontenera).
    Zwraca (n_swapped, notatki)."""
    if target.startswith(("http://","https://")):
        return 0, ["--fix dziala tylko na pliku lokalnym (nie URL)"]
    canon=canonical_paybadges_inner()
    if not canon:
        return 0, ["nie znaleziono kanonicznego bloku w SSOT pay-badges.html"]
    chrome=chrome_path(); port=free_port(); profile=tempfile.mkdtemp(prefix="swap-")
    url="file:///"+os.path.abspath(target).replace("\\","/")
    args=[chrome,"--headless=new","--disable-gpu","--hide-scrollbars","--no-first-run",
          "--no-default-browser-check","--disable-extensions","--force-device-scale-factor=1",
          "--remote-debugging-port=%d"%port,"--user-data-dir="+profile,"--window-size=1280,900",url]
    proc=subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    outers=[]
    try:
        if not wait_debugger(port): return 0,["debugger nie wstal"]
        tabs=[t for t in cdp_get(port,"/json") if t.get("type")=="page"]
        ws=WS(tabs[0]["webSocketDebuggerUrl"]); ws.call("Runtime.enable"); time.sleep(1.5)
        r=ws.call("Runtime.evaluate",{"expression":PAYSWAP_JS,"returnByValue":True},timeout=30)
        outers=json.loads(r.get("result",{}).get("value") or "[]")
    finally:
        proc.terminate()
        try: proc.wait(timeout=5)
        except Exception: proc.kill()
        shutil.rmtree(profile,ignore_errors=True)
    if not outers: return 0, ["brak klastrow do podmiany"]
    src=io.open(os.path.abspath(target),encoding="utf-8").read()
    notes=[]; n=0
    for outer in outers:
        m=re.match(r'\s*(<[a-zA-Z][^>]*>)([\s\S]*)(</[a-zA-Z0-9]+>)\s*$', outer)
        if not m:
            notes.append("nie sparsowano outerHTML kontenera — podmien recznie"); continue
        open_tag,_,close_tag=m.group(1),m.group(2),m.group(3)
        new_outer=open_tag+"\n  "+canon+"\n"+close_tag
        if outer in src:
            src=src.replace(outer,new_outer,1); n+=1; notes.append("swap OK (dokladne dopasowanie)")
        else:
            # fuzzy: dopasuj po znormalizowanych bialych znakach
            def norm(s): return re.sub(r'\s+',' ',s).strip()
            no=norm(outer); done=False
            # przeszukaj kandydatow open_tag..close_tag w zrodle
            for mm in re.finditer(re.escape(open_tag.split(' ')[0]), src):
                pass
            notes.append("outerHTML nie znaleziony doslownie w zrodle (roznice formatowania) — podmien recznie klaster: "+no[:80])
    if n:
        io.open(os.path.abspath(target),"w",encoding="utf-8").write(src)
    return n, notes

def main():
    target=sys.argv[1]
    out=None
    if "--out" in sys.argv: out=sys.argv[sys.argv.index("--out")+1]
    do_fix="--fix" in sys.argv
    findings=[]
    def add(w,loc,prob,sev,fix,by):
        findings.append({"warstwa":w,"lokalizacja":loc,"problem":prob,"severity":sev,"fix":fix,"wykryte_przez":by})

    # PASS 4 --fix: auto-swap klastrow imitacji pay-badges na kanon PRZED analiza (re-run na czystym)
    if do_fix:
        nsw,notes=autoswap_paybadges(target)
        print("PAYBADGES --fix: podmieniono %d klastrow. %s"%(nsw,"; ".join(notes[:4])))

    D_desk=load_and_analyze(target,1280,900,False,do_scrim=True,do_seam=True)
    D_mob=load_and_analyze(target,390,844,True,do_fade=True)

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
        if t.get("overmedia"): continue  # scrim/gradient/na-obrazie -> worst-pixel + vision, nie solid-bg
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
        # dedup: P0 TYLKO gdy OBA wystapienia to duze kadry (>=320px) w roznych sekcjach
        # narracyjnych — pelnoprawna scena zduplikowana. Powtorka jako MINIATURA-ODWOLANIE
        # (favicon, thumb rekapu/kasy/sticky, <320px) lub packshot w #zamow (karta produktu
        # przy kasie = kontrakt LL-046) — P2 informacyjne, nie blokuje.
        if h in hashes:
            psec,pbase,prw=hashes[h]
            duza_para = rw>=320 and prw>=320
            kasa = im["sec"]=="zamow" or psec=="zamow"
            if duza_para and not kasa:
                add("obrazy",im["sec"]+" / "+base,f"DUPLIKAT assetu (hash {h[:6]}) — ten sam obraz co w sekcji '{psec}' ({pbase})","P0","Ten sam kadr jako scena w 2 sekcjach — uzyj innego","skrypt")
            else:
                add("obrazy",im["sec"]+" / "+base,f"Powtorka assetu jako miniatura/odwolanie ({rw}px vs {prw}px w '{psec}')","P2","Potwierdz celowosc (rekap/brand/karta kasy = OK)","skrypt")
        else:
            hashes[h]=(im["sec"],base,rw)
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
    # obrazy w kontenerach fixed/sticky (topbar, sticky-buy) nachodza na flow Z NATURY — poza checkiem
    photos=[im for im in D_desk["imgs"] if im["nw"]>0 and "scene" not in (im["cls"] or "") and not im.get("infixed")]
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

    # ===== PASS 4 — DETALE OSADZENIA (FINALNY-PASS §PASS 4) =====
    gap_seen=set()
    check_gap(D_desk, add, gap_seen)
    check_gap(D_mob, add, gap_seen)
    check_crop(D_desk, add, fetch_img)
    check_interactive(D_desk, add, 1280)
    check_interactive(D_mob, add, 390)
    check_text_overflow(D_desk, add, 1280)
    check_text_overflow(D_mob, add, 390)
    paybadges_guard(D_desk, add)
    check_scrim_plateau(D_desk, add)
    check_fade_line(D_mob, add)
    check_scene_seam(D_desk, add)

    result={"findings":findings,"raw":{"fonts":D_desk["fonts"],"sizes":D_desk["sizes"],
            "n_imgs":len(D_desk["imgs"]),"sticky":D_desk.get("sticky"),
            "n_blocks":len(D_desk.get("blocks",[])),"n_paychips":len(D_desk.get("paychips",[])),
            "sliders":D_desk.get("probe",{}).get("sliders",[]),
            "scrim":D_desk.get("scrim",[]),"fade":D_mob.get("fade",[]),
            "n_seam_secs":len(D_desk.get("seam",{}).get("secs",[]))}}
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

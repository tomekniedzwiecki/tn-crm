#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
img-fit.py — audyt DOPASOWANIA obrazów do boksów (per viewport).

Problem (Tomek 18.07): obraz osadzony w boksie o INNYM aspekcie jest przycinany przez
object-fit:cover; domyślny object-position:center ucina najważniejszą część (produkt/twarz).
Ten skrypt mierzy dla KAŻDEGO <img>: natywny AR vs AR boksa → % ucięcia + oś, oraz
object-fit/position. Flaguje obrazy, gdzie ucięcie jest znaczące — wtedy trzeba albo
dopasować aspect-ratio boksa do obrazu, albo ustawić object-position na kluczową część.

Użycie:
  img-fit.py <index.html|url> [--viewport 390] [--viewport 1280] [--warn 25] [--fail 40]
Exit: 0 = OK/tylko WARN · 1 = ≥1 obraz z ucięciem ≥ --fail (cover, bez alibi)

Wynik NIE jest wyrocznią sam w sobie: po flagach ZAWSZE obejrzyj crop boksa (sekcja-diff
albo render) i oceń, CZY ucięta jest ważna treść. Sceny-tło (hero/problem/final) mogą mieć
wysokie ucięcie, jeśli object-position pokazuje produkt/psa — to jest OK (dół/bok bez treści).
"""
import importlib.util, os, sys, tempfile, subprocess, json, time, shutil, argparse

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("sekcja_diff", os.path.join(_HERE, "sekcja-diff.py"))
_m = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_m)

for _s in (sys.stdout, sys.stderr):
    try: _s.reconfigure(encoding="utf-8")
    except Exception: pass

IMG_JS = r"""(function(){
  var out=[];
  document.querySelectorAll('img').forEach(function(im){
    var r=im.getBoundingClientRect();
    if(r.width<24||r.height<24) return;
    var nW=im.naturalWidth, nH=im.naturalHeight;
    var sec=im.closest('section'); var sid=sec?sec.id:'?';
    var name=(im.currentSrc||im.src).split('/').pop().split('?')[0];
    if(!nW||!nH){ out.push({sid:sid,src:name,err:'not-loaded'}); return; }
    var cs=getComputedStyle(im); var fit=cs.objectFit, pos=cs.objectPosition;
    var arImg=nW/nH, arBox=r.width/r.height, cutPct=0, axis='';
    if(fit==='cover'){
      if(arImg>arBox+0.01){ cutPct=Math.round((1-arBox/arImg)*100); axis='poziom(L/P)'; }
      else if(arImg<arBox-0.01){ cutPct=Math.round((1-arImg/arBox)*100); axis='pion(G/D)'; }
    }
    out.push({sid:sid,src:name,nW:nW,nH:nH,boxW:Math.round(r.width),boxH:Math.round(r.height),
      arImg:+arImg.toFixed(2),arBox:+arBox.toFixed(2),fit:fit,pos:pos,cutPct:cutPct,axis:axis});
  });
  return JSON.stringify(out);
})()"""

def measure(target, width, mobile):
    chrome=_m.chrome_path(); port=_m.free_port(); profile=tempfile.mkdtemp(prefix="imgfit-")
    url = target if target.startswith(("http://","https://")) else "file:///"+os.path.abspath(target).replace("\\","/")
    vh = 844 if mobile else 900
    args=[chrome,"--headless=new","--disable-gpu","--hide-scrollbars","--no-first-run",
          "--no-default-browser-check","--disable-extensions","--force-device-scale-factor=1",
          "--remote-debugging-port=%d"%port,"--user-data-dir="+profile,"--window-size=%d,%d"%(width,vh),url]
    proc=subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        if not _m.wait_debugger(port): raise SystemExit("debugger nie wstal")
        tabs=[t for t in _m.cdp_get(port,"/json") if t.get("type")=="page"]
        ws=_m.WS(tabs[0]["webSocketDebuggerUrl"]); ws.call("Page.enable"); ws.call("Runtime.enable")
        ws.call("Emulation.setDeviceMetricsOverride",{"width":width,"height":vh,"deviceScaleFactor":1,"mobile":mobile})
        time.sleep(2.2)
        ws.call("Runtime.evaluate",{"expression":_m.FORCE_FINAL})
        ws.call("Runtime.evaluate",{"expression":"window.scrollTo(0,document.body.scrollHeight);"}); time.sleep(1.8)
        ws.call("Runtime.evaluate",{"expression":"window.scrollTo(0,0);"}); time.sleep(1.0)
        res=ws.call("Runtime.evaluate",{"expression":IMG_JS,"returnByValue":True},timeout=40)
        return json.loads(res.get("result",{}).get("value"))
    finally:
        proc.terminate()
        try: proc.wait(timeout=5)
        except Exception: proc.kill()
        shutil.rmtree(profile,ignore_errors=True)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("target", help="sciezka do index.html lub URL")
    ap.add_argument("--viewport", type=int, action="append", default=None, help="szerokosc(i); domyslnie 390 + 1280")
    ap.add_argument("--warn", type=int, default=25); ap.add_argument("--fail", type=int, default=40)
    a=ap.parse_args()
    viewports = a.viewport or [390, 1280]
    worst=0; nfail=0
    for w in viewports:
        mobile = w <= 600
        print("="*84); print("VIEWPORT %d  (%s)"%(w, "mobile" if mobile else "desktop")); print("="*84)
        for im in measure(a.target, w, mobile):
            if im.get('err'):
                print("  [%-11s] %-24s !! %s"%(im['sid'],im['src'],im['err'])); continue
            cut=im['cutPct']; worst=max(worst,cut)
            is_center = im['pos'].strip() in ('50% 50%','center','50% center','center 50%')
            tag=""
            if cut>=a.fail and is_center:
                tag=" <<<< FAIL (center + duze ciecie = niedopatrzenie — dopasuj aspect boksa LUB object-position)"; nfail+=1
            elif cut>=a.warn:
                tag=" <-- WARN (sprawdz wizualnie ktora czesc widoczna; scena-tlo z ustawionym pos = OK)"
            print("  [%-11s] %-22s img %dx%d(AR%s) box %dx%d(AR%s) %s pos:%s ciete:%d%%%s%s"%(
                im['sid'],im['src'],im['nW'],im['nH'],im['arImg'],im['boxW'],im['boxH'],im['arBox'],
                im['fit'],im['pos'],cut,im['axis'],tag))
    print("="*84)
    print("PODSUMOWANIE: max ucięcie %d%% · FAIL(≥%d%%, cover): %d"%(worst,a.fail,nfail))
    print("⚠ Po flagach ZAWSZE obejrzyj crop boksa — sceny-tło z dobrym object-position są OK.")
    return 1 if nfail>0 else 0

if __name__=="__main__":
    sys.exit(main())

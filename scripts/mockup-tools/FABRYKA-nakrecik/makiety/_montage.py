# -*- coding: utf-8 -*-
import os, io, sys, json
from PIL import Image
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
idx = json.load(io.open(os.path.join(HERE,"_index.json"),encoding="utf-8"))
desk = [it["name"] for it in idx if it["size"]=="1536x1024"]
mob  = [it["name"] for it in idx if it["size"]=="1024x1536"]

def sheet(names, cols, cellw, out):
    rows = (len(names)+cols-1)//cols
    # compute cell height from first image aspect
    im0 = Image.open(os.path.join(HERE,names[0]+".png"))
    cellh = int(cellw * im0.height/im0.width)
    pad=10; lab=22
    W = cols*cellw + (cols+1)*pad
    H = rows*(cellh+lab) + (rows+1)*pad
    canvas = Image.new("RGB",(W,H),(245,243,239))
    from PIL import ImageDraw
    d = ImageDraw.Draw(canvas)
    for i,n in enumerate(names):
        r,c = divmod(i,cols)
        x = pad + c*(cellw+pad); y = pad + r*(cellh+lab+pad)
        im = Image.open(os.path.join(HERE,n+".png")).convert("RGB").resize((cellw,cellh))
        canvas.paste(im,(x,y))
        d.text((x+4,y+cellh+4), n, fill=(20,20,20))
    canvas.save(os.path.join(HERE,out))
    print("OK", out, canvas.size, len(names),"cells")

sheet(desk,4,760,"_KRYTYK-desktop.png")
sheet(mob,4,520,"_KRYTYK-mobile.png")

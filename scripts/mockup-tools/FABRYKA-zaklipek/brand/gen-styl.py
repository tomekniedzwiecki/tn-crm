# -*- coding: utf-8 -*-
"""Styl-master ZAKLIPEK (przyklipsowy hub USB) — 1 plansza DNA serii (3:2).
Kanal: LOKALNY OpenAI /v1/images/generations gpt-image-2 quality=HIGH (BEZ referencji —
styl-master ref = {type:'ref'} lub bez refu+hexy, NIGDY {type:'product'}; produkt achromatyczny,
akcent wyprowadzony z NIEBIESKICH wnetrz USB 3.0 -> hexy w prompcie). Fallback: edge wf2-gen MEDIUM.
PLANSZA (nie hero-scena): paleta z rolami + 2 fonty z kontrastem (Bricolage Grotesque display /
Figtree text) + JEDEN radius 14px + ikony outline ink + trust-pill + chlodna warstwowa glebia +
sygnatura S3 "linia krawedzi" + ticki skali 5-28 mm + DUZE LICZBY (4 porty · 5 Gbps · 5-28 mm) +
kafel PRODUKT (srebrny aluminiowy hub na zacisku, 4 porty USB-A) + kafel SWIAT (czysty desk-setup)."""
import os, sys, io, re, json, time, base64, urllib.request
import requests

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "00-styl-master.png")
ENV = io.open(r"c:/repos_tn/tn-crm/.env", encoding="utf-8-sig", errors="ignore").read()
OPENAI_KEY = re.search(r"^OPENAI_API_KEY=(.+)$", ENV, re.M).group(1).strip()
WF2_SECRET = re.search(r"^WF2_GEN_SECRET=(.+)$", ENV, re.M).group(1).strip()
EDGE = "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen"

PROMPT = (
 "STYLE-MASTER SPECIMEN BOARD (3:2 landscape) for a Polish e-commerce landing-page series — a "
 "DESIGN-SYSTEM BOARD, NOT a hero scene: an organised specimen sheet on a COOL near-white / "
 "platinum page background #F7F8FA presenting the complete visual DNA of the series, theme "
 "\"Krawedz, ktora trzyma wszystko pod reka\" (the edge that keeps everything within reach — a "
 "clip-on USB hub living on a clean modern desk edge; brushed silver aluminium, graphite and "
 "USB SuperSpeed blue in cool daylight), laid out in labelled tiles with generous whitespace. "
 "GRID OF TILES: "
 "(1) PALETA tile: swatch chips with hex labels #F7F8FA, #EEF0F4, #E1E5EC, #1C2530, #38424E, "
 "#D5DAE2 and ONE clear USB SuperSpeed AZURE chip #0A6EBD marked as the single accent "
 "(\"AKCENT — JEDYNY\"). "
 "(2) TYPOGRAFIA tile: a big display specimen word \"Zaklipek\" and a BIG price \"34,90 zl\" set "
 "in Bricolage Grotesque (a characterful engineered grotesk, heavy 800), an ALL-CAPS tracked "
 "eyebrow \"PORTY POD REKA, NA KRAWEDZI\" and one body line \"Przyklipsowy hub — 4 porty USB 3.0 "
 "na krawedzi biurka\" set in Figtree (a clean humanist sans, 400/500) — the two typefaces clearly "
 "CONTRAST; directly UNDER the word \"Zaklipek\" a thin 1px horizontal EDGE-LINE with small "
 "calibration tick marks and a tiny \"5–28 mm\" scale label in azure #0A6EBD (the publishing "
 "signature, not an italic swash). Font labels: \"Bricolage Grotesque (800) — naglowki, liczby, "
 "CTA\" and \"Figtree (400/500) — tekst, specyfikacja, etykiety\". "
 "(3) SYGNATURA tile: demonstrate the signature \"S3 linia krawedzi + ticki skali\" — a continuous "
 "1px hairline drawn like a desk edge running across the tile, carrying engraved calibration tick "
 "marks and a caliper \"5–28 mm\" scale (one active tick highlighted in azure #0A6EBD), reading as "
 "a machinist rule; plus a BIG NUMBERS specimen \"4 porty · 5 Gbps · 5–28 mm\" set big in "
 "Bricolage Grotesque ink as a typographic graphic. "
 "(4) UI tile: a clean off-white card (radius 14px, soft COOL layered slate-tinted shadow, a thin "
 "azure edge-line along the top) with the price \"34,90 zl\" big in Bricolage Grotesque, a "
 "full-width azure #0A6EBD CTA button \"Zamawiam — 34,90 zl\" in white text, and below two trust "
 "pills \"Platnosc przy odbiorze\" and \"Zwrot 14 dni\" (near-white fill, 1px hairline border, ink "
 "text — one global pill style). "
 "(5) IKONY tile: four thin 1.75px OUTLINE icons in ink #1C2530 only (NEVER azure): a clip / clamp "
 "hooking over a desk edge, a USB-A plug connector, a row of four small ports, and a DC power plug "
 "(5V) — one consistent outline set. NO SD/memory-card slot icon, NO HDMI icon. "
 "(6) PRODUKT tile: a small clean studio photo of the product on an off-white card — a SLIM "
 "BRUSHED-SILVER ALUMINIUM clip-on USB hub bar with a darker graphite front panel carrying a row "
 "of FOUR USB-A 3.0 ports (blue port interiors), a vertical clamp collar that hooks over the front "
 "edge of a desk with a knurled thumb-screw underneath and an anti-slip silicone pad, and a small "
 "DC 5V power port on the side — the material/colour anchor of the series (silver aluminium + "
 "graphite + blue USB interiors). NO printed brand text, NO card reader / SD-TF slot, NO HDMI "
 "port, NO \"10Gbps\" label, NO black colorway, NOT a cube and NOT a cylinder. "
 "(7) SWIAT tile: one small muted photo chip of a real clean modern desk-setup — a light wooden / "
 "white desk by a window with a monitor, keyboard, a small plant and a coffee mug, in cool "
 "daylight — reading as COOL platinum / white, NOT warm sand and NOT dark. "
 "Small ink labels above each tile (PALETA, TYPOGRAFIA, SYGNATURA, UI, IKONY, PRODUKT, SWIAT). "
 "STYLE-DNA: cool near-white / platinum world (#F7F8FA / #EEF0F4 / #E1E5EC), brushed aluminium and "
 "graphite, ink #1C2530, body #38424E, hairlines #D5DAE2; EXACTLY ONE accent — USB SuperSpeed "
 "azure #0A6EBD — used ONLY for the CTA, the edge-line/tick signature and star glyphs; ALL "
 "functional icons thin 1.75px OUTLINE in ink, never azure; display Bricolage Grotesque, text "
 "Figtree, an obvious contrast between them; one series radius 14px on cards / 8px on chips; soft "
 "LAYERED COOL shadows (slate-tinted rgba(20,35,60,.06–.10), never pure black) plus a subtle 3% "
 "grain; light backgrounds only. Polish diacritics correct. "
 "NEG: no printed brand text, no \"Eswirepro\"/\"ORICO\" logo, no shop name, no watermarks, no dark "
 "background, no neon, no phone frame, no browser chrome, crisp UI rendering, EXACTLY ONE BOARD "
 "and nothing else.")


def gen_local():
    body = json.dumps({"model": "gpt-image-2", "prompt": PROMPT, "n": 1,
                       "size": "1536x1024", "quality": "high"}).encode("utf-8")
    last = None
    for attempt in range(1, 4):
        try:
            req = urllib.request.Request("https://api.openai.com/v1/images/generations",
                data=body, headers={"Content-Type": "application/json",
                                    "Authorization": "Bearer " + OPENAI_KEY})
            raw = urllib.request.urlopen(req, timeout=600).read()
            j = json.loads(raw.decode("utf-8"))
            d = j.get("data") or []
            b64 = d[0].get("b64_json") if d else None
            if not b64:
                raise RuntimeError("pusta odpowiedz: " + json.dumps(j)[:300])
            return base64.b64decode(b64), "local/high/1536x1024"
        except Exception as e:
            last = e
            code = getattr(e, "code", None)
            transient = code in (429, 500, 502, 503, 504, 520, 522, 524) or code is None
            print("  [local %d/3] %s (code=%s)" % (attempt, str(e)[:160], code))
            if attempt < 3 and transient:
                time.sleep(8 * attempt); continue
            break
    raise last


def gen_edge():
    payload = {"fn": "generate-image", "payload": {
        "prompt": PROMPT, "count": 1, "workflow_id": "zaklipek-styl-master",
        "type": "mockup", "provider": "gpt-image-2", "quality": "medium",
        "aspect_ratio": "3:2"}}
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(EDGE, data=body, headers={
        "Content-Type": "application/json", "x-wf2-secret": WF2_SECRET})
    j = json.loads(urllib.request.urlopen(req, timeout=600).read().decode("utf-8"))
    url = (j.get("images") or [{}])[0].get("url")
    if not url:
        raise RuntimeError("edge no images: " + json.dumps(j)[:300])
    return urllib.request.urlopen(url, timeout=180).read(), "edge/medium/3:2"


def main():
    try:
        blob, ch = gen_local()
    except Exception as e:
        print("  local HIGH nieudany (%s) -> fallback edge MEDIUM" % str(e)[:140])
        blob, ch = gen_edge()
    from PIL import Image
    im = Image.open(io.BytesIO(blob)).convert("RGB")
    im.save(OUT)
    print("OK styl-master [%s] %s -> %s" % (ch, im.size, OUT))


if __name__ == "__main__":
    main()

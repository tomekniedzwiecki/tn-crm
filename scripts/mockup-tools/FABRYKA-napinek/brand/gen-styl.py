# -*- coding: utf-8 -*-
"""Styl-master NAPINEK (sprężynowy trener ramion i klatki) — 1 plansza DNA serii (3:2).
Kanal: LOKALNY OpenAI /v1/images/generations gpt-image-2 quality=HIGH (BEZ referencji — hexy w
prompcie; akcent turkus wyprowadzony z MIETOWYCH pierscieni uchwytow). Fallback: edge wf2-gen MEDIUM.
PLANSZA (nie hero-scena): paleta z rolami + 2 fonty z kontrastem (Barlow Semi Condensed display /
Mulish text) + JEDEN radius 12px + ikony outline ink 2px + trust-pill + mchowa warstwowa glebia +
sygnatura S5 (wielkie liczby 60/75/90 + 01/02/03 + luk napiecia) + kafel PRODUKT (twister bar czarny+
mieta+chrom) + kafel SWIAT (jasny domowy kacik treningowy)."""
import os, sys, io, re, json, time, base64, urllib.request
import requests

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "00-styl-master.png")
ENV = io.open(r"c:/repos_tn/tn-crm/.env", encoding="utf-8-sig", errors="ignore").read()
OPENAI_KEY = re.search(r"^OPENAI_API_KEY=(.+)$", ENV, re.M).group(1).strip()
_ws = re.search(r"^WF2_GEN_SECRET=(.+)$", ENV, re.M)
WF2_SECRET = _ws.group(1).strip() if _ws else ""
EDGE = "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen"

PROMPT = (
 "STYLE-MASTER SPECIMEN BOARD (3:2 landscape) for a Polish e-commerce landing-page series — a "
 "DESIGN-SYSTEM BOARD, NOT a hero scene: an organised specimen sheet on a COOL LIGHT LINEN / pale "
 "ash page background #F5F7F5 with a faint green undertone, presenting the complete visual DNA of "
 "the series, theme \"Napiecie, ktore buduje\" (tension that builds — a spring arm & chest twister "
 "trainer used at home; black anti-slip foam, MINT/TEAL accent rings and chrome steel, bright home "
 "daylight), laid out in labelled tiles with generous whitespace. "
 "GRID OF TILES: "
 "(1) PALETA tile: swatch chips with hex labels #F5F7F5, #E9EDE9, #DCE4DE, #1C2723, #37423C, "
 "#D3DDD5 and ONE clear DEEP TEAL chip #0F766E marked as the single accent (\"AKCENT — JEDYNY\"). "
 "(2) TYPOGRAFIA tile: a big condensed display specimen word \"Napinek\" and a BIG price \"144,90 zl\" "
 "set in Barlow Semi Condensed (a strong athletic condensed grotesk, heavy 800), an ALL-CAPS tracked "
 "eyebrow \"SILA RAMION I KLATKI — W DOMU\" and one body line \"Sprezynowy trener — 3 poziomy oporu, "
 "caly gorny korpus\" set in Mulish (a clean warm humanist sans, 400/600) — the two typefaces clearly "
 "CONTRAST (condensed display vs open humanist). Font labels: \"Barlow Semi Condensed (800) — "
 "naglowki, liczby, CTA\" and \"Mulish (400/600) — tekst, specyfikacja, etykiety\". "
 "(3) SYGNATURA tile: demonstrate the signature \"S5 wielkie liczby + luk napiecia\" — huge bold "
 "athletic numerals \"60 · 75 · 90\" (the three resistance levels in lbs) and small step numbers "
 "\"01 02 03\" set big in Barlow Semi Condensed ink #1C2723 as a typographic graphic, plus one thin "
 "1px ARC line (an echo of the bent spring bar under tension) sweeping across the tile, one small "
 "point on the arc highlighted in teal #0F766E. "
 "(4) UI tile: a clean light card (radius 12px, soft MOSSY layered shadow) with the price "
 "\"144,90 zl\" big in Barlow Semi Condensed, a full-width deep-teal #0F766E CTA button "
 "\"Zamawiam — 144,90 zl\" in white text, and below two trust pills \"Platnosc przy odbiorze\" and "
 "\"Zwrot 14 dni\" (light fill #F5F7F5, 1px hairline border #D3DDD5, ink text — one global pill style). "
 "(5) IKONY tile: four thin 2px OUTLINE icons in ink #1C2723 only (NEVER teal): a coiled steel "
 "spring, a foam-wrapped handle grip, a flexing arm/biceps, and a stack of three resistance-level "
 "bars — one consistent outline set. "
 "(6) PRODUKT tile: a small clean studio photo of the product on a light card — a SPRING ARM & CHEST "
 "TWISTER TRAINER: two parallel CHROME steel rods with thick BLACK anti-slip FOAM handle grips "
 "(with MINT/TEAL accent rings) joined in the middle by a pair of STEEL SPRINGS, the bar slightly "
 "bent into an oval under tension — the material/colour anchor of the series (black foam + MINT/TEAL "
 "rings + chrome steel). NO printed brand text, NO single-spring old-style twister, NO resistance "
 "bands/cables, and the accent rings are MINT/TEAL, NEVER blue. "
 "(7) SWIAT tile: one small photo chip of a real BRIGHT modern home training corner — a light room "
 "with a workout mat, a green plant and a window with soft daylight — reading as LIGHT and airy, "
 "NOT a dark commercial gym. "
 "Small ink labels above each tile (PALETA, TYPOGRAFIA, SYGNATURA, UI, IKONY, PRODUKT, SWIAT). "
 "STYLE-DNA: cool light linen / pale ash world with a faint green undertone (#F5F7F5 / #E9EDE9 / "
 "#DCE4DE), black foam and chrome steel, ink #1C2723, body #37423C, hairlines #D3DDD5; EXACTLY ONE "
 "accent — deep teal #0F766E — used ONLY for the CTA, the big-numbers/arc signature and star glyphs; "
 "ALL functional icons thin 2px OUTLINE in ink, never teal; display Barlow Semi Condensed, text "
 "Mulish, an obvious contrast between them; one series radius 12px on cards / 6px on chips; soft "
 "LAYERED MOSSY shadows (rgba(20,45,35,.06-.10), never pure black) plus a subtle 3% grain; light "
 "backgrounds only. Polish diacritics correct. "
 "NEG: no printed brand text, no \"Rbefeuly\"/\"HOTWAVE\" logo, no shop name, no watermarks, no dark "
 "gym background, no neon, no phone frame, no browser chrome, no blue accent rings, crisp UI "
 "rendering, EXACTLY ONE BOARD and nothing else.")


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


def main():
    blob, ch = gen_local()
    from PIL import Image
    im = Image.open(io.BytesIO(blob)).convert("RGB")
    im.save(OUT)
    print("OK styl-master [%s] %s -> %s" % (ch, im.size, OUT))


if __name__ == "__main__":
    main()

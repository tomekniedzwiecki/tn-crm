# -*- coding: utf-8 -*-
"""Styl-master POBLASK (samochodowa taśma LED ambientowa RGB) — 1 plansza DNA serii (3:2).
Kanal: LOKALNY OpenAI /v1/images/generations gpt-image-2 quality=HIGH (BEZ referencji — plansza DNA,
akcent electric violet #6A3DE8 wyprowadzony z RGB-glow swiata; hexy w prompcie). Fallback: edge MEDIUM.
PLANSZA (nie hero-scena): paleta z rolami + 2 fonty z kontrastem (Montserrat display / Mulish text) +
JEDEN radius 16px + ikony outline ink + trust-pill + chlodna warstwowa glebia + sygnatura "LINIA
SWIATLA" (swiecaca linia violet + spektrum) + DUZE LICZBY (64 kolory · 110 cm · 5V) + kafel PRODUKT
(cienka akrylowa tasma LED swiecaca RGB + sterownik USB) + kafel SWIAT (wnetrze auta noca, poswiata)."""
import os, sys, io, re, json, time, base64, urllib.request
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "00-styl-master.png")
ENV = io.open(r"c:/repos_tn/tn-crm/.env", encoding="utf-8-sig", errors="ignore").read()
OPENAI_KEY = re.search(r"^OPENAI_API_KEY=(.+)$", ENV, re.M).group(1).strip()

PROMPT = (
 "STYLE-MASTER SPECIMEN BOARD (3:2 landscape) for a Polish e-commerce landing-page series — a "
 "DESIGN-SYSTEM BOARD, NOT a hero scene: an organised specimen sheet on a COOL LIGHT LAVENDER / "
 "platinum page background #F6F5FB presenting the complete visual DNA of the series, theme "
 "\"Linia swiatla, ktora rozbudza wnetrze\" (a line of light that wakes up a car cabin — a slim RGB "
 "acrylic ambient light-strip glowing inside a car at night), laid out in labelled tiles with "
 "generous whitespace. GRID OF TILES: "
 "(1) PALETA tile: swatch chips with hex labels #F6F5FB, #ECEBF4, #DEDCEC, #1B1830, #35314A, "
 "#DAD7E8 and ONE clear ELECTRIC VIOLET chip #6A3DE8 marked as the single accent (\"AKCENT — JEDYNY\"). "
 "(2) TYPOGRAFIA tile: a big display specimen word \"Poblask\" and a BIG price \"39,90 zl\" set in "
 "MONTSERRAT (a bold geometric sans, heavy 800/900), an ALL-CAPS tracked eyebrow \"TWOJE AUTO W "
 "TWOIM KOLORZE\" and one body line \"Nastrojowa poswiata wnetrza — 64 kolory, sterowana z aplikacji\" "
 "set in MULISH (a warm humanist sans, 400/600) — the two typefaces clearly CONTRAST (geometric "
 "display vs humanist text); directly UNDER the word \"Poblask\" a thin GLOWING 2px LIGHT-LINE with "
 "a soft violet bloom (the publishing signature), one short segment shifting into a subtle RGB "
 "spectrum gradient. Font labels: \"Montserrat (800/900) — naglowki, liczby, CTA\" and \"Mulish "
 "(400/600) — tekst, specyfikacja, etykiety\". "
 "(3) SYGNATURA tile: demonstrate the signature \"LINIA SWIATLA\" — a continuous thin glowing 2px "
 "hairline running across the tile like a lit ambient strip, a violet #6A3DE8 core with a soft bloom, "
 "one segment gently transitioning through an RGB spectrum (echo of 64 colours); plus a BIG NUMBERS "
 "specimen \"64 kolory · 110 cm · 5V USB\" set big in Montserrat ink as a typographic graphic. "
 "(4) UI tile: a clean light card (radius 16px, soft COOL violet-tinted layered shadow, a thin "
 "glowing violet light-line along the top) with the price \"39,90 zl\" big in Montserrat, a "
 "full-width electric violet #6A3DE8 CTA button \"Zamawiam — 39,90 zl\" in white text, and below two "
 "trust pills \"Platnosc przy odbiorze\" and \"Zwrot 14 dni\" (light lavender fill, 1px hairline "
 "border, ink text — one global pill style). "
 "(5) IKONY tile: four thin 1.75px OUTLINE icons in ink #1B1830 only (NEVER violet): a glowing "
 "light-strip/line, a phone with an app colour-wheel, a music sound-wave, and a USB plug connector — "
 "one consistent outline set. "
 "(6) PRODUKT tile: a small clean studio photo of the product on a light card — a SLIM FLEXIBLE "
 "ACRYLIC LED LIGHT-STRIP glowing full RGB along its edge (a thin flat strip, dark flexible base "
 "with a light-guide top that emits a continuous line of colour), next to a small translucent USB "
 "controller module with a USB-A plug and a button — the material/colour anchor of the series "
 "(black flexible strip + luminous RGB line + small USB controller). It is a THIN FLAT STRIP, NOT a "
 "round fibre-optic rope, NOT a thick tube, NOT a neon glass tube. NO printed brand text. "
 "(7) SWIAT tile: one small photo chip of a real car interior AT NIGHT with a soft RGB light-line "
 "glowing along the dashboard edge — cool premium night mood, violet-to-cyan glow, city bokeh "
 "beyond the windshield (this single tile may be dark — it is the product's world). "
 "Small ink labels above each tile (PALETA, TYPOGRAFIA, SYGNATURA, UI, IKONY, PRODUKT, SWIAT). "
 "STYLE-DNA: cool LIGHT lavender/platinum board (#F6F5FB / #ECEBF4 / #DEDCEC), ink #1B1830, body "
 "#35314A, hairlines #DAD7E8; EXACTLY ONE accent — electric violet #6A3DE8 — used ONLY for the CTA, "
 "the glowing light-line signature and star glyphs; ALL functional icons thin 1.75px OUTLINE in ink, "
 "never violet; display Montserrat, text Mulish, an obvious contrast between them; one series radius "
 "16px on cards / 10px on chips; soft LAYERED COOL shadows (violet-tinted rgba(40,30,80,.06-.12), "
 "never pure black) plus a subtle 3% grain; LIGHT board background only (the product's night world "
 "appears only inside the PRODUKT/SWIAT photo chips). Polish diacritics correct. "
 "NEG: no printed brand text, no \"Fccemc\"/\"FCCEMC\" logo, no shop name, no watermarks, no round "
 "fibre-optic rope, no neon glass tube, no phone frame around the board, no browser chrome, crisp UI "
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
            return base64.b64decode(b64)
        except Exception as e:
            last = e; code = getattr(e, "code", None)
            transient = code in (429, 500, 502, 503, 504, 520, 522, 524) or code is None
            print("  [local %d/3] %s (code=%s)" % (attempt, str(e)[:160], code))
            if attempt < 3 and transient:
                time.sleep(8 * attempt); continue
            break
    raise last


def main():
    from PIL import Image
    blob = gen_local()
    im = Image.open(io.BytesIO(blob)).convert("RGB")
    im.save(OUT)
    print("OK styl-master %s -> %s" % (im.size, OUT))


if __name__ == "__main__":
    main()

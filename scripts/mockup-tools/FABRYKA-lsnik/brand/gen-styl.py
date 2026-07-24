# -*- coding: utf-8 -*-
"""Styl-master LSNIK (listwa LED ambient do bagaznika) — 1 plansza DNA serii (3:2).
Kanal: LOKALNY OpenAI /v1/images/generations gpt-image-2 quality=HIGH (BEZ referencji produktu;
akcent = czerwien lamp tylnych auta -> hexy w prompcie). Fallback: edge wf2-gen MEDIUM.
PLANSZA (nie hero-scena): paleta z rolami + 2 fonty z kontrastem (Montserrat display / Mulish text)
+ radius 18px + ikony outline ink + trust-pill + ciepla warstwowa glebia + sygnatura „swietlna linia
obrysu" + DUZE LICZBY (34,90 zl · 2M · 12V) + kafel PRODUKT (silikonowy zwoj + swietlny obrys w
ramie bagaznika) + kafel SWIAT (auto o zmierzchu, swiecacy bagaznik)."""
import os, sys, io, re, json, time, base64, urllib.request
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "00-styl-master.png")
ENV = io.open(r"c:/repos_tn/tn-crm/.env", encoding="utf-8-sig", errors="ignore").read()
OPENAI_KEY = re.search(r"^OPENAI_API_KEY=(.+)$", ENV, re.M).group(1).strip()
WF2_SECRET = (re.search(r"^WF2_GEN_SECRET=(.+)$", ENV, re.M) or [None, ""])
WF2_SECRET = WF2_SECRET.group(1).strip() if hasattr(WF2_SECRET, "group") else ""
EDGE = "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/wf2-gen"

PROMPT = (
 "STYLE-MASTER SPECIMEN BOARD (3:2 landscape) for a Polish e-commerce landing-page series — a "
 "DESIGN-SYSTEM BOARD, NOT a hero scene: an organised specimen sheet on a WARM near-white / stone "
 "page background #F7F4EF presenting the complete visual DNA of the series, theme \"Swietlny obrys, "
 "ktory sam wita po otwarciu klapy\" (an ambient LED light-line that traces a car trunk opening and "
 "lights up when the tailgate is raised; warm/white glow, a premium car at dusk, tail-light red as "
 "the single accent), laid out in labelled tiles with generous whitespace. GRID OF TILES: "
 "(1) PALETA tile: swatch chips with hex labels #F7F4EF, #EFE9E1, #E3DBCE, #22201D, #3A362F, #DAD1C2 "
 "and ONE clear TAIL-LIGHT RED chip #C21F30 marked as the single accent (\"AKCENT — JEDYNY\"). "
 "(2) TYPOGRAFIA tile: a big display specimen word \"Lsnik\" and a BIG price \"34,90 zl\" set in "
 "MONTSERRAT (a confident geometric grotesk, heavy 800), an ALL-CAPS tracked eyebrow \"BAGAZNIK SAM "
 "WITA CIE SWIATLEM\" and one body line \"Listwa LED ambient — swietlny obrys po otwarciu klapy\" set "
 "in Mulish (a warm humanist sans, 400/600) — the two typefaces clearly CONTRAST. Font labels: "
 "\"Montserrat (800) — naglowki, liczby, CTA\" and \"Mulish (400/600) — tekst, specyfikacja, etykiety\". "
 "(3) SYGNATURA tile: demonstrate the signature \"swietlna linia obrysu\" — a continuous thin 1px "
 "hairline with a soft warm GLOW running across the tile like the illuminated edge of a trunk opening "
 "(one stretch brightened / 'lit' in tail-light red #C21F30), reading as a light-line, not a "
 "handwritten swash; plus a BIG NUMBERS specimen \"2M · 12V · 34,90 zl\" set big in Montserrat ink as "
 "a typographic graphic. "
 "(4) UI tile: a clean warm off-white card (radius 18px, soft warm layered brown-tinted shadow, a thin "
 "glowing light-line along the top) with the price \"34,90 zl\" big in Montserrat, a full-width "
 "TAIL-LIGHT RED #C21F30 CTA button \"Zamawiam — 34,90 zl\" in white text, and below two trust pills "
 "\"Platnosc przy odbiorze\" and \"Zwrot 14 dni\" (warm near-white fill, 1px hairline border, ink "
 "text — one global pill style). "
 "(5) IKONY tile: five thin 1.75px OUTLINE icons in ink #22201D only (NEVER red): a raised car "
 "tailgate, a curved light-strip line tracing a frame, an auto-sensor (an open lid with a light "
 "spark), a water drop (waterproof), and a 12V power plug — one consistent outline set. NO rainbow "
 "icon, NO remote-control icon, NO app icon. "
 "(6) PRODUKT tile: a small clean studio photo of the product on a warm off-white card — a coiled "
 "FLEXIBLE SILICONE LED light-strip (soft milky-white tube, half-round profile) with a thin two-wire "
 "lead (red + black) at one end, shown next to a short segment installed along a car trunk-opening "
 "frame glowing a continuous WARM-WHITE line — the material/colour anchor of the series (soft silicone "
 "+ continuous warm/white glow). NO visible individual dot LEDs, NO rainbow/RGB colours, NO printed "
 "brand text, NO rigid aluminium profile, NO remote. "
 "(7) SWIAT tile: one small muted photo chip of a real car at dusk on a driveway with the tailgate "
 "raised and the trunk frame glowing a warm light-line — reading as WARM STONE / premium automotive "
 "evening, NOT candle interior and NOT cool platinum. NO visible car-brand logo, NO licence plate. "
 "Small ink labels above each tile (PALETA, TYPOGRAFIA, SYGNATURA, UI, IKONY, PRODUKT, SWIAT). "
 "STYLE-DNA: warm near-white / stone world (#F7F4EF / #EFE9E1 / #E3DBCE), soft silicone and warm/white "
 "glow, ink #22201D, body #3A362F, hairlines #DAD1C2; EXACTLY ONE accent — tail-light red #C21F30 — "
 "used ONLY for the CTA, the glowing light-line signature and star glyphs; ALL functional icons thin "
 "1.75px OUTLINE in ink, never red; display Montserrat, text Mulish, an obvious contrast between them; "
 "one series radius 18px on cards / 10px on chips; soft LAYERED WARM shadows (brown-tinted "
 "rgba(60,40,20,.06-.10), never pure black) plus a subtle 3% grain; light backgrounds only. Polish "
 "diacritics correct. NEG: no printed brand text, no car-brand logo, no licence plate, no rainbow/RGB, "
 "no dot LEDs, no remote/app, no dark background, no neon, no phone frame, no browser chrome, crisp UI "
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

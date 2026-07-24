# -*- coding: utf-8 -*-
"""Buduje pliki promptow makiet NAKRECIK (F2) — LOKALNY OpenAI gpt-image-2 HIGH.
Wspolne STYLE-DNA (KANON+PARTYTURA z TOKENS-MAKIETY.md) wstrzykiwane do KAZDEGO promptu.
Prawdziwe copy 1:1 z zywego index.html (sklepy/tomek-niedzwiecki/nakrecik) WPROST w cudzyslowach —
na obrazie copy BEZ polskich znakow diakrytycznych (makieta = design-comp; realne copy zyje w HTML;
model rendruje tekst przyblizenie, diakrytyki gubi). Emituje p-<name>.txt + _index.json (name,size,ref).
Ref produktu (_product-ref.png = g0 z bud-products) doklejany przez /edits gdy ref=='prod'.
WHITE-LABEL: ZERO 'TELESIN' na produkcie/kadrach. Marka na stronie = 'Nakrecik'."""
import os, io, json
sys = __import__("sys"); sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))

UI = ("A high-fidelity, pixel-perfect WEBSITE UI MOCKUP (Figma-style, clean modern design system, "
 "crisp interface rendering) of ONE section of a Polish e-commerce landing page for a MAGNETIC "
 "POV NECK-MOUNT phone holder brand \"Nakrecik\". A real interface as if already built — NOT concept "
 "art, NOT a painterly illustration. ")

STYLE = ("STYLE-DNA (identical across the whole series): a WARM, BRIGHT, natural DAYLIGHT world of a "
 "real creator's everyday life (kitchen, street, workshop, home, gym) on a warm neutral BONE "
 "background #FAF7F1 (surface panels #F1ECE3 / #E6DFD3) with warm graphite ink text #20242A, muted "
 "body #4A4640 and hairline warm-bone rules #E3DBCE — light, human, never a cold studio, and NEVER a "
 "dark section EXCEPT the two deliberate warm-evening scenes. EXACTLY ONE accent colour — ACTION-GREEN "
 "EMERALD #12B76A (a deeper #0A7A4C only for green text/links on white) — used ONLY for the CTA button "
 "fill, the small 'REC' dot signature, the positive check ticks and the review stars; NOTHING ELSE is "
 "green. FUNCTIONAL icons (magnet, quick-release, angle modes, folding, phone) are thin 1.75px OUTLINE "
 "strokes in CHARCOAL #20242A — NEVER green, NEVER filled slabs. Typography: display face SPACE GROTESK "
 "(a geometric grotesk with a subtle hardware/tech edge and light personality) for headlines, big "
 "numbers and prices; text face HANKEN GROTESK (a warm humanist sans with clear figures) for eyebrows, "
 "body, labels, specs, FAQ and buttons — the geometric/humanist contrast is clearly visible. One series "
 "radius: 18px on cards, 10px on chips/pills/fields. Soft WARM layered shadows with a sepia tint "
 "(0 10px 26px rgba(40,34,24,.10), never a hard pure-black edge) plus a subtle 3% grain. Generous 8pt "
 "whitespace, ASYMMETRIC layouts, never a rigid 50/50 grid. The publishing SIGNATURE is a VIEWFINDER: "
 "thin CAMERA-FRAME CORNER BRACKETS bracketing the key scene photo, plus a small GREEN 'REC' pill with a "
 "green dot near action headings, and occasionally a faint hairline mini-timecode — a camera/creator "
 "motif, not a decorative swash. The eyebrow micro-label is CHARCOAL CAPS with wide letter-spacing above "
 "the heading. Trust pills are a #FAF7F1 fill with a #E3DBCE border and charcoal text. Polish diacritics "
 "where present rendered correctly. ")

PROD = ("PRODUCT FIDELITY (keep this exact body wherever the product appears): a soft SILICONE NECK "
 "MOUNT shaped like a rounded horseshoe / open 'U' that rests on the shoulders and around the neck, "
 "open at the front, with a thick (~10-12mm) rounded cross-section and subtle grooving on the arc; at "
 "the front junction sits a small BLACK rectangular module with a SIDE quick-release button, and from "
 "that module a SHORT articulated FOLDING metal arm (2-3 silver-black joints) reaches up to a flat "
 "matte-BLACK MAGNETIC RING (a MagSafe-style ring with a hole in the middle). The phone is held ONLY by "
 "the magnetic ring — NOT by jaws, clips or clamps. Two colour variants: GRAPHITE / grey silicone (the "
 "dominant canonical colour) or GREEN / pistachio silicone, both with the same black hardware. A thin "
 "anti-lost safety cord may hang near the module. 220g, a solid metal feel. ABSOLUTELY NO long visible "
 "gooseneck arm on the outside (the flex lives inside the silicone loop; the metal arm is short), NO "
 "jaws/clamps gripping the phone sides, NO remote or Bluetooth buttons, NO LED or ring-light (the ring "
 "is a magnet, it does NOT glow), NO cables or charging port, and NO printed logo or brand name anywhere "
 "on the product. ")

NEG = ("EXACTLY ONE SECTION AND NOTHING ELSE — do not add a wordmark, a price, a star-rating or benefit "
 "chips unless they belong to THIS section. Absolutely NO brand text 'TELESIN', no 'TELESIN Photography "
 "Store', no shop name, no watermark, no burned-in English words, no phone frame, no browser chrome, no "
 "'01/12' numbering badges, no long external gooseneck, no phone clamps. ")

# body per section. ref: 'prod' = /edits z _product-ref.png ; None = /generations (bez produktu)
S = {}

# ───────────────── DESKTOP (16 sekcji, 3:2) ─────────────────
S["01-hero"] = ("prod", "1536x1024",
 "SECTION = HERO, archetype A: a FULL-BLEED immersive photographic scene fills the ENTIRE frame — a "
 "young creator in a bright warm kitchen at daytime wearing the GRAPHITE silicone NECK MOUNT, a phone "
 "snapped magnetically to the ring at chest height recording their hands chopping vegetables, warm "
 "window daylight, shallow depth, cinematic; thin VIEWFINDER CORNER BRACKETS frame the scene and a small "
 "green 'REC' pill sits in a corner. A soft light scrim on the LEFT carries the copy top-to-bottom: a "
 "CHARCOAL CAPS eyebrow 'MAGNETYCZNY UCHWYT POV NA SZYJE', a large Space Grotesk H1 'Nagrywaj z wlasnej "
 "perspektywy — obie rece wolne' with 'z wlasnej perspektywy' emphasised, one Hanken sub-line 'Przyklej "
 "telefon magnesem, zaloz uchwyt na szyje i krec POV. Kadr idzie tam, gdzie Ty — a obie rece zostaja do "
 "roboty.', then a compact OFFER CARD (white, radius 18, hairline, warm shadow): a big Space Grotesk "
 "price '124,90 zl' with a note 'Uchwyt na szyje + blaszka do Androida · platnosc przy odbiorze', a "
 "full-width EMERALD #12B76A CTA button with dark ink text 'Zamawiam — 124,90 zl', a tiny line 'placisz "
 "dopiero przy odbiorze', and a pay-row of four small charcoal-outline trust pills 'Przy odbiorze / "
 "Zwrot 14 dni / Wysylka z Polski / iPhone i Android'. A slim top bar shows a small 'Nakrecik' wordmark "
 "with a green REC dot on the left and 'Platnosc przy odbiorze · 14 dni na zwrot · wysylka z Polski' on "
 "the right. NO star rating above the fold. ")

S["02-zaufanie"] = (None, "1536x1024",
 "SECTION = TRUST BAR: a slim full-width band on warm BONE #FAF7F1 with a thin hairline top and bottom, "
 "at FULL height (no dead lower third). FOUR trust items in ONE centered row, each a small lockup with a "
 "thin 1.75px CHARCOAL OUTLINE icon and a Hanken label, separated by thin vertical hairline dividers: "
 "'Platnosc przy odbiorze (COD)' (a small COD truck icon), 'Zwrot w 14 dni' (a return-arrow icon), "
 "'Wysylka z Polski' (a delivery van icon), 'Pasuje do iPhone i Androida' (a phone icon). One consistent "
 "minimal style, CHARCOAL outline icons only, NO green anywhere. Calm, light, premium. NO product, NO "
 "photographs. ")

S["03-problem"] = (None, "1536x1024",
 "SECTION = PROBLEM, the old painful way — a FULL-BLEED photographic scene with the image weight on the "
 "RIGHT and a soft light scrim + copy on the LEFT. Photoreal frustration in a warm kitchen at daytime: a "
 "person struggling to film with ONE hand while cooking, the phone about to slip off a propped coffee "
 "mug, a cluttered counter, tense and awkward. On the LEFT over the scrim: a CHARCOAL CAPS eyebrow 'ZNASZ "
 "TO?', a Space Grotesk headline 'Nagrywanie jedna reka to walka z kadrem' and a short Hanken line "
 "'Chcesz pokazac, co robisz — a jedna reka trzyma telefon, druga probuje ogarnac cala reszte. Efekt: "
 "krzywo, nerwowo i polowa akcji poza kadrem.', then a vertical list of FOUR pain bullets, each with a "
 "thin CHARCOAL outline X-in-circle icon: 'Trzymasz telefon jedna reka i nic sensownego nie da sie "
 "zrobic', 'Opierasz go o kubek albo sciane — zsuwa sie ekranem w dol', 'Statyw jest za ciezki i nie "
 "idzie z Toba w ruchu', 'Prosisz kogos, zeby potrzymal — i nie nagrywasz sam'. ABSOLUTELY NO neck mount "
 "and NO magnetic ring anywhere in the frame — only a bare phone and an ordinary kitchen. A thin "
 "viewfinder corner bracket and a small green REC pill mark the scene. Warm but deliberately tense and "
 "cluttered. ")

S["04-rozwiazanie"] = ("prod", "1536x1024",
 "SECTION = SOLUTION / relief — a FULL-BLEED photographic scene with the image weight on the LEFT and a "
 "soft light scrim + copy on the RIGHT (zig-zag, opposite side to the problem section). Photoreal warm "
 "kitchen: the SAME creator now HANDS-FREE, the phone snapped onto the neck-mount magnetic ring at chest "
 "height, BOTH hands stirring a pot with rising steam, calm relief, warm daylight; viewfinder corner "
 "brackets + green REC pill frame it. On the RIGHT over the scrim: a CHARCOAL CAPS eyebrow 'ROZWIAZANIE', "
 "a Space Grotesk headline 'Przyklej telefon magnesem i odzyskaj obie rece' and a short Hanken line "
 "'Miekka obrecz siada na szyi, telefon lapie sie magnesem jednym pstroknieciem. Od tej chwili nagrywasz "
 "z wlasnej perspektywy, a dlonie robia swoje.', then THREE positive bullets, each with a thin EMERALD "
 "outline CHECK icon: 'Pierscien 16 neodymow trzyma telefon mocno — nie spada nawet w ruchu', 'Kadr leci "
 "z Twojej perspektywy (POV) — widac dokladnie to, co robisz', 'Obie rece wolne: gotujesz, krecisz "
 "srube, cwiczysz, bawisz sie z dzieckiem'. Product sharp and static; only the steam is in motion. ")

S["05-demo"] = ("prod", "1536x1024",
 "SECTION = DEMO 'jak to dziala' on warm BONE #FAF7F1. A two-column layout: on the LEFT a vertical stack "
 "of THREE step cards connected as a list, each a rounded card with a circular number badge 01 / 02 / 03 "
 "in Space Grotesk and a Hanken caption — the FIRST step is ACTIVE (emerald outline, faint green tint, "
 "green-filled number): '01 Zaloz obrecz na szyje — Miekka silikonowa obrecz siada na karku, gotowe w "
 "sekunde', '02 Przyklej telefon magnesem — Jeden pstryk, telefon lapie sie pierscienia magnetycznego', "
 "'03 Ustaw kat i nagrywaj — Przegub trzyma kat: pion, poziom, z gory albo z dolu'. On the RIGHT a large "
 "4:3 rounded viz (VIEWFINDER CORNER BRACKETS, warm shadow, small green REC pill) showing hands placing "
 "the soft neck mount and snapping the phone onto the magnetic ring, neutral bright set, with a small "
 "charcoal pill caption bottom-left 'Zaloz obrecz na szyje'. Above: a CHARCOAL CAPS eyebrow 'JAK TO "
 "DZIALA' and a Space Grotesk h2 'Trzy ruchy i nagrywasz'. ")

S["06-zastosowania"] = ("prod", "1536x1024",
 "SECTION = USE-CASES MOSAIC on warm BONE #FAF7F1 — a bento-style mosaic of FOUR unequal photographic "
 "tiles (radius 18, uneven sizes, one big feature tile + smaller ones, even small gutters), each showing "
 "a person WEARING the neck mount and recording in a different setting, each with a bottom light-gradient "
 "overlay carrying a CHARCOAL/white kicker + a Space Grotesk title: (BIG) 'KUCHNIA — Nagrywaj przepis z "
 "gory, mieszajac obiema rekami'; 'WARSZTAT / DIY — Pokaz robote z bliska' (drilling, POV); 'SPORT — "
 "Krec trening w ruchu' (kettlebell workout); 'RODZIC — Nagraj chwile z dzieckiem, majac obie rece dla "
 "niego'. Above the mosaic a header: a CHARCOAL CAPS eyebrow 'TWOJA TRZECIA REKA', a Space Grotesk h2 "
 "'Wszedzie, gdzie chcesz miec wolne rece' and one Hanken line 'Jeden uchwyt, mnostwo nagran — od "
 "przepisu w kuchni po trening i zabawe z dzieckiem.'. Warm natural daylight, viewfinder brackets on the "
 "big tile. ")

S["07-korzysci"] = ("prod", "1536x1024",
 "SECTION = BENEFITS on warm BONE #FAF7F1. A header lockup: CHARCOAL CAPS eyebrow 'DLACZEGO NAKRECIK', "
 "Space Grotesk ink h2 'Solidny sprzet, przemyslany w kazdym detalu'. A feature HERO ROW: on the LEFT a "
 "clean studio PACKSHOT of the GRAPHITE neck mount (magnetic ring + short folding arm) on a warm-neutral "
 "field (image at least 40% of that tile, not a postage stamp); on the RIGHT a copy block with a Space "
 "Grotesk h3 'Potrojna konstrukcja: stal, aluminium i silikon' and a Hanken line 'W srodku stalowy "
 "przegub, obudowa ze stopu aluminium, na karku miekka silikonowa powloka. Caloosc wazy 220 g — czuc "
 "metal, nie tandetny plastik.'. Below, SIX benefit cards in a tidy 3x2 grid — each a WHITE card (radius "
 "18, thin hairline border, soft warm shadow) with a thin CHARCOAL OUTLINE icon inside a soft rounded "
 "square, a Space Grotesk h3 and a Hanken muted line: 'Magnes 16 neodymow', 'Potrojna konstrukcja, 220 "
 "g', 'Szybkozlaczka + tryby kata', 'Sklada sie do ~138 mm', 'iPhone i Android', 'Miekka obrecz na "
 "szyje'. Icons CHARCOAL outline, not green. Calm, editorial, light. ")

S["08-tryby"] = ("prod", "1536x1024",
 "SECTION = SHOT-MODES CONFIGURATOR on warm BONE #FAF7F1. Header: CHARCOAL CAPS eyebrow 'KAZDY KADR POD "
 "KONTROLA', Space Grotesk h2 'Ustaw ujecie jednym ruchem', Hanken lead 'Tlumiony przegub trzyma kat bez "
 "opadania. Pstrykasz tryb, a wizjer zmienia orientacje razem z Toba.'. Below, a wide SCENE CARD (radius "
 "18, prominent VIEWFINDER CORNER BRACKETS, small green REC pill) showing a phone on the neck-mount "
 "magnetic ring in PORTRAIT orientation on a neutral bright set, with a small charcoal caption 'Pion — "
 "sylwetka i twarz w kadrze'. Beneath the scene a SEGMENTED SWITCH of four pill buttons, the FIRST "
 "ACTIVE (emerald fill, dark text), the rest bone with charcoal text: 'Pion' (on) / 'Poziom' / 'Z gory' "
 "/ 'Z dolu'. The viewfinder bracket orientation echoes the selected mode. This is the signature "
 "viewfinder culmination. ")

S["09-porownanie"] = ("prod", "1536x1024",
 "SECTION = COMPARISON, an honest TWO-COLUMN TABLE (not bento) centered on warm BONE #FAF7F1. Header "
 "lockup: CHARCOAL CAPS eyebrow 'BEZ SCIEMY', Space Grotesk ink h2 'Uchwyt na szyje kontra stare "
 "sposoby'. The table (white, hairline rules, radius 18) has column A header 'Nakrecik na szyje' (with a "
 "tiny graphite neck-mount thumbnail) and column B header 'W rece / o kubek / statyw' (muted). Rows with "
 "a left feature label: 'Obie rece wolne' (A emerald check 'tak' / B charcoal X 'nie'), 'Kadr z Twojej "
 "perspektywy (POV)' (A 'tak' / B 'rzadko'), 'Idzie z Toba w ruchu' (A 'tak' / B 'nie'), 'Telefon sie "
 "nie zsuwa' (A 'magnes' / B 'ryzyko'), 'Wazy niewiele, bierzesz wszedzie' (A '220 g, skladany' / B "
 "'statyw ciezki'). Only the check ticks in column A are emerald; everything else ink/muted; column A "
 "cells have a very faint green tint. Below the table a short honest note 'Gramy w otwarte karty: 220 g "
 "to troche czuc na szyi — ale ten ciezar bierze sie z metalu, nie z taniego plastiku.' and a centered "
 "EMERALD #12B76A CTA button with dark text 'Zamawiam Nakrecika — 124,90 zl'. Honest, clean, editorial. ")

S["10-mid-cta"] = ("prod", "1536x1024",
 "SECTION = MID-PAGE CTA, a dedicated FULL-BLEED call-to-action over a WARM EVENING scene (one of the "
 "two deliberate DARK sections, a deep green-black #0E1A14 mood): a creator on an evening city street "
 "wearing the neck mount with the phone filming, warm street-light bokeh, confident, cinematic; a soft "
 "dark left-weighted scrim, viewfinder corner brackets + a green REC pill. Left-aligned content over the "
 "scrim: a light CAPS eyebrow 'TWOJ KADR, TWOJE TEMPO', a Space Grotesk WHITE headline 'Przestan walczyc "
 "z telefonem', a Hanken sub-line 'Przyklej go magnesem, zaloz uchwyt i po prostu nagrywaj to, co "
 "robisz. Obie rece wolne, kadr z Twojej perspektywy.', then a DESIGNED EMERALD #12B76A CTA button with "
 "dark text 'Zamow Nakrecika — 124,90 zl, placisz przy odbiorze', and beneath a small light line "
 "'Placisz przy odbiorze · zwrot 14 dni · wysylka z Polski.'. A real shaped button, warm and inviting, "
 "never a dark scam mood, never neon. ")

S["11-opinie"] = (None, "1536x1024",
 "SECTION = REVIEWS / social proof on warm BONE #FAF7F1 (this is below the fold). Centered header: a "
 "CHARCOAL CAPS eyebrow 'CO MOWIA KUPUJACY', then an OVERSIZED Space Grotesk number '4,8 / 5', a row of "
 "FIVE small EMERALD stars, a Hanken muted line 'na podstawie 187 ocen · 96,8% pozytywnych', and a "
 "smaller honest line 'Wszystkie recenzje z trescia to piatki. Nie chowamy minusow: kilka osob pisze, ze "
 "220 g troche czuc na szyi.'. Below, SIX honest review cards in a 3x2 grid — each a WHITE card (radius "
 "18, hairline, warm shadow) with a small row of emerald stars, a Hanken Polish quote and a small "
 "charcoal tag beneath: '\"Swietny magnetyczny uchwyt, idealny do POV.\" — POV / tworca', '\"Solidna "
 "konstrukcja, magnes swietnie trzyma, choc dla mnie odrobine ciezki.\" — Solidny, troche ciezki', "
 "'\"Metal wszedzie, obrecz miekka, magnes trzyma bardzo mocno.\" — Metal i mocny magnes', '\"Magnes "
 "super mocny — skacze i telefon nie odpada.\" — Trzyma w ruchu', '\"Myslalem, ze drogi… ale naprawde "
 "warto.\" — Warte ceny', '\"Nagrywam jak z GoPro, tylko telefonem.\" — Jak GoPro'. Honest and human, "
 "not glossy. NO product hero shot here. ")

S["12-zdjecia-kupujacych"] = ("prod", "1536x1024",
 "SECTION = BUYER PHOTOS / user-generated proof on warm BONE #FAF7F1. Centered header: a CHARCOAL CAPS "
 "eyebrow 'PROSTO OD KUPUJACYCH', a Space Grotesk ink h2 'Tak Nakrecik wyglada u Was'. Below, a row of "
 "FIVE PORTRAIT (4:5) photo cards (radius 18, hairline, warm shadow) — each an authentic slightly casual "
 "HOME SNAPSHOT of the neck mount in a real buyer's setting (a GREEN one with the thin safety cord, a "
 "GRAPHITE one held in a hand, a close detail of the folding arm joint, the black magnetic ring, the "
 "front module), NOT a polished studio shot, each with a small Hanken caption underneath: 'Obrecz "
 "miekka, magnes trzyma mocno — polecam', 'Ramie trzyma sztywno, spod modulu miekko podbity', 'Idealny "
 "do nagrywania POV', 'Solidna konstrukcja, ramie dopasowane', 'Bardzo fajny magnetyczny uchwyt, "
 "pierscien trzyma mocno'. Warm, real, trustworthy. ")

S["13-galeria"] = ("prod", "1536x1024",
 "SECTION = GALLERY, a clean grid of tiles (lightbox feel, uniform radius 18, even gutters) on warm BONE "
 "#FAF7F1, with a header: CHARCOAL CAPS eyebrow 'Z BLISKA', Space Grotesk ink h2 'Nakrecik w kadrze'. "
 "Tiles of the neck mount in real contexts and clean studio packshots: a GRAPHITE studio packshot, a "
 "GREEN studio packshot, a close-up of the phone snapping to the magnetic ring, the phone shown in three "
 "orientations on the mount, a kitchen overhead recipe POV, a workout POV, and one WIDE tile of a "
 "creator in a kitchen wearing the mount. Small charcoal captions in the bottom gradient of each tile "
 "('Wersja grafitowa', 'Wersja zielona', 'Magnes lapie telefon', 'Pion, poziom, z gory', 'Kuchnia z "
 "gory', 'Trening POV', 'Twoj kadr — obie rece wolne'). Consistent warm daylight, uniform tile radius "
 "and even gutters. ")

S["14-zamow"] = ("prod", "1536x1024",
 "SECTION = ORDER / inline checkout, a wide module on warm BONE #FAF7F1. LEFT: a COLOR PICKER — a clean "
 "studio PACKSHOT of the neck mount (default GRAPHITE) on a plain warm-light field with two colour swatch "
 "buttons below it ('Grafit' active with a dark-grey dot, 'Zielen' with a green dot) and a note 'Grafit "
 "albo zielen — ta sama cena, ten sam uchwyt'. RIGHT: an inline CHECKOUT card (radius 18, hairline "
 "border, warm shadow, a thin EMERALD top edge-line) with a CHARCOAL CAPS eyebrow 'ZAMOWIENIE' and a "
 "Space Grotesk ink title 'Zamow Nakrecika', a summary bar (small thumbnail + 'Nakrecik' + '1 szt.' + a "
 "Space Grotesk price '124,90 zl'), a payment-method block highlighting 'Platnosc przy odbiorze (COD)', "
 "stacked form fields 'Imie i nazwisko', 'Telefon', 'Adres' skinned in the tokens, a full-width EMERALD "
 "#12B76A CTA button with dark text 'Kup teraz — place przy odbiorze', then a small Hanken muted line "
 "'Zwrot 14 dni · wysylka z Polski'. Order: price -> CTA -> reassurance. ")

S["15-faq"] = ("prod", "1536x1024",
 "SECTION = FAQ, an accordion (full-width rows, thin hairline dividers, +/- CHARCOAL outline toggles) "
 "beside a STICKY clean studio PACKSHOT of the graphite neck mount, on warm BONE #FAF7F1. Header: "
 "CHARCOAL CAPS eyebrow 'ZANIM ZAMOWISZ', Space Grotesk ink h2 'Najczestsze pytania'. Questions in Space "
 "Grotesk ink with the FIRST one expanded to a Hanken answer: 'Czy magnes utrzyma moj telefon?' (open "
 "answer: '16 magnesow neodymowych w pelnym okregu — iPhone lapie sie zgodnie z MagSafe, a do Androida "
 "dokladamy blaszke magnetyczna na etui.'), 'Nie jest za ciezki na szyje?', 'Czy pasuje do mojego "
 "telefonu?', 'Czy wygodnie nosi sie go na szyi?', 'Czy da sie go zlozyc i zabrac ze soba?', 'Jak "
 "zdejmuje telefon?'. Calm, trustworthy, roomy, light. ")

S["16-final"] = ("prod", "1536x1024",
 "SECTION = FINAL CTA, a wide cinematic FULL-BLEED WARM scene (the second deliberate DARK section, "
 "golden-hour dusk, deep green-black #0E1A14 shadows): a creator walking through a park at golden hour, "
 "hands free, the phone on the neck mount recording, gentle motion, warm backlight, a few drifting "
 "leaves; viewfinder corner brackets + a green REC pill. Centered content over a dark scrim: a light "
 "CAPS eyebrow 'TWOJ KADR, OBIE RECE WOLNE', a Space Grotesk WHITE headline 'Nagraj to, co robisz — z "
 "wlasnej perspektywy', a Hanken sub-line 'Przyklej telefon magnesem, zaloz uchwyt i krec. Bez "
 "trzymania, bez ekipy, bez kompromisow.', a DESIGNED EMERALD #12B76A CTA button with dark text "
 "'Zamawiam Nakrecika', a Space Grotesk price '124,90 zl', and a small pay-row of three light pills "
 "'Przy odbiorze / Zwrot 14 dni / Wysylka z Polski'. The warm golden light closes the composition. ")

# ───────────────── MOBILE (portrait 2:3) — projektowane OD ZERA pod fold telefonu ─────────────────
S["01-hero-m"] = ("prod", "1024x1536",
 "MOBILE HERO (portrait phone, 2:3), designed FROM ZERO for the phone fold — NOT a squeezed desktop. The "
 "photographic warm bright kitchen scene fills the TOP ~52%: a creator wearing the GRAPHITE neck mount "
 "with the phone snapped magnetically, recording their hands, warm daylight, viewfinder corner brackets "
 "+ green REC pill. A slim top bar with a small 'Nakrecik' wordmark + green REC dot. BELOW on bone: a "
 "CHARCOAL CAPS eyebrow 'MAGNETYCZNY UCHWYT POV NA SZYJE', a big Space Grotesk H1 'Nagrywaj z wlasnej "
 "perspektywy — obie rece wolne', then an OFFER CARD (white, hairline, warm shadow, radius 18, emerald "
 "top edge) with the Space Grotesk price '124,90 zl', a full-width EMERALD CTA 'Zamawiam — 124,90 zl' "
 "(dark text), a tiny 'placisz przy odbiorze', and a one-line pay-row 'Przy odbiorze · Zwrot 14 dni · z "
 "Polski'. Everything decisive INSIDE the fold. NO star rating above the fold. ")

S["03-problem-m"] = (None, "1024x1536",
 "MOBILE PROBLEM (portrait 2:3), phone-first. A photoreal frustration scene fills the TOP: a person "
 "filming with ONE hand while cooking, the phone slipping off a propped mug, a cluttered kitchen counter, "
 "tense. BELOW on bone: a CHARCOAL CAPS eyebrow 'ZNASZ TO?', a Space Grotesk headline 'Nagrywanie jedna "
 "reka to walka z kadrem' and a vertical list of THREE short pain bullets with charcoal outline "
 "X-in-circle icons: 'Jedna reka trzyma telefon — nic nie zrobisz', 'Oparty o kubek zsuwa sie ekranem w "
 "dol', 'Statyw za ciezki, nie idzie w ruch'. ABSOLUTELY NO neck mount and NO magnetic ring in frame — "
 "only a bare phone. Tense, cluttered. ")

S["04-rozwiazanie-m"] = ("prod", "1024x1536",
 "MOBILE SOLUTION (portrait 2:3), phone-first. TOP: the creator now HANDS-FREE, the phone on the "
 "neck-mount magnetic ring, both hands stirring a pot with rising steam, warm kitchen daylight, "
 "viewfinder brackets + REC pill. BELOW on bone: a CHARCOAL CAPS eyebrow 'ROZWIAZANIE', a Space Grotesk "
 "headline 'Przyklej telefon magnesem i odzyskaj obie rece' and THREE positive bullets with EMERALD "
 "outline CHECK icons: 'Magnes 16 neodymow trzyma mocno — nie spada w ruchu', 'Kadr z Twojej "
 "perspektywy (POV)', 'Obie rece wolne do roboty'. Product sharp. ")

S["05-demo-m"] = ("prod", "1024x1536",
 "MOBILE DEMO 1-2-3 (portrait 2:3) on bone. ABOVE the steps a rounded viz (viewfinder brackets, REC "
 "pill) of hands snapping the phone onto the magnetic ring. BELOW, the THREE step cards STACKED into a "
 "single VERTICAL column with a connecting line (NEVER side-by-side): '01 Zaloz obrecz na szyje' (active, "
 "emerald), '02 Przyklej telefon magnesem', '03 Ustaw kat i nagrywaj', each with a circular Space "
 "Grotesk number badge and a Hanken caption. Header: CHARCOAL CAPS eyebrow 'JAK TO DZIALA', Space "
 "Grotesk h2 'Trzy ruchy i nagrywasz'. ")

S["06-zastosowania-m"] = ("prod", "1024x1536",
 "MOBILE USE-CASES (portrait 2:3) on bone. Header: CHARCOAL CAPS eyebrow 'TWOJA TRZECIA REKA', Space "
 "Grotesk h2 'Wszedzie, gdzie chcesz miec wolne rece'. Below, a single VERTICAL stack of FOUR "
 "photographic tiles (radius 18, even gaps), each a person WEARING the neck mount recording in a setting "
 "with a charcoal/white kicker + Space Grotesk title in a bottom gradient: 'KUCHNIA — nagraj przepis z "
 "gory', 'WARSZTAT / DIY — pokaz robote z bliska', 'SPORT — krec trening w ruchu', 'RODZIC — chwila z "
 "dzieckiem'. Warm daylight, full-width tiles stacked, NEVER slivers side-by-side. ")

S["10-mid-cta-m"] = ("prod", "1024x1536",
 "MOBILE MID-CTA (portrait 2:3). A warm EVENING city-street scene of a creator with the neck mount "
 "filming fills the TOP (a deliberate DARK section, deep green-black), warm bokeh, viewfinder brackets + "
 "REC pill. BELOW, centered on a dark surface: a light CAPS eyebrow 'TWOJ KADR, TWOJE TEMPO', a Space "
 "Grotesk WHITE headline 'Przestan walczyc z telefonem', a full-width DESIGNED EMERALD CTA 'Zamow "
 "Nakrecika — 124,90 zl' (dark text), and a small light line 'Placisz przy odbiorze · zwrot 14 dni.'. "
 "Order headline -> CTA -> reassurance. ")

S["14-zamow-m"] = ("prod", "1024x1536",
 "MOBILE ORDER / inline checkout (portrait 2:3), phone-first single column, on warm BONE #FAF7F1. TOP: a "
 "clean studio PACKSHOT of the graphite neck mount on a plain warm-light field with two small colour "
 "swatches ('Grafit' active, 'Zielen'). BELOW: an inline CHECKOUT card (radius 18, hairline, EMERALD top "
 "edge-line) with a CHARCOAL CAPS eyebrow 'ZAMOWIENIE', a Space Grotesk ink title 'Zamow Nakrecika', a "
 "summary row (thumbnail + 'Nakrecik' + price '124,90 zl'), a highlighted 'Platnosc przy odbiorze "
 "(COD)', stacked form fields 'Imie i nazwisko', 'Telefon', 'Adres', a full-width EMERALD CTA 'Kup teraz "
 "— place przy odbiorze' (dark text), and a small line 'Zwrot 14 dni · wysylka z Polski'. ")

S["16-final-m"] = ("prod", "1024x1536",
 "MOBILE FINAL (portrait 2:3). A calm warm golden-hour park scene of a creator walking hands-free with "
 "the phone on the neck mount fills the TOP (a deliberate DARK section, deep green-black shadows), a few "
 "drifting leaves, viewfinder brackets + REC pill. BELOW, centered on a dark scrim: a light CAPS eyebrow "
 "'TWOJ KADR, OBIE RECE WOLNE', a Space Grotesk WHITE headline 'Nagraj to, co robisz — z wlasnej "
 "perspektywy', a full-width DESIGNED EMERALD CTA 'Zamawiam Nakrecika' (dark text), a Space Grotesk "
 "price '124,90 zl', and a one-line pay-row 'Przy odbiorze · Zwrot 14 dni · z Polski'. ")

index = []
for name, (ref, size, body) in S.items():
    parts = [UI, body, STYLE]
    if ref == "prod":
        parts.append(PROD)
    parts.append(NEG)
    txt = "".join(parts)
    io.open(os.path.join(HERE, "p-%s.txt" % name), "w", encoding="utf-8").write(txt)
    index.append({"name": name, "size": size, "ref": ref})

io.open(os.path.join(HERE, "_index.json"), "w", encoding="utf-8").write(
    json.dumps(index, ensure_ascii=False, indent=1))
print("napisano %d promptow" % len(index))
for it in index:
    print(" ", it["name"], it["size"], it["ref"] or "gen")

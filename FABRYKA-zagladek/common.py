# -*- coding: utf-8 -*-
"""Wspolne fragmenty promptow makiet ZAGLADEK — SSOT tekstu wstrzykiwanego do KAZDEGO promptu
(prompt-cache: staly akapit serii). Zrodlo tokenow = PLAN.md partytura (TOKENS-MAKIETY.md w F2.5).
Motyw: „Swiatlo sondy odslania niewidoczne" — kieszen ciemnosci = OBIEKT w kadrze, nie tlo sekcji."""

# STYLE-DNA — niezmienny akapit serii. Idzie na KONIEC kazdego promptu.
DNA = (
 'STYLE-DNA: light WARM WORKSHOP GREIGE page #F3EEE4 with cool technical-white section bands '
 '#F7F9F8 and cream cards #FFFDF8 (a real garage / home-utility / workbench world in warm working '
 'daylight — NEVER a dark "pro-tool" interface, NEVER cold clinical white, NEVER neon); the ONLY '
 'darkness allowed lives INSIDE an inspection cavity (engine bay, pipe, wall void, gap) as a '
 'contained object inside the frame, always carrying its own solution — an amber 8-LED glow or a '
 'lit phone screen — while the page, its sections and copy zones NEVER turn dark; ink #1B211F, '
 'secondary ink #56605C, hairlines in warm greige; EXACTLY ONE accent — a luminous LED amber '
 '#EFA019 derived from the real amber glow of the product\'s eight-LED ring — used ONLY for: the '
 'CTA button, the active step/toggle state, the VIEWFINDER-BRACKET signature corners and the '
 'selected-variant highlight; light amber states use tints of the SAME gold (e.g. #FFF3D2); the CTA '
 'is amber #EFA019 with DARK ink text #1B1406 (WCAG-safe — NEVER white text on the amber, contrast '
 'of white on #EFA019 is only ~2.2:1); ALL functional icons are thin 1.75px OUTLINE in ink, NEVER '
 'amber; display font Archivo (industrial precise grotesk, weights 700/800) for headlines, short '
 'labels, parameter names, big numbers and the CTA; text font IBM Plex Sans (calm humanist sans, '
 'weights 400/500/600) for eyebrows, leads, body, specs, FAQ and reviews — an OBVIOUS contrast '
 'between the TIGHT INDUSTRIAL display grotesk and the CALM HUMANIST text sans (never one typeface '
 'for everything); one series radius 12px on cards / 8px on chips; SIGNATURE = thin AMBER VIEWFINDER '
 'BRACKETS (four small camera-viewfinder corner marks framing a card, a media frame or the active '
 'detail — like framing a shot through the probe), ALWAYS the same style, at most one framing per '
 'section; trust-pills: cream fill #FFFDF8, 1px hairline border, ink text, one global style; soft '
 'LAYERED warm-neutral shadows (never pure black) plus a subtle 2-4% grain on the bands; light '
 'backgrounds only. Polish diacritics correct. No browser chrome, no outer device frame wrapping the '
 'section, crisp UI. ')

# Wiernosc produktu (geometria z refu; NEG z PASZPORTU).
PROD = (
 'The product must faithfully match the reference image: a WIRED phone inspection camera (endoscope) '
 '— a BLACK metal head with a ring of EXACTLY EIGHT LEDs (warm gold/amber) around the central lens '
 '(head diameters 8 mm and 5.5 mm), a FLEXIBLE / semi-rigid gooseneck just behind the head, a BLACK '
 'cable (rigid or coiled, 1-10 m), a rectangular CONTROL MODULE on the cable with a brightness DIAL '
 '(an engraved sun icon and a "-/+" scale), and a 2-IN-1 PLUG — a USB-C body with a short attached '
 'Lightning tail; the live image appears ONLY on the smartphone (the device itself has NO screen); '
 'included accessories: a hook, a magnet spring and a side mirror plus a small manual. NEG: no '
 'built-in screen/monitor on the device (image only on the phone), no wifi box, no battery, no '
 'zoom/autofocus, no full waterproofing (IP67 = lens only), no printed brand text or logo on the '
 'body (white-label — never "DUTRIEUX" / "ZCF-004" / "GLODEER"), no Type-C port ON the camera module '
 '(the phone connector is the 2-in-1), no second probe, keep EXACTLY EIGHT LEDs (do not add or '
 'remove diodes), do not change the black cable / probe colour. ')

# Casting (ICP §5).
ANAT = (
 'Casting: the hands of a hobbyist / DIY home-mechanic 30-55 with natural hands (five fingers, '
 'correct anatomy), face off-frame, cropped or turned away (never emphasised), working / casual '
 'clothing; NEVER children, NEVER faces to camera, NEVER stock-photo grins at camera, NEVER medical '
 'or diver figures, NEVER stressed or fearful scenes. ')

HEAD_D = (
 'High-fidelity DESKTOP landing page SECTION mockup on a 3:2 landscape board, the section shown '
 'full-width like a real webpage fragment (~1280px design), Figma-style, pixel-perfect, clean '
 'modern design system, Polish e-commerce. ')

HEAD_M = (
 'High-fidelity MOBILE landing page SECTION mockup on a 2:3 portrait board (~390px design), a '
 'real phone-width webpage fragment designed FOR mobile (not a squeezed desktop), Figma-style, '
 'pixel-perfect, Polish e-commerce. ')

# Blok wykluczen — idzie na koniec (przed DNA). Twarde zakazy z KARTA-PRAWDY/PASZPORT + standardowe.
EXCL = (
 ' STRICT: EXACTLY ONE SECTION AND NOTHING ELSE. Flat edge-to-edge section screenshot, no browser '
 'chrome, no URL bar, no tabs, no device/phone bezel wrapping the whole section, no outer mockup '
 'shadow. No watermark, no lorem ipsum, no crossed-out prices, no bestseller / "NR 1 w Polsce" '
 'badges, no free-shipping claims, no fake urgency, no countdown timers, no low-stock counters. '
 'Star ratings, review counts and "sold" numbers appear ONLY inside a dedicated reviews section — '
 'NOWHERE else and NEVER over the fold. No section numbering like "01 / 13" printed on the page '
 '(in-card step numbers 1/2/3 inside the demo stepper are allowed). HARD CONTENT BANS: NO built-in '
 'screen on the device (image ONLY on the phone), NO wifi box, NO battery, NO Type-C port on the '
 'camera module, NO printed brand text or logo on the body (white-label), EXACTLY EIGHT LEDs on the '
 'head, NO second probe, NO underwater full-immersion and NO medical scenes, no invented specs '
 'beyond "3 MP", "1920x1440", "30 FPS", "8 LED", "70", "2-10 cm", "IP67", "8 mm / 5,5 mm" and '
 'lengths "1/2/3,5/5/10 m". Prices only "74,90 zl". Light greige / cool-white backgrounds ONLY — '
 'absolutely NO dark section backgrounds (darkness only CONTAINED inside an inspection cavity, '
 'always carrying an amber LED glow or a lit phone screen), NO cold clinical or neon tech look. '
 'No extra text beyond the quoted Polish strings. ')

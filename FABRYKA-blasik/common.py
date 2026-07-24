# -*- coding: utf-8 -*-
"""Wspolne fragmenty promptow makiet BLASIK — SSOT tekstu wstrzykiwanego do KAZDEGO promptu
makiety (prompt-cache: staly akapit serii). Zrodlo tokenow = PLAN.md partytura + FILTR-KOREKTA v2
(TOKENS-MAKIETY.md w F2.5). Latarka czolowa LED: czarny korpus + zolto-limonkowa listwa COB +
reflektor XPE + czujnik ruchu; motyw „swiatlo niesione tam, gdzie patrzysz"."""

# STYLE-DNA — niezmienny akapit serii. Idzie na KONIEC kazdego promptu.
DNA = (
 'STYLE-DNA: bright DAY page background #F2F1EC (a clean, cool-warm "linen and workshop concrete '
 'in daylight" tone) with an alternate light plane #E6E8E3 and white cards #FFFFFF — the page is '
 'ALWAYS a bright well-lit workbench in daylight, NEVER a cold grey automotive-tech look, NEVER '
 'cream/ivory, NEVER a dark or neon page; warm graphite ink #292722, hairlines in soft warm grey; '
 'EXACTLY ONE accent — a signal COB yellow #D9BE00 derived from the real yellow-lime COB strip of '
 'the product — used ONLY for: the CTA button (yellow fill with a DARK warm ink #1B1406 label, '
 'taxi-sign contrast — NEVER white text on the yellow), the ACTIVE mode in the demo toggle, the '
 'arc/beam signature, the focus ring and the selected state; ALL functional icons are thin 1.75px '
 'OUTLINE in ink #292722, NEVER yellow; display font Gabarito (rounded geometric, weights 700/800) '
 'for headlines and prices — reads like a solid, warm tool-plate; text font Karla (calm humanist '
 'sans, weights 400/600/700) for eyebrows, body, specs, FAQ and checkout — an obvious CONTRAST '
 'between the solid rounded DISPLAY and the calm instructional TEXT (never one typeface for '
 'everything); one series radius 12px on cards / 8px on chips; SIGNATURE = a single sensor ARC / '
 'beam mark "((·))" (encoding both the motion sensor and light spreading out), used as a small '
 'accent by a hook / section heading / CTA, at most one per section, always the same shape; '
 'trust-pills: light #F2F1EC fill, 1px hairline border, ink text, one global style; soft LAYERED '
 'shadows (warm neutral, never pure black) plus a subtle 2-4% grain on the light bands. '
 'BOUNDED-MROK is the scene rule: the surrounding page stays bright #F2F1EC and darkness exists '
 'ONLY inside a bounded scene panel whose edges melt into the light page — never a full-black '
 'section, never a dark page chrome. Polish diacritics correct. No watermarks, no phone frames, '
 'crisp UI. ')

# Wiernosc produktu (geometria z PASZPORTU; NEG z KARTA-PRAWDY). Wklejany do seedow scenowych.
PROD = (
 'The product must faithfully match the reference images: a Blasik LED headlamp — a curved black '
 'soft-silicone headband, a WIDE yellow-lime COB light strip running along the front (yellow when '
 'off, glowing wide white-yellow when lit), a round XPE reflector spot on the module (a tight '
 'white beam when lit), the module on ONE side of the band ONLY (asymmetric — never duplicate it), '
 'two control buttons on the module (a power button and a wave-sensor button), a small RED battery '
 'indicator LED (never a percentage screen), a grey textured non-slip insert on the band sides and '
 'a plastic adjustment buckle, and a USB charging port. ONE look only: black body + yellow COB '
 'strip (no colour variants). NEG: no Type-C port, no printed brand text or logo on the body '
 '(white-label — never "Heinast", "BIAT" or "LX300"), no lumens number and no "230" printed '
 '(beam is 180 deg), no hard runtime number, no sound/clap sensor (motion sensor only), no second '
 'headlamp, no batteries shown separately (built-in), no clips or mounting hooks, no colour '
 'swatches, no battery percentage screen, no underwater scenes (IPX4 = rain only), and never a '
 'beam colour change on the product. ')

# Casting (ICP §5) — czolo/dlonie/sylwetki bez wyeksponowanych twarzy.
ANAT = (
 'Casting: a maker/adult owner 25-50 with natural hands (five fingers, correct anatomy), the '
 'forehead or the side of the head shown wearing the headlamp but the FACE off-frame, cropped or '
 'turned away (never emphasised), practical everyday clothing; gloved hands allowed for the sensor '
 'gesture; silhouettes for outdoor-night tiles. NEVER children alone in the dark, NEVER frightened '
 'or dramatic "problem" faces, NEVER rescue / military / tactical casting, no stock-photo grins at '
 'the camera. ')

HEAD_D = (
 'High-fidelity DESKTOP landing page SECTION mockup on a 3:2 landscape board, the section shown '
 'full-width like a real webpage fragment (~1280px design), Figma-style, pixel-perfect, clean '
 'modern design system, Polish e-commerce. ')

HEAD_M = (
 'High-fidelity MOBILE landing page SECTION mockup on a 2:3 portrait board (~390px design), a '
 'real phone-width webpage fragment designed FOR mobile (not a squeezed desktop), Figma-style, '
 'pixel-perfect, Polish e-commerce. ')

# Blok wykluczen — idzie na koniec (przed DNA). Twarde zakazy z KARTA-PRAWDY/PASZPORT/Globalny CUT.
EXCL = (
 ' STRICT: EXACTLY ONE SECTION AND NOTHING ELSE. Flat edge-to-edge section screenshot, no browser '
 'chrome, no URL bar, no tabs, no device/phone frame, no outer mockup shadow. No watermark, no '
 'lorem ipsum, no crossed-out prices, no bestseller / "NR 1 w Polsce" badges, no free-shipping '
 'claims, no fake urgency, no countdown timers, no low-stock counters. SOCIAL PROOF DISCIPLINE: '
 'NO star ratings, NO review counts, NO "% positive" and NO customer quotes in the hero, the trust '
 'strip, the mid-cta or the checkout / above the fold — the rating (4,7/5 and 3095 ocen) may '
 'appear ONLY inside the dedicated opinie section below the fold. No section numbering like '
 '"01 / 12" printed on the page. HARD CONTENT BANS (white-label headlamp): NO printed brand text '
 'or logo on the body (never "Heinast", "BIAT" or "LX300"), NO Type-C port, NO lumens number, NO '
 '"230" (beam is 180 deg), NO hard runtime hours, NO sound/clap sensor (motion only), NO colour '
 'variants or swatches, NO clips/mounting hooks, NO battery percentage screen (only a small red '
 'indicator LED), NO "wodoodporna" wording and NO submersion (IPX4 = rain/splash only), NO second '
 'headlamp, NO beam colour change on the product, NO batteries shown separately. Prices only '
 '"14,90 zl". No invented numbers beyond 180 deg, 3 W, 3,7 V, IPX4, ~68 g, 6 modes, ~10 cm and '
 '(soft) 1200 mAh. Bright #F2F1EC / #E6E8E3 / white backgrounds only — darkness ONLY inside a '
 'bounded scene panel with edges melting into the light page, absolutely NO full-black section '
 'and NO dark page chrome. No extra text beyond the quoted Polish strings. ')

# -*- coding: utf-8 -*-
"""Wspolne fragmenty promptow makiet GADULEK — SSOT tekstu wstrzykiwanego do KAZDEGO promptu
(prompt-cache: staly akapit serii). Zrodlo tokenow = TOKENS-MAKIETY.md (KANON+PARTYTURA)."""

# STYLE-DNA — niezmienny akapit serii (z TOKENS-MAKIETY.md). Idzie na KONIEC kazdego promptu.
DNA = (
 'STYLE-DNA: warm CREAM / ivory picture-book page #FFF8EF with off-white cards #FFFDF9 and soft '
 'PEACH bands #FFE9DC — sections clearly ALTERNATE cream and warm PEACH, the peach band is a '
 'background SIGNATURE of this brand (a cheerful bright kids world — NEVER dark, NEVER cold grey, NEVER neon, '
 'NEVER amber/green/azure UI); ink #3C1F28, body text #574C44, hairlines #F0E2D6; EXACTLY ONE '
 'accent — a warm RASPBERRY pink #C5265B derived from the pink device — used ONLY for: the CTA '
 'button, a short soft italic underline-swash under ONE headline word, star glyphs in the reviews '
 'section, active/selected states and the signature "signal wave"; ALL functional icons are thin '
 '1.9px OUTLINE in ink/charcoal, NEVER raspberry; display font Fredoka (a rounded, soft, chunky '
 'playful toy-brand grotesk, weights 600/700) for headlines, hero H1, prices and BIG numbers; text '
 'font Alegreya Sans (weights 400/500/700) for eyebrows, body, labels, specs and long numbers — an '
 'obvious CONTRAST between the rounded chunky display and the warm humanist text (never one '
 'typeface for everything, never a cold monospace); one series radius 20px on cards / 12px on small '
 'chips (soft, toy-like rounding); SIGNATURE "malinowa fala miedzy okienkami" = a soft raspberry '
 'SIGNAL-WAVE line that flows out of one device antenna and into the other screen, plus little '
 'plus-marks "+", small wave ticks and rounded picture-book screen-frame corners, repeated as '
 'section dividers (NEVER a WiFi symbol — it is device-to-device talk); trust-pills: cream fill '
 '#FFF8EF, 1px hairline border, ink text, one global style; soft LAYERED WARM shadows (sepia-pink '
 'tinted rgba(120,40,70,.06-.12), never pure black) plus a subtle 2-4% grain; light warm '
 'backgrounds only; the product is ALWAYS a pair of pastel kids walkie-talkies (one powder-BLUE, '
 'one PINK) with a live screen. Polish diacritics correct. No watermarks, no phone frames, crisp UI. ')

# Wiernosc produktu (F1: geometria z refu; opis tylko dyskryminujacy + NEG z PASZPORTU).
PROD = (
 'The kids walkie-talkie shown must faithfully match the product reference image (image 1): a small '
 'PASTEL matte-plastic kids two-way radio with a VERTICAL ROUNDED rectangular toy body, a SHORT '
 'stubby slightly angled ANTENNA with small wave/signal marks near its base (NOT a long telescopic '
 'antenna), a round CAMERA lens at the top-front centred ABOVE the screen, a 2.0-inch SCREEN with a '
 'thick rounded bezel (NOT edge-to-edge) showing a childs smiling face or colourful UI, a '
 'vertical-slit SPEAKER grille below the screen, a large OVAL side TALK button, small +/- and power '
 'buttons on the side, a lanyard loop at the top corner and a Type-C port at the bottom. The set is '
 'a PAIR: one powder-BLUE and one PINK. NEG: NOT a smartphone or smartwatch, NO touchscreen '
 'gestures, NO full-face edge-to-edge screen, NO telescopic or long CB antenna, NO metal/aluminium '
 'body, NO waterproof rubber seals, NO SIM tray, NO printed brand text or logo ("magecam") anywhere '
 'on the body/screen/box, NO black dead screen (always a face or UI on it). ')

# Osoby w scenach (casting z ICP §5).
ANAT = (
 'People in scenes: happy CHILDREN aged 4-7 — a boy and a girl — realistic everyday kids (NOT '
 'fashion models), natural joyful expressions, ordinary clothes, in a real Polish home or garden; '
 'a childs hands with correct human anatomy (five natural fingers) holding the device; a parent '
 '(a mother) may appear ONLY in the background in the room-to-room calling scene. NEVER a teenager '
 'or adult as the MAIN user, never stock-glamour, never a military/tactical/survival mood. ')

HEAD_D = (
 'High-fidelity DESKTOP landing page SECTION mockup on a 3:2 landscape board, the section shown '
 'full-width like a real webpage fragment (~1280px design), Figma-style, pixel-perfect, clean '
 'modern kids-brand design system, Polish e-commerce. ')

HEAD_M = (
 'High-fidelity MOBILE landing SECTION mockup, a 390px-wide phone layout on a 2:3 portrait board, '
 'Figma-style, pixel-perfect, clean kids-brand design system, Polish e-commerce. Image 1 = the '
 'DESKTOP mockup of THIS exact section: keep the SAME Polish copy, the same photos, the same '
 'product look and component styles, but REDESIGN it into ONE narrow single column FOR PHONE (never '
 'a squeezed desktop, never 3 items side-by-side — stack into a vertical column with big tap '
 'targets). Image 2 = style reference ONLY (never copy its tiles onto the page). ')

# Blok wykluczen — na koniec (przed DNA). Twarde zakazy Z KARTY + standardowe.
EXCL = (
 ' STRICT: EXACTLY ONE SECTION AND NOTHING ELSE. Flat edge-to-edge section screenshot, no browser '
 'chrome, no URL bar, no tabs, no device/phone frame, no outer mockup shadow. No watermark, no '
 'lorem ipsum, no crossed-out prices, no bestseller / "NR 1 w Polsce" badges, no free-shipping '
 'claims, no fake urgency. NO star ratings, NO review counts and NO "sold" counters ABOVE THE FOLD '
 '(topbar / hero) — they belong only inside the reviews section lower down. No section numbering '
 'like "01 / 13". HARD CONTENT BANS: NO "magecam" or "Magecam Choice Store" brand text on the '
 'product, box or page; NO "HD" / "Full HD" / "4K" (video is 480P only); NO range claim over 400 m '
 'and NO "1,5 km"; NO waterproof claim and NO rain/water/pool scenes (it is NOT waterproof); NO '
 '"certyfikowany" / "CE" / safety or developmental claims; no invented dimensions or specs; no '
 'watts as a selling number. Light warm cream backgrounds only, absolutely no dark sections. Prices '
 'only "89,90 zl" (always for the 2-pack). No extra text beyond the quoted Polish strings. ')

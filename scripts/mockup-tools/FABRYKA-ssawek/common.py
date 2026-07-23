# -*- coding: utf-8 -*-
"""Wspolne fragmenty promptow makiet SSAWEK (Popiolek) — SSOT tekstu wstrzykiwanego do KAZDEGO
promptu (prompt-cache: staly akapit serii). Zrodlo tokenow = TOKENS-MAKIETY.md (KANON+PARTYTURA)."""

# STYLE-DNA — niezmienny akapit serii (z TOKENS-MAKIETY.md). Idzie na KONIEC kazdego promptu.
DNA = (
 'STYLE-DNA: warm SAND / whitened-concrete page #F3EDE4 with section bands #E9E1D3, deeper sand '
 '#DACFBC and off-white cards (a workshop/hearth warm-greige world — NEVER cream-yellow, NEVER '
 'cool grey, NEVER dark, NEVER neon); ink #1C1815, body text #2E2620, hairlines #D7C9B3; EXACTLY '
 'ONE accent — a deep industrial vermilion red #C2381B derived from the product red lid — used '
 'ONLY for: the CTA button, a short soft italic underline-swash under ONE headline word, and star '
 'glyphs in the reviews section; ALL functional icons are thin 1.75px OUTLINE in ink/charcoal, '
 'NEVER red; display font Barlow Semi Condensed (condensed industrial grotesk, weights 700/800) '
 'for headlines, prices and BIG numbers; text font Hanken Grotesk (weights 400/600/700) for '
 'eyebrows, body, labels, specs and long numbers — an obvious contrast between the CONDENSED '
 'display and the NORMAL-WIDTH humanist text (never one typeface for everything, never a cold '
 'monospace); one series radius 14px on cards / 8px on small chips; SIGNATURE "S6 znacznik-rozek" '
 '= a single angular CHAMFERED / cut corner on cards and photo frames, ALWAYS on the same corner, '
 'echoing a metal bracket or a machine rating-plate, repeated across sections; trust-pills: sand '
 'fill #F3EDE4, 1px hairline border, ink text, one global style; soft LAYERED WARM shadows '
 '(sepia-tinted, never pure black) plus a subtle 2-4% grain on the bands; light backgrounds only; '
 'the product is ALWAYS a short stainless-steel canister with a RED domed lid, black wheeled base, '
 'twin metal clamps and a black corrugated hose. Polish diacritics correct. No watermarks, no '
 'phone frames, crisp UI. ')

# Wiernosc produktu (F1: geometria z refu; opis tylko dyskryminujacy + NEG z PASZPORTU).
PROD = (
 'The industrial ash/debris vacuum shown must faithfully match the product reference image '
 '(image 1): a SHORT, squat STAINLESS-STEEL cylindrical canister (a barrel) with two horizontal '
 'ribs low on the body, a bright RED domed plastic lid carrying a black carry-handle bar and a '
 'single black rocker on/off switch, TWO chromed spring clamps latching the lid to the tank, a '
 'round BLACK plastic base on four small swivel casters, a black corrugated flexible hose from a '
 'side intake, and silver metal wand tubes. NEG: NO printed brand text or logo on the tank (plain '
 'polished steel), NO lid colour other than RED (never yellow/blue/orange/green), NO paper-bag or '
 'bag compartment (it is bagless), NO tall upright or tube-vacuum shape, NO push-rod steering '
 'handle (only the top carry bar), NO digital display, screen or knobs (a single rocker switch '
 'only), NO engraving or decorative pattern on the steel. ')

# Osoba (casting z ICP §5).
ANAT = (
 'Person: an adult householder / handy person aged 40-55 with a realistic everyday build (NOT a '
 'fashion model), face off-frame or cropped above the shoulders or turned away (never emphasised), '
 'practical home/work clothing — a sweater, flannel shirt or work hoodie, never a suit and never '
 'stock-glamour; hands with correct human anatomy, five natural fingers, straight wrists, a '
 'natural working grip; hands may be lightly ash-dusted when near the ash. ')

HEAD_D = (
 'High-fidelity DESKTOP landing page SECTION mockup on a 3:2 landscape board, the section shown '
 'full-width like a real webpage fragment (~1280px design), Figma-style, pixel-perfect, clean '
 'modern design system, Polish e-commerce. ')

HEAD_M = (
 'High-fidelity MOBILE landing SECTION mockup, a 390px-wide phone layout on a 2:3 portrait board, '
 'Figma-style, pixel-perfect, clean design system, Polish e-commerce. Image 1 = the DESKTOP '
 'mockup of THIS exact section: keep the SAME Polish copy, the same photos, the same product look '
 'and component styles, but REDESIGN it into ONE narrow single column FOR PHONE (never a squeezed '
 'desktop, never 3 items side-by-side — stack into a vertical column with big tap targets). Image '
 '2 = style reference ONLY (never copy its tiles onto the page). ')

# Blok wykluczen — na koniec (przed DNA). Twarde zakazy Z KARTY + standardowe.
EXCL = (
 ' STRICT: EXACTLY ONE SECTION AND NOTHING ELSE. Flat edge-to-edge section screenshot, no browser '
 'chrome, no URL bar, no tabs, no device/phone frame, no outer mockup shadow. No watermark, no '
 'lorem ipsum, no crossed-out prices, no bestseller / "NR 1 w Polsce" badges, no free-shipping '
 'claims, no fake urgency. NO star ratings, NO review counts and NO "sold" counters ABOVE THE FOLD '
 '(topbar / hero) — they belong only inside the reviews section lower down. No section numbering '
 'like "01 / 16". HARD CONTENT BANS: NO "antystatyczny" / anti-static claim anywhere, NO "99,99%" '
 'figure, NO "silnik 2000 W" (only the wording "moc maksymalna 2000 W"), NO "Lehmann" / "Haddo" / '
 '"Lehmann Tools" brand text on the product or page, no shop name, no Prüfengel or certificate '
 'badge, no invented dimensions or weights. Light warm sand backgrounds only, absolutely no dark '
 'sections. Prices only "119 zł". No extra text beyond the quoted Polish strings. ')

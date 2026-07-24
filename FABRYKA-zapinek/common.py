# -*- coding: utf-8 -*-
"""Wspolne fragmenty promptow makiet ZAPINEK — SSOT tekstu wstrzykiwanego do KAZDEGO promptu
(prompt-cache: staly akapit serii). Zrodlo tokenow = PLAN.md partytura (TOKENS-MAKIETY.md w F2.5)."""

# STYLE-DNA — niezmienny akapit serii. Idzie na KONIEC kazdego promptu.
DNA = (
 'STYLE-DNA: warm IVORY page #FBF7F1 with sandy-cream section bands #EFE5DA and off-white cards '
 '#FFFDFC (a warm, caring, softly sunlit world of car interiors and green walks — NEVER cold grey, '
 'NEVER dark, NEVER neon, NEVER clinical white); ink #27212B (plum-graphite), hairlines in warm '
 'beige; EXACTLY ONE accent — a rich violet #7440A8 derived from the real purple webbing of the '
 'product — used ONLY for: the CTA button, the active state of the toggle, ONE short stitch-line '
 'signature per section and the selected-variant highlight; ALL functional icons are thin 1.75px '
 'OUTLINE in ink, NEVER violet; display font Fraunces (soft warm serif with character, weights '
 '600/700) for headlines and prices; text font Manrope (clean geometric-humanist sans, weights '
 '400/600/700) for eyebrows, body, labels and specs — an obvious contrast between the WARM SERIF '
 'display and the CLEAN SANS text (never one typeface for everything); one series radius 16px on '
 'cards / 10px on chips; SIGNATURE "stitching" = a single short DASHED stitch-line (like the '
 'sewn seam of nylon webbing) used as a separator or guide-line, ALWAYS the same style, at most '
 'one per section; trust-pills: ivory fill #FBF7F1, 1px hairline border, ink text, one global '
 'style; soft LAYERED WARM shadows (sepia-tinted, never pure black) plus a subtle 2-4% grain on '
 'the bands; light backgrounds only. Polish diacritics correct. No watermarks, no phone frames, '
 'crisp UI. ')

# Wiernosc produktu (geometria z refu; NEG z PASZPORTU).
PROD = (
 'The product must faithfully match the reference image: a PURPLE nylon-webbing car safety belt '
 'for dogs — a headrest loop strap closed with a BLACK PLASTIC snap-lock buckle and a BLACK '
 'PLASTIC length adjuster (headrest strap adjusts 40-55 cm), joined through a SILVER METAL '
 'triangular ring to an adjustable purple webbing tether (41-71 cm) ending in a SILVER SWIVEL '
 'bolt-snap carabiner that rotates; on the webbing sits EXACTLY ONE decorative 3D fabric flower '
 'charm (purple petals, yellow centre); an alternative attachment exists: a black seat-belt '
 'tongue that clicks into the car buckle receptacle. NEG: no metal adjuster buckles (adjusters '
 'are black plastic), no printed logos or brand text on the webbing, no retractable-leash '
 'mechanism, no harness and no collar included (dogs wear their OWN collar/harness), exactly ONE '
 'flower charm, do not change the webbing colour away from purple unless the brief explicitly '
 'says the black variant, no extra flowers, no studded or leather straps. ')

# Casting (ICP §5).
ANAT = (
 'Casting: a calm mid-size family dog (beagle or golden retriever, like in the reference photos) '
 'wearing its OWN collar or harness; adult owner 25-45 with natural hands (five fingers, correct '
 'anatomy), face off-frame, cropped or turned away (never emphasised), casual warm clothing '
 '(sweater/cardigan); NEVER children, NEVER frightened or stressed dogs, NEVER crash scenes, '
 'no stock-photo grins at camera. ')

HEAD_D = (
 'High-fidelity DESKTOP landing page SECTION mockup on a 3:2 landscape board, the section shown '
 'full-width like a real webpage fragment (~1280px design), Figma-style, pixel-perfect, clean '
 'modern design system, Polish e-commerce. ')

HEAD_M = (
 'High-fidelity MOBILE landing page SECTION mockup on a 2:3 portrait board (~390px design), a '
 'real phone-width webpage fragment designed FOR mobile (not a squeezed desktop), Figma-style, '
 'pixel-perfect, Polish e-commerce. ')

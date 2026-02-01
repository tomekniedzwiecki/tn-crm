-- VibeStrike Branding Data for workflow 01523ee9-c545-4748-9f18-ebf00eca17e8
-- Uruchom w Supabase SQL Editor
-- UWAGA: Najpierw uruchom migrację 20260201_branding_extended_types.sql

-- Wyczyść istniejące dane brandingowe dla tego workflow
DELETE FROM workflow_branding
WHERE workflow_id = '01523ee9-c545-4748-9f18-ebf00eca17e8'
  AND type IN ('brand_info', 'color', 'font');

-- ═══════════════════════════════════════════════════════
-- 1. BRAND INFO
-- ═══════════════════════════════════════════════════════
INSERT INTO workflow_branding (workflow_id, type, title, value, sort_order) VALUES (
  '01523ee9-c545-4748-9f18-ebf00eca17e8',
  'brand_info',
  'VibeStrike',
  '{"name":"VibeStrike","domain":"vibestrike.pl","tagline":"Uderz w rytm. Poczuj energię.","description":"VibeStrike to marka inteligentnych systemów treningowych, które łączą dynamikę boksu z energią muzyki. Zamieniamy Twój salon w interaktywną arenę fitness — bez nudy, bez wymówek, bez wychodzenia z domu. Nasz flagowy produkt to muzyczna maszyna bokserska z systemem LED i Bluetooth, która sprawia, że każdy trening staje się wciągającą grą. Dla tych, którzy chcą rozładować stres, spalić kalorie i bawić się przy tym lepiej niż na imprezie."}',
  0
);

-- ═══════════════════════════════════════════════════════
-- 2. KOLORY — paleta "electric": czerń + neonowe akcenty LED RGB
-- ═══════════════════════════════════════════════════════

INSERT INTO workflow_branding (workflow_id, type, title, value, notes, sort_order) VALUES
  ('01523ee9-c545-4748-9f18-ebf00eca17e8', 'color', 'Electric Blue',  '#00D4FF', '{"role":"primary"}',   0),
  ('01523ee9-c545-4748-9f18-ebf00eca17e8', 'color', 'Neon Magenta',   '#FF2D78', '{"role":"secondary"}', 1),
  ('01523ee9-c545-4748-9f18-ebf00eca17e8', 'color', 'Acid Lime',      '#C8FF00', '{"role":"accent"}',    2),
  ('01523ee9-c545-4748-9f18-ebf00eca17e8', 'color', 'Deep Black',     '#0A0A0A', '{"role":"neutral"}',   3),
  ('01523ee9-c545-4748-9f18-ebf00eca17e8', 'color', 'Anthracite',     '#1A1A2E', '{"role":"neutral"}',   4),
  ('01523ee9-c545-4748-9f18-ebf00eca17e8', 'color', 'Pure White',     '#FFFFFF', '{"role":"neutral"}',   5);

-- ═══════════════════════════════════════════════════════
-- 3. CZCIONKI — dynamiczna typografia, sportowa ale przystępna
-- ═══════════════════════════════════════════════════════

INSERT INTO workflow_branding (workflow_id, type, title, value, notes, sort_order) VALUES
  ('01523ee9-c545-4748-9f18-ebf00eca17e8', 'font', 'Bebas Neue', 'heading', '{"role":"heading","weights":["400"]}',              0),
  ('01523ee9-c545-4748-9f18-ebf00eca17e8', 'font', 'Inter',      'body',    '{"role":"body","weights":["400","500","600","700"]}', 1),
  ('01523ee9-c545-4748-9f18-ebf00eca17e8', 'font', 'Orbitron',   'accent',  '{"role":"accent","weights":["400","500","700","900"]}', 2);


-- ═══════════════════════════════════════════════════════════════════════
-- PROMPTY DO GENEROWANIA LOGO
-- Skopiuj wybrany prompt i wklej do Gemini / Midjourney / DALL-E
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────
-- LOGO PROMPT 1: Logo główne (ciemne tło)
-- ───────────────────────────────────────
-- Design a bold, high-energy logo for the brand "VibeStrike". The name combines
-- musical "vibe" with a powerful "strike" — the brand sells smart LED boxing machines
-- that sync punches to music. The logo should be typography-driven: "Vibe" in a lighter
-- weight, "Strike" in heavy bold — both in a condensed, athletic typeface similar to
-- Bebas Neue. Between the two words, or integrated into the letter "i" in Strike,
-- place a subtle visual element: a sound wave morphing into a fist, or a single LED
-- target dot in #FF2D78 (neon magenta). Primary color: #00D4FF (electric blue) for
-- "Vibe", white for "Strike". Background: pure black (#0A0A0A). The logo should feel
-- like a neon sign in a dark boxing gym — electric, alive, slightly dangerous.
-- No gradients. Flat neon colors with a faint glow halo. The typography should have
-- kinetic energy — slightly italic or with implied forward motion.
-- Output on transparent background, PNG, 4000x2000px minimum.

-- ───────────────────────────────────────
-- LOGO PROMPT 2: Logo na jasnym tle
-- ───────────────────────────────────────
-- Design a light-background version of the "VibeStrike" logo. The wordmark uses
-- dark anthracite (#1A1A2E) as the primary text color. The "Vibe" portion has a
-- #00D4FF (electric blue) accent — either as an underline, a highlight on one letter,
-- or the LED dot element. Same condensed Bebas Neue-style athletic typography.
-- Clean, professional, readable at small sizes. Suitable for business cards, invoices,
-- light-colored packaging. No glow effects — crisp and sharp.
-- Output on transparent background, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 3: Logo monochromatyczne
-- ───────────────────────────────────────
-- Create two monochrome versions of the "VibeStrike" logo:
-- Version A: Pure white on transparent (for dark backgrounds, embroidery on black fabric)
-- Version B: Pure black on transparent (for light backgrounds, stamps, watermarks)
-- Same athletic condensed typography. The LED dot / sound wave element remains but
-- in the same single color. These versions must work for: laser engraving on metal,
-- single-color screen printing, embossing on leather boxing gloves.
-- Output both versions side by side, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 4: Favicon / ikona aplikacji
-- ───────────────────────────────────────
-- Design an app icon / favicon for "VibeStrike". The icon should be a stylized "VS"
-- monogram or a single abstract symbol combining: a boxing target (circle with LED dots)
-- and a sound wave / equalizer bar. Color: #00D4FF electric blue on black (#0A0A0A)
-- background, with a single #FF2D78 magenta accent dot (the "strike point").
-- The icon must read clearly at 32x32px (browser tab) and 512x512px (app store).
-- Rounded square container. Bold, simple, instantly recognizable — like a gaming app icon.
-- Output as PNG, square format, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 5: Logo z ikoną (combination mark)
-- ───────────────────────────────────────
-- Create a combination mark for "VibeStrike": a standalone icon placed to the left
-- of the wordmark. The icon is an abstract boxing target — a circle divided into
-- segments like an LED boxing machine pad, with 4-6 dots arranged in a ring.
-- The top dot glows #FF2D78 (magenta) as if it's the active target. Other dots are
-- #00D4FF (electric blue) at varying opacity (pulsing effect). A subtle sound wave
-- emanates from the bottom of the circle. The wordmark sits to the right in the same
-- condensed athletic type. Dark background (#0A0A0A). The icon must also work alone
-- as a standalone brand mark (without the text).
-- Output on transparent background, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 6: Logo animowane (concept storyboard)
-- ───────────────────────────────────────
-- Design a logo animation storyboard for "VibeStrike". Show 6 keyframes on one image:
-- Frame 1: Black screen. A single #FF2D78 magenta dot pulses in the center.
-- Frame 2: An equalizer / sound wave in #00D4FF blue appears, pulsing to an implied beat.
-- Frame 3: A fist silhouette strikes the magenta dot — impact flash in #C8FF00 (acid lime).
-- Frame 4: The impact explodes outward, trails form the letters "VibeStrike".
-- Frame 5: Letters settle into position. The LED dot pulses once more.
-- Frame 6: Final logo with subtle breathing glow on the magenta dot.
-- Background: #0A0A0A throughout. Show as cinematic storyboard with frame numbers.
-- Feel: like a boxing round starting — energy builds, strike lands, logo appears.


-- ═══════════════════════════════════════════════════════════════════════
-- PROMPTY DO MOCKUPÓW
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────
-- MOCKUP 1: Czarna koszulka z logo
-- ───────────────────────────────────────
-- Professional product mockup: black heavyweight cotton t-shirt with the "VibeStrike"
-- logo screen-printed across the chest. The logo glows in #00D4FF (electric blue)
-- and #FF2D78 (neon magenta). The t-shirt is worn by a fit male model, 25-30 years old,
-- standing in a dimly lit urban gym. Behind him, out of focus, a boxing heavy bag hangs.
-- Dramatic rim lighting in electric blue from the left side. Sweat glistens on his arms.
-- He's wrapping his hands with boxing wraps. The mood is: "about to go hard."
-- Photography style: high-end athleisure brand (Gymshark / Venum campaign).
-- 4K, photorealistic, shallow depth of field.

-- ───────────────────────────────────────
-- MOCKUP 2: Czapka z logo
-- ───────────────────────────────────────
-- Professional product mockup: black unstructured dad cap with the "VibeStrike" logo
-- embroidered on the front in #00D4FF (electric blue). The stitching has a slight
-- 3D raised effect. On the side panel, a small embroidered LED target icon in #FF2D78
-- (magenta). The cap is photographed in two angles: 1) Front view on a matte black
-- mannequin head with dramatic side lighting. 2) Flat lay on dark concrete surface
-- next to boxing wraps and wireless earbuds. Subtle cyan light reflections on the brim.
-- Studio quality, 4K, photorealistic.

-- ───────────────────────────────────────
-- MOCKUP 3: Kubek z logo
-- ───────────────────────────────────────
-- Professional product mockup: matte black ceramic mug with the "VibeStrike" logo
-- on one side and the tagline "Uderz w rytm. Poczuj energię." on the other side.
-- Logo in #00D4FF, tagline in white. The mug sits on a dark wooden desk. Steam rises
-- from fresh black coffee inside. Next to the mug: a phone showing a music equalizer
-- app, and a single boxing glove. Morning light streams from a window on the right,
-- creating a warm-cool contrast with the cyan logo. The scene says: "morning routine
-- of someone who trains before work." Photorealistic, 4K, lifestyle product photography.

-- ───────────────────────────────────────
-- MOCKUP 4: Opakowanie produktu (maszyna bokserska)
-- ───────────────────────────────────────
-- Design premium retail packaging for the "VibeStrike" smart boxing machine. The box
-- is matte black (#0A0A0A) with a soft-touch finish. The front panel features:
-- the VibeStrike logo large and centered, a lifestyle photo window showing the product
-- mounted on a wall with LED targets glowing, and the tagline "Uderz w rytm." in
-- Bebas Neue. Color accents: #00D4FF lines running along edges like circuit traces,
-- #FF2D78 used for the "NEW" badge and feature icons. Side panels list key features
-- in white Inter font with #C8FF00 (acid lime) checkmark icons: "Bluetooth 5.0",
-- "9 trybów", "LED targets", "Licznik uderzeń". Bottom panel has Orbitron-font
-- technical specs. The box should feel premium enough to be a gift.
-- Show 3/4 angle view, photorealistic mockup, 4K.

-- ───────────────────────────────────────
-- MOCKUP 5: Rękawice bokserskie z logo
-- ───────────────────────────────────────
-- Professional product mockup: matte black boxing gloves (12oz training gloves) with
-- the "VibeStrike" logo heat-pressed on the knuckle guard area in #00D4FF electric blue.
-- A thin #FF2D78 (magenta) stripe runs along the thumb seam — like a racing stripe.
-- The wrist strap closure has "VIBE" embossed in the Velcro area. Photographed:
-- 1) Hanging by laces against a raw concrete wall, dramatic top-down spotlight creating
-- hard shadows. 2) Close-up of the knuckle area showing logo detail and leather grain.
-- The gloves look like they've been used once — slightly creased, real, not sterile.
-- Commercial product photography, 4K, photorealistic.

-- ───────────────────────────────────────
-- MOCKUP 6: Social media avatar (profilowe)
-- ───────────────────────────────────────
-- Design the official social media profile picture for "VibeStrike". Square format (1:1).
-- Use the standalone icon version (boxing target with LED dots) centered on a black
-- (#0A0A0A) background. The icon's active target dot glows #FF2D78 (magenta) with
-- a soft light bloom effect. Other dots in #00D4FF. A very subtle radial gradient
-- behind the icon creates depth (not flat, but almost). The icon must be instantly
-- readable at 40x40px (Instagram comment) and at 400x400px (profile page).
-- Output 1080x1080px, PNG.

-- ───────────────────────────────────────
-- MOCKUP 7: Banner social media (cover)
-- ───────────────────────────────────────
-- Design a social media cover/banner for "VibeStrike". Wide format (1500x500px for
-- Twitter/X, also works for Facebook 820x312 with safe zone). Dark background (#0A0A0A)
-- transitioning to deep anthracite (#1A1A2E) on the right. Left third: VibeStrike logo,
-- large. Center: a silhouette of a person mid-punch, body traced by #00D4FF neon
-- outline (like motion capture wireframe). Sound wave / equalizer bars rise from the
-- bottom in #FF2D78 magenta, synced with the punch motion. Right third: tagline
-- "Uderz w rytm. Poczuj energię." in Bebas Neue, stacked vertically. A faint #C8FF00
-- acid lime line underscores the tagline. The overall feel: a frame from a music video
-- meets a boxing promo. Output 1500x500px, PNG.

-- ───────────────────────────────────────
-- MOCKUP 8: Zestaw naklejek / stickery
-- ───────────────────────────────────────
-- Design a sticker sheet with 5 die-cut stickers for the "VibeStrike" brand:
-- 1) Full logo sticker — horizontal, #00D4FF on black, ~8cm wide
-- 2) Icon-only circle sticker — the LED boxing target icon, 5cm diameter
-- 3) "UDERZ W RYTM." text sticker in Bebas Neue, #C8FF00 acid lime on black, rectangular
-- 4) Abstract sticker — a fist silhouette with sound waves radiating from it,
--    #FF2D78 magenta lines on transparent
-- 5) Mini "VS" monogram sticker — 3cm, #00D4FF on black circle, for laptop/phone
-- Show all 5 stickers arranged on a dark matte surface, slightly overlapping,
-- as if someone just opened the sticker pack. One sticker is half-peeled.
-- Sticker aesthetic: street culture meets tech. Photorealistic mockup, 4K.

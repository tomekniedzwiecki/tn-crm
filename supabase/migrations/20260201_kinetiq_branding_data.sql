-- KinetiQ Branding Data for workflow 4795bd40-c483-4499-8d68-a8fc6ae3641f
-- Uruchom w Supabase SQL Editor
-- UWAGA: Najpierw uruchom migrację 20260201_branding_extended_types.sql

-- Wyczyść istniejące dane brandingowe dla tego workflow
DELETE FROM workflow_branding
WHERE workflow_id = '4795bd40-c483-4499-8d68-a8fc6ae3641f'
  AND type IN ('brand_info', 'color', 'font');

-- ═══════════════════════════════════════════════════════
-- 1. BRAND INFO
-- ═══════════════════════════════════════════════════════
INSERT INTO workflow_branding (workflow_id, type, title, value, sort_order) VALUES (
  '4795bd40-c483-4499-8d68-a8fc6ae3641f',
  'brand_info',
  'KinetiQ',
  '{"name":"KinetiQ","tagline":"Inteligencja w ruchu.","description":"KinetiQ to marka inteligentnych systemów treningowych nowej generacji. Łączymy technologię z naturą ludzkiego ruchu — każde uderzenie jest mierzone, każdy rytm synchronizowany, każdy trening to gra, którą chcesz wygrać. Nasz flagowy produkt to muzyczna maszyna bokserska z LED i Bluetooth, która zamienia Twoją ścianę w interaktywną arenę fitness. Koniec z nudnym cardio, koniec z wymówkami. KinetiQ — trenuj mądrzej, baw się mocniej."}',
  0
);

-- ═══════════════════════════════════════════════════════
-- 2. KOLORY — paleta "smart sport": głęboki granat + cyjan + limonka
--    Bardziej tech/smart niż VibeStrike, mniej punkowy, bardziej premium
-- ═══════════════════════════════════════════════════════

INSERT INTO workflow_branding (workflow_id, type, title, value, notes, sort_order) VALUES
  ('4795bd40-c483-4499-8d68-a8fc6ae3641f', 'color', 'Kinetic Cyan',     '#00E5FF', '{"role":"primary"}',   0),
  ('4795bd40-c483-4499-8d68-a8fc6ae3641f', 'color', 'Pulse Violet',     '#7C3AED', '{"role":"secondary"}', 1),
  ('4795bd40-c483-4499-8d68-a8fc6ae3641f', 'color', 'Neon Lime',        '#BEFF00', '{"role":"accent"}',    2),
  ('4795bd40-c483-4499-8d68-a8fc6ae3641f', 'color', 'Midnight Navy',    '#0B0E1A', '{"role":"neutral"}',   3),
  ('4795bd40-c483-4499-8d68-a8fc6ae3641f', 'color', 'Steel Blue',       '#1E293B', '{"role":"neutral"}',   4),
  ('4795bd40-c483-4499-8d68-a8fc6ae3641f', 'color', 'Ice White',        '#F1F5F9', '{"role":"neutral"}',   5);

-- ═══════════════════════════════════════════════════════
-- 3. CZCIONKI — tech-sport: geometryczna precyzja + czytelność
--    Space Grotesk = smart/tech nagłówki
--    Inter = uniwersalny body (najlepszy czytelność ekranowa)
--    JetBrains Mono = dane/statystyki/liczby (nawiązanie do "inteligencji")
-- ═══════════════════════════════════════════════════════

INSERT INTO workflow_branding (workflow_id, type, title, value, notes, sort_order) VALUES
  ('4795bd40-c483-4499-8d68-a8fc6ae3641f', 'font', 'Space Grotesk', 'heading', '{"role":"heading","weights":["400","500","700"]}',              0),
  ('4795bd40-c483-4499-8d68-a8fc6ae3641f', 'font', 'Inter',         'body',    '{"role":"body","weights":["400","500","600","700"]}',            1),
  ('4795bd40-c483-4499-8d68-a8fc6ae3641f', 'font', 'JetBrains Mono','accent',  '{"role":"accent","weights":["400","500","700"]}',               2);


-- ═══════════════════════════════════════════════════════════════════════
-- PROMPTY DO GENEROWANIA LOGO I MOCKUPÓW
-- Skopiuj wybrany prompt i wklej do Gemini / Midjourney / DALL-E
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────
-- LOGO PROMPT 1: Logo główne (ciemne tło)
-- ───────────────────────────────────────
-- Design a minimalist, modern logo for the brand "KinetiQ". The logo should be
-- typography-based using a geometric, tech-forward font similar to Space Grotesk.
-- The letter Q should have a distinctive kinetic element — a subtle motion trail
-- or energy arc extending from it, suggesting movement and intelligence.
-- Use #00E5FF (kinetic cyan) as the primary color with subtle #7C3AED (violet) glow.
-- The logo must work on a pure dark navy (#0B0E1A) background.
-- Style: clean, intelligent, futuristic but approachable. No gradients — flat neon colors
-- with subtle luminous glow effect. The overall feel should be "smart fitness tech".
-- Output on transparent background, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 2: Logo na jasnym tle
-- ───────────────────────────────────────
-- Design a minimalist logo for "KinetiQ" brand, optimized for white/light backgrounds.
-- Use dark navy (#0B0E1A) as the main text color with #00E5FF cyan accent on the Q
-- and its kinetic element. Same geometric Space Grotesk-style typography as the dark
-- version. Clean, professional, easily readable on paper and light interfaces.
-- Output on transparent background, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 3: Logo monochromatyczne
-- ───────────────────────────────────────
-- Create a monochrome version of the "KinetiQ" logo. Pure white version on transparent
-- background (for dark contexts) and pure black version on transparent background
-- (for light contexts). Same geometric typography with the distinctive Q kinetic element.
-- No colors — single tone only. Suitable for watermarks, embossing, engraving.
-- Output both versions, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 4: Favicon / ikona aplikacji
-- ───────────────────────────────────────
-- Design a compact app icon / favicon for the brand "KinetiQ". Use the letter Q with
-- its kinetic motion element as the icon. #00E5FF cyan on dark navy (#0B0E1A) background.
-- The Q should feel like it's in motion — energy lines or a subtle pulse effect.
-- Must be recognizable at 32x32px and 512x512px. Rounded square shape.
-- Minimalist, bold, no additional text. Output as PNG, square format, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 5: Logo z ikoną (combo mark)
-- ───────────────────────────────────────
-- Create a combination mark logo for "KinetiQ" — an abstract icon paired with the
-- wordmark. The icon should represent kinetic energy: a stylized fist creating a
-- ripple/pulse wave, or a circular motion sensor with energy arcs. Colors: #00E5FF
-- for the icon, white for the text, on dark navy (#0B0E1A) background. Typography:
-- geometric, Space Grotesk-style. The icon should be usable separately.
-- Smart fitness tech aesthetic — think Peloton meets Dyson. Output on transparent
-- background, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 6: Logo animowane (concept storyboard)
-- ───────────────────────────────────────
-- Design a logo animation concept sheet for "KinetiQ". Show 4-6 keyframes:
-- 1) Dark screen, a single cyan (#00E5FF) particle appears
-- 2) Particle accelerates, leaving a motion trail
-- 3) Trail forms the letters K-I-N-E-T-I
-- 4) The Q appears with a burst of energy — violet (#7C3AED) pulse radiates outward
-- 5) Logo settles, subtle breathing glow effect on the Q
-- Dark navy (#0B0E1A) background throughout. Show as storyboard on one image.
-- Feel: intelligent, precise, like a physics simulation coming to life.

-- ═══════════════════════════════════════════════════════════════════════
-- PROMPTY DO MOCKUPÓW
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────
-- MOCKUP 1: Czarna koszulka z logo
-- ───────────────────────────────────────
-- Professional product mockup: black premium cotton t-shirt with the "KinetiQ" logo
-- printed on the chest. The logo is in #00E5FF (kinetic cyan) with a subtle #7C3AED
-- violet accent. T-shirt worn by an athletic model in a modern, dark gym with LED
-- strip lighting in cyan. Dramatic lighting, moody atmosphere. The model is mid-punch
-- toward camera (motion blur on fist). Photography style: Nike/Under Armour campaign.
-- 4K, photorealistic.

-- ───────────────────────────────────────
-- MOCKUP 2: Czapka z logo
-- ───────────────────────────────────────
-- Professional product mockup: black structured snapback cap with the "KinetiQ" logo
-- embroidered on the front in #00E5FF (kinetic cyan). The distinctive Q with motion
-- element is prominent. Side view and front view. Dark surface with subtle cyan LED
-- light reflections. Small #BEFF00 (neon lime) accent tag on the side.
-- Photorealistic, studio quality, 4K.

-- ───────────────────────────────────────
-- MOCKUP 3: Kubek termiczny z logo
-- ───────────────────────────────────────
-- Professional product mockup: matte black stainless steel travel mug with the "KinetiQ"
-- logo and tagline "Inteligencja w ruchu." printed in #00E5FF and white. Photographed
-- on a dark desk next to a laptop and boxing gloves. Morning light from the side.
-- Clean, premium, tech lifestyle aesthetic. Photorealistic, 4K, product photography style.

-- ───────────────────────────────────────
-- MOCKUP 4: Opakowanie produktu (maszyna bokserska)
-- ───────────────────────────────────────
-- Design a premium product packaging box for the "KinetiQ" smart boxing machine.
-- The box is predominantly dark navy (#0B0E1A) with #00E5FF cyan accent lines forming
-- a circuit/pulse pattern. Logo prominently displayed on front. Side panel shows
-- product silhouette with #BEFF00 lime highlight on LED targets. Key features listed
-- in white text using clean Inter font. "Smart Boxing System" subtitle in JetBrains Mono.
-- The box has a soft-touch matte finish with spot UV on the logo. Show 3/4 angle view.
-- Photorealistic mockup, 4K.

-- ───────────────────────────────────────
-- MOCKUP 5: Rękawice bokserskie z logo
-- ───────────────────────────────────────
-- Professional product mockup: black boxing gloves with the "KinetiQ" logo in #00E5FF
-- (kinetic cyan) on the knuckle area. Clean, minimal design — no unnecessary graphics.
-- #7C3AED violet stitching accents along the wrist strap. Photographed on a dark
-- surface with dramatic side lighting creating cyan reflections. Premium leather texture.
-- Photorealistic, 4K, commercial product photography.

-- ───────────────────────────────────────
-- MOCKUP 6: Social media avatar
-- ───────────────────────────────────────
-- Design a social media profile picture for the "KinetiQ" brand. Square format (1:1).
-- The Q-icon (favicon version) centered on dark navy (#0B0E1A) background with a
-- subtle radial gradient of #00E5FF cyan glow behind it. Clean, bold, instantly
-- recognizable at small sizes. Output 1080x1080px, PNG.

-- ───────────────────────────────────────
-- MOCKUP 7: Banner social media
-- ───────────────────────────────────────
-- Design a social media cover/banner for "KinetiQ". Wide format (16:9). Dark navy
-- (#0B0E1A) background with dynamic kinetic energy lines in #00E5FF cyan and #7C3AED
-- violet. Logo on the left, tagline "Inteligencja w ruchu." in Space Grotesk font
-- on the right. Subtle boxing target silhouette with LED dots pattern integrated into
-- the background. A faint #BEFF00 lime pulse wave crosses the image horizontally.
-- Modern, intelligent, high-tech aesthetic. Output 1920x1080px.

-- ───────────────────────────────────────
-- MOCKUP 8: Naklejki / stickery
-- ───────────────────────────────────────
-- Design a set of 4 brand stickers for "KinetiQ":
-- 1) Logo die-cut sticker (#00E5FF on dark navy)
-- 2) Round sticker with Q-icon + "KinetiQ" text
-- 3) Rectangular sticker with tagline "Inteligencja w ruchu." in #BEFF00 neon lime
-- 4) Holographic-style sticker with abstract kinetic wave pattern from brand colors
-- All on one sheet, mockup style on a dark surface. Sticker aesthetic: tech/sport/premium.
-- High resolution.

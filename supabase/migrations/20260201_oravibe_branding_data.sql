-- OraVibe Branding Data for workflow f978547e-6e08-482d-8752-ef083e47c990
-- Klient: Patryk Skrzypniak | Produkt: Irygator doustny (oral irrigator)
-- Uruchom w Supabase SQL Editor
-- UWAGA: Najpierw uruchom migrację 20260201_branding_extended_types.sql

-- Wyczyść istniejące dane brandingowe dla tego workflow
DELETE FROM workflow_branding
WHERE workflow_id = 'f978547e-6e08-482d-8752-ef083e47c990'
  AND type IN ('brand_info', 'color', 'font');

-- ═══════════════════════════════════════════════════════
-- 1. BRAND INFO
-- ═══════════════════════════════════════════════════════
INSERT INTO workflow_branding (workflow_id, type, title, value, sort_order) VALUES (
  'f978547e-6e08-482d-8752-ef083e47c990',
  'brand_info',
  'OraVibe',
  '{"name":"OraVibe","tagline":"Poczuj różnicę. Codziennie.","description":"OraVibe to marka nowoczesnych irygatorów doustnych dla osób, które wiedzą, że zdrowy uśmiech zaczyna się poniżej linii dziąseł. Nasze urządzenia łączą pulsacyjną technologię wodną z intuicyjnym designem — delikatnie, ale skutecznie docierają tam, gdzie szczoteczka nie sięga. Stworzone z myślą o pokoleniu, które nie idzie na kompromis w kwestii zdrowia ani estetyki. OraVibe — higiena jamy ustnej, która po prostu wibruje energią."}',
  0
);

-- ═══════════════════════════════════════════════════════
-- 2. KOLORY — paleta "fresh health": teal + ocean blue + miętowy akcent
--    Czysta, świeża, medyczna ale przystępna — woda, zdrowie, zaufanie
-- ═══════════════════════════════════════════════════════

INSERT INTO workflow_branding (workflow_id, type, title, value, notes, sort_order) VALUES
  ('f978547e-6e08-482d-8752-ef083e47c990', 'color', 'Fresh Teal',      '#00B4A6', '{"role":"primary"}',   0),
  ('f978547e-6e08-482d-8752-ef083e47c990', 'color', 'Ocean Blue',      '#2563EB', '{"role":"secondary"}', 1),
  ('f978547e-6e08-482d-8752-ef083e47c990', 'color', 'Mint Glow',       '#34D399', '{"role":"accent"}',    2),
  ('f978547e-6e08-482d-8752-ef083e47c990', 'color', 'Deep Charcoal',   '#111827', '{"role":"neutral"}',   3),
  ('f978547e-6e08-482d-8752-ef083e47c990', 'color', 'Slate Gray',      '#475569', '{"role":"neutral"}',   4),
  ('f978547e-6e08-482d-8752-ef083e47c990', 'color', 'Cloud White',     '#F8FAFC', '{"role":"neutral"}',   5);

-- ═══════════════════════════════════════════════════════
-- 3. CZCIONKI — health/wellness: zaokrąglone, przyjazne, czyste
--    Quicksand = miękkie, zaokrąglone nagłówki (zdrowie, wellness)
--    Open Sans = maksymalna czytelność body
--    Comfortaa = delikatny, nowoczesny akcent
-- ═══════════════════════════════════════════════════════

INSERT INTO workflow_branding (workflow_id, type, title, value, notes, sort_order) VALUES
  ('f978547e-6e08-482d-8752-ef083e47c990', 'font', 'Quicksand',  'heading', '{"role":"heading","weights":["400","500","700"]}',              0),
  ('f978547e-6e08-482d-8752-ef083e47c990', 'font', 'Open Sans',  'body',    '{"role":"body","weights":["400","500","600","700"]}',            1),
  ('f978547e-6e08-482d-8752-ef083e47c990', 'font', 'Comfortaa',  'accent',  '{"role":"accent","weights":["400","500","700"]}',               2);


-- ═══════════════════════════════════════════════════════════════════════
-- PROMPTY DO GENEROWANIA LOGO I MOCKUPÓW
-- Skopiuj wybrany prompt i wklej do Gemini / Midjourney / DALL-E
-- Każdy prompt jest ręcznie napisany pod markę OraVibe (irygator doustny)
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────
-- LOGO PROMPT 1: Logo główne (ciemne tło)
-- ───────────────────────────────────────
-- Design a minimalist, modern logo for the oral care brand "OraVibe". The logo should
-- use rounded, soft typography inspired by Quicksand font — friendly yet medical-grade.
-- The letter O should be stylized as a subtle smile/mouth shape with a gentle curve,
-- and the V should have fine vibration/pulse lines radiating from its base — representing
-- the pulsating water jet technology of the oral irrigator. Use #00B4A6 (Fresh Teal) as
-- the primary color with a subtle #2563EB (Ocean Blue) shimmer on the vibration lines.
-- The logo must work on a dark #111827 (Deep Charcoal) background. Style: premium
-- wellness brand — clean like Quip, approachable like Hims, trustworthy like Philips
-- Sonicare. No harsh edges — everything rounded and fluid, like water in motion.
-- Subtle luminous glow on the vibration elements. Output on transparent background,
-- PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 2: Logo na jasnym tle
-- ───────────────────────────────────────
-- Design a minimalist logo for "OraVibe" oral care brand, optimized for white/light
-- backgrounds and product packaging. Use #111827 (Deep Charcoal) as the main text color
-- with #00B4A6 (Fresh Teal) accent on the smile-shaped O and vibration lines on the V.
-- Same rounded Quicksand-style typography as the dark version. Must feel trustworthy
-- in a pharmacy or dental clinic shelf context — professional enough for medical retail
-- but warm enough for DTC e-commerce. Suitable for printing on the white irrigator
-- packaging box. Output on transparent background, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 3: Logo monochromatyczne
-- ───────────────────────────────────────
-- Create a monochrome version of the "OraVibe" logo. Pure white version on transparent
-- background (for dark contexts) and pure black version on transparent background
-- (for light contexts). Same rounded typography with the distinctive smile-O and
-- vibration-V elements preserved in single tone. Suitable for: laser engraving on the
-- stainless steel body of the irrigator, embossing on the charging dock, watermarks
-- on instruction manuals, single-color silkscreen on travel pouches.
-- Output both versions, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 4: Favicon / ikona aplikacji
-- ───────────────────────────────────────
-- Design a compact app icon / favicon for "OraVibe" oral irrigator brand. Combine the
-- smile-shaped O with three fine vibration arcs into one unified symbol — a smiling
-- mouth with a water pulse emanating from it. #00B4A6 (Fresh Teal) symbol on #111827
-- (Deep Charcoal) background. The icon should feel clean, fresh, and alive — like a
-- single perfect water pulse. Must be recognizable at 32x32px (browser tab) and
-- 512x512px (app icon). Rounded square shape with soft corners matching the brand's
-- organic aesthetic. Minimalist, bold, absolutely no text. Output PNG, square, high res.

-- ───────────────────────────────────────
-- LOGO PROMPT 5: Logo z ikoną (combo mark)
-- ───────────────────────────────────────
-- Create a combination mark logo for "OraVibe" — an abstract icon paired with the
-- wordmark. The icon: a stylized water droplet with three concentric vibration arcs
-- emanating outward, representing the precision pulsating water jet that cleans below
-- the gumline. The droplet's interior has a subtle smile curve. Colors: #00B4A6 (Fresh
-- Teal) for the droplet, #2563EB (Ocean Blue) for the vibration arcs, #F8FAFC (Cloud
-- White) for the wordmark text. Background: #111827 (Deep Charcoal). Typography:
-- rounded Quicksand-style. The icon must work standalone — on the irrigator device
-- body, app splash screen, and as a favicon. Premium oral health-tech aesthetic — the
-- love child of Quip's minimalism and Waterpik's authority. Output on transparent
-- background, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 6: Logo animowane (concept storyboard)
-- ───────────────────────────────────────
-- Design a logo animation concept sheet for "OraVibe". Show 5 keyframes on one image:
-- 1) Dark #111827 screen, a single #00B4A6 (Fresh Teal) water droplet forms at the top
-- 2) The droplet falls and lands — a smile curve appears where it hits, ripples radiate
-- 3) Ripples transform into three vibration arcs in #2563EB (Ocean Blue), pulsing outward
-- 4) The arcs resolve into the letters O-R-A-V-I-B-E, the V still vibrating subtly
-- 5) Logo settles, the smile-O glows with a #34D399 (Mint Glow) shimmer, a tiny water
--    sparkle appears and fades. The whole animation should feel like: the refreshing
--    moment after using the irrigator — clean, confident, alive.
-- Show as storyboard frames on one image. Motion design reference: Quip's animations.

-- ═══════════════════════════════════════════════════════════════════════
-- PROMPTY DO MOCKUPÓW
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────
-- MOCKUP 1: Koszulka z logo
-- ───────────────────────────────────────
-- Professional product mockup: white premium cotton t-shirt with the "OraVibe" logo
-- printed on the chest in #00B4A6 (Fresh Teal) with subtle #2563EB (Ocean Blue) accent
-- on the vibration elements. T-shirt worn by a clean-cut model in a bright, modern
-- bathroom — white subway tiles, eucalyptus sprigs in a vase, morning sunlight through
-- frosted glass. The model is smiling naturally, showing clean healthy teeth — a subtle
-- nod to the oral care product. Photography style: Quip or Hims lifestyle campaign.
-- Clean, aspirational, minimal. 4K, photorealistic.

-- ───────────────────────────────────────
-- MOCKUP 2: Czapka z logo
-- ───────────────────────────────────────
-- Professional product mockup: white structured baseball cap with "OraVibe" logo
-- embroidered on the front in #00B4A6 (Fresh Teal). The smile-O vibe icon embroidered
-- on the side in #2563EB (Ocean Blue). Small #34D399 (Mint Glow) accent stitching on
-- the back closure. Photographed on a light marble bathroom counter next to a small
-- potted succulent and a glass of water with a mint leaf. Bright, airy, fresh atmosphere.
-- Photorealistic, studio quality, 4K.

-- ───────────────────────────────────────
-- MOCKUP 3: Etui podróżne z logo
-- ───────────────────────────────────────
-- Professional product mockup: sleek white zippered travel case for the oral irrigator,
-- with the "OraVibe" logo debossed on the front in #00B4A6 (Fresh Teal). The case has
-- a soft-touch matte finish, rounded edges, and a small #2563EB (Ocean Blue) zipper
-- pull. Photographed next to a passport, a toiletry bag, and the irrigator device
-- peeking out — travel/lifestyle context. Clean hotel bathroom counter, natural light.
-- The tagline "Poczuj różnicę. Codziennie." printed subtly inside the case lid.
-- Photorealistic, 4K, product photography.

-- ───────────────────────────────────────
-- MOCKUP 4: Opakowanie produktu (irygator)
-- ───────────────────────────────────────
-- Design a premium product packaging box for the "OraVibe" portable oral irrigator.
-- The box is predominantly #F8FAFC (Cloud White) with #00B4A6 (Fresh Teal) accent lines
-- forming flowing water-pulse wave patterns along the edges. "OraVibe" logo prominently
-- on front. Side panel: product silhouette with #34D399 (Mint Glow) highlight on the
-- water stream and LED indicator. Key features ("3 tryby pulsacji", "IPX7 wodoodporny",
-- "USB-C") listed in #111827 charcoal using Open Sans font. "Poczuj różnicę" subtitle
-- in Comfortaa italic. Soft-touch matte finish with spot UV gloss on the logo and water
-- elements. Show 3/4 angle view. Unboxing feel: Apple meets premium dental care.
-- Photorealistic mockup, 4K.

-- ───────────────────────────────────────
-- MOCKUP 5: Irygator z brandingiem
-- ───────────────────────────────────────
-- Professional product mockup: sleek, compact white portable oral irrigator with the
-- "OraVibe" logo laser-engraved on the matte white body in #00B4A6 (Fresh Teal). Design
-- details: teal accent ring around the nozzle base, #2563EB (Ocean Blue) LED mode
-- indicator (3 dots), soft-touch grip texture on the lower third, USB-C port with a
-- subtle #34D399 (Mint Glow) ring. The device stands upright on a white marble bathroom
-- shelf next to a minimalist toothbrush in a ceramic holder and a small green plant.
-- Soft diffused lighting from the left, tiny water droplets on the marble surface for
-- freshness. Premium dental care aesthetic — Dyson meets Sonicare meets Quip.
-- Photorealistic, 4K, commercial product photography.

-- ───────────────────────────────────────
-- MOCKUP 6: Social media avatar
-- ───────────────────────────────────────
-- Design a social media profile picture for "OraVibe". Square format (1:1). The smile-O
-- vibe icon (favicon version — smile curve with vibration arcs) centered on a clean
-- #F8FAFC (Cloud White) background with a subtle radial #00B4A6 (Fresh Teal) glow
-- behind it and a faint concentric water-ripple ring. Must be instantly recognizable
-- at 40x40px in a social feed. Fresh, trustworthy, medical-yet-friendly. Think: a
-- dentist you'd actually follow on Instagram. Output 1080x1080px, PNG.

-- ───────────────────────────────────────
-- MOCKUP 7: Banner social media
-- ───────────────────────────────────────
-- Design a social media cover/banner for "OraVibe". Wide format (16:9). Left side:
-- close-up macro shot of the irrigator's water stream in action — a precise teal-tinted
-- (#00B4A6) jet of water against a soft-focus white bathroom background. Right side:
-- clean #F8FAFC white space with the "OraVibe" logo and tagline "Poczuj różnicę.
-- Codziennie." in Quicksand font. A flowing water-pulse line in #00B4A6 teal with
-- #34D399 (Mint Glow) gradient connects both halves. Thin bottom accent line in #2563EB
-- (Ocean Blue). Modern, health-tech, aspirational. Feels like a premium oral care
-- campaign — Philips Sonicare production quality with Quip's DTC freshness.
-- Output 1920x1080px.

-- ───────────────────────────────────────
-- MOCKUP 8: Naklejki / stickery
-- ───────────────────────────────────────
-- Design a set of 4 brand stickers for "OraVibe":
-- 1) Die-cut logo sticker — "OraVibe" wordmark in #00B4A6 (Fresh Teal) on white vinyl
-- 2) Round sticker — smile-O vibe icon centered, "OraVibe" text below, teal on white
-- 3) Rectangular sticker — tagline "Poczuj różnicę. Codziennie." in #2563EB (Ocean Blue)
--    on white, with a tiny water droplet accent in #34D399 (Mint Glow)
-- 4) Holographic sticker — abstract water-pulse wave pattern using all brand colors
--    (#00B4A6, #2563EB, #34D399), iridescent/holographic finish
-- All 4 stickers shown on one sheet, mockup style, placed on a light marble surface
-- with a few real water drops and a sprig of mint nearby. Premium wellness merch
-- aesthetic — the kind of stickers you'd find in a Quip or Hims subscription box.
-- High resolution, photorealistic.

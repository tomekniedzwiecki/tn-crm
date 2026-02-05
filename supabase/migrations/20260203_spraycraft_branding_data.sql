-- SPRAYCRAFT Branding Data for workflow d6dc42b3-1efc-4a8d-a6b6-fd19b37dfe5c
-- Klient: Jacek Kluch | Produkt: Pistolet malarski HVLP (elektryczny)
-- Uruchom w Supabase SQL Editor
-- UWAGA: Najpierw uruchom migrację 20260201_branding_extended_types.sql

-- Wyczyść istniejące dane brandingowe dla tego workflow
DELETE FROM workflow_branding
WHERE workflow_id = 'd6dc42b3-1efc-4a8d-a6b6-fd19b37dfe5c'
  AND type IN ('brand_info', 'color', 'font');

-- ═══════════════════════════════════════════════════════
-- 1. BRAND INFO
-- ═══════════════════════════════════════════════════════
INSERT INTO workflow_branding (workflow_id, type, title, value, sort_order) VALUES (
  'd6dc42b3-1efc-4a8d-a6b6-fd19b37dfe5c',
  'brand_info',
  'SPRAYCRAFT',
  '{"name":"SPRAYCRAFT","tagline":"Maluj jak zawodowiec. W jeden dzień.","description":"SPRAYCRAFT to polska marka profesjonalnych pistoletów malarskich HVLP dla wymagających majsterkowiczów i właścicieli domów. Nasze narzędzia z miedzianym sercem i kompatybilnością z akumulatorami Makita 18V pozwalają zaoszczędzić czas i pieniądze — jeden projekt to nawet 1250 PLN w kieszeni. Dołącz do tysięcy Polaków, którzy odkryli, że profesjonalne malowanie jest w zasięgu ręki."}',
  0
);

-- ═══════════════════════════════════════════════════════
-- 2. KOLORY — paleta "industrial power": limonka + antracyt + pomarańcz
--    Inspiracja produktem: zielono-czarny design, moc, precyzja
-- ═══════════════════════════════════════════════════════

INSERT INTO workflow_branding (workflow_id, type, title, value, notes, sort_order) VALUES
  ('d6dc42b3-1efc-4a8d-a6b6-fd19b37dfe5c', 'color', 'Power Lime',      '#84CC16', '{"role":"primary"}',   0),
  ('d6dc42b3-1efc-4a8d-a6b6-fd19b37dfe5c', 'color', 'Gunmetal Black',  '#1A1A1A', '{"role":"secondary"}', 1),
  ('d6dc42b3-1efc-4a8d-a6b6-fd19b37dfe5c', 'color', 'Warning Orange',  '#F59E0B', '{"role":"accent"}',    2),
  ('d6dc42b3-1efc-4a8d-a6b6-fd19b37dfe5c', 'color', 'Deep Charcoal',   '#0D0D0D', '{"role":"neutral"}',   3),
  ('d6dc42b3-1efc-4a8d-a6b6-fd19b37dfe5c', 'color', 'Steel Gray',      '#525252', '{"role":"neutral"}',   4),
  ('d6dc42b3-1efc-4a8d-a6b6-fd19b37dfe5c', 'color', 'Light Concrete',  '#E5E5E5', '{"role":"neutral"}',   5);

-- ═══════════════════════════════════════════════════════
-- 3. CZCIONKI — industrial/power tools: ostre, techniczne, czytelne
--    Rajdhani = industrialny, ostry heading
--    Inter = maksymalna czytelność body
--    Space Mono = techniczny akcent (specyfikacje, ceny)
-- ═══════════════════════════════════════════════════════

INSERT INTO workflow_branding (workflow_id, type, title, value, notes, sort_order) VALUES
  ('d6dc42b3-1efc-4a8d-a6b6-fd19b37dfe5c', 'font', 'Rajdhani',    'heading', '{"role":"heading","weights":["500","600","700"]}',              0),
  ('d6dc42b3-1efc-4a8d-a6b6-fd19b37dfe5c', 'font', 'Inter',       'body',    '{"role":"body","weights":["400","500","600","700"]}',            1),
  ('d6dc42b3-1efc-4a8d-a6b6-fd19b37dfe5c', 'font', 'Space Mono',  'accent',  '{"role":"accent","weights":["400","700"]}',                      2);


-- ═══════════════════════════════════════════════════════════════════════
-- PROMPTY DO GENEROWANIA LOGO I MOCKUPÓW
-- Skopiuj wybrany prompt i wklej do Gemini / Midjourney / DALL-E
-- Każdy prompt jest ręcznie napisany pod markę SPRAYCRAFT (pistolet malarski)
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────
-- LOGO PROMPT 1: Logo główne (ciemne tło)
-- ───────────────────────────────────────
-- Design a bold, industrial logo for the power tools brand "SPRAYCRAFT". The logo
-- should convey precision, power, and professional craftsmanship. Use sharp,
-- angular typography inspired by Rajdhani font — technical, no-nonsense, strong.
-- The letter A could incorporate a subtle spray nozzle or paint droplet shape.
-- The word "SPRAY" in #84CC16 (Power Lime) and "CRAFT" in #E5E5E5 (Light Concrete).
-- A thin spray mist detail emanating from the logo in lime gradient fading to
-- transparent. Background: #0D0D0D (Deep Charcoal). Style: DeWalt meets Milwaukee
-- meets Makita — professional power tool aesthetic. Industrial, trustworthy,
-- powerful. Output on transparent background, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 2: Logo na jasnym tle
-- ───────────────────────────────────────
-- Design the "SPRAYCRAFT" logo optimized for light backgrounds and product
-- packaging. Use #1A1A1A (Gunmetal Black) as the main text color with #84CC16
-- (Power Lime) accent on the spray element and the letter A. Same sharp Rajdhani-
-- style typography. Must feel professional enough for hardware store shelf
-- placement and online retail listings. Suitable for printing on white/silver
-- product boxes. Output on transparent background, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 3: Logo monochromatyczne
-- ───────────────────────────────────────
-- Create monochrome versions of the "SPRAYCRAFT" logo. Pure white version on
-- transparent background (for dark contexts — product body, packaging accent) and
-- pure black version on transparent background (for light contexts — manuals,
-- invoices). Same angular typography with the subtle spray element. Suitable for:
-- laser engraving on the spray gun body, embossing on carrying cases, single-color
-- printing on warranty cards. Output both versions, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 4: Favicon / ikona aplikacji
-- ───────────────────────────────────────
-- Design a compact app icon / favicon for "SPRAYCRAFT" spray gun brand. Create a
-- minimalist symbol: a stylized spray gun nozzle viewed from the front, forming
-- an abstract "S" shape with three spray lines emanating outward. Use #84CC16
-- (Power Lime) for the spray lines on #1A1A1A (Gunmetal Black) background. The icon
-- should feel industrial, precise, and recognizable at 32x32px (browser tab) and
-- 512x512px (app store). Rounded square with subtle corners. Bold, clean, no text.
-- Output PNG, square, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 5: Logo z ikoną (combo mark)
-- ───────────────────────────────────────
-- Create a combination mark logo for "SPRAYCRAFT" — an icon paired with the
-- wordmark. The icon: a stylized HVLP spray gun silhouette at 45-degree angle,
-- with three precise spray lines forming a fan pattern. The spray lines gradient
-- from #84CC16 (Power Lime) at the nozzle to transparent at the edges. The gun
-- body in #525252 (Steel Gray) with a #F59E0B (Warning Orange) trigger accent.
-- Wordmark to the right in sharp Rajdhani-style font, "SPRAY" in lime, "CRAFT"
-- in white. Background: #0D0D0D. The icon must work standalone — on the product,
-- app, and social media. Professional power tool aesthetic. Output on transparent
-- background, PNG, high resolution.

-- ───────────────────────────────────────
-- LOGO PROMPT 6: Logo animowane (concept storyboard)
-- ───────────────────────────────────────
-- Design a logo animation concept sheet for "SPRAYCRAFT". Show 5 keyframes:
-- 1) Dark #0D0D0D screen, a single #84CC16 (Power Lime) dot appears at center
-- 2) The dot expands into three spray lines fanning outward — motion blur effect
-- 3) The spray lines reveal the letters S-P-R-A-Y-C-R-A-F-T forming behind them
-- 4) The spray retracts into the nozzle icon which settles to the left of the text
-- 5) Final logo lockup, the nozzle pulses once with a #F59E0B (Warning Orange)
--    glow, then settles. Tagline "Maluj jak zawodowiec" fades in below.
-- The animation should feel: powerful, precise, satisfying — like pulling the
-- trigger and getting a perfect spray pattern. Show as storyboard frames.

-- ═══════════════════════════════════════════════════════════════════════
-- PROMPTY DO MOCKUPÓW
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────
-- MOCKUP 1: Koszulka robocza z logo
-- ───────────────────────────────────────
-- Professional product mockup: black heavy-duty work t-shirt with the "SPRAYCRAFT"
-- logo printed on the chest in #84CC16 (Power Lime). The shirt worn by a fit male
-- model (30s) in a garage/workshop setting — concrete floor, power tools on
-- pegboard wall, good lighting from industrial fixtures. Model holding a spray
-- gun, confident stance, slight paint mist in the air catching the light.
-- Photography style: Makita or DeWalt catalog aesthetic — professional,
-- aspirational, trustworthy. 4K, photorealistic.

-- ───────────────────────────────────────
-- MOCKUP 2: Czapka z logo
-- ───────────────────────────────────────
-- Professional product mockup: black structured baseball cap with "SPRAYCRAFT"
-- logo embroidered on the front in #84CC16 (Power Lime). The spray nozzle icon
-- embroidered on the side in white. Small #F59E0B (Warning Orange) accent
-- stitching on the back strap. Photographed on a workbench next to a spray gun,
-- masking tape roll, and a freshly painted wooden board. Workshop lighting,
-- authentic DIY atmosphere. Photorealistic, 4K.

-- ───────────────────────────────────────
-- MOCKUP 3: Walizka transportowa z logo
-- ───────────────────────────────────────
-- Professional product mockup: rugged black carrying case (blow-molded plastic)
-- for the HVLP spray gun. "SPRAYCRAFT" logo in #84CC16 (Power Lime) on the top
-- lid. The case has industrial latches in gunmetal, a pressure-formed interior
-- visible with the lid open showing the spray gun, extra nozzles, and cleaning
-- brush in custom foam cutouts. Photographed in a garage setting, concrete floor,
-- other power tools visible in the background. Premium tool storage aesthetic —
-- Milwaukee PACKOUT meets Makita MakPac. Photorealistic, 4K, product photography.

-- ───────────────────────────────────────
-- MOCKUP 4: Opakowanie produktu (karton)
-- ───────────────────────────────────────
-- Design a premium product packaging box for the "SPRAYCRAFT" HVLP spray gun.
-- The box is predominantly #1A1A1A (Gunmetal Black) with #84CC16 (Power Lime)
-- accent stripes and spray pattern graphics. Large product photo on front showing
-- the gun in action with a fine mist. "SPRAYCRAFT" logo prominently displayed.
-- Key features in #E5E5E5 using Inter font: "HVLP Technology", "Copper Core",
-- "Makita 18V Compatible", "3 Nozzle Sizes". A #F59E0B (Warning Orange) badge:
-- "OSZCZĘDŹ 1250 PLN". Show 3/4 angle view. Unboxing feel: professional power
-- tool — Milwaukee meets premium DTC brand. Photorealistic mockup, 4K.

-- ───────────────────────────────────────
-- MOCKUP 5: Pistolet malarski z brandingiem
-- ───────────────────────────────────────
-- Professional product mockup: the HVLP electric spray gun with SPRAYCRAFT
-- branding. The gun body is black with #84CC16 (Power Lime) accent panels — on
-- the motor housing and trigger guard. "SPRAYCRAFT" logo laser-engraved on the
-- side in white. The copper nozzle tip visible, professional finish. The gun
-- stands on a workbench next to a painted sample board (smooth gradient finish),
-- a roll of masking tape, and a Makita 18V battery nearby showing compatibility.
-- Workshop lighting, slight paint mist in the air. Premium power tool photography
-- — the love child of Festool precision and DeWalt ruggedness. Photorealistic, 4K.

-- ───────────────────────────────────────
-- MOCKUP 6: Social media avatar
-- ───────────────────────────────────────
-- Design a social media profile picture for "SPRAYCRAFT". Square format (1:1).
-- The spray nozzle icon (favicon version) centered on a #1A1A1A (Gunmetal Black)
-- background with a subtle radial #84CC16 (Power Lime) glow behind it. Three
-- spray lines emanating from the nozzle in lime color. Must be instantly
-- recognizable at 40x40px. Professional, industrial, powerful. Think: the profile
-- picture of a power tool brand you'd trust. Output 1080x1080px, PNG.

-- ───────────────────────────────────────
-- MOCKUP 7: Banner social media
-- ───────────────────────────────────────
-- Design a social media cover/banner for "SPRAYCRAFT". Wide format (16:9). Left
-- side: dramatic close-up of the spray gun in action — a fine #84CC16 tinted mist
-- being sprayed onto a wooden surface, frozen motion, professional lighting. Right
-- side: #1A1A1A dark space with "SPRAYCRAFT" logo and tagline "Maluj jak
-- zawodowiec. W jeden dzień." in Rajdhani font. A subtle spray pattern connects
-- both halves. Bottom accent line in #F59E0B (Warning Orange). Professional power
-- tool campaign aesthetic — DeWalt production quality with modern DTC appeal.
-- Output 1920x1080px, PNG.

-- ───────────────────────────────────────
-- MOCKUP 8: Naklejki / stickery
-- ───────────────────────────────────────
-- Design a set of 4 brand stickers for "SPRAYCRAFT":
-- 1) Die-cut logo sticker — "SPRAYCRAFT" wordmark in #84CC16 on black vinyl
-- 2) Round sticker — spray nozzle icon centered, "SPRAYCRAFT" text around the
--    edge, lime on black, industrial badge style
-- 3) Rectangular sticker — tagline "Maluj jak zawodowiec" in white on black,
--    with a small lime spray accent
-- 4) Warning-style sticker — black and #F59E0B (Warning Orange) diagonal stripes
--    border, "UWAGA: PROFESJONALNE WYKOŃCZENIE" text, humorous/proud badge
-- All 4 stickers shown on one sheet, mockup style, placed on a metal toolbox
-- surface with some paint splatter nearby. Industrial workshop aesthetic.
-- High resolution, photorealistic.

-- Sub-etapy produkcji video jako NATYWNE kroki (wzorzec landingu: artefakty/koszty/checklisty
-- wiszą na (product_id, step_key) — sub-kroki dostają je za darmo). Marker sub_of wyklucza
-- je z kolumn matrycy; renderują się jako timeline w warsztacie ads_wideo.
-- ZASTOSOWANA przez MCP 19.07 (razem z wycofaniem chwilowej kolumny video_stages).
ALTER TABLE public.wf2_step_defs ADD COLUMN IF NOT EXISTS sub_of text;
ALTER TABLE public.wf2_products DROP COLUMN IF EXISTS video_stages;

INSERT INTO public.wf2_step_defs (key, stage, stage_label, label, icon, sort, owner, scope, sub_of, milestone_label, active) VALUES
 ('avi_wzorzec',   4, 'Kampanie', 'Wzorzec i karta produktu',  'ph-fingerprint',    361, 'auto', 'product', 'ads_wideo', NULL, true),
 ('avi_blueprint', 4, 'Kampanie', 'Scenariusz (blueprint)',    'ph-scroll',         362, 'auto', 'product', 'ads_wideo', NULL, true),
 ('avi_klatki',    4, 'Kampanie', 'Klatki-klucze',             'ph-images',         363, 'auto', 'product', 'ads_wideo', NULL, true),
 ('avi_render_qa', 4, 'Kampanie', 'Rendery scen + bramka QA',  'ph-shield-check',   364, 'auto', 'product', 'ads_wideo', NULL, true),
 ('avi_montaz',    4, 'Kampanie', 'Montaż i dźwięk',           'ph-waveform',       365, 'auto', 'product', 'ads_wideo', NULL, true),
 ('avi_final',     4, 'Kampanie', 'Finał i rejestr',           'ph-flag-checkered', 366, 'auto', 'product', 'ads_wideo', 'Kreacja gotowa (.pass + AI-flag + rejestr)', true)
ON CONFLICT (key) DO NOTHING;

SELECT public.wf2_ensure_steps(id) FROM public.wf2_projects;

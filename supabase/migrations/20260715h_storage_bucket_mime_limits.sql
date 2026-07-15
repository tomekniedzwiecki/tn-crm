-- ============================================================================
-- SEC-R3-UPLOAD (audyt R3-2, MEDIUM) — serwerowa walidacja uploadu (MIME) na bucketach TN App.
-- wfa-intake i wfa-test-shots miały allowed_mime_types=NULL (file_size_limit już = 25 MB).
-- Uploady idą przez signed upload URL z edge (service-role), ale allowed_mime_types to
-- warstwa nieomijalna egzekwowana przez Storage niezależnie od roli/klienta.
-- Oryginalne INSERT-y (20260713c / 20260715c) mają ON CONFLICT DO NOTHING → prod nie
-- dostaje zmiany przy re-runie; dlatego tu jawne UPDATE-y (idempotentne).
-- Aplikowane na prod (yxmavwkwnfuphjqbelws) 2026-07-15 przez Management API.
--
-- wfa-test-shots: zrzuty ekranu → obraz png/jpg/webp; 15 MB. (BEZ image/svg+xml.)
-- wfa-intake: materiały klienta (PDF, obrazy, Office, CSV, ZIP, HEIC) → szeroka lista +
--   application/octet-stream (przeglądarka często nie rozpoznaje typu doc/xls/zip/heic →
--   front PUT-uje octet-stream; octet-stream serwuje się jako DOWNLOAD, nie inline → bezpieczny).
--   CELOWO WYKLUCZONE: text/html, image/svg+xml, application/xhtml+xml — wektory Stored XSS
--   przy serwowaniu inline (private bucket, ale signed URL otwiera Tomek w panelu). 25 MB.
-- LEKCJA: bucket ZAWSZE z allowed_mime_types + file_size_limit od utworzenia.
-- ============================================================================

update storage.buckets
   set allowed_mime_types = array['image/png','image/jpeg','image/webp'],
       file_size_limit    = 15728640
 where id = 'wfa-test-shots';

update storage.buckets
   set allowed_mime_types = array[
         'application/pdf',
         'image/png','image/jpeg','image/webp','image/heic','image/heif',
         'text/csv','text/plain',
         'application/vnd.ms-excel',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/zip','application/x-zip-compressed',
         'application/octet-stream'
       ],
       file_size_limit    = 26214400
 where id = 'wfa-intake';

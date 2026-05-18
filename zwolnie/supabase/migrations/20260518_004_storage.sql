-- ============================================================================
-- Storage bucket dla załączników z formularza
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'ze-attachments',
    'ze-attachments',
    false,  -- private — access przez signed URLs lub authenticated
    10485760,  -- 10MB per file
    array[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/png',
        'image/jpeg',
        'image/webp',
        'text/plain',
        'text/csv'
    ]
) on conflict (id) do nothing;

-- Anon może INSERT do leads/<lead_id>/* (z formularza)
create policy "ze_attachments_anon_insert"
on storage.objects for insert to anon
with check (
    bucket_id = 'ze-attachments'
    and (storage.foldername(name))[1] = 'leads'
);

-- Staff może SELECT/UPDATE/DELETE wszystko
create policy "ze_attachments_staff_all"
on storage.objects for all to authenticated
using (
    bucket_id = 'ze-attachments'
    and exists (select 1 from ze_staff where user_id = auth.uid() and is_active = true)
)
with check (
    bucket_id = 'ze-attachments'
    and exists (select 1 from ze_staff where user_id = auth.uid() and is_active = true)
);

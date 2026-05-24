-- =========================================================================
-- 08. Storage: bucket card-attachments + policies
-- =========================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-attachments',
  'card-attachments',
  false,
  10485760, -- 10 MB
  ARRAY[
    'image/jpeg','image/png','image/gif','image/webp','image/heic','image/heif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip','application/x-rar-compressed','application/vnd.rar'
  ]
)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- SELECT: any authenticated role
CREATE POLICY "card_attachments_select"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'card-attachments'
    AND public.user_has_role(ARRAY['vendedor','analista','gestor','instalador','leitor']::user_role[])
  );

-- INSERT: non-reader + path's first segment must be an existing kanban_cards.id
CREATE POLICY "card_attachments_insert"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'card-attachments'
    AND public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[])
    AND EXISTS (
      SELECT 1 FROM public.kanban_cards c
      WHERE c.id::text = split_part(name, '/', 1)
    )
  );

-- UPDATE: owner only, non-reader
CREATE POLICY "card_attachments_update"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'card-attachments'
    AND owner = (SELECT auth.uid())
    AND public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[])
  )
  WITH CHECK (
    bucket_id = 'card-attachments'
    AND owner = (SELECT auth.uid())
  );

-- DELETE: owner only, non-reader
CREATE POLICY "card_attachments_delete"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'card-attachments'
    AND owner = (SELECT auth.uid())
    AND public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[])
  );

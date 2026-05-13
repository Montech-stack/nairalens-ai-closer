
DROP POLICY IF EXISTS "logos_public_read" ON storage.objects;
CREATE POLICY "logos_owner_read" ON storage.objects FOR SELECT USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

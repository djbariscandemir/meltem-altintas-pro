-- Supabase Storage Bucket Ayarları
-- listing-images bucket'ı için MIME type ve file size limit ayarları

-- 1. Bucket'ın public olduğundan emin ol
UPDATE storage.buckets 
SET public = true 
WHERE id = 'listing-images';

-- 2. Bucket bilgilerini kontrol et
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'listing-images';

-- 3. Eğer file_size_limit çok düşükse güncelle (10MB = 10485760 bytes)
-- Not: Supabase Storage'da file_size_limit direkt SQL ile güncellenemez
-- Bu ayar Supabase Dashboard'dan yapılmalı:
-- Storage > listing-images > Settings > File size limit: 10MB

-- 4. Allowed MIME types kontrolü
-- Not: allowed_mime_types da Supabase Dashboard'dan yapılmalı:
-- Storage > listing-images > Settings > Allowed MIME types:
--   - image/jpeg
--   - image/jpg
--   - image/png
--   - image/webp

-- 5. Bucket'ın public olduğunu doğrula
SELECT 
  id,
  name,
  public,
  created_at,
  updated_at
FROM storage.buckets
WHERE id = 'listing-images';

-- 6. RLS Policy kontrolü (storage.objects için)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND (policyname LIKE '%listing-images%' 
       OR policyname LIKE '%service role%' 
       OR policyname LIKE '%public read%')
ORDER BY policyname;

-- NOT: Bu script sadece bucket'ın public olduğunu kontrol eder ve günceller.
-- File size limit ve allowed MIME types ayarları Supabase Dashboard'dan yapılmalıdır.
-- Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets/listing-images/settings

-- Supabase Storage RLS Policy Düzeltme
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- listing-images bucket için RLS policy'lerini düzeltir

-- ============================================
-- 1. MEVCUT POLICY'LERİ SİL
-- ============================================

-- listing-images bucket'ı için tüm mevcut policy'leri sil
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "allow service role insert" ON storage.objects;
DROP POLICY IF EXISTS "allow public read" ON storage.objects;
DROP POLICY IF EXISTS "allow service role update" ON storage.objects;
DROP POLICY IF EXISTS "allow service role delete" ON storage.objects;

-- ============================================
-- 2. YENİ POLICY'LERİ OLUŞTUR
-- ============================================

-- INSERT (upload) - service_role için
CREATE POLICY "allow service role insert"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'listing-images');

-- SELECT (public read) - herkes okuyabilir
CREATE POLICY "allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listing-images');

-- UPDATE (service role) - service_role için
CREATE POLICY "allow service role update"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'listing-images')
WITH CHECK (bucket_id = 'listing-images');

-- DELETE (service role) - service_role için
CREATE POLICY "allow service role delete"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'listing-images');

-- ============================================
-- 3. BUCKET KONTROLÜ
-- ============================================

-- Bucket'ın public olduğundan emin ol
UPDATE storage.buckets
SET public = true
WHERE id = 'listing-images';

-- Bucket bilgilerini göster
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'listing-images';

-- ============================================
-- 4. POLICY KONTROLÜ
-- ============================================

-- Oluşturulan policy'leri göster
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
  AND (policyname LIKE '%listing-images%' OR policyname LIKE '%service role%' OR policyname LIKE '%public read%')
ORDER BY policyname;

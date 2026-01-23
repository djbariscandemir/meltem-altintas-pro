-- Supabase Storage bucket oluşturma
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- 1. listing-images bucket'ını oluştur (eğer yoksa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true, -- Public bucket (herkes erişebilir)
  52428800, -- 50MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Public access policy (herkes okuyabilir)
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'listing-images');

-- 3. Authenticated users upload policy (sadece authenticated kullanıcılar yükleyebilir)
CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images' AND
  auth.role() = 'authenticated'
);

-- 4. Authenticated users update policy
CREATE POLICY IF NOT EXISTS "Authenticated users can update"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'listing-images' AND
  auth.role() = 'authenticated'
);

-- 5. Authenticated users delete policy
CREATE POLICY IF NOT EXISTS "Authenticated users can delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'listing-images' AND
  auth.role() = 'authenticated'
);

-- Kontrol sorgusu
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'listing-images';

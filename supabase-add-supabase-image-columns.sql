-- Supabase listings tablosuna Supabase Storage image URL kolonlarını ekle
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- 1. cover_image_url_supabase kolonu (Supabase Storage'dan gelen kapak fotoğrafı URL'i)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'cover_image_url_supabase'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN cover_image_url_supabase TEXT;
    RAISE NOTICE 'cover_image_url_supabase kolonu eklendi';
  ELSE
    RAISE NOTICE 'cover_image_url_supabase kolonu zaten mevcut';
  END IF;
END $$;

-- 2. image_urls_supabase kolonu (Supabase Storage'dan gelen çoklu fotoğraf URL'leri - TEXT array)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'image_urls_supabase'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN image_urls_supabase TEXT[];
    RAISE NOTICE 'image_urls_supabase kolonu eklendi';
  ELSE
    RAISE NOTICE 'image_urls_supabase kolonu zaten mevcut';
  END IF;
END $$;

-- 3. Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_listings_cover_image_url_supabase 
ON public.listings(cover_image_url_supabase) 
WHERE cover_image_url_supabase IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_image_urls_supabase 
ON public.listings USING GIN(image_urls_supabase) 
WHERE image_urls_supabase IS NOT NULL;

-- 4. Kontrol sorgusu (eklenen kolonları göster)
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'listings'
  AND column_name IN ('cover_image_url_supabase', 'image_urls_supabase')
ORDER BY column_name;

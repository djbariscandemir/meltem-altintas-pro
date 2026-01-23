-- Supabase listings tablosuna eksik kolonları ekle
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- Revy fetch scriptinden gelen cover_image_url, images, listing_status için

-- 1. cover_image_url kolonu (kapak fotoğrafı URL'i)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN cover_image_url TEXT;
    RAISE NOTICE 'cover_image_url kolonu eklendi';
  ELSE
    RAISE NOTICE 'cover_image_url kolonu zaten mevcut';
  END IF;
END $$;

-- 2. image_urls kolonu (çoklu fotoğraf URL'leri - TEXT array)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN image_urls TEXT[];
    RAISE NOTICE 'image_urls kolonu eklendi';
  ELSE
    RAISE NOTICE 'image_urls kolonu zaten mevcut';
  END IF;
END $$;

-- 3. listing_status kolonu (active / passive)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'listing_status'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN listing_status TEXT;
    RAISE NOTICE 'listing_status kolonu eklendi';
  ELSE
    RAISE NOTICE 'listing_status kolonu zaten mevcut';
  END IF;
END $$;

-- 4. source kolonu kontrolü (eğer yoksa ekle)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name = 'source'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN source TEXT;
    RAISE NOTICE 'source kolonu eklendi';
  ELSE
    RAISE NOTICE 'source kolonu zaten mevcut';
  END IF;
END $$;

-- 5. Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_listings_cover_image_url ON public.listings(cover_image_url) WHERE cover_image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_listing_status ON public.listings(listing_status) WHERE listing_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_source ON public.listings(source) WHERE source IS NOT NULL;

-- 6. Kontrol sorgusu (eklenen kolonları göster)
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'listings'
  AND column_name IN ('cover_image_url', 'image_urls', 'listing_status', 'source')
ORDER BY column_name;

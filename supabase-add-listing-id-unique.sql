-- Supabase listings tablosunda listing_id kolonuna UNIQUE constraint ekle
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- NOT: Primary key (id) değişmeyecek, listing_id sadece iş mantığı için unique olacak

-- 1. Mevcut durumu kontrol et
SELECT 
  COUNT(*) as total_rows,
  COUNT(listing_id) as rows_with_listing_id,
  COUNT(*) - COUNT(listing_id) as rows_without_listing_id
FROM public.listings;

-- 2. Boş listing_id'li satırları göster (opsiyonel - kontrol için)
SELECT id, listing_id, title, created_at
FROM public.listings
WHERE listing_id IS NULL OR listing_id = ''
ORDER BY created_at DESC
LIMIT 10;

-- 3. Boş listing_id'li satırları sil (UNIQUE constraint eklemeden önce)
-- NOT: Eğer bu satırları korumak istiyorsanız, bu adımı atlayın ve sadece null bırakın
-- Ancak UNIQUE constraint için boş değerler sorun yaratabilir
DELETE FROM public.listings
WHERE listing_id IS NULL OR listing_id = '';

-- Alternatif: Boş listing_id'leri UUID ile doldur (eğer silmek istemiyorsanız)
-- UPDATE public.listings
-- SET listing_id = gen_random_uuid()::text
-- WHERE listing_id IS NULL OR listing_id = '';

-- 4. Mevcut UNIQUE constraint'i kontrol et ve varsa kaldır
DO $$ 
BEGIN
  -- listing_id üzerindeki mevcut unique constraint'i kaldır (varsa)
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname LIKE '%listing_id%unique%' 
    OR (conrelid = 'public.listings'::regclass AND contype = 'u')
  ) THEN
    -- Mevcut unique constraint'leri bul ve kaldır
    ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_listing_id_key;
    ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_listing_id_unique;
    RAISE NOTICE 'Mevcut unique constraint kaldırıldı';
  ELSE
    RAISE NOTICE 'Mevcut unique constraint bulunamadı';
  END IF;
END $$;

-- 5. listing_id kolonuna UNIQUE constraint ekle
DO $$ 
BEGIN
  -- Önce boş değerleri kontrol et
  IF EXISTS (
    SELECT 1 FROM public.listings 
    WHERE listing_id IS NULL OR listing_id = ''
  ) THEN
    RAISE WARNING 'Hala boş listing_id değerleri var! UNIQUE constraint eklenemez.';
    RAISE WARNING 'Lütfen önce boş listing_id değerlerini temizleyin.';
  ELSE
    -- UNIQUE constraint ekle
    ALTER TABLE public.listings 
    ADD CONSTRAINT listings_listing_id_unique UNIQUE (listing_id);
    
    RAISE NOTICE 'listing_id kolonuna UNIQUE constraint eklendi';
  END IF;
END $$;

-- 6. Kontrol sorgusu - UNIQUE constraint'in eklendiğini doğrula
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.listings'::regclass
  AND contype = 'u'
  AND conname LIKE '%listing_id%';

-- 7. Test sorgusu - listing_id'nin unique olduğunu kontrol et
SELECT 
  listing_id,
  COUNT(*) as count
FROM public.listings
WHERE listing_id IS NOT NULL AND listing_id != ''
GROUP BY listing_id
HAVING COUNT(*) > 1;

-- Eğer yukarıdaki sorgu sonuç döndürürse, duplicate listing_id'ler var demektir
-- Bu durumda önce duplicate'leri temizlemeniz gerekir

-- 8. Index kontrolü (UNIQUE constraint otomatik olarak index oluşturur)
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'listings'
  AND indexname LIKE '%listing_id%';

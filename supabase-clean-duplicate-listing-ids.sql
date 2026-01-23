-- Supabase listings tablosunda duplicate listing_id'leri temizle
-- Bu dosyayı UNIQUE constraint eklemeden ÖNCE çalıştırın
-- NOT: Bu script duplicate'leri koruyarak en eski kaydı bırakır, diğerlerini siler

-- 1. Duplicate listing_id'leri bul
SELECT 
  listing_id,
  COUNT(*) as duplicate_count,
  array_agg(id ORDER BY created_at) as ids,
  array_agg(created_at ORDER BY created_at) as created_dates
FROM public.listings
WHERE listing_id IS NOT NULL AND listing_id != ''
GROUP BY listing_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. Duplicate'leri temizle (en eski kaydı koru, diğerlerini sil)
-- NOT: Bu işlem geri alınamaz! Önce yedek alın.
WITH duplicates AS (
  SELECT 
    id,
    listing_id,
    ROW_NUMBER() OVER (
      PARTITION BY listing_id 
      ORDER BY created_at ASC
    ) as row_num
  FROM public.listings
  WHERE listing_id IS NOT NULL AND listing_id != ''
)
DELETE FROM public.listings
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE row_num > 1
);

-- 3. Temizleme sonrası kontrol
SELECT 
  listing_id,
  COUNT(*) as count
FROM public.listings
WHERE listing_id IS NOT NULL AND listing_id != ''
GROUP BY listing_id
HAVING COUNT(*) > 1;

-- Eğer yukarıdaki sorgu sonuç döndürmezse, duplicate'ler temizlenmiştir
-- Artık UNIQUE constraint eklenebilir

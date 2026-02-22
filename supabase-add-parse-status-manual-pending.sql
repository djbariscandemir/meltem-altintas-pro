-- parse_status'a 'manual_pending' değerini ekle (Manuel İlan Ekle için)
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- Mevcut parse_status CHECK constraint'ini kaldır (adı farklı olabilir)
DO $$
DECLARE
  conname text;
BEGIN
  FOR conname IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'listings' AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%parse_status%'
  LOOP
    EXECUTE format('ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS %I', conname);
    RAISE NOTICE 'Constraint % kaldırıldı', conname;
  END LOOP;
END $$;

-- Yeni CHECK: manual_pending dahil
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_parse_status_check;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_parse_status_check
  CHECK (parse_status IN ('partial', 'full', 'abandoned', 'manual_pending'));

-- Index (manuel bekleyen ilanlar için)
CREATE INDEX IF NOT EXISTS idx_listings_parse_status_manual_pending
  ON public.listings(parse_status) WHERE parse_status = 'manual_pending';

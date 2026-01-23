-- Supabase listings tablosuna parse status kolonları ekle
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- Parse status kolonlarını ekle (eğer yoksa)
DO $$ 
BEGIN
  -- parse_status kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'parse_status'
  ) THEN
    ALTER TABLE listings 
    ADD COLUMN parse_status TEXT DEFAULT 'partial' CHECK (parse_status IN ('partial', 'full', 'abandoned'));
    RAISE NOTICE 'parse_status kolonu eklendi';
  END IF;

  -- parse_attempts kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'parse_attempts'
  ) THEN
    ALTER TABLE listings 
    ADD COLUMN parse_attempts INTEGER DEFAULT 0;
    RAISE NOTICE 'parse_attempts kolonu eklendi';
  END IF;

  -- last_parse_at kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'last_parse_at'
  ) THEN
    ALTER TABLE listings 
    ADD COLUMN last_parse_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'last_parse_at kolonu eklendi';
  END IF;

  -- next_retry_at kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'next_retry_at'
  ) THEN
    ALTER TABLE listings 
    ADD COLUMN next_retry_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'next_retry_at kolonu eklendi';
  END IF;
END $$;

-- Index'ler oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_listings_parse_status ON listings(parse_status) WHERE parse_status = 'partial';
CREATE INDEX IF NOT EXISTS idx_listings_next_retry_at ON listings(next_retry_at) WHERE next_retry_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_parse_attempts ON listings(parse_attempts) WHERE parse_attempts < 4;

-- Mevcut kayıtları güncelle (partial kolonu varsa parse_status'e migrate et)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'partial'
  ) THEN
    UPDATE listings 
    SET parse_status = CASE 
      WHEN partial = true THEN 'partial'
      WHEN partial = false THEN 'full'
      ELSE 'partial'
    END
    WHERE parse_status IS NULL OR parse_status = 'partial';
    RAISE NOTICE 'Mevcut partial kolonu parse_status olarak migrate edildi';
  END IF;
END $$;

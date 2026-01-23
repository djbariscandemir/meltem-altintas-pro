-- Supabase Fix: Eksik kolonları ekle
-- Bu dosyayı Supabase SQL Editor'de çalıştırın (eğer kolon hatası alıyorsanız)

-- Tüm eksik kolonları ekle
DO $$ 
BEGIN
  -- area kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'area'
  ) THEN
    ALTER TABLE listings ADD COLUMN area TEXT;
    RAISE NOTICE 'area kolonu eklendi';
  END IF;

  -- description kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'description'
  ) THEN
    ALTER TABLE listings ADD COLUMN description TEXT;
    RAISE NOTICE 'description kolonu eklendi';
  END IF;

  -- listing_date_raw kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'listing_date_raw'
  ) THEN
    ALTER TABLE listings ADD COLUMN listing_date_raw TEXT;
    RAISE NOTICE 'listing_date_raw kolonu eklendi';
  END IF;

  -- is_site kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'is_site'
  ) THEN
    ALTER TABLE listings ADD COLUMN is_site TEXT;
    RAISE NOTICE 'is_site kolonu eklendi';
  END IF;

  -- building_age kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'building_age'
  ) THEN
    ALTER TABLE listings ADD COLUMN building_age TEXT;
    RAISE NOTICE 'building_age kolonu eklendi';
  END IF;

  -- location kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'location'
  ) THEN
    ALTER TABLE listings ADD COLUMN location TEXT;
    RAISE NOTICE 'location kolonu eklendi';
  END IF;

  -- listing_url kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'listing_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN listing_url TEXT;
    RAISE NOTICE 'listing_url kolonu eklendi';
  END IF;

  -- listing_owner kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'listing_owner'
  ) THEN
    ALTER TABLE listings ADD COLUMN listing_owner TEXT;
    RAISE NOTICE 'listing_owner kolonu eklendi';
  END IF;

  -- listing_owner_office kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'listing_owner_office'
  ) THEN
    ALTER TABLE listings ADD COLUMN listing_owner_office TEXT;
    RAISE NOTICE 'listing_owner_office kolonu eklendi';
  END IF;

  -- transaction_type kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'transaction_type'
  ) THEN
    ALTER TABLE listings ADD COLUMN transaction_type TEXT;
    RAISE NOTICE 'transaction_type kolonu eklendi';
  END IF;

  -- price_formatted kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'price_formatted'
  ) THEN
    ALTER TABLE listings ADD COLUMN price_formatted TEXT;
    RAISE NOTICE 'price_formatted kolonu eklendi';
  END IF;

  -- net_area kolonu (NUMERIC)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'net_area'
  ) THEN
    ALTER TABLE listings ADD COLUMN net_area NUMERIC;
    RAISE NOTICE 'net_area kolonu eklendi';
  END IF;
END $$;

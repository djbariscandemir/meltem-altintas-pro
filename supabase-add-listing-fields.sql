-- Supabase Schema Update: Yeni ilan alanları ekle
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- Tüm eksik kolonları ekle
DO $$ 
BEGIN
  -- is_active kolonu (boolean)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE listings ADD COLUMN is_active BOOLEAN;
    RAISE NOTICE 'is_active kolonu eklendi';
  END IF;

  -- listing_type kolonu (text)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'listing_type'
  ) THEN
    ALTER TABLE listings ADD COLUMN listing_type TEXT;
    RAISE NOTICE 'listing_type kolonu eklendi';
  END IF;

  -- phone_numbers kolonu (text array)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'phone_numbers'
  ) THEN
    ALTER TABLE listings ADD COLUMN phone_numbers TEXT[];
    RAISE NOTICE 'phone_numbers kolonu eklendi';
  END IF;

  -- notes kolonu (text)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'notes'
  ) THEN
    ALTER TABLE listings ADD COLUMN notes TEXT;
    RAISE NOTICE 'notes kolonu eklendi';
  END IF;

  -- reminder_at kolonu (timestamptz)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'reminder_at'
  ) THEN
    ALTER TABLE listings ADD COLUMN reminder_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'reminder_at kolonu eklendi';
  END IF;
END $$;

-- Index'ler oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_listing_type ON listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_reminder_at ON listings(reminder_at) WHERE reminder_at IS NOT NULL;

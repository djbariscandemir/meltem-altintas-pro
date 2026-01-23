-- Supabase Migration: Listings ve Imports tabloları
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- 1. Önce imports tablosu oluştur (listings bunu referans edecek)
CREATE TABLE IF NOT EXISTS imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_listings INTEGER NOT NULL,
  added_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0
);

-- 2. Sonra listings tablosu oluştur (imports'i referans eder)
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revy_id TEXT UNIQUE,
  owner_type TEXT,
  property_group TEXT,
  property_type TEXT,
  city TEXT,
  district TEXT,
  neighborhood TEXT,
  area TEXT, -- Semt
  net_area NUMERIC,
  price NUMERIC,
  price_formatted TEXT,
  listing_date DATE,
  listing_date_raw TEXT,
  building_age TEXT,
  is_site TEXT,
  rooms TEXT,
  title TEXT,
  description TEXT,
  location TEXT,
  listing_url TEXT,
  listing_owner TEXT,
  listing_owner_office TEXT,
  transaction_type TEXT,
  import_id UUID REFERENCES imports(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Index'ler oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_listings_import_id ON listings(import_id);
CREATE INDEX IF NOT EXISTS idx_listings_revy_id ON listings(revy_id);
CREATE INDEX IF NOT EXISTS idx_listings_owner_type ON listings(owner_type);
CREATE INDEX IF NOT EXISTS idx_listings_property_group ON listings(property_group);
CREATE INDEX IF NOT EXISTS idx_listings_listing_date ON listings(listing_date);
CREATE INDEX IF NOT EXISTS idx_listings_district ON listings(district);

-- 4. RLS (Row Level Security) politikaları
-- Şimdilik tüm verilere erişim serbest (ileride kullanıcı bazlı yapılabilir)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;

-- Herkese okuma/yazma izni (ileride daha sıkı politikalar eklenebilir)
CREATE POLICY "Allow all operations on listings" ON listings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on imports" ON imports
  FOR ALL USING (true) WITH CHECK (true);

-- 5. updated_at trigger'ı (otomatik güncelleme için)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_listings_updated_at 
  BEFORE UPDATE ON listings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Eksik kolonları ekle (eğer tablo zaten varsa)
-- Bu komutlar mevcut tablolara eksik kolonları ekler
DO $$ 
BEGIN
  -- area kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'area'
  ) THEN
    ALTER TABLE listings ADD COLUMN area TEXT;
  END IF;

  -- description kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'description'
  ) THEN
    ALTER TABLE listings ADD COLUMN description TEXT;
  END IF;

  -- listing_date_raw kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'listing_date_raw'
  ) THEN
    ALTER TABLE listings ADD COLUMN listing_date_raw TEXT;
  END IF;

  -- is_site kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'is_site'
  ) THEN
    ALTER TABLE listings ADD COLUMN is_site TEXT;
  END IF;

  -- building_age kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'building_age'
  ) THEN
    ALTER TABLE listings ADD COLUMN building_age TEXT;
  END IF;

  -- location kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'location'
  ) THEN
    ALTER TABLE listings ADD COLUMN location TEXT;
  END IF;

  -- listing_url kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'listing_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN listing_url TEXT;
  END IF;

  -- listing_owner kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'listing_owner'
  ) THEN
    ALTER TABLE listings ADD COLUMN listing_owner TEXT;
  END IF;

  -- listing_owner_office kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'listing_owner_office'
  ) THEN
    ALTER TABLE listings ADD COLUMN listing_owner_office TEXT;
  END IF;

  -- transaction_type kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'transaction_type'
  ) THEN
    ALTER TABLE listings ADD COLUMN transaction_type TEXT;
  END IF;

  -- price_formatted kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'price_formatted'
  ) THEN
    ALTER TABLE listings ADD COLUMN price_formatted TEXT;
  END IF;

  -- net_area kolonu (NUMERIC)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'net_area'
  ) THEN
    ALTER TABLE listings ADD COLUMN net_area NUMERIC;
  END IF;
END $$;

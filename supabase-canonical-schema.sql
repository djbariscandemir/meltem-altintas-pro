-- Supabase Kanonik Şema Migration
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- Kanonik şema: Sadece belirlenmiş alanlar kabul edilir

-- 1. imports tablosu (sadece dosya takibi için - basitleştirilmiş)
CREATE TABLE IF NOT EXISTS imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_listings INTEGER NOT NULL
);

-- 2. listings tablosu (KANONİK ŞEMA - sadece belirlenmiş alanlar)
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Kanonik alanlar (sadece bunlar kabul edilir)
  listing_id TEXT UNIQUE, -- Excel'den gelen unique ID
  title TEXT, -- Excel'deki \"İlan Başlığı\"
  listing_date DATE,
  source TEXT,
  owner_type TEXT,
  property_category TEXT, -- Otomatik türetilir (konut/ticari)
  property_type TEXT,
  price NUMERIC,
  net_area NUMERIC,
  gross_area NUMERIC,
  rooms TEXT,
  city TEXT,
  district TEXT,
  neighborhood TEXT,
  floor TEXT,
  building_age TEXT,
  heating_type TEXT,
  listing_url TEXT,
  
  -- Sistem alanları
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Index'ler oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_listings_listing_id ON listings(listing_id);
CREATE INDEX IF NOT EXISTS idx_listings_owner_type ON listings(owner_type);
CREATE INDEX IF NOT EXISTS idx_listings_property_category ON listings(property_category);
CREATE INDEX IF NOT EXISTS idx_listings_listing_date ON listings(listing_date);
CREATE INDEX IF NOT EXISTS idx_listings_district ON listings(district);

-- 4. RLS (Row Level Security) politikaları
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

-- 6. Mevcut tablo varsa eksik kolonları ekle
DO $$ 
BEGIN
  -- listing_id kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'listing_id'
  ) THEN
    ALTER TABLE listings ADD COLUMN listing_id TEXT UNIQUE;
  END IF;

  -- source kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'source'
  ) THEN
    ALTER TABLE listings ADD COLUMN source TEXT;
  END IF;

  -- title kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'title'
  ) THEN
    ALTER TABLE listings ADD COLUMN title TEXT;
  END IF;

  -- property_category kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'property_category'
  ) THEN
    ALTER TABLE listings ADD COLUMN property_category TEXT;
  END IF;

  -- gross_area kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'gross_area'
  ) THEN
    ALTER TABLE listings ADD COLUMN gross_area NUMERIC;
  END IF;

  -- floor kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'floor'
  ) THEN
    ALTER TABLE listings ADD COLUMN floor TEXT;
  END IF;

  -- heating_type kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'heating_type'
  ) THEN
    ALTER TABLE listings ADD COLUMN heating_type TEXT;
  END IF;

  -- listing_url kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'listing_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN listing_url TEXT;
  END IF;

END $$;

-- 7. Kaldırılması gereken kolonlar varsa uyarı (manuel silme gerekebilir)
-- NOT: import_id, added_count, updated_count, area, type_view_id kolonları
-- mevcut tabloda varsa manuel olarak kaldırılmalıdır
-- ALTER TABLE listings DROP COLUMN IF EXISTS import_id;
-- ALTER TABLE listings DROP COLUMN IF EXISTS area;
-- ALTER TABLE imports DROP COLUMN IF EXISTS added_count;
-- ALTER TABLE imports DROP COLUMN IF EXISTS updated_count;

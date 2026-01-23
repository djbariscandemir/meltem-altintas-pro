-- Supabase Migration: tracked_areas tablosu
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- 
-- Amaç: Revy fetch scriptinin takip edeceği bölgeleri saklamak

CREATE TABLE IF NOT EXISTS public.tracked_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  side text,
  district text NOT NULL,
  neighborhood text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_tracked_areas_active ON public.tracked_areas(active);
CREATE INDEX IF NOT EXISTS idx_tracked_areas_city_district ON public.tracked_areas(city, district);

-- RLS (Row Level Security) politikaları
ALTER TABLE public.tracked_areas ENABLE ROW LEVEL SECURITY;

-- Herkese okuma/yazma izni (ileride daha sıkı politikalar eklenebilir)
CREATE POLICY IF NOT EXISTS "Allow all operations on tracked_areas" ON public.tracked_areas
  FOR ALL USING (true) WITH CHECK (true);

-- Örnek veri (İstanbul Anadolu Yakası)
-- Bu satırları isterseniz silip kendi bölgelerinizi ekleyebilirsiniz
INSERT INTO public.tracked_areas (city, side, district, neighborhood, active)
VALUES 
  ('İstanbul', 'Anadolu Yakası', 'Ataşehir', NULL, true),
  ('İstanbul', 'Anadolu Yakası', 'Kadıköy', NULL, true),
  ('İstanbul', 'Anadolu Yakası', 'Üsküdar', NULL, true)
ON CONFLICT DO NOTHING;

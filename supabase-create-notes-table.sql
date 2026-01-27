-- Supabase Notes Tablosu Oluştur
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- Notes tablosu oluştur
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID, -- listings(id) ile ilişkili (foreign key opsiyonel - listing_id string de olabilir)
  note_text TEXT NOT NULL,
  reminder_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eğer content kolonu varsa note_text'e taşı ve content'i sil
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notes' AND column_name = 'content'
  ) THEN
    -- content kolonundaki verileri note_text'e kopyala
    UPDATE notes SET note_text = content WHERE note_text IS NULL OR note_text = '';
    -- content kolonunu sil
    ALTER TABLE notes DROP COLUMN IF EXISTS content;
    RAISE NOTICE 'content kolonu note_text olarak güncellendi';
  END IF;
END $$;

-- Foreign key constraint (eğer listings tablosu varsa)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    -- Foreign key ekle (eğer yoksa)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'notes_listing_id_fkey'
    ) THEN
      ALTER TABLE notes 
      ADD CONSTRAINT notes_listing_id_fkey 
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Index'ler oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_notes_listing_id ON notes(listing_id);
CREATE INDEX IF NOT EXISTS idx_notes_reminder_at ON notes(reminder_at) WHERE reminder_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

-- updated_at trigger'ı (otomatik güncelleme için)
CREATE OR REPLACE FUNCTION update_notes_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_updated_at_column();

-- RLS (Row Level Security) politikaları
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on notes" ON notes;
CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL USING (true) WITH CHECK (true);

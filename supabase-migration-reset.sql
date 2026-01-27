DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS listing_actions;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS imports;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS listing_status CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;
DROP TYPE IF EXISTS owner_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

CREATE TYPE listing_status AS ENUM ('satilik', 'kiralik');
CREATE TYPE property_type AS ENUM ('konut', 'ticari');
CREATE TYPE owner_type AS ENUM ('mulk_sahibi', 'emlak_ofisi');
CREATE TYPE user_role AS ENUM ('user', 'broker', 'admin');

CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  price numeric,
  listing_status listing_status NOT NULL DEFAULT 'satilik',
  listing_date date,
  property_type property_type NOT NULL DEFAULT 'konut',
  property_subtype text NOT NULL DEFAULT 'daire',
  rooms text,
  net_area numeric,
  gross_area numeric,
  floor text,
  building_age text,
  heating_type text,
  owner_type owner_type,
  owner_name text,
  city text,
  district text,
  neighborhood text,
  listing_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_listings_listing_date ON listings(listing_date);
CREATE INDEX idx_listings_listing_status ON listings(listing_status);
CREATE INDEX idx_listings_property_type ON listings(property_type);
CREATE INDEX idx_listings_owner_type ON listings(owner_type);
CREATE INDEX idx_listings_district ON listings(district);

CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  full_name text,
  phone text,
  birthday date,
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  action_type text,
  entity_type text,
  entity_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow insert activities" ON activities FOR INSERT WITH CHECK (true);

-- Notes tablosu (listings ile ilişkili)
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  reminder_at timestamptz,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notes_listing_id ON notes(listing_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on notes" ON notes FOR ALL USING (true) WITH CHECK (true);

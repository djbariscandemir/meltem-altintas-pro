-- İlan aksiyon takibi: viewed, called, note_added, skipped, marked_as_opportunity
-- Supabase SQL Editor'de çalıştırın

CREATE TABLE IF NOT EXISTS listing_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('viewed', 'called', 'note_added', 'skipped', 'marked_as_opportunity')),
  note_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_actions_listing_id ON listing_actions(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_actions_user_id ON listing_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_actions_created_at ON listing_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_listing_actions_type ON listing_actions(action_type);

ALTER TABLE listing_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read listing_actions" ON listing_actions
  FOR SELECT USING (true);
CREATE POLICY "Allow insert own action" ON listing_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

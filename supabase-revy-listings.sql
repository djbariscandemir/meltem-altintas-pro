ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS source text DEFAULT 'revy';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_revy_external
  ON public.listings (source, external_id)
  WHERE source = 'revy' AND external_id IS NOT NULL;

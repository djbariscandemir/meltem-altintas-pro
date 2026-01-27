-- listings tablosuna photos (string[]) ekler. Schema reset YOK.
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

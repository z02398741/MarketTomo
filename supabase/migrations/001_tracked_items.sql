-- MarketTomo: product tracking table
-- Run this migration once against your Supabase project.

CREATE TABLE IF NOT EXISTS tracked_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id text NOT NULL UNIQUE,
  title text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  image text NOT NULL DEFAULT '',
  shop text NOT NULL DEFAULT '',
  item_url text NOT NULL,
  platform text NOT NULL,
  review_count int NOT NULL DEFAULT 0,
  review_average numeric NOT NULL DEFAULT 0,
  tracked_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by product id
CREATE INDEX IF NOT EXISTS idx_tracked_items_product_id ON tracked_items(product_id);

-- Allow public read/write (no auth in V1; add RLS policies when auth is added)
ALTER TABLE tracked_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON tracked_items
  FOR ALL USING (true) WITH CHECK (true);

-- Supabase SQL: Create the items table
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  purchase_date DATE NOT NULL,
  platform TEXT NOT NULL,
  condition TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'In Stock',
  sale_price DECIMAL(10,2),
  sale_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (single user)
-- You can restrict this later when adding authentication
CREATE POLICY "Allow all operations" ON items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for common queries
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_brand ON items(brand);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_purchase_date ON items(purchase_date);
CREATE INDEX idx_items_sale_date ON items(sale_date);

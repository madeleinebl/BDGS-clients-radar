-- Enable public (anon) read access on all tables
-- Run this in Supabase SQL Editor

-- Drop authenticated-only policies
DROP POLICY IF EXISTS "Allow read for authenticated" ON companies;
DROP POLICY IF EXISTS "Allow read for authenticated" ON news_articles;
DROP POLICY IF EXISTS "Allow read for authenticated" ON article_companies;
DROP POLICY IF EXISTS "Allow read for authenticated" ON deals;
DROP POLICY IF EXISTS "Allow read for authenticated" ON opportunities;
DROP POLICY IF EXISTS "Allow read for authenticated" ON briefings;
DROP POLICY IF EXISTS "Allow read for authenticated" ON watchlist_items;
DROP POLICY IF EXISTS "Allow read for authenticated" ON scoring_methodology;

-- Create anon + authenticated read policies
CREATE POLICY "Allow public read" ON companies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON news_articles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON article_companies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON deals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON opportunities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON briefings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON watchlist_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read" ON scoring_methodology FOR SELECT TO anon, authenticated USING (true);

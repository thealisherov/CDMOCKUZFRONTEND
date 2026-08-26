-- ============================================================
-- ARTICLES DATABASE SCHEMA (IELTS Reading & Vocabulary Articles)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_index integer NOT NULL DEFAULT 1,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  level text NOT NULL DEFAULT 'B2 (IELTS 6.5+)',
  read_time text NOT NULL DEFAULT '5 min read',
  is_free boolean NOT NULL DEFAULT false,
  image_url text,
  excerpt text,
  content text NOT NULL,
  vocabulary jsonb DEFAULT '[]'::jsonb,
  exercises jsonb DEFAULT '[]'::jsonb,
  source text,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_order_index ON public.articles(order_index);
CREATE INDEX IF NOT EXISTS idx_articles_is_free ON public.articles(is_free);

-- Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow public reading of articles
DROP POLICY IF EXISTS "Public read articles" ON public.articles;
CREATE POLICY "Public read articles" ON public.articles
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow admins full access
DROP POLICY IF EXISTS "Admin write articles" ON public.articles;
CREATE POLICY "Admin write articles" ON public.articles
  FOR ALL TO authenticated
  USING (
    coalesce((auth.jwt()->'user_metadata'->>'role'), '') = 'admin'
  )
  WITH CHECK (
    coalesce((auth.jwt()->'user_metadata'->>'role'), '') = 'admin'
  );

-- =====================================================================
-- TYPING PRACTICE MODULE — SUPABASE DATABASE SCHEMA & TEXTS
-- Buni Supabase SQL Editor'da BIR MARTA ishga tushiring. Xavfsiz (idempotent).
-- =====================================================================

-- 1. Matnlar jadvali (Admin panel orqali kiritiladigan ingliz tili matnlari)
CREATE TABLE IF NOT EXISTS public.typing_texts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  content text NOT NULL,                    -- typing uchun matn (Faqat ingliz tilida)
  language text DEFAULT 'en',               -- Har doim 'en'
  category text DEFAULT 'academic',         -- academic / quotes / literature / tech / general
  difficulty text DEFAULT 'medium',         -- easy / medium / hard
  word_count int,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Urinishlar jadvali (Har bir typing testi natijasi)
CREATE TABLE IF NOT EXISTS public.typing_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  text_id uuid REFERENCES public.typing_texts(id) ON DELETE SET NULL,
  mode text DEFAULT 'time',                 -- 'time' | 'words'
  mode_value int DEFAULT 30,                -- 15/30/60/120 sekund yoki 10/25/50/100 so'z
  wpm numeric NOT NULL DEFAULT 0,
  raw_wpm numeric NOT NULL DEFAULT 0,
  accuracy numeric NOT NULL DEFAULT 0,
  correct_chars int NOT NULL DEFAULT 0,
  incorrect_chars int NOT NULL DEFAULT 0,
  duration_seconds numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Badge/yutuqlar jadvali
CREATE TABLE IF NOT EXISTS public.typing_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,                -- 'first_blood', 'speed_demon_80', 'speed_master_100', 'accuracy_king', 'marathon_120', 'streak_7'
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  condition_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 4. Foydalanuvchi erishgan badgeler jadvali
CREATE TABLE IF NOT EXISTS public.user_typing_badges (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES public.typing_badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- =====================================================================
-- INDEKSLAR (Yuqori tezlik va qidiruv uchun)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_typing_texts_lang_active ON public.typing_texts(language, is_active);
CREATE INDEX IF NOT EXISTS idx_typing_texts_diff ON public.typing_texts(difficulty);
CREATE INDEX IF NOT EXISTS idx_typing_attempts_user_created ON public.typing_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_typing_attempts_wpm ON public.typing_attempts(wpm DESC);
CREATE INDEX IF NOT EXISTS idx_user_typing_badges_user ON public.user_typing_badges(user_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.typing_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_typing_badges ENABLE ROW LEVEL SECURITY;

-- ---- typing_texts RLS ----
DROP POLICY IF EXISTS "Public read active typing texts" ON public.typing_texts;
DROP POLICY IF EXISTS "Admins full access typing texts" ON public.typing_texts;

CREATE POLICY "Public read active typing texts"
  ON public.typing_texts FOR SELECT
  USING ( is_active = true OR ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );

CREATE POLICY "Admins full access typing texts"
  ON public.typing_texts FOR ALL TO authenticated
  USING ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' )
  WITH CHECK ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );

-- ---- typing_attempts RLS ----
DROP POLICY IF EXISTS "Users read own typing attempts" ON public.typing_attempts;
DROP POLICY IF EXISTS "Users insert own typing attempts" ON public.typing_attempts;
DROP POLICY IF EXISTS "Admins read all typing attempts" ON public.typing_attempts;

CREATE POLICY "Users read own typing attempts"
  ON public.typing_attempts FOR SELECT TO authenticated
  USING ( (select auth.uid()) = user_id );

CREATE POLICY "Users insert own typing attempts"
  ON public.typing_attempts FOR INSERT TO authenticated
  WITH CHECK ( (select auth.uid()) = user_id );

CREATE POLICY "Admins read all typing attempts"
  ON public.typing_attempts FOR ALL TO authenticated
  USING ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );

-- ---- typing_badges RLS ----
DROP POLICY IF EXISTS "Public read typing badges" ON public.typing_badges;
DROP POLICY IF EXISTS "Admins full access typing badges" ON public.typing_badges;

CREATE POLICY "Public read typing badges"
  ON public.typing_badges FOR SELECT
  USING ( true );

CREATE POLICY "Admins full access typing badges"
  ON public.typing_badges FOR ALL TO authenticated
  USING ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' )
  WITH CHECK ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );

-- ---- user_typing_badges RLS ----
DROP POLICY IF EXISTS "Users read own badges" ON public.user_typing_badges;
DROP POLICY IF EXISTS "Users insert own badges" ON public.user_typing_badges;
DROP POLICY IF EXISTS "Admins full access user badges" ON public.user_typing_badges;

CREATE POLICY "Users read own badges"
  ON public.user_typing_badges FOR SELECT TO authenticated
  USING ( (select auth.uid()) = user_id OR ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );

CREATE POLICY "Users insert own badges"
  ON public.user_typing_badges FOR INSERT TO authenticated
  WITH CHECK ( (select auth.uid()) = user_id );

CREATE POLICY "Admins full access user badges"
  ON public.user_typing_badges FOR ALL TO authenticated
  USING ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );

-- =====================================================================
-- BADGES SEED DATA
-- =====================================================================
INSERT INTO public.typing_badges (code, name, description, icon, condition_json)
VALUES
  ('first_blood', 'First Steps', 'Complete your very first typing practice test', 'Zap', '{"type": "attempts_count", "min": 1}'::jsonb),
  ('speed_starter_40', 'Fast Fingers', 'Achieve typing speed over 40 WPM', 'Gauge', '{"type": "min_wpm", "min": 40}'::jsonb),
  ('speed_demon_60', 'Lightning Speed', 'Achieve typing speed over 60 WPM', 'Flame', '{"type": "min_wpm", "min": 60}'::jsonb),
  ('speed_demon_80', 'Speed Demon', 'Reach 80 WPM typing speed', 'Rocket', '{"type": "min_wpm", "min": 80}'::jsonb),
  ('speed_master_100', 'Typing Grandmaster', 'Break the 100 WPM speed barrier', 'Crown', '{"type": "min_wpm", "min": 100}'::jsonb),
  ('accuracy_king', 'Flawless Accuracy', 'Complete a test with 100% accuracy (min 20 words)', 'Target', '{"type": "accuracy_exact", "value": 100, "min_words": 20}'::jsonb),
  ('accuracy_pro', 'Sharpshooter', 'Complete a test with 98% or higher accuracy', 'Crosshair', '{"type": "min_accuracy", "min": 98}'::jsonb),
  ('marathon_120', 'Marathon Runner', 'Complete a full 120-second time mode test', 'Timer', '{"type": "mode_completed", "mode": "time", "value": 120}'::jsonb),
  ('century_club', 'Century Club', 'Complete a 100-words mode test', 'Award', '{"type": "mode_completed", "mode": "words", "value": 100}'::jsonb),
  ('streak_7', 'Weekly Dedication', 'Practice typing 7 days in a row', 'Sparkles', '{"type": "daily_streak", "min": 7}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  condition_json = EXCLUDED.condition_json;

-- =====================================================================
-- 30 DIVERSE ENGLISH TYPING TEXTS (IELTS & ACADEMIC TOPICS)
-- =====================================================================
INSERT INTO public.typing_texts (title, content, language, category, difficulty, word_count, is_active)
VALUES
  ('Academic Essay Writing', 'The ability to write clearly and effectively is one of the most critical skills required for success in higher education. Academic essays demand precise vocabulary, logical organization of ideas, and well-supported arguments.', 'en', 'academic', 'easy', 34, true),
  ('Global Climate Change', 'Climate change represents one of the most pressing challenges of our modern era. Rising global temperatures contribute to significant changes in weather patterns, sea level rise, and widespread ecological transformations across the planet.', 'en', 'academic', 'medium', 34, true),
  ('Artificial Intelligence and Society', 'Modern computing has transformed the paradigm of problem solving. Autonomous systems and machine learning algorithms analyze vast datasets in milliseconds, enabling scientific breakthroughs that were once thought to be purely theoretical.', 'en', 'tech', 'hard', 33, true),
  ('Space Exploration and Mars', 'Humanity stands on the verge of becoming a multi-planetary species. Advanced propulsion technologies and orbital habitats are paving the way for sustainable exploration missions to Mars and beyond.', 'en', 'academic', 'medium', 28, true),
  ('The Power of Atomic Habits', 'Small changes often appear to make no difference until you cross a critical threshold. Tiny habits compound over time into remarkable personal transformations, proving that consistency matters far more than intensity.', 'en', 'general', 'easy', 32, true),
  ('Renewable Energy Transitions', 'Transitioning toward sustainable energy systems is vital for reducing greenhouse gas emissions. Solar photovoltaic cells and offshore wind turbines are becoming increasingly efficient and cost-effective worldwide.', 'en', 'tech', 'medium', 27, true),
  ('Cognitive Psychology and Memory', 'Human memory is not a passive recording device, but an active constructive process. Neuroscientists have discovered that neural pathways strengthen through spaced repetition and deliberate recall practice.', 'en', 'academic', 'hard', 28, true),
  ('Marine Biodiversity and Reefs', 'Coral reefs support more than twenty-five percent of all marine life despite occupying less than one percent of the ocean floor. Protecting these delicate ecosystems is essential for maintaining oceanic equilibrium.', 'en', 'academic', 'medium', 31, true),
  ('Modern Urban Architecture', 'Contemporary urban planners design smart cities that prioritize public green spaces, energy-efficient transport networks, and sustainable building materials to enhance citizen wellbeing.', 'en', 'academic', 'easy', 23, true),
  ('Evolution of Human Language', 'Linguistic evolution demonstrates the remarkable adaptability of human cognition. Over thousands of years, dialects diverged and syntax developed, creating intricate symbolic communication systems.', 'en', 'literature', 'hard', 25, true),
  ('Economic Globalization and Trade', 'International trade agreements and supply chain logistics have interconnected national economies. Understanding exchange rates and comparative advantage is essential for analyzing international economic development.', 'en', 'academic', 'medium', 26, true),
  ('Deep Ocean Exploration', 'The deep sea remains one of the least explored frontiers on Earth. Benthic zones harbor bioluminescent organisms that thrive under extreme pressure and perpetual darkness near hydrothermal vents.', 'en', 'general', 'medium', 28, true),
  ('Mindfulness and Mental Resilience', 'You cannot always control external events, but you can cultivate internal serenity. Practicing mindfulness allows the mind to respond thoughtfully rather than reacting impulsively to daily stresses.', 'en', 'quotes', 'easy', 27, true),
  ('Cybersecurity and Digital Privacy', 'In an increasingly interconnected digital world, safeguarding sensitive information is crucial. Cryptographic protocols and multi-factor authentication form the primary defense against sophisticated cyber threats.', 'en', 'tech', 'medium', 25, true),
  ('History of the Printing Press', 'The invention of the movable type printing press in the fifteenth century democratized knowledge. It enabled rapid dissemination of literature, scientific discoveries, and philosophical ideas across Europe.', 'en', 'literature', 'easy', 27, true),
  ('Biotechnology and Gene Editing', 'CRISPR-Cas9 molecular tools have revolutionized genomic research. Targeted gene editing allows scientists to study hereditary diseases with unprecedented precision, opening novel therapeutic avenues.', 'en', 'tech', 'hard', 25, true),
  ('Sustainable Agriculture and Food', 'Feeding a growing global population requires regenerative agricultural practices. Crop rotation, precision irrigation, and organic soil management preserve nutrients while minimizing environmental degradation.', 'en', 'academic', 'medium', 25, true),
  ('Archaeology and Ancient Ruins', 'Archaeologists use satellite imagery and ground-penetrating radar to unearth lost civilizations. Every discovered artifact provides invaluable insights into ancient trade routes and social structures.', 'en', 'academic', 'medium', 25, true),
  ('Psychology of Decision Making', 'Behavioral economists have shown that human rationality is bounded by cognitive biases. Heuristic shortcuts often lead to predictable systematic errors when evaluating risks and probabilities.', 'en', 'academic', 'hard', 25, true),
  ('Nanotechnology Innovations', 'Manipulating matter at the nanoscale unveils unique physical and chemical properties. Carbon nanotubes and quantum dots facilitate breakthroughs in targeted drug delivery and high-capacity battery electrodes.', 'en', 'tech', 'hard', 27, true),
  ('Classical Literature and Themes', 'Great literature explores timeless themes of courage, redemption, and identity. Through storytelling, authors illuminate the human condition and inspire readers across diverse cultures and generations.', 'en', 'literature', 'easy', 26, true),
  ('The Science of Sleep and Rest', 'Quality sleep is essential for optimal brain function, emotional regulation, and physical health. During deep non-REM stages, the brain consolidates memories and clears metabolic waste products.', 'en', 'general', 'easy', 28, true),
  ('Quantum Computing Principles', 'Quantum computing leverages superposition and quantum entanglement to process complex mathematical calculations exponentially faster than classical supercomputers.', 'en', 'tech', 'hard', 18, true),
  ('Wildlife Conservation Strategies', 'Establishing protected wildlife corridors prevents habitat fragmentation and allows migratory species to thrive. Global conservation treaties play a vital role in curbing illegal poaching.', 'en', 'academic', 'medium', 24, true),
  ('The Social Media Landscape', 'Digital social platforms have transformed communication, community building, and information sharing, but they also require users to cultivate critical digital literacy.', 'en', 'general', 'easy', 22, true),
  ('Astrophysics and Black Holes', 'General relativity predicts that massive dying stars collapse into gravitational singularities. The boundary surrounding a black hole is the event horizon, beyond which nothing can escape.', 'en', 'academic', 'hard', 27, true),
  ('Clean Water Accessibility', 'Access to clean potable water is a fundamental human right. Solar-powered desalination plants and innovative filtration membranes offer sustainable solutions for water-scarce regions.', 'en', 'academic', 'medium', 24, true),
  ('Philosophy of Stoic Wisdom', 'Stoic philosophers taught that true freedom comes from distinguishing between things within our control and things outside our control. Focus your energy solely on virtue and purposeful action.', 'en', 'quotes', 'medium', 28, true),
  ('Microplastics in Ecosystems', 'Synthetic polymers degrade into microscopic plastic particles that accumulate in aquatic organisms. Bioaccumulation across trophic levels poses emerging ecological and biological concerns.', 'en', 'academic', 'hard', 22, true),
  ('The Art of Public Speaking', 'Confident public speaking is developed through preparation and practice. Structuring a clear message, maintaining eye contact, and pacing your delivery effectively engages any audience.', 'en', 'general', 'easy', 26, true);

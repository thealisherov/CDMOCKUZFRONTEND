-- =====================================================================
-- PUBLIC FULL MOCK TESTS & ACCESS CODES — SUPABASE SCHEMA
-- Buni Supabase SQL Editor'da BIR MARTA ishga tushiring. Idempotent.
-- =====================================================================

-- 1) full_mock_tests: Public full mock testlar meta-ma'lumotlari
-- Tests jadvalidagi center_id IS NULL bo'lgan full_mock testlar uchun
CREATE TABLE IF NOT EXISTS public.full_mock_tests (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  test_row_id    uuid REFERENCES public."Tests"(id) ON DELETE CASCADE UNIQUE,
  title          text NOT NULL DEFAULT 'IELTS Full Mock Test',
  price_uzs      integer DEFAULT 0,
  price_usd      numeric(10,2) DEFAULT 0,
  expire_hours   integer DEFAULT 48,
  is_active      boolean DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fmock_test_row ON public.full_mock_tests(test_row_id);
CREATE INDEX IF NOT EXISTS idx_fmock_active   ON public.full_mock_tests(is_active);

-- 2) full_mock_access_codes: Kirish kodlari
CREATE TABLE IF NOT EXISTS public.full_mock_access_codes (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_mock_id   uuid NOT NULL REFERENCES public.full_mock_tests(id) ON DELETE CASCADE,
  code           text UNIQUE NOT NULL,
  person_name    text NOT NULL,
  created_at     timestamptz DEFAULT now(),
  expires_at     timestamptz NOT NULL,
  used_at        timestamptz,
  is_used        boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_fmock_code_lookup ON public.full_mock_access_codes(code);
CREATE INDEX IF NOT EXISTS idx_fmock_code_mock   ON public.full_mock_access_codes(full_mock_id, created_at DESC);

-- 3) full_mock_submissions: Foydalanuvchi natijalari (public full mock)
CREATE TABLE IF NOT EXISTS public.full_mock_submissions (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_mock_id      uuid REFERENCES public.full_mock_tests(id) ON DELETE SET NULL,
  access_code_id    uuid REFERENCES public.full_mock_access_codes(id) ON DELETE SET NULL,
  person_name       text NOT NULL,

  user_answers      jsonb DEFAULT '{}'::jsonb,
  server_results    jsonb DEFAULT '{}'::jsonb,

  -- Listening & Reading natijalari
  listening_band    numeric,
  reading_band      numeric,
  listening_correct int DEFAULT 0,
  reading_correct   int DEFAULT 0,

  -- Writing AI natijasi
  writing_answers   jsonb,
  writing_results   jsonb,
  writing_band      numeric,

  -- Umumiy
  overall_band      numeric,
  time_spent_seconds int,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fmock_sub_mock ON public.full_mock_submissions(full_mock_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fmock_sub_code ON public.full_mock_submissions(access_code_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
ALTER TABLE public.full_mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.full_mock_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.full_mock_submissions ENABLE ROW LEVEL SECURITY;

-- full_mock_tests: Hammaga o'qish, admin to'liq boshqarish
DROP POLICY IF EXISTS "Public read active full mock tests" ON public.full_mock_tests;
CREATE POLICY "Public read active full mock tests"
  ON public.full_mock_tests FOR SELECT
  USING ( is_active = true OR ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );

DROP POLICY IF EXISTS "Admin full access full mock tests" ON public.full_mock_tests;
CREATE POLICY "Admin full access full mock tests"
  ON public.full_mock_tests FOR ALL TO authenticated
  USING ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' )
  WITH CHECK ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );

-- full_mock_access_codes: Faqat admin
DROP POLICY IF EXISTS "Admin full access codes" ON public.full_mock_access_codes;
CREATE POLICY "Admin full access codes"
  ON public.full_mock_access_codes FOR ALL TO authenticated
  USING ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' )
  WITH CHECK ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );

-- full_mock_submissions: Admin va service_role
DROP POLICY IF EXISTS "Admin full access submissions" ON public.full_mock_submissions;
CREATE POLICY "Admin full access submissions"
  ON public.full_mock_submissions FOR ALL TO authenticated
  USING ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' )
  WITH CHECK ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );

-- Anon insert (service_role orqali) uchun — qo'shimcha policy kerak emas
-- chunki service_role RLS'ni bypass qiladi.

-- =====================================================================
-- ANALYZE
-- =====================================================================
ANALYZE public.full_mock_tests;
ANALYZE public.full_mock_access_codes;
ANALYZE public.full_mock_submissions;

-- =====================================================================
-- TAYYOR.
-- =====================================================================

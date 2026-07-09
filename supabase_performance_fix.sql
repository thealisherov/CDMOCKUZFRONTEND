-- =====================================================================
-- PERFORMANCE FIX — RLS optimizatsiyasi + indekslar
-- Buni Supabase SQL Editor'da BIR MARTA ishga tushiring. Xavfsiz (idempotent).
-- =====================================================================
--
-- MUAMMO:
--   1) RLS policy'larda auth.uid() va auth.jwt() HAR BIR QATOR uchun qayta
--      hisoblanardi. Katta jadvallarda (TestAttempts, user_stats) bu so'rovni
--      o'nlab/yuzlab marta sekinlashtiradi.
--   2) user_stats jadvalida 4 ta bir-birini takrorlaydigan SELECT policy bor edi
--      — har bir qator uchun hammasi tekshirilardi.
--   3) Ba'zi ustunlarda indeks yo'q edi (Tests.type, va h.k.).
--
-- YECHIM:
--   auth.uid() -> (select auth.uid()) , auth.jwt() -> (select auth.jwt())
--   (Supabase rasmiy tavsiyasi: qiymat so'rov boshida BIR MARTA hisoblanadi.)
--   Ortiqcha policy'lar birlashtiriladi + kerakli indekslar qo'shiladi.
-- =====================================================================


-- =====================================================================
-- 1) INDEKSLAR (idempotent)
-- =====================================================================

-- TestAttempts — eng ko'p so'raladigan jadval
CREATE INDEX IF NOT EXISTS idx_testattempts_user_id
  ON public."TestAttempts"(user_id);
CREATE INDEX IF NOT EXISTS idx_testattempts_completed_at
  ON public."TestAttempts"(completed_at DESC);
-- Kombinatsiyalangan indeks: WHERE user_id = ? ORDER BY completed_at DESC
-- (Profile, Dashboard, /api/attempts uchun ideal)
CREATE INDEX IF NOT EXISTS idx_testattempts_user_completed
  ON public."TestAttempts"(user_id, completed_at DESC);

-- payments — user_id bo'yicha
CREATE INDEX IF NOT EXISTS idx_payments_user_id
  ON public.payments(user_id);

-- user_stats — leaderboard/rank uchun XP bo'yicha
CREATE INDEX IF NOT EXISTS idx_user_stats_xp
  ON public.user_stats(xp DESC);

-- Tests — /api/tests har doim `type` bo'yicha filtrlaydi va created_at bo'yicha saralaydi
CREATE INDEX IF NOT EXISTS idx_tests_type_created
  ON public."Tests"(type, created_at);

-- test_results (agar kelajakda ishlatilsa)
CREATE INDEX IF NOT EXISTS idx_test_results_user
  ON public.test_results(user_id);


-- =====================================================================
-- 2) RLS POLICY'LARNI OPTIMIZATSIYA QILISH
--    (eski nomlar bilan bir xil ma'noni saqlaymiz, faqat tezroq)
-- =====================================================================

-- ---- TestAttempts ----
DROP POLICY IF EXISTS "Users read own attempts"   ON public."TestAttempts";
DROP POLICY IF EXISTS "Users insert own attempts" ON public."TestAttempts";

CREATE POLICY "Users read own attempts"
  ON public."TestAttempts" FOR SELECT TO authenticated
  USING ( (select auth.uid()) = user_id );

CREATE POLICY "Users insert own attempts"
  ON public."TestAttempts" FOR INSERT TO authenticated
  WITH CHECK ( (select auth.uid()) = user_id );


-- ---- payments ----
DROP POLICY IF EXISTS "Users read own payments"      ON public.payments;
DROP POLICY IF EXISTS "Admins full access payments"  ON public.payments;

CREATE POLICY "Users read own payments"
  ON public.payments FOR SELECT TO authenticated
  USING ( (select auth.uid()) = user_id );

CREATE POLICY "Admins full access payments"
  ON public.payments FOR ALL TO authenticated
  USING ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );


-- ---- user_stats ----
-- 4 ta ortiqcha policy o'rniga: 1 ta ochiq SELECT (leaderboard hammani o'qishi kerak)
-- + faqat egasi yoza oladigan INSERT/UPDATE.
DROP POLICY IF EXISTS "Users read own stats"              ON public.user_stats;
DROP POLICY IF EXISTS "Users upsert own stats"            ON public.user_stats;
DROP POLICY IF EXISTS "Admin full access stats"           ON public.user_stats;
DROP POLICY IF EXISTS "Public read stats for leaderboard" ON public.user_stats;
DROP POLICY IF EXISTS "Public read stats"                 ON public.user_stats;
DROP POLICY IF EXISTS "Users insert own stats"            ON public.user_stats;
DROP POLICY IF EXISTS "Users update own stats"            ON public.user_stats;

-- Leaderboard/rank uchun hamma o'qiy oladi (USING(true) — indeks ishlaydi)
CREATE POLICY "Public read stats"
  ON public.user_stats FOR SELECT
  USING ( true );

CREATE POLICY "Users insert own stats"
  ON public.user_stats FOR INSERT TO authenticated
  WITH CHECK ( (select auth.uid()) = user_id );

CREATE POLICY "Users update own stats"
  ON public.user_stats FOR UPDATE TO authenticated
  USING ( (select auth.uid()) = user_id )
  WITH CHECK ( (select auth.uid()) = user_id );


-- ---- test_results ----
DROP POLICY IF EXISTS "Users read own results"    ON public.test_results;
DROP POLICY IF EXISTS "Users insert own results"  ON public.test_results;
DROP POLICY IF EXISTS "Admin full access results" ON public.test_results;

CREATE POLICY "Users read own results"
  ON public.test_results FOR SELECT TO authenticated
  USING ( (select auth.uid()) = user_id );

CREATE POLICY "Users insert own results"
  ON public.test_results FOR INSERT TO authenticated
  WITH CHECK ( (select auth.uid()) = user_id );

CREATE POLICY "Admin full access results"
  ON public.test_results FOR ALL TO authenticated
  USING ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );


-- =====================================================================
-- 3) PLANNER STATISTIKASINI YANGILASH (so'rov rejasi to'g'ri indeks tanlashi uchun)
-- =====================================================================
ANALYZE public."TestAttempts";
ANALYZE public.payments;
ANALYZE public.user_stats;
ANALYZE public."Tests";
ANALYZE public.test_results;

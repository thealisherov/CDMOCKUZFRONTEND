-- =====================================================================
-- O'QUV MARKAZLAR (LEARNING CENTERS) MODULI — 1-BOSQICH
-- =====================================================================
-- Buni Supabase SQL Editor'da BIR MARTA ishga tushiring.
-- Idempotent (qayta ishga tushirsa xato bermaydi) va MAVJUD jadvallarga
-- HECH QANDAY buzuvchi ta'sir qilmaydi:
--   * Faqat YANGI jadvallar qo'shadi (centers, center_submissions)
--   * "Tests" ga faqat NULLABLE center_id ustuni qo'shadi (eski testlar NULL
--     bo'lib qoladi => ular odatdagi platformada avvalgidek ko'rinadi)
--   * Mavjud policy/trigger/indekslarga tegmaydi
--
-- MODEL:
--   - O'quvchi   -> student_login + student_password bilan kiradi (testlarni ishlaydi)
--   - Markaz admini (o'qituvchi) -> admin_login + admin_password bilan kiradi (panel)
--   - Ikkalasini ham PLATFORMA admini markaz yaratishda o'rnatadi
--   - Ikkalasi ham Supabase email auth ISHLATMAYDI -> hammasi server route +
--     service_role orqali. Shu sabab bu jadvallarda anon/authenticated uchun
--     policy YO'Q; faqat platforma admini (role='admin') to'g'ridan-to'g'ri
--     boshqaradi. service_role RLS'ni avtomatik bypass qiladi.
-- =====================================================================


-- =====================================================================
-- 1) CENTERS jadvali
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.centers (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name             text NOT NULL,                 -- "iStudy Learning Center"
  slug             text UNIQUE NOT NULL,          -- "istudy"  (JSON dagi "center":"istudy" bilan mos)
  image_url        text,                          -- markaz logotipi/rasmi
  telegram_channel text,                          -- "@istudy_ielts" (natija e'loni matnida ishlatiladi)

  -- O'QUVCHI kirish kodi (test bo'limiga kirish uchun)
  student_login    text UNIQUE NOT NULL,
  student_password text NOT NULL,                 -- ochiq matn (admin ko'ra oladi)

  -- MARKAZ ADMINI (o'qituvchi) paneliga kirish uchun
  admin_login      text UNIQUE NOT NULL,
  admin_password   text NOT NULL,                 -- ochiq matn (admin ko'ra oladi)

  is_active        boolean DEFAULT true,
  created_by       uuid REFERENCES auth.users(id),-- yaratgan platforma admini
  created_at       timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_centers_slug          ON public.centers(slug);
CREATE INDEX IF NOT EXISTS idx_centers_student_login ON public.centers(student_login);
CREATE INDEX IF NOT EXISTS idx_centers_admin_login   ON public.centers(admin_login);

ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;

-- Faqat PLATFORMA admini markazlarni to'liq boshqaradi (dashboard orqali).
-- O'quvchi/markaz-admini bu jadvalga to'g'ridan-to'g'ri KIRA OLMAYDI
-- (policy yo'q => RLS bloklaydi). Ular login server route + service_role orqali.
DROP POLICY IF EXISTS "Platform admin full access centers" ON public.centers;
CREATE POLICY "Platform admin full access centers"
  ON public.centers FOR ALL TO authenticated
  USING      ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' )
  WITH CHECK ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );


-- =====================================================================
-- 2) "Tests" jadvaliga center_id ustuni + avtomatik sinxronizatsiya
-- =====================================================================
-- Mavjud testlar: center_id = NULL  -> odatdagi platformada ko'rinadi.
-- Markaz testlari: JSON ichida "center":"istudy" bo'lsa, trigger avtomatik
-- center_id ni to'ldiradi -> ular FAQAT o'sha markazda ko'rinadi.
-- Bu sizning "JSON ga center yozaman" ish uslubingizni saqlaydi.
ALTER TABLE public."Tests"
  ADD COLUMN IF NOT EXISTS center_id uuid REFERENCES public.centers(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tests_center_id ON public."Tests"(center_id);

-- JSON dagi data->>'center' (slug) asosida center_id ni avtomatik to'ldiruvchi trigger.
-- DIQQAT: avval markazni yarating, keyin o'sha markaz testlarini qo'shing
-- (aks holda center topilmay center_id NULL bo'lib qoladi).
CREATE OR REPLACE FUNCTION public.sync_test_center_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  cslug text;
  cid   uuid;
BEGIN
  cslug := NULLIF(trim(NEW.data ->> 'center'), '');
  IF cslug IS NULL THEN
    NEW.center_id := NULL;                 -- oddiy platforma testi
  ELSE
    SELECT id INTO cid FROM public.centers WHERE slug = cslug;
    NEW.center_id := cid;                  -- markaz topilmasa NULL (keyin markaz yaratilib qayta save qilinsa to'ladi)
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_test_center_id ON public."Tests";
CREATE TRIGGER trg_sync_test_center_id
  BEFORE INSERT OR UPDATE ON public."Tests"
  FOR EACH ROW EXECUTE FUNCTION public.sync_test_center_id();


-- =====================================================================
-- 3) CENTER_SUBMISSIONS jadvali (o'quvchi natijalari = card lar)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.center_submissions (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id         uuid NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  test_id           uuid REFERENCES public."Tests"(id) ON DELETE SET NULL,
  test_numeric_id   int,                    -- markaz ichidagi tartib raqami (URL uchun)
  test_title        text,
  test_type         text,                   -- 'listening' | 'reading' | 'writing' | 'full_mock'

  student_name      text NOT NULL,
  student_surname   text NOT NULL,

  user_answers      jsonb DEFAULT '{}'::jsonb,   -- o'quvchi javoblari (barcha bo'lim)
  server_results    jsonb DEFAULT '{}'::jsonb,   -- listening/reading avtomatik tekshiruv natijasi
  correct_count     int DEFAULT 0,
  total_questions   int DEFAULT 0,
  band_score        numeric,                     -- L/R uchun band; writing uchun NULL (o'qituvchi qo'yadi)

  -- WRITING xom holda (o'qituvchi qo'lda tekshiradi, copy tugmasi bilan nusxalaydi)
  writing_answers   jsonb,                       -- [{taskNumber, text, wordCount, timeSpent}]
  writing_reviewed  boolean DEFAULT false,
  teacher_band      numeric,                     -- o'qituvchi qo'ygan writing band (ixtiyoriy)

  time_spent_seconds int,
  created_at        timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_center_sub_center ON public.center_submissions(center_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_center_sub_test   ON public.center_submissions(test_id);

ALTER TABLE public.center_submissions ENABLE ROW LEVEL SECURITY;

-- Platforma admini hamma submissionlarni ko'ra oladi (nazorat uchun).
-- Markaz admini va o'quvchilar bu jadvalga service_role server route orqali kiradi.
DROP POLICY IF EXISTS "Platform admin full access submissions" ON public.center_submissions;
CREATE POLICY "Platform admin full access submissions"
  ON public.center_submissions FOR ALL TO authenticated
  USING      ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' )
  WITH CHECK ( ((select auth.jwt()) -> 'user_metadata' ->> 'role') = 'admin' );


-- =====================================================================
-- 4) (IXTIYORIY) Bir martalik topshirishni bazada ham qattiqlashtirish
-- =====================================================================
-- Asosiy "bir marta kirish" nazorati frontendda (localStorage) bo'ladi.
-- Agar bazada ham bir xil (markaz + test + ism + familiya) uchun takroriy
-- topshirishni bloklamoqchi bo'lsangiz, quyidagi UNIQUE indeksni yoqing.
-- (Ism-familiya takrorlanishi mumkinligi sabab default holda O'CHIRIB qo'yilgan.)
--
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_center_sub_once
--   ON public.center_submissions(center_id, test_id, lower(student_name), lower(student_surname));


-- =====================================================================
-- 5) Planner statistikasi
-- =====================================================================
ANALYZE public.centers;
ANALYZE public.center_submissions;
ANALYZE public."Tests";

-- =====================================================================
-- TAYYOR. Endi frontend/API tomonini quramiz.
-- =====================================================================

-- =====================================================================
-- ADMIN PANEL — TEZ FOYDALANUVCHI YUKLASH
-- Buni Supabase SQL Editor'da BIR MARTA ishga tushiring. Xavfsiz (idempotent).
-- =====================================================================
--
-- MUAMMO:
--   Admin panel (`/api/admin/users` va `/api/admin/stats`) GoTrue'ning
--   `auth.admin.listUsers()` API'sini ishlatardi. U foydalanuvchilarni
--   1000 tadan KETMA-KET sahifalab tortadi (har sahifa alohida HTTP so'rov),
--   har bir foydalanuvchining butun obyektini (barcha metadata, identities...)
--   qaytaradi. Bir necha ming foydalanuvchida bu bir necha soniya davom etadi.
--
-- YECHIM:
--   `auth.users` jadvalini to'g'ridan-to'g'ri SQL orqali (SECURITY DEFINER
--   funksiya bilan) o'qiymiz. Bitta indekslangan so'rov + faqat kerakli
--   ustunlar. Bu GoTrue API'dan o'nlab marta tezroq.
--
--   Funksiyalar faqat service_role tomonidan chaqiriladi (API route avval
--   admin ekanini tekshiradi). anon/authenticated'dan EXECUTE olib tashlanadi.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Foydalanuvchilar ro'yxati (admin Users tab uchun)
--    Faqat UI kerak bo'lgan kichik ustunlarni qaytaradi.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id           uuid,
  email        text,
  created_at   timestamptz,
  full_name    text,
  avatar_url   text,
  role         text,
  premium_until timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    u.id,
    u.email::text,
    u.created_at,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name')      AS full_name,
    COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture')   AS avatar_url,
    COALESCE(u.raw_user_meta_data->>'role', 'student')                                AS role,
    NULLIF(u.raw_user_meta_data->>'premium_until', '')::timestamptz                   AS premium_until
  FROM auth.users u
  ORDER BY u.created_at DESC;
$$;


-- ---------------------------------------------------------------------
-- 2) Foydalanuvchi sanoqlari (admin Statistics tab uchun)
--    Barcha foydalanuvchilarni tortmasdan, faqat 2 ta COUNT qaytaradi.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_user_counts()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT json_build_object(
    'total',   COUNT(*),
    'premium', COUNT(*) FILTER (
       WHERE NULLIF(raw_user_meta_data->>'premium_until', '')::timestamptz > now()
    )
  )
  FROM auth.users;
$$;


-- ---------------------------------------------------------------------
-- 3) Ruxsatlar — faqat service_role chaqira oladi
-- ---------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.admin_list_users()  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_user_counts()  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_user_counts() TO service_role;

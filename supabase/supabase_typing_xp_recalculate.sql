-- =====================================================================
-- TYPING XP QAYTA HISOBLASH — Yangi formula: har bir mashqda 1-3 XP (WPM asosida)
-- Buni Supabase SQL Editor'da BIR MARTA ishga tushiring.
-- =====================================================================
--
-- ESKI FORMULA:  earnedXp = MAX(5, 10 + floor(wpm/10)*2 + accuracyBonus)
--                → 5 dan 80 gacha XP berardi
--
-- YANGI FORMULA: WPM < 20  → 1 XP
--                WPM 20-49 → 2 XP
--                WPM >= 50  → 3 XP
-- =====================================================================

-- 1. Barcha mavjud qatorlarni yangi formula bo'yicha qayta hisoblash
UPDATE public.typing_attempts
SET xp_earned = CASE
  WHEN COALESCE(wpm, 0) >= 50 THEN 3
  WHEN COALESCE(wpm, 0) >= 20 THEN 2
  ELSE 1
END;

-- 2. XP constraint ni yangilash (eski 0-500 → yangi 0-3)
-- Avval eskisini o'chiramiz
ALTER TABLE public.typing_attempts DROP CONSTRAINT IF EXISTS chk_typing_xp;

-- Yangisini qo'shamiz
ALTER TABLE public.typing_attempts
  ADD CONSTRAINT chk_typing_xp CHECK (xp_earned >= 0 AND xp_earned <= 3);

-- 3. Default qiymatni yangilash
ALTER TABLE public.typing_attempts ALTER COLUMN xp_earned SET DEFAULT 1;

-- 4. Statistikani yangilash
ANALYZE public.typing_attempts;

-- =====================================================================
-- NATIJA:
--   Barcha mavjud typing_attempts qatorlaridagi xp_earned 
--   yangi formula bo'yicha 1, 2 yoki 3 ga o'zgartirildi.
--   Endi har bir mashq maksimal 3 XP beradi.
-- =====================================================================

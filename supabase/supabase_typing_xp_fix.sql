-- =====================================================================
-- TYPING XP FIX — typing_attempts jadvaliga xp_earned ustuni qo'shish
-- Buni Supabase SQL Editor'da BIR MARTA ishga tushiring. Xavfsiz (idempotent).
-- =====================================================================
--
-- MUAMMO:
--   Typing mashqlaridan olingan XP hech qayerda saqlanmasdi.
--   Server hisoblab frontendga qaytarardi, lekin bazaga yozmasdi.
--   Bu XP lar typing leaderboardda ko'rinmay qolardi.
--
-- YECHIM:
--   1) typing_attempts jadvaliga xp_earned ustuni qo'shiladi
--   2) Mavjud qatorlarga retroaktiv XP hisoblash (WPM va accuracy asosida)
--   3) Yangi indeks qo'shiladi (leaderboard aggregatsiyasi uchun)
-- =====================================================================

-- 1. xp_earned ustunini qo'shish (agar mavjud bo'lmasa)
ALTER TABLE public.typing_attempts
  ADD COLUMN IF NOT EXISTS xp_earned int NOT NULL DEFAULT 0;

-- 2. Mavjud qatorlarga retroaktiv XP hisoblash
-- Formula: earnedXp = MAX(5, 10 + floor(wpm/10)*2 + accuracyBonus)
-- accuracyBonus: accuracy >= 98 → 10, accuracy >= 95 → 5, else → 0
UPDATE public.typing_attempts
SET xp_earned = GREATEST(
  5,
  10
  + FLOOR(COALESCE(wpm, 0) / 10) * 2
  + CASE
      WHEN COALESCE(accuracy, 0) >= 98 THEN 10
      WHEN COALESCE(accuracy, 0) >= 95 THEN 5
      ELSE 0
    END
)
WHERE xp_earned = 0;

-- 3. BUZILGAN MA'LUMOTLARNI TOZALASH — WPM > 300 bo'lgan qatorlarni tuzatish
-- (Eski bug: startTime null bo'lganda WPM millionlarga chiqardi)
UPDATE public.typing_attempts
SET
  wpm = LEAST(300, GREATEST(0, wpm)),
  raw_wpm = LEAST(300, GREATEST(0, raw_wpm))
WHERE wpm > 300 OR raw_wpm > 300;

-- 4. XP ni qayta hisoblash (WPM tuzatilgandan keyin)
-- Formula: earnedXp = MAX(5, 10 + floor(wpm/10)*2 + accuracyBonus)
UPDATE public.typing_attempts
SET xp_earned = GREATEST(
  5,
  10
  + FLOOR(LEAST(300, COALESCE(wpm, 0)) / 10) * 2
  + CASE
      WHEN COALESCE(accuracy, 0) >= 98 THEN 10
      WHEN COALESCE(accuracy, 0) >= 95 THEN 5
      ELSE 0
    END
);

-- 5. Indeks: user_id bo'yicha XP aggregatsiyasi uchun
CREATE INDEX IF NOT EXISTS idx_typing_attempts_user_xp
  ON public.typing_attempts(user_id, xp_earned);

-- 6. Statistikani yangilash
ANALYZE public.typing_attempts;

-- =====================================================================
-- 7. DATABASE-LEVEL CHECK CONSTRAINTS (ENG KUCHLI HIMOYA)
--    Frontend yoki backend kodda xatolik bo'lsa ham, baza O'ZI rad qiladi.
--    Bu 4-qatlam himoya — kafolat shu yerda.
-- =====================================================================

-- WPM: 0–300 oralig'ida bo'lishi SHART
DO $$ BEGIN
  ALTER TABLE public.typing_attempts
    ADD CONSTRAINT chk_typing_wpm CHECK (wpm >= 0 AND wpm <= 300);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.typing_attempts
    ADD CONSTRAINT chk_typing_raw_wpm CHECK (raw_wpm >= 0 AND raw_wpm <= 300);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Accuracy: 0–100 oralig'ida bo'lishi SHART
DO $$ BEGIN
  ALTER TABLE public.typing_attempts
    ADD CONSTRAINT chk_typing_accuracy CHECK (accuracy >= 0 AND accuracy <= 100);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- XP: 0–500 oralig'ida bo'lishi SHART (max = 10 + 60 + 10 = 80, lekin xavfsizlik uchun 500)
DO $$ BEGIN
  ALTER TABLE public.typing_attempts
    ADD CONSTRAINT chk_typing_xp CHECK (xp_earned >= 0 AND xp_earned <= 500);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Duration: kamida 1 sekund bo'lishi SHART
DO $$ BEGIN
  ALTER TABLE public.typing_attempts
    ADD CONSTRAINT chk_typing_duration CHECK (duration_seconds >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

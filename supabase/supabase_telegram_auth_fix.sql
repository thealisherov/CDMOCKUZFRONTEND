-- =======================================================
-- SUPABASE TELEGRAM AUTHENTICATION - SECURE FIXES
-- =======================================================
-- Run these queries in your Supabase SQL Editor to secure
-- the sessions table and support telegram_id identification.

-- 1. Ensure 'public.users' table has a 'telegram_id' column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_id text UNIQUE;

-- 2. Modify 'telegram_auth_sessions' table to match the new architecture
ALTER TABLE public.telegram_auth_sessions 
  ADD COLUMN IF NOT EXISTS telegram_id text,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Remove columns that are no longer needed for security (optional but recommended)
ALTER TABLE public.telegram_auth_sessions DROP COLUMN IF EXISTS phone;
ALTER TABLE public.telegram_auth_sessions DROP COLUMN IF EXISTS temp_password;

-- 3. Create indexes for quick session queries by telegram_id
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_tg_id ON public.telegram_auth_sessions(telegram_id);

-- 4. Close the security hole: Remove all client-side SELECT/DELETE/INSERT policies on the sessions table
-- Since the frontend now communicates solely with our secure Next.js API route (/api/telegram/verify-otp),
-- the client browser does not need direct access to the 'telegram_auth_sessions' table anymore.
-- The API route uses the 'service_role' key, which automatically bypasses all RLS policies.

DROP POLICY IF EXISTS "Allow client-side session monitoring" ON public.telegram_auth_sessions;
DROP POLICY IF EXISTS "Allow client-side session deletion" ON public.telegram_auth_sessions;
DROP POLICY IF EXISTS "Allow client-side session creation" ON public.telegram_auth_sessions;

-- Keep Row Level Security enabled (with no policies, meaning all anonymous client-side direct access is denied)
ALTER TABLE public.telegram_auth_sessions ENABLE ROW LEVEL SECURITY;


-- =======================================================
-- IMPORTANT: USER SYNC TRIGGER FUNCTION UPDATE
-- =======================================================
-- If you have a trigger function that copies new auth.users rows to your public.users table,
-- you must update it to include the 'telegram_id' from the user's raw metadata.
--
-- Example of updated trigger function:
--
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.users (id, full_name, email, role, telegram_id)
--   VALUES (
--     new.id,
--     new.raw_user_meta_data->>'full_name',
--     new.email,
--     COALESCE(new.raw_user_meta_data->>'role', 'student'),
--     new.raw_user_meta_data->>'telegram_id'
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

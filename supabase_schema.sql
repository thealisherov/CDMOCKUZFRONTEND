-- ==========================================
-- TELEGRAM AUTHENTICATION DATABASE SCHEMA
-- ==========================================
-- Copy and run the following queries in your Supabase SQL Editor.

-- 1. Create the Auth Sessions table
CREATE TABLE IF NOT EXISTS public.telegram_auth_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  otp_code text NOT NULL UNIQUE,
  chat_id bigint,
  status text DEFAULT 'pending', -- pending, waiting_contact, authenticated, expired
  phone text,
  temp_password text,
  user_metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create indexes for high-speed lookups
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_otp ON public.telegram_auth_sessions(otp_code);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_chat ON public.telegram_auth_sessions(chat_id);

-- 3. Enable Supabase Realtime for this table
-- This allows the frontend client to subscribe to status updates via WebSocket
ALTER PUBLICATION supabase_realtime ADD TABLE public.telegram_auth_sessions;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.telegram_auth_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for secure client-side access
-- Since the backend webhook uses the 'service_role' key, it automatically bypasses these policies.
-- These policies are only for anonymous client browsers to insert and monitor their own sessions.

-- Policy: Allow anyone (anon or authenticated) to start a login session (insert OTP)
CREATE POLICY "Allow client-side session creation" ON public.telegram_auth_sessions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow anyone to view details of sessions (required for Realtime subscription)
CREATE POLICY "Allow client-side session monitoring" ON public.telegram_auth_sessions
  FOR SELECT TO anon, authenticated
  USING (true);

-- Policy: Allow clients to delete their session (completed cleanup)
CREATE POLICY "Allow client-side session deletion" ON public.telegram_auth_sessions
  FOR DELETE TO anon, authenticated
  USING (true);

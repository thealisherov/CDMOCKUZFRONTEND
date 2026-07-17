import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * SERVICE ROLE Supabase klienti — FAQAT server tomonda ishlatiladi.
 *
 * RLS'ni bypass qiladi. O'quv Markaz moduli (o'quvchi/markaz-admini Supabase
 * auth ishlatmaydi) barcha DB amallarini shu klient orqali, imzolangan
 * cookie sessiyasi tekshirilgandan KEYIN bajaradi.
 *
 * DIQQAT: bu klientni hech qachon klient (browser) kodiga import qilmang.
 */
let adminClient = null;

export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY topilmadi (server env).');
  }
  if (!adminClient) {
    adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return adminClient;
}

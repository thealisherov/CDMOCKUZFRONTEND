import { createClient } from './client';

/**
 * Access token'ni XAVFSIZ olish.
 *
 * `supabase.auth.getSession()` auth lock'ni kutadi. Agar biror joyda lock
 * ushlanib qolsa (masalan onAuthStateChange callback ichida await qilinsa),
 * getSession() ABADIY osilib qoladi va uni kutayotgan UI "Loading..." holatida
 * muzlab qoladi — hech qanday xato ham ko'rinmaydi.
 *
 * Shuning uchun har doim timeout bilan o'raymiz: belgilangan vaqtda javob
 * kelmasa, null qaytaramiz. Chaqiruvchi kod shunda 401 oladi va foydalanuvchiga
 * tushunarli xato ko'rsatadi — abadiy spinner o'rniga.
 */
export async function getAccessToken(timeoutMs = 8000) {
  const supabase = createClient();
  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    if (!result) {
      console.warn('[auth] getSession() timed out — auth lock band bo\'lishi mumkin');
      return null;
    }
    return result.data?.session?.access_token ?? null;
  } catch (e) {
    console.error('[auth] getSession() failed:', e);
    return null;
  }
}

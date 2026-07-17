import crypto from 'crypto';
import { cookies } from 'next/headers';

/**
 * O'quv Markaz sessiyasi — Supabase auth'siz, imzolangan (HMAC) cookie.
 *
 * Token format:  base64url(payloadJson).base64url(hmacSha256)
 * Payload:       { centerId, slug, name, kind:'student'|'admin', telegram, image, exp }
 *
 * Sir (secret): CENTER_SESSION_SECRET; agar berilmagan bo'lsa server-only
 * SUPABASE_SERVICE_ROLE_KEY dan foydalanamiz (u ham maxfiy, faqat serverda).
 */

export const CENTER_COOKIE = 'center_session';
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 soat

function getSecret() {
  const s = process.env.CENTER_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error('CENTER_SESSION_SECRET (yoki SUPABASE_SERVICE_ROLE_KEY) topilmadi.');
  return s;
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}
function hmac(data) {
  return b64url(crypto.createHmac('sha256', getSecret()).update(data).digest());
}

/** Payloadni imzolab token qaytaradi. */
export function signCenterSession(payload) {
  const body = { ...payload, exp: Date.now() + MAX_AGE_SECONDS * 1000 };
  const p = b64url(JSON.stringify(body));
  return `${p}.${hmac(p)}`;
}

/** Tokenni tekshiradi; yaroqli bo'lsa payload, aks holda null. */
export function verifyCenterSession(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [p, sig] = token.split('.');
  if (!p || !sig) return null;
  // Constant-time taqqoslash
  const expected = hmac(p);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(p));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export const CENTER_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: MAX_AGE_SECONDS,
};

/**
 * Server route/komponentda joriy markaz sessiyasini o'qiydi.
 * @param {('student'|'admin')} [requireKind] — berilsa, faqat shu turdagi sessiya qabul qilinadi.
 * @returns payload | null
 */
export async function getCenterSession(requireKind) {
  const store = await cookies();
  const token = store.get(CENTER_COOKIE)?.value;
  const session = verifyCenterSession(token);
  if (!session) return null;
  if (requireKind && session.kind !== requireKind) return null;
  return session;
}

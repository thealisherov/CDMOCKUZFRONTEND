import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - markaz / api/centers (O'quv Markaz bo'limi — Supabase auth ISHLATMAYDI,
     *   markaz cookie sessiyasi bilan ishlaydi; sessiya yangilash shart emas)
     * - api (API routes, optional if APIs don't need cookie refresh)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|images|favicon.ico|markaz|api/centers|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

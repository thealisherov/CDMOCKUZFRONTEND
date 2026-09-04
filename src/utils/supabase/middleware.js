import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');

  // ── Protected dashboard sub-routes (auth required) ──
  const protectedPrefixes = [
    '/dashboard/profile',
    '/dashboard/admin',
    '/dashboard/payment',
    '/dashboard/premium',
    '/dashboard/support',
  ];

  // Test detail & attempts pages: /dashboard/{skill}/{id} or /dashboard/{skill}/attempts
  const testDetailPattern = /^\/dashboard\/(listening|reading|writing)\/(.+)/;

  const isProtectedRoute =
    protectedPrefixes.some((prefix) => path.startsWith(prefix)) ||
    testDetailPattern.test(path);

  // Check if any Supabase auth session cookies exist
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) =>
      (c.name.startsWith('sb-') && c.name.includes('auth-token')) ||
      c.name.includes('supabase-auth-token')
  );

  // ── FAST PATH 1: Unauthenticated visitor accessing a protected route ──
  // No need to query Supabase — redirect to /login instantly
  if (!hasAuthCookie && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // ── FAST PATH 2: Public marketing / landing page without auth cookie ──
  // Eliminates 300-800ms network roundtrip on every visit to '/'
  if (!hasAuthCookie && !isAuthRoute) {
    return NextResponse.next({ request });
  }

  // ── STANDARD PATH: Session refresh & verification for authenticated users ──
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verify and refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

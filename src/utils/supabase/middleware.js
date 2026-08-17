import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');

  // ── Protected dashboard sub-routes (auth required) ──
  // Test pages:  /dashboard/listening/[id], /dashboard/reading/[id], /dashboard/writing/[id]
  // Attempts:    /dashboard/listening/attempts, etc.
  // User pages:  /dashboard/profile, /dashboard/payment, /dashboard/premium
  // Admin/other: /dashboard/admin, /dashboard/support, /dashboard/comments
  //
  // Public (no auth): /dashboard, /dashboard/listening, /dashboard/reading,
  //                   /dashboard/writing, /dashboard/leaderboard
  const protectedPrefixes = [
    '/dashboard/profile',
    '/dashboard/admin',
    '/dashboard/typing',
    '/dashboard/payment',
    '/dashboard/premium',
    '/dashboard/support',
  ];

  // Test detail & attempts pages: /dashboard/{skill}/{id} or /dashboard/{skill}/attempts
  const testDetailPattern = /^\/dashboard\/(listening|reading|writing)\/(.+)/;

  const isProtectedRoute =
    protectedPrefixes.some((prefix) => path.startsWith(prefix)) ||
    testDetailPattern.test(path);

  if (!user && isProtectedRoute) {
    // Users who are not logged in but trying to access protected routes must login first
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    // Users who are already logged in shouldn't see the login page anymore
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

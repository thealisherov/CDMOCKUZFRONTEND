import { NextResponse } from 'next/server';
import { CENTER_COOKIE } from '@/lib/center-session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CENTER_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}

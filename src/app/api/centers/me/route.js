import { NextResponse } from 'next/server';
import { getCenterSession } from '@/lib/center-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCenterSession();
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({
    authenticated: true,
    kind: session.kind,
    center: {
      name: session.name,
      slug: session.slug,
      image: session.image || null,
      telegram: session.telegram || null,
    },
  });
}

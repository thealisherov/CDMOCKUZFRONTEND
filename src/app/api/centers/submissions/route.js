/**
 * GET /api/centers/submissions
 * Markaz admini (o'qituvchi) sessiyasi shart. O'z markazining submissionlari.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCenterSession } from '@/lib/center-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCenterSession('admin');
  if (!session) return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('center_submissions')
    .select('*')
    .eq('center_id', session.centerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[centers/submissions] error:', error);
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 });
  }

  return NextResponse.json({
    center: { name: session.name, slug: session.slug, telegram: session.telegram || null },
    submissions: data || [],
  });
}

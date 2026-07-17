/**
 * DELETE /api/centers/submissions/[id]  — cardni o'chirish
 * PATCH  /api/centers/submissions/[id]  — writing tekshirildi / teacher_band qo'yish
 * Faqat markaz admini (o'qituvchi) va faqat O'Z markazi submissionlari uchun.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCenterSession } from '@/lib/center-session';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  const session = await getCenterSession('admin');
  if (!session) return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('center_submissions')
    .delete()
    .eq('id', id)
    .eq('center_id', session.centerId); // faqat o'z markazi

  if (error) {
    console.error('[centers/submissions DELETE] error:', error);
    return NextResponse.json({ error: 'O\'chirishda xatolik' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(request, { params }) {
  const session = await getCenterSession('admin');
  if (!session) return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const update = {};
  if (body.teacher_band !== undefined) update.teacher_band = body.teacher_band === null ? null : Number(body.teacher_band);
  if (body.writing_reviewed !== undefined) update.writing_reviewed = !!body.writing_reviewed;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'O\'zgartirish uchun maydon yo\'q' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('center_submissions')
    .update(update)
    .eq('id', id)
    .eq('center_id', session.centerId);

  if (error) {
    console.error('[centers/submissions PATCH] error:', error);
    return NextResponse.json({ error: 'Yangilashda xatolik' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

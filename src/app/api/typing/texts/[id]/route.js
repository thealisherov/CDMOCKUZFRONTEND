import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// PUT /api/typing/texts/[id] — matnni tahrirlash (Faqat admin)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Matn ID si ko\'rsatilmadi.' }, { status: 400 });
    }

    const body = await request.json();
    const { title, content, language, category, difficulty, is_active } = body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) {
      updates.content = content.trim();
      updates.word_count = content.trim().split(/\s+/).filter(Boolean).length;
    }
    if (language !== undefined) updates.language = language.toLowerCase();
    if (category !== undefined) updates.category = category.toLowerCase();
    if (difficulty !== undefined) updates.difficulty = difficulty.toLowerCase();
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    const { data, error } = await supabaseAdmin
      .from('typing_texts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[API /api/typing/texts/[id] PUT] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, text: data });
  } catch (err) {
    console.error('[API /api/typing/texts/[id] PUT] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/typing/texts/[id] — matnni o'chirish (Faqat admin)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Matn ID si ko\'rsatilmadi.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('typing_texts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[API /api/typing/texts/[id] DELETE] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Matn muvaffaqiyatli o\'chirildi.' });
  } catch (err) {
    console.error('[API /api/typing/texts/[id] DELETE] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

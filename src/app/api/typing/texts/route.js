import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET /api/typing/texts — matnlar ro'yxatini olish
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang');
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');
    const fetchAll = searchParams.get('all') === 'true';

    const isAdmin = user?.user_metadata?.role === 'admin';

    let query = supabaseAdmin
      .from('typing_texts')
      .select('*')
      .order('created_at', { ascending: false });

    // Agar admin barchasini ko'rmoqchi bo'lmasa, faqat faol matnlar
    if (!isAdmin || !fetchAll) {
      query = query.eq('is_active', true);
    }

    if (lang && lang !== 'all') {
      query = query.eq('language', lang);
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      // Agar jadval hali mavjud bo'lmasa
      if (error.code === '42P01') {
        return NextResponse.json({ texts: [] });
      }
      console.error('[API /api/typing/texts] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ texts: data || [] });
  } catch (err) {
    console.error('[API /api/typing/texts] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/typing/texts — yangi matn yaratish (Faqat admin)
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, language = 'en', category = 'general', difficulty = 'medium', is_active = true } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Matn mazmuni (content) kiritilishi shart.' }, { status: 400 });
    }

    const trimmedContent = content.trim();
    const wordCount = trimmedContent.split(/\s+/).filter(Boolean).length;

    const { data, error } = await supabaseAdmin
      .from('typing_texts')
      .insert([{
        title: title?.trim() || 'Untitled Text',
        content: trimmedContent,
        language: language.toLowerCase(),
        category: category.toLowerCase(),
        difficulty: difficulty.toLowerCase(),
        word_count: wordCount,
        is_active: is_active ?? true,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('[API /api/typing/texts POST] Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, text: data }, { status: 201 });
  } catch (err) {
    console.error('[API /api/typing/texts POST] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

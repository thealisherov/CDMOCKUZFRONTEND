import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import localArticles from '@/data/articles.json';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Auth talab qilinadi', status: 401 };
  const role = user.user_metadata?.role;
  if (role !== 'admin') return { error: 'Ruxsat yo\'q (Admin required)', status: 403 };
  return { user };
}

export async function GET(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const category = searchParams.get('category');

  let articles = [];
  let dbSuccess = false;

  try {
    const admin = createAdminClient();
    let query = admin
      .from('articles')
      .select('*')
      .order('order_index', { ascending: true });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%,category.ilike.%${q}%`);
    }

    const { data: dbArticles, error } = await query;

    if (!error && dbArticles && dbArticles.length > 0) {
      articles = dbArticles;
      dbSuccess = true;
    }
  } catch (dbErr) {
    console.warn('Admin fetch articles fallback to local JSON:', dbErr.message);
  }

  // Fallback to local articles.json
  if (!dbSuccess && Array.isArray(localArticles)) {
    let filtered = [...localArticles];

    if (category && category !== 'All') {
      filtered = filtered.filter(a => a.category === category);
    }

    if (q) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }

    articles = filtered.map((a, i) => ({
      id: a.slug,
      order_index: a.order_index ?? (i + 1),
      slug: a.slug,
      title: a.title,
      category: a.category,
      level: a.level,
      read_time: a.read_time,
      is_free: a.is_free,
      image_url: a.image_url,
      excerpt: a.excerpt,
      content: a.content,
      vocabulary: a.vocabulary || [],
      exercises: a.exercises || [],
      source: a.source,
      views_count: 0,
      created_at: new Date().toISOString()
    }));
  }

  return NextResponse.json({
    articles: articles || [],
    total: articles?.length || 0,
    freeCount: (articles || []).filter(a => a.is_free).length,
    premiumCount: (articles || []).filter(a => !a.is_free).length
  });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { title, slug, category, level, read_time, is_free, image_url, excerpt, content, vocabulary, exercises, order_index } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Sarlavha va Kontent majburiy' }, { status: 400 });
    }

    const finalSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();

    const admin = createAdminClient();

    const payload = {
      title,
      slug: finalSlug,
      category: category || 'General',
      level: level || 'B2 (IELTS 6.5+)',
      read_time: read_time || '5 min read',
      is_free: !!is_free,
      image_url: image_url || null,
      excerpt: excerpt || content.slice(0, 180),
      content,
      vocabulary: Array.isArray(vocabulary) ? vocabulary : [],
      exercises: Array.isArray(exercises) ? exercises : [],
      order_index: typeof order_index === 'number' ? order_index : 999,
      updated_at: new Date().toISOString()
    };

    const { data: inserted, error } = await admin
      .from('articles')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: `"${finalSlug}" slug allaqachon mavjud` }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article: inserted }, { status: 201 });
  } catch (err) {
    console.error('Error creating article:', err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { id, title, slug, category, level, read_time, is_free, image_url, excerpt, content, vocabulary, exercises, order_index } = body;

    if (!id) {
      return NextResponse.json({ error: 'Article ID talab qilinadi' }, { status: 400 });
    }

    const admin = createAdminClient();

    const payload = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) payload.title = title;
    if (slug !== undefined) payload.slug = slug;
    if (category !== undefined) payload.category = category;
    if (level !== undefined) payload.level = level;
    if (read_time !== undefined) payload.read_time = read_time;
    if (is_free !== undefined) payload.is_free = is_free;
    if (image_url !== undefined) payload.image_url = image_url;
    if (excerpt !== undefined) payload.excerpt = excerpt;
    if (content !== undefined) payload.content = content;
    if (vocabulary !== undefined) payload.vocabulary = Array.isArray(vocabulary) ? vocabulary : [];
    if (exercises !== undefined) payload.exercises = Array.isArray(exercises) ? exercises : [];
    if (order_index !== undefined) payload.order_index = order_index;

    const { data: updated, error } = await admin
      .from('articles')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article: updated });
  } catch (err) {
    console.error('Error updating article:', err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Article ID talab qilinadi' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Maqola o\'chirildi' });
  } catch (err) {
    console.error('Error deleting article:', err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

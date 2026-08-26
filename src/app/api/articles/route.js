import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import localArticles from '@/data/articles.json';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const offset = (page - 1) * limit;

    // Check user & premium status
    let isPremium = false;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const isAdmin = user?.user_metadata?.role === 'admin';
      isPremium = isAdmin || !!user?.user_metadata?.is_premium || !!user?.isPremium;
    } catch (_) {}

    let articles = [];
    let total = 0;
    let categories = { All: 0 };

    // Try Supabase first
    let dbSuccess = false;
    try {
      const admin = createAdminClient();
      let query = admin
        .from('articles')
        .select('id, order_index, slug, title, category, level, read_time, is_free, image_url, excerpt, views_count, created_at', { count: 'exact' })
        .order('order_index', { ascending: true });

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      if (q) {
        query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,category.ilike.%${q}%`);
      }

      const { data: dbArticles, count, error } = await query.range(offset, offset + limit - 1);

      if (!error && dbArticles && dbArticles.length > 0) {
        articles = dbArticles;
        total = count || dbArticles.length;
        dbSuccess = true;

        const { data: allCategories } = await admin.from('articles').select('category');
        categories = { All: allCategories?.length || 0 };
        (allCategories || []).forEach(item => {
          categories[item.category] = (categories[item.category] || 0) + 1;
        });
      }
    } catch (dbErr) {
      console.warn('Supabase articles fetch fallback to local JSON:', dbErr.message);
    }

    // Fallback to local articles.json
    if (!dbSuccess && Array.isArray(localArticles)) {
      let filtered = [...localArticles];

      // Calculate all category counts
      categories = { All: filtered.length };
      filtered.forEach(a => {
        categories[a.category] = (categories[a.category] || 0) + 1;
      });

      if (category && category !== 'All') {
        filtered = filtered.filter(a => a.category === category);
      }

      if (q) {
        filtered = filtered.filter(a =>
          a.title.toLowerCase().includes(q) ||
          (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
          a.category.toLowerCase().includes(q)
        );
      }

      total = filtered.length;
      articles = filtered.slice(offset, offset + limit).map(a => ({
        id: a.slug,
        order_index: a.order_index,
        slug: a.slug,
        title: a.title,
        category: a.category,
        level: a.level,
        read_time: a.read_time,
        is_free: a.is_free,
        image_url: a.image_url,
        excerpt: a.excerpt,
        views_count: 0,
        created_at: new Date().toISOString()
      }));
    }

    return NextResponse.json({
      articles: (articles || []).map(a => ({
        ...a,
        locked: !isPremium && !a.is_free
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categories,
      isPremium
    });
  } catch (err) {
    console.error('Error fetching articles:', err);
    return NextResponse.json({ error: 'Failed to load articles' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import localArticles from '@/data/articles.json';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug talab qilinadi' }, { status: 400 });
    }

    // Check user & premium status
    let isPremium = false;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const isAdmin = user?.user_metadata?.role === 'admin';
      isPremium = isAdmin || !!user?.user_metadata?.is_premium || !!user?.isPremium;
    } catch (_) {}

    let article = null;

    // Try Supabase first
    try {
      const admin = createAdminClient();
      const { data: dbArticle, error } = await admin
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && dbArticle) {
        article = dbArticle;
        // Increment views count
        try {
          await admin
            .from('articles')
            .update({ views_count: (article.views_count || 0) + 1 })
            .eq('id', article.id);
        } catch (_) {}
      }
    } catch (dbErr) {
      console.warn('Supabase article detail fallback:', dbErr.message);
    }

    // Fallback to local JSON
    if (!article && Array.isArray(localArticles)) {
      article = localArticles.find(a => a.slug === slug || a.slug === decodeURIComponent(slug));
    }

    if (!article) {
      return NextResponse.json({ error: 'Maqola topilmadi' }, { status: 404 });
    }

    const isLocked = !isPremium && !article.is_free;

    if (isLocked) {
      // Locked Preview (First paragraph & limited vocabulary preview)
      return NextResponse.json({
        article: {
          id: article.id || article.slug,
          order_index: article.order_index,
          slug: article.slug,
          title: article.title,
          category: article.category,
          level: article.level,
          read_time: article.read_time,
          is_free: false,
          image_url: article.image_url,
          excerpt: article.excerpt,
          content: article.content ? article.content.slice(0, 450) + '\n\n...' : '',
          vocabulary: (article.vocabulary || []).slice(0, 3),
          exercises: [],
          locked: true
        },
        isPremium: false
      });
    }

    return NextResponse.json({
      article: {
        ...article,
        locked: false
      },
      isPremium
    });
  } catch (err) {
    console.error('Error fetching article detail:', err);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();

    let user = null;
    try {
      const auth = await supabase.auth.getUser();
      user = auth?.data?.user || null;
    } catch {
      // ignore
    }

    const { searchParams } = new URL(request.url);
    const personNameParam = searchParams.get('name');

    let query = admin
      .from('full_mock_submissions')
      .select('*, full_mock_tests(title)')
      .order('created_at', { ascending: false });

    // Agar nom ko'rsatilgan bo'lsa yoki auth user bo'lsa
    const userFullName = user?.user_metadata?.full_name || '';
    const userRole = user?.user_metadata?.role || '';

    // Admin bo'lmasa va ism bo'lsa, o'sha ism bo'yicha filter qilamiz
    if (personNameParam) {
      query = query.ilike('person_name', `%${personNameParam.trim()}%`);
    } else if (userRole !== 'admin' && userFullName) {
      query = query.ilike('person_name', `%${userFullName.trim()}%`);
    }

    const { data: subs, error } = await query;

    if (error) {
      console.error('[API /api/fullmock/my-submissions] Error:', error);
      return NextResponse.json({ submissions: [] });
    }

    // Format results to match FullMockResultView data format
    const formatted = (subs || []).map((s) => {
      const testTitle = s.full_mock_tests?.title || 'IELTS Full Mock Test';
      const srv = s.server_results || {};

      return {
        id: s.id,
        submission_id: s.id,
        title: testTitle,
        person_name: s.person_name,
        created_at: s.created_at,
        time_spent_seconds: s.time_spent_seconds,
        results: {
          listening: {
            score: s.listening_correct || srv.listening?.score || 0,
            total: srv.listening?.total || 40,
            band: s.listening_band !== null && s.listening_band !== undefined ? Number(s.listening_band).toFixed(1) : (srv.listening?.band || '0.0'),
            results: srv.listening?.results || {},
          },
          reading: {
            score: s.reading_correct || srv.reading?.score || 0,
            total: srv.reading?.total || 40,
            band: s.reading_band !== null && s.reading_band !== undefined ? Number(s.reading_band).toFixed(1) : (srv.reading?.band || '0.0'),
            results: srv.reading?.results || {},
          },
          writing: {
            tasksEvaluation: s.writing_results || {},
            band: s.writing_band !== null && s.writing_band !== undefined ? Number(s.writing_band).toFixed(1) : '0.0',
            tasks: s.writing_answers || [],
          },
          overall_band: s.overall_band !== null && s.overall_band !== undefined ? Number(s.overall_band).toFixed(1) : '0.0',
        },
      };
    });

    return NextResponse.json({ submissions: formatted });
  } catch (err) {
    console.error('[API /api/fullmock/my-submissions] Unexpected error:', err);
    return NextResponse.json({ submissions: [] });
  }
}

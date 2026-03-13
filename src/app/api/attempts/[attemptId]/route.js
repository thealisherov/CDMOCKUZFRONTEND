/**
 * GET /api/attempts/[attemptId] — Get a single attempt with full data (for review mode)
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request, { params }) {
  try {
    const { attemptId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('TestAttempts')
      .select('*')
      .eq('id', attemptId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[API /api/attempts/[id]] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

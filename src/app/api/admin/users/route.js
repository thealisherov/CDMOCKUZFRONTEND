import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // fallback but anon will fail on admin endpoints
);

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing auth header' }, { status: 401 });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || user?.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch ALL users (Supabase defaults to 50 per page, so we must paginate)
    let allUsers = [];
    let page = 1;
    const perPage = 1000;
    
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      allUsers = allUsers.concat(data.users);
      // If we got fewer than perPage, we've reached the last page
      if (data.users.length < perPage) break;
      page++;
    }
    
    return NextResponse.json(allUsers);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

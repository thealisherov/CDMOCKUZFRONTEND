import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

export async function PATCH(req, { params }) {
  try {
    const userId = params.userId;
    const body = await req.json();
    const { role, plan_months, premium_until } = body;

    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing auth header' }, { status: 401 });
    
    // Using current user's token directly to verify admin rights
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || user?.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare metadata
    let user_metadata = {};
    if (role !== undefined) user_metadata.role = role;
    if (premium_until !== undefined) {
      user_metadata.premium_until = premium_until;
    } else if (plan_months !== undefined) {
      if (plan_months > 0) {
        // add months
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + plan_months);
        user_metadata.premium_until = expiryDate.toISOString();
      } else {
        // remove premium
        user_metadata.premium_until = null;
      }
    }

    // Update user in auth.users
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata }
    );
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data.user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

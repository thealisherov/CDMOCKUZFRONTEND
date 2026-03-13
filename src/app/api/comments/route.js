import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const MOCK_COMMENTS = [
  { id: 'm1', name: "Sardor Rakhimov", text: "This platform changed my prep entirely. The Reading interface is exactly like the real computer-delivered test!", rating: 5, band: 8.0, created_at: "2025-12-14T00:00:00Z" },
  { id: 'm2', name: "Malika Ismoilova", text: "Listening practice with different accents really helped me. Highly recommended for serious candidates.", rating: 5, band: 7.5, created_at: "2025-12-10T00:00:00Z" },
  { id: 'm3', name: "Javohir Tursunov", text: "The Writing feedback was brutally honest but improved my score from 6.0 to 7.0 in just 3 weeks.", rating: 4, band: 7.0, created_at: "2025-11-28T00:00:00Z" },
  { id: 'm4', name: "Alisher Umarov", text: "Perfect simulation. The timer, the layout, everything feels professional and close to the real exam.", rating: 5, band: 8.5, created_at: "2025-11-02T00:00:00Z" },
  { id: 'm5', name: "Dilnoza Yusupova", text: "I tried many platforms but Mega IELTS stands out with its clean UI and realistic test environment.", rating: 5, band: 7.0, created_at: "2025-10-20T00:00:00Z" },
  { id: 'm6', name: "Bobur Nazarov", text: "The highlight and notes feature during reading is a game-changer. It's exactly what you get in the real exam.", rating: 5, band: 8.0, created_at: "2025-10-15T00:00:00Z" }
];

const COLORS = [
  "oklch(0.55 0.22 270)", "#e22d2d", "oklch(0.52 0.2 170)", 
  "oklch(0.6 0.2 60)", "oklch(0.55 0.22 310)", "oklch(0.52 0.18 230)"
];

function enhanceComment(c, index) {
  const nameParts = (c.name || 'User').split(' ');
  const avatar = nameParts.length > 1 
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : nameParts[0].substring(0, 2).toUpperCase();
  
  return {
    ...c,
    avatar,
    color: COLORS[index % COLORS.length],
    date: new Date(c.created_at).toISOString().split('T')[0]
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Fetch real comments sorted by newest
    const { data: realComments, error } = await supabase
      .from('Comments')
      .select('*')
      .order('created_at', { ascending: false });

    // If table doesn't exist, Supabase returns an error with code '42P01'
    let commentsToUse = [];
    if (error && error.code === '42P01') {
      // Table doesn't exist yet, just use mocks
      commentsToUse = [];
    } else if (error) {
      console.error('Error fetching comments:', error);
      commentsToUse = [];
    } else {
      commentsToUse = realComments || [];
    }

    let finalComments = [...commentsToUse];
    
    // Mix with mocks if real comments < 5
    if (finalComments.length < 5) {
      const needed = 5 - finalComments.length;
      finalComments = [...finalComments, ...MOCK_COMMENTS.slice(0, needed)];
    }

    // Enhance with avatar and colors
    finalComments = finalComments.map((c, i) => enhanceComment(c, i));

    return NextResponse.json(finalComments);
  } catch (err) {
    console.error('Comments API Error:', err);
    return NextResponse.json(MOCK_COMMENTS.map((c, i) => enhanceComment(c, i)));
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, text, rating, band } = body;
    
    if (!name || !text || !rating) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Optional: get user ID if logged in
    const { data: { user } } = await supabase.auth.getUser();

    const newComment = {
      name,
      text,
      rating,
      band: band || null,
      user_id: user?.id || null
    };

    const { data, error } = await supabase
      .from('Comments')
      .insert([newComment])
      .select()
      .single();

    if (error) {
      console.error('Error inserting comment:', error);
      // Even if it fails (e.g. table not created), return success simulation for local UX?
      if (error.code === '42P01') {
        return NextResponse.json({ error: 'Comments table missing' }, { status: 501 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(enhanceComment(data, Math.floor(Math.random() * COLORS.length)), { status: 201 });
  } catch (err) {
    console.error('Comment POST Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

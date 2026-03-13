import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'fake'
);

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing auth' }, { status: 401 });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('avatar');
    
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Always use same filename so upsert overwrites properly
    const fileName = `${user.id}/avatar`;

    // Delete old file first (any format)
    const { data: existingFiles } = await supabaseAdmin.storage
      .from('avatars')
      .list(user.id);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
      await supabaseAdmin.storage.from('avatars').remove(filesToDelete);
    }

    // Upload new file with unique name to bust cache
    const fileExt = file.name.split('.').pop();
    const uniqueName = `${user.id}/avatar_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(uniqueName, file, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(uniqueName);

    const avatarUrl = urlData.publicUrl;

    // Update user metadata
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { avatar_url: avatarUrl }
    });

    return NextResponse.json({ avatar_url: avatarUrl });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

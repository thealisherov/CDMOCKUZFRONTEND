import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Admin client (service_role) — faqat serverda ishlatiladi, clientga hech qachon chiqmaydi
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { otp_code } = await req.json();

    if (!otp_code || typeof otp_code !== 'string' || otp_code.trim().length !== 6) {
      return NextResponse.json({ error: "Noto'g'ri kod formati." }, { status: 400 });
    }

    // 1) Sessiyani topamiz (faqat server, service_role bilan — clientda bu jadval umuman ko'rinmaydi)
    const { data: session, error: fetchError } = await supabaseAdmin
      .from('telegram_auth_sessions')
      .select('*')
      .eq('otp_code', otp_code.trim())
      .maybeSingle();

    if (fetchError) {
      console.error('[verify-otp] fetch error:', fetchError);
      return NextResponse.json({ error: 'Kodni tekshirishda xatolik.' }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ error: "Noto'g'ri yoki eskirgan kod." }, { status: 400 });
    }

    // 2) Muddati tugaganligini tekshiramiz (10 daqiqa)
    const createdAt = new Date(session.created_at);
    const diffMinutes = (Date.now() - createdAt.getTime()) / 1000 / 60;

    if (diffMinutes > 10) {
      await supabaseAdmin.from('telegram_auth_sessions').delete().eq('id', session.id);
      return NextResponse.json({ error: "Kodning muddati tugagan. Botdan yangi kod oling." }, { status: 400 });
    }

    // 3) Shu user uchun ichki texnik email'ni topamiz (faqat serverda ishlatiladi)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(session.user_id);

    if (userError || !userData?.user) {
      console.error('[verify-otp] user lookup error:', userError);
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi.' }, { status: 404 });
    }

    const internalEmail = userData.user.email;

    // 4) Parolsiz sessiya tokeni generatsiya qilamiz: magiclink generatsiya qilib,
    //    keyin uni serverning o'zida darhol verify qilamiz. Natijada haqiqiy
    //    access_token / refresh_token olamiz — bularni client hech qachon
    //    email/parol ko'rmasdan to'g'ridan-to'g'ri sessiya o'rnatish uchun ishlatadi.
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: internalEmail
    });

    if (linkError || !linkData) {
      console.error('[verify-otp] generateLink error:', linkError);
      return NextResponse.json({ error: 'Sessiya yaratishda xatolik.' }, { status: 500 });
    }

    const tokenHash = linkData.properties?.hashed_token;

    if (!tokenHash) {
      console.error('[verify-otp] missing hashed_token in generateLink response');
      return NextResponse.json({ error: 'Sessiya yaratishda xatolik.' }, { status: 500 });
    }

    // Anon client bilan token_hash'ni verify qilamiz — bu chinakam access/refresh token beradi
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: verifyData, error: verifyError } = await supabaseAnon.auth.verifyOtp({
      type: 'magiclink',
      token_hash: tokenHash
    });

    if (verifyError || !verifyData?.session) {
      console.error('[verify-otp] verifyOtp error:', verifyError);
      return NextResponse.json({ error: 'Avtorizatsiya muvaffaqiyatsiz.' }, { status: 500 });
    }

    // 5) Sessiya ishlatildi — darhol o'chiramiz (bir martalik kod)
    await supabaseAdmin.from('telegram_auth_sessions').delete().eq('id', session.id);

    return NextResponse.json({
      access_token: verifyData.session.access_token,
      refresh_token: verifyData.session.refresh_token
    });
  } catch (error) {
    console.error('[verify-otp] handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

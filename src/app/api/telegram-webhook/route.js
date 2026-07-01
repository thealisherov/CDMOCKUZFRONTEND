import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Admin client initialized with Service Role Key to manage users and bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Telegram Auth webhook is ready'
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('[Telegram Webhook] Received update:', JSON.stringify(body));

    const message = body.message;
    if (!message) {
      return NextResponse.json({ status: 'ignored' });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // STEP 1: Handle "/start" command
    if (text && text.startsWith('/start')) {
      await sendMessage(
        chatId,
        "👋 Assalomu alaykum! Mega IELTS tizimiga kirish uchun iltimos telefon raqamingizni yuboring (pastdagi tugmani bosing):",
        {
          keyboard: [[{ text: "📞 Telefon raqamni ulashish", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      );
      return NextResponse.json({ status: 'ok' });
    }

    // STEP 2: Handle user sharing their contact number
    if (message.contact) {
      // SECURITY CHECK: Ensure the contact belongs to the sender
      if (message.contact.user_id !== message.from.id) {
        await sendMessage(chatId, "⚠️ Xavfsizlik yuzasidan faqat o'zingizning telefon raqamingizni yuborishingiz mumkin.");
        return NextResponse.json({ status: 'contact_mismatch' });
      }

      // telegram_id — bu yagona, doimiy va o'zgarmas identifikator.
      // Bu Auth identifikatsiyasining ASOSI bo'ladi. Telefon raqam EMAS.
      const telegramId = message.from.id.toString();
      const phone = message.contact.phone_number.replace('+', '').trim();
      const firstName = message.contact.first_name || '';
      const lastName = message.contact.last_name || '';
      const username = message.from.username || '';

      // Supabase Auth (auth.users) jadvali identifikator sifatida email yoki
      // phone talab qiladi — bu GoTrue arxitekturasining texnik cheklovi.
      // Shuning uchun ICHKI, foydalanuvchiga HECH QACHON ko'rsatilmaydigan/
      // ishlatilmaydigan texnik email yasaymiz. U telefon raqamdan EMAS,
      // balki Telegram ID'dan hosil qilinadi — shuning uchun bu "telefon
      // bilan login qilish" emas, balki faqat ichki texnik identifikator.
      const internalEmail = `tg_${telegramId}@auth.internal`;

      let authUser = null;

      // Avval shu telegram_id uchun mavjud user borligini tekshiramiz
      const { data: existingByQuery } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (existingByQuery?.id) {
        // Foydalanuvchi mavjud — metadata'sini yangilaymiz
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingByQuery.id,
          {
            user_metadata: {
              full_name: `${firstName} ${lastName}`.trim() || username || 'Telegram User',
              first_name: firstName,
              last_name: lastName,
              username: username,
              phone: `+${phone}`,
              telegram_id: telegramId,
              role: 'student'
            }
          }
        );

        if (updateError) {
          console.error('[Telegram Webhook] Failed to update user:', updateError);
          await sendMessage(chatId, "❌ Tizimda xatolik yuz berdi. Iltimos, keyinroq qayta urining.");
          // ⚠️ MUHIM: Telegram webhook'ga DOIM 200 qaytariladi.
          // 500 qaytarilsa Telegram so'rovni qayta-qayta yuboradi — bu LOOP hosil qiladi!
          return NextResponse.json({ error: updateError.message, handled: true });
        }

        // updateUserById da data.user ba'zan null keladi — shuning uchun
        // existingByQuery.id'dan to'g'ridan-to'g'ri foydalanamiz.
        authUser = updateData?.user ?? { id: existingByQuery.id };
      } else {
        // Yangi foydalanuvchi yaratamiz. Parol UMUMAN ishlatilmaydi —
        // login keyinchalik faqat OTP orqali, parolsiz amalga oshiriladi.
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: internalEmail,
          email_confirm: true,
          user_metadata: {
            full_name: `${firstName} ${lastName}`.trim() || username || 'Telegram User',
            first_name: firstName,
            last_name: lastName,
            username: username,
            phone: `+${phone}`,
            telegram_id: telegramId,
            role: 'student'
          }
        });

        if (createError) {
          console.error('[Telegram Webhook] createUser failed:', createError.code, createError.message);
          await sendMessage(chatId, "❌ Avtorizatsiya xatosi. Iltimos, keyinroq qayta urining.");
          // ⚠️ MUHIM: 500 emas, 200 OK qaytariladi — Telegram retry loop'ini oldini olish uchun
          return NextResponse.json({ error: createError.message, handled: true });
        }

        authUser = createData.user;
      }

      // Generate a 6-digit random OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Shu telegram_id uchun eski sessiyalarni tozalaymiz
      await supabaseAdmin.from('telegram_auth_sessions').delete().eq('telegram_id', telegramId);

      // Insert new session. Endi bu yerda EMAIL ham, PAROL ham saqlanmaydi —
      // faqat ichki user_id va telegram_id. Email/parol faqat
      // verify-otp API route'i ichida, serverda, vaqtinchalik generatsiya qilinadi.
      const { error: sessionInsertError } = await supabaseAdmin
        .from('telegram_auth_sessions')
        .insert({
          otp_code: otpCode,
          chat_id: chatId,
          telegram_id: telegramId,
          user_id: authUser.id,
          status: 'authenticated',
          user_metadata: { firstName, lastName, username }
        });

      if (sessionInsertError) {
        console.error('[Telegram Webhook] Error inserting session:', sessionInsertError);
        await sendMessage(chatId, "❌ Tizimda xatolik yuz berdi. Iltimos, keyinroq qayta urining.");
        // ⚠️ MUHIM: 500 emas, 200 OK — Telegram retry loop'ini oldini olish uchun
        return NextResponse.json({ error: sessionInsertError.message, handled: true });
      }

      // Send the OTP code to the user in Telegram
      await sendMessage(
        chatId,
        `🔑 Saytga kirish uchun tasdiqlash kodingiz:\n\n👉 ${otpCode} 👈\n\nUshbu kodni saytdagi maydonga kiriting. Kod 10 daqiqa davomida faol bo'ladi.`,
        {
          remove_keyboard: true
        }
      );

      return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[Telegram Webhook] Webhook handler error:', error);
    // ⚠️ MUHIM: catch blokida ham 200 OK — Telegram 500 ko'rsa qayta yuboradi (LOOP!)
    // Lekin bu jiddiy, kutilmagan xato bo'lgani uchun 500 saqlaymiz — bu holat bo'lmasligi kerak.
    // Agar loop bo'lsa, yuqoridagi handled: true logikasi ishga kiradi.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper to make POST request to Telegram Bot API sendMessage endpoint
async function sendMessage(chatId, text, replyMarkup = null) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('[Telegram Webhook] TELEGRAM_BOT_TOKEN is not defined in environment variables');
    return;
  }

  const payload = {
    chat_id: chatId,
    text: text
  };

  if (replyMarkup) {
    payload.reply_markup = JSON.stringify(replyMarkup);
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Telegram Webhook] Telegram API returned error:', res.status, errorText);
    }
  } catch (error) {
    console.error('[Telegram Webhook] Error calling Telegram sendMessage API:', error);
  }
}

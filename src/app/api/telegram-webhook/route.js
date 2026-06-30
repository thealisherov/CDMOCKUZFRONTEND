import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

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

    // STEP 1: Handle "/start" command (no OTP query param, just start the bot)
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

      const phone = message.contact.phone_number.replace('+', '').trim();
      const firstName = message.contact.first_name || '';
      const lastName = message.contact.last_name || '';
      const username = message.from.username || '';

      // Generate a one-time random password for the user session login
      const tempPassword = crypto.randomUUID();

      let authUser = null;

      // Attempt to register a new user in Supabase Auth
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        phone: `+${phone}`,
        password: tempPassword,
        phone_confirm: true,
        user_metadata: {
          full_name: `${firstName} ${lastName}`.trim() || username || 'Telegram User',
          first_name: firstName,
          last_name: lastName,
          username: username,
          role: 'student'
        }
      });

      if (createError) {
        console.log('[Telegram Webhook] createUser failed (user might exist). Code/Message:', createError.code, createError.message);
        
        // Find existing user in Auth using listUsers pagination loop
        let page = 1;
        const perPage = 1000;
        let existingUser = null;

        while (true) {
          const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage
          });

          if (listError || !users || users.length === 0) break;

          existingUser = users.find(u => u.phone === `+${phone}`);
          if (existingUser) break;

          if (users.length < perPage) break;
          page++;
        }

        if (existingUser) {
          // Update the existing user's password to the new temporary one
          const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
              password: tempPassword,
              user_metadata: {
                ...existingUser.user_metadata,
                first_name: firstName || existingUser.user_metadata?.first_name || '',
                last_name: lastName || existingUser.user_metadata?.last_name || '',
                username: username || existingUser.user_metadata?.username || '',
                full_name: `${firstName} ${lastName}`.trim() || existingUser.user_metadata?.full_name || 'Telegram User'
              }
            }
          );

          if (updateError) {
            console.error('[Telegram Webhook] Failed to update user password:', updateError);
            await sendMessage(chatId, "❌ Tizimda xatolik yuz berdi. Iltimos, keyinroq qayta urining.");
            return NextResponse.json({ error: updateError.message }, { status: 500 });
          }

          authUser = updateData.user;
        } else {
          console.error('[Telegram Webhook] Auth user not found and couldn\'t be created:', createError);
          await sendMessage(chatId, "❌ Avtorizatsiya xatosi. Iltimos, keyinroq qayta urining.");
          return NextResponse.json({ error: createError.message }, { status: 500 });
        }
      } else {
        authUser = createData.user;
      }

      // Generate a 6-digit random OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Delete any previous sessions for this phone to prevent garbage accumulation
      await supabaseAdmin.from('telegram_auth_sessions').delete().eq('phone', `+${phone}`);

      // Insert new session with status 'authenticated'
      const { error: sessionInsertError } = await supabaseAdmin
        .from('telegram_auth_sessions')
        .insert({
          otp_code: otpCode,
          chat_id: chatId,
          status: 'authenticated',
          phone: `+${phone}`,
          temp_password: tempPassword,
          user_metadata: { firstName, lastName, username }
        });

      if (sessionInsertError) {
        console.error('[Telegram Webhook] Error inserting session:', sessionInsertError);
        await sendMessage(chatId, "❌ Tizimda xatolik yuz berdi. Iltimos, keyinroq qayta urining.");
        return NextResponse.json({ error: sessionInsertError.message }, { status: 500 });
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
    payload.reply_markup = replyMarkup;
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

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getTelegramIdFromRecord(user) {
  if (user.telegram_id) return user.telegram_id.toString().trim();
  
  const metaTgId = user.user_metadata?.telegram_id || user.raw_user_meta_data?.telegram_id;
  if (metaTgId) return metaTgId.toString().trim();

  if (user.email) {
    const match = user.email.match(/^tg_(\d+)@auth\.internal$/i);
    if (match) return match[1];
  }
  return null;
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || user?.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { message, imageUrl, buttonText, buttonUrl } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Xabar matni bo'sh bo'lishi mumkin emas." }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN muhit o'zgaruvchisi sozlanmagan!" }, { status: 500 });
    }

    const uniqueChatIds = new Set();

    // 1. Scan public.users
    const { data: publicUsers } = await supabaseAdmin
      .from('users')
      .select('telegram_id, email');

    (publicUsers || []).forEach(u => {
      const tgId = getTelegramIdFromRecord(u);
      if (tgId) uniqueChatIds.add(tgId);
    });

    // 2. Scan auth.users for any email matching tg_<ID>@auth.internal
    try {
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) break;
        (data.users || []).forEach(au => {
          const tgId = getTelegramIdFromRecord(au);
          if (tgId) uniqueChatIds.add(tgId);
        });
        if ((data.users || []).length < 1000) hasMore = false;
        else page++;
      }
    } catch (e) {
      console.error('[Admin Tg Broadcast] Error listing auth users:', e);
    }

    // 3. Scan telegram_auth_sessions
    const { data: sessions } = await supabaseAdmin
      .from('telegram_auth_sessions')
      .select('chat_id, telegram_id');

    (sessions || []).forEach(s => {
      if (s.chat_id) uniqueChatIds.add(s.chat_id.toString().trim());
      if (s.telegram_id) uniqueChatIds.add(s.telegram_id.toString().trim());
    });

    const recipientList = Array.from(uniqueChatIds);

    if (recipientList.length === 0) {
      return NextResponse.json({
        totalRecipients: 0,
        successfulCount: 0,
        failedCount: 0,
        message: "Ma'lumotlar bazasida birorta ham Telegram foydalanuvchisi topilmadi."
      });
    }

    // Build Telegram API payload helper
    let replyMarkup = null;
    if (buttonText && buttonUrl) {
      replyMarkup = {
        inline_keyboard: [
          [{ text: buttonText, url: buttonUrl }]
        ]
      };
    }

    const apiMethod = (imageUrl && imageUrl.trim()) ? 'sendPhoto' : 'sendMessage';

    let successCount = 0;
    let failCount = 0;
    const sampleErrors = [];

    // Broadcast loop with 35ms throttling delay
    for (const chatId of recipientList) {
      try {
        const payload = {
          chat_id: chatId,
          parse_mode: 'HTML'
        };

        if (apiMethod === 'sendPhoto') {
          payload.photo = imageUrl.trim();
          payload.caption = message;
        } else {
          payload.text = message;
        }

        if (replyMarkup) {
          payload.reply_markup = JSON.stringify(replyMarkup);
        }

        const res = await fetch(`https://api.telegram.org/bot${botToken}/${apiMethod}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const resData = await res.json();

        if (resData.ok) {
          successCount++;
        } else {
          failCount++;
          if (sampleErrors.length < 5) {
            sampleErrors.push(`Chat ${chatId}: ${resData.description || resData.error_code}`);
          }
        }
      } catch (err) {
        failCount++;
        if (sampleErrors.length < 5) {
          sampleErrors.push(`Chat ${chatId}: ${err.message}`);
        }
      }

      await new Promise(res => setTimeout(res, 35));
    }

    return NextResponse.json({
      success: true,
      totalRecipients: recipientList.length,
      successfulCount: successCount,
      failedCount: failCount,
      sampleErrors: sampleErrors
    });

  } catch (error) {
    console.error('[Admin Tg Broadcast] Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

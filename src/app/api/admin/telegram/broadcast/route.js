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

    const contentType = req.headers.get('content-type') || '';
    let message = '';
    let imageUrl = '';
    let buttonText = '';
    let buttonUrl = '';
    let imageFile = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      message = formData.get('message') || '';
      imageUrl = formData.get('imageUrl') || '';
      buttonText = formData.get('buttonText') || '';
      buttonUrl = formData.get('buttonUrl') || '';
      const file = formData.get('imageFile');
      if (file && typeof file === 'object' && file.size > 0) {
        imageFile = file;
      }
    } else {
      const body = await req.json();
      message = body.message || '';
      imageUrl = body.imageUrl || '';
      buttonText = body.buttonText || '';
      buttonUrl = body.buttonUrl || '';
    }

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

    let replyMarkup = null;
    if (buttonText && buttonUrl) {
      replyMarkup = {
        inline_keyboard: [
          [{ text: buttonText, url: buttonUrl }]
        ]
      };
    }

    let successCount = 0;
    let failCount = 0;
    const sampleErrors = [];

    // Telegram photo upload handler
    let telegramUploadedFileId = null;
    let imageBlob = null;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBlob = new Blob([arrayBuffer], { type: imageFile.type || 'image/jpeg' });
    }

    const hasPhoto = !!(imageBlob || (imageUrl && imageUrl.trim()));

    // Broadcast loop with 35ms throttling delay
    for (let i = 0; i < recipientList.length; i++) {
      const chatId = recipientList[i];
      try {
        let res;

        if (hasPhoto) {
          if (telegramUploadedFileId) {
            // Re-use uploaded Telegram file_id for extreme speed!
            const payload = {
              chat_id: chatId,
              photo: telegramUploadedFileId,
              caption: message,
              parse_mode: 'HTML'
            };
            if (replyMarkup) payload.reply_markup = JSON.stringify(replyMarkup);

            res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          } else if (imageBlob) {
            // First user: upload the image file to Telegram
            const tgForm = new FormData();
            tgForm.append('chat_id', chatId);
            tgForm.append('caption', message);
            tgForm.append('parse_mode', 'HTML');
            tgForm.append('photo', imageBlob, imageFile.name || 'photo.jpg');
            if (replyMarkup) tgForm.append('reply_markup', JSON.stringify(replyMarkup));

            res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
              method: 'POST',
              body: tgForm
            });
          } else {
            // Send via image URL string
            const payload = {
              chat_id: chatId,
              photo: imageUrl.trim(),
              caption: message,
              parse_mode: 'HTML'
            };
            if (replyMarkup) payload.reply_markup = JSON.stringify(replyMarkup);

            res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
        } else {
          // Plain message (no photo)
          const payload = {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
          };
          if (replyMarkup) payload.reply_markup = JSON.stringify(replyMarkup);

          res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        const resData = await res.json();

        if (resData.ok) {
          successCount++;
          // Save telegram file_id if image was uploaded as File
          if (imageBlob && !telegramUploadedFileId && resData.result?.photo?.length) {
            const photoArray = resData.result.photo;
            telegramUploadedFileId = photoArray[photoArray.length - 1].file_id;
          }
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

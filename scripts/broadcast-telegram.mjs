import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../.env.local');

let env = {};
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) {
      let value = val.join('=').trim().replace(/\r/g, '');
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[key.trim()] = value;
    }
  });
} catch (err) {
  console.error("⚠️ .env.local faylini o'qishda xatolik:", err.message);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const botToken = env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

if (!supabaseUrl || !serviceKey || !botToken) {
  console.error("❌ XATOLIK: Supabase URL, Service Role Key yoki TELEGRAM_BOT_TOKEN topilmadi.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const messageText = process.argv[2];

if (!messageText) {
  console.log(`
Usage:
  node scripts/broadcast-telegram.mjs "Xabar matni" [photoUrl] [buttonText] [buttonUrl]

Misol:
  node scripts/broadcast-telegram.mjs "📢 Assalomu alaykum! Yangi IELTS mock testlar qo'shildi." "https://megaielts.uz/banner.jpg" "👉 Saytga o'tish" "https://megaielts.uz"
`);
  process.exit(0);
}

const imageUrl = process.argv[3] || null;
const buttonText = process.argv[4] || null;
const buttonUrl = process.argv[5] || null;

async function runBroadcast() {
  console.log("🔍 Telegram foydalanuvchilar ma'lumotlar bazasidan qidirilmoqda...");

  const uniqueChatIds = new Set();

  const { data: tgUsers, error: uErr } = await supabase
    .from('users')
    .select('telegram_id')
    .not('telegram_id', 'is', null);

  if (!uErr && tgUsers) {
    tgUsers.forEach(u => {
      if (u.telegram_id) uniqueChatIds.add(u.telegram_id.toString().trim());
    });
  }

  const { data: sessions, error: sErr } = await supabase
    .from('telegram_auth_sessions')
    .select('chat_id, telegram_id');

  if (!sErr && sessions) {
    sessions.forEach(s => {
      if (s.chat_id) uniqueChatIds.add(s.chat_id.toString().trim());
      if (s.telegram_id) uniqueChatIds.add(s.telegram_id.toString().trim());
    });
  }

  const recipients = Array.from(uniqueChatIds);
  console.log(`📢 Jami ${recipients.length} ta noyob Telegram foydalanuvchilari topildi.`);

  if (recipients.length === 0) {
    console.log("⚠️ Yuborish uchun foydalanuvchilar topilmadi.");
    return;
  }

  let replyMarkup = null;
  if (buttonText && buttonUrl) {
    replyMarkup = {
      inline_keyboard: [[{ text: buttonText, url: buttonUrl }]]
    };
  }

  const apiMethod = imageUrl ? 'sendPhoto' : 'sendMessage';
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < recipients.length; i++) {
    const chatId = recipients[i];
    try {
      const payload = {
        chat_id: chatId,
        parse_mode: 'HTML'
      };

      if (imageUrl) {
        payload.photo = imageUrl;
        payload.caption = messageText;
      } else {
        payload.text = messageText;
      }

      if (replyMarkup) {
        payload.reply_markup = JSON.stringify(replyMarkup);
      }

      const res = await fetch(`https://api.telegram.org/bot${botToken}/${apiMethod}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.ok) {
        successCount++;
        process.stdout.write(`\r[${i + 1}/${recipients.length}] ✅ Chat ${chatId} ga yuborildi`);
      } else {
        failCount++;
        process.stdout.write(`\r[${i + 1}/${recipients.length}] ❌ Chat ${chatId} xatolik: ${data.description}`);
      }
    } catch (err) {
      failCount++;
      process.stdout.write(`\r[${i + 1}/${recipients.length}] ❌ Chat ${chatId} tarmoq xatosi: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 35));
  }

  console.log(`\n\n🎉 BROADCAST TUGADI!`);
  console.log(`Muvaffaqiyatli: ${successCount}`);
  console.log(`Yetib bormagan: ${failCount}`);
}

runBroadcast();

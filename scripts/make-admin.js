const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setAdmin(email) {
  if (!email) {
    console.error("Iltimos, emailni kiriting: node --env-file=.env.local make-admin.js emailingiz@example.com");
    process.exit(1);
  }

  // Barcha userlarni olish
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error("Xatolik userlarni olishda:", error.message);
    process.exit(1);
  }

  // Kiritilgan emailga mos userni topish
  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`Xatolik: "${email}" emailiga ega user topilmadi!`);
    process.exit(1);
  }

  // User metadatasini o'zgartirish
  const currentMeta = user.user_metadata || {};
  currentMeta.role = 'admin';

  // O'zgarishni Supabasega saqlash
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: currentMeta
  });

  if (updateError) {
    console.error("Xatolik userni yangilashda:", updateError.message);
    process.exit(1);
  }

  console.log(`✅ Muvaffaqiyatli! "${email}" endi admin bo'ldi.`);
  console.log("Diqqat: Ilova ichida o'zgarishni ko'rish uchun profilingizdan 'Chiqish' (Logout) qilib, qayta hisobingizga kiring!");
}

setAdmin(process.argv[2]);

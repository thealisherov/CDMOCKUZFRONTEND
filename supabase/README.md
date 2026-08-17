# Supabase SQL Migrations & Database Setup

Ushbu papkada CDmockuz platformasining barcha Supabase SQL skriptlari va migratsiyalari jamlangan:

1. **`supabase_schema.sql`**: Boshlang'ich asosiy schema (Users, Tests, Results, Comments, Test attempts jadvallari va RLS siyosatlari).
2. **`supabase_centers.sql`**: O'quv markazlari tizimi (Centers, Center Tests, Students, Verification jadvallari va funksiyalari).
3. **`supabase_fullmock.sql`**: IELTS Full Mock tizimi (Full Mock tests, Full Mock attempts, sections, listening/reading/writing band scoring funksiyalari).
4. **`supabase_typing.sql`**: IELTS Typing practice tizimi (Typing texts, Typing results, Typing badges, daily limits, triggerlar).
5. **`supabase_admin_users_fast.sql`**: Admin paneldagi foydalanuvchilar ro'yxatini tezlashtirilgan RPC funksiyalari orqali olish.
6. **`supabase_performance_fix.sql`**: Indekslar, RLS optimizatsiyalari va so'rov tezligini oshirish migratsiyalari.
7. **`supabase_telegram_auth_fix.sql`**: Telegram orqali kirish (Telegram Auth) xavfsizlik va sinxronizatsiya tuzatishlari.

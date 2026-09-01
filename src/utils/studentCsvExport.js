/**
 * Studentlarni CSV formatida eksport qilish uchun yordamchi funksiya.
 * 
 * Talab qilingan ustunlar:
 * F.I.Sh, Telefon, Ota-ona, Tug'ilgan sana, Izoh
 * 
 * Diqqat: Eski foydalanuvchilarda ushbu ma'lumotlar mavjud bo'lmasa ham,
 * ustunlar to'liq saqlanadi va yetishmayotgan maydonlar bo'sh qoldiriladi.
 */

function escapeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  // Agar qiymatda vergul, qo'shtirnoq yoki yangi qator bo'lsa, uni qo'shtirnoqqa olamiz
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateStudentCsv(users = []) {
  const headers = ["F.I.Sh", "Telefon", "Ota-ona", "Tug'ilgan sana", "Izoh"];
  
  const rows = users.map((u) => {
    const meta = u.user_metadata || u.raw_user_meta_data || {};

    // F.I.Sh
    const fullName = 
      u.full_name || 
      meta.full_name || 
      meta.name || 
      `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || 
      u.email?.split('@')[0] || 
      '';

    // Telefon
    const phone = u.phone || meta.phone || '';

    // Ota-ona (eski foydalanuvchilarda bo'lmasa bo'sh '')
    const parentPhone = meta.parent_phone || meta.parents_phone || meta.parent || u.parent_phone || '';

    // Tug'ilgan sana (eski foydalanuvchilarda bo'lmasa bo'sh '')
    const birthDate = meta.birth_date || meta.birthday || meta.dob || u.birth_date || '';

    // Izoh (eski foydalanuvchilarda bo'lmasa bo'sh '')
    const note = meta.note || meta.notes || meta.izoh || meta.comment || u.note || '';

    return [
      escapeCsvCell(fullName),
      escapeCsvCell(phone),
      escapeCsvCell(parentPhone),
      escapeCsvCell(birthDate),
      escapeCsvCell(note),
    ].join(',');
  });

  // UTF-8 BOM qo'shiladi — bu Microsoft Excel va Google Sheets'da o'zbek harflari (o', g') to'g'ri chiqishi uchun shart
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

export function downloadStudentCsv(users = [], filename = 'studentlar_royxati.csv') {
  const csvContent = generateStudentCsv(users);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

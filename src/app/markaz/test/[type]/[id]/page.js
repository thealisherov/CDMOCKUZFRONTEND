/**
 * O'quv Markaz test sahifasi (server komponent).
 * Student sessiyasini tekshiradi, testni service_role bilan yuklaydi,
 * sanitize + adapter qo'llaydi va CenterTestRunner klientiga uzatadi.
 */
import { redirect } from 'next/navigation';
import { getCenterSession } from '@/lib/center-session';
import { createAdminClient } from '@/utils/supabase/admin';
import { sanitizeTestData } from '@/utils/sanitizeTestData';
import { adaptReadingData } from '@/utils/readingDataAdapter';
import { adaptListeningData } from '@/utils/listeningDataAdapter';
import { getMockVideos } from '@/lib/mock-videos';
import CenterTestRunner from './CenterTestRunner';
import FullMockRunner from './FullMockRunner';

export const dynamic = 'force-dynamic';

const VALID = ['reading', 'listening', 'writing', 'full_mock'];

export default async function CenterTestPage({ params }) {
  const { type, id } = await params;
  if (!VALID.includes(type)) redirect('/markaz/tests');

  const session = await getCenterSession('student');
  if (!session) redirect('/markaz');

  const supabase = createAdminClient();
  const { data: rows } = await supabase
    .from('Tests')
    .select('*')
    .eq('center_id', session.centerId)
    .eq('type', type)
    .order('created_at', { ascending: true });

  const testRow = rows?.[Number(id) - 1] || null;
  if (!testRow) redirect('/markaz/tests');

  const center = {
    name: session.name,
    slug: session.slug,
    telegram: session.telegram || null,
    preview: session.preview || false, // admin sinov sessiyasi
  };

  // ── FULL MOCK: 3 bo'lim + har bo'lim oldidan instruction video ──
  if (type === 'full_mock') {
    const d = testRow.data || {};
    const sec = d.sections || {};
    const sections = {
      listening: sec.listening ? adaptListeningData(sanitizeTestData(sec.listening)) : null,
      reading:   sec.reading   ? adaptReadingData(sanitizeTestData(sec.reading))     : null,
      writing:   sec.writing   || null, // writing'da javob yo'q — sanitize shart emas
    };
    return (
      <FullMockRunner
        id={id}
        title={d.title || 'IELTS Full Mock'}
        center={center}
        sections={sections}
        videos={getMockVideos(d)}
      />
    );
  }

  // ── Alohida bo'lim (listening / reading / writing) ──
  let rawData;
  if (type === 'writing') {
    rawData = testRow.data;
  } else {
    const safe = sanitizeTestData(testRow.data);
    rawData = type === 'reading' ? adaptReadingData(safe) : adaptListeningData(safe);
  }

  return <CenterTestRunner type={type} id={id} rawData={rawData} center={center} />;
}

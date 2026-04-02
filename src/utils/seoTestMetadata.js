/**
 * utils/seoTestMetadata.js
 * Helper to generate SEO metadata for test pages.
 */
import { createClient } from '@/utils/supabase/server';

export async function generateTestMetadata({ id, type, params }) {
  try {
    const supabase = await createClient();
    const numericId = Number(id);

    let testRow = null;
    if (!isNaN(numericId) && numericId > 0) {
      const { data: rows } = await supabase
        .from('Tests')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: true });
      if (rows && rows.length >= numericId) {
        testRow = rows[numericId - 1];
      }
    }

    if (!testRow) {
      const { data: row } = await supabase
        .from('Tests')
        .select('*')
        .eq('test_id', id)
        .single();
      if (row) testRow = row;
    }

    if (!testRow) {
      return { title: 'Test Topilmadi | Mega IELTS' };
    }

    const testTitle = testRow.data?.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Test ${id}`;
    const description = testRow.data?.description || `IELTS ${type} Practice Test. Prepare for your exam with authentic ${type} tests.`;

    return {
      title: `${testTitle} - IELTS ${type.charAt(0).toUpperCase() + type.slice(1)} Practice | Mega IELTS`,
      description,
      openGraph: {
        title: `${testTitle} - IELTS ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        description,
        type: 'website',
      },
      alternates: {
        canonical: `/dashboard/${type}/${id}`,
      }
    };
  } catch (err) {
    return { title: `IELTS ${type.charAt(0).toUpperCase() + type.slice(1)} Test | Mega IELTS` };
  }
}

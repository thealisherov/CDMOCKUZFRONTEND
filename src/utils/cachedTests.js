import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

/**
 * Creates a stateless Supabase client without headers/cookies
 * safe to use inside Next.js unstable_cache.
 */
function getStatelessSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Cached public listening tests metadata (revalidated every 5 minutes or on-demand via tag)
 */
export const getCachedListeningTests = unstable_cache(
  async () => {
    try {
      const supabase = getStatelessSupabase();
      const { data: rows, error } = await supabase
        .from('Tests')
        .select('id, test_id, type, data, created_at')
        .eq('type', 'listening')
        .is('center_id', null)
        .order('created_at', { ascending: true });

      if (error || !rows) return [];

      return rows.map((row, index) => {
        const d = row.data || {};
        const numericId = index + 1;
        return {
          id: numericId,
          supabaseId: row.id,
          test_id: row.test_id,
          type: row.type,
          title: d.title || `Test ${index + 1}`,
          description:
            d.testFormat === 'full_test' || (!d.testFormat && (!d.testType || d.testType === 'full_test'))
              ? '4-Section Listening · 40 Questions'
              : d.description || `${(d.testFormat || d.testType || 'Part').replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} · ${d.totalQuestions || 10} Questions`,
          duration: d.timer || 40,
          level: d.level || 'medium',
          testType: d.testFormat || d.testType || 'full_test',
          questions: d.totalQuestions || 40,
          access:
            d.testTution === 'paid' || d.access === 'paid'
              ? 'premium'
              : d.testTution || d.access || 'free',
          createdAt: row.created_at,
        };
      });
    } catch (err) {
      console.error('[getCachedListeningTests] Error:', err);
      return [];
    }
  },
  ['public-listening-tests-list'],
  { revalidate: 300, tags: ['tests-listening'] }
);

/**
 * Cached public reading tests metadata (revalidated every 5 minutes or on-demand via tag)
 */
export const getCachedReadingTests = unstable_cache(
  async () => {
    try {
      const supabase = getStatelessSupabase();
      const { data: rows, error } = await supabase
        .from('Tests')
        .select('id, test_id, type, data, created_at')
        .eq('type', 'reading')
        .is('center_id', null)
        .order('created_at', { ascending: true });

      if (error || !rows) return [];

      return rows.map((row, index) => {
        const d = row.data || {};
        const numericId = index + 1;

        let resolvedTestType = d.testFormat || d.testType;
        let questionsCount = d.totalQuestions || 40;
        let passageNum = 1;

        if (d.passages && Array.isArray(d.passages) && d.passages.length === 1) {
          passageNum = d.passages[0].passageNumber || 1;
          let actualCount = d.passages[0].questionGroups?.reduce((acc, g) => acc + (g.questions?.length || 0), 0);
          questionsCount = actualCount || d.totalQuestions || 13;
          if (!resolvedTestType || resolvedTestType === 'full_test') {
            resolvedTestType = `passage_${passageNum}`;
          }
        } else if (!resolvedTestType) {
          resolvedTestType = 'full_test';
        }

        let testDesc = d.description || '';
        if (!testDesc) {
          if (resolvedTestType === 'full_test') {
            testDesc = '3 Passages · 40 Questions';
          } else if (resolvedTestType.startsWith('passage_')) {
            testDesc = `Passage ${resolvedTestType.split('_')[1]} · ${questionsCount} Questions`;
          } else {
            testDesc = `${resolvedTestType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} · ${questionsCount} Questions`;
          }
        }

        return {
          id: numericId,
          supabaseId: row.id,
          test_id: row.test_id,
          type: row.type,
          title: d.title || `Test ${index + 1}`,
          description: testDesc,
          duration: d.timer || 60,
          level: d.level || 'medium',
          testType: resolvedTestType,
          questions: questionsCount,
          access:
            d.testTution === 'paid' || d.access === 'paid'
              ? 'premium'
              : d.testTution || d.access || 'free',
          createdAt: row.created_at,
        };
      });
    } catch (err) {
      console.error('[getCachedReadingTests] Error:', err);
      return [];
    }
  },
  ['public-reading-tests-list'],
  { revalidate: 300, tags: ['tests-reading'] }
);

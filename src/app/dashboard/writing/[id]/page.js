import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isUserPremium, isTestPremium } from '@/lib/premium-guard'
import WritingTestClient from './WritingTestClient'
import { generateTestMetadata } from '@/utils/seoTestMetadata'

async function loadTestData(supabase, testId) {
  try {
    const numericId = Number(testId)
    let testRow = null

    // Strategy 1: numeric ID → fetch single target test using SQL offset
    if (!isNaN(numericId) && numericId > 0) {
      const { data: row, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('type', 'writing')
        .is('center_id', null)
        .order('created_at', { ascending: true })
        .range(numericId - 1, numericId - 1)
        .maybeSingle()

      if (!error && row) {
        testRow = row
      }
    }

    // Strategy 2: string test_id → direct lookup
    if (!testRow) {
      const { data: row, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('test_id', testId)
        .is('center_id', null)
        .maybeSingle()

      if (!error && row) {
        testRow = row
      }
    }

    if (!testRow) return { testRow: null, rawData: null }

    return { testRow, rawData: testRow.data }
  } catch (err) {
    console.error('[WritingTestPage] Error loading test:', err)
    return { testRow: null, rawData: null }
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  return generateTestMetadata({ id: resolvedParams?.id, type: 'writing' });
}

export default async function WritingTestPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  const supabase = await createClient();

  // Run test data fetch and user authentication in parallel to eliminate waterfall
  const [testResult, userResult] = await Promise.all([
    loadTestData(supabase, id),
    supabase.auth.getUser().catch(() => ({ data: { user: null } })),
  ]);

  const { testRow, rawData } = testResult;

  if (!testRow) {
    redirect('/dashboard/writing');
  }

  // SECURITY GUARD: Check if test is Premium and user has active Premium access
  const user = userResult?.data?.user;
  if (isTestPremium(testRow) && !isUserPremium(user)) {
    redirect('/dashboard/payment');
  }

  return <WritingTestClient id={id} rawData={rawData} />
}


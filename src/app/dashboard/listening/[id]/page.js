import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { sanitizeTestData } from '@/utils/sanitizeTestData'
import { adaptListeningData } from '@/utils/listeningDataAdapter'
import { isUserPremium, isTestPremium } from '@/lib/premium-guard'
import ListeningTestClient from './ListeningTestClient'
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
        .eq('type', 'listening')
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

    // SECURITY: Strip answers before sending to client
    const safeData = sanitizeTestData(testRow.data)

    // Apply adapter to transform into internal format
    return { testRow, rawData: adaptListeningData(safeData) }
  } catch (err) {
    console.error('[ListeningTestPage] Error loading test:', err)
    return { testRow: null, rawData: null }
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  return generateTestMetadata({ id: resolvedParams?.id, type: 'listening' });
}

export default async function ListeningTestPage({ params }) {
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
    redirect('/dashboard/listening');
  }

  // SECURITY GUARD: Check if test is Premium and user has active Premium access
  const user = userResult?.data?.user;
  if (isTestPremium(testRow) && !isUserPremium(user)) {
    redirect('/dashboard/payment');
  }

  return <ListeningTestClient id={id} rawData={rawData} />
}
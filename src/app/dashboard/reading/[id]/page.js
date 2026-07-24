import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { sanitizeTestData } from '@/utils/sanitizeTestData'
import { adaptReadingData } from '@/utils/readingDataAdapter'
import { isUserPremium, isTestPremium } from '@/lib/premium-guard'
import ReadingTestClient from './ReadingTestClient'
import { generateTestMetadata } from '@/utils/seoTestMetadata'

async function loadTestData(testId) {
  try {
    const supabase = await createClient()
    const numericId = Number(testId)

    let testRow = null

    // Strategy 1: numeric ID → fetch by type + position
    if (!isNaN(numericId) && numericId > 0) {
      const { data: rows, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('type', 'reading')
        .is('center_id', null)
        .order('created_at', { ascending: true })

      if (!error && rows) {
        testRow = rows[numericId - 1] || null
      }
    }

    // Strategy 2: string test_id → direct lookup
    if (!testRow) {
      const { data: row, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('test_id', testId)
        .is('center_id', null)
        .single()

      if (!error && row) {
        testRow = row
      }
    }

    if (!testRow) {
      console.log('CRITICAL: testRow still null after both strategies. testId:', testId);
      return { testRow: null, rawData: null };
    }

    // SECURITY: Strip answers before sending to client
    const safeData = sanitizeTestData(testRow.data)

    // Apply adapter to transform into internal format
    return { testRow, rawData: adaptReadingData(safeData) }
  } catch (err) {
    console.error('[ReadingTestPage] Error loading test:', err)
    return { testRow: null, rawData: { isError: true, message: err.message, stack: err.stack } }
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  return generateTestMetadata({ id: resolvedParams?.id, type: 'reading' });
}

export default async function ReadingTestPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  const { testRow, rawData } = await loadTestData(id)

  if (!testRow) {
    redirect('/dashboard/reading');
  }

  // SECURITY GUARD: Check if test is Premium and user has active Premium access
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (isTestPremium(testRow) && !isUserPremium(user)) {
    redirect('/dashboard/payment');
  }

  return <ReadingTestClient id={id} rawData={rawData} />
}
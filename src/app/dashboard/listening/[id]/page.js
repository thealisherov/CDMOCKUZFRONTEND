import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { sanitizeTestData } from '@/utils/sanitizeTestData'
import { adaptListeningData } from '@/utils/listeningDataAdapter'
import { isUserPremium, isTestPremium } from '@/lib/premium-guard'
import ListeningTestClient from './ListeningTestClient'
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
        .eq('type', 'listening')
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
  const { testRow, rawData } = await loadTestData(id)

  if (!testRow) {
    redirect('/dashboard/listening');
  }

  // SECURITY GUARD: Check if test is Premium and user has active Premium access
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (isTestPremium(testRow) && !isUserPremium(user)) {
    redirect('/dashboard/payment');
  }

  return <ListeningTestClient id={id} rawData={rawData} />
}
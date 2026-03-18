/**
 * Writing Test Page — Server Component
 *
 * Fetches writing test data from Supabase and passes to client.
 * Writing tests have NO answers to sanitize (user writes freely),
 * so we pass the full data as-is.
 */
import { createClient } from '@/utils/supabase/server'
import WritingTestClient from './WritingTestClient'

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
        .eq('type', 'writing')
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
        .single()

      if (!error && row) {
        testRow = row
      }
    }

    if (!testRow) return null

    return testRow.data
  } catch (err) {
    console.error('[WritingTestPage] Error loading test:', err)
    return null
  }
}

export default async function WritingTestPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  const rawData = await loadTestData(id)

  return <WritingTestClient id={id} rawData={rawData} />
}

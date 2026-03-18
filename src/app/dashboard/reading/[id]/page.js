/**
 * Reading Test Page — Server Component
 *
 * Fetches SANITISED test data from Supabase,
 * then passes it to the Client Component for rendering.
 */
import { createClient } from '@/utils/supabase/server'
import { sanitizeTestData } from '@/utils/sanitizeTestData'
import { adaptReadingData } from '@/utils/readingDataAdapter'
import ReadingTestClient from './ReadingTestClient'

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

    if (!testRow) {
      console.log('CRITICAL: testRow still null after both strategies. testId:', testId);
      return null;
    }

    // SECURITY: Strip answers before sending to client
    const safeData = sanitizeTestData(testRow.data)

    // Apply adapter to transform into internal format
    return adaptReadingData(safeData)
  } catch (err) {
    console.error('[ReadingTestPage] Error loading test:', err)
    return { isError: true, message: err.message, stack: err.stack }
  }
}

export default async function ReadingTestPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  const rawData = await loadTestData(id)

  return <ReadingTestClient id={id} rawData={rawData} />
}
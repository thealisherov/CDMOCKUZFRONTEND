/**
 * Reading Review Page — Server Component
 *
 * Loads the test data (with answers for review) + attempt data,
 * then passes both to a Review Client Component.
 */
import { createClient } from '@/utils/supabase/server'
import { adaptReadingData } from '@/utils/readingDataAdapter'
import ReviewTestClient from '@/components/ReviewTestClient'

async function loadTestData(testId) {
  try {
    const supabase = await createClient()
    const numericId = Number(testId)

    let testRow = null

    // Strategy 1: numeric ID → fetch single target test using SQL offset
    if (!isNaN(numericId) && numericId > 0) {
      const { data: row, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('type', 'reading')
        .is('center_id', null)
        .order('created_at', { ascending: true })
        .range(numericId - 1, numericId - 1)
        .maybeSingle()

      if (!error && row) {
        testRow = row
      }
    }

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

    if (!testRow) return null

    // For review mode, we keep answers in the data (NOT sanitized)
    return adaptReadingData(testRow.data)
  } catch (err) {
    console.error('[ReadingReviewPage] Error loading test:', err)
    return null
  }
}

export default async function ReadingReviewPage({ params }) {
  const { id, attemptId } = await params
  const rawData = await loadTestData(id)

  return (
    <ReviewTestClient 
      testId={id} 
      attemptId={attemptId} 
      rawData={rawData} 
      moduleType="reading" 
    />
  )
}
